# 牧舒的捕梦阁楼 — 站点框架

个人作品集网站的可运行骨架。当前已完成**框架、首页三段视频交互、右侧 3D 工作牌
（含金属雕花边框 / 银色曼陀罗背面）**、**占卜桌布作品区背景**、**首页 ⇄ 站点
交叉淡化不可逆切换**、**灯箱作品档案面板**、**九张新封面套塔罗金框**、
**滚动惯性（停手后视频平滑减速）**、**工作牌边界约束（拖到哪都完整显示）**、
**单栏分节的关于我 / 联系方式 + 抖音二维码**。

> **站名**：牧舒的捕梦阁楼　|　首页标题：幻象陈列室 / The Illusion Cabinet

---

## 〇、想改前端上的文字？改这两个地方就够了

| 想改什么                                | 改哪个文件                   | 具体位置                                                         |
| ----------------------------------- | ----------------------- | ------------------------------------------------------------ |
| 九件作品的**标题 / 年份 / 类型 / 分辨率 / 一句话简介** | `assets/js/works.js`    | 每件作品对象里的 `title` `year` `type` `res` `blurb`                 |
| 九件作品的**详细正文**（背景 / 做法 / 反思）         | `assets/js/works.js`    | 每件作品对象里的 `detail: { lead, sections: [...] }`                 |
| **关于我**整页（简历、经历、信条、证书）              | `index.html`            | `<section class="page" id="about">` 里的 `.doc`（单栏分节）              |
| **联系方式**整页                          | `index.html`            | `<section class="page page--contact" id="contact">` 里的 `.page__cols`（紧凑三栏） |
| 首页**标题 / 副标题 / 引言**                 | `index.html`            | `.hero__lede` 里的 `kicker` / `h1.hero__title` / `p.hero__sub` |
| 导航**栏目名**                           | `index.html`            | `<nav class="masthead__nav">` 里的四个 `<a>`（文字包在 `.masthead__label` 里） |
| 导航**字体 / 间距 / 小符号**                | `assets/css/hero.css`   | `.masthead__nav`；字体栈在 `tokens.css` 的 `--font-nav`                |
| 工作牌上的**名字 / 身份 / 卡背文案**            | `assets/js/config.js`   | `lanyard` 段的 `name` / `role` / `backKicker`~`backFoot` / `backDim` |
| 页面**配色 / 字体 / 节奏**                  | `assets/css/tokens.css` | 全部设计令牌                                                       |
| 交互**手感**（滚动灵敏度、淡化时长、工作牌大小…）         | `assets/js/config.js`   | 见第三节参数表                                                      |

> **和 vault 的关系**：站点**不会**自动读 Obsidian 笔记。
> `作品集/作品条目/*.md` 改完之后，要手动把内容同步到 `assets/js/works.js`
> （作品）和 `index.html`（关于 / 联系）。同步完跑一次
> `http://localhost:8788/_dev/content-test.html` 就能核对年份和档案正文对不对。

---

## 一、怎么预览

**最简单**：直接双击 `index.html`（`file://` 已实测可用，视频能播、交互正常）。
⚠️ 例外：**右侧 3D 工作牌在 `file://` 下会退回静态版**（浏览器的跨源限制，详见第五节），
想看 3D 版请用下面的本地服务器。

**推荐（给部署用）**：起一个本地静态服务器。

```powershell
# 在本目录跑 _dev\serve.ps1，支持 Range 请求（视频拖动/寻帧必需）
powershell -ExecutionPolicy Bypass -File .\_dev\serve.ps1
# 然后打开 http://localhost:8788/
# 端口被占用时可以换：powershell -ExecutionPolicy Bypass -File .\_dev\serve.ps1 8791
```

---

## 二、目录结构

```
风铃作品集/
├─ index.html              页面骨架（首页 / 作品区 / 关于 / 联系 / 灯箱）
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css        ← 所有颜色 / 字体 / 节奏令牌，改风格只动这个
│  │  ├─ base.css          重置 + 版式 + 关于/联系段落
│  │  ├─ lanyard.css       工作牌组件样式（画布铺满挂点）
│  │  ├─ hero.css          首页（视频层、站名、工作牌、月相进度条、声音开关）
│  │  └─ deck.css          作品区（塔罗牌阵骨架 + 灯箱）
│  ├─ js/
│  │  ├─ config.js         ← 可调参数：滚动灵敏度 / 缓动强度 / 过渡时长 / 工作牌 / 视图淡化
│  │  ├─ works.js          九件作品的数据（与 vault 笔记同步，含详细正文 detail）
│  │  ├─ views.js          首页 ⇄ 站点的视图切换（交叉淡化 + 不可逆导航）
│  │  ├─ hero.js           首页三态控制器（核心）
│  │  ├─ lanyard.js        工作牌 3D（React Bits Lanyard 移植，见第五节）
│  │  ├─ deck.js           牌阵渲染 + 悬停预览 + 灯箱（含作品档案面板）
│  │  └─ main.js           导航高亮 / 跨视图锚点 / 灯箱联动 / 工作牌启动
│  ├─ covers/              9 张封面（ASCII 命名，部署安全）
│  ├─ contact/
│  │  └─ douyin-qr.jpg       抖音二维码（844×844，从保存码截图里自动裁出）
│  ├─ deck/
│  │  ├─ tablecloth-v3.jpg   占卜桌布「白金紫」（1280×720）→ 三页固定背景（见 base.css .siteview__cloth）
│  │  └─ tablecloth.jpg      旧的无缝平铺桌布（已停用，原样保留便于回退）
│  ├─ lanyard/
│  │  ├─ portrait.jpg         工作牌正面照片（876×1170）
│  │  ├─ frame-moon.jpg       正面金属雕花边框（1440×1920，近黑自动抠成透明）
│  │  ├─ frame-sunmoon.jpg    备用边框（换一张只要改 config 的 frameImage）
│  │  └─ mandala.jpg          背面银色曼陀罗（1440×1920）
│  └─ vendor/three.min.js  three.js r160 UMD（本地内置，离线可用）
├─ videos/
│  ├─ hero/                首页三段（1080p，网页版）
│  │  ├─ 01-idle.mp4          风铃轻摇（自动循环）
│  │  ├─ 02-rotating.mp4      风铃旋转（滚动驱动）
│  │  └─ 03-final.mp4         推近特写（定格，播完自动交叉淡化进作品区）
│  └─ works/               九件作品的 720p 网页版
│     ├─ work-01-brush-evolution.mp4
│     ├─ work-02-fitness.mp4
│     └─ ... (work-09-practice.mp4)
└─ _dev/                   只在本地用，不参与部署
   ├─ serve.ps1              本地静态服务器（支持 Range，视频寻帧必需；可传端口参数）
   ├─ jump-test.html         自测台：视频3 播完是否自动跳作品区 + 窄屏风铃对齐
   ├─ jump-delay-test.html   自测台：视频3 ended → 切站的真实耗时（末帧停留）
   ├─ lanyard-test.html      自测台：工作牌卡面几何（三种视口）+ 翻面
   ├─ lanyard-harness.html   自测台：**工作牌边界约束**（独立页面，8 个方向拖到极限，看 NDC 包围盒）
   ├─ hero-scroll-test.html  自测台：**视频二滚动惯性**（打一个滚轮事件，采样进度曲线）
   ├─ view-test.html         自测台：交叉淡化 / 不可逆导航 / 锚点 / 导航高亮
   ├─ content-test.html      自测台：年份、作品档案、关于我、联系方式核对
   ├─ lightbox-test.html     自测台：开灯箱看双栏（?n=3 选第几件）
   ├─ make-qr.ps1            工具：从抖音「保存二维码」截图里自动裁出圆形码
   └─ covers/                封面合成工具（make-covers.ps1 + CoverMaker.cs）
```

> 用的是**经典 script + 全局命名空间**（`window.MS_CONFIG` / `window.MS_WORKS` / `window.MSHero`），
> 不是 ES modules —— 这样 `file://` 直接双击能开，别的模型接手也不用先配构建工具。
> 控制器逻辑本身是独立的，后面要迁到 React / Three.js 很容易。

---

## 三、可调参数（都在 `assets/js/config.js`）

| 参数 | 默认 | 说明 |
|---|---|---|
| `scrollDistance` | `1800` | **滚动灵敏度**。完整走完旋转段要滚多少 px。越大越沉，越小越跟手 |
| `wheelDirect` | `1.0` | 滚轮事件的**即时响应比例**。1 = 1:1，不迟滞 |
| `wheelGain` | `1.3` | 滚轮位移 → 惯性速度的**增益**。越大，停手后冲得越远 |
| `coastTau` | `0.5` | 惯性衰减的**时间常数（秒）**。越大，停下来后滑得越久 |
| `maxVel` | `2600` | 惯性速度上限（px/s），防止猛甩时飞出画面 |
| `easing` | `0.14` | **缓动强度**。每帧向目标推进的比例。0.01 最飘，1 = 无缓动 |
| `crossfadeMs` | `380` | **段间过渡时长**（视频 1→2、2→3 的交叉淡化） |
| `loopFadeMs` | `420` | 视频 1 循环接缝处的淡化时长 |
| `seamlessLoop` | `true` | 双图层交叉淡化消除循环跳帧。关掉 = 硬循环，每 6 秒一次可见跳变 |
| `enterPoint` | `0.04` | 滚动进度超过这个比例就离开待机、进旋转段 |
| `finalPoint` | `0.88` | 滚动进度超过这个比例就进定格段 |
| `seekThreshold` | `0.012` | 视频 2 的寻帧阈值（秒），太小会卡 |
| `tailGuard` | `0.04` | 视频 2 结束前留的余量，避免 seek 到不存在的帧 |
| `jumpToDeck` | `true` | **视频 3 播完后自动进作品区**。关掉就停在定格画面让人自己滚 |
| `jumpTarget` | `#deck` | 跳到哪里（选择器） |
| `jumpDelay` | `0` | 末帧停留多久再切（毫秒）。**0 = 放完立刻交叉淡化，不停留** |
| `chimeCenterX` | `0.35` | **风铃主体在素材画面里的横向位置**（0~1）。窄屏靠它把主体摆正 |
| `chimeWidth` | `0.24` | 窄屏时至少留出这么宽的画面比例给风铃 |
| `sourceRatio` | `16/9` | 素材画面比例（算 cover 裁切用，一般不用改） |
| `debug` | `false` | 打开后在控制台打印状态机与跳转日志 |

> **滚轮停下后为什么还能继续滑**：`wheelGain / coastTau / maxVel` 三个参数控制的是
> 「惯性速度」，视频位置由速度**积分**得出（见第四节「滚动模型」），
> 所以停手后视频会按指数曲线继续走一小段再慢慢停下 —— 不会出现硬停顿，也不会跳帧。

**视图切换段**

| 参数 | 默认 | 说明 |
|---|---|---|
| `view.fadeMs` | `900` | **首页 ⇄ 站点交叉淡化的时长**（毫秒）。首页淡出与站点淡入同时进行，没有任何位移滑动 |

改完刷新即可，不用动其它文件。

---

## 四、三段视频的实现要点

### 素材实测（三支原片）

| | 编码 | 分辨率 | 帧率 | 时长 | 码率 | 音频 |
|---|---|---|---|---|---|---|
| 分镜1 idle | h264 yuv420p | 1920×1080 | 30fps | 6.000s | 29.1 Mbps | aac 2ch 44.1k |
| 分镜2 rotating | h264 | 1920×1080 | 30fps | 3.367s | 8.84 Mbps | aac 2ch 44.1k |
| 分镜3 final | h264 | 1920×1080 | **24fps** | 5.042s | 10.38 Mbps | aac 2ch **32k** |

