/**
 * Chọn phong cách cho một video (REQUIREMENTS v0.4 §7.3):
 * style MKT chọn > phong cách theo dịp lễ > mặc định của loại video.
 * Phong cách nằm trong danh sách "nên tránh" vẫn được giữ nhưng trả cảnh báo để skill hỏi lại MKT.
 */
import { getStyle, type StyleId } from '../../config/styles.ts';
import { getVideoType, OCCASION_STYLES } from '../../config/video-types.ts';

export interface ResolvedStyle {
  style: StyleId;
  source: 'brief' | 'occasion' | 'video-type-default';
  /** Thông báo tiếng Việt cho MKT; rỗng nếu không có gì cần hỏi lại. */
  warnings: string[];
}

export function resolveStyle(input: { videoType: string; style?: string | null; occasion?: string | null }): ResolvedStyle {
  const type = getVideoType(input.videoType);
  if (!type) throw new Error(`Không có loại video "${input.videoType}". Xem docs/video-type-guide.md.`);

  const requested = input.style?.trim();
  if (requested && requested !== 'auto') {
    const style = getStyle(requested);
    if (!style) throw new Error(`Không có phong cách "${requested}". Xem docs/video-style-catalog.md.`);
    const warnings = type.avoidStyles.includes(style.id)
      ? [`Phong cách "${style.name}" thường không hợp với loại "${type.name}". Bạn vẫn muốn dùng chứ?`]
      : [];
    return { style: style.id, source: 'brief', warnings };
  }

  const occasionStyle = input.occasion ? OCCASION_STYLES[input.occasion] : undefined;
  if (occasionStyle && !type.avoidStyles.includes(occasionStyle)) {
    return { style: occasionStyle, source: 'occasion', warnings: [] };
  }
  return { style: type.defaultStyle, source: 'video-type-default', warnings: [] };
}
