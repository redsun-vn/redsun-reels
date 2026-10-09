/**
 * pnpm music:fetch — tải nhạc bên thứ ba (Pixabay, Mixkit…) về brand/music/ từ `downloadUrl` trong manifest.
 * Các file này không nằm trong repo (repo công khai, license cấm phân phối lại track rời).
 * Kiểm SHA-256: file sai mã (nguồn đổi file) bị bỏ, báo dev chọn lại. Chạy lại nhiều lần được.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MusicManifestSchema } from '../config/music-manifest.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';

const dir = join(REPO_ROOT, 'brand', 'music');
const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')));
const sha = (buf: Buffer) => createHash('sha256').update(buf).digest('hex');

let fetched = 0;
let failed = 0;
for (const t of manifest.tracks) {
  if (!t.downloadUrl || !t.sha256 || t.blocked || t.localOnly) continue;
  const file = join(dir, t.file);
  if (existsSync(file) && sha(readFileSync(file)) === t.sha256) continue;
  try {
    const res = await fetch(t.downloadUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh) redsun-reels' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha(buf) !== t.sha256) throw new Error('file ở nguồn đã khác bản đã duyệt (sai mã sha256)');
    writeFileSync(file + '.part', buf);
    renameSync(file + '.part', file);
    fetched++;
  } catch (e) {
    rmSync(file + '.part', { force: true });
    console.log(`✗ ${t.id}: không tải được (${(e as Error).message}).`);
    failed++;
  }
}
const total = manifest.tracks.filter((t) => t.downloadUrl).length;
console.log(failed ? `\n${failed}/${total} bài nhạc không tải được. Kiểm tra mạng rồi chạy lại; vẫn lỗi thì báo dev.` : `Nhạc: đủ ${total} bài${fetched ? ` (vừa tải ${fetched})` : ''}.`);
process.exit(failed ? 1 : 0);
