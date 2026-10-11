---
name: chon-kieu-hinh
description: Hỏi MKT chọn kiểu hình cho một video của redsun-reels — "minh hoạ" (nhân vật và bối cảnh vẽ, bản hiện tại), "người thật quay sẵn" (clip Pexels/Pixabay) hay "người thật do AI tạo" (luôn có nhãn nội dung AI) — ghi vào brief và giữ các luật cứng không được vượt. Dùng ngay sau khi tạo brief (skill tao-reel bước 1, cả luồng tự động), hoặc khi MKT nói "dùng người thật", "người thật AI", "clip Pexels", "video có người thật", "đổi sang minh hoạ", "đổi kiểu hình".
model: claude-opus-5-5
---

# Chọn kiểu hình

Nam chốt 2026-10-10 (REQUIREMENTS v0.5 §7.4–7.5, `docs/decisions.md` §22–24). Mỗi video có **một** kiểu hình, ghi ở frontmatter `brief.md`:

| `kieuHinh` | Là gì | Dựng thế nào |
|---|---|---|
| `minh-hoa` | Nhân vật người Việt vẽ phẳng, bối cảnh vẽ sẵn, hình/clip thật MKT gửi (bản hiện tại) | skill `dung-video` như hiện nay |
| `nguoi-that-quay-san` | Clip/ảnh người thật **quay thật** từ Pexels/Pixabay (không phải AI), dùng theo giấy phép nguồn | `./reel quay-san` nhận clip, skill `dung-video` ghép (REQUIREMENTS §7.5) |
| `nguoi-that-ai` | Cảnh có người trông như thật do AI tạo, ghép vào video dựng riêng, **luôn có nhãn AI** | skill `dung-video` + quy trình REQUIREMENTS §7.4 (cần dev bật, xem luật 2) |

Nói với MKT tiếng Việt, câu ngắn, không thuật ngữ. Chỉ ghi file trong `briefs/<tên-video>/`.

## Khi nào hỏi
- Video mới, sau `./reel new`, **trước khi viết concept và kịch bản**: **luôn hỏi**, kể cả ở luồng tự động (Nam 2026-10-11: "yêu cầu hỏi MKT trước khi bắt đầu viết kịch bản, giải thích rõ về video output, số tiền để MKT chọn"). Chưa có câu trả lời thì **không viết concept, kịch bản**, không tạo gì tốn tiền. Gộp vào cùng lần hỏi những câu brief còn thiếu (mục "Brief đủ chưa" của `tao-reel`).
- Không hỏi khi lời MKT đã nói rõ ("làm bản hoạt hình có giọng", "người thật AI, tạo từ kịch bản"): ghi luôn, nhắc lại một câu kèm số tiền dự kiến để MKT biết.
- MKT muốn đổi kiểu hình của video đang làm: báo số tiền của kiểu mới, hỏi xác nhận một lần rồi đổi.

## Cách hỏi: tả video sẽ nhận + số tiền, rồi mới hỏi
**1. Một đoạn ngắn tả video MKT sẽ nhận** (viết trong tin nhắn, ngay trước câu hỏi; lấy số từ brief, không bịa):
> Bạn sẽ nhận một file video dọc 9:16 dài khoảng {duration} giây, có nhạc nền, chữ nhấn, phụ đề, logo {sản phẩm} và lời kêu gọi "{cta}" ở cuối, kèm caption + hashtag soạn sẵn và một ảnh bảng khung chính để góp ý theo số khung. Một video mất khoảng 10–15 phút (người thật AI lâu hơn 5–10 phút). Mình hỏi bạn chọn kiểu hình trước khi viết kịch bản, vì kịch bản viết khác nhau cho từng kiểu.

