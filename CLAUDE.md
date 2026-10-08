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
  - Skill chứa quy trình và điểm dừng chờ MKT duyệt; làm ngoài skill là sai quy trình.
- Nói tiếng Việt, câu ngắn, không thuật ngữ, không dán log.
- **Chỉ tạo/sửa file trong `briefs/`.** Không sửa `templates/`, `brand/`, `config/`, `scripts/`, tài liệu.
- Không dùng creation workflow của HyperFrames và không tự viết HTML composition: mọi video đi qua template có sẵn.
- Việc cần sửa template, thêm phong cách hay loại video mới → báo "cần dev".

### Chế độ Dev (chỉ khi người dùng nói rõ "chế độ dev")
- Được sửa template, preset phong cách, config, script.
- Dùng đủ skill HyperFrames. Tên skill có namespace, ví dụ `/hyperframes:hyperframes-core`, `/hyperframes:hyperframes-animation`.
- Sau khi sửa template/preset: `./reel test:render`. Nếu thay đổi hình là cố ý, xem ảnh rồi `./reel test:render --update`.

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
- Chỉ dùng bài có trong `brand/music/manifest.json`. Nguồn: Pixabay (chính), Mixkit (phụ).
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
| `./reel validate <tên-video>` | Kiểm brief + kịch bản |
| `./reel preview <tên-video>` / `--stop` | Mở/tắt bản xem thử (cổng 3002) |
| `./reel render <tên-video>` | Xuất MP4 vào `out/` |
| `./reel make <tên-video>` | validate + build + render |
| `./reel post <tên-video>` | Soạn caption + hashtag |
| `./reel test`, `typecheck`, `lint:brand`, `lint:music`, `test:render` | Kiểm tra cho dev |

Cờ chung: `--draft`, `--safe-zone`, `--test-music` (nhạc thử, không đăng).

## Trước khi báo "xong"
- `./reel validate <tên-video>` không còn ✗.
- `./reel render <tên-video>` pass. Bước render đã chạy `hyperframes lint` + `check` và kiểm output: 1080×1920, 30fps, H.264, AAC 48 kHz, −14 LUFS, đúng thời lượng.
- Chế độ dev: thêm `./reel test`, `./reel typecheck`, `./reel lint:brand`, `./reel test:render`.
