---
name: dao-dien-chuyen-dong
description: Đạo diễn chuyển động cho một video reel của dự án redsun-reels — đọc NGHĨA từng cảnh trong kịch bản đã duyệt rồi chọn chữ cần nhấn, kiểu hiện chữ, kiểu nhấn, hoạt cảnh trang trí, chuyển cảnh cho hợp chủ đề, để video thu hút. Dùng sau bước duyệt kịch bản của skill tao-reel, hoặc khi người dùng nói "video nhàm", "thêm hiệu ứng", "animation chưa hợp", "làm sinh động hơn", "nhấn mạnh chỗ…".
model: claude-opus-5-5
---

# Đạo diễn chuyển động

Reel chỉ giữ được người xem khi **mắt biết nhìn vào đâu** và **chuyển động nói cùng một ý với chữ**. Skill này không đổi câu chữ MKT đã duyệt; nó chỉ đánh dấu chữ cần nhấn và chọn chuyển động cho từng cảnh theo nghĩa của cảnh đó.

Nói với MKT bằng tiếng Việt, câu ngắn, không thuật ngữ. Chỉ sửa `briefs/<tên-video>/script.json`.

## Khi nào chạy
- Trong skill `tao-reel`: sau khi MKT duyệt bảng kịch bản (bước 5), trước khi xem thử (bước 6).
- MKT xem thử thấy "nhàm", "chưa nổi", "hiệu ứng không hợp chủ đề", muốn nhấn chỗ khác.

## Làm
0. Chạy `./reel info gan-day`: xem chữ ký chuyển động của các video gần đây. Video này **phải khác** các video cùng dịp / cùng sản phẩm: khác bố cục (`layout`) ở hook, khác kiểu nhấn, khác hoạt cảnh, khác chuyển cảnh. Validate cảnh báo khi trùng.
1. Đọc `brief.md` (dịp lễ, giọng điệu, người xem) và `script.json` (loại video, phong cách, từng cảnh). Xem phong cách: `brand/styles/<phong-cách>.json` (kiểu hiện chữ, chuyển cảnh mặc định).
2. Với **mỗi cảnh**, trả lời 2 câu: *cảnh này muốn người xem cảm thấy gì?* và *chữ nào phải đập vào mắt?*
3. **Đánh dấu chữ nhấn** bằng ngoặc vuông trong `onScreenText` (và trong `hook`, `cta` cho khớp):
   - 1–2 cụm mỗi cảnh (cảnh liệt kê: tối đa 3), mỗi cụm **≤ 16 ký tự** (dài hơn thì máy tách từng từ, nhìn rối). Liệt kê nhiều thứ thì đánh từng cụm: `SIPOS lo [kho], [thu chi], [khách quen]`.
   - Chỉ thêm `[ ]`, **không đổi chữ**. Đổi chữ là phải đưa MKT duyệt lại kịch bản.
   - Ưu tiên: con số / ưu đãi, nỗi đau, lợi ích chính, tên sản phẩm, tên miền ở CTA.
4. **Chọn `motion` cho từng cảnh** theo bảng dưới, ghi `why` (1 câu lý do). Trường nào để trống thì dùng mặc định của phong cách.
5. Kiểm: `./reel validate <tên-video>` (không còn ✗; xử lý các cảnh báo về chữ nhấn).
6. Luồng tự động (mặc định của `tao-reel`): không chờ MKT, quay lại `tao-reel` để xuất. Luồng từng bước: trình bày bảng **Cảnh · Chữ nhấn · Bố cục · Hiện chữ · Kiểu nhấn · Hoạt cảnh · Chuyển cảnh · Lý do**, MKT đồng ý thì sang xem thử.

## Trường `motion` của một cảnh
```json
"motion": { "enter": "type", "emphasis": "strike", "decor": "none", "transition": "zoom-through", "why": "…" }
```
| Trường | Giá trị | Ý nghĩa |
|---|---|---|
| `layout` (bố cục chữ) | `left` căn trái (mặc định) · `center` căn giữa · `giant` chữ khổng lồ · `stack` mỗi dòng một từ (câu ≤ 5 từ) · `bottom` chữ dưới đáy | Đổi bố cục giữa các video cùng loại để không trùng; cảnh có ảnh/khối ưu đãi chỉ đổi căn lề |
| `enter` (chữ hiện) | `rise` trồi lên · `slam` dập mạnh · `pop` bật nảy · `blur` mờ → nét · `type` đánh máy · `track` giãn → khít | Nhịp vào của cả câu |
| `emphasis` (nhấn cụm `[ ]`) | `marker` bút dạ quét · `underline` gạch chân vẽ · `scribble` gạch lượn tay · `circle` khoanh tròn bút đỏ · `strike` gạch xoá · `punch` dập nảy xoay · `glow` sáng rực | Nhịp riêng của chữ nhấn sau khi câu hiện xong |
| `decor` (hoạt cảnh) | `none` · `hearts` tim · `flowers` hoa · `sparkles` lấp lánh · `confetti` pháo giấy · `coins` đồng xu · `checks` dấu tick · `stars` ngôi sao | Bung ra một lần khi chữ nhấn xuất hiện |
| `transition` (vào cảnh) | `vertical-push` · `zoom-through` · `elastic-push` · `blur-crossfade` · `dip-black` · `flash-white` · `whip` · `glitch-cut` | Chuyển từ cảnh trước sang cảnh này |

