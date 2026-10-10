/**
 * Kiểm link nguồn của clip người thật quay sẵn (REQUIREMENTS v0.5 §7.5): phải là trang một clip/ảnh trên nguồn được
 * phép (config/stock-footage.ts), không phải trang tìm kiếm hay link tải trực tiếp.
 */
import { STOCK_FOOTAGE } from '../../config/stock-footage.ts';
import { runFfmpeg } from './hyperframes-env.ts';

export type StockSource = (typeof STOCK_FOOTAGE.sources)[number];

/** Đường dẫn trang một clip/ảnh: Pexels /video/<tên>-<số>/, /photo/…; Pixabay /videos/<tên>-<số>/, /photos/…. */
const ITEM_PATH = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(?:video|videos|photo|photos)\/[^/]*\d+\/?$/i;

export function checkStockLink(link: string): StockSource {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new Error(`Link "${link}" không hợp lệ. Dán link trang clip (vd. https://www.pexels.com/video/…-1234567/).`);
  }
  const source = STOCK_FOOTAGE.sources.find((s) => s.host.test(url.hostname));
  if (!source) throw new Error(`Chỉ nhận clip từ ${STOCK_FOOTAGE.sources.map((s) => s.id).join(' hoặc ')}. Nguồn khác (YouTube, TikTok, Google…) không dùng.`);
  if (!ITEM_PATH.test(url.pathname)) throw new Error('Link phải là trang của đúng một clip (có số ở cuối), không phải trang tìm kiếm hay link tải file.');
  return source;
}

/**
 * Đoạn clip lấy từ nguồn (giây bắt đầu, độ dài) để máy khác tải lại đúng đoạn: clip không lên repo công khai,
 * nên sổ nguồn giữ cách cắt thay cho file. Hiện tự tải được từ Pexels (trang clip → link tải của Pexels).
 */
export interface StockCut {
  tu: number;
  dai: number;
}

/** Link tải file gốc của trang clip Pexels (theo chuyển hướng của pexels.com/download/video/<số>/). */
export async function stockFileUrl(link: string): Promise<string> {
  const source = checkStockLink(link);
  const id = /(\d+)\/?$/.exec(new URL(link).pathname)?.[1];
  if (source.id !== 'pexels' || !/\/videos?\//.test(new URL(link).pathname) || !id) throw new Error(`Chỉ tự tải được clip Pexels; clip ${link} cần tải tay từ trang nguồn.`);
  const r = await fetch(`https://www.pexels.com/download/video/${id}/`, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0' } });
  const loc = r.headers.get('location');
  if (!loc || !/^https:\/\/videos\.pexels\.com\//.test(loc)) throw new Error(`Không lấy được link tải clip ${id} từ Pexels (mã ${r.status}). Kiểm mạng rồi chạy lại.`);
  return loc;
}

/** Cắt đoạn [tu, tu+dai] của clip nguồn thành MP4 dọc 1080×1920, 30fps, H.264, không tiếng (chỉ tải phần cần). */
export function cutStockSegment(url: string, cut: StockCut, out: string): void {
  const r = runFfmpeg(['-v', 'error', '-y', '-ss', String(cut.tu), '-t', String(cut.dai), '-i', url, '-an', '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  if (r.status !== 0) throw new Error(`Cắt clip lỗi: ${(r.stderr || '').trim().split('\n').slice(-1)[0]}`);
}
