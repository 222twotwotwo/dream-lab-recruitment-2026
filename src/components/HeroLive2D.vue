<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useCssModule } from "vue";
import { mountLive2D, type Live2DHandle } from "../anime/live2d";
import { heroLive2D } from "../data/content";
import { prefersReducedMotion } from "../anime/effects";

const $style = useCssModule();

const rootRef = ref<HTMLElement | null>(null);
const loading = ref(true);
const failed = ref(false);
let handle: Live2DHandle | null = null;

onMounted(() => {
  const root = rootRef.value;
  if (!root) return;

  const start = (): void => {
    mountLive2D({
      container: root,
      modelUrl: heroLive2D.modelUrl,
      reducedMotion: prefersReducedMotion.matches,
      onReady: () => {
        loading.value = false;
      },
    })
      .then((h) => {
        handle = h;
      })
      .catch((err) => {
        console.error("[HeroLive2D] mountLive2D 失败：", err);
        failed.value = true;
        loading.value = false;
      });
  };

  // 空闲时再挂载，避免与英雄区入场动画抢首帧
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (ric) ric(start, { timeout: 1500 });
  else window.setTimeout(start, 200);
});

onUnmounted(() => {
  handle?.dispose();
  handle = null;
});
</script>

<template>
  <div :class="$style['live2d']" data-hero-live2d>
    <div :class="$style['glow']" aria-hidden="true"></div>
    <div ref="rootRef" :class="$style['stage']" aria-hidden="true"></div>
    <p v-if="loading && !failed" :class="$style['loading']">Live2D 角色加载中…</p>
    <p v-if="failed" :class="$style['fallback']">Live2D 模型加载失败，请检查资源路径</p>
  </div>
</template>

<style module src="../styles/HeroLive2D.module.css"></style>
