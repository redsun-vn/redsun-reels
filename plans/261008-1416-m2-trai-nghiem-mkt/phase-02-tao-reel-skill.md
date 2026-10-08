---
phase: 2
title: "Lệnh info, post + skill tao-reel"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 2

## Files
- Create: `scripts/info.ts` (`./reel info [videoType]`): danh sách loại video / phong cách đã dựng được. Với một loại: template, khoảng thời lượng, thứ tự role, góc hook, phong cách mặc định / gợi ý / nên tránh, nhãn hook. `./reel info thoi-luong "<chữ>" ["<dòng phụ>"]` in thời lượng tối thiểu.
- Create: `scripts/post.ts` (`./reel post <slug>`): `briefs/<slug>/post.md` gồm caption (hook + các ý + CTA), hashtag mặc định của sản phẩm + gợi ý chủ đề, credit nhạc nếu cần.
- Create: `.claude/skills/tao-reel/SKILL.md` + `references/script-format.md` (hợp đồng script.json, ví dụ, cách tự chấm).
- Tests cho post.

## Verification
- `./reel info meo-hay`, `./reel post _example` chạy đúng; unit test pass.
