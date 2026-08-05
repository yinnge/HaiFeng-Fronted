<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import logoMain from '@/assets/images/logo-main.png'
import UserAvatar from './UserAvatar.vue'
import NotificationBell from './NotificationBell.vue'
import MobileNavDrawer from './MobileNavDrawer.vue'
import { navItems, type NavItem, type NavSubItem } from '@/config/navigation'

const router = useRouter()
const route = useRoute()

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
    router.push(sub.route)
  } else {
    ElMessage.info('该功能正在开发中')
  }
}

function isActive(item: NavItem): boolean {
  if (!item.route) return false
  if (item.route === '/') return route.path === '/'
  return route.path === item.route || route.path.startsWith(item.route + '/')
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
// 竞赛证书在「更多」面板里永远排在第一位
const orderedOverflowItems = computed<NavItem[]>(() => {
  const items = [...overflowItems.value]
  const compIdx = items.findIndex((i) => i.id === 'competition')
  if (compIdx > 0) {
    const [comp] = items.splice(compIdx, 1)
    items.unshift(comp)
  }
  return items
})

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
  const moreW = MORE_RESERVE + gap
  const avail = container.clientWidth

  let fit = n
  for (let k = n; k >= 1; k--) {
    let total = 0
    for (let i = 0; i < k; i++) {
      total += (itemRefs[ids[i]]?.offsetWidth ?? 0) + (i > 0 ? gap : 0)
    }
    if (total + (k < n ? moreW : 0) <= avail) {
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
  <header class="app-header">
    <div class="app-header-inner">
      <!-- 左侧：Logo -->
      <router-link to="/" class="logo-link">
        <img :src="logoMain" alt="海枫未来规划院" class="logo-img" />
        <span class="logo-text">海枫未来规划院</span>
      </router-link>

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

        <!-- 更多：放不下的菜单自动收进来 -->
        <div
          v-show="overflowCount > 0"
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
              <template v-for="item in orderedOverflowItems" :key="item.id">
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

      <!-- 右侧：操作区 -->
      <div class="header-actions">
        <UserAvatar />
        <div class="header-divider"></div>
        <NotificationBell />
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
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

/* Logo */
.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-img {
  height: 2.5rem;
  width: 2.5rem;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-text {
  font-size: clamp(1rem, 0.9rem + 0.4vw, 1.125rem);
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .logo-text {
    display: none;
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
  color: #e8722a;
}

.nav-link.active {
  color: #e8722a;
  border-bottom-color: #e8722a;
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

/* 首页强调样式 */
.nav-link-home {
  color: #e8722a;
  background: rgba(245, 165, 74, 0.1);
  border-radius: 9999px;
  padding: 0.375rem 1rem;
  text-shadow: 0 0 8px rgba(232, 114, 42, 0.3);
  box-shadow: 0 0 12px rgba(232, 114, 42, 0.15);
  transition: all 0.2s ease;
}

.nav-link-home:hover {
  background: rgba(245, 165, 74, 0.2);
  box-shadow: 0 0 16px rgba(232, 114, 42, 0.3);
}

.nav-link-home.active {
  color: #e8722a;
  background: linear-gradient(135deg, rgba(245, 165, 74, 0.25), rgba(232, 114, 42, 0.2));
  border-bottom-color: transparent;
  box-shadow: 0 0 20px rgba(232, 114, 42, 0.35);
}

.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(245, 165, 74, 0.3);
  box-shadow: 0 4px 24px rgba(232, 114, 42, 0.15);
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
  background: #fff7ed;
  color: #e8722a;
}

/* 更多面板里的分组标题 */
.overflow-group-label {
  padding: 0.375rem 1rem 0.25rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  border-top: 1px dashed rgba(245, 165, 74, 0.25);
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
  border: 1px solid rgba(245, 165, 74, 0.3);
  box-shadow: 0 4px 24px rgba(232, 114, 42, 0.15);
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
  background: linear-gradient(180deg, transparent, #f5a54a 30%, #e8722a 70%, transparent);
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
  background: rgba(245, 165, 74, 0.08);
  color: #e8722a;
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
