<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Component } from 'vue'
import { getUniversityDetail, getCampusGallery } from '@/api/university'
import type { UniversityDetailVO, GalleryItemVO } from '@/types/university'
import { ElMessage } from 'element-plus'
import { MemberType } from '@haifeng/shared'
import { useUserStore } from '@/store'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import LaboratoryTab from '@/components/university/LaboratoryTab.vue'
import DepartmentTab from '@/components/university/DepartmentTab.vue'
import SubjectEvaluationTab from '@/components/university/SubjectEvaluationTab.vue'
import PostgradMajorForUniversityTab from '@/components/major/PostgradMajorForUniversityTab.vue'
import ChannelTab from '@/components/university/ChannelTab.vue'
import AdmissionGroupTab from '@/components/university/AdmissionGroupTab.vue'
import CampusGalleryTab from '@/components/university/CampusGalleryTab.vue'
import Guide from './Guide.vue'

type TabKey = 'overview' | 'postgrad' | 'guide' | 'gallery'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)
const detailError = ref(false)

const universityId = computed(() => route.params.id as string)
const isVip = computed(() => userStore.userInfo?.memberType === MemberType.VIP)

// ===== 四大 Tab：院校概况 / 可报考研专业 / 院校适应指南 / 校园风光 =====
const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '院校概况' },
  { key: 'postgrad', label: '可报考研专业' },
  { key: 'guide', label: '院校适应指南' },
  { key: 'gallery', label: '校园风光' },
]

const TAB_ICONS: Record<TabKey, string[]> = {
  overview: [
    'M4 21h16',
    'M6 21V9l6-4 6 4v12',
    'M9 21v-4h6v4',
    'M9.5 11.5h.01',
    'M14.5 11.5h.01',
  ],
  postgrad: [
    'M22 9L12 5 2 9l10 4 10-4z',
    'M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4',
    'M22 9v4',
  ],
  guide: [
    'M4 19.5A2.5 2.5 0 016.5 17H20',
    'M4 19.5V5a2 2 0 012-2h12a2 2 0 012 2v12H6.5A2.5 2.5 0 004 19.5z',
    'M8 7h8',
  ],
  gallery: [
    'M3 5h18v14H3z',
    'M8 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
    'M21 15l-5-5L7 19',
  ],
}

function resolveTab(): TabKey {
  const raw = route.query.tab
  const tab = Array.isArray(raw) ? raw[0] : raw
  if (tab === 'overview' || tab === 'postgrad' || tab === 'guide' || tab === 'gallery') {
    return tab
  }
  const rawCat = route.query.cat
  const cat = Array.isArray(rawCat) ? rawCat[0] : rawCat
  return cat === 'gallery' ? 'gallery' : 'overview'
}

const initialTab = resolveTab()
const activeTab = ref<TabKey>(initialTab)
const postgradMounted = ref(initialTab === 'postgrad')
const guideMounted = ref(initialTab === 'guide')
const galleryMounted = ref(initialTab === 'gallery')
const scrollPositions: Partial<Record<TabKey, number>> = {}

function ensureMounted(tab: TabKey) {
  if (tab === 'postgrad') postgradMounted.value = true
  if (tab === 'guide') guideMounted.value = true
  if (tab === 'gallery') galleryMounted.value = true
}

function updateQuery(tab: TabKey) {
  const query = { ...route.query }
  delete query.cat
  if (tab === 'overview') {
    delete query.tab
  } else {
    query.tab = tab
  }

  const rawCurrent = route.query.tab
  const currentTab = Array.isArray(rawCurrent) ? rawCurrent[0] : rawCurrent
  const targetTab = tab === 'overview' ? undefined : tab
  if (currentTab === targetTab && !route.query.cat) return

  router.replace({ path: route.path, query })
}

function scrollToTabBar() {
  nextTick(() => {
    const el = tabBarRef.value
    if (!el) return
    const top = window.scrollY + el.getBoundingClientRect().top - barTop.value
    if (window.scrollY <= top) return
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
  })
}

function switchTab(tab: TabKey, updateRoute = true) {
  if (activeTab.value === tab) {
    if (updateRoute) updateQuery(tab)
    scrollToTabBar()
    return
  }

  scrollPositions[activeTab.value] = window.scrollY
  activeTab.value = tab
  ensureMounted(tab)
  if (updateRoute) updateQuery(tab)

  nextTick(() => {
    const saved = scrollPositions[tab]
    if (typeof saved === 'number') {
      window.scrollTo({ top: saved, behavior: 'auto' })
    } else {
      scrollToTabBar()
    }
  })
}

