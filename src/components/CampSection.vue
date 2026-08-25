<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
import CampCarousel from "./CampCarousel.vue";
</script>

<template>
  <section id="camp" :class="$style['camp']" class="section" aria-labelledby="camp-title">
    <SectionHeading
      eyebrow="Algorithm camp"
      title-id="camp-title"
      title="算法训练营：从刷题到赛场的真实训练密度"
      tone="cream"
    >
      往届算法训练营采用线上刷题任务、线下公开课、以赛促学的组合模式，把零散自学变成有任务、有复盘、有比赛目标的长期训练。
    </SectionHeading>
    <CampCarousel />
  </section>
</template>

<style module src="../styles/CampSection.module.css"></style>

