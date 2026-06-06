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
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="日志 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="管理员 ID">{{ detail.adminId }}</el-descriptions-item>
        <el-descriptions-item label="管理员">{{ detail.adminName }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ detail.operation }}</el-descriptions-item>
        <el-descriptions-item label="请求路径" :span="2">{{ detail.requestPath }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag size="small">{{ detail.requestMethod }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="detail.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ detail.result === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2" v-if="detail.requestParams">
          <pre class="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">{{ formatJson(detail.requestParams) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detail.errorMsg">
          <span class="text-red-500">{{ detail.errorMsg }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
