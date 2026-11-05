/* ═══════════════════════════════════════════════════════════════
   金色流沙 · 轻量 canvas 粒子
   ---------------------------------------------------------------
   · 翻牌瞬间从卡牌边缘迸出一圈金砂，缓缓飘散、淡出
   · 零依赖：一个 <canvas> + 一个粒子数组 + 一个 rAF 循环
   · 没有粒子时自动停掉 rAF（不空转，不耗电）
   · 「细碎、暗多亮少」：八成暗金沙砾垫底，两成中调，
     不到一成是高光（偶尔闪一下）—— 暗的托着亮的，才像流沙
   · 叠加模式 'lighter' → 有辉光感
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MAX = 1320;          // 粒子上限，防止连续悬停把数组撑爆
  var GRAVITY = 47;        // px/s²（39 × 1.2：消散再快两成，滑落更利落）
  var DRAG = 1.9;          // 阻尼（每秒）——大一点才飘得轻盈
  var LIFE = [1.12, 2.08]; // 存活秒数（1.4~2.6 × 0.8：消散再快两成）

  /* 三档粒子：暗多亮少 */
  var DARK = 0, MID = 1, BRIGHT = 2;

  var canvas = null, ctx = null;
  var dpr = 1;
  var parts = [];
  var raf = 0;
  var last = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function ensure() {
    if (!canvas) {
      canvas = document.querySelector('[data-dust]');
      if (!canvas) return false;
      ctx = canvas.getContext('2d');
      if (!ctx) return false;
    }
    var w = window.innerWidth, h = window.innerHeight;
    var d = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * d) || canvas.height !== Math.round(h * d)) {
      canvas.width = Math.round(w * d);
      canvas.height = Math.round(h * d);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    dpr = d;
    return true;
  }

  /* 在矩形某条边上取一点 + 朝外的法线 */
  function edgePoint(r) {
    var t = Math.random();
    var side = (Math.random() * 4) | 0;
    if (side === 0) return { x: r.left + t * r.width, y: r.top, nx: 0, ny: -1 };
    if (side === 1) return { x: r.left + t * r.width, y: r.bottom, nx: 0, ny: 1 };
    if (side === 2) return { x: r.left, y: r.top + t * r.height, nx: -1, ny: 0 };
    return { x: r.right, y: r.top + t * r.height, nx: 1, ny: 0 };
  }

  /* 抽一档粒子：80% 暗、15% 中、5% 亮 */
  function pickKind() {
    var roll = Math.random();
    if (roll < 0.80) return DARK;
    if (roll < 0.95) return MID;
    return BRIGHT;
  }

  function spawn(rect, count) {
    for (var i = 0; i < count; i++) {
      var e = edgePoint(rect);
      var sp = rand(10, 38);            // 出边速度：轻盈，不炸开
      var slide = rand(-20, 20);        // 沿边滑动
      var life = rand(LIFE[0], LIFE[1]);
      var kind = pickKind();

      /* 暗的稍大、亮的小而强 —— 和「衬」的关系反着来
         （半径统一再收 10%：颗粒更细碎） */
      var r, alpha;
      if (kind === DARK) {
        r = rand(0.9, 1.71);
        alpha = rand(0.30, 0.52);
      } else if (kind === MID) {
        r = rand(0.63, 1.215);
        alpha = rand(0.58, 0.78);
      } else {
        r = rand(0.405, 0.855);
        alpha = rand(0.85, 1.0);
      }

      parts.push({
        x: e.x + rand(-2, 2),
        y: e.y + rand(-2, 2),
        vx: e.nx * sp + e.ny * slide,
        vy: e.ny * sp + e.nx * slide - rand(3, 20),  // 微微上扬，像浮尘
        r: r,
        kind: kind,
        alpha: alpha,
        life: life,
        max: life,
        twSpeed: rand(3, 9),             // 高光闪烁的频率
        sway: rand(0.6, 2.2),
        phase: rand(0, Math.PI * 2)
      });
    }
    if (parts.length > MAX) parts.splice(0, parts.length - MAX);
  }

  function frame(now) {
    raf = 0;
    if (!ctx) return;

    var t = now / 1000;
    var dt = last ? Math.min(t - last, 0.05) : 0.016;
    last = t;

    var w = window.innerWidth, h = window.innerHeight;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    var alive = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.life -= dt;
      if (p.life <= 0) continue;

      p.vx -= p.vx * DRAG * dt;
      p.vy -= p.vy * DRAG * dt;
      p.vy += GRAVITY * dt;
      p.vx += Math.sin(t * p.sway + p.phase) * 7 * dt;   // 轻微横摆，像流沙

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      var k = p.life / p.max;                 // 1 → 0
      var fade = k < 0.32 ? k / 0.32 : 1;     // 末尾一段淡出
      fade *= fade;
      var a = p.alpha * fade;

      if (p.kind === BRIGHT) {
        /* 高光偶尔闪一下：正弦取正、六次方 → 尖峰 */
        var s = Math.max(0, Math.sin(t * p.twSpeed + p.phase));
        a *= 0.5 + 0.5 * Math.pow(s, 6);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
        g.addColorStop(0, 'rgba(255, 249, 226, ' + (a * 0.98) + ')');
        g.addColorStop(0.3, 'rgba(230, 196, 128, ' + (a * 0.42) + ')');
        g.addColorStop(1, 'rgba(201, 168, 106, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 7, 0, 6.2832);
        ctx.fill();
      } else if (p.kind === MID) {
        /* 中调：一粒小星点，略微发亮 */
        ctx.fillStyle = 'rgba(226, 193, 124, ' + a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      } else {
        /* 暗金沙砾：只管铺底，不抢戏 */
        ctx.fillStyle = 'rgba(141, 106, 52, ' + a + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      alive.push(p);
    }
    parts = alive;
    ctx.globalCompositeOperation = 'source-over';

    if (parts.length) {
      raf = requestAnimationFrame(frame);
    } else {
      last = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  function run() {
    if (raf) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  /* 对外：从某个矩形（卡牌）边缘迸出一圈金砂 */
  function burst(rect, scale) {
    if (!rect || rect.width < 2 || rect.height < 2) return;
    if (!ensure()) return;
    var n = Math.round((rect.width + rect.height) / 3.6);  // 细碎 → 数量多、体积小（密度 +10%）
    if (n < 33) n = 33;
    if (n > 143) n = 143;
    spawn(rect, Math.round(n * (scale || 1)));
    run();
  }

  window.MSDust = { burst: burst };

  /* 窗口尺寸变了要重建画布 */
  var rt = 0;
  window.addEventListener('resize', function () {
    if (!parts.length) return;
    clearTimeout(rt);
    rt = setTimeout(function () { if (ensure()) run(); }, 180);
  });
})();
