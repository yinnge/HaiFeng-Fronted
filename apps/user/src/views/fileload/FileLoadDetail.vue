<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFileLoadDetail, getFileLoadNetdisk, getFileLoadList } from '@/api/fileload'
import type {
  FileLoadDetailVO,
  FileLoadAudience,
  NetdiskInfoVO,
  FileLoadListVO,
} from '@/types/fileload'
import { useUserStore } from '@/store'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import FileRelatedList from './components/FileRelatedList.vue'
import FileQuickNav from './components/FileQuickNav.vue'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 / college=大学 / civil-service=考公 / postgrad-exam=考研 / graduate=研究生 */
  audience: FileLoadAudience
  /** 页面标题（路由 meta.title 亦可，此处用于返回按钮展示） */
  title?: string
}>()

const recharge = useRechargeDialog()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { hidden: headerHidden } = useAutoHideHeader()

const loading = ref(false)
const previewLoading = ref(false)
const detail = ref<FileLoadDetailVO | null>(null)
const vipBlocked = ref(false)
/** 教师专属详情：从路由 query.teacher 判定，走 /high/teacher 端点 */
const isTeacher = computed(() => route.query.teacher === '1')
/** 非老师身份访问教师专属详情的拦截态 */
const teacherForbidden = ref(false)

/** 是否为百度网盘资源（无预览/下载，取码接口限 VIP） */
const isNetdisk = computed(() => detail.value?.storageType === 'BAIDU')

// 网盘取码弹框
const netdiskVisible = ref(false)
const netdiskLoading = ref(false)
const netdiskInfo = ref<NetdiskInfoVO | null>(null)
const copied = ref(false)

/* ---------------- 相关推荐 / 排行榜 ---------------- */
const RELATED_LIMIT = 6
/** 后端 BasePageQueryDTO 约束 size ∈ [10,100]，故统一请求 10 条再前端截取 */
const RELATED_FETCH_SIZE = 10
const related = ref<FileLoadListVO[]>([])
const relatedLoading = ref(false)

const pageTitle = computed(() => props.title || (props.audience === 'middle' ? '初中专栏' : props.audience === 'high' ? '高中专栏' : props.audience === 'college' ? '大学专栏' : props.audience === 'civil-service' ? '考公专栏' : props.audience === 'postgrad-exam' ? '考研专栏' : '研究生专栏'))
const audienceLabelMap: Record<FileLoadAudience, string> = {
  middle: '初中专栏',
  high: '高中专栏',
  college: '大学专栏',
  'civil-service': '考公专栏',
  'postgrad-exam': '考研专栏',
  graduate: '研究生专栏',
}
const audienceLabel = computed(() => audienceLabelMap[props.audience] || '初中专栏')

/** 右侧栏吸顶偏移：顶部导航收起时贴到 8px，否则让出导航高度 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

async function load() {
  const id = route.params.id
  if (!id) {
    ElMessage.error('文件不存在')
    return
  }
  loading.value = true
  try {
    const res = await getFileLoadDetail(props.audience, String(id), isTeacher.value)
    detail.value = res.data.data
    // kkfileview 转码期间显示骨架屏，iframe @load 后关闭
    previewLoading.value = !!res.data.data?.previewUrl
    vipBlocked.value = false
    teacherForbidden.value = false
    await loadRelated()
  } catch (e: any) {
    const msg = e?.message || '获取文件详情失败'
    // 教师专属详情要求老师身份，非老师访问返回教师权限不足 → 友好拦截
    if (isTeacher.value && (msg.includes('教师') || msg.includes('1008'))) {
      teacherForbidden.value = true
      vipBlocked.value = false
      return
    }
    // VIP 权限不足（业务码 1005「权限不足（需要旗舰版）」）：引导开通
    if (msg.includes('旗舰版') || msg.includes('VIP')) {
      vipBlocked.value = true
      try {
        await ElMessageBox.confirm('查看文件详情与下载需要旗舰版（VIP）会员，是否前往开通？', '提示', {
          confirmButtonText: '去开通',
          cancelButtonText: '取消',
          type: 'warning',
        })
        recharge.open()
      } catch { /* 用户取消 */ }
    } else if (msg.includes('登录') || msg.includes('未登录')) {
      userStore.setRedirectPath(route.fullPath)
      try {
        await ElMessageBox.confirm('您还没有登录，请先登录', '提示', {
          confirmButtonText: '前往登录',
          cancelButtonText: '取消',
          type: 'warning',
        })
        router.push('/login')
      } catch { /* 用户取消 */ }
    } else {
      ElMessage.error(msg)
    }
  } finally {
    loading.value = false
  }
}

