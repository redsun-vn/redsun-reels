/**
 * ./reel ai <tên-video> [--canh=<id>,…] [--video] [--lai]
 * Tạo cảnh người thật do AI (REQUIREMENTS §7.4, OpenRouter) theo briefs/<tên>/ai/canh-ai.json, đúng thứ tự:
 *   1. ảnh tham chiếu mỗi vai (ai/vai-<vai>.png) → người duyệt ghi `duyet: true`;
 *   2. khung đầu mỗi cảnh (ai/<id>-dau.png) từ ảnh vai → Claude xem, ghi `duyetKhung: true`;
 *   3. có --video: clip (ai/<id>.mp4) cho cảnh `video: true` từ khung đầu; cảnh `tuChu: true` tạo thẳng từ chữ
 *      (bỏ bước 1–2, model theo `mohinh` của kế hoạch: seedance | veo).
 * File đã có thì bỏ qua (--lai: làm lại các cảnh trong --canh). Mỗi lượt ước tiền trước, vượt trần config/cost.ts thì dừng.
 * Việc clip đã gửi mà chưa xác nhận được: giữ mã việc (dangCho), lần sau hỏi tiếp, không gửi lại.
 * Sổ nguồn gốc: ai/nhat-ky.json (file, model, prompt, ảnh tham chiếu, seed, mã việc, thời lượng, chi phí, thời điểm).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AI_VIDEO } from '../config/ai-video.ts';
import { COST, toVnd } from '../config/cost.ts';
import { briefDir, readBriefFile } from './lib/brief.ts';
import { runCommand } from './lib/cli.ts';
import { probeClip } from './lib/clip-check.ts';
import { methodIssues } from './lib/kieu-hinh-rules.ts';
import {
  type AiLog,
  type AiPending,
  AiSpecSchema,
  budgetLeftUsd,
  clipFile,
  emptyLog,
  framePrompt,
  frameFile,
  motionPrompt,
  roleFile,
  rolePrompt,
  seedOf,
  specIssues,
  textVideoPrompt,
} from './lib/ai-scene-spec.ts';
import {
  dataUrl,
  downloadVideo,
  estimateVideoUsd,
  generateImage,
  openrouterKey,
  RejectedError,
  submitVideo,
  UnconfirmedError,
  videoModels,
  videoRequestIssues,
  waitVideo,
} from './lib/openrouter-ai.ts';

const OR = AI_VIDEO.openrouter;
const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const only = args.find((a) => a.startsWith('--canh='))?.slice(7).split(',').filter(Boolean);
const withVideo = args.includes('--video');
const redo = args.includes('--lai');
const vnd = (usd: number) => `${toVnd(usd).toLocaleString('vi-VN')}đ`;

class CapError extends Error {}

await runCommand(async () => {
  if (!slug) throw new Error('Cách dùng: ./reel ai <tên-video> [--canh=<id>,…] [--video] [--lai]');
  if (redo && !only) throw new Error('--lai cần --canh=<id> (làm lại đúng cảnh nào), để không tốn tiền làm lại cả video.');
  const dir = briefDir(slug);
  const fm = readBriefFile(dir).frontmatter as Record<string, unknown>;
  if (fm.kieuHinh !== 'nguoi-that-ai') throw new Error(`Video "${slug}" không phải kiểu hình người thật do AI tạo (kieuHinh: ${String(fm.kieuHinh)}). Hỏi MKT theo skill chon-kieu-hinh.`);
  if (!AI_VIDEO.enabled) throw new Error('Quy trình người thật do AI tạo chưa bật (config/ai-video.ts, chỉ Nam bật).');
  if ((AI_VIDEO.forbiddenVideoTypes as readonly string[]).includes(String(fm.videoType))) throw new Error(`Loại video "${String(fm.videoType)}" không được dùng người thật do AI tạo.`);

  const cach = fm.cachTaoAi;
  if (cach !== 'anh-vai' && cach !== 'tu-chu') throw new Error('brief.md chưa chọn cách tạo người AI (cachTaoAi: anh-vai | tu-chu). Hỏi MKT theo skill chon-kieu-hinh.');
  const aiDir = join(dir, AI_VIDEO.dir);
  const specPath = join(aiDir, AI_VIDEO.specFile);
  if (!existsSync(specPath)) throw new Error(`Chưa có ${AI_VIDEO.dir}/${AI_VIDEO.specFile} (dàn vai + cảnh theo bảng khung chính).`);
  const spec = AiSpecSchema.parse(JSON.parse(readFileSync(specPath, 'utf8')));
  const bad = specIssues(spec);
  if (bad.length) throw new Error(bad.join('\n'));
  const mismatch = methodIssues(dir, cach);
  if (mismatch.length) throw new Error(mismatch.join('\n'));
  if (only) for (const id of only) if (!spec.canh.some((c) => c.id === id) && !spec.dan[id]) throw new Error(`Không có cảnh hay vai "${id}" trong ${AI_VIDEO.specFile}.`);

  mkdirSync(aiDir, { recursive: true });
  const logPath = join(aiDir, AI_VIDEO.logFile);
  const log: AiLog = existsSync(logPath) ? { ...emptyLog(), ...JSON.parse(readFileSync(logPath, 'utf8')) } : emptyLog();
  const save = () => writeFileSync(logPath, JSON.stringify(log, null, 2) + '\n');
  const key = openrouterKey();
  const capVnd = COST.aiCapVndOverride[slug] ?? COST.aiCapVndPerVideo;
  const capUsd = capVnd / COST.vndPerUsd;
  const ensure = (usd: number, what: string) => {
    if (usd > budgetLeftUsd(log, capVnd, COST.vndPerUsd))
      throw new CapError(`${what} ước ${vnd(usd)}, vượt phần trần còn lại ${vnd(Math.max(0, capUsd - log.chiPhi.usd))} (trần ${capVnd.toLocaleString('vi-VN')}đ/video, config/cost.ts). Nhắn Nam nếu cần nâng trần.`);
  };
  const record = (item: AiLog['items'][number]) => {
    log.items = [...log.items.filter((x) => x.file !== item.file), item];
    log.chiPhi = { usd: log.chiPhi.usd + item.chiPhiUsd, luot: log.chiPhi.luot + 1 };
    save();
  };
  const want = (id: string) => !only || only.includes(id);
  const has = (file: string) => existsSync(join(aiDir, file)) && !(redo && only);

  const finishClip = async (p: AiPending) => {
    if (!p.urls) {
      console.log(`… hỏi kết quả clip ${p.canh} (mã việc ${p.maViec})`);
      let done;
      try {
        done = await waitVideo({ id: p.maViec, pollingUrl: p.pollingUrl }, key);
      } catch (e) {
        // Việc hỏng hẳn (failed/bị lọc): bỏ khỏi danh sách chờ để lần sau không hỏi lại mãi
        if (e instanceof RejectedError) {
          log.dangCho = log.dangCho.filter((x) => x.maViec !== p.maViec);
          save();
        }
        throw e;
      }
      p.urls = done.urls;
      p.chiPhiUsd = done.costUsd ?? p.uocUsd;
      save();
    }
    const mp4 = await downloadVideo(p.urls[0], key);
    const name = clipFile(p.canh);
    writeFileSync(join(aiDir, name), mp4);
    log.dangCho = log.dangCho.filter((x) => x.maViec !== p.maViec);
    const info = probeClip(join(aiDir, name));
    record({
      file: name, loai: 'clip', canh: p.canh, vai: spec.canh.find((c) => c.id === p.canh)?.vai, nhaCungCap: 'openrouter', model: p.model, prompt: p.prompt,
      anhThamChieu: p.anhThamChieu, seed: p.seed, maViec: p.maViec, thoiLuong: Number((info?.durationSec ?? p.giay).toFixed(2)), chiPhiUsd: p.chiPhiUsd ?? p.uocUsd, taoLuc: new Date().toISOString(),
    });
    console.log(`✓ clip ${name}: ${info?.width}×${info?.height}, ${info?.durationSec.toFixed(1)}s, ${vnd(p.chiPhiUsd ?? p.uocUsd)}`);
  };

  let stopped = '';
  try {
    // 0. Việc clip còn treo từ lần trước: hỏi tiếp / tải tiếp, không gửi lại
    for (const p of [...log.dangCho]) await finishClip(p);

    // 1. Ảnh tham chiếu mỗi vai
    const roles = [...new Set([...spec.canh.filter((c) => want(c.id) && !c.tuChu).flatMap((c) => c.vai), ...Object.keys(spec.dan).filter((v) => only?.includes(v))])];
    for (const vai of roles) {
      const name = roleFile(vai);
      if (existsSync(join(aiDir, name)) && !(redo && only?.includes(vai))) continue;
      ensure(OR.imageEstimateUsd, `Ảnh vai ${vai}`);
      const prompt = rolePrompt(spec, vai), seed = seedOf(`vai-${vai}`);
      const img = await generateImage(prompt, [], seed, key);
      writeFileSync(join(aiDir, name), img.png);
      record({ file: name, loai: 'anh-vai', vai: [vai], nhaCungCap: 'openrouter', model: OR.imageModel, prompt, anhThamChieu: [], seed, chiPhiUsd: img.costUsd, taoLuc: new Date().toISOString() });
      console.log(`✓ ảnh vai ${name} (${vnd(img.costUsd)}) — cần người duyệt: ghi "duyet": true cho vai "${vai}" trong ${AI_VIDEO.specFile}.`);
    }
    const waitRoles = roles.filter((v) => !spec.dan[v].duyet);
    if (waitRoles.length) {
      stopped = `Chờ duyệt ảnh vai: ${waitRoles.map((v) => `${AI_VIDEO.dir}/${roleFile(v)}`).join(', ')}. Duyệt xong thì chạy lại lệnh.`;
      return;
    }

    // 2. Khung đầu mỗi cảnh
    for (const c of spec.canh) {
      if (c.tuChu || !want(c.id) || has(frameFile(c.id))) continue;
      ensure(OR.imageEstimateUsd, `Khung đầu ${c.id}`);
      const refs = c.vai.map(roleFile);
      const prompt = framePrompt(spec, c), seed = seedOf(`khung-${c.id}`);
      const img = await generateImage(prompt, refs.map((f) => dataUrl(join(aiDir, f))), seed, key);
      writeFileSync(join(aiDir, frameFile(c.id)), img.png);
      record({ file: frameFile(c.id), loai: 'khung-dau', canh: c.id, vai: c.vai, nhaCungCap: 'openrouter', model: OR.imageModel, prompt, anhThamChieu: refs, seed, chiPhiUsd: img.costUsd, taoLuc: new Date().toISOString() });
      console.log(`✓ khung đầu ${frameFile(c.id)} (khung ${c.khung}, ${vnd(img.costUsd)}) — Claude xem rồi ghi "duyetKhung": true.`);
    }

    // 3. Clip từ khung đầu
    if (!withVideo) return;
    const all = await videoModels();
    const modelOf = (id: string) => {
      const m = all.find((x) => x.id === id);
      if (!m) throw new Error(`OpenRouter không còn model ${id}. Cần dev chọn model khác (config/ai-video.ts).`);
      return m;
    };
    for (const c of spec.canh) {
      if (!c.video || !want(c.id) || has(clipFile(c.id)) || log.dangCho.some((p) => p.canh === c.id)) continue;
      const tv = OR.textVideoModels[spec.mohinh];
      const model = modelOf(c.tuChu ? tv.id : OR.videoModel), size = c.tuChu ? tv.size : OR.videoSize;
      if (!c.tuChu && !c.duyetKhung) {
        console.log(`! ${c.id}: khung đầu chưa duyệt (duyetKhung), bỏ qua clip.`);
        continue;
      }
      const issues = videoRequestIssues(model, c.giay, size, !c.tuChu);
      if (issues.length) throw new Error(issues.join('\n'));
      const uocUsd = estimateVideoUsd(model, c.giay, size);
      ensure(uocUsd, `Clip ${c.id} (${c.giay}s)`);
      const prompt = c.tuChu ? textVideoPrompt(spec, c) : motionPrompt(spec, c), seed = seedOf(`clip-${c.id}`);
      const job = await submitVideo(model.id, prompt, c.tuChu ? undefined : dataUrl(join(aiDir, frameFile(c.id))), c.giay, seed, key, size, c.tuChu ? tv.provider : undefined);
      const p: AiPending = { canh: c.id, maViec: job.id, pollingUrl: job.pollingUrl, model: model.id, prompt, anhThamChieu: c.tuChu ? [] : [frameFile(c.id)], seed, giay: c.giay, uocUsd, guiLuc: new Date().toISOString() };
      log.dangCho.push(p);
      save();
      console.log(`→ đã gửi clip ${c.id} (${c.giay}s, ước ${vnd(uocUsd)}), mã việc ${job.id}`);
      await finishClip(p);
    }
  } catch (e) {
    save();
    if (e instanceof CapError || e instanceof UnconfirmedError || e instanceof RejectedError) stopped = e.message;
    else throw e;
  } finally {
    save();
    console.log(`\nChi cảnh AI của video: ${vnd(log.chiPhi.usd)} / trần ${capVnd.toLocaleString('vi-VN')}đ (${log.chiPhi.luot} lượt).${log.dangCho.length ? ` Còn ${log.dangCho.length} việc clip đang chờ: chạy lại lệnh để hỏi tiếp.` : ''}`);
    if (stopped) console.log(`! Dừng: ${stopped}`);
  }
});
