/**
 * 动效基础设施：通用入场与滚动显现。
 * 全站动画统一从 src/anime 引入。
 */
import { animate } from "animejs";

export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export interface FadeUpOptions {
  duration?: number;
  delay?: number;
  /** 入场前位移，单位 px */
  distance?: number;
}

/** 淡入 + 上移入场 */
export function fadeInUp(
  element: HTMLElement | string | HTMLElement[],
  { duration = 420, delay = 0, distance = 24 }: FadeUpOptions = {},
): void {
  if (prefersReducedMotion.matches) return;
  animate(element, {
    opacity: [0, 1],
    translateY: [distance, 0],
    duration,
    delay,
    ease: "outCubic",
  });
}

/**
 * 滚动显现：观察 root 内匹配 selector 的元素，
 * 进入视口后播放一次淡入上移。
 */
export function observeReveals(selector: string, root: ParentNode = document): () => void {
  if (!("IntersectionObserver" in window)) return () => {};
  const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (!targets.length) return () => {};

  for (const target of targets) {
    target.style.opacity = "0";
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const el = entry.target as HTMLElement;
        animate(el, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 720,
          ease: "outCubic",
          onComplete: () => {
            el.style.opacity = "";
            el.style.transform = "";
          },
        });
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.14 },
  );

  for (const target of targets) observer.observe(target);
  return () => observer.disconnect();
}
