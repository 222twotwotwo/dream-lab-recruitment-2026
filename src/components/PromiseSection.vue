<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
</script>

<template>
  <section id="promise" :class="$style['promise']" class="section" aria-labelledby="promise-title">
    <SectionHeading
      eyebrow="What you get"
      title-id="promise-title"
      title="我们能给你什么"
    >
      专业指导、浓厚氛围、资源全开放。从竞赛到就业，从四非到大厂，不靠口号，靠真实训练密度和持续反馈。
    </SectionHeading>
    <div :class="$style['grid']">
      <article :class="$style['card']" data-reveal>
        <span class="card-index">01</span>
        <h3>零基础友好</h3>
        <p>基础薄弱也可以报名。军训后会开设线下指导班，用编程基础和学习方法帮你跨过入门门槛。</p>
      </article>
      <article :class="$style['card']" data-reveal>
        <span class="card-index">02</span>
        <h3>路线清晰</h3>
        <p>各方向配套学习路线图、入门资料、线上任务和阶段反馈，少走弯路，把时间花在真正能成长的地方。</p>
      </article>
      <article :class="$style['card']" data-reveal>
        <span class="card-index">03</span>
        <h3>资源开放</h3>
        <p>Java / Go 后端、Web 前端、Kotlin 客户端、数媒、算法竞赛、AI Agent 等资源开放共享，按兴趣进入对应小组。</p>
      </article>
      <article :class="$style['card']" data-reveal>
        <span class="card-index">04</span>
        <h3>师兄师姐带练</h3>
        <p>核心成员与方向负责人轮流授课、答疑、组织会议和模拟赛，让新成员更快接触真实项目节奏。</p>
      </article>
    </div>
  </section>
</template>

<style module src="../styles/PromiseSection.module.css"></style>

