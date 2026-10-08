# Brainstorm contract — M0.1 Spike + cài plugin HyperFrames

Ngày 2026-10-08. Chế độ `--ultra` (best-of-5 + verifier). Contract thắng cuộc (Candidate B) giữ nguyên văn bên dưới; phần "Cập nhật sau contract" và "Ghi chú verifier" do controller bổ sung, không trộn vào contract.

## Cập nhật sau contract (quyết định của Nam, đã chốt)
- S1/S6 đích = macOS Intel + Apple Silicon; bỏ Windows khỏi Spike. Ghi lệch S1/§3/§14.1 vào `docs/decisions.md`, không sửa REQUIREMENTS.
- Chưa có MacBook M → nửa arm64 của S1/S6 ghi "Chưa kiểm" kèm lý do.
- Font: **Montserrat** (Nam chốt 2026-10-08), thống nhất cho cả 4 thương hiệu. Montserrat là Google Fonts, SIL OFL, có subset tiếng Việt. S2 test dấu bằng Montserrat (Regular/Bold/ExtraBold + Italic), lấy file font từ nguồn chính thức (google/fonts) để render đúng như máy MKT.
- Phát âm (Nam chốt 2026-10-08): **SIPOS, REDSUN, REDSUN BOS đọc liền** như một từ, không đánh vần từng chữ. Spike thử vài cách viết phiên âm trong bảng phát âm (vd. "Xi-pốt", "Rét-xăn", "Rét-xăn Bốt"), nghe xem cách nào VieNeu/Linh đọc đúng, rồi ghi cách đạt vào decisions.md. ERP, POS, URL "sipos.vn": Nam chưa chốt → mặc định ERP/POS đánh vần, "sipos.vn" đọc "Xi-pốt chấm vê en".
- Kịch bản S3 ứng viên: dùng thuật ngữ thật trong profile, xem `plans/reports/brand-261008-1606-company-product-profiles.md` mục "Hệ quả cho Spike"; "giảm 30%"/"199.000đ" là số giả lập theo §15, không phải giá thật.
- Màu logo (cho M0.2): SIPOS chuẩn = `Logos/Sipos_Logo/Logo_green-01.png` → teal #0B4B54 (chính), đỏ #E30000 (nhấn), khớp file vector; Redsun vector #BA0000 / #EBAB32 / xám #58595B; Webino cyan #00B2DB, tím #5B1A9A→#C57CFF (gradient logo). Mã Webino còn chờ Nam xác nhận.

## Chiến lược cài đặt: Claude Code cài, MKT chỉ ra lệnh (Nam, 2026-10-08)
Nguyên tắc: MKT không biết kỹ thuật nhưng dùng Claude Code. MKT mở Claude Code ở thư mục dự án và nói "cài đặt giúp tôi". Claude Code làm theo một skill dự án (`cai-dat`, sản phẩm của M2; Spike làm bản thử để đo). Mục tiêu: không sudo/mật khẩu máy, không Homebrew, không trình cài GUI, không tài khoản, không key. MKT chỉ bấm duyệt quyền trong Claude Code. Lệch so với M2 "README hướng dẫn MKT cài Node/FFmpeg/pnpm" → ghi decisions.md, không sửa REQUIREMENTS.

