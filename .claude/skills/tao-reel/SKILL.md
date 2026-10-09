---
name: tao-reel
description: Dẫn nhân viên marketing làm một video Reel/TikTok/Shorts dọc cho SIPOS, Redsun BOS, Webino hoặc Redsun, từ brief đến file MP4, bằng mẫu video có sẵn của dự án redsun-reels. Dùng khi người dùng gõ /tao-reel, nói "làm reel…", "làm video…", "tạo video TikTok…", hoặc muốn sửa, xem thử, xuất một video trong thư mục briefs/.
---

# Tạo reel

## Người dùng và cách nói chuyện
- Người dùng là nhân viên marketing, **không biết kỹ thuật**. Nói tiếng Việt, câu ngắn, thân thiện.
- Không nói tên file kỹ thuật, JSON, lệnh, lỗi stack trace. Nói "kịch bản", "bản xem thử", "video".
- Mỗi lần chỉ hỏi những gì thật sự cần. Hỏi tối đa 5 câu cho một brief.

## Phạm vi được làm (chế độ MKT)
- Chỉ tạo/sửa file trong `briefs/<tên-video>/`. **Không** sửa `templates/`, `brand/`, `config/`, `scripts/`, `REQUIREMENTS.md`.
- **Không** gọi các creation workflow của HyperFrames (`/hyperframes:general-video`, `/hyperframes:product-launch-video`, `/hyperframes:faceless-explainer`…) và không tự viết HTML composition. Mọi video đi qua mẫu có sẵn.
- Mọi lệnh chạy bằng `./reel <lệnh>` từ thư mục gốc dự án. Nếu `./reel` báo máy chưa cài → dùng skill `cai-dat`.
- Yêu cầu cần sửa mẫu video, thêm phong cách hoặc loại video chưa có → nói rõ "việc này cần dev", ghi vào `briefs/<tên-video>/review.md` mục `## Cần dev`.

## Quy trình 8 bước

### 1. Brief
- Đọc brief có sẵn, hoặc tạo mới: `./reel new <tên-video>`. Tên dạng `YYYY-MM-DD-<sản-phẩm>-<chủ-đề>`, chữ thường không dấu, ví dụ `2026-10-20-sipos-canh-bao-ton-kho`.
- Điền frontmatter `brief.md`: product, videoType (hoặc `auto`), style (để trống nếu MKT không chọn), occasion (dịp lễ nếu có), goal, audience, duration, tone, cta, music (`auto`), assets.
- Chỉ hỏi những gì MKT chưa nói (tối đa 5 câu): sản phẩm, muốn nói điều gì, cho ai xem, dài bao nhiêu giây, muốn người xem làm gì sau đó.
- Brief chỉ ghi điều MKT đã nói. Không tự thêm độ tuổi, con số, ưu đãi.
- `cta`: MKT không nói thì dùng `defaultCta` của sản phẩm trong `brand/products.json` (vd. SIPOS: "Tìm hiểu thêm tại sipos.vn"). **Không** tự đặt "dùng thử miễn phí", "giảm giá"… khi MKT chưa xác nhận có ưu đãi đó.

### 2. Loại video và phong cách
- Xem danh sách: `./reel info`. Chi tiết một loại: `./reel info <loại-video>`.
- `videoType: auto` → đề xuất 1 loại kèm lý do 1 câu.
- Phong cách: MKT chọn thì dùng. Bỏ trống thì dùng mặc định của loại (báo cho MKT biết tên phong cách). Có dịp lễ thì ghi `occasion` (mã trong `./reel info dip-le`) và dùng phong cách theo dịp.
- Chỉ dùng loại video có ✓ và phong cách có ✓ trong `./reel info`. Cái chưa dựng thì nói "phong cách này sẽ có ở bản sau" và gợi ý cái gần nhất.
- Phong cách nằm trong "Nên tránh" của loại đó: hỏi lại MKT một câu, họ vẫn được giữ.

### 3. Concept — **DỪNG chờ MKT chọn**
- Viết 3 concept vào `briefs/<tên-video>/concepts.md`. Mỗi concept: tên, big idea (1 câu), câu hook, góc hook, phong cách gợi ý. Ba concept dùng **ba góc hook khác nhau** (con số, lật ngược định kiến, trước/sau, thương hiệu, sắp thay đổi, câu hỏi nỗi đau). Không dùng góc "thú nhận thất bại".
- Hook: tối đa 2 dòng, mỗi dòng ≤ 40 ký tự, con số viết bằng chữ số. Không viết nhãn của loại video (vd. "Bạn có biết?", "Hướng dẫn") vào hook: mẫu video tự gắn nhãn đó.
- Góc "con số" chỉ dùng khi brief có con số thật do MKT đưa. Không có thì chọn góc khác, hoặc hỏi MKT có số liệu không. Không tự nghĩ ra "3 ngày", "50%", "1000 cửa hàng"…
- Trình bày 3 concept ngắn gọn, hỏi MKT chọn số mấy. Ghi lựa chọn vào cuối `concepts.md`.

