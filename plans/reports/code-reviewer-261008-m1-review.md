# Báo cáo review M1 (redsun-reels)

Ngày: 2026-10-08 (Asia/Saigon). Phạm vi: scripts/lib/*, scripts/*, config/*, templates/_shared/*, templates/{FeatureLaunch,TipOfTheDay}, tests/*. Thư mục không phải git repo nên review trên cây file hiện tại, không có diff.

## Trạng thái kiểm tra

- `corepack pnpm test`: 4 file, 30 test đều pass.
- `corepack pnpm typecheck` (tsc --noEmit): sạch, không lỗi.
- Không chạy render (theo yêu cầu). Các finding liên quan hành vi render/ffmpeg là suy luận từ code, chưa chạy thực tế; đã ghi rõ ở từng mục.

## Critical

Không có. Không thấy path traversal/rm nguy hiểm: `stageProject` chặn tên bằng `SAFE_NAME`, slug bị chặn bởi `SLUG_PATTERN`, `rmSync` chỉ chạm `out/stage/<tên an toàn>`; text vào DOM bằng `textContent`; `injectDefaults` escape `&` và `'` đúng thứ tự nên không chèn được vào thuộc tính HTML.

## High

### H1. `media()` tạo `<video>` không có timing clip, video asset (mp4/mov/webm) nhiều khả năng không phát khi render
- File: `templates/_shared/scene-kit.js:162-174` (gọi tại dòng 230 và 239); `templates/_shared/kit.css` chỉ có rule `.kit-phone img` (dòng ~160), không có rule cho `video`.
- Kịch bản: brief mẫu §6.1 dùng `assets/sipos/kiem-kho-01.mp4`. `media()` tạo `<video>` chỉ có `src`, `muted`, `playsinline`; thiếu `class="clip"`, `data-start`, `data-duration`, `data-track-index`. HyperFrames chỉ seek/trích frame cho media có timing, nên video sẽ đứng ở frame đầu hoặc trống. Trong `phone`, video không có style nên tràn khung mockup. Mọi fixture hiện chỉ dùng `.png` nên test không phát hiện.
- Cần xác minh bằng 1 lần render fixture có mp4 (chưa chạy theo yêu cầu).
- Sửa: với video, gọi `clip(m, sc.start, sc.duration + T, track)` và thêm `data-media-start`/`muted`; thêm `.kit-phone video { width:100%; height:100%; object-fit:cover }`; thêm 1 fixture e2e dùng mp4 ngắn. `keepClipAudio` (video-types.ts) hiện không được code nào dùng nên loại `khach-hang-noi`/`video-co-nguoi-noi` chưa thể giữ tiếng clip, cần ghi rõ là ngoài phạm vi M1.

### H2. File output lỗi vẫn nằm lại `out/<slug>.mp4` sau khi kiểm spec fail
- File: `scripts/lib/render-video.ts:33-34, 51`.
- Kịch bản: `normalizeAudio` ghi thẳng `out/<slug>.mp4`, rồi mới kiểm LUFS/true peak/fps/thời lượng. Nếu fail, script `throw` nhưng file sai chuẩn vẫn còn trong `out/`; MKT thấy file mp4 và có thể đăng dù lệnh báo lỗi. Ngoài ra nếu `normalizeAudio` throw thì `rawFile` không bị xóa (`rmSync` nằm sau).
- Sửa: ghi ra `<slug>.tmp.mp4`, kiểm spec xong mới `renameSync` sang file cuối; dùng `try/finally` để xóa raw và tmp; khi fail thì xóa file đích cũ (tránh bản cũ gây hiểu nhầm là bản mới).

## Medium

### M1. `validate` báo hợp lệ nhưng `build` fail với 16/19 phong cách (chưa có preset)
- File: `scripts/lib/validate-video.ts` (không gọi `loadStylePreset`); `config/style-preset.schema.ts:44-46`; `scripts/lib/build-props.ts:42`.
- Kịch bản: `style: sang-trong` qua `ScriptSchema` (enum 19 giá trị) và validate không có lỗi, in "Kịch bản hợp lệ". Khi `make` mới lỗi "chưa có preset ... sẽ có ở M3". Skill `tao-reel` dùng validate làm cổng nên MKT được báo sai.
- Ngoài ra `catch {}` ở dòng 43 nuốt mọi lỗi (JSON hỏng cũng báo "chưa có preset"), còn `StylePresetSchema.parse(raw)` ném `ZodError` có message là JSON tiếng Anh, `runCommand` in thẳng cho MKT.
- Sửa: trong `validateVideo` thêm bước thử `loadStylePreset`, trả `err(...)` tiếng Việt; phân biệt ENOENT với lỗi parse/schema (dùng `safeParse` + `zodIssues`).

### M2. Validate không đối chiếu `style`, `occasion`, `music`, `cta` của brief với script
- File: `scripts/lib/validate-video.ts:88-100`; `scripts/lib/resolve-style.ts` chỉ được test dùng, không có nơi nào trong pipeline gọi.
- Kịch bản: brief ghi `style: sang-trong` hoặc `occasion: 8-3`, script.json ghi `style: toi-gian`, validate không báo. Tương tự `brief.music` cụ thể khác `script.music`. REQUIREMENTS §7.3 và §9 ("validate ... videoType/style") yêu cầu ưu tiên style MKT chọn > dịp lễ > mặc định.
- Sửa: gọi `resolveStyle` khi brief có `style` khác `auto`/rỗng hoặc có `occasion`; lỗi nếu script.style khác kết quả; cảnh báo nếu `brief.music` không `auto` và khác `script.music`. Bổ sung kiểm `mood` của track có chứa style (§8.3, `music: auto` chọn theo mood) hoặc ghi rõ là hoãn.

### M3. Thông điệp lỗi kỹ thuật tiếng Anh/đường dẫn tuyệt đối đưa tới người dùng không chuyên
- File: `scripts/lib/build-video.ts:39,42` (nguyên văn stdout/stderr của `hyperframes lint/check`); `scripts/lib/render-video.ts:29` (`log.slice(-3000)`); `scripts/lib/loudness.ts:30,37`; `scripts/lib/brief.ts:30,40` (message của parser); `scripts/lib/stage-project.ts:77` (`r.stderr`).
- Kịch bản: lỗi của Chromium/HyperFrames/ffmpeg kèm đường dẫn máy dev, đôi khi stack trace, được `runCommand` in nguyên cho MKT. Không có PII/secret nhưng vi phạm mục tiêu thông điệp tiếng Việt, khó hiểu.
- Sửa: in 1 câu tiếng Việt cho MKT + ghi log chi tiết vào `out/logs/<slug>.log` (đã nằm trong `out/` bị gitignore); chỉ in đuôi log khi có cờ `--verbose`.

### M4. Validate cho phép đường dẫn asset ngoài repo rồi build mới fail; không kiểm containment/kiểu file
- File: `scripts/lib/validate-video.ts:143-145` vs `scripts/lib/stage-project.ts:63-65`.
- Kịch bản: `visual.src: ../../Downloads/x.png` hoặc đường dẫn tuyệt đối: validate chỉ `existsSync(join(REPO_ROOT, a))` nên pass, build mới báo "phải nằm trong repo". `rel.startsWith('..')` còn chặn nhầm file tên `..foo`. `src` là thư mục cũng qua `existsSync`; `src: ".env"` hoặc `brand/music/...` trong repo vẫn được copy vào stage (rủi ro thấp vì render offline và không dùng).
- Sửa: dùng chung 1 hàm `resolveRepoAsset(a)` cho cả validate lẫn stage: `path.relative(REPO_ROOT, abs)` không bắt đầu bằng `..` và không tuyệt đối; kiểm `statSync().isFile()`; whitelist đuôi `png|jpg|jpeg|webp|svg|mp4|mov|webm`; giới hạn thư mục `assets/` hoặc `brand/logos/`.

### M5. Luật nội dung §6.2 chưa được kiểm: số từ `onScreenText`, số ý khi video > 45 giây, id cảnh trùng, `selfScore` bắt buộc
- File: `config/script.schema.ts:10-23, 26-44`; `scripts/lib/validate-video.ts:126-130`.
- Kịch bản: spec ghi `onScreenText ≤ 10 từ`, video ≤ 45s có 1-2 ý, dài hơn tối đa 3 ý, Claude phải tự chấm ≥ 85. Code chỉ giới hạn 80 ký tự; `ideas > 2` chỉ kiểm khi `total <= 45` và không có `repeatRole`; video > 45s không bị giới hạn 3 ý; `selfScore` là `optional` nên script không có điểm vẫn qua; id cảnh trùng nhau cho ra `id="scene-x"` trùng trong DOM (lint HyperFrames có thể lỗi mơ hồ); chuỗi chỉ gồm khoảng trắng vẫn qua `min(1)`. Fixture `dau-tieng-viet` có `onScreenText` 11+ từ nên nếu thêm luật phải chỉnh fixture.
- Sửa: thêm `.trim()` và refine số từ ≤ 10 (cảnh báo cũng được nếu muốn mềm), kiểm id duy nhất, giới hạn 3 ý khi > 45s, và quyết định `selfScore` bắt buộc hay không (cần Nam chốt).

### M6. `preview` dùng `--kill-all` tắt cả các preview HyperFrames không do mình mở
- File: `scripts/preview.ts:19-21, 45`.
- Kịch bản: máy dev đang mở preview HyperFrames khác (dự án khác) sẽ bị tắt. Ngoài ra `buildVideo` xóa `out/stage/<slug>` trước khi `stopAll()`, nên preview cũ đang phục vụ đúng thư mục đó bị xóa dưới chân.
- Sửa: gọi `stopAll()` trước `buildVideo`; nếu CLI hỗ trợ, tắt theo cổng 3002 thay vì `--kill-all` (xác minh `hyperframes preview --help`).

### M7. Kiểm brand lint có kẽ hở
- File: `scripts/lib/lint-brand.ts:15-17, 31`.
- Kịch bản: (a) JS camelCase `style.fontSize = "48px"`, `style.fontFamily`, `style.color = "red"` và tên màu CSS (`color: white`) không bị bắt (chỉ bắt hex/rgb/hsl và kebab-case); (b) `FONT_SIZE_RE` lỗi khi `font-size` nằm trên nhiều dòng; (c) comment khối nhiều dòng `/* ... */` bị xử lý theo từng dòng nên dòng giữa có `#fff` báo oan; (d) `\/\/` sau khoảng trắng bị coi là comment kể cả trong chuỗi; (e) `#add`, `#bad`, `#fade` làm selector id bị báo oan; (f) bỏ qua `.svg`, `.mjs`. Spec §13 chỉ yêu cầu hex/rgb/font-family/font-size px nên (a)-(c) là hạn chế chấp nhận được nhưng nên ghi chú.
- Sửa: thêm regex camelCase JS và danh sách tên màu cơ bản; strip comment khối trên toàn nội dung thay vì từng dòng.

