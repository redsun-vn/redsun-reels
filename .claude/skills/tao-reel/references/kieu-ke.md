# Kiểu kể — 4 cách kể cho reel không giống quảng cáo

Nam 2026-10-11 (decisions §34): video qua luật nhưng người xem đoán trước được, thiếu cảm xúc/hài, nhịp chưa cuốn. Mỗi concept chọn **một** kiểu kể dưới; ba concept của một brief thuộc **ba kiểu kể khác nhau**, chỉ chọn kiểu hợp kiểu hình đã chọn. MKT chọn 1 trong 3.

Mã kiểu kể, kiểu hình hợp và ngưỡng máy kiểm ở `config/kieu-ke.ts`. Luật chung (LUẬT 1, LUẬT 2, không lặp ý) ở [luat-kich-ban.md](luat-kich-ban.md): kiểu kể nới **hình thức** (sản phẩm được là cú chốt, giải pháp ≥ 12% video, bắt đầu trước 85%), không nới **ý** (nỗi đau thật từ brief, sản phẩm gỡ đúng nỗi đau đó, không bịa).

## Trong `concepts.md`
Mỗi concept ghi đủ:
```
### Concept 1 — <tên>
Kiểu kể: twist
Câu chuyện: <một dòng: ai, chuyện gì, cú ngắt/lật ở đâu, sản phẩm vào lúc nào>
Hook: <câu hook ≤ 8 từ>
```
Kịch bản ghi `concept.kieuKe` đúng mã của concept MKT chọn. Mục `## Lựa chọn của MKT` ghi concept số mấy MKT chọn (validate cảnh báo khi thiếu, hoặc 3 concept không thuộc 3 kiểu kể khác nhau).

## Bảng nhịp (mọi kiểu kể)
Sau khi MKT chọn concept, trước `script.json`, viết mục `## Bảng nhịp` trong `concepts.md`:

| Giây | Ai | Phản ứng / hành động | Ngắt (cười / lật / lặng) |
|---|---|---|---|
| 0,0–1,1 | Chị chủ quán | Bấm máy tính, ba dấu "?đ" dập | dập trên phách |
| … | | | |

Mỗi dòng là một nhịp người xem thấy được: ai làm gì, mặt ra sao. Cột "Ngắt" đánh dấu chỗ cười, chỗ lật, chỗ lặng (khoảng `lang` trước vỡ lẽ). `dung-video` dựng theo bảng này: diễn xuất nhân vật, giây của cú ngắt, tiếng nhấn.

---

## 1. Tiểu phẩm hài đời thường (`tieu-pham`)
Một tình huống quen ở quán, có người phản ứng và một cú ngắt gây cười; sản phẩm gỡ tình huống ở cuối, như câu "chốt" của tiểu phẩm.

- **Nhịp 15–30 giây**: 0–3 tình huống mở (hook: câu thoại hoặc khoảnh khắc lố nhất) · 3–60% leo thang (tình huống tệ dần, mỗi nhịp một phản ứng mới) · ngắt hài (lặng 0,5 giây rồi cú ngắt) · 70–90% sản phẩm gỡ đúng tình huống đó · CTA.
- **Sản phẩm vào ở đâu**: sau cú ngắt, là câu chốt. Giải pháp ≥ 12% video, vẫn cho thấy sản phẩm làm gì.
- **Ví dụ SIPOS "QR chuyển khoản giả"**: khách giơ điện thoại "Em chuyển rồi nha", nhân viên "Dạ" lia lịa cả ngày; tối chị chủ đếm tiền, đếm lại, đếm lần ba, mặt méo dần; nhân viên rụt rè "Chắc… ảnh đẹp quá chị ơi" (ngắt); hôm sau quầy có mã QR mỗi đơn, khách quét, màn hình tự báo đã nhận, nhân viên khoanh tay đắc ý.
- **Lỗi hay gặp**: hài gượng (chơi chữ không ai cười), cười cợt khách hàng, nỗi đau mất thật bị biến thành trò đùa nhẹ tênh. Hài nằm ở **phản ứng của người**, không ở chữ.
- **Kiểu hình hợp**: hoạt hình, người thật AI (cần diễn theo kịch bản; clip quay sẵn không diễn được).
- **Hài kiểu Việt**: nhắc MKT đọc lại câu thoại và câu chữ trước khi duyệt (người Việt chỉnh độ duyên).

## 2. POV "khi bạn là chủ quán…" (`pov`)
Người xem nhìn qua mắt chủ quán, sống lại một khoảnh khắc khó; sản phẩm là lối ra của chính khoảnh khắc đó.

