/* ═══════════════════════════════════════════════════════════════
   作品数据
   与 vault 里的「作品集/作品条目/*.md」保持同步
   —— 改标题 / 简介 / 年份 / 详细文字，都改这里即可
   详细正文（detail）对应笔记正文里的「背景 / 做法 / 反思」三段
   ═══════════════════════════════════════════════════════════════ */
window.MS_WORKS = {
  meta: {
    owner: '牧舒',
    role: 'AIGC / 影像 / 视觉实验',
    site: '捕梦阁楼'
  },

  /* 牌阵分组 —— 对应 whimsigoth-portfolio.md §三 */
  groups: [
    { id: 'arcana',  name: '大阿尔卡纳',   en: 'MAJOR ARCANA',      tone: 'ink'      },
    { id: 'element', name: '元素魔法',     en: 'ELEMENTAL',         tone: 'amethyst' },
    { id: 'figure',  name: '人像星图',     en: 'PORTRAIT FIGURES',  tone: 'wine'     }
  ],

  works: [
    {
      no: 1,
      id: 'brush-evolution',
      title: '笔的三千年演化',
      titleEn: 'The Evolution of the Brush',
      type: '动画 / 知识短片',
      year: 2026,
      res: '1080×1920',
      orientation: '竖版',
      group: 'element',
      featured: true,
      video: 'videos/works/work-01-brush-evolution.mp4',
      cover: 'assets/covers/01-brush-evolution.jpg',
      blurb: '上一份幼师工作讲《毛笔发展史》时冒出的脑洞，被 AI 拍成了一支动画短片。',
      detail: {
        lead: '三千年的笔，不是一支笔，是三千次改写。',
        sections: [
          {
            h: '背景',
            p: [
              '上一份工作在幼儿园带班，给小朋友讲《毛笔发展史》。',
              '自己备课之后意识到，要想他们听得进去，做成动画会更吸引人。后来接触了 AI 工具，干脆把它做成了一支片。'
            ]
          },
          {
            h: '做法',
            ul: [
              '先整理一条年代轴：石头 → 骨 → 毛笔 → 硬笔',
              '每一段关键器物用 AI 生成画面，再靠剪辑把它们串成一条能一直看下去的线',
              '字幕尽量少，能用一个画面说清楚的事，就不用第二句话'
            ]
          },
          {
            h: '反思',
            p: [
              '做这支片子最大的收获不是画面，是发现「讲给孩子听」本身就是一种分镜：什么先说、什么只配一个画面、哪个词必须重复三遍。现在做别的片子，这套直觉还在用。',
              '也有遗憾——能力有限，AI 生成的器物形制并不严谨，真要当科普还差很远。它更像一段被记住的课堂，而不是一支考据片。'
            ]
          }
        ]
      }
    },
    {
      no: 2,
      id: 'fitness',
      title: '全民健身',
      titleEn: 'National Fitness',
      type: '宣传片 / 品牌项目',
      year: 2026,
      res: '3840×2160',
      orientation: '横版',
      group: 'figure',
      featured: true,
      video: 'videos/works/work-02-fitness.mp4',
      cover: 'assets/covers/02-fitness.jpg',
      blurb: '大学时画的分镜动画，被 AI 重做成三维动画——一支给全民健身的宣传片。',
      detail: {
        lead: '把念了很久的旧分镜，重新让它动起来。',
        sections: [
          {
            h: '背景',
            p: [
              '大学时画过一套分镜，讲的是「全民健身」：一个比较夸张的动画小故事，不仅人需要健身，猫也要，狗也要。那套分镜只是纸上的一格一格。',
              '后来把 AI 工具接进来，用三维动画的方式把它重做了一遍。大学时期的草稿，第一次有了呼吸。'
            ]
          },
          {
            h: '做法',
            ul: [
              '沿用大学时期的分镜节奏，重新拆成一个个可以单独生成的镜头',
              '用 AI 生成角色与场景，保留原稿里「公园里的普通人」那股松弛劲',
              '把原本静止的格子接成有呼吸的动画'
            ]
          },
          {
            h: '反思',
            p: [
              '脑子一热，就去做了，成果比想象中令人满意，但也有些瑕疵的地方怎么也修不好。',
              '回看大学分镜和现在的片子，惊讶的是节奏居然没怎么变——变的只是实现方式。以前要请人建模、绑定、渲染，现在几句话就能出一个镜头。',
              '代价也很明显：我比从前更依赖「第一稿」，少了那种一张一张画出来的踏实。所以这支片我更愿意当成一次自我对照——看看同一个脑子，隔了几年会交出什么东西。'
            ]
          }
        ]
      }
    },
    {
      no: 3,
      id: 'landscape-game',
      title: '江山多胜游',
      titleEn: 'The Journey',
      type: '影像 / 国风短片',
      year: 2026,
      res: '2160×3840',
      orientation: '竖版',
      group: 'arcana',
      featured: true,
      video: 'videos/works/work-03-landscape-game.mp4',
      cover: 'assets/covers/03-landscape-game.jpg',
      blurb: '母亲家乡宜春的文旅浓缩，一条水墨短片，十二秒。',
      detail: {
        lead: '莫以宜春远，江山多胜游。',
        sections: [
          {
            h: '背景',
            p: [
              '视频灵感是刷短视频的时候有的，那个时候看到别人做的，就不禁在想，不如做一个宜春的吧。',
              '我外婆家在宜春，几乎每年都会回去，那里的名胜古迹基本逛了个遍，还留下了许多生活的痕迹与回忆。',
              '宜春有「明月」，有「温泉」，也有被写成「江山多胜游」的那股山水气。这支片是写给那座小城的一封十二秒的信。'
            ]
          },
          {
            h: '做法',
            ul: [
              '先用大语言模型整理出提示词，再投入画布中制作',
              '一开始只想做前半段，后面的明月山和转场是一时兴起',
              '很喜欢最后它自创的诗句：月照千峰翠，风来万壑凉'
            ]
          },
          {
            h: '反思',
            p: [
              '十二秒太短了，短到装不下任何叙事，却刚好装得下一个「想家」。',
              '这支片让我意识到，做家乡的题材时，最难的不是技法，是取舍——你必须承认你带不走全部。',
              '本来还想做一个无人机航拍的感觉出来，不知道是自己笔力欠缺还是平台模型注水，仍需磋磨。'
            ]
          }
        ]
      }
    },
    {
      no: 4,
      id: 'luxury-bag',
      title: '冷感高奢手提包',
      titleEn: 'Cold Luxury',
      type: '广告片 / 产品片',
      year: 2026,
      res: '1440×2560',
      orientation: '竖版',
      group: 'element',
      featured: false,
      video: 'videos/works/work-04-luxury-bag.mp4',
      cover: 'assets/covers/04-luxury-bag.jpg',
      blurb: '为一只有冷感高奢手提包做的质感向产品影像，纯练手。',
      detail: {
        lead: 'FORM IS FEELING',
        sections: [
          {
            h: '背景',
            p: [
              '看到一款极简的金属感包型：受扎哈·哈迪德启发的抽象流动曲线标志，由纤细的银色线条构成——单波浪折叠。',
              '手痒，就想试试 AI 能不能拍出那种冷峻又有线条流动感的那种感觉。',
              '没有客户，也没有交付，纯粹是兴趣驱动的一次产品影像练习。'
            ]
          },
          {
            h: '做法',
            ul: [
              '上传的两张参考图，重建成白底产品、模特、手持近景、水泥场景一套互相锁定的参考资产',
              '出视频前先做一张 3×3 故事板，把 15 秒切成六段并锁死镜头顺序与构图',
              '用一个完整 15 秒视频节点（9:16 / 720P）承载全部 timing、五张参考图与内置 BGM，最后设定一个 logo 和宣传语'
            ]
          },
          {
            h: '反思',
            p: [
              '故事板先行改变了两件事：一是节奏从「感觉酷」变成可指认的六段（Hook → Impact → Chaotic → Controlled → Energy return → Brand attitude）；二是问题被提前到零成本阶段——构图不对在图上就能否掉，不必等几十秒的视频生成完才发现。',
              '收尾物料要单独做：logo、退场动画、标语是另一套资产，不能指望正片顺带产出；退场的节奏（描绘入场 → 字母淡入 → 定格）也得单独设计。'
            ]
          }
        ]
      }
    },
    {
      no: 5,
      id: 'cel-character',
      title: '赛璐珞角色',
      titleEn: 'Cel Character',
      type: '动画 / 角色设计',
      year: 2026,
      res: '2560×1440',
      orientation: '横版',
      group: 'element',
      featured: false,
      video: 'videos/works/work-05-cel-character.mp4',
      cover: 'assets/covers/05-cel-character.jpg',
      blurb: '用新上的MAX H3 做赛璐珞质感角色的一次设定与动作演示，AI 全流程练习。',
      detail: {
        lead: '这个模型很适合这个风格。',
        sections: [
          {
            h: '背景',
            p: [
              '在网上看到了 MAX H3 的演示，产生了这个 idea。',
              '参考别人的提示词，自己设计了三个角色，用 AI 做了一版设定和动作演示。'
            ]
          },
          {
            h: '做法',
            ul: [
              '以一张角色图为原点，锁定同一套「日系赛璐珞 + Y2K 潮流」提示词框架，只替换色彩系统（玫红 / 荧光青绿 / 深红黑三档明度），批量衍生出三个画风统一、配色辨识度截然不同的赛璐珞角色。',
              '准备两套结构完全不同的 PV 提示词模板——「NOISE 高频转场轰炸」与「FILE 档案解锁五段式」——再让它们交叉适配三个角色，用「换角色描述 + 换配色 + 换符号元素」的方式低成本生成 6 支 15s 角色 PV。',
              '为三支角色 PV 补上三角色同框的 5s 片头（三色光线同时劈入）与 5s 片尾（三色依次点亮收束），把独立短片拼装成一部有开场、有收尾、首尾呼应的完整合集 PV。'
            ]
          },
          {
            h: '反思',
            p: [
              'AI 生产内容的瓶颈从来不是「生成能力」，而是「结构化能力」。把需求拆成【固定层 + 可替换插槽】之后，边际成本几乎归零。这是我这次最大的收获——AI 时代的内容生产力，本质是提示词的工程化管理。',
              'AI 很擅长「执行你的描述」，但不擅长发现你描述里的漏洞。所有跨版本迁移时容易失真的细节（闪帧色、留白策略、背景明度），都得靠人肉审查。这恰恰是传统影视里「导演」的职责——AI 是极强的执行团队，但需要一个不犯错的头脑。',
              '提示词越来越长，但不一定越来越好。真正的优化方向应该是把框架收敛成更精炼的模块化结构（角色卡 / 色彩卡 / 节奏卡 / 禁令卡），而不是一条长文本无限膨胀。提示词也需要重构，也需要 DRY 原则。'
            ]
          }
        ]
      }
    },
    {
      no: 6,
      id: 'fashion-portrait',
      title: '时尚人像',
      titleEn: 'Fashion Portrait',
      type: '摄影 / 人像',
      year: 2026,
      res: '1080×1920',
      orientation: '竖版',
      group: 'figure',
      featured: false,
      video: 'videos/works/work-06-fashion-portrait.mp4',
      cover: 'assets/covers/06-fashion-portrait.jpg',
      blurb: '一组 AI 生成的高级感人像实验，练习光与情绪。',
      detail: {
        lead: '让人记住的不是衣服，是那一刻的表情。',
        sections: [
          {
            h: '背景',
            p: [
              '一直想拍一组「关于姿态而不是关于脸」的人像，但手边没有模特、没有影棚、没有灯。',
              '于是干脆全交给 AI，做一组时尚杂志感的实验。'
            ]
          },
          {
            h: '做法',
            ul: [
              '先定锚点：以人脸参考生成角色面部锚点，再配齐 Vogue 风格板',
              '拆分镜与动态：按脚本出关键帧（暗调侧脸 → 暖光正脸特写 → 黑白 T 台行走／剥影），据此生成三段各 5 秒的镜头（局部特写切换、推进特写、节奏蒙太奇收束），并单独生成 10.5 秒暗调卡点供剪辑对齐。',
              '合成成片：把三段镜头与 BGM 按节奏拼成 20.65 秒的成片，结构为「局部特写铺垫 → 情绪正脸高点 → 黑白行走与落版收尾」，全片保持冷调高反差、以眼神与轮廓而非叙事驱动的时尚大片观感'
            ]
          },
          {
            h: '反思',
            p: [
              '一致性问题的解法不在视频模型，而在上游——把脸和调性各做成一张可复用的锚点图，比在每条 prompt 里反复描述外形可靠得多。',
              '作为「情绪参考」，它给了我很多原来想不到的 pose 和光位，这部分值得留着。'
            ]
          }
        ]
      }
    },
    {
      no: 7,
      id: 'daily-life',
      title: '日常一天',
      titleEn: 'A Day',
      type: '影像记录 / Vlog',
      year: 2026,
      res: '1920×1080',
      orientation: '横版',
      group: 'arcana',
      featured: false,
      video: 'videos/works/work-07-daily-life.mp4',
      cover: 'assets/covers/07-daily-life.jpg',
      blurb: '完全用 AI 动画拍的一天：早餐、桌面、树影、深夜的灯。',
      detail: {
        lead: '用来考证的作品，只花了两个小时制作。',
        sections: [
          {
            h: '背景',
            p: [
              '想试试完全用 AI 做一支「生活流」的短片：起床、刷牙、早餐、上班、回家——一天就这么过去。',
              '没有事件，没有转折，只有光在变。'
            ]
          },
          {
            h: '做法',
            ul: [
              '按真实时间线排镜头，早晨偏冷、正午偏亮、夜晚压暗',
              '用同一套固定角色（粉发）串起所有场景',
              '结尾留一段夜晚的城市空镜，只剩感觉'
            ]
          },
          {
            h: '反思',
            p: [
              '当时时间紧任务重，选择了生成比较快且便宜的 seedance 2.0 mini。',
              '在后续中我发现，2.0 mini 比很多贵的模型更遵从文字交代的景别变化，表现力欠缺，但胜在规矩且听话。',
              '至今仍是我的心头好。'
            ]
          }
        ]
      }
    },
    {
      no: 8,
      id: 'mv',
      title: '粘稠梦游 · MV片段',
      titleEn: 'Sticky Daydream',
      type: 'MV / 剪辑片段',
      year: 2026,
      res: '1920×1080',
      orientation: '横版',
      group: 'arcana',
      featured: false,
      video: 'videos/works/work-08-mv.mp4',
      cover: 'assets/covers/08-mv.jpg',
      blurb: '《粘稠梦游》——AI 写的歌配上 AI 画的画面，一次从音乐到画面的尝试。',
      detail: {
        lead: '和我想象中的风格截然不同，但做出了意想不到的感觉来。',
        sections: [
          {
            h: '背景',
            p: [
              '《粘稠梦游》这首歌本身是 AI 生成的。有了曲子，就想试试「从音乐到画面」这一整条路——让画面跟着声音走，而不是先有画面再配乐。',
              '这几段是节奏的试片，还没定稿。'
            ]
          },
          {
            h: '做法',
            ul: [
              '先分析歌词结构与情绪节拍，再确立主角（红斗篷少女）、场景（糖果森林）、风格（pastel 荒诞童话）三个全局锚点，为全片一致性打底',
              '按歌曲段落（Intro / Verse / Chorus / Bridge / Outro）把 230s 音轨切成三批共 15 个分镜，每个分镜引用锚点生成、时长对齐乐句，逐批落账本再推进',
              '切点全部踩在鼓点上，允许偶尔切碎'
            ]
          },
          {
            h: '反思',
            p: [
              '先有音乐再画，和先画再配乐，逻辑完全不同：前者是让画面去解释声音，后者是让声音去解释画面。',
              '我更喜欢前者，虽然更难——因为每一个画面都得先「听懂」那半拍。',
              '这也是这支片目前还没定稿的原因：能听懂的画面，比好看的画面少得多。',
              '最大的教训：分镜时长没有对齐音轨时间戳。'
            ]
          }
        ]
      }
    },
    {
      no: 9,
      id: 'practice',
      title: '练习合集',
      titleEn: 'Practice',
      type: '练习 / 过程记录',
      year: 2026,
      res: '1080×1920',
      orientation: '竖版',
      group: 'element',
      featured: false,
      video: 'videos/works/work-09-practice.mp4',
      cover: 'assets/covers/09-practice.jpg',
      blurb: '练手用的 AI 片段合集，不算作品，是过程。',
      detail: {
        lead: '练完再看，才知道自己走了多远。',
        sections: [
          {
            h: '背景',
            p: [
              '玩 AI 工具那段时间攒下来的片段合集。',
              '有人物、有光影、有情绪实验——不成篇、不交付，就是把每次生成的「那一下」留下来。'
            ]
          },
          {
            h: '做法',
            ul: [
              '不加任何包装，原样输出',
              '参考了很多网上看到的提示词',
              '偶尔会在同一支里看到明显失控的地方，也留着'
            ]
          },
          {
            h: '反思',
            p: [
              '这些片段的价值不在成片，在于提醒我一件事：真正让我进步的，不是哪一支「做完了」的片子，而是那些当时觉得「还差点」的失败。',
              '留着它们，比留着成品有用。'
            ]
          }
        ]
      }
    },

    /* ── 互动：点开是一个真的能玩的小网页 ────────────────
       这两件都没有视频，也没有「背景 / 做法 / 反思」那套档案 ——
       互动作品在网页上只展示作品本身，详细的文字留在 Obsidian 里。 */
    {
      no: 10,
      id: 'companion-work',
      title: '陪伴式工作',
      titleEn: 'Companion at Work',
      type: '互动 / 网页小玩意',
      year: 2026,
      res: '响应式网页',
      orientation: '竖版',
      group: 'arcana',
      featured: false,
      video: '',
      cover: 'assets/deck/yesterday-death.webp',
      blurb: '一个坐在旁边陪你工作的幻影 —— 你做你的事，它说它的话。',
      interactive: {
        html: 'assets/deck/companion-work.html',
        cover: 'assets/deck/yesterday-death.webp',
        credit: '角色来源：昨日死'
      }
    },

    {
      no: 11,
      id: 'find-things',
      title: '找东西',
      titleEn: 'Find It',
      type: '互动 / 网页小玩意',
      year: 2026,
      res: '响应式网页',
      orientation: '竖版',
      group: 'arcana',
      featured: false,
      video: '',
      cover: 'assets/deck/wanwan.webp',
      blurb: '你又乱丢东西了？没关系，有人替你找 —— 顺便报个数。',
      interactive: {
        html: 'assets/deck/find-things.html',
        cover: 'assets/deck/wanwan.webp',
        credit: '角色来源：熬肉'
      }
    }
  ]
};
