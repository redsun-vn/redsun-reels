---
name: dung-video
description: Dựng riêng một video reel của dự án redsun-reels — sau khi kịch bản đã duyệt, Claude thiết kế và viết composition HyperFrames riêng cho video đó (briefs/<tên>/dung-rieng/index.html) bằng bộ dụng cụ templates/_rieng, tự soát khung hình rồi xuất. Dùng trong skill tao-reel ở bước dựng video (mặc định), hoặc khi người dùng nói "dựng lại cho đẹp", "video chán quá", "thêm hình, thêm nhân vật", "làm sáng tạo hơn".
model: claude-opus-5-5
---

# Dựng video riêng

Nam chốt 2026-10-09 (docs/decisions.md §18, §19): mỗi video được **thiết kế riêng** như một đoạn phim ngắn, không đổ chữ vào khuôn. Chuẩn chất lượng: "Ảnh chuyển khoản giả" (xem mục Mẫu). Chất lượng là ưu tiên, không tiết kiệm công; chỉ cần nội dung chính xác.

Năm yêu cầu của Nam (đo được, lệnh kiểm báo khi vi phạm):
1. **Con người đẹp, thân thiện với người Việt**: nhân vật `RS.person` (mắt hạnh nhân, tóc đen, áo dài/áo bà ba/tạp dề quán…) hoặc hình người thật MKT gửi. Nhân vật **to** (đầu ≥ 180px), có cận mặt ở khoảnh khắc cảm xúc.
2. **Nét mặt đúng cảm xúc** của câu chuyện ở từng giây (bảng dưới). Sai cảm xúc là lỗi nội dung.
3. **Mỗi cảnh một nền khác** (màu, ánh sáng, không gian), dựng từ bối cảnh vẽ sẵn `RS.set`. `./reel snap` báo "Cảnh có nền gần giống nhau".
4. **Luôn chuyển động**: không đoạn nào gần như đứng hình ≥ 2 giây. `./reel render` báo "Đoạn gần như đứng hình".
5. **Có tiếng động** khớp hành động (khai trong `tieng-dong.txt`, validate báo khi thiếu), **cắt/nhấn theo phách nhạc** (`./reel info nhip <id-nhạc>`).

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
   - Lấy nhịp: `./reel info nhip <id-nhạc>` → đặt điểm cắt cảnh/nhấn mạnh (chữ dập, dấu, bật) lên **phách mạnh**, hành động nhỏ lên phách thường. Ghi các phách vào chú thích đầu composition.
   - Mỗi cảnh: chọn nền riêng (bối cảnh `RS.set`, đổi nơi/ánh sáng/tông giữa các cảnh); cỡ cảnh xen kẽ (toàn → chèn cận vật → trung → cận mặt); nối hình giữa các cảnh (vật cuối cảnh trước = vật đầu cảnh sau: đồng hồ quán → đồng hồ đêm; điện thoại → ảnh trên màn hình).
