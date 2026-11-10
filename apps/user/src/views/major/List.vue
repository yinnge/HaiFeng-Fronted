<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import type { Component } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowRight, ArrowUp, Atom, Award, BookMarked, BookOpen, Boxes, Brain, Briefcase,
  BriefcaseBusiness, ChartNoAxesColumnIncreasing, ChevronsRight, Cog, Coins,
  FileText, GraduationCap, HeartPulse, Landmark, Layers, LayoutGrid, Leaf,
  List as ListIcon, Monitor, Palette, PanelLeftClose, PanelLeftOpen, PenLine,
  RotateCcw, Scale, School, Search, SearchX, Sparkles, Sprout, TrendingUp,
  UserRound, Wrench,
} from 'lucide-vue-next'
import { getMajorList, getMajorCategoryStats, getDegreeAwardedOptions } from '@/api/major'
import type { MajorListVO, MajorCategoryStatVO, MajorQueryDTO } from '@/types/major'
import { Motion } from 'motion-v'
import { useExpertContact } from '@/composables/useExpertContact'
import MajorRateRing from './components/MajorRateRing.vue'

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
const degreeOptions = ref<string[]>([])
/** 左侧筛选栏收起态；<lg 单列场景由 CSS 强制展开，见 .major-layout / .filter-rail */
const filterCollapsed = ref(false)

/* ---------- 学科门类语义图标（lucide） ---------- */
const CATEGORY_ICONS: Record<string, Component> = {
  工学: Cog,
  理学: Atom,
  文学: BookOpen,
  管理学: ChartNoAxesColumnIncreasing,
  艺术学: Palette,
  经济学: TrendingUp,
  法学: Scale,
  教育学: GraduationCap,
  医学: HeartPulse,
  农学: Sprout,
  历史学: Landmark,
  哲学: Brain,
}
function categoryIcon(cat?: string): Component {
  return CATEGORY_ICONS[cat || ''] || GraduationCap
}

/** 卡片图标按专业名细分，避免同门类所有卡片长得一样；未命中回退到门类图标 */
const MAJOR_ICON_RULES: Array<[RegExp, Component]> = [
  [/计算机|软件|数据科学|人工智能|网络空间|信息安全|物联网|数字媒体|智能科学/, Monitor],
  [/电子|通信|微电子|集成电路|光电|自动化|电气/, Cog],
  [/医学|临床|口腔|护理|药学|中医|预防医学/, HeartPulse],
  [/生物|化学|材料|物理|数学|统计|地理科学/, Atom],
  [/农学|园艺|植物|动物|林学|食品|种子/, Sprout],
  [/法学|知识产权|监狱学/, Scale],
  [/艺术|设计|音乐|美术|戏剧|影视|动画|书法/, Palette],
  [/金融|经济|会计|财政|贸易|工商|审计/, TrendingUp],
  [/环境|生态|土木|水利|建筑|城乡|风景园林/, Leaf],
  [/教育|师范|心理|体育|学前/, GraduationCap],
  [/语言|文学|新闻|传播|汉语|英语|翻译/, BookOpen],
  [/管理|行政|公共|物流|旅游|电子商务/, BriefcaseBusiness],
  [/历史|考古|文物|哲学|宗教/, Landmark],
  [/机械|车辆|航空|航天|能源|矿业|冶金/, Wrench],
]
function majorIcon(item: MajorListVO): Component {
  const text = `${item.majorName || ''}${item.parentCategory || ''}`
  for (const [pattern, icon] of MAJOR_ICON_RULES) {
    if (pattern.test(text)) return icon
  }
  return categoryIcon(item.majorCategory)
}

