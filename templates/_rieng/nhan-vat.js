/*
 * Nhân vật nửa người có khớp (SVG) cho video dựng riêng — dùng khi MKT chưa gửi hình người thật.
 * Nạp sau rieng.js. Mọi chuyển động gắn vào timeline `tl` theo giây tuyệt đối; gọi các hàm của MỘT nhân vật
 * theo thứ tự thời gian tăng dần (hàm nhớ tư thế/nét mặt trước đó để nối mượt).
 *
 *   const p = RS.person({ hair: "long", outfit: "so-mi", shirt: "c", width: 620 });
 *   RS.idle(tl, p, 0, 6);                  // thở, chớp mắt, đầu lắc nhẹ suốt 0–6s
 *   RS.mood(tl, p, "nhiu-may", 1.2);       // nét mặt
 *   RS.pose(tl, p, "chong-cam", 1.2);      // tư thế tay
 *   RS.talk(tl, p, 2, 1.4);                // mấp máy miệng khi nói (bong bóng thoại)
 *   RS.look(tl, p, "phai", 3);             // liếc mắt
 *   RS.tilt(tl, p, -6, 3);                 // nghiêng đầu (độ)
 */
(function () {
  var RS = window.RS;
  var W = 600, H = 900;
  var SH = { L: [184, 578], R: [416, 578] }; // khớp vai
  var UP = 170, FO = 160;                    // dài cánh tay trên / cẳng tay

  // Tư thế = vị trí bàn tay (toạ độ khung 600×900, đầu ở giữa trên, cằm y≈472, ngực y≈650); khớp vai/khuỷu tự tính.
  // Thêm "duoi" để khuỷu tay hạ thấp (mặc định khuỷu chĩa ra ngoài). dt = góc nghiêng điện thoại (độ).
  var XL = [168, 900], XR = [432, 900];
  var POSES = {
    "xuoi": { L: XL, R: XR },
    "cam-dt": { L: XL, R: [352, 700, "duoi"], dt: -8 },     // cầm điện thoại trước ngực, màn hình quay ra
    "nhin-dt": { L: [250, 780, "duoi"], R: [336, 700, "duoi"], dt: -12 }, // cúi xem điện thoại
    "khoe-dt": { L: XL, R: [500, 420], dt: 6 },             // giơ điện thoại cao cho người xem thấy
    "vay": { L: XL, R: [540, 250] },                         // vẫy tay chào
    "chong-cam": { L: [258, 488, "duoi"], R: XR },           // tay chống cằm (suy nghĩ, lo)
    "om-dau": { L: [176, 286], R: [424, 286] },              // hai tay ôm đầu (hoảng)
    "xoe-tay": { L: [80, 700], R: [520, 700] },              // xòe hai tay (sao lại thế)
    "chi": { L: XL, R: [600, 520] },                         // chỉ sang phải
    "chi-trai": { L: [0, 520], R: XR },                      // chỉ sang trái
    "chap-tay": { L: [292, 660, "duoi"], R: [308, 660, "duoi"] }, // chắp tay (dạ vâng / cảm ơn)
    "giu-nguc": { L: [336, 660, "duoi"], R: XR },            // đặt tay lên ngực (thở phào)
    "an-mung": { L: [110, 150], R: [490, 150] },             // giơ hai tay ăn mừng
    "nam-tay": { L: XL, R: [470, 420] },                     // nắm tay "yes!"
  };

  var DEG = 180 / Math.PI;
  function ik(side, t) {
    var S = SH[side], dx = t[0] - S[0], dy = t[1] - S[1];
    var d = Math.max(Math.abs(UP - FO) + 1, Math.min(UP + FO - 0.5, Math.hypot(dx, dy)));
    var base = Math.atan2(-dx, dy);
    var a = Math.acos((UP * UP + d * d - FO * FO) / (2 * UP * d));
    var best = null;
    [base + a, base - a].forEach(function (th) {
      var ex = S[0] - UP * Math.sin(th), ey = S[1] + UP * Math.cos(th);
      var score = t[2] === "duoi" ? ey : Math.abs(ex - 300);
      if (!best || score > best.score) best = { score: score, s: th, f: Math.atan2(-(t[0] - ex), t[1] - ey) };
    });
    var e = (best.f - best.s) * DEG;
    e = ((e + 540) % 360) - 180;
    return [best.s * DEG, e];
  }
  function angles(pose) {
    if (Array.isArray(pose)) return pose.length === 5 ? pose : pose.concat([0]);
    var def = typeof pose === "object" ? { L: pose.L || XL, R: pose.R || XR, dt: pose.dt } : POSES[pose];
    if (!def) throw new Error("RS.pose: không có tư thế " + pose);
    return ik("L", def.L).concat(ik("R", def.R), [def.dt || 0]);
  }

  // Nét mặt: mắt, lông mày [góc trái, góc phải, dịch dọc trái, dịch dọc phải], miệng.
  // Góc dương = quay chiều kim đồng hồ: lông mày trái dương / phải âm = đầu trong hạ xuống (cau mày); ngược lại = nhướng lo.
  var MOODS = {
    "binh-thuong": { eyes: "mo", brow: [0, 0, 0, 0], mouth: "cuoi-nhe" },
    "cuoi": { eyes: "cuoi", brow: [-6, 6, -8, -8], mouth: "cuoi-to" },
    "nhiu-may": { eyes: "nheo", brow: [17, -17, 8, 8], mouth: "meo" },       // cau mày: đầu trong lông mày hạ xuống, mắt nheo
    "lo-lang": { eyes: "mo", brow: [-17, 17, -6, -6], mouth: "lang", sweat: true }, // lo: đầu trong lông mày nhướng lên, giọt mồ hôi
    "sung-sot": { eyes: "tron", brow: [0, 0, -15, -15], mouth: "o" },       // sững sờ: lông mày vọt cao, mắt tròn, miệng chữ O
    "nhe-nhom": { eyes: "nham", brow: [-8, 8, -6, -6], mouth: "cuoi-nhe" },  // thở phào: nhắm mắt, cười nhẹ
    "buon": { eyes: "rui", brow: [-20, 20, -2, -2], mouth: "meo" },          // buồn/tiu nghỉu
    "tap-trung": { eyes: "mo", brow: [5, -5, 3, 3], mouth: "phang" },        // chăm chú (kiểm sổ, đọc màn hình)
    "tu-tin": { eyes: "mo", brow: [0, 0, -7, -7], mouth: "cuoi-to" },
    "nghi": { eyes: "nheo", brow: [5, 0, 5, -16], mouth: "phang" },          // ngờ vực: một bên lông mày nhướng
  };

  RS._eyeId = RS._eyeId || 0;
  var c = function (cls, d) { return '<path class="' + cls + '" d="' + d + '"/>'; };

  function hairParts(kind) {
    var cap = "M168 330 C 150 150, 450 150, 432 330 C 428 260, 400 222, 300 216 C 200 222, 172 260, 168 330 Z";
    var back = {
      long: c("hair", "M164 320 C 140 120, 460 120, 436 320 L 476 700 C 400 740, 200 740, 124 700 Z"),
      bob: c("hair", "M160 320 C 140 120, 460 120, 440 320 L 452 470 C 420 500, 180 500, 148 470 Z"),
      bun: '<circle class="hair" cx="300" cy="128" r="62"/>' + c("hair", cap),
      ponytail: c("hair", "M420 240 C 520 260, 520 470, 470 560 C 500 440, 470 330, 410 300 Z") + c("hair", cap),
      short: c("hair", cap),
      mai: c("hair", "M164 320 C 140 120, 460 120, 436 320 L 470 720 C 400 756, 200 756, 130 720 Z"),
      "mai-ngan": c("hair", "M160 320 C 140 120, 460 120, 440 320 L 450 486 C 420 512, 180 512, 150 486 Z"),
    }[kind];
    var front = {
      long: c("hair", "M170 330 C 160 170, 440 160, 432 320 C 400 250, 330 228, 286 236 C 300 262, 250 300, 170 330 Z"),
      bob: c("hair", "M164 340 C 150 160, 450 160, 438 340 C 420 270, 360 246, 300 250 C 240 246, 180 270, 164 340 Z"),
      bun: c("hair", "M176 300 C 190 200, 410 196, 426 300 C 380 246, 330 236, 300 240 C 260 236, 210 250, 176 300 Z"),
      ponytail: c("hair", "M176 300 C 190 200, 410 196, 426 300 C 390 252, 320 240, 270 250 C 230 258, 200 270, 176 300 Z"),
      mai: c("hair", "M170 318 C 162 186, 438 186, 430 318 L 414 262 L 386 250 L 356 258 L 326 247 L 298 255 L 270 247 L 240 257 L 212 249 L 186 262 Z"),
      "mai-ngan": c("hair", "M170 318 C 162 186, 438 186, 430 318 L 414 262 L 386 250 L 356 258 L 326 247 L 298 255 L 270 247 L 240 257 L 212 249 L 186 262 Z"),
      short: c("hair", "M170 300 C 170 180, 430 170, 432 296 C 404 250, 360 232, 312 236 C 330 250, 320 262, 300 262 C 250 258, 210 262, 170 300 Z"),
    }[kind];
    var shine = '<path class="hair-shine" d="M220 214 C 260 186, 330 182, 372 200"/>';
    return { back: back, front: front + shine };
  }

  // Lông mày vẽ sau tóc mái để luôn thấy (lông mày là phần nói cảm xúc rõ nhất); giọt mồ hôi khi lo
  var BROWS = '<g class="brow-L"><path class="brow" d="M222 282 Q 252 266 284 278"/></g><g class="brow-R"><path class="brow" d="M316 278 Q 348 266 378 282"/></g>' +
    '<g class="mo-hoi" style="display:none"><path class="sweat" d="M432 236 C 446 262, 452 280, 438 290 C 424 296, 414 282, 422 266 Z"/></g>';

  // Nón lá: chóp nón trên đầu, quai dưới cằm
  var NON_LA = '<path class="strap" d="M196 300 Q 300 520 404 300"/>' + c("non-la", "M86 262 L 300 52 L 514 262 Q 300 300 86 262 Z") +
    c("non-la-d", "M86 262 Q 300 300 514 262 L 510 274 Q 300 314 90 274 Z") + c("non-la-l", "M300 52 L 200 270 M300 52 L 400 270 M300 52 L 300 282");

  function torso(outfit) {
    var body = "M100 900 C 98 720, 112 610, 176 566 C 210 540, 250 528, 300 528 C 350 528, 390 540, 424 566 C 488 610, 502 720, 500 900 Z";
    var shade = "M424 566 C 488 610, 502 720, 500 900 L 440 900 C 448 760, 446 640, 424 566 Z";
    var s = c("shirt", body) + c("shirt-d", shade);
    if (outfit === "so-mi") s += c("shirt-l", "M256 530 L 300 604 L 270 640 L 230 544 Z") + c("shirt-l", "M344 530 L 300 604 L 330 640 L 370 544 Z") + '<circle class="shirt-d" cx="300" cy="670" r="7"/><circle class="shirt-d" cx="300" cy="740" r="7"/>';
    else if (outfit === "tap-de") s += c("apron", "M214 620 L 386 620 L 404 900 L 196 900 Z") + c("apron-d", "M214 620 L 386 620 L 385 646 L 215 646 Z") + c("apron-tie", "M238 620 L 226 548 M362 620 L 374 548") + c("shirt-l", "M262 530 Q 300 576 338 530 Z");
    else if (outfit === "ao-dai") s += c("shirt", "M262 470 L 338 470 L 344 540 Q 300 552 256 540 Z") + c("shirt-l", "M262 470 L 338 470 L 339 484 L 261 484 Z") +
      c("seam", "M300 546 Q 360 552 410 596") + c("sheen", "M150 900 C 150 760, 170 660, 214 600");
    else if (outfit === "ba-ba") s += c("shirt-l", "M260 530 Q 300 568 340 530 Z") + c("seam", "M300 566 L 300 900") + '<circle class="shirt-l" cx="300" cy="620" r="7"/><circle class="shirt-l" cx="300" cy="690" r="7"/><circle class="shirt-l" cx="300" cy="760" r="7"/>' + c("shirt-d", "M190 780 h70 v60 h-70 Z");
    else s += c("shirt-l", "M258 530 Q 300 580 342 530 Z");
    return s;
  }

  function arm(side, opts) {
    var x = SH[side][0], y = SH[side][1], hy = y + UP + FO;
    var sleeve = opts.longSleeve ? "shirt" : "skin";
    var phone = side === "R" && opts.phone
      ? '<g class="j-phone"><rect class="device" x="' + (x - 56) + '" y="' + (hy - 168) + '" width="112" height="196" rx="18"/>' +
        '<rect class="screen" x="' + (x - 47) + '" y="' + (hy - 157) + '" width="94" height="174" rx="11"/>' +
        (opts.phoneOk ? '<circle class="ok" cx="' + x + '" cy="' + (hy - 76) + '" r="30"/><path class="ok-mark" d="M' + (x - 14) + " " + (hy - 76) + ' l10 10 l19 -21"/>' : "") + "</g>"
      : "";
    var thumb = side === "L" ? 26 : -26;
    return '<g class="j-sh-' + side + '">' +
      '<rect class="' + sleeve + '" x="' + (x - 34) + '" y="' + (y - 10) + '" width="68" height="' + (UP + 10) + '" rx="34"/>' +
      '<rect class="shirt" x="' + (x - 41) + '" y="' + (y - 28) + '" width="82" height="' + (opts.longSleeve ? UP + 28 : 112) + '" rx="41"/>' +
      (opts.longSleeve ? "" : '<rect class="shirt-d" x="' + (x - 41) + '" y="' + (y + 64) + '" width="82" height="22" rx="11"/>') +
      '<g class="j-el-' + side + '">' +
      '<rect class="' + sleeve + '" x="' + (x - 29) + '" y="' + (y + UP - 30) + '" width="58" height="' + (FO + 26) + '" rx="29"/>' +
      phone +
      '<ellipse class="skin" cx="' + x + '" cy="' + (hy + 4) + '" rx="34" ry="38"/>' +
      '<ellipse class="skin" cx="' + (x + thumb) + '" cy="' + (hy - 14) + '" rx="13" ry="22" transform="rotate(' + (side === "L" ? -24 : 24) + " " + (x + thumb) + " " + (hy - 14) + ')"/>' +
      '<path class="knuckle" d="M' + (x - 18) + " " + (hy + 26) + " Q " + x + " " + (hy + 34) + " " + (x + 18) + " " + (hy + 26) + '"/>' +
      "</g></g>";
  }

  function face(opts) {
    var e = function (cx) {
      var sd = cx < 300 ? -1 : 1, X = function (dx) { return cx + sd * dx; };
      var almond = "M" + X(-28) + " 335 C " + X(-16) + " 316, " + X(16) + " 313, " + X(29) + " 327 C " + X(18) + " 346, " + X(-16) + " 348, " + X(-28) + " 335 Z";
      var cid = "rsEye" + (++RS._eyeId);
      var squint = "M" + X(-27) + " 336 C " + X(-14) + " 324, " + X(16) + " 322, " + X(28) + " 332 C " + X(16) + " 345, " + X(-14) + " 347, " + X(-27) + " 336 Z";
      return '<g class="eye-mo"><clipPath id="' + cid + '"><path d="' + almond + '"/></clipPath><path class="eye" d="' + almond + '"/>' +
        '<g clip-path="url(#' + cid + ')"><g class="iris"><circle class="iris-c" cx="' + cx + '" cy="331" r="15.5"/><circle class="pupil" cx="' + cx + '" cy="331" r="7"/><circle class="eye" cx="' + (cx + 6) + '" cy="325" r="5"/></g></g>' +
        '<path class="' + (opts.lashes ? "lash" : "lid-up") + '" d="M' + X(-30) + " 336 C " + X(-16) + " 314, " + X(16) + " 310, " + X(31 + (opts.lashes ? 5 : 0)) + " " + (opts.lashes ? 321 : 327) + '"/>' +
        '<path class="crease" d="M' + X(-20) + " 314 C " + X(-6) + " 304, " + X(14) + " 303, " + X(26) + ' 312"/></g>' +
        '<g class="eye-nheo" style="display:none"><clipPath id="' + cid + 'n"><path d="' + squint + '"/></clipPath><path class="eye" d="' + squint + '"/>' +
        '<g clip-path="url(#' + cid + 'n)"><circle class="iris-c" cx="' + cx + '" cy="336" r="14"/><circle class="pupil" cx="' + cx + '" cy="336" r="6"/></g>' +
        '<path class="lash" d="M' + X(-30) + " 335 C " + X(-14) + " 322, " + X(16) + " 320, " + X(31) + ' 331"/></g>' +
        '<g class="eye-tron" style="display:none"><ellipse class="eye" cx="' + cx + '" cy="326" rx="29" ry="35"/><circle class="iris-c" cx="' + cx + '" cy="328" r="13"/><circle class="eye" cx="' + (cx + 5) + '" cy="322" r="4"/></g>' +
        '<g class="eye-cuoi" style="display:none"><path class="line" d="M' + (cx - 24) + " 338 Q " + cx + " 306 " + (cx + 24) + ' 338"/></g>' +
        '<g class="eye-nham" style="display:none"><path class="line" d="M' + (cx - 24) + " 330 Q " + cx + " 350 " + (cx + 24) + ' 330"/></g>' +
        '<g class="eye-rui" style="display:none"><ellipse class="eye" cx="' + cx + '" cy="336" rx="23" ry="22"/><circle class="iris-c" cx="' + cx + '" cy="342" r="15"/><path class="lid-fill" d="M' + (cx - 27) + " 334 Q " + cx + " 306 " + (cx + 27) + " 334 L " + (cx + 27) + " 310 L " + (cx - 27) + ' 310 Z"/><path class="lid" d="M' + (cx - 27) + " 334 Q " + cx + " 326 " + (cx + 27) + ' 334"/></g>';
    };
    var mouths =
      '<g class="m-cuoi-nhe">' + c("line", "M268 404 Q 300 428 332 404") + "</g>" +
      '<g class="m-cuoi-to" style="display:none">' + c("mouth", "M258 396 Q 300 400 342 396 Q 336 450 300 452 Q 264 450 258 396 Z") + c("teeth", "M266 398 Q 300 402 334 398 L 332 412 Q 300 416 268 412 Z") + c("tongue", "M280 440 Q 300 426 320 440 Q 300 452 280 440 Z") + "</g>" +
      '<g class="m-meo" style="display:none">' + c("line", "M274 420 Q 300 400 326 420") + "</g>" +
      '<g class="m-lang" style="display:none">' + c("line", "M266 414 q 11 -10 22 0 t 22 0 t 22 0") + "</g>" +
      '<g class="m-o" style="display:none"><ellipse class="mouth" cx="300" cy="418" rx="20" ry="25"/></g>' +
      '<g class="m-phang" style="display:none">' + c("line", "M278 414 L 322 412") + "</g>" +
      '<g class="m-noi" style="display:none">' + c("mouth", "M272 402 Q 300 398 328 402 Q 322 432 300 434 Q 278 432 272 402 Z") + c("tongue", "M286 426 Q 300 418 314 426 Q 300 434 286 426 Z") + "</g>";
    return '<ellipse class="skin" cx="176" cy="346" rx="22" ry="34"/><ellipse class="skin" cx="424" cy="346" rx="22" ry="34"/>' +
      c("skin", "M180 300 C 180 186, 420 186, 420 300 L 418 352 C 412 424, 360 470, 300 472 C 240 470, 188 424, 182 352 Z") +
      c("skin-d", "M182 352 C 188 424, 240 470, 300 472 C 250 456, 210 418, 196 360 Z") +
      '<ellipse class="blush" cx="232" cy="392" rx="30" ry="16"/><ellipse class="blush" cx="368" cy="392" rx="30" ry="16"/>' +
      c("nose", "M288 382 Q 300 390 312 382") + c("nose-s", "M296 352 Q 292 368 294 376") +
      '<g class="eyes"><g class="eye-L">' + e(256) + '</g><g class="eye-R">' + e(344) + "</g></g>" +
      '<g class="mouths">' + mouths + "</g>" +
      (opts.glasses ? '<g class="glasses"><circle cx="256" cy="332" r="40"/><circle cx="344" cy="332" r="40"/><path d="M296 330 h8"/></g>' : "");
  }

  /**
   * Nét người Việt: mắt hạnh nhân, tóc đen, da vàng ấm (skin 1) hoặc rám nắng (skin 2).
   * opts: { hair: "long"|"mai" (tóc dài mái bằng)|"mai-ngan"|"bob"|"bun"|"ponytail"|"short",
   *         outfit: "ao"|"so-mi"|"tap-de" (tạp dề quán)|"ao-dai"|"ba-ba", hat: "non-la", shirt: "a"|"b"|"c",
   *         skin: 1|2, hairColor: 1|2, lashes (mặc định: có trừ tóc short), glasses, longSleeve,
   *         phone, phoneOk (dấu tick xanh trên màn hình), width (px), pose, mood }
   */
  RS.person = function (opts) {
    opts = opts || {};
    var hair = opts.hair || "short";
    if (opts.outfit === "ao-dai" || opts.outfit === "ba-ba") opts.longSleeve = opts.longSleeve !== false;
    if (opts.lashes == null) opts.lashes = hair !== "short";
    var hp = hairParts(hair);
    var w = opts.width || 520;
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="' + w + '" height="' + Math.round((w * H) / W) + '" overflow="visible">' +
      '<g class="j-body">' + hp.back +
      '<rect class="skin-d" x="262" y="430" width="76" height="120" rx="30"/>' +
      torso(opts.outfit || "ao") +
      '<g class="j-head">' + face(opts) + hp.front + BROWS + (opts.hat === "non-la" ? NON_LA : "") + "</g>" +
      arm("L", opts) + arm("R", opts) +
      "</g></svg>";
    var el = document.createElement("div");
    el.className = "rs-person shirt-" + (opts.shirt || "a") + " skin-" + (opts.skin || 1) + " hair-" + (opts.hairColor || 1);
    el.innerHTML = svg;
    el._rig = { pose: angles(opts.pose || "xuoi"), mood: "binh-thuong", look: [0, 0], tilt: 0 };
    var q = function (s) { return el.querySelector(s); };
    el._j = { shL: q(".j-sh-L"), elL: q(".j-el-L"), shR: q(".j-sh-R"), elR: q(".j-el-R"), phone: q(".j-phone"), head: q(".j-head"), body: q(".j-body") };
    applyPose(el, el._rig.pose);
    if (opts.mood && opts.mood !== "binh-thuong") setMoodNow(el, opts.mood);
    return el;
  };

  /**
   * Dàn nhân vật của video: khai MỘT lần (tóc, áo, màu da…), mọi cảnh tạo người qua tên để nhân vật nhất quán.
   *   const ai = RS.cast({ chu: { hair: "mai", outfit: "so-mi", shirt: "c" }, nv: { hair: "bun", outfit: "tap-de", shirt: "a" } });
   *   const owner = ai("chu", { width: 700, pose: "nhin-dt", mood: "tap-trung", phone: true });
   * Lần gọi chỉ được đổi cỡ/tư thế/nét mặt/điện thoại; đổi tóc, áo, da… sẽ báo lỗi.
   */
  var IDENTITY = ["hair", "outfit", "shirt", "skin", "hairColor", "glasses", "hat", "lashes", "longSleeve"];
  RS.cast = function (defs) {
    return function (name, extra) {
      var d = defs[name];
      if (!d) throw new Error("RS.cast: chưa khai nhân vật " + name);
      Object.keys(extra || {}).forEach(function (k) {
        if (IDENTITY.indexOf(k) >= 0) throw new Error("RS.cast: nhân vật " + name + " phải giữ nguyên " + k + " ở mọi cảnh");
      });
      var o = {};
      Object.keys(d).forEach(function (k) { o[k] = d[k]; });
      Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
      return RS.person(o);
    };
  };

  function applyPose(el, a) {
    var j = el._j, r = function (deg, x, y) { return "rotate(" + deg.toFixed(2) + " " + x + " " + y + ")"; };
    j.shL.setAttribute("transform", r(a[0], SH.L[0], SH.L[1]));
    j.elL.setAttribute("transform", r(a[1], SH.L[0], SH.L[1] + UP));
    j.shR.setAttribute("transform", r(a[2], SH.R[0], SH.R[1]));
    j.elR.setAttribute("transform", r(a[3], SH.R[0], SH.R[1] + UP));
    // Điện thoại luôn gần thẳng đứng dù cẳng tay nghiêng
    if (j.phone) j.phone.setAttribute("transform", r(-(a[2] + a[3]) + a[4], SH.R[0], SH.R[1] + UP + FO));
  }

  /**
   * Đổi tư thế tay tại `at` trong `dur` giây. pose = tên trong RS.POSES, hoặc vị trí bàn tay
   * { L: [x, y], R: [x, y, "duoi"], dt } (khung 600×900), hoặc mảng góc [vaiT, khuỷuT, vaiP, khuỷuP, nghiêngĐT].
   */
  RS.pose = function (tl, p, pose, at, dur, ease) {
    var from = p._rig.pose.slice();
    var to = angles(pose);
    to = to.map(function (v, i) { var dlt = ((v - from[i] + 540) % 360) - 180; return from[i] + dlt; });
    var o = { t: 0 };
    tl.fromTo(o, { t: 0 }, { t: 1, duration: dur || 0.4, ease: ease || "back.out(1.3)", immediateRender: false,
      onUpdate: function () { applyPose(p, from.map(function (v, i) { return v + (to[i] - v) * o.t; })); } }, at);
    p._rig.pose = to;
  };

  /** Vẫy tay (cẳng tay phải lắc) `times` lần từ `at`; nên gọi sau RS.pose(…, "vay"). */
  RS.wave = function (tl, p, at, times) {
    var base = p._rig.pose.slice(), o = { t: 0 };
    tl.fromTo(o, { t: 0 }, { t: 1, duration: 0.22, repeat: (times || 3) * 2 - 1, yoyo: true, ease: "sine.inOut", immediateRender: false,
      onUpdate: function () { var a = base.slice(); a[3] += -24 * o.t; applyPose(p, a); } }, at);
  };
  RS.POSES = POSES;

  function moodTargets(p, mood) {
    var m = MOODS[mood];
    if (!m) throw new Error("RS.mood: không có nét mặt " + mood);
    return m;
  }

  function setMoodNow(p, mood) {
    var m = moodTargets(p, mood);
    p.querySelectorAll(".eye-L > g, .eye-R > g").forEach(function (g) {
      g.style.display = g.getAttribute("class") === "eye-" + m.eyes ? "inline" : "none";
    });
    p.querySelectorAll(".mouths > g").forEach(function (g) { g.style.display = g.getAttribute("class") === "m-" + m.mouth ? "inline" : "none"; });
    gsap.set(p.querySelector(".brow-L"), { rotation: m.brow[0], y: m.brow[2], svgOrigin: "253 276" });
    gsap.set(p.querySelector(".brow-R"), { rotation: m.brow[1], y: m.brow[3], svgOrigin: "347 276" });
    p.querySelector(".mo-hoi").style.display = m.sweat ? "inline" : "none";
    p._rig.mood = mood;
  }

  function setGroups(tl, p, prefix, sel, active, at) {
    p.querySelectorAll(sel).forEach(function (g) {
      tl.set(g, { display: g.getAttribute("class") === prefix + active ? "inline" : "none" }, at);
    });
  }

  /** Đổi nét mặt tại `at`: binh-thuong | cuoi | tap-trung | nhiu-may | lo-lang | sung-sot | nhe-nhom | buon | tu-tin | nghi. */
  RS.mood = function (tl, p, mood, at) {
    var m = moodTargets(p, mood);
    var prev = MOODS[p._rig.mood];
    setGroups(tl, p, "eye-", ".eye-L > g, .eye-R > g", m.eyes, at);
    setGroups(tl, p, "m-", ".mouths > g", m.mouth, at);
    var bL = p.querySelector(".brow-L"), bR = p.querySelector(".brow-R");
    tl.fromTo(bL, { rotation: prev.brow[0], y: prev.brow[2] }, { rotation: m.brow[0], y: m.brow[2], svgOrigin: "253 276", duration: 0.2, ease: "power2.out", immediateRender: false }, at);
    tl.fromTo(bR, { rotation: prev.brow[1], y: prev.brow[3] }, { rotation: m.brow[1], y: m.brow[3], svgOrigin: "347 276", duration: 0.2, ease: "power2.out", immediateRender: false }, at);
    var sw = p.querySelector(".mo-hoi");
    tl.set(sw, { display: m.sweat ? "inline" : "none" }, at);
    if (m.sweat) tl.fromTo(sw, { y: -10, opacity: 0 }, { y: 8, opacity: 1, duration: 0.5, ease: "power1.in", immediateRender: false }, at + 0.1);
    p._rig.mood = mood;
  };
  RS.MOODS = MOODS;

  /** Chớp mắt một lần tại `at`. */
  RS.blink = function (tl, p, at) {
    p.querySelectorAll(".eyes > g").forEach(function (g, i) {
      tl.fromTo(g, { scaleY: 1 }, { scaleY: 0.08, svgOrigin: (i ? 344 : 256) + " 330", duration: 0.06, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false }, at);
    });
  };

  /** Mấp máy miệng khi nói, từ `at` trong `dur` giây (nhịp ~8 lần/giây), rồi trở lại miệng của nét mặt hiện tại. */
  RS.talk = function (tl, p, at, dur, seed) {
    var r = RS.rng(seed || 3);
    var base = MOODS[p._rig.mood].mouth;
    var t = at, open = true;
    while (t < at + dur) {
      setGroups(tl, p, "m-", ".mouths > g", open ? "noi" : base, t);
      t += 0.09 + r() * 0.07;
      open = !open;
    }
    setGroups(tl, p, "m-", ".mouths > g", base, at + dur);
  };

  /** Liếc mắt: giua | trai | phai | len | xuong. */
  RS.look = function (tl, p, dir, at, dur) {
    var d = { giua: [0, 0], trai: [-9, 0], phai: [9, 0], len: [0, -8], xuong: [0, 8] }[dir] || [0, 0];
    var prev = p._rig.look;
    p.querySelectorAll(".iris").forEach(function (g) {
      tl.fromTo(g, { x: prev[0], y: prev[1] }, { x: d[0], y: d[1], duration: dur || 0.18, ease: "power2.out", immediateRender: false }, at);
    });
    p._rig.look = d;
  };

  /** Nghiêng đầu `deg` độ quanh cổ. */
  RS.tilt = function (tl, p, deg, at, dur) {
    tl.fromTo(p._j.head, { rotation: p._rig.tilt }, { rotation: deg, svgOrigin: "300 500", duration: dur || 0.35, ease: "power2.out", immediateRender: false }, at);
    p._rig.tilt = deg;
  };

  /** Sống động suốt [from, to]: thở (ngực phồng nhẹ), chớp mắt mỗi 2–4 giây. */
  RS.idle = function (tl, p, from, to, seed) {
    var r = RS.rng(seed || 5);
    var n = Math.max(1, Math.round((to - from) / 1.6));
    tl.fromTo(p._j.body, { scaleY: 1 }, { scaleY: 1.012, svgOrigin: "300 900", duration: (to - from) / (n * 2), repeat: n * 2 - 1, yoyo: true, ease: "sine.inOut", immediateRender: false }, from);
    for (var t = from + 0.6 + r() * 1.2; t < to - 0.2; t += 2 + r() * 2) RS.blink(tl, p, t);
  };
})();
