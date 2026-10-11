/**
 * Kiểu kể của reel (Nam 2026-10-11, docs/decisions.md §34): video qua luật nhưng giống quảng cáo → mỗi concept chọn một
 * trong 4 kiểu kể; MKT chọn 1 trong 3 concept thuộc 3 kiểu kể khác nhau. Cách kể từng kiểu:
 * .claude/skills/tao-reel/references/kieu-ke.md. Chỉ dev sửa file này.
 */
import type { KieuHinh } from './ai-video.ts';
import type { SceneRole } from './video-types.ts';

export const KIEU_KE_IDS = ['tieu-pham', 'pov', 'twist', 'meo-so-lieu'] as const;
export type KieuKe = (typeof KIEU_KE_IDS)[number];

export interface KieuKeInfo {
  ten: string;
  moTa: string;
  /** Thứ tự vai trò cảnh gợi ý (validate cảnh báo khi khác); `lap` được lặp nhiều cảnh liên tiếp. */
  vaiTro: SceneRole[];
  lap?: SceneRole;
  /** Kiểu hình hợp: tiểu phẩm và twist cần diễn theo kịch bản, clip quay sẵn không diễn được. */
  kieuHinh: readonly KieuHinh[];
  /** Cần con số hay mẹo thật do MKT đưa (không bịa). */
  canSoThat: boolean;
}

export const KIEU_KE: Record<KieuKe, KieuKeInfo> = {
  'tieu-pham': {
    ten: 'Tiểu phẩm hài đời thường',
    moTa: 'Một tình huống quen ở quán, có người phản ứng và cú ngắt gây cười; sản phẩm gỡ tình huống ở cuối.',
    vaiTro: ['hook', 'problem', 'solution', 'cta'],
    lap: 'problem',
    kieuHinh: ['minh-hoa', 'nguoi-that-ai'],
    canSoThat: false,
  },
  pov: {
    ten: 'POV "khi bạn là chủ quán…"',
    moTa: 'Người xem nhìn qua mắt chủ quán, sống lại một khoảnh khắc khó; sản phẩm là lối ra của chính khoảnh khắc đó.',
    vaiTro: ['hook', 'problem', 'solution', 'cta'],
    lap: 'problem',
    kieuHinh: ['minh-hoa', 'nguoi-that-ai', 'nguoi-that-quay-san'],
    canSoThat: false,
  },
  twist: {
    ten: 'Kể chuyện có cú lật',
    moTa: 'Câu chuyện dẫn người xem đoán một hướng rồi lật ngược; sản phẩm là cú lật hoặc ngay sau cú lật.',
    vaiTro: ['hook', 'problem', 'solution', 'cta'],
    lap: 'problem',
    kieuHinh: ['minh-hoa', 'nguoi-that-ai'],
    canSoThat: false,
  },
  'meo-so-lieu': {
    ten: 'Mẹo / số liệu gây sốc',
    moTa: 'Mở bằng một con số hay mẹo thật làm chủ quán giật mình, giải thích nhanh, sản phẩm là cách làm mẹo đó dễ.',
    vaiTro: ['hook', 'problem', 'solution', 'proof', 'cta'],
    lap: 'problem',
    kieuHinh: ['minh-hoa', 'nguoi-that-ai', 'nguoi-that-quay-san'],
    canSoThat: true,
  },
};

/** LUẬT SỐ 2 nới hình thức khi kịch bản có kiểu kể: giải pháp ≥ 12% video, bắt đầu trước 85% (sản phẩm được là cú chốt). */
export const GIAI_PHAP_MIN = 0.12;
export const GIAI_PHAP_TRUOC = 0.85;
/** Kịch bản cũ (chưa có kiểu kể) giữ ngưỡng cũ để kết quả không đổi. */
export const GIAI_PHAP_MIN_CU = 0.2;
export const GIAI_PHAP_TRUOC_CU = 0.7;

/** Kiểu kể hợp một kiểu hình (dùng cho skill chon-kieu-hinh và validate). */
export const kieuKeHop = (kh: KieuHinh): KieuKe[] => KIEU_KE_IDS.filter((k) => KIEU_KE[k].kieuHinh.includes(kh));
