<script setup lang="ts">
import SiteNav from './components/SiteNav.vue';
import HeroSection from './components/HeroSection.vue';
import ProductShowcase from './components/ProductShowcase.vue';
import StatementBlock from './components/StatementBlock.vue';
import GoalsSection from './components/GoalsSection.vue';
import FlowSection from './components/FlowSection.vue';
import TimelineSection from './components/TimelineSection.vue';
import ModulesSection from './components/ModulesSection.vue';
import AssessSection from './components/AssessSection.vue';
import JoinSection from './components/JoinSection.vue';
import SiteFooter from './components/SiteFooter.vue';
</script>

<template>
  <q-layout view="hHh lpR fFr">
    <SiteNav />
    <q-page-container>
      <q-page>
        <HeroSection />
        <main>
          <ProductShowcase />
          <StatementBlock />
          <GoalsSection />
          <FlowSection />
          <TimelineSection />
          <ModulesSection />
          <AssessSection />
          <JoinSection />
        </main>
        <SiteFooter />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
