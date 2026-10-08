/**
 * Hạ nhạc nền khi clip có tiếng người thật (REQUIREMENTS v0.4 §7.1, §8.3): lane `volume` của `data-automation`
 * (skill /hyperframes:hyperframes-audio) trên phần tử #music.
 *
 * Lane phải nằm sẵn trong HTML: HyperFrames 0.8.141 không đọc `data-automation` gán bằng JS lúc chạy
 * (thử 2026-10-09, plans/261009-0512-m4-du-20-loai). Vì vậy bước build ghi lane vào index.html của bản stage.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** Mức nhạc khi có tiếng người (≈ −15 dB) và độ dài dốc hạ/trả nhạc. */
export const DUCK_LEVEL = 0.18;
export const DUCK_RAMP_SEC = 0.3;
/** Hai khoảng có tiếng cách nhau ngắn hơn mức này thì gộp, nhạc không bật lên rồi hạ ngay. */
const MERGE_GAP_SEC = 0.8;

export interface VolumePoint {
  t: number;
  v: number;
}

export function duckingPoints(windows: Array<{ start: number; end: number }>, totalSec: number): VolumePoint[] {
  const merged: Array<{ start: number; end: number }> = [];
  for (const w of [...windows].sort((a, b) => a.start - b.start)) {
    const last = merged[merged.length - 1];
    if (last && w.start - last.end < MERGE_GAP_SEC) last.end = Math.max(last.end, w.end);
    else merged.push({ ...w });
  }
  if (!merged.length) return [];
  const pts: VolumePoint[] = [];
  const add = (t: number, v: number) => pts.push({ t: Math.round(Math.min(Math.max(t, 0), totalSec) * 1000) / 1000, v });
  if (merged[0].start > DUCK_RAMP_SEC) add(0, 1);
  for (const w of merged) {
    if (w.start > DUCK_RAMP_SEC) add(w.start - DUCK_RAMP_SEC, 1);
    add(w.start, DUCK_LEVEL);
    add(w.end, DUCK_LEVEL);
    if (w.end + DUCK_RAMP_SEC < totalSec) add(w.end + DUCK_RAMP_SEC, 1);
  }
  return pts.filter((p, i) => i === 0 || p.t > pts[i - 1].t);
}

/** Ghi lane hạ nhạc lên `<audio id="music">` trong index.html của bản stage. Không có khoảng nào thì bỏ qua. */
export function injectMusicDucking(indexHtml: string, windows: Array<{ start: number; end: number }>, totalSec: number): void {
  const points = duckingPoints(windows, totalSec);
  if (!points.length) return;
  const html = readFileSync(indexHtml, 'utf8');
  const tag = /<audio id="music"[^>]*>/.exec(html);
  if (!tag) throw new Error(`Template thiếu <audio id="music"> (${indexHtml}).`);
  // Viết attribute ngoặc kép, dấu " trong JSON thành &quot; (theo hyperframes-audio/references/attributes.md)
  const lane = JSON.stringify({ version: 1, lanes: [{ target: 'volume', points }] }).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  writeFileSync(indexHtml, html.replace(tag[0], () => tag[0].replace(/>$/, ` data-automation="${lane}">`)));
}
