---
phase: 6
title: "S6 hiệu năng render"
status: completed
priority: P2
effort: "1.5h"
dependencies: [4]
---

# Phase 6: S6 — thời gian render 30s 1080×1920

## Goal
Có thời gian render trung vị cho video 30s trên Intel i7-7700HQ/16GB, so với ngưỡng §12 (≤3 phút).

## Files to Create / Modify
- Create: `spike/s6/` (composition 30s: 6 cảnh, caption animation, ảnh nền, 1 track audio)
- Create: `docs/spike-evidence/s6.txt`

## Tasks & Steps
- [x] Dựng composition 30s đại diện, dựa trên S2 (Montserrat, caption animation, chuyển cảnh).
- [x] 1 lần warm-up, rồi `/usr/bin/time -l pnpm exec hyperframes render …` 3 lần; ghi thời gian thực, RAM tối đa.
- [x] `ffprobe` output: thời lượng, fps, codec, dung lượng.
- [x] Thử tùy chọn tăng tốc mà `render --help` có (số worker, chất lượng), ghi lại.
- [x] Apple Silicon: "Chưa kiểm".

## Verification
- Trung vị ≤3 phút → Đạt (Intel). Lớn hơn → Không đạt + workaround (tùy chọn render, giảm độ phức tạp).