Controller đã chọn (Nam ủy quyền), lý do ghi vào decisions.md:
| Thành phần | Cách Claude Code cài | Lý do |
|---|---|---|
| Node 22 LTS | Nếu `node -v` < 22: tải tarball chính thức nodejs.org (darwin-x64 / darwin-arm64 theo `uname -m`), kiểm SHASUMS256, giải nén vào `~/.redsun-reels/node`, script dự án tự thêm vào PATH | Không cần sudo, không cài GUI, chạy được trên cả Intel lẫn M |
| pnpm | `corepack` có sẵn trong Node 22; pin bằng trường `packageManager` trong package.json | Không cài thêm gì |
| FFmpeg + ffprobe | devDependency `ffmpeg-static` + `ffprobe-static` (bản dựng sẵn cho x64/arm64); script set `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH` (đã thấy hai biến này trong mã `hyperframes@0.8.141`) | Bỏ được Homebrew + Xcode CLT là bước khó nhất. Dep ngoài §3 → ghi lệch. Binary FFmpeg là GPL, chỉ dùng nội bộ |
| Chromium | `hyperframes` tự tải qua `@puppeteer/browsers` | Không có bước nào cho MKT |
| HyperFrames CLI | devDependency pin `hyperframes@0.8.141`, chạy qua `pnpm exec` | Pin version, không phụ thuộc mạng lúc chạy `npx` |
| Plugin | Claude Code tự chạy `claude plugin marketplace add heygen-com/hyperframes` + `claude plugin install hyperframes@hyperframes`; auto-update tắt; Spike thử khai báo plugin ở scope project để MKT clone repo là có | Không bắt MKT gõ lệnh `/plugin` |
| Python cho VieNeu (chỉ khi VieNeu thắng S3) | `uv` (binary đơn, cài vào `~/.local/bin`, không sudo) tự quản Python + venv; model tải từ Hugging Face | Không cần Python hệ thống |
| Transcribe | Thử `pnpm exec hyperframes models install parakeet`. Không nhận tiếng Việt → whisper.cpp qua đường không Homebrew (wheel dựng sẵn qua uv); Spike chọn và ghi lại | media-use mặc định build whisper.cpp bằng Homebrew, không hợp với MKT |
| Cờ môi trường | `HYPERFRAMES_NO_UPDATE_CHECK=1`, `HYPERFRAMES_NO_TELEMETRY=1` (ý nghĩa [VERIFY] trong Spike) | Giữ pin version, không gửi telemetry |

S1 đo thêm trên Intel Mac: từ máy chỉ có Claude Code → nói "cài đặt" → render được MP4. Ghi tổng thời gian (≤30 phút, §14.1), số lần MKT phải thao tác (duyệt quyền, nhập mật khẩu; mục tiêu 0 mật khẩu), lỗi gặp phải. Chạy trong một user macOS sạch hoặc thư mục HOME tạm để không lẫn với máy dev.

## Quyết định Nam (2026-10-08): provider S3 không cần key + transcribe
- Provider S3: **VieNeu** (Nam duyệt cài Python/torch cho Spike) và **macOS Linh** (chỉ làm mốc so sánh, không được chọn làm provider vì SLA nhiều khả năng cấm thương mại [VERIFY]). Piper và media-use/HeyGen không thử.
- VieNeu: thử 1–2 giọng nữ có sẵn, không clone giọng (§16 Q2b mặc định "Không"). Đo latency trên CPU Intel. Trước khi đưa vào nghe mù phải đọc model card để biết license model/dataset.
- Transcribe: Nam chọn Parakeet qua `npx hyperframes models install parakeet`. **Rủi ro đã thấy:** model card NVIDIA của parakeet-tdt-0.6b-v3 chỉ hỗ trợ 25 ngôn ngữ châu Âu, không có tiếng Việt; tài liệu media-use cũng không nói tới ngôn ngữ. Spike sẽ test Parakeet với audio tiếng Việt (đo WER hoặc độ lệch từ so với kịch bản). Không đạt thì chuyển sang whisper.cpp, đúng fallback §3 đã cho phép, đo cả độ lệch timing ≤100ms (§14.3).
- Với 1 provider thật (VieNeu) cộng 1 mốc, S3 chắc chắn Không đạt tiêu chí "1 chính + 1 fallback". Ghi workaround (thêm provider sau khi có key, hoặc thêm Piper nếu Nam duyệt) và tiếp tục theo Go/No-go.

