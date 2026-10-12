# Ngôn ngữ máy quay — góc máy, chuyển động, ánh sáng cho reel

Dùng ở hai chỗ:
- **`moTa` cảnh AI** (`ai/canh-ai.json`, skill `chon-kieu-hinh`): mô tả tiếng Anh gửi Veo / Kling / Seedance.
- **Chuyển động máy quay HyperFrames** cho video hoạt hình (skill `dung-video`): mỗi chuyển động một lớp `.cam` riêng lồng nhau.

Rút gọn từ [cinematic-video-prompt-skill](https://github.com/Rylaispirit/cinematic-video-prompt-skill) (Rylaispirit, giấy phép MIT), chỉ giữ phần hợp reel dọc 9:16 của dự án. Nam 2026-10-12 (decisions §36): không cài nguyên skill ngoài.

## 1. Công thức mô tả một clip AI
```
[Shot size + angle], [nhân vật: tuổi, tóc, trang phục], [một hành động cụ thể + nét mặt], [bối cảnh], [ánh sáng], [một chuyển động máy], [màu + mood], 9:16 vertical.
```
- Mỗi clip **một chuyển động máy, một hành động chính**. Cần hơn thì tách cảnh nhỏ theo mốc giây.
- Nhân vật và hành động đứng trước, thuật ngữ máy quay đứng sau. Tối đa khoảng 8 từ kỹ thuật.
- Nhắc lại đúng khối ngoại hình (`dan`) ở mọi cảnh: máy tự gắn, đừng tả khác đi.
- Ánh sáng khớp giờ trong ngày (văn phòng: `soft window light, overcast daylight` hoặc `office fluorescent light`). Ghi giờ cụ thể ("3:40 PM") giúp ánh sáng đều qua nhiều cảnh.

## 2. Bài học khi model làm sai (bổ sung ghi chú Veo của `chon-kieu-hinh`)
- **Số cảnh nhỏ**: muốn cắt thì ghi rõ số shot và tổng giây (`3 hard-cut shots, total 8s`). Muốn một cú máy liền thì ghi `single continuous shot, no cuts`. Clip 8–10 giây tối đa 3–5 nhịp.
- **Cảm xúc theo chuỗi**: viết thành thứ tự nhịp (`freezes → eyes widen → swallows → looks down`). Muốn kìm thì ghi câu cấm cụ thể (`no crying, no smiling, lips stay closed`). Model hay đẩy cảm xúc quá tay.
- **Sự kiện phải có vị trí, thời điểm, kết quả thấy được**: `at 2s he places the folder flat on the desk with a firm hand, papers stay still`. Viết điều muốn thấy, không chỉ viết điều cấm.
- **Thông số bằng số hay bị bỏ qua** ("no slow motion", "24 seconds"): đừng tốn chữ. Quay chậm làm ở HyperFrames (`data-playback-rate`).
- **Chữ trên hình không tin được**: tên công ty, biển hiệu, màn hình đều ghép bằng HyperFrames.
- **Không gọi tên phim, diễn viên, nhân vật có bản quyền** ("like a Chinese CEO drama", tên phim cụ thể): tả nhân vật của riêng mình.

## 3. Bảng thuật ngữ gọn
| Nhóm | Từ khoá | Dùng khi |
|---|---|---|
| Cỡ cảnh | `wide shot` · `medium shot` · `medium close-up` · `close-up / reaction shot` · `extreme close-up` (mắt, tay, giấy) | Toàn phòng · từ thắt lưng · từ vai · mặt phản ứng · chi tiết |
| Góc máy | `eye-level` · `low angle / hero shot` · `high angle` · `dutch tilt` · `over-the-shoulder` · `POV shot` | Trung lập · quyền lực · nhỏ bé, bị áp · bất ổn · đối thoại · góc nhìn mình |
| Chuyển động | `static / locked-off` · `slow dolly in` · `slow dolly out` · `crash zoom` · `whip pan` · `handheld, slight shake` · `slow pan` · `arc shot` | Trang trọng · nhận ra điều gì · lộ bối cảnh · sốc, hài · chuyển nhanh · chân thực, căng · quét phòng · khoảnh khắc đắc thắng |
| Ánh sáng | `soft window light` · `hard light, high contrast` · `rim lighting` · `low-key lighting` · `screen light on face` | Đời thường · kịch tính · tách người khỏi nền · u tối, căng · đêm làm việc |
| Màu, mood | `muted cool palette` · `warm palette` · `high contrast` · `tense` · `suspenseful` · `dramatic` · `relieved` · `triumphant` | Căng thẳng · nhẹ nhõm · drama · cảm xúc chính |

## 4. Combo theo kiểu kể
| Kiểu kể / khoảnh khắc | Góc + cỡ | Chuyển động | Ánh sáng, mood | Tiếng (`brand/sfx`) |
|---|---|---|---|---|
| **Drama văn phòng** — hỗn loạn mở đầu | wide → medium nhiều mặt | `handheld, slight shake`, `whip pan` giữa các mặt | office light, `tense` | `dung-hinh`, `tick` |
| Drama văn phòng — cả phòng đứng hình | reaction close-up từng người | `static`, cắt nhanh 0,3–0,5 giây/mặt | `muted cool palette` | `dung-hinh` rồi `lang` + `tim-dap` |
| Drama văn phòng — gỡ nút thắt | over-the-shoulder vào màn hình | `slow dolly in` | `warm palette`, `relieved` | `sparkle`, `hoi-tho` |
| **Tổng tài** — xuất hiện | `low angle / hero shot`, full body → medium | quay chậm (`data-playback-rate` 0,6–0,8 hoặc ảnh + đẩy chậm) | `rim lighting`, `high contrast`, `dramatic` | `buoc-chan`, `whoosh-tram` |
| Tổng tài — câu chốt hạ | sau lưng hoặc bàn tay đặt tập hồ sơ (giọng ngoài khung) | `static` | `low-key lighting`, `tense` | `dap-dau` |
| Tổng tài — áp lực dồn | `high angle` lên nhân viên, `dutch tilt` | `slow dolly in` | `muted cool palette` | `riser` |
| Tổng tài — cú lật | extreme close-up mắt tổng tài | `crash zoom` | `high contrast` | `dun-dun` |
| Tổng tài — gật đầu / sững người | medium close-up | `static` hoặc `slow dolly out` | `warm palette`, `triumphant` | `boom` nhỏ hoặc im |

Hài trong drama đến từ **độ cường điệu** (quay chậm, `dun-dun` cho một chuyện văn phòng nhỏ), không từ làm nhục ai.

## 5. Làm chuyển động bằng HyperFrames (video hoạt hình)
Mỗi chuyển động một lớp `.cam` lồng nhau (`#camC > #camB > #camA`), không đổi `transformOrigin` trên lớp đang phóng to.

| Chuyển động | Cách làm (GSAP trên lớp `.cam`) |
|---|---|
| `slow dolly in` | `tl.fromTo(cam, { scale: 1 }, { scale: 1.12, duration: 2.5, ease: 'none' }, at)`, `transformOrigin` đặt vào mặt nhân vật |
| `slow dolly out` | ngược lại, 1.15 → 1 |
| `crash zoom` | `scale` 1 → 1.6 trong 0,15–0,2 giây, `ease: 'power4.in'`, gốc ở mắt; kèm `RS.flash` nhẹ |
| `dutch tilt` | `rotation` 0 → -6 (độ), 0,4 giây, `power2.out`; giữ trong nhịp căng rồi về 0 |
| `hero shot` góc thấp | nhân vật `scale` 1.15, gốc ở chân, đặt thấp trong khung; nền (`RS.set`) dịch lên 3–5% để có cảm giác máy thấp |
| `whip pan` | lớp cam `x` ±1080 trong 0,18 giây, `power3.inOut`, đổi cảnh giữa chừng, kèm `whoosh-nhanh` |
| `handheld, slight shake` | `RS.shake(tl, cam, at, 6, n)` biên độ nhỏ (4–8 px) |
| Quay chậm | kéo dài khoảnh khắc gấp đôi, ease `sine.inOut`; clip AI dùng `data-playback-rate` 0,5–0,9 |
| Đứng hình | dừng mọi tween 0,4–0,6 giây, khử bão hoà nền (`filter: saturate(0.3)`) rồi trả lại |

## 6. Nhạc
Hai kiểu drama dùng bài mood `dien-anh` / `bi-an` / `hanh-dong` có nhịp ngay 3 giây đầu: sẵn có `mixkit-tapis-615`, `mixkit-driving-ambition-32`, `mixkit-classical-vibes-4-684`. Bài drama riêng (Nam nghe duyệt 2026-10-12, `notes` ghi "Drama…" trong `brand/music/manifest.json`): tổng tài `mixkit-i-wont-surrender-846` (kèn đồng + trống), `mixkit-training-53` (dây kịch tính); drama văn phòng `mixkit-thunder-318` (trap u ám), `mixkit-complicated-281` (dự phòng). Cắt cảnh trúng phách: `./reel info nhip <id>`.
