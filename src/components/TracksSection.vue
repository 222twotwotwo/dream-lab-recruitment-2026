<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import {
  trackDotLabels,
  trackOrder,
  trackScrollHint,
  tracks,
  type TrackKey,
} from "../data/content";
import SectionHeading from "./SectionHeading.vue";
import DirectionCard from "./DirectionCard.vue";
import DirectionNav from "./DirectionNav.vue";
import {
  createDirectionAurora,
  playDirectionCardActive,
  playDirectionCardIdle,
  prefersReducedMotion,
  type DirectionAurora,
} from "../anime";

const trackList = trackOrder.map((key) => ({ key, ...tracks[key] }));

const trackAccent: Record<TrackKey, string> = {
  frontend: "var(--teal)",
  backend: "var(--gold)",
  client: "var(--violet)",
  media: "var(--orange)",
  contest: "var(--teal-dark)",
  agent: "var(--orange)",
};

const sectionRef = useTemplateRef<HTMLElement>("section");
const stageRef = useTemplateRef<HTMLDivElement>("stage");
const trackRef = useTemplateRef<HTMLDivElement>("track");
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvas");

const activeIndex = ref(0);
const scrollProgress = ref(0);

let aurora: DirectionAurora | undefined;
let resizeObserver: ResizeObserver | undefined;
let lastActiveIndex = -1;
let entered = false;

const portraitQuery = window.matchMedia("(orientation: portrait) and (max-width: 700px)");
let isMobile = portraitQuery.matches;
function onPortraitChange(e: MediaQueryListEvent): void {
  isMobile = e.matches;
}
portraitQuery.addEventListener("change", onPortraitChange);

function cards(): HTMLElement[] {
  const track = trackRef.value;
  return track
    ? Array.from(track.querySelectorAll<HTMLElement>("[data-track-card]"))
    : [];
}

function measure(): void {
  if (isMobile) return;
  const section = sectionRef.value;
  const track = trackRef.value;
  const stage = stageRef.value;
  if (!section || !track || !stage) return;
  const first = track.children[0] as HTMLElement | undefined;
  const last = track.children[track.children.length - 1] as HTMLElement | undefined;
  const travel = first && last
    ? Math.max(0, last.offsetLeft - first.offsetLeft)
    : 0;
  section.style.setProperty("--tracks-travel", `${travel}px`);
  updateScroll();
}

function setActive(index: number): void {
  if (index === lastActiveIndex) return;
  const previous = lastActiveIndex;
  lastActiveIndex = index;
  activeIndex.value = index;

  if (!entered) return;

  const list = cards();
  const current = list[index];
  const previousCard = previous >= 0 ? list[previous] : undefined;
  if (current) playDirectionCardActive(current);
  if (previousCard && previousCard !== current) playDirectionCardIdle(previousCard);
}


function closestCardIndex(): number {
  const stage = stageRef.value;
  const list = cards();
  if (!stage || list.length === 0) return 0;

  const stageRect = stage.getBoundingClientRect();
  const centerX = stageRect.left + stageRect.width / 2;
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < list.length; i += 1) {
    const card = list[i];
    if (!card) continue;
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - centerX);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }

  return best;
}

function updateScroll(): void {
  if (isMobile) return;
  const section = sectionRef.value;
  if (!section) return;

  const rect = section.getBoundingClientRect();
  const total = Math.max(1, section.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -rect.top / total));
  scrollProgress.value = progress;
  section.style.setProperty("--tracks-progress", progress.toFixed(5));
  aurora?.setScroll(progress);

  if (!entered && rect.bottom > 0 && rect.top < window.innerHeight) {
    entered = true;
    // 首次进入时强制播放当前卡片的入场动画
    lastActiveIndex = -1;
  }

  const next = closestCardIndex();
  setActive(next);
}

