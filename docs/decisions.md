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

## 8. M0.2 — khởi tạo (2026-10-08)
- **Font**: Montserrat variable (wght 100–900) + italic, lấy từ `google/fonts` commit `8b0a1d0f5983c89bc2b93f1b5fb55f9e252744b5` (`ofl/montserrat`), license SIL OFL 1.1. Đã kiểm bằng fontkit: không thiếu glyph nào trong chuỗi test tiếng Việt (§13) và bộ dấu chồng. File ở `brand/fonts/`, đổi tên thành `montserrat-variable.ttf` / `montserrat-italic-variable.ttf` để dùng trong CSS.
- **GSAP**: `gsap@3.14.2`, copy `dist/gsap.min.js` vào `runtime/gsap/`. License "Standard no charge": miễn phí, kể cả thương mại. Dùng nội bộ làm video marketing là được phép.
  - **Rủi ro**: license cấm dùng trong công cụ dựng animation trực quan cạnh tranh với Webflow. Nếu sau này tái dùng tầng render trong **Webino** (AI website builder) hoặc một visual builder khác, phải xin GSAP/Webflow đồng ý bằng văn bản. Nguồn: gsap.com/standard-license, webflow.com/blog/gsap-becomes-free.
  - Thư mục tên `runtime/` thay cho `vendor/` (REQUIREMENTS §4), vì hook trên máy dev chặn chữ `vendor`.
- **Logo**: copy nguyên file từ `Logos/` vào `brand/logos/<sản phẩm>/` (tên kebab-case). Riêng `Sipos_logo.pdf` và `Redsun_logo.pdf` chỉ đổi định dạng sang SVG bằng `pdftocairo -svg`, giữ nguyên màu. Logo BOS:
  - bản chữ trắng `bos-logo-nen-toi.png` dùng trên nền tối;
  - bản chữ xanh đậm `#0C4559` `bos-logo-nen-sang.png` dùng trên nền sáng.

  Thư mục `Logos/` gốc và 3 file profile PDF không đưa lên git.
- **Sản phẩm `redsun`**: thêm vào enum `product` cho video công ty (giới thiệu công ty, tuyển dụng).
- **products.json**: CTA và hashtag mặc định là đề xuất, `reviewed: false`, chờ Nam duyệt. CTA không nhắc ưu đãi chưa xác minh (ví dụ "dùng thử 14 ngày" trong brief mẫu §6.1 chưa có nguồn).
- **TypeScript**: chạy `.ts` trực tiếp bằng type stripping của Node (đã kiểm trên v22.23.3), nên không cần thêm `tsx`. Tooling pin: typescript 7.0.2, zod 4.6.5, vitest 5.0.3, @types/node 22.20.5.
- **Stage project trước khi preview/render**: HyperFrames không đọc asset ngoài thư mục project (lint `invalid_parent_traversal_in_asset_path`, font 404 khi dùng `../../brand/`). `scripts/lib/stage-project.ts` copy template + `templates/_shared` + `brand/{brand.css,fonts,logos}` + `runtime/` + track nhạc vào `out/stage/<tên>/`. Template tham chiếu `brand/…`, `runtime/…`, `_shared/…`, `music/…`. Render không tải Google Fonts hay CDN (script render kiểm log).
- **Quy tắc template** (rút ra khi làm `_blank`): nền và mọi lớp phủ (kể cả lưới safe zone) phải là **clip có timing** (`class="clip"` + `data-start`/`data-duration`). Nền đặt trên root, hoặc phần tử không có timing, không được vẽ ra.
- **Safe zone debug**: `templates/_shared/safe-zone.css` + biến `debugSafeZone` (boolean). Mặc định tắt; bản render thật không bật.
- **Nhạc test**: `test-pad-01` tự sinh (`pnpm gen:test-music`), `allowedUse: internal-test`. Bị chặn khi dùng cho video thật (`checkTrack(…, 'production')`).

