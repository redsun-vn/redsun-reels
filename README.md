# redsun-reels

Hệ thống làm video ngắn dọc (Reels, TikTok, Shorts) cho team Marketing Redsun, gồm SIPOS, Redsun BOS, Webino và Redsun. Người làm video chỉ cần nói chuyện với **Claude Code**. Claude viết kịch bản, điền vào mẫu video có sẵn và xuất ra file MP4 đúng thương hiệu. Video **không lồng tiếng**: thông điệp nằm trong chữ trên màn hình, hình ảnh sản phẩm và nhạc nền.

- Tài liệu yêu cầu: [`REQUIREMENTS.md`](REQUIREMENTS.md) (v0.4)
- Quyết định kỹ thuật, version đã khóa: [`docs/decisions.md`](docs/decisions.md)
- Owner / dev maintainer: Vũ Đức Nam

## Trạng thái

| Milestone | Nội dung | Trạng thái |
|---|---|---|
| M0 | Thử nghiệm HyperFrames, khởi tạo brand, môi trường | ✅ Xong trên Mac Intel. Mac chip M chưa kiểm |
| M1 | Lõi pipeline, 2 mẫu video (FeatureLaunch, TipOfTheDay), 3 phong cách | ✅ Xong. Còn chờ nhạc thật |
| M2 | Skill Claude Code `cai-dat` (tự cài máy) và `tao-reel` (dẫn MKT làm video) | ✅ Xong, đã thử bằng phiên Claude Code mới. Chờ 1 bạn MKT tự làm 1 video |
| M3 | 3 mẫu: BeforeAfter, Testimonial, Promo, 16 phong cách còn lại, lịch dịp lễ | ✅ Xong phần kỹ thuật. Chờ 10 video thử nghiệm của MKT (§14) |
| M4 | 3 mẫu: EventRecap, Stats, TalkingHead (đủ 20 loại video) | ⏳ |

Hiện **chưa có nhạc thật** trong thư viện. Repo chỉ có một track thử nghiệm tự sinh, và track này bị chặn khi xuất video thật. Muốn đăng thật thì Nam/MKT lead phải thêm nhạc theo [`docs/music-sources.md`](docs/music-sources.md).

---

## Dành cho team Marketing

### Cần gì
- MacBook (chip Intel hoặc chip M), có mạng.
- Đã cài **Claude Code**.
- Không cần biết lập trình. Không cần mật khẩu máy, Homebrew hay API key.

### Cài đặt lần đầu
1. Tải dự án về máy: trên GitHub bấm **Code → Download ZIP**, giải nén.
2. Mở Claude Code trong thư mục vừa giải nén, nói:

   > cài đặt giúp tôi

Claude tự cài mọi thứ (khoảng 2–10 phút tuỳ mạng) rồi dựng thử 1 video ngắn. Lỗi gì Claude sẽ nói bằng tiếng Việt và hướng dẫn cách xử lý. Muốn kiểm lại máy sau này, nói "kiểm tra máy".

### Làm một video
Nói với Claude, ví dụ:

> làm reel mẹo cho SIPOS về cảnh báo tồn kho thấp, khoảng 20 giây, cho chủ tiệm tạp hoá

Claude dẫn từng bước:

1. **Viết brief.** Claude tạo thư mục `briefs/<tên-video>/brief.md` và hỏi bạn tối đa 5 câu: sản phẩm, loại video, mục tiêu, thời lượng, lời kêu gọi.
2. **Chọn concept.** Claude đưa 3 hướng ý tưởng, mỗi hướng một kiểu câu mở đầu. Bạn chọn 1.
3. **Duyệt kịch bản.** Claude in bảng: Cảnh · Vai trò · Hình ảnh · Chữ trên màn hình · Chuyển cảnh · Thời lượng. Bạn sửa đến khi ưng.
4. **Xem thử** trên trình duyệt: `http://localhost:3002`.
5. **Xuất video.** Nói "xuất". File nằm ở `out/<tên-video>.mp4`. Claude soạn sẵn caption và hashtag để bạn copy khi đăng.

Muốn đổi phong cách thì cứ nói, ví dụ "đổi sang phong cách vui nhộn". Mỗi loại video có sẵn phong cách mặc định.

Claude chỉ sửa trong thư mục `briefs/` của video bạn đang làm. Muốn thêm mẫu video hay phong cách mới thì cần dev.

