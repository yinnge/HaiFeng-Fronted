<script setup lang="ts">
// apps/user/src/components/gaokao/ArchiveBar.vue
// 高考模块吸附条：常驻导航栏下方（sticky），滚动页面时固定不动。
// - 左侧「高考模块」标签；中部页面目录（真题占位/志愿/资讯/百宝箱）；
//   右侧省份选择器 + 年份/分数/科目 chip
// - 省份修改：已有完整档案 → 只改省份字段调接口持久化（saveArchiveSmart）；
//   尚无完整档案 → 仅本地展示（游客另存 localStorage），不调接口（后端会拦半成品档案）
// - 未选省份默认「北京」
// - 内置 ArchiveDialog：模拟填报保存后 emit('saved')；父组件可监听刷新业务数据
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { GaokaoArchiveVO, GaokaoArchiveForm } from '@/api/gaokao'
import { loadArchiveSmart, saveArchiveSmart, saveGuestArchive } from '@/utils/gaokaoArchive'
import { isLoggedIn } from '@haifeng/shared/utils/auth'
import ProvincePicker from './ProvincePicker.vue'
import ArchiveDialog from './ArchiveDialog.vue'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

// ===== 中部页面目录 =====
interface BarNavItem {
  key: string
  label: string
  to?: string
  hot?: boolean
}

// collapsible=true（专业组查询页）：往下滚动时吸附条上滑收起（抽屉式），
// 回到页面顶部才重新出现；false（高考首页）：常驻吸顶
// extraItems：追加到目录最左侧的扩展项（如「高中资料」），不传则目录保持原样；
// identityOptions/identity：右侧身份下拉（高一高二高三等），受控 + emit('identity-change')，
// 不传 identityOptions 则不渲染该控件（Groups 等复用方行为完全不变）。
const props = withDefaults(
  defineProps<{
    collapsible?: boolean
    extraItems?: BarNavItem[]
    identityOptions?: string[]
    identity?: string
  }>(),
  { collapsible: false },
)

const route = useRoute()
const router = useRouter()

const emit = defineEmits<{
  /** 档案发生变化（初始加载 / 省份切换 / 弹窗保存），携带最新档案（可为 null） */
  (e: 'archive-change', archive: GaokaoArchiveVO | null): void
  /** 弹窗「模拟填报」保存成功（已入库或已存本地） */
  (e: 'saved', form: GaokaoArchiveForm): void
  /** 身份切换（右侧下拉），携带新身份 */
  (e: 'identity-change', identity: string): void
}>()

const displayForm = ref<GaokaoArchiveVO | null>(null)
const dialogVisible = ref(false)

// 吸附偏移：动态测量导航栏实际高度，避免写死（导航内容高度随断点变化）
const stickyTop = ref(64)

// 全局头部收起时，把吸顶偏移收为 0，填补顶部空隙（共享单例状态）
const { hidden: headerHidden } = useAutoHideHeader()
const barTop = computed(() => (headerHidden.value ? 0 : stickyTop.value))

function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

// 供父组件（如其它页面的「修改档案」按钮）直接打开弹窗
function openDialog() {
  dialogVisible.value = true
}

/** 供父组件（首页右侧测算卡片）在卡片保存后回填导航栏右侧状态，保持两端一致 */
function applyArchive(archive: GaokaoArchiveVO | null) {
  displayForm.value = archive
  emit('archive-change', archive)
}
defineExpose({ openDialog, applyArchive })

// ===== 中部页面目录 =====
const navItems: BarNavItem[] = [
  { key: 'zhenti', label: '高考真题', to: '/gaokao?tab=zhenti' },
  // 「高中生涯规划」尚无独立页，占位项（无 to → 点击提示敬请期待）
  { key: 'highcareer', label: '高中生涯规划' },
  { key: 'volunteer', label: '高考志愿', to: '/gaokao', hot: true },
  { key: 'articles', label: '高中资讯', to: '/gaokao/articles' },
  { key: 'toolkit', label: '高考百宝箱', to: '/gaokao/toolkit' },
]