## 9. M1 — lõi pipeline + FeatureLaunch + TipOfTheDay (2026-10-08)
- **Khối dùng chung là thư viện CSS + JS** (`templates/_shared/scene-kit.js`, `kit.css`), không phải sub-composition của HyperFrames. Lý do: số cảnh thay đổi theo kịch bản và được tạo bằng script (S4), còn việc nạp sub-composition động chưa được kiểm chứng. REQUIREMENTS §7.1 vẫn liệt kê các khối (hook, chữ cảnh, phone frame, callout, lower third, CTA, logo); chúng nằm trong kit.
- **Đăng ký timeline trong template**: `hyperframes lint` chỉ đọc mã tĩnh, nên mỗi template tự tạo timeline paused và gán `window.__timelines["main"]`; kit nhận `tl` để thêm hiệu ứng. Thẻ `<audio>` có sẵn `data-start` tĩnh.
- **Ghi props thành giá trị mặc định của biến trong bản stage**, vì `hyperframes check` và Studio không nhận `--variables-file`. Render vẫn truyền `--variables-file --strict-variables --strict`.
- **Chuyển cảnh** theo `/hyperframes:hyperframes-animation`: cảnh cũ và cảnh mới chuyển động cùng lúc tại mốc T, nên clip cảnh cũ được kéo dài thêm đúng thời lượng chuyển cảnh. Không có animation thoát, trừ cảnh cuối (mờ dần 0.4 giây). Cảnh được đánh dấu `data-layout-allow-overlap` vì chồng lấn trong lúc chuyển là có chủ ý.
- **Preset phong cách** (`brand/styles/*.json`, schema `config/style-preset.schema.ts`):

  | Phong cách | Chuyển cảnh | Chữ hiện | Nhấn từ khóa |
  |---|---|---|---|
  | `toi-gian` | vertical push 0.45 giây | rise | gạch chân |
  | `khuyen-mai` | zoom through 0.3 giây | slam | khối nền, CTA nhịp |
  | `vui-nhon` | elastic push 0.5 giây | pop | sticker, CTA nhịp |

  Từ được nhấn là từ có số, %, hoặc tên sản phẩm.
- **Cỡ chữ tự co** (Nam: "nếu tràn thì nên giảm size chữ"):
  - Kit chọn cỡ lớn nhất trong thang `--type-hero/h1/h2/h3/body` sao cho khối chữ vừa chiều cao vùng **và** không vượt số dòng tối đa (hook 3, chữ cảnh 4, chữ trên phone 3, CTA 2).
  - Ước lượng bằng số ký tự × 0.6em, không đo DOM, nên render vẫn xác định.
