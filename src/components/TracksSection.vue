<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { devTrackKeys, tracks, type TrackKey } from "../data/content";
import SectionHeading from "./SectionHeading.vue";
import { fadeInUp } from "../anime";

type ButtonKey = "dev" | TrackKey;


const outerTabs = [
  { key: "contest" as TrackKey, label: "竞赛组" },
  { key: "agent" as TrackKey, label: "Agent 组" },
] as const;

const subgroups = [
  { key: "frontend" as const, label: "前端" },
  { key: "backend" as const, label: "后端" },
  { key: "client" as const, label: "客户端" },
  { key: "media" as const, label: "数媒" },
];

const selectedKey = ref<TrackKey>("frontend");
// 修复：记住开发组内上次选中的细分方向，点击“开发组”不再总是重置回前端
const lastDevKey = ref<TrackKey>("frontend");
const panelRef = useTemplateRef<HTMLElement>("panel");

const activeTrack = computed(() => tracks[selectedKey.value]);

function isButtonActive(key: ButtonKey): boolean {
  return key === "dev"
    ? devTrackKeys.includes(selectedKey.value)
    : key === selectedKey.value;
}

function ariaPressed(key: ButtonKey): boolean {
  return isButtonActive(key);
}

function select(key: ButtonKey): void {
  const target: TrackKey =
    key === "dev"
      ? lastDevKey.value
      : key;
  if (key === "frontend" || key === "backend" || key === "client" || key === "media") {
    lastDevKey.value = key;
  }
  if (target === selectedKey.value) return;
  selectedKey.value = target;
}

watch(selectedKey, async () => {
  // 与原版一致：面板切换时淡入上移
  await nextTick();
  if (panelRef.value) {
    fadeInUp(panelRef.value, { duration: 420, distance: 12 });
  }
});
</script>

<template>
  <section id="tracks" :class="$style['tracks']" class="section" aria-labelledby="tracks-title">
    <SectionHeading
      eyebrow="Choose your track"
      title-id="tracks-title"
      title="本次招新方向"
    >
      先选一个方向扎进去，再通过项目、会议、模拟赛和拆解练习持续迭代。基础好的同学可申请提前选拔。
    </SectionHeading>
    <div :class="$style['board']" data-reveal>
      <div :class="$style['tabs']" aria-label="招新方向">
        <div :class="$style['devPicker']">
          <button
            :class="[$style['tab'], isButtonActive('dev') && $style['tabActive']]"
            type="button"
            :aria-pressed="ariaPressed('dev')"
            aria-controls="track-panel"
            @click="select('dev')"
          >
            开发组
          </button>
          <div :class="$style['selectCard']">
            <span :class="$style['selectLabel']">开发细分方向</span>
            <div :class="$style['subgroupList']" aria-label="开发组细分方向">
              <button
                v-for="item in subgroups"
                :key="item.key"
                :class="[$style['subgroup'], isButtonActive(item.key) && $style['subgroupActive']]"
                type="button"
                :aria-pressed="ariaPressed(item.key)"
                aria-controls="track-panel"
                @click="select(item.key)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
        <button
          v-for="tab in outerTabs"
          :key="tab.key"
          :class="[$style['tab'], isButtonActive(tab.key) && $style['tabActive']]"
          type="button"
          :aria-pressed="ariaPressed(tab.key)"
          aria-controls="track-panel"
          @click="select(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <article ref="panel" :class="$style['panel']" id="track-panel" aria-live="polite">
        <header>
          <div :class="$style['metaRow']">
            <span :class="$style['tag']">{{ activeTrack.tag }}</span>
            <div v-if="activeTrack.logos.length" :class="$style['logoList']" aria-label="相关技术标识">
              <span
                v-for="logo in activeTrack.logos"
                :key="logo.label"
                :class="$style['logo']"
                :title="logo.label"
              >
                <img :class="$style['logoImg']" :src="logo.icon" alt="" width="24" height="24" loading="lazy" decoding="async" />
                <span :class="$style['logoName']">{{ logo.label }}</span>
              </span>
            </div>
          </div>
          <h3>{{ activeTrack.title }}</h3>
          <p>{{ activeTrack.intro }}</p>
        </header>
        <div :class="$style['detailGrid']">
          <section v-for="detail in activeTrack.details" :key="detail.title" :class="$style['detail']">
            <h4>{{ detail.title }}</h4>
            <ul>
              <li v-for="item in detail.items" :key="item">{{ item }}</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  </section>
</template>

<style module src="../styles/TracksSection.module.css"></style>

