# Nguồn nhạc nền được phép dùng

Cập nhật: 2026-10-09. Nam đã chốt nguồn (mục 0); thư viện hiện có ở mục 5.

Nhu cầu: video Reel/TikTok/Shorts quảng bá sản phẩm (dùng thương mại), đăng lên Facebook, Instagram, TikTok, YouTube. Có chế độ chỉ nhạc nền, không giọng đọc. Nhạc được trộn sẵn vào MP4 khi render local. REQUIREMENTS §12 yêu cầu: chỉ dùng nhạc trong `brand/music/`, có manifest ghi nguồn + license.

> Lưu ý: điều khoản các trang thay đổi theo thời gian. Phần dưới tổng hợp từ tìm kiếm ngày 2026-10-08, một số ý đến từ nguồn thứ cấp (ghi rõ). **Trước khi đưa một track vào `brand/music/`, người duyệt (MKT lead) phải mở trang license chính thức của track đó và lưu bằng chứng (mục 3).**

## 0. Quyết định (Nam, 2026-10-08)
- Video **chỉ đăng tự nhiên (organic)**, không chạy quảng cáo trả tiền → không cần thuê bao Nhóm D.
- Nguồn chính **Pixabay Music**, nguồn phụ **Mixkit** (Nhóm A). Incompetech/Freesound CC0 chỉ dùng khi hai nguồn trên thiếu mood.
- Trường `allowedUse` trong manifest chỉ cần `social-organic`. Muốn chạy ads sau này thì phải xét lại từng track.

## 1. Khuyến nghị

### Nhóm A — dùng ngay: miễn phí, thương mại được, không cần ghi nguồn
| Nguồn | Điều khoản chính | Cần chú ý |
|---|---|---|
| **Pixabay Music** (pixabay.com/music) | Theo FAQ/Terms của Pixabay: dùng thương mại và phi thương mại, không cần ghi nguồn, quyền không độc quyền, vĩnh viễn | Không được bán/phân phối riêng track. Pixabay **không bảo đảm** quyền với sample, nhãn hiệu, người trong nội dung; trách nhiệm kiểm tra thuộc người dùng. Có báo cáo track bị đăng ký Content ID sau này (nguồn thứ cấp), nên tránh track có tag "Content ID" hoặc ghi chú tương tự của tác giả |
| **Mixkit** (mixkit.co/free-stock-music) | Trang nhạc ghi: miễn phí cho cá nhân và thương mại, ghi nguồn "không bắt buộc" | Trang nhạc ghi không dùng cho CD, DVD, video game, **TV & radio broadcast**: không sao với reel mạng xã hội, nhưng **không** dùng cho quảng cáo truyền hình. Không bán lại track rời. Chưa đọc được trang license gốc, cần mở để xác nhận |

### Nhóm B — dùng được, nhưng phải ghi nguồn hoặc lọc kỹ
| Nguồn | Điều khoản | Cách dùng |
|---|---|---|
| **Incompetech** (Kevin MacLeod) | CC BY 4.0: thương mại OK, **bắt buộc ghi nguồn**. Có license trả phí để bỏ ghi nguồn | Ghi credit trong caption bài đăng, ví dụ: "Music: <tên track> by Kevin MacLeod (incompetech.com), CC BY 4.0" |
| **Freesound** (hiệu ứng âm thanh, SFX) | License theo từng file: CC0, CC BY, CC BY-NC | **Chỉ lấy CC0** (thương mại, không cần ghi nguồn). CC BY phải ghi nguồn. **Cấm CC BY-NC** |

