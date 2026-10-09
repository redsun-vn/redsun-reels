/**
 * ./reel music:add nhac-tu-tim/<file> --link=<url trang bài nhạc> --tac-gia="<tác giả>" --mood=<phong-cách,…> [--ten="<tên bài>"]
 * ./reel music:add --lai      — đăng ký lại mọi bài trong nhac-tu-tim/ (sau khi cập nhật bản mới của dự án)
 *
 * MKT tự tìm nhạc trên Pixabay / Mixkit (nguồn Nam đã duyệt, docs/music-sources.md), lưu file + ảnh chụp trang bài
 * (thấy tên bài, tác giả, license) cùng tên vào thư mục nhac-tu-tim/. Lệnh kiểm nguồn, ảnh bằng chứng, thời lượng,
 * copy vào brand/music/ và thêm vào manifest trên máy này (localOnly). Nam gom các bài này vào thư viện chung sau.
 */
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';
import { MusicManifestSchema, type MusicTrack } from '../config/music-manifest.ts';
import { STYLE_IDS } from '../config/styles.ts';
import { runCommand } from './lib/cli.ts';
import { REPO_ROOT, runFfmpeg, runFfprobe } from './lib/hyperframes-env.ts';
import { introSkipSec } from './lib/music-intro.ts';

const INBOX = join(REPO_ROOT, 'nhac-tu-tim');
const MUSIC = join(REPO_ROOT, 'brand', 'music');
const AUDIO_EXT = ['.mp3', '.wav', '.m4a'];
const EVIDENCE_EXT = ['.png', '.jpg', '.jpeg', '.pdf', '.webp'];
const SOURCES = [
  { host: /(^|\.)pixabay\.com$/, source: 'pixabay' as const, license: 'Pixabay Content License' },
  { host: /(^|\.)mixkit\.co$/, source: 'mixkit' as const, license: 'Mixkit Stock Music Free License' },
];

interface Info {
  file: string;
  link: string;
  author: string;
  title: string;
  mood: string[];
  addedAt: string;
}

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'bai';

