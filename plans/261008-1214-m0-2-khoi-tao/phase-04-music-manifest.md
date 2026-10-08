---
phase: 4
title: "Nhạc: manifest + schema"
status: pending
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 4: Manifest nhạc

## Goal
`brand/music/manifest.json` + schema zod theo REQUIREMENTS §8.2. Có 1 track test do repo sinh để preview chạy được.

## Files to Create / Modify
- Create: `config/music-manifest.schema.ts` (zod) + hàm validate: chặn license chứa "NC", thiếu `sourceUrl`, `blocked`.
- Create: `brand/music/manifest.json`: 1 track `test-pad-01` (sinh bằng ffmpeg trong repo, `source: "generated-in-repo"`, `allowedUse: ["internal-test"]`).
- Create: `scripts/gen-test-music.ts` để tái tạo track test (không commit file mp3 nếu đã có script).
- Create: `tests/music-manifest.test.ts`.

## Verification
- Test pass: track test hợp lệ cho preview; track "CC BY-NC" bị chặn; track `internal-test` bị chặn khi dùng cho video thật (`purpose: "production"`).