## Low

- L1. `scripts/lib/render-video.ts:22-23`: nếu `opts.out` không kết thúc bằng `.mp4` thì `rawFile === finalFile`, ffmpeg đọc và ghi cùng file rồi `rmSync(rawFile)` xóa luôn bản cuối. Hiện chưa caller nào truyền `out`; thêm assert hoặc bỏ tham số.
- L2. `scripts/lib/loudness.ts:29`: regex `\{[\s\S]*?"input_i"[\s\S]*?\}` bắt đầu từ dấu `{` đầu tiên trong stderr; nếu metadata đầu vào có `{` sẽ ghép sai và `JSON.parse` ném `SyntaxError` lộ message kỹ thuật. Nên lấy khối bắt đầu từ `lastIndexOf('{')` trước `"input_i"`. Cũng nên kiểm `m.input_i` hữu hạn (âm lặng cho `-inf`).
- L3. `scripts/lib/loudness.ts:27`: thời điểm fade-out lấy từ `props.totalSec`, trong khi thời lượng video thật có thể lệch tới 0.2s (dung sai); fade-out lệch nhẹ, chấp nhận được. Có thể dùng `ffprobe` đo thời lượng raw.
- L4. `scripts/lib/cli.ts:17-31`: cờ lạ bị bỏ qua im lặng (`--draf` thành render chất lượng chuẩn); `-draft` một gạch trở thành slug. Nên báo lỗi tiếng Việt với cờ không biết.
- L5. `scripts/lib/build-video.ts:30` ghi `props.json` vào thư mục brief; `scripts/make-all-fixtures.ts:17` truyền thẳng `tests/fixtures/briefs/<id>` nên mỗi lần chạy e2e sửa file trong fixture (dirty tree). Dùng thư mục tạm như `render-test.ts`.
- L6. `scripts/lib/validate-video.ts:109`: chỉ so khớp cảnh CTA đầu tiên (`find`); script có 2 cảnh `cta` vẫn được khi rolesMatch cho phép. Thực tế mẫu loại video chỉ có 1 cta nên rủi ro thấp.
- L7. `templates/_shared/scene-kit.js:119-131, 267`: chuyển cảnh và fade cuối dùng `tl.to` (khác với comment đầu file nói "dùng fromTo"); với seek nhảy cóc của renderer vẫn đúng do GSAP khởi tạo theo thứ tự, nhưng lệch quy tắc ghi trong file. Đề xuất đổi sang `fromTo` cho chắc, hoặc sửa comment.
- L8. Hook trên nhiều dòng (`\n`) bị nối thành 1 chuỗi cách nhau khoảng trắng nên 2 dòng người viết mong muốn bị reflow theo `fitSizes`; chỉ là kỳ vọng hiển thị, ghi chú cho MKT.

