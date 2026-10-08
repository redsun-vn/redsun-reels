# Danh mục phong cách video (video style catalog)

Cập nhật: 2026-10-08 (Asia/Saigon). Trạng thái: đề xuất, chờ Nam duyệt (mục 6 liệt kê điểm cần chốt).

> Cập nhật 2026-10-08: Nam bỏ lồng tiếng. Mọi phong cách dùng nhạc nền + chữ; các ghi chú về voiceover carve không còn áp dụng.

> Cập nhật 2026-10-08 (Nam): duyệt cả 19 phong cách, kể cả `bi-an`, `glitch-cyberpunk`, `thu-cong`; áp guardrail ở mục 5. Logo dùng thẳng file có sẵn; gradient chỉ nằm trong file logo, không dùng cho nền hay chữ.

## 1. Phong cách là gì, áp dụng thế nào

Phong cách (`style`) là **preset áp lên template có sẵn**, không phải template mới (REQUIREMENTS §1.4, template-first). Đề xuất: thêm biến enum `style` vào `props.json`. Spike S4 đã chứng minh biến native chạy được (`data-composition-variables`, `data-var-text`, CSS vars), nên `style` đổi các thứ sau:

| Đổi theo style | Giữ cố định (không đổi theo style) |
|---|---|
| Tốc độ, easing, mức năng lượng chuyển động | Màu trong `brand.css` (§5.2), chỉ đổi **độ đậm màu nhấn** |
| Kiểu chuyển cảnh chính + 1-2 phụ | Font Montserrat (decisions §5), tối đa 2 font |
| Cách xử lý chữ (reveal, caption) | Logo, vị trí logo bug |
| Lớp phủ (grain, vignette, light leak, glitch…) | Safe zone (§5.4), 1080x1920, 30fps |
| Tâm trạng nhạc nền (mood tag) | Cấu trúc Hook → Body → CTA (§7) |

Nguyên tắc chọn: 1 video = 1 style chính (+ tối đa 1 lớp phủ phụ). Không trộn 3 style trong một video.

Nguồn đã đọc (không chép lại, chỉ trỏ): `hyperframes-creative/references/visual-styles.md` (bảng Mood → Style), `hyperframes-creative/references/motion-principles.md` (tốc độ/easing), `hyperframes-animation/transitions/overview.md` (bảng Energy → Transition, Mood → Transition), `media-use/audio/references/bgm.md` (mood query + BPM cho nhạc nền), `hyperframes-audio/SKILL.md` (voiceover carve), `hyperframes-creative/palettes/*` (chỉ để tham khảo mood, không dùng màu). Item registry lấy từ `spike/catalog.json` (392 mục), đã đối chiếu tên.

Viết tắt template: **FL** FeatureLaunch, **TIP** TipOfTheDay, **BA** BeforeAfter, **TES** Testimonial, **PRO** Promo. Sản phẩm: **SIPOS** (POS F&B/retail), **BOS** (Redsun BOS), **WEB** (Webino).

Quy ước nhanh về tốc độ (theo motion-principles): nhanh 0.15-0.3s, vừa 0.3-0.5s, chậm 0.5-0.8s, rất chậm 0.8-2s. Chuyển cảnh theo năng lượng (transitions/overview): calm 0.5-0.8s `sine.inOut`; medium 0.3-0.5s `power2/3`; high 0.15-0.3s `power4/expo`. Exit animation bị cấm trừ cảnh cuối (transitions/overview).

## 2. Bảng tổng quan 19 phong cách

