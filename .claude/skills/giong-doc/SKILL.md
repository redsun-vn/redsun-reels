---
name: giong-doc
description: Làm giọng đọc AI cho video dựng riêng của redsun-reels bằng VieNeu (giọng tiếng Việt chuẩn vùng miền) — dàn giọng theo vai (mỗi nhân vật một giọng, giới tính khớp người trên hình, có giọng người dẫn), lời đọc theo brief, thoại đặt ngoài khung (không ghép lên miệng người mẫu), người dẫn kể trên mặt người phản ứng và đọc thông điệp cuối, tạo bằng ./reel giong, dựng hình theo độ dài giọng, chữ nhỏ, nhãn "Do AI sản xuất". Dùng khi video có lời thoại/người nói/lời dẫn, khi MKT nói "lồng tiếng", "có giọng", "giọng đọc", "thêm tiếng nói", "đổi giọng", hoặc skill dung-video tới bước giọng.
model: claude-opus-5-5
---

# Giọng đọc AI (VieNeu)

Nam chốt 2026-10-10 (REQUIREMENTS v0.6 §8.5, `docs/decisions.md` §27–29). Mục tiêu: video có giọng mà **không thành lồng tiếng rẻ tiền**; giọng chuẩn tiếng Việt, đúng vùng miền; **mặc định một giọng kể** (Nam 2026-10-10: "1 giọng tốt hơn nhiều giọng"), nhiều giọng chỉ khi MKT yêu cầu; thông điệp cuối được đọc. Nguồn giọng: **VieNeu** (`./reel giong`, khoá `VIENEU_API_KEY` trong `.env`). Claude không nghe được âm thanh: **người nghe duyệt** dàn giọng và bản cuối.

Nói với MKT tiếng Việt, câu ngắn, không thuật ngữ. Chỉ ghi file trong `briefs/<tên-video>/`.

## LUẬT SỐ 1 — 3 giây đầu (mạnh nhất, đứng trên mọi luật khác)
Nam 2026-10-10: "đây là video reel, chúng ta chỉ có 03s đầu tiên để thu hút người xem"; "luật 3 giây đầu phải là mạnh nhất". Mọi lựa chọn khác (thứ tự cảnh của brief, nhịp, phong cách, chữ) nhường cho luật này:
- **Chọn điểm hấp dẫn nhất trong brief** theo `tao-reel/references/chon-diem-hap-dan.md` (bảng ứng viên + điểm 5 tiêu chí ghi ở mục `## Điểm hấp dẫn` của `concepts.md`); hook ≥ 20/25, ghi `Hook N/25` trong `selfScore.notes`.
- **Mở bằng điểm mạnh nhất, kể lại sau**: khung ở giây 0 đã là hình mạnh nhất; không logo, không chào, không dạo đầu chậm; được đảo thứ tự cảnh của brief (giữ đủ ý, lời nói và điều cấm).
- **Biến động trong 1 giây đầu** (dập, cắt, rung, chớp) trên phách, kèm tiếng nhấn.
- **Có giọng**: câu hook bắt đầu ≤ 0,3 giây, ≤ 8 từ, đọc xong trước giây 2,5.
- **Máy chặn từ bước kịch bản** (`./reel validate`, trước khi dựng): thiếu `concept.diemHapDan` hoặc dưới 20/25, `concepts.md` thiếu `## Điểm hấp dẫn`, cảnh hook dài hơn 3,5 giây, hook quá 8 từ, thiếu `Hook N/25` trong `selfScore.notes`. Sau đó: câu giọng đầu > 0,3 giây (validate), giây đầu không có biến động mạnh (render). Không báo "xong" khi còn ✗ LUẬT SỐ 1.
- **Luật cứng reel 15–30 giây** (Nam 2026-10-10: tỷ lệ xem hết cao hơn, thuật toán phân phối rộng hơn): brief và tổng kịch bản phải trong 15–30 giây (khoảng của loại video giao với 15–30); validate chặn.

## Khi nào dùng
- Video dựng riêng (`"build": "custom"`) có lời nói trong brief (thoại nhân vật, lời dẫn), mọi kiểu hình. Mặc định có giọng; không giọng khi MKT nói "không cần giọng".
- Máy báo "Chưa có VIENEU_API_KEY": nói MKT "máy này chưa có khoá giọng đọc, nhắn Nam". Video đã có giọng vẫn dựng/xuất được.

