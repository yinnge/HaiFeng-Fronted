<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getAnnouncements, getPlanners, getInstitutions } from '@/api/home'
import type { AnnouncementListVO, PlannerListVO, InstitutionListVO } from '@/types/home'
import { ProvinceOptions } from '@haifeng/shared'

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

function goLogin() {
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}

// ===== Announcement =====
const announcements = ref<AnnouncementListVO[]>([])
const announcementTotal = ref(0)
const announcementPage = ref(1)
const announcementPageSize = ref(10)
const announcementTag = ref('')
const currentAnnouncementIndex = ref(0)
let announcementTimer: ReturnType<typeof setInterval> | null = null

const fetchAnnouncements = async () => {
  const res = await getAnnouncements({
    page: announcementPage.value,
    size: announcementPageSize.value,
    tag: announcementTag.value || undefined,
  })
  const data = res.data.data
  announcements.value = data.records
  announcementTotal.value = data.total
  currentAnnouncementIndex.value = 0
  resetAnnouncementTimer()
}

const resetAnnouncementTimer = () => {
  if (announcementTimer) clearInterval(announcementTimer)
  announcementTimer = setInterval(() => {
    if (announcements.value.length > 0) {
      currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % announcements.value.length
    }
  }, 5000)
}

const currentAnnouncement = computed(() => {
  if (announcements.value.length === 0) return null
  return announcements.value[currentAnnouncementIndex.value]
})

const goAnnouncementDetail = (id: number) => {
  router.push(`/home/announcement/${id}`)
}

const searchAnnouncement = () => {
  announcementPage.value = 1
  fetchAnnouncements()
}

const onAnnouncementPageChange = (page: number) => {
  announcementPage.value = page
  fetchAnnouncements()
}

// ===== Planner =====
const planners = ref<PlannerListVO[]>([])
const plannerRegion = ref('')
const plannerPageIndex = ref(0)
const plannersPerPage = 4

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
  for (let i = 0; i < planners.value.length; i += plannersPerPage) {
    pages.push(planners.value.slice(i, i + plannersPerPage))
  }
  return pages
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

// ===== Institution =====
const institutions = ref<InstitutionListVO[]>([])
const institutionTotal = ref(0)
const institutionPage = ref(1)
const institutionPageSize = ref(8)
const institutionName = ref('')

const fetchInstitutions = async () => {
  const res = await getInstitutions({
    page: institutionPage.value,
    size: institutionPageSize.value,
    name: institutionName.value || undefined,
  })
  const data = res.data.data
  institutions.value = data.records
  institutionTotal.value = data.total
}

const searchInstitution = () => {
  institutionPage.value = 1
  fetchInstitutions()
}

const onInstitutionPageChange = (page: number) => {
  institutionPage.value = page
  fetchInstitutions()
}

const goInstitutionDetail = (id: number) => {
  router.push(`/home/institution/${id}`)
}

onMounted(() => {
  fetchAnnouncements()
  fetchPlanners()
  fetchInstitutions()

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
  if (announcementTimer) clearInterval(announcementTimer)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <img
            :src="logoMain"
            alt="海枫未来规划院"
            class="h-10 w-10 object-contain"
          />
          <h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
            @click="goProfile"
          >
            个人中心
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            @click="goLogin"
          >
            登录
          </button>
        </div>
      </div>
    </header>

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
          <button class="group w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 md:w-auto flex items-center justify-center gap-2">
            开始规划
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
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
              placeholder="输入公告标签搜索（如：政策）"
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

          <div
            v-if="currentAnnouncement"
            class="mx-auto mb-8 max-w-3xl cursor-pointer rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-md hover:shadow-lg transition-shadow"
            @click="goAnnouncementDetail(currentAnnouncement.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <span class="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
                <span class="truncate text-lg font-semibold text-gray-800">{{ currentAnnouncement.title }}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ currentAnnouncement.tag }}</span>
                <span class="text-xs text-gray-400">{{ currentAnnouncement.updatedAt?.slice(0, 10) }}</span>
              </div>
            </div>
          </div>

          <div v-if="announcements.length" class="overflow-hidden rounded-xl border border-gray-100">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 text-left text-sm text-gray-500">
                  <th class="px-6 py-3 font-medium">标题</th>
                  <th class="px-6 py-3 font-medium w-24">标签</th>
                  <th class="px-6 py-3 font-medium w-32">更新时间</th>
                  <th class="px-6 py-3 font-medium w-20">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in announcements"
                  :key="item.id"
                  class="border-t border-gray-50 hover:bg-orange-50/50 transition-colors"
                >
                  <td class="px-6 py-4 text-sm text-gray-700 truncate max-w-md">{{ item.title }}</td>
                  <td class="px-6 py-4">
                    <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ item.tag }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-400">{{ item.updatedAt?.slice(0, 10) }}</td>
                  <td class="px-6 py-4">
                    <button
                      class="text-sm text-orange-500 hover:text-orange-600 transition-colors"
                      @click="goAnnouncementDetail(item.id)"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="py-12 text-center text-gray-400">
            暂无公告
          </div>

          <div v-if="announcementTotal > announcementPageSize" class="mt-6 flex justify-center">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="announcementTotal"
              :page-size="announcementPageSize"
              :current-page="announcementPage"
              @current-change="onAnnouncementPageChange"
            />
          </div>
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

          <div v-if="plannerPages.length" class="relative">
            <button
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="plannerPageIndex === 0"
              @click="prevPlannerPage"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="grid gap-6 md:grid-cols-4 px-8">
              <div
                v-for="planner in currentPlannerPage"
                :key="planner.id"
                class="group cursor-pointer rounded-2xl bg-white p-6 text-center shadow-lg hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all"
                @click="router.push(`/home/planner/${planner.id}`)"
              >
                <img
                  :src="planner.avatar"
                  :alt="planner.name"
                  class="mx-auto h-24 w-24 rounded-full border-4 border-orange-100 object-cover group-hover:border-orange-300 transition-colors"
                />
                <h4 class="mt-4 text-lg font-bold text-gray-800">{{ planner.name }}</h4>
                <p class="mt-1 text-sm text-orange-500">{{ planner.position }}</p>
                <p class="mt-1 text-xs text-gray-400">{{ planner.region }}</p>
                <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ planner.specialty }}</p>
              </div>
            </div>

            <button
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg text-gray-600 hover:text-orange-500 hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="plannerPageIndex >= plannerPages.length - 1"
              @click="nextPlannerPage"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              class="inline-block h-2 w-2 rounded-full transition-colors"
              :class="i === plannerPageIndex ? 'bg-orange-500' : 'bg-gray-300'"
            ></span>
          </div>
        </div>
      </section>

      <!-- ===== Institution Section ===== -->
      <section class="bg-white py-16">
        <div class="container mx-auto px-6">
          <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">培训机构</h2>

          <div class="mx-auto mb-8 flex max-w-xl items-center gap-3">
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

          <div v-if="institutions.length" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="inst in institutions"
              :key="inst.id"
              class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl overflow-hidden transition-all"
            >
              <div class="aspect-[4/3] overflow-hidden bg-gray-50">
                <img
                  :src="inst.images?.[0] || ''"
                  :alt="inst.name"
                  class="h-full w-full rounded-t-2xl object-cover group-hover:scale-105 transition-transform duration-300"
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

          <div v-if="institutionTotal > institutionPageSize" class="mt-8 flex justify-center">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="institutionTotal"
              :page-size="institutionPageSize"
              :current-page="institutionPage"
              @current-change="onInstitutionPageChange"
            />
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
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
