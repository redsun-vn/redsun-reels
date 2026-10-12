# Kiểu kể — 6 cách kể cho reel không giống quảng cáo

Nam 2026-10-11 (decisions §34; thêm hai kiểu drama 2026-10-12, §36): video qua luật nhưng người xem đoán trước được, thiếu cảm xúc/hài, nhịp chưa cuốn. Mỗi concept chọn **một** kiểu kể dưới; ba concept của một brief thuộc **ba kiểu kể khác nhau**, chỉ chọn kiểu hợp kiểu hình đã chọn. Claude tự chọn concept khuyên, không hỏi MKT (Nam 2026-10-12, §38).

Mã kiểu kể, kiểu hình hợp và ngưỡng máy kiểm ở `config/kieu-ke.ts`. Luật chung (LUẬT 1, LUẬT 2, không lặp ý) ở [luat-kich-ban.md](luat-kich-ban.md): kiểu kể nới **hình thức** (sản phẩm được là cú chốt, giải pháp ≥ 12% video, bắt đầu trước 85%), không nới **ý** (nỗi đau thật từ brief, sản phẩm gỡ đúng nỗi đau đó, không bịa).

## Trong `concepts.md`
Mỗi concept ghi đủ:
```
### Concept 1 — <tên>
Kiểu kể: twist
Câu chuyện: <một dòng: ai, chuyện gì, cú ngắt/lật ở đâu, sản phẩm vào lúc nào>
Hook: <câu hook ≤ 8 từ>
```
Kịch bản ghi `concept.kieuKe` đúng mã của concept đã chọn. Mục `## Lựa chọn` ghi concept số mấy được chọn và vì sao (validate cảnh báo khi thiếu, hoặc 3 concept không thuộc 3 kiểu kể khác nhau).

## Bảng nhịp (mọi kiểu kể)
Sau khi chọn concept, trước `script.json`, viết mục `## Bảng nhịp` trong `concepts.md`:

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
Ví dụ dưới cho SIPOS; REDSUN BOS là "khi bạn là trưởng phòng / giám đốc…", Webino là "khi bạn là chủ website…" (luật "Người xem theo sản phẩm", [luat-kich-ban.md](luat-kich-ban.md)).

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

## 5. Drama văn phòng (`drama-van-phong`)
Một khoảnh khắc căng ở công sở, nhiều người cùng phản ứng phóng đại như phim; sản phẩm gỡ nút thắt cho cả phòng.

