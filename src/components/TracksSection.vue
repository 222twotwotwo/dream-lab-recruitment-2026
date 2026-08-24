<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { devTrackKeys, tracks, type TrackKey } from "../data/content";
import { fadeInUp } from "../motion";

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
  <section id="tracks" class="section tracks-section" aria-labelledby="tracks-title">
    <div class="section-heading">
      <p class="eyebrow">Choose your track</p>
      <h2 id="tracks-title">本次招新方向</h2>
      <p>先选一个方向扎进去，再通过项目、会议、模拟赛和拆解练习持续迭代。基础好的同学可申请提前选拔。</p>
    </div>
    <div class="track-board">
      <div class="track-tabs" aria-label="招新方向">
        <div class="track-dev-picker">
          <button
            class="track-tab"
            :class="{ 'is-active': isButtonActive('dev') }"
            type="button"
            :aria-pressed="ariaPressed('dev')"
            aria-controls="track-panel"
            @click="select('dev')"
          >
            开发组
          </button>
          <div class="track-select-card">
            <span class="track-select-label">开发细分方向</span>
            <div class="track-subgroup-list" aria-label="开发组细分方向">
              <button
                v-for="item in subgroups"
                :key="item.key"
                class="track-subgroup"
                :class="{ 'is-active': isButtonActive(item.key) }"
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
          class="track-tab"
          :class="{ 'is-active': isButtonActive(tab.key) }"
          type="button"
          :aria-pressed="ariaPressed(tab.key)"
          aria-controls="track-panel"
          @click="select(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <article ref="panel" class="track-panel" id="track-panel" aria-live="polite">
        <header>
          <div class="track-meta-row">
            <span class="track-tag">{{ activeTrack.tag }}</span>
            <div v-if="activeTrack.logos.length" class="track-logo-list" aria-label="相关技术标识">
              <span
                v-for="logo in activeTrack.logos"
                :key="logo.label"
                class="track-logo"
                :title="logo.label"
              >
                <img class="track-logo-img" :src="logo.icon" alt="" width="24" height="24" loading="lazy" decoding="async" />
                <span class="track-logo-name">{{ logo.label }}</span>
              </span>
            </div>
          </div>
          <h3>{{ activeTrack.title }}</h3>
          <p>{{ activeTrack.intro }}</p>
        </header>
        <div class="track-detail-grid">
          <section v-for="detail in activeTrack.details" :key="detail.title" class="track-detail">
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
