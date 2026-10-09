/**
 * ./reel music:intro [--all] — ghi `startSec` (bỏ đoạn dạo đầu nhỏ) cho các bài trong manifest chưa có giá trị này.
 * `--all` đo lại mọi bài. Dev chạy sau khi thêm nhạc; `music:add` tự đo.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MusicManifestSchema } from '../config/music-manifest.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';
import { introSkipSec } from './lib/music-intro.ts';

const path = join(REPO_ROOT, 'brand', 'music', 'manifest.json');
const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
const all = process.argv.includes('--all');
for (const t of manifest.tracks) {
  if ((t.startSec !== undefined && !all) || t.id === 'test-pad-01') continue;
  const file = join(REPO_ROOT, 'brand', 'music', t.file);
  if (!existsSync(file)) {
    console.log(`! ${t.id}: thiếu file, bỏ qua (./reel music:fetch)`);
    continue;
  }
  t.startSec = introSkipSec(file);
  console.log(`${t.id.padEnd(40)} bắt đầu ở ${t.startSec}s`);
}
writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
