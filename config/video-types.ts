/**
 * 20 loại video (REQUIREMENTS v0.4 §7.2; chi tiết ở docs/video-type-guide.md).
 * Mỗi loại khai: template, độ dài, thứ tự vai trò cảnh, góc hook gợi ý, phong cách mặc định / gợi ý / nên tránh, mood nhạc.
 */
import { z } from 'zod';
import { OCCASIONS } from './occasions.ts';
import { STYLE_IDS, type StyleId } from './styles.ts';

export const TEMPLATE_IDS = [
  'FeatureLaunch',
  'TipOfTheDay',
  'BeforeAfter',
  'Testimonial',
  'Promo',
  'EventRecap',
  'Stats',
  'TalkingHead',
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const SCENE_ROLES = ['hook', 'problem', 'solution', 'proof', 'cta'] as const;
export type SceneRole = (typeof SCENE_ROLES)[number];

export const PRODUCT_IDS = ['sipos', 'bos', 'webino', 'redsun'] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const HOOK_ANGLES = ['con-so', 'lat-nguoc', 'truoc-sau', 'thuong-hieu', 'sap-thay-doi', 'cau-hoi-noi-dau', 'quote'] as const;

const StyleIdSchema = z.enum(STYLE_IDS);

export const VideoTypeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string(),
    templates: z.array(z.enum(TEMPLATE_IDS)).min(1),
    minSec: z.number().min(7),
    maxSec: z.number().max(60),
    /** Thứ tự vai trò cảnh mặc định; `repeat` cho phép lặp vai trò đó nhiều cảnh. */
    roles: z.array(z.enum(SCENE_ROLES)).min(2),
    repeatRole: z.enum(SCENE_ROLES).optional(),
    hookAngles: z.array(z.enum(HOOK_ANGLES)),
    defaultStyle: StyleIdSchema,
    suggestedStyles: z.array(StyleIdSchema),
    avoidStyles: z.array(StyleIdSchema),
    /** `nhac-nen`: nhạc nền nhẹ dưới chữ; `nhac-nang-luong`: nhạc làm chủ đạo. Cảnh vẫn tính thời lượng theo độ dài chữ. */
    music: z.enum(['nhac-nen', 'nhac-nang-luong']),
    /** Giữ âm thanh gốc của clip quay thật (khách hàng, người nói trước camera). */
    keepClipAudio: z.boolean(),
    products: z.array(z.enum(PRODUCT_IDS)).min(1),
    /** Nhãn nhỏ trên chữ hook (TipOfTheDay), vd. "Bạn có biết?". Bỏ trống = không có nhãn. */
    hookTag: z.string().optional(),
  })
  .refine((t) => t.minSec < t.maxSec, 'minSec phải nhỏ hơn maxSec')
  .refine((t) => !t.avoidStyles.includes(t.defaultStyle), 'phong cách mặc định không được nằm trong danh sách nên tránh')
  .refine((t) => t.suggestedStyles.every((s) => !t.avoidStyles.includes(s)), 'phong cách gợi ý không được nằm trong danh sách nên tránh');

export type VideoType = z.infer<typeof VideoTypeSchema>;

const ALL: ProductId[] = ['sipos', 'bos', 'webino'];
const TRUST_AVOID: StyleId[] = ['glitch-cyberpunk', 'bi-an', 'hanh-dong'];
const UI_AVOID: StyleId[] = ['glitch-cyberpunk', 'hanh-dong'];

