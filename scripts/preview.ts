/**
 * pnpm preview <slug> [--safe-zone] [--test-music]   — dựng video theo brief rồi mở bản xem thử
 * pnpm preview                                        — mở composition trống `_blank` (kiểm môi trường)
 * pnpm preview --stop                                 — tắt bản xem thử
 * Cổng cố định 3002. Trước khi mở bản mới, tắt bản xem thử cũ để không sinh tiến trình trùng.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { briefDir } from './lib/brief.ts';
import { buildVideo } from './lib/build-video.ts';
import { runCommand } from './lib/cli.ts';
import { REPO_ROOT, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';
import { stageProject } from './lib/stage-project.ts';

const PORT = '3002';
const STAGE_ROOT = join(REPO_ROOT, 'out', 'stage');
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));

/** Tắt các bản xem thử do dự án này mở (project nằm trong out/stage/), không đụng preview khác. */
function stopOurs(): number {
  const r = runHyperframes(['preview', '--list', '--json']);
  let sessions: Array<{ projectDir: string }> = [];
  try {
    sessions = (JSON.parse(r.stdout) as { result: { sessions: Array<{ projectDir: string }> } }).result.sessions;
  } catch {
    return 0;
  }
  const ours = sessions.filter((x) => x.projectDir.startsWith(STAGE_ROOT));
  for (const x of ours) runHyperframes(['preview', x.projectDir, '--stop']);
  return ours.length;
}

await runCommand(() => {
  if (args.includes('--stop')) {
    console.log(stopOurs() ? 'Đã tắt bản xem thử.' : 'Không có bản xem thử nào đang mở.');
    return;
  }
  // Tắt bản cũ TRƯỚC khi dựng lại, vì bước dựng xoá và tạo lại thư mục stage
  stopOurs();

  let dir: string;
  if (slug && existsSync(join(briefDir(slug), 'brief.md'))) {
    const built = buildVideo({
      dir: briefDir(slug),
      name: slug,
      musicPurpose: args.includes('--test-music') ? 'test' : 'production',
      debugSafeZone: args.includes('--safe-zone'),
    });
    dir = built.stageDir;
  } else if (!slug) {
    dir = stageProject({ template: '_blank', name: 'blank', musicId: 'test-pad-01', purpose: 'test' }).dir;
  } else {
    throw new Error(`Không tìm thấy video "${slug}" (briefs/${slug}/brief.md).`);
  }

  const r = runHyperframes(['preview', dir, '--background', '--no-open', '--port', PORT]);
  if (r.status !== 0) throw new Error(`Không mở được bản xem thử: ${stripAnsi(r.stderr || r.stdout)}`);
  console.log(`Đã mở bản xem thử: http://localhost:${PORT}`);
  console.log('Xem xong, tắt bằng: pnpm preview --stop');
});
