<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import {
  getPdfRecords,
  downloadPdf,
  deletePdfRecord,
  type PdfRecordListVO,
} from '@/api/pdf-report'
import PdfGenerateDialog from '@/components/pdf/PdfGenerateDialog.vue'

const router = useRouter()
const route = useRoute()
const planId = Number(route.params.planId)

const loading = ref(false)
const records = ref<PdfRecordListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// SSE 重新生成弹窗
const showGenerateDialog = ref(false)
const regenerateRecordId = ref(0)

const statusMap: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: '生成中', color: 'text-blue-600', bg: 'bg-blue-50' },
  1: { label: '成功', color: 'text-green-600', bg: 'bg-green-50' },
  2: { label: '失败', color: 'text-red-600', bg: 'bg-red-50' },
}

onMounted(loadRecords)

async function loadRecords() {
  loading.value = true
  try {
    const res = await getPdfRecords({
      page: page.value,
      size: pageSize.value,
      planId,
    })
    records.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(val: number) {
  page.value = val
  loadRecords()
}

async function handleDownload(record: PdfRecordListVO) {
  try {
    const { blob, filename } = await downloadPdf(record.id)
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

async function handleRegenerate(record: PdfRecordListVO) {
  const word = record.status === 1 ? '重新生成将消耗1次配额，确定？' : '确定重新生成？'
  try {
    await ElMessageBox.confirm(word, '重新生成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: record.status === 1 ? 'warning' : 'info',
    })
    regenerateRecordId.value = record.id
    showGenerateDialog.value = true
  } catch {}
}

async function handleDelete(record: PdfRecordListVO) {
  try {
    await ElMessageBox.confirm('确定删除该报告记录？删除后不可恢复。', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deletePdfRecord(record.id)
    ElMessage.success('删除成功')
    loadRecords()
  } catch (e: any) {
    if (e !== 'cancel' && e?.message) {
      ElMessage.error(e.message)
    }
  }
}

function handleGenerateSuccess() {
  loadRecords()
}

function formatTime(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
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
        <h1 class="text-xl font-bold text-gray-800">AI 报告记录</h1>
        <div class="w-20" />
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-8 max-w-4xl">
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-violet-500"><Loading /></el-icon>
      </div>

      <div v-else-if="records.length === 0" class="text-center py-20">
        <div class="text-gray-300 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-gray-400 text-lg">暂无报告记录</p>
        <p class="text-gray-300 text-sm mt-2">在志愿表详情页点击「AI智能分析」生成报告</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="record in records"
          :key="record.id"
          class="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <!-- 状态指示 -->
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="[statusMap[record.status]?.bg, statusMap[record.status]?.color]"
              >
                <span
                  v-if="record.status === 0"
                  class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                />
                <svg v-else-if="record.status === 1" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {{ statusMap[record.status]?.label }}
              </span>

              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-800 truncate">{{ record.planName }}</div>
                <div class="text-xs text-gray-400 mt-0.5">{{ formatTime(record.createdAt) }}</div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <!-- 生成中 -->
              <template v-if="record.status === 0">
                <span class="text-sm text-blue-500 flex items-center gap-1.5">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  等待...
                </span>
              </template>

              <!-- 成功 -->
              <template v-else-if="record.status === 1">
                <button
                  class="px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
                  @click="router.push(`/gaokao/pdf-report/${record.id}`)"
                >
                  查看报告
                </button>
                <button
                  class="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  @click="handleDownload(record)"
                >
                  下载PDF
                </button>
                <button
                  class="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  @click="handleRegenerate(record)"
                >
                  重新生成
                </button>
                <button
                  class="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  @click="handleDelete(record)"
                >
                  删除
                </button>
              </template>

              <!-- 失败 -->
              <template v-else-if="record.status === 2">
                <button
                  class="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  @click="handleRegenerate(record)"
                >
                  重新生成
                </button>
                <button
                  class="px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  @click="handleDelete(record)"
                >
                  删除
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > pageSize" class="flex justify-center pt-4">
          <el-pagination
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </main>

    <!-- 重新生成弹窗 -->
    <PdfGenerateDialog
      v-model:visible="showGenerateDialog"
      :plan-id="planId"
      :is-regenerate="true"
      :record-id="regenerateRecordId"
      @success="handleGenerateSuccess"
    />
  </div>
</template>
