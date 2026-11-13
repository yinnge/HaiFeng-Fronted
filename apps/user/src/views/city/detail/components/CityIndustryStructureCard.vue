<script setup lang="ts">
import { computed } from 'vue'
import type { CityDetailVO } from '@/types/city'
import { CITY_TONES, formatRatio, isEmptyObject, readNum } from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

/** 沿用旧页 v-if 行为：空对象整块隐藏 */
const visible = computed(() => !isEmptyObject(props.detail.industryStructure))

const blocks = computed(() => [
  { key: 'primary', label: '第一产业', tone: CITY_TONES.blue, value: formatRatio(readNum(props.detail.industryStructure, 'primaryRatio')) },
  { key: 'secondary', label: '第二产业', tone: CITY_TONES.green, value: formatRatio(readNum(props.detail.industryStructure, 'secondaryRatio')) },
  { key: 'tertiary', label: '第三产业', tone: CITY_TONES.amber, value: formatRatio(readNum(props.detail.industryStructure, 'tertiaryRatio')) },
])
</script>

<template>
  <section v-if="visible" class="city-structure hf-card">
    <h2 class="hf-section-title">产业结构</h2>

    <div class="city-structure__grid">
      <div
        v-for="block in blocks"
        :key="block.key"
        class="city-structure__item"
        :style="{ backgroundColor: block.tone.bg }"
      >
        <span class="city-structure__value hf-mono" :style="{ color: block.tone.fg }">{{ block.value }}</span>
        <span class="city-structure__label">{{ block.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.city-structure__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}
.city-structure__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 12px 6px;
  border-radius: 10px;
}
.city-structure__value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}
.city-structure__label {
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}
@media (max-width: 1023px) {
  .city-structure__value {
    font-size: 15px;
  }
}
</style>
