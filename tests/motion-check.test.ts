import { describe, expect, it } from 'vitest';
import { ScriptSchema, type Script } from '../config/script.schema.ts';
import { normalizeText } from '../scripts/lib/fact-check.ts';
import { motionIssues } from '../scripts/lib/motion-check.ts';

const base = (scenes: Script['scenes'], style: Script['style'] = 'lang-man'): Script => ({
  concept: { title: 't', bigIdea: 't', hookAngle: 'thuong-hieu' },
  videoType: 'chuc-mung-dip-le',
  style,
  template: 'Promo',
  product: 'sipos',
  hook: scenes[0].onScreenText,
  scenes,
  cta: scenes[scenes.length - 1].onScreenText,
  music: 'x',
});
const sc = (id: string, text: string, motion?: Script['scenes'][number]['motion'], durationSec = 5): Script['scenes'][number] => ({ id, role: 'solution', onScreenText: text, visual: { type: 'text' }, durationSec, motion });
const msgs = (s: Script) => motionIssues(s).map((i) => `${i.level}:${i.message}`);

describe('chữ nhấn [ ] và motion', () => {
  it('schema nhận motion hợp lệ, từ chối giá trị lạ', () => {
    const ok = base([sc('a', 'Lại ngồi [cộng sổ]?', { enter: 'type', emphasis: 'strike', decor: 'flowers', transition: 'zoom-through', why: 'x' }), sc('b', 'b')]);
    expect(ScriptSchema.safeParse(ok).success).toBe(true);
    const bad = base([sc('a', 'a', { emphasis: 'nhay-mua' as never }), sc('b', 'b')]);
    expect(ScriptSchema.safeParse(bad).success).toBe(false);
  });

  it('ngoặc lệch là lỗi; cụm dài, quá nhiều cụm, nhấn trùng kiểu liền nhau, glitch sai phong cách là cảnh báo', () => {
    expect(msgs(base([sc('a', 'Lại ngồi [cộng sổ?'), sc('b', 'b')])).join()).toMatch(/^error:.*lệch/);
    const w = msgs(
      base([
        sc('a', '[kho, thu chi, khách quen] gọn', { emphasis: 'circle' }),
        sc('b', '[a] [b] [c] [d]', { emphasis: 'circle', transition: 'glitch-cut' }),
      ]),
    ).join('\n');
    expect(w).toMatch(/dài 24 ký tự/);
    expect(w).toMatch(/nhấn 4 cụm/);
    expect(w).toMatch(/cùng kiểu nhấn "circle"/);
    expect(w).toMatch(/glitch-cut chỉ hợp/);
    expect(msgs(base([sc('a', 'x', { decor: 'hearts' }), sc('b', 'y', { decor: 'stars' }), sc('c', 'z', { decor: 'coins' })]))).toEqual([
      expect.stringMatching(/tối đa 2/),
    ]);
  });

  it('so lời khách / ưu đãi bỏ qua dấu [ ]', () => {
    expect(normalizeText('Giảm [20%] khi mua')).toBe(normalizeText('Giảm 20% khi mua'));
  });
});
