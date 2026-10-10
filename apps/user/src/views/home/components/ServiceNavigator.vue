<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { navItems } from '@/config/navigation'
import { pushNavItem } from '@/utils/navAnchor'

/**
 * 核心服务导航（改造版）：
 * - 10 张大卡（图标 + 名称 + 中文描述）组成跑马灯，JS rAF 驱动从右往左滚动
 * - hover 暂停；支持按住鼠标左右拖拽滑动（拖拽后抑制误触点击）
 * - 弹层：背景全透明（仅弹层本体 + 关闭按钮），动画时序：
 *   1) 空白弹层 → 左卡内容逐行显现（图标→标题→说明→提示，每行间隔 100ms）
 *   2) 卡片从中央平滑移到左侧（1s），到位后立即触发箭头（无额外等待）
 *   3) 金色思维导航线从卡片右缘中部延伸到每个目录块（同时出发、同时到达）
 *   4) 箭头到达瞬间，目录条目从左往右同速率显现（无上下错峰等待）
 * - 左右为两个独立圆角矩形 div；左卡内容仅弹层内居中（跑马灯内保持左对齐）
 */

interface DirItem {
  label: string
  route?: string
  expert?: boolean
}

interface SvcModule {
  id: string
  label: string
  route?: string
  icon: string
  desc: string
  subItems: DirItem[]
}

const emit = defineEmits<{ expert: [] }>()

const iconMap: Record<string, string> = {
  middle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`,
  high: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>`,
  gaokao: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" opacity=".6"/></svg>`,
  college: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 18v-8M10 18v-8M14 18v-8M18 18v-8"/><path d="M12 3L3 8h18z"/></svg>`,
  cet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>`,
  kaoyan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
  kaogong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="M9 14l2 2 4-4"/></svg>`,
  postgrad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/></svg>`,
  phd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>`,
  employment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
}

const descMap: Record<string, string> = {
  middle: '中考资讯与初一至初三同步学习资料',
  high: '高一至高三资料与练题系统',
  gaokao: 'AI 智能填报 · 志愿表 · 特殊通道一站直达',
  college: '大一到大四资料与大学 AI 规划系统',
  cet: '四级六级备考资料与考试资讯',
  kaoyan: '考研资料与考研系统，备考一步到位',
  kaogong: '考公资料与考公系统，上岸快人一步',
  postgrad: '研究生资料与申博指南',
  phd: '博一博二博三阶段资料与规划',
  employment: '体制内 · 基层 · 行业专项招聘信息',
}

// 与导航栏同源：排除「首页」，其余 10 个模块即核心服务（不再注入「进入栏目主页」）
const modules: SvcModule[] = navItems
  .filter(n => n.id !== 'home')
  .map(n => ({
    id: n.id,
    label: n.label,
    route: n.route,
    icon: iconMap[n.id] ?? iconMap.book,
    desc: descMap[n.id] ?? '',
    subItems: [
      ...(n.subItems ?? []).map(s => ({ label: s.label, route: s.route })),
      ...(n.id === 'gaokao' ? [{ label: '专家指导（一对一）', expert: true }] : []),
    ],
  }))

const router = useRouter()
const route = useRoute()

// ==================== 弹层分阶段动画 ====================
// intro：空白弹层 → 逐行显现（CSS delay 驱动）
// moved：内容完毕，卡片 1s 从中央移到左侧
// arrows：卡片到位立即触发——玻璃目录浮现 + 金色箭头同时延伸（450ms，同时到达）
// items：箭头到达瞬间，目录条目从左往右同速率显现（无错峰）
type Stage = 'intro' | 'moved' | 'arrows' | 'items'
const activeId = ref<string | null>(null)
const stage = ref<Stage>('intro')
const open = computed(() => activeId.value !== null)
const activeModule = computed(() => modules.find(m => m.id === activeId.value) ?? null)

const MOVED_AT = 800 // 最后一行提示 400ms 开始 + 0.4s 完成 ≈ 800ms
const ARROWS_AT = 1800 // 800 + 1000ms 位移（比上一版的 2s 快 2 倍），到位即触发
const ARROW_MS = 450 // 箭头延伸时长
let timers: number[] = []

function clearTimers() {
  timers.forEach(t => window.clearTimeout(t))
  timers = []
}

