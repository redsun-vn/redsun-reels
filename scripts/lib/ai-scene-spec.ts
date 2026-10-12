/**
 * Kế hoạch cảnh AI của một video (`briefs/<tên>/ai/canh-ai.json`, Claude viết theo bảng khung chính) và sổ nguồn gốc
 * (`ai/nhat-ky.json`, REQUIREMENTS §7.4: chỉ các trường cho phép, không ghi key hay đường dẫn trên máy).
 * Thứ tự làm: ảnh tham chiếu mỗi vai (người duyệt `duyet: true`) → khung đầu mỗi cảnh (Claude xem, `duyetKhung: true`)
 * → clip cho cảnh `video: true`. Mọi bước cộng tiền vào sổ, so trần `COST.aiCapVndPerVideo`.
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AI_VIDEO } from '../../config/ai-video.ts';
import { CAM_XUC } from '../../config/stock-footage.ts';

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'chỉ chữ thường không dấu, số, "-"');

export const AiSpecSchema = z.object({
  /** Model cho cảnh tạo từ chữ (`config/ai-video.ts` `textVideoModels`); mặc định Veo (Nam 2026-10-11), Seedance khi một vai cần quá 8 giây. */
  mohinh: z.enum(['seedance', 'veo']).default('veo'),
  /**
   * Bối cảnh chung (tiếng Anh): một nơi duy nhất mọi nhân vật cùng có mặt (phòng, đồ đạc, ánh sáng, giờ trong ngày),
   * gắn vào mọi cảnh. Nam 2026-10-12: video AI phải là một khung hình chung, không ghép người từ các nơi rời nhau.
   */
  chung: z.string().default(''),
  dan: z.record(
    slug,
    z.object({
      /** Ngoại hình (tiếng Anh): tuổi, giới, tóc, trang phục đời thường. Không tên người thật, không "giống ai". */
      moTa: z.string().min(10),
      /** Vai trong câu chuyện (tiếng Anh), để model dựng đúng hình vai: vd. "sales director", "sales employee with a headset". */
      vaiTro: z.string().default(''),
      /** Vị trí trong bối cảnh chung (tiếng Anh): đứng/ngồi ở đâu, quay về ai, vd. "standing at the head of the table facing the team". */
      viTri: z.string().default(''),
      /** Người duyệt đã xem ảnh tham chiếu và đồng ý (Nam/MKT). Chưa duyệt thì không làm khung đầu cho vai này. */
      duyet: z.boolean().default(false),
    }),
  ),
  canh: z
    .array(
      z.object({
        id: slug,
        /** Số khung trong dung-rieng/bang-canh.txt (cảnh xếp đúng thứ tự khung). */
        khung: z.number().int().min(1),
        /** Vai có mặt trong khung (ảnh tham chiếu). Khung chỉ thấy tay/vật: để trống. */
        vai: z.array(slug).default([]),
        camXuc: z.enum(CAM_XUC),
        /** Khung hình tĩnh (tiếng Anh): ai, đang làm gì, nét mặt, cỡ cảnh, bối cảnh. */
        moTa: z.string().min(10),
        /** Có làm clip từ khung đầu không (tốn nhiều tiền nhất); không thì dùng ảnh + chuyển động máy quay HyperFrames. */
        video: z.boolean().default(false),
        /** Chuyển động trong clip (tiếng Anh). */
        chuyenDong: z.string().default(''),
        giay: z.number().int().min(1).default(4),
        /** Cảnh toàn: thấy cả bối cảnh chung và mọi vai trong `vai` cùng lúc (cảnh mở / cảnh hành động chính). */
        toanCanh: z.boolean().default(false),
        /**
         * Nối tiếp lần tạo từ chữ trước (mã cảnh): khung cuối clip đó làm khung đầu clip này, để cả phần AI là một mạch
         * liền (Nam 2026-10-12: "phải là 1 video xuyên suốt, không phải cảnh ghép cắt từ nhiều phân đoạn").
         */
        noiTiep: slug.optional(),
        /** Clip tạo thẳng từ chữ (không ảnh vai, không khung đầu), model theo `mohinh` (`textVideoModels`); `moTa` tả từng cảnh nhỏ theo giây (Shot 1 (0–2.5s): …). */
        tuChu: z.boolean().default(false),
        /** Claude đã xem khung đầu (tay, mặt, chữ rác…) và thấy đạt. Chưa đạt thì không làm clip. */
        duyetKhung: z.boolean().default(false),
      }),
    )
    .min(1),
});
export type AiSpec = z.infer<typeof AiSpecSchema>;

export type AiItemKind = 'anh-vai' | 'khung-dau' | 'clip';

