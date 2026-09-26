<script setup lang="ts">
import SectionHead from './SectionHead.vue';

const goals = [
  { num: '01', title: '考核学习意愿', desc: '多维综合判断，拒绝"简历面试"式的片面观察' },
  { num: '02', title: '孵化优质项目', desc: '真实课题落地，形成可展示、可参赛的成果' },
  { num: '03', title: '招募新生力量', desc: '优秀参与者直通面试，成为实验室生力军' },
  { num: '04', title: '沉淀长效机制', desc: '建成课题库、人才库、项目库与 OA 招标流程' }
];
</script>

<template>
  <section id="goals" class="section">
    <SectionHead
      eyebrow="Goals · 活动目标"
      title="我们想做成什么"
      desc="以课题项目为试金石，考核学习意愿，孵化优质项目，招募实验室生力军"
    />
    <div class="goals">
      <div v-for="(row, r) in [goals.slice(0, 2), goals.slice(2)]" :key="r" class="goal-row">
        <div v-for="g in row" :key="g.num" v-reveal="Number(g.num) - 1" class="goal-item">
          <span>{{ g.num }}</span>
          <div>
            <h4>{{ g.title }}</h4>
            <p>{{ g.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
