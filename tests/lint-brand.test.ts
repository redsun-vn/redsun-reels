import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';
import { lintBrand } from '../scripts/lib/lint-brand.ts';

describe('brand lint', () => {
  it('templates và preset phong cách trong repo không có vi phạm', () => {
    expect(lintBrand(REPO_ROOT)).toEqual([]);
  });

  it('bắt hex, rgb, font-family và font-size cứng; bỏ qua comment và var()', () => {
    const root = mkdtempSync(join(tmpdir(), 'lint-'));
    mkdirSync(join(root, 'templates'));
    writeFileSync(
      join(root, 'templates', 'x.css'),
      [
        '.a { color: #ff0000; }',
        '.b { background: rgba(0, 0, 0, 0.5); }',
        '.c { font-family: Arial; }',
        '.d { font-size: 40px; }',
        '.ok { color: var(--color-text); font-family: var(--font-body); font-size: var(--type-h1); }',
        '/* ví dụ trong comment: #123456 */',
      ].join('\n'),
    );
    expect(lintBrand(root, ['templates']).map((v) => v.rule)).toEqual(['color', 'color', 'font-family', 'font-size']);
  });
});
