<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Component } from 'vue'
import { getUniversityDetail, getCampusGallery } from '@/api/university'
import type { UniversityDetailVO, GalleryItemVO } from '@/types/university'
import { ElMessage } from 'element-plus'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import LaboratoryTab from '@/components/university/LaboratoryTab.vue'
import DepartmentTab from '@/components/university/DepartmentTab.vue'
import SubjectEvaluationTab from '@/components/university/SubjectEvaluationTab.vue'
import PostgradMajorForUniversityTab from '@/components/major/PostgradMajorForUniversityTab.vue'
import ChannelTab from '@/components/university/ChannelTab.vue'
import AdmissionGroupTab from '@/components/university/AdmissionGroupTab.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)

const universityId = computed(() => route.params.id as string)

// ===== 六大板块：纵向平铺，每块预览前 N 条，「查看全部」开右侧抽屉 =====
// 顺序按需求文档：历年录取数据 → 学科评估 → 考研专业 → 重点实验室 → 院系设置 → 特殊招生通道
// anchor 为吸顶二级导航的锚点 ID；strong = 核心决策信息（导航加粗 + 橙点强调）
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

/** 空模块判断：total 已上报且为 0 才隐藏（未加载/未请求如非 VIP 不隐藏，保留 VIP 引导卡）。
 *  「历年录取数据」为核心高频模块，始终保留（空数据时 Tab 内部展示空状态）。 */
function isSectionHidden(key: string) {
  return key !== 'admission' && sectionTotals[key] === 0
}

// ===== 「查看全部」右侧抽屉（占约 1/4 屏，窄屏自动加宽） =====
const drawerVisible = ref(false)
const drawerKey = ref('')
const drawerSize = ref('25%')

const drawerTitle = computed(() => sections.find(s => s.key === drawerKey.value)?.label || '查看全部')

function openSection(key: string) {
  drawerSize.value = window.innerWidth < 1024 ? '92%' : '25%'
  drawerKey.value = key
  drawerVisible.value = true
}

// ===== 右侧栏：校园风光（图册前 6 张，更多跳 Guide 校园图册） =====
const galleryList = ref<GalleryItemVO[]>([])

async function fetchGallery() {
  if (!universityId.value) return
  try {
    // 后端分页 size 下限 10，取回后前端切 6 张
    const res = await getCampusGallery(universityId.value, { page: 1, size: 10 })
    galleryList.value = (res.data.data.records ?? []).slice(0, 6)
  } catch {
    // 图册加载失败不阻塞主内容
    galleryList.value = []
  }
}

// ===== 吸顶二级导航（Sticky Sub-Nav）+ ScrollSpy =====
// 吸附偏移：动态测量全局导航栏高度（写法对齐 FileLoadPage.stage-nav）；
// 全局头部滚动收起时 top 收为 0，填补空隙。
const { hidden: headerHidden } = useAutoHideHeader()
const stickyTop = ref(64)

function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

const barTop = computed(() => (headerHidden.value ? 0 : stickyTop.value))

/** 锚点滚动定位余量 = 吸顶子导航高度 + 呼吸间距（配合 scroll-margin-top 防遮挡） */
const anchorOffset = computed(() => barTop.value + 56)

/** 可用导航项：概况 + 未隐藏的板块（导航渲染与 ScrollSpy 目标都基于它动态生成） */
const navItems = computed(() => {
  const items = [{ anchor: 'overview', label: '概况', strong: false }]
  for (const sec of sections) {
    if (isSectionHidden(sec.key)) continue
    items.push({ anchor: sec.anchor, label: sec.label, strong: sec.strong })
  }
  return items
})

const activeAnchor = ref('')

