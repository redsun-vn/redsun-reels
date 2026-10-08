import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Script } from '../config/script.schema.ts';
import { hasErrors, hookIssues, rolesMatch, validateVideo } from '../scripts/lib/validate-video.ts';

const BRIEF = `---
product: sipos
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

  it('phong cách chưa có preset bị chặn với thông báo tiếng Việt', () => {
    const s = baseScript();
    s.style = 'retro';
    expect(errorsOf(s).join(' ')).toMatch(/chưa dựng được ở bản hiện tại/);
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
