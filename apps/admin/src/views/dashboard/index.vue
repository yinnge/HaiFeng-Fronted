<script setup lang="ts">
import { ref } from 'vue'

const stats = ref([
  { title: '用户总数', value: '12,580', icon: 'User', color: '#409eff' },
  { title: '今日新增', value: '156', icon: 'Plus', color: '#67c23a' },
  { title: 'VIP 会员', value: '3,280', icon: 'Star', color: '#e6a23c' },
  { title: '待处理订单', value: '42', icon: 'List', color: '#f56c6c' },
])
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-bold text-gray-800">控制面板</h2>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <el-card v-for="stat in stats" :key="stat.title" shadow="hover" class="cursor-pointer">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">{{ stat.title }}</p>
            <p class="text-2xl font-bold" :style="{ color: stat.color }">{{ stat.value }}</p>
          </div>
          <el-icon :size="48" :style="{ color: stat.color }">
            <component :is="stat.icon" />
          </el-icon>
        </div>
      </el-card>
    </div>

    <!-- 快捷入口 -->
    <el-card shadow="never">
      <template #header>
        <span class="font-bold">快捷入口</span>
      </template>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <el-button type="primary" plain>院校管理</el-button>
        <el-button type="success" plain>专业管理</el-button>
        <el-button type="warning" plain>用户管理</el-button>
        <el-button type="info" plain>算法配置</el-button>
        <el-button type="danger" plain>系统设置</el-button>
        <el-button plain>更多功能</el-button>
      </div>
    </el-card>

    <!-- 欢迎信息 -->
    <el-card shadow="never">
      <el-result icon="success" title="欢迎使用海峰未来规划院管理后台" sub-title="系统已准备就绪">
        <template #extra>
          <el-button type="primary">开始使用</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>
