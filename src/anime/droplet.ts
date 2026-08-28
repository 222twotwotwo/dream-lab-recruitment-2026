import { animate, spring } from "animejs";
import { prefersReducedMotion } from "./effects";

/** 导航水滴指示器动画（位置/可见性状态由 SiteHeader 维护） */

/** 进场：从 0 弹性长大 */
export function showDroplet(droplet: HTMLElement): void {
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

/** 退场：收缩消散 */
export function hideDroplet(droplet: HTMLElement): void {
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

export interface DropletRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 粘滞位移：弹簧滑动 + 先拉长再回弹的挤压 */
export function slideDroplet(droplet: HTMLElement, rect: DropletRect): void {
  animate(droplet, {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    duration: 640,
    ease: spring({ stiffness: 190, damping: 15 }),
  });
  animate(droplet, {
    scaleX: [1.28, 0.92, 1],
    scaleY: [0.78, 1.1, 1],
    duration: 640,
    ease: "outQuad",
  });
}
