/**
 * Schema + kiểm tra cho brand/music/manifest.json (REQUIREMENTS v0.4 §8.2).
 * Chặn: license phi thương mại ("NC"), thiếu nguồn, track bị khóa, track test dùng cho video thật.
 */
import { z } from 'zod';
import { STYLE_IDS } from './styles.ts';

export const ALLOWED_USES = ['social-organic', 'internal-test'] as const;

export const MusicTrackSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  file: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  source: z.enum(['pixabay', 'mixkit', 'incompetech', 'freesound', 'generated-in-repo']),
  sourceUrl: z.string().min(1),
  license: z.string().min(1),
  attributionRequired: z.boolean(),
  attributionText: z.string().nullable(),
  downloadedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Đường dẫn bằng chứng license, lưu ngoài repo (Drive). Track tự sinh trong repo ghi "n/a". */
  evidence: z.string().min(1),
  mood: z.array(z.enum(STYLE_IDS)).min(1),
  bpm: z.number().positive().nullable(),
  durationSec: z.number().positive(),
  allowedUse: z.array(z.enum(ALLOWED_USES)).min(1),
  blocked: z.boolean().default(false),
  /**
   * Nhạc của bên thứ ba (Pixabay, Mixkit…) KHÔNG nằm trong repo (repo công khai; license cấm phân phối lại track
   * rời). Máy tự tải về từ link gốc khi cài (`./reel music:fetch`), kiểm SHA-256 để chắc đúng file đã duyệt.
   */
  downloadUrl: z.string().regex(/^https:\/\//).optional(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/).optional(),
  /** Giây bắt đầu dùng trong bài: bỏ đoạn dạo đầu nhỏ để nhạc vào nhịp ngay (reel phải bắt tai từ giây đầu). */
  startSec: z.number().min(0).optional(),
  /** Bài MKT tự tải và thêm trên máy mình (`./reel music:add`): chỉ có trên máy đó, chờ Nam đưa vào thư viện chung. */
  localOnly: z.boolean().optional(),
  notes: z.string().optional(),
});
export type MusicTrack = z.infer<typeof MusicTrackSchema>;

/** Thời lượng dùng được của bài (đã trừ đoạn dạo đầu bỏ qua). */
export function usableSec(track: MusicTrack): number {
  return track.durationSec - (track.startSec ?? 0);
}

/** Gợi ý khi thiếu file nhạc trên máy. */
export function missingFileHint(track: MusicTrack): string {
  if (track.downloadUrl) return ' Chạy "./reel music:fetch" để tải về.';
  if (track.localOnly) return ` Bài này MKT tự thêm: đặt lại file vào nhac-tu-tim/ rồi chạy "./reel music:add --lai".`;
  if (track.id === 'test-pad-01') return ' Chạy "./reel gen:test-music" để tạo lại.';
  return ' Báo dev.';
}

export const MusicManifestSchema = z.object({ tracks: z.array(MusicTrackSchema) });
export type MusicManifest = z.infer<typeof MusicManifestSchema>;

export type MusicPurpose = 'production' | 'test';

/** Trả danh sách lỗi tiếng Việt; rỗng nghĩa là track dùng được cho mục đích này. */
export function checkTrack(track: MusicTrack, purpose: MusicPurpose): string[] {
  const errors: string[] = [];
  if (/\bNC\b|non[- ]?commercial/i.test(track.license)) {
    errors.push(`Nhạc "${track.title}" có license phi thương mại (${track.license}), không được dùng.`);
  }
  if (track.blocked) errors.push(`Nhạc "${track.title}" đã bị khóa (bị claim bản quyền hoặc license có vấn đề).`);
  if (track.source !== 'generated-in-repo' && !track.localOnly && !track.downloadUrl) errors.push(`Nhạc "${track.title}" thiếu link tải (downloadUrl) và mã kiểm sha256.`);
  if (track.downloadUrl && !track.sha256) errors.push(`Nhạc "${track.title}" thiếu mã kiểm sha256.`);
  if (track.source !== 'generated-in-repo' && !/^https?:\/\//.test(track.sourceUrl)) {
    errors.push(`Nhạc "${track.title}" thiếu link nguồn hợp lệ.`);
  }
  if (track.attributionRequired && !track.attributionText) {
    errors.push(`Nhạc "${track.title}" bắt buộc ghi nguồn nhưng chưa có dòng credit.`);
  }
  if (purpose === 'production' && !track.allowedUse.includes('social-organic')) {
    errors.push(`Nhạc "${track.title}" chỉ để thử nghiệm, không dùng cho video đăng thật.`);
  }
  return errors;
}

export function findTrack(manifest: MusicManifest, id: string): MusicTrack | undefined {
  return manifest.tracks.find((t) => t.id === id);
}
