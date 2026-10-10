/**
 * Đo độ "sống" của video dựng riêng, để Claude tự soát bằng số chứ không chỉ bằng mắt:
 * - chuyển động từng giây (độ khác trung bình giữa hai khung liên tiếp) → báo đoạn đứng hình;
 * - màu nền của từng cảnh → báo hai cảnh có nền giống nhau (Nam: mỗi cảnh một nền khác).
 */
import { spawnSync } from 'node:child_process';
import { ffmpegPath } from './hyperframes-env.ts';

/** Ngưỡng chuyển động/giây (thang 0–255, khung 270×480). Đo bản cũ: giây chỉ thở/chớp mắt ≈ 0.1–0.3, giây có hành động ≥ 1. */
export const STILL_THRESHOLD = 0.45;
/** Đứng hình liên tục từ chừng này giây trở lên thì báo. */
export const STILL_MIN_RUN = 2;

/** Độ khác trung bình (0–255) giữa mỗi khung và khung trước, kèm giây của khung. */
export function frameDiffs(mp4: string): Array<{ t: number; v: number }> {
  const r = spawnSync(ffmpegPath(), ['-hide_banner', '-i', mp4, '-an', '-vf', 'scale=270:480,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`Không đo được chuyển động: ${r.stderr.slice(-500)}`);
  const out: Array<{ t: number; v: number }> = [];
  let t = 0;
  for (const line of r.stdout.split('\n')) {
    const pt = /pts_time:([\d.]+)/.exec(line);
    if (pt) t = Number(pt[1]);
    const y = /YAVG=([\d.]+)/.exec(line);
    if (y) out.push({ t, v: Number(y[1]) });
  }
  return out;
}

export function motionPerSecond(mp4: string, diffs = frameDiffs(mp4)): number[] {
  const sum: number[] = [], n: number[] = [];
  for (const { t, v } of diffs) { const sec = Math.floor(t); sum[sec] = (sum[sec] ?? 0) + v; n[sec] = (n[sec] ?? 0) + 1; }
  return sum.map((s, i) => (n[i] ? s / n[i] : 0));
}

/** Các đoạn [giây đầu, giây cuối) có chuyển động dưới ngưỡng, dài ≥ minRun giây. */
export function stillRuns(perSec: number[], threshold = STILL_THRESHOLD, minRun = STILL_MIN_RUN): Array<[number, number]> {
  const runs: Array<[number, number]> = [];
  let start = -1;
  perSec.forEach((v, i) => {
    if (v < threshold) { if (start < 0) start = i; }
    else { if (start >= 0 && i - start >= minRun) runs.push([start, i]); start = -1; }
  });
  if (start >= 0 && perSec.length - start >= minRun) runs.push([start, perSec.length]);
  return runs;
}

/** Màu nền ước lượng của một khung: trung bình các ô viền (lưới 6×10), nơi ít khi có nhân vật/chữ chính. */
export function borderColor(png: string): [number, number, number] {
  const r = spawnSync(ffmpegPath(), ['-v', 'error', '-i', png, '-vf', 'scale=6:10:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1024 * 1024 });
  if (r.status !== 0) throw new Error(`Không đọc được khung ${png}`);
  const px = r.stdout as Buffer;
  const acc = [0, 0, 0];
  let k = 0;
  for (let y = 0; y < 10; y++) for (let x = 0; x < 6; x++) {
    if (x > 0 && x < 5 && y > 0 && y < 9) continue;
    const o = (y * 6 + x) * 3;
    acc[0] += px[o]; acc[1] += px[o + 1]; acc[2] += px[o + 2]; k++;
  }
  return [acc[0] / k, acc[1] / k, acc[2] / k].map(Math.round) as [number, number, number];
}

/** Khoảng cách màu cảm nhận gần đúng (redmean), 0–~765. */
export function colorDistance(a: number[], b: number[]): number {
  const rm = (a[0] + b[0]) / 2;
  const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return Math.sqrt((2 + rm / 256) * d[0] ** 2 + 4 * d[1] ** 2 + (2 + (255 - rm) / 256) * d[2] ** 2);
}

/** Hai cảnh có nền gần giống nhau dưới ngưỡng này thì báo. */
export const SAME_BACKGROUND = 70;

export function similarBackgrounds(scenes: Array<{ id: string; color: number[] }>): Array<[string, string, number]> {
  const out: Array<[string, string, number]> = [];
  for (let i = 0; i < scenes.length; i++) for (let j = i + 1; j < scenes.length; j++) {
    const d = colorDistance(scenes[i].color, scenes[j].color);
    if (d < SAME_BACKGROUND) out.push([scenes[i].id, scenes[j].id, Math.round(d)]);
  }
  return out;
}

/** Cảnh (clip có data-start/data-duration, không phải audio) của composition. */
export function compositionScenes(html: string): Array<{ id: string; start: number; duration: number }> {
  const out: Array<{ id: string; start: number; duration: number }> = [];
  for (const m of html.matchAll(/<(div|section)\b[^>]*\bclass="[^"]*\bclip\b[^"]*"[^>]*>/g)) {
    const tag = m[0];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1] ?? `canh-${out.length + 1}`;
    const s = /data-start="([\d.]+)"/.exec(tag), d = /data-duration="([\d.]+)"/.exec(tag);
    if (s && d) out.push({ id, start: Number(s[1]), duration: Number(d[1]) });
  }
  return out;
}
