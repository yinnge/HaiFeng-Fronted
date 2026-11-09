<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronLeft } from 'lucide-vue-next'
import {
  HERO_MODULES,
  HERO_COLUMNS,
  HERO_LOGO,
  COMPASS_SIZE,
  COMPASS_CHILD_POSITIONS,
  type HeroModule,
  type ColumnKey,
} from './hero.config'
import { requestColumnFocus } from '@/composables/useColumnFocus'
import { useLoopPausable } from '@/composables/useLoopPausable'
import {
  moduleStyle,
  centerStyle,
  moduleAria,
  tabIndexFor,
  type CompassCtx,
} from './compass-geometry'
import HfCompassDecor from './HfCompassDecor.vue'
import HfCompassNode from './HfCompassNode.vue'
import HfCompassChild from './HfCompassChild.vue'

const modules = HERO_MODULES

/* ---------------- 展开状态机 ---------------- */
const activeKey = ref<string | null>(null)
const pinned = ref(false)
const hoverKey = ref<string | null>(null)
let hoverTimer: ReturnType<typeof setTimeout> | null = null
let leaveTimer: ReturnType<typeof setTimeout> | null = null

const expanded = computed(() => activeKey.value !== null)
const expandedModule = computed(() => modules.find((m) => m.key === activeKey.value) ?? null)

function collapse() {
  activeKey.value = null
  pinned.value = false
}
function onModuleEnter(m: HeroModule) {
  if (m.type !== 'multi' || pinned.value) return
  if (hoverTimer) clearTimeout(hoverTimer)
  hoverTimer = setTimeout(() => {
    activeKey.value = m.key
  }, 150)
}
function onModuleLeave() {
  if (hoverTimer) clearTimeout(hoverTimer)
}
function onContainerEnter() {
  if (leaveTimer) clearTimeout(leaveTimer)
}
function onContainerLeave() {
  if (pinned.value) return
  if (leaveTimer) clearTimeout(leaveTimer)
  leaveTimer = setTimeout(collapse, 250)
}
function onContainerClick(e: MouseEvent) {
  if (expanded.value && e.target === e.currentTarget) collapse()
}
function onModuleClick(m: HeroModule) {
  if (m.type === 'single') {
    requestColumnFocus(m.columns[0] as ColumnKey, m.color.solid)
    return
  }
  if (activeKey.value === m.key && pinned.value) collapse()
  else {
    if (hoverTimer) clearTimeout(hoverTimer)
    activeKey.value = m.key
    pinned.value = true
  }
}
function onChildClick(key: ColumnKey, color: string) {
  requestColumnFocus(key, color)
}
function onBack() {
  collapse()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && expanded.value) {
    e.preventDefault()
    collapse()
  }
}
function setHover(m: HeroModule, on: boolean) {
  hoverKey.value = on ? m.key : null
}

/* ---------------- 子节点（展开态） ---------------- */
const activeChildren = computed(() => {
  const mod = expandedModule.value
  if (!mod) return []
  const positions = mod.columns.length === 2 ? COMPASS_CHILD_POSITIONS.two : COMPASS_CHILD_POSITIONS.three
  return mod.columns.map((key, i) => ({
    column: HERO_COLUMNS[key as ColumnKey],
    pos: positions[i],
  }))
})

/* ---------------- 几何样式（含入场因子） ---------------- */
const compassCtx = computed<CompassCtx>(() => ({
  expanded: expanded.value,
  activeKey: activeKey.value,
  entered: entered.value,
  pinned: pinned.value,
}))

/* ---------------- 入场 + 循环暂停 ---------------- */
const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const entered = ref(reduce)
const rootRef = ref<HTMLElement | null>(null)
const { paused } = useLoopPausable(() => rootRef.value)
const playing = computed(() => entered.value && !paused.value)

/* ---------------- 响应式缩放（1024~1279） ---------------- */
const stageRef = ref<HTMLElement | null>(null)
const scale = ref(1)
/* ⚠️ 稳态绝不写 transform：即便 scale(1) 也是一条变换节点，整个舞台
   （6 个模块节点 + 子节点 + 返回按钮 + 提示，全都是文字）会被提升为合成层，
   Windows/Chrome 下丢失 LCD 子像素抗锯齿 → 文字发毛。
   只有容器窄于 560px 设计坐标系（1024~1279 双栏）才真正做等比缩放。 */
