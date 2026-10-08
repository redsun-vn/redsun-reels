/**
 * pnpm lint:brand — chặn hard-code màu/font/cỡ chữ trong templates/ và brand/styles/.
 */
import { REPO_ROOT } from './lib/hyperframes-env.ts';
import { lintBrand } from './lib/lint-brand.ts';

const v = lintBrand(REPO_ROOT);
const label = { color: 'mã màu cứng', 'font-family': 'font cứng', 'font-size': 'cỡ chữ cứng' } as const;
for (const x of v) console.log(`✗ ${x.file}:${x.line} ${label[x.rule]} — ${x.text}`);
console.log(v.length ? `\n${v.length} chỗ chưa dùng biến trong brand/brand.css.` : 'Brand lint: không có vi phạm.');
process.exit(v.length ? 1 : 0);
