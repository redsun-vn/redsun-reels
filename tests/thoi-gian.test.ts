import { appendFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MOC_HOI, docThoiGian, ghiThoiGian, tongMayChay, type DongThoiGian } from '../scripts/lib/thoi-gian.ts';

const T0 = Date.parse('2026-10-11T08:00:00Z');
const d = (lenh: string, tu: number, den: number, ok = true): DongThoiGian => ({
  lenh,
  batDau: new Date(T0 + tu * 1000).toISOString(),
  ketThuc: new Date(T0 + den * 1000).toISOString(),
  giay: den - tu,
  ok,
});

describe('thời gian máy chạy brief → MP4', () => {
  it('trừ khoảng chờ người từ mốc hỏi tới lệnh kế tiếp, cộng theo lệnh, tính cả lệnh lỗi', () => {
    const t = tongMayChay([
      d('new', 0, 1),
      d(MOC_HOI, 60, 60),
      d('validate', 360, 362, false), // chờ người 300 giây
      d('validate', 400, 401),
      d('render', 500, 680),
    ]);
    expect(t.choNguoiSec).toBe(300);
    expect(t.mayChaySec).toBe(380);
    expect(t.theoLenh).toEqual({ new: 1, validate: 3, render: 180 });
    expect(t.giuaCacLenhSec).toBe(380 - 184);
  });

  it('thiếu lệnh new: tính từ dòng đầu; lệnh xuất đang chạy được cộng vào', () => {
    const t = tongMayChay([d('snap', 100, 160)], { lenh: 'render', batDau: T0 + 200_000, ketThuc: T0 + 400_000 });
    expect(t.mayChaySec).toBe(300);
    expect(t.theoLenh).toEqual({ snap: 60, render: 200 });
  });

  it('dừng ở lần xuất cuối; không có dòng nào thì 0', () => {
    const t = tongMayChay([d('new', 0, 1), d('render', 10, 20), d('snap', 1000, 1010)]);
    expect(t.mayChaySec).toBe(20);
    expect(tongMayChay([]).mayChaySec).toBe(0);
  });

  it('lệnh chạy nền trong lúc chờ người vẫn là máy chạy; lệnh chồng giờ không cộng hai lần; xuất lỗi không là điểm cuối', () => {
    const t = tongMayChay([
      d('new', 0, 1),
      d('giong', 10, 110), // chạy nền
      d(MOC_HOI, 50, 50),
      d('validate', 200, 201), // chờ người 150 giây, trong đó 60 giây giọng còn chạy
      d('render', 300, 400),
      d('render', 500, 510, false),
    ]);
    expect(t.choNguoiSec).toBe(90);
    expect(t.mayChaySec).toBe(400 - 90);
    expect(t.giuaCacLenhSec).toBe(310 - (1 + 100 + 1 + 100));
  });

  it('ghi và đọc lại file, bỏ dòng hỏng', () => {
    const dir = mkdtempSync(join(tmpdir(), 'thoi-gian-'));
    ghiThoiGian(dir, 'validate', T0, T0 + 1300, true);
    appendFileSync(join(dir, 'thoi-gian.jsonl'), '{"lenh":"ren\n');
    const ds = docThoiGian(dir);
    expect(ds).toHaveLength(1);
    expect(ds[0]).toMatchObject({ lenh: 'validate', giay: 1.3, ok: true });
  });
});
