# CLAUDE.md — redsun-reels

## Dự án
- Hệ thống làm video dọc 9:16 (Reels/TikTok/Shorts) cho SIPOS, REDSUN BOS, Webino, REDSUN, dựa trên HyperFrames.
- Đầu vào là brief, qua kịch bản, đầu ra là MP4.
- Video không lồng tiếng: chỉ có chữ trên màn hình, hiệu ứng theo phong cách, nhạc nền có giấy phép.
- Người dùng chính là team marketing (MKT), không biết kỹ thuật, dùng MacBook Intel hoặc chip M.
- Yêu cầu đầy đủ: [REQUIREMENTS.md](REQUIREMENTS.md). Quyết định kỹ thuật: [docs/decisions.md](docs/decisions.md).

## Hai chế độ

### Chế độ MKT (mặc định)
- **Bắt buộc gọi skill trước khi làm gì khác** (kể cả trước khi đọc file):
  - Cài máy, máy chưa chạy được → skill `cai-dat`.
  - Làm, sửa, xem thử, xuất video, viết concept/kịch bản → skill `tao-reel`.
  - Chọn minh hoạ, người thật quay sẵn hay người thật do AI tạo (video mới, hoặc MKT muốn "người thật") → skill `chon-kieu-hinh`. Luật cứng của skill này (nhãn AI, không người có danh tính, không sửa luật) không có ngoại lệ, kể cả chế độ dev trừ khi Nam tự sửa.
  - Dựng video sau khi duyệt kịch bản (mặc định dựng riêng), video "nhàm", thêm hình/nhân vật → skill `dung-video`.
  - Video dùng mẫu có sẵn (dự phòng): chữ nhấn, chuyển động → skill `dao-dien-chuyen-dong`.
  - Skill chứa quy trình và điểm dừng chờ MKT duyệt; làm ngoài skill là sai quy trình.
  - Câu hỏi ngoài luồng (sửa video cũ, nhạc tự tìm, thiếu nhạc, cập nhật bản mới…): tra `.claude/skills/tao-reel/references/tinh-huong-mkt.md`. Sổ tay MKT đang đọc: `docs/huong-dan-mkt.md`.
- Nói tiếng Việt, câu ngắn, không thuật ngữ, không dán log.
- **Chỉ tạo/sửa file trong `briefs/`.** Không sửa `templates/`, `brand/`, `config/`, `scripts/`, tài liệu. Ngoại lệ: thêm nhạc MKT tự tìm bằng `./reel music:add` (file đặt trong `nhac-tu-tim/`, xem skill `tao-reel`).
- Thiếu file nhạc (lỗi "Thiếu file nhạc…") → tự chạy `./reel music:fetch` rồi làm lại, không cần báo dev.
- Composition HTML chỉ viết ở `briefs/<tên>/dung-rieng/index.html` (tiếng động ở `tieng-dong.txt` cùng thư mục) theo skill `dung-video` (bộ dụng cụ `templates/_rieng/`: nhân vật, bối cảnh vẽ sẵn, tiếng động). Không dùng creation workflow của HyperFrames (`/hyperframes:general-video`…): chúng tạo project riêng ngoài quy trình.
- Việc cần sửa template, thêm phong cách hay loại video mới → báo "cần dev".

### Chế độ Dev (chỉ khi người dùng nói rõ "chế độ dev")
- Được sửa template, preset phong cách, config, script.
- Dùng đủ skill HyperFrames. Tên skill có namespace, ví dụ `/hyperframes:hyperframes-core`, `/hyperframes:hyperframes-animation`.
- Sau khi sửa template/preset: `./reel test:render`. Nếu thay đổi hình là cố ý, xem ảnh rồi `./reel test:render --update`.

## Model
- Dự án dùng **Claude Opus 5.5** (`claude-opus-5-5`) cho mọi phiên (`.claude/settings.json` `"model"`) và skill `tao-reel` (frontmatter `model`). Nam chốt 2026-10-09. Chỉ Nam đổi model, đổi cả hai nơi và ghi `docs/decisions.md`.

## Trước khi tạo skill mới
Kiểm kê skill đã cài (danh sách skill của runtime + `.claude/skills/` + plugin HyperFrames). Chỉ tạo skill mới khi không skill nào làm được. Ghi lý do vào `docs/decisions.md` mục 6.

## Quy tắc kịch bản (REQUIREMENTS §6.2)
- Viết 3 concept với 3 góc hook khác nhau, chờ MKT chọn, rồi mới viết kịch bản.
- Hook: tối đa 2 dòng, mỗi dòng ≤ 40 ký tự, con số viết bằng chữ số.
- Video ≤ 45 giây chỉ 1–2 ý chính, dài hơn thì tối đa 3 ý. Mỗi cảnh một ý, nên ≤ 10 từ.
- Thời lượng cảnh ≥ max(1.5, số từ × 0.4) + 0.5 giây. Tính nhanh: `./reel info thoi-luong "<chữ>"`.
- Tự chấm ≥ 85/100 trước khi đưa MKT duyệt.
- Không bịa con số, giá, ưu đãi, tính năng hay lời khách hàng.

