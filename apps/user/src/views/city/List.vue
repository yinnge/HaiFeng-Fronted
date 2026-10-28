<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getCityList, getCityStats, getCityRank } from '@/api/city'
import type { CityListVO, CityQueryDTO, CityStatsVO, CityRankItem } from '@/types/city'
import { ProvinceOptions } from '@haifeng/shared'
import { Motion } from 'motion-v'

const router = useRouter()

// Hero 背景图（资源统一走 public + 动态 BASE_URL，禁止硬编码 localhost）
const heroBg = import.meta.env.BASE_URL + 'picture/city/city-hero.png'

/* ============ 左栏：城市列表 ============ */
const loading = ref(false)
const error = ref<string | null>(null)
const list = ref<CityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive<CityQueryDTO>({
  page: 1,
  size: 12,
  cityName: '',
  province: '',
  region: '',
  sortBy: '',
})

const regionTabs = ['华北', '华东', '华南', '华中', '东北', '西南', '西北', '港澳台']

const sortOptions = [
  { label: '默认排序', value: '' },
  { label: '高校数量', value: 'college' },
  { label: '重点院校', value: 'keyCollege' },
  { label: 'GDP', value: 'gdp' },
  { label: '人口', value: 'population' },
]

const isFiltering = computed(
  () => !!query.cityName || !!query.province || !!query.region || !!query.sortBy,
)

async function fetchList() {
  loading.value = true
  error.value = null
  try {
    const params: CityQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
      cityName: query.cityName || undefined,
      province: query.province || undefined,
      region: query.region || undefined,
      sortBy: query.sortBy || undefined,
    }
    const res = await getCityList(params)
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } catch (e: any) {
    error.value = e?.message || '获取城市列表失败'
    list.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}
