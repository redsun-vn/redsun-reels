/**
 * Gọi OpenRouter cho cảnh người thật do AI tạo (REQUIREMENTS §7.4, Nam 2026-10-11): tạo ảnh (POST /images, trả ngay) và
 * tạo video (POST /videos → hỏi polling_url → tải /content). Key lấy từ .env (OPENROUTER_API_KEY), không bao giờ in ra.
 * An toàn tiền (§7.4):
 * - gửi việc mà không nhận được trả lời (mất mạng, hết giờ) → UnconfirmedError: dừng cả lượt, không gửi lại;
 * - hỏi kết quả: chỉ thử lại khi 429/5xx/mạng; chờ quá lâu → UnconfirmedError (giữ mã việc, lần sau hỏi tiếp);
 * - tải file lỗi: chỉ tải lại, không tạo lại.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AI_VIDEO } from '../../config/ai-video.ts';
import { REPO_ROOT } from './hyperframes-env.ts';

const OR = AI_VIDEO.openrouter;

/** Việc đã gửi (có thể đã bị tính tiền) mà chưa xác nhận được kết quả: dừng, không gửi lại. */
export class UnconfirmedError extends Error {}
/** Nhà cung cấp từ chối (nội dung, tham số, hết tiền): không thử lại tự động. */
export class RejectedError extends Error {}

export function openrouterKey(): string {
  const env = join(REPO_ROOT, '.env');
  const key = process.env.OPENROUTER_API_KEY || (existsSync(env) ? (/^OPENROUTER_API_KEY=(.*)$/m.exec(readFileSync(env, 'utf8'))?.[1] ?? '').trim() : '');
  if (!key) throw new Error('Chưa có OPENROUTER_API_KEY trong .env (Nam cấp). Cảnh người thật do AI tạo cần key này.');
  return key;
}

/** Che key (và mọi chuỗi giống key OpenRouter) trong thông báo lỗi. */
export function hideKey(text: string, key = ''): string {
  return (key ? text.split(key).join('[đã che]') : text).replace(/sk-or-[A-Za-z0-9-]{8,}/g, '[đã che]').slice(0, 400);
}

export interface VideoModel {
  id: string;
  supported_durations?: number[] | null;
  supported_sizes?: string[] | null;
  supported_aspect_ratios?: string[] | null;
  supported_frame_images?: string[] | null;
  pricing_skus?: Record<string, string> | null;
}

