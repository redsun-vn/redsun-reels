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
  /** Phong cách hình (tiếng Anh): vd. "cinematic corporate drama, 35mm film look, muted teal palette". */
  phongCach: z.string().default(''),
  /** Ánh sáng và không khí (tiếng Anh): vd. "cool overcast daylight, tense quiet room". */
  anhSang: z.string().default(''),
  /**
   * Âm thanh trong clip (tiếng Anh): tiếng môi trường, tiếng động, nhạc có hay không (dự án lồng nhạc riêng: "no music").
   * Lời thoại viết trong `moTa` từng shot: `the director says: "…"` (tiếng Việt, tên thương hiệu viết theo cách đọc).
   */
  amThanh: z.string().default(''),
  /** Clip có tiếng (thoại khớp môi + tiếng môi trường). Nam 2026-10-12 bỏ luật "nhân vật AI không nói". */
  coTieng: z.boolean().default(true),
  /** Vùng giọng cho mọi nhân vật (Nam 2026-10-12: hai lần tạo Veo ra giọng Nam rồi giọng Bắc): ghi rõ trong mục AUDIO. */
  giongVung: z.enum(['nam', 'bac']).default('nam'),
  /** Cỡ clip tạo từ chữ, ghi đè cỡ mặc định của model (vd. "720x1280" cho bản thử rẻ hơn). */
  kichCo: z.enum(['720x1280', '1080x1920']).optional(),
  dan: z.record(
    slug,
    z.object({
      /** Ngoại hình (tiếng Anh): tuổi, giới, tóc, trang phục đời thường. Không tên người thật, không "giống ai". */
      moTa: z.string().min(10),
      /** Vai trong câu chuyện (tiếng Anh), để model dựng đúng hình vai: vd. "sales director", "sales employee with a headset". */
      vaiTro: z.string().default(''),
      /** Vị trí trong bối cảnh chung (tiếng Anh): đứng/ngồi ở đâu, quay về ai, vd. "standing at the head of the table facing the team". */
      viTri: z.string().default(''),
      /** Chất giọng khi nói (tiếng Anh), giữ cùng một giọng suốt video: vd. "deep, calm, cold male voice, southern Vietnamese accent". */
      giongNoi: z.string().default(''),
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
  // Gọi nhân vật bằng vai trò, không bằng mã vai: model (Veo) hay in mã/chữ trong prompt lên hình (thử 2026-10-12: "Salé")
  return `The ${d.vaiTro || 'character'}: ${d.moTa}${d.viTri ? `; position in the shared location: ${d.viTri}` : ''}${d.giongNoi ? `; voice: ${d.giongNoi}` : ''}.`;
};
/**
 * Khung người cố định (Nam xem bản 5, 2026-10-12: đồng nghiệp ngồi ghế trượt che sếp, lần tạo 2 lòi lưng người thứ tư):
 * đúng số người, mỗi người giữ chỗ, ai nói thì được quay rõ.
 */
const blocking = (c: AiSpec['canh'][number]) =>
  c.vai.length
    ? `Exactly ${c.vai.length} ${c.vai.length > 1 ? 'people' : 'person'} in the whole clip, nobody else: no extra people, backs, shoulders or heads in the foreground or background. Everyone keeps their own position for the whole clip: seated people stay seated, chairs do not move or roll, nobody walks or crosses in front of another person. Whenever someone speaks, the camera cuts or pans to that speaker and frames their face clearly.`
    : '';
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
  // Khuôn 8 thành phần (Nam 2026-10-12): chủ thể, bối cảnh, hành động + máy quay + bố cục theo từng shot, phong cách, ánh sáng, âm thanh
  return [
    `Vertical 9:16 cinematic short film, one continuous scene cut into multiple shots with hard cuts, the same characters keep the same face, hair, clothes and voice in every shot.`,
    who && `SUBJECTS: ${who}`,
    blocking(c) && `BLOCKING: ${blocking(c)}`,
    spec.chung && `CONTEXT: ${sharedPlace(spec)}`,
    `ACTION, CAMERA AND COMPOSITION (shot by shot): ${[establishing(c), c.noiTiep ? 'This clip continues seamlessly from the first frame: same place, same people, same light, the action carries on without a jump.' : '', c.moTa].filter(Boolean).join(' ')}`,
    spec.phongCach && `STYLE: ${spec.phongCach}`,
    spec.anhSang && `AMBIANCE AND LIGHTING: ${spec.anhSang}`,
    spec.coTieng ? `AUDIO: ${spec.amThanh || 'natural room sound'}. ${spec.giongVung === 'nam' ? 'Every character speaks Vietnamese with a Southern Vietnamese (Saigon, Ho Chi Minh City) accent, never a Northern (Hanoi) accent.' : 'Every character speaks Vietnamese with a Northern Vietnamese (Hanoi) accent, never a Southern accent.'} Dialogue is spoken in Vietnamese exactly as written in quotes, lip-synced, clear and intelligible: every Vietnamese syllable pronounced distinctly with correct tones, natural unhurried pace even when shouting, one speaker at a time, no mumbling, no overlapping voices, background sound kept low under speech. No subtitles.` : 'AUDIO: none.',
    AI_VIDEO.promptRules,
  ].filter(Boolean).join(' ');
}

export function motionPrompt(spec: AiSpec, c: AiSpec['canh'][number]): string {
  return [`${c.chuyenDong || 'Subtle natural movement, gentle handheld camera.'}`, `Keep the same people, faces and clothes as the first frame. Emotion: ${c.camXuc}.`, spec.chung, AI_VIDEO.promptRules].filter(Boolean).join(' ');
}

/**
 * Thoại phải có cách nói theo độ căng của cảnh (Nam 2026-10-12: "sếp phải quát lớn khi đưa ra yêu cầu"): trước mỗi
 * `: "…"` là động từ / trạng từ chỉ âm lượng, cảm xúc, nhịp (shouts loudly, stammers quietly, says confidently…).
 */
const DELIVERY = /\b(shout|yell|snap|bark|roar|scream|whisper|mutter|murmur|stammer|stutter|sigh|gasp|growl|hiss|plead|laugh|loud|soft|quiet|angr|furious|nervous|trembl|shak|calm|firm|sharp|cold|confident|relieved|excited|tense|urgent|gentle|warm|proud|satisf|frustrat|panic|hesitant|slow|fast|rapid)/i;
/** Tối đa âm tiết mỗi câu thoại (Nam 2026-10-12: "nên tách câu ngắn, ít chữ thì veo 3 sẽ nói tốt, rõ ràng hơn"). */
export const MAX_AM_TIET_MOI_CAU = 6;
export function dialogueIssues(c: { id: string; moTa: string }): string[] {
  const out: string[] = [];
  for (const m of c.moTa.matchAll(/:\s*"([^"]+)"/g)) {
    for (const cau of m[1].split(/[.!?…:;,]+/).map((x) => x.trim()).filter(Boolean)) {
      const n = cau.split(/\s+/).length;
      if (n > MAX_AM_TIET_MOI_CAU) out.push(`Cảnh "${c.id}": câu thoại "${cau}" có ${n} âm tiết, quá ${MAX_AM_TIET_MOI_CAU}: tách thành câu ngắn (model nói tiếng Việt rõ hơn khi câu ít chữ).`);
    }
    const before = c.moTa.slice(Math.max(0, m.index! - 90), m.index);
    const lead = before.split(/[.;]\s/).pop() ?? before;
    if (!DELIVERY.test(lead)) out.push(`Cảnh "${c.id}": câu thoại "${m[1].slice(0, 40)}" chưa ghi cách nói (âm lượng, cảm xúc, nhịp hợp độ căng của shot), vd. 'the director slams the table and shouts loudly, furious: "…"', 'she stammers quietly, voice trembling: "…"'.`);
  }
  return out;
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
    if (spec.coTieng) out.push(...dialogueIssues(c));
    if (c.tuChu && spec.mohinh === 'veo' && c.giay > 8) out.push(`Cảnh "${c.id}" dài ${c.giay} giây: Veo chỉ tạo tối đa 8 giây mỗi lần; dùng "mohinh": "seedance" (tới 15 giây) để mọi nhân vật ở cùng một lần tạo.`);
  }
  // Khung hình chung (Nam 2026-10-12): một bối cảnh, vai đúng hình, có cảnh toàn đủ mọi vai, mọi vai lộ mặt cùng một lần tạo
  if (spec.canh.some((c) => c.tuChu))
    for (const [k, ten] of [['phongCach', 'phong cách'], ['anhSang', 'ánh sáng / không khí'], ['amThanh', 'âm thanh']] as const)
      if (!spec[k].trim()) out.push(`Thiếu "${k}" (${ten}): prompt tạo từ chữ phải đủ 8 thành phần (dung-canh-ai, ngon-ngu-may-quay.md mục 2c).`);
  if (spec.coTieng && spec.canh.some((c) => /:\s*"[^"]+"/.test(c.moTa)))
    for (const [v, d] of Object.entries(spec.dan)) if (!d.giongNoi.trim()) out.push(`Vai "${v}": video có thoại nhưng thiếu giongNoi (chất giọng riêng, giữ suốt video).`);
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
  // Giọng đổi giữa các lần tạo (Nam nghe bản 5 Veo nối tiếp, 2026-10-12: "giọng 2 video khác nhau"): mọi câu thoại một lần tạo
  const talkGens = spec.coTieng ? spec.canh.filter((c) => c.video && /:\s*"[^"]+"/.test(c.moTa)) : [];
  if (talkGens.length > 1)
    out.push(`Thoại nằm ở ${talkGens.length} lần tạo (${talkGens.map((c) => c.id).join(', ')}): giọng nhân vật đổi giữa các lần tạo kể cả khi nối tiếp; mọi câu thoại phải trong một lần tạo (lần khác chỉ hình, không thoại).`);
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

/**
 * Kịch bản trước, clip sau (Nam 2026-10-12: "phải xong kịch bản, yêu cầu giọng từng phân cảnh, từng nhân vật cho phù hợp
 * bối cảnh trước"): video có thoại trong clip phải có `## Bảng thoại` trong concepts.md (mỗi câu: giây, shot, nhân vật,
 * câu, cách nói, vì sao) và dòng `Đã duyệt: <ai>, <ngày>` trước khi tạo clip tốn tiền.
 */
export function scriptGateIssues(concepts: string): string[] {
  const sec = concepts.split(/^##\s*Bảng thoại\s*$/m)[1]?.split(/^##\s/m)[0];
  if (sec === undefined) return ['concepts.md chưa có mục "## Bảng thoại" (mỗi câu thoại: giây · shot · nhân vật · câu · cách nói · vì sao): viết xong kịch bản và giọng từng phân cảnh trước khi tạo clip.'];
  const rows = sec.split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1);
  const out: string[] = [];
  if (!rows.length) out.push('Bảng thoại chưa có câu nào.');
  for (const r of rows) {
    const cells = r.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6 || cells.some((c) => !c)) out.push(`Bảng thoại: dòng "${r.slice(0, 60)}" thiếu cột (giây · shot · nhân vật · câu · cách nói · vì sao).`);
  }
  if (!/^Đã duyệt:\s*\S+/m.test(sec)) out.push('Bảng thoại chưa được duyệt: gửi kịch bản + bảng thoại cho người duyệt, ghi "Đã duyệt: <ai>, <ngày>" dưới bảng rồi mới tạo clip.');
  return out;
}

