import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { MusicTrack } from '../config/music-manifest.ts';
import { ScriptSchema } from '../config/script.schema.ts';
import { buildPost } from '../scripts/lib/post-caption.ts';

const script = ScriptSchema.parse(JSON.parse(readFileSync(new URL('../briefs/_example/script.json', import.meta.url), 'utf8')));

const track: MusicTrack = {
  id: 'x',
  file: 'x.mp3',
  title: 'Song',
  author: 'Kevin MacLeod',
  source: 'incompetech',
  sourceUrl: 'https://incompetech.com/x',
  license: 'CC BY 4.0',
  attributionRequired: true,
  attributionText: 'Music: Song by Kevin MacLeod (incompetech.com), CC BY 4.0',
  downloadedAt: '2026-10-08',
  evidence: 'drive://x',
  mood: ['toi-gian'],
  bpm: 100,
  durationSec: 60,
  allowedUse: ['social-organic'],
  blocked: false,
};

describe('buildPost', () => {
  it('caption có hook một dòng, các ý, CTA và hashtag sản phẩm + chủ đề', () => {
    const post = buildPost({ script, hashtags: ['#SIPOS', '#Redsun'] });
    expect(post).toContain('Bạn vẫn kiểm kho bằng sổ tay?');
    expect(post).toContain('• Quét mã vạch, tồn kho cập nhật ngay — Ngay trên điện thoại');
    expect(post).toContain('👉 Tìm hiểu thêm tại sipos.vn');
    expect(post).toContain('#SIPOS #Redsun #tinhnangmoi');
  });

  it('nhạc thử được đánh dấu không đăng; nhạc CC BY có dòng credit', () => {
    expect(buildPost({ script, hashtags: [] })).toContain('NHẠC THỬ, KHÔNG ĐĂNG');
    const post = buildPost({ script, hashtags: [], track });
    expect(post).toContain('Music: Song by Kevin MacLeod (incompetech.com), CC BY 4.0');
    expect(post).not.toContain('NHẠC THỬ');
  });
});
