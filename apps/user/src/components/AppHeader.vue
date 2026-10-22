<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MobileNavDrawer from './MobileNavDrawer.vue'
import UserAvatar from './UserAvatar.vue'
import NotificationBell from './NotificationBell.vue'
import { navItems, moreNavItems, type NavItem, type NavSubItem } from '@/config/navigation'
import { pushNavItem } from '@/utils/navAnchor'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

const router = useRouter()
const route = useRoute()

// 顶部新导航（TopToolBar）下方偏移：首页 64px 紧贴其下，其余页面顶到 0
const props = defineProps<{ topOffset?: number }>()
const headerTop = computed(() => props.topOffset ?? 0)

// 首页由新导航 TopToolBar 承载 账号/消息；旧导航仅在非首页展示，避免同屏重复
const isHome = computed(() => route.path === '/')

// 导航栏滚动收起：所有页面滚动离开顶部后抽屉式收起（主页也收起，与新导航错层）
const { hidden: headerHidden } = useAutoHideHeader()

const openDropdownId = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null
const mobileMenuOpen = ref(false)

function openDropdown(id: string) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  openDropdownId.value = id
}

function scheduleClose() {
  closeTimer = setTimeout(() => {
    openDropdownId.value = null
  }, 150)
}

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})

function handleNavClick(item: NavItem) {
  if (item.route) {
    router.push(item.route)
  } else if (item.subItems) {
    // 有子项但无顶层路由：点击展开/收起下拉，而非提示“开发中”
    if (openDropdownId.value === item.id) {
      openDropdownId.value = null
    } else {
      openDropdown(item.id)
    }
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

function handleSubClick(sub: NavSubItem) {
  openDropdownId.value = null
  if (sub.route) {
    // 兼容 /path#anchor 锚点路由（如「直通院校」→ /gaokao#exams）
    void pushNavItem(router, route.path, sub)
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

/** 把 route 字符串拆成 { path, query }（忽略 #hash），用于「path + query 条件」激活判定 */
function parseRoute(target: string): { path: string; query: Record<string, string> } {
  const hashIdx = target.indexOf('#')
  const clean = hashIdx === -1 ? target : target.slice(0, hashIdx)
  const qIdx = clean.indexOf('?')
  if (qIdx === -1) return { path: clean, query: {} }
  const path = clean.slice(0, qIdx)
  const query: Record<string, string> = {}
  for (const pair of clean.slice(qIdx + 1).split('&')) {
    if (!pair) continue
    const eq = pair.indexOf('=')
    if (eq === -1) {
      query[decodeURIComponent(pair)] = ''
    } else {
      query[decodeURIComponent(pair.slice(0, eq))] = decodeURIComponent(pair.slice(eq + 1))
    }
  }
  return { path, query }
}

/** 当前路由 query 是否全部命中 expected 中的 key=value（空对象恒为 true） */
function queryMatches(expected: Record<string, string>): boolean {
  return Object.entries(expected).every(([k, v]) => route.query[k] === v)
}

function isActive(item: NavItem): boolean {
  if (!item.route) return false
  const { path, query } = parseRoute(item.route)
  if (path === '/') {
    if (route.path !== '/') return false
  } else if (!(route.path === path || route.path.startsWith(path + '/'))) {
    return false
  }
  // 路由自带的 query 条件（如 /gaokao?mod=high 要求 mod=high 命中才激活）
  if (!queryMatches(query)) return false
  // 显式排除条件（如 高考志愿填报 在 mod=high 时不激活）
  if (item.inactiveQuery) {
    for (const [k, v] of Object.entries(item.inactiveQuery)) {
      if (route.query[k] === v) return false
    }
  }
  return true
}

function toggleMore() {
  if (openDropdownId.value === 'more') {
    openDropdownId.value = null
  } else {
    openDropdown('more')
  }
}

/* ---------------- 「更多」面板内三级 flyout（就业信息专栏） ---------------- */
const expandedOverflowId = ref<string | null>(null)

function toggleOverflowExpand(id: string) {
  expandedOverflowId.value = expandedOverflowId.value === id ? null : id
}

watch(openDropdownId, (val) => {
  if (!val) expandedOverflowId.value = null
})

/* ---------------- 动态溢出折叠（更多菜单） ---------------- */
const navContainerRef = ref<HTMLElement | null>(null)
const itemRefs: Record<string, HTMLElement> = {}
const overflowCount = ref(0)
const MORE_RESERVE = 84
// 大屏阈值：≥1700 始终完整导航（覆盖 24 寸 / 1920），<1700 动态折叠。
const ENABLE_OVERFLOW_WIDTH = 1700

const visibleItems = computed<NavItem[]>(() =>
  overflowCount.value > 0
    ? navItems.slice(0, navItems.length - overflowCount.value)
    : navItems,
)
const overflowItems = computed<NavItem[]>(() =>
  overflowCount.value > 0 ? navItems.slice(navItems.length - overflowCount.value) : [],
)
// 「更多」面板 = 固定项（英语四六级 / 规划工具）+ 放不下的溢出项（保持导航顺序）
const morePanelItems = computed<NavItem[]>(() => [...moreNavItems, ...overflowItems.value])

function setItemRef(el: unknown, id: string) {
  if (el) itemRefs[id] = el as HTMLElement
}

async function measure() {
  const container = navContainerRef.value
  if (!container) return
  if (window.innerWidth >= ENABLE_OVERFLOW_WIDTH) {
    overflowCount.value = 0
    return
  }
  if (getComputedStyle(container).display === 'none') {
    overflowCount.value = 0
    return
  }
  overflowCount.value = 0
  await nextTick()

  const ids = navItems.map((i) => i.id)
  const n = ids.length
  if (!n) return

  const cs = getComputedStyle(container)
  const gap = parseFloat(cs.columnGap || cs.gap || '4') || 4
  // 更多按钮常驻，无论是否溢出都预留其宽度
  const moreW = MORE_RESERVE + gap
  const avail = container.clientWidth

  let fit = n
  for (let k = n; k >= 1; k--) {
    let total = 0
    for (let i = 0; i < k; i++) {
      total += (itemRefs[ids[i]]?.offsetWidth ?? 0) + (i > 0 ? gap : 0)
    }
    if (total + moreW <= avail) {
      fit = k
      break
    }
  }
  const next = fit < n ? n - fit : 0
  if (next !== overflowCount.value) overflowCount.value = next
}

let rafId = 0
function scheduleMeasure() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    void measure()
  })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  scheduleMeasure()
  if (navContainerRef.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(navContainerRef.value)
  }
  window.addEventListener('resize', scheduleMeasure)
  window.addEventListener('orientationchange', scheduleMeasure)
  if (document.fonts?.ready) document.fonts.ready.then(scheduleMeasure)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', scheduleMeasure)
  window.removeEventListener('orientationchange', scheduleMeasure)
})
</script>

