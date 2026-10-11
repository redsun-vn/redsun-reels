---
status: in-progress
created: 2026-10-11
owner: Nam
---

# M5 — Video người thật do AI tạo qua OpenRouter (REQUIREMENTS §7.4)

## Mục tiêu
Nam 2026-10-11: "cần làm video cảnh người thật do AI dựng", nguồn model OpenRouter (danh sách model video). Một video từ brief "Ảnh chuyển khoản giả" (bản QR, cùng brief với video người thật quay sẵn đã duyệt) có người thật do AI tạo, đủ 4 lớp nhãn AI, trong trần chi, Nam duyệt.

## Nam chốt (2026-10-11)
- Nhà cung cấp: **OpenRouter** (`OPENROUTER_API_KEY` trong `.env`, Nam cấp). OpenRouter đã gom nhiều model sau một API, nên lớp gọi chỉ có một bộ chuyển đổi; đổi model = đổi id trong `config/ai-video.ts`, giới hạn model đọc từ `GET /api/v1/videos/models`.
- Model video: **ByteDance Seedance 2.0** (`bytedance/seedance-2.0`): 9:16, ảnh khung đầu + khung cuối, tắt tiếng, 4–15 giây.
- Trần chi cảnh AI: **50.000đ mỗi video**.
- Brief: "Ảnh chuyển khoản giả" (QR).

## Ràng buộc
- Mọi luật cứng §7.4 và skill `chon-kieu-hinh`: không người có danh tính, không lip-sync, AI không vẽ màn hình/logo/chữ/số, 4 lớp nhãn, sổ nguồn gốc, file trong `briefs/<tên>/ai/` (không commit).
- An toàn tiền: việc đã gửi mà không xác nhận được → dừng, lưu mã việc, lần sau hỏi lại đúng việc đó (không gửi lại); lỗi tải chỉ tải lại; chỉ tự thử lại khi 429/5xx lúc hỏi kết quả; ước tiền trước khi gửi, vượt trần thì không gửi; thông báo lỗi che key.
- Giá Seedance tính theo token video: rộng × cao × 24 khung × giây ÷ 1024 × giá token (`pricing_skus` của OpenRouter). 720×1280 ≈ $0,15/giây → 50.000đ (~$1,9) chỉ đủ ~12 giây clip, kể cả làm lại.

## Cách làm trong trần
- **Ảnh tham chiếu mỗi vai** (model ảnh `bytedance-seed/seedream-5-0-flash`, rẻ): người Việt, đời thường, không giống người thật có danh tính. MKT/Nam duyệt.
- **Khung đầu mỗi cảnh** là ảnh AI (cùng model ảnh, đưa ảnh tham chiếu vào để giữ mặt). Claude xem khung trước khi tốn tiền làm clip.
- **Chỉ 2 khoảnh khắc cảm xúc chính làm clip Seedance 4 giây** (vd. chủ quán thấy thiếu tiền; nhẹ nhõm khi QR tự xác nhận). Các khung người khác dùng ảnh AI + chuyển động máy quay HyperFrames. Màn hình SIPOS, dấu GIẢ, thông báo thanh toán vẫn ghép bằng HyperFrames.

## Không làm
- Model/nhà cung cấp thứ hai, so sánh nhiều model (Nam chọn một model).
- Lip-sync, giọng nhân vật trên mặt đang nói.
- Đổi video người thật quay sẵn đã duyệt.

## Tiêu chí xong
1. `config/ai-video.ts`: nhà cung cấp, model video/ảnh, độ phân giải; `config/cost.ts`: trần cảnh AI 50.000đ.
2. `scripts/lib/openrouter-ai.ts`: gửi việc → hỏi kết quả → tải file (video), tạo ảnh; ước tiền; an toàn tiền như trên; che key. Unit test.
3. Lệnh `./reel ai <tên> [--canh=…] [--video] [--lai]` theo `ai/canh-ai.json` (dàn vai + cảnh theo số khung của `bang-canh.txt`): tạo ảnh vai → khung đầu → (có `--video`) clip; sổ `ai/nhat-ky.json` đủ trường §7.4 (file, nhà cung cấp, model, prompt, ảnh tham chiếu, seed, mã việc, thời lượng, chi phí, thời điểm) + mã việc đang chờ; dừng ở trần.
4. Validate: cảnh AI có trong sổ, khung đầu/clip đúng; đã có luật nhãn.
5. Skill `chon-kieu-hinh`, `dung-video` (dựng với cảnh AI), `tao-reel`; `AI_VIDEO.enabled = true` (Nam yêu cầu làm video); REQUIREMENTS §7.4 + decisions + changelog.
6. Video `briefs/2026-10-11-sipos-qr-chuyen-khoan-gia-ai`: validate/render đạt, 4 lớp nhãn, chi ≤ 50.000đ, Nam duyệt.
7. Test, typecheck, lint xanh.

## Giai đoạn
| # | Việc | Trạng thái |
|---|---|---|
| 1 | Lớp gọi OpenRouter + lệnh `./reel ai` + sổ + test | xong (124 test qua) |
| 2 | Brief, kịch bản, bảng khung; ảnh vai → Nam duyệt | xong (ảnh chủ quán làm lại vì thừa tay; tư thế đơn giản) |
| 3 | Khung đầu, 2 clip, dựng, xuất → Nam duyệt | đã xuất, chờ Nam duyệt (Seedance từ chối ảnh người → Nam đổi Kling 3.0 Std; chi 27.924đ) |
| 4 | Hướng thứ hai: Seedance 2.0 Fast tạo từ chữ, không ảnh nhân vật (40.295đ); Nam: "cho phép chọn cả hai" → `cachTaoAi` | xong |
| 5 | Skill, REQUIREMENTS, docs, commit | skill + docs xong; commit chờ Nam |

## Rủi ro
- Tài khoản OpenRouter còn ~$0,99 (đã dùng $59,01/$60, đọc 2026-10-11): đủ ảnh, không đủ 2 clip. Cần Nam nạp.
- Model từ chối người trông như thật (content policy) → báo, đổi mô tả; không lách.
- Ảnh khung đầu dạng data URL có thể không được nhận → thử bằng một lượt rẻ trước.
- Giá OpenRouter đổi: ước theo `pricing_skus` đọc lúc chạy, ghi chi thật theo `usage.cost` trả về.
