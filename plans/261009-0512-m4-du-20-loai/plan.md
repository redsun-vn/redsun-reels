---
title: "M4 — EventRecap, Stats, TalkingHead + tiếng gốc clip, hạ nhạc tự động"
status: completed
priority: P1
effort: 3d
tags: [feature]
created: 2026-10-09
---

# M4 — Đủ 20 loại video

REQUIREMENTS v0.4 §7.1, §8.3, §15 M4. Nam: "tiếp tục" (2026-10-09). Nhạc giữ Pixabay/Mixkit (chưa đổi).

## Bằng chứng kỹ thuật (thử 2026-10-09, HyperFrames 0.8.141)
- `<video data-has-audio="true">` có `id`, do script tạo lúc chạy: tiếng clip vào bản render (tone 1 kHz đo được đúng khoảng 3–7 giây).
- `data-automation` (lane `volume`) trên `#music` **gán bằng JS lúc chạy: không có tác dụng**. Ghi sẵn trong HTML: nhạc hạ ~12 dB đúng khoảng. → bước build ghi lane vào `index.html` của bản stage (như `injectDefaults`).

## Thiết kế
- **Script** (trường tuỳ chọn):
  - `visual.type: "montage"` + `visual.srcs` (2–6 ảnh/clip, cắt nhanh trong một cảnh) — EventRecap.
  - `visual.clipStart` (giây trong clip gốc); cảnh liền nhau cùng clip, không khai `clipStart` → nối tiếp (một "shot" liên tục, tiếng không bị cắt).
  - `visual.mute` — tắt tiếng clip dù loại video giữ tiếng.
  - `stats` (1–3 `{ value, label }`) + `chart: "bar"` — Stats.
  - `attribution` dùng cho lower third người nói ở TalkingHead.
- **Âm thanh**: loại video `keepClipAudio` → clip video có tiếng (trừ `mute`). Build tính khoảng có tiếng → lane hạ nhạc (0.18, dốc 0.3 giây) ghi vào stage. Testimonial có clip cũng giữ tiếng.
- **Chống bịa**: `stats.value` phải có nguyên cụm trong brief (lỗi); `chart` cần ≥ 2 chỉ số cùng đơn vị; clip phải đủ dài cho `clipStart` + thời lượng (ffprobe); clip giữ tiếng mà không có tiếng → cảnh báo.
- **Template**:
  - EventRecap: montage cắt nhanh (mỗi hình ≥ 0.6 giây), tiêu đề lớn.
  - Stats: số đếm lên (định dạng giữ dấu chấm nghìn, %, +), thanh % , biểu đồ cột.
  - TalkingHead: clip toàn màn hình giữ tiếng, chữ nhấn ý chính ở dưới, lower third tên người nói.
- Render test: 8 template × 19 phong cách.

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | Schema + build-props (shot, tiếng, lane hạ nhạc) + validate | Completed |
| 2 | kit-blocks montage/stats, scene-kit, 3 template | Completed |
| 3 | Asset demo, 5 brief mẫu, e2e, đo hạ nhạc | Completed |
| 4 | Render test 152 tổ hợp, review, docs, skill | Completed |

## Success Criteria
- [x] 20 loại video có brief mẫu xuất MP4 đạt §9.1.
- [x] TalkingHead: tiếng gốc nghe rõ, nhạc hạ khi có tiếng (đo bằng ffmpeg).
- [x] Render test 152 tổ hợp có baseline đã xem bằng mắt.
- [x] Unit test, typecheck, brand lint, music lint pass.
- [ ] **Cần người**: thử TalkingHead với clip quay thật của MKT (clip mẫu là ảnh tĩnh + giọng máy).
