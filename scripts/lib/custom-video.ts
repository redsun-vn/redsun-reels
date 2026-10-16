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
import { CUE_FILE, CUE_MARKER, cueIssues, parseCues, SFX_TRACK_START } from './sfx-cues.ts';
import { BOARD_FILE, boardIssues, parseBoard } from './storyboard-board.ts';
import { VOICE } from '../../config/voice.ts';
import { readVoice } from './voice-stage.ts';
import { spokenText, voiceScriptIssues, voiceVarietyIssues } from './voice-script.ts';
import { KIEU_KE } from '../../config/kieu-ke.ts';
import { phongCachCua, type PhongCachHinh } from '../../config/phong-cach-hinh.ts';
import { faceClips, voiceFaceIssues } from './voice-sync.ts';
import { stockLog } from './kieu-hinh-rules.ts';

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

/** Hàm của templates/_rieng/chieu-sau.js (cần nạp chieu-sau.js + chieu-sau.css). */
const DEPTH_FN_RE = /\bRS\.(lopCanh|truotLech|moSau|doiNet|tienCanh|chumSang|quetSang|loe|hoanThien|the3d|laoVao|lui|thoatKhung|vatLuot|tranMau)\(/;

/** Hàm của templates/_rieng/phong-cach.js (cần nạp phong-cach.js + phong-cach.css). */
const PHONG_CACH_FN_RE = /\bRS\.(phongCach|oTruyen|danO|tuongThanh|duongToc|duongTocChay|khungVaCham|dungHinh|moDau)\(/;
/** Hàm của templates/_rieng/phong-cach-truyen.js. */
const TRUYEN_FN_RE = /\bRS\.(latTrang|chibi|hacKhi|chopTrang)\(/;
/** Hàm của templates/_rieng/phong-cach-anh-hung.js. */
const ANH_HUNG_FN_RE = /\bRS\.(bienHinh|gocThap|tiaNangLuong|phanDien|vo)\(/;
/** Hàm của templates/_rieng/phong-cach-nhan-vat.js. */
const PHONG_CACH_NV_FN_RE = /\bRS\.(anhHung|choangBay|dauCamXuc)\(/;

/**
 * Phong cách hình (config/phong-cach-hinh.ts): kịch bản và composition phải khớp. Phong cách khác "thuong" thì gọi
 * RS.phongCach(…, "<mã>") đúng mã và nạp bộ phong-cach; "thuong" thì không gắn phong cách truyện.
 */
export function phongCachIssues(html: string, phongCachHinh: PhongCachHinh | undefined, product?: string): string[] {
  const id = phongCachCua(phongCachHinh);
  const out: string[] = [];
  const goi = [...html.matchAll(/\bRS\.phongCach\([^,]*,\s*["']([a-z-]+)["']/g)].map((m) => m[1]);
  if (id === 'thuong') {
    if (/\bRS\.phongCach\(/.test(html)) out.push('Composition gọi RS.phongCach nhưng kịch bản là phong cách "thuong": ghi concept.phongCachHinh trong script.json cho khớp, hoặc bỏ RS.phongCach.');
  } else {
    if (!goi.length) out.push(`Kịch bản chọn phong cách hình "${id}": gọi RS.phongCach(null, "${id}") ở đầu hàm dựng (skill dung-video, references/phong-cach-hinh.md).`);
    else if (goi.some((g) => g !== id)) out.push(`RS.phongCach gọi "${goi.find((g) => g !== id)}" nhưng kịch bản chọn "${id}": hai bên phải cùng một phong cách.`);
  }
  if ((PHONG_CACH_FN_RE.test(html) || id !== 'thuong') && (!html.includes('src="_rieng/phong-cach.js"') || !html.includes('href="_rieng/phong-cach.css"')))
    out.push('Dùng phong cách hình (RS.phongCach, RS.oTruyen, RS.tuongThanh, RS.moDau…) thì nạp <link rel="stylesheet" href="_rieng/phong-cach.css" /> và <script src="_rieng/phong-cach.js"></script> (sau chieu-sau.js).');
  if (PHONG_CACH_NV_FN_RE.test(html) && !html.includes('src="_rieng/phong-cach-nhan-vat.js"'))
    out.push('Dùng phụ kiện/dấu cảm xúc kiểu truyện (RS.anhHung, RS.choangBay, RS.dauCamXuc) thì nạp <script src="_rieng/phong-cach-nhan-vat.js"></script> (sau phong-cach.js).');
  if (TRUYEN_FN_RE.test(html) && !html.includes('src="_rieng/phong-cach-truyen.js"'))
    out.push('Dùng thủ pháp trang truyện (RS.latTrang, RS.chibi, RS.hacKhi, RS.chopTrang) thì nạp <script src="_rieng/phong-cach-truyen.js"></script> (sau phong-cach.js).');
  if (ANH_HUNG_FN_RE.test(html) && !html.includes('src="_rieng/phong-cach-anh-hung.js"'))
    out.push('Dùng hiệu ứng siêu anh hùng (RS.bienHinh, RS.gocThap, RS.tiaNangLuong, RS.phanDien, RS.vo) thì nạp <script src="_rieng/phong-cach-anh-hung.js"></script> (sau phong-cach-nhan-vat.js).');
  if (id === 'thuong' && /var\(--font-comic\)|\brs-(tuong-thanh|tieu-de-truyen)\b/.test(html))
    out.push('Chữ kiểu truyện (Bangers, var(--font-comic), rs-tuong-thanh) chỉ dùng khi phong cách hình là comic, manga hoặc sieu-anh-hung.');
  // Chữ Bangers: ≤ 3 từ, không chữ số (giá, số liệu luôn Montserrat)
  for (const m of html.matchAll(/<[a-z]+\b[^>]*\bclass="([^"]*\brs-(?:tuong-thanh|tieu-de-truyen)\b[^"]*)"[^>]*>((?:[^<]|<\/?span\b[^>]*>)*)</g)) {
    const t = m[2].replace(/<[^>]+>/g, '').trim();
    if (/\bno\b/.test(m[1]) && !/<span\b/.test(m[2])) out.push(`Chữ tượng thanh nền nổ "${t}" phải viết trong <span> (để chữ nằm trên nền nổ): <div class="rs-tuong-thanh no"><span>${t}</span></div>.`);
    if (t.split(/\s+/).length > 3 || /\d/.test(t)) out.push(`Chữ kiểu truyện "${t}" phải ≤ 3 từ và không có chữ số (câu, giá, số liệu dùng Montserrat).`);
  }
  // Logo ngực siêu anh hùng: ghi thẳng đường dẫn, file có thật, đúng thư mục logo của sản phẩm
  for (const m of html.matchAll(/\bbieuTuong\s*:\s*([^,}\s]+)/g)) {
    const lit = /^["']([^"']+)["']$/.exec(m[1]);
    if (!lit) { out.push('RS.anhHung: ghi thẳng đường dẫn logo vào bieuTuong ("brand/logos/<sản phẩm>/<file>") để máy kiểm được.'); continue; }
    const src = lit[1];
    if (product && !src.startsWith(`brand/logos/${product}/`)) out.push(`Logo ngực "${src}" phải là logo của sản phẩm video (brand/logos/${product}/…).`);
    else if (!existsSync(join(REPO_ROOT, normalize(src)))) out.push(`Logo ngực "${src}" không có trong dự án.`);
  }
  return out;
}

/** Tên bối cảnh vẽ sẵn trong templates/_rieng/boi-canh.js. */
export function backdropNames(): string[] {
  return [...readFileSync(join(REPO_ROOT, 'templates', '_rieng', 'boi-canh.js'), 'utf8').matchAll(/SETS\["([a-z-]+)"\]\s*=/g)].map((m) => m[1]);
}

/** `voiceDraft`: soát hình khi giọng chưa đủ (./reel snap) — câu thiếu giọng/chưa đạt chỉ là lưu ý; xuất video vẫn chặn. */
/**
 * Phần AI là một mạch liền (Nam 2026-10-12: "phải là 1 video xuyên suốt, không phải cảnh ghép cắt từ nhiều phân đoạn"):
 * mỗi clip trong ai/ chạy tới, không nhảy hay quay lại đoạn đã chiếu (tách thẻ được, miễn đoạn sau nối đúng chỗ đoạn
 * trước dừng), và các clip nối nhau theo thứ tự, không xen kẽ.
 */
export function aiContinuityIssues(html: string): string[] {
  const attr = (tag: string, a: string) => new RegExp(`\\b${a}="([^"]*)"`).exec(tag)?.[1];
  const segs = [...html.matchAll(/<video\b[^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => /\bsrc="ai\/[^"]+"/.test(t))
    .map((t) => ({ src: attr(t, 'src')!, start: Number(attr(t, 'data-start') ?? 0), dur: Number(attr(t, 'data-duration') ?? 0), media: Number(attr(t, 'data-media-start') ?? 0), rate: Number(attr(t, 'data-playback-rate') ?? 1) }))
    .sort((a, b) => a.start - b.start);
  const out: string[] = [];
  const seen: string[] = [];
  const last = new Map<string, (typeof segs)[number]>();
  for (const s of segs) {
    const prev = last.get(s.src);
    if (prev) {
      const expect = prev.media + prev.dur * prev.rate;
      if (Math.abs(s.media - expect) > 0.15)
        out.push(`Clip AI ${s.src} ở giây ${s.start} bắt đầu từ ${s.media}s trong clip, nhưng đoạn trước dừng ở ${expect.toFixed(2)}s: phần AI phải chạy liền mạch, không nhảy hay quay lại đoạn đã chiếu.`);
      if (seen[seen.length - 1] !== s.src)
        out.push(`Clip AI ${s.src} chiếu lại ở giây ${s.start} sau khi đã sang clip khác: các clip AI nối nhau theo thứ tự, không xen kẽ.`);
    } else seen.push(s.src);
    last.set(s.src, s);
  }
  return out;
}

export function customIssues(dir: string, script: Script, briefBody: string, totalSec: number, voiceDraft = false): CustomIssue[] {
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

  for (const m of aiContinuityIssues(html)) err(m);

  // Nhân vật nhất quán: khai dàn nhân vật một lần bằng RS.cast, không tạo người lẻ bằng RS.person
  if (/RS\.person\(/.test(html)) warn('Tạo nhân vật qua dàn nhân vật RS.cast({ tên: { tóc, áo… } }) rồi gọi theo tên, để một người giữ nguyên tóc/áo ở mọi cảnh.');

  // Giọng đọc AI (loi-doc.json, ./reel giong): hợp lệ, mọi câu có bản đạt máy chấm, có chỗ gắn, chống bịa số
  const voiceFile = join(dir, CUSTOM_DIR, VOICE.file);
  const kieuKe = script.concept?.kieuKe ? KIEU_KE[script.concept.kieuKe] : undefined;
  // Thoại trong clip AI (clip AI không tắt tiếng): giọng nhân vật nằm trong clip, đếm chất giọng khai ở ai/canh-ai.json
  const clipVoice = /<video\b(?![^>]*\bmuted\b)[^>]*\bsrc="ai\//.test(html);
  if (kieuKe?.nhieuGiong && !existsSync(voiceFile)) {
    if (!clipVoice) err(`Kiểu kể "${kieuKe.ten}" bắt buộc có giọng nhiều giọng: thoại nhân vật trong clip AI (dung-canh-ai) hoặc ${CUSTOM_DIR}/${VOICE.file} (giong-doc).`);
    else {
      const specFile = join(dir, 'ai', 'canh-ai.json');
      const dan = existsSync(specFile) ? (JSON.parse(readFileSync(specFile, 'utf8')).dan ?? {}) : {};
      const voices = new Set(Object.values(dan as Record<string, { giongNoi?: string }>).map((d) => d.giongNoi?.trim()).filter(Boolean));
      if (voices.size < kieuKe.nhieuGiong) err(`Kiểu kể "${kieuKe.ten}" cần ít nhất ${kieuKe.nhieuGiong} chất giọng nhân vật khác nhau (ai/canh-ai.json dan[].giongNoi), đang có ${voices.size}.`);
    }
  }
  if (existsSync(voiceFile)) {
    let voice: ReturnType<typeof readVoice>;
    try {
      voice = readVoice(join(dir, CUSTOM_DIR));
    } catch (e) {
      err(`${CUSTOM_DIR}/${VOICE.file} chưa đúng dạng: ${(e as Error).message.slice(0, 300)}`);
    }
    if (voice) {
      for (const m of voiceScriptIssues(voice.vs, Number.isFinite(d) ? d : Infinity)) err(m);
      // Video có cảnh người thật AI: một mạch liền, không giọng người dẫn riêng; thông điệp nói qua chính các nhân vật (Nam 2026-10-12)
      if (/<video\b[^>]*\bsrc="ai\//.test(html) && voice.vs.dan['nguoi-dan'])
        err(`Video người thật AI không dùng giọng người dẫn ("nguoi-dan" trong ${VOICE.file}): thông điệp và lời kêu gọi do chính các nhân vật nói (lúc mặt người nói khuất), skill giong-doc mục "Video người thật AI".`);
      if (kieuKe?.nhieuGiong) {
        const v = voiceVarietyIssues(voice.vs, kieuKe.nhieuGiong, kieuKe.ten);
        for (const m of v.errors) err(m);
        for (const message of v.warnings) out.push({ level: 'warning', message });
      }
      const gap = voiceDraft ? (message: string) => out.push({ level: 'warning', message }) : err;
      if (voice.missing.length) gap(`Câu ${voice.missing.join(', ')} chưa có giọng đọc: chạy ./reel giong <tên-video>.`);
      const weak = voice.placed.filter((p) => !p.dat).map((p) => p.id);
      if (weak.length) gap(`Câu ${weak.join(', ')} chưa đạt máy chấm (cảm xúc/cường độ/giọng vùng/đủ chữ): sửa lời hoặc ghi chú diễn rồi chạy lại ./reel giong … --cau=… --lai.`);
      if (!html.includes(VOICE.marker)) err(`Có ${VOICE.file} nhưng index.html thiếu dòng đánh dấu ${VOICE.marker} (đặt sau thẻ nhạc).`);
      const sorted = [...voice.placed].sort((a, b) => a.at - b.at);
      for (let i = 1; i < sorted.length; i++) if (sorted[i].at < sorted[i - 1].at + sorted[i - 1].dur - 0.05) out.push({ level: 'warning', message: `Câu "${sorted[i].id}" bắt đầu khi câu "${sorted[i - 1].id}" chưa đọc xong (đè tiếng).` });
      const silence = existsSync(join(dir, CUSTOM_DIR, CUE_FILE)) ? parseCues(readFileSync(join(dir, CUSTOM_DIR, CUE_FILE), 'utf8')).silence : undefined;
      for (const p of sorted) if (silence && p.at < silence.to && p.at + p.dur > silence.from + 0.05) out.push({ level: 'warning', message: `Câu "${p.id}" (${p.at}–${(p.at + p.dur).toFixed(2)}s) rơi vào khoảng lặng ${silence.from}–${silence.to}s trước vỡ lẽ: khoảng lặng dành cho im, dời câu hoặc rút gọn lời.` });
      for (const p of sorted) if (Number.isFinite(d) && p.at + p.dur > d + 0.05) err(`Câu "${p.id}" đọc tới ${(p.at + p.dur).toFixed(2)}s, quá cuối video ${d}s.`);
      // 3 giây đầu: câu hook phải vào ngay (references/chon-diem-hap-dan.md)
      const first = Math.min(...voice.vs.cau.map((c) => c.at));
      if (first > 0.3) err(`LUẬT SỐ 1 — 3 giây đầu: câu giọng đầu tiên bắt đầu ở giây ${first}; câu hook phải bắt đầu ≤ 0,3 giây.`);
      // Thông điệp cuối (cảnh CTA) phải được đọc khi video có giọng (Nam 2026-10-10: "thông điệp cuối cùng, quan trọng nhất
      // liên quan đến sản phẩm lại không được đọc")
      let t0 = 0;
      for (const sc of script.scenes) {
        if (sc.role === 'cta' && !voice.vs.cau.some((c) => c.at >= t0 - 0.3 && c.at < t0 + sc.durationSec)) err(`Video có giọng nhưng cảnh kết "${sc.id}" không có câu nào được đọc: thêm câu đọc thông điệp sản phẩm + lời kêu gọi ("${script.cta}") vào ${VOICE.file}.`);
        t0 += sc.durationSec;
      }
      // Giọng – mặt khớp nhau (vai, cảm xúc; mặt không hiện lâu khi người đó im)
      const lines = voice.vs.cau.flatMap((c) => {
        const p = voice!.placed.find((x) => x.id === c.id);
        return p ? [{ id: c.id, vai: c.vai, camXuc: c.camXuc, at: c.at, dur: p.dur }] : [];
      });
      for (const m of voiceFaceIssues(lines, faceClips(html), stockLog(dir).valid)) err(m);
      // Có giọng và mặt người thì chữ trên hình nhỏ, ít (Nam 2026-10-10: "toàn bộ text vẫn còn quá lớn, không hợp")
      const big = [...new Set(html.match(/var\(--type-(hero|h1|h2)\)|class="[^"]*\brs-(hero|h1)\b/g) ?? [])];
      if (big.length) out.push({ level: 'warning', message: `Video có giọng nhưng còn chữ cỡ lớn (${big.slice(0, 3).join(', ')}): chữ nhấn dùng nhãn nhỏ gắn vào vật (≤ --type-h3), giọng và nét mặt đã truyền ý.` });
      const known = new Set([...numberTokens(briefBody), ...scriptCopy(script).flatMap(numberTokens)]);
      for (const c of voice.vs.cau) {
        const miss = numberTokens(spokenText(c.loi)).filter((n) => !known.has(n));
        if (miss.length) err(`Lời đọc "${c.id}" có số ${miss.join(', ')} không có trong brief/kịch bản (không bịa số).`);
      }
    }
  }

  // Bảng khung chính cho MKT duyệt bằng hình (./reel bang)
  const boardFile = join(dir, CUSTOM_DIR, BOARD_FILE);
  if (existsSync(boardFile)) {
    const { panels, errors } = parseBoard(readFileSync(boardFile, 'utf8'));
    for (const e of [...errors, ...(Number.isFinite(d) ? boardIssues(panels, d) : [])]) err(e);
  } else warn(`Chưa có bảng khung chính ${CUSTOM_DIR}/${BOARD_FILE} (mỗi dòng "giây | điều xảy ra | tiếng | chuyển sang khung sau") để MKT duyệt bằng hình: ./reel bang <tên>.`);

  // Storyboard: mỗi cảnh ghi phải thấy / không được thấy (tao-reel/references/chieu-sau-cau-chuyen.md mục 3), chỉ cảnh báo
  const storyFile = join(dir, CUSTOM_DIR, 'storyboard.md');
  if (existsSync(storyFile)) {
    const story = readFileSync(storyFile, 'utf8');
    if (!/Phải thấy\s*:/i.test(story) || !/Không được thấy\s*:/i.test(story)) warn(`${CUSTOM_DIR}/storyboard.md chưa ghi "Phải thấy:" / "Không được thấy:" cho từng cảnh (tránh hình bị đọc thành ý bên cạnh).`);
  }

  // Bối cảnh vẽ sẵn: nạp đủ bộ, tên bối cảnh phải có
  if (/RS\.set\(/.test(html)) {
    if (!html.includes('src="_rieng/boi-canh.js"') || !html.includes('href="_rieng/boi-canh.css"')) err('Dùng bối cảnh RS.set thì nạp <link rel="stylesheet" href="_rieng/boi-canh.css" /> và <script src="_rieng/boi-canh.js"></script> (sau nhan-vat.js).');
    const known = backdropNames();
    for (const m of html.matchAll(/RS\.set\([^,]+,\s*["']([^"']+)["']/g)) if (!known.includes(m[1])) err(`Không có bối cảnh "${m[1]}". Có: ${known.join(', ')}.`);
  }

  // Chiều sâu, ánh sáng, lớp hoàn thiện, chuyển cảnh trong khung hình: nạp đủ bộ chieu-sau
  if (DEPTH_FN_RE.test(html) && (!html.includes('src="_rieng/chieu-sau.js"') || !html.includes('href="_rieng/chieu-sau.css"')))
    err('Dùng hàm chiều sâu (RS.truotLech, RS.hoanThien, RS.laoVao…) thì nạp <link rel="stylesheet" href="_rieng/chieu-sau.css" /> và <script src="_rieng/chieu-sau.js"></script> (sau boi-canh.js).');

  // Tiếng động: khai trong tieng-dong.txt, bước dựng tự sinh thẻ <audio> vào chỗ đánh dấu
  const cueFile = join(dir, CUSTOM_DIR, CUE_FILE);
  const manualSfx = /src=["']sfx\//.test(html);
  if (existsSync(cueFile)) {
    const { cues, errors, silence } = parseCues(readFileSync(cueFile, 'utf8'));
    for (const e of [...errors, ...(Number.isFinite(d) ? cueIssues(cues, d, undefined, silence) : [])]) err(e);
    if (!silence && cues.length) warn(`${CUE_FILE} chưa khai khoảng lặng trước khoảnh khắc vỡ lẽ ("lang <từ> <đến>"): lặng 0.5–2 giây rồi tiếng nhấn to nhất ngay ở <đến>.`);
    if (!html.includes(CUE_MARKER)) err(`Có ${CUE_FILE} nhưng index.html thiếu dòng đánh dấu ${CUE_MARKER} (đặt sau thẻ nhạc, trong gốc composition).`);
    const taken = [...html.matchAll(/data-track-index="(\d+)"/g)].map((m) => Number(m[1])).filter((t) => t >= SFX_TRACK_START);
    if (taken.length) err(`Track ${[...new Set(taken)].join(', ')} đang dùng trong index.html, nhưng track từ ${SFX_TRACK_START} trở lên dành cho tiếng động tự sinh từ ${CUE_FILE}. Đổi sang track nhỏ hơn ${SFX_TRACK_START}.`);
    if (manualSfx) warn(`Tiếng động khai ở cả ${CUE_FILE} và thẻ <audio src="sfx/…"> trong index.html: chỉ giữ một nơi (${CUE_FILE}).`);
    if (!cues.length) warn(`${CUE_FILE} chưa có tiếng động nào.`);
  } else if (!manualSfx) warn(`Chưa có tiếng động: khai trong ${CUSTOM_DIR}/${CUE_FILE} (mỗi dòng "giây tên âm-lượng"), đặt ${CUE_MARKER} trong index.html.`);

  for (const m of phongCachIssues(html, script.concept?.phongCachHinh, script.product)) err(m);

  // Không tải gì từ mạng; font chỉ Montserrat (Bangers qua var(--font-comic) khi có phong cách hình truyện)
  const remote = html.match(/(?:src|href)\s*=\s*["'](?:https?:)?\/\/[^"']+|url\(\s*["']?(?:https?:)?\/\/[^)]+/gi);
  if (remote) err(`Bản dựng riêng tải tài nguyên từ mạng: ${remote.slice(0, 3).join(', ')}. Chỉ dùng file trong dự án.`);
  for (const f of html.matchAll(/font-family\s*:\s*([^;}"]+)/gi)) {
    const v = f[1].trim();
    if (/^var\(--font-comic\)$/i.test(v)) continue; // phạm vi kiểm ở phongCachIssues
    if (!/^(var\(--font-(heading|body)\)|["']?Montserrat["']?(,\s*sans-serif)?)$/i.test(v)) err(`Font "${v}" không đúng brand: chỉ dùng Montserrat (var(--font-body)); chữ kiểu truyện dùng var(--font-comic).`);
  }

  // Hình/clip/tiếng động tham chiếu phải có thật
  for (const ref of html.matchAll(/(?:src|href)\s*=\s*["']((?:hinh|ai|quay-san|assets|sfx)\/[^"']+)["']/g)) {
    const rel = normalize(ref[1]);
    const p = rel.startsWith('hinh/') || rel.startsWith('ai/') || rel.startsWith('quay-san/') ? join(dir, rel) : rel.startsWith('sfx/') ? join(REPO_ROOT, 'brand', rel) : join(REPO_ROOT, rel);
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
