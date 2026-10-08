/**
 * Từ script.json (đã validate) → props cho template (REQUIREMENTS v0.4 §6.4, phương án A).
 * Template nhận một biến `props` dạng chuỗi JSON (variables không có kiểu mảng) + `debugSafeZone`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadStylePreset, type StylePreset } from '../../config/style-preset.schema.ts';
import type { Script } from '../../config/script.schema.ts';
import { getVideoType, type ProductId } from '../../config/video-types.ts';

export interface PropsScene {
  id: string;
  role: string;
  text: string;
  sub?: string;
  visual: Script['scenes'][number]['visual'];
  attribution?: string;
  promo?: Script['scenes'][number]['promo'];
  start: number;
  duration: number;
}

export interface TemplateProps {
  template: string;
  product: ProductId;
  logoOnDark: string;
  logoOnLight: string;
  style: StylePreset;
  scenes: PropsScene[];
  totalSec: number;
  /** Nhãn trên hook theo loại video (TipOfTheDay). */
  hookTag?: string;
  /** Đánh số bước khi có từ 2 cảnh solution trở lên. */
  numberSteps: boolean;
}

interface ProductsFile {
  products: Record<ProductId, { logos: { onDark: string; onLight: string } }>;
}

export function buildProps(repoRoot: string, script: Script): TemplateProps {
  const products = JSON.parse(readFileSync(join(repoRoot, 'brand', 'products.json'), 'utf8')) as ProductsFile;
  const logos = products.products[script.product].logos;
  const style = loadStylePreset(repoRoot, script.style);

  let t = 0;
  const scenes = script.scenes.map((s) => {
    const scene: PropsScene = { id: s.id, role: s.role, text: s.onScreenText, sub: s.subText, visual: s.visual, attribution: s.attribution, promo: s.promo, start: round(t), duration: s.durationSec };
    t += s.durationSec;
    return scene;
  });

  return {
    template: script.template,
    product: script.product,
    logoOnDark: logos.onDark,
    logoOnLight: logos.onLight,
    style,
    scenes,
    totalSec: round(t),
    hookTag: getVideoType(script.videoType)?.hookTag,
    numberSteps: script.scenes.filter((s) => s.role === 'solution').length >= 2,
  };
}

/** Giá trị cho `--variables-file` của hyperframes render. */
export function variablesFile(props: TemplateProps, debugSafeZone = false): { props: string; debugSafeZone: boolean } {
  return { props: JSON.stringify(props), debugSafeZone };
}

/** Các đường dẫn hình/clip cần copy vào stage. */
export function assetPaths(script: Script): string[] {
  return script.scenes.flatMap((s) => [s.visual.src, s.visual.srcAfter]).filter((x): x is string => !!x);
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}
