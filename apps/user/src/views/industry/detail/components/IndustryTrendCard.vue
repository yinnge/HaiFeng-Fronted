<script setup lang="ts">
/**
 * 四大趋势（左栏展开版）：语义正向配色（需求 Q10），
 * 每张色卡含图标、取值与一句解释，与右栏紧凑速览形成层次差异。
 */
import { computed } from 'vue'
import { Activity } from 'lucide-vue-next'
import type { IndustryDetailVO } from '@/types/industry'
import { TREND_ITEMS, trendStyle } from '../utils'

const props = defineProps<{ detail: IndustryDetailVO }>()

/** 注意：趋势名称（label）与趋势取值（style.label）是两个不同字段，不能互相覆盖 */
const items = computed(() =>
  TREND_ITEMS.map((item) => ({
    key: item.key,
    label: item.label,
    hint: item.hint,
    style: trendStyle(props.detail[item.key] as string | undefined),
  })),
)
</script>

<template>
  <section class="hf-card idt-block">
    <h2 class="hf-section-title">
      四大趋势
      <Activity :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>
    <div class="idt-trend-grid">
      <div
        v-for="item in items"
        :key="item.key"
        class="idt-trend-item"
        :style="{ backgroundColor: item.style.bg, boxShadow: `inset 0 0 0 1px ${item.style.ring}` }"
      >
        <span class="idt-trend-item__icon" :style="{ color: item.style.fg, backgroundColor: '#ffffff' }">
          <component :is="item.style.icon" :size="18" :stroke-width="1.75" />
        </span>
        <div class="idt-trend-item__body">
          <span class="idt-trend-item__label">{{ item.label }}</span>
          <span class="idt-trend-item__value" :style="{ color: item.style.fg }">
            {{ item.style.label }}
          </span>
          <span class="idt-trend-item__hint">{{ item.style.desc }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
