/* ═══════════════════════════════════════════════════════════════
   入口：导航高亮 · 锚点平滑 · 灯箱时暂停首页 · 工作牌 · 二维码
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = (window.MS_CONFIG && window.MS_CONFIG.deck) || {};

  function initNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.masthead__nav a'));
    if (!links.length) return;
    var sections = links.map(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      return id ? document.getElementById(id) : null;
    });

    function update() {
      var view = window.MSView;
      var inHero = !view || !view.isSite || view.isHero();
      var current = null;

      if (!inHero) {
        var probe = window.pageYOffset + window.innerHeight * 0.35;
        sections.forEach(function (s) {
          if (!s) return;
          // 用 rect + pageYOffset，别用 offsetTop —— 站点层是独立容器
          var top = s.getBoundingClientRect().top + window.pageYOffset;
          if (top <= probe) current = s;
        });
      }

      links.forEach(function (a) {
        var id = (a.getAttribute('href') || '').replace('#', '');
        var hit = inHero ? (id === 'hero') : (current && id === current.id);
        if (hit) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('ms:viewchange', update);
    window.addEventListener('resize', update);
  }

  /* ── 锚点：跨视图 ──────────────────────────────────────
     首页视图里页面是锁住的，点「作品 / 关于我 / 联系方式」
     必须先交叉淡化进站点视图，再滚到对应锚点。
     点「首页」是主动操作，可以从站点视图淡回首页
     （滚轮上滑回不去 —— 那是刻意设计的不可逆导航）。 */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();

      var view = window.MSView;
      if (!view || !view.ready) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (id === 'hero') {
        view.toHero();
        return;
      }

      if (view.isHero()) {
        view.toSite(function () { view.scrollToId(id); });
      } else {
        view.scrollToId(id);
      }
    });
  }

  function initLightboxHook() {
    if (CFG.pauseHeroWhenOpen === false) return;
    var observer = new MutationObserver(function () {
      var open = document.body.classList.contains('is-lightbox-open');
      var hero = window.MSHero;
      if (!hero) return;
      if (open) {
        [hero.idleA, hero.idleB, hero.rot, hero.fin].forEach(function (v) {
          if (v) { try { v.pause(); } catch (err) {} }
        });
      } else {
        hero.resumeAll();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function initLanyard() {
    var cfg = (window.MS_CONFIG && window.MS_CONFIG.lanyard) || {};

    /* 开屏动画等的信号：牌面贴图（照片）画上去的那一刻 resolve。
       默认先当成「静态版，立刻就绪」，等真的 3D 起来再换成实例的承诺。 */
    window.MSLanyardReady = Promise.resolve();

    var stage = document.querySelector('[data-lanyard-stage]');
    var host = document.querySelector('.lanyard');

    /* 3D 没起来 → 静态降级版顶上来。
       默认是**藏着的**（.lanyard__fallback 默认 display:none），
       这样那张照片的 <img> 才有条件用 loading="lazy" 真正推迟 ——
       display:none 的图浏览器本来就会照下载。 */
    function useFallback(reason) {
      if (host) host.classList.add('no-3d');
      if (reason && window.console) console.info('[lanyard] ' + reason);
    }

    if (cfg.enabled === false) { useFallback('已关闭 → 静态工作牌'); return; }
    if (!stage || !host) return;

    // file:// 打开时，浏览器把 file 图片当跨源源：画进 canvas 再上传 WebGL 会抛安全错误。
    // 所以双击打开时保留静态工作牌；用本地服务器 / 部署后的地址打开才有 3D 版。
    if (location.protocol === 'file:') {
      useFallback('file:// 模式 → 静态工作牌（用本地服务器打开可看 3D 版）');
      return;
    }
    if (!window.MSLanyard || !window.THREE) {
      useFallback('three.js / lanyard.js 没加载成功 → 静态工作牌');
      if (window.console) console.warn('[lanyard] three.js / lanyard.js 没加载成功，退回静态工作牌');
      return;
    }

    var instance = window.MSLanyard.create(stage, cfg);
    if (!instance) {
      useFallback('WebGL 不可用 → 静态工作牌');
      if (window.console) console.warn('[lanyard] WebGL 不可用，退回静态工作牌');
      return;
    }
    host.classList.add('is-3d');
    window.MSLanyardInstance = instance;
    window.MSLanyardReady = instance.ready || Promise.resolve();
  }

  /* ── 抖音二维码：悬停显示；点一下也能切换（触屏没有 hover） ── */
  function initQr() {
    var qr = document.querySelector('[data-qr]');
    if (!qr) return;
    qr.addEventListener('click', function () {
      qr.classList.toggle('is-open');
    });
    qr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        qr.classList.toggle('is-open');
      }
    });
  }

  function boot() {
    initNav();
    initAnchors();
    initLightboxHook();
    initLanyard();
    initQr();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
