/**
 * Soạn nội dung đăng bài khi xuất video (REQUIREMENTS v0.4 §10.2 bước 8): caption khớp kịch bản, hashtag, credit nhạc.
 */
import type { MusicTrack } from '../../config/music-manifest.ts';
import type { Script } from '../../config/script.schema.ts';

export interface PostInput {
  script: Script;
  hashtags: string[];
  track?: MusicTrack;
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

export function buildPost({ script, hashtags, track }: PostInput): string {
  const body = script.scenes.filter((s) => s.role !== 'hook' && s.role !== 'cta').map((s) => `• ${s.onScreenText}${s.subText ? ` — ${s.subText}` : ''}`);
  const tags = [...new Set([...hashtags, ...(TOPIC_TAGS[script.videoType] ?? [])])].slice(0, MAX_HASHTAGS);
  const lines = [
    '# Nội dung đăng bài',
    '',
    '## Caption (copy nguyên phần dưới)',
    '',
    script.hook.replace(/\n/g, ' '),
    '',
    ...body,
    '',
    `👉 ${script.cta}`,
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
  return lines.join('\n') + '\n';
}
