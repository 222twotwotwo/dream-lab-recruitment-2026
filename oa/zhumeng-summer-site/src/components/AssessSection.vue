<script setup lang="ts">
import SectionHead from './SectionHead.vue';

const rows = [
  { dim: '申请材料', desc: '学习计划、时间投入、课题理解', record: 'OA 申请记录' },
  { dim: '周会参与', desc: '出勤、发言、协作', record: '周会纪要' },
  { dim: '任务完成', desc: '按时完成、主动迭代', record: '项目看板' },
  { dim: '知识分享', desc: '学习日志、技术分享', record: 'OA 学习日志' },
  { dim: '月报质量', desc: '总结深度、问题意识', record: '月报评审' },
  { dim: '导师评价', desc: '主动性、稳定性、成长性', record: '导师评分' }
];

const path = ['报名者', '项目成员', '优秀成员', '项目骨干', '逐梦新生力军'];
const incentives = [
  { title: '绿色通道', desc: '优秀成员获得实验室招募直通资格', icon: 'bolt' },
  { title: '竞赛推荐', desc: '优秀项目推荐参赛或进入下一期孵化', icon: 'emoji_events' },
  { title: '退出机制', desc: '连续缺勤、长期无进展，提醒无效后退出', icon: 'logout' }
];
</script>

<template>
  <section id="assess" class="section">
    <SectionHead
      eyebrow="Assessment · 考核激励"
      title="考核与激励"
      desc="项目即考核：在真实任务中观察你的学习意愿"
    />
    <div class="assess-grid">
      <q-card v-reveal flat bordered class="assess-table-wrap">
        <q-markup-table flat class="assess-table">
          <thead>
            <tr><th>考核维度</th><th>说明</th><th>记录方式</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.dim">
              <td class="text-weight-medium">{{ r.dim }}</td><td>{{ r.desc }}</td><td>{{ r.record }}</td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
      <div class="assess-side">
        <q-card v-reveal="1" flat bordered class="path">
          <q-card-section>
            <h4>招募转化路径</h4>
            <div class="path-flow">
              <template v-for="(p, i) in path" :key="p">
                <span :class="{ hl: i === path.length - 1 }">{{ p }}</span>
                <i v-if="i < path.length - 1">→</i>
              </template>
            </div>
          </q-card-section>
        </q-card>
        <q-card v-for="(inc, i) in incentives" :key="inc.title" v-reveal="i + 1" flat bordered class="inc">
          <q-card-section class="inc-inner">
            <q-icon :name="inc.icon" size="22px" class="inc-icon" />
            <div>
              <b>{{ inc.title }}</b>
              <span>{{ inc.desc }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </section>
</template>
