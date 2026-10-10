/*
 * Bối cảnh vẽ sẵn cho video dựng riêng: nơi chốn Việt (quán, nhà, tiệm tạp hoá, văn phòng, kho, phố, góc livestream)
 * và nền trừu tượng (báo động, sáng, thương hiệu). Nạp sau rieng.js, kèm _rieng/boi-canh.css. Không có chữ, không có số.
 *
 *   const bg = RS.set(document.querySelector("#camA"), "quan", { light: "ngay", tone: "kem", clock: [110, 250] });
 *   RS.setLive(tl, bg, 0, 3.4, 1);           // nền sống: đèn đung đưa, mây trôi, khói, đèn nháy, tia xoay
 *   RS.clockSpin(tl, bg, 2.85, 0.55, 3);      // kim đồng hồ quay 3 vòng (hết ngày)
 *   bg.pos("clock") → [x, y] tâm vật trong khung 1080×1920 (dùng làm tâm đẩy máy)
 *
 * Lớp sau (tường, đồ đạc) chèn làm con đầu của container. Lớp trước (quầy, bàn, sạp) thay chỗ giữ
 * <div class="bc-cho-gan"></div> đặt trong container giữa người đứng sau quầy và người đứng trước; không có thì thêm cuối.
 * opts: light "ngay"|"chieu"|"dem" · tone "kem"|"hong"|"mint"|"xanh"|"vang"|"xam" · seed · khong: ["clock", …] (bỏ vật)
 *       · vị trí vật: clock: [x, y] (góc trên trái, cỡ 190), window: [x, y] · gio: [giờ, phút] kim đồng hồ
 *       · san: false (thuong-hieu không có sàn).
 */
