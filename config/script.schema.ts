/**
 * briefs/<slug>/script.json do Claude viết (REQUIREMENTS v0.4 §6.2). Không lồng tiếng: chữ trên màn hình là kênh chính.
 */
import { z } from 'zod';
import { STYLE_IDS } from './styles.ts';
import { TEXT_ENTERS, TRANSITIONS } from './style-preset.schema.ts';
import { HOOK_ANGLES, PRODUCT_IDS, SCENE_ROLES, TEMPLATE_IDS } from './video-types.ts';

export const VISUAL_TYPES = ['asset', 'text', 'phone', 'split', 'logo', 'montage'] as const;

/** Một chỉ số của Stats, vd. { value: "1.200+", label: "cửa hàng dùng SIPOS" }. `value` phải có nguyên văn trong brief. */
/** Kiểu nhấn cụm [nhấn] (kit-emphasis.js). */
export const EMPHASES = ['marker', 'underline', 'scribble', 'circle', 'strike', 'punch', 'glow'] as const;
/** Hoạt cảnh trang trí bung ra trong cảnh (kit-emphasis.js decor). */
/** Bố cục khối chữ của cảnh (kit: scene-kit.js textBlock). */
export const LAYOUTS = ['left', 'center', 'giant', 'stack', 'bottom'] as const;
export const DECORS = ['none', 'hearts', 'flowers', 'sparkles', 'confetti', 'coins', 'checks', 'stars'] as const;

/**
 * Chỉ đạo chuyển động cho một cảnh (skill dao-dien-chuyen-dong viết, theo NGHĨA của cảnh): ghi đè mặc định của
 * phong cách. Bỏ trống trường nào thì dùng mặc định của phong cách.
 */
export const MotionSchema = z.object({
  /** Bố cục chữ: left căn trái · center căn giữa · giant chữ khổng lồ · stack mỗi dòng một từ · bottom chữ dưới đáy. */
  layout: z.enum(LAYOUTS).optional(),
  enter: z.enum(TEXT_ENTERS).optional(),
  emphasis: z.enum(EMPHASES).optional(),
  decor: z.enum(DECORS).optional(),
  /** Chuyển cảnh VÀO cảnh này. */
  transition: z.enum(TRANSITIONS).optional(),
  /** Lý do chọn (1 câu, để MKT/dev hiểu). */
  why: z.string().max(160).optional(),
});

export const StatSchema = z.object({
  value: z.string().min(1).max(12).regex(/\d/, 'value phải có chữ số'),
  label: z.string().min(1).max(40),
});

export const SceneSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  role: z.enum(SCENE_ROLES),
  onScreenText: z.string().min(1).max(80),
  subText: z.string().max(120).optional(),
  visual: z.object({
    type: z.enum(VISUAL_TYPES),
    src: z.string().optional(),
    /** Ảnh/clip "sau" của cảnh `split` (BeforeAfter): `src` là trước, `srcAfter` là sau. */
    srcAfter: z.string().optional(),
    /** Vùng cần chỉ vào / zoom trên ảnh (phần trăm 0–100), dùng cho callout của FeatureLaunch. */
    focus: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
    /** EventRecap: 2–6 ảnh/clip cắt nhanh trong một cảnh (visual.type "montage"). */
    srcs: z.array(z.string()).min(2).max(6).optional(),
    /** Giây bắt đầu trong clip gốc. Bỏ trống: cảnh liền trước cùng clip thì nối tiếp, không thì từ 0. */
    clipStart: z.number().min(0).optional(),
    /** Tắt tiếng clip này dù loại video giữ âm thanh gốc. */
    mute: z.boolean().optional(),
  }),
  /** (Cũ, không dùng) — chuyển cảnh nay ghi ở motion.transition. */
  transition: z.string().optional(),
  motion: MotionSchema.optional(),
  durationSec: z.number().positive(),
  /** Stats: 1–3 chỉ số đếm lên. */
  stats: z.array(StatSchema).min(1).max(3).optional(),
  /** Stats: vẽ các chỉ số thành biểu đồ cột (cần ≥ 2 chỉ số cùng đơn vị). */
  chart: z.literal('bar').optional(),
  /** Testimonial / TalkingHead: tên khách hoặc người nói + cửa hàng/chức danh hiện ở lower third, vd. "Chị Lan · Tạp hoá Lan, Hà Đông". Phải có trong brief. */
  attribution: z.string().min(1).max(60).optional(),
  /** Promo: các con số phải có trong brief (validate kiểm). */
  promo: z
    .object({
      badge: z.string().min(1).max(10).optional(),
      priceOld: z.string().min(1).max(14).optional(),
      priceNew: z.string().min(1).max(14).optional(),
      deadline: z.string().min(1).max(32).optional(),
      /** Đếm ngược N → 1, mỗi số 1 giây. */
      countdownFrom: z.number().int().min(2).max(10).optional(),
    })
    .refine((p) => Object.values(p).some((v) => v !== undefined), 'promo cần ít nhất một trường')
    .optional(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const ScriptSchema = z.object({
  concept: z.object({
    title: z.string().min(1),
    bigIdea: z.string().min(1),
    hookAngle: z.enum(HOOK_ANGLES),
    /**
     * LUẬT SỐ 1 — 3 giây đầu: điểm hấp dẫn đã chọn từ brief (tao-reel/references/chon-diem-hap-dan.md) và điểm 5 tiêu chí
     * (tối đa 25). Validate chặn ngay ở bước kịch bản khi thiếu hoặc dưới 20.
     */
    diemHapDan: z.object({ ungVien: z.string().min(1), diem: z.number().min(0).max(25) }).optional(),
    /** Nỗi đau cụ thể của khách (lấy từ brief) và cảnh làm nó nổi bật (vai trò hook/problem). */
    noiDau: z.object({ khach: z.string().min(1), canh: z.string().min(1) }).optional(),
    /** Sản phẩm giải quyết nỗi đau đó thế nào (chỉ điều brief/hồ sơ sản phẩm có) và cảnh cho thấy (vai trò solution). */
    giaiPhap: z.object({ cach: z.string().min(1), canh: z.string().min(1) }).optional(),
  }),
  videoType: z.string().min(1),
  style: z.enum(STYLE_IDS),
  template: z.enum(TEMPLATE_IDS),
  /**
   * Cách dựng: "custom" = Claude viết composition riêng ở briefs/<tên>/dung-rieng/index.html (mặc định cho video mới,
   * docs/decisions.md §18); "template" = mẫu có sẵn trong templates/<template>/ (dự phòng). `template` vẫn quy định
   * thứ tự cảnh theo loại video. Bỏ trống = "template".
   */
  build: z.enum(['template', 'custom']).optional(),
  product: z.enum(PRODUCT_IDS),
  /** Chữ hook 3 giây đầu. Xuống dòng bằng "\n" (tối đa 2 dòng, ≤ 40 ký tự mỗi dòng). */
  hook: z.string().min(1),
  scenes: z.array(SceneSchema).min(2).max(12),
  cta: z.string().min(1),
  music: z.string().min(1),
  /** Điểm Claude tự chấm (REQUIREMENTS §6.2), ngưỡng ≥ 85. */
  selfScore: z
    .object({
      total: z.number().min(0).max(100),
      notes: z.string().min(1),
    })
    .optional(),
});
export type Script = z.infer<typeof ScriptSchema>;
