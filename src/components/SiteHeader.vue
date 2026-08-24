<script setup lang="ts">
import { animate, spring } from "animejs";
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { navLinks } from "../data/content";
import { prefersReducedMotion } from "../motion";

const activeHref = ref<string>("");
const headerRef = ref<HTMLElement | null>(null);
const navRef = ref<HTMLElement | null>(null);
const dropletRef = ref<HTMLElement | null>(null);
let dropletPlaced = false;
let dropletVisible = false;

/** 水滴进场：从 0 弹性长大 */
function showDroplet(droplet: HTMLElement): void {
  dropletVisible = true;
  if (prefersReducedMotion.matches) {
    droplet.style.opacity = "1";
    return;
  }
  animate(droplet, {
    opacity: [0, 1],
    scaleX: [0.2, 1],
    scaleY: [0.2, 1],
    duration: 620,
    ease: "outElastic(1, .62)",
  });
}

/** 水滴退场：收缩消散 */
function hideDroplet(droplet: HTMLElement): void {
  if (!dropletVisible) return;
  dropletVisible = false;
  dropletPlaced = false;
  if (prefersReducedMotion.matches) {
    droplet.style.opacity = "0";
    return;
  }
  animate(droplet, {
    opacity: 0,
    scaleX: 0.4,
    scaleY: 0.4,
    duration: 260,
    ease: "inQuad",
  });
}

/** 粘滞水滴指示器：弹簧位移 + 挤压回弹 */
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
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const rect = link.getBoundingClientRect();
  const x = rect.left - navRect.left;
  const y = rect.top - navRect.top;

  if (prefersReducedMotion.matches || instant || !dropletPlaced) {
    droplet.style.left = `${x}px`;
    droplet.style.top = `${y}px`;
    droplet.style.width = `${rect.width}px`;
    droplet.style.height = `${rect.height}px`;
    dropletPlaced = true;
    if (!dropletVisible) showDroplet(droplet);
    return;
  }

  if (!dropletVisible) showDroplet(droplet);

  animate(droplet, {
    left: x,
    top: y,
    width: rect.width,
    height: rect.height,
    duration: 640,
    ease: spring({ stiffness: 190, damping: 15 }),
  });
  // 水滴粘滞感：移动时先拉长再回弹
  animate(droplet, {
    scaleX: [1.28, 0.92, 1],
    scaleY: [0.78, 1.1, 1],
    duration: 640,
    ease: "outQuad",
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
  <header ref="headerRef" class="site-header" aria-label="站点导航">
    <a class="brand" href="#top" aria-label="返回首页">
      <span>逐梦创新实验室</span>
    </a>
    <nav ref="navRef" class="site-nav" aria-label="主导航">
      <span ref="dropletRef" class="nav-droplet" aria-hidden="true"></span>
      <a
        v-for="link in navLinks"
        :key="link.href"
        :href="link.href"
        :class="{ 'is-active': activeHref === link.href }"
      >{{ link.label }}</a>
    </nav>
  </header>
</template>
