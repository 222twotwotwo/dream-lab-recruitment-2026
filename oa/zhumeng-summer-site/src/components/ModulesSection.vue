<script setup lang="ts">
import SectionHead from './SectionHead.vue';

const modules = [
  { name: '项目大厅', desc: '展示所有招标课题，支持标签筛选', icon: 'grid_view' },
  { name: '项目详情', desc: '背景、目标、任务、技能要求、人数、周期、产出', icon: 'description' },
  { name: '申请入口', desc: '在线填报资料、作品、学习计划、时间投入', icon: 'edit_note' },
  { name: '进度看板', desc: '待审核 · 面试中 · 已立项 · 进行中 · 已结项', icon: 'view_kanban' },
  { name: '周会 / 月报', desc: '上传纪要、月报、学习日志', icon: 'event_note' },
  { name: '文件与链接', desc: '代码仓库、文档、原型、数据集', icon: 'folder_open' },
  { name: '通知提醒', desc: '申请截止、周会提醒、月报催交、结项通知', icon: 'notifications' },
  { name: '评价结项', desc: '导师评价、负责人评价、结项材料提交', icon: 'grading' },
  { name: '数据统计', desc: '申请数、立项数、出勤率、结项率、成果数', icon: 'bar_chart' }
];
</script>

<template>
  <section id="modules" class="section">
    <SectionHead
      eyebrow="Platform · 网站平台"
      title="OA 课题项目招标网站"
      desc="项目发布 → 自主申请 → 系统跟进 → 完成结项，全流程线上化"
    />
    <div class="modules">
      <q-card v-for="(m, i) in modules" :key="m.name" v-reveal="i % 3" flat bordered class="mod">
        <q-card-section>
          <q-icon :name="m.icon" size="26px" class="mod-icon" />
          <b class="mod-name">{{ m.name }}</b>
          <span class="mod-desc">{{ m.desc }}</span>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>
