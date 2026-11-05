/* ═══════════════════════════════════════════════════════════════
   可调参数 —— 交互手感全部集中在这里
   改完刷新即可，不用动其它文件
   ═══════════════════════════════════════════════════════════════ */
window.MS_CONFIG = {
  hero: {
    /* ── 滚动灵敏度 ──────────────────────────────────────
       完整走完「旋转段」需要滚动的距离（px）。
       数值越大越沉、越慢；越小越跟手。
       移动端建议再乘 0.6 左右。 */
    scrollDistance: 1800,

    /* ── 惯性滑行（滚轮停下后视频继续走，然后慢慢减速）────
       wheelDirect：滚轮事件的即时响应比例（1 = 1:1，不迟滞）
       wheelGain  ：滚轮位移转成惯性速度的增益。
                    越大，停手后冲得越远。
       coastTau   ：惯性衰减的时间常数（秒）。
                    越大，停下来后滑得越久。
       maxVel     ：惯性速度上限，防止猛甩时飞出画面。 */
    wheelDirect: 1.0,
    wheelGain: 1.3,
    coastTau: 0.5,
    maxVel: 2600,

    /* ── 进度分段（0~1） ──────────────────────────────────
       enterPoint：滚动超过这个比例 → 离开待机，进旋转段
       finalPoint ：滚动超过这个比例 → 进最终定格段 */
    enterPoint: 0.04,
    finalPoint: 0.88,

    /* ── 缓动强度 ────────────────────────────────────────
       每帧向目标推进的比例。0.01 最飘，1 = 无缓动。
       0.08~0.18 手感最好。 */
    easing: 0.14,

    /* ── 过渡时长（ms） ───────────────────────────────────
       crossfadeMs：视频 1→2、2→3 之间的交叉淡化时长
       loopFadeMs  ：视频 1 循环接缝处的淡化时长 */
    crossfadeMs: 380,
    loopFadeMs: 420,

    /* ── 开关 ────────────────────────────────────────────
       seamlessLoop：用双图层交叉淡化消除视频 1 的循环跳帧。
       关掉 = 浏览器原生硬循环，每 6 秒会有一次可见跳变。 */
    seamlessLoop: true,

    /* ── 细节 ────────────────────────────────────────────
       seekThreshold：视频 2 的寻帧阈值（秒），太小会卡
       holdFinalFrame：视频 3 播完后停在末帧 */
    seekThreshold: 0.012,
    holdFinalFrame: true,

    /* ── 视频 3 播完 → 直接进作品区 ─────────────────────
       关掉就停在定格画面，让人自己往下滚。
       jumpDelay：末帧停留多久再切。0 = 放完立刻交叉淡化，不停留。 */
    jumpToDeck: true,
    jumpTarget: '#deck',
    jumpDelay: 0,              // 末帧停留多久再跳（毫秒）
    debug: false,            // 打开后在控制台打印状态机 / 跳转日志

    /* ── 窄屏时把风铃主体摆正 ───────────────────────────
       chimeCenterX：风铃主体在素材画面里的横向位置（0~1）。
       窄屏用 cover 裁切时，主体会被裁掉，按这个值重新对齐，
       保证主体尽量完整地留在画面里。 */
    chimeCenterX: 0.35,
    chimeWidth: 0.24,        // 窄屏时至少留出这么宽的画面比例给风铃

    /* 视频 2 结束前留一点点余量，避免 seek 到不存在的帧 */
    tailGuard: 0.04
  },

  deck: {
    /* 灯箱打开时暂停首页视频 */
    pauseHeroWhenOpen: true,
    /* 悬停时自动静音预览 */
    hoverPreview: true
  },

  /* ── 视图切换（首页 ⇄ 站点） ───────────────────────────────
     fadeMs：交叉淡化时长（ms）。首页淡出与站点淡入同时进行，
             没有任何位移滑动，所以时长就是「白屏感」的长度。 */
  view: {
    fadeMs: 900
  },

  /* ── 工作牌（React Bits Lanyard） ─────────────────────────
     移植自 reactbits.dev/components/lanyard，参数含义与原组件一致。
     改完刷新即可。想换照片就改 frontImage。 */
  lanyard: {
    enabled: true,

    frontImage: 'assets/lanyard/portrait.jpg',   // 正面照片
    backImage: 'assets/lanyard/mandala.jpg',      // 背面：银色曼陀罗（金属材质）
    frameImage: 'assets/lanyard/frame-moon.jpg',  // 正面金属雕花边框（近黑自动抠成透明）
    imageFit: 'cover',                          // cover | contain
    cardColor: '#1A1020',                       // 天鹅绒紫
    orientation: 'portrait',
    finish: 'matte',                            // glossy | matte | holographic | metallic
    metal: 'gold',                              // silver | gold | graphite
    cornerRadius: 0.12,
    size: 0.437,                               // 牌面在画面里的高度占比（桌面端等效旧版尺寸，牌面实际像素大小不变）
    widthFill: 0.36,                           // 牌面最多占画布宽度的比例（其余留给拖拽余量 = 活动范围）
    anchor: 'center',                           // left | center | right
    strapLength: 1.0,                           // 挂绳长度（越大牌垂得越低、可甩范围越大）
    strapColor: '#241631',                      // 织带颜色
    strapWidth: 0.42,                            // 挂绳粗细（参考图是细绳，太宽会压住右上角导航）
    gravity: 1,                                 // 越小程序越飘
    damping: 0.5,                               // 摆动停止的快慢
    elasticity: 0.5,                            // 绳子回弹
    breeze: 0.5,                                // 常驻微风（无操作时也在轻轻晃）
    interactive: true,                          // 可拖拽、可点击翻面
    intro: true,                                // 进入时甩入

    /* 金属雕花层（PBR）：metalness 1 + 低 roughness + 环境反射，
       卡牌翻转时反光会扫过雕花，就是「金属光泽」 */
    frameMetalness: 1,
    frameRoughness: 0.17,
    frameEnv: 2.6,
    frameClearcoat: 0.3,
    frameTint: 1.3,                            // 提亮金属反射率（细金线缩到牌面后会被采样平均掉）
    frameAnisotropy: 1,
    frameAlphaLow: 6,                           // 低于这个亮度抠成透明
    frameAlphaHigh: 22,                         // 高于这个亮度完全不透明
    backRoughness: 0.22,
    backEnv: 1.8,
    edgeRoughness: 0.28,                        // 卡边金属包边
    edgeEnv: 1.6,

    /* 牌面文字 */
    name: '牧舒',
    role: 'AIGC / 影像 / 视觉实验',

    /* 牌背文字（画在「压暗后的」背面图上）
       backDim = 整幅压暗浓度（0~1）。背面图是银色曼陀罗，
                 文字块现在占到牌面 ~80% 宽、跨 0.16H~0.72H，
                 压到 0.62 左右字才读得清，又不至于把花纹全糊掉。 */
    backDim: 0.62,
    backKicker: '动画 / 影像 / 互动',
    backTitle: '这是一个捕捉梦境的暗室。',
    backNote: '如果你也喜欢奇奇怪怪的浪漫，欢迎联系：',
    backEmail: 'Email: 1034136944',
    backFoot: 'Scroll to explore the illusions.'
  }
};
