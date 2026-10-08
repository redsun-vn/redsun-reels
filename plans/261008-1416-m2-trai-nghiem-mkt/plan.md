---
title: "M2 — Trải nghiệm MKT: skill cai-dat, tao-reel, CLAUDE.md"
description: "MKT chỉ cần nói chuyện với Claude Code: 'cài đặt giúp tôi', 'làm reel…'. Có script cài cố định, lệnh ./reel, skill tao-reel 8 bước, caption khi xuất."
status: in-progress
priority: P1
effort: 2d
tags: [feature]
blockedBy: []
blocks: []
created: 2026-10-08
---

# M2 — Trải nghiệm MKT

## Overview
REQUIREMENTS v0.4 §10, §11, §15 M2. Skill có sẵn đã kiểm kê (decisions mục 6): không skill nào thay được `cai-dat` / `tao-reel`. Hai skill này chỉ giữ quy trình Redsun và gọi lệnh của M1.

## Phases
| # | Phase | Status |
|---|-------|--------|
| 1 | [Script cài đặt + lệnh ./reel + skill cai-dat](./phase-01-install-skill.md) | Completed |
| 2 | [Lệnh hỗ trợ: info, post + skill tao-reel](./phase-02-tao-reel-skill.md) | Completed |
| 3 | [CLAUDE.md, quyền, README, kiểm tra bằng phiên Claude Code mới](./phase-03-claude-md-verify.md) | Completed |

## Success Criteria
- [x] `bash scripts/cai-dat.sh` chạy được nhiều lần (idempotent) trên máy chỉ có Claude Code: không sudo, không Homebrew, không git. Cuối cùng `./reel doctor` pass.
- [x] `./reel <lệnh>` chạy mọi lệnh pnpm của dự án, tự dùng Node trong `~/.redsun-reels`.
- [x] Skill `tao-reel` đi đủ 8 bước §10.2, có 3 điểm dừng chờ MKT (concept, kịch bản, xuất), chỉ sửa `briefs/<slug>/`, không gọi creation workflow của HyperFrames.
- [x] `./reel post <slug>` tạo `post.md` (caption + hashtag + credit nhạc).
- [x] `CLAUDE.md` đủ nội dung §11.
- [x] Skill qua `quick_validate.py`.
- [x] Phiên Claude Code mới (`claude -p`) làm đúng quy trình tới điểm dừng đầu tiên.
- [ ] **Done thật** theo §15: 1 người MKT tự làm 1 video, dev chỉ quan sát. Cần người, Claude không tự đánh dấu.
