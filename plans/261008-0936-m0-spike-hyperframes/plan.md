---
title: "M0.1 Spike HyperFrames + cài đặt do Claude Code thực hiện"
description: "Kiểm chứng S1–S7 của REQUIREMENTS §15 trên Mac Intel, pin HyperFrames, ghi Đạt/Không đạt + bằng chứng vào docs/spike-report.md."
status: completed
priority: P1
effort: 1.5d
tags: [infra, experimental]
blockedBy: []
blocks: []
created: 2026-10-08
---

# M0.1 Spike HyperFrames

## Overview
Kiểm chứng các giả định `[VERIFY]` trước khi code thật (REQUIREMENTS §15 M0.1). Contract đã chốt: `plans/reports/brainstorm-261008-1552-m0-spike-contract.md` (winner B + mọi quyết định của Nam ngày 2026-10-08). Thông tin thương hiệu: `plans/reports/brand-261008-1606-company-product-profiles.md`.

## Ràng buộc chính (từ contract)
- Không sửa `REQUIREMENTS.md`. Chứng minh bằng `shasum` trước/sau. Mọi lệch ghi vào `docs/decisions.md`.
- Pin `hyperframes@0.8.141`. Không bật auto-update plugin.
- Không có API key nào. TTS chỉ dùng VieNeu (provider) và macOS Linh (mốc so sánh).
- MKT không biết kỹ thuật: Claude Code tự cài; không sudo, không Homebrew, không trình cài GUI.
- Font Montserrat. SIPOS / REDSUN / REDSUN BOS đọc liền.
- Đích S1/S6: macOS Intel (máy này) + Apple Silicon ("Chưa kiểm", chưa có máy).
- Chấm mù S3 cần ≥3 MKT thật; không giả lập.

## Phases
| # | Phase | Phụ thuộc | Status |
|---|-------|-----------|--------|
| 1 | [Khởi tạo, pin version, decisions.md](./phase-01-bootstrap-pin-decisions.md) | – | Completed |
| 2 | [S7 xác nhận lệnh CLI](./phase-02-s7-cli-commands.md) | 1 | Completed |
| 3 | [S1 Intel + đo cài đặt bằng Claude Code](./phase-03-s1-install-render-intel.md) | 1 | Completed |
| 4 | [S2 dấu tiếng Việt với Montserrat](./phase-04-s2-vietnamese-diacritics.md) | 2, 3 | Completed |
| 5 | [S4 variables vs sinh HTML](./phase-05-s4-variables-subcomposition.md) | 2 | Completed |
| 6 | [S6 hiệu năng render](./phase-06-s6-render-performance.md) | 4 | Completed |
| 7 | [S3 TTS + transcribe + bộ nghe mù](./phase-07-s3-tts-blind-test.md) | 1 | Completed (S3 không còn áp dụng — bỏ lồng tiếng) |
| 8 | [S5 audio ducking](./phase-08-s5-audio-ducking.md) | 7 | Completed |
| 9 | [Spike report + Go/No-go](./phase-09-spike-report-go-no-go.md) | 2–8 | Completed |

## Success Criteria
- [x] `docs/spike-report.md` có S1–S7, mỗi mục Đạt / Không đạt / Chưa kiểm kèm lệnh, số đo, artifact.
- [x] `docs/decisions.md` có version CLI + plugin đã pin và bảng lệch, tối thiểu gồm: auto-update; namespace `/hyperframes:`; Windows→macOS; LUFS §8.3/§16; media-use = HeyGen/Kokoro; Gemini 2.5 TTS; BOS ≠ "ERP"; không có API key nên không còn fallback azure; `ffmpeg-static` ngoài §3; cài đặt do Claude Code thay cho README.
- [x] `shasum -a 256 REQUIREMENTS.md` trước = sau.
- [x] Go/No-go S1, S2 có kết luận rõ; S3–S7 Không đạt có workaround.
- [x] Gói chấm mù S3 đã làm; sau đó Nam bỏ lồng tiếng nên S3 không còn áp dụng.

## Thư mục làm việc
- `spike/`: các project HyperFrames thử nghiệm (đưa vào `.gitignore`, không phải code thật).
- `docs/spike-evidence/`: log, PNG, MP4 nhỏ dùng làm bằng chứng.
- `docs/spike-audio/`: kịch bản + file mù A/B/…; mapping để ngoài thư mục này (`spike/s3-mapping.csv`).

<!-- slug: m0-spike-hyperframes -->
