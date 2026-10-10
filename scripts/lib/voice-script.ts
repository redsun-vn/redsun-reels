/**
 * Lời đọc của video (briefs/<tên>/dung-rieng/loi-doc.json, skill giong-doc): dàn giọng VieNeu theo vai (mỗi vai một giọng,
 * giới tính khớp người trên hình), từng câu kèm giây đọc, cảm xúc (để kiểm mặt người phản ứng), kiểu đọc VieNeu.
 */
import { z } from 'zod';
import { CAM_XUC } from '../../config/stock-footage.ts';

const EMOTIONS = CAM_XUC.filter((c) => c !== 'khong-mat') as [string, ...string[]];

export const VoiceLineSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'chỉ chữ thường không dấu, số, "-"'),
  vai: z.string().min(1),
  /** Giây bắt đầu đọc trong video. */
  at: z.number().min(0),
  /** Lời đọc; thẻ trong ngoặc vuông ([cười], [thở dài]) là tiếng chèn, không tính là chữ. */
  loi: z.string().min(1),
  camXuc: z.enum(EMOTIONS),
  /** Cường độ cảm xúc mong muốn 1–5 (để người viết lời và người nghe duyệt; VieNeu không nhận thông số này). */
  cuongDo: z.number().int().min(1).max(5).optional(),
  /** Bối cảnh và ghi chú diễn: cho người viết lời, chọn giọng, nghe duyệt (VieNeu chỉ nhận lời). */
  boiCanh: z.string().optional(),
  dienXuat: z.string().optional(),
  /** Kiểu đọc VieNeu: `natural` (thoại) hoặc `storytelling` (kể chuyện). Mặc định: người dẫn kể chuyện, nhân vật tự nhiên. */
  phongCach: z.enum(['natural', 'storytelling']).optional(),
});
export type VoiceLine = z.infer<typeof VoiceLineSchema>;

export const VoiceScriptSchema = z.object({
  giongVung: z.enum(['nam', 'bac']).default('nam'),
  /** Vai → giọng VieNeu (tên trong danh mục v4), giới tính giọng, hồ sơ nhân vật. */
  dan: z.record(z.string(), z.object({ giong: z.string().min(1), gioi: z.enum(['nu', 'nam']), hoSo: z.string().min(1) })),
  cau: z.array(VoiceLineSchema).min(1),
});
export type VoiceScript = z.infer<typeof VoiceScriptSchema>;

export function voiceScriptIssues(vs: VoiceScript, totalSec: number): string[] {
  const out: string[] = [];
  const voices = new Map<string, string>();
  for (const [vai, d] of Object.entries(vs.dan)) {
    const other = voices.get(d.giong);
    if (other) out.push(`Vai "${vai}" và "${other}" cùng giọng "${d.giong}": mỗi nhân vật một giọng.`);
    voices.set(d.giong, vai);
  }
  const ids = new Set<string>();
  for (const c of vs.cau) {
    if (ids.has(c.id)) out.push(`Câu "${c.id}" bị trùng mã.`);
    ids.add(c.id);
    if (!vs.dan[c.vai]) out.push(`Câu "${c.id}": vai "${c.vai}" chưa có trong dàn giọng.`);
    if (c.at >= totalSec) out.push(`Câu "${c.id}": giây ${c.at} nằm ngoài video (${totalSec}s).`);
    if (!spokenText(c.loi)) out.push(`Câu "${c.id}" không có chữ để đọc.`);
  }
  return out;
}

/** Kiểu đọc VieNeu của câu. */
export const lineStyle = (c: VoiceLine): 'natural' | 'storytelling' => c.phongCach ?? (c.vai === 'nguoi-dan' ? 'storytelling' : 'natural');

/** Chữ được đọc (bỏ thẻ âm thanh [..]). */
export function spokenText(loi: string): string {
  return loi.replace(/\[[^\]]*\]/g, ' ').replace(/\s+/g, ' ').trim();
}
