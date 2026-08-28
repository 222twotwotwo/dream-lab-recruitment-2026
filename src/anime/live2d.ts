/**
 * Live2D 英雄区角色层：PixiJS + pixi-live2d-display(cubism4) 渲染官方示例模型。
 *
 * 设计要点（贴合 AGENTS.md）：
 * - 运行时按需动态加载 pixi.js / pixi-live2d-display，保持主包精简
 * - 连续姿态更新走自有 rAF（PIXI.Ticker），不经 anime.js 补间
 * - 尊重 prefersReducedMotion：静态渲染一次、停 ticker、关闭自主走动与提醒动画
 * - 角色为常驻陪伴层（position: fixed），随页面滚动逐渐缩小并停靠右下角（滚动联动属连续插值，走 JS 而非 CSS 变量）
 * - 组件只持有 DOM 引用并调用本模块；本模块负责全部渲染、交互与释放
 */
import type { Live2DModel as Live2DModelType } from "pixi-live2d-display/cubism4";

import cubismCoreUrl from "live2dcubismcore/live2dcubismcore.min.js?url";

let coreReady: Promise<void> | undefined;

function ensureCubismCore(): Promise<void> {
  if ((window as unknown as { Live2DCubismCore?: unknown }).Live2DCubismCore) {
    return Promise.resolve();
  }
  coreReady ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = cubismCoreUrl;
    script.async = true;
    script.onload = () => {
      if ((window as unknown as { Live2DCubismCore?: unknown }).Live2DCubismCore) resolve();
      else reject(new Error("Cubism Core 已加载但未暴露全局 Live2DCubismCore"));
    };
    script.onerror = () =>
      reject(new Error("Cubism Core 加载失败（请确认 live2dcubismcore 已安装）"));
    document.head.appendChild(script);
  });
  return coreReady;
}

export interface Live2DMountOptions {
  /** 承载 canvas 的容器元素 */
  container: HTMLElement;
  /** 模型 .model3.json 地址（相对 public 路径） */
  modelUrl: string;
  /** 是否已开启“减少动态效果” */
  reducedMotion: boolean;
  /** 模型就绪回调（用于淡入 / 收起加载态） */
  onReady?: () => void;
}

export interface Live2DHandle {
  dispose(): void;
}

interface MotionManagerLike {
  isFinished(): boolean;
}

function getMotionManager(model: Live2DModelType): MotionManagerLike | undefined {
  const internal = model.internalModel as unknown as {
    motionManager?: MotionManagerLike;
  };
  return internal.motionManager;
}

