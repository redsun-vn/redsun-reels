/**
 * Công thức thời lượng mỗi cảnh (REQUIREMENTS v0.4 §6.2, Nam chốt 2026-10-08):
 * durationSec = max(tối thiểu, số từ × giây/từ) + thời gian animation vào, làm tròn 0.1 giây.
 */
export const SCENE_TIMING = {
  secondsPerWord: 0.4,
  minSeconds: 1.5,
  enterAnimationSeconds: 0.5,
} as const;

/** Đếm từ theo khoảng trắng (tiếng Việt viết tách âm tiết, mỗi âm tiết tính là một từ). */
export function countWords(text: string): number {
  const trimmed = text.normalize('NFC').trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/u).length;
}

/** Thời lượng tối thiểu của một cảnh từ chữ chính và dòng phụ. */
export function sceneDurationSec(onScreenText: string, subText = ''): number {
  const words = countWords(onScreenText) + countWords(subText);
  const reading = Math.max(SCENE_TIMING.minSeconds, words * SCENE_TIMING.secondsPerWord);
  return Math.round((reading + SCENE_TIMING.enterAnimationSeconds) * 10) / 10;
}
