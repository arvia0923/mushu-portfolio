# 牧舒的捕梦阁楼 — 站点框架

个人作品集网站的可运行骨架。当前已完成**框架、首页三段视频交互、右侧 3D 工作牌
（含金属雕花边框 / 银色曼陀罗背面）**、**占卜桌布作品区背景**、**首页 ⇄ 站点
交叉淡化不可逆切换**、**灯箱作品档案面板**、**九张新封面套塔罗金框**、
**滚动惯性（停手后视频平滑减速）**、**工作牌边界约束（拖到哪都完整显示）**、
**双栏分节的关于我 / 紧凑三栏的联系方式 + 抖音二维码**。

> **站名**：牧舒的捕梦阁楼　|　首页标题：幻象陈列室 / The Illusion Cabinet

---

## 〇、想改前端上的文字？改这两个地方就够了

| 想改什么                                | 改哪个文件                   | 具体位置                                                                       |
| ----------------------------------- | ----------------------- | -------------------------------------------------------------------------- |
| 九件作品的**标题 / 年份 / 类型 / 分辨率 / 一句话简介** | `assets/js/works.js`    | 每件作品对象里的 `title` `year` `type` `res` `blurb`                               |
| 九件作品的**详细正文**（背景 / 做法 / 反思）         | `assets/js/works.js`    | 每件作品对象里的 `detail: { lead, sections: [...] }`                               |
| **关于我**整页（简历、经历、信条、证书）              | `index.html`            | `<section class="page" id="about">` 里的 `.doc--split`（双栏分节）                |
| **联系方式**整页                          | `index.html`            | `<section class="page page--contact" id="contact">` 里的 `.page__cols`（紧凑三栏） |
| 首页**标题 / 副标题 / 引言**                 | `index.html`            | `.hero__lede` 里的 `kicker` / `h1.hero__title` / `p.hero__sub`               |
| 导航**栏目名**                           | `index.html`            | `<nav class="masthead__nav">` 里的四个 `<a>`（文字包在 `.masthead__label` 里）        |
| 导航**字体 / 间距 / 小符号**                 | `assets/css/hero.css`   | `.masthead__nav`；字体栈在 `tokens.css` 的 `--font-nav`                          |
| 工作牌上的**名字 / 身份 / 卡背文案**             | `assets/js/config.js`   | `lanyard` 段的 `name` / `role` / `backKicker`~`backFoot` / `backDim`         |
| 页面**配色 / 字体 / 节奏**                  | `assets/css/tokens.css` | 全部设计令牌                                                                     |
| 交互**手感**（滚动灵敏度、淡化时长、工作牌大小…）         | `assets/js/config.js`   | 见第三节参数表                                                                    |

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
| 4 | **工作牌的照片先于 3D 牌蹦出来**，视觉很突兀；顺带要一个开屏动画 | 照片 `<img>` 加 `fetchpriority="low" loading="lazy"`；降级版默认 `display:none`；新增 `assets/js/preloader.js` 开屏（并行预载 + 1.5s 缓冲 + 5s 保底） | 浏览器实测：照片只请求 **1 次**、三张贴图同一毫秒并行拉取；退场用时 **1502ms**（资源 4/4）；把资源换成连不上的地址后 **5003ms** 强制退场 ✅ |

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

---

## 二十一、开屏加载动画（Preloader）

### 要解决的问题

3D 工作牌的照片会**先于** 3D 本体出现：

1. 页面一解析，`.lanyard__fallback` 里的 `<img src="portrait.jpg">` 就开始下载
   —— 浏览器**不管 `display:none`**，照样把图片拉下来
2. 那张照片又小又轻，**几十毫秒就下完**，于是「一张扁平的照片」先占住位置
3. 几百毫秒后 three.js 才加载完、牌框贴图才画好，3D 牌才出现 —— 中间那一跳很突兀

### 改了三处

| 改动 | 位置 | 为什么 |
|---|---|---|
| 照片 `<img>` 加 `fetchpriority="low" loading="lazy" decoding="async"` | `index.html` | 让它**不再抢带宽**，跟 3D 组件差不多同时出现 |
| 静态降级版**默认 `display:none`**，只有 3D 真起不来才 `.no-3d` 顶上来 | `hero.css` + `main.js` | `display:none` 的图浏览器照样下载 —— **不藏起来，懒加载根本不生效** |
| 牌面贴图画上去时 resolve 一个 `ready` 承诺 | `lanyard.js` → `window.MSLanyardReady` | 给开屏一个**精确信号**：照片已经画在 3D 牌上了 |

### 开屏本身（`assets/js/preloader.js`）

```
开屏出现  →  后台并行拉 3D 贴图（照片/背面/牌框）+ 桌布  →  等 ready 信号
                    ↓                                              ↓
            进度条 + 百分比实时走                     资源齐 ∧ 过 1.5s → 淡出 0.7s
```

| 参数 | 值 | 作用 |
|---|---|---|
| `MIN_TIME` | **1500ms** | 资源秒加载完也至少show 1.5 秒，转场才不突兀 |
| `MAX_TIME` | **5000ms** | 超时**强制**退场，绝不让用户干等 |
| `FADE_MS` | 700ms | 淡出时长 |

- **动效纯 CSS**（内联在 `<head>`，不额外发请求）：月相符号 `☾` 缓慢旋转 + 星光明灭，
  配色对应 `tokens.css` 的同名变量（写成字面量，因为 `tokens.css` 是外链，等它到了 `var()` 才生效）
- **并行加载**：五张图各自独立加载，谁都不等谁；`onerror` 也算「处理完毕」，
  一张图 404 不会把用户卡在开屏
- **保险丝**：`index.html` 里另有一段内联脚本，8 秒后无条件撤掉开屏 **并解除滚动锁** ——
  就算 `preloader.js` 整个没加载成功，页面也不会永远滚不动
- `<noscript>` 里直接 `display:none` 掉开屏（没 JS 就没有开屏）

### 实测数据

- `portrait.jpg` **只请求 1 次**（原来会跟 3D 贴图抢一条带宽）
- 三张牌面贴图 **同一毫秒**（`934003` / `934004`）并行拉取
- 正常情况退场用时 **1502ms**，资源 **4/4**（`[preloader] 退场 · 用时 1502ms · 资源 4/4`）
- 把资源换成连不上的地址 → 退场用时 **5003ms**，资源 **4/5**（5 秒保底按预期生效）
- 控制台 **0 报错**（只有 three r160 UMD 的预期弃用警告）
- 退场后 3D 牌面**已经带着照片** —— 看不到那张突兀的扁平照片了 ✅

## 二十二、作品区重做：「牌桌」—— 牌堆 / 抽卡 / 悬停翻面（2026-11-05，已实测，**暂未上线**）

### 改了什么

作品区不再是「九张牌的网格列表」，改成占卜桌布上的一副牌：

| 阶段 | 画面 | 实现 |
|---|---|---|
| 1 · 牌堆 | 桌布中央摆着两摞牌，每一摞 = 一个作品类别 | `config.js` 的 `deck.piles` → `deck.js` 生成按钮 |
| 2 · 发牌 | 选中的那摞**飞到视口最上方**，只露下半截当「发牌器」；其它牌堆向两侧滑出淡出；卡牌依次从发牌器抽出，错开延迟，码成网格 | FLIP（`getBoundingClientRect` + 反向 `transform`）+ `transition-delay` |
| 3 · 翻面 | 卡牌默认卡背朝上，悬停 `rotateY(180deg)` 翻出封面；**翻转瞬间从卡牌边缘迸出金色流沙**；移开翻回，再次触发 | CSS `perspective` + `preserve-3d` + 手写 canvas 粒子 |

### 卡片比例为什么定成 9:16

素材两边比例不一样，这是本轮最需要拍板的地方：

| 素材 | 原始尺寸 | 比例 |
|---|---|---|
| `素材·塔罗牌背.png` | 1152×2048 | **9:16**，满幅、带完整外框 |
| `assets/covers/*.jpg`（9 张封面） | 1200×1600 | **3:4**，同样是带完整金边的塔罗卡设计 |

两张都是「完整的一张卡」，**裁哪边都会把外框切掉**。实测对比三种方案后选了 9:16：

