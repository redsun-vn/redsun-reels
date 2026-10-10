/**
 * Luật cứng cho kiểu hình của video (REQUIREMENTS v0.5 §7.4–7.5, skill chon-kieu-hinh). Validate gọi mọi lần; lỗi ở đây
 * chặn dựng/xuất, không có cờ bỏ qua. Chỉ dev sửa luật (config/ai-video.ts, config/stock-footage.ts, file này).
 * - `minh-hoa`: không được dùng file trong thư mục cảnh AI hay clip quay sẵn.
 * - `nguoi-that-quay-san`: không dùng cảnh AI; loại video cho phép; mọi clip có trong sổ nguồn (Pexels/Pixabay,
 *   link đúng nguồn, tác giả, đã kiểm không phải AI).
 * - `nguoi-that-ai`: quy trình phải được bật; loại video cho phép; dựng riêng; nhãn AI trên hình từ đầu đến hết,
 *   không bị ẩn/làm mờ bằng CSS hay JS; mọi cảnh AI có trong nhật ký tạo; caption có nhãn.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { AI_LABEL_ON_SCREEN, AI_VIDEO, aiLabelFor, KIEU_HINH, type KieuHinh } from '../../config/ai-video.ts';
import { CAM_XUC, STOCK_FOOTAGE } from '../../config/stock-footage.ts';
import type { Script } from '../../config/script.schema.ts';
import { assetPaths } from './build-props.ts';
import { checkStockLink, type StockCut } from './stock-footage.ts';

export interface RuleIssue {
  level: 'error' | 'warning';
  message: string;
}

export const LABEL_ATTR = 'data-nhan-ai';
export const LABEL_CLASS = 'rs-nhan-ai';

const refPattern = (folder: string) => new RegExp(`(?:src|href)\\s*=\\s*["'](${folder}/[^"']+)["']`, 'g');

/** Kiểu hình trong frontmatter brief: thiếu hoặc sai là lỗi (Claude phải hỏi MKT, không tự chọn). */
export function kieuHinhIssue(value: unknown): RuleIssue | null {
  if (typeof value === 'string' && (KIEU_HINH as readonly string[]).includes(value)) return null;
  return { level: 'error', message: `brief.md chưa chọn kiểu hình (kieuHinh: ${KIEU_HINH.join(' | ')}). Hỏi MKT theo skill chon-kieu-hinh, không tự chọn.` };
}

/** File trong một thư mục của brief (ai/, quay-san/) được tham chiếu trong composition và script. */
function folderRefs(folder: string, html: string, script: Script): string[] {
  const fromHtml = [...html.matchAll(refPattern(folder))].map((m) => normalize(m[1]));
  const fromScript = assetPaths(script).map(normalize).filter((p) => p.split('/').includes(folder));
  return [...new Set([...fromHtml, ...fromScript])];
}

/** File cảnh AI được tham chiếu trong composition và script. */
export const aiRefs = (html: string, script: Script) => folderRefs(AI_VIDEO.dir, html, script);
/** Clip quay sẵn được tham chiếu trong composition và script. */
export const stockRefs = (html: string, script: Script) => folderRefs(STOCK_FOOTAGE.dir, html, script);

export interface StockEntry {
  file: string;
  source: string;
  link: string;
  author: string;
  license: string;
  /** Đã mở trang nguồn kiểm: clip không bị đánh dấu do AI tạo. */
  aiGenerated: boolean;
  /** Vai trong kịch bản (chu-quan, nhan-vien, khach…). */
  vai?: string;
  /** Người mẫu trong clip (tác giả + đặc điểm/loạt), để một vai luôn là một người. */
  nguoi?: string;
  /** Cảm xúc thấy trên mặt trong đoạn dùng (config/stock-footage.ts CAM_XUC). */
  camXuc?: string;
  /** Đã xem: người trong clip là người châu Á (Nam 2026-10-10: chủ thể là người châu Á). */
  chauA?: boolean;
  /** Miệng người trong đoạn dùng: `im` (không nói: cười, khóc, nhíu mày, nghe) hay `noi` (đang nói). Video có giọng chỉ dùng `im`. */
  mieng?: 'im' | 'noi';
  /** Đoạn đã cắt từ clip nguồn: máy khác tải lại đúng đoạn bằng ./reel quay-san <tên> --tai-lai. */
  cat?: StockCut;
  addedAt: string;
}