## Cập nhật: KHÔNG có API key nào (Nam, 2026-10-08)
Cổng API key của S3 đã được Nam trả lời: sẽ không cấp key nào. Các provider cần key không bị âm thầm bỏ qua mà được ghi kết luận rõ trong spike-report:
- google-chirp3hd, gemini-tts, azure-hoaimy: "Không chạy được — không có API key (Nam xác nhận 2026-10-08)". Vẫn ghi bảng key cần có, để sau này có key thì chạy lại.
- media-use: nếu dùng `HEYGEN_API_KEY` thì không chạy được. Nhánh OAuth miễn phí (`heygen auth login --oauth`) cần tài khoản HeyGen và heygen CLI (dep ngoài §3) → hỏi Nam. Kokoro không có tiếng Việt.
- vieneu: không cần key. LICENSE repo gốc là Apache 2.0 (đã đọc 2026-10-08); license model/dataset chưa xác nhận. Cần Python/torch (dep ngoài §3) → hỏi Nam.
- Hệ quả, ghi vào decisions.md (không sửa REQUIREMENTS): §16 Q2 lấy `azure-hoaimy` làm fallback mặc định và §8.3 "M1 cài azure-hoaimy làm fallback" không còn khả thi. S3 có nguy cơ Không đạt "1 chính + 1 fallback"; theo Go/No-go thì ghi workaround và tiếp tục.
- Ứng viên không cần key nằm NGOÀI bảng §8.2 (chỉ thêm khi Nam duyệt theo §0):
  - Piper TTS, giọng `vi_VN` (vais1000, 25hours_single, vivos). Voice vais1000 có dataset CC BY 4.0 (thương mại được, phải ghi nguồn). Chạy offline nhưng cần binary/Python. Giới tính giọng [VERIFY].
  - macOS `say -v Linh` (vi_VN, có sẵn trên máy, không phải cài gì). Theo SLA của macOS, giọng hệ thống nhiều khả năng chỉ được dùng phi thương mại [VERIFY] → chỉ dùng làm mốc so sánh, không làm provider.
- Hệ quả cho caption: không provider không-key nào trả word timestamp, nên bắt buộc phải transcribe (`npx hyperframes models install parakeet` hoặc whisper.cpp). Phải đo bước cài này trên máy MKT.

## Cập nhật: ưu tiên miễn phí + dễ cài cho MKT (Nam, 2026-10-08)
Nguyên tắc: máy MKT chỉ cài thứ miễn phí, ít bước, không cần tạo tài khoản cloud. Key do dev tạo một lần và phát `.env` cho MKT.
- Bằng chứng cài đặt (đã kiểm): `hyperframes@0.8.141` cần Node ≥22. Chromium tự tải qua `@puppeteer/browsers`, không phải cài tay. FFmpeg KHÔNG đi kèm, phải cài riêng.
- Cài trên Mac cho MKT (đề xuất, đo trong S1): Node 22 bằng file `.pkg` của nodejs.org (bản universal, chạy cả Intel lẫn M). pnpm dùng `corepack enable pnpm` có sẵn trong Node 22. Claude Code MKT đã có. Plugin cài bằng 2 lệnh trong Claude Code. FFmpeg là bước khó nhất: Homebrew thì cần Xcode CLT và terminal; dùng gói npm bundle ffmpeg thì là dep ngoài §3, phải hỏi Nam.
- S1 đo thêm: số bước và thời gian cài theo hướng dẫn trên Intel Mac. Đây là proxy cho §14.1 (≤30 phút).
- S3 thêm 2 cột đo cho mỗi provider: "0đ cho 200 video/tháng?" và "phải cài gì thêm trên máy MKT". Vẫn chạy đủ mọi provider, không bỏ qua cái nào.
  - azure-hoaimy: F0 cho 0,5M ký tự Neural/tháng, nhu cầu ước tính ~120K. F0 chặn khi hết quota chứ không tính tiền. Có word boundary nên máy MKT không cần cài transcribe. Đây là ứng viên dễ nhất.
  - gemini-tts: free tier ở standard tier, nhưng trang Models ghi 2.5 TTS chỉ mở cho người đã từng dùng và khuyên project mới dùng TTS đời mới hơn. Đây là lệch so với §8.2, cần ghi vào decisions.md. Không có timestamp nên phải transcribe. Cần kiểm rate limit/ngày và điều khoản dữ liệu của free tier.
  - google-chirp3hd: phải bật billing, không phải 0đ an toàn, cần budget alert.
  - vieneu: 0đ nhưng mỗi máy MKT phải cài Python/torch. Cài khó nhất.
  - media-use (HeyGen): mỗi máy phải cài heygen CLI + OAuth. Chưa có bằng chứng có giọng tiếng Việt.

