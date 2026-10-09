/*
 * scene-kit.js — dựng toàn bộ video từ biến `props` (chuỗi JSON do scripts/build.ts sinh).
 *
 * Template tạo một timeline GSAP paused, gọi RedsunKit.build({ template, tl }) rồi tự đăng ký
 * window.__timelines["main"] = tl (để hyperframes lint thấy được). Mọi phần tử là clip có timing (REQUIREMENTS §6.4).
 * Phụ thuộc: kit-core.js (chữ, ảnh/video), kit-motion.js (chuyển cảnh, lớp phủ), kit-blocks.js (khối theo template).
 *
 * Quy tắc chuyển động theo /hyperframes:hyperframes-animation:
 * - chỉ một timeline paused, dùng fromTo, không Math.random/Date.now;
 * - chuyển cảnh: cảnh cũ và cảnh mới chuyển động CÙNG LÚC tại mốc T (cảnh cũ được kéo dài thêm thời lượng
 *   chuyển cảnh để còn hiện trong lúc đó);
 * - không animation thoát, trừ cảnh cuối.
 */
(function () {
  "use strict";

  var K = window.RedsunKitCore;
  var E = window.RedsunKitEmphasis;
  var M = window.RedsunKitMotion;
  var B = window.RedsunKitBlocks;
  var WIPE_TAIL = 0.9;
  /* Hoạt cảnh mặc định ở cảnh hook theo dịp lễ, khi kịch bản chưa có motion.decor. */
  var OCCASION_DECOR = { "20-10": "flowers", "8-3": "flowers", "14-2": "hearts", tet: "confetti", "tet-duong-lich": "confetti", "giang-sinh": "stars", "trung-thu": "stars", "khai-truong": "confetti", "sinh-nhat-cong-ty": "confetti", "11-11": "coins", "black-friday": "coins" }; // wipe chạy 0.8s (kit-motion.js), cảnh trước phải còn hiện đủ lâu

  /* Chiều cao tối đa của khối chữ theo vùng (px trên canvas 1080×1920), đã trừ nhãn/số bước/lower third. */
  function zoneHeight(position, opts) {
    var full = K.cssPx("--canvas-height") - K.cssPx("--safe-top") - K.cssPx("--safe-bottom");
    var extras = (opts.tag ? 80 : 0) + (opts.step ? 150 : 0) + (opts.quote ? 220 : 0) + (opts.speaker ? 100 : 0);
    if (position === "top" && opts.promo) return 520 - extras; // khối promo nằm thấp (880px) để chữ chính đủ to
    if (position === "top") return 330 - extras; // từ safe-top+120 đến đỉnh phone mockup / khối promo (720px)
    if (position === "bottom") return full * 0.5 - extras;
    return full - 120 - extras;
  }

  /* Cỡ chữ cho bố cục xếp chồng (mỗi dòng một từ): cỡ lớn nhất mà đủ chiều cao vùng và từ dài nhất vừa chiều ngang. */
  var STACK_STEPS = ["--type-hero", "--type-h1", "--type-h2", "--type-h3", "--type-body"];
  function stackSize(text, zone) {
    var ws = E.plain(text).split(/\s+/).filter(Boolean);
    var longest = ws.reduce(function (m, w) {
      return Math.max(m, w.length);
    }, 1);
    var width = K.cssPx("--canvas-width") - K.cssPx("--safe-left") - K.cssPx("--safe-right");
    for (var i = 0; i < STACK_STEPS.length; i++) {
      var px = K.cssPx(STACK_STEPS[i]) * 1.12;
      if (ws.length * px * 1.25 <= zone && longest * px * 0.62 <= width) return "var(" + STACK_STEPS[i] + ")";
    }
    return "var(--type-body)";
  }

  function textBlock(scene, sc, position, opts) {
    // motion.layout (skill dao-dien-chuyen-dong): đổi bố cục để các video cùng loại không giống nhau
    var layout = (sc.motion && sc.motion.layout) || "left";
    if (position === "center" && layout === "bottom") position = "bottom";
    if (position !== "center" && (layout === "giant" || layout === "stack")) layout = "left"; // cảnh có ảnh / khối khác: chỉ đổi căn lề
    var block = K.el("div", "kit-text-block " + position + " layout-" + layout + (opts.quote ? " quote" : "") + (opts.promo ? " promo" : ""), scene);
    if (opts.tag) K.el("div", "kit-tag" + (opts.tagVariant ? " " + opts.tagVariant : ""), block).textContent = opts.tag;
    if (opts.step) K.el("div", "kit-step", block).textContent = String(opts.step);
    var main = K.el("div", "kit-main" + (sc.role === "hook" ? " hook" : "") + (opts.small ? " small" : ""), block);
    var w = E.words(main, sc.text);
    // Hook có đúng một cụm nhấn ngắn: cụm đó xuống dòng riêng, cỡ lớn (dòng "đinh" của câu mở đầu)
    if (sc.role === "hook" && w.groups.length === 1 && w.groups[0].textContent.length <= 16) w.groups[0].classList.add("hero");
    var sub = null;
    if (sc.sub) {
      sub = K.el("div", "kit-sub", block);
      sub.textContent = sc.sub;
    }
    var maxLines = layout === "giant" ? 5 : sc.role === "hook" ? 3 : position === "center" ? 4 : 3;
    var startStep = sc.role === "hook" || layout === "giant" ? 0 : opts.small || opts.quote ? 2 : 1;
    var fit = K.fitSizes(E.plain(sc.text), sc.sub, zoneHeight(position, opts), startStep, maxLines);
    main.style.fontSize = layout === "stack" ? stackSize(sc.text, zoneHeight(position, opts) - (sc.sub ? 160 : 0)) : fit.main;
    if (sub) sub.style.fontSize = fit.sub;
    return { sc: sc, block: block, spans: w.spans, groups: w.groups, sub: sub, extras: Array.prototype.slice.call(block.querySelectorAll(".kit-tag, .kit-step")) };
  }

  /* Hiện chữ chính + nhãn + dòng phụ của một khối. */
  function enterBlock(ctx, tb, at) {
    tb.extras.forEach(function (x, k) {
      ctx.tl.fromTo(x, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, at + k * 0.1);
    });
    var t0 = at + (tb.extras.length ? 0.2 : 0);
    var m = tb.sc.motion || {};
    // motion.enter của cảnh (skill dao-dien-chuyen-dong) ghi đè kiểu hiện chữ của phong cách
    var st = m.enter ? Object.assign({}, ctx.style, { text: Object.assign({}, ctx.style.text, { enter: m.enter }) }) : ctx.style;
    K.textEnter(ctx.tl, tb.spans, st, t0);
    if (tb.sub) ctx.tl.fromTo(tb.sub, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, at + 0.4);
    // Chữ hiện xong → nhịp nhấn cho cụm [nhấn]; cả khối tiến nhẹ vào như máy quay đẩy tới
    var end = tb.sc.start + tb.sc.duration;
    var emphAt = t0 + K.textEnterSec(tb.spans.length, st) + 0.05;
    E.emphasize(ctx, tb.groups, emphAt, end - 0.2, m.emphasis);
    var decorKind = m.decor || (tb.sc.role === "hook" ? OCCASION_DECOR[ctx.p.occasion] : null);
    var oy = tb.block.classList.contains("top") ? 30 : tb.block.classList.contains("bottom") ? 70 : 45;
    E.decor(ctx, tb.block.parentNode, decorKind, emphAt, end - emphAt, 50, oy);
    ctx.tl.fromTo(tb.block, { scale: 1 }, { scale: 1.04, duration: tb.sc.duration, ease: "none" }, tb.sc.start);
  }

  function ctaScene(ctx, scene, sc, at) {
    var cta = K.el("div", "kit-cta", scene);
    var logo = K.el("img", "kit-cta-logo", cta);
    logo.src = ctx.p.logoOnDark;
    logo.alt = "";
    var main = K.el("div", "kit-main", cta);
    var w = E.words(main, sc.text);
    main.style.fontSize = K.fitSizes(E.plain(sc.text), null, 300, 2, 2).main;
    ctx.tl.fromTo(logo, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, at);
    K.textEnter(ctx.tl, w.spans, ctx.style, at + 0.3);
    E.emphasize(ctx, w.groups, at + 0.3 + K.textEnterSec(w.spans.length, ctx.style) + 0.05, sc.start + sc.duration - 0.5, sc.motion && sc.motion.emphasis);
    if (ctx.style.ctaPulse) ctx.tl.fromTo(main, { scale: 1 }, { scale: 1.06, duration: 0.35, ease: "sine.inOut", repeat: 3, yoyo: true }, at + 1);
  }

  function phoneScene(ctx, scene, sc, at, opts, videos) {
    var v = sc.visual;
    var tl = ctx.tl;
    var tbp = textBlock(scene, sc, "top", Object.assign({ small: true }, opts));
    var phone = K.el("div", "kit-phone", scene);
    var parts = [phone];
    var screenVideo = null;
    if (K.VIDEO_RE.test(v.src)) {
      phone.classList.add("has-video");
      screenVideo = K.media(ctx, phone, scene, v.src, "kit-phone-video", sc, videos);
      screenVideo.dataset.phone = "1"; // vào cùng khung phone, chuyển cảnh vào không tween lại
      parts.push(screenVideo);
    } else K.image(phone, v.src, "");
    tl.fromTo(parts, { y: 220, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, at);
    enterBlock(ctx, tbp, at + 0.1);
    if (!v.focus) return;
    var c = K.el("div", "kit-callout", phone);
    c.style.left = v.focus.x + "%";
    c.style.top = v.focus.y + "%";
    tl.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" }, at + 0.8);
    tl.fromTo(c, { scale: 1 }, { scale: 1.25, duration: 0.4, ease: "sine.inOut", repeat: 3, yoyo: true }, at + 1.2);
    // Zoom vào vùng cần chú ý: scale quanh điểm focus (transform-origin cố định lúc dựng, không đo DOM khi tween)
    phone.style.transformOrigin = v.focus.x + "% " + v.focus.y + "%";
    // Cùng điểm focus, quy đổi sang hệ toạ độ màn hình video (phone 430×760, viền 18px — khớp kit.css)
    if (screenVideo) screenVideo.style.transformOrigin = v.focus.x * 4.3 - 18 + "px " + (v.focus.y * 7.6 - 18) + "px";
    tl.fromTo(parts, { scale: 1 }, { scale: 1.18, duration: 0.8, ease: "power2.inOut" }, at + 1.4);
  }

  /* Tuỳ chọn khối chữ theo template: nhãn hook, số bước, nhãn TRƯỚC/SAU, quote. */
  function blockOptions(ctx, sc, state) {
    var o = {};
    var t = ctx.template;
    if (t === "TipOfTheDay" && sc.role === "hook" && ctx.p.hookTag) o.tag = ctx.p.hookTag;
    if (t === "TipOfTheDay" && sc.role === "solution" && ctx.p.numberSteps) o.step = ++state.step;
    if (t === "BeforeAfter") {
      var tag = B.beforeAfterTag(sc.role);
      if (tag) {
        o.tag = tag.text;
        o.tagVariant = tag.variant;
      }
    }
    if (t === "Testimonial" && sc.attribution) o.quote = true;
    if (t === "TalkingHead" && sc.attribution) o.speaker = true;
    // Chữ trên clip người nói / montage nhỏ hơn để còn thấy người, hình
    if ((t === "TalkingHead" || t === "EventRecap") && sc.role !== "hook" && sc.visual && sc.visual.type !== "text") o.small = true;
    return o;
  }

  function build(options) {
    var vars = window.__hyperframes.getVariables();
    var p = JSON.parse(vars.props);
    var style = p.style;
    var root = document.getElementById("root");
    K.setSeed(p.seed);
    root.dataset.product = p.product;
    // Vầng sáng dịp lễ đặt theo hạt giống của video (kit-styles.css dùng các biến này)
    root.style.setProperty("--glow-a-x", Math.round(55 + K.hash01(901) * 40) + "%");
    root.style.setProperty("--glow-a-y", Math.round(70 + K.hash01(902) * 28) + "%");
    root.style.setProperty("--glow-b-x", Math.round(K.hash01(903) * 45) + "%");
    root.style.setProperty("--glow-b-y", Math.round(K.hash01(904) * 30) + "%");
    if (p.occasion) root.dataset.occasion = p.occasion; // nền phủ ánh màu dịp lễ (brand.css, kit-styles.css)
    root.classList.add("accent-" + style.accent, "fx-" + style.textFx, "tpl-" + options.template);
    if (vars.debugSafeZone) root.classList.add("debug-safe-zone");

    var scenes = p.scenes;
    var last = scenes[scenes.length - 1];
    // BeforeAfter: lần chuyển vào cảnh "sau" (solution) đầu tiên luôn là wipe
    var wipeAt = -1;
    if (options.template === "BeforeAfter") {
      for (var w = 1; w < scenes.length && wipeAt < 0; w++) if (scenes[w].role === "solution") wipeAt = w;
    }
    var total = last.start + last.duration;
    var T = style.transition.duration;
    var ctx = {
      p: p,
      tl: options.tl,
      root: root,
      style: style,
      template: options.template,
      total: total,
      ctaStart: last.role === "cta" ? last.start : total,
      // Cảnh được kéo dài thêm thời lượng chuyển cảnh để còn hiện trong lúc cảnh sau vào; trước wipe (0.8s) thì kéo đủ wipe
      // Cảnh cuối của đoạn clip bắt đầu ở cảnh i
      shotEnd: function (i) {
        var j = i;
        while (j + 1 < scenes.length && scenes[j + 1].continues) j++;
        return scenes[j];
      },
      tail: function (sc) {
        var i = scenes.indexOf(sc);
        if (i === scenes.length - 1) return 0;
        return i + 1 === wipeAt ? Math.max(T, WIPE_TAIL) : T;
      },
    };
    var tl = ctx.tl;

    ctx.bgEl = K.clip(K.el("div", "kit-bg", root), 0, total, 0);
    M.background(ctx, ctx.bgEl);
    E.motes(ctx);

    var bug = K.clip(K.el("img", "kit-logo-bug", root), 0, ctx.ctaStart, 1);
    bug.src = p.logoOnDark;
    bug.alt = "";

    var state = { step: 0 };
    var containers = [];
    var videos = scenes.map(function () {
      return [];
    });
    scenes.forEach(function (sc, i) {
      // Cảnh nối tiếp đoạn clip của cảnh trước: dùng chung danh sách video (chuyển cảnh cuối đoạn kéo clip theo)
      if (sc.continues) videos[i] = videos[i - 1];
      var scene = K.clip(K.el("div", "kit-scene", root), sc.start, sc.duration + ctx.tail(sc), 2 + (i % 2));
      scene.id = "scene-" + sc.id;
      // Cảnh cũ và mới cùng hiện trong lúc chuyển cảnh: chồng lấn có chủ ý
      scene.setAttribute("data-layout-allow-overlap", "");
      containers.push(scene);
      var at = i === 0 ? 0.1 : sc.start + (i === wipeAt ? 0.5 : T * 0.6);
      var v = sc.visual || { type: "text" };

      if (sc.role === "cta") return ctaScene(ctx, scene, sc, at);
      // Cảnh chữ: chữ rỗng khổ lớn của cụm nhấn trôi phía sau (tạo trước để nằm dưới khối chữ)
      var key = /\[([^\]]+)\]/.exec(sc.text);
      if (v.type === "text" && key) E.ghost(ctx, scene, key[1], sc.start, sc.duration + ctx.tail(sc));

      var opts = blockOptions(ctx, sc, state);
      if (v.type === "split" && v.src && v.srcAfter) {
        B.split(ctx, scene, sc, videos[i], at);
        enterBlock(ctx, textBlock(scene, sc, "bottom", opts), at + 1.4);
      } else if (v.type === "asset" && v.src) {
        assetScene(ctx, scene, sc, i, at, opts, videos);
      } else if (v.type === "montage" && v.srcs) {
        B.montage(ctx, scene, sc, videos[i]);
        K.el("div", "kit-dim soft", scene);
        enterBlock(ctx, textBlock(scene, sc, "bottom", opts), at);
      } else if (sc.stats && options.template === "Stats") {
        enterBlock(ctx, textBlock(scene, sc, "top", Object.assign({ small: true }, opts)), at);
        B.stats(ctx, scene, sc, at + 0.2);
      } else if (v.type === "phone" && v.src) {
        phoneScene(ctx, scene, sc, at, opts, videos[i]);
      } else if (sc.promo && options.template === "Promo") {
        enterBlock(ctx, textBlock(scene, sc, "top", Object.assign({ promo: true }, opts)), at);
        B.promo(ctx, scene, sc, at + 0.4, style);
      } else {
        var tbt = textBlock(scene, sc, "center", opts);
        if (opts.quote) quote(ctx, tbt, sc, at);
        enterBlock(ctx, tbt, at);
      }
    });

    for (var k = 0; k + 1 < containers.length; k++) {
      var mt = scenes[k + 1].motion && scenes[k + 1].motion.transition;
      var type = k + 1 === wipeAt ? "wipe" : mt || null;
      // Trong một đoạn clip liền mạch chỉ đổi chữ: clip (và tiếng người nói) chạy tiếp, không chuyển cảnh hình
      if (scenes[k + 1].continues) {
        M.transition(ctx, containers[k], containers[k + 1], scenes[k + 1].start, "text-swap");
        continue;
      }
      M.transition(ctx, containers[k], containers[k + 1], scenes[k + 1].start, type);
      M.transitionVideos(ctx, videos[k], videos[k + 1], scenes[k + 1].start, type);
    }
    // Cảnh cuối được phép thoát: mờ dần 0.4 giây cuối
    tl.to([containers[containers.length - 1]].concat(videos[videos.length - 1]), { opacity: 0, duration: 0.4, ease: "sine.in" }, total - 0.4);

    M.overlay(ctx);
    textFx(ctx);

    var music = document.getElementById("music");
    if (music) K.clip(music, 0, total, 9);
    var sz = document.getElementById("safe-zone");
    if (sz) K.clip(sz, 0, total, 8);
  }

  /*
   * Cảnh ảnh/clip toàn khung. Clip video: cảnh đầu của một đoạn liền mạch (sc.shot) tạo video kéo qua mọi cảnh
   * nối tiếp, kèm lớp tối riêng (con của root, đi cùng video) và tiếng gốc nếu giữ; cảnh nối tiếp chỉ có chữ.
   */
  function assetScene(ctx, scene, sc, i, at, opts, videos) {
    var tl = ctx.tl;
    var dimCls = ctx.template === "TalkingHead" ? "kit-dim soft" : "kit-dim";
    var cls = "kit-media-full" + (ctx.template === "BeforeAfter" && sc.role === "problem" ? " kit-before" : "");
    if (sc.shot) {
      var end = ctx.shotEnd(i);
      var dur = end.start + end.duration - sc.start;
      var m = K.media(ctx, scene, scene, sc.visual.src, cls, sc, videos[i], { start: sc.start, duration: dur + ctx.tail(end), mediaStart: sc.shot.mediaStart });
      if (end === sc) K.el("div", dimCls, scene);
      else {
        // Đoạn kéo qua nhiều cảnh: lớp tối là con của root, đi cùng video, để không tắt theo chữ của từng cảnh
        var dim = K.clip(K.el("div", dimCls, null), sc.start, dur + ctx.tail(end), 7);
        ctx.root.insertBefore(dim, scene);
        videos[i].push(dim);
      }
      if (sc.shot.audio) K.clipAudio(ctx.root, sc.visual.src, sc.start, sc.shot.duration, sc.shot.mediaStart);
      tl.fromTo(m, { scale: 1 }, { scale: ctx.style.kenBurns, duration: dur, ease: "none" }, sc.start);
    } else if (!sc.continues) {
      var img = K.media(ctx, scene, scene, sc.visual.src, cls, sc, videos[i]);
      K.el("div", dimCls, scene);
      tl.fromTo(img, { scale: 1 }, { scale: ctx.style.kenBurns, duration: sc.duration, ease: "none" }, sc.start);
    }
    if (sc.promo && ctx.template === "Promo") {
      enterBlock(ctx, textBlock(scene, sc, "top", Object.assign({ promo: true }, opts)), at);
      B.promo(ctx, scene, sc, at + 0.4, ctx.style);
      return;
    }
    var tb = textBlock(scene, sc, "bottom", opts);
    if (opts.quote) quote(ctx, tb, sc, at);
    if (opts.speaker) B.lowerThird(ctx, tb.block, sc.attribution, at + 0.6);
    enterBlock(ctx, tb, at);
  }

  /* Testimonial: dấu ngoặc kép lớn + lower third tên khách. */
  function quote(ctx, tb, sc, at) {
    var q = B.quoteMark(tb.block);
    ctx.tl.fromTo(q, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, at);
    B.lowerThird(ctx, tb.block, sc.attribution, at + 0.9);
  }

  /*
   * Hiệu ứng chữ "boil" (thu-cong): nét chữ rung nhẹ như vẽ tay — SVG displacement, đổi seed theo bậc
   * ~8 lần/giây (line boil). Một tween duy nhất, xác định.
   */
  function textFx(ctx) {
    if (ctx.style.textFx !== "boil") return;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "kit-fx-defs");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    var f = document.createElementNS(ns, "filter");
    f.setAttribute("id", "kit-boil");
    var turb = document.createElementNS(ns, "feTurbulence");
    turb.setAttribute("type", "fractalNoise");
    turb.setAttribute("baseFrequency", "0.035");
    turb.setAttribute("numOctaves", "2");
    turb.setAttribute("seed", "1");
    turb.setAttribute("result", "n");
    var disp = document.createElementNS(ns, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "n");
    disp.setAttribute("scale", "5");
    f.appendChild(turb);
    f.appendChild(disp);
    svg.appendChild(f);
    ctx.root.appendChild(svg);
    var steps = Math.max(1, Math.round(ctx.total * 8));
    ctx.tl.fromTo(turb, { attr: { seed: 1 } }, { attr: { seed: steps + 1 }, duration: ctx.total, ease: "steps(" + steps + ")" }, 0);
  }

  window.RedsunKit = { build: build };
})();
