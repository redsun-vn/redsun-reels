# Hướng dẫn theo loại video (video type guide)

Cập nhật: 2026-10-08. Trạng thái: đề xuất, chờ Nam duyệt. File này đi kèm `docs/video-style-catalog.md` (19 phong cách, id dạng `toi-gian`, `hanh-dong`…).

Nam (2026-10-08) yêu cầu: "làm phù hợp với các loại video". Cách hiểu ở đây:
1. Mỗi brief chọn **loại video** trước.
2. Loại video quyết định template, cấu trúc cảnh, độ dài, chế độ âm thanh và các phong cách được phép.
3. Phong cách chỉ là lớp áp lên trên, không đổi cấu trúc.

Vẫn giữ template-first (REQUIREMENTS §1.4). Không mở các creation workflow của HyperFrames cho MKT (§10).

## 1. Loại video, template, phong cách và âm thanh

Viết tắt template: **FL** FeatureLaunch, **TIP** TipOfTheDay, **BA** BeforeAfter, **TES** Testimonial, **PRO** Promo (REQUIREMENTS §7). Chế độ âm thanh:
- ~~**G**: giọng đọc + nhạc nền có ducking~~ — **đã bỏ** (Nam 2026-10-08: "loại bỏ lồng tiếng, thay bằng nhạc"). Mọi loại dùng N hoặc B. Clip quay thật có tiếng người nói (khách hàng, người nói trước camera) vẫn giữ âm thanh gốc của clip, đó không phải lồng tiếng.
- **N**: chỉ nhạc nền + chữ/caption (Nam cho phép khi không có giọng đạt).
- **B**: nhạc năng lượng cao làm chủ đạo. *Cập nhật 2026-10-08 (Nam): cảnh không cắt theo beat; thời lượng mỗi cảnh = số giây cố định do Claude tính từ độ dài chữ (REQUIREMENTS §6.2).*

