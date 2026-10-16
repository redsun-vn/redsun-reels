# Nhật ký thay đổi

Đánh số `MAJOR.MINOR.PATCH`. Trước 1.0: MINOR tăng khi có tính năng mới, PATCH khi chỉ sửa lỗi. Mỗi bản gắn tag git `vX.Y.Z` và có trang Release trên GitHub. Số bản nằm ở `package.json` (`./reel doctor` in ra).

## 0.8.0 — 2026-10-16
Video hoạt hình có thêm ba kiểu vẽ (truyện tranh, manga, siêu anh hùng) để bớt nhàm và giữ mắt người xem ngay 3 giây đầu.

- **Kiểu truyện tranh (comic)**: video là chuỗi trang truyện; mỗi nhịp một ô đập vào theo nhạc, lật trang sang cảnh, chấm in báo, bóng thoại viền đen, ô lời dẫn vàng, chữ "BÙM!" trên nền nổ, nhân vật phá khung, trang kết lặp lại trang mở.
- **Kiểu manga**: đen trắng, ô xiên, chỉ màn hình sản phẩm có màu; ô cận mắt, đường dồn, nhân vật hoá chibi khi hoảng, hắc khí "ẦM ẦM" trước cú lật, chớp trắng + đứng hình nghiêng, dấu cảm xúc phóng đại; thế giới trở lại màu khi có sản phẩm.
- **Kiểu siêu anh hùng**: nỗi đau thành kẻ phản diện; người hùng đáp xuống, góc máy thấp, tung tuyệt chiêu (tia năng lượng) đúng lúc sản phẩm làm việc, kẻ xấu vỡ tan; biến hình khi có sản phẩm; áo choàng, mặt nạ, logo sản phẩm trên ngực.
- Mỗi kiểu có **mẫu nhịp riêng** (6 nhịp): kịch bản tự chấm theo mẫu, thiếu nhịp thì viết lại, để video mang đúng chất thể loại chứ không chỉ đổi trang phục.
- Claude tự chọn kiểu hợp nội dung và đổi kiểu giữa các video cùng sản phẩm; MKT muốn kiểu nào thì nói "làm kiểu manga". Video người thật không có các kiểu này.
- Font chữ truyện tranh Bangers (đủ dấu tiếng Việt) chỉ dùng cho chữ tượng thanh; mọi chữ khác vẫn Montserrat.
- **Nhạc do Claude chọn cho từng video** theo câu chuyện và nhịp hình, không cố định theo kiểu vẽ. MKT chê nhạc thì đổi bài mà giữ nguyên hình: các cú nhấn tự dời cho khớp phách bài mới.

## 0.7.0 — 2026-10-15
Video có chiều sâu cả hình lẫn câu chuyện; chữ không còn lọt dưới nút và tên trang của Reels.

- **Hình có chiều sâu**: mỗi cảnh có lớp xa (mờ), lớp giữa (người, đồ vật) và lớp gần sát ống kính (mép quầy, ly nước, lá cây), trượt lệch nhau khi máy đi; ánh sáng có nguồn (chùm nắng, đèn bàn, vệt sáng quét qua màn hình); viền tối và hạt nhẹ suốt video.
- **Chuyển cảnh ngay trong khung hình**: máy lao vào màn hình điện thoại rồi lùi ra ở cảnh sau, tấm ảnh bong khỏi màn hình bay về phía người xem, người lướt sát ống kính kèm cú lia máy, màu tràn kín khung. Mỗi video 1–3 lần, ở khoảnh khắc quan trọng.
- **Câu chuyện có chiều sâu**: mỗi ý tưởng có một so sánh lấy từ đời người xem; mỗi cảnh ghi rõ phải cho thấy gì và không được cho thấy gì; nhân vật đổi tư thế đúng phách nhạc, tắt tiếng vẫn hiểu chuyện.
- **Vùng an toàn Facebook / TikTok, máy tự chặn**: chữ không được sát mép, không lọt dưới cột nút bên phải hay tên trang ở đáy; sai là không xuất được video. Nút kêu gọi đặt ngay trên tên trang, bàn tay bấm chỉ về phía đó.
- Hướng dẫn MKT cho video người thật AI có thoại: duyệt bảng thoại, chuyển cảnh trước / sau.
- Sửa: pháo giấy ở cảnh kết không còn hiện sẵn một chấm nhỏ từ đầu cảnh.

## 0.6.0 — 2026-10-12
Reel hấp dẫn hơn, làm nhanh hơn; video người thật AI có nhân vật nói thoại.

