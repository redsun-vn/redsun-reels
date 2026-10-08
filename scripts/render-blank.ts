/**
 * pnpm render:blank [--safe-zone]
 * Render thử template `_blank` (M0.2) ra out/blank.mp4 rồi kiểm tra bằng ffprobe.
 * Dùng để xác nhận font/GSAP/nhạc local và output spec cơ bản (REQUIREMENTS §9.1) trước khi có pipeline M1.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, runFfprobe, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';
import { stageProject } from './lib/stage-project.ts';

const debug = process.argv.includes('--safe-zone');

try {
  const { dir } = stageProject({ template: '_blank', name: 'blank', musicId: 'test-pad-01', purpose: 'test' });
  const varsFile = join(dir, 'props.json');
  writeFileSync(varsFile, JSON.stringify({ product: 'sipos', debugSafeZone: debug }));

  const out = join(REPO_ROOT, 'out', debug ? 'blank-safe-zone.mp4' : 'blank.mp4');
  const r = runHyperframes(['render', dir, '--variables-file', varsFile, '--strict-variables', '-o', out, '--quality', 'draft']);
  const log = stripAnsi(r.stdout + r.stderr);
  if (r.status !== 0) {
    console.error(`Render lỗi:\n${log}`);
    process.exit(1);
  }
  const remoteFetch = log.split('\n').filter((l) => /Fetched .* from Google Fonts|cdn\.jsdelivr|HTTP404|REQUESTFAILED|Asset load failure: .*(HTTP\d{3}|net::)/.test(l));
  if (remoteFetch.length) {
    console.error(`Render vẫn tải tài nguyên từ mạng hoặc thiếu file:\n${remoteFetch.join('\n')}`);
    process.exit(1);
  }

  const probe = runFfprobe(['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate', '-of', 'json', out]);
  const streams = (JSON.parse(probe.stdout) as { streams: Array<Record<string, string | number>> }).streams;
  const video = streams.find((s) => s.codec_type === 'video');
  const audio = streams.find((s) => s.codec_type === 'audio');
  const ok = video?.codec_name === 'h264' && video.width === 1080 && video.height === 1920 && video.r_frame_rate === '30/1' && video.pix_fmt === 'yuv420p' && audio?.codec_name === 'aac';
  if (!ok) {
    console.error(`Video chưa đúng chuẩn (cần h264 1080×1920 30fps yuv420p + AAC): ${JSON.stringify(streams)}`);
    process.exit(1);
  }
  console.log(`Render xong: ${out} (h264 1080×1920 30fps, AAC ${audio?.sample_rate} Hz)`);
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
