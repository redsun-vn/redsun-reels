import { describe, expect, it } from 'vitest';
import { boardHeight, boardHtml, boardIssues, parseBoard } from '../scripts/lib/storyboard-board.ts';

describe('bảng khung chính', () => {
  it('đọc dòng, đánh số theo giây, bỏ ghi chú, báo dòng sai', () => {
    const { panels, errors } = parseBoard('# đầu\n3 | sổ tay | tích | lật trang\n0.6 | cận mặt\nabc | sai\n');
    expect(panels.map((p) => [p.n, p.at, p.what, p.sound, p.next])).toEqual([[1, 0.6, 'cận mặt', '', ''], [2, 3, 'sổ tay', 'tích', 'lật trang']]);
    expect(errors[0]).toContain('dòng 4');
  });

  it('báo số khung quá ít/quá nhiều và giây ngoài video', () => {
    const { panels } = parseBoard('1 | a\n2 | b\n40 | c\n');
    const out = boardIssues(panels, 31).join('\n');
    expect(out).toContain('3 khung');
    expect(out).toContain('giây 40');
  });

  it('trang bảng thoát ký tự HTML và đủ cao cho mọi hàng', () => {
    const html = boardHtml('video <thử>', [{ n: 1, at: 0.6, what: 'A & B', sound: '', next: '', img: 'khung/a.png' }]);
    expect(html).toContain('video &lt;thử&gt;');
    expect(html).toContain('A &amp; B');
    expect(html).toContain(`data-height="${boardHeight(1)}"`);
    expect(boardHeight(4)).toBeGreaterThan(boardHeight(3));
  });
});