| # | Loại video (`videoType`) | Mục đích | Độ dài | Template | Phong cách hợp (chính / phụ) | Âm thanh | Sản phẩm |
|---|---|---|---|---|---|---|---|
| 1 | `ra-mat-tinh-nang` Ra mắt tính năng | giới thiệu tính năng mới | 20–45 s | FL | `toi-gian` / `tuong-lai`, `robot-cong-nghe` | N | SIPOS, BOS, WEB |
| 2 | `demo-san-pham` Demo thao tác | cho thấy dùng thế nào, quay màn hình | 30–60 s | FL | `toi-gian` / `du-lieu` | N | mọi SP |
| 3 | `meo-hay` Mẹo / "Bạn có biết?" | giáo dục, giữ chân người xem | 15–30 s | TIP | `vui-nhon`, `toi-gian` / `bi-an` (hook) | N | SIPOS, BOS |
| 4 | `huong-dan-nhieu-buoc` Hướng dẫn 3–5 bước | how-to | 30–60 s | TIP | `toi-gian` / `thu-cong` | N | mọi SP |
| 5 | `truoc-sau` Trước / sau | nỗi đau → giải pháp | 15–30 s | BA | `dien-anh`, `du-lieu` / `hanh-dong` | N | SIPOS, BOS |
| 6 | `so-sanh` So sánh cách cũ / cách mới | thuyết phục bằng đối chiếu | 20–40 s | BA | `du-lieu` / `tin-tuc` | N | SIPOS, BOS |
| 7 | `khach-hang-noi` Khách hàng nói | social proof | 20–45 s | TES | `tin-cay`, `dien-anh` / `retro` | âm thanh gốc của clip khách (nếu dùng) + N | mọi SP |
| 8 | `khuyen-mai` Khuyến mãi / flash sale | bán hàng gấp | 10–20 s | PRO | `khuyen-mai`, `hanh-dong` / `nang-dong` | N hoặc B | SIPOS, WEB |
| 9 | `dem-nguoc` Đếm ngược / teaser | gây tò mò trước ngày ra mắt hoặc sự kiện | 10–15 s | PRO | `bi-an`, `tuong-lai` / `glitch-cyberpunk` | N hoặc B | mọi SP |
| 10 | `chuc-mung-dip-le` Chúc mừng dịp lễ | giữ quan hệ, nhận diện | 10–20 s | PRO | `le-hoi`, `lang-man` (14/2, 8/3, 20/10) / `retro` | N | mọi SP |
| 11 | `su-kien-webinar` Mời sự kiện / webinar | đăng ký tham dự | 15–30 s | PRO | `tin-tuc`, `sang-trong` / `toi-gian` | N | BOS, WEB |
| 12 | `tong-ket-su-kien` Tổng kết sự kiện / recap | khoe không khí, ảnh/video thật | 20–45 s | EventRecap (M4) | `nang-dong`, `dien-anh` / `le-hoi` | B | mọi SP |
| 13 | `so-lieu-thanh-tich` Số liệu / thành tích | "10.000 cửa hàng", tăng trưởng | 10–20 s | Stats (M4) | `du-lieu` / `sang-trong` | N hoặc B | mọi SP |
| 14 | `trend-meme` Bắt trend / hài | lan truyền, gần gũi | 7–15 s | TIP | `vui-nhon` / `glitch-cyberpunk` | N hoặc B | SIPOS |
| 15 | `cau-hoi-thuong-gap` Hỏi đáp (FAQ) | trả lời 1 câu hỏi khách hay hỏi | 15–30 s | TIP | `toi-gian`, `tin-cay` | N | mọi SP |
| 16 | `gioi-thieu-cong-ty` Giới thiệu thương hiệu | brand awareness | 30–60 s | EventRecap (M4) | `dien-anh`, `sang-trong` / `tuong-lai` | N hoặc B | Redsun |
| 17 | `tuyen-dung` Tuyển dụng / văn hóa | employer branding | 20–45 s | EventRecap (M4) | `nang-dong`, `tin-cay` / `vui-nhon` | N hoặc B | Redsun |
| 18 | `thong-bao` Thông báo nhanh | cập nhật, bảo trì, chính sách | 7–15 s | TIP | `tin-tuc` / `toi-gian` | N | mọi SP |
| 19 | `video-co-nguoi-noi` Có người nói trước camera | MKT tự quay, cần caption + overlay | 15–60 s | TalkingHead (M4) | `tin-cay` / `toi-gian` | âm thanh gốc của clip + N | mọi SP |
| 20 | `thu-gian-asmr` Thư giãn / không khí quán | F&B, quán đẹp, nhạc nhẹ | 10–20 s | PRO hoặc TES | `thu-gian`, `lang-man` | N | SIPOS (F&B) |

Cả 20 loại đã chạy được: 15 loại trên 5 template M1–M3, 5 loại trên 3 template M4 (EventRecap, Stats, TalkingHead; Nam duyệt 2026-10-08, REQUIREMENTS v0.4 §7.1). Trường riêng của từng template: `.claude/skills/tao-reel/references/script-format.md`.

## 2. Cấu trúc cảnh theo loại video

Mọi loại đều theo khung Hook (0–3 s) → Body → CTA + logo outro (2–3 s) (§7). Phần body khác nhau:

| Loại | Hook (≤3 s) | Body | CTA |
|---|---|---|---|
| Ra mắt tính năng | câu hỏi về nỗi đau / con số | 2–4 cảnh: phone mockup + callout + zoom vào UI | "Dùng thử tại …" |
| Demo thao tác | "Chỉ 3 chạm để…" | quay màn hình, mỗi cảnh 1 thao tác, caption bước | link dùng thử |
| Mẹo | "Bạn có biết?" + số thứ tự mẹo | 1–3 bước, mỗi bước 1 hình | "Lưu lại để dùng" |
| Trước / sau | "Trước đây…" (TRƯỚC) | split / wipe sang SAU, nhãn TRƯỚC/SAU, 1 con số chứng minh | dùng thử |
| So sánh | "Cách cũ vs cách mới" | 2 cột, 3 tiêu chí, dấu ✓/✗ | dùng thử |
| Khách hàng nói | câu quote mạnh nhất | ảnh/video khách, quote lớn, lower third tên + cửa hàng | "Tham gia cùng …" |
| Khuyến mãi | mức giảm cực lớn | giá gạch ngang, badge, hạn chót | "Mua ngay trước …" |
| Đếm ngược | ẩn hình sản phẩm | số đếm ngược, gợi ý từng chi tiết | ngày ra mắt |
| Chúc mừng dịp lễ | lời chúc | 1–2 cảnh không khí, logo | lời chúc + logo (không ép bán) |
| Mời sự kiện | tên sự kiện + ngày | diễn giả / chủ đề, thời gian, địa điểm | link đăng ký |
| Số liệu | con số lớn đếm lên | 2–3 chỉ số, biểu đồ | "Cùng tăng trưởng với …" |
| Bắt trend | khung trend quen thuộc | 2–3 nhịp gag | logo, không ép CTA |
| FAQ | câu hỏi của khách | trả lời 2–3 ý | "Hỏi thêm tại …" |
| Thông báo | tiêu đề thông báo | 1–2 dòng chi tiết | kênh hỗ trợ |

Cấu trúc trên tham khảo cách dựng của các workflow HyperFrames đã cài (chỉ dev đọc để làm template, không chạy cho MKT):
- `/hyperframes:product-launch-video`: loại 1, 2, 16.
- `/hyperframes:motion-graphics`: loại 9, 13, 18.
- `/hyperframes:music-to-video`: chế độ **B**, loại 12, 14.
- `/hyperframes:talking-head-recut` và `/hyperframes:embedded-captions`: loại 19.
- `/hyperframes:faceless-explainer`: loại 3, 4, 15.


### Thứ tự vai trò cảnh mặc định (`role`, REQUIREMENTS §6.2)

Khung chung là Hook → Problem → Solution → (Proof) → CTA. Mỗi loại video dùng một thứ tự mặc định; Claude chỉ được đổi khi có lý do và phải ghi lý do vào `concepts.md`. Góc hook gợi ý dùng cho bước concept.

| # | Loại video | Thứ tự role mặc định | Góc hook gợi ý |
|---|---|---|---|
| 1 | `ra-mat-tinh-nang` | hook → problem → solution → cta | nỗi đau, sắp thay đổi |
| 2 | `demo-san-pham` | hook → solution → solution → cta | con số ("chỉ 3 chạm") |
| 3 | `meo-hay` | hook → solution → cta | lật ngược định kiến |
| 4 | `huong-dan-nhieu-buoc` | hook → solution ×(3–5) → cta | con số (số bước) |
| 5 | `truoc-sau` | hook → problem → solution → proof → cta | trước / sau |
| 6 | `so-sanh` | hook → problem → solution → proof → cta | lật ngược định kiến |
| 7 | `khach-hang-noi` | hook → problem → solution → proof → cta | câu quote mạnh nhất |
| 8 | `khuyen-mai` | hook → solution → cta | con số (mức giảm, hạn chót) |
| 9 | `dem-nguoc` | hook → proof → cta | sắp thay đổi |
| 10 | `chuc-mung-dip-le` | hook → solution → cta (CTA là lời chúc, không bán) | thương hiệu / dịp lễ |
| 11 | `su-kien-webinar` | hook → solution → proof → cta | nỗi đau, thương hiệu (diễn giả) |
| 12 | `tong-ket-su-kien` | hook → proof → proof → cta | con số (người tham dự) |
| 13 | `so-lieu-thanh-tich` | hook → proof → proof → cta | con số |
| 14 | `trend-meme` | hook → problem → solution | lật ngược định kiến (CTA tùy chọn) |
| 15 | `cau-hoi-thuong-gap` | hook → solution → cta | câu hỏi nỗi đau |
| 16 | `gioi-thieu-cong-ty` | hook → problem → solution → proof → cta | thương hiệu, con số |
| 17 | `tuyen-dung` | hook → proof → solution → cta | lật ngược định kiến |
| 18 | `thong-bao` | hook → solution → cta | — (đi thẳng vào thông báo) |
| 19 | `video-co-nguoi-noi` | hook → problem → solution → cta | câu nói mạnh nhất trong clip |
| 20 | `thu-gian-asmr` | hook → solution → cta | — (không khí, không ép bán) |

