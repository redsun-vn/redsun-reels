/**
 * Hình/clip MKT kéo vào briefs/<tên-video>/hinh/: chuẩn hoá (HEIC → JPG, tên file không dấu, không cách),
 * liệt kê kèm khung dọc/ngang để Claude xếp vào cảnh, và cảnh báo hình chưa dùng hoặc hình ngang bị cắt.
 * Thư mục hinh/ không lên git (repo công khai, hình có thể có mặt khách).
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { extname, join, normalize, relative } from 'node:path';
import type { Script } from '../../config/script.schema.ts';
import { assetPaths, isVideo } from './build-props.ts';
import { probeClip } from './clip-check.ts';
import { REPO_ROOT } from './hyperframes-env.ts';

export const MEDIA_DIR = 'hinh';
/** Bản gốc HEIC sau khi đổi sang JPG: giữ lại, không xoá file của MKT. */
const ORIGINALS_DIR = '.goc';
const HEIC_EXT = ['.heic', '.heif'];
/** Rộng/cao lớn hơn mức này là hình ngang: khung hình/clip của mẫu video đều dọc nên bị cắt hai bên. */
const LANDSCAPE_RATIO = 1.1;
/** Cảnh hiện hình kín khung (cover). */
const COVER_TYPES = new Set(['asset', 'split', 'phone', 'montage']);

export interface MediaFile {
  /** Đường dẫn theo repo, dùng thẳng trong script.json (vd. briefs/x/hinh/chu-quan.jpg). */
  path: string;
  kind: 'hình' | 'clip';
  width: number;
  height: number;
  orientation: 'dọc' | 'ngang' | 'vuông' | 'không rõ';
  durationSec?: number;
}

export function mediaDir(dir: string): string {
  return join(dir, MEDIA_DIR);
}

