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

  /*
   * Giọng đọc (skill giong-doc): bước dựng ghi giờ thật của từng câu vào window.RS_LOI = { id: { at, dur, loi } }
   * (đo từ file giọng đã chọn). Phụ đề và chữ nhấn lấy giờ từ đây nên luôn khớp giọng, kể cả khi tạo lại giọng.
   */
  RS.loi = function (id) {
    var L = (window.RS_LOI || {})[id];
    if (!L) throw new Error("Không có câu giọng \"" + id + "\" (loi-doc.json).");
    return { at: L.at, dur: L.dur, end: L.at + L.dur, loi: L.loi };
  };
  /** Giây giọng đọc tới cụm chữ `cum` trong câu `id` (ước theo vị trí chữ trong câu; thẻ [..] không tính). */
  RS.loiAt = function (id, cum) {
    var L = RS.loi(id), text = L.loi.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
    var i = text.toLowerCase().indexOf(String(cum).toLowerCase());
    if (i < 0) throw new Error("Câu \"" + id + "\" không có cụm \"" + cum + "\".");
    return L.at + (i / Math.max(1, text.length)) * L.dur;
  };
  /** Phụ đề lời đọc: mỗi <div class="rs-sub rs-loi" data-loi="<id>"> hiện đúng lúc câu bắt đầu, tắt khi đọc xong. */
  RS.loiSubs = function (tl) {
    document.querySelectorAll(".rs-sub.rs-loi[data-loi]").forEach(function (el) {
      var L = RS.loi(el.getAttribute("data-loi"));
      tl.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, L.at);
      tl.to(el, { opacity: 0, duration: 0.12, ease: "power1.in" }, L.end + 0.12);
    });
  };

  /** Bàn tay giơ ngón trỏ (SVG) vào phần tử `el` (class rs-tay). Đầu ngón ở 40% ngang, 4% dọc của khung tay. */
  RS.tayBam = function (el) {
    el = typeof el === "string" ? document.querySelector(el) : el;
    el.classList.add("rs-tay");
    el.innerHTML = '<svg viewBox="0 0 100 140" aria-hidden="true">' +
      '<rect class="tay-ao" x="24" y="114" width="56" height="26" rx="6"/>' +
      '<rect class="da" x="30" y="4" width="20" height="74" rx="10"/>' +
      '<rect class="mong" x="34" y="7" width="12" height="13" rx="5"/>' +
      '<rect class="da" x="20" y="58" width="64" height="62" rx="22"/>' +
      '<circle class="bong" cx="60" cy="66" r="11"/><circle class="da" cx="60" cy="64" r="11"/>' +
      '<circle class="bong" cx="75" cy="72" r="10"/><circle class="da" cx="75" cy="70" r="10"/>' +
      '<rect class="da" x="6" y="66" width="20" height="44" rx="10" transform="rotate(-28 16 88)"/>' +
      '</svg>';
    return el;
  };
  /**
   * Bấm: tay nhấn xuống rồi nhả, nút (nếu có) lún nhẹ, vòng gợn toả ở đầu ngón. `hand` đã gọi RS.tayBam, nằm cùng lớp cha
   * với vòng gợn (tạo tự động).
   */
  RS.bam = function (tl, hand, at, target) {
    hand = typeof hand === "string" ? document.querySelector(hand) : hand;
    var gon = document.createElement("div");
    gon.className = "rs-gon";
    gon.style.left = hand.offsetLeft + hand.offsetWidth * 0.4 + "px";
    gon.style.top = hand.offsetTop + hand.offsetHeight * 0.04 + "px";
    hand.parentNode.insertBefore(gon, hand);
    tl.to(hand, { y: "+=12", scale: 0.94, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.in" }, at - 0.08);
    if (target) tl.to(target, { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.in" }, at - 0.08);
    tl.fromTo(gon, { scale: 0.2, opacity: 0.95 }, { scale: 2.4, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, at);
    tl.set(gon, { opacity: 0 }, 0);
  };

  window.RS = RS;
})();
