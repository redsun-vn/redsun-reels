# Phong cách hình — comic, manga, siêu anh hùng

Dùng khi kịch bản có `concept.phongCachHinh` khác `thuong` (chỉ video **minh hoạ**; Claude chọn ở bước concept theo [tao-reel](../../tao-reel/SKILL.md), không hỏi MKT). Hàm ở `templates/_rieng/phong-cach.js` + `phong-cach-nhan-vat.js`, kèm `_rieng/phong-cach.css`; danh sách phong cách ở `config/phong-cach-hinh.ts`. Nam 2026-10-16 (decisions §43): video lặp vì mọi video cùng một nét vẽ; cú hút 3 giây của truyện tranh nằm ở **ngữ pháp hình** (ô truyện, đường tốc độ, khung va chạm, chữ tượng thanh, đứng hình), không ở nét mặt.

Mọi luật của [chieu-sau-hinh.md](chieu-sau-hinh.md) và [chieu-sau-cau-chuyen.md](../../tao-reel/references/chieu-sau-cau-chuyen.md) vẫn áp dụng, trừ chỗ ghi khác dưới đây.

## 1. Nạp bộ và gắn phong cách (validate chặn khi thiếu hay lệch)
```html
<link rel="stylesheet" href="_rieng/phong-cach.css" />          <!-- sau chieu-sau.css -->
<script src="_rieng/phong-cach.js"></script>                     <!-- sau chieu-sau.js -->
<script src="_rieng/phong-cach-nhan-vat.js"></script>            <!-- khi dùng RS.anhHung / RS.choangBay / RS.dauCamXuc -->
<script src="_rieng/phong-cach-truyen.js"></script>              <!-- comic, manga: lật trang, chibi, hắc khí, chớp trắng -->
<script src="_rieng/phong-cach-anh-hung.js"></script>            <!-- siêu anh hùng: phản diện, biến hình, góc thấp, tuyệt chiêu, vỡ tan -->
```
```js
RS.ready(function (tl) {
  RS.phongCach(null, "manga");   // đúng mã của script.json concept.phongCachHinh; gọi một lần, đầu hàm dựng
  …
```
`RS.phongCach` gắn lớp `pc-<mã>` lên gốc: nhân vật và quầy có viền mực, nền có chất liệu (comic: chấm halftone; siêu anh hùng: chấm nhỏ, màu rực; manga: đen trắng + screentone), bóng thoại viền mực bóng lệch. Không cần viết CSS riêng cho mấy thứ này.

## 2. Chữ
- **Câu kịch bản, phụ đề, CTA, tiêu đề cảnh**: vẫn Montserrat (`var(--font-body)`), như mọi video.
- **Chữ tượng thanh** (`BÙM!`, `ỐI!`, `XỊN QUÁ!`, `TÁCH!`) — Bangers qua lớp `rs-tuong-thanh` (cỡ `nho` khi cần), màu: mặc định màu nhấn sản phẩm, `vang`, `trang`, `do`. **≤ 3 từ**, viết sẵn trong HTML, không che chữ chính, nằm trong vùng an toàn (máy chặn). Một cảnh tối đa một chữ tượng thanh.
- **Tiêu đề kiểu truyện** ≤ 3 từ: `rs-tieu-de-truyen` (Bangers). **Ô lời dẫn** (`rs-loi-dan`, hộp vàng, Montserrat in hoa): "Trong khi đó…", "Tối hôm ấy…" — phải là chữ có trong kịch bản (mọi câu kịch bản phải có trên màn hình, ngược lại chữ trên màn hình cũng là lời của video).
- **Bóng hét**: `rs-bubble het` (răng cưa) cho câu la, giật mình.
- Bangers dấu chồng cao: khoảng cách dòng ≥ 1.6 (lớp có sẵn đã đặt), tránh hai dòng Bangers sát nhau.

