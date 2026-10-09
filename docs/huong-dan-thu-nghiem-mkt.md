# Thử nghiệm với team MKT: 10 video (REQUIREMENTS §14)

Mục tiêu: chứng minh một bạn MKT tự làm được video đạt chuẩn mà không cần dev. Đây là tiêu chí xong chính thức của M3 (§14.3) và M2 (MKT tự làm 1 video).

Người phụ trách: MKT lead điều phối, Nam xem kết quả. Mỗi bạn MKT làm 2–3 video. Ghi kết quả vào [phiếu chấm](#3-phiếu-chấm) ở cuối.

## 1. Trước khi bắt đầu
- Máy đã cài theo [README](../README.md#cài-đặt-lần-đầu-khoảng-15-phút). Ghi lại **thời gian cài** (tiêu chí §14.1: ≤ 30 phút, không nhập mật khẩu máy).
- Chuẩn bị **nội dung thật**: tính năng, ưu đãi, số liệu, lời khách đều phải có thật. Claude không được tự nghĩ ra, nên nếu thiếu thì Claude sẽ hỏi.
- Hình ảnh, clip: chép vào thư mục `assets/<sản-phẩm>/` trong dự án (vd. `assets/sipos/`). Gửi file từ điện thoại qua **AirDrop** hoặc cáp, **không qua Zalo/Messenger** vì các app này nén làm mờ hình.
- Không cần biết lệnh. Mọi việc nói bằng lời với Claude.

## 2. Mười tình huống
Các tình huống phủ 10 loại video và ít nhất 3 phong cách. Phong cách để trống thì Claude dùng mặc định của loại video.

| # | Loại video | Sản phẩm | Phong cách | Câu nói với Claude (sửa theo nội dung thật) | Cần chuẩn bị |
|---|---|---|---|---|---|
| 1 | Mẹo "Bạn có biết?" | SIPOS | vui nhộn | "làm reel mẹo cho SIPOS về <tính năng>, 20 giây, cho chủ quán cà phê" | Không cần hình (bản chỉ có chữ) |
| 2 | Ra mắt tính năng | SIPOS | tối giản | "làm video ra mắt tính năng <tên> của SIPOS, 25 giây" | 1–2 ảnh chụp màn hình app |
| 3 | Hướng dẫn nhiều bước | REDSUN BOS | để trống | "làm video hướng dẫn 3 bước <việc> trên REDSUN BOS" | Quay màn hình từng bước, dọc |
| 4 | Khuyến mãi | Webino | khuyến mãi | "làm reel khuyến mãi Webino: <mức giảm, giá, hạn chót>" | Ưu đãi đang chạy thật |
| 5 | Chúc mừng dịp lễ | REDSUN | để trống, dịp 20/10 | "làm video chúc mừng 20/10 của REDSUN, 15 giây" | Không cần hình |
| 6 | Khách hàng nói | SIPOS | tin cậy | "làm video khách hàng nói: <tên khách, cửa hàng, lời khách>" | Lời khách thật, khách đã đồng ý; ảnh hoặc clip khách (nếu có) |
| 7 | Có người nói trước camera | tuỳ chọn | để trống | "làm video có người nói, clip ở assets/…/<tên file>" | Clip tự quay, xem [mục 4](#4-quay-clip-người-nói-cho-tình-huống-7) |
| 8 | Số liệu / thành tích | tuỳ chọn | dữ liệu | "làm video số liệu: <2–3 con số kèm nguồn>" | Con số thật, ghi đúng cách viết ("1.200+", "98%") |
| 9 | Tổng kết sự kiện | tuỳ chọn | năng động | "làm video tổng kết sự kiện <tên sự kiện>, 25 giây" | 6–10 ảnh/clip thật của sự kiện |
| 10 | Trước / sau | SIPOS | điện ảnh | "làm video trước/sau khi dùng SIPOS: <khó khăn trước, kết quả sau>" | Ảnh TRƯỚC và SAU thật, hoặc làm bản chỉ có chữ |

Trong lúc làm:
- Claude đưa 3 hướng ý tưởng. Chọn 1, rồi duyệt bảng kịch bản và sửa câu chữ tới khi ưng.
- Xem thử: nói **"xem thử có vùng an toàn"** để thấy vùng chữ không được lấn ra. Chữ phải nằm trong phần sáng, không đè lên vùng tô đỏ.
- Xuất: nói "xuất". Video nằm ở `out/<tên-video>.mp4`. Claude soạn sẵn caption để copy.
- Ghi lại mọi chỗ khó hiểu, chỗ phải hỏi lại, lỗi Claude báo. Những ghi chú này quan trọng hơn video đẹp.

## 3. Phiếu chấm
Mỗi video một dòng. Copy bảng vào Google Sheet chung.

| Cột | Cách chấm |
|---|---|
| Người làm, ngày | |
| Tình huống (#) | Theo bảng mục 2 |
| Thời gian | Từ lúc có brief (nội dung đã đủ) tới lúc có MP4. Đạt khi ≤ 15 phút (§14.2) |
| Cần dev? | Có / Không. Có thì ghi lý do |
| Dấu tiếng Việt | Xem từng cảnh: dấu đúng, không vỡ chữ, không chạm dòng trên. Đạt khi 0 lỗi |
| Chữ trong vùng an toàn | Xem thử với vùng an toàn: không chữ nào lấn ra. Đạt khi 0 lỗi |
| Đọc kịp | Xem ở tốc độ thường, đọc thành tiếng chữ từng cảnh: đọc hết trước khi cảnh đổi. Đạt khi mọi cảnh kịp |
| Nhạc | Claude báo nhạc "đăng được" (không phải "nhạc thử"). Nhạc tự tìm: làm theo README mục "Dùng nhạc bạn tự tìm". Đạt khi đúng |
| Nội dung đúng sự thật | Không có số, giá, ưu đãi, lời khách mà bạn không đưa. Đạt khi đúng |
| Ghi chú | Chỗ khó, lỗi, góp ý |

Đạt tiêu chí §14.3 khi đủ 10 video, thuộc ít nhất 5 loại video và 3 phong cách, mọi cột "Đạt". Video nào không đạt thì gửi Nam: tên video và ghi chú.

## 4. Quay clip người nói (cho tình huống 7)
Template TalkingHead giữ tiếng gốc của clip, chữ ý chính hiện ở nửa dưới màn hình, nhạc nền tự nhỏ lại khi có người nói.

**Quay**
- Điện thoại **dựng dọc**, camera sau, quay 1080p trở lên. Đặt máy lên chân máy hoặc tựa chắc, ngang tầm mắt người nói.
- Khuôn mặt ở **khoảng 1/3 phía trên** khung hình. Phần dưới màn hình sẽ có chữ, phần trên cùng có logo.
- Ánh sáng chiếu **từ phía trước** mặt (cửa sổ, đèn). Không quay ngược sáng.
- Chỗ yên tĩnh, tắt quạt và điều hoà nếu ồn. Có micro cài áo thì dùng.
- Nói 15–60 giây, câu ngắn. Giữa hai ý **ngừng một nhịp** (khoảng 1 giây) để chia cảnh gọn.
- Bấm quay, chờ 1 giây rồi mới nói. Nói xong, giữ yên 1 giây rồi mới tắt.

**Gửi kèm cho Claude** (ghi vào tin nhắn hoặc brief)
- Tên và chức danh người nói, vd. "Anh Minh · Chủ tiệm tạp hóa Minh Phát".
- Lời nói và mốc giây chuyển ý, vd. "0–5s chào; 5–12s kể cuối ngày mất cả tiếng ghi sổ; 12–17s từ khi dùng SIPOS…". Claude không nghe được clip, nên chia cảnh theo các mốc này.
- Người trong clip đã đồng ý cho đăng.

**Lỗi hay gặp**
- Quay ngang: Claude sẽ báo, cần quay lại dọc.
- Clip ngắn hơn kịch bản: Claude báo clip không đủ dài. Rút ngắn cảnh hoặc quay lại.
- Clip không có tiếng: video chỉ còn nhạc nền. Kiểm tra lại micro.

## 5. Sau thử nghiệm
Nam tổng hợp phiếu chấm vào `docs/decisions.md` (mục M3/M4) và sửa các lỗi MKT gặp. Trước khi đăng hàng loạt, MKT lead nghe lại các bài nhạc đã chọn và đăng thử 5–10 video ở chế độ riêng tư, để kiểm Content ID ([`docs/music-sources.md`](music-sources.md)).