- **Nhịp 15–30 giây**: 0–3 khoảnh khắc hỗn loạn nhất (sếp hỏi số liệu giữa cuộc họp, deadline 5 phút, file báo cáo hai bản khác nhau) · 3–60% căng thẳng leo thang, mỗi nhịp một gương mặt (người toát mồ hôi, người lục giấy, người né ánh mắt) · `dung-hinh` hoặc lặng 0,5 giây, cả phòng đứng hình · 60–90% một người mở sản phẩm, số liệu hoặc việc hiện ra ngay, cả phòng thở phào · CTA.
- **Sản phẩm vào ở đâu**: là thứ gỡ nút thắt, thấy rõ trên màn hình sản phẩm làm gì (không chỉ logo).
- **Ví dụ REDSUN BOS** (tính năng có trong `brand/products.json`): giữa cuộc họp sếp hỏi "Tháng này doanh thu bao nhiêu?", phòng kinh doanh nói một số, phòng kế toán nói số khác, cả phòng quay sang nhìn nhau (đứng hình); một người mở Bảng điều hành REDSUN BOS, các phân hệ chung một dữ liệu, một con số duy nhất; cả phòng thở ra.
- **Ví dụ Webino** (chủ website): chủ shop online và hai bạn phụ việc, khách hỏi "Shop có website không?", cả ba nhìn nhau đứng hình; chủ shop đăng ký Webino, qua 2 bước, hệ thống tự dựng website.
- **SIPOS** (chủ quán): drama ở quầy hoặc giữa ca, chủ quán và nhân viên quán, không dựng thành phòng họp công ty.
- **Độ căng (bắt buộc, Nam 2026-10-12: "drama kịch bản chưa đủ độ căng thẳng")**: căng thẳng phải **leo thang**, không chỉ một lần đứng hình.
  - **Áp lực dồn từ người**: sếp hỏi rồi giục ("Trả lời đi!", "Nhanh lên."), mỗi câu ngắn hơn câu trước.
  - **Giọng theo độ căng**: mỗi câu thoại có cách nói hợp tình huống (sếp **quát lớn** khi ra lệnh, nhân viên lắp bắp nhỏ, câu chốt lạnh và chậm); độ to và gắt leo thang tới cú vỡ rồi dịu xuống ở phần giải pháp (video AI: ghi trong prompt, skill `dung-canh-ai`; hoạt hình: `cuongDo`, `dienXuat`, thẻ cảm xúc của `giong-doc`).
  - **Đồng hồ chạy**: tin nhắn khách bật liên tục, ngón tay gõ bàn, nhịp tim; tiếng nhấn dày dần.
  - **Hậu quả thấy được ngay trên hình**: khách bỏ đi, việc hỏng ("Thôi em hỏi bên khác vậy."), sếp chốt một câu lạnh. Không dừng ở "khách chờ".
  - **Nhịp cắt nhanh dần**: 1,2 giây → 0,6 giây mỗi mặt trước cú vỡ; máy rung tay, dutch tilt, crash zoom; rồi lặng 0,5 giây và cú lật to nhất.
  - **Gọi lại cùng khoảnh khắc**: nửa sau lặp đúng câu hỏi mở đầu, lần này có câu trả lời.
  - **Phần sau sản phẩm bùng lên**: thấy sản phẩm làm việc cụ thể trên màn hình và người gây áp lực vui vỡ oà (bật cười, vỗ tay, giơ ngón cái), mạnh ngang lúc căng nhất; không kết bằng cái gật đầu nhẹ.
  - **Một bối cảnh chung**: mở bằng cảnh toàn thấy cả phòng (họp, quầy, kho…) và mọi người trong đó, hành động chính (đập bàn, ném hồ sơ xuống) quay đủ rộng để thấy người làm và cả phòng phản ứng (luật chung cảnh AI, `chon-kieu-hinh`).
- **Giọng đa dạng (bắt buộc)**: mỗi nhân vật chính một giọng, xen nam nữ (sếp, nhân viên kinh doanh, kế toán…), skill `giong-doc` mục "Ngoại lệ — kiểu kể drama".
- **Máy quay, tiếng**: cầm tay hơi rung, lia nhanh giữa các gương mặt, cận phản ứng; `dung-hinh`, `tim-dap` trong khoảng lặng, `hoi-tho` khi gỡ xong. Xem [ngon-ngu-may-quay.md](../../dung-video/references/ngon-ngu-may-quay.md).
- **Lỗi hay gặp**: đổ lỗi cho một người cụ thể (biến nhân viên thành trò cười); căng thẳng chỉ bằng chữ, không có mặt người phản ứng; sản phẩm vào trước khi cả phòng thật sự kẹt.
- **Kiểu hình hợp**: hoạt hình (bối cảnh `van-phong`), người thật AI.

## 6. Drama tổng tài (`tong-tai`)
Nhại phim ngắn tổng tài: sếp xuất hiện đầy uy lực, câu chốt hạ, cả phòng nín thở; cú lật là sản phẩm, xảy ra trước mặt tổng tài. Giọng điệu cường điệu tự giễu, người xem biết đây là nhại thể loại.