2. **Dựng thô + bảng khung chính** (luồng từng bước của `tao-reel`: **DỪNG chờ MKT duyệt**; luồng tự động: tự soát bảng theo "Luật kể chuyện", sửa, rồi làm tiếp và gửi bảng kèm video). Viết `briefs/<tên>/dung-rieng/index.html` theo khung dưới đủ để từng khoảnh khắc chính đúng hình: bối cảnh, nhân vật đúng nét mặt/tư thế, chữ, đạo cụ (chuyển động kỹ, tiếng động làm sau). Thời lượng gốc = tổng `durationSec` của kịch bản; cảnh kịch bản có thể chia nhiều nhịp nhỏ. Khai `bang-canh.txt` (mỗi nhịp một khung, 4–18 khung): `giây | điều xảy ra | tiếng | chuyển sang khung sau`. Chạy `./reel bang <tên>` → `out/snap/<tên>/bang-canh.png`, tự soát bảng theo "Luật kể chuyện" rồi gửi MKT ảnh bảng (SendUserFile nếu có) và hỏi: **"đạt" hay "sửa khung số …"**. Sửa đến khi MKT duyệt; ghi kết quả vào `review.md`. Ở luồng từng bước, không làm bước 3 khi bảng chưa duyệt: sai câu chuyện hay hình thì sửa ở đây rẻ hơn sửa cả video.
3. **Làm kỹ**: chuyển động đầy đủ (máy quay, nhân vật, nền sống), `tieng-dong.txt` (tiếng động theo giây + một khoảng lặng `lang` ngay trước khoảnh khắc vỡ lẽ), điểm cắt/nhấn theo phách.
4. **Kiểm**: `./reel validate <tên>` (không còn ✗), rồi `./reel snap <tên>` (dựng + kiểm bố cục/tương phản + so nền các cảnh + chụp khung). Xem khung hình và **tự soát** theo danh sách dưới. Sửa đến khi đạt (thường 2–3 vòng). Soát riêng **mọi khoảnh khắc cảm xúc** và chỗ chuyển cảnh: `./reel snap <tên> --at=…`.
5. **Xuất**: `./reel render <tên>`. Bước xuất đo trên file thật và in: đoạn gần như đứng hình, "Lặng trước vỡ lẽ" (khoảng lặng thấp hơn ≥ 8 dB, tiếng to nhất video rơi ngay lúc vỡ lẽ), "Chuyển hình trên phách" (≥ 70% cú chuyển bắt đầu hoặc dừng đúng phách). Dòng nào bắt đầu bằng "!" thì sửa rồi xuất lại. Rồi `./reel post <tên>` (brief có caption sẵn thì thay `post.md` bằng caption của brief).

## Khung composition
```html
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />  <!-- bắt buộc ngay đầu (Chrome chỉ dò 1024 byte đầu) -->
<link rel="stylesheet" href="brand/brand.css" />
<link rel="stylesheet" href="_rieng/rieng.css" />
<link rel="stylesheet" href="_rieng/boi-canh.css" />
<script src="runtime/gsap/gsap.min.js"></script>
<script src="_rieng/rieng.js"></script>
<script src="_rieng/nhan-vat.js"></script>
<script src="_rieng/boi-canh.js"></script>
<style> /* CSS riêng của video; màu qua var(--color-*), var(--prop-*) */ </style>
</head>
<body>
<div id="root" class="rs-root" data-product="sipos" data-occasion="20-10"
     data-composition-id="main" data-duration="31" data-width="1080" data-height="1920">
  <div id="sA" class="clip rs-scene" data-start="0" data-duration="3.4" data-track-index="1">
    <div id="camA" class="cam" data-layout-allow-overflow>
      <div id="nv"></div>              <!-- người đứng sau quầy -->
      <div class="bc-cho-gan"></div>   <!-- quầy (lớp trước của bối cảnh) chèn vào đây -->
      <div id="khach"></div>           <!-- người đứng trước quầy -->
    </div>
  </div>
  …
  <audio id="music" src="music/bgm.mp3" data-start="0" data-duration="31" data-track-index="9" data-volume="1"></audio>
  <!-- TIENG-DONG -->   <!-- bước dựng thay bằng thẻ <audio> từ tieng-dong.txt -->
</div>
<script>
RS.ready(function (tl) {
  const bgA = RS.set(document.querySelector("#camA"), "quan", { light: "ngay" });
  RS.setLive(tl, bgA, 0, 3.4, 1);
  // tl.fromTo(...) cho mọi chuyển động, đặt theo giây tuyệt đối
  window.__timelines["main"] = tl;   // bắt buộc, cuối hàm
});
</script>
</body>
</html>
```
Đường dẫn trong stage: `brand/…` (logo: `brand/logos/<sản-phẩm>/…-trang.png` trên nền tối), `_rieng/…`, `hinh/<file>` (hình MKT gửi), `music/bgm.mp3`.

