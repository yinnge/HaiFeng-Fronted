<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPlanners, getInstitutions } from '@/api/home'
import type { PlannerListVO, InstitutionListVO } from '@/types/home'
import PlannerCard from './components/PlannerCard.vue'
import CircularGallery from './components/CircularGallery.vue'
import HomePathwaySection from './components/HomePathwaySection.vue'
import ToolboxSection from './components/toolbox/ToolboxSection.vue'
import AnimatedLogo from '@/components/AnimatedLogo.vue'

// ===== Core =====
const router = useRouter()

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

// 入场动画收尾：动画跑完后补 is-settled，
// 让 .reveal 的 will-change 归还 auto —— 否则整段 section（首页矩阵 10 张卡）
// 会长期停留在合成层里，被位图化重采样后 1px 描边糊成 2px 灰雾、文字发虚。
// 详见 assets/styles/index.css 中 .reveal 段落的说明。
const settleReveal = (el: Element) => {
  el.classList.add('is-settled')
}

const revealElement = (el: Element) => {
  el.classList.add('revealed')
  const onEnd = (e: Event) => {
    const evt = e as TransitionEvent
    if (evt.target !== el || evt.propertyName !== 'filter') return
    el.removeEventListener('transitionend', onEnd)
    settleReveal(el)
  }
  el.addEventListener('transitionend', onEnd)
  // 兜底：减弱动效 / 元素被隐藏导致 transitionend 不触发时也能收尾
  window.setTimeout(() => {
    el.removeEventListener('transitionend', onEnd)
    settleReveal(el)
  }, 1200)
}

const initScrollReveal = () => {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' })

  const elements = document.querySelectorAll('.reveal, .reveal-left')
  elements.forEach(el => {
    // 对已在视口内的元素立即 reveal，避免 observer 未触发导致永久模糊
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el)
    } else {
      revealObserver!.observe(el)
    }
  })
}

// ===== Lifecycle =====
onMounted(() => {
  fetchPlanners()
  fetchInstitutions()
  updateViewport()
  window.addEventListener('resize', updateViewport)
  initScrollReveal()
})

onUnmounted(() => {
  if (revealObserver) revealObserver.disconnect()
  window.removeEventListener('resize', updateViewport)
})
</script>

<template>
  <div class="home-page">
    <!-- ==================== 消隐微网格 + 顶部双色极光（DESIGN.md） ==================== -->
    <div class="bg-grid-aurora" aria-hidden="true"></div>

    <!-- ==================== Hero（居中品牌头） ==================== -->
    <section class="hero-section grain-overlay">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-inner">
        <div class="hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
          </svg>
          AI 驱动 · 全周期升学规划
        </div>
        <h1 class="hero-title">
          <AnimatedLogo class="hero-logo" />
          <span>海枫<span class="hero-title-gradient">未来规划院</span></span>
        </h1>
        <p class="hero-desc">
          依托大数据分析与AI算法，科学规划志愿、精准匹配院校，海枫未来规划院助您圆梦理想。从初中高中、高考志愿到职场上岸，我们全程陪伴。
        </p>
      </div>
    </section>

    <!-- ==================== 全周期规划矩阵 / 生涯星图（可切换） ==================== -->
    <HomePathwaySection />

    <!-- ==================== 百宝箱 ==================== -->
    <section id="toolbox" class="section-wrapper section-toolbox">
      <div class="section-container reveal">
        <div class="section-head reveal-left">
          <h2 class="section-title">百宝箱</h2>
          <p class="section-sub">查询工具合集 · 院校、专业、城市、企业行业与竞赛证书一箱搞定</p>
        </div>

        <ToolboxSection />
      </div>
    </section>

    <!-- ==================== 专业规划师 ==================== -->
    <section class="section-wrapper section-planner">
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
    <section class="section-wrapper section-institution section-alt grain-overlay">
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

  </div>
</template>

<style scoped>
/* ============ Page ============ */
.home-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.25rem 4rem;
}

/* ============ 消隐微网格 + 顶部双色氛围极光（DESIGN.md） ============
   全屏固定层：以“未来规划”为中心点向外辐射，网格在屏幕中心显现、
   向四周羽化隐入纯净底色；顶部左微橙右微蓝两道柔光托住大标题。
   1) 作为 .home-page 的嵌套子元素（非 main 直接子节点），
      不受全局 `.app-shell main > * { background: transparent !important }` 影响。
   2) 祖先链（.app-shell / main）无 transform/filter，fixed 正确相对视口。
   3) 自身 mask 让网格+极光在边缘自然消隐，露出 html 同色底 #F8FAFC，无缝衔接。 */
