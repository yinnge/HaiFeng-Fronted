<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAnnouncements, getAnnouncementDetail, getPlanners, getInstitutions } from '@/api/home'
import type { AnnouncementListVO, AnnouncementDetailVO, PlannerListVO, InstitutionListVO } from '@/types/home'
import { ProvinceOptions } from '@haifeng/shared'
import PlannerCard from './components/PlannerCard.vue'
import AnnouncementWheel from './components/AnnouncementWheel.vue'
import AnnouncementDetailPanel from './components/AnnouncementDetailPanel.vue'

interface StatConfig {
  label: string
  target: number
  display: (v: number) => string
  color: string
}

const stats: StatConfig[] = [
  { label: '服务学生', target: 10, display: v => `${v}W+`, color: '#e8722a' },
  { label: '院校库', target: 2800, display: v => `${v}+`, color: '#f5a54a' },
  { label: '满意度', target: 986, display: v => `${(v / 10).toFixed(1)}%`, color: '#fbbf24' },
  { label: '专业顾问', target: 500, display: v => `${v}+`, color: '#e8722a' },
]

const currentValues = ref<number[]>(stats.map(() => 0))
const hasAnimated = ref(false)

let animationFrameId: number | null = null

const animateStats = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const startTime = performance.now()
  const duration = 1800

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) * (1 - progress)

    stats.forEach((stat, i) => {
      currentValues.value[i] = Math.round(eased * stat.target)
    })

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step)
    } else {
      stats.forEach((stat, i) => {
        currentValues.value[i] = stat.target
      })
    }
  }

  animationFrameId = requestAnimationFrame(step)
}

let observer: IntersectionObserver | null = null

const router = useRouter()

// ===== Announcement =====
const announcements = ref<AnnouncementListVO[]>([])
const announcementTotal = ref(0)
const announcementTag = ref('')
const announcementLoading = ref(false)

const fetchAnnouncements = async () => {
  announcementLoading.value = true
  try {
    const res = await getAnnouncements({ page: 1, size: 100 })
    const data = res.data.data
    announcements.value = data.records
    announcementTotal.value = data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取公告失败')
  } finally {
    announcementLoading.value = false
  }
}

const filteredAnnouncements = computed(() => {
  const kw = announcementTag.value.trim().toLowerCase()
  if (!kw) return announcements.value
  return announcements.value.filter(a =>
    a.title?.toLowerCase().includes(kw) || a.tag?.toLowerCase().includes(kw)
  )
})

const displayAnnouncementTotal = computed(() =>
  announcementTag.value.trim() ? filteredAnnouncements.value.length : announcementTotal.value
)

const searchAnnouncement = () => {
  announcementTag.value = announcementTag.value.trim()
}

// ===== Announcement Detail =====
const announcementDetailLoading = ref(false)
const announcementDetail = ref<AnnouncementDetailVO | null>(null)
const announcementDetailCache = new Map<string, AnnouncementDetailVO>()

const selectAnnouncement = async (id: string) => {
  if (!id) return
  const cached = announcementDetailCache.get(id)
  if (cached) {
    announcementDetail.value = cached
    announcementDetailLoading.value = false
    return
  }
  announcementDetailLoading.value = true
  announcementDetail.value = null
  try {
    const res = await getAnnouncementDetail(id)
    const data = res.data.data
    announcementDetailCache.set(id, data)
    announcementDetail.value = data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取公告详情失败')
    announcementDetail.value = null
  } finally {
    announcementDetailLoading.value = false
  }
}

watch(filteredAnnouncements, (list) => {
  if (list.length) {
    selectAnnouncement(list[0].id)
  } else {
    announcementDetail.value = null
  }
})

// ===== Planner =====
const planners = ref<PlannerListVO[]>([])
const plannerRegion = ref('')
const plannerPageIndex = ref(0)
const waveOffsets = [-10, 8, -14, 8, -10]
const isSmallScreen = ref(false)

const updateViewport = () => {
  isSmallScreen.value = window.innerWidth < 768
}

const plannersPerPage = computed(() => (isSmallScreen.value ? 3 : 5))

const fetchPlanners = async () => {
  const res = await getPlanners({
    page: 1,
    size: 100,
    region: plannerRegion.value || undefined,
  })
  planners.value = res.data.data.records
  plannerPageIndex.value = 0
}

const plannerPages = computed(() => {
  const pages: PlannerListVO[][] = []
  for (let i = 0; i < planners.value.length; i += plannersPerPage.value) {
    pages.push(planners.value.slice(i, i + plannersPerPage.value))
  }
  return pages
})