三支都是 16:9、构图与机位一致。

> ⚠️ **分镜 3 已经换掉了**（本轮第十四节）：现在站内那份是
> `C:\Users\dell\Pictures\ai\午夜风铃\高清（1080P）.mp4` 的 H.264 转码版，
> 参数与原站那份完全对齐（1920×1080 / 24fps / 5.042s），文件名没变，所以**代码一行都没改**。

### 首尾帧差异（实测结论）

- **idle 首 vs 尾**：SSIM 0.853 / PSNR 23.1 dB —— **中等差异**（风铃轻摆，位置有偏移，不是无缝）。
  → 用**双图层交叉淡化**做循环接缝：同一支片挂两个 `<video>`，尾帧 0.42s 与首帧叠化，交接时零跳变。
- **idle → rotating**：同一场景，**中央水晶由透明转为发光紫**，风铃摆位有微差。
  → 靠**图层透明度交叉淡化**（`crossfadeMs`）衔接，差异被化开。
- **rotating → final**：同一场景，**水晶由紫转回透明**，且分镜3 是**广角推近到特写**。
  → 同样是交叉淡化 + 分镜3 从首帧播一次、播完停在末帧。

机位一致，没有大跳变，所以**没有加任何复杂特效**——只用了预加载 + 透明度交叉淡化。

### 滚动模型：虚拟滚动（不是原生滚动）

首页视图里**页面本身是锁住的**（`html.is-view-hero { overflow: hidden }`），
所以不能再用「原生滚动 + sticky」—— 页面不滚，sticky 也没意义。
现在改成**虚拟滚动**：

```
html.is-view-hero  →  overflow:hidden      ← 锁住页面
wheel 事件         →  preventDefault()      ← 拦下滚轮
                    →  hero.virtual += Δ    ← 累加到虚拟滚动量
                    →  hero.vel     += Δ×wheelGain  ← 同时攒一个惯性速度
hero.virtual       →  p = virtual / scrollDistance   （0~1 连续值）
p                  →  requestAnimationFrame 插值（easing）
p                  →  视频 2 的 currentTime
```

**惯性（停手后平滑减速）**——位置是速度**积分**出来的，不是「滚一次跳一格」：

```
每帧：virtual += vel × dt          ← 位移由速度积分，连续、不跳帧
      vel    *= exp(-dt / coastTau) ← 指数衰减 → 停手后越滑越慢
      |vel| < 1 时归零              ← 完全停稳
```

- 同向滚动速度叠加，反向滚动直接替换速度（来回抖不会攒出诡异速度）
- 撞到行程边界（0 或 `scrollDistance`）时速度直接归零，不会一直顶着
- 触屏用 `touchmove`（同样是 `preventDefault` + 累加），键盘用 ↑↓ / PageUp / PageDown / Space / End / Home
- **按滚轮次数跳帧是刻意避开的** —— 进度是连续值，和滚了多少次无关
- 进入站点视图后 `html.is-view-site`，滚轮不再被拦，浏览器恢复正常滚动

> 实测（`_dev/hero-scroll-test.html`，打一个 `deltaY=240` 的滚轮后每 50ms 采样）：
> 100ms 内冲到 **14.3%**，随后按指数曲线滑到 **36.9%**，**4.9 秒时完全停稳**，
> 全程曲线连续、无跳帧。灵敏度是改之前的 **2～3.7 倍**。

### 三个视频层永远在 DOM 里

视频 1/2/3（视频 1 因无缝循环是两个元素）全部常驻，只切 `opacity`，
**从不卸载再加载**，所以切换时不会出现黑屏 / 白闪 / 页面跳动。

### 视频 3 播完 → 交叉淡化进站点视图

定格段里视频 3 从首帧播一次，播完停在末帧；随即调用
`MSView.toSite()`：**首页淡出、作品区同时淡入，没有任何下滑位移**。

> `jumpDelay` = **0**，也就是**末帧不停留**，视频 3 一结束就切。
> `hero.js` 的 `enterSite()` 里 `delay <= 0` 时直接调 `MSView.toSite()`，不走 `setTimeout`。
> 实测（`_dev/jump-delay-test.html`）：`ended` → 切站 = **56.2 ms**（只剩帧粒度）；
> 旧配置 420ms 时这个数会在 420~470ms 附近。

> ⚠️ 这里踩过一个坑：定格视频可能被别处的 `pause()` 停掉
> （预热超时、`IntersectionObserver` 滚出视口），一停 `ended` 永远不触发，跳转就失效。
> 现在有三层保险：`resumeAll()` 会重新起播定格视频、预热超时不再停正在播的那一段、
> 渲染循环每帧自愈「没播完却暂停了」的状态。

### 不可逆导航

进入站点视图后，首页整层 `visibility: hidden`，
**滚轮上滑也回不到首页** —— 这是刻意设计的。
想回首页只能主动点导航栏的「首页」，那是一次明确的交叉淡化切换，
并且首页视频会从头再播一遍。

### 声音

默认静音，交给右下角「开启声音」按钮（浏览器策略要求用户手势才能出声）。
旋转段是逐帧 `currentTime` 驱动的，视频处于暂停态，因此**这一段本来就没有声音**——
风铃转起来的时候是安静的。待机段和定格段有声音。

---

## 五、右侧工作牌（React Bits Lanyard）

首页右侧的工作牌是**真 3D**，不是贴图：织带 + 金属扣 + 卡牌是一套完整的 Verlet 物理，
挂绳会随风摆动，鼠标按住牌面可以拖着甩，**点一下会翻面**（正面照片 ⇄ 塔罗牌背）。

### 来源与移植

移植自 <https://reactbits.dev/components/lanyard> 的 `<Lanyard />` 组件（React + Three.js）。
**物理、几何、材质、全息箔 shader 全部照搬原组件**，只改了四处：

| # | 改动 | 原因 |
|---|---|---|
| 1 | React hooks → 普通函数 | 本项目不用构建工具，见 `lanyard.js` 顶部的用法说明 |
| 2 | 牌面画法换成自定义的「塔罗牌背」构图 | `paintBadgeFront` / `paintBadgeBack` |
| 3 | `NeutralToneMapping` 降级为 `ACESFilmicToneMapping` | three r160 没有前者（r162+ 才有） |
| 4 | three.js 本地内置（r160 UMD） | 保证离线可用、且 `file://` 下也能加载 |

接口：

```js
MSLanyard.create(container, options)  // -> { apply, set, destroy, settings }
```

### 牌面

- **正面**：照片（`assets/lanyard/portrait.jpg`）只画在边框中间的镂空窗口里，
  底部渐隐 + 暗金细线 + ☾ 月相徽记 + 姓名 + 身份
- **正面边框**：`assets/lanyard/frame-moon.jpg`（金色雕花框）。
  这张图原是「黑底 + 金线」，代码会**按亮度把近黑抠成透明**，
  只留金属雕花纹样浮在天鹅绒紫底上；镂空窗口是**浏览器端自动探测**的
  （`detectWindow()`），换边框图不用改代码。
- **背面**：`assets/lanyard/mandala.jpg`（银色曼陀罗），整幅铺上牌面并按**金属材质**渲染
  ——中间是月相徽记，四周是银色星象 / 藤蔓 / 星符刻纹
- **包边**：牌体四周一圈金属包边（`edgeMaterial`），和正面雕花框连成一体
- **织带**：天鹅绒紫，两侧各一道暗金细线

### 金属雕花边框（PBR）

用户给的 PBR 提示已全部落地：

| 位置 | 参数 | 值 |
|---|---|---|
| 雕花层 `frameMaterial` | `metalness` / `roughness` | `1` / `0.17` |
| | `envMapIntensity` / `clearcoat` | `2.6` / `0.3` |
| | `frameTint` / `frameAnisotropy` | `1.3` / `1` |
| 背面 `backMaterial` | `metalness` / `roughness` | `1` / `0.22` |
| 包边 `edgeMaterial` | `roughness` / `envMapIntensity` | `0.28` / `1.6` |

环境反射不是靠 HDR 贴图，而是**程序化搭的环境**（`buildEnvironment()`）：
一块暖光（烛火色 3.4/2.0/0.9）+ 一块冷光（月华色 1.2/1.7/3.6）两块面光，
再撒 26 颗随机星点高光 → 翻转时反光会扫过雕花，是流动的光而不是死板的贴图。

### 可调参数（`config.js` 的 `lanyard` 段）

| 参数 | 默认 | 说明 |
|---|---|---|
| `frontImage` | `assets/lanyard/portrait.jpg` | 正面照片。换成自己的图只要改这一行 |
| `backImage` | `assets/lanyard/mandala.jpg` | 背面图。给了图就整幅铺上并按金属渲染；不给则退回程序化塔罗牌背 |
| `frameImage` | `assets/lanyard/frame-moon.jpg` | 正面金属雕花边框。近黑自动抠透明，镂空窗口自动探测 |
| `cardColor` | `#1A1020` | 牌面底色（天鹅绒紫） |
| `finish` | `matte` | `matte` / `glossy` / `holographic`（全息箔）/ `metallic` |
| `metal` | `gold` | 金属扣颜色：`gold` / `silver` / `graphite` |
| `size` | `0.437` | 牌面在画面里的**高度占比**。它决定牌面在屏幕上的实际像素大小（桌面端约 197×275 CSS px） |
| `widthFill` | `0.36` | 牌面最多占**画布宽度**的比例。剩下的 64% 全是**拖拽余量** —— 这才是「活动范围」 |
| `anchor` | `center` | 挂绳的锚点位置：`left` / `center` / `right`。`center` 才能左右对称地拖 |
| `strapLength` | `1.0` | 挂绳长度。越大牌垂得越低、可甩范围越大（**1.0 = 垂到最低**） |
| `strapWidth` | `0.42` | 挂绳粗细。**别调太宽**，粗绳会横穿右上角导航文字 |
| `strapColor` | `#241631` | 织带颜色 |
| `frameMetalness` / `frameRoughness` | `1` / `0.17` | 雕花层的金属度 / 粗糙度 |
| `frameEnv` / `frameClearcoat` | `2.6` / `0.3` | 雕花层环境反射强度 / 清漆层 |
| `frameTint` | `1.3` | 雕花层提亮（细金线缩到牌面后会被采样平均掉） |
| `frameAlphaLow` / `frameAlphaHigh` | `6` / `22` | 边框抠图亮度阈值：低于 low 抠透明，高于 high 完全不透明 |
| `backRoughness` / `backEnv` | `0.22` / `1.8` | 背面金属粗糙度 / 环境反射强度 |
| `edgeRoughness` / `edgeEnv` | `0.28` / `1.6` | 金属包边 |
| `breeze` | `0.5` | 常驻微风强度（0 = 完全静止） |
| `gravity` / `damping` / `elasticity` | `1` / `0.5` / `0.5` | 重力 / 阻尼 / 回弹 |
| `interactive` | `true` | 可拖拽、可点击翻面 |
| `intro` | `true` | 进入时甩入 |

### 两个必须知道的限制

1. **`file://` 打开会退回静态版工作牌。**
   浏览器把 `file://` 图片视为跨源，画进 canvas 再上传 WebGL 会抛安全错误。
   → 想看 3D 版，用 `http://localhost:8788/` 或部署后的地址打开。
   （控制台会打印一条说明，页面本身功能不受影响。）
2. **three.js 用的是 r160 UMD**，控制台会有一条 "build/three.js is deprecated" 的黄色警告。
   r161 起官方不再提供 UMD 构建，r160 是最后一个带全局 `THREE` 的版本，属于预期内。

---

