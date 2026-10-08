---
title: "M3 — BeforeAfter, Testimonial, Promo + 16 phong cách + lịch dịp lễ"
status: in-progress
priority: P1
effort: 3d
tags: [feature]
created: 2026-10-08
---

# M3 — Mở rộng

REQUIREMENTS v0.4 §7.1, §7.3, §15 M3. Nam: "tiếp" (2026-10-08).

## Thiết kế
- **Preset phong cách** thêm:
  - transition: `dip-black`, `whip`, `glitch-cut`, `flash-white`;
  - text enter: `blur`, `type`, `track`;
  - `overlay` (1 lớp phủ / video): none, vignette, grain, light-leak, grid, hud, scanlines, confetti, letterbox, paper, vhs;
  - `background`: flat | gradient (2 sắc cùng họ brand, catalog §5).
  - Mọi màu qua biến brand + `color-mix`; chuyển động xác định (không random); nhấp nháy ≤ 3 lần/giây.
- **Script** thêm trường tuỳ chọn ở cảnh:
  - `visual.srcAfter` (split trước/sau);
  - `attribution` (lower third Testimonial);
  - `promo { badge, priceOld, priceNew, deadline, countdownFrom }`.
- **Chống bịa**: số trong attribution và promo phải có trong brief (lỗi); số trong chữ cảnh không có trong brief → cảnh báo; quote khách không có trong brief → cảnh báo.
- **Template**:
  - BeforeAfter: nhãn TRƯỚC/SAU; cảnh "trước" làm nhạt ảnh; vào cảnh "sau" luôn là wipe; split 2 nửa.
  - Testimonial: dấu ngoặc kép lớn, quote, lower third.
  - Promo: badge, giá gạch ngang, hạn chót, đếm ngược.
- **Tách scene-kit.js** (> 300 dòng): kit-core (chữ, co cỡ), kit-motion (chuyển cảnh, lớp phủ), kit-blocks (khối theo template), scene-kit (dựng).
- **Lịch dịp lễ**: `OCCASIONS` (tên, ngày); `./reel info dip-le`; occasion lạ → cảnh báo.
- **Render test**: 5 template × 19 phong cách. Baseline đổi sang JPEG 360×640 cho gọn git.

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | Preset 16 phong cách + kit-motion (transition, text, overlay, background) | Completed |
| 2 | Schema + validate chống bịa + 3 template + kit-blocks | Completed |
| 3 | Lịch dịp lễ, info, skill/script-format | Completed |
| 4 | Fixtures 8 loại mới, e2e, render test 95 tổ hợp, review, docs | Completed |

## Success Criteria
- [ ] 19 preset hợp lệ; `./reel info` hiện ✓ cho 19 phong cách và 15 loại video.
- [ ] 15 loại video (M1–M3) có brief mẫu xuất MP4 đạt §9.1.
- [ ] Render test 95 tổ hợp có baseline đã xem bằng mắt (ảnh ghép).
- [ ] Brand lint, music lint, unit test, typecheck pass.
- [ ] §14.4: đổi `--color-primary` → template đổi theo (kiểm bằng render 1 khung).
- [ ] **Cần người**: §14.3 với 10 video thử nghiệm do MKT làm.

## Giới hạn đã biết
- Âm thanh gốc clip khách + hạ nhạc tự động: làm cùng TalkingHead ở M4 (REQUIREMENTS M4). Testimonial M3 tắt tiếng clip, quote hiện bằng chữ.
