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
| M4 | 3 mẫu: EventRecap, Stats, TalkingHead (đủ 20 loại video), giữ tiếng gốc clip người nói + tự hạ nhạc | ✅ Xong phần kỹ thuật. Chờ clip quay thật của MKT để thử TalkingHead |

Thư viện nhạc có **20 bài Mixkit dùng được cho video thật** (máy tự tải khi cài, không nằm trong repo) và 5 bài tự sinh để nghe thử. MKT lead cần nghe lại các bài này trước khi đăng hàng loạt. Xem [`docs/music-sources.md`](docs/music-sources.md).

**Thử nghiệm với MKT**: làm theo [`docs/huong-dan-thu-nghiem-mkt.md`](docs/huong-dan-thu-nghiem-mkt.md) (10 video, phiếu chấm, cách quay clip người nói).

---

## Dành cho team Marketing

**Sổ tay đầy đủ: [`docs/huong-dan-mkt.md`](docs/huong-dan-mkt.md)**: chỗ để ảnh, clip, nhạc; chọn loại video; câu nói hay dùng; đăng bài; khi có lỗi.

### Cần chuẩn bị
- MacBook chip Intel hoặc chip M.
- Ổ đĩa còn trống ít nhất **3 GB**.
- Mạng Internet ổn định. Lần cài đầu tải vài trăm MB.
- Tài khoản Claude của công ty (hỏi Nam nếu chưa có).
- Không cần biết lập trình. Không cần mật khẩu máy, Homebrew, git hay API key.

### Cài đặt lần đầu (khoảng 15 phút)

