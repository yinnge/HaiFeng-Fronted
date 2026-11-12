<script setup lang="ts">
import { Route } from 'lucide-vue-next'
import type { ProcessStep } from '../utils'

defineProps<{
  steps: ProcessStep[]
}>()
</script>

<template>
  <section v-if="steps.length" class="process hf-card">
    <h2 class="hf-section-title">赛事流程</h2>
    <p class="process__subtitle">从报名到颁奖的完整参赛路径</p>

    <ol class="cd-timeline">
      <li v-for="step in steps" :key="step.index" class="cd-timeline__item">
        <span class="cd-timeline__dot">{{ step.index }}</span>
        <div class="cd-timeline__body">
          <p class="cd-timeline__title">{{ step.title }}</p>
          <p v-if="step.content" class="cd-timeline__text">{{ step.content }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.process {
  padding: 20px;
}
.process__subtitle {
  margin: 6px 0 0 13px;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
</style>
