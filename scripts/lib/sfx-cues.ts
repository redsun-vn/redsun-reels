/**
 * Tiếng động của video dựng riêng: khai trong briefs/<tên>/dung-rieng/tieng-dong.txt, mỗi dòng `giây tên âm-lượng  # ghi chú`
 * (tên = file trong brand/sfx/, không đuôi). Khi dựng, dòng đánh dấu <!-- TIENG-DONG --> trong index.html được thay bằng
 * các thẻ <audio>: mỗi tiếng một track (từ 20), data-duration = độ dài file wav, cắt bớt nếu vượt cuối video.
 * Dòng `lang <từ> <đến> [mức]` khai khoảng lặng ngay trước khoảnh khắc vỡ lẽ (giây <đến>): nhạc nền hạ xuống <mức>
 * (mặc định 0.15) trong khoảng đó rồi trở lại ngay ở <đến>, để tiếng nhấn lúc vỡ lẽ là tiếng to nhất video.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT } from './hyperframes-env.ts';

export const CUE_FILE = 'tieng-dong.txt';
export const CUE_MARKER = '<!-- TIENG-DONG -->';
export const SFX_TRACK_START = 20;
const SFX_DIR = join(REPO_ROOT, 'brand', 'sfx');

export const SILENCE_LEVEL = 0.15;

export interface Silence {
  line: number;
  from: number;
  to: number;
  level: number;
}

export interface SfxCue {
  line: number;
  at: number;
  name: string;
  volume: number;
}

export function parseCues(text: string): { cues: SfxCue[]; errors: string[]; silence?: Silence } {
  const cues: SfxCue[] = [];
  const errors: string[] = [];
  let silence: Silence | undefined;
  text.split('\n').forEach((raw, i) => {
    const line = raw.split('#')[0].trim();
    if (!line) return;
    const parts = line.split(/\s+/);
    if (parts[0] === 'lang') {
      const [from, to, level] = [Number(parts[1]), Number(parts[2]), parts[3] === undefined ? SILENCE_LEVEL : Number(parts[3])];
      if (parts.length < 3 || parts.length > 4 || ![from, to, level].every(Number.isFinite)) errors.push(`${CUE_FILE} dòng ${i + 1} "${raw.trim()}": khoảng lặng viết "lang <từ giây> <đến giây> [mức nhạc]", ví dụ "lang 13.5 14.09".`);
      else if (silence) errors.push(`${CUE_FILE} dòng ${i + 1}: chỉ khai một khoảng lặng (đã có ở dòng ${silence.line}).`);
      else silence = { line: i + 1, from, to, level };
      return;
    }
    const at = Number(parts[0]), volume = Number(parts[2]);
    if (parts.length !== 3 || !Number.isFinite(at) || !Number.isFinite(volume)) {
      errors.push(`${CUE_FILE} dòng ${i + 1} "${raw.trim()}": cần đúng dạng "giây tên âm-lượng", ví dụ "1.30 pop 0.5".`);
      return;
    }
    cues.push({ line: i + 1, at, name: parts[1], volume });
  });
  return { cues: cues.sort((a, b) => a.at - b.at), errors, silence };
}

/** Tên tiếng động có sẵn (brand/sfx/*.wav). */
export function sfxNames(dir = SFX_DIR): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.wav')).map((f) => f.slice(0, -4)).sort() : [];
}

/** Độ dài file WAV (giây) đọc từ header RIFF. */
export function wavDuration(file: string): number {
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`${file} không phải file WAV.`);
  let byteRate = 0;
  for (let o = 12; o + 8 <= b.length; ) {
    const id = b.toString('ascii', o, o + 4), size = b.readUInt32LE(o + 4);
    if (id === 'fmt ') byteRate = b.readUInt32LE(o + 16);
    if (id === 'data') {
      if (!byteRate) throw new Error(`${file}: thiếu khối fmt trước data.`);
      return size / byteRate;
    }
    o += 8 + size + (size % 2);
  }
  throw new Error(`${file}: không thấy khối data.`);
}

