<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import { companies } from "../data/content";
import { animate, prefersReducedMotion, stagger } from "../anime";

/**
 * 实习就业去向横向跑马灯。
 * 相比原版修复：loopWidth 就绪前自动滚动暂停后，
 * 布局尺寸变化（图片加载等）会重新测量并恢复滚动，不再永久停摆。
 */
const trackRef = useTemplateRef<HTMLDivElement>("track");

const SPEED = 92; // px/s
let frame = 0;
let lastTime = 0;
let loopWidth = 0;
let observer: ResizeObserver | undefined;

function cardCount(): number {
  return companies.length;
}

function refreshLoopWidth(): void {
  const track = trackRef.value;
  if (!track) return;
  const cards = track.querySelectorAll<HTMLElement>(".company-card");
  const firstClone = cards[cardCount()];
  loopWidth =
    firstClone && cards[0]
      ? firstClone.offsetLeft - cards[0].offsetLeft
      : 0;
}

function stopAuto(): void {
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
  lastTime = 0;
}

function tick(now: number): void {
  const track = trackRef.value;
  if (!track || !loopWidth) {
    stopAuto();
    return;
  }
  if (!lastTime) lastTime = now;
  const elapsed = Math.min(now - lastTime, 64);
  lastTime = now;
  track.scrollLeft += (SPEED * elapsed) / 1000;
  if (track.scrollLeft >= loopWidth) {
    track.scrollLeft -= loopWidth;
  }
  frame = window.requestAnimationFrame(tick);
}

function startAuto(): void {
  if (prefersReducedMotion.matches || frame || !loopWidth) return;
  frame = window.requestAnimationFrame(tick);
}

function onResize(): void {
  refreshLoopWidth();
  // 修复：原版在 loopWidth 就绪后不会重新启动已停摆的循环
  startAuto();
}

onMounted(() => {
  const track = trackRef.value;
  if (!track || prefersReducedMotion.matches || cardCount() < 2) return;

  refreshLoopWidth();
  observer = new ResizeObserver(onResize);
  observer.observe(track);
  track.scrollTo({ left: 0, behavior: "auto" });

  // 与原版一致：入场动画只作用于原始卡片组
  const originals = [...track.querySelectorAll<HTMLElement>(".company-card")].slice(
    0,
    cardCount(),
  );
  animate(originals, {
    opacity: [0, 1],
    translateY: [12, 0],
    delay: stagger(55),
    duration: 420,
    ease: "outCubic",
  });

  startAuto();
});

onUnmounted(() => {
  stopAuto();
  observer?.disconnect();
});
</script>

<template>
  <div class="company-showcase" aria-label="实习就业品牌去向">
    <div class="company-viewport">
      <div ref="track" class="company-track" aria-label="实习就业去向自动轮播">
        <article
          v-for="(company, index) in [...companies, ...companies]"
          :key="`${company.name}-${index}`"
          class="company-card"
          :aria-hidden="index >= companies.length ? 'true' : undefined"
        >
          <span class="company-type">{{ company.type }}</span>
          <div class="company-logo-frame">
            <img :src="company.logo" :alt="company.logoAlt" loading="lazy" decoding="async" />
          </div>
          <h3>{{ company.name }}</h3>
          <p>{{ company.desc }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
