import { describe, expect, it } from 'vitest';
import { VOICE } from '../config/voice.ts';
import { vieneuText, vieneuTokens } from '../scripts/lib/vieneu-voice.ts';
import { lineStyle, spokenText, voiceScriptIssues, VoiceScriptSchema } from '../scripts/lib/voice-script.ts';
import { injectMusicAutomation, musicLevelPoints, voiceTags, voiceTimingScript } from '../scripts/lib/voice-stage.ts';
import { faceClips, voiceFaceIssues } from '../scripts/lib/voice-sync.ts';
import { measureTake, pcmToWav, takeAudioIssues, toMono24k, trimSilence } from '../scripts/lib/voice-wav.ts';

const script = (over: Record<string, unknown> = {}) =>
  VoiceScriptSchema.parse({
    dan: { 'chu-quan': { giong: 'Tưởng Vy', gioi: 'nu', hoSo: 'Chị chủ quán Sài Gòn' }, 'nguoi-dan': { giong: 'Đăng Quân', gioi: 'nam', hoSo: 'Giọng dẫn' } },
    cau: [{ id: 'lo', vai: 'chu-quan', at: 2, loi: '[thở gấp] Trời đất ơi!', camXuc: 'lo-lang' }],
    ...over,
  });

const tone = (sec: number, amp: number) => {
  const n = Math.round(24000 * sec), b = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / 8) * amp * 32767 * (0.3 + 0.7 * ((i / 2400) % 2 < 1 ? 1 : 0.2))), i * 2);
  return pcmToWav(b);
};

describe('lời đọc', () => {
  it('mặc định giọng miền Nam; người dẫn đọc kiểu kể chuyện, nhân vật tự nhiên', () => {
    const vs = script();
    expect(vs.giongVung).toBe('nam');
    expect(lineStyle(vs.cau[0])).toBe('natural');
    expect(lineStyle({ ...vs.cau[0], vai: 'nguoi-dan' })).toBe('storytelling');
    expect(lineStyle({ ...vs.cau[0], phongCach: 'storytelling' })).toBe('storytelling');
  });

  it('chặn hai vai cùng giọng, vai chưa có, câu ngoài video, trùng mã, câu không chữ', () => {
    const vs = script({
      dan: { 'chu-quan': { giong: 'Tưởng Vy', gioi: 'nu', hoSo: 'x' }, 'nhan-vien': { giong: 'Tưởng Vy', gioi: 'nu', hoSo: 'y' } },
      cau: [
        { id: 'a', vai: 'chu-quan', at: 1, loi: 'Ủa?', camXuc: 'sung-sot' },
        { id: 'a', vai: 'ong-chu', at: 40, loi: '[cười]', camXuc: 'cuoi' },
      ],
    });
    const out = voiceScriptIssues(vs, 30).join('\n');
    for (const s of ['cùng giọng "Tưởng Vy"', 'vai "ong-chu"', 'giây 40', 'trùng mã', 'không có chữ']) expect(out).toContain(s);
    expect(voiceScriptIssues(script(), 30)).toEqual([]);
  });

  it('dàn giọng bắt buộc khai giới tính', () => {
    expect(() => VoiceScriptSchema.parse({ dan: { a: { giong: 'Ngọc Lan', hoSo: 'x' } }, cau: [{ id: 'x', vai: 'a', at: 0, loi: 'Chào', camXuc: 'cuoi' }] })).toThrow();
  });

  it('lời gửi VieNeu: thẻ đổi sang thẻ VieNeu hiểu, thẻ lạ bỏ; token tính tối thiểu 50 ký tự', () => {
    expect(spokenText('[cười lớn] Woa!  [cười] Lẹ quá!')).toBe('Woa! Lẹ quá!');
    expect(vieneuText('[cười lớn] Woa! [thở gấp] Trời ơi [thở phào] Phù')).toBe('[cười] Woa! Trời ơi [thở dài] Phù');
    expect(vieneuTokens('Ủa?')).toBe(Math.ceil(50 * VOICE.vieneu.tokenPerChar));
    expect(vieneuTokens('x'.repeat(100))).toBe(Math.ceil(100 * VOICE.vieneu.tokenPerChar));
  });
});