| id | Phong cách | Mood | Năng lượng | Template hợp | Sản phẩm hợp | Rủi ro brand |
|---|---|---|---|---|---|---|
| `toi-gian` | Tối giản | sạch, chính xác | vừa | FL, TIP, BA | BOS, SIPOS, WEB | thấp (style mặc định) |
| `sang-trong` | Sang trọng | cao cấp, điềm tĩnh | thấp | FL, TES | BOS, WEB | thấp |
| `lang-man` | Lãng mạn | ấm, mềm, thân mật | thấp | PRO, TES, TIP | SIPOS (F&B) | thấp |
| `hanh-dong` | Hành động | dồn dập, mạnh | cao | PRO, FL | SIPOS, WEB | trung bình (rung, flash) |
| `bi-an` | Bí ẩn / kinh dị nhẹ | tối, hồi hộp, tò mò | thấp-vừa | FL, TIP (hook "bạn có biết?") | BOS, WEB | cao, xem mục 4 |
| `tuong-lai` | Tương lai | rộng lớn, AI, đột phá | vừa | FL | WEB, BOS | trung bình (gradient) |
| `robot-cong-nghe` | Robot / công nghệ | máy móc, chính xác, "code" | vừa | FL, TIP | WEB, BOS | trung bình |
| `glitch-cyberpunk` | Glitch / cyberpunk | căng, gen Z, neon | cao | PRO, FL | WEB | cao, xem mục 4 |
| `vui-nhon` | Vui nhộn / hài | tinh nghịch, nảy | cao | TIP, PRO | SIPOS | thấp |
| `le-hoi` | Lễ hội / Tết | rộn ràng, ấm, ăn mừng | vừa-cao | PRO, TES | SIPOS, mọi SP | trung bình (màu lễ hội) |
| `nang-dong` | Năng động / thể thao | nhanh, cạnh tranh, số liệu | cao | PRO, FL | SIPOS | thấp |
| `dien-anh` | Kể chuyện / điện ảnh | trầm, có chiều sâu | thấp-vừa | BA, TES, FL | mọi SP | thấp |
| `tin-tuc` | Tin tức / breaking | khẩn, đáng tin | vừa-cao | PRO, FL | mọi SP | thấp |
| `thu-gian` | ASMR / thư giãn | chậm, mượt, yên | rất thấp | TIP, TES | SIPOS (F&B), WEB | thấp |
| `du-lieu` | Dữ liệu / infographic | phân tích, số liệu | vừa | BA, FL, TIP | BOS, SIPOS | thấp |
| `thu-cong` | Thủ công / hand-drawn | gần gũi, như phác thảo | vừa | TIP, BA | SIPOS, WEB | cao (font thứ 3), xem mục 4 |
| `retro` | Retro / hoài cổ | ấm, băng cũ, kỷ niệm | vừa | TES, PRO | SIPOS (F&B) | trung bình |
| `khuyen-mai` | Khuyến mãi / flash sale | gấp, giá, đếm ngược | cao | PRO | SIPOS | thấp |
| `tin-cay` | Tin cậy / social proof | ấm, thật, uy tín | vừa-thấp | TES, BA | mọi SP | thấp |

## 3. Chi tiết từng phong cách

Mỗi mục: **Chuyển động** (tốc độ/easing), **Chuyển cảnh**, **Chữ**, **Lớp phủ**, **Nhạc** (mood tag cho bgm; bản không lời dùng được khi chưa có voice TTS), **Registry** (tên đã đối chiếu `catalog.json`). Item đánh dấu (b)=block, (c)=component.

### 3.1 `toi-gian` (mặc định)
- Chuyển động: vừa 0.3-0.5s, `power2/3.out`, stagger đều, ít ambient motion. Tham chiếu mood "Swiss Pulse" (visual-styles).
- Chuyển cảnh: push slide hoặc `fade-through`; shader `cinematic-zoom` làm điểm nhấn.
- Chữ: `per-word-rise`, `staggered-fade-up`; khoảng trắng lớn, 1 ý/cảnh.
- Lớp phủ: không; nền phẳng.
- Nhạc: "uplifting corporate tech, bright modern piano with synth pads", 108 BPM (mặc định SaaS trong bgm.md).
- Registry: `titlecard-calm`(c), `mk-specs-list`(b), `mk-progress-stat`(b), `mk-background`(b), `staggered-fade-up`(c).

### 3.2 `sang-trong`
- Chuyển động: chậm 0.5-0.8s, `sine.inOut`/`power1`; ít phần tử, nhiều khoảng thở. Mood "Velvet Standard".
- Chuyển cảnh: blur crossfade, focus pull, dip to black; shader `cross-warp-morph`.
- Chữ: `tracking-in`, `focus-blur-resolve`, `caption-weight-shift`.
- Lớp phủ: `vignette` nhẹ, `gloss-sweep` một lần.
- Nhạc: "calm cinematic, soft strings, subtle piano, restrained percussion", 92 BPM.
- Registry: `focus-blur-resolve`(c), `tracking-in`(c), `cross-warp-morph`(b), `logo-outro`(b), `vignette`(c).

### 3.3 `lang-man`
- Chuyển động: chậm, `sine.inOut`, nảy rất nhẹ, ambient trôi chậm.
- Chuyển cảnh: light leak, blur crossfade; shader `thermal-distortion`, `light-leak`.
- Chữ: `soft-blur-in`, `per-word-crossfade`, `caption-weight-shift`.
- Lớp phủ: `organic-light-leak-overlay`, `grain-overlay` mỏng; nền mesh mềm bằng màu thương hiệu (không dùng hồng/tím mặc định của block).
- Nhạc: "romantic acoustic, warm piano and soft guitar, gentle", 70-85 BPM.
- Registry: `organic-light-leak-overlay`(c), `light-leak`(b), `thermal-distortion`(b), `mesh-gradient-bg`(c), `soft-blur-in`(c).
- Lưu ý: không có block "trái tim/hoa"; hiệu ứng chỉ là ánh sáng và màu. Hình trái tim phải là asset MKT cung cấp.