let models: VideoModel[] | undefined;
/** Danh sách model video và giới hạn (công khai, không tốn tiền). */
export async function videoModels(): Promise<VideoModel[]> {
  if (models) return models;
  const r = await fetch(`${OR.base}/videos/models`, { signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`Không đọc được danh sách model video OpenRouter (lỗi ${r.status}).`);
  models = ((await r.json()) as { data: VideoModel[] }).data;
  return models;
}

/** Yêu cầu chắc chắn lỗi thì báo trước khi gửi (không tốn tiền). */
export function videoRequestIssues(m: VideoModel, sec: number, size: string, firstFrame: boolean): string[] {
  const out: string[] = [];
  if (m.supported_durations?.length && !m.supported_durations.includes(sec)) out.push(`${m.id} không làm được clip ${sec} giây (được: ${m.supported_durations.join(', ')}).`);
  if (m.supported_sizes?.length && !m.supported_sizes.includes(size)) out.push(`${m.id} không có cỡ ${size}.`);
  if (firstFrame && !m.supported_frame_images?.includes('first_frame')) out.push(`${m.id} không nhận ảnh khung đầu.`);
  return out;
}

/**
 * Ước tiền (USD) một clip không tiếng theo bảng giá của model. Seedance tính theo token video
 * (rộng × cao × 24 khung × giây ÷ 1024); model khác tính theo giây. Không tìm được giá → báo lỗi (không đoán).
 */
export function estimateVideoUsd(m: VideoModel, sec: number, size: string): number {
  const p = m.pricing_skus ?? {};
  const [w, h] = size.split('x').map(Number);
  const res = `${Math.min(w, h)}p`;
  const num = (k: string) => (p[k] !== undefined ? Number(p[k]) : undefined);
  const perToken = num(`video_tokens_${res}`) ?? num('video_tokens_without_audio') ?? num('video_tokens');
  if (perToken !== undefined) return ((w * h * 24 * sec) / 1024) * perToken;
  const perSec =
    num(`duration_seconds_without_audio_${res}`) ?? num('duration_seconds_without_audio') ?? num(`duration_seconds_${res}`) ?? num('duration_seconds') ??
    (num(`cents_per_second_output_${res}`) ?? num('cents_per_second_output') ?? NaN) / 100;
  if (!Number.isFinite(perSec)) throw new Error(`Chưa đọc được giá của ${m.id} (pricing_skus: ${Object.keys(p).join(', ') || 'trống'}). Cần dev xem lại trước khi dùng.`);
  return perSec * sec;
}

const imagePart = (dataUrl: string) => ({ type: 'image_url', image_url: { url: dataUrl } });
export const dataUrl = (file: string, mime = 'image/png') => `data:${mime};base64,${readFileSync(file).toString('base64')}`;

async function post(path: string, body: unknown, key: string, timeoutMs: number): Promise<Response> {
  try {
    return await fetch(`${OR.base}${path}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    throw new UnconfirmedError(`Đã gửi yêu cầu tới OpenRouter nhưng không nhận được trả lời (${hideKey(String((e as { cause?: { code?: string } }).cause?.code ?? (e as Error).message), key)}). Có thể đã bị tính tiền: dừng, không gửi lại. Xem lịch sử ở openrouter.ai/activity.`);
  }
}

async function errorText(r: Response, key: string): Promise<string> {
  const b = (await r.json().catch(() => ({}))) as { error?: { message?: string } | string; message?: string };
  const msg = typeof b.error === 'string' ? b.error : (b.error?.message ?? b.message ?? '');
  return hideKey(`lỗi ${r.status}${msg ? `: ${msg}` : ''}`, key);
}

export interface ImageResult {
  png: Buffer;
  mime: string;
  costUsd: number;
}

/** Tạo một ảnh (ảnh tham chiếu vai hoặc khung đầu cảnh). `refs` = data URL ảnh tham chiếu để giữ khuôn mặt. */
export async function generateImage(prompt: string, refs: string[], seed: number, key = openrouterKey()): Promise<ImageResult> {
  const body = {
    model: OR.imageModel,
    prompt,
    aspect_ratio: OR.imageAspect,
    resolution: OR.imageResolution,
    seed,
    n: 1,
    ...(refs.length ? { input_references: refs.map(imagePart) } : {}),
  };
  const r = await post('/images', body, key, 300_000);
  if (!r.ok) throw new RejectedError(`OpenRouter không tạo được ảnh (${await errorText(r, key)}).`);
  const d = (await r.json()) as { data?: Array<{ b64_json?: string; media_type?: string }>; usage?: { cost?: number } };
  const img = d.data?.[0];
  if (!img?.b64_json) throw new UnconfirmedError('OpenRouter trả lời nhưng không có ảnh. Có thể đã bị tính tiền: dừng, xem openrouter.ai/activity.');
  return { png: Buffer.from(img.b64_json, 'base64'), mime: img.media_type ?? 'image/png', costUsd: Number(d.usage?.cost ?? OR.imageEstimateUsd) };
}

export interface VideoJob {
  id: string;
  pollingUrl: string;
}

/** Gửi việc tạo clip không tiếng (từ ảnh khung đầu, hoặc chỉ từ chữ khi không có ảnh). Trả mã việc ngay (chưa có clip). */
export async function submitVideo(model: string, prompt: string, firstFrame: string | undefined, sec: number, seed: number, key = openrouterKey()): Promise<VideoJob> {
  const body = {
    model,
    prompt,
    duration: sec,
    size: OR.videoSize,
    generate_audio: false,
    seed,
    ...(firstFrame ? { frame_images: [{ ...imagePart(firstFrame), frame_type: 'first_frame' }] } : {}),
  };
  const r = await post('/videos', body, key, 120_000);
  if (!r.ok) throw new RejectedError(`OpenRouter không nhận việc tạo clip (${await errorText(r, key)}).`);
  const d = (await r.json().catch(() => ({}))) as { id?: string; polling_url?: string };
  if (!d.id) throw new UnconfirmedError('OpenRouter nhận yêu cầu nhưng không trả mã việc. Có thể đã bị tính tiền: dừng, xem openrouter.ai/activity.');
  return { id: d.id, pollingUrl: d.polling_url ?? `${OR.base}/videos/${d.id}` };
}

export interface VideoDone {
  urls: string[];
  costUsd?: number;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Hỏi kết quả đến khi xong. Thử lại khi 429/5xx/mạng; hỏng → RejectedError; chờ quá lâu → UnconfirmedError. */
export async function waitVideo(job: VideoJob, key = openrouterKey(), onTick?: (status: string) => void): Promise<VideoDone> {
  const until = Date.now() + OR.maxWaitMin * 60_000;
  let backoff = 0;
  while (Date.now() < until) {
    let r: Response | undefined;
    try {
      r = await fetch(job.pollingUrl, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(60_000) });
    } catch {
      r = undefined;
    }
    if (!r || r.status === 429 || r.status >= 500) {
      backoff = Math.min(backoff + 1, 6);
      await sleep(Math.max(OR.pollSec, 2 ** backoff) * 1000);
      continue;
    }
    backoff = 0;
    if (!r.ok) throw new UnconfirmedError(`Không hỏi được kết quả việc ${job.id} (${await errorText(r, key)}). Mã việc đã lưu; chạy lại lệnh để hỏi tiếp.`);
    const d = (await r.json()) as { status?: string; unsigned_urls?: string[]; usage?: { cost?: number }; error?: unknown };
    onTick?.(d.status ?? '?');
    if (d.status === 'completed') return { urls: d.unsigned_urls?.length ? d.unsigned_urls : [`${OR.base}/videos/${job.id}/content?index=0`], costUsd: d.usage?.cost };
    if (d.status === 'failed' || d.status === 'cancelled' || d.status === 'expired') throw new RejectedError(`Việc tạo clip ${job.id} ${d.status}: ${hideKey(typeof d.error === 'string' ? d.error : JSON.stringify(d.error ?? ''), key)}`);
    await sleep(OR.pollSec * 1000);
  }
  throw new UnconfirmedError(`Việc ${job.id} chưa xong sau ${OR.maxWaitMin} phút. Mã việc đã lưu; chạy lại lệnh để hỏi tiếp (không tạo lại).`);
}

/** Tải clip đã xong (cần key). Lỗi thì tải lại tối đa 4 lần; vẫn lỗi → UnconfirmedError (việc đã xong, lần sau tải tiếp). */
export async function downloadVideo(url: string, key = openrouterKey()): Promise<Buffer> {
  let last = '';
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(300_000) });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      last = await errorText(r, key);
    } catch (e) {
      last = hideKey((e as Error).message, key);
    }
    await sleep(3000 * (i + 1));
  }
  throw new UnconfirmedError(`Clip đã tạo xong nhưng tải về lỗi (${last}). Chạy lại lệnh để tải tiếp (không tạo lại).`);
}
