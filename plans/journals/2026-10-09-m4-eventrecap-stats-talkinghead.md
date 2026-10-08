---
title: "M4: EventRecap, Stats, TalkingHead, tiếng gốc clip"
date: 2026-10-08
summary: Đủ 20 loại video; tiếng gốc clip + hạ nhạc bằng lane ghi sẵn vào stage
---

# M4: EventRecap, Stats, TalkingHead, tiếng gốc clip

## What happened
- 3 template mới; 21 brief mẫu xuất MP4 đạt §9.1; render test 152 tổ hợp.
- Thử: `data-automation` gán bằng JS lúc chạy bị HyperFrames 0.8.141 bỏ qua; ghi sẵn trong HTML thì nhạc hạ ~12 dB. Build ghi lane vào stage.
- Review bắt lỗi nghiêm trọng: lớp tối đi cùng video bị chuyển cảnh tween opacity lên 1, che kín clip ở 10/19 phong cách. Sửa bằng màu có alpha.
- Video có `id` → `hyperframes snapshot` vẽ được khung video; ảnh chuẩn các cảnh có clip đổi theo.
- Lỗi tương phản cũ: chữ nhấn đỏ SIPOS trên teal 1.99:1 ở kiểu gạch chân/gạch lượn; render test không chạy `check` nên trước đây không thấy.

## Decision
- Tiếng gốc là `<audio>` riêng, video luôn muted. Không dùng voiceover carve.
- Nối clip liền mạch chỉ ở loại video giữ tiếng, để không đổi video cũ.

## Next steps
- Thử TalkingHead với clip quay thật của MKT; 10 video thử nghiệm §14.3; nhạc thật; Mac chip M.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
