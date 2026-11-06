<script setup lang="ts">
import { computed } from 'vue'
import {
  COMPASS_SIZE,
  COMPASS_CENTER,
  COMPASS_EXPANDED_CENTER,
  type HeroModule,
} from './hero.config'

const props = defineProps<{
  modules: HeroModule[]
  expanded: boolean
  hoverKey: string | null
  expandedModule: HeroModule | null
  activeChildren: { column: unknown; pos: { x: number; y: number } }[]
  /** 入场是否完成（驱动 SVG 淡入） */
  entered: boolean
  /** 循环动画是否运行（入场前 / 滚出视口 / 标签页隐藏 时为 false） */
  playing: boolean
}>()

/* 72 个短刻度（缓慢旋转） */
const ticks = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2
  const r1 = 211
  const r2 = 215
  return {
    x1: (COMPASS_CENTER.x + r1 * Math.cos(a)).toFixed(1),
    y1: (COMPASS_CENTER.y + r1 * Math.sin(a)).toFixed(1),
    x2: (COMPASS_CENTER.x + r2 * Math.cos(a)).toFixed(1),
    y2: (COMPASS_CENTER.y + r2 * Math.sin(a)).toFixed(1),
  }
})

function lineStyle(m: HeroModule): Record<string, string> {
  const hide = props.expanded
  const hovered = props.hoverKey === m.key
  return {
    stroke: hide ? 'transparent' : hovered ? m.color.solid : '#CBD5E1',
    opacity: hide ? '0' : '1',
  }
}

const showChildLines = computed(
  () => props.expanded && props.expandedModule?.type === 'multi',
)
</script>

<template>
  <svg
    class="hf-compass-svg"
    :class="{ 'is-entered': entered, 'is-paused': !playing }"
    :viewBox="`0 0 ${COMPASS_SIZE.w} ${COMPASS_SIZE.h}`"
    aria-hidden="true"
  >
    <ellipse cx="280" cy="220" :rx="150" :ry="110" fill="none" stroke="#E2E8F0" stroke-opacity="0.6" />
    <ellipse cx="280" cy="220" :rx="215" :ry="160" fill="none" stroke="#E2E8F0" stroke-opacity="0.6" />
    <g class="hf-ticks">
      <line
        v-for="(t, i) in ticks"
        :key="i"
        :x1="t.x1"
        :y1="t.y1"
        :x2="t.x2"
        :y2="t.y2"
        stroke="#CBD5E1"
        stroke-opacity="0.5"
        stroke-width="1"
      />
    </g>
    <line
      v-for="m in modules"
      :key="'ln-' + m.key"
      :x1="COMPASS_CENTER.x"
      :y1="COMPASS_CENTER.y"
      :x2="m.center.x"
      :y2="m.center.y"
      class="hf-center-line"
      :style="lineStyle(m)"
    />
    <template v-if="showChildLines">
      <line
        v-for="(c, i) in activeChildren"
        :key="'cn-' + i"
        :x1="COMPASS_EXPANDED_CENTER.x"
        :y1="COMPASS_EXPANDED_CENTER.y"
        :x2="c.pos.x"
        :y2="c.pos.y"
        class="hf-child-line"
        :style="{ stroke: expandedModule!.color.solid }"
      />
    </template>
  </svg>
</template>

<style scoped>
.hf-compass-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: visible;
  opacity: 0;
  transition: opacity 0.6s ease;
}
.hf-compass-svg.is-entered {
  opacity: 1;
}
.hf-ticks {
  transform-box: view-box;
  transform-origin: 280px 220px;
  animation: hf-spin 60s linear infinite;
}
@keyframes hf-spin {
  to {
    transform: rotate(360deg);
  }
}
.hf-center-line {
  stroke-width: 1.25;
  stroke-dasharray: 4 6;
  animation: hf-flow 8s linear infinite;
  transition: stroke 0.3s ease, opacity 0.3s ease;
}
@keyframes hf-flow {
  to {
    stroke-dashoffset: -20;
  }
}
.hf-child-line {
  stroke-width: 1.5;
  stroke-dasharray: 320;
  stroke-dashoffset: 320;
  animation: hf-draw 0.48s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}
@keyframes hf-draw {
  to {
    stroke-dashoffset: 0;
  }
}
/* 入场前 / 暂停：循环动画不跑 */
.hf-compass-svg.is-paused .hf-ticks,
.hf-compass-svg.is-paused .hf-center-line {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .hf-compass-svg {
    opacity: 1;
    transition: none;
  }
  .hf-ticks,
  .hf-center-line {
    animation: none;
  }
}
</style>
