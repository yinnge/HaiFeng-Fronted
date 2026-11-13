<script setup lang="ts">
import { computed } from 'vue'
import type { CityDetailVO } from '@/types/city'
import { formatText, isEmptyObject, readList, readText } from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

/** 沿用旧页 v-if 行为：空对象整块隐藏，不留空壳卡 */
const visible = computed(() => !isEmptyObject(props.detail.futurePlan))
const items = computed(() => [
  { label: '发展目标', value: formatText(readText(props.detail.futurePlan, 'developmentGoal')) },
  { label: '目标年份', value: formatText(readText(props.detail.futurePlan, 'targetYear')) },
])
const keyAreas = computed(() => readList(props.detail.futurePlan, 'keyAreas'))
</script>

<template>
  <section v-if="visible" class="city-future hf-card">
    <h2 class="hf-section-title">未来规划</h2>

    <div class="city-future__grid">
      <div v-for="item in items" :key="item.label" class="city-future__item">
        <span class="city-future__label">{{ item.label }}</span>
        <span class="city-future__value">{{ item.value }}</span>
      </div>
    </div>

    <div v-if="keyAreas.length" class="city-future__areas">
      <span v-for="(area, index) in keyAreas" :key="`${area}-${index}`" class="ct-chip">{{ area }}</span>
    </div>
  </section>
</template>

<style scoped>
.city-future__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  margin-top: 16px;
}
.city-future__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.city-future__label {
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
.city-future__value {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: #1e293b;
}
.city-future__areas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
@media (max-width: 767px) {
  .city-future__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
