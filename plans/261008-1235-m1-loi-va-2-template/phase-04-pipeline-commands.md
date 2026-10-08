---
phase: 4
title: "Pipeline: new, build, preview, render, make"
status: completed
priority: P1
effort: "5h"
dependencies: [1, 3]
---

# Phase 4: Pipeline

## Goal
Các lệnh ở REQUIREMENTS §9 cho một brief.

## Files to Create / Modify
- Create: `scripts/new.ts`: copy `briefs/_example` → `briefs/<slug>/`.
- Create: `scripts/build.ts`: validate → resolve style → `props.json` (props template + preset phong cách + product + nhạc + logo) → stage `out/stage/<slug>/` → `hyperframes lint` + `check`.
- Modify: `scripts/preview.ts`: `pnpm preview <slug>` mở bản đã build. Giữ `_blank` khi không có slug.
- Create: `scripts/render.ts`:
  - stage → render `--variables-file --strict-variables`;
  - chuẩn hóa loudness (ffmpeg loudnorm 2 lượt, −14 LUFS, TP −1, copy video);
  - ffprobe kiểm §9.1;
  - ghi `cost.json` (thời gian render, nhạc);
  - kết quả ra `out/<slug>.mp4`.
- Create: `scripts/make.ts`: validate → build → render.
- Create: `scripts/lib/loudness.ts` + test với file nhạc test.

## Verification
- `pnpm make <fixture brief>`: ffprobe đúng spec; `ebur128` I ∈ [−15, −13], TP ≤ −1.
- Lỗi cố ý (brief thiếu field) → message tiếng Việt, exit 1.
- Không còn tiến trình preview chạy sau khi xong.