### 3.4 `hanh-dong`
- Chuyển động: nhanh 0.15-0.3s, `power4`/`expo.out`, cắt theo nhịp, speed ramp + freeze-frame.
- Chuyển cảnh: hard cut theo beat, whip pan, zoom through; shader `whip-pan`, `ridged-burn`.
- Chữ: `headline-slam`, `caption-kinetic-slam` (1 từ/khung), `shutter-slam`.
- Lớp phủ: `camera-shake` (nhẹ, bật theo beat), `beat-accent`, `editorial-flash-overlay`.
- Nhạc: "driving electronic, powerful percussion, trailer hits", 128-140 BPM; cắt theo nhịp.
- Registry: `beat-freeze-cut`(b), `headline-slam`(c), `beat-accent`(c), `whip-pan`(b), `camera-shake`(c).

### 3.5 `bi-an` (kinh dị nhẹ, "bí ẩn")
- Chuyển động: chậm rồi giật (`power3.in` dồn rồi bật), tương phản tối/sáng, hook gợi tò mò.
- Chuyển cảnh: dip to black, domain warp; shader `domain-warp-dissolve`.
- Chữ: `scan-band` lộ wordmark, `ink-bleed-reveal`, `rgb-glitch-text` (ngắn, 1 lần).
- Lớp phủ: `vignette` đậm, `grain-field`/`grain-overlay`; focus kéo bằng `rack-focus`.
- Nhạc: "dark ambient tension, low drone, sparse piano, suspense" (không rùng rợn gắt).
- Registry: `domain-warp-dissolve`(b), `rack-focus`(b), `vignette`(c), `grain-field`(c), `ink-bleed-reveal`(c).
- Dùng cho Halloween, hook "nỗi sợ sổ sách / sai sót cuối ngày". Giới hạn ở mục 4.

### 3.6 `tuong-lai`
- Chuyển động: vừa-chậm, camera trôi, chiều sâu 3D; mood "Data Drift".
- Chuyển cảnh: shader `gravitational-lens`, `domain-warp-dissolve`; zoom through.
- Chữ: `blur-in`, `particle-text-dissolve`, `variable-font-flex`.
- Lớp phủ: `aurora-drift`, `dynamic-grid`; nền không gian bằng `cosmic-orb`/`spiral-galaxy`.
- Nhạc: "atmospheric electronic, deep bass, futuristic synths, restrained percussion", 100 BPM.
- Registry: `cosmic-orb`(b), `spiral-galaxy`(b), `gravitational-lens`(b), `aurora-drift`(c), `liquid-glass-widgets`(b).

### 3.7 `robot-cong-nghe`
- Chuyển động: vừa, cơ học, bước rời rạc (step), easing tuyến tính/`steps`; "máy đang làm việc".
- Chuyển cảnh: grid dissolve, staggered blocks; `grid-pixelate-wipe`.
- Chữ: `scramble-reveal`, `matrix-decode`, `caption-matrix-decode`, `typewriter`.
- Lớp phủ: `telemetry-hud` (viền góc, readout mono), `ordered-dither-pass`, `ascii-render-pass`.
- Nhạc: "minimal techno, arpeggiated synth, mechanical clicks", 110-120 BPM. SFX có sẵn: typing, click, glitch (media-use/audio/assets/sfx).
- Registry: `telemetry-hud`(c), `scramble-reveal`(c), `segmentation-flood`(c), `ascii-render-pass`(c), `terminal-simulator`(c).
- Không có block "robot" dạng nhân vật. `lottie-character-walk` là nhân vật phẳng, cần asset riêng nếu muốn mascot robot.

### 3.8 `glitch-cyberpunk`
- Chuyển động: nhanh, giật, nhiễu RGB ngắn; mood "Deconstructed".
- Chuyển cảnh: shader `glitch`, `chromatic-radial-split`; `chromatic-aberration-wipe`.
- Chữ: `caption-glitch-rgb`, `rgb-glitch-text`, `caption-neon-glow` (phải đổi màu neon sang màu thương hiệu).
- Lớp phủ: `yt-screen-warp` (scanline, vignette).
- Nhạc: "dark synthwave, distorted bass, tense", 120-130 BPM. SFX: glitch-1/2/3.
- Registry: `glitch`(b), `chromatic-radial-split`(b), `caption-glitch-rgb`(c), `rgb-glitch-text`(c), `yt-screen-warp`(c).

