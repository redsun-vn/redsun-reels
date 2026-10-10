/**
 * Video dựng riêng (script.json `"build": "custom"`, docs/decisions.md §18): Claude viết composition HyperFrames
 * riêng cho từng video ở briefs/<tên>/dung-rieng/index.html, dùng bộ dụng cụ templates/_rieng/.
 * File này kiểm composition trước khi dựng: cấu trúc, thời lượng, nhạc, không tải mạng, font, đường dẫn hình,
 * và CHỐNG BỊA — chữ trên màn hình có số mà brief/kịch bản không có là lỗi (trừ đạo cụ minh hoạ `data-minh-hoa`).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, normalize } from 'node:path';
import type { Script } from '../../config/script.schema.ts';
import { normalizeText, numberTokens } from './fact-check.ts';
import { REPO_ROOT } from './hyperframes-env.ts';
import { CUE_FILE, CUE_MARKER, cueIssues, parseCues } from './sfx-cues.ts';

export const CUSTOM_DIR = 'dung-rieng';
/** Đường dẫn cố định trong stage (scripts/lib/stage-project.ts `stageCustom`). */
export const CUSTOM_MUSIC_SRC = 'music/bgm.mp3';
const DURATION_TOLERANCE = 0.05;

export interface CustomIssue {
  level: 'error' | 'warning';
  message: string;
}

export function compositionPath(dir: string): string {
  return join(dir, CUSTOM_DIR, 'index.html');
}

export interface ScreenText {
  text: string;
  /** Nằm trong phần tử có `data-minh-hoa` (đạo cụ minh hoạ: sổ tay, màn hình app mẫu, hoá đơn…). */
  minhHoa: boolean;
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const ENTITIES: Record<string, string> = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };

/** Chữ tĩnh hiển thị trong HTML (bỏ <script>, <style>, comment), kèm cờ minh hoạ theo phần tử cha. */
export function extractScreenText(html: string): ScreenText[] {
  const out: ScreenText[] = [];
  const stack: Array<{ tag: string; minhHoa: boolean }> = [];
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/<head\b[\s\S]*?<\/head>/i, '');
  const re = /<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    if (m[4] !== undefined) {
      const text = m[4].replace(/&[#\w]+;/g, (e) => ENTITIES[e] ?? ' ').replace(/\s+/g, ' ').trim();
      if (text) out.push({ text, minhHoa: stack.some((s) => s.minhHoa) });
      continue;
    }
    const tag = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const i = stack.map((s) => s.tag).lastIndexOf(tag);
      if (i >= 0) stack.length = i;
      continue;
    }
    // Chữ trong ảnh (logo) tính là chữ trên màn hình qua alt
    if (tag === 'img') {
      const alt = /\salt="([^"]*)"/.exec(m[2])?.[1]?.trim();
      if (alt) out.push({ text: alt, minhHoa: stack.some((s) => s.minhHoa) || /\sdata-minh-hoa\b/.test(m[2]) });
    }
    if (VOID_TAGS.has(tag) || m[3] === '/') continue;
    stack.push({ tag, minhHoa: /\sdata-minh-hoa\b/.test(' ' + m[2]) });
  }
  return out;
}

/** Dòng JS gán chữ hiển thị (textContent/innerHTML…) có chuỗi chữ/số mà không ghi `// minh-hoa`. */
export function unmarkedScriptText(html: string): string[] {
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((x) => x[1]);
  const bad: string[] = [];
  for (const code of scripts) {
    for (const line of code.split('\n')) {
      if (!/\b(textContent|innerHTML|innerText|outerHTML|insertAdjacentHTML|createTextNode)\b/.test(line)) continue;
      if (/\/\/\s*minh-hoa\b/.test(line)) continue;
      const literals = [...line.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)].map((x) => x[2]);
      if (literals.some((l) => /[\p{L}\d]{2,}/u.test(l.replace(/<[^>]*>/g, '')))) bad.push(line.trim());
    }
  }
  return bad;
}

function scriptCopy(script: Script): string[] {
  const strip = (t: string) => t.replace(/[[\]]/g, '');
  return [
    script.hook.replace(/\n/g, ' '),
    script.cta,
    ...script.scenes.flatMap((s) => [s.onScreenText, s.subText ?? '', s.attribution ?? '', ...Object.values(s.promo ?? {}).map(String), ...(s.stats ?? []).flatMap((x) => [x.value, x.label])]),
  ]
    .filter(Boolean)
    .map(strip);
}

