---
phase: 9
title: "Spike report + Go/No-go"
status: completed
priority: P1
effort: "1.5h"
dependencies: [2, 3, 4, 5, 6, 7, 8]
---

# Phase 9: Spike report

## Goal
`docs/spike-report.md` gom kết luận S1–S7 + bằng chứng; Go/No-go rõ ràng; câu hỏi cho Nam ở cuối.

## Files to Create / Modify
- Create: `docs/spike-report.md`
- Modify: `docs/decisions.md` (bổ sung lệch phát hiện ở phase 2–8)

## Tasks & Steps
- [x] Mỗi mục: tiêu chí Đạt (trích §15) | Đạt / Không đạt / Chưa kiểm | lệnh đã chạy | số đo | artifact (link tương đối tới `docs/spike-evidence/`, `docs/spike-audio/`) | workaround nếu Không đạt.
- [x] Go/No-go: S1-Intel, S2 phải Đạt. Không đạt và không có workaround → ghi "DỪNG, báo Nam" (phương án Remotion).
- [x] `shasum -a 256 REQUIREMENTS.md` so với baseline Phase 1, ghi kết quả.
- [x] Danh sách việc chờ người: chấm mù 3 MKT, chạy arm64, Nam chốt provider / LUFS / cách đọc ERP-POS-URL.
- [x] Dọn tiến trình: dừng mọi `preview` server đã mở (kiểm bằng `lsof -i` theo port), xóa `spike/s1/fake-home` nếu lớn.

## Verification
- Mọi mục S1–S7 có kết luận + ít nhất 1 artifact, hoặc lý do "Chưa kiểm".
- Không còn tiến trình preview chạy nền.
- Mọi link trong report trỏ tới file có thật (kiểm bằng `ls`).
