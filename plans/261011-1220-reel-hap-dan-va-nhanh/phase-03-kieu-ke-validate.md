# Giai đoạn 3 — Kiểu kể trong config + validate

## Việc
1. `config/kieu-ke.ts`: `KIEU_KE` gồm `tieu-pham`, `pov`, `twist`, `meo-so-lieu`. Mỗi kiểu: tên tiếng Việt, mô tả 1 câu, thứ tự vai trò cảnh gợi ý (vd. twist: hook → problem → problem → solution → cta, giải pháp là cú lật), kiểu hình hợp (`minh-hoa`, `nguoi-that-quay-san`, `nguoi-that-ai`…: tiểu phẩm cần diễn theo kịch bản → không hợp quay sẵn), `canSoThat` (mẹo/số liệu: true). Ngưỡng `GIAI_PHAP_MIN = 0.12`, `GIAI_PHAP_TRUOC = 0.85`.
2. `config/script.schema.ts`: `concept.kieuKe` optional enum (kịch bản cũ không có vẫn đọc được).
3. `scripts/lib/validate-video.ts` (LUẬT 2, dòng 133–151):
   - Có `kieuKe` → ngưỡng 12% / 85%; không có → giữ 20% / 70% (video cũ không đổi kết quả).
   - Thứ tự cảnh: có `kieuKe` → so với thứ tự gợi ý của kiểu kể (cảnh báo), không so mẫu của loại video.
   - `meo-so-lieu` mà brief không có con số/mẹo do MKT đưa → lỗi (dùng `fact-check.ts` hiện có cho số).
   - Kiểu hình của brief không hợp kiểu kể → cảnh báo.
   - Video `build: custom` mới (có `concept.kieuKe` thiếu) → cảnh báo "chưa chọn kiểu kể".
4. `concepts.md`: cảnh báo khi không có `## Lựa chọn của MKT` hoặc 3 concept không ghi 3 kiểu kể khác nhau (dòng `Kiểu kể: <mã>`).
5. LUẬT 1 và 15–30 giây: không đụng.

## Test (`tests/validate.test.ts`)
- Kịch bản cũ (không `kieuKe`) giữ nguyên kết quả (fixture hiện có pass/fail như trước).
- `kieuKe: twist`, giải pháp 13% bắt đầu ở 80% → đạt; 10% → lỗi; bắt đầu 90% → lỗi.
- `meo-so-lieu` không có số trong brief → lỗi.
- `./reel test`, `./reel typecheck`, `./reel validate` trên 4 brief hiện có không thêm lỗi ✗ mới.