### 4. Hình ảnh cần có
- Cảnh kiểu `phone` hoặc `asset` cần ảnh/clip thật trong `assets/<sản-phẩm>/` (ảnh chụp màn hình, quay màn hình, ảnh quán…).
- Thiếu → viết `briefs/<tên-video>/shotlist.md`: số shot, cảnh, địa điểm, mô tả, đạo cụ, ánh sáng, thời lượng. Quay/chụp **dọc 9:16**, chừa trên 220px, dưới 420px, phải 160px không có chữ quan trọng. Nhóm theo địa điểm. **DỪNG** chờ MKT gửi file, hoặc đề xuất làm bản chỉ có chữ (cảnh `text`) nếu MKT muốn làm ngay.
- Không dùng ảnh không rõ nguồn, không lấy ảnh trên mạng.
- **Khách hàng nói**: cần lời khách thật, tên + cửa hàng, và khách đã đồng ý xuất hiện. MKT chưa đưa thì hỏi, không tự viết lời khách.
- **Khuyến mãi / sự kiện**: cần mức giảm, giá, hạn chót, giờ… do MKT đưa (ghi vào brief). Không tự đặt.
- **Trước / sau**: cần ảnh/clip TRƯỚC và SAU thật (hoặc làm bản chỉ có chữ).
- **Tổng kết sự kiện / giới thiệu công ty / tuyển dụng**: cần ảnh/clip thật của sự kiện, đội ngũ (càng nhiều càng tốt, mỗi cảnh montage 2–6 hình).
- **Số liệu**: cần con số thật kèm nguồn do MKT đưa (ghi vào brief, đúng cách viết: "1.200+", "98%"). Không có số thì không làm loại này.
- **Có người nói trước camera**: cần clip MKT tự quay, dọc 9:16, có tiếng, nói rõ; tên + chức danh người nói. Claude không nghe được clip: nhờ MKT ghi lời nói và mốc giây chuyển ý (vd. "0–5s chào, 5–12s kể khó khăn") vào brief, rồi chia cảnh theo các mốc đó. Clip giữ tiếng gốc, nhạc nền tự hạ xuống.

### Nhạc MKT tự tìm (khi MKT muốn dùng bài riêng)
- Chỉ nhận **Pixabay** (pixabay.com/music) hoặc **Mixkit** (mixkit.co/free-stock-music): nhạc không lời, không có chữ "Content ID" trên trang bài. Nguồn khác (YouTube, nhạc ca sĩ, TikTok…): không dùng, báo MKT hỏi Nam.
- Hướng dẫn MKT:
  1. Tải file nhạc (mp3) từ trang bài.
  2. Chụp màn hình trang bài, thấy tên bài, tác giả và chữ license.
  3. Bỏ cả hai vào thư mục **`nhac-tu-tim`** trong dự án, **cùng tên**: vd. `nhac-vui.mp3` và `nhac-vui.png`.
  4. Gửi Claude link trang bài và tên tác giả.
- Claude chạy: `./reel music:add nhac-tu-tim/<file>.mp3 --link=<link> --tac-gia="<tác giả>" --mood=<phong-cách,…>` (mood chọn theo cảm giác bài, id trong `./reel info`). Lệnh báo lỗi gì thì kể lại cho MKT bằng lời thường.
- Thêm xong, bài dùng được ngay trên máy đó. Nhắc MKT báo Nam để đưa bài vào thư viện chung của cả team.
- Sau khi MKT cập nhật bản mới của dự án mà bài tự thêm bị mất: chép lại thư mục `nhac-tu-tim` từ bản cũ, chạy `./reel music:add --lai`.

### 5. Kịch bản — **DỪNG chờ MKT duyệt**
- Viết `briefs/<tên-video>/script.json` theo [references/script-format.md](references/script-format.md).
- Kiểm: `./reel validate <tên-video>`. Sửa đến khi không còn dòng lỗi ✗. Các dòng cảnh báo (bắt đầu bằng dấu chấm than) thì xử lý hoặc báo MKT.
- Tự chấm theo thang trong script-format.md; ghi `selfScore`. Dưới 85 thì sửa (tối đa 3 vòng), không nâng điểm.
- Chọn nhạc: `./reel info nhac <phong-cách>`. Reel cần bắt tai: ưu tiên bài có nhịp rõ, năng lượng hợp phong cách; MKT thấy nhạc nhạt thì đổi bài khác cùng phong cách. Brief để `music: auto` thì lấy bài **đăng được**, dài hơn video, hợp mood; mỗi video nên khác bài với video trước của cùng sản phẩm. Bài "chỉ xem thử" không đăng được.
- Trình bày cho MKT bảng: **Cảnh · Vai trò · Hình ảnh · Chữ trên màn hình · Chuyển cảnh · Thời lượng**. Trên bảng ghi: loại video, phong cách, nhạc, tổng thời lượng, điểm tự chấm.
- Phong cách `vui-nhon` hoặc câu có chơi chữ: nhắc MKT đọc lại câu chữ (hài kiểu Việt cần người Việt chỉnh).

