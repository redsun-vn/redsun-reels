/**
 * pnpm make <slug> [--draft] [--test-music]
 * validate → build → render trong một lệnh (REQUIREMENTS v0.4 §9).
 */
import { buildVideo } from './lib/build-video.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { renderVideo } from './lib/render-video.ts';
import { formatIssues } from './lib/validate-video.ts';

const a = parseCli('make');
await runCommand(() => {
  const t0 = Date.now();
  const built = buildVideo({ dir: a.dir, name: a.slug, musicPurpose: a.musicPurpose });
  if (built.warnings.length) console.log(formatIssues(built.warnings));
  console.log(`1/2 Dựng xong: ${built.props.scenes.length} cảnh, ${built.props.totalSec} giây.`);
  const r = renderVideo(built, { briefDir: a.dir, quality: a.draft ? 'draft' : 'standard' });
  console.log(`2/2 Xuất xong: ${r.file}\nThời lượng ${r.durationSec.toFixed(1)} giây · ${r.sizeMB.toFixed(1)} MB · tổng ${Math.round((Date.now() - t0) / 1000)} giây.`);
  if (r.stills.length) console.log(`! Đoạn gần như đứng hình: ${r.stills.map(([s, e]) => `${s}–${e}s`).join(', ')}. Bản dựng riêng nên luôn có chuyển động (máy quay trôi, nhân vật thở/chớp mắt/đổi tư thế, hạt trôi); thêm hành động rồi xuất lại.`);
});