/** File prompt dễ đọc trong brief (Nam 2026-10-12: "trong brief lưu lại prompt để theo dõi"): ai/prompt.md. */
export const PROMPT_FILE = 'prompt.md';

/** Bản xem trước: đúng prompt sẽ gửi cho từng ảnh/clip, chưa tốn tiền (./reel ai <tên> --xem-prompt). */
export function promptPreview(spec: AiSpec, model: { video: string; image: string }): string {
  const parts = ['## Bản xem trước (chưa gửi)', ''];
  const tuChuOnly = spec.canh.every((c) => !c.video || c.tuChu);
  if (!tuChuOnly) for (const v of Object.keys(spec.dan)) parts.push(`### Ảnh vai ${v} · ${model.image}`, '', '```', rolePrompt(spec, v), '```', '');
  for (const c of spec.canh) {
    if (!c.tuChu) parts.push(`### Khung đầu ${c.id} (khung ${c.khung}) · ${model.image}`, '', '```', framePrompt(spec, c), '```', '');
    if (c.video) parts.push(`### Clip ${c.id} (${c.giay} giây${spec.coTieng ? ', có tiếng' : ''}${c.noiTiep ? `, nối tiếp ${c.noiTiep}` : ''}) · ${c.tuChu ? model.video : 'clip từ khung đầu'}`, '', '```', c.tuChu ? textVideoPrompt(spec, c) : motionPrompt(spec, c), '```', '');
  }
  return parts.join('\n');
}

