/**
 * Trần chi phí API cho mỗi video (Nam 2026-10-10: "nên đặt trần cho video", sau khi 150k nạp cho giọng đọc hết trong một
 * buổi thử). Mọi lệnh gọi API tốn tiền (giọng đọc, sau này cảnh AI) cộng dồn vào sổ của video và dừng khi chạm trần.
 * Chỉ Nam đổi số này. Giá theo bảng giá Gemini API (đọc 2026-10-10, ai.google.dev/gemini-api/docs/pricing), USD / 1 triệu token.
 */
export const COST = {
  /** Trần mỗi video, đồng. */
  capVndPerVideo: 15_000,
  /** Tỷ giá ước để quy đổi (USD → đồng); chỉ dùng để so với trần. */
  vndPerUsd: 26_000,
  /** VieNeu tính bằng token của gói (không đổi ra đồng được khi đang dùng thử): trần token mỗi video. */
  vieneuTokenCapPerVideo: 20_000,
  /** Giá theo model: input, output (output gồm cả phần "suy nghĩ"). */
  prices: {
    'gemini-2.5-pro-preview-tts': { input: 1.0, output: 20.0 },
    'gemini-3.8-flash-tts': { input: 0.5, output: 9.0 },
    'gemini-3.8-flash': { input: 0.75, output: 3.75 },
    'gemini-3.1-pro-preview': { input: 2.0, output: 12.0 },
  } as Record<string, { input: number; output: number }>,
} as const;

export interface Usage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  thoughtsTokenCount?: number;
}

/** Tiền (USD) của một lượt gọi theo usageMetadata Gemini trả về. Model không có trong bảng giá → báo lỗi (không đoán giá). */
export function callCostUsd(model: string, usage: Usage | undefined): number {
  const p = COST.prices[model];
  if (!p) throw new Error(`Chưa có giá của model ${model} trong config/cost.ts (cần dev thêm trước khi dùng).`);
  const out = (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0);
  return ((usage?.promptTokenCount ?? 0) * p.input + out * p.output) / 1_000_000;
}

export const toVnd = (usd: number) => Math.round(usd * COST.vndPerUsd);
