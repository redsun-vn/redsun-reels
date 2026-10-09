# Định dạng script.json

Schema chuẩn: `config/script.schema.ts`. `./reel validate <tên-video>` kiểm toàn bộ quy tắc dưới đây.

## Trường

| Trường | Ý nghĩa |
|---|---|
| `concept` | `{ title, bigIdea, hookAngle }`. `hookAngle` là một trong: `con-so`, `lat-nguoc`, `truoc-sau`, `thuong-hieu`, `sap-thay-doi`, `cau-hoi-noi-dau`, `quote` |
| `videoType` | id loại video (`./reel info`) |
| `style` | id phong cách đã dựng được (`./reel info`) |
| `template` | Template của loại video (`./reel info <loại>`); với dựng riêng chỉ để quy định thứ tự cảnh gợi ý |
| `build` | `"custom"` = dựng riêng (mặc định cho video mới, composition ở `dung-rieng/index.html`, skill `dung-video`); bỏ trống = mẫu có sẵn |
| `product` | `sipos` \| `bos` \| `webino` \| `redsun` |
| `hook` | Chữ hook, xuống dòng bằng `\n`: tối đa 2 dòng, mỗi dòng ≤ 40 ký tự |
| `scenes[]` | Danh sách cảnh, 2–12 cảnh |
| `cta` | Câu kêu gọi, trùng chữ của cảnh `cta` |
| `music` | id bài trong `brand/music/manifest.json` |
| `selfScore` | `{ total, notes }`: điểm tự chấm và lý do từng tiêu chí |

Mỗi cảnh:
- `id`: chữ thường không dấu, không trùng.
- `role`: `hook` / `problem` / `solution` / `proof` / `cta`, theo đúng thứ tự `./reel info <loại>`.
- `onScreenText`: chữ chính, ≤ 80 ký tự, nên ≤ 10 từ. Chữ cần nhấn đặt trong `[ngoặc vuông]` (1–2 cụm, liệt kê tối đa 3, mỗi cụm ≤ 16 ký tự); `hook`/`cta` phải giống hệt kể cả `[ ]`. Không đánh dấu thì máy tự nhấn số, %, tên sản phẩm.
- `motion` (skill `dao-dien-chuyen-dong` viết): `{ enter?, emphasis?, decor?, transition?, why? }` — chuyển động theo nghĩa của cảnh, ghi đè mặc định của phong cách. Giá trị: xem `.claude/skills/dao-dien-chuyen-dong/SKILL.md`.
- `subText` (tuỳ chọn): dòng phụ, ≤ 120 ký tự.
- `visual`: `{ type, src?, focus?, srcs?, clipStart?, mute? }`:
  - `text`: chỉ có chữ.
  - `phone`: ảnh/clip màn hình trong khung điện thoại. Cần `src`. `focus: {x, y}` (phần trăm) là chỗ cần vòng chỉ vào và zoom.
  - `asset`: ảnh/clip tràn màn hình, chữ ở dưới. Cần `src`.
    - Clip: `clipStart` = giây bắt đầu trong clip gốc. Cảnh liền nhau cùng clip, không ghi `clipStart` → clip chạy liền mạch qua các cảnh, chỉ chữ đổi.
    - Loại video giữ tiếng gốc (`khach-hang-noi`, `video-co-nguoi-noi`): clip giữ tiếng, nhạc tự hạ xuống. `mute: true` để tắt tiếng một clip.
  - `montage` (EventRecap): `srcs` là 2–6 ảnh/clip cắt nhanh trong một cảnh, mỗi hình ≥ 0.6 giây.
  - `split` (BeforeAfter): màn hình chia đôi. `src` là ảnh/clip TRƯỚC, `srcAfter` là ảnh/clip SAU.
  - `logo`: dùng cho cảnh `cta` (logo lớn + câu kêu gọi).
- `durationSec`: số giây hiển thị.
- `attribution` (Testimonial, TalkingHead): tên + cửa hàng/chức danh cho lower third, ≤ 60 ký tự, vd. `"Chị Hạnh · Quán cà phê Mộc, Đà Lạt"`. Testimonial: cảnh hiện dạng câu trích dẫn (ngoặc kép lớn, chữ nghiêng). TalkingHead: tên người nói dưới chữ.
- `stats` (Stats): 1–3 chỉ số `{ value, label }`.
  - `value` ≤ 12 ký tự, chép đúng cách viết trong brief, vd. `"1.200+"`, `"98%"`, `"4,8"`, `"10 phút"`. Số đếm lên từ 0; giá trị có `%` có thêm thanh tiến độ.
  - `label` ≤ 40 ký tự.
  - `chart: "bar"`: vẽ thành biểu đồ cột ngang. Cần ≥ 2 chỉ số cùng đơn vị.
  - Cảnh dài ≥ 2.9 giây + 0.3 giây mỗi chỉ số thêm (`./reel validate` báo con số cụ thể). Visual là `text`.
