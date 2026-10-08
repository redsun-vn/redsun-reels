---
phase: 3
title: "CLAUDE.md, quyền, README, kiểm tra"
status: completed
priority: P1
effort: "3h"
dependencies: [1, 2]
---

# Phase 3

## Files
- Create: `CLAUDE.md` (REQUIREMENTS §11).
- Modify: `.claude/settings.json`: allowlist `./reel`, `bash scripts/cai-dat.sh`.
- Modify: `README.md`: phần MKT dùng skill thật.
- Modify: `docs/decisions.md`, `REQUIREMENTS.md` (nếu lệch).

## Verification
- `quick_validate.py` cho 2 skill.
- `claude -p` phiên mới (cwd = repo):
  - "cài đặt giúp tôi" → chạy `cai-dat.sh`, trả lời bằng tiếng Việt dễ hiểu;
  - "làm reel mẹo cho SIPOS về cảnh báo tồn kho thấp" → tạo brief, đưa 3 concept rồi DỪNG.
- Thử tiếp các lượt bằng `--resume`: chọn concept → kịch bản + bảng duyệt → "ok" → preview → "xuất" → MP4 + post.md.
