/**
 * Gọi VieNeu Cloud API cho giọng đọc (docs.vieneu.io; Nam 2026-10-10: "nguồn TTS tiếng Việt tốt nhất"): đọc một câu ra
 * WAV, danh mục giọng. Key lấy từ .env (VIENEU_API_KEY), không bao giờ in ra. Token cộng vào `spend` để giữ trần video.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COST } from '../../config/cost.ts';
import { VOICE } from '../../config/voice.ts';
import { REPO_ROOT } from './hyperframes-env.ts';

/** Chạm trần token của video (config/cost.ts): dừng trước lượt gọi kế tiếp. */
export class CostCapError extends Error {}
/** Hết hạn mức ngày/tuần của gói VieNeu: gọi lại vô ích đến khi gói mở lại. */
export class DailyQuotaError extends Error {}

/** Token VieNeu đã dùng trong lần chạy này; `limit` = phần trần còn lại của video (người gọi đặt trước khi chạy). */
export const spend = { tokens: 0, calls: 0, limit: Number.POSITIVE_INFINITY };

export function vieneuKey(): string {
  const env = join(REPO_ROOT, '.env');
  const key = process.env.VIENEU_API_KEY || (existsSync(env) ? (/^VIENEU_API_KEY=(.*)$/m.exec(readFileSync(env, 'utf8'))?.[1] ?? '').trim() : '');
  if (!key) throw new Error('Chưa có VIENEU_API_KEY trong .env (Nam cấp). Giọng đọc VieNeu cần key này.');
  return key;
}

/** Lời gửi VieNeu: thẻ của mình đổi sang 3 thẻ VieNeu hiểu, thẻ khác bỏ (không thì bị đọc thành chữ). */
export function vieneuText(loi: string): string {
  return loi
    .replace(/\[([^\]]*)\]/g, (_, t: string) => VOICE.vieneu.tags[t.trim().toLowerCase()] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Token VieNeu của một lượt (tối thiểu 50 ký tự). */
export const vieneuTokens = (text: string) => Math.ceil(Math.max(VOICE.vieneu.minChars, [...text].length) * VOICE.vieneu.tokenPerChar);

let catalogue: Set<string> | undefined;
/** Tên giọng có trong danh mục v4 (gọi công khai, không cần key). */
export async function vieneuVoices(): Promise<Set<string>> {
  if (catalogue) return catalogue;
  const r = await fetch(`${VOICE.vieneu.base}/voices?engine=${VOICE.vieneu.engine}`, { signal: AbortSignal.timeout(30_000) });
  const d = (await r.json()) as unknown;
  const list = (Array.isArray(d) ? d : ((d as { voices?: unknown[] }).voices ?? [])) as Array<{ id?: string }>;
  catalogue = new Set(list.map((v) => String(v.id)));
  return catalogue;
}

/** Đọc một bản bằng VieNeu (WAV 24 kHz mono). Lỗi tạm (429 thường, 5xx, mạng) gọi lại; hết hạn mức ngày/tuần thì dừng. */
export async function synthesizeVieneu(text: string, voice: string, style: 'natural' | 'storytelling', key = vieneuKey()): Promise<Buffer> {
  const hide = (s: string) => s.split(key).join('[đã che]').slice(0, 300);
  const tokens = vieneuTokens(text);
  let last = '';
  for (let attempt = 0; attempt < 5; attempt++) {
    if (spend.tokens + tokens > spend.limit) throw new CostCapError(`Chạm trần ${COST.vieneuTokenCapPerVideo.toLocaleString('vi-VN')} token VieNeu/video (config/cost.ts).`);
    let r: Response;
    try {
      r = await fetch(`${VOICE.vieneu.base}/audio/speech`, {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: VOICE.vieneu.model, engine: VOICE.vieneu.engine, input: text, voice, response_format: 'wav', sample_rate: VOICE.vieneu.sampleRate, emotion: style }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (e) {
      last = `mạng lỗi (${hide(String((e as { cause?: { code?: string } }).cause?.code ?? (e as Error).message))})`;
      await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));
      continue;
    }
    if (r.ok) {
      spend.tokens += tokens;
      spend.calls++;
      return Buffer.from(await r.arrayBuffer());
    }
    const body = (await r.json().catch(() => ({}))) as { error?: { message?: string; code?: string; type?: string }; message?: string; code?: string };
    const msg = hide(String(body.error?.message ?? body.message ?? ''));
    last = `lỗi ${r.status}: ${msg}`;
    if (r.status === 429 && /daily|weekly|ngày|tuần|GRANT_(DAILY|WEEKLY)/i.test(`${msg} ${body.error?.code ?? body.code ?? ''}`)) throw new DailyQuotaError(`Hết hạn mức ngày/tuần của gói VieNeu (${msg}). Chờ gói mở lại hoặc Nam nâng gói.`);
    if (r.status === 403) throw new Error(`VieNeu từ chối (${msg}): gói hết token, hết hạn hoặc không cho engine này. Nhắn Nam.`);
    if (![429, 500, 502, 503, 504].includes(r.status)) break;
    const wait = Number(r.headers.get('retry-after')) || 2 * 2 ** attempt;
    await new Promise((res) => setTimeout(res, wait * 1000));
  }
  throw new Error(`VieNeu ${last}`);
}