watch(plannerPages, (pages) => {
  if (plannerPageIndex.value >= pages.length) {
    plannerPageIndex.value = Math.max(0, pages.length - 1)
  }
})

const currentPlannerPage = computed(() => plannerPages.value[plannerPageIndex.value] || [])

const prevPlannerPage = () => {
  if (plannerPageIndex.value > 0) plannerPageIndex.value--
}

const nextPlannerPage = () => {
  if (plannerPageIndex.value < plannerPages.value.length - 1) plannerPageIndex.value++
}

const searchPlanner = () => {
  fetchPlanners()
}

let touchStartX = 0
let touchStartY = 0

const onPlannerTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const onPlannerTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
  if (dx < 0) {
    nextPlannerPage()
  } else {
    prevPlannerPage()
  }
}

// ===== Institution =====
const institutions = ref<InstitutionListVO[]>([])
const institutionTotal = ref(0)
const institutionName = ref('')
const institutionType = ref('')

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutions({
      page: 1,
      size: 100,
      name: institutionName.value || undefined,
    })
    institutions.value = res.data.data.records
    institutionTotal.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取机构列表失败')
  }
}

const institutionTypes = computed(() => {
  const types = new Set<string>()
  institutions.value.forEach(inst => {
    if (inst.type) types.add(inst.type)
  })
  return Array.from(types)
})

const filteredInstitutions = computed(() => {
  if (!institutionType.value) return institutions.value
  return institutions.value.filter(inst => inst.type === institutionType.value)
})

const searchInstitution = () => {
  fetchInstitutions()
}

const onMoreInstitutions = () => {
  ElMessage.info('机构列表页开发中，敬请期待')
}

const goInstitutionDetail = (id: string) => {
  router.push(`/home/institution/${id}`)
}