export interface AiLogItem {
  /** Tên file trong ai/ (không đường dẫn máy). */
  file: string;
  loai: AiItemKind;
  canh?: string;
  vai?: string[];
  nhaCungCap: 'openrouter';
  model: string;
  prompt: string;
  /** File ảnh tham chiếu đã dùng (trong ai/). */
  anhThamChieu: string[];
  seed: number;
  maViec?: string;
  thoiLuong?: number;
  chiPhiUsd: number;
  taoLuc: string;
}

export interface AiPending {
  canh: string;
  maViec: string;
  pollingUrl: string;
  model: string;
  prompt: string;
  anhThamChieu: string[];
  seed: number;
  giay: number;
  uocUsd: number;
  guiLuc: string;
  /** Việc đã xong nhưng tải chưa được: lần sau chỉ tải. */
  urls?: string[];
  chiPhiUsd?: number;
}

export interface AiLog {
  items: AiLogItem[];
  dangCho: AiPending[];
  chiPhi: { usd: number; luot: number };
}

export const emptyLog = (): AiLog => ({ items: [], dangCho: [], chiPhi: { usd: 0, luot: 0 } });

export const roleFile = (vai: string) => `vai-${vai}.png`;
export const frameFile = (canh: string) => `${canh}-dau.png`;
export const clipFile = (canh: string) => `${canh}.mp4`;

/** Seed cố định theo tên (làm lại ra gần như cùng hình). */
export const seedOf = (name: string) => parseInt(createHash('sha256').update(name).digest('hex').slice(0, 7), 16);

/** Vai: hình đúng vai trò + vị trí trong bối cảnh chung (blocking), để mọi cảnh dựng cùng một không gian. */
const castLine = (spec: AiSpec, v: string) => {
  const d = spec.dan[v];
  return `${v}${d.vaiTro ? ` (${d.vaiTro})` : ''}: ${d.moTa}${d.viTri ? `; position in the shared location: ${d.viTri}` : ''}.`;
};
const sharedPlace = (spec: AiSpec) =>
  spec.chung ? `One shared location for every shot, all characters are in this same place at the same time: ${spec.chung}` : '';
const establishing = (c: AiSpec['canh'][number]) =>
  c.toanCanh ? `The first shot is a wide establishing shot that shows the whole location and every character at once in their positions.` : '';

export function rolePrompt(spec: AiSpec, vai: string): string {
  const d = spec.dan[vai];
  return [
    `Reference portrait for one character, waist-up, facing camera, neutral friendly expression, both arms relaxed at the sides, hands empty, plain soft background. ${d.vaiTro ? `Role: ${d.vaiTro}, dressed and groomed exactly like this role. ` : ''}${d.moTa}.`,
    AI_VIDEO.promptRules,
  ].join(' ');
}

export function framePrompt(spec: AiSpec, c: AiSpec['canh'][number]): string {
  const who = c.vai.length ? c.vai.map((v, i) => `Person ${i + 1} is exactly the person in reference image ${i + 1}, ${castLine(spec, v)}`).join(' ') : 'No face visible, only hands and objects.';
  const wide = c.toanCanh ? 'Wide establishing frame showing the whole location and every person in their positions.' : '';
  return [`Vertical 9:16 film still. ${wide} ${c.moTa}.`, who, `Emotion: ${c.camXuc}.`, sharedPlace(spec), AI_VIDEO.promptRules].filter(Boolean).join(' ');
}

/** Mô tả clip tạo từ chữ: nhiều cảnh nhỏ trong một lần tạo, cùng nhân vật (tả ngoại hình mọi vai có mặt). */
export function textVideoPrompt(spec: AiSpec, c: AiSpec['canh'][number]): string {
  const who = c.vai.map((v) => castLine(spec, v)).join(' ');
  return [
    `Vertical 9:16 cinematic short film, one continuous scene cut into multiple shots with hard cuts, the same characters keep the same face, hair and clothes in every shot.`,
    sharedPlace(spec),
    who && `Characters and blocking: ${who}`,
    establishing(c),
    c.noiTiep ? 'This clip continues seamlessly from the first frame: same place, same people, same light, the action carries on without a jump.' : '',
    c.moTa,
    AI_VIDEO.promptRules,
  ].filter(Boolean).join(' ');
}

export function motionPrompt(spec: AiSpec, c: AiSpec['canh'][number]): string {
  return [`${c.chuyenDong || 'Subtle natural movement, gentle handheld camera.'}`, `Keep the same people, faces and clothes as the first frame. Emotion: ${c.camXuc}.`, spec.chung, AI_VIDEO.promptRules].filter(Boolean).join(' ');
}