function handleReset() {
  query.cityName = ''
  query.province = ''
  query.region = ''
  query.sortBy = ''
  currentPage.value = 1
  fetchList()
}
function selectRegion(region: string) {
  query.region = query.region === region ? '' : region
  currentPage.value = 1
  fetchList()
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
function goDetail(id: string) {
  router.push(`/city/${id}`)
}

/* ============ 右栏：数据概览 ============ */
const statsLoading = ref(false)
const statsError = ref(false)
const stats = ref<CityStatsVO | null>(null)

async function fetchStats() {
  statsLoading.value = true
  statsError.value = false
  try {
    const res = await getCityStats()
    stats.value = res.data.data ?? null
  } catch {
    statsError.value = true
  } finally {
    statsLoading.value = false
  }
}

/* ============ 右栏：排行榜 ============ */
type RankMetric = 'college' | 'keyCollege' | 'gdp' | 'population'
const rankTabs = [
  { label: '高校数量', metric: 'college' as RankMetric },
  { label: '重点院校', metric: 'keyCollege' as RankMetric },
  { label: 'GDP排名', metric: 'gdp' as RankMetric },
  { label: '人口排名', metric: 'population' as RankMetric },
]
const activeMetric = ref<RankMetric>('college')
const rankLoading = ref(false)
const rankError = ref(false)
const rankList = ref<CityRankItem[]>([])

async function fetchRank(metric: RankMetric = activeMetric.value) {
  activeMetric.value = metric
  rankLoading.value = true
  rankError.value = false
  try {
    const res = await getCityRank({ metric, limit: 5 })
    rankList.value = res.data.data ?? []
  } catch {
    rankError.value = true
    rankList.value = []
  } finally {
    rankLoading.value = false
  }
}

function viewAllByMetric(metric: RankMetric) {
  query.sortBy = metric
  currentPage.value = 1
  fetchList()
}

/* ============ 右栏：快捷工具 ============ */
function onTool(tool: { to?: string; action?: string }) {
  if (tool.to) {
    router.push(tool.to)
  } else if (tool.action === 'modal') {
    ElMessageBox.alert('AI 智能分析功能正在开发中，敬请期待。', '敬请期待', {
      confirmButtonText: '我知道了',
      type: 'info',
    })
  }
}

/* ============ 格式化与样式工具 ============ */
function trimNum(n: number) {
  const r = Math.round(n * 10) / 10
  return Number.isInteger(r) ? r.toString() : r.toFixed(1)
}
function formatUnit(value: number | null | undefined, unit: '万' | '亿元') {
  if (value == null) return null
  if (value >= 10000) {
    return { value: trimNum(value / 10000), unit: unit === '万' ? '亿' : '万亿' }
  }
  return { value: trimNum(value), unit }
}
function popText(value: number | null | undefined, unit: '万' | '亿元') {
  const f = formatUnit(value, unit)
  return f ? `${f.value} ${f.unit}` : ''
}

function levelClass(level?: string | null) {
  switch (level) {
    case '直辖市':
      return 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
    case '省会城市':
      return 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
    case '地级市':
      return 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
    case '县级市':
      return 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
    default:
      return 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
  }
}

function rankBadgeClass(i: number) {
  if (i === 0) return 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
  if (i === 1) return 'bg-gradient-to-br from-slate-300 to-slate-400 text-white'
  if (i === 2) return 'bg-gradient-to-br from-orange-300 to-amber-600 text-white'
  return 'bg-slate-100 text-slate-500'
}

const maxRankValue = computed(() =>
  rankList.value.reduce((m, it) => Math.max(m, it.value || 0), 0),
)

const statBlocks = computed(() => {
  const s = stats.value
  return [
    { label: '全国城市数', data: s?.cityCount != null ? { value: trimNum(s.cityCount), unit: '' } : null, color: 'orange' },
    { label: '全国高校数', data: s?.collegeCount != null ? { value: trimNum(s.collegeCount), unit: '所' } : null, color: 'blue' },
    { label: '全国常住人口', data: formatUnit(s?.residentPopulation, '万'), color: 'emerald' },
    { label: '全国GDP总量', data: formatUnit(s?.gdp, '亿元'), color: 'amber' },
  ]
})

const scenarioPills = [
  { label: '高校资源', color: 'blue' },
  { label: '经济发展', color: 'emerald' },
  { label: '产业结构', color: 'orange' },
  { label: '生活配套', color: 'rose' },
]

const quickTools = [
  { label: '企业查询', color: 'blue', to: '/enterprise' },
  { label: '行业分析', color: 'emerald', to: '/industry' },
  { label: '就业前景', color: 'amber', to: '/employment/civil' },
  { label: 'AI智能分析', color: 'purple', action: 'modal' },
]

const skeletonArray = Array.from({ length: 6 }, (_, i) => i + 1)

onMounted(() => {
  fetchList()
  fetchStats()
  fetchRank('college')
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-4 md:px-6 py-8 flex-1 max-w-7xl">
      <!-- ============ Hero ============ -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }">
        <section
          class="relative min-h-[240px] overflow-hidden rounded-3xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-100 md:min-h-[320px] md:p-10"
          :style="{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'calc(50% + 60px) calc(50% + 70px)',
          }"
        >
          <!-- 蒙版：左白→右透，保证左半文字清晰；底部微压增强对比 -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-white/10"></div>
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent"></div>
          <div class="relative z-10 grid md:grid-cols-12 gap-6 items-center">
            <!-- 左：标题 + 场景入口 -->
            <div class="md:col-span-8 lg:col-span-7">
              <div class="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur">
                <svg class="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                城市库
              </div>
              <h1 class="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
                城市信息大全<span class="text-orange-500">·</span><br class="hidden md:block" />为你的未来选择提供参考
              </h1>
              <p class="mt-3 max-w-xl text-sm md:text-base leading-relaxed text-slate-600">
                城市是高考志愿填报的重要参考维度。查询全国各城市的高等教育资源、经济发展水平、产业结构与生活环境，帮你做出更科学的院校选择。
              </p>
              <div class="mt-6 flex flex-wrap gap-3">
                <span
                  v-for="p in scenarioPills"
                  :key="p.label"
                  class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 transition-transform hover:-translate-y-0.5"
                  :class="{
                    'ring-blue-200': p.color === 'blue',
                    'ring-emerald-200': p.color === 'emerald',
                    'ring-orange-200': p.color === 'orange',
                    'ring-rose-200': p.color === 'rose',
                  }"
                >
                  <span
                    class="inline-flex h-7 w-7 items-center justify-center rounded-lg"
                    :class="{
                      'bg-blue-50 text-blue-600': p.color === 'blue',
                      'bg-emerald-50 text-emerald-600': p.color === 'emerald',
                      'bg-orange-50 text-orange-600': p.color === 'orange',
                      'bg-rose-50 text-rose-600': p.color === 'rose',
                    }"
                  >
                    <!-- 高校资源 -->
                    <svg v-if="p.color === 'blue'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4L3 8l9 4 9-4-9-4zM6 10v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>
                    <!-- 经济发展 -->
                    <svg v-else-if="p.color === 'emerald'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 17l6-6 4 4 7-7M21 8v4h-4"/></svg>
                    <!-- 产业结构 -->
                    <svg v-else-if="p.color === 'orange'" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21V9l6 3V9l6 3V5l6 3v13H3z"/></svg>
                    <!-- 生活配套 -->
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.5-7-9a4 4 0 018 0c0 1.2-.5 2.3-1 3 .5-3 2-4 3-4 1.5 0 2.5 1.5 2.5 3 0 4.5-7 7-7 7z"/></svg>
                  </span>
                  {{ p.label }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </Motion>

      <!-- ============ 搜索筛选区 ============ -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }">
        <section class="mt-6 rounded-2xl bg-white p-5 md:p-6 shadow-sm ring-1 ring-slate-100">
          <div class="flex flex-col gap-4">
            <!-- 第一行 -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="relative min-w-[200px] flex-1">
                <svg class="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input
                  v-model="query.cityName"
                  type="text"
                  placeholder="输入城市名称搜索，如：北京、上海"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  @keyup.enter="handleSearch"
                />
              </div>
              <el-select v-model="query.province" placeholder="省份" clearable filterable class="!w-36">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
              <el-select v-model="query.region" placeholder="地区" clearable class="!w-32">
                <el-option v-for="opt in regionTabs" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <button
                class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-orange-200 transition hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
                @click="handleSearch"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                搜索
              </button>
              <button
                class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700 active:scale-[0.98]"
                @click="handleReset"
              >
                重置
              </button>
            </div>
            <!-- 第二行：地区快捷 Tab（与下拉框双向同步） -->
            <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span class="mr-1 text-sm text-slate-400">地区</span>
              <button
                class="rounded-full px-4 py-1.5 text-sm font-medium transition"
                :class="query.region === '' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="selectRegion('')"
              >
                全部地区
              </button>
              <button
                v-for="r in regionTabs"
                :key="r"
                class="rounded-full px-4 py-1.5 text-sm font-medium transition"
                :class="query.region === r ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="selectRegion(r)"
              >
                {{ r }}
              </button>
            </div>
          </div>
        </section>
      </Motion>

      <!-- ============ 主体：左列表 + 右信息栏 ============ -->
      <div class="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <!-- 左：城市列表 -->
        <section class="lg:col-span-2">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-bold text-slate-800">{{ isFiltering ? '城市列表' : '热门城市推荐' }}</h2>
              <span class="text-sm text-slate-400">共 {{ total }} 个城市</span>
            </div>
            <el-select v-model="query.sortBy" placeholder="默认排序" class="!w-36" @change="handleSearch">
              <el-option v-for="o in sortOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </div>

          <!-- 加载骨架 -->
          <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div v-for="n in skeletonArray" :key="n" class="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
              <div class="shimmer h-32 bg-slate-100"></div>
              <div class="space-y-3 p-4">
                <div class="shimmer h-4 w-1/2 rounded bg-slate-100"></div>
                <div class="shimmer h-3 w-1/3 rounded bg-slate-100"></div>
                <div class="shimmer h-3 w-full rounded bg-slate-100"></div>
              </div>
            </div>
          </div>

          <!-- 错误态 -->
          <div v-else-if="error" class="rounded-2xl bg-white p-10 text-center ring-1 ring-slate-100">
            <p class="text-slate-500">{{ error }}</p>
            <button class="mt-4 rounded-xl bg-orange-500 px-5 py-2 text-sm text-white transition hover:bg-orange-600" @click="fetchList">重新加载</button>
          </div>

          <!-- 空态 -->
          <div v-else-if="!list.length" class="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
            <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
            <p class="mt-3 text-slate-400">没有符合条件的城市，试试调整筛选条件</p>
            <button class="mt-4 rounded-xl border border-slate-200 px-5 py-2 text-sm text-slate-500 transition hover:border-orange-300 hover:text-orange-500" @click="handleReset">清空筛选</button>
          </div>

          <!-- 列表卡片 -->
          <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <article
              v-for="(item, idx) in list"
              :key="item.id"
              class="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-orange-200"
              @click="goDetail(item.id)"
            >
              <!-- 封面 -->
              <div class="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  v-if="item.coverImageUrl"
                  :src="item.coverImageUrl"
                  :alt="item.cityName + '封面'"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-slate-300">
                  <svg class="h-10 w-10" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
                </div>
                <!-- 序号徽标 -->
                <span class="absolute -left-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow ring-2 ring-white">
                  {{ String((currentPage - 1) * pageSize + idx + 1).padStart(2, '0') }}
                </span>
                <!-- 等级胶囊 -->
                <span
                  v-if="item.cityLevel || item.region"
                  class="absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="levelClass(item.cityLevel || item.region)"
                >
                  {{ item.cityLevel || item.region }}
                </span>
              </div>
              <!-- 内容 -->
              <div class="p-4">
                <h3 class="truncate text-lg font-bold text-slate-900">{{ item.cityName }}</h3>
                <p class="mt-1 text-xs text-slate-400">{{ item.province }} · {{ item.region }}</p>
                <!-- 数据 2x2 -->
                <div class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4L3 8l9 4 9-4-9-4zM6 10v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>
                    <span v-if="item.collegeCount != null && item.collegeCount !== 0">{{ item.collegeCount }} 所</span>
                    <span v-else class="text-slate-400">数据统计中</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <svg class="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16l-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z"/></svg>
                    <span v-if="item.keyCollegeCount != null && item.keyCollegeCount !== 0">{{ item.keyCollegeCount }} 所</span>
                    <span v-else class="text-slate-400">数据统计中</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <svg class="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    <span v-if="popText(item.residentPopulation, '万')">{{ popText(item.residentPopulation, '万') }}</span>
                    <span v-else class="text-slate-400">暂无</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-slate-500">
                    <svg class="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
                    <span v-if="popText(item.gdp, '亿元')">{{ popText(item.gdp, '亿元') }}</span>
                    <span v-else class="text-slate-400">暂无</span>
                  </div>
                </div>
                <!-- 简介 -->
                <p class="mt-3 line-clamp-2 text-sm text-slate-500">{{ item.cityIntro || '暂无城市介绍' }}</p>
                <!-- 查看详情 -->
                <p class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-400 transition group-hover:gap-2 group-hover:text-orange-500">
                  查看详情 <span class="transition-transform group-hover:translate-x-0.5">→</span>
                </p>
              </div>
            </article>
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize && !loading && !error" class="mt-6 flex justify-center">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="total"
              :page-sizes="[12, 24, 36, 48, 60]"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="onPageChange"
              @size-change="onSizeChange"
            />
          </div>
        </section>

        <!-- 右：信息栏 -->
        <aside class="space-y-6 lg:sticky lg:top-24">
          <!-- 城市数据概览 -->
          <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-base font-bold text-slate-800">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>
                </span>
                城市数据概览
              </h3>
              <button class="text-xs text-slate-400 transition hover:text-orange-500" @click="router.push('/city')">查看更多 ›</button>
            </div>
            <div v-if="statsLoading" class="grid grid-cols-2 gap-3">
              <div v-for="n in 4" :key="n" class="shimmer h-20 rounded-xl bg-slate-50"></div>
            </div>
            <div v-else-if="statsError" class="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
              加载失败，<button class="text-orange-500" @click="fetchStats">点击重试</button>
            </div>
            <div v-else class="grid grid-cols-2 gap-3">
              <div v-for="b in statBlocks" :key="b.label" class="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                <div
                  class="inline-flex h-6 w-6 items-center justify-center rounded-md"
                  :class="{
                    'bg-orange-50 text-orange-500': b.color === 'orange',
                    'bg-blue-50 text-blue-500': b.color === 'blue',
                    'bg-emerald-50 text-emerald-500': b.color === 'emerald',
                    'bg-amber-50 text-amber-500': b.color === 'amber',
                  }"
                >
                  <svg v-if="b.color === 'orange'" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>
                  <svg v-else-if="b.color === 'blue'" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4L3 8l9 4 9-4-9-4zM6 10v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>
                  <svg v-else-if="b.color === 'emerald'" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  <svg v-else class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
                </div>
                <div
                  class="mt-2 text-xl font-bold tabular-nums"
                  :class="{
                    'text-orange-500': b.color === 'orange',
                    'text-blue-500': b.color === 'blue',
                    'text-emerald-500': b.color === 'emerald',
                    'text-amber-500': b.color === 'amber',
                  }"
                >
                  <template v-if="b.data">{{ b.data.value }}<span class="ml-0.5 text-xs font-medium text-slate-400">{{ b.data.unit }}</span></template>
                  <span v-else class="text-sm font-normal text-slate-300">—</span>
                </div>
                <div class="mt-0.5 text-xs text-slate-400">{{ b.label }}</div>
              </div>
            </div>
          </section>

          <!-- 城市排行榜 -->
          <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-base font-bold text-slate-800">
                <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4zM7 4H4v2a3 3 0 003 3M17 4h3v2a3 3 0 01-3 3"/></svg>
                </span>
                城市排行榜
              </h3>
              <button class="text-xs text-slate-400 transition hover:text-orange-500" @click="viewAllByMetric(activeMetric)">查看全部 ›</button>
            </div>
            <!-- 指标 Tab -->
            <div class="mb-3 flex flex-wrap gap-1.5">
              <button
                v-for="t in rankTabs"
                :key="t.metric"
                class="rounded-full px-3 py-1 text-xs font-medium transition"
                :class="activeMetric === t.metric ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="fetchRank(t.metric)"
              >
                {{ t.label }}
              </button>
            </div>
            <!-- 加载骨架 -->
            <div v-if="rankLoading" class="space-y-3">
              <div v-for="n in 5" :key="n" class="flex items-center gap-3">
                <div class="shimmer h-6 w-6 rounded-full bg-slate-100"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="shimmer h-3 w-1/3 rounded bg-slate-100"></div>
                  <div class="shimmer h-2 w-full rounded bg-slate-100"></div>
                </div>
              </div>
            </div>
            <div v-else-if="rankError" class="py-6 text-center text-sm text-slate-400">
              加载失败，<button class="text-orange-500" @click="fetchRank()">点击重试</button>
            </div>
            <ul v-else class="space-y-2.5">
              <li
                v-for="(it, i) in rankList"
                :key="it.cityId"
                class="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
                @click="goDetail(it.cityId)"
              >
                <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold" :class="rankBadgeClass(i)">{{ i + 1 }}</span>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between">
                    <span class="truncate text-sm font-medium text-slate-700">{{ it.cityName }}</span>
                    <span class="ml-2 shrink-0 text-sm font-bold tabular-nums text-slate-500">{{ it.value }}</span>
                  </div>
                  <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                      :style="{ width: maxRankValue ? (it.value / maxRankValue) * 100 + '%' : '0%' }"
                    ></div>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <!-- 快捷工具 -->
          <section class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 class="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2-2 2.6-2.6z"/></svg>
              </span>
              快捷工具
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="t in quickTools"
                :key="t.label"
                class="group flex flex-col items-center gap-2 rounded-xl bg-slate-50 p-4 text-center transition hover:-translate-y-0.5 hover:shadow-sm"
                @click="onTool(t)"
              >
                <span
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  :class="{
                    'bg-blue-50 text-blue-500': t.color === 'blue',
                    'bg-emerald-50 text-emerald-500': t.color === 'emerald',
                    'bg-amber-50 text-amber-500': t.color === 'amber',
                    'bg-purple-50 text-purple-500': t.color === 'purple',
                  }"
                >
                  <svg v-if="t.color === 'blue'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>
                  <svg v-else-if="t.color === 'emerald'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15a4 4 0 004-4V6a4 4 0 10-8 0v5a4 4 0 004 4zM8 21h8"/></svg>
                  <svg v-else-if="t.color === 'amber'" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18v12H3zM3 11h18M7 15h2M7 7v4M15 7v4"/></svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5L12 3zM19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7L19 14z"/></svg>
                </span>
                <span class="text-sm font-medium text-slate-600">{{ t.label }}</span>
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.shimmer {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
