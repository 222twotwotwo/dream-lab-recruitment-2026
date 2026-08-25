<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { campSlides, eventStrip } from "../data/content";
import { animate, prefersReducedMotion } from "../anime";

/**
 * 训练营照片轮播：自动播放、悬停/聚焦暂停、键盘方向键、缩略图切换。
 */
const AUTO_INTERVAL = 2500;
const activeIndex = ref(0);
const trackRef = useTemplateRef<HTMLDivElement>("track");
const rootRef = ref<HTMLElement | null>(null);
let timer = 0;

const reduceMotion = prefersReducedMotion.matches;

function setActive(index: number): void {
  const count = campSlides.length;
  activeIndex.value = ((index % count) + count) % count;

  const track = trackRef.value;
  if (!track) return;
  // 横向滚动切换：轨道平移一个视口宽
  if (reduceMotion) {
    track.style.transform = `translateX(${-activeIndex.value * 100}%)`;
    return;
  }
  animate(track, {
    x: `${-activeIndex.value * 100}%`,
    duration: 620,
    ease: "outCubic",
  });
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

// 手动切换后暂停，5 秒无操作自动恢复轮播
let resumeTimer = 0;
let hovered = false;

function clearResume(): void {
  if (resumeTimer) {
    window.clearTimeout(resumeTimer);
    resumeTimer = 0;
  }
}

function scheduleResume(): void {
  clearResume();
  if (reduceMotion) return;
  resumeTimer = window.setTimeout(() => {
    resumeTimer = 0;
    if (!hovered) startAuto();
  }, 5000);
}

function onThumbClick(index: number): void {
  stopAuto();
  setActive(index);
  scheduleResume();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stopAuto();
    move(-1);
    scheduleResume();
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    stopAuto();
    move(1);
    scheduleResume();
  }
}

function onMouseEnter(): void {
  hovered = true;
  stopAuto();
}

function onMouseLeave(): void {
  hovered = false;
  clearResume();
  startAuto();
}

onMounted(() => {
  const root = rootRef.value;
  if (!root) return;
  setActive(0);
  startAuto();
  root.addEventListener("mouseenter", onMouseEnter);
  root.addEventListener("mouseleave", onMouseLeave);
  root.addEventListener("focusin", stopAuto);
  root.addEventListener("focusout", () => {
    if (!hovered) startAuto();
  });
});

onUnmounted(() => {
  stopAuto();
  clearResume();
});

const slides = campSlides;
const thumbLabel = (index: number): string => `查看 ${slides[index]!.alt}`;
</script>

<template>
  <div :class="$style['layout']">
    <!-- 左列独立容器：图片 + tag 纵向排布，右列再高也顶不开 tag -->
    <div :class="$style['mediaCol']">
      <div
        ref="rootRef"
        :class="$style['carousel']"
        aria-label="往届算法训练营现场轮播"
      >
        <div
          :class="$style['stage']"
          tabindex="0"
          @keydown="onKeydown"
        >
          <div ref="track" :class="$style['track']">
            <figure
              v-for="(slide, index) in slides"
              :key="slide.src"
              :class="$style['slide']"
              :aria-hidden="index === activeIndex ? undefined : 'true'"
            >
              <img :src="slide.src" :alt="slide.alt" width="2275" height="1279" loading="lazy" />
              <figcaption>{{ slide.caption }}</figcaption>
            </figure>
          </div>
          <button :class="[$style['control'], $style['prev']]" type="button" aria-label="上一张" title="上一张" @click="onThumbClick(activeIndex - 1)"></button>
          <button :class="[$style['control'], $style['next']]" type="button" aria-label="下一张" title="下一张" @click="onThumbClick(activeIndex + 1)"></button>
        </div>
        <div :class="$style['thumbs']" aria-label="选择训练营照片">
          <button
            v-for="(slide, index) in slides"
            :key="slide.src"
            :class="[$style['thumb'], index === activeIndex && $style['thumbActive']]"
            type="button"
            :aria-label="thumbLabel(index)"
            :aria-current="index === activeIndex ? 'true' : 'false'"
            @click="onThumbClick(index)"
          >
            <img :src="slide.thumbSrc ?? slide.src" alt="" width="2275" height="1279" loading="lazy" />
          </button>
        </div>
      </div>

      <!-- 备赛方向 tag：置于“往届训练方式”之前，在左列内紧贴图片正下方，不被右列高度顶开 -->
      <div :class="$style['eventStrip']" aria-label="算法训练营备赛方向">
        <span v-for="event in eventStrip" :key="event">{{ event }}</span>
      </div>
    </div>
    <div :class="$style['copy']">
      <article :class="$style['callout']" data-reveal>
        <span class="phase">往届训练方式</span>
        <h3>线上任务 + 线下公开课 + 以赛促学</h3>
        <p>
          历史训练营曾以周六晚 7:30 作为开营节点，本期具体时间以招新群通知为准。训练方案参考多校 ACM 教练经验分享，由师兄师姐在群内持续提供学习资源和答疑。
        </p>
      </article>
      <div :class="$style['cards']">
        <article :class="$style['card']" data-reveal>
          <h3>线上刷题任务</h3>
          <p>暂用牛客网、力扣、洛谷等 OJ 平台组织刷题与训练赛，后续可能逐步迁移到自研 OJ 平台。</p>
        </article>
        <article :class="$style['card']" data-reveal>
          <h3>每周算法公开课</h3>
          <p>往届公开课由计算中心主任曾国超老师主讲，围绕算法基础、竞赛思维和训练方法展开。</p>
        </article>
        <article :class="$style['card']" data-reveal>
          <h3>每周交流赛</h3>
          <p>线下日常训练设置交流赛，赛后复盘讨论，帮助同学把做题过程沉淀成可复用的解法。</p>
        </article>
        <article :class="$style['card']" data-reveal>
          <h3>每月逐梦杯</h3>
          <p>月度比赛按排名申请素拓、综合分等激励；若后续有赞助，还可能增设其他奖励。</p>
        </article>
      </div>
    </div>
  </div>

</template>

<style module src="../styles/CampCarousel.module.css"></style>

