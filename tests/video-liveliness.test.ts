import { describe, expect, it } from 'vitest';
import { detectBeats } from '../scripts/lib/music-beats.ts';
import { colorDistance, compositionScenes, similarBackgrounds, stillRuns } from '../scripts/lib/video-liveliness.ts';

describe('độ sống của video dựng riêng', () => {
  it('báo đoạn đứng hình từ 2 giây, bỏ qua giây lặng lẻ', () => {
    expect(stillRuns([3, 0.1, 2, 0.2, 0.3, 0.1, 1.5, 0.2, 0.1])).toEqual([[3, 6], [7, 9]]);
    expect(stillRuns([1, 1, 1])).toEqual([]);
  });

  it('nền gần giống nhau thì báo, khác hẳn thì không', () => {
    expect(colorDistance([11, 75, 84], [11, 75, 84])).toBe(0);
    const same = similarBackgrounds([
      { id: 'sA', color: [247, 226, 200] },
      { id: 'sB', color: [27, 25, 64] },
      { id: 'sC', color: [30, 28, 70] },
    ]);
    expect(same.map(([a, b]) => `${a}~${b}`)).toEqual(['sB~sC']);
  });

  it('đọc cảnh từ composition (bỏ audio)', () => {
    const html = '<div id="sA" class="clip rs-scene" data-start="0" data-duration="3.4"></div><div id="sB" class="clip" data-start="3.4" data-duration="2"></div><audio id="m" src="x" data-start="0" data-duration="5"></audio>';
    expect(compositionScenes(html)).toEqual([{ id: 'sA', start: 0, duration: 3.4 }, { id: 'sB', start: 3.4, duration: 2 }]);
  });

  it('dò nhịp: tiếng gõ đều 120 BPM', () => {
    const sr = 11025, beat = 0.5, off = 0.21;
    const x = new Float32Array(sr * 20);
    for (let t = off; t < 20; t += beat) {
      const i0 = Math.round(t * sr);
      for (let k = 0; k < 400 && i0 + k < x.length; k++) x[i0 + k] = Math.sin(k * 0.9) * Math.exp(-k / 80);
    }
    const b = detectBeats(x, sr);
    expect(Math.abs(b.bpm - 120)).toBeLessThan(2);
    expect(Math.abs(b.beats[0] - off)).toBeLessThan(0.05);
    expect(b.downbeats.length).toBeGreaterThan(8);
  });
});
