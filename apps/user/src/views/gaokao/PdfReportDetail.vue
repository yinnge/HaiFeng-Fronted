<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import {
  getPdfRecordDetail,
  downloadPdf,
  deletePdfRecord,
  savePdfFile,
  getPdfSectionPages,
  type PdfRecordDetailVO,
  type PdfSectionPageVO,
  type MapResultItem,
  type ReduceResult,
  type PlanSnapshot,
} from '@/api/pdf-report'
import { renderMarkdown } from '@/utils/markdown'
import PdfGenerateDialog from '@/components/pdf/PdfGenerateDialog.vue'
import PdfProfileDialog from '@/components/pdf/PdfProfileDialog.vue'
import { useUserStore } from '@/store/modules/user'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { usePdfQuota } from '@/composables/usePdfQuota'

const router = useRouter()
const route = useRoute()
const recordId = route.params.recordId as string
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { quota, loadQuota } = usePdfQuota()

const loading = ref(true)
const record = ref<PdfRecordDetailVO | null>(null)
const activeTab = ref<'analysis' | 'pdf'>('analysis')
const pdfObjectUrl = ref('')
const pdfError = ref('')

// ===== PDF 预览（后端自托管 pdf.js viewer + 左侧目录跳页，与 PDF 直链同源） =====
// 目录数据（后端用 PDFBox 扫描 PDF 文本定位章节起始页）
const tocSections = ref<PdfSectionPageVO[]>([])
const tocLoading = ref(false)
const tocLoaded = ref(false)
// pdf.js viewer 的 iframe 地址（点击目录以 #page=N 重建）
const viewerSrc = ref('')
// 当前选中章节（目录高亮）
const activeSection = ref('')

/** 自托管 pdf.js viewer 地址：固定为【同源相对路径】。
 *  必须是相对路径——pdf.js 的 validateFileURL 校验「file 的 origin 必须等于 viewer 的 origin」，
 *  而 dev 下 /pdfjs 由 Vite proxy 转发到 app、prod 下由 nginx 反代 /pdfjs/ 到 app，
 *  两者对浏览器都是同源；同时不再从 directPdfUrl 推导 origin，
 *  彻底避免 base-url 写成 localhost / 127.0.0.1 / Docker 内网名时
 *  「接口 200 但 iframe 报 localhost 连接失败」（跨设备/局域网/线上域名必挂）。 */
const PDF_VIEWER_PATH = '/pdfjs/web/viewer.html'

/** 是否有可用的同源 viewer + 签名直链（无则兜底走 /downloadPdf 的 blob 预览） */
const pdfViewerBase = computed(() => (record.value?.directPdfUrl ? PDF_VIEWER_PATH : ''))

const viewerMode = computed(() => !!pdfViewerBase.value)

// 重新生成弹窗
const showGenerateDialog = ref(false)

// 重新生成前先确认/完善 AI 分析档案
const showProfileDialog = ref(false)

const isVip = computed(() => (userStore.userInfo?.memberType || 'normal') === 'vip')

const safetyColorMap: Record<string, string> = {
  '搏': '#FF4D4F',
  '冲': '#FFA940',
  '稳': '#FADB14',
  '保': '#52C41A',
  '垫': '#1890FF',
}

const mapResults = computed<MapResultItem[]>(() => {
  if (!record.value?.mapResults) return []
  try {
    return JSON.parse(record.value.mapResults)
  } catch {
    return []
  }
})

const reduceResult = computed<ReduceResult>(() => {
  if (!record.value?.reduceResult) return { globalAnalysis: null, swot: null, recommendation: null }
  try {
    return JSON.parse(record.value.reduceResult)
  } catch {
    return { globalAnalysis: null, swot: null, recommendation: null }
  }
})

const planSnapshot = computed<PlanSnapshot>(() => {
  if (!record.value?.planSnapshot) return {} as PlanSnapshot
  try {
    return JSON.parse(record.value.planSnapshot)
  } catch {
    return {} as PlanSnapshot
  }
})

