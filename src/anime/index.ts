/**
 * 动画中心：全站动画统一从 src/anime 引入。
 * - anime.js 原生 API 再导出（animate / stagger / spring / createTimeline）
 * - effects：通用入场与滚动显现
 * - droplet：导航水滴指示器
 * - brand-collapse：品牌字样浮起收合
 */
export * from "animejs";
export * from "./effects";
export * from "./droplet";
export * from "./hero-intro";
export * from "./cta-pulse";
export * from "./brand-collapse";
export * from "./camera-dolly";
