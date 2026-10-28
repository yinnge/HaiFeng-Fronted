<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import {
  getFileLoadList,
  getFileLoadSubjects,
  getFileLoadTags,
} from '@/api/fileload'
import type { FileLoadListVO, FileLoadQueryDTO, FileLoadAudience } from '@/types/fileload'
import { useUserStore } from '@/store'
import FileCard from './components/FileCard.vue'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 / college=大学 / civil-service=考公 / postgrad-exam=考研 / graduate=研究生 */
  audience: FileLoadAudience
  /** 页面标题（路由 meta.title 亦可，此处用于 Banner 展示） */
  title?: string
  /**
   * 写死的面向人群（仅考公/考研/研究生三个单一人群的专栏由路由 props 传入，如 '考公人'）。
   * 初中/高中/大学专栏不传，由导航 query.stage 或页内行为决定。
   */
  stage?: string
  /**
   * 高中专栏：页内「当前身份」平铺按钮选项（高一/高二/高三），由父组件（高考模块）传入。
   * 传入即渲染身份筛选行，且身份与右上角档案身份完全分离（各自独立、互不驱动）。
   * 初中/大学专栏不传，改用 stageNav.identities。
   */
  identityOptions?: string[]
  /** 身份筛选初始值（高中专栏默认取用户档案身份 highIdentity） */
  initialIdentity?: string
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<FileLoadListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const loadError = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')

type SortMode = 'default' | 'latest' | 'name'
const sortBy = ref<SortMode>('default')
const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'latest', label: '最新发布' },
  { value: 'name', label: '名称排序' },
]
const PAGE_SIZE_OPTIONS = [12, 24, 36, 58, 110]
const listSectionRef = ref<HTMLElement | null>(null)

const sortedList = computed(() => {
  if (sortBy.value === 'default') return list.value
  const rows = [...list.value]
  if (sortBy.value === 'latest') {
    rows.sort((a, b) => (Date.parse(b.createTime || '') || 0) - (Date.parse(a.createTime || '') || 0))
  } else {
    rows.sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN'))
  }
  return rows
})

/**
 * 教师专属模式：从路由 query.teacher 初始化（详情页返回时保持一致）；
 * 仅在高中专栏（audience=high）提供切换按钮，走 /high/teacher 端点（仅老师身份可访问）
 */
const teacherMode = ref(route.query.teacher === '1')
/** 非老师身份访问教师专属时的拦截态 */
const teacherForbidden = ref(false)

/* ---------------- 筛选状态（AND 关系） ---------------- */
const subjectFilter = ref('')
const tagFilter = ref('')

/**
 * 页内子导航栏配置（按受众）。仅配置了的专栏才渲染导航栏，其余专栏（高中/大学/考公/考研/研究生）
 * 沿用原「导航栏下拉 + query.stage」模式，行为不变。
 * - filter：点击切到对应「面向人群」预设（设置 stageFilter 并查询），如「中考真题」固定查「中考资料」
 * - soon：敬请期待占位
 */
interface StageNavSection {
  key: string
  label: string
  mode: 'filter' | 'soon'
  /** filter 模式下选中的「面向人群」值（对应后端 applicableStage） */
  stage?: string
}

interface StageNavConfig {
  /** 模块标题，如「初中模块」 */
  label: string
  /** 身份切换选项（分段控件），从左到右 */
  identities: string[]
  /** 默认身份（必须是 identities 之一） */
  defaultIdentity: string
  sections: StageNavSection[]
}

/**
 * 面向人群筛选按钮（标签 ↔ 值 映射）：
 * - 展示「真题 / 政策解读」，回传后端仍是「资料 / 政策解读」（与 admin 端一致，避免旧数据迁移）；
 * - 列表由后端按 applicableStage 精确过滤，前端只负责标签展示与值透传。
 */
interface StageFilterOption {
  label: string
  value: string
}

const STAGE_FILTER_OPTIONS: Partial<Record<FileLoadAudience, StageFilterOption[]>> = {
  middle: [
    { label: '初一', value: '初一' },
    { label: '初二', value: '初二' },
    { label: '初三', value: '初三' },
    { label: '中考真题', value: '中考资料' },
    { label: '中考政策解读', value: '中考政策解读' },
  ],
  high: [
    { label: '高一', value: '高一' },
    { label: '高二', value: '高二' },
    { label: '高三', value: '高三' },
    { label: '高考真题', value: '高考资料' },
    { label: '高考政策解读', value: '高考政策解读' },
  ],
  college: [
    { label: '大一', value: '大一' },
    { label: '大二', value: '大二' },
    { label: '大三', value: '大三' },
    { label: '大四', value: '大四' },
  ],
}

const STAGE_NAV_CONFIG: Partial<Record<FileLoadAudience, StageNavConfig>> = {
  middle: {
    label: '初中模块',
    identities: ['初一', '初二', '初三'],
    defaultIdentity: '初三',
    sections: [
      { key: 'files', label: '初中资料', mode: 'filter', stage: '初三' },
      // 中考真题：固定查「中考资料」，展示别名「真题」
      { key: 'zhenti', label: '中考真题', mode: 'filter', stage: '中考资料' },
      // 原「初中资讯」占位项改为「中考政策解读」，选中即按该面向人群过滤
      { key: 'policy', label: '中考政策解读', mode: 'filter', stage: '中考政策解读' },
      { key: 'quiz', label: '在线练题', mode: 'soon' },
      { key: 'career', label: '初中生涯规划', mode: 'soon' },
    ],
  },
  college: {
    label: '大学模块',
    identities: ['大一', '大二', '大三', '大四'],
    defaultIdentity: '大一',
    sections: [
      { key: 'files', label: '大学资料', mode: 'filter', stage: '大一' },
      { key: 'news', label: '大学资讯', mode: 'soon' },
      { key: 'career', label: '大学生涯规划', mode: 'soon' },
    ],
  },
}

