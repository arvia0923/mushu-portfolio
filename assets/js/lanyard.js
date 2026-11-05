/* ═══════════════════════════════════════════════════════════════
   工作牌 · Lanyard
   ───────────────────────────────────────────────────────────────
   移植自 React Bits 的 <Lanyard /> 组件（JavaScript + CSS 变体，
   依赖 three）。原组件是 React 外壳 + Three.js 内核；这里把
   useEffect / useRef 拆掉，变成一个 classic script：

       MSLanyard.create(container, options) -> { apply, destroy, settings }

   改动的地方只有三处，其余（Verlet 物理、卡牌几何、材质、镭射
   全息 shader、织带生成）全部保持原样：
     1. React hooks → 普通函数
     2. 卡片正面/背面画法 → 自定义「塔罗牌背」构图（见 paintBadgeFront）
     3. three r160 没有 NeutralToneMapping → 加降级
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var THREE = global.THREE;
  if (!THREE) {
    if (global.console) console.warn('[lanyard] three.js 未加载，工作牌退回静态版');
    return;
  }

  /* ── 常量（与原组件一致） ───────────────────────────────── */
  var CARD_SIZES = { portrait: [1.6, 2.25], landscape: [2.25, 1.6] };
  var ANCHORS = { left: 0.27, center: 0.5, right: 0.73 };
  var THICKNESS = 0.018;
  var BEVEL = 0.007;
  var JOINTS = 4;
  var NODE_WEIGHT = 1 / 0.05;
  var MAX_STEP = 1 / 960;
  var ITERATIONS = 2;
  var SAMPLES = 72;
  var FOV = 24;
  var STRAP_WIDTH = 0.36;
  var RING_RADIUS = 0.095;
  var RING_TUBE = 0.0135;
  var EYELET_RADIUS = 0.036;
  var CLAMP_BODY = 0.15;
  var FACE_WIDTH = 1024;

  var FINISHES = {
    glossy: { roughness: 0.42, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, foil: 0, anisotropy: 0 },
    matte: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 0.6, foil: 0, anisotropy: 0 },
    holographic: { roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, foil: 1, anisotropy: 0 },
    metallic: { roughness: 0.36, metalness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.18, foil: 0, anisotropy: 0.7 }
  };

  var METALS = {
    silver: { color: '#d9dce2', roughness: 0.16 },
    gold: { color: '#e4b965', roughness: 0.2 },
    graphite: { color: '#4d4f55', roughness: 0.28 }
  };

  var BAND_COLUMNS = [0, 0.07, 0.93, 1];
  var BAND_BEND = [-0.95, -0.28, 0.28, 0.95];
  var FLIP_SPIN = 9;

  var GOLD = '201, 168, 106';
  var CREAM = '232, 224, 208';
  var SILVER = '185, 179, 201';

  /* ── 全息箔 shader（原文照搬） ───────────────────────────── */
  var FOIL_VERTEX_HEAD = `
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;
`;

  var FOIL_VERTEX_BODY = `
vFoilUv = uv;
vFoilX = normalize((modelViewMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
vFoilY = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
`;

  var FOIL_FRAGMENT_HEAD = `
uniform float foilStrength;
uniform float foilAspect;
uniform vec3 foilKey;
uniform vec3 foilFill;
uniform vec3 foilTop;
varying vec2 vFoilUv;
varying vec3 vFoilX;
varying vec3 vFoilY;

float foilHash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float foilBump(float t, float center, float width) {
  float x = (t - center) / width;
  return max(0.0, 1.0 - x * x);
}

vec3 foilSpectrum(float t) {
  return vec3(
    foilBump(t, 0.82, 0.32) + 0.4 * foilBump(t, 0.02, 0.12),
    foilBump(t, 0.5, 0.26),
    foilBump(t, 0.18, 0.24)
  );
}

vec3 foilGrating(float u, float spacing) {
  vec3 color = vec3(0.0);
  for (int m = 1; m <= 2; m++) {
    float order = float(m);
    float t = (spacing * abs(u) / order - 0.38) / 0.32;
    color += foilSpectrum(t) / order;
  }
  return color;
}

vec3 foilShard(vec2 p) {
  vec2 base = floor(p);
  float best = 9.0;
  float edge = 9.0;
  vec2 id = base;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 site = cell + vec2(foilHash(cell), foilHash(cell + 7.31)) * 0.9 + 0.05;
      float d = length(site - p);
      if (d < best) {
        edge = best;
        best = d;
        id = cell;
      } else if (d < edge) {
        edge = d;
      }
    }
  }
  return vec3(foilHash(id + 3.17), foilHash(id + 11.73), edge - best);
}
`;

  var FOIL_FRAGMENT_BODY = `
if (foilStrength > 0.0) {
  vec3 foilView = normalize(vViewPosition);
  vec3 foilNormal = normalize(normal);
  vec2 foilP = vec2(vFoilUv.x, vFoilUv.y * foilAspect);
  vec3 shard = foilShard(foilP * 26.0);
  vec2 ray = foilP - vec2(-1.6, 2.6 * foilAspect);
  float angle = atan(ray.y, ray.x) + (shard.x - 0.5) * 0.16;
  vec3 grating = normalize(vFoilX * cos(angle) + vFoilY * sin(angle));
  float spacing = 1.7 * (0.95 + shard.y * 0.1);
  vec3 rainbow = foilGrating(dot(foilKey + foilView, grating), spacing);
  rainbow += 0.6 * foilGrating(dot(foilTop + foilView, grating), spacing);
  rainbow *= 0.8 + 0.2 * smoothstep(0.0, 0.04, shard.z);
  rainbow = max(rainbow - 0.35 * min(rainbow.r, min(rainbow.g, rainbow.b)), 0.0);
  vec2 grid = foilP * 64.0;
  vec2 cell = floor(grid);
  vec2 jitter = vec2(foilHash(cell + 1.7), foilHash(cell + 9.2));
  float flake = smoothstep(0.32, 0.06, length(fract(grid) - jitter * 0.6 - 0.2)) * step(0.45, foilHash(cell + 4.4));
  vec3 facet = normalize(foilNormal + (vFoilX * (jitter.x - 0.5) + vFoilY * (jitter.y - 0.5)) * 0.8);
  float glint = pow(max(dot(reflect(-foilKey, facet), foilView), 0.0), 28.0);
  glint += 0.7 * pow(max(dot(reflect(-foilTop, facet), foilView), 0.0), 28.0);
  float fine = 1.0 - smoothstep(0.35, 0.9, max(fwidth(grid.x), fwidth(grid.y)));
  vec3 sparkle = flake * glint * fine * (vec3(0.7) + foilGrating(dot(foilKey + foilView, grating) + jitter.x * 0.4, spacing));
  float ink = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float foil = foilStrength * (0.08 + 0.92 * smoothstep(0.04, 0.7, ink));
  float facing = clamp(dot(foilNormal, foilView), 0.0, 1.0);
  float tint = clamp(dot(rainbow, vec3(0.4)), 0.0, 1.0);
  outgoingLight = outgoingLight * (1.0 - foil * (0.3 + 0.32 * tint)) + (rainbow * 0.62 * (0.4 + 0.6 * facing) + sparkle * 1.6) * foil;
}
`;

  /* ── 小工具 ─────────────────────────────────────────────── */
  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function mix(a, b, t) { return a + (b - a) * t; }

  function parseColor(value, fallback) {
    try {
      var ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return fallback;
      ctx.fillStyle = '#000000';
      ctx.fillStyle = value;
      var resolved = ctx.fillStyle;
      if (resolved.startsWith('#')) {
        var n = parseInt(resolved.slice(1), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
      }
      var parts = resolved.match(/[\d.]+/g);
      if (!parts || parts.length < 3) return fallback;
      return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
    } catch (e) {
      return fallback;
    }
  }

  function luminance(rgb) { return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; }
  function toCss(rgb, alpha) {
    if (alpha == null) alpha = 1;
    return 'rgba(' + Math.round(rgb[0] * 255) + ', ' + Math.round(rgb[1] * 255) + ', ' +
           Math.round(rgb[2] * 255) + ', ' + alpha + ')';
  }

  function seeded(start) {
    var state = start >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ── 画布文字：手动字距，跨浏览器一致 ───────────────────── */
  function drawTracked(ctx, text, cx, y, tracking, align) {
    var chars = Array.from(String(text));
    var widths = chars.map(function (c) { return ctx.measureText(c).width; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + tracking * Math.max(0, chars.length - 1);
    var x = align === 'center' ? cx - total / 2 : (align === 'right' ? cx - total : cx);
    var prev = ctx.textAlign;
    ctx.textAlign = 'left';
    for (var i = 0; i < chars.length; i++) {
      ctx.fillText(chars[i], x, y);
      x += widths[i] + tracking;
    }
    ctx.textAlign = prev;
    return total;
  }

  function traceRoundedRect(path, x, y, width, height, radius) {
    var r = Math.max(0, Math.min(radius, width / 2, height / 2));
    var k = r * 0.4477;
    path.moveTo(x + r, y);
    path.lineTo(x + width - r, y);
    path.bezierCurveTo(x + width - k, y, x + width, y + k, x + width, y + r);
    path.lineTo(x + width, y + height - r);
    path.bezierCurveTo(x + width, y + height - k, x + width - k, y + height, x + width - r, y + height);
    path.lineTo(x + r, y + height);
    path.bezierCurveTo(x + k, y + height, x, y + height - k, x, y + height - r);
    path.lineTo(x, y + r);
    path.bezierCurveTo(x, y + k, x + k, y, x + r, y);
  }

  function loadImage(cache, url) {
    if (!url) return Promise.resolve(null);
    var cached = cache.get(url);
    if (cached) return cached;
    var promise = new Promise(function (resolve) {
      var image = new Image();
      // file:// 下加 crossOrigin 会直接失败；同源 http 才需要
      if (location.protocol !== 'file:') image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.onload = function () { resolve(image); };
      image.onerror = function () { resolve(null); };
      image.src = url;
    });
    cache.set(url, promise);
    return promise;
  }

  /* ═══════════════════════════════════════════════════════════
     金属边框层
     ─────────────────────────────────────────────────────────
     牌框图按 cover 铺到牌面上，把近黑的像素抠成透明，
     只留下繁复的金属雕花（荆棘藤蔓 / 月相盈亏 / 蝴蝶 / 星象），
     底下的天鹅绒紫透出来。
     这一层单独一块 mesh，用 PBR 金属材质（metalness 1 / 低 roughness）
     + 环境反射：卡牌翻转时，反光会扫过雕花，就是「金属光泽」。
     ═══════════════════════════════════════════════════════════ */

  /* 图片按 cover 铺满目标框时的绘制参数 */
  function coverBox(cw, ch, iw, ih) {
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw: dw, dh: dh };
  }

  /* 自动找出牌框中间的镂空窗口（最长连续暗段）。
     换一张牌框图也能用，不用改代码。 */
  function detectWindow(image) {
    var fallback = { x0: 0.10, y0: 0.07, x1: 0.90, y1: 0.90 };
    if (!image) return fallback;
    var W = 180;
    var H = Math.max(1, Math.round(W * image.height / image.width));
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    if (!ctx) return fallback;
    try { ctx.drawImage(image, 0, 0, W, H); } catch (e) { return fallback; }
    var data;
    try { data = ctx.getImageData(0, 0, W, H).data; } catch (e) { return fallback; }
    var lum = new Float32Array(W * H);
    for (var i = 0; i < W * H; i++) {
      lum[i] = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2];
    }
    var thr = 26;
    var median = function (arr) {
      if (!arr.length) return 0;
      var s = arr.slice().sort(function (a, b) { return a - b; });
      return s[Math.floor(s.length / 2)];
    };
    // 横向：中段若干行，各行最长暗段
    var xs0 = [], xs1 = [];
    for (var r = Math.round(H * 0.28); r <= Math.round(H * 0.72); r++) {
      var best = -1, bestLen = 0, start = -1;
      for (var x = 0; x < W; x++) {
        if (lum[r * W + x] <= thr) {
          if (start < 0) start = x;
          if (x - start + 1 > bestLen) { bestLen = x - start + 1; best = start; }
        } else { start = -1; }
      }
      if (bestLen > W * 0.28) { xs0.push(best); xs1.push(best + bestLen - 1); }
    }
    // 纵向：中段若干列，各列最长暗段
    var ys0 = [], ys1 = [];
    for (var cc = Math.round(W * 0.32); cc <= Math.round(W * 0.68); cc++) {
      var b2 = -1, l2 = 0, s2 = -1;
      for (var y = 0; y < H; y++) {
        if (lum[y * W + cc] <= thr) {
          if (s2 < 0) s2 = y;
          if (y - s2 + 1 > l2) { l2 = y - s2 + 1; b2 = s2; }
        } else { s2 = -1; }
      }
      if (l2 > H * 0.28) { ys0.push(b2); ys1.push(b2 + l2 - 1); }
    }
    if (!xs0.length || !ys0.length) return fallback;
    var win = {
      x0: median(xs0) / W,
      x1: (median(xs1) + 1) / W,
      y0: median(ys0) / H,
      y1: (median(ys1) + 1) / H
    };
    if (win.x1 - win.x0 < 0.28 || win.y1 - win.y0 < 0.28) return fallback;
    return win;
  }

  /* 把牌框图按 cover 画上去，近黑处抠成透明，只留金属花纹 */
  function paintFrameOverlay(canvas, image, opts) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!image) return;
    var box = coverBox(W, H, image.width, image.height);
    ctx.drawImage(image, box.dx, box.dy, box.dw, box.dh);
    var low = opts.frameAlphaLow == null ? 6 : opts.frameAlphaLow;
    var high = opts.frameAlphaHigh == null ? 22 : opts.frameAlphaHigh;
    var data;
    try { data = ctx.getImageData(0, 0, W, H); } catch (e) { return; }
    var d = data.data;
    for (var i = 0; i < d.length; i += 4) {
      var lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      d[i + 3] = Math.round(255 * clamp((lum - low) / Math.max(1, high - low), 0, 1));
    }
    ctx.putImageData(data, 0, 0);
  }

  /* ═══════════════════════════════════════════════════════════
     卡片正面（内层）：照片 + 名字 + 身份，画在牌框的镂空窗口里
     ═══════════════════════════════════════════════════════════ */
  function paintBadgeFront(canvas, image, rgb, opts, win) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    var gold = 'rgba(' + GOLD + ', ';

    // 底色：天鹅绒紫
    ctx.fillStyle = toCss(rgb);
    ctx.fillRect(0, 0, W, H);

    // 窗口 = 牌框中间的镂空
    var wx = win.x, wy = win.y, ww = win.w, wh = win.h;

    ctx.save();
    ctx.beginPath();
    ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    if (image) {
      var scale = Math.max(ww / image.width, wh / image.height);
      var dw = image.width * scale, dh = image.height * scale;
      var bias = 0.42;   // 往上多留一点，保住脸和玫瑰
      ctx.drawImage(image, wx + (ww - dw) / 2, wy + (wh - dh) * bias, dw, dh);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(wx, wy, ww, wh);
    }
    // 底部渐隐，名字压在渐变上
    var fade = Math.round(wh * 0.44);
    var grad = ctx.createLinearGradient(0, wy + wh - fade, 0, wy + wh);
    grad.addColorStop(0, toCss(rgb, 0));
    grad.addColorStop(0.45, toCss(rgb, 0.74));
    grad.addColorStop(1, toCss(rgb, 0.97));
    ctx.fillStyle = grad;
    ctx.fillRect(wx, wy + wh - fade, ww, fade);
    ctx.restore();

    // 窗口一圈暗金细线，压住照片边缘
    ctx.strokeStyle = gold + '0.42)';
    ctx.lineWidth = Math.max(1, W * 0.0016);
    ctx.strokeRect(wx + 0.5, wy + 0.5, ww - 1, wh - 1);

    // 文字区
    var nameY = wy + wh * 0.795;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // 月相徽记
    ctx.fillStyle = gold + '0.95)';
    ctx.font = Math.round(W * 0.05) + 'px Georgia, "Times New Roman", serif';
    ctx.fillText('☾', W / 2, nameY - Math.round(W * 0.072));

    // 名字
    ctx.fillStyle = 'rgb(' + CREAM + ')';
    ctx.font = '500 ' + Math.round(W * 0.096) + 'px "Optima", "Songti SC", "STSong", "Noto Serif SC", Georgia, serif';
    drawTracked(ctx, opts.name || '牧舒', W / 2, nameY, W * 0.03, 'center');

    // 身份
    ctx.fillStyle = 'rgb(' + SILVER + ')';
    ctx.font = Math.round(W * 0.027) + 'px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif';
    drawTracked(ctx, opts.role || 'AIGC / 影像 / 视觉实验', W / 2, nameY + wh * 0.095, W * 0.012, 'center');
  }

  /* ═══════════════════════════════════════════════════════════
     卡背文字块：压在「压暗后的图」上
     —— 动画 / 影像 / 互动 · 这是一个捕捉梦境的暗室 · 欢迎联系 · Scroll 小字
     ═══════════════════════════════════════════════════════════ */
  function paintBackText(ctx, W, H, opts) {
    var gold = 'rgba(' + GOLD + ', ';
    var silver = 'rgba(' + SILVER + ', ';
    var cx = W / 2;
    var SERIF = '"LXGW WenKai", "霞鹜文楷", "STZhongsong", "华文中宋", "Optima", ' +
                '"Songti SC", "STSong", "SimSun", "宋体", Georgia, serif';
    var SANS = '"Optima", "Inter", "PingFang SC", "Microsoft YaHei", sans-serif';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // 上下两道暗金细线，把文字块夹住
    ctx.strokeStyle = gold + '0.34)';
    ctx.lineWidth = Math.max(1, W * 0.0018);
    var ruleW = W * 0.44;
    [H * 0.155, H * 0.645].forEach(function (y) {
      ctx.beginPath();
      ctx.moveTo(cx - ruleW / 2, y);
      ctx.lineTo(cx + ruleW / 2, y);
      ctx.stroke();
    });

    // 动画 / 影像 / 互动
    ctx.fillStyle = gold + '0.92)';
    ctx.font = '500 ' + Math.round(W * 0.050) + 'px ' + SERIF;
    drawTracked(ctx, opts.backKicker || '动画 / 影像 / 互动', cx, H * 0.250, W * 0.010, 'center');

    // 这是一个捕捉梦境的暗室。
    ctx.fillStyle = 'rgb(' + CREAM + ')';
    ctx.font = '500 ' + Math.round(W * 0.055) + 'px ' + SERIF;
    drawTracked(ctx, opts.backTitle || '这是一个捕捉梦境的暗室。', cx, H * 0.360, W * 0.007, 'center');

    // 如果你也喜欢奇奇怪怪的浪漫，欢迎联系：
    ctx.fillStyle = silver + '0.92)';
    ctx.font = '400 ' + Math.round(W * 0.040) + 'px ' + SERIF;
    drawTracked(ctx, opts.backNote || '如果你也喜欢奇奇怪怪的浪漫，欢迎联系：', cx, H * 0.460, W * 0.003, 'center');

    // Email: 1034136944
    ctx.fillStyle = gold + '0.95)';
    ctx.font = '500 ' + Math.round(W * 0.055) + 'px ' + SANS;
    drawTracked(ctx, opts.backEmail || 'Email: 1034136944', cx, H * 0.560, W * 0.010, 'center');

    // Scroll to explore the illusions.
    ctx.fillStyle = silver + '0.48)';
    ctx.font = Math.round(W * 0.029) + 'px ' + SANS;
    drawTracked(ctx, opts.backFoot || 'Scroll to explore the illusions.', cx, H * 0.720, W * 0.005, 'center');
  }

  /* ═══════════════════════════════════════════════════════════
     卡片背面：给了图就整幅铺上（金属材质，翻面整块都在反光），
     再压暗一层、叠上文字块；
     没给图则退回程序化的塔罗牌背（暗金月相 + 星点）
     ═══════════════════════════════════════════════════════════ */
  function paintBadgeBack(canvas, rgb, opts, image) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    var gold = 'rgba(' + GOLD + ', ';
    var cx = W / 2, cy = H * 0.42;

    ctx.fillStyle = toCss(rgb);
    ctx.fillRect(0, 0, W, H);

    if (image) {
      var box = coverBox(W, H, image.width, image.height);
      ctx.drawImage(image, box.dx, box.dy, box.dw, box.dh);

      // 压暗：整幅一层午夜紫黑，下半再叠一道渐变，给文字让出底子
      var dim = opts.backDim == null ? 0.62 : opts.backDim;
      ctx.fillStyle = 'rgba(11, 7, 16, ' + dim + ')';
      ctx.fillRect(0, 0, W, H);
      var shade = ctx.createLinearGradient(0, H * 0.12, 0, H);
      shade.addColorStop(0, 'rgba(11, 7, 16, 0)');
      shade.addColorStop(0.26, 'rgba(11, 7, 16, 0.46)');
      shade.addColorStop(0.62, 'rgba(11, 7, 16, 0.78)');
      shade.addColorStop(1, 'rgba(11, 7, 16, 0.92)');
      ctx.fillStyle = shade;
      ctx.fillRect(0, H * 0.12, W, H * 0.88);

      paintBackText(ctx, W, H, opts);
      return;
    }

    // 中心柔光
    var glow = ctx.createRadialGradient(cx, cy, W * 0.02, cx, cy, W * 0.52);
    glow.addColorStop(0, 'rgba(140, 122, 192, 0.22)');
    glow.addColorStop(0.55, 'rgba(140, 122, 192, 0.06)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 同心圆
    ctx.strokeStyle = gold + '0.55)';
    [0.30, 0.255, 0.14].forEach(function (r, i) {
      ctx.lineWidth = i === 1 ? Math.max(1, W * 0.0016) : Math.max(2, W * 0.003);
      ctx.beginPath();
      ctx.arc(cx, cy, W * r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 月亮
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = gold + '0.92)';
    ctx.beginPath();
    ctx.arc(0, 0, W * 0.082, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(W * 0.03, -W * 0.016, W * 0.072, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 星点
    var rnd = seeded(23);
    ctx.fillStyle = gold + '0.75)';
    for (var i = 0; i < 26; i++) {
      var a = rnd() * Math.PI * 2;
      var r = W * (0.17 + rnd() * 0.30);
      var x = cx + Math.cos(a) * r;
      var y = cy + Math.sin(a) * r * 0.92;
      var s = W * (0.004 + rnd() * 0.006);
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 边框
    var inset = Math.round(W * 0.042);
    ctx.strokeStyle = gold + '0.62)';
    ctx.lineWidth = Math.max(2, W * 0.0032);
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);

    // 底部文字块（与「有图」时同一套文案与排版）
    paintBackText(ctx, W, H, opts);
  }

  /* ═══════════════════════════════════════════════════════════
     织带：天鹅绒 + 两道暗金边线
     ═══════════════════════════════════════════════════════════ */
  function paintVelvetStrap(canvas, rgb) {
    var across = 192;
    var along = across * 3;
    canvas.width = across;
    canvas.height = along;
    var ctx = canvas.getContext('2d');
    if (!ctx) return along / across;

    ctx.fillStyle = toCss(rgb);
    ctx.fillRect(0, 0, across, along);

    // 绒面：横向纤维
    var rnd = seeded(5);
    for (var y = 0; y < along; y += 2) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.018 + rnd() * 0.022).toFixed(3) + ')';
      ctx.fillRect(0, y, across, 1);
    }
    // 两侧暗金细线
    ctx.fillStyle = 'rgba(' + GOLD + ', 0.34)';
    ctx.fillRect(Math.round(across * 0.085), 0, 2, along);
    ctx.fillRect(Math.round(across * 0.915) - 2, 0, 2, along);
    return along / across;
  }

  /* ── 几何 ───────────────────────────────────────────────── */
  function cardLayout(orientation, cornerRadius) {
    var size = CARD_SIZES[orientation] || CARD_SIZES.portrait;
    var width = size[0], height = size[1];
    var radius = mix(0.03, Math.min(width, height) * 0.2, clamp(cornerRadius, 0, 1));
    var slot = { width: 0.34, height: 0.07, y: height / 2 - 0.13 };
    var ringY = height / 2 - 0.055;
    return { width: width, height: height, radius: radius, slot: slot, ringY: ringY, hangY: ringY + RING_RADIUS };
  }

  function buildCardGeometry(layout) {
    var width = layout.width, height = layout.height, radius = layout.radius, slot = layout.slot;
    var outline = new THREE.Shape();
    traceRoundedRect(outline, -width / 2 + BEVEL, -height / 2 + BEVEL, width - BEVEL * 2, height - BEVEL * 2,
      Math.max(radius - BEVEL, 0.005));
    var hole = new THREE.Path();
    traceRoundedRect(hole, -slot.width / 2 - BEVEL, slot.y - slot.height / 2 - BEVEL,
      slot.width + BEVEL * 2, slot.height + BEVEL * 2, slot.height / 2 + BEVEL);
    outline.holes.push(hole);
    var body = new THREE.ExtrudeGeometry(outline, {
      depth: THICKNESS, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL,
      bevelSegments: 5, curveSegments: 24
    });
    body.translate(0, 0, -THICKNESS / 2);
    var face = new THREE.ShapeGeometry(outline, 24);
    var position = face.getAttribute('position');
    var uv = face.getAttribute('uv');
    for (var i = 0; i < position.count; i++) {
      uv.setXY(i, (position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height);
    }
    uv.needsUpdate = true;
    return { body: body, face: face };
  }

  function buildClampGeometry(width) {
    var shape = new THREE.Shape();
    var w = width * 1.16;
    traceRoundedRect(shape, -w / 2 + 0.014, -CLAMP_BODY / 2 + 0.014, w - 0.028, CLAMP_BODY - 0.028, 0.024);
    var geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014,
      bevelSegments: 6, curveSegments: 10
    });
    geometry.translate(0, 0, -0.01);
    return geometry;
  }

  function buildBandGeometry(count) {
    var columns = BAND_COLUMNS.length;
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(count * columns * 3), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * columns * 2), 2));
    var index = [];
    for (var i = 0; i < count - 1; i++) {
      for (var c = 0; c < columns - 1; c++) {
        var a = i * columns + c;
        index.push(a, a + columns, a + 1, a + 1, a + columns, a + columns + 1);
      }
    }
    geometry.setIndex(index);
    return geometry;
  }

  function buildEnvironment(renderer) {
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0.035, 0.035, 0.04);
    var geometry = new THREE.PlaneGeometry(1, 1);
    var materials = [];
    var panel = function (intensity, position, scale, rotation) {
      if (rotation == null) rotation = 0;
      var material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide
      });
      materials.push(material);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.scale.set(scale[0], scale[1], 1);
      mesh.lookAt(0, 0, 0);
      mesh.rotateZ(rotation);
      scene.add(mesh);
    };
    panel(2.6, [0, 4.5, 8], [9, 4]);
    panel(6, [-5.5, 0.5, 7], [0.9, 14]);
    panel(4, [5, -0.5, 8], [0.6, 14]);
    panel(3.5, [0, -1, 9], [24, 0.35], Math.PI / 3);
    panel(2.5, [1, 2.5, 9], [24, 0.2], Math.PI / 3);
    panel(1.4, [0, 6, -6], [12, 4]);
    panel(0.5, [0, -7, 1], [16, 6]);
    panel(0.9, [8, 0, -2], [4, 10]);

    // 暖光（烛火）与冷光（月华）：让金属边框的浮雕有两种色温的高光
    var warm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.4, 2.0, 0.9), side: THREE.DoubleSide });
    var cool = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.2, 1.7, 3.6), side: THREE.DoubleSide });
    materials.push(warm, cool);
    var warmMesh = new THREE.Mesh(geometry, warm);
    warmMesh.position.set(-4.2, -2.6, 6.5);
    warmMesh.scale.set(1.6, 1.6, 1);
    warmMesh.lookAt(0, 0, 0);
    var coolMesh = new THREE.Mesh(geometry, cool);
    coolMesh.position.set(4.6, 3.4, 6);
    coolMesh.scale.set(1.1, 3.2, 1);
    coolMesh.lookAt(0, 0, 0);
    scene.add(warmMesh, coolMesh);

    // 星点：细小高光，金属翻转时会一颗颗闪过去
    var rnd = seeded(19);
    var starMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 9, 9), side: THREE.DoubleSide });
    materials.push(starMat);
    for (var s = 0; s < 26; s++) {
      var star = new THREE.Mesh(geometry, starMat);
      var ang = rnd() * Math.PI * 2;
      var rad = 3.4 + rnd() * 6.5;
      star.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.72, 3 + rnd() * 6);
      var sc = 0.045 + rnd() * 0.075;
      star.scale.set(sc, sc, 1);
      star.lookAt(0, 0, 0);
      scene.add(star);
    }
    var pmrem = new THREE.PMREMGenerator(renderer);
    var target = pmrem.fromScene(scene, 0.035);
    pmrem.dispose();
    geometry.dispose();
    materials.forEach(function (m) { m.dispose(); });
    return target;
  }

  function makeCanvasTexture(canvas, anisotropy) {
    var texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = anisotropy;
    return texture;
  }

  function buildGrainTexture() {
    var size = 128;
    var canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    var ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);
    var random = seeded(7);
    var field = Float32Array.from({ length: size * size }, function () { return random(); });
    var height = function (x, y) {
      var sum = 0;
      for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) sum += field[((y + j + size) % size) * size + ((x + i + size) % size)];
      }
      return (sum / 9) * 1.6;
    };
    var image = ctx.createImageData(size, size);
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var nx = height((x - 1 + size) % size, y) - height((x + 1) % size, y);
        var ny = height(x, (y - 1 + size) % size) - height(x, (y + 1) % size);
        var length = Math.hypot(nx, ny, 1);
        var i = (y * size + x) * 4;
        image.data[i] = ((nx / length) * 0.5 + 0.5) * 255;
        image.data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
        image.data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
        image.data[i + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 7);
    return texture;
  }

  function buildWeaveTexture() {
    var size = 128;
    var threads = 8;
    var random = seeded(19);
    var fiber = Float32Array.from({ length: size * size }, function () { return random(); });
    var profile = function (f) { return Math.sqrt(Math.max(0, 1 - 4 * f * f)); };
    var height = function (x, y) {
      var px = ((x % size) + size) % size;
      var py = ((y % size) + size) % size;
      var u = (px / size) * threads, v = (py / size) * threads;
      var cu = Math.floor(u), cv = Math.floor(v);
      var fu = u - cu - 0.5, fv = v - cv - 0.5;
      var lift = (cu + cv) % 2 === 0;
      var warp = profile(fu) * (0.55 + 0.45 * Math.cos(fv * Math.PI * (lift ? 1 : 0.6)));
      var weft = profile(fv) * (0.55 + 0.45 * Math.cos(fu * Math.PI * (lift ? 0.6 : 1)));
      return (lift ? Math.max(warp, weft * 0.7) : Math.max(weft, warp * 0.7)) + fiber[py * size + px] * 0.08;
    };
    var data = new Uint8Array(size * size * 4);
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var nx = (height(x - 1, y) - height(x + 1, y)) * 1.6;
        var ny = (height(x, y - 1) - height(x, y + 1)) * 1.6;
        var length = Math.hypot(nx, ny, 1);
        var i = (y * size + x) * 4;
        data[i] = ((nx / length) * 0.5 + 0.5) * 255;
        data[i + 1] = ((ny / length) * 0.5 + 0.5) * 255;
        data[i + 2] = ((1 / length) * 0.5 + 0.5) * 255;
        data[i + 3] = 255;
      }
    }
    var texture = new THREE.DataTexture(data, size, size);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
  }

  /* ── 物理（Verlet + 刚体，原文照搬） ─────────────────────── */
  function createSimulation() {
    var vectors = function () {
      return Array.from({ length: JOINTS + 1 }, function () { return new THREE.Vector3(); });
    };
    return {
      nodes: vectors(),
      previous: vectors(),
      velocities: vectors(),
      lengths: new Float64Array(JOINTS),
      impulses: new Float64Array(JOINTS),
      rest: 1,
      anchor: new THREE.Vector3(),
      body: {
        position: new THREE.Vector3(),
        previous: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        previousQuaternion: new THREE.Quaternion(),
        angular: new THREE.Vector3(),
        mass: 1,
        inverseInertia: new THREE.Vector3(1, 1, 1),
        hang: new THREE.Vector3()
      },
      grab: null,
      turn: 0,
      twist: 0,
      twistRaw: 0,
      calm: 0
    };
  }

  var scratch = {
    a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(),
    d: new THREE.Vector3(), e: new THREE.Vector3(), f: new THREE.Vector3(),
    g: new THREE.Vector3(), pin: new THREE.Vector3(),
    q: new THREE.Quaternion(), r: new THREE.Quaternion()
  };

  function applyInverseInertia(body, vector, out) {
    scratch.r.copy(body.quaternion).invert();
    out.copy(vector).applyQuaternion(scratch.r);
    out.set(out.x * body.inverseInertia.x, out.y * body.inverseInertia.y, out.z * body.inverseInertia.z);
    return out.applyQuaternion(body.quaternion);
  }

  function rotateBody(q, w) {
    var qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    q.x += 0.5 * (w.x * qw + w.y * qz - w.z * qy);
    q.y += 0.5 * (w.y * qw + w.z * qx - w.x * qz);
    q.z += 0.5 * (w.z * qw + w.x * qy - w.y * qx);
    q.w += 0.5 * (-w.x * qx - w.y * qy - w.z * qz);
    q.normalize();
  }

  function bodyWeight(body, r, normal) {
    var rn = scratch.c.crossVectors(r, normal);
    return 1 / body.mass + rn.dot(applyInverseInertia(body, rn, scratch.d));
  }

  function pushBody(body, r, impulse) {
    body.position.addScaledVector(impulse, 1 / body.mass);
    rotateBody(body.quaternion, applyInverseInertia(body, scratch.e.crossVectors(r, impulse), scratch.f));
  }

  function solveSegment(sim, i, h, physics) {
    var nodes = sim.nodes, body = sim.body;
    var a = nodes[i];
    var wa = i === 0 ? 0 : NODE_WEIGHT;
    var last = i === JOINTS - 1;
    var r = scratch.g;
    var b = nodes[i + 1];
    if (last) {
      r.copy(body.hang).applyQuaternion(body.quaternion);
      b = scratch.b.copy(body.position).add(r);
    }
    var delta = scratch.a.subVectors(b, a);
    var length = delta.length();
    var stretch = length - sim.rest;
    if (stretch <= 0 || length < 1e-9) return;
    var normal = delta.divideScalar(length);
    var wb = last ? bodyWeight(body, r, normal) : NODE_WEIGHT;
    var rate = (length - sim.lengths[i]) / h;
    var tension =
      physics.hold * Math.tanh((physics.stiffness * stretch) / physics.hold) +
      physics.spring * stretch +
      physics.bandDamping * Math.max(0, rate);
    var room = tension * h * h - sim.impulses[i];
    if (room <= 0) return;
    var lambda = Math.min(stretch / (wa + wb), room);
    sim.impulses[i] += lambda;
    if (wa) a.addScaledVector(normal, lambda * wa);
    if (last) pushBody(body, r, normal.multiplyScalar(-lambda));
    else b.addScaledVector(normal, -lambda * wb);
  }

  function solvePin(body, grab, target) {
    var r = scratch.g.copy(grab.local).applyQuaternion(body.quaternion);
    var delta = scratch.a.copy(target).sub(body.position).sub(r);
    var distance = delta.length();
    if (distance < 1e-9) return;
    var normal = delta.divideScalar(distance);
    var lambda = distance / bodyWeight(body, r, normal);
    pushBody(body, r, normal.multiplyScalar(lambda));
  }

  function placeHanging(sim, layout, intro) {
    var nodes = sim.nodes, previous = sim.previous, velocities = sim.velocities;
    var body = sim.body, anchor = sim.anchor;
    nodes[0].copy(anchor);
    for (var i = 1; i <= JOINTS; i++) {
      nodes[i].copy(nodes[i - 1]);
      if (intro) nodes[i].x += sim.rest;
      else nodes[i].y -= sim.rest;
    }
    body.quaternion.identity();
    if (intro) body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    body.hang.set(0, layout.hangY, 0);
    var offset = scratch.a.copy(body.hang).applyQuaternion(body.quaternion);
    body.position.copy(nodes[JOINTS]).sub(offset);
    body.previous.copy(body.position);
    body.previousQuaternion.copy(body.quaternion);
    body.velocity.set(0, 0, 0);
    body.angular.set(0, 0, 0);
    for (var j = 0; j <= JOINTS; j++) {
      previous[j].copy(nodes[j]);
      velocities[j].set(0, 0, 0);
    }
    sim.lengths.fill(sim.rest);
    sim.turn = 0; sim.twist = 0; sim.twistRaw = 0; sim.calm = 0;
  }

  function configureSimulation(sim, layout, length) {
    sim.rest = length / JOINTS;
    var width = layout.width, height = layout.height;
    var body = sim.body;
    var t = THICKNESS + BEVEL * 2;
    body.mass = 1;
    body.inverseInertia.set(
      12 / (height * height + t * t),
      12 / (width * width + t * t),
      12 / (width * width + height * height)
    );
    body.hang.set(0, layout.hangY, 0);
  }

  function stepSimulation(sim, dt, physics, time) {
    var steps = Math.max(1, Math.ceil(dt / MAX_STEP - 1e-6));
    var h = dt / steps;
    var nodes = sim.nodes, previous = sim.previous, velocities = sim.velocities, body = sim.body;
    var windX = physics.breeze * (Math.sin(time * 0.53) * 0.7 + Math.sin(time * 1.31 + 1.7) * 0.3) * 3;
    var windZ = physics.breeze * Math.sin(time * 0.37 + 0.6) * 2;
    var grab = sim.grab;
    var pin = scratch.pin;
    var nodeDrag = Math.exp(-physics.nodeDrag * h);
    var linearDrag = Math.exp(-physics.linearDrag * h);
    var angularDrag = Math.exp(-physics.angularDrag * h);

    for (var s = 0; s < steps; s++) {
      for (var i = 1; i < JOINTS; i++) {
        var v = velocities[i];
        v.y -= physics.gravity * h;
        v.x += windX * h;
        v.z += windZ * h;
        previous[i].copy(nodes[i]);
        nodes[i].addScaledVector(v, h);
      }

      body.previous.copy(body.position);
      body.previousQuaternion.copy(body.quaternion);
      var q = body.quaternion;
      if (grab) {
        var turn = scratch.q.copy(grab.rotation).multiply(scratch.r.copy(q).invert());
        if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
        var torque = scratch.a.set(turn.x, turn.y, turn.z).multiplyScalar(2 * physics.grip);
        torque.addScaledVector(body.angular, -physics.gripDamping);
        body.angular.addScaledVector(applyInverseInertia(body, torque, scratch.b), h);
      }
      var up = scratch.a.set(0, 1, 0).applyQuaternion(q);
      var front = scratch.b.set(-up.x * up.z, -up.y * up.z, 1 - up.z * up.z);
      if (front.lengthSq() > 1e-3) {
        var facing = scratch.d.set(0, 0, 1).applyQuaternion(q);
        var raw = Math.atan2(scratch.e.crossVectors(front, facing).dot(up), front.dot(facing));
        var turned = raw - sim.twistRaw;
        if (turned > Math.PI) turned -= Math.PI * 2;
        else if (turned < -Math.PI) turned += Math.PI * 2;
        sim.twist += turned;
        sim.twistRaw = raw;
      }
      if (!grab) {
        var spin = body.angular.dot(up);
        body.angular.addScaledVector(up, (physics.twist * (sim.turn - sim.twist) - physics.twistDamping * spin) * h);
      }
      body.velocity.y -= physics.gravity * h;
      body.velocity.x += windX * 0.35 * h;
      body.velocity.z += windZ * 0.35 * h;
      body.position.addScaledVector(body.velocity, h);
      rotateBody(body.quaternion, scratch.f.copy(body.angular).multiplyScalar(h));

      sim.impulses.fill(0);
      if (grab) pin.lerpVectors(grab.from, grab.target, (s + 1) / steps);
      for (var iteration = 0; iteration < ITERATIONS; iteration++) {
        for (var j2 = 0; j2 < JOINTS; j2++) solveSegment(sim, j2, h, physics);
        if (grab) solvePin(body, grab, pin);
      }

      for (var k = 1; k < JOINTS; k++) {
        var vk = velocities[k].subVectors(nodes[k], previous[k]).divideScalar(h).multiplyScalar(nodeDrag);
        vk.multiplyScalar(1 / (1 + physics.nodeAir * vk.length() * h));
      }
      body.velocity.subVectors(body.position, body.previous).divideScalar(h);
      var dq = scratch.q.copy(body.previousQuaternion).invert().premultiply(body.quaternion);
      body.angular.set(dq.x, dq.y, dq.z).multiplyScalar((2 / h) * (dq.w < 0 ? -1 : 1));

      var normal = scratch.a.set(0, 0, 1).applyQuaternion(body.quaternion);
      var across = body.velocity.dot(normal);
      var along = scratch.b.copy(body.velocity).addScaledVector(normal, -across);
      along.multiplyScalar(1 / (1 + physics.air * along.length() * h));
      body.velocity
        .copy(along)
        .addScaledVector(normal, across / (1 + physics.broadside * Math.abs(across) * h))
        .multiplyScalar(linearDrag);
      body.angular.multiplyScalar(angularDrag / (1 + physics.spinAir * body.angular.length() * h));
      if (body.velocity.lengthSq() > 3600) body.velocity.setLength(60);
      if (body.angular.lengthSq() > 1600) body.angular.setLength(40);

      nodes[JOINTS].copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
      for (var m = 0; m < JOINTS; m++) sim.lengths[m] = nodes[m].distanceTo(nodes[m + 1]);
    }

    if (grab) grab.from.copy(grab.target);

    var energy = body.velocity.lengthSq() + body.angular.lengthSq() * 0.3;
    for (var n = 1; n < JOINTS; n++) energy += velocities[n].lengthSq() * 0.05;
    sim.calm = energy < 2e-4 ? sim.calm + dt : 0;
  }

  /* ═══════════════════════════════════════════════════════════
     主体：挂载
     ═══════════════════════════════════════════════════════════ */
  function create(container, initialSettings) {
    if (!container) return null;

    var settings = Object.assign({
      frontImage: null, backImage: null, frameImage: null, imageFit: 'cover', cardColor: '#1A1020',
      orientation: 'portrait', finish: 'matte', cornerRadius: 0.12, size: 0.52,
      anchor: 'center', strapLength: 0.36, strapImage: null, strapColor: '#241631',
      strapWidth: 0.8, metal: 'gold', gravity: 1, damping: 0.5, elasticity: 0.5,
      breeze: 0.5, interactive: true, intro: true,
      /* 金属雕花层 */
      frameMetalness: 1, frameRoughness: 0.22, frameEnv: 1.9, frameClearcoat: 0.3,
      frameAlphaLow: 6, frameAlphaHigh: 22,
      backRoughness: 0.3, backEnv: 1.5, edgeRoughness: 0.3, edgeEnv: 1.4,
      name: '牧舒', role: 'AIGC / 影像 / 视觉实验',
      /* 卡背文字（画在压暗后的图上）
         backDim  = 整幅压暗的浓度（0~1），越大底越沉、字越清楚 */
      backDim: 0.62,
      backKicker: '动画 / 影像 / 互动',
      backTitle: '这是一个捕捉梦境的暗室。',
      backNote: '如果你也喜欢奇奇怪怪的浪漫，欢迎联系：',
      backEmail: 'Email: 1034136944',
      backFoot: 'Scroll to explore the illusions.'
    }, initialSettings || {});

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      return null;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping !== undefined
      ? THREE.NeutralToneMapping
      : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    var canvas = renderer.domElement;
    canvas.className = 'lanyard-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    var anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    var scene = new THREE.Scene();
    var environment = buildEnvironment(renderer);
    scene.environment = environment.texture;
    var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    var keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(-2.5, 4, 6);
    var fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(3, -1, 4);
    scene.add(keyLight, fillLight);

    var imageCache = new Map();
    var images = { front: null, back: null, strap: null, frame: null };
    var frontCanvas = document.createElement('canvas');
    var backCanvas = document.createElement('canvas');
    var strapCanvas = document.createElement('canvas');
    var frameCanvas = document.createElement('canvas');
    var frontTexture = makeCanvasTexture(frontCanvas, anisotropy);
    var backTexture = makeCanvasTexture(backCanvas, anisotropy);
    var strapTexture = makeCanvasTexture(strapCanvas, anisotropy);
    var frameTexture = makeCanvasTexture(frameCanvas, anisotropy);
    strapTexture.wrapS = THREE.ClampToEdgeWrapping;
    strapTexture.wrapT = THREE.RepeatWrapping;
    var grain = buildGrainTexture();
    var weave = buildWeaveTexture();

    var foilUniforms = {
      foilStrength: { value: 0 },
      foilAspect: { value: 1.4 },
      foilKey: { value: new THREE.Vector3() },
      foilFill: { value: new THREE.Vector3() },
      foilTop: { value: new THREE.Vector3() }
    };
    var injectFoil = function (shader) {
      Object.assign(shader.uniforms, foilUniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + FOIL_VERTEX_HEAD)
        .replace('#include <project_vertex>', '#include <project_vertex>\n' + FOIL_VERTEX_BODY);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\n' + FOIL_FRAGMENT_HEAD)
        .replace('#include <opaque_fragment>', FOIL_FRAGMENT_BODY + '\n#include <opaque_fragment>');
    };

    var frontMaterial = new THREE.MeshPhysicalMaterial({
      map: frontTexture, normalMap: grain, normalScale: new THREE.Vector2(0.06, 0.06)
    });
    var backMaterial = new THREE.MeshPhysicalMaterial({
      map: backTexture, normalMap: grain, normalScale: new THREE.Vector2(0.06, 0.06)
    });
    frontMaterial.onBeforeCompile = injectFoil;
    backMaterial.onBeforeCompile = injectFoil;
    var edgeMaterial = new THREE.MeshPhysicalMaterial();
    var metalMaterial = new THREE.MeshStandardMaterial({ metalness: 1 });
    // 金属雕花层：PBR 金属 + 环境反射，翻面时反光会扫过花纹
    var frameMaterial = new THREE.MeshPhysicalMaterial({
      map: frameTexture, transparent: true, metalness: 1, roughness: 0.22,
      envMapIntensity: 1.9, clearcoat: 0.3, clearcoatRoughness: 0.22,
      side: THREE.FrontSide
    });
    var bandMaterial = new THREE.MeshPhysicalMaterial({
      map: strapTexture, normalMap: weave, normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 0.68, sheen: 1, sheenRoughness: 0.42,
      sheenColor: new THREE.Color(0.32, 0.32, 0.34), side: THREE.DoubleSide
    });

    var cardGroup = new THREE.Group();
    var bodyMesh = new THREE.Mesh(undefined, edgeMaterial);
    var frontMesh = new THREE.Mesh(undefined, frontMaterial);
    var backMesh = new THREE.Mesh(undefined, backMaterial);
    var frameMesh = new THREE.Mesh(undefined, frameMaterial);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(RING_RADIUS, RING_TUBE, 18, 72), metalMaterial);
    ring.rotation.y = Math.PI / 2 - 0.7;
    cardGroup.add(bodyMesh, frontMesh, backMesh, frameMesh, ring);
    scene.add(cardGroup);

    var bandGeometry = buildBandGeometry(SAMPLES);
    var band = new THREE.Mesh(bandGeometry, bandMaterial);
    band.frustumCulled = false;
    scene.add(band);

    var clampGroup = new THREE.Group();
    var clampMesh = new THREE.Mesh(buildClampGeometry(STRAP_WIDTH), metalMaterial);
    clampMesh.position.y = EYELET_RADIUS + CLAMP_BODY / 2 - 0.004;
    var eyelet = new THREE.Mesh(new THREE.TorusGeometry(EYELET_RADIUS, 0.0105, 14, 40), metalMaterial);
    clampGroup.add(clampMesh, eyelet);
    scene.add(clampGroup);

    var sim = createSimulation();
    var controls = [];
    var mouth = new THREE.Vector3();
    var tuck = new THREE.Vector3();
    var curve = new THREE.CatmullRomCurve3(controls, false, 'centripetal');
    var view = { width: 1, height: 1 };
    var layout = cardLayout('portrait', 0.12);
    var applied = {};
    var strapScale = STRAP_WIDTH;
    var tileRatio = 2;
    var raf = 0;
    var last = performance.now();
    var time = 0;
    var visible = true;
    var alive = true;
    var placed = false;
    var hovering = false;
    var press = null;
    var imageToken = 0;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var paintFaces = function () {
      var color = parseColor(settings.cardColor, [1, 1, 1]);
      var width = FACE_WIDTH;
      var height = Math.round((FACE_WIDTH * layout.height) / layout.width);
      if (frontCanvas.width !== width || frontCanvas.height !== height) {
        frontCanvas.width = width; frontCanvas.height = height;
        backCanvas.width = width; backCanvas.height = height;
        frameCanvas.width = width; frameCanvas.height = height;
        frontTexture.dispose();
        backTexture.dispose();
        frameTexture.dispose();
      }

      // 金属雕花层：牌框图铺满，近黑抠成透明
      paintFrameOverlay(frameCanvas, images.frame, settings);
      frameTexture.needsUpdate = true;
      frameMesh.visible = !!images.frame;

      // 镂空窗口 → 照片和字画在里面
      var win = detectWindow(images.frame);
      var box = images.frame ? coverBox(width, height, images.frame.width, images.frame.height) : null;
      var wx, wy, ww, wh;
      if (box) {
        wx = box.dx + win.x0 * box.dw;
        wy = box.dy + win.y0 * box.dh;
        ww = (win.x1 - win.x0) * box.dw;
        wh = (win.y1 - win.y0) * box.dh;
        // 往里收一点，照片不压到雕花的内沿
        var inset = Math.min(ww, wh) * 0.012;
        wx += inset; wy += inset; ww -= inset * 2; wh -= inset * 2;
      } else {
        wx = width * 0.11; wy = height * 0.07; ww = width * 0.78; wh = height * 0.80;
      }

      paintBadgeFront(frontCanvas, images.front, color, settings, { x: wx, y: wy, w: ww, h: wh });
      paintBadgeBack(backCanvas, color, settings, images.back);
      frontTexture.needsUpdate = true;
      backTexture.needsUpdate = true;
      start();
    };

    var repaintStrap = function () {
      tileRatio = paintVelvetStrap(strapCanvas, parseColor(settings.strapColor, [0.07, 0.07, 0.07]));
      weave.repeat.set(2, 2 * tileRatio);
      strapTexture.dispose();
      strapTexture.needsUpdate = true;
      start();
    };

    var frameView = function () {
      var aspect = view.width / view.height;
      var viewHeight = layout.height / clamp(settings.size, 0.15, 0.9);
      // 画布至少要这么宽，卡牌倾斜时才不会被裁掉。
      // widthFill = 牌面最多占画布宽度的比例，剩下 (1 - widthFill) 全部留作
      // 拖拽余量（每侧一半）—— 活动范围就是这个「余量」决定的。
      // （卡片半宽 0.8 / 半高 1.125，倾到 30° 时轴对齐宽度约 1.26）
      // 抽成配置项，方便自测台用同一份代码 A/B 对比新旧两套参数。
      var widthFill = clamp(settings.widthFill == null ? 0.36 : settings.widthFill, 0.1, 0.95);
      var minimumWidth = layout.width / widthFill;
      if (viewHeight * aspect < minimumWidth) viewHeight = minimumWidth / aspect;
      var viewWidth = viewHeight * aspect;
      camera.aspect = aspect;
      camera.position.set(0, 0, viewHeight / 2 / Math.tan((FOV * Math.PI) / 360));
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      foilUniforms.foilKey.value.set(-2.5, 4, 6).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilFill.value.set(3, -1, 4).normalize().transformDirection(camera.matrixWorldInverse);
      foilUniforms.foilTop.value.set(0.5, 4.5, 8).normalize().transformDirection(camera.matrixWorldInverse);
      var anchorX = ((ANCHORS[settings.anchor] != null ? ANCHORS[settings.anchor] : 0.5) - 0.5) * viewWidth;
      var anchorY = viewHeight / 2 + 0.2;
      var cardTop = viewHeight / 2 - viewHeight * mix(0.12, 0.42, clamp(settings.strapLength, 0, 1));
      var hangTop = cardTop + (layout.hangY - layout.height / 2);
      sim.anchor.set(anchorX, anchorY, 0);
      configureSimulation(sim, layout, anchorY - hangTop);
      sim.nodes[0].copy(sim.anchor);
      sim.previous[0].copy(sim.anchor);
    };

    var apply = function () {
      var layoutKey = settings.orientation + '|' + settings.cornerRadius;
      if (layoutKey !== applied.layoutKey) {
        layout = cardLayout(settings.orientation, settings.cornerRadius);
        var geometry = buildCardGeometry(layout);
        bodyMesh.geometry.dispose();
        frontMesh.geometry.dispose();
        backMesh.geometry.dispose();
        bodyMesh.geometry = geometry.body;
        frontMesh.geometry = geometry.face;
        backMesh.geometry = geometry.face.clone();
        frameMesh.geometry = geometry.face.clone();
        frontMesh.position.z = THICKNESS / 2 + BEVEL + 0.0006;
        backMesh.rotation.y = Math.PI;
        backMesh.position.z = -(THICKNESS / 2 + BEVEL + 0.0006);
        // 金属雕花层浮在正面之上一点点
        frameMesh.position.z = THICKNESS / 2 + BEVEL + 0.0016;
        ring.position.set(0, layout.ringY, 0);
        applied.framingKey = '';
      }
      var framingKey = layoutKey + '|' + settings.size + '|' + settings.anchor + '|' +
        settings.strapLength + '|' + view.width + '|' + view.height;
      if (framingKey !== applied.framingKey) {
        frameView();
        if (!placed) {
          placeHanging(sim, layout, settings.intro && !reducedMotion);
          placed = true;
        } else if (layoutKey !== applied.layoutKey) {
          placeHanging(sim, layout, false);
        }
      }

      var imageKey = settings.frontImage + '|' + settings.backImage + '|' + settings.strapImage + '|' + settings.frameImage;
      if (imageKey !== applied.imageKey) {
        var token = ++imageToken;
        Promise.all([
          loadImage(imageCache, settings.frontImage),
          loadImage(imageCache, settings.backImage),
          loadImage(imageCache, settings.strapImage),
          loadImage(imageCache, settings.frameImage)
        ]).then(function (res) {
          if (!alive || token !== imageToken) return;
          images.front = res[0];
          images.back = res[1];
          images.strap = res[2];
          images.frame = res[3];
          paintFaces();
          repaintStrap();
        });
      }
      var faceKey = layoutKey + '|' + settings.cardColor + '|' + settings.imageFit + '|' + settings.frameImage;
      if (faceKey !== applied.faceKey) paintFaces();
      if (settings.strapColor !== applied.strapColor) repaintStrap();

      var finish = FINISHES[settings.finish] || FINISHES.glossy;
      var card = parseColor(settings.cardColor, [1, 1, 1]);
      var metalLook = METALS[settings.metal] || METALS.silver;

      // 内层正面：保持 finish（天鹅绒哑光），照片区不吃反光
      frontMaterial.roughness = finish.roughness;
      frontMaterial.metalness = finish.metalness;
      frontMaterial.clearcoat = finish.clearcoat;
      frontMaterial.clearcoatRoughness = finish.clearcoatRoughness;
      frontMaterial.anisotropy = finish.anisotropy;

      // 背面：有图就是整块金属雕花，没图才用 finish
      backMaterial.roughness = images.back ? (settings.backRoughness == null ? 0.3 : settings.backRoughness) : finish.roughness;
      backMaterial.metalness = images.back ? 1 : finish.metalness;
      backMaterial.clearcoat = images.back ? 0.25 : finish.clearcoat;
      backMaterial.clearcoatRoughness = finish.clearcoatRoughness;
      backMaterial.anisotropy = finish.anisotropy;
      backMaterial.envMapIntensity = images.back ? (settings.backEnv == null ? 1.5 : settings.backEnv) : 1;

      // 金属雕花层：PBR 金属 + 环境反射
      frameMaterial.metalness = settings.frameMetalness == null ? 1 : settings.frameMetalness;
      frameMaterial.roughness = settings.frameRoughness == null ? 0.22 : settings.frameRoughness;
      frameMaterial.envMapIntensity = settings.frameEnv == null ? 1.9 : settings.frameEnv;
      frameMaterial.clearcoat = settings.frameClearcoat == null ? 0.3 : settings.frameClearcoat;
      // 细金线在牌面缩到 ~180px 时会被采样平均掉，提一点反射率补回来
      var tint = settings.frameTint == null ? 1 : settings.frameTint;
      frameMaterial.color.setRGB(tint, tint * 0.97, tint * 0.9);
      frameMaterial.anisotropy = settings.frameAnisotropy == null ? 1 : settings.frameAnisotropy;

      foilUniforms.foilStrength.value = finish.foil;
      foilUniforms.foilAspect.value = layout.height / layout.width;

      // 卡边做成金属包边
      edgeMaterial.color.set(metalLook.color);
      edgeMaterial.roughness = settings.edgeRoughness == null ? 0.3 : settings.edgeRoughness;
      edgeMaterial.metalness = 1;
      edgeMaterial.envMapIntensity = settings.edgeEnv == null ? 1.4 : settings.edgeEnv;
      edgeMaterial.clearcoat = 0.4;
      edgeMaterial.clearcoatRoughness = 0.12;

      metalMaterial.color.set(metalLook.color);
      metalMaterial.roughness = metalLook.roughness;
      strapScale = STRAP_WIDTH * clamp(settings.strapWidth, 0.4, 2);
      if (strapScale !== applied.strapScale) {
        clampMesh.geometry.dispose();
        clampMesh.geometry = buildClampGeometry(strapScale);
      }
      canvas.style.touchAction = settings.interactive ? 'pan-y' : 'auto';

      applied = {
        layoutKey: layoutKey, framingKey: framingKey, imageKey: imageKey, faceKey: faceKey,
        strapColor: settings.strapColor, strapScale: strapScale
      };
      start();
    };

    var points = Array.from({ length: SAMPLES }, function () { return new THREE.Vector3(); });
    var sides = Array.from({ length: SAMPLES }, function () { return new THREE.Vector3(); });
    var bends = BAND_BEND.map(function (angle) { return [Math.cos(angle), Math.sin(angle)]; });
    var work = {
      tangent: new THREE.Vector3(), toCamera: new THREE.Vector3(), basis: new THREE.Matrix4(),
      up: new THREE.Vector3(), across: new THREE.Vector3(), facing: new THREE.Vector3(), end: new THREE.Vector3()
    };

    var updateBand = function () {
      var hang = sim.nodes[JOINTS];
      var reach = EYELET_RADIUS + CLAMP_BODY + 0.05;
      var guide = JOINTS - 1;
      while (guide > 0 && sim.nodes[guide].distanceTo(hang) < reach * 1.1) guide--;
      var axis = work.up.subVectors(sim.nodes[guide], hang);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).applyQuaternion(sim.body.quaternion);
      axis.normalize();
      mouth.copy(hang).addScaledVector(axis, reach);
      tuck.copy(hang).addScaledVector(axis, EYELET_RADIUS + CLAMP_BODY * 0.35);
      controls.length = 0;
      for (var i = 0; i <= guide; i++) controls.push(sim.nodes[i]);
      controls.push(mouth, tuck);
      curve.updateArcLengths();
      for (var s2 = 0; s2 < SAMPLES; s2++) curve.getPointAt(s2 / (SAMPLES - 1), points[s2]);
      var length = curve.getLength();
      var held = 1 - mouth.distanceTo(tuck) / Math.max(length, 0.001);
      var position = bandGeometry.getAttribute('position');
      var normal = bandGeometry.getAttribute('normal');
      var uv = bandGeometry.getAttribute('uv');
      var columns = BAND_COLUMNS.length;
      var restLength = sim.rest * JOINTS;
      var repeats = restLength / (strapScale * tileRatio);
      var width = strapScale / Math.pow(Math.max(1, length / Math.max(restLength, 0.001)), 0.35);
      var tangent = work.tangent, toCamera = work.toCamera, across = work.across, facing = work.facing;
      for (var j = 0; j < SAMPLES; j++) {
        tangent.subVectors(points[Math.min(SAMPLES - 1, j + 1)], points[Math.max(0, j - 1)]);
        if (tangent.lengthSq() < 1e-12) tangent.set(0, -1, 0);
        tangent.normalize();
        toCamera.subVectors(camera.position, points[j]).normalize();
        var side = sides[j].crossVectors(toCamera, tangent);
        if (side.lengthSq() < 1e-10) side.copy(j > 0 ? sides[j - 1] : scratch.a.set(1, 0, 0));
        side.normalize();
        if (j > 0 && side.dot(sides[j - 1]) < 0) side.negate();
        var angle = -sim.twist * Math.pow(Math.min(1, j / (SAMPLES - 1) / held), 1.3);
        facing.crossVectors(tangent, side);
        across.copy(side).multiplyScalar(Math.cos(angle)).addScaledVector(facing, Math.sin(angle));
        facing.crossVectors(tangent, across);
        var p = points[j];
        var v = (1 - j / (SAMPLES - 1)) * repeats;
        for (var c = 0; c < columns; c++) {
          var k = j * columns + c;
          var offset = (BAND_COLUMNS[c] - 0.5) * width;
          var bend = bends[c];
          position.setXYZ(k, p.x + across.x * offset, p.y + across.y * offset, p.z + across.z * offset);
          normal.setXYZ(k,
            facing.x * bend[0] + across.x * bend[1],
            facing.y * bend[0] + across.y * bend[1],
            facing.z * bend[0] + across.z * bend[1]);
          uv.setXY(k, BAND_COLUMNS[c], v);
        }
      }
      work.end.copy(across);
      position.needsUpdate = true;
      normal.needsUpdate = true;
      uv.needsUpdate = true;

      across.copy(work.end).addScaledVector(axis, -work.end.dot(axis)).normalize();
      facing.crossVectors(across, axis).normalize();
      work.basis.makeBasis(across, axis, facing);
      clampGroup.quaternion.setFromRotationMatrix(work.basis);
      clampGroup.position.copy(hang);
    };

    var render = function () {
      cardGroup.position.copy(sim.body.position);
      cardGroup.quaternion.copy(sim.body.quaternion);
      updateBand();
      renderer.render(scene, camera);
    };

    var physics = function () {
      var gravity = 40 * clamp(settings.gravity, 0, 3);
      var weight = Math.max(gravity, 20);
      var springy = clamp(settings.elasticity, 0, 1);
      var settle = clamp(settings.damping, 0, 1);
      return {
        gravity: gravity,
        hold: weight * mix(2.2, 5.5, springy),
        stiffness: weight * 10 * JOINTS,
        spring: weight * mix(0.1, 0.4, springy) * JOINTS,
        bandDamping: weight * mix(0.3, 0.08, springy) * JOINTS,
        linearDrag: 0.25 * Math.pow(16, settle),
        angularDrag: 0.5 * Math.pow(12, settle),
        air: 0.15, broadside: 0.5, spinAir: 0.03, nodeDrag: 2, nodeAir: 0.2,
        twist: 30, twistDamping: 3, grip: 40, gripDamping: 6,
        breeze: reducedMotion ? 0 : clamp(settings.breeze, 0, 1)
      };
    };

    var tick = function (now) {
      raf = 0;
      if (!alive) return;
      var dt = Math.min(1 / 30, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      time += dt;
      var current = physics();
      stepSimulation(sim, dt, current, time);
      armBounds();
      if (boundsArmed) clampBody();
      var body = sim.body;
      if (!Number.isFinite(body.position.x + body.position.y + body.position.z + body.quaternion.w)) {
        sim.grab = null;
        placeHanging(sim, layout, false);
      }
      render();
      var resting = sim.calm > 1.2 && !sim.grab && current.breeze === 0;
      if (visible && !resting) raf = requestAnimationFrame(tick);
    };

    var start = function () {
      if (raf || !visible || !alive) return;
      sim.calm = 0;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    var raycaster = new THREE.Raycaster();
    var pointer = new THREE.Vector2();

    var toPointer = function (event) {
      var rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
    };

    var pickCard = function () {
      cardGroup.updateMatrixWorld();
      var hits = raycaster.intersectObjects([bodyMesh, frontMesh, backMesh, frameMesh], false);
      return hits[0] || null;
    };

    var setCursor = function (value) {
      if (canvas.style.cursor !== value) canvas.style.cursor = value;
    };

    var flip = function (point) {
      var body = sim.body;
      var up = scratch.a.set(0, 1, 0).applyQuaternion(body.quaternion);
      var direction = sim.turn > 0 ? -1 : 1;
      if (sim.turn === 0) {
        var away = scratch.c.subVectors(point, camera.position).normalize();
        direction = scratch.b.subVectors(point, body.position).cross(away).dot(up) < 0 ? -1 : 1;
      }
      sim.turn = sim.turn === 0 ? Math.PI * direction : 0;
      body.angular.addScaledVector(up, FLIP_SPIN * direction);
    };

    /* ═══════════════════════════════════════════════════════════
       边界约束 —— 保证工作牌无论被拖到哪里都完整显示
       ───────────────────────────────────────────────────────────
       画布是 WebGL 的渲染视口，超出相机视锥（NDC ±1）的部分根本
       不会画出来，看起来就像卡牌被「裁掉一半」。

       这里把卡牌 8 个角投到 NDC，算出它真实占的画面范围，再据此
       把卡牌限制回画面内。分两层：
         1) clampGrab —— 拖拽时，夹住指针的 NDC 坐标；
         2) clampBody —— 松手后惯性把卡牌甩出去时拉回来。
       ═══════════════════════════════════════════════════════════ */
    var boundScratch = {
      v: new THREE.Vector3(),   // 卡牌角点
      g: new THREE.Vector3(),   // 抓取点
      r: new THREE.Vector3()    // 抓取点在卡牌上的世界偏移
    };

    /* 卡牌在画面（NDC -1 ~ 1）里的实际包围盒 */
    var cardNdcBox = function () {
      cardGroup.position.copy(sim.body.position);
      cardGroup.quaternion.copy(sim.body.quaternion);
      cardGroup.updateMatrixWorld(true);
      var hw = layout.width / 2, hh = layout.height / 2;
      var hz = THICKNESS / 2 + BEVEL + 0.004;
      var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (var i = 0; i < 8; i++) {
        boundScratch.v
          .set((i & 1) ? hw : -hw, (i & 2) ? hh : -hh, (i & 4) ? hz : -hz)
          .applyMatrix4(cardGroup.matrixWorld)
          .project(camera);
        var x = boundScratch.v.x, y = boundScratch.v.y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    };

    /* 某个深度上，1 个 NDC 单位等于多少世界坐标 */
    var ndcScale = function (depth) {
      var tanHalf = Math.tan((FOV * Math.PI) / 360);
      return { x: 2 * depth * tanHalf * camera.aspect, y: 2 * depth * tanHalf };
    };

    /* 抓取点（卡牌上被按住的那一点）此刻在画面里的 NDC 坐标。
       和 solvePin 用的是同一套变换，所以这里的「当前抓取点」
       就是物理上真正把卡牌钉住的那个点。 */
    var grabNdc = function () {
      var body = sim.body;
      var r = boundScratch.r.copy(sim.grab.local).applyQuaternion(body.quaternion);
      return boundScratch.g.copy(body.position).add(r).project(camera);
    };

    /* 拖拽中：夹住指针的 NDC 坐标。
       指针所在的 NDC 位置 == 抓取点被拉过去的位置（投影沿同一条射线
       不变），所以只要把指针夹在「卡牌还能完整留在画面内」的区间
       里，卡牌就永远拖不出画面。 */
    var clampGrab = function () {
      if (!sim.grab) return;
      var box = cardNdcBox();
      var halfW = (box.maxX - box.minX) / 2;
      var halfH = (box.maxY - box.minY) / 2;
      // 卡牌本身比画面还大（极端倾斜）时，这一轴夹不动
      if (halfW >= 1 || halfH >= 1) return;
      var cur = grabNdc();                    // 抓取点现在在画面里的位置
      var cx = (box.minX + box.maxX) / 2;     // 卡牌中心在画面里的位置
      var cy = (box.minY + box.maxY) / 2;
      // 卡牌中心跟着抓取点走：新中心 = 旧中心 +（指针 - 当前抓取点）
      var loX = -1 + halfW - (cx - cur.x);
      var hiX = 1 - halfW - (cx - cur.x);
      var loY = -1 + halfH - (cy - cur.y);
      var hiY = 1 - halfH - (cy - cur.y);
      if (loX > hiX) { loX = hiX = (loX + hiX) / 2; }
      if (loY > hiY) { loY = hiY = (loY + hiY) / 2; }
      pointer.x = clamp(pointer.x, loX, hiX);
      pointer.y = clamp(pointer.y, loY, hiY);
    };

    /* 松手后的摆动兜底：惯性把卡牌甩出画面时拉回来。
       注意：入场动画是把卡牌放在画面外甩进来的，所以要等它摆进画面
       之后才开始夹，否则入场动画会被冻住。 */
    var boundsArmed = false;
    var armBounds = function () {
      if (boundsArmed) return;
      // 兜底：入场动画最多给 6 秒，之后无论如何都启用夹取
      if (time > 6) { boundsArmed = true; return; }
      var box = cardNdcBox();
      // 卡牌完全进入画面（离边界还有余量）才启用夹取
      if (box.minX > -0.92 && box.maxX < 0.92 && box.minY > -0.92 && box.maxY < 0.92) {
        boundsArmed = true;
      }
    };

    var clampBody = function () {
      var body = sim.body;
      var corrected = false;
      // 线性化一次只修正大部分误差，所以迭代几遍收敛到画面内
      for (var pass = 0; pass < 3; pass++) {
        var box = cardNdcBox();
        var overX = 0, overY = 0;
        if (box.minX < -1) overX += -1 - box.minX;
        if (box.maxX > 1) overX += 1 - box.maxX;
        if (box.minY < -1) overY += -1 - box.minY;
        if (box.maxY > 1) overY += 1 - box.maxY;
        if (overX === 0 && overY === 0) break;
        corrected = true;
        var s = ndcScale(Math.max(camera.position.z - body.position.z, 0.2));
        var dx = overX * s.x, dy = overY * s.y;
        body.position.x += dx;
        body.position.y += dy;
        // 抓取目标跟着一起挪，物理才不会下一秒又把卡牌拽出画面
        if (sim.grab) {
          sim.grab.target.x += dx;
          sim.grab.target.y += dy;
        }
      }
      if (!corrected) return;
      body.velocity.set(0, 0, 0);
      body.previous.copy(body.position);
      // 挂绳末端跟着卡牌走，不然绳子会跟卡片脱节
      sim.nodes[JOINTS].copy(body.hang).applyQuaternion(body.quaternion).add(body.position);
      sim.previous[JOINTS].copy(sim.nodes[JOINTS]);
    };

    var onPointerDown = function (event) {
      if (!settings.interactive || event.button > 0) return;
      toPointer(event);
      var hit = pickCard();
      if (!hit) return;
      sim.grab = {
        local: hit.point.clone().sub(sim.body.position).applyQuaternion(sim.body.quaternion.clone().invert()),
        rotation: sim.body.quaternion.clone(),
        reach: hit.distance,
        from: hit.point.clone(),
        target: hit.point.clone()
      };
      press = { x: event.clientX, y: event.clientY, time: performance.now(), point: hit.point.clone() };
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(event.pointerId); } catch (e) {}
      }
      setCursor('grabbing');
      event.preventDefault();
      start();
    };

    var onPointerMove = function (event) {
      if (!settings.interactive) return;
      toPointer(event);
      if (sim.grab) {
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press = null;
        // 先夹指针，再重算射线 —— 抓取目标就天然落在「卡牌仍完整可见」的范围内
        clampGrab();
        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.at(sim.grab.reach, sim.grab.target);
        start();
        return;
      }
      if (event.pointerType === 'touch') return;
      hovering = !!pickCard();
      setCursor(hovering ? 'grab' : '');
    };

    var onPointerUp = function (event) {
      if (!sim.grab) return;
      sim.grab = null;
      if (press && event.type === 'pointerup' && performance.now() - press.time < 450) flip(press.point);
      press = null;
      if (canvas.releasePointerCapture) {
        try { canvas.releasePointerCapture(event.pointerId); } catch (e) {}
      }
      setCursor(hovering && event.pointerType !== 'touch' ? 'grab' : '');
      start();
    };

    var onTouchStart = function (event) {
      if (!settings.interactive || event.touches.length !== 1) return;
      toPointer(event.touches[0]);
      if (pickCard()) event.preventDefault();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('lostpointercapture', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    var resize = function () {
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(view.width, view.height, false);
      apply();
      render();
    };

    var resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    var intersectionObserver = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    });
    intersectionObserver.observe(container);
    var onVisibility = function () {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    resize();

    return {
      settings: settings,
      apply: apply,
      /* 自测用：卡牌在画布里的归一化包围盒（0~1，左上原点）。
         四个数都落在 0~1 内 = 卡牌完整可见，没有被容器裁掉。 */
      cardBox: function () {
        var box = cardNdcBox();
        var q = sim.body.quaternion;
        return {
          left: (box.minX + 1) / 2,
          right: (box.maxX + 1) / 2,
          top: (1 - box.maxY) / 2,
          bottom: (1 - box.minY) / 2,
          ndc: box,
          pos: { x: sim.body.position.x, y: sim.body.position.y, z: sim.body.position.z },
          quat: { x: q.x, y: q.y, z: q.z, w: q.w }
        };
      },
      set: function (patch) {
        Object.assign(settings, patch || {});
        apply();
      },
      destroy: function () {
        alive = false;
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('lostpointercapture', onPointerUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        [bodyMesh, frontMesh, backMesh, frameMesh, ring, clampMesh, eyelet, band].forEach(function (m) {
          if (m.geometry) m.geometry.dispose();
        });
        [frontMaterial, backMaterial, edgeMaterial, metalMaterial, bandMaterial, frameMaterial].forEach(function (m) { m.dispose(); });
        [frontTexture, backTexture, strapTexture, frameTexture, grain, weave].forEach(function (t) { t.dispose(); });
        environment.dispose();
        renderer.dispose();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      }
    };
  }

  global.MSLanyard = { create: create };
})(window);