### Nhóm C — chỉ dùng trong app của nền tảng, không trộn sẵn vào MP4
| Nguồn | Ghi chú |
|---|---|
| **TikTok Commercial Music Library** | Dành cho tài khoản business/tổ chức đã xác minh, chọn nhạc ngay trong app TikTok. Video đã có sẵn nhạc từ nguồn khác thì license phải bao gồm dùng thương mại trên TikTok, và phải xác nhận Music Usage Confirmation khi đăng (nguồn thứ cấp) |
| **Meta Sound Collection** (Facebook/Instagram) | Meta mô tả là miễn phí bản quyền, an toàn cho Reels/Stories. Thư viện nhạc licensed thông thường của Meta chỉ dùng phi thương mại, tài khoản business bị chặn. Chưa xác nhận được việc dùng cho **quảng cáo trả tiền** |
Hai nguồn này hợp với cách "MKT đăng xong rồi gắn nhạc trong app". Pipeline render local của dự án không dùng được.

### Nhóm D — nếu cần chắc chắn cho quảng cáo trả tiền
Thư viện thuê bao có license business và cam kết Content ID, như Epidemic Sound, Artlist, Soundstripe… Mất phí, giá và điều khoản **chưa kiểm**. Nên cân nhắc nếu video chạy ads với ngân sách lớn.

## 2. Không dùng
| Nguồn | Lý do |
|---|---|
| **MusicGen** (Meta AudioCraft). `hyperframes doctor` có gợi ý cài làm "local music fallback" | Weights dùng **CC-BY-NC 4.0, không thương mại** |
| **Uppbeat bản miễn phí** | 3 lượt tải/tháng, phải dán credit, license cá nhân. Quảng cáo và nội dung khách hàng nằm ở gói Pro |
| **YouTube Audio Library** cho video đăng ngoài YouTube | Trợ giúp của YouTube chỉ nói về dùng trong video YouTube. Bảo vệ Content ID không áp dụng trên TikTok/Facebook. Chỉ dùng track ghi CC BY và có ghi nguồn |
| Nhạc thịnh hành, nhạc ca sĩ, nhạc "no copyright" trôi nổi trên YouTube | Không có license rõ ràng |
| Freesound **CC BY-NC**, mọi license có "NC" | Cấm thương mại |
| **Stable Audio Open** (AI tạo nhạc) | Community License cho phép thương mại với tổ chức doanh thu ≤ 1 triệu USD/năm; trên mức đó cần license enterprise. **Chờ Nam xác nhận** doanh thu Redsun. Chưa đọc được bản license gốc |

## 3. Quy trình đưa một track vào `brand/music/`
1. MKT lead chọn track từ Nhóm A (ưu tiên) hoặc B. Chọn **nhạc không lời**, tránh track có sample giọng hoặc tên thương hiệu khác.
2. Lưu bằng chứng license: URL trang track, ảnh chụp hoặc PDF trang license **kèm ngày tải**, tên tác giả, và license ID nếu trang có cung cấp. Lưu ở thư mục chung **ngoài repo** (như giấy đồng ý giọng đọc, §8.3).
3. Dev thêm file vào `brand/music/` và thêm một dòng vào `brand/music/manifest.json`:
   ```json
   {
     "id": "upbeat-01",
     "file": "upbeat-01.mp3",
     "title": "<tên track>",
     "author": "<tác giả>",
     "source": "pixabay",
     "sourceUrl": "https://pixabay.com/music/…",
     "license": "Pixabay Content License",
     "attributionRequired": false,
     "attributionText": null,
     "downloadedAt": "2026-10-08",
     "evidence": "<đường dẫn bằng chứng ngoài repo>",
     "mood": ["vui-nhon", "khuyen-mai"],
     "bpm": 120,
     "durationSec": 60,
     "allowedUse": ["social-organic"],
     "notes": "không lời"
   }
   ```
   - `mood` dùng id phong cách trong `docs/video-style-catalog.md`, để `music: auto` chọn đúng nhạc theo phong cách.
   - `attributionRequired: true` (Incompetech, CC BY): skill `tao-reel` tự nhắc MKT dán `attributionText` vào caption bài đăng.
4. `pnpm validate` (M1) chặn video dùng track không có trong manifest, thiếu `license`/`sourceUrl`, hoặc có license chứa "NC".
5. Bị claim Content ID: gỡ track khỏi manifest (đánh dấu `"blocked": true`), dùng bằng chứng license để kháng nghị.

