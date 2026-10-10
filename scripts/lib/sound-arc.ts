/**
 * Đo sau khi xuất bản dựng riêng (ý tưởng từ skill animate của cth9191, MIT): câu chuyện có "lặng trước, to nhất lúc vỡ lẽ"
 * không, và các điểm cắt hình có rơi trên phách nhạc không. Đo trên file MP4 thật, không đoán bằng mắt/tai.
 */
import { spawnSync } from 'node:child_process';
import { ffmpegPath } from './hyperframes-env.ts';

const SR = 11025;
/** Cửa sổ đo độ to (giây). */
export const LOUD_WIN = 0.1;
/** Khoảng lặng phải thấp hơn điểm vỡ lẽ ít nhất chừng này dB. */
export const SILENCE_DROP_DB = 8;
/** Điểm vỡ lẽ: tiếng to nhất nằm trong [đến − 0.1, đến + PAYOFF_AFTER]. */
export const PAYOFF_AFTER = 0.6;
/** Tiếng to nhất cả video được lệch chừng này dB so với điểm vỡ lẽ (bộ giới hạn đỉnh làm các đỉnh gần bằng nhau). */
export const PEAK_SLACK_DB = 1;
/**
 * Chuyển hình = một cụm khung liên tiếp đổi ≥ CUT_EDGE_DIFF (thang 0–255) có đỉnh ≥ CUT_MIN_DIFF: cắt cảnh, mở tròn,
 * chớp sáng, lao máy. Cú chuyển "trên phách" khi lúc bắt đầu hoặc lúc dừng của cụm rơi trên phách.
 */
export const CUT_MIN_DIFF = 18;
export const CUT_EDGE_DIFF = 8;
/** Điểm cắt cách phách ≤ chừng này giây (2 khung ở 30fps) là trên phách. */
export const BEAT_TOLERANCE = 0.07;

/** Độ to (dB RMS) từng cửa sổ 0.1 giây của tiếng trong file. */
export function loudnessWindows(file: string, win = LOUD_WIN): number[] {
  const r = spawnSync(ffmpegPath(), ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`Không đọc được tiếng của ${file}: ${r.stderr?.toString()}`);
  const buf = r.stdout as Buffer;
  const x = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + Math.floor(buf.length / 4) * 4));
  return dbWindows(x, Math.round(SR * win));
}

export function dbWindows(x: Float32Array, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i + n <= x.length; i += n) {
    let e = 0;
    for (let k = 0; k < n; k++) e += x[i + k] * x[i + k];
    out.push(10 * Math.log10(e / n + 1e-12));
  }
  return out;
}

export interface ArcResult {
  /** Độ to lớn nhất trong cửa sổ vỡ lẽ (dB). */
  payoffDb: number;
  /** Độ to trung bình trong khoảng lặng (dB). */
  silenceDb: number;
  /** Giây có tiếng to nhất cả video. */
  peakAt: number;
  peakDb: number;
  messages: string[];
}

/** Khoảng lặng from–to rồi điểm vỡ lẽ ở `to`. */
export function arcCheck(loud: number[], silence: { from: number; to: number }, win = LOUD_WIN): ArcResult {
  const idx = (t: number) => Math.max(0, Math.min(loud.length - 1, Math.round(t / win)));
  const range = (a: number, b: number) => loud.slice(idx(a), Math.max(idx(a) + 1, idx(b)));
  const payoffDb = Math.max(...range(silence.to - 0.1, silence.to + PAYOFF_AFTER));
  const quiet = range(silence.from + 0.1, silence.to - 0.1);
  const silenceDb = quiet.reduce((s, v) => s + v, 0) / quiet.length;
  let peak = 0;
  loud.forEach((v, i) => { if (v > loud[peak]) peak = i; });
  const peakAt = Number((peak * win).toFixed(1)), peakDb = loud[peak];
  const messages: string[] = [];
  const drop = payoffDb - silenceDb;
  if (drop < SILENCE_DROP_DB) messages.push(`Khoảng lặng ${silence.from}–${silence.to}s chỉ thấp hơn lúc vỡ lẽ ${drop.toFixed(1)} dB (cần ≥ ${SILENCE_DROP_DB}): hạ nhạc sâu hơn hoặc bỏ tiếng động trong khoảng lặng.`);
  if (payoffDb < peakDb - PEAK_SLACK_DB) messages.push(`Tiếng to nhất video ở giây ${peakAt}, không phải lúc vỡ lẽ ${silence.to}s (kém ${(peakDb - payoffDb).toFixed(1)} dB): tăng tiếng nhấn lúc vỡ lẽ hoặc hạ tiếng ở giây ${peakAt}.`);
  return { payoffDb, silenceDb, peakAt, peakDb, messages };
}

export interface Transition {
  start: number;
  end: number;
}

/** Các cú chuyển hình mạnh (bỏ khung đầu video). */
export function transitions(diffs: Array<{ t: number; v: number }>, peak = CUT_MIN_DIFF, edge = CUT_EDGE_DIFF): Transition[] {
  const out: Transition[] = [];
  let run: Array<{ t: number; v: number }> = [];
  const flush = () => {
    if (run.length && Math.max(...run.map((d) => d.v)) >= peak && run[0].t >= 0.2) out.push({ start: Number(run[0].t.toFixed(2)), end: Number(run[run.length - 1].t.toFixed(2)) });
    run = [];
  };
  for (const d of diffs) { if (d.v >= edge) run.push(d); else flush(); }
  flush();
  return out;
}

export function beatCheck(moves: Transition[], beats: number[], tol = BEAT_TOLERANCE): { on: Transition[]; off: Transition[] } {
  const near = (t: number) => beats.some((b) => Math.abs(b - t) <= tol);
  const on: Transition[] = [], off: Transition[] = [];
  for (const m of moves) (near(m.start) || near(m.end) ? on : off).push(m);
  return { on, off };
}
