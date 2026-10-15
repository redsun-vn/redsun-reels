/*
 * Chiều sâu cho video dựng riêng: lớp xa/giữa/gần trượt lệch theo máy quay, mờ theo độ sâu, vật tiền cảnh sát ống kính,
 * ánh sáng (chùm sáng, vệt quét, loé), lớp hoàn thiện (viền tối, tông, hạt), thẻ nghiêng trong không gian, và chuyển cảnh
 * trong khung hình (lao vào chi tiết, vật thoát khỏi khung, vật lướt che cú cắt, màu tràn). Nạp sau boi-canh.js, kèm
 * _rieng/chieu-sau.css. Không tạo chữ. Mọi chuyển động gắn vào `tl`, ngẫu nhiên có hạt giống.
 *
 * Rút ý từ code-rendered-video (MIT): camera.md (thị sai, mờ theo độ sâu), effects.md (ánh sáng, lớp hoàn thiện),
 * transitions.md mục In-world. Cách dùng: .claude/skills/dung-video/references/chieu-sau-hinh.md.
 */
(function () {
  var RS = window.RS;
  var NS = "http://www.w3.org/2000/svg";

  function div(cls, parent, style) {
    var d = document.createElement("div");
    d.className = cls;
    if (style) Object.keys(style).forEach(function (k) { d.style[k] = style[k]; });
    d.setAttribute("data-layout-allow-overflow", "");
    if (parent) parent.appendChild(d);
    return d;
  }
  function $(el) { return typeof el === "string" ? document.querySelector(el) : el; }
  function rootOf(el) { return (el && el.closest && el.closest("[data-composition-id]")) || document.querySelector("[data-composition-id]"); }
  /** Chèn lớp phủ vào gốc, nằm dưới nhãn "Do AI sản xuất" (không phủ lên nhãn). */
  function addTop(root, el) {
    var nhan = root.querySelector(":scope > .rs-nhan-ai");
    if (nhan) root.insertBefore(el, nhan); else root.appendChild(el);
    return el;
  }

  /* ---------- Lớp chiều sâu ---------- */

  /**
   * Lớp mặc định của một cảnh dựng bằng RS.set: [[bg.sau, 0.35], [giữa…, 0.7], [bg.gan, 1.25]] — hệ số càng lớn càng gần
   * ống kính (dịch nhiều hơn khi máy di chuyển). `giua`: nhân vật/đạo cụ giữa cảnh (phần tử hoặc danh sách).
   */
  RS.lopCanh = function (bg, giua, tienCanh) {
    var out = [[bg.sau, 0.35]];
    [].concat(giua || []).forEach(function (el) { out.push([$(el), 0.7]); });
    if (bg.gan) out.push([bg.gan, 1.25]);
    [].concat(tienCanh || []).forEach(function (el) { out.push([$(el), 1.8]); });
    return out;
  };

  /**
   * Trượt lệch (thị sai): máy dịch `x`, `y` px và đẩy `zoom` (1 = đứng yên) trong `dur` giây từ `at`; mỗi lớp dịch theo hệ số
   * của nó. Lớp xa tự phóng nhẹ để không lộ mép (opts.le = độ dịch lớn nhất của cả cảnh, mặc định 120 px). Gọi theo thứ tự
   * thời gian, mỗi chuyển động máy một lần; lần sau đi tiếp từ chỗ lần trước.
   */
  RS.truotLech = function (tl, layers, at, dur, opts) {
    var o = opts || {}, x = o.x || 0, y = o.y || 0, zoom = o.zoom || 1, ease = o.ease || "sine.inOut";
    layers.forEach(function (l) {
      var el = $(l[0]), k = l[1];
      if (!el) return;
      // Gọi nhiều lần trên cùng lớp: lần sau đi tiếp từ chỗ lần trước dừng. Lớp xa phóng sẵn đủ để không lộ mép.
      var cur = el._csTruot || { x: 0, y: 0, s: k < 1 ? 1 + (2 * (o.le || 120) * (1 - k)) / 1080 : 1 };
      var next = { x: cur.x - x * k, y: cur.y - y * k, s: cur.s * (1 + (zoom - 1) * k) };
      tl.fromTo(el, { x: cur.x, y: cur.y, scale: cur.s, transformOrigin: "50% 50%" },
        { x: next.x, y: next.y, scale: next.s, duration: dur, ease: ease, immediateRender: !el._csTruot }, at);
      el._csTruot = next;
    });
  };

  /** Mờ theo độ sâu (tĩnh): `px` = bán kính mờ. Lớp xa 3–8, vật tiền cảnh 10–24. Chữ không bao giờ mờ. */
  RS.moSau = function (el, px) {
    el = $(el);
    gsap.set(el, { filter: "blur(" + px + "px)" });
    return el;
  };

  /** Chuyển nét (rack focus): lớp `tu` mờ dần, lớp `den` nét dần trong `dur` giây. Mờ tối đa `px`. */
  RS.doiNet = function (tl, tu, den, at, dur, px) {
    px = px || 8;
    if (tu) tl.fromTo($(tu), { filter: "blur(0px)" }, { filter: "blur(" + px + "px)", duration: dur, ease: "power2.inOut", immediateRender: false }, at);
    if (den) tl.fromTo($(den), { filter: "blur(" + px + "px)" }, { filter: "blur(0px)", duration: dur, ease: "power2.inOut", immediateRender: false }, at);
  };

  /** Hình vật tiền cảnh (SVG trong ô 1000×1000, viewBox co giãn theo kích thước ô). */
  var TIEN_CANH = {
    // Mép quầy/bàn sát ống kính, chạy ngang đáy khung
    "mep-quay": '<path class="go" d="M-40 360 Q500 300 1040 360 L1040 1000 L-40 1000 Z"/><path class="t1" d="M-40 420 Q500 370 1040 420 L1040 1000 L-40 1000 Z" opacity="0.55"/>',
    // Cụm lá cây ở góc
    "la": '<ellipse class="la" cx="300" cy="700" rx="140" ry="420" transform="rotate(-38 300 700)"/><ellipse class="la2" cx="520" cy="760" rx="120" ry="380" transform="rotate(-8 520 760)"/>' +
      '<ellipse class="la" cx="720" cy="820" rx="130" ry="360" transform="rotate(30 720 820)"/><ellipse class="la2" cx="160" cy="900" rx="110" ry="300" transform="rotate(-62 160 900)"/>',
    // Ly nước to, mờ ở góc dưới
    "ly": '<path class="t2" d="M260 220 H740 L690 960 Q680 1000 640 1000 H360 Q320 1000 310 960 Z"/><rect class="t1" x="230" y="170" width="540" height="80" rx="40"/><rect class="go" x="560" y="-60" width="46" height="300" rx="20" transform="rotate(14 583 90)"/>',
    // Vai và gáy người ở tiền cảnh (góc qua vai)
    "vai": '<path class="t1" d="M60 1000 Q80 640 360 560 Q440 540 500 540 Q560 540 640 560 Q920 640 940 1000 Z"/><ellipse class="t2" cx="500" cy="330" rx="210" ry="250"/><path class="t1" d="M290 300 Q300 80 500 70 Q700 80 710 300 Q640 200 500 200 Q360 200 290 300 Z"/>',
    // Cột/khung cửa dọc
    "cot": '<rect class="t1" x="380" y="-60" width="240" height="1120"/><rect class="t2" x="400" y="-60" width="40" height="1120"/>',
  };

  /**
   * Vật tiền cảnh sát ống kính, to, tối, mờ: kieu = mep-quay | la | ly | vai | cot.
   * opts: { x, y, w, h (px trong khung 1080×1920), mo (bán kính mờ, mặc định 14), lat: true (lật ngang) }.
   * Trả về phần tử; đưa vào RS.lopCanh(…, …, [el]) để nó trượt nhiều nhất khi máy đi.
   */
  RS.tienCanh = function (parent, kieu, opts) {
    var o = opts || {}, svg = TIEN_CANH[kieu];
    if (!svg) throw new Error('Không có vật tiền cảnh "' + kieu + '". Có: ' + Object.keys(TIEN_CANH).join(", "));
    var el = div("cs-gan cs-gan-" + kieu, $(parent), { left: (o.x || 0) + "px", top: (o.y || 0) + "px", width: (o.w || 600) + "px", height: (o.h || 600) + "px" });
    el.setAttribute("data-layout-allow-occlusion", "");
    el.innerHTML = '<svg xmlns="' + NS + '" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"' + (o.lat ? ' transform="scale(-1 1)"' : "") + ">" + svg + "</svg>";
    gsap.set(el, { filter: "blur(" + (o.mo == null ? 14 : o.mo) + "px)" });
    return el;
  };

  /* ---------- Ánh sáng ---------- */

  /**
   * Chùm sáng từ cửa sổ/đèn chiếu xuống, có bụi trôi trong chùm. opts: { x, y (đỉnh chùm), rong, dai, goc (độ), lanh, bui,
   * seed }. Chùm thở nhẹ suốt from–to.
   */
  RS.chumSang = function (tl, parent, from, to, opts) {
    var o = opts || {}, rong = o.rong || 520, dai = o.dai || 1300, rng = RS.rng(o.seed || 5);
    parent = $(parent);
    var el = div("cs-chum" + (o.lanh ? " lanh" : ""), parent, { left: (o.x || 540) - rong / 2 + "px", top: (o.y || 0) + "px", width: rong + "px", height: dai + "px" });
    gsap.set(el, { rotation: o.goc || 0 });
    var d = to - from, p = 2.2;
    tl.fromTo(el, { opacity: 0.75 }, { opacity: 1, duration: p, yoyo: true, repeat: Math.max(0, Math.floor(d / p) - 1), ease: "sine.inOut" }, from);
    for (var i = 0; i < (o.bui == null ? 14 : o.bui); i++) {
      var t = 0.15 + rng() * 0.8, w = rong * (0.25 + t * 0.75);
      var b = div("cs-bui", parent, { left: Math.round((o.x || 540) + (rng() - 0.5) * w) + "px", top: Math.round((o.y || 0) + t * dai) + "px", opacity: (0.35 + rng() * 0.5).toFixed(2) });
      gsap.set(b, { scale: 0.4 + rng() * 0.8 });
      tl.fromTo(b, { x: 0, y: 0 }, { x: (rng() - 0.5) * 120, y: -40 - rng() * 90, duration: d, ease: "sine.inOut" }, from);
    }
    return el;
  };

  /** Vệt sáng quét chéo qua bề mặt (kính, màn hình, thẻ) trong `dur` giây từ `at`. `el` nên có border-radius. */
  RS.quetSang = function (tl, el, at, dur) {
    el = $(el);
    var khung = div("cs-quet-khung", el), q = div("cs-quet", khung);
    tl.fromTo(q, { xPercent: -120, rotation: 18, opacity: 1 }, { xPercent: 420, rotation: 18, duration: dur || 0.7, ease: "power2.inOut", immediateRender: true }, at);
    tl.set(q, { opacity: 0 }, at + (dur || 0.7));
  };

  /** Loé sáng cả khung tại điểm nhấn (x, y px) lúc `at`, tắt trong 0,5 giây. Đặt cạnh tiếng nhấn mạnh. */
  RS.loe = function (tl, root, at, opts) {
    var o = opts || {};
    root = $(root) || rootOf();
    var el = addTop(root, div("cs-phu cs-loe", null, { "--cs-x": (o.x == null ? 540 : o.x) + "px", "--cs-y": (o.y == null ? 860 : o.y) + "px" }));
    tl.set(el, { opacity: 0 }, 0);
    tl.fromTo(el, { opacity: o.manh || 0.9 }, { opacity: 0, duration: o.dur || 0.5, ease: "power2.out", immediateRender: false }, at);
    return el;
  };

  /* ---------- Lớp hoàn thiện ---------- */

  /**
   * Lớp hoàn thiện phủ cả video (gọi một lần): opts { vignette: 0..1 (mặc định 0.35), hat: 0..1 (mặc định 0.07), tong: "am" | "lanh" }.
   * Hạt đứng yên (không đổi theo khung) để bộ đo đứng hình vẫn đo đúng chuyển động thật.
   */
  RS.hoanThien = function (root, opts) {
    var o = opts || {};
    root = $(root) || rootOf();
    var out = {};
    if (o.tong) out.tong = addTop(root, div("cs-phu cs-tong-" + o.tong));
    if (o.vignette !== 0) { out.vignette = addTop(root, div("cs-phu cs-vignette")); out.vignette.style.opacity = o.vignette == null ? 0.35 : o.vignette; }
    if (o.hat !== 0) { out.hat = addTop(root, div("cs-phu cs-hat")); out.hat.style.opacity = o.hat == null ? 0.07 : o.hat; }
    return out;
  };

  /* ---------- Thẻ trong không gian ---------- */

  /** Thẻ/màn hình/ảnh đến nghiêng trong không gian rồi xoay thẳng mặt máy. opts { rotY, rotX, z, dur, ease }. */
  RS.the3d = function (tl, el, at, opts) {
    var o = opts || {};
    el = $(el);
    tl.fromTo(el, { rotationY: o.rotY == null ? -38 : o.rotY, rotationX: o.rotX == null ? 14 : o.rotX, z: o.z == null ? -260 : o.z, transformPerspective: 1600 },
      { rotationY: 0, rotationX: 0, z: 0, transformPerspective: 1600, duration: o.dur || 0.9, ease: o.ease || "power3.out" }, at);
  };

  /* ---------- Chuyển cảnh trong khung hình ---------- */

  /** Toạ độ vật trong hệ của lớp máy (trước khi máy di chuyển). */
  function rectIn(cam, el) {
    var x = 0, y = 0, n = el;
    while (n && n !== cam) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    if (n !== cam) {
      var a = el.getBoundingClientRect(), b = cam.getBoundingClientRect();
      x = a.left - b.left; y = a.top - b.top;
    }
    return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight };
  }

  /**
   * Lao vào chi tiết: lớp máy `cam` (riêng cho chuyển động này) đẩy vào `vat` cho tới khi vật kín khung lúc at + dur.
   * Cảnh sau bắt đầu đúng lúc đó và mở bằng hình đang hiện trên vật (vd. màn hình điện thoại → ảnh chuyển khoản).
   */
  RS.laoVao = function (tl, cam, vat, at, dur, opts) {
    var o = opts || {};
    cam = $(cam); vat = $(vat);
    var r = rectIn(cam, vat), s = Math.max(1080 / r.w, 1920 / r.h) * (o.du || 1.04);
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    tl.fromTo(cam, { x: 0, y: 0, scale: 1, transformOrigin: "0px 0px" },
      { x: 540 - s * cx, y: 960 - s * cy, scale: s, transformOrigin: "0px 0px", duration: dur, ease: o.ease || "power3.in", immediateRender: false }, at);
  };

  /**
   * Lùi ra khỏi chi tiết: ngược với laoVao, ở đầu cảnh sau — `vat` kín khung lúc `at`, máy lùi về toàn cảnh trong `dur`.
   */
  RS.lui = function (tl, cam, vat, at, dur, opts) {
    var o = opts || {};
    cam = $(cam); vat = $(vat);
    var r = rectIn(cam, vat), s = Math.max(1080 / r.w, 1920 / r.h) * (o.du || 1.04);
    var cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    tl.fromTo(cam, { x: 540 - s * cx, y: 960 - s * cy, scale: s, transformOrigin: "0px 0px" },
      { x: 0, y: 0, scale: 1, transformOrigin: "0px 0px", duration: dur, ease: o.ease || "power3.out" }, at);
  };

  /**
   * Vật thoát khỏi khung: `vat` (đặt phía trước khung, ban đầu nằm gọn trong khung) bước ra ngoài, to dần về phía máy,
   * có bóng đổ lên khung; nội dung trong `khung` tối đi khi vật rời. opts { x, y (px dịch), scale, dur, mo (độ tối khung) }.
   */
  RS.thoatKhung = function (tl, khung, vat, at, opts) {
    var o = opts || {}, dur = o.dur || 0.7;
    khung = $(khung); vat = $(vat);
    var bong = div("cs-bong", vat.parentNode, { left: vat.offsetLeft + "px", top: vat.offsetTop + "px", width: vat.offsetWidth + "px", height: vat.offsetHeight + "px" });
    vat.parentNode.insertBefore(bong, vat);
    tl.fromTo(vat, { x: 0, y: 0, scale: 1 }, { x: o.x || 0, y: o.y == null ? -260 : o.y, scale: o.scale || 1.35, duration: dur, ease: "power3.out" }, at);
    tl.fromTo(bong, { x: 0, y: 0, opacity: 0 }, { x: (o.x || 0) * 0.6 + 40, y: (o.y == null ? -260 : o.y) * 0.6 + 70, opacity: 0.8, duration: dur, ease: "power3.out" }, at);
    if (khung) tl.fromTo(khung, { filter: "brightness(1)" }, { filter: "brightness(" + (o.mo == null ? 0.7 : o.mo) + ")", duration: dur, ease: "power2.out" }, at);
  };

  /** Hình vật lướt (SVG, ô 1000×2400): tối, có viền sáng một bên để đọc ra là người / cột / lá chứ không phải khối đen. */
  var LUOT = {
    nguoi: { w: 820, svg: '<path class="t1" d="M60 2400 Q60 1300 330 1130 Q420 1080 500 1080 Q580 1080 670 1130 Q940 1300 940 2400 Z"/>' +
      '<rect class="t1" x="420" y="900" width="160" height="240" rx="60"/><ellipse class="t1" cx="500" cy="700" rx="230" ry="280"/>' +
      '<path class="rim" d="M712 610 Q760 760 690 930 M690 1150 Q920 1290 935 1700"/>' },
    cot: { w: 460, svg: '<rect class="t1" x="200" y="0" width="600" height="2400"/><path class="rim" d="M790 0 V2400"/>' },
    la: { w: 980, svg: '<ellipse class="la" cx="420" cy="1100" rx="300" ry="900" transform="rotate(-18 420 1100)"/><ellipse class="la2" cx="640" cy="1300" rx="260" ry="820" transform="rotate(16 640 1300)"/>' +
      '<path class="rim" d="M860 700 Q930 1200 820 1900"/>' },
  };

  /**
   * Vật lướt sát ống kính che cú cắt, kèm cú lia máy: kieu = nguoi | cot | la. Vật che kín giữa khung đúng lúc `at` (đặt cú cắt
   * cảnh ở `at`), lướt qua trong `dur` giây (mặc định 0.4). Máy lia theo vật: cảnh trước (`truoc`, selector/phần tử, thường là
   * lớp .cam và chữ của cảnh) bị kéo ngược chiều và nhoè từ `at - lead`, cảnh sau (`sau`) trượt vào và nét lại tới `at + lead`
   * (lead mặc định 0.4 = một phách ở 150 BPM: đặt `at - lead` và `at + lead` lên phách). opts { tu: "trai" | "phai", dur, lead,
   * truoc, sau, lia (px, mặc định 100) }. Không có `truoc`/`sau` thì chỉ có vật lướt (dễ thành một khối đen trơ trọi).
   */
  RS.vatLuot = function (tl, root, kieu, at, opts) {
    var o = opts || {}, dur = o.dur || 0.4, lead = o.lead || 0.4, lia = o.lia == null ? 100 : o.lia;
    var shape = LUOT[kieu];
    if (!shape) throw new Error('Không có vật lướt "' + kieu + '". Có: ' + Object.keys(LUOT).join(", "));
    root = $(root) || rootOf();
    var el = addTop(root, div("cs-luot " + kieu, null, { width: shape.w + "px" }));
    el.innerHTML = '<svg xmlns="' + NS + '" viewBox="0 0 1000 2400" preserveAspectRatio="none" aria-hidden="true">' + shape.svg + "</svg>";
    var left = o.tu !== "phai", dir = left ? 1 : -1;
    var start = left ? -shape.w - 60 : 1140, end = left ? 1140 : -shape.w - 60;
    tl.set(el, { opacity: 0 }, 0);
    tl.fromTo(el, { x: start, opacity: 1 }, { x: end, duration: dur, ease: "none", immediateRender: false }, at - dur / 2);
    tl.set(el, { opacity: 0 }, at + dur / 2);
    // Phóng nhẹ đúng bằng độ lia để mép khung không lộ nền khi cảnh bị kéo đi
    var z = 1 + (2 * lia + 20) / 1080;
    if (o.truoc) tl.fromTo(o.truoc, { x: 0, scale: 1, filter: "blur(0px)", transformOrigin: "50% 50%" }, { x: -dir * lia, scale: z, filter: "blur(10px)", duration: lead, ease: "power2.in", immediateRender: false }, at - lead);
    if (o.sau) tl.fromTo(o.sau, { x: dir * lia, scale: z, filter: "blur(10px)", transformOrigin: "50% 50%" }, { x: 0, scale: 1, filter: "blur(0px)", duration: lead, ease: "power2.out", immediateRender: false }, at);
    return el;
  };

  /**
   * Màu tràn: màu `mau` (vd. "var(--prop-alarm)") nở tròn từ điểm (x, y) kín khung lúc `at`, rồi rút về điểm đó để lộ cảnh sau
   * trong `rut` giây (0 = tắt ngay sau `at`, cảnh sau mở bằng nền cùng màu). opts { x, y, dur, rut }.
   */
  RS.tranMau = function (tl, root, mau, at, opts) {
    var o = opts || {}, x = o.x == null ? 540 : o.x, y = o.y == null ? 960 : o.y, dur = o.dur || 0.45;
    root = $(root) || rootOf();
    var el = addTop(root, div("cs-tran", null, { background: mau }));
    var full = Math.ceil(Math.hypot(Math.max(x, 1080 - x), Math.max(y, 1920 - y))) + 20;
    tl.set(el, { clipPath: "circle(0px at " + x + "px " + y + "px)" }, 0);
    tl.fromTo(el, { clipPath: "circle(0px at " + x + "px " + y + "px)" }, { clipPath: "circle(" + full + "px at " + x + "px " + y + "px)", duration: dur, ease: "power3.in", immediateRender: false }, at - dur);
    if (o.rut !== 0) tl.to(el, { clipPath: "circle(0px at " + x + "px " + y + "px)", duration: o.rut || 0.45, ease: "power3.out" }, at);
    else tl.set(el, { opacity: 0 }, at + 0.04);
    return el;
  };
})();
