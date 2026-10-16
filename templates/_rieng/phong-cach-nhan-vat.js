/*
 * Phụ kiện và dấu cảm xúc kiểu truyện cho nhân vật RS.person (nhan-vat.js): áo choàng, mặt nạ, biểu tượng ngực (logo sản phẩm),
 * gân giận, giọt mồ hôi lớn, má gạch, mây u ám, mắt lấp lánh, dấu chấm than. Nạp sau phong-cach.js, kèm phong-cach.css.
 * Toạ độ theo khung nhân vật 600×900 (đầu ở giữa trên, cằm y≈472, ngực y≈650). Không tạo chữ.
 */
(function () {
  var RS = window.RS;
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function svgOf(p) { return p.querySelector("svg"); }

  /* ---------- Siêu anh hùng ---------- */

  /** Áo choàng: mép dưới gợn theo `pha` (radian), `bien` px. Cùng cấu trúc lệnh ở mọi pha. */
  function capeD(pha, bien) {
    var w = function (k) { return Math.sin(pha + k) * bien; }, f = function (n) { return n.toFixed(1); };
    return "M230 520 L370 520 C430 524 480 548 500 572 Q" + f(700 + w(0.6)) + " 600 " + f(680 + w(1.2)) + " 900 " +
      "L" + f(300 + w(2.1)) + " " + f(940 + w(2.6)) + " L" + f(-80 + w(3.1)) + " 900 Q" + f(-100 + w(3.7)) + " 600 100 572 C120 548 170 524 230 520 Z";
  }
  function foldD(pha, bien, side) {
    var s = side < 0 ? -1 : 1, w = Math.sin(pha + (s < 0 ? 0.9 : 2.4)) * bien;
    return "M" + (300 + s * 90) + " 600 L" + (300 + s * 250 + w).toFixed(1) + " 940 L" + (300 + s * 190 + w).toFixed(1) + " 940 Z";
  }
  var MAT_NA = "M198 318 C214 284 386 284 402 318 C408 352 386 372 352 364 L300 352 L248 364 C214 372 192 352 198 318 Z" +
    " M222 332 a34 22 0 1 0 68 0 a34 22 0 1 0 -68 0 Z M310 332 a34 22 0 1 0 68 0 a34 22 0 1 0 -68 0 Z";

  /**
   * Mặc đồ siêu anh hùng cho một người (gọi ngay sau khi tạo người qua RS.cast; từ lúc hoá anh hùng, gọi ở mọi cảnh sau):
   * opts { aoChoang: true, matNa: true, bieuTuong: "brand/logos/<sản phẩm>/<file>" (logo có sẵn, không đổi màu, không bóp méo) }.
   * Biểu tượng ngực nằm trên lớp nhân vật: tránh tư thế tay qua ngực (giu-nguc, chap-tay, nhin-dt, cam-dt, chong-cam) khi có biểu tượng.
   */
  RS.anhHung = function (p, opts) {
    var o = opts || {}, svg = svgOf(p), body = svg.querySelector(".j-body");
    if (o.aoChoang !== false && !p.querySelector(".pc-cape")) {
      var g = svgEl("g", { class: "pc-cape-g" });
      g.appendChild(svgEl("path", { class: "pc-cape", d: capeD(0, 0) }));
      g.appendChild(svgEl("path", { class: "pc-cape-d pc-fold-L", d: foldD(0, 0, -1) }));
      g.appendChild(svgEl("path", { class: "pc-cape-d pc-fold-R", d: foldD(0, 0, 1) }));
      body.insertBefore(g, body.firstChild);
    }
    if (o.matNa !== false && !p.querySelector(".pc-mat-na")) {
      var head = svg.querySelector(".j-head");
      head.insertBefore(svgEl("path", { class: "pc-mat-na", d: MAT_NA }), head.querySelector(".brow-L"));
    }
    if (o.bieuTuong && !p.querySelector(".pc-bieu-tuong")) {
      var k = (+svg.getAttribute("width") || 520) / 600;
      var b = document.createElement("div");
      b.className = "pc-bieu-tuong";
      b.style.left = Math.round(225 * k) + "px";
      b.style.top = Math.round(570 * k) + "px";
      b.style.width = Math.round(150 * k) + "px";
      b.style.height = Math.round(168 * k) + "px";
      b.style.padding = Math.round(20 * k) + "px " + Math.round(18 * k) + "px " + Math.round(36 * k) + "px";
      var img = document.createElement("img");
      img.src = o.bieuTuong;
      img.alt = "";
      b.appendChild(img);
      p.appendChild(b);
    }
    return p;
  };

  /** Áo choàng phấp phới suốt [from, to] (mạnh: biên độ, mặc định 1). */
  RS.choangBay = function (tl, p, from, to, manh) {
    var cape = p.querySelector(".pc-cape"), fL = p.querySelector(".pc-fold-L"), fR = p.querySelector(".pc-fold-R");
    if (!cape) throw new Error("RS.choangBay: nhân vật chưa có áo choàng (gọi RS.anhHung trước).");
    var bien = 28 * (manh == null ? 1 : manh), o = { t: 0 };
    tl.fromTo(o, { t: 0 }, { t: 1, duration: to - from, ease: "none", immediateRender: false, onUpdate: function () {
      var t = o.t * (to - from), pha = (from + t) * Math.PI * 2 * 1.3, b = bien * Math.min(1, t / 0.3);
      cape.setAttribute("d", capeD(pha, b));
      fL.setAttribute("d", foldD(pha, b, -1));
      fR.setAttribute("d", foldD(pha, b, 1));
    } }, from);
  };

  /* ---------- Dấu cảm xúc kiểu manga (gắn vào đầu, nghiêng theo đầu) ---------- */

  function sao(cx, cy, r) {
    return "M" + cx + " " + (cy - r) + " Q" + cx + " " + cy + " " + (cx + r) + " " + cy + " Q" + cx + " " + cy + " " + cx + " " + (cy + r) +
      " Q" + cx + " " + cy + " " + (cx - r) + " " + cy + " Q" + cx + " " + cy + " " + cx + " " + (cy - r) + " Z";
  }
  var DAU = {
    gan: { cls: "pc-gan", d: "M394 206 Q394 226 374 226 M406 206 Q406 226 426 226 M394 258 Q394 238 374 238 M406 258 Q406 238 426 238", o: "400 232" },
    giot: { cls: "pc-giot", d: "M442 196 C458 230 472 256 458 278 C446 292 424 286 422 268 C420 250 432 226 442 196 Z", o: "442 250" },
    "ma-hong": { cls: "pc-ma-hong", d: [208, 344].map(function (x) { return [0, 16, 32].map(function (dx) { return "M" + (x + dx) + " 404 L" + (x + dx + 12) + " 382"; }).join(" "); }).join(" "), o: "300 392" },
    "u-am": { cls: "pc-u-am", d: [228, 246, 264, 282, 300, 318, 336, 354, 372].map(function (x, i) { return "M" + x + " 214 L" + x + " " + (262 + (i % 3) * 10); }).join(" "), o: "300 214" },
    "lap-lanh": { cls: "pc-lap-lanh", d: sao(266, 322, 12) + " " + sao(354, 322, 12) + " " + sao(456, 186, 26) + " " + sao(146, 226, 18), o: "300 300" },
    "cham-than": { cls: "pc-cham-than", d: "M436 64 L466 64 L458 150 L444 150 Z M451 158 a13 13 0 1 0 0.1 0 Z", o: "451 120" },
  };

  /**
   * Hiện dấu cảm xúc `kieu` lúc `at` trong `dur` giây (bỏ trống = tới hết cảnh): gan (gân giận) | giot (giọt mồ hôi lớn) |
   * ma-hong (má gạch, ngượng) | u-am (vạch tối trên trán, sốc buồn) | lap-lanh (mắt lấp lánh, mê) | cham-than (giật mình).
   */
  RS.dauCamXuc = function (tl, p, kieu, at, dur) {
    var def = DAU[kieu];
    if (!def) throw new Error('RS.dauCamXuc: không có dấu "' + kieu + '". Dùng: ' + Object.keys(DAU).join(", "));
    var head = svgOf(p).querySelector(".j-head"), g = head.querySelector(".pc-dau-" + kieu);
    if (!g) {
      g = svgEl("g", { class: "pc-dau pc-dau-" + kieu });
      g.appendChild(svgEl("path", { class: def.cls, d: def.d }));
      head.appendChild(g);
    }
    var org = def.o;
    tl.set(g, { display: "inline" }, at);
    if (kieu === "giot") {
      tl.fromTo(g, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: "power2.out", immediateRender: false }, at);
      tl.to(g, { y: 26, duration: Math.max(0.4, (dur || 1.5) - 0.3), ease: "power1.in" }, at + 0.2);
    } else if (kieu === "u-am") {
      tl.fromTo(g, { scaleY: 0, svgOrigin: org }, { scaleY: 1, svgOrigin: org, duration: 0.35, ease: "power2.out", immediateRender: false }, at);
    } else {
      tl.fromTo(g, { scale: 0, svgOrigin: org }, { scale: 1.25, svgOrigin: org, duration: 0.12, ease: "power3.out", immediateRender: false }, at);
      tl.to(g, { scale: 1, svgOrigin: org, duration: 0.12, ease: "back.out(2)" }, at + 0.12);
      if (kieu === "gan" || kieu === "lap-lanh") {
        var n = Math.max(1, Math.floor(((dur || 1.2) - 0.3) / 0.5));
        tl.to(g, { scale: 1.15, svgOrigin: org, duration: 0.25, yoyo: true, repeat: n * 2 - 1, ease: "sine.inOut" }, at + 0.26);
      }
    }
    if (dur) tl.set(g, { display: "none" }, at + dur);
  };
})();