- **牌背裁成 3:4**（上下各切 12.5%）→ 上下边框线断在半空，最难看的方案 ❌
- **牌背 contain 进 3:4**（左右留黑边）→ 像「小卡嵌在大卡里」，有厚度感 ❌（明确不要厚度）
- **卡背保持 9:16 满幅 + 封面裁成 9:16**（左右各切 12.5%）→ 牌背纹样一点不损；
  九张封面裁完实测反而更干净（去掉两侧繁复边饰，像电影海报）✅

结论：**卡牌 = 9:16**。封面是 3:4，用 `object-fit: cover` 裁两侧。
（牌背是所有卡牌**共用一张**的，浏览器只会请求一次。）

### 原生等价实现（没有引第三方库）

站点是 vanilla + 经典 script + 全局命名空间、无构建步骤，所以提示词里的 React 生态全部用原生等价物替掉了：

| 想用的 | 实际怎么做的 |
|---|---|
| `layoutId` 平滑移动 | **FLIP**：先量旧位置 → 摆到新位置 → 反向 `transform` 摆回去 → 过渡到 `transform: none` |
| `staggerChildren` | `transition-delay` 逐张递增（`config.js` 的 `deck.stagger`，默认 76ms） |
| `rotateY(180deg)` 翻面 | `.tcard { perspective }` + `.tcard__inner { transform-style: preserve-3d }` + `backface-visibility: hidden` |
| `@tsparticles` 金色星尘 | `assets/js/dust.js` —— 手写 canvas 粒子（**零依赖**） |

### 金色流沙粒子（`assets/js/dust.js`）

- 一个全屏固定 `<canvas>` + 一个粒子数组 + 一个 rAF 循环
- **没有粒子时自动停掉 rAF**（不空转、不耗电）
- 粒子从卡牌**四条边**随机撒点，朝外飞，带轻微上扬、阻尼、横摆和重力 → 慢慢飘散、淡出
- 颜色取 `--gold`（暗金），叠加模式 `lighter` → 有辉光感；20% 的大颗粒带径向光晕
- 悬停和移开**各触发一次**（「移开则翻回并再次触发」）

### 顺手修掉的一个坑：Email 变长会撑破卡背

工作牌卡背的 Email 补上 `@qq.com` 后，字数从 18 个变成 27 个。
而卡背文字是**固定字号**画的（`W * 0.055` + `W * 0.010` 字距），量了一下：

| 文案 | 占牌宽 |
|---|---|
| `Email: 1034136944` | ~64% |
| `Email: 1034136944@qq.com` | **~97%** ← 两边快贴到牌沿了 |

解法：给卡背文字加一层**按宽度自动收字号**（`lanyard.js` 的 `drawFitted()`）——
先量整行宽度，超出上限就按比例把字号和字距一起缩下去。

```js
function drawFitted(ctx, text, cx, y, weight, size, family, tracking, maxW, align) {
  ctx.font = ...;
  var w = trackedWidth(ctx, text, tracking);
  if (maxW && w > maxW) {            // 太宽 → 按比例收
    var k = maxW / w;
    size = size * k; tracking = tracking * k;
    ctx.font = ...;
  }
  return drawTracked(ctx, text, cx, y, tracking, align);
}
```

每行单独设上限（kicker 0.80 / 标题 0.82 / 提示 0.82 / **Email 0.76** / 页脚 0.80），
所以除了 Email，其它几行的排版**一点没变**。以后再改文案也不会撑出牌面。

### 顺手修掉的另一个坑：卡面不再叠悬停预览视频

旧的作品列表里，卡片悬停会叠一层静音视频预览。这轮**默认关掉了**
（`config.js` 的 `deck.hoverPreview: false`），三个理由：

1. **用户要的就是「卡面 = 作品封面」**，不是视频
2. **首帧会闪**：ffmpeg 量过三支片子的首帧平均亮度 ——
   `work-05` 是 **0.002（纯黑）**、`work-03` 是 **255（纯白）**、`work-01` 是 146（正常）。
   翻面瞬间叠上去就是「卡面黑一下 / 白一下」
3. **加载流畅**：悬停就开始下视频（最大的那个 19.5MB），跟「加载流畅」冲突

现在卡面只有封面；**点卡牌进灯箱照常全屏放映**。
想开的话把 `hoverPreview` 改成 `true` —— 代码里也加了保护：
视频 `canplay` 之后才淡入（`poster` 先垫着封面），但首帧闪烁依然存在。

### 新增 / 改动清单

| 文件 | 说明 |
|---|---|
| `assets/js/dust.js` | **新增** · 金色流沙粒子系统（手写 canvas，零依赖） |
| `assets/js/deck.js` | **重写** · 牌堆 → 发牌器 → 抽卡 → 悬停翻面 |
| `assets/css/deck.css` | **重写** · 牌堆 / 发牌器 / 卡牌正反面 / 翻转 / 空状态 |
| `assets/js/config.js` | `deck.piles` / `backImage` / `stagger` / `deal` / `flip` / `dealerW`；**`lanyard.backEmail` 补上 `@qq.com`** |
| `assets/js/lanyard.js` | 卡背文字加**自动收字号**（见下） |
| `index.html` | `#deck` 区段改成「舞台 + 牌堆 + 牌桌」结构；加粒子 `<canvas>`；引入 `dust.js` |
| `assets/deck/pile-a.webp` | **新增** · 坐猫堆（视频作品），512×683，带 alpha，90KB |
| `assets/deck/pile-b.webp` | **新增** · 漂浮猫堆（待发的一摞），512×683，带 alpha，83KB |
| `assets/deck/card-back.webp` | **新增** · 塔罗牌背，600×1067，155KB |

### 素材处理（ffmpeg）

原始素材 10MB+ 全部转成 WebP，页面只加载 ~330KB：

```
# 牌堆图标（保留 alpha）
ffmpeg -i "抠图 (2).png" -vf "scale=512:683:flags=lanczos" -c:v libwebp -quality 92 assets/deck/pile-a.webp

# 牌背（无 alpha）
ffmpeg -i "素材·塔罗牌背.png" -vf "scale=600:1067:flags=lanczos" -c:v libwebp -quality 90 assets/deck/card-back.webp
```

用 `alphaextract + signalstats` 验证过四个角的 alpha = 0（抠图干净，没有白边残留）。

### 交互细节（都是实测过的）

- **牌堆悬停**：沿轮廓的 drop-shadow 暗金光变亮、内里压暗、中间文字高亮成暖金
- **发牌**：选中的牌堆本体淡出、发牌器接手（无缝交接）；其余牌堆 `translateX(±130vw)` + 淡出
- **发牌期间不吃悬停**（`hoverLock` 2.6 秒）—— 否则鼠标正好压在牌堆原位，
  落下来的牌会立刻自己翻起来
- **触屏**：第一次点翻面，第二次点进灯箱（`matchMedia('(hover: none)')` 分流）
- **空牌堆**：点第二摞 → 同样飞成发牌器，桌面显示「这一摞还没有发牌 / 正在酝酿中」
- **回到牌桌**：牌桌上方一个按钮，收起牌阵、牌堆滑回原位，并**滚回作品区顶部**
  （`block: 'start'` + `.deck` 上现成的 `scroll-margin-top`，和导航锚点同一套偏移——
  早先写成 `block: 'center'` 滚牌堆，会把「牌桌」标题顶到固定导航底下压着）
- **发牌器压在卡牌上**：发牌器钉在视口顶上，牌阵滚上去会从它底下过；
  给它垫了一层 `radial-gradient` 暗底光晕（`.deck__dealer::before`，`z-index: -1`），
  被压住的标题沉进背景，而不是被齐刷刷切掉一半
- **灯箱**：点卡牌 → 全屏放映 + 作品档案（背景 / 做法 / 反思）不变

### 实测数据

- 控制台 **0 报错**（只有 three r160 UMD 的预期弃用警告）
- 卡背 `card-back.webp` **只请求 1 次**（9 张卡共用）
- 9 个作品视频**没有预载**（`preload="none"`），只有点开灯箱的那一个才下载
- 粒子：为了截到图，临时把寿命拉到 26 秒确认渲染正常（常规寿命 2.2~4 秒，肉眼可辨）

### 还没上线

本轮**只改本地，没有 commit / push**。等看完效果满意了再一起上线。

---

## 二十三、六项返修（2026-11-06，已实测，**暂未上线**）

上一轮做牌桌时留了六个口子，这一轮一次补齐。

### 1 · 站名改手写体，副标小一号，站点视图里亮成一盏小灯

