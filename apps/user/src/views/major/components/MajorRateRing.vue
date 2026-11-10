<script setup lang="ts">
/**
 * 专业卡片就业率环形进度图。
 * 纯 SVG 静态渲染：不做弧长/数字动画，容器不含 transform / filter / will-change，
 * 避免 AGENTS.md §6 的合成层位图化导致环内数字发虚。
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    rate?: number | null
    size?: number
    stroke?: number
  }>(),
  { size: 52, stroke: 5 },
)

const hasData = computed(() => props.rate != null && Number.isFinite(props.rate))
const percent = computed(() => Math.min(100, Math.max(0, props.rate ?? 0)))
const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - percent.value / 100))

const TRACK_COLOR = '#E2E8F0'
/** 与 List.vue 的 rateClass 三档语义保持一致 */
const arcColor = computed(() => {
  if (!hasData.value) return '#94A3B8'
  if (percent.value >= 85) return '#059669'
  if (percent.value >= 70) return '#D97706'
  return '#E11D48'
})
const displayText = computed(() => (hasData.value ? percent.value.toFixed(1) : '—'))
const ariaLabel = computed(() =>
  hasData.value ? `就业率 ${percent.value.toFixed(1)}%` : '就业率数据统计中',
)
</script>

<template>
  <div
    class="rate-ring"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    :aria-label="ariaLabel"
  >
    <svg
      class="rate-ring__svg"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="TRACK_COLOR"
        :stroke-width="stroke"
      />
      <circle
        v-if="hasData"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        :stroke="arcColor"
        :stroke-width="stroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <span class="rate-ring__value" :style="{ color: arcColor }">
      {{ displayText }}<small v-if="hasData">%</small>
    </span>
  </div>
</template>

<style scoped>
.rate-ring {
  position: relative;
  flex: none;
  line-height: 1;
}
.rate-ring__svg {
  display: block;
}
/* inset:0 + flex 居中，不用 translate(-50%,-50%)：内容层零 transform */
.rate-ring__value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.rate-ring__value small {
  margin-left: 1px;
  font-size: 9px;
  font-weight: 500;
}
</style>
