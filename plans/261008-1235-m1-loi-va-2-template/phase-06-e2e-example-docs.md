---
phase: 6
title: "Brief mẫu đầu-cuối + docs"
status: completed
priority: P1
effort: "3h"
dependencies: [4, 5]
---

# Phase 6: Brief mẫu + docs

## Files to Create / Modify
- Create: `briefs/_example/` (brief.md, concepts.md, script.json): SIPOS kiểm kho, loại `ra-mat-tinh-nang`, FeatureLaunch, `toi-gian`.
- Create: `tests/fixtures/briefs/<loai>/` cho 7 loại (1, 2, 3, 4, 14, 15, 18), mỗi loại 1 brief + script.
- Create: `scripts/make-all-fixtures.ts` (`pnpm test:e2e`).
- Modify: `docs/decisions.md` (sub-composition → kit, yaml, loudnorm, block registry đã dùng), `REQUIREMENTS.md` (sửa tiêu chí M1 "loại 1–5" thành các loại FL/TIP).

## Verification
- `pnpm make _example` đạt §9.1. `pnpm test:e2e` ra 7 MP4.
- Đo thời gian make `_example` (mục tiêu sửa 1 câu → build + render lại ≤ 5 phút, §12).
- Commit + push.