/**
 * 相关推荐 / 排行榜：复用现有列表接口，无需后端新增接口。
 * 匹配优先级（始终排除当前文件，取 6 条）：
 *   1) applicableStage + subject 双条件 AND
 *   2) 降级为仅 applicableStage
 *   3) 再降级为本专栏最新文件补足
 */
async function loadRelated() {
  const d = detail.value
  if (!d) return
  relatedLoading.value = true
  const picked: FileLoadListVO[] = []
  const push = (rows?: FileLoadListVO[]) => {
    for (const r of rows || []) {
      if (r.id === d.id) continue
      if (picked.some((p) => p.id === r.id)) continue
      if (picked.length >= RELATED_LIMIT) break
      picked.push(r)
    }
  }
  try {
    const base = { page: 1, size: RELATED_FETCH_SIZE }
    if (d.applicableStage && d.subject) {
      const res = await getFileLoadList(
        props.audience,
        { ...base, applicableStage: d.applicableStage, subject: d.subject },
        isTeacher.value,
      )
      push(res.data.data?.records)
    }
    if (picked.length < RELATED_LIMIT && d.applicableStage) {
      const res = await getFileLoadList(
        props.audience,
        { ...base, applicableStage: d.applicableStage },
        isTeacher.value,
      )
      push(res.data.data?.records)
    }
    if (picked.length < RELATED_LIMIT) {
      const res = await getFileLoadList(props.audience, base, isTeacher.value)
      push(res.data.data?.records)
    }
    related.value = picked
  } catch {
    // 推荐区为增强信息，失败时保留已取到的部分，不打断详情页主流程
    related.value = picked
  } finally {
    relatedLoading.value = false
  }
}

/** 获取网盘链接 + 提取码（VIP 门槛由后端 /{id}/netdisk 接口控制，非 VIP 返回业务码 1005） */
async function fetchNetdisk() {
  const id = route.params.id
  if (!id) {
    ElMessage.error('文件不存在')
    return
  }
  netdiskLoading.value = true
  copied.value = false
  try {
    const res = await getFileLoadNetdisk(props.audience, String(id), isTeacher.value)
    netdiskInfo.value = res.data.data
    netdiskVisible.value = true
  } catch (e: any) {
    const msg = e?.message || '获取网盘链接失败'
    if (msg.includes('旗舰版') || msg.includes('VIP')) {
      try {
        await ElMessageBox.confirm('查看网盘链接与提取码需要旗舰版（VIP）会员，是否前往开通？', '提示', {
          confirmButtonText: '去开通',
          cancelButtonText: '取消',
          type: 'warning',
        })
        recharge.open()
      } catch { /* 用户取消 */ }
    } else {
      ElMessage.error(msg)
    }
  } finally {
    netdiskLoading.value = false
  }
}

