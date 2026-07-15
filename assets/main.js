(function () {
  const tracks = {
    frontend: {
      title: "开发组 - 前端",
      tag: "Web / JavaScript / TypeScript",
      logos: [
        { icon: "./assets/logos/javascript.svg", label: "JavaScript" },
        { icon: "./assets/logos/typescript.svg", label: "TypeScript" }
      ],
      intro:
        "适合想做网页交互、工程化和产品界面的同学。重点训练 HTML / CSS / JavaScript 基础、组件化思维和真实项目协作能力。",
      details: [
        {
          title: "招募要求",
          items: [
            "具备基础计算机思维，愿意系统学习前端基础与浏览器工作方式",
            "熟悉 HTML / CSS / JavaScript 更好，零基础同学可通过任务逐步追赶",
            "对界面细节、交互体验和工程质量有耐心"
          ]
        },
        {
          title: "可获得资源",
          items: [
            "Web 前端学习路线、工程化实践和项目拆解",
            "组件开发、页面适配、动效实现和调试经验",
            "参与实验室真实站点、工具页或活动页面开发"
          ]
        }
      ]
    },
    backend: {
      title: "开发组 - 后端",
      tag: "Java / Go / Service",
      logos: [
        { icon: "./assets/logos/java.svg", label: "Java" },
        { icon: "./assets/logos/go.svg", label: "Go" }
      ],
      intro:
        "适合想把业务逻辑、数据存储和服务稳定性做扎实的同学。后端方向围绕 Java / Go、接口设计、数据库和工程实践展开。",
      details: [
        {
          title: "招募要求",
          items: [
            "具备计算机基础，愿意深入学习一门后端语言和常见开发规范",
            "了解 Java / Go、数据库、HTTP 接口任一方向更好",
            "能坚持完成阶段任务，并在代码评审中持续改进"
          ]
        },
        {
          title: "可获得资源",
          items: [
            "Java / Go 两种方向的后端学习资料和项目案例",
            "接口设计、数据库建模、服务部署和故障排查训练",
            "由学长带着理解真实后端项目的协作流程"
          ]
        }
      ]
    },
    client: {
      title: "开发组 - 客户端",
      tag: "Kotlin / Android / App",
      logos: [
        { icon: "./assets/logos/kotlin.svg", label: "Kotlin" }
      ],
      intro:
        "适合希望做移动端应用、设备侧交互和 App 工程的同学。客户端方向以 Kotlin 为主，强调界面、状态和本地能力的完整实现。",
      details: [
        {
          title: "招募要求",
          items: [
            "具备基础编程能力，愿意学习 Kotlin 与客户端开发方式",
            "对 App 交互、页面状态、接口联调和设备适配感兴趣",
            "零基础同学可从语法、页面和小功能任务逐步进入"
          ]
        },
        {
          title: "可获得资源",
          items: [
            "Kotlin 客户端方向由学长持续指导",
            "从基础页面、接口联调到完整 App 功能的实践任务",
            "理解客户端项目结构、调试方式和发布前检查"
          ]
        }
      ]
    },
    media: {
      title: "数媒组",
      tag: "DCC / Game Engine / AIGC / XR",
      logos: [
        { icon: "./assets/logos/cplusplus.svg", label: "C++" },
        { icon: "./assets/logos/csharp.svg", label: "C#" },
        { icon: "./assets/logos/unrealengine.svg", label: "Unreal Engine" },
        { icon: "./assets/logos/unity.svg", label: "Unity" },
        { icon: "./assets/logos/blender.svg", label: "Blender" },
        { icon: "./assets/logos/maya.svg", label: "Maya" }
      ],
      intro:
        "适合对三维内容、实时引擎、AIGC 和交互可视化感兴趣的同学。这里更看重作品意识、审美判断和愿意长期打磨复杂工具链的耐心。",
      details: [
        {
          title: "招募要求",
          items: [
            "至少了解或使用过一款 DCC 软件或游戏引擎（Unity / Unreal），并附自己的作品展示",
            "了解 Blender、Maya、3ds Max、ZBrush、Substance Painter、Houdini 等工具更好",
            "了解或使用过主流 AIGC 工具，如 Midjourney、ComfyUI",
            "有基本的逻辑思维和数学直觉",
            "有良好的审美能力，有任意美术能力优先",
            "英语阅读能力尚可",
            "有编程基础，任何语言均可，C++ / C# 优先",
            "对游戏引擎（Unity / Unreal）、着色器 / 材质、3D 建模 / UV 展开 / 法线贴图、物理引擎 / 粒子系统中任一概念有模糊认知",
            "坐得住冷板凳，不怕从零开始，有好奇心"
          ]
        },
        {
          title: "发展方向",
          items: [
            "技术美术",
            "数字孪生及其可视化",
            "三维仿真开发",
            "数字人开发",
            "影视与虚拟制片",
            "游戏引擎 / 图形开发工程师",
            "XR 应用 / 开发"
          ]
        }
      ]
    },
    contest: {
      title: "竞赛组",
      tag: "Algorithm / Modeling / Kaggle",
      logos: [
        { icon: "./assets/logos/cplusplus.svg", label: "C++" },
        { icon: "./assets/logos/python.svg", label: "Python" }
      ],
      intro:
        "适合希望深入钻研计算机技术、积累竞赛经验的同学。这里强调稳定训练、复盘和模拟赛，把热爱打磨成可量化的结果。",
      details: [
        {
          title: "招募面向",
          items: [
            "积极参与各类计算机相关比赛",
            "希望进入算法、建模、AI / 数据相关竞赛训练",
            "愿意接受持续任务安排和阶段复盘"
          ]
        },
        {
          title: "培养形式",
          items: [
            "日常线上任务安排",
            "每周线下会议或模拟赛",
            "推荐语言为 C++ / Python"
          ]
        },
        {
          title: "训练营支撑",
          items: [
            "往届算法训练营采用线上刷题任务、线下公开课、以赛促学",
            "刷题和训练赛覆盖牛客网、力扣、洛谷等 OJ 平台",
            "面向 ICPC、CCPC、CACC、蓝桥杯、RAICOM、GPLT 等赛事制定备赛计划"
          ]
        }
      ]
    },
    agent: {
      title: "Agent 组",
      tag: "Tool Calling / Context / RAG",
      logos: [
        { icon: "./assets/logos/python.svg", label: "Python" },
        { icon: "./assets/logos/typescript.svg", label: "TypeScript" },
        { icon: "./assets/logos/javascript.svg", label: "JavaScript" }
      ],
      intro:
        "适合对 AI Agent 开发感兴趣、想做自己的 Agent 框架或工具运行时的同学。不满足于只用产品，而是想搞清楚 Agent 如何调度工具、读取上下文并和系统交互。",
      details: [
        {
          title: "招募面向",
          items: [
            "有编程基础更好，没有也行，愿意学就行",
            "想从底层理解 Agent 框架、工具调用和系统交互",
            "愿意边写边拆，不只停留在体验产品"
          ]
        },
        {
          title: "培养形式",
          items: [
            "从工具调用、上下文管理、多步推理切入",
            "继续拆 RAG、权限管理、运行时设计等核心问题",
            "参考 OpenClaw，但目标是造自己的轮子：CLI Agent 或桌面 Agent 都可以"
          ]
        }
      ]
    }
  };

  const header = document.querySelector(".site-header");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const trackButtons = Array.from(document.querySelectorAll("[data-track]"));
  const trackPanel = document.querySelector("#track-panel");
  const copyButton = document.querySelector("[data-copy-title]");
  const copyStatus = document.querySelector(".copy-status");
  const carousel = document.querySelector("[data-carousel]");
  const companyCarousel = document.querySelector("[data-company-carousel]");
  const heroSceneRoot = document.querySelector("[data-hero-scene]");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const THREE_MODULE_URL = "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
  const devTrackKeys = ["frontend", "backend", "client", "media"];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTrackDetail(detail) {
    return `
      <section class="track-detail">
        <h4>${escapeHtml(detail.title)}</h4>
        <ul>
          ${detail.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  function renderTrackDetails(details) {
    return `
      <div class="track-detail-grid">
        ${details.map(renderTrackDetail).join("")}
      </div>
    `;
  }

  function renderTrackLogos(logos) {
    if (!logos?.length) return "";

    return `
      <div class="track-logo-list" aria-label="相关技术标识">
        ${logos
          .map(
            (logo) => `
              <span class="track-logo" title="${escapeHtml(logo.label)}">
                <img class="track-logo-img" src="${escapeHtml(logo.icon)}" alt="" width="24" height="24" loading="lazy" decoding="async" />
                <span class="track-logo-name">${escapeHtml(logo.label)}</span>
              </span>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderTrack(key) {
    const selectedKey = tracks[key] ? key : "frontend";
    const track = tracks[selectedKey];

    trackButtons.forEach((button) => {
      const trackKey = button.dataset.track;
      const isActive = trackKey === "dev" ? devTrackKeys.includes(selectedKey) : trackKey === selectedKey;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!trackPanel) return;

    trackPanel.innerHTML = `
      <header>
        <div class="track-meta-row">
          <span class="track-tag">${escapeHtml(track.tag)}</span>
          ${renderTrackLogos(track.logos)}
        </div>
        <h3>${escapeHtml(track.title)}</h3>
        <p>${escapeHtml(track.intro)}</p>
      </header>
      ${renderTrackDetails(track.details)}
    `;

    if (window.anime && !reduceMotionQuery.matches) {
      window.anime.remove(trackPanel);
      window.anime({
        targets: trackPanel,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 420,
        easing: "easeOutCubic"
      });

    }
  }

  trackButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderTrack(button.dataset.track === "dev" ? "frontend" : button.dataset.track);
    });
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-solid", window.scrollY > 24);
  }

  function observeSections() {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0.1, 0.4, 0.7]
      }
    );

    sections.forEach((section) => observer.observe(section));
  }

  async function copyRecruitTitle() {
    const title = "【实验室招新】【系统培养】逐梦创新实验室2026秋季招新前瞻";
    try {
      await navigator.clipboard.writeText(title);
      if (copyStatus) copyStatus.textContent = "已复制招新标题。";
    } catch (error) {
      if (copyStatus) copyStatus.textContent = title;
    }
  }

  function initCarousel(root) {
    if (!root) return;

    const slides = Array.from(root.querySelectorAll(".camp-slide"));
    const thumbs = Array.from(root.querySelectorAll("[data-carousel-thumb]"));
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    const stage = root.querySelector(".camp-carousel-stage");
    const reduceMotion = reduceMotionQuery.matches;
    let activeIndex = 0;
    let timer = 0;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      thumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === activeIndex;
        thumb.classList.toggle("is-active", isActive);
        thumb.setAttribute("aria-current", isActive ? "true" : "false");
      });

      if (window.anime && !reduceMotion) {
        const activeSlide = slides[activeIndex];
        const activeImage = activeSlide?.querySelector("img");
        window.anime.remove([activeSlide, activeImage]);
        window.anime({
          targets: activeSlide,
          opacity: [0, 1],
          scale: [1.012, 1],
          duration: 520,
          easing: "easeOutCubic"
        });
        window.anime({
          targets: activeImage,
          scale: [1.045, 1],
          duration: 900,
          easing: "easeOutQuart"
        });
      }
    }

    function move(step) {
      setActive(activeIndex + step);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = 0;
      }
    }

    function startAuto() {
      if (reduceMotion || timer || slides.length < 2) return;
      timer = window.setInterval(() => move(1), 5200);
    }

    prev?.addEventListener("click", () => {
      stopAuto();
      move(-1);
    });
    next?.addEventListener("click", () => {
      stopAuto();
      move(1);
    });
    thumbs.forEach((thumb) => {
      thumb.addEventListener("click", () => {
        stopAuto();
        setActive(Number(thumb.dataset.carouselThumb || 0));
      });
    });
    stage?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stopAuto();
        move(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stopAuto();
        move(1);
      }
    });
    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("focusout", startAuto);

    setActive(0);
    startAuto();
  }

  function initCompanyCarousel(root) {
    if (!root) return;

    const track = root.querySelector("[data-company-track]");
    const reduceMotion = reduceMotionQuery.matches;
    const speed = 92;
    const originalCards = track ? Array.from(track.querySelectorAll(".company-card")) : [];
    let frame = 0;
    let lastTime = 0;
    let loopWidth = 0;

    function refreshLoopWidth() {
      const firstClone = track?.querySelector("[data-company-clone]");
      loopWidth = firstClone && originalCards[0] ? firstClone.offsetLeft - originalCards[0].offsetLeft : 0;
    }

    function buildLoop() {
      if (!track || reduceMotion || originalCards.length < 2) return;
      track.querySelectorAll("[data-company-clone]").forEach((clone) => clone.remove());
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.companyClone = "true";
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      });
      refreshLoopWidth();
    }

    function animateTrack() {
      if (!window.anime || reduceMotion || !track) return;
      window.anime.remove(originalCards);
      window.anime({
        targets: originalCards,
        opacity: [0, 1],
        translateY: [12, 0],
        delay: window.anime.stagger(55),
        duration: 420,
        easing: "easeOutCubic"
      });
    }

    function stopAuto() {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      lastTime = 0;
    }

    function tick(now) {
      if (!track || !loopWidth) {
        stopAuto();
        return;
      }
      if (!lastTime) lastTime = now;
      const elapsed = Math.min(now - lastTime, 64);
      lastTime = now;
      track.scrollLeft += (speed * elapsed) / 1000;
      if (track.scrollLeft >= loopWidth) {
        track.scrollLeft -= loopWidth;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function startAuto() {
      if (reduceMotion || frame || !loopWidth) return;
      frame = window.requestAnimationFrame(tick);
    }

    buildLoop();
    if (window.ResizeObserver && track) {
      new ResizeObserver(refreshLoopWidth).observe(track);
    } else {
      window.addEventListener("resize", refreshLoopWidth);
    }
    track?.scrollTo({ left: 0, behavior: "auto" });
    animateTrack();
    startAuto();
  }

  function initPageMotion() {
    if (!window.anime || reduceMotionQuery.matches) return;

    const heroTargets = ".hero-kicker, .hero h1, .hero-lead, .hero-actions, .hero-metrics";
    window.anime.set(heroTargets, {
      opacity: 0,
      translateY: 26
    });

    window.anime
      .timeline({
        easing: "easeOutExpo",
        duration: 820
      })
      .add({
        targets: ".hero-kicker",
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 620
      })
      .add(
        {
          targets: ".hero h1",
          opacity: [0, 1],
          translateY: [32, 0],
          duration: 900
        },
        "-=360"
      )
      .add(
        {
          targets: ".hero-lead",
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 760
        },
        "-=520"
      )
      .add(
        {
          targets: ".hero-actions, .hero-metrics",
          opacity: [0, 1],
          translateY: [20, 0],
          delay: window.anime.stagger(110),
          duration: 700
        },
        "-=420"
      );
  }

  function initRevealMotion() {
    if (!window.anime || reduceMotionQuery.matches || !("IntersectionObserver" in window)) return;

    const revealTargets = Array.from(
      document.querySelectorAll(
        ".promise-card, .proof-panel, .company-showcase, .camp-callout, .camp-card, .track-board, .roadmap li, .selection-grid article, .sophomore-section, .apply-section"
      )
    );

    if (!revealTargets.length) return;

    window.anime.set(revealTargets, {
      opacity: 0,
      translateY: 24
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          window.anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 720,
            easing: "easeOutCubic"
          });
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.14
      }
    );

    revealTargets.forEach((target) => observer.observe(target));
  }

  async function initHeroScene(root) {
    if (!root) return;

    try {
      const THREE = await import(THREE_MODULE_URL);
      const hero = root.closest(".hero");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });
      const reduceMotion = reduceMotionQuery.matches;
      const clock = new THREE.Clock();
      const cameraState = {
        x: 0,
        y: 1.12,
        z: reduceMotion ? 6.1 : 7.2
      };
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

      function lineSegments(points, color, opacity) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        return new THREE.LineSegments(geometry, material);
      }

      const gridPoints = [];
      for (let x = -8; x <= 8.01; x += 0.8) {
        gridPoints.push(new THREE.Vector3(x, -1.42, -25), new THREE.Vector3(x, -1.42, 3.2));
      }
      for (let z = -25; z <= 3.21; z += 0.8) {
        gridPoints.push(new THREE.Vector3(-8, -1.42, z), new THREE.Vector3(8, -1.42, z));
      }
      const grid = lineSegments(gridPoints, 0x3cf5df, 0.13);
      world.add(grid);

      const lanePoints = [];
      [-1.35, 1.35].forEach((x) => {
        lanePoints.push(new THREE.Vector3(x, -1.38, -24), new THREE.Vector3(x, -1.38, 2.6));
      });
      const lane = lineSegments(lanePoints, 0xff7a38, 0.48);
      world.add(lane);

      const paths = [
        {
          color: 0x00f5d4,
          points: [
            [-4.7, -0.72, 1.1],
            [-2.2, -0.12, -3.8],
            [0.8, 0.26, -8.5],
            [3.6, 0.18, -14.6],
            [4.4, 0.88, -20.5]
          ]
        },
        {
          color: 0xff7a38,
          points: [
            [-3.4, -1.0, 1.8],
            [-1.1, -0.58, -3.2],
            [1.8, -0.26, -7.2],
            [2.7, 0.42, -12.4],
            [5.0, 0.2, -18.6]
          ]
        },
        {
          color: 0x9a7dff,
          points: [
            [-5.2, 0.42, -0.4],
            [-2.4, 0.92, -4.9],
            [0.2, 1.16, -9.6],
            [2.8, 1.08, -15.8],
            [4.0, 1.74, -21.8]
          ]
        }
      ];
      const pulses = [];
      const nodeGeometry = new THREE.SphereGeometry(0.07, 16, 16);

      paths.forEach((path, pathIndex) => {
        const curve = new THREE.CatmullRomCurve3(path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 120, 0.024, 8, false),
          new THREE.MeshBasicMaterial({
            color: path.color,
            transparent: true,
            opacity: 0.64,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          })
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
              blending: THREE.AdditiveBlending
            })
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
            blending: THREE.AdditiveBlending
          })
        );
        pulse.userData = {
          curve,
          offset: pathIndex * 0.28,
          speed: 0.055 + pathIndex * 0.012
        };
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
          blending: THREE.AdditiveBlending
        })
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
            blending: THREE.AdditiveBlending
          })
        );
        ring.position.set(2.6 + index * 0.16, 0.12 + index * 0.2, -5.4 - index * 3.35);
        ring.scale.set(1.72 + index * 0.18, 0.64 + index * 0.04, 1);
        world.add(ring);
        return ring;
      });

      function labelSprite(text, color) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 96;
        const context = canvas.getContext("2d");
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
            depthWrite: false
          })
        );
        sprite.scale.set(1.18, 0.44, 1);
        return sprite;
      }

      [
        ["WEB", "#00f5d4", -0.4, 1.72, -4.8],
        ["GO", "#ff7a38", 3.7, 1.22, -7.6],
        ["ACM", "#9a7dff", 1.5, 2.2, -11.2],
        ["RAG", "#00f5d4", 4.6, 1.88, -14.4],
        ["OJ", "#ff7a38", 2.5, 2.74, -18.4]
      ].forEach(([text, color, x, y, z]) => {
        const sprite = labelSprite(text, color);
        sprite.position.set(x, y, z);
        world.add(sprite);
      });

      function resize() {
        const width = Math.max(1, root.clientWidth);
        const height = Math.max(1, root.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        draw(performance.now());
      }

      function updateScrollTarget() {
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        scrollTarget = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
      }

      function updatePointer(event) {
        const rect = root.getBoundingClientRect();
        pointerTarget.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
        pointerTarget.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * -2;
      }

      function draw(now) {
        const elapsed = clock.getElapsedTime();
        pointer.x += (pointerTarget.x - pointer.x) * 0.045;
        pointer.y += (pointerTarget.y - pointer.y) * 0.045;
        scrollProgress += (scrollTarget - scrollProgress) * 0.06;

        world.rotation.y = Math.sin(elapsed * 0.18) * 0.035 + pointer.x * 0.07;
        world.rotation.x = -0.04 + pointer.y * 0.025 + scrollProgress * 0.055;
        grid.material.opacity = 0.12 + Math.sin(elapsed * 0.9) * 0.035;
        lane.material.opacity = 0.36 + Math.sin(elapsed * 1.4) * 0.1;
        particles.rotation.y = elapsed * 0.018;
        particles.rotation.x = Math.sin(elapsed * 0.13) * 0.018;

        pulses.forEach((pulse) => {
          const { curve, offset, speed } = pulse.userData;
          const point = curve.getPointAt((elapsed * speed + offset) % 1);
          pulse.position.copy(point);
          pulse.scale.setScalar(0.82 + Math.sin(elapsed * 5.2 + offset * 12) * 0.16);
        });

        rings.forEach((ring, index) => {
          ring.rotation.z = elapsed * (index % 2 ? -0.075 : 0.065);
          ring.material.opacity = 0.13 + Math.sin(elapsed * 1.15 + index) * 0.045;
        });

        coreLight.intensity = 2.8 + Math.sin(elapsed * 1.35) * 0.42;
        warmLight.intensity = 2.0 + Math.cos(elapsed * 1.05) * 0.3;
        camera.position.set(
          cameraState.x + pointer.x * 0.46,
          cameraState.y + pointer.y * 0.18 + scrollProgress * 0.68,
          cameraState.z - scrollProgress * 0.95
        );
        camera.lookAt(pointer.x * 0.72, -0.16 + pointer.y * 0.08, -7.4 - scrollProgress * 2.1);
        camera.rotation.z += pointer.x * 0.018;

        renderer.render(scene, camera);
      }

      function renderLoop(now) {
        draw(now);
        if (!reduceMotion) {
          animationId = window.requestAnimationFrame(renderLoop);
        }
      }

      if (window.anime && !reduceMotion) {
        window.anime({
          targets: cameraState,
          z: 5.95,
          y: 1.24,
          duration: 1900,
          easing: "easeOutExpo"
        });
      }

      updateScrollTarget();
      resize();
      window.addEventListener("pointermove", updatePointer, { passive: true });
      window.addEventListener("scroll", updateScrollTarget, { passive: true });
      window.addEventListener("resize", resize, { passive: true });
      if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(root);
      }

      renderLoop(performance.now());
      return () => {
        window.cancelAnimationFrame(animationId);
        renderer.dispose();
      };
    } catch (error) {
      root.classList.add("is-scene-fallback");
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  copyButton?.addEventListener("click", copyRecruitTitle);

  renderTrack("frontend");
  initCarousel(carousel);
  initCompanyCarousel(companyCarousel);
  initPageMotion();
  initRevealMotion();
  initHeroScene(heroSceneRoot);
  updateHeader();
  observeSections();
})();