## 3. Hàm
| Hàm | Việc |
|---|---|
| `RS.oTruyen(el, "mot" \| "doc-2" \| "bac-3" \| "cheo")` | Chia cảnh thành trang giấy có ô viền mực. Trả mảng ô `{ el, noi, tam }`; `noi` là khung 1080×1920 đã cắt theo ô: `RS.set(o.noi, …)`, đặt `.host` nhân vật vào `o.noi`, chuyển chữ HTML có sẵn vào bằng `o.noi.appendChild(…)` |
| `RS.danO(tl, o, at, "trai" \| "phai" \| "tren" \| "duoi" \| "giua")` | Ô đập vào trên phách (trượt vượt + rung; `giua` = phóng xuống) |
| `RS.tuongThanh(tl, el, at, { goc, rung, het })` | Chữ tượng thanh bật ra, rung nhỏ |
| `RS.duongToc(el, "tap-trung" \| "song-song", { tam, ho, goc, so, mau })` + `RS.duongTocChay(tl, d, từ, đến)` | Đường dồn vào mặt / vệt tốc độ, đổi nét mỗi 2 khung như vẽ tay. Dùng ngắn (≤ 2 giây mỗi lần) |
| `RS.khungVaCham(tl, el, at, lần, { tam })` | 2 khung đảo đen trắng + đường dồn trắng; cách nhau ≥ 1/3 giây (hàm tự giãn) |
| `RS.dungHinh(tl, lớpMáy, at, dur, { goc, canh })` | Đứng hình: khung nghiêng, viền ô mực, chấm dày. Truyền một lớp máy riêng (không lớp đang `RS.truotLech`); trong `dur` không cho nhân vật cử động |
| Trang truyện (`phong-cach-truyen.js`) | `RS.latTrang`, `RS.chibi`, `RS.hacKhi`, `RS.chopTrang` — xem mục 5; bố cục thêm `tren-thap`, `mat-3`, `xien-2`; lớp CSS `rs-tuong-thanh no` (nền nổ), `rs-bubble nghi` (bóng nghĩ) |
| Siêu anh hùng (`phong-cach-anh-hung.js`) | `RS.phanDien`, `RS.gocThap`, `RS.bienHinh`, `RS.tiaNangLuong`, `RS.vo` — xem mục 5 |
| `RS.moDau(tl, null, mã, opts)` | Công thức 3 giây đầu (mục 4). Lớp máy mà hàm đẩy vào (manga `cam`, `khung` của đứng hình) không chứa chữ: để chữ ở ngoài, không thì chữ bị phóng ra khỏi vùng an toàn |
| `RS.anhHung(p, { aoChoang, matNa, bieuTuong })` + `RS.choangBay(tl, p, từ, đến)` | Đồ siêu anh hùng; từ lúc nhân vật "hoá anh hùng", gọi cho người đó **ở mọi cảnh sau** họ xuất hiện (nhân vật nhất quán) |
| `RS.dauCamXuc(tl, p, kiểu, at, dur)` | `gan` (giận), `giot` (mồ hôi lớn), `ma-hong` (ngượng), `u-am` (sốc buồn), `lap-lanh` (mê), `cham-than` (giật mình) |
| Tư thế mới (`RS.pose`) | `chong-hong` (đứng tấn), `dam` (đấm vút), `bay` (vươn tay cất cánh) |

## 4. Ba giây đầu (LUẬT SỐ 1 vẫn là luật: điểm hấp dẫn nằm trong khung đầu)
```js
// comic: 3 ô đập vào trên 3 phách đầu, ô cuối là điểm hấp dẫn + chữ tượng thanh + khung va chạm
const o = RS.oTruyen("#pgA", "bac-3");
RS.moDau(tl, null, "comic", { o, phach: [0.12, 0.6, 1.1], tuongThanh: "#bumA", hook: "#hookA", hookAt: 0.05 });

// manga: đường dồn vào mặt từ khung đầu, máy đẩy vào mặt, dấu cảm xúc, đứng hình nghiêng + chữ tượng thanh
RS.moDau(tl, null, "manga", { cam: "#camA", khung: "#camA2", mat: [540, 820], p: chu, dau: "giot", phach: [0.45, 1.1], tuongThanh: "#oiA", hook: "#hookA", hookAt: 0.1 });

// siêu anh hùng: tia ngược sáng, nhân vật rơi xuống hạ cánh trên phách, bụi, khung va chạm, chống hông, áo choàng bay
const hero = RS.anhHung(ai("chu", { width: 700, mood: "tu-tin" }), { bieuTuong: "brand/logos/sipos/sipos-icon.webp" });
RS.moDau(tl, null, "sieu-anh-hung", { nguoi: "#heroA", p: hero, cam: "#camA", dat: [540, 1600], phach: [0.6, 1.3], tuongThanh: "#xinA", hook: "#hookA" });
```
- `phach` là giây tuyệt đối; lấy từ `./reel info nhip <nhạc>`. Muốn dùng giữa video: `tu` = giây bắt đầu.
- Hook chữ phải hiện trong giây đầu (`hookAt` ≤ 1). Siêu anh hùng: khung đầu đã có tia sáng + chữ, nhân vật rơi vào ngay sau.

## 5. Ngữ pháp từng phong cách (dùng suốt video, không chỉ hook)
**Mẫu nhịp** (`config/phong-cach-hinh.ts` `mauNhip`) là chuỗi nhịp kịch bản phải có; kịch bản tự chấm theo mẫu ([script-format.md](../../tao-reel/references/script-format.md) mục "Tự chấm"). Chỉ đổi trang phục / nét vẽ mà câu chuyện không đi theo mẫu là **chưa đạt** (bài học bản siêu anh hùng đầu tiên 2026-10-16). Dưới đây là cách dựng từng nhịp.

