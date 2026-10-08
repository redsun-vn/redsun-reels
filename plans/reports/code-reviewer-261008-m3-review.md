# Code review M3 — redsun-reels (2026-10-08, Asia/Saigon)

Phạm vi: `git diff HEAD` + untracked (kit-core/motion/blocks/scene-kit.js, kit-styles/blocks.css, 3 template mới, style-preset/script schema, 19 preset, fact-check, validate wiring, occasions, info, render-test, tests, fixtures).
Kiểm: `./reel typecheck` sạch · `./reel lint:brand` 0 vi phạm · `./reel test` 40/40 pass. Không render.
Kiểm thực nghiệm fact-check bằng tsx (scratchpad) — kết quả ghi ở từng mục.

## Đã xác minh KHÔNG lỗi
- Không Math.random/Date.now; confetti/hạt dùng `hash01` theo chỉ số; một timeline paused.
- Last-scene fade (`scene-kit.js:200`) không đè tween vào cảnh cuối: cảnh tối thiểu 2.0s (`scene-timing.ts`), tween vào dài nhất 1.4d ≤ 1.12s < dur−0.4.
- Lớp dip/flash dùng chung: các fromTo không chồng thời gian (cảnh ≥ 2s, d ≤ 0.8).
- Flash ≤ 3/s: 1 flash/lần chuyển cảnh, cảnh ≥ 2s → ≤ 0.5/s; REC VHS 1 Hz, chấm nhỏ. Đạt.
- Brand lint: chỉ px cho layout, font-size đều qua `var(--type-*)`, màu qua biến + color-mix.
- Thời lượng MP4 e2e khớp tổng `durationSec` (ffprobe out/e2e-*.mp4) → clip quyết định duration, tween vượt total không kéo dài video (xem Low-3).

## HIGH

### H1. Fact-check đọc cả frontmatter → số bịa lọt qua
- `scripts/lib/validate-video.ts:172` truyền nguyên `brief.md` (gồm YAML) vào `factIssues`.
- Kịch bản: brief `duration: 15`, `music: test-pad-01`, `occasion: 20-10`, `goal: "...M3"` → tập số brief có 15, 01, 20, 10, 3… Badge `-15%`, deadline `Hết 01/01` **không báo lỗi** (đã chạy thử: 0 error).
- Sửa: dùng `readBriefFile(dir).body` cho fact-check (frontmatter chỉ là metadata, không phải nội dung MKT duyệt). Thêm test: brief có `duration: 30`, body không có 30, badge `-30%` → phải lỗi.

### H2. Khớp số theo "tập token rời" → trùng ngữ cảnh khác vẫn pass
- `fact-check.ts:15,32-34`: chỉ hỏi token có xuất hiện ở đâu đó trong brief.
- Kịch bản (đã chạy với fixture `chuc-mung-dip-le`): brief chỉ có "20/10" → badge `-20%` pass. Ngày lễ 30/4, 11/11, 20/11 sẽ hợp thức hoá `-30%`, `-11%`, `-20%`.
- Sửa tối thiểu: so token kèm đơn vị (`30%`, `99000đ`, `20/10` giữ nguyên dạng ngày) — tách `numberTokens` thành `{value, unit}` với unit ∈ {%, đ/k/tr, date}; % chỉ khớp % trong brief. Hoặc yêu cầu từng giá trị promo đã normalize nằm nguyên văn trong brief body (badge/price/deadline ngắn, MKT copy được).

### H3. Đếm ngược/hạn chót bị cắt dù validate pass
- `fact-check.ts:49` chỉ đòi `durationSec ≥ N + 1.5`, nhưng `kit-blocks.js:65-111` bắt đầu countdown ở `start + 0.6d + 0.4 (+0.35 badge) (+0.6 priceOld) (+0.35 priceNew)`, deadline sau đó thêm N giây.
- Kịch bản: badge+giá cũ+giá mới+`countdownFrom: 5`, cảnh 6.5s, d=0.7 → số "1" hiện ở start+6.12s, deadline ở start+7.12s > 6.5s → deadline không bao giờ hiện, số cuối chỉ 0.38s (dip-black che từ T+0.35). Decisions §11 ghi "đếm ngược dài hơn cảnh" là lỗi — kiểm tra hiện tại không đúng với code.
- Sửa: tính offset y như kit (hàm thuần dùng chung, vd `promoTimeline(promo, d)` trong config) và đòi `dur ≥ 0.6d + 0.4 + offsets + N + (deadline ? 1.5 : 0.5)`; hoặc trong kit cho countdown chạy song song với giá (không cộng dồn `t`).

