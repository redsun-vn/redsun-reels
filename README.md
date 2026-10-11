# redsun-reels

Hệ thống làm video ngắn dọc 9:16 (Facebook Reels, TikTok, YouTube Shorts, Instagram Reels) cho team Marketing Redsun: **SIPOS**, **REDSUN BOS**, **Webino** và **REDSUN**. Người làm video chỉ cần nói chuyện với **Claude Code**: đưa brief, nhận về file MP4 đúng thương hiệu kèm caption.

Mỗi video được **dựng riêng** như một đoạn phim ngắn: nhân vật hoặc người thật, bối cảnh, tiếng động, nhạc có giấy phép, và **giọng đọc AI** tiếng Việt khi có lời nói. Nền tảng render là [HyperFrames](https://github.com/heygen-com/hyperframes).

- Bản đang dùng: `0.3.0`. Điểm mới từng bản: [`docs/changelog.md`](docs/changelog.md), [trang Releases](https://github.com/redsun-vn/redsun-reels/releases).
- Yêu cầu: [`REQUIREMENTS.md`](REQUIREMENTS.md) (v0.6). Quyết định kỹ thuật, version đã khoá: [`docs/decisions.md`](docs/decisions.md).
- Sổ tay cho MKT: [`docs/huong-dan-mkt.md`](docs/huong-dan-mkt.md).
- Owner, dev maintainer: Vũ Đức Nam (CTO).

## Sản phẩm

| Sản phẩm | Định vị | Trang |
|---|---|---|
| SIPOS | Giải pháp quản lý bán hàng trong thời đại AI | sipos.vn |
| REDSUN BOS | Nền tảng quản trị doanh nghiệp với AI ("hệ điều hành doanh nghiệp", không gọi là "ERP") | redsun.vn |
| Webino | Nền tảng AI Web Builder | webino.vn |
| REDSUN | The Leading Web Based Solutions | redsun.vn |

Hồ sơ đầy đủ (logo, lời kêu gọi mặc định, hashtag, tính năng đã xác nhận): [`brand/products.json`](brand/products.json).

---

## Dành cho team Marketing

### Cần chuẩn bị
- MacBook chip Intel hoặc chip M.
- Ổ đĩa còn trống ít nhất **3 GB**.
- Mạng Internet ổn định. Lần cài đầu tải vài trăm MB.
- Tài khoản Claude của công ty (hỏi Nam nếu chưa có).
- Không cần biết lập trình. Không cần mật khẩu máy, Homebrew hay git.
- Khoá giọng đọc AI do **Nam** đưa vào máy. Chưa có khoá thì vẫn làm video được, chỉ chưa tạo được giọng mới.

### Cài đặt lần đầu (khoảng 15 phút)

**Bước 1. Cài Claude Code**
1. Vào [claude.ai/download](https://claude.ai/download), tải bản cho macOS, kéo biểu tượng Claude vào thư mục **Applications**. Đã có app thì cập nhật bản mới nhất: dự án dùng model Claude Opus 5.5, cần Claude Code bản 2.1.280 trở lên.
2. Mở Claude, đăng nhập bằng tài khoản công ty.
3. Chuyển sang mục **Code** (Claude Code) trong ứng dụng.

> Quen dùng Terminal? Có thể cài bản dòng lệnh theo [hướng dẫn chính thức](https://docs.claude.com/en/docs/claude-code/setup), rồi gõ `claude` trong thư mục dự án. Các bước sau giữ nguyên.

**Bước 2. Tải dự án về máy**
1. Mở [github.com/redsun-vn/redsun-reels](https://github.com/redsun-vn/redsun-reels).
2. Bấm nút xanh **Code**, chọn **Download ZIP**.
3. Mở thư mục **Downloads** (Tải về), bấm đúp file `redsun-reels-main.zip` để giải nén.
4. Kéo thư mục `redsun-reels-main` sang **Documents** (Tài liệu). Có thể đổi tên thành `redsun-reels`.
   - Không để dự án trong Downloads hoặc Desktop: macOS hay hỏi quyền với hai thư mục này, làm việc cài bị gián đoạn.
   - Lỡ di chuyển hoặc đổi tên thư mục sau khi cài: mở thư mục ở chỗ mới trong Claude Code, gõ "cài lại".

**Bước 3. Mở dự án trong Claude Code**
1. Trong Claude Code, chọn mở thư mục (Open folder), trỏ tới `Documents/redsun-reels`.
2. Claude hỏi có tin tưởng thư mục này không thì chọn **Yes / Trust**.

**Bước 4. Nhờ Claude cài**
1. Gõ vào ô chat:

   > cài đặt giúp tôi

2. Claude hỏi quyền chạy lệnh cài đặt thì chọn **Yes** (hoặc **Allow**).
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
- Claude nhắc mở lại Claude Code thì đóng hẳn ứng dụng (⌘Q) rồi mở lại, mở đúng thư mục dự án.
- Để thử, gõ **"kiểm tra máy"**. Mọi dòng có dấu ✓ là máy sẵn sàng.

### Khi cài gặp lỗi
Claude nói lỗi bằng tiếng Việt và cách xử lý. Lỗi hay gặp:

| Claude báo | Cách xử lý |
|---|---|
| Không kết nối được Internet | Kiểm tra wifi, rồi gõ "cài lại" |
| Ổ đĩa còn dưới 3 GB trống | Xoá bớt file (video cũ, thùng rác), rồi gõ "cài lại" |
| Tải không thành công, lỗi mạng giữa chừng | Gõ "cài lại". Bước đã xong được bỏ qua |
| Máy chưa cài môi trường làm video | Chưa cài hoặc mở nhầm thư mục. Mở đúng thư mục dự án, gõ "cài đặt giúp tôi" |
| "does not support this model… version 2.1.280 or newer is required" | Claude Code đã cũ. App Claude: menu **Claude → Check for Updates**, cập nhật rồi mở lại. Bản Terminal: `claude update` |
| Máy chưa có khoá giọng đọc AI | Nhắn Nam đưa khoá vào máy. Video đã có giọng vẫn xuất được |
| Có nhắc tới một file log | Gửi file log đó cho Nam |

Cài lại bao nhiêu lần cũng được.

### Làm một video
Nói với Claude, ví dụ:

> làm reel cho SIPOS về chuyện khách gửi ảnh chuyển khoản giả, 30 giây, cho chủ quán

Claude tự làm từ brief đến video, chỉ dừng hỏi khi cần:

1. **Brief.** Claude ghi lại điều bạn nói, rồi hỏi **kiểu hình**: hoạt hình minh hoạ hay người thật quay sẵn.
2. **Brief đủ chưa.** Thiếu thứ kịch bản cần (nỗi đau cụ thể của khách, tính năng giải quyết, số liệu, ưu đãi, lời khách) thì Claude hỏi một lần, tối đa 5 câu có lựa chọn sẵn. Claude **không tự nghĩ ra** con số, giá, ưu đãi, tính năng hay lời khách hàng.
3. **Ý tưởng.** Claude chấm các điểm hấp dẫn trong brief, viết 3 ý tưởng, tự chọn ý mạnh nhất.
4. **Kịch bản.** Mở bằng điểm hấp dẫn nhất ngay 3 giây đầu, nêu nỗi đau của khách rồi cho thấy sản phẩm giải quyết thế nào. Máy kiểm và chặn kịch bản sai luật trước khi dựng.
5. **Dựng.** Claude thiết kế từng cảnh, tạo giọng đọc AI, ghép tiếng động và nhạc theo phách, tự soát khung hình.
6. **Xuất.** File ở `out/<tên-video>.mp4`, kèm **bảng khung chính** (mỗi khung một số) và caption + hashtag để copy khi đăng.

Xem xong, muốn sửa gì cứ nói: "sửa khung 3: …", "đổi câu mở đầu", "nhạc vui hơn", "câu này đọc chưa hay". Muốn tự chọn ý tưởng và duyệt kịch bản trước: nói **"làm từng bước"**. Một video mất khoảng 10–15 phút từ lúc có nội dung tới lúc có MP4.

Sổ tay [`docs/huong-dan-mkt.md`](docs/huong-dan-mkt.md) có đủ: chỗ để ảnh, clip, nhạc; chọn loại video; câu nói hay dùng; đăng bài; khi có lỗi.

### Kiểu hình
| Kiểu hình | Là gì | Trạng thái |
|---|---|---|
| Minh hoạ | Nhân vật Việt vẽ phẳng, bối cảnh vẽ sẵn (quán, nhà, tạp hoá, văn phòng, kho, phố, livestream), nét mặt theo cảm xúc | Dùng được |
| Người thật quay sẵn | Clip người châu Á từ Pexels/Pixabay, mỗi vai một người, đúng cảm xúc từng khung; Claude tự cắt đoạn và ghi sổ nguồn | Dùng được |
| Người thật do AI tạo | Nhân vật trông như thật do AI tạo, luôn gắn nhãn AI, tốn phí (trần 50.000đ/video). Hai cách: **ảnh nhân vật trước** (duyệt mặt, mặt giữ y hệt, Kling) hoặc **tạo thẳng từ kịch bản** (không cần ảnh, cử động mọi cảnh, Seedance 2.0 Fast) | Dùng được |

Hình, clip của chính bạn (ảnh quán, màn hình phần mềm, người thật đã đồng ý): kéo vào khung chat, hoặc bỏ vào `briefs/<tên-video>/hinh/`.

### Giọng đọc AI
- Video có lời nói dùng **giọng VieNeu** tiếng Việt chuẩn miền Nam. Mặc định **một giọng kể** (Duyên Hà My) đọc cả chuyện và thông điệp cuối; muốn mỗi nhân vật một giọng thì nói "mỗi nhân vật một giọng".
- Giọng đặt lúc không thấy miệng người nói, nên không lệch miệng. Video người thật có phụ đề nhỏ.
- Tên sản phẩm được đọc theo cách Nam đã duyệt: SIPOS "Xi pốt", Webino "Web-bi-nô", REDSUN BOS "Redsun bê ô ét". Phụ đề và chữ trên hình vẫn viết đúng tên.
- Video có giọng AI luôn có chữ nhỏ **"Do AI sản xuất"** và dòng nhãn ở đầu caption. Giữ nguyên khi đăng.
- Không muốn có giọng: nói "video này không cần giọng".

### Luật kịch bản (máy chặn)
- **Luật số 1 — 3 giây đầu**: mở bằng điểm hấp dẫn nhất của brief (vỡ lẽ, hậu quả, nỗi đau quen), không logo, không chào hỏi. Câu mở đầu ≤ 8 từ, tối đa 2 dòng × 40 ký tự.
- **Luật số 2 — nỗi đau → giải pháp**: nêu một nỗi đau cụ thể của khách có hậu quả thấy được, rồi cho thấy sản phẩm làm gì để gỡ đúng nỗi đau đó. Miễn cho lời chúc, đếm ngược, tổng kết sự kiện, tuyển dụng, thông báo, không khí quán, khoe số liệu.
- **Reel dài 15–30 giây** để người xem xem hết, nền tảng phân phối rộng hơn.
- Mỗi cảnh một ý, đủ thời gian để đọc. Viết đúng tên: SIPOS, REDSUN BOS, Webino, REDSUN.

### Nhạc
- Thư viện có **23 bài** Mixkit đăng được, Nam đã nghe và duyệt (máy tự tải khi cài, không nằm trong repo). Muốn nghe lại cả thư viện: nhờ Claude mở trang nghe nhạc. Nguồn và license: [`docs/music-sources.md`](docs/music-sources.md).
- **Chỉ đăng tự nhiên** (organic), **không chạy quảng cáo trả tiền**: license nhạc chưa kiểm cho quảng cáo.
- Muốn dùng bài tự tìm:
  1. Chỉ lấy từ **[Pixabay Music](https://pixabay.com/music/)** hoặc **[Mixkit](https://mixkit.co/free-stock-music/)**, bài **không lời**. Không dùng nhạc YouTube, nhạc ca sĩ, nhạc trong app TikTok.
  2. Tải file mp3, chụp màn hình trang bài (thấy tên bài, tác giả, chữ license).
  3. Bỏ cả hai vào thư mục **`nhac-tu-tim`**, đặt **cùng tên**, vd. `nhac-vui.mp3` và `nhac-vui.png`.
  4. Nói: "thêm nhạc nhac-vui, link <link trang bài>, tác giả <tên>". Sau đó báo Nam để đưa bài vào thư viện chung.

### Video của bạn nằm ở đâu
| Thư mục | Chứa gì |
|---|---|
| `briefs/<tên-video>/` | Brief, ý tưởng, kịch bản, bản dựng, giọng đọc của từng video. **Chỉ nằm trên máy bạn, không lên GitHub** |
| `briefs/<tên-video>/hinh/` | Ảnh, clip bạn gửi cho video đó |
| `out/` | Video đã xuất (`<tên-video>.mp4`) |
| `nhac-tu-tim/` | Nhạc bạn tự tìm + ảnh chụp license |

Các thư mục khác là của dev, đừng sửa hay xoá.

### Cập nhật bản mới
Bản đang dùng: nói "kiểm tra máy", dòng đầu ghi số bản.

1. Tải ZIP mới như Bước 2, hoặc tải **Source code (zip)** của một bản ở [trang Releases](https://github.com/redsun-vn/redsun-reels/releases). Giải nén.
2. Chép sang bản mới các thứ của bạn ở bản cũ (bản tải về không có sẵn):
   - các thư mục video trong `briefs/` (trừ `_example`);
   - cả thư mục `out/`;
   - các file trong `nhac-tu-tim/` (nếu có).
3. Xoá bản cũ, đặt bản mới đúng chỗ cũ, cùng tên.
4. Mở trong Claude Code, gõ "cài lại". Có nhạc tự tìm thì gõ thêm "đăng ký lại nhạc tự tìm".

---

## Dành cho dev

Chế độ dev chỉ bật khi nói rõ "chế độ dev" (xem [`CLAUDE.md`](CLAUDE.md)). Chế độ MKT chỉ ghi trong `briefs/`.

### Cài cho dev
```bash
git clone git@github.com:redsun-vn/redsun-reels.git
cd redsun-reels
bash ./scripts/cai-dat.sh   # Node vào ~/.redsun-reels, thư viện, plugin HyperFrames, trình duyệt render, render thử
cp .env.example .env        # điền VIENEU_API_KEY (giọng đọc), OPENROUTER_API_KEY (cảnh AI); không commit .env
./reel doctor
./reel test && ./reel typecheck
```
Không cần Node hệ thống: `./reel <lệnh>` tự dùng Node trong `~/.redsun-reels` (tương đương `corepack pnpm run <lệnh>`).

### Công nghệ
- [HyperFrames](https://github.com/heygen-com/hyperframes) `0.8.141`: CLI + plugin Claude Code, khoá version, không bật auto-update.
- Claude Opus 5.5 (`claude-opus-5-5`) cho mọi phiên (`.claude/settings.json`) và skill `tao-reel`.
- Node ≥ 22.18, chạy `.ts` trực tiếp (type stripping). pnpm `10.34.6` qua corepack.
- FFmpeg từ `ffmpeg-static` / `ffprobe-static`, không cần FFmpeg hệ thống.
- Giọng đọc VieNeu (`VIENEU_API_KEY` trong `.env`), trần token mỗi video ở `config/cost.ts`.
- zod, yaml, Vitest, TypeScript (typecheck).
- GSAP `3.14.2` bản local (`runtime/gsap/`), font Montserrat local (`brand/fonts/`). Render không tải gì từ mạng.

### Skill Claude Code (`.claude/skills/`)
| Skill | Việc |
|---|---|
| `cai-dat` | Cài, cài lại, kiểm máy (gọi `scripts/cai-dat.sh`) |
| `tao-reel` | Luồng chính từ brief đến video: chấm brief, điểm hấp dẫn, 3 ý tưởng, kịch bản, xuất, sửa theo góp ý |
| `chon-kieu-hinh` | Chọn minh hoạ / người thật quay sẵn / người thật AI; luật cứng về nhãn AI và người có danh tính |
| `dung-video` | Dựng riêng từng video bằng bộ dụng cụ `templates/_rieng/` |
| `giong-doc` | Dàn giọng, viết lời đọc, tạo giọng VieNeu, ghép vào bản dựng |
| `dao-dien-chuyen-dong` | Chữ nhấn và chuyển động cho đường dự phòng dùng mẫu có sẵn |

### Lệnh

| Lệnh | Việc |
|---|---|
| `bash ./scripts/cai-dat.sh` | Cài môi trường (Node tarball có kiểm SHA, thư viện, plugin, trình duyệt render, nhạc, render thử). Chạy lại được |
| `./reel doctor` | Kiểm máy: số bản, Node, HyperFrames, FFmpeg, font, GSAP, nhạc, trình duyệt, khoá giọng |
| `./reel info [loại-video]` | Loại video, phong cách, thứ tự cảnh; `info thoi-luong "<chữ>"`, `info nhac <phong-cách>`, `info nhip <id-nhạc>`, `info gan-day`, `info dip-le` |
| `./reel new <tên>` | Tạo `briefs/<tên>/brief.md` từ `briefs/_example` |
| `./reel hinh <tên> [file…]` | Nhận hình/clip MKT gửi, đổi HEIC → JPG, liệt kê |
| `./reel quay-san <tên> […] / --tai-lai` | Nhận, tự cắt clip người thật quay sẵn (Pexels/Pixabay) + sổ nguồn; `--tai-lai` tải lại theo sổ |
| `./reel giong <tên> [--cau=<id>] [--lai] [--cho=<giây>]` | Tạo giọng VieNeu theo `dung-rieng/loi-doc.json`, kiểm từng bản trên máy |
| `./reel ai <tên> [--canh=<id>] [--video] [--lai]` | Cảnh người thật do AI (OpenRouter) theo `ai/canh-ai.json` và `cachTaoAi` của brief: ảnh vai → khung đầu → clip Kling, hoặc clip Seedance tạo từ chữ; trần 50.000đ/video |
| `./reel validate <tên>` | Kiểm brief + kịch bản: luật 3 giây đầu, nỗi đau → giải pháp, 15–30 giây, thời lượng đọc, số liệu, tiếng động, giọng, nhãn AI |
| `./reel snap <tên> [--at=…]` | Dựng + kiểm bố cục/tương phản + so nền các cảnh + chụp khung `out/snap/<tên>/` |
| `./reel bang <tên>` | Bảng khung chính có số (`dung-rieng/bang-canh.txt` → `out/snap/<tên>/bang/bang-canh.png`) |
| `./reel preview <tên>` / `--stop` | Bản xem thử ở cổng 3002 |
| `./reel render <tên>` | Xuất `out/<tên>.mp4`: lint + check, −14 LUFS, kiểm chuẩn xuất, đứng hình, lặng trước vỡ lẽ, chuyển hình trên phách |
| `./reel make <tên>` | validate → build → render |
| `./reel post <tên>` | Soạn `post.md`: caption, hashtag, credit nhạc, nhãn AI |
| `./reel music:fetch` / `music:add` / `music:page` / `music:intro` | Tải nhạc theo manifest; thêm nhạc MKT tự tìm; trang nghe thử; đo đoạn dạo đầu |
| `./reel lint:brand` / `lint:music` | Chặn màu, font viết cứng; kiểm thư viện nhạc và license |
| `./reel test` / `typecheck` | Unit test (Vitest) / kiểm kiểu |
| `./reel test:render [--update] [--only=…]` | So khung hình 8 mẫu × 19 phong cách với ảnh chuẩn `tests/baseline/` (~45 phút) |
| `./reel test:e2e [--draft]` | Dựng + xuất 21 brief mẫu trong `tests/fixtures/briefs/` |
| `./reel gen:sfx` / `gen:test-music` | Sinh lại bộ tiếng động `brand/sfx/` / nhạc thử |

Cờ chung: `--draft` (xuất nhanh), `--safe-zone` (hiện vùng an toàn khi xem thử), `--test-music` (nhạc thử, không đăng).

Thử nhanh đường mẫu có sẵn: `./reel make _example`.

### Cấu trúc
```
CLAUDE.md          quy tắc cho Claude Code: chế độ MKT (mặc định) / chế độ dev
.claude/skills/    cai-dat, tao-reel, chon-kieu-hinh, dung-video, giong-doc, dao-dien-chuyen-dong
reel               ./reel <lệnh> = pnpm run <lệnh> với Node trong ~/.redsun-reels
brand/             brand.css, frame.md, products.json, fonts/, logos/, styles/, music/manifest.json, sfx/
config/            loại video, phong cách, dịp lễ, thời lượng cảnh, giọng (voice.ts), kiểu hình AI, chi phí, schema
templates/_rieng/  bộ dụng cụ dựng riêng: rieng.js/.css (RS), nhan-vat.js (nhân vật), boi-canh.js/.css (bối cảnh)
templates/<Mẫu>/   8 mẫu dự phòng (FeatureLaunch, TipOfTheDay, BeforeAfter, Testimonial, Promo, EventRecap, Stats, TalkingHead) + _shared/
scripts/           lệnh ./reel + lib/ (validate, dựng, render, giọng, đo âm, lint…)
runtime/gsap/      GSAP local
briefs/_example/   mẫu brief (chỉ thư mục này lên GitHub; video của MKT nằm trên máy, gitignore)
tests/             unit test, fixtures/briefs/ (21 brief mẫu), baseline/ (ảnh chuẩn render test)
docs/              decisions, changelog, huong-dan-mkt, video-type-guide, video-style-catalog, music-sources, spike-report
plans/             kế hoạch theo milestone, báo cáo
out/               (gitignore) video xuất ra, ảnh soát, project tạm out/stage/
```

### Cách một video được dựng
**Dựng riêng (mặc định).** `script.json` có `"build": "custom"`:
1. `script.json`: mỗi cảnh có `role` (hook / problem / solution / proof / cta), chữ, thời lượng; `concept` khai điểm hấp dẫn (`diemHapDan`), nỗi đau (`noiDau`), giải pháp (`giaiPhap`). `validate` chặn từ bước này.
2. `briefs/<tên>/dung-rieng/index.html`: composition HyperFrames viết riêng bằng `templates/_rieng/`, kèm `tieng-dong.txt` (tiếng động theo giây, một khoảng lặng trước vỡ lẽ), `bang-canh.txt`, `loi-doc.json` + `giong/*.wav` (giọng đọc), clip `quay-san/` (người thật).
3. Bước dựng chép composition, bộ dụng cụ, brand, nhạc, giọng vào `out/stage/<tên>/`, thay `<!-- TIENG-DONG -->` bằng thẻ audio, ghi đường hạ nhạc khi có giọng.
4. `hyperframes render --strict`, chuẩn hoá −14 LUFS / đỉnh ≤ −1 dBTP, kiểm 1080×1920 · 30fps · H.264 · AAC 48 kHz bằng ffprobe, đo đứng hình, lặng trước vỡ lẽ, chuyển hình trên phách.

**Mẫu có sẵn (dự phòng).** Không có `build`: `build-props.ts` ghi `props.json` theo mẫu và preset phong cách, `templates/_shared/scene-kit.js` dựng các khối. Dùng khi MKT cần gấp hoặc dựng riêng lỗi mãi.

### Quy tắc khi sửa template, bộ dụng cụ
- Chỉ dùng biến trong `brand/brand.css`; `./reel lint:brand` chặn màu, font viết cứng.
- Nền và mọi lớp phủ là **clip có timing**; video là clip riêng nằm trực tiếp trong root.
- Mỗi composition đăng ký `window.__timelines["main"]`. Chỉ `tl.fromTo`, không `Math.random` (dùng `RS.rng`).
- Chữ NFC, trang `lang="vi"`, gán chữ bằng `textContent`.
- Đổi giao diện có chủ ý: xem lại bằng mắt, rồi `./reel test:render --update --only=…`.
- **Trước khi tạo skill mới**, kiểm kê skill đã cài (gồm plugin HyperFrames), xem `docs/decisions.md` mục 6.

### Nâng version HyperFrames
Chỉ Nam được nâng: đổi version trong `package.json` và tag plugin, chạy `./reel test`, `./reel test:render`, `./reel test:e2e`, ghi version mới vào `docs/decisions.md`.

### Đánh dấu bản mới
Tăng `version` trong `package.json` (trước 1.0: tính năng mới tăng số giữa, sửa lỗi tăng số cuối), chuyển mục "Chưa phát hành" của `docs/changelog.md` thành mục bản mới, gắn tag `vX.Y.Z`, tạo trang Release trên GitHub từ mục đó.

### Lưu ý máy dev
- Hook trên máy dev chặn lệnh Bash chứa `vendor`, `node_modules`, `.git`, `.venv`: GSAP nằm ở `runtime/`, script lấy đường dẫn package qua `require.resolve`.
- Không commit `.env`, khoá API, clip quay sẵn, hình MKT, brief của video thật.
