/**
 * pnpm test:render [--update]
 * Render test (REQUIREMENTS v0.4 §13): mỗi template × phong cách đã có preset, chụp khung lúc đã đứng yên ở cuối cảnh hook,
 * cuối cảnh giữa và cuối CTA
 * (hyperframes snapshot), rồi so với ảnh chuẩn trong tests/baseline/ bằng SSIM (ffmpeg).
 * `--update` ghi lại ảnh chuẩn: chỉ dùng khi thay đổi giao diện có chủ ý (đã xem bằng mắt).
 * Chạy trước mỗi lần nâng version HyperFrames.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildVideo } from './lib/build-video.ts';
import { REPO_ROOT, runFfmpeg, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';

const SSIM_MIN = 0.97;
const FIXTURES: Record<string, string> = { FeatureLaunch: 'ra-mat-tinh-nang', TipOfTheDay: 'huong-dan-nhieu-buoc' };
const update = process.argv.includes('--update');
const styles = readdirSync(join(REPO_ROOT, 'brand', 'styles'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

function ssim(a: string, b: string): number {
  const r = runFfmpeg(['-hide_banner', '-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-']);
  const m = /All:([\d.]+)/.exec(r.stderr);
  return m ? Number(m[1]) : 0;
}

let failed = 0;
for (const [template, fixture] of Object.entries(FIXTURES)) {
  for (const style of styles) {
    const key = `${template}-${style}`;
    const work = mkdtempSync(join(tmpdir(), 'render-test-'));
    cpSync(join(REPO_ROOT, 'tests', 'fixtures', 'briefs', fixture), work, { recursive: true });
    const script = JSON.parse(readFileSync(join(work, 'script.json'), 'utf8'));
    script.style = style;
    writeFileSync(join(work, 'script.json'), JSON.stringify(script));
    writeFileSync(join(work, 'brief.md'), readFileSync(join(work, 'brief.md'), 'utf8').replace(/^style: .*$/m, `style: ${style}`));

    try {
      const built = buildVideo({ dir: work, name: `rt-${key}`, musicPurpose: 'test', check: false });
      // Chụp lúc mọi hiệu ứng vào đã xong và chưa chuyển cảnh: 0.3 giây trước khi cảnh kết thúc
      const sc = built.props.scenes;
      const settled = (i: number) => sc[i].start + sc[i].duration - 0.3;
      const times = [settled(0), settled(Math.floor(sc.length / 2)), built.props.totalSec - 0.6].map((t) => t.toFixed(2));
      const shots = join(REPO_ROOT, 'out', 'render-test', key);
      rmSync(shots, { recursive: true, force: true });
      const r = runHyperframes(['snapshot', built.stageDir, '--at', times.join(','), '--no-end', '-o', shots]);
      if (r.status !== 0) throw new Error(stripAnsi(r.stdout + r.stderr).slice(-1500));
      const frames = readdirSync(shots).filter((f) => f.startsWith('frame-') && f.endsWith('.png')).sort();
      const baseDir = join(REPO_ROOT, 'tests', 'baseline', key);

      if (update) {
        rmSync(baseDir, { recursive: true, force: true });
        mkdirSync(baseDir, { recursive: true });
        // Lưu bản thu nhỏ 540×960 để baseline gọn trong git
        frames.forEach((f, i) => runFfmpeg(['-v', 'error', '-y', '-i', join(shots, f), '-vf', 'scale=540:960', join(baseDir, `frame-${i}.png`)]));
        console.log(`↻ ${key}: đã ghi ${frames.length} ảnh chuẩn`);
        continue;
      }
      if (!existsSync(baseDir)) throw new Error('chưa có ảnh chuẩn, chạy "pnpm test:render --update" sau khi xem bằng mắt');
      const scores = frames.map((f, i) => {
        const small = join(shots, `small-${i}.png`);
        runFfmpeg(['-v', 'error', '-y', '-i', join(shots, f), '-vf', 'scale=540:960', small]);
        return ssim(small, join(baseDir, `frame-${i}.png`));
      });
      const worst = Math.min(...scores);
      if (worst < SSIM_MIN) {
        failed++;
        console.log(`✗ ${key}: SSIM thấp nhất ${worst.toFixed(4)} < ${SSIM_MIN} (ảnh ở out/render-test/${key})`);
      } else console.log(`✓ ${key}: SSIM ${scores.map((s) => s.toFixed(4)).join(' / ')}`);
    } catch (e) {
      failed++;
      console.log(`✗ ${key}: ${(e as Error).message.split('\n').slice(0, 5).join('\n   ')}`);
    } finally {
      rmSync(work, { recursive: true, force: true });
    }
  }
}
console.log(update ? '\nĐã cập nhật ảnh chuẩn.' : failed ? `\n${failed} tổ hợp lệch ảnh chuẩn.` : '\nRender test: mọi tổ hợp khớp ảnh chuẩn.');
process.exit(failed ? 1 : 0);