/** Sổ nguồn clip quay sẵn: mục hợp lệ (đúng nguồn được phép, đủ trường, không phải AI) theo đường dẫn quay-san/<file>. */
export function stockLog(dir: string): { valid: Map<string, StockEntry>; invalid: Map<string, string>; errors: string[] } {
  const valid = new Map<string, StockEntry>();
  const invalid = new Map<string, string>();
  const errors: string[] = [];
  const p = join(dir, STOCK_FOOTAGE.dir, STOCK_FOOTAGE.logFile);
  if (!existsSync(p)) return { valid, invalid, errors };
  let items: StockEntry[] = [];
  try {
    items = (JSON.parse(readFileSync(p, 'utf8')) as { items?: StockEntry[] }).items ?? [];
  } catch {
    return { valid, invalid, errors: [`${STOCK_FOOTAGE.dir}/${STOCK_FOOTAGE.logFile} không đọc được (JSON lỗi).`] };
  }
  for (const it of items) {
    const key = normalize(`${STOCK_FOOTAGE.dir}/${it.file}`);
    let reason = '';
    try {
      if (checkStockLink(it.link).id !== it.source) reason = `nguồn ghi "${it.source}" không khớp link.`;
    } catch (e) {
      reason = (e as Error).message;
    }
    if (!reason && !it.author?.trim()) reason = 'thiếu tác giả.';
    if (!reason && it.aiGenerated !== false) reason = 'chưa kiểm hoặc là clip do AI tạo. Clip quay sẵn phải là quay thật.';
    if (!reason && (!it.vai?.trim() || !it.nguoi?.trim() || !(CAM_XUC as readonly string[]).includes(it.camXuc ?? ''))) reason = `thiếu vai, người mẫu hoặc cảm xúc (cảm xúc: ${CAM_XUC.join(', ')}). Thêm lại bằng ./reel quay-san … --vai=… --nguoi=… --cam-xuc=….`;
    if (!reason && it.camXuc !== 'khong-mat' && it.chauA !== true) reason = 'chưa xác nhận người châu Á (chủ thể phải là người châu Á; thêm lại bằng ./reel quay-san … --chau-a sau khi xem mặt người trong clip).';
    if (reason) invalid.set(key, reason);
    else valid.set(key, it);
  }
  return { valid, invalid, errors };
}

