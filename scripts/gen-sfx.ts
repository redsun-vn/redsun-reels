/**
 * Sinh bộ tiếng động (SFX) cho video dựng riêng bằng ffmpeg: âm tổng hợp từ sóng sin + nhiễu, tự tạo nên không
 * vướng bản quyền và được commit vào repo (brand/sfx/*.wav, mono 48 kHz). Composition đặt
 * <audio src="sfx/<tên>.wav" data-start=… data-volume=…>. Chạy lại khi sửa công thức: pnpm gen:sfx
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { REPO_ROOT, runFfmpeg } from './lib/hyperframes-env.ts';

const PI2 = '2*PI';
/** Sin quét tần số kiểu mũ: từ f0 về f1 với hằng thời gian tau (giây). */
const sweep = (f0: number, f1: number, tau: number) => `sin(${PI2}*(${f1}*t+${f0 - f1}*${tau}*(1-exp(-t/${tau}))))`;
const bell = (f: number, decay: number, at = 0) => `if(gte(t,${at}),sin(${PI2}*${f}*(t-${at}))*exp(-(t-${at})/${decay}),0)`;
const noise = '(random(0)*2-1)';

interface Sfx { expr: string; dur: number; filters?: string; note: string }

export const SFX: Record<string, Sfx> = {
  pop: { dur: 0.16, note: 'bụp nhẹ (bong bóng thoại, chữ bật ra)', expr: `${sweep(1100, 320, 0.025)}*exp(-t/0.05)` },
  tap: { dur: 0.08, note: 'chạm/bấm màn hình, nút', expr: `${noise}*exp(-t/0.004)*0.5+sin(${PI2}*2400*t)*exp(-t/0.012)*0.5` },
  tick: { dur: 0.04, note: 'tích nhỏ (ngón tay dò từng dòng, đếm)', expr: `sin(${PI2}*3200*t)*exp(-t/0.004)` },
  whoosh: { dur: 0.5, note: 'vút (chuyển cảnh, vật bay vào)', expr: `${noise}*pow(sin(PI*t/0.5),3)`, filters: 'highpass=f=350,lowpass=f=2600,volume=1.6' },
  'whoosh-nhanh': { dur: 0.28, note: 'vút ngắn (chữ trượt, quét)', expr: `${noise}*pow(sin(PI*t/0.28),2)`, filters: 'highpass=f=700,lowpass=f=4200,volume=1.4' },
  ding: { dur: 0.9, note: 'ting thông báo (tiền vào, đơn mới)', expr: `0.6*${bell(1318.5, 0.22)}+0.25*${bell(2637, 0.1)}+0.6*${bell(1760, 0.3, 0.11)}+0.2*${bell(3520, 0.12, 0.11)}` },
  coin: { dur: 0.7, note: 'leng keng tiền xu', expr: `0.5*${bell(2093, 0.12)}+0.4*${bell(3136, 0.09)}+0.5*${bell(2637, 0.15, 0.08)}+0.3*${bell(3951, 0.1, 0.08)}` },
  'dap-dau': { dur: 0.45, note: 'dập con dấu / va mạnh', expr: `0.9*${sweep(140, 48, 0.04)}*exp(-t/0.13)+0.6*${noise}*exp(-t/0.012)`, filters: 'lowpass=f=3000' },
  thump: { dur: 0.3, note: 'thịch nhẹ (đặt vật xuống bàn)', expr: `${sweep(180, 70, 0.03)}*exp(-t/0.07)+0.25*${noise}*exp(-t/0.006)`, filters: 'lowpass=f=1800' },
  glitch: { dur: 0.42, note: 'nhiễu sọc (ảnh giả, lỗi)', expr: `(gt(sin(${PI2}*23*t),0)*sin(${PI2}*190*t)+0.7*lt(sin(${PI2}*31*t),-0.3)*${noise})*0.7`, filters: 'acrusher=bits=5:mode=log:aa=0,volume=0.8' },
  sai: { dur: 0.42, note: 'buzz sai/thiếu', expr: `0.5*(gt(sin(${PI2}*155*t),0)*2-1)*lt(t,0.17)+0.5*(gt(sin(${PI2}*118*t),0)*2-1)*gt(t,0.2)*lt(t,0.4)`, filters: 'lowpass=f=1500,volume=0.7' },
  sparkle: { dur: 0.9, note: 'lấp lánh (giải pháp, nhẹ nhõm)', expr: [0, 0.06, 0.13, 0.19, 0.27, 0.34].map((at, i) => `0.3*${bell([2637, 3136, 3520, 4186, 3951, 5274][i], 0.16, at)}`).join('+') },
  riser: { dur: 0.9, note: 'dâng lên trước khi lật tẩy', expr: `(0.25*${noise}+0.75*sin(${PI2}*(200*t+500*t*t)))*pow(t/0.9,2)`, filters: 'highpass=f=250,lowpass=f=2800,volume=0.9' },
  boom: { dur: 0.9, note: 'ầm trầm (khoảnh khắc lớn)', expr: `${sweep(90, 38, 0.08)}*exp(-t/0.35)+0.3*${noise}*exp(-t/0.02)`, filters: 'lowpass=f=900,volume=1.2' },
  'hoi-tho': { dur: 0.8, note: 'thở phào', expr: `${noise}*pow(sin(PI*t/0.8),2)*0.5`, filters: 'highpass=f=400,lowpass=f=1300,lowpass=f=1300,volume=1.8' },
};

if (process.argv[1]?.endsWith('gen-sfx.ts')) {
  const dir = join(REPO_ROOT, 'brand', 'sfx');
  mkdirSync(dir, { recursive: true });
  for (const [name, s] of Object.entries(SFX)) {
    const af = ['afade=t=out:st=' + (s.dur * 0.8).toFixed(3) + ':d=' + (s.dur * 0.2).toFixed(3), s.filters, 'alimiter=limit=0.7:level=0'].filter(Boolean).join(',');
    const r = runFfmpeg(['-v', 'error', '-y', '-f', 'lavfi', '-i', `aevalsrc='${s.expr}':s=48000:d=${s.dur}`, '-af', af, '-ac', '1', '-c:a', 'pcm_s16le', join(dir, `${name}.wav`)]);
    if (r.status !== 0) { console.error(`Không tạo được ${name}: ${r.stderr}`); process.exit(1); }
  }
  console.log(`Đã tạo ${Object.keys(SFX).length} tiếng động trong brand/sfx/`);
}