/** Tên bối cảnh vẽ sẵn trong templates/_rieng/boi-canh.js. */
export function backdropNames(): string[] {
  return [...readFileSync(join(REPO_ROOT, 'templates', '_rieng', 'boi-canh.js'), 'utf8').matchAll(/SETS\["([a-z-]+)"\]\s*=/g)].map((m) => m[1]);
}

export function customIssues(dir: string, script: Script, briefBody: string, totalSec: number): CustomIssue[] {
  const out: CustomIssue[] = [];
  const err = (message: string) => out.push({ level: 'error', message });
  const warn = (message: string) => out.push({ level: 'warning', message });
  const file = compositionPath(dir);
  if (!existsSync(file)) {
    err(`Chưa có bản dựng riêng (${CUSTOM_DIR}/index.html). Claude viết theo skill dung-video.`);
    return out;
  }
  const html = readFileSync(file, 'utf8');

  // Cấu trúc HyperFrames
  if (!/<html[^>]*\blang="vi"/.test(html)) err('Bản dựng riêng thiếu lang="vi" trên thẻ <html>.');
  // Chrome chỉ dò <meta charset> trong 1024 byte đầu; quá đó có thể đọc sai bảng mã, chữ Việt bị vỡ
  if (!/<meta\s+charset=["']?utf-8/i.test(Buffer.from(html, 'utf8').subarray(0, 1024).toString('latin1'))) err('Bản dựng riêng phải có <meta charset="utf-8" /> ngay đầu <head> (trong 1024 byte đầu file).');
  if (!/data-composition-id="main"/.test(html)) err('Gốc bản dựng riêng phải có data-composition-id="main".');
  const dur = /data-composition-id="main"[^>]*data-duration="([\d.]+)"|data-duration="([\d.]+)"[^>]*data-composition-id="main"/.exec(html);
  const d = dur ? Number(dur[1] ?? dur[2]) : NaN;
  if (!Number.isFinite(d)) err('Gốc bản dựng riêng phải khai data-duration (giây).');
  else if (Math.abs(d - totalSec) > DURATION_TOLERANCE) err(`Bản dựng riêng dài ${d}s, kịch bản ${totalSec}s. Hai bên phải bằng nhau.`);
  if (!/data-width="1080"/.test(html) || !/data-height="1920"/.test(html)) err('Gốc bản dựng riêng phải có data-width="1080" data-height="1920".');
  if (!html.includes(`src="${CUSTOM_MUSIC_SRC}"`) || !/<audio\b[^>]*\bid="/.test(html)) err(`Bản dựng riêng cần <audio id="music" src="${CUSTOM_MUSIC_SRC}" …> (nhạc của kịch bản).`);
  if (!/__timelines\[["']main["']\]\s*=/.test(html)) err('Bản dựng riêng phải ghi window.__timelines["main"] = tl; (cuối hàm dựng).');

  // Nhân vật nhất quán: khai dàn nhân vật một lần bằng RS.cast, không tạo người lẻ bằng RS.person
  if (/RS\.person\(/.test(html)) warn('Tạo nhân vật qua dàn nhân vật RS.cast({ tên: { tóc, áo… } }) rồi gọi theo tên, để một người giữ nguyên tóc/áo ở mọi cảnh.');

  // Bối cảnh vẽ sẵn: nạp đủ bộ, tên bối cảnh phải có
  if (/RS\.set\(/.test(html)) {
    if (!html.includes('src="_rieng/boi-canh.js"') || !html.includes('href="_rieng/boi-canh.css"')) err('Dùng bối cảnh RS.set thì nạp <link rel="stylesheet" href="_rieng/boi-canh.css" /> và <script src="_rieng/boi-canh.js"></script> (sau nhan-vat.js).');
    const known = backdropNames();
    for (const m of html.matchAll(/RS\.set\([^,]+,\s*["']([^"']+)["']/g)) if (!known.includes(m[1])) err(`Không có bối cảnh "${m[1]}". Có: ${known.join(', ')}.`);
  }

  // Tiếng động: khai trong tieng-dong.txt, bước dựng tự sinh thẻ <audio> vào chỗ đánh dấu
  const cueFile = join(dir, CUSTOM_DIR, CUE_FILE);
  const manualSfx = /src=["']sfx\//.test(html);
  if (existsSync(cueFile)) {
    const { cues, errors } = parseCues(readFileSync(cueFile, 'utf8'));
    for (const e of [...errors, ...(Number.isFinite(d) ? cueIssues(cues, d) : [])]) err(e);
    if (!html.includes(CUE_MARKER)) err(`Có ${CUE_FILE} nhưng index.html thiếu dòng đánh dấu ${CUE_MARKER} (đặt sau thẻ nhạc, trong gốc composition).`);
    if (manualSfx) warn(`Tiếng động khai ở cả ${CUE_FILE} và thẻ <audio src="sfx/…"> trong index.html: chỉ giữ một nơi (${CUE_FILE}).`);
    if (!cues.length) warn(`${CUE_FILE} chưa có tiếng động nào.`);
  } else if (!manualSfx) warn(`Chưa có tiếng động: khai trong ${CUSTOM_DIR}/${CUE_FILE} (mỗi dòng "giây tên âm-lượng"), đặt ${CUE_MARKER} trong index.html.`);

  // Không tải gì từ mạng; font chỉ Montserrat
  const remote = html.match(/(?:src|href)\s*=\s*["'](?:https?:)?\/\/[^"']+|url\(\s*["']?(?:https?:)?\/\/[^)]+/gi);
  if (remote) err(`Bản dựng riêng tải tài nguyên từ mạng: ${remote.slice(0, 3).join(', ')}. Chỉ dùng file trong dự án.`);
  for (const f of html.matchAll(/font-family\s*:\s*([^;}"]+)/gi)) {
    const v = f[1].trim();
    if (!/^(var\(--font-(heading|body)\)|["']?Montserrat["']?(,\s*sans-serif)?)$/i.test(v)) err(`Font "${v}" không đúng brand: chỉ dùng Montserrat (var(--font-body)).`);
  }

  // Hình/clip/tiếng động tham chiếu phải có thật
  for (const ref of html.matchAll(/(?:src|href)\s*=\s*["']((?:hinh|assets|sfx)\/[^"']+)["']/g)) {
    const rel = normalize(ref[1]);
    const p = rel.startsWith('hinh/') ? join(dir, rel) : rel.startsWith('sfx/') ? join(REPO_ROOT, 'brand', rel) : join(REPO_ROOT, rel);
    if (rel.startsWith('..') || !existsSync(p)) err(`Bản dựng riêng dùng "${ref[1]}" nhưng không có file này.`);
  }

  // Chống bịa: số trên màn hình phải có trong brief hoặc kịch bản (đạo cụ minh hoạ được miễn, có cảnh báo)
  const copy = scriptCopy(script);
  const known = new Set([...numberTokens(briefBody), ...copy.flatMap(numberTokens)]);
  const texts = extractScreenText(html);
  const sample: string[] = [];
  for (const t of texts) {
    const miss = numberTokens(t.text).filter((n) => !known.has(n));
    if (!miss.length) continue;
    if (t.minhHoa) sample.push(t.text);
    else err(`Chữ trên màn hình "${t.text}" có số ${miss.join(', ')} không có trong brief/kịch bản. Bỏ số, hoặc đặt trong đạo cụ minh hoạ (data-minh-hoa) nếu chỉ là số mẫu.`);
  }
  if (sample.length) warn(`Đạo cụ minh hoạ có ${sample.length} chữ chứa số mẫu (${sample.slice(0, 6).join(' · ')}${sample.length > 6 ? ' …' : ''}). Kiểm lại: chỉ là số mẫu (sổ tay, màn hình app), không phải lời hứa về sản phẩm.`);
  const bad = unmarkedScriptText(html);
  if (bad.length) err(`Chữ hiển thị phải viết sẵn trong HTML. Dòng JS gán chữ (ghi "// minh-hoa" nếu chỉ là số mẫu của đạo cụ): ${bad.slice(0, 3).join(' | ')}`);

  // Đủ chữ đã duyệt: mỗi dòng kịch bản phải xuất hiện trên màn hình
  const screen = normalizeText(texts.filter((t) => !t.minhHoa).map((t) => t.text).join(' '));
  for (const line of copy) {
    const n = normalizeText(line);
    if (n && !(' ' + screen + ' ').includes(' ' + n + ' ')) warn(`Chữ kịch bản "${line}" chưa thấy nguyên câu trên màn hình (có thể bị tách dòng bằng thẻ; kiểm lại cho đúng chữ đã duyệt).`);
  }
  return out;
}