describe('bản giọng trên máy', () => {
  it('PCM thô thành WAV 24 kHz mono; WAV sẵn giữ nguyên', () => {
    const wav = pcmToWav(Buffer.alloc(48000));
    expect(wav.subarray(0, 4).toString()).toBe('RIFF');
    expect(wav.readUInt32LE(24)).toBe(24000);
    expect(wav.length).toBe(48044);
    expect(pcmToWav(wav)).toBe(wav);
  });

  it('WAV 48 kHz stereo đổi về 24 kHz mono, giữ độ dài', () => {
    const n = 48000, b = Buffer.alloc(n * 4);
    for (let i = 0; i < n; i++) { const v = Math.round(Math.sin(i / 10) * 12000); b.writeInt16LE(v, i * 4); b.writeInt16LE(v, i * 4 + 2); }
    const h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + b.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
    h.writeUInt32LE(48000, 24); h.writeUInt32LE(48000 * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(b.length, 40);
    const out = toMono24k(Buffer.concat([h, b]));
    expect(out.readUInt32LE(24)).toBe(24000);
    expect(out.readUInt16LE(22)).toBe(1);
    expect(measureTake(out).thoiLuong).toBeCloseTo(1, 2);
  });

  it('bỏ bản câm, quá ngắn, quá dài, quá chỗ trống; bản thường giữ', () => {
    const ok = measureTake(tone(1.5, 0.5));
    expect(ok.thoiLuong).toBeCloseTo(1.5, 2);
    expect(takeAudioIssues(ok, 'Trời đất ơi!')).toEqual([]);
    expect(takeAudioIssues(measureTake(tone(1.5, 0.001)), 'Trời đất ơi!').join()).toContain('câm');
    expect(takeAudioIssues(measureTake(tone(0.2, 0.5)), 'Kiểm tới kiểm lui sao thiếu').join()).toContain('quá ngắn');
    expect(takeAudioIssues(measureTake(tone(9, 0.5)), 'Ủa?!').join()).toContain('quá dài');
    expect(takeAudioIssues(ok, 'Trời đất ơi!', 1).join()).toContain('chỗ trống');
  });

  it('cắt lặng đầu cuối, chừa 0,05 giây', () => {
    const n = 24000 * 2, b = Buffer.alloc(n * 2);
    for (let i = 12000; i < 36000; i++) b.writeInt16LE(Math.round(Math.sin(i / 6) * 16000), i * 2);
    expect(measureTake(trimSilence(pcmToWav(b))).thoiLuong).toBeCloseTo(1.1, 1);
  });
});

describe('gắn giọng vào bản dựng', () => {
  it('thẻ giọng từ track riêng, cắt ở cuối video', () => {
    const tags = voiceTags([{ id: 'a', at: 1, dur: 1.5, file: 'a.wav', dat: true }, { id: 'b', at: 9, dur: 2, file: 'b.wav', dat: true }], 10);
    expect(tags).toContain(`id="giong-a" src="giong/a.wav" data-start="1.00" data-duration="1.50" data-track-index="${VOICE.trackStart}"`);
    expect(tags).toContain(`data-start="9.00" data-duration="1.00" data-track-index="${VOICE.trackStart + 1}"`);
  });

  it('bước dựng ghi giờ thật của câu cho RS.loi', () => {
    const tag = voiceTimingScript(script(), [{ id: 'lo', at: 2, dur: 1.234, file: 'lo.wav', dat: true }]);
    expect(tag).toContain('window.RS_LOI = {"lo":{"at":2,"dur":1.234');
  });

  it('nhạc hạ khi có lời, hạ sâu ở khoảng lặng, trở lại 1 ở giữa', () => {
    const pts = musicLevelPoints({ totalSec: 20, voice: [{ from: 2, to: 4 }], silence: { from: 10, to: 11, level: 0.15 } });
    const at = (t: number) => pts.find((p) => Math.abs(p.t - t) < 1e-6)?.v;
    expect(pts[0]).toEqual({ t: 0, v: 1 });
    expect(at(2)).toBe(VOICE.duckLevel);
    expect(at(4.15)).toBe(1);
    expect(at(10)).toBe(0.15);
    expect(at(11)).toBe(1);
  });

  it('gắn đường âm lượng vào nhạc; đã có data-automation viết tay thì báo', () => {
    const html = injectMusicAutomation('<audio id="music" src="music/bgm.mp3"></audio>', '{"version":1}');
    expect(html).toContain(`<audio data-automation='{"version":1}' id="music"`);
    expect(() => injectMusicAutomation(html, '{}')).toThrow('data-automation');
    expect(() => injectMusicAutomation('<div></div>', '{}')).toThrow('id="music"');
  });
});

describe('giọng ngoài khung', () => {
  it('chặn giọng trùng lúc thấy mặt người nói, chặn đoạn miệng đang nói; người nghe im lặng thì được', () => {
    const html = '<video src="quay-san/chu.mp4" data-start="2" data-duration="1.5"></video><video src="quay-san/nv.mp4" data-start="5" data-duration="1"></video><video src="quay-san/noi.mp4" data-start="8" data-duration="1"></video>';
    const e = (vai: string, mieng: 'im' | 'noi') => ({ file: '', source: 'pexels', link: '', author: '', license: '', aiGenerated: false, vai, nguoi: vai, camXuc: 'lo-lang', mieng, addedAt: '' });
    const log = new Map([['quay-san/chu.mp4', e('chu-quan', 'im')], ['quay-san/nv.mp4', e('nhan-vien', 'im')], ['quay-san/noi.mp4', e('chu-quan', 'noi')]]);
    const out = voiceFaceIssues([{ id: 'a', vai: 'chu-quan', camXuc: 'lo-lang', at: 1, dur: 1.5 }, { id: 'b', vai: 'chu-quan', camXuc: 'lo-lang', at: 4.8, dur: 1 }], faceClips(html), log).join('\n');
    expect(out).toContain('Câu "a"');
    expect(out).not.toContain('Câu "b"');
    expect(out).toContain('quay-san/noi.mp4');
  });
});

describe('luật cứng reel 15–30 giây', () => {
  it('khoảng của loại video giao với 15–30', async () => {
    const { reelRange } = await import('../config/video-types.ts');
    expect(reelRange({ minSec: 30, maxSec: 60 })).toEqual({ min: 30, max: 30 });
    expect(reelRange({ minSec: 10, maxSec: 20 })).toEqual({ min: 15, max: 20 });
    expect(reelRange({ minSec: 7, maxSec: 15 })).toEqual({ min: 15, max: 15 });
    expect(reelRange({ minSec: 20, maxSec: 40 })).toEqual({ min: 20, max: 30 });
  });
});
