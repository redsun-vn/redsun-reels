import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Script } from '../config/script.schema.ts';
import { loadStylePreset } from '../config/style-preset.schema.ts';
import { STYLE_IDS } from '../config/styles.ts';
import { REPO_ROOT } from '../scripts/lib/hyperframes-env.ts';
import { hasErrors, hookIssues, rolesMatch, validateVideo } from '../scripts/lib/validate-video.ts';

const BRIEF = `---
product: sipos
kieuHinh: minh-hoa
videoType: ra-mat-tinh-nang
template: FeatureLaunch
goal: "Giới thiệu tính năng kiểm kho bằng điện thoại"
audience: "Chủ quán F&B nhỏ"
duration: 22
tone: "nhanh, gần gũi"
cta: "Tìm hiểu thêm tại sipos.vn"
music: test-pad-01
assets:
  - brand/logos/sipos/sipos-logo-chuan.png
---
Ý chính: kiểm kho nhanh.
`;

function baseScript(): Script {
  return {
    concept: { title: 'Kiểm kho 5 phút', bigIdea: 'Đếm hàng bằng điện thoại', hookAngle: 'cau-hoi-noi-dau' },
    videoType: 'ra-mat-tinh-nang',
    style: 'toi-gian',
    template: 'FeatureLaunch',
    product: 'sipos',
    hook: 'Bạn vẫn kiểm kho bằng sổ tay?',
    scenes: [
      { id: 'hook', role: 'hook', onScreenText: 'Bạn vẫn kiểm kho bằng sổ tay?', visual: { type: 'text' }, durationSec: 4 },
      { id: 'problem', role: 'problem', onScreenText: 'Mỗi tối mất 2 giờ đếm hàng', visual: { type: 'text' }, durationSec: 6 },
      { id: 'solution', role: 'solution', onScreenText: 'SIPOS quét mã, tồn kho cập nhật ngay', visual: { type: 'phone', src: 'brand/logos/sipos/sipos-logo-chuan.png' }, durationSec: 7 },
      { id: 'cta', role: 'cta', onScreenText: 'Tìm hiểu thêm tại sipos.vn', visual: { type: 'logo' }, durationSec: 5 },
    ],
    cta: 'Tìm hiểu thêm tại sipos.vn',
    music: 'test-pad-01',
  };
}

function makeDir(script: unknown, brief = BRIEF): string {
  const dir = mkdtempSync(join(tmpdir(), 'reel-'));
  writeFileSync(join(dir, 'brief.md'), brief);
  writeFileSync(join(dir, 'script.json'), JSON.stringify(script));
  return dir;
}

const errorsOf = (s: unknown, brief?: string) => validateVideo(makeDir(s, brief), { musicPurpose: 'test' }).issues.filter((i) => i.level === 'error').map((i) => i.message);

