/**
 * pnpm bang <slug> — bảng khung chính của video dựng riêng cho MKT duyệt bằng hình (out/snap/<slug>/bang/bang-canh.png):
 * dựng, chụp từng khung khai trong dung-rieng/bang-canh.txt, ghép thành một ảnh có số khung, giây, mô tả, tiếng, chuyển cảnh.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildVideo } from './lib/build-video.ts';
import { parseCli, runCommand } from './lib/cli.ts';
import { CUSTOM_DIR } from './lib/custom-video.ts';
import { REPO_ROOT, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';
import { BOARD_FILE, boardHtml, boardIssues, parseBoard } from './lib/storyboard-board.ts';

const a = parseCli('bang');
await runCommand(() => {
  const file = join(a.dir, CUSTOM_DIR, BOARD_FILE);
  if (!existsSync(file)) throw new Error(`Chưa có ${CUSTOM_DIR}/${BOARD_FILE}: mỗi dòng "giây | điều xảy ra | tiếng | chuyển sang khung sau" (skill dung-video).`);
  const built = buildVideo({ dir: a.dir, name: a.slug, musicPurpose: a.musicPurpose, check: false });
  if (built.script.build !== 'custom') throw new Error('Bảng khung chính chỉ dùng cho video dựng riêng.');
  const { panels, errors } = parseBoard(readFileSync(file, 'utf8'));
  const problems = [...errors, ...boardIssues(panels, built.props.totalSec)];
  if (problems.length) throw new Error(problems.join('\n'));

  const out = join(REPO_ROOT, 'out', 'snap', a.slug, 'bang');
  rmSync(out, { recursive: true, force: true });
  const shots = join(out, 'khung');
  const r = runHyperframes(['snapshot', built.stageDir, '-o', shots, '--at', panels.map((p) => p.at).join(','), '--no-end']);
  if (r.status !== 0) throw new Error(`Chụp khung hình lỗi:\n${stripAnsi(r.stdout + r.stderr).slice(-1500)}`);
  const frames = readdirSync(shots).filter((f) => /^frame-\d+-at-/.test(f)).sort();
  if (frames.length !== panels.length) throw new Error(`Chụp được ${frames.length}/${panels.length} khung.`);

  // Trang bảng là một composition tĩnh: chụp nó ra ảnh bằng chính HyperFrames (đúng font Montserrat, chữ Việt)
  const page = join(out, 'trang');
  mkdirSync(join(page, 'brand'), { recursive: true });
  cpSync(join(REPO_ROOT, 'brand', 'brand.css'), join(page, 'brand', 'brand.css'));
  cpSync(join(REPO_ROOT, 'brand', 'fonts'), join(page, 'brand', 'fonts'), { recursive: true });
  cpSync(join(REPO_ROOT, 'runtime'), join(page, 'runtime'), { recursive: true });
  cpSync(shots, join(page, 'khung'), { recursive: true });
  writeFileSync(join(page, 'index.html'), boardHtml(a.slug, panels.map((p, i) => ({ ...p, img: `khung/${frames[i]}` }))));
  const img = join(out, 'anh');
  const b = runHyperframes(['snapshot', page, '-o', img, '--at', '0.5', '--no-end']);
  if (b.status !== 0) throw new Error(`Ghép bảng lỗi:\n${stripAnsi(b.stdout + b.stderr).slice(-1500)}`);
  const shot = readdirSync(img).find((f) => /^frame-/.test(f));
  if (!shot) throw new Error('Không ra được ảnh bảng.');
  // Nằm trong thư mục bang/: hyperframes snapshot của ./reel snap dọn ảnh png ở thư mục khung hình
  const final = join(out, 'bang-canh.png');
  renameSync(join(img, shot), final);
  console.log(`Bảng khung chính (${panels.length} khung): ${relative(REPO_ROOT, final)}`);
});
