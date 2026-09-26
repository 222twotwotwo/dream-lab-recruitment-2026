<script setup lang="ts">
import SectionHead from './SectionHead.vue';

const phases = [
  { time: '九月中旬', title: '筹备期', desc: '建站、课题征集、模板制定' },
  { time: '九月中下旬', title: '宣传发布期', desc: '网站上线 · 中秋 CS-TriadLect 第二节课专场宣讲' },
  { time: '十月上旬', title: '申请立项期', desc: '学生申请、负责人筛选、面试/任务测试、立项公示' },
  { time: '十月 — 十二月', title: '项目执行期', desc: '周会、月报、中期检查、项目推进' },
  { time: '一月', title: '结项评审期', desc: '提交材料、答辩评审、评优公示' },
  { time: '长期', title: '转化招募期', desc: '优秀成员直通面试、新生招募、项目续期孵化' }
];
</script>

<template>
  <section id="timeline" class="section">
    <SectionHead
      eyebrow="Schedule · 时间安排"
      title="一学期的节奏"
      desc="各阶段具体时间以 OA 系统公告为准"
    />
    <div class="timeline timeline--q" v-reveal>
      <q-timeline color="accent" layout="dense" side="right">
        <q-timeline-entry
          v-for="p in phases"
          :key="p.title"
          :subtitle="p.time"
          :title="p.title"
        >
          <p class="tl-desc">{{ p.desc }}</p>
        </q-timeline-entry>
      </q-timeline>
    </div>
  </section>
</template>
