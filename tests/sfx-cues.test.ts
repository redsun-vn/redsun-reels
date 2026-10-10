import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';
import { cueIssues, cueTags, injectCues, injectSilence, parseCues, rootDuration, sfxNames, wavDuration } from '../scripts/lib/sfx-cues.ts';

describe('tiếng động khai theo giây', () => {
  it('đọc dòng, bỏ ghi chú, xếp theo giây, báo dòng sai dạng', () => {
    const { cues, errors } = parseCues('# đầu\n2.5 tap 0.4  # bấm\n\n1.30 pop 0.5\n1 pop\n');
    expect(cues.map((c) => [c.at, c.name, c.volume, c.line])).toEqual([[1.3, 'pop', 0.5, 4], [2.5, 'tap', 0.4, 2]]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('dòng 5');
  });

  it('báo tên không có, giây ngoài video, âm lượng sai', () => {
    const { cues } = parseCues('0.5 pop 0.5\n9 pop 0.5\n1 bum 0.5\n2 tap 1.5\n');
    const out = cueIssues(cues, 8, ['pop', 'tap']).join('\n');
    expect(out).toContain('giây 9');
    expect(out).toContain('"bum"');
    expect(out).toContain('1.5');
    expect(out).not.toContain('dòng 1:');
  });

  it('mỗi tiếng một track từ 20, độ dài theo file, cắt ở cuối video', () => {
    const { cues } = parseCues('1 pop 0.5\n7.9 ding 0.3\n');
    const tags = cueTags(cues, 8, (n) => (n === 'pop' ? 0.16 : 0.9));
    expect(tags).toContain('id="sfx01" src="sfx/pop.wav" data-start="1.00" data-duration="0.16" data-track-index="20"');
    expect(tags).toContain('id="sfx02" src="sfx/ding.wav" data-start="7.90" data-duration="0.10" data-track-index="21" data-volume="0.3"');
  });

  it('thay chỗ đánh dấu; thiếu chỗ đánh dấu thì báo', () => {
    expect(injectCues('<div><!-- TIENG-DONG --></div>', '<audio></audio>')).toBe('<div><audio></audio></div>');
    expect(() => injectCues('<div></div>', '')).toThrow('TIENG-DONG');
    expect(rootDuration('<div id="root" data-composition-id="main" data-duration="31" data-width="1080">')).toBe(31);
  });

  it('đọc được độ dài file wav trong brand/sfx', () => {
    expect(sfxNames()).toContain('pop');
    const d = wavDuration(join(REPO_ROOT, 'brand', 'sfx', 'pop.wav'));
    expect(d).toBeGreaterThan(0.05);
    expect(d).toBeLessThan(1);
  });

  it('khoảng lặng: đọc, kiểm, hạ nhạc nền đúng khoảng', () => {
    const { silence, errors } = parseCues('lang 4 5\n1 pop 0.5\n4.5 boom 0.6\n');
    expect(errors).toEqual([]);
    expect(silence).toMatchObject({ from: 4, to: 5, level: 0.15 });
    const { cues } = parseCues('1 pop 0.5\n4.5 boom 0.6\n');
    expect(cueIssues(cues, 8, ['pop', 'boom'], silence!).join('\n')).toContain('4.5 boom');
    expect(cueIssues([], 8, [], { line: 1, from: 4, to: 9, level: 0.15 }).join('\n')).toContain('ngoài video');
    expect(parseCues('lang 1 2\nlang 3 4\n').errors[0]).toContain('một khoảng lặng');
    const html = injectSilence('<div><audio id="music" src="music/bgm.mp3" data-start="0"></audio></div>', silence!);
    const auto = JSON.parse(/data-automation='([^']+)'/.exec(html)![1]);
    expect(auto.lanes[0].points).toEqual([{ t: 0, v: 1 }, { t: 3.85, v: 1 }, { t: 4, v: 0.15 }, { t: 4.98, v: 0.15 }, { t: 5, v: 1 }]);
    expect(() => injectSilence(html, silence!)).toThrow('data-automation');
  });
});