// ==================== 金色思维导航线（SVG 贝塞尔扇出） ====================
interface ArrowPath {
  d: string
  tx: number
  ty: number
  angle: number
}
const panelEl = ref<HTMLElement | null>(null)
const slotEl = ref<HTMLElement | null>(null)
const panelCardEl = ref<HTMLElement | null>(null)
const arrows = ref<ArrowPath[]>([])
const svgSize = ref({ w: 0, h: 0 })
const ARROW_HEAD = 'M -8 -5.5 L 1.5 0 L -8 5.5'

function buildArrows() {
  const panel = panelEl.value
  const card = panelCardEl.value
  if (!panel || !card || window.innerWidth <= 860) {
    arrows.value = []
    return
  }
  const pr = panel.getBoundingClientRect()
  // 起点：直接取左白卡（.svc-panel-card）此刻的真实右缘垂直中点。
  // 不能用槽位（.svc-slot）——面板 justify-content:center 会让槽位与卡片
  // 落点错开，箭头就会悬在半空。箭头阶段卡片位移已完成，坐标稳定。
  const cr = card.getBoundingClientRect()
  const ox = cr.right - pr.left
  const oy = cr.top + cr.height / 2 - pr.top
  const list: ArrowPath[] = []
  panel.querySelectorAll<HTMLElement>('.svc-dir-item').forEach(el => {
    const r = el.getBoundingClientRect()
    const tx = r.left - pr.left - 2
    const ty = r.top + r.height / 2 - pr.top
    const dx = tx - ox
    const bend = Math.max(26, dx * 0.42)
    const c1x = ox + bend
    const c1y = oy
    const c2x = tx - bend
    const c2y = ty
    const d = `M ${ox.toFixed(1)} ${oy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${tx.toFixed(1)} ${ty.toFixed(1)}`
    const angle = (Math.atan2(ty - c2y, tx - c2x) * 180) / Math.PI
    list.push({ d, tx, ty, angle })
  })
  svgSize.value = { w: Math.round(pr.width), h: Math.round(pr.height) }
  arrows.value = list
}

function openDetail(id: string) {
  if (suppressClick) return
  clearTimers()
  activeId.value = id
  stage.value = 'intro'
  arrows.value = []
  timers.push(window.setTimeout(() => { stage.value = 'moved' }, MOVED_AT))
  timers.push(window.setTimeout(() => {
    stage.value = 'arrows'
    void nextTick(() => requestAnimationFrame(buildArrows))
  }, ARROWS_AT))
  timers.push(window.setTimeout(() => { stage.value = 'items' }, ARROWS_AT + ARROW_MS))
}

function closeDetail() {
  clearTimers()
  activeId.value = null
  stage.value = 'intro'
  arrows.value = []
}

function go(item: DirItem) {
  if (item.expert) {
    emit('expert')
    return
  }
  if (!item.route) {
    ElMessage.info('该功能正在开发中')
    return
  }
  closeDetail()
  void pushNavItem(router, route.path, { label: item.label, route: item.route })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDetail()
}