export async function mountLive2D(opts: Live2DMountOptions): Promise<Live2DHandle> {
  const { container, modelUrl, reducedMotion, onReady } = opts;

  await ensureCubismCore();

  const PIXI = await import("pixi.js");
  const { Live2DModel } = await import("pixi-live2d-display/cubism4");
  Live2DModel.registerTicker(PIXI.Ticker);

  const app = new PIXI.Application({
    resizeTo: container,
    backgroundAlpha: 0,
    antialias: true,
    autoStart: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });
  const canvas = app.view as unknown as HTMLCanvasElement;
  canvas.style.opacity = "0";
  canvas.style.transition = reducedMotion ? "none" : "opacity 0.6s ease";
  container.appendChild(canvas);

  let disposed = false;
  let model: Live2DModelType | undefined;
  let nativeHeight = 0;
  const disposers: Array<() => void> = [];
  let scrollProgress = 0;

  // 抽象锚点系统：英雄居中、滑下后右下角停靠、以及 DOM 上 data-live2d-anchor 标记的任意锚点，
  // 全部以“权重锚点”表示。角色基础位置 = 各锚点目标按权重加权混合，再随滚动平滑过渡；
  // 锚点切换为「吸附态」时触发路径放缩/动作动画，并清除用户拖拽偏移（不论角色此前在何处都吸附）。
  type AnchorAction = "pop" | "hop" | "none";
  interface AnchorCtx {
    w: number;
    h: number;
    t: number;
    heroH: number;
    mobile: boolean;
    small: boolean;
    elMaxWeight: number;
  }
  interface Anchor {
    id: string;
    action: AnchorAction;
    overrideDrag: boolean;
    el?: HTMLElement;
    target: (w: number, h: number, ctx: AnchorCtx) => { x: number; y: number; scale: number };
    weight: (w: number, h: number, ctx: AnchorCtx) => number;
  }
  interface DomAnchor {
    el: HTMLElement;
    id: string;
    scale: number;
    action: AnchorAction;
    offX: number;
    offY: number;
    // 每帧只测一次 getBoundingClientRect，避免逐锚点多次重排（见 layoutModel 刷新）
    rect: DOMRect;
  }

  let anchorDefs: Anchor[] = [];
  let domAnchors: DomAnchor[] = [];
  let heroH = 0;
  // 单一位置状态：角色显示位置（脚底中心屏幕坐标）+ 缩放倍率。
  // 用户拖拽的「相对偏移」不另存变量，而是每帧以 pos - 锚点目标 数学推导；
  // 超限时自动吸附到最近锚点（偏移清零）。
  const pos = { x: 0, y: 0 };
  let scaleMul = 1;
  let posInit = false;
  let currentDominant: string | null = null;
  let pathHop = 0;
  let pathPop = 0;
  let dragging = false;
  let dragPX = 0;
  let dragPY = 0;
  let startPosX = 0;
  let startPosY = 0;
  // 用户相对锚点的偏移（拖拽释放时冻结，不每帧从 pos 反推——否则 target=bx+rel=pos 成恒等、角色无法随锚点平移）
  let userDX = 0;
  let userDY = 0;

  function buildAnchors(): void {
    heroH = document.querySelector<HTMLElement>(".hero")?.offsetHeight || 0;
    domAnchors = Array.from(document.querySelectorAll<HTMLElement>("[data-live2d-anchor]")).map(
      (el, i) => ({
        el,
        id: el.dataset["live2dAnchor"] || `live2d-anchor-${i}`,
        scale: parseFloat(el.dataset["scale"] || "1.4") || 1.4,
        action: ((el.dataset["action"] as AnchorAction) || "pop") as AnchorAction,
        offX: parseFloat(el.dataset["x"] || "0") || 0,
        offY: parseFloat(el.dataset["y"] || "0") || 0,
        rect: el.getBoundingClientRect(),
      }),
    );

    const elAnchorList: Anchor[] = domAnchors.map((d) => ({
      id: d.id,
      action: d.action,
      overrideDrag: true,
      el: d.el,
      target: (_w, _h) => {
        const r = d.rect;
        // 角色锚点原点为脚底(0.5,1)：对齐到元素底部中心 + 偏移；缩放时脚点不动、角色向上生长，位置不随尺寸漂移
        return { x: r.left + r.width / 2 + d.offX, y: r.bottom + d.offY, scale: d.scale };
      },
      weight: (_w, h) => {
        const r = d.rect;
        const vis = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
        return r.height > 0 ? Math.min(1, (vis / r.height) * 1.4) : 0;
      },
    }));

    const heroAnchor: Anchor = {
      id: "hero",
      action: "none",
      overrideDrag: false,
      target: (w, _h, ctx) => ({ x: w * (ctx.mobile ? 0.5 : 0.72), y: _h, scale: 1 - 0.6 * ctx.t }),
      weight: (_w, _h, ctx) => Math.max(0, 1 - ctx.t),
    };

    const dockAnchor: Anchor = {
      id: "dock",
      action: "none",
      overrideDrag: false,
      target: (w, _h, ctx) => ({
        x: w * (ctx.small ? 0.8 : ctx.mobile ? 0.86 : 0.9),
        y: _h,
        scale: 0.4,
      }),
      // 被元素锚点稀释：元素锚点占据视口时，停靠锚点权重退场；
      // 用 (1 - 2*elMaxWeight) 形成迟滞，避免与元素锚点在 elMax≈0.5 处反复争抢主导权
      weight: (_w, _h, ctx) => Math.max(0, ctx.t) * Math.max(0, 1 - 2 * ctx.elMaxWeight),
    };

    anchorDefs = [heroAnchor, dockAnchor, ...elAnchorList];
  }

  // 滚动联动：随页面下滑（约一个视口高度）从 0 过渡到 1
  function computeScroll(): void {
    scrollProgress = Math.max(
      0,
      Math.min(1, window.scrollY / (window.innerHeight || 1)),
    );
    if (reducedMotion && model) {
      layoutModel();
      app.render();
    }
  }

  // 每帧定位：抽象锚点加权混合 + 平滑过渡（吸附路径）+ 自主走动
  function layoutModel(): void {
    if (!model || nativeHeight <= 0) return;
    const w = app.screen.width;
    const h = app.screen.height;
    if (w <= 0 || h <= 0) return;
    const mobile = w <= 700;
    const small = w <= 480;
    const ratio = small ? 0.72 : mobile ? 0.86 : 1;
    const baseScale = (h * ratio) / nativeHeight;

    // 每帧只测一次 DOM 锚点矩形，避免逐锚点多次 getBoundingClientRect 触发重排
    for (const d of domAnchors) d.rect = d.el.getBoundingClientRect();

    // 元素锚点最大权重（用于稀释停靠锚点）
    let elMaxWeight = 0;
    for (const d of domAnchors) {
      const r = d.rect;
      const vis = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
      const wt = r.height > 0 ? Math.min(1, (vis / r.height) * 1.4) : 0;
      if (wt > elMaxWeight) elMaxWeight = wt;
    }

    const ctx: AnchorCtx = { w, h, t: scrollProgress, heroH, mobile, small, elMaxWeight };

    // 1) 各锚点按权重加权混合得到目标基础位置/缩放
    let sw = 0;
    let bx = 0;
    let by = 0;
    let bs = 0;
    let dominantId: string | null = null;
    let dominantW = -1;
    for (const a of anchorDefs) {
      const wt = a.weight(w, h, ctx);
      if (wt <= 0) continue;
      const tg = a.target(w, h, ctx);
      bx += tg.x * wt;
      by += tg.y * wt;
      bs += tg.scale * wt;
      sw += wt;
      if (wt > dominantW) {
        dominantW = wt;
        dominantId = a.id;
      }
    }
    if (sw > 0) {
      bx /= sw;
      by /= sw;
      bs /= sw;
    } else {
      bx = w * 0.9;
      by = h;
      bs = 0.4;
    }

    // 2) 决定“自由态”目标
    //    - 拖拽中：跟随指针，并持续捕获相对偏移（userD* = pos - 锚点）
    //    - 自由态且“锚点+偏移”整体在界内：保留冻结的相对偏移，随锚点平移
    //    - “锚点+偏移”越界：吸附回主导锚点（偏移清零），落定后恢复自由
    // 注意：判定一律基于“预期落点(锚点+偏移)”的可见度，而非当前插值位置——
    // 否则角色在越界回弹过程中会反复跨过 0.5 阈值，导致吸附/自由分支来回横跳。
    const desiredX = bx + userDX;
    const desiredY = by + userDY;
    const desiredVis = visibleFrac(desiredX, desiredY, w, h);
    let targetX: number;
    let targetY: number;
    let targetScale: number;
    let activeId: string | null;
    if (dragging) {
      targetX = pos.x;
      targetY = pos.y;
      targetScale = bs;
      activeId = dominantId;
      userDX = pos.x - bx;
      userDY = pos.y - by;
    } else if (desiredVis >= 0.5) {
      // 预期落点在界内：应用冻结的相对偏移（角色随锚点一起平移，偏移恒定）
      targetX = desiredX;
      targetY = desiredY;
      targetScale = bs;
      activeId = dominantId;
    } else {
      // 吸附回主导锚点（偏移清零，准确落位，而非卡在边缘反复横跳）
      targetX = bx;
      targetY = by;
      targetScale = bs;
      activeId = dominantId;
      if (
        visibleFrac(pos.x, pos.y, w, h) >= 0.5 &&
        Math.abs(pos.x - bx) < 6 &&
        Math.abs(pos.y - by) < 6
      ) {
        userDX = 0; // 已落定到锚点附近 -> 偏移归零（desiredVis 随即回到界内）
        userDY = 0;
      }
    }

    // 4) 平滑插值（吸附路径，不瞬移）
    const k = posInit ? 0.14 : 1;
    pos.x += (targetX - pos.x) * k;
    pos.y += (targetY - pos.y) * k;
    scaleMul += (targetScale - scaleMul) * k;
    if (Math.abs(targetX - pos.x) < 6 && Math.abs(targetY - pos.y) < 6) {
      pos.x = targetX;
      pos.y = targetY;
    }
    posInit = true;
    pathPop *= 0.86;
    pathHop *= 0.86;

    // 5) 主锚点（activeId）切换上升沿：触发路径动作/放缩动画 + engaged 标记
    const active = anchorDefs.find((a) => a.id === activeId) || null;
    if (active && active.id !== currentDominant) {
      if (active.action === "pop") pathPop = 0.32;
      if (active.action === "hop" || active.action === "pop") pathHop = 36;
      if (active.action !== "none") {
        try {
          model.motion("TapBody", 0);
        } catch {
          /* 无对应动作组时忽略 */
        }
      }
    }
    if (active?.id !== currentDominant) {
      for (const d of domAnchors) {
        if (d.id === active?.id) d.el.setAttribute("data-live2d-engaged", "");
        else d.el.removeAttribute("data-live2d-engaged");
      }
      currentDominant = active?.id ?? null;
    }

    model.scale.set(baseScale * scaleMul * (1 + pathPop));

    // 6) 自主走动（仅自由态、非拖拽、未吸附 overrideDrag 锚点时）
    const anchorEngaged = active ? active.overrideDrag : false;
    let dx = 0;
    let dy = 0;
    if (!reducedMotion && !dragging && !anchorEngaged && !mobile) {
      const phase = performance.now() / 900;
      dx = Math.sin(phase) * 22;
      dy = -Math.abs(Math.sin(phase)) * 5;
    }

    // 7) 落点（pathHop 仅作吸附瞬间的小跳跃视觉偏移，不污染基础位置）
    model.position.set(pos.x + dx, pos.y + dy - pathHop);

    // 8) 置顶：离场后或吸附态时角色压在区块之上
    const layerEl = container.parentElement ?? container;
    layerEl.style.zIndex = scrollProgress > 0.85 || anchorEngaged ? "60" : "";
    container.style.setProperty("--gx", mobile ? "50%" : "72%");

    // 9) 同步触屏拾取层到角色包围盒（仅触屏下 pointer-events:auto 才生效）
    if (hit) {
      const b = charRect();
      if (b) {
        hit.style.left = `${b.left}px`;
        hit.style.top = `${b.top}px`;
        hit.style.width = `${b.right - b.left}px`;
        hit.style.height = `${b.bottom - b.top}px`;
      }
    }
  }

  // 角色可见面积占比（pos 为脚底中心）：用于判断是否“超限”需要吸附回锚点
  function visibleFrac(cx: number, by: number, W: number, H: number): number {
    if (!model) return 1;
    const cw = model.width;
    const ch = model.height;
    const left = cx - cw / 2;
    const right = cx + cw / 2;
    const top = by - ch;
    const bottom = by;
    const visW = Math.max(0, Math.min(right, W) - Math.max(left, 0));
    const visH = Math.max(0, Math.min(bottom, H) - Math.max(top, 0));
    const area = cw * ch;
    return area > 0 ? (visW * visH) / area : 1;
  }

  function pointerToFocus(event: PointerEvent): void {
    if (!model || reducedMotion) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      // 指针离开英雄区：回归正前凝视（模型中心）
      model.focus(model.x, model.y - model.height * 0.5);
      return;
    }
    // model.focus 接受「世界像素坐标」（与 stage 同坐标系），不是归一化 [-1,1]
    model.focus(event.clientX - rect.left, event.clientY - rect.top);
  }

  function onTap(event: PointerEvent): void {
    if (!model || reducedMotion) return;
    const target = event.target as HTMLElement | null;
    if (target && target.closest("a, button")) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (model.hitTest(event.clientX - rect.left, event.clientY - rect.top).length > 0) {
      void model.motion("TapBody");
    }
  }

  // 角色在屏幕上的实际可拾取包围盒（stage 坐标 == 视口坐标）。
  // 注意 model.getBounds() 是整张模型画布（含大量透明留白），直接当命中区会让触屏拾取层过大、
  // 挡住下方内容点击/滚动；这里按比例内缩，只保留角色躯干/头部区域（脚底保留）。
  function charRect(): { left: number; top: number; right: number; bottom: number } | null {
    if (!model) return null;
    const b = model.getBounds();
    const w = b.width;
    const h = b.height;
    const ix = w * 0.22; // 左右各收 22%，去掉肩部/画布透明边
    const iyT = h * 0.22; // 顶部收 22%
    const iyB = h * 0.05; // 脚底保留
    return {
      left: b.x + ix,
      top: b.y + iyT,
      right: b.x + w - ix,
      bottom: b.y + h - iyB,
    };
  }

  function beginDrag(event: PointerEvent): void {
    if (!model || reducedMotion) return;
    const rect = charRect();
    if (!rect) return;
    const pad = 26;
    if (
      event.clientX < rect.left - pad ||
      event.clientX > rect.right + pad ||
      event.clientY < rect.top - pad ||
      event.clientY > rect.bottom + pad
    ) {
      return; // 没按在角色上，放行给下方内容
    }
    dragging = true;
    dragPX = event.clientX;
    dragPY = event.clientY;
    startPosX = pos.x;
    startPosY = pos.y;
    const layer = container.parentElement;
    if (layer) {
      layer.style.pointerEvents = "auto"; // 拖拽期间独占事件，避免误触内容
      layer.style.cursor = "grabbing";
    }
    event.preventDefault();
  }

  function onDragMove(event: PointerEvent): void {
    if (!model || reducedMotion || !dragging) return;
    // 角色刚性跟随指针：直写单一 pos；相对偏移 = pos - 锚点目标，由 layoutModel 每帧数学推导
    pos.x = startPosX + (event.clientX - dragPX);
    pos.y = startPosY + (event.clientY - dragPY);
    event.preventDefault();
  }

  function onDragUp(): void {
    if (!dragging) return;
    dragging = false;
    // 释放后由 layoutModel 依据“锚点+偏移”是否越界决定自由态/吸附（不再需要额外标志）
    const layer = container.parentElement;
    if (layer) {
      layer.style.pointerEvents = ""; // 恢复穿透，不再阻挡内容点击
      layer.style.cursor = "";
    }
    if (hit && activePointerId !== null) {
      try {
        hit.releasePointerCapture(activePointerId);
      } catch {
        /* noop */
      }
      activePointerId = null;
    }
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  // 角色拾取层：仅覆盖角色包围盒，触屏下 pointer-events:auto + touch-action:none，
  // 让“按在角色上拖动”不被浏览器当作滚动手势（否则会触发 pointercancel 导致拖动断断续续）；
  // 桌面端 pointer-events:none，仍由 window 监听 + charRect 判定，不阻挡内容点击。
  let hit: HTMLDivElement | null = null;
  let activePointerId: number | null = null;

  const tick = (): void => {
    if (!model || disposed) return;
    model.update(Math.min(app.ticker.deltaMS, 50));
    const mm = getMotionManager(model);
    if (mm && mm.isFinished()) void model.motion("Idle");
    layoutModel();
  };

  try {
    const loaded = await Live2DModel.from(modelUrl, { autoInteract: false });
    if (disposed) {
      loaded.destroy();
      return createHandle();
    }
    model = loaded;
    model.autoUpdate = false;
    app.stage.addChild(model);
    model.anchor.set(0.5, 1);
    nativeHeight = model.height; // 记录 scale=1 时的原生高度
    buildAnchors();
    layoutModel();

    // 角色拾取层（触屏拖动专用）
    hit = document.createElement("div");
    hit.setAttribute("aria-hidden", "true");
    hit.setAttribute("data-live2d-hit", "");
    hit.style.position = "absolute";
    hit.style.left = "0px";
    hit.style.top = "0px";
    hit.style.width = "0px";
    hit.style.height = "0px";
    hit.style.pointerEvents = coarsePointer ? "auto" : "none";
    hit.style.touchAction = "none";
    hit.style.zIndex = "2";
    container.appendChild(hit);
    const hitEl = hit;
    hitEl.addEventListener("pointerdown", (e: PointerEvent) => {
      if (e.pointerType === "mouse") return; // 鼠标走 window 监听
      try {
        hitEl.setPointerCapture(e.pointerId);
        activePointerId = e.pointerId;
      } catch {
        /* noop */
      }
      beginDrag(e);
    });
    disposers.push(() => hitEl.remove());

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    if (reducedMotion) {
      app.ticker.stop();
      model.update(0);
      app.render();
    } else {
      app.ticker.add(tick);
    }

    window.addEventListener("pointermove", pointerToFocus);
    disposers.push(() => window.removeEventListener("pointermove", pointerToFocus));
    window.addEventListener("pointerdown", onTap);
    disposers.push(() => window.removeEventListener("pointerdown", onTap));
    const onWinDragDown = (e: PointerEvent): void => {
      if (e.pointerType === "touch") return; // 触屏走 hit 层（带指针捕获），避免与 window 重复触发
      beginDrag(e);
    };
    window.addEventListener("pointerdown", onWinDragDown, { passive: false });
    window.addEventListener("pointermove", onDragMove, { passive: false });
    window.addEventListener("pointerup", onDragUp);
    window.addEventListener("pointercancel", onDragUp);
    disposers.push(() => {
      window.removeEventListener("pointerdown", onWinDragDown);
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDragUp);
      window.removeEventListener("pointercancel", onDragUp);
    });
    window.addEventListener("scroll", computeScroll, { passive: true });
    disposers.push(() => window.removeEventListener("scroll", computeScroll));
    const onResize = (): void => {
      buildAnchors(); // 视口/布局变化会改变英雄高度与锚点文档坐标
      computeScroll();
    };
    window.addEventListener("resize", onResize);
    disposers.push(() => window.removeEventListener("resize", onResize));
    const onLoad = (): void => buildAnchors(); // 图片加载完后布局可能位移
    window.addEventListener("load", onLoad);
    disposers.push(() => window.removeEventListener("load", onLoad));
    // 标签页隐藏时停掉渲染循环（省电省 CPU），恢复时重启（reducedMotion 下本就静态）
    const onVisibility = (): void => {
      if (document.hidden) app.ticker.stop();
      else if (!reducedMotion) app.ticker.start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    disposers.push(() => document.removeEventListener("visibilitychange", onVisibility));
    computeScroll();

    onReady?.();
  } catch (err) {
    console.error("[HeroLive2D] 模型加载失败：", err);
  }

  function createHandle(): Live2DHandle {
    return {
      dispose(): void {
        if (disposed) return;
        disposed = true;
        for (const off of disposers) off();
        disposers.length = 0;
        try {
          app.ticker.remove(tick);
          app.ticker.stop();
        } catch {
          /* noop */
        }
        try {
          model?.destroy({ children: true, texture: true, baseTexture: true });
        } catch {
          /* noop */
        }
        try {
          app.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch {
          /* noop */
        }
      },
    };
  }

  return createHandle();
}
