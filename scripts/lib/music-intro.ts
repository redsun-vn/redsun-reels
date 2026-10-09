/**
 * Tìm chỗ nhạc "vào nhịp" để bỏ đoạn dạo đầu nhỏ (reel phải bắt tai từ giây đầu; Nam 2026-10-09).
 * Đo độ to ngắn hạn (cửa sổ 3 giây, EBU R128) theo thời gian; điểm bắt đầu = lúc độ to lần đầu đạt mức
 * gần độ to cả bài (thấp hơn ≤ 6 LU; bài có điệp khúc to thì thân bài thường thấp hơn 5–8 LU), lùi lại 3 giây (độ to ngắn hạn tính trên 3 giây trước đó). Dưới 1.5 giây → 0.
 */
import { runFfmpeg } from './hyperframes-env.ts';

const NEAR_LU = 6;
const WINDOW_SEC = 3;
const MAX_START_SEC = 15;

export function introSkipSec(file: string): number {
  const r = runFfmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128', '-f', 'null', '-']);
  const integrated = Number(/I:\s+(-?[\d.]+) LUFS/.exec(r.stderr.slice(r.stderr.lastIndexOf('Summary:')))?.[1]);
  if (!Number.isFinite(integrated)) return 0;
  for (const m of r.stderr.matchAll(/t:\s*([\d.]+)\s.*?S:\s*(-?[\d.]+)/g)) {
    const t = Number(m[1]);
    if (t < WINDOW_SEC) continue;
    if (Number(m[2]) >= integrated - NEAR_LU) {
      const start = Math.min(MAX_START_SEC, Math.floor((t - WINDOW_SEC) * 2) / 2);
      return start < 1.5 ? 0 : start;
    }
  }
  return 0;
}
