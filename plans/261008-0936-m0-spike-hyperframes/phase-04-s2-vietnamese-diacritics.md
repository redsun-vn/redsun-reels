---
phase: 4
title: "S2 dấu tiếng Việt với Montserrat"
status: completed
priority: P1
effort: "2h"
dependencies: [2, 3]
---

# Phase 4: S2 — dấu tiếng Việt

## Goal
Chuỗi §13 `"Ứng dụng quản lý bán hàng — ưu đãi đặc biệt, giảm 30%!"` hiển thị đúng bằng Montserrat, ở text tĩnh và text có animation.

## Files to Create / Modify
- Create: `spike/s2/` (composition 1080×1920, `<meta charset="utf-8">`, `lang="vi"`)
- Create: `spike/s2/fonts/` (Montserrat từ github.com/google/fonts, OFL; ghi URL + commit)
- Create: `docs/spike-evidence/s2-*.png`, `docs/spike-evidence/s2.mp4`, `docs/spike-evidence/s2.txt`

## Tasks & Steps
- [x] Tải Montserrat (Regular/Bold/ExtraBold/Italic hoặc variable) từ nguồn chính thức; kiểm có glyph tiếng Việt (fontkit là dependency sẵn của hyperframes). *Thực tế: compiler hyperframes tự tải Montserrat từ Google Fonts, không cần tải tay; chưa copy vào `spike/s2/fonts/`, việc này để M0.2 (brand/fonts).*
- [x] Composition gồm: heading tĩnh (ExtraBold), caption từng từ có animation GSAP (fade/scale), lower third (Italic), một chuỗi phụ đủ "ă â đ ê ô ơ ư" + 5 thanh, và tên "SIPOS, REDSUN BOS".
- [x] Kiểm text ở dạng NFC (`s.normalize('NFC') === s`).
- [x] `lint` → `render` → `snapshot` (hoặc `ffmpeg -ss` tại 0s / giữa / cuối nếu `snapshot` không phù hợp).
- [x] Phóng to PNG soát từng dấu; so với cùng chuỗi render trong Chromium thường. *Thực tế: chỉ soát bằng mắt trên PNG render (renderer chính là Chromium), không render đối chứng riêng.*

## Verification
- 0 lỗi dấu (không tách dấu, không rơi về font fallback, không ô vuông) ở 3 vị trí × 3 thời điểm.
- `lint` pass. Kết luận Đạt/Không đạt. Không đạt là điều kiện Go/No-go: dừng, báo Nam.
