# REQUIREMENTS — redsun-reels

> Hệ thống sản xuất video Reel/TikTok/Shorts nội bộ cho team Marketing Redsun, vận hành bằng Claude Code + HyperFrames.
> Phiên bản: 0.6 — Owner: Vũ Đức Nam (CTO) — Trạng thái: Draft
> 0.2: đổi nền tảng render từ Remotion sang HyperFrames (Apache 2.0), thêm Spike M0.
> 0.3: danh sách provider TTS giọng nữ tiếng Việt (mục 8.2), quy trình nghe mù chọn giọng trong Spike S3.
> 0.4 (2026-10-08, sau Spike M0.1, xem `docs/spike-report.md` và `docs/decisions.md`):
> - **Bỏ lồng tiếng / TTS.** Mọi video dùng nhạc nền + chữ trên màn hình.
> - Nền tảng máy MKT là macOS Intel + Apple Silicon, không phải Windows. Claude Code tự cài môi trường cho MKT.
> - Chọn phương án A (variables native).
> - Thêm loại video và phong cách. Thời lượng cảnh tính từ độ dài chữ.
> - Font Montserrat, màu lấy từ logo, nguồn nhạc Pixabay Music + Mixkit, loudness −14 LUFS.
> - Thêm 3 template (EventRecap, Stats, TalkingHead) ở M4 cho 5 loại video còn lại. Nam là dev maintainer.
> - Quy trình kịch bản:
>   - Bước concept 3 hướng hook.
>   - Vai trò cảnh Hook → Problem → Solution → Proof → CTA.
>   - Claude tự chấm ≥ 85/100.
>   - Danh sách cần quay/chụp.
>   - Caption + hashtag khi xuất.
>   - Tham khảo bài claude.vn "Claude viết kịch bản video và quảng cáo" và repo charlie947/social-media-skills (MIT): `reels-scripting`, `hook-generator`.
> - Bản v0.3 lưu tại `docs/requirements-history/REQUIREMENTS-v0.3.md`.
> 0.5 (2026-10-10, Nam cho phép): **video có người thật do AI tạo**, bắt buộc gắn nhãn nội dung AI theo Luật Trí tuệ nhân tạo 2025 và Nghị định 142/2026/NĐ-CP (mục 7.4). Cho phép API key cloud cho riêng việc tạo cảnh AI (mục 3). Thêm kiểu hình **người thật quay sẵn** từ Pexels/Pixabay (mục 7.5). MKT chọn kiểu hình cho từng video (skill `chon-kieu-hinh`). Vẫn không lồng tiếng, không nhạc AI. Bản v0.4 lưu tại `docs/requirements-history/REQUIREMENTS-v0.4.md`.
> 0.6 (2026-10-10, Nam: "chủ thể là người châu Á, có giọng đọc đầy cảm xúc, giảm chữ"; "giọng nữ miền Nam, mỗi nhân vật 1 giọng"; duyệt giọng nghe thử): **có giọng đọc AI** cho video dựng riêng có nhân vật nói (mục 8.5), gắn nhãn "giọng đọc do AI tạo"; chữ trên hình giảm còn câu nhấn + phụ đề nhỏ; người lộ mặt trong clip quay sẵn phải là **người châu Á** (mục 7.5); clip quay sẵn tải lại được trên máy khác theo sổ nguồn. Vẫn không nhạc AI, không giọng clone. Bản v0.5 lưu tại `docs/requirements-history/REQUIREMENTS-v0.5.md`.
> 0.6 bổ sung (2026-10-10 tối, Nam): **LUẬT SỐ 1 — 3 giây đầu** chặn từ bước kịch bản (mục 6.2); **LUẬT SỐ 2 — nỗi đau → giải pháp** (mục 6.2); **reel 15–30 giây** là luật cứng; mặc định **một giọng kể** (mục 8.5); video hoạt hình có giọng không thêm phụ đề theo giọng.

---

## 0. Hướng dẫn cho Claude Code (đọc trước)

- Đây là tài liệu yêu cầu gốc. Mọi quyết định thiết kế phải bám tài liệu này; nếu cần lệch, **dừng lại và hỏi**, không tự quyết.
- Làm theo **Milestone** ở mục 15. Xong mỗi milestone phải pass toàn bộ Acceptance Criteria của nó rồi mới sang milestone tiếp theo.
- Các mục đánh dấu `[TBD]` là chưa chốt: dùng giá trị mặc định ghi kèm, đặt trong config, không hard-code.
- Các mục đánh dấu `[VERIFY]` là giả định chưa kiểm chứng. Nếu tài liệu chính thức nói khác tài liệu này, theo tài liệu chính thức và ghi lại vào `docs/decisions.md`.
- Plugin HyperFrames cho Claude Code: cài theo `docs/decisions.md` mục 2. Dùng tarball đúng tag thành marketplace local, **không** dùng `claude plugin marketplace add heygen-com/hyperframes` vì lệnh này lỗi clone trong Spike. Tên skill có namespace: `/hyperframes:hyperframes`, `/hyperframes:hyperframes-core`, `/hyperframes:hyperframes-creative`, `/hyperframes:hyperframes-registry`, `/hyperframes:hyperframes-animation`, `/hyperframes:hyperframes-cli`, `/hyperframes:media-use`. Đọc router `/hyperframes:hyperframes` trước khi viết composition.
- **Kiểm kê skill có sẵn trước khi tạo skill mới**: liệt kê skill đã cài (plugin HyperFrames, `.claude/skills/`, skill cấp user) và ghi vào `docs/decisions.md` mục 6 skill nào đáp ứng phần nào. Skill mới chỉ giữ quy trình riêng của Redsun; kiến thức HyperFrames thì trỏ sang skill của plugin.
- **Pin version**: ghi version CLI + plugin đang dùng vào `package.json` và `docs/decisions.md`. Không tự nâng version khi chưa hỏi. Hiện pin: HyperFrames `0.8.141` (CLI + plugin tag `v0.8.141`), pnpm `10.34.6`.
- Không thêm dependency ngoài danh sách mục 3 nếu chưa hỏi.

---

## 1. Bối cảnh & mục tiêu

### 1.1 Bối cảnh
Redsun Ecosys có 3 sản phẩm:
- **SIPOS**: SaaS quản lý bán hàng cho F&B, bán lẻ, dịch vụ.
- **Redsun BOS**: phần mềm vận hành doanh nghiệp, tự gọi là "hệ điều hành doanh nghiệp". Không gọi là "ERP" trong nội dung video.
- **Webino**: AI website builder.

Team MKT cần sản xuất đều đặn video ngắn dọc 9:16 cho Facebook Reels, TikTok, YouTube Shorts, Instagram Reels. Video **chỉ đăng tự nhiên (organic)**, không chạy quảng cáo trả tiền. Hiện làm thủ công bằng CapCut, chậm, không đồng nhất brand.

### 1.2 Mục tiêu
1. Người MKT **không biết code** tạo được 1 reel đúng brand trong **≤ 15 phút** từ lúc viết brief đến lúc có MP4.
2. Mọi video dùng chung brand system: màu, font, logo, nhạc, phong cách chuyển động. Đi qua template thì không thể "lệch brand".
3. Claude Code là "người dựng": đọc brief → chọn loại video + phong cách → viết kịch bản chữ trên màn hình → điền dữ liệu vào template → render.
4. Video truyền tải bằng hình ảnh, chữ trên màn hình và nhạc nền; video dựng riêng có nhân vật nói thì có **giọng đọc AI đầy cảm xúc** (mục 8.5), chữ trên hình giảm còn câu nhấn + phụ đề.

### 1.3 Vì sao HyperFrames
- **Apache 2.0**: không phí license, không giới hạn thương mại. Tầng render này có thể tái dùng cho sản phẩm thương mại khác của công ty.
- **HTML-native**: composition là HTML + data attributes + animation seekable (GSAP/CSS…). Claude viết HTML ổn định hơn React frame-math.
- **Agent-first**: có plugin Claude Code, CLI non-interactive, có `lint`/`check`/`snapshot` để agent tự kiểm tra (đã xác nhận ở Spike S7).
- **Có sẵn**: catalog 392 block/component (transition, typography, overlay, caption-style…), variables native, chuẩn hóa loudness, `frame.md` cho design system.

### 1.4 Nguyên tắc thiết kế
- **Template-first**: Claude điền dữ liệu vào template có sẵn. Chỉ tạo composition mới khi MKT yêu cầu rõ và được duyệt. HyperFrames cho phép agent viết HTML tự do rất dễ, nên đây là ràng buộc **quan trọng nhất** để giữ brand. Phong cách (mục 7.3) là preset áp lên template, không phải template mới.
- **Repo không tự gọi LLM**: phần "suy nghĩ" (kịch bản, chọn loại video, phong cách, chia cảnh) do phiên Claude Code đảm nhận. Code trong repo chỉ validate, build, render.
- **Deterministic render**: cùng một `props.json` → cùng một video. Font, GSAP và nhạc phải có bản local, không tải từ mạng lúc render (mục 5.1).
- **Mọi thứ có thể diff**: brief, kịch bản, props, composition sinh ra đều là file text trong git.
- **Render local**: không dùng cloud render của bên thứ ba ở MVP.