onMounted(async () => {
  await userStore.fetchUserInfo()
  loadDetail()
  loadQuota()
})

async function loadDetail() {
  loading.value = true
  try {
    const res = await getPdfRecordDetail(recordId)
    record.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadPdf() {
  if (pdfObjectUrl.value) return
  pdfError.value = ''
  try {
    const { blob } = await downloadPdf(recordId)
    pdfObjectUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    pdfError.value = e?.message || 'PDF加载失败'
    ElMessage.error(pdfError.value)
  }
}

function switchTab(tab: 'analysis' | 'pdf') {
  activeTab.value = tab
  if (tab === 'pdf') {
    loadToc()
    if (viewerMode.value) {
      // pdf.js viewer 模式：打开第 1 页
      viewerSrc.value = buildViewerUrl(1)
    } else {
      // 兜底：浏览器 blob 预览（后端未返回直链 / kk 服务地址不可用时）
      loadPdf()
    }
  }
}

/** 加载章节目录（一次即可） */
async function loadToc() {
  if (tocLoaded.value || tocLoading.value) return
  tocLoading.value = true
  try {
    const res = await getPdfSectionPages(recordId)
    tocSections.value = res.data.data || []
    tocLoaded.value = true
  } catch (e: any) {
    ElMessage.error(e?.message || '目录加载失败')
  } finally {
    tocLoading.value = false
  }
}

/** 构建 pdf.js viewer 地址（#page=N 跳页；_t 强制重载确保跳转生效） */
function buildViewerUrl(page: number) {
  const file = encodeURIComponent(record.value!.directPdfUrl!)
  return `${pdfViewerBase.value}?file=${file}&_t=${Date.now()}#page=${page}`
}

/** 点击目录项 → 跳转到章节起始页 */
function jumpToSection(section: PdfSectionPageVO) {
  if (!section.page || !viewerMode.value) return
  activeSection.value = section.num
  viewerSrc.value = buildViewerUrl(section.page)
}

/** 新窗口打开预览：直接复用 pdf.js viewer 地址（浏览器侧拉取签名直链）。
 *  viewer 与 PDF 直链同源（后端 18080），无需 kkFileView 参与。 */
function openKkPreview() {
  if (!viewerMode.value) {
    ElMessage.warning('暂不可用预览服务')
    return
  }
  window.open(buildViewerUrl(1), '_blank', 'noopener')
}

function retryLoadPdf() {
  pdfError.value = ''
  loadPdf()
}

async function handleDownload() {
  try {
    const { blob, filename } = await downloadPdf(recordId)
    savePdfFile(blob, filename)
    ElMessage.success('下载完成')
  } catch (e: any) {
    ElMessage.error(e?.message || '下载失败')
  }
}

async function handleRegenerate() {
  if (!isVip.value) {
    ElMessageBox.confirm(
      '重新生成报告需要VIP会员，是否前往开通？',
      '功能受限',
      { confirmButtonText: '立即升级', cancelButtonText: '取消', type: 'warning' }
    ).then(() => {
      recharge.open()
    }).catch(() => {})
    return
  }
  const word = record.value?.status === 1
    ? '重新生成将消耗1次配额，确定？'
    : '确定重新生成？'
  try {
    await ElMessageBox.confirm(word, '重新生成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: record.value?.status === 1 ? 'warning' : 'info',
    })
    showProfileDialog.value = true
  } catch {}
}

// 档案弹窗确认后，继续打开重新生成弹窗
function handleProfileProceed() {
  showProfileDialog.value = false
  showGenerateDialog.value = true
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确定删除该报告记录？删除后不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deletePdfRecord(recordId)
    ElMessage.success('删除成功')
    router.back()
  } catch (e: any) {
    if (e !== 'cancel' && e?.message) {
      ElMessage.error(e.message)
    }
  }
}

