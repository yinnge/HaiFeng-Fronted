<script setup lang="ts">
import { ArrowDown } from 'lucide-vue-next'
import type { HeroColumn, ModuleColor } from './hero.config'

defineProps<{
  column: HeroColumn
  pos: { x: number; y: number }
  color: ModuleColor
  index: number
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="hf-child"
      :style="{
        left: pos.x + 'px',
        top: pos.y + 'px',
        '--pop-delay': index * 60 + 'ms',
      }"
    :aria-label="column.title + '，按回车定位到下方专栏'"
    @click="$emit('click')"
  >
    <span class="hf-child-inner">
      <span class="hf-child-icon" :style="{ background: color.bg }" v-html="column.icon"></span>
      <span class="hf-child-body">
        <span class="hf-child-title">{{ column.title }}</span>
        <span class="hf-child-sub" :title="column.subtitle">{{ column.subtitle }}</span>
      </span>
      <span class="hf-child-arrow"><ArrowDown :size="14" :stroke-width="2" /></span>
    </span>
  </button>
</template>

<style scoped>
.hf-child {
  position: absolute;
  z-index: 4;
  /* 负 margin 代替 translate(-50%,-50%) 做中心对齐，消除常驻变换节点 */
  margin-left: -80px; /* 160 / 2 */
  margin-top: -30px; /* 60 / 2 */
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  /* 入场只淡入；弹跳 scale 放到纯装饰背景层 ::before 上 */
  animation: hf-pop 0.4s cubic-bezier(0.32, 0.72, 0, 1) both;
  animation-delay: var(--pop-delay, 0ms);
}
@keyframes hf-pop {
  from { opacity: 0; }
  to { opacity: 1; }
}
.hf-child-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  width: 160px;
  height: 60px;
  padding: 0 11px;
  border-radius: 16px;
  /* 背景/边框/阴影下沉到伪元素，标题与副标题文字零 transform */
}
.hf-child-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 8px 24px -4px rgba(15, 23, 42, 0.08);
  /* backwards：delay 期间保持 0.6，动画结束回到普通样式（无 transform），
     避免 animation fill 锁死 hover 位移 */
  animation: hf-pop-bg 0.4s cubic-bezier(0.32, 0.72, 0, 1) backwards;
  animation-delay: var(--pop-delay, 0ms);
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  pointer-events: none;
}
@keyframes hf-pop-bg {
  from { transform: scale(0.6); }
  to { transform: scale(1); }
}
.hf-child-icon,
.hf-child-body,
.hf-child-arrow {
  position: relative;
  z-index: 1;
}
.hf-child-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 11px;
}
.hf-child-icon :deep(svg) {
  width: 20px;
  height: 20px;
}
.hf-child-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.hf-child-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  text-align: left;
}
.hf-child-sub {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hf-child-arrow {
  flex-shrink: 0;
  color: #334155;
}
.hf-child:hover .hf-child-inner::before {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
}
.hf-child:focus-visible {
  outline: none;
}
.hf-child:focus-visible .hf-child-inner::before {
  border-color: rgba(249, 115, 22, 0.5);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.18);
}

@media (prefers-reduced-motion: reduce) {
  .hf-child {
    animation: none;
    opacity: 1;
  }
  .hf-child-inner::before {
    animation: none;
  }
}
</style>
