/**
 * Lịch dịp lễ Việt Nam → phong cách mặc định (REQUIREMENTS v0.4 §7.3, docs/video-style-catalog.md §4).
 * Brief ghi `occasion: <id>`; phong cách theo dịp ghi đè mặc định của loại video (trừ khi nằm trong "nên tránh").
 * Ngày âm lịch đổi theo năm: tra lại trước khi lên lịch đăng (nên đăng trước 5–10 ngày + đúng ngày).
 */
import type { StyleId } from './styles.ts';

export interface Occasion {
  id: string;
  name: string;
  /** Ngày dương lịch "dd/mm", hoặc mô tả khi không cố định. */
  date: string;
  style: StyleId;
}

export const OCCASIONS: readonly Occasion[] = [
  { id: 'tet-duong-lich', name: 'Tết Dương lịch', date: '01/01', style: 'le-hoi' },
  { id: 'tet', name: 'Tết Nguyên Đán', date: 'mùng 1 Tết (âm lịch; 2027: 06/02)', style: 'le-hoi' },
  { id: '14-2', name: 'Valentine', date: '14/02', style: 'lang-man' },
  { id: '8-3', name: 'Quốc tế Phụ nữ', date: '08/03', style: 'lang-man' },
  { id: '30-4', name: 'Giải phóng miền Nam / Quốc tế Lao động', date: '30/04 – 01/05', style: 'nang-dong' },
  { id: '1-6', name: 'Quốc tế Thiếu nhi', date: '01/06', style: 'vui-nhon' },
  { id: 'tuu-truong', name: 'Mùa tựu trường', date: 'cuối 08 – đầu 09', style: 'vui-nhon' },
  { id: 'trung-thu', name: 'Trung thu', date: '15/8 âm lịch', style: 'le-hoi' },
  { id: '20-10', name: 'Phụ nữ Việt Nam', date: '20/10', style: 'lang-man' },
  { id: 'halloween', name: 'Halloween', date: '31/10', style: 'bi-an' },
  { id: '11-11', name: 'Ngày Độc thân', date: '11/11', style: 'khuyen-mai' },
  { id: '20-11', name: 'Ngày Nhà giáo Việt Nam', date: '20/11', style: 'tin-cay' },
  { id: 'black-friday', name: 'Black Friday', date: 'thứ Sáu thứ 4 của tháng 11', style: 'khuyen-mai' },
  { id: 'giang-sinh', name: 'Giáng sinh', date: '24/12 – 25/12', style: 'le-hoi' },
  { id: 'khai-truong', name: 'Khai trương cửa hàng khách', date: 'tuỳ khách', style: 'le-hoi' },
  { id: 'sinh-nhat-cong-ty', name: 'Sinh nhật công ty', date: 'kiểm tra ngày thành lập', style: 'dien-anh' },
  { id: 'the-thao', name: 'Sự kiện thể thao', date: 'theo lịch giải', style: 'nang-dong' },
];

export function getOccasion(id: string): Occasion | undefined {
  return OCCASIONS.find((o) => o.id === id);
}