- **Video người thật AI là một mạch phim**: một khung hình chung (một bối cảnh, cảnh toàn đủ mọi người), nhân vật nói thoại khớp môi ngay trong clip, không người dẫn; mỗi câu thoại ghi cách nói hợp độ căng (sếp quát lớn…), câu ngắn ≤ 6 âm tiết để nghe rõ; nhiều nhân vật quay một cú máy liền, đúng số người, người nói lên hình. Quy trình gom ở skill mới `dung-canh-ai`.
- **Kịch bản và bảng thoại duyệt trước khi tạo clip AI**; prompt gửi model lưu trong brief (`ai/prompt.md`, xem trước không tốn tiền), clip thử lưu ở `ai/so-sanh/`.
- **Veo 3.1 Lite có tiếng** là mặc định cho video người thật AI; mọi câu thoại dồn vào một lần tạo để giọng và vùng miền không đổi (ngoại lệ chỉ khi Nam duyệt).
- **Trước / sau rõ ràng**: giữa hai phân cảnh có nhịp chuyển riêng khoảng 1,5 giây (cửa màu sản phẩm đóng mở, chữ "SAU KHI DÙNG …" đập vào); đoạn chốt riêng 3 giây sau mạch AI (logo, câu tổng kết, nút), không đè lên phân cảnh cuối.
- Đọc đúng tên: REDSUN BOS = "Red sun bi-ô-ét", REDSUN = "Red sun".
- Thêm 4 bài nhạc drama (Mixkit).

- **6 kiểu kể**: tiểu phẩm hài, POV "khi bạn là chủ quán…", chuyện có cú lật, mẹo / số liệu, drama văn phòng, drama tổng tài. Ba ý tưởng của một video thuộc ba kiểu kể khác nhau.
- Hai kiểu drama có thêm tiếng động phim ngắn (tèn tèn tén, nhịp tim, bước giày, đứng hình) và nhân vật mặc vest.
- **Claude tự chọn ý tưởng tốt nhất** trong 3 ý tưởng, không hỏi MKT; MKT chỉ chọn kiểu hình. Muốn đổi ý tưởng thì nói sau khi xem video.
- **Người trong video đúng người xem của sản phẩm**: SIPOS là chủ quán, REDSUN BOS là công ty, Webino là chủ website.
- Sản phẩm được vào như cú chốt cuối chuyện (cảnh giải pháp ≥ 12% video, bắt đầu trước 85%), vẫn phải cho thấy sản phẩm gỡ đúng nỗi đau.
- Kịch bản kèm bảng nhịp (ai phản ứng gì, chỗ cười, chỗ lật); tự chấm thêm điểm hấp dẫn.
- **Nhanh hơn**: clip người thật AI và giọng đọc tạo song song, trần tiền vẫn giữ; video ghi lại số phút máy chạy (mục tiêu ≤ 15 phút, không tính lúc chờ bạn trả lời).

## 0.5.0 — 2026-10-11
Luật kịch bản mới: thông tin không lặp lại, thông điệp xuyên suốt.

- **Mỗi thông tin chỉ nói một lần**, bằng lời hay bằng hình. Mở bằng điểm mạnh nhất rồi kể lại thì phần kể lại phải thêm điều mới (vì sao, thế nào); hook giữ mạnh nhất, khi lặp thì sửa cảnh sau.
- **Một câu thông điệp xuyên suốt** (`concept.thongDiep`): mọi cảnh nối về, cảnh kết khép vòng với nỗi đau ở đầu.
- Tự chấm kịch bản lập bảng "thông tin mới của cảnh", trừ 5 điểm mỗi lần lặp.
- Validate cảnh báo khi thiếu câu thông điệp, hoặc hai cảnh trùng phần lớn chữ có nghĩa.

## 0.4.0 — 2026-10-11
Người thật AI tạo từ kịch bản chuyển sang Veo 3.1 Lite: nét 1080p, rẻ gần một nửa.

- **Mặc định Veo 3.1 Lite** cho cách "tạo từ kịch bản" (1080×1920 thật, khoảng 21.000đ/video): mỗi vai nằm trong một lần tạo 8 giây để mặt giữ y hệt, kèm "không muốn" (không nói, không há miệng, không chữ/logo, không thừa tay). Seedance 2.0 Fast là dự phòng khi một vai cần lên hình quá 8 giây hoặc Veo bị lọc hai lần (`mohinh` trong `ai/canh-ai.json`).
- Câu hỏi MKT trước khi viết kịch bản ghi giá mới: khoảng 21.000đ cho cách tạo từ kịch bản.
- Video vượt trần dung lượng (clip AI 1080p) được nén lại phần hình cho vừa chuẩn, giữ tiếng và dấu AI.
- Trần cảnh AI đặt riêng được cho từng video (chỉ Nam nâng); việc tạo clip hỏng hẳn được bỏ khỏi danh sách chờ.

