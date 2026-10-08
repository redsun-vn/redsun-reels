/**
 * Đọc thư mục một video: briefs/<slug>/brief.md (YAML frontmatter + nội dung tự do) và script.json.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { REPO_ROOT } from './hyperframes-env.ts';

export const SLUG_PATTERN = /^[a-z0-9_][a-z0-9-]*$/;

export function briefDir(slug: string, root = join(REPO_ROOT, 'briefs')): string {
  if (!SLUG_PATTERN.test(slug)) throw new Error(`Tên video "${slug}" không hợp lệ (chỉ chữ thường, số, "-").`);
  return join(root, slug);
}

export interface RawBrief {
  frontmatter: unknown;
  body: string;
}

export function readBriefFile(dir: string): RawBrief {
  const file = join(dir, 'brief.md');
  if (!existsSync(file)) throw new Error(`Chưa có brief: thiếu file ${file}. Chạy "pnpm new <tên>" để tạo.`);
  const text = readFileSync(file, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) throw new Error('brief.md phải bắt đầu bằng phần thông tin giữa hai dòng "---".');
  try {
    return { frontmatter: parseYaml(m[1]), body: m[2].trim() };
  } catch (err) {
    throw new Error(`Phần thông tin đầu brief.md bị sai định dạng: ${(err as Error).message}`);
  }
}

export function readScriptFile(dir: string): unknown {
  const file = join(dir, 'script.json');
  if (!existsSync(file)) throw new Error('Chưa có kịch bản (script.json). Claude cần viết kịch bản trước.');
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`script.json bị sai định dạng: ${(err as Error).message}`);
  }
}