## 六、本轮七项改动（已实测）

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 首页第三个视频播完直接跳作品界面 | 初版：`hero.js` 的 `scheduleJump()`：视频 3 `ended` → 停 `jumpDelay` → `scrollIntoView` 到 `#deck`。**现已改为交叉淡化**：`ended` → `enterSite()` → `MSView.toSite()`，首页淡出 / 站点淡入，零位移，且 `jumpDelay = 0`（末帧不停留） | `_dev/jump-delay-test.html` 实测：`ended` → 切站 = **56.2 ms**；`view-test.html` 实测：html.class = `is-view-site`，hero 层 opacity→0、站点层→1，首页 `visibility:hidden` ✅ |
| 2 | 首页不保留「进入作品阵」按钮 | `index.html` 删掉 CTA 节点，`hero.css` 删掉 `.hero__cta` / `.hero__cta-arrow` | 首页只剩左栏文案 + 右下角声音开关 ✅ |
| 3 | 窄屏保证风铃主体 3/4 在画面中 | 不写死百分比，按 `object-fit:cover` 反解 `object-position`：`x = (chimeCenterX - visible/2) / (1 - visible)` | 390×844 实测：可视窗口 22%~48%，主体 26%~45% **完整在画面内（100% ≥ 75%）** ✅ |
| 4 | 工作牌可拖拽 / 可显示范围大一些，位置偏下 | `size` 0.52→**0.58**、`strapLength` 0.36→**0.52**；`.lanyard` 宽 `clamp(14rem,23vw,23rem)`、高 88vh，右移量加大 | 1280×720 下牌面约 220×296px，顶边在 25% 高度处，比之前更大更低 ✅ |
| 5 | 金属雕花边框 + 翻转金属光泽 | `meshPhysicalMaterial` + `metalness=1` + `roughness 0.17` + PMREM 环境贴图 + 金属包边；环境是程序化的暖光/冷光/26 颗星点 | 正面金色雕花框正常渲染；背面银色曼陀罗正常；**翻转中抓到帧：受光侧边框扫出亮金高光** ✅ |
| 6 | 第四张图（占卜桌布）作作品界面背景 | `deck.css` 的 `.deck` 铺 `assets/deck/tablecloth.jpg`，1100px 无缝平铺 + 压暗层 | 作品区背景已是暗紫底 + 金色星象圆纹 ✅ |
| 7 | 导航：顶部细线 + 月相 Logo | `.masthead::before` 一道两端淡出的暗金 1px 细线；`✦` 换成内联 SVG 月牙 + 四角星 | 顶部 y=0 行采样 `(100,83,66)` 金调（相邻行 `(28,23,38)`），Logo 正常 ✅ |

### 怎么复现自测

```powershell
powershell -ExecutionPolicy Bypass -File .\_dev\serve.ps1
```

- `http://localhost:8788/_dev/jump-test.html` → 打印跳转时间线 + 窄屏对齐数值
- `http://localhost:8788/_dev/jump-delay-test.html` → **末帧停留**：视频3 `ended` → 切站的真实耗时（当前 56.2 ms）
- `http://localhost:8788/_dev/lanyard-test.html` → **三种视口**扫描牌面几何并自动翻面（`#loop` 会持续来回翻）
- `http://localhost:8788/_dev/lanyard-harness.html` → **工作牌边界约束**：独立页面，模拟 8 个方向拖到极限，逐次读 NDC 包围盒
- `http://localhost:8788/_dev/hero-scroll-test.html` → **视频二滚动惯性**：打一个滚轮事件，采样进度曲线并判断是否平滑停稳
- `http://localhost:8788/_dev/view-test.html` → 交叉淡化 / 不可逆导航 / 锚点 / 导航高亮
- `http://localhost:8788/_dev/content-test.html` → 年份、作品档案、关于我、联系方式核对
- `http://localhost:8788/_dev/lightbox-test.html?n=3` → 打开灯箱看双栏（`n` 是第几件作品）

除 `lanyard-harness.html` 外，其余自测台都用**固定尺寸 iframe**跑，页面窗口怎么变都不影响结果。

> ⚠️ **`lanyard-harness.html` 为什么是独立页面、不是 iframe**：
> 工作牌靠 `IntersectionObserver` 判断「是否在视口内」来决定要不要跑物理循环，
> 而在 1280×800 的 iframe 里它**一直判定为不可见**，物理循环启动 3 帧就停，
> 卡牌冻在入场姿势上 —— 看起来像 bug，其实是自测台自己的问题。
> 改成独立页面（直接 `MSLanyard.create()` 挂一个 304×616 的容器）后，
> 异常也能直接落在本页控制台，不会被 iframe 吞掉。

---

## 七、本轮五项改动（已实测）

### 1 · 内容同步：年份 + 详细正文 + 关于我 / 联系方式

| 要求 | 怎么做的 | 实测结果 |
|---|---|---|
| vault 里九件作品的「详细」栏改动同步进网页 | `works.js` 每件新增 `detail: { lead, sections:[{h:'背景',p:[]},{h:'做法',ul:[]},{h:'反思',p:[]}] }`，逐句取自 `作品集/作品条目/*.md` 正文 | 内容自测台实读：九件全部渲染出 `背景 / 做法 / 反思` 三个分块，正文 184~665 字 ✅ |
| 作品年份（原来是 2025 / 2024） | 全部改成 **2026** | 数据层与 DOM 实读均为 `2026 × 9` ✅ |
| 「关于我」页同步 vault 改动 | `index.html` 的 `#about`：lead 改成「我是刘昶红，可以叫我牧舒……尝试使用 AI，表现自己的情绪」，新增「做过的东西」两条 + 「一些信条」三条，证书补「去过 20+ 城市」 | 实读小标题 `[在做 / 做过的东西 / 经历 / 一些信条 / 工具箱 / 证书]`，信条 3 条 ✅ |
| 「联系方式」页同步 | 新增「一般 48 小时内回复。」 | 实读命中 ✅ |

> **年份为什么会出现偏差**：不是 bug，是建站时在 `works.js` 里**手填**了 2025 / 2024，
> 之后一直没跟 vault 对过账。这次统一改成 2026，并在第一节写清了「前端文字改哪里」。

### 2 · 导航全局悬浮

- `<header class="masthead">` 从 `.hero__ui` 内部**移到 body 级**，成为所有视图共用的顶栏
- CSS：`position: absolute` → **`fixed`**，`z-index: var(--z-masthead)`（40，压在工作牌画布之上，导航始终可点）
- 加了一层**柔和压底**（`.masthead::after` 渐变），站点内容从导航下面滚过时导航文字依然清楚
- 锚点变成**跨视图**：首页模式下点「作品 / 关于我 / 联系方式」→ 先交叉淡化进站点视图，再滚到对应锚点；
  点「首页」→ 主动淡回首页（首页视频从头重播）

实测：顶栏 `position = fixed` ✅；首页点「作品」→ 进站点并停在 `#deck` 顶部 ✅；导航高亮跟随当前区块 ✅。

### 3 · 工作牌：换图 + 缩小 + 垂到横中线以下

| 项 | 改前 | 改后 |
|---|---|---|
| 正面人像 | 旧图 951×1269 | **新图 876×1170**（同槽位直接替换） |
| 容器宽度 | `clamp(14rem, 23vw, 23rem)` | `clamp(13rem, 21vw, 21rem)` |
| `strapLength` | `0.78` | **`1.0`**（垂到最低） |
| 移动端容器高 | `92vh` | `96vh` |

**实测（lanyard-test.html，三种视口全网格扫描射线命中）**：

| 视口 | 牌面尺寸 | 牌面中心（占视口高） | 横中线 | 判定 | 四边裁切 |
|---|---|---|---|---|---|
| 1600×900 | 235×333 px | **57.2%** | 450 | ✔ 明显在中线以下 | 无 |
| 1280×800 | 194×253 px | **54.6%** | 400 | ✔ 明显在中线以下 | 无 |
| 390×844 | 136×162 px | **51.8%** | 422 | ✔ 明显在中线以下 | 无 |

牌面比改前小约 13%，翻面交互三种视口全部可用 ✅

> 为什么牌面大小主要由**容器宽度**决定：Lanyard 的取景是「牌子宽度占画面 72%」，
> 容器越窄牌子越小；`size` 只在容器很宽时才起作用。

### 4 · 首页标题

- kicker `Where the wind lingers` → **`The Illusion Cabinet`**
- h1 `有风的地方` → **`幻象陈列室`**

### 5 · 交叉淡化 + 不可逆导航

按提示词做成了 vanilla 版「状态机驱动的视图切换」：

| 提示词要点 | 这里的实现 |
|---|---|
| 首页和作品区作为两个全屏视图 | 首页 = `position: fixed; inset: 0` 的 `.hero-track`；站点 = 正常文档流的 `.siteview` |
| 用 opacity + transition 做 Crossfade | 两层同时交叉淡化，**零位移**；时长 `view.fadeMs`（900ms） |
| 一旦进入作品区不能上滚回首页 | 首页层淡出后 `visibility: hidden`；`html.is-view-hero{overflow:hidden}` 锁页面 → **滚轮上滑物理上回不去** |
| 锁定滚动 / 重置滚动条到顶部 | `toSite()` 先解锁 class，再 `scrollTo(0,0)`，再滚锚点 |
| 预加载，避免白屏闪烁 | 三段视频 + 占卜桌布都 `<link rel="preload">`；站点层常驻 DOM，只切 opacity |

> **「滚动驱动视频」和「页面滚动锁定」的冲突**已经化解：
> 首页视图下页面锁住，滚轮事件被 `preventDefault` 后累加到 `hero.virtual`，
> `p = virtual / scrollDistance` —— 仍然是**连续进度 + 插值**，不按滚轮次数跳帧。

**实测（view-test.html）**：

```
初始        html.class = "is-view-hero"   首页滚动已锁定 ✔
滚轮驱动    hero 状态 = final   scrollY = 0（页面没被滚动）✔
视频3 播完  4.5s 后 html.class = "is-view-site"
            淡化中 hero opacity 0.95→0 / 站点 opacity 0.05→1（交叉淡化，非下滑）✔
            淡化后 hero visibility = hidden ✔
滚轮上滑    scrollY 0 → 0，仍在站点视图，回不到首页 ✔（不可逆）
点「首页」   切回 is-view-hero，hero 状态回到 idle（视频从头重播）✔
点「作品」   进站点并停在 #deck 顶部 ✔
导航高亮     当前高亮 = [作品] ✔
```

---

## 八、留给下一轮的口子

| 位置 | 挂点 | 说明 |
|---|---|---|
| 塔罗牌阵 | `<section id="deck" data-hook="tarot-deck">` + `<div data-deck-grid>` | 现在是**朴素版骨架**（暗金边框 + 罗马数字 + 悬停静音预览 + 点开灯箱全屏），背景已经是占卜桌布。`works.js` 里已经按「大阿尔卡纳 / 元素魔法 / 人像星图」分好组（`group` 字段），换皮时直接用 |
| Three.js 画廊 | `assets/js/` | 接 Three.js 建议单独建 `assets/js/gallery.js`，从 `window.MS_WORKS` 取数据，按 `group` 分区摆牌。`assets/vendor/three.min.js` 已经就位，直接引就行 |
| 首页动画 | — | 目前只有视频本身 + CSS 动效（滚动提示、月相脉冲）。粒子/雾气/星图这类装饰建议按 PDF 的 **8%–15% 透明度**、**慢速**、**不满屏**来做 |

### 铁律（写在这里，别忘）

1. 卡片内视频/封面占比 **≥ 80%**
2. 移动端**砍掉一半装饰**（`hero.css` 末尾已经做了基础版）
3. 灯箱播放时**装饰全部退场**（`body.is-lightbox-open` 已经处理）

