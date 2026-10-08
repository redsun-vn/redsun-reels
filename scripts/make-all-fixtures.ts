/**
 * pnpm test:e2e [--draft] — dựng + xuất mọi brief mẫu trong tests/fixtures/briefs/ (20 loại video của 8 template + test dấu tiếng Việt)
 * bằng nhạc thử nghiệm, rồi kiểm output spec. Dùng trước khi phát hành hoặc nâng version HyperFrames.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildVideo } from './lib/build-video.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';
import { renderVideo } from './lib/render-video.ts';

const root = join(REPO_ROOT, 'tests', 'fixtures', 'briefs');
const draft = process.argv.includes('--draft');
let failed = 0;
for (const id of readdirSync(root).sort()) {
  const t0 = Date.now();
  try {
    const built = buildVideo({ dir: join(root, id), name: `e2e-${id}`, musicPurpose: 'test', writeProps: false });
    const r = renderVideo(built, { quality: draft ? 'draft' : 'standard' });
    console.log(`✓ ${id}: ${built.script.template} · ${built.script.style} · ${r.durationSec.toFixed(1)}s · ${r.loudness.integrated} LUFS · ${Math.round((Date.now() - t0) / 1000)}s`);
  } catch (e) {
    failed++;
    console.log(`✗ ${id}: ${(e as Error).message.split('\n').slice(0, 6).join('\n   ')}`);
  }
}
console.log(failed ? `\n${failed} brief mẫu lỗi.` : '\nMọi brief mẫu xuất được.');
process.exit(failed ? 1 : 0);
