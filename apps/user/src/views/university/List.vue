<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUniversityList, getUniversityStats, getSpecialChannelOptions } from '@/api/university'
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityStatsVO,
  ChannelOptionVO,
} from '@/types/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'

const router = useRouter()

// ==================== 会话级状态持久化 ====================
// 保存/恢复查询条件与页码，从详情页返回时继续上次浏览位置
const STATE_KEY = 'hf_university_list_state'

interface ListState {
  name: string
  provinceName: string
  nature: string
  category: string
  educationLevel: string
  channelCode: string
  selectedTags: string[]
  currentPage: number
  pageSize: number
}

function saveState() {
  try {
    const state: ListState = {
      name: query.name,
      provinceName: query.provinceName,
      nature: query.nature,
      category: query.category,
      educationLevel: query.educationLevel,
      channelCode: query.channelCode,
      selectedTags: selectedTags.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    }
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // 存储异常（如隐私模式）静默忽略，不影响列表功能
  }
}

function restoreState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY)
    if (!raw) return
    const state = JSON.parse(raw) as Partial<ListState>
    query.name = state.name ?? ''
    query.provinceName = state.provinceName ?? ''
    query.nature = state.nature ?? ''
    query.category = state.category ?? ''
    query.educationLevel = state.educationLevel ?? ''
    query.channelCode = state.channelCode ?? ''
    selectedTags.value = Array.isArray(state.selectedTags) ? state.selectedTags : []
    if (typeof state.currentPage === 'number' && state.currentPage >= 1) {
      currentPage.value = state.currentPage
    }
    if (typeof state.pageSize === 'number' && state.pageSize >= 10) {
      pageSize.value = state.pageSize
    }
  } catch {
    sessionStorage.removeItem(STATE_KEY)
  }
}

// ==================== 列表状态 ====================
const loading = ref(false)
const list = ref<UniversityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive({
  name: '',
  provinceName: '',
  nature: '',
  category: '',
  educationLevel: '',
  channelCode: '',
})

/** 热门标签多选（985/211/双一流），查询时逗号拼接传 tags */
const selectedTags = ref<string[]>([])

// ==================== 下拉与热门筛选数据源 ====================
const natureOptions = ['公办', '民办', '中外合作']

// value 与 DB category 裸值一致（不带"类"后缀），label 展示带"类"
const categoryOptions = [
  { value: '综合', label: '综合类' },
  { value: '理工', label: '理工类' },
  { value: '师范', label: '师范类' },
  { value: '农林', label: '农林类' },
  { value: '医药', label: '医药类' },
  { value: '政法', label: '政法类' },
  { value: '财经', label: '财经类' },
  { value: '民族', label: '民族类' },
  { value: '语言', label: '语言类' },
  { value: '艺术', label: '艺术类' },
  { value: '体育', label: '体育类' },
]
const educationLevelOptions = ['本科', '专科', '本专兼招']

/** 招生类型下拉（/special-channel-options 动态拉取）；统招选中时不作为查询参数 */
const specialOptions = ref<ChannelOptionVO[]>([])

interface HotTag {
  kind: 'tag' | 'nature' | 'category'
  value: string
  label: string
}

const HOT_TAGS: HotTag[] = [
  { kind: 'tag', value: '985', label: '985' },
  { kind: 'tag', value: '211', label: '211' },
  { kind: 'tag', value: '双一流', label: '双一流' },
  { kind: 'nature', value: '公办', label: '公办' },
  { kind: 'nature', value: '民办', label: '民办' },
  { kind: 'category', value: '综合', label: '综合类' },
  { kind: 'category', value: '理工', label: '理工类' },
  { kind: 'category', value: '师范', label: '师范类' },
  { kind: 'category', value: '医药', label: '医药类' },
  { kind: 'category', value: '财经', label: '财经类' },
]

/** 热门筛选收起/展开：收起时仅展示前 6 个 */
const hotExpanded = ref(true)
const visibleHotTags = computed(() => (hotExpanded.value ? HOT_TAGS : HOT_TAGS.slice(0, 6)))

