---
title: "M2 xong: MKT làm video qua Claude Code"
date: 2026-10-08
summary: Skill cai-dat + tao-reel chạy đủ quy trình trong phiên Claude Code mới; còn chờ MKT thử thật
---

# M2 xong: MKT làm video qua Claude Code

## What happened
- Làm script cài đặt cố định, lệnh ./reel, skill cai-dat và tao-reel, lệnh info/post, CLAUDE.md.
- Thử bằng phiên `claude -p` mới. Ba lần đầu Claude bỏ qua skill hoặc skill nạp lỗi, và Claude bịa số liệu ("37%", "dùng thử miễn phí").

## Root cause
- SKILL.md có chuỗi dấu chấm than liền backtick. Claude Code hiểu đó là lệnh shell khi nạp skill, nên skill nạp lỗi.
- CLAUDE.md chưa bắt buộc gọi skill.

## Fix
- Bỏ chuỗi đó khỏi SKILL.md; CLAUDE.md bắt buộc gọi skill; skill thêm quy tắc chống bịa (CTA mặc định, góc con số chỉ khi có số thật).
- Sau khi sửa: đi đủ brief → concept → kịch bản → xem thử → MP4 + caption.

## Next steps
- 1 bạn MKT tự làm 1 video (tiêu chí done của M2).
- Nam chọn nhạc thật; thử trên Mac chip M; M3.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