watch(open, v => {
  if (v) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

// ==================== 跑马灯：rAF 驱动 + 拖拽 ====================
const SPEED = 45 // px/s 自动滚动速度
const marqueeEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const dragging = ref(false)
const hoverPaused = ref(false)
let pos = 0 // 已滚动像素（正数 = 向左）
let groupW = 0 // 单组卡片总宽（循环周期）
let raf = 0
let last = 0
let startX = 0
let startPos = 0
let dragMoved = false
let suppressClick = false
const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function normPos() {
  if (groupW <= 0) return
  pos = ((pos % groupW) + groupW) % groupW
}

function measure() {
  const t = trackEl.value
  if (!t) return
  const first = t.firstElementChild as HTMLElement | null
  groupW = first ? first.offsetWidth : 0
  normPos()
}

function frame(ts: number) {
  if (!last) last = ts
  const dt = Math.min((ts - last) / 1000, 0.05)
  last = ts
  if (!dragging.value && !hoverPaused.value && !open.value && !reducedMotion && groupW > 0) {
    pos += SPEED * dt
    normPos()
  }
  if (trackEl.value) trackEl.value.style.transform = `translateX(${-pos}px)`
  raf = requestAnimationFrame(frame)
}

function onDragStart(e: PointerEvent) {
  if (open.value) return
  dragging.value = true
  dragMoved = false
  startX = e.clientX
  startPos = pos
  // 注意：不能在 pointerdown 时立即 setPointerCapture —— capture 会把 click
  // 重定向到 marquee 容器，卡片的 @click 永远收不到（点击失效的根因）。
  // 只在 pointermove 超过阈值后才 capture。
}

function onDragMove(e: PointerEvent) {
  if (!dragging.value) return
  const dx = e.clientX - startX
  if (!dragMoved && Math.abs(dx) > 6) {
    dragMoved = true
    try { marqueeEl.value?.setPointerCapture(e.pointerId) } catch { /* ignore */ }
  }
  if (!dragMoved) return
  pos = startPos - dx // 向右拖 → 内容右移
  normPos()
}

function onDragEnd() {
  if (!dragging.value) return
  dragging.value = false
  if (dragMoved) {
    // 拖拽后短暂抑制 click，避免松手误触打开弹层
    suppressClick = true
    window.setTimeout(() => { suppressClick = false }, 80)
  }
}

function onResize() {
  measure()
  if (open.value && (stage.value === 'arrows' || stage.value === 'items')) buildArrows()
}

onMounted(() => {
  measure()
  raf = requestAnimationFrame(frame)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
  clearTimers()
})
</script>

<template>
  <div class="svc-navigator">
    <!-- 跑马灯：两组相同卡片循环滚动；hover 暂停；按住可左右拖拽 -->
    <div
      ref="marqueeEl"
      class="svc-marquee"
      :class="{ paused: open, dragging }"
      @pointerdown="onDragStart"
      @pointermove="onDragMove"
      @pointerup="onDragEnd"
      @pointercancel="onDragEnd"
      @mouseenter="hoverPaused = true"
      @mouseleave="hoverPaused = false"
    >
      <div ref="trackEl" class="svc-track">
        <div v-for="g in 2" :key="g" class="svc-track-group" :aria-hidden="g === 2">
          <button
            v-for="m in modules"
            :key="`${g}-${m.id}`"
            type="button"
            class="svc-card"
            @click="openDetail(m.id)"
          >
            <span class="svc-card-icon" v-html="m.icon"></span>
            <h3 class="svc-card-title">{{ m.label }}</h3>
            <p class="svc-card-desc">{{ m.desc }}</p>
            <span class="svc-card-more">
              查看目录
              <svg viewBox="0 0 20 20" fill="currentColor" class="svc-card-arrow">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 点击展开：背景全透明，仅弹层本体（左白卡 + 金色导航线 + 右玻璃目录） -->
    <Teleport to="body">
      <Transition name="svc-fade">
        <div v-if="open && activeModule" class="svc-backdrop" @click.self="closeDetail">
          <div
            ref="panelEl"
            class="svc-panel"
            :class="{
              'is-moved': stage !== 'intro',
              'is-arrows': stage === 'arrows' || stage === 'items',
              'is-items': stage === 'items',
            }"
            role="dialog"
            aria-modal="true"
          >
            <button type="button" class="svc-close" aria-label="关闭" @click="closeDetail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- 左侧占位（保留布局空间，卡片绝对定位动画；也是导航线起点锚） -->
            <div ref="slotEl" class="svc-slot" aria-hidden="true"></div>

            <!-- 左卡：先空白，逐行显现，再从中央移到左侧；内容居中 -->
            <div ref="panelCardEl" class="svc-panel-card">
              <span class="svc-panel-icon svc-line" v-html="activeModule.icon"></span>
              <h3 class="svc-panel-title svc-line">{{ activeModule.label }}</h3>
              <p class="svc-panel-desc svc-line">{{ activeModule.desc }}</p>
              <p class="svc-panel-hint svc-line">点击右侧目录直达对应功能</p>
            </div>

            <!-- 金色思维导航线：从卡片右缘中部扇出到每个目录块 -->
            <svg
              v-if="arrows.length"
              class="svc-arrows"
              :viewBox="`0 0 ${svgSize.w} ${svgSize.h}`"
              aria-hidden="true"
            >
              <path
                v-for="(a, i) in arrows"
                :key="`p${i}`"
                class="svc-arrow-path"
                pathLength="1"
                :d="a.d"
              />
              <path
                v-for="(a, i) in arrows"
                :key="`h${i}`"
                class="svc-arrow-head"
                :d="ARROW_HEAD"
                :transform="`translate(${a.tx} ${a.ty}) rotate(${a.angle})`"
              />
            </svg>

            <!-- 右侧玻璃目录：独立圆角矩形，高度随目录数量自适应 -->
            <div class="svc-dir" :class="{ 'is-empty': !activeModule.subItems.length }">
              <template v-if="activeModule.subItems.length">
                <button
                  v-for="item in activeModule.subItems"
                  :key="item.label"
                  type="button"
                  class="svc-dir-item"
                  @click="go(item)"
                >
                  <span class="svc-dir-dot"></span>
                  <span class="svc-dir-label">{{ item.label }}</span>
                  <svg class="svc-dir-arrow" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 4.707a1 1 0 011.414 0L13 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 10l-3.293-3.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </template>
              <p v-else class="svc-dir-empty">功能规划中，敬请期待</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============ 跑马灯（rAF 驱动 + 拖拽） ============ */
.svc-marquee {
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  padding: 0.75rem 0 1.25rem;
}

.svc-marquee.dragging {
  cursor: grabbing;
}

.svc-marquee.dragging .svc-card {
  transition: none;
}

.svc-track {
  display: flex;
  width: max-content;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
}

.svc-track-group {
  display: flex;
  gap: 1.25rem;
  padding-right: 1.25rem;
}

/* 卡片：上下各加高 10px（整体 +20px），图标文字靠上、查看目录靠下 */
.svc-card {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: calc(1.5rem + 10px) 1.35rem;
  border-radius: 16px;
  background: #ffffff;
  border: none;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.07);
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.svc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(249, 115, 22, 0.16);
}