### 3.9 `vui-nhon`
- Chuyển động: nhanh-vừa, `elastic.out`/`back.out` (overshoot), nảy.
- Chuyển cảnh: elastic push, circle iris, 3D flip; shader `ripple-waves`, `swirl-vortex`; `iris-reveal`.
- Chữ: `caption-emoji-pop`, `spring-pop`, `badge-pop`.
- Lớp phủ: `confetti` ở khoảnh khắc "xong".
- Nhạc: "playful ukulele, bouncy pizzicato, whistling, upbeat", 115-125 BPM. SFX: pop, sparkle.
- Registry: `spring-pop`(c), `badge-pop`(c), `confetti`(c), `caption-emoji-pop`(c), `ripple-waves`(b).

### 3.10 `le-hoi` (Tết, Trung thu, Giáng sinh, khai trương)
- Chuyển động: vừa-nhanh, nảy, đối xứng, ăn mừng ở cuối cảnh Body và CTA.
- Chuyển cảnh: light leak ấm, circle iris; shader `light-leak`, `flash-through-white`.
- Chữ: `caption-particle-burst` cho từ khóa, `number-pop-in` cho con số ưu đãi.
- Lớp phủ: `confetti`, `vfx-anamorphic-flare` (chấm sáng), `organic-light-leak-overlay`.
- Nhạc: tuỳ dịp, ví dụ Tết "festive upbeat, traditional percussion, bells"; Giáng sinh "warm holiday, sleigh bells, soft piano". Cần track có license (§16 Q3).
- Registry: `confetti`(c), `caption-particle-burst`(c), `light-leak`(b), `vfx-anamorphic-flare`(b), `number-pop-in`(c).
- **Không có item theo chủ đề lễ** (không pháo hoa, hoa mai, đèn lồng, cây thông). Chỉ có chuyển động chung; họa tiết lễ cần asset do MKT/design cấp.

### 3.11 `nang-dong`
- Chuyển động: nhanh, `power4.out`, đếm số, bảng xếp hạng; cảm giác "thi đấu".
- Chuyển cảnh: whip pan, zoom through; shader `whip-pan`; `cut-the-curve`.
- Chữ: `caption-kinetic-slam`, `headline-slam`, `number-wheel`.
- Lớp phủ: `camera-shake` nhẹ.
- Nhạc: "energetic sports anthem, big drums, stadium", 128-140 BPM.
- Registry: `bar-chart-race`(b), `count-up`(c), `number-wheel`(c), `whip-pan`(b), `headline-slam`(c).

### 3.12 `dien-anh`
- Chuyển động: chậm-vừa, camera dolly/push-in, chiều sâu trường ảnh; mood "Shadow Cut" bản nhẹ.
- Chuyển cảnh: zoom through, dip to black; shader `cinematic-zoom`, `light-leak`.
- Chữ: `titlecard-lockup`, `per-word-crossfade`, letterbox tuỳ chọn.
- Lớp phủ: `vignette`, `grain-overlay`.
- Nhạc: "cinematic underscore, emotional strings, slow build", 80-95 BPM (fallback "calm cinematic underscore" trong bgm.md).
- Registry: `camera-dolly-zoom`(b), `rack-focus`(b), `push-in`(c), `pull-back-reveal`(c), `cinematic-zoom`(b).

### 3.13 `tin-tuc`
- Chuyển động: vừa-nhanh, trượt ngang, thanh tin chạy; giọng "bản tin".
- Chuyển cảnh: flash trắng ngắn, cut theo vận tốc; shader `flash-through-white`; `cut-the-curve`.
- Chữ: lower third kiểu truyền hình, `split-flap-board` cho con số/giờ.
- Lớp phủ: `editorial-flash-overlay`.
- Nhạc: "news broadcast, urgent pulse, short stings", 110-120 BPM.
- Registry: `news-ticker`(b), `lower-third-bild`(b), `lt-stack-bars`(b), `split-flap-board`(b), `editorial-flash-overlay`(b).