const stageNav = computed(() => STAGE_NAV_CONFIG[props.audience] || null)

/** 当前激活的目录项 key（仅用于子导航高亮；筛选值统一由 stageFilter 驱动） */
const activeSection = ref('files')

/**
 * 当前选中的「面向人群」筛选值（对应后端 applicableStage；空串 = 全部）。
 * 标签展示「真题 / 政策解读」，值透传「资料 / 政策解读」（见 STAGE_FILTER_OPTIONS）。
 * 初中/高中/大学专栏均由此单一状态驱动查询；考公/考研/研究生等单一人群专栏无此筛选行。
 */
const stageFilter = ref('')

/** 默认选中值：初中默认初三、大学默认大一、高中默认传入身份（与档案身份分离） */
function initStageFilter() {
  if (props.audience === 'middle') {
    stageFilter.value = STAGE_NAV_CONFIG.middle?.defaultIdentity || ''
  } else if (props.audience === 'college') {
    stageFilter.value = STAGE_NAV_CONFIG.college?.defaultIdentity || ''
  } else if (props.audience === 'high') {
    stageFilter.value = props.initialIdentity || props.identityOptions?.[0] || ''
  } else {
    stageFilter.value = ''
  }
}

/** 面向人群筛选按钮可选项（含标签/值映射）；无则专栏不渲染筛选行 */
const stageFilterOptions = computed<StageFilterOption[] | null>(
  () => STAGE_FILTER_OPTIONS[props.audience] ?? null,
)

/** 是否渲染「面向人群」平铺按钮行：配置了 STAGE_FILTER_OPTIONS 的专栏才显示 */
const showStageFilter = computed(() => !!STAGE_FILTER_OPTIONS[props.audience])

/**
 * 生效的面向人群（接口 applicableStage）：
 * - 配置了 STAGE_FILTER_OPTIONS 的专栏（初中/高中/大学）：由页内 stageFilter 驱动；
 * - 其它专栏（考公/考研/研究生单一人群）：沿用路由 props.stage，其次 query.stage。
 */
const effectiveStage = computed(() => {
  if (STAGE_FILTER_OPTIONS[props.audience]) return stageFilter.value
  return props.stage || (route.query.stage as string) || ''
})

/** 子导航目录点击：placeholder 弹提示；filter 预设切到对应「面向人群」并查询 */
function onSectionClick(sec: StageNavSection) {
  if (sec.mode === 'soon') {
    ElMessage.info(`「${sec.label}」敬请期待`)
    return
  }
  activeSection.value = sec.key
  if (sec.stage) stageFilter.value = sec.stage
}

/** 面向人群筛选按钮点击：选中即按该人群过滤（全部=清空 stageFilter，由 watch(effectiveStage) 重查） */
function onStageFilterClick(val: string) {
  stageFilter.value = val
}

/**
 * URL 深链回填：/middle?stage=中考政策解读、/gaokao?tab=highfile&stage=高考政策解读 等
 * 将 stageFilter 预设为对应「面向人群」值并高亮对应子导航项；无效值忽略，回落到默认。
 */
function syncFromQuery() {
  const nav = stageNav.value
  const s = (route.query.stage as string) || ''
  if (s && STAGE_FILTER_OPTIONS[props.audience]?.some((o) => o.value === s)) {
    stageFilter.value = s
    const hit = nav?.sections.find((x) => x.stage === s && x.mode === 'filter')
    if (hit) activeSection.value = hit.key
    return
  }
  // 无有效深链：回到默认目录与默认人群
  activeSection.value = 'files'
}

const subjectOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

const bannerTitleMap: Record<FileLoadAudience, string> = {
  middle: '初中专栏',
  high: '高中专栏',
  college: '大学专栏',
  'civil-service': '考公专栏',
  'postgrad-exam': '考研专栏',
  graduate: '研究生专栏',
}
const bannerTitle = computed(() => {
  if (teacherMode.value) return '教师专属资料'
  // 页内导航栏切到固定人群目录（如「中考真题」）时，标题跟随目录名，避免仍显示专栏名造成误解
  const nav = stageNav.value
  if (nav && activeSection.value !== 'files') {
    const sec = nav.sections.find((s) => s.key === activeSection.value)
    if (sec && sec.mode !== 'soon') return sec.label
  }
  return props.title || bannerTitleMap[props.audience]
})
const bannerDesc = computed(() => {
  if (teacherMode.value) return '教师专属精选学习资料，仅老师身份可见，持续更新中。'
  return audienceDescMap[props.audience] || audienceDescMap.middle
})
const audienceDescMap: Record<FileLoadAudience, string> = {
  middle: '涵盖各学科精品资料、真题试卷、备考指南，助力初中生高效学习、稳步提升！',
  high: '涵盖高中各学科精品资料、高考真题与备考指南，助力高中生高效复习、稳步提升！',
  college: '涵盖大学课程资料、考研就业与学业规划指南，助力大学生高效学习、稳步进阶！',
  'civil-service': '涵盖行测申论精品资料、历年真题与政策解读，助力考公人高效备考、稳步上岸！',
  'postgrad-exam': '涵盖考研公共课与专业课资料、历年真题、复习规划，助力考研人高效备考、稳步提升！',
  graduate: '涵盖科研工具、学术写作与研究生课程资料，助力研究生高效科研、稳步成长！',
}