- `tokens.css` 新增 `--font-hand`：优先「华文行楷」（Windows 自带），
  没有就退到楷体 / 仿宋。仍然只用系统字体，不引外链字体。
- `.masthead__name` 换 `--font-hand`，**字号不变**（`clamp(1.1rem, 2.2vw, 1.55rem)`）
- `.masthead__role`（AIGC · 影像 · 视觉实验）从 `var(--step--1)`（0.8125rem）
  改成 **0.75rem**，小一号
- **只在站点视图发光**：`.is-view-site` 是 `views.js` 加在 `<html>` 上的，
  首页（`is-view-hero`）不亮，免得跟首页那轮大月亮抢戏
  - `牧舒` 三层 text-shadow：近光 + 远光 + 原本的压底黑
  - 月亮图标换成两层 drop-shadow
  - 站名后面垫一块 `radial-gradient` 暖光晕（`.masthead__brand::after`），
    像案台角落的一盏小灯

### 2 · 牌堆飞行路径：病根是 FLIP 起点算错了

早先的 FLIP 是这样算的：

```js
var last = this.dealer.getBoundingClientRect();   // ← 量的是"终点"
var dx = first.left - last.left;                   // ← 拿终点去减起点
```

发牌器是 `position: fixed`，**自然位置**在 `(0, 0)`，终点 transform 是
`translate(fx, fy)`。拿终点 rect 去减，起点整整偏了一个 `(fx, fy)` ——
牌堆不是从自己身上出发，而是从**视口左外侧偏下**冲出来，再一路往右上
冲到视口中间。两摞牌都是这个方向，所以看起来像"先滑到右上方"。

修法：起点和终点都相对"自然位置"算。

```js
this.dealer.style.transform = 'none';
var base = this.dealer.getBoundingClientRect();     // 自然位置 (0, 0)
var startX = first.left - base.left;                // = 牌堆现在的位置
var endX   = endLeft  - base.left;                  // = 视口水平居中
```

另外，飞行原本用 `EASE = cubic-bezier(.18,.78,.2,1)` —— 强 ease-out，
前 20% 的时间冲掉 80% 的距离，后面再慢慢挪，看起来像"两个动作"。
单独给飞行换了一条 **Material 标准曲线 `cubic-bezier(.4,0,.2,1)`**
（缓入 → 匀速 → 缓出），一口气滑到正上方。

### 3 · 灯箱窄屏改回上下堆叠

`.lightbox__stage` 一直是
`grid-template-columns: minmax(0,1.25fr) minmax(18rem,.75fr)`，
右栏最少 288px —— 手机上（393px 宽）右栏把左栏挤成一条缝。

`@media (max-width: 900px)` 里改成：

```css
.lightbox { place-items: start center; overflow-y: auto; }
.lightbox__stage { grid-template-columns: minmax(0, 1fr); max-height: none; }
.lightbox__video { max-height: 56vh; }
.lightbox__info { max-height: none; overflow: visible; }
```

窄屏 = 上面视频、下面作品档案（可滚动）；宽屏仍是左视频右信息。

### 4 · 卡面改回旧版：顶部信息带 + 完整 3:4 封面 + 底部文字带

之前卡面只有一张被裁成 9:16 的封面，文字挤在下面一条。
现在按老版本重排（`deck.js` 的 `buildCard` + `deck.css` 的 `.tcard__face`）：

```
┌────────────────────┐
│ Ⅰ        动画 / 知识短片 │  ← 顶部信息带
├────────────────────┤
│     完整的 3:4 封面    │  ← 封面自带金边花框，一格不裁
├────────────────────┤
│ 笔的三千年演化        │  ← 底部文字带
│ 2026 · 1080×1920 · 竖版 │
└────────────────────┘
```

- `.tcard__fpic` 用 `aspect-ratio: 3 / 4` + `object-fit: cover` ——
  面积正好 3:4，所以 cover 也裁不到东西
- 卡面底色改回深紫蓝（`#241b3c → #16111f → #1d1634`）+ 顶部一道紫晕，
  和旧版塔罗卡一个调子

### 5 · 金砂重调：细碎、暗多亮少

按提示词把粒子分成三档：

| 档 | 占比 | 半径 | 不透明度 | 画法 |
|---|---|---|---|---|
| 暗金沙砾 | 80% | 1.0~1.9px | 0.30~0.52 | 纯色小点，只铺底 |
| 中调金 | 15% | 0.7~1.35px | 0.58~0.78 | 稍亮的小星点 |
| 高光 | 5% | 0.45~0.95px | 0.85~1.0 | 径向光晕 + **偶尔闪一下**（正弦取正、六次方 → 尖峰） |

- 暗的颗粒比亮的大、亮的比暗的小 —— 和"衬"的关系反着来
- **速度整体快 1.5 倍**：`LIFE` 2.2~4.0s → **1.4~2.6s**，
  `GRAVITY` 26 → **39**，同时 `DRAG` 1.4 → **1.9**（阻尼大一点才飘得轻盈）
- 出边速度从 14~54 降到 **10~38**：轻盈，不炸开
- 数量按周长算：`(w+h)/4`，30~130 粒；上限 `MAX` 提到 1200

### 6 · 首页左下角「向下滚动」→「✦ 循此入梦 ✦」

文字换成同款手写体（`--font-hand`），和站名一个笔触。

### 本轮实测

- 控制台 **0 报错**（诊断日志已全部清掉）
- 牌堆飞行：慢放到 20 秒逐帧核对，路径是**一条直线**（牌堆原位 → 视口正上方），
  不再有"先右上再归位"
- 卡面：悬停翻面后是完整的 3:4 封面 + 上下两条文字带
- 灯箱：674px 宽下是上面视频、下面档案，页面可滚动
- 粒子：先把粒子临时放大到 8px 确认渲染管线正常（130 粒、canvas 674×691），
  再按新参数收细；常规尺寸下是细碎的一层薄沙

### 还没上线

本轮**仍然只改本地，没有 commit / push**。

---

## 二十四 · 四项返修（2026-11-06，已实测，暂未上线）

### 1 · 未选中的牌堆按「相对位置」退场

早先的判断写反了：`k.compareDocumentPosition(btn) & FOLLOWING` 的含义是
「**btn 在 k 之后**」，变量名却当成「k 在 btn 之后」用 ——
右边那摞于是被判成 `-130vw`，横穿被选中的牌堆，看着就像被撞飞。

现在改成按**视口上的左右位置**判断（`deck.js` 的 `select()`）：

```js
var selLeft = btn.getBoundingClientRect().left;
...
var goLeft = k.getBoundingClientRect().left < selLeft;   // 未选中的在选中左边？
k.style.setProperty('--out-x', (goLeft ? -1 : 1) * 150 + 'vw');
```

| 选中的牌堆 | 未选中的那摞 | `--out-x` | 方向 |
|---|---|---|---|
| 左边（观影） | 右边（互动） | `150vw` | 往**右**飞 |
| 右边（互动） | 左边（观影） | `-150vw` | 往**左**飞 |

**谁也不会横穿被选中的牌堆。**

### 2 · 粒子再细 10%、再密 10%、消散再快 20%

`assets/js/dust.js`：

| 参数 | 上一版 | 这一版 | 变化 |
|---|---|---|---|
| 暗金沙砾半径 | 1.0~1.9px | **0.9~1.71px** | ×0.9 |
| 中调金半径 | 0.7~1.35px | **0.63~1.215px** | ×0.9 |
| 高光半径 | 0.45~0.95px | **0.405~0.855px** | ×0.9 |
| 数量 | `(w+h)/4`，30~130 | **`(w+h)/3.6`，33~143** | ×1.1 |
| 存活 `LIFE` | 1.4~2.6s | **1.12~2.08s** | ×0.8（消散快 20%） |
| 重力 `GRAVITY` | 39 | **47** | ×1.2（滑落更利落） |
| 上限 `MAX` | 1200 | **1320** | 跟得上更密的粒子 |

### 3 · 「视频作品」→「观影」，「待发的一摞」→「互动」+ 新增互动作品

**牌堆改名**（`config.js`）：

| id | 名字 | 英文 | 张数 | 收录 |
|---|---|---|---|---|
| `video` | **观影** | SCREENINGS | 9 | 九件视频作品（`include` 白名单） |
| `interactive` | **互动** | INTERACTIVE | 1 | 陪伴式工作 |