### 3.14 `thu-gian` (ASMR)
- Chuyển động: rất chậm 0.8-2s, `sine.inOut`, ambient trôi; dừng yên sau chuyển động.
- Chuyển cảnh: slow dissolve, `fade-through`.
- Chữ: `soft-blur-in`, `per-word-crossfade`, ít chữ.
- Lớp phủ: `aurora-drift`, `grain-overlay` rất nhẹ; nền `marble` hoặc `soft-blob-touch`.
- Nhạc: "soft ambient pads, gentle piano, slow, spacious", 60-75 BPM; SFX click-soft, pop (âm thanh sản phẩm làm nội dung).
- Registry: `aurora-drift`(c), `soft-blob-touch`(c), `drift-hold`(c), `fade-through`(c), `marble`(b).

### 3.15 `du-lieu`
- Chuyển động: vừa, số đếm lên, vẽ đường theo thứ tự đọc; mood "Swiss Pulse"/"Data Drift".
- Chuyển cảnh: push, grid dissolve; `before-after-wipe` cho so sánh.
- Chữ: `count-up`, `number-pop-in`.
- Lớp phủ: không; lưới nền mờ.
- Nhạc: "minimal tech, light pulse, curious", 100-108 BPM.
- Registry: `data-chart`(b), `chart-story`(c), `mk-line-graph`(b), `conic-progress-ring`(c), `comparison-split`(c).
- Dữ liệu dùng phải có nguồn thật (không bịa số liệu, xem brand-safety `docs/decisions.md`/§5).

### 3.16 `thu-cong`
- Chuyển động: vừa, nét vẽ tay "sôi" (boil) re-pose mỗi N khung, vẽ dần.
- Chuyển cảnh: `hw-scribble-transition`.
- Chữ: `hw-title`, `hw-write-title`, `marker-highlight`, `hw-underline`, `hw-callout-circle`. **Dùng font chữ viết tay (Caveat)**, vi phạm giới hạn 2 font nếu không chốt, xem mục 4.
- Lớp phủ: `hw-boil`.
- Nhạc: "quirky acoustic, light percussion, handclaps", 100-110 BPM.
- Registry: `hw-title`(b), `hw-write-title`(b), `hw-callout-circle`(c), `hw-underline`(c), `whiteboard-ink`(c).

### 3.17 `retro`
- Chuyển động: vừa, hơi giật như băng, ấm.
- Chuyển cảnh: film burn, VHS, clock wipe; shader `light-leak`.
- Chữ: monospace/pixel không dùng được (font cố định); dùng Montserrat đậm + `camcorder-hud` (REC, ngày).
- Lớp phủ: `grain-overlay`, `organic-light-leak-overlay`, `yt-screen-warp`.
- Nhạc: "lo-fi retro, warm vinyl, soft synth, nostalgic", 85-100 BPM.
- Registry: `camcorder-hud`(b), `grain-overlay`(c), `organic-light-leak-overlay`(c), `oscilloscope-trace`(b), `halftone-field`(b).

### 3.18 `khuyen-mai`
- Chuyển động: nhanh, `back.out`/`expo.out`, nhấn con số và hạn chót; mỗi cảnh một con số.
- Chuyển cảnh: staggered blocks, slide; `directional-wipe`.
- Chữ: `strikethrough-replace` (giá cũ → giá mới), `slot-machine-roll`, `ticker-takeover`.
- Lớp phủ: `confetti` ở cảnh chốt; `badge-pop` cho badge.
- Nhạc: "upbeat pop, claps, countdown energy", 120-128 BPM.
- Registry: `strikethrough-replace`(c), `slot-machine-roll`(c), `badge-pop`(c), `ticker-takeover`(c), `cta-lockup`(c).
- Khớp trực tiếp với Promo (§7: countdown, giá gạch ngang, badge).

### 3.19 `tin-cay`
- Chuyển động: vừa-chậm, `power2.out`, lời trích đọc theo nhịp đọc.
- Chuyển cảnh: crossfade, blur crossfade; `fade-through`.
- Chữ: quote lớn, `testimonial-card`; lower third mềm `lt-soft-pill`/`lt-clean-bar`.
- Lớp phủ: không hoặc `grain-overlay` rất nhẹ.
- Nhạc: "warm acoustic, uplifting, sincere", 90-100 BPM.
- Registry: `testimonial-card`(c), `testimonial-proof-card`(c), `social-proof-card`(c), `star-rating-fill`(c), `logo-wall`(c).

## 4. Lịch sự kiện Việt Nam → style gợi ý

Ngày dương lịch cố định; ngày âm lịch cần tra lại theo năm. Nên đăng trước sự kiện 5-10 ngày (teaser) và đúng ngày (cảm ơn/chúc).

