<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import { getFileLoadList, getFileLoadDetail } from '@/api/fileload'
import type { FileLoadListVO, FileLoadDetailVO, FileLoadQueryDTO, FileLoadAudience } from '@/types/fileload'
import { useUserStore } from '@/store'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 */
  audience: FileLoadAudience
  /** 页面标题（路由 meta.title 亦可，此处用于 Banner 展示） */
  title?: string
}>()

const recharge = useRechargeDialog()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<FileLoadListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

/* ---------------- 详情弹框 ---------------- */
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<FileLoadDetailVO | null>(null)
const actionLoading = ref(false)

const bannerTitle = computed(() => props.title || (props.audience === 'middle' ? '初中专栏' : '高中专栏'))
const bannerDesc = computed(() =>
  props.audience === 'middle'
    ? '初中阶段精选学习资料、升学政策与备考指南，持续更新中。'
    : '高中阶段精选学习资料、高考政策与备考指南，持续更新中。',
)

async function fetchList() {
  loading.value = true
  try {
    const params: FileLoadQueryDTO = { page: currentPage.value, size: pageSize.value }
    const res = await getFileLoadList(props.audience, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取文件列表失败')
  } finally {
    loading.value = false
  }
}

/** 点击卡片（无单独详情按钮）→ 调详情接口 → 弹框展示 */
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

  detailLoading.value = true
  try {
    const res = await getFileLoadDetail(props.audience, item.id)
    detail.value = res.data.data
    detailVisible.value = true
  } catch (e: any) {
    const msg = e?.message || '获取文件详情失败'
    // VIP 权限不足（业务码 1005「权限不足（需要旗舰版）」）：引导开通
    if (msg.includes('旗舰版') || msg.includes('VIP')) {
      try {
        await ElMessageBox.confirm('查看文件详情与下载需要旗舰版（VIP）会员，是否前往开通？', '提示', {
          confirmButtonText: '去开通',
          cancelButtonText: '取消',
          type: 'warning',
        })
        recharge.open()
      } catch { /* 用户取消 */ }
      return
    }
    ElMessage.error(msg)
  } finally {
    detailLoading.value = false
  }
}

/* ---------------- 预览 / 下载 ---------------- */
function handlePreview() {
  const url = detail.value?.previewUrl
  if (!url) {
    ElMessage.warning('该文件类型暂不支持在线预览')
    return
  }
  window.open(url, '_blank', 'noopener')
}

function handleDownload() {
  const url = detail.value?.downloadUrl
  if (!url) {
    ElMessage.error('暂未生成下载链接，请稍后再试')
    return
  }
  actionLoading.value = true
  // 动态 a 标签触发下载（避免异步 window.open 被浏览器拦截）
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  actionLoading.value = false
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

onMounted(fetchList)

// 路由复用同一组件时（middle ↔ high）切换受众需重新拉取
watch(() => props.audience, () => {
  currentPage.value = 1
  detailVisible.value = false
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ bannerTitle }} · 精选学习资料</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">{{ bannerDesc }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['学习资料', '政策解读', '备考指南', '持续更新']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

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
                <div
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg shadow-orange-100 transition-transform duration-300 group-hover:scale-110"
                  :class="fileTypeMeta(item.fileType).iconBg"
                >
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                  </svg>
                </div>
                <span
                  class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="fileTypeMeta(item.fileType).badge"
                >
                  {{ fileTypeMeta(item.fileType).label }}
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
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{{ formatSize(item.fileSize) }}</span>
                  <span>{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
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

    <!-- 详情弹框：预览 + 下载 -->
    <ElDialog
      v-model="detailVisible"
      :title="`${bannerTitle} · 文件详情`"
      width="520px"
      :close-on-click-modal="false"
    >
      <div v-if="detail" v-loading="detailLoading" class="space-y-4">
        <!-- 文件头部 -->
        <div class="flex items-center gap-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-4 border border-orange-100">
          <div class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md shadow-orange-200"
            :class="fileTypeMeta(detail.fileType).iconBg">
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="text-lg font-bold text-gray-800 break-all">{{ detail.fileName }}</h3>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span class="rounded-full px-2 py-0.5 bg-white border border-orange-200 text-orange-600 font-semibold">
                {{ fileTypeMeta(detail.fileType).label }}
              </span>
              <span>{{ formatSize(detail.fileSize) }}</span>
              <span v-if="detail.subject">· {{ detail.subject }}</span>
              <span v-if="detail.applicableStage">· {{ detail.applicableStage }}</span>
            </div>
          </div>
        </div>

        <!-- 元信息 -->
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg bg-gray-50 px-3 py-2">
            <div class="text-xs text-gray-400">上传时间</div>
            <div class="mt-0.5 font-medium text-gray-700">{{ formatDate(detail.createTime) }}</div>
          </div>
          <div class="rounded-lg bg-gray-50 px-3 py-2">
            <div class="text-xs text-gray-400">文件大小</div>
            <div class="mt-0.5 font-medium text-gray-700">{{ formatSize(detail.fileSize) }}</div>
          </div>
        </div>

        <p class="text-xs text-gray-400 leading-relaxed">
          提示：预览支持 PDF、Word、Excel、PPT 及常见图片格式；下载链接由系统临时生成，请尽快使用。
        </p>
      </div>

      <template #footer>
        <div class="flex gap-3">
          <button
            class="flex-1 rounded-full border border-orange-300 bg-white px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all"
            :disabled="!detail?.previewUrl"
            @click="handlePreview"
          >
            <span class="inline-flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              在线预览
            </span>
          </button>
          <button
            class="flex-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
            :disabled="!detail?.downloadUrl || actionLoading"
            @click="handleDownload"
          >
            <span class="inline-flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载文件
            </span>
          </button>
        </div>
      </template>
    </ElDialog>
  </div>
</template>
