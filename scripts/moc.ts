/**
 * pnpm moc <slug> hoi — ghi mốc "bắt đầu chờ người" vào briefs/<tên>/thoi-gian.jsonl.
 * Skill gọi ngay trước mỗi câu hỏi MKT trong luồng làm video; khoảng từ mốc này tới lệnh kế tiếp không tính vào máy chạy.
 */
import { existsSync } from 'node:fs';
import { briefDir } from './lib/brief.ts';
import { MOC_HOI, ghiThoiGian } from './lib/thoi-gian.ts';

const [slug, loai] = process.argv.slice(2);
try {
  if (!slug || loai !== 'hoi') throw new Error('Cách dùng: ./reel moc <tên-video> hoi');
  const dir = briefDir(slug);
  if (!existsSync(dir)) throw new Error(`Chưa có video "${slug}" (briefs/${slug}).`);
  const now = Date.now();
  ghiThoiGian(dir, MOC_HOI, now, now, true);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
