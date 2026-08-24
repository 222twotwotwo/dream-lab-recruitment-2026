<script setup lang="ts">
import CampCarousel from "./CampCarousel.vue";
</script>

<template>
  <section id="camp" class="section camp-section" aria-labelledby="camp-title">
    <div class="section-heading">
      <p class="eyebrow">Algorithm camp</p>
      <h2 id="camp-title">算法训练营：从刷题到赛场的真实训练密度</h2>
      <p>
        往届算法训练营采用线上刷题任务、线下公开课、以赛促学的组合模式，把零散自学变成有任务、有复盘、有比赛目标的长期训练。
      </p>
    </div>
    <CampCarousel />
  </section>
</template>
