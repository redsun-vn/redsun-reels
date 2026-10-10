/**
 * Giọng đọc AI (REQUIREMENTS v0.6 §8.5, skill giong-doc). Nam 2026-10-10: giọng miền Nam, mỗi nhân vật một giọng, giới tính
 * khớp người trên hình; nguồn giọng VieNeu ("nguồn TTS tiếng Việt tốt nhất"), không dùng Gemini cho giọng nữa (giọng VieNeu
 * đã chuẩn tiếng Việt, chọn đúng giọng vùng từ danh mục; người nghe duyệt bản cuối). Chỉ dev sửa file này.
 */
export const VOICE = {
  /**
   * VieNeu Cloud API (docs.vieneu.io, đọc 2026-10-10): POST /audio/speech trả WAV; không nhận ghi chú đạo diễn — cảm xúc
   * đến từ chọn giọng, `emotion` (natural | storytelling), từ cảm thán, dấu câu và 3 thẻ chèn [cười] [thở dài] [hắng giọng].
   * Tính tiền theo ký tự: token = max(50, số ký tự) × 3 (v4) × 1.3; hạn mức theo gói (ngày/tuần), 300 lượt/phút.
   */
  vieneu: {
    base: 'https://api.vieneu.io/api/v1',
    model: 'vieneu-v4',
    engine: 'v4',
    sampleRate: 24000,
    minChars: 50,
    tokenPerChar: 3 * 1.3,
    /** Thẻ của mình → thẻ VieNeu hiểu; thẻ khác bị bỏ (VieNeu đọc thành chữ). */
    tags: { 'cười': '[cười]', 'cười lớn': '[cười]', 'thở dài': '[thở dài]', 'thở phào': '[thở dài]', 'thở phào thật dài': '[thở dài]', 'nghẹn': '[thở dài]', 'hắng giọng': '[hắng giọng]' } as Record<string, string>,
  },
  /** Mỗi câu tạo lại tối đa chừng này lần khi bản tạo ra hỏng (câm, quá dài so với chỗ trống…), kiểm trên máy. */
  maxTries: 3,
  sampleRate: 24000,
  /** Đường dẫn trong briefs/<tên>/dung-rieng/. */
  file: 'loi-doc.json',
  dir: 'giong',
  logFile: 'nhat-ky.json',
  marker: '<!-- GIONG-DOC -->',
  /** Track của thẻ giọng trong bản dựng (dưới tiếng động 20+, trên clip 10–19). */
  trackStart: 60,
  /** Nhạc nền hạ xuống mức này khi có lời (và 0.15 giây trước/sau). */
  duckLevel: 0.3,
} as const;

/** Từ cảm thán miền Nam gợi ý theo cảm xúc (skill giong-doc dùng khi viết lời đọc). */
export const SOUTHERN_INTERJECTIONS: Record<string, string[]> = {
  'lo-lang': ['Trời đất ơi!', 'Chết rồi!', 'Ủa?', 'Sao kỳ vậy ta?', '…vậy nè?!'],
  'sung-sot': ['Hả?!', 'Ủa?!', 'Trời!', 'Thiệt hả?'],
  'nhiu-may': ['Ủa…', 'Kỳ ghê…', 'Sao vậy ta?'],
  buon: ['Thôi rồi…', 'Haizz…'],
  'nhe-nhom': ['Phù…', 'Hú hồn!', 'Đỡ quá trời!'],
  cuoi: ['Woa!', 'Quá đã!', 'Ha ha', '…luôn á!', 'quá trời!'],
  'tu-tin': ['Vậy đó!', 'Dễ ợt!', 'Ngon lành!'],
};
