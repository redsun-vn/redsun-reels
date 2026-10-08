# Spike M0.1 — Báo cáo kết quả

Ngày: 2026-10-08. Máy: MacBook Intel i7-7700HQ (2017), 16 GB, macOS 15.5. HyperFrames CLI + plugin `0.8.141` (pin, xem `docs/decisions.md`).
Phạm vi do Nam chốt:
- Nền tảng đích là macOS Intel + Apple Silicon; Windows ngoài phạm vi.
- Không có API key nào.
- Claude Code tự cài cho MKT.
- Font Montserrat.

## Tóm tắt

| # | Kiểm tra | Kết luận | Bằng chứng chính |
|---|---|---|---|
| S1 | Cài + init → preview → render | **Đạt (Intel)** · Apple Silicon **Chưa kiểm** | `spike-evidence/s1-intel.txt`, `s1-intel.mp4`, `s1-install-runbook.md`, `s1b-claude-run.json` |
| S2 | Dấu tiếng Việt, font brand | **Đạt** | `spike-evidence/s2.txt`, `s2-snap/`, `s2-zoom/`, `s2.mp4` |
| S3 | Chọn TTS giọng nữ | **Không áp dụng nữa**: Nam bỏ lồng tiếng (decisions #20). Kết quả đo giữ làm tham khảo: chỉ 1 provider chạy được | `spike-evidence/s3.txt`, `spike-audio/` |
| S4 | Variables / sub-composition | **Phương án A** (variables native) | `spike-evidence/s4.txt`, `s4-*-strip.png` |
| S5 | Audio ducking | **Đạt (kỹ thuật)**, nhưng **không còn cần** vì không có giọng để duck. Chỉ còn cần fade + chuẩn hóa loudness nhạc | `spike-evidence/s5.txt`, `s5-carve.mp4` |
| S6 | Hiệu năng render 30 s | **Đạt (Intel)**: trung vị 2 phút 33 giây · Apple Silicon **Chưa kiểm** | `spike-evidence/s6.txt`, `s6-30s.mp4` |
| S7 | Lệnh CLI | **Đạt** | `spike-evidence/s7-cli.txt` |

**Go/No-go: GO trên macOS Intel.**
- S1 và S2 đều Đạt nên không cần quay lại Remotion.
- Apple Silicon chưa có số đo. Phải chạy runbook trên một MacBook M trước khi phát hành cho MKT dùng máy M.
- S3 và S5 không còn áp dụng sau khi Nam bỏ lồng tiếng (2026-10-08). Mọi video dùng nhạc nền + chữ.

Trong suốt spike, `REQUIREMENTS.md` không bị sửa: `shasum -a 256` trước và sau spike đều là `e5b300e514a288f46f62de091e89b4e7b57b3de180b5fadce64ccc22d3f72939`. Sau spike, Nam yêu cầu nâng lên **v0.4** (bản v0.3 lưu ở `docs/requirements-history/`).

## S1 — Cài + render trên máy MKT
Tiêu chí §15: `hyperframes init` → `preview` → `render` chạy được. Nam đổi đích sang macOS Intel + M thay cho Windows 11, đã ghi lệch ở decisions #4.
- Lệnh: `hyperframes init spike/s1 --example blank --resolution portrait --non-interactive` (2 s) → `preview --background --no-open --port 3002` (HTTP 200, sau đó `--stop`) → `render --quality draft` (exit 0).
- ffprobe: h264, 1080×1920, yuv420p, 30/1, 10.0 s.
- Claude Code tự cài: một phiên Claude Code mới nhận câu "Tôi là nhân viên marketing, không biết kỹ thuật. Cài đặt giúp tôi." Phiên chạy 8 lượt trong 125 s, 0 lần bị từ chối quyền, rồi báo MKT bằng tiếng Việt dễ hiểu.
- Đo riêng trong môi trường sạch:
  - Node v22.23.3 bằng tarball + SHASUMS: 24 s.
  - `pnpm install` lần đầu: 72 s.
  - Plugin bằng tarball tag: 46 s.
  - Ước tính máy trắng mất **~5–6 phút**, 0 lần nhập mật khẩu, không cần Homebrew, Xcode CLT hay git.
- Chưa đo: tải Chrome khi máy không có Chrome sẵn; số lần MKT phải bấm duyệt quyền ở chế độ tương tác. M2 cần allowlist quyền.
- Workaround cài plugin: lệnh README `claude plugin marketplace add heygen-com/hyperframes` lỗi clone 2/2 lần (decisions #3). Thay bằng tarball tag `v0.8.141` cài thành marketplace local. Cách này còn khóa luôn version.

## S2 — Dấu tiếng Việt
Tiêu chí: chuỗi §13 hiển thị đúng với font brand, ở text tĩnh và text có animation.
- Composition `lang="vi"`, text NFC. Gồm heading Montserrat 800 (tĩnh + fade), caption 13 từ hiện dần, lower third Italic, dòng đủ ă â đ ê ô ơ ư + 5 thanh + dấu chồng, và "SIPOS · REDSUN BOS · Webino".
- `lint` 0/0, `check` passed, `render` exit 0. Snapshot ở 0.3 / 3 / 5.9 s, có zoom ×3 caption lúc đang chạy animation. Soát bằng mắt: không lỗi dấu, không rơi về font fallback.
- HyperFrames tự tải Montserrat từ Google Fonts (lần đầu cần mạng). M0.2 nên copy font vào `brand/fonts/`.

> **Cập nhật 2026-10-08 (Nam): bỏ lồng tiếng, chỉ dùng nhạc nền.** Phần S3/S5 dưới đây giữ làm tham khảo. Không cần 3 MKT chấm mù, không cần chọn cách phát âm. Gói `spike-audio/` không còn dùng.

## S3 — Chọn TTS giọng nữ (nghe mù)
Tiêu chí: chọn được 1 provider chính + 1 fallback theo quy trình §15.
- Kịch bản cố định `spike-audio/script.txt` có đủ 6/6 yếu tố (`script-checklist.md`).
- Provider:
  - Google Chirp 3 HD, Gemini TTS, Azure HoaiMy: **không chạy được, không có API key**. Key cần có được liệt kê trong `s3.txt`.
  - media-use: không thử (Nam), vì giọng đi qua HeyGen; Kokoro không có tiếng Việt.
  - **VieNeu v3 Turbo** chạy được trên CPU. License Apache-2.0, dùng thương mại được, có watermark mặc định.
  - macOS Linh chỉ dùng làm mốc so sánh.
- Đo:
  - VieNeu: Trúc Ly sinh 21.5 s ra 25.9 s audio; Ngọc Huyền sinh 24.5 s ra 30.5 s audio. Không có timestamp từng từ. Chi phí 0 đ.
  - Linh: 3.4 s ra 39.4 s audio.
- Transcribe để lấy timestamp:
  - Parakeet từ chối `--language vi`.
  - Dùng `faster-whisper large-v3-turbo`: khớp từ 92.5 %, lệch timing trung vị ~95 ms ở đầu câu và ~44 ms ở cuối câu, có ngoại lai ~0.5 s. Chưa đạt chắc tiêu chí ≤100 ms của §14.3.
  - `hyperframes transcribe` import được file timestamp tạo ra.
- Gói nghe mù: `A.mp3`, `B.mp3`, `C.mp3` (đã chuẩn hóa −16 LUFS, tên xáo ngẫu nhiên, mapping giữ riêng) + `phieu-cham.md`. Các biến thể phát âm ở `phat-am/`.
- Điểm: **chờ ≥3 MKT**.
- Đề xuất tạm (**chờ Nam chốt**): chính là VieNeu, giọng nào điểm cao hơn; dự phòng là giọng VieNeu còn lại. Đây chưa phải fallback hạ tầng thật.
- Workaround:
  - Chế độ **không giọng đọc**: nhạc nền + chữ theo nhiều phong cách (Nam 2026-10-08). Danh mục 19 phong cách và 25 dịp ở `docs/video-style-catalog.md`.
  - Có key thì thêm azure-hoaimy làm fallback.

## S4 — Variables / sub-composition
Tiêu chí: kết luận phương án A hay B (§6.4).
- Một composition dùng `data-composition-variables` + `data-var-text` + `getVariables()`. Render bằng `--variables-file --strict-variables` với 2 bộ props, không sửa HTML: 3 cảnh ra 6.000 s, 5 cảnh ra 10.000 s, đúng kỳ vọng. Text, asset, số cảnh và timing đều Đạt.
- Hai điều kiện bắt buộc:
  - Root không được khai `data-duration`, vì thời lượng root bị khóa lúc compile.
  - Mảng phải truyền dưới dạng chuỗi JSON, vì không có kiểu mảng.
- **Chọn A.** Không cần template engine (Eta/Handlebars).

## S5 — Audio ducking
Tiêu chí: `/hyperframes-audio` hạ nhạc khi có voice và nghe tự nhiên.
- `carve.mjs --bed music --voice vo` (strength 0.8) ghi chain 6 dải + envelope mức.
- Nhạc trong đoạn voice: −46.6 dB, so với −26.9 dB khi không carve, tức **giảm 19.7 dB**. Nhạc tự hồi sau voice.
- Loudness mix −16.8 LUFS, peak −3.8 dBFS.
- Cần `@hyperframes/core` trong project (decisions #17).
- Phần nghe: chờ Nam/MKT so `s5-carve.mp4` với `s5-nocarve.mp4`.

## S6 — Hiệu năng
Tiêu chí: thời gian render 30 s 1080×1920 trên laptop văn phòng; ngưỡng §12 là ≤ 3 phút.
- Composition 6 cảnh, có caption animation, ảnh Ken Burns và nhạc.
- 3 lần đo sau warm-up: 117 / 164 / 153 s, **trung vị 153 s**. Máy 2017 nóng lên nên dao động lớn.
- `--workers 4`: 128 s; `--workers 6`: 162 s. Nên để `auto`.
- Workaround: dùng `--quality draft` khi xem thử.

## S7 — Lệnh CLI
- `lint` và `check` trả exit ≠0 khi composition sai, nên dùng được làm gate.
- `snapshot` chỉ chụp ảnh. `doctor` exit 0 kể cả khi thiếu thứ tùy chọn.
- Thêm: `validate`, `transcribe`, `normalize-audio`, `catalog` (392 block/component), `render --variables-file`/`--batch`.
- `lint` không bắt mã màu hex hay font-size px, nên brand lint (§13) phải tự viết.

## Phát hiện ảnh hưởng M0.2 / M1
1. Dùng `brand/fonts/` thay vì tải Google Fonts lúc render. GSAP cũng đang tải từ CDN; cân nhắc copy về local để render offline và ổn định (§1.4 deterministic).
2. Template: root không khai `data-duration`; props mảng truyền dạng chuỗi JSON; có biến `style` (enum) và chế độ không giọng đọc.
3. Pin thêm: `@hyperframes/core@0.8.141`, `pnpm@10.34.6`, `pnpm.onlyBuiltDependencies` cho ffmpeg-static. Ép bản dựng sẵn cho `numba`/`llvmlite` khi cài VieNeu.
4. Skill `cai-dat` (M2) dựa trên `spike-evidence/s1-install-runbook.md`, cùng allowlist quyền trong `.claude/settings.json`. Theo quy tắc của Nam, kiểm kê skill có sẵn trước (decisions mục 6).
5. Không lồng tiếng: thời lượng mỗi cảnh = số giây cố định do Claude tính từ độ dài chữ (Nam chốt). Không cần ASR, TTS hay Python trên máy MKT.

## Việc chờ người
- Có một MacBook chip M: chạy runbook S1 với `ARCH=arm64` và đo lại S6.

## Câu hỏi chưa giải quyết

Phần lớn câu hỏi đã được Nam chốt và đưa vào REQUIREMENTS v0.4 (§16). Còn mở:
1. Giá trị safe zone chính xác theo từng nền tảng.
2. Thư mục Drive lưu bằng chứng license nhạc.
3. Chạy S1/S6 trên MacBook Apple Silicon (Nam lo máy).
