# REQUIREMENTS — redsun-reels

> Hệ thống sản xuất video Reel/TikTok/Shorts nội bộ cho team Marketing Redsun, vận hành bằng Claude Code + HyperFrames.
> Phiên bản: 0.3 — Owner: Vũ Đức Nam (CTO) — Trạng thái: Draft
> 0.2: đổi nền tảng render từ Remotion sang HyperFrames (Apache 2.0), thêm Spike M0.
> 0.3: danh sách provider TTS giọng nữ tiếng Việt (mục 8.2), quy trình nghe mù chọn giọng trong Spike S3.

---

## 0. Hướng dẫn cho Claude Code (đọc trước)

- Đây là tài liệu yêu cầu gốc. Mọi quyết định thiết kế phải bám tài liệu này; nếu cần lệch, **dừng lại và hỏi**, không tự quyết.
- Làm theo **Milestone** ở mục 15. Xong mỗi milestone phải pass toàn bộ Acceptance Criteria của nó rồi mới sang milestone tiếp theo.
- Các mục đánh dấu `[TBD]` là chưa chốt: dùng giá trị mặc định ghi kèm, đặt trong config, không hard-code.
- Các mục đánh dấu `[VERIFY]` là giả định về HyperFrames **chưa được kiểm chứng**. Spike M0 phải xác nhận hoặc bác bỏ trước khi build trên giả định đó. Nếu tài liệu chính thức nói khác tài liệu này, theo tài liệu chính thức và ghi lại vào `docs/decisions.md`.
- Trước khi viết composition: cài plugin HyperFrames cho Claude Code và đọc skill router `/hyperframes`, `/hyperframes-core`, `/hyperframes-creative`, `/media-use`, `/hyperframes-audio`. Lệnh cài kiểm tra tại github.com/heygen-com/hyperframes.
- **Pin version**: ghi version CLI + skills đang dùng vào `package.json` và `docs/decisions.md`. Không tự nâng version khi chưa hỏi.
- Không thêm dependency ngoài danh sách mục 3 nếu chưa hỏi.

---

## 1. Bối cảnh & mục tiêu

### 1.1 Bối cảnh
Redsun Ecosys có 3 sản phẩm: **SIPOS** (SaaS quản lý bán hàng F&B/bán lẻ/dịch vụ), **Redsun BOS** (ERP), **Webino** (AI website builder). Team MKT cần sản xuất đều đặn video ngắn dọc 9:16 cho Facebook Reels, TikTok, YouTube Shorts, Instagram Reels. Hiện làm thủ công bằng CapCut, chậm, không đồng nhất brand.

### 1.2 Mục tiêu
1. Người MKT **không biết code** tạo được 1 reel đúng brand trong **≤ 15 phút** từ lúc viết brief đến lúc có MP4.
2. Mọi video dùng chung brand system (màu, font, logo, nhạc, giọng đọc). Đi qua template thì không thể "lệch brand".
3. Claude Code là "người dựng": đọc brief → viết kịch bản → điền dữ liệu vào template → gọi TTS → render.

### 1.3 Vì sao HyperFrames
- **Apache 2.0**: không phí license, không giới hạn thương mại. Tầng render này có thể tái dùng cho sản phẩm thương mại khác của công ty.
- **HTML-native**: composition là HTML + data attributes + animation seekable (GSAP/CSS…). Claude viết HTML ổn định hơn React frame-math.
- **Agent-first**: có plugin Claude Code, CLI non-interactive, có `lint`/`check`/`snapshot` để agent tự kiểm tra.
- **Có sẵn**: audio mix (ducking theo dải giọng), caption, catalog block, `frame.md` cho design system.

### 1.4 Nguyên tắc thiết kế
- **Template-first**: Claude điền dữ liệu vào template có sẵn. Chỉ tạo composition mới khi MKT yêu cầu rõ và được duyệt. HyperFrames cho phép agent viết HTML tự do rất dễ, nên đây là ràng buộc **quan trọng nhất** để giữ brand.
- **Repo không tự gọi LLM**: phần "suy nghĩ" (kịch bản, chọn template, chia cảnh) do phiên Claude Code đảm nhận. Code trong repo chỉ gọi TTS, transcription, render.
- **Deterministic render**: cùng một `props.json` → cùng một video.
- **Mọi thứ có thể diff**: brief, kịch bản, props, composition sinh ra đều là file text trong git.
- **Render local**: không dùng cloud render của bên thứ ba ở MVP.

