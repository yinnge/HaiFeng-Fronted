<script setup lang="ts">
import { ref, watch } from 'vue'
import { getLogDetail } from '@/api/system/log'
import type { AdminLogDetailVO } from '@/types/system/log'

const props = defineProps<{
  visible: boolean
  logId?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const loading = ref(false)
const detail = ref<AdminLogDetailVO | null>(null)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.logId) {
      loading.value = true
      try {
        const res = await getLogDetail(props.logId)
        if (res.data.code === 200) {
          detail.value = res.data.data
        }
      } catch (error) {
        console.error('获取日志详情失败:', error)
      } finally {
        loading.value = false
      }
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
  detail.value = null
}

const formatJson = (str: string) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="日志详情"
    width="600px"
    class="detail-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-content">
      <el-descriptions :column="2" v-if="detail">
        <el-descriptions-item label="日志 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="管理员 ID">{{ detail.adminId }}</el-descriptions-item>
        <el-descriptions-item label="管理员">{{ detail.adminName }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ detail.operation }}</el-descriptions-item>
        <el-descriptions-item label="请求路径" :span="2">
          <span class="request-path">{{ detail.requestPath }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag size="small" round>{{ detail.requestMethod }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="detail.result === 'SUCCESS' ? 'success' : 'danger'" size="small" round>
            {{ detail.result === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2" v-if="detail.requestParams">
          <pre class="request-params">{{ formatJson(detail.requestParams) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detail.errorMsg">
          <span class="error-msg">{{ detail.errorMsg }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <button type="button" class="close-btn" @click="handleClose">
        关闭
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.detail-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.detail-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.detail-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.detail-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.request-path {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px;
  color: #6b7280;
  background: #f9fafb;
  padding: 4px 8px;
  border-radius: 4px;
}

.request-params {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  color: #374151;
  overflow: auto;
  max-height: 160px;
  line-height: 1.6;
  margin: 0;
}

.error-msg {
  color: #ef4444;
  font-weight: 500;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.close-btn:active {
  transform: translateY(0);
}
</style>