- **Khoảng cách dòng** (Nam: "text dính nhau quá gần"): `--line-tight` 1.1 → **1.25**, `--line-normal` 1.3 → **1.45**, vì dấu chồng tiếng Việt cần chỗ.
- **Chữ trên nền màu nhấn**: thêm `--color-on-accent` theo sản phẩm (SIPOS trắng, BOS mận, Webino tím đậm, Redsun đen). `hyperframes check` từng báo tương phản 1.99:1 khi dùng màu teal trên nền đỏ.
- **Đếm từ cho công thức thời lượng**: bỏ qua cụm chỉ có dấu câu ("—", "·").
- **Loudness**: render xong → ffmpeg `afade` 0.5 giây vào/ra + `loudnorm` 2 lượt (I −14, TP −1.5, linear), copy luồng hình, kiểm lại bằng `ebur128`. Các bản e2e đo được −13.8…−14.0 LUFS.
- **Nhạc trong stage** luôn ở `music/bgm.mp3`; file khác định dạng được đổi sang mp3 khi stage.
- **Thư viện `yaml`** 2.9.1 (ISC) để đọc frontmatter brief. Đây là dep thêm ngoài §3, Nam đã ủy quyền chọn công cụ.
- **Ảnh minh họa fixture** `assets/_demo/sipos-kiem-kho.png`: chụp từ `assets/_demo/sipos-kiem-kho.html` (mock giao diện kiểm kho do repo tự dựng, không phải ảnh chụp sản phẩm thật). Chỉ dùng cho brief mẫu và test.
- **Render test**: chụp khung đã đứng yên (cuối hook, cuối cảnh giữa, cuối CTA) của 2 template × 3 phong cách; so SSIM với `tests/baseline/` (ngưỡng 0.97). Hai lần render liên tiếp cho SSIM 1.0000, tức render xác định.
- **Hiệu năng**: `pnpm make _example` (21 giây, quality standard) mất ~42 giây; 8 brief e2e bản draft mất 35–75 giây mỗi brief trên Mac Intel 2017.
- **Video (quay màn hình, clip)**: phải là clip có timing riêng, nằm trực tiếp trong root, không nằm trong phần tử có timing. Đã thử: video không có timing đặt trong cảnh thì **đứng hình** (khung 13 giây = 16 giây). `scene-kit.js` chèn video ngay trước cảnh của nó (đặt đúng vùng màn hình phone, hoặc tràn màn hình), cho chạy cùng hiệu ứng vào/zoom của phone. Khi chuyển cảnh, video tịnh tiến theo cảnh (push) hoặc mờ dần (zoom/blur). Fixture `demo-san-pham` (video trong phone) và `huong-dan-nhieu-buoc` (video tràn màn hình) kiểm điều này trong e2e.
- **Sửa sau code review** (`plans/reports/code-reviewer-261008-m1-review.md`):
  - Render ra file tạm, chỉ thay `out/<slug>.mp4` khi đạt chuẩn, và luôn dọn file tạm.
  - `validate` báo phong cách chưa có preset; đối chiếu `style`/`music` của brief với kịch bản; cảnh báo khi brief để trống phong cách mà kịch bản khác mặc định; chặn asset ngoài dự án, sai đuôi hoặc là thư mục; chặn mã cảnh trùng; video > 45 giây tối đa 3 ý; cảnh báo chữ cảnh > 10 từ và thiếu `selfScore`.
  - Lỗi dài: chỉ in 12 dòng đầu cho MKT, phần đủ ghi vào `out/last-error.log`.
  - `preview` chỉ tắt bản xem thử của dự án (project trong `out/stage/`), và tắt trước khi dựng lại.
  - Cờ dòng lệnh lạ thì báo lỗi.
  - e2e không ghi `props.json` vào fixture.
  - Bộ lọc "tải tài nguyên lỗi" chỉ bắt HTTP 404 / request failed / `net::`. HyperFrames có in dòng `Asset load failure: [FrameCapture:INIT] complete` dù không có lỗi; bộ lọc cũ bắt nhầm dòng này làm 1 brief e2e fail ngẫu nhiên.
- **Chưa làm** (theo review, mức thấp): brand lint chưa bắt màu viết camelCase trong JS hay tên màu CSS (`red`), và có thể báo nhầm selector dạng `#add`.
- **Chưa có**: nhạc thật (Nam chọn); lower third (Testimonial, M3).

## 10. M2: trải nghiệm MKT (2026-10-08)

- **Cài đặt**: `scripts/cai-dat.sh` (bash thuần, vì máy MKT có thể chưa có Node) làm theo runbook S1.
  - Không sudo, không git; Node v22.23.3 tải tarball và kiểm SHASUMS256; plugin HyperFrames lấy từ tarball tag v0.8.141.
  - Mọi thứ nằm trong `~/.redsun-reels` (đổi được bằng `REDSUN_REELS_HOME`).
  - Đã chạy 2 lần liên tiếp trong môi trường `env -i` sạch: lần 1 mất 89 giây, lần 2 mất 24 giây (bỏ qua các bước đã xong), cả hai exit 0.