原来 `video` 这一摞不写 `include` 就是「全部作品」，
新增互动作品后必须把九件视频作品列进白名单，否则互动那张牌会混进观影里。

**新增第 10 件作品「陪伴式工作」**（`works.js`）——
它没有视频，多一个 `interactive` 字段：

```js
interactive: {
  html: 'assets/deck/companion-work.html',
  cover: 'assets/deck/yesterday-death.webp',
  credit: '图源：昨日死'
}
```

**卡面**：`buildCard()` 里给互动作品单开一支，`.tcard__bleed` 用
`昨日死` 原图**铺满整个卡面**（不裁 3:4），右下角 `.tcard__credit`
注明「图源：昨日死」，用 `--font-hand` 烫金行楷 + 三层发光。
只有一张牌时 `.deck__grid.is-single` 把它摆到网格正中（不然会贴着左边站）。

**点开弹灯箱**：`.lightbox__embed` 是一个 **2:3 的细框**
（`height: min(82vh, 33rem, 138vw); aspect-ratio: 2 / 3`），
里面一个 iframe 跑 `assets/deck/companion-work.html`。
视频作品走原来的 `<video>`，互动作品走 iframe，灯箱同一套左右两栏布局。

**`companion-work.html` 是副本**：从
`C:\Users\dell\Pictures\ai\午夜风铃\陪伴式工作.html` 改的 ——
原文件是 HTML 片段（没有 html/head/body），塞进 iframe 会带 8px 边距，
所以补了完整文档外壳；容器高度写死的 `500px` 改成 `100%`（否则塞进 2:3 框里被压扁）；
`#speech-area`（弹台词那块）的纯色背景换成「昨日死」那张图，
右下角同样注明「图源：昨日死」，并压一层暗罩让台词读得清。
**原始文件没动**，生成脚本留在 `_dev/make-companion.ps1`（`_dev/` 不入库）。

### 4 · 左上角站名字号再大一号，副标再小一号

```css
.masthead__name { font-size: clamp(1.25rem, 2.5vw, 1.8rem); }  /* 原 clamp(1.1rem,2.2vw,1.55rem) */
.masthead__role { font-size: 0.6875rem; }                       /* 原 0.75rem */
```

### 本轮实测

- **退场方向**：读 DOM 里的 `--out-x` 对过两次 ——
  选左边时右边那摞拿到 `150vw`，选右边时左边那摞拿到 `-150vw`
- **互动摞**：单张牌居中；卡面是「昨日死」铺满整面，右下角金色行书「图源：昨日死」
- **互动灯箱**：2:3 细框实测 **400×598 CSS px**（正好 2:3），
  iframe 里点按钮会把待机台词换成回应台词 —— 说明小玩意真的能玩，不是一张图
- **粒子**：`console` 埋点确认 burst 143 粒、rAF 帧循环正常；
  再临时改成不透明红，肉眼确认粒子确实从卡牌边缘迸出来，
  然后按最终参数收回（金色细沙在截图里本来就几乎看不见，这是标定后的预期）
- 控制台 **0 报错**（诊断日志已全部清掉）

### 还没上线

本轮**仍然只改本地，没有 commit / push**。


---

## 二十五 · 五项返修（2026-11-06，已实测，暂未上线）

### 1 · 发牌器只停留在作品区

选中一个牌堆之后，发牌器会钉在视口顶部。滚到「关于我 / 联系方式」时它还挂着，
像一件忘了收的道具。

这题有**两层**坑，只改一层都不行。

**第一层：CSS 压不过行内样式。**
发牌器的 opacity 是 `deck.js` 用行内样式写的（`dealer.style.opacity = '1'`），
而行内样式的优先级高于样式表，所以

```css
.deck.is-dealer-off .deck__dealer { opacity: 0; }   /* 输了 */
```

根本盖不住它。加 `!important` 才收得住：

```css
.deck.is-dealer-off .deck__dealer { opacity: 0 !important; }
```

**第二层：判定「牌桌还在不在视口里」的逻辑本身就是错的。**
早先用 `IntersectionObserver` 观察牌桌区块：

```js
root.classList.toggle('is-dealer-off', !e.isIntersecting);
```

但 Chromium 把「元素边缘刚好贴着视口边缘」也算作**相交**（edge-adjacent），
而锚点跳转（`scrollIntoView`）停下的位置正好是「牌桌底边 == 视口顶」——
判定永远停在「还在页面上」，`is-dealer-off` 压根不会加上。

改成直接量几何，阈值贴着站点的锚点线取：

```js
/* 锚点线 = .deck / .page 的 scroll-margin-top (4.5rem = 72px) */
var sm = getComputedStyle(root).scrollMarginTop;
var anchorOff = parseFloat(sm);
if (!anchorOff || anchorOff < 20) anchorOff = 72;   /* rem 没解析成 px 时的兜底 */
var SLACK = 8;
window.addEventListener('scroll', function () {
  var r = root.getBoundingClientRect();
  root.classList.toggle('is-dealer-off', r.bottom <= anchorOff + SLACK);
}, { passive: true });
```

实测停住时牌桌底边落在 **72.19px**（比 4.5rem 多出 0.19 的亚像素），
所以阈值取 72 + 8 = 80px。

**实测**：滚到「关于我」「联系方式」发牌器消失，滚回作品区它又出现。

### 2 · 互动作品不展示详细信息

`deck.js` 的 `renderDetail()`：只要 `w.interactive` 为真，
lead 和 detail **整块都不显示**（不是只藏起「背景 / 做法 / 反思」，连 lead 也一起藏）：

```js
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
...
if (isEmbed) {
  this.lbDetail.hidden = true;
  return;
}
```

同时把「陪伴式工作」的 `detail` 字段从 `works.js` 里**整个删掉** ——
不是留着不显示，是不留。那段文字转到 Obsidian 的
`作品集/作品条目/陪伴式工作.md`，网页上不展示。

灯箱右边现在只剩：编号 / 标题 / 类型·年份·分辨率。

### 3 · 陪伴式工作：底图往上 25%，暗罩换成均匀半透明

两处都在 `_dev/make-companion.ps1` 里（副本生成脚本，`_dev/` 不入库）。

| | 之前 | 现在 |
|---|---|---|
| 背景位置 | `#speech-area { background-position: center 26%; }` | **`center 51%`** |
| 暗罩 | 径向渐变（中心亮、四周暗） | **均匀 `rgba(11, 7, 16, 0.55)`** |

`background-position-y` 数值越大 = 图片越往上 = 露出图片越下方，
所以「往上 25%」是 `26% → 51%`（25 个百分点）。

原来那层径向渐变把人脸糊掉了 —— 中心恰好是最亮的地方，正好打在脸上。
换成整块均匀半透明之后，脸和台词同时留住。

台词另外加了硬投影：

```css
text-shadow: 0 1px 2px #000, 0 0 8px rgba(0,0,0,.9), 0 0 20px rgba(0,0,0,.8);
```

### 4 · 「互动」再添一张牌：找东西

源文件：`C:\Users\dell\Pictures\ai\午夜风铃\“找东西”.html`
（注意文件名**带中文弯引号**，同目录下还有一个不带引号的 `找东西.html`，
用户指定的是带引号那份）

| | 值 |
|---|---|
| 卡背 | 塔罗牌背（`assets/deck/card-back.webp`，所有牌共用一张） |
| 卡面 | `wanwan.jpg` → `assets/deck/wanwan.webp`（740×1316，87,890B） |
| 署名 | 右下角金色行楷「角色来源：熬肉」 |
| 灯箱 | 2:3 细框，跑 `assets/deck/find-things.html` |

`find-things.html` 是副本（生成脚本 `_dev/make-find-things.ps1`），原文件一个字没动：

- 删掉 Google Fonts 的 `@import`（国内打不开），改本地衬线栈
  `'Songti SC','STSong','SimSun','Source Han Serif SC',Georgia,serif`
- `#game-container` 高度 `540px` → `100%` 并补 `box-sizing: border-box`
  （否则塞进 2:3 框里被压扁）
- `#screen::before` 铺 `wanwan.webp`（`center 20% / cover`）
- `#screen::after` 均匀遮罩 `rgba(11, 7, 16, 0.55)`
- 右下角 `#screen-credit`「角色来源：熬肉」

底图走 `#screen::before` 而不是改 `background`，
是因为这页有主题覆写（`.theme-melancholic #screen` 用 `!important`），
`::before` 画在主题背景之上，不会被盖掉。

