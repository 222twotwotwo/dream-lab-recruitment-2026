import { createVaporApp, type VaporComponent } from "vue";
// 全局基座必须先于组件导入：后导入的组件 CSS Modules 需要在同权重级联中胜出
// （如 .section 的 padding 不得覆盖各区块模块的 padding 变体）
import "@fontsource/zcool-qingke-huangyou";
import "./styles/global.css";
import App from "./App.vue";

// SFC 的类型 shim 不携带 vapor 标记，运行时由 vite 插件编译为 vapor 组件
createVaporApp(App as unknown as VaporComponent).mount("#app");