### Loại video và phong cách
- **20 loại video**: ra mắt tính năng, demo, mẹo "Bạn có biết?", hướng dẫn nhiều bước, khuyến mãi, chúc mừng dịp lễ… Xem [`docs/video-type-guide.md`](docs/video-type-guide.md).
- **19 phong cách**: tối giản, sang trọng, lãng mạn, hành động, bí ẩn, tương lai, robot, vui nhộn, lễ hội… Xem [`docs/video-style-catalog.md`](docs/video-style-catalog.md).
- Hiện làm được **15 loại video** trên 5 mẫu (FeatureLaunch, TipOfTheDay, BeforeAfter, Testimonial, Promo) và **cả 19 phong cách**. 5 loại còn lại (tổng kết sự kiện, giới thiệu công ty, tuyển dụng, số liệu, người nói trước camera) có ở M4.
- Dịp lễ (20/10, Halloween, Tết…) tự chọn phong cách hợp dịp. Xem lịch: nói với Claude "có những dịp lễ nào".

### Quy tắc nội dung
- Video ≤ 45 giây chỉ nên có 1–2 ý chính. Câu mở đầu tối đa 2 dòng, mỗi dòng ≤ 40 ký tự.
- Không đưa con số, giá hay ưu đãi không có trong brief.
- Redsun BOS gọi là "hệ điều hành doanh nghiệp", không gọi là "ERP".
- Đọc tên SIPOS, REDSUN, REDSUN BOS liền như một từ.

---

## Dành cho dev

