/**
 * pnpm build <slug> [--safe-zone] [--test-music]
 * validate → props.json → project tạm out/stage/<slug>/ → hyperframes lint + check.
 */
import { buildVideo } from './lib/build-video.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { formatIssues } from './lib/validate-video.ts';

const a = parseCli('build');
await runCommand(() => {
  const built = buildVideo({ dir: a.dir, name: a.slug, musicPurpose: a.musicPurpose, debugSafeZone: a.safeZone });
  if (built.warnings.length) console.log(formatIssues(built.warnings));
  console.log(`Dựng xong "${a.slug}": ${built.props.scenes.length} cảnh, ${built.props.totalSec} giây, phong cách ${built.script.style}.`);
});
