/*
 * kit-core.js — hàm nền dùng chung cho scene-kit: tạo phần tử, clip có timing, tự co cỡ chữ, tách từ,
 * hiệu ứng hiện chữ theo preset phong cách, ảnh/video. Không dùng Math.random/Date.now (render xác định).
 * Text luôn gán bằng textContent (không innerHTML).
 */
(function () {
  "use strict";

  var W = 1080;
  var H = 1920;
  var ACCENT_RE = /[0-9%]|^(SIPOS|REDSUN|BOS|Webino|POS|AI)[.,!?:]*$/i;
  var VIDEO_RE = /\.(mp4|mov|webm)$/i;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function round(n) {
    return Math.round(n * 1000) / 1000;
  }

  function clip(e, start, duration, track) {
    e.classList.add("clip");
    e.dataset.start = String(round(start));
    e.dataset.duration = String(round(duration));
    e.dataset.trackIndex = String(track);
    return e;
  }

  /*
   * Số giả ngẫu nhiên xác định theo chỉ số (confetti, hạt, vị trí trang trí…): cùng i + cùng hạt giống của video
   * luôn ra cùng giá trị. Hạt giống (props.seed, tính từ nội dung kịch bản) làm mỗi video một bố trí khác nhau.
   */
  var seed = 0;
  function setSeed(s) {
    seed = Number(s) || 0;
  }
  function hash01(i) {
    var x = Math.sin((i + seed * 0.618) * 127.1 + 311.7 + seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  /*
   * Tự giảm cỡ chữ khi chữ dài, để không tràn vùng (Nam 2026-10-08: "nếu tràn thì nên giảm size chữ").
   * Ước lượng số dòng theo số ký tự × độ rộng ký tự trung bình của Montserrat đậm (~0.6em), chọn cỡ lớn nhất
   * trong thang của brand.css mà khối chữ vừa chiều cao vùng. Không đo DOM khi tween → render vẫn xác định.
   */
  var CHAR_EM = 0.6;
  var SIZE_STEPS = ["--type-hero", "--type-h1", "--type-h2", "--type-h3", "--type-body"];
  var SUB_STEPS = ["--type-body", "--type-caption", "--type-small"];

  function cssPx(name) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
  }

  function linesFor(text, sizePx, widthPx) {
    var perLine = Math.max(1, Math.floor(widthPx / (sizePx * CHAR_EM)));
    var parts = String(text).split(/\s+/).filter(Boolean);
    var lines = 1;
    var used = 0;
    parts.forEach(function (w) {
      var len = w.length + (used ? 1 : 0);
      if (used + len > perLine && used > 0) {
        lines++;
        used = w.length;
      } else used += len;
    });
    return lines;
  }

  function fitSizes(main, sub, maxHeight, startStep, maxLines, widthPx) {
    var width = widthPx || cssPx("--canvas-width") - cssPx("--safe-left") - cssPx("--safe-right");
    var lhMain = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--line-tight")) || 1.25;
    var lhSub = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--line-normal")) || 1.45;
    var gap = cssPx("--space-sm");
    for (var i = startStep; i < SIZE_STEPS.length; i++) {
      var m = cssPx(SIZE_STEPS[i]);
      var subVar = SUB_STEPS[Math.min(Math.max(i - 2, 0), SUB_STEPS.length - 1)];
      var sz = cssPx(subVar);
      var mainLines = linesFor(main, m, width);
      var h = mainLines * m * lhMain + (sub ? gap + linesFor(sub, sz, width) * sz * lhSub : 0);
      if ((h <= maxHeight && mainLines <= maxLines) || i === SIZE_STEPS.length - 1) return { main: "var(" + SIZE_STEPS[i] + ")", sub: "var(" + subVar + ")" };
    }
  }

  /* Tách chữ thành từng từ để chạy hiệu ứng; từ có số, %, tên sản phẩm được nhấn màu. */
  function words(container, text) {
    var spans = [];
    var parts = String(text).split(/\s+/).filter(Boolean);
    parts.forEach(function (w, i) {
      var s = el("span", "kit-word" + (ACCENT_RE.test(w) ? " kit-accent" : ""), container);
      s.textContent = w + (i < parts.length - 1 ? " " : "");
      spans.push(s);
    });
    return spans;
  }

  /*
   * Hiện chữ theo preset:
   * rise (trồi lên), slam (dập), pop (bật vượt cỡ 0 → 1.15 → 1, kiểu hanazi), blur (mờ → nét, chậm),
   * type (đánh máy: từng từ hiện tức thì theo nhịp), track (giãn chữ → khít).
   */
  /* Thời gian hiệu ứng vào của một khối chữ (khớp textEnter). */
  function textEnterSec(count, style) {
    var t = style.text;
    var stagger = Math.min(t.wordStagger, 0.5 / Math.max(count, 1));
    return Math.max(0, count - 1) * stagger + t.duration;
  }

  function textEnter(tl, spans, style, at) {
    var t = style.text;
    var stagger = Math.min(t.wordStagger, 0.5 / Math.max(spans.length, 1));
    spans.forEach(function (s, i) {
      var when = at + i * stagger;
      if (t.enter === "slam") {
        tl.fromTo(s, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: t.duration, ease: t.ease }, when);
      } else if (t.enter === "pop") {
        tl.fromTo(s, { opacity: 0, scale: 0.4, y: 30, rotation: -6 }, { opacity: 1, scale: 1.15, y: 0, rotation: 0, duration: t.duration * 0.65, ease: t.ease }, when);
        tl.to(s, { scale: 1, duration: t.duration * 0.35, ease: "sine.out" }, when + t.duration * 0.65);
      } else if (t.enter === "blur") {
        tl.fromTo(s, { opacity: 0, y: 8, filter: "blur(14px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: t.duration, ease: t.ease }, when);
      } else if (t.enter === "type") {
        tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.01, ease: "none" }, when);
      } else if (t.enter === "track") {
        tl.fromTo(s, { opacity: 0, letterSpacing: "0.35em" }, { opacity: 1, letterSpacing: "0em", duration: t.duration, ease: t.ease }, when);
      } else {
        tl.fromTo(s, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: t.duration, ease: t.ease }, when);
      }
    });
  }

  /* Ảnh nằm trong cảnh. */
  function image(parent, src, cls) {
    var m = el("img", cls, parent);
    m.src = src;
    m.alt = "";
    return m;
  }

  /*
   * Video (quay màn hình, clip) phải là clip có timing riêng và KHÔNG được nằm trong phần tử có timing
   * (hyperframes-core: video_nested_in_timed_element; video không timing thì đứng hình). Vì vậy video là con
   * trực tiếp của root, chèn ngay TRƯỚC cảnh của nó để chữ/khung phone của cảnh luôn nằm trên.
   * Video luôn tắt tiếng; tiếng gốc (nếu giữ) là một <audio> riêng (clipAudio) để hình được kéo dài qua
   * chuyển cảnh mà tiếng không kéo theo (J/L cut, hyperframes-core creator-editing-recipes).
   */
  var mediaSeq = 0;

  function videoClip(root, scene, src, cls, start, duration, track, mediaStart) {
    var v = document.createElement("video");
    v.id = "kit-v-" + ++mediaSeq; // media cần id (lint media_missing_id; mixer bỏ qua media không id)
    v.className = cls;
    v.src = src;
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    if (mediaStart) v.dataset.mediaStart = String(round(mediaStart));
    root.insertBefore(v, scene);
    return clip(v, start, duration, track);
  }

  /* Tiếng gốc của clip người nói: đúng đoạn của cảnh, không kéo qua chuyển cảnh. Track 15 dành riêng. */
  function clipAudio(root, src, start, duration, mediaStart) {
    var a = document.createElement("audio");
    a.id = "kit-a-" + ++mediaSeq;
    a.src = src;
    a.dataset.volume = "1";
    if (mediaStart) a.dataset.mediaStart = String(round(mediaStart));
    root.appendChild(a);
    clip(a, start, duration, 15);
    a.classList.remove("clip"); // hyperframes-core: media không mang class "clip"
    return a;
  }

  /*
   * Ảnh hoặc video (theo đuôi file). Ảnh nằm trong `parent`; video là con của root, chèn trước `scene`.
   * Video được ghi vào danh sách để chuyển cảnh kéo theo. `timing` (tuỳ chọn) thay mốc mặc định của cảnh:
   * { start, duration, mediaStart } — dùng cho đoạn clip kéo qua nhiều cảnh.
   */
  function media(ctx, parent, scene, src, cls, sc, videoList, timing) {
    if (VIDEO_RE.test(src)) {
      var t = timing || { start: sc.start, duration: sc.duration + ctx.tail(sc) };
      var v = videoClip(ctx.root, scene, src, cls, t.start, t.duration, 6, t.mediaStart);
      videoList.push(v);
      return v;
    }
    return image(parent, src, cls);
  }

  window.RedsunKitCore = {
    W: W,
    H: H,
    VIDEO_RE: VIDEO_RE,
    el: el,
    clip: clip,
    round: round,
    hash01: hash01,
    setSeed: setSeed,
    cssPx: cssPx,
    fitSizes: fitSizes,
    words: words,
    textEnter: textEnter,
    textEnterSec: textEnterSec,
    ACCENT_RE: ACCENT_RE,
    image: image,
    videoClip: videoClip,
    clipAudio: clipAudio,
    media: media,
  };
})();
