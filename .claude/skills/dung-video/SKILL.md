---
name: dung-video
description: Dựng riêng một video reel của dự án redsun-reels — sau khi kịch bản đã duyệt, Claude thiết kế và viết composition HyperFrames riêng cho video đó (briefs/<tên>/dung-rieng/index.html) bằng bộ dụng cụ templates/_rieng, tự soát khung hình rồi xuất. Dùng trong skill tao-reel ở bước dựng video (mặc định), hoặc khi người dùng nói "dựng lại cho đẹp", "video chán quá", "thêm hình, thêm nhân vật", "làm sáng tạo hơn".
model: claude-opus-5-5
---

# Dựng video riêng

Nam chốt 2026-10-09 (docs/decisions.md §18): mỗi video được **thiết kế riêng** như một đoạn phim ngắn, không đổ chữ vào khuôn. Chuẩn chất lượng: bản SIPOS 20/10 và "Ảnh chuyển khoản giả" (xem mục Mẫu). Chất lượng là ưu tiên, không tiết kiệm công.

Nói với MKT tiếng Việt, câu ngắn, không thuật ngữ. Chỉ ghi file trong `briefs/<tên-video>/`.

## Đầu vào
- `briefs/<tên>/brief.md` (đọc kỹ phần "Không được", người xem, giọng điệu) và `script.json` **đã duyệt**: đây là nguồn chữ duy nhất.
- `script.json` phải có `"build": "custom"`.
- Hình MKT gửi: `./reel hinh <tên>` → mở xem từng hình. Có hình người/quán/màn hình thật thì **ưu tiên dùng** (đặt `src="hinh/<file>"`); chưa có thì dùng nhân vật phẳng `RS.person` và màn hình app mô phỏng.

## Đọc trước khi viết (bắt buộc, lần đầu mỗi phiên)
Skill kỹ thuật của plugin HyperFrames (chỉ đọc, **không** chạy creation workflow như `/hyperframes:general-video`, chúng tạo project riêng):
- `hyperframes:hyperframes-core` — luật composition (clip, track, timeline, determinism).
- `hyperframes:hyperframes-creative` → `references/house-style.md`, `references/video-composition.md`, `references/beat-direction.md`, `references/motion-principles.md`.
- `hyperframes:hyperframes-animation` → `blueprints-index.md`, chọn 1–3 blueprint hợp cảnh (vd. `kinetic-type-beats`, `overwhelm-surround`, `device-surface-showcase`).

## Quy trình
1. **Ý tưởng hình** (ghi vào `briefs/<tên>/dung-rieng/storyboard.md`): mỗi cảnh của kịch bản là một **thế giới**, không phải một slide. Với từng cảnh trả lời: người xem đang ở đâu, thấy ai, vật gì tượng trưng cho ý (cuốn sổ = cộng sổ, kính lúp = soi ảnh giả, con dấu = ưu đãi…), chữ nào là điểm nhìn, động từ chuyển động (dập, trượt, vẽ, rơi, nở…), chuyển cảnh. Ghi nhịp cả video (vd. chậm–dồn–CHÉM–sáng–giữ). Xem `storyboard.md` của các video gần đây cùng sản phẩm/dịp để **không lặp lại** thế giới, phép ẩn dụ, bố cục.
2. **Viết** `briefs/<tên>/dung-rieng/index.html` theo khung dưới. Thời lượng gốc = tổng `durationSec` của kịch bản. Cảnh kịch bản có thể chia thành nhiều nhịp nhỏ.
3. **Kiểm**: `./reel validate <tên>` (không còn ✗), rồi `./reel snap <tên>` (dựng + kiểm bố cục/tương phản + chụp khung). Mở ảnh ghép `out/snap/<tên>/contact-sheet*.jpg` và **tự soát** theo danh sách dưới. Sửa đến khi đạt (thường 2–3 vòng). Soát kỹ chỗ chuyển cảnh: `./reel snap <tên> --at=…`.
4. **Xuất**: `./reel render <tên>`, rồi `./reel post <tên>` (brief có caption sẵn thì thay `post.md` bằng caption của brief).

