<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoMain from '@/assets/images/logo-main.png'
import GlobalSearchBox from './GlobalSearchBox.vue'
import UserAvatar from './UserAvatar.vue'
import NotificationBell from './NotificationBell.vue'
import { useExpertContact } from '@/composables/useExpertContact'

const route = useRoute()
const router = useRouter()
const expert = useExpertContact()

const isHome = computed(() => route.path === '/')

const comingSoonLinks = [
  { label: '生涯规划图谱', from: 'career-map' },
  { label: '大数据对比', from: 'data-compare' },
]

const mobileMenuOpen = ref(false)

// 窄屏判定（<768px 收起为汉堡菜单）
const isNarrow = ref(false)
let mql: MediaQueryList | null = null
function applyNarrow(e: MediaQueryListEvent | MediaQueryList) {
  isNarrow.value = e.matches
  if (e.matches) mobileMenuOpen.value = false
}
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(max-width: 767px)')
    isNarrow.value = mql.matches
    mql.addEventListener('change', applyNarrow)
  }
})
onBeforeUnmount(() => {
  mql?.removeEventListener('change', applyNarrow)
})

function toComingSoon(from: string) {
  mobileMenuOpen.value = false
  router.push({ path: '/coming-soon', query: { from } })
}

function goToolbox() {
  mobileMenuOpen.value = false
  if (route.path === '/' && route.hash === '#toolbox') {
    document.getElementById('toolbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  void router.push({ path: '/', hash: '#toolbox' })
}

function openExpert() {
  mobileMenuOpen.value = false
  void expert.open()
}
</script>

<template>
  <header class="top-toolbar">
    <div class="tt-grid">
      <!-- 左侧品牌区 -->
      <div class="tt-brand">
        <router-link to="/" class="tt-logo-link" aria-label="海枫未来规划院">
          <img :src="logoMain" alt="海枫未来规划院" class="tt-logo" />
        </router-link>
        <div class="tt-brand-text">
          <div class="tt-brand-title">海枫<span class="tt-grad">未来规划院</span></div>
          <div class="tt-brand-sub">专注中升学、高考志愿及硕博就业的全周期规划服务</div>
        </div>
      </div>

      <!-- 中间：全站搜索（视觉居中） -->
      <div class="tt-center">
        <GlobalSearchBox />
      </div>

      <!-- 右侧功能区 -->
      <div class="tt-actions">
        <nav class="tt-links" :class="{ hidden: isNarrow }">
          <router-link to="/" class="tt-link" :class="{ active: isHome }">首页</router-link>
          <button type="button" class="tt-link" @click="goToolbox">百宝箱</button>
          <button
            v-for="l in comingSoonLinks"
            :key="l.from"
            type="button"
            class="tt-link"
            @click="toComingSoon(l.from)"
          >
            {{ l.label }}
          </button>
          <button type="button" class="tt-link" @click="openExpert">专家咨询预约</button>
        </nav>

        <div class="tt-account">
          <NotificationBell />
          <UserAvatar />
        </div>

        <button
          v-if="isNarrow"
          type="button"
          class="tt-hamburger"
          aria-label="菜单"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 窄屏下拉菜单 -->
    <Transition name="tt-menu">
      <div v-if="isNarrow && mobileMenuOpen" class="tt-mobile-menu">
        <button
          type="button"
          class="tt-mobile-link"
          :class="{ active: isHome }"
          @click="mobileMenuOpen = false; router.push('/')"
        >
          首页
        </button>
        <button type="button" class="tt-mobile-link" @click="goToolbox">百宝箱</button>
        <button
          v-for="l in comingSoonLinks"
          :key="l.from"
          type="button"
          class="tt-mobile-link"
          @click="toComingSoon(l.from)"
        >
          {{ l.label }}
        </button>
        <button type="button" class="tt-mobile-link" @click="openExpert">专家咨询预约</button>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.top-toolbar {
  position: sticky;
  top: 0;
  z-index: 60;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #eeeeee;
}

.tt-grid {
  display: grid;
  /* 品牌(内容宽) | 搜索(弹性可缩) | 功能区(内容宽，永不被挤压) */
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  height: 100%;
  max-width: 2200px;
  margin: 0 auto;
}

/* 品牌区 */
.tt-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.tt-logo-link {
  display: flex;
  flex-shrink: 0;
}
.tt-logo {
  height: 36px;
  width: 36px;
  object-fit: contain;
}
.tt-brand-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  /* 光学修正：中文字体下沉度量导致两行文字视觉偏底，整体上移 2px */
  position: relative;
  top: -2px;
}
.tt-brand-title {
  font-family: "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #18181B;
  letter-spacing: -0.02em;
  line-height: 1.1;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 2px;
}
.tt-grad {
  background: linear-gradient(135deg, #FF7A00 0%, #EA580C 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.tt-brand-sub {
  font-size: 11.5px;
  font-weight: 400;
  color: #71717A;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0;
}

/* 中间搜索：靠左排布（不居中），把空间让给右侧功能区 */
.tt-center {
  display: flex;
  justify-content: flex-start;
  min-width: 0;
}

/* 右侧功能区 */
.tt-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  min-width: 0;
}
.tt-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.tt-links.hidden {
  display: none;
}
.tt-link {
  font-family: "PingFang SC", "HarmonyOS Sans SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 14.5px;
  font-weight: 600;
  color: #3F3F46;
  letter-spacing: 0.01em;
  background: transparent;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  padding: 6px 14px;
  position: relative;
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.tt-link:hover {
  color: #EA580C;
  background: rgba(255, 122, 0, 0.07);
}
.tt-link:active {
  transform: scale(0.97);
}
.tt-link.active,
.tt-link.router-link-active {
  color: #EA580C;
  font-weight: 700;
  background: rgba(255, 122, 0, 0.09);
}
.tt-link.active::after,
.tt-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2.5px;
  border-radius: 999px;
  background: #EA580C;
}

.tt-account {
  /* 必须 flex 横排：否则 block 布局会把 铃铛(44px)+头像(48px) 竖向堆成 92px，
     撑破 64px 导航栏（铃铛顶格、头像溢出到栏目下方） */
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.tt-hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #333;
  transition: all 0.2s ease;
}
.tt-hamburger:hover {
  background: #fff7ed;
  color: #ff7a00;
}
.tt-hamburger svg {
  width: 22px;
  height: 22px;
}

/* 窄屏菜单 */
.tt-mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid #eeeeee;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.1);
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
}
.tt-mobile-link {
  text-align: left;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  background: none;
  border: none;
  padding: 12px 4px;
  border-bottom: 1px solid #f5f5f5;
}
.tt-mobile-link:last-child {
  border-bottom: none;
}
.tt-mobile-link.active {
  color: #ff7a00;
  font-weight: 700;
}

.tt-menu-enter-active,
.tt-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tt-menu-enter-from,
.tt-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 笔记本等中等宽度：进一步收紧链接间距，隐藏副标题，保证不重叠 */
@media (max-width: 1500px) {
  .tt-link {
    padding: 6px 10px; /* 14→10，5 个链接共省 40px */
  }
}

@media (max-width: 1400px) {
  .tt-links {
    gap: 12px;
  }
}

@media (max-width: 1280px) {
  .tt-links {
    gap: 10px;
  }
}

@media (max-width: 1199px) {
  .tt-brand-sub {
    display: none;
  }
}
</style>
