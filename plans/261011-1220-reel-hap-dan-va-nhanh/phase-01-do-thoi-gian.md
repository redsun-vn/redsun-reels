# Giai đoạn 1 — Đo thời gian từng bước + quyền skill

## Vì sao
Số 30 phút đang là ước. Nhật ký phiên cho `validate` ~43 giây/lần trong khi đo thật 1,3 giây → chưa biết thời gian thật đi đâu (chờ cho phép, Claude nghĩ, hay lệnh). Cần số đo trước khi tối ưu.

## Việc
1. `scripts/lib/thoi-gian.ts`: `ghiThoiGian(slug, lenh, batDau, ketThuc, ok)` nối một dòng JSON vào `briefs/<tên>/thoi-gian.jsonl` (`{lenh, batDau, ketThuc, giay, ok}`); `tongMayChay(slug)`: từ dòng `new` (hoặc dòng đầu) tới cuối `render`, trừ các khoảng chờ người (từ dòng `moc hoi` tới lệnh kế tiếp).
2. Ghi ở `runCommand` (`scripts/lib/cli.ts`): bọc `fn`, lấy slug từ đối số đầu không bắt đầu bằng `--`; chỉ ghi khi `briefs/<slug>/` tồn tại (lệnh `info`, `doctor`… bỏ qua). Lệnh lỗi vẫn ghi (`ok: false`).
3. Lệnh `./reel moc <tên> hoi`: ghi mốc "bắt đầu chờ người" (skill gọi ngay trước mỗi AskUserQuestion trong luồng làm video).
4. `render-video.ts`: thêm `thoiGian: { mayChaySec, choNguoiSec, theoLenh: { render, snap, ai, giong, … } }` vào `cost.json`; in một dòng "Máy chạy N phút (chờ người M phút)".
5. `.claude/settings.json` allow thêm `Skill(chon-kieu-hinh)`, `Skill(giong-doc)`.

## Test
- Unit: `tongMayChay` với jsonl mẫu (có mốc hoi, có lệnh lỗi, thiếu `new`).
- `./reel validate 2026-10-10-sipos-qr-chuyen-khoan-gia` ghi đúng một dòng vào `thoi-gian.jsonl`.
- `./reel test`, `./reel typecheck`.

## Rủi ro
Thời gian Claude viết file (không qua `./reel`) chỉ thấy gián tiếp qua khoảng trống giữa hai lệnh: chấp nhận, báo cáo gộp "giữa các lệnh".