## Khung composition
```html
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />  <!-- bắt buộc ngay đầu (Chrome chỉ dò 1024 byte đầu) -->
<link rel="stylesheet" href="brand/brand.css" />
<link rel="stylesheet" href="_rieng/rieng.css" />
<script src="runtime/gsap/gsap.min.js"></script>
<script src="_rieng/rieng.js"></script>
<style> /* CSS riêng của video; màu qua var(--color-*), var(--prop-*) */ </style>
</head>
<body>
<div id="root" class="rs-root" data-product="sipos" data-occasion="20-10"
     data-composition-id="main" data-duration="31" data-width="1080" data-height="1920">
  <div id="sA" class="clip rs-scene" data-start="0" data-duration="3.4" data-track-index="1"> … </div>
  …
  <audio id="music" src="music/bgm.mp3" data-start="0" data-duration="31" data-track-index="9" data-volume="1"></audio>
</div>
<script>
RS.ready(function (tl) {
  // tl.fromTo(...) cho mọi chuyển động, đặt theo giây tuyệt đối
  window.__timelines["main"] = tl;   // bắt buộc, cuối hàm
});
</script>
</body>
</html>
```
Đường dẫn trong stage: `brand/…` (logo: `brand/logos/<sản-phẩm>/…-trang.png` trên nền tối), `_rieng/…`, `hinh/<file>` (hình MKT gửi), `music/bgm.mp3`.

## Bộ dụng cụ (`templates/_rieng/`)
- CSS: `.rs-root`, `.rs-scene`, `.rs-fill`, nền `.rs-bg-brand | -night | -paper | -theme`, `.rs-glow`, `.rs-grid`; chữ `.rs-hero/-h1/-h2/-body`, `.rs-accent`, `.rs-chip`, `.rs-pill`; `.rs-sub` (phụ đề lời thoại), `.rs-bubble.left|.right` (bong bóng thoại); `.rs-phone > .rs-screen > .rs-notch, .rs-appbar, .rs-pane, .rs-row, .rs-card, .rs-bars, .rs-alert, .rs-tick`; `.rs-paper`, `.rs-hand`, `.rs-note(.pink|.mint)`, `.rs-receipt`; `.rs-stamp`, `.rs-ring`; `.rs-flower`; `.rs-flash`.
- JS `RS`: `ready(build)`, `rng(seed)`, `fit(el, width, max, min)` (chữ vừa khung), `words(el)`, `chars(el)`, `typeOn(tl, el, at, cps)`, `draw(tl, path, at, dur)`, `countUp(tl, el, at, dur, from)`, `burst(tl, parent, kind, {x,y,count,spread,rise,at,seed})` (petal/confetti/coin/heart/star), `drift(...)`, `flowers(tl, parent, [[x,y,s]], at)`, `shake(tl, el, at, amp, times)`, `flash(tl, el, at)`, `person({shirt, hair, phone, phoneOk, width})` + `mood(tl, person, "binh-thuong|nhiu-may|sung-sot|nhe-nhom|cuoi", at)`.
- Thiếu đạo cụ thì tự vẽ bằng HTML/CSS/SVG trong composition. Cần dùng lại nhiều lần → ghi `review.md` mục `## Cần dev` để thêm vào bộ dụng cụ.

