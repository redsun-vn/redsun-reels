# Code review M4 (EventRecap, Stats, TalkingHead) — 2026-10-09

Phạm vi: diff chưa commit vs HEAD 50a0561 + file mới. `pnpm typecheck` pass, `pnpm test` 51/51 pass. Không chạy render.

## Critical

### C1. Lớp tối của clip bị tween opacity lên 1 → che kín video (regression 5 template cũ)
- `templates/_shared/scene-kit.js:241-243` (assetScene): `dim` (CSS `.kit-dim { opacity: 0.55 }`, `kit.css:139`; `.soft` 0.92) được `videos[i].push(dim)`.
- `templates/_shared/kit-motion.js` transitionVideos: nhánh mặc định (`blur-crossfade`, `zoom-through`) và `dip-black`/`flash-white` chạy `fromTo(inV, {opacity:0}, {opacity:1})` → dim thành opacity 1 = nền đặc `--color-background`, video bị che hết cả đoạn.
- Ảnh hưởng: mọi cảnh clip full-frame (asset .mp4) không phải cảnh đầu, ở 10/19 phong cách (bi-an, dien-anh, khuyen-mai, lang-man, le-hoi, sang-trong, thu-gian, tin-cay, tin-tuc, tuong-lai). Fixture dính ngay: `khach-hang-noi` (tin-cay, cảnh 2), `thu-gian-asmr` (thu-gian, cảnh 1). TalkingHead: soft 0.92→1 (nhẹ hơn nhưng vẫn sai), nặng khi clip đứng sau cảnh text.
- M3 không bị vì dim nằm trong `.kit-scene`. `test:render` không vẽ video nên khó bắt; e2e MP4 sẽ ra màn đặc màu.
- Sửa: không tween opacity trực tiếp trên dim. Ví dụ dim giữ `opacity:1`, độ mờ đưa vào màu (`background: color-mix(in srgb, var(--color-background) 55%, transparent)`; `.soft` dùng gradient có alpha), hoặc bọc video+dim trong một lớp rồi tween lớp đó. Thêm test DOM/snapshot cho cảnh clip ở index > 0 với style blur-crossfade.

## High

### H1. `parseStat` crash cả composition với giá trị hợp lệ theo schema
- `templates/_shared/kit-blocks.js:476-477`: `d = /^(\d+)(?:([.,])(\d+))?$/.exec(num)` trả null → `d[1]` TypeError.
- Đã chạy thử: `"1.234,5"`, `"1,234.5"`, `"2.5.1"` → THROW. Schema (`config/script.schema.ts` StatSchema: ≤12 ký tự, có chữ số) và fact-check đều cho qua → validate xanh, build/lint/render vỡ với lỗi khó hiểu cho MKT ("1.234,5 tỷ" là cách viết VN hợp lý).
- Sửa: kiểm ở TS (stats-timing.ts) cùng quy tắc với JS: phần số phải khớp `^\d{1,3}([.,]\d{3})+$` hoặc `^\d+([.,]\d+)?$`, sai → error validate; JS fallback `textContent = value` khi d null. Thêm test parity TS↔JS (đang chỉ test splitStatValue).
- Phụ: `"0.500"` hiển thị "500", `"007"` → "7" (lệch cách viết brief). Thấp.

### H2. Đổi chế độ tiếng (mute) giữa các cảnh cùng clip → clip tua về 0
- `scripts/lib/build-props.ts:132-137`: điều kiện nối có `head.shot.audio === audio`; không thỏa → shot mới với `mediaStart = v.clipStart ?? 0`.
- Thử: [a: clip, b: clip mute, c: clip] → a 0–4s, b mediaStart 0 (lặp lại 3s đầu), c mediaStart 0 (lặp lại lần nữa). Trái với schema doc "cảnh liền trước cùng clip thì nối tiếp". Người nói lặp câu, validate không báo.
- Sửa: khi prev cùng src và không có clipStart nhưng khác audio → mediaStart = head.mediaStart + head.shot.duration (tiếp tục), chỉ tách shot. Test hiện tại (`tests/m4-media-and-stats.test.ts:36`) không assert mediaStart của cảnh mute nên không bắt.

## Medium

### M1. Nhạc vẫn bị hạ khi clip không có luồng tiếng
- `clip-check.ts:51` chỉ warning; `assignShots` vẫn tạo `voiceWindows` → nhạc 0.18 suốt đoạn clip câm → gần như im lặng. Testimonial nay `keepClipAudio` mặc định giữ tiếng (decisions §12), nên brief Testimonial cũ có quay màn hình câm sẽ bị (fixture phải thêm `mute:true` — đúng triệu chứng). Sửa: build loại window của clip không có audio stream (ffprobe đã có), hoặc nâng thành error kèm gợi ý `mute: true`.

