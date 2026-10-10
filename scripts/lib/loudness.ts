/**
 * Âm thanh bản cuối (REQUIREMENTS v0.4 §8.3, §9.1): fade in/out 0.5 giây và chuẩn hóa loudness
 * −14 LUFS integrated, true peak ≤ −1 dBTP. Copy luồng video (không encode lại hình).
 */
import { runFfmpeg } from './hyperframes-env.ts';

export const TARGET_LUFS = -14;
/** Trần limiter ban đầu (dBFS mẫu ở 192 kHz). Nén AAC còn đẩy đỉnh lên 1.5–2.5 dB tuỳ bài, nên trần tự hạ theo số đo. */
const LIMIT_START_DB = -3;
/** Đỉnh sau nén phải ≤ mức này (chừa 0.2 dB dưới ngưỡng −1 dBTP của §9.1). */
const TP_SAFE_DB = -1.2;
export const FADE_SEC = 0.5;

export interface Loudness {
  integrated: number;
  truePeak: number;
}

export function measureLoudness(file: string): Loudness {
  const r = runFfmpeg(['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const summary = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  const i = /I:\s+(-?[\d.]+) LUFS/.exec(summary);
  const tp = /Peak:\s+(-?[\d.]+) dBFS/.exec(summary);
  if (!i || !tp) throw new Error(`Không đo được loudness của ${file}.`);
  return { integrated: Number(i[1]), truePeak: Number(tp[1]) };
}

/**
 * Chuẩn hóa âm thanh của `input` (mp4) → `output`, giữ nguyên hình.
 * Không dùng loudnorm: với nhạc thật nhiều đỉnh nhọn (chênh đỉnh/độ to ~18 dB), loudnorm phải chuyển sang chế độ
 * động, chỉ đạt ~−15 LUFS, và đỉnh vượt −1 dBTP sau khi đổi tần số mẫu + nén AAC (đo 2026-10-09, nhạc Mixkit).
 * Cách làm: tăng/giảm âm lượng → limiter ở tần số mẫu 192 kHz (bắt cả đỉnh giữa hai mẫu) → AAC, đo lại, chỉnh
 * độ lợi và trần limiter cho tới khi độ to lệch đích ≤ 0.3 LU và đỉnh ≤ −1.2 dBTP (tối đa 6 lượt). Limiter làm mất một phần độ to nên phải đo lại.
 */
export function normalizeAudio(input: string, output: string, durationSec: number, metadata: Record<string, string> = {}): Loudness {
  const meta = Object.entries(metadata).flatMap(([k, v]) => ['-metadata', `${k}=${v}`]);
  const fade = `afade=t=in:st=0:d=${FADE_SEC},afade=t=out:st=${Math.max(0, durationSec - FADE_SEC).toFixed(3)}:d=${FADE_SEC}`;
  let gain = TARGET_LUFS - measureLoudness(input).integrated;
  let ceilingDb = LIMIT_START_DB;
  let result: Loudness | undefined;
  for (let pass = 0; pass < 6; pass++) {
    const limit = Math.pow(10, ceilingDb / 20).toFixed(4);
    const chain = `${fade},volume=${gain.toFixed(2)}dB,aresample=192000,alimiter=limit=${limit}:attack=1:release=60:level=0:asc=1,aresample=48000`;
    const r = runFfmpeg(['-v', 'error', '-y', '-i', input, '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-af', chain, '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', ...meta, '-movflags', '+faststart', output]);
    if (r.status !== 0) throw new Error(`Chuẩn hóa âm thanh lỗi: ${r.stderr.slice(-500)}`);
    result = measureLoudness(output);
    const miss = TARGET_LUFS - result.integrated;
    const over = result.truePeak - TP_SAFE_DB;
    if (Math.abs(miss) <= 0.3 && over <= 0) break;
    gain += miss;
    if (over > 0) ceilingDb -= over + 0.1; // AAC đẩy đỉnh lên: hạ trần limiter đúng phần vượt
  }
  return result as Loudness;
}
