import { describe, expect, it } from 'vitest';
import { STYLES, STYLE_IDS, StyleSchema } from '../config/styles.ts';
import { OCCASION_STYLES, VIDEO_TYPES, VideoTypeSchema } from '../config/video-types.ts';
import { countWords, sceneDurationSec } from '../config/scene-timing.ts';
import { resolveStyle } from '../scripts/lib/resolve-style.ts';

describe('styles', () => {
  it('có đủ 19 phong cách, id không trùng, đúng schema', () => {
    expect(STYLES).toHaveLength(19);
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(19);
    for (const s of STYLES) StyleSchema.parse(s);
    expect(STYLES.map((s) => s.id).sort()).toEqual([...STYLE_IDS].sort());
  });
});

describe('video types', () => {
  it('có đủ 20 loại, id không trùng, đúng schema và ràng buộc mặc định/nên tránh', () => {
    expect(VIDEO_TYPES).toHaveLength(20);
    expect(new Set(VIDEO_TYPES.map((t) => t.id)).size).toBe(20);
    for (const t of VIDEO_TYPES) VideoTypeSchema.parse(t);
  });

  it('mọi loại mở đầu bằng hook', () => {
    for (const t of VIDEO_TYPES) expect(t.roles[0]).toBe('hook');
  });

  it('dịp lễ chỉ trỏ tới phong cách có thật', () => {
    for (const s of Object.values(OCCASION_STYLES)) expect(STYLE_IDS).toContain(s);
  });
});

describe('scene timing', () => {
  it('đếm từ tiếng Việt theo âm tiết', () => {
    expect(countWords('Kiểm kho bằng điện thoại')).toBe(5);
    expect(countWords('   ')).toBe(0);
    expect(countWords('SIPOS — REDSUN · Webino')).toBe(3);
  });

  it('áp tối thiểu 1.5 giây + 0.5 giây animation', () => {
    expect(sceneDurationSec('SIPOS')).toBe(2);
  });

  it('0.4 giây/từ cho chữ dài, cộng dòng phụ', () => {
    // 7 từ chính + 4 từ phụ = 11 từ × 0.4 = 4.4 + 0.5
    expect(sceneDurationSec('Quét mã vạch, tồn kho cập nhật', 'ngay trên điện thoại')).toBe(4.9);
  });
});

describe('resolveStyle', () => {
  it('bỏ trống style → mặc định của loại video', () => {
    expect(resolveStyle({ videoType: 'khuyen-mai' })).toMatchObject({ style: 'khuyen-mai', source: 'video-type-default' });
  });

  it('dịp lễ ghi đè mặc định', () => {
    expect(resolveStyle({ videoType: 'chuc-mung-dip-le', occasion: '20-10' })).toMatchObject({ style: 'lang-man', source: 'occasion' });
  });

  it('MKT chọn phong cách nên tránh → vẫn giữ, có cảnh báo', () => {
    const r = resolveStyle({ videoType: 'khach-hang-noi', style: 'glitch-cyberpunk' });
    expect(r.style).toBe('glitch-cyberpunk');
    expect(r.warnings).toHaveLength(1);
  });

  it('báo lỗi tiếng Việt khi id sai', () => {
    expect(() => resolveStyle({ videoType: 'khong-co' })).toThrow(/Không có loại video/);
    expect(() => resolveStyle({ videoType: 'meo-hay', style: 'khong-co' })).toThrow(/Không có phong cách/);
  });
});