### 6. Xem thử
- MKT đồng ý → `./reel preview <tên-video>`. Bảo MKT mở `http://localhost:3002` để xem.
- MKT muốn xem vùng an toàn ("xem thử có vùng an toàn") → thêm `--safe-zone`: vùng tô đỏ là nơi chữ không được lấn vào (chỉ hiện khi xem thử, không có trong video xuất).
- Lỗi "chỉ để thử nghiệm" → kịch bản đang dùng bài "chỉ xem thử". Đổi sang bài "đăng được" (`./reel info nhac <phong-cách>`), không cần hỏi MKT. Chỉ dùng `--test-music` khi MKT muốn xem nhanh với bài thử và đã biết bản đó không đăng được.

### 7. Sửa theo góp ý
- Ghi góp ý vào `briefs/<tên-video>/review.md` (ngày, nội dung, đã sửa gì). Sửa đúng chỗ trong `script.json`, chạy lại `./reel validate`, rồi `./reel preview <tên-video>`.

### 8. Xuất — khi MKT nói "xuất"
- `./reel render <tên-video>` (thêm `--test-music` chỉ khi MKT đã biết đây là bản nháp không đăng được).
- `./reel post <tên-video>` để soạn caption + hashtag + credit nhạc.
- Báo MKT: đường dẫn `out/<tên-video>.mp4`, thời lượng, dung lượng, và nội dung `post.md` để copy khi đăng. Bản dùng nhạc thử: nói rõ "bản này **không đăng được** vì nhạc thử; khi thư viện có nhạc thật, bạn nói 'xuất lại' là được" (không nhắc lệnh).
- Tắt bản xem thử: `./reel preview --stop`.

## Quy tắc nội dung
- Một video một thông điệp. Video ≤ 45 giây chỉ 1–2 ý chính; dài hơn tối đa 3 ý. Mỗi cảnh ≤ 10 từ chữ chính.
- **Không bịa** con số, giá, ưu đãi (kể cả "dùng thử miễn phí"), tính năng, lời khách hàng, độ tuổi khán giả. Chỉ dùng thông tin MKT nói hoặc có trong `brand/products.json` hoặc `plans/reports/brand-261008-1606-company-product-profiles.md`; thiếu thì hỏi MKT.
- Redsun BOS gọi là "hệ điều hành doanh nghiệp" hoặc "phần mềm vận hành doanh nghiệp", không gọi "ERP".
- Viết đúng tên: SIPOS, REDSUN BOS, Webino, REDSUN.

## Khi có lỗi
- Lỗi từ `./reel validate`: mỗi dòng ✗ đã có câu giải thích; tự sửa kịch bản nếu là lỗi kịch bản, hỏi MKT nếu thiếu thông tin.
- **Thiếu file nhạc** (lỗi "Thiếu file nhạc…", hoặc `./reel doctor` báo thiếu file ở mục Thư viện nhạc): tự chạy `./reel music:fetch`, không hỏi MKT, rồi chạy lại bước vừa lỗi. File nhạc Mixkit/Pixabay không nằm trong dự án mà được tải từ nguồn gốc về máy. Lệnh in "Nhạc: đủ … bài" là xong.
  - Tải lỗi vì mạng: nhờ MKT kiểm tra wifi rồi chạy lại.
  - Báo "file ở nguồn đã khác bản đã duyệt": không dùng bài đó, chọn bài khác cùng phong cách, báo dev để cập nhật thư viện.
  - Sau khi MKT cập nhật bản mới của dự án (tải ZIP mới), nếu thiếu nhạc thì chạy `./reel music:fetch` một lần.
- Lỗi khác: kể lại 1–2 câu đầu bằng lời thường kèm việc MKT cần làm. Nếu lỗi nhắc `out/last-error.log`, nói MKT gửi file đó cho dev. Không dán log.

## Tham khảo
- [references/tinh-huong-mkt.md](references/tinh-huong-mkt.md): MKT nói gì → Claude làm gì (sửa video cũ, đổi nhạc, nhạc tự tìm, lỗi thiếu nhạc, cập nhật bản mới…). Đọc khi MKT hỏi ngoài luồng 8 bước.
- Sổ tay phía MKT: `docs/huong-dan-mkt.md` (MKT đọc tài liệu này; trả lời khớp với nó).
- Loại video, thứ tự cảnh, phong cách mặc định: `docs/video-type-guide.md`
- Phong cách và dịp lễ: `docs/video-style-catalog.md`
- Quy tắc kịch bản đầy đủ: `REQUIREMENTS.md` §6.2, §10.2
