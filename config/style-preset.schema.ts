/**
 * Preset phong cách (brand/styles/<id>.json) — tham số chuyển động mà templates/_shared/scene-kit.js đọc.
 * Chỉ chứa nhịp, easing, kiểu chuyển cảnh, kiểu hiện chữ; không chứa màu/font (lấy từ brand.css).
 * Transition theo hyperframes-animation/transitions (Energy → Primary): một kiểu chính cho mọi lần đổi cảnh.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { STYLE_IDS } from './styles.ts';

export const TRANSITIONS = ['vertical-push', 'zoom-through', 'elastic-push', 'blur-crossfade', 'dip-black', 'flash-white', 'whip', 'glitch-cut'] as const;
export const TEXT_ENTERS = ['rise', 'slam', 'pop', 'blur', 'type', 'track'] as const;
/** Một lớp phủ mỗi video (docs/video-style-catalog.md §1). `paper`, `grid` nằm dưới chữ; còn lại nằm trên. */
export const OVERLAYS = ['none', 'vignette', 'grain', 'light-leak', 'grid', 'hud', 'scanlines', 'confetti', 'letterbox', 'paper', 'vhs'] as const;
export const BACKGROUNDS = ['flat', 'gradient', 'aurora'] as const;
export const TEXT_FX = ['none', 'glow', 'rgb-split', 'hanazi', 'glass', 'boil'] as const;

export const StylePresetSchema = z.object({
  id: z.enum(STYLE_IDS),
  transition: z.object({
    type: z.enum(TRANSITIONS),
    duration: z.number().min(0.15).max(0.8),
    ease: z.string(),
  }),
  text: z.object({
    enter: z.enum(TEXT_ENTERS),
    duration: z.number().min(0.15).max(1),
    ease: z.string(),
    /** Giãn cách giữa các từ; tổng stagger một dòng nên ≤ 0.5 giây (rules-index). */
    wordStagger: z.number().min(0).max(0.12),
  }),
  /** Độ phóng chậm ảnh nền/asset trong suốt cảnh (1 = không phóng). */
  kenBurns: z.number().min(1).max(1.2),
  /** Cách nhấn từ khóa: gạch chân màu nhấn / khối nền màu nhấn / nhãn dán nghiêng. */
  accent: z.enum(['underline', 'block', 'sticker', 'scribble']),
  overlay: z.enum(OVERLAYS),
  /** Nền: phẳng / gradient 2 sắc cùng họ màu brand / aurora (đốm màu brand mờ trôi chậm). */
  background: z.enum(BACKGROUNDS),
  /** Hiệu ứng chữ chính: phát sáng, lệch kênh màu, hanazi (viền + bóng khối), kính mờ, nét rung vẽ tay. */
  textFx: z.enum(TEXT_FX),
  /** Cảnh cuối: chữ CTA nhấp nhịp nhẹ để kêu gọi. */
  ctaPulse: z.boolean(),
  musicMood: z.array(z.enum(STYLE_IDS)).min(1),
});
export type StylePreset = z.infer<typeof StylePresetSchema>;

export function stylePresetPath(repoRoot: string, id: string): string {
  return join(repoRoot, 'brand', 'styles', `${id}.json`);
}

export function hasStylePreset(repoRoot: string, id: string): boolean {
  return existsSync(stylePresetPath(repoRoot, id));
}

export function availableStylePresets(repoRoot: string): string[] {
  return readdirSync(join(repoRoot, 'brand', 'styles'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadStylePreset(repoRoot: string, id: string): StylePreset {
  if (!hasStylePreset(repoRoot, id)) {
    throw new Error(`Phong cách "${id}" chưa dựng được (chưa có brand/styles/${id}.json). Hiện có: ${availableStylePresets(repoRoot).join(', ')}.`);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(stylePresetPath(repoRoot, id), 'utf8'));
  } catch (e) {
    throw new Error(`File phong cách brand/styles/${id}.json sai định dạng JSON: ${(e as Error).message}`);
  }
  const parsed = StylePresetSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`File phong cách brand/styles/${id}.json thiếu hoặc sai trường: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}.`);
  }
  return parsed.data;
}