**2. AskUserQuestion, một lượt** (không quá 4 câu, gộp câu brief còn thiếu):
- Câu 1 "Kiểu hình" (4 lựa chọn; mỗi lựa chọn ghi **trông thế nào · số tiền · lưu ý**):
  - **"Hoạt hình (khuyên dùng)"** → `minh-hoa`: nhân vật Việt vẽ phẳng, bối cảnh quán xá vẽ sẵn, tiếng động, chuyển cảnh theo nhạc. **0đ.** Làm được mọi loại video.
  - **"Người thật quay sẵn"** → `nguoi-that-quay-san`: clip người châu Á thật (Pexels/Pixabay, miễn phí), Claude tìm và cắt, ghép với màn hình sản phẩm. **0đ.** Người trong clip là người lạ: không làm khách hàng, nhân viên, người khen sản phẩm; bối cảnh có thể nước ngoài.
  - **"Người thật AI · duyệt ảnh nhân vật"** → `nguoi-that-ai` + `cachTaoAi: anh-vai`: bạn duyệt gương mặt trước, mặt giữ y hệt suốt video; phần lớn khung là ảnh có máy quay chuyển động, 1–2 khoảnh khắc cử động thật. **Khoảng 28.000đ** (tối đa 50.000đ). Luôn có nhãn "Do AI sản xuất".
  - **"Người thật AI · tạo từ kịch bản"** → `nguoi-that-ai` + `cachTaoAi: tu-chu`: không cần duyệt ảnh, nhân vật cử động ở mọi cảnh như phim, hình nét 1080p (Veo). **Khoảng 21.000đ** (tối đa 50.000đ). Luôn có nhãn "Do AI sản xuất".
- Câu 2 "Giọng đọc" (chỉ dùng khi chọn hoạt hình; video người thật mặc định có giọng): **"Không giọng (chữ + nhạc)"** · **"Có giọng đọc"** (giọng kể nữ miền Nam Duyên Hà My đọc lời của brief; dùng token gói giọng đọc, ~1.500 token/video trong trần 20.000, không tốn thêm tiền; video có nhãn "Do AI sản xuất").
- Loại video cấm người thật (`forbiddenVideoTypes`: lời khách hàng, người nói trước camera, tổng kết sự kiện, tuyển dụng, giới thiệu công ty): bỏ các lựa chọn người thật, nói lý do một câu.
- Số tiền: lấy từ video mẫu gần nhất (`ai/nhat-ky.json` `chiPhi`) và trần `config/cost.ts` `aiCapVndPerVideo`; giá model đổi thì nói "khoảng". Quy trình người thật AI tắt (`enabled: false`): ghi "(chưa dùng được)" ở hai lựa chọn AI.

**3. Ghi lựa chọn** vào `brief.md`: frontmatter `kieuHinh` (và `cachTaoAi` khi người thật AI); phần nội dung một dòng `Lựa chọn MKT: <kiểu hình> — chi phí dự kiến <số>đ` (và "Giọng đọc: có — <giọng>" / "Giọng đọc: không" với hoạt hình). Chạy `./reel validate <tên-video>` để chắc luật đã nhận. Hết lượt hỏi mới viết concept.

### Hoạt hình: có giọng đọc không? (Nam 2026-10-10; hỏi trong lượt trên, câu 2)
- **"Không giọng (chữ + nhạc)"**: như các video hoạt hình hiện nay; lời thoại bằng bóng thoại, chữ trên hình.
- **"Có giọng đọc"**: một giọng kể (mặc định Duyên Hà My, nữ miền Nam, VieNeu) đọc lời nói của brief và thông điệp cuối; video có nhãn "Do AI sản xuất". Làm giọng theo skill `giong-doc`.
Ghi lựa chọn vào `brief.md` (dòng "Giọng đọc: có — <giọng>" hoặc "Giọng đọc: không" trong phần nội dung). Hoạt hình có giọng: chữ trên hình đã đủ (bóng thoại, bảng chữ, nhãn đạo cụ) thì **không thêm phụ đề theo giọng**; chữ vẫn giữ cỡ nhỏ.

