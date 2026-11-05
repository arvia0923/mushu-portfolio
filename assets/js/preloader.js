/* ═══════════════════════════════════════════════════════════════
   开屏加载动画 · Preloader
   ───────────────────────────────────────────────────────────────
   要解决的问题：3D 工作牌的照片会「先于」3D 本体蹦出来 ——
   一张扁平的照片先占位，几百毫秒后 three.js 才把带牌框的 3D 牌画上去，
   中间那一跳很突兀。

   这里的做法：**把这段加载藏在开屏后面**。
   开屏一出现，后台立刻并行把 3D 工作牌的四张贴图 + 桌布拉下来，
   等牌面真的把照片画上去（lanyard 的 ready 信号）再淡出开屏 ——
   用户看到的第一帧就是完整的 3D 牌。

   三条硬规则：
     · 轻量：动效全是 CSS（月相缓慢旋转 + 星光闪烁），不引任何图片/视频
     · 缓冲：资源秒加载完也至少show 1.5 秒（minTime），转场才不突兀
     · 保底：超过 5 秒（maxTime）强制退场，绝不让用户干等
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var MIN_TIME = 1500;   // 最短展示时长（毫秒）
  var MAX_TIME = 5000;   // 最长展示时长（毫秒）
  var FADE_MS   = 700;   // 淡出时长（毫秒），要和 CSS 里的 transition 对上

  var overlay = document.getElementById('preloader');
  if (!overlay) return;

  var bar = overlay.querySelector('.preloader__bar > span');
  var statusEl = overlay.querySelector('.preloader__status');

  var started = Date.now();
  var leaving = false;

  /* ── 关键资源清单 ─────────────────────────────────────────
     3D 工作牌的正面照片 / 背面曼陀罗 / 金属牌框 / 织带，
     再加作品区的桌布。照片本来就在里面 —— 开屏等的正是
     「照片 + 3D」这一整组，而不是某一张图。 */
  var cfg = (window.MS_CONFIG && window.MS_CONFIG.lanyard) || {};
  var urls = [];
  ['frontImage', 'backImage', 'frameImage', 'strapImage'].forEach(function (key) {
    if (cfg[key]) urls.push(cfg[key]);
  });
  urls.push('assets/deck/tablecloth-v3.jpg');

  var total = urls.length;
  var loaded = 0;

  function paint() {
    var pct = total ? Math.round((loaded / total) * 100) : 100;
    if (bar) bar.style.width = pct + '%';
    if (statusEl) {
      statusEl.textContent = pct >= 100
        ? '正在点亮月光'
        : '正在唤醒捕梦阁楼 · ' + pct + '%';
    }
  }
  paint();

  /* ── 并行拉取 ─────────────────────────────────────────────
     一个一个独立加载，谁都不等谁；任何一个失败也不算失败
     （onerror 也算「处理完毕」，不能因为一张图 404 就把用户卡在开屏）。 */
  var resources = urls.map(function (url) {
    return new Promise(function (resolve) {
      var img = new Image();
      /* 和 lanyard.js 的 loadImage 保持完全一致：
         同源 + 同样的 CORS 模式，浏览器才会复用同一条请求，
         不会为了开屏多下一份。 */
      if (location.protocol !== 'file:') img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = img.onerror = function () {
        loaded++;
        paint();
        resolve();
      };
      img.src = url;
    });
  });

  /* ── 3D 牌面「把照片画上去了」的信号 ──────────────────────
     main.js 挂的 MSLanyardReady：3D 正常时是牌面贴图的 ready 承诺，
     3D 没起来时是立刻 resolve 的 Promise（静态版也算就绪）。 */
  function lanyardPainted() {
    return new Promise(function (resolve) {
      var deadline = Date.now() + MAX_TIME;
      (function check() {
        var p = window.MSLanyardReady;
        if (p) { resolve(p); return; }
        if (Date.now() > deadline) { resolve(); return; }
        setTimeout(check, 40);
      })();
    });
  }

  var allReady = Promise.all(resources.concat([lanyardPainted()]));

  /* ── 三重保险 ─────────────────────────────────────────────
     资源齐了 ∧ 过了最短时长 → 淡出；
     超过最长时长 → 不管有没有齐，强制淡出。 */
  var minWait = new Promise(function (resolve) { setTimeout(resolve, MIN_TIME); });
  var maxWait = new Promise(function (resolve) { setTimeout(resolve, MAX_TIME); });

  function leave() {
    if (leaving) return;
    leaving = true;
    var spent = Date.now() - started;
    overlay.classList.add('is-leaving');
    document.documentElement.classList.remove('is-preloading');
    if (window.console) {
      console.info('[preloader] 退场 · 用时 ' + spent + 'ms · 资源 ' + loaded + '/' + total);
    }
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, FADE_MS + 120);
  }

  Promise.race([
    allReady.then(function () { return minWait; }),
    maxWait
  ]).then(leave);

  /* 保险丝：万一上面的链条卡住了（脚本异常等），到点也走人 */
  setTimeout(leave, MAX_TIME + 400);
})();