const BANNER_FEATURES: Record<FileLoadAudience, string[]> = {
  middle: ['权威精选', '贴合考纲', '名师推荐', '持续更新'],
  high: ['权威精选', '贴合高考', '名师推荐', '持续更新'],
  college: ['权威精选', '贴合课程', '学长推荐', '持续更新'],
  'civil-service': ['权威精选', '紧扣大纲', '名师推荐', '持续更新'],
  'postgrad-exam': ['权威精选', '紧扣大纲', '名师推荐', '持续更新'],
  graduate: ['权威精选', '科研实用', '导师推荐', '持续更新'],
}

const bannerFeatureLabels = computed(() =>
  teacherMode.value
    ? ['权威精选', '教师专享', '名校资源', '持续更新']
    : (BANNER_FEATURES[props.audience] || BANNER_FEATURES.middle),
)
const FEATURE_TONES = ['blue', 'rose', 'amber', 'green']

const bannerTitleParts = computed(() => {
  if (/资料$/.test(bannerTitle.value)) {
    const main = bannerTitle.value.replace(/资料$/, '').trim()
    return { main: main || bannerTitle.value, lead: '', accent: main ? '精选资源' : '' }
  }
  return { main: bannerTitle.value, lead: '精选', accent: '学习资料' }
})

const hasActiveFilter = computed(() => !!(subjectFilter.value || tagFilter.value))

/** 拉取学科/模块的去重值（用于渲染筛选按钮组），失败不阻塞列表 */
async function fetchOptions() {
  try {
    const [sub, t] = await Promise.all([
      getFileLoadSubjects(props.audience, teacherMode.value),
      getFileLoadTags(props.audience, teacherMode.value),
    ])
    subjectOptions.value = sub.data.data || []
    tagOptions.value = t.data.data || []
  } catch {
    /* 选项加载失败忽略，列表仍可展示 */
  }
}

/**
 * 上一次请求的指纹：目录切换 / 身份切换 / URL 回填 / onMounted 会先后触发同一次查询，
 * 用指纹去重避免同一条件连打两次接口；请求失败时清空，允许重试。
 */
let lastQueryKey = ''

/**
 * 拉取列表。force=true 时跳过指纹去重：
 * 「中考真题」目录查询固定为「中考资料」，但按产品要求切换身份时仍要重新调一次接口
 * （保持交互一致性），此时查询条件与上一次完全相同。
 */
async function fetchList(force = false) {
  const queryKey = [
    props.audience, teacherMode.value, effectiveStage.value,
    subjectFilter.value, tagFilter.value, currentPage.value, pageSize.value,
  ].join('|')
  if (!force && queryKey === lastQueryKey) return
  lastQueryKey = queryKey

  loading.value = true
  teacherForbidden.value = false
  loadError.value = false
  try {
    const params: FileLoadQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
      subject: subjectFilter.value || undefined,
      // 面向人群由页内导航栏的目录/身份决定（无导航栏的专栏沿用路由 stage）；教师专属为独立数据集，不按阶段过滤
      applicableStage: teacherMode.value ? undefined : (effectiveStage.value || undefined),
      tag: tagFilter.value || undefined,
    }
    const res = await getFileLoadList(props.audience, params, teacherMode.value)
    list.value = res.data.data.records
    total.value = res.data.data.total
    loadError.value = false
  } catch (e: any) {
    lastQueryKey = '' // 失败允许重试
    const msg = e?.message || ''
    // 教师专属端点要求老师身份，非老师访问返回教师权限不足 → 友好拦截
    if (teacherMode.value && (msg.includes('教师') || msg.includes('1008'))) {
      teacherForbidden.value = true
      list.value = []
      total.value = 0
      return
    }
    if (list.value.length === 0) {
      loadError.value = true
    } else {
      ElMessage.error(e?.message || '获取文件列表失败')
    }
  } finally {
    loading.value = false
  }
}

/** 切换「教师专属」模式：重置筛选与分页后重新拉取（进入前需登录且为老师身份，老师接口要求登录+老师身份） */
async function toggleTeacher() {
  // 仅「进入教师专属」时需要校验（退出无需登录/老师身份）
  if (!teacherMode.value) {
    // 未登录：引导登录
    if (!userStore.isLoggedIn()) {
      userStore.setRedirectPath(router.currentRoute.value.fullPath)
      try {
        await ElMessageBox.confirm('教师专属资料需登录后查看，请先登录', '提示', {
          confirmButtonText: '前往登录',
          cancelButtonText: '取消',
          type: 'warning',
        })
        router.push('/login')
      } catch { /* 用户取消 */ }
      return
    }
    // 已登录但前端未持有会员信息：先拉取（确保 teacher 字段可用）
    if (!userStore.userInfo) {
      await userStore.fetchUserInfo()
    }
    // 非老师身份：直接拒绝，不切换视图（停留在高中资料，banner 不变）
    if (!userStore.userInfo?.teacher) {
      ElMessage.warning('您还不是教师身份，请联系管理员开通')
      return
    }
  }
  teacherMode.value = !teacherMode.value
  subjectFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  teacherForbidden.value = false
  fetchOptions()
  fetchList()
}

/** 筛选变化 → 回到第一页并重新查询 */
function onFilterChange() {
  currentPage.value = 1
  fetchList()
}

/** 学科按钮点击（单选）：点哪个查哪个；「全部」= 不带学科条件 */
function onSubjectClick(val: string) {
  if (subjectFilter.value === val) return
  subjectFilter.value = val
  onFilterChange()
}

/** 模块按钮点击（单选，对应后端 tag 字段）：「全部」= 不带模块条件 */
function onTagClick(val: string) {
  if (tagFilter.value === val) return
  tagFilter.value = val
  onFilterChange()
}

function resetFilters() {
  subjectFilter.value = ''
  tagFilter.value = ''
  onFilterChange()
}

/** 点击卡片（无单独详情按钮）→ 详情需登录/VIP：
 *  middle/high 列表公开，未登录先引导登录；college 列表页整页 requiresAuth，进到此处必已登录。
 *  已登录直接跳详情页，VIP 校验由详情页 onMounted 按 1005 业务码引导开通 */
