import { createTimeline } from "animejs";
import { prefersReducedMotion } from "./effects";

export interface HeroIntroTargets {
  /** 主标题 h1 */
  heading?: HTMLElement | null;
  /** 右侧信息面板 */
  panel?: HTMLElement | null;
}

/** 英雄区入场时间轴：标题左下、信息组右下错峰 */
export function playHeroIntro({ heading, panel }: HeroIntroTargets): void {
  if (prefersReducedMotion.matches || (!heading && !panel)) return;

  const timeline = createTimeline({ defaults: { ease: "outExpo" } });
  if (heading) {
    timeline.add(heading, { opacity: [0, 1], translateY: [32, 0], duration: 900 }, 120);
  }
  if (panel) {
    timeline.add(panel, { opacity: [0, 1], translateY: [24, 0], duration: 760 }, 520);
  }
}
