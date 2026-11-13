<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import type { CityDetailVO } from '@/types/city'
import { PLACEHOLDER_DASH, formatBasic, formatNum } from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

/** Q11：右栏基本信息统一用破折号占位 */
function numOrDash(value: number | null | undefined, unit = ''): string {
  return value == null || !Number.isFinite(value) ? PLACEHOLDER_DASH : formatNum(value, unit)
}
function ratioOrDash(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? PLACEHOLDER_DASH : `${formatNum(value)}%`
}

const rows = computed(() => [
  { label: '行政区划代码', value: formatBasic(props.detail.adminCode || null), mono: true },
  { label: '城市级别', value: formatBasic(props.detail.cityLevel || null), mono: false },
  { label: '500强数量', value: numOrDash(props.detail.fortune500Count, '家'), mono: false },
  { label: '城镇化率', value: ratioOrDash(props.detail.urbanizationRate), mono: false },
  { label: '老龄化率', value: ratioOrDash(props.detail.agingRate), mono: false },
  { label: '流入人口比例', value: ratioOrDash(props.detail.migrantPopRatio), mono: false },
])
</script>

<template>
  <section class="city-look hf-card">
    <div class="city-look__head">
      <h2 class="hf-section-title">城市速览</h2>
      <Info :size="17" :stroke-width="1.75" class="city-look__head-icon" />
    </div>

    <dl class="city-look__list">
      <div v-for="row in rows" :key="row.label" class="city-look__row">
        <dt class="city-look__label">{{ row.label }}</dt>
        <dd class="city-look__value" :class="{ 'hf-mono': row.mono }">{{ row.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.city-look__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.city-look__head-icon {
  flex: none;
  color: #64748b;
}
.city-look__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0 0;
}
.city-look__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 10px;
  background: #f8fafc;
}
.city-look__label {
  flex: none;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
.city-look__value {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #1e293b;
}
</style>