---

## 2. Người dùng & phạm vi

### 2.1 Người dùng
| Vai trò | Việc làm | Kỹ năng | Máy |
|---|---|---|---|
| MKT executor | Viết brief, chạy Claude Code, duyệt preview, xuất video | Không biết kỹ thuật; dùng Claude Code | MacBook Intel hoặc Apple Silicon |
| MKT lead | Duyệt video, quản lý brand asset, chọn nhạc và giữ bằng chứng license | Không code | MacBook |
| Dev maintainer (Nam) | Thêm/sửa template, sửa lỗi render, nâng version HyperFrames | HTML/CSS/JS, TypeScript | macOS |

### 2.2 Trong phạm vi (MVP)
- Video dọc 1080×1920, 7–60 giây.
- 8 template: 2 ở M1, 3 ở M3, 3 ở M4 (mục 7.1).
- **Loại video** (mục 7.2) và **phong cách** (mục 7.3). MKT tự chọn phong cách; mỗi loại video có phong cách mặc định.
- Chữ tiếng Việt trên màn hình, có animation; thời lượng mỗi cảnh tính từ độ dài chữ.
- Nhạc nền từ thư viện nội bộ có license (mục 8).
- Giọng đọc AI cho lời thoại nhân vật (video dựng riêng): giọng nữ miền Nam, mỗi nhân vật một giọng, nhãn AI (mục 8.5, skill `giong-doc`).
- Clip quay thật có tiếng người (khách hàng, người nói trước camera) được giữ âm thanh gốc. Đây không phải lồng tiếng.
- Preview trên trình duyệt (`hyperframes preview`), render local ra MP4.
- Skill Claude Code `cai-dat` (cài môi trường cho MKT) và `tao-reel` (dẫn MKT qua toàn bộ quy trình).
- **Kiểu hình** của mỗi video do MKT chọn (`kieuHinh` trong brief, skill `chon-kieu-hinh`): `minh-hoa` (nhân vật, bối cảnh vẽ), `nguoi-that-ai` (cảnh người thật do AI tạo, luôn gắn nhãn AI, mục 7.4), `nguoi-that-quay-san` (clip người thật quay sẵn từ Pexels/Pixabay, mục 7.5).

### 2.3 Ngoài phạm vi (MVP)
- Giọng clone người thật, bắt chước giọng người nổi tiếng, thu âm voice-over. Giọng đọc AI cho video theo mẫu có sẵn (chỉ video dựng riêng có giọng).
- Tự đăng bài lên mạng xã hội. Chạy quảng cáo trả tiền.
- Nhạc tạo bằng AI (MusicGen, Suno…). Nhạc vẫn chỉ lấy từ thư viện có license (mục 8).
- Tạo bằng AI: người giống người thật có danh tính (người nổi tiếng, nhân viên, khách hàng), màn hình sản phẩm, logo (mục 7.4).
- Chế độ "sáng tạo tự do" dùng các creation workflow của HyperFrames (`/hyperframes:general-video`, `/hyperframes:faceless-explainer`…) cho MKT. → Phase sau, sau khi template ổn định.
- Web UI riêng cho MKT.
- Render trên cloud (HeyGen cloud render, AWS Lambda).
- Video ngang 16:9.
- Windows.

---

## 3. Tech stack & ràng buộc

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Runtime | Node.js 22+ (pin `v22.23.3` cho máy MKT) | Yêu cầu của HyperFrames. Claude Code tải tarball chính thức, không cần sudo (mục 10.1) |
| Render | HyperFrames CLI `hyperframes@0.8.141` (devDependency, exact) | Apache 2.0 |
| Encoder | FFmpeg qua `ffmpeg-static` + `ffprobe-static` (devDependency) | Bỏ được Homebrew. Trỏ bằng `HYPERFRAMES_FFMPEG_PATH` / `HYPERFRAMES_FFPROBE_PATH`. Binary GPL, chỉ dùng nội bộ |
| Trình duyệt render | Chrome có sẵn, hoặc HyperFrames tự tải (`hyperframes browser ensure`) | |
| Animation | GSAP (adapter mặc định của HyperFrames), copy bản local vào repo | Kiểm tra license GSAP hiện hành trước khi chốt |
| Ngôn ngữ script | TypeScript strict (cho `scripts/`) | Composition là HTML/CSS/JS thuần |
| Validate schema | zod | Cho brief, script, props, config |
| Template engine | **Không dùng** | Spike S4 chọn phương án A (variables native), mục 6.4 |
| Âm thanh | Nhạc nền từ `brand/music/` (mục 8); `hyperframes normalize-audio`; giọng đọc AI VieNeu (mục 8.5) | Không transcription; giọng tạo trước, lưu file trong repo, render không gọi mạng |
| Package manager | pnpm `10.34.6` qua corepack (`packageManager` trong `package.json`) | pnpm 12 không chạy được qua corepack. Cần `pnpm.onlyBuiltDependencies: ["esbuild", "ffmpeg-static"]` |
| Lint/format | ESLint + Prettier cho `scripts/`; `hyperframes lint` + `hyperframes check` cho composition | |
| Test | Vitest | Cho schema, pipeline, utils |

Ràng buộc:
- Chạy được trên **macOS Intel và Apple Silicon** (máy team MKT). Đã kiểm trên Intel; Apple Silicon `[VERIFY]` khi có máy.
- Không yêu cầu GPU.
- API key cloud chỉ dùng cho việc tạo cảnh AI (mục 7.4, `GEMINI_API_KEY`) và giọng đọc AI (mục 8.5, `VIENEU_API_KEY`). Key nằm trong `.env` (trong `.gitignore`), `.env.example` chỉ có tên biến; không in key ra log, không commit. Nam quản lý key và mức chi. Mọi phần khác (dựng, render, kiểm) vẫn chạy local, không cần key; video đã có giọng dựng được trên máy không có key. `./reel doctor` báo máy có/không có key (không in key).
- Cài đặt máy MKT: không sudo, không Homebrew, không trình cài GUI, không cần tài khoản (mục 10.1).
- Không bật auto-update plugin HyperFrames trên máy MKT. Marketplace local cố định theo tag. Chỉ Nam được nâng version, sau khi chạy lại render test.

---

## 4. Cấu trúc thư mục

```
redsun-reels/
├── CLAUDE.md                   # Rule cho Claude Code (mục 11)
├── REQUIREMENTS.md             # Tài liệu này
├── README.md                   # Hướng dẫn cho MKT: mở Claude Code, nói "cài đặt giúp tôi"
├── docs/
│   ├── decisions.md            # Quyết định kỹ thuật, version đã pin, lệch so với REQUIREMENTS
│   ├── spike-report.md         # Báo cáo Spike M0
│   ├── video-type-guide.md     # Loại video → template, cấu trúc, phong cách mặc định
│   ├── video-style-catalog.md  # 19 phong cách + lịch dịp lễ
│   ├── music-sources.md        # Nguồn nhạc được phép + quy trình nhập nhạc
│   └── requirements-history/   # Các bản REQUIREMENTS cũ
├── .claude/
│   ├── settings.json           # bật plugin hyperframes, allowlist quyền cho skill cai-dat
│   └── skills/
│       ├── cai-dat/SKILL.md    # Cài môi trường cho MKT (mục 10.1)
│       └── tao-reel/SKILL.md   # Quy trình tạo reel (mục 10.2)
├── config/
│   ├── video-types.ts          # Loại video: template, độ dài, cấu trúc, phong cách mặc định/nên tránh
│   └── styles.ts               # Danh sách phong cách hợp lệ + trạng thái duyệt
├── brand/
│   ├── frame.md                # Design system cho video (chuẩn HyperFrames)
│   ├── brand.css               # CSS variables sinh từ / đồng bộ với frame.md
│   ├── products.json           # Cấu hình theo sản phẩm: SIPOS / BOS / Webino / Redsun
│   ├── styles/                 # Preset phong cách: <id>.json hoặc <id>.css
│   ├── fonts/                  # Montserrat (OFL), bản local
│   ├── logos/
│   └── music/                  # Nhạc đã có license + manifest.json (mục 8)
├── runtime/                    # GSAP bản local (runtime/gsap/)
├── assets/
│   ├── sipos/                  # screenshot, screen record, ảnh
│   ├── bos/
│   └── webino/
├── templates/
│   ├── _shared/                # sub-composition + CSS dùng chung (safe-zone.css…) (mục 7)
│   ├── _blank/                 # composition trống để kiểm môi trường (M0.2)
│   ├── FeatureLaunch/
│   │   ├── index.html          # composition gốc (root KHÔNG khai data-duration)
│   │   ├── template.schema.ts  # zod schema cho props của template
│   │   └── fixture.props.json
│   ├── TipOfTheDay/
│   ├── BeforeAfter/
│   ├── Testimonial/
│   ├── Promo/
│   ├── EventRecap/
│   ├── Stats/
│   └── TalkingHead/
├── briefs/
│   ├── _example/
│   └── 2026-10-08-sipos-tinh-nang-kho/   # mỗi video 1 thư mục (mục 6.3)
├── scripts/
│   ├── new.ts                  # Tạo thư mục brief
│   ├── validate.ts             # Validate brief/script/props/assets/nhạc
│   ├── build.ts                # brief + script + nhạc → props.json (timing cảnh theo độ dài chữ)
│   └── render.ts               # gọi hyperframes render --variables-file + kiểm tra output
└── out/                        # Gitignored; out/stage/<tên>/ = project tạm cho preview/render
```

