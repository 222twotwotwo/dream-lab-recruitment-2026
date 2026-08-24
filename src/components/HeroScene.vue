<script setup lang="ts">
import { animate } from "animejs";
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import type * as THREE from "three";
import { prefersReducedMotion } from "../motion";

/**
 * 英雄区星空场景（重写版）：
 * - 马卡龙色星点（奶油白 / 开心果 / 玫瑰 / 薰衣草 / 柠檬），着色器逐星闪烁
 * - 指针视差 + 滚动推进，偶发流星
 * - three.js 运行时按需加载；卸载完整释放
 * - 入场推镜由 anime.js 驱动
 */
const rootRef = useTemplateRef<HTMLDivElement>("root");

let dispose: (() => void) | undefined;

onMounted(async () => {
  const root = rootRef.value;
  if (!root) return;

  // 运行时按需加载 three，保持主包精简
  let THREE: typeof import("three");
  try {
    THREE = await import("three");
  } catch {
    root.classList.add("is-scene-fallback");
    return;
  }

  const hero = root.closest<HTMLElement>(".hero");
  const reduceMotion = prefersReducedMotion.matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    root.classList.add("is-scene-fallback");
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  const cameraState = { x: 0, y: 0, z: reduceMotion ? 10 : 13 };
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  let scrollProgress = 0;
  let scrollTarget = 0;
  let animationId = 0;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  root.appendChild(renderer.domElement);

  // ---- 星点：马卡龙色标 ----
  const STAR_COLORS = [0xfff6ea, 0xc6d9ac, 0xf2a0b0, 0xc9b4e8, 0xf3dfa0];

  const STAR_COUNT = reduceMotion ? 420 : 900;
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const color = new THREE.Color();

  for (let i = 0; i < STAR_COUNT; i += 1) {
    // 分布在相机前方的宽扁空间，越远越密
    positions[i * 3] = (Math.random() - 0.5) * 70;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
    positions[i * 3 + 2] = -Math.pow(Math.random(), 1.6) * 90 - 2;

    color.setHex(STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!);
    // 多数星星偏奶油白，马卡龙色作点缀
    const tint = Math.random();
    if (tint < 0.55) color.setHex(0xfff6ea);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 0.6 + Math.pow(Math.random(), 2.2) * 2.6;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  starGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const starMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float twinkle = 0.62 + 0.38 * sin(uTime * (0.5 + fract(aPhase) * 1.1) + aPhase);
        gl_PointSize = aSize * twinkle * (320.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.02, d);
        alpha *= alpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ---- 流星 ----
  interface Meteor {
    line: THREE.Line;
    material: THREE.LineBasicMaterial;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
  }

  const meteors: Meteor[] = [];
  const METEOR_POOL = 3;
  for (let i = 0; i < METEOR_POOL; i += 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: 0xfff6ea,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geometry, material);
    line.visible = false;
    scene.add(line);
    meteors.push({
      line,
      material,
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1,
    });
  }

  let nextMeteorAt = 2.2;
  function spawnMeteor(elapsed: number): void {
    const meteor = meteors.find((m) => m.life <= 0);
    if (!meteor) return;
    const startX = -18 + Math.random() * 20;
    const startY = 9 + Math.random() * 8;
    const z = -14 - Math.random() * 26;
    const speed = 16 + Math.random() * 10;
    meteor.velocity.set(speed, -speed * (0.42 + Math.random() * 0.2), 0);
    meteor.line.visible = true;
    meteor.line.position.set(startX, startY, z);
    meteor.life = 1;
    meteor.maxLife = 0.9 + Math.random() * 0.5;
    meteor.line.userData["startElapsed"] = elapsed;
  }

  function resize(): void {
    const width = Math.max(1, root!.clientWidth);
    const height = Math.max(1, root!.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw(performance.now());
  }

  function updateScrollTarget(): void {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    scrollTarget = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
  }

  function updatePointer(event: PointerEvent): void {
    const rect = root!.getBoundingClientRect();
    pointerTarget.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    pointerTarget.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * -2;
  }

  const clock = new THREE.Clock();

  function draw(_now: number): void {
    const elapsed = clock.getElapsedTime();
    pointer.x += (pointerTarget.x - pointer.x) * 0.04;
    pointer.y += (pointerTarget.y - pointer.y) * 0.04;
    scrollProgress += (scrollTarget - scrollProgress) * 0.06;

    if (!reduceMotion) {
      if (elapsed >= nextMeteorAt) {
        spawnMeteor(elapsed);
        nextMeteorAt = elapsed + 3.5 + Math.random() * 4;
      }
      for (const meteor of meteors) {
        if (meteor.life <= 0) continue;
        const start = meteor.line.userData["startElapsed"] as number;
        const progress = (elapsed - start) / meteor.maxLife;
        if (progress >= 1) {
          meteor.life = 0;
          meteor.line.visible = false;
          continue;
        }
        meteor.life = 1 - progress;
        meteor.line.position.addScaledVector(meteor.velocity, 1 / 60);
        meteor.material.opacity = Math.sin(progress * Math.PI) * 0.9;
        const tail = meteor.line.geometry.getAttribute("position");
        tail.setXYZ(1, -meteor.velocity.x * 0.09, -meteor.velocity.y * 0.09, 0);
        tail.needsUpdate = true;
      }
    }

    camera.position.set(
      cameraState.x + pointer.x * 0.7,
      cameraState.y + pointer.y * 0.35 + scrollProgress * 1.1,
      cameraState.z - scrollProgress * 2.4,
    );
    camera.lookAt(pointer.x * 1.2, pointer.y * 0.5, -20);
    camera.rotation.z += pointer.x * 0.012;

    renderer.render(scene, camera);
  }

  function renderLoop(now: number): void {
    draw(now);
    animationId = window.requestAnimationFrame(renderLoop);
  }

  updateScrollTarget();
  resize();
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("scroll", updateScrollTarget, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  const observer = new ResizeObserver(resize);
  observer.observe(root);

  // 入场推镜（anime.js 驱动相机状态对象）
  if (!reduceMotion) {
    animate(cameraState, {
      z: 9.2,
      duration: 2200,
      ease: "outExpo",
    });
    renderLoop(performance.now());
  } else {
    draw(performance.now());
  }

  dispose = () => {
    window.cancelAnimationFrame(animationId);
    observer.disconnect();
    window.removeEventListener("pointermove", updatePointer);
    window.removeEventListener("scroll", updateScrollTarget);
    window.removeEventListener("resize", resize);
    starGeometry.dispose();
    starMaterial.dispose();
    for (const meteor of meteors) {
      meteor.line.geometry.dispose();
      meteor.material.dispose();
    }
    renderer.dispose();
    renderer.domElement.remove();
  };
});

onUnmounted(() => {
  dispose?.();
  dispose = undefined;
});
</script>

<template>
  <div ref="root" class="hero-scene-root"></div>
</template>

<style scoped>
.hero-scene-root {
  position: absolute;
  inset: 0;
}
</style>