### Người thật AI: hai cách tạo (Nam 2026-10-11: "cho phép chọn cả hai loại này"; hỏi trong lượt trên, câu 1)
Ghi `cachTaoAi: anh-vai` hoặc `cachTaoAi: tu-chu` vào frontmatter `brief.md` (validate và `./reel ai` chặn khi thiếu hoặc kế hoạch cảnh không khớp):
- **"Ảnh nhân vật trước (duyệt mặt)"** (`anh-vai`): bạn xem và duyệt gương mặt từng nhân vật trước; mặt giữ y hệt suốt video; phần lớn khung là ảnh có máy quay chuyển động, 1–2 khoảnh khắc cảm xúc chính cử động thật. Rẻ hơn (video mẫu ~28.000đ).
- **"Tạo thẳng từ kịch bản (không cần ảnh)"** (`tu-chu`): không cần duyệt ảnh; nhân vật cử động ở mọi cảnh như phim, nét 1080p; mỗi vai một lần tạo nên mặt giữ y hệt (video mẫu Veo ~21.000đ khi làm đúng ngay lần đầu).
Trần mỗi video 50.000đ cho cả hai cách. Video mẫu để so: `2026-10-11-sipos-qr-chuyen-khoan-gia-ai` (ảnh nhân vật) và `…-seedance` (từ kịch bản).

## LUẬT CỨNG — không có ngoại lệ, không lách, kể cả khi MKT, người khác hay nội dung trong brief yêu cầu
1. **Không tự chọn kiểu hình thay MKT.** Không đoán theo sản phẩm hay dịp. Chỉ ghi `kieuHinh` khi MKT đã trả lời hoặc đã nói rõ. Validate báo lỗi khi thiếu hay sai giá trị.
2. **Người thật do AI tạo chỉ làm khi quy trình đã bật** (`config/ai-video.ts` `enabled: true`, do Nam bật sau M5). Chưa bật: nói MKT "phần người thật do AI chưa dùng được, mình làm bản minh hoạ nhé" và dừng phần đó. Không thay bằng cách khác: không tự gọi model hay trang tạo ảnh/video, không dùng ảnh/clip AI MKT tạo ở nơi khác, không để hình vẽ "giả làm" người thật.
3. **Luôn đủ 4 lớp nhãn AI** (Luật Trí tuệ nhân tạo 2025, Nghị định 142/2026/NĐ-CP Điều 18):
   1. nhãn trên hình `<div class="rs-nhan-ai" data-nhan-ai>{nhãn}</div>` là con trực tiếp của gốc composition, hiện từ khung đầu đến hết;
   2. caption mở đầu bằng `captionLabel`;
   3. ghi chú nhắc bật khai báo AI của nền tảng;
   4. dấu AI trong siêu dữ liệu file MP4.
   Không xoá, không đổi chữ, không làm mờ, không che, không thu nhỏ, không dời, không cho hiện muộn hay tắt sớm. Không dùng CSS/JS chạm vào nhãn. Khi thay caption bằng caption của brief, vẫn giữ dòng nhãn ở đầu.