`tieng-dong.txt` (cùng thư mục với index.html), mỗi dòng `giây tên âm-lượng  # ghi chú`, ví dụ:
```
# A quán
0.28 pop 0.5        # bong bóng "Em chuyển rồi nha"
1.30 whoosh 0.3     # lùi máy, trên phách
```
Thêm **đúng một** dòng khoảng lặng trước khoảnh khắc vỡ lẽ: `lang 13.55 14.09` (nhạc nền hạ xuống 0.15 từ 13.55, trở lại ở 14.09; mức khác: `lang 13.55 14.09 0.25`). Trong khoảng lặng không đặt tiếng động to (> 0.25); tiếng nhấn to nhất (`boom`, `dap-dau`) đặt đúng giây <đến>.
Không viết tay thẻ `<audio src="sfx/…">`: validate báo khi tên tiếng, giây, âm lượng, khoảng lặng sai.

`bang-canh.txt` (cùng thư mục): mỗi dòng một khung chính cho MKT duyệt, ví dụ `14.4 | Dấu GIẢ dập xuống | ầm, dập dấu | xé đôi ảnh`.

Máy quay: mỗi kiểu chuyển động máy (lùi ra, đẩy vào, lao vào vật) dùng **một lớp `.cam` riêng lồng nhau** (`#camB3 > #camB2 > #camB`); đổi `transformOrigin` trên cùng một lớp đang phóng to sẽ giật hình.

## Bộ dụng cụ (`templates/_rieng/`)
- CSS: `.rs-root`, `.rs-scene`, `.rs-fill`, nền `.rs-bg-brand | -night | -paper | -theme`, `.rs-glow`, `.rs-grid`; chữ `.rs-hero/-h1/-h2/-body`, `.rs-accent`, `.rs-chip`, `.rs-pill`; `.rs-sub` (phụ đề lời thoại), `.rs-bubble.left|.right` (bong bóng thoại); `.rs-phone > .rs-screen > .rs-notch, .rs-appbar, .rs-pane, .rs-row, .rs-card, .rs-bars, .rs-alert, .rs-tick`; `.rs-paper`, `.rs-hand`, `.rs-note(.pink|.mint)`, `.rs-receipt`; `.rs-stamp`, `.rs-ring`; `.rs-flower`; `.rs-flash`.
- JS `RS` (rieng.js): `ready(build)`, `rng(seed)`, `fit(el, width, max, min)` (chữ vừa khung), `words(el)`, `chars(el)`, `typeOn(tl, el, at, cps)`, `draw(tl, path, at, dur)`, `countUp(tl, el, at, dur, from)`, `burst(tl, parent, kind, {x,y,count,spread,rise,at,dur,seed})` (petal/confetti/coin/heart/star), `drift(...)`, `flowers(tl, parent, [[x,y,s]], at)`, `shake(tl, el, at, amp, times)`, `flash(tl, el, at)`.
- Nhân vật (nhan-vat.js), khung 600×900 (đầu giữa trên, cằm y≈472, ngực y≈650), chiều cao = width × 1.5:
  - **Dàn nhân vật (bắt buộc):** khai một lần ở đầu hàm dựng `const ai = RS.cast({ chu: { hair, outfit, shirt, skin… }, nv: {…} })`, mọi cảnh tạo người bằng `ai("chu", { width, pose, mood, phone })`. Một người giữ nguyên tóc, áo, màu da, kính ở mọi cảnh (đổi là báo lỗi). Ghi bảng dàn nhân vật (ai, vai gì, xuất hiện cảnh nào) vào storyboard; người trong brief (khách, nhân viên, chủ quán) phải đúng vai ở đúng cảnh.
  - `RS.person({ hair, outfit, shirt, skin, hairColor, glasses, hat, phone, phoneOk, width, pose, mood })`. Tóc: `mai` (dài, mái bằng) · `mai-ngan` · `long` · `bob` · `bun` (búi) · `ponytail` · `short` (nam). Áo: `ao` (phông) · `so-mi` · `tap-de` (tạp dề quán) · `ao-dai` · `ba-ba`. `hat: "non-la"`. `skin: 1` (vàng ấm) / `2` (rám nắng). `shirt: a|b|c`.
  - Gọi theo **thứ tự thời gian tăng dần** cho mỗi nhân vật: `RS.idle(tl, p, từ, đến, seed)` (thở + chớp mắt, luôn gọi), `RS.mood(tl, p, mood, at)`, `RS.pose(tl, p, pose, at, dur)`, `RS.talk(tl, p, at, dur)` (mấp máy miệng khi có bong bóng thoại/phụ đề của người đó), `RS.look(tl, p, "trai|phai|len|xuong|giua", at)`, `RS.tilt(tl, p, độ, at)` (gật/lắc đầu = tilt qua lại), `RS.wave(tl, p, at, lần)` (sau pose "vay").
  - Tư thế: `xuoi` · `cam-dt` · `nhin-dt` · `khoe-dt` · `vay` · `chong-cam` · `om-dau` · `xoe-tay` · `chi` · `chi-trai` · `chap-tay` · `giu-nguc` · `an-mung` · `nam-tay`, hoặc vị trí bàn tay `{ L: [x, y], R: [x, y, "duoi"], dt }` (khớp tay tự tính).
  - Không tween trực tiếp `transform` của các nhóm khớp trong SVG (`.j-*`): hàm tư thế ghi đè.
