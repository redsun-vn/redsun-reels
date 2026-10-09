/*
 * kit-blocks.js — khối riêng của từng template (REQUIREMENTS §7.1):
 * - BeforeAfter: nhãn TRƯỚC/SAU, màn hình chia đôi (split) có vạch chia chạy;
 * - Testimonial: dấu ngoặc kép lớn + lower third (tên khách, cửa hàng);
 * - Promo: badge, giá gạch ngang, hạn chót, đếm ngược;
 * - EventRecap: montage ảnh/clip cắt nhanh trong một cảnh;
 * - Stats: số đếm lên, thanh %, biểu đồ cột ngang.
 * Nội dung (giá, tên, quote, số liệu) do kịch bản đưa vào; validate đã kiểm các con số có trong brief.
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
      // Chữ trong thẻ riêng: hyperframes check đo nền theo khung chữ; khung vuông của vòng tròn lấn ra nền cảnh ở 4 góc
      K.el("span", "kit-badge-text", badge).textContent = pr.badge;
      // Vòng sáng lan ra một lần khi badge bật vào
      var ring = K.el("div", "kit-badge-ring", badge);
      ring.setAttribute("aria-hidden", "true");
      tl.fromTo(ring, { scale: 1, opacity: 0.9 }, { scale: 1.8, opacity: 0, duration: 0.9, ease: "power2.out" }, t + 0.3);
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

  /*
   * Montage (EventRecap): 2–6 ảnh/clip chia đều thời lượng cảnh, cắt gọn (không mờ chồng) — mỗi hình chỉ hiện
   * trong đoạn của nó và "đẩy" nhẹ (zoom 1.12 → 1) cho nhịp nhanh. Mỗi đoạn ≥ 0.6 giây (MONTAGE_MIN_SHOT_SEC
   * ở scripts/lib/fact-check.ts). Clip trong montage nằm ở root (xem kit-core videoClip); chỉ clip ở đoạn đầu
   * và đoạn cuối vào danh sách chuyển cảnh.
   */
  function montage(ctx, scene, sc, videos) {
    var srcs = sc.visual.srcs;
    var n = srcs.length;
    var each = sc.duration / n;
    var tl = ctx.tl;
    var wrap = K.el("div", "kit-montage", scene);
    srcs.forEach(function (src, j) {
      var start = sc.start + j * each;
      var last = j === n - 1;
      var m;
      if (K.VIDEO_RE.test(src)) {
        m = K.videoClip(ctx.root, scene, src, "kit-media-full", start, each + (last ? ctx.tail(sc) : 0), 6);
        if (j === 0 || last) videos.push(m);
      } else {
        m = K.image(wrap, src, "kit-media-full");
        // Ảnh chỉ hiện trong đoạn của nó, để clip ở đoạn khác (nằm dưới cảnh) không bị che
        if (j > 0) tl.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none" }, start);
        if (!last) tl.to(m, { opacity: 0, duration: 0.01, ease: "none" }, start + each);
      }
      tl.fromTo(m, { scale: 1.12 }, { scale: 1, duration: Math.min(each, 1.2), ease: "power2.out" }, start);
    });
    return wrap;
  }

  /*
   * Số liệu (Stats). Giá trị giữ đúng cách viết trong brief: "1.200+" đếm 0 → 1.200 rồi thêm "+";
   * "4,8" là số thập phân; "98%" có thêm thanh tiến độ. Tách giống config/stats-timing.ts `splitStatValue`.
   * Nhịp (vào 0.3 giây/chỉ số, đếm 1.2 giây) khớp config/stats-timing.ts — validate chặn cảnh quá ngắn.
   */
  function parseStat(value) {
    var m = /^(\D*)(\d[\d.,]*)(.*)$/.exec(String(value).trim());
    if (!m) return null;
    var num = m[2].replace(/[.,]$/, "");
    var suffix = m[2].slice(num.length) + m[3];
    var thou = /^\d{1,3}(([.,])\d{3})+$/.exec(num);
    if (thou) return { prefix: m[1], suffix: suffix, value: Number(num.split(thou[2]).join("")), dec: 0, decSep: "", thouSep: thou[2] };
    var d = /^(\d+)(?:([.,])(\d+))?$/.exec(num);
    if (!d) return null; // cách viết lạ (validate đã chặn): hiện nguyên chữ, không đếm
    return { prefix: m[1], suffix: suffix, value: parseFloat(d[1] + "." + (d[3] || "0")), dec: (d[3] || "").length, decSep: d[2] || "", thouSep: "" };
  }

  function formatStat(p, v) {
    var parts = v.toFixed(p.dec).split(".");
    var int = parts[0];
    if (p.thouSep) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, p.thouSep);
    return p.prefix + int + (p.dec ? p.decSep + parts[1] : "") + p.suffix;
  }

  /* Đếm số: tween một object, onUpdate ghi chữ — GSAP gọi onUpdate cả khi seek nên vẫn xác định theo khung. */
  function countUp(tl, node, p, at) {
    var o = { v: 0 };
    node.textContent = formatStat(p, 0);
    tl.fromTo(o, { v: 0 }, {
      v: p.value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: function () {
        node.textContent = formatStat(p, o.v);
      },
    }, at);
  }

  function stats(ctx, scene, sc, at) {
    var tl = ctx.tl;
    var list = sc.stats;
    var parsed = list.map(function (st) {
      return parseStat(st.value);
    });
    var bar = sc.chart === "bar";
    // Biểu đồ phần trăm so với 100%; đơn vị khác so với chỉ số lớn nhất
    var max = parsed[0] && /^%/.test(parsed[0].suffix) ? 100 : Math.max.apply(null, parsed.map(function (p) {
      return p ? p.value : 0;
    })) || 1;
    var box = K.el("div", "kit-stats" + (bar ? " chart" : "") + (list.length > 2 ? " three" : ""), scene);
    list.forEach(function (st, j) {
      var p = parsed[j];
      var t = at + j * 0.3;
      var row = K.el("div", "kit-stat", box);
      var num = K.el("div", "kit-stat-num" + (st.value.length > 7 ? " sm" : ""), row);
      var label = K.el("div", "kit-stat-label", row);
      label.textContent = st.label;
      tl.fromTo(row, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t);
      if (p) countUp(tl, num, p, t + 0.2);
      else num.textContent = st.value;
      var pct = p && /^%/.test(p.suffix) ? Math.min(p.value, 100) : null;
      if (bar || pct !== null) {
        var track = K.el("div", "kit-stat-track", row);
        var fill = K.el("div", "kit-stat-fill", track);
        var to = bar ? (p ? p.value / max : 0) : pct / 100;
        fill.style.transformOrigin = "0% 50%";
        tl.fromTo(fill, { scaleX: 0 }, { scaleX: to, duration: 1.2, ease: "power2.out" }, t + 0.2);
      }
    });
    return box;
  }

  window.RedsunKitBlocks = { beforeAfterTag: beforeAfterTag, split: split, quoteMark: quoteMark, lowerThird: lowerThird, promo: promo, montage: montage, stats: stats, parseStat: parseStat, formatStat: formatStat };
})();
