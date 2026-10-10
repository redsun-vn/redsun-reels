/**
 * pnpm snap <slug> [--at=1.2,3.5] — dựng video rồi chụp khung hình (out/snap/<slug>/) để Claude tự soát bằng mắt:
 * mặc định mỗi 1.25 giây một khung, kèm ảnh ghép contact-sheet*.jpg. Vẫn chụp khi `hyperframes check` còn lỗi
 * (in lỗi ra) để thấy chỗ sai.
 */
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildVideo } from './lib/build-video.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { REPO_ROOT, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';
import { formatIssues } from './lib/validate-video.ts';
import { borderColor, compositionScenes, similarBackgrounds } from './lib/video-liveliness.ts';

const atArg = process.argv.find((x) => x.startsWith('--at='));
process.argv = process.argv.filter((x) => x !== atArg);
const a = parseCli('snap');
await runCommand(() => {
  const built = buildVideo({ dir: a.dir, name: a.slug, musicPurpose: a.musicPurpose, debugSafeZone: a.safeZone, check: false });
  if (built.warnings.length) console.log(formatIssues(built.warnings));
  const check = runHyperframes(['check', built.stageDir]);
  const log = stripAnsi(check.stdout + check.stderr);
  console.log(check.status === 0 ? 'Kiểm tra bố cục/tương phản: đạt.' : `Kiểm tra bố cục/tương phản CHƯA đạt:\n${log.split('\n').filter((l) => /✗|⚠ (content|text|container)|need 3:1|error\(s\)/.test(l)).join('\n')}`);

  const total = built.props.totalSec;
  const at = atArg?.slice(5) || Array.from({ length: Math.floor(total / 1.25) }, (_, i) => (0.6 + i * 1.25).toFixed(2)).join(',');
  const out = join(REPO_ROOT, 'out', 'snap', a.slug);
  // Xoá khung hình cũ, giữ bảng khung chính (./reel bang ghi cùng thư mục)
  if (existsSync(out)) for (const f of readdirSync(out)) if (!f.startsWith('bang')) rmSync(join(out, f), { recursive: true, force: true });
  const r = runHyperframes(['snapshot', built.stageDir, '-o', out, '--at', at, '--no-end']);
  if (r.status !== 0) throw new Error(`Chụp khung hình lỗi:\n${stripAnsi(r.stdout + r.stderr).slice(-1500)}`);
  const sheets = readdirSync(out).filter((f) => f.startsWith('contact-sheet'));
  console.log(`Khung hình (${at.split(',').length}): ${relative(REPO_ROOT, out)}/ · ảnh ghép: ${sheets.map((f) => relative(REPO_ROOT, join(out, f))).join(', ')}`);

  // Mỗi cảnh một nền: lấy khung gần giữa cảnh nhất, so màu viền khung giữa các cảnh
  if (built.script.build === 'custom' && !atArg) {
    const frames = readdirSync(out).flatMap((f) => { const m = /^frame-\d+-at-([\d.]+)s\.png$/.exec(f); return m ? [{ f, t: Number(m[1]) }] : []; });
    const scenes = compositionScenes(readFileSync(join(built.stageDir, 'index.html'), 'utf8')).flatMap((sc) => {
      const mid = sc.start + sc.duration / 2;
      const best = frames.filter((x) => x.t >= sc.start && x.t < sc.start + sc.duration).sort((a, b) => Math.abs(a.t - mid) - Math.abs(b.t - mid))[0];
      return best ? [{ id: sc.id, color: borderColor(join(out, best.f)) }] : [];
    });
    const same = similarBackgrounds(scenes);
    console.log(same.length
      ? `! Cảnh có nền gần giống nhau: ${same.map(([a, b, d]) => `${a} ~ ${b} (${d})`).join(', ')}. Mỗi cảnh cần một nền khác (màu, ánh sáng, không gian).`
      : `Nền ${scenes.length} cảnh khác nhau: đạt.`);
  }
  if (check.status !== 0) process.exitCode = 1;
});