.svc-card:active {
  transform: translateY(-3px) scale(0.99);
}

.svc-card-icon {
  width: 3.25rem;
  height: 3.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.08));
  color: #f97316;
  margin-bottom: 0.9rem;
}

.svc-card-icon :deep(svg) {
  width: 1.6rem;
  height: 1.6rem;
}

.svc-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
}

.svc-card-desc {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.56rem;
}

/* 查看目录下移：中间空白伸长 */
.svc-card-more {
  margin-top: calc(0.9rem + 10px);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8722a;
}

.svc-card-arrow {
  width: 0.8rem;
  height: 0.8rem;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.svc-card:hover .svc-card-arrow {
  transform: translateX(3px);
}

/* ============ 弹出面板（背景全透明） ============ */
.svc-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  /* 背景全透明：不遮页面，仅保留弹层本体与关闭按钮 */
  background: transparent;
}

.svc-panel {
  position: relative;
  width: min(880px, 94vw);
  min-height: 420px;
  max-height: 86vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  padding: 3rem;
  border-radius: 24px;
  /* 实心白底（不透明、不透视）：比右侧玻璃目录更亮，形成前后层次 */
  background: #ffffff;
  border: none;
  box-shadow: 0 30px 80px rgba(194, 65, 12, 0.18);
  overflow: hidden;
}

.svc-close {
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
  z-index: 3;
}

.svc-close:hover {
  color: #e8722a;
  background: rgba(249, 115, 22, 0.08);
}

.svc-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 左侧布局占位：卡片停靠槽位 + 导航线起点锚 */
.svc-slot {
  flex-shrink: 0;
  width: 280px;
  min-height: 300px;
}

/* 左卡：初始居中（绝对定位），.is-moved 后 1s 平滑移到左侧槽位；内容居中 */
.svc-panel-card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: calc(2.25rem + 10px) 1.75rem;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 18px 44px rgba(194, 65, 12, 0.14);
  transition: left 1s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1;
}

.svc-panel.is-moved .svc-panel-card {
  /* 3rem 面板内边距 + 140px 槽位半宽 = 槽位中心 */
  left: calc(3rem + 140px);
}

/* 逐行显现：空白背景 → 图标 → 标题 → 说明 → 提示，每行间隔 100ms */
.svc-line {
  opacity: 0;
  animation: svc-line-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.svc-panel-icon.svc-line {
  animation-delay: 0.1s;
}

.svc-panel-title.svc-line {
  animation-delay: 0.2s;
}

.svc-panel-desc.svc-line {
  animation-delay: 0.3s;
}

.svc-panel-hint.svc-line {
  animation-delay: 0.4s;
}

@keyframes svc-line-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.svc-panel-icon {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.08));
  color: #f97316;
  margin-bottom: 1.25rem;
}

