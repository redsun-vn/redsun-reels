---
phase: 8
title: "S5 audio ducking"
status: completed
priority: P2
effort: "1.5h"
dependencies: [7]
---

# Phase 8: S5 — nhạc tự hạ khi có giọng đọc

## Goal
Dùng cơ chế voiceover carve/ducking của `/hyperframes:hyperframes-audio`, chứng minh bằng số đo rằng nhạc hạ khi có voice.

## Files to Create / Modify
- Create: `spike/s5/` (composition: voice VieNeu từ Phase 7 + 1 track nhạc không lời có license rõ, ví dụ CC0, ghi nguồn *(thực tế: pad tổng hợp bằng ffmpeg, không cần license)*; fade in/out 0.5s)
- Create: `docs/spike-evidence/s5.mp4`, `docs/spike-evidence/s5.txt`

## Tasks & Steps
- [x] Đọc skill audio, dựng composition theo cách framework khuyến nghị.
- [x] Render; đo `ffmpeg -af ebur128` và `astats` trên đoạn có voice và đoạn không voice (theo timing).
- [x] Ghi mức chênh dB, có bị bơm/giật không (dev nghe). *Thực tế: Claude không nghe được; chỉ có số đo, phần nghe chuyển cho Nam/MKT.* Phần "nghe tự nhiên": chờ Nam/MKT.
- [x] Đo loudness tổng (integrated, true peak) so với §9.1; ghi mâu thuẫn −14/−16 LUFS chờ Nam chốt.

## Verification
- Nhạc trong đoạn voice thấp hơn ngoài đoạn ≥6 dB (ngưỡng đề xuất, chờ Nam) → Đạt kỹ thuật; phần "tự nhiên" chờ người nghe.
