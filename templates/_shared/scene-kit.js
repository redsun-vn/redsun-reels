/*
 * scene-kit.js — bộ khối dùng chung cho mọi template redsun-reels.
 *
 * Template tạo một timeline GSAP paused, gọi RedsunKit.build({ template, tl }) rồi tự đăng ký
 * window.__timelines["main"] = tl (để hyperframes lint thấy được). Kit đọc biến `props` (chuỗi JSON do
 * scripts/build.ts sinh) và dựng mọi phần tử thành clip có timing (REQUIREMENTS §6.4).
 *
 * Quy tắc chuyển động theo /hyperframes:hyperframes-animation:
 * - chỉ một timeline paused, dùng fromTo, không Math.random/Date.now;
 * - chuyển cảnh: cảnh cũ và cảnh mới chuyển động CÙNG LÚC tại mốc T (cảnh cũ được kéo dài thêm thời lượng
 *   chuyển cảnh để còn hiện trong lúc đó);
 * - không animation thoát, trừ cảnh cuối.
 * Text luôn gán bằng textContent (không innerHTML).
 */
(function () {
  "use strict";

  var W = 1080;
  var H = 1920;
  var ACCENT_RE = /[0-9%]|^(SIPOS|REDSUN|BOS|Webino|POS|AI)[.,!?:]*$/i;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function clip(e, start, duration, track) {
    e.classList.add("clip");
    e.dataset.start = String(round(start));
    e.dataset.duration = String(round(duration));
    e.dataset.trackIndex = String(track);
    return e;
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
    var words = String(text).split(/\s+/).filter(Boolean);
    var lines = 1;
    var used = 0;
    words.forEach(function (w) {
      var len = w.length + (used ? 1 : 0);
      if (used + len > perLine && used > 0) {
        lines++;
        used = w.length;
      } else used += len;
    });
    return lines;
  }

  function fitSizes(main, sub, maxHeight, startStep, maxLines) {
    var width = cssPx("--canvas-width") - cssPx("--safe-left") - cssPx("--safe-right");
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

  function round(n) {
    return Math.round(n * 1000) / 1000;
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

  function textEnter(tl, spans, style, at) {
    var t = style.text;
    var from, to;
    if (t.enter === "slam") {
      from = { opacity: 0, scale: 1.6, y: 0 };
      to = { opacity: 1, scale: 1, y: 0 };
    } else if (t.enter === "pop") {
      from = { opacity: 0, scale: 0.4, y: 30, rotation: -6 };
      to = { opacity: 1, scale: 1, y: 0, rotation: 0 };
    } else {
      from = { opacity: 0, y: 48 };
      to = { opacity: 1, y: 0 };
    }
    var stagger = Math.min(t.wordStagger, 0.5 / Math.max(spans.length, 1));
    spans.forEach(function (s, i) {
      tl.fromTo(s, from, Object.assign({ duration: t.duration, ease: t.ease }, to), at + i * stagger);
    });
  }

  /* Video đi kèm cảnh: theo cùng chuyển động tịnh tiến (push); với zoom/blur thì mờ dần đồng bộ. */
  function transitionVideos(tl, outV, inV, style, T) {
    var tr = style.transition;
    var d = tr.duration;
    if (tr.type === "vertical-push") {
      if (outV.length) tl.to(outV, { y: "-=" + H, duration: d, ease: tr.ease }, T);
      if (inV.length) tl.fromTo(inV, { y: H }, { y: 0, duration: d, ease: tr.ease }, T);
    } else if (tr.type === "elastic-push") {
      if (outV.length) tl.to(outV, { x: -W, duration: d * 0.9, ease: "power3.in" }, T);
      if (inV.length) tl.fromTo(inV, { x: W }, { x: 0, duration: d * 1.1, ease: tr.ease }, T + d * 0.1);
    } else {
      if (outV.length) tl.to(outV, { opacity: 0, duration: d, ease: "sine.inOut" }, T);
      if (inV.length) tl.fromTo(inV, { opacity: 0 }, { opacity: 1, duration: d, ease: "sine.inOut" }, T + d * 0.3);
    }
  }

  function transition(tl, outgoing, incoming, style, T) {
    var tr = style.transition;
    var d = tr.duration;
    if (tr.type === "zoom-through") {
      tl.to(outgoing, { scale: 2.2, opacity: 0, filter: "blur(8px)", duration: d, ease: "power3.in" }, T);
      tl.fromTo(incoming, { scale: 0.6, opacity: 0, filter: "blur(8px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: d, ease: "power3.out" }, T + d * 0.3);
    } else if (tr.type === "elastic-push") {
      tl.to(outgoing, { x: -W, duration: d * 0.9, ease: "power3.in" }, T);
      tl.fromTo(incoming, { x: W, opacity: 1 }, { x: 30, opacity: 1, duration: d * 0.8, ease: tr.ease }, T + d * 0.1);
      tl.to(incoming, { x: -15, duration: d * 0.3, ease: "sine.inOut" }, T + d * 0.9);
      tl.to(incoming, { x: 0, duration: d * 0.2, ease: "sine.out" }, T + d * 1.2);
    } else if (tr.type === "blur-crossfade") {
      tl.to(outgoing, { opacity: 0, filter: "blur(10px)", duration: d, ease: "sine.inOut" }, T);
      tl.fromTo(incoming, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: d, ease: "sine.inOut" }, T);
    } else {
      tl.to(outgoing, { y: -H, duration: d, ease: tr.ease }, T);
      tl.fromTo(incoming, { y: H, opacity: 1 }, { y: 0, opacity: 1, duration: d, ease: tr.ease }, T);
    }
  }

  /* Chiều cao tối đa của khối chữ theo vùng (px trên canvas 1080×1920), đã trừ nhãn/số bước. */
  function zoneHeight(position, opts) {
    var full = cssPx("--canvas-height") - cssPx("--safe-top") - cssPx("--safe-bottom");
    var extras = (opts.tag ? 80 : 0) + (opts.step ? 150 : 0);
    if (position === "top") return 330 - extras; // từ safe-top+120 đến đỉnh phone mockup (720px)
    if (position === "bottom") return full * 0.5 - extras;
    return full - 120 - extras;
  }

  function textBlock(scene, sc, position, opts) {
    var block = el("div", "kit-text-block " + position, scene);
    if (opts.tag) el("div", "kit-tag", block).textContent = opts.tag;
    if (opts.step) el("div", "kit-step", block).textContent = String(opts.step);
    var main = el("div", "kit-main" + (sc.role === "hook" ? " hook" : "") + (opts.small ? " small" : ""), block);
    var spans = words(main, sc.text);
    var sub = null;
    if (sc.sub) {
      sub = el("div", "kit-sub", block);
      sub.textContent = sc.sub;
    }
    var maxLines = sc.role === "hook" ? 3 : position === "center" ? 4 : 3;
    var fit = fitSizes(sc.text, sc.sub, zoneHeight(position, opts), sc.role === "hook" ? 0 : opts.small ? 2 : 1, maxLines);
    main.style.fontSize = fit.main;
    if (sub) sub.style.fontSize = fit.sub;
    return { block: block, spans: spans, sub: sub, extras: Array.prototype.slice.call(block.querySelectorAll(".kit-tag, .kit-step")) };
  }

  var VIDEO_RE = /\.(mp4|mov|webm)$/i;

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
   */
  function videoClip(root, scene, src, cls, start, duration, track) {
    var v = document.createElement("video");
    v.className = cls;
    v.src = src;
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    root.insertBefore(v, scene);
    return clip(v, start, duration, track);
  }

  function build(options) {
    var vars = window.__hyperframes.getVariables();
    var p = JSON.parse(vars.props);
    var style = p.style;
    var template = options.template;
    var root = document.getElementById("root");
    root.dataset.product = p.product;
    root.classList.add("accent-" + style.accent);
    if (vars.debugSafeZone) root.classList.add("debug-safe-zone");

    var tl = options.tl;
    var scenes = p.scenes;
    var last = scenes[scenes.length - 1];
    var total = last.start + last.duration;
    var T = style.transition.duration;

    clip(el("div", "kit-bg", root), 0, total, 0);

    var ctaStart = last.role === "cta" ? last.start : total;
    var bug = clip(el("img", "kit-logo-bug", root), 0, ctaStart, 1);
    bug.src = p.logoOnDark;
    bug.alt = "";

    var stepNo = 0;
    var containers = [];
    var videos = scenes.map(function () {
      return [];
    });
    scenes.forEach(function (sc, i) {
      var isLast = i === scenes.length - 1;
      var scene = clip(el("div", "kit-scene", root), sc.start, sc.duration + (isLast ? 0 : T), 2 + (i % 2));
      scene.id = "scene-" + sc.id;
      // Cảnh cũ và mới cùng hiện trong lúc chuyển cảnh: chồng lấn có chủ ý
      scene.setAttribute("data-layout-allow-overlap", "");
      containers.push(scene);
      var enterAt = i === 0 ? 0.1 : sc.start + T * 0.6;
      var v = sc.visual || { type: "text" };

      if (sc.role === "cta") {
        var cta = el("div", "kit-cta", scene);
        var logo = el("img", "kit-cta-logo", cta);
        logo.src = p.logoOnDark;
        logo.alt = "";
        var main = el("div", "kit-main", cta);
        var spans = words(main, sc.text);
        main.style.fontSize = fitSizes(sc.text, null, 300, 2, 2).main;
        tl.fromTo(logo, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, enterAt);
        textEnter(tl, spans, style, enterAt + 0.3);
        if (style.ctaPulse) tl.fromTo(main, { scale: 1 }, { scale: 1.06, duration: 0.35, ease: "sine.inOut", repeat: 3, yoyo: true }, enterAt + 1);
        return;
      }

      var opts = {};
      if (template === "TipOfTheDay" && sc.role === "hook" && p.hookTag) opts.tag = p.hookTag;
      if (template === "TipOfTheDay" && sc.role === "solution" && p.numberSteps) opts.step = ++stepNo;

      if ((v.type === "asset" || v.type === "split") && v.src) {
        var m = VIDEO_RE.test(v.src)
          ? videoClip(root, scene, v.src, "kit-media-full", sc.start, sc.duration + (isLast ? 0 : T), 6)
          : image(scene, v.src, "kit-media-full");
        if (m.tagName === "VIDEO") videos[i].push(m);
        el("div", "kit-dim", scene);
        tl.fromTo(m, { scale: 1 }, { scale: style.kenBurns, duration: sc.duration, ease: "none" }, sc.start);
        var tb = textBlock(scene, sc, "bottom", opts);
        textEnter(tl, tb.spans, style, enterAt);
        if (tb.sub) tl.fromTo(tb.sub, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, enterAt + 0.3);
      } else if (v.type === "phone" && v.src) {
        var tbp = textBlock(scene, sc, "top", Object.assign({ small: true }, opts));
        var phone = el("div", "kit-phone", scene);
        var phoneParts = [phone];
        var screenVideo = null;
        if (VIDEO_RE.test(v.src)) {
          phone.classList.add("has-video");
          screenVideo = videoClip(root, scene, v.src, "kit-phone-video", sc.start, sc.duration + (isLast ? 0 : T), 6);
          videos[i].push(screenVideo);
          phoneParts.push(screenVideo);
        } else image(phone, v.src, "");
        tl.fromTo(phoneParts, { y: 220, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, enterAt);
        textEnter(tl, tbp.spans, style, enterAt + 0.1);
        if (tbp.sub) tl.fromTo(tbp.sub, { opacity: 0 }, { opacity: 1, duration: 0.4 }, enterAt + 0.4);
        if (v.focus) {
          var c = el("div", "kit-callout", phone);
          c.style.left = v.focus.x + "%";
          c.style.top = v.focus.y + "%";
          tl.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }, enterAt + 0.8);
          tl.fromTo(c, { scale: 1 }, { scale: 1.25, duration: 0.4, ease: "sine.inOut", repeat: 3, yoyo: true }, enterAt + 1.2);
          // Zoom vào vùng cần chú ý: scale quanh điểm focus (transform-origin cố định lúc dựng, không đo DOM khi tween)
          phone.style.transformOrigin = v.focus.x + "% " + v.focus.y + "%";
          if (screenVideo) {
            // Cùng điểm focus, quy đổi sang hệ toạ độ màn hình video (phone 430×760, viền 18px — khớp kit.css)
            screenVideo.style.transformOrigin = (v.focus.x * 4.3 - 18) + "px " + (v.focus.y * 7.6 - 18) + "px";
          }
          tl.fromTo(phoneParts, { scale: 1 }, { scale: 1.18, duration: 0.8, ease: "power2.inOut" }, enterAt + 1.4);
        }
      } else {
        var tbt = textBlock(scene, sc, "center", opts);
        tbt.extras.forEach(function (x, k) {
          tl.fromTo(x, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, enterAt + k * 0.1);
        });
        textEnter(tl, tbt.spans, style, enterAt + (tbt.extras.length ? 0.2 : 0));
        if (tbt.sub) tl.fromTo(tbt.sub, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, enterAt + 0.4);
      }
    });

    for (var k = 0; k + 1 < containers.length; k++) {
      transition(tl, containers[k], containers[k + 1], style, scenes[k + 1].start);
      transitionVideos(tl, videos[k], videos[k + 1], style, scenes[k + 1].start);
    }
    // Cảnh cuối được phép thoát: mờ dần 0.4 giây cuối
    tl.to([containers[containers.length - 1]].concat(videos[videos.length - 1]), { opacity: 0, duration: 0.4, ease: "sine.in" }, total - 0.4);

    var music = document.getElementById("music");
    if (music) clip(music, 0, total, 9);
    var sz = document.getElementById("safe-zone");
    if (sz) clip(sz, 0, total, 8);

  }

  window.RedsunKit = { build: build };
})();