<template>
  <header class="app-header" :class="{ 'is-hidden': headerHidden }" :style="{ top: headerTop + 'px' }">
    <div class="app-header-inner">
      <!-- 中间：桌面导航 -->
      <nav class="desktop-nav" ref="navContainerRef">
        <template v-for="item in visibleItems" :key="item.id">
          <!-- 无子项：直接按钮 -->
          <button
            v-if="!item.subItems"
            :ref="(el) => setItemRef(el, item.id)"
            class="nav-link"
            :class="{ active: isActive(item), 'nav-link-home': item.id === 'home' }"
            @click="handleNavClick(item)"
          >
            {{ item.label }}
            <svg v-if="item.id !== 'home'" class="nav-arrow nav-arrow-placeholder" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <!-- 有子项：hover 纵向下拉 -->
          <div
            v-else
            :ref="(el) => setItemRef(el, item.id)"
            class="nav-dropdown-wrapper"
            @mouseenter="openDropdown(item.id)"
            @mouseleave="scheduleClose"
          >
            <button
              class="nav-link nav-link-with-arrow"
              :class="{ active: isActive(item) }"
              @click="handleNavClick(item)"
            >
              {{ item.label }}
              <svg class="nav-arrow" :class="{ rotated: openDropdownId === item.id }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <Transition name="dropdown">
              <div v-if="openDropdownId === item.id" class="dropdown-panel">
                <button
                  v-for="sub in item.subItems"
                  :key="sub.label"
                  class="dropdown-item"
                  @click="handleSubClick(sub)"
                >
                  {{ sub.label }}
                </button>
              </div>
            </Transition>
          </div>
        </template>

        <!-- 更多：仅当存在「固定收纳项 + 溢出项」时才显示，避免空菜单 -->
        <div
          v-if="morePanelItems.length > 0"
          class="nav-dropdown-wrapper more-wrapper"
          @mouseenter="openDropdown('more')"
          @mouseleave="scheduleClose"
        >
          <button
            class="nav-link more-btn"
            :class="{ active: openDropdownId === 'more' }"
            @click="toggleMore"
          >
            更多
            <svg class="nav-arrow" :class="{ rotated: openDropdownId === 'more' }" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>

          <Transition name="dropdown">
            <div v-if="openDropdownId === 'more'" class="dropdown-panel more-panel">
              <template v-for="item in morePanelItems" :key="item.id">
                <!-- 就业信息专栏：右侧飞入三级面板 -->
                <template v-if="item.id === 'employment' && item.subItems">
                  <div class="flyout-trigger-wrapper">
                    <button
                      class="dropdown-item flyout-trigger-btn"
                      @click="toggleOverflowExpand(item.id)"
                    >
                      <span>{{ item.label }}</span>
                      <svg class="flyout-arrow" :class="{ rotated: expandedOverflowId === item.id }" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 4.707a1 1 0 011.414 0L13 8.586l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 10l-3.293-3.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <Transition name="flyout-slide">
                      <div v-if="expandedOverflowId === item.id" class="flyout-panel">
                        <button
                          v-for="sub in item.subItems"
                          :key="sub.label"
                          class="dropdown-item"
                          @click="handleSubClick(sub)"
                        >
                          {{ sub.label }}
                        </button>
                      </div>
                    </Transition>
                  </div>
                </template>

                <!-- 其他有子项：分组标题 + 列表 -->
                <template v-else-if="item.subItems">
                  <div class="overflow-group-label">{{ item.label }}</div>
                  <button
                    v-for="sub in item.subItems"
                    :key="sub.label"
                    class="dropdown-item"
                    @click="handleSubClick(sub)"
                  >
                    {{ sub.label }}
                  </button>
                </template>

                <!-- 无子项 -->
                <button v-else class="dropdown-item" @click="handleNavClick(item)">
                  {{ item.label }}
                </button>
              </template>
            </div>
          </Transition>
        </div>
      </nav>

      <!-- 右侧：操作区（消息+账号仅非首页显示；首页由 TopToolBar 展示） -->
      <div class="header-actions">
        <template v-if="!isHome">
          <NotificationBell />
          <UserAvatar />
        </template>
        <button class="hamburger-btn" @click="mobileMenuOpen = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <MobileNavDrawer v-model:open="mobileMenuOpen" />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--neutral-border);
  transition: transform 0.3s ease;
  will-change: transform;
}

