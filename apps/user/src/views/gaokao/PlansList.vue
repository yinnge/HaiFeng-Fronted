<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useSelectionStore } from '@/store/modules/selection'
import {
  getDefaultLimits,
  getMyPlans,
  addMajors,
  deletePlan,
  type WishPlanLimitVO,
  type WishPlanListVO,
} from '@/api/wish-plan'

const router = useRouter()
const userStore = useUserStore()
const selectionStore = useSelectionStore()

const loading = ref(false)
const plans = ref<WishPlanListVO[]>([])
const limits = ref<WishPlanLimitVO | null>(null)

const MAX_PLANS: Record<string, number> = {
  normal: 1,
  pro: 5,
  vip: 10,
}

const levelColors: Record<string, string> = {
  搏: '#ef4444',
  冲: '#f97316',
  稳: '#eab308',
  保: '#22c55e',
  垫: '#3b82f6',
}

const levelBgColors: Record<string, string> = {
  搏: 'rgba(239,68,68,0.08)',
  冲: 'rgba(249,115,22,0.08)',
  稳: 'rgba(234,179,8,0.08)',
  保: 'rgba(34,197,94,0.08)',
  垫: 'rgba(59,130,246,0.08)',
}

const maxPlans = MAX_PLANS[userStore.userInfo?.memberType || 'normal'] || 1
const isAtLimit = plans.value.length >= maxPlans

onMounted(async () => {
  loading.value = true
  try {
    const [limitsRes, plansRes] = await Promise.all([getDefaultLimits(), getMyPlans()])
    limits.value = limitsRes.data.data
    plans.value = plansRes.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  if (plans.value.length >= maxPlans) {
    const typeName = userStore.userInfo?.memberType === 'vip' ? 'VIP' : userStore.userInfo?.memberType === 'pro' ? 'Pro' : '普通'
    ElMessageBox.alert(
      `当前${typeName}会员最多允许 ${maxPlans} 个志愿表，请删除旧方案或升级会员`,
      '已达上限',
      { confirmButtonText: '我知道了', type: 'warning' }
    )
    return
  }

  if (selectionStore.totalCount === 0) {
    ElMessage.warning('请先在专业组页面选择专业')
    router.push('/gaokao/groups')
    return
  }

  try {
    const { value: planName } = await ElMessageBox.prompt('请输入志愿表名称', '新建志愿表', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入方案名称',
      inputValue: `我的志愿方案${plans.value.length + 1}`,
    })

    await createPlanAndAddMajors(planName)
  } catch {
    // 用户取消
  }
}

async function createPlanAndAddMajors(planName: string) {
  const groups = Object.values(selectionStore.selections)
  let planId: string | null = null
  let hasError = false

  for (const group of groups) {
    const majorIds = group.majors.map(m => String(m.majorId))
    try {
      const res = await addMajors({ planId, groupId: String(group.groupId), majorIds })
      if (!planId && res.data.data?.id) {
        planId = String(res.data.data.id)
      }
    } catch (e: any) {
      ElMessage.error(e?.message || `添加「${group.universityName}」专业组失败`)
      hasError = true
      break
    }
  }

  if (planId) {
    selectionStore.clearSelection()
    ElMessage.success('志愿表创建成功')
    router.push(`/gaokao/plans/${planId}`)
  }
}

async function handleDelete(plan: WishPlanListVO) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${plan.planName}」？删除后不可恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await deletePlan(String(plan.id))
    ElMessage.success('已删除')
    plans.value = plans.value.filter(p => p.id !== plan.id)
  } catch {
    // 用户取消
  }
}

function openPlan(plan: WishPlanListVO) {
  router.push(`/gaokao/plans/${plan.id}`)
}

function goBack() {
  router.push('/gaokao/groups')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-7xl">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">我的志愿表</h1>
        <p class="text-sm text-gray-500 mt-1">管理你的志愿方案，一键导出</p>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="rounded-2xl border border-gray-100/60 bg-white p-6 shadow-card animate-pulse">
          <div class="flex items-start justify-between mb-4">
            <div class="w-24 h-5 bg-gray-200 rounded" />
            <div class="w-6 h-6 bg-gray-200 rounded" />
          </div>
          <div class="space-y-2 mb-4">
            <div class="w-40 h-3 bg-gray-200 rounded" />
            <div class="w-32 h-3 bg-gray-200 rounded" />
          </div>
          <div class="grid grid-cols-5 gap-1.5 mt-auto">
            <div v-for="j in 5" :key="j" class="h-12 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      <!-- 志愿表列表 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 新建卡片 -->
        <button
          class="group relative rounded-2xl border-2 border-dashed border-brand-orange/30 p-8 flex flex-col items-center justify-center gap-3 transition-all duration-300 min-h-[240px] hover:border-brand-orange hover:bg-brand-orange/5 hover:shadow-brand"
          @click="handleCreate"
        >
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center shadow-brand transition-transform duration-200 group-hover:scale-110">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-600 group-hover:text-brand-orange transition-colors">新建志愿表</span>
          <span class="text-xs text-gray-400">
            已有 <span class="font-semibold text-gray-600">{{ plans.length }}</span> / <span class="font-semibold text-gray-600">{{ maxPlans }}</span> 个
          </span>
        </button>

        <!-- 已有方案卡片 -->
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="group relative rounded-2xl bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer min-h-[240px] flex flex-col border border-gray-100/80"
          @click="openPlan(plan)"
        >
          <!-- 橙色顶边框 -->
          <div class="h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light" />

          <!-- 卡片内容 -->
          <div class="flex-1 p-5 flex flex-col">
            <!-- 标题行 -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-bold text-gray-800 truncate group-hover:text-brand-orange transition-colors">{{ plan.planName }}</h3>
                <div class="flex items-center gap-2 mt-1.5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">{{ plan.planProvince }}</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">{{ plan.reformModel }}</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">{{ plan.planBatch }}</span>
                </div>
              </div>
              <button
                class="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                title="删除"
                @click.stop="handleDelete(plan)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <!-- 分数信息 -->
            <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <svg class="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="font-semibold text-gray-700">{{ plan.userScore }}<span class="text-xs font-normal text-gray-400 ml-0.5">分</span></span>
              <span class="text-gray-300">·</span>
              <span class="tabular-nums">{{ plan.userRank }}<span class="text-xs text-gray-400 ml-0.5">位</span></span>
            </div>

            <!-- 安全等级统计 -->
            <div class="mt-auto grid grid-cols-5 gap-1.5">
              <div
                v-for="level in ['搏', '冲', '稳', '保', '垫']"
                :key="level"
                class="text-center rounded-xl py-2 transition-transform duration-200 hover:scale-105"
                :style="{ backgroundColor: levelBgColors[level] }"
              >
                <div
                  class="text-sm font-bold tabular-nums"
                  :style="{ color: levelColors[level] }"
                >
                  {{ level === '搏' ? plan.boLimit : level === '冲' ? plan.chongLimit : level === '稳' ? plan.wenLimit : level === '保' ? plan.baoLimit : plan.dieLimit }}
                </div>
                <div class="text-[10px] font-medium text-gray-400 mt-0.5">{{ level }}</div>
              </div>
            </div>

            <!-- 创建时间 -->
            <div class="mt-3 pt-3 border-t border-gray-100/60 flex items-center justify-between">
              <span class="text-[11px] text-gray-400">{{ plan.createdAt?.slice(0, 10) }}</span>
              <span class="text-[11px] text-brand-orange font-medium opacity-0 group-hover:opacity-100 transition-opacity">查看详情 →</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
