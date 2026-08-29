// 此脚本已不再需要：模型资源已直接包含在仓库中。
// 保留仅为兼容旧引用，未在 package.json 中调用。
import { cp, mkdir, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = ""; // 已移除本地电脑路径，此脚本不再需要
const dest = resolve(root, "public/assets/live2d/yachiyo");
// 清理之前误建的 tsukimi-yachiyo 占位目录（若存在）
const stale = resolve(root, "public/assets/live2d/tsukimi-yachiyo");
await rm(stale, { recursive: true, force: true });

if (!existsSync(source)) {
  console.warn(`[copy-yachiyo] 未找到模型源目录：${source}`);
  console.warn("[copy-yachiyo] 未配置源路径，此脚本已废弃");
  process.exit(0);
}

// 目标目录完全重建，避免残留旧的中文名文件
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
const entries = await readdir(source, { withFileTypes: true });
for (const entry of entries) {
  const srcPath = resolve(source, entry.name);
  const destPath = resolve(dest, entry.name);
  await cp(srcPath, destPath, { recursive: true, force: true });
}

// 将中文文件名改名为 ASCII，避免 Live2D 加载器/浏览器对非 ASCII 路径处理异常
const renames = [
  ["八千代辉夜姬.moc3", "yachiyo.moc3"],
  ["八千代辉夜姬.8192", "yachiyo.8192"],
  ["八千代辉夜姬.cdi3.json", "yachiyo.cdi3.json"],
  ["八千代辉夜姬.model3.json", "yachiyo.model3.json"],
  ["八千代辉夜姬.physics3.json", "yachiyo.physics3.json"],
  ["八千代辉夜姬.vtube.json", "yachiyo.vtube.json"],
  ["八千代辉夜姬.xyplugin.json", "yachiyo.xyplugin.json"],
  ["泪珠.exp3.json", "tear_drop.exp3.json"],
  ["眯眯眼.exp3.json", "narrow_eyes.exp3.json"],
  ["眼泪.exp3.json", "tears.exp3.json"],
  ["笑咪咪.exp3.json", "smile.exp3.json"],
];

for (const [from, to] of renames) {
  await rename(resolve(dest, from), resolve(dest, to));
}

// 重写 model3.json，让所有引用都指向 ASCII 文件名
const modelJson = {
  Version: 3,
  FileReferences: {
    Moc: "yachiyo.moc3",
    Textures: [
      "yachiyo.8192/texture_00.png",
      "yachiyo.8192/texture_01.png",
    ],
    Physics: "yachiyo.physics3.json",
    DisplayInfo: "yachiyo.cdi3.json",
    Expressions: [
      { Name: "tear_drop", File: "tear_drop.exp3.json" },
      { Name: "narrow_eyes", File: "narrow_eyes.exp3.json" },
      { Name: "tears", File: "tears.exp3.json" },
      { Name: "smile", File: "smile.exp3.json" },
    ],
    Motions: {
      Idle: [
        { File: "motions/yachiyo_idle.motion3.json", FadeInTime: 0.5, FadeOutTime: 0.5 },
      ],
      Greet: [
        { File: "motions/yachiyo_greet.motion3.json", FadeInTime: 0.4, FadeOutTime: 0.4 },
      ],
      ReactError: [
        { File: "motions/yachiyo_react_error.motion3.json", FadeInTime: 0.3, FadeOutTime: 0.3 },
      ],
    },
  },
  Groups: [
    { Target: "Parameter", Name: "EyeBlink", Ids: ["ParamEyeLOpen", "ParamEyeROpen"] },
    { Target: "Parameter", Name: "LipSync", Ids: [] },
  ],
};

await writeFile(
  resolve(dest, "yachiyo.model3.json"),
  JSON.stringify(modelJson, null, "\t"),
);

// 下载 Cubism 5 Core：旧版 npm live2dcubismcore@1.0.2 不支持 Cubism 5 的 MOC3
const coreDir = resolve(root, "public/assets/live2d/cubismcore");
await mkdir(coreDir, { recursive: true });
const corePath = resolve(coreDir, "live2dcubismcore.min.js");
const coreUrl = "https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js";

if (existsSync(corePath)) {
  console.log("[copy-yachiyo] Cubism Core 已存在，跳过下载");
} else {
  try {
    const response = await fetch(coreUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await writeFile(corePath, new Uint8Array(await response.arrayBuffer()));
    console.log("[copy-yachiyo] 已下载 Cubism 5 Core");
  } catch (error) {
    console.warn("[copy-yachiyo] Cubism Core 下载失败，若模型无法加载请手动下载最新 core 到：");
    console.warn(corePath);
    console.warn(error instanceof Error ? error.message : error);
  }
}

console.log(`[copy-yachiyo] 已复制并标准化模型：${source} -> ${dest}`);
