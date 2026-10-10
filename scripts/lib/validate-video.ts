/**
 * Kiểm tra brief + script của một video theo REQUIREMENTS v0.4 §6.1–6.2, §7, §8.
 * Trả danh sách lỗi/cảnh báo bằng tiếng Việt, kèm cách sửa, để skill tao-reel đọc lại cho MKT.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, isAbsolute, join, normalize } from 'node:path';
import type { z } from 'zod';
import { BriefSchema, type Brief } from '../../config/brief.schema.ts';
import { aiRuleIssues, kieuHinhIssue } from './kieu-hinh-rules.ts';
import { checkTrack, findTrack, MusicManifestSchema, type MusicPurpose, usableSec } from '../../config/music-manifest.ts';
import { countWords, sceneDurationSec } from '../../config/scene-timing.ts';
import { availableStylePresets, hasStylePreset } from '../../config/style-preset.schema.ts';
import { resolveStyle } from './resolve-style.ts';
import { factIssues } from './fact-check.ts';
import { assetPaths } from './build-props.ts';
import { clipIssues } from './clip-check.ts';
import { mediaWarnings } from './brief-media.ts';
import { compositionPath, CUSTOM_DIR, customIssues } from './custom-video.ts';
import { VOICE } from '../../config/voice.ts';
import { motionIssues, repetitionIssues } from './motion-check.ts';
import { recentForBrief } from './recent-videos.ts';
import { getOccasion, OCCASIONS } from '../../config/occasions.ts';
import { ScriptSchema, type Script } from '../../config/script.schema.ts';
import { NO_PAIN_TYPES, REEL_SEC, getVideoType, reelRange, type SceneRole, type VideoType } from '../../config/video-types.ts';
import { readBriefFile, readScriptFile } from './brief.ts';
import { REPO_ROOT } from './hyperframes-env.ts';

export const HOOK_MAX_CHARS_PER_LINE = 40;
export const HOOK_MAX_LINES = 2;
export const DURATION_TOLERANCE = 0.1;
export const MAX_WORDS_PER_SCENE = 10;
export const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp4', '.mov', '.webm'];

export interface Issue {
  level: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  brief?: Brief;
  script?: Script;
  videoType?: VideoType;
  issues: Issue[];
}

const err = (message: string): Issue => ({ level: 'error', message });
const warn = (message: string): Issue => ({ level: 'warning', message });

function zodIssues(prefix: string, e: z.ZodError): Issue[] {
  return e.issues.map((i) => err(`${prefix}: trường "${i.path.join('.') || '(gốc)'}" chưa đúng (${i.message}).`));
}

/** Thứ tự role của script phải khớp mẫu của loại video; `repeatRole` được lặp nhiều cảnh liên tiếp. */
export function rolesMatch(actual: SceneRole[], expected: SceneRole[], repeatRole?: SceneRole): boolean {
  let i = 0;
  for (const role of expected) {
    if (actual[i] !== role) return false;
    i++;
    if (role === repeatRole) while (actual[i] === role) i++;
  }
  return i === actual.length;
}

export function hookIssues(hook: string): Issue[] {
  const lines = hook.split('\n');
  const out: Issue[] = [];
  if (lines.length > HOOK_MAX_LINES) out.push(err(`Hook có ${lines.length} dòng; tối đa ${HOOK_MAX_LINES} dòng.`));
  lines.forEach((l, i) => {
    const n = [...l.trim()].length;
    if (n > HOOK_MAX_CHARS_PER_LINE) out.push(err(`Hook dòng ${i + 1} dài ${n} ký tự; tối đa ${HOOK_MAX_CHARS_PER_LINE}. Rút gọn câu.`));
  });
  return out;
}