---

## 5. Brand system

### 5.1 `brand/frame.md`
Nguồn sự thật duy nhất cho định hướng thị giác, viết theo chuẩn `frame.md` của HyperFrames (đọc skill `/hyperframes:hyperframes-creative`). Nội dung bắt buộc:
- **Bảng màu**: primary, secondary, accent, background, text, textInverse. Tách "màu logo" khỏi "màu nền". Giá trị theo mục 5.3.
- **Typography: Montserrat** cho mọi thương hiệu (Google Fonts, SIL OFL, đủ dấu tiếng Việt, đã kiểm ở Spike S2). Thang cỡ chữ cho canvas 1080×1920. Font file nằm ở `brand/fonts/`, không tải từ Google Fonts lúc render.
- Quy tắc chuyển động: tốc độ vào/ra, easing, mức "năng lượng". Mỗi phong cách (mục 7.3) là một biến thể của quy tắc này.
- Quy tắc bố cục: lưới, lề, safe zone (5.4).
- Những điều cấm: gradient cầu vồng, quá 2 font, text chạy chéo.
- Logo: **dùng thẳng file logo có sẵn** trong `brand/logos/`, không vẽ lại và không chỉnh màu. Gradient chỉ xuất hiện trong chính file logo (Webino, Redsun BOS); không dùng gradient đó cho nền hay chữ (Nam chốt 2026-10-08).

### 5.2 `brand/brand.css`
CSS custom properties (`--color-primary`, `--font-heading`, `--type-hero`…). Mọi template, sub-composition và preset phong cách **chỉ** dùng các biến này. Cấm hard-code màu, font, cỡ chữ trong template. Có script/lint kiểm tra (mục 13). `hyperframes lint` không bắt lỗi này, nên phải tự viết.

### 5.3 `brand/products.json`
Mỗi sản phẩm có: tên hiển thị, logo, màu, tagline, CTA mặc định, hashtag mặc định. Template nhận `product: "sipos" | "bos" | "webino" | "redsun"` (đặt `data-product` trên root) và lấy cấu hình tương ứng.

| Sản phẩm | Màu chính | Màu nhấn / phụ | Logo chuẩn | Trạng thái |
|---|---|---|---|---|
| SIPOS | `#0B4B54` | `#E30000` | `Logos/Sipos_Logo/Logo_green-01.png` + `Sipos_logo.pdf` | Nam đã chốt |
| Redsun (công ty) | `#BA0000` | `#EBAB32`, xám `#58595B` | `Logos/Redsun_Logo/Redsun_logo.pdf` | Lấy từ logo (Nam chốt) |
| Webino | `#00B2DB` | tím `#5B1A9A` | `Logos/Webino_Logo/Logo.png` (và bản trắng, icon) | Lấy từ logo (Nam chốt) |
| Redsun BOS | `#D1262D` | mận `#3D0023`, vàng `#EAAE2D`, xanh `#44649B`, chữ logo `#0C4559` | `Logos/REDSUN BOS_Logo/Logo Redsun BOS-sáng.png` / `-tối.png` | Lấy từ logo (Nam chốt) |

Tên đọc liền như một từ: SIPOS, REDSUN, REDSUN BOS. Chữ trên màn hình luôn viết hoa đúng tên sản phẩm.

### 5.4 Safe zone
Reels/TikTok che một phần màn hình bằng UI. Text quan trọng phải nằm trong safe zone:
- Top: chừa 220px
- Bottom: chừa 420px
- Phải: chừa 160px
- Trái: chừa 80px

Dùng chung cho TikTok, Reels, Shorts (mức chừa rộng). Nếu thực tế bị che thì chỉ sửa biến trong `brand.css`.

Giá trị đặt trong `brand.css`. Sub-composition `safe-zone.html` chỉ hiển thị khi preview với cờ debug, **không bao giờ** xuất hiện trong bản render. `hyperframes check --caption-zone / --frame-check` dùng để kiểm tự động.

---

## 6. Data model

### 6.1 Brief (MKT viết)
File `briefs/<slug>/brief.md` với YAML frontmatter:

```yaml
---
product: sipos                 # sipos | bos | webino | redsun (video công ty: giới thiệu, tuyển dụng)
videoType: ra-mat-tinh-nang    # id trong config/video-types.ts, hoặc "auto" để Claude đề xuất
style:                         # tùy chọn: bỏ trống = mặc định của videoType; "auto" = Claude đề xuất
occasion:                      # tùy chọn: dịp lễ (tet, 14-2, 8-3, 20-10…), có thể đổi phong cách mặc định
template: auto                 # thường để auto: lấy theo videoType
goal: "Giới thiệu tính năng kiểm kho bằng điện thoại"
audience: "Chủ quán F&B nhỏ, 25–45 tuổi"
duration: 30                   # giây, 15–30 (luật cứng reel), trong khoảng của videoType
tone: "nhanh, gần gũi, có chút hài"
cta: "Dùng thử miễn phí 14 ngày tại sipos.vn"
music: auto                    # id trong brand/music/manifest.json, hoặc "auto" (chọn theo mood của style)
assets:
  - assets/sipos/kiem-kho-01.mp4
  - assets/sipos/kiem-kho-02.png
---
Nội dung tự do: ý chính, thông điệp, điều cần tránh, link tham khảo video mẫu…
```

### 6.2 Script (Claude Code viết)
`briefs/<slug>/script.json`, validate bằng zod:

```ts
const Scene = z.object({
  id: z.string(),
  role: z.enum(['hook', 'problem', 'solution', 'proof', 'cta']),
  onScreenText: z.string().max(80),          // chữ chính của cảnh
  subText: z.string().max(120).optional(),   // dòng phụ (nếu template có)
  visual: z.object({
    type: z.enum(['asset', 'text', 'phone', 'split', 'logo']),
    src: z.string().optional(),
  }),
  transition: z.string().optional(),         // kiểu chuyển cảnh sang cảnh sau (theo phong cách)
  durationSec: z.number(),                   // Claude tính từ độ dài chữ (mục 6.2), build.ts kiểm lại
});
const Script = z.object({
  concept: z.object({ title: z.string(), bigIdea: z.string(), hookAngle: z.string() }),
  videoType: z.string(),
  style: z.string(),
  template: z.string(),
  product: z.enum(['sipos', 'bos', 'webino', 'redsun']),
  hook: z.string(),        // chữ 3 giây đầu — bắt buộc
  scenes: z.array(Scene).min(2).max(12),
  cta: z.string(),
  music: z.string(),
});
```

Rule kịch bản (đưa vào CLAUDE.md):
- **Concept trước, kịch bản sau**: Claude đưa 3 concept (tên, big idea, câu hook, phong cách gợi ý). Mỗi concept dùng một góc hook khác nhau:
  - con số
  - lật ngược định kiến
  - trước / sau
  - thương hiệu hoặc công cụ quen thuộc
  - dự báo "sắp thay đổi"
  - câu hỏi đánh vào nỗi đau

  MKT chọn 1 concept rồi mới viết `script.json`. Không dùng góc "thú nhận thất bại".
- **LUẬT SỐ 1 — 3 giây đầu** (Nam 2026-10-10: "chỉ có 03s đầu tiên để thu hút người xem"; "luật 3 giây đầu phải là mạnh nhất"), đứng trên mọi luật khác:
  - Chọn **điểm hấp dẫn nhất trong brief** bằng bảng chấm 5 tiêu chí (thấy ngay, người xem thấy mình, tò mò, cụ thể, đúng và nối được sản phẩm; mỗi tiêu chí 1–5, tổng 25) ghi ở `concepts.md` mục `## Điểm hấp dẫn` (skill `tao-reel`, `references/chon-diem-hap-dan.md`). Hook ≥ 20/25.
  - **Mở bằng điểm mạnh nhất, kể lại sau** (được đảo thứ tự cảnh của brief, giữ đủ ý, lời nói và điều cấm). Khung giây 0 là hình mạnh nhất; biến động trong 1 giây đầu trên phách; có giọng thì câu hook bắt đầu ≤ 0,3 giây.
  - Chữ hook: **≤ 8 từ, ≤ 40 ký tự mỗi dòng, tối đa 2 dòng**; có con số thì viết bằng chữ số. Cảnh hook ≤ 3,5 giây.
  - **Chặn từ bước kịch bản**: `script.json` khai `concept.diemHapDan { ungVien, diem }`; validate chặn khi thiếu, dưới 20, thiếu bảng chấm, cảnh hook dài, hook quá 8 từ, thiếu "Hook N/25" trong tự chấm.
