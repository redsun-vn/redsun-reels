/**
 * pnpm render <slug> [--draft] [--test-music]
 * build → render → chuẩn hóa âm thanh → kiểm output spec → out/<slug>.mp4 + cost.json.
 */
import { buildVideo } from './lib/build-video.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { renderVideo } from './lib/render-video.ts';

const a = parseCli('render');
await runCommand(() => {
  const built = buildVideo({ dir: a.dir, name: a.slug, musicPurpose: a.musicPurpose });
  console.log(`Đang xuất video "${a.slug}" (${built.props.totalSec} giây)…`);
  const r = renderVideo(built, { briefDir: a.dir, quality: a.draft ? 'draft' : 'standard' });
  console.log(`Xong: ${r.file}\nThời lượng ${r.durationSec.toFixed(1)} giây · ${r.sizeMB.toFixed(1)} MB · âm lượng ${r.loudness.integrated} LUFS · dựng mất ${Math.round(r.renderSec)} giây.`);
});
