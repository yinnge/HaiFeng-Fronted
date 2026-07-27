<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import {
  getPdfRecordDetail,
  downloadPdf,
  deletePdfRecord,
  type PdfRecordDetailVO,
  type MapResultItem,
  type ReduceResult,
  type PlanSnapshot,
} from '@/api/pdf-report'
import { renderMarkdown } from '@/utils/markdown'
import PdfGenerateDialog from '@/components/pdf/PdfGenerateDialog.vue'

const router = useRouter()
const route = useRoute()
const recordId = Number(route.params.recordId)

const loading = ref(true)
const record = ref<PdfRecordDetailVO | null>(null)
const activeTab = ref<'analysis' | 'pdf'>('analysis')
const pdfObjectUrl = ref('')

// 重新生成弹窗
const showGenerateDialog = ref(false)

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

onMounted(loadDetail)

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
  try {
    const { blob } = await downloadPdf(recordId)
    pdfObjectUrl.value = URL.createObjectURL(blob)
  } catch (e: any) {
    ElMessage.error(e?.message || 'PDF加载失败')
  }
}

function handleTabChange(tab: string) {
  if (tab === 'pdf') loadPdf()
}

async function handleDownload() {
  try {
    const { blob, filename } = await downloadPdf(recordId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (e: any) {
    ElMessage.error(e?.message || '下载失败')
  }
}

async function handleRegenerate() {
  const word = record.value?.status === 1
    ? '重新生成将消耗1次配额，确定？'
    : '确定重新生成？'
  try {
    await ElMessageBox.confirm(word, '重新生成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: record.value?.status === 1 ? 'warning' : 'info',
    })
    showGenerateDialog.value = true
  } catch {}
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

function handleGenerateSuccess(newRecordId: number) {
  if (newRecordId && newRecordId !== recordId) {
    router.replace(`/gaokao/pdf-report/${newRecordId}`)
  } else {
    loadDetail()
  }
}

function renderMd(md: string | null | undefined) {
  return renderMarkdown(md)
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-violet-500 transition-colors"
          @click="router.back()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800">AI 智能分析报告</h1>
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50"
            :disabled="record?.status !== 1"
            @click="handleDownload"
          >
            下载PDF
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-orange-400 to-amber-400 px-4 py-2 text-white text-sm font-medium hover:from-orange-500 hover:to-amber-500 transition-all shadow-md disabled:opacity-50"
            :disabled="record?.status === 0"
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
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-8 max-w-5xl">
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
            class="mt-6 px-6 py-2.5 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors font-medium"
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
              @click="activeTab = 'analysis'"
            >
              AI 分析
            </button>
            <button
              class="px-6 py-3 text-sm font-medium border-b-2 transition-colors"
              :class="activeTab === 'pdf'
                ? 'text-violet-600 border-violet-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'"
              @click="activeTab = 'pdf'"
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

          <!-- PDF 预览 Tab -->
          <div v-if="activeTab === 'pdf'" class="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div v-if="!pdfObjectUrl" class="flex justify-center py-20">
              <el-icon class="is-loading text-4xl text-violet-500"><Loading /></el-icon>
            </div>
            <iframe
              v-else
              :src="pdfObjectUrl"
              class="w-full border-0"
              style="min-height: 80vh"
            />
          </div>
        </template>
      </template>
    </main>

    <!-- 重新生成弹窗 -->
    <PdfGenerateDialog
      v-model:visible="showGenerateDialog"
      :plan-id="record?.planId || 0"
      :is-regenerate="true"
      :record-id="recordId"
      @success="handleGenerateSuccess"
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