(function () {
  var RS = window.RS;
  var NS = "http://www.w3.org/2000/svg";
  var LIGHTS = ["ngay", "chieu", "dem"];
  var TONES = ["kem", "hong", "mint", "xanh", "vang", "xam"];
  var uid = 0;

  function n(v) { return Math.round(v * 10) / 10; }
  function R(x, y, w, h, k, rx, at) { return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '"' + (rx ? ' rx="' + rx + '"' : "") + ' class="' + k + '"' + (at ? " " + at : "") + "/>"; }
  function O(cx, cy, r, k, at) { return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" class="' + k + '"' + (at ? " " + at : "") + "/>"; }
  function E(cx, cy, rx, ry, k, rot) { return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" class="' + k + '"' + (rot ? ' transform="rotate(' + rot + " " + n(cx) + " " + n(cy) + ')"' : "") + "/>"; }
  function P(d, k, at) { return '<path d="' + d + '" class="' + k + '"' + (at ? " " + at : "") + "/>"; }
  function G(inner, k, at) { return "<g" + (k ? ' class="' + k + '"' : "") + (at ? " " + at : "") + ">" + inner + "</g>"; }
  function L(x1, y1, x2, y2, k, w) { return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" class="' + k + '" stroke-width="' + (w || 4) + '"/>'; }
  function part(name, cx, cy) { return 'data-part="' + name + '" data-cx="' + n(cx) + '" data-cy="' + n(cy) + '"'; }
  function pick(rng, list) { return list[Math.floor(rng() * list.length) % list.length]; }

  /* ---------- Vật dùng chung ---------- */

  function wall(c, y0, y1) {
    var id = c.id("w");
    y0 = y0 == null ? -60 : y0; y1 = y1 == null ? 1980 : y1;
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g-wall"/><stop offset="1" class="g-wall-d"/></linearGradient></defs>' +
      '<rect x="-60" y="' + y0 + '" width="1200" height="' + (y1 - y0) + '" fill="url(#' + id + ')"/>';
  }

  function sky(c, y0, y1) {
    var id = c.id("s");
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g-sky"/><stop offset="1" class="g-sky-2"/></linearGradient></defs>' +
      '<rect x="-60" y="' + y0 + '" width="1200" height="' + (y1 - y0) + '" fill="url(#' + id + ')"/>';
  }

  /** Quầng sáng đèn (chỉ hiện ban đêm). */
  function glow(c, cx, cy, r, cls, kind) {
    var id = c.id("g"), s = kind === "ring" ? ["g-ring", "g-ring-0"] : ["g-glow", "g-glow-0"];
    return '<defs><radialGradient id="' + id + '"><stop offset="0" class="' + s[0] + '"/><stop offset="1" class="' + s[1] + '"/></radialGradient></defs>' +
      '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '" fill="url(#' + id + ')" class="' + (cls || "bc-chi-dem") + '" data-o="' + n(cx) + " " + n(cy) + '"/>';
  }

  /** Đồng hồ treo tường, góc trên trái (x, y), cỡ 190. Kim chỉ hh:mm. */
  function clock(x, y, hh, mm) {
    var cx = x + 95, cy = y + 95, ha = (hh % 12) * 30 + mm * 0.5, ma = mm * 6, ticks = "";
    [0, 90, 180, 270].forEach(function (a) { ticks += R(cx - 3, y + 22, 6, 16, "k-metal", 3, 'transform="rotate(' + a + " " + cx + " " + cy + ')"'); });
    return G(O(cx, cy + 16, 95, "k-shade") + O(cx, cy, 95, "k-wood-d") + O(cx, cy, 81, "k-card") + ticks +
      G(R(cx - 6, cy - 50, 12, 56, "k-ink", 6), "bc-kim-h") + G(R(cx - 4, cy - 70, 8, 76, "k-ink", 4), "bc-kim-m") + O(cx, cy, 9, "k-red"),
      "", part("clock", cx, cy) + ' data-h="' + ha + '" data-m="' + ma + '"');
  }

  /** Đèn thả trần ở x, dây dài len; đung đưa (bc-lac). */
  function pendant(c, x, len, dome) {
    var shade = dome
      ? P("M" + (x - 70) + " " + (len + 56) + " Q" + (x - 66) + " " + len + " " + x + " " + len + " Q" + (x + 66) + " " + len + " " + (x + 70) + " " + (len + 56) + " Z", "k-metal-d")
      : P("M" + (x - 57) + " " + (len + 60) + " Q" + (x - 57) + " " + len + " " + x + " " + len + " Q" + (x + 57) + " " + len + " " + (x + 57) + " " + (len + 60) + " Z", "l-gold");
    return G(glow(c, x, len + 220, 300) + L(x, -60, x, len + 4, "s-wire", 5) + shade + O(x, len + 60, 15, "l-bulb"), "bc-lac", 'data-o="' + x + ' -60"');
  }

  /** Dây đèn trang trí ngang khung, đèn nháy ban đêm. */
  function fairy(c, y, amp, count) {
    var pts = [], bulbs = "";
    for (var i = 0; i <= count; i++) {
      var x = -60 + (i * 1200) / count, yy = y + amp * Math.sin(i * 0.9);
      pts.push(n(x) + " " + n(yy));
      bulbs += O(x, yy + 14, 22, "l-bulb bc-chi-dem bc-nhay", 'opacity="0.35"') + O(x, yy + 14, 9, "l-bulb");
    }
    return P("M" + pts.join(" L"), "s-wire") + bulbs;
  }

  /** Chậu cây: đáy chậu ở (x, y), rộng 120×s. */
  function plant(x, y, s, sway) {
    var w = 120 * s, h = 110 * s, leaves = "";
    [-62, -38, -14, 12, 36, 60, -26, 24].forEach(function (a, i) {
      var len = (i > 5 ? 120 : 150) * s;
      leaves += E(x + w / 2 + Math.sin((a * Math.PI) / 180) * len * 0.55, y - h - Math.cos((a * Math.PI) / 180) * len * 0.55, 30 * s, len * 0.55, i % 2 ? "k-plant-d" : "k-plant", a);
    });
    return G(G(leaves, sway ? "bc-la" : "", 'data-o="' + n(x + w / 2) + " " + n(y - h) + '"') +
      P("M" + n(x) + " " + n(y - h) + " H" + n(x + w) + " L" + n(x + w * 0.86) + " " + n(y) + " H" + n(x + w * 0.14) + " Z", "k-pot") + R(x - 6 * s, y - h - 4 * s, w + 12 * s, 22 * s, "k-pot", 6));
  }

  /** Ly nước có ống hút, góc trên trái thân ly (x, y), 70×92. */
  function cup(x, y, k) {
    return R(x + 40, y - 48, 9, 46, "k-red", 4, 'transform="rotate(12 ' + (x + 44) + " " + (y - 2) + ')"') +
      P("M" + x + " " + y + " H" + (x + 70) + " V" + (y + 70) + " Q" + (x + 70) + " " + (y + 92) + " " + (x + 48) + " " + (y + 92) + " H" + (x + 22) + " Q" + x + " " + (y + 92) + " " + x + " " + (y + 70) + " Z", k) +
      R(x - 6, y - 12, 82, 18, "k-card", 9);
  }

  /** Cốc có khói bốc (bc-khoi), đáy cốc ở (x, y). */
  function mug(x, y, k) {
    return G(P("M" + (x + 20) + " " + (y - 100) + " q -14 -22 0 -44 t 0 -44", "s-steam") + P("M" + (x + 50) + " " + (y - 96) + " q -14 -22 0 -44 t 0 -44", "s-steam"), "bc-khoi") +
      O(x + 78, y - 50, 22, "s-wood", 'stroke-width="10"') + R(x, y - 86, 76, 86, k || "k-card", 14);
  }

  /** Cửa sổ có khung: ngày trời xanh + mây, đêm trăng + sao + phố lên đèn. */
  function windowBox(c, x, y, w, h, frame, rng) {
    var id = c.id("c"), sid = c.id("s");
    var city = "", lit = "", bx = x;
    while (bx < x + w) {
      var bw = 50 + rng() * 60, bh = h * (0.25 + rng() * 0.3);
      city += R(bx, y + h - bh, bw, bh + 2, "k-city");
      for (var j = 0; j < 3; j++) if (rng() < 0.6) lit += R(bx + 10 + rng() * (bw - 26), y + h - bh + 16 + rng() * (bh - 36), 12, 16, "l-lit bc-nhay");
      bx += bw + 6;
    }
    var day = G(O(x + w * 0.72, y + h * 0.22, 34, "k-sun") + G(E(x + w * 0.3, y + h * 0.36, 60, 22, "k-cloud") + E(x + w * 0.42, y + h * 0.31, 40, 26, "k-cloud"), "bc-may"), "bc-chi-ngay");
    var night = G(O(x + w * 0.62, y + h * 0.18, 40, "l-moon") + O(x + w * 0.62 - 16, y + h * 0.18 - 8, 36, "k-night") +
      O(x + w * 0.15, y + h * 0.12, 4, "l-star") + O(x + w * 0.85, y + h * 0.1, 4, "l-star") + O(x + w * 0.3, y + h * 0.36, 4, "l-star") + O(x + w * 0.7, y + h * 0.45, 4, "l-star"), "bc-chi-dem");
    return '<defs><clipPath id="' + id + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="16"/></clipPath>' +
      '<linearGradient id="' + sid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g-sky"/><stop offset="1" class="g-sky-2"/></linearGradient></defs>' +
      G('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#' + sid + ')"/>' + day + night + city + G(lit, "bc-chi-dem"), "", 'clip-path="url(#' + id + ')"') +
      '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="' + (h - 16) + '" rx="12" class="s-wood" fill="none" stroke-width="16"/>' +
      R(x + w / 2 - 6, y, 12, h, frame) + R(x, y + h * 0.48, w, 12, frame) + R(x - 20, y + h - 6, w + 40, 22, frame, 6);
  }

  /** Thùng carton, đáy (x, yb), rộng w, cao h. */
  function carton(x, yb, w, h) {
    return R(x, yb - h, w, h, "k-carton") + R(x + w - 16, yb - h, 16, h, "k-carton-d") + R(x + w / 2 - 12, yb - h, 24, h * 0.4, "k-tape") + R(x + 14, yb - h * 0.42, w * 0.32, h * 0.2, "k-card", 3);
  }

  /* ---------- Các bối cảnh ---------- */

  var SETS = {};

  // Quán nước / quán cà phê: bảng menu, đèn thả, dây đèn, kệ ly, đồng hồ; lớp trước là quầy.
  SETS["quan"] = { tone: "kem", light: "ngay", draw: function (c, o) {
    var k = o.clock || [110, 250], s = wall(c) + R(-60, 1000, 1200, 400, "k-wall-d") + R(-60, 994, 1200, 12, "k-wood-d");
    s += fairy(c, 70, 26, 14) + pendant(c, 420, 140) + pendant(c, 1000, 110);
    var board = R(606, 216, 380, 290, "k-shade", 22) + R(600, 200, 380, 290, "k-wood-d", 22) + R(614, 214, 352, 262, "k-board", 12);
    [[80, 170], [116, 120], [190, 160], [226, 100], [300, 150], [336, 110]].forEach(function (l, i) { if (200 + l[0] < 470) board += R(i % 2 ? 780 : 750, 200 + l[0], l[1], 12, "k-chalk", 6); });
    board += O(690, 300, 34, "k-chalk") + O(690, 400, 30, "k-chalk");
    s += G(board, "", part("board", 790, 345));
    if (c.has("clock")) s += clock(k[0], k[1], (o.gio || [10, 10])[0], (o.gio || [10, 10])[1]);
    s += R(-80, 686, 1240, 14, "k-shade") + R(-80, 660, 1240, 26, "k-wood");
    for (var i = 0; i < 4; i++) {
      var jx = 30 + i * 100;
      s += R(jx, 560, 80, 100, "k-glass", 14) + O(jx + 26, 630, 14, "k-pollen") + O(jx + 52, 618, 12, "k-b") + O(jx + 40, 645, 12, "k-pollen") + R(jx - 4, 548, 88, 18, "k-wood-d", 6);
    }
    [[520, "k-pollen"], [610, "k-petal"], [700, "k-c"], [880, "k-pollen"], [970, "k-petal"]].forEach(function (u) { s += cup(u[0], 568, u[1]); });
    s += plant(790, 660, 0.55, true);
    var g = R(-100, 1340, 1280, 34, "k-wood") + R(-100, 1374, 1280, 12, "k-wood-d") + R(-100, 1386, 1280, 600, "k-counter");
    for (var x = 20; x < 1120; x += 140) g += R(x, 1420, 8, 520, "k-wood-d", 4, 'opacity="0.25"');
    return { svg: s, gan: g };
  } };

  // Phòng ở nhà: cửa sổ có rèm (ngày: trời mây; đêm: trăng, phố lên đèn), đồng hồ, đèn bàn, cây; lớp trước là bàn.
  SETS["nha"] = { tone: "xanh", light: "dem", draw: function (c, o) {
    var w = o.window || [760, 600], k = o.clock || [110, 560], wx = w[0], wy = w[1], ww = 300, wh = 420;
    var s = wall(c) + R(-60, 1430, 1200, 16, "k-wall-d");
    s += P("M" + (wx - 70) + " " + (wy - 70) + " H" + (wx + 30) + " Q" + wx + " " + (wy + wh / 2) + " " + (wx + 40) + " " + (wy + wh + 70) + " H" + (wx - 60) + " Q" + (wx - 90) + " " + (wy + wh / 2) + " " + (wx - 70) + " " + (wy - 70) + " Z", "k-curtain");
    s += P("M" + (wx + ww - 30) + " " + (wy - 70) + " H" + (wx + ww + 70) + " Q" + (wx + ww + 90) + " " + (wy + wh / 2) + " " + (wx + ww + 60) + " " + (wy + wh + 70) + " H" + (wx + ww - 40) + " Q" + (wx + ww) + " " + (wy + wh / 2) + " " + (wx + ww - 30) + " " + (wy - 70) + " Z", "k-curtain");
    s += G(windowBox(c, wx, wy, ww, wh, "k-wood-d", c.rng), "", part("window", wx + ww / 2, wy + wh / 2));
    s += R(wx - 110, wy - 84, ww + 220, 14, "k-wood-d", 7);
    if (c.has("clock")) s += clock(k[0], k[1], (o.gio || [22, 0])[0], (o.gio || [22, 0])[1]);
    s += G(glow(c, 290, 1190, 560, "bc-chi-dem bc-tho"), "", part("glow", 290, 1190));
    s += R(140, 1270, 20, 220, "k-wood-d") + P("M40 1270 Q40 1150 150 1150 Q260 1150 260 1270 Z", "l-gold") + O(150, 1282, 26, "l-bulb bc-chi-dem");
    s += plant(890, 1440, 1.25, true);
    var g = R(-100, 1470, 1280, 30, "k-wood") + R(-100, 1500, 1280, 500, "k-wood-d") + P("M600 1470 L630 1438 H820 L790 1470 Z", "k-paper") + mug(890, 1470, "k-petal");
    return { svg: s, gan: g };
  } };

  // Tiệm tạp hoá: mái bạt sọc, kệ hàng ba tầng (hàng hoá không nhãn chữ); lớp trước là tủ kính quầy.
  SETS["cua-hang"] = { tone: "vang", light: "ngay", draw: function (c) {
    var rng = c.rng, s = wall(c), x;
    for (var i = 0; i < 14; i++) s += R(-60 + i * 90, -60, 90, 250, i % 2 ? "k-white" : "k-red") + O(-15 + i * 90, 190, 45, i % 2 ? "k-white" : "k-red");
    s += pendant(c, 540, 300);
    var colors = ["k-a", "k-b", "k-c", "k-petal", "k-pollen", "k-ok", "k-red", "k-card"];
    [780, 1020, 1260].forEach(function (sy) {
      [[44, 530], [554, 1040]].forEach(function (bay) {
        var bx = bay[0] + 8;
        while (bx < bay[1] - 50) {
          var t = rng(), col = pick(rng, colors), iw, ih;
          if (t < 0.45) { iw = 70 + rng() * 60; ih = 100 + rng() * 80; if (bx + iw > bay[1] - 8) break; s += R(bx, sy - ih, iw, ih, col, 6) + R(bx + 8, sy - ih * 0.62, iw - 16, ih * 0.22, "k-white", 4); }
          else if (t < 0.75) { iw = 40; ih = 140 + rng() * 40; if (bx + iw > bay[1] - 8) break; s += R(bx, sy - ih + 40, iw, ih - 40, col, 14) + R(bx + 12, sy - ih + 10, 16, 34, col, 4) + R(bx + 10, sy - ih, 20, 14, "k-ink", 4) + R(bx + 4, sy - ih * 0.5, iw - 8, 30, "k-white", 4); }
          else { iw = 76; ih = 92; if (bx + iw > bay[1] - 8) break; s += R(bx, sy - ih, iw, ih, "k-glass", 14) + O(bx + 24, sy - 30, 14, col) + O(bx + 50, sy - 40, 14, col) + R(bx - 4, sy - ih - 12, iw + 8, 18, "k-wood-d", 6); }
          bx += iw + 10;
        }
      });
      s += R(20, sy + 22, 1044, 12, "k-shade") + R(20, sy, 1044, 22, "k-wood");
    });
    s += R(20, 560, 24, 860, "k-wood-d") + R(530, 560, 24, 860, "k-wood-d") + R(1040, 560, 24, 860, "k-wood-d");
    var g = "";
    for (x = 0; x < 1080; x += 150) g += R(x + 20, 1500, 90, 70 + (x % 300 ? 30 : 0), pick(rng, colors), 8);
    g = R(-100, 1400, 1280, 30, "k-wood") + g + R(-100, 1430, 1280, 260, "k-glass") + P("M80 1450 L200 1670 M300 1450 L420 1670", "s-steam", 'opacity="0.5"') + R(-100, 1690, 1280, 300, "k-wood-d");
    return { svg: s, gan: g };
  } };

  // Văn phòng: cửa kính lớn nhìn ra phố (ngày/đêm), đèn trần, cây cao; lớp trước là bàn làm việc + màn hình biểu đồ.
  SETS["van-phong"] = { tone: "xam", light: "ngay", draw: function (c) {
    var rng = c.rng, s = wall(c), x0 = 60, y0 = 330, w = 960, h = 820, id = c.id("c"), sid = c.id("s"), city = "", lit = "", bx = x0;
    s += R(100, 40, 360, 22, "l-bulb", 11) + R(620, 40, 360, 22, "l-bulb", 11) + glow(c, 280, 150, 300) + glow(c, 800, 150, 300);
    while (bx < x0 + w) {
      var bw = 90 + rng() * 90, bh = 220 + rng() * 320, col = pick(rng, ["k-fe", "k-fc", "k-metal", "k-fd"]);
      city += R(bx, y0 + h - bh, bw, bh, col) + R(bx, y0 + h - bh, bw, 14, "k-shade");
      for (var yy = y0 + h - bh + 30; yy < y0 + h - 30; yy += 46) for (var xx = bx + 14; xx < bx + bw - 20; xx += 30) {
        city += R(xx, yy, 16, 24, "k-glass", 2);
        if (rng() < 0.4) lit += R(xx, yy, 16, 24, "l-lit bc-nhay", 2);
      }
      bx += bw + 8;
    }
    s += '<defs><clipPath id="' + id + '"><rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '"/></clipPath>' +
      '<linearGradient id="' + sid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g-sky"/><stop offset="1" class="g-sky-2"/></linearGradient></defs>' +
      G('<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" fill="url(#' + sid + ')"/>' +
        G(G(E(300, 470, 90, 30, "k-cloud") + E(360, 450, 60, 34, "k-cloud") + E(760, 560, 70, 24, "k-cloud"), "bc-may"), "bc-chi-ngay") +
        G(O(820, 440, 44, "l-moon") + O(240, 400, 4, "l-star") + O(560, 380, 4, "l-star"), "bc-chi-dem") + city + G(lit, "bc-chi-dem"), "", 'clip-path="url(#' + id + ')"');
    s += G(R(x0 - 14, y0 - 14, w + 28, 14, "k-metal-d") + R(x0 - 14, y0, 14, h, "k-metal-d") + R(x0 + w, y0, 14, h, "k-metal-d") + R(x0 + 320, y0, 10, h, "k-metal-d") + R(x0 + 640, y0, 10, h, "k-metal-d") + R(x0, y0 + 410, w, 10, "k-metal-d") + R(x0 - 30, y0 + h, w + 60, 26, "k-metal"), "", part("window", x0 + w / 2, y0 + h / 2));
    s += plant(10, 1420, 1.6, true);
    var bars = "";
    [[0.45, "k-a"], [0.7, "k-c"], [0.55, "k-a"], [0.9, "k-ok"], [0.75, "k-c"]].forEach(function (b, i) { bars += R(740 + i * 48, 1300 - 150 * b[0], 32, 150 * b[0], b[1], 4); });
    var g = R(-100, 1430, 1280, 28, "k-desk") + R(-100, 1458, 1280, 12, "k-metal-d") + R(-100, 1470, 1280, 520, "k-wall-d") +
      R(840, 1330, 24, 100, "k-metal-d") + R(790, 1420, 124, 12, "k-metal-d", 6) + G(R(700, 1110, 310, 220, "k-device", 16) + R(714, 1124, 282, 192, "l-screen", 8) + bars, "", part("screen", 855, 1220)) + mug(120, 1430, "k-card");
    return { svg: s, gan: g };
  } };

  // Kho hàng: tường bê tông, cửa sổ trên cao, đèn chụp, giá kệ sắt chất thùng carton; lớp trước là pallet thùng.
  SETS["kho"] = { tone: "xam", light: "ngay", draw: function (c) {
    var rng = c.rng, s = R(-60, -60, 1200, 1620, "k-concrete"), x;
    for (x = 120; x < 1140; x += 180) s += R(x, -60, 6, 1620, "k-concrete-d", 0, 'opacity="0.5"');
    s += G(R(80, 100, 920, 130, "k-sky") + G(R(80, 100, 920, 130, "k-night") + O(300, 140, 4, "l-star") + O(700, 170, 4, "l-star"), "bc-chi-dem"), "", part("window", 540, 165));
    for (x = 80; x <= 1000; x += 115) s += R(x - 5, 96, 10, 138, "k-metal-d");
    s += R(70, 92, 940, 12, "k-metal-d") + R(70, 228, 940, 12, "k-metal-d");
    s += pendant(c, 270, 300, true) + pendant(c, 810, 300, true);
    var ups = [20, 370, 710, 1040];
    [860, 1160, 1460].forEach(function (by) {
      for (var b = 0; b < 3; b++) {
        var bx = ups[b] + 36;
        while (bx < ups[b + 1] - 60) {
          var w = 90 + rng() * 70, h = 130 + rng() * 120;
          if (bx + w > ups[b + 1] - 10) break;
          s += carton(bx, by, w, h);
          if (h < 170 && rng() < 0.5) s += carton(bx + 10, by - h, w - 20, 90);
          bx += w + 8;
        }
      }
      s += R(20, by, 1046, 26, "k-rack-b");
    });
    ups.forEach(function (ux) { s += R(ux, 560, 26, 960, "k-rack"); });
    s += R(-60, 1500, 1200, 480, "k-concrete-d") + R(-60, 1560, 1200, 14, "k-gold");
    var g = "";
    [[-60, 380], [820, 360]].forEach(function (pl) {
      g += R(pl[0], 1820, pl[1], 30, "k-wood") + R(pl[0] + 20, 1850, 40, 30, "k-wood-d") + R(pl[0] + pl[1] - 60, 1850, 40, 30, "k-wood-d");
      g += carton(pl[0] + 10, 1820, pl[1] / 2 - 14, 170) + carton(pl[0] + pl[1] / 2, 1820, pl[1] / 2 - 14, 200) + carton(pl[0] + 40, 1650, pl[1] / 2, 150);
    });
    return { svg: s, gan: g };
  } };

  // Phố Việt: dãy nhà ống nhiều màu, ban công, mái hiên, cột điện dây chằng chịt, vỉa hè, lòng đường.
  SETS["pho"] = { tone: "kem", light: "ngay", draw: function (c) {
    var rng = c.rng, s = sky(c, -60, 1520);
    s += G(O(860, 300, 130, "k-sun", 'opacity="0.25"') + O(860, 300, 90, "k-sun"), "bc-chi-ngay");
    s += G(O(860, 300, 70, "l-moon") + [[120, 160], [380, 90], [620, 220], [980, 140], [260, 330]].map(function (p) { return O(p[0], p[1], 4, "l-star bc-nhay"); }).join(""), "bc-chi-dem");
    s += G(G(E(220, 260, 110, 36, "k-cloud") + E(300, 236, 70, 44, "k-cloud") + E(640, 420, 90, 28, "k-cloud") + E(700, 404, 56, 32, "k-cloud"), "bc-may"), "bc-chi-ngay");
    var houses = [[-60, 240, 400, "k-fa"], [180, 250, 280, "k-fb"], [430, 220, 480, "k-fc"], [650, 240, 330, "k-fd"], [890, 260, 430, "k-fe"]];
    houses.forEach(function (hs, i) {
      var x = hs[0], w = hs[1], top = hs[2];
      s += R(x, top, w, 1520 - top, hs[3]) + R(x - 8, top - 16, w + 16, 22, "k-shade") + R(x + w - 18, top, 18, 1520 - top, "k-shade");
      for (var fy = top + 60; fy + 160 < 1150; fy += 230) {
        var gw = w * 0.26;
        [x + w * 0.16, x + w * 0.58].forEach(function (gx) {
          s += R(gx, fy, gw, 140, "k-wall-d", 4) + R(gx - 16, fy, 16, 140, "k-shutter") + R(gx + gw, fy, 16, 140, "k-shutter");
          if (rng() < 0.55) s += R(gx, fy, gw, 140, "l-lit bc-chi-dem bc-nhay", 4);
        });
        s += R(x + 10, fy + 150, w - 20, 10, "k-metal-d");
        for (var bx = x + 20; bx < x + w - 20; bx += 26) s += R(bx, fy + 160, 5, 40, "k-metal-d");
        s += R(x + 10, fy + 196, w - 20, 8, "k-metal-d");
        if (rng() < 0.6) s += plant(x + 24 + rng() * (w - 110), fy + 196, 0.38);
      }
      var aw = "";
      for (var ax = x; ax < x + w; ax += 40) aw += R(ax, 1180, 20, 70, "k-white", 0, 'opacity="0.55"');
      s += P("M" + x + " 1180 H" + (x + w) + " L" + (x + w + 16) + " 1260 H" + (x - 16) + " Z", i % 2 ? "k-red" : "k-shutter") + aw +
        R(x + 20, 1262, w - 40, 238, "k-ink") + R(x + 20, 1262, w - 40, 238, "l-lit bc-chi-dem", 0, 'opacity="0.45"');
      for (var gx2 = x + 36; gx2 < x + w - 70; gx2 += 56) s += R(gx2, 1430 - rng() * 60, 40, 70 + rng() * 60, pick(rng, ["k-a", "k-b", "k-c", "k-pollen"]), 6);
    });
    s += R(100, 640, 22, 900, "k-metal-d") + R(50, 700, 120, 12, "k-metal-d") + R(60, 760, 100, 10, "k-metal-d");
    [[700, 560, 70], [700, 640, 90], [712, 720, 60], [760, 820, 110], [760, 700, 40]].forEach(function (wv) {
      s += P("M110 " + wv[0] + " Q620 " + (wv[1] + wv[2]) + " 1140 " + wv[1], "s-wire", 'stroke-width="3"');
    });
    s += O(110, 730, 26, "s-wire", 'stroke-width="5"');
    s += R(-60, 1500, 1200, 130, "k-sidewalk");
    for (var tx = -40; tx < 1140; tx += 110) s += R(tx, 1500, 4, 130, "k-curb");
    s += R(-60, 1630, 1200, 24, "k-curb") + R(-60, 1654, 1200, 330, "k-road");
    for (var dx = -20; dx < 1140; dx += 220) s += R(dx, 1810, 120, 14, "k-white", 7);
    return { svg: s };
  } };

  // Góc livestream bán hàng online: rèm phông, dây đèn, giá treo quần áo, đèn vòng; lớp trước là bàn hàng + điện thoại trên giá.
  SETS["livestream"] = { tone: "hong", light: "ngay", draw: function (c) {
    var s = "", x;
    for (var i = 0; i < 15; i++) { x = -60 + i * 80; s += P("M" + x + " -60 H" + (x + 80) + " V1370 Q" + (x + 40) + " 1400 " + x + " 1370 Z", i % 2 ? "k-wall-d" : "k-wall"); }
    s += R(-60, 1380, 1200, 600, "k-wood");
    s += fairy(c, 130, 30, 12);
    s += R(10, 520, 380, 14, "k-metal", 7) + R(20, 520, 12, 960, "k-metal-d") + R(370, 520, 12, 960, "k-metal-d") + R(-10, 1470, 70, 12, "k-metal-d", 6) + R(340, 1470, 70, 12, "k-metal-d", 6);
    ["k-a", "k-b", "k-c", "k-petal", "k-pollen"].forEach(function (k, i) {
      var hx = 60 + i * 66;
      s += P("M" + hx + " 548 q 0 -20 12 -20 q 12 0 12 14", "s-metal", 'stroke-width="5"') +
        P("M" + (hx - 34) + " 560 L" + (hx + 12) + " 548 L" + (hx + 58) + " 560 L" + (hx + 74) + " 640 L" + (hx + 50) + " 646 L" + (hx + 50) + " 840 L" + (hx - 26) + " 840 L" + (hx - 26) + " 646 L" + (hx - 50) + " 640 Z", k);
    });
    s += G(glow(c, 820, 640, 300, "bc-tho", "ring") + O(820, 640, 150, "l-ring", 'stroke-width="30"'), "", part("ring", 820, 640)) +
      R(812, 805, 16, 690, "k-metal-d") + L(820, 1495, 740, 1560, "s-metal", 10) + L(820, 1495, 900, 1560, "s-metal", 10);
    var g = R(-100, 1470, 1280, 26, "k-desk") + R(-100, 1496, 1280, 500, "k-wood-d");
    g += R(60, 1360, 130, 110, "k-petal", 8) + R(118, 1360, 14, 110, "k-white") + R(200, 1390, 110, 80, "k-c", 8) + R(60, 1300, 100, 60, "k-pollen", 8);
    g += L(930, 1470, 890, 1460, "s-metal", 8) + L(930, 1470, 970, 1460, "s-metal", 8) + R(924, 1330, 12, 140, "k-metal-d") + R(880, 1170, 100, 176, "k-device", 16) + R(888, 1180, 84, 156, "l-screen", 10);
    return { svg: s, gan: g };
  } };

  // Nền trừu tượng: báo động (lật tẩy, sự cố), sáng (giải pháp), thương hiệu (kết, CTA).
  SETS["bao-dong"] = { abstract: true, draw: function () {
    return { html: '<div class="bc-div bc-alarm"></div><div class="bc-div bc-beam bc-xoay" data-layout-allow-overflow data-part="beam" data-cx="540" data-cy="960"></div><div class="bc-div bc-scan"></div>' };
  } };
  SETS["sang"] = { abstract: true, draw: function () {
    return { html: '<div class="bc-div bc-day"></div>' +
      '<div class="bc-div bc-blob bc-troi" data-layout-allow-overflow style="left: -200px; top: 1100px; width: 700px; height: 700px; background: color-mix(in srgb, var(--color-primary) 10%, transparent)"></div>' +
      '<div class="bc-div bc-blob bc-troi" data-layout-allow-overflow style="left: 640px; top: 420px; width: 560px; height: 560px; background: color-mix(in srgb, var(--prop-gold) 16%, transparent)"></div>' };
  } };
  SETS["thuong-hieu"] = { abstract: true, draw: function (c, o) {
    return { html: '<div class="bc-div bc-brand"></div><div class="bc-div bc-rays bc-xoay" data-layout-allow-overflow data-part="rays" data-cx="540" data-cy="460"></div>',
      ganHtml: o.san === false ? "" : '<div class="bc-div bc-floor"></div>' };
  } };

  RS.SETS = SETS;

  RS.set = function (container, name, opts) {
    var def = SETS[name];
    if (!def) throw new Error('Không có bối cảnh "' + name + '". Có: ' + Object.keys(SETS).join(", "));
    var o = opts || {};
    var light = o.light || def.light || "ngay", tone = o.tone || def.tone || "kem";
    if (LIGHTS.indexOf(light) < 0) throw new Error('Ánh sáng "' + light + '" không có. Dùng: ' + LIGHTS.join(", "));
    if (TONES.indexOf(tone) < 0) throw new Error('Tông "' + tone + '" không có. Dùng: ' + TONES.join(", "));
    var khong = o.khong || [];
    var c = { id: function (s) { return "bc" + (++uid) + s; }, rng: RS.rng(o.seed || 7), has: function (p) { return khong.indexOf(p) < 0; } };
    var out = def.draw(c, o);
    function layer(cls, svg, html) {
      var d = document.createElement("div");
      d.className = "bc " + cls + " bc-" + light + " bc-tone-" + tone + " bc-set-" + name;
      d.setAttribute("data-layout-allow-overflow", "");
      d.innerHTML = (svg ? '<svg class="bc-layer" xmlns="' + NS + '" viewBox="-60 -60 1200 2040">' + svg + "</svg>" : "") + (html || "");
      return d;
    }
    var sau = layer("bc-sau", out.svg, out.html);
    container.insertBefore(sau, container.firstChild);
    var gan = null;
    if (out.gan || out.ganHtml) {
      gan = layer("bc-gan", out.gan, out.ganHtml);
      var slot = container.querySelector(".bc-cho-gan");
      if (slot) slot.parentNode.replaceChild(gan, slot); else container.appendChild(gan);
    }
    var parts = {};
    [sau, gan].forEach(function (l) { if (l) l.querySelectorAll("[data-part]").forEach(function (el) { parts[el.getAttribute("data-part")] = el; }); });
    var ck = parts.clock;
    if (ck) {
      var org = ck.getAttribute("data-cx") + " " + ck.getAttribute("data-cy");
      gsap.set(ck.querySelector(".bc-kim-h"), { rotation: +ck.getAttribute("data-h"), svgOrigin: org });
      gsap.set(ck.querySelector(".bc-kim-m"), { rotation: +ck.getAttribute("data-m"), svgOrigin: org });
    }
    return {
      name: name, light: light, tone: tone, el: sau, sau: sau, gan: gan, parts: parts,
      /** Tâm vật trong khung 1080×1920. */
      pos: function (p) {
        var el = parts[p];
        if (!el) throw new Error('Bối cảnh "' + name + '" không có vật "' + p + '". Có: ' + Object.keys(parts).join(", "));
        return [+el.getAttribute("data-cx"), +el.getAttribute("data-cy")];
      },
    };
  };

  /** Kim đồng hồ quay `turns` vòng trong `dur` giây từ `at`. */
  RS.clockSpin = function (tl, bg, at, dur, turns, ease) {
    var ck = bg.parts.clock;
    if (!ck) throw new Error('Bối cảnh "' + bg.name + '" không có đồng hồ.');
    var org = ck.getAttribute("data-cx") + " " + ck.getAttribute("data-cy"), h = +ck.getAttribute("data-h"), m = +ck.getAttribute("data-m");
    turns = turns || 3; ease = ease || "power2.in";
    tl.fromTo(ck.querySelector(".bc-kim-m"), { rotation: m, svgOrigin: org }, { rotation: m + 360 * turns, svgOrigin: org, duration: dur, ease: ease }, at);
    tl.fromTo(ck.querySelector(".bc-kim-h"), { rotation: h, svgOrigin: org }, { rotation: h + 30 * turns, svgOrigin: org, duration: dur, ease: ease }, at);
  };

  /** Nền sống suốt from–to: đèn thả đung đưa, lá rung, mây trôi, khói bốc, đèn nháy (đêm), quầng sáng thở, tia xoay, mảng màu trôi. */
  RS.setLive = function (tl, bg, from, to, seed) {
    var d = to - from, rng = RS.rng(seed || 3);
    var all = function (sel) {
      var out = [];
      [bg.sau, bg.gan].forEach(function (l) { if (l) l.querySelectorAll(sel).forEach(function (el) { out.push(el); }); });
      return out;
    };
    var loops = function (period) { return Math.max(0, Math.floor(d / period) - 1); };
    all(".bc-lac").forEach(function (el, i) {
      var p = 1.5 + i * 0.35, org = el.getAttribute("data-o");
      tl.fromTo(el, { rotation: -1.6, svgOrigin: org }, { rotation: 1.6, svgOrigin: org, duration: p, yoyo: true, repeat: loops(p), ease: "sine.inOut" }, from);
    });
    all(".bc-la").forEach(function (el, i) {
      var p = 1.8 + i * 0.4, org = el.getAttribute("data-o");
      tl.fromTo(el, { rotation: -1.2, svgOrigin: org }, { rotation: 1.2, svgOrigin: org, duration: p, yoyo: true, repeat: loops(p), ease: "sine.inOut" }, from);
    });
    all(".bc-may").forEach(function (el) { tl.fromTo(el, { x: 0 }, { x: 30 + rng() * 40, duration: d, ease: "none" }, from); });
    all(".bc-khoi").forEach(function (el) { tl.fromTo(el, { y: 12, opacity: 0.1 }, { y: -26, opacity: 0.8, duration: 1.3, yoyo: true, repeat: loops(1.3), ease: "sine.inOut" }, from); });
    if (bg.light === "dem") all(".bc-nhay").forEach(function (el) {
      var p = 0.5 + rng() * 0.9;
      tl.fromTo(el, { opacity: +(el.getAttribute("opacity") || 0.85) }, { opacity: 0.15, duration: p, yoyo: true, repeat: loops(p), ease: "steps(1)" }, from + rng() * 0.8);
    });
    all(".bc-tho").forEach(function (el) {
      var org = el.getAttribute("data-o"), v = org ? { svgOrigin: org } : { transformOrigin: "50% 50%" };
      tl.fromTo(el, Object.assign({ scale: 0.94 }, v), Object.assign({ scale: 1.06, duration: 1.8, yoyo: true, repeat: loops(1.8), ease: "sine.inOut" }, v), from);
    });
    all(".bc-xoay").forEach(function (el) { tl.fromTo(el, { rotation: 0 }, { rotation: (60 * d) / 6.5, duration: d, ease: "none" }, from); });
    all(".bc-troi").forEach(function (el, i) { tl.fromTo(el, { x: 0, y: 0 }, { x: i % 2 ? -60 : 80, y: i % 2 ? 80 : -60, duration: d, ease: "sine.inOut" }, from); });
  };
})();
