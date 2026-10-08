/**
 * Âm thanh bản cuối (REQUIREMENTS v0.4 §8.3, §9.1): fade in/out 0.5 giây và chuẩn hóa loudness
 * −14 LUFS integrated, true peak ≤ −1 dBTP. Dùng ffmpeg loudnorm 2 lượt, copy luồng video (không encode lại hình).
 */
import { runFfmpeg } from './hyperframes-env.ts';

export const TARGET_LUFS = -14;
export const TARGET_TP = -1.5; // đích loudnorm thấp hơn ngưỡng −1 dBTP để còn biên an toàn sau encode AAC
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

/** Chuẩn hóa âm thanh của `input` (mp4) → `output`, giữ nguyên hình. */
export function normalizeAudio(input: string, output: string, durationSec: number): Loudness {
  const fade = `afade=t=in:st=0:d=${FADE_SEC},afade=t=out:st=${Math.max(0, durationSec - FADE_SEC).toFixed(3)}:d=${FADE_SEC}`;
  const first = runFfmpeg(['-hide_banner', '-nostats', '-i', input, '-vn', '-af', `${fade},loudnorm=I=${TARGET_LUFS}:TP=${TARGET_TP}:LRA=11:print_format=json`, '-f', 'null', '-']);
  const json = /\{[\s\S]*?"input_i"[\s\S]*?\}/.exec(first.stderr);
  if (first.status !== 0 || !json) throw new Error(`Đo loudness lượt 1 lỗi: ${first.stderr.slice(-500)}`);
  const m = JSON.parse(json[0]) as Record<string, string>;
  const second = [
    `${fade}`,
    `loudnorm=I=${TARGET_LUFS}:TP=${TARGET_TP}:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  ].join(',');
  const r = runFfmpeg(['-v', 'error', '-y', '-i', input, '-map', '0:v:0', '-map', '0:a:0', '-c:v', 'copy', '-af', second, '-c:a', 'aac', '-ar', '48000', '-b:a', '192k', '-movflags', '+faststart', output]);
  if (r.status !== 0) throw new Error(`Chuẩn hóa âm thanh lỗi: ${r.stderr.slice(-500)}`);
  return measureLoudness(output);
}