/** 复制提取码到剪贴板 */
async function copyCode() {
  const code = netdiskInfo.value?.accessCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    copied.value = true
    ElMessage.success('提取码已复制')
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

/** 新窗口打开百度网盘链接 */
function openNetdisk() {
  const url = netdiskInfo.value?.netdiskUrl
  if (url) window.open(url, '_blank', 'noopener')
}

function goBack() {
  router.push(isTeacher.value ? `/${props.audience}?teacher=1` : `/${props.audience}`)
}

function handleDownload() {
  const url = detail.value?.downloadUrl
  if (!url) {
    ElMessage.error('暂未生成下载链接，请稍后再试')
    return
  }
  // 动态 a 标签触发下载（避免异步 window.open 被浏览器拦截）
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/** 相关推荐点击：跳到同专栏下的对应详情（教师身份透传） */
function openRelated(item: FileLoadListVO) {
  router.push({
    path: `/${props.audience}/${item.id}`,
    query: isTeacher.value ? { teacher: '1' } : {},
  })
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

/** 文件类型 → 封面占位配色（无封面图时使用类型图标块） */
const fileMeta = computed(() => {
  if (isNetdisk.value) return { label: '网盘', bg: '#eff6ff', fg: '#2563eb' }
  const t = (detail.value?.fileType || '').toLowerCase()
  if (t === 'pdf') return { label: 'PDF', bg: '#fff1f2', fg: '#e11d48' }
  if (t === 'doc' || t === 'docx') return { label: 'Word', bg: '#eff6ff', fg: '#2563eb' }
  if (t === 'xls' || t === 'xlsx') return { label: 'Excel', bg: '#ecfdf5', fg: '#059669' }
  if (t === 'ppt' || t === 'pptx') return { label: 'PPT', bg: '#fff7ed', fg: '#ea580c' }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(t)) return { label: '图片', bg: '#f5f3ff', fg: '#7c3aed' }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(t)) return { label: '视频', bg: '#ecfdf5', fg: '#059669' }
  if (t === 'txt') return { label: 'TXT', bg: '#f1f5f9', fg: '#64748b' }
  return { label: (detail.value?.fileType || '文件').toUpperCase(), bg: '#f1f5f9', fg: '#64748b' }
})

/** 封面图：有 coverUrl 用图，否则渲染类型图标块 */
const coverUrl = computed(() => detail.value?.coverUrl || '')

/** 顶部标签：学科 / 模块 / 适用阶段 */
const heroTags = computed(() => {
  const tags: { text: string; bg: string; fg: string }[] = []
  if (detail.value?.subject) tags.push({ text: detail.value.subject, bg: '#eff6ff', fg: '#2563eb' })
  if (detail.value?.tag) tags.push({ text: detail.value.tag, bg: '#fffbeb', fg: '#d97706' })
  if (detail.value?.applicableStage) tags.push({ text: detail.value.applicableStage, bg: '#ecfdf5', fg: '#059669' })
  return tags
})

/** 文件元数据四项：大小 / 上传时间 / 类型 / 适用阶段 */
const metaItems = computed(() => [
  {
    label: '文件大小',
    value: isNetdisk.value
      ? detail.value?.fileSize
        ? formatSize(detail.value.fileSize)
        : '网盘大文件'
      : formatSize(detail.value?.fileSize),
    icon: ['M4 6h16M4 12h16M4 18h10'],
  },
  {
    label: '上传时间',
    value: formatDate(detail.value?.createTime),
    icon: ['M3 10h18M8 2v4M16 2v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z'],
  },
  {
    label: '文件类型',
    value: isNetdisk.value ? '百度网盘' : fileMeta.value.label,
    icon: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z', 'M14 3v5h5'],
  },
  {
    label: '适用阶段',
    value: detail.value?.applicableStage || audienceLabel.value,
    icon: ['M12 4 2 9l10 5 10-5Z', 'M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5'],
  },
])

onMounted(load)
</script>

<template>
  <div class="fd-wrap">
    <main class="fd-main">
      <!-- 返回 + 面包屑 -->
      <nav class="fd-crumb" aria-label="面包屑">
        <button type="button" class="fd-back" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          返回{{ pageTitle }}
        </button>
        <span class="fd-crumb-sep" aria-hidden="true">/</span>
        <span class="fd-crumb-cur">文件详情</span>
      </nav>

      <div v-loading="loading" class="fd-loading-host">
        <div v-if="detail" class="fd-layout">
          <!-- ===== 主内容区 ===== -->
          <div class="fd-col-main">
            <!-- 文件信息卡：封面 + 标题/标签/介绍/元数据 + 主操作 -->
            <article class="fd-hero">
              <div class="fd-hero-cover" :style="{ background: fileMeta.bg, color: fileMeta.fg }">
                <img v-if="coverUrl" :src="coverUrl" :alt="detail.fileName" class="fd-hero-cover-img" />
                <template v-else>
                  <svg v-if="isNetdisk" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M7 18a4 4 0 0 1-.9-7.9A5.5 5.5 0 0 1 16.9 9a4.5 4.5 0 0 1 .6 9H7Z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 3v5h5M9 13h6M9 17h4" />
                  </svg>
                </template>
                <span class="fd-hero-badge">{{ fileMeta.label }}</span>
              </div>

              <div class="fd-hero-body">
                <h1 class="fd-hero-title">{{ detail.fileName }}</h1>

                <div v-if="heroTags.length" class="fd-hero-tags">
                  <span
                    v-for="t in heroTags"
                    :key="t.text"
                    class="fd-tag"
                    :style="{ background: t.bg, color: t.fg }"
                  >{{ t.text }}</span>
                </div>

                <p class="fd-hero-desc">{{ detail.description || '暂无简介，下载后可查看完整内容。' }}</p>

                <ul class="fd-meta">
                  <li v-for="m in metaItems" :key="m.label" class="fd-meta-item">
                    <svg class="fd-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path v-for="(d, i) in m.icon" :key="i" :d="d" />
                    </svg>
                    <span class="fd-meta-label">{{ m.label }}</span>
                    <span class="fd-meta-value">{{ m.value }}</span>
                  </li>
                </ul>
              </div>

              <div class="fd-hero-cta">
                <button
                  v-if="isNetdisk"
                  type="button"
                  class="fd-cta fd-cta-blue"
                  :disabled="netdiskLoading"
                  @click="fetchNetdisk"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {{ netdiskLoading ? '获取中…' : '获取网盘链接' }}
                </button>
                <button
                  v-else
                  type="button"
                  class="fd-cta"
                  :disabled="!detail.downloadUrl"
                  @click="handleDownload"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                  </svg>
                  立即下载
                </button>
                <p class="fd-cta-hint">
                  {{ isNetdisk ? '旗舰版会员专属，含分享链接与提取码' : '保存至本地后查看完整内容' }}
                </p>
              </div>
            </article>

            <!-- 文件展示区：OSS 直接内嵌预览；网盘资源展示取码入口 -->
            <section class="fd-viewer">
              <header class="fd-viewer-head">
                <h2 class="fd-viewer-title">{{ isNetdisk ? '网盘资源' : '文件预览' }}</h2>
                <span class="fd-viewer-sub">{{ audienceLabel }}</span>
              </header>

              <!-- OSS：直接展示文件，不再有「文件预览 / 文件信息」tab -->
              <div v-if="!isNetdisk" class="fd-frame">
                <div v-if="previewLoading" class="fd-frame-skeleton">
                  <el-skeleton :rows="10" animated />
                </div>
                <iframe
                  v-if="detail.previewUrl"
                  :src="detail.previewUrl"
                  class="fd-frame-iframe"
                  frameborder="0"
                  title="文件预览"
                  @load="previewLoading = false"
                ></iframe>
                <div v-else class="fd-frame-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  <p class="fd-frame-empty-title">该文件类型暂不支持在线预览</p>
                  <p class="fd-frame-empty-sub">请点击右上角「立即下载」保存到本地查看</p>
                </div>
              </div>

              <!-- 网盘：无文件可展示，给取码入口 + 说明 -->
              <div v-else class="fd-netdisk">
                <button
                  type="button"
                  class="fd-cta fd-cta-blue fd-netdisk-btn"
                  :disabled="netdiskLoading"
                  @click="fetchNetdisk"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {{ netdiskLoading ? '获取中…' : '获取网盘链接' }}
                </button>
                <p class="fd-netdisk-text">
                  该资源为百度网盘大文件。点击「获取网盘链接」，复制分享链接与提取码后，前往网盘保存或下载。
                </p>
              </div>
            </section>

            <!-- 温馨提示：置于文件展示区最下方 -->
            <section class="fd-tip">
              <span class="fd-tip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <div class="fd-tip-body">
                <h3 class="fd-tip-title">温馨提示</h3>
                <p class="fd-tip-text">如果文件侵权，请联系管理员。</p>
              </div>
            </section>
          </div>

          <!-- ===== 右侧栏（吸顶） ===== -->
          <aside class="fd-col-side" :style="{ top: asideTop + 'px' }">
            <FileRelatedList
              :variant="isNetdisk ? 'rank' : 'related'"
              :items="related"
              :loading="relatedLoading"
              @open="openRelated"
            />
            <FileQuickNav
              :audience="props.audience"
              :title="isNetdisk ? '在线工具' : '快捷导航'"
              :teacher="isTeacher"
            />
          </aside>
        </div>

        <!-- 教师身份拦截空态 -->
        <div v-else-if="teacherForbidden && !loading" class="fd-state">
          <p class="fd-state-title">您还不是教师身份</p>
          <p class="fd-state-sub">教师专属资料仅对老师身份开放，请联系管理员开通</p>
        </div>
        <!-- VIP 拦截空态 -->
        <div v-else-if="vipBlocked && !loading" class="fd-state">
          <p class="fd-state-sub">查看文件详情需要旗舰版（VIP）会员</p>
        </div>
        <!-- 其他空态 -->
        <div v-else-if="!loading" class="fd-state">
          <p class="fd-state-sub">暂无文件数据</p>
        </div>
      </div>
    </main>

    <!-- 百度网盘取码弹框（VIP 资源） -->
    <el-dialog
      v-model="netdiskVisible"
      title="百度网盘资源"
      width="520px"
      align-center
      class="nd-dialog"
      :close-on-click-modal="false"
    >
      <div v-loading="netdiskLoading" class="space-y-4">
        <div class="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
          <div class="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 18a4 4 0 0 1-.9-7.9 5.5 5.5 0 0 1 10.8-1.5A4.5 4.5 0 0 1 17.5 18H7z" />
            </svg>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{{ detail?.fileName }}</p>
            <p class="text-xs text-gray-400 mt-0.5">文件存储在百度网盘，请复制链接与提取码后前往百度网盘保存</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-gray-400 mb-1.5">分享链接</p>
          <div class="flex items-center gap-2">
            <el-input :model-value="netdiskInfo?.netdiskUrl || ''" readonly class="flex-1" />
            <button
              class="shrink-0 rounded-full bg-blue-500 text-white text-xs font-medium px-4 py-2 hover:bg-blue-600 transition-all"
              @click="openNetdisk"
            >
              打开链接
            </button>
          </div>
        </div>

        <div v-if="netdiskInfo?.accessCode">
          <p class="text-xs font-semibold text-gray-400 mb-1.5">提取码</p>
          <div class="flex items-center gap-2">
            <div class="flex-1 rounded-lg bg-gray-100 text-center font-mono text-lg font-bold tracking-[0.5em] text-blue-600 py-2 px-2">
              {{ netdiskInfo.accessCode }}
            </div>
            <button
              class="shrink-0 rounded-full bg-orange-500 text-white text-xs font-medium px-4 py-2 hover:bg-orange-600 transition-all"
              @click="copyCode"
            >
              {{ copied ? '已复制' : '复制提取码' }}
            </button>
          </div>
        </div>

        <p class="text-xs text-gray-400 leading-relaxed">提示：分享链接可能因百度网盘策略失效，如遇失效请联系管理员更新。</p>
      </div>
      <template #footer>
        <button
          class="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-all"
          @click="netdiskVisible = false"
        >
          关闭
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.fd-wrap {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffdfa 0%, #fff7ed 45%, #f8fafc 100%);
}

.fd-main {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px 20px 56px;
}

/* ---------- 面包屑 ---------- */
.fd-crumb {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.fd-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.28);
  background: #ffffff;
  color: #ea580c;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.22s ease;
}