/** Lỗi kế hoạch trước khi tốn tiền: vai chưa khai, khung trùng, thứ tự khung, clip chỉ cho cảnh cần. */
export function specIssues(spec: AiSpec): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  let lastKhung = 0;
  for (const c of spec.canh) {
    if (ids.has(c.id)) out.push(`Cảnh "${c.id}" bị trùng mã.`);
    ids.add(c.id);
    for (const v of c.vai) if (!spec.dan[v]) out.push(`Cảnh "${c.id}": vai "${v}" chưa có trong dan.`);
    if (c.khung < lastKhung) out.push(`Cảnh "${c.id}" (khung ${c.khung}) đứng sau khung ${lastKhung}: xếp cảnh đúng thứ tự khung.`);
    lastKhung = c.khung;
    if (c.tuChu && !c.video) out.push(`Cảnh "${c.id}" tạo từ chữ (tuChu) phải là clip (video: true).`);
    if (c.video && !c.tuChu && !c.chuyenDong.trim()) out.push(`Cảnh "${c.id}" làm clip nhưng chưa tả chuyển động (chuyenDong).`);
    if (c.vai.length > 3) out.push(`Cảnh "${c.id}" có ${c.vai.length} vai: tối đa 3 ảnh tham chiếu mỗi cảnh.`);
    if (c.tuChu && spec.mohinh === 'veo' && c.giay > 8) out.push(`Cảnh "${c.id}" dài ${c.giay} giây: Veo chỉ tạo tối đa 8 giây mỗi lần; dùng "mohinh": "seedance" (tới 15 giây) để mọi nhân vật ở cùng một lần tạo.`);
  }
  // Khung hình chung (Nam 2026-10-12): một bối cảnh, vai đúng hình, có cảnh toàn đủ mọi vai, mọi vai lộ mặt cùng một lần tạo
  if (spec.chung.trim().length < 30) out.push('Thiếu bối cảnh chung ("chung"): tả một nơi duy nhất mọi nhân vật cùng có mặt (không gian, đồ đạc, ánh sáng, giờ).');
  for (const [v, d] of Object.entries(spec.dan)) {
    if (!d.vaiTro.trim()) out.push(`Vai "${v}": thiếu vaiTro (vai trong câu chuyện, để model dựng đúng hình vai).`);
    if (!d.viTri.trim()) out.push(`Vai "${v}": thiếu viTri (đứng/ngồi ở đâu trong bối cảnh chung, quay về ai).`);
  }
  const roles = Object.keys(spec.dan);
  if (roles.length > 1 && !spec.canh.some((c) => c.toanCanh && roles.every((v) => c.vai.includes(v))))
    out.push(`Chưa có cảnh toàn ("toanCanh": true) thấy đủ mọi vai (${roles.join(', ')}) trong cùng khung: video AI phải là một khung hình chung.`);
  const faceGens = spec.canh.filter((c) => c.tuChu && c.vai.length);
  const broken = faceGens.slice(1).filter((c, i) => c.noiTiep !== faceGens[i].id);
  if (broken.length)
    out.push(`Lần tạo ${broken.map((c) => `"${c.id}"`).join(', ')} có người nhưng không nối tiếp lần tạo trước ("noiTiep"): phần AI phải là một mạch liền, mọi vai lộ mặt cùng một lần tạo hoặc chuỗi nối tiếp (khung cuối lần trước làm khung đầu lần sau).`);
  for (const c of spec.canh) {
    if (!c.noiTiep) continue;
    const prev = spec.canh.findIndex((x) => x.id === c.noiTiep);
    if (prev < 0 || prev >= spec.canh.indexOf(c)) out.push(`Cảnh "${c.id}" nối tiếp "${c.noiTiep}": cảnh đó phải có và đứng trước.`);
    else if (!c.tuChu || !spec.canh[prev].tuChu) out.push(`Cảnh "${c.id}" nối tiếp: cả hai cảnh phải là clip tạo từ chữ (tuChu).`);
  }
  for (const [v, d] of Object.entries(spec.dan)) if (/\b(celebrity|famous|looks like|lookalike|resembl)/i.test(d.moTa)) out.push(`Vai "${v}": không mô tả giống người có danh tính.`);
  return out;
}

/** Tiền còn được tiêu (USD) trước trần của video. */
/** Phần trần còn lại: trừ cả tiền đã chi và tiền ước của các clip đã gửi còn đang chờ (gửi song song vẫn không vượt trần). */
export const budgetLeftUsd = (log: AiLog, capVnd: number, vndPerUsd: number) =>
  capVnd / vndPerUsd - log.chiPhi.usd - log.dangCho.reduce((s, p) => s + (p.chiPhiUsd ?? p.uocUsd), 0);
