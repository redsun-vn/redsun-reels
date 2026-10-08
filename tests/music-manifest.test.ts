import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkTrack, MusicManifestSchema, type MusicTrack } from '../config/music-manifest.ts';

const manifest = MusicManifestSchema.parse(JSON.parse(readFileSync(new URL('../brand/music/manifest.json', import.meta.url), 'utf8')));

const pixabay: MusicTrack = {
  id: 'upbeat-01',
  file: 'upbeat-01.mp3',
  title: 'Upbeat',
  author: 'Tác giả',
  source: 'pixabay',
  sourceUrl: 'https://pixabay.com/music/example',
  license: 'Pixabay Content License',
  attributionRequired: false,
  attributionText: null,
  downloadedAt: '2026-10-08',
  evidence: 'drive://music-licenses/upbeat-01.pdf',
  mood: ['vui-nhon'],
  bpm: 120,
  durationSec: 60,
  allowedUse: ['social-organic'],
  blocked: false,
};

describe('music manifest', () => {
  it('manifest trong repo hợp lệ và track test dùng được cho thử nghiệm', () => {
    const t = manifest.tracks.find((x) => x.id === 'test-pad-01');
    expect(t).toBeDefined();
    expect(checkTrack(t!, 'test')).toEqual([]);
  });

  it('track test bị chặn khi dùng cho video thật', () => {
    const t = manifest.tracks.find((x) => x.id === 'test-pad-01')!;
    expect(checkTrack(t, 'production').join(' ')).toMatch(/chỉ để thử nghiệm/);
  });

  it('track Pixabay đủ thông tin dùng được cho video thật', () => {
    expect(checkTrack(pixabay, 'production')).toEqual([]);
  });

  it('chặn license phi thương mại', () => {
    expect(checkTrack({ ...pixabay, license: 'CC BY-NC 4.0' }, 'production').join(' ')).toMatch(/phi thương mại/);
  });

  it('chặn track bị khóa và thiếu link nguồn', () => {
    expect(checkTrack({ ...pixabay, blocked: true }, 'production')).toHaveLength(1);
    expect(checkTrack({ ...pixabay, sourceUrl: 'pixabay' }, 'production').join(' ')).toMatch(/link nguồn/);
  });

  it('CC BY bắt buộc có dòng credit', () => {
    const t = { ...pixabay, source: 'incompetech' as const, license: 'CC BY 4.0', attributionRequired: true };
    expect(checkTrack(t, 'production').join(' ')).toMatch(/credit/);
    expect(checkTrack({ ...t, attributionText: 'Music: X by Kevin MacLeod (incompetech.com), CC BY 4.0' }, 'production')).toEqual([]);
  });
});
