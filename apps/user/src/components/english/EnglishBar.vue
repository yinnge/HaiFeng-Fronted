<script setup lang="ts">
// apps/user/src/components/english/EnglishBar.vue
// 英语四六级模块吸附条：常驻导航栏下方（sticky），滚动页面时固定不动。
// - 左侧「英语四六级」标签（书本 svg，点击回主页 /english）
// - 中部页面目录（6 个内联目录：历年真题/模拟试卷/题型练习/单词词汇/英语资讯/做题记录）
// - 右侧考试类型下拉框（中考/高考/四级/六级/考研英语），本期仅本地状态，默认「英语四级」
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

const route = useRoute()
const router = useRouter()

// 吸附偏移：动态测量导航栏实际高度，避免写死（导航内容高度随断点变化）
const stickyTop = ref(64)
function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

// 全局头部收起时，把吸顶偏移收为 0，填补顶部空隙（共享单例状态）
const { hidden: headerHidden } = useAutoHideHeader()
const barTop = computed(() => (headerHidden.value ? 0 : stickyTop.value))

// ===== 中部页面目录（内联切换，走 query ?tab=xxx） =====
interface BarNavItem {
  key: string
  label: string
}

const navItems: BarNavItem[] = [
  { key: 'zhenti', label: '历年真题' },
  { key: 'mock', label: '模拟试卷' },
  { key: 'practice', label: '题型练习' },
  { key: 'vocab', label: '单词词汇' },
  { key: 'news', label: '英语资讯' },
  { key: 'record', label: '做题记录' },
]

/** 高亮判定：仅当 path=/english 且 query.tab 命中该项 */
function isActive(item: BarNavItem) {
  return route.path === '/english' && (route.query.tab as string | undefined) === item.key
}

function onNavClick(item: BarNavItem) {
  void router.push(`/english?tab=${item.key}`)
}

/** 点击左侧「英语四六级」标题：回到主页（/english landing，卡片页） */
function goModuleHome() {
  void router.push('/english')
}

// ===== 右侧考试类型下拉（本地状态，默认英语四级） =====
const examTypes = ['中考英语', '高考英语', '英语四级', '英语六级', '考研英语']
const currentExam = ref('英语四级')

onMounted(() => {
  measureHeader()
})
</script>

<template>
  <div class="english-bar" :style="{ top: `${barTop}px` }">
    <div class="english-bar-inner">
      <button
        type="button"
        class="english-bar-title"
        title="返回英语四六级主页"
        @click="goModuleHome"
      >
        <svg class="english-label-icon shrink-0 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        英语四六级
      </button>

      <!-- 中部页面目录 -->
      <nav class="english-nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          type="button"
          class="english-nav-item"
          :class="{ 'is-active': isActive(item) }"
          @click="onNavClick(item)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- 右侧：考试类型下拉框（本地状态） -->
      <div class="english-bar-info">
        <el-select
          v-model="currentExam"
          class="english-exam-select"
          popper-class="english-exam-popper"
        >
          <el-option v-for="t in examTypes" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 吸附条：sticky 吸在导航栏下方 ===== */
.english-bar {
  position: sticky;
  z-index: 40;
  background: rgba(255, 251, 245, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 1px 8px rgba(249, 115, 22, 0.06);
  transition: top 0.3s ease;
}

.english-bar-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 15px 24px;
}

.english-bar-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font: inherit;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.english-bar-title:hover {
  opacity: 0.7;
}

.english-label-icon {
  width: 18px;
  height: 18px;
}

/* ===== 中部页面目录 ===== */
.english-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex-shrink: 0;
}

.english-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.english-nav-item:hover {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.08);
}

.english-nav-item.is-active {
  color: #c2410c;
  background: #ffedd5;
  font-weight: 700;
}

.english-nav-item:active {
  transform: scale(0.97);
}

/* ===== 右侧：考试类型下拉框 ===== */
.english-bar-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

.english-exam-select {
  width: 132px;
}

.english-exam-select :deep(.el-select__wrapper) {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.25) inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.english-exam-select :deep(.el-select__wrapper.is-hovering),
.english-exam-select :deep(.el-select__wrapper.is-focused) {
  background: #fff7ed;
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

.english-exam-select :deep(.el-select__selected-item) {
  font-size: 14px;
  font-weight: 600;
  color: #c2410c;
}

/* 药丸下拉不显示向下箭头（统一规范：导航栏/吸顶条上的下拉触发器不展示 svg 箭头） */
.english-exam-select :deep(.el-select__suffix) {
  display: none;
}

@media (max-width: 767px) {
  .english-bar-title {
    display: none;
  }
}
</style>

<style>
/* 考试类型下拉面板：popper-class 传送到 body，scoped 无效，故放非 scoped 块 */
.english-exam-popper .el-select-dropdown__item.is-selected {
  color: #c2410c;
  font-weight: 700;
}

.english-exam-popper .el-select-dropdown__item.is-hovering {
  background: #fff7ed;
  color: #ea580c;
}
</style>
