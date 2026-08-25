<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { navLinks } from "../data/content";
import { hideDroplet, prefersReducedMotion, showDroplet, slideDroplet } from "../anime";

const activeHref = ref<string>("");
const headerRef = ref<HTMLElement | null>(null);
const navRef = ref<HTMLElement | null>(null);
const dropletRef = ref<HTMLElement | null>(null);
let dropletPlaced = false;
let dropletVisible = false;

/** 水滴可见性/落位状态在此维护，动画委托给 src/anime/droplet */
async function moveDroplet(instant = false): Promise<void> {
  await nextTick();
  const nav = navRef.value;
  const droplet = dropletRef.value;
  if (!nav || !droplet) return;

  const link =
    activeHref.value === ""
      ? undefined
      : nav.querySelector<HTMLAnchorElement>(`a[href="${activeHref.value}"]`);
  if (!link) {
    hideDroplet(droplet);
    dropletVisible = false;
    dropletPlaced = false;
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const rect = link.getBoundingClientRect();

  if (prefersReducedMotion.matches || instant || !dropletPlaced) {
    droplet.style.left = `${rect.left - navRect.left}px`;
    droplet.style.top = `${rect.top - navRect.top}px`;
    droplet.style.width = `${rect.width}px`;
    droplet.style.height = `${rect.height}px`;
    dropletPlaced = true;
    if (!dropletVisible) {
      dropletVisible = true;
      showDroplet(droplet);
    }
    return;
  }

  if (!dropletVisible) {
    dropletVisible = true;
    showDroplet(droplet);
  }
  slideDroplet(droplet, {
    x: rect.left - navRect.left,
    y: rect.top - navRect.top,
    width: rect.width,
    height: rect.height,
  });
}

/** 首屏融入背景，随滚动 0→1 渐渐上色悬浮（CSS 按 --header-float 插值） */
const FLOAT_RANGE = 140;
const CREAM: [number, number, number] = [255, 246, 234];
const INK: [number, number, number] = [78, 61, 71];

function applyHeaderProgress(): void {
  const header = headerRef.value;
  if (!header) return;
  const progress = Math.min(1, Math.max(0, window.scrollY / FLOAT_RANGE));
  header.style.setProperty("--header-float", progress.toFixed(3));
  const [r, g, b] = CREAM.map((c, i) => Math.round(c + (INK[i]! - c) * progress));
  // 未悬浮时字样 67% alpha，随悬浮渐至不透明
  const alpha = 0.67 + 0.33 * progress;
  header.style.color = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

/** 与原版一致的锚线高亮：section 顶边越过顶栏下沿即视为当前区块 */
function syncActiveNav(): void {
  const header = headerRef.value;
  const line =
    header instanceof HTMLElement ? header.offsetTop + header.offsetHeight : 0;

  let currentId = "";
  for (const { href } of navLinks) {
    const section = document.querySelector(href);
    if (!(section instanceof HTMLElement)) continue;
    const { top, bottom } = section.getBoundingClientRect();
    // 计入 scroll-margin-top（如报名卡片的避让偏移），否则跳转落点会被判成上一区块
    const margin =
      parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    const adjustedTop = top - margin;
    if (adjustedTop <= line && bottom > line) {
      currentId = href;
      break;
    }
    if (adjustedTop <= line) currentId = href;
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
    applyHeaderProgress();
    syncActiveNav();
  });
}

function onResize(): void {
  applyHeaderProgress();
  void moveDroplet(true);
}

watch(activeHref, () => {
  void moveDroplet();
});

onMounted(() => {
  applyHeaderProgress();
  syncActiveNav();
  void moveDroplet(true);
  window.addEventListener("scroll", scheduleSync, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  // 艺术字体加载完成会改变顶栏尺寸，就绪后重测水滴位置
  void document.fonts.ready.then(() => moveDroplet(true));
});

onUnmounted(() => {
  window.removeEventListener("scroll", scheduleSync);
  window.removeEventListener("resize", onResize);
});
</script>

<template>
  <header ref="headerRef" :class="$style['header']" aria-label="站点导航">
    <a :class="$style['brand']" href="#top" aria-label="返回首页">
      <span :class="$style['brandStack']" aria-hidden="true">
        <span :class="$style['brandNormal']">逐梦创新实验室</span>
        <span :class="$style['brandArt']">逐梦创新实验室</span>
      </span>
    </a>
    <nav ref="navRef" :class="$style['nav']" aria-label="主导航">
      <span ref="dropletRef" :class="$style['droplet']" aria-hidden="true"></span>
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        :class="[$style['link'], activeHref === link.href && $style['linkActive']]"
      >{{ link.label }}</a>
    </nav>
  </header>
</template>

<style module src="../styles/SiteHeader.module.css"></style>

