/**
 * pnpm lint:music — kiểm brand/music/manifest.json: đúng schema, file tồn tại, license hợp lệ (không "NC"),
 * có credit khi bắt buộc. Track thử nghiệm chỉ kiểm cho mục đích test.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkTrack, missingFileHint, MusicManifestSchema } from '../config/music-manifest.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';

let problems = 0;
try {
  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const ids = new Set<string>();
  for (const t of manifest.tracks) {
    const issues = checkTrack(t, t.allowedUse.includes('social-organic') ? 'production' : 'test');
    if (ids.has(t.id)) issues.push(`id "${t.id}" bị trùng.`);
    ids.add(t.id);
    if (!existsSync(join(REPO_ROOT, 'brand', 'music', t.file))) {
      issues.push(`thiếu file brand/music/${t.file}.${missingFileHint(t)}`);
    }
    for (const i of issues) console.log(`✗ ${t.id}: ${i}`);
    problems += issues.length;
  }
  const real = manifest.tracks.filter((t) => t.allowedUse.includes('social-organic')).length;
  console.log(problems ? `\n${problems} vấn đề trong thư viện nhạc.` : `Music lint: ${manifest.tracks.length} bài hợp lệ (${real} bài dùng cho video thật).`);
} catch (e) {
  console.log(`✗ manifest.json không hợp lệ: ${(e as Error).message}`);
  problems++;
}
process.exit(problems ? 1 : 0);
