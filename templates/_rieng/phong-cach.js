/*
 * Phong cách hình kiểu truyện cho video dựng riêng (docs/decisions.md §43): comic, manga, siêu anh hùng. Nạp sau chieu-sau.js,
 * kèm _rieng/phong-cach.css; phụ kiện nhân vật ở phong-cach-nhan-vat.js. Không tạo chữ: chữ tượng thanh, lời dẫn viết sẵn
 * trong HTML (class rs-tuong-thanh, rs-loi-dan). Mọi chuyển động gắn vào `tl` theo giây tuyệt đối, ngẫu nhiên có hạt giống.
 * Cách dùng: .claude/skills/dung-video/references/phong-cach-hinh.md.
 */
(function () {
  var RS = window.RS;
  var NS = "http://www.w3.org/2000/svg";
  var IDS = ["comic", "manga", "sieu-anh-hung"];
  var F = 1 / 30;

  function $(el) { return typeof el === "string" ? document.querySelector(el) : el; }
  function rootOf() { return document.querySelector("[data-composition-id]"); }
  function div(cls, parent, ignore) {
    var d = document.createElement("div");
    d.className = cls;
    d.setAttribute(ignore ? "data-layout-ignore" : "data-layout-allow-overflow", "");
    if (parent) parent.appendChild(d);
    return d;
  }
  /** Chèn lớp phủ vào gốc, dưới nhãn "Do AI sản xuất". */
  function addTop(root, el) {
    var nhan = root.querySelector(":scope > .rs-nhan-ai");
    if (nhan) root.insertBefore(el, nhan); else root.appendChild(el);
    return el;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  /**
   * Gắn phong cách cho cả video (gọi một lần, đầu build): "comic" | "manga" | "sieu-anh-hung". Phải khớp
   * script.json concept.phongCachHinh (validate đối chiếu). Video "thuong" thì không gọi.
   */
  RS.phongCach = function (root, id) {
    if (IDS.indexOf(id) < 0) throw new Error('RS.phongCach: không có phong cách "' + id + '". Dùng: ' + IDS.join(", ") + ' (video thường thì không gọi).');
    root = $(root) || rootOf();
    IDS.forEach(function (x) { root.classList.remove("pc-" + x); });
    root.classList.add("pc-" + id);
    root.setAttribute("data-phong-cach", id);
    return root;
  };

  /* ---------- Ô truyện ---------- */

  /** Bố cục ô (đỉnh đa giác trong khung 1080×1920), rãnh 40 px. */
  var BO_CUC = {
    mot: [[[40, 40], [1040, 40], [1040, 1880], [40, 1880]]],
    "doc-2": [[[40, 40], [1040, 40], [1040, 880], [40, 1000]], [[40, 1040], [1040, 920], [1040, 1880], [40, 1880]]],
    "bac-3": [[[40, 40], [1040, 40], [1040, 600], [40, 660]], [[40, 700], [1040, 640], [1040, 1240], [40, 1200]], [[40, 1240], [1040, 1280], [1040, 1880], [40, 1880]]],
    cheo: [[[40, 40], [620, 40], [540, 1080], [40, 1080]], [[660, 40], [1040, 40], [1040, 1080], [580, 1080]], [[40, 1120], [1040, 1120], [1040, 1880], [40, 1880]]],
    // Ô trên thấp (khép vòng / cảnh kết: trên là chuyện, dưới là thương hiệu)
    "tren-thap": [[[40, 40], [1040, 40], [1040, 640], [40, 720]], [[40, 760], [1040, 680], [1040, 1880], [40, 1880]]],
    // Manga: dải cận mắt mảnh ở trên, hai ô xiên
    "mat-3": [[[40, 40], [1040, 40], [1040, 400], [40, 470]], [[40, 510], [1040, 440], [1040, 1180], [40, 1250]], [[40, 1290], [1040, 1220], [1040, 1880], [40, 1880]]],
    // Manga: hai ô chẻ xiên dốc
    "xien-2": [[[40, 40], [1040, 40], [1040, 700], [40, 1300]], [[40, 1340], [1040, 740], [1040, 1880], [40, 1880]]],
  };
  RS.BO_CUC_O = BO_CUC;

  /**
   * Chia `el` thành trang truyện có ô viền mực: bố cục "mot" | "doc-2" | "bac-3" | "cheo" | "tren-thap" | "mat-3" | "xien-2". Trả mảng ô { el, noi, tam };
   * `noi` là lớp nội dung khung 1080×1920 đã cắt theo ô: RS.set(o.noi, …), đặt nhân vật/chữ vào đó (chuyển phần tử HTML
   * có sẵn vào bằng appendChild). Trang chèn làm con đầu của `el` (chữ, bóng thoại có sẵn vẫn nằm trên). Mảng có thêm `.trang` (nền giấy).
   */
  RS.oTruyen = function (el, bocuc) {
    var polys = BO_CUC[bocuc];
    if (!polys) throw new Error('RS.oTruyen: không có bố cục "' + bocuc + '". Dùng: ' + Object.keys(BO_CUC).join(", "));
    el = $(el);
    var trang = div("rs-trang", null);
    el.insertBefore(trang, el.firstChild); // dưới chữ, bóng thoại có sẵn của cảnh
    trang.setAttribute("data-layout-allow-overlap", "");
    var out = polys.map(function (pts) {
      var wrap = div("rs-o", trang);
      wrap.setAttribute("data-layout-allow-overlap", "");
      var noi = div("rs-o-noi", wrap);
      noi.setAttribute("data-layout-allow-overlap", "");
      noi.style.clipPath = "polygon(" + pts.map(function (p) { return p[0] + "px " + p[1] + "px"; }).join(", ") + ")";
      var svg = svgEl("svg", { class: "rs-o-vien", viewBox: "0 0 1080 1920", "data-layout-ignore": "" });
      svg.appendChild(svgEl("polygon", { points: pts.map(function (p) { return p.join(","); }).join(" ") }));
      wrap.appendChild(svg);
      var cx = 0, cy = 0;
      pts.forEach(function (p) { cx += p[0] / pts.length; cy += p[1] / pts.length; });
      return { el: wrap, noi: noi, tam: [Math.round(cx), Math.round(cy)] };
    });
    out.trang = trang;
    return out;
  };

  /** Ô truyện đập vào lúc `at`: huong "trai" | "phai" | "tren" | "duoi" (trượt vào, vượt nhẹ) hoặc "giua" (phóng xuống). */
  RS.danO = function (tl, o, at, huong, opts) {
    var p = opts || {}, h = huong || "giua";
    var tu = { trai: { x: -1150 }, phai: { x: 1150 }, tren: { y: -2000 }, duoi: { y: 2000 } }[h];
    var org = o.tam[0] + "px " + o.tam[1] + "px";
    var dur = p.dur || (tu ? 0.3 : 0.2);
    tl.fromTo(o.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, immediateRender: true }, at);
    if (tu) tl.fromTo(o.el, Object.assign({ x: 0, y: 0, rotation: h === "trai" || h === "tren" ? -5 : 5, transformOrigin: org }, tu),
      { x: 0, y: 0, rotation: 0, transformOrigin: org, duration: dur, ease: "back.out(1.3)" }, at);
    else tl.fromTo(o.el, { scale: 1.5, opacity: 0, transformOrigin: org }, { scale: 1, opacity: 1, transformOrigin: org, duration: dur, ease: "power4.in" }, at);
    if (p.rung !== false) RS.shake(tl, o.el, at + dur, 10, 2);
  };

  /* ---------- Chữ tượng thanh ---------- */

  /**
   * Chữ tượng thanh (phần tử .rs-tuong-thanh viết sẵn, ≤ 3 từ) bật ra lúc `at`: phóng vượt, xoay `goc` độ, rung nhỏ `rung` giây.
   * opts { goc (mặc định -8), rung (0.5), het (giây biến mất, bỏ trống = giữ tới hết cảnh), seed }.
   */
  RS.tuongThanh = function (tl, el, at, opts) {
    var o = opts || {}, goc = o.goc == null ? -8 : o.goc, rung = o.rung == null ? 0.5 : o.rung, r = RS.rng(o.seed || 21);
    el = $(el);
    tl.fromTo(el, { scale: 0, rotation: goc - 14, opacity: 1 }, { scale: 1.2, rotation: goc + 3, duration: 0.14, ease: "power3.out" }, at);
    tl.to(el, { scale: 1, rotation: goc, duration: 0.14, ease: "back.out(2)" }, at + 0.14);
    for (var t = at + 0.3; t < at + 0.3 + rung; t += 2 * F) tl.set(el, { x: (r() - 0.5) * 6, y: (r() - 0.5) * 6 }, t);
    tl.set(el, { x: 0, y: 0 }, at + 0.3 + rung);
    if (o.het) tl.to(el, { scale: 1.3, opacity: 0, duration: 0.18, ease: "power2.in" }, o.het);
  };

  /* ---------- Đường tốc độ ---------- */

  function tapTrung(r, o) {
    var c = o.tam || [540, 900], ho = o.ho || 340, n = o.so || 90, d = "";
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.06, w = 0.004 + r() * 0.012, ri = ho * (1 + r() * 0.7), R = 2400;
      d += "M" + (c[0] + Math.cos(a - w) * R).toFixed(1) + " " + (c[1] + Math.sin(a - w) * R).toFixed(1) +
        "L" + (c[0] + Math.cos(a + w) * R).toFixed(1) + " " + (c[1] + Math.sin(a + w) * R).toFixed(1) +
        "L" + (c[0] + Math.cos(a) * ri).toFixed(1) + " " + (c[1] + Math.sin(a) * ri).toFixed(1) + "Z";
    }
    return d;
  }
  function songSong(r, o) {
    var g = ((o.goc || 0) * Math.PI) / 180, cs = Math.cos(g), sn = Math.sin(g), n = o.so || 60, d = "";
    var P = function (t, s) { return (540 + t * cs - s * sn).toFixed(1) + " " + (960 + t * sn + s * cs).toFixed(1); };
    for (var i = 0; i < n; i++) {
      var s = (r() - 0.5) * 2400, L = 600 + r() * 1000, t0 = -1100 + r() * (2200 - L), h = 2 + r() * 6;
      d += "M" + P(t0, s - h) + "L" + P(t0 + L, s) + "L" + P(t0, s + h) + "Z";
    }
    return d;
  }

  /**
   * Đường tốc độ phủ khung 1080×1920 trong `el`: kieu "tap-trung" (dồn về `tam`, chừa vòng `ho` px) hoặc "song-song" (theo `goc` độ).
   * opts { tam, ho, goc, so, mau: "trang" (trên nền tối), seed }. Ẩn tới khi RS.duongTocChay bật.
   */
  RS.duongToc = function (el, kieu, opts) {
    var o = opts || {}, ve = kieu === "song-song" ? songSong : kieu === "tap-trung" ? tapTrung : null;
    if (!ve) throw new Error('RS.duongToc: kiểu "' + kieu + '" không có. Dùng: tap-trung, song-song');
    var svg = svgEl("svg", { class: "rs-duong-toc" + (o.mau === "trang" ? " trang" : ""), viewBox: "0 0 1080 1920", "data-layout-ignore": "", "data-b": "0" });
    for (var b = 0; b < 3; b++) svg.appendChild(svgEl("path", { class: "b" + b, d: ve(RS.rng((o.seed || 41) + b * 97), o) }));
    svg.style.opacity = 0;
    $(el).appendChild(svg);
    return svg;
  };

  /** Bật đường tốc độ trong [from, to]: đổi nét mỗi 2 khung (như vẽ tay), hiện/tắt nhanh ở hai đầu. */
  RS.duongTocChay = function (tl, d, from, to) {
    tl.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, from);
    for (var t = from, k = 0; t < to; t += 2 * F, k++) tl.set(d, { attr: { "data-b": k % 3 } }, t);
    tl.to(d, { opacity: 0, duration: 0.1, ease: "none" }, Math.max(from + 0.08, to - 0.1));
  };

  /* ---------- Khung va chạm, đứng hình ---------- */

  /**
   * Khung va chạm: đảo màu đen trắng + đường dồn trắng trong `khung` khung hình (mặc định 2), `lan` lần từ `at`.
   * Giữa hai lần cách ít nhất 1/3 giây (không nhấp nháy quá 3 lần/giây). `el` bỏ trống = cả video. opts { tam, khung, cach, seed }.
   */
  RS.khungVaCham = function (tl, el, at, lan, opts) {
    var o = opts || {}, root = rootOf();
    el = $(el) || root;
    var vc = div("rs-va-cham", null, true);
    if (el === root) addTop(root, vc); else el.appendChild(vc);
    vc.style.opacity = 0;
    var dt = RS.duongToc(vc, "tap-trung", { tam: o.tam, so: 70, seed: o.seed || 31, mau: "trang" });
    dt.style.opacity = 1;
    var cach = o.cach || 0.36;
    if (cach < 1 / 3) { console.warn("RS.khungVaCham: cách nhau " + cach + " giây là nhấp nháy quá 3 lần/giây, giãn ra 0.34."); cach = 0.34; }
    tl.set(vc, { opacity: 0 }, 0);
    for (var i = 0; i < Math.max(1, lan || 1); i++) {
      var t = at + i * cach;
      tl.set(vc, { opacity: 1 }, t);
      tl.set(vc, { opacity: 0 }, t + (o.khung || 2) * F);
    }
    return vc;
  };

  /**
   * Đứng hình kiểu truyện lúc `at` trong `dur` giây: lớp máy `el` nghiêng `goc` độ (khung nghiêng), viền ô mực và chấm dày phủ cảnh.
   * `el` phải là một lớp máy riêng (hàm dùng rotation + scale của nó; không lớp đang chạy RS.truotLech hay đẩy máy). opts { goc (mặc định -5), canh (phần tử cảnh để phủ), giu }.
   */
  RS.dungHinh = function (tl, el, at, dur, opts) {
    var o = opts || {}, goc = o.goc == null ? -5 : o.goc;
    el = $(el);
    var canh = $(o.canh) || el.closest(".rs-scene") || rootOf();
    var khung = div("rs-dung-hinh", canh, true);
    khung.style.opacity = 0;
    tl.set(khung, { opacity: 0 }, 0);
    tl.set(khung, { opacity: 1 }, at);
    // Phóng 1.08 khi nghiêng để mép khung không lộ nền phía sau
    tl.fromTo(el, { rotation: 0, scale: 1, transformOrigin: "540px 960px" }, { rotation: goc, scale: 1.08, transformOrigin: "540px 960px", duration: 0.06, ease: "power4.out", immediateRender: false }, at);
    if (!o.giu) {
      tl.set(khung, { opacity: 0 }, at + dur);
      tl.to(el, { rotation: 0, scale: 1, duration: 0.2, ease: "power2.inOut" }, at + dur);
    }
    return khung;
  };

  /* ---------- Công thức 3 giây đầu ---------- */

  function hookVao(tl, hook, at) {
    if (hook) tl.fromTo($(hook), { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power4.in" }, at);
  }

  var MO_DAU = {
    /** opts { o: ô từ RS.oTruyen (≥ 2), phach: giây từng ô [0.1, 0.55, 1.0], huong, tuongThanh, hook, hookAt } */
    comic: function (tl, root, o) {
      if (!o.o || o.o.length < 2) throw new Error('RS.moDau "comic": cần opts.o là ≥ 2 ô từ RS.oTruyen.');
      var t0 = o.tu || 0, ph = o.phach || [0.1, 0.55, 1.0].map(function (x) { return x + t0; }), huong = o.huong || ["trai", "phai", "giua", "duoi"], last = o.o.length - 1;
      if (ph.length < o.o.length) throw new Error('RS.moDau "comic": opts.phach cần ' + o.o.length + " giây (mỗi ô một nhịp).");
      o.o.forEach(function (oi, i) { RS.danO(tl, oi, ph[i], huong[i]); });
      RS.khungVaCham(tl, root, ph[last] + 0.2, 1, { tam: o.o[last].tam });
      if (o.tuongThanh) RS.tuongThanh(tl, o.tuongThanh, ph[last] + 0.05);
      hookVao(tl, o.hook, o.hookAt == null ? ph[0] : o.hookAt);
    },
    /** opts { cam, mat: [x, y] tâm mặt, ho (vòng chừa trống, 300), p: nhân vật, dau ("giot"), phach [0.4, 1.1], zoom (1.5), nen, khung, tuongThanh, hook, hookAt } */
    manga: function (tl, root, o) {
      if (!o.cam || !o.mat) throw new Error('RS.moDau "manga": cần opts.cam (lớp máy) và opts.mat [x, y] (tâm mặt nhân vật).');
      var t0 = o.tu || 0, ph = o.phach || [0.4, 1.1].map(function (x) { return x + t0; }), cam = $(o.cam);
      var lines = RS.duongToc(o.nen ? $(o.nen) : cam.parentNode, "tap-trung", { tam: o.mat, ho: o.ho || 300, seed: 53 });
      RS.duongTocChay(tl, lines, t0, ph[1] + 0.9);
      tl.fromTo(cam, { scale: 1, transformOrigin: o.mat[0] + "px " + o.mat[1] + "px" }, { scale: o.zoom || 1.5, duration: ph[0] - t0, ease: "power2.in" }, t0);
      if (o.p) {
        if (!RS.dauCamXuc) throw new Error('RS.moDau "manga" với opts.p cần nạp _rieng/phong-cach-nhan-vat.js.');
        RS.dauCamXuc(tl, o.p, o.dau || "giot", ph[0], 2.5);
      }
      RS.dungHinh(tl, o.khung || cam.parentNode, ph[1], o.dung || 0.9, { goc: -6 });
      if (o.tuongThanh) RS.tuongThanh(tl, o.tuongThanh, ph[1]);
      hookVao(tl, o.hook, o.hookAt == null ? ph[1] : o.hookAt);
    },
    /** opts { nguoi: khung chứa nhân vật, p, cam, phach [0.6, 1.4], dat: [x, y] chỗ chạm đất, vaCham (false = không khung va chạm), tiaTruoc (tia sáng nằm sau phần tử này, mặc định nguoi), tuongThanh, hook, hookAt } */
    "sieu-anh-hung": function (tl, root, o) {
      if (!o.nguoi) throw new Error('RS.moDau "sieu-anh-hung": cần opts.nguoi (khung chứa nhân vật).');
      var t0 = o.tu || 0, ph = o.phach || [0.6, 1.4].map(function (x) { return x + t0; }), host = $(o.nguoi), dat = o.dat || [540, 1500];
      var tia = div("rs-tia-sang", null, true);
      var sau = $(o.tiaTruoc) || host;
      sau.parentNode.insertBefore(tia, sau);
      tl.fromTo(tia, { opacity: 0, rotation: 0 }, { opacity: 1, rotation: 6, duration: 0.4, ease: "power2.out" }, t0);
      tl.to(tia, { rotation: 30, duration: 3, ease: "none" }, t0 + 0.4);
      tl.fromTo(host, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, immediateRender: true }, t0);
      tl.fromTo(host, { y: -1800 }, { y: 0, duration: ph[0] - t0, ease: "power4.in" }, t0);
      tl.fromTo(host, { scaleY: 0.86, scaleX: 1.07, transformOrigin: "50% 100%" }, { scaleY: 1, scaleX: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, ph[0]);
      if (o.cam) RS.shake(tl, o.cam, ph[0], 18, 3);
      if (o.vaCham !== false) RS.khungVaCham(tl, root, ph[0], 1, { tam: dat });
      RS.burst(tl, host.parentNode, "bui-dat", { x: dat[0], y: dat[1], count: 16, spread: 460, rise: -40, at: ph[0], dur: 0.8, seed: 61 });
      if (o.p) {
        RS.pose(tl, o.p, "chong-hong", ph[0] + 0.15, 0.25);
        if (RS.choangBay && o.p.querySelector(".pc-cape")) RS.choangBay(tl, o.p, t0, t0 + 3);
      }
      if (o.tuongThanh) RS.tuongThanh(tl, o.tuongThanh, ph[0] + 0.02);
      hookVao(tl, o.hook, o.hookAt == null ? ph[1] : o.hookAt);
    },
  };

  /**
   * Công thức 3 giây đầu theo phong cách (đặt điểm hấp dẫn của LUẬT SỐ 1 vào ô/khung va chạm đầu). Xem opts từng kiểu ở trên;
   * mọi kiểu nhận thêm `tu` (giây bắt đầu, mặc định 0) — `phach` truyền vào là giây tuyệt đối.
   */
  RS.moDau = function (tl, root, id, opts) {
    var f = MO_DAU[id];
    if (!f) throw new Error('RS.moDau: không có phong cách "' + id + '". Dùng: ' + IDS.join(", "));
    f(tl, $(root) || rootOf(), opts || {});
  };
})();
