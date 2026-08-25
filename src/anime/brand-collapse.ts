import { createTimeline } from "animejs";
import { prefersReducedMotion } from "./effects";

/**
 * 品牌字样收合（SiteHeader 浮起联动）：
 * - 字号随浮起逐渐 +2px
 * - 末字向前逐字旋出（室 → 验 → 实 → 新 → 创），只保留前 KEEP 个字（“逐梦”）
 * - 旋出的字宽度收合到 0：实体消失，不残留占位、不拦截指针（悬停穿透）
 * - seek(progress) 随滚动双向擦洗，回卷即逆操作
 */
const KEEP = 2;
const FONT_GROW = 3;

export interface BrandCollapse {
  /** progress: 0 = 完整字样；1 = 只剩前 KEEP 字且字号 +3px */
  seek(progress: number): void;
  /** 断点字号变化后重测字宽并重建时间轴 */
  remeasure(): void;
}

export function createBrandCollapse(text: HTMLElement): BrandCollapse {
  // 字符即 text 的直接子元素，避免依赖哈希类名
  const chars = Array.from(text.children) as HTMLElement[];
  const removable = chars.slice(KEEP).reverse();
  let baseFs = measureFontSize();
  let timeline = build();

  function measureFontSize(): number {
    return parseFloat(getComputedStyle(text).fontSize) || 17;
  }

  function build() {
    // autoplay 必须关闭：v4 时间轴默认创建即播放，会在未滚动时自己播一遍退字
    const tl = createTimeline({ autoplay: false, defaults: { ease: "inOutQuad" } });
    for (const ch of removable) {
      tl.add(ch, {
        width: [ch.offsetWidth, 0],
        opacity: [1, 0],
        rotate: ["0deg", "80deg"],
        duration: 280,
      });
    }
    // 双保险：即便参数被忽略也立即暂停，进度只由 seek 驱动
    tl.pause();
    return tl;
  }

  function clearCharStyles(): void {
    for (const ch of chars) {
      ch.style.width = "";
      ch.style.opacity = "";
      ch.style.transform = "";
    }
  }

  return {
    seek(progress) {
      if (prefersReducedMotion.matches) return;
      const p = Math.min(1, Math.max(0, progress));
      // 未悬浮时保持自然状态：清除全部内联样式，不施加退字动画
      if (p <= 0) {
        clearCharStyles();
        text.style.fontSize = "";
        return;
      }
      timeline.seek(timeline.duration * p);
      text.style.fontSize = `${baseFs + FONT_GROW * p}px`;
    },
    remeasure() {
      clearCharStyles();
      text.style.fontSize = "";
      baseFs = measureFontSize();
      timeline = build();
    },
  };
}
