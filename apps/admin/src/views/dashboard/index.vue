<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

function goToUserList() {
  router.push('/user/list')
}

interface QuickEntry {
  label: string
  route: string
  moduleCode: string
  type?: string
}

const allEntries: QuickEntry[] = [
  { label: '用户管理', route: '/user/list', moduleCode: 'user_member', type: 'warning' },
  { label: '院校管理', route: '/university/info', moduleCode: 'university_info', type: 'primary' },
  { label: '专业管理', route: '/major/list', moduleCode: 'major_info', type: 'success' },
  { label: '公告管理', route: '/home/announcement', moduleCode: 'home_announcement', type: 'danger' },
  { label: '系统设置', route: '/system/settings', moduleCode: 'system_setting', type: 'danger' },
  { label: '算法配置', route: '/algorithm/admission/group', moduleCode: 'algo_admission', type: 'primary' },
  { label: '城市管理', route: '/city/list', moduleCode: 'city_info', type: 'success' },
  { label: '证书管理', route: '/certificate/certificate', moduleCode: 'certificate_info', type: 'primary' },
  { label: '行业管理', route: '/industry/list', moduleCode: 'industry_info', type: 'success' },
  { label: '企业管理', route: '/company/info', moduleCode: 'company_info', type: 'warning' },
]

const filteredEntries = computed(() =>
  allEntries.filter(e => userStore.moduleCodes.includes(e.moduleCode))
)

const DEFAULT_COUNT = 4
const showAll = ref(false)

const visibleEntries = computed(() =>
  showAll.value ? filteredEntries.value : filteredEntries.value.slice(0, DEFAULT_COUNT)
)

function goTo(route: string) {
  router.push(route)
}

function toggleShowAll() {
  showAll.value = !showAll.value
}

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
      <div class="flex flex-wrap gap-3">
        <el-button
          v-for="entry in visibleEntries"
          :key="entry.route"
          :type="(entry.type as any) || 'default'"
          plain
          @click="goTo(entry.route)"
        >
          {{ entry.label }}
        </el-button>
        <el-button
          v-if="filteredEntries.length > DEFAULT_COUNT"
          @click="toggleShowAll"
        >
          {{ showAll ? '收起' : '更多...' }}
        </el-button>
      </div>
    </el-card>

    <!-- 欢迎信息 -->
    <el-card shadow="never">
      <el-result icon="success" title="欢迎使用海峰未来规划院管理后台" sub-title="系统已准备就绪">
        <template #extra>
          <el-button type="primary" @click="goToUserList">开始使用</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>
