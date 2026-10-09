/**
 * Kiểm clip video thật trong kịch bản bằng ffprobe: clip phải đủ dài cho đoạn được dùng (clipStart + thời lượng),
 * và clip giữ tiếng gốc (TalkingHead, Testimonial) phải có luồng âm thanh.
 */
import { join } from 'node:path';
import type { Script } from '../../config/script.schema.ts';
import { isVideo, type PropsScene, timedScenes } from './build-props.ts';
import { REPO_ROOT, runFfprobe } from './hyperframes-env.ts';

export interface ClipIssue {
  level: 'error' | 'warning';
  message: string;
}

interface ClipInfo {
  durationSec: number;
  hasAudio: boolean;
  width: number;
  height: number;
}

export function probeClip(file: string): ClipInfo | undefined {
  const r = runFfprobe(['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]);
  if (r.status !== 0) return undefined;
  const info = JSON.parse(r.stdout) as {
    streams?: Array<{ codec_type: string; width?: number; height?: number; tags?: { rotate?: string }; side_data_list?: Array<{ rotation?: number }> }>;
    format?: { duration?: string };
  };
  const v = info.streams?.find((s) => s.codec_type === 'video');
  // Điện thoại hay lưu clip dọc dưới dạng khung ngang + cờ xoay 90°
  const rotation = v?.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? Number(v?.tags?.rotate ?? 0);
  const rotated = Math.abs(rotation) % 180 === 90;
  const [w, h] = rotated ? [v?.height ?? 0, v?.width ?? 0] : [v?.width ?? 0, v?.height ?? 0];
  return { durationSec: Number(info.format?.duration ?? 0), hasAudio: !!info.streams?.some((s) => s.codec_type === 'audio'), width: w, height: h };
}

/** Đoạn clip giữ tiếng nhưng file không có luồng âm thanh: bỏ tiếng (không tạo <audio>, không hạ nhạc). */
export function dropSilentClipAudio(scenes: PropsScene[]): void {
  for (const sc of scenes) {
    if (sc.shot?.audio && isVideo(sc.visual.src) && probeClip(join(REPO_ROOT, sc.visual.src))?.hasAudio === false) sc.shot.audio = false;
  }
}

/** Chỉ gọi khi mọi file hình/clip đã tồn tại (validate kiểm trước). */
export function clipIssues(script: Script): ClipIssue[] {
  const out: ClipIssue[] = [];
  const cache = new Map<string, ClipInfo | undefined>();
  const info = (src: string) => {
    if (!cache.has(src)) cache.set(src, probeClip(join(REPO_ROOT, src)));
    return cache.get(src);
  };
  const { scenes } = timedScenes(script);
  for (const sc of scenes) {
    if (sc.shot && isVideo(sc.visual.src)) {
      const c = info(sc.visual.src);
      if (!c) {
        out.push({ level: 'error', message: `Không đọc được clip "${sc.visual.src}" (file hỏng hoặc sai định dạng).` });
        continue;
      }
      const need = sc.shot.mediaStart + sc.shot.duration;
      if (c.durationSec + 0.05 < need) {
        out.push({ level: 'error', message: `Cảnh "${sc.id}": clip "${sc.visual.src}" dài ${c.durationSec.toFixed(1)}s, không đủ cho đoạn ${sc.shot.mediaStart}s → ${need.toFixed(1)}s. Rút ngắn cảnh hoặc đổi clipStart.` });
      }
      if (c.width > c.height) out.push({ level: 'warning', message: `Cảnh "${sc.id}": clip "${sc.visual.src}" quay ngang (${c.width}×${c.height}), video dọc sẽ cắt mất hai bên. Nên quay lại dọc.` });
      if (sc.shot.audio && !c.hasAudio) out.push({ level: 'warning', message: `Cảnh "${sc.id}": clip "${sc.visual.src}" không có tiếng, đoạn này chỉ có nhạc nền (nhạc không hạ).` });
    }
    for (const src of sc.visual.type === 'montage' ? (sc.visual.srcs ?? []) : []) {
      if (!isVideo(src)) continue;
      const c = info(src);
      const each = sc.duration / (sc.visual.srcs?.length ?? 1);
      if (c && c.durationSec + 0.05 < each) out.push({ level: 'error', message: `Cảnh "${sc.id}": clip "${src}" dài ${c.durationSec.toFixed(1)}s, ngắn hơn đoạn ${each.toFixed(1)}s trong montage.` });
    }
  }
  return out;
}
