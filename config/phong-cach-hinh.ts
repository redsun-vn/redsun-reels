/**
 * Phong cách hình của video dựng riêng (Nam 2026-10-16, docs/decisions.md §43): video lặp vì mọi video cùng một nét vẽ,
 * nên thêm trục phong cách hình độc lập với kiểu kể. Claude tự chọn theo brief ở bước concept (không hỏi MKT), ghi
 * `script.json` `concept.phongCachHinh`; chỉ video hoạt hình (`kieuHinh: minh-hoa`) được khác "thuong". Bộ dụng cụ:
 * templates/_rieng/phong-cach*.js; cách dựng: .claude/skills/dung-video/references/phong-cach-hinh.md. Chỉ dev sửa file này.
 */
import type { KieuHinh } from './ai-video.ts';
import type { KieuKe } from './kieu-ke.ts';

export const PHONG_CACH_HINH_IDS = ['thuong', 'comic', 'manga', 'sieu-anh-hung'] as const;
export type PhongCachHinh = (typeof PHONG_CACH_HINH_IDS)[number];

export interface PhongCachHinhInfo {
  ten: string;
  moTa: string;
  /** Dấu hiệu trong brief hợp phong cách này (gợi ý cho Claude, không phải luật). */
  hopVoi: string;
  /** Kiểu kể hay đi cùng (gợi ý). */
  kieuKeGoiY: readonly KieuKe[];
  /**
   * Mẫu nhịp của thể loại (Nam 2026-10-16: "chỉ thay nhân vật là không đủ"): chuỗi nhịp kịch bản phải có để video đậm chất
   * phong cách. Tự chấm kịch bản đối chiếu với mẫu này (tao-reel/references/script-format.md, mục "Tự chấm").
   */
  mauNhip: readonly string[];
  guardrails: readonly string[];
}

/** Luật chung của mọi phong cách truyện. */
const CHUNG = [
  'không giống nhân vật, trang phục hay biểu tượng có bản quyền (Marvel, DC, chữ S, nhân vật anime/manga có thật)',
  'khung va chạm, chớp sáng không quá 3 lần/giây',
  'chữ tượng thanh (Bangers) ≤ 3 từ, không che chữ chính; câu kịch bản vẫn Montserrat',
] as const;

export const PHONG_CACH_HINH: Record<PhongCachHinh, PhongCachHinhInfo> = {
  thuong: {
    ten: 'Thường (hoạt hình phẳng)',
    moTa: 'Nét vẽ phẳng hiện tại, chiều sâu và ánh sáng; không ô truyện, không chữ tượng thanh.',
    hopVoi: 'nội dung trang trọng, tin cậy, giới thiệu công ty; video người thật (luôn "thuong")',
    kieuKeGoiY: ['pov', 'meo-so-lieu'],
    mauNhip: [],
    guardrails: [],
  },
  comic: {
    ten: 'Truyện tranh (comic)',
    moTa: 'Trang chia ô viền mực, chấm halftone, bóng thoại viền đen, ô lời dẫn vàng, chữ tượng thanh, ô đập vào theo phách.',
    hopVoi: 'nhiều bước hoặc nhiều người, so sánh trước–sau, kể theo từng ô, drama văn phòng',
    kieuKeGoiY: ['drama-van-phong', 'tieu-pham', 'twist'],
    mauNhip: [
      'trang mở: 2–3 ô đập vào trên phách, ô cuối là điểm hấp dẫn',
      'mỗi nhịp kể là một ô; sang cảnh bằng lật trang (không kể đều trong một khung)',
      'ô lời dẫn vàng chuyển thời gian / nơi chốn; bóng thoại, bóng nghĩ viền mực',
      'chữ tượng thanh trên nền nổ ở cú nhấn (ô va chạm)',
      'trang tràn cho vỡ lẽ, nhân vật phá khung ô',
      'trang kết lặp bố cục trang mở, khép vòng',
    ],
    guardrails: CHUNG,
  },
  manga: {
    ten: 'Manga',
    moTa: 'Đen trắng + một màu nhấn (màn hình sản phẩm), screentone, đường dồn vào mặt, dấu cảm xúc phóng đại, đứng hình nghiêng.',
    hopVoi: 'cảm xúc phóng đại (sốc, ngượng, giận), người xem trẻ, drama tổng tài',
    kieuKeGoiY: ['tong-tai', 'twist', 'pov'],
    mauNhip: [
      'bình thường đen trắng screentone, ô xiên, có một chi tiết lệch',
      'cú sốc: ô cận mắt + đường dồn, máy đẩy vào',
      'phản ứng phóng đại: chibi, dấu cảm xúc (giọt mồ hôi, gân giận, u ám)',
      'nội tâm trước cú lật: bóng nghĩ hoặc hắc khí + "ẦM ẦM"',
      'cú lật: chớp trắng, đứng hình nghiêng',
      'lối thoát: sản phẩm là màu duy nhất / thế giới trở lại màu, nền lấp lánh thở phào',
    ],
    guardrails: CHUNG,
  },
  'sieu-anh-hung': {
    ten: 'Siêu anh hùng',
    moTa: 'Ngược sáng tia toả, nhân vật hạ cánh có áo choàng, mặt nạ, logo sản phẩm trên ngực, khung va chạm, bụi tung.',
    hopVoi: 'sản phẩm "giải cứu" khủng hoảng, chủ quán/đội sale hoá anh hùng nhờ sản phẩm',
    kieuKeGoiY: ['tieu-pham', 'twist', 'drama-van-phong'],
    mauNhip: [
      'hiểm hoạ: nỗi đau nhân cách hoá thành kẻ phản diện (hào quang, đe doạ)',
      'người hùng xuất hiện: đáp xuống, góc máy thấp, tia sáng',
      'biến hình khi có sản phẩm (người thường → người hùng)',
      'tuyệt chiêu: tính năng sản phẩm là đòn đánh (tia năng lượng)',
      'kẻ phản diện bị hạ (vỡ tan, khung va chạm)',
      'tư thế chiến thắng, áo choàng bay ở cảnh kết',
    ],
    guardrails: [...CHUNG, 'logo trên ngực là file có sẵn trong brand/logos, không vẽ lại, không đổi màu, không bóp méo'],
  },
};

/*
 * Không có bảng nhạc theo phong cách (Nam 2026-10-16: "nhạc cũng nên do Claude quyết định trong flow làm video, không fix cứng"):
 * Claude chọn nhạc cho từng video theo câu chuyện và nhịp dựng (tao-reel/references/script-format.md, mục "Tự chấm").
 */

/** Thiếu trường (kịch bản cũ) = "thuong". */
export const phongCachCua = (id: PhongCachHinh | undefined | null): PhongCachHinh => id ?? 'thuong';

/** Kiểu hình được dùng phong cách khác "thuong" (Nam 2026-10-16: chỉ hoạt hình). */
export const KIEU_HINH_PHONG_CACH: readonly KieuHinh[] = ['minh-hoa'];
