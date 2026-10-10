/**
 * Gắn giọng đọc vào bản dựng: thẻ <audio> từng câu (thay chỗ đánh dấu <!-- GIONG-DOC -->), và đường âm lượng nhạc nền
 * gộp khoảng lặng trước vỡ lẽ (tieng-dong.txt) với các đoạn có lời (nhạc hạ xuống VOICE.duckLevel).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { VOICE } from '../../config/voice.ts';
import { VoiceScriptSchema, type VoiceScript } from './voice-script.ts';

export interface PlacedLine {
  id: string;
  at: number;
  dur: number;
  file: string;
  dat: boolean;
}

export interface VoiceLog {
  items: Array<{ id: string; file: string; dat: boolean; thoiLuong: number }>;
}

/** Lời đọc của bản dựng riêng (dung-rieng/), hoặc undefined khi video không có giọng đọc. */
export function readVoice(customDir: string): { vs: VoiceScript; placed: PlacedLine[]; missing: string[] } | undefined {
  const f = join(customDir, VOICE.file);
  if (!existsSync(f)) return undefined;
  const vs = VoiceScriptSchema.parse(JSON.parse(readFileSync(f, 'utf8')));
  const logPath = join(customDir, VOICE.dir, VOICE.logFile);
  const log: VoiceLog = existsSync(logPath) ? JSON.parse(readFileSync(logPath, 'utf8')) : { items: [] };
  const placed: PlacedLine[] = [], missing: string[] = [];
  for (const c of vs.cau) {
    const it = log.items.find((x) => x.id === c.id);
    if (!it || !existsSync(join(customDir, VOICE.dir, it.file))) { missing.push(c.id); continue; }
    placed.push({ id: c.id, at: c.at, dur: it.thoiLuong, file: it.file, dat: it.dat });
  }
  return { vs, placed, missing };
}

/** Giờ thật của từng câu cho RS.loi (rieng.js): câu chưa có giọng (bản soát hình) ước theo số chữ. */
export function voiceTimingScript(vs: VoiceScript, placed: PlacedLine[]): string {
  const map: Record<string, { at: number; dur: number; loi: string }> = {};
  for (const c of vs.cau) {
    const p = placed.find((x) => x.id === c.id);
    const words = c.loi.replace(/\[[^\]]*\]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    map[c.id] = { at: c.at, dur: Number((p?.dur ?? Math.max(0.8, words * 0.32)).toFixed(3)), loi: c.loi };
  }
  return `<script>window.RS_LOI = ${JSON.stringify(map)};</script>`;
}

export function voiceTags(placed: PlacedLine[], totalSec: number): string {
  return placed
    .map((p, i) => `<audio id="giong-${p.id}" src="${VOICE.dir}/${p.file}" data-start="${p.at.toFixed(2)}" data-duration="${Math.min(p.dur, totalSec - p.at).toFixed(2)}" data-track-index="${VOICE.trackStart + i}" data-volume="1"></audio>`)
    .join('\n  ');
}

/** Mức nhạc nền theo thời gian: 1, hạ khi có lời, hạ sâu trong khoảng lặng; dốc 0.15 giây hai đầu. */
export function musicLevelPoints(opts: { totalSec: number; voice: Array<{ from: number; to: number }>; silence?: { from: number; to: number; level: number } }): Array<{ t: number; v: number }> {
  const R = 0.15;
  const zones = [
    ...opts.voice.map((w) => ({ from: w.from, to: w.to, level: VOICE.duckLevel, rampIn: R, rampOut: R })),
    ...(opts.silence ? [{ from: opts.silence.from, to: opts.silence.to - 0.02, level: opts.silence.level, rampIn: R, rampOut: 0.02 }] : []),
  ];
  const levelAt = (t: number) => zones.reduce((m, z) => {
    if (t >= z.from && t <= z.to) return Math.min(m, z.level);
    if (t < z.from && t >= z.from - z.rampIn) return Math.min(m, 1 - ((t - (z.from - z.rampIn)) / z.rampIn) * (1 - z.level));
    if (t > z.to && t <= z.to + z.rampOut) return Math.min(m, z.level + ((t - z.to) / z.rampOut) * (1 - z.level));
    return m;
  }, 1);
  const ts = new Set<number>([0]);
  for (const z of zones) for (const t of [z.from - z.rampIn, z.from, z.to, z.to + z.rampOut]) if (t >= 0 && t <= opts.totalSec) ts.add(Number(t.toFixed(3)));
  const pts = [...ts].sort((a, b) => a - b).map((t) => ({ t, v: Number(levelAt(t).toFixed(3)) }));
  // Bỏ điểm thừa (cùng mức với hai điểm kề)
  return pts.filter((p, i) => i === 0 || i === pts.length - 1 || !(pts[i - 1].v === p.v && pts[i + 1].v === p.v));
}

export function musicAutomation(points: Array<{ t: number; v: number }>): string {
  return JSON.stringify({ version: 1, lanes: [{ target: 'volume', points }] });
}

/** Gắn đường âm lượng vào thẻ nhạc nền <audio id="music">. */
export function injectMusicAutomation(html: string, automation: string): string {
  const m = /<audio\b[^>]*\bid="music"[^>]*>/.exec(html);
  if (!m) throw new Error('Composition cần <audio id="music" …> để hạ nhạc khi có lời/khoảng lặng.');
  if (/data-automation=/.test(m[0])) throw new Error('Thẻ nhạc đã có data-automation: khai khoảng lặng ở tieng-dong.txt và lời đọc ở loi-doc.json, không viết tay.');
  return html.replace(m[0], m[0].replace(/<audio\b/, `<audio data-automation='${automation}'`));
}
