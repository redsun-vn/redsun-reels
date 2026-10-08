---
phase: 5
title: "Brand lint, music lint, test tiếng Việt, render test"
status: completed
priority: P1
effort: "3h"
dependencies: [3, 4]
---

# Phase 5: Lint + test

## Files to Create / Modify
- Create: `scripts/lint-brand.ts` (`pnpm lint:brand`): quét `templates/**` + `brand/styles/**`, báo hex/rgb/hsl, `font-family` không dùng `var(`, `font-size` px không qua biến. Cho phép trong `brand/brand.css`.
- Create: `scripts/lint-music.ts` (`pnpm lint:music`): mọi track trong manifest đúng schema, file tồn tại, không "NC".
- Create: `scripts/render-test.ts` (`pnpm test:render`):
  - mỗi template × phong cách: stage fixture, `hyperframes snapshot --at 0,giữa,cuối`;
  - so với `tests/baseline/<template>-<style>/` bằng ffmpeg (PSNR/SSIM), ngưỡng trong config;
  - `--update` để ghi baseline.
- Create: `tests/lint-brand.test.ts`.

## Verification
- `pnpm lint:brand`, `pnpm lint:music`, `pnpm test`, `pnpm typecheck`, `pnpm test:render` pass.
- Chèn hex vào template → lint:brand exit 1.
