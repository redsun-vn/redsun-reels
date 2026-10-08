/**
 * Môi trường chạy HyperFrames cho mọi script: FFmpeg/ffprobe từ ffmpeg-static, tắt telemetry,
 * tắt kiểm tra bản mới, không để `init` tự cài skill (chỉ dùng plugin đã pin).
 */
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const require = createRequire(join(REPO_ROOT, 'package.json'));

export function ffmpegPath(): string {
  return require('ffmpeg-static') as string;
}

export function ffprobePath(): string {
  return (require('ffprobe-static') as { path: string }).path;
}

export function hyperframesEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HYPERFRAMES_FFMPEG_PATH: process.env.HYPERFRAMES_FFMPEG_PATH || ffmpegPath(),
    HYPERFRAMES_FFPROBE_PATH: process.env.HYPERFRAMES_FFPROBE_PATH || ffprobePath(),
    HYPERFRAMES_NO_TELEMETRY: '1',
    HYPERFRAMES_NO_UPDATE_CHECK: '1',
    HYPERFRAMES_SKIP_SKILLS: '1',
  };
}

function hyperframesBin(): string {
  return join(REPO_ROOT, 'node_modules', '.bin', 'hyperframes');
}

/** Chạy CLI hyperframes, trả kết quả (không ném lỗi) để script tự báo lỗi tiếng Việt. */
export function runHyperframes(args: string[], opts: { inherit?: boolean } = {}): SpawnSyncReturns<string> {
  return spawnSync(hyperframesBin(), args, {
    cwd: REPO_ROOT,
    env: hyperframesEnv(),
    encoding: 'utf8',
    stdio: opts.inherit ? 'inherit' : 'pipe',
  });
}

export function runFfmpeg(args: string[]): SpawnSyncReturns<string> {
  return spawnSync(ffmpegPath(), args, { encoding: 'utf8' });
}

export function runFfprobe(args: string[]): SpawnSyncReturns<string> {
  return spawnSync(ffprobePath(), args, { encoding: 'utf8' });
}

/** Bỏ mã màu ANSI khỏi output CLI. */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}