/** Tên file an toàn cho HTML/URL: bỏ dấu, chữ thường, khoảng trắng → "-". */
export function safeFileName(name: string): string {
  const ext = extname(name).toLowerCase();
  const base = name
    .slice(0, name.length - extname(name).length)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'hinh'}${ext}`;
}

/** Tên chưa có trong thư mục. So khớp không phân biệt hoa/thường (ổ macOS mặc định như vậy); `self` là file đang đổi tên. */
function uniqueName(folder: string, name: string, self?: string): string {
  const taken = new Set((existsSync(folder) ? readdirSync(folder) : []).filter((f) => f !== self).map((f) => f.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  const ext = extname(name);
  const base = name.slice(0, name.length - ext.length);
  for (let i = 2; ; i++) if (!taken.has(`${base}-${i}${ext}`.toLowerCase())) return `${base}-${i}${ext}`;
}

function visibleFiles(folder: string): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder).filter((f) => !f.startsWith('.') && lstatSync(join(folder, f)).isFile()).sort();
}

export function fileHash(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

/** Hash các file đã có trong hinh/ và hinh/.goc/: chép lại cùng một file thì bỏ qua. */
export function existingHashes(dir: string): Set<string> {
  const folder = mediaDir(dir);
  const files = [...visibleFiles(folder).map((f) => join(folder, f)), ...visibleFiles(join(folder, ORIGINALS_DIR)).map((f) => join(folder, ORIGINALS_DIR, f))];
  return new Set(files.map(fileHash));
}

/** Đổi HEIC/HEIF sang JPG (sips có sẵn trên macOS) và đổi tên file cho an toàn. Trả về các việc đã làm. */
export function prepareMedia(dir: string): string[] {
  const folder = mediaDir(dir);
  const done: string[] = [];
  for (const f of visibleFiles(folder)) {
    if (HEIC_EXT.includes(extname(f).toLowerCase())) {
      const jpg = uniqueName(folder, safeFileName(f).replace(/\.hei[cf]$/, '.jpg'));
      const r = spawnSync('sips', ['-s', 'format', 'jpeg', join(folder, f), '--out', join(folder, jpg)], { encoding: 'utf8' });
      if (r.status !== 0 || !existsSync(join(folder, jpg))) throw new Error(`Không đổi được "${f}" sang JPG. Mở ảnh trên máy, xuất lại dạng JPG rồi bỏ vào thư mục ${MEDIA_DIR}.`);
      mkdirSync(join(folder, ORIGINALS_DIR), { recursive: true });
      renameSync(join(folder, f), join(folder, ORIGINALS_DIR, uniqueName(join(folder, ORIGINALS_DIR), f)));
      done.push(`${f} → ${jpg}`);
      continue;
    }
    const safe = safeFileName(f);
    if (safe === f) continue;
    const name = uniqueName(folder, safe, f);
    // Đổi qua tên tạm: "A.jpg" → "a.jpg" trên ổ không phân biệt hoa/thường
    const tmp = join(folder, `.doi-ten-${process.pid}`);
    renameSync(join(folder, f), tmp);
    renameSync(tmp, join(folder, name));
    done.push(`${f} → ${name}`);
  }
  return done;
}

/** JXA gọi ImageIO (có sẵn trên macOS): rộng, cao, cờ xoay EXIF của từng ảnh, mỗi dòng một file. */
const IMAGEIO_JXA = `ObjC.import('ImageIO');
function run(argv) {
  return argv.map(function (p) {
    var src = $.CGImageSourceCreateWithURL($.NSURL.fileURLWithPath(p), null);
    if (!src) return '0 0 1';
    var props = ObjC.castRefToObject($.CGImageSourceCopyPropertiesAtIndex(src, 0, null));
    var g = function (k) { var v = props.objectForKey(k); return v.isNil() ? 0 : v.intValue; };
    return [g('PixelWidth'), g('PixelHeight'), g('Orientation') || 1].join(' ');
  }).join('\\n');
}`;

/**
 * Kích thước hiển thị của ảnh: điện thoại hay lưu ảnh chụp dọc thành khung ngang + cờ xoay EXIF (Chrome xoay khi hiện).
 * ffprobe-static 4.0 và `sips -g orientation` đều không đọc cờ này → dùng ImageIO; máy không có thì dùng ffprobe.
 */
function imageSizes(files: string[]): Map<string, { width: number; height: number } | undefined> {
  const out = new Map<string, { width: number; height: number } | undefined>();
  if (!files.length) return out;
  const r = spawnSync('osascript', ['-l', 'JavaScript', '-e', IMAGEIO_JXA, ...files], { encoding: 'utf8' });
  const lines = r.status === 0 ? r.stdout.trim().split('\n') : [];
  files.forEach((file, i) => {
    const [w, h, o] = (lines[i] ?? '').split(' ').map(Number);
    if (w > 0 && h > 0) out.set(file, o >= 5 && o <= 8 ? { width: h, height: w } : { width: w, height: h });
    else {
      const info = probeClip(file);
      out.set(file, info?.width && info.height ? { width: info.width, height: info.height } : undefined);
    }
  });
  return out;
}

export function listMedia(dir: string, supported: string[]): MediaFile[] {
  const folder = mediaDir(dir);
  const out: MediaFile[] = [];
  const files = visibleFiles(folder).filter((f) => supported.includes(extname(f).toLowerCase()));
  const sizes = imageSizes(files.filter((f) => !isVideo(f)).map((f) => join(folder, f)));
  for (const f of files) {
    const file = join(folder, f);
    const info = isVideo(f) ? probeClip(file) : undefined;
    const size = isVideo(f) ? (info?.width && info.height ? info : undefined) : sizes.get(file);
    const width = size?.width ?? 0;
    const height = size?.height ?? 0;
    const ratio = width / height;
    out.push({
      path: relative(REPO_ROOT, file),
      kind: isVideo(f) ? 'clip' : 'hình',
      width,
      height,
      orientation: !size ? 'không rõ' : ratio > LANDSCAPE_RATIO ? 'ngang' : ratio < 1 / LANDSCAPE_RATIO ? 'dọc' : 'vuông',
      durationSec: isVideo(f) ? info?.durationSec : undefined,
    });
  }
  return out;
}

/** File trong hinh/ mà máy không đọc được (HEIC chưa đổi, PDF…). */
export function unsupportedMedia(dir: string, supported: string[]): string[] {
  return visibleFiles(mediaDir(dir)).filter((f) => !supported.includes(extname(f).toLowerCase()));
}

export function mediaWarnings(dir: string, script: Script, supported: string[]): string[] {
  const warnings: string[] = [];
  const bad = unsupportedMedia(dir, supported);
  if (bad.length) warnings.push(`Thư mục ${MEDIA_DIR} có file máy chưa đọc được: ${bad.join(', ')}. Chạy "./reel hinh <tên-video>" (tự đổi ảnh iPhone sang JPG), file khác thì xuất lại dạng JPG/PNG/MP4.`);
  const media = listMedia(dir, supported);
  const used = new Set(assetPaths(script).map((p) => normalize(p)));
  const unused = media.filter((m) => !used.has(m.path));
  if (unused.length) warnings.push(`MKT đã gửi ${unused.length} hình/clip chưa dùng trong video: ${unused.map((m) => m.path.split('/').pop()).join(', ')}.`);
  const byPath = new Map(media.map((m) => [m.path, m]));
  for (const sc of script.scenes) {
    if (!COVER_TYPES.has(sc.visual.type)) continue;
    for (const src of [sc.visual.src, sc.visual.srcAfter, ...(sc.visual.srcs ?? [])]) {
      if (src && byPath.get(normalize(src))?.orientation === 'ngang') warnings.push(`Cảnh "${sc.id}": "${src.split('/').pop()}" là hình ngang, khung video dọc sẽ cắt mất hai bên. Xem thử kỹ, hoặc nhờ MKT chụp/quay dọc.`);
    }
  }
  return warnings;
}
