---
phase: 3
title: "S1 Intel + đo cài đặt bằng Claude Code"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 3: S1 — init → preview → render, và quy trình "Claude Code tự cài"

## Goal
Chứng minh trên macOS Intel: (a) `init` → `preview` → `render` ra MP4; (b) máy chỉ có Claude Code, MKT nói "cài đặt giúp tôi", có môi trường render được trong ≤30 phút, 0 lần nhập mật khẩu.

## Files to Create / Modify
- Create: `spike/s1/` (project test, HOME giả lập)
- Create: `docs/spike-evidence/s1-intel.txt`, `docs/spike-evidence/s1-intel.mp4` (≤5s)
- Create: `docs/spike-evidence/s1-install-runbook.md` (các bước Claude Code đã chạy, bản nháp cho skill `cai-dat` ở M2)

## Tasks & Steps
- [x] (a) Môi trường dev: `init` → `preview` (URL trả 200 với `curl -sI`) → `render` → `ffprobe` (1080×1920, 30fps, h264, yuv420p). Ghi exit code, thời gian. Ghi PID/port của preview để dừng sau.
- [x] Ghi kiến trúc binary: `uname -m`, `node -p process.arch`, `file` của ffmpeg-static và Chromium mà puppeteer tải.
- [x] (b) Giả lập máy MKT: `HOME` tạm (`spike/s1/fake-home`), `PATH=/usr/bin:/bin`, không có Node/pnpm/ffmpeg. Một phiên Claude Code mới (`claude -p`, cwd = bản copy sạch của repo) nhận câu "cài đặt giúp tôi" cùng runbook nháp. Đo tổng thời gian, đếm số lần cần người (duyệt quyền, mật khẩu), lỗi gặp phải.
- [x] Node trong (b): tải tarball chính thức `node-v22.<pin>-darwin-x64.tar.gz`, kiểm `SHASUMS256.txt`, giải nén vào `$HOME/.redsun-reels/node`. pnpm qua corepack. `pnpm install`. `pnpm exec hyperframes doctor`.
- [x] Apple Silicon: ghi "Chưa kiểm — chưa có máy M (Nam xác nhận 2026-10-08)", kèm checklist lệnh để chạy sau.

## Verification
- MP4 qua `ffprobe` đúng spec cơ bản.
- (b) xong ≤30 phút, 0 mật khẩu, MKT không phải tự gõ lệnh nào ngoài câu "cài đặt giúp tôi". Vượt → Không đạt + ghi nút thắt.
- Kết luận S1: Intel Đạt/Không đạt; arm64 Chưa kiểm. Go/No-go chỉ chốt trên nền tảng Nam đã duyệt.