onMounted(() => {
  fetchAnnouncements()
  fetchPlanners()
  fetchInstitutions()

  updateViewport()
  window.addEventListener('resize', updateViewport)

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats()
      }
    })
  }, { threshold: 0.3 })

  const el = document.querySelector('.stats-section')
  if (el) observer.observe(el)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (observer) observer.disconnect()
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-20 text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          专业 · 科学 · 个性化
        </div>
        <h2 class="mb-6 text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl leading-tight">
          高考志愿填报<br class="md:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">智能规划平台</span>
        </h2>
        <p class="mx-auto mb-10 max-w-2xl text-lg text-gray-500 leading-relaxed">
          基于大数据分析和AI算法，为您提供科学、精准的高考志愿填报方案，助您圆梦理想大学。从高考志愿到职场上岸，我们全程陪伴。
        </p>
        <div class="flex flex-col items-center justify-center gap-4 md:flex-row">
          <router-link
            to="/gaokao"
            class="group w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 md:w-auto flex items-center justify-center gap-2"
          >
            高考报志愿
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
          <button class="w-full rounded-xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-all md:w-auto">
            了解更多
          </button>
        </div>
      </div>

      <div class="stats-section">
        <div class="stats-container">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="stat-item"
          >
            <div
              class="stat-value"
              :style="{ color: stat.color }"
            >
              {{ stat.display(currentValues[index]) }}
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <section class="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-3">
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            🎯
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">智能推荐</h3>
          <p class="text-gray-500 leading-relaxed">根据分数、兴趣、职业规划，智能推荐最适合的院校和专业</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            📊
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">数据分析</h3>
          <p class="text-gray-500 leading-relaxed">整合历年录取数据，提供精准的录取概率分析</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            👨‍🎓
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">专家指导</h3>
          <p class="text-gray-500 leading-relaxed">资深规划师一对一咨询，助您做出最佳选择</p>
        </div>
      </section>

      <!-- ===== Announcement Section ===== -->
      <section class="bg-white py-16">
        <div class="container mx-auto px-6">
          <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">公告信息</h2>

          <div class="mx-auto mb-8 flex max-w-xl items-center gap-3">
            <input
              v-model="announcementTag"
              type="text"
              placeholder="输入标签或标题关键词搜索"
              class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              @keyup.enter="searchAnnouncement"
            />
            <button
              class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="searchAnnouncement"
            >
              搜索
            </button>
          </div>

          <div v-if="announcementLoading" class="mx-auto flex max-w-5xl justify-center py-16">
            <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          <div v-else class="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[340px_1fr] lg:gap-12">
            <AnnouncementWheel
              :announcements="filteredAnnouncements"
              @select="selectAnnouncement"
            />
            <AnnouncementDetailPanel
              :detail="announcementDetail"
              :loading="announcementDetailLoading"
            />
          </div>

          <p class="mt-6 text-center text-sm text-gray-400">共 {{ displayAnnouncementTotal }} 条</p>
        </div>
      </section>

      <!-- ===== Planner Section ===== -->
      <section class="bg-gradient-to-b from-slate-50 to-white py-16">
        <div class="container mx-auto px-6">
          <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">专业规划师</h2>

          <div class="mx-auto mb-8 flex max-w-xl items-center gap-3">
            <el-select
              v-model="plannerRegion"
              placeholder="选择地区筛选"
              clearable
              class="flex-1"
              @change="searchPlanner"
            >
              <el-option
                v-for="opt in ProvinceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
            <button
              class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="searchPlanner"
            >
              搜索
            </button>
          </div>

          <div v-if="plannerPages.length" class="flex items-center justify-center">
            <button
              class="z-10 mr-1 md:mr-3 flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="plannerPageIndex === 0"
              @click="prevPlannerPage"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div
              class="flex items-center justify-center gap-0"
              @touchstart="onPlannerTouchStart"
              @touchend="onPlannerTouchEnd"
            >
              <PlannerCard
                v-for="(planner, i) in currentPlannerPage"
                :key="planner.id"
                :planner="planner"
                :offset="waveOffsets[i % waveOffsets.length]"
                :align="i === currentPlannerPage.length - 1 ? 'left' : 'right'"
              />
            </div>

            <button
              class="z-10 ml-1 md:ml-3 flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="plannerPageIndex >= plannerPages.length - 1"
              @click="nextPlannerPage"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div v-else class="py-12 text-center text-gray-400">
            暂无规划师
          </div>

          <div class="mt-6 flex justify-center gap-2">
            <span
              v-for="(_, i) in plannerPages"
              :key="i"
              class="inline-block h-2 w-2 rounded-full transition-colors cursor-pointer"
              :class="i === plannerPageIndex ? 'bg-orange-500' : 'bg-gray-300'"
              @click="plannerPageIndex = i"
            ></span>
          </div>
        </div>
      </section>

      <!-- ===== Institution Section ===== -->
      <section class="bg-white py-16">
        <div class="container mx-auto px-6">
          <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">培训机构</h2>

          <div class="mx-auto mb-6 flex max-w-xl items-center gap-3">
            <input
              v-model="institutionName"
              type="text"
              placeholder="输入机构名称搜索"
              class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              @keyup.enter="searchInstitution"
            />
            <button
              class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="searchInstitution"
            >
              搜索
            </button>
          </div>

          <div v-if="institutionTypes.length" class="mb-8 flex flex-wrap justify-center gap-2">
            <button
              class="rounded-full px-4 py-1.5 text-sm transition-all"
              :class="institutionType === '' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'"
              @click="institutionType = ''"
            >
              全部
            </button>
            <button
              v-for="type in institutionTypes"
              :key="type"
              class="rounded-full px-4 py-1.5 text-sm transition-all"
              :class="institutionType === type ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'"
              @click="institutionType = type"
            >
              {{ type }}
            </button>
          </div>

          <div v-if="filteredInstitutions.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="inst in filteredInstitutions"
              :key="inst.id"
              class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div class="aspect-[4/3] overflow-hidden bg-gray-50">
                <img
                  :src="inst.images?.[0] || ''"
                  :alt="inst.name"
                  class="h-full w-full rounded-t-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div class="p-5">
                <h4 class="mb-1 text-lg font-bold text-gray-800 truncate">{{ inst.name }}</h4>
                <span class="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ inst.type }}</span>
                <p class="mt-3 text-sm text-gray-500 line-clamp-2">{{ inst.description }}</p>
                <button
                  class="mt-4 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                  @click="goInstitutionDetail(inst.id)"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
          <div v-else class="py-12 text-center text-gray-400">
            暂无培训机构
          </div>

          <div class="mt-8 flex items-center justify-end">
            <button
              class="flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 transition-colors"
              @click="onMoreInstitutions"
            >
              共 {{ institutionTotal }} 家 · 查看更多机构
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.stats-section {
  padding: 48px 24px 40px;
  position: relative;
  background: #ffffff;
}

.stats-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 900px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 114, 42, 0.2), rgba(251, 191, 36, 0.2), transparent);
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  transition: color 0.3s;
}

.stat-label {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.5px;
}

@media (max-width: 1024px) {
  .stats-container {
    gap: 24px;
  }
  .stat-value {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px 20px;
  }
  .stat-value {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .stats-section {
    padding: 36px 16px 32px;
  }
  .stats-container {
    gap: 24px 16px;
  }
  .stat-value {
    font-size: 28px;
  }
  .stat-label {
    font-size: 13px;
  }
}
</style>
