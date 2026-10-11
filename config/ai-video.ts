/**
 * Kiểu hình của video (REQUIREMENTS v0.5 §7.4–7.5): `minh-hoa` = nhân vật vẽ + bối cảnh vẽ (bản hiện tại),
 * `nguoi-that-ai` = cảnh có người thật do AI tạo, bắt buộc gắn nhãn AI,
 * `nguoi-that-quay-san` = clip người thật quay sẵn từ Pexels/Pixabay (không phải AI, theo giấy phép nguồn).
 * Chỉ dev (Nam) sửa file này.
 */
export const KIEU_HINH = ['minh-hoa', 'nguoi-that-ai', 'nguoi-that-quay-san'] as const;
export type KieuHinh = (typeof KIEU_HINH)[number];

/**
 * Cách tạo người cho video `nguoi-that-ai` (Nam 2026-10-11: "cho phép chọn cả hai loại này"), MKT chọn, ghi `cachTaoAi`
 * trong brief:
 * - `anh-vai`: ảnh tham chiếu mỗi vai (người duyệt mặt) → khung đầu mỗi cảnh → clip từ khung đầu (`videoModel`, Kling).
 *   Mặt giữ y hệt suốt video, rẻ hơn; phần lớn khung là ảnh + chuyển động máy quay, 1–2 khoảnh khắc cử động thật.
 * - `tu-chu`: clip tạo thẳng từ mô tả, nhiều cảnh trong một lần tạo (`textVideoModel`, Seedance 2.0 Fast). Không cần ảnh
 *   nhân vật, người cử động ở mọi cảnh; mặt giữa các lần tạo gần giống nhưng không y hệt, đắt hơn.
 */
export const CACH_TAO_AI = ['anh-vai', 'tu-chu'] as const;
export type CachTaoAi = (typeof CACH_TAO_AI)[number];

export const AI_VIDEO = {
  /** Nam bật 2026-10-11 ("cần làm video cảnh người thật do AI dựng", M5): lệnh ./reel ai, key OpenRouter, trần chi. Tắt thì mọi video "nguoi-that-ai" bị chặn dựng. */
  enabled: true,
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
  /** Kế hoạch cảnh AI của video (dàn vai + cảnh theo số khung bang-canh.txt), Claude viết; ./reel ai đọc. */
  specFile: 'canh-ai.json',
  /**
   * Nhà cung cấp: OpenRouter (Nam 2026-10-11), một API cho nhiều model; đổi model = đổi id ở đây. Giới hạn model (giây,
   * khung hình, kích thước) đọc lúc chạy từ GET /videos/models. Key: OPENROUTER_API_KEY trong .env.
   */
  openrouter: {
    base: 'https://openrouter.ai/api/v1',
    /**
     * Nam 2026-10-11: chọn Seedance 2.0, nhưng Seedance từ chối ảnh khung đầu có người trông như thật
     * (InputImageSensitiveContentDetected.PrivacyInformation) → Nam đổi sang Kling 3.0 Std ($0,084/giây, 720×1280).
     */
    videoModel: 'kwaivgi/kling-v3.0-std',
    /**
     * Cảnh tạo thẳng từ chữ, không ảnh nhân vật (Nam 2026-10-11: "viết lại kịch bản dành riêng cho Seedance, không cần ảnh
     * nhân vật"): một lần tạo nhiều cảnh liền (tối đa 15 giây) giữ cùng nhân vật. Nam chọn bản Fast 720p (trong trần 50.000đ).
     */
    textVideoModel: 'bytedance/seedance-2.0-fast',
    /** Ảnh tham chiếu vai và khung đầu mỗi cảnh (rẻ, ~470đ/ảnh). */
    imageModel: 'bytedance-seed/seedream-5-0-flash',
    /** 720p dọc (Kling $0,084/giây → clip 4 giây ~8.700đ; Seedance tính theo token: rộng × cao × 24 × giây ÷ 1024). */
    videoSize: '720x1280',
    imageAspect: '9:16',
    imageResolution: '2K',
    /** Ước giá một ảnh khi chưa có giá thật (so trần trước khi gửi); chi thật lấy từ usage.cost. */
    imageEstimateUsd: 0.05,
    /** Hỏi kết quả mỗi chừng này giây, chờ tối đa chừng này phút rồi dừng (giữ mã việc, lần sau hỏi tiếp). */
    pollSec: 10,
    maxWaitMin: 20,
  },
  /**
   * Câu luôn gắn vào mô tả gửi model (REQUIREMENTS §7.4, luật cứng chon-kieu-hinh 4 và 6): người thường không có danh tính,
   * không nói, không chữ/logo/màn hình đọc được. Claude không bỏ câu này.
   */
  promptRules:
    'Photorealistic, ordinary Vietnamese people (not celebrities, not any real identifiable person), everyday Vietnamese setting. ' +
    'Mouth closed, not speaking, no lip movement. No text, no letters, no numbers, no logos, no brand names, no watermark. ' +
    'Any phone or screen is blank or turned away (no readable interface). Natural light, realistic skin, anatomically correct: each person has exactly two arms and two hands, five fingers per hand, no extra or merged limbs.',
} as const;

/**
 * Nhãn AI theo nội dung AI có trong video (REQUIREMENTS v0.6): hình người thật do AI tạo, giọng đọc do AI tạo, hoặc cả hai.
 * Không có nội dung AI → null (không cần nhãn).
 */
export function aiLabelFor(hinh: boolean, giong: boolean): { label: string; caption: string } | null {
  if (!hinh && !giong) return null;
  // Chữ trên hình: Nam chốt 2026-10-10 "chỉ nên ghi là: Do AI sản xuất"; caption ghi rõ phần nào do AI
  const detail = hinh && giong ? 'Video có hình ảnh và giọng đọc do AI tạo' : hinh ? AI_VIDEO.label : 'Video có giọng đọc do AI tạo';
  return { label: AI_LABEL_ON_SCREEN, caption: `⚠️ ${detail}.` };
}

/** Chữ nhãn AI trên hình (mọi video có nội dung AI). */
export const AI_LABEL_ON_SCREEN = 'Do AI sản xuất';
