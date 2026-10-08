import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import type { Script } from '../config/script.schema.ts';
import { STAT_NUMBER_RE, splitStatValue, statsSequenceSec } from '../config/stats-timing.ts';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';
import { timedScenes } from '../scripts/lib/build-props.ts';
import { factIssues } from '../scripts/lib/fact-check.ts';
import { DUCK_LEVEL, duckingPoints } from '../scripts/lib/music-ducking.ts';

const CLIP = 'assets/_demo/nguoi-noi-test.mp4';

function talking(scenes: Script['scenes']): Script {
  return {
    concept: { title: 't', bigIdea: 't', hookAngle: 'quote' },
    videoType: 'video-co-nguoi-noi',
    style: 'tin-cay',
    template: 'TalkingHead',
    product: 'sipos',
    hook: scenes[0].onScreenText,
    scenes,
    cta: 'Tìm hiểu thêm tại sipos.vn',
    music: 'test-pad-01',
  };
}

const sc = (id: string, role: Script['scenes'][number]['role'], visual: Script['scenes'][number]['visual'], durationSec: number): Script['scenes'][number] => ({ id, role, onScreenText: id, visual, durationSec });

describe('đoạn clip liền mạch và tiếng gốc', () => {
  it('cảnh liền nhau cùng clip, không khai clipStart → một đoạn, tiếng nối tiếp', () => {
    const { scenes, voiceWindows } = timedScenes(
      talking([sc('a', 'hook', { type: 'asset', src: CLIP }, 4), sc('b', 'problem', { type: 'asset', src: CLIP }, 5), sc('c', 'solution', { type: 'text' }, 3), sc('d', 'cta', { type: 'logo' }, 3)]),
    );
    expect(scenes[0].shot).toEqual({ duration: 9, mediaStart: 0, audio: true });
    expect(scenes[1].continues).toBe(true);
    expect(voiceWindows).toEqual([{ start: 0, end: 9 }]);
  });

  it('clipStart mở đoạn mới; mute tắt tiếng; loại video không giữ tiếng thì không hạ nhạc', () => {
    const s = talking([sc('a', 'hook', { type: 'asset', src: CLIP }, 4), sc('b', 'problem', { type: 'asset', src: CLIP, clipStart: 10 }, 3), sc('c', 'solution', { type: 'asset', src: CLIP, mute: true }, 3), sc('d', 'cta', { type: 'logo' }, 3)]);
    const { scenes, voiceWindows } = timedScenes(s);
    expect(scenes[1].shot?.mediaStart).toBe(10);
    expect(scenes[2].shot?.audio).toBe(false);
    expect(voiceWindows).toEqual([{ start: 0, end: 4 }, { start: 4, end: 7 }]);
    expect(timedScenes({ ...s, videoType: 'tong-ket-su-kien', template: 'EventRecap' }).voiceWindows).toEqual([]);
  });

  it('đổi mute giữa chừng: clip vẫn chạy tiếp từ chỗ cũ; cảnh CTA không tính', () => {
    const { scenes, voiceWindows } = timedScenes(
      talking([sc('a', 'hook', { type: 'asset', src: CLIP }, 4), sc('b', 'problem', { type: 'asset', src: CLIP, mute: true }, 3), sc('c', 'solution', { type: 'asset', src: CLIP }, 2), sc('d', 'cta', { type: 'asset', src: CLIP }, 3)]),
    );
    expect(scenes.map((x) => x.shot?.mediaStart)).toEqual([0, 4, 7, undefined]);
    expect(voiceWindows).toEqual([{ start: 0, end: 4 }, { start: 7, end: 9 }]);
  });

  it('loại video không giữ tiếng: mỗi cảnh một clip từ 0 như trước, không nối', () => {
    const s = { ...talking([sc('a', 'hook', { type: 'asset', src: CLIP }, 4), sc('b', 'solution', { type: 'asset', src: CLIP }, 3), sc('c', 'cta', { type: 'logo' }, 3)]), videoType: 'meo-hay', template: 'TipOfTheDay' as const };
    const { scenes } = timedScenes(s);
    expect(scenes.map((x) => [x.shot?.mediaStart, !!x.continues])).toEqual([[0, false], [0, false], [undefined, false]]);
  });

  it('lane hạ nhạc: dốc trước/sau, gộp khoảng sát nhau, không vượt tổng thời lượng', () => {
    expect(duckingPoints([], 10)).toEqual([]);
    expect(duckingPoints([{ start: 0, end: 4 }, { start: 4.5, end: 8 }], 10)).toEqual([
      { t: 0, v: DUCK_LEVEL },
      { t: 8, v: DUCK_LEVEL },
      { t: 8.3, v: 1 },
    ]);
    expect(duckingPoints([{ start: 2, end: 10 }], 10)).toEqual([
      { t: 0, v: 1 },
      { t: 1.7, v: 1 },
      { t: 2, v: DUCK_LEVEL },
      { t: 10, v: DUCK_LEVEL },
    ]);
  });
});