- **`./reel`**: lệnh gọn để skill và CLAUDE.md không phải nhắc PATH/corepack. Luôn chạy `pnpm run`, vì `pnpm doctor` là lệnh có sẵn của pnpm chứ không phải script của dự án. Lệnh không tồn tại thì báo tiếng Việt.
- **Skill** (`.claude/skills/`): `cai-dat` và `tao-reel`, qua `quick_validate.py` và `lint_cruft.py` của ak-skill-creator. Không skill có sẵn nào thay được (mục 6).
- **Lệnh mới**: `info` (tra loại video / phong cách / thời lượng cảnh), `post` (caption + hashtag + credit nhạc, có unit test).
- **Quyền** (`.claude/settings.json`): cho phép `Skill(tao-reel)`, `Skill(cai-dat)`, `./reel`, script cài, và sửa `briefs/**`.
- **Thử bằng phiên Claude Code mới** (`claude -p` + `--resume`, đóng stdin). Đi đủ: brief → 3 concept (dừng) → kịch bản + bảng duyệt (dừng) → xem thử (HTTP 200) → xuất MP4 20 giây + post.md → tự tắt bản xem thử. Bài học:
  - Không ghi chuỗi dấu chấm than liền dấu backtick trong SKILL.md: Claude Code hiểu đó là lệnh shell cần chạy khi nạp skill, và skill nạp lỗi ("Execute skill: tao-reel").
  - Khi skill nạp lỗi, Claude tự làm theo kiểu tự do và bịa số liệu ("trước 3 ngày", "37%", "dùng thử miễn phí"). Skill vì vậy có quy tắc riêng: góc hook "con số" chỉ dùng khi MKT đưa số; CTA mặc định lấy `defaultCta` trong `products.json`.
  - CLAUDE.md ghi rõ "bắt buộc gọi skill trước khi làm gì khác". Không có câu này, Claude đọc REQUIREMENTS rồi tự làm, bỏ qua skill.
  - `claude -p` không đóng stdin sẽ treo; khi chạy nền phải `< /dev/null`.
- **Chưa xong theo §15**: tiêu chí "1 người MKT tự làm 1 video, dev chỉ quan sát" cần người thật.


## 11. M3: BeforeAfter, Testimonial, Promo, 16 phong cách, lịch dịp lễ (2026-10-08)

- **Kit tách module** (scene-kit.js vượt 300 dòng):
  - `kit-core.js`: chữ, tự co cỡ, ảnh/video;
  - `kit-motion.js`: chuyển cảnh, nền, lớp phủ;
  - `kit-blocks.js`: khối riêng theo template;
  - `scene-kit.js`: dựng video.
  - CSS tách thành `kit-styles.css` (phong cách) và `kit-blocks.css` (template). Mọi template nạp cùng bộ file.
- **Preset phong cách** thêm:
  - chuyển cảnh `dip-black`, `flash-white`, `whip`, `glitch-cut`;
  - kiểu hiện chữ `blur`, `type`, `track`;
  - lớp phủ (1 lớp/video): `vignette`, `grain`, `light-leak`, `grid`, `hud`, `scanlines`, `confetti`, `letterbox`, `paper`, `vhs`;
  - nền `flat` / `gradient` / `aurora`;
  - hiệu ứng chữ `glow`, `rgb-split`, `hanazi`, `glass`, `boil`;
  - cách nhấn `scribble`.
  - Bảng id → tham số: `brand/styles/*.json` (19 file).