// ==================== 语义色映射（985=丹霞红 211=晴空蓝 双一流=翡翠绿） ====================
const TAG_COLOR_CLASS: Record<string, string> = {
  '985': 'is-rose',
  '211': 'is-blue',
  '双一流': 'is-emerald',
}

function isHotActive(t: HotTag) {
  if (t.kind === 'tag') return selectedTags.value.includes(t.value)
  if (t.kind === 'nature') return query.nature === t.value
  return query.category === t.value
}

function toggleHotTag(t: HotTag) {
  if (t.kind === 'tag') {
    selectedTags.value = selectedTags.value.includes(t.value)
      ? selectedTags.value.filter((v) => v !== t.value)
      : [...selectedTags.value, t.value]
  } else if (t.kind === 'nature') {
    query.nature = query.nature === t.value ? '' : t.value
  } else {
    query.category = query.category === t.value ? '' : t.value
  }
  handleSearch()
}

function hotPillClass(t: HotTag) {
  if (!isHotActive(t)) return 'hot-pill'
  const color = TAG_COLOR_CLASS[t.value] ?? (t.kind === 'nature' ? 'is-amber' : 'is-blue')
  return `hot-pill hot-on ${color}`
}

function tagPillClass(tag: string) {
  return `tag-pill ${TAG_COLOR_CLASS[tag] ?? 'is-blue'}`
}

// ==================== 防御性渲染工具（统一封装，避免遗漏） ====================
function majorCountText(n?: number | null) {
  return n && n > 0 ? `${n}个专业` : '专业数据整理中'
}

function categoryLabel(c?: string) {
  if (!c) return ''
  return c.endsWith('类') ? c : `${c}类`
}

function visibleTags(item: UniversityListVO) {
  return (item.tags ?? []).slice(0, 3)
}

function extraTagCount(item: UniversityListVO) {
  return Math.max(0, (item.tags?.length ?? 0) - 3)
}

// ==================== 查询 ====================
/** 统招通道不做处理：不作为查询参数（即查全部院校） */
function isUnifiedChannel(code: string) {
  const opt = specialOptions.value.find((o) => o.channelCode === code)
  return !!opt && (opt.channelName === '统招' || opt.channelCode === '统招')
}

async function fetchList() {
  loading.value = true
  try {
    const params: UniversityQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
    }
    if (query.name) params.name = query.name
    if (query.provinceName) params.provinceName = query.provinceName
    if (query.nature) params.nature = query.nature
    if (query.category) params.category = query.category
    if (query.educationLevel) params.educationLevel = query.educationLevel
    if (selectedTags.value.length) params.tags = selectedTags.value.join(',')
    if (query.channelCode && !isUnifiedChannel(query.channelCode)) {
      params.channelCode = query.channelCode
    }

    const res = await getUniversityList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
    saveState()
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院校列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.provinceName = ''
  query.nature = ''
  query.category = ''
  query.educationLevel = ''
  query.channelCode = ''
  selectedTags.value = []
  handleSearch()
}

// ==================== 右侧栏：统计 / 热门推荐（sort_order 前 4） ====================
const stats = ref<UniversityStatsVO | null>(null)
const recommendList = ref<UniversityListVO[]>([])

const statItems = computed(() => [
  { label: '985院校', value: stats.value?.count985, cls: 'stat-rose' },
  { label: '211院校', value: stats.value?.count211, cls: 'stat-blue' },
  { label: '双一流院校', value: stats.value?.countDoubleFirstClass, cls: 'stat-emerald' },
  { label: '本科院校', value: stats.value?.countUndergraduate, cls: 'stat-amber' },
])