/** 最终渲染的目录 = 扩展项（最左）+ 原有目录 */
const allNavItems = computed<BarNavItem[]>(() => [...(props.extraItems || []), ...navItems])

/**
 * 高亮判定：path + query 双校验。
 * - 高考真题 to='/gaokao?tab=zhenti'：仅当 path=/gaokao 且 tab=zhenti 时高亮；
 * - 高考志愿 to='/gaokao'（无 query）：仅当 path=/gaokao 且无 tab 时高亮（tab=zhenti 时不亮，避免两个同时高亮）。
 */
function isActive(item: BarNavItem) {
  if (!item.to) return false
  const [path, query] = item.to.split('?')
  if (route.path !== path) return false
  if (!query) return !route.query.tab
  const target = new URLSearchParams(query).get('tab')
  return target === (route.query.tab as string | undefined)
}

function onNavClick(item: BarNavItem) {
  if (item.to) {
    void router.push(item.to)
  } else {
    ElMessage.info(`「${item.label}」即将上线，敬请期待`)
  }
}

/** 点击左侧「高中模块」标题：回到高考模块主页（/gaokao landing） */
function goModuleHome() {
  void router.push('/gaokao')
}

// 三个选科（首选 / 再选1 / 再选2），老高考无再选科目时只展示首选
const archiveSubjects = computed(() => {
  if (!displayForm.value) return []
  return [
    displayForm.value.subjectType,
    displayForm.value.secondSubjectType,
    displayForm.value.thirdSubjectType,
  ].filter((s): s is string => !!s)
})

/** 当前省份（未建档默认北京） */
const archiveProvince = computed(() => displayForm.value?.gaokaoProvince || '北京')

/**
 * 省份切换：只改省份这一个字段并持久化。
 * - 已有完整档案（有分数）：登录调 saveArchive 入库（仅省份不同）/ 游客写 localStorage；
 * - 尚无完整档案：仅更新本地展示，游客另存 localStorage；登录态不调接口（半成品档案会被后端校验拦截）。
 */
async function onProvinceChange(val: string) {
  const prev = displayForm.value
  const merged = {
    ...(prev || {}),
    gaokaoProvince: val,
    gaokaoYear: prev?.gaokaoYear || new Date().getFullYear(),
  } as GaokaoArchiveVO
  displayForm.value = merged
  emit('archive-change', merged)

  const hasFullArchive = !!prev?.score
  if (hasFullArchive) {
    try {
      await saveArchiveSmart({ ...merged })
    } catch (e: any) {
      ElMessage.error(e?.message || '省份保存失败')
      displayForm.value = prev
      emit('archive-change', prev)
      return
    }
  } else if (!isLoggedIn()) {
    saveGuestArchive({ ...merged })
  }
}

async function loadArchive() {
  try {
    const { archive } = await loadArchiveSmart()
    displayForm.value = archive || {
      gaokaoProvince: '北京',
      gaokaoYear: new Date().getFullYear(),
    } as GaokaoArchiveVO
    emit('archive-change', displayForm.value)
  } catch {
    displayForm.value = { gaokaoProvince: '北京', gaokaoYear: new Date().getFullYear() } as GaokaoArchiveVO
    emit('archive-change', displayForm.value)
  }
}

// 弹窗保存成功：更新展示 + 通知父组件
function handleSaved(form: GaokaoArchiveForm) {
  displayForm.value = { ...(displayForm.value || ({} as GaokaoArchiveVO)), ...form }
  dialogVisible.value = false
  emit('archive-change', displayForm.value)
  emit('saved', form)
}

