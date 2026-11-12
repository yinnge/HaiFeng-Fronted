<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-vue-next'
import type { IndustryListVO } from '@/types/industry'
import {
  HEAT_MAX,
  PLACEHOLDER_EMPTY,
  TONE_COLORS,
  categoryCode,
  categoryName,
  getIndustryIcon,
  growthTone,
} from './utils'

const props = defineProps<{
  item: IndustryListVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'toggle-fav', id: string): void
}>()

const iconStyle = computed(() => getIndustryIcon(props.item.industryName, props.item.category))
const catCode = computed(() => categoryCode(props.item.category))
const catName = computed(() => categoryName(props.item.category))
const growth = computed(() => growthTone(props.item.annualGrowthRate))
const desc = computed(() => props.item.description?.trim() || PLACEHOLDER_EMPTY)
const heat = computed(() =>
  typeof props.item.investmentHeat === 'number' ? props.item.investmentHeat : 0,
)
</script>

<template>
  <!-- 整卡由父层推 /industry/:id；根元素用 div[role=button]（内部要放收藏按钮，button 不可嵌套） -->
  <div
    class="hf-card ind-card is-clickable"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${item.industryName} 详情`"
    @click="emit('open', String(item.id))"
    @keydown.enter="emit('open', String(item.id))"
    @keydown.space.prevent="emit('open', String(item.id))"
  >
    <span class="ind-card__head">
      <span
        class="ind-card__icon"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <component :is="iconStyle.icon" :size="24" :stroke-width="1.75" />
      </span>
      <span class="ind-card__text">
        <span class="ind-card__name" :title="item.industryName">{{ item.industryName }}</span>
        <span class="ind-card__tags">
          <span
            v-if="catName"
            class="hf-tag"
            :style="{
              color: iconStyle.fg,
              backgroundColor: iconStyle.bg,
              '--tag-ring': iconStyle.ring,
            }"
          >{{ catName }}</span>
          <span
            class="hf-tag"
            :style="{
              color: growth.fg,
              backgroundColor: growth.bg,
              '--tag-ring': 'transparent',
            }"
          >
            <TrendingUp v-if="item.annualGrowthRate >= 0" :size="12" :stroke-width="1.75" />
            <TrendingDown v-else :size="12" :stroke-width="1.75" />
            年增长 {{ growth.text }}
          </span>
        </span>
      </span>
      <!-- 右上角收藏星标：@click.stop 避免触发整卡跳转 -->
      <button
        type="button"
        class="ind-fav-star"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? `取消收藏 ${item.industryName}` : `收藏 ${item.industryName}`"
        :title="favorited ? '取消收藏' : '收藏'"
        @click.stop="emit('toggle-fav', String(item.id))"
        @keydown.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </span>

    <span class="ind-card__desc" :title="item.description || ''">{{ desc }}</span>

    <span class="ind-card__meta">
      <span class="ind-card__meta-item">
        <span class="ind-card__meta-label">市场规模</span>
        <span class="ind-card__meta-value">{{ item.marketScale || PLACEHOLDER_EMPTY }}</span>
      </span>
      <span class="ind-card__meta-item">
        <span class="ind-card__meta-label">人才缺口</span>
        <span class="ind-card__meta-value">{{ item.talentGap || PLACEHOLDER_EMPTY }}</span>
      </span>
    </span>

    <span class="ind-card__heat">
      <span class="ind-card__heat-head">
        <span class="ind-card__heat-label">投资热度</span>
        <span class="ind-card__heat-value">{{ heat }}%</span>
      </span>
      <span class="ind-card__heat-track">
        <span
          class="ind-card__heat-bar"
          :style="{ width: `${Math.min(heat, HEAT_MAX)}%` }"
        />
      </span>
    </span>

    <span class="ind-card__foot">
      <span class="ind-card__code">{{ catCode }}</span>
      <span class="ind-card__action">
        查看详情
        <ArrowRight :size="14" :stroke-width="1.75" class="ind-card__arrow" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.ind-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}
.ind-card__head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}
.ind-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.ind-card__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.ind-card__name {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
}
.ind-card__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ind-card__desc {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 46px;
  margin: 14px 0;
  font-size: 14px;
  line-height: 1.65;
  color: #475569;
  overflow-wrap: anywhere;
}
.ind-card__meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.ind-card__meta-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.ind-card__meta-label {
  flex: none;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.ind-card__meta-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
.ind-card__heat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}
.ind-card__heat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ind-card__heat-label {
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.ind-card__heat-value {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  color: #c2410c;
}
.ind-card__heat-track {
  display: block;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}
.ind-card__heat-bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #fbbf24 0%, #f97316 100%);
}
.ind-card__foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}
.ind-card__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}
.ind-card__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #c2410c;
  transition: color 0.2s ease;
}
.ind-card__arrow {
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.ind-card:hover .ind-card__action {
  color: #9a3412;
}
.ind-card:hover .ind-card__arrow {
  transform: translateX(2px);
  color: #ea580c;
}

/* ===== 右上角收藏星标（放大版） ===== */
.ind-fav-star {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #cbd5e1;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}
.ind-fav-star svg {
  width: 20px;
  height: 20px;
}
.ind-fav-star:hover {
  color: #d97706;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}
.ind-fav-star.is-on {
  color: #f59e0b;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}
.ind-fav-star.is-on svg {
  fill: currentColor;
}
.ind-fav-star:active {
  transform: translateY(1px);
}
.ind-fav-star:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
</style>
