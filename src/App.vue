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

// 与原版一致的滚动显现目标集合
const REVEAL_SELECTOR = [
  ".promise-card",
  ".proof-panel",
  ".company-showcase",
  ".camp-callout",
  ".camp-card",
  ".track-board",
  ".roadmap li",
  ".selection-grid article",
  ".sophomore-section",
  ".apply-section",
].join(", ");

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