- **Bối cảnh vẽ sẵn (boi-canh.js) — dùng cho nền mọi cảnh**, không tự vẽ lại tường/quầy/cửa sổ. `RS.set(container, tên, { light, tone, seed, khong, clock, window, gio })` chèn lớp sau làm con đầu của `container` (thường là lớp `.cam`), lớp trước (quầy, bàn, tủ kính, pallet, sàn) vào chỗ `<div class="bc-cho-gan">`. Trả về `bg` với `bg.pos("clock")` = tâm vật (làm tâm đẩy máy), `bg.parts`.
  - Nơi chốn: `quan` (quán nước: bảng menu, đèn thả, dây đèn, kệ ly, đồng hồ; trước: quầy) · `nha` (phòng ở nhà: cửa sổ rèm, đồng hồ, đèn bàn, cây; trước: bàn + cốc) · `cua-hang` (tạp hoá: mái bạt sọc, kệ hàng; trước: tủ kính) · `van-phong` (cửa kính nhìn phố, cây cao; trước: bàn + màn hình biểu đồ) · `kho` (giá kệ thùng carton; trước: pallet) · `pho` (dãy nhà ống, ban công, cột điện, vỉa hè) · `livestream` (rèm phông, giá treo quần áo, đèn vòng; trước: bàn hàng + điện thoại trên giá).
  - Nền trừu tượng: `bao-dong` (đỏ mận, tia đèn xoay, sọc quét: lật tẩy, sự cố) · `sang` (sáng, mảng màu trôi: giải pháp) · `thuong-hieu` (màu sản phẩm, tia sáng; `san: false` bỏ sàn: kết, CTA).
  - `light`: `ngay` · `chieu` · `dem` (tường tối, đèn sáng quầng, cửa sổ trăng sao, phố lên đèn). `tone` tường: `kem` · `hong` · `mint` · `xanh` · `vang` · `xam`. Cùng một nơi ở hai cảnh thì đổi `light`/`tone` để nền khác nhau.
  - `RS.setLive(tl, bg, từ, đến, seed)` (luôn gọi): đèn đung đưa, lá rung, mây trôi, khói cốc, đèn nháy ban đêm, tia xoay. `RS.clockSpin(tl, bg, at, dur, vòng)`: kim quay (thời gian trôi; `gio: [giờ, phút]` đặt kim ban đầu để nối khớp sang đồng hồ cảnh sau).