const stageTransform = computed(() => (scale.value >= 1 ? 'none' : `scale(${scale.value})`))
let ro: ResizeObserver | null = null
function measure() {
  if (!rootRef.value || !stageRef.value) return
  const w = rootRef.value.clientWidth
  const next = Math.min(1, w / COMPASS_SIZE.w)
  scale.value = next
  stageRef.value.style.height = `${COMPASS_SIZE.h * next}px`
}

onMounted(() => {
  measure()
  if (rootRef.value && 'ResizeObserver' in window) {
    ro = new ResizeObserver(measure)
    ro.observe(rootRef.value)
  }
  window.addEventListener('keydown', onKeydown)
  if (!reduce) requestAnimationFrame(() => (entered.value = true))
})
onBeforeUnmount(() => {
  ro?.disconnect()
  window.removeEventListener('keydown', onKeydown)
  if (hoverTimer) clearTimeout(hoverTimer)
  if (leaveTimer) clearTimeout(leaveTimer)
})
</script>

<template>
  <div
    ref="rootRef"
    class="hf-compass"
    role="group"
    aria-label="按需求快速定位专栏"
    @mouseenter="onContainerEnter"
    @mouseleave="onContainerLeave"
    @click="onContainerClick"
  >
    <div
      ref="stageRef"
      class="hf-compass-stage"
      :style="{
        width: COMPASS_SIZE.w + 'px',
        height: COMPASS_SIZE.h + 'px',
        transform: stageTransform,
      }"
    >
      <HfCompassDecor
        :modules="modules"
        :expanded="expanded"
        :hover-key="hoverKey"
        :expanded-module="expandedModule"
        :active-children="activeChildren"
        :entered="entered"
        :playing="playing"
      />

      <!-- 中心圆盘 -->
      <button type="button" class="hf-center" :style="centerStyle(compassCtx)" aria-hidden="true" tabindex="-1">
        <img :src="HERO_LOGO" alt="" class="hf-center-logo" />
      </button>

      <!-- 返回按钮（展开态，Tab 序最前） -->
      <button v-if="expanded" type="button" class="hf-back" @click.stop="onBack">
        <ChevronLeft :size="16" :stroke-width="2" />
        <span>全部模块</span>
      </button>

      <!-- 模块节点 -->
      <HfCompassNode
        v-for="(m, i) in modules"
        :key="m.key"
        :module="m"
        :style-obj="moduleStyle(m, i, compassCtx)"
        :is-active="activeKey === m.key"
        :label="moduleAria(m, compassCtx)"
        :tab-index="tabIndexFor(m, compassCtx)"
        @enter="onModuleEnter(m); setHover(m, true)"
        @leave="onModuleLeave(); setHover(m, false)"
        @click="onModuleClick(m)"
      />

      <!-- 子节点（展开态） -->
      <HfCompassChild
        v-for="(c, i) in activeChildren"
        v-if="expanded && expandedModule?.type === 'multi'"
        :key="'ch-' + c.column.key"
        :column="c.column"
        :pos="c.pos"
        :color="expandedModule!.color"
        :index="i"
        @click="onChildClick(c.column.key as ColumnKey, expandedModule!.color.solid)"
      />

      <div v-if="expanded" class="hf-hint">点击专栏，直达下方对应位置</div>
    </div>
  </div>
</template>

<style scoped>
.hf-compass {
  width: 100%;
  display: flex;
  justify-content: center;
}
.hf-compass-stage {
  position: relative;
  transform-origin: top center;
  flex-shrink: 0;
}

/* 中心圆盘 */
.hf-center {
  position: absolute;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 8px 24px -4px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  z-index: 2;
  cursor: default;
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.hf-center-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.hf-center-text {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

/* 返回按钮 + 提示 */
.hf-back {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: color 0.2s ease;
}
.hf-back:hover {
  color: #ea580c;
}
.hf-hint {
  position: absolute;
  bottom: -2px;
  /* 纯文字提示用 left/right + text-align 居中，
     避免常驻 translateX(-50%) 把这段 12px 文字送进合成层 */
  left: 0;
  right: 0;
  text-align: center;
  z-index: 5;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .hf-center {
    transition: opacity 0.2s ease;
  }
}
</style>
