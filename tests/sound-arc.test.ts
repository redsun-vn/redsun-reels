import { describe, expect, it } from 'vitest';
import { arcCheck, beatCheck, dbWindows, transitions } from '../scripts/lib/sound-arc.ts';

describe('đo lặng trước vỡ lẽ và chuyển hình trên phách', () => {
  it('độ to theo cửa sổ', () => {
    const x = new Float32Array(200).fill(0.5);
    x.fill(0.05, 100);
    const db = dbWindows(x, 100);
    expect(db[0]).toBeCloseTo(-6.02, 1);
    expect(db[1]).toBeCloseTo(-26.02, 1);
  });

  it('đạt khi lặng sâu và tiếng to nhất rơi lúc vỡ lẽ; báo khi không', () => {
    const loud = Array.from({ length: 100 }, () => -20);
    for (let i = 40; i < 50; i++) loud[i] = -40; // lặng 4–5s
    loud[51] = -3; // vỡ lẽ ở 5s
    const ok = arcCheck(loud, { from: 4, to: 5 });
    expect(ok.messages).toEqual([]);
    expect(ok.peakAt).toBe(5.1);
    loud[80] = 0; // tiếng to hơn ở 8s
    for (let i = 40; i < 50; i++) loud[i] = -8; // lặng không đủ sâu
    const bad = arcCheck(loud, { from: 4, to: 5 }).messages.join('\n');
    expect(bad).toContain('giây 8');
    expect(bad).toContain('chỉ thấp hơn');
  });

  it('cụm khung đổi mạnh là một cú chuyển; trên phách khi bắt đầu hoặc dừng đúng phách', () => {
    const d = (t: number, v: number) => ({ t, v });
    const diffs = [d(0.03, 40), d(0.5, 1), d(1.0, 10), d(1.03, 30), d(1.07, 12), d(1.1, 2), d(2.0, 12), d(2.03, 11), d(2.07, 1), d(3.0, 25), d(3.03, 1)];
    const moves = transitions(diffs);
    expect(moves).toEqual([{ start: 1, end: 1.07 }, { start: 3, end: 3 }]);
    const { on, off } = beatCheck(moves, [1.07, 2.5]);
    expect(on).toHaveLength(1);
    expect(off).toEqual([{ start: 3, end: 3 }]);
  });
});
