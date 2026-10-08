/**
 * pnpm preview [template] [--stop] [--safe-zone]
 * Dựng project tạm rồi mở HyperFrames preview ở cổng 3002 (chạy nền, cố định cổng để không sinh tiến trình trùng).
 * M0.2: mặc định template `_blank` với nhạc test. M1 sẽ thêm `pnpm preview <slug>` theo brief.
 */
import { stageProject } from './lib/stage-project.ts';
import { runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';

const PORT = '3002';
const args = process.argv.slice(2);
const template = args.find((a) => !a.startsWith('--')) ?? '_blank';

try {
  const { dir } = stageProject({ template, musicId: 'test-pad-01', purpose: 'test' });

  if (args.includes('--stop')) {
    const r = runHyperframes(['preview', dir, '--stop']);
    console.log(r.status === 0 ? 'Đã tắt bản xem thử.' : `Không tắt được bản xem thử: ${stripAnsi(r.stderr || r.stdout)}`);
    process.exit(r.status ?? 1);
  }

  const lint = runHyperframes(['lint', dir]);
  if (lint.status !== 0) {
    console.error(`Template "${template}" còn lỗi, chưa mở xem thử được:\n${stripAnsi(lint.stdout + lint.stderr)}`);
    process.exit(1);
  }

  const previewArgs = ['preview', dir, '--background', '--no-open', '--port', PORT];
  const r = runHyperframes(previewArgs);
  if (r.status !== 0) {
    console.error(`Không mở được bản xem thử: ${stripAnsi(r.stderr || r.stdout)}`);
    process.exit(1);
  }
  const url = `http://localhost:${PORT}`;
  console.log(`Đã mở bản xem thử: ${url}`);
  if (args.includes('--safe-zone')) console.log('Bật lưới safe zone: đổi biến "Hiện safe zone" trong Studio.');
  console.log('Tắt bằng: pnpm preview --stop');
} catch (err) {
  console.error((err as Error).message);
  process.exit(1);
}