/** 统一跳转方法：导航项与右侧栏「查看历年数据」共用 */
function scrollToSection(anchor: string) {
  activeAnchor.value = anchor // 点击立即高亮，滚动过程中由 observer 接管
  document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let spyObserver: IntersectionObserver | null = null

/** ScrollSpy：模块进入视口中上部（rootMargin -45%/-50% 的中部带）判定为当前模块 */
function setupSpy() {
  spyObserver?.disconnect()
  spyObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activeAnchor.value = e.target.id
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  nextTick(() => {
    if (!spyObserver) return
    for (const it of navItems.value) {
      const el = document.getElementById(it.anchor)
      if (el) spyObserver.observe(el)
    }
  })
}

// 页尾兜底：滚到底时强制高亮最后一项（最后模块可能进不了中部带）
function onWinScroll() {
  const doc = document.documentElement
  if (window.innerHeight + window.scrollY >= doc.scrollHeight - 40) {
    const last = navItems.value[navItems.value.length - 1]
    if (last) activeAnchor.value = last.anchor
  }
}

// 激活项变化时，移动端横向导航条自动把高亮项滚到可视区中间
watch(activeAnchor, () => {
  nextTick(() => {
    document.querySelector('.sub-nav-item.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
})

// 吸附状态：sentinel（子导航正上方 1px 元素）滚出视口顶 → 已吸附，切换入场动画/阴影
const navStuck = ref(false)
let stuckObserver: IntersectionObserver | null = null
const navSentinel = ref<HTMLElement | null>(null)

// 数据/可用模块变化后：重建 ScrollSpy 观察目标 + 重挂吸附哨兵（两者都在 detail 渲染后才存在）
watch([navItems, detail], () => {
  setupSpy()
  nextTick(() => {
    if (navSentinel.value) stuckObserver?.observe(navSentinel.value)
  })
})

function goGallery() {
  router.push(`/university/${universityId.value}/guide?cat=gallery`)
}

function goGuide() {
  router.push(`/university/${universityId.value}/guide`)
}

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
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
  fetchGallery()
  measureHeader()
  window.addEventListener('resize', measureHeader)
  window.addEventListener('scroll', onWinScroll, { passive: true })
  stuckObserver = new IntersectionObserver(
    ([entry]) => {
      navStuck.value = !entry.isIntersecting
    },
    { threshold: 0 },
  )
})

onBeforeUnmount(() => {
  spyObserver?.disconnect()
  stuckObserver?.disconnect()
  window.removeEventListener('resize', measureHeader)
  window.removeEventListener('scroll', onWinScroll)
})

// ===== 亮点数字滚动计数（纯展示动效，不触碰业务逻辑）=====
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

// ===== Hero logo：imageUrl 为院校 logo，无图回退校名首字 =====
const heroLogo = computed(() => detail.value?.imageUrl || '')
const heroLogoText = computed(() => (detail.value?.name || '').slice(0, 1))

// ===== Hero 背景轮播：carouselImages 全部图片，从第 0 张开始 =====
const heroSlides = computed(() => detail.value?.carouselImages || [])

// ===== 院校介绍右侧缩略图：取第一张轮播图，无则渐变兜底 =====
const introThumb = computed(() => detail.value?.carouselImages?.[0] || '')

// ===== 排行榜 key → 中文名 + 缩写 + 简称（纯展示映射，未知 key 兜底）=====
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
      <!-- 全局透底规则只打 main 直接子层，内容统一包在 flow 层内自持背景 -->
      <div class="univ-page-flow">
        <!-- 骨架屏 -->
        <template v-if="loading && !detail">
          <div class="rounded-2xl overflow-hidden mb-6">
            <div class="skeleton w-full h-[360px] rounded-2xl" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" />
          </div>
          <div class="space-y-6">
            <div v-for="i in 3" :key="i" class="h-40 skeleton rounded-2xl" />
          </div>
        </template>

        <template v-else-if="detail">
          <!-- ===== 沉浸式 Hero：轮播背景 + logo 圆标 + 信息叠加层 ===== -->
          <section class="hero relative rounded-2xl overflow-hidden shadow-card mb-6">
            <template v-if="heroSlides.length">
              <el-carousel height="380px" indicator-position="none" arrow="always" class="hero-carousel">
                <el-carousel-item v-for="(img, idx) in heroSlides" :key="idx">
                  <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
                </el-carousel-item>
              </el-carousel>
            </template>
            <div v-else class="hero-fallback" />

            <!-- 渐隐遮罩，保证文字可读 -->
            <div class="hero-mask" />

            <!-- 左上 logo 圆标（imageUrl） -->
            <div class="hero-logo absolute left-6 top-6 z-10">
              <img
                v-if="heroLogo"
                :src="heroLogo"
                :alt="detail.name"
                class="h-16 w-16 rounded-full object-contain bg-white shadow-lg p-1.5"
              />
              <span v-else class="h-16 w-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-2xl font-bold text-brand-orange">
                {{ heroLogoText }}
              </span>
            </div>

            <!-- 叠加信息层 -->
            <div class="hero-info">
              <h1 class="hero-name">{{ detail.name }}</h1>
              <p v-if="detail.nameEn" class="hero-name-en">{{ detail.nameEn }}</p>

              <div v-if="detail.tags?.length" class="hero-tags">
                <span v-for="tag in detail.tags" :key="tag" class="hero-tag">{{ tag }}</span>
              </div>

              <p
                v-if="[detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).length"
                class="hero-meta"
              >
                {{ [detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).join(' · ') }}
              </p>

              <div class="hero-actions">
                <button class="hero-btn-ghost" @click="goBack">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  返回院校库
                </button>
                <button class="hero-btn-solid" @click="goGuide">
                  查看适应指南
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <!-- ===== 亮点统计卡（带图标，空数据显示"数据持续整理中"） ===== -->
          <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

        <!-- 吸附哨兵：滚出视口顶 → 子导航进入吸附态（切换入场动画/阴影） -->
        <div ref="navSentinel" class="h-px" aria-hidden="true" />

        <!-- ===== 吸顶二级导航：概况/六大板块锚点（移动端横向滑动） ===== -->
        <nav class="sub-nav" :class="{ 'is-stuck': navStuck }" :style="{ top: `${barTop}px` }">
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

        <!-- ===== 主体：左内容流 + 右侧栏（移动端侧栏下沉） ===== -->
        <div class="flex flex-col lg:flex-row gap-6 items-start mt-6">
            <!-- 左侧内容流 -->
            <div class="flex-1 min-w-0 space-y-6 w-full">
              <!-- 概况：基本信息 + 排行榜 + 院校介绍（吸顶导航「概况」锚点） -->
              <div id="overview" :style="{ scrollMarginTop: `${anchorOffset}px` }" class="space-y-6">
                <!-- 详细信息 -->
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

                <!-- 排行榜 -->
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

              <!-- 院校介绍（右侧缩略图） -->
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

              <!-- 六大板块：纵向平铺（空数据模块整体不渲染，导航项同步隐藏） -->
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

            <!-- 右侧栏（lg 起吸顶，移动端下沉到内容后） -->
            <aside class="w-full lg:w-[290px] shrink-0 space-y-5 lg:sticky lg:top-24">
              <!-- 校园风光 -->
              <div class="side-card">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="side-title">校园风光</h4>
                  <button class="side-more" @click="goGallery">查看更多 →</button>
                </div>
                <div v-if="galleryList.length" class="grid grid-cols-3 gap-1.5">
                  <div
                    v-for="(img, idx) in galleryList"
                    :key="idx"
                    class="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                    @click="goGallery"
                  >
                    <img :src="img.imageUrl" :alt="`校园风光 ${idx + 1}`" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <div v-else class="grid grid-cols-3 gap-1.5">
                  <div v-for="i in 6" :key="i" class="aspect-square rounded-lg bg-gradient-to-br from-orange-50 to-sky-50 animate-pulse" />
                </div>
              </div>

              <!-- 升学参考 -->
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

              <!-- 专业探索 -->
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

              <!-- 适应指南 -->
              <div class="side-card side-card-guide">
                <h4 class="side-title mb-2">入学适应指南</h4>
                <p class="text-xs text-gray-500 leading-relaxed mb-3">生存、学业、社交、安全、生活五大维度，帮你快速适应大学生活。</p>
                <button class="side-btn side-btn-solid w-full" @click="goGuide">前往查看</button>
              </div>
            </aside>
          </div>
        </template>
      </div>
    </main>

    <!-- ===== 「查看全部」右侧抽屉（完整列表，含筛选/分页） ===== -->
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
/* ===== 沉浸式 Hero ===== */
.hero {
  height: 380px;
  animation: fadeUp 0.55s ease both;
}
.hero-carousel {
  height: 100%;
}
.hero-fallback {
  height: 100%;
  background: linear-gradient(135deg, #e8722a 0%, #f5a54a 100%);
}
.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(22, 14, 6, 0.72) 0%, rgba(22, 14, 6, 0.35) 40%, rgba(22, 14, 6, 0) 68%);
  pointer-events: none;
}
.hero-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1.5rem 2rem;
}
.hero-name {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}
.hero-name-en {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 2px;
}
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.hero-tag {
  padding: 2px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(2px);
  color: #ffffff;
  font-size: 12px;
}
.hero-meta {
  margin-top: 0.5rem;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}
