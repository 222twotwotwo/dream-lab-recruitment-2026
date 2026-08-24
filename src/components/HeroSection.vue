<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { easterEgg, heroDefaults } from "../data/content";
import { playHeroIntro, pulseCta } from "../anime";
import HeroScene from "./HeroScene.vue";

const title = ref(heroDefaults.title);
const brief = ref(heroDefaults.brief);
const note = ref(heroDefaults.note);
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
  brief.value = isActive ? easterEgg.brief : heroDefaults.brief;
  note.value = isActive ? "" : heroDefaults.note;
  media.value = isActive ? easterEgg.media : heroDefaults.media;
}

onMounted(() => {
  window.addEventListener("hashchange", applyEasterEggState);
  applyEasterEggState();

  const root = rootRef.value;
  if (!root) return;

  playHeroIntro(root);

  // 主按钮“垂涎欲滴”：呼吸脉冲（与 hover 扫光叠加）
  const cta = root.querySelector<HTMLElement>(".button-primary");
  if (cta) pulseCta(cta);
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
      <div class="hero-title-group">
        <h1 id="hero-title">{{ title[0] }}<br />{{ title[1] }}</h1>
      </div>
      <div class="hero-panel">
        <p class="hero-brief">
          <span v-for="line in brief" :key="line">{{ line }}</span>
        </p>
        <div class="hero-actions" aria-label="主要行动">
          <a class="button button-primary" href="#apply">点击报名</a>
          <a class="button button-ghost" href="#tracks">选择方向</a>
        </div>
        <p v-if="note" class="hero-note">{{ note }}</p>
      </div>
    </div>
  </section>
</template>