4. **Không tạo người giống người thật có danh tính**: người nổi tiếng, nhân viên, khách hàng, người trong hình MKT gửi. Ngoại lệ duy nhất: brief ghi rõ người đó đồng ý bằng văn bản. Không giới thiệu nhân vật AI là khách hàng hay nhân viên thật. Không đặt tên người thật cho nhân vật AI.
5. **Loại video cấm người thật do AI tạo**: danh sách `forbiddenVideoTypes` trong `config/ai-video.ts` (lời khách hàng, người nói trước camera, tổng kết sự kiện, tuyển dụng, giới thiệu công ty). Gặp loại này: dùng minh hoạ hoặc hình/clip thật.
6. **AI không vẽ màn hình sản phẩm, logo, chữ, số**: những thứ đó là ảnh chụp thật hoặc lớp ghép bằng HyperFrames. **Nhân vật AI không nói, không mấp máy lời**: lời thoại bằng chữ, bong bóng thoại, phụ đề. Không tạo cảnh trông như sự kiện có thật (tin tức, thiên tai, cơ quan nhà nước).
7. **Chỉ dùng cảnh AI do quy trình của dự án tạo**: file nằm trong `briefs/<tên>/ai/` và có trong `ai/nhat-ky.json` (model, mô tả tạo). Video kiểu `minh-hoa` không được dùng file nào trong `ai/`.
8. **Không sửa luật.** Không sửa `config/ai-video.ts`, `scripts/lib/kieu-hinh-rules.ts`, phần nhãn trong `templates/_rieng/rieng.css`, không bật `enabled`, không thêm cờ bỏ qua kiểm. Chỉ Nam sửa ở chế độ dev, và phải ghi `docs/decisions.md`.
9. **Validate hay render báo lỗi của luật này thì không tìm đường vòng.** Ví dụ đường vòng bị cấm: đổi kiểu hình sang minh hoạ trong khi vẫn dùng cảnh AI, đổi tên thư mục `ai/`, chép cảnh AI sang `hinh/`, viết nhãn bằng ảnh thay cho chữ. Báo MKT bằng lời thường, sửa đúng chỗ.
10. **Đổi kiểu hình** chỉ khi MKT yêu cầu. Đổi sang minh hoạ thì bỏ hết cảnh AI và clip quay sẵn khỏi video, rồi chạy lại `./reel post`.
11. **Người thật quay sẵn: chỉ Pexels và Pixabay**, link trang của đúng một clip, nhận qua `./reel quay-san` (ghi sổ `quay-san/nguon.json`). Trước khi chạy lệnh với `--khong-phai-ai`, **mở trang clip kiểm** clip không bị đánh dấu "AI generated"/do AI tạo; không chắc thì không dùng. Không tự tải clip từ nguồn khác, không chép clip vào `hinh/` để lọt kiểm.
12. **Người trong clip quay sẵn là người lạ** (giấy phép Pexels/Pixabay):
    - không đóng vai xấu (kẻ gian, lừa đảo, người gửi ảnh chuyển khoản giả, phạm pháp), không đặt vào tình huống xấu hổ hay xúc phạm (vai xấu thì dùng nhân vật minh hoạ);
    - không gán lời khen, lời giới thiệu sản phẩm, không đặt như người đại diện cạnh logo;
    - không gọi là khách hàng, nhân viên, đội ngũ hay sự kiện của mình;
    - bỏ clip có logo/thương hiệu khác rõ ràng.
    Không trộn cảnh AI vào video quay sẵn.