## 4. Đề xuất khởi đầu
Mỗi nhóm phong cách chính chọn 2–3 track, khoảng 20–30 track từ Pixabay Music + Mixkit. Ví dụ: tối giản / công nghệ, vui nhộn / khuyến mãi, lãng mạn / thư giãn, hành động / năng động, lễ hội / Tết, điện ảnh / kể chuyện. Spike chưa tải track nào, việc này để MKT lead chọn ở M0.2.

## 5. Thư viện hiện có (2026-10-09)
**Tiêu chí chọn bài (Nam, 2026-10-09: "reel cần thu hút, nên nhạc cần hấp dẫn hơn")**: bắt tai, có nhịp/hook ngay 3 giây đầu, tempo vừa–nhanh. Phong cách nhẹ (thư giãn, lãng mạn, sang trọng) cũng chọn bài có beat: lo-fi, R&B, acid jazz, bossa nova, electronica. Không chọn ambient, thiền, harp/flute, acoustic trẻ con, corporate nhạt: Nam đã bỏ hầu hết các bài kiểu này qua 3 lượt nghe.
- **Bỏ đoạn dạo đầu**: trường `startSec` (đo tự động: `./reel music:intro`; `music:add` tự đo). Video phát nhạc từ chỗ vào nhịp thay vì từ giây 0.

