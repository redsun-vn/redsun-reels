/**
 * Bảng khung chính của video dựng riêng, để MKT duyệt bằng hình trước khi Claude làm kỹ chuyển động
 * (ý tưởng từ skill animate của cth9191, MIT). Khai trong briefs/<tên>/dung-rieng/bang-canh.txt, mỗi dòng một khung:
 *   `giây | điều xảy ra | tiếng | chuyển sang khung sau`   (# là ghi chú; hai cột cuối được bỏ trống)
 * `./reel bang <tên>` chụp từng khung và ghép thành một ảnh có số khung, MKT trả lời "đạt / sửa khung 3, 5".
 */
export const BOARD_FILE = 'bang-canh.txt';
/** Số khung trên bảng: đủ mỗi nhịp một khung, không quá dày để MKT xem trên điện thoại. */
export const BOARD_MIN = 4;
export const BOARD_MAX = 18;

export interface BoardPanel {
  n: number;
  at: number;
  what: string;
  sound: string;
  next: string;
}

export function parseBoard(text: string): { panels: BoardPanel[]; errors: string[] } {
  const panels: BoardPanel[] = [];
  const errors: string[] = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.replace(/(^|\s)#.*$/, '').trim();
    if (!line) return;
    const [at, what = '', sound = '', next = ''] = line.split('|').map((x) => x.trim());
    if (!/^\d+(\.\d+)?$/.test(at) || !what) {
      errors.push(`${BOARD_FILE} dòng ${i + 1} "${raw.trim()}": cần dạng "giây | điều xảy ra | tiếng | chuyển sang khung sau".`);
      return;
    }
    panels.push({ n: 0, at: Number(at), what, sound, next });
  });
  panels.sort((a, b) => a.at - b.at).forEach((p, i) => { p.n = i + 1; });
  return { panels, errors };
}

export function boardIssues(panels: BoardPanel[], totalSec: number): string[] {
  const out: string[] = [];
  if (panels.length < BOARD_MIN || panels.length > BOARD_MAX) out.push(`${BOARD_FILE} có ${panels.length} khung; nên ${BOARD_MIN}–${BOARD_MAX} (mỗi nhịp kể chuyện một khung).`);
  for (const p of panels) if (p.at < 0 || p.at >= totalSec) out.push(`${BOARD_FILE} khung ${p.n}: giây ${p.at} nằm ngoài video (0–${totalSec}s).`);
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const BOARD_COLS = 3;
const PANEL_W = 330, IMG_H = 587, CAP_H = 210, GAP = 15, HEAD_H = 130;

export function boardHeight(n: number): number {
  return HEAD_H + Math.ceil(n / BOARD_COLS) * (IMG_H + CAP_H + GAP) + GAP;
}

/** Trang HTML (composition HyperFrames tĩnh) của bảng: ảnh khung + số, giây, mô tả, tiếng, chuyển cảnh. */
export function boardHtml(title: string, panels: Array<BoardPanel & { img: string }>): string {
  const h = boardHeight(panels.length);
  const cells = panels.map((p, i) => {
    const x = GAP + (i % BOARD_COLS) * (PANEL_W + GAP), y = HEAD_H + Math.floor(i / BOARD_COLS) * (IMG_H + CAP_H + GAP);
    return `<div class="p" style="left:${x}px;top:${y}px"><img src="${esc(p.img)}" alt="" /><b class="n">${p.n}</b>` +
      `<div class="c"><div class="t">${p.at}s</div><div class="w">${esc(p.what)}</div>` +
      (p.sound ? `<div class="s">Tiếng: ${esc(p.sound)}</div>` : '') + (p.next ? `<div class="s">→ ${esc(p.next)}</div>` : '') + '</div></div>';
  }).join('\n');
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><link rel="stylesheet" href="brand/brand.css" /><script src="runtime/gsap/gsap.min.js"></script>
<style>
html, body { margin: 0; width: 1080px; height: ${h}px; background: var(--prop-paper); font-family: var(--font-body); }
.h { position: absolute; left: ${GAP}px; top: 28px; right: ${GAP}px; color: var(--prop-ink); }
.h b { display: block; font-size: var(--type-small); font-weight: 900; }
.h span { font-size: calc(var(--type-small) * 0.6); font-weight: 600; }
.p { position: absolute; width: ${PANEL_W}px; height: ${IMG_H + CAP_H}px; border-radius: 18px; overflow: hidden; background: var(--prop-card); box-shadow: 0 6px 18px var(--prop-shadow-soft); }
.p img { display: block; width: ${PANEL_W}px; height: ${IMG_H}px; }
.n { position: absolute; left: 12px; top: 12px; width: 64px; height: 64px; border-radius: 32px; background: var(--prop-ink); color: var(--color-white); font-size: calc(var(--type-small) * 0.75); font-weight: 900; line-height: 64px; text-align: center; }
.c { padding: 10px 14px; color: var(--prop-card-ink); line-height: 1.25; }
.t { font-size: calc(var(--type-small) * 0.55); font-weight: 800; color: var(--prop-card-muted); }
.w { font-size: calc(var(--type-small) * 0.6); font-weight: 800; margin-top: 2px; }
.s { font-size: calc(var(--type-small) * 0.5); font-weight: 600; color: var(--prop-card-muted); margin-top: 4px; }
</style></head><body>
<div id="root" data-composition-id="main" data-duration="1" data-width="1080" data-height="${h}">
<div class="h"><b>${esc(title)}</b><span>Bảng khung chính · duyệt theo số khung: "đạt" hoặc "sửa khung …"</span></div>
${cells}
</div>
<script>const tl = gsap.timeline({ paused: true }); tl.to({}, { duration: 1 }); window.__timelines["main"] = tl;</script>
</body></html>`;
}
