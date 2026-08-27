<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import type { Track, TrackKey } from "../data/content";

defineProps<{
  items: Array<Track & { key: TrackKey }>;
  activeIndex: number;
  labels: Record<TrackKey, string>;
  hint: string;
  progress: number;
}>();

defineEmits<{
  select: [index: number];
}>();
</script>

<template>
  <nav :class="$style['progress']" aria-label="招新方向切换">
    <button
      v-for="(track, index) in items"
      :key="track.key"
      :class="[$style['dot'], activeIndex === index && $style['dotActive']]"
      type="button"
      :aria-label="`切换到${track.title}`"
      :aria-current="activeIndex === index ? 'true' : undefined"
      @click="$emit('select', index)"
    >
      {{ labels[track.key] }}
    </button>
    <span :class="$style['progressTrack']" aria-hidden="true">
      <span
        :class="$style['progressFill']"
        :style="{ width: `${Math.round(progress * 100)}%` }"
      ></span>
    </span>
    <span :class="$style['progressHint']">{{ hint }}</span>
  </nav>
</template>

<style module src="../styles/DirectionNav.module.css"></style>