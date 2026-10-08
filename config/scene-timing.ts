/**
 * Công thức thời lượng mỗi cảnh (REQUIREMENTS v0.4 §6.2, Nam chốt 2026-10-08):
 * durationSec = max(tối thiểu, số từ × giây/từ) + thời gian animation vào, làm tròn 0.1 giây.
 */
export const SCENE_TIMING = {
  secondsPerWord: 0.4,
  minSeconds: 1.5,
  enterAnimationSeconds: 0.5,
} as const;

/** Đếm từ theo khoảng trắng (tiếng Việt viết tách âm tiết, mỗi âm tiết là một từ); bỏ qua cụm chỉ có dấu câu như "—", "·". */
export function countWords(text: string): number {
  return text
    .normalize('NFC')
    .split(/\s+/u)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Thời lượng tối thiểu của một cảnh từ chữ chính và dòng phụ. */
export function sceneDurationSec(onScreenText: string, subText = ''): number {
  const words = countWords(onScreenText) + countWords(subText);
  const reading = Math.max(SCENE_TIMING.minSeconds, words * SCENE_TIMING.secondsPerWord);
  return Math.round((reading + SCENE_TIMING.enterAnimationSeconds) * 10) / 10;
}
