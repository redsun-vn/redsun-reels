/**
 * Sinh track nhạc test (pad không lời, 40 giây) bằng ffmpeg-static để preview/render thử khi chưa có nhạc thật.
 * Track này chỉ dùng thử nghiệm (allowedUse: internal-test), không dùng cho video đăng thật.
 * Chạy: pnpm gen:test-music
 */
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, runFfmpeg } from './lib/hyperframes-env.ts';

const out = join(REPO_ROOT, 'brand', 'music', 'test-pad-01.mp3');
mkdirSync(join(REPO_ROOT, 'brand', 'music'), { recursive: true });

const tones = [110, 165, 220, 277.18, 330];
const inputs = tones.flatMap((f) => ['-f', 'lavfi', '-i', `sine=frequency=${f}:duration=40`]);
const mix = `${tones.map((_, i) => `[${i}]`).join('')}amix=inputs=${tones.length}:normalize=0,volume=0.35,tremolo=f=0.5:d=0.3,afade=t=in:d=1,afade=t=out:st=38:d=2,loudnorm=I=-14:TP=-1.5`;

const r = runFfmpeg(['-v', 'error', '-y', ...inputs, '-filter_complex', mix, '-ar', '48000', '-ac', '2', '-b:a', '160k', out]);
if (r.status !== 0 || !existsSync(out)) {
  console.error(`Không tạo được nhạc test: ${r.stderr}`);
  process.exit(1);
}
console.log(`Đã tạo nhạc test: ${out}`);