### Công nghệ
- [HyperFrames](https://github.com/heygen-com/hyperframes) `0.8.141`: CLI + plugin Claude Code, khóa version, không bật auto-update.
- Node ≥ 22.18. File `.ts` chạy trực tiếp nhờ Node tự bỏ phần khai báo kiểu (type stripping), không cần `tsx`.
- pnpm `10.34.6` qua corepack. Chạy lệnh bằng `./reel <lệnh>`: lệnh này tự dùng Node trong `~/.redsun-reels` (do `scripts/cai-dat.sh` cài), tương đương `corepack pnpm run <lệnh>`.
- FFmpeg từ `ffmpeg-static` / `ffprobe-static`, không cần cài FFmpeg hệ thống.
- zod, yaml, Vitest, TypeScript 7 (typecheck).
- GSAP `3.14.2` bản local (`runtime/gsap/`), font Montserrat local (`brand/fonts/`). Render không tải gì từ mạng.

### Lệnh

| Lệnh | Việc làm |
|---|---|
| `bash ./scripts/cai-dat.sh` | Cài môi trường (Node tarball có kiểm SHA, thư viện, plugin HyperFrames, trình duyệt render, nhạc thử, render thử). Chạy lại được nhiều lần |
| `pnpm info [loại-video]` | Loại video, phong cách đã dựng được, thứ tự cảnh; `info thoi-luong "<chữ>"` tính thời lượng tối thiểu |
| `pnpm post <slug>` | Soạn `briefs/<slug>/post.md`: caption, hashtag, credit nhạc |
| `pnpm doctor` | Kiểm máy: Node, HyperFrames, FFmpeg, font, GSAP, nhạc, trình duyệt render |
| `pnpm new <slug>` | Tạo `briefs/<slug>/brief.md` từ `briefs/_example` |
| `pnpm validate <slug>` | Kiểm brief + kịch bản: hook, thứ tự vai trò cảnh, thời lượng đọc, file hình, nhạc, NFC |
| `pnpm build <slug>` | Kịch bản → `props.json` → project tạm `out/stage/<slug>/` → `hyperframes lint` + `check` |
| `pnpm preview [slug]` | Mở bản xem thử ở cổng 3002 (không có slug: composition trống). Tắt bằng `pnpm preview --stop` |
| `pnpm render <slug>` | Xuất `out/<slug>.mp4`: chuẩn hóa −14 LUFS, kiểm output spec, ghi `cost.json` |
| `pnpm make <slug>` | validate → build → render |
| `pnpm lint:brand` | Chặn màu, font, cỡ chữ viết cứng trong `templates/` và `brand/styles/` |
| `pnpm lint:music` | Kiểm thư viện nhạc: schema, file, license (cấm "NC") |
| `pnpm test` | Unit test (Vitest) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test:render [--update] [--only=<chuỗi>]` | So khung hình 5 mẫu × 19 phong cách với ảnh chuẩn `tests/baseline/` (SSIM ≥ 0.97, ~25 phút) |
| `pnpm test:e2e [--draft]` | Dựng + xuất 16 brief mẫu trong `tests/fixtures/briefs/` |
| `pnpm gen:test-music` | Sinh lại track nhạc thử nghiệm |

Cờ chung:
- `--draft`: xuất nhanh, chất lượng thấp.
- `--safe-zone`: hiện vùng an toàn khi xem thử.
- `--test-music`: cho phép dùng nhạc thử nghiệm. Chỉ dùng khi dev kiểm template, không dùng cho video thật.

Thử nhanh: `./reel make _example --test-music`. Lệnh này xuất video mẫu SIPOS 21 giây, mất khoảng 40 giây trên Mac Intel 2017.

### Cấu trúc

```
CLAUDE.md         quy tắc cho Claude Code: chế độ MKT (mặc định) / chế độ dev
.claude/skills/   cai-dat (gọi scripts/cai-dat.sh), tao-reel (quy trình 8 bước + references/script-format.md)
reel              lệnh gọn ./reel <lệnh> = pnpm run <lệnh> với Node trong ~/.redsun-reels
brand/            brand.css (biến màu/font/safe zone theo sản phẩm), frame.md, products.json,
                  fonts/, logos/, styles/<phong-cách>.json, music/manifest.json
config/           styles.ts (19), video-types.ts (20), occasions.ts (lịch dịp lễ), scene-timing.ts, schema brief/script/preset/nhạc
templates/        _shared/ (kit-core, kit-motion, kit-blocks, scene-kit .js + kit, kit-styles, kit-blocks, safe-zone .css),
                  FeatureLaunch/, TipOfTheDay/, BeforeAfter/, Testimonial/, Promo/, _blank/
scripts/          lệnh pnpm + lib/ (validate, build-props, stage-project, render-video, loudness, lint-brand…)
runtime/gsap/     GSAP local
briefs/<slug>/    brief.md, concepts.md, script.json, props.json, review.md, cost.json, post.md
tests/            unit test, fixtures/briefs/ (8 brief mẫu), baseline/ (ảnh chuẩn render test)
docs/             decisions, spike-report, video-type-guide, video-style-catalog, music-sources
plans/            plan theo milestone, báo cáo, journal
out/              (gitignore) video xuất ra + project tạm out/stage/
```

### Cách một video được dựng
1. `script.json` (Claude viết): mỗi cảnh có `role` (hook / problem / solution / proof / cta), `onScreenText`, `subText`, `visual` và `durationSec`.
2. `durationSec` mỗi cảnh ≥ `max(1.5 giây, số từ × 0.4 giây) + 0.5 giây`. `validate` báo lỗi nếu cảnh quá ngắn để đọc.
3. `build-props.ts` tính mốc bắt đầu từng cảnh, lấy logo theo sản phẩm, nạp preset phong cách, rồi ghi `props.json`.
4. `stage-project.ts` copy template, `_shared`, `brand`, `runtime`, hình và nhạc vào `out/stage/<slug>/`. Bước này cần vì HyperFrames không đọc file nằm ngoài thư mục project. Props được ghi thành giá trị mặc định của biến để `check` và Studio thấy đúng dữ liệu.
5. `templates/_shared/scene-kit.js` đọc biến `props` và dựng mọi khối thành clip có timing: nền, logo, chữ từng từ (tự co cỡ khi dài), phone mockup + callout + zoom, ảnh hoặc video quay màn hình, nhãn, số bước, TRƯỚC/SAU + màn chia đôi, quote + lower third, badge/giá/hạn chót/đếm ngược, CTA. Chuyển cảnh, lớp phủ, nền và hiệu ứng chữ lấy theo preset phong cách (`kit-motion.js`, `kit-styles.css`).
6. `hyperframes render --variables-file --strict-variables --strict`, sau đó ffmpeg `loudnorm` 2 lượt (−14 LUFS, TP ≤ −1 dBTP, fade 0.5 giây), copy luồng hình, rồi kiểm bằng ffprobe.

### Quy tắc khi sửa template
- Chỉ dùng biến trong `brand/brand.css`. `pnpm lint:brand` sẽ chặn nếu viết cứng.
- Root composition **không** khai `data-duration`, vì thời lượng tính từ các clip.
- Nền và mọi lớp phủ phải là **clip có timing**. Phần tử không có timing sẽ không được vẽ ra.
- Mỗi template tự tạo timeline và đăng ký `window.__timelines["main"]`, để `hyperframes lint` thấy.
- Chuyển cảnh: cảnh cũ và cảnh mới chuyển động cùng lúc. Không có animation thoát, trừ cảnh cuối.
- Video phải là clip riêng nằm trực tiếp trong root, không đặt trong phần tử có timing (nếu đặt trong đó sẽ đứng hình).
- Gán chữ bằng `textContent`. Chữ ở dạng NFC, trang khai `lang="vi"`.
- Đổi giao diện có chủ ý: xem lại bằng mắt, rồi chạy `pnpm test:render --update`.
- **Trước khi tạo skill mới**, kiểm kê các skill đã cài (plugin HyperFrames…), xem `docs/decisions.md` mục 6.

### Nâng version HyperFrames
Chỉ Nam được nâng. Các bước: đổi version trong `package.json` và tag plugin, chạy `pnpm test`, `pnpm test:render`, `pnpm test:e2e`, rồi ghi version mới vào `docs/decisions.md`.

### Lưu ý về máy dev
Hook trên máy dev chặn lệnh Bash chứa `vendor`, `node_modules`, `.git`, `.venv`. Vì vậy GSAP nằm ở `runtime/`, và script lấy đường dẫn package qua `require.resolve`.