- **Nhịp**: 0–3 tổng tài bước vào (góc thấp, quay chậm, `buoc-chan`, `whoosh-tram`) hoặc câu chốt hạ ("Ai làm báo cáo này?") · 3–60% áp lực dồn (ánh mắt lạnh, tập hồ sơ đặt xuống bàn, mọi người cúi đầu) · lặng 0,5–1 giây (`tim-dap`) · cú lật với `dun-dun`: sản phẩm làm điều tổng tài tưởng không thể · tổng tài sững người hoặc gật đầu · CTA.
- **Vai tổng tài linh hoạt theo brief** (Nam 2026-10-12): có thể là áp lực (nỗi đau: sếp đòi số trong 1 phút) hoặc người được sản phẩm cứu (tổng tài mất kiểm soát dòng tiền, sản phẩm giúp lật thế).
- **Sản phẩm vào ở đâu**: đúng cú lật, câu "hoá ra…" của phim; sau cú lật vẫn cho thấy sản phẩm làm gì.
- **Tổng tài theo sản phẩm**: REDSUN BOS là giám đốc công ty, SIPOS là chủ chuỗi quán, Webino là chủ shop online (luật "Người xem theo sản phẩm").
- **Ví dụ SIPOS**: tổng tài chuỗi cửa hàng đập tập hoá đơn xuống bàn "Sao tiền chuyển khoản không khớp?"; cả phòng nín thở; lặng; `dun-dun`: thu ngân mở SIPOS, mỗi đơn một mã QR, tiền vào là tự xác nhận; tổng tài nheo mắt, gật đầu một cái.
- **Giọng đa dạng (bắt buộc)**: tổng tài một giọng trầm, chậm, chắc; nhân viên một giọng khác giới; người dẫn chỉ ở video hoạt hình (video người thật AI không có người dẫn). Câu chốt hạ đặt ngoài khung (sau lưng, bước chân, mặt người nghe).
- **Máy quay, tiếng**: hero shot góc thấp, slow dolly-in vào mặt, crash zoom ở cú lật, dutch tilt khi căng; `buoc-chan`, `whoosh-tram`, `dap-dau` (đập bàn), `dun-dun`.
- **Luật cứng cho cả hai kiểu drama** (Nam 2026-10-12):
  - **Không lãng mạn**: không cặp đôi, không ánh mắt tình cảm, không đụng chạm, không "tổng tài bá đạo yêu tôi". Chỉ drama công việc.
  - **Không làm nhục, không quấy rối**: sếp được nghiêm, lạnh, không quát tháo xúc phạm, không ném đồ vào người, không đuổi việc làm trò cười.
  - **Không người có danh tính, không nhại phim cụ thể**: không gọi tên phim, diễn viên, nhân vật có bản quyền; tả nhân vật của riêng mình.
- **Lỗi hay gặp**: nhại quá lố thành phim, quên sản phẩm; cú lật không liên quan nỗi đau đầu video; tổng tài đọc lời khen sản phẩm (lời khen chỉ trên cảnh màn hình).
- **Kiểu hình hợp**: hoạt hình (nhân vật `outfit: "vest"`, bối cảnh `van-phong`), người thật AI.

**Nhạc cho hai kiểu drama** (Nam nghe duyệt 2026-10-12): tổng tài `mixkit-i-wont-surrender-846`, `mixkit-training-53`; drama văn phòng `mixkit-thunder-318`, `mixkit-complicated-281` (dự phòng). Ngoài ra dùng được bài `dien-anh` / `bi-an` sẵn có (`./reel info nhac dien-anh`).

---

## Chọn kiểu kể nào cho brief
| Brief có | Kiểu kể mạnh |
|---|---|
| Tình huống đời thường có người phản ứng, lời thoại | tiểu phẩm, POV |
| Một sự thật bất ngờ / hiểu lầm (ảnh giả, tưởng A hoá ra B) | twist |
| Con số, giá, mẹo thật do MKT đưa | mẹo / số liệu |
| Khoảnh khắc nghề lặp lại hằng ngày | POV |
| Tình huống công sở nhiều người (họp, deadline, số liệu lệch giữa phòng ban) | drama văn phòng |
| Áp lực từ sếp / chủ doanh nghiệp, cần một cú lật ấn tượng | drama tổng tài |

Ba concept khác kiểu kể không có nghĩa ba câu chuyện khác nhau hoàn toàn: cùng nỗi đau, cùng giải pháp của brief, kể theo ba cách.

Hai kiểu drama là hai mã khác nhau nhưng gần nhau: brief chỉ có một tình huống thì chọn **một** trong hai cho 3 concept, để MKT không phải chọn giữa hai concept na ná.