- **LUẬT SỐ 2 — nỗi đau → giải pháp** (Nam 2026-10-10: "phải nổi bật được nỗi đau của khách hàng và cách sản phẩm chúng ta giải quyết nó"): mọi video bán giải pháp nêu một nỗi đau cụ thể của khách (từ brief, có hậu quả) và cho thấy sản phẩm giải quyết nó thế nào (chỉ tính năng có trong brief/hồ sơ). `concept.noiDau { khach, canh }`, `concept.giaiPhap { cach, canh }`; validate chặn khi thiếu, sai thứ tự, giải pháp bắt đầu sau 70% video hoặc ngắn hơn 20% video. Miễn: lời chúc, teaser, tổng kết, tuyển dụng, thông báo, không khí quán, khoe số (`NO_PAIN_TYPES`).
- **Chủ động hỏi MKT** (Nam 2026-10-10): trước khi viết concept và sau khi tự chấm, brief thiếu thông tin để đạt LUẬT SỐ 1/2 (hook, nỗi đau, tính năng giải quyết) hoặc thiếu số liệu thì hỏi một lần (≤ 5 câu, có lựa chọn), không tự lấp; MKT được chọn làm bản tạm.
- **Vai trò cảnh** theo khung Hook → Problem → Solution → (Proof) → CTA. Thứ tự mặc định theo loại video ở `config/video-types.ts`, ví dụ Khuyến mãi bỏ Problem.
- **Ít ý**: video ≤ 45 giây chỉ 1–2 ý chính; video dài hơn tối đa 3 ý. Mỗi video một thông điệp.
- Không có lời đọc, nên chữ là kênh truyền tải chính:
  - `onScreenText` ≤ 10 từ, một ý mỗi cảnh.
  - **Thời lượng mỗi cảnh = số giây cố định do Claude tính từ độ dài chữ** (Nam chốt 2026-10-08). Công thức: `durationSec = max(tối thiểu, số từ (onScreenText + subText) × giây/từ) + thời gian animation vào`, làm tròn 0.1s. Tham số (Nam chốt): **0.4 giây/từ, tối thiểu 1.5 giây, animation vào 0.5 giây**, đặt trong config. `build.ts` báo lỗi nếu cảnh ngắn hơn công thức.
- Tổng thời lượng khớp `duration` ±10% và nằm trong khoảng của `videoType` giao với **15–30 giây** (luật cứng reel, Nam 2026-10-10: video 15–30 giây dễ được xem hết, thuật toán phân phối rộng hơn; `REEL_SEC` trong `config/video-types.ts`).
- Không hứa hẹn tính năng không có trong brief. Không dùng giá/khuyến mãi không có trong brief.
- Redsun BOS gọi là "hệ điều hành doanh nghiệp" / "phần mềm vận hành doanh nghiệp", không gọi "ERP".
- **Claude tự chấm trước khi đưa MKT duyệt.** Thang điểm (tổng 100):

  | Tiêu chí | Điểm |
  |---|---|
  | Hook | 25 |
  | Một thông điệp rõ | 20 |
  | Chữ đọc kịp theo công thức thời lượng | 20 |
  | Đúng brand và đúng sự thật trong brief | 20 |
  | CTA rõ | 15 |

  Mỗi điểm phải kèm bằng chứng. Sửa và chấm lại tối đa 3 vòng. **Ngưỡng ≥ 85/100.** Chưa đạt thì báo rõ lý do, không nâng điểm.
- Phong cách `vui-nhon` hoặc kịch bản có chơi chữ: luôn ghi chú MKT đọc lại câu chữ, vì hài kiểu Việt cần người Việt chỉnh.

### 6.3 Thư mục một video
```
briefs/2026-10-08-sipos-tinh-nang-kho/
├── brief.md          # MKT viết
├── script.json       # Claude viết, MKT duyệt
├── concepts.md       # 3 concept Claude đề xuất + concept MKT chọn
├── shotlist.md       # chỉ khi thiếu asset: danh sách cần quay/chụp
├── props.json        # dữ liệu cuối cho template (variables)
├── post.md           # caption + hashtag + credit nhạc (nếu cần), soạn khi xuất
├── review.md         # ghi chú duyệt / yêu cầu sửa
└── cost.json         # thời gian render, nhạc đã dùng
```

### 6.4 Từ props đến video (phương án A — đã chốt ở Spike S4)
- Template khai `data-composition-variables` trên `<html>`, dùng `data-var-text` / `data-var-src`, đọc logic qua `window.__hyperframes.getVariables()`.
- `build.ts` chỉ ghi `props.json`. `render.ts` dựng project tạm `out/stage/<slug>/` (copy template, `_shared`, `brand/`, `runtime/`, nhạc), vì HyperFrames không đọc asset ngoài thư mục project. Sau đó gọi `hyperframes render out/stage/<slug> --variables-file props.json --strict-variables`.
- Nền và lớp phủ phải là clip có timing (`class="clip"`); không đặt nền trên root.
- Bắt buộc:
  - Root composition **không** khai `data-duration`. Thời lượng root bị khóa lúc compile; bỏ đi thì renderer tự tính từ các clip.
  - Danh sách cảnh truyền dưới dạng **chuỗi JSON**, vì variables không có kiểu mảng. zod validate trước khi stringify.
  - Text đưa vào DOM bằng `textContent`, không dùng `innerHTML`.
  - Biến `style` (enum) chọn preset phong cách.
- Timing cảnh: theo `durationSec` trong script, tính từ độ dài chữ (6.2). Không căn cảnh theo nhịp nhạc.
- `template.schema.ts` là hợp đồng props của template, validate trước khi build.
- Composition phải pass `hyperframes lint` và `hyperframes check`.

---

## 7. Đặc tả template, loại video, phong cách

### 7.1 Template
Chung cho mọi template:
- 1080×1920, 30fps.
- Cấu trúc: Hook (0–3s) → Body (n cảnh) → CTA + logo outro (2–3s).
- Chữ trên màn hình luôn nằm trong safe zone, có animation theo phong cách, đọc được (tương phản WCAG AA, `hyperframes check`).
- Nhạc nền fade in/out 0.5s, chuẩn hóa loudness (mục 9.1). Clip có tiếng người thật: giữ âm thanh gốc, nhạc nền hạ thấp bằng automation volume.
- Logo sản phẩm góc trên trái suốt video (tắt được bằng prop).
- Ưu tiên dùng block trong catalog HyperFrames (`hyperframes add …`, skill `/hyperframes:hyperframes-registry`) cho transition, chữ, overlay, chart thay vì tự viết. Block nào dùng phải ghi vào `docs/decisions.md` và style lại theo `brand.css`.
- Mỗi template phải chạy được với mọi phong cách (biến `style`).

| Template | Milestone | Mục đích | Cảnh đặc thù |
|---|---|---|---|
| **FeatureLaunch** | M1 | Giới thiệu tính năng mới | Phone mockup chứa screen record, callout chỉ vào UI, zoom vào vùng quan trọng |
| **TipOfTheDay** | M1 | Mẹo dùng phần mềm, dạng "Bạn có biết?" | Số thứ tự mẹo, các bước 1-2-3 |
| **BeforeAfter** | M3 | Trước/sau khi dùng sản phẩm | Split screen hoặc wipe transition, nhãn TRƯỚC/SAU |
| **Testimonial** | M3 | Khách hàng nói | Ảnh/video khách, quote lớn, tên + cửa hàng (lower third) |
| **Promo** | M3 | Khuyến mãi, sự kiện, dịp lễ | Countdown/hạn chót, giá gạch ngang, badge |
| **EventRecap** | M4 | Tổng kết sự kiện, giới thiệu công ty, tuyển dụng / văn hóa | Montage ảnh/video thật, chữ tiêu đề lớn, nhịp cắt nhanh |
| **Stats** | M4 | Số liệu / thành tích | Con số đếm lên, biểu đồ, 2–3 chỉ số |
| **TalkingHead** | M4 | Video có người nói trước camera (MKT tự quay) | Giữ âm thanh gốc, chữ nhấn ý chính, lower third, overlay |

Khối dùng chung (`templates/_shared/scene-kit.js` + `kit.css`): hook, chữ cảnh (tự co cỡ khi dài), phone frame, callout + zoom, lower third (M3), CTA outro, logo bug, safe zone. Làm dưới dạng thư viện JS/CSS vì số cảnh động (xem `docs/decisions.md` mục 9).

