# Giai đoạn 2 — Clip AI và giọng đọc song song

## Vì sao
`scripts/ai.ts:173–191` gửi một clip rồi `await finishClip` mới gửi clip sau; `scripts/giong.ts:86` tạo từng câu. Bản AI 30+ phút, phần lớn là chờ tuần tự.

## Việc
1. `ai.ts` (clip): vòng 1 gửi hết các clip cần làm (mỗi clip vào `log.dangCho`, `save()` ngay sau gửi), vòng 2 `Promise.all(dangCho.map(finishClip))`.
   - **An toàn tiền**: trước khi gửi clip, so trần với `chiPhi + Σ uocUsd của việc đang chờ + uocUsd clip này` (sửa `ensure`). Không gửi khi vượt.
   - Một clip lỗi không huỷ clip khác: dùng `allSettled`, gom lỗi; `CapError/UnconfirmedError/RejectedError` xử lý như cũ, giữ mã việc.
   - Ảnh khung đầu (`generateImage` theo cảnh) cũng song song, giới hạn 3 cùng lúc.
2. `giong.ts`: tạo các câu song song, giới hạn `VOICE.concurrency` (mặc định 3, `config/voice.ts`); giữ thứ tự ghi `log.items`; `spend.limit` kiểm trước mỗi lượt gọi (đã có, đếm chung).
3. Nếu 429 lặp lại khi song song (≥ 3 lần liên tiếp): tự hạ về 1 và in "nhà cung cấp giới hạn chạy cùng lúc" → **dừng hỏi Nam** nếu xảy ra ở lần thử thật.

## Test
- Unit: `ensure` tính cả việc đang chờ (3 clip × ước, trần chặn clip thứ 3).
- Unit: giới hạn song song (hàm `limitConcurrency` nhỏ, test không gọi mạng).
- Thử thật ở giai đoạn 6 (video AI): ghi thời gian `ai` trước/sau.

## Rủi ro
Gửi song song mà máy tắt giữa chừng: các mã việc đã `save()` sau từng lần gửi → lần sau hỏi tiếp, không gửi lại (giữ nguyên cơ chế cũ).