| Dịp | Ngày | Style chính (+ phụ) | Template | Sản phẩm |
|---|---|---|---|---|
| Tết Dương lịch | 1/1 | `le-hoi`, `tuong-lai` | PRO, FL | BOS ("năm mới số hóa"), WEB |
| Tết Nguyên Đán | Mùng 1 Tết (2027: 6/2, tra lại) | `le-hoi` (+ `lang-man`) | PRO, TES | SIPOS (chốt đơn trước Tết, kiểm kho) |
| Valentine | 14/2 | `lang-man` | PRO, TIP | SIPOS (quán cafe, nhà hàng, quà tặng) |
| Quốc tế Phụ nữ | 8/3 | `lang-man` hoặc `sang-trong` | PRO, TES | SIPOS (spa, retail thời trang) |
| Giải phóng miền Nam / Quốc tế Lao động | 30/4 - 1/5 | `nang-dong` hoặc `khuyen-mai` | PRO | SIPOS (cao điểm du lịch, F&B kín bàn) |
| Quốc tế Thiếu nhi | 1/6 | `vui-nhon` | PRO, TIP | SIPOS (quán trẻ em, retail đồ chơi) |
| Mùa tựu trường | cuối 8 - đầu 9 | `vui-nhon` hoặc `toi-gian` | PRO | SIPOS (văn phòng phẩm, căn tin) |
| Trung thu | 15/8 âm lịch | `le-hoi` (+ `retro`) | PRO, TES | SIPOS (bánh, quà) |
| Phụ nữ Việt Nam | 20/10 | `lang-man` | PRO, TES | SIPOS |
| Halloween | 31/10 | `bi-an` bản nhẹ (+ `vui-nhon`) | TIP, PRO | SIPOS (F&B), WEB |
| Ngày Độc thân | 11/11 | `khuyen-mai` (+ `glitch-cyberpunk` nhẹ) | PRO | SIPOS, WEB |
| Black Friday | thứ Sáu 4 của tháng 11 (2026: 27/11) | `khuyen-mai` + `hanh-dong` | PRO | SIPOS |
| Ngày Nhà giáo VN | 20/11 | `tin-cay` hoặc `lang-man` | TES | SIPOS (cảm ơn khách), BOS |
| Giáng sinh | 24-25/12 | `le-hoi` (+ `lang-man`) | PRO | SIPOS (F&B) |
| Khai trương cửa hàng khách | tuỳ khách | `le-hoi` + `hanh-dong` nhẹ | PRO, TES | SIPOS |
| Ra mắt tính năng | tuỳ đợt | `toi-gian` mặc định; `robot-cong-nghe` / `tuong-lai` nếu là AI | FL | tất cả |
| Mẹo dùng hàng ngày | tuần | `toi-gian`, `vui-nhon`, `thu-gian` | TIP | tất cả |
| Trước/sau khi dùng | tuỳ đợt | `dien-anh` hoặc `du-lieu` | BA | BOS, SIPOS |
| Sinh nhật công ty | 2003 thành lập, kiểm tra ngày | `dien-anh` + `sang-trong` | FL, TES | Redsun (thương hiệu mẹ) |
| Khách hàng cảm ơn / case study | tuỳ đợt | `tin-cay` | TES | tất cả |
| World Cup / sự kiện thể thao | theo lịch giải | `nang-dong` | PRO | SIPOS (quán xem bóng đá, F&B) |
| Flash sale, deal giờ vàng | tuỳ đợt | `khuyen-mai` | PRO | SIPOS, WEB |
| Webinar / sự kiện B2B | tuỳ đợt | `tin-tuc` hoặc `sang-trong` | FL | BOS, WEB |
| Tin nhanh (đổi quy định thuế, hóa đơn điện tử) | khi có | `tin-tuc` | FL, TIP | SIPOS, BOS |
| Ra mắt thương hiệu SIPOS / mốc công ty | tuỳ đợt | `dien-anh` | FL | SIPOS |

Gợi ý nhịp theo ngày hôm nay (2026-10-08): 20/10 (`lang-man`), 31/10 (`bi-an` nhẹ), 11/11, 20/11, 27/11, Giáng sinh, Tết Dương lịch, Tết 2027.

## 5. Brand-safety: xung đột với REQUIREMENTS §5.1

Tham chiếu: §5.1 "Những điều cấm: gradient cầu vồng, quá 2 font, text chạy chéo"; §5.2 cấm hard-code màu/font/cỡ chữ; màu SIPOS `#0B4B54`/`#E30000`, Redsun `#BA0000`/`#EBAB32`, Webino `#00B2DB` + gradient logo tím (decisions §5). Quy tắc chung của mọi style: màu chỉ lấy từ `brand.css`; không dùng bảng màu của registry/palettes.

