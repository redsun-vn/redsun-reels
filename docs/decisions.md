# Quyết định kỹ thuật — redsun-reels

Cập nhật: 2026-10-08 (Spike M0.1). Nguồn quyết định: REQUIREMENTS v0.3 và các quyết định của Nam ghi trong `plans/reports/brainstorm-261008-1552-m0-spike-contract.md`. File này **không** thay REQUIREMENTS. Chỗ nào lệch thì ghi ở bảng "Lệch so với REQUIREMENTS"; Nam là người cập nhật REQUIREMENTS.

## 1. Version đã pin

Không tự nâng version khi chưa hỏi (REQUIREMENTS §0).

| Thành phần | Version | Nơi pin | Bằng chứng |
|---|---|---|---|
| HyperFrames CLI | `0.8.141` | `package.json` devDependencies (exact) | `pnpm exec hyperframes --version` → `0.8.141` |
| Plugin HyperFrames (Claude Code) | `0.8.141`, commit `4a335aa6a1daf7bea766d9bbacc0cb6d43b1ad46` (tag `v0.8.141`) | `~/.claude/plugins/installed_plugins.json` | `docs/spike-evidence/01-plugin.txt` |
| pnpm | `10.34.6` | `package.json` → `packageManager` | `corepack pnpm --version` |
| ffmpeg-static | `5.3.0` (FFmpeg 6.1.1, binary evermeet.cx) | `package.json` | `ffmpeg -version` |
| ffprobe-static | `3.1.0` (ffprobe 4.0.2, có bản darwin x64 + arm64) | `package.json` | `ffprobe -version` |
| Node | ≥22 (`engines`). Máy dev đang chạy v24.10.0 | `package.json` | `00-baseline.txt` |

Ghi chú về pin:
- **pnpm 12 không dùng được.** `pnpm@12.10.1` (npm `latest`) đóng gói dạng native binary. Corepack 0.34 đi kèm Node báo `Cannot find module …/pnpm/12.10.1/bin/pnpm.cjs`. Vì vậy chọn dòng 10 (`latest-10`).
- **pnpm 10 chặn build script mặc định.** `ffmpeg-static` cần chạy `install.js` để tải binary, nên khai `pnpm.onlyBuiltDependencies: ["esbuild", "ffmpeg-static"]` trong `package.json`. Không khai thì cài xong vẫn không có ffmpeg.

## 2. Cài plugin HyperFrames

README chính thức (github.com/heygen-com/hyperframes, đọc 2026-10-08) hướng dẫn:
```
claude plugin marketplace add heygen-com/hyperframes
claude plugin install hyperframes@hyperframes
```
- **Kết quả trên máy dev: thất bại 2/2 lần.** Claude Code clone toàn bộ repo (~8.900 file, có cả media test) và báo `Clone succeeded, but checkout failed`, rồi xóa thư mục. Lần cài thứ hai báo `Plugin "hyperframes" not found in marketplace`. Log: `docs/spike-evidence/01-plugin.txt`.
- **Cách đang dùng** (vẫn là marketplace chính thức, chỉ khác nguồn tải):
  ```
  git clone --depth 1 --branch v0.8.141 --filter=blob:none --sparse https://github.com/heygen-com/hyperframes.git ~/.redsun-reels/hyperframes-marketplace
  git -C ~/.redsun-reels/hyperframes-marketplace sparse-checkout set skills .claude-plugin
  claude plugin marketplace add ~/.redsun-reels/hyperframes-marketplace
  claude plugin install hyperframes@hyperframes
  ```
  Tải 32 MB trong khoảng 7 giây. Plugin cài ra đúng `version 0.8.141`, `gitCommitSha 4a335aa…`.
- **Auto-update:** README khuyên bật auto-update cho marketplace. Ta **không bật** (REQUIREMENTS §3). Marketplace là thư mục local checkout đúng tag, nên không tự nhận bản mới. Muốn nâng version, dev checkout tag mới, chạy render test rồi mới phát hành cho MKT.
- **Scope project:** `claude plugin install hyperframes@hyperframes --scope project` ghi `.claude/settings.json` → `enabledPlugins`. Plugin được bật trong repo, nhưng mỗi máy vẫn phải có marketplace ở bước trên. Skill cài đặt `cai-dat` (M2) sẽ tự làm 4 lệnh này.
- **Tên lệnh skill có namespace:** `/hyperframes:hyperframes`, `/hyperframes:hyperframes-core`, `/hyperframes:hyperframes-audio`, `/hyperframes:media-use`… (REQUIREMENTS ghi `/hyperframes`, `/hyperframes-core`…).

