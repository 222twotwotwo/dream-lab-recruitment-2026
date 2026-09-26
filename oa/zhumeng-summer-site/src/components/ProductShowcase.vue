<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 图片来源：AI 生成二次元风格风景插画（WorkBuddy ImageGen 生成），
 * 无人物、无现实场景，暖橙奶油色调，仅用于本站宣传。
 * slide-bidding 夕阳云海·卷轴与纸飞机 / slide-assessment 晨光云海·漂浮书页
 * slide-recruit 黄昏飞鸟·引路之星 / slide-incubation 晨光浮岛·发光幼苗
 */

interface Slide {
  num: string;
  en: string;
  title: string;
  desc: string;
  points: string[];
  img: string;
  imgAlt: string;
}

const slides: Slide[] = [
  {
    num: '01',
    en: 'PROJECT BIDDING',
    title: '项目招标',
    desc: '实验室老师与项目团队发布真实课题，由导师审核，确保课题真实、可执行、有孵化价值。',
    points: ['课题名称与背景', '七项发布要素一次讲清', '真实 · 可执行 · 有孵化价值'],
    img: './images/slide-bidding.jpg',
    imgAlt: '夕阳云海中飘行的卷轴与纸飞机插画'
  },
  {
    num: '02',
    en: 'LEARNING ASSESSMENT',
    title: '学习考核',
    desc: '以过程留痕为基础，六大维度综合评价学习意愿，拒绝"简历面试"式的片面观察。',
    points: ['申请材料 · 周会参与 · 任务完成', '知识分享 · 月报质量 · 导师评价', '全过程 OA 系统留痕'],
    img: './images/slide-assessment.jpg',
    imgAlt: '晨光云海上漂浮的书本插画'
  },
  {
    num: '03',
    en: 'TALENT RECRUITMENT',
    title: '人才招募',
    desc: '优秀参与者进入实验室，成为项目骨干或新生力军，在真实项目中赢得直通资格。',
    points: ['负责人推荐资格', '结项后发布实验室招募令', '绿色通道 · 竞赛推荐'],
    img: './images/slide-recruit.jpg',
    imgAlt: '飞鸟群飞向地平线引路之星的黄昏插画'
  },
  {
    num: '04',
    en: 'PROJECT INCUBATION',
    title: '项目孵化',
    desc: '立项推进、周会月报跟进、结项评审，优秀项目进入下一期孵化或推荐参赛。',
    points: ['周会 · 月报 · 中期检查', '结项答辩：优秀 / 合格 / 不合格', '成果沉淀至项目库续期孵化'],
    img: './images/slide-incubation.jpg',
    imgAlt: '晨光中生长着发光幼苗的浮空岛插画'
  }
];

const idx = ref(0);

const pad = (n: number): string => String(n).padStart(2, '0');

/* ---------- 滚动轨道驱动（sticky + 400vh 轨道） ----------
 * 轨道总高 400vh，section sticky 吸顶。
 * 页面滚轮始终有效：轨道内滚动进度决定当前 slide，
 * 走完第 4 屏后轨道结束，页面自然继续向下滚动。 */
const rootEl = ref<HTMLElement | null>(null);
let ticking = false;

function isDesktop(): boolean {
  return window.innerWidth > 960;
}

function updateFromScroll(): void {
  const track = rootEl.value;
  if (!track || !isDesktop()) return;
  const rect = track.getBoundingClientRect();
  const total = track.offsetHeight - window.innerHeight;
  if (total <= 0) return;
  const progress = Math.min(1, Math.max(0, -rect.top / total));
  const target = Math.min(slides.length - 1, Math.floor(progress * slides.length));
  idx.value = target;
}

function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateFromScroll();
    ticking = false;
  });
}

/* 圆点直达：把轨道滚到对应 slide 的进度中点 */
function scrollToSlide(n: number): void {
  const track = rootEl.value;
  if (!track || !isDesktop()) {
    idx.value = n;
    return;
  }
  const rect = track.getBoundingClientRect();
  const total = track.offsetHeight - window.innerHeight;
  const top = window.scrollY + rect.top + ((n + 0.5) / slides.length) * total;
  window.scrollTo({ top, behavior: 'smooth' });
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateFromScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
});
</script>

<template>
  <div ref="rootEl" class="showcase-track">
    <section id="showcase" class="showcase">
      <div class="showcase-inner">
        <article
          v-for="(s, i) in slides"
          :key="s.num"
          class="slide"
          :class="{ active: i === idx, passed: i < idx }"
        >
          <img
            class="slide-media"
            :src="s.img"
            :alt="s.imgAlt"
            :loading="i === 0 ? 'eager' : 'lazy'"
          />
          <div class="slide-body">
            <p class="slide-en">{{ s.en }}</p>
            <h3 class="slide-title">{{ s.title }}</h3>
            <span class="slide-line"></span>
            <p class="slide-desc">{{ s.desc }}</p>
            <ul class="slide-points">
              <li v-for="p in s.points" :key="p">{{ p }}</li>
            </ul>
            <a class="link-more" href="#join">了解更多 <i>MORE →</i></a>
          </div>
        </article>
      </div>

      <!-- 右侧切换器 -->
      <div class="showcase-nav" aria-label="幻灯片切换">
        <button
          v-for="(s, i) in slides"
          :key="s.num"
          :class="{ active: i === idx }"
          :aria-label="s.title"
          @click="scrollToSlide(i)"
        >
          <span class="dot"></span>
          <span class="lbl">{{ s.title }}</span>
        </button>
      </div>

      <!-- 页码与进度 -->
      <div class="showcase-counter">
        <b>{{ pad(idx + 1) }}</b>&nbsp;/&nbsp;{{ pad(slides.length) }}
      </div>
      <div class="showcase-progress">
        <i :style="{ width: `${((idx + 1) / slides.length) * 100}%` }"></i>
      </div>
    </section>
  </div>
</template>
