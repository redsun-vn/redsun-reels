/**
 * Danh sách 19 phong cách video (REQUIREMENTS v0.4 §7.3, chi tiết ở docs/video-style-catalog.md).
 * Phong cách là preset áp lên template: đổi chuyển động, chuyển cảnh, cách hiện chữ, lớp phủ, mood nhạc;
 * không đổi màu brand, font, logo, safe zone.
 */
import { z } from 'zod';

export const STYLE_IDS = [
  'toi-gian',
  'sang-trong',
  'lang-man',
  'hanh-dong',
  'bi-an',
  'tuong-lai',
  'robot-cong-nghe',
  'glitch-cyberpunk',
  'vui-nhon',
  'le-hoi',
  'nang-dong',
  'dien-anh',
  'tin-tuc',
  'thu-gian',
  'du-lieu',
  'thu-cong',
  'retro',
  'khuyen-mai',
  'tin-cay',
] as const;

export type StyleId = (typeof STYLE_IDS)[number];

export const StyleSchema = z.object({
  id: z.enum(STYLE_IDS),
  name: z.string(),
  mood: z.string(),
  energy: z.enum(['rat-thap', 'thap', 'vua', 'cao']),
  /** Guardrail riêng (docs/video-style-catalog.md §5); rỗng nếu không có. */
  guardrails: z.array(z.string()),
});
export type Style = z.infer<typeof StyleSchema>;

export const STYLES: readonly Style[] = [
  { id: 'toi-gian', name: 'Tối giản', mood: 'sạch, chính xác', energy: 'vua', guardrails: [] },
  { id: 'sang-trong', name: 'Sang trọng', mood: 'cao cấp, điềm tĩnh', energy: 'thap', guardrails: [] },
  { id: 'lang-man', name: 'Lãng mạn', mood: 'ấm, mềm, thân mật', energy: 'thap', guardrails: [] },
  { id: 'hanh-dong', name: 'Hành động', mood: 'dồn dập, mạnh', energy: 'cao', guardrails: ['không nhấp nháy quá 3 lần/giây'] },
  {
    id: 'bi-an',
    name: 'Bí ẩn / kinh dị nhẹ',
    mood: 'tối, hồi hộp, tò mò',
    energy: 'vua',
    guardrails: ['bí ẩn nhẹ, không máu me hay hình ảnh gây sợ thật', 'giữ màu sản phẩm làm điểm nhấn'],
  },
  { id: 'tuong-lai', name: 'Tương lai', mood: 'rộng lớn, AI, đột phá', energy: 'vua', guardrails: ['không gradient cầu vồng'] },
  { id: 'robot-cong-nghe', name: 'Robot / công nghệ', mood: 'máy móc, chính xác', energy: 'vua', guardrails: [] },
  {
    id: 'glitch-cyberpunk',
    name: 'Glitch / cyberpunk',
    mood: 'căng, gen Z, neon',
    energy: 'cao',
    guardrails: ['không nhấp nháy quá 3 lần/giây', 'giữ màu sản phẩm làm điểm nhấn', 'chữ chính không bị glitch che'],
  },
  { id: 'vui-nhon', name: 'Vui nhộn / hài', mood: 'tinh nghịch, nảy', energy: 'cao', guardrails: ['MKT đọc lại câu chữ (hài kiểu Việt)'] },
  { id: 'le-hoi', name: 'Lễ hội / Tết', mood: 'rộn ràng, ăn mừng', energy: 'cao', guardrails: ['màu lễ hội chỉ làm điểm nhấn, không thay màu brand'] },
  { id: 'nang-dong', name: 'Năng động / thể thao', mood: 'nhanh, cạnh tranh', energy: 'cao', guardrails: [] },
  { id: 'dien-anh', name: 'Kể chuyện / điện ảnh', mood: 'trầm, có chiều sâu', energy: 'thap', guardrails: [] },
  { id: 'tin-tuc', name: 'Tin tức / breaking', mood: 'khẩn, đáng tin', energy: 'cao', guardrails: [] },
  { id: 'thu-gian', name: 'ASMR / thư giãn', mood: 'chậm, mượt, yên', energy: 'rat-thap', guardrails: [] },
  { id: 'du-lieu', name: 'Dữ liệu / infographic', mood: 'phân tích, số liệu', energy: 'vua', guardrails: ['chỉ dùng số liệu có trong brief'] },
  { id: 'thu-cong', name: 'Thủ công / hand-drawn', mood: 'gần gũi, như phác thảo', energy: 'vua', guardrails: ['không thêm font thứ hai'] },
  { id: 'retro', name: 'Retro / hoài cổ', mood: 'ấm, băng cũ, kỷ niệm', energy: 'vua', guardrails: [] },
  { id: 'khuyen-mai', name: 'Khuyến mãi / flash sale', mood: 'gấp, giá, đếm ngược', energy: 'cao', guardrails: ['chỉ dùng giá/ưu đãi có trong brief'] },
  { id: 'tin-cay', name: 'Tin cậy / social proof', mood: 'ấm, thật, uy tín', energy: 'thap', guardrails: [] },
];

export function getStyle(id: string): Style | undefined {
  return STYLES.find((s) => s.id === id);
}
