import { prefersReducedMotion } from "./effects";

/**
 * DLAB 字标像素流体扰动（SiteFooter 固定揭示带的巨字交互）：
 * - 离屏栅格化「DLAB」满宽字标（站酷庆科黄油体 + 玫瑰菱形点缀，颜色取自 :root 令牌）
 * - 字标被切成粗块格网格，每格存速度/位移；指针划过注入冲量，
 *   冲量强度 ∝ 指针动量（瞬时速度，封顶防甩穿），快甩大块位移、慢移只起微澜
 * - 速度场做粘滞扩散 + 弹簧回零 + 阻尼衰减
 * - 守恒甩出（有得必有失，alpha 级）：位移达甩出门槛的块面滑向落点，
 *   透明度按注入动量定三级档（1.0 / 0.7 / 0.45）；原位缺损随离位程度加深，
 *   残块透明度 = 1 − α，块面归位时缺损被同步填回
 * - 方向性阻力：采样推进方向前方的墨量——往字身推阻力放大（难以撞击本体），
 *   往字外空处推阻力衰减（块面顺畅飞出）；甩出门槛亦按去向衰减（字外 1 格即飞）
 * - 能量归零即停渲染循环，静止零开销；prefersReducedMotion 只绘制原状字标
 * - 连续物理模拟非补间：渲染循环用 rAF 驱动（同 HeroScene 先例），不经 anime.js
 */

const WORD = "DLAB";
const WORDMARK_FONT = '"ZCOOL QingKe HuangYou", "Bahnschrift", "Segoe UI", sans-serif';

/** 动量→冲量换算：impulse = speed^0.65 × MOMENTUM（device px/s），慢移微澜、快甩大块 */
const MOMENTUM = 620;
/** 指针速度封顶（css px/ms）：极端甩动不无限放大 */
const SPEED_CAP = 2.6;
/** 冲量作用半径（block 格倍数）：覆盖更宽的推出带 */
const RADIUS_CELLS = 3.2;
/** 粘滞扩散系数（0-1，邻格速度混合比例）：偏高让块面成团被推走 */
const VISCOSITY = 0.28;
/** 速度阻尼（1/s） */
const DAMPING = 5.5;
/** 位移回零弹簧刚度（1/s²） */
const SPRING = 70;
/** 静止阈值（block 格比例）：低于量化半步（cell/4）时所有格归位，停循环 */
const SETTLE_CELL_RATIO = 0.25;
/** 甩出门槛上限（block 格数）：往字身方向推的离位门槛 */
const FLIGHT_CELLS = 2;
/** 甩出档位速度阈值（css px/ms）：注入动量 ≥ TIER_SPEED_3 定实心档，≥ TIER_SPEED_2 定中等档，其余一律最低淡影档 */
const TIER_SPEED_2 = 1.0;
const TIER_SPEED_3 = 1.7;
/** 三级甩出块透明度：淡影 / 中等 / 实心（按注入动量定档，飞行中不变） */
const TIER_ALPHA_1 = 0.45;
const TIER_ALPHA_2 = 0.7;
const TIER_ALPHA_3 = 1;
/** 字体内部阻力：推向字身方向（前方墨多）的相对质量——略难撞击本体 */
const INK_MASS = 1.6;
/** 字外阻力：推向空处（前方无墨）的相对质量——往字外飞出顺畅 */
const OUT_FACTOR = 0.6;

export interface DlabFluid {
  /** 字体/布局变化后重绘（组件通常无需手动调用，内部已观察尺寸） */
  refresh(): void;
  destroy(): void;
}

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

