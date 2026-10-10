<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import TreasureBox from './TreasureBox.vue'

/**
 * 悬浮百宝箱：
 * - 固定悬浮在页面右侧墙壁（图片 img.png），可按住拖动，松手后 x 吸附到左/右墙、y 保留
 * - 点击（未拖动）弹出弹框：标题「高考百宝箱」+ 副标题 + 百宝箱 4 卡网格（目录在标题下方，单 div）
 * - 弹框入场动画：面板浮现 → 标题 → 副标题 → 卡片网格，逐层级联（与核心服务导航节奏一致）
 */

const WIDGET = 76
const open = ref(false)
const boxEl = ref<HTMLElement | null>(null)
const posX = ref(0)
const posY = ref(0)
const dragging = ref(false)
const snapping = ref(false)
let startX = 0
let startY = 0
let origX = 0
let origY = 0
let dragMoved = false
let suppressClick = false

function widgetW() {
  return boxEl.value?.offsetWidth ?? WIDGET
}

function widgetH() {
  return boxEl.value?.offsetHeight ?? WIDGET
}

function clampY(y: number) {
  return Math.min(Math.max(y, 8), window.innerHeight - widgetH() - 8)
}

function snapX(x: number) {
  return x + widgetW() / 2 < window.innerWidth / 2 ? 0 : window.innerWidth - widgetW()
}

function place() {
  posX.value = window.innerWidth - widgetW()
  posY.value = clampY(window.innerHeight * 0.38)
}

function onResize() {
  posX.value = snapX(posX.value)
  posY.value = clampY(posY.value)
}

function onDown(e: PointerEvent) {
  if (open.value) return
  dragging.value = true
  dragMoved = false
  startX = e.clientX
  startY = e.clientY
  origX = posX.value
  origY = posY.value
}

function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (!dragMoved && Math.hypot(dx, dy) > 6) {
    dragMoved = true
    try { boxEl.value?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  if (!dragMoved) return
  snapping.value = false
  posX.value = Math.min(Math.max(origX + dx, 0), window.innerWidth - widgetW())
  posY.value = clampY(origY + dy)
}

function onUp() {
  if (!dragging.value) return
  dragging.value = false
  if (dragMoved) {
    // 松手吸附到最近的墙
    snapping.value = true
    posX.value = snapX(posX.value)
    posY.value = clampY(posY.value)
    suppressClick = true
    window.setTimeout(() => { suppressClick = false }, 80)
  } else if (!suppressClick) {
    open.value = true
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

watch(open, v => {
  if (v) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onMounted(() => {
  place()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <!-- 悬浮窗：贴左右墙壁，可拖动 -->
  <div
    ref="boxEl"
    class="ft-widget"
    :class="{ dragging, snap: snapping }"
    :style="{ left: `${posX}px`, top: `${posY}px` }"
    role="button"
    aria-label="高考百宝箱"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <img src="/img.png" alt="高考百宝箱" draggable="false" />
  </div>

  <!-- 弹框：标题 + 目录网格（单 div，目录在标题下方） -->
  <Teleport to="body">
    <Transition name="ft-fade">
      <div v-if="open" class="ft-backdrop" @click.self="open = false">
        <div class="ft-modal" role="dialog" aria-modal="true">
          <button type="button" class="ft-close" aria-label="关闭" @click="open = false">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <h3 class="ft-title ft-anim" style="--d: 0.15s">高考百宝箱</h3>
          <p class="ft-sub ft-anim" style="--d: 0.25s">院校 · 专业 · 城市 · 企业行业 · 竞赛证书，一箱搞定</p>

          <div class="ft-body ft-anim" style="--d: 0.35s">
            <TreasureBox />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============ 悬浮窗 ============ */
.ft-widget {
  position: fixed;
  z-index: 150;
  width: 76px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 18px;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.3s ease;
}

.ft-widget.snap {
  transition: left 0.3s cubic-bezier(0.32, 0.72, 0, 1), top 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.ft-widget.dragging {
  cursor: grabbing;
  transition: none;
}

.ft-widget:hover {
  transform: scale(1.07);
  box-shadow: 0 12px 30px rgba(194, 65, 12, 0.25);
}

.ft-widget img {
  display: block;
  width: 100%;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.16);
  pointer-events: none;
}

/* ============ 弹框 ============ */
.ft-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(31, 26, 20, 0.45);
  backdrop-filter: blur(4px);
}

.ft-modal {
  position: relative;
  width: min(900px, 94vw);
  max-height: 86vh;
  overflow-y: auto;
  padding: 2.5rem 2.5rem 2.25rem;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(194, 65, 12, 0.2);
  animation: ft-panel-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes ft-panel-in {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.ft-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.ft-close:hover {
  color: #e8722a;
  background: rgba(249, 115, 22, 0.08);
}

.ft-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 逐层级联：标题 → 副标题 → 目录网格 */
.ft-anim {
  opacity: 0;
  animation: ft-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: var(--d, 0s);
}

@keyframes ft-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.ft-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1f2937;
  text-align: center;
}

.ft-sub {
  margin-top: 0.5rem;
  font-size: 0.88rem;
  color: #9ca3af;
  text-align: center;
}

.ft-body {
  margin-top: 1.75rem;
}

/* 弹层过渡 */
.ft-fade-enter-active,
.ft-fade-leave-active {
  transition: opacity 0.25s ease;
}

.ft-fade-enter-from,
.ft-fade-leave-to {
  opacity: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 640px) {
  .ft-widget {
    width: 60px;
  }

  .ft-modal {
    padding: 2rem 1.25rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ft-widget,
  .ft-widget.snap {
    transition: none;
  }

  .ft-modal,
  .ft-anim {
    animation-duration: 0.01s;
    animation-delay: 0s;
  }
}
</style>