### 7.2 Loại video
Chi tiết ở `docs/video-type-guide.md`, cấu hình ở `config/video-types.ts`. Có 20 loại; 15 loại chạy trên 5 template M1–M3:
- `ra-mat-tinh-nang`, `demo-san-pham`
- `meo-hay`, `huong-dan-nhieu-buoc`
- `truoc-sau`, `so-sanh`
- `khach-hang-noi`, `khuyen-mai`, `dem-nguoc`, `chuc-mung-dip-le`, `su-kien-webinar`
- `trend-meme`, `cau-hoi-thuong-gap`, `thong-bao`, `thu-gian-asmr`

Mỗi loại khai: template, độ dài min/max, cấu trúc cảnh, mood nhạc, phong cách mặc định, phong cách nên tránh.

5 loại còn lại chạy trên 3 template M4 (Nam duyệt 2026-10-08):
- `tong-ket-su-kien`, `gioi-thieu-cong-ty`, `tuyen-dung` → EventRecap
- `so-lieu-thanh-tich` → Stats
- `video-co-nguoi-noi` → TalkingHead

### 7.3 Phong cách
Chi tiết ở `docs/video-style-catalog.md`: 19 phong cách và lịch dịp lễ Việt Nam.
- Phong cách đổi: tốc độ và easing, kiểu chuyển cảnh, cách hiện chữ, lớp phủ, mood nhạc, độ đậm màu nhấn.
- Phong cách không đổi: màu brand, font, logo, safe zone, cấu trúc Hook → Body → CTA.

Quy tắc chọn:
- **MKT tự chọn** phong cách. Bỏ trống thì dùng **mặc định của loại video**. Có `occasion` (14/2, 8/3, 20/10, Tết…) thì dùng mặc định theo dịp.
- Chọn phong cách "nên tránh" cho loại video: Claude hỏi lại một câu, MKT vẫn được giữ.
- Cả 19 phong cách đều được dùng (Nam duyệt 2026-10-08), kể cả `bi-an`, `glitch-cyberpunk`, `thu-cong`. Ba phong cách này áp guardrail ở `docs/video-style-catalog.md` §5: bí ẩn nhẹ, không máu me; giữ màu brand làm nhấn; giới hạn nhấp nháy; `thu-cong` không thêm font thứ 3.
- Thứ tự triển khai: M1 có `toi-gian`, `khuyen-mai`, `vui-nhon`; M3 có các phong cách còn lại.

### 7.4 Video người thật do AI tạo
Nam cho phép 2026-10-10. Cảnh AI là **một nguồn hình** như clip MKT gửi; kịch bản, chữ, nhạc, tiếng động, logo, CTA vẫn dựng bằng HyperFrames như mục 6–9.

**Nguồn tạo**
- Model tạo video có người trông như thật, qua API, chọn sau khi chạy thử (ứng viên: Google Veo 3.1, Kling 3.0/O3). Lớp gọi model tách riêng để đổi model mà không sửa quy trình (model hay bị ngừng, vd. Sora 2).
- Dọc 9:16, mỗi cảnh 4–8 giây, tắt tiếng của model hoặc chỉ giữ tiếng không khí (không lời nói).
- **Có trần chi mỗi video** (`config/cost.ts`; Nam 2026-10-10 đổi từ "không giới hạn" sau khi giọng đọc thử tốn 150k: "nên đặt trần cho video"): mọi lượt gọi tốn tiền cộng vào sổ của video, chạm trần thì dừng. Trần cho cảnh AI (Veo tính theo giây, đắt hơn giọng nhiều) Nam chốt khi làm M5; ghi chi phí từng cảnh vào sổ nguồn gốc.
- **Lớp gọi chung cho nhiều nhà cung cấp** (học từ MoneyPrinterTurbo, MIT): mỗi nhà cung cấp một bộ chuyển đổi cùng giao diện "gửi việc → hỏi kết quả → tải file"; mỗi model khai giới hạn của nó (thời lượng tối thiểu/tối đa, tỉ lệ khung, độ phân giải) để không gửi yêu cầu chắc chắn lỗi.
- **An toàn khi tạo cảnh tốn tiền**:
  - việc đã gửi mà không xác nhận được kết quả (mất mạng, hết thời gian chờ) → **dừng cả lượt tạo, không tự gửi lại** (có thể đã bị tính tiền), lưu mã việc để tìm lại;
  - lỗi tải file về (việc đã xong) chỉ thử tải lại, không tạo lại;
  - chỉ thử lại tự động khi nhà cung cấp báo lỗi tạm (429, 5xx) lúc hỏi kết quả;
  - mọi thông báo lỗi che API key.
- **Theo thứ tự kịch bản**: mỗi khung chính trong `bang-canh.txt` cần cảnh người thật sinh một yêu cầu tạo cảnh; cảnh xếp đúng thứ tự khung, không dồn nhiều cảnh vào một ý.

**Dàn diễn viên AI**
- Mỗi vai (chủ tiệm, nhân viên, khách…) có một bộ ảnh tham chiếu tạo một lần, MKT duyệt, lưu trong thư mục video. Mọi cảnh của vai đó tạo từ ảnh tham chiếu để giữ cùng khuôn mặt, tóc, trang phục.
- Người Việt, bối cảnh Việt, trang phục và cử chỉ đời thường; nét mặt đúng cảm xúc của cảnh.

**Không được**
- Tạo người giống người thật có danh tính: người nổi tiếng, nhân viên, khách hàng, người trong ảnh MKT gửi (trừ khi có đồng ý bằng văn bản, ghi vào brief).
- Giới thiệu nhân vật AI là khách hàng, nhân viên thật; dùng AI cho loại video `khach-hang-noi` (lời khách thật).
- Để AI vẽ màn hình sản phẩm, logo, chữ, số: màn hình SIPOS/Webino/REDSUN BOS là ảnh chụp thật hoặc lớp mô phỏng ghép bằng HyperFrames.
- Nhân vật AI mấp máy môi theo lời thoại (lip-sync). Lời thoại dùng giọng đọc AI (mục 8.5) đặt trên cảnh không thấy rõ khẩu hình, hoặc chữ/bong bóng thoại/phụ đề.
- Cảnh gây hiểu nhầm là sự kiện có thật (tin tức, thiên tai, cơ quan nhà nước…).

**Gắn nhãn nội dung AI (bắt buộc)** — Luật Trí tuệ nhân tạo 2025 (Điều 11) và Nghị định 142/2026/NĐ-CP (Điều 18, hiệu lực 01/5/2026): nội dung AI mô phỏng người thật phải có nhãn rõ ràng, dễ nhận biết, hiển thị trước hoặc ngay khi người xem tiếp cận; bên đăng ra công cộng (Redsun) chịu trách nhiệm. Video có cảnh AI có đủ:
1. **Nhãn trên hình** từ khung đầu đến hết video, trong vùng an toàn, đủ tương phản, không bị chữ/hình khác che.
2. **Dòng nhãn trong caption** (`post.md`) ngay câu đầu.
3. **Nhắc bật khai báo AI của nền tảng** khi đăng (TikTok, YouTube, Facebook/Instagram) trong `post.md`.
4. **Dấu máy đọc được**: giữ hoặc ghi lại siêu dữ liệu đánh dấu nội dung AI trong file MP4 xuất (C2PA hoặc metadata).
Câu chữ nhãn do Nam chốt. Validate **chặn xuất** khi video có cảnh AI mà thiếu nhãn trên hình hoặc nhãn trong caption.

**Kiểm chất lượng**: Claude xem từng cảnh AI trước khi ghép (tay, mặt, răng, mắt, chữ rác, vật biến dạng, người không giống ảnh tham chiếu); cảnh lỗi tạo lại trong mức chi. Bảng khung chính ghi rõ khung nào là cảnh AI.

**Lưu trữ**: ảnh tham chiếu và cảnh AI nằm trong `briefs/<tên>/ai/`, không commit lên repo công khai (như `hinh/`). **Sổ nguồn gốc** `briefs/<tên>/ai/nhat-ky.json`, mỗi cảnh một mục, chỉ ghi các trường cho phép: tên file (không ghi đường dẫn trên máy), nhà cung cấp, model và phiên bản, mô tả tạo (prompt), ảnh tham chiếu đã dùng, seed, mã việc, thời lượng, chi phí, thời điểm. Không ghi key hay thông tin tài khoản. Ghi sổ lỗi thì báo, không làm hỏng lượt tạo đã trả tiền.