### H4. Split với `srcAfter` là video: ảnh "sau" bị che hoàn toàn
- `kit-blocks.js:27-29` + `kit-core.js:141`: video là con trực tiếp của root, chèn TRƯỚC `scene`; ảnh "trước" (`kit-media-full`, full khung, đục) nằm trong scene → vẽ đè lên video "sau". `revealed` (dòng 37) chỉ clip video, nhưng video nằm dưới.
- Kịch bản: `src: before.png`, `srcAfter: after.mp4` (validate cho phép .mp4, `validate-video.ts:178,188`) → chỉ thấy vạch chia chạy, nửa phải vẫn là ảnh trước. render-test không bắt được (snapshot không vẽ video, decisions §11).
- Sửa: khi `after` là video thì ảnh "trước" cũng phải ở dưới video: hoặc đặt ảnh trước ra root trước video (clip riêng, track thấp hơn), hoặc tạm thời validate cấm video ở `srcAfter` khi `src` là ảnh (error rõ ràng) tới khi hỗ trợ.

### H5. Wipe BeforeAfter lộ nền khi preset có transition ngắn
- `scene-kit.js:156` tail cảnh = `style.transition.duration`; `scene-kit.js:195` + `kit-motion.js:39-43` wipe chạy 0.8s, không đụng outgoing.
- Kịch bản: style `hanh-dong` (0.25) / `du-lieu` (0.4) — cả hai là `suggestedStyles` của `truoc-sau` (`video-types.ts:68`): cảnh "trước" (và video của nó) hết clip ở T+0.25, wipe còn 0.55s → nửa chưa lộ hiện nền trống. `bi-an` 0.7 lộ 0.1s. Chỉ `dien-anh` (0.8) an toàn → render-test (khung đã đứng yên) không bắt được.
- Sửa: tail của cảnh outgoing của wipe = `max(T, 0.8)` (cả clip video của cảnh đó, `ctx.tail`), hoặc wipe dùng `d = max(T, 0.8)` đồng bộ với tail.

## MEDIUM

### M1. Promo: khối tràn khỏi vùng an toàn, không có fit/validate
- `kit-blocks.css:72-82` khối 720px→1500px (cao 780). Badge 300 + giá (~234) + countdown 420 + deadline ~96 + gap 40×3 ≈ 1170px; chỉ badge+giá+countdown đã ≈1034px. Flex center tràn ~195px lên (đè khối chữ top 340–670) và ~195px xuống vùng UI nền tảng.
- `kit-price-new` font hero 120px, `priceNew` max 20 ký tự (`script.schema.ts:32`) → >1000px > 920px chiều rộng an toàn. Badge 12 ký tự ở 72px trong vòng 300px (vd "FREESHIP") tràn ngang.
- Sửa: validate tổ hợp (cấm badge + countdown cùng cảnh, hoặc countdown thay chỗ giá); giảm max length (badge ≤ 6, price ≤ 12) hoặc dùng `fitSizes` cho price/badge; countdown 420→ ~300 khi có trường khác.

### M2. Fact-check không kiểm chữ trong promo không có số
- `fact-check.ts:44-48` chỉ xét số. Badge "FREESHIP", "Tặng kèm máy in", deadline "Chỉ hôm nay" bịa vẫn pass — REQUIREMENTS §6.2 cấm bịa "ưu đãi".
- Sửa: ít nhất warning khi `normalizeText(value)` không nằm trong brief body; error cho badge/deadline nếu không có số và không khớp.

### M3. Attribution so substring, không biên từ, không chuẩn hoá chính tả dấu
- `fact-check.ts:57`: `briefNorm.includes(...)`. "Chị An" khớp "chị anh"; ngược lại "Tạp hoá Lan" ≠ "Tạp hóa Lan" (đã chạy: `false`) — NFC không gộp kiểu bỏ dấu cũ/mới (oá/óa, uỷ/ủy) → báo lỗi oan.
- Sửa: bọc 2 vế bằng khoảng trắng (`' ' + norm + ' '`) để khớp theo từ; chuẩn hoá tone-placement (map `oá→óa, oà→òa, oả→ỏa, oã→õa, oạ→ọa, uỷ→ủy…`) trong `normalizeText`.

### M4. Video màn hình trong phone bị 2 tween cùng thuộc tính
- `scene-kit.js:79-82` đưa screen video vào `parts` (fromTo y/opacity tại `start+0.6d`), đồng thời video nằm trong `videos[i]` → `kit-motion.js:89-97` fromTo opacity (T+0.3d…T+1.3d) hoặc y (vertical-push, T…T+d).
- Hậu quả: trong khoảng chồng, tween bắt đầu sau thắng khi seek tiến → opacity nhảy ~0.3→0 tại T+0.6d (nháy 1 khung); khi seek lùi thứ tự render đảo → kết quả phụ thuộc hướng seek (rủi ro xác định khi worker seek không đơn điệu). Ảnh hưởng FL/phone với mọi preset không phải push ngang (gồm 8 preset M3).
- Sửa: không đưa screen video của phone vào `videos[i]` (để nó đi theo tween của phone) — hoặc ngược lại, bỏ khỏi `parts`; không để 2 tween cùng element+property chồng thời gian.

