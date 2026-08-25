<script setup lang="ts">
import { useCssModule } from "vue";

// Vapor Mode 不注入 $style（<style module> 的已知缺口）：显式从实例取模块类
const $style = useCssModule();
</script>

<template>
  <footer :class="$style['footer']">
    <p>逐梦创新实验室</p>
    <a href="#top">回到顶部</a>
  </footer>
</template>

<style module src="../styles/SiteFooter.module.css"></style>