---

## 九、封面与塔罗牌框（新增）

九张封面换成了作者自己做的版本，并统一套上 `素材·塔罗牌框 - .png` 这张金色塔罗边框。

### 素材

| 作品 | 源文件 | 站点文件名 |
|---|---|---|
| 笔的三千年演化 | `封面Ⅳ 笔的三千年演化.png` | `01-brush-evolution.jpg` |
| 全民健身 | `封面Ⅸ 全民健身.png` | `02-fitness.jpg` |
| 江山多胜游 | `封面Ⅱ 江山多胜游 v2.png` | `03-landscape-game.jpg` |
| 冷感高奢手提包 | `封面Ⅴ 冷感高奢手提包.png` | `04-luxury-bag.jpg` |
| 赛璐珞角色 | `封面Ⅵ TRIPLE SIGNAL v2.png` | `05-cel-character.jpg` |
| 时尚人像 | `封面Ⅷ 时尚人像.png` | `06-fashion-portrait.jpg` |
| 日常一天 | `封面Ⅲ 日常一天.png` | `07-daily-life.jpg` |
| 粘稠梦游 · MV片段 | `封面Ⅰ 梦游.png` | `08-mv.jpg` |
| 练习合集 | `封面Ⅶ 练习合集-七月.png` | `09-practice.jpg` |

源文件在 `C:\Users\dell\Pictures\ai\午夜风铃\`，文件名保持原样，方便下次再来一批。

### 合成做法（`_dev/covers/`）

工具在 **`_dev/covers/`**，直接跑就能重新生成：

```powershell
powershell -ExecutionPolicy Bypass -File .\_dev\covers\make-covers.ps1
# 产出在 .\_dev\covers\out\，把里面的 jpg 覆盖到 assets\covers\ 即可
```

- `CoverMaker.cs` —— 合成逻辑（System.Drawing）
- `make-covers.ps1` —— 源文件名 → 站点文件名的映射表 + 参数

合成三步：

1. 画面按 **cover** 方式铺满 1200×1600（3:4，和塔罗框同比例，不用裁切）
2. **四周压暗**：上/下各 20%、左/右各 14.5% 的黑渐变 + 整体 10% 压暗 —— 让金饰浮起来
3. 塔罗框按**亮度抠 alpha**（近黑 ≤16 → 全透明，≥62 → 全不透明，中间线性过渡），
   再叠到最上层；暗部统一提亮成金属反光色

> 为什么是「叠在最上层」而不是「放进内窗」：
> 框里的**八角星尖端是伸进画面区**的（内窗双线在 x=164/180，星的右尖到 x≈210）。
> 若按内窗裁切，星会被切掉一半；叠在最上层则所有纹样完整保留。

产物：9 张 JPEG，各 300–480 KB，合计 **3.2 MB**（原来是 2.3 MB）。
旧封面在 vault `附件/图片/` 里有原件，随时能换回去。

### 想改封面 / 换框

改 `_dev/covers/make-covers.ps1` 里的 `$map`（源文件名 → 站点文件名）和
`[CoverMaker]::Make(...)` 的参数（尺寸 / 质量 / alpha 阈值 / 压暗强度），重跑一次即可。
`alphaLow` 调大 = 抠掉更多近黑（框更"薄"）；`alphaHigh` 调大 = 金饰更淡。

---

## 十、部署与自己的域名

站点是**纯静态**的（HTML + CSS + JS + 视频/图片，没有后端、没有构建步骤），
所以**换任何静态托管都行，包括自己的域名**。

### ✅ 已经上线了（2026-11-05）

| | |
|---|---|
| **线上地址** | **https://stardust-mushu.fyi** |
| 备用地址 | https://mushu-portfolio.pages.dev |
| 托管 | Cloudflare Pages（free 套餐，境外节点，**不需要 ICP 备案**） |
| 源码仓库 | https://github.com/arvia0923/mushu-portfolio（公开仓库，Pages 直连 Git） |
| 部署方式 | 路线 A：push 到 `main` → Cloudflare 自动构建 → 自动上线（不用手动点 Deploy） |
| HTTPS | Cloudflare 自动签发，已实测通过 |
| 绑定域名 | `stardust-mushu.fyi`（DNS 记录 CNAME `@` → `mushu-portfolio.pages.dev`，已开代理） |

完整的部署细节、踩过的坑、**以后怎么更新**，都记在 **§二十 · 上线记录**。

### 想再绑一个域名（比如 `www.stardust-mushu.fyi`）

推荐 **Cloudflare Pages**（域名已经在 Cloudflare 买好的话，这是最省事的一条路，
免费额度足够，HTTPS 证书自动签发）。

#### 路线 A · Cloudflare Pages 直连 Git（推荐，代码在 Git 上就能持续更新）

| 步骤 | 做什么 | 注意 |
|---|---|---|
| 1 | 把站点目录（**不含 `_dev/`**）推到一个 Git 仓库 | 仓库里建议只放站点内容，`_dev/` 和备份都别提交 |
| 2 | Cloudflare 控制台 → **Workers & Pages → Create → Pages → Connect to Git**，选仓库 | 公开仓库免费；私有仓库在 Cloudflare 侧可能需要额外授权 |
| 3 | 构建设置：**Framework preset = None**，**Build command 留空**，**Build output directory = `/`** | 这是纯静态站，**没有构建步骤**，不要填 `npm run build` |
| 4 | Deploy | 几十秒出 `https://<项目名>.pages.dev` |
| 5 | **Custom domains → Set up a custom domain**，填 `你的域名` 或 `www.你的域名` | 域名已在 Cloudflare 的话，会自动帮你加 DNS 记录 |
| 6 | 再加一个 `你的域名`（裸域）作为重定向到 `www`，或反过来 | Pages 默认会把裸域 301 到 `www`，在 **Redirect Rules** 里可以改成反方向 |

#### 路线 B · Cloudflare Pages 直接上传（不想用 Git 就走这条）

| 步骤 | 做什么 |
|---|---|
| 1 | Cloudflare 控制台 → **Workers & Pages → Create → Pages → Upload assets**（Direct Upload） |
| 2 | 把整个站点文件夹拖进去（**先删掉 `_dev/`**，它只用于本地自测，部署上去是浪费流量） |
| 3 | Deploy → 拿到 `xxx.pages.dev` |
| 4 | 之后同样在 **Custom domains** 里加你的域名 |

> ⚠️ Direct Upload 的项目**没有 Git 关联**，以后改内容要重新拖一次；
> 走 Git 的话每次 push 自动重新部署。正式上线建议走 A。

#### 域名解析怎么填

如果域名**已经托管在 Cloudflare**（在你买的时候选的），第 5 步 Cloudflare 会自动写 DNS，你不用手动加。

如果要手动加：

| 类型 | 主机记录 | 目标 | 说明 |
|---|---|---|---|
| CNAME | `www` | `你的项目.pages.dev` | 常规做法 |
| CNAME | `@` | `你的项目.pages.dev` | 裸域；Cloudflare 支持在根上做 CNAME（会自动帮你 flatten） |

- 解析生效后 **HTTPS 证书自动签发**（Cloudflare Pages 内置，通常几分钟，最长 24 小时）
- 站点里全是相对路径（`assets/…`、`videos/…`），**放在任何子目录都能跑，不用改一行代码**
- **不需要备案**：Cloudflare Pages 是境外节点，国内注册域名不要求 ICP 备案
- ⚠️ **单文件 25MB 上限**（Cloudflare Pages 的硬限制，GitHub Pages 是 100MB）：
  `work-05-cel-character.mp4` 和 `work-01-brush-evolution.mp4` 原本超过 25MB，
  已经重编码到限额内（见下节）

#### 上线前要确认的几件事

- `_dev/` **不要**上传（自测台，21+ 个文件，纯浪费流量）
- 首页三段视频 + 桌布是 `preload` 的，首屏会拉 ~40MB 流量；移动端建议弱网下再考虑降码率
- 抖音二维码、邮箱这些**都是公开信息**，确认要不要留
- 部署完先用手机打开一遍（窄屏下导航符号会隐藏、联系方式折单栏，是设计好的）

### 站点体积现状

| | |
|---|---|
| 文件数 | 43（不含 `_dev/`） |
| 总体积 | **约 111 MB** |
| 最大单文件 | 19.5 MB（已全部压到 Cloudflare Pages 的 25MB 限额内） |
| 加载方式 | 首屏只预加载 3 支首页视频 + 桌布；作品视频点开才加载（`preload="none"`） |

