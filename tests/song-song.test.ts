import { describe, expect, it } from 'vitest';
import { ChuaChayError, chayGioiHan, loiDau } from '../scripts/lib/song-song.ts';

describe('chạy song song có giới hạn', () => {
  it('không vượt giới hạn cùng lúc, giữ thứ tự kết quả, không dừng thì một việc lỗi không huỷ việc khác', async () => {
    let dang = 0, max = 0;
    const rs = await chayGioiHan([30, 10, 20, 5, 15], 2, async (ms, i) => {
      dang++;
      max = Math.max(max, dang);
      await new Promise((r) => setTimeout(r, ms));
      dang--;
      if (i === 2) throw new Error('hỏng');
      return i;
    }, () => false);
    expect(max).toBe(2);
    expect(rs.map((r) => (r.status === 'fulfilled' ? r.value : 'x'))).toEqual([0, 1, 'x', 3, 4]);
    expect((loiDau(rs) as Error).message).toBe('hỏng');
  });

  it('lỗi thì ngừng nhận việc mới (mặc định), việc chưa chạy đánh dấu ChuaChayError', async () => {
    const chay: number[] = [];
    const rs = await chayGioiHan([0, 1, 2, 3], 1, async (x) => {
      chay.push(x);
      if (x === 1) throw new Error('hỏng');
      return x;
    });
    expect(chay).toEqual([0, 1]);
    expect(rs[3].status === 'rejected' && rs[3].reason instanceof ChuaChayError).toBe(true);
    const tiep = await chayGioiHan([0, 1, 2], 1, async (x) => { if (x === 1) throw new Error('429'); return x; }, () => false);
    expect(tiep[2]).toEqual({ status: 'fulfilled', value: 2 });
  });

  it('danh sách rỗng và giới hạn vô hạn', async () => {
    expect(await chayGioiHan([], 3, async () => 1)).toEqual([]);
    const rs = await chayGioiHan([1, 2, 3], Infinity, async (x) => x * 2);
    expect(rs.map((r) => (r as PromiseFulfilledResult<number>).value)).toEqual([2, 4, 6]);
  });
});
