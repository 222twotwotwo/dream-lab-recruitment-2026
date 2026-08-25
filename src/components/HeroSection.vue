<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { easterEgg, heroDefaults } from "../data/content";
import { playHeroIntro, pulseCta } from "../anime";
import HeroScene from "./HeroScene.vue";

const title = ref(heroDefaults.title);
const brief = ref(heroDefaults.brief);
const note = ref(heroDefaults.note);
const media = ref(heroDefaults.media);

const headingRef = useTemplateRef<HTMLHeadingElement>("heading");
const panelRef = useTemplateRef<HTMLDivElement>("panel");
const ctaRef = useTemplateRef<HTMLAnchorElement>("cta");

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

  playHeroIntro({ heading: headingRef.value, panel: panelRef.value });

  // 主按钮“垂涎欲滴”：呼吸脉冲（与 hover 扫光叠加）
  if (ctaRef.value) pulseCta(ctaRef.value);
});

onUnmounted(() => {
  window.removeEventListener("hashchange", applyEasterEggState);
});
</script>

<template>
  <section :class="$style['hero']" aria-labelledby="hero-title">
    <img
      :class="$style['media']"
      :src="media.src"
      :alt="media.alt"
      width="1800"
      height="1080"
    />
    <div :class="$style['visual']" data-hero-scene aria-hidden="true">
      <HeroScene />
    </div>
    <div :class="$style['shade']" aria-hidden="true"></div>
    <div :class="$style['content']">
      <div :class="$style['titleGroup']">
        <h1 id="hero-title" ref="heading" :class="$style['title']">{{ title[0] }}<br />{{ title[1] }}</h1>
      </div>
      <div ref="panel" :class="$style['panel']">
        <p :class="$style['brief']">
          <span v-for="line in brief" :key="line">{{ line }}</span>
        </p>
        <div :class="$style['actions']" aria-label="主要行动">
          <a ref="cta" class="button button-primary" href="#apply">点击报名</a>
          <a class="button button-ghost" href="#tracks">选择方向</a>
        </div>
        <p v-if="note" :class="$style['note']">{{ note }}</p>
      </div>
    </div>
  </section>
</template>

<style module src="../styles/HeroSection.module.css"></style>