.svc-panel-icon :deep(svg) {
  width: 2rem;
  height: 2rem;
}

.svc-panel-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
}

.svc-panel-desc {
  margin-top: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #6b7280;
}

.svc-panel-hint {
  margin-top: calc(1.25rem + 10px);
  font-size: 0.8rem;
  color: #9ca3af;
}

/* ============ 金色思维导航线 ============ */
.svc-arrows {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.svc-arrow-path {
  fill: none;
  stroke: #d4a85a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
}

/* 所有箭头同时出发、同时到达（统一时长 + pathLength 归一化） */
.svc-panel.is-arrows .svc-arrow-path {
  animation: svc-arrow-draw 0.45s cubic-bezier(0.45, 0, 0.55, 1) forwards;
}

@keyframes svc-arrow-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.svc-arrow-head {
  fill: none;
  stroke: #d4a85a;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
}

.svc-panel.is-arrows .svc-arrow-head {
  animation: svc-head-in 0.18s ease-out 0.45s forwards;
}

@keyframes svc-head-in {
  to {
    opacity: 1;
  }
}

/* 右侧玻璃目录：独立圆角矩形，半透明 + 模糊；高度随目录数量自适应 */
.svc-dir {
  flex-shrink: 0;
  width: 360px;
  max-height: calc(86vh - 4rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.75rem 1.5rem;
  border-radius: 20px;
  /* 略带冷灰的磨砂层：与左侧纯白面板形成前后层次 */
  background: rgba(244, 245, 247, 0.55);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6),
    inset 0 2px 10px rgba(120, 130, 140, 0.06);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* 箭头开始延伸时玻璃层同步浮现 */
.svc-panel.is-arrows .svc-dir {
  opacity: 1;
  pointer-events: auto;
}

/* 无目录：恒定尺寸，只显示文字 */
.svc-dir.is-empty {
  width: 320px;
  height: 200px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.svc-dir-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1.15rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  opacity: 0;
}

/* 箭头到达后：目录从左往右同速率显现（无上下错峰等待） */
.svc-panel.is-items .svc-dir-item {
  animation: svc-item-left 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes svc-item-left {
  from {
    opacity: 0;
    transform: translateX(-26px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.svc-dir-item:hover {
  background: #fff7ed;
  transform: translateX(4px);
}

.svc-dir-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  flex-shrink: 0;
}

.svc-dir-label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.svc-dir-item:hover .svc-dir-label {
  color: #e8722a;
}

.svc-dir-arrow {
  width: 0.9rem;
  height: 0.9rem;
  color: #d1d5db;
  transition: all 0.25s ease;
}

.svc-dir-item:hover .svc-dir-arrow {
  color: #e8722a;
  transform: translateX(2px);
}

.svc-dir-empty {
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.8;
  color: #9ca3af;
}

/* 弹层过渡 */
.svc-fade-enter-active,
.svc-fade-leave-active {
  transition: opacity 0.25s ease;
}

.svc-fade-enter-from,
.svc-fade-leave-to {
  opacity: 0;
}

/* ============ 响应式 ============ */
@media (max-width: 860px) {
  .svc-panel {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2.5rem 1.5rem 2rem;
    overflow-y: auto;
  }

  .svc-slot {
    display: none;
  }

  /* 小屏取消绝对定位动画与导航线，卡片自然置顶 */
  .svc-panel-card {
    position: static;
    transform: none;
    width: 100%;
    transition: none;
  }

  .svc-panel.is-moved .svc-panel-card {
    left: auto;
  }

  .svc-arrows {
    display: none;
  }

  /* 小屏：玻璃层出现时目录直接显现 */
  .svc-panel.is-arrows .svc-dir-item {
    animation: svc-item-left 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .svc-dir {
    width: 100%;
  }

  .svc-dir.is-empty {
    width: 100%;
  }

  .svc-card {
    width: 200px;
  }
}

/* 减弱动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .svc-line,
  .svc-panel.is-arrows .svc-arrow-path,
  .svc-panel.is-arrows .svc-arrow-head,
  .svc-panel.is-items .svc-dir-item {
    animation-duration: 0.01s;
    animation-delay: 0s;
  }

  .svc-panel-card {
    transition: none;
  }

  .svc-dir {
    transition: none;
  }

  .svc-card,
  .svc-dir-item {
    transition: none;
  }
}
</style>
