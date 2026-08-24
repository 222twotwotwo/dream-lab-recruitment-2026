<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import type * as THREE from "three";
import { prefersReducedMotion } from "../motion";

/**
 * 英雄区 Three.js 数据流场景。
 * 相比原版修复：卸载时完整释放（RAF、监听器、几何体、材质、纹理、渲染器）；
 * 去掉不必要的 preserveDrawingBuffer；入场推镜改为内部补间。
 */
const rootRef = useTemplateRef<HTMLDivElement>("root");

let dispose: (() => void) | undefined;

onMounted(async () => {
  const root = rootRef.value;
  if (!root) return;

  // 运行时按需加载 three，保持主包精简（与原版 CDN 动态 import 等价）
  let THREE: typeof import("three");
  try {
    THREE = await import("three");
  } catch {
    root.classList.add("is-scene-fallback");
    return;
  }

  const hero = root.closest<HTMLElement>(".hero");
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
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const reduceMotion = prefersReducedMotion.matches;
  const clock = new THREE.Clock();
  const cameraState = { x: 0, y: 1.12, z: reduceMotion ? 6.1 : 7.2 };
  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0 };
  let scrollProgress = 0;
  let scrollTarget = 0;
  let animationId = 0;

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  root.appendChild(renderer.domElement);

  scene.fog = new THREE.FogExp2(0x071314, 0.055);
  scene.add(new THREE.AmbientLight(0xbffdf4, 0.32));

  const coreLight = new THREE.PointLight(0x00fff0, 3.4, 20);
  coreLight.position.set(3.6, 1.8, -5.8);
  scene.add(coreLight);

  const warmLight = new THREE.PointLight(0xff8a45, 2.4, 16);
  warmLight.position.set(-2.2, 0.4, -3.4);
  scene.add(warmLight);

  const world = new THREE.Group();
  world.position.set(1.55, 0, -1.2);
  scene.add(world);

  function lineSegments(points: THREE.Vector3[], color: number, opacity: number): THREE.LineSegments {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.LineSegments(geometry, material);
  }

  const gridPoints: THREE.Vector3[] = [];
  for (let x = -8; x <= 8.01; x += 0.8) {
    gridPoints.push(new THREE.Vector3(x, -1.42, -25), new THREE.Vector3(x, -1.42, 3.2));
  }
  for (let z = -25; z <= 3.21; z += 0.8) {
    gridPoints.push(new THREE.Vector3(-8, -1.42, z), new THREE.Vector3(8, -1.42, z));
  }
  const grid = lineSegments(gridPoints, 0x3cf5df, 0.13);
  world.add(grid);

  const lanePoints: THREE.Vector3[] = [];
  for (const x of [-1.35, 1.35]) {
    lanePoints.push(new THREE.Vector3(x, -1.38, -24), new THREE.Vector3(x, -1.38, 2.6));
  }
  const lane = lineSegments(lanePoints, 0xff7a38, 0.48);
  world.add(lane);

  interface PulsePath {
    color: number;
    points: [number, number, number][];
  }

  const paths: PulsePath[] = [
    {
      color: 0x00f5d4,
      points: [
        [-4.7, -0.72, 1.1],
        [-2.2, -0.12, -3.8],
        [0.8, 0.26, -8.5],
        [3.6, 0.18, -14.6],
        [4.4, 0.88, -20.5],
      ],
    },
    {
      color: 0xff7a38,
      points: [
        [-3.4, -1.0, 1.8],
        [-1.1, -0.58, -3.2],
        [1.8, -0.26, -7.2],
        [2.7, 0.42, -12.4],
        [5.0, 0.2, -18.6],
      ],
    },
    {
      color: 0x9a7dff,
      points: [
        [-5.2, 0.42, -0.4],
        [-2.4, 0.92, -4.9],
        [0.2, 1.16, -9.6],
        [2.8, 1.08, -15.8],
        [4.0, 1.74, -21.8],
      ],
    },
  ];

  const pulses: THREE.Mesh[] = [];
  const curves: THREE.CatmullRomCurve3[] = [];
  const nodeGeometry = new THREE.SphereGeometry(0.07, 16, 16);

  paths.forEach((path, pathIndex) => {
    const curve = new THREE.CatmullRomCurve3(
      path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
    curves.push(curve);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 120, 0.024, 8, false),
      new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.64,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    world.add(tube);

    [0.08, 0.34, 0.62, 0.88].forEach((step, nodeIndex) => {
      const node = new THREE.Mesh(
        nodeGeometry,
        new THREE.MeshBasicMaterial({
          color: nodeIndex % 2 ? 0xffffff : path.color,
          transparent: true,
          opacity: nodeIndex % 2 ? 0.82 : 0.74,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      node.position.copy(curve.getPointAt(step));
      node.scale.setScalar(nodeIndex % 2 ? 1.25 : 1);
      world.add(node);
    });

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 20, 20),
      new THREE.MeshBasicMaterial({
        color: path.color,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    pulse.userData = { curveIndex: pathIndex, offset: pathIndex * 0.28, speed: 0.055 + pathIndex * 0.012 };
    pulses.push(pulse);
    world.add(pulse);
  });

  const particleCount = Math.min(640, Math.max(280, Math.floor((root.clientWidth * root.clientHeight) / 2200)));
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions[index * 3] = Math.random() * 13 - 6.5;
    particlePositions[index * 3 + 1] = Math.random() * 4.8 - 1.2;
    particlePositions[index * 3 + 2] = Math.random() * -24 + 1.8;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: 0xb8fff5,
      size: 0.035,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  world.add(particles);

  const ringGeometry = new THREE.RingGeometry(1.38, 1.41, 96);
  const rings = Array.from({ length: 5 }, (_, index) => {
    const ring = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({
        color: index % 2 ? 0xff7a38 : 0x00f5d4,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    ring.position.set(2.6 + index * 0.16, 0.12 + index * 0.2, -5.4 - index * 3.35);
    ring.scale.set(1.72 + index * 0.18, 0.64 + index * 0.04, 1);
    world.add(ring);
    return ring;
  });

  function labelSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d context unavailable");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(5, 14, 16, 0.55)";
    context.strokeStyle = color;
    context.lineWidth = 3;
    if (typeof context.roundRect === "function") {
      context.roundRect(12, 20, 232, 56, 10);
    } else {
      context.rect(12, 20, 232, 56);
    }
    context.fill();
    context.stroke();
    context.fillStyle = "#f9fff9";
    context.font = "800 30px Cascadia Mono, Consolas, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 49);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      }),
    );
    sprite.scale.set(1.18, 0.44, 1);
    return sprite;
  }

  (
    [
      ["WEB", "#00f5d4", -0.4, 1.72, -4.8],
      ["GO", "#ff7a38", 3.7, 1.22, -7.6],
      ["ACM", "#9a7dff", 1.5, 2.2, -11.2],
      ["RAG", "#00f5d4", 4.6, 1.88, -14.4],
      ["OJ", "#ff7a38", 2.5, 2.74, -18.4],
    ] as const
  ).forEach(([text, color, x, y, z]) => {
    const sprite = labelSprite(text, color);
    sprite.position.set(x, y, z);
    world.add(sprite);
  });

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

  // 入场推镜（替代原 anime 对 cameraState 的补间）
  const introStart = performance.now();
  const INTRO_DURATION = 1900;
  function easeOutExpo(t: number): number {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function draw(now: number): void {
    const elapsed = clock.getElapsedTime();
    pointer.x += (pointerTarget.x - pointer.x) * 0.045;
    pointer.y += (pointerTarget.y - pointer.y) * 0.045;
    scrollProgress += (scrollTarget - scrollProgress) * 0.06;

    world.rotation.y = Math.sin(elapsed * 0.18) * 0.035 + pointer.x * 0.07;
    world.rotation.x = -0.04 + pointer.y * 0.025 + scrollProgress * 0.055;
    (grid.material as THREE.LineBasicMaterial).opacity =
      0.12 + Math.sin(elapsed * 0.9) * 0.035;
    (lane.material as THREE.LineBasicMaterial).opacity =
      0.36 + Math.sin(elapsed * 1.4) * 0.1;
    particles.rotation.y = elapsed * 0.018;
    particles.rotation.x = Math.sin(elapsed * 0.13) * 0.018;

    pulses.forEach((pulse) => {
      const { curveIndex, offset, speed } = pulse.userData as {
        curveIndex: number;
        offset: number;
        speed: number;
      };
      const point = curves[curveIndex]!.getPointAt((elapsed * speed + offset) % 1);
      pulse.position.copy(point);
      pulse.scale.setScalar(0.82 + Math.sin(elapsed * 5.2 + offset * 12) * 0.16);
    });

    rings.forEach((ring, index) => {
      ring.rotation.z = elapsed * (index % 2 ? -0.075 : 0.065);
      (ring.material as THREE.MeshBasicMaterial).opacity =
        0.13 + Math.sin(elapsed * 1.15 + index) * 0.045;
    });

    coreLight.intensity = 2.8 + Math.sin(elapsed * 1.35) * 0.42;
    warmLight.intensity = 2.0 + Math.cos(elapsed * 1.05) * 0.3;

    if (!reduceMotion && now < introStart + INTRO_DURATION) {
      const progress = easeOutExpo((now - introStart) / INTRO_DURATION);
      cameraState.z = 7.2 + (5.95 - 7.2) * progress;
      cameraState.y = 1.12 + (1.24 - 1.12) * progress;
    }

    camera.position.set(
      cameraState.x + pointer.x * 0.46,
      cameraState.y + pointer.y * 0.18 + scrollProgress * 0.68,
      cameraState.z - scrollProgress * 0.95,
    );
    camera.lookAt(pointer.x * 0.72, -0.16 + pointer.y * 0.08, -7.4 - scrollProgress * 2.1);
    camera.rotation.z += pointer.x * 0.018;

    renderer.render(scene, camera);
  }

  function renderLoop(now: number): void {
    draw(now);
    if (!reduceMotion) {
      animationId = window.requestAnimationFrame(renderLoop);
    }
  }

  updateScrollTarget();
  resize();
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("scroll", updateScrollTarget, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  const observer = new ResizeObserver(resize);
  observer.observe(root);

  renderLoop(performance.now());

  dispose = () => {
    window.cancelAnimationFrame(animationId);
    observer.disconnect();
    window.removeEventListener("pointermove", updatePointer);
    window.removeEventListener("scroll", updateScrollTarget);
    window.removeEventListener("resize", resize);
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const material of materials) {
        const mat = material as THREE.Material & { map?: THREE.Texture };
        mat?.map?.dispose();
        mat?.dispose();
      }
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
});

onUnmounted(() => {
  dispose?.();
  dispose = undefined;
});
</script>

<style scoped>
.hero-scene-root {
  position: absolute;
  inset: 0;
}
</style>

<template>
  <div ref="root" class="hero-scene-root"></div>
</template>