export function validateVideo(dir: string, opts: { musicPurpose: MusicPurpose; voiceDraft?: boolean } = { musicPurpose: 'production' }): ValidationResult {
  const issues: Issue[] = [];

  let brief: Brief | undefined;
  try {
    const fm = readBriefFile(dir).frontmatter;
    const kh = kieuHinhIssue((fm as Record<string, unknown>).kieuHinh);
    if (kh) issues.push(kh);
    const parsed = BriefSchema.safeParse(fm);
    if (parsed.success) brief = parsed.data;
    else issues.push(...zodIssues('brief.md', parsed.error).filter((i) => !(kh && i.message.includes('"kieuHinh"'))));
  } catch (e) {
    issues.push(err((e as Error).message));
  }

  let script: Script | undefined;
  try {
    const parsed = ScriptSchema.safeParse(readScriptFile(dir));
    if (parsed.success) script = parsed.data;
    else issues.push(...zodIssues('script.json', parsed.error));
  } catch (e) {
    issues.push(err((e as Error).message));
  }
  if (!brief || !script) return { brief, script, issues };

  const type = getVideoType(script.videoType);
  if (!type) {
    issues.push(err(`Loại video "${script.videoType}" không có trong danh sách (docs/video-type-guide.md).`));
    return { brief, script, issues };
  }
  if (brief.videoType !== 'auto' && brief.videoType !== script.videoType) {
    issues.push(err(`Kịch bản dùng loại "${script.videoType}" nhưng brief ghi "${brief.videoType}".`));
  }
  if (brief.product !== script.product) issues.push(err(`Kịch bản dùng sản phẩm "${script.product}" nhưng brief ghi "${brief.product}".`));
  if (!type.templates.includes(script.template)) {
    issues.push(err(`Loại "${type.name}" dùng template ${type.templates.join(' / ')}, không dùng ${script.template}.`));
  }
  if (brief.template !== 'auto' && brief.template !== script.template) {
    issues.push(err(`Kịch bản dùng template "${script.template}" nhưng brief ghi "${brief.template}".`));
  }
  if (!type.products.includes(script.product)) {
    issues.push(warn(`Loại "${type.name}" thường không dùng cho sản phẩm "${script.product}".`));
  }

  // LUẬT SỐ 1 — 3 giây đầu, chặn ngay ở bước kịch bản (references/chon-diem-hap-dan.md)
  const dhd = script.concept.diemHapDan;
  if (!dhd) issues.push(err('LUẬT SỐ 1 — 3 giây đầu: script.json thiếu concept.diemHapDan { ungVien, diem } (điểm hấp dẫn đã chọn từ brief và điểm 5 tiêu chí).'));
  else if (dhd.diem < 20) issues.push(err(`LUẬT SỐ 1 — 3 giây đầu: điểm hấp dẫn "${dhd.ungVien}" chỉ ${dhd.diem}/25 (cần ≥ 20). Chọn ứng viên mạnh hơn trong brief.`));
  const conceptsFile = join(dir, 'concepts.md');
  if (!existsSync(conceptsFile) || !/^##\s*Điểm hấp dẫn/m.test(readFileSync(conceptsFile, 'utf8'))) issues.push(err('LUẬT SỐ 1 — 3 giây đầu: concepts.md thiếu mục "## Điểm hấp dẫn" (bảng ứng viên + điểm 5 tiêu chí).'));
  const hookScene = script.scenes[0];
  // Cảnh hook gói trong 3,5 giây; hook 8 từ không giọng được vừa đủ thời gian đọc chữ hook (3,7 giây), không hơn
  const hookCap = hookScene ? Math.max(3.5, sceneDurationSec(hookScene.onScreenText)) : 3.5;
  if (hookScene && hookScene.durationSec > hookCap) issues.push(err(`LUẬT SỐ 1 — 3 giây đầu: cảnh hook "${hookScene.id}" dài ${hookScene.durationSec}s; hook phải gói trong ${String(hookCap).replace('.', ',')} giây (mở bằng điểm mạnh nhất, kể lại sau).`));
  if (countWords(script.hook.replace(/\n/g, ' ')) > 8) issues.push(err(`LUẬT SỐ 1 — 3 giây đầu: hook "${script.hook}" quá 8 từ.`));

  // NỖI ĐAU → GIẢI PHÁP (Nam 2026-10-10: "phải nổi bật được nỗi đau của khách hàng và cách sản phẩm giải quyết nó"), chặn ở bước kịch bản
  if (!NO_PAIN_TYPES.has(type.id)) {
    const { noiDau, giaiPhap } = script.concept;
    const at = (id: string) => script.scenes.findIndex((s) => s.id === id);
    const startOf = (i: number) => script.scenes.slice(0, i).reduce((sum, s) => sum + s.durationSec, 0);
    const len = script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
    if (!noiDau) issues.push(err('Nỗi đau → giải pháp: script.json thiếu concept.noiDau { khach, canh } (nỗi đau cụ thể của khách trong brief và cảnh làm nó nổi bật).'));
    if (!giaiPhap) issues.push(err('Nỗi đau → giải pháp: script.json thiếu concept.giaiPhap { cach, canh } (sản phẩm giải quyết nỗi đau đó thế nào và cảnh cho thấy).'));
    if (noiDau && giaiPhap) {
      const p = at(noiDau.canh), g = at(giaiPhap.canh);
      if (p < 0) issues.push(err(`Nỗi đau → giải pháp: không có cảnh "${noiDau.canh}" (concept.noiDau.canh).`));
      else if (!['hook', 'problem'].includes(script.scenes[p].role)) issues.push(err(`Nỗi đau → giải pháp: cảnh nỗi đau "${noiDau.canh}" phải là hook hoặc problem.`));
      if (g < 0) issues.push(err(`Nỗi đau → giải pháp: không có cảnh "${giaiPhap.canh}" (concept.giaiPhap.canh).`));
      else if (script.scenes[g].role !== 'solution') issues.push(err(`Nỗi đau → giải pháp: cảnh giải pháp "${giaiPhap.canh}" phải là solution.`));
      if (p >= 0 && g >= 0 && g <= p) issues.push(err('Nỗi đau → giải pháp: cảnh giải pháp phải đến sau cảnh nỗi đau.'));
      if (g >= 0 && startOf(g) > len * 0.7 + 1e-6) issues.push(err(`Nỗi đau → giải pháp: giải pháp bắt đầu ở giây ${startOf(g).toFixed(1)}, quá muộn (phải trước 70% video, ${(len * 0.7).toFixed(1)} giây) để người xem kịp thấy sản phẩm giải quyết.`));
      const solSec = script.scenes.filter((s) => s.role === 'solution').reduce((sum, s) => sum + s.durationSec, 0);
      if (solSec + 1e-6 < len * 0.2) issues.push(err(`Nỗi đau → giải pháp: cảnh giải pháp chỉ ${solSec.toFixed(1)} giây; cần ≥ 20% video (${(len * 0.2).toFixed(1)} giây) để thấy rõ sản phẩm giải quyết thế nào.`));
    }
  }

  // Hook, vai trò cảnh, CTA
  issues.push(...hookIssues(script.hook));
  const roles = script.scenes.map((s) => s.role);
  if (!rolesMatch(roles, type.roles, type.repeatRole)) {
    // Dựng riêng tự kể chuyện theo cảnh của brief: thứ tự mẫu chỉ là gợi ý
    issues.push((script.build === 'custom' ? warn : err)(`Thứ tự cảnh ${roles.join(' → ')} chưa đúng mẫu của "${type.name}": ${type.roles.join(' → ')}${type.repeatRole ? ` (được lặp "${type.repeatRole}")` : ''}.`));
  }
  if (script.scenes[0].onScreenText !== script.hook.replace(/\n/g, ' ')) {
    issues.push(err('Chữ của cảnh đầu (hook) phải trùng với trường "hook" (xuống dòng thay bằng dấu cách).'));
  }
  const ctaScene = script.scenes.find((s) => s.role === 'cta');
  if (ctaScene && ctaScene.onScreenText !== script.cta) issues.push(err('Chữ của cảnh CTA phải trùng với trường "cta".'));

  // Thời lượng. Video có giọng đọc AI: lời phụ (subText) là lời nói, phụ đề chạy theo giọng; cảnh chỉ cần đủ đọc câu nhấn
  // (giọng đọc hết trước cuối video kiểm ở customIssues)
  const hasVoice = script.build === 'custom' && existsSync(join(dir, CUSTOM_DIR, VOICE.file));
  const total = script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  for (const s of script.scenes) {
    const min = hasVoice ? sceneDurationSec(s.onScreenText) : sceneDurationSec(s.onScreenText, s.subText);
    if (s.durationSec + 1e-9 < min) issues.push(err(`Cảnh "${s.id}" dài ${s.durationSec}s, cần tối thiểu ${min}s để kịp đọc chữ.`));
  }
  const range = reelRange(type);
  if (total < range.min || total > range.max) {
    issues.push(err(`Tổng thời lượng ${total.toFixed(1)}s nằm ngoài khoảng ${range.min}–${range.max}s (loại "${type.name}", luật cứng reel ${REEL_SEC.min}–${REEL_SEC.max} giây).`));
  }
  if (Math.abs(total - brief.duration) > brief.duration * DURATION_TOLERANCE) {
    issues.push(err(`Tổng thời lượng ${total.toFixed(1)}s lệch quá 10% so với brief (${brief.duration}s).`));
  }
  const ideas = roles.filter((r) => r === 'solution').length;
  if (!type.repeatRole && total <= 45 && ideas > 2) {
    issues.push(err(`Video ≤ 45 giây chỉ nên có 1–2 ý chính; kịch bản đang có ${ideas}.`));
  } else if (!type.repeatRole && ideas > 3) {
    issues.push(err(`Video dài hơn 45 giây tối đa 3 ý chính; kịch bản đang có ${ideas}.`));
  }
  const ids = script.scenes.map((s) => s.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) issues.push(err(`Mã cảnh bị trùng: ${[...new Set(dup)].join(', ')}.`));
  for (const s of script.scenes) {
    if (s.role !== 'hook' && countWords(s.onScreenText) > MAX_WORDS_PER_SCENE) {
      issues.push(warn(`Cảnh "${s.id}" có ${countWords(s.onScreenText)} từ; nên ≤ ${MAX_WORDS_PER_SCENE} từ, một ý mỗi cảnh.`));
    }
  }

  // Phong cách: có preset dựng được, khớp brief
  if (!hasStylePreset(REPO_ROOT, script.style)) {
    issues.push(err(`Phong cách "${script.style}" chưa dựng được ở bản hiện tại. Chọn một trong: ${availableStylePresets(REPO_ROOT).join(', ')}.`));
  }
  const briefStyle = brief.style?.trim();
  if (briefStyle && briefStyle !== 'auto' && briefStyle !== script.style) {
    issues.push(err(`Brief chọn phong cách "${briefStyle}" nhưng kịch bản dùng "${script.style}".`));
  } else if (!briefStyle) {
    try {
      const expected = resolveStyle({ videoType: script.videoType, occasion: brief.occasion }).style;
      if (expected !== script.style) issues.push(warn(`Brief để trống phong cách, mặc định là "${expected}" nhưng kịch bản dùng "${script.style}". Nhớ báo MKT.`));
    } catch {
      /* loại video sai đã báo ở trên */
    }
  }
  if (brief.music !== 'auto' && brief.music !== script.music) issues.push(err(`Brief chọn nhạc "${brief.music}" nhưng kịch bản dùng "${script.music}".`));
  if (type.avoidStyles.includes(script.style)) {
    issues.push(warn(`Phong cách "${script.style}" thường không hợp với "${type.name}". Hỏi lại MKT trước khi dựng.`));
  }

  // Tiếng Việt: chuẩn NFC
  const texts = [
    script.hook,
    script.cta,
    ...script.scenes.flatMap((s) => [s.onScreenText, s.subText ?? '', s.attribution ?? '', ...Object.values(s.promo ?? {}).map(String), ...(s.stats ?? []).flatMap((st) => [st.value, st.label])]),
  ];
  if (texts.some((t) => t !== t.normalize('NFC'))) issues.push(err('Có chữ chưa ở dạng Unicode NFC (dấu tiếng Việt bị tách). Gõ lại hoặc chuẩn hóa NFC.'));

  // Chống bịa: số, giá, tên khách, quote phải có trong brief
  const briefBody = readBriefFile(dir).body;
  issues.push(...factIssues(script, briefBody));
  if (script.build === 'custom') {
    // Dựng riêng: bố cục/chuyển động do composition quyết định; kiểm composition (cấu trúc, nhạc, chống bịa chữ)
    const totalSec = script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
    issues.push(...customIssues(dir, script, briefBody, Math.round(totalSec * 1000) / 1000, opts.voiceDraft));
  } else {
    issues.push(...motionIssues(script));
    issues.push(...repetitionIssues(script, recentForBrief(dir)));
  }
  // Kiểu hình: luật cứng minh hoạ / người thật do AI tạo (không có cờ bỏ qua)
  const customHtml = script.build === 'custom' && existsSync(compositionPath(dir)) ? readFileSync(compositionPath(dir), 'utf8') : '';
  issues.push(...aiRuleIssues({ dir, kieuHinh: brief.kieuHinh, script, html: customHtml, hasVoice }));
  if (brief.occasion && !getOccasion(brief.occasion)) {
    issues.push(warn(`Dịp lễ "${brief.occasion}" chưa có trong lịch, nên không tự chọn phong cách theo dịp. Có: ${OCCASIONS.map((o) => o.id).join(', ')}.`));
  }

  // Asset
  const assetCountBefore = issues.length;
  for (const a of new Set([...brief.assets, ...assetPaths(script)])) {
    const rel = normalize(a);
    if (isAbsolute(rel) || rel.startsWith('..')) {
      issues.push(err(`Hình/clip "${a}" phải nằm trong thư mục dự án (vd. assets/sipos/…).`));
      continue;
    }
    const p = join(REPO_ROOT, rel);
    if (!existsSync(p)) issues.push(err(`Thiếu file hình/clip: ${a}.`));
    else if (!statSync(p).isFile()) issues.push(err(`"${a}" là thư mục, không phải file hình/clip.`));
    else if (!ASSET_EXTENSIONS.includes(extname(p).toLowerCase())) issues.push(err(`"${a}" không phải định dạng hình/clip hỗ trợ (${ASSET_EXTENSIONS.join(', ')}).`));
  }
  for (const s of script.scenes) {
    if ((s.visual.type === 'asset' || s.visual.type === 'phone' || s.visual.type === 'split') && !s.visual.src) {
      issues.push(err(`Cảnh "${s.id}" kiểu "${s.visual.type}" cần đường dẫn hình/clip (visual.src).`));
    }
  }
  // Độ dài / tiếng của clip: chỉ khi mọi file đã có
  if (issues.length === assetCountBefore) issues.push(...clipIssues(script));
  issues.push(...mediaWarnings(dir, script, ASSET_EXTENSIONS).map(warn));

  // Nhạc
  try {
    const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
    const track = findTrack(manifest, script.music);
    if (!track) issues.push(err(`Không có nhạc "${script.music}" trong thư viện (brand/music/manifest.json).`));
    else {
      issues.push(...checkTrack(track, opts.musicPurpose).map(err));
      if (usableSec(track) + 1e-9 < total) issues.push(err(`Nhạc "${track.title}" dùng được ${usableSec(track)}s, ngắn hơn video ${total.toFixed(1)}s.`));
    }
  } catch (e) {
    issues.push(err(`Thư viện nhạc lỗi: ${(e as Error).message}`));
  }

  if (!script.selfScore) issues.push(warn('Kịch bản chưa có điểm tự chấm (selfScore). Claude cần tự chấm ≥ 85 trước khi đưa MKT duyệt.'));
  else {
    // LUẬT SỐ 1 — 3 giây đầu (references/chon-diem-hap-dan.md): điểm hook tự chấm ≥ 20/25, ghi "Hook N/25" trong notes
    const hook = /Hook\s*(\d+(?:[.,]\d+)?)\s*\/\s*25/i.exec(script.selfScore.notes ?? '');
    if (!hook) issues.push(err('LUẬT SỐ 1 — 3 giây đầu: selfScore.notes phải ghi "Hook N/25" (điểm của điểm hấp dẫn đã chọn, chon-diem-hap-dan.md).'));
    else if (Number(hook[1].replace(',', '.')) < 20) issues.push(err(`LUẬT SỐ 1 — 3 giây đầu: hook ${hook[1]}/25 dưới 20. Chọn điểm hấp dẫn mạnh hơn trong brief (chon-diem-hap-dan.md).`));
  }
  if (script.selfScore && script.selfScore.total < 85) {
    issues.push(err(`Điểm tự chấm ${script.selfScore.total}/100 dưới ngưỡng 85. Sửa kịch bản trước khi đưa MKT duyệt.`));
  }

  return { brief, script, videoType: type, issues };
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((i) => i.level === 'error');
}

export function formatIssues(issues: Issue[]): string {
  return issues.map((i) => `${i.level === 'error' ? '✗' : '!'} ${i.message}`).join('\n');
}
