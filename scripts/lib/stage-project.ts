/**
 * Dựng thư mục project HyperFrames tạm (out/stage/<tên>/) cho preview/render.
 * HyperFrames không đọc asset nằm ngoài thư mục project (lint `invalid_parent_traversal_in_asset_path`,
 * font trả 404), nên template tham chiếu `brand/…`, `runtime/…`, `_shared/…`, `music/…` như thể nằm trong project,
 * và bước này copy chúng vào. Font, GSAP, nhạc đều local, nên render không tải gì từ mạng.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, normalize } from 'node:path';
import { checkTrack, findTrack, MusicManifestSchema, type MusicPurpose } from '../../config/music-manifest.ts';
import { REPO_ROOT, runFfmpeg } from './hyperframes-env.ts';

export interface StageOptions {
  /** Tên thư mục trong templates/ (vd. `_blank`, `FeatureLaunch`). */
  template: string;
  /** Tên thư mục stage (mặc định = template). */
  name?: string;
  /** id track trong brand/music/manifest.json. */
  musicId: string;
  purpose: MusicPurpose;
  /** Hình/clip dùng trong video, đường dẫn tương đối theo repo (vd. assets/sipos/x.png). Copy giữ nguyên đường dẫn. */
  assets?: string[];
}

export interface StagedProject {
  dir: string;
  musicFile: string;
}

const SAFE_NAME = /^[A-Za-z0-9_-]+$/;

export function stageProject(opts: StageOptions): StagedProject {
  for (const n of [opts.template, opts.name ?? opts.template]) {
    if (!SAFE_NAME.test(n)) throw new Error(`Tên "${n}" không hợp lệ (chỉ chữ, số, "-", "_").`);
  }
  const templateDir = join(REPO_ROOT, 'templates', opts.template);
  if (!existsSync(join(templateDir, 'index.html'))) {
    throw new Error(`Không tìm thấy template "${opts.template}" (thiếu templates/${opts.template}/index.html).`);
  }

  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const track = findTrack(manifest, opts.musicId);
  if (!track) throw new Error(`Không có nhạc "${opts.musicId}" trong brand/music/manifest.json.`);
  const problems = checkTrack(track, opts.purpose);
  if (problems.length) throw new Error(problems.join(' '));
  const trackPath = join(REPO_ROOT, 'brand', 'music', track.file);
  if (!existsSync(trackPath)) {
    const hint = track.source === 'generated-in-repo' ? ' Chạy "pnpm gen:test-music" để tạo lại.' : '';
    throw new Error(`Thiếu file nhạc brand/music/${track.file}.${hint}`);
  }

  const dir = join(REPO_ROOT, 'out', 'stage', opts.name ?? opts.template);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  cpSync(templateDir, dir, { recursive: true });
  cpSync(join(REPO_ROOT, 'templates', '_shared'), join(dir, '_shared'), { recursive: true });
  mkdirSync(join(dir, 'brand'), { recursive: true });
  for (const part of ['brand.css', 'fonts', 'logos']) {
    cpSync(join(REPO_ROOT, 'brand', part), join(dir, 'brand', part), { recursive: true });
  }
  cpSync(join(REPO_ROOT, 'runtime'), join(dir, 'runtime'), { recursive: true });
  for (const a of new Set(opts.assets ?? [])) {
    const rel = normalize(a);
    if (isAbsolute(rel) || rel.startsWith('..')) throw new Error(`Đường dẫn hình/clip "${a}" phải nằm trong repo (vd. assets/sipos/…).`);
    const src = join(REPO_ROOT, rel);
    if (!existsSync(src)) throw new Error(`Thiếu file hình/clip: ${a}.`);
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    cpSync(src, join(dir, rel));
  }

  // Nhạc luôn nằm ở music/bgm.mp3 trong stage (template trỏ cố định tới đây)
  mkdirSync(join(dir, 'music'), { recursive: true });
  const musicFile = 'music/bgm.mp3';
  if (extname(track.file).toLowerCase() === '.mp3') cpSync(trackPath, join(dir, musicFile));
  else {
    const r = runFfmpeg(['-v', 'error', '-y', '-i', trackPath, '-ar', '48000', '-b:a', '192k', join(dir, musicFile)]);
    if (r.status !== 0) throw new Error(`Không đổi được file nhạc "${track.file}" sang mp3: ${r.stderr}`);
  }

  return { dir, musicFile };
}