export function createDlabFluid(canvas: HTMLCanvasElement): DlabFluid {
  const context = canvas.getContext("2d");
  if (!context) return { refresh() {}, destroy() {} };
  const ctx: CanvasRenderingContext2D = context;

  const reduceMotion = prefersReducedMotion.matches;

  // 原状字标栅格：所有扰动都从它整格取样
  const source = document.createElement("canvas");
  const sourceCtx: CanvasRenderingContext2D | null = source.getContext("2d");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let cell = 24;
  let settlePx = 12;
  let cols = 0;
  let rows = 0;
  let vx = new Float32Array(0);
  let vy = new Float32Array(0);
  let ox = new Float32Array(0);
  let oy = new Float32Array(0);
  let lapVx = new Float32Array(0);
  let lapVy = new Float32Array(0);
  // 逐格墨量覆盖（0-1）：方向性阻力的采样源
  let coverage = new Float32Array(0);
  // 甩出档位（注入时按动量定档 ≥ 0.45；飞行途中不变，归位清零）
  let tier = new Float32Array(0);

  let raf = 0;
  let lastFrame = 0;
  let disposed = false;
  let last: PointerSample | undefined;
  let cachedRect: DOMRect | undefined;

  function token(name: string, fallback: string): string {
    const value = getComputedStyle(canvas).getPropertyValue(name).trim();
    return value || fallback;
  }

  // ---- 字标栅格化：满宽排布 D L A B ◆，间隙均分，字号按宽度约束收缩 ----

  function rasterize(): void {
    if (disposed || !sourceCtx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === width && h === height && source.width === w) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    source.width = w;
    source.height = h;

    // 块格尺寸：随字高缩放（取偶数，保证半格量化步长仍为整数像素）
    cell = Math.min(30, Math.max(8, Math.round(h / 18 / 2) * 2));
    settlePx = cell * SETTLE_CELL_RATIO;
    cols = Math.ceil(w / cell);
    rows = Math.ceil(h / cell);
    const n = cols * rows;
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    ox = new Float32Array(n);
    oy = new Float32Array(n);
    lapVx = new Float32Array(n);
    lapVy = new Float32Array(n);
    tier = new Float32Array(n);
    coverage = new Float32Array(n);

    drawWordmark(sourceCtx);

    // 逐格墨量覆盖（3×3 采样均值）：方向性阻力的采样源
    const img = sourceCtx.getImageData(0, 0, width, height).data;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        let sum = 0;
        for (let sy = 0; sy < 3; sy += 1) {
          for (let sx = 0; sx < 3; sx += 1) {
            const px = Math.min(width - 1, c * cell + Math.floor(((sx + 0.5) / 3) * cell));
            const py = Math.min(height - 1, r * cell + Math.floor(((sy + 0.5) / 3) * cell));
            sum += img[(py * width + px) * 4 + 3]!;
          }
        }
        coverage[r * cols + c] = sum / (9 * 255);
      }
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0);
  }

  function drawWordmark(c: CanvasRenderingContext2D): void {
    c.clearRect(0, 0, width, height);
    const ink = token("--ink", "#4E3D47");
    const rose = token("--orange", "#E9899B");
    const pad = Math.max(6, Math.round(width * 0.016));
    const avail = width - pad * 2;
    const GAP_MIN_RATIO = 0.045;

    // 字号：先按估算基准，再用实测墨迹高度校准，让字母真正撑满带高（≈94%）
    const CAP_RATIO = 0.72; // 无衬线大写墨迹/字号比的常见初值
    const INK_TARGET = 0.94;
    let fs = (height * INK_TARGET) / CAP_RATIO;
    c.font = `400 ${fs}px ${WORDMARK_FONT}`;
    const probe = c.measureText(WORD);
    const probeInk = (probe.actualBoundingBoxAscent || CAP_RATIO * fs) + (probe.actualBoundingBoxDescent || 0);
    if (probeInk > 0) fs *= (height * INK_TARGET) / probeInk;

    // 宽度：优先横向拉伸放大字母（而非留大白间隙）；放不下则等比缩字号
    const gaps = WORD.length - 1; // 4 字母之间共 3 道缝
    c.font = `400 ${fs}px ${WORDMARK_FONT}`;
    let widths = [...WORD].map((ch) => c.measureText(ch).width);
    const gap = fs * GAP_MIN_RATIO;
    const natural = widths.reduce((sum, w) => sum + w, 0);
    let stretch = Math.min(2, (avail - gap * gaps) / natural);
    if (stretch < 1) {
      fs *= stretch;
      c.font = `400 ${fs}px ${WORDMARK_FONT}`;
      widths = [...WORD].map((ch) => c.measureText(ch).width);
      stretch = 1;
    }
    // 拉伸封顶后的剩余宽度均分进字距，保证字标满宽
    const gapFinal = Math.max(gap, (avail - natural * stretch) / gaps);

    // 垂直居中：按实际墨迹边界，而非字体行高
    const metrics = c.measureText(WORD);
    const ascent = metrics.actualBoundingBoxAscent || fs * CAP_RATIO;
    const descent = metrics.actualBoundingBoxDescent || 0;
    const baseline = (height + ascent - descent) / 2;

    c.fillStyle = ink;
    c.textBaseline = "alphabetic";
    let x = pad;
    let bLeft = 0;
    let bSlotW = 0;
    for (let i = 0; i < WORD.length; i += 1) {
      const w = widths[i]! * stretch;
      if (WORD[i] === "B") {
        bLeft = x;
        bSlotW = w;
      }
      c.save();
      c.translate(x, 0);
      c.scale(stretch, 1);
      c.fillText(WORD[i]!, 0, baseline);
      c.restore();
      x += w + gapFinal;
    }

    // 玫瑰菱形：内嵌于 B 竖笔（|）正中——在 70% 字高处的干净横行测竖笔区间
    // （中段行会与 B 的横档连成一片，中心会偏到横档上）
    const half = (fs * 0.15) / 2;
    const crossY = Math.round(baseline - ascent * 0.5);
    const probeY = Math.round(baseline - ascent * 0.7);
    const row = c.getImageData(0, probeY, width, 1).data;
    const x0 = Math.max(0, Math.floor(bLeft));
    const x1 = Math.min(width - 1, Math.floor(bLeft + bSlotW));
    let runStart = -1;
    let runEnd = -1;
    for (let px = x0; px <= x1; px += 1) {
      const a = row[px * 4 + 3]!;
      if (a > 128) {
        if (runStart < 0) runStart = px;
      } else if (runStart >= 0) {
        runEnd = px - 1;
        break;
      }
    }
    if (runStart >= 0 && runEnd < 0) runEnd = x1; // 墨迹一直延到槽尾
    const stemW = runEnd >= runStart ? runEnd - runStart + 1 : bSlotW;
    // 略向右偏：视觉居中补偿（竖笔扫描中心偏左一点点）
    const stemCx = runStart >= 0 ? (runStart + runEnd) / 2 + stemW * 0.1 : bLeft + bSlotW / 2;
    const dh = Math.min(half, (stemW / 2) * 0.9);
    c.fillStyle = rose;
    c.beginPath();
    c.moveTo(stemCx, crossY - dh);
    c.lineTo(stemCx + dh, crossY);
    c.lineTo(stemCx, crossY + dh);
    c.lineTo(stemCx - dh, crossY);
    c.closePath();
    c.fill();
  }

  // ---- 指针动量注入 ----

  function inject(cx: number, cy: number, dx: number, dy: number, dtms: number): void {
    const dist = Math.hypot(dx, dy);
    if (dist <= 0 || dtms <= 0) return;
    const speed = Math.min(dist / dtms, SPEED_CAP); // css px/ms
    const ux = dx / dist;
    const uy = dy / dist;
    // 动量非线性映射：低速也有可感知的微澜，高速显著增强
    const impulse = Math.pow(speed, 0.65) * MOMENTUM * dpr; // device px/s
    // 甩出档位：注入瞬间按当时动量定档（飞行途中不变，归位后由下次注入重新定档）
    const flightTier =
      speed >= TIER_SPEED_3 ? TIER_ALPHA_3 : speed >= TIER_SPEED_2 ? TIER_ALPHA_2 : TIER_ALPHA_1;
    const gx = cx * dpr;
    const gy = cy * dpr;
    const radius = cell * RADIUS_CELLS;
    const span = Math.ceil(radius / cell);
    const ccx = Math.floor(gx / cell);
    const ccy = Math.floor(gy / cell);
    for (let ry = ccy - span; ry <= ccy + span; ry += 1) {
      if (ry < 0 || ry >= rows) continue;
      for (let rx = ccx - span; rx <= ccx + span; rx += 1) {
        if (rx < 0 || rx >= cols) continue;
        const ddx = (rx + 0.5) * cell - gx;
        const ddy = (ry + 0.5) * cell - gy;
        const d = Math.hypot(ddx, ddy);
        if (d >= radius) continue;
        const fall = 1 - d / radius;
        const weight = fall * fall;
        const i = ry * cols + rx;
        // 方向性阻力：采样推进方向前方的墨量——往字外（前方空）阻力衰减易飞出，
        // 往字身（前方墨多）阻力放大难以撞击本体
        const probeX = gx + ux * cell * 1.2;
        const probeY = gy + uy * cell * 1.2;
        const pcx = Math.min(cols - 1, Math.max(0, Math.floor(probeX / cell)));
        const pcy = Math.min(rows - 1, Math.max(0, Math.floor(probeY / cell)));
        const ahead = coverage[pcy * cols + pcx]!;
        const resistance = OUT_FACTOR + (INK_MASS - OUT_FACTOR) * ahead;
        vx[i] = vx[i]! + (ux * impulse * weight) / resistance;
        vy[i] = vy[i]! + (uy * impulse * weight) / resistance;
        // 档位只升不降：飞行中的实心块不被后续轻掠降档
        if (flightTier > tier[i]!) tier[i] = flightTier;
      }
    }
  }

  function onPointerMove(event: PointerEvent): void {
    // 惰性取 rect：指针加载后即悬停在画布上时不依赖 pointerenter
    if (!cachedRect) cachedRect = canvas.getBoundingClientRect();
    const x = event.clientX - cachedRect.left;
    const y = event.clientY - cachedRect.top;
    const t = event.timeStamp;
    if (last) {
      // 快速划过时沿轨迹分段注入，留下连续尾迹
      const stepPx = (cell / dpr) * 0.7; // css px：约 0.7 格一段，保证尾迹连续
      const seg = Math.min(24, Math.max(1, Math.ceil(Math.hypot(x - last.x, y - last.y) / stepPx)));
      const dtms = Math.max(1, t - last.t);
      for (let s = 1; s <= seg; s += 1) {
        const px = last.x + ((x - last.x) * s) / seg;
        const py = last.y + ((y - last.y) * s) / seg;
        inject(px, py, x - last.x, y - last.y, dtms);
      }
    }
    last = { x, y, t };
    startLoop();
  }

  function onPointerEnter(event: PointerEvent): void {
    cachedRect = canvas.getBoundingClientRect();
    // 重置采样：不携带进入前的陈旧速度
    last = { x: event.clientX - cachedRect.left, y: event.clientY - cachedRect.top, t: event.timeStamp };
  }

  function onPointerLeave(): void {
    last = undefined;
    // 剩余能量自然衰减回原状
    startLoop();
  }

  // ---- 物理步进与渲染 ----

  /** 甩出门槛按去向衰减：往字外（前方空）1 格即飞，往字身（前方墨多）2 格才飞 */
  function flightThreshold(r: number, c: number, qx: number, qy: number): number {
    const mag = Math.hypot(qx, qy);
    if (mag < 1) return cell * FLIGHT_CELLS;
    const probeX = (c + 0.5) * cell + (qx / mag) * cell * 1.2;
    const probeY = (r + 0.5) * cell + (qy / mag) * cell * 1.2;
    const pcx = Math.min(cols - 1, Math.max(0, Math.floor(probeX / cell)));
    const pcy = Math.min(rows - 1, Math.max(0, Math.floor(probeY / cell)));
    const ahead = coverage[pcy * cols + pcx]!;
    return cell * (FLIGHT_CELLS - (FLIGHT_CELLS - 1) * (1 - ahead));
  }

  /** 单帧步进，返回最大位移（device px） */
  function step(dt: number): number {
    const damp = Math.exp(-DAMPING * dt);
    const qStep = cell / 2;
    let maxOffset = 0;
    // 粘滞扩散：先按旧场算邻域均值（双缓冲），再统一写回
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const i = r * cols + c;
        const left = c > 0 ? i - 1 : i;
        const right = c < cols - 1 ? i + 1 : i;
        const up = r > 0 ? i - cols : i;
        const down = r < rows - 1 ? i + cols : i;
        lapVx[i] = (vx[left]! + vx[right]! + vx[up]! + vx[down]!) * 0.25;
        lapVy[i] = (vy[left]! + vy[right]! + vy[up]! + vy[down]!) * 0.25;
      }
    }
    for (let i = 0; i < vx.length; i += 1) {
      let nvx = (vx[i]! + (lapVx[i]! - vx[i]!) * VISCOSITY) * damp - ox[i]! * SPRING * dt;
      let nvy = (vy[i]! + (lapVy[i]! - vy[i]!) * VISCOSITY) * damp - oy[i]! * SPRING * dt;
      // 位移极小时硬归零，避免无限小数循环
      if (Math.abs(nvx) < 1 && Math.abs(ox[i]!) < 0.1) nvx = 0;
      if (Math.abs(nvy) < 1 && Math.abs(oy[i]!) < 0.1) nvy = 0;
      vx[i] = nvx;
      vy[i] = nvy;
      ox[i] = ox[i]! + nvx * dt;
      oy[i] = oy[i]! + nvy * dt;
      // 归位（量化位移不足甩出门槛）即清档，下次甩出按新动量重新定档
      const rr = Math.floor(i / cols);
      const cc = i - rr * cols;
      const qxc = Math.round(ox[i]! / qStep) * qStep;
      const qyc = Math.round(oy[i]! / qStep) * qStep;
      const thr = flightThreshold(rr, cc, qxc, qyc);
      if (Math.abs(qxc) < thr && Math.abs(qyc) < thr) tier[i] = 0;
      const mag = Math.abs(ox[i]!) + Math.abs(oy[i]!);
      if (mag > maxOffset) maxOffset = mag;
    }
    return maxOffset;
  }

  function render(): void {
    ctx.clearRect(0, 0, width, height);
    const qStep = cell / 2; // 半格步长量化：整块平移、无模糊插值
    ctx.drawImage(source, 0, 0);
    const maxX = width - cell;
    const maxY = height - cell;
    for (let r = 0; r < rows; r += 1) {
      const dy = r * cell;
      for (let c = 0; c < cols; c += 1) {
        const i = r * cols + c;
        const qx = Math.round(ox[i]! / qStep) * qStep;
        const qy = Math.round(oy[i]! / qStep) * qStep;
        if (qx === 0 && qy === 0) continue; // 未扰动格已在原状底图上，跳过
        const dx = c * cell;
        const thr = flightThreshold(r, c, qx, qy);
        // 离位程度 0→1：块面被推走多少，原位缺损就深多少（有得必有失，alpha 级守恒）
        const departure = Math.min(1, Math.max(Math.abs(qx), Math.abs(qy)) / thr);
        const alpha = tier[i]!;
        ctx.clearRect(dx, dy, cell, cell);
        const residual = (1 - alpha) * departure;
        if (residual > 0.01) {
          ctx.globalAlpha = residual;
          ctx.drawImage(source, dx, dy, cell, cell, dx, dy, cell, cell);
        }
        // 被推出的块滑向落点（q 逐帧连续增长，推出过程可见）
        ctx.globalAlpha = alpha;
        const ex = Math.min(maxX, Math.max(0, dx + qx));
        const ey = Math.min(maxY, Math.max(0, dy + qy));
        ctx.drawImage(source, dx, dy, cell, cell, ex, ey, cell, cell);
        ctx.globalAlpha = 1;
      }
    }
  }

  function frame(now: number): void {
    raf = 0;
    const dt = Math.min(0.032, Math.max(0.001, (now - lastFrame) / 1000));
    lastFrame = now;
    const maxOffset = step(dt);
    render();
    if (maxOffset < settlePx) return; // 全部归位（残影同步填回），停循环
    raf = requestAnimationFrame(frame);
  }

  function startLoop(): void {
    if (raf || reduceMotion || disposed) return;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // ---- 布局与字体就绪 ----

  let rasterQueued = false;
  function scheduleRaster(): void {
    if (rasterQueued || disposed) return;
    rasterQueued = true;
    requestAnimationFrame(() => {
      rasterQueued = false;
      rasterize();
    });
  }

  const observer = new ResizeObserver(scheduleRaster);
  observer.observe(canvas);

  // canvas fillText 不会触发 @font-face 加载：显式请求 DLAB 所需字集
  void document.fonts
    .load(`400 80px "ZCOOL QingKe HuangYou"`, WORD)
    .catch(() => undefined)
    .then(() => {
      // 字体就绪后重排字标（此前以回退字体栅格化）
      width = 0;
      scheduleRaster();
    });

  if (!reduceMotion) {
    canvas.addEventListener("pointerenter", onPointerEnter);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
  }

  return {
    refresh() {
      cachedRect = undefined;
      scheduleRaster();
    },
    destroy() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}
