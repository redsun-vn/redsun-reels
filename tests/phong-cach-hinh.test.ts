import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PHONG_CACH_HINH, PHONG_CACH_HINH_IDS } from '../config/phong-cach-hinh.ts';
import { ScriptSchema, type Script } from '../config/script.schema.ts';
import { phongCachIssues } from '../scripts/lib/custom-video.ts';
import { phongCachLapIssues } from '../scripts/lib/motion-check.ts';
import { recentSameKieuHinh } from '../scripts/lib/recent-videos.ts';
import { validateVideo } from '../scripts/lib/validate-video.ts';

const KIT = '<link rel="stylesheet" href="_rieng/phong-cach.css" /><script src="_rieng/phong-cach.js"></script>';
const KIT_NV = '<script src="_rieng/phong-cach-nhan-vat.js"></script>';

describe('phong cách hình: kịch bản và composition khớp nhau', () => {
  it('mọi phong cách có thông tin; schema nhận mã hợp lệ, chặn mã lạ, thiếu vẫn đọc được', () => {
    for (const id of PHONG_CACH_HINH_IDS) expect(PHONG_CACH_HINH[id].ten).toBeTruthy();
    const base = { title: 't', bigIdea: 'b', hookAngle: 'lat-nguoc' };
    const ok = (c: object) => ScriptSchema.shape.concept.safeParse({ ...base, ...c }).success;
    expect(ok({ phongCachHinh: 'manga' })).toBe(true);
    expect(ok({})).toBe(true);
    expect(ok({ phongCachHinh: 'anime' })).toBe(false);
  });

  it('phong cách truyện: phải gọi RS.phongCach đúng mã và nạp bộ phong-cach', () => {
    expect(phongCachIssues(KIT + '<script>RS.phongCach(null, "comic");</script>', 'comic')).toEqual([]);
    expect(phongCachIssues(KIT + '<script>RS.oTruyen("#a", "doc-2");</script>', 'comic').join()).toContain('gọi RS.phongCach(null, "comic")');
    expect(phongCachIssues(KIT + '<script>RS.phongCach(null, "manga");</script>', 'comic').join()).toContain('cùng một phong cách');
    expect(phongCachIssues('<script>RS.phongCach(null, "comic");</script>', 'comic').join()).toContain('_rieng/phong-cach.js');
  });

  it('phụ kiện nhân vật cần phong-cach-nhan-vat.js', () => {
    const html = KIT + '<script>RS.phongCach(root, "sieu-anh-hung"); RS.anhHung(p, {});</script>';
    expect(phongCachIssues(html, 'sieu-anh-hung').join()).toContain('phong-cach-nhan-vat.js');
    expect(phongCachIssues(KIT_NV + html, 'sieu-anh-hung')).toEqual([]);
  });

  it('thủ pháp trang truyện và siêu anh hùng cần nạp đúng file', () => {
    const base = KIT + '<script>RS.phongCach(null, "manga");';
    expect(phongCachIssues(base + 'RS.chibi(tl, p, 1);</script>', 'manga').join()).toContain('phong-cach-truyen.js');
    expect(phongCachIssues(base.replace('<script>', '<script src="_rieng/phong-cach-truyen.js"></script><script>') + 'RS.chibi(tl, p, 1);</script>', 'manga')).toEqual([]);
    expect(phongCachIssues(base + 'RS.bienHinh(tl, p, 1);</script>', 'manga').join()).toContain('phong-cach-anh-hung.js');
  });

  it('video "thuong" (hoặc thiếu trường): không gắn phong cách truyện, không dùng chữ Bangers', () => {
    expect(phongCachIssues('<div>chữ</div>', undefined)).toEqual([]);
    expect(phongCachIssues(KIT + '<script>RS.phongCach(null, "comic");</script>', 'thuong').join()).toContain('concept.phongCachHinh');
    expect(phongCachIssues('<style>.x{font-family: var(--font-comic)}</style>', undefined).join()).toContain('chỉ dùng khi phong cách hình');
    expect(phongCachIssues(KIT + '<div class="rs-tuong-thanh">BÙM!</div><script>RS.phongCach(null, "manga");</script>', 'manga')).toEqual([]);
  });
});

