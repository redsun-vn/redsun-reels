/**
 * ./reel music:page — sinh out/nghe-nhac.html để nghe và chọn nhạc trong thư viện (mở bằng trình duyệt, chạy offline).
 * Lọc theo phong cách, đánh dấu Giữ / Bỏ / Dùng thật, ghi chú; lựa chọn lưu trong trình duyệt và copy thành
 * danh sách gửi dev (dev cập nhật manifest: blocked / allowedUse).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MusicManifestSchema } from '../config/music-manifest.ts';
import { STYLES } from '../config/styles.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';

const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
// test-pad-01 là nhạc thử kỹ thuật (ffmpeg), không cần nghe
const tracks = manifest.tracks.filter((t) => t.id !== 'test-pad-01').map((t) => ({
  id: t.id,
  src: `../brand/music/${t.file}`,
  title: t.title,
  author: t.author,
  source: t.source,
  sec: t.durationSec,
  start: t.startSec ?? 0,
  mood: t.mood,
  real: t.allowedUse.includes('social-organic'),
  blocked: t.blocked,
  local: !!t.localOnly,
  /** Bài mới thêm, Nam chưa nghe (ghi chú "chờ Nam nghe" trong manifest). */
  pending: /chờ Nam nghe/.test(t.notes ?? ''),
}));
const styles = STYLES.map((s) => ({ id: s.id, name: s.name }));
const data = JSON.stringify({ tracks, styles }).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nghe nhạc thư viện</title>
<style>
:root{--bg:#f6f5f2;--card:#fff;--ink:#1d1d1f;--muted:#6b6b70;--line:#e4e2dc;--accent:#ba0000;--keep:#1f7a3f;--drop:#b3261e;--real:#1d4ed8}
@media (prefers-color-scheme:dark){:root{--bg:#141416;--card:#1e1e22;--ink:#f2f2f2;--muted:#a0a0a8;--line:#2e2e34;--accent:#ff5a5a;--keep:#4ade80;--drop:#f87171;--real:#93c5fd}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:16px 20px}
h1{margin:0 0 4px;font-size:20px}.sub{color:var(--muted);font-size:13px}
.bar{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.chip{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer}
.chip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}
.now{display:flex;align-items:center;gap:12px;margin-top:12px}.now audio{flex:1;min-width:0}.now b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:40%}
main{max-width:1000px;margin:0 auto;padding:16px 20px 120px;display:grid;gap:10px}
.t{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:grid;grid-template-columns:44px 1fr auto;gap:12px;align-items:center}
.t.playing{outline:2px solid var(--accent)}.t.drop{opacity:.55}
.play{width:44px;height:44px;border-radius:50%;border:0;background:var(--accent);color:#fff;font-size:16px;cursor:pointer}
.name{font-weight:600}.meta{color:var(--muted);font-size:13px}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}.tag{font-size:12px;border-radius:6px;padding:1px 7px;background:var(--bg);border:1px solid var(--line)}
.badge{font-size:11px;font-weight:600;border-radius:6px;padding:1px 6px;margin-left:6px}.badge.real{color:var(--real);border:1px solid var(--real)}.badge.test{color:var(--muted);border:1px solid var(--line)}
.acts{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.acts .g{display:flex;gap:4px}
.acts button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:8px;padding:4px 10px;font-size:13px;cursor:pointer}
.acts button.keep.on{background:var(--keep);color:#fff;border-color:var(--keep)}.acts button.drop.on{background:var(--drop);color:#fff;border-color:var(--drop)}.acts button.use.on{background:var(--real);color:#fff;border-color:var(--real)}
.note{width:220px;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 8px;font-size:13px}
footer{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--line);padding:10px 20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
footer .sum{color:var(--muted);font-size:13px;flex:1}footer button{border:0;background:var(--ink);color:var(--bg);border-radius:8px;padding:8px 14px;cursor:pointer}
@media (max-width:640px){.t{grid-template-columns:44px 1fr}.acts{grid-column:1/-1;align-items:stretch}.note{width:100%}.now b{display:none}}
</style>
</head>
<body>
<header>
  <h1>Nghe nhạc thư viện</h1>
  <div class="sub">Bấm ▶ để nghe (phím cách: dừng/tiếp; phím → : bài sau). Đánh dấu <b>Giữ</b> / <b>Bỏ</b>; bài "xem thử" muốn đăng thật thì bấm <b>Dùng thật</b>. Xong bấm <b>Copy kết quả</b> gửi Nam.</div>
  <div class="bar" id="filters"></div>
  <div class="now"><b id="nowName">Chưa phát bài nào</b><audio id="player" controls preload="none"></audio></div>
</header>
<main id="list"></main>
<footer><span class="sum" id="sum"></span><button id="copy">Copy kết quả</button></footer>
<script>
const DATA = ${data};
const KEY = 'redsun-reels-nghe-nhac';
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const styleName = Object.fromEntries(DATA.styles.map((s) => [s.id, s.name]));
let filter = DATA.tracks.some((t) => t.pending) ? 'pending' : 'all';
let current = -1;
const player = document.getElementById('player');
const mmss = (s) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

function filters() {
  const used = new Set(DATA.tracks.flatMap((t) => t.mood));
  const opts = [['all', 'Tất cả'], ['pending', 'Chờ nghe'], ['real', 'Đăng được'], ['test', 'Chỉ xem thử'], ['todo', 'Chưa chấm']].concat(DATA.styles.filter((s) => used.has(s.id)).map((s) => [s.id, s.name]));
  const bar = document.getElementById('filters');
  bar.innerHTML = '';
  for (const [id, label] of opts) {
    const b = document.createElement('button');
    b.className = 'chip' + (filter === id ? ' on' : '');
    b.textContent = label;
    b.onclick = () => { filter = id; filters(); render(); };
    bar.appendChild(b);
  }
}

function visible() {
  return DATA.tracks.filter((t) => filter === 'all' || (filter === 'pending' && t.pending) || (filter === 'real' && t.real) || (filter === 'test' && !t.real) || (filter === 'todo' && !(state[t.id] && state[t.id].pick)) || t.mood.includes(filter));
}

function render() {
  const list = document.getElementById('list');
  list.innerHTML = '';
  visible().forEach((t) => {
    const s = state[t.id] || {};
    const row = document.createElement('div');
    row.className = 't' + (DATA.tracks.indexOf(t) === current ? ' playing' : '') + (s.pick === 'drop' ? ' drop' : '');
    const play = document.createElement('button');
    play.className = 'play';
    play.textContent = DATA.tracks.indexOf(t) === current && !player.paused ? '❚❚' : '▶';
    play.onclick = () => toggle(DATA.tracks.indexOf(t));
    const info = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = t.title;
    const badge = document.createElement('span');
    badge.className = 'badge ' + (t.real ? 'real' : 'test');
    badge.textContent = t.real ? 'đăng được' : 'chỉ xem thử';
    name.appendChild(badge);
    if (t.pending) { const nb = document.createElement('span'); nb.className = 'badge test'; nb.textContent = 'mới'; name.appendChild(nb); }
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = t.author + ' · ' + t.source + ' · ' + mmss(t.sec) + ' · ' + t.id + (t.blocked ? ' · ĐÃ KHOÁ' : '') + (t.local ? ' · MKT tự thêm' : '');
    const tags = document.createElement('div');
    tags.className = 'tags';
    for (const m of t.mood) { const g = document.createElement('span'); g.className = 'tag'; g.textContent = styleName[m] || m; tags.appendChild(g); }
    info.append(name, meta, tags);
    const acts = document.createElement('div');
    acts.className = 'acts';
    const g = document.createElement('div');
    g.className = 'g';
    const btn = (cls, label, val) => {
      const b = document.createElement('button');
      b.className = cls + (s.pick === val ? ' on' : '');
      b.textContent = label;
      b.onclick = () => { state[t.id] = Object.assign({}, state[t.id], { pick: s.pick === val ? undefined : val }); save(); render(); summary(); };
      return b;
    };
    g.append(btn('keep', 'Giữ', 'keep'), btn('drop', 'Bỏ', 'drop'));
    if (!t.real) g.append(btn('use', 'Dùng thật', 'use'));
    const note = document.createElement('input');
    note.className = 'note';
    note.placeholder = 'Ghi chú (vd. hợp Tết, hơi ồn)';
    note.value = s.note || '';
    note.oninput = () => { state[t.id] = Object.assign({}, state[t.id], { note: note.value }); save(); };
    acts.append(g, note);
    row.append(play, info, acts);
    list.appendChild(row);
  });
}

function toggle(i) {
  if (i === current) { player.paused ? player.play() : player.pause(); return; }
  current = i;
  player.src = DATA.tracks[i].src + (DATA.tracks[i].start ? '#t=' + DATA.tracks[i].start : '');
  document.getElementById('nowName').textContent = DATA.tracks[i].title;
  player.play().catch(() => {});
}
player.onplay = player.onpause = () => render();
player.onended = () => next();
player.onerror = () => { document.getElementById('nowName').textContent = 'Không mở được file — máy chưa tải nhạc? Nói với Claude: "tải nhạc"'; };
function next() { const v = visible(); const k = v.indexOf(DATA.tracks[current]); if (k >= 0 && k + 1 < v.length) toggle(DATA.tracks.indexOf(v[k + 1])); }
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space' && current >= 0) { e.preventDefault(); player.paused ? player.play() : player.pause(); }
  if (e.code === 'ArrowRight') next();
});

function summary() {
  const c = { keep: 0, drop: 0, use: 0 };
  for (const t of DATA.tracks) { const p = state[t.id] && state[t.id].pick; if (p) c[p]++; }
  const todo = DATA.tracks.length - c.keep - c.drop - c.use;
  document.getElementById('sum').textContent = 'Giữ ' + c.keep + ' · Bỏ ' + c.drop + ' · Dùng thật ' + c.use + ' · Chưa chấm ' + todo + ' / ' + DATA.tracks.length + ' bài';
}

document.getElementById('copy').onclick = async () => {
  const label = { keep: 'GIỮ', drop: 'BỎ', use: 'DÙNG THẬT' };
  const lines = ['Kết quả nghe nhạc (' + new Date().toLocaleDateString('vi-VN') + '):'];
  for (const t of DATA.tracks) {
    const s = state[t.id] || {};
    if (!s.pick && !s.note) continue;
    lines.push('- ' + (label[s.pick] || 'CHƯA CHẤM') + ': ' + t.id + ' (' + t.title + ')' + (s.note ? ' — ' + s.note : ''));
  }
  const text = lines.join('\\n');
  try { await navigator.clipboard.writeText(text); document.getElementById('copy').textContent = 'Đã copy ✓'; }
  catch (e) { window.prompt('Copy đoạn này:', text); }
  setTimeout(() => (document.getElementById('copy').textContent = 'Copy kết quả'), 2000);
};

filters(); render(); summary();
</script>
</body>
</html>
`;

mkdirSync(join(REPO_ROOT, 'out'), { recursive: true });
const out = join(REPO_ROOT, 'out', 'nghe-nhac.html');
writeFileSync(out, html);
console.log(`Đã tạo trang nghe nhạc (${tracks.length} bài): ${out}`);