- `promo` (Promo): `{ badge?, priceOld?, priceNew?, deadline?, countdownFrom? }`.
  - `badge` ≤ 12 ký tự, vd. `"-30%"`, `"Miễn phí"`.
  - `priceOld` là giá cũ, hiện gạch ngang; `priceNew` là giá mới, hiện to.
  - `deadline` ≤ 32 ký tự, vd. `"Đến hết 31/10"`.
  - `countdownFrom` 2–10 (đếm ngược mỗi số 1 giây; cảnh phải dài ≥ số này + 1.5 giây).
  - Cảnh có `promo` không dùng `visual.type: phone`.

## Theo template
| Template | Cảnh đặc thù |
|---|---|
| BeforeAfter | Cảnh `problem` gắn nhãn TRƯỚC (ảnh bị làm nhạt), `solution` gắn nhãn SAU; lần chuyển vào cảnh SAU đầu tiên luôn là wipe. Cảnh `proof` nên dùng `split` |
| Testimonial | Cảnh có `attribution` = lời khách. Quote phải là **nguyên văn hoặc rút gọn** lời khách trong brief, không đổi ý |
| Promo | Cảnh có `promo` hiện badge, giá, hạn chót, đếm ngược ở nửa dưới; chữ chính lên trên |
| EventRecap | Cảnh `montage` cắt nhanh ảnh/clip thật của sự kiện, chữ tiêu đề ở dưới. Ảnh phải là ảnh thật MKT đưa |
| Stats | Cảnh có `stats` hiện số đếm lên ở nửa dưới; chữ chính (tiêu đề nhóm số) lên trên |
| TalkingHead | Clip người nói tràn màn hình, giữ tiếng. `onScreenText` là **ý chính** của lời nói (không phải phụ đề từng chữ), đặt cảnh theo lúc người nói chuyển ý. Cảnh CTA không có clip nên nhạc lên lại |

Quy tắc chung:
- Cảnh đầu là `hook`, có `onScreenText` = `hook` (bỏ `\n`).
- Ảnh/clip MKT gửi nằm trong `briefs/<tên-video>/hinh/` (chạy `./reel hinh <tên-video>` trước); ảnh dùng chung trong `assets/…`. Đuôi hỗ trợ: png, jpg, webp, svg, mp4, mov, webm (ảnh iPhone HEIC: `./reel hinh` tự đổi sang JPG).
- Clip phải đủ dài cho đoạn dùng (`clipStart` + thời lượng các cảnh nối tiếp); validate đo bằng ffprobe.

## Thời lượng mỗi cảnh
`durationSec ≥ max(1.5, số từ × 0.4) + 0.5` giây. Số từ tính cả `subText`, không tính dấu câu đứng riêng.
- Tính nhanh: `./reel info thoi-luong "<chữ chính>" "<dòng phụ>"`.
- Có thể cho cảnh dài hơn mức tối thiểu để khớp thời lượng của brief.

## Chống bịa (validate kiểm)
- Số trong `promo` (giá, %, ngày) và `stats.value` phải có nguyên văn trong brief (kể cả đơn vị): **lỗi** nếu không có.
- Tên trong `attribution` phải có trong brief: **lỗi** nếu không có.
- Quote khác lời khách trong brief, hoặc số trong chữ cảnh không có trong brief: **cảnh báo**, hỏi MKT.

Tổng thời lượng phải đạt cả hai điều kiện:
- nằm trong khoảng của loại video;
- lệch không quá 10% so với `duration` trong brief.

## Tự chấm (ngưỡng 85/100)

| Tiêu chí | Điểm | Đạt khi |
|---|---|---|
| Hook | 25 | Dừng được người lướt trong 3 giây; đúng góc hook; ≤ 2 dòng × 40 ký tự |
| Một thông điệp rõ | 20 | Một ý xuyên suốt; 1–2 ý chính nếu ≤ 45 giây |
| Đọc kịp | 20 | Mọi cảnh đạt công thức thời lượng; chữ ngắn, một ý mỗi cảnh |
| Đúng brand, đúng sự thật | 20 | Không con số, giá, ưu đãi ngoài brief; đúng tên sản phẩm; BOS không gọi "ERP" |
| CTA | 15 | Rõ việc cần làm; khớp CTA của brief |

Ghi `notes` dạng: `"Hook 22/25 (…). Thông điệp 18/20 (…). …"`. Mỗi điểm có lý do cụ thể.

## Ví dụ
Xem `briefs/_example/script.json` (SIPOS, ra mắt tính năng, FeatureLaunch, tối giản) và các brief mẫu trong `tests/fixtures/briefs/` (mỗi loại video một brief). Mẫu M3: `truoc-sau`, `so-sanh` (BeforeAfter), `khach-hang-noi` (Testimonial), `khuyen-mai`, `dem-nguoc`, `chuc-mung-dip-le`, `su-kien-webinar`, `thu-gian-asmr` (Promo). Mẫu M4: `tong-ket-su-kien`, `gioi-thieu-cong-ty`, `tuyen-dung` (EventRecap), `so-lieu-thanh-tich` (Stats), `video-co-nguoi-noi` (TalkingHead).
