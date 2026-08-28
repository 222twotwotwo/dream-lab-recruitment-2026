import { animate } from "animejs";
import { prefersReducedMotion } from "./effects";

export interface CameraState {
  x: number;
  y: number;
  z: number;
}

/** 星空入场推镜：anime.js 驱动相机状态对象，渲染循环每帧读取 */
export function dollyCamera(cameraState: CameraState): void {
  if (prefersReducedMotion.matches) return;
  animate(cameraState, {
    z: 9.2,
    duration: 2200,
    ease: "outExpo",
  });
}
