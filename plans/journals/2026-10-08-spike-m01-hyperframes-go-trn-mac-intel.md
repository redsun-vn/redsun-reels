---
title: "Spike M0.1 HyperFrames: GO trên Mac Intel"
date: 2026-10-08
summary: "S1/S2/S4/S5/S6/S7 Đạt trên Intel, S3 Không đạt vì không có API key; chờ 3 MKT chấm và máy chip M"
---

# Spike M0.1 HyperFrames: GO trên Mac Intel

## What happened
- Chạy 9 phase của plan 261008-0936-m0-spike-hyperframes trên MacBook Intel i7-7700HQ.
- Kết quả: S1 Intel Đạt (Claude Code tự cài ~5–6 phút, 0 mật khẩu), S2 Đạt (Montserrat), S4 chọn phương án A (variables native), S5 Đạt kỹ thuật (carve −19.7 dB), S6 Đạt (trung vị 153 s), S7 Đạt. S3 Không đạt: chỉ VieNeu chạy được.
- Sự cố đã gỡ:
  - `claude plugin marketplace add heygen-com/hyperframes` lỗi clone → dùng tarball tag v0.8.141.
  - pnpm 12 không chạy qua corepack → pin pnpm 10.
  - pnpm 10 chặn build script ffmpeg-static → khai onlyBuiltDependencies.
  - llvmlite 0.50 không có wheel cho Mac Intel → ép binary.
  - Parakeet từ chối tiếng Việt → faster-whisper.
  - PyAV cũ → decode audio bằng ffmpeg.
  - Root data-duration bị khóa lúc compile → bỏ ở root.
  - File HTML thừa trong project gây lint multiple_root_compositions.

## Decision
- GO trên macOS Intel; Apple Silicon chưa kiểm.
- Nam: không giọng thì dùng nhạc nền + nhiều phong cách → `docs/video-style-catalog.md` (19 phong cách, 25 dịp).
- Nam: kiểm kê skill có sẵn trước khi tạo skill mới (decisions mục 6).

## Next steps
- 3 MKT chấm A/B/C, Nam chốt giọng, LUFS, cách phát âm.
- Chạy runbook trên MacBook M.
- Sang M0.2 khi Nam duyệt.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