> **压缩记录**：`work-01-brush-evolution.mp4` 31.4→**11.9 MB**、
> `work-05-cel-character.mp4` 43.1→**19.5 MB**（libx264 CRF 24 / maxrate 1500k / 720p / AAC 128k / faststart）。
> 原文件备份在 `D:\TEMP\moodshot\backup\videos\`。
> 母带在 vault `附件/视频/` 里没动过，随时可以重新压。

> 如果想更轻，可以把其余 9 支作品视频也按同一档再压一轮，
> 或改成 HLS 分片；但 111 MB 对静态托管来说不算事，首页打开速度不受影响
> （作品视频不进首屏）。

---

## 十一、素材规格与来源

| 用途 | 规格 | 位置 |
|---|---|---|
| 首页三段 | H.264 1080p，faststart，CRF 21 | `videos/hero/` |
| 九件作品 | H.264 **720p**（短边 720，保持比例），AACC 128k，faststart，CRF 22 | `videos/works/` |
| 工作牌贴图 | JPEG，1920 长边，压到 q86 | `assets/lanyard/` |
| 三页固定桌布 | JPEG q3，1280×720，388KB | `assets/deck/tablecloth-v3.jpg` |

原始母带仍留在 vault 的 `附件/视频/`（未改动），只有 `MV片段.mp4` 按要求换成了
`成品/粘稠梦游demo.mp4`（1080p HEVC → 转成网页版；原 4K 版本备份在 `D:\TEMP\moodshot\backup\`）。

体积对比：母带 1026 MB → 网页版 148 MB。

> 用户提供的 4 张附件实测**全是 JPEG**（扩展名写成 `.png` 但没有透明通道），
> 所以牌框用「按亮度抠透明」的办法做镂空，而不是靠 PNG 的 alpha 通道。

---

## 十二、已知待确认

- 署名目前用「牧舒」；「关于我」页开头按 vault 的原文写了「我是刘昶红，可以叫我牧舒」（用户自己改的，已按原样同步）
- 联系方式页：邮箱 `1034136944@qq.com` 与所在地是真实信息；**电话已打码**为 `181 **** 4430`；Behance / Dribbble / GitHub / 小红书已全部去掉，只留抖音二维码（悬停显示）
- 首页标题已按要求改成「幻象陈列室 / The Illusion Cabinet」
- 站点还没部署（用户说「还不急一时」，未授权发布）

### 本轮修掉的一个坑

`assets/js/hero.js` 的 `restart()` 里少了一个右花括号（上一轮写入时的笔误），
整个 `hero.js` 脚本因此**语法错误、根本没加载** —— 首页是一片黑、滚轮也没反应。
浏览器控制台直接报 `SyntaxError: Unexpected token 'catch'`。
这类错误**只有真在浏览器里跑一遍才会暴露**，静态检查查不出来。

---

## 十三、本轮五项改动（已实测）

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 视频二**滚动灵敏度提高**，开始/停止滚动**平滑**，停手后视频慢慢停 | `config.js`：新增 `wheelGain / coastTau / maxVel`，`scrollDistance` 2400→**1800**；`hero.js` 新增 `vel`（惯性速度）与 `glide(dt)`，位置改由速度**积分**得出 | `_dev/hero-scroll-test.html`：一个 `deltaY=240` → 100ms 内冲到 **14.3%**，按指数曲线滑到 **36.9%**，**4.9s 完全停稳**，曲线连续无跳帧；灵敏度为原来的 **2～3.7 倍** ✅ |
| 2 | 工作牌**拖到哪里都完整显示** | `lanyard.js` 新增边界约束：卡牌 **8 个角投到 NDC** 求真实包围盒；拖拽时夹住指针的 NDC 坐标，松手后惯性甩出画面则拉回 | `_dev/lanyard-harness.html`：**8 个方向 × 按住/松手 = 17 次全部「完整可见」**；极限值 left 0.003 / top 0.001 / bottom 1.000 / right 0.996 —— **恰好停在画布边缘内侧，一个都没越界** ✅ |
| 3 | 联系方式只留邮箱、电话打码、去掉平台、加抖音二维码 | `index.html`：删掉 Behance / Dribbble / GitHub / 小红书；电话改 `181 **** 4430`；新增 `.qr` 二维码块 + `assets/contact/douyin-qr.jpg`（844×844），`main.js` 的 `initQr()` 负责悬停/点击/回车切换 | 页面实读：邮箱 `1034136944@qq.com`、电话 `181 **** 4430`、抖音号 **62401711439**；**悬停后二维码完整淡入**（圆形码 + 头像 + 抖音角标）✅ |
| 4 | 「关于我」「联系方式」布局调整（配色保留） | 参照 vault 里 Obsidian 原版的**单栏 + 分节 + 卡片式信息块**结构重写：`base.css` 新增 `.doc / .doc__sec / .work / .quote / .fact / .tl / .kit` 一套，删掉旧的双栏 `.page__cols / .timeline / .toolbox / .creed` | 关于我 6 节（我在做什么 / 一些信条 / 经历 / 做过的东西 / 工具箱 / 证书）、联系方式 4 节（直接联系 / 平台上 / 合作说明 / 常见问题）；暗金卡片、引语竖线、金点时间线、紫水晶工具标签全部正常 ✅ **（注：「联系方式」这一半已在第十五节换回旧版紧凑三栏，「关于我」保持不变）** |
| 5 | 左上角「牧舒」二字缩小 | `hero.css` 的 `.masthead__name`：`clamp(1.5rem, 3.2vw, 2.3rem)` → **`clamp(1.1rem, 2.2vw, 1.55rem)`** | 截图对比，字号明显收小，位置与排版不变 ✅ |

> **控制台**：整轮 0 报错，只有 three r160 UMD 的预期弃用警告。

### 1 · 滚动惯性是怎么做的

原来只有「滚多少 → 位置变多少」这一层映射，停手就硬停。现在多了一个**速度量**：

```js
// hero.js
HeroController.prototype.nudge = function (delta) {
  // 同向叠加、反向替换（来回抖不会攒出诡异速度）
  if (this.vel === 0 || (delta > 0) === (this.vel > 0)) this.vel += delta * gain;
  else this.vel = delta * gain;
  this.vel = clamp(this.vel, -max, max);
  this.virtual = clamp(this.virtual + delta * direct, 0, this.scrollDistance);
  this.readScroll();
};

HeroController.prototype.glide = function (dt) {
  if (this.vel !== 0) {
    var before = this.virtual;
    this.virtual = clamp(this.virtual + this.vel * dt, 0, this.scrollDistance);
    if (this.virtual === before) this.vel = 0;      // 撞到边界，速度吃掉
    this.vel *= Math.exp(-dt / tau);                // 指数衰减 → 越滑越慢
    if (Math.abs(this.vel) < 1) this.vel = 0;        // 完全停稳
  }
  this.readScroll();
};
```

关键点：**位置由速度积分而来**，所以任何时刻都是连续的 —— 不会按滚轮次数跳帧，
停手后是「平滑减速」而不是「硬停」。

调参手感：`wheelGain` 调大 → 冲得更远；`coastTau` 调大 → 滑得更久；
`scrollDistance` 调小 → 整体更跟手。三个都是纯数值，改完刷新即可。

### 2 · 工作牌边界约束（算法说明）

画布是 **WebGL 的渲染视口** —— 超出相机视锥（NDC ±1）的部分根本不会画出来，
所以「被裁掉一半」不是 CSS 问题，是几何问题。解法分两层：

| 层 | 触发时机 | 做法 |
|---|---|---|
| `clampGrab()` | 拖拽中 | 指针的 NDC 位置 == 抓取点被拉过去的位置（投影沿同一条射线不变），所以直接把**指针**夹进「卡牌还能完整留在画面内」的区间 |
| `clampBody()` | 松手后 | 惯性把卡牌甩出画面时，按包围盒超出量拉回，并同步 `grab.target`，让物理不会下一秒又把它拽出去 |

包围盒用**卡牌 8 个角投影到 NDC** 求（`cardNdcBox()`），而不是靠矩阵元素反推
—— 后者的行列主序很容易搞错，实测数值始终对不上。

```js
// 抓取点当前 NDC（与 solvePin 用同一套变换）
var r = grab.local.applyQuaternion(body.quaternion);
var cur = body.position.add(r).project(camera);

// 卡牌中心 NDC + 卡牌半宽高
var cx = (box.minX + box.maxX) / 2, halfW = (box.maxX - box.minX) / 2;

// 卡牌中心跟着抓取点走：新中心 = 旧中心 +（指针 - 当前抓取点）
var loX = -1 + halfW - (cx - cur.x);
var hiX =  1 - halfW - (cx - cur.x);
pointer.x = clamp(pointer.x, loX, hiX);
```

> ⚠️ **踩过的坑**：第一版把「当前抓取点」错写成「新的目标点」，
> 于是夹取区间恒等于目标点自身 —— **整个夹取逻辑变成了空操作**。
> 自测台读数发现 8 次拖拽数值完全不变，才把这处算错揪出来。

顺带把画布占宽比从 `0.72` 放宽到 `0.637`（卡牌倾斜到 30° 时正好不被裁），
同时 `.lanyard` 宽度按同比例放大 + `right` 补偿，**卡牌在屏幕上的显示尺寸完全不变**，
只是能拖着走的行程多了一些。

### 3 · 抖音二维码是怎么裁出来的

源图是抖音「保存二维码」整页截图（1266×1890），码在页面中间偏下。
`_dev/make-qr.ps1` 用三步自动定位并裁出圆形码：

1. **降采样到 1/4**（约 316×472），加速后续像素运算
2. **膨胀半径 2**（把二维码的黑色模块粘成一整块白色区域）
3. **连通域分析**，取**最大、近正方形**的白色圆环 → 外接框 (216,260)-(1047,1091)，中心 (632,676)，半径 416

再裁成正方形并输出 844×844 的 `assets/contact/douyin-qr.jpg`（115 KB）。

> ⚠️ **这个算法试错过两次，别重试**：
> ① 「最长白色横线段」法 → 找到的是二维码里的横条，裁出一块碎图；
> ② 「连通域（不膨胀）」法 → 找到的是抖音小图标（半径 64），裁出一个小图标。
> ③ 现在这版（降采样 + 膨胀 + 连通域）才稳定。

页面上的呈现：默认只显示「抖音 / 悬停显示二维码」的占位，
悬停 / 聚焦 / 点击时真实二维码淡入并轻微放大；触屏（`hover: none`）直接常显。

### 复现自测

```powershell
powershell -ExecutionPolicy Bypass -File .\_dev\serve.ps1 8791
```

- `http://localhost:8791/_dev/lanyard-harness.html` → 工作牌边界（8 方向 × 按住/松手）
- `http://localhost:8791/_dev/hero-scroll-test.html` → 视频二滚动惯性曲线
- `powershell -ExecutionPolicy Bypass -File .\_dev\make-qr.ps1` → 重新裁二维码
- `http://localhost:8791/_dev/lanyard-harness.html?cfg=old` → **旧配置基线**（23.75vw 画布 / size 0.50 / widthFill 0.637）
- `http://localhost:8791/_dev/lanyard-harness.html?cfg=new&w=46` → **新配置**（46vw 画布 / size 0.437 / widthFill 0.36）
- 上面两条再加 `&hold=左`（或 `hold=右`）→ 拖到极限后**不松手**，可直接截图看牌子在边缘的样子
- `http://localhost:8791/_dev/contact-layout-test.html` → **联系方式三栏几何 + 二维码显形**（真实站点装进 1280×800 的 iframe 里量）

---

## 十四、本轮两项改动（已实测）

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 工作牌**活动范围横向扩宽至少三倍** | 放宽 `.lanyard` 画布（23.75vw → **46vw**）+ 把牌面占画布的比例压到 36%（`widthFill`），并把 `size` 调到 **0.437** 让牌面屏幕尺寸回到旧版 | `_dev/lanyard-harness.html` **同视口 A/B**：旧 **103.2 px** → 新 **451.3 px**，**4.37 倍**；牌面屏幕尺寸 **197×275 px 与旧版一致**；全程「完整可见」✅ |
| 2 | 首页**视频 3 换成「高清（1080P）.mp4」** | 源片是 **HEVC Main10 / 10bit**，Chrome 和 Windows 都不带解码器 → 转成 H.264 8bit（源片是 bt709 SDR，不需要 HDR 色调映射），**文件名保持不变，代码一行没改** | 新片 **1920×1080 / H.264 High / yuv420p / bt709 / 24fps / 121 帧 / 5.042s / 5.4 MB**；`faststart` 盒子顺序 `ftyp@4 → moov@36 → mdat@5299`（moov 在 mdat 前）；切站由 `fin.ended` 触发，实测**新片完整播完并自动进作品区** ✅ |

> **控制台**：整轮 0 报错，只有 three r160 UMD 的预期弃用警告。

### 1 · 该叫「包围盒」还是「画布」？—— 限制活动范围的是**画布**

两个词都出现过，说清楚各自的角色：

| 词 | 在这里指什么 | 作用 |
|---|---|---|
| **画布** | `.lanyard` 这个 DOM 容器 = WebGL 的**渲染视口**（相机视锥） | **它决定牌能拖多远**：超出视锥的牌根本不渲染，越出画面 = 看不见 |
| **包围盒** | `cardNdcBox()`：把牌体 **8 个角投影到 NDC** 求出的真实占幅 | 它只是**测量工具** —— 用来判断牌现在是不是完整可见 |

所以公式是：**能拖多远 = （画布宽 − 牌面在画布里占的宽）÷ 2**（每侧）。
牌面占的宽 = 画布宽 × `widthFill`。于是：

```
每侧余量 = 画布宽 × (1 − widthFill) ÷ 2
```

旧配置：画布 23.75vw、`widthFill 0.637` → 牌面吃掉 64% 的画布，只剩 18% 每侧。
新配置：画布 46vw、`widthFill 0.36` → 牌面只占 36%，每侧剩 32%，而且画布本身宽了 1.94 倍。

**两条一起动才有 4 倍多**：只放宽画布而不压 `widthFill`，牌面会跟着变大（画面比例不变），
余量还是那些像素；只压 `widthFill` 而不放宽画布，牌面会缩得很小。

`size` 是第三个必须同步的旋钮 —— 它管牌面**在画面里的大小**。
旧配置的 `size` 是 0.50，但旧画布太窄触发了 `minimumWidth` 兜底（把视野拉高），
牌面实际被缩到 63.7% —— 等效下来旧版的等效 `size` 是 **0.437**，所以新配置直接用这个值，
牌面在屏幕上的**像素尺寸和垂直位置都与旧版一模一样**，只是活动范围大了。

