# Nhật ký thay đổi

Đánh số `MAJOR.MINOR.PATCH`. Trước 1.0: MINOR tăng khi có tính năng mới, PATCH khi chỉ sửa lỗi. Mỗi bản gắn tag git `vX.Y.Z` và có trang Release trên GitHub. Số bản nằm ở `package.json` (`./reel doctor` in ra).

## 0.1.0 — 2026-10-10
Bản đầu tiên Nam chốt "đã ổn" sau khi thử luồng tự động từ brief ra video.

- **Từ brief ra video tự động** (skill `tao-reel`): MKT đưa brief, Claude tự viết concept, kịch bản, dựng riêng từng video, xuất MP4 + caption; luồng "làm từng bước" khi MKT muốn duyệt.
- **Dựng riêng mỗi video** (skill `dung-video`, `templates/_rieng/`): composition HyperFrames viết riêng, chống bịa số liệu, nhận hình MKT gửi (`./reel hinh`).
- **Nhân vật Việt có khớp**: tư thế tay tự tính khớp, 10 nét mặt theo cảm xúc, dàn nhân vật giữ nhất quán.
- **Bối cảnh vẽ sẵn**: 7 nơi chốn (quán, nhà, tạp hoá, văn phòng, kho, phố, livestream) × ngày/chiều/đêm × 6 tông tường, cộng 3 nền trừu tượng; nền tự chuyển động nhẹ.
- **Tiếng động** tự tổng hợp (15 âm), khai theo giây trong `tieng-dong.txt`, có khoảng lặng trước khoảnh khắc vỡ lẽ.
- **Nhạc**: thư viện 23 bài Pixabay/Mixkit đăng được, dò nhịp (`./reel info nhip`), nhạc MKT tự tìm (`./reel music:add`).
- **Bảng khung chính** (`./reel bang`): một ảnh có số khung để MKT duyệt/góp ý.
- **Tự kiểm**: bố cục/tương phản, mỗi cảnh một nền, không đứng hình, lặng trước vỡ lẽ, chuyển hình trên phách, chuẩn xuất 1080×1920 · 30fps · −14 LUFS.
- **Mẫu dự phòng**: 20 loại video, 19 phong cách từ mẫu có sẵn (8 mẫu), render test ảnh chuẩn.
- Nền tảng: HyperFrames 0.8.141 (pin), Claude Opus 5.5, MacBook Intel/chip M, cài không cần sudo.

Video mẫu: `briefs/2026-10-09-sipos-anh-chuyen-khoan-gia`, `briefs/2026-10-10-sipos-chuyen-khoan-gia-mao`.
