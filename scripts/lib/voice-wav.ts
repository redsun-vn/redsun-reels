/**
 * Bản giọng dạng WAV (PCM 16-bit mono 24 kHz trong dự án): đổi định dạng, đo trên máy (miễn phí), bỏ bản hỏng, cắt lặng.
 */
import { VOICE } from '../../config/voice.ts';
import { spokenText } from './voice-script.ts';

/** Bọc PCM 16-bit mono thành WAV (Gemini Pro TTS trả PCM thô, Flash trả WAV sẵn). */
export function pcmToWav(pcm: Buffer, sampleRate: number = VOICE.sampleRate): Buffer {
  if (pcm.subarray(0, 4).toString('ascii') === 'RIFF') return pcm;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24); h.writeUInt32LE(sampleRate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export interface TakeAudio {
  thoiLuong: number;
  /** Mức to nhất và trung bình (dBFS), độ chênh to–nhỏ giữa các đoạn 100 ms có tiếng (dB): đọc đều thì chênh ít. */
  dinhDb: number;
  tbDb: number;
  doChenhDb: number;
}

/** Đo bản giọng trên máy (WAV PCM 16-bit mono), miễn phí, trước khi gửi máy chấm. */
export function measureTake(wav: Buffer): TakeAudio {
  // Tìm khối data (WAV từ model có thể có thêm khối khác trước data)
  let o = 12, rate = 24000, data = wav.subarray(44);
  while (o + 8 <= wav.length) {
    const id = wav.toString('ascii', o, o + 4), size = wav.readUInt32LE(o + 4);
    if (id === 'fmt ') rate = wav.readUInt32LE(o + 12);
    if (id === 'data') { data = wav.subarray(o + 8, o + 8 + size); break; }
    o += 8 + size + (size % 2);
  }
  const n = Math.floor(data.length / 2), win = Math.max(1, Math.round(rate / 10));
  let peak = 0, sum = 0;
  const frames: number[] = [];
  for (let i = 0; i < n; i += win) {
    let s = 0, m = 0;
    for (let j = i; j < Math.min(n, i + win); j++) {
      const v = data.readInt16LE(j * 2) / 32768;
      s += v * v;
      m = Math.max(m, Math.abs(v));
    }
    sum += s;
    peak = Math.max(peak, m);
    frames.push(10 * Math.log10(s / Math.min(win, n - i) + 1e-12));
  }
  const db = (x: number) => 20 * Math.log10(x + 1e-12);
  const voiced = frames.filter((f) => f > -45).sort((a, b) => a - b);
  const q = (p: number) => voiced[Math.min(voiced.length - 1, Math.floor(p * voiced.length))] ?? -90;
  return { thoiLuong: n / rate, dinhDb: Number(db(peak).toFixed(1)), tbDb: Number((10 * Math.log10(sum / Math.max(1, n) + 1e-12)).toFixed(1)), doChenhDb: Number((q(0.95) - q(0.1)).toFixed(1)) };
}

/** Bản hỏng rõ ràng (câm, quá ngắn/dài so với số chữ, rè vỡ tiếng): bỏ, không gửi máy chấm. */
/** `maxSec`: chỗ trống của câu trong video (đến câu kế tiếp / cuối video); bản dài hơn bị bỏ. */
export function takeAudioIssues(a: TakeAudio, loi: string, maxSec = Number.POSITIVE_INFINITY): string[] {
  const words = spokenText(loi).split(/\s+/).filter(Boolean).length;
  const tags = (loi.match(/\[[^\]]*\]/g) ?? []).length;
  const out: string[] = [];
  if (a.tbDb < -40) out.push('gần như câm');
  if (a.thoiLuong < Math.max(0.5, words * 0.12)) out.push(`quá ngắn (${a.thoiLuong.toFixed(1)}s cho ${words} chữ)`);
  if (a.thoiLuong > words * 0.9 + 1.5 * tags + 2) out.push(`quá dài (${a.thoiLuong.toFixed(1)}s cho ${words} chữ, có thể đọc thừa)`);
  if (a.dinhDb > -0.1) out.push('vỡ tiếng');
  if (a.thoiLuong > maxSec + 0.15) out.push(`dài ${a.thoiLuong.toFixed(1)}s, quá chỗ trống ${maxSec.toFixed(1)}s trước câu sau`);
  return out;
}

