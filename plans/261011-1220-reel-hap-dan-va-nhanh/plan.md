---
title: "Reel hấp dẫn hơn và nhanh hơn"
description: "4 kiểu kể, MKT chọn concept, LUẬT 2 nới hình thức; brief→MP4 ≤ 15 phút máy chạy mọi kiểu hình"
status: pending
priority: P1
effort: 2-3 ngày (gồm 3 video thử)
branch: main
tags: [kich-ban, dung-video, toc-do]
blockedBy: []
blocks: []
created: 2026-10-11
owner: Nam
---

# Reel hấp dẫn hơn và nhanh hơn

## Mục tiêu
Nam 2026-10-11 (ak:advise): video hiện qua luật nhưng giống quảng cáo (đoán trước, thiếu cảm xúc/hài, nhịp chưa cuốn); brief→MP4 khoảng 30 phút máy chạy. Ưu tiên **hấp dẫn trước, nhanh sau**.

## Nam chốt (2026-10-11)
- 4 kiểu kể: tiểu phẩm hài đời thường, POV "khi bạn là chủ quán…", kể chuyện có twist, mẹo / số liệu gây sốc.
- LUẬT SỐ 2 giữ ý (nỗi đau thật → sản phẩm giải quyết), nới hình thức: giải pháp ≥ 12% video, bắt đầu trước 85%; sản phẩm được là cú chốt.
- MKT chọn 1 trong 3 concept (3 kiểu kể khác nhau): điểm dừng duy nhất sau câu hỏi kiểu hình.
- Vẫn viết HTML từ đầu cho mỗi video (không kho khuôn).
- ≤ 15 phút máy chạy cho mọi kiểu hình, không tính lúc người trả lời.
- Đo hấp dẫn: so mù bản cũ/mới trên 3 brief (mới thắng ≥ 2/3) + số liệu sau đăng.

## Ràng buộc
LUẬT SỐ 1 mạnh nhất, 15–30 giây, không bịa (mẹo/số liệu chỉ từ MKT/hồ sơ sản phẩm), nhãn AI, trần 50.000đ/video (cả khi gửi song song), Opus 5.5, chỉ chạy qua `./reel`, HyperFrames giữ 0.8.141.

## Không làm
Kho khuôn HTML, đổi model, nhạc ngoài manifest, nâng HyperFrames, chạy quảng cáo, "hấp dẫn" thành luật chặn trong validate.

## Tiêu chí xong
1. Mỗi lệnh `./reel` ghi thời gian vào `briefs/<tên>/thoi-gian.jsonl`; render ghi tổng máy chạy (trừ lúc chờ người) vào `cost.json`.
2. Clip AI gửi song song (trần tính cả việc đang chờ); giọng tạo song song có giới hạn.
3. Validate nhận `concept.kieuKe` (4 kiểu), ngưỡng 12% / 85% khi có kiểu kể; LUẬT 1 và 15–30 giây không đổi; test.
4. LUẬT 1/2 gom về một file tham chiếu; `tao-reel` có bước MKT chọn concept, bảng nhịp, 4 tiêu chí hấp dẫn; `dung-video` chạy giọng nền, snap/render tiết kiệm.
5. 3 video thử (minh hoạ, quay sẵn, người thật AI) ≤ 15 phút; so mù mới thắng ≥ 2/3; Google Sheet chung có số liệu sau đăng ≥ 3 video mới.
6. `./reel test`, `typecheck`, `lint:brand`, `test:render` pass; `docs/decisions.md` §34, changelog.

## Giai đoạn
| # | Việc | File | Trạng thái |
|---|---|---|---|
| 1 | [Đo thời gian + quyền skill](phase-01-do-thoi-gian.md) | `reel`, `scripts/lib/thoi-gian.ts`, `render-video.ts`, settings | chờ |
| 2 | [Clip AI và giọng song song](phase-02-song-song.md) | `scripts/ai.ts`, `scripts/giong.ts` | chờ |
| 3 | [Kiểu kể trong config + validate](phase-03-kieu-ke-validate.md) | `config/kieu-ke.ts`, schema, `validate-video.ts`, test | chờ |
| 4 | [Skill: gom luật, chọn concept, bảng nhịp](phase-04-skill.md) | `.claude/skills/*` | chờ |
| 5 | [Tài liệu](phase-05-tai-lieu.md) | decisions, changelog, REQUIREMENTS §6.2, CLAUDE.md, sổ tay MKT | chờ |
| 6 | [3 video thử, so mù, số liệu](phase-06-thu-nghiem.md) | `briefs/…` | chờ (cần Nam/MKT) |

Thứ tự: 1 → 2 → 3 → 4 → 5 → 6. Giai đoạn 1–2 độc lập với 3–4 nhưng chạy tuần tự (cùng một người làm, tránh đụng file).

## Dừng hỏi Nam khi
OpenRouter/VieNeu không cho chạy nhiều việc cùng lúc (429 lặp lại khi song song); quay sẵn vẫn > 15 phút vì khâu tìm clip; lỗi không giải thích được; thao tác xoá hoặc không quay lại được.

## Câu hỏi còn mở
- Số liệu sau đăng: Nam chốt **Google Sheet chung**; đã tạo tab "Số liệu video" trong file "Research database" (2026-10-11). MKT tự nhập, không làm kết nối tự động trong `./reel`.
- Ngưỡng 12% / 85% và "thắng ≥ 2/3" là giả định, chỉnh sau 3 video thử.