describe('phong cách hình: chữ Bangers và logo ngực', () => {
  const pg = (body: string) => KIT + KIT_NV + body + '<script>RS.phongCach(null, "sieu-anh-hung");</script>';

  it('chữ tượng thanh ≤ 3 từ, không chữ số', () => {
    expect(phongCachIssues(pg('<div class="rs-tuong-thanh vang">XỊN QUÁ!</div>'), 'sieu-anh-hung', 'sipos')).toEqual([]);
    expect(phongCachIssues(pg('<div class="rs-tuong-thanh">GIẢM 20%!</div>'), 'sieu-anh-hung', 'sipos').join()).toContain('không có chữ số');
    expect(phongCachIssues(pg('<b class="rs-tieu-de-truyen">Một hai ba bốn</b>'), 'sieu-anh-hung', 'sipos').join()).toContain('≤ 3 từ');
    expect(phongCachIssues(pg('<div class="rs-tuong-thanh no">BÙM!</div>'), 'sieu-anh-hung', 'sipos').join()).toContain('<span>');
    expect(phongCachIssues(pg('<div class="rs-tuong-thanh no"><span>BÙM!</span></div>'), 'sieu-anh-hung', 'sipos')).toEqual([]);
    expect(phongCachIssues(pg('<div class="rs-tuong-thanh no"><span>GIẢM 20%</span></div>'), 'sieu-anh-hung', 'sipos').join()).toContain('không có chữ số');
  });

  it('logo ngực: đường dẫn ghi thẳng, có thật, đúng sản phẩm', () => {
    const ok = pg('<script>RS.anhHung(p, { bieuTuong: "brand/logos/sipos/sipos-icon.webp" });</script>');
    expect(phongCachIssues(ok, 'sieu-anh-hung', 'sipos')).toEqual([]);
    expect(phongCachIssues(ok, 'sieu-anh-hung', 'webino').join()).toContain('brand/logos/webino/');
    expect(phongCachIssues(pg('<script>RS.anhHung(p, { bieuTuong: "brand/logos/sipos/khong-co.png" });</script>'), 'sieu-anh-hung', 'sipos').join()).toContain('không có trong dự án');
    expect(phongCachIssues(pg('<script>RS.anhHung(p, { bieuTuong: LOGO });</script>'), 'sieu-anh-hung', 'sipos').join()).toContain('ghi thẳng đường dẫn');
  });
});

describe('phong cách hình: xoay vòng theo sản phẩm', () => {
  const s = (product: string, phongCachHinh?: string, build = 'custom') => ({ product, build, concept: { phongCachHinh } }) as unknown as Script;

  it('giống video gần nhất cùng sản phẩm là cảnh báo; khác sản phẩm hay khác phong cách thì không', () => {
    expect(phongCachLapIssues(s('sipos', 'comic'), [{ name: 'a', script: s('sipos', 'comic') }])[0].message).toContain('giống video SIPOS gần nhất "a"');
    expect(phongCachLapIssues(s('bos', 'manga'), [{ name: 'x', script: s('bos', 'manga') }])[0].message).toContain('REDSUN BOS');
    expect(phongCachLapIssues(s('sipos', 'comic'), [{ name: 'a', script: s('webino', 'comic') }])).toEqual([]);
    expect(phongCachLapIssues(s('sipos', 'comic'), [{ name: 'a', script: s('sipos', 'manga') }, { name: 'b', script: s('sipos', 'comic') }])).toEqual([]);
  });

  it('chỉ so với video minh hoạ (video người thật luôn "thuong", không tính)', () => {
    const root = mkdtempSync(join(tmpdir(), 'reel-pch-ganday-'));
    const mk = (name: string, kieuHinh: string, pch: string) => {
      mkdirSync(join(root, name));
      writeFileSync(join(root, name, 'brief.md'), `---\nproduct: sipos\nkieuHinh: ${kieuHinh}\n---\nx\n`);
      writeFileSync(join(root, name, 'script.json'), JSON.stringify({ concept: { title: 't', bigIdea: 'b', hookAngle: 'lat-nguoc', phongCachHinh: pch }, videoType: 'so-sanh', style: 'vui-nhon', template: 'BeforeAfter', build: 'custom', product: 'sipos', hook: 'h', cta: 'c', music: 'm', scenes: [{ id: 'a', role: 'hook', onScreenText: 'a', visual: { type: 'text' }, durationSec: 10 }, { id: 'b', role: 'cta', onScreenText: 'b', visual: { type: 'logo' }, durationSec: 10 }] }));
    };
    mk('a-ai', 'nguoi-that-ai', 'thuong');
    mk('b-minh-hoa', 'minh-hoa', 'comic');
    mkdirSync(join(root, 'c-moi'));
    expect(recentSameKieuHinh(join(root, 'c-moi'), 'minh-hoa').map((r) => r.name)).toEqual(['b-minh-hoa']);
  });

  it('thiếu trường tính là "thuong"; video mẫu có sẵn (template) không tính', () => {
    expect(phongCachLapIssues(s('bos'), [{ name: 'a', script: s('bos', 'thuong') }])).toHaveLength(1);
    expect(phongCachLapIssues(s('bos'), [{ name: 'a', script: s('bos', undefined, 'template') }])).toEqual([]);
  });
});

