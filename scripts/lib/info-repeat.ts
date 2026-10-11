/**
 * Thông tin không lặp lại (Nam 2026-10-11: "quy tắc là thông tin không lặp lại, thông điệp phải xuyên suốt"): tìm hai câu
 * ở hai cảnh khác nhau (chữ trên hình hoặc lời đọc) trùng phần lớn chữ có nghĩa, vd. hook "Ảnh chuyển khoản này… là GIẢ!"
 * và cảnh lộ ra "Ảnh chuyển khoản mà không phải chuyển khoản thật." Máy chỉ bắt trùng chữ; trùng ý khác chữ do Claude soát
 * theo cột "thông tin mới của cảnh" khi tự chấm.
 */

/** Chữ đệm, hư từ và tên sản phẩm: không tính khi so (tên sản phẩm lặp lại là đúng). */
const SKIP = new Set(
  ('là mà này kia đó thì và với của có cho một những các được đã đang sẽ rồi nha nhé ạ ơi à ừ vậy thế giờ còn cũng ' +
    'không chẳng phải hóa hoá ra lại đi vẫn rất quá luôn khi lúc ai gì sao nào bạn mình em anh chị ' +
    'sipos redsun bos webino').split(' '),
);

export function contentWords(text: string): Set<string> {
  const words = text.normalize('NFC').toLowerCase().replace(/\[[^\]]*\]/g, ' ').split(/[^\p{L}\p{N}]+/u);
  return new Set(words.filter((w) => w.length > 1 && !SKIP.has(w)));
}

export interface SceneText {
  scene: string;
  text: string;
}

export interface Repeat {
  a: SceneText;
  b: SceneText;
  shared: string[];
}

/**
 * Cặp câu ở hai cảnh khác nhau có ≥ `ratio` số chữ có nghĩa của câu ngắn hơn trùng nhau (câu ngắn hơn cần ≥ 3 chữ có nghĩa,
 * để câu quá ngắn như "Đã thanh toán" không báo nhầm).
 */
export function repeatedInfo(texts: SceneText[], ratio = 0.6): Repeat[] {
  const out: Repeat[] = [];
  const sets = texts.map((t) => contentWords(t.text));
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      if (texts[i].scene === texts[j].scene) continue;
      const [small, big] = sets[i].size <= sets[j].size ? [sets[i], sets[j]] : [sets[j], sets[i]];
      if (small.size < 3) continue;
      const shared = [...small].filter((w) => big.has(w));
      if (shared.length / small.size >= ratio) out.push({ a: texts[i], b: texts[j], shared });
    }
  return out;
}