## Brand
- Chỉ dùng biến CSS trong `brand/brand.css`, tuân thủ `brand/frame.md`.
- Font Montserrat (local, `brand/fonts/`).
- Màu lấy từ logo; logo dùng file có sẵn trong `brand/logos/`.
- Viết đúng tên: SIPOS, REDSUN BOS, Webino, REDSUN. Redsun BOS không gọi là "ERP".
- Kiểm: `./reel lint:brand`.

## Nhạc (REQUIREMENTS §8)
- Chỉ dùng bài có trong `brand/music/manifest.json`. Nguồn: Pixabay (chính), Mixkit (phụ). Chọn bài: `./reel info nhac <phong-cách>`.
- File nhạc bên thứ ba không nằm trong repo (repo công khai): máy tự tải khi cài, hoặc `./reel music:fetch`.
- Chỉ đăng tự nhiên (organic), không chạy quảng cáo.
- Nhạc `internal-test` chỉ để xem thử, không đăng. Kiểm: `./reel lint:music`.

## Tiếng Việt
- Chuỗi dạng NFC. Composition có `lang="vi"`.
- Khoảng cách dòng dùng `--line-tight` / `--line-normal` để dấu không chạm nhau.

## HyperFrames
- Version pin: CLI `hyperframes@0.8.141` (package.json), plugin Claude Code `v0.8.141`, auto-update tắt.
- **Không tự nâng version.** Chỉ nâng khi `./reel test:render` pass toàn bộ, và ghi vào `docs/decisions.md`.

## Lệnh (chạy từ thư mục gốc, dùng `./reel`, không gọi `pnpm` trực tiếp)

| Lệnh | Việc |
|---|---|
| `bash ./scripts/cai-dat.sh` | Cài/cài lại môi trường (skill `cai-dat`) |
| `./reel doctor` | Kiểm máy |
| `./reel info [loại-video]` | Loại video, phong cách, thứ tự cảnh |
| `./reel new <tên-video>` | Tạo brief mới |
| `./reel hinh <tên-video> [file…]` | Nhận hình/clip MKT gửi (kéo vào chat hoặc bỏ vào `briefs/<tên-video>/hinh/`), đổi HEIC → JPG, liệt kê để xếp vào cảnh |
| `./reel validate <tên-video>` | Kiểm brief + kịch bản (cả bản dựng riêng) |
| `./reel snap <tên-video> [--at=1.2,3.4]` | Dựng + kiểm bố cục + so nền các cảnh + chụp khung hình để tự soát (`out/snap/<tên>/`) |
| `./reel quay-san <tên-video> [file --link=… --tac-gia=… --khong-phai-ai]` | Nhận/liệt kê clip người thật quay sẵn (Pexels/Pixabay) cho kiểu hình `nguoi-that-quay-san`, ghi sổ nguồn |
| `./reel bang <tên-video>` | Bảng khung chính có số khung (`dung-rieng/bang-canh.txt` → `out/snap/<tên>/bang/bang-canh.png`) để MKT duyệt/góp ý theo số khung |
| `./reel info nhip <id-nhạc>` | Nhịp bài nhạc (phách, phách mạnh) để cắt cảnh/nhấn trùng phách |
| `./reel preview <tên-video>` / `--stop` | Mở/tắt bản xem thử (cổng 3002) |
| `./reel render <tên-video>` | Xuất MP4 vào `out/` |
| `./reel make <tên-video>` | validate + build + render |
| `./reel post <tên-video>` | Soạn caption + hashtag |
| `./reel music:fetch` | Tải lại nhạc thiếu |
| `./reel music:add nhac-tu-tim/<file> --link=… --tac-gia=… --mood=…` | Thêm nhạc MKT tự tìm (Pixabay/Mixkit) trên máy này; `--lai` đăng ký lại |
| `./reel test`, `typecheck`, `lint:brand`, `lint:music`, `test:render` | Kiểm tra cho dev |

Cờ chung: `--draft`, `--safe-zone`, `--test-music` (nhạc thử, không đăng).

## Trước khi báo "xong"
- `./reel validate <tên-video>` không còn ✗.
- `./reel render <tên-video>` pass. Bước render đã chạy `hyperframes lint` + `check` và kiểm output: 1080×1920, 30fps, H.264, AAC 48 kHz, −14 LUFS, đúng thời lượng.
- Chế độ dev: thêm `./reel test`, `./reel typecheck`, `./reel lint:brand`, `./reel test:render`.