- Tiếng động (`brand/sfx/`, tự tổng hợp, `pnpm gen:sfx`, khai trong `tieng-dong.txt`): `pop` (bong bóng, chữ bật) · `tap` (bấm) · `tick` (dò từng dòng, kim đồng hồ) · `whoosh` (chuyển cảnh, vật bay) · `whoosh-nhanh` (chữ trượt) · `ding` (thông báo) · `coin` (tiền vào) · `dap-dau` (dấu dập, va mạnh) · `thump` (đặt vật) · `glitch` (ảnh giả, lỗi) · `sai` (thiếu, sai) · `sparkle` (giải pháp, nhẹ nhõm) · `riser` (dâng lên trước khi lật tẩy) · `boom` (khoảnh khắc lớn) · `hoi-tho` (thở phào). Âm lượng 0.2–0.6; tiếng nền nhỏ (bong bóng chat trôi) 0.2.
- Thiếu đạo cụ hay nơi chốn thì tự vẽ bằng HTML/CSS/SVG trong composition. Cần dùng lại nhiều lần (nơi chốn mới, đạo cụ hay gặp) → ghi `review.md` mục `## Cần dev` để thêm vào bộ dụng cụ.

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

## Luật kể chuyện (soát ở bảng khung chính, rồi ở bản xuất)
- **Câu chuyện là một quá trình thật** theo đúng thứ tự (nhận ảnh → tối kiểm tiền → thiếu → soi → lật tẩy → có giải pháp). Mỗi nhịp sinh ra từ nhịp trước.
- **Một thứ để mắt bám** suốt video: nhân vật chính (cùng dàn nhân vật), hoặc một vật (cuốn sổ, điện thoại).
- **Một màu một nghĩa** suốt video (vd. đỏ = rủi ro/ảnh giả, teal = SIPOS). Không dùng màu đó để trang trí chỗ khác.
- **Lặng trước, to nhất lúc vỡ lẽ**: 0.5–2 giây lặng (khai `lang`) giữ hình, rồi tiếng nhấn to nhất đúng khoảnh khắc vỡ lẽ. Đoạn dày hình nhất nằm ngay trước khoảng lặng, không trùng điểm vỡ lẽ.
- **Kết là mở đầu đã đổi khác**: cảnh cuối gọi lại hình mở đầu với điều câu chuyện mang lại (quầy quán ban đầu → cùng quầy, giờ có SIPOS, hai người cười).
- **Mỗi lần chuyển cảnh nói được lý do** (ghi ở cột "chuyển sang khung sau"): bước tiếp theo · nối hình (vật cuối cảnh trước = vật đầu cảnh sau) · biến hình (vật này thành vật kia) · mở/đóng tròn vào nhân vật · phóng vào bên trong / lùi ra toàn cảnh · nhìn thấy gì (góc nhìn nhân vật) · nguyên nhân → kết quả · thời gian trôi (kim quay, trời tối) · gọi lại cảnh trước.
- **Diễn ý bằng hình, không dán nhãn**: "kiểm tiền thiếu" = ngón tay dò từng dòng, một dòng đỏ "Không thấy"; chữ chỉ gọi tên.
- **Cỡ cảnh xen kẽ**, có ít nhất **một cận cực sát** (mặt, ngón tay, dấu tick).
- **Mỗi khung có ít nhất 3 chi tiết sống** ở nền hoặc người (đèn đung đưa, khói cốc, chớp mắt, người xếp hàng nhún, đèn cửa sổ nháy): `RS.idle`, `RS.setLive`.
- **Tránh kiểu "nhìn là biết máy làm"**: tiêu đề giữa nền gradient trơn; mọi thứ hiện mờ dần; nhãn/khung ở bốn góc; quầng sáng trên giao diện; bùng hạt chung chung; kết chỉ bằng logo xoay.

