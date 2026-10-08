/**
 * ./reel info                          — danh sách loại video và phong cách (đánh dấu cái đã dựng được)
 * ./reel info <loại-video>             — chi tiết một loại: template, thời lượng, thứ tự cảnh, góc hook, phong cách
 * ./reel info thoi-luong "<chữ>" ["<dòng phụ>"]  — thời lượng tối thiểu của một cảnh
 * ./reel info dip-le                   — lịch dịp lễ → phong cách mặc định
 * Dùng cho skill tao-reel khi viết kịch bản.
 */
import { existsSync } from 'node:fs';
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
