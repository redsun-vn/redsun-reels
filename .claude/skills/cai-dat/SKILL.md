---
name: cai-dat
description: Cài đặt môi trường làm video redsun-reels cho máy MKT (MacBook Intel hoặc chip M) bằng một script cố định, không cần mật khẩu máy, Homebrew hay API key. Dùng khi người dùng nói "cài đặt giúp tôi", "cài lại", "setup máy", "máy chưa làm video được", hoặc khi một lệnh ./reel báo máy chưa cài môi trường.
---

# Cài đặt máy làm video

Người dùng là nhân viên marketing, không biết kỹ thuật. Nói tiếng Việt, câu ngắn, không dùng thuật ngữ code. Không dán log hay stack trace cho họ.

## Làm

1. Báo trước một câu: "Mình cài đặt máy để làm video, mất khoảng 5–10 phút, bạn cứ để máy chạy nhé."
2. Chạy script cài đặt (từ thư mục gốc dự án), timeout tối đa 30 phút:

   ```bash
   bash ./scripts/cai-dat.sh
   ```

   - Script tự bỏ qua bước đã xong, nên chạy lại bao nhiêu lần cũng được.
   - Không sudo, không Homebrew, không git. Không tự cài thêm gì ngoài script này.
3. Đọc kết quả:
   - Dòng cuối là `CÀI XONG.` → báo: "Cài xong rồi. Máy đã dựng thử được video. Muốn làm video, bạn chỉ cần nói ví dụ 'làm reel mẹo cho SIPOS về …'." Nếu bước 4 có in "mở lại Claude Code", nhắc họ đóng và mở lại Claude Code một lần.
   - Có dòng `LỖI:` → kể lại nội dung dòng `LỖI:` và `CÁCH XỬ LÝ:` bằng lời thường. Ví dụ lỗi mạng: "Máy đang không vào được Internet. Bạn kiểm tra wifi rồi nói 'cài lại' nhé." Lỗi cần dev: nói rõ file log cần gửi (đường dẫn trong dòng `LỖI:`).
4. Muốn kiểm lại máy bất cứ lúc nào: `./reel doctor`. Mọi mục ✓ thì chỉ nói "Máy đã sẵn sàng làm video", không liệt kê tên phần mềm (Node.js, FFmpeg…). Có mục ✗ thì kể lại bằng lời thường kèm việc cần làm.
5. Bước 6 của script tải thư viện nhạc (Mixkit, khoảng 70 MB) từ nguồn gốc về `brand/music/`; nhạc không nằm sẵn trong dự án. Chỉ thiếu nhạc (doctor báo thiếu file ở mục Thư viện nhạc) thì chạy `./reel music:fetch`, không cần cài lại cả máy.

## Không làm

- Không sửa file trong dự án, không đổi version, không bật auto-update plugin.
- Không chạy lệnh cài khác (brew, pip, npm -g, sudo) dù gặp lỗi. Nếu script không xử lý được, báo dev.
- Không in hay hỏi API key; dự án không dùng API key.