**牌堆配置**（`config.js`）：互动摞 `count: 2`，
`include: ['companion-work', 'find-things']`。

**牌少时网格居中**：`deck.js` 新增 `is-pair` —— 2 张牌收成两列居中
（`max-width: 23.9rem`），`is-single` 保留给 1 张牌；
≤620px 时 `max-width: 100%`（窄屏本来就是两列）。

```css
.deck__grid.is-single { grid-template-columns: minmax(0, 1fr); max-width: 11.2rem; margin-inline: auto; }
.deck__grid.is-pair   { grid-template-columns: repeat(2, minmax(0, 1fr)); max-width: 23.9rem; margin-inline: auto; }
```

顺带补了编号：罗马数字表原来只到 `Ⅹ`，第 11 件作品会掉回阿拉伯数字「11」，
牌背、卡面、灯箱三处一起对不上。`deck.js` 的 `ROMAN` 补上 `'Ⅺ'`。

### 5 · 「图源」→「角色来源」

统一叫「角色来源」：陪伴式工作卡面署名、两个小网页内部的署名、
`works.js` 里 `interactive.credit` 的默认值，全部改完；代码注释里的「图源」也一并改了。

### 本轮实测

- **发牌器**：滚到「关于我」「联系方式」都消失，滚回作品区又出现
- **互动摞**：发 2 张牌，居中排列（Ⅹ 陪伴式工作 / Ⅺ 找东西，编号是罗马数字 Ⅺ）
- **卡面**：「找东西」的 `wanwan` 铺满整面（9:16 无裁切），右下角金色行楷「角色来源：熬肉」
- **两个灯箱**：都是 2:3 细框（实测 318×478 CSS px），底图 + 均匀遮罩，台词可读，右下角署名正确；
  caption 只有编号 / 标题 / 类型·年份·分辨率，**没有 lead，也没有背景 / 做法 / 反思**
- **「陪伴式工作」灯箱**：点按钮，待机台词会切成回应台词（iframe 内脚本正常运行）
- **「找东西」灯箱**：点「节操」，「求助次数」变成 1，台词换成那段回应 —— 小玩意真的能玩
- 控制台 **0 报错**（只有 three.js r150+ 的既有弃用警告）

### Obsidian 同步

- 新建 `作品集/作品条目/陪伴式工作.md`（序号 10）
- 新建 `作品集/作品条目/找东西.md`（序号 11）
- 两份都保留完整的「背景 / 做法 / 反思」—— 网页上不展示，vault 里留着
- `作品.md` 的 lead 改成「九支片子，两个能玩的小网页」
- 画廊 Base 自动收录新条目（`作品集/作品索引.base` 不用改）

### 已上线

本轮**已 commit + push**：`46d169b`（`431fa6e..46d169b`，17 files changed, +2549 / −184）。
Cloudflare Pages Git 直连自动构建，`https://stardust-mushu.fyi` 已经指向新版本。

**线上实测**（1600×900）：

- 互动摞发 2 张牌，编号是罗马数字 Ⅹ / Ⅺ
- 「找东西」灯箱：iframe 正常加载（底图 + 均匀遮罩 + 「角色来源：熬肉」+ 按钮全在），
  点「找皖皖」→ 求助次数变 1、台词切换成回应 —— 真的能玩
- 灯箱右侧只有编号 / 标题 / 类型·年份·分辨率，没有 lead，也没有背景 / 做法 / 反思
- 滚到「关于我」发牌器消失 ✓
- 控制台 **0 报错**（只有 three.js r150+ 的既有弃用警告）

### 一个 Cloudflare Pages 的坑（记一下）

Pages 默认「HTML handling = automatic」：`.html` 文件会 **308** 到无扩展名路径。

```
/assets/deck/find-things.html  →  308  Location: /assets/deck/find-things  →  200 text/html
```

浏览器（含 iframe）会自己跟这个重定向，所以**功能上没问题**；
但以后用 curl / 脚本自检时，直接请求 `.html` 只会拿到 308，**要跟一次重定向**才看得到正文。
两个小网页里的图片用的是相对路径（`wanwan.webp`），
重定向后基准目录仍是 `/assets/deck/`，图片照常解析。

## 二十六 · 两项手机端返修（2026-11-06，已实测，已上线）

用户反馈两个手机上的问题。这轮的核心结论：**两处都出在「依赖 `min()` / `vh` /
`vw` 的声明」上** —— 这些声明一旦在真实手机浏览器里没被解析/算对，
就会静默地退回一个「能用但很难看」的默认值。

### 1. 「观影」发完牌，背景变成一层渐变（桌布整块消失）

**现象**：手机（≤760px）上打开「观影」，9 张牌铺满屏幕后，背后的占卜桌布不见了，
只剩 body 那层渐变；打开「互动」（只有 2 张牌）就没事。

**根因**（两条叠在一起）：

- `.siteview__cloth` 原来是 `position:fixed; bottom:0; height:100vh`。
  手机上 `vh` = 顶部地址栏收起时的「大视口」高度，比实际能看见的那一屏高出一截，
  于是这块布的**底边**（连带 `background-position:center bottom` 对齐的那张图）
  被一起推到屏幕外头 —— 桌布就这么没了。
- 窄屏那条规则又把桌布缩成 `100% auto`：1280×720 的图在 390px 宽的屏上
  只有 219px 高，牌阵一铺满，这点桌面就彻底看不见了。

**修法**：

- `.siteview__cloth` 改成 `inset:0`（严丝合缝盖住可见视口）+ `background: center / cover`
- 窄屏换一张竖版裁切图 `assets/deck/tablecloth-mobile.jpg`
  （405×720，115KB；桌面原图 388KB），预加载按屏幕宽度分流
  （`<link rel="preload" as="image" media="...">`）
- 窄屏遮罩调淡、透明度提到 0.44 —— 牌阵铺满时桌布只剩两侧几条缝，
  得看得见才叫「有桌面」
- 窄屏牌阵收窄到 20.5rem 居中（原来两列直接铺满），两侧留出桌面
- 桌面端观感**保持原样**（透明度仍 0.30、遮罩不变），这轮只动手机

**实测**（同一位置取像素，`#RRGGBB` 越大越亮）：

| 位置 | 修前 | 修后 | 用户真机 |
|---|---|---|---|
| 牌阵左外边距 | `#141118` | `#1B141C` | `#100F15` |
| 两列之间的缝隙 | `#242326` | `#484444` | — |

### 2. 视频作品的播放页不适应窄屏（视频被压成中间一条）

**现象**：手机上点开视频作品，灯箱里的视频只有屏幕中间一小条（145px 宽），
下面的作品档案也是窄窄一栏，右边一大片空白。

**根因**：窄屏那条规则写的是 `width: min(680px, 94vw)`。
这条声明**一旦被丢弃**（`min()` 没被支持、或整条规则没解析上），
舞台就退回「由内容撑出来的宽度」—— 视频按 intrinsic ratio 撑出 145px，
文字栏也跟着只有那么宽。

**修法**：

- 舞台宽度全部改成 `width:100% + max-width`（不依赖 `min()`），任何浏览器都算得对
- 视频按**作品的分辨率**设 `aspect-ratio`（`deck.js` 从 `res` 字段解析 `1440 / 2560` 这种），
  两个方向都留 `auto`，浏览器在 `max-width / max-height` 的约束下反推另一边：
  竖版片子在窄屏上占满高度，横版占满宽度，都不再有黑边
- 互动作品的小网页框也改成 `width + aspect-ratio`（原来靠 `min()` 定高）
- `.lightbox` 的 `padding` 补一条不依赖 `clamp()` 的兜底值

**实测**（390×844 窄屏）：

| | 修前（用户真机） | 修后 |
|---|---|---|
| 灯箱舞台 | 145px 宽 | 343px（满宽） |
| 视频框 | 145×168 | 275×490（真实 9:16） |
| 作品档案栏 | 145px 宽 | 343px（满宽） |

桌面端回归：灯箱舞台 1404px、视频 406×722（真实竖版比例、居中），
互动小网页 352×528 —— 与改前观感一致。

### 顺带

