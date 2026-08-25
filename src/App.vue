<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import HeroSection from "./components/HeroSection.vue";
import PromiseSection from "./components/PromiseSection.vue";
import ProofSection from "./components/ProofSection.vue";
import CampSection from "./components/CampSection.vue";
import TracksSection from "./components/TracksSection.vue";
import RoadmapSection from "./components/RoadmapSection.vue";
import SelectionSection from "./components/SelectionSection.vue";
import SophomoreSection from "./components/SophomoreSection.vue";
import ApplySection from "./components/ApplySection.vue";
import SiteFooter from "./components/SiteFooter.vue";
import { observeReveals } from "./anime";

// 与原版一致的滚动显现目标集合：各组件以 data-reveal 标记显现元素
// （原先按类名收集，CSS Modules 化后类名哈希，改用数据属性）
const REVEAL_SELECTOR = "[data-reveal]";

let stopReveals: (() => void) | undefined;

onMounted(() => {
  stopReveals = observeReveals(REVEAL_SELECTOR);
});

onUnmounted(() => {
  stopReveals?.();
});
</script>

<template>
  <a class="skip-link" href="#tracks">跳到招新方向</a>
  <SiteHeader />
  <main id="top">
    <HeroSection />
    <PromiseSection />
    <ProofSection />
    <CampSection />
    <TracksSection />
    <RoadmapSection />
    <SelectionSection />
    <SophomoreSection />
    <ApplySection />
  </main>
  <SiteFooter />
</template>
