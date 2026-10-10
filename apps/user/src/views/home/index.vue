<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSiteInfo, getAnnouncements, getAnnouncementDetail, getPlanners, getInstitutions } from '@/api/home'
import type { SiteInfoVO, AnnouncementListVO, AnnouncementDetailVO, PlannerListVO, InstitutionListVO } from '@/types/home'
import { MemberType } from '@haifeng/shared'
import { useUserStore } from '@/store/modules/user'
import { confirmLogin } from '@/utils/loginGuide'
import PlannerCard from './components/PlannerCard.vue'
import CircularGallery from './components/CircularGallery.vue'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import AnnouncementWheel from './components/AnnouncementWheel.vue'
import AnnouncementDetailPanel from './components/AnnouncementDetailPanel.vue'
import ServiceNavigator from './components/ServiceNavigator.vue'
import TreasureBox from './components/TreasureBox.vue'
import FloatingTreasure from './components/FloatingTreasure.vue'
import AnimatedLogo from '@/components/AnimatedLogo.vue'

// ===== Stats =====
interface StatConfig {
  label: string
  target: number
  display: (v: number) => string
}

const stats: StatConfig[] = [
  { label: '服务学生', target: 10, display: v => `${v}W+` },
  { label: '院校库', target: 2800, display: v => `${v}+` },
  { label: '满意度', target: 986, display: v => `${(v / 10).toFixed(1)}%` },
  { label: '专业顾问', target: 500, display: v => `${v}+` },
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

let statsObserver: IntersectionObserver | null = null

// ===== Core =====
const recharge = useRechargeDialog()
const router = useRouter()
const userStore = useUserStore()

// ===== Expert =====
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
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    if (await confirmLogin()) {
      router.push('/login')
    }
    return
  }
  const memberType = userStore.userInfo?.memberType
  if (memberType !== MemberType.VIP) {
    try {
      await ElMessageBox.confirm('专家指导联系方式为VIP会员专享，是否前往开通？', '提示', {
        confirmButtonText: '前往开通',
        cancelButtonText: '取消',
        type: 'warning',
      })
      recharge.open()
    } catch { /* cancel */ }
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
  if (list.length) selectAnnouncement(list[0].id)
  else announcementDetail.value = null
})

// ===== Planner =====
const planners = ref<PlannerListVO[]>([])
const plannerRegion = ref('')
const plannerPageIndex = ref(0)
const waveOffsets = [-10, 8, -14, 8, -10]
const isSmallScreen = ref(false)
const viewportWidth = ref(0)
const touchStartX = ref(0)
const touchStartY = ref(0)

const updateViewport = () => {
  viewportWidth.value = window.innerWidth
  isSmallScreen.value = viewportWidth.value < 768
}

const plannersPerPage = computed(() => (isSmallScreen.value ? 3 : 5))

const fetchPlanners = async () => {
  const res = await getPlanners({ page: 1, size: 100, region: plannerRegion.value || undefined })
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
const prevPlannerPage = () => { if (plannerPageIndex.value > 0) plannerPageIndex.value-- }
const nextPlannerPage = () => { if (plannerPageIndex.value < plannerPages.value.length - 1) plannerPageIndex.value++ }

const onPlannerTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const onPlannerTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchStartX.value
  const dy = e.changedTouches[0].clientY - touchStartY.value
  if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
    dx < 0 ? nextPlannerPage() : prevPlannerPage()
  }
}

// ===== Institution =====
const institutions = ref<InstitutionListVO[]>([])
const institutionTotal = ref(0)
const institutionName = ref('')
const institutionType = ref('')

const fetchInstitutions = async () => {
  try {
    const res = await getInstitutions({ page: 1, size: 100, name: institutionName.value || undefined })
    institutions.value = res.data.data.records
    institutionTotal.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取机构列表失败')
  }
}

const institutionTypes = computed(() => {
  const types = new Set<string>()
  institutions.value.forEach(inst => { if (inst.type) types.add(inst.type) })
  return Array.from(types)
})

