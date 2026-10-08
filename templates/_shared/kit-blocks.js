/*
 * kit-blocks.js — khối riêng của từng template (REQUIREMENTS §7.1):
 * - BeforeAfter: nhãn TRƯỚC/SAU, màn hình chia đôi (split) có vạch chia chạy;
 * - Testimonial: dấu ngoặc kép lớn + lower third (tên khách, cửa hàng);
 * - Promo: badge, giá gạch ngang, hạn chót, đếm ngược.
 * Nội dung (giá, tên, quote) do kịch bản đưa vào; validate đã kiểm các con số có trong brief.
 */
(function () {
  "use strict";

  var K = window.RedsunKitCore;

  /* Nhãn TRƯỚC / SAU cho BeforeAfter theo vai trò cảnh. */
  function beforeAfterTag(role) {
    if (role === "problem") return { text: "TRƯỚC", variant: "muted" };
    if (role === "solution") return { text: "SAU", variant: "" };
    return null;
  }

  /*
   * Split trước/sau: ảnh "trước" tràn khung, ảnh "sau" phủ lên và lộ dần tới nửa phải, vạch chia màu nhấn
   * chạy theo. Nhãn hai bên nằm trong safe zone.
   */
  function split(ctx, scene, sc, videos, at) {
    var v = sc.visual;
    var wrap = K.el("div", "kit-split", scene);
    K.media(ctx, wrap, scene, v.src, "kit-media-full kit-before", sc, videos);
    var afterBox = K.el("div", "kit-split-after", wrap);
    var after = K.media(ctx, afterBox, scene, v.srcAfter, "kit-media-full", sc, videos);
    // Lớp tối phía dưới (để chữ dễ đọc) nằm DƯỚI vạch chia và nhãn TRƯỚC/SAU
    K.el("div", "kit-dim soft", wrap);
    var divider = K.el("div", "kit-split-divider", wrap);
    var lb = K.el("div", "kit-tag muted kit-split-label left", wrap);
    lb.textContent = "TRƯỚC";
    var la = K.el("div", "kit-tag kit-split-label right", wrap);
    la.textContent = "SAU";
    var revealed = after.tagName === "VIDEO" ? [afterBox, after] : [afterBox];
    ctx.tl.fromTo(revealed, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 50%)", duration: 0.9, ease: "power2.inOut" }, at + 0.4);
    ctx.tl.fromTo(divider, { left: "100%" }, { left: "50%", duration: 0.9, ease: "power2.inOut" }, at + 0.4);
    ctx.tl.fromTo([lb, la], { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.15 }, at + 1.2);
  }

  /* Dấu ngoặc kép lớn trước câu quote (Testimonial). */
  function quoteMark(block) {
    var q = K.el("div", "kit-quote-mark", null);
    q.textContent = "“";
    block.insertBefore(q, block.firstChild);
    return q;
  }

  /* Lower third: vạch màu nhấn + tên khách / cửa hàng, trượt vào từ trái. */
  function lowerThird(ctx, block, text, at) {
    var lt = K.el("div", "kit-lower-third", block);
    K.el("span", "kit-lt-bar", lt);
    var name = K.el("span", "kit-lt-text", lt);
    name.textContent = text;
    ctx.tl.fromTo(lt, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, at);
    return lt;
  }

  /*
   * Khối khuyến mãi: badge (vd. "-30%"), giá cũ gạch ngang + giá mới, hạn chót, đếm ngược N → 1.
   * Nằm ở nửa dưới vùng an toàn, dưới khối chữ "top". Nhịp (0.35 / 0.6 / 0.35 / N / 0.35 giây) PHẢI khớp
   * config/promo-timing.ts — validate dùng nó để chặn cảnh quá ngắn.
   * Chữ dài thì nhỏ lại để vừa vòng badge / chiều ngang an toàn.
   */
  function promo(ctx, scene, sc, at, style) {
    var pr = sc.promo;
    var box = K.el("div", "kit-promo", scene);
    var tl = ctx.tl;
    var t = at;
    if (pr.badge) {
      var badge = K.el("div", "kit-badge" + (pr.badge.length > 8 ? " xs" : pr.badge.length > 5 ? " sm" : ""), box);
      badge.textContent = pr.badge;
      tl.fromTo(badge, { scale: 0, rotation: -40 }, { scale: 1.12, rotation: -8, duration: 0.4, ease: "back.out(2.4)" }, t);
      tl.to(badge, { scale: 1, duration: 0.2, ease: "sine.out" }, t + 0.4);
      if (style.ctaPulse) tl.fromTo(badge, { scale: 1 }, { scale: 1.08, duration: 0.3, ease: "sine.inOut", repeat: 3, yoyo: true }, t + 0.8);
      t += 0.35;
    }
    if (pr.priceOld || pr.priceNew) {
      var prices = K.el("div", "kit-prices", box);
      if (pr.priceOld) {
        var old = K.el("div", "kit-price-old", prices);
        K.el("span", "kit-price-old-text", old).textContent = pr.priceOld;
        var strike = K.el("span", "kit-strike", old);
        tl.fromTo(old, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
        tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t + 0.45);
        t += 0.6;
      }
      if (pr.priceNew) {
        var neu = K.el("div", "kit-price-new" + (pr.priceNew.length > 9 ? " sm" : ""), prices);
        neu.textContent = pr.priceNew;
        tl.fromTo(neu, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "expo.out" }, t);
        t += 0.35;
      }
    }
    if (pr.countdownFrom) {
      var cd = K.el("div", "kit-countdown", box);
      for (var n = pr.countdownFrom; n >= 1; n--) {
        var digit = K.el("span", "kit-count-digit", cd);
        digit.textContent = String(n);
        var on = t + (pr.countdownFrom - n);
        // Mỗi số hiện đúng 1 giây: bật vào rồi tắt hẳn (số cuối giữ tới hết cảnh)
        tl.fromTo(digit, { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.3, ease: "expo.out" }, on);
        if (n > 1) tl.to(digit, { opacity: 0, duration: 0.01, ease: "none" }, on + 1);
      }
      t += pr.countdownFrom;
    }
    if (pr.deadline) {
      var dl = K.el("div", "kit-deadline", box);
      dl.textContent = pr.deadline;
      tl.fromTo(dl, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t);
    }
    return box;
  }

  window.RedsunKitBlocks = { beforeAfterTag: beforeAfterTag, split: split, quoteMark: quoteMark, lowerThird: lowerThird, promo: promo };
})();
