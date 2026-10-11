/**
 * Đo thời gian máy chạy từ brief đến MP4: mỗi lệnh ./reel ghi một dòng vào briefs/<tên>/thoi-gian.jsonl.
 * "Máy chạy" = từ lúc tạo brief (lệnh new, hoặc dòng đầu) tới lúc render xong, trừ các khoảng chờ người
 * (từ mốc "moc hoi" — ghi ngay trước mỗi câu hỏi MKT — tới lệnh kế tiếp).
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const THOI_GIAN_FILE = 'thoi-gian.jsonl';
/** Lệnh đánh dấu bắt đầu chờ người (./reel moc <tên> hoi). */
export const MOC_HOI = 'moc-hoi';
const LENH_XUAT = new Set(['render', 'make']);

export interface DongThoiGian {
  lenh: string;
  batDau: string;
  ketThuc: string;
  giay: number;
  ok: boolean;
}

export interface TongThoiGian {
  mayChaySec: number;
  choNguoiSec: number;
  /** Tổng giây theo từng lệnh (render, snap, ai, giong…). */
  theoLenh: Record<string, number>;
  /** Máy chạy ngoài các lệnh ./reel: Claude nghĩ, viết file. */
  giuaCacLenhSec: number;
}

export function ghiThoiGian(dir: string, lenh: string, batDau: number, ketThuc: number, ok: boolean): void {
  const dong: DongThoiGian = {
    lenh,
    batDau: new Date(batDau).toISOString(),
    ketThuc: new Date(ketThuc).toISOString(),
    giay: Math.round((ketThuc - batDau) / 100) / 10,
    ok,
  };
  appendFileSync(join(dir, THOI_GIAN_FILE), JSON.stringify(dong) + '\n');
}

export function docThoiGian(dir: string): DongThoiGian[] {
  const file = join(dir, THOI_GIAN_FILE);
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .flatMap((l) => {
      try {
        return [JSON.parse(l) as DongThoiGian];
      } catch {
        return []; // dòng hỏng (máy tắt giữa lúc ghi): bỏ qua
      }
    });
}

/**
 * Tính thời gian máy chạy. `dangChay` là lệnh xuất đang chạy (chưa ghi dòng) để render tự tính cả chính nó.
 */
export function tongMayChay(dongs: DongThoiGian[], dangChay?: { lenh: string; batDau: number; ketThuc: number }): TongThoiGian {
  const ds = dongs.map((d) => ({ lenh: d.lenh, bd: Date.parse(d.batDau), kt: Date.parse(d.ketThuc), ok: d.ok }));
  if (dangChay) ds.push({ lenh: dangChay.lenh, bd: dangChay.batDau, kt: dangChay.ketThuc, ok: true });
  ds.sort((a, b) => a.bd - b.bd);
  const theoLenh: Record<string, number> = {};
  if (!ds.length) return { mayChaySec: 0, choNguoiSec: 0, theoLenh, giuaCacLenhSec: 0 };

  const iNew = ds.findIndex((d) => d.lenh === 'new');
  const dau = iNew >= 0 ? iNew : 0;
  // Điểm cuối: lần xuất thành công cuối cùng (xuất lỗi không tính là "có MP4")
  let cuoi = -1;
  for (let i = ds.length - 1; i >= dau; i--) if (LENH_XUAT.has(ds[i].lenh) && ds[i].ok) { cuoi = i; break; }
  if (cuoi < 0) cuoi = ds.length - 1; // chưa xuất được: tính tới lệnh cuối
  const khoang = ds.slice(dau, cuoi + 1);
  const lenhs = khoang.filter((d) => d.lenh !== MOC_HOI);

  let choNguoi = 0;
  for (let i = 0; i < khoang.length; i++) {
    const d = khoang[i];
    if (d.lenh !== MOC_HOI) continue;
    const sau = khoang.slice(i + 1).find((x) => x.lenh !== MOC_HOI);
    if (!sau) continue;
    // Lệnh chạy nền (ai, giong) vẫn chạy trong lúc chờ người: phần đó là máy chạy, không trừ
    choNguoi += Math.max(0, sau.bd - d.bd - phanChong(lenhs, d.bd, sau.bd));
  }
  for (const d of lenhs) {
    const giay = Math.max(0, d.kt - d.bd) / 1000;
    theoLenh[d.lenh] = Math.round(((theoLenh[d.lenh] ?? 0) + giay) * 10) / 10;
  }
  const trongLenh = phanChong(lenhs, khoang[0].bd, khoang[khoang.length - 1].kt) / 1000; // lệnh chạy chồng giờ chỉ tính một lần
  const tong = Math.max(0, khoang[khoang.length - 1].kt - khoang[0].bd) / 1000;
  const mayChay = Math.max(0, tong - choNguoi / 1000);
  return {
    mayChaySec: Math.round(mayChay),
    choNguoiSec: Math.round(choNguoi / 1000),
    theoLenh,
    giuaCacLenhSec: Math.round(Math.max(0, mayChay - trongLenh)),
  };
}

/** Số mili giây trong [tu, den] có ít nhất một lệnh đang chạy (gộp các lệnh chồng giờ). */
function phanChong(lenhs: Array<{ bd: number; kt: number }>, tu: number, den: number): number {
  const ks = lenhs.map((d) => [Math.max(tu, d.bd), Math.min(den, d.kt)] as const).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  let tong = 0, dangA = -Infinity, dangB = -Infinity;
  for (const [a, b] of ks) {
    if (a > dangB) {
      if (dangB > dangA) tong += dangB - dangA;
      dangA = a;
      dangB = b;
    } else dangB = Math.max(dangB, b);
  }
  if (dangB > dangA) tong += dangB - dangA;
  return tong;
}

export function dongMayChay(t: TongThoiGian): string {
  const phut = (s: number) => (s / 60).toFixed(1).replace('.', ',');
  return `Máy chạy ${phut(t.mayChaySec)} phút (chờ người ${phut(t.choNguoiSec)} phút).`;
}
