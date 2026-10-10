# Tình huống MKT hay gặp → Claude làm gì

Bảng tra cho Claude ở chế độ MKT. Quy trình chính (8 bước, điểm dừng) vẫn theo `SKILL.md`. Sổ tay phía MKT: `docs/huong-dan-mkt.md`. MKT dùng sổ tay đó, nên câu trả lời phải khớp với nó.

Nói với MKT bằng lời thường. Không nhắc tên lệnh, file JSON, log. Mọi lệnh chạy từ thư mục gốc dự án.

## Làm và sửa video
| MKT nói | Claude làm |
|---|---|
| "làm reel/video … về …" | **Luồng tự động** (SKILL.md): chỉ hỏi phần thiếu mà tự đặt sẽ là bịa, rồi làm tới khi có video |
| "làm từng bước", "cho tôi chọn ý tưởng" | Luồng từng bước: dừng chờ chọn concept, duyệt kịch bản, xem thử |
| "làm N video …" (cùng dịp/chủ đề) | Mỗi video một thư mục, làm lần lượt; trước mỗi video chạy `./reel info gan-day` để khác video trước (phong cách xoay vòng `./reel info dip-le`, bố cục, kiểu nhấn) |
| "câu … thiếu cảm xúc", "đọc sai", "nghe giọng Bắc", "đổi giọng <vai>" | Skill `giong-doc`: sửa lời/dấu câu/thẻ câu đó trong `dung-rieng/loi-doc.json` hoặc đổi giọng VieNeu của vai, `./reel giong <tên> --cau=<id> --lai`; đổi giọng một vai thì chạy lại mọi câu của vai đó |
| "làm video 45 giây", "dài hơn" | Reel chỉ dài 15–30 giây (luật cứng: video ngắn dễ được xem hết, nền tảng phân phối rộng hơn). Nói MKT điều đó, gọt còn ý chính; nội dung dài thì tách thành 2 video |
| "mỗi nhân vật một giọng" | Skill `giong-doc` mục 1: dàn nhiều giọng (mặc định chỉ một giọng kể Duyên Hà My) |
| "không cần giọng" | Bỏ `dung-rieng/loi-doc.json` + chỗ `<!-- GIONG-DOC -->` + nhãn giọng AI; lời thoại về bong bóng/phụ đề |
| Máy báo "Chưa có VIENEU_API_KEY" | Nói MKT nhắn Nam đưa khoá vào máy; video đã có giọng vẫn dựng/xuất được |
| Mở video người thật quay sẵn trên máy khác, báo "Máy này chưa có clip" | `./reel quay-san <tên> --tai-lai` (tự tải đúng đoạn theo sổ nguồn), rồi làm tiếp |
| Brief thiếu nỗi đau cụ thể / tính năng giải quyết / hook đủ mạnh, hoặc ghi "cần team xác nhận" | Hỏi MKT một lần (≤ 5 câu, có lựa chọn) theo mục "Brief đủ chưa" của `SKILL.md`; MKT chọn "làm luôn bản tạm" thì ghi phần thiếu vào `review.md` mục `## Cần team xác nhận` |
| "chọn ý N" | Ghi lựa chọn vào cuối `concepts.md`, viết `script.json`, `./reel validate <tên>` |
| "cảnh N đổi chữ…", "bỏ cảnh…", "ngắn lại…" | Sửa `script.json`; tính lại thời lượng bằng `./reel info thoi-luong "<chữ>"`; `./reel validate` |
| "đổi phong cách sang …" | Sửa `style` ở cả brief và kịch bản; đổi nhạc nếu bài cũ không hợp mood (`./reel info nhac <phong-cách>`) |
| "đổi nhạc", "nhạc vui hơn" | `./reel info nhac <phong-cách>`, chọn bài "đăng được" dài hơn video, sửa `music` ở kịch bản (và brief nếu brief không để `auto`) |
| "xem thử" / "xem thử có vùng an toàn" | `./reel preview <tên>` / thêm `--safe-zone`. Mở `http://localhost:3002` |
| "xuất" | `./reel render <tên>`, rồi `./reel post <tên>`. Báo đường dẫn `out/<tên>.mp4` và nội dung `post.md` |
| "sửa video <tên>", "xuất lại video <tên>" | `./reel info video` để tìm, rồi mở `briefs/<tên>` (khớp gần đúng theo ngày, sản phẩm, chủ đề). Đọc lại brief và kịch bản, làm từ bước 7 hoặc 8 |
| "các video tôi đã làm" | `./reel info video`, kể lại bằng lời thường (tên chủ đề, sản phẩm, đã xuất chưa). Chỉ tính video trong `briefs/`; file khác trong `out/` (vd. `e2e-*`, `blank*`) là file thử của dev, không kể |
| "làm bản chỉ có chữ" | Mọi cảnh dùng `visual.type: "text"` (CTA dùng `logo`) |
| "chưa có hình" | Viết `shotlist.md` theo `SKILL.md` bước 4, hoặc đề xuất bản chỉ có chữ |
| "có những dịp lễ nào" | `./reel info dip-le`, kể lại tên dịp và ngày |