---

## 2. Người dùng & phạm vi

### 2.1 Người dùng
| Vai trò | Việc làm | Kỹ năng |
|---|---|---|
| MKT executor | Viết brief, chạy Claude Code, duyệt preview, xuất video | Không code, dùng được terminal cơ bản qua hướng dẫn |
| MKT lead | Duyệt video, quản lý brand asset | Không code |
| Dev maintainer | Thêm/sửa template, sửa lỗi render, nâng version HyperFrames | HTML/CSS/JS, TypeScript |

### 2.2 Trong phạm vi (MVP)
- Video dọc 1080×1920, 15–60 giây.
- 5 template (2 template ở M1, 3 template ở M3).
- Voice-over tiếng Việt bằng TTS, caption tiếng Việt word-level.
- Nhạc nền từ thư viện nội bộ, tự ducking khi có giọng đọc.
- Preview trên trình duyệt (`hyperframes preview`), render local ra MP4.
- Skill Claude Code `tao-reel` dẫn MKT qua toàn bộ quy trình.

### 2.3 Ngoài phạm vi (MVP)
- Tự đăng bài lên mạng xã hội.
- Sinh ảnh/video bằng AI (Veo, Kling, Seedance…).
- Chế độ "sáng tạo tự do" dùng các creation workflow của HyperFrames (`/general-video`, `/faceless-explainer`…) cho MKT. → Phase sau, sau khi template ổn định.
- Web UI riêng cho MKT.
- Render trên cloud (HeyGen cloud render, AWS Lambda).
- Video ngang 16:9.

---

## 3. Tech stack & ràng buộc

| Thành phần | Lựa chọn | Ghi chú |
|---|---|---|
| Runtime | Node.js 22+ | Yêu cầu của HyperFrames |
| Render | HyperFrames CLI `hyperframes` (pin version) | Apache 2.0 |
| Encoder | FFmpeg | Cài sẵn trên máy, `hyperframes doctor` kiểm tra |
| Animation | GSAP (qua adapter của HyperFrames) | Dùng adapter mặc định framework khuyến nghị. Kiểm tra license GSAP hiện hành trước khi chốt |
| Ngôn ngữ script | TypeScript strict (cho `scripts/`) | Composition là HTML/CSS/JS thuần |
| Validate schema | zod | Cho brief, script, props, config |
| Template engine | `[TBD: Eta hoặc Handlebars]` | Chỉ dùng nếu Spike kết luận không dùng được variables native (xem 6.4) |
| TTS | Provider abstraction, mặc định `[TBD: theo kết quả Spike S3]` | Xem mục 8. Ứng viên: Google Chirp 3 HD, Gemini TTS, Azure HoaiMy, VieNeu-TTS v2 |
| Transcription fallback | `/media-use` transcribe `[VERIFY]`, nếu không đạt → whisper.cpp | Chỉ dùng khi TTS không trả timestamp |
| Package manager | pnpm | |
| Lint/format | ESLint + Prettier cho `scripts/`; `hyperframes lint` cho composition | |
| Test | Vitest | Cho schema, pipeline, utils |

Ràng buộc:
- Chạy được trên **Windows 11 và macOS** (máy team MKT). Windows là `[VERIFY]` trong Spike.
- Không yêu cầu GPU.
- Secrets (API key TTS) đọc từ `.env`, có `.env.example`, `.env` nằm trong `.gitignore`.
- Không bật auto-update plugin HyperFrames trên máy MKT. Dev nâng version có kiểm soát, chạy lại render test trước khi phát hành cho MKT.

---

## 4. Cấu trúc thư mục