async function openDetail(item: FileLoadListVO) {
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    try {
      await ElMessageBox.confirm('您还没有登录，请先登录', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      router.push('/login')
    } catch { /* 用户取消 */ }
    return
  }
  router.push({ path: `/${props.audience}/${item.id}`, query: teacherMode.value ? { teacher: '1' } : {} })
}

/* ---------------- 分页 ---------------- */
async function scrollToList() {
  await nextTick()
  listSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
  void scrollToList()
}

function onSizeSelect(event: Event) {
  const size = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(size)) return
  pageSize.value = size
  currentPage.value = 1
  fetchList()
  void scrollToList()
}

function onSortChange(event: Event) {
  sortBy.value = (event.target as HTMLSelectElement).value as SortMode
}

function onViewChange(mode: 'grid' | 'list') {
  viewMode.value = mode
}

function onRefresh() {
  lastQueryKey = ''
  fetchList()
}

/* ---------------- 吸附条偏移：动态测量导航栏高度，避免写死 ---------------- */
const stickyTop = ref(64)

function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

// 全局头部收起时，把吸顶偏移收为 0，填补顶部空隙（共享单例状态）
const { hidden: headerHidden } = useAutoHideHeader()
const barTop = computed(() => (headerHidden.value ? 0 : stickyTop.value))

onMounted(async () => {
  measureHeader()
  window.addEventListener('resize', measureHeader)
  initStageFilter()
  syncFromQuery()
  // 防止非老师通过 URL（?teacher=1）直入教师专属而跳变：已登录但非老师则回退到高中视图
  if (teacherMode.value && userStore.isLoggedIn()) {
    if (!userStore.userInfo) await userStore.fetchUserInfo()
    if (!userStore.userInfo?.teacher) {
      teacherMode.value = false
    }
  }
  fetchOptions()
  fetchList()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measureHeader)
})

// 路由复用同一组件时（middle ↔ high）切换受众需重新拉取；切走时关闭教师专属模式并按 URL 回填导航栏状态
watch(() => props.audience, () => {
  subjectFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  teacherMode.value = false
  initStageFilter()
  syncFromQuery()
  fetchOptions()
  fetchList()
})

// URL stage 变化（外部带参跳转 / 浏览器前进后退）→ 回填导航栏目录与身份
watch(() => route.query.stage, () => {
  syncFromQuery()
})

