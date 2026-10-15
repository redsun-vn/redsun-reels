# Chiều sâu hình — lớp, máy quay, ánh sáng, lớp hoàn thiện, chuyển cảnh trong khung hình

Dùng khi dựng video **minh hoạ** (và lớp HyperFrames đè lên clip người thật). Hàm ở `templates/_rieng/chieu-sau.js` (nạp sau `boi-canh.js`, kèm `_rieng/chieu-sau.css`; validate chặn khi quên nạp).

Rút gọn từ code-rendered-video (giấy phép MIT): `camera.md`, `transitions.md`, `effects.md`, `art-styles.md`, `quality-gates.md`. Chỉ giữ phần làm được bằng HyperFrames + GSAP + CSS; engine WebGL của bộ đó không dùng. Nam 2026-10-15 (decisions §42).

## 1. Ba lớp chiều sâu (mỗi cảnh, luật)
Mỗi cảnh có **≥ 3 lớp ở độ sâu khác nhau**, và khi máy đi thì các lớp trượt lệch nhau (thị sai). Một lớp nền + chữ là "slide", không phải cảnh.

| Lớp | Là gì | Hệ số trượt | Mờ |
|---|---|---|---|
| Xa | `bg.sau` của `RS.set` (tường, cửa sổ, phố) | 0.35 | 0–6 px (`RS.moSau`) khi cảnh cận người |
| Giữa | Nhân vật, đạo cụ chính, điện thoại | 0.7 | Không (chủ thể luôn nét) |
| Gần | `bg.gan` (quầy, bàn) | 1.25 | Không |
| Sát ống kính | `RS.tienCanh` (mép quầy, lá, ly, vai, cột) | 1.8 | 10–24 px, tối |

```js
const bgA = RS.set(document.querySelector("#camA"), "quan", { light: "ngay" });
const la = RS.tienCanh("#camA", "la", { x: -160, y: 1380, w: 620, h: 620, mo: 16 });
const lopA = RS.lopCanh(bgA, ["#chu", "#khach"], [la]);       // [[el, hệ số], …]
RS.truotLech(tl, lopA, 0, 3.4, { x: 70, zoom: 1.06, le: 90 }); // máy trượt phải + đẩy nhẹ suốt cảnh
```
- Mỗi chuyển động máy của cảnh gọi `RS.truotLech` một lần, theo thứ tự thời gian; lần sau đi tiếp từ chỗ lần trước. `le` = độ dịch lớn nhất của cả cảnh (lớp xa phóng sẵn đủ để không lộ mép).
- Vật sát ống kính đặt **ở mép khung** (góc dưới, cạnh bên), che ≤ 25% khung, không bao giờ che mặt người đang có cảm xúc hay chữ trong vùng an toàn.
- `RS.truotLech` dùng `x`, `y`, `scale` của chính các lớp: không tween `x/y/scale` của các lớp đó ở chỗ khác. Máy quay toàn khung (đẩy vào mặt, lao vào vật) vẫn làm trên lớp `.cam` bọc ngoài như cũ.
- Chuyển nét: `RS.doiNet(tl, "#chu", "#dt", at, 0.5, 8)` — người mờ, điện thoại nét (hướng mắt người xem sang vật). Chỉ tween độ mờ khi đổi nét; mờ tĩnh dùng `RS.moSau` (rẻ hơn khi render).

## 2. Máy quay: cột máy quay của cả video
Ghi trong `storyboard.md` một bảng, mỗi cảnh một dòng, đọc theo cột:

| Cảnh | Cỡ | Góc | Chuyển động | Lớp sát ống kính |
|---|---|---|---|---|
| A hook | Cận | Ngang mắt | Đáp mạnh rồi lùi | ly |
| B quầy | Toàn | Hơi cao | Trượt ngang thị sai | mép quầy |
| C đêm | Trung → cận | Ngang mắt | Đẩy chậm vào mặt | — |

- **Không cỡ, góc hay chuyển động nào lặp ở hai cảnh liền nhau** (trừ khi lặp là ý đồ, ghi rõ).
- **Máy đi phải có lý do**: đi vì có thứ để nhìn. Chuyển động cho có là nhiễu.
- **Đi dứt khoát, dừng từ từ**: ease ra mạnh, vào chậm (`power3.out`); chỉ cú lao vào chi tiết mới `power3.in`.
- **Đứng yên cũng là một chuyển động**: sau ba cảnh máy bay lượn, một khung đứng yên là mạnh nhất (vẫn có chi tiết sống, không đứng hình).
- **Khung đầu có sức nặng**: mở ngay vào chủ thể, không khung trống chờ vật bay vào.
- **Một cú máy "trình diễn" mỗi video** (crash zoom, lao vào chi tiết, quay quanh): một lần.
- **Khung dọc**: chủ thể chạy hết chiều cao vùng an toàn; đi lên/xuống tự nhiên hơn đi ngang.