> ⚠️ **踩过的坑**：想在新旧之间做 A/B，必须让两套配置**跑同一份代码**。
> 原来 `0.637` 是硬编码在 `lanyard.js` 里的，只能改代码切版本。
> 现在抽成了配置项 `widthFill`，自测台靠 `?cfg=old|new` 切换，两边跑的是同一个文件。
> 另一个坑：自测台第一版**没加载 CSS**，canvas 回退到 three.js 写死的固有尺寸，
> 于是「画布 662×792」被显示成 827×990（dpr 1.25）—— 现在自测台加载 `lanyard.css`，
> 读数就是真实 CSS px 了。

**代价（明说）**：画布现在**完全在视口内**（`right: 3vw`），牌永远拖不出屏幕，
这是「完整可见」的前提；代价是牌的**静止位置**从屏幕 83% 处挪到了 74% 处（更靠中间一点）。
挂绳竖线会从右上角导航下方穿过（导航在 72%~95% 区间），
这条线旧版也在穿（旧版在 83% 处穿「关于我」），不是本轮新增的。

### 2 · 视频三替换：HEVC 10bit → H.264 8bit

源片：`C:\Users\dell\Pictures\ai\午夜风铃\高清（1080P）.mp4`

```
HEVC (Main10) / yuv420p10le / 1920×1080 / 24fps / 5.041667s / 19.46 Mbps / 11.78 MB
bt709 / tv range / progressive  ← 是 SDR，不是 HDR
```

- **必须转码**：Chrome 和 Windows 都不带 HEVC 解码器，`<video>` 直接播不出来。
- **不用做色调映射**：源片是 bt709 SDR，跟旧站那份（同样是 bt709 SDR）色域一致，
  10bit → 8bit 直接转就行，不需要 HDR→SDR 的 tonemap。
- 旧站内那份 `03-final.mp4` 是同镜头的 **8bit 高码率版**（H.264 High / 8.96 Mbps / 5.73 MB），
  抽帧比对构图、灯光、梦网位置一致，只有像素级微差 → 所以**参数完全对齐旧片**，
  观感不会跳。

转码命令（已实际跑通）：

```powershell
& $ffmpeg -v error -stats -y -i $src `
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 20 -preset slow `
  -x264-params "keyint=48:min-keyint=24:scenecut=0" `
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 `
  -c:a aac -b:a 128k -ar 44100 -ac 2 -movflags +faststart $out
```

产出 **5,661,474 B（5.4 MB）**，121 帧 / 5.041667s / 8.85 Mbps。
`-movflags +faststart` 把 moov 提到 mdat 前面，浏览器不用下完整个文件就能起播。

- 旧片备份：`D:\TEMP\moodshot\backup\videos\03-final-before-1080P.mp4`（5.47 MB）
- **文件名不变**（仍是 `videos/hero/03-final.mp4`）→ `index.html` / `hero.js` 一行都不用改

验证：切作品区的动作是 `hero.js` 里 `this.fin.ended` 触发的 ——
实测新片**完整播完并自动进作品区**，说明浏览器确实解码播放到了最后一帧；
网络面板里 `03-final.mp4` 返回 `206 Partial Content`（服务器支持 Range，faststart 也生效）。

---

## 十五、联系方式换回旧版紧凑布局（已实测）

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 联系方式**换回上一版那种密集紧凑的** | `index.html` 的 `#contact` 从 `.doc` 卡片流换回旧版 `.page__cols` 三栏（标签值同行的 `.contact-line`）；`base.css` 把 `.page__cols / .page__col / .contact-line / .contact-note` 这套旧规则**原样加回来**，并删掉已无人使用的 `.fact` 卡片样式 | `_dev/contact-layout-test.html`（真实站点装进 1280×800 的 iframe 量几何）：**三栏并排**（x=51 / 461 / 870，同一行，各 358px 宽），整页高度只有 **281px**（一屏看完），标签「邮箱」与值同行（标签宽 93px），二维码 128×128、悬停 / 点击显形 opacity=1 ✅ |

> **内容没退**：电话仍是打码的 `181 **** 4430`，平台链接仍然是**抖音二维码**
> （`data-qr` 属性和 `main.js` 的 `initQr()` 都原样保留）。
> 换的只是**版式**，不是内容。
>
> **「关于我」没动**，仍是上一轮的单栏分节 + 卡片式。

### 为什么这次是「找回来」而不是「再写一遍」

上一轮把联系方式改成卡片流时，旧版的三栏结构被整段删掉了
（`base.css` 里的 `.page__cols / .timeline / .toolbox / .creed`）。

这次没有凭记忆重写，而是**从会话快照里把当时的源码挖出来**：
`g000000000006…jsonl` 里那次改写 `base.css` 的 `old_string` 就存着被删掉的完整旧规则，
按原样加回来 —— 所以旧版的间距、字号、断点（`@media (max-width: 640px)`）都是**原值**，不是仿的。

### 顺带修掉的一个自测台问题

`_dev/content-test.html` 查「关于我」小标题还在用**上一轮之前的旧类名**（`.page__col h3` / `.creed`），
所以它一直显示「小标题: [] 信条条数: 0」—— 上一轮改版后没人同步它。
这次顺手改成查 `.doc__h` / `.quote`，并加上联系方式的三栏与二维码检查。

### 复现自测

- `http://localhost:8791/_dev/contact-layout-test.html` → 联系方式三栏几何 + 二维码显形
- `http://localhost:8791/_dev/content-test.html` → 年份 / 作品档案 / 关于我 / 联系方式

---

## 十六、站点是「双视图」结构 —— 自测台也跟着走真实路径（已实测）

这一轮复核联系方式时撞上一个之前一直没搞清的现象：
**在真实页面上截图，永远拍到的是首屏那个视频场景**，看不到联系方式。

### 根因：不是滚动问题，是视图问题

`assets/js/views.js` 把整个站点做成了两个互斥的「全屏层」：

| 视图 | html 上的 class | 内容 | 滚动 |
|---|---|---|---|
| 首页 | `is-view-hero` | 固定铺满视口的视频场景（`[data-view-hero]`） | **锁死**，滚轮只驱动视频进度 |
| 站点 | `is-view-site` | 作品 + 关于 + 联系方式（`[data-view-site]`） | 正常滚动 |

切换用 opacity 交叉淡化（`--view-fade: 900ms`），**没有任何位移滑动**。

所以：
- 页面一进来永远是 `is-view-hero`（`View.boot()` 固定加这个 class）。
- 点导航「联系方式」→ `main.js` 的 `initAnchors()` → `view.toSite(() => view.scrollToId('contact'))`
  → 淡入站点层 + 平滑滚到 `#contact`。
- 之前我截图拍到首屏，是因为当时**还在首页视图**，站点层根本没显示出来 ——
  不是「滚动没到位」，也不是截图工具出问题。

顺带确认了两件事：

1. **视频三播完会自动进站点视图**（`hero.js` 的 `jumpTo` → `MSView.toSite()`），落点是 `#deck`（作品区）。
   这解释了「打开页面过几秒就自己跳到作品区」的现象。
2. **初次加载带 `#contact` 不会直接落到联系方式**：`View.boot()` 总是先进首页视图，
   浏览器原生的 fragment 滚动在首页层是无效的。
   换句话说，**深链 `index.html#contact` 现在不生效** —— 这不是 bug，是这套「首屏 → 站点」
   叙事的设计代价。本轮没有改它（用户只点名了版式），记在这里备查。

### 自测台也跟着升级

`_dev/contact-layout-test.html` 原来只是把真实站点塞进 1280×800 的 iframe 量几何，
量的是**文档流坐标**（`y=5001`），量完那三栏其实还在视口外 —— 只能证明「排成三栏」，
证明不了「用户这一屏真的看得见」。

现在改成走**和导航完全一样的代码路径**：

```js
view.toSite(function () { view.scrollToId('contact'); });   // 等价于点导航「联系方式」
```

于是量出来的坐标变成了**视口坐标**：`y=376`，三栏都落在 800px 高的 iframe 视口里，
截图也能直接拍到联系方式的真实渲染。

升级后的实测输出（`http://localhost:8791/_dev/contact-layout-test.html`）：

```
视图状态：html.is-view-site
联系方式栏目数：3
  第 1 栏　x=51　y=376　宽=358　高=281
  第 2 栏　x=461　y=376　宽=358　高=281
  第 3 栏　x=870　y=376　宽=358　高=281
✓ 桌面端三栏并排（同一行）
✓ 三栏都在视口内（这一屏就能看全）
最高一栏 281 px（整页联系方式高度 ≈ 281 px，一屏看完）
标签「邮箱」与值同行：是 ✓（标签宽 93px）
二维码 128×128 px，data-qr：有 ✓
显形后 opacity=1 transform=matrix(1, 0, 0, 1, 0, 0) ✓
小标题：直接联系 / 平台上 / 可以接的 / 接之前想知道的 / 常见问题
```

页面标题会变成 `PASS · 联系方式布局`（失败则是 `FAIL · …`）。

### 本轮复核清单

- 联系方式桌面三栏：PASS（几何 + 视口可见 + 标签同行 + 二维码显形）
- 窄屏（<640px）：`.page__cols` 折成单栏
- 内容自测台 `_dev/content-test.html`：九件作品年份 / 灯箱档案 / 关于我 6 节 + 信条 3 条 /
  联系方式 3 栏 + 行式条目 3 + 二维码有 / 首页标题与导航 —— 全 ✔
- 真实页控制台：**0 报错**，只有 three.js r160 的 `build/three.min.js` 预期弃用警告

---

## 十七、本地服务器改成常驻进程（2026-11-05 补记）

之前服务器是用工具的「后台任务」跑的，**有 1 小时硬上限**，到点就被回收 ——
表现为浏览器里视频突然加载失败（服务器日志里会刷一串
`ERR /videos/works/xxx.mp4 :: … "The specified network name is no longer available"`，
那是进程被掐断瞬间的在途写入，**不是站点坏了**），重新起一次就好，但每隔一小时就得重来。

现在改成**脱离工具任务的常驻进程**：

```powershell
$serve = 'D:\obsidian\film-261103\网页制作？\风铃作品集\_dev\serve.ps1'
Start-Process -FilePath 'powershell.exe' `
  -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $serve, '8791' `
  -WindowStyle Hidden `
  -RedirectStandardOutput 'D:\TEMP\moodshot\serve-8791.out.log' `
  -RedirectStandardError  'D:\TEMP\moodshot\serve-8791.err.log'
```

这个进程不会被工具回收，可以一直开着。

**怎么停**（端口占用时会报 `address already in use`）：

