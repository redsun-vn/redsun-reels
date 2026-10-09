import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterAll, afterEach, describe, expect, it } from 'vitest';
import type { Script } from '../config/script.schema.ts';
import { existingHashes, fileHash, listMedia, mediaWarnings, prepareMedia, safeFileName } from '../scripts/lib/brief-media.ts';
import { REPO_ROOT, runFfmpeg } from '../scripts/lib/hyperframes-env.ts';
import { ASSET_EXTENSIONS } from '../scripts/lib/validate-video.ts';

const tmpRoot = join(REPO_ROOT, 'out', 'test-brief-media');
let dir: string | undefined;

function makeBrief(): string {
  mkdirSync(tmpRoot, { recursive: true });
  dir = mkdtempSync(join(tmpRoot, 'b-'));
  mkdirSync(join(dir, 'hinh'));
  return dir;
}

/** Ảnh JPG 200×100 (ngang); `orientation` gắn cờ xoay EXIF như ảnh điện thoại chụp dọc. */
function landscapeJpg(file: string, orientation?: number): void {
  const r = runFfmpeg(['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=red:s=200x100', '-frames:v', '1', file]);
  expect(r.status).toBe(0);
  if (!orientation) return;
  const jpg = readFileSync(file);
  const tiff = Buffer.alloc(26);
  tiff.write('II', 0, 'latin1');
  tiff.writeUInt16LE(0x2a, 2);
  tiff.writeUInt32LE(8, 4);
  tiff.writeUInt16LE(1, 8); // 1 mục trong IFD0
  tiff.writeUInt16LE(0x0112, 10); // Orientation
  tiff.writeUInt16LE(3, 12); // SHORT
  tiff.writeUInt32LE(1, 14);
  tiff.writeUInt16LE(orientation, 18);
  const payload = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), tiff]);
  const app1 = Buffer.concat([Buffer.from([0xff, 0xe1]), Buffer.from([(payload.length + 2) >> 8, (payload.length + 2) & 0xff]), payload]);
  const app0End = 4 + jpg.readUInt16BE(4); // bỏ JFIF APP0, EXIF đứng ngay sau SOI
  writeFileSync(file, Buffer.concat([jpg.subarray(0, 2), app1, jpg.subarray(app0End)]));
}

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});
afterAll(() => rmSync(tmpRoot, { recursive: true, force: true }));

const scriptUsing = (src: string): Script => ({ scenes: [{ id: 'hook', visual: { type: 'asset', src } }] }) as unknown as Script;
const rel = (d: string, f: string) => relative(REPO_ROOT, join(d, 'hinh', f));

describe('hình MKT gửi trong brief', () => {
  it('đổi tên file có dấu, khoảng trắng thành tên an toàn', () => {
    expect(safeFileName('Chị chủ quán Đà Lạt.JPG')).toBe('chi-chu-quan-da-lat.jpg');
    expect(safeFileName('IMG 1234.png')).toBe('img-1234.png');
  });

  it('đổi tên trong thư mục hinh, không trùng file có sẵn', () => {
    const d = makeBrief();
    writeFileSync(join(d, 'hinh', 'Ảnh 1.png'), '');
    writeFileSync(join(d, 'hinh', 'anh-1.png'), '');
    prepareMedia(d);
    expect(readdirSync(join(d, 'hinh')).sort()).toEqual(['anh-1-2.png', 'anh-1.png']);
  });

  it('tên chỉ khác chữ hoa/thường: đổi thẳng, không thêm "-2"', () => {
    const d = makeBrief();
    writeFileSync(join(d, 'hinh', 'Logo.PNG'), '');
    prepareMedia(d);
    expect(readdirSync(join(d, 'hinh'))).toEqual(['logo.png']);
  });

  it('nhận ra file đã có (chép lại cùng file thì bỏ qua)', () => {
    const d = makeBrief();
    writeFileSync(join(d, 'hinh', 'a.png'), 'x');
    const other = join(d, 'b.png');
    writeFileSync(other, 'x');
    expect(existingHashes(d).has(fileHash(other))).toBe(true);
  });

  it('ảnh ngang thật: cảnh báo cắt hai bên; ảnh có cờ xoay dọc: không cảnh báo', () => {
    const d = makeBrief();
    landscapeJpg(join(d, 'hinh', 'ngang.jpg'));
    landscapeJpg(join(d, 'hinh', 'doc.jpg'), 6);
    const byName = new Map(listMedia(d, ASSET_EXTENSIONS).map((m) => [m.path.split('/').pop(), m]));
    expect(byName.get('ngang.jpg')?.orientation).toBe('ngang');
    expect(byName.get('doc.jpg')).toMatchObject({ orientation: 'dọc', width: 100, height: 200 });
    const ngang = mediaWarnings(d, scriptUsing(`./${rel(d, 'ngang.jpg')}`), ASSET_EXTENSIONS).join('\n');
    expect(ngang).toContain('hình ngang');
    expect(ngang).toContain('doc.jpg'); // chưa dùng
    expect(ngang).not.toContain('chưa dùng trong video: doc.jpg, ngang.jpg');
    expect(mediaWarnings(d, scriptUsing(rel(d, 'doc.jpg')), ASSET_EXTENSIONS).join('\n')).not.toContain('hình ngang');
  });

  it('báo file chưa đọc được', () => {
    const d = makeBrief();
    writeFileSync(join(d, 'hinh', 'tai-lieu.pdf'), '');
    expect(mediaWarnings(d, scriptUsing('x.png'), ASSET_EXTENSIONS).join('\n')).toContain('tai-lieu.pdf');
  });
});
