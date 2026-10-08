---
phase: 1
title: "Script cài đặt + ./reel + skill cai-dat"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 1

## Files
- Create: `scripts/cai-dat.sh`: bash thuần (máy MKT có thể chưa có Node). Các bước theo `docs/spike-evidence/s1-install-runbook.md`, dừng ngay khi có bước lỗi và báo bằng tiếng Việt.
  1. Kiểm máy.
  2. Cài Node v22.23.3 từ tarball chính thức, kiểm SHASUMS256.
  3. `corepack pnpm install --frozen-lockfile`.
  4. Cài plugin HyperFrames từ tarball tag v0.8.141 thành marketplace local, auto-update tắt.
  5. `hyperframes browser ensure`.
  6. Sinh nhạc thử.
  7. `./reel doctor` và render thử.
- Create: `reel` (bash, ở gốc repo): thêm `~/.redsun-reels/node/bin` vào PATH, `COREPACK_ENABLE_DOWNLOAD_PROMPT=0`, chạy `corepack pnpm <lệnh>`.
- Create: `.claude/skills/cai-dat/SKILL.md`.

## Verification
- Chạy `cai-dat.sh` 2 lần liên tiếp, trong môi trường `env -i` với `REDSUN_REELS_HOME` tạm: lần 2 bỏ qua các bước đã xong.
- `./reel doctor` exit 0.
