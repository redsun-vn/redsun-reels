---
status: in-progress
created: 2026-10-09
owner: Nam
---

# Dựng riêng mỗi video (bản B)

## Mục tiêu
MKT đánh giá video từ mẫu có sẵn "quá tệ" (chữ trên nền, như slide). Phép thử A/B trên SIPOS 20/10 (`out/so-sanh-sipos-20-10.mp4`): Nam chọn B — Claude Opus 5.5 thiết kế và viết composition HyperFrames riêng cho từng video, "để video có thể thoải mái sáng tạo". MKT vẫn chỉ đưa brief rồi chờ video.

## Ràng buộc
- Giữ: kịch bản đã duyệt là nguồn chữ duy nhất; không bịa số, giá, ưu đãi, lời khách; brand (màu sản phẩm, Montserrat, logo có sẵn); nhạc trong manifest; output 1080×1920 30fps −14 LUFS; render local, không tải mạng.
- HyperFrames giữ bản 0.8.141.
- Chế độ MKT chỉ ghi trong `briefs/`: composition nằm ở `briefs/<tên>/dung-rieng/`.
- Mẫu cũ giữ làm dự phòng (`"build": "template"`).

## Không làm
- Ảnh stock, ảnh AI (giữ quyết định §17).
- Bỏ template cũ, đổi bộ test render cũ.

## Tiêu chí xong
1. `script.json` có `"build": "custom"` → build/preview/render dùng `briefs/<tên>/dung-rieng/index.html`, cùng kiểm chuẩn output như cũ.
2. Bộ dụng cụ `templates/_rieng/` (CSS + JS + composition mẫu) dùng được trong composition.
3. Validate chặn trước khi dựng: thiếu composition, sai thời lượng, sai nhạc, tải mạng, font lạ; **chữ trên màn hình có số/ưu đãi không có trong brief/kịch bản** (trừ phần minh hoạ `data-minh-hoa`).
4. Skill mới `dung-video` + `tao-reel` luồng tự động dùng dựng riêng mặc định.
5. Làm lại 4 video (SIPOS, Webino, REDSUN BOS 20/10; SIPOS Hotel OTA) bằng dựng riêng, `hyperframes check` sạch, xuất đạt chuẩn.
6. Unit test, typecheck, lint, render test cũ vẫn xanh. Docs + decisions §18.

## Giai đoạn
| # | Việc | Trạng thái |
|---|---|---|
| 1 | Bộ dụng cụ `templates/_rieng/` + composition mẫu (bản B viết lại trên bộ dụng cụ) | xong |
| 2 | Pipeline: schema `build`, stage/validate/build/render nhánh custom, `./reel snap` | xong |
| 3 | Kiểm chữ chống bịa cho composition + test | xong |
| 4 | Skill `dung-video`, sửa `tao-reel`, CLAUDE.md, settings | |
| 5 | Làm lại 4 video + brief "Ảnh chuyển khoản giả" (Nam gửi), soát khung hình, xuất | SIPOS 20/10 + Ảnh chuyển khoản giả xong; còn Webino, BOS 20/10, OTA |
| 6 | Docs, decisions §18, REQUIREMENTS §2.3, review, commit | |

## Rủi ro
- Composition viết tay dễ lỗi bố cục/tương phản → `hyperframes check` là cổng bắt buộc + tự soát ảnh chụp khung.
- Chữ sinh bằng JS thoát kiểm chống bịa → quy tắc: chữ hiển thị viết tĩnh trong HTML; dòng JS gán chữ phải ghi `// minh-hoa` và chỉ dùng cho số liệu minh hoạ.
- Mỗi video lâu hơn (~20–30 phút) — Nam chấp nhận ("token không phải vấn đề, chất lượng là ưu tiên").
