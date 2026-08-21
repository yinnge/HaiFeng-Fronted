<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSiteInfo, getAnnouncements, getAnnouncementDetail, getPlanners, getInstitutions } from '@/api/home'
import type { SiteInfoVO, AnnouncementListVO, AnnouncementDetailVO, PlannerListVO, InstitutionListVO } from '@/types/home'
import { MemberType } from '@haifeng/shared'
import { useUserStore } from '@/store/modules/user'
import PlannerCard from './components/PlannerCard.vue'
import CircularGallery from './components/CircularGallery.vue'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
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

const recharge = useRechargeDialog()
const router = useRouter()
const userStore = useUserStore()

// ===== 快速入口 =====
interface EntryItem {
  tag: string
  emoji: string
  title: string
  desc: string
  btn: string
  to?: string
  expert?: boolean
}

const entryItems: EntryItem[] = [
  { tag: 'AI智能', emoji: '✨', title: '高考报志愿', desc: '基于AI算法与大数据分析，科学评估成绩与兴趣，一键生成个性化志愿方案，精准定位理想院校。', btn: '开始志愿填报', to: '/gaokao' },
  { tag: '一对一', emoji: '👨‍🎓', title: '专家指导', desc: '资深规划师一对一深度咨询，量身定制升学与职业路径，全程陪伴、随时答疑。', btn: '立即咨询专家', expert: true },
  { tag: '择校导航', emoji: '🏫', title: '院校', desc: '海量院校权威数据，招生计划、历年分数、专业设置一网打尽，科学选择心仪院校。', btn: '进入院校专区', to: '/university' },
  { tag: '专业库', emoji: '📖', title: '专业', desc: '全面解读专业内涵与就业方向，结合个人兴趣特长，精准匹配最适合你的专业。', btn: '进入专业专区', to: '/major' },
  { tag: '就业规划', emoji: '💼', title: '就业专栏', desc: '汇聚公务员、事业单位、名企等最新就业资讯，把握就业趋势，提前规划职业未来。', btn: '进入就业专栏', to: '/employment/civil' },
]

// ===== 专家指导 =====
const expertDialogVisible = ref(false)
const siteInfo = ref<SiteInfoVO | null>(null)
const siteInfoLoading = ref(false)

const fetchSiteInfo = async () => {
  if (siteInfo.value) return
  siteInfoLoading.value = true
  try {
    const res = await getSiteInfo()
    siteInfo.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取联系信息失败')
  } finally {
    siteInfoLoading.value = false
  }
}

const openExpertDialog = async () => {
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('您还没有登录，请先登录', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(router.currentRoute.value.fullPath)
      router.push('/login')
    } catch {
      // 取消登录
    }
    return
  }
  const memberType = userStore.userInfo?.memberType
  if (memberType !== MemberType.PRO && memberType !== MemberType.VIP) {
    try {
      await ElMessageBox.confirm('专家指导联系方式为专业版/VIP会员专享，是否前往开通？', '提示', {
        confirmButtonText: '前往开通',
        cancelButtonText: '取消',
        type: 'warning',
      })
      recharge.open()
    } catch {
      // 取消开通
    }
    return
  }
  await fetchSiteInfo()
  expertDialogVisible.value = true
}

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

const viewportWidth = ref(0)

