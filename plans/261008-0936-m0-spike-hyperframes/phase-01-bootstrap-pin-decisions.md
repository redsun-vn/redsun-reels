---
phase: 1
title: "Khởi tạo, pin version, decisions.md"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: Khởi tạo, pin version, decisions.md

## Goal
Có `package.json` pin HyperFrames, plugin đã cài (auto-update tắt) và `docs/decisions.md` ghi version + bảng lệch.

## Files to Create / Modify
- Create: `package.json` (`packageManager: pnpm@<ver>`; devDeps `hyperframes@0.8.141`, `ffmpeg-static`, `ffprobe-static`, tất cả exact version; `engines.node >=22`)
- Create: `.gitignore` (thư mục cài package, `.env`, `out/`, `spike/`, `briefs/*/audio/`)
- Create: `.env.example` (chỉ biến cấu hình; ghi chú "MVP không dùng API key")
- Create: `docs/decisions.md`
- Create: `docs/spike-evidence/00-baseline.txt`, `docs/spike-evidence/01-plugin.txt`

## Tasks & Steps
- [x] Ghi baseline: `shasum -a 256 REQUIREMENTS.md`, `uname -m`, `sw_vers`, `node -v`, `sysctl -n machdep.cpu.brand_string hw.memsize` vào `00-baseline.txt`.
- [x] `npm view hyperframes@0.8.141 version time.modified`; `npm view ffmpeg-static ffprobe-static version license`.
- [x] `corepack enable pnpm`; `pnpm install`; `pnpm exec hyperframes --version`.
- [x] Cài plugin: `claude plugin marketplace add heygen-com/hyperframes`; `claude plugin install hyperframes@hyperframes`. Lấy version/commit SHA từ `~/.claude/plugins/installed_plugins.json`. Kiểm `known_marketplaces.json` không bật auto-update; có cờ thì tắt. Ghi output vào `01-plugin.txt`.
- [x] Thử khai báo plugin ở scope project (`.claude/settings.json`: `enabledPlugins` / `extraKnownMarketplaces`) để MKT clone repo là có. Ghi kết quả vào decisions.md.
- [x] Viết `docs/decisions.md`: bảng version (CLI, plugin SHA, Node, pnpm, ffmpeg-static); lý do chọn từng công cụ cài (bảng "Chiến lược cài đặt" trong contract); bảng lệch REQUIREMENTS (mục | REQ nói | thực tế/docs | nguồn | hệ quả | "chờ Nam" hoặc "Nam đã chốt").

## Verification
- `pnpm exec hyperframes --version` in ra `0.8.141`.
- `installed_plugins.json` có `hyperframes@hyperframes`.
- `docs/decisions.md` có đủ các dòng lệch liệt kê ở Success Criteria của plan.
- `grep -E '"[\^~]' package.json` rỗng (không có version range).
