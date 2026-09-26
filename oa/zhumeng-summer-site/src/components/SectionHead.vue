<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  desc?: string;
}>();
</script>

<template>
  <div v-reveal class="sec-head">
    <p class="sec-eyebrow">{{ eyebrow }}</p>
    <h2 class="sec-title">{{ title }}</h2>
    <span class="sec-line"></span>
    <p v-if="desc" class="sec-desc">{{ desc }}</p>
  </div>
</template>
