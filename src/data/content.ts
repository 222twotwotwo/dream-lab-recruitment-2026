export interface TrackLogo {
  icon: string;
  label: string;
}

export interface TrackDetail {
  title: string;
  items: string[];
}

export interface Track {
  title: string;
  tag: string;
  logos: TrackLogo[];
  intro: string;
  details: TrackDetail[];
}

export type TrackKey =
  | "frontend"
  | "backend"
  | "client"
  | "media"
  | "contest"
  | "agent";

/** 开发组细分方向（归属 “开发组” 主标签） */
export const devTrackKeys: TrackKey[] = ["frontend", "backend", "client", "media"];

export const tracks: Record<TrackKey, Track> = {
  frontend: {
    title: "开发组 - 前端",
    tag: "Web / JavaScript / TypeScript",
    logos: [
      { icon: "./assets/logos/javascript.svg", label: "JavaScript" },
      { icon: "./assets/logos/typescript.svg", label: "TypeScript" },
    ],
    intro:
      "适合想做网页交互、工程化和产品界面的同学。重点训练 HTML / CSS / JavaScript 基础、组件化思维和真实项目协作能力。",
    details: [
      {
        title: "招募要求",
        items: [
          "具备基础计算机思维，愿意系统学习前端基础与浏览器工作方式",
          "熟悉 HTML / CSS / JavaScript 更好，零基础同学可通过任务逐步追赶",
          "对界面细节、交互体验和工程质量有耐心",
        ],
      },
      {
        title: "可获得资源",
        items: [
          "Web 前端学习路线、工程化实践和项目拆解",
          "组件开发、页面适配、动效实现和调试经验",
          "参与实验室真实站点、工具页或活动页面开发",
        ],
      },
    ],
  },
  backend: {
    title: "开发组 - 后端",
    tag: "Java / Go / Service",
    logos: [
      { icon: "./assets/logos/java.svg", label: "Java" },
      { icon: "./assets/logos/go.svg", label: "Go" },
    ],
    intro:
      "适合想把业务逻辑、数据存储和服务稳定性做扎实的同学。后端方向围绕 Java / Go、接口设计、数据库和工程实践展开。",
    details: [
      {
        title: "招募要求",
        items: [
          "具备计算机基础，愿意深入学习一门后端语言和常见开发规范",
          "了解 Java / Go、数据库、HTTP 接口任一方向更好",
          "能坚持完成阶段任务，并在代码评审中持续改进",
        ],
      },
      {
        title: "可获得资源",
        items: [
          "Java / Go 两种方向的后端学习资料和项目案例",
          "接口设计、数据库建模、服务部署和故障排查训练",
          "由学长带着理解真实后端项目的协作流程",
        ],
      },
    ],
  },
  client: {
    title: "开发组 - 客户端",
    tag: "Kotlin / Android / App",
    logos: [{ icon: "./assets/logos/kotlin.svg", label: "Kotlin" }],
    intro:
      "适合希望做移动端应用、设备侧交互和 App 工程的同学。客户端方向以 Kotlin 为主，强调界面、状态和本地能力的完整实现。",
    details: [
      {
        title: "招募要求",
        items: [
          "具备基础编程能力，愿意学习 Kotlin 与客户端开发方式",
          "对 App 交互、页面状态、接口联调和设备适配感兴趣",
          "零基础同学可从语法、页面和小功能任务逐步进入",
        ],
      },
      {
        title: "可获得资源",
        items: [
          "Kotlin 客户端方向由学长持续指导",
          "从基础页面、接口联调到完整 App 功能的实践任务",
          "理解客户端项目结构、调试方式和发布前检查",
        ],
      },
    ],
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
      { icon: "./assets/logos/maya.svg", label: "Maya" },
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
          "坐得住冷板凳，不怕从零开始，有好奇心",
        ],
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
          "XR 应用 / 开发",
        ],
      },
    ],
  },
  contest: {
    title: "竞赛组",
    tag: "Algorithm / Modeling / Kaggle",
    logos: [
      { icon: "./assets/logos/cplusplus.svg", label: "C++" },
      { icon: "./assets/logos/python.svg", label: "Python" },
    ],
    intro:
      "适合希望深入钻研计算机技术、积累竞赛经验的同学。这里强调稳定训练、复盘和模拟赛，把热爱打磨成可量化的结果。",
    details: [
      {
        title: "招募面向",
        items: [
          "积极参与各类计算机相关比赛",
          "希望进入算法、建模、AI / 数据相关竞赛训练",
          "愿意接受持续任务安排和阶段复盘",
        ],
      },
      {
        title: "培养形式",
        items: [
          "日常线上任务安排",
          "每周线下会议或模拟赛",
          "推荐语言为 C++ / Python",
        ],
      },
      {
        title: "训练营支撑",
        items: [
          "往届算法训练营采用线上刷题任务、线下公开课、以赛促学",
          "刷题和训练赛覆盖牛客网、力扣、洛谷等 OJ 平台",
          "面向 ICPC、CCPC、CACC、蓝桥杯、RAICOM、GPLT 等赛事制定备赛计划",
        ],
      },
    ],
  },
  agent: {
    title: "Agent 组",
    tag: "Tool Calling / Context / RAG",
    logos: [
      { icon: "./assets/logos/python.svg", label: "Python" },
      { icon: "./assets/logos/typescript.svg", label: "TypeScript" },
      { icon: "./assets/logos/javascript.svg", label: "JavaScript" },
    ],
    intro:
      "适合对 AI Agent 开发感兴趣、想做自己的 Agent 框架或工具运行时的同学。不满足于只用产品，而是想搞清楚 Agent 如何调度工具、读取上下文并和系统交互。",
    details: [
      {
        title: "招募面向",
        items: [
          "有编程基础更好，没有也行，愿意学就行",
          "想从底层理解 Agent 框架、工具调用和系统交互",
          "愿意边写边拆，不只停留在体验产品",
        ],
      },
      {
        title: "培养形式",
        items: [
          "从工具调用、上下文管理、多步推理切入",
          "继续拆 RAG、权限管理、运行时设计等核心问题",
          "参考 OpenClaw，但目标是造自己的轮子：CLI Agent 或桌面 Agent 都可以",
        ],
      },
    ],
  },
};