**Comic** (nạp thêm `_rieng/phong-cach-truyen.js`). Video là **một chuỗi trang**, không phải cảnh thường có viền:
- Mỗi cảnh là một trang `RS.oTruyen` (`cheo`, `bac-3`, `doc-2`, `tren-thap`); **mỗi nhịp kể là một ô**, ô đập vào đúng phách (`RS.danO`; ô trượt từ ngoài khung nên gọi sớm ~0.06 giây để chuyển động hiện ra đúng phách). Không để ô trống quá ~1 giây.
- Sang cảnh bằng **lật trang** `RS.latTrang(tl, "#cảnhMới", at)`; nối khớp hình (lao vào màn hình) thì cho ô phóng tràn trang (tween `clipPath` của `o.noi` thành cả khung) rồi `RS.laoVao`.
- Ô lời dẫn vàng `rs-loi-dan` cho câu chuyển thời gian (chữ của kịch bản); bóng thoại / bóng hét `het` / bóng nghĩ `nghi` viền mực.
- Chữ tượng thanh trên **nền nổ** ở cú nhấn: `<div class="rs-tuong-thanh no"><span>BÙM!</span></div>` (chữ trong `<span>`, validate chặn khi thiếu). Bóng hét cũng viết chữ trong `<span>`.
- Vỡ lẽ là **trang tràn** (`mot`) và nhân vật **phá khung**: đặt khung nhân vật ngoài trang (trên viền ô).
- **Trang kết lặp bố cục trang mở** (khép vòng): cùng chỗ đặt vật / người như trang 1, nay là kết quả tốt (màn hình "Đã thanh toán", người nhìn màn hình cười); nửa dưới là thương hiệu + CTA (`tren-thap`).
- Chấm halftone đã tách lớp: lớp xa **không** `RS.moSau` (mờ làm nát chấm); chiều sâu bằng thị sai + lớp sát ống kính. Manga và siêu anh hùng dùng `RS.moSau` được (lọc màu nằm ở lớp con).

**Manga** (nạp thêm `_rieng/phong-cach-truyen.js`)
- Trang ô **xiên** (`xien-2`, `mat-3`), screentone; trang mở có **dải cận mắt** (`mat-3` ô 1: nhân vật rộng ~1800 px, đặt sao cho mắt nằm giữa dải) và đường dồn vào vật / mặt (`RS.duongToc` "tap-trung", nền tối thì `mau: "trang"`).
- Phản ứng hài phóng đại: **chibi** `RS.chibi(tl, p, at, dur)` (đầu to người nhỏ, nảy) + dấu cảm xúc.
- Trước cú lật: **hắc khí** `RS.hacKhi(tl, vật, từ, đến)` + chữ tượng thanh "ẦM ẦM" (trong khoảng lặng: chỉ hình, không tiếng to).
- Cú lật: **chớp trắng** `RS.chopTrang(tl, cảnh, at)` + đứng hình nghiêng `RS.dungHinh` (lớp máy riêng).
- Thở phào: nền lấp lánh = `RS.drift(tl, lớp, "sao" | "bong", …)` sau nhân vật, `ma-hong`, `lap-lanh`.
- Đen trắng, **một màu duy nhất** là màn hình sản phẩm/đạo cụ (`data-minh-hoa` giữ màu) và phụ kiện: người xem nhìn thẳng vào sản phẩm.
- Cảnh giải pháp có thể **trở lại màu** (thêm lớp `pc-mau` vào phần tử cảnh): thế giới có màu khi có sản phẩm; nền thương hiệu ở cảnh kết luôn giữ màu. Bộ so nền của `snap` cũng cần ít nhất một cảnh có màu để các cảnh xám không bị báo giống nhau.
- Cận mặt nhiều (mặt chiếm ≥ 40% khung ở khoảnh khắc cảm xúc), dấu cảm xúc phóng đại ở mọi cú nhấn, đường dồn vào mặt ở cú sốc, đứng hình nghiêng ở cú lật.
- Hợp drama tổng tài: tổng tài xuất hiện = `RS.dungHinh` + `lap-lanh` trên người xung quanh; câu chốt hạ = chữ tượng thanh nhỏ.

