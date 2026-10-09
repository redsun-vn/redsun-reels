# Sổ tay làm video cho team MKT

Sổ tay này dành cho người làm video, không cần biết lập trình. Mọi việc đều làm bằng cách **nói chuyện với Claude** trong Claude Code. Cài máy lần đầu: xem [README](../README.md#cài-đặt-lần-đầu-khoảng-15-phút).

## 1. Bắt đầu nhanh
1. Mở Claude Code, mở thư mục dự án (`Documents/redsun-reels`).
2. Nói việc bạn muốn làm, ví dụ:
   > làm reel mẹo cho SIPOS về cảnh báo tồn kho thấp, khoảng 20 giây, cho chủ tiệm tạp hoá
3. Claude tự làm hết: chọn ý tưởng, viết kịch bản, chọn hiệu ứng, xuất video. Claude chỉ hỏi khi thiếu thông tin thật (số liệu, ưu đãi, lời khách, ảnh). Xong, Claude gửi đường dẫn video và caption.
4. Xem video, muốn sửa gì cứ nói: "đổi câu mở đầu thành…", "nhạc vui hơn", "hiệu ứng mạnh hơn"…

Muốn tự chọn ý tưởng và duyệt kịch bản trước khi xuất: nói **"làm từng bước"**.

Làm nhiều video một lúc (vd. "làm 3 video 20/10 cho SIPOS, Webino, REDSUN BOS") thì Claude tự làm mỗi video một kiểu khác nhau: phong cách, bố cục, hiệu ứng, để các video không trùng nhau.

Một video từ lúc có nội dung tới lúc có file MP4 mất khoảng 10–15 phút.

## 2. Thư mục bạn cần biết
| Thư mục | Để làm gì |
|---|---|
| `nhac-tu-tim` | **Bạn bỏ nhạc tự tìm** + ảnh chụp license vào đây ([mục 6](#6-nhạc)) |
| `briefs/<tên-video>/hinh` | **Bạn bỏ ảnh, clip** cho video đó vào đây ([mục 4](#4-chuẩn-bị-hình-ảnh-clip)) |
| `briefs/<tên-video>` | Claude lưu brief, ý tưởng, kịch bản của từng video. Ngoài thư mục `hinh`, không cần mở |
| `out` | **Video đã xuất** (`<tên-video>.mp4`) |

Các thư mục khác là của dev, đừng sửa hay xoá.

## 3. Chuẩn bị nội dung trước khi nói với Claude
Claude **không tự nghĩ ra** con số, giá, ưu đãi, tính năng hay lời khách hàng. Thiếu thì Claude sẽ hỏi. Chuẩn bị sẵn sẽ nhanh hơn:
- Sản phẩm: SIPOS, REDSUN BOS, Webino hay REDSUN.
- Muốn nói điều gì (1 ý chính), cho ai xem, dài khoảng bao nhiêu giây.
- Muốn người xem làm gì sau đó. Không nói thì Claude dùng câu mặc định, vd. "Tìm hiểu thêm tại sipos.vn".
- Số liệu, giá, hạn chót, lời khách: ghi **đúng như sẽ hiện trên video**, vd. "1.200+ cửa hàng", "-30%", "đến hết 31/10".
- Khách hàng, người nói trong clip: tên, cửa hàng hoặc chức danh, và **đã đồng ý** xuất hiện.

## 4. Chuẩn bị hình ảnh, clip
Video có hình người thật, quán, màn hình phần mềm sẽ sống động hơn hẳn video chỉ có chữ. Có hình thì gửi, Claude tự xem từng hình và đặt vào cảnh hợp nghĩa (người đang vất vả ở câu mở đầu, người vui ở cảnh lợi ích, ảnh màn hình trong khung điện thoại…). Không có hình thì Claude làm bản chỉ có chữ.

**Cách gửi** (chọn một):
- **Kéo ảnh, clip thẳng vào khung chat** với Claude khi nhờ làm video. Claude tự chép vào đúng chỗ.
- Hoặc bỏ vào thư mục `briefs/<tên-video>/hinh/` (Claude báo tên video khi tạo), rồi nói "mình đã bỏ hình vào, làm lại video".

Tên file gì cũng được, ảnh iPhone (HEIC) cũng được: máy tự đổi.

**Nên chụp, quay gì**
- Người thật đang làm việc: chủ quán ghi sổ, nhân viên tính tiền, khách đang chọn hàng. Nhân viên công ty đóng vai cũng được.
- Ảnh chụp / quay màn hình phần mềm đúng tính năng video nói tới.
- Quán, sản phẩm, không gian cửa hàng.

**Cách chụp, quay**
- **Dọc** (9:16). Chừa trống mép trên, mép dưới và mép phải: logo, chữ, nút của app sẽ đè lên đó. Hình ngang sẽ bị cắt hai bên (Claude sẽ cảnh báo).
- Đủ sáng, không rung. Quay màn hình điện thoại: dùng tính năng ghi màn hình có sẵn của máy, thao tác chậm.
- Chuyển file từ điện thoại qua **AirDrop** hoặc cáp. Đừng gửi qua Zalo, Messenger: các app này nén làm mờ hình.

**Quy định**
- Chỉ dùng ảnh, clip của công ty hoặc tự chụp. Không lấy ảnh trên mạng, không dùng ảnh tạo bằng AI.
- Người trong hình (khách, nhân viên) phải **đồng ý** xuất hiện. Muốn ghi là khách hàng, ghi tên, lời khách: phải nói rõ với Claude, Claude không tự gán.
- Hình chỉ nằm trên máy bạn, không đưa lên kho mã chung.
- Clip người nói trước camera: cách quay ở [hướng dẫn thử nghiệm, mục 4](huong-dan-thu-nghiem-mkt.md#4-quay-clip-người-nói-cho-tình-huống-7).

Muốn biết nên chụp gì cho đúng kịch bản: nói "gợi ý cảnh cần chụp", Claude viết **danh sách cảnh cần quay**.

## 5. Chọn loại video và phong cách
Không chắc loại nào? Cứ kể việc muốn làm, Claude sẽ đề xuất.

| Loại video | Khi nào dùng | Dài | Cần chuẩn bị |
|---|---|---|---|
| Ra mắt tính năng | Có tính năng mới | 20–45s | Ảnh chụp/quay màn hình |
| Demo thao tác | Cho xem cách dùng | 30–60s | Quay màn hình |
| Mẹo "Bạn có biết?" | Một mẹo nhỏ | 15–30s | Không bắt buộc |
| Hướng dẫn 3–5 bước | Dạy từng bước | 30–60s | Ảnh/quay từng bước |
| Trước / sau | Khác biệt khi dùng sản phẩm | 15–30s | Ảnh trước và sau |
| So sánh cũ / mới | Cách cũ và cách mới | 20–40s | Ảnh hoặc chỉ chữ |
| Khách hàng nói | Lời khách thật | 20–45s | Lời khách, tên, đồng ý; ảnh/clip khách |
| Khuyến mãi | Ưu đãi đang chạy | 10–20s | Mức giảm, giá, hạn chót |
| Đếm ngược / teaser | Sắp ra mắt | 10–15s | Ngày ra mắt |
| Chúc mừng dịp lễ | 8/3, 20/10, Tết… | 10–20s | Không bắt buộc |
| Mời sự kiện, webinar | Mời tham dự | 15–30s | Tên, giờ, nơi đăng ký |
| Tổng kết sự kiện | Sau sự kiện | 20–45s | 6–10 ảnh/clip sự kiện |
| Số liệu / thành tích | Khoe con số | 10–20s | 2–3 con số thật, có nguồn |
| Bắt trend / hài | Theo trend | 7–15s | Ý tưởng trend |
| Hỏi đáp (FAQ) | Trả lời câu hay hỏi | 15–30s | Câu hỏi + câu trả lời |
| Giới thiệu thương hiệu | REDSUN là ai | 30–60s | Ảnh đội ngũ, văn phòng |
| Tuyển dụng / văn hoá | Tuyển người | 20–45s | Vị trí tuyển, ảnh đội ngũ |
| Thông báo nhanh | Bảo trì, đổi giờ… | 7–15s | Nội dung thông báo |
| Có người nói trước camera | Bạn tự quay người nói | 15–60s | Clip quay dọc có tiếng, lời nói + mốc giây |
| Thư giãn / không khí quán | Quán đẹp, nhạc nhẹ | 10–20s | Clip quán |

**Phong cách** (19 kiểu: tối giản, sang trọng, vui nhộn, lễ hội, điện ảnh, bí ẩn…): nói "dùng phong cách vui nhộn". Không nói thì Claude dùng kiểu hợp với loại video. Video theo dịp lễ (8/3, 20/10, Halloween, Tết…) tự chọn kiểu hợp dịp. Xem danh sách dịp: nói "có những dịp lễ nào".

## 6. Nhạc
- Video **không có giọng đọc**, chỉ có nhạc nền. Thư viện có sẵn 23 bài Mixkit dùng để đăng được, đã được Nam nghe và duyệt. Claude tự chọn bài hợp phong cách. Muốn đổi bài: nói "đổi nhạc khác vui hơn".
- Bài ghi **"chỉ xem thử"** không đăng được.
- **Dùng nhạc bạn tự tìm:**
  1. Chỉ lấy từ [Pixabay Music](https://pixabay.com/music/) hoặc [Mixkit](https://mixkit.co/free-stock-music/), bài **không lời**, **bắt tai** (có nhịp ngay mấy giây đầu; reel cần giữ người xem). Không dùng nhạc YouTube, nhạc ca sĩ, nhạc thịnh hành trên TikTok.
  2. Tải file mp3 về.
  3. Chụp màn hình trang bài nhạc, thấy tên bài, tác giả và chữ license.
  4. Bỏ cả hai vào thư mục `nhac-tu-tim`, **cùng tên**: `nhac-vui.mp3` và `nhac-vui.png`.
  5. Nói: "thêm nhạc nhac-vui, link <dán link trang bài>, tác giả <tên>".
  6. Báo Nam để đưa bài vào thư viện chung của cả team.
- Video có người nói hoặc khách hàng nói: giữ tiếng gốc, nhạc tự nhỏ lại khi có người nói.

## 7. Câu nói hay dùng
| Bạn nói | Claude làm |
|---|---|
| "làm reel/video … cho SIPOS về …" | Bắt đầu một video mới |
| "chọn ý 2" | Viết kịch bản theo ý tưởng số 2 |
| "cảnh 3 đổi chữ thành …", "bỏ cảnh 4", "ngắn lại còn 15 giây" | Sửa kịch bản |
| "đổi phong cách sang …", "đổi nhạc" | Đổi kiểu hiệu ứng, đổi bài |
| "xem thử" | Mở bản xem thử ở `http://localhost:3002` |
| "xem thử có vùng an toàn" | Xem thử, tô đỏ vùng chữ không được lấn vào |
| "xuất" | Xuất MP4 vào `out/`, soạn caption + hashtag |
| "sửa video <tên> …", "xuất lại video <tên>" | Mở lại video cũ để sửa |
| "các video tôi đã làm" | Liệt kê các video trong `briefs/` |
| "kiểm tra máy", "cài lại" | Kiểm hoặc sửa môi trường máy |

## 8. Đăng bài
- Khi xuất, Claude soạn caption + hashtag. Copy khi đăng.
- **Chỉ đăng tự nhiên** (organic) lên Facebook, Instagram, TikTok, YouTube. **Không chạy quảng cáo trả tiền** với các video này: license nhạc chưa được kiểm cho quảng cáo.
- Không gắn thêm nhạc trong app TikTok/Instagram đè lên video (video đã có nhạc).
- Bị báo bản quyền nhạc (Content ID claim): chụp màn hình thông báo, gửi Nam. Không tự xoá hay kháng nghị.

## 9. Khi có lỗi
- Dự án tự dùng model **Claude Opus 5.5** (tốt nhất cho việc làm video). Đừng đổi model bằng `/model`. Claude báo lỗi model hoặc hết lượt dùng: nhắn Nam.
- Claude sẽ nói lỗi bằng lời thường và việc cần làm. Phần lớn lỗi Claude tự sửa được: kịch bản quá dài, thiếu nhạc trên máy…
- Claude nhắc tới một file log (vd. `out/last-error.log`): gửi file đó cho Nam.
- Máy báo chưa cài hoặc lỗi lạ: nói "kiểm tra máy", rồi "cài lại".
- Cập nhật bản mới của dự án: xem [README, mục Cập nhật bản mới](../README.md#cập-nhật-bản-mới).

## 10. Việc cần dev (báo Nam)
- Thêm mẫu video, phong cách mới, đổi màu, logo, font.
- Dùng nhạc ngoài Pixabay/Mixkit.
- Video cần chạy quảng cáo trả tiền.
- Lỗi lặp lại dù đã "cài lại".
