/* ═══════════════════════════════════════════════════════════════
   首页 · 三段视频控制器
   idle（自动循环）→ rotating（滚动驱动）→ final（定格）
   原则：视频层常驻 DOM 不卸载，段间用透明度交叉淡化，
        滚动进度是连续值 + 插值，不按滚轮次数跳帧。
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CFG = (window.MS_CONFIG && window.MS_CONFIG.hero) || {};
  var C = {
    scrollDistance: 2400,
    enterPoint: 0.04,
    finalPoint: 0.88,
    easing: 0.14,
    crossfadeMs: 380,
    loopFadeMs: 420,
    seamlessLoop: true,
    seekThreshold: 0.012,
    holdFinalFrame: true,
    tailGuard: 0.04,
    jumpToDeck: true,
    jumpTarget: '#deck',
    jumpDelay: 0,
    chimeCenterX: 0.35,
    chimeWidth: 0.24,
    sourceRatio: 16 / 9,
    debug: false
  };
  for (var k in CFG) { if (Object.prototype.hasOwnProperty.call(CFG, k)) C[ k ] = CFG[k]; }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* 调试日志：config 里把 hero.debug 打开就有 */
  function dbg() {
    if (!C.debug || !window.console || !window.console.info) return;
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[MSHero]');
    window.console.info.apply(window.console, args);
  }

  /* ─────────────────────────────────────────────────────────
     无缝循环对：两个图层同一素材，相位错开做交叉淡化，
     把「尾帧 → 首帧」的硬跳变成一次溶解。
     ───────────────────────────────────────────────────────── */
  function LoopPair(a, b, fadeSec) {
    this.a = a;
    this.b = b;
    this.fade = fadeSec;
    this.front = a;
    this.back = b;
    this.phase = 'idle';      // idle → prep → fade → idle
    this.frontOpacity = 1;
    this.backOpacity = 0;
    this.started = false;
  }

  LoopPair.prototype.start = function () {
    if (this.started) return;
    this.started = true;
    this.front.currentTime = 0;
    this.back.currentTime = 0;
    this.back.pause();
    var p = this.front.play();
    if (p && p.catch) p.catch(function () {});
  };

  /* 从头再播一遍（切回首页时用） */
  LoopPair.prototype.restart = function () {
    this.started = true;
    this.phase = 'idle';
    this.frontOpacity = 1;
    this.backOpacity = 0;
    try { this.front.currentTime = 0; } catch (e) {}
    try { this.back.currentTime = 0; this.back.pause(); } catch (e) {}
    var p = this.front.play();
    if (p && p.catch) p.catch(function () {});
  };

  LoopPair.prototype.applySound = function (audible) {
    if (this.phase === 'fade') {
      this.front.muted = true;          // 出场层静音
      this.back.muted = !audible;       // 入场层接管声音
    } else {
      this.front.muted = !audible;
      this.back.muted = true;
    }
  };

  LoopPair.prototype.update = function () {
    var f = this.front;
    var dur = f.duration;
    if (!isFinite(dur) || dur <= 0) return;

    var t = f.currentTime;

    // 提前一点把备用层复位并起播，交叉淡化时它已经有画面了
    if (this.phase === 'idle' && t >= dur - this.fade - 0.28) {
      this.phase = 'prep';
      try {
        this.back.currentTime = 0;
        this.back.muted = true;
        var p = this.back.play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
    }

    if (this.phase === 'prep' || this.phase === 'fade') {
      var k = clamp((t - (dur - this.fade)) / this.fade, 0, 1);
      if (k > 0 && this.phase !== 'fade') this.phase = 'fade';

      if (this.phase === 'fade') {
        this.frontOpacity = 1 - k;
        this.backOpacity = k;
      }

      if (k >= 1 || f.ended) {
        // 交接：新的前台接管，旧的复位待命
        try { f.pause(); } catch (e) {}
        var old = this.front;
        this.front = this.back;
        this.back = old;
        this.frontOpacity = 1;
        this.backOpacity = 0;
        this.phase = 'idle';
        try { this.back.currentTime = 0; this.back.pause(); } catch (e) {}
      }
    }
  };

  /* ─────────────────────────────────────────────────────────
     主控制器
     ───────────────────────────────────────────────────────── */
  function HeroController(root) {
    this.root = root;
    // .hero-track 是 .hero 的父级，必须向上找，不能在 root 内部查
    this.track = (root.closest && root.closest('[data-hero-track]')) ||
                 document.querySelector('[data-hero-track]');
    this.stage = root.querySelector('.hero');

    var idle = root.querySelectorAll('[data-layer="idle"]');
    this.idleA = idle[0] || null;
    this.idleB = idle[1] || idle[0] || null;
    this.rot = root.querySelector('[data-layer="rotating"]');
    this.fin = root.querySelector('[data-layer="final"]');

    this.phaseEl = root.querySelector('[data-phase-wrap]');
    this.phaseFill = root.querySelector('[data-phase-fill]');
    this.phaseMoon = root.querySelector('[data-phase-moon]');
    this.phaseCaption = root.querySelector('[data-phase-caption]');
    this.scrollCue = root.querySelector('[data-scroll-cue]');
    this.soundBtn = document.querySelector('[data-sound]');

    this.soundOn = false;
    this.p = 0;
    this.target = 0;
    this.virtual = 0;          // 虚拟滚动量（首页视图下页面是锁住的）
    this.vel = 0;              // 惯性速度（px/s），停手后慢慢衰减到 0
    this.state = 'idle';
    this.oIdle = 1;
    this.oRot = 0;
    this.oFin = 0;
    this.ready = false;
    this.visible = true;
    this.lastNow = 0;
    this.trackTop = 0;
    this.scrollDistance = C.scrollDistance;

    this.loop = new LoopPair(this.idleA, this.idleB, C.loopFadeMs / 1000);

    this.bind();
    this.measure();
    this.loop.start();
    this.frame = this.frame.bind(this);
    requestAnimationFrame(this.frame);
  }

  HeroController.prototype.bind = function () {
    var self = this;

    /* ── 虚拟滚动 ─────────────────────────────────────────
       首页视图下页面本身是锁住的（html.is-view-hero { overflow:hidden }），
       滚轮不滚页面，而是把位移喂给视频进度。
       所以「滚动驱动视频」和「页面滚动锁定」不会打架。 */
    var isHeroView = function () {
      return !(window.MSView && window.MSView.isSite && window.MSView.isSite());
    };

    this.onWheel = function (event) {
      if (!isHeroView()) return;          // 站点模式：让浏览器正常滚
      event.preventDefault();
      var d = event.deltaY;
      if (event.deltaMode === 1) d *= 16;                       // 行
      else if (event.deltaMode === 2) d *= window.innerHeight;  // 页
      self.nudge(d);
    };
    window.addEventListener('wheel', this.onWheel, { passive: false });

    // 触摸
    var lastY = null;
    this.onTouchStart = function (event) {
      if (!isHeroView()) return;
      lastY = event.touches[0].clientY;
    };
    this.onTouchMove = function (event) {
      if (!isHeroView() || lastY == null) return;
      var y = event.touches[0].clientY;
      var d = (lastY - y) * 1.6;
      lastY = y;
      event.preventDefault();
      self.nudge(d);
    };
    this.onTouchEnd = function () { lastY = null; };
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });

    // 键盘
    this.onKey = function (event) {
      if (!isHeroView()) return;
      var tag = (event.target && event.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      var step = 0;
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') step = 240;
      else if (event.key === 'ArrowUp' || event.key === 'PageUp') step = -240;
      else if (event.key === 'End') step = 1e6;
      else if (event.key === 'Home') step = -1e6;
      else return;
      event.preventDefault();
      self.nudge(step);
    };
    window.addEventListener('keydown', this.onKey);

    this.onResize = function () { self.measure(); self.readScroll(); };
    window.addEventListener('resize', this.onResize);

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', function () { self.toggleSound(); });
    }
  };

  /* 累加虚拟滚动量 → 目标进度 */
  HeroController.prototype.nudge = function (delta) {
    // 惯性：同向叠加，反向直接替换（来回抖动时不会攒出诡异速度）
    var gain = C.wheelGain == null ? 0 : C.wheelGain;
    if (gain) {
      if (this.vel === 0 || (delta > 0) === (this.vel > 0)) this.vel += delta * gain;
      else this.vel = delta * gain;
      var max = C.maxVel || 2600;
      this.vel = clamp(this.vel, -max, max);
    }
    var direct = C.wheelDirect == null ? 1 : C.wheelDirect;
    this.virtual = clamp(this.virtual + delta * direct, 0, this.scrollDistance);
    this.readScroll();
  };

  /* 惯性滑行：滚轮停下后视频不会硬停，而是继续走一段、慢慢减速到 0。
     位置是「积分」出来的，所以任何时刻都是连续的，不会跳帧。 */
  HeroController.prototype.glide = function (dt) {
    if (this.vel !== 0) {
      var before = this.virtual;
      this.virtual = clamp(this.virtual + this.vel * dt, 0, this.scrollDistance);
      // 顶到边界就把速度吃掉，不然会一直顶着
      if (this.virtual === before) this.vel = 0;
      var tau = Math.max(C.coastTau == null ? 0.5 : C.coastTau, 0.05);
      this.vel *= Math.exp(-dt / tau);
      if (Math.abs(this.vel) < 1) this.vel = 0;
    }
    this.readScroll();
  };

  HeroController.prototype.measure = function () {
    if (!this.track) return;
    var rect = this.track.getBoundingClientRect();
    this.trackTop = rect.top + window.pageYOffset;
    // 小屏减一半行程
    this.scrollDistance = Math.round(C.scrollDistance * (window.innerWidth < 760 ? 0.6 : 1));
    this.track.style.setProperty('--hero-scroll', this.scrollDistance + 'px');
    this.virtual = clamp(this.virtual, 0, this.scrollDistance);
    this.fitChime();
  };

  /* 回到首页时，视频从头再来一遍 */
  HeroController.prototype.restart = function () {
    this.virtual = 0;
    this.target = 0;
    this.p = 0;
    this.vel = 0;
    this.jumped = false;
    this.oIdle = 1;
    this.oRot = 0;
    this.oFin = 0;
    this.state = 'idle';
    try { if (this.fin) { this.fin.pause(); this.fin.currentTime = 0; } } catch (e) {}
    try { if (this.rot) { this.rot.pause(); this.rot.currentTime = 0; } } catch (e) {}
    if (this.loop) this.loop.restart();
    this.onState('idle');
  };

  /* ─────────────────────────────────────────────────────────
     窄屏对齐：视频是 object-fit: cover，窄屏时横向会被裁掉一大截，
     风铃主体正好偏在左边，很容易整块被裁没。
     这里按素材比例算一下横向能看到多少，再把主体重新摆到画面中间。
     ───────────────────────────────────────────────────────── */
  HeroController.prototype.fitChime = function () {
    var W = window.innerWidth, H = window.innerHeight;
    if (!W || !H) return;
    var srcRatio = C.sourceRatio || 16 / 9;
    var boxRatio = W / H;
    // cover 之后，横向能看到素材的多少比例
    var visible = boxRatio < srcRatio ? (boxRatio / srcRatio) : 1;
    var c = C.chimeCenterX;
    var x;
    if (visible >= 0.999) {
      x = 0.5;
    } else {
      // object-position 的 x% 表示「素材 x% 处对齐容器 x% 处」，
      // 反解出能让主体落在可视窗口正中间的 x
      x = (c - visible / 2) / (1 - visible);
      x = clamp(x, 0, 1);
    }
    var pos = (x * 100).toFixed(2) + '% 50%';
    [this.idleA, this.idleB, this.rot, this.fin].forEach(function (el) {
      if (el) el.style.objectPosition = pos;
    });
  };

  HeroController.prototype.readScroll = function () {
    this.target = clamp(this.virtual / this.scrollDistance, 0, 1);
  };

  HeroController.prototype.pauseAll = function () {
    [this.idleA, this.idleB, this.rot, this.fin].forEach(function (v) {
      if (v) { try { v.pause(); } catch (e) {} }
    });
  };

  HeroController.prototype.resumeAll = function () {
    if (!this.ready) return;
    // 站点模式下首页视频不需要再跑
    if (window.MSView && window.MSView.isSite && window.MSView.isSite()) return;
    // 回到首页时，如果还停在定格段，把定格视频重新起播
    if (this.state === 'final') {
      if (this.fin) {
        try { var pf = this.fin.play(); if (pf && pf.catch) pf.catch(function () {}); } catch (e) {}
      }
      return;
    }
    if (this.state === 'idle' && this.loop.started) {
      var p = this.loop.front.play();
      if (p && p.catch) p.catch(function () {});
    }
  };

  HeroController.prototype.toggleSound = function () {
    this.soundOn = !this.soundOn;
    if (this.soundBtn) {
      this.soundBtn.setAttribute('aria-pressed', this.soundOn ? 'true' : 'false');
      var lbl = this.soundBtn.querySelector('.sound__label');
      if (lbl) lbl.textContent = this.soundOn ? '关闭声音' : '开启声音';
    }
    // 用户手势里解静音 + 起播，浏览器才放行
    var active = this.state === 'final' ? this.fin
               : (this.state === 'rotating' ? this.rot : this.loop.front);
    if (active) {
      active.muted = !this.soundOn;
      if (this.soundOn) {
        var p = active.play();
        if (p && p.catch) p.catch(function () {});
      }
    }
  };

  HeroController.prototype.checkReady = function () {
    if (this.ready) return;
    var all = [this.idleA, this.idleB, this.rot, this.fin];
    for (var i = 0; i < all.length; i++) {
      if (!all[i] || all[i].readyState < 3) return;
    }
    this.ready = true;
    // 预热：让两段非自动播放的视频先把第一帧解码出来，避免切换时黑闪
    var self = this;
    [this.rot, this.fin].forEach(function (v) {
      if (!v) return;
      try {
        var pr = v.play();
        if (pr && pr.then) {
          pr.then(function () {
            setTimeout(function () {
              try {
                // 如果这段正好是正在播的定格视频，别把它停掉（否则 ended 永远不触发）
                if (v === self.fin && self.state === 'final') return;
                v.pause(); v.currentTime = 0;
              } catch (e) {}
            }, 90);
          }).catch(function () {});
        }
      } catch (e) {}
    });
  };

  HeroController.prototype.frame = function (now) {
    var dt = this.lastNow ? Math.min((now - this.lastNow) / 1000, 0.06) : 0.016;
    this.lastNow = now;

    // 惯性滑行：先算位置，再插值
    this.glide(dt);

    // 连续进度 + 插值（帧率无关）
    var k = 1 - Math.pow(1 - clamp(C.easing, 0.01, 1), dt * 60);
    this.p += (this.target - this.p) * k;
    if (Math.abs(this.target - this.p) < 0.00015) this.p = this.target;

    this.checkReady();
    this.render(dt);

    requestAnimationFrame(this.frame);
  };

  HeroController.prototype.render = function (dt) {
    var p = this.p;
    var A = C.enterPoint;
    var B = C.finalPoint;

    // ── 状态 ──────────────────────────────────────────
    var state = p < A ? 'idle' : (p < B ? 'rotating' : 'final');

    // ── 目标不透明度 + 时间常数平滑（过渡时长 ≈ crossfadeMs）──
    var tau = Math.max(C.crossfadeMs, 40) / 1000 / 3;
    var f = 1 - Math.exp(-dt / tau);
    this.oIdle += ((p < A ? 1 : 0) - this.oIdle) * f;
    this.oRot += ((p >= A && p < B ? 1 : 0) - this.oRot) * f;
    this.oFin += ((p >= B ? 1 : 0) - this.oFin) * f;

    // ── 视频 1：循环对 ────────────────────────────────
    if (C.seamlessLoop && this.loop.started) {
      this.loop.update();
    }
    var idleAOp = this.loop.front === this.idleA ? this.loop.frontOpacity : this.loop.backOpacity;
    var idleBOp = this.loop.front === this.idleB ? this.loop.frontOpacity : this.loop.backOpacity;
    if (this.idleA) this.idleA.style.opacity = (this.oIdle * idleAOp).toFixed(4);
    if (this.idleB) this.idleB.style.opacity = (this.oIdle * idleBOp).toFixed(4);

    // ── 视频 2：滚动进度 → currentTime ────────────────
    if (this.rot && this.rot.readyState >= 2 && isFinite(this.rot.duration)) {
      var t2 = clamp((p - A) / Math.max(B - A, 0.0001), 0, 1);
      var goal = t2 * Math.max(0, this.rot.duration - C.tailGuard);
      if (Math.abs(this.rot.currentTime - goal) > C.seekThreshold) {
        try { this.rot.currentTime = goal; } catch (e) {}
      }
      if (!this.rot.paused) { try { this.rot.pause(); } catch (e) {} }
    }
    if (this.rot) this.rot.style.opacity = this.oRot.toFixed(4);

    // ── 视频 3：进入 final 时从头播一次，播完停在末帧 ──
    if (state !== this.state) {
      if (state === 'final' && this.fin) {
        try {
          this.fin.currentTime = 0;
          var pf = this.fin.play();
          if (pf && pf.catch) pf.catch(function () {});
        } catch (e) {}
      }
      if (this.state === 'final' && state !== 'final' && this.fin) {
        try { this.fin.pause(); this.fin.currentTime = 0; } catch (e) {}
      }
      if (state !== 'final') this.jumped = false;
      this.state = state;
      this.onState(state);
    }
    if (this.fin) {
      this.fin.style.opacity = this.oFin.toFixed(4);
      // 自愈：预热超时、滚出视口、浏览器策略都可能把定格视频暂停掉，
      // 只要还没播完就把它重新起播，保证 ended 能触发（跳转的前提）。
      if (state === 'final' && !this.fin.ended && this.fin.paused) {
        var nowMs = (window.performance && performance.now) ? performance.now() : Date.now();
        if (nowMs - (this.finRetryAt || 0) > 400) {
          this.finRetryAt = nowMs;
          try {
            var pr = this.fin.play();
            if (pr && pr.catch) pr.catch(function () {});
          } catch (e) {}
        }
      }
      if (this.fin.ended && C.holdFinalFrame) {
        // 保持末帧（浏览器默认就会停在末帧，这里只是确保不被拉回 0）
        try { if (this.fin.currentTime < 0.05) this.fin.currentTime = this.fin.duration - 0.05; } catch (e) {}
      }
      // 视频 3 播完 → 交叉淡化进作品区
      if (this.fin.ended && C.jumpToDeck && !this.jumped && state === 'final') {
        this.jumped = true;
        dbg('final video ended → 交叉淡化切到作品视图');
        this.enterSite();
      }
    }

    // ── 声音 ──────────────────────────────────────────
    if (this.loop) this.loop.applySound(this.soundOn && this.oIdle > 0.3 && state !== 'final');
    if (this.fin) this.fin.muted = !(this.soundOn && this.oFin > 0.3);
    if (this.rot) this.rot.muted = true;   // 逐帧 seek 态是暂停的，本来就没声音

    // ── 界面反馈 ──────────────────────────────────────
    if (this.phaseFill) this.phaseFill.style.height = (p * 100).toFixed(2) + '%';
    if (this.scrollCue) this.scrollCue.classList.toggle('is-gone', p > 0.012);
  };

  /* 末帧停一会儿，再交叉淡化进作品区。
     没有任何下滑位移：首页淡出、作品区同时淡入。 */
  HeroController.prototype.enterSite = function () {
    clearTimeout(this.jumpTimer);
    var self = this;
    var delay = C.jumpDelay == null ? 0 : C.jumpDelay;
    var go = function () {
      if (window.MSView && window.MSView.toSite) {
        window.MSView.toSite();
        return;
      }
      // 降级：没有视图控制器时，才用老式的滚动跳转
      var target = document.querySelector(C.jumpTarget || '#deck');
      if (!target) return;
      var rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.6) return;
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        window.scrollTo(0, rect.top + window.pageYOffset);
      }
    };
    // jumpDelay = 0 → 末帧不停留，放完立刻切
    if (delay <= 0) { go(); return; }
    this.jumpTimer = setTimeout(go, delay);
  };

  HeroController.prototype.onState = function (state) {
    dbg('state → ' + state + ' (p=' + this.p.toFixed(3) + ')');
    if (this.phaseMoon) this.phaseMoon.setAttribute('data-state', state);
    if (this.phaseCaption) {
      this.phaseCaption.textContent =
        state === 'idle' ? '待机' : state === 'rotating' ? '旋转' : '定格';
    }
    if (this.phaseEl) this.phaseEl.setAttribute('data-state', state);
    document.body.setAttribute('data-hero-state', state);
  };

  /* ── 启动 ───────────────────────────────────────────── */
  function boot() {
    var root = document.querySelector('.hero');
    if (!root) return;
    window.MSHero = new HeroController(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
