/**
 * Brand lint (REQUIREMENTS v0.4 §5.2, §13): template, khối dùng chung và preset phong cách chỉ được dùng biến CSS
 * trong brand/brand.css. Báo mã màu hex/rgb/hsl, font-family và font-size px không qua var().
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface BrandViolation {
  file: string;
  line: number;
  rule: 'color' | 'font-family' | 'font-size';
  text: string;
}

const COLOR_RE = /#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\s*\(/;
const FONT_FAMILY_RE = /font-family\s*:\s*(?!\s*var\()/;
const FONT_SIZE_RE = /font-size\s*:\s*(?!\s*var\()[^;]*\d+(px|pt|rem|em)/;
const SCANNED = /\.(html|css|js|json)$/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (SCANNED.test(name)) out.push(p);
  }
  return out;
}

/** Bỏ comment để ví dụ trong chú thích không bị tính là vi phạm. */
function stripComments(line: string): string {
  return line.replace(/\/\*.*?\*\//g, '').replace(/<!--.*?-->/g, '').replace(/(^|\s)\/\/.*$/, '$1');
}

export function lintBrand(repoRoot: string, dirs = ['templates', 'brand/styles']): BrandViolation[] {
  const out: BrandViolation[] = [];
  for (const d of dirs) {
    for (const file of walk(join(repoRoot, d))) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((raw, i) => {
          const line = stripComments(raw);
          const push = (rule: BrandViolation['rule']) => out.push({ file: relative(repoRoot, file), line: i + 1, rule, text: raw.trim() });
          if (COLOR_RE.test(line)) push('color');
          if (FONT_FAMILY_RE.test(line)) push('font-family');
          if (FONT_SIZE_RE.test(line)) push('font-size');
        });
    }
  }
  return out;
}
