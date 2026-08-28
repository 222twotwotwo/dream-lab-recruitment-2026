<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { footerContent } from "../data/content";
import { createDlabFluid, type DlabFluid } from "../anime";

/**
 * 固定页脚揭示（抽屉式）：页脚 position: fixed 沉底，主内容（.page-shell）
 * 作为不透明上层掠过其上，滚到页尾即完整抽出。DLAB 字标为 canvas 渲染，
 * 像素流体扰动委托 src/anime/dlab-fluid（组件只持状态与引用）。
 */
const canvasRef = useTemplateRef<HTMLCanvasElement>("wordmark");
let fluid: DlabFluid | undefined;

onMounted(() => {
  if (canvasRef.value) fluid = createDlabFluid(canvasRef.value);
});

onUnmounted(() => {
  fluid?.destroy();
  fluid = undefined;
});
</script>

<template>
  <footer :class="$style['footer']" aria-label="页脚">
    <div :class="$style['meta']">
      <p :class="$style['brand']">
        {{ footerContent.brand }}
        <span :class="$style['tagline']">{{ footerContent.tagline }}</span>
      </p>
      <a :class="$style['topLink']" href="#top">{{ footerContent.backToTop }}</a>
    </div>
    <canvas
      ref="wordmark"
      :class="$style['wordmark']"
      role="img"
      :aria-label="footerContent.wordmarkAria"
    ></canvas>
    <span class="sr-only">{{ footerContent.wordmark }}</span>
  </footer>
</template>

<style module src="../styles/SiteFooter.module.css"></style>
