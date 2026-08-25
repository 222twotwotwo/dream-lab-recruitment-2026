<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
</script>

<template>
  <section :class="$style['sophomore']" class="section" aria-labelledby="sophomore-title" data-reveal>
    <SectionHeading
      eyebrow="Sophomore intake"
      title-id="sophomore-title"
      title="面向大二招生"
    >
      如果你已经进入大二，我们会更关注你是否具备一定基础，以及你如何展示自己的能力。一个小项目、一个个人博客、一段开源贡献，哪怕规模不大，只要能说明你的思考和动手过程，都可以成为申请时的展示材料。
    </SectionHeading>
    <div :class="$style['grid']">
      <article>
        <span>01</span>
        <h3>小项目</h3>
        <p>能跑起来、能说明设计思路，比单纯罗列技术名词更有说服力。</p>
      </article>
      <article>
        <span>02</span>
        <h3>个人博客</h3>
        <p>记录学习笔记、项目复盘或问题排查过程，都能展示你的持续性。</p>
      </article>
      <article>
        <span>03</span>
        <h3>开源贡献</h3>
        <p>哪怕只是一段修复、一次文档完善，也能体现真实协作意识。</p>
      </article>
    </div>
    <p :class="$style['note']">
      如果暂时不确定该准备什么，或在方向选择、学习路线、资料获取上有疑问，也可以先加入招新咨询群交流，我们会尽量帮你找到合适的切入点。
    </p>
  </section>
</template>

<style module src="../styles/SophomoreSection.module.css"></style>