// 生效人群变化（导航栏目录切换 / 身份切换 / 路由 query.stage 变化）需重新拉取
watch(effectiveStage, () => {
  currentPage.value = 1
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <!-- 页内子导航栏（仅配置了 STAGE_NAV_CONFIG 的专栏渲染，当前为初中专栏）
         样式参照高考模块 ArchiveBar：左侧模块标题 + 中部目录 + 右侧身份切换（分段控件） -->
    <nav v-if="stageNav" class="stage-nav" :style="{ top: `${barTop}px` }">
      <div class="stage-nav-inner">
        <span class="stage-nav-label">
          <svg class="stage-nav-label-icon shrink-0 text-sem-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {{ stageNav.label }}
        </span>

        <div class="stage-nav-menu">
          <button
            v-for="sec in stageNav.sections"
            :key="sec.key"
            type="button"
            class="stage-nav-item"
            :class="{ 'is-active': activeSection === sec.key, 'is-soon': sec.mode === 'soon' }"
            @click="onSectionClick(sec)"
          >
            {{ sec.label }}
          </button>
        </div>

      </div>
    </nav>

    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-6">
        <div class="file-banner">
          <div class="file-banner__content">
            <div class="file-banner__badge-row">
              <span class="file-banner__badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 6.3v12.4" />
                  <path d="M12 6.3C10.8 5.5 9.2 5 7.5 5S4.2 5.5 3 6.3v12.4C4.2 18 5.8 18 7.5 18s3.3.5 4.5 1.3" />
                  <path d="M12 6.3C13.2 5.5 14.8 5 16.5 5s3.3.5 4.5 1.3v12.4c-1.2-.8-2.8-1.3-4.5-1.3s-3.3.5-4.5 1.3" />
                </svg>
                资料库
              </span>
              <button
                v-if="props.audience === 'high'"
                type="button"
                class="file-teacher-btn"
                :class="{ 'is-on': teacherMode }"
                @click="toggleTeacher"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="m12 4 9 5-9 5-9-5 9-5Z" />
                  <path d="M7 11.5V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />
                  <path d="M21 9v5" />
                </svg>
                {{ teacherMode ? '返回高中资料' : '教师专属' }}
              </button>
            </div>

            <h1 class="file-banner__title">
              {{ bannerTitleParts.main }}
              <span v-if="bannerTitleParts.lead" class="file-banner__lead">{{ bannerTitleParts.lead }}</span>
              <span class="file-banner__accent">{{ bannerTitleParts.accent }}</span>
            </h1>
            <p class="file-banner__desc">{{ bannerDesc }}</p>

            <div class="file-banner__features">
              <span
                v-for="(feature, index) in bannerFeatureLabels"
                :key="feature"
                class="file-feature"
                :class="`tone-${FEATURE_TONES[index]}`"
              >
                <span class="file-feature__icon">
                  <svg v-if="index === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3 5 6v5c0 4.4 3 8.4 7 10 4-1.6 7-5.6 7-10V6l-7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <svg v-else-if="index === 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="8" />
                    <circle cx="12" cy="12" r="3.5" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>
                  <svg v-else-if="index === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
                    <path d="M20 4v7h-7" />
                  </svg>
                </span>
                {{ feature }}
              </span>
            </div>
          </div>

          <div class="file-banner__note" aria-hidden="true">
            <span>好好学习</span>
            <span>未来可期！</span>
            <svg viewBox="0 0 120 12" preserveAspectRatio="none">
              <path d="M2 8c24-6 62-7 116-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
        </div>
      </Motion>

      <!-- 筛选栏 -->
      <section class="file-filter mb-6">
        <div class="file-filter__head">
          <div class="file-filter__title">
            <span class="file-filter__bar" aria-hidden="true"></span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
            </svg>
            <h2>筛选条件</h2>
          </div>
          <button v-if="hasActiveFilter" type="button" class="file-filter__reset" @click="resetFilters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 2.6-6.4" />
              <path d="M3 4v6h6" />
            </svg>
            重置筛选
          </button>
        </div>

        <!-- ① 面向人群（初中/高中/大学「资料」目录；标签展示真题/政策解读，值透传资料/政策解读）
             「全部」置首，红边高亮；其它人群选中为橙色渐变 -->
        <div v-if="showStageFilter" class="file-filter__row">
          <div class="file-filter__buttons">
            <button
              type="button"
              class="filter-pill filter-pill--all"
              :class="{ 'is-active': stageFilter === '' }"
              @click="onStageFilterClick('')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M2.8 19.5c.6-3 3-4.5 6.2-4.5s5.6 1.5 6.2 4.5" />
                <path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.4 15.4c2 .5 3.2 1.9 3.6 4.1" />
              </svg>
              全部
            </button>
            <button
              v-for="opt in stageFilterOptions"
              :key="opt.value"
              type="button"
              class="filter-pill"
              :class="{ 'is-active': stageFilter === opt.value }"
              @click="onStageFilterClick(opt.value)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.7-3.3 3.5-5 7-5s6.3 1.7 7 5" />
              </svg>
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- ② 学科（选项由后端动态返回去重值） -->
        <div v-if="subjectOptions.length" class="file-filter__row">
          <div class="file-filter__buttons">
            <button
              type="button"
              class="filter-pill filter-pill--all"
              :class="{ 'is-active': subjectFilter === '' }"
              @click="onSubjectClick('')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
              </svg>
              全部
            </button>
            <button
              v-for="o in subjectOptions"
              :key="o"
              type="button"
              class="filter-pill"
              :class="{ 'is-active': subjectFilter === o }"
              @click="onSubjectClick(o)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              </svg>
              {{ o }}
            </button>
          </div>
        </div>

        <!-- ③ 模块（原「标签」，选项由后端动态返回去重值） -->
        <div v-if="tagOptions.length" class="file-filter__row">
          <div class="file-filter__buttons">
            <button
              type="button"
              class="filter-pill filter-pill--all"
              :class="{ 'is-active': tagFilter === '' }"
              @click="onTagClick('')"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
              </svg>
              全部
            </button>
            <button
              v-for="o in tagOptions"
              :key="o"
              type="button"
              class="filter-pill"
              :class="{ 'is-active': tagFilter === o }"
              @click="onTagClick(o)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20.6 13.4 12 22a2 2 0 0 1-2.8 0L3 15.8V3h12.8l5.8 5.8a2 2 0 0 1 0 2.8Z" />
                <circle cx="8.5" cy="8.5" r="1.3" />
              </svg>
              {{ o }}
            </button>
          </div>
        </div>
      </section>

      <!-- 文件列表 -->
      <section ref="listSectionRef" class="file-list-panel">
        <div class="file-list-head">
          <div class="file-list-head__main">
            <span class="file-list-head__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 7a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.6.8L12 7h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
              </svg>
            </span>
            <div class="file-list-head__text">
              <div class="file-list-head__title">
                <h2>文件列表</h2>
                <span v-if="total" class="file-count">共 {{ total }} 份资料</span>
              </div>
              <p>精选优质学习资料，助你轻松备考</p>
            </div>
          </div>

          <div class="file-list-tools">
            <label class="file-sort">
              <span class="sr-only">排序方式</span>
              <select :value="sortBy" @change="onSortChange">
                <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </label>

            <div class="view-toggle" role="group" aria-label="视图切换">
              <button
                type="button"
                :class="{ 'is-active': viewMode === 'grid' }"
                aria-label="网格视图"
                :aria-pressed="viewMode === 'grid'"
                title="网格视图"
                @click="onViewChange('grid')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
              <button
                type="button"
                :class="{ 'is-active': viewMode === 'list' }"
                aria-label="列表视图"
                :aria-pressed="viewMode === 'list'"
                title="列表视图"
                @click="onViewChange('list')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 6h12M9 12h12M9 18h12" />
                  <circle cx="4" cy="6" r="1" />
                  <circle cx="4" cy="12" r="1" />
                  <circle cx="4" cy="18" r="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="file-list-body" :class="{ 'is-refreshing': loading && list.length > 0 }">
          <div v-if="loading && !list.length" class="file-skeleton-grid" aria-hidden="true">
            <div v-for="n in 8" :key="n" class="file-skeleton">
              <span class="file-skeleton__thumb"></span>
              <span class="file-skeleton__line is-title"></span>
              <span class="file-skeleton__line"></span>
              <span class="file-skeleton__line is-short"></span>
            </div>
          </div>

          <div v-else-if="teacherForbidden" class="file-state">
            <span class="file-state__icon tone-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m12 4 9 5-9 5-9-5 9-5Z" />
                <path d="M7 11.5V16c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" />
                <path d="M21 9v5" />
              </svg>
            </span>
            <p class="file-state__title">您还不是教师身份</p>
            <p class="file-state__desc">教师专属资料仅对老师身份开放，请联系管理员开通</p>
            <button type="button" class="file-state__primary" @click="toggleTeacher">返回高中资料</button>
          </div>

          <div v-else-if="loadError && !list.length" class="file-state">
            <span class="file-state__icon tone-rose">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M7 18a4 4 0 0 1-.9-7.9A5.5 5.5 0 0 1 16.9 9a4.5 4.5 0 0 1 .6 9H7Z" />
                <path d="m9.5 11.5 5 5M14.5 11.5l-5 5" />
              </svg>
            </span>
            <p class="file-state__title">资料加载失败</p>
            <p class="file-state__desc">网络可能开小差了，请稍后重试</p>
            <button type="button" class="file-state__primary" @click="onRefresh">重新加载</button>
          </div>

          <div v-else-if="!list.length" class="file-state">
            <span class="file-state__icon tone-slate">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 7a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.6.8L12 7h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
                <path d="m9.5 13 1.7 1.7 3.6-3.7" />
              </svg>
            </span>
            <p class="file-state__title">暂无符合条件的资料</p>
            <p class="file-state__desc">试试更换学科或模块，或重置筛选条件</p>
            <div class="file-state__actions">
              <button v-if="hasActiveFilter" type="button" class="file-state__primary" @click="resetFilters">重置筛选</button>
              <button type="button" class="file-state__ghost" @click="onRefresh">刷新试试</button>
            </div>
          </div>

          <div v-else class="file-grid" :class="`is-${viewMode}`">
            <FileCard
              v-for="item in sortedList"
              :key="item.id"
              :item="item"
              :view="viewMode"
              @open="openDetail"
            />
          </div>

          <div v-if="loading && list.length" class="file-list-updating">
            <span class="file-list-updating__spinner" aria-hidden="true"></span>
            更新中
          </div>
        </div>

        <div v-if="total > 0" class="file-pagination">
          <span class="file-pagination__total">共 <strong>{{ total }}</strong> 条</span>
          <el-pagination
            class="file-pagination__pages"
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="onPageChange"
          />
          <label class="file-pagination__size">
            <span>每页</span>
            <span class="file-size-select">
              <select :value="pageSize" @change="onSizeSelect">
                <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }} 条</option>
              </select>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </span>
          </label>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* ===== 页内子导航栏：样式参照高考模块 ArchiveBar（components/gaokao/ArchiveBar.vue） ===== */
