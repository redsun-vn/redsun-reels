# Định dạng script.json

Schema chuẩn: `config/script.schema.ts`. `./reel validate <tên-video>` kiểm toàn bộ quy tắc dưới đây.

## Trường

| Trường | Ý nghĩa |
|---|---|
| `concept` | `{ title, bigIdea, hookAngle }`. `hookAngle` là một trong: `con-so`, `lat-nguoc`, `truoc-sau`, `thuong-hieu`, `sap-thay-doi`, `cau-hoi-noi-dau`, `quote` |
| `videoType` | id loại video (`./reel info`) |
| `style` | id phong cách đã dựng được (`./reel info`) |
| `template` | Template của loại video (`./reel info <loại>`) |
| `product` | `sipos` \| `bos` \| `webino` \| `redsun` |
| `hook` | Chữ hook, xuống dòng bằng `\n`: tối đa 2 dòng, mỗi dòng ≤ 40 ký tự |
| `scenes[]` | Danh sách cảnh, 2–12 cảnh |
| `cta` | Câu kêu gọi, trùng chữ của cảnh `cta` |
| `music` | id bài trong `brand/music/manifest.json` |
| `selfScore` | `{ total, notes }`: điểm tự chấm và lý do từng tiêu chí |

Mỗi cảnh:
- `id`: chữ thường không dấu, không trùng.
- `role`: `hook` / `problem` / `solution` / `proof` / `cta`, theo đúng thứ tự `./reel info <loại>`.
- `onScreenText`: chữ chính, ≤ 80 ký tự, nên ≤ 10 từ.
- `subText` (tuỳ chọn): dòng phụ, ≤ 120 ký tự.
- `visual`: `{ type, src?, focus? }`:
  - `text`: chỉ có chữ.
  - `phone`: ảnh/clip màn hình trong khung điện thoại. Cần `src`. `focus: {x, y}` (phần trăm) là chỗ cần vòng chỉ vào và zoom.
  - `asset`: ảnh/clip tràn màn hình, chữ ở dưới. Cần `src`.
  - `logo`: dùng cho cảnh `cta` (logo lớn + câu kêu gọi).
- `durationSec`: số giây hiển thị.

Quy tắc chung:
- Cảnh đầu là `hook`, có `onScreenText` = `hook` (bỏ `\n`).
- Ảnh/clip đặt trong `assets/…`. Đuôi hỗ trợ: png, jpg, webp, svg, mp4, mov, webm.

## Thời lượng mỗi cảnh
`durationSec ≥ max(1.5, số từ × 0.4) + 0.5` giây. Số từ tính cả `subText`, không tính dấu câu đứng riêng.
- Tính nhanh: `./reel info thoi-luong "<chữ chính>" "<dòng phụ>"`.
- Có thể cho cảnh dài hơn mức tối thiểu để khớp thời lượng của brief.

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
Xem `briefs/_example/script.json` (SIPOS, ra mắt tính năng, FeatureLaunch, tối giản) và các brief mẫu trong `tests/fixtures/briefs/` (mỗi loại video một brief).
