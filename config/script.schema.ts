/**
 * briefs/<slug>/script.json do Claude viết (REQUIREMENTS v0.4 §6.2). Không lồng tiếng: chữ trên màn hình là kênh chính.
 */
import { z } from 'zod';
import { STYLE_IDS } from './styles.ts';
import { HOOK_ANGLES, PRODUCT_IDS, SCENE_ROLES, TEMPLATE_IDS } from './video-types.ts';

export const VISUAL_TYPES = ['asset', 'text', 'phone', 'split', 'logo'] as const;

export const SceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  role: z.enum(SCENE_ROLES),
  onScreenText: z.string().min(1).max(80),
  subText: z.string().max(120).optional(),
  visual: z.object({
    type: z.enum(VISUAL_TYPES),
    src: z.string().optional(),
    /** Ảnh/clip "sau" của cảnh `split` (BeforeAfter): `src` là trước, `srcAfter` là sau. */
    srcAfter: z.string().optional(),
    /** Vùng cần chỉ vào / zoom trên ảnh (phần trăm 0–100), dùng cho callout của FeatureLaunch. */
    focus: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
  }),
  transition: z.string().optional(),
  durationSec: z.number().positive(),
  /** Testimonial: tên khách + cửa hàng hiện ở lower third, vd. "Chị Lan · Tạp hoá Lan, Hà Đông". Phải có trong brief. */
  attribution: z.string().min(1).max(60).optional(),
  /** Promo: các con số phải có trong brief (validate kiểm). */
  promo: z
    .object({
      badge: z.string().min(1).max(10).optional(),
      priceOld: z.string().min(1).max(14).optional(),
      priceNew: z.string().min(1).max(14).optional(),
      deadline: z.string().min(1).max(32).optional(),
      /** Đếm ngược N → 1, mỗi số 1 giây. */
      countdownFrom: z.number().int().min(2).max(10).optional(),
    })
    .refine((p) => Object.values(p).some((v) => v !== undefined), 'promo cần ít nhất một trường')
    .optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const ScriptSchema = z.object({
  concept: z.object({ title: z.string().min(1), bigIdea: z.string().min(1), hookAngle: z.enum(HOOK_ANGLES) }),
  videoType: z.string().min(1),
  style: z.enum(STYLE_IDS),
  template: z.enum(TEMPLATE_IDS),
  product: z.enum(PRODUCT_IDS),
  /** Chữ hook 3 giây đầu. Xuống dòng bằng "\n" (tối đa 2 dòng, ≤ 40 ký tự mỗi dòng). */
  hook: z.string().min(1),
  scenes: z.array(SceneSchema).min(2).max(12),
  cta: z.string().min(1),
  music: z.string().min(1),
  /** Điểm Claude tự chấm (REQUIREMENTS §6.2), ngưỡng ≥ 85. */
  selfScore: z
    .object({
      total: z.number().min(0).max(100),
      notes: z.string().min(1),
    })
    .optional(),
});
export type Script = z.infer<typeof ScriptSchema>;
