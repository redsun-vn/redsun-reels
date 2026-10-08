/**
 * Đọc tham số chung cho các lệnh pnpm build/preview/render/make.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MusicPurpose } from '../../config/music-manifest.ts';
import { briefDir } from './brief.ts';
import { REPO_ROOT } from './hyperframes-env.ts';

export interface CliArgs {
  slug: string;
  dir: string;
  musicPurpose: MusicPurpose;
  draft: boolean;
  safeZone: boolean;
  flags: Set<string>;
}

export function parseCli(command: string): CliArgs {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  if (!slug) {
    console.error(`Cách dùng: pnpm ${command} <tên-video> [--draft] [--safe-zone] [--test-music]`);
    process.exit(1);
  }
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const known = new Set(['--draft', '--safe-zone', '--test-music']);
  const unknown = [...flags].filter((f) => !known.has(f));
  if (unknown.length) {
    console.error(`Không hiểu tuỳ chọn: ${unknown.join(', ')}. Dùng được: ${[...known].join(', ')}.`);
    process.exit(1);
  }
  return {
    slug,
    dir: briefDir(slug),
    musicPurpose: flags.has('--test-music') ? 'test' : 'production',
    draft: flags.has('--draft'),
    safeZone: flags.has('--safe-zone'),
    flags,
  };
}

const MAX_LINES_FOR_MKT = 12;

/**
 * Chạy một lệnh; khi lỗi in phần đầu (tiếng Việt) cho MKT, không dump stack trace. Lỗi dài (log CLI kỹ thuật)
 * được ghi đủ vào out/last-error.log để gửi dev.
 */
export async function runCommand(fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    const msg = (e as Error).message;
    const lines = msg.split('\n');
    if (lines.length > MAX_LINES_FOR_MKT) {
      mkdirSync(join(REPO_ROOT, 'out'), { recursive: true });
      writeFileSync(join(REPO_ROOT, 'out', 'last-error.log'), msg + '\n');
      console.error(`${lines.slice(0, MAX_LINES_FOR_MKT).join('\n')}\n…\nChi tiết kỹ thuật đã lưu ở out/last-error.log (gửi file này cho dev nếu cần).`);
    } else console.error(msg);
    process.exit(1);
  }
}