Mẫu chuyển động **trong một cảnh** (2–5 giây):

| Mẫu | Cách | Dùng |
|---|---|---|
| Mở cận, lùi ra | Cận ở giây đầu, lùi suốt cảnh | Cảnh đầu một đoạn: khung đầy từ khung đầu |
| Đáp rồi nhường chỗ | Vật đáp to trên phách, rồi lùi lại cho chữ/người | Tên, vật xuất hiện trên phách mạnh |
| Theo rồi đứng lại | Theo vật đang đi, tới nơi thì mở toàn | Nguyên nhân → kết quả |
| Mỗi món một bước | Mỗi món trong danh sách, máy tiến một bước (`stepIn`: dịch nhanh rồi lắng) | Thứ chồng chất (đơn, giấy nhớ) |
| Hai khung | Đổi khung cứng trên phách mạnh, cùng một thế giới | Trước/sau |
| Kết ở chỗ cảnh sau bắt đầu | Khung cuối cảnh này = khung đầu cảnh sau | Nối hình, lao vào chi tiết |

Kiểu chuyển động máy cụ thể (đẩy chậm, crash zoom, whip, dutch, handheld): [ngon-ngu-may-quay.md](ngon-ngu-may-quay.md) §5.

## 3. Ánh sáng
| Hàm | Trông như | Dùng |
|---|---|---|
| `RS.chumSang(tl, "#camC", từ, đến, { x, y, rong, dai, goc, lanh, bui })` | Chùm sáng từ cửa sổ/đèn, bụi trôi trong chùm | Đêm kiểm sổ (đèn bàn), sáng hôm sau (nắng cửa sổ), sân khấu cho vật chính |
| `RS.quetSang(tl, el, at, dur)` | Vệt sáng quét chéo qua bề mặt | Màn hình sản phẩm vừa hiện ("mới", "sạch"), kính, thẻ |
| `RS.loe(tl, root, at, { x, y })` | Loé sáng quanh điểm nhấn rồi tắt | Đúng giây vỡ lẽ / dấu dập, đi cùng tiếng nhấn to nhất |

- Ánh sáng chỉ đến từ **nguồn có trong hình** (đèn, cửa sổ, màn hình). Không loé lên chữ.
- Một nguồn sáng chính mỗi cảnh; tông ấm cho đời thường/giải pháp, lạnh cho đêm/lo lắng.
- Thay đổi ánh sáng kể chuyện: đèn tắt ở chỗ này, sáng ở chỗ kia; đêm → sáng hôm sau.

## 4. Lớp hoàn thiện (mỗi video, luật)
`RS.hoanThien(null, { vignette: 0.35, hat: 0.07, tong: "am" })` gọi **một lần** cho cả video, ở đầu hàm dựng:
- **Viền tối góc** kéo mắt vào giữa; 0.3–0.4 (mặc định 0.35).
- **Hạt** phá độ trơn của màu số; luôn có một chút (0.05–0.09). Hạt đứng yên để bộ đo đứng hình vẫn đo đúng.
- **Tông** `am` (đời thường, giải pháp) hoặc `lanh` (đêm, căng thẳng); bỏ trống nếu cảnh đã đủ màu.
- Viền tối làm tối đều mép khung của mọi cảnh, mà `./reel snap` so nền các cảnh bằng màu mép: giữ `vignette` ≤ 0.4, và khi bị báo "Cảnh có nền gần giống nhau" thì đổi tông/ánh sáng của cảnh (vd. cảnh sáng sớm thêm `<div class="cs-phu cs-tong-lanh" data-layout-ignore>` hoặc chùm sáng `lanh: true`; cảnh báo động thêm đèn đỏ phủ `mix-blend-mode: screen`), không hạ hẳn lớp hoàn thiện.
- Lớp phủ tự nằm dưới nhãn "Do AI sản xuất". Cảnh cần đổi tông giữa chừng: dùng `RS.hoanThien` một lần, rồi tween `opacity` của `out.tong` tại cảnh đổi.

Video nhiều nền khác nhau vẫn là **một phim** nhờ: bảng màu và vai màu, font, cách đặt phụ đề, và **cùng một lớp hoàn thiện**.

## 5. Thẻ trong không gian
`RS.the3d(tl, "#anhCK", at, { rotY: -38, rotX: 14 })`: ảnh chuyển khoản, màn hình, hoá đơn đến nghiêng trong không gian rồi xoay thẳng mặt máy với ease dừng mạnh. Dùng cho vật "được trình ra" (bằng chứng, màn hình sản phẩm). Góc > 15° mới thấy rõ là 3D.

