/**
 * ./reel post <slug> — soạn briefs/<slug>/post.md (caption + hashtag + credit nhạc) từ kịch bản đã duyệt.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { findTrack, MusicManifestSchema } from '../config/music-manifest.ts';
import { ScriptSchema } from '../config/script.schema.ts';
import { readBriefFile, readScriptFile } from './lib/brief.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';
import { aiLabelFor } from '../config/ai-video.ts';
import { VOICE } from '../config/voice.ts';
import { CUSTOM_DIR } from './lib/custom-video.ts';
import { stockLog } from './lib/kieu-hinh-rules.ts';
import { buildPost } from './lib/post-caption.ts';

const a = parseCli('post');
await runCommand(() => {
  const parsed = ScriptSchema.safeParse(readScriptFile(a.dir));
  if (!parsed.success) throw new Error('Kịch bản (script.json) chưa hợp lệ. Chạy "./reel validate <tên-video>" để xem lỗi.');
  const script = parsed.data;
  const products = JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'products.json'), 'utf8')) as { products: Record<string, { hashtags: string[] }> };
  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const out = join(a.dir, 'post.md');
  const kieuHinh = (readBriefFile(a.dir).frontmatter as Record<string, unknown>).kieuHinh;
  const stockCredits = kieuHinh === 'nguoi-that-quay-san' ? [...stockLog(a.dir).valid.values()] : [];
  writeFileSync(out, buildPost({ script, hashtags: products.products[script.product].hashtags, track: findTrack(manifest, script.music), aiLabel: aiLabelFor(kieuHinh === 'nguoi-that-ai', existsSync(join(a.dir, CUSTOM_DIR, VOICE.file))), stockCredits }));
  console.log(`Đã soạn nội dung đăng bài: briefs/${a.slug}/post.md`);
});
