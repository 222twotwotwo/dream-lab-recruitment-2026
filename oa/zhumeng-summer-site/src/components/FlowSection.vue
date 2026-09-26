<script setup lang="ts">
import SectionHead from './SectionHead.vue';

const steps = [
  {
    title: '项目发布',
    desc: '课题名称与背景、目标产出、任务拆解、技能要求、人数周期、学习资源、考核标准一次讲清。'
  },
  {
    title: '自主申请',
    desc: '个人简介与技能、作品经历、课题理解。负责人初筛 + 面试/小任务测试 + 导师确认。'
  },
  {
    title: '系统跟进',
    desc: '负责人制 + 周会 + 月报 + 中期检查，状态管理覆盖进行中、预警、延期、结项、淘汰。'
  },
  {
    title: '完成结项',
    desc: '项目报告、代码/原型/演示视频、个人学习总结。结项答辩评出优秀、合格、不合格。'
  }
];
</script>

<template>
  <section id="flow" class="section">
    <SectionHead
      eyebrow="Process · 核心流程"
      title="四步走完全程"
      desc="过程材料在 OA 系统内全部留痕，作为考核与评审的客观依据"
    />
    <!-- S 形编号流程图（参考开源之夏活动流程版式） -->
    <div class="snake-wrap" v-reveal>
      <svg class="snake-svg" viewBox="0 0 1000 630" aria-hidden="true">
        <!-- 01 → 02 -->
        <line x1="250" y1="225" x2="736" y2="225" class="snake-dash" />
        <polygon points="752,225 737,218 737,232" class="snake-head" />
        <!-- 02 ↓ 03 -->
        <line x1="750" y1="233" x2="750" y2="416" class="snake-dash" />
        <polygon points="750,432 743,417 757,417" class="snake-head" />
        <!-- 03 → 04 -->
        <line x1="750" y1="430" x2="266" y2="430" class="snake-dash" />
        <polygon points="250,430 265,423 265,437" class="snake-head" />
        <!-- 节点圆点 -->
        <circle cx="250" cy="225" r="5" class="snake-node" />
        <circle cx="750" cy="225" r="5" class="snake-node" />
        <circle cx="750" cy="430" r="5" class="snake-node" />
        <circle cx="250" cy="430" r="5" class="snake-node" />
      </svg>
      <div
        v-for="(s, i) in steps"
        :key="s.title"
        class="snake-item"
        :class="`snake-item-${i + 1}`"
      >
        <div class="snake-card">
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
        <div class="snake-badge">0{{ i + 1 }}</div>
      </div>
    </div>
  </section>
</template>