.hero-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.hero-btn-ghost,
.hero-btn-solid {
  padding: 0.55rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}
.hero-btn-ghost {
  border: 1px solid rgba(255, 255, 255, 0.85);
  color: #ffffff;
}
.hero-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.15);
}
.hero-btn-solid {
  background: #ffffff;
  color: #e8722a;
  font-weight: 500;
}
.hero-btn-solid:hover {
  background: #fff4e6;
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

/* ===== 吸顶二级导航（样式基调对齐 FileLoadPage.stage-nav） ===== */
.sub-nav {
  position: sticky;
  z-index: 40;
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
  scrollbar-width: none; /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none;
}
.sub-nav-inner::-webkit-scrollbar {
  display: none; /* WebKit 隐藏滚动条 */
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
/* 核心决策项：字重加粗 + 品牌橙 4px 圆点 */
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
/* 激活项：品牌橙文字 + 3px 橙色短指示条 */
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
@media (max-width: 767px) {
  .sub-nav-inner {
    padding: 6px 8px;
  }
  .sub-nav-item {
    padding: 6px 10px;
    font-size: 13px;
  }
}

/* ===== 关键帧 ===== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

/* ===== 响应式 ===== */
@media (max-width: 767px) {
  .hero {
    height: 300px;
  }
  .hero-logo {
    left: 1rem;
    top: 1rem;
  }
  .hero-info {
    padding: 1rem 1.25rem;
  }
  .hero-name {
    font-size: 1.5rem;
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
}
</style>
