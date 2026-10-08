---
phase: 3
title: "Config loại video + phong cách"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 3: Config

## Goal
`config/video-types.ts` (20 loại) và `config/styles.ts` (19 phong cách) có kiểu chặt, zod validate, unit test.

## Files to Create / Modify
- Create: `config/styles.ts`: id, tên, mood, năng lượng, template hợp, trạng thái.
- Create: `config/video-types.ts`: id, tên, template, độ dài min/max, thứ tự role, góc hook, phong cách mặc định, phong cách gợi ý, phong cách nên tránh, mood nhạc.
- Create: `config/scene-timing.ts`: tham số công thức thời lượng (0.4 giây/từ, tối thiểu 1.5 giây, animation 0.5 giây) + hàm `sceneDurationSec(text)`.
- Create: `scripts/lib/resolve-style.ts`: chọn phong cách theo (style, videoType, occasion).
- Create: `tests/config.test.ts`.

## Verification
- `pnpm test` pass:
  - mọi `defaultStyle`, `suggested`, `avoid` đều là id có trong styles;
  - default không nằm trong avoid;
  - đủ 20 loại;
  - công thức thời lượng đúng ví dụ.
- `pnpm typecheck` pass.
