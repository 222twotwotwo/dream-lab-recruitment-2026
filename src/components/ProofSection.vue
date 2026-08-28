<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
import SectionHeading from "./SectionHeading.vue";
import CompanyMarquee from "./CompanyMarquee.vue";
</script>

<template>
  <section id="proof" :class="$style['proof']" class="section" aria-labelledby="proof-title">
    <SectionHeading
      eyebrow="Proof of work"
      title-id="proof-title"
      title="用足迹和奖牌说话"
    >
      自实验室21-22创立发展以来，我们不是把“未来”挂在墙上，而是让你看到学长学姐已经走过的路：就业、实习、竞赛，三条线都有人在前面开路。
    </SectionHeading>
    <div :class="$style['layout']">
      <article :class="$style['panel']" data-reveal>
        <h3>实习就业都有真实去向</h3>
        <p>
          就业去向为滴滴、即时设计、汇川技术、亚信科技；实习覆盖物流、游戏、云计算、AI / 大数据、脑机接口、电商等方向。
        </p>
        <p>
          这部分不是摆名字，而是让你看到学长学姐把训练密度落到真实岗位和真实项目里的路径。
        </p>
        <div :class="$style['linkRow']">
          <a href="https://www.nowcoder.com/share/jump/19159771023363997" target="_blank" rel="noopener noreferrer">
            点击查看毕业学长经历
          </a>
          <a href="https://www.nowcoder.com/share/jump/1671493421034538954" target="_blank" rel="noopener noreferrer">
            点击查看准大二学长经历
          </a>
        </div>
      </article>
      <article :class="[$style['panel'], $style['accent']]" data-reveal>
        <h3>竞赛战绩同样硬核</h3>
        <ul :class="$style['medalList']">
          <li>Kaggle 全球金牌</li>
          <li>蓝桥杯国二、国三</li>
          <li>数学建模国一</li>
          <li>CACC 区域赛三等</li>
          <li>多项省赛奖项</li>
        </ul>
      </article>
    </div>

    <CompanyMarquee />
  </section>
</template>

<style module src="../styles/ProofSection.module.css"></style>

