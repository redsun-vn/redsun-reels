/**
 * Các video làm gần đây trong cùng thư mục briefs (để chống trùng): đọc script.json hợp lệ, sửa trong N ngày,
 * mới nhất trước, bỏ thư mục bắt đầu bằng "_" và chính video đang kiểm.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { ScriptSchema, type Script } from '../../config/script.schema.ts';
import { readBriefFile } from './brief.ts';

export function recentVideos(briefsRoot: string, opts: { exclude?: string; days?: number; limit?: number } = {}): Array<{ name: string; script: Script; mtime: number }> {
  if (!existsSync(briefsRoot)) return [];
  const since = Date.now() - (opts.days ?? 7) * 86400_000;
  const out: Array<{ name: string; script: Script; mtime: number }> = [];
  for (const name of readdirSync(briefsRoot)) {
    if (name.startsWith('_') || name === opts.exclude) continue;
    const f = join(briefsRoot, name, 'script.json');
    if (!existsSync(f)) continue;
    const mtime = statSync(f).mtimeMs;
    if (mtime < since) continue;
    try {
      const parsed = ScriptSchema.safeParse(JSON.parse(readFileSync(f, 'utf8')));
      if (parsed.success) out.push({ name, script: parsed.data, mtime });
    } catch {
      /* kịch bản hỏng: validate của video đó tự báo */
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime).slice(0, opts.limit ?? 20);
}

export function recentForBrief(briefDir: string): Array<{ name: string; script: Script }> {
  return recentVideos(dirname(briefDir), { exclude: basename(briefDir) });
}

/** Kiểu hình ghi trong brief.md của một video (brief hỏng hoặc thiếu: undefined). */
export function kieuHinhOf(dir: string): string | undefined {
  try {
    const fm = readBriefFile(dir).frontmatter as { kieuHinh?: unknown } | null;
    return typeof fm?.kieuHinh === 'string' ? fm.kieuHinh : undefined;
  } catch {
    return undefined;
  }
}

/** Video gần đây cùng thư mục briefs có kiểu hình `kieuHinh` (mới nhất trước). */
export function recentSameKieuHinh(briefDir: string, kieuHinh: string): Array<{ name: string; script: Script }> {
  return recentForBrief(briefDir).filter((r) => kieuHinhOf(join(dirname(briefDir), r.name)) === kieuHinh);
}
