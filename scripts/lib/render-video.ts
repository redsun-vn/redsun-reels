/**
 * Render một video đã build → out/<tên>.mp4, chuẩn hóa âm thanh, kiểm output spec (REQUIREMENTS v0.4 §9.1), ghi cost.json.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BuiltVideo } from './build-video.ts';
import { REPO_ROOT, runFfmpeg, runFfprobe, runHyperframes, stripAnsi } from './hyperframes-env.ts';
import { normalizeAudio, type Loudness } from './loudness.ts';
import { AI_VIDEO } from '../../config/ai-video.ts';
import { CUSTOM_DIR } from './custom-video.ts';
import { BEAT_WINDOW_SEC, beatsOfFile } from './music-beats.ts';
import { CUE_FILE, parseCues } from './sfx-cues.ts';
import { arcCheck, beatCheck, loudnessWindows, transitions } from './sound-arc.ts';
import { frameDiffs, motionPerSecond, stillRuns } from './video-liveliness.ts';
import { tenLenh } from './cli.ts';
import { docThoiGian, dongMayChay, tongMayChay, type TongThoiGian } from './thoi-gian.ts';

export interface RenderResult {
  file: string;
  durationSec: number;
  sizeMB: number;
  renderSec: number;
  loudness: Loudness;
  /** Bản dựng riêng: các đoạn [giây đầu, giây cuối) gần như đứng hình. */
  stills: Array<[number, number]>;
  /** Bản dựng riêng: kết quả đo sau khi xuất (dòng bắt đầu "!" là cần sửa). */
  notes: string[];
  /** Thời gian máy chạy brief → MP4 (khi có briefDir). */
  thoiGian?: TongThoiGian;
}

export const DURATION_TOLERANCE_SEC = 0.2;
/** Trần dung lượng (REQUIREMENTS §9.1): 50 MB cho 60 giây. */
export const maxSizeMB = (sec: number) => (50 * sec) / 60;

/**
 * Hình nhiều chi tiết (clip AI 1080p) làm file vượt trần dung lượng: nén lại luồng hình H.264 theo bitrate vừa trần,
 * giữ nguyên luồng tiếng và siêu dữ liệu (dấu nội dung AI). File đã vừa trần thì không đụng tới.
 */
