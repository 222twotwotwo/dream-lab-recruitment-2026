import { prefersReducedMotion } from "./effects";

/**
 * 方向页低功耗 WebGL 极光背景：
 * - 纯 shader 生成，不引入 three.js，保持主包精简
 * - 滚动进度与指针会轻微扰动色斑，形成视差感
 * - prefersReducedMotion 时只渲染一帧静态背景，不启动 rAF
 */

export interface DirectionAurora {
  setScroll(progress: number): void;
  setPointer(x: number, y: number): void;
  destroy(): void;
}

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uPointer;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = (uv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);

    float t = uTime * 0.08;
    float drift = uScroll * 2.4;
    vec2 pointer = uPointer * 0.18;

    vec3 bg = mix(vec3(0.70, 0.83, 0.62), vec3(0.52, 0.70, 0.48), uv.y);

    vec3 teal = vec3(0.36, 0.58, 0.26);
    vec3 rose = vec3(0.88, 0.46, 0.56);
    vec3 lilac = vec3(0.60, 0.48, 0.80);

    vec2 p1 = vec2(
      sin(t * 0.82 + drift * 0.11) * 0.62 + pointer.x,
      cos(t * 0.61) * 0.34 + pointer.y
    );
    float d1 = length(p - p1);
    vec3 c = teal * exp(-d1 * d1 * 2.0) * 0.62;

    vec2 p2 = vec2(
      cos(t * 0.67 + 2.1 + drift * 0.07) * 0.54 - pointer.x,
      sin(t * 0.49 + 1.2) * 0.30 - pointer.y * 0.6
    );
    float d2 = length(p - p2);
    c += rose * exp(-d2 * d2 * 1.9) * 0.46;

    vec2 p3 = vec2(
      sin(t * 0.9 + 4.2 + drift * 0.16) * 0.48,
      cos(t * 0.75 - 0.7) * 0.31 + pointer.y * 0.4
    );
    float d3 = length(p - p3);
    c += lilac * exp(-d3 * d3 * 2.4) * 0.40;

    // 细网格：随滚动横向漂移，增强“水平视差”的体感
    vec2 gv = fract(p * 7.0 + vec2(drift, 0.0)) - 0.5;
    float grid = smoothstep(0.045, 0.0, min(abs(gv.x), abs(gv.y)));
    c += vec3(0.30, 0.26, 0.30) * grid * 0.035;

    vec2 p4 = vec2(
      sin(t * 0.55 + drift * 0.2) * 0.42,
      cos(t * 0.7 - 1.4) * 0.40 + pointer.y * 0.3
    );
    float d4 = length(p - p4);
    c += teal * exp(-d4 * d4 * 2.3) * 0.40;

    float vignette = smoothstep(1.45, 0.45, length(p));
    vec3 color = bg + c * vignette * 0.82;

    // 高光软压缩：多块色斑叠加溢出时保持色相，避免被裁切成纯白
    float m = max(color.r, max(color.g, color.b));
    if (m > 1.0) {
      color = mix(color, color / m, smoothstep(1.0, 1.22, m));
    }

    gl_FragColor = vec4(color, 0.88);
  }
`;

export function createDirectionAurora(canvas: HTMLCanvasElement): DirectionAurora {
  const reduceMotion = prefersReducedMotion.matches;
  const context = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });

  const noop: DirectionAurora = {
    setScroll() {},
    setPointer() {},
    destroy() {},
  };

  if (!context) return noop;
  const gl: WebGLRenderingContext = context;

  function compileShader(type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return noop;

  const program = gl.createProgram();
  if (!program) return noop;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return noop;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "uResolution");
  const timeLocation = gl.getUniformLocation(program, "uTime");
  const scrollLocation = gl.getUniformLocation(program, "uScroll");
  const pointerLocation = gl.getUniformLocation(program, "uPointer");

  let width = 1;
  let height = 1;
  let scroll = 0;
  let pointerX = 0;
  let pointerY = 0;
  let raf = 0;
  const start = performance.now();

  function draw(now: number): void {
    const time = reduceMotion ? 0 : (now - start) / 1000;
    gl.uniform2f(resolutionLocation, width, height);
    gl.uniform1f(timeLocation, time);
    gl.uniform1f(scrollLocation, scroll);
    gl.uniform2f(pointerLocation, pointerX, pointerY);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame(now: number): void {
    draw(now);
    if (!reduceMotion) raf = window.requestAnimationFrame(frame);
  }

  function resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    draw(performance.now());
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  if (reduceMotion) {
    draw(performance.now());
  } else {
    raf = window.requestAnimationFrame(frame);
  }

  return {
    setScroll(progress) {
      scroll = Math.min(1, Math.max(0, progress));
    },
    setPointer(x, y) {
      pointerX = x;
      pointerY = y;
    },
    destroy() {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    },
  };
}