.stage-nav {
  position: sticky;
  z-index: 40;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 8px rgba(15, 23, 42, 0.03);
  transition: top 0.3s ease;
}

.stage-nav-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 24px;
}

.stage-nav-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.stage-nav-label-icon {
  width: 18px;
  height: 18px;
}

/* 目录区：不用 overflow-x:auto（会裁掉 hover 阴影），靠 flex-wrap 换行 */
.stage-nav-menu {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex-shrink: 0;
}

.stage-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.stage-nav-item:hover {
  color: #2563eb;
  background: rgba(59, 130, 246, 0.08);
}

.stage-nav-item.is-active {
  color: #1d4ed8;
  background: #eff6ff;
  font-weight: 700;
}

.stage-nav-item:active {
  transform: scale(0.97);
}

/* 占位目录（资讯/练题/生涯规划）：灰色，点击弹「敬请期待」 */
.stage-nav-item.is-soon {
  color: #9ca3af;
}

.stage-nav-item.is-soon:hover {
  color: #64748b;
}

/* ===== 右侧身份切换：下拉框（初三/初二/初一、大一~大四） ===== */
.stage-identity {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.stage-identity-label {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
}

/* el-select 内部结构在子组件里，scoped 下必须 :deep() */
.stage-identity-select {
  width: 104px;
}

.stage-identity-select :deep(.el-select__wrapper) {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.stage-identity-select :deep(.el-select__wrapper.is-hovering),
.stage-identity-select :deep(.el-select__wrapper.is-focused) {
  background: #eff6ff;
  box-shadow: 0 0 0 1.5px #3b82f6 inset;
}

.stage-identity-select :deep(.el-select__selected-item) {
  font-size: 14px;
  font-weight: 700;
  color: #2563eb;
}

/* 药丸下拉不显示向下箭头（统一规范：导航栏/吸顶条上的下拉触发器不展示 svg 箭头） */
.stage-identity-select :deep(.el-select__suffix) {
  display: none;
}

@media (max-width: 767px) {
  .stage-nav-inner {
    gap: 12px;
    padding: 10px 16px;
  }

  .stage-nav-label,
  .stage-identity-label {
    display: none;
  }
}

/* ===== Banner ===== */
.file-banner {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 230px;
  padding: 28px 32px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 20px;
  background-color: #f8fafc;
  background-image: url('/background/img_1.png');
  background-position: right center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 10px 28px -16px rgba(15, 23, 42, 0.14);
}

.file-banner::before {
  position: absolute;
  inset: 0;
  content: '';
  background:
    radial-gradient(ellipse at 12% 0%, rgba(255, 247, 237, 0.95), transparent 58%),
    linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.94) 44%, rgba(255, 255, 255, 0.6) 64%, rgba(255, 255, 255, 0) 84%);
  pointer-events: none;
}

.file-banner__content {
  position: relative;
  z-index: 1;
  max-width: 660px;
  min-width: 0;
}

.file-banner__badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.file-banner__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  color: #ea580c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 999px;
  background: #fff7ed;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.2);
}

.file-banner__badge svg {
  width: 13px;
  height: 13px;
}

