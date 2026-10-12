---
name: dung-canh-ai
description: Làm video người thật do AI tạo của redsun-reels (kiểu hình nguoi-that-ai) cho đạt chất lượng — kịch bản một mạch, kế hoạch cảnh và prompt theo khuôn 8 thành phần, một khung hình chung (một bối cảnh, cảnh toàn đủ mọi người), một mạch liên tục (một lần tạo hoặc chuỗi nối tiếp), nhân vật nói thoại khớp môi ngay trong clip (không người dẫn), tạo bằng ./reel ai, soát clip, dựng liền mạch, thông điệp cuối đè lên cuối clip. Dùng ở mọi video có kieuHinh nguoi-that-ai, ngay sau khi chọn concept (skill tao-reel gọi) và khi dựng (skill dung-video gọi); hoặc khi người dùng nói "video AI", "người thật AI", "làm lại cảnh AI", "prompt Veo/Seedance/Kling".
model: claude-opus-5-5
---

# Dựng cảnh người thật AI

Nam 2026-10-12 (docs/decisions.md §40–41): "video AI phải là 1 khung hình chung", "phải là 1 video xuyên suốt, không phải cảnh ghép cắt từ nhiều phân đoạn", "không cần giọng dẫn truyện riêng, thông điệp thể hiện trong chính toàn bộ nhân vật", "nên bỏ luật nhân vật AI không nói", "tất cả yêu cầu phải thành skill để tất cả video sau này đều được tối ưu hoá về chất lượng".

Skill này là **nguồn luật duy nhất** cho chất lượng video người thật AI. Chia việc với skill khác:
- `chon-kieu-hinh`: hỏi kiểu hình, số tiền; **luật cứng pháp lý** (nhãn AI 4 lớp, không người có danh tính, loại video cấm, không sửa luật). Luật cứng đứng trên skill này.
- `tao-reel`: brief, concept, luật kịch bản (LUẬT 1, LUẬT 2, người xem theo sản phẩm, kiểu kể). Kịch bản video AI viết theo mục 1 dưới.
- `dung-video`: kỹ thuật HyperFrames (composition, tiếng động, snap, render). Phần AI dựng theo mục 5 dưới.
- `giong-doc`: chỉ cho video **không** có cảnh AI (hoạt hình, quay sẵn). Video AI: giọng do model tạo trong clip.

## Luật chất lượng (mọi video người thật AI, không ngoại lệ)
1. **Một khung hình chung**: mọi nhân vật ở **cùng một nơi, cùng lúc**. `chung` tả một nơi duy nhất (không gian, đồ đạc, ánh sáng, giờ). Mỗi vai khai `viTri` (đứng/ngồi ở đâu, quay về ai) để mọi cảnh cận cắt ra từ cùng không gian.
2. **Có cảnh toàn** (`toanCanh: true`) thấy cả bối cảnh và đủ mọi vai, thường là shot mở và shot kết; cảnh cận nằm giữa.
3. **Một mạch liên tục**: phần AI là **một lần tạo**, hoặc chuỗi lần tạo nối tiếp (`noiTiep`: khung cuối lần trước làm khung đầu lần sau). Bản dựng chiếu clip **liền mạch theo thứ tự tạo**: không cắt nhặt đoạn, không đảo, không chiếu lại, không xen kẽ clip, không phóng/cắt khung để giấu gì. Chuyển cảnh, cận, phản ứng đều nằm trong prompt.
4. **Hình đúng vai** (`vaiTro` + `moTa`): trang phục, đạo cụ, tư thế đúng nghề và đúng người xem của sản phẩm (REDSUN BOS: công ty — sơ mi/blazer công sở, thẻ nhân viên không chữ, laptop; SIPOS: quán — tạp dề, quầy; Webino: chủ website/shop online). Cảm xúc bằng diễn xuất và góc máy, **không bằng hiệu ứng da mặt** (mồ hôi giọt to, mặt ướt, nước mắt giả).
5. **Hành động chính rõ và có lực**: shot đủ rộng thấy người làm + vật bị tác động + người phản ứng (sếp **đứng** đầu bàn đập tay xuống, cốc giấy nảy, cả phòng giật mình). Tả **ai · ở đâu · giây nào · làm gì · kết quả thấy được**; một hành động chính mỗi shot; rồi cắt sang cận phản ứng.
6. **Nhân vật nói thật trong clip** (bỏ luật "nhân vật AI không nói", Nam 2026-10-12): thoại khớp môi do model tạo cùng clip (`coTieng: true`, mặc định). Viết thoại theo cú pháp dấu hai chấm `the director says: "Khách cần gì, trả lời đi!"`, tiếng Việt, **tên thương hiệu viết theo cách đọc** (REDSUN BOS → "Red sun bi-ô-ét", SIPOS → "Xi pốt", Webino → "Web-bi-nô", redsun.vn → "Red sun chấm vi en"). Mỗi vai một chất giọng (`giongNoi`) giữ suốt video, xen nam nữ. **Mỗi câu thoại ghi cách nói theo độ căng của shot** (Nam 2026-10-12: "sếp phải quát lớn khi đưa ra yêu cầu, phù hợp với tình hình căng thẳng"): âm lượng, cảm xúc, nhịp, kèm hành động đi cùng — lúc căng: `the director slams the table and shouts loudly, furious and sharp: "…"`; người bị dồn: `she stammers quietly, voice trembling, too fast: "…"`; lúc chốt hạ lạnh: `he says slowly and coldly, almost a growl: "…"`; sau giải pháp: `she answers firmly and confidently, relieved: "…"`; kết: `he nods and says warmly, satisfied: "…"`. Độ to và gắt **leo thang** theo bảng nhịp tới cú vỡ, rồi dịu xuống ở phần giải pháp. Máy chặn câu thoại thiếu cách nói. Một câu thoại vừa với độ dài shot (khoảng 2–6 giây nói tự nhiên); không câu một chữ (model nói ú ớ), không đoạn quá dài (nói vội).
7. **Không giọng người dẫn**: thông điệp thể hiện qua chính các nhân vật (lời thoại, hành động, nét mặt). Không ghép giọng VieNeu lên clip AI.
8. **Thông điệp cuối nằm trong mạch**: logo sản phẩm + nút lời kêu gọi (đúng `cta` của kịch bản) **đè lên 2,5–3 giây cuối của chính clip** trong lúc câu chuyện vẫn chạy; câu chốt do một nhân vật nói trong truyện, khép vòng câu mở đầu; lời kêu gọi là chữ trên nút (có thể để nhân vật nói nếu tự nhiên). Không cắt sang tấm nền màu riêng.
9. **Màn hình sản phẩm, chữ, số, logo không do AI vẽ**: màn hình trong clip quay đi hoặc mờ; giao diện sản phẩm, tin nhắn, số liệu là lớp HyperFrames phủ lên, đúng tính năng có trong `brand/products.json`.