## Người thật quay sẵn: dựng vai và cảm xúc (bắt buộc, mọi video)
Nam 2026-10-10: "nhân vật chưa đủ, cảm xúc chưa đúng; không quan trọng bối cảnh nước ngoài, tập trung vào nhân vật, cảm xúc". Nam 2026-10-10: "chủ thể là người châu Á". Thứ tự ưu tiên khi chọn clip: **người châu Á → đúng người cho vai → đúng cảm xúc trên mặt → mặt đủ to → bối cảnh** (bối cảnh nước ngoài, phông studio đều chấp nhận). Người không phải châu Á không dùng cho vai lộ mặt (validate chặn khi sổ nguồn chưa xác nhận `--chau-a`).
1. **Dàn vai trước khi tìm clip**: liệt kê mọi vai có trong brief (chủ quán, nhân viên, khách…), ghi bảng `vai · người mẫu · cảm xúc cần ở từng khung` vào `storyboard.md`. Brief có hai vai thì cần hai người, không gộp một người đóng hai vai.
2. **Một vai là một người suốt video**: chọn người mẫu có **loạt clip cùng buổi quay** đủ các cảm xúc vai đó cần. Mẹo: mở trang clip, xem mục "More like this" và các mã clip gần nhau (cùng tác giả, cùng buổi). Loạt người châu Á đã thấy tốt (Pexels): **Tima Miroshnichenko** mã 8724215–8724414 (người mẫu tóc đen thẳng, phông studio; áo đỏ: cau mày nói bực 8724219, chỉ tay bực 8724215, khóc 8724225; áo sọc: cười lớn 8724299, tươi 8724317; áo xanh: ôm đầu lo 8724318), **Antoni Shkraba** mã 7988835–7988852 (tóc bob, áo len kem, tiệm làm đẹp hồng: nhìn điện thoại rồi cười 7988848, cười 7988846, nhíu mày "Ủa?" 7988852), **MART PRODUCTION** mã 8458490–8458632 (áo xám, phông xám: sợ hãi ôm miệng, co người; có nhện/rắn trong khung, phải cắt khung), **Pavel Danilyuk** mã 7191xxx (áo len trắng, bếp: điện thoại + laptop, bình thường). Dò cả loạt: các mã liền nhau thường cùng buổi quay; tải một khung mỗi clip qua link tải để xem nhanh.
3. **Vai xấu (kẻ gian, khách gửi ảnh giả…) không lộ mặt**: chỉ bàn tay, sau lưng, bóng (`--cam-xuc=khong-mat`). Không dùng người lộ mặt cho vai xấu.
4. **Tìm theo cảm xúc, không theo bối cảnh**: gõ tiếng Anh trên Pexels/Pixabay, lọc dọc (`?orientation=portrait`):
   | Cảm xúc | Từ khoá |
   |---|---|
   | `cuoi` | smiling woman, happy cashier, woman laughing |
   | `tap-trung` | woman working laptop, counting money, calculator |
   | `nhiu-may` / `nghi` | confused woman, frowning, skeptical, woman making facial expressions |
   | `lo-lang` | worried woman, stressed, hands on head, upset woman |
   | `sung-sot` | shocked woman, surprised, mouth open |
   | `buon` | sad woman, disappointed |
   | `nhe-nhom` / `tu-tin` | relieved, great news, excited woman, celebrating |
5. **Xem từng khung trước khi chọn**: tải clip, ghép dải khung mỗi 1.5 giây, mở xem. Chọn đúng đoạn có nét mặt rõ (đặt `data-media-start` vào đoạn đó), ghi `--cam-xuc` đúng cảm xúc **thấy trên mặt** trong đoạn dùng. Khoảnh khắc cảm xúc chính quay cận: đầu người cao ≥ 300px trên khung 1920.
6. **Cấm giả cảm xúc**: không dùng ảnh dừng mặt bình thường thay cho "sững sờ", không dùng mặt cười cho khoảnh khắc lo, không để chữ/bong bóng che mặt ở khoảnh khắc cảm xúc. Thiếu clip đúng cảm xúc cho một vai → đổi người mẫu khác có đủ loạt cho vai đó; vẫn không có thì báo MKT, không hạ yêu cầu.
7. **Nhận clip** (ưu tiên tự cắt từ Pexels để máy khác tải lại được): `./reel quay-san <tên> --link=<trang clip> --tu=<giây> --dai=<giây> --ten=<tên-file> --tac-gia=… --vai=<vai> --nguoi="<tác giả, đặc điểm người>" --cam-xuc=<cảm xúc> --chau-a --khong-phai-ai` (tải đúng đoạn, đổi về dọc 1080×1920, ghi cách cắt vào sổ). Clip MKT gửi file: `./reel quay-san <tên> <file> …` (cùng cờ). Mỗi đoạn dùng một cảm xúc khác nhau của cùng clip thì cắt thành file riêng, khai riêng. Máy khác (MKT) mở video: `./reel quay-san <tên> --tai-lai` tải lại mọi clip còn thiếu; clip không lên repo, sổ nguồn `quay-san/nguon.json` thì có.
8. **Có giọng đọc**: video có nhân vật nói thì làm giọng theo skill `giong-doc` (mặc định một giọng kể Duyên Hà My; mỗi nhân vật một giọng chỉ khi MKT yêu cầu). **Giọng ngoài khung**: lời thoại chỉ đặt lên cảnh không thấy mặt người nói; mặt người là phản ứng im lặng — chọn đoạn miệng im (`--mieng=im`: cười, khóc, nhíu mày, mím môi, chống cằm, ôm đầu), không dùng đoạn người mẫu đang nói. Lời khen sản phẩm chỉ trên cảnh màn hình.

