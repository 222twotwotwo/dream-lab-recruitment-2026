<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();

/**
 * 区块标题：eyebrow + 标题 + 导语。
 * 原先散落在 global.css 的 .section-heading 规则收敛于此，
 * 深色底区块（训练营 / 报名卡）用 tone="cream" 得到奶白导语；
 * flush 去掉容器留白（max-width/下边距/侧边距），供自带布局的区块（报名卡）使用。
 */
defineProps<{
  eyebrow?: string;
  /** h2 的 id，供区块 aria-labelledby 引用 */
  titleId?: string;
  /** 标题文字 */
  title: string;
  tone?: "cream";
  /** 去除容器留白，间距交由使用方 */
  flush?: boolean;
}>();
</script>

<template>
  <div :class="[$style['heading'], flush && $style['flush']]">
    <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
    <h2 :id="titleId">{{ title }}</h2>
    <p :class="[$style['lead'], tone === 'cream' && $style['cream']]"><slot /></p>
  </div>
</template>

<style module src="../styles/SectionHeading.module.css"></style>
