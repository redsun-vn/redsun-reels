import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import type { Script } from '../config/script.schema.ts';
import { backdropNames, customIssues, extractScreenText, unmarkedScriptText } from '../scripts/lib/custom-video.ts';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';

const tmpRoot = join(REPO_ROOT, 'out', 'test-custom-video');
afterAll(() => rmSync(tmpRoot, { recursive: true, force: true }));

const script = {
  hook: 'Chị chủ quán, tối nay\nlại ngồi [cộng sổ]?',
  cta: 'Tìm hiểu thêm tại [sipos.vn]',
  music: 'mixkit-it-s-love-834',
  scenes: [
    { id: 'c0', onScreenText: 'Chị chủ quán, tối nay lại ngồi [cộng sổ]?', durationSec: 4 },
    { id: 'c1', onScreenText: 'SIPOS lo [kho]', promo: { badge: '-20%' }, durationSec: 4 },
    { id: 'c2', onScreenText: 'Tìm hiểu thêm tại [sipos.vn]', durationSec: 4 },
  ],
} as unknown as Script;
const brief = 'Ưu đãi: giảm 20% khi mua gói giải pháp.';

function page(body: string, js = ''): string {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8" /><style>.a{font-family: var(--font-body)}</style></head><body>
<div id="root" data-composition-id="main" data-duration="12" data-width="1080" data-height="1920">${body}
<audio id="music" src="music/bgm.mp3" data-start="0"></audio>
<!-- TIENG-DONG --></div>
<script>const tl = gsap.timeline({ paused: true });${js}
window.__timelines["main"] = tl;</script></body></html>`;
}
const OK_BODY = '<h1>Chị chủ quán, <em>tối nay</em> lại ngồi cộng sổ?</h1><img alt="SIPOS" src="brand/logos/sipos/x.png" /><b>lo</b><i>kho</i><div class="stamp">-20%</div><p>Tìm hiểu thêm tại sipos<span>.</span>vn</p>';

function issues(html: string, cues: string | null = '1.00 pop 0.5\n') {
  mkdirSync(tmpRoot, { recursive: true });
  const dir = mkdtempSync(join(tmpRoot, 'b-'));
  mkdirSync(join(dir, 'dung-rieng'));
  writeFileSync(join(dir, 'dung-rieng', 'index.html'), html);
  if (cues !== null) writeFileSync(join(dir, 'dung-rieng', 'tieng-dong.txt'), cues);
  return customIssues(dir, script, brief, 12);
}
const errors = (html: string) => issues(html).filter((i) => i.level === 'error').map((i) => i.message);

describe('video dựng riêng', () => {
  it('đọc chữ tĩnh, alt của logo, đánh dấu phần minh hoạ', () => {
    const t = extractScreenText('<div data-minh-hoa><span>48 gói</span><img src="x.png"/></div><p>Tổng <b>3</b></p><img alt="SIPOS" src="l.png">');
    expect(t).toEqual([
      { text: '48 gói', minhHoa: true },
      { text: 'Tổng', minhHoa: false },
      { text: '3', minhHoa: false },
      { text: 'SIPOS', minhHoa: false },
    ]);
  });

  it('composition đúng chuẩn không có lỗi, đủ chữ kịch bản', () => {
    expect(issues(page(OK_BODY))).toEqual([]);
  });

  it('số ngoài brief trên màn hình là lỗi; trong đạo cụ minh hoạ chỉ cảnh báo', () => {
    expect(errors(page(OK_BODY + '<p>1.200 cửa hàng tin dùng</p>')).join('\n')).toContain('1200');
    const sample = issues(page(OK_BODY + '<div data-minh-hoa><span>Sữa 36 hộp</span></div>'));
    expect(sample.filter((i) => i.level === 'error')).toEqual([]);
    expect(sample.map((i) => i.message).join('\n')).toContain('số mẫu');
  });

  it('chữ gán bằng JS phải ghi // minh-hoa', () => {
    expect(unmarkedScriptText(page('', 'el.textContent = "Giảm 50%";'))).toHaveLength(1);
    expect(unmarkedScriptText(page('', 'el.textContent = "23:48"; // minh-hoa'))).toHaveLength(0);
    expect(unmarkedScriptText(page('', 'el.textContent = "";'))).toHaveLength(0);
  });

  it('chặn sai thời lượng, thiếu nhạc, tải mạng, font lạ, hình không có', () => {
    const bad = page(OK_BODY).replace('data-duration="12"', 'data-duration="15"').replace('src="music/bgm.mp3"', 'src="music/x.mp3"')
      .replace('var(--font-body)', 'Arial') + '<link href="https://fonts.googleapis.com/css2?family=Inter" /><img src="hinh/khong-co.jpg" />';
    const e = errors(bad).join('\n');
    for (const s of ['15s', 'music/bgm.mp3', 'mạng', 'Arial', 'khong-co.jpg']) expect(e).toContain(s);
  });

  it('tiếng động phải có trong brand/sfx', () => {
    expect(errors(page(OK_BODY + '<audio id="s1" src="sfx/pop.wav" data-start="1"></audio>'))).toEqual([]);
    expect(errors(page(OK_BODY + '<audio id="s2" src="sfx/khong-co.wav" data-start="1"></audio>')).join('\n')).toContain('sfx/khong-co.wav');
  });

  it('tiếng động khai trong tieng-dong.txt: tên, giây, âm lượng, chỗ đánh dấu', () => {
    const e = issues(page(OK_BODY), '1 pop 0.5\n2 khong-co 0.5\n13 tap 0.5\n3 tick 2\nsai dong\n').filter((i) => i.level === 'error').map((i) => i.message).join('\n');
    for (const s of ['khong-co', 'giây 13', 'âm lượng 2', 'dòng 5']) expect(e).toContain(s);
    expect(issues(page(OK_BODY).replace('<!-- TIENG-DONG -->', '')).map((i) => i.message).join('\n')).toContain('TIENG-DONG');
    expect(issues(page(OK_BODY), null).map((i) => i.message).join('\n')).toContain('Chưa có tiếng động');
  });

  it('bối cảnh RS.set: phải nạp bộ bối cảnh, tên phải có', () => {
    expect(backdropNames()).toEqual(expect.arrayContaining(['quan', 'nha', 'cua-hang', 'van-phong', 'kho', 'pho', 'livestream', 'bao-dong', 'sang', 'thuong-hieu']));
    const head = '<link rel="stylesheet" href="_rieng/boi-canh.css" /><script src="_rieng/boi-canh.js"></script>';
    expect(errors(page(OK_BODY + head, 'RS.set(document.body, "quan", {});'))).toEqual([]);
    expect(errors(page(OK_BODY, 'RS.set(document.body, "quan");')).join('\n')).toContain('boi-canh.js');
    expect(errors(page(OK_BODY + head, 'RS.set(document.body, "san-bay");')).join('\n')).toContain('"san-bay"');
  });

  it('nhân vật tạo lẻ (không qua dàn nhân vật) thì cảnh báo', () => {
    const w = issues(page(OK_BODY, 'RS.person({ hair: "bun" });')).map((i) => i.message).join('\n');
    expect(w).toContain('RS.cast');
  });

  it('thiếu chữ kịch bản trên màn hình thì cảnh báo', () => {
    const w = issues(page(OK_BODY.replace('<i>kho</i>', ''))).map((i) => i.message).join('\n');
    expect(w).toContain('SIPOS lo kho');
  });
});