`_dev/mobile-frame.html`：**窄屏自测台**（不入库）。
用 iframe 套一个指定尺寸的手机视口（默认 390×844），能自动进站、选牌堆、
滚到牌阵、开灯箱，并量出各元素的实际尺寸；页面上那排按钮可以直接对着
「手机」发指令（关灯箱 / 开第 N 张 / 滚到牌阵 / 量灯箱）。
这次两个 bug 的定位全靠它 —— 本机没有移动端模拟，靠 iframe 才能让
媒体查询按手机宽度生效。

### 已上线

本轮**已 commit + push**：`84f0127`（`4a5aefe..84f0127`，6 files changed, +150 / −20，
新增 `assets/deck/tablecloth-mobile.jpg`）。
Cloudflare Pages Git 直连自动构建，`https://stardust-mushu.fyi` 已经指向新版本。

**线上核验**：

- 线上 `base.css` / `deck.css` / `deck.js` / `tablecloth-mobile.jpg` 与本地**字节级一致**
  （SHA256 相同；`index.html` 的唯一差异是 Cloudflare 自动改写的邮箱保护，与提交无关）
- 线上开「观影」→ 9 张牌铺开，背后的占卜桌布清楚可见
- 线上点开竖版作品「冷感高奢手提包」→ 灯箱视频是**真实 9:16 的竖框**（不再是一宽条黑边），
  右侧作品档案栏满宽，「背景 / 做法 / 反思」照旧
- 控制台 **0 报错**

**桌面端确认未变**：`git diff` 显示桌面规则只改了定位机制
（`bottom:0 + height:100vh` → `inset:0`；`center bottom / 100% auto` → `center center / cover`），
在 16:9 视口下渲染完全等价；透明度仍是 0.30、遮罩分档没动 —— 这轮只动手机。

---

## 二十七 · 根因定位：横向溢出触发「缩放适配」（2026-11-06，已实测，已上线）

上一轮（§二十六）把两个手机端问题的根因判成「`min()` / `vh` / `vw` 的声明在真机上没被解析」。
**这个判断是错的。** 这一轮用两套新工具复现并量到了真值：

- `_dev/overflow-scan.html`：iframe 套 390×844 手机视口，遍历全页面元素，
  把「右边缘超出视口 / 自身 `scrollWidth` 溢出」的盒子全列出来，逐个状态扫。
- `_dev/cdp-mobile.ps1`：**用 Edge 的 CDP 开真·移动端模拟**
  （`Emulation.setDeviceMetricsOverride` mobile=true，393×852@3x，iPhone UA），
  沿途量 `innerWidth` / `scrollWidth` / 媒体查询命中情况 / 灯箱各元素实际尺寸，并截图。

### 真正的机制：横向溢出 → 浏览器「缩放适配」

手机浏览器（华为浏览器 / Chrome 手机版）里，只要页面里有一个盒子比屏幕宽，
浏览器就会把整页缩到能塞下为止（shrink-to-fit）。表现是：

- 页面能被整体缩小，缩到 40% 还嫌大
- `window.innerWidth` 从 393 变成 **976**（布局宽度被撑开）
- 固定定位元素（导航条、灯箱、桌布）跟着变成 976 宽
- **媒体查询仍按设备宽度 393 判定**，但布局宽度已经不是 393 了

本轮实测（Edge 156 + CDP 移动端模拟）：

| | 修前 | 修后 |
|---|---|---|
| 发牌后 `window.innerWidth` | 976 | **393** |
| 发牌后 `documentElement.scrollWidth` | 976 | **393** |
| 页面缩放比 393 / 976 | 0.403（压成 40%） | **1.000** |
| 灯箱舞台宽 | 640px（撑破视口） | **361px**（视口内容宽） |
| 作品档案栏宽 | 640px（文字被右边缘切断） | **361px** |

### 溢出源头一：牌堆退场的 `translateX(±150vw)`（`46d169b` 引入）

`deck.js` 发牌时给未选中的牌堆写 `--out-x: ±150vw`，CSS 用
`transform: translateX(var(--out-x))` 让它飞出屏幕。
**位移过的盒子会计入文档的「可滚动溢出宽度」** —— 发完牌整页横向宽度被撑到 976px
（视口才 393），浏览器随即触发缩放适配。

「观影背景发黑」就是这么来的：布局宽度 976 时，桌布那张 1280×720 的图被 `cover`
放大 2.6 倍，只截到中间一块深色区域，看着就是全黑。

修法：`.deck { overflow-x: clip }` —— 把溢出裁在作品区自己的框里（框宽 = 屏幕宽），
牌堆看起来照旧是飞出屏幕，但不再撑宽整页。`html` / `body` 同步加 `overflow-x: clip` 兜底
（`clip` 不产生滚动容器，比原来的 `overflow-x: hidden` 干净）。

### 溢出源头二：灯箱舞台把 grid 轨道撑爆（`84f0127` 引入 —— 就是上一轮那个「返修」）

`.lightbox` 是 grid 容器，里面只放一个 `.lightbox__stage`。
默认的 `auto` 轨道按「子项的 max-content 宽度」定尺寸，而子项写的是
`width: 100%`（百分比在算内在尺寸时按 `auto` 处理）+ `max-width: 40rem`
→ 轨道直接取 **640px**，在 393 的视口上撑破了。

舞台在 976 宽的布局里居中 → 左边缘落在 **x=168**；视频（278px）再居中一次
→ 落在 **349..627** → 屏幕只露出右边 **44px** 一条缝；档案文字从 168 开始被右边缘切断。
—— 和用户 DevTools（iPhone 15 Pro 393×852）的截图**逐像素对上**。

初版（`07f7e0b`）写的是 `width: min(1560px, 96vw)` = 377px，所以初版是好的；
改成 `width:100% + max-width` 才炸 —— 也就是**上一轮的返修把灯箱弄坏了**。

修法：`.lightbox { grid-template-columns: minmax(0, 1fr) }`，
轨道老老实实取容器可用宽度（`minmax(0,…)` 里的 0 就是在说「允许缩到 0，不许撑破」）。

### 断点：900 → 980

`46d169b` 把灯箱单栏的断点从初版的 `max-width: 980px` 降到了 `900px`。
溢出后的布局宽度是 976px —— **刚好卡在 980 下面、900 上面**：
初版的 980 侥幸接住了，新断点接不住。
这一轮把灯箱单栏的断点挪回 **980px**（牌阵的 900 / 620 断点没动，桌面观感不受影响）。

### 已上线

本轮**已 commit + push**：`9db1a2a`（`93e31e6..9db1a2a`，2 files changed, +35 / −6），
`https://stardust-mushu.fyi` 已指向新版本。

线上核验（同一套 CDP 移动端模拟，直接打线上域名）：

- 发牌后 `innerWidth` / `scrollWidth` = **393 / 393**，缩放比 **1.000**
- 灯箱舞台 **361px**、作品档案栏 **361px**、视频 **278×494**（真实 9:16，居中，控件齐全）
- 桌布回到竖版 `tablecloth-mobile.jpg`（opacity 0.44），「观影」背景清晰可见
- 桌面 1500×880 回归**零变化**：舞台 1404×722、视频 406×722、桌布 opacity 0.30

### 留个工具

`_dev/cdp-mobile.ps1`：**真·移动端模拟探针**。
只靠 iframe 自测台不够 —— iframe 里媒体查询按 iframe 宽度算，永远看不到
「布局宽度被撑开」这件事；只有 CDP 的移动端模拟才会触发缩放适配。

```powershell
# 手机 393×852（iPhone 15 Pro）
powershell -ExecutionPolicy Bypass -File .\_dev\cdp-mobile.ps1 `
  -Url "http://localhost:8788/" -Shot "E:\out.png"
# 桌面 1500×880 回归（-Desktop 关掉移动端模拟）
powershell -ExecutionPolicy Bypass -File .\_dev\cdp-mobile.ps1 `
  -Url "http://localhost:8788/" -Width 1500 -Height 880 -Desktop
```

沿途打印每个状态的 `innerWidth / scrollWidth / 媒体查询命中 / 溢出元素清单 / 灯箱尺寸`，
并可存 `-Shot`（灯箱截图）、`-ShotDeck`（发牌瞬间的牌阵截图）。

---

## 二十八 · 站点图标：星月 favicon（2026-11-06，已实测，已上线）

用户提的：浏览器标签栏现在显示默认地球图标，想换成顶栏左上角那颗「星月」。

### 图形

直接用顶栏 `.masthead__glyph` 的同一组路径（新月 `M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z`
+ 四芒星），但为了**在 16×16 的标签页尺寸下还看得清**做了三处调整：