## Luật nội dung (validate chặn)
- **Chữ hiển thị viết tĩnh trong HTML.** Mọi câu của kịch bản phải có trên màn hình đúng chữ (tách thẻ được). Lời thoại (brief ghi "Lời nói") → bong bóng thoại hoặc phụ đề `.rs-sub` (video không lồng tiếng).
- **Không bịa**: số trên màn hình phải có trong brief/kịch bản. Số mẫu của đạo cụ (sổ tay, màn hình app, hoá đơn) đặt trong phần tử `data-minh-hoa`; dòng JS gán chữ phải ghi `// minh-hoa`. Số mẫu không được giống lời hứa (không "tăng 30% doanh thu" trên màn hình mẫu).
- Không tên ngân hàng, phần mềm, thương hiệu khác; không ảnh chuyển khoản/ảnh thật của bên thứ ba; không nhân vật là "khách hàng thật" khi brief không ghi.
- Brand: chỉ Montserrat; màu sản phẩm qua `data-product`; logo có sẵn; viết đúng SIPOS, REDSUN BOS, Webino, REDSUN.
- Không tải gì từ mạng.

## Luật kỹ thuật (lint/check hay vấp)
- Dùng `tl.fromTo` (không `from`), mọi chuyển động gắn vào `tl`; không `Math.random` (dùng `RS.rng`); không tween `visibility/display` của `.clip`; không `<br>` (dùng `<div>` từng dòng); không CSS `transform` ban đầu trên phần tử GSAP tween (đặt trong `fromTo`).
- Tween chạy sau trong timeline mà đặt trạng thái đầu khác hiện tại: thêm `immediateRender: false` (vd. chớp sáng, đổi ca).
- Chữ cố ý chồng lên nhau (giấy nhớ phủ sổ): `data-layout-allow-overlap` **trên chính phần tử chữ**; bị che cố ý: `data-layout-allow-occlusion`; phần trang trí tràn khung: `data-layout-allow-overflow`.
- Tương phản ≥ 3:1: màu nhấn trên nền tối dùng `var(--color-accent-glow)`; chữ xanh "đã nhận" trên nền trắng dùng `var(--prop-ok-ink)`. Chuyển nền kiểu "mở tròn" dùng `clip-path: circle()` trên lớp phủ kín khung (không scale chấm tròn, bộ đo tương phản đọc sai).
- Chữ quan trọng trong vùng an toàn: trái 80, phải 160 (tính từ mép phải: chữ không quá x = 920), trên 220, dưới 420 (không thấp hơn y = 1500).

## Tự soát khung hình (mỗi vòng snap)
- [ ] Mỗi khung có **một điểm nhìn** rõ và ít nhất 2 lớp (nền có chiều sâu + nội dung + chi tiết).
- [ ] Không khung nào trống nửa màn hình; không chữ dạng "slide" trôi giữa nền trơn.
- [ ] Có **con người** (hình MKT gửi hoặc nhân vật) khi câu chuyện có người; có **sản phẩm** (màn hình app) ở cảnh giải pháp.
- [ ] Chữ đọc được: tiêu đề ≥ 60px, không dính chữ, không gãy dòng xấu (chữ đơn lẻ rơi xuống dòng), không tràn khung, không bị che.
- [ ] Hình động đúng nghĩa câu (vật/động từ khớp ý), đổi hình ít nhất mỗi 2 giây, cảnh cuối giữ đủ lâu.
- [ ] Khác hẳn video gần đây cùng sản phẩm/dịp.

## Mẫu (đọc để lấy chuẩn chất lượng)
- `briefs/2026-10-20-sipos-phu-nu-20-10/dung-rieng/index.html` — 15s: đêm, cuốn sổ, giấy nhớ vây, nét bút chém → điện thoại đổi ô "kho / thu chi / khách quen" → hồng 20/10, hoa nở, con dấu -20% → CTA.
- `briefs/2026-10-09-sipos-anh-chuyen-khoan-gia/dung-rieng/index.html` — 31s: quầy đông, bong bóng thoại, nhân vật phẳng đổi nét mặt, kính lúp, ảnh giả nhiễu sọc + dấu "GIẢ", màn hình theo ca, nút CTA được bấm.

## Không làm
- Không đổi chữ, thời lượng, nhạc đã duyệt (việc của `tao-reel`; đổi thì đưa MKT duyệt lại).
- Không sửa `templates/`, `brand/`, `config/`, `scripts/`.