## 3. Chiến lược cài đặt cho MKT

Nam (2026-10-08): MKT không biết kỹ thuật nhưng dùng Claude Code. Claude Code tự cài, MKT chỉ nói "cài đặt giúp tôi" và bấm duyệt quyền. Ưu tiên công cụ miễn phí. Không sudo, không Homebrew, không trình cài GUI, không tài khoản, không API key.

| Thành phần | Cách Claude Code cài | Lý do chọn |
|---|---|---|
| Node 22 | Tarball chính thức nodejs.org theo `uname -m`, kiểm `SHASUMS256.txt`, giải nén vào `~/.redsun-reels/node` | Không cần mật khẩu máy; chạy cho cả Intel lẫn chip M |
| pnpm | `corepack` có sẵn trong Node; version theo `packageManager` | Không cài thêm |
| FFmpeg / ffprobe | `ffmpeg-static` + `ffprobe-static` (devDependency). Script đặt `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH` (hai biến này có trong mã `hyperframes@0.8.141`) | Bỏ được Homebrew + Xcode CLT, là bước khó nhất cho MKT |
| Chromium | `hyperframes` tự tải qua `@puppeteer/browsers` | Không có bước thủ công |
| Plugin | 4 lệnh ở mục 2 | Pin đúng tag |
| Python (chỉ khi VieNeu được chọn) | `uv` (binary đơn trong `~/.local/bin`) tự quản Python + venv | Không cần Python hệ thống, không sudo |

## 4. Lệch so với REQUIREMENTS

Ghi lại, **không sửa REQUIREMENTS** (baseline `shasum -a 256 REQUIREMENTS.md` = `e5b300e5…2939`, xem `docs/spike-evidence/00-baseline.txt`).

