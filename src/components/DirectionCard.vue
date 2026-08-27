<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import type { Track, TrackKey } from "../data/content";

defineProps<{
  track: Track & { key: TrackKey };
  index: number;
  active: boolean;
  accent: string;
}>();
</script>

<template>
  <article
    :class="$style['card']"
    :style="{ '--card-accent': accent }"
    :data-track-card="true"
    :data-track-index="index"
    :data-track-key="track.key"
    :data-active="active ? 'true' : 'false'"
    :aria-current="active ? 'true' : undefined"
  >
    <div :class="$style['cardVisual']" aria-hidden="true">
      <div :class="$style['artMotion']" data-card-art>
        <div :class="$style['shapeField']">
          <template v-if="track.key === 'frontend'">
            <div :class="$style['browser']" data-motion="float">
              <i :class="$style['browserBar']"></i>
              <i :class="$style['browserLine']"></i>
              <i :class="$style['browserLine']"></i>
              <i :class="$style['browserLine']"></i>
              <i :class="$style['browserCursor']" data-motion="slide"></i>
            </div>
            <div :class="$style['cube']" data-motion="spin">
              <i :class="[$style['cubeFace'], $style['cubeFront']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeBack']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeRight']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeLeft']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeTop']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeBottom']]"></i>
            </div>
            <span :class="$style['codeLine']" data-motion="grow"></span>
          </template>

          <template v-else-if="track.key === 'backend'">
            <div :class="$style['serverRack']">
              <i :class="$style['serverBlock']" data-motion="slide"></i>
              <i :class="$style['serverBlock']" data-motion="slide"></i>
              <i :class="$style['serverBlock']" data-motion="slide"></i>
            </div>
            <span :class="$style['ringPulse']" data-motion="pulse"></span>
            <span :class="$style['backendDot']" data-motion="grow"></span>
          </template>

          <template v-else-if="track.key === 'client'">
            <div :class="$style['phone']" data-motion="float">
              <i :class="$style['phoneScreen']"></i>
              <i :class="$style['phoneButton']" data-motion="pulse"></i>
            </div>
            <span :class="$style['clientRing']" data-motion="spin"></span>
          </template>

          <template v-else-if="track.key === 'media'">
            <div :class="$style['cube']" data-motion="spin">
              <i :class="[$style['cubeFace'], $style['cubeFront']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeBack']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeRight']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeLeft']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeTop']]"></i>
              <i :class="[$style['cubeFace'], $style['cubeBottom']]"></i>
            </div>
            <span :class="$style['orb']" data-motion="pulse"></span>
            <span :class="$style['mediaLine']" data-motion="grow"></span>
          </template>

          <template v-else-if="track.key === 'contest'">
            <span :class="$style['targetRing']" data-motion="pulse"></span>
            <span :class="$style['targetRingSmall']" data-motion="pulse"></span>
            <span :class="$style['contestDot']" data-motion="float"></span>
          </template>

          <template v-else>
            <span :class="$style['nodeA']" data-motion="float"></span>
            <span :class="$style['nodeB']" data-motion="pulse"></span>
            <span :class="$style['nodeC']" data-motion="spin"></span>
            <i :class="$style['agentLine']" data-motion="grow"></i>
            <i :class="$style['agentLine2']" data-motion="grow"></i>
          </template>
        </div>
      </div>
      <div :class="$style['cardGrid']"></div>
    </div>

    <div :class="$style['cardBody']">
      <span :class="$style['cardTag']" data-card-copy>{{ track.tag }}</span>
      <h3 :class="$style['cardTitle']" data-card-copy>{{ track.title }}</h3>
      <p :class="$style['cardIntro']" data-card-copy>{{ track.intro }}</p>

      <div v-if="track.logos.length" :class="$style['logos']" data-card-copy>
        <span
          v-for="logo in track.logos"
          :key="logo.label"
          :class="$style['logo']"
          :title="logo.label"
        >
          <img
            :class="$style['logoImg']"
            :src="logo.icon"
            alt=""
            width="22"
            height="22"
            loading="lazy"
            decoding="async"
          />
          <span>{{ logo.label }}</span>
        </span>
      </div>

      <div :class="$style['details']" data-card-copy>
        <section
          v-for="detail in track.details"
          :key="detail.title"
          :class="$style['detail']"
        >
          <h4>{{ detail.title }}</h4>
          <ul>
            <li v-for="item in detail.items" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </div>

    <span :class="$style['cardIndex']">{{ String(index + 1).padStart(2, "0") }}</span>
  </article>
</template>

<style module src="../styles/DirectionCard.module.css"></style>