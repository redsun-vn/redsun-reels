/**
 * Kiểu hình của video (REQUIREMENTS v0.5 §7.4–7.5): `minh-hoa` = nhân vật vẽ + bối cảnh vẽ (bản hiện tại),
 * `nguoi-that-ai` = cảnh có người thật do AI tạo, bắt buộc gắn nhãn AI,
 * `nguoi-that-quay-san` = clip người thật quay sẵn từ Pexels/Pixabay (không phải AI, theo giấy phép nguồn).
 * Chỉ dev (Nam) sửa file này.
 */
export const KIEU_HINH = ['minh-hoa', 'nguoi-that-ai', 'nguoi-that-quay-san'] as const;
export type KieuHinh = (typeof KIEU_HINH)[number];

export const AI_VIDEO = {
  /** Bật khi xong M5 (lệnh tạo cảnh AI, API key, mức chi). Tắt thì mọi video "nguoi-that-ai" bị chặn dựng. */
  enabled: false,
  /** Nhãn trên hình, hiện từ khung đầu đến hết video (Nghị định 142/2026/NĐ-CP Điều 18). Câu chữ chờ Nam chốt. */
  label: 'Video có hình ảnh do AI tạo',
  /** Câu đầu caption khi đăng. */
  captionLabel: '⚠️ Video có hình ảnh do AI tạo.',
  /** Nhắc bật khai báo AI của nền tảng (trong post.md). */
  platformNote: 'Khi đăng: bật khai báo nội dung AI của nền tảng (TikTok: "Nội dung do AI tạo"; YouTube: "Nội dung bị thay đổi hoặc tổng hợp"; Facebook/Instagram: nhãn "Thông tin về AI").',
  /** Thẻ siêu dữ liệu ghi vào file MP4 xuất (dấu máy đọc được). */
  metadataComment: 'AI-generated content: Video có hình ảnh do AI tạo (redsun-reels)',
  /** Loại video cấm dùng người thật do AI tạo: cần lời, khuôn mặt, sự kiện hay đội ngũ thật. */
  forbiddenVideoTypes: ['khach-hang-noi', 'video-co-nguoi-noi', 'tong-ket-su-kien', 'tuyen-dung', 'gioi-thieu-cong-ty'],
  /** Thư mục cảnh AI trong briefs/<tên>/ và nhật ký tạo (model, mô tả, chi phí từng file). */
  dir: 'ai',
  logFile: 'nhat-ky.json',
} as const;