```
redsun-reels/
├── CLAUDE.md                   # Rule cho Claude Code (mục 11)
├── REQUIREMENTS.md             # Tài liệu này
├── README.md                   # Hướng dẫn cài đặt cho MKT (tiếng Việt, có ảnh chụp)
├── docs/
│   ├── decisions.md            # Quyết định kỹ thuật, version đã pin, kết quả Spike
│   └── spike-report.md         # Báo cáo Spike M0
├── .claude/
│   └── skills/
│       └── tao-reel/SKILL.md   # Skill quy trình tạo reel (mục 10)
├── brand/
│   ├── frame.md                # Design system cho video (chuẩn HyperFrames)
│   ├── brand.css               # CSS variables sinh từ / đồng bộ với frame.md
│   ├── products.json           # Cấu hình theo sản phẩm: SIPOS / BOS / Webino
│   ├── fonts/
│   ├── logos/
│   └── music/                  # Nhạc nền đã có bản quyền + manifest.json
├── assets/
│   ├── sipos/                  # screenshot, screen record
│   ├── bos/
│   └── webino/
├── templates/
│   ├── _shared/                # sub-composition dùng chung (mục 7)
│   │   ├── caption.html
│   │   ├── hook.html
│   │   ├── phone-frame.html
│   │   ├── cta-outro.html
│   │   ├── logo-bug.html
│   │   └── safe-zone.html
│   ├── FeatureLaunch/
│   │   ├── index.html          # composition gốc của template
│   │   ├── template.schema.ts  # zod schema cho props của template
│   │   └── fixture.props.json
│   ├── TipOfTheDay/
│   ├── BeforeAfter/
│   ├── Testimonial/
│   └── Promo/
├── briefs/
│   ├── _example/
│   └── 2026-10-08-sipos-tinh-nang-kho/   # mỗi video 1 thư mục (mục 6.3)
├── scripts/
│   ├── new.ts                  # Tạo thư mục brief
│   ├── validate.ts             # Validate brief/script/props/assets
│   ├── tts.ts                  # Sinh voice-over + timestamps
│   ├── build.ts                # template + props + timing → composition của video
│   └── render.ts               # gọi hyperframes render + kiểm tra output
└── out/                        # Gitignored
```

---

## 5. Brand system

### 5.1 `brand/frame.md`
Nguồn sự thật duy nhất cho định hướng thị giác, viết theo chuẩn `frame.md` của HyperFrames (đọc skill `/hyperframes-creative`). Nội dung bắt buộc:
- Bảng màu: primary, secondary, accent, background, text, textInverse `[TBD: Nam cung cấp mã màu]`.
- Typography: font heading/body, thang cỡ chữ cho canvas 1080×1920. Font **bắt buộc** hỗ trợ đủ dấu tiếng Việt (ă â đ ê ô ơ ư + 5 thanh).
- Quy tắc chuyển động: tốc độ vào/ra, easing, mức "năng lượng" theo tone.
- Quy tắc bố cục: lưới, lề, safe zone (5.3).
- Những điều cấm: ví dụ gradient cầu vồng, quá 2 font, text chạy chéo.

### 5.2 `brand/brand.css`
CSS custom properties (`--color-primary`, `--font-heading`, `--type-hero`…). Mọi template và sub-composition **chỉ** dùng các biến này. Cấm hard-code màu, font, cỡ chữ trong template. Có script/lint kiểm tra (mục 13).

### 5.3 `brand/products.json`
Mỗi sản phẩm có: tên hiển thị, logo, màu nhấn riêng (nếu có), tagline, CTA mặc định, hashtag mặc định. Template nhận `product: "sipos" | "bos" | "webino"` và lấy cấu hình tương ứng.

### 5.4 Safe zone
Reels/TikTok che một phần màn hình bằng UI. Text quan trọng phải nằm trong safe zone:
- Top: chừa `[TBD: 220px]`
- Bottom: chừa `[TBD: 420px]`
- Phải: chừa `[TBD: 160px]`

Giá trị đặt trong `brand.css`. Sub-composition `safe-zone.html` chỉ hiển thị khi preview với cờ debug, **không bao giờ** xuất hiện trong bản render.

---

## 6. Data model

### 6.1 Brief (MKT viết)
File `briefs/<slug>/brief.md` với YAML frontmatter:

```yaml
---
product: sipos                 # sipos | bos | webino
template: FeatureLaunch        # hoặc "auto" để Claude đề xuất
goal: "Giới thiệu tính năng kiểm kho bằng điện thoại"
audience: "Chủ quán F&B nhỏ, 25–45 tuổi"
duration: 30                   # giây, 15–60
tone: "nhanh, gần gũi, có chút hài"
cta: "Dùng thử miễn phí 14 ngày tại sipos.vn"
voice: default                 # tên preset giọng trong config
music: upbeat-01               # id trong brand/music/manifest.json, hoặc "auto"
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
  voiceover: z.string().max(220),
  onScreenText: z.string().max(60).optional(),
  visual: z.object({
    type: z.enum(['asset', 'text', 'phone', 'split', 'logo']),
    src: z.string().optional(),
  }),
  minDurationSec: z.number().optional(),
});
const Script = z.object({
  template: z.string(),
  product: z.enum(['sipos', 'bos', 'webino']),
  hook: z.string(),        // 3 giây đầu — bắt buộc
  scenes: z.array(Scene).min(2).max(12),
  cta: z.string(),
});
```

Rule kịch bản (đưa vào CLAUDE.md):
- 3 giây đầu phải là hook (câu hỏi, con số, nỗi đau).
- Tốc độ đọc tiếng Việt mục tiêu ~ `[TBD: 3.5]` từ/giây; tổng voiceover khớp `duration` ±10%.
- `onScreenText` ≤ 8 từ, không lặp nguyên văn voiceover.
- Không hứa hẹn tính năng không có trong brief.

### 6.3 Thư mục một video
```
briefs/2026-10-08-sipos-tinh-nang-kho/
├── brief.md          # MKT viết
├── script.json       # Claude viết, MKT duyệt
├── audio/            # gitignored: voice-<sceneId>.mp3
├── timing.json       # timestamp từng từ, từng cảnh
├── props.json        # dữ liệu cuối cho template
├── composition/      # project HyperFrames của video này (sinh bởi build.ts)
│   └── index.html
├── review.md         # ghi chú duyệt / yêu cầu sửa
└── cost.json         # số ký tự TTS, thời gian render
```

### 6.4 Từ props đến composition
Mục tiêu: `props.json` + `timing.json` → một composition HyperFrames hoàn chỉnh với `data-start` / `data-duration` chính xác cho từng clip.

Hai phương án, **Spike M0 chọn một**:
- **A. Variables native** `[VERIFY]`: dùng cơ chế composition variables / sub-composition của HyperFrames (xem `/hyperframes-core`). `build.ts` chỉ ghi props vào nơi framework đọc. Ưu tiên phương án này nếu framework hỗ trợ đủ: text, đường dẫn asset, số cảnh động, timing.
- **B. Sinh HTML**: `build.ts` render `templates/<Name>/index.html` bằng template engine với props + timing, ghi ra `briefs/<slug>/composition/`. Luôn khả thi, đổi lại tự quản lý nhiều hơn.

Dù chọn phương án nào:
- `template.schema.ts` là hợp đồng props của template, validate trước khi build.
- Timing tính từ `timing.json` (thời lượng audio thật), không từ ước lượng.
- Composition sinh ra phải pass `hyperframes lint` và `hyperframes check` `[VERIFY: tên lệnh chính xác]`.

---

## 7. Đặc tả template

Chung cho mọi template:
- 1080×1920, 30fps.
- Cấu trúc: Hook (0–3s) → Body (n cảnh) → CTA + logo outro (2–3s).
- Caption word-level luôn bật, nằm trong safe zone, highlight từ đang đọc.
- Nhạc nền ducking khi có giọng đọc bằng `/hyperframes-audio` (voiceover carve), fade in/out 0.5s.
- Logo sản phẩm góc trên trái suốt video (tắt được bằng prop).
- Ưu tiên dùng block trong catalog HyperFrames (`npx hyperframes add …`) cho transition, caption, chart thay vì tự viết. Block nào dùng phải ghi vào `docs/decisions.md` và style lại theo `brand.css`.

| Template | Milestone | Mục đích | Cảnh đặc thù |
|---|---|---|---|
| **FeatureLaunch** | M1 | Giới thiệu tính năng mới | Phone mockup chứa screen record, callout chỉ vào UI, zoom vào vùng quan trọng. Tham khảo cách dựng của workflow `/product-launch-video` |
| **TipOfTheDay** | M1 | Mẹo dùng phần mềm, dạng "Bạn có biết?" | Số thứ tự mẹo, các bước 1-2-3 |
| **BeforeAfter** | M3 | Trước/sau khi dùng sản phẩm | Split screen hoặc wipe transition, nhãn TRƯỚC/SAU |
| **Testimonial** | M3 | Khách hàng nói | Ảnh/video khách, quote lớn, tên + cửa hàng (lower third) |
| **Promo** | M3 | Khuyến mãi, sự kiện | Countdown/hạn chót, giá gạch ngang, badge |

