import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  // esbuild 压缩：lightningcss 会误删无前缀 backdrop-filter，只留 -webkit- 导致 Chromium 失效
  build: { cssMinify: "esbuild" },
  plugins: [
    vue({
      // Vapor Mode：无虚拟 DOM 的编译产物，加速渲染。
      features: { vapor: true },
    }),
  ],
});
