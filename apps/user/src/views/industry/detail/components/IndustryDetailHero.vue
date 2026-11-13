<script setup lang="ts">
/**
 * 行业详情 Hero：暖橙实心底 + 通用背景图，冷白画布衬托（需求 Q2 / Q12）。
 * 样式集中在 ../detail.css（全部由 .page-industry-detail 限定，不写 scoped，
 * 避免 teleport / 全局背景清空导致的选择器失配）。
 */
import { computed } from 'vue'
import type { IndustryDetailVO } from '@/types/industry'
import {
  HERO_BG_URL,
  categoryName,
  categoryCode,
  getIndustryIcon,
  formatRate,
  toHeat,
  trendStyle,
  PLACEHOLDER_EMPTY,
} from '../utils'

const props = defineProps<{
  detail: IndustryDetailVO
  /** 门类（来自列表 VO，详情 VO 不带此字段） */
  category?: string
  /** Hero 简介：优先列表 VO 的 description */
  intro?: string
  favorited?: boolean
}>()

const emit = defineEmits<{ (e: 'toggle-fav'): void }>()

const iconStyle = computed(() => getIndustryIcon(props.detail.industryName, props.category))
const catName = computed(() => categoryName(props.category))
const catCode = computed(() => categoryCode(props.category))

/** Hero 内 4 个速览项：全部取自主表真实字段，人才缺口 90/90 为空故不占位 */
const stats = computed(() => {
  const heat = toHeat(props.detail.investmentHeat)
  return [
    { label: '市场规模', value: props.detail.marketScale?.trim() || PLACEHOLDER_EMPTY },
    { label: '年增长率', value: formatRate(props.detail.annualGrowthRate) },
    { label: '投资热度', value: heat === null ? PLACEHOLDER_EMPTY : `${heat}%` },
    { label: '人才趋势', value: trendStyle(props.detail.talentTrend).label },
  ]
})
</script>

<template>
  <section class="idt-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="idt-hero__top">
      <span class="idt-hero__icon">
        <component :is="iconStyle.icon" :size="30" :stroke-width="1.75" />
      </span>
      <div class="idt-hero__main">
        <div class="idt-hero__title-row">
          <h1 class="idt-hero__title">{{ detail.industryName || '行业详情' }}</h1>
          <span v-if="catName" class="idt-hero__cat">
            <span v-if="catCode" class="idt-hero__cat-code">{{ catCode }}</span>
            {{ catName }}
          </span>
        </div>
        <p v-if="intro" class="idt-hero__desc">{{ intro }}</p>
      </div>

      <!-- 右上角收藏星标：与列表页同款（需求 Q5） -->
      <button
        type="button"
        class="idt-hero__fav"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? '取消收藏该行业' : '收藏该行业'"
        :aria-pressed="favorited"
        :title="favorited ? '取消收藏' : '收藏'"
        @click="emit('toggle-fav')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </div>

    <div class="idt-hero__stats">
      <div v-for="item in stats" :key="item.label" class="idt-hero__stat">
        <span class="idt-hero__stat-value">{{ item.value }}</span>
        <span class="idt-hero__stat-label">{{ item.label }}</span>
      </div>
    </div>
  </section>
</template>
