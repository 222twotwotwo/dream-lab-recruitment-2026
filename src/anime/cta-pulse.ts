import { animate } from "animejs";
import { prefersReducedMotion } from "./effects";

/** 主 CTA「垂涎欲滴」呼吸脉冲：轻微放大循环，与 hover 扫光叠加 */
export function pulseCta(cta: HTMLElement): void {
  if (prefersReducedMotion.matches) return;
  animate(cta, {
    scale: [1, 1.045],
    duration: 1100,
    ease: "inOutQuad",
    alternate: true,
    loop: true,
  });
}