describe('phong cách hình: chỉ video hoạt hình', () => {
  const BRIEF = `---
product: sipos
kieuHinh: nguoi-that-quay-san
videoType: ra-mat-tinh-nang
template: FeatureLaunch
goal: "Giới thiệu tính năng kiểm kho"
audience: "Chủ quán F&B nhỏ"
duration: 22
tone: "nhanh"
cta: "Tìm hiểu thêm tại sipos.vn"
music: test-pad-01
---
Ý chính: kiểm kho nhanh.
`;
  const script = (phongCachHinh: string) => ({
    concept: { title: 't', bigIdea: 'b', hookAngle: 'cau-hoi-noi-dau', phongCachHinh },
    videoType: 'ra-mat-tinh-nang', style: 'toi-gian', template: 'FeatureLaunch', build: 'custom', product: 'sipos',
    hook: 'Bạn vẫn kiểm kho bằng sổ tay?', cta: 'Tìm hiểu thêm tại sipos.vn', music: 'test-pad-01',
    scenes: [
      { id: 'hook', role: 'hook', onScreenText: 'Bạn vẫn kiểm kho bằng sổ tay?', visual: { type: 'text' }, durationSec: 10 },
      { id: 'cta', role: 'cta', onScreenText: 'Tìm hiểu thêm tại sipos.vn', visual: { type: 'logo' }, durationSec: 10 },
    ],
  });
  const errs = (pch: string, brief = BRIEF) => {
    const dir = mkdtempSync(join(tmpdir(), 'reel-pch-'));
    writeFileSync(join(dir, 'brief.md'), brief);
    writeFileSync(join(dir, 'script.json'), JSON.stringify(script(pch)));
    return validateVideo(dir, { musicPurpose: 'test' }).issues.filter((i) => i.level === 'error').map((i) => i.message).join('\n');
  };

  it('mọi phong cách truyện có mẫu nhịp 6 nhịp', () => {
    for (const id of PHONG_CACH_HINH_IDS.filter((x) => x !== 'thuong')) {
      expect(PHONG_CACH_HINH[id].mauNhip).toHaveLength(6);
    }
  });

  it('tự chấm phải đối chiếu mẫu nhịp; dưới 5/6 là cảnh báo viết lại', () => {
    const warns = (notes: string) => {
      const dir = mkdtempSync(join(tmpdir(), 'reel-pch-mau-'));
      writeFileSync(join(dir, 'brief.md'), BRIEF.replace('kieuHinh: nguoi-that-quay-san', 'kieuHinh: minh-hoa'));
      writeFileSync(join(dir, 'script.json'), JSON.stringify({ ...script('manga'), selfScore: { total: 88, notes } }));
      return validateVideo(dir, { musicPurpose: 'test' }).issues.filter((i) => i.level === 'warning').map((i) => i.message).join('\n');
    };
    expect(warns('Hook 22/25.')).toContain('chưa đối chiếu mẫu nhịp');
    expect(warns('Hook 22/25. Mẫu manga 4/6 (…).')).toContain('chỉ đạt 4/6');
    const ok = warns('Hook 22/25. Mẫu manga 6/6 (…).');
    expect(ok).not.toContain('mẫu nhịp');
    expect(ok).not.toContain('chỉ đạt');
  });

  it('video người thật dùng phong cách truyện là lỗi; minh hoạ thì không', () => {
    expect(errs('manga')).toContain('chỉ dùng cho video hoạt hình');
    expect(errs('thuong')).not.toContain('chỉ dùng cho video hoạt hình');
    expect(errs('manga', BRIEF.replace('kieuHinh: nguoi-that-quay-san', 'kieuHinh: minh-hoa'))).not.toContain('chỉ dùng cho video hoạt hình');
  });
});