describe('số liệu (Stats)', () => {
  it('tách giá trị giữ đơn vị', () => {
    expect(splitStatValue('1.200+')).toEqual({ prefix: '', number: '1.200', suffix: '+' });
    expect(splitStatValue('98%')).toEqual({ prefix: '', number: '98', suffix: '%' });
    expect(splitStatValue('x3,5 lần')).toEqual({ prefix: 'x', number: '3,5', suffix: ' lần' });
    expect(statsSequenceSec(3)).toBe(3.5);
  });

  it('cách tách số của validate (TS) và template (JS) giống nhau; cách viết lạ bị chặn, template hiện nguyên chữ', () => {
    const win: { RedsunKitCore: object; RedsunKitBlocks?: { parseStat: (v: string) => { value: number } | null; formatStat: (p: object, v: number) => string } } = { RedsunKitCore: {} };
    runInNewContext(readFileSync(join(REPO_ROOT, 'templates', '_shared', 'kit-blocks.js'), 'utf8'), { window: win });
    const js = win.RedsunKitBlocks!;
    for (const v of ['1.200+', '98%', '4,8', '10 phút', 'x3,5 lần', '12,000']) {
      const p = js.parseStat(v)!;
      expect(STAT_NUMBER_RE.test(splitStatValue(v).number)).toBe(true);
      expect(js.formatStat(p, p.value)).toBe(v);
    }
    expect(js.formatStat(js.parseStat('1.200+')!, 600)).toBe('600+');
    for (const v of ['1.234,5', '1,234.5', '2.5.1']) {
      expect(STAT_NUMBER_RE.test(splitStatValue(v).number)).toBe(false);
      expect(js.parseStat(v)).toBeNull();
    }
  });

  const stats = (values: string[], durationSec = 5, chart?: 'bar'): Script => ({
    ...talking([
      { id: 'h', role: 'hook', onScreenText: 'Một năm của SIPOS', visual: { type: 'text' }, durationSec: 3 },
      { id: 'p', role: 'proof', onScreenText: 'Kết quả', visual: { type: 'text' }, durationSec, stats: values.map((value) => ({ value, label: 'chỉ số' })), chart },
      { id: 'c', role: 'cta', onScreenText: 'Tìm hiểu thêm tại sipos.vn', visual: { type: 'logo' }, durationSec: 3 },
    ]),
    videoType: 'so-lieu-thanh-tich',
    template: 'Stats',
  });
  const errors = (s: Script, body: string) => factIssues(s, body).filter((i) => i.level === 'error').map((i) => i.message);

  it('số liệu phải có nguyên văn trong brief (kể cả đơn vị)', () => {
    expect(errors(stats(['1.200+', '98%']), 'Có 1.200+ cửa hàng, 98% hài lòng.')).toEqual([]);
    expect(errors(stats(['98%']), 'Có 98 cửa hàng.')).toHaveLength(1);
    expect(errors(stats(['1200+']), 'Có 1.200+ cửa hàng.')).toEqual([]);
    expect(errors(stats(['98%']), 'Có 98 % khách hài lòng.')).toEqual([]);
    expect(errors(stats(['1.234,5']), 'Doanh thu 1.234,5 triệu.').join()).toMatch(/viết chưa rõ/);
  });

  it('cảnh quá ngắn, biểu đồ khác đơn vị hoặc một chỉ số bị chặn', () => {
    const body = '60 phút, 10 phút, 98%';
    expect(errors(stats(['60 phút', '10 phút'], 2.5), body).join()).toMatch(/ít nhất 3.2s/);
    expect(errors(stats(['60 phút', '98%'], 5, 'bar'), body).join()).toMatch(/cùng đơn vị/);
    expect(errors(stats(['60 phút'], 5, 'bar'), body).join()).toMatch(/ít nhất 2 chỉ số/);
    expect(errors(stats(['60 phút', '10 phút'], 5, 'bar'), body)).toEqual([]);
  });

  it('video số liệu phải có cảnh stats; TalkingHead phải có clip', () => {
    const s = stats(['98%']);
    s.scenes[1].stats = undefined;
    expect(errors(s, '98%').join()).toMatch(/ít nhất một cảnh có số liệu/);
    const t = talking([sc('a', 'hook', { type: 'text' }, 3), sc('b', 'cta', { type: 'logo' }, 3)]);
    expect(errors(t, '').join()).toMatch(/clip quay người nói/);
  });

  it('montage cần đủ thời lượng cho mỗi hình', () => {
    const m = talking([sc('a', 'hook', { type: 'montage', srcs: ['a.jpg', 'b.jpg', 'c.jpg'] }, 1.5), sc('b', 'cta', { type: 'logo' }, 3)]);
    expect(errors({ ...m, template: 'EventRecap', videoType: 'tong-ket-su-kien' }, '').join()).toMatch(/ít nhất 1.8s/);
  });
});
