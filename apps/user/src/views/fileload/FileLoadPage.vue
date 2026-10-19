<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<FileLoadListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

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
 * 沿用原「导航栏下拉 + query.stage」模式，行为不变。后续高中/大学照此加一条配置即可。
 * - identity：跟随右侧身份切换（初中资料）
 * - fixed：固定面向人群，不随身份变化（中考真题固定查「中考资料」）
 * - soon：敬请期待占位
 */
interface StageNavSection {
  key: string
  label: string
  mode: 'identity' | 'fixed' | 'soon'
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

const STAGE_NAV_CONFIG: Partial<Record<FileLoadAudience, StageNavConfig>> = {
  middle: {
    label: '初中模块',
    identities: ['初三', '初二', '初一'],
    defaultIdentity: '初三',
    sections: [
      { key: 'files', label: '初中资料', mode: 'identity' },
      // 中考真题固定查「中考资料」，与右侧身份无关（身份控件仍展示可切换，只是查询不受影响）
      { key: 'zhenti', label: '中考真题', mode: 'fixed', stage: '中考资料' },
      { key: 'news', label: '初中资讯', mode: 'soon' },
      { key: 'quiz', label: '在线练题', mode: 'soon' },
      { key: 'career', label: '初中生涯规划', mode: 'soon' },
    ],
  },
  college: {
    label: '大学模块',
    identities: ['大一', '大二', '大三', '大四'],
    defaultIdentity: '大一',
    sections: [
      { key: 'files', label: '大学资料', mode: 'identity' },
      { key: 'news', label: '大学资讯', mode: 'soon' },
      { key: 'career', label: '大学生涯规划', mode: 'soon' },
    ],
  },
}

const stageNav = computed(() => STAGE_NAV_CONFIG[props.audience] || null)

/** 当前激活的目录项 key */
const activeSection = ref('files')
/** 当前身份（初一/初二/初三） */
const identity = ref(STAGE_NAV_CONFIG.middle?.defaultIdentity || '')

/**
 * 生效的面向人群（接口 applicableStage）：
 * - 有页内导航栏：由当前目录项决定 —— identity 跟随身份 / fixed 固定人群 / soon 不带筛选；
 * - 无页内导航栏：路由 props.stage（考公/考研/研究生单一人群专栏）优先，其次 query.stage。
 */
const effectiveStage = computed(() => {
  const nav = stageNav.value
  if (!nav) return props.stage || (route.query.stage as string) || ''
  const sec = nav.sections.find((s) => s.key === activeSection.value)
  if (!sec) return ''
  if (sec.mode === 'identity') return identity.value
  if (sec.mode === 'fixed') return sec.stage || ''
  return ''
})

/** 目录项点击：占位项只弹提示，其余切目录（列表由 watch(effectiveStage) 统一触发重拉） */
function onSectionClick(sec: StageNavSection) {
  if (sec.mode === 'soon') {
    ElMessage.info(`「${sec.label}」敬请期待`)
    return
  }
  activeSection.value = sec.key
}

/**
 * 身份切换（下拉框）：
 * - 停留在「初中资料」时，身份直接决定查询人群（effectiveStage 变化 → watch 自动重拉）；
 * - 停留在「中考真题」等固定人群目录时，查询不变，仍按产品要求强制重发一次接口；
 * - 不重置当前目录，用户不会因为切身份被弹回「初中资料」。
 * 同时把身份同步到 URL（刷新/分享可保持）。
 */
function onIdentityChange(val: string) {
  identity.value = val
  currentPage.value = 1
  void router.replace({ path: route.path, query: { ...route.query, stage: val } })
  fetchList(true)
}

/** 进入页面/切换受众时按 URL 回填目录与身份（兼容旧链接 /middle?stage=中考资料） */
function syncFromQuery() {
  const nav = stageNav.value
  if (!nav) return
  const s = route.query.stage as string
  const fixedHit = nav.sections.find((x) => x.mode === 'fixed' && x.stage === s)
  if (fixedHit) {
    activeSection.value = fixedHit.key
    return
  }
  activeSection.value = 'files'
  identity.value = s && nav.identities.includes(s) ? s : nav.defaultIdentity
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
  middle: '初中阶段精选学习资料、升学政策与备考指南，持续更新中。',
  high: '高中阶段精选学习资料、高考政策与备考指南，持续更新中。',
  college: '大学阶段精选学习资料、考研就业与学业规划指南，持续更新中。',
  'civil-service': '考公阶段精选备考资料、真题解析与政策解读，持续更新中。',
  'postgrad-exam': '考研阶段精选备考资料、真题解析与复习规划，持续更新中。',
  graduate: '研究生阶段精选学习资料、科研工具与学术发展指南，持续更新中。',
}

const hasActiveFilter = computed(() => !!(subjectFilter.value || tagFilter.value))

/** 拉取学科/标签的去重值（用于下拉），失败不阻塞列表 */
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
    ElMessage.error(e?.message || '获取文件列表失败')
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

/* ---------------- 工具函数 ---------------- */
function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`
}

function formatDate(time?: string): string {
  if (!time) return '-'
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return time
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 按文件类型返回图标与配色 */
function fileTypeMeta(fileType?: string): { label: string; badge: string; iconBg: string } {
  const t = (fileType || '').toLowerCase()
  if (t === 'pdf') return { label: 'PDF', badge: 'bg-red-100 text-red-600', iconBg: 'from-red-500 to-rose-400' }
  if (t === 'doc' || t === 'docx') return { label: 'Word', badge: 'bg-blue-100 text-blue-600', iconBg: 'from-blue-500 to-sky-400' }
  if (t === 'xls' || t === 'xlsx') return { label: 'Excel', badge: 'bg-green-100 text-green-600', iconBg: 'from-green-500 to-emerald-400' }
  if (t === 'ppt' || t === 'pptx') return { label: 'PPT', badge: 'bg-orange-100 text-orange-600', iconBg: 'from-orange-500 to-amber-400' }
  if (t === 'jpg' || t === 'jpeg' || t === 'png' || t === 'gif' || t === 'bmp') return { label: '图片', badge: 'bg-purple-100 text-purple-600', iconBg: 'from-purple-500 to-violet-400' }
  if (t === 'txt') return { label: '文本', badge: 'bg-gray-100 text-gray-600', iconBg: 'from-gray-500 to-slate-400' }
  return { label: (fileType || '文件').toUpperCase(), badge: 'bg-gray-100 text-gray-600', iconBg: 'from-gray-500 to-slate-400' }
}

/* ---------------- 分页 ---------------- */
function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}
function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
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
          <svg class="stage-nav-label-icon shrink-0 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

        <!-- 右侧身份切换（下拉框）：资料目录按身份查；固定人群目录（如中考真题）也可切换，查询保持不变 -->
        <div class="stage-identity">
          <span class="stage-identity-label">当前身份</span>
          <el-select
            :model-value="identity"
            class="stage-identity-select"
            popper-class="stage-identity-popper"
            @update:model-value="onIdentityChange"
          >
            <el-option v-for="opt in stageNav.identities" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ bannerTitle }} · 精选学习资料</h1>
          </div>
          <button
            v-if="props.audience === 'high'"
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all"
            :class="teacherMode
              ? 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-50'
              : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200 hover:from-sky-600 hover:to-cyan-600'"
            @click="toggleTeacher"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            {{ teacherMode ? '返回高中资料' : '教师专属' }}
          </button>
        </div>
          <p class="text-gray-600 leading-relaxed mb-4">{{ bannerDesc }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['学习资料', '政策解读', '备考指南', '持续更新']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- 筛选栏 -->
      <section class="mb-6 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-.293.707L14 15.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 17v-1.586L3.293 10.707A1 1 0 013 10V4z" />
            </svg>
            筛选
          </div>
          <button v-if="hasActiveFilter" class="text-xs text-orange-500 hover:underline" @click="resetFilters">
            重置筛选
          </button>
        </div>

        <!-- 学科 / 标签：下拉框（面向人群已由导航入口写死，页内不再提供筛选） -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 shrink-0">学科</span>
            <el-select
              v-model="subjectFilter"
              placeholder="全部学科"
              clearable
              style="width: 160px"
              @change="onFilterChange"
            >
              <el-option v-for="o in subjectOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 shrink-0">标签</span>
            <el-select
              v-model="tagFilter"
              placeholder="全部标签"
              clearable
              style="width: 160px"
              @change="onFilterChange"
            >
              <el-option v-for="o in tagOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- 文件列表 -->
      <section class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 19h16M5 5h14v14H5zM9 9h6M9 13h6" />
          </svg>
          文件列表
        </div>
        <div v-loading="loading" class="min-h-[400px]">
          <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="item in list"
              :key="item.id"
              class="group relative rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-orange-200 hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
              @click="openDetail(item)"
            >
              <!-- 文件图标区 -->
              <div class="relative h-32 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.storageType === 'BAIDU' && item.coverUrl"
                  :src="item.coverUrl"
                  alt=""
                  class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  :class="item.storageType === 'BAIDU' ? 'from-blue-500 to-sky-400 shadow-blue-100' : fileTypeMeta(item.fileType).iconBg"
                >
                  <svg v-if="item.storageType === 'BAIDU'" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18a4 4 0 0 1-.9-7.9 5.5 5.5 0 0 1 10.8-1.5A4.5 4.5 0 0 1 17.5 18H7z" />
                  </svg>
                  <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                  </svg>
                </div>
                <span
                  class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="item.storageType === 'BAIDU'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : fileTypeMeta(item.fileType).badge"
                >
                  {{ item.storageType === 'BAIDU' ? '网盘' : fileTypeMeta(item.fileType).label }}
                </span>
              </div>

              <!-- 信息区 -->
              <div class="p-4">
                <h3 class="text-base font-bold text-gray-800 truncate" :title="item.fileName">{{ item.fileName }}</h3>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <span v-if="item.subject" class="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600 border border-orange-100">
                    {{ item.subject }}
                  </span>
                  <span v-if="item.applicableStage" class="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 border border-amber-100">
                    {{ item.applicableStage }}
                  </span>
                  <span v-if="item.tag" class="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600 border border-rose-100">
                    {{ item.tag }}
                  </span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{{ item.storageType === 'BAIDU' ? '百度网盘' : formatSize(item.fileSize) }}</span>
                  <span>{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="teacherForbidden && !loading" class="py-20 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <p class="text-base font-semibold text-gray-700">您还不是教师身份</p>
            <p class="text-sm text-gray-400 mt-1">教师专属资料仅对老师身份开放，请联系管理员开通</p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="toggleTeacher"
            >
              返回高中资料
            </button>
          </div>
          <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无文件数据</div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="onPageChange"
            @size-change="onSizeChange"
          />
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
  background: rgba(255, 251, 245, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 1px 8px rgba(249, 115, 22, 0.06);
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
  color: #ea580c;
  background: rgba(249, 115, 22, 0.08);
}

.stage-nav-item.is-active {
  color: #c2410c;
  background: #ffedd5;
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
  color: #ea580c;
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
  color: #a8a29e;
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
  background: #fff7ed;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.35) inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.stage-identity-select :deep(.el-select__wrapper.is-hovering),
.stage-identity-select :deep(.el-select__wrapper.is-focused) {
  background: #ffedd5;
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

.stage-identity-select :deep(.el-select__selected-item) {
  font-size: 14px;
  font-weight: 700;
  color: #c2410c;
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
</style>

<style>
/* 身份下拉面板：popper-class 传送到 body，scoped 无效，故放在非 scoped 块（类名唯一，无泄漏） */
.stage-identity-popper .el-select-dropdown__item.is-selected {
  color: #c2410c;
  font-weight: 700;
}

.stage-identity-popper .el-select-dropdown__item.is-hovering {
  background: #fff7ed;
  color: #ea580c;
}
</style>
