<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFileLoadDetail, getFileLoadNetdisk } from '@/api/fileload'
import type { FileLoadDetailVO, FileLoadAudience, NetdiskInfoVO } from '@/types/fileload'
import { useUserStore } from '@/store'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

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

const loading = ref(false)
const detail = ref<FileLoadDetailVO | null>(null)
const vipBlocked = ref(false)

/** 是否为百度网盘资源（无预览/下载，取码接口限 VIP） */
const isNetdisk = computed(() => detail.value?.storageType === 'BAIDU')

// 网盘取码弹框
const netdiskVisible = ref(false)
const netdiskLoading = ref(false)
const netdiskInfo = ref<NetdiskInfoVO | null>(null)
const copied = ref(false)

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

async function load() {
  const id = route.params.id
  if (!id) {
    ElMessage.error('文件不存在')
    return
  }
  loading.value = true
  try {
    const res = await getFileLoadDetail(props.audience, String(id))
    detail.value = res.data.data
    vipBlocked.value = false
  } catch (e: any) {
    const msg = e?.message || '获取文件详情失败'
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
    const res = await getFileLoadNetdisk(props.audience, String(id))
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
  router.push(`/${props.audience}`)
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

function handleOpenNew() {
  const url = detail.value?.previewUrl
  if (!url) {
    ElMessage.warning('该文件类型暂不支持在线预览')
    return
  }
  window.open(url, '_blank', 'noopener')
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

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- 返回 + 标题 -->
      <div class="mb-6 flex items-center gap-3 flex-wrap">
        <button
          class="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-all"
          @click="goBack"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          返回{{ pageTitle }}
        </button>
        <h1 class="text-xl md:text-2xl font-bold text-gray-800">{{ pageTitle }} · 文件详情</h1>
      </div>

      <div v-loading="loading" class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
        <div v-if="detail" class="flex flex-col lg:flex-row gap-6">
          <!-- 左：百度网盘资源 / iframe 内嵌预览 -->
          <div class="flex-1 min-h-[700px] lg:min-h-[860px] rounded-xl border border-orange-100 overflow-hidden bg-white flex flex-col">
            <template v-if="isNetdisk">
              <div class="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
                <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center shadow-xl shadow-blue-200">
                  <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18a4 4 0 0 1-.9-7.9 5.5 5.5 0 0 1 10.8-1.5A4.5 4.5 0 0 1 17.5 18H7z" />
                  </svg>
                </div>
                <p class="text-base font-bold text-gray-800 break-all max-w-md">{{ detail.fileName }}</p>
                <p class="text-sm text-gray-500 leading-relaxed max-w-md">
                  该资源为百度网盘大文件。点击右侧「获取网盘链接」，复制分享链接与提取码后，前往百度网盘保存或下载。
                </p>
                <div class="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span class="rounded-full bg-blue-50 px-3 py-1 text-blue-600 border border-blue-100">百度网盘存储</span>
                  <span v-if="detail.applicableStage" class="rounded-full bg-amber-50 px-3 py-1 text-amber-600 border border-amber-100">{{ detail.applicableStage }}</span>
                </div>
              </div>
            </template>
            <template v-else>
              <iframe
                v-if="detail.previewUrl"
                :src="detail.previewUrl"
                class="w-full h-full min-h-[700px] lg:min-h-[860px]"
                frameborder="0"
                title="文件预览"
              ></iframe>
              <div v-else class="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <svg class="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                </svg>
                <p class="text-sm">该文件类型暂不支持在线预览</p>
                <p class="text-xs mt-1">请使用右侧「下载文件」按钮保存到本地查看</p>
              </div>
            </template>
          </div>

          <!-- 右：元数据面板 -->
          <aside class="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
            <!-- 文件头部 -->
            <div class="flex items-center gap-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 border border-orange-100">
              <div
                class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md"
                :class="isNetdisk ? 'from-blue-500 to-sky-400 shadow-blue-200' : fileTypeMeta(detail.fileType).iconBg"
              >
                <svg v-if="isNetdisk" class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 18a4 4 0 0 1-.9-7.9 5.5 5.5 0 0 1 10.8-1.5A4.5 4.5 0 0 1 17.5 18H7z" />
                </svg>
                <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-base font-bold text-gray-800 break-all leading-snug">{{ detail.fileName }}</h3>
                <span
                  class="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-white"
                  :class="isNetdisk ? 'border border-blue-200 text-blue-600' : 'border border-orange-200 text-orange-600'"
                >
                  {{ isNetdisk ? '网盘' : fileTypeMeta(detail.fileType).label }}
                </span>
              </div>
            </div>

            <!-- 基础信息 -->
            <div class="rounded-xl bg-white border border-gray-100 p-4 space-y-3">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">基础信息</div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">文件大小</span>
                <span class="font-medium text-gray-700">{{ isNetdisk ? '网盘大文件' : formatSize(detail.fileSize) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">上传时间</span>
                <span class="font-medium text-gray-700">{{ formatDate(detail.createTime) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">所属专栏</span>
                <span class="font-medium text-gray-700">{{ audienceLabel }}</span>
              </div>
            </div>

            <!-- 分类：学科 / 适用阶段 -->
            <div v-if="detail.subject || detail.applicableStage" class="rounded-xl bg-white border border-gray-100 p-4 space-y-3">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">分类</div>
              <div v-if="detail.subject" class="flex justify-between text-sm">
                <span class="text-gray-400">学科</span>
                <span class="font-medium text-gray-700">{{ detail.subject }}</span>
              </div>
              <div v-if="detail.applicableStage" class="flex justify-between text-sm">
                <span class="text-gray-400">适用阶段</span>
                <span class="font-medium text-gray-700">{{ detail.applicableStage }}</span>
              </div>
            </div>

            <!-- 文档简介 -->
            <div v-if="detail.description" class="rounded-xl bg-white border border-gray-100 p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">文档简介</div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ detail.description }}</p>
            </div>

            <!-- 标签 -->
            <div v-if="detail.tag" class="rounded-xl bg-white border border-gray-100 p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">标签</div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600 border border-orange-100"
                >
                  {{ detail.tag }}
                </span>
              </div>
            </div>

            <!-- 声明 -->
            <div class="rounded-xl bg-orange-50/50 border border-orange-100 p-4">
              <p class="text-xs text-gray-500 leading-relaxed">
                声明：文件由海枫未来规划院最终解释，如有侵权，请联系管理员。
              </p>
            </div>

            <!-- 操作 -->
            <div class="flex flex-col gap-3 mt-auto">
              <button
                v-if="isNetdisk"
                class="rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 hover:from-blue-600 hover:to-sky-600 transition-all disabled:opacity-50"
                :disabled="netdiskLoading"
                @click="fetchNetdisk"
              >
                <span class="inline-flex items-center justify-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {{ netdiskLoading ? '获取中…' : '获取网盘链接' }}
                </span>
              </button>
              <template v-else>
                <button
                  class="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
                  :disabled="!detail.downloadUrl"
                  @click="handleDownload"
                >
                  <span class="inline-flex items-center justify-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载文件
                  </span>
                </button>
                <button
                  class="rounded-full border border-orange-300 bg-white px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all disabled:opacity-50"
                  :disabled="!detail.previewUrl"
                  @click="handleOpenNew"
                >
                  <span class="inline-flex items-center justify-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    新窗口打开
                  </span>
                </button>
              </template>
            </div>
          </aside>
        </div>

        <!-- VIP 拦截空态 -->
        <div v-else-if="vipBlocked && !loading" class="py-20 text-center text-gray-400">
          <p class="text-sm">查看文件详情需要旗舰版（VIP）会员</p>
        </div>
        <!-- 其他空态 -->
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无文件数据</div>
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