## Người thật do AI tạo: tạo cảnh (Nam bật 2026-10-11, M5)
Nguồn: OpenRouter (`OPENROUTER_API_KEY` trong `.env`, `config/ai-video.ts`). Trần cảnh AI **50.000đ/video** (`config/cost.ts` `aiCapVndPerVideo`). Hai cách theo `cachTaoAi` của brief:
- **`anh-vai`** (bước 1–6 dưới): ảnh **Seedream 5.0 Flash** (~470đ/ảnh), clip **Kling 3.0 Std** từ khung đầu (~11.000đ/clip 4 giây; Seedance từ chối ảnh có người). Mỗi video **1–2 clip 4 giây** cho khoảnh khắc cảm xúc chính, các khung người khác là **ảnh AI + chuyển động máy quay HyperFrames**.
- **`tu-chu`** (mục "Tạo thẳng từ kịch bản" dưới): clip **Veo 3.1 Lite** 1080p tạo từ mô tả (mặc định, ~1.300đ/giây; dự phòng Seedance 2.0 Fast 720p ~2.360đ/giây), không ảnh vai, không khung đầu.
1. **Kế hoạch cảnh** `ai/canh-ai.json` theo bảng khung chính: `dan` (mỗi vai một mô tả ngoại hình tiếng Anh: tuổi, tóc, trang phục đời thường; không tên, không "giống ai") và `canh` (mỗi khung cần người: `id`, `khung` = số khung trong `bang-canh.txt`, `vai`, `camXuc`, `moTa`; khung chỉ thấy tay/vật thì `vai: []`; clip thì `video: true`, `chuyenDong`, `giay` ≥ 4). Vai xấu không lộ mặt (chỉ tay). **Tư thế đơn giản** (Nam 2026-10-11: ảnh vai đầu tiên thừa một bàn tay, "nên đơn giản hoá tư thế để tránh sai sót"): ảnh vai hai tay buông, tay không cầm gì; khung có mặt người thì cắt ngang ngực, tay ngoài khung hoặc đặt yên trên quầy; khung tay thì một bàn tay cầm một vật; không tay đan, khoanh tay, cầm nhiều đồ, chạm mặt. Khi xem ảnh, **đếm tay từng người** trước tiên. **Cảm xúc nhân vật khớp giọng** (Nam 2026-10-11: "quan trọng nhất là cảm xúc của video, kết hợp từ nhân vật với giọng nói"): mỗi khung AI ghi câu giọng đang đọc trên nó (`dung-rieng/loi-doc.json`) và lấy đúng cảm xúc, cường độ của câu đó; `moTa` tả nét mặt cụ thể (mắt, chân mày, miệng, vai), không chỉ một chữ "sad"; clip đặt ở câu cảm xúc mạnh nhất (lo lắng khi kiểm thiếu tiền, nhẹ nhõm khi tự xác nhận), cử động mặt đổi theo nhịp câu. Màn hình điện thoại trong cảnh để trống/quay đi: màn hình SIPOS, ảnh chuyển khoản, chữ, số ghép bằng HyperFrames.
2. `./reel ai <tên>` → ảnh tham chiếu mỗi vai `ai/vai-<vai>.png`. **Gửi người duyệt** (SendUserFile nếu có): người Việt, đời thường, không giống người nổi tiếng. Duyệt → ghi `"duyet": true` cho vai đó.
3. Chạy lại → khung đầu mỗi cảnh `ai/<id>-dau.png` (giữ mặt theo ảnh vai). **Claude mở xem từng khung**: tay đủ ngón, mặt, răng, mắt, không chữ rác/logo, đúng người như ảnh vai, đúng cảm xúc, miệng khép. Lỗi → sửa `moTa`, `./reel ai <tên> --canh=<id> --lai`. Đạt → `"duyetKhung": true`.
4. `./reel ai <tên> --video` → clip `ai/<id>.mp4` cho cảnh `video: true` (720×1280, không tiếng). Xem dải khung của clip như khung đầu; lỗi thì làm lại một lần nếu còn trần, không thì dùng ảnh khung đầu.
5. Lệnh ước tiền trước mỗi lượt, chạm trần thì dừng. Báo "đã gửi nhưng chưa xác nhận được" thì **không gửi lại**: chạy lại cùng lệnh, máy hỏi tiếp đúng việc đó. Báo "không đủ tiền" (402): nhắn Nam nạp tài khoản OpenRouter.
6. Dựng theo skill `dung-video`: ảnh/clip đặt `src="ai/<file>"`, nhãn AI như luật 3. Bảng khung chính ghi rõ khung nào là cảnh AI.

