/**
 * Dò nhịp (beat) của bài nhạc để cắt cảnh và đặt điểm nhấn trùng phách. Giải mã mono 11025 Hz bằng ffmpeg,
 * lấy đường năng lượng khởi âm (onset), tự tương quan tìm tempo 70–180 BPM, rồi chọn pha khớp onset nhất.
 * Kết quả gần đúng (đủ cho cắt cảnh), không thay được tai người.
 */
import { spawnSync } from 'node:child_process';
import { ffmpegPath } from './hyperframes-env.ts';

const SR = 11025;
const HOP = 256;

export interface BeatInfo {
  bpm: number;
  /** Giây của từng phách. */
  beats: number[];
  /** Phách mạnh (đầu ô nhịp 4/4) — chỗ đẹp nhất để cắt cảnh. */
  downbeats: number[];
}

export function onsetEnvelope(samples: Float32Array): Float32Array {
  const n = Math.floor(samples.length / HOP);
  const energy = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    let e = 0;
    for (let k = 0; k < HOP; k++) {
      const s = samples[i * HOP + k];
      const hp = s - prev; // vi phân bậc nhất: nhấn tần cao (trống, gõ)
      prev = s;
      e += hp * hp;
    }
    energy[i] = Math.log1p(1000 * e);
  }
  const env = new Float32Array(n);
  for (let i = 1; i < n; i++) env[i] = Math.max(0, energy[i] - energy[i - 1]);
  return env;
}

export function detectBeats(samples: Float32Array, sr = SR): BeatInfo {
  const env = onsetEnvelope(samples);
  const fps = sr / HOP;
  // Tempo: tự tương quan có trọng số ưu tiên quanh 120 BPM
  let bestLag = 0, bestScore = -1;
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const lag = (60 / bpm) * fps;
    let sc = 0;
    for (let i = 0; i + lag * 4 < env.length; i++) {
      const a = env[i];
      if (!a) continue;
      sc += a * (interp(env, i + lag) + 0.5 * interp(env, i + 2 * lag) + 0.25 * interp(env, i + 4 * lag));
    }
    sc *= Math.exp(-0.5 * (Math.log2(bpm / 120) / 0.9) ** 2);
    if (sc > bestScore) { bestScore = sc; bestLag = lag; }
  }
  // Pha: dịch lưới phách để tổng onset trên lưới lớn nhất
  let bestOff = 0, bestSum = -1;
  for (let off = 0; off < bestLag; off += 0.25) {
    let sum = 0;
    for (let t = off; t < env.length; t += bestLag) sum += interp(env, t);
    if (sum > bestSum) { bestSum = sum; bestOff = off; }
  }
  const beats: number[] = [];
  for (let t = bestOff; t < env.length; t += bestLag) {
    // Kéo nhẹ về đỉnh onset gần nhất (±2 khung)
    let bt = t, bv = interp(env, t);
    for (let d = -2; d <= 2; d++) { const v = env[Math.round(t) + d] ?? 0; if (v > bv * 1.3) { bv = v; bt = Math.round(t) + d; } }
    beats.push(Number((bt / fps).toFixed(3)));
  }
  // Phách mạnh: trong 4 pha, chọn pha có tổng onset lớn nhất
  let bestPhase = 0, phaseSum = -1;
  for (let ph = 0; ph < 4; ph++) {
    let sum = 0;
    for (let i = ph; i < beats.length; i += 4) sum += env[Math.round(beats[i] * fps)] ?? 0;
    if (sum > phaseSum) { phaseSum = sum; bestPhase = ph; }
  }
  return { bpm: Number(((60 * fps) / bestLag).toFixed(1)), beats, downbeats: beats.filter((_, i) => i % 4 === bestPhase) };
}

function interp(a: Float32Array, x: number): number {
  const i = Math.floor(x), f = x - i;
  return (a[i] ?? 0) * (1 - f) + (a[i + 1] ?? 0) * f;
}

/** Đọc file nhạc (mp3/wav), bỏ `startSec` giây đầu như lúc dựng, giới hạn `maxSec`. */
export function beatsOfFile(file: string, startSec = 0, maxSec = 90): BeatInfo {
  const r = spawnSync(ffmpegPath(), ['-v', 'error', ...(startSec ? ['-ss', String(startSec)] : []), '-t', String(maxSec), '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`Không đọc được nhạc ${file}: ${r.stderr?.toString()}`);
  const buf = r.stdout as Buffer;
  const len = Math.floor(buf.length / 4);
  return detectBeats(new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + len * 4)));
}
