# AGENTS.md — 逐梦创新实验室 2026 招新站

面向在本仓库工作的编码代理。改动前先读这里；与直觉冲突时以本文件为准。

## 技术栈（不要降级或替换）

- **Vue `3.6.0-rc.5` + Vapor Mode**：`@vitejs/plugin-vue` 配 `features: { vapor: true }`，所有 SFC 编译为 vapor 产物。挂载用 `createVaporApp`（`src/main.ts`，App 需 `as unknown as VaporComponent` 断言——SFC 类型 shim 不携带 vapor 标记，属已知现状，勿"修复"）
- **包管理：Bun**（`bun install` / `bun add`，锁文件 `bun.lock`）
- **TypeScript 5.9 严格模式**：`tsconfig.app.json` 开启 `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noPropertyAccessFromIndexSignature`。不要放松任何选项
- **Vite 8**，`build.cssMinify: "esbuild"`——**不要换回 lightningcss**（会删掉无前缀 `backdrop-filter`，毛玻璃在 Chromium 失效）
- Three.js 仅在 `HeroScene.vue` 内运行时 `import("three")` 动态加载，保持主包精简
- 字体：站酷庆科黄油体经 `@fontsource/zcool-qingke-huangyou` 自托管（unicode-range 子集按需加载），勿改为境外 CDN

## 命令

```bash
bun install       # 安装依赖
bun run dev       # 开发服务器
bun run build     # vue-tsc -b && vite build（类型检查是构建的一部分）
bun run typecheck # 仅类型检查
bun run preview   # 预览生产构建
```

完成任何改动的标准：`bun run typecheck` 零输出 + `bun run build` 通过 + 用浏览器实际打开验证（视觉/交互改动必须截图或驱动交互确认，不能只靠构建通过）。

## 动画规则（硬性）

- **所有动画必须以模块化单文件放在 `src/anime/` 下**，一个动画一个文件（如 `droplet.ts`、`hero-intro.ts`、`cta-pulse.ts`、`camera-dolly.ts`、`brand-collapse.ts`、`dlab-fluid.ts`、`direction-scroll.ts`、`direction-aurora.ts`），经 `src/anime/index.ts` 统一导出
- 组件只维护状态与 DOM 引用，**组件内不得内联 `animate()` 调用**；需要新动画就在 `src/anime/` 建新模块
- 动画引擎统一 anime.js v4（`import ... from "animejs"`）；不要引入其他动画库，不要回退到原生 WAAPI/CSS transition 做补间（纯 CSS hover 过渡除外）
- 一切补间动画必须尊重 `prefersReducedMotion`（`src/anime/effects.ts`）
- 滚动联动（非补间）的连续插值用 CSS 变量 + `calc()` 驱动（参考顶栏 `--header-float` 模式），这类不属于 anime 补间
- 连续物理模拟与 3D 场景（`HeroScene` 的 three.js、方向页 `direction-aurora.ts` 的 WebGL 极光、页脚 `dlab-fluid.ts` 像素流体）走各自 rAF 渲染循环，不经 anime.js；静止即停循环零开销

## 结构

```
src/
  anime/            动画中心（见上，一个动画一个文件）
  components/       区块组件，一个区块一个文件；样式经 <style module src> 引用
  components/SectionHeading.vue  区块标题（eyebrow/标题/导语，深色底用 tone="cream"）
  components/TracksSection.vue  招新方向区块：桌面 sticky 舞台 + 滚动驱动横向轨道，竖屏退化原生横滑
  components/DirectionNav.vue   方向导航：六按钮 + 进度条指示当前项（竖屏缩排、隐藏进度条）
  components/DirectionCard.vue  单个方向卡片（立方体视觉 + 描点 + 详情）
  data/content.ts   全部文案数据（方向/企业/照片/彩蛋），改文案来这里
  styles/           global.css 全局基座（设计令牌 :root、元素重置、.button 等跨组件原语）+ 各组件的 <Name>.module.css
  main.ts           createVaporApp 入口
public/assets/      图片、logo、favicon（相对路径引用，base: "./"）
index.html          Vite 入口（title 与 favicon 在这里，改动别弄丢）
```

## CSS Modules（Vapor 注意事项）

- 每个组件的模块样式是 `src/styles/<Name>.module.css`，SFC 末尾一行 `<style module src="../styles/<Name>.module.css"></style>` 引用；跨组件共享的只有 global.css 里的原语（.button 系列、.eyebrow/.phase/.card-index、.section）
- **Vapor Mode 不会向模板注入 `$style`**（运行时 ReferenceError），每个用到的组件 script 里必须保留 `const $style = useCssModule()`，勿删
- 外部模块文件下 volar 按 `Record<string, string>` 推导 `$style`，模板里一律方括号访问 `$style['card']`（`noPropertyAccessFromIndexSignature` 禁止点访问）
- 模块内引用全局类用 `:global(.button)` 形式（如英雄区按钮标尺）
- 滚动显现目标以 `data-reveal` 属性标记（App.vue 统一收集 `[data-reveal]`）；类名已哈希，不要按类名查询组件内元素（跑马灯用 `track.children`）
- **导入顺序即级联顺序**：`main.ts` 里 `global.css` 必须先于 `App` 导入，否则 `.section` 等全局原语会同权重覆盖区块模块的 padding/margin 变体