### Tạo thẳng từ kịch bản (`cachTaoAi: tu-chu`)
Chọn model bằng `"mohinh"` ở đầu `ai/canh-ai.json`: **`veo` (mặc định**, Nam 2026-10-11: chất lượng ngang Seedance, rẻ gần một nửa; Veo 3.1 Lite **1080×1920**, ~1.300đ/giây, mỗi lần **chỉ 4, 6 hoặc 8 giây**) hoặc `seedance` (Seedance 2.0 Fast 720p, 4–15 giây mỗi lần, ~2.360đ/giây). **Chuyển sang `seedance`** khi một vai phải lên hình quá 8 giây (chia hai lần tạo Veo thì mặt lệch), hoặc Veo bị lọc nội dung hai lần cho cùng cảnh. Kịch bản cho Veo (thử 2026-10-11):
- Veo chỉ giữ cùng người **trong một lần tạo**: mỗi nhân vật nằm trong đúng một lần tạo (vd. một lần 8 giây cho mọi khoảnh khắc của chủ quán, một lần 8 giây cho nhân viên + tay khách), không chia theo thứ tự câu chuyện.
- Veo hay mở miệng như đang nói: máy gửi kèm `negativePrompt` (không nói, không há miệng, không chữ/logo, không thừa tay); vẫn soát dải khung.
- Cảnh ngắn hơn 1,5 giây Veo hay làm ngắn lại; cảnh cảm xúc nhẹ (cúi mắt) Veo làm nhạt: tả mạnh hơn.
- Lượt bị lọc nội dung **vẫn bị tính tiền**: không gửi tham số lạ (`personGeneration` bị lọc), chừa trần cho một lượt hỏng.
1. Viết `ai/canh-ai.json` như trên, nhưng mỗi cảnh là **một lần tạo nhiều cảnh nhỏ**: `video: true`, `tuChu: true`, `giay` 4–15, `vai` = mọi vai có mặt (để máy tả ngoại hình), `moTa` chia mốc giây: `Shot 1 (0-2.5s): … Shot 2 (2.5-5s): …`. Gom các cảnh cùng nhân vật vào một lần tạo để giữ cùng mặt (vd. một lần 12 giây cho nửa đầu câu chuyện, một lần 5 giây cho phần giải pháp). Tổng giây × ~2.360đ phải dưới trần, chừa chỗ làm lại một đoạn ngắn.
2. Mỗi cảnh nhỏ: mốc giây khớp câu giọng đọc sẽ đặt lên nó, tả nét mặt cụ thể, tư thế đơn giản (tay ngoài khung), miệng khép ("lips stay closed, smiling without speaking").
3. `./reel ai <tên> --video` (không có bước ảnh vai, khung đầu). Cắt dải khung 2 khung/giây, soát từng cảnh nhỏ: đúng người, đếm tay, miệng, chữ rác. Đoạn miệng mở như đang nói thì không dùng.
4. Dựng: mỗi đoạn dùng là một `<video src="ai/<id>.mp4" data-media-start="<giây trong clip>" data-duration="…">` đặt đúng câu đọc; cần kéo dài thì `data-playback-rate` (0,5–0,9). Ảnh/màn hình ghép lên vật đang cử động trong clip (điện thoại) thì không dán khít được: cho ảnh lao về phía người xem, phóng to che hết vật đó.


