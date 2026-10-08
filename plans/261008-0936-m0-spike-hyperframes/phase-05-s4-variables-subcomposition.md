---
phase: 5
title: "S4 variables vs sinh HTML"
status: completed
priority: P2
effort: "3h"
dependencies: [2]
---

# Phase 5: S4 — phương án A (variables native) hay B (sinh HTML)

## Goal
Kết luận phương án §6.4 bằng prototype, theo 4 tiêu chí: text, đường dẫn asset, số cảnh động, timing.

## Files to Create / Modify
- Create: `spike/s4/` (prototype)
- Create: `docs/spike-evidence/s4.txt`

## Tasks & Steps
- [x] Đọc skill `/hyperframes:hyperframes-core` và docs đi kèm package về composition variables / sub-composition.
- [x] Prototype A: một composition nhận props; chạy 2 bộ props (3 cảnh và 5 cảnh; text, asset, duration khác nhau) mà không sửa HTML.
- [x] (Không cần — A đạt cả 4 tiêu chí) A hụt tiêu chí nào → ghi giới hạn (trích docs) và làm prototype B tối thiểu bằng JS thuần (string template; chưa thêm Eta/Handlebars) để chứng minh B khả thi.
- [x] Cả 2 bộ props: `lint`, `render`, `ffprobe` thời lượng khớp tổng duration ±0.2s.

## Verification
- Bảng tiêu chí × phương án (Đạt/Không) có trích dẫn.
- Kết luận A hoặc B + lý do. Nếu B: ghi có cần template engine (§3 `[TBD]`) không để Nam chốt.
