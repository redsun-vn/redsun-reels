/**
 * Clip người thật quay sẵn (REQUIREMENTS v0.5 §7.5, kiểu hình `nguoi-that-quay-san`). Chỉ dev (Nam) sửa file này.
 * Giấy phép (đọc 2026-10-10): Pexels — dùng thương mại, quảng cáo, sửa được, không cần ghi nguồn; cấm để người trong
 * hình xuất hiện xấu/xúc phạm, cấm ngụ ý họ ủng hộ sản phẩm. Pixabay Content License — cấm dùng gây hiểu nhầm,
 * cấm dùng người nhận ra được theo cách trái đạo đức/pháp luật, cấm nội dung có logo/thương hiệu khác cho hàng hoá dịch vụ.
 */
export const STOCK_FOOTAGE = {
  sources: [
    { id: 'pexels', host: /(^|\.)pexels\.com$/, license: 'Pexels License', licenseUrl: 'https://www.pexels.com/license/' },
    { id: 'pixabay', host: /(^|\.)pixabay\.com$/, license: 'Pixabay Content License', licenseUrl: 'https://pixabay.com/service/license-summary/' },
  ],
  /** Thư mục clip trong briefs/<tên>/ (không commit: repo công khai không được phát tán lại clip) và sổ nguồn. */
  dir: 'quay-san',
  logFile: 'nguon.json',
  extensions: ['.mp4', '.mov', '.webm', '.jpg', '.jpeg', '.png'],
} as const;

/**
 * Cảm xúc trên mặt người trong clip (cùng bộ với nét mặt nhân vật minh hoạ `RS.MOODS`), thêm `khong-mat` cho cận bàn tay/
 * sau lưng (người không nhận ra được, dùng cho vai xấu). Nam 2026-10-10: "nhân vật chưa đủ, cảm xúc chưa đúng… tập trung
 * vào nhân vật, cảm xúc" — mỗi clip khai vai, người mẫu và cảm xúc mà Claude đã thấy trên mặt.
 */
export const CAM_XUC = ['binh-thuong', 'cuoi', 'tap-trung', 'nhiu-may', 'lo-lang', 'nghi', 'sung-sot', 'buon', 'nhe-nhom', 'tu-tin', 'khong-mat'] as const;
export type CamXuc = (typeof CAM_XUC)[number];
