<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { easterEgg, heroDefaults } from "../data/content";
import { EASE_OUT_EXPO, fadeInUp, prefersReducedMotion } from "../motion";
import HeroScene from "./HeroScene.vue";

const title = ref(heroDefaults.title);
const lead = ref(heroDefaults.lead);
const media = ref(heroDefaults.media);

function getNormalizedHash(): string {
  const rawHash = window.location.hash.replace(/^#/, "");
  try {
    return decodeURIComponent(rawHash).trim().toLocaleLowerCase();
  } catch {
    // 非法百分号转义视作无关 hash
    return rawHash.trim().toLocaleLowerCase();
  }
}

function applyEasterEggState(): void {
  const isActive = easterEgg.hashes[getNormalizedHash()] === true;
  title.value = isActive ? easterEgg.title : heroDefaults.title;
  lead.value = isActive ? easterEgg.lead : heroDefaults.lead;
  media.value = isActive ? easterEgg.media : heroDefaults.media;
}

// 原版入场时间轴的错峰延迟（anime timeline 的重叠换算）
const INTRO_DELAYS = [0, 260, 640] as const;
const actionDelays = [980, 1090] as const;

onMounted(() => {
  window.addEventListener("hashchange", applyEasterEggState);
  applyEasterEggState();

  if (prefersReducedMotion.matches) return;

  const root = rootRef.value;
  if (!root) return;
  const kicker = root.querySelector<HTMLElement>(".hero-kicker");
  if (kicker) fadeInUp(kicker, { duration: 620, distance: 18 });
  const heading = root.querySelector<HTMLElement>(".hero h1");
  if (heading) fadeInUp(heading, { duration: 900, distance: 32, delay: INTRO_DELAYS[1], easing: EASE_OUT_EXPO });
  const leadEl = root.querySelector<HTMLElement>(".hero-lead");
  if (leadEl) fadeInUp(leadEl, { duration: 760, distance: 24, delay: INTRO_DELAYS[2] });
  root.querySelectorAll<HTMLElement>(".hero-actions, .hero-metrics").forEach((el, index) => {
    fadeInUp(el, { duration: 700, distance: 20, delay: actionDelays[index] ?? 980 });
  });
});

onUnmounted(() => {
  window.removeEventListener("hashchange", applyEasterEggState);
});

const rootRef = ref<HTMLElement | null>(null);
</script>

<template>
  <section ref="rootRef" class="hero" aria-labelledby="hero-title">
    <img
      class="hero-media"
      :src="media.src"
      :alt="media.alt"
      width="1800"
      height="1080"
    />
    <div class="hero-visual" data-hero-scene aria-hidden="true">
      <HeroScene />
    </div>
    <div class="hero-shade" aria-hidden="true"></div>
    <div class="hero-content">
      <h1 id="hero-title">{{ title[0] }}<br />{{ title[1] }}</h1>
      <p class="hero-lead">{{ lead }}</p>
      <div class="hero-actions" aria-label="主要行动">
        <a class="button button-primary" href="#apply">报名方式</a>
        <a class="button button-ghost" href="#tracks">选择方向</a>
      </div>
    </div>
  </section>
</template>