.fd-back:hover {
  background: #fff7ed;
  box-shadow: 0 4px 14px -6px rgba(249, 115, 22, 0.4);
}

.fd-back:active {
  transform: translateY(1px);
}

.fd-back svg {
  width: 15px;
  height: 15px;
}

.fd-crumb-sep {
  color: #cbd5e1;
  font-size: 13px;
}

.fd-crumb-cur {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.fd-loading-host {
  min-height: 320px;
}

/* ---------- 两栏布局 ---------- */
.fd-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

@media (min-width: 1024px) {
  .fd-layout {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 22px;
  }
}

.fd-col-main {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.fd-col-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

@media (min-width: 1024px) {
  .fd-col-side {
    position: sticky;
  }
}

/* ---------- 文件信息卡 ---------- */
/* 移动端：纵向流式；≥768 才启用两栏栅格（避免 grid-area 在 flex 下失效） */
.fd-hero {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

@media (min-width: 768px) {
  .fd-hero {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr);
    grid-template-areas:
      'cover body'
      'cta cta';
    gap: 18px 20px;
  }

  .fd-hero-cover {
    grid-area: cover;
  }

  .fd-hero-body {
    grid-area: body;
  }

  .fd-hero-cta {
    grid-area: cta;
  }
}

@media (min-width: 1280px) {
  .fd-hero {
    grid-template-columns: 104px minmax(0, 1fr) 190px;
    grid-template-areas: 'cover body cta';
    align-items: start;
  }
}

.fd-hero-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104px;
  height: 104px;
  border-radius: 16px;
  overflow: visible;
}

.fd-hero-cover > svg {
  width: 46px;
  height: 46px;
}

.fd-hero-cover-img {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  display: block;
}

.fd-hero-badge {
  position: absolute;
  bottom: -6px;
  left: -6px;
  padding: 1px 7px;
  border-radius: 6px;
  background: #ffffff;
  color: currentColor;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.06),
    0 1px 3px rgba(15, 23, 42, 0.08);
}