Sub-composition dùng chung (`templates/_shared/`): `caption`, `hook`, `phone-frame`, `callout`, `lower-third`, `cta-outro`, `logo-bug`, `safe-zone`.

---

## 8. TTS

### 8.1 Interface
```ts
interface TTSProvider {
  name: string;
  synthesize(input: { text: string; voiceId: string; speed?: number }):
    Promise<{ audioPath: string; durationSec: number; words?: WordTiming[] }>;
}
type WordTiming = { word: string; startMs: number; endMs: number };
```

### 8.2 Provider ứng viên (giọng nữ tiếng Việt, ưu tiên miễn phí, dùng thương mại được)

| ID | Provider | Free tier `[VERIFY trên trang giá chính thức]` | Word timestamp | Ghi chú |
|---|---|---|---|---|
| `google-chirp3hd` | Google Cloud TTS — Chirp 3 HD, giọng nữ vi-VN | ~1M ký tự/tháng, cần bật billing | `[VERIFY]`, nhiều khả năng không → whisper | Ứng viên chất lượng số 1 |
| `gemini-tts` | Gemini 2.5 Flash TTS | `[VERIFY]` | `[VERIFY]` | Điều khiển giọng bằng prompt (hào hứng, nhanh…) |
| `azure-hoaimy` | Azure Speech — `vi-VN-HoaiMyNeural` | 500K ký tự/tháng (F0) | Có (word boundary) | Baseline an toàn; giọng hơi "đọc tin" |
| `vieneu` | VieNeu-TTS v2, self-host | Không giới hạn (tự chạy) | `[VERIFY]` → whisper | Voice cloning → giọng thương hiệu riêng; tốt với từ tiếng Anh xen kẽ. **Phải xác nhận license model + dataset cho phép thương mại** |
| `media-use` | TTS có sẵn trong `/media-use` của HyperFrames | `[VERIFY]` | `[VERIFY]` | Chỉ dùng nếu có giọng Việt đạt chất lượng |

Không dùng:
- ElevenLabs free tier: không cho phép thương mại, quota rất nhỏ.
- `edge-tts` (endpoint không chính thức của Microsoft Edge): rủi ro điều khoản, không phù hợp chuẩn enterprise.

### 8.3 Yêu cầu
- Provider chính do Spike S3 chọn (xem mục 15). M1 cài tối thiểu provider thắng + `azure-hoaimy` làm fallback.
- Ít nhất 1 provider ở M1, có chỗ cắm provider khác (FPT.AI, Vbee, Viettel AI…) ở M3.
- Mọi provider cloud có **budget alert** (Google Cloud billing alert, Azure F0 tự chặn khi hết quota). Ghi cấu hình alert vào `docs/decisions.md`.
- Nếu chọn `vieneu` với giọng clone: phải có **văn bản đồng ý** của người cho giọng, lưu ngoài repo; file giọng mẫu không commit vào git.
- Provider trả timestamp → dùng luôn. Không trả → transcribe để lấy word timing (language `vi`).
- Sinh audio **theo từng cảnh** để sửa 1 cảnh không phải sinh lại toàn bộ.
- Cache theo hash(text + voiceId + speed + provider).
- Preset giọng trong `config/voices.ts`. MKT chỉ chọn theo tên.
- Chuẩn hóa loudness voice về `[TBD: -16 LUFS]` trước khi mix, trừ khi `/hyperframes-audio` đã làm level match.

### 8.4 Xử lý tiếng Việt
- Chuẩn hóa văn bản trước TTS: số, viết tắt (SIPOS, ERP, POS) đọc đúng theo `config/pronunciation.ts`.
- Caption hiển thị **văn bản gốc** (có số, viết hoa tên sản phẩm), không hiển thị bản đã chuẩn hóa cho TTS. Cần cơ chế map timing từ bản đọc về bản hiển thị.
- Unicode NFC cho toàn bộ text, kể cả trong HTML sinh ra.
- HTML phải khai báo `<meta charset="utf-8">` và `lang="vi"`.

