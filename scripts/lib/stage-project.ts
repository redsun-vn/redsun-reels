/**
 * Dựng thư mục project HyperFrames tạm (out/stage/<tên>/) cho preview/render.
 * HyperFrames không đọc asset nằm ngoài thư mục project (lint `invalid_parent_traversal_in_asset_path`,
 * font trả 404), nên template tham chiếu `brand/…`, `runtime/…`, `_shared/…`, `music/…` như thể nằm trong project,
 * và bước này copy chúng vào. Font, GSAP, nhạc đều local, nên render không tải gì từ mạng.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, normalize } from 'node:path';
import { checkTrack, findTrack, missingFileHint, MusicManifestSchema, type MusicPurpose } from '../../config/music-manifest.ts';
import { REPO_ROOT, runFfmpeg } from './hyperframes-env.ts';
import { VOICE } from '../../config/voice.ts';
import { CUE_FILE, cueIssues, cueTags, injectCues, parseCues, rootDuration, type Silence } from './sfx-cues.ts';
import { injectMusicAutomation, musicAutomation, musicLevelPoints, readVoice, voiceTags, voiceTimingScript } from './voice-stage.ts';

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
  /** Video dựng riêng: thư mục composition (briefs/<tên>/dung-rieng) thay cho templates/<template>; kèm bộ dụng cụ _rieng/. */
  customDir?: string;
  /** Thư mục hình MKT gửi (briefs/<tên>/hinh), copy thành hinh/ trong stage. */
  mediaDir?: string;
  /** Thư mục cảnh AI (briefs/<tên>/ai, REQUIREMENTS §7.4), copy thành ai/ trong stage (bỏ nhật ký). */
  aiDir?: string;
  /** Thư mục clip người thật quay sẵn (briefs/<tên>/quay-san, REQUIREMENTS §7.5), copy thành quay-san/ trong stage. */
  stockDir?: string;
  /** Soát hình khi giọng đọc chưa đủ: bỏ qua câu thiếu giọng (báo lưu ý) thay vì dừng. */
  voiceDraft?: boolean;
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
  const templateDir = opts.customDir ?? join(REPO_ROOT, 'templates', opts.template);
  if (!existsSync(join(templateDir, 'index.html'))) {
    throw new Error(opts.customDir ? `Chưa có bản dựng riêng (thiếu ${templateDir}/index.html).` : `Không tìm thấy template "${opts.template}" (thiếu templates/${opts.template}/index.html).`);
  }

  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const track = findTrack(manifest, opts.musicId);
  if (!track) throw new Error(`Không có nhạc "${opts.musicId}" trong brand/music/manifest.json.`);
  const problems = checkTrack(track, opts.purpose);
  if (problems.length) throw new Error(problems.join(' '));
  const trackPath = join(REPO_ROOT, 'brand', 'music', track.file);
  if (!existsSync(trackPath)) {
    throw new Error(`Thiếu file nhạc brand/music/${track.file}.${missingFileHint(track)}`);
  }

  const dir = join(REPO_ROOT, 'out', 'stage', opts.name ?? opts.template);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  cpSync(templateDir, dir, { recursive: true });
  cpSync(join(REPO_ROOT, 'templates', opts.customDir ? '_rieng' : '_shared'), join(dir, opts.customDir ? '_rieng' : '_shared'), { recursive: true });
  // Bản dựng riêng: tiếng động tự tổng hợp (brand/sfx) nằm ở sfx/ trong stage
  if (opts.customDir) cpSync(join(REPO_ROOT, 'brand', 'sfx'), join(dir, 'sfx'), { recursive: true });
  if (opts.customDir) stageAudio(dir, opts.voiceDraft);
  if (opts.mediaDir && existsSync(opts.mediaDir)) cpSync(opts.mediaDir, join(dir, 'hinh'), { recursive: true, filter: (src) => !src.includes('/.goc') });
  if (opts.aiDir && existsSync(opts.aiDir)) cpSync(opts.aiDir, join(dir, 'ai'), { recursive: true, filter: (src) => !src.endsWith('.json') });
  if (opts.stockDir && existsSync(opts.stockDir)) cpSync(opts.stockDir, join(dir, 'quay-san'), { recursive: true, filter: (src) => !src.endsWith('.json') });
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
  // Bỏ đoạn dạo đầu (startSec): cắt lại file thay vì data-media-start, để nhạc khớp mọi template/preview như cũ
  if (extname(track.file).toLowerCase() === '.mp3' && !track.startSec) cpSync(trackPath, join(dir, musicFile));
  else {
    const seek = track.startSec ? ['-ss', String(track.startSec)] : [];
    const r = runFfmpeg(['-v', 'error', '-y', ...seek, '-i', trackPath, '-ar', '48000', '-b:a', '192k', join(dir, musicFile)]);
    if (r.status !== 0) throw new Error(`Không đổi được file nhạc "${track.file}" sang mp3: ${r.stderr}`);
  }

  return { dir, musicFile };
}

/**
 * Bản dựng riêng: tiếng động từ tieng-dong.txt và giọng đọc từ loi-doc.json (giong/) vào chỗ đánh dấu của index.html,
 * rồi một đường âm lượng nhạc nền gộp khoảng lặng trước vỡ lẽ và các đoạn có lời.
 */
function stageAudio(dir: string, voiceDraft = false): void {
  const htmlFile = join(dir, 'index.html');
  let html = readFileSync(htmlFile, 'utf8');
  const total = rootDuration(html);
  let silence: Silence | undefined;
  if (existsSync(join(dir, CUE_FILE))) {
    const parsed = parseCues(readFileSync(join(dir, CUE_FILE), 'utf8'));
    const problems = [...parsed.errors, ...cueIssues(parsed.cues, total, undefined, parsed.silence)];
    if (problems.length) throw new Error(problems.join(' '));
    html = injectCues(html, cueTags(parsed.cues, total));
    silence = parsed.silence;
    rmSync(join(dir, CUE_FILE));
  }
  const voice = readVoice(dir);
  if (voice) {
    if (voice.missing.length && !voiceDraft) throw new Error(`Câu ${voice.missing.join(', ')} chưa có giọng đọc: chạy ./reel giong <tên-video>.`);
    if (voice.missing.length) console.log(`! Bản soát hình chưa có giọng câu: ${voice.missing.join(', ')}.`);
    if (!html.includes(VOICE.marker)) throw new Error(`Có ${VOICE.file} nhưng index.html thiếu dòng đánh dấu ${VOICE.marker} (đặt sau thẻ nhạc).`);
    html = html.replace(VOICE.marker, `${voiceTimingScript(voice.vs, voice.placed)}\n  ${voiceTags(voice.placed, total)}`);
  }
  const windows = (voice?.placed ?? []).map((p) => ({ from: p.at, to: Math.min(total, p.at + p.dur) }));
  if (silence || windows.length) html = injectMusicAutomation(html, musicAutomation(musicLevelPoints({ totalSec: total, voice: windows, silence })));
  writeFileSync(htmlFile, html);
}
