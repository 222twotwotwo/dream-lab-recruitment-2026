<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { campSlides, eventStrip } from "../data/content";
import { EASE_OUT_CUBIC, EASE_OUT_QUART, prefersReducedMotion } from "../motion";

/**
 * 训练营照片轮播：自动播放、悬停/聚焦暂停、键盘方向键、缩略图切换。
 */
const AUTO_INTERVAL = 5200;
const activeIndex = ref(0);
const rootRef = ref<HTMLElement | null>(null);
let timer = 0;

const reduceMotion = prefersReducedMotion.matches;

function setActive(index: number): void {
  const count = campSlides.length;
  activeIndex.value = ((index % count) + count) % count;

  if (reduceMotion || !rootRef.value) return;
  const slide = rootRef.value.querySelectorAll<HTMLElement>(".camp-slide")[activeIndex.value];
  const image = slide?.querySelector("img");
  if (!slide) return;
  slide.animate(
    [
      { opacity: "0", transform: "scale(1.012)" },
      { opacity: "1", transform: "scale(1)" },
    ],
    { duration: 520, easing: EASE_OUT_CUBIC },
  );
  image?.animate(
    [{ transform: "scale(1.045)" }, { transform: "scale(1)" }],
    { duration: 900, easing: EASE_OUT_QUART },
  );
}

function move(step: number): void {
  setActive(activeIndex.value + step);
}

function stopAuto(): void {
  if (timer) {
    window.clearInterval(timer);
    timer = 0;
  }
}

function startAuto(): void {
  if (reduceMotion || timer || campSlides.length < 2) return;
  timer = window.setInterval(() => move(1), AUTO_INTERVAL);
}

function onThumbClick(index: number): void {
  stopAuto();
  setActive(index);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stopAuto();
    move(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    stopAuto();
    move(1);
  }
}

onMounted(() => {
  const root = rootRef.value;
  if (!root) return;
  setActive(0);
  startAuto();
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);
  root.addEventListener("focusin", stopAuto);
  root.addEventListener("focusout", startAuto);
});

onUnmounted(stopAuto);

const slides = campSlides;
const thumbLabel = (index: number): string => `查看 ${slides[index]!.alt}`;
</script>

<template>
  <div class="camp-layout">
    <div
      ref="rootRef"
      class="camp-carousel"
      aria-label="往届算法训练营现场轮播"
    >
      <div
        class="camp-carousel-stage"
        tabindex="0"
        @keydown="onKeydown"
      >
        <figure
          v-for="(slide, index) in slides"
          :key="slide.src"
          class="camp-slide"
          :class="{ 'is-active': index === activeIndex }"
          :aria-hidden="index === activeIndex ? undefined : 'true'"
        >
          <img :src="slide.src" :alt="slide.alt" width="2275" height="1279" loading="lazy" />
          <figcaption>{{ slide.caption }}</figcaption>
        </figure>
        <button class="carousel-control carousel-control-prev" type="button" aria-label="上一张" title="上一张" @click="onThumbClick(activeIndex - 1)"></button>
        <button class="carousel-control carousel-control-next" type="button" aria-label="下一张" title="下一张" @click="onThumbClick(activeIndex + 1)"></button>
      </div>
      <div class="carousel-thumbs" aria-label="选择训练营照片">
        <button
          v-for="(slide, index) in slides"
          :key="slide.src"
          class="carousel-thumb"
          :class="{ 'is-active': index === activeIndex }"
          type="button"
          :aria-label="thumbLabel(index)"
          :aria-current="index === activeIndex ? 'true' : 'false'"
          @click="onThumbClick(index)"
        >
          <img :src="slide.thumbSrc ?? slide.src" alt="" width="2275" height="1279" loading="lazy" />
        </button>
      </div>
    </div>

    <div class="camp-copy">
      <article class="camp-callout">
        <span class="phase">往届训练方式</span>
        <h3>线上任务 + 线下公开课 + 以赛促学</h3>
        <p>
          历史训练营曾以周六晚 7:30 作为开营节点，本期具体时间以招新群通知为准。训练方案参考多校 ACM 教练经验分享，由师兄师姐在群内持续提供学习资源和答疑。
        </p>
      </article>
      <div class="camp-cards">
        <article class="camp-card">
          <h3>线上刷题任务</h3>
          <p>暂用牛客网、力扣、洛谷等 OJ 平台组织刷题与训练赛，后续可能逐步迁移到自研 OJ 平台。</p>
        </article>
        <article class="camp-card">
          <h3>每周算法公开课</h3>
          <p>往届公开课由计算中心主任曾国超老师主讲，围绕算法基础、竞赛思维和训练方法展开。</p>
        </article>
        <article class="camp-card">
          <h3>每周交流赛</h3>
          <p>线下日常训练设置交流赛，赛后复盘讨论，帮助同学把做题过程沉淀成可复用的解法。</p>
        </article>
        <article class="camp-card">
          <h3>每月逐梦杯</h3>
          <p>月度比赛按排名申请素拓、综合分等激励；若后续有赞助，还可能增设其他奖励。</p>
        </article>
      </div>
    </div>
  </div>

  <div class="event-strip" aria-label="算法训练营备赛方向">
    <span v-for="event in eventStrip" :key="event">{{ event }}</span>
  </div>
</template>