const updateViewport = () => {
  viewportWidth.value = window.innerWidth
  isSmallScreen.value = viewportWidth.value < 768
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

// ===== Institution Gallery =====
const institutionGalleryItems = computed(() =>
  filteredInstitutions.value.map(inst => ({
    image: inst.images?.[0] || '',
    text: inst.name,
  }))
)

const onInstitutionSelect = (index: number) => {
  const inst = filteredInstitutions.value[index]
  if (inst) goInstitutionDetail(inst.id)
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
          海枫<span class="bg-gradient-to-r from-brand-orange to-brand-orange-light bg-clip-text text-transparent">未来规划院</span>
        </h2>
        <p class="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
          依托大数据分析与AI算法，科学规划志愿、精准匹配院校，助你圆梦理想大学。从高考志愿到职场上岸，我们全程陪伴。
        </p>
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

      <!-- ===== 核心服务导航（参考研究生阶段导航样式） ===== -->
      <section class="container mx-auto px-6 py-16">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800">核心服务导航</h2>
          <p class="mt-1 text-sm text-gray-500">从择校到就业，全程规划你的升学与职业发展</p>
        </div>

        <div class="entry-grid">
          <component
            :is="item.expert ? 'div' : 'router-link'"
            v-for="item in entryItems"
            :key="item.title"
            :to="item.expert ? undefined : item.to"
            class="entry-card"
            @click="item.expert && openExpertDialog()"
          >
            <span class="entry-tag">{{ item.tag }}</span>
            <div class="entry-emoji">{{ item.emoji }}</div>
            <h3 class="entry-title">{{ item.title }}</h3>
            <p class="entry-desc">{{ item.desc }}</p>
            <span class="entry-btn">
              {{ item.btn }}
              <svg class="entry-btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </component>
        </div>
      </section>

      <!-- ===== Announcement Section ===== -->
      <section class="bg-white py-16">
        <div class="container mx-auto px-6">
          <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">公告信息</h2>

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

          <div v-if="filteredInstitutions.length" class="relative">
            <div class="h-[440px] sm:h-[500px] md:h-[560px]">
              <CircularGallery
                :items="institutionGalleryItems"
                :bend="3"
                text-color="#1f2937"
                @select="onInstitutionSelect"
              />
            </div>
            <p class="mt-2 text-center text-xs text-gray-400">左右拖拽 / 滚动浏览 · 点击卡片查看详情</p>
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

      <el-dialog
        v-model="expertDialogVisible"
        title="专家指导 · 联系信息"
        width="420px"
        :close-on-click-modal="false"
        class="expert-dialog"
      >
        <div v-if="siteInfoLoading" class="flex justify-center py-10">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
        </div>
        <div v-else class="space-y-4">
          <div class="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
            <span class="mt-0.5 text-lg">📍</span>
            <div>
              <p class="text-xs text-gray-400">公司地址</p>
              <p class="text-sm font-medium text-gray-700">{{ siteInfo?.basicMessage?.address }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
            <span class="mt-0.5 text-lg">📞</span>
            <div>
              <p class="text-xs text-gray-400">联系电话</p>
              <p class="text-sm font-medium text-gray-700">{{ siteInfo?.basicMessage?.phone }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
            <span class="mt-0.5 text-lg">✉️</span>
            <div>
              <p class="text-xs text-gray-400">联系邮箱</p>
              <p class="text-sm font-medium text-gray-700">{{ siteInfo?.basicMessage?.email }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3 rounded-xl bg-orange-50/60 p-3">
            <span class="mt-0.5 text-lg">🕘</span>
            <div>
              <p class="text-xs text-gray-400">咨询时间</p>
              <p class="text-sm font-medium text-gray-700">{{ siteInfo?.basicMessage?.consultationTime }}</p>
            </div>
          </div>
          <div class="pt-2 text-center">
            <p class="mb-3 text-sm font-semibold text-gray-700">微信二维码</p>
            <div class="inline-block rounded-xl border border-orange-100 bg-orange-50/40 p-2 shadow-md">
              <img
                v-if="siteInfo?.contactUrl?.wechat"
                :src="siteInfo.contactUrl.wechat"
                alt="微信二维码"
                class="h-40 w-40 object-contain"
              />
              <div v-else class="flex h-40 w-40 items-center justify-center text-gray-400">
                二维码加载中...
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-500">扫码添加规划师微信咨询</p>
          </div>
        </div>
        <template #footer>
          <button
            class="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
            @click="expertDialogVisible = false"
          >
            我知道了
          </button>
        </template>
      </el-dialog>
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

/* ===== 核心服务导航卡片（对齐研究生阶段导航 pg-stage-card 样式） ===== */
.entry-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
}

.entry-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
  cursor: pointer;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.entry-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

.entry-tag {
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

.entry-emoji {
  font-size: 2.8rem;
  line-height: 1;
  margin-bottom: 0.75rem;
}

.entry-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
}

.entry-desc {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.75;
  color: #6b7280;
  flex-grow: 1;
}

.entry-btn {
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
  transition: all 0.2s ease;
}

.entry-card:hover .entry-btn {
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

.entry-btn-arrow {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 0.2s ease;
}

.entry-card:hover .entry-btn-arrow {
  transform: translateX(3px);
}

@media (min-width: 640px) {
  .entry-card {
    width: calc(50% - 0.625rem);
  }
}

@media (min-width: 1024px) {
  .entry-card {
    width: calc(33.333% - 0.875rem);
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

<style>
/* 专家指导弹窗：橙白色系（弹窗经 teleport 到 body，需用非 scoped 样式） */
.expert-dialog .el-dialog {
  border-radius: 12px;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  border-top: 3px solid #f97316;
  border-bottom: 3px solid #fb923c;
  overflow: hidden;
}

.expert-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(249, 115, 22, 0.2);
  padding-bottom: 14px;
}

.expert-dialog .el-dialog__title {
  color: #1f2937;
  font-weight: 700;
}

.expert-dialog .el-dialog__body {
  padding-top: 16px;
}
</style>
