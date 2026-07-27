<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ssePost, type SseEvent } from '@/utils/sse'
import { getGeneratePdfUrl, getRegeneratePdfUrl } from '@/api/pdf-report'

const props = defineProps<{
  visible: boolean
  planId: number
  isRegenerate?: boolean
  recordId?: number
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  success: [recordId: number]
}>()

const router = useRouter()

const statusText = ref('准备中...')
const progress = ref(0)
const mapCurrent = ref(0)
const mapTotal = ref(0)
const currentUniversity = ref('')
const phase = ref<'idle' | 'quota' | 'map' | 'reduce' | 'done' | 'error'>('idle')
const errorMsg = ref('')
const errorCode = ref(0)
const successRecordId = ref(0)

let abortController: AbortController | null = null

watch(
  () => props.visible,
  (val) => {
    if (val) {
      startGenerate()
    } else {
      resetState()
    }
  }
)

function resetState() {
  statusText.value = '准备中...'
  progress.value = 0
  mapCurrent.value = 0
  mapTotal.value = 0
  currentUniversity.value = ''
  phase.value = 'idle'
  errorMsg.value = ''
  errorCode.value = 0
  successRecordId.value = 0
}

async function startGenerate() {
  resetState()
  phase.value = 'quota'
  statusText.value = '正在校验配额...'
  progress.value = 5

  abortController = new AbortController()

  const url = props.isRegenerate && props.recordId
    ? getRegeneratePdfUrl(props.recordId)
    : getGeneratePdfUrl(props.planId)

  try {
    for await (const event of ssePost(url, { signal: abortController.signal })) {
      handleEvent(event)
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return
    phase.value = 'error'
    errorMsg.value = err?.message || '生成失败'
    statusText.value = errorMsg.value
  }
}

function handleEvent(event: SseEvent) {
  switch (event.stage) {
    case 'quota_checked':
      phase.value = 'map'
      statusText.value = '正在分析各校数据...'
      progress.value = 10
      if (event.recordId) successRecordId.value = event.recordId
      break

    case 'map':
      mapCurrent.value = event.current || 0
      mapTotal.value = event.total || 0
      currentUniversity.value = event.university || ''
      statusText.value = `正在分析 ${mapCurrent.value}/${mapTotal.value}: ${currentUniversity.value}`
      progress.value = 10 + Math.floor((mapCurrent.value / mapTotal.value) * 60)
      break

    case 'map_done':
      statusText.value = '各校分析完成，正在生成全局研判...'
      progress.value = 75
      break

    case 'reduce':
      if (event.status === 'running') {
        statusText.value = '正在生成全局研判报告...'
        progress.value = 80
      } else if (event.status === 'done') {
        statusText.value = '全局研判完成，正在生成PDF...'
        progress.value = 90
      }
      break

    case 'done':
      phase.value = 'done'
      progress.value = 100
      statusText.value = '生成完成！'
      if (event.recordId) successRecordId.value = event.recordId
      setTimeout(() => {
        emit('success', successRecordId.value)
        emit('update:visible', false)
      }, 1500)
      break

    case 'error':
      phase.value = 'error'
      errorMsg.value = event.message || '生成失败'
      errorCode.value = event.code || 500
      statusText.value = errorMsg.value
      if (event.recordId) successRecordId.value = event.recordId
      break
  }
}

function handleCancel() {
  abortController?.abort()
  emit('update:visible', false)
}

function handleRetry() {
  startGenerate()
}

function goToHistory() {
  emit('update:visible', false)
  router.push(`/gaokao/pdf-history/${props.planId}`)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="AI 智能分析"
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="phase === 'error' || phase === 'done'"
    @update:model-value="(val: boolean) => !val && handleCancel()"
  >
    <div class="py-4">
      <!-- 进度条 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">{{ statusText }}</span>
          <span class="text-sm font-medium text-gray-700">{{ progress }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="{
              'bg-gradient-to-r from-violet-500 to-purple-500': phase !== 'error',
              'bg-red-500': phase === 'error',
            }"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <!-- Map 阶段详情 -->
      <div v-if="phase === 'map' && mapTotal > 0" class="mt-4 text-sm text-gray-500">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>正在处理第 {{ mapCurrent }} / {{ mapTotal }} 个专业组</span>
        </div>
        <div v-if="currentUniversity" class="mt-1 pl-6 text-gray-400">
          {{ currentUniversity }}
        </div>
      </div>

      <!-- Reduce 阶段 -->
      <div v-if="phase === 'reduce'" class="mt-4 text-sm text-gray-500 flex items-center gap-2">
        <svg class="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>AI 正在生成全局研判报告...</span>
      </div>

      <!-- 成功 -->
      <div v-if="phase === 'done'" class="mt-4 text-sm text-green-600 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>报告生成成功，正在跳转...</span>
      </div>

      <!-- 错误 -->
      <div v-if="phase === 'error'" class="mt-4">
        <div class="text-sm text-red-600 flex items-center gap-2 mb-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="errorCode !== 429"
            class="px-4 py-2 text-sm font-medium text-white bg-violet-500 rounded-lg hover:bg-violet-600 transition-colors"
            @click="handleRetry"
          >
            重新生成
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            @click="goToHistory"
          >
            查看历史记录
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div v-if="phase === 'error' || phase === 'done'">
        <button
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          @click="emit('update:visible', false)"
        >
          关闭
        </button>
      </div>
      <div v-else>
        <button
          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          @click="handleCancel"
        >
          取消
        </button>
      </div>
    </template>
  </el-dialog>
</template>
