/**
 * Dựng một video từ thư mục brief: validate → props.json → stage project → hyperframes lint + check.
 * Dùng chung cho build, preview, render, make và render test.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { MusicPurpose } from '../../config/music-manifest.ts';
import type { Script } from '../../config/script.schema.ts';
import { assetPaths, buildProps, type TemplateProps, variablesFile, voiceWindowsOf } from './build-props.ts';
import { dropSilentClipAudio } from './clip-check.ts';
import { REPO_ROOT, runHyperframes, stripAnsi } from './hyperframes-env.ts';
import { injectMusicDucking } from './music-ducking.ts';
import { stageProject } from './stage-project.ts';
import { formatIssues, hasErrors, type Issue, validateVideo } from './validate-video.ts';

export interface BuiltVideo {
  name: string;
  script: Script;
  props: TemplateProps;
  stageDir: string;
  varsFile: string;
  warnings: Issue[];
}

export class BuildError extends Error {}

export function buildVideo(opts: { dir: string; name: string; musicPurpose: MusicPurpose; debugSafeZone?: boolean; check?: boolean; writeProps?: boolean }): BuiltVideo {
  const { script, brief, issues } = validateVideo(opts.dir, { musicPurpose: opts.musicPurpose });
  if (hasErrors(issues) || !script) throw new BuildError(`Kịch bản chưa dựng được:\n${formatIssues(issues)}`);

  const props = buildProps(REPO_ROOT, script, brief?.occasion ?? undefined);
  dropSilentClipAudio(props.scenes);
  props.voiceWindows = voiceWindowsOf(props.scenes);
  if (opts.writeProps !== false) writeFileSync(join(opts.dir, 'props.json'), JSON.stringify(props, null, 2) + '\n');

  const { dir: stageDir } = stageProject({ template: script.template, name: opts.name, musicId: script.music, purpose: opts.musicPurpose, assets: assetPaths(script) });
  const vars = variablesFile(props, opts.debugSafeZone ?? false);
  const varsFile = join(stageDir, 'variables.json');
  writeFileSync(varsFile, JSON.stringify(vars));
  injectDefaults(join(stageDir, 'index.html'), vars);
  injectMusicDucking(join(stageDir, 'index.html'), props.voiceWindows, props.totalSec);

  const lint = runHyperframes(['lint', stageDir]);
  if (lint.status !== 0) throw new BuildError(`Template ${script.template} còn lỗi (hyperframes lint):\n${stripAnsi(lint.stdout + lint.stderr)}`);
  if (opts.check !== false) {
    const check = runHyperframes(['check', stageDir]);
    if (check.status !== 0) throw new BuildError(`Kiểm tra bố cục (hyperframes check) chưa đạt:\n${stripAnsi(check.stdout + check.stderr)}`);
  }

  return { name: opts.name, script, props, stageDir, varsFile, warnings: issues };
}

/**
 * Ghi giá trị biến của video thành `default` trong bản stage, để `hyperframes check` và Studio preview
 * (không nhận --variables-file) thấy đúng dữ liệu. Chỉ sửa bản stage, không sửa template gốc.
 */
export function injectDefaults(indexHtml: string, vars: Record<string, string | boolean>): void {
  const html = readFileSync(indexHtml, 'utf8');
  const m = /data-composition-variables='([^']*)'/.exec(html);
  if (!m) throw new BuildError(`Template thiếu data-composition-variables (${indexHtml}).`);
  const unescape = (x: string) => x.replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const decls = JSON.parse(unescape(m[1])) as Array<{ id: string; default: unknown }>;
  for (const d of decls) if (d.id in vars) d.default = vars[d.id];
  const escaped = JSON.stringify(decls).replace(/&/g, '&amp;').replace(/'/g, '&#39;');
  writeFileSync(indexHtml, html.replace(m[0], () => `data-composition-variables='${escaped}'`));
}
