<script setup lang="ts">
import { computed } from 'vue'
import { normalizeGenderRatio } from './utils'

const props = defineProps<{
  maleRatio?: number | null
  femaleRatio?: number | null
}>()

const ratio = computed(() => normalizeGenderRatio(props.maleRatio, props.femaleRatio))
</script>

<template>
  <section v-if="ratio" class="gender hf-card">
    <h2 class="hf-section-title">男女比例</h2>
    <div class="gender__bar" role="img" :aria-label="`男生 ${ratio.male}%，女生 ${ratio.female}%`">
      <span class="gender__male" :style="{ width: `${ratio.male}%` }" />
      <span class="gender__female" :style="{ width: `${ratio.female}%` }" />
    </div>
    <div class="gender__legend">
      <span class="gender__item"><i class="gender__dot gender__dot--male" />男生 {{ ratio.male }}%</span>
      <span class="gender__item"><i class="gender__dot gender__dot--female" />女生 {{ ratio.female }}%</span>
    </div>
  </section>
</template>

<style scoped>
.gender {
  padding: 20px;
}
.gender__bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: #f1f5f9;
}
.gender__male {
  background: #3b82f6;
}
.gender__female {
  background: #f472b6;
}
.gender__legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.gender__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  /* 不用浅粉文字 */
  color: #475569;
}
.gender__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}
.gender__dot--male {
  background: #3b82f6;
}
.gender__dot--female {
  background: #f472b6;
}
</style>
