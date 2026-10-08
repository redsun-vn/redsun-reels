---
phase: 2
title: "Brand system"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Brand system

## Goal
`brand/` đủ để template chỉ dùng biến CSS; font + GSAP chạy local.

## Files to Create / Modify
- Create: `brand/fonts/Montserrat[wght].ttf`, `Montserrat-Italic[wght].ttf`, `OFL.txt` (github.com/google/fonts, ghi commit).
- Create: `brand/logos/<product>/…`: copy file logo có sẵn từ `Logos/` (không chỉnh màu), tên kebab-case.
- Create: `vendor/gsap/gsap.min.js` + `LICENSE` notice (gsap@3.14.2).
- Create: `brand/brand.css`: biến màu theo sản phẩm (`[data-product="sipos"]`…), font, thang chữ cho 1080×1920, safe zone, motion cơ bản.
- Create: `brand/frame.md`: design system theo chuẩn frame.md của HyperFrames (đọc `/hyperframes:hyperframes-creative`).
- Create: `brand/products.json`: tên, logo, màu, tagline, CTA, hashtag (từ profile + web; giá trị chưa có thì ghi `TBD` để Nam điền).
- Modify: `docs/decisions.md`: commit font, GSAP license + rủi ro tái dùng trong Webino.

## Tasks & Steps
- [ ] Đọc `hyperframes-creative` về `frame.md` / design spec trước khi viết.
- [ ] Viết brand.css chỉ chứa biến; template dùng `var(--…)`.

## Verification
- Render thử composition dùng font local (log không có "Fetched … from Google Fonts").
- `grep -E '#[0-9a-fA-F]{3,6}' templates/` rỗng (hex chỉ được phép nằm trong `brand/`).
