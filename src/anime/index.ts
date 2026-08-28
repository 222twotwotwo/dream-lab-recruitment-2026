/**
 * 动画中心：全站动画统一从 src/anime 引入。
 * - anime.js 原生 API 再导出（animate / stagger / spring / createTimeline）
 * - effects：通用入场与滚动显现
 * - droplet：导航水滴指示器
 * - brand-collapse：品牌字样浮起收合
 * - direction-aurora：方向页 WebGL 极光背景
 * - direction-scroll：方向页水平视差卡片切换
 * - dlab-fluid：页脚 DLAB 字标像素流体扰动
 * - live2d：英雄区 Live2D 角色层（PixiJS + pixi-live2d-display，自有 rAF）
 */
export * from "animejs";
export * from "./effects";
export * from "./droplet";
export * from "./hero-intro";
export * from "./cta-pulse";
export * from "./brand-collapse";
export * from "./camera-dolly";
export * from "./direction-aurora";
export * from "./direction-scroll";
export * from "./dlab-fluid";
export * from "./live2d";