- **Tham chiếu kỹ thuật** (Nam gửi 2026-10-08): mục "signature features" của [mg-styles-15](https://github.com/vincentwei1021/mg-styles-15) (MIT). Chỉ lấy ý tưởng chuyển động, viết lại bằng CSS/GSAP theo brand, không chép code:
  - HUD → `robot-cong-nghe`;
  - VHS → `retro`, `glitch-cyberpunk`;
  - line boil + nền giấy → `thu-cong`;
  - aurora + kính mờ → `tuong-lai`, `thu-gian`;
  - chữ hanazi → `vui-nhon`, `le-hoi`.
  - Những phong cách cần WebGL/Blender (3D, liquid…) không áp dụng: không hợp mẫu điền chữ.
- **Lệch §7.1 "ưu tiên block registry"**: các block registry trong catalog là composition riêng, có màu và font cố định. Đổi sang brand cần sửa gần hết, lại không ghép được vào cảnh động của kit. Vì vậy dùng hiệu ứng tự viết trong kit, chỉ dùng biến brand, kiểm bằng brand lint. Không cài block nào.
- **Phần trang trí phủ lên chữ** vẽ bằng `::before`, và lớp phủ có `data-layout-allow-occlusion`. Lý do:
  - `hyperframes check` coi phần tử có nền gradient là "đục", nên báo che chữ dù lớp phủ gần trong suốt.
  - Pseudo-element không bị công cụ dò tới.
  - Lỗi thật đã gặp và sửa: lớp tối của màn split nằm đè nhãn TRƯỚC/SAU.
- **Tương phản**: quầng sáng `glow` từng dùng màu nhấn. Với Webino (cyan), chữ nhấn cyan trên quầng cyan chỉ đạt 2.58:1. Đã đổi quầng sang màu chữ (40%).
- **Chống bịa** (`scripts/lib/fact-check.ts`), chỉ đối chiếu **phần nội dung** của `brief.md`. Frontmatter không tính, vì `duration: 22` hay `occasion: 20-10` từng hợp thức hoá badge "-22%" / "-20%".
  - **Lỗi**:
    - `promo.badge/priceOld/priceNew/deadline` không có **nguyên cụm** trong brief (so cả đơn vị %, đ, ngày);
    - tên khách (`attribution`) không có trong brief;
    - video "khách hàng nói" không có lời khách;
    - `split` thiếu `srcAfter`, hoặc ảnh trước là ảnh tĩnh còn ảnh sau là clip;
    - cảnh promo ngắn hơn `promoSequenceSec`;
    - đếm ngược đi cùng badge/giá;
    - promo/attribution đặt trên visual phone/split.
  - **Cảnh báo**: số trong chữ cảnh không có trong brief; quote không khớp lời khách.
  - **Chuẩn hoá trước khi so**: NFC; gộp hai kiểu dấu thanh (hoá/hóa, uỷ/ủy); gộp phân cách nghìn (1.200.000 = 1 200 000) và số 0 đầu (08/03 = 8/3); so theo từ, nên "Chị An" không khớp "chị Anh".
  - Nhịp hiện khối promo dùng chung `config/promo-timing.ts` ↔ `kit-blocks.js`.
- **Lịch dịp lễ**: `config/occasions.ts` (17 dịp, ngày, phong cách). `OCCASION_STYLES` lấy từ đây. `./reel info dip-le` in lịch. Brief ghi `occasion` lạ thì có cảnh báo.
- **Sửa sau code review** (`plans/reports/code-reviewer-261008-m3-review.md`), ngoài phần chống bịa ở trên:
  - Cảnh TRƯỚC được kéo dài ≥ 0.9 giây cho wipe (trước đây phong cách chuyển cảnh nhanh làm lộ nền).
  - Video trong khung phone không còn hai tween opacity/y chồng nhau.
  - Video đi đúng nhịp cảnh với whip / glitch-cut / dip-black / flash-white.
  - Khối promo: badge và giá dài thì nhỏ lại; giới hạn badge ≤ 10, giá ≤ 14 ký tự; đếm ngược cao 360px.
  - Lặp lại của lớp phủ và confetti không vượt tổng thời lượng.
  - Kiểm NFC cả `attribution`, `promo`.
- **Render test**: 5 template × 19 phong cách = 95 tổ hợp × 4 khung (thêm 1 khung giữa lần chuyển cảnh đầu). Ảnh chuẩn đổi sang JPEG 360×640, `-q:v 3` (≈ 30 KB/ảnh). `--only=<chuỗi>` để chạy một phần. Lưu ý: `hyperframes snapshot` không vẽ khung video, nên video kiểm bằng MP4 của e2e.
- **E2E**: 16 brief mẫu (15 loại video của 5 template + test dấu). Ảnh minh họa mới: `assets/_demo/so-tay-kiem-kho.png` (mock sổ tay, tự dựng từ HTML, không phải ảnh thật).
- **Chưa làm (M4)**: âm thanh gốc clip khách + hạ nhạc tự động. Làm cùng TalkingHead. Testimonial M3 tắt tiếng clip, lời khách hiện bằng chữ.

## 12. M4: EventRecap, Stats, TalkingHead, tiếng gốc clip (2026-10-09)
Nam: "tiếp tục" (2026-10-09). Plan: `plans/261009-0512-m4-du-20-loai/`. Nhạc giữ Pixabay/Mixkit (§8.1), chưa đổi.
- **Template mới** (cùng vỏ `index.html`, dựng bằng kit):
  - EventRecap: cảnh `montage` (`visual.srcs` 2–6 ảnh/clip), chia đều thời lượng cảnh, cắt gọn và zoom 1.12 → 1 mỗi hình, mỗi hình ≥ 0.6 giây. Chữ tiêu đề ở dưới trên lớp tối gradient.
  - Stats: `stats` 1–3 chỉ số `{ value, label }`. Số đếm lên 1.2 giây bằng `onUpdate` (GSAP gọi cả khi seek nên vẫn xác định theo khung). Giá trị giữ đúng cách viết: "1.200+" (chấm nghìn), "4,8" (phẩy thập phân), "98%" (thêm thanh tiến độ). `chart: "bar"` vẽ cột ngang, cần ≥ 2 chỉ số cùng đơn vị. Nhịp chung `config/stats-timing.ts` ↔ `kit-blocks.js`.
  - TalkingHead: clip người nói tràn khung, chữ ý chính ở dưới (nhỏ hơn để thấy người), lower third tên người nói (`attribution`).
- **Đoạn clip liền mạch** (`scripts/lib/build-props.ts` `assignShots`), chỉ ở loại video giữ tiếng gốc: cảnh liền nhau cùng file clip, không khai `visual.clipStart` → một video chạy qua các cảnh, giữa các cảnh chỉ đổi chữ (chuyển cảnh `text-swap`). Đổi `mute` giữa chừng mở đoạn mới nhưng clip chạy tiếp từ chỗ cũ. `clipStart` (`data-media-start`) dùng được ở mọi template. Loại video khác giữ cách cũ (mỗi cảnh một clip từ 0, chuyển cảnh theo phong cách), để không đổi video đang làm. Cảnh CTA không tính.
- **Tiếng gốc**: loại video có `keepClipAudio` (khach-hang-noi, video-co-nguoi-noi) giữ tiếng clip, trừ `visual.mute`. Testimonial có clip nay cũng giữ tiếng (M3 tắt).
  - Video luôn `muted`; tiếng là một `<audio>` riêng (track 15) đúng đoạn của cảnh. Lý do: hình được kéo dài qua chuyển cảnh, còn tiếng thì không (tránh tiếng chồng khi hai đoạn có tiếng nối nhau). Đây là cách J/L cut của `hyperframes-core` creator-editing-recipes.
  - Media tạo lúc chạy phải có `id`, nếu không mixer bỏ qua.
- **Hạ nhạc** (`scripts/lib/music-ducking.ts`): lane `volume` của `data-automation` trên `#music`, 0.18 (≈ −15 dB) trong lúc có tiếng, dốc 0.3 giây, gộp khoảng cách nhau < 0.8 giây.
  - Thử 2026-10-09 trên 0.8.141: gán `data-automation` bằng JS lúc chạy **không có tác dụng**; ghi sẵn trong HTML thì nhạc hạ ~12 dB đúng khoảng. Vì vậy bước build ghi lane vào `index.html` của bản stage (giống `injectDefaults`).
  - Không dùng voiceover carve: carve cần phân tích offline bằng `carve.mjs` mỗi lần build, và loa điện thoại nghe Reels thì hạ âm lượng là đủ. Có thể thêm sau nếu MKT thấy nhạc lấn giọng.
  - Đo trên brief mẫu `video-co-nguoi-noi`: nhạc (dải < 140 Hz) −28 đến −30 dB khi có tiếng, −21 đến −23 dB ở cảnh CTA; sau đó chuẩn hoá cả bài về −14 LUFS như cũ.
- **Validate**:
  - Lỗi: `stats.value` không có nguyên cụm trong brief, hoặc viết số mập mờ (trộn chấm và phẩy như "1.234,5"; `STAT_NUMBER_RE`, template hiện nguyên chữ nếu lọt); cảnh stats ngắn hơn `statsSequenceSec`; `chart` khác đơn vị hoặc < 2 chỉ số; video Số liệu không có cảnh stats; TalkingHead không có clip; montage thiếu `srcs` hoặc quá ngắn; clip không đủ dài cho `clipStart` + thời lượng (ffprobe, `scripts/lib/clip-check.ts`).
  - Cảnh báo: clip giữ tiếng nhưng không có tiếng; khi đó build bỏ tiếng đoạn này và không hạ nhạc. "98 %" khớp "98%". TalkingHead không cảnh báo "quote không khớp brief", vì chữ là ý chính, còn lời nói đã có trong clip.
- **Sửa tương phản phong cách gạch chân** (9 phong cách: toi-gian, du-lieu, tin-cay…): chữ nhấn trước đây đổi sang màu nhấn. Đỏ SIPOS trên nền teal chỉ 1.99:1 (cần 3:1); render test không chạy `check` nên trước đây không bắt được, brief mẫu Stats bắt được. Nay chữ giữ màu chữ, chỉ vạch gạch chân mang màu nhấn. Phong cách `thu-cong` (gạch lượn) cùng lỗi, sửa cùng cách. Số của Stats cũng dùng màu chữ, màu nhấn nằm ở vạch trái và thanh.
- **Sửa sau code review** (`plans/reports/code-reviewer-261009-m4-review.md`):
  - Lớp tối (`kit-dim`) đi cùng video qua chuyển cảnh từng bị tween opacity lên 1, che kín clip ở 10/19 phong cách. Nay độ trong suốt nằm trong màu nền (`color-mix`), và lớp tối chỉ tách khỏi cảnh khi đoạn clip kéo qua nhiều cảnh.
  - Biểu đồ phần trăm so với 100%, đơn vị khác so với chỉ số lớn nhất.
  - Chưa làm: kiểm cặp số–nhãn của Stats (chỉ kiểm số; nhãn có số lạ thì cảnh báo) và kiểm chữ ý chính của TalkingHead với lời nói (Claude không nghe được clip; skill yêu cầu MKT ghi lời nói vào brief).
- **Asset thử** (`assets/_demo/`, mock tự dựng, không phải ảnh/người thật): `su-kien-1…4.jpg` (HTML `su-kien-mock.html`), `nguoi-noi-test.mp4` (ảnh `nguoi-noi-mock.html` + giọng đọc macOS "Linh", 17 giây).
- **Render test**: 8 template × 19 phong cách = 152 tổ hợp. Video tạo lúc chạy nay có `id`, và `hyperframes snapshot` vẽ được khung video (trước đây không có `id` thì không vẽ, xem §11). Vì vậy ảnh chuẩn của mọi cảnh có clip đổi theo: đây là thay đổi do công cụ kiểm thấy thêm, không phải đổi giao diện.
- **E2E**: 21 brief mẫu (20 loại video + test dấu).

## 13. Thư viện nhạc, chuẩn hoá âm thanh, tài liệu thử nghiệm MKT (2026-10-09)
Nam: "làm tất cả trừ số 4" (nhạc thật, nhạc tự sinh, chuẩn bị 10 video thử nghiệm và clip người nói; Mac chip M để sau).
- **Nhạc**: 20 bài Mixkit (dùng thật) + 5 bài tự sinh bằng mgaudio (chỉ xem thử). Nam nghe qua `./reel music:page`: bỏ 6 bài Mixkit + 4 bài tự sinh (xoá khỏi manifest); thêm 10 bài Mixkit đợt 2 (giữ 3, bỏ 7), rồi 8 bài đợt 3 (giữ 4), 6 bài đợt 4 (giữ 2). Kết quả: 23 bài, đều đã qua tai Nam. Tiêu chí: nhạc bắt tai, có nhịp ngay đầu (Nam: "reel cần thu hút"). `startSec` bỏ đoạn dạo đầu (`scripts/lib/music-intro.ts`: điểm đầu tiên độ to ngắn hạn đạt ≥ độ to cả bài − 6 LU, trần 15 giây; ngưỡng 4 LU cắt quá tay với bài có điệp khúc to, vd. It's Love 20 giây). Chi tiết, license, bằng chứng: [`music-sources.md`](music-sources.md) §5.
  - File nhạc bên thứ ba không vào repo công khai. Manifest có `downloadUrl` + `sha256`; `scripts/fetch-music.ts` (`./reel music:fetch`, cài đặt bước 6) tải và kiểm mã. `.gitignore` bỏ `brand/music/mixkit-*.mp3`, `pixabay-*.mp3`. Validate báo lỗi nếu bài bên thứ ba thiếu `downloadUrl`/`sha256`.
  - mgaudio: repo chỉ kèm một phần bộ mẫu VCSL (496/598 file liệt kê trong `index.json` không có trong repo), nên chỉ chạy được công thức thuần tổng hợp: explainer, pop, synthwave, ambient (glass), future_bass. Lofi, variety cần mẫu thiếu. Thông số sinh ghi ở `notes` từng bài; chạy bằng Python venv riêng, không phải phụ thuộc của dự án.
  - `./reel info nhac [phong-cách]` liệt kê bài theo phong cách; skill `tao-reel` dùng lệnh này khi chọn nhạc. `briefs/_example` dùng bài Mixkit, nên `./reel make _example` xuất được video thật.
- **Chuẩn hoá âm thanh** (`scripts/lib/loudness.ts`): bỏ loudnorm 2 lượt. Với nhạc thật nhiều đỉnh nhọn (bản render thô −20.6 LUFS, đỉnh −2.6 dBTP), loudnorm chuyển sang chế độ động, chỉ đạt −15 LUFS, và đỉnh sau đổi tần số mẫu + AAC là −0.1 dBTP (render bị chặn). Nay: tăng/giảm âm lượng → limiter ở 192 kHz → AAC, đo lại, chỉnh độ lợi và hạ trần limiter theo phần đỉnh vượt, tối đa 6 lượt. Kiểm trên cả 26 bài trong thư viện: −14.0 đến −14.7 LUFS, đỉnh −1.4 đến −5.6 dBTP.
- **Nhạc MKT tự tìm**: thư mục `nhac-tu-tim/` (ngoài git) + `./reel music:add` (`scripts/music-add.ts`): chỉ nhận link Pixabay/Mixkit, bắt buộc ảnh chụp trang bài cùng tên, thêm vào manifest trên máy đó với `localOnly`. Đây là ngoại lệ duy nhất của quy tắc "chế độ MKT chỉ sửa `briefs/`" (CLAUDE.md). Mỗi bài lưu kèm file `.json` trong `nhac-tu-tim/`, nên `--lai` đăng ký lại được sau khi cập nhật bản ZIP mới. Nam gom vào thư viện chung theo `music-sources.md` §5.
- **Clip quay ngang**: validate cảnh báo (đọc cả cờ xoay của clip điện thoại).
- **Thử nghiệm MKT**: [`huong-dan-thu-nghiem-mkt.md`](huong-dan-thu-nghiem-mkt.md): 10 tình huống (10 loại video, 8 phong cách), phiếu chấm theo §14, cách quay clip người nói cho TalkingHead. Skill hiểu câu "xem thử có vùng an toàn" (`--safe-zone`).

## 14. Model Claude cho dự án (2026-10-09)
Nam: "skill này có nên giao toàn bộ cho opus 5.5 dựng video không… hiện tại đây là model tốt nhất dựng video của claude".
- Chốt **Claude Opus 5.5** (`claude-opus-5-5`, tên đầy đủ để khoá phiên bản; alias `opus` tự nhảy bản mới).
- Khai ở hai nơi, vì `model` trong frontmatter skill **chỉ áp dụng cho lượt hiện tại**, sang tin nhắn sau phiên trở về model cũ (docs Claude Code, mục Skills, Frontmatter reference); mà `tao-reel` kéo dài nhiều lượt (concept → kịch bản → xem thử → xuất):
  - `.claude/settings.json` `"model": "claude-opus-5-5"`: mặc định cho mọi phiên mở trong dự án. Người dùng vẫn đổi được bằng `/model` (ưu tiên cao hơn settings).
  - `.claude/skills/tao-reel/SKILL.md` `model: claude-opus-5-5`: lượt gọi skill luôn chạy Opus kể cả khi phiên đang dùng model khác.
- Lý do: phần khó của skill là viết chữ tiếng Việt, chống bịa, giữ đúng điểm dừng; dựng hình đi qua template nên tốn ít token.
- **Cần Claude Code ≥ 2.1.280** cho `claude-opus-5-5`: bản 2.1.6 (npm global cũ ở `/usr/local/bin` trên máy Nam) báo `400 claude_code_version_too_old` ngay tin nhắn đầu; bản native 2.1.295 chạy đúng (`modelUsage: claude-opus-5-5`, thử 2026-10-09). `./reel doctor` cảnh báo khi `claude` trong Terminal cũ hơn; README có dòng xử lý lỗi.
- Rủi ro chưa kiểm: tài khoản MKT không có quyền / hết hạn mức Opus. Docs không ghi rõ hành vi (có thể lỗi ở request đầu hoặc giữ model cũ). **Cần thử bằng tài khoản của một bạn MKT** trước khi giao.
