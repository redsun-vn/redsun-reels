/**
 * Render một video đã build → out/<tên>.mp4, chuẩn hóa âm thanh, kiểm output spec (REQUIREMENTS v0.4 §9.1), ghi cost.json.
 */
import { existsSync, mkdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuiltVideo } from './build-video.ts';
import { REPO_ROOT, runFfprobe, runHyperframes, stripAnsi } from './hyperframes-env.ts';
import { normalizeAudio, type Loudness } from './loudness.ts';
import { motionPerSecond, stillRuns } from './video-liveliness.ts';

export interface RenderResult {
  file: string;
  durationSec: number;
  sizeMB: number;
  renderSec: number;
  loudness: Loudness;
  /** Bản dựng riêng: các đoạn [giây đầu, giây cuối) gần như đứng hình. */
  stills: Array<[number, number]>;
}

export const DURATION_TOLERANCE_SEC = 0.2;

export function renderVideo(built: BuiltVideo, opts: { briefDir?: string; quality?: 'draft' | 'standard'; out?: string } = {}): RenderResult {
  mkdirSync(join(REPO_ROOT, 'out'), { recursive: true });
  const finalFile = opts.out ?? join(REPO_ROOT, 'out', `${built.name}.mp4`);
  if (!finalFile.endsWith('.mp4')) throw new Error('File xuất phải có đuôi .mp4.');
  const rawFile = finalFile.replace(/\.mp4$/, '.raw.mp4');
  const tmpFile = finalFile.replace(/\.mp4$/, '.tmp.mp4');
  try {
    return renderInner(built, opts, finalFile, rawFile, tmpFile);
  } finally {
    rmSync(rawFile, { force: true });
    rmSync(tmpFile, { force: true });
  }
}

function renderInner(built: BuiltVideo, opts: { briefDir?: string; quality?: 'draft' | 'standard' }, finalFile: string, rawFile: string, tmpFile: string): RenderResult {

  const t0 = Date.now();
  const vars = built.varsFile ? ['--variables-file', built.varsFile, '--strict-variables'] : [];
  const r = runHyperframes(['render', built.stageDir, ...vars, '--strict', '-o', rawFile, '--quality', opts.quality ?? 'standard']);
  const renderSec = (Date.now() - t0) / 1000;
  const log = stripAnsi(r.stdout + r.stderr);
  if (r.status !== 0 || !existsSync(rawFile)) throw new Error(`Render lỗi:\n${log.slice(-3000)}`);
  const remote = log.split('\n').filter((l) => /Fetched .* from Google Fonts|cdn\.jsdelivr|HTTP404|REQUESTFAILED|Asset load failure: .*(HTTP\d{3}|net::)/.test(l));
  if (remote.length) throw new Error(`Render tải tài nguyên từ mạng hoặc thiếu file:\n${remote.join('\n')}`);

  const loudness = normalizeAudio(rawFile, tmpFile, built.props.totalSec);

  const probe = runFfprobe(['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate:format=duration', '-of', 'json', tmpFile]);
  const info = JSON.parse(probe.stdout) as { streams: Array<Record<string, string | number>>; format: { duration: string } };
  const v = info.streams.find((s) => s.codec_type === 'video');
  const a = info.streams.find((s) => s.codec_type === 'audio');
  const durationSec = Number(info.format.duration);
  const sizeMB = statSync(tmpFile).size / 1024 / 1024;

  const problems: string[] = [];
  if (!(v?.codec_name === 'h264' && v.width === 1080 && v.height === 1920 && v.pix_fmt === 'yuv420p')) problems.push('hình phải là H.264 1080×1920 yuv420p');
  if (v?.r_frame_rate !== '30/1') problems.push(`fps phải là 30 (đang ${v?.r_frame_rate})`);
  if (!(a?.codec_name === 'aac' && String(a.sample_rate) === '48000')) problems.push('phải có âm thanh AAC 48 kHz');
  if (Math.abs(durationSec - built.props.totalSec) > DURATION_TOLERANCE_SEC) problems.push(`thời lượng ${durationSec.toFixed(2)}s lệch kịch bản ${built.props.totalSec}s`);
  if (Math.abs(loudness.integrated - -14) > 1) problems.push(`độ to ${loudness.integrated} LUFS (cần −14 ±1)`);
  if (loudness.truePeak > -1) problems.push(`đỉnh âm ${loudness.truePeak} dBTP (cần ≤ −1)`);
  if (sizeMB > (50 * durationSec) / 60 + 1) problems.push(`dung lượng ${sizeMB.toFixed(1)} MB vượt mục tiêu 50 MB/60 giây`);
  if (problems.length) throw new Error(`Video ra chưa đúng chuẩn: ${problems.join('; ')}.`);
  renameSync(tmpFile, finalFile); // chỉ thay file cuối khi đã đạt chuẩn

  if (opts.briefDir) {
    writeFileSync(
      join(opts.briefDir, 'cost.json'),
      JSON.stringify({ renderedAt: new Date().toISOString(), renderSec: Math.round(renderSec), music: built.script.music, durationSec, sizeMB: Math.round(sizeMB * 10) / 10 }, null, 2) + '\n',
    );
  }
  const stills = built.script.build === 'custom' ? stillRuns(motionPerSecond(finalFile)) : [];
  return { file: finalFile, durationSec, sizeMB, renderSec, loudness, stills };
}
