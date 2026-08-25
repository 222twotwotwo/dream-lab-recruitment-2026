<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
</script>

<template>
  <section id="apply" :class="$style['apply']" class="section" aria-labelledby="apply-title" data-reveal>
    <div :class="$style['copy']">
      <SectionHeading
        eyebrow="Join Dream Lab"
        title-id="apply-title"
        title="专业不设限，热爱技术就来试试"
        tone="cream"
        flush
      >
        面向官渡、光华、西城所有热爱技术、对计算机感兴趣的同学，计算机、电信、理学院小伙伴优先。报名方式以招新咨询群、院系通知和宣讲会现场安排为准。
      </SectionHeading>
      <img :class="$style['mascot']" src="/assets/Alice.png" alt="Alice" height="300" loading="lazy" />
    </div>
    <div :class="$style['panel']" aria-label="报名准备">
      <figure :class="$style['qrCard']">
        <img
          src="/assets/recruitment-qr.png?v=20260816"
          alt="26广油逐梦创新实验室招新群二维码"
          width="1031"
          height="1478"
          loading="lazy"
        />
        <figcaption>
          <strong>扫码加入招新咨询群</strong>
          <span>26广油逐梦创新实验室招新群</span>
          <small>二维码 7 天内有效，8 月 23 日前可扫码加入。</small>
        </figcaption>
      </figure>
      <div :class="$style['actions']">
        <a class="button button-primary" href="#roadmap">查看时间安排</a>
      </div>
    </div>
  </section>
</template>

<style module src="../styles/ApplySection.module.css"></style>