## 1. Kịch bản viết cho một mạch
- Câu chuyện chạy **theo đúng thứ tự thời gian**, trong một bối cảnh, như một cảnh phim quay liền; trước/sau trong cùng mạch (vd. trước: cả phòng lục chat, khách bỏ đi → sau: mở REDSUN BOS, AI tóm tắt, trả lời ngay), không tua lại.
- **Độ dài video = độ dài phần AI** (một lần tạo hoặc chuỗi), không thêm tấm kết riêng. Chọn model theo độ dài cần (giá có tiếng, đọc lúc chạy từ OpenRouter):

  | Model (`mohinh`) | Mỗi lần | Cỡ | Giá khoảng | Ghi chú |
  |---|---|---|---|---|
  | `seedance` (Seedance 2.0 Fast) | 4–15 giây | 720p | ~2.360đ/giây, có tiếng không thêm tiền | Mặc định cho video AI một mạch (Nam chọn 2026-10-12) |
  | `veo` (Veo 3.1 Lite) | 4, 6, 8 giây | 1080p | ~2.080đ/giây có tiếng | Một mạch ngắn; dài hơn cần `noiTiep` (chưa thử với người thật) |
  | Seedance 2.5 | tới 30 giây | 720p | ~6.000đ/giây | Vượt trần 50.000đ/video; chỉ khi Nam nâng trần |
- Bảng nhịp (`concepts.md`) ghi từng shot: giây · ai · làm gì · máy quay đặt đâu.
- **Bảng thoại** (`concepts.md` mục `## Bảng thoại`, bắt buộc, Nam 2026-10-12: "phải xong kịch bản, yêu cầu giọng từng phân cảnh, từng nhân vật cho phù hợp bối cảnh trước"): mỗi câu một dòng `| Giây | Shot | Nhân vật | Câu thoại | Cách nói | Vì sao |` — cách nói gồm âm lượng (quát lớn / nói to / bình thường / nhỏ / thì thầm), cảm xúc, nhịp (gằn từng chữ / nhanh lắp bắp / chậm lạnh), hành động đi cùng; "vì sao" nói độ căng của cảnh lúc đó. Kèm bảng **dàn giọng**: nhân vật · chất giọng gốc (`giongNoi`) · đường cảm xúc qua video.
- **DỪNG chờ duyệt kịch bản + bảng thoại** trước khi tạo clip (tốn tiền, sửa sau đắt): gửi bảng cho MKT/Nam (`./reel moc <tên> hoi`), ghi `Đã duyệt: <ai>, <ngày>` dưới bảng thoại. `./reel ai` từ chối tạo clip có thoại khi thiếu bảng, thiếu cột hoặc chưa duyệt. Đây là điểm dừng thứ hai của video AI (sau câu hỏi kiểu hình).