- **Nghe và chọn**: `./reel music:page` rồi mở `out/nghe-nhac.html` (trình duyệt, chạy offline). Đánh dấu Giữ/Bỏ/Dùng thật, bấm "Copy kết quả" gửi dev cập nhật manifest.
- **27 bài Mixkit** (`mixkit-*`), dùng được cho video thật. Mỗi phong cách có ít nhất 2 bài.
  - Đợt 1 (20 bài): Nam nghe 2026-10-09, bỏ 6 bài (Curiosity, Digital Clouds, Motivating Mornings, Trap Electro Vibes, Serene View, Relax Beat), đã xoá khỏi manifest.
  - Đợt 2 (10 bài): Nam giữ 3 (K.O., Sports Highlights, Infected Mushroom Vibes), bỏ 7 bài ambient/thiền/acoustic nhẹ.
  - Đợt 3 (8 bài): Nam giữ 4 (Tech House Vibes, Cat Walk, Smile, Summer's Here), bỏ 4 bài chill nhẹ.
  - Đợt 4 (6 bài, ghi chú "Ứng viên đợt 4"): chill nhưng có groove cho thư giãn, lãng mạn (Hip Hop 02, Funky Triplets, Dry Gin, Hazy After Hours, It's Love, Latin Lovers). Chờ Nam nghe. Xem: `./reel info nhac <phong-cách>`.
  - Claude chọn theo thẻ thể loại/tâm trạng trên Mixkit, bài không lời, dài ≥ 88 giây. **Chưa ai nghe**: MKT lead nghe lại, bỏ bài không hợp (đặt `"blocked": true`), và đăng thử riêng tư để kiểm Content ID.
  - License (bản gốc, render từ `mixkit.co/license/#musicFree` ngày 2026-10-09): dùng thương mại và phi thương mại; được dùng trên web, mạng xã hội, quảng cáo online, podcast. **Không** dùng cho CD/DVD, game, phát sóng TV/radio; không remix thành bài nhạc riêng, không nhận là của mình, **không đăng ký vào dịch vụ quản lý bản quyền** (Content ID). Bị claim thì gửi chi tiết tới team@mixkit.co.
  - Bằng chứng: `~/Documents/redsun-reels-bang-chung-nhac/mixkit-2026-10-09/` trên máy Nam (PDF + văn bản license, trang danh sách, mã SHA-256 từng bài). Nam chuyển lên Drive.
- **Không đưa file nhạc bên thứ ba lên repo**: repo công khai, còn license cấm phân phối lại track rời. Manifest ghi `downloadUrl` + `sha256`; máy MKT tự tải khi cài (`cai-dat.sh` bước 6, hoặc `./reel music:fetch`). File ở nguồn đổi (sai SHA) thì không dùng, báo dev.
- **Pixabay**: trang chặn tải tự động (HTTP 403, 2026-10-09). Muốn thêm bài Pixabay, MKT lead tải tay, Nam để file ở nơi tải được bằng link (Drive riêng), rồi ghi `downloadUrl` + `sha256` như Mixkit.
- **Nhạc MKT tự tìm** (`./reel music:add`): MKT bỏ file + ảnh chụp trang bài (cùng tên) vào `nhac-tu-tim/`. Lệnh chỉ nhận link Pixabay/Mixkit, bắt buộc có ảnh chụp, ghi bài vào manifest trên máy đó với `localOnly: true`. Thư mục `nhac-tu-tim/` nằm ngoài git. **Nam gom vào thư viện chung**: lấy file và ảnh từ máy MKT, lưu bằng chứng lên Drive, đặt file ở link tải được, rồi thêm vào manifest với `downloadUrl` + `sha256` (bỏ `localOnly`).
- **Bài tự sinh** (`gen-*`; Nam nghe 2026-10-09, bỏ explainer, synthwave, ambient, future_bass; còn `gen-pop-01`, mgaudio từ [mg-styles-15](https://github.com/vincentwei1021/mg-styles-15), code MIT, mẫu VCSL CC0): bản quyền thuộc Redsun, nên nằm trong repo. Hiện để `internal-test` (chỉ xem thử) vì nguồn chính Nam đã chốt là Pixabay/Mixkit. Nam nghe xong, muốn dùng thật thì đổi `allowedUse` sang `social-organic`.

## Nguồn tham khảo
- Pixabay: [FAQ](https://pixabay.com/service/faq/), [Terms](https://pixabay.com/service/terms/); về rủi ro Content ID: [Thematic vs Pixabay](https://hellothematic.com/thematic-vs-pixabay/) (thứ cấp)
- Mixkit: [Free stock music](https://mixkit.co/free-stock-music/), [Mixkit info](https://mixkit.co/llm-info/)
- Incompetech: [licenseorg guide](https://licenseorg.com/guide/music-audio/incompetech) (thứ cấp)
- Freesound: [Wikipedia](https://en.Wikipedia.com/wiki/Freesound), [Soundly FAQ](https://getsoundly.com/faq/how-can-i-use-the-freesound-library)
- Uppbeat: [Pricing](https://uppbeat.io/pricing)
- YouTube Audio Library: [Creator Essentials](https://www.creatoressentials.com/glossary/youtube-audio-library/) (thứ cấp)
- TikTok CML: [Soundstripe](https://www.soundstripe.com/tiktok), [Social Media Today](https://www.socialmediatoday.com/news/tiktok-changes-rules-on-music-usage-by-businesses/577734/) (thứ cấp)
- Meta Sound Collection: [Instagram Help](https://help.instagram.com/ipad-app/402084904469945)
- MusicGen: [Replicate readme](https://replicate.com/meta/musicgen/readme); Stable Audio Open: [Hugging Face](https://huggingface.co/stabilityai/stable-audio-open-1.0), [Stability research](https://stability.ai/news/stable-audio-open-research-paper)

## Câu hỏi chưa giải quyết
1. (Đã chốt) Pixabay Music chính + Mixkit phụ; chỉ đăng organic.
2. Nên cho MKT lead đăng thử 5–10 track ở chế độ riêng tư lên YouTube/Facebook để kiểm Content ID trước khi nhập hàng loạt?
3. Doanh thu năm của Redsun có dưới 1 triệu USD không? Câu này quyết định việc dùng Stable Audio Open.
4. (Đã chốt) Nam giữ bằng chứng license. Còn mở: thư mục Drive cụ thể.
