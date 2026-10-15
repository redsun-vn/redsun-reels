# Luật kịch bản (một nguồn cho tao-reel, dung-video)

Các luật dưới áp dụng cho mọi video, từ concept tới bản xuất. Skill `tao-reel` và `dung-video` chỉ tóm tắt và trỏ về file này. Ngưỡng máy kiểm nằm ở `config/kieu-ke.ts` và `scripts/lib/validate-video.ts`; cách kể từng kiểu ở [kieu-ke.md](kieu-ke.md).

## LUẬT SỐ 1 — 3 giây đầu (mạnh nhất, đứng trên mọi luật khác)
Nam 2026-10-10: "đây là video reel, chúng ta chỉ có 03s đầu tiên để thu hút người xem"; "luật 3 giây đầu phải là mạnh nhất". Mọi lựa chọn khác (thứ tự cảnh của brief, nhịp, phong cách, chữ) nhường cho luật này:
- **Chọn điểm hấp dẫn nhất trong brief** theo `tao-reel/references/chon-diem-hap-dan.md` (bảng ứng viên + điểm 5 tiêu chí ghi ở mục `## Điểm hấp dẫn` của `concepts.md`); hook ≥ 20/25, ghi `Hook N/25` trong `selfScore.notes`.
- **Mở bằng điểm mạnh nhất, kể lại sau**: khung ở giây 0 đã là hình mạnh nhất; không logo, không chào, không dạo đầu chậm; được đảo thứ tự cảnh của brief (giữ đủ ý, lời nói và điều cấm).
- **Biến động trong 1 giây đầu** (dập, cắt, rung, chớp) trên phách, kèm tiếng nhấn.
- **Có giọng**: câu hook bắt đầu ≤ 0,3 giây, ≤ 8 từ, đọc xong trước giây 2,5.
- **Máy chặn từ bước kịch bản** (`./reel validate`, trước khi dựng): thiếu `concept.diemHapDan` hoặc dưới 20/25, `concepts.md` thiếu `## Điểm hấp dẫn`, cảnh hook dài hơn 3,5 giây, hook quá 8 từ, thiếu `Hook N/25` trong `selfScore.notes`. Sau đó: câu giọng đầu > 0,3 giây (validate), giây đầu không có biến động mạnh (render). Không báo "xong" khi còn ✗ LUẬT SỐ 1.
- **Luật cứng reel 15–30 giây** (Nam 2026-10-10: tỷ lệ xem hết cao hơn, thuật toán phân phối rộng hơn): brief và tổng kịch bản phải trong 15–30 giây (khoảng của loại video giao với 15–30); validate chặn.

## LUẬT SỐ 2 — Nỗi đau của khách → sản phẩm giải quyết (chặn từ kịch bản)
Nam 2026-10-10: "phải nổi bật được nỗi đau của khách hàng và cách sản phẩm chúng ta giải quyết nó". Mọi video (trừ lời chúc, teaser, tổng kết, tuyển dụng, thông báo, không khí quán, khoe số: `NO_PAIN_TYPES`):
- **Nỗi đau nổi bật**: một nỗi đau **cụ thể** của đúng khán giả brief, lấy từ brief (vd. "bán cả ngày, tối kiểm tiền mới thấy thiếu"); cho thấy **hậu quả** (mất tiền, mất giờ, mất khách) bằng hình và người phản ứng, không chỉ bằng chữ. Hook nên là nỗi đau hoặc khoảnh khắc vỡ lẽ của nỗi đau đó (LUẬT SỐ 1).
- **Sản phẩm giải quyết thế nào**: cho thấy **sản phẩm làm gì** với chính nỗi đau đó (thao tác trên màn hình sản phẩm, trước → sau, cùng người/cùng vật của cảnh nỗi đau), không chỉ tên sản phẩm hay câu chung chung ("quản lý dễ hơn"). Chỉ tính năng có trong brief/hồ sơ sản phẩm; brief chưa xác nhận tính năng giải quyết thẳng nỗi đau thì hỏi MKT/team, không hứa vượt.
- `script.json` khai `concept.noiDau { khach, canh }` (cảnh hook/problem) và `concept.giaiPhap { cach, canh }` (cảnh solution). Validate chặn: thiếu, sai vai trò cảnh, giải pháp trước nỗi đau, giải pháp bắt đầu quá muộn, cảnh giải pháp quá ngắn.
- **Giữ ý, nới hình thức** (Nam 2026-10-11, decisions §34): kịch bản có `concept.kieuKe` (6 kiểu kể) thì giải pháp ≥ 12% video và bắt đầu trước 85% — sản phẩm được là **cú chốt** (twist, tiểu phẩm), miễn vẫn thấy rõ sản phẩm làm gì với đúng nỗi đau đó. Kịch bản cũ chưa có kiểu kể giữ ngưỡng cũ: giải pháp ≥ 20%, bắt đầu trước 70%.