/** Một mục lịch sử: mỗi lần gửi model ghi thêm vào ai/prompt.md (giờ, việc, model, giây, tiền ước, prompt nguyên văn). */
export function promptLogEntry(e: { at: string; viec: string; model: string; giay?: number; uocVnd: string; prompt: string }): string {
  return [`### ${e.at} · ${e.viec} · ${e.model}${e.giay ? ` · ${e.giay} giây` : ''} · ước ${e.uocVnd}`, '', '```', e.prompt, '```', ''].join('\n');
}

/** Ghép file prompt.md: phần xem trước (thay mới mỗi lần --xem-prompt) + lịch sử gửi (chỉ thêm, không xoá). */
export function mergePromptFile(old: string, opts: { preview?: string; entry?: string }): string {
  const HIST = '## Lịch sử gửi model';
  const [head, hist = ''] = old.includes(HIST) ? old.split(HIST) : [old, ''];
  const preview = opts.preview ?? (head.includes('## Bản xem trước') ? head.slice(head.indexOf('## Bản xem trước')).trim() : '');
  const title = '# Prompt cảnh AI\n\nPhần xem trước: `./reel ai <tên> --xem-prompt` (chưa tốn tiền). Lịch sử: mỗi lần gửi model máy ghi thêm, mới nhất ở cuối.\n';
  return [title, preview, `${HIST}\n${hist.trim() ? `\n${hist.trim()}\n` : ''}${opts.entry ? `\n${opts.entry}` : ''}`].filter(Boolean).join('\n') + '\n';
}