/** Nhãn AI: phần tử data-nhan-ai, đúng chữ, class rs-nhan-ai, nằm ngoài mọi .clip (hiện suốt video). */
export function labelIssues(html: string, label: string = AI_LABEL_ON_SCREEN): string[] {
  const out: string[] = [];
  const body = html.replace(/<!--[\s\S]*?-->/g, '');
  const tags = [...body.matchAll(new RegExp(`<([a-zA-Z][\\w-]*)\\b([^>]*\\b${LABEL_ATTR}\\b[^>]*)>([^<]*)<\\/\\1>`, 'g'))];
  if (tags.length !== 1) {
    out.push(`Thiếu nhãn AI trên hình: đặt đúng một <div class="${LABEL_CLASS}" ${LABEL_ATTR}>${label}</div> là con trực tiếp của gốc composition (ngoài mọi .clip).`);
    return out;
  }
  const [whole, , attrs, text] = tags[0];
  if (text.trim() !== label) out.push(`Nhãn AI phải đúng chữ "${label}" (đang là "${text.trim()}").`);
  if (!new RegExp(`class="[^"]*\\b${LABEL_CLASS}\\b`).test(attrs)) out.push(`Nhãn AI phải dùng class "${LABEL_CLASS}" của bộ dụng cụ (vị trí, cỡ chữ, tương phản cố định).`);
  if (/\bstyle\s*=/.test(attrs)) out.push('Nhãn AI không được có style riêng (không đổi vị trí, cỡ, màu, độ mờ).');
  // Cha của nhãn: phải là gốc composition, không nằm trong clip (clip chỉ hiện một đoạn)
  const before = body.slice(0, body.indexOf(whole));
  const stack: Array<{ tag: string; attrs: string }> = [];
  for (const m of before.matchAll(/<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const tag = m[1].toLowerCase();
    if (['meta', 'link', 'img', 'br', 'hr', 'input', 'source'].includes(tag) || m[3] === '/') continue;
    if (m[0].startsWith('</')) { const i = stack.map((x) => x.tag).lastIndexOf(tag); if (i >= 0) stack.length = i; continue; }
    stack.push({ tag, attrs: m[2] });
  }
  const parent = stack[stack.length - 1]?.attrs ?? '';
  if (!/data-composition-id="main"/.test(parent)) out.push('Nhãn AI phải là con trực tiếp của gốc composition (data-composition-id="main"), không nằm trong cảnh hay lớp máy quay.');
  // Không được ẩn/làm mờ/che bằng CSS hoặc JS
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  if (/nhan-ai/.test(styles)) out.push('CSS của video không được nhắm vào nhãn AI (chỉ bộ dụng cụ định dạng nhãn).');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
  if (/nhan-ai|nhanAi/.test(scripts)) out.push('JS của video không được chạm vào nhãn AI (không ẩn, không làm mờ, không di chuyển).');
  return out;
}

export interface AiRuleInput {
  /** Thư mục brief. */
  dir: string;
  kieuHinh: KieuHinh;
  script: Script;
  /** Composition dựng riêng (nếu có). */
  html?: string;
  /** Video có giọng đọc do AI tạo (dung-rieng/loi-doc.json): cũng bắt buộc nhãn AI. */
  hasVoice?: boolean;
}

export function aiRuleIssues(input: AiRuleInput): RuleIssue[] {
  const out = imageRuleIssues(input);
  const err = (message: string) => out.push({ level: 'error', message });
  // Nhãn AI: video có hình người thật AI hoặc giọng đọc AI
  const need = aiLabelFor(input.kieuHinh === 'nguoi-that-ai', !!input.hasVoice);
  if (!need) return out;
  if (input.hasVoice && input.script.build !== 'custom') err('Video có giọng đọc AI phải dựng riêng ("build": "custom").');
  if (input.script.build === 'custom') for (const m of labelIssues(input.html ?? '', need.label)) err(m);
  const post = join(input.dir, 'post.md');
  if (existsSync(post)) {
    const caption = readFileSync(post, 'utf8').split('## Caption')[1] ?? '';
    const first = caption.split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('(') && !/^copy/i.test(l) && !l.startsWith('#'));
    if (first !== need.caption) err(`Caption (post.md) phải mở đầu bằng "${need.caption}". Chạy lại ./reel post, khi thay caption của brief vẫn giữ dòng này.`);
  }
  return out;
}