| Vấn đề | Style bị ảnh hưởng | Đề xuất guardrail | Cần Nam chốt |
|---|---|---|---|
| Gradient nhiều màu / cầu vồng | `tuong-lai`, `lang-man`, `glitch-cyberpunk` (block `flowing-gradient` cam-tím, `mesh-gradient` hồng-tím, `caption-neon-*` cyan-magenta) | Chỉ gradient 2 sắc **cùng họ màu thương hiệu**. Đổi toàn bộ màu block sang biến `--color-*`. Ngoại lệ gradient tím của logo Webino chỉ dùng cho logo, không dùng làm nền | Có cho phép gradient 2 sắc làm nền không |
| Quá 2 font | `thu-cong` (Caveat), `caption-editorial-emphasis` (dual font), `retro`/`robot-cong-nghe` (muốn mono) | Cố định Montserrat (đa trọng lượng). Mặc định **không** dùng Caveat/mono; `thu-cong` chỉ tô vẽ nét tay (gạch chân, khoanh), không viết chữ tay | Cho phép font thứ 2 (chữ tay hoặc mono) hay cấm hẳn |
| Text chạy chéo | `hanh-dong`, `khuyen-mai` (slam xiên), `perspective-marquee`, `scan-band` (dải chéo trên wordmark), `gloss-sweep` | Ánh sáng/dải chéo trên nền: được. Chữ nghiêng/chạy chéo: cấm. Chuyển động chữ chỉ ngang/dọc | Dải sáng chéo qua wordmark có tính là "chéo" không |
| Kinh dị vs độ tin cậy B2B | `bi-an`, `glitch-cyberpunk` | Chỉ bản "bí ẩn": tối + vignette + hook tò mò. Không máu, không xác, không jump scare, không âm thanh chói, không đe dọa. Màu thương hiệu giữ làm nhấn. Glitch tối đa 0.3s mỗi lần, không quá 2 lần/video, không dùng cho Testimonial | Có dùng Halloween hay không; glitch cho SP nào |
| Flash/nhấp nháy | `hanh-dong`, `tin-tuc`, `glitch-cyberpunk` (`flash-through-white`, `editorial-flash-overlay`) | Không quá 3 lần nháy/giây (an toàn động kinh nhạy sáng); flash ngắn, độ sáng giảm | Chấp nhận ngưỡng này |
| Màu lễ hội ngoài bảng màu | `le-hoi` (đỏ-vàng Tết, xanh-đỏ Giáng sinh) | Tết: đỏ `#BA0000` + vàng `#EBAB32` đã nằm trong palette Redsun, dùng được cho Redsun. SIPOS/Webino giữ màu riêng, lễ hội chỉ qua confetti/ánh sáng | Có thêm "màu dịp lễ" vào `brand.css` không |
| Hoài cổ làm bẩn logo | `retro` | Không áp grain/CRT lên logo và CTA | không |
| Dữ liệu bịa | `du-lieu`, `nang-dong` | Chỉ số liệu có nguồn trong brief; không đặt số giả để cho đẹp | không |

Ngoài ra: tránh khẳng định tuyệt đối ("số 1", "duy nhất") trong style `tin-tuc`/`khuyen-mai` nếu không có căn cứ. Không chỉnh sửa REQUIREMENTS; nếu Nam chốt thì ghi vào `docs/decisions.md`.

## 6. Ghi chú triển khai (M1, M3)

