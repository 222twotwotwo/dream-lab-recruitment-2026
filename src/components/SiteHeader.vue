<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { navLinks } from "../data/content";

const isSolid = ref(false);
const activeHref = ref<string>("");

function updateHeader(): void {
  isSolid.value = window.scrollY > 24;
}

/** 与原版一致的锚线高亮：section 顶边越过 header 下沿即视为当前区块 */
function syncActiveNav(): void {
  const header = document.querySelector(".site-header");
  const line = header instanceof HTMLElement ? header.offsetHeight : 0;

  let currentId = "";
  for (const { href } of navLinks) {
    const section = document.querySelector(href);
    if (!(section instanceof HTMLElement)) continue;
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= line && bottom > line) {
      currentId = href;
      break;
    }
    if (top <= line) currentId = href;
  }

  // 滚到底时兜底高亮最后一项
  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 2;
  if (atBottom) currentId = navLinks[navLinks.length - 1]!.href;

  activeHref.value = currentId;
}

let queued = false;
function scheduleSync(): void {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    updateHeader();
    syncActiveNav();
  });
}

onMounted(() => {
  updateHeader();
  syncActiveNav();
  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("resize", scheduleSync, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", scheduleSync);
  window.removeEventListener("resize", scheduleSync);
});
</script>

<template>
  <header class="site-header" :class="{ 'is-solid': isSolid }" aria-label="站点导航">
    <a class="brand" href="#top" aria-label="返回首页">
      <span>逐梦创新实验室</span>
    </a>
    <nav class="site-nav" aria-label="主导航">
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        :class="{ 'is-active': activeHref === link.href }"
      >{{ link.label }}</a>
    </nav>
  </header>
</template>