function imageRuleIssues({ dir, kieuHinh, script, html = '' }: AiRuleInput): RuleIssue[] {
  const out: RuleIssue[] = [];
  const err = (message: string) => out.push({ level: 'error', message });
  const refs = aiRefs(html, script);

  const stock = stockRefs(html, script);
  if (kieuHinh === 'minh-hoa') {
    if (refs.length) err(`Video kiểu minh hoạ không được dùng cảnh AI (${refs.slice(0, 3).join(', ')}). Muốn dùng người thật do AI tạo: hỏi MKT đổi kiểu hình (skill chon-kieu-hinh).`);
    if (stock.length) err(`Video kiểu minh hoạ không được dùng clip quay sẵn (${stock.slice(0, 3).join(', ')}). Muốn dùng: hỏi MKT đổi kiểu hình sang "người thật quay sẵn".`);
    return out;
  }

  if (kieuHinh === 'nguoi-that-quay-san') {
    if (refs.length) err(`Video người thật quay sẵn không được dùng cảnh AI (${refs.slice(0, 3).join(', ')}). Cần cảnh AI thì đổi kiểu hình sang "người thật do AI tạo" (có nhãn AI).`);
    if ((AI_VIDEO.forbiddenVideoTypes as readonly string[]).includes(script.videoType)) err(`Loại video "${script.videoType}" không được dùng người trong clip quay sẵn (người lạ không phải khách hàng, nhân viên, đội ngũ hay sự kiện của mình). Dùng minh hoạ hoặc hình/clip thật MKT gửi.`);
    if (!stock.length) err('Video người thật quay sẵn nhưng chưa dùng clip nào trong quay-san/ (thêm bằng ./reel quay-san). Đổi kiểu hình về minh hoạ nếu không dùng.');
    const { valid, invalid, errors } = stockLog(dir);
    for (const e of errors) err(e);
    for (const r of stock) {
      if (!existsSync(join(dir, r))) err(valid.get(r)?.cat ? `Máy này chưa có clip "${r}": chạy ./reel quay-san <tên-video> --tai-lai (tải lại đúng đoạn từ nguồn).` : `Không có file clip "${r}".`);
      else if (invalid.has(r)) err(`Clip quay sẵn "${r}": ${invalid.get(r)}`);
      else if (!valid.has(r)) err(`Clip "${r}" chưa có trong sổ nguồn ${STOCK_FOOTAGE.dir}/${STOCK_FOOTAGE.logFile} hợp lệ. Thêm clip bằng ./reel quay-san (ghi link trang clip, tác giả, đã kiểm không phải AI).`);
    }
    // Một vai là một người suốt video; vai xấu không lộ mặt
    const byRole = new Map<string, Set<string>>();
    for (const r of stock) {
      const it = valid.get(r);
      if (!it?.vai || !it.nguoi) continue;
      if (!byRole.has(it.vai)) byRole.set(it.vai, new Set());
      byRole.get(it.vai)!.add(it.nguoi);
    }
    for (const [vai, people] of byRole) if (people.size > 1) err(`Vai "${vai}" đang do ${people.size} người khác nhau đóng (${[...people].join('; ')}). Một vai phải là một người suốt video.`);
    return out;
  }

  // nguoi-that-ai
  if (!AI_VIDEO.enabled) err('Quy trình người thật do AI tạo chưa bật (cần dev: REQUIREMENTS §7.4, M5). Làm bản minh hoạ, hoặc chờ Nam bật.');
  if ((AI_VIDEO.forbiddenVideoTypes as readonly string[]).includes(script.videoType)) err(`Loại video "${script.videoType}" không được dùng người thật do AI tạo (cần người, lời nói, sự kiện hay đội ngũ thật). Dùng kiểu minh hoạ hoặc hình/clip thật MKT gửi.`);
  if (script.build !== 'custom') err('Video người thật do AI tạo phải dựng riêng ("build": "custom"): mẫu có sẵn không có nhãn AI.');
  else {
    // Mọi cảnh AI phải do quy trình của dự án tạo: có trong nhật ký (model, mô tả tạo), file có thật
    const logPath = join(dir, AI_VIDEO.dir, AI_VIDEO.logFile);
    let logged = new Set<string>();
    if (existsSync(logPath)) {
      try {
        const log = JSON.parse(readFileSync(logPath, 'utf8')) as { items?: Array<{ file?: string; model?: string; prompt?: string }> };
        logged = new Set((log.items ?? []).filter((i) => i.file && i.model && i.prompt).map((i) => normalize(`${AI_VIDEO.dir}/${i.file}`)));
      } catch {
        err(`${AI_VIDEO.dir}/${AI_VIDEO.logFile} không đọc được (JSON lỗi).`);
      }
    }
    if (!refs.length) err('Video người thật do AI tạo nhưng chưa dùng cảnh AI nào (thư mục ai/). Đổi kiểu hình về minh hoạ nếu không dùng.');
    for (const r of refs) {
      if (!existsSync(join(dir, r))) err(`Không có file cảnh AI "${r}".`);
      else if (!logged.has(r)) err(`Cảnh AI "${r}" không có trong nhật ký tạo ${AI_VIDEO.dir}/${AI_VIDEO.logFile} (model, mô tả tạo). Chỉ dùng cảnh do quy trình của dự án tạo, không dùng ảnh/clip AI từ nơi khác.`);
    }
  }
  return out;
}
