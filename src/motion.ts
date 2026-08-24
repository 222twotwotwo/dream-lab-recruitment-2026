/**
 * 极简动画层：以原生 Web Animations API 取代 anime.js。
 * 统一处理 prefers-reduced-motion，动画未运行时返回 undefined。
 */

export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

/** 与 anime.js 同名缓动等价的 CSS 缓动曲线 */
export const EASE_OUT_CUBIC = "cubic-bezier(0.215, 0.61, 0.355, 1)";
export const EASE_OUT_QUART = "cubic-bezier(0.165, 0.84, 0.44, 1)";
export const EASE_OUT_EXPO = "cubic-bezier(0.19, 1, 0.22, 1)";

export interface FadeUpOptions {
  duration?: number;
  delay?: number;
  /** 入场前位移，单位 px */
  distance?: number;
  easing?: string;
}

/** 淡入 + 上移入场（对应 anime 的 opacity/translateY 组合） */
export function fadeInUp(
  element: Element,
  { duration = 420, delay = 0, distance = 24, easing = EASE_OUT_CUBIC }: FadeUpOptions = {},
): Animation | undefined {
  if (prefersReducedMotion.matches || !element.animate) return undefined;
  const animation = element.animate(
    [
      { opacity: "0", transform: `translateY(${distance}px)` },
      { opacity: "1", transform: "translateY(0)" },
    ],
    { duration, delay, easing, fill: "backwards" },
  );
  animation.finished.then(
    () => {
      // 清除 observeReveals 预置的隐藏样式，再取消 fill 效果
      (element as HTMLElement).style.opacity = "";
      (element as HTMLElement).style.transform = "";
      animation.cancel();
    },
    () => {},
  );
  return animation;
}

/**
 * 滚动显现：观察 root 内匹配 selector 的元素，
 * 进入视口后播放一次淡入上移（对应原 initRevealMotion）。
 */
export function observeReveals(selector: string, root: ParentNode = document): () => void {
  if (!("IntersectionObserver" in window)) return () => {};
  const targets = Array.from(root.querySelectorAll(selector));
  if (!targets.length) return () => {};

  for (const target of targets) {
    (target as HTMLElement).style.opacity = "0";
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        fadeInUp(entry.target, { duration: 720, distance: 24 });
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.14 },
  );

  for (const target of targets) observer.observe(target);
  return () => observer.disconnect();
}
