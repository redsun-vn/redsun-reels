/**
 * Từ script.json (đã validate) → props cho template (REQUIREMENTS v0.4 §6.4, phương án A).
 * Template nhận một biến `props` dạng chuỗi JSON (variables không có kiểu mảng) + `debugSafeZone`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadStylePreset, type StylePreset } from '../../config/style-preset.schema.ts';
import type { Script } from '../../config/script.schema.ts';
import { getOccasion } from '../../config/occasions.ts';
import { getVideoType, type ProductId } from '../../config/video-types.ts';

export interface PropsScene {
  id: string;
  role: string;
  text: string;
  sub?: string;
  visual: Script['scenes'][number]['visual'];
  attribution?: string;
  promo?: Script['scenes'][number]['promo'];
  stats?: Script['scenes'][number]['stats'];
  motion?: Script['scenes'][number]['motion'];
  chart?: 'bar';
  start: number;
  duration: number;
  /**
   * Cảnh có clip video (visual asset): `shot` ở cảnh đầu của một đoạn clip liền mạch — các cảnh sau cùng clip,
   * không khai clipStart, nối tiếp (`continues`) và không tạo video mới. `mediaStart` = giây trong clip gốc,
   * `audio` = giữ tiếng gốc (loại video keepClipAudio, không `mute`).
   */
  shot?: { duration: number; mediaStart: number; audio: boolean };
  continues?: boolean;
}

export interface TemplateProps {
  template: string;
  product: ProductId;
  logoOnDark: string;
  logoOnLight: string;
  style: StylePreset;
  scenes: PropsScene[];
  totalSec: number;
  /** Hạt giống bố trí trang trí (kit-core hash01), lấy từ nội dung kịch bản: mỗi video một bố trí khác. */
  seed: number;
  /** Dịp lễ (config/occasions.ts): nền phủ ánh màu của dịp (brand/brand.css [data-occasion]). */
  occasion?: string;
  /** Nhãn trên hook theo loại video (TipOfTheDay). */
  hookTag?: string;
  /** Đánh số bước khi có từ 2 cảnh solution trở lên. */
  numberSteps: boolean;
  /** Khoảng thời gian clip có tiếng gốc (giây trong video) — nhạc nền hạ xuống ở đây. */
  voiceWindows: Array<{ start: number; end: number }>;
}

interface ProductsFile {
  products: Record<ProductId, { logos: { onDark: string; onLight: string } }>;
}

export function buildProps(repoRoot: string, script: Script, occasion?: string): TemplateProps {
  const products = JSON.parse(readFileSync(join(repoRoot, 'brand', 'products.json'), 'utf8')) as ProductsFile;
  const logos = products.products[script.product].logos;
  const style = loadStylePreset(repoRoot, script.style);

  const { scenes, totalSec, voiceWindows } = timedScenes(script);

  return {
    template: script.template,
    product: script.product,
    logoOnDark: logos.onDark,
    logoOnLight: logos.onLight,
    style,
    scenes,
    totalSec,
    hookTag: getVideoType(script.videoType)?.hookTag,
    seed: seedOf(`${script.product}|${script.hook}|${script.cta}`),
    occasion: occasion && getOccasion(occasion) ? occasion : undefined,
    numberSteps: script.scenes.filter((s) => s.role === 'solution').length >= 2,
    voiceWindows,
  };
}

/** Cảnh có mốc thời gian + đoạn clip liền mạch (không cần đọc brand/preset, dùng được cho validate). */
export function timedScenes(script: Script): { scenes: PropsScene[]; totalSec: number; voiceWindows: Array<{ start: number; end: number }> } {
  let t = 0;
  const scenes = script.scenes.map((s) => {
    const scene: PropsScene = { id: s.id, role: s.role, text: s.onScreenText, sub: s.subText, visual: s.visual, attribution: s.attribution, promo: s.promo, stats: s.stats, chart: s.chart, motion: s.motion, start: round(t), duration: s.durationSec };
    t += s.durationSec;
    return scene;
  });
  const voiceWindows = assignShots(scenes, getVideoType(script.videoType)?.keepClipAudio ?? false);
  return { scenes, totalSec: round(t), voiceWindows };
}

/** FNV-1a 32 bit → 0..999: cùng nội dung luôn ra cùng số (render xác định). */
export function seedOf(text: string): number {
  let h = 0x811c9dc5;
  for (const ch of text) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % 1000;
}

const VIDEO_RE = /\.(mp4|mov|webm)$/i;

export function isVideo(src: string | undefined): src is string {
  return !!src && VIDEO_RE.test(src);
}

/**
 * Gom cảnh clip (visual asset là video, không phải CTA) thành các đoạn liền mạch, chỉ ở loại video giữ tiếng gốc
 * (người nói, khách hàng nói): cảnh nối tiếp khi cảnh trước cùng file và cảnh này không khai clipStart. Đổi `mute`
 * giữa chừng thì mở đoạn mới nhưng clip vẫn chạy tiếp từ chỗ cũ. Loại video khác giữ cách cũ: mỗi cảnh một clip,
 * chạy từ `clipStart` (mặc định 0), chuyển cảnh theo phong cách. Trả về các khoảng có tiếng gốc (để hạ nhạc).
 */
export function assignShots(scenes: PropsScene[], keepClipAudio: boolean): Array<{ start: number; end: number }> {
  let head: PropsScene | undefined;
  let prev: PropsScene | undefined;
  let prevEnd = 0; // giây trong clip gốc mà cảnh trước dừng lại
  for (const sc of scenes) {
    const v = sc.visual;
    if (sc.role === 'cta' || v.type !== 'asset' || !isVideo(v.src)) {
      head = prev = undefined;
      continue;
    }
    const audio = keepClipAudio && !v.mute;
    const follows = keepClipAudio && prev?.visual.src === v.src && v.clipStart === undefined;
    if (follows && head?.shot && head.shot.audio === audio) {
      sc.continues = true;
      head.shot.duration = round(head.shot.duration + sc.duration);
    } else {
      sc.shot = { duration: sc.duration, mediaStart: follows ? prevEnd : (v.clipStart ?? 0), audio };
      head = sc;
    }
    prevEnd = round((head.shot as NonNullable<PropsScene['shot']>).mediaStart + (head.shot as NonNullable<PropsScene['shot']>).duration);
    prev = sc;
  }
  return voiceWindowsOf(scenes);
}

/** Khoảng có tiếng gốc theo các đoạn clip đã gom. */
export function voiceWindowsOf(scenes: PropsScene[]): Array<{ start: number; end: number }> {
  return scenes.filter((sc) => sc.shot?.audio).map((sc) => ({ start: sc.start, end: round(sc.start + (sc.shot?.duration ?? 0)) }));
}

/** Giá trị cho `--variables-file` của hyperframes render. */
export function variablesFile(props: TemplateProps, debugSafeZone = false): { props: string; debugSafeZone: boolean } {
  return { props: JSON.stringify(props), debugSafeZone };
}

/** Các đường dẫn hình/clip cần copy vào stage. */
export function assetPaths(script: Script): string[] {
  return script.scenes.flatMap((s) => [s.visual.src, s.visual.srcAfter, ...(s.visual.srcs ?? [])]).filter((x): x is string => !!x);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
