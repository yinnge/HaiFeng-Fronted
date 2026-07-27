<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getDashboardStats } from '@/api/dashboard'
import type { DashboardStatsVO } from '@/types/dashboard'

const loading = ref(true)
const errorMsg = ref('')
const stats = ref<DashboardStatsVO | null>(null)

const statCards = ref<{
  title: string
  value: number | string
  icon: string
  color: string
}[]>([])

async function fetchStats() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await getDashboardStats()
    if (res.data.code === 200 && res.data.data) {
      stats.value = res.data.data
      buildStatCards()
    } else {
      errorMsg.value = res.data.msg || '获取数据失败'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || '网络错误'
  } finally {
    loading.value = false
  }
}

function buildStatCards() {
  if (!stats.value) return
  const { memberStats, orderStats, entityStats } = stats.value
  statCards.value = [
    { title: '用户总数', value: memberStats.totalMembers, icon: 'User', color: '#409eff' },
    { title: 'Pro 会员', value: memberStats.proMembers, icon: 'Star', color: '#e6a23c' },
    { title: 'VIP 会员', value: memberStats.vipMembers, icon: 'Medal', color: '#f56c6c' },
    { title: '待处理订单', value: orderStats.pendingOrders, icon: 'ShoppingCart', color: '#909399' },
    { title: '总金额', value: `¥${orderStats.totalAmount}`, icon: 'Money', color: '#67c23a' },
    { title: '院校数量', value: entityStats.universityCount, icon: 'School', color: '#409eff' },
    { title: '专业数量', value: entityStats.majorCount, icon: 'Reading', color: '#e6a23c' },
    { title: '行业数量', value: entityStats.industryCount, icon: 'Suitcase', color: '#67c23a' },
    { title: '企业数量', value: entityStats.enterpriseCount, icon: 'OfficeBuilding', color: '#409eff' },
    { title: '录取组数', value: entityStats.admissionGroupCount, icon: 'Document', color: '#e6a23c' },
    { title: '专业分数记录', value: entityStats.admissionMajorScoreCount, icon: 'DataLine', color: '#67c23a' },
  ]
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">控制面板</h2>

    <!-- 加载中 -->
    <div v-loading="loading" class="min-h-[200px] rounded-lg bg-white p-5" />

    <!-- 错误提示 -->
    <el-alert
      v-if="!loading && errorMsg"
      :title="errorMsg"
      type="error"
      show-icon
      :closable="false"
    />

    <!-- 统计卡片 -->
    <div v-if="!loading && stats" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.title"
        class="rounded-lg bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ card.title }}</p>
            <p class="mt-1 text-2xl font-bold" :style="{ color: card.color }">
              {{ card.value }}
            </p>
          </div>
          <el-icon :size="40" :style="{ color: card.color }">
            <component :is="card.icon" />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>
