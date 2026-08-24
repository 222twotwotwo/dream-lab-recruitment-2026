import { createTimeline } from "animejs";
import { prefersReducedMotion } from "./effects";

/** 英雄区入场时间轴：标题左下、信息组右下错峰（kicker 未启用，留位） */
export function playHeroIntro(root: HTMLElement): void {
  if (prefersReducedMotion.matches) return;

  const timeline = createTimeline({ defaults: { ease: "outExpo" } });
  const kicker = root.querySelector<HTMLElement>(".hero-kicker");
  if (kicker) {
    timeline.add(kicker, { opacity: [0, 1], translateY: [18, 0], duration: 620 }, 0);
  }
  const heading = root.querySelector<HTMLElement>(".hero h1");
  if (heading) {
    timeline.add(heading, { opacity: [0, 1], translateY: [32, 0], duration: 900 }, 120);
  }
  const panel = root.querySelector<HTMLElement>(".hero-panel");
  if (panel) {
    timeline.add(panel, { opacity: [0, 1], translateY: [24, 0], duration: 760 }, 520);
  }
}
