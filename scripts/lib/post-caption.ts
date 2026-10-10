/**
 * Soạn nội dung đăng bài khi xuất video (REQUIREMENTS v0.4 §10.2 bước 8): caption khớp kịch bản, hashtag, credit nhạc.
 */
import { AI_VIDEO } from '../../config/ai-video.ts';
import type { MusicTrack } from '../../config/music-manifest.ts';
import type { Script } from '../../config/script.schema.ts';

export interface PostInput {
  script: Script;
  hashtags: string[];
  track?: MusicTrack;
  /** Video có người thật do AI tạo: caption mở đầu bằng nhãn AI, ghi chú nhắc bật khai báo AI của nền tảng. */
  aiContent?: boolean;
  /** Clip người thật quay sẵn đã dùng: ghi nguồn trong phần ghi chú (không bắt buộc theo giấy phép, nên ghi). */
  stockCredits?: Array<{ author: string; license: string; link: string }>;
}

const MAX_HASHTAGS = 6;

/** Hashtag theo chủ đề lấy từ loại video (không bịa thêm thông tin sản phẩm). */
const TOPIC_TAGS: Record<string, string[]> = {
  'ra-mat-tinh-nang': ['#tinhnangmoi'],
  'demo-san-pham': ['#huongdan'],
  'meo-hay': ['#meohay'],
  'huong-dan-nhieu-buoc': ['#huongdan'],
  'cau-hoi-thuong-gap': ['#hoidap'],
  'thong-bao': ['#thongbao'],
  'trend-meme': ['#chuquan'],
  'khuyen-mai': ['#khuyenmai'],
};

/** Bỏ dấu [ ] đánh dấu chữ nhấn (chỉ dùng trong video). */
const plain = (t: string) => t.replace(/[[\]]/g, '');

/** Dòng ưu đãi trong caption, chép đúng chữ trên video (badge, giá, hạn chót/điều kiện). */
function promoLine(p: NonNullable<Script['scenes'][number]['promo']>): string | null {
  const parts = [p.badge, p.priceOld && p.priceNew ? `${p.priceOld} → ${p.priceNew}` : (p.priceNew ?? p.priceOld), p.deadline].filter(Boolean);
  return parts.length ? `🎁 ${parts.join(' · ')}` : null;
}

export function buildPost({ script, hashtags, track, aiContent, stockCredits = [] }: PostInput): string {
  const body = script.scenes
    .filter((s) => s.role !== 'hook' && s.role !== 'cta')
    .flatMap((s) => {
      const line = `• ${plain(s.onScreenText)}${s.subText ? ` — ${s.subText}` : ''}`;
      const promo = s.promo ? promoLine(s.promo) : null;
      return promo ? [line, promo] : [line];
    });
  const tags = [...new Set([...hashtags, ...(TOPIC_TAGS[script.videoType] ?? [])])].slice(0, MAX_HASHTAGS);
  const lines = [
    '# Nội dung đăng bài',
    '',
    '## Caption (copy nguyên phần dưới)',
    '',
    ...(aiContent ? [AI_VIDEO.captionLabel, ''] : []),
    plain(script.hook.replace(/\n/g, ' ')),
    '',
    ...body,
    '',
    `👉 ${plain(script.cta)}`,
    '',
    tags.join(' '),
  ];
  if (track?.attributionRequired && track.attributionText) lines.push('', track.attributionText);
  lines.push(
    '',
    '## Ghi chú',
    '',
    `- Nhạc: ${track ? `${track.title} — ${track.author} (${track.license})` : script.music}${track?.allowedUse.includes('social-organic') ? '' : ' — NHẠC THỬ, KHÔNG ĐĂNG'}`,
    '- Chỉ đăng tự nhiên (organic), không chạy quảng cáo bằng video này.',
  );
  for (const c of stockCredits) lines.push(`- Clip quay sẵn: ${c.author} (${c.license}) — ${c.link}`);
  if (aiContent) lines.push(`- **Video có người thật do AI tạo.** ${AI_VIDEO.platformNote} Giữ nguyên dòng nhãn AI ở đầu caption.`);
  return lines.join('\n') + '\n';
}
