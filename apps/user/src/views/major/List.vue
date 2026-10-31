<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMajorList, getMajorCategoryStats } from '@/api/major'
import type { MajorListVO, MajorCategoryStatVO, MajorQueryDTO } from '@/types/major'
import { Motion } from 'motion-v'
import { useExpertContact } from '@/composables/useExpertContact'

const expertContact = useExpertContact()
const router = useRouter()

const heroBg = encodeURI(`${import.meta.env.BASE_URL}picture/university/列表背景.png`)

const loading = ref(false)
const list = ref<MajorListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const stats = ref<MajorCategoryStatVO[]>([])
const showAllCategories = ref(false)

// 统一的学科门类图标（毕业帽），所有门类复用同一个，避免"方块"占位感
const CATEGORY_ICON = 'M12 3L2 8l10 5 10-5-10-5zM6 11v5c0 1.8 2.5 6 2.5S18 17 18 12v-1'

/* 筛选状态（UI 层），提交时映射到 query */
const filter = reactive({
  name: '',
  majorCategory: '',
  type: '本科' as '全部' | '本科' | '专科',
  employmentRateMin: '',
  employmentRateMax: '',
  salaryMin: '',
  salaryMax: '',
})

const query = reactive<MajorQueryDTO>({
  page: 1,
  size: 12,
  majorType: '本科',
  sortBy: 'comprehensive',
  sortOrder: 'desc',
})

const viewMode = ref<'card' | 'table'>('card')
const sortType = ref<'comprehensive' | 'employmentRate' | 'salaryMax' | 'sortOrder'>('comprehensive')
const sortOptions = [
  { value: 'comprehensive', label: '综合排序' },
  { value: 'employmentRate', label: '就业率' },
  { value: 'salaryMax', label: '薪资水平' },
  { value: 'sortOrder', label: '热度' },
] as const

/* ---------- 学科门类色彩分流（图标底座 / 统计条） ---------- */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  工学: { bg: '#EFF6FF', text: '#2563EB' },
  理学: { bg: '#ECFDF5', text: '#059669' },
  文学: { bg: '#FFFBEB', text: '#D97706' },
  管理学: { bg: '#FFF7ED', text: '#F97316' },
  艺术学: { bg: '#F5F3FF', text: '#7C3AED' },
  经济学: { bg: '#ECFDF5', text: '#059669' },
  法学: { bg: '#EFF6FF', text: '#2563EB' },
  教育学: { bg: '#FFF7ED', text: '#F97316' },
  医学: { bg: '#ECFDF5', text: '#059669' },
  农学: { bg: '#ECFDF5', text: '#059669' },
  历史学: { bg: '#FFFBEB', text: '#D97706' },
  哲学: { bg: '#F5F3FF', text: '#7C3AED' },
}
function categoryColor(cat?: string) {
  return CATEGORY_COLORS[cat || ''] || { bg: '#F1F5F9', text: '#475569' }
}

/* ---------- 专业标签语义化配色 ---------- */
function tagClass(tag: string) {
  if (tag.includes('热门')) return 'bg-rose-50 text-rose-600'
  if (tag.includes('国家特色') || tag.includes('国家控制布点')) return 'bg-amber-50 text-amber-700'
  if (tag.includes('新工科') || tag.includes('交叉学科')) return 'bg-blue-50 text-blue-600'
  return 'bg-emerald-50 text-emerald-600'
}
function splitTags(raw?: string): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

/* ---------- 就业率区间着色 ---------- */
function rateClass(rate?: number | null) {
  if (rate == null) return 'text-slate-400'
  if (rate >= 85) return 'text-emerald-600'
  if (rate >= 70) return 'text-amber-600'
  return 'text-rose-600'
}
function rateText(rate?: number | null) {
  return rate == null ? '数据统计中' : `${rate.toFixed(1)}%`
}

/* ---------- 薪资友好渲染 ---------- */
function salaryText(min?: number | null, max?: number | null): string {
  if (!min && !max) return '薪资数据待公布'
  if (min && !max) return `${min.toLocaleString()} 起`
  if (!min && max) return `${max.toLocaleString()} 以内`
  return `${min!.toLocaleString()} - ${max!.toLocaleString()}`
}

