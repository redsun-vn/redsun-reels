---
phase: 7
title: "S3 TTS + transcribe + bộ nghe mù"
status: completed
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 7: S3 — chọn giọng nữ (không có API key)

## Goal
Sinh audio kịch bản cố định bằng mọi provider chạy được không cần key (VieNeu; macOS Linh làm mốc), đo đủ chỉ số §15, chuẩn bị gói chấm mù cho ≥3 MKT, và chọn đường transcribe tiếng Việt.

## Files to Create / Modify
- Create: `docs/spike-audio/script.txt` (kịch bản ở mục "Hệ quả cho Spike" của brand report, kèm checklist 6 yếu tố)
- Create: `docs/spike-audio/A.mp3`, `B.mp3`, …; `docs/spike-audio/phieu-cham.md`
- Create: `spike/s3-mapping.csv` (để ngoài thư mục người chấm), `spike/s3/` (venv, script)
- Create: `docs/spike-evidence/s3.txt`

## Tasks & Steps
- [x] Bảng provider §8.2 + trạng thái: google-chirp3hd, gemini-tts, azure-hoaimy = "Không chạy được — không có API key (Nam 2026-10-08)", kèm key cần có. media-use = "Không thử (Nam): cần HeyGen; Kokoro không có tiếng Việt".
- [x] VieNeu: cài `uv` vào `~/.local/bin` (không sudo); `uv venv` + cài VieNeu theo README repo gốc pnnbao97/VieNeu-TTS. Đọc model card, ghi license model/dataset (thiếu thì ghi "chưa xác nhận"). Chọn 1–2 giọng nữ có sẵn, không clone.
- [x] Bảng phát âm: thử 2–3 cách viết cho SIPOS / REDSUN / REDSUN BOS (đọc liền), ERP/POS (đánh vần), "sipos.vn" ("Xi-pốt chấm vê en"), "199.000đ", "30%". Giữ cách đọc đúng nhất cho từng provider. *Thực tế: đã sinh 3 biến thể ở `docs/spike-audio/phat-am/`; việc chọn chờ Nam nghe.*
- [x] macOS Linh: `say -v Linh -o … --file-format=WAVE`, chuyển sang mp3 bằng ffmpeg-static. SLA [VERIFY] → chỉ làm mốc.
- [x] Mỗi bản ghi: latency sinh 30s (`time`), thời lượng (`ffprobe`), có timestamp không, chi phí 200 video/tháng (0đ + thời gian máy), license, phải cài gì trên máy MKT.
- [x] Transcribe: `pnpm exec hyperframes models install parakeet`, transcribe 1 file tiếng Việt, so với kịch bản (tỉ lệ từ đúng). Không đạt → whisper.cpp không qua Homebrew (wheel dựng sẵn qua uv) *→ thực tế dùng faster-whisper vì whisper.cpp không có đường cài không-Homebrew*, `language=vi`. Đo lệch timing từng từ so với nghe tay ở 5 mốc *(thực tế: đo bằng silencedetect ở 11–12 ranh giới câu, chưa nghe tay)* (mục tiêu ≤100ms, §14.3).
- [x] Đổi tên ngẫu nhiên (`A.mp3`…), mapping ghi riêng, chuẩn hóa loudness như nhau (`loudnorm`). Phiếu chấm 1–5 × 3 tiêu chí (tự nhiên, đọc đúng tên/số, năng lượng reel).
- [x] ~~DỪNG: giao gói cho Nam/3 MKT~~ → hủy: Nam bỏ lồng tiếng 2026-10-08 (decisions #20), không cần chấm mù. Chưa có điểm thì ghi "Chờ ≥3 MKT"; không tự chấm.

## Verification
- `script.txt` đủ 6/6 yếu tố, đọc 27–32s.
- Mỗi provider có một dòng trong bảng (chạy được, hoặc lý do không chạy).
- Kết luận S3: chính + fallback "Chờ Nam chốt". Dự kiến Không đạt tiêu chí "1 chính + 1 fallback" → ghi workaround.