## Nghĩa → chuyển động
| Cảnh nói về | Hiện chữ | Nhấn | Hoạt cảnh |
|---|---|---|---|
| Nỗi đau, cách cũ, việc sẽ bỏ ("cộng sổ", "Excel", "chờ đợi") | `type` / `blur` | `strike` | `none` |
| Câu hỏi gây tò mò | `type` | `underline` | `none` |
| Lợi ích, tính năng chính | `rise` / `pop` | `circle` / `marker` | `checks` nếu là "xong, gọn, tự động" |
| Con số, giá, % giảm, doanh thu | `slam` | `punch` | `coins` (tiền, doanh thu) / `confetti` (ưu đãi) |
| Lời chúc, dịp lễ, cảm xúc ấm | `blur` | `glow` / `scribble` | theo dịp: `flowers` 8/3, 20/10 · `hearts` 14/2 · `confetti` Tết, khai trương, sinh nhật · `stars` Giáng sinh, Trung thu |
| Đánh giá, chất lượng, khách khen | `rise` | `glow` | `stars` |
| Bước ngoặt (từ nỗi đau sang giải pháp) | `pop` | `marker` | — ; chuyển cảnh `zoom-through` / `whip` |
| CTA: tên miền, "nhắn tin", "đăng ký" | (mặc định) | `marker` | `none` |

## Nguyên tắc
- **Không trùng video gần đây** (bước 0): cùng dịp / cùng sản phẩm thì khác `layout` của hook và khác bộ (`enter`, `emphasis`) ở ít nhất một nửa số cảnh. Bố trí trang trí (đốm sáng, vầng sáng, chữ mờ) máy tự đổi theo nội dung từng video.
- **Một điểm nhìn mỗi cảnh**: không nhấn quá 2 cụm (liệt kê: 3); không để mọi chữ đều nhấn.
- **Đổi nhịp**: hai cảnh liền nhau không dùng cùng `emphasis`; giữ ít nhất 1 cảnh "lặng" (không `decor`) để cảnh có `decor` nổi lên. Tối đa 2 cảnh có `decor` trong video ≤ 20 giây.
- **Theo năng lượng phong cách**: phong cách êm (`lang-man`, `sang-trong`, `thu-gian`, `tin-cay`) tránh `slam`, `glitch-cut`, `flash-white`; phong cách mạnh (`hanh-dong`, `khuyen-mai`, `nang-dong`) được `slam`, `whip`, `punch`. `glitch-cut` chỉ dùng với `glitch-cyberpunk`, `tuong-lai`, `robot-cong-nghe`.
- **Đúng chủ đề**: hoạt cảnh phải khớp nội dung và dịp (không bung tim cho video khuyến mãi phần mềm kho; không pháo giấy cho cảnh nỗi đau).
- **Đọc được trước, đẹp sau**: chữ nhấn vẫn phải đọc kịp (validate kiểm thời lượng); không thêm hiệu ứng làm chữ rung khi đang đọc.
- Cảnh BeforeAfter vào cảnh SAU luôn là wipe (máy tự đặt), không cần `transition`.

## Ví dụ (SIPOS · 20/10 · lãng mạn)
| Cảnh | Chữ | motion |
|---|---|---|
| Hook | `Chị chủ quán, tối nay lại ngồi [cộng sổ]?` | `type` · `strike` · — · lý do: nỗi đau ghi sổ, gạch xoá việc SIPOS bỏ đi |
| Lợi ích + ưu đãi | `SIPOS lo [kho], [thu chi], [khách quen]` | `rise` · `circle` · `flowers` · `zoom-through` |
| CTA | `Tìm hiểu thêm tại [sipos.vn]` | — · `marker` · — · `blur-crossfade` |

## Không làm
- Không đổi chữ, thời lượng, thứ tự cảnh, nhạc, phong cách (việc của `tao-reel`).
- Không sửa `templates/`, `brand/`, `config/`. Muốn hiệu ứng chưa có trong bảng → ghi `briefs/<tên-video>/review.md` mục `## Cần dev`.
