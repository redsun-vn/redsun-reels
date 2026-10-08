/**
 * Nhịp hiện khối khuyến mãi của Promo — PHẢI khớp templates/_shared/kit-blocks.js (hàm promo) và
 * scene-kit.js (khối promo vào sau chữ 0.4s). Validate dùng để bảo đảm cảnh đủ dài cho badge, giá,
 * đếm ngược và hạn chót hiện hết rồi còn thời gian đọc.
 */
import type { Scene } from './script.schema.ts';

export const PROMO_TIMING = {
  /** Cảnh vào muộn nhất 0.6 × thời lượng chuyển cảnh dài nhất (0.8s). */
  sceneEnter: 0.48,
  /** Khối promo bắt đầu sau chữ chính. */
  afterText: 0.4,
  badge: 0.35,
  priceOld: 0.6,
  priceNew: 0.35,
  deadline: 0.35,
  /** Thời gian giữ để đọc sau khi mọi thứ đã hiện. */
  readHold: 1.0,
} as const;

/** Thời lượng tối thiểu (giây) của cảnh có khối khuyến mãi. */
export function promoSequenceSec(promo: NonNullable<Scene['promo']>): number {
  const T = PROMO_TIMING;
  let t = T.sceneEnter + T.afterText;
  if (promo.badge) t += T.badge;
  if (promo.priceOld) t += T.priceOld;
  if (promo.priceNew) t += T.priceNew;
  if (promo.countdownFrom) t += promo.countdownFrom;
  if (promo.deadline) t += T.deadline;
  return Math.round((t + T.readHold) * 10) / 10;
}
