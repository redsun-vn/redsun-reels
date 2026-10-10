/**
 * Kiểm link nguồn của clip người thật quay sẵn (REQUIREMENTS v0.5 §7.5): phải là trang một clip/ảnh trên nguồn được
 * phép (config/stock-footage.ts), không phải trang tìm kiếm hay link tải trực tiếp.
 */
import { STOCK_FOOTAGE } from '../../config/stock-footage.ts';

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