function register(info: Info): MusicTrack {
  const src = join(INBOX, info.file);
  if (!existsSync(src)) throw new Error(`Không thấy file nhạc nhac-tu-tim/${info.file}.`);
  const ext = extname(info.file).toLowerCase();
  if (!AUDIO_EXT.includes(ext)) throw new Error(`File "${info.file}" không phải nhạc (${AUDIO_EXT.join(', ')}).`);

  let url: URL;
  try {
    url = new URL(info.link);
  } catch {
    throw new Error(`Link "${info.link}" không hợp lệ. Dán link trang bài nhạc trên Pixabay hoặc Mixkit.`);
  }
  const s = SOURCES.find((x) => x.host.test(url.hostname));
  if (!s) throw new Error('Chỉ nhận nhạc từ Pixabay hoặc Mixkit (nguồn Nam đã duyệt). Nguồn khác: hỏi Nam trước.');

  const stem = basename(info.file, ext);
  const evidence = EVIDENCE_EXT.map((e) => `${stem}${e}`).find((f) => existsSync(join(INBOX, f)));
  if (!evidence) {
    throw new Error(`Thiếu ảnh chụp trang bài nhạc. Chụp màn hình trang bài (thấy tên bài, tác giả, chữ license), lưu vào nhac-tu-tim/ với tên "${stem}.png".`);
  }
  const bad = info.mood.filter((m) => !(STYLE_IDS as readonly string[]).includes(m));
  if (!info.mood.length || bad.length) throw new Error(`Phong cách ${bad.join(', ') || '(trống)'} không đúng. Chọn trong: ${STYLE_IDS.join(', ')}.`);
  if (!info.author.trim()) throw new Error('Thiếu tên tác giả (ghi trên trang bài nhạc).');

  const probe = runFfprobe(['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]);
  const durationSec = Math.floor(Number(probe.stdout.trim()));
  if (probe.status !== 0 || !(durationSec >= 10)) throw new Error(`Không đọc được file nhạc "${info.file}" (file hỏng hoặc quá ngắn).`);

  const id = `${s.source}-${slugify(info.title)}`;
  const dest = join(MUSIC, `${id}.mp3`);
  if (ext === '.mp3') copyFileSync(src, dest);
  else {
    const r = runFfmpeg(['-v', 'error', '-y', '-i', src, '-ar', '48000', '-b:a', '256k', dest]);
    if (r.status !== 0) throw new Error(`Không đổi được "${info.file}" sang mp3.`);
  }
  return {
    id,
    file: `${id}.mp3`,
    title: info.title,
    author: info.author.trim(),
    source: s.source,
    sourceUrl: info.link,
    license: s.license,
    attributionRequired: false,
    attributionText: null,
    downloadedAt: info.addedAt,
    evidence: `nhac-tu-tim/${evidence}`,
    mood: info.mood as MusicTrack['mood'],
    bpm: null,
    durationSec,
    allowedUse: ['social-organic'],
    blocked: false,
    sha256: createHash('sha256').update(readFileSync(dest)).digest('hex'),
    startSec: introSkipSec(dest),
    localOnly: true,
    notes: `MKT tự thêm ${info.addedAt} trên máy này. Báo Nam đưa vào thư viện chung (gửi file + ảnh chụp trong nhac-tu-tim/).`,
  };
}

function save(tracks: MusicTrack[]): void {
  const path = join(MUSIC, 'manifest.json');
  const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
  for (const t of tracks) {
    const i = manifest.tracks.findIndex((x) => x.id === t.id);
    if (i >= 0 && !manifest.tracks[i].localOnly) throw new Error(`Bài "${t.title}" trùng tên với bài có sẵn trong thư viện. Đặt tên khác bằng --ten.`);
    if (i >= 0) manifest.tracks[i] = t;
    else manifest.tracks.push(t);
  }
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
}

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

await runCommand(() => {
  if (args.includes('--lai')) {
    const infos = readdirSync(INBOX).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(INBOX, f), 'utf8')) as Info);
    if (!infos.length) throw new Error('Thư mục nhac-tu-tim/ chưa có bài nào đã thêm.');
    const tracks = infos.map(register);
    save(tracks);
    console.log(`Đã đăng ký lại ${tracks.length} bài: ${tracks.map((t) => t.id).join(', ')}.`);
    return;
  }
  const fileArg = args.find((a) => !a.startsWith('--'));
  const link = opt('link');
  const author = opt('tac-gia');
  const mood = opt('mood');
  if (!fileArg || !link || !author || !mood) {
    throw new Error('Cách dùng: ./reel music:add nhac-tu-tim/<file> --link=<link trang bài> --tac-gia="<tác giả>" --mood=<phong-cách,…> [--ten="<tên bài>"]');
  }
  const rel = relative(INBOX, resolve(REPO_ROOT, fileArg));
  if (rel.startsWith('..') || rel.includes('/')) throw new Error('File nhạc phải nằm ngay trong thư mục nhac-tu-tim/.');
  const info: Info = {
    file: rel,
    link,
    author,
    title: opt('ten') || basename(rel, extname(rel)),
    mood: mood.split(',').map((m) => m.trim()).filter(Boolean),
    addedAt: new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Saigon' }),
  };
  const track = register(info);
  save([track]);
  writeFileSync(join(INBOX, `${basename(rel, extname(rel))}.json`), JSON.stringify(info, null, 2) + '\n');
  console.log(`Đã thêm nhạc "${track.title}" (id: ${track.id}, ${track.durationSec}s, phong cách ${track.mood.join(', ')}). Dùng được cho video thật trên máy này.`);
  console.log('Nhắc MKT: báo Nam để đưa bài vào thư viện chung của cả team.');
});