### 7.5 Người thật quay sẵn (Pexels, Pixabay)
Nam cho phép 2026-10-10 (học từ MoneyPrinterTurbo). Clip/ảnh người thật **quay thật** từ kho miễn phí, dùng như clip MKT gửi; không phải AI nên không gắn nhãn AI.
- **Nguồn**: chỉ Pexels (Pexels License) và Pixabay (Pixabay Content License), link trang của đúng một clip. Nguồn khác (YouTube, TikTok, Google…) không dùng.
- **Nhận clip**: Claude mở trang clip kiểm clip không bị đánh dấu do AI tạo, xem mặt người trong đoạn dùng, rồi `./reel quay-san <tên> --link=… --tu=<giây> --dai=<giây> --ten=<file> --tac-gia=… --vai=… --nguoi=… --cam-xuc=… --chau-a --khong-phai-ai` (tự tải đúng đoạn từ Pexels, đổi về dọc 1080×1920), hoặc nhận file MKT tải (`./reel quay-san <tên> <file> …`). Clip trong `briefs/<tên>/quay-san/` không commit (giấy phép cấm phát tán lại); sổ `nguon.json` (nguồn, link, tác giả, giấy phép, vai, người mẫu, cảm xúc, người châu Á, cách cắt) **có commit**, máy khác chạy `./reel quay-san <tên> --tai-lai` để tải lại đúng đoạn.
- **Người châu Á** (v0.6): người lộ mặt trong clip phải là người châu Á (Claude xem mặt, khai `--chau-a`); cận bàn tay/sau lưng (`khong-mat`) thì không cần. Một vai một người mẫu suốt video, cảm xúc trên mặt đúng từng khung (skill `chon-kieu-hinh`).
- **Theo giấy phép** (đọc 2026-10-10):
  - không để người trong clip xuất hiện xấu, xúc phạm, đóng vai kẻ gian/lừa đảo/phạm pháp;
  - không ngụ ý họ ủng hộ sản phẩm (không gán lời khen, lời giới thiệu, không đặt như người đại diện cạnh logo);
  - không dùng gây hiểu nhầm (không gọi là khách hàng, nhân viên, đội ngũ, sự kiện của mình);
  - không dùng clip có logo/thương hiệu khác rõ ràng.
- **Cấm** các loại video cần người, lời nói, sự kiện, đội ngũ thật (cùng danh sách mục 7.4). Không trộn với cảnh AI (muốn dùng cảnh AI thì chọn kiểu `nguoi-that-ai`).
- Validate chặn: clip không có trong sổ, nguồn/link sai, thiếu tác giả, chưa kiểm hoặc là AI, thiếu vai/người mẫu/cảm xúc, chưa xác nhận người châu Á, một vai nhiều người mẫu, video minh hoạ dùng clip quay sẵn. Caption ghi nguồn từng clip (`post.md`).
- Có giọng đọc (mục 8.5): lời nói về sản phẩm không đặt lên mặt người mẫu (giấy phép: không ngụ ý ủng hộ); lời ngắn có cảm xúc đặt lên mặt, lời dài lên cảnh chèn.

---

## 8. Âm thanh: nhạc nền, tiếng động, giọng đọc AI

### 8.1 Nguồn nhạc
Chi tiết ở `docs/music-sources.md`. Nam đã chốt:
- **Nguồn chính Pixabay Music, nguồn phụ Mixkit.** Miễn phí, dùng thương mại, không cần ghi nguồn, dùng cho đăng organic.
- Incompetech (CC BY, phải ghi nguồn trong caption) và Freesound **CC0** (hiệu ứng âm thanh) chỉ dùng khi thiếu mood.
- **Không dùng**: MusicGen (CC-BY-NC), Uppbeat bản free, YouTube Audio Library cho video đăng ngoài YouTube, nhạc trôi nổi, mọi license có "NC". Thư viện nhạc trong app TikTok/Meta chỉ dùng khi MKT gắn nhạc trong app, không trộn vào MP4.
- Ưu tiên nhạc không lời. Tránh track có ghi chú Content ID.

### 8.2 `brand/music/manifest.json`
Mỗi track có các trường:
- `id`, `file`, `title`, `author`, `source`, `sourceUrl`, `license`
- `attributionRequired`, `attributionText`
- `downloadedAt`, `evidence` (đường dẫn bằng chứng license, lưu ngoài repo)
- `mood` (id phong cách), `bpm`, `durationSec`
- `allowedUse: ["social-organic"]`, `blocked`

`validate.ts` chặn track không có trong manifest, thiếu `license` hoặc `sourceUrl`, license chứa "NC", hoặc `blocked: true`. Nếu `attributionRequired`, skill `tao-reel` nhắc MKT dán `attributionText` vào caption bài đăng.

### 8.3 Xử lý nhạc
- `music: auto` → chọn track có `mood` khớp phong cách và `durationSec` ≥ độ dài video.
- Cắt theo độ dài video, fade in/out 0.5s. Cảnh không căn theo nhịp nhạc; thời lượng cảnh lấy từ độ dài chữ (6.2).
- Chuẩn hóa loudness bản cuối về mục tiêu ở mục 9.1 (`hyperframes normalize-audio` hoặc ffmpeg loudnorm).
- Clip có tiếng người thật: nhạc hạ bằng `data-automation` volume lane (skill `/hyperframes:hyperframes-audio`).
- Có giọng đọc AI: nhạc tự hạ xuống 0.3 khi có lời (dốc 0.15 giây), gộp chung đường âm lượng với khoảng lặng trước vỡ lẽ (`tieng-dong.txt`). Bước dựng sinh `data-automation`, không viết tay.

### 8.4 Xử lý tiếng Việt
- Unicode NFC cho toàn bộ text, kể cả trong HTML sinh ra.
- HTML phải khai báo `<meta charset="utf-8">` và `lang="vi"`.
- Chữ hiển thị đúng văn bản gốc: viết hoa tên sản phẩm, số, giá, URL.


### 8.5 Giọng đọc AI (v0.6)
Nam chốt 2026-10-10 (`docs/decisions.md` §27–29). Skill `giong-doc`, lệnh `./reel giong`, cấu hình `config/voice.ts`.
- **Khi nào**: video dựng riêng có lời nói trong brief (thoại nhân vật, lời dẫn), mọi kiểu hình. Mặc định có giọng; không giọng khi MKT không cần.
- **Nguồn giọng: VieNeu** (Cloud API v4, khoá `VIENEU_API_KEY`), giọng tiếng Việt chuẩn vùng miền; không dùng Gemini cho giọng nữa. **Mặc định một giọng kể** (người dẫn Duyên Hà My, nữ miền Nam) đọc toàn bộ lời nói của brief (Nam so 1 giọng với 4 giọng, 2026-10-10: "1 giọng tốt hơn nhiều giọng"). Nhiều giọng chỉ khi MKT yêu cầu: mỗi nhân vật một giọng, **giới tính khớp người trên hình**; vai không lộ mặt (bàn tay, người dẫn) chọn tự do. Người duyệt nghe thử và chọn dàn giọng, nghe bản cuối (Claude không nghe được âm thanh).
- **Dựng khi có giọng**: thoại nhân vật đặt lên cảnh không thấy mặt người nói; mặt người là phản ứng im lặng (clip `mieng: im`), có **người dẫn** kể tiếp theo lời nói của brief; cảnh kết có giọng đọc thông điệp + lời kêu gọi; dựng hình theo độ dài giọng; chữ nhỏ (nhãn gắn vật + phụ đề theo giờ giọng thật).
- **Tạo**: mỗi câu một bản, kiểm trên máy (không câm, vừa chỗ trống, cắt lặng đầu cuối), bản hỏng tạo lại tối đa 3 lần. Bản giọng + sổ `giong/nhat-ky.json` commit vào repo (máy khác dựng đúng giọng đã duyệt, không cần khoá).
- **Chi phí**: token VieNeu = max(50, số ký tự) × 3 × 1,3 mỗi câu; **trần 20.000 token/video** (`config/cost.ts`); chạm trần hoặc hết hạn mức gói thì dừng.
- **Nhãn AI** (Luật Trí tuệ nhân tạo 2025, NĐ 142/2026): chữ "**Do AI sản xuất**" trên hình suốt video (nhỏ, mờ vừa, góc trên trái — Nam chốt câu chữ và vị trí 2026-10-10), dòng đầu caption ghi rõ phần do AI ("⚠️ Video có giọng đọc do AI tạo."), dấu AI trong siêu dữ liệu MP4.
- **Không bịa**: số trong lời đọc phải có trong brief/kịch bản. Không giọng clone, không đặt lời vào miệng người thật có danh tính.
- Validate chặn: dàn giọng trùng/thiếu giới tính, câu chưa có giọng, thoại trùng lúc thấy mặt người nói, clip mặt đang nói, cảnh CTA không có giọng, nhãn/caption thiếu; cảnh báo chữ cỡ lớn.
---

## 9. Pipeline & lệnh

| Lệnh | Việc làm |
|---|---|
| `pnpm doctor` | Bọc `hyperframes doctor` + kiểm tra Node, FFmpeg (ffmpeg-static), font, nhạc |
| `pnpm new <slug>` | Tạo thư mục brief từ `_example` |
| `pnpm validate <slug>` | Validate brief + script + assets + nhạc (manifest, license) + videoType/style |
| `pnpm build <slug>` | brief + script + nhạc → `props.json` (timing cảnh từ độ dài chữ) + `hyperframes lint`/`check` |
| `pnpm preview <slug>` | Bọc `hyperframes preview` cho template với props của video |
| `pnpm render <slug>` | Bọc `hyperframes render --variables-file` → `out/<slug>.mp4` + kiểm tra output |
| `pnpm make <slug>` | validate → build → render |

