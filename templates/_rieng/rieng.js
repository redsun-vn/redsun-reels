/*
 * RS — hàm dùng chung cho video dựng riêng. Không tạo chữ hiển thị mới: chữ trên màn hình viết tĩnh trong HTML
 * (bộ kiểm chống bịa đọc HTML). Mọi hàm nhận timeline `tl` và vị trí giây `at`, không dùng đồng hồ thật,
 * ngẫu nhiên có hạt giống → render lại ra đúng khung cũ.
 */
(function () {
  var RS = {};

  /** Số giả ngẫu nhiên có hạt giống (0..1). */
  RS.rng = function (seed) {
    var s = Math.abs(Math.floor(seed)) % 2147483647 || 1;
    return function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
  };

  /**
   * Chờ font nạp xong (đo chữ cho đúng) rồi gọi build(tl). Composition tự ghi `window.__timelines["main"] = tl;`
   * ở cuối build (hyperframes lint cần thấy dòng này trong file).
   */
  RS.ready = function (build) {
    var tl = gsap.timeline({ paused: true });
    document.fonts.load("900 100px Montserrat").then(function () { return document.fonts.ready; }).then(function () { build(tl); });
  };

  /** Phóng cỡ chữ cho dòng chữ vừa `width` px (tối đa `max`, tối thiểu `min`). Phần tử nên có white-space: nowrap. */
  RS.fit = function (el, width, max, min) {
    var prev = el.style.display;
    el.style.display = "inline-block";
    el.style.fontSize = "100px";
    var w = el.getBoundingClientRect().width || 1;
    el.style.fontSize = Math.max(min || 40, Math.min(max || 300, Math.floor((width / w) * 100))) + "px";
    el.style.display = prev;
  };

  /** Tách chữ của phần tử thành từng từ (span.rs-w) để stagger; giữ nguyên nội dung. Trả về danh sách span. */
  RS.words = function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map(function (w, i) {
      var s = document.createElement("span");
      s.className = "rs-w";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
  };

  /** Tách từng ký tự (đánh máy). Trả về danh sách span. */
  RS.chars = function (el) {
    var text = el.textContent;
    el.textContent = "";
    return Array.from(text).map(function (c) {
      var s = document.createElement("span");
      s.textContent = c;
      el.appendChild(s);
      return s;
    });
  };

  /** Đánh máy: hiện từng ký tự với tốc độ `cps` ký tự/giây. */
  RS.typeOn = function (tl, el, at, cps) {
    var cs = RS.chars(el);
    cs.forEach(function (c, i) { tl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.01, immediateRender: true }, at + i / (cps || 22)); });
    return at + cs.length / (cps || 22);
  };

  /** Vẽ nét SVG (path/line/circle) từ 0 đến đủ. */
  RS.draw = function (tl, path, at, dur, ease) {
    var len = path.getTotalLength();
    tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur || 0.4, ease: ease || "power2.out" }, at);
  };

  /**
   * Đếm số: chữ tĩnh trong HTML là giá trị cuối (để kiểm chống bịa đọc được), hàm đếm từ `from` lên giá trị đó.
   * Hỗ trợ dấu chấm nghìn kiểu Việt: "1.350" → 1350.
   */
  RS.countUp = function (tl, el, at, dur, from) {
    var final = el.textContent;
    var m = final.match(/[\d.]+/);
    if (!m) return;
    var to = Number(m[0].replace(/\./g, ""));
    var o = { v: from || 0 };
    var fmt = function (n) { return final.replace(m[0], Math.round(n).toLocaleString("vi-VN")); };
    tl.fromTo(o, { v: from || 0 }, { v: to, duration: dur || 0.8, ease: "power2.out", onUpdate: function () { el.textContent = fmt(o.v); } }, at);
    tl.set(el, { textContent: final }, at + (dur || 0.8));
  };

  /**
   * Bung hạt trang trí từ một điểm: kind = petal | confetti | coin | heart | star.
   * opts: { x, y, count, spread, rise, at, dur, seed }
   */
  RS.burst = function (tl, parent, kind, opts) {
    var r = RS.rng(opts.seed || 7);
    var n = opts.count || 14;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("div");
      p.className = "rs-p " + kind;
      p.style.left = opts.x - 22 + "px";
      p.style.top = opts.y - 22 + "px";
      parent.appendChild(p);
      var a = (i / n) * Math.PI * 2 + r() * 0.4;
      var d = (opts.spread || 360) * (0.7 + r() * 0.6);
      tl.fromTo(p, { x: 0, y: 0, scale: 0.3, rotation: 0, opacity: 1 },
        { x: Math.cos(a) * d, y: Math.sin(a) * d + (opts.rise == null ? 140 : opts.rise), scale: 0.6 + r() * 0.7, rotation: 160 + r() * 260, opacity: 0, duration: opts.dur || 1.2, ease: "power2.out" }, opts.at);
    }
  };

  /** Hạt trôi chậm suốt cảnh (bụi sáng, cánh hoa). opts: { count, box: [x, y, w, h], at, dur, drift, seed, opacity } */
  RS.drift = function (tl, parent, kind, opts) {
    var r = RS.rng(opts.seed || 11);
    var b = opts.box || [80, 240, 860, 1300];
    for (var i = 0; i < (opts.count || 10); i++) {
      var p = document.createElement("div");
      p.className = "rs-p " + kind;
      p.style.left = Math.round(b[0] + r() * b[2]) + "px";
      p.style.top = Math.round(b[1] + r() * b[3]) + "px";
      p.style.opacity = ((opts.opacity || 0.6) * (0.5 + r() * 0.5)).toFixed(2);
      p.style.transform = "scale(" + (0.4 + r() * 0.5).toFixed(2) + ")";
      parent.appendChild(p);
      tl.fromTo(p, { y: 0, rotation: 0 }, { y: -(opts.drift || 160) * (0.6 + r() * 0.8), rotation: 90 + r() * 180, duration: opts.dur || 3, ease: "none" }, opts.at || 0);
    }
  };

  /** Hoa nở tại các điểm [[x, y, scale], …]. */
  RS.flowers = function (tl, parent, spots, at) {
    spots.forEach(function (s, i) {
      var f = document.createElement("div");
      f.className = "rs-flower";
      f.style.left = s[0] + "px";
      f.style.top = s[1] + "px";
      for (var k = 0; k < 5; k++) { var p = document.createElement("i"); p.style.transform = "rotate(" + k * 72 + "deg)"; f.appendChild(p); }
      f.appendChild(document.createElement("u"));
      parent.appendChild(f);
      tl.fromTo(f, { scale: 0, rotation: -90 }, { scale: s[2] || 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)" }, at + i * 0.07);
      tl.to(f, { rotation: 18, duration: 2, ease: "sine.inOut" }, at + 0.6 + i * 0.07);
    });
  };

  /** Rung (va chạm, bất ngờ): `times` lần, biên độ `amp` px. */
  RS.shake = function (tl, el, at, amp, times) {
    tl.fromTo(el, { x: 0 }, { x: amp || 14, duration: 0.05, repeat: (times || 3) * 2 - 1, yoyo: true, ease: "none", immediateRender: false }, at);
    tl.set(el, { x: 0 }, at + 0.05 * (times || 3) * 2);
  };

  /** Chớp trắng ngắn ở điểm cắt cảnh. */
  RS.flash = function (tl, el, at, peak) {
    tl.fromTo(el, { opacity: peak || 0.6 }, { opacity: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, at);
  };

  /**
   * Nhân vật phẳng (SVG) — người thật được ưu tiên (hình MKT gửi trong hinh/); nhân vật này dùng khi chưa có hình.
   * kind: "bust" (nửa người, nhìn thẳng). opts: { shirt: "a"|"b"|"c", hair: "long"|"short"|"bun", phone: true, phoneOk: true (dấu tick xanh trên màn hình) }.
   * Đổi nét mặt bằng RS.mood(el, "binh-thuong"|"nhiu-may"|"sung-sot"|"nhe-nhom"|"cuoi").
   */
  RS.person = function (opts) {
    opts = opts || {};
    var shirt = "shirt-" + (opts.shirt || "a");
    var hairBack = {
      long: '<path class="hair" d="M120 150 C 110 60, 290 60, 280 150 L 292 330 C 250 350, 150 350, 108 330 Z"/>',
      bun: '<circle class="hair" cx="200" cy="58" r="40"/><path class="hair" d="M118 160 C 110 70, 290 70, 282 160 Z"/>',
      short: '<path class="hair" d="M118 170 C 104 70, 296 70, 282 170 Z"/>',
    }[opts.hair || "short"];
    var fringe = '<path class="hair" d="M128 150 C 150 96, 250 92, 274 150 C 240 128, 170 126, 128 150 Z"/>';
    var face =
      '<g class="mood binh-thuong"><path class="ink-line" d="M175 205 h12 M213 205 h12"/><path class="ink-line" d="M180 252 q20 12 40 0"/></g>' +
      '<g class="mood nhiu-may" style="display:none"><path class="ink-line" d="M168 186 l22 8 M232 186 l-22 8"/><circle class="ink" cx="182" cy="210" r="7"/><circle class="ink" cx="218" cy="210" r="7"/><path class="ink-line" d="M182 262 q18 -12 36 0"/></g>' +
      '<g class="mood sung-sot" style="display:none"><path class="ink-line" d="M166 178 q14 -10 28 0 M206 178 q14 -10 28 0"/><circle class="ink" cx="182" cy="206" r="9"/><circle class="ink" cx="218" cy="206" r="9"/><ellipse class="ink" cx="200" cy="258" rx="14" ry="18"/></g>' +
      '<g class="mood nhe-nhom" style="display:none"><path class="ink-line" d="M170 208 q12 -10 24 0 M206 208 q12 -10 24 0"/><path class="ink-line" d="M178 248 q22 20 44 0"/></g>' +
      '<g class="mood cuoi" style="display:none"><circle class="ink" cx="182" cy="205" r="7"/><circle class="ink" cx="218" cy="205" r="7"/><path class="ink" d="M174 240 q26 34 52 0 Z"/></g>';
    var phone = opts.phone
      ? '<g class="arm-phone"><path class="' + shirt + '" d="M300 470 C 340 420, 350 330, 330 280 L 296 290 C 300 350, 290 410, 262 450 Z"/><circle class="skin" cx="318" cy="268" r="26"/>' +
        '<rect class="device" x="286" y="150" width="96" height="170" rx="16"/><rect class="screen" x="294" y="160" width="80" height="150" rx="10"/>' +
        (opts.phoneOk ? '<circle class="ok" cx="334" cy="222" r="26"/><path class="ok-mark" d="M321 222 l9 9 l17 -18"/>' : "") + "</g>"
      : "";
    var svg =
      '<svg viewBox="0 0 400 560" width="' + (opts.width || 400) + '" height="' + Math.round((opts.width || 400) * 1.4) + '">' +
      hairBack +
      '<path class="' + shirt + '" d="M60 560 C 60 420, 120 370, 200 370 C 280 370, 340 420, 340 560 Z"/>' +
      '<rect class="shade" x="176" y="300" width="48" height="80" rx="20"/>' +
      '<ellipse class="skin" cx="200" cy="210" rx="82" ry="100"/>' +
      fringe + face + phone +
      "</svg>";
    var el = document.createElement("div");
    el.className = "rs-person";
    el.innerHTML = svg;
    return el;
  };

  /** Đổi nét mặt nhân vật tại thời điểm `at`. */
  RS.mood = function (tl, person, mood, at) {
    person.querySelectorAll(".mood").forEach(function (g) {
      tl.set(g, { display: g.classList.contains(mood) ? "inline" : "none" }, at);
    });
  };

  window.RS = RS;
})();