.file-teacher-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: 999px;
  background: linear-gradient(135deg, #0ea5e9, #06b6d4);
  box-shadow: 0 4px 10px -2px rgba(14, 165, 233, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-teacher-btn svg {
  width: 13px;
  height: 13px;
}

.file-teacher-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -2px rgba(14, 165, 233, 0.5);
}

.file-teacher-btn.is-on {
  color: #ea580c;
  border-color: rgba(249, 115, 22, 0.3);
  background: #ffffff;
  box-shadow: none;
}

.file-banner__title {
  color: #0f172a;
  font-size: clamp(24px, 2.5vw, 32px);
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -0.02em;
}

.file-banner__lead {
  margin-left: 4px;
  color: #334155;
  font-weight: 700;
}

.file-banner__accent {
  margin-left: 4px;
  color: #f97316;
}

.file-banner__desc {
  max-width: 600px;
  margin-top: 10px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.file-banner__features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.file-feature {
  --tone: #2563eb;
  --tone-bg: #eff6ff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px 6px 8px;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.03),
    inset 0 0 0 1px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(4px);
}

.file-feature__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--tone);
  border-radius: 7px;
  background: var(--tone-bg);
}

.file-feature__icon svg {
  width: 13px;
  height: 13px;
}

.file-feature.tone-blue {
  --tone: #2563eb;
  --tone-bg: #eff6ff;
}

.file-feature.tone-rose {
  --tone: #e11d48;
  --tone-bg: #fff1f2;
}

.file-feature.tone-amber {
  --tone: #d97706;
  --tone-bg: #fffbeb;
}

.file-feature.tone-green {
  --tone: #059669;
  --tone-bg: #ecfdf5;
}

.file-banner__note {
  position: absolute;
  top: 46px;
  right: 36px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #2563eb;
  font-family: 'STKaiti', 'KaiTi', 'Kaiti SC', '楷体', serif;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
  transform: rotate(-5deg);
  opacity: 0.88;
}

.file-banner__note svg {
  width: 92px;
  height: 10px;
  margin-top: 1px;
  color: rgba(37, 99, 235, 0.55);
}

/* ===== 筛选区 ===== */
.file-filter {
  padding: 16px 18px;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 6px 20px -14px rgba(15, 23, 42, 0.12);
}

.file-filter__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f8fafc;
}

.file-filter__title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #0f172a;
}

.file-filter__title > svg {
  width: 16px;
  height: 16px;
  color: #f97316;
}

.file-filter__title h2 {
  font-size: 15px;
  font-weight: 700;
}

.file-filter__bar {
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f97316, #fb923c);
}

.file-filter__reset {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  color: #64748b;
  font-size: 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-filter__reset svg {
  width: 12px;
  height: 12px;
}

.file-filter__reset:hover {
  color: #ea580c;
  background: #fff7ed;
}

/* ===== 筛选行：纯按钮行（无行首标题），三行依次为 当前身份 / 学科 / 模块 ===== */
.file-filter__row {
  padding-top: 12px;
}

/* 行与行之间用极淡分隔线，避免无标题时行与行糊在一起 */
.file-filter__row + .file-filter__row {
  margin-top: 12px;
  border-top: 1px solid #f8fafc;
}

.file-filter__buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* ===== 筛选药丸按钮 ===== */
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-pill svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.filter-pill:hover {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.4);
  background: #fff7ed;
}

/* 具体项选中：品牌橙渐变填充（与原身份按钮一致） */
.filter-pill.is-active {
  color: #fff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
}

/* 「全部」：丹霞红描边（常态可见），选中转红底白字 */
.filter-pill--all {
  color: #e11d48;
  background: #fff;
  border: 1.5px solid rgba(225, 29, 72, 0.5);
}

.filter-pill--all:hover {
  color: #e11d48;
  background: #fff1f2;
  border-color: #e11d48;
}

.filter-pill--all.is-active {
  color: #fff;
  background: linear-gradient(135deg, #e11d48, #fb7185);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
}

/* ===== 文件列表面板 ===== */
.file-list-panel {
  margin-bottom: 8px;
  padding: 18px 18px 0;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 10px 30px -22px rgba(15, 23, 42, 0.16);
  scroll-margin-top: 110px;
}

.file-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f8fafc;
}

.file-list-head__main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-list-head__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  color: #d97706;
  border-radius: 10px;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.18);
}

.file-list-head__icon svg {
  width: 19px;
  height: 19px;
}

.file-list-head__text {
  min-width: 0;
}

.file-list-head__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.file-list-head__title h2 {
  color: #0f172a;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.file-count {
  padding: 2px 7px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  background: #eff6ff;
}

.file-list-head__text p {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}

.file-list-tools {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.file-sort {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 34px;
  border-radius: 9px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.file-sort select {
  height: 100%;
  padding: 0 28px 0 11px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  border: 0;
  outline: none;
  background: transparent;
  cursor: pointer;
  appearance: none;
}

.file-sort svg {
  position: absolute;
  right: 9px;
  width: 13px;
  height: 13px;
  color: #94a3b8;
  pointer-events: none;
}

.view-toggle {
  display: inline-flex;
  padding: 3px;
  border-radius: 9px;
  background: #f1f5f9;
}

.view-toggle button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #94a3b8;
  border: 0;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle button svg {
  width: 15px;
  height: 15px;
}

.view-toggle button:hover {
  color: #475569;
}

.view-toggle button.is-active {
  color: #ea580c;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);
}

.file-list-body {
  position: relative;
  min-height: 260px;
  padding: 16px 0;
  transition: opacity 0.2s ease;
}

.file-list-body.is-refreshing {
  opacity: 0.55;
}

.file-grid.is-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.file-grid.is-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-list-updating {
  position: absolute;
  top: 8px;
  right: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  color: #ea580c;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
  background: #fff7ed;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.18);
}

.file-list-updating__spinner {
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(249, 115, 22, 0.28);
  border-top-color: #f97316;
  border-radius: 50%;
  animation: file-spin 0.8s linear infinite;
}

@keyframes file-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 骨架屏 ===== */
.file-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.file-skeleton {
  padding: 14px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: #ffffff;
}

.file-skeleton__thumb,
.file-skeleton__line {
  display: block;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 42%, #f1f5f9 60%);
  background-size: 300% 100%;
  animation: file-shimmer 1.3s ease-in-out infinite;
}

.file-skeleton__thumb {
  width: 44px;
  height: 44px;
  margin-bottom: 14px;
  border-radius: 11px;
}

.file-skeleton__line {
  width: 100%;
  height: 9px;
  margin-top: 8px;
}

.file-skeleton__line.is-title {
  width: 78%;
  height: 11px;
  margin-top: 0;
}

.file-skeleton__line.is-short {
  width: 46%;
}

@keyframes file-shimmer {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -80% 0;
  }
}

/* ===== 空态 / 错误态 ===== */
.file-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 32px 16px;
  text-align: center;
}