## 2. Kế hoạch cảnh `ai/canh-ai.json`
| Trường | Thành phần | Viết gì (tiếng Anh) |
|---|---|---|
| `mohinh` | | `seedance` / `veo` theo mục 1 |
| `chung` | Bối cảnh | Một nơi duy nhất: phòng, đồ đạc, cửa, giờ trong ngày |
| `phongCach` | Phong cách | vd. "cinematic corporate drama, 35mm film look, muted teal palette" |
| `anhSang` | Ánh sáng, không khí | vd. "cool overcast daylight through glass, tense quiet room" |
| `amThanh` | Âm thanh | Tiếng môi trường + tiếng động ("quiet office ambience, a sharp palm slap on the table at 1s, no music") — nhạc nền do dự án lồng |
| `coTieng` | | `true` (mặc định): clip có thoại + tiếng |
| `dan[vai].moTa` | Chủ thể | Tuổi, giới, tóc, mắt, nét mặt, từng món trang phục, phụ kiện đặc trưng |
| `dan[vai].vaiTro` | Chủ thể | Vai trong truyện, để model dựng đúng hình vai |
| `dan[vai].viTri` | Bố cục | Đứng/ngồi ở đâu trong bối cảnh chung, quay về ai |
| `dan[vai].giongNoi` | Âm thanh | Chất giọng giữ suốt video ("deep, calm, cold male voice, southern Vietnamese accent") |
| `canh[].moTa` | Hành động + máy quay + bố cục | Danh sách shot theo mốc giây (mục 3) |
| `canh[].toanCanh` / `noiTiep` | | Luật 2 / luật 3 |

Máy ghép prompt theo 8 nhãn (SUBJECTS · CONTEXT · ACTION, CAMERA AND COMPOSITION · STYLE · AMBIANCE AND LIGHTING · AUDIO) và gắn câu luật cứng `promptRules`.

## 3. Viết danh sách shot (`moTa`)
Mẫu và thuật ngữ: [../dung-video/references/ngon-ngu-may-quay.md](../dung-video/references/ngon-ngu-may-quay.md) mục 2b, 2c.
- Mở bằng **số shot + tổng giây**: "7 hard-cut shots, total 15s, one continuous meeting in story order."
- Mỗi shot: `Shot N (a-bs): <cỡ cảnh>, camera <vị trí cụ thể> (that's where the camera is), <ai làm gì, vi biểu cảm theo chuỗi first… then… finally…>, <ai says: "…">`.
- Shot 1 là **cảnh toàn** đủ mọi người; hành động chính quay trung/toàn; thoại đặt ở shot thấy người nói (khớp môi) hoặc qua vai khi cần thấy phản ứng người nghe.
- Model hay **lệch mốc giây khoảng 1 giây** và làm sai tư thế (vd. ngồi thay vì đứng): ghi rõ "standing", "both feet", vị trí tay; nhắc lại tư thế ở shot sau.
- Câu phủ định cụ thể: no subtitles, no on-screen text, no watermark, no distorted hands, natural skin with no exaggerated sweat.

## 4. Tạo clip
- `./reel ai <tên> --video` **chạy nền** (Bash `run_in_background`), viết composition trong lúc chờ. Máy chặn trước khi tốn tiền khi kế hoạch thiếu luật (bảng "Máy kiểm" dưới). Lệnh ước tiền trước, chạm trần 50.000đ/video thì dừng; báo "đã gửi nhưng chưa xác nhận được" thì **không gửi lại**, chạy lại cùng lệnh; lỗi "Internal error" của nhà cung cấp thì chạy lại một lần.
- Chuỗi `noiTiep`: chạy lại lệnh sau khi clip trước xong (máy tự lấy khung cuối làm khung đầu).
- Cách `anh-vai` (duyệt mặt trước): `./reel ai <tên>` → ảnh vai `ai/vai-<vai>.png` gửi người duyệt (`"duyet": true`) → khung đầu `ai/<id>-dau.png` (Claude soát, `"duyetKhung": true`) → `--video`. Khung đầu cảnh toàn có đủ mọi vai (tối đa 3 ảnh tham chiếu). Tư thế đơn giản, đếm tay từng người.

