<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
</script>

<template>
  <section :class="$style['selection']" class="section" aria-labelledby="selection-title">
    <SectionHeading
      eyebrow="Early selection"
      title-id="selection-title"
      title="暑期提前选拔通道"
    >
      如果你已经具备一定基础，可以提前申请考核，通过后开学优先进入项目组参与实战开发。
    </SectionHeading>
    <div :class="$style['grid']">
      <article data-reveal>
        <h3>适合提前考核的同学</h3>
        <ul>
          <li>有程序设计竞赛获奖经历或较高算法水平</li>
          <li>有独立开发项目或开源项目贡献经验</li>
          <li>熟练掌握至少一门编程语言与相关技术栈</li>
          <li>暑期自学阶段表现突出，完成进阶学习任务</li>
        </ul>
      </article>
      <article data-reveal>
        <h3>正式录取看什么</h3>
        <ul>
          <li>学习态度是否端正，是否愿意持续投入</li>
          <li>方向选择是否清晰，是否能完成阶段任务</li>
          <li>课堂、会议、模拟赛或项目中的成长速度</li>
          <li>大二同学需要具备一定基础</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style module src="../styles/SelectionSection.module.css"></style>