## 0. Luật dựng khi có giọng (bắt buộc, máy kiểm)
Bài học bản 3–4 (Nam: "nếu không có giọng nói, mọi thứ đều tốt, có giọng thì thành video vớ vẩn"; "vẫn còn cảnh người cười mà không có text hay giọng đọc, rất vô duyên"; "thông điệp cuối cùng… lại không được đọc"):
- **Thoại nhân vật ngoài khung**: lời của một vai đặt lên cảnh **không thấy mặt vai đó** (bàn tay, sổ, ảnh chụp, điện thoại, sau lưng). Validate chặn câu trùng > 0,12 giây lúc thấy mặt chính vai đó.
- **Mặt người = phản ứng im lặng**, đúng cảm xúc câu vừa nói; clip khai `--mieng=im` (cười, khóc, nhíu mày, mím môi, chống cằm, ôm đầu). Đoạn người mẫu đang nói (`--mieng=noi`) không dùng.
- **Không có cảnh mặt người trơn**: khi mặt người phản ứng, **người dẫn** (`nguoi-dan`) kể tiếp (lời nói của brief) — giọng dẫn không phải người trong hình nên không thành lồng tiếng. Ngoại lệ: khoảng lặng ngắn trước vỡ lẽ (`lang`, ≤ 0,6 giây).
- **Cảnh kết có giọng**: người dẫn đọc thông điệp sản phẩm + lời kêu gọi (theo brief, vd. "SIPOS. Nhắn tin để được tư vấn nha!"). Validate chặn khi cảnh CTA không có câu nào.
- **Giới tính giọng khớp người trên hình**: vai lộ mặt dùng giọng cùng giới với người mẫu; vai không lộ mặt (bàn tay, người dẫn) chọn tự do — xen giọng nam/nữ cho sinh động.
- **Phụ đề theo giọng**: video người thật (ít chữ) thì có phụ đề; **video hoạt hình đã nhiều chữ** (bóng thoại, bảng chữ, nhãn đạo cụ) thì **không thêm phụ đề theo giọng** (Nam 2026-10-10). Video hoạt hình có giọng: một giọng kể (mặc định Duyên Hà My), nhân vật vẽ không mấp máy miệng (`RS.talk`) khi người kể đọc.
- **Chữ nhỏ, ít**: không chữ to (validate cảnh báo `--type-hero/h1/h2`); chữ nhấn là **nhãn nhỏ gắn vào vật** (`.tag`, `--type-caption`) bật đúng lúc giọng tới chữ đó: `RS.loiAt("<id>", "<cụm chữ>")`. Phụ đề: `<div class="rs-sub rs-loi" data-loi="<id>">` + `RS.loiSubs(tl)` (giờ lấy từ giọng thật lúc dựng); câu dài chia `<div>` từng dòng cân nhau.
- **Dựng theo giọng**: tạo giọng trước (`./reel giong <tên> --cho=6`), đọc độ dài từ `giong/nhat-ky.json`, rồi mới viết bảng nhịp (giây | hình | giọng) và đặt `at` từng câu; cắt cảnh ở ranh giới câu, trúng phách.
- **Nhãn AI**: `<div class="rs-nhan-ai" data-nhan-ai>Do AI sản xuất</div>` (con trực tiếp của gốc; nhỏ, mờ, sát góc trên trái). Caption tự mở đầu "⚠️ Video có giọng đọc do AI tạo." (`./reel post`).
- **Bấm nút**: dùng bàn tay của bộ dụng cụ (`RS.tayBam(el)`, `RS.bam(tl, el, giây, nút)`), không vẽ khối tròn hay con trỏ.

## 1. Dàn giọng (một lần mỗi video)
**Mặc định một giọng**: một vai `nguoi-dan` = **Duyên Hà My** (nữ miền Nam, `gioi: "nu"`) kể toàn bộ, kể cả lời thoại của brief (vd. "Chuyện là, khách chìa ảnh: “Em chuyển rồi nha.” Nhân viên: “Dạ vâng ạ.”"). Nam so 1 giọng với 4 giọng (2026-10-10): 1 giọng tốt hơn. Dàn nhiều giọng (mỗi nhân vật một giọng, như dưới) chỉ khi MKT nói "mỗi nhân vật một giọng".

`briefs/<tên>/dung-rieng/loi-doc.json` mục `dan`: mỗi vai `{ giong, gioi: "nu"|"nam", hoSo }`, mỗi vai một giọng **khác nhau** (validate chặn trùng). Tên giọng lấy từ danh mục VieNeu v4 (`./reel giong` kiểm tên trước khi tạo): `curl -s "https://api.vieneu.io/api/v1/voices?engine=v4"` — mỗi giọng có giới tính, vùng (`south`/`north`/`central`) và mô tả.
- Chọn giọng **đúng vùng** (`giongVung` của video, mặc định miền Nam) và hợp tính cách vai (mô tả "Cảm xúc", "Truyền cảm", "Vui nhộn", "Kể chuyện"…).
- **Thử giọng**: tạo mẫu 3–5 giọng mỗi vai bằng chính lời kịch bản, ghép mỗi vai một file gửi người duyệt chọn (Claude không tự chọn bằng tai). Dàn đã duyệt cho "Chuyển khoản giả mạo": chủ quán Tưởng Vy, nhân viên Cẩm Hồng, khách Anh Phi (nam), người dẫn Đăng Quân (nam). Giữ một giọng cho một nhân vật qua các video cùng chiến dịch.

