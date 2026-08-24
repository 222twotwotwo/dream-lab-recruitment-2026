import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [
    vue({
      // Vapor Mode：无虚拟 DOM 的编译产物，加速渲染。
      features: { vapor: true },
    }),
  ],
});
