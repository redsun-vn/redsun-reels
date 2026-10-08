/**
 * Chống bịa nội dung (REQUIREMENTS v0.4 §6.2 "không bịa con số, giá, ưu đãi, lời khách hàng"):
 * đối chiếu chữ trong kịch bản với PHẦN NỘI DUNG của brief.md (MKT viết/duyệt; không tính frontmatter vì
 * `duration`, `occasion`… chỉ là thông số), cùng các ràng buộc riêng của BeforeAfter / Testimonial / Promo.
 */
import type { Script } from '../../config/script.schema.ts';
import { promoSequenceSec } from '../../config/promo-timing.ts';

export interface FactIssue {
  level: 'error' | 'warning';
  message: string;
}

const VIDEO_RE = /\.(mp4|mov|webm)$/i;

/** Hai kiểu đặt dấu thanh (cũ/mới) cùng một chữ: "hoá" = "hóa", "uỷ" = "ủy". Quy về kiểu mới. */
const TONE_PLACEMENT: Array<[RegExp, string]> = [
  [/oá/g, 'óa'],
  [/oà/g, 'òa'],
  [/oả/g, 'ỏa'],
  [/oã/g, 'õa'],
  [/oạ/g, 'ọa'],
  [/oé/g, 'óe'],
  [/oè/g, 'òe'],
  [/oẻ/g, 'ỏe'],
  [/oẽ/g, 'õe'],
  [/oẹ/g, 'ọe'],
  [/uý/g, 'úy'],
  [/uỳ/g, 'ùy'],
  [/uỷ/g, 'ủy'],
  [/uỹ/g, 'ũy'],
  [/uỵ/g, 'ụy'],
];

/** Gộp số: bỏ phân cách nghìn (". , dấu cách") giữa nhóm 3 chữ số và số 0 đầu: "1.200.000" → "1200000", "08/03" → "8/3". */
function normalizeNumbers(text: string): string {
  return text.replace(/(\d)[.,\s ](?=\d{3}\b)/g, '$1').replace(/\b0+(\d)/g, '$1');
}

/** Các con số trong chữ (đã gộp): "99.000đ" → "99000", "-30%" → "30". */
export function numberTokens(text: string): string[] {
  return normalizeNumbers(text).match(/\d+/g) ?? [];
}

/** Chữ thường, NFC, cùng kiểu dấu thanh, số đã gộp, bỏ dấu câu, gộp khoảng trắng; bọc khoảng trắng để so theo từ. */
export function normalizeText(text: string): string {
  let t = normalizeNumbers(text.normalize('NFC').toLowerCase());
  for (const [re, to] of TONE_PLACEMENT) t = t.replace(re, to);
  return t
    .replace(/[“”"'‘’«».,!?:;…()\-–—·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** `needle` có nằm nguyên cụm từ trong `haystack` không (cả hai đã normalizeText). */
function containsPhrase(haystack: string, needle: string): boolean {
  return (' ' + haystack + ' ').includes(' ' + needle + ' ');
}

export function factIssues(script: Script, briefBody: string): FactIssue[] {
  const out: FactIssue[] = [];
  const err = (message: string) => out.push({ level: 'error', message });
  const warn = (message: string) => out.push({ level: 'warning', message });
  const briefNumbers = new Set(numberTokens(briefBody));
  const briefNorm = normalizeText(briefBody);

  for (const s of script.scenes) {
    // Số trong chữ trên màn hình: cảnh báo (có thể là số bước, năm…), MKT xác nhận
    for (const text of [s.onScreenText, s.subText ?? '']) {
      const miss = numberTokens(text).filter((n) => !briefNumbers.has(n));
      if (miss.length) warn(`Cảnh "${s.id}" có số ${miss.join(', ')} không có trong brief. Hỏi MKT nguồn của số này, không tự đặt.`);
    }

    if (s.promo) {
      // Ưu đãi phải khớp NGUYÊN CỤM trong brief (kể cả đơn vị %, đ, ngày): "-20%" không mượn được "20/10"
      for (const field of ['badge', 'priceOld', 'priceNew', 'deadline'] as const) {
        const value = s.promo[field];
        if (value && !containsPhrase(briefNorm, normalizeText(value))) {
          err(`Cảnh "${s.id}": ${field} "${value}" không có nguyên văn trong brief. Giá/ưu đãi/hạn chót chỉ chép từ brief MKT đưa.`);
        }
      }
      const need = promoSequenceSec(s.promo);
      if (s.durationSec < need) err(`Cảnh "${s.id}" có khối khuyến mãi cần dài ít nhất ${need}s để hiện hết (badge, giá, đếm ngược, hạn chót).`);
      if (s.promo.countdownFrom && (s.promo.badge || s.promo.priceOld || s.promo.priceNew)) {
        err(`Cảnh "${s.id}": đếm ngược không đi cùng badge/giá trong một cảnh (không đủ chỗ). Tách thành 2 cảnh.`);
      }
      if (s.visual.type !== 'text' && s.visual.type !== 'asset') err(`Cảnh "${s.id}" có khối khuyến mãi chỉ dùng visual "text" hoặc "asset".`);
      if (script.template !== 'Promo') warn(`Cảnh "${s.id}" có "promo" nhưng template ${script.template} không hiện khối này (chỉ Promo).`);
    }

    if (s.attribution) {
      if (!containsPhrase(briefNorm, normalizeText(s.attribution))) {
        err(`Cảnh "${s.id}": tên khách "${s.attribution}" không có trong brief. Chỉ dùng khách thật MKT đưa (đã đồng ý xuất hiện).`);
      }
      if (!containsPhrase(briefNorm, normalizeText(s.onScreenText))) {
        warn(`Cảnh "${s.id}": câu quote không khớp nguyên văn lời khách trong brief. Chỉ rút gọn, không đổi ý; nhờ MKT xác nhận.`);
      }
      if (s.visual.type !== 'text' && s.visual.type !== 'asset') err(`Cảnh "${s.id}" có lời khách chỉ dùng visual "text" hoặc "asset".`);
      if (script.template !== 'Testimonial') warn(`Cảnh "${s.id}" có "attribution" nhưng template ${script.template} không hiện lower third (chỉ Testimonial).`);
    }

    if (s.visual.type === 'split') {
      if (!s.visual.srcAfter) err(`Cảnh "${s.id}" kiểu "split" cần cả ảnh trước (visual.src) và ảnh sau (visual.srcAfter).`);
      else if (s.visual.src && !VIDEO_RE.test(s.visual.src) && VIDEO_RE.test(s.visual.srcAfter)) {
        err(`Cảnh "${s.id}": split có ảnh "trước" là ảnh tĩnh thì ảnh "sau" cũng phải là ảnh (hoặc cả hai đều là clip).`);
      }
    }
  }

  if (script.videoType === 'khach-hang-noi' && !script.scenes.some((s) => s.attribution)) {
    err('Video "Khách hàng nói" cần ít nhất một cảnh có lời khách kèm tên (attribution).');
  }
  if (script.template === 'BeforeAfter' && !script.scenes.some((s) => s.role === 'problem')) {
    err('BeforeAfter cần cảnh "problem" (TRƯỚC) và cảnh "solution" (SAU).');
  }
  return out;
}