function applyRouteTab() {
  const tab = resolveTab()
  if (tab === activeTab.value) {
    if (route.query.cat === 'gallery') updateQuery(tab)
    return
  }
  switchTab(tab, false)
  updateQuery(tab)
}

watch(
  () => [route.query.tab, route.query.cat],
  () => applyRouteTab(),
)

watch(activeTab, (tab) => {
  if (tab !== 'overview') return
  nextTick(() => {
    setupSpy()
    measureHeader()
  })
})

// ===== 六大板块：纵向平铺，每块预览前 N 条，「查看全部」开右侧抽屉 =====
const sections: { key: string; label: string; anchor: string; strong: boolean; previewCount: number }[] = [
  { key: 'admission', label: '历年录取数据', anchor: 'admission-data', strong: true, previewCount: 5 },
  { key: 'evaluation', label: '学科评估', anchor: 'discipline', strong: true, previewCount: 4 },
  { key: 'postgrad', label: '考研专业', anchor: 'postgraduate', strong: false, previewCount: 3 },
  { key: 'laboratory', label: '重点实验室', anchor: 'lab', strong: false, previewCount: 4 },
  { key: 'department', label: '院系设置', anchor: 'department', strong: false, previewCount: 6 },
  { key: 'channel', label: '特殊招生通道', anchor: 'admission-channel', strong: false, previewCount: 3 },
]

const sectionComponents: Record<string, Component> = {
  laboratory: LaboratoryTab,
  postgrad: PostgradMajorForUniversityTab,
  department: DepartmentTab,
  evaluation: SubjectEvaluationTab,
  channel: ChannelTab,
  admission: AdmissionGroupTab,
}

/** 各板块总数（由 Tab 组件 @total 上报；undefined = 尚未加载完成，不参与隐藏判断） */
const sectionTotals = reactive<Record<string, number>>({})

function isSectionHidden(key: string) {
  return key !== 'admission' && sectionTotals[key] === 0
}

// ===== 「查看全部」右侧抽屉 =====
const drawerVisible = ref(false)
const drawerKey = ref('')
const drawerSize = ref('25%')

const drawerTitle = computed(() => sections.find((s) => s.key === drawerKey.value)?.label || '查看全部')

function openSection(key: string) {
  drawerSize.value = window.innerWidth < 1024 ? '92%' : '25%'
  drawerKey.value = key
  drawerVisible.value = true
}

// ===== 概况右侧栏：校园风光 =====
const galleryList = ref<GalleryItemVO[]>([])

async function fetchGallery() {
  if (!universityId.value) return
  try {
    const res = await getCampusGallery(universityId.value, { page: 1, size: 10 })
    galleryList.value = (res.data.data.records ?? []).slice(0, 6)
  } catch {
    galleryList.value = []
  }
}

// ===== 吸顶层级：AppHeader → TabBar → 概况二级导航 =====
const { hidden: headerHidden } = useAutoHideHeader()
const stickyTop = ref(64)
const tabsHeight = ref(56)
const tabBarRef = ref<HTMLElement | null>(null)
const subNavRef = ref<HTMLElement | null>(null)
const tabsStuck = ref(false)
const subNavStuck = ref(false)

function measureHeader() {
  const headerHeight = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (headerHeight && headerHeight > 0) stickyTop.value = Math.round(headerHeight)

  const tabHeight = tabBarRef.value?.getBoundingClientRect().height
  if (tabHeight && tabHeight > 0) tabsHeight.value = Math.round(tabHeight)

  updateStickiness()
}

const barTop = computed(() => (headerHidden.value ? 0 : stickyTop.value))
const overviewSubNavTop = computed(() => barTop.value + tabsHeight.value)
const anchorOffset = computed(() => overviewSubNavTop.value + 56)
const overviewRailTop = computed(() => overviewSubNavTop.value + 64)
const guideStickyTop = computed(() => barTop.value + tabsHeight.value + 16)

function updateStickiness() {
  const bar = tabBarRef.value
  tabsStuck.value = !!bar && bar.getBoundingClientRect().top <= barTop.value + 0.5

  if (activeTab.value !== 'overview') {
    subNavStuck.value = false
    return
  }
  const sub = subNavRef.value
  subNavStuck.value = !!sub && sub.getBoundingClientRect().top <= overviewSubNavTop.value + 0.5
}

watch([barTop, overviewSubNavTop], () => updateStickiness())

