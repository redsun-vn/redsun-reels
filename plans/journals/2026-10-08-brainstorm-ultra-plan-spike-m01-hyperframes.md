---
title: Brainstorm ultra + plan Spike M0.1 HyperFrames
date: 2026-10-08
summary: "Chốt contract Spike M0.1 (winner B, margin thấp) và plan 9 phase; Nam đổi đích sang macOS, không API key, Claude Code tự cài"
---

# Brainstorm ultra + plan Spike M0.1 HyperFrames

## What happened
- Brainstorm --ultra: 5 candidate, verifier chọn B 84/100 (A 83, C 83, E 82, D 70), margin thấp.
- Nam bổ sung trong phiên: MKT dùng MacBook Intel + chip M (bỏ Windows khỏi Spike); không cấp API key nào; MKT không biết kỹ thuật nhưng dùng Claude Code.
- Đọc 3 profile PDF + logo: font Montserrat (Nam chốt), SIPOS logo chuẩn Logo_green-01.png = teal #0B4B54 + đỏ #E30000, Redsun vector #BA0000/#EBAB32, Redsun BOS là dòng sản phẩm riêng, tự gọi "hệ điều hành doanh nghiệp" (không dùng từ ERP).

## Decision
- S3 chỉ VieNeu (provider) + macOS Linh (mốc); cloud TTS ghi "Không chạy được — không có key".
- Claude Code tự cài: Node tarball chính thức, corepack pnpm, ffmpeg-static + HYPERFRAMES_FFMPEG_PATH, uv cho Python; không sudo/Homebrew.
- SIPOS, REDSUN, REDSUN BOS đọc liền.

## Risks
- parakeet-tdt-0.6b-v3 không hỗ trợ tiếng Việt → nhiều khả năng phải dùng whisper.cpp.
- S3 sẽ Không đạt "1 chính + 1 fallback"; S1/S6 arm64 Chưa kiểm.
- Hook scout-block chặn lệnh Bash có chuỗi "node_modules" → viết file bằng Write tool.

## Next steps
- /ak:cook plans/261008-0936-m0-spike-hyperframes/plan.md
- Nam chọn 3 MKT chấm mù; duyệt kịch bản S3.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
