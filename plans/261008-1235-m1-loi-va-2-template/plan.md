---
title: "M1 — Lõi pipeline + FeatureLaunch + TipOfTheDay"
description: "Schema brief/script/props, validate/build/preview/render/make, bộ khối dùng chung, 3 phong cách, 2 template, brand lint, music lint; brief mẫu ra MP4 đạt §9.1."
status: completed
priority: P1
effort: 3.5d
tags: [feature, backend]
blockedBy: []
blocks: []
created: 2026-10-08
---

# M1 — Lõi + 2 template

## Overview
Thực hiện REQUIREMENTS v0.4 §15 M1. Nền đã có từ M0.2: brand, config, stage project, doctor, preview `_blank`.

Quyết định thiết kế:
- **Khối dùng chung là thư viện CSS + JS trong `templates/_shared/`**, không phải sub-composition HyperFrames. Lý do: số cảnh thay đổi theo kịch bản (tạo cảnh bằng script, S4), còn mount sub-composition động chưa được kiểm chứng. Ghi lệch vào decisions.md.
- Brief đọc frontmatter YAML bằng thư viện `yaml` (ISC). Đây là dep thêm ngoài §3, Nam đã ủy quyền chọn công cụ.
- Loudness cuối −14 LUFS / TP ≤ −1 dBTP: render xong thì chuẩn hóa bằng ffmpeg `loudnorm` 2 lượt, copy luồng video.
- Tiêu chí "loại 1–5" của REQUIREMENTS sửa thành **các loại dùng FL/TIP**: 1, 2, 3, 4, 14, 15, 18. Loại 5 `truoc-sau` dùng BeforeAfter (M3).

**Done khi (§15 M1):**
- `pnpm make _example` ra MP4 đạt §9.1.
- Test dấu tiếng Việt, brand lint, music lint pass.
- 7 loại video dùng FL/TIP tạo được MP4 từ brief mẫu.

## Phases
| # | Phase | Phụ thuộc | Status |
|---|-------|-----------|--------|
| 1 | [Hợp đồng dữ liệu: brief, script, props + validate](./phase-01-data-contracts-validate.md) | – | Completed |
| 2 | [Khối dùng chung + 3 phong cách](./phase-02-shared-kit-styles.md) | 1 | Completed |
| 3 | [Template FeatureLaunch + TipOfTheDay](./phase-03-templates-fl-tip.md) | 2 | Completed |
| 4 | [Pipeline: new, build, preview, render, make](./phase-04-pipeline-commands.md) | 1, 3 | Completed |
| 5 | [Brand lint, music lint, test tiếng Việt, render test](./phase-05-lints-render-tests.md) | 3, 4 | Completed |
| 6 | [Brief mẫu đầu-cuối + cập nhật docs](./phase-06-e2e-example-docs.md) | 4, 5 | Completed |

## Success Criteria
- [x] `pnpm validate/build/preview/render/make <slug>` chạy được, báo lỗi tiếng Việt.
- [x] `pnpm make _example --test-music` (nhạc thật chờ Nam) → `out/_example.mp4`: h264 1080×1920 30fps yuv420p, AAC 48 kHz, −14 LUFS ±1, TP ≤ −1 dBTP, thời lượng khớp props ±0.2 s, ≤ 50 MB/60 s.
- [x] FeatureLaunch + TipOfTheDay chạy với `toi-gian`, `khuyen-mai`, `vui-nhon`; `lint` + `check` pass.
- [x] 7 brief mẫu (loại 1, 2, 3, 4, 14, 15, 18) + 1 brief test dấu tiếng Việt ra MP4.
- [x] Brand lint + music lint + unit test + typecheck pass.
- [x] Không tải tài nguyên từ mạng lúc render.
