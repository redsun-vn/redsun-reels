/*
 * kit-motion.js — chuyển cảnh, lớp phủ (overlay) và nền theo preset phong cách.
 *
 * Quy tắc (hyperframes-animation + docs/video-style-catalog.md §5):
 * - cảnh cũ và cảnh mới chuyển động CÙNG LÚC tại mốc T; không animation thoát trừ cảnh cuối;
 * - mọi màu lấy từ biến brand (color-mix để pha trong suốt), không hex;
 * - nhấp nháy sáng tối đa 1 lần mỗi lần chuyển cảnh (≤ 3 lần/giây);
 * - hạt/confetti dùng hash theo chỉ số, không random.
 * Kỹ thuật lớp phủ tham chiếu "signature features" của github.com/vincentwei1021/mg-styles-15 (MIT):
 * HUD (góc khóa mục tiêu, radar), VHS (scanline, lệch màu), aurora (đốm màu mờ trôi chậm), line boil, giấy.
 */
(function () {
  "use strict";

  var K = window.RedsunKitCore;
  var W = K.W;
  var H = K.H;

  /* Lớp trang trí phủ lên chữ có chủ ý (gần trong suốt hoặc chỉ hiện chớp nhoáng khi chuyển cảnh): báo cho hyperframes check. */
  function decorative(e) {
    e.setAttribute("data-layout-allow-occlusion", "");
    e.setAttribute("data-layout-allow-overlap", "");
    e.setAttribute("aria-hidden", "true");
    return e;
  }

  /* Lớp phủ toàn khung dùng chung cho dip-black / flash-white: tạo một lần, tween opacity tại từng mốc. */
  function sharedLayer(ctx, cls, track) {
    ctx.layers = ctx.layers || {};
    if (!ctx.layers[cls]) ctx.layers[cls] = decorative(K.clip(K.el("div", "kit-layer " + cls, ctx.root), 0, ctx.total, track));
    return ctx.layers[cls];
  }

  function transition(ctx, outgoing, incoming, T, typeOverride) {
    var tl = ctx.tl;
    var tr = ctx.style.transition;
    var d = tr.duration;
    var type = typeOverride || tr.type;
    if (type === "text-swap") {
      // Đổi chữ trên cùng một đoạn clip (TalkingHead): chữ cũ tắt nhanh, chữ mới hiện theo hiệu ứng chữ của phong cách
      tl.to(outgoing, { opacity: 0, duration: Math.min(d, 0.25), ease: "sine.in" }, T);
    } else if (type === "wipe") {
      // Trước → sau: cảnh mới lộ dần từ trái sang phải, có vạch chia màu nhấn chạy theo
      var bar = decorative(K.clip(K.el("div", "kit-wipe-bar", ctx.root), T, 0.9, 16));
      tl.fromTo(incoming, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" }, T);
      tl.fromTo(bar, { x: 0 }, { x: W, duration: 0.8, ease: "power2.inOut" }, T);
    } else if (type === "zoom-through") {
      tl.to(outgoing, { scale: 2.2, opacity: 0, filter: "blur(8px)", duration: d, ease: "power3.in" }, T);
      tl.fromTo(incoming, { scale: 0.6, opacity: 0, filter: "blur(8px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "power3.out" }, T + d * 0.3);
    } else if (type === "elastic-push") {
      tl.to(outgoing, { x: -W, duration: d * 0.9, ease: "power3.in" }, T);
      tl.fromTo(incoming, { x: W, opacity: 1 }, { x: 30, opacity: 1, duration: d * 0.8, ease: tr.ease }, T + d * 0.1);
      tl.to(incoming, { x: -15, duration: d * 0.3, ease: "sine.inOut" }, T + d * 0.9);
      tl.to(incoming, { x: 0, duration: d * 0.2, ease: "sine.out" }, T + d * 1.2);
    } else if (type === "blur-crossfade") {
      tl.to(outgoing, { opacity: 0, filter: "blur(10px)", duration: d, ease: "sine.inOut" }, T);
      tl.fromTo(incoming, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: d, ease: "sine.inOut" }, T);
    } else if (type === "dip-black") {
      var dip = sharedLayer(ctx, "kit-dip", 12);
      tl.fromTo(dip, { opacity: 0 }, { opacity: 1, duration: d / 2, ease: "power2.in" }, T);
      tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none" }, T + d / 2);
      tl.to(outgoing, { opacity: 0, duration: 0.01, ease: "none" }, T + d / 2);
      tl.to(dip, { opacity: 0, duration: d / 2, ease: "power2.out" }, T + d / 2);
    } else if (type === "flash-white") {
      var flash = sharedLayer(ctx, "kit-flash", 13);
      tl.fromTo(flash, { opacity: 0 }, { opacity: 0.85, duration: 0.08, ease: "none" }, T);
      tl.fromTo(incoming, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: d, ease: tr.ease }, T + 0.08);
      tl.to(outgoing, { opacity: 0, duration: 0.01, ease: "none" }, T + 0.08);
      tl.to(flash, { opacity: 0, duration: d, ease: "power2.out" }, T + 0.08);
    } else if (type === "whip") {
      tl.to(outgoing, { x: -W * 1.1, filter: "blur(24px)", duration: d, ease: "power4.in" }, T);
      tl.fromTo(incoming, { x: W * 1.1, filter: "blur(24px)", opacity: 1 }, { x: 0, filter: "blur(0px)", opacity: 1, duration: d, ease: tr.ease }, T + d * 0.4);
    } else if (type === "glitch-cut") {
      // Nhảy vị trí theo bậc (không chớp sáng): cảnh mới giật vào 4 nấc, cảnh cũ tắt 2 nấc
      tl.to(outgoing, { opacity: 0, x: -30, duration: d * 0.5, ease: "steps(2)" }, T);
      tl.fromTo(incoming, { opacity: 1, x: 70, skewX: 14 }, { x: 0, skewX: 0, duration: d, ease: "steps(4)" }, T);
    } else {
      tl.to(outgoing, { y: -H, duration: d, ease: tr.ease }, T);
      tl.fromTo(incoming, { y: H, opacity: 1 }, { y: 0, opacity: 1, duration: d, ease: tr.ease }, T);
    }
  }

  /*
   * Video đi kèm cảnh (con của root nên không tự đi theo cảnh): lặp lại đúng chuyển động của cảnh cho cùng
   * kiểu chuyển cảnh. Video trong khung phone không nhận tween vào ở đây (khung phone đã có tween vào riêng),
   * để không có hai tween cùng thuộc tính chồng thời gian.
   */
  function transitionVideos(ctx, outV, inV, T, typeOverride) {
    var tl = ctx.tl;
    var tr = ctx.style.transition;
    var d = tr.duration;
    var type = typeOverride || tr.type;
    inV = inV.filter(function (v) {
      return !v.dataset.phone;
    });
    if (type === "wipe") {
      if (inV.length) tl.fromTo(inV, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut" }, T);
    } else if (type === "vertical-push") {
      if (outV.length) tl.to(outV, { y: "-=" + H, duration: d, ease: tr.ease }, T);
      if (inV.length) tl.fromTo(inV, { y: H }, { y: 0, duration: d, ease: tr.ease }, T);
    } else if (type === "elastic-push") {
      if (outV.length) tl.to(outV, { x: -W, duration: d * 0.9, ease: "power3.in" }, T);
      if (inV.length) tl.fromTo(inV, { x: W }, { x: 0, duration: d * 1.1, ease: tr.ease }, T + d * 0.1);
    } else if (type === "whip") {
      if (outV.length) tl.to(outV, { x: -W * 1.1, filter: "blur(24px)", duration: d, ease: "power4.in" }, T);
      if (inV.length) tl.fromTo(inV, { x: W * 1.1, filter: "blur(24px)" }, { x: 0, filter: "blur(0px)", duration: d, ease: tr.ease }, T + d * 0.4);
    } else if (type === "glitch-cut") {
      if (outV.length) tl.to(outV, { opacity: 0, x: -30, duration: d * 0.5, ease: "steps(2)" }, T);
      if (inV.length) tl.fromTo(inV, { x: 70, skewX: 14 }, { x: 0, skewX: 0, duration: d, ease: "steps(4)" }, T);
    } else if (type === "dip-black" || type === "flash-white") {
      // Đổi hình tức thì dưới lớp đen/trắng, cùng thời điểm với cảnh
      var cut = type === "dip-black" ? T + d / 2 : T + 0.08;
      if (outV.length) tl.to(outV, { opacity: 0, duration: 0.01, ease: "none" }, cut);
      if (inV.length) tl.fromTo(inV, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none" }, cut);
    } else {
      if (outV.length) tl.to(outV, { opacity: 0, duration: d, ease: "sine.inOut" }, T);
      if (inV.length) tl.fromTo(inV, { opacity: 0 }, { opacity: 1, duration: d, ease: "sine.inOut" }, T + d * 0.3);
    }
  }

  /* Nền: phẳng, gradient 2 sắc cùng họ màu brand, hoặc aurora (đốm màu brand mờ, trôi chậm). */
  function background(ctx, bgEl) {
    var bg = ctx.style.background;
    if (bg === "gradient") bgEl.classList.add("bg-gradient");
    if (bg !== "aurora") return;
    bgEl.classList.add("bg-gradient");
    var layer = decorative(K.clip(K.el("div", "kit-aurora", ctx.root), 0, ctx.total, 10));
    ["a", "b", "c"].forEach(function (k, i) {
      var blob = K.el("div", "kit-aurora-blob blob-" + k, layer);
      // Trôi chậm theo đường cong, mỗi đốm một pha (aurora: 20–40 giây một vòng, ở đây chỉ chạy một phần vòng)
      ctx.tl.fromTo(blob, { x: -120 + i * 90, y: 60 - i * 80 }, { x: 160 - i * 70, y: -140 + i * 110, duration: ctx.total, ease: "sine.inOut" }, 0);
    });
    ctx.root.insertBefore(layer, bgEl.nextSibling);
  }

  /* Lớp phủ: một lớp mỗi video (catalog §1: 1 style chính + tối đa 1 lớp phủ). */
  function overlay(ctx) {
    var name = ctx.style.overlay;
    if (!name || name === "none") return;
    var t = ctx.tl;
    var total = ctx.total;
    var under = name === "paper" || name === "grid";
    var o = decorative(K.clip(K.el("div", "kit-overlay ov-" + name + (under ? " under" : ""), ctx.root), 0, total, under ? 17 : 11));
    if (under) ctx.root.insertBefore(o, ctx.bgEl.nextSibling);

    if (name === "grain" || name === "vhs" || name === "paper") {
      // Hạt nhiễu SVG (feTurbulence, seed cố định), dịch theo bậc ~12 lần/giây cho cảm giác phim
      var g = K.el("div", "kit-grain", o);
      t.fromTo(g, { x: 0, y: 0 }, { x: -60, y: 40, duration: total, ease: "steps(" + Math.max(1, Math.round(total * 12)) + ")" }, 0);
    }
    if (name === "light-leak") {
      var leak = K.el("div", "kit-leak", o);
      t.fromTo(leak, { x: -200, y: -100, opacity: 0.6 }, { x: 220, y: 160, opacity: 1, duration: total, ease: "sine.inOut" }, 0);
    }
    if (name === "grid") {
      t.fromTo(o, { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px " + Math.round(total * 12) + "px", duration: total, ease: "none" }, 0);
    }
    if (name === "scanlines" || name === "vhs") {
      var band = K.el("div", "kit-scan-band", o);
      // Số vòng làm tròn xuống để timeline không dài hơn video
      t.fromTo(band, { y: -200 }, { y: H + 200, duration: 2.4, ease: "none", repeat: Math.max(0, Math.floor(total / 2.4) - 1) }, 0);
    }
    if (name === "vhs") {
      var rec = K.el("div", "kit-rec", o);
      K.el("span", "kit-rec-dot", rec);
      K.el("span", "kit-rec-text", rec).textContent = "REC";
      // Chấm đỏ nháy 1 lần/giây (≤ 3 lần/giây)
      t.fromTo(rec.firstChild, { opacity: 1 }, { opacity: 0.15, duration: 0.5, ease: "steps(1)", repeat: Math.max(0, Math.floor(total * 2) - 1), yoyo: true }, 0);
    }
    if (name === "hud") {
      // Khung khóa mục tiêu: 4 góc thu từ 1.4 về 1.0; radar quét xoay chậm
      var frame = K.el("div", "kit-hud-frame", o);
      ["tl", "tr", "bl", "br"].forEach(function (c) {
        K.el("span", "kit-hud-corner " + c, frame);
      });
      t.fromTo(frame, { scale: 1.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out" }, 0.1);
      var radar = K.el("div", "kit-hud-radar", o);
      t.fromTo(radar, { rotation: 0 }, { rotation: 360 * Math.max(1, Math.round(total / 4)), duration: total, ease: "none" }, 0);
    }
    if (name === "letterbox") {
      var top = K.el("div", "kit-bar top", o);
      var bottom = K.el("div", "kit-bar bottom", o);
      t.fromTo(top, { yPercent: -100 }, { yPercent: 0, duration: 0.8, ease: "power2.out" }, 0);
      t.fromTo(bottom, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power2.out" }, 0);
    }
    if (name === "confetti") confetti(ctx, o);
  }

  /* Confetti chỉ ở cảnh CTA (khoảnh khắc ăn mừng), vị trí/màu theo hash chỉ số. */
  function confetti(ctx, o) {
    var start = ctx.ctaStart < ctx.total ? ctx.ctaStart : Math.max(0, ctx.total - 3);
    var colors = ["c-accent", "c-primary", "c-text"];
    for (var i = 0; i < 36; i++) {
      var p = decorative(K.el("span", "kit-confetti " + colors[i % 3], o));
      var x = Math.round(K.hash01(i) * W);
      var delay = K.hash01(i + 50) * 0.6;
      // Không rơi quá hết video (timeline không dài hơn tổng thời lượng)
      var fall = Math.min(1.8 + K.hash01(i + 100) * 1.2, ctx.total - start - delay - 0.05);
      if (fall <= 0.2) continue;
      ctx.tl.fromTo(
        p,
        { x: x, y: -80, rotation: 0, opacity: 1 },
        { x: x + (K.hash01(i + 150) - 0.5) * 260, y: H + 80, rotation: 360 + K.hash01(i + 200) * 540, duration: fall, ease: "power1.in" },
        start + delay,
      );
    }
  }

  window.RedsunKitMotion = { transition: transition, transitionVideos: transitionVideos, background: background, overlay: overlay };
})();