## Luật được kiểm bằng máy (lỗi ✗ chặn dựng/xuất)
| Luật | Kiểm ở |
|---|---|
| 1 thiếu/sai `kieuHinh` | `./reel validate` (`scripts/lib/kieu-hinh-rules.ts` `kieuHinhIssue`) |
| 2 quy trình chưa bật | validate |
| 3.1 nhãn trên hình: có, đúng chữ, đúng class, ngoài clip, không style riêng, CSS/JS không chạm | validate (`labelIssues`); `./reel snap` báo khi chữ khác đè lên nhãn |
| 3.2 caption có nhãn | validate (đọc `post.md`); `./reel post` tự chèn |
| 3.4 dấu AI trong file | `./reel render` ghi và kiểm lại, thiếu thì không ra file |
| 5 loại video cấm, phải dựng riêng | validate |
| 7 cảnh AI có trong nhật ký; minh hoạ không dùng `ai/` | validate |
| Cảnh AI: kế hoạch hợp lệ (vai có khai, đúng thứ tự khung, clip có chuyển động, không mô tả giống người có danh tính), câu luật cứng luôn gắn vào mô tả gửi model, trần chi, việc chưa xác nhận không gửi lại | `./reel ai` (`scripts/lib/ai-scene-spec.ts`, `scripts/lib/openrouter-ai.ts`) |
| 11 clip quay sẵn: có trong sổ, đúng nguồn/link, có tác giả, đã kiểm không phải AI; minh hoạ không dùng `quay-san/`; không trộn cảnh AI; loại video cấm | `./reel quay-san` (từ chối khi thiếu) + validate |
| Dựng vai: mỗi clip có vai, người mẫu, cảm xúc (trong danh sách); một vai chỉ một người mẫu | `./reel quay-san` + validate |
| Người lộ mặt trong clip quay sẵn là người châu Á (`--chau-a`) | `./reel quay-san` + validate |
| 4, 6, 12, dựng vai 1/3/5/6 người có danh tính, AI vẽ màn hình/chữ, nhân vật nói, vai xấu lộ mặt/ngụ ý ủng hộ, đủ vai theo brief, cảm xúc đúng từng khung, mặt đủ to | Claude soát từng cảnh và bảng khung chính (`./reel bang`, ghi vai + cảm xúc ở mỗi khung); máy chưa kiểm được |

## Báo MKT sau khi chọn
- Minh hoạ: "Mình làm bản minh hoạ (nhân vật vẽ, bối cảnh quán xá Việt) nhé."
- Người thật quay sẵn: "Bạn vào pexels.com hoặc pixabay.com, tìm clip người thật hợp cảnh (nên chọn clip dọc), tải về và kéo vào khung chat kèm link trang clip. Mình kiểm nguồn rồi ghép vào video."
- Người thật do AI tạo: "Video sẽ có người trông như thật do AI tạo. Trên video và đầu caption luôn có dòng '{nhãn}'. Khi đăng, bạn bật thêm mục khai báo nội dung AI của TikTok, YouTube, Facebook (Claude ghi sẵn trong phần nội dung đăng bài)."
