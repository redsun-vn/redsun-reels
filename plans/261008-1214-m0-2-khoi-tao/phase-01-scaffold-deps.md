---
phase: 1
title: "Scaffold + dependency + TypeScript"
status: pending
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Scaffold + dependency

## Goal
Có cây thư mục §4 (phần M0.2) và dependency trong §3, pin exact version.

## Files to Create / Modify
- Modify: `package.json`: thêm devDeps `typescript`, `zod`, `vitest`, `@types/node`, `gsap`; scripts `doctor`, `preview`, `test`, `typecheck`.
- Create: `tsconfig.json` (strict, `noEmit`, `allowImportingTsExtensions`; chạy `.ts` bằng type stripping của Node ≥ 22.18).
- Create: thư mục `brand/{fonts,logos,music,styles}`, `config/`, `scripts/lib/`, `templates/_shared/`, `templates/_blank/`, `vendor/`, `assets/{sipos,bos,webino}`, `briefs/_example/`, `out/`.
- Modify: `.gitignore`.

## Tasks & Steps
- [ ] Kiểm Node 22.23.3 chạy được `.ts` bằng type stripping (tải tarball vào scratchpad, chạy file .ts mẫu).
- [ ] `corepack pnpm add -D` với version exact.
- [ ] Tạo thư mục + `.gitkeep` cho thư mục rỗng.

## Verification
- `corepack pnpm install --frozen-lockfile` sạch; `grep -E '"[\^~]' package.json` rỗng.