export interface CompanyCard {
  type: "就业" | "实习";
  logo: string;
  logoAlt: string;
  name: string;
  desc: string;
}

export const companies: CompanyCard[] = [
  { type: "就业", logo: "./assets/company-logos/didi.svg", logoAlt: "滴滴官方 logo", name: "滴滴", desc: "后端开发 / 工程实践" },
  { type: "就业", logo: "./assets/company-logos/js-design.svg", logoAlt: "即时设计官方 logo", name: "即时设计", desc: "在线设计工具 / 产品研发" },
  { type: "就业", logo: "./assets/company-logos/inovance.svg", logoAlt: "汇川技术官方 logo", name: "汇川技术", desc: "工业技术 / 后端服务" },
  { type: "就业", logo: "./assets/company-logos/asiainfo.svg", logoAlt: "亚信科技官方 logo", name: "亚信科技", desc: "数智化软件 / 工程研发" },
  { type: "实习", logo: "./assets/company-logos/lilith.webp", logoAlt: "莉莉丝官方 logo", name: "莉莉丝", desc: "基础架构 / 游戏研发" },
  { type: "实习", logo: "./assets/company-logos/xiaohongshu.png", logoAlt: "小红书官方 logo", name: "小红书", desc: "社区产品 / 工程实习" },
  { type: "实习", logo: "./assets/company-logos/qiniu.jpg", logoAlt: "七牛云官方 logo", name: "七牛云", desc: "云计算 / 平台研发" },
  { type: "实习", logo: "./assets/company-logos/brainco.webp", logoAlt: "强脑科技官方 logo", name: "强脑科技", desc: "脑机接口 / 科技产品" },
  { type: "实习", logo: "./assets/company-logos/sf-express.png", logoAlt: "顺丰官方 logo", name: "顺丰", desc: "物流科技 / 工程实践" },
  { type: "实习", logo: "./assets/company-logos/yoozoo.png", logoAlt: "游族官方 logo", name: "游族", desc: "游戏后端 / 平台服务" },
  { type: "实习", logo: "./assets/company-logos/huolala.ico", logoAlt: "货拉拉官方 logo", name: "货拉拉", desc: "平台工程 / 基础服务" },
  { type: "实习", logo: "./assets/company-logos/trs.png", logoAlt: "拓尔思官方 logo", name: "拓尔思", desc: "AI / 大数据" },
  { type: "实习", logo: "./assets/company-logos/topwinchance.jpg", logoAlt: "壹网壹创官方 logo", name: "壹网壹创", desc: "电商 / 数字化运营" },
];

export interface CampSlide {
  src: string;
  thumbSrc?: string;
  alt: string;
  caption: string;
}

export const campSlides: CampSlide[] = [
  {
    src: "./assets/algorithm-camp-cacc.jpg",
    alt: "第二届 CCF 算法能力大赛区域赛赛点现场",
    caption: "CACC 区域赛赛点，训练目标最终会落到真实赛场。",
  },
  {
    src: "./assets/algorithm-camp-room.jpg",
    alt: "算法训练营机房训练现场，学生在电脑前参与训练",
    caption: "机房训练与线上任务同步推进。",
  },
  {
    src: "./assets/algorithm-camp-class.jpg",
    alt: "算法公开课现场，老师在机房前方讲解",
    caption: "线下公开课帮助同学建立系统方法。",
  },
  {
    src: "./assets/algorithm-camp-contest.jpg",
    alt: "算法训练营交流赛现场，学生分组讨论",
    caption: "交流赛后复盘，把题目变成经验。",
  },
];

export const eventStrip = [
  "ICPC",
  "CCPC",
  "CACC",
  "蓝桥杯",
  "全国大学生算法设计与编程挑战赛",
  "RAICOM 睿抗",
  "GPLT 天梯赛",
];

export const navLinks = [
  { href: "#promise", label: "资源" },
  { href: "#proof", label: "成果" },
  { href: "#camp", label: "训练营" },
  { href: "#tracks", label: "方向" },
  { href: "#roadmap", label: "流程" },
  { href: "#apply", label: "报名" },
] as const;

/** 英雄区默认与彩蛋状态（#otto / #♿ 触发） */
export const heroDefaults = {
  title: ["逐梦创新实验室", "2026级新生招募计划"],
  lead: "不限校区，不限专业，零基础可报",
  media: {
    src: "./assets/dream-lab-hero.png",
    alt: "实验室桌面、白板系统图、代码终端和竞赛奖杯组成的招新视觉",
  },
};

export const easterEgg = {
  hashes: {
    otto: true,
    "♿": true,
    "♿️": true,
  } as Record<string, true>,
  title: ["滚木创新实验室", "2026 :// Project</404>"],
  lead: "冲刺，冲刺，冲，冲，冲♿️",
  media: {
    src: "./assets/GunMu.png",
    alt: "滚木照片组成的彩蛋招新视觉",
  },
};
