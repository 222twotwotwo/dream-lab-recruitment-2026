<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
</script>

<template>
  <section id="roadmap" :class="$style['flow']" class="section" aria-labelledby="roadmap-title">
    <SectionHeading
      eyebrow="Recruitment flow"
      title-id="roadmap-title"
      title="从预热到正式录取"
    >
      招新不是一次性筛人，而是分阶段建立联系、明确方向、提供指导，再看学习表现与成长潜力。
    </SectionHeading>
    <ol :class="$style['list']">
      <li data-reveal>
        <span class="phase">7 月至开学前</span>
        <h3>预热宣传期</h3>
        <p>通过公众号、院系通知、新生社群发布招新信息，引导意向学生加入咨询群，提供方向选择建议和入门指导。</p>
      </li>
      <li data-reveal>
        <span class="phase">开学季</span>
        <h3>集中招新与主题宣讲</h3>
        <p>开展线下宣传与多场主题宣讲会。各方向负责人轮流主讲，介绍就业方向、学习路径、项目实战和常见问题。</p>
      </li>
      <li data-reveal>
        <span class="phase">军训结束后</span>
        <h3>线下指导班与正式录取</h3>
        <p>每周一次晚间课程，讲编程基础和学习方法。结业后综合出勤、课堂表现、考核结果确定最终录取名单。</p>
      </li>
    </ol>
  </section>
</template>

<style module src="../styles/RoadmapSection.module.css"></style>