**Siêu anh hùng** (nạp thêm `_rieng/phong-cach-anh-hung.js`)
- Hiểm hoạ: nỗi đau thành **kẻ phản diện** — `RS.phanDien(tl, vật, từ, đến)` (hào quang tím quanh tấm ảnh giả, hoá đơn sai…).
- Xuất hiện: `RS.moDau(…, "sieu-anh-hung")` (rơi xuống, tia sáng, bụi) + `RS.gocThap(tl, lớpMáy, at, dur)` (góc máy thấp, lớp máy riêng).
- Biến hình ở cảnh giải pháp: `RS.bienHinh(tl, p, at)` — người thường thành người hùng khi có sản phẩm (gọi `RS.anhHung` trước, hàm ẩn đồ tới lúc biến hình).
- Tuyệt chiêu = tính năng sản phẩm: `RS.tiaNangLuong(tl, lớp, [x, y] tay, [x, y] đích, at, dur)` bắn vào màn hình sản phẩm đúng lúc tính năng chạy (vd. "Đã thanh toán").
- Hạ phản diện: `RS.vo(tl, vật, at)` (vật vỡ tan; vật phóng thu bằng `gsap.set`, không bằng lớp CSS) + `RS.khungVaCham`.
- Chiến thắng: `chong-hong` / `an-mung`, `RS.choangBay`, tia sáng sau logo ở cảnh kết.
- Một nhân vật (thường là chủ quán / đội sale) "hoá anh hùng" ở cảnh giải pháp nhờ sản phẩm; cảnh vấn đề là "thảm hoạ" (nền `bao-dong`, đường tốc độ).
- Biểu tượng ngực là **logo sản phẩm** dùng thẳng file có sẵn: SIPOS `brand/logos/sipos/sipos-icon.webp`, Webino `brand/logos/webino/webino-icon.png`, REDSUN `brand/logos/redsun/redsun-icon.png`, REDSUN BOS `brand/logos/bos/bos-logo-nen-sang.png`. Không vẽ lại, không đổi màu, không bóp méo. Ghi thẳng đường dẫn vào `bieuTuong` (validate kiểm file có thật, đúng thư mục sản phẩm). Tránh tư thế tay qua ngực (`giu-nguc`, `chap-tay`, `nhin-dt`, `cam-dt`, `chong-cam`) khi có biểu tượng.
- Áo choàng màu nhấn sản phẩm, tia ngược sáng, hạ cánh có bụi; CTA có thể giữ tư thế `chong-hong` hoặc `bay`.

## 5a. Nhạc
Không có nhạc cố định theo phong cách: Claude chọn cho từng video theo câu chuyện và nhịp dựng (bắt tai, phách rõ cho cú nhấn, cảm xúc hợp bảng nhịp), xem tiêu chí ở `tao-reel/references/script-format.md` mục "Tự chấm". Ví dụ đã thử: comic và manga hài hợp nhạc vui nảy (Smile); manga với nhạc bí ẩn chậm (Tapis) bị chê; siêu anh hùng dùng nhạc điện ảnh hành động (I Won't Surrender).

## 5b. Đổi nhạc mà giữ bản dựng
Đổi bài nhạc khác nhịp (vd. MKT chê nhạc) thì không viết lại từng mốc giây: cuối hàm dựng gọi `RS.doiNhip(tl, [[giây cũ, giây mới], …])` với các mốc là khoảnh khắc chính (đầu cảnh, cú nhấn, vỡ lẽ) đặt lên phách bài mới (`./reel info nhip <nhạc>`); hàm dời và co giãn mọi chuyển động giữa hai mốc. Dời `data-start` / `data-duration` của cảnh, `tieng-dong.txt` và `durationSec` trong kịch bản theo cùng mốc. Mẫu: bản manga 2026-10-16 (nhạc Tapis → Smile).

## 6. Cấm
- Nhân vật, trang phục, biểu tượng giống tác phẩm có bản quyền (Marvel, DC, chữ S, Doraemon, One Piece, nhân vật anime có thật…). Siêu anh hùng là bản nhại chung.
- Nhấp nháy > 3 lần/giây (khung va chạm, chớp sáng cộng lại).
- Chữ Bangers cho câu dài, CTA, giá, số liệu.
- Phong cách truyện trong video người thật (validate chặn).

## 7. Tự soát (mỗi vòng snap)
- [ ] Khung đầu (0–1 giây) đã thấy rõ phong cách (ô / đường dồn / tia sáng) và chữ hook.
- [ ] Viền mực không làm nét mặt bẩn; dấu cảm xúc đúng cảm xúc của câu chuyện.
- [ ] Chữ tượng thanh ≤ 3 từ, đọc rõ, không che chữ chính, trong vùng an toàn; dấu tiếng Việt không chạm dòng khác.
- [ ] Manga: chỉ sản phẩm có màu; siêu anh hùng: logo ngực đúng file, không méo.
- [ ] Đường tốc độ, khung va chạm chỉ ở cú nhấn (không phủ cả video); không quá 3 lần chớp mỗi giây.
- [ ] Vẫn đủ chiều sâu (≥ 3 lớp hoặc ô truyện có lớp xa/gần) và vẫn khác video gần nhất cùng sản phẩm.
