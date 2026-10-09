/**
 * pnpm hinh <tên-video> [file…] — chép file MKT kéo vào khung chat (nếu có) vào briefs/<tên-video>/hinh/,
 * chuẩn hoá (ảnh iPhone HEIC → JPG, tên file không dấu) rồi liệt kê từng file kèm khung dọc/ngang, thời lượng clip,
 * để Claude xếp vào cảnh.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { briefDir } from './lib/brief.ts';
import { runCommand } from './lib/cli.ts';
import { existingHashes, fileHash, listMedia, MEDIA_DIR, mediaDir, prepareMedia, unsupportedMedia } from './lib/brief-media.ts';
import { ASSET_EXTENSIONS } from './lib/validate-video.ts';

const [slug, ...files] = process.argv.slice(2);
await runCommand(() => {
  if (!slug) throw new Error('Cách dùng: ./reel hinh <tên-video> [file hình/clip…]');
  const dir = briefDir(slug);
  if (!existsSync(dir)) throw new Error(`Chưa có video "${slug}". Tạo trước: ./reel new ${slug}`);
  mkdirSync(mediaDir(dir), { recursive: true });
  // Kiểm hết trước khi chép: lỗi giữa chừng không để lại thư mục dở
  for (const f of files) if (!existsSync(f) || !statSync(f).isFile()) throw new Error(`Không thấy file "${f}". Kéo lại file vào khung chat.`);
  const have = existingHashes(dir);
  for (const f of files) {
    if (resolve(dirname(f)) === resolve(mediaDir(dir))) continue; // file đã nằm sẵn trong hinh/
    const hash = fileHash(f);
    if (have.has(hash)) {
      console.log(`Đã có rồi, bỏ qua: ${basename(f)}`);
      continue;
    }
    let target = join(mediaDir(dir), basename(f));
    for (let i = 2; existsSync(target); i++) target = join(mediaDir(dir), `${i}-${basename(f)}`);
    copyFileSync(f, target);
    have.add(hash);
    console.log(`Đã chép: ${basename(f)}`);
  }
  for (const line of prepareMedia(dir)) console.log(`Đổi tên/định dạng: ${line}`);
  const media = listMedia(dir, ASSET_EXTENSIONS);
  if (!media.length) console.log(`Chưa có hình/clip trong briefs/${slug}/${MEDIA_DIR}/ → làm bản chỉ có chữ.`);
  for (const m of media) {
    const extra = m.durationSec !== undefined ? ` · ${m.durationSec.toFixed(1)}s` : '';
    const size = m.orientation === 'không rõ' ? 'không đọc được kích thước' : `${m.orientation} ${m.width}×${m.height}`;
    console.log(`${m.kind} · ${size}${extra} · ${m.path}`);
  }
  const bad = unsupportedMedia(dir, ASSET_EXTENSIONS);
  if (bad.length) console.log(`Không dùng được (cần JPG/PNG/WEBP/MP4/MOV): ${bad.join(', ')}`);
});
