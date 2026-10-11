/**
 * pnpm validate <slug> [--test-music]
 * Kiểm brief + kịch bản + hình + nhạc. `--test-music` cho phép nhạc thử nghiệm (chỉ dùng khi dev kiểm template).
 */
import { briefDir } from './lib/brief.ts';
import { runCommand } from './lib/cli.ts';
import { formatIssues, hasErrors, validateVideo } from './lib/validate-video.ts';

const slug = process.argv.slice(2).find((a) => !a.startsWith('--'));
await runCommand(() => {
  if (!slug) throw new Error('Cách dùng: pnpm validate <tên-video>');
  const { issues } = validateVideo(briefDir(slug), { musicPurpose: process.argv.includes('--test-music') ? 'test' : 'production' });
  if (issues.length) console.log(formatIssues(issues));
  if (hasErrors(issues)) throw new Error('\nKịch bản chưa dựng được. Sửa các mục ✗ ở trên rồi chạy lại.');
  console.log(issues.length ? '\nKịch bản dựng được (còn lưu ý ! ở trên).' : 'Kịch bản hợp lệ.');
});
