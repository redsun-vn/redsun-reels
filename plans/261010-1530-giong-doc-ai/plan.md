---
status: in-progress
created: 2026-10-10
owner: Nam
---

# Giọng đọc AI đầy cảm xúc, người châu Á, giảm chữ (REQUIREMENTS v0.6)

## Mục tiêu
Nam 2026-10-10: "nâng chất lượng bằng cách: chủ thể là người châu Á, có giọng đọc đầy cảm xúc, giảm chữ". Nghe thử giọng Gemini: "giọng đọc đúng, nhưng thiếu cảm xúc… lo lắng thì la lên, vui mừng thì wow hay cười, cần skill đánh giá cụ thể hơn từng cung bậc cảm xúc". Chốt: giọng **nữ miền Nam**, **mỗi nhân vật một giọng**; học ý tưởng OpenMontage (AGPL), không chép code.

## Ràng buộc
- Giọng: Gemini TTS (key Nam cấp, `.env`), không giới hạn chi, ưu tiên chất lượng. Claude không nghe được → **máy chấm** (Gemini nghe lại) là cổng chất lượng bắt buộc.
- Lời đọc qua chống bịa như chữ trên màn hình; không tên ngân hàng/đối thủ; viết đúng SIPOS…
- Giọng AI nghe như người thật → **gắn nhãn AI** (Nghị định 142/2026 Điều 18), dùng chung cơ chế nhãn đã có.
- Giữ các luật cứng hiện có (kiểu hình, dựng vai và cảm xúc, nhãn AI).

## Không làm
- Clone giọng người thật; nhân vật AI mấp máy môi theo lời (vẫn chưa).
- Chép code OpenMontage.

## Tiêu chí xong
1. REQUIREMENTS v0.6 (lồng tiếng AI được phép; giọng theo vai; người châu Á; giảm chữ; khoá lời hứa video; nhãn giọng AI).
2. Skill `giong-doc`: dàn giọng theo vai, kế hoạch diễn giọng + ghi chú diễn từng câu, bảng cung bậc cảm xúc (cường độ 1–5, dấu hiệu giọng, từ cảm thán miền Nam), thử câu khó nhất trước, khoá giọng.
3. Lệnh `./reel giong <tên>`: tạo nhiều bản mỗi câu, máy chấm (khớp chữ, đúng cảm xúc, cường độ, giọng miền Nam, tự nhiên), giữ bản tốt nhất đạt ngưỡng; sổ `giong/nhat-ky.json`.
4. Bước dựng tự gắn giọng (chỗ đánh dấu), hạ nhạc khi có lời, phụ đề nhỏ theo lời; validate chặn câu chưa đạt ngưỡng, thiếu nhãn giọng AI.
5. `./reel quay-san` bắt buộc khai người châu Á; luật giảm chữ (chữ nhấn ≤ 6 từ/cảnh khi có lời đọc).
6. Video "Chuyển khoản giả mạo" bản người thật có giọng: 3 giọng nữ miền Nam (chủ quán, nhân viên, khách), đạt máy chấm, Nam nghe duyệt.
7. Test, typecheck, lint, render test xanh; docs + decisions.

## Giai đoạn
| # | Việc | Trạng thái |
|---|---|---|
| 1 | Máy chấm + thử giọng (casting 3 giọng nữ miền Nam, cách viết lời có cảm thán/thẻ âm thanh) | đang làm |
| 2 | Lệnh `./reel giong` + sổ + validate + nhãn giọng AI + gắn vào bản dựng + hạ nhạc + phụ đề | chờ |
| 3 | Skill `giong-doc`, REQUIREMENTS v0.6, luật người châu Á + giảm chữ | chờ |
| 4 | Làm video có giọng, Nam nghe duyệt | chờ |
