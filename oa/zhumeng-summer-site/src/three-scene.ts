import * as THREE from 'three';

/**
 * 逐梦之夏 · 3D 背景场景（丰富版）
 * - Shader 渐变天穹：晨光奶油 → 蜜桃橙，缓慢呼吸
 * - 云海：分层 billboard 云朵精灵漂移（近大远小）
 * - 萤火光尘：双层发光粒子缓缓上升
 * - 飘落花瓣：旋转下落、随风摆动
 * - 丁达尔光束：顶部斜射暖金光柱
 * - 鼠标视差 + 滚动下潜
 * 配色：奶油底 + 蜜橙点缀，无蓝紫渐变，与站内二次元插画同源。
 */

/** 生成柔焦云朵贴图（多个径向渐变叠加） */
function makeCloudTexture(): THREE.CanvasTexture {
  const size = 256;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  const puffs = 7;
  for (let p = 0; p < puffs; p++) {
    const x = size * (0.28 + Math.random() * 0.44);
    const y = size * (0.3 + Math.random() * 0.4);
    const r = size * (0.1 + Math.random() * 0.16);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  return tex;
}

/** 生成圆形光斑贴图（发光粒子用） */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,244,220,0.7)');
  g.addColorStop(1, 'rgba(255,244,220,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

/** 生成花瓣贴图（暖橙椭圆 + 柔边） */
function makePetalTexture(): THREE.CanvasTexture {
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d')!;
  ctx.translate(size / 2, size / 2);
  ctx.rotate(Math.PI / 5);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, size / 2.2);
  g.addColorStop(0, 'rgba(255,176,120,0.95)');
  g.addColorStop(0.7, 'rgba(255,150,95,0.75)');
  g.addColorStop(1, 'rgba(255,150,95,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.34, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(cv);
}

/** 生成光束贴图（上亮下透明的纵向渐变） */
function makeRayTexture(): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 64;
  cv.height = 256;
  const ctx = cv.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,225,180,0.5)');
  g.addColorStop(0.55, 'rgba(255,225,180,0.14)');
  g.addColorStop(1, 'rgba(255,225,180,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 256);
  // 横向柔化：两侧透明
  const m = ctx.createLinearGradient(0, 0, 64, 0);
  m.addColorStop(0, 'rgba(0,0,0,1)');
  m.addColorStop(0.5, 'rgba(0,0,0,0)');
  m.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = m;
  ctx.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(cv);
}

