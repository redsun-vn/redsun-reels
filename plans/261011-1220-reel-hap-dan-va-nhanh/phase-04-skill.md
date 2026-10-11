# Giai đoạn 4 — Skill: gom luật, kiểu kể, chọn concept, bảng nhịp, nhịp dựng nhanh

## Việc
1. **Gom luật**: tạo `.claude/skills/tao-reel/references/luat-kich-ban.md` chứa LUẬT SỐ 1, LUẬT SỐ 2 (ngưỡng mới, theo kiểu kể), "thông tin không lặp lại". `tao-reel/SKILL.md` và `dung-video/SKILL.md` thay đoạn chép trùng bằng 3–4 dòng tóm tắt + đường dẫn. Không bỏ ý nào.
2. **Kiểu kể**: `.claude/skills/tao-reel/references/kieu-ke.md`: mỗi kiểu có nhịp từng giây (15–30 giây), sản phẩm vào ở đâu (cú chốt), 1 ví dụ SIPOS "QR chuyển khoản giả" viết theo kiểu đó, lỗi hay gặp (giống quảng cáo, hài gượng, twist đoán được), kiểu hình hợp. Hài kiểu Việt: nhắc MKT đọc lại câu chữ.
3. **`tao-reel` luồng tự động**: bước 3 đổi thành 3 concept thuộc 3 kiểu kể khác nhau (chỉ kiểu hợp kiểu hình đã chọn), mỗi concept 1 dòng câu chuyện + hook; `./reel moc <tên> hoi` rồi AskUserQuestion cho MKT chọn; ghi `## Lựa chọn của MKT`. Các bước sau tự động như cũ.
4. **Thang tự chấm** (`references/script-format.md`): thêm 4 tiêu chí hấp dẫn (bất ngờ, cảm xúc/hài, không giống quảng cáo, nhịp) trong thang 100; ghi rõ đây là bước lọc, không thay so mù.
5. **Bảng nhịp**: kịch bản kèm bảng `Giây · Ai · Phản ứng/hành động · Ngắt (cười/lật)` trong `concepts.md` mục `## Bảng nhịp`; `dung-video` dựng theo bảng (diễn xuất nhân vật, timing hài).
6. **`dung-video` nhịp làm nhanh**:
   - Viết `loi-doc.json` trước, chạy `./reel giong` nền (run_in_background) rồi mới viết `index.html`.
   - `snap` vòng 1 đủ khung; vòng sau chỉ `--at` chỗ đã sửa; tối đa 3 vòng.
   - Render đúng 1 lần, sau khi snap sạch.
   - Kiểu hình AI: chạy `./reel ai` nền ngay sau khi duyệt khung đầu.
7. `chon-kieu-hinh`: thêm dòng "kiểu kể hợp" cho từng kiểu hình (lấy từ `config/kieu-ke.ts`).

## Kiểm
- Đọc lại hai skill: không còn đoạn LUẬT chép trùng; mọi ý cũ có trong `luat-kich-ban.md` (soát bằng diff ý).
- `./reel lint:brand`.