.fd-hero-body {
  min-width: 0;
}

.fd-hero-title {
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .fd-hero-title {
    font-size: 24px;
  }
}

.fd-hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.fd-tag {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
}

.fd-hero-desc {
  margin-top: 12px;
  max-width: 65ch;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.fd-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 20px;
  margin: 16px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid #f1f5f9;
  list-style: none;
}

.fd-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.fd-meta-icon {
  width: 14px;
  height: 14px;
  color: #cbd5e1;
}

.fd-meta-label {
  color: #94a3b8;
}

.fd-meta-value {
  color: #334155;
  font-weight: 600;
}

/* ---------- 主操作按钮 ---------- */
.fd-hero-cta {
  grid-area: cta;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 1280px) {
  .fd-hero-cta {
    align-items: stretch;
    padding-top: 4px;
  }
}

.fd-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 22px -8px rgba(249, 115, 22, 0.6);
  transition:
    transform 0.22s cubic-bezier(0.32, 0.72, 0, 1),
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.fd-cta:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: saturate(1.05);
  box-shadow: 0 12px 28px -8px rgba(249, 115, 22, 0.7);
}

.fd-cta:active:not(:disabled) {
  transform: translateY(1px);
}

.fd-cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.fd-cta:focus-visible {
  outline: 2px solid rgba(249, 115, 22, 0.55);
  outline-offset: 2px;
}

