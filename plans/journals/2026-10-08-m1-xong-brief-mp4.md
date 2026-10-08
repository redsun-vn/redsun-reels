---
title: "M1 xong: brief → MP4"
date: 2026-10-08
summary: "Pipeline M1 chạy đầu-cuối, 8 brief e2e đạt chuẩn; còn chờ nhạc thật"
---

# M1 xong: brief → MP4

## What happened
- Làm xong M1: validate/build/preview/render/make, scene-kit dùng chung, FeatureLaunch + TipOfTheDay, phong cách toi-gian/khuyen-mai/vui-nhon, brand lint, music lint, render test (SSIM 1.0 khi render lại), e2e 8 brief.
- Nam góp ý trong lúc làm: dòng chữ dính sát → giãn dòng 1.25/1.45; chữ tràn → tự co cỡ theo thang + giới hạn số dòng; yêu cầu README rõ ràng → viết README cho MKT và dev.
- Code review tìm được 2 lỗi high: video trong cảnh đứng hình (đã xác nhận bằng render, sửa bằng cách đưa video ra làm clip riêng trong root), và file sai chuẩn vẫn nằm trong out/. Cùng 7 lỗi medium; đã sửa hết trừ lỗ hổng nhỏ của brand lint.

## Bài học
- `hyperframes check` bắt được tương phản 1.99:1 và chữ bị phone che: nên luôn chạy check trong build.
- Log HyperFrames có dòng "Asset load failure: … complete" dù không có lỗi, nên lọc lỗi phải bắt theo mã HTTP.

## Next steps
- Nam chọn nhạc thật (Pixabay/Mixkit) + duyệt CTA/hashtag.
- M2: skill cai-dat + tao-reel, CLAUDE.md, README cho MKT dựa trên skill.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