## Nét mặt theo cảm xúc (chọn đúng, không dùng "cười" cho mọi lúc)
| Khoảnh khắc trong chuyện | `mood` | Hay đi với tư thế |
|---|---|---|
| Chào, xác nhận lịch sự | `binh-thuong` → `cuoi` | `chap-tay`, gật đầu (`tilt`) |
| Vui, đắc ý, chào kết | `cuoi` | `vay`, `an-mung` |
| Chăm chú kiểm sổ, đọc màn hình | `tap-trung` | `nhin-dt` |
| Thấy sai, khó chịu, "sao lại thiếu" | `nhiu-may` (cau mày, nheo mắt) | `chong-cam` |
| Lo, bối rối | `lo-lang` (lông mày nhướng, mồ hôi) | `xoe-tay` |
| Ngờ vực, xem lại | `nghi` (một bên lông mày nhướng) | `khoe-dt` |
| Bị lừa, phát hiện bất ngờ | `sung-sot` | `om-dau` |
| Thất vọng, tiu nghỉu | `buon` | `xoe-tay`, lắc đầu |
| Thở phào (có giải pháp) | `nhe-nhom` | `giu-nguc` + tiếng `hoi-tho` |
| Tự tin, làm chủ | `tu-tin` | `nam-tay` |

## Tự soát khung hình (mỗi vòng snap)
- [ ] **Nét mặt từng nhân vật đúng cảm xúc câu chuyện** ở mọi khoảnh khắc (soát riêng từng khoảnh khắc bằng `--at`).
- [ ] Nhân vật thân thiện với người Việt (tóc, áo, bối cảnh quán xá Việt), đủ to, không bị cắt mặt.
- [ ] Mỗi khung có **một điểm nhìn** rõ và ít nhất 2 lớp (nền có chiều sâu + nội dung + chi tiết).
- [ ] Không khung nào trống nửa màn hình; không chữ dạng "slide" trôi giữa nền trơn.
- [ ] Có **con người** (hình MKT gửi hoặc nhân vật) khi câu chuyện có người; có **sản phẩm** (màn hình app) ở cảnh giải pháp.
- [ ] Chữ đọc được: tiêu đề ≥ 60px, không dính chữ, không gãy dòng xấu (chữ đơn lẻ rơi xuống dòng), không tràn khung, không bị che.
- [ ] Hình động đúng nghĩa câu (vật/động từ khớp ý), đổi hình ít nhất mỗi 2 giây, cảnh cuối giữ đủ lâu nhưng vẫn chuyển động.
- [ ] Mỗi hành động có tiếng động hợp; điểm nhấn rơi trên phách; có khoảng lặng ngay trước khoảnh khắc vỡ lẽ.
- [ ] Đủ "Luật kể chuyện": một thứ để mắt bám, một màu một nghĩa, kết gọi lại mở đầu, mỗi chuyển cảnh có lý do, có cận cực sát, ≥ 3 chi tiết sống mỗi khung.
- [ ] Khác hẳn video gần đây cùng sản phẩm/dịp.

## Mẫu (đọc để lấy chuẩn chất lượng)
- `briefs/2026-10-09-sipos-anh-chuyen-khoan-gia/dung-rieng/index.html` — **chuẩn mới**, 31s: mở bằng cận mặt khách + điện thoại → lùi ra quầy đông → đẩy vào đồng hồ, nối sang đồng hồ đêm → chèn cận sổ tiền → cận mặt chủ quán → lao vào điện thoại → ảnh giả trên nền đỏ mận, kính lúp, nhiễu, dấu GIẢ, xé đôi → mở tròn sang buổi sáng SIPOS → mở tròn teal CTA, hai người vẫy chào. 5 nền khác nhau (bối cảnh `quan` ngày → `nha` đêm → `bao-dong` → `sang` → `thuong-hieu`), 71 tiếng động trong `tieng-dong.txt`, lặng 13.55–14.09 trước dấu GIẢ, bảng khung chính 12 khung (`bang-canh.txt`).
- `briefs/2026-10-20-sipos-phu-nu-20-10/dung-rieng/index.html` — 15s: đêm, cuốn sổ, giấy nhớ vây, nét bút chém → điện thoại đổi ô "kho / thu chi / khách quen" → hồng 20/10, hoa nở, con dấu -20% → CTA.

## Không làm
- Không đổi chữ, thời lượng, nhạc đã duyệt (việc của `tao-reel`; đổi thì đưa MKT duyệt lại).
- Không sửa `templates/`, `brand/`, `config/`, `scripts/`.