```powershell
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
  Where-Object { $_.CommandLine -like '*serve.ps1*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

> 日志文件在服务器运行期间是**被独占锁住**的（`Start-Process` 的重定向就是这么设计的），
> 想读得用共享读：

```powershell
$fs = [System.IO.File]::Open($log, 'Open', 'Read', 'ReadWrite')
$sr = New-Object System.IO.StreamReader($fs); $sr.ReadToEnd(); $sr.Close(); $fs.Close()
```

---

## 十八、文案与质感的一轮打磨（2026-11-05，已实测）

这一轮改了六处：两处文案、一处版式（卡背）、一处字体质感（导航）、两处文案（信条 / 联系方式）。

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 首页**副标题换文案** | `index.html` 的 `.hero__sub` 改成「动画分镜学徒，现沉迷 AIGC 的视觉炼金术士。在思想的阁楼，创造属于自己的浪漫，收集那些转瞬即逝的幻觉，并把它陈列于此。」 | 截图确认首屏显示新文案 ✅ |
| 2 | 工作牌**背面**：图做暗一些 + 写上文字 | `lanyard.js` 新增 `paintBackText()`；`paintBadgeBack()` 画完图后先叠一层 `rgba(11,7,16,backDim)` 压暗，再叠一道从 44% 高处往下的渐变（下缘 0.94 浓度），然后画字块 | 新增 `_dev/lanyard-back-test.html`：翻到背面截图确认 —— **文字清晰、图已压暗、方向没镜像** ✅ |
| 3 | 导航**换复古宋体 + 加装饰** | `tokens.css` 新增 `--font-nav`（霞鹜文楷 → 华文中宋 → 宋体 → Noto Serif…）；`index.html` 四个 `<a>` 里各塞一个内联 SVG 小符号；`hero.css` 加间距 / 发光小圆点 | 截图确认：✦ 首页 · ☾ 作品 · 藤 关于我 · 菱 联系方式，字距拉大、项间有极弱发光圆点 ✅ |
| 4 | 「一些信条」**三条全改** | `index.html` 三条 `.quote` 整体替换 | 内容自测台实读三条新文案 ✅ |
| 5 | 联系方式**「占卜前想知道的」+ 两条 FAQ** | `index.html` 第三栏整段替换 | 联系方式布局自测台 PASS ✅ |

### 2 · 卡背是怎么做的

原来 `paintBadgeBack()` 里有图就**只铺图直接 return**，所以卡背是一张纯曼陀罗。
现在拆成三步：

```
1. ctx.drawImage(mandala.jpg)            // 原来的铺图
2. 压暗：整幅 rgba(11,7,16,0.52) + 下半渐变 0 → 0.94
3. paintBackText() 画文字块
```

文字块（画布 1024×1440，`FACE_WIDTH = 1024`）：

```
────────                             暗金细线
动画 / 影像 / 互动                   gold  · 0.028W · 手动字距
这是一个捕捉梦境的暗室。              cream · 0.042W
如果你也喜欢奇奇怪怪的浪漫，欢迎联系：  silver · 0.027W
Email: 1034136944                    gold  · 0.033W
────────                             暗金细线
Scroll to explore the illusions.      dim silver · 0.020W
```

**为什么压暗在 canvas 里做、而不是去改那张 jpg**：
改图是「一次性烘焙」，以后想调浓度就得重新出图；
在 canvas 里做是**可调参数**（`config.js` 的 `backDim`），改完刷新就生效。

**为什么背面字不会镜像**（翻面时特意验过）：
卡背网格是正面网格 `clone()` 之后绕 Y 轴转 180°（`backMesh.rotation.y = Math.PI`）。
物体转 180° + 观察者换到另一侧，**左右关系抵消**，所以卡背的字是正的。
（`flipY` 只影响上下，不影响左右。）

> 卡背原来那句 `backCaption: 'No. 01 · 捕梦阁楼'` 已被这套文字块取代，配置项一起删了。

### 3 · 导航字体：本机没装霞鹜文楷

用户点的是「霞鹜文楷 **或者** 带点复古感的宋体」。
查了本机字体（`C:\Windows\Fonts` + 用户字体目录，727 个字体族），**霞鹜文楷没装**，
但有一大批明朝体可用：**华文中宋 / 华文宋体 / 宋体 / 新宋体 / 华文楷体 / 楷体 /
FandolSong / 文鼎PL细上海宋 / 王汉宗中明体**……

所以做成**字体栈**，两头都照顾到：

```css
--font-nav: "LXGW WenKai", "霞鹜文楷", "LXGW WenKai Screen",
            "STZhongsong", "华文中宋", "FandolSong", "Source Han Serif SC",
            "Noto Serif SC", "STSong", "华文宋体", "Songti SC",
            "SimSun", "宋体", serif;
```

- 现在这台机器 → 命中 **华文中宋**（复古明朝体，和站点气质最合）
- 以后装了霞鹜文楷 → **自动切换，不用改代码**
- 别人打开 / 部署后的访客 → Windows 落到宋体，macOS 落到 Songti SC，Linux 落到 Noto Serif SC

> 没有内嵌 webfont：霞鹜文楷完整字库 10MB+ ，为了导航那 11 个字不值当；
> 字体栈在所有平台上都有可用的回退，不会出现掉字。

**小符号**（`index.html` 里内联 SVG，`aria-hidden="true"`）：

| 栏目 | 符号 | 画法 |
|---|---|---|
| 首页 | ✦ 四芒星 | 四条内凹尖角，`fill="currentColor"` |
| 作品 | ☾ 月相 | 一大一小两圆相切（挖月牙） |
| 关于我 | 细藤蔓 | 一根茎 + 两片叶子（`stroke`） |
| 联系方式 | 菱形 | 外菱形 + 内小菱形（呼应塔罗牌） |

颜色是 `--gold`，静止 `opacity: 0.6`，hover / 当前页 `opacity: 1` 并微微放大。

**发光小圆点**：用 `.masthead__nav a + a::before` 画（3px 金点 + `box-shadow` 辉光），
定位在 `left: calc(var(--nav-gap) / -2)`，也就是**两个栏目正中间**。

**下划线改挂在文字上**：原来 `.masthead__nav a::after` 会连装饰一起划一道线，
现在把文字包进 `<span class="masthead__label">`，下划线改用 `.masthead__label::after`，
只压文字。

### 窄屏按铁律砍装饰

| 断点 | 处理 |
|---|---|
| `> 760px` | 符号 + 圆点全开，`--nav-gap: clamp(1.4rem, 3.2vw, 2.7rem)`，字距 0.18em |
| `≤ 760px` | 符号缩到 0.72em，字距收到 0.12em，`--nav-gap: 1rem` |
| `≤ 560px` | **符号全部隐藏**，只留发光圆点（`--nav-gap: 0.8rem`，字距 0.08em） |

> 为什么要留这一刀：390px 宽的手机上，
> 11 个汉字（0.12em 字距 ≈ 160px）+ 4 个符号（65px）+ 间距（58px）+ 站名 ≈ 300px，
> 而可用宽度只有 ~294px —— **必然溢出**。所以 560px 以下先把符号砍掉。

### 5 · 联系方式第三栏变高了

新文案比原来长，三栏高度从 **281px → 320px**。
实测仍在 800px 高的视口内（区块起点 y=376，376 + 320 = 696 < 800），
**还是一屏看完**，不需要改版式。

### 这轮新增的两个自测台

| 文件 | 干什么 |
|---|---|
| `_dev/lanyard-back-test.html` | 独立页面挂工作牌 → **点一下翻面** → 停在背面朝上，专门用来截图看卡背压暗与排版 |
| `_dev/page-view.html` | 真实站点装进 iframe → `MSView.toSite` + `scrollToId` → 停在指定锚点（`?sec=about/contact/deck`），可调 `?vw/?vh/?scale` 测任意视口 |

> `lanyard-back-test.html` 有个坑：`_dev/` 下的相对路径会解析成 `/_dev/assets/…`（404），
> 所以三张图都得写成**根路径** `/assets/lanyard/…`。

### 本轮复核

- 真实页控制台：**0 报错**，只有 three.js r160 UMD 的预期弃用警告
- 联系方式布局自测台：PASS（三栏并排 x=51/461/870、各 358px、总高 320px、标签同行、二维码 128×128）
- 内容自测台：九件年份 / 灯箱档案 / 关于我 6 节 + 信条 3 条（新文案）/ 联系方式 3 栏 + 占卜前想知道的 + 两条 FAQ / 首页标题导航 —— 全 ✔
- 窄屏 390×844：导航符号已隐藏、联系方式折成单栏、顶栏不溢出 ✅

---

## 十九、卡背放大 + 三页固定桌布背景（2026-11-05，已实测）

| # | 要求 | 怎么做的 | 实测结果 |
|---|---|---|---|
| 1 | 工作牌**背面的字太小**，要占到整个工作牌约 70%，一行一句话 | `lanyard.js` 的 `paintBackText()` 整体放大：字号 ×1.3～1.5，字块从牌底（0.66H~0.89H）上移到 **0.16H~0.72H**，横向占牌面 **~75%**；压暗同时加强（`backDim` 0.52 → **0.62**，渐变上移到 12%H） | 新增 `_dev/lanyard-back-test.html` 翻面截图确认：文字块占牌面宽 **~75%**、清晰可读、方向没镜像 ✅ |
| 2 | 三个页面都要有背景图，**固定在最底部、不跟着滚**，换成「白金紫」桌布 | 新增 `.siteview__cloth`（`base.css`）：`position:fixed; bottom:0; height:100vh`，用新图 `assets/deck/tablecloth-v3.jpg`；`.deck` 原来的平铺背景改成透明 | 自测台实测：桌布层 `position=fixed`、滚动 500px 后 top **0 → 0 没跟着滚** ✅；作品 / 关于我 / 联系三页都透出桌布 ✅ |
| 3 | 部署上线方式（Cloudflare + 自有域名） | README 第十节重写成 **Cloudflare Pages 两条路线**（Git 直连 / Direct Upload）+ 域名解析怎么填 + 上线前检查清单 | 见第十节 + **§二十**（**已上线**：`https://stardust-mushu.fyi`） |

### 1 · 卡背文字放大

原来（1024×1440 画布）：

| 元素 | 原字号 | 原位置 | 实际占牌宽 |
|---|---|---|---|
| 动画 / 影像 / 互动 | 0.028W (29px) | 0.657H | ~43% |
| 这是一个捕捉梦境的暗室。 | 0.042W (43px) | 0.712H | ~56% |
| 如果你也喜欢奇奇怪怪的浪漫，欢迎联系： | 0.027W (28px) | 0.756H | ~46% |
| Email: 1034136944 | 0.033W (34px) | 0.802H | ~38% |
| Scroll to explore the illusions. | 0.020W (20px) | 0.888H | ~34% |

现在：

| 元素 | 新字号 | 新位置 | 实际占牌宽 |
|---|---|---|---|
| 动画 / 影像 / 互动 | **0.050W (51px)** | **0.250H** | ~67% |
| 这是一个捕捉梦境的暗室。 | **0.055W (56px)** | **0.360H** | **~79%** |
| 如果你也喜欢奇奇怪怪的浪漫，欢迎联系： | **0.040W (41px)** | **0.460H** | ~77% |
| Email: 1034136944 | **0.055W (56px)** | **0.560H** | ~63% |
| Scroll to explore the illusions. | **0.029W (30px)** | **0.720H** | ~56% |

上下两道暗金细线也跟着加宽（0.30W → **0.44W**），从 0.612H/0.848H 移到 **0.155H / 0.645H**。

> **一行一句话没有破坏**：每个字符串都是单行居中排的，没有折行。
> 最宽的那行（标题 13 个字）占牌面 ~79%，还在牌内。

**压暗跟着加强**：文字块上移到 0.16H 之后，原来 0.44H 以下的渐变罩不住了 ——
所以 `backDim` 提到 0.62，渐变改成从 **0.12H** 开始（0 → 0.46 → 0.78 → 0.92）。
曼陀罗的月亮脸现在变成文字背后的一层幽影，正好是「暗室」的意思。

### 2 · 固定桌布背景

```css
.siteview__cloth {
  position: fixed;                    /* ← 关键：不跟着滚 */
  left: 0; right: 0; bottom: 0;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  background: url("../deck/tablecloth-v3.jpg") center bottom / 100% auto no-repeat;
  opacity: 0.30;
}
```

三个关键点：

1. **为什么 `fixed` 真的是相对视口**：
   `.siteview` 只做了 `opacity` 淡入（没有 `transform` / `filter` / `perspective`），
   不会生成包含块，所以 `fixed` 子元素照旧钉在视口上。