describe('validateVideo', () => {
  it('kịch bản hợp lệ không có lỗi', () => {
    expect(errorsOf(baseScript())).toEqual([]);
  });

  it('hook quá 40 ký tự / quá 2 dòng', () => {
    expect(hookIssues('a'.repeat(41))).toHaveLength(1);
    expect(hookIssues('một\nhai\nba')).toHaveLength(1);
    expect(hookIssues('Bạn vẫn kiểm kho\nbằng sổ tay?')).toHaveLength(0);
  });

  it('thứ tự role sai', () => {
    const s = baseScript();
    [s.scenes[1], s.scenes[2]] = [s.scenes[2], s.scenes[1]];
    expect(errorsOf(s).join(' ')).toMatch(/Thứ tự cảnh/);
  });

  it('role lặp hợp lệ theo repeatRole', () => {
    expect(rolesMatch(['hook', 'solution', 'solution', 'solution', 'cta'], ['hook', 'solution', 'cta'], 'solution')).toBe(true);
    expect(rolesMatch(['hook', 'solution', 'solution', 'cta'], ['hook', 'solution', 'cta'])).toBe(false);
  });

  it('cảnh quá ngắn để đọc', () => {
    const s = baseScript();
    s.scenes[2].durationSec = 2;
    s.scenes[3].durationSec = 10;
    expect(errorsOf(s).join(' ')).toMatch(/kịp đọc chữ/);
  });

  it('tổng thời lượng lệch quá 10% so với brief', () => {
    expect(errorsOf(baseScript(), BRIEF.replace('duration: 22', 'duration: 30')).join(' ')).toMatch(/lệch quá 10%/);
  });

  it('nhạc thử nghiệm bị chặn khi làm video thật', () => {
    const issues = validateVideo(makeDir(baseScript()), { musicPurpose: 'production' }).issues;
    expect(hasErrors(issues)).toBe(true);
    expect(issues.map((i) => i.message).join(' ')).toMatch(/chỉ để thử nghiệm/);
  });

  it('thiếu file hình', () => {
    const s = baseScript();
    s.scenes[2].visual.src = 'assets/sipos/khong-co.png';
    expect(errorsOf(s).join(' ')).toMatch(/Thiếu file hình/);
  });

  it('template không thuộc loại video', () => {
    const s = baseScript();
    s.template = 'TipOfTheDay';
    expect(errorsOf(s, BRIEF.replace('template: FeatureLaunch', 'template: auto')).join(' ')).toMatch(/dùng template FeatureLaunch/);
  });

  it('cả 19 phong cách đều có preset hợp lệ; id lạ báo lỗi tiếng Việt', () => {
    for (const id of STYLE_IDS) expect(loadStylePreset(REPO_ROOT, id).id).toBe(id);
    expect(() => loadStylePreset(REPO_ROOT, 'khong-co')).toThrow(/chưa dựng được/);
  });

  it('chống bịa: ưu đãi và tên khách phải có nguyên văn trong phần nội dung brief', () => {
    const s = baseScript();
    s.scenes[2].promo = { badge: '-30%', priceNew: '99.000đ' };
    s.scenes[2].attribution = 'Chị Lan · Tạp hoá Lan';
    const msgs = errorsOf(s).join(' ');
    expect(msgs).toMatch(/badge "-30%" không có nguyên văn trong brief/);
    expect(msgs).toMatch(/priceNew "99.000đ" không có nguyên văn/);
    expect(msgs).toMatch(/tên khách "Chị Lan · Tạp hoá Lan" không có trong brief/);
  });

  it('chống bịa: số trong frontmatter (duration 22) không hợp thức hoá badge -22%', () => {
    const s = baseScript();
    s.scenes[2].promo = { badge: '-22%' };
    expect(errorsOf(s).join(' ')).toMatch(/badge "-22%" không có nguyên văn/);
  });

  it('chống bịa: ngày 20/10 không hợp thức hoá -20%; brief có đủ thì qua (kể cả hoá/hóa, 1.200.000 / 1 200 000)', () => {
    const s = baseScript();
    s.scenes[2].promo = { badge: '-20%' };
    expect(errorsOf(s, BRIEF + 'Lời chúc 20/10.\n').join(' ')).toMatch(/badge "-20%" không có nguyên văn/);
    s.scenes[2].promo = { badge: '-20%', priceOld: '1.200.000đ', deadline: 'Đến hết 31/10' };
    s.scenes[2].attribution = 'Chị Lan · Tạp hoá Lan';
    const body = 'Giảm 20%, giá cũ 1 200 000đ, đến hết 31/10. Khách: chị Lan, Tạp hóa Lan.\n';
    const msgs = errorsOf(s, BRIEF + body).join(' ');
    expect(msgs).not.toMatch(/không có nguyên văn|tên khách/);
  });

  it('khối khuyến mãi: cảnh quá ngắn và đếm ngược đi cùng giá bị chặn', () => {
    const s = baseScript();
    s.scenes[2].promo = { countdownFrom: 5, badge: '-20%' };
    const msgs = errorsOf(s, BRIEF + 'Giảm 20%.\n').join(' ');
    expect(msgs).toMatch(/cần dài ít nhất 7.2s/);
    expect(msgs).toMatch(/đếm ngược không đi cùng badge/);
  });

  it('split cần cả ảnh trước và sau', () => {
    const s = baseScript();
    s.scenes[2].visual = { type: 'split', src: 'assets/_demo/sipos-kiem-kho.png' };
    expect(errorsOf(s).join(' ')).toMatch(/cần cả ảnh trước/);
  });

  it('brief và kịch bản chọn khác phong cách / nhạc', () => {
    expect(errorsOf(baseScript(), BRIEF.replace('music: test-pad-01', 'music: test-pad-01\nstyle: vui-nhon')).join(' ')).toMatch(/Brief chọn phong cách/);
    expect(errorsOf(baseScript(), BRIEF.replace('music: test-pad-01', 'music: khac-01')).join(' ')).toMatch(/Brief chọn nhạc/);
  });

  it('mã cảnh trùng', () => {
    const s = baseScript();
    s.scenes[2].id = 'problem';
    expect(errorsOf(s).join(' ')).toMatch(/Mã cảnh bị trùng/);
  });

  it('hình nằm ngoài dự án hoặc sai định dạng', () => {
    const s = baseScript();
    s.scenes[2].visual.src = '../../etc/hosts';
    expect(errorsOf(s).join(' ')).toMatch(/phải nằm trong thư mục dự án/);
    s.scenes[2].visual.src = 'package.json';
    expect(errorsOf(s).join(' ')).toMatch(/không phải định dạng hình\/clip/);
  });

  it('brief sai định dạng báo bằng tiếng Việt', () => {
    expect(errorsOf(baseScript(), 'không có frontmatter').join(' ')).toMatch(/phải bắt đầu bằng/);
  });

  it('chữ không ở dạng NFC', () => {
    const s = baseScript();
    s.scenes[1].onScreenText = s.scenes[1].onScreenText.normalize('NFD');
    expect(errorsOf(s).join(' ')).toMatch(/NFC/);
  });
});