/* 筛选状态（UI 层），提交时映射到 query */
const filter = reactive({
  name: '',
  majorCategory: '',
  degreeAwarded: '',
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
  艺术学: { bg: '#FFF1F2', text: '#E11D48' },
  经济学: { bg: '#ECFDF5', text: '#059669' },
  法学: { bg: '#EFF6FF', text: '#2563EB' },
  教育学: { bg: '#FFF7ED', text: '#F97316' },
  医学: { bg: '#ECFDF5', text: '#059669' },
  农学: { bg: '#ECFDF5', text: '#059669' },
  历史学: { bg: '#FFFBEB', text: '#D97706' },
  哲学: { bg: '#EFF6FF', text: '#2563EB' },
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
/* ---------- 薪资友好渲染 ---------- */
function salaryText(min?: number | null, max?: number | null): string {
  if (!min && !max) return '薪资数据待公布'
  if (min && !max) return `${min.toLocaleString()} 起`
  if (!min && max) return `${max.toLocaleString()} 以内`
  return `${min!.toLocaleString()} - ${max!.toLocaleString()}`
}
/** 卡片指标区专用：去掉分隔符两侧空格，给 4~5 位数的薪资留出完整展示宽度；表格仍用 salaryText */
function salaryCompact(item: MajorListVO): string {
  return salaryText(item.salaryMin, item.salaryMax).replace(' - ', '-')
}

/* ---------- 统计条 ---------- */
const categoryTotal = computed(() => stats.value.reduce((sum, s) => sum + (s.count || 0), 0))
const visibleCategories = computed(() => (showAllCategories.value ? stats.value : stats.value.slice(0, 8)))

/* ===================== 数据请求 ===================== */
/** /list 与 /degree-awarded/options 共用的筛选参数（不含学位自身、不含分页/排序） */
function currentFilterParams() {
  return {
    name: filter.name.trim() || undefined,
    majorType: filter.type === '全部' ? undefined : filter.type,
    majorCategory: filter.majorCategory || undefined,
    employmentRateMin: filter.employmentRateMin ? Number(filter.employmentRateMin) : undefined,
    employmentRateMax: filter.employmentRateMax ? Number(filter.employmentRateMax) : undefined,
    salaryMin: filter.salaryMin ? Number(filter.salaryMin) : undefined,
    salaryMax: filter.salaryMax ? Number(filter.salaryMax) : undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    query.page = currentPage.value
    query.size = pageSize.value
    query.sortBy = sortType.value
    query.sortOrder = 'desc'
    Object.assign(query, currentFilterParams())
    query.degreeAwarded = filter.degreeAwarded || undefined
    const res = await getMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取专业列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 候选学位随其它筛选条件联动。刻意剔除 degreeAwarded 自身：
 * 后端 options 与 /list 共用 wrapper，带上自身会被 eq 锁死成只剩当前选中项。
 * 同时显式带合法分页（后端继承 BasePageQueryDTO，size 需落在 [10,100]）。
 */
async function fetchDegreeOptions() {
  try {
    const params: MajorQueryDTO = { page: 1, size: 12, ...currentFilterParams() }
    const res = await getDegreeAwardedOptions(params)
    degreeOptions.value = res.data.data || []
  } catch {
    degreeOptions.value = []
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

/** 筛选条件变化时列表与学位候选值一起刷新（排序/翻页不影响候选集合，不调此函数） */
function refresh() {
  fetchList()
  fetchDegreeOptions()
}

/* ===================== 交互 ===================== */
function handleSearch() {
  currentPage.value = 1
  refresh()
}

function handleReset() {
  filter.name = ''
  filter.majorCategory = ''
  filter.degreeAwarded = ''
  filter.type = '本科'
  filter.employmentRateMin = ''
  filter.employmentRateMax = ''
  filter.salaryMin = ''
  filter.salaryMax = ''
  currentPage.value = 1
  refresh()
}

function onTypeChange(type: '全部' | '本科' | '专科') {
  filter.type = type
  currentPage.value = 1
  refresh()
}

function toggleCategory(cat: string) {
  filter.majorCategory = filter.majorCategory === cat ? '' : cat
  currentPage.value = 1
  refresh()
}

function clearCategory() {
  filter.majorCategory = ''
  currentPage.value = 1
  refresh()
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

/* ---------- 在线工具（左侧导航 + 收起态图标 rail） ---------- */
const onlineTools = [
  { label: '院校库查询', icon: 'school', color: '#2563EB', bg: '#EFF6FF', to: '/university' },
  { label: '高考填报志愿', icon: 'edit', color: '#059669', bg: '#ECFDF5', to: '/gaokao' },
  { label: '考研专业查询', icon: 'book', color: '#7C3AED', bg: '#F5F3FF', to: '/postgrad-major' },
  { label: '考公考研', icon: 'briefcase', color: '#D97706', bg: '#FFFBEB', action: 'coming' as const },
  { label: '就业服务', icon: 'work', color: '#E11D48', bg: '#FFF1F2', action: 'coming' as const },
  { label: 'AI智能规划', icon: 'ai', color: '#F97316', bg: '#FFF7ED', action: 'coming' as const },
  { label: '专家一对一指导', icon: 'expert', color: '#0EA5E9', bg: '#E0F2FE', action: 'expert' as const },
]
const TOOL_ICONS: Record<string, Component> = {
  school: School,
  edit: PenLine,
  book: BookOpen,
  briefcase: Briefcase,
  work: Boxes,
  ai: Sparkles,
  expert: UserRound,
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
}

onMounted(() => {
  fetchStats()
  refresh()
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
                <BookOpen :size="24" :stroke-width="1.75" />
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
                  <ChevronsRight :size="14" :stroke-width="1.75" />
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
        class="mb-6 rounded-2xl border border-slate-200/70 bg-[#F8FAFC] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]"
      >
        <div class="mb-3 flex items-center gap-2">
          <h2 class="text-base font-bold text-slate-800">学科门类</h2>
          <span class="text-sm text-slate-400">按门类快速筛选</span>
        </div>
        <div class="cat-bar">
          <button
            class="cat-item"
            :class="!filter.majorCategory ? 'is-active' : ''"
            @click="clearCategory"
          >
            <span class="cat-icon" style="background: #FFF7ED; color: #F97316">
              <GraduationCap :size="19" :stroke-width="1.75" />
            </span>
            <span class="cat-copy">
              <span class="cat-name">全部专业</span>
              <span class="cat-count">{{ categoryTotal }}<ArrowUp :size="10" :stroke-width="2" /></span>
            </span>
          </button>
          <button
            v-for="item in visibleCategories"
            :key="item.majorCategory"
            class="cat-item"
            :class="filter.majorCategory === item.majorCategory ? 'is-active' : ''"
            @click="toggleCategory(item.majorCategory)"
          >
            <span class="cat-icon" :style="{ background: categoryColor(item.majorCategory).bg, color: categoryColor(item.majorCategory).text }">
              <component :is="categoryIcon(item.majorCategory)" :size="19" :stroke-width="1.75" />
            </span>
            <span class="cat-copy">
              <span class="cat-name">{{ item.majorCategory }}</span>
              <span class="cat-count">{{ item.count }}<ArrowUp :size="10" :stroke-width="2" /></span>
            </span>
          </button>
          <button
            v-if="stats.length > 8"
            class="cat-more"
            @click="showAllCategories = !showAllCategories"
          >
            {{ showAllCategories ? '收起' : '查看更多' }}
            <ArrowRight :size="13" :stroke-width="1.75" />
          </button>
        </div>
      </Motion>

      <!-- ============ 两栏布局（左筛选 + 中列表，已移除右栏） ============ -->
      <div class="major-layout" :class="filterCollapsed ? 'is-collapsed' : ''">
        <!-- 左侧筛选栏 -->
        <aside class="relative lg:sticky lg:top-24 lg:self-start">
          <!-- 收起按钮放在 aside（筛选卡外层）右上角，紧贴卡片上边缘，不与卡内「重置」挤在同一行 -->
          <button
            v-if="!filterCollapsed"
            class="collapse-btn hidden lg:inline-flex"
            title="收起筛选条件"
            aria-label="收起筛选条件"
            @click="filterCollapsed = true"
          >
            <PanelLeftClose :size="20" :stroke-width="1.75" />
          </button>
          <div
            class="filter-expanded rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]"
            :class="filterCollapsed ? 'is-hidden' : ''"
          >
            <div class="mb-5 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="inline-block h-4 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500" />
                <h2 class="text-base font-bold text-slate-800">筛选条件</h2>
              </div>
              <button class="mr-10 flex items-center gap-1 text-sm text-slate-400 transition hover:text-orange-700" @click="handleReset">
                <RotateCcw :size="14" :stroke-width="1.75" />
                重置
              </button>
            </div>

            <div class="space-y-5">
              <!-- 专业名称 -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <FileText :size="14" :stroke-width="1.75" class="text-orange-500" />
                  专业名称
                </label>
                <div class="relative">
                  <Search :size="16" :stroke-width="1.75" class="absolute left-3 top-1/2 -mt-2 text-slate-400" />
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
                  <BookMarked :size="14" :stroke-width="1.75" class="text-orange-500" />
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

              <!-- 授予学位（候选值随其它筛选条件联动，默认查全部） -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <Award :size="14" :stroke-width="1.75" class="text-orange-500" />
                  授予学位
                </label>
                <el-select
                  v-model="filter.degreeAwarded"
                  placeholder="全部学位"
                  clearable
                  filterable
                  class="w-full"
                  @change="handleSearch"
                >
                  <el-option v-for="opt in degreeOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </div>

              <!-- 专业类型（原顶部本科/专科目录，移入筛选） -->
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <Layers :size="14" :stroke-width="1.75" class="text-orange-500" />
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
                  <ChartNoAxesColumnIncreasing :size="14" :stroke-width="1.75" class="text-orange-500" />
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
                  <Coins :size="14" :stroke-width="1.75" class="text-orange-500" />
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
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 active:translate-y-px"
                @click="handleSearch"
              >
                <Search :size="16" :stroke-width="1.75" />
                搜索
              </button>
            </div>
          </div>

          <!-- 在线工具：移入左侧，一行一个导航 -->
          <div
            class="filter-expanded mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02),0_4px_20px_-2px_rgba(15,23,42,0.04)]"
            :class="filterCollapsed ? 'is-hidden' : ''"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="inline-block h-3.5 w-1 rounded-full bg-gradient-to-b from-orange-500 to-amber-500" />
              <h3 class="text-sm font-bold text-slate-800">在线工具</h3>
            </div>
            <div class="space-y-1">
              <button
                v-for="tool in onlineTools"
                :key="tool.label"
                class="tool-row"
                @click="onToolClick(tool)"
              >
                <span class="tool-icon" :style="{ background: tool.bg, color: tool.color }">
                  <component :is="TOOL_ICONS[tool.icon]" :size="16" :stroke-width="1.75" />
                </span>
                <span class="tool-label">{{ tool.label }}</span>
                <ArrowRight :size="13" :stroke-width="1.75" class="tool-arrow" />
              </button>
            </div>
          </div>

          <!-- 收起态：1 枚展开/收起 + 7 枚在线工具图标（严格 8 枚） -->
          <div class="filter-rail" :class="filterCollapsed ? 'is-shown' : ''">
            <button class="rail-btn" title="展开筛选条件" aria-label="展开筛选条件" @click="filterCollapsed = false">
              <PanelLeftOpen :size="18" :stroke-width="1.75" />
            </button>
            <button
              v-for="tool in onlineTools"
              :key="tool.label"
              class="rail-btn"
              :title="tool.label"
              :aria-label="tool.label"
              @click="onToolClick(tool)"
            >
              <span class="rail-icon" :style="{ background: tool.bg, color: tool.color }">
                <component :is="TOOL_ICONS[tool.icon]" :size="16" :stroke-width="1.75" />
              </span>
            </button>
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
                  <LayoutGrid :size="16" :stroke-width="1.75" />
                </button>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-full transition"
                  :class="viewMode === 'table' ? 'bg-orange-50 text-orange-500' : 'text-slate-400 hover:text-slate-600'"
                  title="列表视图"
                  @click="viewMode = 'table'"
                >
                  <ListIcon :size="16" :stroke-width="1.75" />
                </button>
              </div>
            </div>
          </div>

          <!-- 卡片视图 -->
          <div v-if="viewMode === 'card'">
            <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="n in 6" :key="n" class="hf-card animate-pulse p-5">
                <div class="flex items-start gap-3">
                  <div class="h-12 w-12 shrink-0 rounded-full bg-slate-100" />
                  <div class="flex-1 space-y-2 pt-1">
                    <div class="h-4 w-3/5 rounded bg-slate-100" />
                    <div class="h-3 w-2/5 rounded bg-slate-50" />
                  </div>
                </div>
                <div class="mt-4 flex gap-1.5">
                  <div class="h-5 w-14 rounded-md bg-slate-50" />
                  <div class="h-5 w-16 rounded-md bg-slate-50" />
                </div>
                <div class="mt-4 flex items-center justify-around border-y border-slate-50 py-4">
                  <div class="h-12 w-12 rounded-full bg-slate-100" />
                  <div class="h-4 w-16 rounded bg-slate-100" />
                  <div class="h-4 w-14 rounded bg-slate-100" />
                  <div class="h-4 w-10 rounded bg-slate-100" />
                </div>
                <div class="mt-3 h-3 w-4/5 rounded bg-slate-50" />
              </div>
            </div>
            <div v-else-if="list.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="item in list"
                :key="item.id"
                class="hf-card group cursor-pointer p-5"
                @click="goDetail(item.id)"
              >
                <!-- 头部：圆形语义图标 + 标题/标签 + 右上查看详情 -->
                <div class="flex items-start gap-3">
                  <span
                    class="major-icon-disc"
                    :style="{ background: categoryColor(item.majorCategory).bg, color: categoryColor(item.majorCategory).text }"
                  >
                    <component :is="majorIcon(item)" :size="24" :stroke-width="1.75" />
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
                  <span class="major-detail">
                    查看详情 <ArrowRight :size="14" :stroke-width="2" />
                  </span>
                </div>

                <div class="mt-3 flex flex-wrap gap-1.5">
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ item.majorCategory }}</span>
                  <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ item.parentCategory }}</span>
                  <span v-if="filter.type !== '全部'" class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ filter.type }}</span>
                </div>

                <!-- 指标区：宽卡一行 4 格，窄卡自动 2×2 -->
                <div class="major-metrics">
                  <div class="metric-cell metric-cell--ring">
                    <MajorRateRing :rate="item.employmentRate" :size="52" :stroke="5" />
                    <span class="metric-label">就业率</span>
                  </div>
                  <div class="metric-cell">
                    <span class="metric-value">{{ salaryCompact(item) }}</span>
                    <span class="metric-label">薪资范围（月薪）</span>
                  </div>
                  <div class="metric-cell">
                    <span class="metric-value">{{ item.degreeAwarded || '—' }}</span>
                    <span class="metric-label">授予学位</span>
                  </div>
                  <div class="metric-cell">
                    <span class="metric-value">{{ item.studyDuration || '—' }}</span>
                    <span class="metric-label">学制</span>
                  </div>
                </div>

                <p class="mt-3 truncate text-sm text-slate-500">{{ item.description || '暂无简介' }}</p>
              </article>
            </div>
            <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <SearchX :size="28" :stroke-width="1.5" />
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
                      <span class="font-medium text-orange-700 hover:text-orange-800">查看详情</span>
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

/* ============ 学科门类筛选条：冷灰底容器 + 透明按钮靠色块分区 ============ */
.cat-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.cat-item {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02);
  text-align: left;
  transition: background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}
.cat-item:hover {
  border-color: rgba(249, 115, 22, 0.24);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
}
.cat-item.is-active {
  background: #fff7ed;
  border-color: rgba(249, 115, 22, 0.24);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.08);
}
.cat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 50%;
}
.cat-copy {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.cat-name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: #334155;
  white-space: nowrap;
}
.cat-item.is-active .cat-name {
  color: #c2410c;
}
.cat-count {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  line-height: 1.3;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}
.cat-item.is-active .cat-count {
  color: #c2410c;
}
.cat-more {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  color: #c2410c;
  border-radius: 10px;
  transition: color 0.22s ease, background-color 0.22s ease;
}
.cat-more:hover {
  color: #9a3412;
  background: #ffffff;
}

