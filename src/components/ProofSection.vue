<script setup lang="ts">
import CompanyMarquee from "./CompanyMarquee.vue";
</script>

<template>
  <section id="proof" class="section proof-section" aria-labelledby="proof-title">
    <div class="section-heading">
      <p class="eyebrow">Proof of work</p>
      <h2 id="proof-title">用足迹和奖牌说话</h2>
      <p>
        自实验室21-22创立发展以来，我们不是把“未来”挂在墙上，而是让你看到学长学姐已经走过的路：就业、实习、竞赛，三条线都有人在前面开路。
      </p>
    </div>
    <div class="proof-layout">
      <article class="proof-panel">
        <h3>实习就业都有真实去向</h3>
        <p>
          就业去向为滴滴、即时设计、汇川技术、亚信科技；实习覆盖物流、游戏、云计算、AI / 大数据、脑机接口、电商等方向。
        </p>
        <p>
          这部分不是摆名字，而是让你看到学长学姐把训练密度落到真实岗位和真实项目里的路径。
        </p>
        <div class="link-row">
          <a href="https://www.nowcoder.com/share/jump/19159771023363997" target="_blank" rel="noopener noreferrer">
            点击查看毕业学长经历
          </a>
          <a href="https://www.nowcoder.com/share/jump/1671493421034538954" target="_blank" rel="noopener noreferrer">
            点击查看准大二学长经历
          </a>
        </div>
      </article>
      <article class="proof-panel accent-panel">
        <h3>竞赛战绩同样硬核</h3>
        <ul class="medal-list">
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

