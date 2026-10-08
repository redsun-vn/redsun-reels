---
phase: 2
title: "Khối dùng chung + 3 phong cách"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 2: Khối dùng chung + phong cách

## Goal
Thư viện dùng chung để template chỉ khai bố cục. Có 3 preset phong cách `toi-gian`, `khuyen-mai`, `vui-nhon`.

## Files to Create / Modify
- Create: `templates/_shared/scene-kit.js`: đọc variables (`props` dạng chuỗi JSON), dựng clip theo cảnh (nền, logo bug, chữ cảnh, dòng phụ, ảnh/clip asset, phone frame, callout, lower third, CTA outro), tính `data-start`/`data-duration` từ `durationSec`, đăng ký `window.__timelines`. Text đưa vào bằng `textContent`. Mọi khối là clip có timing.
- Create: `templates/_shared/kit.css`: style các khối, chỉ dùng biến `brand.css`.
- Create: `brand/styles/{toi-gian,khuyen-mai,vui-nhon}.json`: tham số chuyển động (enter/exit easing, thời lượng, stagger chữ, kiểu chuyển cảnh, độ nảy, overlay, mood nhạc).
- Create: `config/style-preset.schema.ts` + test.
- Đọc trước khi viết: `/hyperframes:hyperframes-animation` (motion, transitions), `/hyperframes:hyperframes-registry`. Block registry nào dùng thì ghi `docs/decisions.md`.

## Verification
- `lint` + `check` pass trên composition thử dùng kit với 3 preset.
- Snapshot 3 preset thấy khác nhau rõ về chuyển động/nhịp (contact sheet).