// ===== 概况二级导航 + ScrollSpy =====
const navItems = computed(() => {
  const items = [{ anchor: 'overview', label: '概况', strong: false }]
  for (const sec of sections) {
    if (isSectionHidden(sec.key)) continue
    items.push({ anchor: sec.anchor, label: sec.label, strong: sec.strong })
  }
  return items
})

const activeAnchor = ref('overview')

function scrollToSection(anchor: string) {
  activeAnchor.value = anchor
  document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let spyObserver: IntersectionObserver | null = null

function setupSpy() {
  spyObserver?.disconnect()
  spyObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeAnchor.value = entry.target.id
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  nextTick(() => {
    if (!spyObserver) return
    for (const item of navItems.value) {
      const el = document.getElementById(item.anchor)
      if (el) spyObserver.observe(el)
    }
  })
}

function onWinScroll() {
  updateStickiness()
  if (activeTab.value !== 'overview') return

  const doc = document.documentElement
  if (window.innerHeight + window.scrollY >= doc.scrollHeight - 40) {
    const last = navItems.value[navItems.value.length - 1]
    if (last) activeAnchor.value = last.anchor
  }
}

watch(activeAnchor, () => {
  nextTick(() => {
    document
      .querySelector('.sub-nav-item.is-active')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
})

watch([navItems, detail], () => {
  setupSpy()
  nextTick(() => measureHeader())
})

// ===== 路由跳转 =====
function goMajor() {
  router.push('/major')
}

function goBack() {
  router.push('/university')
}

async function fetchDetail() {
  const id = universityId.value
  if (!id) {
    ElMessage.error('院校ID不存在')
    return
  }
  loading.value = true
  detailError.value = false
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    detailError.value = true
    ElMessage.error(e?.message || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
  fetchGallery()
  updateQuery(activeTab.value)
  nextTick(() => measureHeader())
  window.addEventListener('resize', measureHeader)
  window.addEventListener('scroll', onWinScroll, { passive: true })
})

onBeforeUnmount(() => {
  spyObserver?.disconnect()
  window.removeEventListener('resize', measureHeader)
  window.removeEventListener('scroll', onWinScroll)
})

// ===== 亮点数字滚动计数 =====
const scoreAnim = reactive({
  history: 0,
  science: 0,
  recommend: 0,
  majors: 0,
})

function animateNumber(key: keyof typeof scoreAnim, target: number) {
  const from = scoreAnim[key]
  if (from === target) return
  const duration = 700
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    scoreAnim[key] = Math.round(from + (target - from) * eased)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(detail, (d) => {
  if (!d) return
  animateNumber('history', d.historyGroupScore ?? 0)
  animateNumber('science', d.scienceGroupScore ?? 0)
  animateNumber('majors', d.majorCount ?? 0)
  animateNumber('recommend', d.recommendationRate ?? 0)
})

// ===== 身份区：logo / 封面 =====
const heroLogo = computed(() => detail.value?.imageUrl || '')
const heroLogoText = computed(() => (detail.value?.name || '').slice(0, 1))
const introThumb = computed(() => detail.value?.carouselImages?.[0] || '')
const identityCover = computed(
  () => detail.value?.carouselImages?.[0] || introThumb.value || '',
)

// ===== 排行榜展示映射 =====
const rankingMeta: Record<string, { name: string; abbr: string; short: string }> = {
  qs: { name: 'QS 世界大学排名', abbr: 'QS', short: 'QS 世界大学' },
  ruanke: { name: '软科中国大学排名', abbr: '软', short: '软科中国大学' },
  usnews: { name: 'US News 世界大学排名', abbr: 'US', short: 'US News 世界' },
  wushulian: { name: '武书连中国大学排名', abbr: '武', short: '武书连中国大学' },
  xiaoyouhui: { name: '校友会中国大学排名', abbr: '校', short: '校友会中国大学' },
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 py-8">
      <div class="univ-page-flow">
        <!-- 骨架屏 -->
        <template v-if="loading && !detail">
          <div class="identity-skeleton">
            <div class="skeleton h-10 w-28 rounded-lg" />
            <div class="flex gap-4 mt-5">
              <div class="skeleton h-[68px] w-[68px] rounded-2xl" />
              <div class="flex-1 space-y-3">
                <div class="skeleton h-8 w-64 rounded-lg" />
                <div class="skeleton h-4 w-40 rounded-lg" />
                <div class="skeleton h-4 w-80 rounded-lg" />
              </div>
              <div class="skeleton h-[132px] w-[220px] rounded-xl hidden md:block" />
            </div>
          </div>
          <div class="skeleton h-[58px] rounded-xl mt-5" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" />
          </div>
          <div class="space-y-6 mt-6">
            <div v-for="i in 3" :key="i" class="h-40 skeleton rounded-2xl" />
          </div>
        </template>

        <template v-else-if="detail">
          <!-- ===== 白色紧凑身份区 ===== -->
          <section class="identity-card">
            <button class="identity-back" @click="goBack">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              返回院校库
            </button>

            <div class="identity-row">
              <div class="identity-logo">
                <img
                  v-if="heroLogo"
                  :src="heroLogo"
                  :alt="detail.name"
                  class="h-full w-full object-contain p-1.5"
                />
                <span v-else class="identity-logo__text">{{ heroLogoText }}</span>
              </div>

              <div class="identity-info">
                <div class="identity-name-row">
                  <h1>{{ detail.name }}</h1>
                </div>
                <p v-if="detail.nameEn" class="identity-en">{{ detail.nameEn }}</p>

                <div v-if="detail.tags?.length" class="identity-tags">
                  <span
                    v-for="(tag, index) in detail.tags"
                    :key="tag"
                    class="identity-tag"
                    :class="`identity-tag--tone-${index % 4}`"
                  >
                    {{ tag }}
                  </span>
                </div>

                <p
                  v-if="[detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).length"
                  class="identity-meta"
                >
                  {{ [detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).join(' · ') }}
                </p>
              </div>

              <button class="identity-cover" @click="switchTab('gallery')">
                <img
                  v-if="identityCover"
                  :src="identityCover"
                  :alt="`${detail.name}校园风光`"
                  class="h-full w-full object-cover"
                />
                <span v-else class="identity-cover__fallback">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9.5" r="1.5" />
                    <path d="M21 15l-4.5-4.5L9 18" />
                  </svg>
                </span>
                <span class="identity-cover__mask">校园风光</span>
              </button>
            </div>
          </section>

          <!-- ===== 四大 Tab（吸顶） ===== -->
          <nav
            ref="tabBarRef"
            class="detail-tabs"
            :class="{ 'is-stuck': tabsStuck }"
            :style="{ top: `${barTop}px` }"
          >
            <div class="detail-tabs__inner">
              <button
                v-for="tab in TABS"
                :key="tab.key"
                class="detail-tab"
                :class="{ 'is-active': activeTab === tab.key }"
                @click="switchTab(tab.key)"
              >
                <svg
                  class="detail-tab__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path v-for="(d, index) in TAB_ICONS[tab.key]" :key="index" :d="d" />
                </svg>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </nav>

          <!-- ===== 院校概况 ===== -->
          <section v-show="activeTab === 'overview'" class="tab-panel">
            <!-- 亮点统计卡 -->
            <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div class="stat-card">
                <div class="stat-icon bg-orange-50 text-orange-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">历史组分数线</p>
                  <p v-if="detail.historyGroupScore" class="stat-value">{{ scoreAnim.history }}</p>
                  <p v-else class="stat-empty">数据持续整理中</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-sky-50 text-sky-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">物理组分数线</p>
                  <p v-if="detail.scienceGroupScore" class="stat-value">{{ scoreAnim.science }}</p>
                  <p v-else class="stat-empty">数据持续整理中</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-emerald-50 text-emerald-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">推荐率</p>
                  <p v-if="detail.recommendationRate" class="stat-value">{{ scoreAnim.recommend }}%</p>
                  <p v-else class="stat-empty">数据持续整理中</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-violet-50 text-violet-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">专业数</p>
                  <p v-if="detail.majorCount" class="stat-value">{{ scoreAnim.majors }}</p>
                  <p v-else class="stat-empty">数据持续整理中</p>
                </div>
              </div>
            </section>

            <!-- 概况二级导航 -->
            <nav
              ref="subNavRef"
              class="sub-nav"
              :class="{ 'is-stuck': subNavStuck }"
              :style="{ top: `${overviewSubNavTop}px` }"
            >
              <div class="sub-nav-inner">
                <button
                  v-for="it in navItems"
                  :key="it.anchor"
                  class="sub-nav-item"
                  :class="{ 'is-active': activeAnchor === it.anchor, 'is-strong': it.strong }"
                  @click="scrollToSection(it.anchor)"
                >
                  <span v-if="it.strong" class="strong-dot" aria-hidden="true" />
                  {{ it.label }}
                </button>
              </div>
            </nav>

            <!-- 主体：左内容流 + 右侧栏 -->
            <div class="flex flex-col lg:flex-row gap-6 items-start mt-6">
              <div class="flex-1 min-w-0 space-y-6 w-full">
                <div id="overview" :style="{ scrollMarginTop: `${anchorOffset}px` }" class="space-y-6">
                  <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-white">
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                      <h3 class="text-xl font-bold text-gray-800">详细信息</h3>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">所属联盟</span>
                        <span class="text-gray-700 font-medium">{{ detail.famousUnion || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-brand shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">博士点</span>
                        <span class="text-gray-700 font-medium">{{ detail.hasDoctorate ? '有' : '无' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-brand shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">硕士点</span>
                        <span class="text-gray-700 font-medium">{{ detail.hasMaster ? '有' : '无' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-brand shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">学历层次</span>
                        <span class="text-gray-700 font-medium">{{ detail.educationLevel || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">主管部门</span>
                        <span class="text-gray-700 font-medium">{{ detail.department || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">地址</span>
                        <span class="text-gray-700">{{ detail.address || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">招生电话</span>
                        <span class="text-gray-700">{{ detail.admissionPhone || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">官网</span>
                        <a v-if="detail.website" :href="detail.website" target="_blank" class="text-brand-orange hover:underline truncate">{{ detail.website }}</a>
                        <span v-else class="text-gray-700">-</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">推荐年份</span>
                        <span class="text-gray-700 font-medium">{{ detail.recommendationYear ?? '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">出国比例</span>
                        <span class="text-gray-700">{{ detail.abroadRate || '-' }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="dot-gray shrink-0" />
                        <span class="text-gray-400 w-20 shrink-0">男女比例</span>
                        <span class="text-gray-700 font-medium">{{ detail.genderRatio || '-' }}</span>
                      </div>
                    </div>

                    <div v-if="detail.rankings && Object.keys(detail.rankings).length" class="mt-5 pt-4 border-t border-gray-100/80">
                      <div class="flex items-center gap-2 mb-3">
                        <div class="w-1 h-3.5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                        <p class="text-sm font-semibold text-gray-700">排行榜</p>
                      </div>
                      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        <div v-for="(val, key) in detail.rankings" :key="key" class="rounded-lg bg-gray-50 border border-gray-100 px-2 py-3 text-center">
                          <el-tooltip :content="rankingMeta[key]?.name || key" placement="top">
                            <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light text-white text-xs font-bold cursor-help shadow-md">{{ rankingMeta[key]?.abbr || key.slice(0, 1).toUpperCase() }}</span>
                          </el-tooltip>
                          <p class="mt-1.5 text-xs text-gray-700 leading-snug min-h-[28px] flex items-center justify-center">{{ rankingMeta[key]?.short || rankingMeta[key]?.name || key }}</p>
                          <div class="mt-1 flex items-baseline justify-center gap-0.5">
                            <span class="text-xl font-bold text-brand-orange tabular-nums">{{ val }}</span>
                            <span class="text-xs text-gray-400">名</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-white">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                      <h3 class="text-xl font-bold text-gray-800">院校介绍</h3>
                    </div>
                    <div class="flex flex-col md:flex-row gap-6">
                      <p class="flex-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction || '暂无详细介绍' }}</p>
                      <div class="w-full md:w-[260px] shrink-0 h-[170px] rounded-xl overflow-hidden intro-thumb bg-gradient-to-br from-orange-100 via-amber-50 to-sky-50">
                        <img v-if="introThumb" :src="introThumb" :alt="detail.name" class="h-full w-full object-cover" />
                      </div>
                    </div>
                  </section>
                </div>

                <template v-for="sec in sections" :key="sec.key">
                  <section
                    v-if="!isSectionHidden(sec.key)"
                    :id="sec.anchor"
                    :style="{ scrollMarginTop: `${anchorOffset}px` }"
                    class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-white"
                  >
                    <div class="flex items-center justify-between mb-5">
                      <div class="flex items-center gap-3">
                        <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                        <h3 class="text-xl font-bold text-gray-800">{{ sec.label }}</h3>
                        <span v-if="sectionTotals[sec.key]" class="count-pill">{{ sectionTotals[sec.key] }} 个</span>
                      </div>
                      <button class="view-all-btn" @click="openSection(sec.key)">
                        查看全部
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <component
                      :is="sectionComponents[sec.key]"
                      :university-id="universityId"
                      preview
                      @total="(v: number) => (sectionTotals[sec.key] = v)"
                    />
                  </section>
                </template>
              </div>

              <aside
                class="w-full lg:w-[290px] shrink-0 space-y-5 lg:sticky"
                :style="{ top: `${overviewRailTop}px` }"
              >
                <div class="side-card">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="side-title">校园风光</h4>
                    <button class="side-more" @click="switchTab('gallery')">查看更多 →</button>
                  </div>
                  <div v-if="galleryList.length" class="grid grid-cols-3 gap-1.5">
                    <div
                      v-for="(img, idx) in galleryList"
                      :key="idx"
                      class="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                      @click="switchTab('gallery')"
                    >
                      <img :src="img.imageUrl" :alt="`校园风光 ${idx + 1}`" class="h-full w-full object-cover transition-opacity duration-300 hover:opacity-85" />
                    </div>
                  </div>
                  <div v-else class="grid grid-cols-3 gap-1.5">
                    <div v-for="i in 6" :key="i" class="aspect-square rounded-lg bg-gradient-to-br from-orange-50 to-sky-50 animate-pulse" />
                  </div>
                </div>

                <div class="side-card">
                  <h4 class="side-title mb-2">升学参考</h4>
                  <p class="text-xs text-gray-500 leading-relaxed mb-3">查看该校近 5 年各专业组录取分数、位次与选科要求，辅助精准定位。</p>
                  <button class="side-btn w-full" @click="scrollToSection('admission-data')">
                    查看历年数据
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>

                <div class="side-card">
                  <h4 class="side-title mb-2">专业探索</h4>
                  <p class="text-xs text-gray-500 leading-relaxed mb-3">浏览全国高校专业目录，了解专业内涵、就业方向与开设院校。</p>
                  <button class="side-btn w-full" @click="goMajor">
                    查看专业目录
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>

                <div class="side-card side-card-guide">
                  <h4 class="side-title mb-2">入学适应指南</h4>
                  <p class="text-xs text-gray-500 leading-relaxed mb-3">生存、学业、社交、安全、生活五大维度，帮你快速适应大学生活。</p>
                  <button class="side-btn side-btn-solid w-full" @click="switchTab('guide')">前往查看</button>
                </div>
              </aside>
            </div>
          </section>

          <!-- ===== 可报考研专业 ===== -->
          <section v-show="activeTab === 'postgrad'" class="tab-panel">
            <div class="tab-head">
              <div>
                <h2>可报考研专业</h2>
                <p>查看该校硕士研究生招生专业、学位类型与考试科目信息。</p>
              </div>
            </div>
            <div class="tab-card">
              <PostgradMajorForUniversityTab v-if="postgradMounted" :university-id="universityId" />
            </div>
          </section>

          <!-- ===== 院校适应指南 ===== -->
          <section v-show="activeTab === 'guide'" class="tab-panel">
            <Guide
              v-if="guideMounted"
              :university-id="universityId"
              :university-name="detail.name"
              :is-vip="isVip"
              :sticky-top="guideStickyTop"
              @open-gallery="switchTab('gallery')"
              @open-overview="switchTab('overview')"
            />
          </section>

          <!-- ===== 校园风光 ===== -->
          <section v-show="activeTab === 'gallery'" class="tab-panel">
            <CampusGalleryTab
              v-if="galleryMounted"
              :university-id="universityId"
              :university-name="detail.name"
            />
          </section>
        </template>

        <template v-else-if="detailError">
          <section class="detail-error">
            <span class="detail-error__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 8v4M12 16h.01" />
                <path d="M10.3 3.6L2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.6a2 2 0 00-3.4 0z" />
              </svg>
            </span>
            <h2>院校信息加载失败</h2>
            <p>请检查网络后重试，或稍后再来查看。</p>
            <div class="detail-error__actions">
              <button class="detail-error__primary" @click="fetchDetail">重新加载</button>
              <button class="detail-error__ghost" @click="goBack">返回院校库</button>
            </div>
          </section>
        </template>
      </div>
    </main>

    <el-drawer v-model="drawerVisible" :title="drawerTitle" :size="drawerSize" destroy-on-close>
      <component
        v-if="drawerKey"
        :is="sectionComponents[drawerKey]"
        :university-id="universityId"
        @total="(v: number) => (sectionTotals[drawerKey] = v)"
      />
    </el-drawer>
  </div>
</template>

<style scoped>
/* ===== 白色紧凑身份区 ===== */
.identity-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 18px;
  padding: 16px 22px 20px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 6px 24px -10px rgba(15, 23, 42, 0.06);
}

.identity-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.identity-back:hover {
  background: #f8fafc;
  color: #ea580c;
}

.identity-row {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-top: 6px;
}

.identity-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.06) inset;
  overflow: hidden;
}

.identity-logo__text {
  font-size: 28px;
  font-weight: 800;
  color: #f97316;
}

.identity-info {
  flex: 1;
  min-width: 0;
}

.identity-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.identity-name-row h1 {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.identity-en {
  margin-top: 3px;
  font-size: 13px;
  color: #94a3b8;
}

.identity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.identity-tag {
  padding: 3px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}

.identity-tag--tone-0 {
  background: #fff7ed;
  color: #c2410c;
}

.identity-tag--tone-1 {
  background: #eff6ff;
  color: #2563eb;
}

.identity-tag--tone-2 {
  background: #ecfdf5;
  color: #059669;
}

.identity-tag--tone-3 {
  background: #fffbeb;
  color: #b45309;
}

.identity-meta {
  margin-top: 9px;
  font-size: 13px;
  color: #64748b;
}

.identity-cover {
  position: relative;
  overflow: hidden;
  width: 220px;
  height: 132px;
  flex: 0 0 220px;
  padding: 0;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fafc 60%, #fff7ed 100%);
  cursor: pointer;
}

.identity-cover__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(37, 99, 235, 0.32);
}

.identity-cover__fallback svg {
  width: 38px;
  height: 38px;
}

.identity-cover__mask {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.52);
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.identity-cover:hover .identity-cover__mask {
  background: rgba(234, 88, 12, 0.82);
}

.identity-skeleton {
  padding: 16px 22px 20px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 18px;
  background: #ffffff;
}

/* ===== TabBar ===== */
.detail-tabs {
  position: sticky;
  z-index: 40;
  top: 64px;
  margin-top: 18px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  transition: top 0.3s ease, box-shadow 0.2s ease;
}

.detail-tabs.is-stuck {
  box-shadow: 0 6px 18px -14px rgba(15, 23, 42, 0.24);
}

.detail-tabs__inner {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.detail-tabs__inner::-webkit-scrollbar {
  display: none;
}

.detail-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 15px 18px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.detail-tab:hover {
  color: #ea580c;
}

.detail-tab.is-active {
  color: #ea580c;
  font-weight: 700;
}

.detail-tab.is-active::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 0;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: #f97316;
}

.detail-tab__icon {
  width: 16px;
  height: 16px;
}

.tab-panel {
  padding-top: 20px;
}

/* ===== 考研 / 指南等通用面板 ===== */
.tab-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 0 2px 14px;
}

.tab-head h2 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.tab-head p {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.tab-card {
  padding: 20px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

/* ===== 亮点统计卡 ===== */
.stat-card {
  background: #ffffff;
  border: 1px solid rgba(232, 114, 42, 0.08);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fadeUp 0.55s ease both;
}
.stat-card:nth-child(1) { animation-delay: 0.08s; }
.stat-card:nth-child(2) { animation-delay: 0.14s; }
.stat-card:nth-child(3) { animation-delay: 0.20s; }
.stat-card:nth-child(4) { animation-delay: 0.26s; }
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -10px rgba(232, 114, 42, 0.18);
}
.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-label {
  font-size: 13px;
  color: #9aa3ad;
  margin-bottom: 2px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #e8722a;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
.stat-empty {
  font-size: 13px;
  color: #b8bfc7;
  line-height: 1.6;
}

/* ===== 字段前色点 ===== */
.dot-brand {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #e8722a;
  flex-shrink: 0;
}
.dot-gray {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #cbd5e1;
  flex-shrink: 0;
}

/* ===== 卡片：入场 stagger + hover 动效 ===== */
.detail-card {
  animation: fadeUp 0.55s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-card:hover {
  box-shadow: 0 14px 32px -10px rgba(232, 114, 42, 0.14);
}

/* ===== 板块标题计数胶囊 + 查看全部按钮 ===== */
.count-pill {
  padding: 1px 10px;
  border-radius: 9999px;
  background: rgba(232, 114, 42, 0.08);
  color: #e8722a;
  font-size: 12px;
  font-weight: 500;
}
.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  border: 1px solid rgba(232, 114, 42, 0.35);
  color: #e8722a;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.view-all-btn:hover {
  background: #e8722a;
  color: #ffffff;
  border-color: #e8722a;
}

/* ===== 右侧栏卡片 ===== */
.side-card {
  background: #ffffff;
  border: 1px solid rgba(232, 114, 42, 0.1);
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  animation: fadeUp 0.55s ease both;
}
.side-card-guide {
  background: linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%);
  border-color: rgba(232, 114, 42, 0.2);
}
.side-title {
  font-size: 15px;
  font-weight: 700;
  color: #374151;
}
.side-more {
  font-size: 12px;
  color: #e8722a;
  transition: opacity 0.2s ease;
}
.side-more:hover {
  opacity: 0.75;
}
.side-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(232, 114, 42, 0.35);
  color: #e8722a;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.side-btn:hover {
  background: rgba(232, 114, 42, 0.08);
}
.side-btn-solid {
  background: linear-gradient(90deg, #e8722a, #f97316);
  border: none;
  color: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(232, 114, 42, 0.5);
}
.side-btn-solid:hover {
  background: linear-gradient(90deg, #d96620, #ea6c0d);
}

/* ===== 介绍缩略图兜底 ===== */
.intro-thumb {
  animation: fadeUp 0.55s ease both;
}

/* ===== 概况吸顶二级导航 ===== */
.sub-nav {
  position: sticky;
  z-index: 35;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  transition: top 0.3s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.sub-nav.is-stuck {
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  animation: navDrop 0.2s ease;
}
@keyframes navDrop {
  from { opacity: 0.55; transform: translateY(-8px); }
  to { opacity: 1; transform: none; }
}
.sub-nav-inner {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sub-nav-inner::-webkit-scrollbar {
  display: none;
}
.sub-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}
.sub-nav-item:hover {
  color: #e8722a;
  background: rgba(232, 114, 42, 0.08);
}
.sub-nav-item.is-strong {
  font-weight: 700;
}
.strong-dot {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #f97316;
  flex-shrink: 0;
}
.sub-nav-item.is-active {
  color: #f97316;
  font-weight: 700;
}
.sub-nav-item.is-active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
  width: 18px;
  height: 3px;
  border-radius: 2px;
  background: #f97316;
}

/* ===== 关键帧 ===== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

/* ===== 响应式 ===== */
@media (max-width: 1023px) {
  .identity-cover {
    display: none;
  }

  .identity-name-row h1 {
    font-size: 24px;
  }

  .identity-logo {
    width: 56px;
    height: 56px;
    flex-basis: 56px;
    border-radius: 15px;
  }

  .identity-logo__text {
    font-size: 23px;
  }
}

@media (max-width: 767px) {
  .identity-card {
    padding: 14px 16px 18px;
  }

  .identity-row {
    gap: 12px;
  }

  .identity-name-row h1 {
    font-size: 21px;
  }

  .identity-tag {
    font-size: 10px;
    padding: 2px 7px;
  }

  .detail-tab {
    padding: 13px 12px;
    font-size: 13px;
  }

  .detail-tab.is-active::after {
    left: 12px;
    right: 12px;
  }

  .detail-tab__icon {
    display: none;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-card {
    padding: 0.85rem 1rem;
    gap: 0.6rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .sub-nav-inner {
    padding: 6px 8px;
  }

  .sub-nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }

  .tab-card {
    padding: 14px;
  }

  .tab-head h2 {
    font-size: 20px;
  }
}

/* ===== 详情加载失败 ===== */
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  padding: 48px 24px;
  border: 1px solid rgba(225, 29, 72, 0.14);
  border-radius: 18px;
  background: #ffffff;
  text-align: center;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 8px 28px -12px rgba(15, 23, 42, 0.08);
}

.detail-error__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: #fff1f2;
  color: #e11d48;
}

.detail-error__icon svg {
  width: 32px;
  height: 32px;
}

.detail-error h2 {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.detail-error p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.detail-error__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.detail-error__primary,
.detail-error__ghost {
  padding: 9px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.detail-error__primary {
  border: none;
  background: linear-gradient(90deg, #f97316, #ea580c);
  color: #ffffff;
  box-shadow: 0 6px 16px -8px rgba(234, 88, 12, 0.55);
}

.detail-error__primary:hover {
  background: linear-gradient(90deg, #ea580c, #c2410c);
}

.detail-error__ghost {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
}

.detail-error__ghost:hover {
  border-color: rgba(249, 115, 22, 0.35);
  background: #fff7ed;
  color: #ea580c;
}
</style>
