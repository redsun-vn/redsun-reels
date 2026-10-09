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

  window.RS = RS;
})();