const filteredInstitutions = computed(() => {
  if (!institutionType.value) return institutions.value
  return institutions.value.filter(inst => inst.type === institutionType.value)
})

const institutionGalleryItems = computed(() =>
  filteredInstitutions.value.map(inst => ({ image: inst.images?.[0] || '', text: inst.name }))
)

const onInstitutionSelect = (index: number) => {
  const inst = filteredInstitutions.value[index]
  if (inst) router.push(`/home/institution/${inst.id}`)
}

const onMoreInstitutions = () => { ElMessage.info('机构列表页开发中，敬请期待') }

// ===== Scroll Reveal =====
let revealObserver: IntersectionObserver | null = null

const initScrollReveal = () => {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' })

  const elements = document.querySelectorAll('.reveal, .reveal-left')
  elements.forEach(el => {
    // 对已在视口内的元素立即 reveal，避免 observer 未触发导致永久模糊
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('revealed')
    } else {
      revealObserver!.observe(el)
    }
  })
}

// ===== Lifecycle =====
onMounted(() => {
  fetchAnnouncements()
  fetchPlanners()
  fetchInstitutions()
  updateViewport()
  window.addEventListener('resize', updateViewport)

  statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) animateStats() })
  }, { threshold: 0.3 })
  const el = document.querySelector('.stats-card')
  if (el) statsObserver.observe(el)

  initScrollReveal()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (statsObserver) statsObserver.disconnect()
  if (revealObserver) revealObserver.disconnect()
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="home-page">
    <!-- ==================== Hero（不对称布局） ==================== -->
    <section class="hero-section grain-overlay">
      <div class="hero-inner">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            专业 · 科学 · 个性化
          </div>
          <h1 class="hero-title">
            <AnimatedLogo class="hero-logo" />
            海枫<span class="hero-title-gradient">未来规划院</span>
          </h1>
          <p class="hero-desc">
            依托大数据分析与AI算法，科学规划志愿、精准匹配院校，助你圆梦理想大学。从高考志愿到职场上岸，我们全程陪伴。
          </p>
          <div class="hero-actions">
            <router-link to="/gaokao" class="hero-btn-primary magnetic-btn">
              开始志愿填报
              <svg class="hero-btn-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>
            </router-link>
            <router-link to="/university" class="hero-btn-secondary magnetic-btn">
              探索院校
            </router-link>
          </div>
        </div>

        <div class="hero-visual">
          <div class="stats-card glass-card">
            <div
              v-for="(stat, index) in stats"
              :key="stat.label"
              class="stat-item"
            >
              <div class="stat-value">{{ stat.display(currentValues[index]) }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div class="stats-card-glow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== 核心服务导航（跑马灯大卡 + 弹层目录） ==================== -->
    <section class="section-wrapper">
      <div class="section-container reveal">
        <div class="section-head reveal-left">
          <h2 class="section-title">核心服务导航</h2>
          <p class="section-sub">从初中到就业，十大模块覆盖升学全程 · 点击卡片查看二级目录</p>
        </div>

        <ServiceNavigator @expert="openExpertDialog" />
      </div>
    </section>

    <!-- ==================== 百宝箱（与核心服务导航同级别的工具导航） ==================== -->
    <section class="section-wrapper">
      <div class="section-container reveal">
        <div class="section-head reveal-left">
          <h2 class="section-title">百宝箱</h2>
          <p class="section-sub">查询工具合集 · 院校、专业、城市、企业行业与竞赛证书一箱搞定</p>
        </div>

        <TreasureBox />
      </div>
    </section>

    <!-- ==================== 公告信息 ==================== -->
    <section class="section-wrapper section-alt grain-overlay">
      <div class="section-container reveal">
        <div class="section-head">
          <h2 class="section-title">公告信息</h2>
          <p class="section-sub">最新动态与重要通知</p>
        </div>

        <div v-if="announcementLoading" class="flex justify-center py-16">
          <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <div v-else class="announcement-layout">
          <AnnouncementWheel
            :announcements="filteredAnnouncements"
            @select="selectAnnouncement"
          />
          <AnnouncementDetailPanel
            :detail="announcementDetail"
            :loading="announcementDetailLoading"
          />
        </div>

        <p class="text-center text-sm text-gray-400 mt-6">共 {{ displayAnnouncementTotal }} 条</p>
      </div>
    </section>

    <!-- ==================== 专业规划师 ==================== -->
    <section class="section-wrapper">
      <div class="section-container reveal">
        <div class="section-head">
          <h2 class="section-title">专业规划师</h2>
          <p class="section-sub">资深团队，一对一陪伴你的每一步</p>
        </div>

        <div v-if="plannerPages.length" class="flex items-center justify-center">
          <button
            class="nav-arrow-btn magnetic-btn"
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
            class="nav-arrow-btn magnetic-btn"
            :disabled="plannerPageIndex >= plannerPages.length - 1"
            @click="nextPlannerPage"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div v-else class="py-12 text-center text-gray-400">暂无规划师</div>

        <div class="mt-6 flex justify-center gap-2">
          <span
            v-for="(_, i) in plannerPages"
            :key="i"
            class="page-dot"
            :class="i === plannerPageIndex ? 'active' : ''"
            @click="plannerPageIndex = i"
          ></span>
        </div>
      </div>
    </section>

    <!-- ==================== 培训机构 ==================== -->
    <section class="section-wrapper section-alt grain-overlay">
      <div class="section-container reveal">
        <div class="section-head">
          <h2 class="section-title">培训机构</h2>
          <p class="section-sub">优质教育资源，助力升学之路</p>
        </div>

        <div class="institution-search">
          <input
            v-model="institutionName"
            type="text"
            placeholder="输入机构名称搜索"
            class="institution-input"
            @keyup.enter="fetchInstitutions"
          />
          <button class="institution-search-btn magnetic-btn" @click="fetchInstitutions">搜索</button>
        </div>

        <div v-if="institutionTypes.length" class="institution-filters">
          <button
            class="filter-pill"
            :class="institutionType === '' ? 'active' : ''"
            @click="institutionType = ''"
          >全部</button>
          <button
            v-for="type in institutionTypes"
            :key="type"
            class="filter-pill"
            :class="institutionType === type ? 'active' : ''"
            @click="institutionType = type"
          >{{ type }}</button>
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
        <div v-else class="py-12 text-center text-gray-400">暂无培训机构</div>

        <div class="mt-8 flex items-center justify-end">
          <button class="more-link magnetic-btn" @click="onMoreInstitutions">
            共 {{ institutionTotal }} 家 · 查看更多机构
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- ==================== 专家指导弹窗 ==================== -->
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
        <div class="expert-info-row">
          <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <div>
            <p class="expert-info-label">公司地址</p>
            <p class="expert-info-value">{{ siteInfo?.basicMessage?.address }}</p>
          </div>
        </div>
        <div class="expert-info-row">
          <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          <div>
            <p class="expert-info-label">联系电话</p>
            <p class="expert-info-value">{{ siteInfo?.basicMessage?.phone }}</p>
          </div>
        </div>
        <div class="expert-info-row">
          <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <div>
            <p class="expert-info-label">联系邮箱</p>
            <p class="expert-info-value">{{ siteInfo?.basicMessage?.email }}</p>
          </div>
        </div>
        <div class="expert-info-row">
          <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          <div>
            <p class="expert-info-label">咨询时间</p>
            <p class="expert-info-value">{{ siteInfo?.basicMessage?.consultationTime }}</p>
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
          class="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 spring-fast"
          @click="expertDialogVisible = false"
        >我知道了</button>
      </template>
    </el-dialog>

    <!-- 悬浮百宝箱：贴墙可拖动，点击弹目录 -->
    <FloatingTreasure />
  </div>
</template>

<style scoped>
/* ============ Page ============ */
.home-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.25rem 4rem;
}