1. **Nơi lưu preset**: `brand/styles/<id>.json` (không phải template), mỗi file khai báo: `motion` (duration scale, ease), `transition` (primary + accent, tên item/shader), `type` (kiểu reveal, caption), `overlays` (danh sách item), `accentIntensity` (0-1), `music` (mood tag + BPM + `bgmMode`). Template đọc preset qua biến `style` (enum 19 giá trị) cộng CSS class `style-<id>` trên root. M1 chỉ cần `toi-gian` + 2 style khác để chứng minh cơ chế; M3 thêm dần.
2. **Chia đợt**: M1: `toi-gian`, `khuyen-mai`, `vui-nhon` (dùng item ít rủi ro, 2 template FL/TIP). M3: các style còn lại, ưu tiên theo lịch ở mục 4 (20/10, 11/11, Black Friday, Tết). `bi-an`, `glitch-cyberpunk`, `thu-cong` chờ Nam chốt mục 5.
3. **Block của registry phải đổi sang `brand.css`** rồi ghi vào `docs/decisions.md` (REQUIREMENTS §7): mỗi item dùng phải có dòng "tên item, phiên bản, đã thay màu/font nào, bằng biến nào". Cài bằng `hyperframes add <tên>`; ưu tiên component (dán thẳng) hơn block khi chỉ cần hiệu ứng.
4. **Lint/check**: mở rộng lint §13: (a) không có mã màu/font hard-code sau khi cài block; (b) chỉ 1 style/video; (c) mọi `style` khớp tệp preset; (d) ngưỡng nháy sáng (mục 5); (e) lệnh `npx hyperframes` lint/validate/inspect hiện có chạy trước render. Thêm test snapshot 1 khung/ style/ template để thấy brand không trôi.
5. **Nhạc nền theo mood**: thư viện nhạc gán nhãn `calm | warm | tense | driving | playful | festive | tech | ambient` (+ BPM). Mỗi style mục 3 trỏ tới 1-2 nhãn. Nguồn nhạc phụ thuộc §16 Q3 (license chưa chốt): bgm.md nói mặc định lấy từ catalog HeyGen qua `heygen` CLI, hoặc tự sinh bằng Lyria/MusicGen khi không có credential. Cần Nam xác nhận hướng nào được phép dùng thương mại. Bản không lời: dùng `volume ~0.9` (BGM_SILENT_VOLUME) khi không có voice; có voice thì carve `data-fx-carve` (hyperframes-audio/SKILL.md), đúng yêu cầu §7.
6. **Chọn style tự động**: skill `tao-reel` (§10) hỏi MKT "dịp gì?" rồi đề xuất style từ bảng mục 4, kèm lý do 1 câu, giống cách đề xuất template. MKT không cần biết tên kỹ thuật.
7. **Khoảng trống registry** (không có item phù hợp, xem mục 7): họa tiết Tết/lễ, trái tim/hoa (lãng mạn), nhân vật robot, hình ảnh F&B. Cần asset do design cấp, đặt ở `brand/assets/`; không tự sinh ảnh bằng AI trong MVP.
8. Style là **tham số**, nên không phá nguyên tắc "không dùng creation workflow của HyperFrames" (§10). Không gọi `/general-video` để làm style.

## 7. Khớp registry: nơi còn thiếu

Có match tốt: `toi-gian`, `sang-trong`, `hanh-dong`, `tuong-lai`, `robot-cong-nghe`, `glitch-cyberpunk`, `vui-nhon`, `nang-dong`, `dien-anh`, `tin-tuc`, `thu-gian`, `du-lieu`, `thu-cong`, `retro`, `khuyen-mai`, `tin-cay` (giới hạn bởi màu/font ở mục 5).
Khớp một phần: `lang-man` (chỉ ánh sáng/màu, không có yếu tố hoa/tim), `bi-an` (không có block kinh dị riêng, ghép từ vignette/grain/rack-focus), `robot-cong-nghe` (không có nhân vật robot).
Không có item theo chủ đề: `le-hoi` (Tết, Trung thu, Giáng sinh): chỉ confetti/ánh sáng chung.

## Câu hỏi chưa giải quyết

1. Cho phép font thứ 2 (chữ tay Caveat hoặc mono) cho `thu-cong`/`robot-cong-nghe`, hay giữ Montserrat duy nhất?
2. Cho phép gradient 2 sắc cùng họ màu làm nền (`tuong-lai`, `lang-man`) không?
3. Có làm Halloween (`bi-an` bản nhẹ) và glitch/cyberpunk cho Webino không, hay bỏ vì lệch độ tin cậy?
4. Màu theo dịp lễ (đỏ-vàng Tết, xanh-đỏ Giáng sinh) có được thêm vào `brand.css` không, hay chỉ dùng palette sản phẩm?
5. Nguồn nhạc nền có license thương mại (HeyGen catalog qua CLI, Lyria/MusicGen sinh, hay thư viện khác)? Liên quan §16 Q3.
6. Có cần thêm asset chủ đề (pháo hoa, hoa mai, lồng đèn, trái tim, mascot robot)? Ai cấp?
7. Ngưỡng chớp sáng tối đa 3 lần/giây có chấp nhận được không?
8. Ngày Tết 2027 (6/2) và 15/8 âm lịch cần tra lại bằng lịch chính thức trước khi lên kế hoạch.
9. Cho phép chữ/dải sáng chéo kiểu `scan-band`, `gloss-sweep` hay coi là "text chạy chéo"?
10. Hạn mức style cho M1: chỉ 3 style (`toi-gian`, `khuyen-mai`, `vui-nhon`) có ổn không?
