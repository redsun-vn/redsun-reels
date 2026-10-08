---
phase: 3
title: "Template FeatureLaunch + TipOfTheDay"
status: completed
priority: P1
effort: "5h"
dependencies: [2]
---

# Phase 3: Template

## Goal
2 template theo REQUIREMENTS §7.1, chạy bằng variables (phương án A), root không khai `data-duration`.

## Files to Create / Modify
- Create: `templates/FeatureLaunch/index.html` (*`template.schema.ts`/`fixture.props.json` thay bằng `config/script.schema.ts` dùng chung + brief mẫu trong `tests/fixtures/briefs/`, vì 2 template cùng một hợp đồng props*). Cảnh đặc thù: phone mockup chứa ảnh/clip quay màn hình, callout chỉ vào UI, zoom vùng quan trọng.
- Create: `templates/TipOfTheDay/index.html` (dùng chung hợp đồng props như trên). Cảnh đặc thù: số thứ tự mẹo, các bước 1-2-3.
- Create: `assets/_demo/sipos-kiem-kho.png` (ảnh UI mock dựng bằng HTML trong repo, chụp bằng chrome-headless-shell) cho fixture.

## Verification
- Mỗi template × 3 phong cách: `lint` + `check` pass, render draft ra MP4 đúng thời lượng fixture.
- Fixture chứa chuỗi §13 ở hook, chữ cảnh, dòng phụ (`tests/fixtures/briefs/dau-tieng-viet`). *Lower third thuộc Testimonial (M3).*