## Người xem theo sản phẩm (Nam 2026-10-12, luật cứng)
Nam: "chủ quán cho SIPOS, công ty cho bos, chủ website cho webino, ghi rõ luật này". Nhân vật chính, nỗi đau, bối cảnh, lời thoại và câu hook đều nói với **đúng người xem của sản phẩm**:

| Sản phẩm | Người xem / nhân vật chính | Bối cảnh, nỗi đau điển hình | Không dùng |
|---|---|---|---|
| SIPOS | **Chủ quán, chủ cửa hàng** (F&B, bán lẻ, dịch vụ) và nhân viên quầy | Quầy thu ngân, kho nhỏ, tiền chuyển khoản, ca bán | Phòng họp công ty, "đội sale", "phòng ban" |
| REDSUN BOS | **Công ty, doanh nghiệp**: giám đốc, trưởng phòng, đội sale, kế toán, nhân sự | Văn phòng, cuộc họp, số liệu giữa phòng ban, khách hàng doanh nghiệp | "Chủ quán", quầy quán nhỏ |
| Webino | **Chủ website**: người bán hàng online, chủ shop, doanh nghiệp nhỏ cần website | Dựng, sửa website, đơn hàng từ web, khách vào web | "Chủ quán" bán tại quầy, phòng họp tập đoàn |

- Áp cho **mọi kiểu kể**: POV ("khi bạn là chủ quán…" chỉ cho SIPOS; BOS là "khi bạn là trưởng phòng / giám đốc…", Webino là "khi bạn là chủ website…"), tiểu phẩm, twist, mẹo/số liệu, drama văn phòng, drama tổng tài (tổng tài của SIPOS là chủ chuỗi quán, của BOS là giám đốc công ty, của Webino là chủ shop online).
- `audience` trong brief ghi đúng người xem này; MKT ghi khác thì hỏi lại một câu trước khi viết concept.
- Video REDSUN (thương hiệu công ty) theo brief.

## Thông tin không lặp lại, thông điệp xuyên suốt (Nam 2026-10-11)
Nam: "quy tắc là thông tin không lặp lại, thông điệp phải xuyên suốt" (video "Ảnh chuyển khoản giả": hook "…là GIẢ!" rồi giây 14 lại nói "ảnh không phải chuyển khoản thật", dấu GIẢ dập hai lần, "bỏ sót tiền" và "thiếu một khoản").
- **Mỗi thông tin chỉ nói một lần**, bằng lời hay bằng hình (không dập lại cùng dấu, không đọc lại cùng ý). Mở bằng điểm mạnh nhất rồi kể lại (LUẬT SỐ 1) thì phần kể lại phải **thêm điều mới**: vì sao, thế nào, hậu quả cụ thể hơn, nối vào nhân vật/vật đã thấy. Không thay hook để tránh lặp: hook giữ mạnh nhất, cảnh sau đổi.
- **Một câu thông điệp xuyên suốt** ghi ở `concept.thongDiep` (vd. "Đừng tin ảnh chụp chuyển khoản: SIPOS tự xác nhận tiền vào, không còn sót tiền"). Mỗi cảnh nối về câu đó; cảnh kết **khép vòng** với nỗi đau ở đầu (đầu "bỏ sót tiền" → kết "không còn sót tiền").
- **Khi tự chấm**: lập bảng `Cảnh · Thông tin mới của cảnh`; hai cảnh cùng một thông tin thì viết lại cảnh sau. Lời nói của brief bị lặp do mình thêm hook thì đổi lời của cảnh sau và báo MKT (nêu câu cũ → câu mới).
- Máy: validate cảnh báo (!) khi thiếu `concept.thongDiep` và khi hai cảnh trùng phần lớn chữ có nghĩa (`scripts/lib/info-repeat.ts`; trùng ý khác chữ máy không bắt được, Claude soát theo bảng trên).

## Chiều sâu câu chuyện (Nam 2026-10-15)
Nam: video "thiếu chiều sâu". Không thêm luật chặn; cách làm ở [chieu-sau-cau-chuyen.md](chieu-sau-cau-chuyen.md): 5 câu nghĩ trước khi có ý, **so sánh từ đời người xem** (`concepts.md` mục `## So sánh`), **phải thấy / không được thấy** mỗi cảnh (`dung-rieng/storyboard.md`), **mỗi nhịp một tư thế trên phách**, kể được khi tắt tiếng. Máy chỉ cảnh báo khi thiếu mục `## So sánh` hoặc hai dòng phải thấy / không được thấy.
