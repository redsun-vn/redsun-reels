/**
 * Nhịp khối số liệu của Stats (templates/_shared/kit-blocks.js `stats`): chữ cảnh vào (≈0.5 giây sau đầu cảnh) và số bắt đầu đếm sau 0.2 giây, mỗi chỉ số trễ 0.3 giây,
 * số đếm lên 1.2 giây, rồi giữ ít nhất 1 giây để đọc. Validate dùng để chặn cảnh quá ngắn.
 */
export const STATS_ENTER_SEC = 0.7;
export const STATS_STAGGER_SEC = 0.3;
export const STATS_COUNT_SEC = 1.2;
export const STATS_HOLD_SEC = 1.0;

export function statsSequenceSec(count: number): number {
  return Math.round((STATS_ENTER_SEC + STATS_STAGGER_SEC * (count - 1) + STATS_COUNT_SEC + STATS_HOLD_SEC) * 100) / 100;
}

/** Tách giá trị hiển thị thành phần đầu, số, phần đuôi: "1.200+" → { prefix: "", number: "1.200", suffix: "+" }. */
export function splitStatValue(value: string): { prefix: string; number: string; suffix: string } {
  const m = /^(\D*)(\d[\d.,]*)(.*)$/.exec(value.trim());
  if (!m) return { prefix: value, number: '', suffix: '' };
  const number = m[2].replace(/[.,]$/, '');
  return { prefix: m[1], number, suffix: m[2].slice(number.length) + m[3] };
}

/** Phần số hợp lệ: chấm/phẩy nghìn theo nhóm 3 ("1.200", "12,000") hoặc một dấu thập phân ("4,8", "2.5"). Khớp kit-blocks.js `parseStat`. */
export const STAT_NUMBER_RE = /^(\d{1,3}([.,])\d{3}(\2\d{3})*|\d+([.,]\d+)?)$/;
