---
phase: 5
title: "doctor + preview + kiểm tra"
status: pending
priority: P1
effort: "2h"
dependencies: [2, 3, 4]
---

# Phase 5: doctor + preview composition trống

## Goal
`pnpm doctor` và `pnpm preview` chạy được. Composition trống đạt điều kiện "Done" của M0.2.

## Files to Create / Modify
- Create: `scripts/lib/hyperframes-env.ts`: đặt `HYPERFRAMES_FFMPEG_PATH`/`FFPROBE_PATH`, `HYPERFRAMES_NO_TELEMETRY`, `HYPERFRAMES_NO_UPDATE_CHECK`, `HYPERFRAMES_SKIP_SKILLS`; chạy CLI.
- Create: `scripts/doctor.ts`: Node ≥22, hyperframes version = pin, `hyperframes doctor`, file font, GSAP, manifest nhạc hợp lệ. Thông báo tiếng Việt.
- Create: `scripts/preview.ts`: mặc định mở `templates/_blank` (port 3002, `--background`), có `--stop`.
- Create: `templates/_shared/safe-zone.html` (chỉ hiện khi debug), `templates/_blank/index.html` (dùng brand.css, font local, GSAP local, track nhạc test, safe zone debug bật bằng biến `debugSafeZone`).
- Create: script copy `brand/`, `vendor/` vào project template khi preview/render nếu HyperFrames không đọc được đường dẫn ngoài thư mục project. Spike sẽ xác định có cần không.

## Verification
- `pnpm doctor` exit 0.
- `pnpm preview` → HTTP 200 ở cổng 3002; `--stop` dừng được.
- `hyperframes lint` + `check` pass trên `templates/_blank`.
- Render thử: 1080×1920, 30 fps, có audio; log không có tải Google Fonts / CDN.
- Snapshot có safe zone khi `debugSafeZone=true`, không có khi false.
