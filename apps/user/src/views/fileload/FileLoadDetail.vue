<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFileLoadDetail } from '@/api/fileload'
import type { FileLoadDetailVO, FileLoadAudience } from '@/types/fileload'
import { useUserStore } from '@/store'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 / college=大学 */
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

const pageTitle = computed(() => props.title || (props.audience === 'middle' ? '初中专栏' : props.audience === 'high' ? '高中专栏' : '大学专栏'))
const audienceLabelMap: Record<FileLoadAudience, string> = {
  middle: '初中专栏',
  high: '高中专栏',
  college: '大学专栏',
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
          <!-- 左：iframe 内嵌预览 -->
          <div class="flex-1 min-h-[520px] lg:min-h-[660px] rounded-xl border border-orange-100 overflow-hidden bg-white flex flex-col">
            <iframe
              v-if="detail.previewUrl"
              :src="detail.previewUrl"
              class="w-full h-full min-h-[520px] lg:min-h-[660px]"
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
          </div>

          <!-- 右：元数据面板 -->
          <aside class="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
            <!-- 文件头部 -->
            <div class="flex items-center gap-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 border border-orange-100">
              <div
                class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md shadow-orange-200"
                :class="fileTypeMeta(detail.fileType).iconBg"
              >
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                </svg>
              </div>
              <div class="min-w-0">
                <h3 class="text-base font-bold text-gray-800 break-all leading-snug">{{ detail.fileName }}</h3>
                <span class="inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-white border border-orange-200 text-orange-600">
                  {{ fileTypeMeta(detail.fileType).label }}
                </span>
              </div>
            </div>

            <!-- 基础信息 -->
            <div class="rounded-xl bg-white border border-gray-100 p-4 space-y-3">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide">基础信息</div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">文件大小</span>
                <span class="font-medium text-gray-700">{{ formatSize(detail.fileSize) }}</span>
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

            <!-- 操作 -->
            <div class="flex flex-col gap-3 mt-auto">
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
  </div>
</template>