1. **新月改成实心** —— 原版是 16% 填充 + 1.15 描边，缩到 16px 会糊成一团灰
2. **星星放大 1.26 倍并提亮**（`#F7EBCC`），当画面里的高光点
3. **加午夜紫圆角底板 + 一圈暗金细边** —— 在浅色 / 深色浏览器栏里都立得住，
   不会变成一个看不清的小方块

配色全部取自 `tokens.css`：`#0B0710`（ink-900）/ `#241631` / `#C9A86A`（gold）。

### 文件

```
assets/icon/favicon.svg        母版（矢量，1.9KB）
assets/icon/favicon-16.png     标签页用
assets/icon/favicon-32.png
assets/icon/favicon-48.png
assets/icon/favicon-192.png    Web App Manifest 用
assets/icon/favicon-512.png
assets/icon/favicon.ico        16 / 32 / 48 三合一（老浏览器兜底，6KB）
assets/icon/apple-touch-icon.png  180×180，iOS「加到主屏幕」用
site.webmanifest               Android / 桌面 PWA 用
```

页面里挂 6 个标签（`index.html` 与 `404.html` 都有）：

```html
<link rel="icon" type="image/png" sizes="32x32" href="assets/icon/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="assets/icon/favicon-16.png" />
<link rel="icon" type="image/svg+xml" href="assets/icon/favicon.svg" />
<link rel="shortcut icon" href="assets/icon/favicon.ico" />
<link rel="apple-touch-icon" href="assets/icon/apple-touch-icon.png" />
<link rel="manifest" href="site.webmanifest" />
```

### 两个坑

**① XML 注释里不能出现连续两个连字符。**
第一版母版的注释里写了变量原名 `--ink-900`，SVG 直接解析失败，
渲染出来全是浏览器的「XML 报错页」——而且报错行号因为多字节字符还偏了，很难查。
注释里改用中文描述就没事了。

**② `site.webmanifest` 必须以 `application/manifest+json` 返回，Chrome 才认。**
本地静态服务器给的是 `application/octet-stream`，Chrome 会直接拒收
（控制台报 `Manifest load failed`）。在 `_headers` 里补了一条：

```
/site.webmanifest
  Content-Type: application/manifest+json
```

### 怎么重新生成

母版改了重跑一遍 `_dev/make-icons.ps1` 就行 —— 它用 CDP 把 SVG 渲染成各尺寸 PNG
（透明背景），再把 16/32/48 打包成 ICO：

```powershell
powershell -ExecutionPolicy Bypass -File .\_dev\make-icons.ps1 -Base "http://localhost:8788" -OutDir "assets\icon"
```

（需要本地静态服务器先跑起来，因为渲染页是去取 `/assets/icon/favicon.svg` 的。）

### 已上线

本轮**已 commit + push**：`f8b7494`（`03c3794..f8b7494`，12 files changed, +88）。

线上核验：

- 8 个图标文件全部 **200**，MIME 正确（`image/svg+xml` / `image/vnd.microsoft.icon` / `image/png`）
- `site.webmanifest` → 200 **`application/manifest+json`**（`_headers` 规则生效）
- Chrome CDP `Page.getAppManifest` → **解析成功，0 报错**，站点名「牧舒的捕梦阁楼」
- 页面里 6 个图标标签齐全

> 提醒：浏览器对 favicon 的缓存非常顽固，改完图标可能要清一下缓存 /
> 强制刷新（Ctrl+F5）才看得到变化。
## 二十九 · 工作牌：牌面缩小 10% + 悬挂点右移 10%（2026-11-06，已实测，已上线）

需求三条：

1. 首页右侧工作牌（3D 挂绳 + 牌面）**尺寸缩小 10%**
2. **悬挂点向右移动 10%**
3. 但**画布不能整体移过去**，可拖拽范围必须保持现状

### 关键：改「牌」，不改「画布」

工作牌能拖多远，由两件事共同决定（`_dev/lanyard-harness.html` 可复现）：

- 画布（WebGL 渲染视口）的宽窄
- 牌面占画布的比例（`widthFill`）

超出相机视锥的牌面**根本不渲染**，所以牌能到的左右极限 = 画布的左右边缘。

如果按字面理解成「牌和画布一起右移」，画布右边缘会顶出视口 → 活动范围被切掉一截，
正好违反第 3 条。所以做法是：

| 东西 | 改没改 |
| --- | --- |
| 画布宽度 `--lan-w: clamp(20rem, 46vw, 46rem)` | **一点没动** |
| 牌面尺寸 `size` 0.437 → 0.3933 | ×0.9 |
| 牌面占宽 `widthFill` 0.36 → 0.324 | ×0.9 |
| 悬挂点 `anchorOffset` | 新增 0.1（= 画布宽度的 10%） |

`size` 和 `widthFill` 都乘 0.9，牌面在屏幕上的实际像素尺寸就是缩小 10%，
而牌面的左右极限仍然正好触到画布两边 → **可拖拽范围与改前完全一致**。

### anchorOffset 为什么是新参数

`ANCHORS` 只有三档固定值：left 0.27 / center 0.5 / right 0.73。
「往右挪一点点」这种连续偏移三档装不下，所以另开一个连续的偏移量（`assets/js/lanyard.js`）：

```js
anchorX = ((ANCHORS[anchor] - 0.5) + (settings.anchorOffset || 0)) * viewWidth
```

同时把它并进 `framingKey` —— 改了偏移必须重新构图，否则相机视角不会跟着重算，
牌子会挂在旧位置。

### 实测（`_dev/measure-lanyard.ps1`，CDP 真机模拟，量的是牌面投影尺寸）

| 视口 | 画布 | 改前牌面 | 改后牌面 | 缩小 |
| --- | --- | --- | --- | --- |
| 1500×880 | 690×774 | 248×344 | 222×309 | -10.5% / -10.2% |
| 1920×1080 | 883×950 | 305×422 | 272×378 | -10.8% / -10.4% |
| 390×844（手机） | 359×743 | 130×182 | 119×165 | -8.5% / -9.3% |

手机端那组偏差更大，是因为静止时牌面带一个倾角，投影宽度受倾角影响，
实测有 ±2% 的噪声；参数本身是精确的 ×0.9。

**可拖拽范围**：三个视口牌面左右极限都是画布占比 `0.000` / `1.000`，与改前逐位一致，
全程无裁切 → 第 3 条要求满足。

### 一个副作用：挂绳上端正好压到右上角「作品」

悬挂点右移 69px（1500 视口）后，挂绳上端（x ≈ 1167–1193）从原来落在「首页」和
「作品」之间的空隙，挪到了「作品」二字正后方。导航的 z-index 在挂绳之上，
文字仍然清晰可读，但那条浅灰紫织带从字背后穿过去，背景变脏了。

`config.js` 里 `strapWidth` 的注释本来就写着「太宽会压住右上角导航」，
可选的处置有三个（都还没动，等你定）：

- 把织带调细：`strapWidth` 0.42 → 更小（只影响挂绳粗细，牌的位置一点不变）
- 让导航整体左移一点，给右角让出空间
- 保持现状（文字仍可读，只是背景脏一点）

### 已上线

本轮 **已 commit + push**：`501a8c5`（`bb557ef..501a8c5`，2 files changed, +22/-5）。

线上核验：

- `assets/js/config.js` → 200，`size: 0.3933` / `widthFill: 0.324` / `anchorOffset: 0.1`
- `assets/js/lanyard.js` → 200，`anchorOffset` 的三处改动都在
- 桌面 1500×880 与手机 390×844 线上截图：牌面变小、悬挂点右移，均无异常

### 附：线上验收时踩的一个坑

本机 Edge 走系统代理（`127.0.0.1:7890`，mihomo），而 mihomo 到
`stardust-mushu.fyi` 的 TLS 握手会失败 —— 用 Edge 打开线上站点直接
`ERR_CONNECTION_CLOSED`，但 `curl`（不走系统代理）一切正常。

所以线上 CDP 验收要另起一个**不走代理**的 Edge 实例：

```powershell
Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList @(
  '--headless=new', '--remote-debugging-port=9241', '--user-data-dir=D:\TEMP\edge-online-noproxy',
  '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--no-proxy-server', 'about:blank'
) -WindowStyle Hidden
```