Ràng buộc chung:
- Video ≤ 45 giây chỉ 1–2 ý chính; dài hơn thì tối đa 3 ý.
- Chữ hook ≤ 40 ký tự mỗi dòng, tối đa 2 dòng.
- Không dùng góc "thú nhận thất bại". Không giật tít sai sự thật.

## 3. Phong cách: MKT tự chọn, mỗi loại có mặc định

Nam (2026-10-08): "phong cách video cho tự chọn, nên có mặc định cho mỗi loại".

Quy tắc:
1. Trường `style` trong brief là **tùy chọn**. Bỏ trống thì dùng **mặc định của loại video** ở bảng dưới.
2. MKT được chọn **bất kỳ** phong cách nào trong 19 phong cách của `docs/video-style-catalog.md`.
   - Chọn phong cách nằm trong danh sách "nên tránh" ở mục 4: skill `tao-reel` hỏi lại một câu, MKT vẫn có quyền giữ.
3. `style: auto`: Claude đề xuất 1 phong cách theo nội dung brief (tone, dịp lễ) kèm lý do một câu, MKT đồng ý thì dùng.
4. Dịp lễ có mặc định riêng. Nếu brief có `occasion` (ví dụ `14-2`, `8-3`, `20-10`, `tet`), phong cách mặc định theo dịp sẽ thay cho mặc định theo loại video (lịch dịp lễ ở `docs/video-style-catalog.md` §4).

| # | Loại video | Phong cách mặc định | Gợi ý khác khi MKT muốn đổi |
|---|---|---|---|
| 1 | `ra-mat-tinh-nang` | `toi-gian` | `tuong-lai`, `robot-cong-nghe` |
| 2 | `demo-san-pham` | `toi-gian` | `du-lieu` |
| 3 | `meo-hay` | `vui-nhon` | `toi-gian`, `bi-an` |
| 4 | `huong-dan-nhieu-buoc` | `toi-gian` | `thu-cong` |
| 5 | `truoc-sau` | `dien-anh` | `du-lieu`, `hanh-dong` |
| 6 | `so-sanh` | `du-lieu` | `tin-tuc` |
| 7 | `khach-hang-noi` | `tin-cay` | `dien-anh`, `retro` |
| 8 | `khuyen-mai` | `khuyen-mai` | `hanh-dong`, `nang-dong` |
| 9 | `dem-nguoc` | `bi-an` | `glitch-cyberpunk` |
| 10 | `chuc-mung-dip-le` | `le-hoi`; 14/2, 8/3, 20/10 → `lang-man` | `retro` |
| 11 | `su-kien-webinar` | `tin-tuc` | `sang-trong`, `toi-gian` |
| 12 | `tong-ket-su-kien` | `nang-dong` | `dien-anh`, `le-hoi` |
| 13 | `so-lieu-thanh-tich` | `du-lieu` | `sang-trong` |
| 14 | `trend-meme` | `vui-nhon` | `glitch-cyberpunk` |
| 15 | `cau-hoi-thuong-gap` | `toi-gian` | `tin-cay` |
| 16 | `gioi-thieu-cong-ty` | `dien-anh` | `sang-trong`, `tuong-lai` |
| 17 | `tuyen-dung` | `nang-dong` | `tin-cay`, `vui-nhon` |
| 18 | `thong-bao` | `tin-tuc` | `toi-gian` |
| 19 | `video-co-nguoi-noi` | `tin-cay` | `toi-gian` |
| 20 | `thu-gian-asmr` | `thu-gian` | `lang-man` |

