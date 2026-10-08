---
phase: 2
title: "S7 xác nhận lệnh CLI"
status: completed
priority: P1
effort: "1h"
dependencies: [1]
---

# Phase 2: S7 — lint / check / snapshot / doctor

## Goal
Xác nhận tên và hành vi thật của 4 lệnh mà REQUIREMENTS §6.4, §9, §13 dựa vào.

## Files to Create / Modify
- Create: `spike/s7/` (project từ `hyperframes init`)
- Create: `docs/spike-evidence/s7-cli.txt`

## Tasks & Steps
- [x] `pnpm exec hyperframes --help` và `--help` của `lint`, `check`, `snapshot`, `doctor`, `init`, `preview`, `render`, `add`, `models`.
- [x] `pnpm exec hyperframes init spike/s7` (dùng cờ non-interactive thật mà `--help` cho biết).
- [x] Chạy từng lệnh trên composition sạch, ghi exit code. Cố ý làm hỏng (xóa `data-duration`, thêm màu hex) rồi chạy lại, ghi exit code + thông điệp.
- [x] Kiểm `doctor` nhận FFmpeg khi đặt `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH` trỏ tới binary của `ffmpeg-static` / `ffprobe-static`.
- [x] Xác định ý nghĩa `HYPERFRAMES_NO_UPDATE_CHECK`, `HYPERFRAMES_NO_TELEMETRY` (từ `--help` hoặc docs đi kèm package).

## Verification
- Bảng trong `s7-cli.txt`: lệnh | tồn tại? | exit code khi đúng | exit code khi sai | ghi chú.
- Đạt khi cả 4 lệnh tồn tại và trả exit ≠0 khi composition sai. Ngược lại ghi Không đạt + lệnh thay thế.
