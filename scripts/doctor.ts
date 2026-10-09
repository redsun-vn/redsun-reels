/**
 * pnpm doctor — kiểm tra máy có đủ để làm video (REQUIREMENTS v0.4 §9).
 * In kết quả tiếng Việt; exit 1 nếu thiếu thứ bắt buộc.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MusicManifestSchema } from '../config/music-manifest.ts';
import { ffmpegPath, ffprobePath, REPO_ROOT, runFfmpeg, runHyperframes, stripAnsi } from './lib/hyperframes-env.ts';

const PINNED_HYPERFRAMES = '0.8.141';

interface Check {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
}

const checks: Check[] = [];
const add = (c: Check) => checks.push(c);

const [major, minor] = process.versions.node.split('.').map(Number);
add({
  name: 'Node.js',
  ok: major > 22 || (major === 22 && minor >= 18),
  detail: `v${process.versions.node}`,
  fix: 'Cần Node 22.18 trở lên. Nói với Claude: "cài đặt giúp tôi".',
});

const hfVersion = runHyperframes(['--version']);
const hfOut = stripAnsi(hfVersion.stdout).trim();
add({
  name: 'HyperFrames',
  ok: hfVersion.status === 0 && hfOut.includes(PINNED_HYPERFRAMES),
  detail: hfOut || 'không chạy được',
  fix: `Cần đúng bản ${PINNED_HYPERFRAMES}. Chạy "corepack pnpm install --frozen-lockfile".`,
});

const ff = runFfmpeg(['-version']);
add({
  name: 'FFmpeg',
  ok: ff.status === 0 && existsSync(ffmpegPath()) && existsSync(ffprobePath()),
  detail: ff.status === 0 ? ff.stdout.split('\n')[0] : 'không chạy được',
  fix: 'Chạy lại "corepack pnpm install --frozen-lockfile" (ffmpeg-static tải binary lúc cài).',
});

for (const f of ['montserrat-variable.ttf', 'montserrat-italic-variable.ttf']) {
  add({ name: `Font ${f}`, ok: existsSync(join(REPO_ROOT, 'brand', 'fonts', f)), detail: `brand/fonts/${f}` });
}
add({ name: 'GSAP local', ok: existsSync(join(REPO_ROOT, 'runtime', 'gsap', 'gsap.min.js')), detail: 'runtime/gsap/gsap.min.js' });

try {
  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
  const missing = manifest.tracks.filter((t) => !existsSync(join(REPO_ROOT, 'brand', 'music', t.file)));
  const real = manifest.tracks.filter((t) => t.allowedUse.includes('social-organic'));
  add({
    name: 'Thư viện nhạc',
    ok: missing.length === 0,
    detail: `${manifest.tracks.length} bài (${real.length} bài dùng cho video thật)${missing.length ? `, thiếu file: ${missing.map((t) => t.file).join(', ')}` : ''}`,
    fix: 'Chạy "./reel music:fetch" để tải nhạc (Claude tự làm được). Thiếu nhạc thử: "./reel gen:test-music".',
  });
} catch (err) {
  add({ name: 'Thư viện nhạc', ok: false, detail: `manifest.json không hợp lệ: ${(err as Error).message}` });
}

const doc = runHyperframes(['doctor']);
const docOut = stripAnsi(doc.stdout + doc.stderr);
const chrome = docOut.split('\n').find((l) => /Chrome/.test(l))?.trim() ?? '';
add({
  name: 'Trình duyệt render',
  ok: doc.status === 0 && /✓\s+Chrome/.test(docOut),
  detail: chrome || 'không xác định',
  fix: 'Chạy "corepack pnpm exec hyperframes browser ensure" để tải Chrome.',
});

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  if (!c.ok) {
    failed++;
    if (c.fix) console.log(`   → ${c.fix}`);
  }
}
console.log(failed ? `\nCòn ${failed} mục cần xử lý.` : '\nMáy đã sẵn sàng làm video.');
process.exit(failed ? 1 : 0);