## 2. Viết lời đọc
Mỗi câu trong `cau`: `id`, `vai`, `at` (giây), `loi`, `camXuc` (để kiểm mặt người phản ứng), tuỳ chọn `cuongDo` (1–5), `boiCanh`, `dienXuat` (ghi cho người viết/nghe duyệt), `phongCach` (`natural` thoại, `storytelling` kể — mặc định người dẫn kể chuyện).
- **Bám lời nói của brief**: lời dẫn lấy đúng câu brief ghi ("Lời nói: …"); thoại nhân vật ngắn (≤ 8 từ), đời thường.
- VieNeu **không nhận ghi chú đạo diễn**: cảm xúc đến từ chọn giọng, kiểu đọc, **từ cảm thán và dấu câu** ("Trời đất ơi!", "Ủa?!", "…vậy nè?!", "Woa!") và 3 thẻ chèn: `[cười]`, `[thở dài]`, `[hắng giọng]` (thẻ khác bị bỏ khi gửi; `[cười lớn]`→`[cười]`, `[thở phào]`/`[nghẹn]`→`[thở dài]`).
- **Giọng miền Nam thật**: "nè", "nha", "luôn á", "quá trời", "lẹ", "hông"; không "vâng", "nhé", "thế". VieNeu đọc chữ như gửi: nghe lại tên thương hiệu ("SIPOS").
- **Không bịa** (như kịch bản): số, giá, ưu đãi, tính năng chỉ từ brief/kịch bản (validate chặn số lạ). Lời khen sản phẩm chỉ trên cảnh màn hình/logo (giấy phép Pexels: không ngụ ý người mẫu ủng hộ).

## 3. Tạo giọng
`./reel giong <tên>`: mỗi câu một bản VieNeu (WAV 24 kHz), kiểm trên máy (không câm, không quá ngắn/dài, vừa chỗ trống đến câu sau hoặc khoảng lặng `lang`), cắt lặng đầu cuối; bản hỏng thì tạo lại (tối đa 3 lần). Câu đã có và lời/giọng không đổi thì bỏ qua; làm lại một câu: `--cau=<id> --lai`. Kết quả: `dung-rieng/giong/<id>.wav` + `giong/nhat-ky.json` (lời gửi, giọng, kiểu đọc, độ dài, token) — commit cả hai.
- **Trần**: 20.000 token VieNeu mỗi video (`config/cost.ts`); token = max(50, số ký tự) × 3 × 1,3 mỗi câu. Một video ~12 câu tốn khoảng 2.500 token. Chạm trần hoặc hết hạn mức ngày của gói thì lệnh dừng, giữ câu đã có, báo; không tự đổi nguồn giọng.

## 4. Gắn vào video
- `index.html`: dòng `<!-- GIONG-DOC -->` ngay sau thẻ nhạc (bước dựng thay bằng thẻ giọng + giờ thật `window.RS_LOI`); không viết tay thẻ `<audio src="giong/…">`. Nhạc nền tự hạ khi có lời (gộp với khoảng lặng của `tieng-dong.txt`).
- Lời dài đặt lên cảnh chèn (`.ins` + `RS.set` bối cảnh, hiện/tắt theo giây); mặt người là clip ở lớp dưới.

## 5. Kiểm
`./reel validate <tên>` không còn ✗; `./reel snap` soát mọi khung có giọng/phụ đề, nhãn nhỏ không đè chữ; `./reel render` (đo −14 LUFS, lặng trước vỡ lẽ, đứng hình). **Gửi người duyệt nghe** kèm video; câu nào chưa ưng ("nghe gắt", "đọc sai tên", "thiếu cảm xúc") thì sửa lời/dấu câu/thẻ hoặc đổi giọng vai đó rồi `--cau=<id> --lai`.

## Luật được kiểm bằng máy
| Luật | Chặn ở |
|---|---|
| Mỗi vai một giọng, có trong danh mục VieNeu, khai giới tính | validate, `./reel giong` |
| Mọi câu có file giọng (bản soát hình được thiếu) | validate, bước dựng |
| Câu không đè câu trước (lưu ý), không quá cuối video, không rơi vào khoảng lặng (lưu ý) | validate |
| Số trong lời đọc có trong brief/kịch bản | validate |
| Thoại không trùng lúc thấy mặt chính vai đó; clip lộ mặt khai `--mieng=im` | validate (`scripts/lib/voice-sync.ts`), `./reel quay-san` |
| Cảnh CTA có câu được đọc | validate |
| Chữ cỡ lớn khi có giọng | validate (cảnh báo) |
| Nhãn "Do AI sản xuất" trên hình, caption mở đầu bằng nhãn, dấu AI trong file MP4 | validate, render |
| Người trong clip quay sẵn là người châu Á (`--chau-a`) | validate, `./reel quay-san` |
| Bản giọng hỏng/dài hơn chỗ trống bị tạo lại; lặng đầu cuối tự cắt; trần token | `./reel giong` |

## Không làm
- Không ghép giọng lên miệng người mẫu đang nói; không để mặt người trơn không lời (trừ khoảng lặng ngắn).
- Không giọng clone người thật, không bắt chước giọng người nổi tiếng, không đặt lời vào miệng người thật có thật (khách hàng, nhân viên REDSUN).
- Không dùng nguồn giọng khác (Gemini, Edge TTS, ElevenLabs…) khi chưa có quyết định của Nam.
- Không sửa `config/`, `scripts/` (việc của dev).
