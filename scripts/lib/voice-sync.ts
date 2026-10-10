/**
 * Giọng – hình (Nam 2026-10-10: "nếu không có giọng nói, mọi thứ đều tốt, có giọng thì thành video vớ vẩn"; chọn "giọng
 * ngoài khung"). Clip quay sẵn là người thật nói chuyện của họ: ghép giọng mình lên miệng họ thành lồng tiếng rẻ tiền.
 * Luật cho video có giọng: lời thoại đặt lên cảnh không thấy mặt người nói (bàn tay, sổ, ảnh, điện thoại); mặt người là
 * cảnh phản ứng im lặng (sổ nguồn khai `mieng: im`). Mặt người khác đang nghe (miệng im) trong lúc một vai nói thì được.
 */
import type { StockEntry } from './kieu-hinh-rules.ts';

export interface SyncLine {
  id: string;
  vai: string;
  camXuc: string;
  at: number;
  dur: number;
}

export interface FaceClip {
  src: string;
  start: number;
  end: number;
}

/** Thẻ <video src="quay-san/…"> trong composition và giờ hiện (data-start, data-duration). */
export function faceClips(html: string): FaceClip[] {
  const out: FaceClip[] = [];
  for (const m of html.matchAll(/<video\b[^>]*>/g)) {
    const tag = m[0];
    const src = /\bsrc="(quay-san\/[^"]+)"/.exec(tag)?.[1];
    const start = Number(/\bdata-start="([\d.]+)"/.exec(tag)?.[1]);
    const dur = Number(/\bdata-duration="([\d.]+)"/.exec(tag)?.[1]);
    if (src && Number.isFinite(start) && Number.isFinite(dur)) out.push({ src, start, end: start + dur });
  }
  return out;
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

export function voiceFaceIssues(lines: SyncLine[], clips: FaceClip[], log: Map<string, StockEntry>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const c of clips) {
    const e = log.get(c.src);
    if (!e || !e.camXuc || e.camXuc === 'khong-mat') continue;
    if (e.mieng !== 'im' && !seen.has(c.src)) {
      seen.add(c.src);
      out.push(`Clip "${c.src}" ${e.mieng === 'noi' ? 'là đoạn người mẫu đang nói' : 'chưa khai miệng (--mieng=im|noi)'}: video có giọng chỉ dùng mặt im lặng (cười, khóc, nhíu mày, nghe), không thì thành lồng tiếng.`);
    }
    for (const l of lines) {
      if (l.vai !== e.vai) continue;
      const ov = overlap(l.at, l.at + l.dur, c.start, c.end);
      if (ov > 0.12) out.push(`Câu "${l.id}" (giọng ${l.vai}, ${l.at}–${(l.at + l.dur).toFixed(2)}s) trùng ${ov.toFixed(2)}s lúc thấy mặt ${e.vai} (${c.src}): đặt lời lên cảnh không thấy mặt người nói, mặt người chỉ là cảnh phản ứng trước/sau câu.`);
    }
  }
  return out;
}