## 5. Soát clip (bắt buộc trước khi dựng)
1. **Đo mốc cắt shot thật**: `ffmpeg -i ai/<id>.mp4 -vf "select='gt(scene,0.25)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"`. Mọi lớp phủ, chữ, tiếng động, câu phụ đề đặt theo **mốc thật**, không theo mốc trong prompt.
2. **Dải khung** 2 khung/giây (`fps=2,tile`), mở xem: đúng người ở mọi shot, đếm tay, trang phục đúng vai, hành động chính thấy rõ, không chữ rác, màn hình quay đi.
3. **Tiếng**: đo đoạn có tiếng nói (`silencedetect` trên tiếng clip) để đặt phụ đề; Claude không nghe được → gửi clip cho người duyệt nghe thoại (đúng chữ, đúng tên thương hiệu, có cảm xúc). Câu sai/thiếu cảm xúc: sửa thoại trong prompt rồi tạo lại (còn trần), không vá bằng giọng VieNeu.
4. Shot lỗi nặng (sai người, thừa tay, sai hành động chính) → sửa prompt, tạo lại cả lần tạo (còn trần); không cắt bỏ đoạn lỗi.

## 6. Dựng (theo `dung-video`, thêm luật dưới)
- Mỗi lần tạo một thẻ `<video id="…" src="ai/<id>.mp4" data-start data-duration data-media-start="0">` **không `muted`** (giữ thoại trong clip); chuỗi `noiTiep` nối sát nhau. Máy quay HyperFrames chỉ trôi nhẹ / rung tay trên lớp bọc cả mạch.
- Nhạc nền nhỏ dưới thoại: `<audio id="music" … data-volume="0.3">`; khoảng lặng `lang` trong `tieng-dong.txt` trước khoảnh khắc vỡ lẽ, tiếng nhấn to nhất đúng lúc đó.
- Phụ đề `.rs-sub` (chữ tĩnh, đúng lời thoại) hiện theo đoạn tiếng nói đo được; lớp phủ (ô chat, tin khách, màn hình sản phẩm) đặt theo mốc shot thật, không che mặt ở khoảnh khắc cảm xúc.
- Thông điệp cuối theo luật 8; nhãn AI theo luật cứng của `chon-kieu-hinh` (caption tự ghi "hình ảnh và giọng đọc do AI tạo").
- Không có `dung-rieng/loi-doc.json` (không VieNeu).

## 7. Tự soát trước khi xuất
- [ ] Một bối cảnh, mở và kết bằng cảnh toàn đủ mọi người.
- [ ] Clip chiếu liền mạch từ đầu tới cuối, không cắt nhặt/đảo/xen kẽ; video kết thúc cùng clip.
- [ ] Hình đúng vai, không hiệu ứng da mặt giả; hành động chính thấy rõ, có người phản ứng.
- [ ] Thoại khớp môi, đúng chữ, tên thương hiệu đọc đúng, mỗi vai một giọng, có cảm xúc (người duyệt nghe).
- [ ] Không người dẫn; câu chốt do nhân vật nói, khép vòng câu mở đầu; logo + nút đè lên cuối clip.
- [ ] Lớp phủ, phụ đề, tiếng động đặt theo mốc shot thật; không che mặt lúc cảm xúc.
- [ ] Đủ luật kịch bản (`tao-reel`) và luật cứng nhãn AI (`chon-kieu-hinh`).

## Máy kiểm (lỗi ✗ chặn)
| Luật | Kiểm ở |
|---|---|
| Thiếu bảng thoại / bảng thoại thiếu cột / chưa "Đã duyệt" (clip có thoại) | `./reel ai` (`scriptGateIssues`) |
| Thiếu `chung`, `phongCach`, `anhSang`, `amThanh`; vai thiếu `vaiTro`/`viTri`; vai thiếu `giongNoi` khi có thoại; câu thoại thiếu cách nói (âm lượng/cảm xúc/nhịp); không có cảnh toàn đủ mọi vai; vai lộ mặt không cùng một lần tạo hay chuỗi `noiTiep`; Veo quá 8 giây | `./reel ai` (`scripts/lib/ai-scene-spec.ts` `specIssues`) |
| Clip AI bị nhảy đoạn, quay lại, xen kẽ | `./reel validate` (`scripts/lib/custom-video.ts` `aiContinuityIssues`) |
| Video có cảnh AI mà còn giọng người dẫn VieNeu | validate |
| Drama: ít hơn 2 chất giọng nhân vật (`dan[].giongNoi`) | validate |
| Nhãn AI ghi cả giọng khi clip có tiếng | validate, `./reel post` (`hasAiVoice`) |
| Đứng hình, lặng trước vỡ lẽ, chuyển hình trên phách | `./reel render` |