### M5. Video không đồng bộ với cảnh ở whip / glitch-cut / dip-black
- `kit-motion.js:91-93`: whip gộp với elastic (video vào lúc T+0.1d, 1.1W→… thực tế từ W, không blur), còn cảnh vào lúc T+0.4d từ 1.1W, power4 → video full-khung chạy trước cảnh ~0.3d; video trong phone lệch khỏi khung phone.
- `kit-motion.js:94-97` glitch-cut/dip-black: cảnh bật ngay (glitch) hoặc ở T+d/2 (dip) nhưng video mờ dần T+0.3d…T+1.3d → chữ hiện trên video bán trong suốt.
- Sửa: thêm nhánh riêng cho whip (cùng tham số x/blur/thời điểm với scene), glitch-cut (cùng x steps), dip-black (cut opacity tại T+d/2 dưới lớp đen).

### M6. Promo/attribution bị bỏ im lặng ở một số visual
- `scene-kit.js:167,182`: cảnh `split` hoặc `phone` có `attribution` → không có quote/lower third; cảnh `split` có `promo` trong Promo → khối promo mất. `fact-check.ts:52` chỉ chặn `phone`+promo.
- Sửa: validate lỗi cho `promo` với visual ∉ {text, asset} và `attribution` với visual ∉ {text, asset}.

### M7. Test chỉ có ca âm, thiếu ca dương và hồi quy cho lỗi trên
- `tests/validate.test.ts` (chống bịa) chỉ kiểm brief KHÔNG chứa số → lỗi. Không có: brief chứa giá → pass; frontmatter không tính; % vs ngày; countdown + offset; split thiếu/đủ.
- render-test chỉ chụp khung "đã đứng yên" (`render-test.ts:56`) → không phủ chuyển cảnh mới (wipe, flash, glitch, dip). Đề nghị thêm 1 khung giữa lần chuyển cảnh đầu (T + d/2) cho mỗi tổ hợp.

## LOW

1. `validate-video.ts:168`: kiểm NFC bỏ sót `attribution`, `promo.*` → chữ dấu tách vẫn render (fact-check tự NFC nên vẫn pass). Thêm vào `texts`.
2. `fact-check.ts:15`: "08/03" vs "8/3", "1 200 000đ" (cách nghìn bằng dấu cách/NBSP), "99k" vs "99.000đ" → báo lỗi/cảnh báo oan. Bỏ số 0 đầu, gộp nhóm nghìn bằng `[\s ]`, quy đổi k/tr.
3. `kit-motion.js:139,146` `repeat: ceil(total/2.4)` / `ceil(total*2)` → N+1 vòng, timeline dài hơn `total`; confetti `kit-motion.js:175` rơi tới ctaStart+3.6s > total khi CTA ngắn. Hiện vô hại (duration theo clip, đã ffprobe), nhưng nên clamp `repeat = ceil(total/2.4) - 1` và `fall ≤ total - start - delay` để `tl.duration()` == total.
4. `kit-motion.js:106,122-123`: aurora và overlay "under" (paper/grid) cùng track 10 suốt [0,total], và overlay chèn sau bg nên nằm DƯỚI aurora. Chưa preset nào kết hợp; nên đổi track/ thứ tự khi thêm preset.
5. `kit-core.js:114` `track` tween `letterSpacing` → reflow cả dòng mỗi khung (xác định nhưng nặng, chữ bên cạnh xô). Cân nhắc scaleX/opacity.
6. Fixture `dem-nguoc/script.json`: `deadline` trùng nguyên văn `onScreenText` ("Ra mắt 20/10") → hiện 2 lần cùng câu trên màn hình.
7. REQUIREMENTS §7.1 Testimonial "giữ âm thanh gốc" + `keepClipAudio: true` của `khach-hang-noi` chưa làm (decisions §11 ghi hoãn M4) — kit tắt tiếng video; nên để `info`/skill báo rõ cho MKT.

## Hành động đề xuất (thứ tự)
1. H1 (1 dòng) + H2 + test dương/âm.
2. H3 dùng chung công thức thời gian promo giữa validate và kit.
3. H5 tail wipe; H4 z-order split video (hoặc chặn ở validate).
4. M1 giới hạn layout Promo; M4/M5 đồng bộ video; M6 validate.
5. Thêm khung giữa chuyển cảnh vào render-test.

## Câu hỏi chưa giải quyết
- HyperFrames 0.8.141 có seek không đơn điệu (worker song song nhảy lùi) không? Quyết định mức độ của M4.
- Có muốn fact-check bắt buộc promo khớp nguyên văn brief (chặt) hay chỉ số + đơn vị (lỏng hơn)?
- Split video "sau" có nằm trong phạm vi M3 không, hay chặn ở validate tới M4?