async function loadSidebar() {
  // 后端分页 size 下限 10，取前 4 条即可（列表默认 sort_order DESC）
  const [statsRes, recommendRes] = await Promise.allSettled([
    getUniversityStats(),
    getUniversityList({ page: 1, size: 10 }),
  ])
  if (statsRes.status === 'fulfilled') stats.value = statsRes.value.data.data
  if (recommendRes.status === 'fulfilled') {
    recommendList.value = (recommendRes.value.data.data.records ?? []).slice(0, 4)
  }
}

// ==================== 分页 ====================
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const paginationPages = computed(() => {
  const t = totalPages.value
  const c = currentPage.value
  const pages: (number | string)[] = []
  if (t <= 7) {
    for (let i = 1; i <= t; i++) pages.push(i)
  } else {
    pages.push(1)
    if (c > 3) pages.push('...')
    const start = Math.max(2, c - 1)
    const end = Math.min(t - 1, c + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (c < t - 2) pages.push('...')
    pages.push(t)
  }
  return pages
})

function handlePageChange(page: number) {
  currentPage.value = page
  fetchList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

// ==================== 跳转 ====================
function goDetail(id: string) {
  router.push(`/university/${id}`)
}

function goRecommendDetail(id: string) {
  router.push(`/university/${id}`)
}

/** 咨询入口：暂未开放 */
function handleConsult() {
  ElMessage.info('敬请期待')
}

// ==================== 图片加载失败兜底 ====================
const logoErrors = ref<Set<string>>(new Set())
const coverErrors = ref<Set<string>>(new Set())

function handleLogoError(id: string) {
  if (!logoErrors.value.has(id)) {
    logoErrors.value = new Set([...logoErrors.value, id])
  }
}

function handleCoverError(id: string) {
  if (!coverErrors.value.has(id)) {
    coverErrors.value = new Set([...coverErrors.value, id])
  }
}

// ==================== Hero 背景（动态 base，兼容生产路径） ====================
const heroBg = encodeURI(`${import.meta.env.BASE_URL}picture/university/列表背景.png`)
const heroStyle = computed(() => ({
  backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 32%, rgba(255,255,255,0.35) 62%, rgba(255,255,255,0.05) 100%), url('${heroBg}')`,
}))

onMounted(async () => {
  restoreState()
  // 先拉招生类型选项（保证恢复的"统招"选中态在首次查询时被正确过滤）
  try {
    const res = await getSpecialChannelOptions()
    specialOptions.value = res.data.data ?? []
  } catch {
    // 选项加载失败不阻塞列表，仅下拉为空
  }
  fetchList()
  loadSidebar()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div class="univ-page-flow">
        <!-- ==================== Hero 横幅 + 集成搜索筛选卡 ==================== -->
        <section class="hero-banner rounded-[20px] px-6 sm:px-10 pt-9 pb-8" :style="heroStyle">
          <!-- 顶部徽章 -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full text-white text-xs font-bold px-3.5 py-1.5 shadow-[0_2px_10px_rgba(249,115,22,0.35)]"
            style="background: linear-gradient(90deg, #f97316, #fb923c)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            院校库
          </span>

          <!-- 主标题 -->
          <h1 class="mt-3 text-[26px] sm:text-[30px] leading-tight font-extrabold text-[#0f172a] tracking-tight">
            院校库 · <span class="text-[#2563eb]">探索理想的未来</span>
          </h1>
          <p class="mt-2 text-sm text-[#475569]">
            汇聚全国优质中学与高等院校信息，全面了解学校特色、专业优势与报考指南。
          </p>

          <!-- 集成式搜索筛选卡 -->
          <div class="mt-6 bg-white rounded-2xl p-4 sm:p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-white">
            <!-- 第一行：筛选控件 + 搜索按钮 -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="relative flex-1 min-w-[190px]">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="query.name"
                  type="text"
                  placeholder="请输入院校名称"
                  class="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 transition-all"
                  @keyup.enter="handleSearch"
                />
              </div>
              <div class="w-[150px]">
                <el-select v-model="query.provinceName" placeholder="所在省份" clearable filterable class="w-full" @change="handleSearch">
                  <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="w-[140px]">
                <el-select v-model="query.category" placeholder="院校类型" clearable filterable class="w-full" @change="handleSearch">
                  <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="w-[130px]">
                <el-select v-model="query.educationLevel" placeholder="办学层次" clearable class="w-full" @change="handleSearch">
                  <el-option v-for="opt in educationLevelOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </div>
              <div class="w-[130px]">
                <el-select v-model="query.nature" placeholder="性质" clearable class="w-full" @change="handleSearch">
                  <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </div>
              <div class="w-[140px]">
                <el-select v-model="query.channelCode" placeholder="招生类型" clearable filterable class="w-full" @change="handleSearch">
                  <el-option
                    v-for="opt in specialOptions"
                    :key="opt.channelCode"
                    :label="opt.channelName"
                    :value="opt.channelCode"
                  />
                </el-select>
              </div>
              <button
                class="btn-search ml-auto inline-flex items-center gap-1.5 px-7 py-2.5 text-sm"
                @click="handleSearch"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索
              </button>
            </div>

            <!-- 第二行：热门筛选标签组 -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-start gap-3">
              <span class="shrink-0 pt-[5px] text-xs font-semibold text-gray-400">热门筛选：</span>
              <div class="flex-1 flex flex-wrap gap-2">
                <button
                  v-for="t in visibleHotTags"
                  :key="`${t.kind}-${t.value}`"
                  :class="hotPillClass(t)"
                  @click="toggleHotTag(t)"
                >
                  {{ t.label }}
                </button>
              </div>
              <div class="shrink-0 flex items-center gap-3 pt-[3px]">
                <button
                  class="text-xs font-medium text-gray-400 hover:text-[#f97316] transition-colors"
                  @click="handleReset"
                >
                  重置
                </button>
                <button
                  class="inline-flex items-center gap-0.5 text-xs font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                  @click="hotExpanded = !hotExpanded"
                >
                  {{ hotExpanded ? '收起' : '展开' }}
                  <svg
                    class="w-3 h-3 transition-transform duration-200"
                    :class="hotExpanded ? 'rotate-180' : ''"
                    fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ==================== 筛选结果统计工具栏 ==================== -->
        <div class="mt-7 mb-5 flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-[10px] bg-[#fff7ed] flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-[#f97316]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <p class="text-[15px] text-[#334155]">
            共 <span class="font-extrabold text-[#f97316] text-lg">{{ total }}</span> 所院校
          </p>
        </div>

        <!-- ==================== 主体：卡片网格 + 右侧栏 ==================== -->
        <div class="flex flex-col lg:flex-row gap-6 items-start">
          <!-- 左侧主列表 -->
          <div class="flex-1 min-w-0 w-full">
            <!-- 骨架屏 -->
            <div v-if="loading && list.length === 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div v-for="i in 6" :key="i" class="univ-card !cursor-default">
                <div class="h-[120px] skeleton rounded-none" />
                <div class="px-4 pb-4 pt-9 relative">
                  <div class="absolute -top-6 left-4 w-12 h-12 rounded-full skeleton" />
                  <div class="h-5 skeleton w-28 rounded" />
                  <div class="flex gap-1.5 mt-3">
                    <div class="h-4 skeleton w-10 rounded-full" />
                    <div class="h-4 skeleton w-12 rounded-full" />
                    <div class="h-4 skeleton w-14 rounded-full" />
                  </div>
                  <div class="h-3 skeleton w-full rounded mt-4" />
                  <div class="h-3 skeleton w-3/4 rounded mt-2" />
                </div>
              </div>
            </div>

            <!-- 卡片网格 -->
            <div v-else-if="list.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <TransitionGroup name="list">
                <article
                  v-for="(item, index) in list"
                  :key="item.id"
                  class="group univ-card"
                  :style="{ animationDelay: `${index * 60}ms` }"
                  @click="goDetail(item.id)"
                >
                  <!-- ① 封面图区 -->
                  <div class="relative h-[120px] overflow-hidden">
                    <img
                      v-if="item.coverImage && !coverErrors.has(item.id)"
                      :src="item.coverImage"
                      :alt="item.name"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      @error="handleCoverError(item.id)"
                    />
                    <div v-else class="h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50" />
                    <!-- 左上角权威标签角标 -->
                    <span v-if="item.tags?.length" class="cover-badge absolute top-3 left-3">
                      {{ item.tags[0] }}
                    </span>
                    <!-- 右上角性质胶囊 -->
                    <span v-if="item.nature" class="nature-pill absolute top-3 right-3">
                      {{ item.nature }}
                    </span>
                  </div>

                  <!-- ② 内容信息区 -->
                  <div class="relative px-4 pt-9 pb-4">
                    <!-- 骑缝 logo -->
                    <div
                      class="absolute -top-7 left-4 w-14 h-14 rounded-full bg-white border-[3px] border-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] overflow-hidden flex items-center justify-center"
                    >
                      <img
                        v-if="item.imageUrl && !logoErrors.has(item.id)"
                        :src="item.imageUrl"
                        :alt="item.name"
                        class="h-full w-full object-contain"
                        @error="handleLogoError(item.id)"
                      />
                      <span v-else class="text-gray-300 text-xl font-bold">{{ item.name.charAt(0) }}</span>
                    </div>

                    <!-- 名称 -->
                    <h3 class="text-[16px] font-bold text-[#1e293b] truncate pr-2">{{ item.name }}</h3>

                    <!-- 标签行：tags 前 3 + "+N" + 类别 -->
                    <div class="flex flex-wrap items-center gap-1.5 mt-2 min-h-[22px]">
                      <span v-for="tag in visibleTags(item)" :key="tag" :class="tagPillClass(tag)">
                        {{ tag }}
                      </span>
                      <span v-if="extraTagCount(item) > 0" class="tag-pill is-neutral">+{{ extraTagCount(item) }}</span>
                      <span v-if="item.category" class="tag-pill is-blue">{{ categoryLabel(item.category) }}</span>
                    </div>

                    <!-- 位置与层次信息行 -->
                    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-[#64748b]">
                      <span class="inline-flex items-center gap-1 min-w-0">
                        <svg class="w-3.5 h-3.5 shrink-0 text-[#94a3b8]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="truncate">{{ item.provinceName }} · {{ item.cityName }}</span>
                      </span>
                      <span v-if="item.educationLevel" class="inline-flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 shrink-0 text-[#94a3b8]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        {{ item.educationLevel }}
                      </span>
                      <span class="inline-flex items-center gap-1">
                        <svg class="w-3.5 h-3.5 shrink-0 text-[#94a3b8]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {{ majorCountText(item.majorCount) }}
                      </span>
                    </div>

                    <!-- 简介描述 -->
                    <p v-if="item.content" class="clamp-2 mt-2.5 text-xs leading-relaxed text-[#94a3b8]">
                      {{ item.content }}
                    </p>

                    <!-- 底部操作区：查看详情 -->
                    <div class="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end">
                      <span
                        class="detail-link inline-flex items-center gap-1 text-[13px] font-semibold text-[#334155] transition-all duration-200 group-hover:text-[#f97316] group-hover:translate-x-0.5"
                      >
                        查看详情
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              </TransitionGroup>
            </div>

            <!-- 空状态 -->
            <div v-else class="univ-card !cursor-default text-center py-20">
              <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#fff7ed] flex items-center justify-center">
                <svg class="w-10 h-10 text-[#f97316]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-700 mb-2">暂无匹配的院校</h3>
              <p class="text-sm text-gray-500">请调整筛选条件或检查搜索关键词</p>
            </div>

            <!-- 自定义分页 -->
            <div v-if="total > pageSize" class="mt-8 flex justify-center">
              <div class="inline-flex items-center gap-1 univ-card !cursor-default p-1.5">
                <button
                  class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                  :class="currentPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-[#f97316]/10 hover:text-[#f97316]'"
                  :disabled="currentPage <= 1"
                  @click="handlePageChange(currentPage - 1)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <template v-for="p in paginationPages" :key="p">
                  <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                  <button
                    v-else
                    class="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200"
                    :class="p === currentPage
                      ? 'pager-active'
                      : 'text-gray-600 hover:bg-[#f97316]/10 hover:text-[#f97316]'"
                    @click="handlePageChange(p as number)"
                  >
                    {{ p }}
                  </button>
                </template>

                <button
                  class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                  :class="currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-[#f97316]/10 hover:text-[#f97316]'"
                  :disabled="currentPage >= totalPages"
                  @click="handlePageChange(currentPage + 1)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div class="w-px h-6 bg-gray-200 mx-1" />

                <div class="flex items-center gap-2 px-3">
                  <span class="text-sm text-gray-500">每页</span>
                  <select
                    v-model="pageSize"
                    class="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] transition-all"
                    @change="handleSizeChange(pageSize)"
                  >
                    <option :value="12">12</option>
                    <option :value="24">24</option>
                    <option :value="36">36</option>
                  </select>
                  <span class="text-sm text-gray-500">条</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== 右侧栏 ==================== -->
          <aside class="w-full lg:w-[290px] shrink-0 space-y-5">
            <!-- 院校数据概览 -->
            <div class="side-card p-5">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-4 h-4 text-[#f97316]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="text-[15px] font-bold text-[#1e293b]">院校数据概览</h3>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="s in statItems" :key="s.label" class="stat-item" :class="s.cls">
                  <span class="stat-num">{{ s.value ?? '—' }}</span>
                  <span class="stat-unit">所</span>
                  <span class="stat-label">{{ s.label }}</span>
                </div>
              </div>
            </div>

            <!-- 热门院校推荐（sort_order 前 4） -->
            <div class="side-card p-5">
              <div class="flex items-center gap-2 mb-4">
                <svg class="w-4 h-4 text-[#e11d48]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                <h3 class="text-[15px] font-bold text-[#1e293b]">热门院校推荐</h3>
              </div>
              <div v-if="recommendList.length" class="space-y-3">
                <button
                  v-for="rec in recommendList"
                  :key="rec.id"
                  class="w-full flex items-center gap-3 p-2 -mx-2 rounded-xl text-left transition-colors duration-200 hover:bg-[#fff7ed] group/rec"
                  @click="goRecommendDetail(rec.id)"
                >
                  <div class="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      v-if="rec.imageUrl && !logoErrors.has(`rec-${rec.id}`)"
                      :src="rec.imageUrl"
                      :alt="rec.name"
                      class="h-full w-full object-contain"
                      @error="handleLogoError(`rec-${rec.id}`)"
                    />
                    <span v-else class="text-gray-300 text-sm font-bold">{{ rec.name.charAt(0) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-[#1e293b] truncate group-hover/rec:text-[#f97316] transition-colors">
                      {{ rec.name }}
                    </p>
                    <div class="flex flex-wrap items-center gap-1 mt-1">
                      <span
                        v-for="tag in (rec.tags ?? []).slice(0, 2)"
                        :key="tag"
                        class="tag-pill !text-[10px] !px-1.5 !py-0"
                        :class="tagPillClass(tag)"
                      >
                        {{ tag }}
                      </span>
                      <span v-if="rec.category" class="text-[11px] text-[#94a3b8]">{{ categoryLabel(rec.category) }}</span>
                    </div>
                  </div>
                  <svg class="w-3.5 h-3.5 text-gray-300 group-hover/rec:text-[#f97316] transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p v-else class="text-xs text-gray-400 py-4 text-center">推荐数据加载中…</p>
            </div>

            <!-- 咨询引导卡 -->
            <div class="consult-card rounded-2xl p-5 text-center overflow-hidden relative">
              <div class="w-12 h-12 mx-auto rounded-full bg-white/80 shadow-sm flex items-center justify-center">
                <svg class="w-6 h-6 text-[#f97316]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 class="mt-3 text-[15px] font-bold text-[#1e293b]">想了解更多院校信息？</h3>
              <p class="mt-1 text-xs text-[#64748b]">专业规划师为你答疑解惑</p>
              <button
                class="btn-search mt-4 px-6 py-2 text-sm w-full justify-center inline-flex items-center gap-1.5"
                @click="handleConsult"
              >
                前往咨询
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ===== 页面流容器：main 直接子元素被全局规则强制透明（透出暖橙画布），卡片全部放在内层 ===== */
.univ-page-flow {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* ===== Hero 横幅：背景图 + 左侧白色渐变遮罩保证文字可读 ===== */
.hero-banner {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 8px 30px -8px rgba(15, 23, 42, 0.12);
}

/* ===== 通用白卡（列表卡 / 侧栏卡 / 分页容器） ===== */
.univ-card,
.side-card {
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
  transition: all 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.side-card {
  border-radius: 18px;
}

/* 可点击院校卡片 hover：上浮 + 淡橙光晕边 */
.univ-card {
  overflow: hidden;
  cursor: pointer;
}
.univ-card:hover {
  transform: translateY(-3px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 12px 28px -4px rgba(249, 115, 22, 0.08);
}

/* ===== 封面角标 / 性质胶囊 ===== */
.cover-badge {
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}
.nature-pill {
  padding: 2px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  background: rgba(255, 251, 235, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* ===== 语义色标签胶囊（985=丹霞红 211=晴空蓝 双一流=翡翠绿 性质=向日葵黄 类别=晴空蓝） ===== */
.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}
.is-rose {
  color: #e11d48;
  background: #fff1f2;
  border: 1px solid rgba(225, 29, 72, 0.18);
}
.is-blue {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.18);
}
.is-emerald {
  color: #059669;
  background: #ecfdf5;
  border: 1px solid rgba(5, 150, 105, 0.18);
}
.is-amber {
  color: #b45309;
  background: #fffbeb;
  border: 1px solid rgba(245, 158, 11, 0.22);
}
.is-neutral {
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid transparent;
}

/* ===== 热门筛选胶囊 ===== */
.hot-pill {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.hot-pill:hover:not(.hot-on) {
  color: #ea580c;
  background: #fff7ed;
}
.hot-pill.hot-on {
  font-weight: 700;
}

/* ===== 统计卡（右侧栏） ===== */
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px 10px;
  border-radius: 12px;
  border: 1px solid transparent;
}
.stat-rose {
  background: #fff1f2;
}
.stat-blue {
  background: #eff6ff;
}
.stat-emerald {
  background: #ecfdf5;
}
.stat-amber {
  background: #fffbeb;
}
.stat-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.stat-rose .stat-num {
  color: #e11d48;
}
.stat-blue .stat-num {
  color: #2563eb;
}
.stat-emerald .stat-num {
  color: #059669;
}
.stat-amber .stat-num {
  color: #d97706;
}
.stat-unit {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  margin-top: 4px;
}

/* ===== 咨询引导卡 ===== */
.consult-card {
  background: linear-gradient(160deg, #fff7ed 0%, #ffedd5 60%, #fed7aa 100%) !important;
  border: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 4px 20px -2px rgba(249, 115, 22, 0.08);
}

/* ===== 搜索按钮 ===== */
.btn-search {
  border: none;
  border-radius: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
  transition: all 0.2s ease;
  cursor: pointer;
}
.btn-search:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(249, 115, 22, 0.4);
}
.btn-search:active {
  transform: translateY(0) scale(0.98);
}

/* ===== 分页当前页 ===== */
.pager-active {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
}

/* ===== 简介 2 行截断 ===== */
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

/* ===== 骨架屏圆角覆写（沿用全局 skeleton 类） ===== */
.skeleton {
  border-radius: 8px;
}

/* ===== 列表过渡动画 ===== */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
