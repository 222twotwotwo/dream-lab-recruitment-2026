<script setup lang="ts">
const stats = [
  { label: '主办方', value: '逐梦创新实验室' },
  { label: '面向对象', value: '全校大一新生' },
  { label: '活动周期', value: '2026.09 — 2027.02' }
];
</script>

<template>
  <header id="hero" class="hero">
    <div class="hero-bg" aria-hidden="true">
      <img :src="'./images/bg-hero.jpg'" alt="" />
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">逐梦创新实验室 · 2026 秋季学期</p>
      <h1 class="hero-title">逐梦之夏</h1>
      <p class="hero-sub-en">DREAM IN SUMMER, BUILD THE FUTURE</p>
      <p class="hero-slogan">课题项目招标 · 学习意愿考核 · 人才招募与项目孵化</p>
      <p class="hero-desc">
        以项目招标为入口、以学习考核为标尺、以人才招募为目的、以项目孵化为主线——
        让你在真实课题中学习、试错、产出，实验室在过程中观察、筛选、孵化。
      </p>
      <div class="hero-actions">
        <q-btn unelevated no-caps color="accent" href="#join" class="btn q-px-xl">浏览课题 · 立即申请</q-btn>
        <q-btn outline no-caps color="secondary" href="#flow" class="btn btn-ghost q-px-xl">了解流程 <i class="arr q-ml-sm">↓</i></q-btn>
      </div>
    </div>
    <div class="hero-stats">
      <div v-for="s in stats" :key="s.label" class="stat">
        <i>{{ s.label }}</i><b>{{ s.value }}</b>
      </div>
    </div>
    <div class="scroll-hint" aria-hidden="true"><span></span></div>
  </header>
</template>
