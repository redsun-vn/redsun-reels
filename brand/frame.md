---
version: 1
name: Redsun Reels — Frame (video / frame layer)
description: >
  Design system khung hình cho video Reel/TikTok/Shorts của Redsun (SIPOS, Redsun BOS, Webino).
  Đơn vị là khung 1080×1920 (9:16). Màu lấy từ logo chính thức, font Montserrat duy nhất,
  logo dùng thẳng file có sẵn. Phong cách (brand/styles/) chỉ đổi chuyển động, chuyển cảnh,
  cách hiện chữ, lớp phủ và mood nhạc; không đổi các token ở đây.
unit: the frame — 1080×1920 (9:16) duy nhất
principle: token là bất biến · bố cục tự do trong safe zone · chữ là kênh chính (không lồng tiếng)

colors:
  # Redsun (công ty) — Redsun_logo.pdf
  redsun-red: "#BA0000"
  redsun-gold: "#EBAB32"
  redsun-gray: "#58595B"
  # SIPOS — Logo_green-01.png (bản chuẩn) + Sipos_logo.pdf
  sipos-teal: "#0B4B54"
  sipos-red: "#E30000"
  # Redsun BOS — Logo Redsun BOS-sáng/tối.png
  bos-red: "#D1262D"
  bos-plum: "#3D0023"
  bos-gold: "#EAAE2D"
  bos-blue: "#44649B"
  bos-ink: "#0C4559"
  # Webino — Logo.png
  webino-cyan: "#00B2DB"
  webino-purple: "#5B1A9A"
  # Trung tính
  white: "#FFFFFF"
  black: "#111111"

typography:
  hero:    { fontFamily: "Montserrat", px: 120, weight: 800, lineHeight: 1.1 }
  h1:      { fontFamily: "Montserrat", px: 96,  weight: 700, lineHeight: 1.1 }
  h2:      { fontFamily: "Montserrat", px: 72,  weight: 700, lineHeight: 1.15 }
  body:    { fontFamily: "Montserrat", px: 52,  weight: 500, lineHeight: 1.3 }
  caption: { fontFamily: "Montserrat", px: 44,  weight: 700, lineHeight: 1.3 }
  small:   { fontFamily: "Montserrat", px: 32,  weight: 500, lineHeight: 1.3 }
  quote:   { fontFamily: "Montserrat", px: 64,  weight: 500, italic: true, lineHeight: 1.25 }

spacing:
  safe-top: "220px"
  safe-bottom: "420px"
  safe-right: "160px"
  safe-left: "80px"
  gap-sm: "24px"
  gap-md: "40px"
  gap-lg: "64px"

components:
  logo-bug:
    asset: "brand/logos/<product>/ — file có sẵn, không vẽ lại, không chỉnh màu"
    placement: "góc trên trái, trong safe zone, cao 72–96px"
    description: "Hiện suốt video, tắt được bằng prop."
  hook-text:
    typography: "hero"
    rule: "≤ 40 ký tự mỗi dòng, tối đa 2 dòng, 0–3 giây đầu"
  scene-text:
    typography: "h1 hoặc h2 (chữ chính), body (dòng phụ)"
    rule: "≤ 10 từ, một ý mỗi cảnh, thời lượng theo config/scene-timing.ts"
  lower-third:
    typography: "small + caption"
    background: "{product.primary} hoặc {product.secondary}"
  cta-outro:
    typography: "h1 + logo chuẩn"
    duration: "2–3 giây cuối"
---

# Redsun Reels — Frame

## Overview
Video ngắn dọc cho 3 sản phẩm (SIPOS, Redsun BOS, Webino) và thương hiệu Redsun. **Không lồng tiếng**: thông điệp đi bằng chữ lớn, hình sản phẩm và nhạc nền. Mọi video theo khung Hook (0–3 giây) → Body → CTA + logo outro.

## The Frame
- Canvas 1080×1920, 30 fps. Chữ quan trọng luôn nằm trong safe zone (trên 220px, dưới 420px, phải 160px, trái 80px), vì UI của TikTok/Reels che các vùng này.
- Mỗi sản phẩm có bộ màu riêng (`[data-product]` trong `brand.css`). Nền thường là màu chính hoặc màu chữ logo; chữ trắng trên nền đậm.

## Typography
- **Chỉ Montserrat** (variable 100–900, có italic), file local ở `brand/fonts/`. Không thêm font thứ hai cho mọi phong cách, kể cả `thu-cong`.
- Hook dùng `hero` 800; chữ cảnh dùng `h1`/`h2` 700; dòng phụ dùng `body` 500. Chữ số viết bằng số (30%, 199.000đ).
- Viết hoa đúng tên sản phẩm: SIPOS, REDSUN BOS, Webino.

## Composition Rules
- Một ý mỗi cảnh. Không chồng quá 3 khối chữ trong một khung.
- Logo bug góc trên trái; logo chuẩn lớn ở CTA outro.
- Tương phản chữ/nền đạt WCAG AA (`hyperframes check`).
- Clip quay thật có người nói: lower third tên + cửa hàng, chữ nhấn ý chính, không che mặt.

## Do's
- Dùng biến trong `brand.css`, không hard-code hex hay px trong template.
- Dùng block trong catalog HyperFrames, style lại theo token này, ghi vào `docs/decisions.md`.
- Giữ màu sản phẩm làm điểm nhấn trong mọi phong cách, kể cả `bi-an`, `glitch-cyberpunk`.

## Don'ts
- Không gradient cầu vồng. Gradient chỉ xuất hiện bên trong file logo (Webino, Redsun BOS), không dùng gradient đó cho nền hay chữ.
- Không quá 2 font (thực tế: 1 font).
- Không chữ chạy chéo.
- Không vẽ lại hay đổi màu logo.
- Không nhấp nháy mạnh hơn 3 lần/giây (glitch, hành động).
- Không máu me, không hình ảnh gây sợ thật (phong cách `bi-an` là bí ẩn nhẹ).