export const VIDEO_TYPES: readonly VideoType[] = [
  { id: 'ra-mat-tinh-nang', name: 'Ra mắt tính năng', templates: ['FeatureLaunch'], minSec: 20, maxSec: 45, roles: ['hook', 'problem', 'solution', 'cta'], hookAngles: ['cau-hoi-noi-dau', 'sap-thay-doi'], defaultStyle: 'toi-gian', suggestedStyles: ['tuong-lai', 'robot-cong-nghe'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ALL },
  { id: 'demo-san-pham', name: 'Demo thao tác', templates: ['FeatureLaunch'], minSec: 30, maxSec: 60, roles: ['hook', 'solution', 'cta'], repeatRole: 'solution', hookAngles: ['con-so'], defaultStyle: 'toi-gian', suggestedStyles: ['du-lieu'], avoidStyles: UI_AVOID, music: 'nhac-nen', keepClipAudio: false, products: ALL },
  { id: 'meo-hay', name: 'Mẹo / "Bạn có biết?"', templates: ['TipOfTheDay'], minSec: 15, maxSec: 30, roles: ['hook', 'solution', 'cta'], hookAngles: ['lat-nguoc'], defaultStyle: 'vui-nhon', suggestedStyles: ['toi-gian', 'bi-an'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ['sipos', 'bos'], hookTag: 'Bạn có biết?' },
  { id: 'huong-dan-nhieu-buoc', name: 'Hướng dẫn 3–5 bước', templates: ['TipOfTheDay'], minSec: 30, maxSec: 60, roles: ['hook', 'solution', 'cta'], repeatRole: 'solution', hookAngles: ['con-so'], defaultStyle: 'toi-gian', suggestedStyles: ['thu-cong'], avoidStyles: UI_AVOID, music: 'nhac-nen', keepClipAudio: false, products: ALL, hookTag: 'Hướng dẫn' },
  { id: 'truoc-sau', name: 'Trước / sau', templates: ['BeforeAfter'], minSec: 15, maxSec: 30, roles: ['hook', 'problem', 'solution', 'proof', 'cta'], hookAngles: ['truoc-sau'], defaultStyle: 'dien-anh', suggestedStyles: ['du-lieu', 'hanh-dong'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ['sipos', 'bos'] },
  { id: 'so-sanh', name: 'So sánh cách cũ / cách mới', templates: ['BeforeAfter'], minSec: 20, maxSec: 40, roles: ['hook', 'problem', 'solution', 'proof', 'cta'], hookAngles: ['lat-nguoc'], defaultStyle: 'du-lieu', suggestedStyles: ['tin-tuc'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ['sipos', 'bos'] },
  { id: 'khach-hang-noi', name: 'Khách hàng nói', templates: ['Testimonial'], minSec: 20, maxSec: 45, roles: ['hook', 'problem', 'solution', 'proof', 'cta'], hookAngles: ['quote'], defaultStyle: 'tin-cay', suggestedStyles: ['dien-anh', 'retro'], avoidStyles: TRUST_AVOID, music: 'nhac-nen', keepClipAudio: true, products: ALL },
  { id: 'khuyen-mai', name: 'Khuyến mãi / flash sale', templates: ['Promo'], minSec: 10, maxSec: 20, roles: ['hook', 'solution', 'cta'], hookAngles: ['con-so'], defaultStyle: 'khuyen-mai', suggestedStyles: ['hanh-dong', 'nang-dong'], avoidStyles: ['thu-gian', 'sang-trong'], music: 'nhac-nang-luong', keepClipAudio: false, products: ['sipos', 'webino'] },
  { id: 'dem-nguoc', name: 'Đếm ngược / teaser', templates: ['Promo'], minSec: 10, maxSec: 15, roles: ['hook', 'proof', 'cta'], hookAngles: ['sap-thay-doi'], defaultStyle: 'bi-an', suggestedStyles: ['tuong-lai', 'glitch-cyberpunk'], avoidStyles: [], music: 'nhac-nang-luong', keepClipAudio: false, products: [...ALL, 'redsun'] },
  { id: 'chuc-mung-dip-le', name: 'Chúc mừng dịp lễ', templates: ['Promo'], minSec: 10, maxSec: 20, roles: ['hook', 'solution', 'cta'], hookAngles: ['thuong-hieu'], defaultStyle: 'le-hoi', suggestedStyles: ['lang-man', 'retro'], avoidStyles: ['khuyen-mai', 'tin-tuc'], music: 'nhac-nen', keepClipAudio: false, products: [...ALL, 'redsun'] },
  { id: 'su-kien-webinar', name: 'Mời sự kiện / webinar', templates: ['Promo'], minSec: 15, maxSec: 30, roles: ['hook', 'solution', 'proof', 'cta'], hookAngles: ['cau-hoi-noi-dau', 'thuong-hieu'], defaultStyle: 'tin-tuc', suggestedStyles: ['sang-trong', 'toi-gian'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ['bos', 'webino', 'redsun'] },
  { id: 'tong-ket-su-kien', name: 'Tổng kết sự kiện', templates: ['EventRecap'], minSec: 20, maxSec: 45, roles: ['hook', 'proof', 'cta'], repeatRole: 'proof', hookAngles: ['con-so'], defaultStyle: 'nang-dong', suggestedStyles: ['dien-anh', 'le-hoi'], avoidStyles: [], music: 'nhac-nang-luong', keepClipAudio: false, products: [...ALL, 'redsun'] },
  { id: 'so-lieu-thanh-tich', name: 'Số liệu / thành tích', templates: ['Stats'], minSec: 10, maxSec: 20, roles: ['hook', 'proof', 'cta'], repeatRole: 'proof', hookAngles: ['con-so'], defaultStyle: 'du-lieu', suggestedStyles: ['sang-trong'], avoidStyles: [], music: 'nhac-nang-luong', keepClipAudio: false, products: [...ALL, 'redsun'] },
  { id: 'trend-meme', name: 'Bắt trend / hài', templates: ['TipOfTheDay'], minSec: 7, maxSec: 15, roles: ['hook', 'problem', 'solution'], hookAngles: ['lat-nguoc'], defaultStyle: 'vui-nhon', suggestedStyles: ['glitch-cyberpunk'], avoidStyles: [], music: 'nhac-nang-luong', keepClipAudio: false, products: ['sipos'] },
  { id: 'cau-hoi-thuong-gap', name: 'Hỏi đáp (FAQ)', templates: ['TipOfTheDay'], minSec: 15, maxSec: 30, roles: ['hook', 'solution', 'cta'], hookAngles: ['cau-hoi-noi-dau'], defaultStyle: 'toi-gian', suggestedStyles: ['tin-cay'], avoidStyles: TRUST_AVOID, music: 'nhac-nen', keepClipAudio: false, products: ALL, hookTag: 'Hỏi đáp' },
  { id: 'gioi-thieu-cong-ty', name: 'Giới thiệu thương hiệu', templates: ['EventRecap'], minSec: 30, maxSec: 60, roles: ['hook', 'problem', 'solution', 'proof', 'cta'], hookAngles: ['thuong-hieu', 'con-so'], defaultStyle: 'dien-anh', suggestedStyles: ['sang-trong', 'tuong-lai'], avoidStyles: ['glitch-cyberpunk', 'vui-nhon'], music: 'nhac-nen', keepClipAudio: false, products: ['redsun'] },
  { id: 'tuyen-dung', name: 'Tuyển dụng / văn hóa', templates: ['EventRecap'], minSec: 20, maxSec: 45, roles: ['hook', 'proof', 'solution', 'cta'], hookAngles: ['lat-nguoc'], defaultStyle: 'nang-dong', suggestedStyles: ['tin-cay', 'vui-nhon'], avoidStyles: ['glitch-cyberpunk'], music: 'nhac-nang-luong', keepClipAudio: false, products: ['redsun'] },
  { id: 'thong-bao', name: 'Thông báo nhanh', templates: ['TipOfTheDay'], minSec: 7, maxSec: 15, roles: ['hook', 'solution', 'cta'], hookAngles: [], defaultStyle: 'tin-tuc', suggestedStyles: ['toi-gian'], avoidStyles: TRUST_AVOID, music: 'nhac-nen', keepClipAudio: false, products: [...ALL, 'redsun'], hookTag: 'Thông báo' },
  { id: 'video-co-nguoi-noi', name: 'Có người nói trước camera', templates: ['TalkingHead'], minSec: 15, maxSec: 60, roles: ['hook', 'problem', 'solution', 'cta'], hookAngles: ['quote'], defaultStyle: 'tin-cay', suggestedStyles: ['toi-gian'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: true, products: [...ALL, 'redsun'] },
  { id: 'thu-gian-asmr', name: 'Thư giãn / không khí quán', templates: ['Promo', 'Testimonial'], minSec: 10, maxSec: 20, roles: ['hook', 'solution', 'cta'], hookAngles: [], defaultStyle: 'thu-gian', suggestedStyles: ['lang-man'], avoidStyles: [], music: 'nhac-nen', keepClipAudio: false, products: ['sipos'] },
];

/** Dịp lễ → phong cách mặc định (config/occasions.ts). Ghi đè mặc định theo loại video. */
export const OCCASION_STYLES: Readonly<Record<string, StyleId>> = Object.fromEntries(OCCASIONS.map((o) => [o.id, o.style]));

export function getVideoType(id: string): VideoType | undefined {
  return VIDEO_TYPES.find((t) => t.id === id);
}
