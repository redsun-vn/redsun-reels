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
    /** Vùng cần chỉ vào / zoom trên ảnh (phần trăm 0–100), dùng cho callout của FeatureLaunch. */
    focus: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
  }),
  transition: z.string().optional(),
  durationSec: z.number().positive(),
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
