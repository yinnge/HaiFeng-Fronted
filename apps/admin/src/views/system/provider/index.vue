<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAiBalance } from '@/api/system/provider'
import type { AiBalanceVO } from '@/types/system/provider'

const loading = ref(false)
const balanceList = ref<AiBalanceVO[]>([])

const fetchData = async (refresh = false) => {
  loading.value = true
  try {
    const res = await getAiBalance(refresh)
    if (res.data.code === 200) {
      balanceList.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '查询失败')
    }
  } catch {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 flex items-center gap-3">
      <el-button type="primary" @click="fetchData(false)">刷新</el-button>
      <el-button @click="fetchData(true)">强制刷新（跳过缓存）</el-button>
    </div>

    <div v-loading="loading" class="space-y-4">
      <div v-if="balanceList.length === 0 && !loading" class="rounded-lg bg-white p-10 text-center text-gray-400">
        暂未配置 DeepSeek 厂商
      </div>

      <div v-for="item in balanceList" :key="item.providerName" class="rounded-lg bg-white p-6">
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-lg font-semibold text-gray-800">{{ item.providerName }}</span>
            <el-tag v-if="item.isAvailable" type="success" size="small">可用</el-tag>
            <el-tag v-else type="danger" size="small">不可用</el-tag>
          </div>
          <span class="text-sm text-gray-400">币种：{{ item.currency }}</span>
        </div>

        <div class="mb-4">
          <span class="text-sm text-gray-500">关联模型：</span>
          <el-tag v-for="model in item.models" :key="model" size="small" class="mr-1">{{ model }}</el-tag>
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="总余额">
            <span class="text-xl font-semibold text-gray-800">
              {{ item.totalBalance != null ? `¥${item.totalBalance}` : '-' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="赠送余额">
            {{ item.grantedBalance != null ? `¥${item.grantedBalance}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="充值余额">
            {{ item.toppedUpBalance != null ? `¥${item.toppedUpBalance}` : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>
