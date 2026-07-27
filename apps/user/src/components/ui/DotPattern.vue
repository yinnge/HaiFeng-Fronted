<!-- DotPattern - 点阵图案背景组件 -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  dotSize?: number
  spacing?: number
  color?: string
  animated?: boolean
  fadeDirection?: 'none' | 'bottom' | 'right' | 'bottom-right' | 'radial'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  dotSize: 1.5,
  spacing: 20,
  color: 'rgba(232, 114, 42, 0.4)',
  animated: true,
  fadeDirection: 'bottom-right',
})

const patternId = computed(() => `dot-pattern-${Math.random().toString(36).slice(2, 9)}`)

const maskStyle = computed(() => {
  switch (props.fadeDirection) {
    case 'bottom':
      return 'linear-gradient(to bottom, white, transparent)'
    case 'right':
      return 'linear-gradient(to right, white, transparent)'
    case 'bottom-right':
      return 'linear-gradient(to bottom right, white 20%, transparent 80%)'
    case 'radial':
      return 'radial-gradient(circle at center, white, transparent 70%)'
    default:
      return 'none'
  }
})
</script>

<template>
  <div
    class="absolute inset-0 pointer-events-none overflow-hidden"
    :class="[props.class, { 'animate-pulse-glow': props.animated }]"
    :style="{
      mask: maskStyle,
      WebkitMask: maskStyle,
    }"
  >
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          :id="patternId"
          :width="props.spacing"
          :height="props.spacing"
          patternUnits="userSpaceOnUse"
        >
          <circle
            :cx="props.spacing / 2"
            :cy="props.spacing / 2"
            :r="props.dotSize"
            :fill="props.color"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="`url(#${patternId})`" />
    </svg>
  </div>
</template>

<style scoped>
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}
</style>