// 竖屏（移动端）退化为原生横向滑动：监听轨道滚动，居中卡片即为当前
function onTrackScroll(): void {
  if (!isMobile) return;
  if (!entered) entered = true;
  const next = closestCardIndex();
  setActive(next);
  scrollProgress.value = next / Math.max(1, trackList.length - 1);
}

function onPointerMove(event: PointerEvent): void {
  const stage = stageRef.value;
  if (!stage) return;
  const rect = stage.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  stage.style.setProperty("--px", x.toFixed(4));
  stage.style.setProperty("--py", y.toFixed(4));
  aurora?.setPointer(x, y);
}

function onPointerLeave(): void {
  const stage = stageRef.value;
  if (!stage) return;
  stage.style.setProperty("--px", "0");
  stage.style.setProperty("--py", "0");
  aurora?.setPointer(0, 0);
}

function goTo(index: number): void {
  const section = sectionRef.value;
  const track = trackRef.value;
  if (!section || !track) return;
  if (isMobile) {
    // 竖屏直接滚动轨道，靠 scroll-snap 吸附到目标卡片
    const list = cards();
    const card = list[index];
    if (card) {
      const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
      track.scrollTo({
        left,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    }
    return;
  }
  const total = Math.max(1, section.offsetHeight - window.innerHeight);
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  const ratio = trackList.length <= 1 ? 0 : index / (trackList.length - 1);
  window.scrollTo({
    top: sectionTop + total * ratio,
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
  });
}

onMounted(() => {
  const track = trackRef.value;
  const stage = stageRef.value;
  const canvas = canvasRef.value;
  if (canvas && !isMobile) aurora = createDirectionAurora(canvas);

  measure();

  resizeObserver = new ResizeObserver(measure);
  if (track) resizeObserver.observe(track);
  if (stage) resizeObserver.observe(stage);

  // 桌面端纵向滚动驱动横向位移；竖屏移动端退化为轨道内原生横向滑动
  // 两类监听常驻，各自由 isMobile 守卫，兼容旋转屏幕
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  stage?.addEventListener("pointerleave", onPointerLeave, { passive: true });
  track?.addEventListener("scroll", onTrackScroll, { passive: true });

  document.fonts?.ready.then(() => measure()).catch(() => undefined);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  const track = trackRef.value;
  const stage = stageRef.value;
  track?.removeEventListener("scroll", onTrackScroll);
  window.removeEventListener("scroll", updateScroll);
  window.removeEventListener("resize", updateScroll);
  window.removeEventListener("pointermove", onPointerMove);
  stage?.removeEventListener("pointerleave", onPointerLeave);
  portraitQuery.removeEventListener("change", onPortraitChange);
  aurora?.destroy();
  aurora = undefined;
});
</script>

<template>
  <section id="tracks" ref="section" :class="$style['tracks']" aria-labelledby="tracks-title">
    <div ref="stage" :class="$style['stage']">
      <canvas ref="canvas" :class="$style['aurora']" aria-hidden="true"></canvas>

      <header :class="$style['heading']">
        <SectionHeading
          eyebrow="Choose your track"
          title-id="tracks-title"
          title="本次招新方向"
          prominent
        >
          先选一个方向扎进去，再通过项目、会议、模拟赛和拆解练习持续迭代。基础好的同学可申请提前选拔。
        </SectionHeading>
      </header>

      <div :class="$style['trackViewport']">
        <div ref="track" :class="$style['track']">
          <DirectionCard
            v-for="(track, index) in trackList"
            :key="track.key"
            :track="track"
            :index="index"
            :active="activeIndex === index"
            :accent="trackAccent[track.key]"
          />
        </div>
      </div>

      <DirectionNav
        :items="trackList"
        :active-index="activeIndex"
        :labels="trackDotLabels"
        :hint="trackScrollHint"
          :progress="scrollProgress"
        @select="goTo"
      />
    </div>
  </section>
</template>

<style module src="../styles/TracksSection.module.css"></style>
