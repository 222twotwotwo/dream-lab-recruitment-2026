# 逐梦创新实验室 2026 秋季招新网站

静态单页招新网站（Vue 3.6 Vapor Mode + TypeScript + Vite 重写版），内容来自招新文案与《2026秋季逐梦实验室招新企划书》。

## 技术栈

- Vue `3.6.0-rc.5`（Vapor Mode：无虚拟 DOM 编译，全部 SFC 以 vapor 产物输出）
- TypeScript（严格模式）+ `vue-tsc` 类型检查
- Vite 8 + Bun 包管理
- Three.js（运行时动态 import，独立分包懒加载）
- 动画层基于原生 Web Animations API（不再依赖 anime.js CDN），统一响应 `prefers-reduced-motion`

## 命令

```bash
bun install        # 安装依赖
bun run dev        # 开发服务器
bun run build      # 类型检查 + 生产构建（输出 dist/）
bun run preview    # 预览生产构建
```

## 部署

`vite.config.ts` 使用 `base: "./"`，构建产物为相对路径，可直接部署到 GitHub Pages 仓库子路径（配合 `.nojekyll`）。

## 结构

- `index.html`：Vite 入口
- `src/main.ts`：`createVaporApp` 挂载
- `src/App.vue`：页面骨架与滚动显现观察器
- `src/components/`：各区块组件（导航、英雄区 + Three.js 场景、轮播、跑马灯、方向切换等）
- `src/data/content.ts`：招新方向、企业去向、训练营照片、彩蛋等文案数据
- `src/motion.ts`：WAAPI 动画助手与滚动显现
- `src/styles/global.css`：全局样式（自原版迁移）
- `public/assets/`：图片与 logo 静态资源

## 相对原版的逻辑修复

- 修复 `</br>` 非法标签 → `<br />`
- 企业跑马灯：布局尺寸就绪前自动滚动停摆后，现在会随 ResizeObserver 重新测量并恢复滚动（原版会永久停住）
- 英雄区 Three.js 场景：卸载时完整释放（RAF、监听器、几何体、材质、纹理、渲染器），原版存在泄漏；移除不必要的 `preserveDrawingBuffer`
- 方向切换：点击「开发组」回到上次选中的细分方向，不再总是重置为「前端」
- 报名区 Alice 立绘：`.apply-copy img` 为绝对定位但原版没有任何定位祖先，图片一直锚定到文档顶部；现给 `.apply-section` 建立 `position: relative`，立绘正确落在卡片左下角（移动端右下角）
- 彩蛋与动态文案全部数据驱动，不再有 innerHTML 注入面