---

## 9. Pipeline & lệnh

| Lệnh | Việc làm |
|---|---|
| `pnpm doctor` | Bọc `hyperframes doctor` + kiểm tra Node, FFmpeg, font |
| `pnpm new <slug>` | Tạo thư mục brief từ `_example` |
| `pnpm validate <slug>` | Validate brief + script + assets tồn tại |
| `pnpm tts <slug>` | Sinh voice từng cảnh + timing |
| `pnpm build <slug>` | props + timing → `composition/` (mục 6.4) + `hyperframes lint` |
| `pnpm preview <slug>` | Bọc `hyperframes preview` cho composition của video |
| `pnpm render <slug>` | Bọc `hyperframes render` → `out/<slug>.mp4` + kiểm tra output |
| `pnpm make <slug>` | validate → tts → build → render |

Luồng chuẩn:
```
brief.md ──(Claude)──> script.json ──(MKT duyệt)──> tts ──> timing.json
        ──> props.json ──> build ──> composition/ ──> preview ──(MKT duyệt)──> render ──> out/*.mp4
```

### 9.1 Output spec
- MP4, H.264, yuv420p, 1080×1920, 30fps, AAC 48kHz.
- Loudness tổng `[TBD: -14 LUFS]` integrated, true peak ≤ −1 dBTP.
- Dung lượng mục tiêu ≤ 50MB cho 60s.
- Sau render, `render.ts` tự kiểm tra bằng ffprobe: độ phân giải, fps, thời lượng khớp props ±0.2s, có audio track. Fail → báo lỗi rõ ràng bằng tiếng Việt.

---

## 10. Skill `tao-reel`

File `.claude/skills/tao-reel/SKILL.md`. Khi MKT gõ `/tao-reel` hoặc "làm reel…", Claude phải:

1. Hỏi hoặc đọc brief. Nếu chưa có → chạy `pnpm new`, hỏi tối đa 5 câu để điền frontmatter.
2. Nếu `template: auto` → đề xuất 1 template + lý do 1 câu.
3. Viết `script.json`, in kịch bản dạng bảng (cảnh | lời đọc | text trên màn hình | hình), **dừng chờ MKT duyệt**.
4. Duyệt xong → `pnpm tts`, `pnpm build`, `pnpm preview`, bảo MKT xem trên trình duyệt.
5. Nhận feedback (ghi vào `review.md`), sửa đúng chỗ, chỉ sinh lại TTS cho cảnh bị đổi.
6. MKT nói "xuất" → `pnpm render`, báo đường dẫn file + thời lượng + dung lượng.

Ràng buộc skill:
- Giao tiếp tiếng Việt, không dùng thuật ngữ code với MKT.
- Chỉ được sửa file trong `briefs/<slug>/`. Không sửa `templates/`, `brand/`, `scripts/`.
- **Không** gọi các creation workflow của HyperFrames (`/general-video`, `/product-launch-video`, `/faceless-explainer`…) trong chế độ MKT. Các workflow đó tự viết composition mới, phá nguyên tắc template-first.
- Yêu cầu nào cần sửa template → nói rõ là cần dev, ghi vào `review.md` mục "Cần dev".
- Khi lỗi: giải thích ngắn bằng ngôn ngữ thường + gợi ý cách xử lý; không dump stack trace.

---

## 11. Nội dung bắt buộc của `CLAUDE.md`

- Tóm tắt dự án 5 dòng + link tới REQUIREMENTS.md.
- Phân biệt 2 chế độ:
  - **Chế độ MKT** (mặc định): chạy skill `tao-reel`, chỉ đụng `briefs/`.
  - **Chế độ Dev** (khi người dùng nói rõ "chế độ dev"): được sửa template, dùng đầy đủ skill HyperFrames.
- Rule kịch bản ở mục 6.2.
- Rule brand: chỉ dùng biến trong `brand.css`, tuân thủ `frame.md`.
- Rule tiếng Việt: NFC, font có dấu, `lang="vi"`, bảng phát âm.
- Version HyperFrames đã pin + cấm tự nâng.
- Danh sách lệnh mục 9.
- Checklist trước khi báo "xong": validate pass, `hyperframes lint` pass, render pass kiểm tra output.