/** Cắt khoảng lặng đầu và cuối bản giọng (dưới −40 dBFS), chừa 0,05 giây, để câu vừa chỗ trống trong video. */
export function trimSilence(wav: Buffer, thresholdDb = -40): Buffer {
  let o = 12, rate = 24000, start = 44, size = wav.length - 44;
  while (o + 8 <= wav.length) {
    const id = wav.toString('ascii', o, o + 4), sz = wav.readUInt32LE(o + 4);
    if (id === 'fmt ') rate = wav.readUInt32LE(o + 12);
    if (id === 'data') { start = o + 8; size = Math.min(sz, wav.length - start); break; }
    o += 8 + sz + (sz % 2);
  }
  const n = Math.floor(size / 2), win = Math.round(rate / 100), thr = 10 ** (thresholdDb / 20);
  const loud = (i: number) => {
    let m = 0;
    for (let j = i; j < Math.min(n, i + win); j++) m = Math.max(m, Math.abs(wav.readInt16LE(start + j * 2) / 32768));
    return m > thr;
  };
  let a = 0, b = n;
  while (a < n && !loud(a)) a += win;
  while (b > a && !loud(Math.max(0, b - win))) b -= win;
  const pad = Math.round(rate * 0.05);
  a = Math.max(0, a - pad);
  b = Math.min(n, b + pad);
  if (b - a < rate * 0.2) return wav;
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + (b - a) * 2, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE((b - a) * 2, 40);
  return Buffer.concat([h, wav.subarray(start + a * 2, start + b * 2)]);
}

/**
 * WAV bất kỳ (VieNeu có thể trả 48 kHz / stereo / 32-bit) → PCM 16-bit mono 24 kHz như mọi bản giọng khác (đo, cắt lặng,
 * gửi máy chấm). Đổi tần số bằng nội suy tuyến tính (đủ cho giọng nói).
 */
export function toMono24k(wav: Buffer, rateOut = VOICE.sampleRate): Buffer {
  let o = 12, rate = 24000, ch = 1, bits = 16, fmt = 1, start = 44, size = wav.length - 44;
  while (o + 8 <= wav.length) {
    const id = wav.toString('ascii', o, o + 4), sz = wav.readUInt32LE(o + 4);
    if (id === 'fmt ') { fmt = wav.readUInt16LE(o + 8); ch = wav.readUInt16LE(o + 10); rate = wav.readUInt32LE(o + 12); bits = wav.readUInt16LE(o + 22); }
    if (id === 'data') { start = o + 8; size = Math.min(sz, wav.length - start); break; }
    o += 8 + sz + (sz % 2);
  }
  if (fmt === 1 && ch === 1 && bits === 16 && rate === rateOut) return wav;
  const bytes = bits / 8, n = Math.floor(size / (bytes * ch));
  const sample = (i: number) => {
    let s = 0;
    for (let c = 0; c < ch; c++) {
      const p = start + (i * ch + c) * bytes;
      s += fmt === 3 ? wav.readFloatLE(p) : bits === 16 ? wav.readInt16LE(p) / 32768 : bits === 32 ? wav.readInt32LE(p) / 2147483648 : (wav.readUInt8(p) - 128) / 128;
    }
    return s / ch;
  };
  const m = Math.floor((n * rateOut) / rate), out = Buffer.alloc(m * 2);
  for (let j = 0; j < m; j++) {
    const x = (j * rate) / rateOut, i = Math.floor(x), f = x - i;
    const v = sample(Math.min(n - 1, i)) * (1 - f) + sample(Math.min(n - 1, i + 1)) * f;
    out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), j * 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + out.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rateOut, 24); h.writeUInt32LE(rateOut * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(out.length, 40);
  return Buffer.concat([h, out]);
}
