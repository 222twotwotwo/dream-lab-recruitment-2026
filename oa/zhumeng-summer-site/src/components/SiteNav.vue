<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const links = [
  { href: '#showcase', label: '活动全景' },
  { href: '#goals', label: '活动目标' },
  { href: '#flow', label: '核心流程' },
  { href: '#timeline', label: '时间安排' },
  { href: '#modules', label: '网站模块' },
  { href: '#assess', label: '考核激励' }
];

const scrolled = ref(false);
const drawer = ref(false);
const activeHref = ref('');

const onScroll = (): void => {
  scrolled.value = window.scrollY > 40;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 滚动高亮当前区块
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.getAttribute('id')}`;
        if (links.some((l) => l.href === id)) activeHref.value = id;
      }
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  document.querySelectorAll('.section, .showcase').forEach((sec) => sectionObserver.observe(sec));
});

onUnmounted(() => window.removeEventListener('scroll', onScroll));
</script>

<template>
  <q-header class="nav" :class="{ scrolled }">
    <q-toolbar class="nav-inner">
      <a class="logo" href="#hero">
        <span class="logo-text">逐梦之夏 <em>DREAM IN SUMMER</em></span>
      </a>
      <q-space class="nav-space" />
      <nav class="nav-links">
        <q-btn
          v-for="l in links"
          :key="l.href"
          flat
          no-caps
          :ripple="false"
          :href="l.href"
          class="nav-link"
          :class="{ active: activeHref === l.href }"
        >{{ l.label }}</q-btn>
      </nav>
      <q-btn
        unelevated
        no-caps
        color="accent"
        href="#join"
        class="nav-cta q-px-lg"
      >立即申请</q-btn>
      <q-btn
        flat
        round
        icon="menu"
        class="nav-burger"
        aria-label="菜单"
        @click="drawer = !drawer"
      />
    </q-toolbar>
  </q-header>

  <q-drawer v-model="drawer" side="right" overlay class="nav-drawer">
    <q-list padding class="nav-drawer-list">
      <q-item
        v-for="l in links"
        :key="l.href"
        clickable
        tag="a"
        :href="l.href"
        @click="drawer = false"
      >
        <q-item-section>{{ l.label }}</q-item-section>
        <q-item-section side><q-icon name="chevron_right" size="18px" /></q-item-section>
      </q-item>
    </q-list>
    <q-btn
      unelevated
      no-caps
      color="accent"
      href="#join"
      class="q-mx-md"
      style="width: calc(100% - 32px)"
      @click="drawer = false"
    >立即申请</q-btn>
  </q-drawer>
</template>
