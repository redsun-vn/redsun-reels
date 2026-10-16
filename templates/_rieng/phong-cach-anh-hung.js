/*
 * Ngữ pháp phim siêu anh hùng cho video dựng riêng (docs/decisions.md §43): biến hình, góc máy thấp, tia năng lượng (tuyệt chiêu),
 * kẻ phản diện có hào quang, kẻ xấu vỡ tan. Nạp sau phong-cach-nhan-vat.js (biến hình dùng đồ của RS.anhHung), kèm phong-cach.css.
 * Không tạo chữ (mảnh vỡ là bản sao của vật đã có trong HTML). Mọi chuyển động gắn vào `tl` theo giây tuyệt đối.
 * Cách dùng: .claude/skills/dung-video/references/phong-cach-hinh.md mục 5.
 */
(function () {
  var RS = window.RS;

  function $(el) { return typeof el === "string" ? document.querySelector(el) : el; }
  function div(cls, parent, style) {
    var d = document.createElement("div");
    d.className = cls;
    d.setAttribute("data-layout-ignore", "");
    if (style) Object.keys(style).forEach(function (k) { d.style[k] = style[k]; });
    if (parent) parent.appendChild(d);
    return d;
  }

  /**
   * Biến hình lúc `at` (~1 giây): chớp sáng sau lưng, nhân vật xoay hai vòng, mặt nạ → áo choàng → logo ngực hiện lần lượt, sao bung.
   * `p` phải đã mặc đồ bằng RS.anhHung (hàm ẩn đồ tới lúc biến hình). opts { sang: phần tử chứa chớp sáng (mặc định khung của p) }.
   */
  RS.bienHinh = function (tl, p, at, opts) {
    var o = opts || {}, host = p.parentNode, F = 1 / 30;
    var cape = p.querySelector(".pc-cape-g"), mask = p.querySelector(".pc-mat-na"), logo = p.querySelector(".pc-bieu-tuong");
    if (!cape && !mask && !logo) throw new Error("RS.bienHinh: nhân vật chưa có đồ siêu anh hùng (gọi RS.anhHung trước).");
    var sang = div("rs-bien-hinh-sang", $(o.sang) || host.parentNode);
    sang.style.opacity = 0;
    var w = p.offsetWidth || 520;
    sang.style.left = host.offsetLeft + w / 2 - 600 + "px";
    sang.style.top = host.offsetTop + w * 0.7 - 600 + "px";
    tl.fromTo(sang, { scale: 0.2, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.7, ease: "power2.out", immediateRender: false }, at);
    tl.set(sang, { opacity: 0 }, at + 0.7);
    // Xoay hai vòng (lật ngang), dừng lại đúng nhịp
    tl.fromTo(p, { scaleX: 1, transformOrigin: "50% 50%" }, { scaleX: 0, duration: 0.11, ease: "power1.in", repeat: 3, yoyo: true, immediateRender: false }, at);
    tl.set(p, { scaleX: 1 }, at + 0.44 + F);
    [[mask, 0.18], [cape, 0.3], [logo, 0.48]].forEach(function (x) {
      if (!x[0]) return;
      tl.fromTo(x[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001, immediateRender: true }, at + x[1]);
    });
    if (cape) tl.fromTo(cape, { scaleY: 0.1, svgOrigin: "300 520" }, { scaleY: 1, svgOrigin: "300 520", duration: 0.3, ease: "back.out(2)", immediateRender: false }, at + 0.3);
    if (logo) tl.fromTo(logo, { scale: 0 }, { scale: 1, duration: 0.25, ease: "back.out(3)", immediateRender: false }, at + 0.48);
    RS.burst(tl, host.parentNode, "sao", { x: host.offsetLeft + w / 2, y: host.offsetTop + w * 0.7, count: 18, spread: 520, rise: -80, at: at + 0.45, dur: 0.9, seed: 83 });
  };

  /**
   * Góc máy thấp tôn người hùng: lớp máy `el` (riêng, không lớp đang RS.truotLech) ngửa `goc` độ quanh đáy khung và phóng `phong`
   * trong `dur` giây từ `at`; nhân vật trông cao lớn hơn. opts { goc: 10, phong: 1.2 (≥ 1.18 để không lộ mép), ve: giây trở lại góc thường (bỏ trống = giữ) }.
   */
  RS.gocThap = function (tl, el, at, dur, opts) {
    var o = opts || {};
    el = $(el);
    // Xoay quanh 70% chiều cao và phóng đủ để mép trên không lộ nền phía sau
    tl.fromTo(el, { rotationX: 0, scale: 1, transformPerspective: 1400, transformOrigin: "50% 70%" },
      { rotationX: o.goc == null ? 10 : o.goc, scale: o.phong || 1.2, transformPerspective: 1400, transformOrigin: "50% 70%", duration: dur, ease: "power2.out", immediateRender: false }, at);
    if (o.ve) tl.to(el, { rotationX: 0, scale: 1, duration: 0.4, ease: "power2.inOut" }, o.ve);
  };

  /**
   * Tia năng lượng (tuyệt chiêu) từ `tu` [x, y] tới `den` [x, y] (toạ độ trong `parent`): tụ sáng 0.2 giây trước `at`, tia phóng ra lúc `at`,
   * nổ sáng + tia lửa ở đích, tắt sau `dur` giây. opts { day (độ dày, 46), seed }.
   */
  RS.tiaNangLuong = function (tl, parent, tu, den, at, dur, opts) {
    var o = opts || {};
    parent = $(parent);
    var dx = den[0] - tu[0], dy = den[1] - tu[1], len = Math.hypot(dx, dy), day = o.day || 46;
    var tu_ = div("rs-nl-tu", parent, { left: tu[0] - 70 + "px", top: tu[1] - 70 + "px" });
    var tia = div("rs-tia-nl", parent, { left: tu[0] + "px", top: tu[1] - day / 2 + "px", width: len + "px", height: day + "px" });
    tia.style.transform = "rotate(" + Math.atan2(dy, dx) * (180 / Math.PI) + "deg)";
    var no = div("rs-nl-no", parent, { left: den[0] - 160 + "px", top: den[1] - 160 + "px" });
    [tu_, tia, no].forEach(function (e) { e.style.opacity = 0; });
    tl.fromTo(tu_, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.in", immediateRender: false }, at - 0.2);
    tl.fromTo(tia, { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.1, ease: "power4.out", immediateRender: false }, at);
    tl.fromTo(no, { scale: 0.2, opacity: 1 }, { scale: 1.3, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, at + 0.08);
    tl.to([tu_, tia], { opacity: 0, duration: 0.15, ease: "power2.in" }, at + Math.max(0.15, dur - 0.15));
    RS.burst(tl, parent, "sao", { x: den[0], y: den[1], count: 12, spread: 260, rise: 0, at: at + 0.08, dur: 0.6, seed: o.seed || 91 });
  };

  /** Hào quang kẻ phản diện quanh vật `el` (vd. tấm ảnh chuyển khoản giả) suốt [from, to]: quầng tím–xanh độc đập như tim. */
  RS.phanDien = function (tl, el, from, to) {
    el = $(el);
    var r = el.getBoundingClientRect(), pr = el.parentNode.getBoundingClientRect();
    var aura = div("rs-phan-dien", null, { left: r.left - pr.left - 120 + "px", top: r.top - pr.top - 120 + "px", width: r.width + 240 + "px", height: r.height + 240 + "px" });
    el.parentNode.insertBefore(aura, el);
    aura.style.opacity = 0;
    var n = Math.max(1, Math.floor((to - from) / 0.55));
    tl.fromTo(aura, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1.04, duration: 0.275, yoyo: true, repeat: n * 2 - 1, ease: "sine.inOut", immediateRender: false }, from);
    tl.set(aura, { opacity: 0 }, to);
    return aura;
  };

  /**
   * Kẻ xấu vỡ tan lúc `at`: vật `el` (đặt absolute) tách thành `so` mảnh văng ra, xoay, mờ dần trong `dur` giây.
   * Mảnh là bản sao của chính vật (bỏ id). Vật cần phóng thu thì phóng bằng gsap.set (transform inline), không bằng lớp CSS. opts { so: 9, dur: 0.75, seed }.
   */
  RS.vo = function (tl, el, at, opts) {
    var o = opts || {}, r = RS.rng(o.seed || 17), n = o.so || 9, dur = o.dur || 0.75;
    el = $(el);
    var w = el.offsetWidth, h = el.offsetHeight, cx = w / 2, cy = h / 2;
    var wrap = div("rs-manh-khung", null, { left: el.offsetLeft + "px", top: el.offsetTop + "px", width: w + "px", height: h + "px", transform: el.style.transform, transformOrigin: el.style.transformOrigin });
    el.parentNode.insertBefore(wrap, el.nextSibling);
    var R = Math.hypot(w, h);
    for (var i = 0; i < n; i++) {
      var a0 = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.3, a1 = ((i + 1) / n) * Math.PI * 2 + (r() - 0.5) * 0.3, am = (a0 + a1) / 2;
      var ox = cx + (r() - 0.5) * w * 0.2, oy = cy + (r() - 0.5) * h * 0.2;
      var shard = div("rs-manh", wrap, { width: w + "px", height: h + "px" });
      shard.style.clipPath = "polygon(" + ox + "px " + oy + "px, " + (cx + Math.cos(a0) * R) + "px " + (cy + Math.sin(a0) * R) + "px, " + (cx + Math.cos(a1) * R) + "px " + (cy + Math.sin(a1) * R) + "px)";
      var copy = el.cloneNode(true);
      copy.removeAttribute("id");
      copy.querySelectorAll("[id]").forEach(function (x) { x.removeAttribute("id"); });
      copy.style.left = "0px"; copy.style.top = "0px"; copy.style.transform = "none";
      shard.appendChild(copy);
      var d = 260 + r() * 360;
      tl.fromTo(shard, { autoAlpha: 0, x: 0, y: 0, rotation: 0 }, { autoAlpha: 1, duration: 0.001, immediateRender: true }, at);
      tl.to(shard, { x: Math.cos(am) * d, y: Math.sin(am) * d + 160, rotation: (r() - 0.5) * 120, opacity: 0, duration: dur, ease: "power2.out" }, at + 0.01);
    }
    tl.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.001, immediateRender: false }, at);
    return wrap;
  };
})();