## Ghi chú verifier phải vá khi thi hành (không thuộc contract gốc)
- S3a thêm: 1–2 giọng nữ/provider; Gemini thêm 1 bản prompt "hào hứng, nhịp nhanh kiểu TikTok" (§15).
- media-use: đã xác minh voice = HeyGen (cần heygen CLI OAuth hoặc `HEYGEN_API_KEY` + `HEYGEN_API_BASE`) hoặc Kokoro (không có tiếng Việt) → xếp vào nhóm cần key + dep mới, hỏi Nam.
- Azure timestamp: đo bằng Batch synthesis REST (`wordBoundaryEnabled: true`), không cần SDK.
- S5 cần có file giọng thật → phụ thuộc cổng key S3.
- Transcribe: `npx hyperframes models install parakeet` chạy được trên macOS nói chung; parakeet-mlx chỉ Apple Silicon.

---
## Contract thắng cuộc (Candidate B, nguyên văn)
Bằng chứng tự kiểm: `npm view hyperframes` → latest 0.8.141, modified 2026-10-08T07:19Z (release gần như hằng ngày → pin bắt buộc). REQUIREMENTS tự mâu thuẫn LUFS: §8.3 mặc định −16, §16 mặc định −14.
## Outcome
spike-report S1–S7 Đạt/Không đạt/Chặn + bằng chứng, S1/S6 tách x86_64 và arm64; decisions.md có version CLI+plugin pin, nhật ký lệch [VERIFY] + lệch nền tảng; `docs/spike-audio/` kịch bản S3 + audio; REQUIREMENTS.md bất biến.
## Constraints
- Máy Mac Intel i7-7700HQ; chưa xác nhận có Apple Silicon; không Windows. §0: lệch → dừng hỏi.
- Pin cứng `hyperframes@0.8.141`, không `npx hyperframes` trơn; không bật auto-update marketplace (README khuyên, §3 cấm).
- Không dep ngoài §3 khi chưa hỏi; không có whisper.cpp/gcloud/az → REST/curl.
- Secrets từ `.env`; `.env.example`; `.gitignore` chặn `.env`.
- Chấm mù = người thật.
## Non-goals
Scaffold đủ §4, template, brand thật, chốt TTS, sửa REQUIREMENTS, cloud render, dựng VM Windows.
## Acceptance criteria
1. Plugin: `hyperframes@hyperframes` có version/SHA; `/hyperframes:hyperframes` gọi được; auto-update tắt có bằng chứng.
2. decisions.md: version CLI, version/SHA plugin, ngày, nguồn lệnh cài, `package.json` khớp.
3. Nhật ký lệch: mục | REQ nói | thực tế/docs | nguồn | hệ quả. Tối thiểu (a) auto-update; (b) namespace `/hyperframes:hyperframes`; (c) Windows không nêu; (d) §3/S1/§14.1 Windows 11 vs MKT MacBook Intel+M; (e) LUFS §8.3 vs §16. `shasum` REQUIREMENTS.md trước/sau.
4. S1: x86_64 chạy init→preview→render trên máy này (log, exit code, `uname -m`); arm64 "Chặn — cần MacBook M"; Windows "Chưa đánh giá — chờ Nam". Đạt chỉ khi cả 2 kiến trúc qua.
5. S2: PNG snapshot text tĩnh + animation chuỗi §13 + font đang dùng; cả 2 kiến trúc nếu có máy M.
6. S3: `docs/spike-audio/script.txt` ~30s đủ 6 yếu tố; `A.mp3…N.mp3`; mapping tách khỏi thư mục người chấm thấy; phiếu chấm trống; bảng đo timestamp/latency/chi phí 200 video/tháng/license; điểm "Chờ ≥3 MKT".
7. Cổng API key: thiếu → dừng, liệt kê đúng tên env var, hỏi Nam, không bỏ qua.
8. S4: chọn A/B §6.4 với composition chạy được hoặc trích docs.
9. S5: MP4 nhạc+voice; đo dB nhạc trong/ngoài đoạn voice (`ebur128`/`astats`); "nghe tự nhiên" chờ người nghe.
10. S6: `time` render 30s 1080×1920 ×3 mỗi kiến trúc, trung vị, kèm `ffprobe`; ghi `file $(which node)`, `file $(which ffmpeg)`, kiến trúc Chromium (native arm64, không Rosetta); số Intel = worst case.
11. S7: lint/check/snapshot/doctor: output `--help`, exit code khi đúng và khi cố ý sai.
## Trade-offs
- P1 chạy mọi thứ trên Intel, arm64 "Chặn", hỏi Windows. Giả định: Nam chấp nhận S1 tạm = macOS Intel+M. Hỏng: Nam vẫn giữ Windows.
- P2 chờ máy M chạy S1/S6 hai kiến trúc cùng lúc. Giả định: mượn máy M trong ~1 ngày. Hỏng: không mượn được → treo.
- P3 vẫn kiểm Windows bằng VM. Giả định: Windows còn trong phạm vi. Hỏng: MKT không dùng Windows → lãng phí + hạ tầng ngoài §3.
## Better approaches
1. Tách S3a (sinh+đo, agent) / S3b (chấm mù, ≥3 MKT) — §15 bắt buộc ≥3 người nên không đóng S3 trong 1 phiên.
2. Gộp lần chạy arm64 vào buổi MKT chấm S3b: họ có MacBook M + Claude Code → chạy S1/S6 arm64 trên máy họ, thử luôn kịch bản cài thật (tinh thần §14.1).
## Kế hoạch
| Hạng mục | Lệnh | Đo | Bằng chứng | Đạt khi |
|---|---|---|---|---|
| Plugin | marketplace add; install; `claude plugin list` | version/SHA, auto-update | log + json | cài, ghi version, auto-update tắt |
| CLI pin | `pnpm add -D hyperframes@<ver>`; `pnpm hyperframes doctor` | version, doctor | package.json, log | khớp decisions.md |
| S1 | `uname -m`; init/preview/render mỗi máy | exit code/kiến trúc | log ×2 | x86_64 và arm64 qua |
| S2 | render + snapshot | dấu | PNG+MP4 | 0 lỗi dấu |
| S3a | REST/SDK từng provider, đo thời gian | latency, timestamp, ký tự, giá | mp3, bảng | đủ provider chạy được |
| S3b | phát phiếu | 1–5 ×3 | phiếu | ≥3 người, đề xuất chính+fallback |
| S4 | composition variables | chạy được? | HTML+MP4 | A/B có lý do |
| S5 | render + ebur128 | dB giảm | MP4+số | ducking đo được |
| S6 | `time … render` ×3/kiến trúc; `file` node/ffmpeg | giây, arch binary | log | trung vị x86_64 + arm64 |
| S7 | `--help`, lỗi cố ý | exit code | log | 4 lệnh xác nhận |
Key: google-chirp3hd `GOOGLE_APPLICATION_CREDENTIALS` (billing); gemini-tts `GEMINI_API_KEY`; azure-hoaimy `AZURE_SPEECH_KEY`+`AZURE_SPEECH_REGION`; vieneu: không key, cần Nam cho cài Python/torch + xác nhận license model+dataset; media-use: chưa rõ, có thể `HEYGEN_API_KEY`.
## Recommended direction
P1 + tách S3a/S3b + gộp arm64 vào buổi chấm. (1) Cài + pin, decisions.md, nhật ký lệch; (2) S7, S2, S4, S5, S6, S1-x86_64; (3) S3a: gặp cổng key → dừng hỏi; (4) S1-arm64 "Chặn", chờ Nam.
## Unresolved questions
1. S1/§3/§14.1 đọc là macOS Intel+Apple Silicon? Windows bỏ hay phase sau? 2. Ai cho mượn MacBook M, khi nào? 3. Pin 0.8.141? 4. Đồng ý không auto-update? 5. Bốn bộ key: cấp hay bỏ provider? 6. Python/torch cho VieNeu? 7. 3 MKT chấm, hạn? 8. LUFS −14 hay −16? 9. Namespace `/hyperframes:hyperframes` làm chuẩn cho `tao-reel`/CLAUDE.md sau này?

---
## Phụ lục xếp hạng
| Hạng | Ứng viên | Điểm /100 |
|---|---|---|
| 1 | B | 84 |
| 2 | A | 83 |
| 3 | C | 83 |
| 4 | E | 82 |
| 5 | D | 70 |
Không ứng viên nào vi phạm hard constraint. Lý do B thắng: tách x86_64/arm64 rõ nhất, có `shasum` chứng minh không sửa REQUIREMENTS, duy nhất pin vào `package.json` như §0 yêu cầu, phát hiện mâu thuẫn LUFS §8.3/§16. Điểm mạnh của A mà B thiếu: đọc thật media-use, đủ biến thể Gemini, thấy S5 phụ thuộc giọng.

ultra: picked=B/5 margin=low unanimous=no rejected_all=no