2. **为什么 z-index 0 就够**：
   `.deck` / `.page` / `.foot` 都是 `position:relative` + `z-index:20`（`--z-deck`），
   天然盖在桌布上面，不用给每一块加定位。
3. **为什么首页看不到桌布**：
   `.siteview` 在首页视图时 `opacity: 0`，桌布是它的子元素 → 一起隐身。

**桌面用 `100% auto`**：图按视口宽度铺开，高度按 16:9 自适应，底边对齐视口底 ——
所以它读起来像「一张铺在页面最下面的挂毯」；视口越高，桌布占的比例越小，上方留白越多。
**窄屏（≤760px）改成 `auto 100%`**：铺满高度、居中裁切，不然在手机上只剩窄窄一条。

**遮罩**（`.siteview__cloth::after`）：

```
0%   0.96   ← 上缘几乎全黑，桌布淡出融进页面底色
22%  0.52   ← 最亮的一段，只在这里露出挂毯
62%  0.62
100% 0.92   ← 下缘压暗，保住页脚可读性
```

> 第一版用 `opacity 0.36` + 遮罩 0.38，中栏（平台上 / 可以接的）正好压在桌布最亮的
> 罗盘中心上，对比度掉了一档 —— 调成 **0.30 + 0.52** 之后三栏文字都清楚了。

**新图的处理**：源文件 `素材·占卜桌布 v3（白金紫）.png` 是 1280×720 / 2.3MB 的 PNG，
转成 JPEG（q3 / yuv420p）后 **388KB**，写进 `assets/deck/tablecloth-v3.jpg`。

> **旧的 `tablecloth.jpg` 没有删**，原样留在 `assets/deck/` 里（也另外备份了一份到
> `D:\TEMP\moodshot\backup\assets\`）。想回退只要把 CSS 的 URL 改回去就行。

**`.deck` 原来的平铺背景改成透明**（`background: none`）——
不透明的话会把新桌布整个挡住。

### 本轮复核

- 真实页控制台：**0 报错**（只有 three.js r160 UMD 的预期弃用警告）
- 卡背翻面截图：文字占牌宽 ~75%、清晰、方向没镜像 ✅
- 桌布层：1280×800 @ 0,0，`position=fixed`，`opacity=0.30`；再滚 500px → top **0 → 0** ✅
- 作品 / 关于我 / 联系方式三页截图：桌布都透出来了，文字对比度可读 ✅
- 首页视图：桌布不出现 ✅

---

## 二十、上线记录（2026-11-05，路线 A 已上线）

### 现在访问哪里

| | |
|---|---|
| **正式地址** | **https://stardust-mushu.fyi** |
| 备用地址 | https://mushu-portfolio.pages.dev |
| Pages 项目 | `mushu-portfolio`（Account ID `a6ef81351c56f08c2b89c030e617f0e2`） |
| 仓库 | https://github.com/arvia0923/mushu-portfolio（`main` = 生产分支） |
| DNS | `stardust-mushi.fyi` → CNAME `@` → `mushu-portfolio.pages.dev`，**已开橙云代理** |
| HTTPS | Cloudflare 自动签发，curl 实测 200 + 证书校验通过 |

### 仓库长什么样

**Git 仓库就建在站点目录里** —— `风铃作品集/.git`，所以 **vault 就是唯一事实源**，
不存在「vault 一份、部署目录一份」的两头改问题。

```
风铃作品集/          ← git 仓库根，部署上传的就是这一层的内容
├─ index.html
├─ 404.html          ← 新增：走丢的页面
├─ _headers          ← 新增：缓存 + 安全响应头
├─ _redirects        ← 新增：把开发文档挡在站点外
├─ .gitignore        ← 新增：_dev/ 不入库
├─ assets/  videos/
└─ _dev/             ← 自测台 + deploy.ps1，被 .gitignore 排除，不上传
```

| 关键配置 | 值 | 为什么 |
|---|---|---|
| Framework preset | **无（none）** | 纯静态站，没有构建步骤 |
| Build command | **留空** | 不要填 `npm run build` |
| Build output directory | **`/`** | 仓库根就是站点根 |
| 生产分支 | `main` | push 即自动部署 |
| `core.autocrlf` | `false` | 仓库字节 = 磁盘字节，绝不因 checkout 改写 vault 里手写的文件行尾 |
| 部署密钥 | 仓库级 **deploy key**（`Read/write`） | 授权范围只有 `mushu-portfolio` 一个仓库，不碰账号 |

### 以后怎么更新（一条命令）

在 Obsidian 里改完站点，**跑一条命令**，**约 20 秒**后域名自动更新
（实测：克隆 6~7 秒 + 构建 3~6 秒 + 部署 6 秒，全程 18~22 秒）：

```powershell
powershell -ExecutionPolicy Bypass -File "D:\obsidian\film-261103\网页制作？\风铃作品集\_dev\deploy.ps1"
```

- 脚本做三件事：`git add -A` → `git commit`（提交信息可用 `$env:DEPLOY_MSG` 自定义）→ `git push origin main`
- **没有改动就直接退出**，不会产生空提交
- 走的是部署密钥（`D:\TEMP\moodshot\deploy\mushu_deploy`）+ 独立的 `known_hosts`，
  不需要 GitHub 账号密码，也不会弹浏览器授权
- `_dev/deploy.ps1` 本身被 `.gitignore` 排除，**不入仓库、不上线**

具体落点：

| 想改什么 | 改哪里 |
|---|---|
| 加一件新作品 | 视频放 `assets/videos/works/`，封面放 `assets/deck/`，然后改 `assets/js/works.js` 里的作品清单 |
| 改版式 / 配色 | `assets/css/*.css`（`tokens.css` 是变量，`base.css` 是通用样式） |
| 改文案 | `index.html` 里的正文；作品自己的说明在 `assets/js/works.js` |
| 改首页三段视频 | `videos/hero/` 换文件，名字不变（注意同名替换要处理缓存，见下） |

> ⚠️ **视频同名替换会有 30 天缓存**：`_headers` 给 `/videos/*` 设的是 `max-age=2592000`。
> 要换掉同名视频，**把文件名改掉**（`02-rotating.mp4` → `02-rotating-v2.mp4`），
> 然后同步改 `index.html` 里的 `src` 和 `assets/js/hero.js`。

### 万一构建卡在「克隆仓库」不动

Cloudflare Pages 的**构建并发是 1** —— 同一时间只跑一个构建，前一个不结束，
后面全部卡在 **queued** 状态。所以只要有一个构建卡死，整条流水线就堵死了。

2026-11-05 就遇到过一次：某个构建的 `clone repo` 阶段挂了 **30 分钟**，
日志永远停在 `Cloning repository...` 一行。后面的构建全在排队，看起来像"仓库太大"，
其实只是被堵住了。**处理办法**：

1. 打开 Cloudflare 控制台 → Workers 和 Pages → `mushu-portfolio` → **部署**
2. 找到那个卡住的部署（`clone repo` 转圈最久那个）→ 点**「取消部署」** → 确认「取消构建」
3. 排队中的下一个构建会立刻接手，**通常 7 秒就克隆完**（实测）

> 排查小技巧：不用点进控制台，浏览器直接开这个地址就能看全部部署的阶段和耗时（JSON）：
> `https://dash.cloudflare.com/<Account ID>/pages/projects/mushu-portfolio/deployments`
> 顺便也能看项目配置：
> `https://dash.cloudflare.com/<Account ID>/pages/projects/mushu-portfolio`
> （这两个地址要登录，直接在已登录的 Cloudflare 标签页里打开即可）

### 缓存策略（`_headers` + 一处控制台设置）

| 资源 | 缓存 | 理由 |
|---|---|---|
| `/videos/*` | `public, max-age=2592000`（30 天） | 视频占了 111MB 里的绝大部分，值得长缓存 |
| `/assets/*` | `public, max-age=0, must-revalidate` | CSS/JS 要做到「改完刷新就能看到」 |
| `/*` | `nosniff` + `referrer-policy` + `X-Frame-Options: SAMEORIGIN` | 安全响应头 |

> ⚠️ **`_headers` 里写 `max-age=0` 不够** —— Cloudflare 域名级的
> **浏览器缓存 TTL** 默认是 **4 小时**，它会把比它小的 `max-age` 顶上去
> （实测 CSS 原本拿到的是 `max-age=14400`）。
> 已在 **域名 → 缓存 → 配置 → 浏览器缓存 TTL = 遵循现有标头** 改掉，
> 改完 `_headers` 的值才真正生效。

### 踩过的四个坑

1. **`_redirects` 不支持 404 状态码**
   官方文档写明：只支持 `200 / 301 / 302 / 303 / 307 / 308`，
   写成 `/README.md /404 404` 会被**静默忽略**（不报错，就是不生效）。
   → 改成 `/README.md /404 301`，再放一个 `404.html`。
   **实测行为**：`/README.md` → **301** → `/404`（Cloudflare 把 404 页挂在 `/404` 这个路径上，
   直接请求它是 **200**），访问者看到的是 404 页面，看不到开发文档；
   而**真正不存在的路径**（如 `/nope-xyz`）会拿到**货真价实的 404 状态码** + 404 页面。
   404 页里带 `<meta name="robots" content="noindex">`，不会被搜索引擎收录。

2. **Pages 会把未知路径回退成 index.html**
   站点只有一个 `index.html`，Pages 判定为 SPA，
   任何不存在的路径都会返回首页（200）。放上 `404.html` 之后才会走 404 流程。

3. **构建输出目录 = `/` 时，构建要克隆 + 上传 111MB**
   每次 push 都要把全部素材重新传一遍。**实测耗时**：
   克隆 6~7 秒 + 构建 3~6 秒 + 部署 6 秒 ≈ **20 秒**。
   比想象中快，不用重复 push。

4. **构建并发只有 1，一个卡死全堵住**
   见上面「万一构建卡在『克隆仓库』不动」。卡死的构建不会自己放弃，
   后面的构建会一直排队（`queued`），看着像"仓库太大克隆不动"，其实是排队。
   → 取消掉卡死的那个，下一个立刻就上。

### 已实测通过

**线上可达性**

- `https://stardust-mushu.fyi/` → **200**，TLS 校验通过，标题「牧舒的捕梦阁楼」✅
- `https://mushu-portfolio.pages.dev/` → **200** ✅
- DNS 委派链正确：`.fyi` → `v0n0/v0n1/v0n2/v0n3/v2n0/v2n1.nic.fyi`
  → `stardust-mushu.fyi` → `elma/sri.ns.cloudflare.com` → A `172.67.179.55` / `104.21.83.166` ✅

**页面与交互（浏览器实测，正式域名）**

- 首页渲染正常，3 支视频在播，**控制台 0 报错** ✅
- 导航「作品」→ 塔罗牌阵**九张牌**铺开，桌布背景正常 ✅
- 点开卡片 → **灯箱**全屏放映（带字幕）+ 右侧作品档案（背景 / 做法 / 反思）✅
- 未知路径 → **404 状态码** + 暗调月亮 404 页（3776 字节，标题「这一页走丢了」）✅
- `/README.md` → **301** → `/404`，开发文档不暴露在公开站点上 ✅

**响应头**

- `_headers` 生效：`/videos/*` → `max-age=2592000`；`/assets/css/base.css` → `max-age=0, must-revalidate` ✅
- 安全头生效：`x-content-type-options`、`referrer-policy`、`x-frame-options` ✅
- 404 响应自带 `Cache-Control: no-store` ✅

**构建**

- `push → 克隆 6~7 秒 → 构建 3~6 秒 → 部署 6 秒` → 线上更新，**全程约 18~22 秒** ✅
- `www.stardust-mushu.fyi` **本轮没绑**（域名页可以随时加，想加说一声）

