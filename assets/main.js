(function () {
  const tracks = {
    dev: {
      title: "开发组",
      tag: "Web / Backend / Client / Tech Media",
      intro:
        "适合想把计算机基础落到真实项目里的同学。具备基础、熟练掌握一门语言更好；零基础但学习意愿强、愿意主动追赶，也可以报名。",
      details: [
        {
          title: "招募要求",
          items: [
            "具备计算机基础，熟练掌握一门语言及相关方向开发能力",
            "方向覆盖前端、后端、客户端、数媒组技术方向等",
            "零基础同学可通过学习任务和指导班逐步追赶"
          ]
        },
        {
          title: "可获得资源",
          items: [
            "后端有 Java / Go 两种方向的丰富资源",
            "前端覆盖 Web 技术栈与工程化实践",
            "客户端由 Kotlin 学长言传身教"
          ]
        }
      ]
    },
    contest: {
      title: "竞赛组",
      tag: "Algorithm / Modeling / Kaggle",
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTrack(key) {
    const track = tracks[key] || tracks.dev;

    trackButtons.forEach((button) => {
      const isActive = button.dataset.track === key;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    if (!trackPanel) return;

    trackPanel.innerHTML = `
      <header>
        <span class="track-tag">${escapeHtml(track.tag)}</span>
        <h3>${escapeHtml(track.title)}</h3>
        <p>${escapeHtml(track.intro)}</p>
      </header>
      <div class="track-detail-grid">
        ${track.details
          .map(
            (detail) => `
              <section class="track-detail">
                <h4>${escapeHtml(detail.title)}</h4>
                <ul>
                  ${detail.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </section>
            `
          )
          .join("")}
      </div>
    `;
  }

  trackButtons.forEach((button) => {
    button.addEventListener("click", () => renderTrack(button.dataset.track));
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
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  window.addEventListener("scroll", updateHeader, { passive: true });
  copyButton?.addEventListener("click", copyRecruitTitle);

  renderTrack("dev");
  initCarousel(carousel);
  updateHeader();
  observeSections();
})();
