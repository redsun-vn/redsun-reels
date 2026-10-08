---
phase: 1
title: "Hợp đồng dữ liệu + validate"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1: Hợp đồng dữ liệu

## Goal
Schema zod cho brief (frontmatter), script, props theo REQUIREMENTS §6.1–6.2, và `pnpm validate <slug>` báo lỗi tiếng Việt.

## Files to Create / Modify
- Modify: `package.json`: devDep `yaml` (exact), scripts `validate`, `new`, `build`, `preview`, `render`, `make`.
- Create: `config/brief.schema.ts`: product, videoType|auto, style?, occasion?, template, goal, audience, duration, tone, cta, music, assets.
- Create: `config/script.schema.ts`: concept, scenes (role, onScreenText ≤80, subText ≤120, visual, transition?, durationSec), hook, cta, music.
- Create: `scripts/lib/brief.ts`: đọc `briefs/<slug>/brief.md` (frontmatter + nội dung).
- Create: `scripts/lib/validate-video.ts`: kiểm brief, script và các quy tắc ở dưới. Mỗi lỗi kèm câu tiếng Việt + cách sửa.
- Create: `scripts/validate.ts`
- Create: `tests/validate.test.ts`

## Quy tắc validate
- Hook ≤ 40 ký tự/dòng, ≤ 2 dòng.
- Thứ tự `role` khớp loại video (cho phép lặp `repeatRole`).
- Mỗi cảnh `durationSec` ≥ `sceneDurationSec(...)`.
- Tổng thời lượng trong khoảng `minSec–maxSec` của loại và lệch `duration` ≤ 10%.
- Video ≤ 45 giây thì tối đa 2 cảnh `solution` (1–2 ý). Bỏ qua với loại có `repeatRole`.
- Asset tồn tại.
- Nhạc hợp lệ (`checkTrack` với purpose `production`, hoặc `test` khi `--test-music`).
- Template thuộc danh sách template của loại video.
- Text ở dạng NFC.

## Verification
- `pnpm test` gồm các ca: brief hợp lệ; hook 41 ký tự; role sai thứ tự; cảnh quá ngắn; tổng lệch > 10%; nhạc NC; asset thiếu.
