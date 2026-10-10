/**
 * ./reel giong <tên-video> [--cau=<id>,…] [--lai] [--cho=<giây>]
 * Tạo giọng đọc VieNeu cho briefs/<tên>/dung-rieng/loi-doc.json (skill giong-doc): mỗi câu một bản bằng giọng của vai,
 * kiểm trên máy (không câm, không quá ngắn/dài, vừa chỗ trống đến câu sau hoặc khoảng lặng), cắt lặng đầu cuối; bản hỏng
 * thì tạo lại (tối đa VOICE.maxTries). Người nghe duyệt bản cuối (Claude không nghe được âm thanh).
 * Kết quả: dung-rieng/giong/<id>.wav + giong/nhat-ky.json (lời gửi, giọng, kiểu đọc, độ dài, token).
 * Câu đã có và lời/giọng không đổi thì bỏ qua (--lai để làm lại). --cho: chỗ trống mỗi câu khi chưa xếp giờ (dựng theo giọng).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COST } from '../config/cost.ts';
import { VOICE } from '../config/voice.ts';
import { briefDir } from './lib/brief.ts';
import { runCommand } from './lib/cli.ts';
import { CUSTOM_DIR } from './lib/custom-video.ts';
import { CUE_FILE, parseCues, rootDuration, wavDuration } from './lib/sfx-cues.ts';
import { CostCapError, DailyQuotaError, spend, synthesizeVieneu, vieneuKey, vieneuText, vieneuVoices } from './lib/vieneu-voice.ts';
import { lineStyle, voiceScriptIssues, VoiceScriptSchema } from './lib/voice-script.ts';
import { measureTake, takeAudioIssues, toMono24k, trimSilence } from './lib/voice-wav.ts';

export interface VoiceLogItem {
  id: string;
  vai: string;
  giong: string;
  model: string;
  file: string;
  promptHash: string;
  /** Lời đã gửi VieNeu (thẻ đã đổi). */
  prompt: string;
  phongCach: 'natural' | 'storytelling';
  soBan: number;
  /** Bản đạt kiểm trên máy (người nghe vẫn duyệt bản cuối). */
  dat: boolean;
  chuaDat: string[];
  thoiLuong: number;
  /** Token VieNeu cho câu này (cộng mọi lần chạy). */
  token: number;
  taoLuc: string;
}

export interface VoiceLog {
  items: VoiceLogItem[];
  /** Token VieNeu của cả video (cộng mọi lần chạy), so với trần config/cost.ts. */
  chiPhi?: { vieneuToken: number; luot: number };
}

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const only = args.find((a) => a.startsWith('--cau='))?.slice(6).split(',').filter(Boolean);
const redo = args.includes('--lai');
const choArg = Number(args.find((a) => a.startsWith('--cho='))?.slice(6));

