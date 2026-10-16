/*
 * Thủ pháp trang truyện cho comic và manga (docs/decisions.md §43): lật trang, chibi (đầu to người nhỏ), cận mắt trong ô hẹp,
 * hắc khí, chớp trắng. Nạp sau phong-cach.js (và phong-cach-nhan-vat.js nếu dùng dấu cảm xúc), kèm phong-cach.css.
 * Không tạo chữ. Mọi chuyển động gắn vào `tl` theo giây tuyệt đối. Cách dùng: dung-video/references/phong-cach-hinh.md mục 5.
 */
(function () {
  var RS = window.RS;

  function $(el) { return typeof el === "string" ? document.querySelector(el) : el; }
  function div(cls, parent) {
    var d = document.createElement("div");
    d.className = cls;
    d.setAttribute("data-layout-ignore", "");
    if (parent) parent.appendChild(d);
    return d;
  }

  /**
   * Lật trang (comic): trang `el` (thường là cả cảnh mới) quay vào từ mép phải quanh gáy trái trong `dur` giây từ `at`, có bóng gáy.
   * Đặt ngay đầu cảnh mới, thay cho cắt thẳng.
   */
  RS.latTrang = function (tl, el, at, dur) {
    el = $(el);
    var d = dur || 0.45;
    var bong = div("rs-bong-trang", el);
    bong.style.opacity = 0;
    tl.fromTo(el, { rotationY: -100, transformPerspective: 2200, transformOrigin: "0% 50%" },
      { rotationY: 0, transformPerspective: 2200, transformOrigin: "0% 50%", duration: d, ease: "power2.out", immediateRender: false }, at);
    tl.fromTo(bong, { opacity: 0.85 }, { opacity: 0, duration: d, ease: "power1.in", immediateRender: false }, at);
  };

  /**
   * Chibi (manga): nhân vật `p` co người, phóng đầu (đầu to người nhỏ) và nảy lên lúc `at`; trở lại bình thường sau `dur` giây
   * (bỏ trống = giữ). Dùng cho phản ứng hài phóng đại; nên kèm RS.dauCamXuc.
   */
  RS.chibi = function (tl, p, at, dur) {
    var svg = p.querySelector("svg"), head = p._j.head;
    tl.fromTo(svg, { scale: 1, y: 0, transformOrigin: "50% 100%" }, { scale: 0.7, transformOrigin: "50% 100%", duration: 0.14, ease: "back.out(2)", immediateRender: false }, at);
    tl.fromTo(head, { scale: 1, svgOrigin: "300 500" }, { scale: 1.75, svgOrigin: "300 500", duration: 0.14, ease: "back.out(2)", immediateRender: false }, at);
    tl.fromTo(svg, { y: 0 }, { y: -40, duration: 0.12, yoyo: true, repeat: 3, ease: "power1.out", immediateRender: false }, at + 0.14);
    if (dur) {
      tl.to(svg, { scale: 1, y: 0, duration: 0.18, ease: "power2.inOut" }, at + dur);
      tl.to(head, { scale: 1, svgOrigin: "300 500", duration: 0.18, ease: "power2.inOut" }, at + dur);
    }
  };

  /**
   * Hắc khí (manga): quầng tối gợn như lửa đen quanh `el` suốt [from, to], báo trước cú lật; nên kèm chữ tượng thanh "ẦM ẦM".
   * Đổi nét mỗi 2 khung (như vẽ tay).
   */
  RS.hacKhi = function (tl, el, from, to) {
    el = $(el);
    var r = el.getBoundingClientRect(), pr = el.parentNode.getBoundingClientRect();
    var k = div("rs-hac-khi", null);
    k.style.left = r.left - pr.left - 160 + "px";
    k.style.top = r.top - pr.top - 160 + "px";
    k.style.width = r.width + 320 + "px";
    k.style.height = r.height + 320 + "px";
    k.style.opacity = 0;
    el.parentNode.insertBefore(k, el);
    tl.fromTo(k, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, from);
    for (var t = from, i = 0; t < to; t += 2 / 30, i++) tl.set(k, { rotation: (i % 3) * 4 - 4, scale: 1 + (i % 2) * 0.03 }, t);
    tl.to(k, { opacity: 0, duration: 0.15 }, to);
    return k;
  };

  /** Chớp trắng kín khung (cú lật manga) lúc `at`, `dur` giây; `el` bỏ trống = cả video. Không quá 3 lần/giây. */
  RS.chopTrang = function (tl, el, at, dur) {
    el = $(el) || document.querySelector("[data-composition-id]");
    var w = div("rs-chop-trang", el);
    w.style.opacity = 0;
    tl.fromTo(w, { opacity: 1 }, { opacity: 0, duration: dur || 0.35, ease: "power2.in", immediateRender: false }, at);
    return w;
  };
})();