Luồng chuẩn:
```
brief.md ──(Claude: videoType + style)──> script.json ──(MKT duyệt)──> build ──> props.json
        ──> preview ──(MKT duyệt)──> render ──> out/*.mp4
```

### 9.1 Output spec
- MP4, H.264, yuv420p, 1080×1920, 30fps, AAC 48kHz.
- Loudness tổng **−14 LUFS** integrated, true peak ≤ −1 dBTP (Nam chốt). Đây là mức mà TikTok, Instagram/Facebook Reels và YouTube Shorts đều chuẩn hóa quanh đó, nên video nghe đều tay trên mọi nền tảng và không bị nền tảng tự hạ hay đẩy âm lượng.
- Dung lượng mục tiêu ≤ 50MB cho 60s.
- Sau render, `render.ts` tự kiểm tra bằng ffprobe: độ phân giải, fps, thời lượng khớp props ±0.2s, có audio track. Fail → báo lỗi rõ ràng bằng tiếng Việt.

---

## 10. Skill Claude Code

### 10.1 Skill `cai-dat`
File `.claude/skills/cai-dat/SKILL.md`, dựa trên `docs/spike-evidence/s1-install-runbook.md`. Khi MKT gõ `/cai-dat` hoặc nói "cài đặt giúp tôi", Claude:
1. Kiểm tra máy (`uname -m`, dung lượng trống).
2. Cài Node 22 từ tarball chính thức nodejs.org (đúng kiến trúc, kiểm SHASUMS256) vào `~/.redsun-reels/node`, không sudo.
3. `corepack pnpm install --frozen-lockfile`.
4. Cài plugin HyperFrames từ tarball tag đã pin thành marketplace local, auto-update tắt.
5. `hyperframes doctor`, `hyperframes browser ensure`, render thử 1 video ngắn.
6. Báo kết quả bằng tiếng Việt dễ hiểu; lỗi thì nói bước nào hỏng và cách xử lý (thường là "kiểm tra mạng rồi nói 'cài lại'").

Ràng buộc:
- Bước nào đã xong thì bỏ qua; chạy lại không làm hỏng gì.
- Không cần Python, Homebrew, Xcode CLT hay git.
- Quyền cần dùng được allowlist trong `.claude/settings.json`, để MKT không phải duyệt từng lệnh.

### 10.2 Skill `tao-reel`
File `.claude/skills/tao-reel/SKILL.md`. Khi MKT gõ `/tao-reel` hoặc "làm reel…", Claude phải:
1. Hỏi hoặc đọc brief. Nếu chưa có → chạy `pnpm new`, hỏi tối đa 5 câu để điền frontmatter.
2. Nếu `videoType: auto` → đề xuất 1 loại video + lý do 1 câu. Nếu `style` trống → dùng mặc định của loại và nói cho MKT biết. Nếu MKT chọn phong cách "nên tránh" → hỏi lại một câu.
3. **Concept**: đưa 3 concept (mục 6.2), ghi `concepts.md`, **dừng chờ MKT chọn**.
4. **Thiếu asset** (quay màn hình, ảnh quán, clip khách, ảnh sự kiện, người nói trước camera):
   - Xuất `shotlist.md`, gồm số shot, cảnh, địa điểm, mô tả, đạo cụ, ánh sáng, thời lượng.
   - Khung dọc 9:16, chừa safe zone. Nhóm theo địa điểm để quay nhanh.
   - Chờ MKT bổ sung asset.
5. Viết `script.json`, tự chấm theo thang 6.2 (≥ 85/100). Sau đó in bảng duyệt gồm các cột: **Cảnh · Vai trò · Hình ảnh · Chữ trên màn hình · Chuyển cảnh · Thời lượng**. Nhạc đã chọn và điểm tự chấm in ở đầu bảng. **Dừng chờ MKT duyệt.**
6. Duyệt xong → `pnpm build`, `pnpm preview`, bảo MKT xem trên trình duyệt.
7. Nhận feedback (ghi vào `review.md`), sửa đúng chỗ.
8. MKT nói "xuất" → `pnpm render`, báo đường dẫn file + thời lượng + dung lượng. Đồng thời soạn `post.md`, MKT chỉ cần copy:
   - caption khớp kịch bản (hook + 1–2 ý + CTA);
   - hashtag mặc định của sản phẩm (`products.json`) + 2–3 hashtag theo chủ đề;
   - dòng credit nhạc, nếu track yêu cầu ghi nguồn.

Ràng buộc skill:
- Giao tiếp tiếng Việt, không dùng thuật ngữ code với MKT.
- Chỉ được sửa file trong `briefs/<slug>/`. Không sửa `templates/`, `brand/`, `config/`, `scripts/`.
- Không dùng hook kiểu giật tít sai sự thật. Không bịa số liệu. Không hứa tính năng hay ưu đãi ngoài brief.
- **Không** gọi các creation workflow của HyperFrames (`/hyperframes:general-video`, `/hyperframes:product-launch-video`, `/hyperframes:faceless-explainer`…) trong chế độ MKT. Các workflow đó tự viết composition mới, phá nguyên tắc template-first.
- Yêu cầu nào cần sửa template hoặc cần phong cách/loại video mới → nói rõ là cần dev, ghi vào `review.md` mục "Cần dev".
- Khi lỗi: giải thích ngắn bằng ngôn ngữ thường + gợi ý cách xử lý; không dump stack trace.

---

## 11. Nội dung bắt buộc của `CLAUDE.md`

- Tóm tắt dự án 5 dòng + link tới REQUIREMENTS.md.
- Phân biệt 2 chế độ:
  - **Chế độ MKT** (mặc định): chạy skill `cai-dat` / `tao-reel`, chỉ đụng `briefs/`.
  - **Chế độ Dev** (khi người dùng nói rõ "chế độ dev"): được sửa template, preset phong cách, config; dùng đầy đủ skill HyperFrames (tên có namespace `/hyperframes:…`).
- Quy tắc kiểm kê skill có sẵn trước khi tạo skill mới (mục 0).
- Rule kịch bản ở mục 6.2. Giọng đọc AI chỉ cho video dựng riêng (mục 8.5).
- Rule brand: chỉ dùng biến trong `brand.css`, tuân thủ `frame.md`, font Montserrat.
- Rule nhạc: chỉ track trong `brand/music/manifest.json` (mục 8).
- Rule tiếng Việt: NFC, `lang="vi"`, viết đúng tên sản phẩm.
- Version HyperFrames đã pin + cấm tự nâng.
- Danh sách lệnh mục 9.
- Checklist trước khi báo "xong": validate pass, `hyperframes lint` + `check` pass, render pass kiểm tra output.

---

## 12. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| Thời gian render | Video 30s render ≤ 3 phút trên laptop văn phòng. Spike S6: trung vị 2 phút 33 giây trên MacBook Intel i7-7700HQ (2017); Apple Silicon `[VERIFY]` |
| Cài đặt | Máy MKT trắng → render được trong ≤ 30 phút, 0 lần nhập mật khẩu. Spike S1: ước tính 5–6 phút trên Intel |
| Chi phí | Ghi thời gian render + nhạc đã dùng vào `cost.json`. Không có chi phí cloud |
| Khả năng sửa | Sửa 1 câu chữ trên màn hình → build + render lại ≤ 5 phút |
| Lỗi | Mọi lỗi pipeline có message tiếng Việt, nêu bước nào hỏng và cách xử lý |
| Bản quyền | Chỉ dùng nhạc/font/asset trong `brand/`. Manifest nhạc ghi nguồn + license + bằng chứng (mục 8.2) |
| Bảo mật | Không commit `.env`, không log thông tin nhạy cảm |
| Nâng cấp | Nâng version HyperFrames chỉ khi render test (mục 13) pass toàn bộ |

---

## 13. Test

- **Unit** (Vitest): zod schema (brief, script, props, manifest nhạc, video-types), chọn phong cách mặc định, tính timing cảnh, build props, giới hạn chữ hook (≤ 40 ký tự/dòng, ≤ 2 dòng), thứ tự `role` hợp lệ theo loại video.
- **Brand lint**: script quét `templates/**` và `brand/styles/**`, báo lỗi nếu có mã màu hex/rgb, `font-family`, `font-size` px không qua biến CSS.
- **Music lint**: mọi track trong manifest có license hợp lệ, không "NC", file tồn tại.
- **Render test**: mỗi template có `fixture.props.json`. Chạy với mọi phong cách; `hyperframes snapshot --at` chụp frame tại 0s, giữa, cuối để so sánh với baseline. Chạy trước mỗi lần nâng version.
- **Test dấu tiếng Việt**: fixture chứa chuỗi `"Ứng dụng quản lý bán hàng — ưu đãi đặc biệt, giảm 30%!"` phải hiển thị đúng ở chữ hook, chữ cảnh, lower third (đã Đạt ở Spike S2).

