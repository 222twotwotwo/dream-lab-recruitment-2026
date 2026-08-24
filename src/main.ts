import { createVaporApp, type VaporComponent } from "vue";
import App from "./App.vue";
import "./styles/global.css";

// SFC 的类型 shim 不携带 vapor 标记，运行时由 vite 插件编译为 vapor 组件
createVaporApp(App as unknown as VaporComponent).mount("#app");