| # | Mục REQ | REQ nói | Thực tế / tài liệu chính thức | Nguồn | Hệ quả | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | §3 | Không bật auto-update plugin trên máy MKT | README khuyên bật auto-update cho marketplace | README hyperframes | Giữ theo REQ: dùng marketplace local theo tag | Áp dụng |
| 2 | §0, §10, §11 | Skill `/hyperframes`, `/hyperframes-core`, `/hyperframes-audio`, `/media-use` | Plugin dùng namespace: `/hyperframes:hyperframes`, `/hyperframes:media-use`… | README; plugin đã cài | `CLAUDE.md` và skill `tao-reel` phải dùng tên có namespace | Đã đưa vào REQUIREMENTS v0.4 §0 |
| 3 | §0 | Cài plugin theo lệnh ở README | Lệnh README lỗi khi clone trên máy dev; dùng sparse clone đúng tag | `01-plugin.txt` | Skill `cai-dat` dùng cách ở mục 2 | Áp dụng |
| 4 | §3, S1, §14.1 | Windows 11 + macOS; cài ≤30 phút trên Windows | MKT dùng MacBook Intel + chip M; README không nêu hỗ trợ Windows | Nam 2026-10-08; README | S1/S6 đo trên macOS Intel; chip M "Chưa kiểm" (chưa có máy) | Nam đã chốt |
| 5 | §3 | Chỉ thêm dependency có trong danh sách | Thêm `ffmpeg-static`, `ffprobe-static`; `uv` + VieNeu cho Spike | Mục 3 | Bỏ được Homebrew. Binary FFmpeg là GPL (dùng nội bộ, không phân phối) | Nam ủy quyền chọn công cụ cài |
| 6 | M2 | README tiếng Việt hướng dẫn MKT cài Node, FFmpeg, pnpm | Claude Code tự cài qua skill `cai-dat`; README chỉ còn bước "mở Claude Code, nói cài đặt" | Nam 2026-10-08 | M2 thêm skill `cai-dat` | Nam đã chốt |
| 7 | §8.3 vs §16 Q5 | Voice chuẩn hóa `-16 LUFS` (§8.3) / mục tiêu loudness mặc định `-14 LUFS` (§16) | Hai mặc định khác nhau trong cùng tài liệu | REQUIREMENTS | Cần Nam chốt | Nam chốt −14 LUFS |
| 8 | §8.2, §16 Q2, §8.3 | Ứng viên cloud TTS; fallback mặc định `azure-hoaimy`; M1 cài azure làm fallback | Không có API key nào | Nam 2026-10-08 | Google/Gemini/Azure không chạy được; không còn fallback mặc định | Nam đã chốt "không key" |
| 9 | §8.2 | `gemini-tts` = Gemini 2.5 Flash TTS | Trang Models: 2.5 TTS chỉ mở cho người đã từng dùng; khuyên project mới dùng model TTS mới hơn | ai.google.dev/gemini-api/docs/models | Nếu sau này có key thì chọn model TTS hiện hành | Ghi nhận |
| 10 | §8.2 | `media-use` TTS `[VERIFY]` | media-use voice = HeyGen (cần heygen CLI + OAuth hoặc `HEYGEN_API_KEY`) hoặc Kokoro (không có giọng tiếng Việt) | `skills/media-use/SKILL.md`, `references/setup-providers.md`; Kokoro VOICES.md | Không thử trong Spike (Nam) | Nam đã chốt |
| 11 | §3 | Transcribe fallback qua `/media-use` | Engine bên dưới là Parakeet (`parakeet-tdt-0.6b-v3`: 25 ngôn ngữ châu Âu, không có tiếng Việt) hoặc whisper.cpp (media-use build qua Homebrew) | setup-providers.md; model card NVIDIA | Spike test Parakeet tiếng Việt; không đạt thì whisper.cpp không qua Homebrew | Đang kiểm (Phase 7) |
| 12 | §1.1 | "Redsun BOS (ERP)" | Trang chính thức gọi BOS là "hệ điều hành doanh nghiệp", không dùng từ ERP | redsun.vn/phan-mem-van-hanh-doanh-nghiep-redsun-bos | Từ "ERP" trong kịch bản S3 chỉ để thử phát âm | Ghi nhận |
| 13 | §8.2 | `vieneu` = VieNeu-TTS v2, self-host; license chưa rõ | v2 đã ngừng phát triển; bản hiện tại v3 Turbo (`pnnbao-ump/VieNeu-TTS-v3-Turbo`, ONNX, chạy CPU, không cần torch, 48 kHz). Model card: Apache-2.0 cho weights + giọng preset; audio sinh ra **được dùng thương mại**. Mặc định chèn watermark audio (`apply_watermark=True`) | github.com/pnnbao97/VieNeu-TTS; huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo | Dùng v3 Turbo. Dataset gated, quy trình thu thập không công bố | Ghi nhận |
| 14 | §3 | Không thêm dependency ngoài danh sách | `pip install vieneu` kéo `numba`/`llvmlite` mới nhất. llvmlite 0.50 không có wheel cho Mac Intel nên phải build và lỗi. Khi ép `--only-binary llvmlite,numba` thì resolver chọn numba 0.62.1 / llvmlite 0.45.1, cài được. venv nặng 649 MB | Spike Phase 7 | Skill `cai-dat` phải pin hoặc ép binary cho 2 gói này | Áp dụng |
| 15 | §3 | Transcribe fallback: whisper.cpp | Parakeet bị từ chối thẳng: "Parakeet does not transcribe --language vi". whisper.cpp qua hyperframes cần Homebrew hoặc git+cmake. Thay bằng `faster-whisper` (wheel dựng sẵn, cùng họ model Whisper), xuất `transcript.json` dạng `[{text,start,end}]` để hyperframes import | `hyperframes transcribe`; Spike Phase 7 | Dùng faster-whisper thay whisper.cpp | Không còn áp dụng (xem #20) |
| 16 | §2.2, §7, §8 | Voice-over tiếng Việt bằng TTS là mặc định của mọi template | Nam (2026-10-08): "Nếu không có voice thỏa mãn, làm nhạc nền cũng được, nhưng video hiệu ứng phải theo nhiều phong cách" | Nam | Template phải chạy được ở chế độ **chỉ nhạc nền + chữ/caption** khi không có giọng; thêm biến `style` cho nhiều phong cách (xem `docs/video-style-catalog.md`) | Nam đã chốt |
| 17 | §3 | Dependency theo danh sách | `carve.mjs` (voiceover carve của /hyperframes-audio) cần `@hyperframes/core` cài trong project và `ffmpeg` trong PATH | hyperframes-audio/scripts/carve.mjs | M1 thêm `@hyperframes/core@0.8.141` (pin cùng CLI) vào devDependencies; script tự thêm thư mục ffmpeg-static vào PATH khi chạy carve | Không còn áp dụng (xem #20) |
| 18 | §6.1, §2.2, §7 | Brief có `template`; MVP 5 template | Nam (2026-10-08): "làm phù hợp với các loại video" → đề xuất thêm `videoType` + `style` (MKT tự chọn, mỗi loại có mặc định — Nam 2026-10-08) + `occasion` vào brief; 20 loại video, 15 loại chạy trên 5 template, 5 loại cần template mới | `docs/video-type-guide.md`, `docs/video-style-catalog.md` | Đổi schema brief §6.1; template mới là mở rộng phạm vi | Nam đã duyệt (v0.4 §7) |
| 19 | §12, §16 Q3 | Chỉ dùng nhạc có license, manifest ghi nguồn + license | `hyperframes doctor` gợi ý MusicGen làm "local music fallback", nhưng weights MusicGen là CC-BY-NC (không thương mại). Đề xuất nguồn: `docs/music-sources.md` | Replicate MusicGen readme; doctor output | Không cài MusicGen; Pixabay Music chính + Mixkit phụ, manifest có trường license/evidence; chỉ đăng organic | Nam đã chốt |
| 20 | §1.2, §2.2, §6.2, §7, §8, §9, §13, §14.3, §15 S3/S5, M1 | Voice-over tiếng Việt bằng TTS + caption word-level khớp giọng; TTS provider + cache + transcribe; lệnh `pnpm tts`; tiêu chí voice-caption ≤100 ms | Nam (2026-10-08): "nên loại bỏ lồng tiếng, thay bằng nhạc". Mọi video chỉ dùng nhạc nền + chữ trên màn hình (onScreenText/caption theo nhịp). Clip quay thật có tiếng người giữ âm thanh gốc (không phải lồng tiếng) | Nam | Bỏ khỏi phạm vi: TTS, VieNeu, transcribe (faster-whisper), voiceover carve (`@hyperframes/core`), bảng phát âm, chấm mù S3. Timing cảnh = số giây cố định do Claude tính từ độ dài chữ (Nam 2026-10-08). Máy MKT nhẹ hơn: không cần Python/uv (~650 MB). Thay #15, #16, #17 | Nam đã chốt — đã đưa vào REQUIREMENTS v0.4 |

## 5. Thương hiệu (cho M0.2)

| Thương hiệu | Màu chính | Màu nhấn / phụ | Nguồn |
|---|---|---|---|
| SIPOS | `#0B4B54` | `#E30000` | `Logos/Sipos_Logo/Logo_green-01.png` (bản chuẩn, Nam chốt) + `Sipos_logo.pdf` |
| Redsun | `#BA0000` | `#EBAB32`, xám `#58595B` | `Logos/Redsun_Logo/Redsun_logo.pdf` |
| Webino | `#00B2DB` | tím `#5B1A9A` | `Logos/Webino_Logo/Logo.png` (Nam chốt: lấy từ logo) |
| Redsun BOS | `#D1262D` | mận `#3D0023`, vàng `#EAAE2D`, xanh `#44649B` | `Logos/REDSUN BOS_Logo/*.png` (Nam chốt: lấy từ logo) |

- Font: **Montserrat** cho mọi thương hiệu (Nam chốt 2026-10-08; Google Fonts, SIL OFL, có tiếng Việt).
- Phát âm: SIPOS, REDSUN, REDSUN BOS **đọc liền**. ERP/POS mặc định đánh vần; "sipos.vn" đọc "Xi-pốt chấm vê en" (chờ Nam xác nhận).

## 6. Quy tắc: kiểm kê skill có sẵn trước khi tạo skill mới

Nam (2026-10-08): Claude phải kiểm tra các bộ skill đã cài trước khi tạo thêm skill. Quy tắc này sẽ được đưa vào `CLAUDE.md` của dự án ở M2.

Cách làm:
1. Liệt kê skill đã cài cùng mô tả của chúng. Gồm: plugin HyperFrames (`~/.claude/plugins/cache/hyperframes/hyperframes/<ver>/skills/*/SKILL.md`), skill trong `.claude/skills/` của dự án, và skill cấp user.
2. Ghi vào bảng dưới đây: skill nào đã đáp ứng phần việc nào, và vì sao vẫn cần skill mới.
3. Skill mới chỉ giữ phần quy trình riêng của Redsun. Kiến thức HyperFrames thì trỏ sang skill của plugin, không chép lại.

Kiểm kê lần đầu (plugin HyperFrames 0.8.141, 21 skill) cho 2 skill dự kiến:

| Skill dự kiến | Skill có sẵn liên quan | Đáp ứng được gì | Vì sao vẫn cần skill riêng |
|---|---|---|---|
| `cai-dat` (M2) | `/hyperframes:hyperframes-cli` (doctor, browser, init, render…) | Cách dùng CLI, chẩn đoán | Không có skill nào cài Node/pnpm/plugin theo nguyên tắc "không sudo, không Homebrew, đúng tag". `doctor` còn gợi ý `brew install whisper-cpp`. `cai-dat` gọi lệnh CLI theo `hyperframes-cli`, chỉ thêm phần bootstrap |
| `tao-reel` (M2) | `/hyperframes:hyperframes` (router), `-core`, `-audio`, `-creative`, `-registry`, `media-use`, `embedded-captions`, `product-launch-video` | Viết composition, mix audio, caption, block | Các creation workflow (`product-launch-video`, `general-video`…) tự viết composition mới, trái nguyên tắc template-first (§10). `tao-reel` giữ quy trình brief → script → duyệt → tts → build → render và trỏ sang `-core` / `-audio` khi dev sửa template |

## 7. REQUIREMENTS v0.4 (2026-10-08)

Nam yêu cầu cập nhật REQUIREMENTS sau Spike. Bản v0.3 được lưu ở `docs/requirements-history/REQUIREMENTS-v0.3.md` (sha256 `e5b300e5…2939`).

v0.4 đưa vào các quyết định **Nam đã chốt**:
- #4 macOS: Intel + Apple Silicon.
- #6 Claude Code tự cài.
- #8 không có API key.
- #16 + #20 bỏ lồng tiếng, chỉ dùng nhạc nền.
- #19 nhạc: Pixabay Music + Mixkit, chỉ đăng organic.
- Phương án A (S4).
- Font Montserrat, màu SIPOS / Redsun.
- Phong cách: MKT tự chọn, mỗi loại video có mặc định.
- Thời lượng cảnh tính từ độ dài chữ.
- Tên skill có namespace, quy tắc kiểm kê skill có sẵn, pin version.

Các mục vẫn để `[TBD]` trong v0.4 và §16 của REQUIREMENTS:
- LUFS.
- Màu Webino / BOS.
- 3 phong cách chờ duyệt.
- 5 loại video cần template mới.
- Tham số thời lượng cảnh.
- Safe zone.
- Apple Silicon `[VERIFY]`.

Từ bản này trở đi, các dòng lệch #1–#20 ở mục 4 coi như đã hấp thụ vào REQUIREMENTS. Chỉ còn mở các mục `[TBD]` nói trên.

### Chốt thêm cùng ngày (Nam trả lời §16 v0.4)
- Màu lấy từ logo; logo dùng thẳng file có sẵn, gradient chỉ nằm trong logo.
- Dùng cả 19 phong cách.
- Loudness −14 LUFS để hợp với mọi nền tảng.
- Công thức thời lượng cảnh: 0.4 giây/từ, tối thiểu 1.5 giây, animation vào 0.5 giây.
- Làm 3 template M4 cho 5 loại video còn lại.
- Nam là dev maintainer, người duy nhất được nâng version, người giữ bằng chứng license nhạc, người lo máy Apple Silicon.

### Quy trình kịch bản (Nam đồng ý 2026-10-08, REQUIREMENTS v0.4 §6.2, §10.2)
- Concept 3 hướng hook.
- Vai trò cảnh (role).
- Bảng duyệt 2 cột có chuyển cảnh.
- Claude tự chấm ≥ 85/100.
- Danh sách cần quay/chụp.
- Video ≤ 45 giây chỉ 1–2 ý; hook ≤ 40 ký tự/dòng.
- Caption + hashtag khi xuất.

Nguồn tham khảo:
- Bài claude.vn "Claude viết kịch bản video và quảng cáo từ concept đến shooting script" (không phải trang chính thức của Anthropic).
- Repo charlie947/social-media-skills (MIT), skill `reels-scripting`, `hook-generator`. **Không cài** repo này vì cần API key Apify/Gemini, viết cho video có lời thoại tiếng Anh, thiên về LinkedIn. Chỉ mượn ý.
