/**
 * ./reel info                          — danh sách loại video và phong cách (đánh dấu cái đã dựng được)
 * ./reel info <loại-video>             — chi tiết một loại: template, thời lượng, thứ tự cảnh, góc hook, phong cách
 * ./reel info thoi-luong "<chữ>" ["<dòng phụ>"]  — thời lượng tối thiểu của một cảnh
 * ./reel info dip-le                   — lịch dịp lễ → phong cách mặc định
 * ./reel info video                    — các video MKT đã làm (briefs/, trừ _example): bước đang làm, đã xuất chưa
 * ./reel info nhac [phong-cách]         — bài nhạc hợp phong cách (bài dùng được cho video thật đứng trước)
 * Dùng cho skill tao-reel khi viết kịch bản.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { readBriefFile } from './lib/brief.ts';
import { MusicManifestSchema, usableSec } from '../config/music-manifest.ts';
import { join } from 'node:path';
import { OCCASIONS } from '../config/occasions.ts';
import { availableStylePresets } from '../config/style-preset.schema.ts';
import { countWords, sceneDurationSec } from '../config/scene-timing.ts';
import { STYLES } from '../config/styles.ts';
import { getVideoType, OCCASION_STYLES, VIDEO_TYPES } from '../config/video-types.ts';
import { runCommand } from './lib/cli.ts';
import { REPO_ROOT } from './lib/hyperframes-env.ts';

const [arg, ...rest] = process.argv.slice(2);
const ready = new Set(availableStylePresets(REPO_ROOT));
/** Template đã dựng = có templates/<tên>/index.html. */
const isBuilt = (template: string) => existsSync(join(REPO_ROOT, 'templates', template, 'index.html'));
const styleName = (id: string) => `${id}${ready.has(id) ? '' : ' (chưa dựng)'}`;

await runCommand(() => {
  if (!arg) {
    console.log('LOẠI VIDEO (✓ = làm được ngay):');
    for (const t of VIDEO_TYPES) {
      const ok = t.templates.some(isBuilt);
      console.log(`  ${ok ? '✓' : '·'} ${t.id.padEnd(22)} ${t.name} — ${t.templates.join('/')} — ${t.minSec}–${t.maxSec}s — mặc định ${styleName(t.defaultStyle)}`);
    }
    console.log('\nPHONG CÁCH (✓ = dựng được ngay):');
    for (const s of STYLES) console.log(`  ${ready.has(s.id) ? '✓' : '·'} ${s.id.padEnd(18)} ${s.name} — ${s.mood}`);
    console.log(`\nDỊP LỄ → phong cách: ${Object.entries(OCCASION_STYLES).map(([k, v]) => `${k}=${v}`).join(', ')} (chi tiết: ./reel info dip-le)`);
    return;
  }

  if (arg === 'dip-le') {
    console.log('DỊP LỄ (ghi vào brief: occasion: <mã>) — nên đăng trước 5–10 ngày và đúng ngày:');
    for (const o of OCCASIONS) console.log(`  ${o.id.padEnd(18)} ${o.name} — ${o.date} — phong cách ${o.style}`);
    return;
  }

  if (arg === 'video') {
    const root = join(REPO_ROOT, 'briefs');
    const slugs = readdirSync(root).filter((d) => !d.startsWith('_') && statSync(join(root, d)).isDirectory()).sort().reverse();
    if (!slugs.length) {
      console.log('Chưa có video nào.');
      return;
    }
    console.log('VIDEO ĐÃ LÀM (mới nhất trước):');
    for (const slug of slugs) {
      const dir = join(root, slug);
      let what = '';
      try {
        const fm = readBriefFile(dir).frontmatter as { product?: string; videoType?: string };
        what = `${fm.product ?? '?'} · ${getVideoType(fm.videoType ?? '')?.name ?? fm.videoType ?? '?'}`;
      } catch {
        what = 'brief chưa xong';
      }
      const out = join(REPO_ROOT, 'out', `${slug}.mp4`);
      const step = existsSync(out) ? `đã xuất (out/${slug}.mp4)` : existsSync(join(dir, 'script.json')) ? 'có kịch bản, chưa xuất' : existsSync(join(dir, 'concepts.md')) ? 'đang chọn ý tưởng' : 'mới có brief';
      console.log(`  ${slug.padEnd(44)} ${what} — ${step}`);
    }
    return;
  }

  if (arg === 'nhac') {
    const style = rest[0];
    const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(join(REPO_ROOT, 'brand', 'music', 'manifest.json'), 'utf8')));
    const tracks = manifest.tracks
      .filter((t) => !t.blocked && (!style || t.mood.includes(style as never)))
      .sort((a, b) => Number(b.allowedUse.includes('social-organic')) - Number(a.allowedUse.includes('social-organic')));
    if (!tracks.length) throw new Error(`Chưa có bài nhạc cho phong cách "${style}".`);
    console.log(`NHẠC${style ? ` cho phong cách ${style}` : ''} (ghi id vào script.json "music"; chọn bài dài hơn video):`);
    for (const t of tracks) {
      const use = t.allowedUse.includes('social-organic') ? 'đăng được' : 'chỉ xem thử';
      console.log(`  ${t.id.padEnd(34)} ${usableSec(t)}s  ${use.padEnd(12)} ${t.title} — ${t.author} — ${t.mood.join(', ')}`);
    }
    return;
  }

  if (arg === 'thoi-luong') {
    const [text = '', sub = ''] = rest;
    console.log(`${countWords(text) + countWords(sub)} từ → tối thiểu ${sceneDurationSec(text, sub)} giây`);
    return;
  }

  const t = getVideoType(arg);
  if (!t) throw new Error(`Không có loại video "${arg}". Gõ "./reel info" để xem danh sách.`);
  console.log(`${t.name} (${t.id})`);
  console.log(`  Template: ${t.templates.join(' / ')}${t.templates.some(isBuilt) ? '' : ' (chưa dựng)'}`);
  console.log(`  Thời lượng: ${t.minSec}–${t.maxSec} giây`);
  console.log(`  Thứ tự cảnh (role): ${t.roles.join(' → ')}${t.repeatRole ? `  (được lặp "${t.repeatRole}")` : ''}`);
  console.log(`  Góc hook gợi ý: ${t.hookAngles.join(', ') || '—'}`);
  console.log(`  Phong cách mặc định: ${styleName(t.defaultStyle)}`);
  console.log(`  Phong cách gợi ý: ${t.suggestedStyles.map(styleName).join(', ') || '—'}`);
  console.log(`  Nên tránh: ${t.avoidStyles.join(', ') || '—'}`);
  console.log(`  Sản phẩm hợp: ${t.products.join(', ')}`);
  if (t.hookTag) console.log(`  Nhãn trên hook: "${t.hookTag}"`);
  if (t.keepClipAudio) console.log('  Giữ âm thanh gốc của clip quay thật.');
});