## 6. Chuyển cảnh trong khung hình
Mạnh nhất và đắt nhất: **1–3 lần mỗi video**, ở khoảnh khắc quan trọng (vào nỗi đau, vỡ lẽ, vào giải pháp). Phần còn lại là cắt thẳng hoặc cắt có nhấn. Không cùng kiểu hai lần liền. Chuyển cảnh **nảy ra từ hình**: hai cảnh vốn có quan hệ trong không gian (cảnh này chứa cảnh kia, cùng một thế giới, cùng một hình dạng) thì dùng; không có thì không bẻ cảnh cho vừa.

| Kiểu | Người xem thấy | Hàm | Cảnh trước làm gì | Cảnh sau làm gì |
|---|---|---|---|---|
| Lao vào chi tiết | Máy lao vào màn hình/tờ giấy tới khi nó kín khung, bên trong là cảnh sau | `RS.laoVao(tl, "#camB2", "#dtKhach", at, 0.5)` | Trên vật đã hiện khung đầu của cảnh sau | Bắt đầu đúng `at + dur`, mở bằng chính hình đó |
| Lùi ra khỏi chi tiết | Cảnh trước hoá ra là một chi tiết của cảnh này | `RS.lui(tl, "#camC", "#dtChu", at, 0.7)` | Kết bằng hình kín khung | Mở bằng vật kín khung, lùi ra toàn cảnh |
| Vật thoát khỏi khung | Ảnh/màn hình/con dấu bước ra khỏi khung điện thoại về phía máy, có bóng đổ, khung sau tối lại | `RS.thoatKhung(tl, "#manHinh", "#theDon", at, { y: -260, scale: 1.35 })` | Vật nằm gọn trong khung | Thường lùi ra hoặc đẩy sang thế giới vật vừa vào |
| Vật lướt che cú cắt | Người/cột/lá (có viền sáng) lướt sát ống kính, máy lia theo: cảnh trước bị kéo đi và nhoè, cảnh sau trượt vào rồi nét lại | `RS.vatLuot(tl, null, "nguoi", at, { truoc: ["#camA", "#chữCảnhA"], sau: ["#camB"] })` | Cắt cảnh đúng `at`; `at ± 0.4` trên phách | Luôn truyền `truoc`/`sau`: thiếu thì chỉ còn một khối tối lướt qua, không ra hiệu ứng (Nam 2026-10-15) |
| Màu tràn | Màu tín hiệu (đỏ mận = ảnh giả) nở từ điểm nhấn kín khung, rút về lộ cảnh sau | `RS.tranMau(tl, null, "var(--prop-alarm)", at, { x, y, rut: 0.45 })` | Nở từ chính vật mang màu đó | Mở trên nền cùng màu (`rut: 0`) hoặc lộ ra khi màu rút |
| Nối hình | Hình cuối cảnh trước và đầu cảnh sau cùng hình dạng, cùng chỗ | (tự đặt) | Vật ở vị trí X | Vật khác cùng hình ở đúng X |

Lỗi hay gặp: vật thoát khung trong một khung hình (phải thấy nó băng qua mép trong 1–2 phách) · không gì trong khung phản ứng khi vật rời (khung phải tối đi hoặc rung) · lao vào chi tiết mà trên vật chưa có hình cảnh sau (cảnh sau hiện ra đột ngột) · vật lướt không trùng cú cắt.

Cú cắt vào khoảnh khắc lớn có **ba phần**: dồn (2 phách cuối, máy đẩy từng nửa phách) → **thở** (1/4 phách gần như trống: lặng, `lang` trong `tieng-dong.txt`) → **va** (loé `RS.loe`, rung, tiếng nhấn). Phần thở làm nên cú va.

## 7. Tự soát chiều sâu (thêm vào danh sách tự soát mỗi vòng snap)
- [ ] Mỗi cảnh ≥ 3 lớp độ sâu; ở khung giữa cảnh, lớp xa và lớp gần **đã lệch nhau** so với khung đầu (thị sai thấy được).
- [ ] Chủ thể nét, lớp xa/tiền cảnh mờ; vật sát ống kính không che mặt hay chữ.
- [ ] Cột máy quay: không hai cảnh liền cùng cỡ/góc/chuyển động; có ít nhất một khung đứng yên có chủ đích.
- [ ] Có lớp hoàn thiện (viền tối + hạt) suốt video; không loé trên chữ.
- [ ] 1–3 chuyển cảnh trong khung hình, ở khoảnh khắc quan trọng, không cùng kiểu liền nhau.
- [ ] Ánh sáng đến từ nguồn trong hình; tông đổi theo cảm xúc câu chuyện.
- [ ] Mỗi khung có **một vật mang màu tín hiệu**, phần còn lại lùi (mờ, tối, ít bão hoà).

## 8. Chi phí render
Mờ (`filter: blur`) tốn nhất khi lớp mờ đang chuyển động: giữ ≤ 3 lớp mờ cùng lúc, bán kính ≤ 24 px, không tween bán kính ngoài `RS.doiNet`. Nhìn "Máy chạy N phút" khi render: vượt 15 phút thì bớt lớp mờ trước.
