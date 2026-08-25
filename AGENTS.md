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

- **所有动画必须以模块化单文件放在 `src/anime/` 下**，一个动画一个文件（如 `droplet.ts`、`hero-intro.ts`、`cta-pulse.ts`、`camera-dolly.ts`），经 `src/anime/index.ts` 统一导出
- 组件只维护状态与 DOM 引用，**组件内不得内联 `animate()` 调用**；需要新动画就在 `src/anime/` 建新模块
- 动画引擎统一 anime.js v4（`import ... from "animejs"`）；不要引入其他动画库，不要回退到原生 WAAPI/CSS transition 做补间（纯 CSS hover 过渡除外）
- 一切补间动画必须尊重 `prefersReducedMotion`（`src/anime/effects.ts`）
- 滚动联动（非补间）的连续插值用 CSS 变量 + `calc()` 驱动（参考顶栏 `--header-float` 模式），这类不属于 anime 补间

## 结构

```
src/
  anime/            动画中心（见上，一个动画一个文件）
  components/       区块组件，一个区块一个文件；样式经 <style module src> 引用
  components/SectionHeading.vue  区块标题（eyebrow/标题/导语，深色底用 tone="cream"）
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
- **锚点落点**：区块默认对齐页面顶部（无 scroll-margin）；`#apply` 卡片例外（`scroll-margin-top: 72px` 避让顶栏）。改跳转行为时同步检查 `syncActiveNav` 的锚线判定
- **导航水滴**：`SiteHeader` 维护可见性/落位状态，动画委托 `src/anime/droplet.ts`
- **品牌字样收合**：浮起时字号 +2px、末字向前逐字旋出只留「逐梦」，随 `--header-float` 双向擦洗（seek 回卷即逆操作），委托 `src/anime/brand-collapse.ts`；旋出的字宽度收合到 0，实体消失不拦截指针
- **训练营轮播**：真实横向轨道（`.camp-track` 平移），2.5s 自动播放；手动操作后 5s 无操作自动恢复；悬停暂停；左右按钮仅悬停/聚焦图片时显示（触屏以拖拽代替）；指针拖拽跟手、相册式吸附（端点阻尼 + 位移/速度判定），见 CampCarousel 的 pointer 事件组
- **企业跑马灯**：卡片渲染两份，第二份 `aria-hidden`；`loopWidth` 未就绪时停摆，ResizeObserver 重新测量后自动恢复

## 约定

- 文案一律进 `src/data/content.ts`，不要在组件里散落字符串（含彩蛋 `#otto` / `#♿`）
- 提交信息用英文 conventional commits（feat/fix/refactor/...）
- 不要引入新运行时依赖；确有必要先说明理由
- 静态资源放 `public/assets/`，引用用相对路径 `./assets/...`