### M2. Fact-check Stats chỉ kiểm `value`, không kiểm cặp value–label
- `fact-check.ts:217-221`: value chỉ cần xuất hiện ở đâu đó trong brief; label chỉ warn khi có số. Brief "1.200 cửa hàng, 98% hài lòng" → `{value:"98%", label:"cửa hàng tăng doanh thu"}` qua sạch. Đây là đường bịa số liệu chính. Đề xuất: warn khi label (normalize) không có cụm trong brief, hoặc yêu cầu value và từ khóa label cùng câu/dòng trong brief.

### M3. TalkingHead bỏ hẳn kiểm onScreenText
- `fact-check.ts:205`: TalkingHead không còn warning nào cho chữ gắn dưới tên người thật (`attribution`). Chữ "ý chính" có thể bịa lời người nói. Đề xuất giữ warning (đổi lời: "ý chính phải đúng lời trong clip, nhờ MKT xác nhận").

### M4. Đổi hành vi template cũ khi 2 cảnh liền nhau cùng clip
- `assignShots` áp cho mọi template: FeatureLaunch/TipOfTheDay/Promo có 2 cảnh liền cùng screen-record trước đây mỗi cảnh chạy lại từ 0 với chuyển cảnh của phong cách; nay chạy tiếp + `text-swap`. Fixture hiện tại không có ca này (đã quét), nhưng brief user có thể có. Hợp lý về sản phẩm, cần ghi rõ trong decisions là áp cho mọi template.

### M5. Accent-underline đổi màu cho 9 phong cách cũ
- `kit.css:124-127`: thay đổi giao diện template cũ, cần `test:render --update` có xem ảnh; đã ghi decisions §12. Chỉ nhắc: phạm vi ngoài M4.

## Low
- L1. `clip-check.ts:46`: `need` không cộng `ctx.tail` (0.15–0.9s) mà video thật kéo dài thêm qua chuyển cảnh → clip vừa khít sẽ hết hình trong lúc chuyển. Montage: đoạn cuối cũng cần `each + tail`; montage clip đọc lỗi (`c` undefined) bị bỏ qua im lặng.
- L2. Cảnh CTA có `visual.asset` video: `ctaScene` return sớm (`scene-kit.js:181`) nhưng `assignShots` vẫn tính shot/voiceWindow → nhạc bị hạ ở CTA mà không có tiếng; nếu CTA nối tiếp clip trước thì tiếng người nói chạy qua CTA (trái doc "CTA không có clip nên nhạc lên lại"). Nên bỏ qua role `cta` trong assignShots.
- L3. `stats-timing.ts` STATS_ENTER_SEC 0.7 giả định T≈0.5; preset max T=0.8 → đếm bắt đầu 0.88s, hold còn 0.82s < 1s. Dùng T max (0.8) hoặc truyền T vào validate.
- L4. `fact-check.ts:217` value có `%` sát số: brief viết "98 %" → báo lỗi giả (an toàn, chỉ phiền).

## Đã kiểm, không thấy lỗi
- Không Math.random/Date.now/new Date trong templates; `mediaSeq` đếm tuần tự, xác định.
- Chia sẻ `videos[i] = videos[i-1]` + bỏ `transitionVideos` cho cảnh `continues` đúng; chuyển cảnh ra khỏi đoạn dùng mảng chung, fade cuối gồm video+dim.
- `shotEnd`/`dur` khớp `shot.duration`; tail lấy theo cảnh cuối đoạn (kể cả wipe).
- Montage: z-order (video dưới scene, ảnh ẩn ngoài đoạn), video đầu/cuối vào danh sách chuyển cảnh hợp lý.
- `duckingPoints`: đơn điệu do MERGE_GAP 0.8 > 2×ramp; clamp totalSec; regex `<audio id="music"` khớp cả 8 template, `data-volume="1"` nên lane tuyệt đối = tương đối.
- splitStatValue ↔ parseStat cùng regex tách prefix/suffix (parity cho kiểm đơn vị chart).

## Câu hỏi
1. Testimonial giữ tiếng mặc định: Nam đã duyệt chưa (ảnh hưởng brief cũ có quay màn hình)?
2. Bar chart với % đang chuẩn hoá theo max chứ không theo 100% — chủ ý?