export function cueIssues(cues: SfxCue[], totalSec: number, names = sfxNames(), silence?: Silence): string[] {
  const out: string[] = [];
  if (silence) {
    const where = `${CUE_FILE} dòng ${silence.line}`;
    const len = silence.to - silence.from;
    if (silence.from < 0 || silence.to > totalSec) out.push(`${where}: khoảng lặng ${silence.from}–${silence.to}s nằm ngoài video.`);
    if (len < 0.4 || len > 4) out.push(`${where}: khoảng lặng dài ${len.toFixed(2)}s, nên 0.4–4 giây.`);
    if (silence.level < 0 || silence.level > 0.5) out.push(`${where}: mức nhạc khi lặng ${silence.level} phải trong 0–0.5.`);
    const loud = cues.filter((c) => c.at > silence.from + 0.05 && c.at < silence.to - 0.02 && c.volume > 0.25);
    if (loud.length) out.push(`${where}: trong khoảng lặng có tiếng động to (${loud.map((c) => `${c.at} ${c.name}`).join(', ')}): bỏ hoặc hạ âm lượng ≤ 0.25.`);
  }
  for (const c of cues) {
    const where = `${CUE_FILE} dòng ${c.line}`;
    if (!names.includes(c.name)) out.push(`${where}: không có tiếng "${c.name}". Có: ${names.join(', ')}.`);
    if (c.at < 0 || c.at >= totalSec) out.push(`${where}: giây ${c.at} nằm ngoài video (0–${totalSec}s).`);
    if (c.volume <= 0 || c.volume > 1) out.push(`${where}: âm lượng ${c.volume} phải trong khoảng 0–1 (thường 0.2–0.6).`);
  }
  return out;
}

/** Thẻ <audio> cho từng tiếng động. */
export function cueTags(cues: SfxCue[], totalSec: number, durationOf: (name: string) => number = (n) => wavDuration(join(SFX_DIR, `${n}.wav`))): string {
  const cache = new Map<string, number>();
  return cues
    .map((c, i) => {
      if (!cache.has(c.name)) cache.set(c.name, durationOf(c.name));
      const d = Math.min(cache.get(c.name)!, totalSec - c.at);
      const id = `sfx${String(i + 1).padStart(2, '0')}`;
      return `<audio id="${id}" src="sfx/${c.name}.wav" data-start="${c.at.toFixed(2)}" data-duration="${d.toFixed(2)}" data-track-index="${SFX_TRACK_START + i}" data-volume="${c.volume}"></audio>`;
    })
    .join('\n  ');
}

/** Thay dòng đánh dấu bằng thẻ tiếng động. */
export function injectCues(html: string, tags: string): string {
  if (!html.includes(CUE_MARKER)) throw new Error(`Có ${CUE_FILE} nhưng index.html thiếu dòng đánh dấu ${CUE_MARKER} (đặt trong gốc composition, sau thẻ nhạc).`);
  return html.replace(CUE_MARKER, tags);
}

/** Thời lượng khai ở gốc composition (data-composition-id="main"). */
export function rootDuration(html: string): number {
  const m = /data-composition-id="main"[^>]*data-duration="([\d.]+)"|data-duration="([\d.]+)"[^>]*data-composition-id="main"/.exec(html);
  return m ? Number(m[1] ?? m[2]) : NaN;
}

/** Đường âm lượng nhạc nền cho khoảng lặng (data-automation của HyperFrames, giây tính từ đầu clip nhạc = đầu video). */
export function silenceAutomation(s: Silence): string {
  const pts = [[0, 1], [Math.max(0, s.from - 0.15), 1], [s.from, s.level], [s.to - 0.02, s.level], [s.to, 1]];
  return JSON.stringify({ version: 1, lanes: [{ target: 'volume', points: pts.map(([t, v]) => ({ t: Number(t.toFixed(3)), v })) }] });
}

/** Gắn đường âm lượng vào thẻ nhạc nền <audio id="music">. */
export function injectSilence(html: string, s: Silence): string {
  const m = /<audio\b[^>]*\bid="music"[^>]*>/.exec(html);
  if (!m) throw new Error('Khai khoảng lặng thì composition cần <audio id="music" …>.');
  if (/data-automation=/.test(m[0])) throw new Error('Thẻ nhạc đã có data-automation: khai khoảng lặng ở một nơi (tieng-dong.txt).');
  return html.replace(m[0], m[0].replace(/<audio\b/, `<audio data-automation='${silenceAutomation(s)}'`));
}