/* 滚动收起（抽屉式上滑）：仅非主页页面滚动离开顶部后触发 */
.app-header.is-hidden {
  transform: translateY(-100%);
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 2200px;
  margin: 0 auto;
  padding: 0.75rem 0.75rem 0.75rem 1.25rem;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .app-header-inner {
    padding: 0.75rem 1rem 0.75rem 1.5rem;
  }
}

@media (min-width: 1280px) {
  .app-header-inner {
    padding: 0.75rem 1.5rem 0.75rem 2rem;
  }
}

/* Desktop nav */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  justify-content: space-between;
  min-width: 0;
}

@media (min-width: 768px) {
  .desktop-nav {
    display: flex;
  }
}

/* Nav links */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding: clamp(0.375rem, 0.3rem + 0.2vw, 0.5rem) clamp(0.5rem, 0.4rem + 0.2vw, 0.625rem);
  font-size: clamp(0.875rem, 0.75rem + 0.35vw, 1.125rem);
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.nav-link:hover {
  color: var(--brand-orange-dark);
}

.nav-link.active {
  color: var(--brand-orange-dark);
  border-bottom-color: var(--brand-orange);
}

.nav-arrow {
  width: 0.75rem;
  height: 0.75rem;
  color: currentColor;
  transition: transform 0.2s ease;
}

.nav-arrow.rotated {
  transform: rotate(180deg);
}

.nav-arrow-placeholder {
  visibility: hidden;
}

/* Dropdown */
.nav-dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

/* 首页链接：与其他导航一致，仅保留激活态橙色下划线 */
.nav-link-home {
  color: #1f2937;
  background: transparent;
  border-radius: 0;
  padding: clamp(0.375rem, 0.3rem + 0.2vw, 0.5rem) clamp(0.5rem, 0.4rem + 0.2vw, 0.625rem);
  text-shadow: none;
  box-shadow: none;
}

.nav-link-home:hover {
  background: transparent;
  box-shadow: none;
}

.nav-link-home.active {
  color: var(--brand-orange-dark);
  background: transparent;
  border-bottom-color: var(--brand-orange);
  box-shadow: none;
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--neutral-border-strong);
  box-shadow: 0 8px 24px var(--neutral-shadow-hover);
  padding: 0.375rem 0;
  z-index: 100;
  margin-top: 4px;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  text-align: center;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: var(--neutral-bg);
  color: var(--brand-orange-dark);
}

/* 更多面板里的分组标题 */
.overflow-group-label {
  padding: 0.375rem 1rem 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  border-top: 1px solid var(--neutral-border);
}

.overflow-group-label:first-child {
  border-top: none;
}

/* 更多 → 就业信息专栏：右侧飞入三级面板 */
.flyout-trigger-wrapper {
  position: relative;
}

.flyout-trigger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.flyout-arrow {
  width: 0.75rem;
  height: 0.75rem;
  transition: transform 0.2s ease;
}

.flyout-arrow.rotated {
  transform: rotate(90deg);
}

.flyout-panel {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 150px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--neutral-border-strong);
  box-shadow: 0 8px 24px var(--neutral-shadow-hover);
  padding: 0.375rem 0;
  z-index: 101;
}

.flyout-slide-enter-active,
.flyout-slide-leave-active {
  transition: all 0.2s ease;
}

.flyout-slide-enter-from,
.flyout-slide-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.header-divider {
  width: 1px;
  height: 1.5rem;
  background: var(--neutral-border-strong);
  flex-shrink: 0;
}

.hamburger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.hamburger-btn:hover {
  background: var(--neutral-bg);
  color: var(--brand-orange-dark);
}

.hamburger-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

@media (min-width: 768px) {
  .hamburger-btn {
    display: none;
  }
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