/* ============ Hero（不对称布局） ============ */
.hero-section {
  position: relative;
  padding: 3rem 0 2rem;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
  letter-spacing: 1px;
}

.hero-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
}

.hero-title {
  margin-top: 1.25rem;
  font-size: clamp(2rem, 3vw, 3.2rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-logo {
  width: clamp(3.5rem, 5vw, 5rem);
  height: clamp(3.5rem, 5vw, 5rem);
  flex-shrink: 0;
}

.hero-title-gradient {
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  max-width: 520px;
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.85;
  color: #6b7280;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
}

.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.3);
  text-decoration: none;
}

.hero-btn-primary:hover {
  box-shadow: 0 6px 24px rgba(249, 115, 22, 0.45);
}

.hero-btn-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.hero-btn-primary:hover .hero-btn-icon {
  transform: translateX(3px);
}

.hero-btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6b7280;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e5e7eb;
  text-decoration: none;
}

.hero-btn-secondary:hover {
  color: #e8722a;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(255, 247, 237, 0.6);
}

/* Stats Glass Card */
.hero-visual {
  display: flex;
  justify-content: flex-end;
}

.stats-card {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
  padding: 2rem 2.5rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(249, 115, 22, 0.12);
  box-shadow: 0 8px 40px rgba(249, 115, 22, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.stats-card-glow {
  position: absolute;
  top: -30%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: clamp(1.6rem, 2.2vw, 2.2rem);
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.stat-label {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

/* ============ Sections ============ */
.section-wrapper {
  padding: 3.5rem 0;
  position: relative;
}

.section-alt {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
}

.section-head {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: linear-gradient(180deg, #f97316, #fb923c);
}

.section-sub {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #6b7280;
}

/* ============ Scroll Reveal（从左往右显现） ============ */
.reveal-left {
  opacity: 0;
  transform: translateX(-32px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-left.revealed {
  opacity: 1;
  transform: translateX(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-left {
    transition: none;
    opacity: 1;
    transform: none;
  }
}

/* ============ Announcement ============ */
.announcement-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

/* ============ Planner Nav ============ */
.nav-arrow-btn {
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(249, 115, 22, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  color: #6b7280;
  cursor: pointer;
}

@media (min-width: 768px) {
  .nav-arrow-btn {
    width: 2.75rem;
    height: 2.75rem;
  }
}

.nav-arrow-btn:hover:not(:disabled) {
  color: #f97316;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.15);
}

.nav-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.page-dot.active {
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
}

/* ============ Institution ============ */
.institution-search {
  display: flex;
  max-width: 32rem;
  margin: 0 auto 1.5rem;
  align-items: center;
  gap: 0.75rem;
}

.institution-input {
  flex: 1;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.institution-input:hover {
  border-color: #fdba74;
}

.institution-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.institution-search-btn {
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.institution-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.filter-pill {
  border-radius: 9999px;
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  background: rgba(255, 247, 237, 0.6);
  color: #e8722a;
  border: 1px solid transparent;
  cursor: pointer;
}

.filter-pill:hover {
  background: rgba(255, 247, 237, 1);
}

.filter-pill.active {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}

.more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #f97316;
  cursor: pointer;
  background: none;
  border: none;
}

.more-link:hover {
  color: #ea580c;
}

/* ============ Expert Dialog Info ============ */
.expert-info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 247, 237, 0.6);
  padding: 0.75rem;
}

.expert-info-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: #f97316;
}

.expert-info-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.expert-info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* ============ Responsive ============ */
@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .hero-visual {
    justify-content: center;
  }
  .entry-bento {
    grid-template-columns: repeat(2, 1fr);
  }
  .entry-card-wrapper:first-child {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 0 0.875rem 3rem;
  }
  .hero-section {
    padding: 2rem 0 1rem;
  }
  .hero-title {
    font-size: clamp(1.6rem, 6vw, 2.2rem);
  }
  .stats-card {
    padding: 1.5rem;
    gap: 1.25rem 1.5rem;
  }
  .announcement-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .entry-bento {
    grid-template-columns: 1fr;
  }
  .entry-card-wrapper:first-child {
    grid-column: span 1;
  }
  .section-wrapper {
    padding: 2.5rem 0;
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
