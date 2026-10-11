/**
 * Chạy nhiều việc mạng cùng lúc có giới hạn (ảnh/clip AI, câu giọng đọc).
 * Một việc lỗi không huỷ việc đang chạy, nhưng (mặc định) ngừng nhận việc mới; kết quả theo đúng thứ tự đầu vào, kiểu Promise.allSettled.
 */
export async function chayGioiHan<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
  /** Lỗi nào thì ngừng nhận việc mới (việc đang chạy vẫn chờ xong). Mặc định: mọi lỗi — như chạy tuần tự, không tốn tiền thêm. */
  dungKhi: (reason: unknown) => boolean = () => true,
): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  let dung = false;
  const worker = async () => {
    while (!dung && next < items.length) {
      const i = next++;
      try {
        out[i] = { status: 'fulfilled', value: await fn(items[i], i) };
      } catch (reason) {
        out[i] = { status: 'rejected', reason };
        if (dungKhi(reason)) dung = true;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, worker));
  // Việc chưa bắt đầu vì đã dừng
  for (let i = 0; i < items.length; i++) if (!out[i]) out[i] = { status: 'rejected', reason: new ChuaChayError() };
  return out;
}

/** Việc không chạy vì một việc khác đã lỗi và lệnh ngừng nhận việc mới. */
export class ChuaChayError extends Error {
  constructor() {
    super('chưa chạy (dừng sau lỗi của việc khác)');
  }
}

/** Lỗi đầu tiên trong các kết quả (để ném lại sau khi mọi việc đã xong). */
export function loiDau<R>(rs: PromiseSettledResult<R>[]): unknown {
  return rs.find((r): r is PromiseRejectedResult => r.status === 'rejected' && !(r.reason instanceof ChuaChayError))?.reason;
}
