/**
 * ./reel quay-san <tên-video>                                   — liệt kê clip quay sẵn của video (dọc/ngang, số giây, nguồn)
 * ./reel quay-san <tên-video> <file> --link=<trang clip> --tac-gia="<tác giả>" --vai=<vai> --nguoi="<người mẫu>" --cam-xuc=<cảm xúc> --khong-phai-ai
 *
 * Kiểu hình `nguoi-that-quay-san` (REQUIREMENTS v0.5 §7.5): MKT tải clip người thật từ Pexels/Pixabay, Claude mở
 * trang clip kiểm không bị đánh dấu do AI tạo, rồi chạy lệnh này. Lệnh kiểm nguồn, chép vào briefs/<tên>/quay-san/
 * và ghi sổ nguồn nguon.json (validate chỉ nhận clip có trong sổ). Thư mục này không lên repo công khai.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { CAM_XUC, STOCK_FOOTAGE } from '../config/stock-footage.ts';
import { briefDir } from './lib/brief.ts';
import { fileHash, safeFileName } from './lib/brief-media.ts';
import { probeClip } from './lib/clip-check.ts';
import { runCommand } from './lib/cli.ts';
import { checkStockLink } from './lib/stock-footage.ts';
import type { StockEntry } from './lib/kieu-hinh-rules.ts';

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const [slug, file] = args.filter((a) => !a.startsWith('--'));

await runCommand(() => {
  if (!slug) throw new Error('Cách dùng: ./reel quay-san <tên-video> [<file> --link=<trang clip> --tac-gia="<tác giả>" --vai=<vai> --nguoi="<người mẫu>" --cam-xuc=<cảm xúc> --khong-phai-ai]');
  const dir = briefDir(slug);
  if (!existsSync(dir)) throw new Error(`Chưa có video "${slug}". Tạo trước: ./reel new ${slug}`);
  const folder = join(dir, STOCK_FOOTAGE.dir);
  const logPath = join(folder, STOCK_FOOTAGE.logFile);
  const log: { items: StockEntry[] } = existsSync(logPath) ? JSON.parse(readFileSync(logPath, 'utf8')) : { items: [] };

  if (file) {
    if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`Không thấy file "${file}". Kéo lại file vào khung chat.`);
    const ext = extname(file).toLowerCase();
    if (!(STOCK_FOOTAGE.extensions as readonly string[]).includes(ext)) throw new Error(`File ${basename(file)} không dùng được; chỉ nhận ${STOCK_FOOTAGE.extensions.join(', ')}.`);
    const link = flag('link') ?? '';
    const source = checkStockLink(link);
    const author = (flag('tac-gia') ?? '').trim();
    if (!author) throw new Error('Thiếu tên tác giả (--tac-gia="…"), ghi đúng như trên trang clip.');
    const vai = (flag('vai') ?? '').trim(), nguoi = (flag('nguoi') ?? '').trim(), camXuc = (flag('cam-xuc') ?? '').trim();
    if (!vai || !nguoi) throw new Error('Thiếu vai (--vai=chu-quan, nhan-vien, khach…) hoặc người mẫu (--nguoi="tác giả, đặc điểm người trong clip"). Một vai phải là một người suốt video.');
    if (!(CAM_XUC as readonly string[]).includes(camXuc)) throw new Error(`Thiếu hoặc sai cảm xúc (--cam-xuc=…): ghi đúng cảm xúc đã thấy trên mặt trong đoạn dùng, một trong ${CAM_XUC.join(', ')}.`);
    if (!args.includes('--khong-phai-ai')) throw new Error('Mở trang clip, kiểm clip KHÔNG bị đánh dấu "AI generated"/do AI tạo, rồi chạy lại kèm --khong-phai-ai. Clip do AI tạo không dùng cho kiểu hình này.');
    mkdirSync(folder, { recursive: true });
    const hash = fileHash(file);
    const dup = readdirSync(folder).find((f) => f !== STOCK_FOOTAGE.logFile && fileHash(join(folder, f)) === hash);
    let name = dup ?? safeFileName(basename(file));
    if (!dup) {
      for (let i = 2; existsSync(join(folder, name)); i++) name = safeFileName(`${basename(file, ext)}-${i}${ext}`);
      copyFileSync(file, join(folder, name));
    }
    log.items = log.items.filter((x) => x.file !== name);
    log.items.push({ file: name, source: source.id, link, author, license: source.license, aiGenerated: false, vai, nguoi, camXuc, addedAt: new Date().toISOString() });
    writeFileSync(logPath, JSON.stringify(log, null, 2) + '\n');
    console.log(`${dup ? 'Đã có, cập nhật nguồn' : 'Đã thêm'}: ${STOCK_FOOTAGE.dir}/${name} (${source.license}, ${author}).`);
  }

  if (!log.items.length) {
    console.log('Chưa có clip quay sẵn nào.');
    return;
  }
  for (const it of log.items) {
    const p = join(folder, it.file);
    const info = existsSync(p) && /\.(mp4|mov|webm)$/i.test(it.file) ? probeClip(p) : undefined;
    const shape = info ? `${info.height > info.width ? 'dọc' : 'ngang (bị cắt hai bên trong video dọc)'} · ${info.durationSec.toFixed(1)}s` : existsSync(p) ? 'ảnh' : 'THIẾU FILE';
    console.log(`- ${STOCK_FOOTAGE.dir}/${it.file} · ${shape} · vai ${it.vai ?? '?'} (${it.nguoi ?? '?'}) · ${it.camXuc ?? '?'} · ${it.source} · ${it.author}`);
  }
});