.file-state__icon {
  --tone: #64748b;
  --tone-bg: #f8fafc;
  --tone-ring: rgba(100, 116, 139, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  margin-bottom: 14px;
  color: var(--tone);
  border-radius: 18px;
  background: var(--tone-bg);
  box-shadow: inset 0 0 0 1px var(--tone-ring);
}

.file-state__icon svg {
  width: 28px;
  height: 28px;
}

.file-state__icon.tone-blue {
  --tone: #2563eb;
  --tone-bg: #eff6ff;
  --tone-ring: rgba(37, 99, 235, 0.16);
}

.file-state__icon.tone-rose {
  --tone: #e11d48;
  --tone-bg: #fff1f2;
  --tone-ring: rgba(225, 29, 72, 0.16);
}

.file-state__icon.tone-slate {
  --tone: #64748b;
  --tone-bg: #f8fafc;
}

.file-state__title {
  color: #1e293b;
  font-size: 15px;
  font-weight: 700;
}

.file-state__desc {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.file-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.file-state__primary,
.file-state__ghost {
  height: 34px;
  padding: 0 16px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-state__primary {
  color: #ffffff;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 4px 10px -2px rgba(249, 115, 22, 0.3);
}

.file-state__primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -2px rgba(249, 115, 22, 0.4);
}

.file-state__ghost {
  color: #475569;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.file-state__ghost:hover {
  color: #ea580c;
  border-color: rgba(249, 115, 22, 0.3);
  background: #fff7ed;
}

/* ===== 分页 ===== */
.file-pagination {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 2px;
  border-top: 1px solid #f8fafc;
}

.file-pagination__total {
  color: #94a3b8;
  font-size: 12px;
  justify-self: start;
}

.file-pagination__total strong {
  color: #475569;
  font-weight: 700;
}

.file-pagination__pages {
  justify-self: center;
}

.file-pagination__pages :deep(.el-pager li) {
  min-width: 30px;
  height: 30px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  background: #f8fafc;
}

.file-pagination__pages :deep(.el-pager li:hover) {
  color: #ea580c;
  background: #fff7ed;
}

.file-pagination__pages :deep(.el-pager li.is-active) {
  color: #ffffff;
  background: #f97316;
  box-shadow: 0 3px 8px -2px rgba(249, 115, 22, 0.45);
}

.file-pagination__pages :deep(.btn-prev),
.file-pagination__pages :deep(.btn-next) {
  min-width: 30px;
  height: 30px;
  color: #64748b;
  border-radius: 8px;
  background: #f8fafc;
}

.file-pagination__pages :deep(.btn-prev:hover),
.file-pagination__pages :deep(.btn-next:hover) {
  color: #ea580c;
  background: #fff7ed;
}

.file-pagination__size {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  justify-self: end;
}

.file-size-select {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 30px;
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.file-size-select select {
  height: 100%;
  padding: 0 26px 0 9px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  border: 0;
  outline: none;
  background: transparent;
  cursor: pointer;
  appearance: none;
}

.file-size-select svg {
  position: absolute;
  right: 8px;
  width: 12px;
  height: 12px;
  color: #94a3b8;
  pointer-events: none;
}

@media (max-width: 1200px) {
  .file-grid.is-grid,
  .file-skeleton-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1023px) {
  .file-banner {
    min-height: 220px;
    padding: 24px 26px;
  }

  .file-banner__note {
    display: none;
  }

  .file-banner::before {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.94) 58%, rgba(255, 255, 255, 0.55) 100%);
  }
}

@media (max-width: 900px) {
  .file-grid.is-grid,
  .file-skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .file-banner {
    min-height: 0;
    padding: 22px 18px;
  }

  .file-banner__title {
    font-size: 23px;
  }

  .file-banner__desc {
    font-size: 12px;
  }

  .file-banner__features {
    gap: 6px;
    margin-top: 14px;
  }

  .file-feature {
    padding: 5px 9px 5px 6px;
    font-size: 11px;
  }

  .file-filter {
    padding: 14px;
  }

  .file-list-panel {
    padding: 16px 14px 0;
  }

  .file-list-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .file-list-tools {
    width: 100%;
    justify-content: space-between;
  }

  .file-grid.is-grid,
  .file-skeleton-grid {
    grid-template-columns: 1fr;
  }

  .file-pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .file-pagination__total,
  .file-pagination__size {
    justify-self: auto;
  }

  .file-pagination__pages {
    order: -1;
    width: 100%;
  }
}

/* ===== 当前身份平铺按钮（筛选行） ===== */
/* 已统一为 .filter-pill 药丸体系（见上方「筛选药丸按钮」），此处不再保留旧样式 */
</style>

<style>
/* 身份下拉面板：popper-class 传送到 body，scoped 无效，故放在非 scoped 块（类名唯一，无泄漏） */
.stage-identity-popper .el-select-dropdown__item.is-selected {
  color: #2563eb;
  font-weight: 700;
}

.stage-identity-popper .el-select-dropdown__item.is-hovering {
  background: #eff6ff;
  color: #2563eb;
}
</style>