onMounted(() => {
  measureHeader()
  void loadArchive()
  // capture:true —— 某些布局下 body 是滚动容器（index.css: body{overflow-y:scroll}），
  // 滚动事件不会冒泡到 window，非捕获阶段监听收不到；捕获阶段能截获 body 自身的滚动。
  window.addEventListener('scroll', onWinScroll, { passive: true, capture: true })
  // 初始同步一次（刷新时若已在页面中部，应直接收起）
  onWinScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onWinScroll, { capture: true } as EventListenerOptions)
})

// ===== 抽屉式收起（仅 collapsible 页面生效）：滚过顶部阈值就收起，回顶再展开 =====
const barHidden = ref(false)

// 读取真实滚动位置：viewport 滚动读 window.scrollY / documentElement.scrollTop，
// 若 body 本身是滚动容器则读 document.body.scrollTop；capture 阶段 event.target 即滚动元素。
function getScrollTop(e?: Event): number {
  const target = e?.target as (Window | Document | HTMLElement | null | undefined)
  if (
    target &&
    target !== document &&
    target !== window &&
    typeof (target as HTMLElement).scrollTop === 'number' &&
    (target as HTMLElement).scrollTop > 0
  ) {
    return (target as HTMLElement).scrollTop
  }
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  )
}

function onWinScroll(e?: Event) {
  if (!props.collapsible) {
    barHidden.value = false
    return
  }
  barHidden.value = getScrollTop(e) > 60
}
</script>

<template>
  <div class="archive-bar" :class="{ 'is-hidden': barHidden }" :style="{ top: `${barTop}px` }">
    <div class="archive-bar-inner">
      <button
        type="button"
        class="archive-bar-label archive-bar-title"
        title="返回高考模块主页"
        @click="goModuleHome"
      >
        <svg class="archive-label-icon shrink-0 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        高中模块
      </button>

      <!-- 中部页面目录 -->
      <nav class="archive-nav">
        <button
          v-for="item in allNavItems"
          :key="item.key"
          type="button"
          class="archive-nav-item"
          :class="{ 'is-active': isActive(item) }"
          @click="onNavClick(item)"
        >
          {{ item.label }}
          <!-- 火爆角标：火焰 svg -->
          <span v-if="item.hot" class="nav-hot-badge" title="火爆">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.5 0.67s0.74 2.65 0.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l0.03-0.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67z" />
              <path d="M11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-0.36 3.6-1.21 4.62-2.58 0.39 1.29 0.59 2.65 0.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" opacity="0.55" />
            </svg>
          </span>
        </button>
      </nav>

      <!-- 右侧信息：省份选择器在前，年份/分数/科目点击打开档案弹窗 -->
      <div class="archive-bar-info">
        <ProvincePicker :model-value="archiveProvince" variant="bar" @update:model-value="onProvinceChange" />
        <!-- 身份切换（高一/高二/高三）：切换后由父组件联动「高中资料」列表查询 -->
        <div v-if="identityOptions && identityOptions.length" class="archive-identity">
          <el-select
            :model-value="identity"
            class="archive-identity-select"
            popper-class="archive-identity-popper"
            @update:model-value="(v: string) => emit('identity-change', v)"
          >
            <el-option v-for="opt in identityOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>
        <template v-if="displayForm && displayForm.score">
          <!-- 年份 / 分数 / 选科合并为一个 chip，用「|」分隔 -->
          <button class="archive-chip" title="点击修改档案" @click="openDialog">
            <template v-if="displayForm.gaokaoYear">{{ displayForm.gaokaoYear }}年</template>
            <span v-if="displayForm.gaokaoYear" class="chip-sep">|</span>
            <template v-if="displayForm.score">{{ displayForm.score }}分</template>
            <span v-if="displayForm.score && archiveSubjects.length" class="chip-sep">|</span>
            <template v-if="archiveSubjects.length">{{ archiveSubjects.join('/') }}</template>
          </button>
        </template>
        <button v-else class="archive-chip archive-chip-empty" @click="openDialog">
          点击填写年份 / 分数 / 科目
        </button>
      </div>
    </div>

    <!-- 高考档案填写弹窗（模拟填报 / 制定方案） -->
    <ArchiveDialog v-model:visible="dialogVisible" :initial-form="displayForm" @saved="handleSaved" />
  </div>