Video mẫu (trên máy Nam): `briefs/2026-10-11-sipos-qr-chuyen-khoan-gia-veo`.

## 0.3.0 — 2026-10-11
Video người thật do AI tạo, MKT chọn kiểu hình kèm số tiền trước khi viết kịch bản.

- **Người thật do AI tạo** (`./reel ai`, OpenRouter, trần 50.000đ/video), MKT chọn một trong hai cách (`cachTaoAi` trong brief):
  - **ảnh nhân vật trước**: ảnh tham chiếu mỗi vai (duyệt mặt) → khung đầu mỗi cảnh → clip Kling 3.0 Std; mặt giữ y hệt;
  - **tạo thẳng từ kịch bản**: clip Seedance 2.0 Fast, nhiều cảnh trong một lần tạo, không cần ảnh nhân vật.
  Sổ nguồn gốc, ước tiền trước mỗi lượt, không gửi lại việc chưa xác nhận, che key; câu luật cứng (người thường, miệng khép, đúng hai tay, không chữ/logo) gắn vào mọi mô tả; đủ 4 lớp nhãn AI.
- **Hỏi MKT trước khi viết kịch bản**: Claude tả video sẽ nhận và số tiền từng kiểu hình (hoạt hình 0đ, người thật quay sẵn 0đ, người thật AI khoảng 28.000đ hoặc 40.000đ) để MKT chọn.
- **Phụ đề lời đọc** hiện từng dòng một, sát đáy vùng an toàn, không che mặt nhân vật.
- **Brief không lên GitHub nữa**: `briefs/` chỉ nằm trên máy (repo giữ mẫu `_example`). Brief cũ xem lại trong lịch sử git (commit `a0d4558`).
- Câu định vị sản phẩm (`brand/products.json` `tagline`): SIPOS "Giải pháp quản lý bán hàng trong thời đại AI", Webino "Nền tảng AI Web Builder".
- README viết lại theo hệ thống hiện tại.

Video mẫu (trên máy Nam): `briefs/2026-10-10-sipos-qr-chuyen-khoan-gia` (người thật quay sẵn), `briefs/2026-10-11-sipos-qr-chuyen-khoan-gia-ai` (người thật AI, ảnh nhân vật), `briefs/2026-10-11-sipos-qr-chuyen-khoan-gia-seedance` (người thật AI, từ kịch bản).

## 0.2.0 — 2026-10-11
Video có giọng đọc AI và hai luật kịch bản chặn từ đầu: 3 giây đầu mạnh nhất, nỗi đau → giải pháp.

- **Giọng đọc AI VieNeu** (skill `giong-doc`, `./reel giong`): mặc định một giọng kể (Duyên Hà My), giọng ngoài khung, mặt người phản ứng im lặng, cảnh kết được đọc, trần 20.000 token/video, nhãn "Do AI sản xuất".
- **Người thật quay sẵn**: người châu Á, khai miệng im/nói, tự cắt đoạn, máy khác tải lại theo sổ nguồn (`./reel quay-san --tai-lai`).
- **LUẬT SỐ 1 — 3 giây đầu**: chọn điểm hấp dẫn nhất của brief (bảng 5 tiêu chí), mở bằng nó; chặn từ bước kịch bản.
- **LUẬT SỐ 2 — nỗi đau → giải pháp**: video phải nêu nỗi đau cụ thể của khách và cho thấy sản phẩm giải quyết nó thế nào; chặn từ bước kịch bản.
- **Chủ động hỏi MKT** khi brief chưa đủ để viết kịch bản đạt luật (hook, nỗi đau, tính năng giải quyết, số liệu).
- **Reel 15–30 giây** là luật cứng.
- Hồ sơ sản phẩm ghi tính năng đã xác nhận (`brand/products.json` `tinhNang`): SIPOS, Webino, REDSUN BOS tự động xác nhận thanh toán khi khách quét mã QR của từng đơn.
- Cách đọc tên sản phẩm cho giọng VieNeu: SIPOS "Xi pốt", Webino "Web-bi-nô", REDSUN BOS "Redsun bê ô ét".
- Bàn tay bấm nút (`RS.tayBam`, `RS.bam`), phụ đề theo giờ giọng thật (`RS.loiSubs`).

Video mẫu: `briefs/2026-10-10-sipos-chuyen-khoan-gia-hook`, `briefs/2026-10-10-sipos-chuyen-khoan-gia-hook-hoat-hinh`.

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
