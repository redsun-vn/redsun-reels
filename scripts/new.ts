/**
 * pnpm new <slug> — tạo thư mục brief mới từ briefs/_example (chỉ copy brief.md; Claude viết concepts.md và script.json sau).
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { briefDir } from './lib/brief.ts';
import { runCommand } from './lib/cli.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';

const slug = process.argv[2];
await runCommand(() => {
  if (!slug) throw new Error('Cách dùng: pnpm new <tên-video>, ví dụ: pnpm new 2026-10-20-sipos-chuc-mung');
  const dir = briefDir(slug);
  if (existsSync(dir)) throw new Error(`Đã có video "${slug}" (briefs/${slug}). Chọn tên khác.`);
  mkdirSync(dir, { recursive: true });
  copyFileSync(join(REPO_ROOT, 'briefs', '_example', 'brief.md'), join(dir, 'brief.md'));
  console.log(`Đã tạo briefs/${slug}/brief.md. Điền thông tin rồi nhờ Claude viết kịch bản.`);
});