---

## 14. Acceptance criteria tổng

1. MKT mới mở Claude Code, nói "cài đặt giúp tôi", cài xong môi trường ≤ 30 phút trên MacBook (Intel và Apple Silicon), không nhập mật khẩu.
2. Từ brief có sẵn → MP4 đạt output spec trong ≤ 15 phút, không cần dev can thiệp.
3. 10 video thử nghiệm thuộc ít nhất 5 loại video và 3 phong cách: 0 lỗi dấu tiếng Việt, 0 text lọt ra ngoài safe zone, mọi cảnh đủ thời gian đọc chữ (mục 6.2), 0 track nhạc thiếu license.
4. Đổi `--color-primary` trong `brand.css` → toàn bộ template và phong cách đổi theo, không sửa file nào khác.
5. Brand lint + music lint pass trên toàn bộ `templates/`, `brand/`.

---

## 15. Milestones

### M0 — Spike & khởi tạo
**M0.1 Spike: ĐÃ XONG (2026-10-08).** Kết quả ở `docs/spike-report.md`. **GO trên macOS Intel.**

| # | Kiểm tra | Kết quả |
|---|---|---|
| S1 | Cài + render trên macOS (Intel + Apple Silicon) | Intel Đạt · Apple Silicon `[VERIFY]` khi có máy |
| S2 | Dấu tiếng Việt với Montserrat | Đạt |
| S3 | Chọn TTS giọng nữ | Không còn áp dụng (bỏ lồng tiếng ở v0.4) |
| S4 | Variables / sub-composition | Phương án A |
| S5 | Audio ducking | Đạt kỹ thuật; không còn cần cho giọng |
| S6 | Hiệu năng | Intel Đạt (2 phút 33 giây/30s) · Apple Silicon `[VERIFY]` |
| S7 | Lệnh CLI | Đạt |

**Còn lại của M0.1:** chạy runbook S1 + đo S6 trên một MacBook Apple Silicon.

**M0.2 Khởi tạo (0.5–1 ngày)**
- Scaffold repo theo mục 4, pin version (đã có `package.json`), `.claude/settings.json`.
- `brand/frame.md` + `brand.css` theo mục 5.3, `brand/fonts/` (Montserrat), `runtime/` (GSAP local).
- `brand/music/`: MKT lead chọn 20–30 track không lời từ Pixabay Music + Mixkit theo nhóm phong cách, lưu bằng chứng license, dev ghi manifest. Nên đăng thử 5–10 track ở chế độ riêng tư để kiểm Content ID.
- `config/video-types.ts`, `config/styles.ts` theo `docs/video-type-guide.md`.
- `pnpm doctor`.
- **Done khi:** `pnpm preview` mở được composition trống 1080×1920 có font Montserrat local, safe zone debug và một track nhạc từ manifest.

### M1 — Lõi + 2 template (3–4 ngày)
- Schema brief/script/props/manifest/video-types, `validate`.
- Sub-composition dùng chung (mục 7.1).
- `build` (timing cảnh theo độ dài chữ), `render`, `make`.
- Template **FeatureLaunch**, **TipOfTheDay** + fixtures; phong cách `toi-gian`, `khuyen-mai`, `vui-nhon`.
- Brand lint, music lint.
- **Done khi:** `pnpm make _example` ra MP4 đạt mục 9.1; test dấu tiếng Việt, brand lint, music lint pass; các loại video dùng FeatureLaunch/TipOfTheDay (1, 2, 3, 4, 14, 15, 18) chạy được. (Loại 5 `truoc-sau` dùng BeforeAfter, thuộc M3.)

### M2 — Trải nghiệm MKT (2 ngày)
- Skill `cai-dat` và `tao-reel`, `CLAUDE.md` hoàn chỉnh (kiểm kê skill có sẵn trước).
- README tiếng Việt cho MKT: mở Claude Code → "cài đặt giúp tôi" → "làm reel…".
- Thông báo lỗi tiếng Việt cho mọi bước.
- **Done khi:** 1 người MKT tự cài máy và tự làm 1 video từ đầu đến cuối, dev chỉ quan sát.

### M3 — Mở rộng (3 ngày)
- Template **BeforeAfter**, **Testimonial**, **Promo**.
- Các phong cách còn lại; lịch dịp lễ (`occasion`).
- Render test với baseline cho cả 5 template × phong cách.
- **Done khi:** đạt toàn bộ mục 14 sau 10 video thử nghiệm.

### M4 — Đủ 20 loại video (3 ngày)
- Template **EventRecap**, **Stats**, **TalkingHead** (mục 7.1) cho 5 loại video còn lại.
- TalkingHead: giữ âm thanh gốc của clip, nhạc nền hạ bằng automation volume, chữ nhấn ý chính.
- Render test baseline cho 3 template mới × phong cách.
- **Done khi:** cả 20 loại video ở `docs/video-type-guide.md` tạo được MP4 đạt mục 9.1 từ brief mẫu.

### Phase sau (không làm trong MVP)
- Chế độ "sáng tạo tự do" cho MKT dùng creation workflow của HyperFrames, có kiểm soát brand bằng `frame.md`.
- Clone cấu trúc từ link Reel mẫu.
- Lồng tiếng (nếu sau này cần lại: xem kết quả Spike S3 và bản v0.3).
- Render AWS Lambda tự host, web UI duyệt video, tự đăng bài.
- Tái dùng tầng render cho tool video BĐS.

### M5 — Video người thật do AI tạo (mục 7.4)
- Chạy thử 1–2 ngày: 3–4 cảnh người thật của brief "Chuyển khoản giả mạo" trên 2 model, so độ thật, độ giữ khuôn mặt, chi phí; ghép thành một video có nhãn để Nam xem, chọn model.
- Lệnh tạo dàn diễn viên và cảnh AI theo thứ tự khung chính: lớp gọi chung nhiều nhà cung cấp (Gemini API/Veo 3.1 trước, fal.ai/Kling khi so sánh), ghi chi phí (theo trần `config/cost.ts`), an toàn khi tạo cảnh tốn tiền, sổ nguồn gốc. Ghép cảnh AI vào bản dựng riêng; nhãn AI (đã có: validate, caption, metadata — `scripts/lib/kieu-hinh-rules.ts`); skill `dung-video`/`tao-reel` cập nhật.
- Key: `GEMINI_API_KEY` (bắt buộc), `FAL_KEY` (chỉ khi so sánh model) trong `.env`; chạy thử chỉ trên máy Nam.
- **Done khi:** một video từ brief có người thật do AI tạo, đủ 4 lớp nhãn, đạt mục 9.1, chất lượng Nam duyệt, trong trần chi của video.

---

## 16. Câu hỏi cần Nam chốt

Đã chốt ngày 2026-10-08:
- Màu lấy từ logo (5.3).
- Dùng thẳng file logo, gradient chỉ nằm trong logo (5.1).
- Dùng cả 19 phong cách (7.3).
- Loudness −14 LUFS (9.1).
- Công thức thời lượng cảnh 0.4 giây/từ, tối thiểu 1.5 giây, animation vào 0.5 giây (6.2).
- Làm 3 template M4 cho 5 loại video còn lại (7.1, 15).
- **Nam** là dev maintainer, người duy nhất được nâng version HyperFrames, người giữ bằng chứng license nhạc, và người lo MacBook Apple Silicon để hoàn tất S1/S6.

Câu hỏi mở cho mục 7.4 (video người thật do AI tạo, 2026-10-10):
- ~~API key~~: Nam cấp Gemini API key (2026-10-10), đặt trong `.env` máy Nam; có Veo 3.1 và model ảnh Gemini.
- Mức chi tối đa: có trần mỗi video (Nam 2026-10-10, sau buổi thử giọng tốn 150k). Giọng đọc 15.000 đồng/video; trần cho cảnh AI chốt khi làm M5.
- Câu chữ nhãn AI trên hình và trong caption.
- ~~Có cho nhân vật AI nói tiếng Việt không~~: có giọng đọc AI (v0.6, mục 8.5); nhân vật AI mấp máy môi theo lời vẫn chưa làm.

Câu hỏi mở cho mục 8.5 (giọng đọc AI, 2026-10-10):
- Giữ phụ đề nhỏ khi đã có giọng (hiện: giữ, cho người xem tắt tiếng).
- ~~Câu chữ nhãn~~: "Do AI sản xuất" trên hình (Nam 2026-10-10).

Các mục khác không còn câu hỏi mở. Safe zone dùng mức chung ở 5.4; nơi lưu bằng chứng license nhạc do Nam tự quản (bỏ qua trong tài liệu).