/* ============ 专业卡片：原型指标栅格 ============ */
/* 按卡片自身宽度响应，而非视口断点；稳态零 transform / 零 filter */
.hf-card {
  container-type: inline-size;
}
.major-icon-disc {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 50%;
}
.major-detail {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: none;
  margin-top: 2px;
  /* 白底上的品牌橙 #f97316 只有 2.80:1（WCAG AA 小字需 4.5:1），
     12px 细笔画被抗锯齿吃成灰雾 → 观感发毛。字重封顶后 500 命中
     Regular 字形、笔画更细，问题显形。改用 orange-700/800
     （5.18:1 / 7.31:1），字号取整提到 13px；刻意不加粗，
     避免破坏刚定下的全站字重克制。 */
  font-size: 13px;
  font-weight: 500;
  color: #c2410c;
  white-space: nowrap;
  transition: color 0.22s ease;
}
.group:hover .major-detail {
  color: #9a3412;
}
.major-metrics {
  display: grid;
  /* 非等宽：学制只有两字，压到 44px，腾出的宽度优先给 4~5 位数薪资，剩余给学位 */
  grid-template-columns: 60px minmax(0, 1.9fr) minmax(0, 1.1fr) 44px;
  margin-top: 16px;
  padding: 14px 0 12px;
  border-top: 1px solid rgba(15, 23, 42, 0.05);
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}
.metric-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 0;
  padding: 0 4px;
  text-align: center;
  border-right: 1px solid rgba(15, 23, 42, 0.05);
}
.metric-cell:last-child {
  padding: 0;
  border-right: 0;
}
.metric-cell--ring {
  gap: 4px;
}
.metric-value {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: #334155;
  font-variant-numeric: tabular-nums;
}
.metric-label {
  font-size: 11px;
  line-height: 1.4;
  color: #94a3b8;
  white-space: nowrap;
}
/* 卡片变窄时自动退化为 2×2，避免 4 格挤成一行 */
@container (max-width: 340px) {
  .major-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 14px;
  }
  .metric-cell:nth-child(2) {
    border-right: 0;
  }
  .metric-cell:nth-child(-n + 2) {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  }
}

