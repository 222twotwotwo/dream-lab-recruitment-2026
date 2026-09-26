import type { Directive } from 'vue';

/**
 * v-reveal 滚动进入动画指令
 * 用法：v-reveal（无延迟）或 v-reveal="2"（第 3 个元素，stagger 延迟）
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.12 }
);

export const reveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal');
    const delay = Math.min((binding.value ?? 0) * 70, 420);
    if (delay > 0) el.style.transitionDelay = `${delay}ms`;
    observer.observe(el);
  }
};