## 设计令牌与主题

- 马卡龙色板定义在 `:root`：开心果 `--teal #8AAE6F`、草莓玫瑰 `--orange #E9899B`、薰衣草 `--violet #A98BD6`、柠檬 `--gold #E4C05C`、奶油纸 `--paper`、可可梅子墨 `--ink`；深色面板统一 `#3A2E3C`，英雄区夜空 `#2E2438`
- 圆角基准 5px（卡片）/ 4px（小药丸）；水滴指示器例外（999px，形态即水滴）
- 新颜色一律加为 `:root` 变量或复用现有变量，不要硬编码散落

## 关键机制（改动前先读懂）

- **顶栏悬浮**：`SiteHeader` 按滚动写入 `--header-float`（0→1），CSS 全部用 `calc()` 插值（位移/圆角/毛玻璃/字色含 67%→100% alpha）。首屏只有字样融入星空背景。锚线高亮判定会读取各区块的 `scroll-margin-top`
- **锚点落点**：区块默认对齐页面顶部（无 scroll-margin）；`#apply` 卡片例外（`ApplySection.module.css` 里 `scroll-margin-top: 72px` 避让顶栏）。改跳转行为时同步检查 `syncActiveNav` 的锚线判定
- **导航水滴**：`SiteHeader` 维护可见性/落位状态，动画委托 `src/anime/droplet.ts`
- **品牌字样收合**：品牌字体固定为站酷庆科黄油体，浮起前后不再切换字体；浮起时字号 +3px、末字向前逐字旋出只留「逐梦」（室→验→实→新→创），随 `--header-float` 双向擦洗（seek 回卷即逆操作），委托 `src/anime/brand-collapse.ts`；旋出的字宽度收合到 0，实体消失不拦截指针；断点字号变化与 webfont 加载完成后需重测字宽。注意 anime v4 时间轴默认创建即播放，此时间轴必须 `autoplay: false`，进度只由 seek 驱动
- **训练营轮播**：真实横向轨道（`.camp-track` 平移），2.5s 自动播放；手动操作后 5s 无操作自动恢复；悬停暂停；左右按钮仅悬停/聚焦图片时显示（触屏以拖拽代替）；指针拖拽跟手、相册式吸附（端点阻尼 + 位移/速度判定），见 CampCarousel 的 pointer 事件组
- **企业跑马灯**：卡片渲染两份，第二份 `aria-hidden`；`loopWidth` 未就绪时停摆，ResizeObserver 重新测量后自动恢复
- **固定页脚揭示（抽屉式）**：`SiteFooter` 沉底 `position: fixed`（z-index 0），主内容 `.page-shell` 作为不透明上层（z-index 1）掠过其上，滚到页尾完整抽出；`.page-shell` 底部留白恰好盖住页脚高度（`--footer-reveal-h` 随视口宽缩放、短窗按视口高封顶），锚点跳转不露出绿带。DLAB 字标经 canvas 离屏栅格化渲染，像素流体扰动委托 `src/anime/dlab-fluid.ts`：指针动量注入冲量（快甩大块位移、慢移微澜）、守恒甩出三级透明度档（1/0.7/0.45）、方向性阻力（往字身难撞、往字外顺畅飞出）、静止归位停循环；`prefersReducedMotion` 只画静态字标
- **招新方向横向轨道**：`TracksSection` 桌面端 `.stage` 为 sticky 全屏，`.track` 由纵向滚动进度经 CSS 变量 `--tracks-travel` / `--tracks-progress` 平移（calc 驱动，非 anime 补间）；卡片随滚动依次居中并触发 `playDirectionCardActive`/`Idle`（`src/anime/direction-scroll.ts`）。`DirectionNav` 六枚按钮 + `.progressTrack` 高亮当前项（`goTo` 滚到对应卡片）。背景极光为 WebGL 着色器（`src/anime/direction-aurora.ts`），叠色溢出用保色相软压缩避免纯白。竖屏（`orientation: portrait and max-width: 700px`）整体退化：`.track` 改 `overflow-x: auto` + scroll-snap，监听轨道 `scroll` 取居中卡片为当前项，`goTo` 直接 `scrollTo` 轨道，aurora 不初始化；`isMobile` 为非响应式 `let`，事件回调读取最新值，勿在模板绑定它
- **英雄区彩蛋**：`HeroSection` 读取 `window.location.hash`，归一化（decode + toLowerCase）后命中 `easterEgg.hashes`（`otto` / `♿` / `♿️`）即把标题/导语/配图切换为「滚木」彩蛋版（`src/data/content.ts` 的 `easterEgg`），监听 `hashchange` 实时切换、移除 hash 即恢复默认

## 约定

- 文案一律进 `src/data/content.ts`，不要在组件里散落字符串（含彩蛋 `#otto` / `#♿`）
- 提交信息用英文 conventional commits（feat/fix/refactor/...）
- 不要引入新运行时依赖；确有必要先说明理由
- 静态资源放 `public/assets/`，引用用相对路径 `./assets/...`