- **Nhịp**: 0–3 chữ "POV: …" + khoảnh khắc đầu (góc nhìn thứ nhất: tay mình, màn hình mình) · 3–55% chuỗi khoảnh khắc nhỏ dồn lại (mỗi nhịp một chi tiết thật của nghề) · 55–85% đổi sang cùng khoảnh khắc với sản phẩm (cùng góc máy, cùng tay) · CTA.
- **Sản phẩm vào ở đâu**: như "phiên bản khác" của cùng khoảnh khắc, cùng khung hình.
- **Ví dụ SIPOS**: "POV: 9 giờ tối, bạn mở app ngân hàng lần thứ ba" · tay lướt lịch sử, dừng, lướt lại · liếc sang tờ giấy ghi "chuyển rồi" · cắt: cùng bàn tay, sáng hôm sau, màn hình SIPOS hiện "Đã thanh toán" từng đơn.
- **Lỗi hay gặp**: POV chỉ là nhãn (vẫn quay kiểu quảng cáo người thứ ba); khoảnh khắc chung chung không ai thấy mình trong đó.
- **Kiểu hình hợp**: cả ba (quay sẵn: chọn clip góc nhìn tay/màn hình).

## 3. Kể chuyện có cú lật (`twist`)
Câu chuyện dẫn người xem đoán một hướng rồi lật ngược; sản phẩm là cú lật hoặc ngay sau cú lật.

- **Nhịp**: 0–3 câu hỏi / tình huống gợi một hướng đoán · 3–65% gài manh mối (người xem tin hướng sai) · lặng 0,5–1 giây · cú lật (tiếng to nhất video) · sản phẩm ngay sau cú lật · CTA.
- **Sản phẩm vào ở đâu**: cú lật là "à, hoá ra là…" và sản phẩm giải thích/giải quyết điều vừa lật.
- **Ví dụ SIPOS**: chị chủ nghi nhân viên mới lấy tiền (nhìn chằm chằm, đếm két trước mặt), người xem cũng nghi; lặng; lật: ảnh chuyển khoản trên điện thoại khách là ảnh cũ chụp lại, nhân viên vô tội; SIPOS mỗi đơn một mã QR, tiền vào là tự xác nhận, không ai phải nghi ai.
- **Lỗi hay gặp**: twist đoán được từ giây 3; manh mối gian (lật bằng thông tin chưa từng gài); lật xong không còn thời gian cho sản phẩm.
- **Kiểu hình hợp**: hoạt hình, người thật AI.
- **Không bịa**: cú lật chỉ dùng sự thật có trong brief (ở ví dụ: ảnh chuyển khoản giả). Không đặt nhân vật xấu là "khách hàng thật".

## 4. Mẹo / số liệu gây sốc (`meo-so-lieu`)
Mở bằng một con số hay mẹo **thật** làm chủ quán giật mình, giải thích nhanh, sản phẩm là cách làm mẹo đó dễ.

- **Nhịp**: 0–3 con số / mẹo dập lên (chữ số to, tiếng nhấn) · 3–50% vì sao con số đó đáng sợ với quán (quy về tiền, giờ của chính người xem) · 50–85% mẹo / cách làm, sản phẩm làm hộ · có thể thêm cảnh bằng chứng (`proof`) · CTA.
- **Sản phẩm vào ở đâu**: là "cách làm mẹo này không tốn công".
- **Ví dụ SIPOS "Chi phí năm đầu"** (số có trong brief): "Năm đầu dùng phần mềm tốn bao nhiêu?" · gói từ 149.000đ hoặc 229.000đ/tháng · cộng cả năm từ 1.788.000đ (lặng rồi dập số) · thiết bị tư vấn theo cửa hàng · CTA.
- **Bắt buộc số thật**: chỉ dùng con số, mẹo có trong brief hoặc hồ sơ sản phẩm, kèm nguồn. Brief không có → không chọn kiểu này (validate chặn), hoặc hỏi MKT số liệu/mẹo thật. Không ước tính "mất 2 triệu mỗi tháng" khi brief không ghi.
- **Lỗi hay gặp**: số đúng nhưng không quy về người xem; dồn 3 con số vào một cảnh; mẹo chung chung ai cũng biết.
- **Kiểu hình hợp**: cả ba.

---

## Chọn kiểu kể nào cho brief
| Brief có | Kiểu kể mạnh |
|---|---|
| Tình huống đời thường có người phản ứng, lời thoại | tiểu phẩm, POV |
| Một sự thật bất ngờ / hiểu lầm (ảnh giả, tưởng A hoá ra B) | twist |
| Con số, giá, mẹo thật do MKT đưa | mẹo / số liệu |
| Khoảnh khắc nghề lặp lại hằng ngày | POV |

Ba concept khác kiểu kể không có nghĩa ba câu chuyện khác nhau hoàn toàn: cùng nỗi đau, cùng giải pháp của brief, kể theo ba cách.