export function initScene(container: HTMLElement): void {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xfdf3e3, 20, 52);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 7.5, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  /* ---------- 渐变天穹（Shader，跟随相机） ---------- */
  const skyUniforms = {
    uTop: { value: new THREE.Color(0xffdfb8) },
    uHorizon: { value: new THREE.Color(0xfdf8f0) },
    uTime: { value: 0 }
  };
  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform float uTime;
      varying vec3 vPos;
      void main() {
        // 归一化高度：-1(下) ~ 1(上)
        float h = normalize(vPos).y;
        float t = smoothstep(-0.15, 0.75, h);
        // 轻微的时间呼吸：暖色微微起伏
        vec3 top = uTop * (1.0 + 0.03 * sin(uTime * 0.25));
        vec3 col = mix(uHorizon, top, t);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(90, 32, 24), skyMat);
  skyDome.renderOrder = -10;
  scene.add(skyDome);

  /* ---------- 云海：分层 billboard 云朵精灵 ---------- */
  const cloudTex = makeCloudTexture();
  interface Cloud {
    sprite: THREE.Sprite;
    speed: number;
    baseY: number;
    bobPhase: number;
    bobAmp: number;
    span: number;
  }
  const clouds: Cloud[] = [];
  const CLOUD_SPAN = 46;

  function addCloud(z: number, y: number, scale: number, opacity: number, tint: number): void {
    const mat = new THREE.SpriteMaterial({
      map: cloudTex,
      color: tint,
      transparent: true,
      opacity,
      depthWrite: false,
      fog: false
    });
    const sprite = new THREE.Sprite(mat);
    const x = (Math.random() - 0.5) * CLOUD_SPAN;
    sprite.position.set(x, y, z);
    sprite.scale.set(scale, scale * 0.55, 1);
    scene.add(sprite);
    clouds.push({
      sprite,
      speed: 0.15 + Math.random() * 0.3,
      baseY: y,
      bobPhase: Math.random() * Math.PI * 2,
      bobAmp: 0.15 + Math.random() * 0.3,
      span: CLOUD_SPAN
    });
  }

  // 底部云海（浓密，暖白带橙染）
  for (let c = 0; c < 22; c++) {
    const depth = Math.random();
    addCloud(
      -2 - depth * 20,
      -3.4 - depth * 1.6 + Math.random() * 0.8,
      6 + depth * 9,
      0.5 + Math.random() * 0.3,
      c % 3 === 0 ? 0xffe3c4 : 0xfff6ea
    );
  }
  // 远景高空薄云（大而淡）
  for (let c = 0; c < 8; c++) {
    addCloud(
      -26 - Math.random() * 10,
      3 + Math.random() * 5,
      14 + Math.random() * 8,
      0.16 + Math.random() * 0.12,
      0xfff1dd
    );
  }

  /* ---------- 萤火光尘：双层发光粒子 ---------- */
  const glowTex = makeGlowTexture();

  function makeMotes(count: number, size: number, opacity: number, color: number, yRange: number): {
    points: THREE.Points;
    baseX: Float32Array;
    baseZ: Float32Array;
    speeds: Float32Array;
    phases: Float32Array;
    yRange: number;
  } {
    const positions = new Float32Array(count * 3);
    const baseX = new Float32Array(count);
    const baseZ = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    for (let k = 0; k < count; k++) {
      baseX[k] = (Math.random() - 0.5) * 40;
      baseZ[k] = -2 - Math.random() * 22;
      speeds[k] = 0.25 + Math.random() * 0.5;
      phases[k] = Math.random() * Math.PI * 2;
      positions[k * 3] = baseX[k];
      positions[k * 3 + 1] = Math.random() * yRange - 4;
      positions[k * 3 + 2] = baseZ[k];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size,
      map: glowTex,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { points, baseX, baseZ, speeds, phases, yRange };
  }

  // 远层：细小密致的金尘；近层：稍大的暖橙光点
  const motesFar = makeMotes(90, 0.22, 0.5, 0xf3c98e, 14);
  const motesNear = makeMotes(40, 0.42, 0.65, 0xf59e5b, 12);
  const motesFarPos = motesFar.points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const motesNearPos = motesNear.points.geometry.getAttribute('position') as THREE.BufferAttribute;

  /* ---------- 飘落花瓣 ---------- */
  const petalTex = makePetalTexture();
  interface Petal {
    mesh: THREE.Mesh;
    fallSpeed: number;
    rotSpeed: number;
    swayPhase: number;
    swayAmp: number;
  }
  const petals: Petal[] = [];
  const petalGeo = new THREE.PlaneGeometry(0.34, 0.22);
  for (let p = 0; p < 26; p++) {
    const mat = new THREE.MeshBasicMaterial({
      map: petalTex,
      transparent: true,
      opacity: 0.5 + Math.random() * 0.4,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(petalGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      -4 + Math.random() * 14,
      -1 - Math.random() * 14
    );
    mesh.rotation.z = Math.random() * Math.PI * 2;
    scene.add(mesh);
    petals.push({
      mesh,
      fallSpeed: 0.25 + Math.random() * 0.45,
      rotSpeed: 0.4 + Math.random() * 1.2,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.6 + Math.random() * 1.2
    });
  }

  /* ---------- 丁达尔光束 ---------- */
  const rayTex = makeRayTexture();
  interface Ray {
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    phase: number;
    baseOpacity: number;
  }
  const rays: Ray[] = [];
  for (let r = 0; r < 4; r++) {
    const mat = new THREE.MeshBasicMaterial({
      map: rayTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2 + r * 1.1, 26), mat);
    mesh.position.set(-12 + r * 8 + Math.random() * 2, 4, -14 - r * 3);
    mesh.rotation.z = 0.35 + Math.random() * 0.2;
    scene.add(mesh);
    rays.push({ mesh, mat, phase: Math.random() * Math.PI * 2, baseOpacity: 0.1 + Math.random() * 0.08 });
  }

  /* ---------- 交互 ---------- */
  const mouse = { x: 0, y: 0 };
  let scrollRatio = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('scroll', () => {
    const max = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    scrollRatio = window.scrollY / max;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- 动画循环 ---------- */
  const clock = new THREE.Clock();
  let elapsed = 0;

  function animate(): void {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;
    const t = elapsed;

    skyUniforms.uTime.value = t;

    // 云海：横向漂移 + 轻微起伏
    for (const c of clouds) {
      c.sprite.position.x += c.speed * dt;
      if (c.sprite.position.x > c.span / 2) c.sprite.position.x = -c.span / 2;
      c.sprite.position.y = c.baseY + Math.sin(t * 0.3 + c.bobPhase) * c.bobAmp;
    }

    // 光尘：上升 + 摇摆
    const updateMotes = (
      m: ReturnType<typeof makeMotes>,
      attr: THREE.BufferAttribute
    ): void => {
      for (let k = 0; k < m.speeds.length; k++) {
        let y = attr.getY(k) + m.speeds[k] * dt;
        if (y > m.yRange - 4) y = -4;
        attr.setY(k, y);
        attr.setX(k, m.baseX[k] + Math.sin(t * 0.5 + m.phases[k]) * 0.6);
      }
      attr.needsUpdate = true;
    };
    updateMotes(motesFar, motesFarPos);
    updateMotes(motesNear, motesNearPos);

    // 花瓣：下落 + 旋转 + 摆动
    for (const p of petals) {
      p.mesh.position.y -= p.fallSpeed * dt;
      p.mesh.position.x += Math.sin(t * 0.8 + p.swayPhase) * 0.004 * p.swayAmp;
      p.mesh.rotation.z += p.rotSpeed * dt;
      p.mesh.rotation.x += p.rotSpeed * 0.6 * dt;
      if (p.mesh.position.y < -6) {
        p.mesh.position.y = 10 + Math.random() * 4;
        p.mesh.position.x = (Math.random() - 0.5) * 30;
      }
    }

    // 光束：明暗呼吸
    for (const r of rays) {
      r.mat.opacity = r.baseOpacity * (0.65 + 0.35 * Math.sin(t * 0.4 + r.phase));
    }

    // 相机：鼠标视差 + 滚动下潜
    const targetX = mouse.x * 1.6;
    const targetY = 7.5 - scrollRatio * 9 - mouse.y * 0.8;
    const targetZ = 16 - scrollRatio * 4;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.lookAt(0, -1 - scrollRatio * 5, 0);
    skyDome.position.copy(camera.position);

    renderer.render(scene, camera);
  }
  animate();
}
