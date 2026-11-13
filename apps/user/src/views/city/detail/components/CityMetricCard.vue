<script setup lang="ts">
import type { CityMetricSection } from '../utils'

defineProps<{ section: CityMetricSection }>()
</script>

<template>
  <section class="city-metric hf-card">
    <div class="city-metric__head">
      <h2 class="hf-section-title">{{ section.title }}</h2>
      <span class="city-metric__icon">
        <component :is="section.icon" :size="18" :stroke-width="1.75" />
      </span>
    </div>

    <div class="city-metric__grid" :style="{ '--metric-cols': section.columns }">
      <div v-for="item in section.items" :key="item.label" class="city-metric__item">
        <span class="city-metric__label">{{ item.label }}</span>
        <span class="city-metric__value">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.city-metric__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.city-metric__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 9px;
  background: #f1f5f9;
  color: #475569;
}
.city-metric__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 16px;
  margin-top: 16px;
}
.city-metric__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.city-metric__label {
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
.city-metric__value {
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: #1e293b;
}
@media (min-width: 768px) {
  .city-metric__grid {
    grid-template-columns: repeat(var(--metric-cols), minmax(0, 1fr));
  }
}
</style>