.bg-grid-aurora {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: #f8fafc; /* 纯净极浅灰冷白底，与全局 html 画布同色 */
  background-image:
    /* 顶部极淡双色环境光晕：左微橙，右微蓝，烘托科技与青春 */
    radial-gradient(at 20% 0%, rgba(249, 115, 22, 0.08) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.06) 0px, transparent 50%),
    /* 细微网格线 (32px * 32px 宫格) —— 深蓝灰极弱透明度，不发脏 */
    linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;

  /* 核心：径向遮罩，让网格在四周自然消隐（不生硬到底） */
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%);
}

/* ============ Hero（居中品牌头） ============ */
.hero-section {
  position: relative;
  padding: 2.5rem 0 2rem;
  isolation: isolate;
}

/* 暖光只属于 Hero：不再铺满全站，避免整页橙色通胀 */
.hero-glow {
  position: absolute;
  inset: -3rem 10% auto;
  height: 24rem;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(ellipse 50% 60% at 72% 8%, rgba(249, 115, 22, 0.1), transparent 70%),
    radial-gradient(ellipse 44% 56% at 24% 0%, rgba(251, 191, 36, 0.08), transparent 72%);
  filter: blur(8px);
}

.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-bottom: 1.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: var(--sem-blue-bg);
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-badge svg {
  width: 0.875rem;
  height: 0.875rem;
}

.hero-title {
  margin-top: 0;
  font-size: clamp(2rem, 3vw, 3.2rem);
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-wrap: balance;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hero-logo {
  width: clamp(3.5rem, 5vw, 5rem);
  height: clamp(3.5rem, 5vw, 5rem);
  flex-shrink: 0;
}

.hero-title-gradient {
  background: linear-gradient(135deg, var(--brand-orange), var(--brand-orange-light));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  max-width: 640px;
  margin: 1rem auto 0;
  font-size: 1.05rem;
  line-height: 1.85;
  color: #6b7280;
}

/* ============ Sections ============ */
.section-wrapper {
  position: relative;
  padding: 3.5rem 0;
  scroll-margin-top: 8.75rem;
}

.section-alt {
  background: transparent;
}

.section-alt .section-container {
  padding: 2rem;
  border-radius: 1.5rem;
  background: #ffffff;
  border: 1px solid var(--neutral-border);
  box-shadow: 0 2px 10px var(--neutral-shadow);
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
  background: var(--sem-blue);
}

.section-toolbox .section-title::before {
  background: var(--sem-yellow);
}

.section-planner .section-title::before {
  background: var(--sem-blue);
}

.section-institution .section-title::before {
  background: var(--brand-orange);
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
  /* 用 none 而非 translateX(0)：平移归零后仍写成 transform 会让元素保留变换节点，
     叠加上层 .reveal 的合成层容易把子级描边/文字一起揉糊 */
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal-left {
    transition: none;
    opacity: 1;
    transform: none;
  }
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
  background: #ffffff;
  backdrop-filter: blur(8px);
  border: 1px solid var(--neutral-border-strong);
  box-shadow: 0 4px 16px var(--neutral-shadow);
  color: #64748b;
  cursor: pointer;
}

@media (min-width: 768px) {
  .nav-arrow-btn {
    width: 2.75rem;
    height: 2.75rem;
  }
}

.nav-arrow-btn:hover:not(:disabled) {
  color: var(--sem-blue);
  border-color: #bfdbfe;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.14);
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
  background: var(--sem-blue);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.35);
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
  border: 1px solid var(--neutral-border-strong);
  background: #ffffff;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #334155;
  outline: none;
  transition: border-color 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.institution-input::placeholder {
  color: #94a3b8;
}

.institution-input:hover {
  border-color: #cbd5e1;
}

.institution-input:focus {
  border-color: var(--sem-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.institution-search-btn {
  border-radius: 0.5rem;
  background: var(--sem-blue);
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.institution-search-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.22);
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
  background: var(--sem-blue-bg);
  color: #2563eb;
  border: 1px solid transparent;
  cursor: pointer;
}

.filter-pill:hover {
  background: #dbeafe;
}

.filter-pill.active {
  background: var(--sem-blue);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.22);
}

.more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--sem-blue);
  cursor: pointer;
  background: none;
  border: none;
}

.more-link:hover {
  color: #2563eb;
}

/* ============ Responsive ============ */
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
  .section-alt .section-container {
    padding: 1.25rem;
    border-radius: 1.125rem;
  }
}

@media (max-width: 640px) {
  .section-wrapper {
    padding: 2.5rem 0;
  }
  .hero-section {
    padding: 1.75rem 0 1rem;
  }
}
</style>