await runCommand(async () => {
  if (!slug) throw new Error('Cách dùng: ./reel giong <tên-video> [--cau=<id>,…] [--lai] [--cho=<giây>]');
  const dir = join(briefDir(slug), CUSTOM_DIR);
  const file = join(dir, VOICE.file);
  if (!existsSync(file)) throw new Error(`Chưa có ${CUSTOM_DIR}/${VOICE.file} (skill giong-doc).`);
  const vs = VoiceScriptSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
  const html = existsSync(join(dir, 'index.html')) ? readFileSync(join(dir, 'index.html'), 'utf8') : '';
  const total = rootDuration(html) || Number.POSITIVE_INFINITY;
  const problems = voiceScriptIssues(vs, total);
  if (problems.length) throw new Error(problems.join('\n'));
  const key = vieneuKey();
  const cat = await vieneuVoices();
  const bad = Object.entries(vs.dan).filter(([, d]) => !cat.has(d.giong)).map(([v, d]) => `${v}: "${d.giong}"`);
  if (bad.length) throw new Error(`Giọng không có trong danh mục VieNeu v4: ${bad.join(', ')}.`);
  const silence = existsSync(join(dir, CUE_FILE)) ? parseCues(readFileSync(join(dir, CUE_FILE), 'utf8')).silence : undefined;

  const out = join(dir, VOICE.dir);
  mkdirSync(out, { recursive: true });
  const logPath = join(out, VOICE.logFile);
  const log: VoiceLog = existsSync(logPath) ? JSON.parse(readFileSync(logPath, 'utf8')) : { items: [] };
  // Câu đã bỏ khỏi loi-doc.json thì bỏ khỏi sổ
  log.items = log.items.filter((x) => vs.cau.some((c) => c.id === x.id));
  const tokensBefore = log.chiPhi?.vieneuToken ?? 0, callsBefore = log.chiPhi?.luot ?? 0;
  spend.limit = COST.vieneuTokenCapPerVideo - tokensBefore;
  if (spend.limit <= 0) throw new Error(`Video đã dùng ${tokensBefore.toLocaleString('vi-VN')} token VieNeu, chạm trần ${COST.vieneuTokenCapPerVideo.toLocaleString('vi-VN')} (config/cost.ts). Nhắn Nam nếu cần nâng trần.`);
  const save = () => {
    log.chiPhi = { vieneuToken: tokensBefore + spend.tokens, luot: callsBefore + spend.calls };
    writeFileSync(logPath, JSON.stringify(log, null, 2) + '\n');
  };

  let stopped = '';
  try {
    for (const c of vs.cau) {
      if (only && !only.includes(c.id)) continue;
      const giong = vs.dan[c.vai].giong, style = lineStyle(c), prompt = vieneuText(c.loi);
      const promptHash = createHash('sha256').update(`${VOICE.vieneu.model}|${giong}|${style}|${prompt}`).digest('hex').slice(0, 16);
      const prev = log.items.find((x) => x.id === c.id);
      if (!redo && prev?.dat && prev.promptHash === promptHash && existsSync(join(out, prev.file))) {
        console.log(`✓ ${c.id} (${c.vai}) đã có, bỏ qua.`);
        continue;
      }
      // Chỗ trống: đến câu kế tiếp, khoảng lặng trước vỡ lẽ (dành cho im) hoặc cuối video
      const silenceFrom = silence && silence.from > c.at ? silence.from : Number.POSITIVE_INFINITY;
      const slot = choArg > 0 ? choArg : Math.min(total, silenceFrom, ...vs.cau.filter((x) => x.at > c.at).map((x) => x.at)) - c.at;
      const lineStart = spend.tokens;
      let wav: Buffer | undefined, why: string[] = [], tries = 0;
      for (tries = 1; tries <= VOICE.maxTries; tries++) {
        const take = trimSilence(toMono24k(await synthesizeVieneu(prompt, giong, style, key)));
        why = takeAudioIssues(measureTake(take), c.loi, slot);
        wav = take;
        if (!why.length) break;
        console.log(`  ${c.id} lần ${tries}: ${why.join(', ')}`);
      }
      // Làm lại (--lai) mà bản mới hỏng: giữ bản cũ đã đạt
      if (why.length && prev?.dat && existsSync(join(out, prev.file))) {
        console.log(`! ${c.id}: bản mới chưa đạt (${why.join(', ')}), giữ bản cũ.`);
        continue;
      }
      const name = `${c.id}.wav`;
      writeFileSync(join(out, name), wav!);
      const item: VoiceLogItem = {
        id: c.id, vai: c.vai, giong, model: VOICE.vieneu.model, file: name, promptHash, prompt, phongCach: style, soBan: Math.min(tries, VOICE.maxTries),
        dat: !why.length, chuaDat: why, thoiLuong: Number(wavDuration(join(out, name)).toFixed(2)), token: (prev?.token ?? 0) + spend.tokens - lineStart, taoLuc: new Date().toISOString(),
      };
      log.items = [...log.items.filter((x) => x.id !== c.id), item];
      save();
      console.log(`${item.dat ? '✓' : '!'} ${c.id} (${c.vai}, ${giong}, ${style}): ${item.thoiLuong}s${item.dat ? '' : ' · CHƯA ĐẠT: ' + why.join(', ')}`);
    }
  } catch (e) {
    if (!(e instanceof DailyQuotaError) && !(e instanceof CostCapError)) {
      save();
      throw e;
    }
    stopped = e.message;
  }
  save();
  console.log(`\nLần chạy này: ${spend.tokens.toLocaleString('vi-VN')} token VieNeu (${spend.calls} lượt). Cả video: ${log.chiPhi!.vieneuToken.toLocaleString('vi-VN')} / trần ${COST.vieneuTokenCapPerVideo.toLocaleString('vi-VN')} token.`);
  if (stopped) {
    console.log(`! Dừng: ${stopped}\nCác câu đã có vẫn giữ; lần sau chạy lại cùng lệnh, máy làm tiếp câu còn thiếu.`);
    return;
  }
  const notPass = log.items.filter((x) => !x.dat);
  console.log(notPass.length ? `${notPass.length} câu chưa đạt: rút gọn lời hoặc dời giờ rồi chạy lại "./reel giong ${slug} --cau=${notPass.map((x) => x.id).join(',')} --lai".` : 'Mọi câu đã có giọng. Nghe duyệt trước khi xuất.');
});