## Điểm đã kiểm và không có lỗi

- `injectDefaults`: escape/unescape `&`/`'` đúng thứ tự, `replace` dùng hàm nên không bị diễn giải `$&`; chuỗi người dùng không thoát được khỏi thuộc tính.
- Đường dẫn stage/brief: slug và tên stage đều bị chặn bằng regex; `rmSync` giới hạn trong `out/stage/<tên>`.
- loudnorm 2 lượt: dùng `measured_*` + `offset` + `linear=true`, `-ar 48000` sau `loudnorm` (loudnorm upsample nội bộ 192 kHz) đúng; đích TP -1.5 để dư an toàn so với -1; `ebur128=peak=true` đo true peak đúng.
- Tính xác định: scene-kit không dùng `Math.random`/`Date.now`, không đo DOM khi tween (ước lượng cỡ chữ bằng số ký tự), `repeat` hữu hạn.

## Hành động đề xuất (theo thứ tự)

1. H1: xác minh và sửa media video (clip timing + CSS), thêm fixture mp4.
2. H2: ghi tmp rồi rename sau khi kiểm spec; dọn raw bằng finally.
3. M1 + M2: để `validate` phản ánh đúng khả năng build (preset tồn tại, style/music/occasion khớp brief).
4. M3: bọc lỗi kỹ thuật thành thông điệp tiếng Việt, log chi tiết vào `out/logs/`.
5. M4, M5: dùng chung 1 hàm kiểm asset; bổ sung luật §6.2 còn thiếu.
6. M6, M7 và các mục Low khi tiện.

## Câu hỏi chưa giải quyết

- `selfScore` có bắt buộc trong `script.json` không (spec chỉ ghi "Claude tự chấm", schema đang để optional)?
- `onScreenText ≤ 10 từ` là lỗi cứng hay cảnh báo (fixture dấu tiếng Việt hiện vượt)?
- Loại clip có tiếng (`keepClipAudio`) có nằm trong M1 hay để M3/M4? Hiện chưa có code xử lý.
- `hyperframes preview` có tùy chọn tắt theo cổng thay cho `--kill-all` không?

Status: DONE_WITH_CONCERNS
