<script setup lang="ts">
/** 右栏「趋势速览」：紧凑 4 行 + 投资热度条（需求 Q3 右栏第一张卡） */
import { computed } from 'vue'
import { Activity } from 'lucide-vue-next'
import type { IndustryDetailVO } from '@/types/industry'
import { TREND_ITEMS, trendStyle, toHeat, HEAT_MAX, PLACEHOLDER_EMPTY } from '../utils'

const props = defineProps<{ detail: IndustryDetailVO }>()

const items = computed(() =>
  TREND_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    style: trendStyle(props.detail[item.key] as string | undefined),
  })),
)
const heat = computed(() => toHeat(props.detail.investmentHeat))
const heatWidth = computed(() => (heat.value === null ? '0%' : `${heat.value}%`))
</script>

<template>
  <section class="hf-card idt-aside-card">
    <h2 class="hf-section-title">
      趋势速览
      <Activity :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>
    <div class="idt-aside-trends">
      <div v-for="item in items" :key="item.key" class="idt-aside-trend">
        <span class="idt-aside-trend__label">{{ item.label }}</span>
        <span class="idt-aside-trend__value" :style="{ color: item.style.fg, backgroundColor: item.style.bg }">
          <component :is="item.style.icon" :size="13" :stroke-width="1.75" />
          {{ item.style.label }}
        </span>
      </div>
    </div>
    <div class="idt-aside-heat">
      <div class="idt-aside-heat__head">
        <span>投资热度</span>
        <span>{{ heat === null ? PLACEHOLDER_EMPTY : `${heat} / ${HEAT_MAX}` }}</span>
      </div>
      <div class="idt-aside-heat__track">
        <span class="idt-aside-heat__bar" :style="{ width: heatWidth }" />
      </div>
    </div>
  </section>
</template>