export function fitSize(file: string, sec: number): void {
  if (statSync(file).size / 1024 / 1024 <= maxSizeMB(sec)) return;
  const kbps = Math.floor(((maxSizeMB(sec) * 0.92 * 8 * 1024) / sec) - 192);
  const out = `${file}.nen.mp4`;
  const r = runFfmpeg(['-y', '-loglevel', 'error', '-i', file, '-map', '0', '-map_metadata', '0', '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-maxrate', `${Math.round(kbps * 1.5)}k`, '-bufsize', `${kbps * 2}k`, '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'copy', '-movflags', '+faststart', out]);
  if (r.status !== 0 || !existsSync(out)) throw new Error(`Nén lại hình cho vừa dung lượng lỗi: ${(r.stderr || '').slice(-800)}`);
  renameSync(out, file);
}

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

  // Video có người thật do AI tạo: ghi dấu AI máy đọc được vào siêu dữ liệu (REQUIREMENTS §7.4)
  const loudness = normalizeAudio(rawFile, tmpFile, built.props.totalSec, built.aiLabel ? { comment: AI_VIDEO.metadataComment, description: built.aiLabel.label } : {});

  fitSize(tmpFile, built.props.totalSec);

  const probe = runFfprobe(['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate:format=duration:format_tags=comment', '-of', 'json', tmpFile]);
  const info = JSON.parse(probe.stdout) as { streams: Array<Record<string, string | number>>; format: { duration: string; tags?: { comment?: string } } };
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
  if (sizeMB > maxSizeMB(durationSec) + 1) problems.push(`dung lượng ${sizeMB.toFixed(1)} MB vượt mục tiêu 50 MB/60 giây`);
  if (built.aiLabel && info.format.tags?.comment !== AI_VIDEO.metadataComment) problems.push('thiếu dấu nội dung AI trong siêu dữ liệu file');
  if (problems.length) throw new Error(`Video ra chưa đúng chuẩn: ${problems.join('; ')}.`);
  renameSync(tmpFile, finalFile); // chỉ thay file cuối khi đã đạt chuẩn

  // Thời gian máy chạy brief → MP4, tính cả lệnh xuất đang chạy (process bắt đầu ở performance.timeOrigin)
  const thoiGian = opts.briefDir ? tongMayChay(docThoiGian(opts.briefDir), { lenh: tenLenh(), batDau: Math.round(performance.timeOrigin), ketThuc: Date.now() }) : undefined;
  if (opts.briefDir) {
    writeFileSync(
      join(opts.briefDir, 'cost.json'),
      JSON.stringify({ renderedAt: new Date().toISOString(), renderSec: Math.round(renderSec), music: built.script.music, durationSec, sizeMB: Math.round(sizeMB * 10) / 10, thoiGian }, null, 2) + '\n',
    );
  }
  const custom = built.script.build === 'custom';
  const diffs = custom ? frameDiffs(finalFile) : [];
  const stills = custom ? stillRuns(motionPerSecond(finalFile, diffs)) : [];
  const notes = custom ? customNotes(built, finalFile, diffs, stills, opts.briefDir) : [];
  // LUẬT SỐ 1 — 3 giây đầu: phải có biến động mạnh (dập, cắt, rung) trong giây đầu
  if (custom && !transitions(diffs).some((m) => m.start <= 1.0)) notes.unshift('✗ LUẬT SỐ 1 — 3 giây đầu: không có biến động mạnh nào trong giây đầu (dập, cắt, rung, chớp). Mở bằng hình mạnh nhất của hook rồi xuất lại.');
  if (thoiGian) notes.push(dongMayChay(thoiGian));
  return { file: finalFile, durationSec, sizeMB, renderSec, loudness, stills, notes, thoiGian };
}

/** Đứng hình, lặng trước vỡ lẽ, cắt trên phách — đo trên file đã xuất. */
function customNotes(built: BuiltVideo, file: string, diffs: Array<{ t: number; v: number }>, stills: Array<[number, number]>, briefDir?: string): string[] {
  const notes: string[] = [];
  if (stills.length) notes.push(`! Đoạn gần như đứng hình: ${stills.map(([s, e]) => `${s}–${e}s`).join(', ')}. Bản dựng riêng nên luôn có chuyển động (máy quay trôi, nhân vật thở/chớp mắt/đổi tư thế, hạt trôi); thêm hành động rồi xuất lại.`);
  const cueFile = briefDir ? join(briefDir, CUSTOM_DIR, CUE_FILE) : '';
  const silence = cueFile && existsSync(cueFile) ? parseCues(readFileSync(cueFile, 'utf8')).silence : undefined;
  if (silence) {
    const arc = arcCheck(loudnessWindows(file), silence);
    notes.push(...arc.messages.map((m) => `! ${m}`));
    if (!arc.messages.length) notes.push(`Lặng trước vỡ lẽ: đạt (lặng ${silence.from}–${silence.to}s thấp hơn ${(arc.payoffDb - arc.silenceDb).toFixed(1)} dB, tiếng to nhất ở giây ${arc.peakAt}).`);
  } else notes.push(`! Chưa khai khoảng lặng trước khoảnh khắc vỡ lẽ (dòng "lang <từ> <đến>" trong ${CUE_FILE}).`);
  const music = join(built.stageDir, 'music', 'bgm.mp3');
  if (existsSync(music)) {
    const { on, off } = beatCheck(transitions(diffs), beatsOfFile(music, 0, Math.max(BEAT_WINDOW_SEC, built.props.totalSec + 1)).beats);
    const n = on.length + off.length;
    if (n) notes.push(`${on.length * 10 >= n * 7 ? '' : '! '}Chuyển hình trên phách: ${on.length}/${n}${off.length ? ` (lệch phách: ${off.slice(0, 8).map((m) => `${m.start}–${m.end}s`).join(', ')}${off.length > 8 ? '…' : ''}; cho cú chuyển bắt đầu hoặc dừng đúng phách)` : ''}.`);
  }
  return notes;
}