/* ---------- 统计条 ---------- */
const categoryTotal = computed(() => stats.value.reduce((sum, s) => sum + (s.count || 0), 0))
const visibleCategories = computed(() => (showAllCategories.value ? stats.value : stats.value.slice(0, 8)))

/* ===================== 数据请求 ===================== */
async function fetchList() {
  loading.value = true
  try {
    query.page = currentPage.value
    query.size = pageSize.value
    query.sortBy = sortType.value
    query.sortOrder = 'desc'
    query.name = filter.name.trim() || undefined
    query.majorType = filter.type === '全部' ? undefined : filter.type
    query.majorCategory = filter.majorCategory || undefined
    query.employmentRateMin = filter.employmentRateMin ? Number(filter.employmentRateMin) : undefined
    query.employmentRateMax = filter.employmentRateMax ? Number(filter.employmentRateMax) : undefined
    query.salaryMin = filter.salaryMin ? Number(filter.salaryMin) : undefined
    query.salaryMax = filter.salaryMax ? Number(filter.salaryMax) : undefined
    const res = await getMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取专业列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await getMajorCategoryStats()
    const raw = res.data.data || []
    stats.value = raw.filter((s) => s.majorCategory && s.majorCategory !== 'null')
  } catch {
    /* silently fail */
  }
}

/* ===================== 交互 ===================== */
function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  filter.name = ''
  filter.majorCategory = ''
  filter.type = '本科'
  filter.employmentRateMin = ''
  filter.employmentRateMax = ''
  filter.salaryMin = ''
  filter.salaryMax = ''
  currentPage.value = 1
  fetchList()
}

function onTypeChange(type: '全部' | '本科' | '专科') {
  filter.type = type
  currentPage.value = 1
  fetchList()
}

function toggleCategory(cat: string) {
  filter.majorCategory = filter.majorCategory === cat ? '' : cat
  currentPage.value = 1
  fetchList()
}

function clearCategory() {
  filter.majorCategory = ''
  currentPage.value = 1
  fetchList()
}

function changeSort(sort: typeof sortType.value) {
  sortType.value = sort
  currentPage.value = 1
  fetchList()
}

function goDetail(id?: string | number) {
  if (id == null) return
  router.push(`/major/${id}`)
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}
function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------- 场景入口胶囊 ---------- */
const scenePills = [
  { label: '专业概况', bg: '#EFF6FF', text: '#2563EB', target: 'major-list' },
  { label: '就业前景', bg: '#ECFDF5', text: '#059669', target: 'major-list' },
  { label: '薪资参考', bg: '#FFFBEB', text: '#D97706', target: 'major-list' },
  { label: '学科评估', bg: '#FFF1F2', text: '#E11D48', target: 'category-stats' },
] as const

/* ---------- 在线工具（悬浮框） ---------- */
const toolsOpen = ref(false)
const onlineTools = [
  { label: '院校库查询', icon: 'school', color: '#2563EB', bg: '#EFF6FF', to: '/university' },
  { label: '高考填报志愿', icon: 'edit', color: '#059669', bg: '#ECFDF5', to: '/gaokao' },
  { label: '考研专业查询', icon: 'book', color: '#7C3AED', bg: '#F5F3FF', to: '/postgrad-major' },
  { label: '考公考研', icon: 'briefcase', color: '#D97706', bg: '#FFFBEB', action: 'coming' as const },
  { label: '就业服务', icon: 'work', color: '#E11D48', bg: '#FFF1F2', action: 'coming' as const },
  { label: 'AI智能规划', icon: 'ai', color: '#F97316', bg: '#FFF7ED', action: 'coming' as const },
  { label: '专家一对一指导', icon: 'expert', color: '#0EA5E9', bg: '#E0F2FE', action: 'expert' as const },
]