function handleGenerateSuccess(newRecordId: string) {
  if (newRecordId && newRecordId !== recordId) {
    router.replace(`/gaokao/pdf-report/${newRecordId}`)
  } else {
    loadDetail()
  }
  loadQuota()
}

function renderMd(md: string | null | undefined) {
  return renderMarkdown(md)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-5xl">
      <!-- 今日生成配额提示 -->
      <div class="mb-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          今日生成剩余次数：{{ quota.remaining }} 次
        </span>
        <span class="text-gray-400 text-xs ml-2">（每日上限 {{ quota.limit }} 次）</span>
      </div>

      <div class="flex justify-end gap-3 mb-4">
        <button
          class="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="router.push('/gaokao/pdf-history')"
        >
          查看历史记录
        </button>
        <button
          class="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          @click="router.push('/gaokao/plans')"
        >
          返回志愿列表
        </button>
        <button
          class="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50"
          :disabled="record?.status !== 1"
          @click="handleDownload"
        >
          下载PDF
        </button>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-2 text-white text-sm font-medium hover:from-orange-500 hover:to-amber-500 transition-all shadow-md disabled:opacity-50"
          :disabled="record?.status === 0 || quota.remaining <= 0"
          :title="quota.remaining <= 0 ? '今日次数已用完' : ''"
          @click="handleRegenerate"
        >
          重新生成
        </button>
        <button
          class="rounded-lg border border-gray-200 px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          :disabled="record?.status === 0"
          @click="handleDelete"
        >
          删除
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-violet-500"><Loading /></el-icon>
      </div>

      <template v-else-if="record">
        <!-- 生成中状态 -->
        <div v-if="record.status === 0" class="text-center py-20">
          <svg class="w-12 h-12 mx-auto text-blue-400 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p class="text-lg text-gray-500">报告正在生成中...</p>
          <p class="text-sm text-gray-400 mt-2">请稍后刷新页面查看</p>
        </div>

        <!-- 失败状态 -->
        <div v-else-if="record.status === 2" class="text-center py-20">
          <div class="text-red-400 mb-4">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-lg text-gray-500">报告生成失败</p>
          <p v-if="record.failReason" class="text-sm text-red-500 mt-2">{{ record.failReason }}</p>
          <button
            class="mt-6 px-6 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="quota.remaining <= 0"
            :title="quota.remaining <= 0 ? '今日次数已用完' : ''"
            @click="handleRegenerate"
          >
            重新生成
          </button>
        </div>

        <!-- 成功状态 -->
        <template v-else>
          <!-- Tab 切换 -->
          <div class="flex border-b border-gray-200 mb-6">
            <button
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'analysis'
                ? 'text-violet-600 border-violet-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'"
              @click="switchTab('analysis')"
            >
              AI 分析
            </button>
            <button
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'pdf'
                ? 'text-violet-600 border-violet-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'"
              @click="switchTab('pdf')"
            >
              PDF 预览
            </button>
          </div>

          <!-- AI 分析 Tab -->
          <div v-if="activeTab === 'analysis'" class="space-y-8">
            <!-- 封面信息 -->
            <div v-if="planSnapshot.planYear" class="bg-white rounded-xl border border-gray-100 p-6">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h2 class="text-lg font-bold text-gray-800">{{ planSnapshot.planYear }}年 高考志愿 AI 分析报告</h2>
              </div>
              <div class="flex flex-wrap gap-3 text-sm text-gray-600">
                <span class="px-3 py-1 bg-violet-50 text-violet-700 rounded-full">{{ planSnapshot.planProvince }}</span>
                <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">{{ planSnapshot.reformModel }}</span>
                <span class="px-3 py-1 bg-amber-50 text-amber-700 rounded-full">{{ planSnapshot.userScore }}分</span>
                <span class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">第{{ planSnapshot.userRank }}名</span>
                <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{{ planSnapshot.planBatch }}</span>
              </div>
            </div>

            <!-- 全局宏观分析 -->
            <div v-if="reduceResult.globalAnalysis" class="bg-white rounded-xl border border-gray-100 p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                <h3 class="text-base font-bold text-gray-800">全局宏观分析</h3>
              </div>
              <div class="prose prose-sm max-w-none text-gray-600" v-html="renderMd(reduceResult.globalAnalysis)" />
            </div>

            <!-- SWOT 分析 -->
            <div v-if="reduceResult.swot" class="bg-white rounded-xl border border-gray-100 p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
                <h3 class="text-base font-bold text-gray-800">SWOT 象限分析</h3>
              </div>
              <div class="prose prose-sm max-w-none text-gray-600" v-html="renderMd(reduceResult.swot)" />
            </div>

            <!-- 推荐填报梯队 -->
            <div v-if="reduceResult.recommendation" class="bg-white rounded-xl border border-gray-100 p-6">
              <div class="flex items-center gap-2 mb-4">
                <div class="w-1 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full" />
                <h3 class="text-base font-bold text-gray-800">推荐填报梯队顺序</h3>
              </div>
              <div class="prose prose-sm max-w-none text-gray-600" v-html="renderMd(reduceResult.recommendation)" />
            </div>

            <!-- 各校详情 -->
            <div v-if="mapResults.length > 0" class="space-y-4">
              <div class="flex items-center gap-2">
                <div class="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                <h3 class="text-base font-bold text-gray-800">各校分析详情</h3>
              </div>

              <div
                v-for="item in mapResults"
                :key="item.groupSnapshotId"
                class="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <!-- 组头 -->
                <div class="px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-800">{{ item.universityName }}</span>
                    <span class="text-sm text-gray-400">{{ item.cityName }}</span>
                    <span class="text-xs text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">{{ item.groupName }}</span>
                    <span
                      v-if="!item.success"
                      class="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded"
                    >
                      AI分析失败
                    </span>
                  </div>
                </div>

                <div class="p-5">
                  <!-- 专业列表 -->
                  <div v-if="item.majors.length > 0" class="mb-4">
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="major in item.majors"
                        :key="major.majorName"
                        class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <span
                          class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          :style="{ backgroundColor: safetyColorMap[major.levelShort] || '#999' }"
                        >
                          {{ major.levelShort }}
                        </span>
                        <span class="font-medium text-gray-700">{{ major.majorName }}</span>
                        <span class="text-gray-400">{{ (major.safetyLevel * 100).toFixed(0) }}%</span>
                        <template v-if="major.employmentRate != null">
                          <span class="text-gray-300">|</span>
                          <span class="text-gray-500">就业{{ (major.employmentRate * 100).toFixed(0) }}%</span>
                        </template>
                        <template v-if="major.salaryMin != null && major.salaryMax != null">
                          <span class="text-gray-300">|</span>
                          <span class="text-gray-500">{{ major.salaryMin }}-{{ major.salaryMax }}元</span>
                        </template>
                      </div>
                    </div>
                  </div>

                  <!-- AI 简评 -->
                  <div v-if="item.commentary" class="prose prose-sm max-w-none text-gray-600" v-html="renderMd(item.commentary)" />
                  <div v-else class="text-sm text-gray-400 italic">暂无AI分析</div>
                </div>
              </div>
            </div>
          </div>

          <!-- PDF 预览 Tab：左侧目录 + 右侧 pdf.js viewer（后端同源托管） -->
          <div v-if="activeTab === 'pdf'" class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-5 shadow-lg">
            <div class="flex flex-col lg:flex-row gap-5">
              <!-- 左：目录栏（与报告 PDF 目录页一致，点击跳页） -->
              <aside class="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">
                <div class="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h8" />
                    </svg>
                    <h3 class="text-base font-bold text-gray-800">报告目录</h3>
                  </div>
                  <p class="text-xs text-gray-400 mt-1.5 leading-relaxed">与报告 PDF 目录页一致，点击跳转到对应页</p>
                </div>

                <div
                  v-loading="tocLoading"
                  class="rounded-xl bg-white border border-gray-100 p-2 flex-1 overflow-y-auto max-h-[320px] lg:max-h-[720px]"
                >
                  <button
                    v-for="s in tocSections"
                    :key="s.num"
                    :disabled="!s.page"
                    class="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm transition-all text-left disabled:cursor-not-allowed disabled:opacity-40"
                    :class="activeSection === s.num
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-gray-600 hover:bg-orange-50/60'"
                    @click="jumpToSection(s)"
                  >
                    <span class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-xs font-bold flex items-center justify-center">{{ s.num }}</span>
                    <span class="flex-1 leading-snug">{{ s.title }}</span>
                    <span class="shrink-0 text-xs text-gray-400">{{ s.page ? `第${s.page}页` : '—' }}</span>
                  </button>
                  <div v-if="!tocLoading && tocSections.length === 0" class="py-8 text-center text-sm text-gray-400">目录暂不可用</div>
                </div>

                <button
                  class="rounded-full border border-orange-300 bg-white px-4 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-all"
                  @click="openKkPreview"
                >
                  <span class="inline-flex items-center justify-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    新窗口打开预览
                  </span>
                </button>
              </aside>

              <!-- 右：预览区 -->
              <div class="flex-1 min-w-0 rounded-xl border border-orange-100 overflow-hidden bg-white">
                <!-- pdf.js viewer 模式 -->
                <template v-if="viewerMode">
                  <iframe
                    v-if="viewerSrc"
                    :src="viewerSrc"
                    class="w-full h-full min-h-[700px] lg:min-h-[860px]"
                    frameborder="0"
                    title="报告预览"
                  />
                  <div v-else class="flex justify-center py-20">
                    <el-icon class="is-loading text-4xl text-orange-400"><Loading /></el-icon>
                  </div>
                </template>

                <!-- 兜底：浏览器 blob 预览（无 kk 服务地址 / 直链时） -->
                <template v-else>
                  <div v-if="pdfError" class="flex flex-col items-center justify-center py-20 gap-4">
                    <p class="text-sm text-red-500">{{ pdfError }}</p>
                    <button
                      class="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-full hover:bg-orange-600 transition-colors"
                      @click="retryLoadPdf"
                    >
                      重试
                    </button>
                  </div>
                  <div v-else-if="!pdfObjectUrl" class="flex justify-center py-20">
                    <el-icon class="is-loading text-4xl text-orange-400"><Loading /></el-icon>
                  </div>
                  <iframe
                    v-else
                    :src="pdfObjectUrl"
                    class="w-full border-0"
                    style="min-height: 80vh"
                  />
                </template>
              </div>
            </div>
          </div>
        </template>
      </template>
    </main>

    <!-- 重新生成弹窗 -->
    <PdfGenerateDialog
      v-model:visible="showGenerateDialog"
      :plan-id="String(record?.planId || '')"
      :is-regenerate="true"
      :record-id="recordId"
      @success="handleGenerateSuccess"
    />

    <!-- 重新生成前：AI 分析档案确认/填写 -->
    <PdfProfileDialog
      v-model:visible="showProfileDialog"
      @proceed="handleProfileProceed"
    />
  </div>
</template>

<style scoped>
.prose :deep(h1) { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.prose :deep(h2) { font-size: 1.125rem; font-weight: 700; margin: 0.875rem 0 0.5rem; }
.prose :deep(h3) { font-size: 1rem; font-weight: 600; margin: 0.75rem 0 0.375rem; }
.prose :deep(p) { margin: 0.375rem 0; line-height: 1.7; }
.prose :deep(ul), .prose :deep(ol) { padding-left: 1.25rem; margin: 0.375rem 0; }
.prose :deep(li) { margin: 0.125rem 0; }
.prose :deep(strong) { font-weight: 600; color: #374151; }
.prose :deep(blockquote) { border-left: 3px solid #e5e7eb; padding-left: 0.75rem; color: #6b7280; margin: 0.5rem 0; }
</style>
