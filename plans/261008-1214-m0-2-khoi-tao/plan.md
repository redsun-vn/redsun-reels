---
title: "M0.2 Khởi tạo repo theo REQUIREMENTS v0.4"
description: "Scaffold repo, brand system (Montserrat local, màu từ logo), GSAP local, config loại video/phong cách, manifest nhạc, pnpm doctor + preview composition trống."
status: completed
priority: P1
effort: 1d
tags: [infra, feature]
blockedBy: []
blocks: []
created: 2026-10-08
---

# M0.2 Khởi tạo

## Overview
Thực hiện REQUIREMENTS v0.4 §15 M0.2. Phần Apple Silicon để sau (Nam). Nhạc thật do Nam chọn từ Pixabay Music + Mixkit. Trong M0.2, manifest chỉ có 1 track test do repo tự sinh, ghi rõ `allowedUse: ["internal-test"]`, không dùng cho video thật.

**Done khi (§15):** `pnpm preview` mở được composition trống 1080×1920, có font Montserrat local, safe zone debug và một track nhạc từ manifest.

## Phases
| # | Phase | Phụ thuộc | Status |
|---|-------|-----------|--------|
| 1 | [Scaffold + dependency + TypeScript](./phase-01-scaffold-deps.md) | – | Completed |
| 2 | [Brand: fonts, logos, GSAP local, frame.md, brand.css, products.json](./phase-02-brand-system.md) | 1 | Completed |
| 3 | [Config loại video + phong cách](./phase-03-config-video-types-styles.md) | 1 | Completed |
| 4 | [Nhạc: manifest + schema + track test](./phase-04-music-manifest.md) | 1 | Completed |
| 5 | [doctor + preview composition trống + kiểm tra](./phase-05-doctor-preview-verify.md) | 2, 3, 4 | Completed |

## Success Criteria
- [x] Thư mục đúng REQUIREMENTS §4 (phần thuộc M0.2).
- [x] `brand.css` có đủ biến màu theo §5.3, font, thang chữ, safe zone. Không có hex trong template.
- [x] Montserrat và GSAP chạy local; render không tải Google Fonts hoặc CDN.
- [x] `config/video-types.ts` (20 loại) và `config/styles.ts` (19 phong cách) khớp `docs/video-type-guide.md`, có zod validate + unit test.
- [x] `brand/music/manifest.json` có schema zod; validate chặn license "NC".
- [x] `pnpm doctor` pass; `pnpm preview` mở composition trống; `hyperframes lint` + `check` pass; render thử ra MP4 1080×1920.
