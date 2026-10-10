/**
 * Frontmatter của briefs/<slug>/brief.md (REQUIREMENTS v0.4 §6.1).
 */
import { z } from 'zod';
import { KIEU_HINH } from './ai-video.ts';
import { PRODUCT_IDS, TEMPLATE_IDS } from './video-types.ts';

export const BriefSchema = z.object({
  product: z.enum(PRODUCT_IDS),
  /** Kiểu hình (REQUIREMENTS v0.5 §7.4): MKT chọn, Claude không tự chọn (skill chon-kieu-hinh). */
  kieuHinh: z.enum(KIEU_HINH),
  videoType: z.string().min(1),
  style: z.string().nullish(),
  occasion: z.string().nullish(),
  template: z.union([z.literal('auto'), z.enum(TEMPLATE_IDS)]).default('auto'),
  goal: z.string().min(1),
  audience: z.string().min(1),
  /** LUẬT CỨNG reel 15–30 giây (config/video-types.ts REEL_SEC). */
  duration: z.number().min(15, 'Reel dài 15–30 giây (luật cứng).').max(30, 'Reel dài 15–30 giây (luật cứng).'),
  tone: z.string().min(1),
  cta: z.string().min(1),
  music: z.string().min(1).default('auto'),
  assets: z.array(z.string()).default([]),
});

export type Brief = z.infer<typeof BriefSchema>;
