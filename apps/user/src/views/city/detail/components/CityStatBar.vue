<script setup lang="ts">
import { computed } from 'vue'
import { Coins, GraduationCap, Mountain, TrendingUp } from 'lucide-vue-next'
import type { CityDetailVO } from '@/types/city'
import { CITY_TONES, formatNum, formatRatio, readNum } from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

/** Q10：人均 GDP 统一万元口径；比率先判空再拼 %；0 是合法值 */
const blocks = computed(() => [
  { key: 'area', icon: Mountain, tone: CITY_TONES.blue, label: '面积 (km²)', value: formatNum(props.detail.area) },
  { key: 'gdp', icon: Coins, tone: CITY_TONES.green, label: '人均GDP (万元)', value: formatNum(props.detail.perCapitaGdp) },
  { key: 'growth', icon: TrendingUp, tone: CITY_TONES.amber, label: 'GDP增速', value: formatRatio(props.detail.gdpGrowthRate) },
  {
    key: 'colleges',
    icon: GraduationCap,
    tone: CITY_TONES.red,
    label: '高校总数',
    value: formatNum(readNum(props.detail.highEducation, 'totalColleges')),
  },
])
</script>

<template>
  <section class="city-stat-bar hf-card" aria-label="城市核心指标">
    <div v-for="block in blocks" :key="block.key" class="city-stat-bar__item">
      <span
        class="city-stat-bar__icon"
        :style="{ backgroundColor: block.tone.bg, color: block.tone.fg }"
      >
        <component :is="block.icon" :size="18" :stroke-width="1.75" />
      </span>
      <span class="city-stat-bar__value hf-mono">{{ block.value }}</span>
      <span class="city-stat-bar__label">{{ block.label }}</span>
    </div>
  </section>
</template>

<style scoped>
/* padding 由页面级 .hf-card 统一提供，避免同特异性规则相互覆盖 */
.city-stat-bar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.city-stat-bar__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-width: 0;
  padding: 4px 0;
}
.city-stat-bar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: 10px;
}
.city-stat-bar__value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
}
.city-stat-bar__label {
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
@media (min-width: 768px) {
  .city-stat-bar {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
