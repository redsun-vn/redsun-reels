/**
 * Kiểm chữ nhấn [ ] và chỉ đạo chuyển động (scene.motion) theo nguyên tắc của skill dao-dien-chuyen-dong.
 * Lỗi: ngoặc vuông lệch. Cảnh báo: quá nhiều / quá dài cụm nhấn, nhấn trùng kiểu 2 cảnh liền, quá nhiều hoạt cảnh,
 * glitch-cut ngoài phong cách công nghệ.
 */
import type { Script } from '../../config/script.schema.ts';

export interface MotionIssue {
  level: 'error' | 'warning';
  message: string;
}

const GROUP_MAX_CHARS = 16; // khớp kit-emphasis.js
const GLITCH_STYLES = ['glitch-cyberpunk', 'tuong-lai', 'robot-cong-nghe'];

export function motionIssues(script: Script): MotionIssue[] {
  const out: MotionIssue[] = [];
  const err = (message: string) => out.push({ level: 'error', message });
  const warn = (message: string) => out.push({ level: 'warning', message });

  for (const s of script.scenes) {
    const opens = (s.onScreenText.match(/\[/g) ?? []).length;
    const closes = (s.onScreenText.match(/\]/g) ?? []).length;
    if (opens !== closes || /\[[^\]]*\[/.test(s.onScreenText)) {
      err(`Cảnh "${s.id}": dấu [ ] đánh dấu chữ nhấn bị lệch hoặc lồng nhau.`);
      continue;
    }
    const groups = [...s.onScreenText.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
    if (groups.length > 3) warn(`Cảnh "${s.id}" nhấn ${groups.length} cụm; nên 1–2 cụm (liệt kê tối đa 3) để mắt biết nhìn vào đâu.`);
    for (const g of groups) {
      if (g.length > GROUP_MAX_CHARS) warn(`Cảnh "${s.id}": cụm nhấn "${g}" dài ${g.length} ký tự (> ${GROUP_MAX_CHARS}), máy sẽ tách từng từ. Chia thành các cụm ngắn.`);
    }
    if (s.motion?.transition === 'glitch-cut' && !GLITCH_STYLES.includes(script.style)) {
      warn(`Cảnh "${s.id}": chuyển cảnh glitch-cut chỉ hợp phong cách ${GLITCH_STYLES.join(', ')}.`);
    }
  }
  for (let i = 1; i < script.scenes.length; i++) {
    const a = script.scenes[i - 1].motion?.emphasis;
    const b = script.scenes[i].motion?.emphasis;
    if (a && a === b) warn(`Cảnh "${script.scenes[i - 1].id}" và "${script.scenes[i].id}" cùng kiểu nhấn "${a}"; đổi nhịp cho đỡ đều.`);
  }
  const total = script.scenes.reduce((t, s) => t + s.durationSec, 0);
  const decors = script.scenes.filter((s) => s.motion?.decor && s.motion.decor !== 'none').length;
  if (total <= 20 && decors > 2) warn(`Video ≤ 20 giây có ${decors} cảnh có hoạt cảnh; nên tối đa 2 để cảnh có hoạt cảnh nổi lên.`);
  return out;
}

/** "Chữ ký" hình ảnh của một video: phong cách, mẫu, và bố cục / hiện chữ / nhấn / hoạt cảnh / chuyển cảnh từng cảnh. */
export function signatureOf(script: Script): { style: string; template: string; scenes: string[] } {
  return {
    style: script.style,
    template: script.template,
    scenes: script.scenes.map((s) => {
      const m = s.motion ?? {};
      return [m.layout ?? 'left', m.enter ?? '-', m.emphasis ?? '-', m.decor ?? '-', m.transition ?? '-'].join('/');
    }),
  };
}

/** Tỉ lệ cảnh (cùng vị trí) trùng bố cục + hiện chữ + kiểu nhấn giữa hai video. */
export function sceneOverlap(a: Script, b: Script): number {
  const key = (s: Script['scenes'][number]) => [s.motion?.layout ?? 'left', s.motion?.enter ?? '-', s.motion?.emphasis ?? '-'].join('/');
  const n = Math.min(a.scenes.length, b.scenes.length);
  if (!n) return 0;
  let same = 0;
  for (let i = 0; i < n; i++) if (key(a.scenes[i]) === key(b.scenes[i])) same++;
  return same / Math.max(a.scenes.length, b.scenes.length);
}

/**
 * Chống trùng giữa các video làm gần đây (Nam 2026-10-09: "trong 1 ngày tôi làm 10 video… có trùng lặp không").
 * Cảnh báo khi cùng mẫu + cùng phong cách + ≥ 50% cảnh trùng chuyển động, hoặc ≥ 75% cảnh trùng dù khác phong cách.
 */
export function repetitionIssues(script: Script, recent: Array<{ name: string; script: Script }>): MotionIssue[] {
  const out: MotionIssue[] = [];
  for (const r of recent) {
    const overlap = sceneOverlap(script, r.script);
    const sameLook = r.script.template === script.template && r.script.style === script.style;
    if ((sameLook && overlap >= 0.5) || overlap >= 0.75) {
      out.push({
        level: 'warning',
        message: `Trùng với video gần đây "${r.name}" (${sameLook ? 'cùng mẫu, cùng phong cách, ' : ''}${Math.round(overlap * 100)}% cảnh cùng bố cục/chuyển động). Đổi phong cách, bố cục hoặc kiểu nhấn (skill dao-dien-chuyen-dong).`,
      });
    }
  }
  return out;
}
