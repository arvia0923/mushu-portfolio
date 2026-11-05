/* ═══════════════════════════════════════════════════════════════
   作品区 · 塔罗牌阵（骨架）
   数据源：window.MS_WORKS
   卡内画面占比 ≥ 80%；悬停静音预览；点开进灯箱全屏播放
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = (window.MS_CONFIG && window.MS_CONFIG.deck) || {};
  var ROMAN = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function Deck(grid, lightbox) {
    this.grid = grid;
    this.lb = lightbox;
    this.lbVideo = lightbox ? lightbox.querySelector('[data-lightbox-video]') : null;
    this.lbNo = lightbox ? lightbox.querySelector('[data-lightbox-no]') : null;
    this.lbName = lightbox ? lightbox.querySelector('[data-lightbox-name]') : null;
    this.lbMeta = lightbox ? lightbox.querySelector('[data-lightbox-meta]') : null;
    this.lbLead = lightbox ? lightbox.querySelector('[data-lightbox-lead]') : null;
    this.lbDetail = lightbox ? lightbox.querySelector('[data-lightbox-detail]') : null;
    this.openWork = null;
    this.bindLightbox();
  }

  Deck.prototype.render = function () {
    var data = window.MS_WORKS;
    if (!data || !data.works || !data.works.length) return;
    this.grid.innerHTML = '';

    data.works.forEach(function (w) {
      this.grid.appendChild(this.buildCard(w));
    }, this);
  };

  Deck.prototype.buildCard = function (w) {
    var card = el('article', 'card');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', '打开作品：' + w.title);

    // 顶部：罗马数字 + 类型
    var no = el('div', 'card__no');
    no.appendChild(el('span', null, ROMAN[w.no] || String(w.no)));
    no.appendChild(el('small', null, w.type));
    card.appendChild(no);

    // 画面：封面 + 悬停预览视频
    var frame = el('div', 'card__frame');
    var img = document.createElement('img');
    img.src = w.cover;
    img.alt = w.title + ' 封面';
    img.loading = 'lazy';
    frame.appendChild(img);

    var vid = document.createElement('video');
    vid.src = w.video;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.preload = 'none';
    vid.setAttribute('playsinline', '');
    frame.appendChild(vid);
    card.appendChild(frame);

    // 底部：牌名 + 规格 + 简介
    var foot = el('div', 'card__foot');
    foot.appendChild(el('h3', 'card__title', w.title));
    foot.appendChild(el('p', 'card__meta',
      w.year + ' · ' + w.res + ' · ' + w.orientation + (w.featured ? ' · 精选' : '')));
    foot.appendChild(el('p', 'card__blurb', w.blurb));
    card.appendChild(foot);

    // 悬停静音预览
    if (CFG.hoverPreview !== false) {
      card.addEventListener('mouseenter', function () {
        var p = vid.play();
        if (p && p.catch) p.catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        try { vid.pause(); vid.currentTime = 0; } catch (e) {}
      });
    }

    var self = this;
    var open = function () { self.open(w); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.open(w); }
    });

    return card;
  };

  /* ── 作品档案：lead + 背景 / 做法 / 反思 ───────────────────
     内容来自 vault「作品集/作品条目/*.md」正文，前端数据源
     是 assets/js/works.js 里每件的 detail 字段。 */
  Deck.prototype.renderDetail = function (w) {
    if (this.lbLead) {
      var lead = (w.detail && w.detail.lead) || w.blurb || '';
      this.lbLead.textContent = lead;
      this.lbLead.hidden = !lead;
    }
    if (!this.lbDetail) return;

    this.lbDetail.innerHTML = '';
    var d = w.detail;
    if (!d || !d.sections || !d.sections.length) {
      this.lbDetail.hidden = true;
      return;
    }
    this.lbDetail.hidden = false;

    d.sections.forEach(function (sec) {
      if (!sec || !sec.h) return;
      var block = el('div', 'dblock');
      block.appendChild(el('h4', null, sec.h));

      // 段落
      if (sec.p && sec.p.length) {
        sec.p.forEach(function (t) {
          if (!t) return;
          block.appendChild(el('p', null, t));
        });
      }
      // 要点列表
      if (sec.ul && sec.ul.length) {
        var ul = el('ul', null);
        sec.ul.forEach(function (t) {
          if (!t) return;
          ul.appendChild(el('li', null, t));
        });
        block.appendChild(ul);
      }
      this.lbDetail.appendChild(block);
    }, this);
  };

  Deck.prototype.open = function (w) {
    if (!this.lb || !this.lbVideo) return;
    this.openWork = w;
    this.lbVideo.src = w.video;
    this.lbVideo.poster = w.cover;
    if (this.lbNo) this.lbNo.textContent = ROMAN[w.no] || String(w.no);
    if (this.lbName) this.lbName.textContent = w.title;
    if (this.lbMeta) this.lbMeta.textContent = w.type + ' · ' + w.year + ' · ' + w.res;
    this.renderDetail(w);
    this.lb.hidden = false;
    document.body.classList.add('is-lightbox-open');
    var p = this.lbVideo.play();
    if (p && p.catch) p.catch(function () {});
  };

  Deck.prototype.close = function () {
    if (!this.lb) return;
    this.lb.hidden = true;
    document.body.classList.remove('is-lightbox-open');
    if (this.lbVideo) {
      try { this.lbVideo.pause(); } catch (e) {}
      this.lbVideo.removeAttribute('src');
      this.lbVideo.load();
    }
    this.openWork = null;
  };

  Deck.prototype.bindLightbox = function () {
    var self = this;
    if (!this.lb) return;

    var closeBtn = this.lb.querySelector('[data-lightbox-close]');
    if (closeBtn) closeBtn.addEventListener('click', function () { self.close(); });

    this.lb.addEventListener('click', function (e) {
      if (e.target === self.lb) self.close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !self.lb.hidden) self.close();
    });
  };

  function boot() {
    var grid = document.querySelector('[data-deck-grid]');
    if (!grid) return;
    var lb = document.querySelector('[data-lightbox]');
    window.MSDeck = new Deck(grid, lb);
    window.MSDeck.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
