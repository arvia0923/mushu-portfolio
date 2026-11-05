/* ═══════════════════════════════════════════════════════════════
   视图切换 · 首页 ⇄ 站点（作品 / 关于 / 联系）
   ---------------------------------------------------------------
   两个视图都是「全屏层」：
     · 首页  = 固定铺满视口的视频场景（滚轮驱动视频进度，不滚页面）
     · 站点  = 作品 + 关于 + 联系方式（正常滚动）
   切换用 opacity 交叉淡化，没有任何位移滑动；
   一旦进入站点，首页整层退场（visibility:hidden），
   滚轮上滑也回不去了 —— 这是刻意设计的「不可逆导航」。
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = (window.MS_CONFIG && window.MS_CONFIG.view) || {};
  var FADE = CFG.fadeMs == null ? 900 : CFG.fadeMs;

  var View = {
    mode: 'hero',          // 'hero' | 'site'
    hero: null,
    site: null,
    ready: false,
    _timer: null
  };

  var root = document.documentElement;

  /* 视图切换广播：导航高亮等跟着刷新 */
  function emit() {
    try {
      window.dispatchEvent(new CustomEvent('ms:viewchange', {
        detail: { mode: View.mode }
      }));
    } catch (e) {}
  }

  View.boot = function () {
    this.hero = document.querySelector('[data-view-hero]');
    this.site = document.querySelector('[data-view-site]');
    if (!this.hero || !this.site) return;
    root.style.setProperty('--view-fade', FADE + 'ms');
    root.classList.add('is-view-hero');
    this.ready = true;
  };

  /* ── 进入站点 ───────────────────────────────────────────── */
  View.toSite = function (after) {
    if (!this.ready) return;
    if (this.mode === 'site') { if (after) after(); return; }
    this.mode = 'site';
    clearTimeout(this._timer);

    // 先解锁滚动（首页阶段是锁住的），再淡出首页、淡入站点
    root.classList.remove('is-view-hero');
    root.classList.add('is-view-site');
    try { window.scrollTo(0, 0); } catch (e) {}

    this.site.classList.add('is-visible');
    this.hero.classList.add('is-leaving');

    // 首页视频全部停下，省资源
    if (window.MSHero) window.MSHero.pauseAll();

    // 目标锚点在淡化开始时就滚过去，滚动和淡化同时跑
    if (after) after();

    var self = this;
    this._timer = setTimeout(function () {
      self.hero.setAttribute('aria-hidden', 'true');
    }, FADE);

    emit();
  };

  /* ── 回到首页 ───────────────────────────────────────────── */
  View.toHero = function () {
    if (!this.ready) return;
    if (this.mode === 'hero') return;
    this.mode = 'hero';
    clearTimeout(this._timer);

    root.classList.remove('is-view-site');
    root.classList.add('is-view-hero');
    this.hero.removeAttribute('aria-hidden');
    this.hero.classList.remove('is-leaving');

    // 视频从头再来一遍（idle → rotating → final）
    if (window.MSHero) window.MSHero.restart();

    this.site.classList.remove('is-visible');

    emit();
  };

  /* ── 站点内滚动到某个锚点 ───────────────────────────────── */
  View.scrollToId = function (id) {
    var target = document.getElementById(id);
    if (!target) return;
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      window.scrollTo(0, target.offsetTop);
    }
  };

  View.isHero = function () { return this.mode === 'hero'; };
  View.isSite = function () { return this.mode === 'site'; };

  window.MSView = View;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { View.boot(); });
  } else {
    View.boot();
  }
})();
