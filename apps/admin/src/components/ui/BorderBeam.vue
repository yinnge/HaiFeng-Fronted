<!-- BorderBeam - 流光边框效果组件 -->
<script setup lang="ts">
interface Props {
  /**
   * 光束大小 (px)
   */
  size?: number
  /**
   * 动画持续时间 (秒)
   */
  duration?: number
  /**
   * 边框宽度 (px)
   */
  borderWidth?: number
  /**
   * 锚点位置 (0-100)
   */
  anchor?: number
  /**
   * 光束颜色起始
   */
  colorFrom?: string
  /**
   * 光束颜色结束
   */
  colorTo?: string
  /**
   * 动画延迟 (秒)
   */
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  duration: 15,
  borderWidth: 1.5,
  anchor: 90,
  colorFrom: '#e8722a',
  colorTo: '#f5a54a',
  delay: 0,
})
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 rounded-[inherit]"
    :style="{
      '--size': `${props.size}px`,
      '--duration': props.duration,
      '--anchor': `${props.anchor}%`,
      '--border-width': `${props.borderWidth}px`,
      '--color-from': props.colorFrom,
      '--color-to': props.colorTo,
      '--delay': `-${props.delay}s`,
    }"
  >
    <div
      class="absolute inset-0 rounded-[inherit]"
      :style="{
        background: `linear-gradient(to right, transparent, var(--color-from), var(--color-to), transparent)`,
        mask: `
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0)
        `,
        maskComposite: 'exclude',
        padding: 'var(--border-width)',
      }"
    />
    <div
      class="border-beam absolute"
      :style="{
        offsetPath: `rect(0 auto auto 0 round var(--size))`,
        animation: `border-beam calc(var(--duration)*1s) infinite linear`,
        animationDelay: `var(--delay)`,
        background: `linear-gradient(to left, var(--color-from), var(--color-to), transparent)`,
        width: 'var(--size)',
        height: 'var(--border-width)',
        offsetAnchor: 'var(--anchor) 50%',
      }"
    />
  </div>
</template>

<style scoped>
.border-beam {
  offset-distance: 0%;
}

@keyframes border-beam {
  100% {
    offset-distance: 100%;
  }
}
</style>
