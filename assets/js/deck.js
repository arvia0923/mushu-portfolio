/* ═══════════════════════════════════════════════════════════════
   作品区 · 牌桌
   ---------------------------------------------------------------
   阶段 1 牌堆选择：桌布上摆着几摞牌（= 不同类别的作品）
   阶段 2 抽卡发牌：选中的那摞滑到视口最上方变成「发牌器」，
                   其余牌堆向两侧滑出淡出；卡牌依次从发牌器抽出，
                   错开延迟，整齐码成网格
   阶段 3 悬停翻面：卡牌默认卡背朝上；悬停 rotateY(180deg) 翻出封面，
                   翻转瞬间从卡牌边缘迸出金色流沙；移开翻回，再次触发
   ---------------------------------------------------------------
   原生等价实现（不引第三方库）：
     layoutId       → FLIP（getBoundingClientRect + 反向 transform）
     staggerChildren→ transition-delay 逐张错开
     3D 翻转        → CSS perspective + transform-style: preserve-3d
     粒子           → assets/js/dust.js（手写 canvas）
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = (window.MS_CONFIG && window.MS_CONFIG.deck) || {};
  var ROMAN = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ'];
  var EASE = 'cubic-bezier(.18,.78,.2,1)';
  /* 牌堆飞上去单独用一条曲线：EASE 是"前冲后缓"，
     看起来像先冲到一边、再慢慢挪到位。这里用 Material 标准曲线
     （缓入 → 匀速 → 缓出），一口气滑到视口正上方。 */
  var EASE_FLY = 'cubic-bezier(.4,0,.2,1)';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function reduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function touchOnly() {
    return !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
  }

  function Deck(root, lb) {
    this.root = root;
    this.pilesWrap = root.querySelector('[data-deck-piles]');
    this.board = root.querySelector('[data-deck-board]');
    this.grid = root.querySelector('[data-deck-grid]');
    this.dealer = root.querySelector('[data-deck-dealer]');
    this.dealerImg = root.querySelector('[data-dealer-img]');
    this.backBtn = root.querySelector('[data-deck-back]');
    this.emptyBox = root.querySelector('[data-deck-empty]');
    this.lb = lb;
    this.lbVideo = lb ? lb.querySelector('[data-lightbox-video]') : null;
    this.lbNo = lb ? lb.querySelector('[data-lightbox-no]') : null;
    this.lbName = lb ? lb.querySelector('[data-lightbox-name]') : null;
    this.lbMeta = lb ? lb.querySelector('[data-lightbox-meta]') : null;
    this.lbLead = lb ? lb.querySelector('[data-lightbox-lead]') : null;
    this.lbDetail = lb ? lb.querySelector('[data-lightbox-detail]') : null;
    this.lbEmbed = lb ? lb.querySelector('[data-lightbox-embed]') : null;
    this.openWork = null;
    this.state = 'piles';       // piles → dealing → dealt
    this.current = null;
    this.hoverLock = 0;          // 发牌期间不吃悬停
    this.timers = [];

    var self = this;
    if (this.backBtn) {
      this.backBtn.addEventListener('click', function () { self.reset(); });
    }
    this.bindLightbox();
  }

  Deck.prototype.after = function (ms, fn) {
    var id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  };

  Deck.prototype.clearTimers = function () {
    this.timers.forEach(function (id) { clearTimeout(id); });
    this.timers = [];
  };

  /* ── 阶段 1：铺牌堆 ─────────────────────────────────── */
  Deck.prototype.renderPiles = function () {
    var piles = CFG.piles || [];
    if (!this.pilesWrap) return;
    var self = this;
    this.pilesWrap.innerHTML = '';

    piles.forEach(function (p) {
      var btn = el('button', 'pile');
      btn.type = 'button';
      btn.setAttribute('data-pile', p.id);
      btn.setAttribute('aria-label', p.count
        ? ('展开「' + p.name + '」牌堆，共 ' + p.count + ' 张牌')
        : ('展开「' + p.name + '」牌堆'));

      // 牌堆本体（透明底 PNG，跟随轮廓发光）
      var stack = el('span', 'pile__stack');
      var img = document.createElement('img');
      img.className = 'pile__img';
      img.src = p.image;
      img.alt = '';
      img.decoding = 'async';
      img.setAttribute('aria-hidden', 'true');
      stack.appendChild(img);
      stack.appendChild(el('span', 'pile__scrim'));
      stack.appendChild(el('span', 'pile__glow'));

      // 中间文字（悬停时高亮）
      var label = el('span', 'pile__label');
      label.appendChild(el('span', 'pile__name', p.name));
      label.appendChild(el('span', 'pile__en', p.en));
      label.appendChild(el('span', 'pile__count', p.count ? (p.count + ' 张牌') : '还没发牌'));
      stack.appendChild(label);

      btn.appendChild(stack);
      btn.addEventListener('click', function () { self.select(p, btn); });
      self.pilesWrap.appendChild(btn);
    });
  };

  /* ── 阶段 2：选一摞 → 飞成发牌器 → 发牌 ─────────────── */
  Deck.prototype.select = function (pile, btn) {
    if (this.state !== 'piles' || !this.dealer) return;
    this.state = 'dealing';
    this.current = pile;
    var self = this;

    /* 未选中的牌堆：按「相对位置」向两侧滑出并淡出。
       左边的那摞往左飞、右边的那摞往右飞 —— 谁也不会横穿被选中的牌堆。
       （早先用的是 compareDocumentPosition，把「btn 在 k 之后」当成了「k 在 btn 之后」，
         右边那摞被判成 -130vw，于是朝着被选中的牌堆撞过去。） */
    var selLeft = btn.getBoundingClientRect().left;
    var kids = this.pilesWrap.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k === btn) continue;
      var goLeft = k.getBoundingClientRect().left < selLeft;
      k.classList.add('is-out');
      k.style.setProperty('--out-x', (goLeft ? -1 : 1) * 150 + 'vw');
    }

    /* 量牌堆现在在哪 —— FLIP 的 First */
    var stack = btn.querySelector('.pile__stack');
    var first = stack.getBoundingClientRect();

    /* 发牌器就位：视口正上方，只露下半截 */
    var dW = Math.min(CFG.dealerW || 200, Math.round(window.innerWidth * 0.28));
    this.dealer.style.width = dW + 'px';
    this.dealer.style.transition = 'none';
    this.dealer.style.opacity = '0';
    this.dealer.style.visibility = 'visible';
    if (this.dealerImg) this.dealerImg.src = pile.image;

    /* 发牌器的"自然位置"：先把 transform 清掉量一次（此刻 opacity 还是 0，
       量完立刻摆回去，不会被看到）。
       起点和终点都必须相对它算 —— 早先拿终点的 rect 去减，起点整整偏了一个 fx，
       两摞牌于是都先往右上冲一段、再落回正上方。 */
    this.dealer.style.transform = 'none';
    var base = this.dealer.getBoundingClientRect();

    var H = this.dealer.offsetHeight;
    var endLeft = Math.round((window.innerWidth - dW) / 2);   /* 视口水平居中 */
    var endTop = Math.round(-H * 0.5);                        /* 只露下半截 */

    /* FLIP：起点 = 牌堆现在的位置，终点 = 视口正上方 */
    var s = first.width / dW;
    var startX = first.left - base.left;
    var startY = first.top - base.top;
    var endX = endLeft - base.left;
    var endY = endTop - base.top;

    /* 反向摆回牌堆原位，再过渡过去 */
    this.dealer.style.transform = 'translate3d(' + startX + 'px,' + startY + 'px,0) scale(' + s + ')';
    void this.dealer.offsetHeight;   // 强制回流，让起始状态落地

    this.dealer.style.transition = 'transform 900ms ' + EASE_FLY + ', opacity 420ms ease';
    this.dealer.style.opacity = '1';
    this.dealer.style.transform = 'translate3d(' + endX + 'px,' + endY + 'px,0)';

    btn.classList.add('is-gone');      // 牌堆本体淡出，发牌器接手
    this.root.classList.add('is-dealing');

    /* 发牌器快到位时开始抽卡 */
    this.after(reduced() ? 0 : 620, function () { self.deal(pile); });
  };

  Deck.prototype.worksFor = function (pile) {
    var data = window.MS_WORKS;
    if (!data || !data.works || !data.works.length) return [];
    if (!pile.include) return data.works.slice();
    return data.works.filter(function (w) {
      return pile.include.indexOf(w.id) >= 0;
    });
  };

  /* ── 发牌：一张张从发牌器里抽出来，错开延迟，码成网格 ── */
  Deck.prototype.deal = function (pile) {
    var self = this;
    var works = this.worksFor(pile);
    this.root.classList.add('is-dealt');

    /* 鼠标可能正压着牌堆原来的位置，等牌落下来会正好盖住一张 ——
       先锁一会儿悬停，别让牌自己翻起来。 */
    this.hoverLock = Date.now() + 2600;

    if (pile.empty || !works.length) {
      this.root.classList.add('is-empty');
      this.state = 'dealt';
      return;
    }
    this.root.classList.remove('is-empty');

    var dealerRect = this.dealer.getBoundingClientRect();
    var ox = dealerRect.left + dealerRect.width / 2;
    var oy = dealerRect.top + dealerRect.height * 0.62;   // 发牌器露出来的那半截

    this.grid.innerHTML = '';
    /* 牌少的时候别贴着网格左边站 —— 按张数收窄列数、居中摆 */
    this.grid.classList.toggle('is-single', works.length === 1);
    this.grid.classList.toggle('is-pair', works.length === 2);
    var cards = [];
    works.forEach(function (w, i) {
      var c = self.buildCard(w, i);
      cards.push(c);
      self.grid.appendChild(c);
    });
    void this.grid.offsetHeight;   // 先把网格排好，量得到最终位置

    if (reduced()) {
      this.state = 'dealt';
      return;
    }

    var dur = CFG.deal || 780;
    var stag = CFG.stagger || 76;

    /* First：所有卡牌先叠在发牌器那儿 */
    cards.forEach(function (card, i) {
      var last = card.getBoundingClientRect();
      var dx = ox - (last.left + last.width / 2);
      var dy = oy - (last.top + last.height / 2);
      var rot = ((i % 3) - 1) * 5;
      card.style.transition = 'none';
      card.style.opacity = '0';
      card.style.transform =
        'translate3d(' + dx + 'px,' + dy + 'px,0) scale(0.24) rotate(' + rot + 'deg)';
    });
    void this.grid.offsetHeight;   // 强制回流

    /* Last：飞进各自的位置，逐张错开 */
    cards.forEach(function (card, i) {
      var d = i * stag;
      card.style.transition =
        'transform ' + dur + 'ms ' + EASE + ' ' + d + 'ms, ' +
        'opacity ' + Math.round(dur * 0.45) + 'ms ease ' + d + 'ms';
      card.style.opacity = '1';
      card.style.transform = 'none';
    });

    /* 收尾：清掉行内样式，交回 CSS 管悬停抬升 */
    this.after(dur + (cards.length - 1) * stag + 140, function () {
      cards.forEach(function (c) {
        c.style.transition = '';
        c.style.transform = '';
        c.style.opacity = '';
      });
      self.root.classList.remove('is-dealing');
      self.state = 'dealt';
    });
  };

  /* ── 一张卡牌 ───────────────────────────────────────── */
  Deck.prototype.buildCard = function (w, i) {
    var self = this;
    var card = el('article', 'tcard');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label',
      '作品：' + w.title + '（' + w.type + '，' + w.year + '）。' +
      (touchOnly() ? '点一下翻开封面，再点一下看作品档案。'
                    : '鼠标移上去翻到封面，点击看作品档案。'));

    var inner = el('div', 'tcard__inner');

    /* 背面：牌背 + 作品名 / 日期 */
    var back = el('div', 'tcard__side tcard__side--back');
    var backImg = document.createElement('img');
    backImg.className = 'tcard__back';
    backImg.src = CFG.backImage || '';
    backImg.alt = '';
    backImg.decoding = 'async';
    backImg.setAttribute('aria-hidden', 'true');
    back.appendChild(backImg);

    var cap = el('div', 'tcard__cap');
    cap.appendChild(el('span', 'tcard__no', ROMAN[w.no] || String(w.no)));
    cap.appendChild(el('h3', 'tcard__title', w.title));
    cap.appendChild(el('p', 'tcard__meta', w.year + ' · ' + w.res + ' · ' + w.orientation));
    back.appendChild(cap);
    inner.appendChild(back);

    /* 正面：
       · 普通作品 → 顶部信息带 + 完整的 3:4 封面 + 底部文字带
         （封面是 1200×1600 的塔罗卡图，自带完整金边花框 —— 这里一格不裁地放出来）
       · 互动作品 → 原图铺满整面（不裁 3:4），右下角注明角色来源 */
    var front = el('div', 'tcard__side tcard__side--front');

    if (w.interactive) {
      var bleed = el('div', 'tcard__bleed');
      var bimg = document.createElement('img');
      bimg.className = 'tcard__bleedimg';
      bimg.src = w.interactive.cover || w.cover;
      bimg.alt = w.title + ' 画面';
      bimg.loading = 'lazy';
      bimg.decoding = 'async';
      bleed.appendChild(bimg);
      bleed.appendChild(el('span', 'tcard__credit', w.interactive.credit || '角色来源'));
      front.appendChild(bleed);
    } else {
      var face = el('div', 'tcard__face');

      var fhead = el('div', 'tcard__fhead');
      fhead.appendChild(el('span', 'tcard__fno', ROMAN[w.no] || String(w.no)));
      fhead.appendChild(el('span', 'tcard__ftype', w.type));
      face.appendChild(fhead);

      var fpic = el('div', 'tcard__fpic');
      var cover = document.createElement('img');
      cover.className = 'tcard__cover';
      cover.src = w.cover;
      cover.alt = w.title + ' 封面';
      cover.loading = 'lazy';
      cover.decoding = 'async';
      fpic.appendChild(cover);

      /* 默认不建 <video>：卡面就是封面。
         真要开悬停预览，也得等视频能播了再淡入（poster 先垫封面），
         否则 work-05 那种纯黑首帧会在翻面瞬间闪一下。 */
      if (CFG.hoverPreview === true) {
        var vid = document.createElement('video');
        vid.className = 'tcard__video';
        vid.src = w.video;
        vid.poster = w.cover;
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.preload = 'none';
        vid.setAttribute('playsinline', '');
        vid.setAttribute('aria-hidden', 'true');
        vid.addEventListener('canplay', function () { vid.classList.add('is-ready'); });
        fpic.appendChild(vid);
      }

      fpic.appendChild(el('span', 'tcard__veil'));
      face.appendChild(fpic);

      var fbody = el('div', 'tcard__fbody');
      fbody.appendChild(el('h3', 'tcard__fname', w.title));
      fbody.appendChild(el('p', 'tcard__fmeta', w.year + ' · ' + w.res + ' · ' + w.orientation));
      face.appendChild(fbody);

      front.appendChild(face);
    }
    inner.appendChild(front);

    card.appendChild(inner);

    /* 悬停 → 翻面 + 金色流沙 */
    if (!touchOnly()) {
      card.addEventListener('mouseenter', function () { self.flipOn(card); });
      card.addEventListener('mouseleave', function () { self.flipOff(card); });
    }
    card.addEventListener('focus', function () { self.flipOn(card); });
    card.addEventListener('blur', function () { self.flipOff(card); });

    card.addEventListener('click', function () {
      // 触屏：第一次点翻面，第二次点进灯箱
      if (touchOnly() && !card.classList.contains('is-flipped')) {
        self.flipOn(card);
        return;
      }
      self.open(w);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); self.open(w); }
    });

    return card;
  };

  Deck.prototype.flipOn = function (card) {
    if (card.classList.contains('is-flipped')) return;
    // 发牌刚结束的那一小段时间里，先不吃悬停
    if (this.root.classList.contains('is-dealing')) return;
    if (this.hoverLock && Date.now() < this.hoverLock) return;
    card.classList.add('is-flipped');
    var vid = card.querySelector('.tcard__video');
    if (vid && CFG.hoverPreview !== false) {
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    }
    this.burst(card);
  };

  Deck.prototype.flipOff = function (card) {
    if (!card.classList.contains('is-flipped')) return;
    card.classList.remove('is-flipped');
    var vid = card.querySelector('.tcard__video');
    if (vid) { try { vid.pause(); vid.currentTime = 0; } catch (e) {} }
    this.burst(card);
  };

  /* 翻转瞬间：金色流沙从卡牌边缘迸出来 */
  Deck.prototype.burst = function (card) {
    if (reduced()) return;
    if (!window.MSDust) return;
    var r = card.getBoundingClientRect();
    if (!r.width || !r.height) return;
    window.MSDust.burst(r, 1);
  };

  /* ── 回到牌堆 ───────────────────────────────────────── */
  Deck.prototype.reset = function () {
    if (this.state === 'piles') return;
    this.clearTimers();
    this.state = 'piles';
    this.current = null;
    this.root.classList.remove('is-dealt', 'is-dealing', 'is-empty');
    this.grid.innerHTML = '';
    this.grid.classList.remove('is-single', 'is-pair');

    if (this.dealer) {
      var self = this;
      this.dealer.style.transition = 'opacity 260ms ease';
      this.dealer.style.opacity = '0';
      this.after(280, function () {
        self.dealer.style.visibility = 'hidden';
        self.dealer.style.transition = 'none';
      });
    }

    var kids = this.pilesWrap.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.remove('is-out', 'is-gone');
      kids[i].style.removeProperty('--out-x');
    }

    // 滚回作品区顶部（不是牌堆居中 —— 那样会把「牌桌」标题压到固定导航底下）
    // .deck 上有 scroll-margin-top，和导航锚点用的是同一套偏移
    var anchor = this.root || this.pilesWrap;
    if (anchor && anchor.scrollIntoView) {
      try {
        anchor.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      } catch (e) {}
    }
  };

  /* ── 作品档案：lead + 背景 / 做法 / 反思 ───────────────
     内容来自 vault「作品集/作品条目/*.md」正文，前端数据源
     是 assets/js/works.js 里每件的 detail 字段。

     互动作品不写详细信息 —— 网页上只放作品本身，不放档案。 */
  Deck.prototype.renderDetail = function (w) {
    var isEmbed = !!(w && w.interactive);

    if (this.lbLead) {
      if (isEmbed) {
        this.lbLead.textContent = '';
        this.lbLead.hidden = true;
      } else {
        var lead = (w.detail && w.detail.lead) || w.blurb || '';
        this.lbLead.textContent = lead;
        this.lbLead.hidden = !lead;
      }
    }
    if (!this.lbDetail) return;

    this.lbDetail.innerHTML = '';
    if (isEmbed) {
      this.lbDetail.hidden = true;
      return;
    }
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

      if (sec.p && sec.p.length) {
        sec.p.forEach(function (t) {
          if (!t) return;
          block.appendChild(el('p', null, t));
        });
      }
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
    if (!this.lb) return;
    this.openWork = w;

    /* 互动作品：放一段网页小玩意（iframe），没有视频可播 */
    var embed = !!(w && w.interactive && w.interactive.html);

    if (this.lbVideo) {
      this.lbVideo.hidden = embed;
      if (!embed) {
        this.lbVideo.src = w.video;
        this.lbVideo.poster = w.cover;
      }
    }
    if (this.lbEmbed) {
      this.lbEmbed.hidden = !embed;
      var frame = this.lbEmbed.querySelector('iframe');
      if (frame) {
        var want = embed ? w.interactive.html : '';
        if ((frame.getAttribute('src') || '') !== want) {
          if (want) frame.setAttribute('src', want);
          else frame.removeAttribute('src');
        }
      }
    }
    this.lb.classList.toggle('is-embed', embed);

    if (this.lbNo) this.lbNo.textContent = ROMAN[w.no] || String(w.no);
    if (this.lbName) this.lbName.textContent = w.title;
    if (this.lbMeta) this.lbMeta.textContent = w.type + ' · ' + w.year + ' · ' + w.res;
    this.renderDetail(w);
    this.lb.hidden = false;
    document.body.classList.add('is-lightbox-open');
    if (!embed) {
      var p = this.lbVideo.play();
      if (p && p.catch) p.catch(function () {});
    }
  };

  Deck.prototype.close = function () {
    if (!this.lb) return;
    this.lb.hidden = true;
    this.lb.classList.remove('is-embed');
    document.body.classList.remove('is-lightbox-open');
    if (this.lbVideo) {
      try { this.lbVideo.pause(); } catch (e) {}
      this.lbVideo.removeAttribute('src');
      this.lbVideo.load();
    }
    /* iframe 里的待机轮播还在跑 —— 关掉就卸载，下次打开重新洗牌 */
    if (this.lbEmbed) {
      var frame = this.lbEmbed.querySelector('iframe');
      if (frame) frame.removeAttribute('src');
      this.lbEmbed.hidden = true;
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

  /* ── 启动 ───────────────────────────────────────────── */
  function boot() {
    var root = document.querySelector('[data-deck]');
    if (!root) return;

    // 翻转时长交给 CSS（--deck-flip），改 config.js 就能调
    document.documentElement.style.setProperty('--deck-flip', (CFG.flip || 720) + 'ms');

    var lb = document.querySelector('[data-lightbox]');
    var deck = new Deck(root, lb);
    window.MSDeck = deck;
    deck.renderPiles();

    /* 滚出作品区就把发牌器收起来（它钉在视口顶上）。
       ⚠️ 这里不用 IntersectionObserver：
       Chromium 把「元素边缘刚好贴着视口边缘」也算作相交（edge-adjacent），
       而 scrollIntoView 停下的位置正好是「牌桌底边 == 视口顶」，
       判定会永远停在「还在页面上」，发牌器就收不起来。
       直接量几何最省事：牌桌底边越过视口顶，就算离开作品区。
       阈值 72px = .deck / .page 的 scroll-margin-top (4.5rem) ——
       锚点跳转时下一节会停在这条线上，牌桌底边正好压着它；
       再往上一点，就说明已经滚出作品区了。 */
    if (deck.dealer) {
      /* 站点锚点线 = .deck / .page 的 scroll-margin-top (4.5rem = 72px)。
         锚点跳到「关于我 / 联系方式」时停下的位置，正好是牌桌底边压在这条线上
         （实测 72.19px，还差一点亚像素）—— 所以阈值要贴着锚点线取，
         再留 8px 余量。牌桌底边越过这条线，就说明已经离开作品区了。 */
      var sm = getComputedStyle(root).scrollMarginTop;
      var anchorOff = parseFloat(sm);
      if (!anchorOff || anchorOff < 20) anchorOff = 72;   /* rem 没解析成 px 时的兜底 */
      var SLACK = 8;
      var syncDealer = function () {
        var r = root.getBoundingClientRect();
        root.classList.toggle('is-dealer-off', r.bottom <= anchorOff + SLACK);
      };
      window.addEventListener('scroll', syncDealer, { passive: true });
      window.addEventListener('resize', syncDealer);
      syncDealer();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
