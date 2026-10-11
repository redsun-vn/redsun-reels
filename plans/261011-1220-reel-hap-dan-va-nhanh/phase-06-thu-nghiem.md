# Giai đoạn 6 — 3 video thử, so mù, số liệu sau đăng

## Việc
1. Nam đưa 3 brief (hoặc dùng lại brief "QR chuyển khoản giả" + 2 brief mới), mỗi brief một kiểu hình: minh hoạ, quay sẵn, người thật AI. Mỗi video chạy luồng tự động mới (MKT/Nam chọn concept).
2. Đọc `cost.json` `thoiGian.mayChaySec`: mục tiêu ≤ 900 giây mỗi video. Vượt → xem `theoLenh` và khoảng giữa các lệnh, sửa chỗ chậm nhất, chạy lại. Quay sẵn vượt vì khâu tìm clip → **dừng hỏi Nam**.
3. So mù: mỗi brief có bản cũ (luồng cũ, cùng kiểu hình; brief QR đã có sẵn bản cũ) và bản mới; đặt tên A/B ngẫu nhiên (`out/so-mu/<brief>-A.mp4`, `-B.mp4`, khoá đáp án trong `out/so-mu/dap-an.json`); Nam/MKT chọn bản muốn xem hết. Mục tiêu bản mới thắng ≥ 2/3.
4. Số liệu sau đăng: **Google Sheet chung**, tab "Số liệu video" của file "Research database" (`1W0QxJa_YThp2Z_Vjd7OFNNvRnZeYcCEk8jU60XZBPkM`, tạo 2026-10-11; đưa link vào `docs/huong-dan-mkt.md`). Cột: mã lịch (nối tab Content Calendar), tên video (`briefs/<tên>`), luồng (cũ/mới), kiểu kể, kiểu hình, kênh, ngày đăng, lượt xem, % xem qua 3 giây, % xem hết (đo sau 7 ngày). MKT tự nhập; `./reel post` nhắc dòng cần điền. Claude đọc sheet qua Google Drive khi Nam nhờ so sánh. Đủ ≥ 3 video mới.
5. Chỉnh ngưỡng 12% / 85% nếu 3 video cho thấy cần (ghi decisions).

## Kiểm
`./reel validate`, `./reel render` pass cho cả 3; `./reel test`, `typecheck`, `lint:brand`, `test:render` pass.

## Cần người
Chọn concept, so mù, đăng bài và nhập số liệu: Nam/MKT. Không tự đăng bài.