---

## 12. Yêu cầu phi chức năng

| Hạng mục | Yêu cầu |
|---|---|
| Thời gian render | Video 30s render ≤ 3 phút trên laptop văn phòng (i5/16GB) `[TBD: đo trong Spike]` |
| Chi phí | Ghi số ký tự TTS + thời gian render vào `cost.json` |
| Khả năng sửa | Sửa 1 câu thoại → sinh lại + render ≤ 5 phút |
| Lỗi | Mọi lỗi pipeline có message tiếng Việt, nêu bước nào hỏng và cách xử lý |
| Bản quyền | Chỉ dùng nhạc/font/asset trong `brand/`. Manifest nhạc ghi nguồn + license |
| Bảo mật | Không commit `.env`, không log API key |
| Nâng cấp | Nâng version HyperFrames chỉ khi render test (mục 13) pass toàn bộ |

---

## 13. Test

- **Unit** (Vitest): zod schema, chuẩn hóa văn bản tiếng Việt, map timing đọc↔hiển thị, tính timing cảnh, build composition.
- **Brand lint**: script quét `templates/**` báo lỗi nếu có mã màu hex/rgb, `font-family`, `font-size` px không qua biến CSS.
- **Render test**: mỗi template có `fixture.props.json`; dùng `hyperframes snapshot` `[VERIFY]` chụp frame tại 0s, giữa, cuối để so sánh với baseline. Chạy trước mỗi lần nâng version.
- **Test dấu tiếng Việt**: fixture chứa chuỗi `"Ứng dụng quản lý bán hàng — ưu đãi đặc biệt, giảm 30%!"` phải hiển thị đúng ở caption, heading, lower third.

---

## 14. Acceptance criteria tổng

1. MKT mới làm theo README cài xong môi trường ≤ 30 phút trên Windows.
2. Từ brief có sẵn → MP4 đạt output spec trong ≤ 15 phút, không cần dev can thiệp.
3. 10 video thử nghiệm: 0 lỗi dấu tiếng Việt, 0 text lọt ra ngoài safe zone, voice và caption lệch ≤ 100ms.
4. Đổi `--color-primary` trong `brand.css` → toàn bộ template đổi theo, không sửa file nào khác.
5. Brand lint pass trên toàn bộ `templates/`.

---

## 15. Milestones

### M0 — Spike & khởi tạo (1.5 ngày)

**M0.1 Spike (1 ngày) — bắt buộc trước khi code thật.** Kết quả ghi vào `docs/spike-report.md`, mỗi mục có kết luận Đạt/Không đạt + bằng chứng (lệnh đã chạy, ảnh frame, file MP4 mẫu).

| # | Kiểm tra | Tiêu chí Đạt |
|---|---|---|
| S1 | Cài + render trên **Windows 11** | `hyperframes init` → `preview` → `render` chạy được, không cần WSL |
| S2 | **Dấu tiếng Việt** | Chuỗi test mục 13 hiển thị đúng với font brand, ở text tĩnh và text có animation |
| S3 | **Chọn TTS giọng nữ** | Xem quy trình S3 bên dưới; chọn được 1 provider chính + 1 fallback |
| S4 | **Variables / sub-composition** | Kết luận phương án A hay B ở mục 6.4 |
| S5 | **Audio ducking** | `/hyperframes-audio` hạ nhạc khi có voice, nghe tự nhiên |
| S6 | **Hiệu năng** | Thời gian render 30s video 1080×1920 trên laptop văn phòng |
| S7 | **Lệnh CLI** | Xác nhận tên và hành vi của `lint`, `check`, `snapshot`, `doctor` |

