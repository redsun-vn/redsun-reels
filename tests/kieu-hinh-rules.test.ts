import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { AI_LABEL_ON_SCREEN, AI_VIDEO, aiLabelFor } from '../config/ai-video.ts';
import type { Script } from '../config/script.schema.ts';
import { aiRefs, aiRuleIssues, kieuHinhIssue, labelIssues, stockLog } from '../scripts/lib/kieu-hinh-rules.ts';
import { checkStockLink } from '../scripts/lib/stock-footage.ts';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';
import { buildPost } from '../scripts/lib/post-caption.ts';

const tmpRoot = join(REPO_ROOT, 'out', 'test-ai-rules');
afterAll(() => rmSync(tmpRoot, { recursive: true, force: true }));

const script = (over: Partial<Script> = {}) => ({
  hook: 'Em chuyển rồi nha', cta: 'Nhắn tin để được tư vấn', music: 'x', videoType: 'so-sanh', build: 'custom', product: 'sipos', template: 'BeforeAfter', style: 'vui-nhon',
  scenes: [{ id: 'c0', role: 'hook', onScreenText: 'Em chuyển rồi nha', visual: { type: 'text' }, durationSec: 4 }],
  ...over,
}) as unknown as Script;

const LABEL = `<div class="rs-nhan-ai" data-nhan-ai>${AI_LABEL_ON_SCREEN}</div>`;
const page = (inner: string, css = '', js = '') => `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-duration="12">
  <div id="sA" class="clip" data-start="0" data-duration="12"><video src="ai/canh-1.mp4"></video></div>
  ${inner}
</div><script>${js}</script></body></html>`;

function briefDir(log?: object, post?: string): string {
  mkdirSync(tmpRoot, { recursive: true });
  const dir = mkdtempSync(join(tmpRoot, 'b-'));
  mkdirSync(join(dir, 'ai'));
  writeFileSync(join(dir, 'ai', 'canh-1.mp4'), '');
  if (log) writeFileSync(join(dir, 'ai', 'nhat-ky.json'), JSON.stringify(log));
  if (post) writeFileSync(join(dir, 'post.md'), post);
  return dir;
}
const LOG = { items: [{ file: 'canh-1.mp4', model: 'veo-3.1-fast', prompt: 'chủ tiệm tạp hoá đếm tiền', costUsd: 0.6 }] };
const msgs = (x: Array<{ message: string }>) => x.map((i) => i.message).join('\n');