**Bước 1. Cài Claude Code**
1. Vào [claude.ai/download](https://claude.ai/download), tải bản cho macOS, rồi kéo biểu tượng Claude vào thư mục **Applications**.
2. Mở Claude, đăng nhập bằng tài khoản công ty.
3. Chuyển sang mục **Code** (Claude Code) trong ứng dụng.

> Bạn quen dùng Terminal? Có thể cài bản dòng lệnh theo [hướng dẫn chính thức](https://docs.claude.com/en/docs/claude-code/setup), rồi gõ `claude` trong thư mục dự án. Các bước sau giữ nguyên.

**Bước 2. Tải dự án về máy**
1. Mở [github.com/redsun-vn/redsun-reels](https://github.com/redsun-vn/redsun-reels).
2. Bấm nút xanh **Code**, chọn **Download ZIP**.
3. Mở thư mục **Downloads** (Tải về), bấm đúp file `redsun-reels-main.zip` để giải nén.
4. Kéo thư mục `redsun-reels-main` sang **Documents** (Tài liệu). Có thể đổi tên thành `redsun-reels`.
   - Không để dự án trong Downloads hoặc Desktop. macOS hay hỏi quyền với hai thư mục này, làm việc cài bị gián đoạn.
   - Lỡ di chuyển hoặc đổi tên thư mục sau khi cài: mở thư mục ở chỗ mới trong Claude Code, gõ "cài lại".

**Bước 3. Mở dự án trong Claude Code**
1. Trong Claude Code, chọn mở thư mục (Open folder), trỏ tới `Documents/redsun-reels`.
2. Nếu Claude hỏi có tin tưởng thư mục này không, chọn **Yes / Trust**.

**Bước 4. Nhờ Claude cài**
1. Gõ vào ô chat:

   > cài đặt giúp tôi

2. Nếu Claude hỏi quyền chạy lệnh cài đặt, chọn **Yes** (hoặc **Allow**).
3. Để máy chạy, đừng đóng Claude và đừng cho máy ngủ. Claude cài lần lượt 7 bước:
   1. Kiểm tra máy (loại chip, ổ đĩa, mạng).
   2. Cài Node.js vào thư mục riêng `~/.redsun-reels`, không đụng tới phần mềm khác trên máy.
   3. Cài thư viện của dự án.
   4. Cài plugin HyperFrames cho Claude Code. Bản desktop có thể báo bỏ qua bước này, không sao.
   5. Chuẩn bị trình duyệt để dựng video.
   6. Tải thư viện nhạc (khoảng 70 MB) và chuẩn bị nhạc thử.
   7. Kiểm tra máy và dựng thử 1 video ngắn.

**Bước 5. Kiểm tra đã xong**
- Claude báo **"Cài xong rồi"** là được.
- Nếu Claude nhắc mở lại Claude Code, đóng hẳn ứng dụng (⌘Q) rồi mở lại, mở đúng thư mục dự án.
- Để thử, gõ **"kiểm tra máy"**. Mọi dòng đều có dấu ✓ là máy sẵn sàng.

### Khi cài gặp lỗi
Claude sẽ nói lỗi bằng tiếng Việt và cách xử lý. Các lỗi hay gặp:

| Claude báo | Cách xử lý |
|---|---|
| Không kết nối được Internet | Kiểm tra wifi, rồi gõ "cài lại" |
| Ổ đĩa còn dưới 3 GB trống | Xoá bớt file (video cũ, thùng rác), rồi gõ "cài lại" |
| Tải không thành công, lỗi mạng giữa chừng | Gõ "cài lại". Bước nào đã xong sẽ được bỏ qua, không phải làm lại từ đầu |
| Máy chưa cài môi trường làm video | Bạn chưa cài hoặc đang mở nhầm thư mục. Mở đúng thư mục dự án, gõ "cài đặt giúp tôi" |
| Có nhắc tới một file log | Gửi file log đó cho Nam |

Cài lại bao nhiêu lần cũng được.

### Cập nhật bản mới
1. Tải ZIP mới như Bước 2, giải nén.
2. Mở `briefs/` của bản cũ, copy các thư mục video của bạn (trừ `_example`) vào `briefs/` của bản mới. Video đã xuất nằm ở `out/` bản cũ: copy cả thư mục `out/` sang bản mới (bản mới chưa có thư mục này). Có nhạc tự tìm thì copy các file trong `nhac-tu-tim/` sang `nhac-tu-tim/` của bản mới.
3. Xoá bản cũ, đặt bản mới đúng chỗ cũ, cùng tên.
4. Mở trong Claude Code, gõ "cài lại". Có nhạc tự tìm thì gõ thêm "đăng ký lại nhạc tự tìm".

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

### Dùng nhạc bạn tự tìm
Thư viện có sẵn 20 bài. Muốn dùng bài khác:
1. Chỉ lấy nhạc từ **[Pixabay Music](https://pixabay.com/music/)** hoặc **[Mixkit](https://mixkit.co/free-stock-music/)**, chọn bài **không lời**. Không dùng nhạc YouTube, nhạc ca sĩ, nhạc trong app TikTok.
2. Tải file nhạc (mp3) về.
3. Chụp màn hình trang bài nhạc, thấy được tên bài, tác giả và chữ license.
4. Bỏ cả hai file vào thư mục **`nhac-tu-tim`** trong dự án, đặt **cùng tên**, ví dụ `nhac-vui.mp3` và `nhac-vui.png`.
5. Nói với Claude: "thêm nhạc nhac-vui, link <dán link trang bài>, tác giả <tên>".

Claude kiểm rồi thêm bài vào thư viện trên máy bạn, dùng được ngay. Sau đó báo Nam để Nam đưa bài vào thư viện chung của cả team. Khi cập nhật bản mới, nhớ chép cả thư mục `nhac-tu-tim` sang.

### Loại video và phong cách
- **20 loại video**: ra mắt tính năng, demo, mẹo "Bạn có biết?", hướng dẫn nhiều bước, khuyến mãi, chúc mừng dịp lễ… Xem [`docs/video-type-guide.md`](docs/video-type-guide.md).
- **19 phong cách**: tối giản, sang trọng, lãng mạn, hành động, bí ẩn, tương lai, robot, vui nhộn, lễ hội… Xem [`docs/video-style-catalog.md`](docs/video-style-catalog.md).
- Làm được **cả 20 loại video** trên 8 mẫu (FeatureLaunch, TipOfTheDay, BeforeAfter, Testimonial, Promo, EventRecap, Stats, TalkingHead) và **cả 19 phong cách**.
- Video có người nói (bạn tự quay) hoặc khách hàng nói: giữ tiếng gốc, nhạc nền tự nhỏ lại khi có người nói.
- Dịp lễ (20/10, Halloween, Tết…) tự chọn phong cách hợp dịp. Xem lịch: nói với Claude "có những dịp lễ nào".

### Quy tắc nội dung
- Video ≤ 45 giây chỉ nên có 1–2 ý chính. Câu mở đầu tối đa 2 dòng, mỗi dòng ≤ 40 ký tự.
- Không đưa con số, giá hay ưu đãi không có trong brief.
- Redsun BOS gọi là "hệ điều hành doanh nghiệp", không gọi là "ERP".
- Đọc tên SIPOS, REDSUN, REDSUN BOS liền như một từ.

---

## Dành cho dev

### Cài cho dev
```bash
git clone git@github.com:redsun-vn/redsun-reels.git
cd redsun-reels
bash ./scripts/cai-dat.sh   # Node vào ~/.redsun-reels, pnpm install, plugin HyperFrames, trình duyệt render, render thử
./reel doctor
./reel test && ./reel typecheck
```
Không cần Node hệ thống: `./reel` tự dùng Node trong `~/.redsun-reels`.

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
| `pnpm info [loại-video]` | Loại video, phong cách đã dựng được, thứ tự cảnh; `info thoi-luong "<chữ>"` tính thời lượng tối thiểu; `info nhac <phong-cách>` liệt kê nhạc |
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
| `pnpm test:render [--update] [--only=<chuỗi>]` | So khung hình 8 mẫu × 19 phong cách với ảnh chuẩn `tests/baseline/` (SSIM ≥ 0.97, ~45 phút) |
| `pnpm test:e2e [--draft]` | Dựng + xuất 21 brief mẫu trong `tests/fixtures/briefs/` (20 loại video + test dấu) |
| `pnpm gen:test-music` | Sinh lại track nhạc thử nghiệm |
| `pnpm music:fetch` | Tải nhạc bên thứ ba theo `downloadUrl` trong manifest, kiểm SHA-256 |
| `pnpm music:add nhac-tu-tim/<file> --link= --tac-gia= --mood= [--ten=]` | Thêm nhạc MKT tự tải (Pixabay/Mixkit, cần ảnh chụp cùng tên) vào manifest trên máy đó (`localOnly`); `--lai` đăng ký lại |

Cờ chung:
- `--draft`: xuất nhanh, chất lượng thấp.
- `--safe-zone`: hiện vùng an toàn khi xem thử.
- `--test-music`: cho phép dùng nhạc thử nghiệm. Chỉ dùng khi dev kiểm template, không dùng cho video thật.

Thử nhanh: `./reel make _example`. Lệnh này xuất video mẫu SIPOS 21 giây với nhạc Mixkit, mất khoảng 40 giây trên Mac Intel 2017.

### Cấu trúc

```
CLAUDE.md         quy tắc cho Claude Code: chế độ MKT (mặc định) / chế độ dev
.claude/skills/   cai-dat (gọi scripts/cai-dat.sh), tao-reel (quy trình 8 bước + references/script-format.md)
reel              lệnh gọn ./reel <lệnh> = pnpm run <lệnh> với Node trong ~/.redsun-reels
brand/            brand.css (biến màu/font/safe zone theo sản phẩm), frame.md, products.json,
                  fonts/, logos/, styles/<phong-cách>.json, music/manifest.json
config/           styles.ts (19), video-types.ts (20), occasions.ts (lịch dịp lễ), scene-timing.ts, schema brief/script/preset/nhạc
templates/        _shared/ (kit-core, kit-motion, kit-blocks, scene-kit .js + kit, kit-styles, kit-blocks, safe-zone .css),
                  FeatureLaunch/, TipOfTheDay/, BeforeAfter/, Testimonial/, Promo/, EventRecap/, Stats/, TalkingHead/, _blank/
scripts/          lệnh pnpm + lib/ (validate, build-props, stage-project, render-video, loudness, lint-brand…)
runtime/gsap/     GSAP local
nhac-tu-tim/      (gitignore) nhạc MKT tự tải + ảnh chụp license, dùng với pnpm music:add
briefs/<slug>/    brief.md, concepts.md, script.json, props.json, review.md, cost.json, post.md
tests/            unit test, fixtures/briefs/ (21 brief mẫu), baseline/ (ảnh chuẩn render test)
docs/             decisions, spike-report, video-type-guide, video-style-catalog, music-sources
plans/            plan theo milestone, báo cáo, journal
out/              (gitignore) video xuất ra + project tạm out/stage/
```

### Cách một video được dựng
1. `script.json` (Claude viết): mỗi cảnh có `role` (hook / problem / solution / proof / cta), `onScreenText`, `subText`, `visual` và `durationSec`.
2. `durationSec` mỗi cảnh ≥ `max(1.5 giây, số từ × 0.4 giây) + 0.5 giây`. `validate` báo lỗi nếu cảnh quá ngắn để đọc.
3. `build-props.ts` tính mốc bắt đầu từng cảnh, lấy logo theo sản phẩm, nạp preset phong cách, rồi ghi `props.json`.
4. `stage-project.ts` copy template, `_shared`, `brand`, `runtime`, hình và nhạc vào `out/stage/<slug>/`. Bước này cần vì HyperFrames không đọc file nằm ngoài thư mục project. Props được ghi thành giá trị mặc định của biến để `check` và Studio thấy đúng dữ liệu.
5. `templates/_shared/scene-kit.js` đọc biến `props` và dựng mọi khối thành clip có timing: nền, logo, chữ từng từ (tự co cỡ khi dài), phone mockup + callout + zoom, ảnh hoặc video quay màn hình, nhãn, số bước, TRƯỚC/SAU + màn chia đôi, quote + lower third, badge/giá/hạn chót/đếm ngược, montage, số đếm lên + biểu đồ, clip người nói giữ tiếng, CTA. Chuyển cảnh, lớp phủ, nền và hiệu ứng chữ lấy theo preset phong cách (`kit-motion.js`, `kit-styles.css`).
6. Clip giữ tiếng gốc: bước build ghi lane hạ nhạc (`data-automation`) vào `index.html` của bản stage (`scripts/lib/music-ducking.ts`).
7. `hyperframes render --variables-file --strict-variables --strict`, sau đó chuẩn hoá âm thanh (fade 0.5 giây, tăng/giảm âm lượng + limiter 192 kHz, đo lại tới khi −14 LUFS và đỉnh ≤ −1 dBTP), copy luồng hình, rồi kiểm bằng ffprobe.

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