**Quy trình S3 — nghe mù chọn giọng:**
1. Kịch bản test cố định, ~30 giây, gồm: hook dạng câu hỏi, tên sản phẩm (SIPOS, ERP, POS), số và giá tiền ("giảm 30%", "199.000đ"), một câu có từ tiếng Anh xen kẽ, CTA có URL "sipos.vn".
2. Sinh bằng mọi provider trong bảng 8.2 có thể chạy được, mỗi provider chọn 1–2 giọng nữ tốt nhất. Gemini thử thêm 1 bản có prompt phong cách "hào hứng, nhịp nhanh kiểu TikTok".
3. Đổi tên file ngẫu nhiên (`A.mp3`, `B.mp3`…), giữ bảng mapping riêng.
4. Tối thiểu 3 người MKT chấm 1–5 theo: tự nhiên, đọc đúng tên sản phẩm/số, năng lượng phù hợp reel.
5. Đo kèm: có timestamp không, độ trễ sinh 30 giây audio, chi phí ước tính cho 200 video/tháng, license thương mại.
6. Ghi bảng kết quả + file audio vào `docs/spike-report.md` / `docs/spike-audio/`. Đề xuất provider chính + fallback, **chờ Nam chốt**.

**Go/No-go:** S1, S2 bắt buộc Đạt. Nếu một trong hai Không đạt và không có workaround hợp lý → **dừng, báo Nam**. Phương án dự phòng là quay lại Remotion (REQUIREMENTS v0.1). S3–S7 Không đạt thì ghi workaround và tiếp tục.

**M0.2 Khởi tạo (0.5 ngày)**
- Scaffold repo theo mục 4, pin version HyperFrames, cài plugin/skills.
- `brand/frame.md` + `brand.css` với giá trị placeholder, `.env.example`.
- `pnpm doctor`.
- **Done khi:** `pnpm preview` mở được composition trống 1080×1920 có font brand và safe zone debug.

### M1 — Lõi + 2 template (3–4 ngày)
- Schema brief/script/props, `validate`.
- Sub-composition dùng chung (mục 7).
- TTS provider đầu tiên + cache + fallback transcribe.
- `tts`, `build`, `render`, `make`.
- Template **FeatureLaunch**, **TipOfTheDay** + fixtures.
- Brand lint.
- **Done khi:** `pnpm make _example` ra MP4 đạt mục 9.1; test dấu tiếng Việt và brand lint pass.

### M2 — Trải nghiệm MKT (2 ngày)
- Skill `tao-reel`, `CLAUDE.md` hoàn chỉnh.
- README tiếng Việt cho MKT (cài Node 22, FFmpeg, pnpm, Claude Code, plugin HyperFrames, chạy lần đầu).
- Thông báo lỗi tiếng Việt cho mọi bước.
- **Done khi:** 1 người MKT tự làm 1 video từ đầu đến cuối, dev chỉ quan sát.

### M3 — Mở rộng (3 ngày)
- Template **BeforeAfter**, **Testimonial**, **Promo**.
- Provider TTS tiếng Việt thứ 2, bảng phát âm.
- Render test với baseline cho cả 5 template.
- **Done khi:** đạt toàn bộ mục 14 sau 10 video thử nghiệm.

### Phase sau (không làm trong MVP)
- Chế độ "sáng tạo tự do" cho MKT dùng creation workflow của HyperFrames, có kiểm soát brand bằng `frame.md`.
- Sinh ảnh/video AI, clone cấu trúc từ link Reel mẫu.
- Render AWS Lambda tự host, web UI duyệt video, tự đăng bài.
- Tái dùng tầng render cho tool video BĐS.

---

## 16. Câu hỏi cần Nam chốt

| # | Câu hỏi | Mặc định nếu chưa chốt |
|---|---|---|
| 1 | Mã màu, font heading/body cho từng sản phẩm | Placeholder trung tính |
| 2 | Provider TTS chính + fallback (giọng nữ) | Theo kết quả nghe mù S3; fallback mặc định `azure-hoaimy` |
| 2b | Có làm giọng thương hiệu riêng bằng VieNeu clone không? Ai cho giọng? | Không, dùng giọng có sẵn |
| 3 | Thư viện nhạc nền có license từ đâu | 3 track placeholder không lời |
| 4 | Giá trị safe zone chính xác theo từng nền tảng | Giá trị mục 5.4 |
| 5 | Mục tiêu loudness (−14 hay −16 LUFS) | −14 LUFS |
| 6 | Ai là dev maintainer, ai được quyền nâng version HyperFrames | — |
| 7 | Nếu Spike S1/S2 fail: chấp nhận quay lại Remotion + mua license? | Dừng chờ quyết định |