describe('luật cứng kiểu hình', () => {
  it('kiểu hình phải được chọn rõ (thiếu, sai đều là lỗi)', () => {
    expect(kieuHinhIssue('minh-hoa')).toBeNull();
    expect(kieuHinhIssue('nguoi-that-ai')).toBeNull();
    expect(kieuHinhIssue(undefined)?.message).toContain('chon-kieu-hinh');
    expect(kieuHinhIssue('nguoi-that')?.level).toBe('error');
  });

  it('minh hoạ không được dùng cảnh AI', () => {
    const dir = briefDir(LOG);
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: script(), html: page('') }))).toContain('minh hoạ không được dùng cảnh AI');
    expect(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: script(), html: '<div></div>' })).toEqual([]);
    expect(aiRefs('', script({ scenes: [{ id: 'c', role: 'hook', onScreenText: 'a', visual: { type: 'asset', src: 'briefs/x/ai/a.png' }, durationSec: 3 }] as Script['scenes'] }))).toEqual(['briefs/x/ai/a.png']);
  });

  it('người thật AI: chặn khi quy trình chưa bật, loại video cấm, không dựng riêng', () => {
    const dir = briefDir(LOG);
    const m = msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-ai', script: script({ videoType: 'khach-hang-noi', build: undefined }), html: page(LABEL) }));
    if (!AI_VIDEO.enabled) expect(m).toContain('chưa bật');
    expect(m).toContain('khach-hang-noi');
    expect(m).toContain('dựng riêng');
  });

  it('nhãn AI: đúng chữ, đúng class, ngoài clip, không style riêng, CSS/JS không được chạm', () => {
    expect(labelIssues(page(LABEL))).toEqual([]);
    expect(labelIssues(page('')).join('\n')).toContain('Thiếu nhãn AI');
    expect(labelIssues(page(`<div class="rs-nhan-ai" data-nhan-ai>Có dùng AI</div>`)).join('\n')).toContain('đúng chữ');
    expect(labelIssues(page(`<div class="x" data-nhan-ai>${AI_LABEL_ON_SCREEN}</div>`)).join('\n')).toContain('class');
    expect(labelIssues(page(`<div class="rs-nhan-ai" data-nhan-ai style="opacity:0">${AI_LABEL_ON_SCREEN}</div>`)).join('\n')).toContain('style riêng');
    expect(labelIssues(page('').replace('</div>\n  \n', `${LABEL}</div>\n`)).join('\n')).toContain('con trực tiếp');
    expect(labelIssues(page(LABEL, '.rs-nhan-ai{opacity:0}')).join('\n')).toContain('CSS');
    expect(labelIssues(page(LABEL, '', 'tl.to("[data-nhan-ai]", { opacity: 0 });')).join('\n')).toContain('JS');
  });

  it('cảnh AI phải có trong nhật ký tạo; caption phải mở đầu bằng nhãn', () => {
    const noLog = msgs(aiRuleIssues({ dir: briefDir(), kieuHinh: 'nguoi-that-ai', script: script(), html: page(LABEL) }));
    expect(noLog).toContain('nhật ký');
    const goodPost = buildPost({ script: script(), hashtags: ['#SIPOS'], aiLabel: aiLabelFor(true, false) });
    expect(goodPost).toContain(AI_VIDEO.captionLabel);
    expect(goodPost).toContain('khai báo nội dung AI');
    const ok = msgs(aiRuleIssues({ dir: briefDir(LOG, goodPost), kieuHinh: 'nguoi-that-ai', script: script(), html: page(LABEL) }));
    expect(ok).not.toContain('nhật ký');
    expect(ok).not.toContain('Caption');
    const badPost = buildPost({ script: script(), hashtags: ['#SIPOS'] });
    expect(msgs(aiRuleIssues({ dir: briefDir(LOG, badPost), kieuHinh: 'nguoi-that-ai', script: script(), html: page(LABEL) }))).toContain('Caption');
  });

  it('link clip quay sẵn: chỉ trang một clip trên Pexels/Pixabay', () => {
    expect(checkStockLink('https://www.pexels.com/video/a-woman-counting-money-8358964/').id).toBe('pexels');
    expect(checkStockLink('https://pixabay.com/videos/shop-market-vendor-12345/').id).toBe('pixabay');
    expect(() => checkStockLink('https://www.youtube.com/watch?v=1')).toThrow('Chỉ nhận');
    expect(() => checkStockLink('https://www.pexels.com/search/videos/shop/')).toThrow('đúng một clip');
    expect(() => checkStockLink('khong-phai-link')).toThrow('không hợp lệ');
  });

  it('người thật quay sẵn: clip phải có trong sổ nguồn hợp lệ, không dùng cảnh AI, loại video cấm', () => {
    const dir = briefDir();
    mkdirSync(join(dir, 'quay-san'));
    writeFileSync(join(dir, 'quay-san', 'quay.mp4'), '');
    writeFileSync(join(dir, 'quay-san', 'la.mp4'), '');
    for (const f of ['khac.mp4', 'thieu.mp4']) writeFileSync(join(dir, 'quay-san', f), '');
    writeFileSync(join(dir, 'quay-san', 'nguon.json'), JSON.stringify({ items: [
      { file: 'quay.mp4', source: 'pexels', link: 'https://www.pexels.com/video/shop-8358964/', author: 'Tác giả A', license: 'Pexels License', aiGenerated: false, vai: 'chu-quan', nguoi: 'A, tóc dài', camXuc: 'lo-lang', chauA: true, addedAt: 'x' },
      { file: 'khac.mp4', source: 'pexels', link: 'https://www.pexels.com/video/other-123/', author: 'B', license: 'Pexels License', aiGenerated: false, vai: 'chu-quan', nguoi: 'B, tóc ngắn', camXuc: 'cuoi', chauA: true, addedAt: 'x' },
      { file: 'thieu.mp4', source: 'pexels', link: 'https://www.pexels.com/video/x-9/', author: 'C', license: 'Pexels License', aiGenerated: false, addedAt: 'x' },
      { file: 'la.mp4', source: 'pixabay', link: 'https://pixabay.com/videos/x-1/', author: 'B', license: 'Pixabay Content License', aiGenerated: true, addedAt: 'x' },
    ] }));
    const html = (src: string) => `<div data-composition-id="main"><video src="${src}"></video></div>`;
    expect([...stockLog(dir).valid.keys()]).toEqual(['quay-san/quay.mp4', 'quay-san/khac.mp4']);
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/thieu.mp4') }))).toContain('cảm xúc');
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/quay.mp4') + html('quay-san/khac.mp4') }))).toContain('Một vai phải là một người');
    expect(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/quay.mp4') })).toEqual([]);
    const bad = msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script({ videoType: 'tuyen-dung' }), html: html('quay-san/la.mp4') + html('ai/canh-1.mp4') }));
    for (const s of ['do AI tạo', 'tuyen-dung', 'không được dùng cảnh AI']) expect(bad).toContain(s);
    writeFileSync(join(dir, 'quay-san', 'khong-ghi.mp4'), '');
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/khong-ghi.mp4') }))).toContain('sổ nguồn');
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: script(), html: html('quay-san/quay.mp4') }))).toContain('clip quay sẵn');
    // Người lộ mặt phải là người châu Á; cận bàn tay (khong-mat) thì không cần
    writeFileSync(join(dir, 'quay-san', 'tay.mp4'), '');
    writeFileSync(join(dir, 'quay-san', 'nguon.json'), JSON.stringify({ items: [
      { file: 'quay.mp4', source: 'pexels', link: 'https://www.pexels.com/video/shop-8358964/', author: 'A', license: 'Pexels License', aiGenerated: false, vai: 'chu-quan', nguoi: 'A', camXuc: 'cuoi', addedAt: 'x' },
      { file: 'tay.mp4', source: 'pexels', link: 'https://www.pexels.com/video/hand-77/', author: 'D', license: 'Pexels License', aiGenerated: false, vai: 'khach', nguoi: 'D, chỉ bàn tay', camXuc: 'khong-mat', addedAt: 'x', cat: { tu: 0, dai: 3 } },
    ] }));
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/quay.mp4') }))).toContain('người châu Á');
    expect(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/tay.mp4') })).toEqual([]);
    // Máy khác chưa có clip nhưng sổ có cách cắt: chỉ cách tải lại
    rmSync(join(dir, 'quay-san', 'tay.mp4'));
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'nguoi-that-quay-san', script: script(), html: html('quay-san/tay.mp4') }))).toContain('--tai-lai');
  });

  it('nhãn AI theo nội dung AI: hình, giọng, hoặc cả hai', () => {
    expect(aiLabelFor(false, false)).toBeNull();
    expect(aiLabelFor(true, false)).toEqual({ label: 'Do AI sản xuất', caption: `⚠️ ${AI_VIDEO.label}.` });
    expect(aiLabelFor(false, true)).toEqual({ label: 'Do AI sản xuất', caption: '⚠️ Video có giọng đọc do AI tạo.' });
    expect(aiLabelFor(true, true)?.caption).toBe('⚠️ Video có hình ảnh và giọng đọc do AI tạo.');
    const dir = briefDir();
    const custom = script({ build: 'custom' });
    const page = (label: string) => `<div data-composition-id="main"><div class="clip"></div><div class="rs-nhan-ai" data-nhan-ai>${label}</div></div>`;
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: custom, html: page('Video có giọng đọc do AI tạo'), hasVoice: true }))).toContain('Do AI sản xuất');
    expect(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: custom, html: page(AI_LABEL_ON_SCREEN), hasVoice: true })).toEqual([]);
    expect(msgs(aiRuleIssues({ dir, kieuHinh: 'minh-hoa', script: script({ build: undefined }), html: '', hasVoice: true }))).toContain('dựng riêng');
    expect(buildPost({ script: script(), hashtags: [], aiLabel: aiLabelFor(false, true) })).toContain('⚠️ Video có giọng đọc do AI tạo.');
  });

  it('caption ghi nguồn clip quay sẵn', () => {
    const post = buildPost({ script: script(), hashtags: [], stockCredits: [{ author: 'Tác giả A', license: 'Pexels License', link: 'https://www.pexels.com/video/shop-8358964/' }] });
    expect(post).toContain('Clip quay sẵn: Tác giả A (Pexels License)');
    expect(post).not.toContain(AI_VIDEO.captionLabel);
  });
});