function toggleTools() {
  toolsOpen.value = !toolsOpen.value
}
function closeTools() {
  toolsOpen.value = false
}
function onToolClick(tool: (typeof onlineTools)[number]) {
  if (tool.to) {
    router.push(tool.to)
  } else if (tool.action === 'coming') {
    ElMessageBox.alert(`「${tool.label}」功能正在开发中，敬请期待。`, '敬请期待', {
      confirmButtonText: '我知道了',
      type: 'info',
    })
  } else if (tool.action === 'expert') {
    expertContact.open()
  }
  closeTools()
}

onMounted(() => {
  fetchStats()
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- ============ Hero ============ -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
        class="relative mb-6 overflow-hidden rounded-3xl shadow-lg"
      >
        <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url(${heroBg})` }" />
        <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/40" />
        <div class="relative flex flex-col gap-6 p-8 md:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-xl">
            <div class="mb-3 flex items-center gap-3">
              <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </span>
              <h1 class="text-2xl font-bold text-slate-800 md:text-3xl">专业列表</h1>
            </div>
            <p class="mb-1 text-lg font-medium text-slate-700">全面了解各类专业信息，助你选择更适合的未来方向</p>
            <p class="mb-5 text-sm text-slate-500">收录教育部公布的本科、专科专业目录，涵盖专业介绍、课程设置、就业方向与薪资水平等数据。</p>
            <p class="mb-6 font-serif text-xl italic text-orange-600">选对专业，走好未来的每一步</p>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="pill in scenePills"
                :key="pill.label"
                class="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:shadow-md"
                :style="{ color: pill.text }"
                @click="scrollToId(pill.target)"
              >
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-lg" :style="{ background: pill.bg }">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </span>
                {{ pill.label }}
              </button>
            </div>
          </div>
        </div>
      </Motion>

      <!-- ============ 学科门类统计条 ============ -->
      <Motion
        id="category-stats"
        :initial="{ opacity: 0, y: 20 }"
        :while-in-view="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.05 }"
        class="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]"
      >
        <div class="mb-4 flex items-center gap-2">
          <h2 class="text-base font-bold text-slate-800">学科门类</h2>
          <span class="text-sm text-slate-400">按门类快速筛选</span>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
            :class="!filter.majorCategory
              ? 'border-orange-200 bg-orange-50 text-orange-600 shadow-sm'
              : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200'"
            @click="clearCategory"
          >
            全部专业
            <span class="rounded-full bg-white px-2 py-0.5 text-xs font-bold">{{ categoryTotal }}</span>
          </button>
          <button
            v-for="item in visibleCategories"
            :key="item.majorCategory"
            class="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
            :class="filter.majorCategory === item.majorCategory
              ? 'border-orange-200 bg-orange-50 text-orange-600 shadow-sm'
              : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-orange-200'"
            @click="toggleCategory(item.majorCategory)"
          >
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full" :style="{ background: categoryColor(item.majorCategory).bg, color: categoryColor(item.majorCategory).text }">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path :d="CATEGORY_ICON" /></svg>
            </span>
            {{ item.majorCategory }}
            <span class="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{{ item.count }}</span>
          </button>
          <button
            v-if="stats.length > 8"
            class="rounded-xl px-4 py-2.5 text-sm font-medium text-orange-500 transition hover:text-orange-600"
            @click="showAllCategories = !showAllCategories"
          >
            {{ showAllCategories ? '收起' : '查看更多' }} →
          </button>
        </div>
      </Motion>

      <!-- ============ 两栏布局（左筛选 + 中列表，已移除右栏） ============ -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <!-- 左侧筛选栏 -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]">
            <div class="mb-5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-block h-4 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500" />
                <h2 class="text-base font-bold text-slate-800">筛选条件</h2>
              </div>
              <button class="flex items-center gap-1 text-sm text-slate-400 transition hover:text-orange-500" @click="handleReset">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3M20 15a8 8 0 01-14 3" /></svg>
                重置
              </button>
            </div>

            <div class="space-y-5">
              <!-- 专业名称 -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <svg class="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 3v4a1 1 0 001 1h4M9 3h6a1 1 0 011 1v16a1 1 0 01-1 1H9a1 1 0 01-1-1V4a1 1 0 011-1z" /></svg>
                  专业名称
                </label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    v-model="filter.name"
                    type="text"
                    placeholder="请输入专业名称"
                    class="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-orange-400 focus:bg-white"
                    @keyup.enter="handleSearch"
                  />
                </div>
              </div>

              <!-- 学科门类 -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <svg class="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a2 2 0 012-2h6v16H6a2 2 0 00-2 2V5zM20 5a2 2 0 00-2-2h-6v16h6a2 2 0 012 2V5z" /></svg>
                  学科门类
                </label>
                <el-select
                  v-model="filter.majorCategory"
                  placeholder="全部门类"
                  clearable
                  filterable
                  class="w-full"
                  @change="handleSearch"
                >
                  <el-option v-for="item in stats" :key="item.majorCategory" :label="item.majorCategory" :value="item.majorCategory" />
                </el-select>
              </div>

              <!-- 专业类型（原顶部本科/专科目录，移入筛选） -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <svg class="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                  专业类型
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="t in (['全部', '本科', '专科'] as const)"
                    :key="t"
                    class="rounded-lg py-2 text-sm font-medium transition-all"
                    :class="filter.type === t
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-200'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500'"
                    @click="onTypeChange(t)"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>

              <!-- 就业率 -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <svg class="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M7 21V11M12 21V5M17 21v-8" /></svg>
                  就业率（%）
                </label>
                <div class="flex items-center gap-2">
                  <div class="flex flex-1 items-center rounded-lg border border-gray-200 bg-slate-50 px-2.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                    <input v-model="filter.employmentRateMin" type="number" min="0" max="100" placeholder="最低" class="w-full bg-transparent py-2 text-sm outline-none" @keyup.enter="handleSearch" />
                    <span class="text-xs text-slate-400">%</span>
                  </div>
                  <span class="text-slate-400">~</span>
                  <div class="flex flex-1 items-center rounded-lg border border-gray-200 bg-slate-50 px-2.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                    <input v-model="filter.employmentRateMax" type="number" min="0" max="100" placeholder="最高" class="w-full bg-transparent py-2 text-sm outline-none" @keyup.enter="handleSearch" />
                    <span class="text-xs text-slate-400">%</span>
                  </div>
                </div>
              </div>

              <!-- 薪资范围（月薪） -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <svg class="h-3.5 w-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22c5 0 9-3 9-7s-4-5-9-5-9 1-9 5 4 7 9 7zM12 2v5M9.5 4.5h5" /></svg>
                  薪资范围（月薪/元）
                </label>
                <div class="flex items-center gap-2">
                  <div class="flex flex-1 items-center rounded-lg border border-gray-200 bg-slate-50 px-2.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                    <input v-model="filter.salaryMin" type="number" min="0" placeholder="最低" class="w-full bg-transparent py-2 text-sm outline-none" @keyup.enter="handleSearch" />
                    <span class="text-xs text-slate-400">元</span>
                  </div>
                  <span class="text-slate-400">~</span>
                  <div class="flex flex-1 items-center rounded-lg border border-gray-200 bg-slate-50 px-2.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                    <input v-model="filter.salaryMax" type="number" min="0" placeholder="最高" class="w-full bg-transparent py-2 text-sm outline-none" @keyup.enter="handleSearch" />
                    <span class="text-xs text-slate-400">元</span>
                  </div>
                </div>
              </div>

              <button
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
                @click="handleSearch"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                搜索
              </button>
            </div>
          </div>
        </aside>

        <!-- 中间专业列表 -->
        <section id="major-list">
          <!-- 工具条 -->
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-baseline gap-2">
              <h2 class="text-lg font-bold text-slate-800">专业列表</h2>
              <span class="text-sm text-slate-400">共 {{ total }} 条</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex gap-1.5">
                <button
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="rounded-full px-3.5 py-1.5 text-sm font-medium transition-all"
                  :class="sortType === opt.value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500'"
                  @click="changeSort(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
              <div class="ml-1 flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-full transition"
                  :class="viewMode === 'card' ? 'bg-orange-50 text-orange-500' : 'text-slate-400 hover:text-slate-600'"
                  title="卡片视图"
                  @click="viewMode = 'card'"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-full transition"
                  :class="viewMode === 'table' ? 'bg-orange-50 text-orange-500' : 'text-slate-400 hover:text-slate-600'"
                  title="列表视图"
                  @click="viewMode = 'table'"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5h7v7H4V5zm9 0h7v7h-7V5zM4 14h7v5H4v-5zm9 0h7v5h-7v-5z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'">
            <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="n in 6" :key="n" class="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white" />
            </div>
            <div v-else-if="list.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="item in list"
                :key="item.id"
                class="hf-card group cursor-pointer p-5"
                @click="goDetail(item.id)"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    :style="{ background: categoryColor(item.majorCategory).bg, color: categoryColor(item.majorCategory).text }"
                  >
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path :d="CATEGORY_ICON" /></svg>
                  </span>
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-base font-bold text-slate-800">{{ item.majorName }}</h3>
                    <div class="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        v-for="t in splitTags(item.majorTags)"
                        :key="t"
                        class="rounded-md px-2 py-0.5 text-xs font-semibold"
                        :class="tagClass(t)"
                      >{{ t }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ item.majorCategory }}</span>
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ item.parentCategory }}</span>
                  <span v-if="filter.type !== '全部'" class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ filter.type }}</span>
                </div>

                <div class="mt-4 space-y-2 border-t border-slate-50 pt-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-400">就业率</span>
                    <span class="font-semibold" :class="rateClass(item.employmentRate)">{{ rateText(item.employmentRate) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-400">薪资范围（元/月）</span>
                    <span class="font-semibold text-slate-700">{{ salaryText(item.salaryMin, item.salaryMax) }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-400">授予学位</span>
                    <span class="font-semibold text-slate-700">{{ item.degreeAwarded || '学位信息待完善' }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-400">学制</span>
                    <span class="font-semibold text-slate-700">{{ item.studyDuration || '学制以官网为准' }}</span>
                  </div>
                </div>

                <p class="mt-3 line-clamp-2 text-sm text-slate-500">{{ item.description || '暂无简介' }}</p>

                <div class="mt-3 flex justify-end">
                  <span class="text-sm font-medium text-orange-500 transition group-hover:translate-x-1">查看详情 →</span>
                </div>
              </article>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p class="text-slate-400">暂无匹配的专业，试试调整筛选条件</p>
            </div>
          </div>

          <!-- 表格视图 -->
          <div v-else>
            <div v-if="loading" class="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
              <div v-for="n in 6" :key="n" class="h-10 animate-pulse rounded-lg bg-slate-50" />
            </div>
            <div v-else-if="list.length" class="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-slate-100 text-left text-sm text-slate-500">
                    <th class="px-4 py-3 font-medium">代码</th>
                    <th class="px-4 py-3 font-medium">专业名称</th>
                    <th class="px-4 py-3 font-medium">类别</th>
                    <th class="px-4 py-3 font-medium">门类</th>
                    <th class="px-4 py-3 font-medium">授予学位</th>
                    <th class="px-4 py-3 font-medium">就业率</th>
                    <th class="px-4 py-3 font-medium">薪资范围</th>
                    <th class="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in list"
                    :key="item.id"
                    class="cursor-pointer border-b border-slate-50 transition-colors hover:bg-orange-50/40"
                    @click="goDetail(item.id)"
                  >
                    <td class="px-4 py-3 font-mono text-sm text-slate-500">{{ item.majorCode }}</td>
                    <td class="px-4 py-3">
                      <span class="text-sm font-medium text-slate-800">{{ item.majorName }}</span>
                      <span
                        v-for="t in splitTags(item.majorTags)"
                        :key="t"
                        class="ml-2 rounded-md px-2 py-0.5 text-xs font-semibold"
                        :class="tagClass(t)"
                      >{{ t }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500">{{ item.majorCategory }}</td>
                    <td class="px-4 py-3 text-sm text-slate-500">{{ item.parentCategory }}</td>
                    <td class="px-4 py-3 text-sm text-slate-500">{{ item.degreeAwarded || '—' }}</td>
                    <td class="px-4 py-3 text-sm font-semibold" :class="rateClass(item.employmentRate)">
                      {{ item.employmentRate != null ? `${item.employmentRate.toFixed(1)}%` : '—' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-500">
                      {{ salaryText(item.salaryMin, item.salaryMax) === '薪资数据待公布' ? '—' : salaryText(item.salaryMin, item.salaryMax) }}
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span class="font-medium text-orange-500 hover:text-orange-600">查看详情</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
              暂无匹配的专业，试试调整筛选条件
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="hf-pager mt-6 flex justify-center">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="total"
              :page-sizes="[12, 24, 36, 60, 100]"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="onPageChange"
              @size-change="onSizeChange"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- ============ 在线工具悬浮框 ============ -->
    <div class="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <Transition name="tools-pop">
        <div v-if="toolsOpen" class="w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">在线工具</h3>
            <button class="text-slate-400 transition hover:text-slate-600" @click="closeTools">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              v-for="tool in onlineTools"
              :key="tool.label"
              class="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 text-center transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
              @click="onToolClick(tool)"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-xl" :style="{ background: tool.bg, color: tool.color }">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <template v-if="tool.icon === 'school'"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3L2 8l10 5 10-5-10-5zM6 11v5c0 1 3 3 6 3s6-2 6-3v-5" /></template>
                  <template v-else-if="tool.icon === 'edit'"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4h7M4 20l4-1 9.5-9.5a2 2 0 00-3-3L5 16l-1 4z" /></template>
                  <template v-else-if="tool.icon === 'book'"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a2 2 0 012-2h6v16H6a2 2 0 00-2 2V5zM20 5a2 2 0 00-2-2h-6v16h6a2 2 0 012 2V5z" /></template>
                  <template v-else-if="tool.icon === 'briefcase'"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8h18v11H3V8zM8 8V5a2 2 0 012-2h4a2 2 0 012 2v3" /></template>
                  <template v-else-if="tool.icon === 'work'"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l9 5 9-5M3 8v8l9 5 9-5V8M3 8l9-5 9 5" /></template>
                  <template v-else-if="tool.icon === 'ai'"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5l-2 2m-5 5l-2 2m9 0l-2-2m-5-5l-2-2M12 8a4 4 0 100 8 4 4 0 000-8z" /></template>
                  <template v-else><path stroke-linecap="round" stroke-linejoin="round" d="M12 11a3 3 0 100-6 3 3 0 000 6zM5 20a7 7 0 0114 0" /></template>
                </svg>
              </span>
              <span class="text-xs font-medium text-slate-600">{{ tool.label }}</span>
            </button>
          </div>
        </div>
      </Transition>

      <button
        class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-300/50 transition hover:scale-105 active:scale-95"
        title="在线工具"
        @click="toggleTools"
      >
        <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2-2 2.5-2.5z" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hf-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.28s cubic-bezier(0.32, 0.72, 0, 1), border-color 0.28s;
}
.hf-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04), 0 12px 28px -4px rgba(249, 115, 22, 0.08);
}

/* 在线工具悬浮面板过渡 */
.tools-pop-enter-active,
.tools-pop-leave-active {
  transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.32, 0.72, 0, 1);
}
.tools-pop-enter-from,
.tools-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}

/* 分页器：当前页品牌橙实心，其余浅灰描边 */
.hf-pager :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #f97316;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
}
.hf-pager :deep(.el-pagination.is-background .el-pager li) {
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
.hf-pager :deep(.el-pagination.is-background .el-pager li.is-active) {
  border-color: #f97316;
}
.hf-pager :deep(.el-pagination .btn-prev),
.hf-pager :deep(.el-pagination .btn-next) {
  background-color: #f8fafc;
  border-radius: 8px;
}
</style>
