import { describe, expect, it } from 'vitest';
import { AI_VIDEO } from '../config/ai-video.ts';
import { AiSpecSchema, budgetLeftUsd, emptyLog, framePrompt, rolePrompt, seedOf, specIssues, textVideoPrompt } from '../scripts/lib/ai-scene-spec.ts';
import { estimateVideoUsd, hideKey, videoRequestIssues, type VideoModel } from '../scripts/lib/openrouter-ai.ts';

const seedance: VideoModel = {
  id: 'bytedance/seedance-2.0',
  supported_durations: [4, 5, 6, 8, 10, 12, 15],
  supported_sizes: ['720x1280', '1080x1920'],
  supported_frame_images: ['first_frame', 'last_frame'],
  pricing_skus: { video_tokens: '0.000007', video_tokens_1080p: '0.0000077', video_tokens_without_audio: '0.000007' },
};

const spec = (over: Record<string, unknown> = {}) =>
  AiSpecSchema.parse({
    chung: 'Small Saigon cafe at night.',
    dan: { 'chu-quan': { moTa: 'Vietnamese woman about 35, black hair in a bun, plain apron' } },
    canh: [
      { id: 'thieu-tien', khung: 3, vai: ['chu-quan'], camXuc: 'lo-lang', moTa: 'Close-up, she counts cash at the counter, worried' },
      { id: 'nhe-nhom', khung: 9, vai: ['chu-quan'], camXuc: 'nhe-nhom', moTa: 'Medium shot, she smiles, relieved', video: true, chuyenDong: 'She exhales and smiles' },
    ],
    ...over,
  });

describe('ước tiền, giới hạn model', () => {
  it('Seedance tính theo token video: rộng × cao × 24 × giây ÷ 1024', () => {
    expect(estimateVideoUsd(seedance, 4, '720x1280')).toBeCloseTo(((720 * 1280 * 24 * 4) / 1024) * 0.000007, 6);
    expect(estimateVideoUsd(seedance, 4, '720x1280')).toBeCloseTo(0.6048, 4);
    expect(estimateVideoUsd(seedance, 5, '1080x1920')).toBeCloseTo(((1080 * 1920 * 24 * 5) / 1024) * 0.0000077, 6);
  });

  it('model tính theo giây (không tiếng, theo độ phân giải), không có giá thì báo lỗi', () => {
    const veo: VideoModel = { id: 'google/veo-3.1-fast', pricing_skus: { duration_seconds_without_audio: '0.10', duration_seconds_without_audio_720p: '0.08' } };
    expect(estimateVideoUsd(veo, 6, '720x1280')).toBeCloseTo(0.48, 6);
    expect(estimateVideoUsd({ id: 'x', pricing_skus: { cents_per_second_output: '12' } }, 5, '720x1280')).toBeCloseTo(0.6, 6);
    expect(() => estimateVideoUsd({ id: 'x', pricing_skus: {} }, 5, '720x1280')).toThrow('Chưa đọc được giá');
  });

  it('báo trước yêu cầu chắc chắn lỗi: giây, cỡ, ảnh khung đầu', () => {
    expect(videoRequestIssues(seedance, 4, '720x1280', true)).toEqual([]);
    const out = videoRequestIssues({ ...seedance, supported_frame_images: [] }, 7, '480x854', true).join('\n');
    for (const s of ['7 giây', '480x854', 'khung đầu']) expect(out).toContain(s);
  });

  it('che key trong thông báo lỗi', () => {
    const key = 'sk-or-v1-abcdef0123456789';
    expect(hideKey(`Bearer ${key} hỏng`, key)).toBe('Bearer [đã che] hỏng');
    expect(hideKey('lỗi sk-or-v1-zzzzzzzzzzzz ở đây')).toBe('lỗi [đã che] ở đây');
  });
});

describe('kế hoạch cảnh AI', () => {
  it('chặn vai chưa khai, trùng mã, sai thứ tự khung, clip thiếu chuyển động, mô tả giống người có danh tính', () => {
    expect(specIssues(spec())).toEqual([]);
    const bad = spec({
      dan: { a: { moTa: 'a woman who looks like a famous singer' } },
      canh: [
        { id: 'x', khung: 5, vai: ['a'], camXuc: 'cuoi', moTa: 'smiling at the counter' },
        { id: 'x', khung: 2, vai: ['b'], camXuc: 'cuoi', moTa: 'smiling at the counter', video: true },
      ],
    });
    const out = specIssues(bad).join('\n');
    for (const s of ['trùng mã', 'vai "b"', 'thứ tự khung', 'chuyenDong', 'danh tính']) expect(out).toContain(s);
  });

  it('mô tả gửi model luôn có câu luật cứng; khung đầu nối từng vai với ảnh tham chiếu', () => {
    const s = spec();
    expect(rolePrompt(s, 'chu-quan')).toContain(AI_VIDEO.promptRules);
    const f = framePrompt(s, s.canh[0]);
    expect(f).toContain(AI_VIDEO.promptRules);
    expect(f).toContain('reference image 1');
    expect(f).toContain('Small Saigon cafe');
  });

  it('clip tạo từ chữ: phải là clip, mô tả nhiều cảnh có ngoại hình mọi vai và câu luật cứng', () => {
    const s = spec({ canh: [{ id: 'dem', khung: 2, vai: ['chu-quan'], camXuc: 'lo-lang', moTa: 'Shot 1 (0-3s): she counts cash. Shot 2 (3-6s): close-up, worried.', video: true, tuChu: true, giay: 6 }] });
    expect(specIssues(s)).toEqual([]);
    const p = textVideoPrompt(s, s.canh[0]);
    for (const t of ['multiple shots', 'same face', 'chu-quan: Vietnamese woman', 'Shot 2', AI_VIDEO.promptRules]) expect(p).toContain(t);
    expect(specIssues(spec({ canh: [{ id: 'x', khung: 1, camXuc: 'cuoi', moTa: 'a smiling person at a counter', tuChu: true }] })).join()).toContain('phải là clip');
  });

  it('seed cố định theo tên; phần trần còn lại theo sổ', () => {
    expect(seedOf('khung-a')).toBe(seedOf('khung-a'));
    expect(seedOf('khung-a')).not.toBe(seedOf('khung-b'));
    const log = emptyLog();
    log.chiPhi.usd = 1;
    expect(budgetLeftUsd(log, 52_000, 26_000)).toBeCloseTo(1, 6);
  });

  it('gửi song song: clip đang chờ tính vào trần, clip thứ 3 bị chặn', () => {
    const log = emptyLog();
    const cho = (canh: string) => ({ canh, maViec: canh, pollingUrl: '', model: 'm', prompt: 'p', anhThamChieu: [], seed: 1, giay: 8, uocUsd: 0.8, guiLuc: '' });
    log.dangCho.push(cho('a'), cho('b'));
    const left = budgetLeftUsd(log, 52_000, 26_000); // trần 2 USD, đang giữ 1,6
    expect(left).toBeCloseTo(0.4, 6);
    expect(0.8 > left).toBe(true);
    log.dangCho[0].chiPhiUsd = 0.5; // đã biết giá thật thì dùng giá thật
    expect(budgetLeftUsd(log, 52_000, 26_000)).toBeCloseTo(0.7, 6);
  });
});
