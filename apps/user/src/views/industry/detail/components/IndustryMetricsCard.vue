<script setup lang="ts">
/**
 * 核心指标看板：主表 9 个概览指标的展开解读（需求 Q1 / Q8）。
 * 人才缺口 90/90 全空，故不展示该格；投资热度用 0~100 刻度条。
 */
import { computed } from 'vue'
import { BarChart3, Gauge, TrendingUp } from 'lucide-vue-next'
import type { IndustryDetailVO } from '@/types/industry'
import { formatRate, rateStyle, toHeat, HEAT_MAX, PLACEHOLDER_EMPTY } from '../utils'

const props = defineProps<{ detail: IndustryDetailVO }>()

const rate = computed(() => formatRate(props.detail.annualGrowthRate))
const rateTone = computed(() => rateStyle(props.detail.annualGrowthRate))
const heat = computed(() => toHeat(props.detail.investmentHeat))
const scale = computed(() => props.detail.marketScale?.trim() || PLACEHOLDER_EMPTY)
const heatWidth = computed(() => (heat.value === null ? '0%' : `${heat.value}%`))
</script>

<template>
  <section class="hf-card idt-block">
    <h2 class="hf-section-title">
      核心指标
      <BarChart3 :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>

    <div class="idt-metrics">
      <div class="idt-metrics__cell">
        <span class="idt-metrics__label">市场规模</span>
        <span class="idt-metrics__value">{{ scale }}</span>
        <span class="idt-metrics__hint">行业当前统计口径下的总体量</span>
      </div>
      <div class="idt-metrics__cell">
        <span class="idt-metrics__label">年增长率</span>
        <span class="idt-metrics__value" :style="{ color: rateTone.fg }">
          <component :is="rateTone.icon" :size="20" :stroke-width="1.75" />
          {{ rate }}
        </span>
        <span class="idt-metrics__hint">相较上一统计周期的变化幅度</span>
      </div>
      <div class="idt-metrics__cell">
        <span class="idt-metrics__label">投资热度</span>
        <span class="idt-metrics__value">
          <Gauge :size="20" :stroke-width="1.75" />
          {{ heat === null ? PLACEHOLDER_EMPTY : `${heat} / ${HEAT_MAX}` }}
        </span>
        <span class="idt-metrics__hint">资本关注度综合刻度</span>
      </div>
    </div>

    <div class="idt-heat">
      <div class="idt-heat__head">
        <span class="idt-heat__label">
          <TrendingUp :size="14" :stroke-width="1.75" />
          投资热度刻度
        </span>
        <span class="idt-heat__value">{{ heat === null ? PLACEHOLDER_EMPTY : `${heat}%` }}</span>
      </div>
      <div class="idt-heat__track" role="progressbar" :aria-valuenow="heat ?? 0" aria-valuemin="0" :aria-valuemax="HEAT_MAX">
        <span class="idt-heat__bar" :style="{ width: heatWidth }" />
      </div>
      <p class="idt-heat__note">指标来源于行业概览统计，仅供生涯规划参考，具体以官方发布为准。</p>
    </div>
  </section>
</template>