</template>

<style scoped>
/* ===== 档案吸附条：sticky 吸在导航栏下方（top 由 JS 测量导航实际高度） ===== */
.archive-bar {
  position: sticky;
  z-index: 40;
  background: rgba(255, 251, 245, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 1px 8px rgba(249, 115, 22, 0.06);
  transition: transform 0.35s ease, top 0.3s ease;
}

/* 抽屉式收起（collapsible 页面向下滚动时）：上滑隐藏，回顶展开 */
.archive-bar.is-hidden {
  transform: translateY(-110%);
}

.archive-bar-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 15px 24px;
}

.archive-bar-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.archive-label-icon {
  width: 18px;
  height: 18px;
}

/* 「高中模块」标题改为可点击（返回模块主页），重置 button 默认样式 + hover */
.archive-bar-title {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.archive-bar-title:hover {
  opacity: 0.7;
}

/* 合并 chip 内「|」分隔符 */
.chip-sep {
  margin: 0 6px;
  color: #fdba74;
  font-weight: 400;
}

@media (max-width: 767px) {
  .archive-bar-label {
    display: none;
  }
}

/* ===== 中部页面目录 =====
   注意：不能用 overflow-x:auto 做横向滚动——overflow 裁剪会把火焰角标（凸出部分）切掉 */
.archive-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex-shrink: 0;
}

.archive-nav-item {
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

.archive-nav-item:hover {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.08);
}

.archive-nav-item.is-active {
  color: #c2410c;
  background: #ffedd5;
  font-weight: 700;
}

.archive-nav-item:active {
  transform: scale(0.97);
}

/* 火焰角标（右上角） */
.nav-hot-badge {
  position: absolute;
  top: -6px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50% 50% 50% 4px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: #fff;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.4);
}

.nav-hot-badge svg {
  width: 10px;
  height: 10px;
}

/* ===== 右侧信息 ===== */
.archive-bar-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 14px;
  min-width: 0;
  margin-left: auto;
}

/* 吸附条省份按钮：实心红底白字、面积大于身份按钮（仅作用于吸附条，不污染搜索框） */
.archive-bar-info :deep(.pp-trigger-bar) {
  min-width: 88px;
  height: 38px;
  padding: 0 18px;
  border-radius: 16px;
  background: #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.28);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.archive-bar-info :deep(.pp-trigger-bar:hover) {
  background: #dc2626;
  box-shadow: 0 3px 10px rgba(239, 68, 68, 0.36);
}

.archive-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.archive-chip:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.archive-chip-empty {
  border-style: dashed;
  color: #9ca3af;
  font-weight: 400;
}

/* ===== 身份切换下拉（高一/高二/高三），紧跟省份选择器 ===== */
.archive-identity {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.archive-identity-label {
  font-size: 13px;
  color: #a8a29e;
  white-space: nowrap;
}

.archive-identity-select {
  width: 76px;
}

.archive-identity-select :deep(.el-select__wrapper) {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.25) inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.archive-identity-select :deep(.el-select__wrapper.is-hovering),
.archive-identity-select :deep(.el-select__wrapper.is-focused) {
  background: #fff7ed;
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

.archive-identity-select :deep(.el-select__suffix) {
  display: none;
}

.archive-identity-select :deep(.el-select__selected-item) {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #c2410c;
}

@media (max-width: 767px) {
  .archive-identity-label {
    display: none;
  }
}
</style>

<style>
/* 身份下拉面板：popper-class 传送到 body，scoped 无效，故放在非 scoped 块（类名唯一，无泄漏） */
.archive-identity-popper .el-select-dropdown__item.is-selected {
  color: #c2410c;
  font-weight: 700;
}

.archive-identity-popper .el-select-dropdown__item.is-hovering {
  background: #fff7ed;
  color: #ea580c;
}
</style>
