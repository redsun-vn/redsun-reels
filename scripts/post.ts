/**
 * ./reel post <slug> — soạn briefs/<slug>/post.md (caption + hashtag + credit nhạc) từ kịch bản đã duyệt.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { findTrack, MusicManifestSchema } from '../config/music-manifest.ts';
import { ScriptSchema } from '../config/script.schema.ts';
import { readScriptFile } from './lib/brief.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';
import { buildPost } from './lib/post-caption.ts';

const a = parseCli('post');
await runCommand(() => {
  const parsed = ScriptSchema.safeParse(readScriptFile(a.dir));
  if (!parsed.success) throw new Error('Kịch bản (script.json) chưa hợp lệ. Chạy "./reel validate <tên-video>" để xem lỗi.');
  const script = parsed.data;
  const products = JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'products.json'), 'utf8')) as { products: Record<string, { hashtags: string[] }> };
  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const out = join(a.dir, 'post.md');
  writeFileSync(out, buildPost({ script, hashtags: products.products[script.product].hashtags, track: findTrack(manifest, script.music) }));
  console.log(`Đã soạn nội dung đăng bài: briefs/${a.slug}/post.md`);
});