/* ============ 左栏收起 / 展开 ============ */
/* 只过渡 grid 列宽（重排，不是合成层），稳态不写 transform / filter，避免文字毛边 */
.major-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
  transition: grid-template-columns 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.major-layout.is-collapsed {
  grid-template-columns: 56px minmax(0, 1fr);
}
/* <lg 本来就是单列，收起态不该出现：强制展开、rail 永不显示 */
@media (max-width: 1023px) {
  .major-layout,
  .major-layout.is-collapsed {
    grid-template-columns: minmax(0, 1fr);
  }
}
.filter-rail {
  display: none;
}
@media (min-width: 1024px) {
  .filter-expanded.is-hidden {
    display: none;
  }
  .filter-rail.is-shown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    border: 1px solid rgba(15, 23, 42, 0.05);
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  }
}
.rail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #64748b;
  transition: background-color 0.22s ease, color 0.22s ease;
}
.rail-btn:hover {
  background: #fff7ed;
  color: #c2410c;
}
/* 第一枚（展开/收起）与 7 枚工具图标之间只靠留白分组，不额外加装饰元素 */
.rail-btn:first-child {
  margin-bottom: 8px;
}
.rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
/* 相对 aside 定位：紧贴筛选卡右上角、只探出 6px。
   探出过多会悬在上方门类条与卡片之间的空隙里，视觉上上下都不靠、显得孤立。 */
.collapse-btn {
  position: absolute;
  top: -6px;
  right: 12px;
  z-index: 2;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  color: #c2410c;
  transition: background-color 0.22s ease, color 0.22s ease, box-shadow 0.22s ease;
}
.collapse-btn:hover {
  background: #fff7ed;
  color: #9a3412;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.16);
}

/* ============ 左侧在线工具：一行一个导航 ============ */
.tool-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border-radius: 10px;
  text-align: left;
  transition: background-color 0.22s ease;
}
.tool-row:hover {
  background: #fff7ed;
}
.tool-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 9px;
}
.tool-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  transition: color 0.22s ease;
}
.tool-arrow {
  flex: none;
  color: #cbd5e1;
  transition: color 0.22s ease;
}
.tool-row:hover .tool-label,
.tool-row:hover .tool-arrow {
  color: #c2410c;
}
</style>