Cả 19 phong cách đều đã được Nam duyệt (2026-10-08). Ba phong cách `bi-an`, `glitch-cyberpunk`, `thu-cong` dùng kèm guardrail ở style catalog §5.

## 4. Phong cách không nên dùng theo loại video

Phần lớn kết hợp loại × phong cách đều dùng được. Bảng dưới chỉ liệt kê **cặp nên tránh**, để `validate` (M1) cảnh báo MKT:

| Loại video | Tránh phong cách | Lý do |
|---|---|---|
| Khách hàng nói, FAQ, Thông báo | `glitch-cyberpunk`, `bi-an`, `hanh-dong` | làm giảm độ tin cậy, khó đọc |
| Chúc mừng dịp lễ | `khuyen-mai`, `tin-tuc` | lời chúc không nên giống quảng cáo |
| Demo thao tác, Hướng dẫn | `glitch-cyberpunk`, `hanh-dong` | chuyển động nhanh che mất UI |
| Khuyến mãi | `thu-gian`, `sang-trong` | năng lượng không khớp sự gấp gáp |
| Giới thiệu công ty | `glitch-cyberpunk`, `vui-nhon` | không hợp hình ảnh doanh nghiệp |
| Tuyển dụng | `glitch-cyberpunk` | `vui-nhon` được phép (văn hóa công ty trẻ), khớp `config/video-types.ts` |

## 5. Đề xuất triển khai

- **Brief** (§6.1): thêm `videoType:` (id ở mục 1, hoặc `auto`), `style:` (tùy chọn; bỏ trống = mặc định của loại, `auto` = Claude đề xuất, xem mục 3) và `occasion:` (tùy chọn, dịp lễ). Khi `videoType: auto`, skill `tao-reel` đề xuất 1 loại kèm lý do một câu (giống `template: auto`, §10).
- **Config**: thêm `config/video-types.ts`. Mỗi loại khai: template, độ dài min/max, khung cảnh, thứ tự role mặc định, góc hook gợi ý, chế độ âm thanh mặc định, phong cách mặc định, danh sách phong cách nên tránh. zod validate brief theo bảng này. Template không cần sửa vì loại video chỉ chọn props.
- **Không lồng tiếng (mặc định duy nhất)**: template không còn phụ thuộc `timing.json` của giọng. Timing mỗi cảnh = số giây cố định tính từ độ dài chữ (REQUIREMENTS §6.2); caption lúc này thành chữ trên màn hình (`onScreenText`).
- **Thứ tự làm**:
  - M1: loại 1–5, chạy trên FL + TIP.
  - M3: loại 6–11, 14, 15, 18, 20, chạy trên BA/TES/PRO.
  - M4 (xong 2026-10-09): 5 loại 12, 13, 16, 17, 19 chạy trên 3 template mới EventRecap, Stats, TalkingHead.
- **Asset MKT cần chuẩn bị theo loại**:
  - quay màn hình (1, 2, 4);
  - ảnh/video khách hàng kèm văn bản đồng ý (7, 19);
  - ảnh sự kiện (12);
  - số liệu đã duyệt (13);
  - hình lễ hội như pháo hoa, mai, đào, đèn lồng (10): registry không có, xem style catalog §7.

## Câu hỏi chưa giải quyết

1. Danh sách 20 loại đã đủ chưa? Có loại nào MKT đang làm mà còn thiếu (ví dụ livestream recap, unboxing thiết bị POS)?
