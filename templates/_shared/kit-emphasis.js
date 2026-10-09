/*
 * kit-emphasis.js — chữ nhấn và chiều sâu cho reel (Nam 2026-10-09: "text chưa phân biệt rõ bằng màu sắc, không rõ
 * thông tin nào cần nhấn mạnh, thiếu animation… video quá nhàm chán").
 * Theo blueprint kinetic-type-beats + css-marker-patterns của /hyperframes:hyperframes-animation:
 * - kịch bản đánh dấu cụm cần nhấn bằng [ngoặc vuông]; không đánh dấu thì tự nhấn số, %, tên sản phẩm;
 * - cụm nhấn đậm và to hơn, rồi có MỘT nhịp nhấn riêng sau khi chữ hiện (bút dạ quét / gạch chân vẽ / dập nảy
 *   theo preset `accent`), sau đó "thở" nhẹ tới hết cảnh để mắt dừng ở đó;
 * - nền có chiều sâu: chữ rỗng khổ lớn trôi chậm sau chữ chính, đốm sáng màu brand/dịp lễ trôi lơ lửng.
 * Mọi chuyển động xác định (hash01, không random), màu qua biến brand.
 */
(function () {
  "use strict";

  var K = window.RedsunKitCore;
  var MARK_RE = /\[[^\]]+\]/;

  /* Bỏ dấu [ ] (dùng khi ước lượng cỡ chữ, chữ rỗng phía sau). */
  function plain(text) {
    return String(text).replace(/[[\]]/g, "");
  }

  /* Cụm nhấn dài hơn mức này thì mỗi từ một nhóm (để xuống dòng được, không tràn mép). */
  var GROUP_MAX_CHARS = 16;
  var PUNCT_RE = /^[?!.,:;…]+/;

  /*
   * Tách chữ thành từng từ (để chạy hiệu ứng vào) và các nhóm nhấn (.kit-accent, inline-block để khối màu/gạch chân
   * phủ trọn cụm). Dấu câu ngay sau cụm nhấn dính vào cụm (không rơi xuống dòng riêng). Trả { spans, groups }.
   */
  function words(container, text) {
    var spans = [];
    var groups = [];
    var t = String(text);
    var marked = MARK_RE.test(t);
    var parts = marked ? t.split(/(\[[^\]]+\])/) : [t];
    var add = function (parent, w, last) {
      var s = K.el("span", "kit-word", parent);
      s.textContent = w + (last ? "" : " ");
      spans.push(s);
      return s;
    };
    var group = function () {
      var g = K.el("span", "kit-accent", container);
      groups.push(g);
      return g;
    };
    for (var pi = 0; pi < parts.length; pi++) {
      var part = parts[pi];
      var key = marked && part.charAt(0) === "[";
      var body = key ? part.slice(1, -1) : part;
      if (key && pi + 1 < parts.length) {
        var p = PUNCT_RE.exec(parts[pi + 1]);
        if (p) {
          body += p[0];
          parts[pi + 1] = parts[pi + 1].slice(p[0].length);
        }
      }
      var ws = body.split(/\s+/).filter(Boolean);
      var lastPart = pi === parts.length - 1 || parts.slice(pi + 1).join("").trim() === "";
      if (!ws.length) continue;
      if (key) {
        if (body.length > GROUP_MAX_CHARS) {
          ws.forEach(function (w, i) {
            add(group(), w, true);
            if (!(lastPart && i === ws.length - 1)) container.appendChild(document.createTextNode(" "));
          });
        } else {
          var g = group();
          ws.forEach(function (w, i) {
            add(g, w, i === ws.length - 1);
          });
          if (!lastPart) container.appendChild(document.createTextNode(" "));
        }
        continue;
      }
      ws.forEach(function (w, i) {
        var last = lastPart && i === ws.length - 1;
        if (!marked && K.ACCENT_RE.test(w)) {
          add(group(), w, true);
          if (!last) container.appendChild(document.createTextNode(" "));
        } else add(container, w, last);
      });
    }
    return { spans: spans, groups: groups };
  }

  function cssVar(root, name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  /* Kiểu nhấn mặc định theo preset accent của phong cách. */
  var DEFAULT_EMPHASIS = { block: "marker", underline: "underline", scribble: "scribble", sticker: "punch" };

  /*
   * Nhịp nhấn cho từng nhóm, bắt đầu ở `at` (khi chữ đã hiện), mỗi nhóm trễ 0.2 giây; "thở" tới `until`.
   * `mode` (motion.emphasis của cảnh, skill dao-dien-chuyen-dong chọn theo nghĩa):
   * marker = bút dạ quét · underline / scribble = gạch chân vẽ ra · circle = khoanh tròn như bút đỏ ·
   * strike = gạch xoá (nỗi đau, cách cũ) · punch = dập nảy · glow = sáng rực.
   */
  function emphasize(ctx, groups, at, until, mode) {
    var tl = ctx.tl;
    mode = mode || DEFAULT_EMPHASIS[ctx.style.accent] || "underline";
    var onAccent = cssVar(ctx.root, "--color-on-accent");
    groups.forEach(function (g, j) {
      var from = getComputedStyle(g).color; // màu chữ nhấn đã tính (--color-accent-text)
      var t0 = at + j * 0.2;
      if (mode === "marker") {
        var m = K.el("span", "kit-mark", null);
        g.insertBefore(m, g.firstChild);
        g.classList.add("has-mark"); // khối màu nằm trong phần đệm của cụm, không lấn chữ bên cạnh
        tl.fromTo(m, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.out" }, t0);
        tl.fromTo(g, { color: from }, { color: onAccent, duration: 0.15, ease: "none" }, t0 + 0.12);
      } else if (mode === "underline" || mode === "scribble") {
        var l = K.el("span", "kit-line" + (mode === "scribble" ? " wavy" : ""), g);
        tl.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.out" }, t0);
      } else if (mode === "strike") {
        var st = K.el("span", "kit-strike-line", g);
        // Gạch xoá đè lên chữ là cố ý (thuộc tính phải nằm trên chính phần tử chữ)
        Array.prototype.forEach.call(g.querySelectorAll(".kit-word"), function (w) {
          w.setAttribute("data-layout-allow-occlusion", "");
        });
        tl.fromTo(st, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t0 + 0.1);
        tl.to(g, { opacity: 0.75, duration: 0.3, ease: "none" }, t0 + 0.4);
      } else if (mode === "circle") {
        var c = K.el("span", "kit-circle", g);
        // Vẽ vòng như nét bút: lộ dần theo góc (conic mask) + nảy nhẹ
        tl.fromTo(c, { "--draw": "0deg", scale: 0.9, opacity: 1 }, { "--draw": "360deg", scale: 1, duration: 0.5, ease: "power2.out" }, t0);
      } else if (mode === "glow") {
        tl.fromTo(g, { textShadow: "0 0 0px " + from }, { textShadow: "0 0 28px " + from, duration: 0.4, ease: "sine.out", yoyo: true, repeat: 1 }, t0);
      }
      // Một nhịp nảy cho mọi kiểu (punch mạnh hơn, xoay nhẹ)
      var punch = mode === "punch";
      tl.fromTo(g, { scale: 1, rotation: 0 }, { scale: punch ? 1.28 : 1.1, rotation: punch ? -5 : 0, duration: 0.18, ease: "power2.out" }, t0);
      tl.to(g, { scale: 1, rotation: punch ? -2 : 0, duration: 0.32, ease: "back.out(3)" }, t0 + 0.18);
      if (mode === "strike") return; // cụm bị gạch xoá thì đứng yên, không "thở"
      var breathe = t0 + 0.7;
      var half = 0.6;
      var n = Math.floor((until - breathe) / (half * 2));
      if (n >= 1) tl.fromTo(g, { scale: 1 }, { scale: 1.05, duration: half, ease: "sine.inOut", repeat: n * 2 - 1, yoyo: true }, breathe);
    });
  }

  /*
   * Hoạt cảnh trang trí bung ra từ một điểm (motion.decor): tim / hoa (dịp phụ nữ, Valentine), lấp lánh, pháo giấy,
   * đồng xu (giá, ưu đãi, doanh thu), dấu tick (đã xong, gọn), ngôi sao (đánh giá). Hình vẽ bằng clip-path, không phải
   * ký tự (check không coi là chữ). Xác định theo chỉ số (hash01).
   */
  var DECOR_COUNT = 12;
  function decor(ctx, scene, kind, at, life, originX, originY) {
    if (!kind || kind === "none") return;
    var layer = K.el("div", "kit-decor", scene);
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-layout-allow-occlusion", "");
    layer.setAttribute("data-layout-allow-overlap", "");
    var ox = originX == null ? 50 : originX;
    var oy = originY == null ? 55 : originY;
    for (var i = 0; i < DECOR_COUNT; i++) {
      var p = K.el("div", "kit-decor-p " + kind + (i % 3 === 0 ? " alt" : ""), layer);
      p.style.left = ox + "%";
      p.style.top = oy + "%";
      var ang = (i / DECOR_COUNT) * Math.PI * 2 + K.hash01(i + 5) * 0.5;
      var dist = 260 + K.hash01(i + 17) * 300;
      var dx = Math.cos(ang) * dist;
      var dy = Math.sin(ang) * dist * 0.8 + (kind === "confetti" || kind === "coins" ? 220 : -80); // pháo giấy, xu rơi xuống
      var t = at + K.hash01(i + 31) * 0.15;
      var size = 0.7 + K.hash01(i + 43) * 0.7;
      ctx.tl.fromTo(
        p,
        { x: 0, y: 0, scale: 0, rotation: 0, opacity: 1 },
        { x: dx, y: dy, scale: size, rotation: (K.hash01(i + 59) - 0.5) * 540, duration: 1.1, ease: "power3.out" },
        t,
      );
      ctx.tl.to(p, { opacity: 0, duration: 0.5, ease: "sine.in" }, t + Math.max(0.9, life - 0.5));
    }
  }

  /* Chữ rỗng khổ lớn trôi chậm sau chữ chính (trang trí, viền mờ, ruột trong suốt). */
  function ghost(ctx, scene, text, start, duration) {
    var word = plain(text).split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
    if (!word) return;
    var g = K.el("div", "kit-ghost", scene);
    // Vẽ bằng ::before (content: attr) — trang trí, không phải chữ cần đọc: check bỏ qua pseudo-element
    g.setAttribute("data-text", word);
    g.setAttribute("aria-hidden", "true");
    g.setAttribute("data-layout-allow-occlusion", "");
    g.setAttribute("data-layout-allow-overflow", "");
    // Chỗ đặt và hướng trôi theo hạt giống của video + cảnh
    var k = Math.round(start * 10);
    g.style.top = Math.round(18 + K.hash01(k + 701) * 55) + "%";
    var dir = K.hash01(k + 702) < 0.5 ? 1 : -1;
    ctx.tl.fromTo(g, { x: 60 * dir, opacity: 0 }, { x: -60 * dir, opacity: 1, duration: duration, ease: "none" }, start);
  }

  /*
   * Đốm sáng lơ lửng suốt video (lớp trang trí, track 18): tròn đặc / vòng, màu nhấn hoặc màu dịp lễ.
   * Vị trí, cỡ, nhịp trôi lấy từ hash01 theo chỉ số → mọi lần render như nhau.
   */
  function motes(ctx) {
    var layer = K.clip(K.el("div", "kit-motes", ctx.root), 0, ctx.total, 18);
    layer.setAttribute("aria-hidden", "true");
    layer.setAttribute("data-layout-allow-occlusion", "");
    layer.setAttribute("data-layout-allow-overlap", "");
    var count = 9;
    for (var i = 0; i < count; i++) {
      var d = K.el("div", "kit-mote" + (i % 3 === 0 ? " ring" : "") + (i % 2 ? " theme" : ""), layer);
      var size = 14 + Math.round(K.hash01(i + 3) * 30);
      d.style.width = d.style.height = size + "px";
      d.style.left = Math.round(K.hash01(i + 11) * 92) + "%";
      d.style.top = Math.round(8 + K.hash01(i + 29) * 84) + "%";
      var period = 2.4 + K.hash01(i + 41) * 2.2;
      var reps = Math.max(1, Math.floor(ctx.total / period));
      ctx.tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "sine.out" }, 0.2 + i * 0.12);
      ctx.tl.fromTo(d, { y: 0, x: 0 }, { y: -30 - K.hash01(i + 53) * 40, x: (K.hash01(i + 67) - 0.5) * 40, duration: period, ease: "sine.inOut", repeat: reps - 1, yoyo: true }, 0);
    }
  }

  window.RedsunKitEmphasis = { words: words, plain: plain, emphasize: emphasize, decor: decor, ghost: ghost, motes: motes };
})();