## Hình ảnh, clip
| Tình huống | Claude làm |
|---|---|
| MKT gửi ảnh/clip, muốn video có hình/người | Hướng dẫn kéo file vào thư mục `hinh` trong thư mục video (`briefs/<tên-video>/hinh/`), tên gì cũng được, ảnh iPhone cũng được. Chạy `./reel hinh <tên-video>`, xem từng hình, xếp vào cảnh (skill `tao-reel` bước 4) rồi xuất lại. Không tự tải ảnh trên mạng; không dùng ảnh/clip AI MKT tạo ở nơi khác (người thật do AI tạo: quy trình riêng có nhãn AI, REQUIREMENTS §7.4, chưa dùng được) |
| "Video chỉ có chữ, đơn điệu" | Hỏi MKT có ảnh/clip người thật, quán, màn hình phần mềm không; có thì làm như dòng trên. Không có thì đổi kiểu nhấn/chuyển động (skill `dao-dien-chuyen-dong`) |
| Clip quay ngang (validate cảnh báo) | Báo hai bên sẽ bị cắt; hỏi MKT quay lại dọc hay vẫn dùng |
| Clip ngắn hơn kịch bản | Rút ngắn cảnh, đổi `clipStart`, hoặc nhờ MKT quay lại |
| Video có người nói | Cần lời nói + mốc giây chuyển ý từ MKT (Claude không nghe được clip). Chia cảnh theo mốc, `attribution` = tên + chức danh |

## Nhạc
| Tình huống | Claude làm |
|---|---|
| Lỗi "Thiếu file nhạc…", doctor báo thiếu nhạc | Tự chạy `./reel music:fetch`, không hỏi MKT, rồi làm lại bước vừa lỗi |
| `music:fetch` báo lỗi mạng | Nhờ MKT kiểm wifi, chạy lại |
| `music:fetch` báo "file ở nguồn đã khác bản đã duyệt" | Chọn bài khác cùng phong cách; báo MKT nhắn Nam cập nhật thư viện |
| Lỗi "chỉ để thử nghiệm" | Kịch bản đang dùng bài "chỉ xem thử": đổi sang bài "đăng được" |
| MKT tự tìm nhạc, hỏi chọn bài nào | Gợi ý bài **bắt tai**: có nhịp ngay vài giây đầu, không chọn nhạc thiền/ambient/dạo đầu dài |
| "dùng nhạc tôi tự tìm", "thêm nhạc <tên>, link …, tác giả …" | Kiểm file `nhac-tu-tim/<tên>.mp3` + ảnh chụp cùng tên đã có chưa (thiếu thì hướng dẫn theo sổ tay mục 6). Chọn 1–3 phong cách hợp bài. Chạy `./reel music:add nhac-tu-tim/<tên>.mp3 --link=<link> --tac-gia="<tác giả>" --mood=<…>`. Thêm xong, nhắc MKT báo Nam |
| Nhạc từ YouTube, TikTok, nhạc ca sĩ, nguồn khác | Từ chối nhẹ nhàng: chỉ Pixabay/Mixkit; nguồn khác phải hỏi Nam. Không chạy `music:add` |
| "đăng ký lại nhạc tự tìm" (sau khi cập nhật bản mới) | `./reel music:add --lai` |
| MKT muốn chạy quảng cáo trả tiền | Nói license nhạc chỉ cho đăng tự nhiên; báo Nam trước khi chạy ads |
| Bị claim bản quyền nhạc | Nhờ MKT chụp thông báo gửi Nam; không tự kháng nghị |

## Máy, cài đặt, cập nhật
| Tình huống | Claude làm |
|---|---|
| "kiểm tra máy" | Skill `cai-dat`: `./reel doctor`. Đủ ✓ thì chỉ nói "máy sẵn sàng" |
| "cài lại", lệnh báo máy chưa cài | Skill `cai-dat` |
| MKT vừa tải bản mới (ZIP) | Nhắc chép `briefs/<video của mình>`, `out/`, `nhac-tu-tim/` từ bản cũ; "cài lại"; có nhạc tự tìm thì `./reel music:add --lai` |
| Lỗi nhắc `out/last-error.log` | Kể 1–2 câu đầu bằng lời thường, nhờ MKT gửi file log cho Nam |

## Ngoài phạm vi: báo "cần dev (Nam)"
- Thêm mẫu video, phong cách, đổi màu, logo, font, câu CTA mặc định.
- Sửa file ngoài `briefs/` (ngoại lệ duy nhất: `./reel music:add`).
- Nâng version, cài thêm phần mềm.