.fd-cta svg {
  width: 16px;
  height: 16px;
}

.fd-cta-blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 8px 22px -8px rgba(37, 99, 235, 0.55);
}

.fd-cta-blue:hover:not(:disabled) {
  box-shadow: 0 12px 28px -8px rgba(37, 99, 235, 0.65);
}

.fd-cta-hint {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

/* ---------- 文件展示区 ---------- */
.fd-viewer {
  padding: 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.fd-viewer-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.fd-viewer-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.fd-viewer-sub {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
}

.fd-frame {
  position: relative;
  width: 100%;
  min-height: 560px;
  border-radius: 14px;
  overflow: hidden;
  background: #f1f5f9;
}

@media (min-width: 1024px) {
  .fd-frame {
    min-height: 720px;
  }
}

.fd-frame-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #f8fafc;
}

.fd-frame-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

.fd-frame-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px;
  text-align: center;
}

.fd-frame-empty > svg {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 6px;
}

.fd-frame-empty-title {
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.fd-frame-empty-sub {
  color: #94a3b8;
  font-size: 12px;
}

/* 网盘占位 */
.fd-netdisk {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 320px;
  padding: 40px 24px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%);
  text-align: center;
}

.fd-netdisk-btn {
  padding: 13px 30px;
}

.fd-netdisk-text {
  max-width: 46ch;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

/* ---------- 温馨提示 ---------- */
.fd-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.14);
}

.fd-tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #ffffff;
  color: #2563eb;
  box-shadow: 0 2px 8px -4px rgba(37, 99, 235, 0.4);
}

.fd-tip-icon svg {
  width: 18px;
  height: 18px;
}

.fd-tip-title {
  color: #1e40af;
  font-size: 14px;
  font-weight: 700;
}

.fd-tip-text {
  margin-top: 4px;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
}

/* ---------- 空态 ---------- */
.fd-state {
  padding: 80px 24px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  text-align: center;
}

.fd-state-title {
  color: #334155;
  font-size: 16px;
  font-weight: 700;
}

.fd-state-sub {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 13px;
}
</style>