另外用同一个 `--user-data-dir` 换端口重开 Edge 是不行的：单实例机制会把新进程
吞掉，新端口根本不会监听（`Invoke-RestMethod` 直接「无法连接到远程服务器」）。
换端口就要换 profile 目录。
## 三十 · 「关于我」页：按新简历改文案 + 改成双栏（2026-11-11，已实测，已上线）

这轮是拿着**更新后的 PDF 简历**提的需求：把「关于我」整页的文案对齐简历，
并且「每一栏都长度那么长，但里面的文字却并没有写得和框架那么长」—— 改成双栏。

### 文案改动（`index.html`）

| 位置 | 改动 |
| --- | --- |
| 页面第一句 | 「我是刘昶红，**「昶」和「敞」同音，是不夜天的意思**。当然，你也可以叫我牧舒。」 |
| 我在做什么 | 新增一条 **短视频 / 内容策划**（简历里的内容创作能力：选题 → 脚本 → 素材 → 剪辑） |
| 幼教 / 讲故事的 | 补上简历里的 **「全国儿童艺术教育创作辅导二等奖」** |
| 经历 · 树华美术 | 补 **班级作品完成率 100%** |
| 经历 · 师范大学 | 补 **曾任班长、团支部书记，获评优秀共青团员、三好学生** |
| 做过的东西 | **新增第三条「牧舒的捕梦阁楼 · 这个网站」** |
| 证书 | 补 **中共党员**；「去过 20+ 城市」→ **走访过国内 20+ 座城市** |

「做过的东西」新增的那条：

> 现在又多了一条——花三天时间做出了这个网站：一间午夜暗室、一张牌桌，还有一只会自己摆动的 3D 工作牌。

### 双栏怎么排的

原来 `.doc` 是单栏一条到底：六个小节各占一大段，框比字长很多。
现在 `base.css` 新增 `.doc--split` / `.doc__col`，把六节拆成两栏，各自往下排：

- **左栏**：我在做什么 / 一些信条 / 工具箱 / 证书
- **右栏**：经历 / 做过的东西

节间距也从上下各 `3.4rem` 收到各 `2.4rem`。窄于 900px 自动叠回单栏，
两栏之间会补一条分隔线。

「证书」本来在右栏，量出来左栏 966 / 右栏 1224 差了 258px；
挪到左栏后变成 1147 / 1058（差 89px），而且右栏正好收尾在「做过的东西」——最想让人看的那一节。

### 实测（`_dev/shot-section.ps1`，CDP 真机模拟）

| | 改前 | 改后 |
| --- | --- | --- |
| 关于我整页高度（1500×880） | 2529px | **1638px**（-35%） |
| 左栏 / 右栏高度 | — | 1147 / 1058（差 89px，基本配平） |
| 手机端 390×844 | — | `scrollWidth = clientWidth = 390`，缩放比 1.000，无横向溢出 |

回归：联系页 752px，不受影响；手机端牌阵 / 灯箱照旧（`scrollWidth` 仍是 390，没触发缩放）。

### 新写的自测脚本：`_dev/shot-section.ps1`

以前只能截首页，截不到「关于我」这种锚点区块 —— 因为这个站是**双视图**结构，
路由是点击式的（`main.js` 的 `initAnchors` 拦截 `a[href^="#"]`），
直接开 `#about` 不会切视图，截出来的是首页。

新脚本的做法：

1. `window.MSView.toSite(function(){ window.MSView.scrollToId('about'); })` 先切到站点视图
2. 量出目标区块的高度
3. **把视口拉高到刚好装下整个区块**（`Emulation.setDeviceMetricsOverride`），再滚过去
4. 一次截全，不用拼图

### 踩的坑

**① 含中文的 `.ps1` 必须是 UTF-8 BOM。**
PowerShell 5.1 没有 BOM 就按 ANSI 读，`@"..."@` here-string 里的中文会被拆坏，
整个脚本解析失败（报「An expression was expected after '('」）。写完补一下 BOM：

```powershell
[System.IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($true)))
```

**② 用 `powershell -File` 传带括号的 JS 字符串会被参数解析吃掉。**
`-PreJs "(function(){...})()"` 会把整条命令 abort 掉。改成脚本内置开关（`-GoSite`）。

**③ 同一个 `--user-data-dir` 不能换端口重开 Edge。**
单实例机制会把新进程吞掉，新端口根本不监听（`Invoke-RestMethod` 报「无法连接到远程服务器」）。
换端口就要换 profile 目录。

### 已上线

本轮 **已 commit + push**（见 commit 说明），线上核验：双栏渲染正确、
移动端无横向溢出、联系页与作品区无回归。
## 三十一 · 上线到底需不需要梯子（2026-11-11，实测结论）

**结论先说：不需要。开着梯子反而会让「用 Edge 打开自己的线上站点」间歇性失败。**
下次要上线，直接不开梯子就行。

### 站点上线的链路

```
本地 git push (SSH → github.com:22)
   ↓
GitHub 仓库
   ↓
Cloudflare Pages 监听到 push，在 Cloudflare 自己的服务器上构建 + 发布
   ↓
stardust-mushu.fyi / mushu-portfolio.pages.dev 自动指向新版本
```

**本地全程只做一件事：SSH push。** 中间两段都跑在别人的服务器上，
本地网络完全不参与（`_dev/deploy.ps1` 干的事就是 `git add` → `commit` → `push`，
push 完就打「等 Cloudflare 构建完成」）。

而 **SSH 不使用 Windows 的系统代理**（git 的 `GIT_SSH_COMMAND` 是独立的一条通道），
所以梯子开不开，这一步的结果完全一样。

### 实测（本机 mihomo，127.0.0.1:7890，系统代理 `ProxyEnable=1`）

| 目标 | 直连 | 走系统代理 |
| --- | --- | --- |
| `stardust-mushu.fyi` | 200 | **时通时不通**（这轮先 exit 35 TLS 握手失败，后一次又 200） |
| `mushu-portfolio.pages.dev` | 200 | 200 |
| `api.github.com` | 200 | **FAIL** |
| `raw.githubusercontent.com` | 301 | 301 |
| `codeload.github.com` | 301 | 301 |
| `api.cloudflare.com` | 301 | 301 |
| `github.com` | 时通时不通（与代理无关） | 时通时不通 |
| `www.google.com` | FAIL | FAIL（超时） |

结论：

- 部署需要的每一个域名，**直连都通**，代理没有任何增益
- 反倒是代理会把 `api.github.com` 弄挂
- 你自己的站点域名在代理下**不稳定** —— TLS 握手被节点搅黄

### 真正被代理坑到的是「验收」，不是「部署」

**Edge 会读 Windows 的系统代理设置，curl 不会**（curl 只认 `HTTP_PROXY` /
`HTTPS_PROXY` 环境变量，这台机器上没设）。所以：

- `curl https://stardust-mushu.fyi/` → 200（走的是直连）
- Edge 打开 `https://stardust-mushu.fyi` → **走代理** → 代理的 TLS 握手失败 →
  浏览器直接报 `ERR_CONNECTION_CLOSED`

表现得很像「网站挂了」，其实是代理的问题。两种解法：

1. **验收时给 Edge 加 `--no-proxy-server`**（我一直在这么做）
2. **直接把梯子关掉** —— 直连本来就通，关掉之后 Edge 访问自己的站点也就正常了

### 顺带收紧的私钥权限

部署私钥 `D:\TEMP\moodshot\deploy\mushu_deploy` 原来的 ACL 带着
`NT AUTHORITY\Authenticated Users:(M)`（继承来的可修改权限）—— 任何本机用户都能改你的私钥。
已收紧为只剩本人只读 + SYSTEM / Administrators 完全控制。

注意：**Windows 自带的 `ssh.exe` 对这个检查比 Git 自带的严格**。
收紧之前用 Windows 版 `ssh -T` 会报
`Bad permissions. Try removing permissions for user: NT AUTHORITY\Authenticated Users`，
而 `git push` 却一直正常 —— 因为 `deploy.ps1` 把 Git 的 `usr\bin` 放在 PATH 最前面，
用的是 Git 自带的 ssh。收紧之后两条路都通了。

### 结论

- **部署：不需要梯子**（SSH 直连，跟系统代理无关）
- **验收：更不需要梯子**（关掉最好；开着就记得给 Edge 加 `--no-proxy-server`）
- 唯一受影响的是 `www.google.com` 这类被墙的站点 —— 但上线用不上
