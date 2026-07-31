<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
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
  搏: '#FF4D4F',
  冲: '#FFA940',
  稳: '#FADB14',
  保: '#52C41A',
  垫: '#1890FF',
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
  let planId: number | null = null
  let hasError = false

  for (const group of groups) {
    const majorIds = group.majors.map(m => m.majorId)
    try {
      const res = await addMajors({ planId, groupId: group.groupId, majorIds })
      if (!planId && res.data.data?.id) {
        planId = res.data.data.id
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
    await deletePlan(plan.id)
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
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-5xl">
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 新建卡片 -->
        <button
          class="rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center gap-3 hover:border-orange-400 hover:bg-orange-50/30 transition-all min-h-[220px]"
          @click="handleCreate"
        >
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-500">新建志愿表</span>
          <span class="text-xs text-gray-400">
            已有 {{ plans.length }} / {{ maxPlans }} 个
          </span>
        </button>

        <!-- 已有方案卡片 -->
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="rounded-2xl bg-white p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer min-h-[220px] flex flex-col"
          @click="openPlan(plan)"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold text-gray-800 truncate">{{ plan.planName }}</h3>
            <button
              class="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
              title="删除"
              @click.stop="handleDelete(plan)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div class="text-xs text-gray-400 mb-4">
            {{ plan.planProvince }} | {{ plan.reformModel }} | {{ plan.planBatch }} | {{ plan.userScore }}分/{{ plan.userRank }}位
          </div>

          <!-- 各档统计 -->
          <div class="mt-auto grid grid-cols-5 gap-1.5">
            <div class="text-center rounded-lg py-1.5" :style="{ backgroundColor: levelColors['搏'] + '15' }">
              <div class="text-xs font-bold" :style="{ color: levelColors['搏'] }">{{ plan.boLimit }}</div>
              <div class="text-[10px] text-gray-400">搏</div>
            </div>
            <div class="text-center rounded-lg py-1.5" :style="{ backgroundColor: levelColors['冲'] + '15' }">
              <div class="text-xs font-bold" :style="{ color: levelColors['冲'] }">{{ plan.chongLimit }}</div>
              <div class="text-[10px] text-gray-400">冲</div>
            </div>
            <div class="text-center rounded-lg py-1.5" :style="{ backgroundColor: levelColors['稳'] + '15' }">
              <div class="text-xs font-bold" :style="{ color: levelColors['稳'] }">{{ plan.wenLimit }}</div>
              <div class="text-[10px] text-gray-400">稳</div>
            </div>
            <div class="text-center rounded-lg py-1.5" :style="{ backgroundColor: levelColors['保'] + '15' }">
              <div class="text-xs font-bold" :style="{ color: levelColors['保'] }">{{ plan.baoLimit }}</div>
              <div class="text-[10px] text-gray-400">保</div>
            </div>
            <div class="text-center rounded-lg py-1.5" :style="{ backgroundColor: levelColors['垫'] + '15' }">
              <div class="text-xs font-bold" :style="{ color: levelColors['垫'] }">{{ plan.dieLimit }}</div>
              <div class="text-[10px] text-gray-400">垫</div>
            </div>
          </div>

          <div class="mt-3 text-[11px] text-gray-300 text-right">
            {{ plan.createdAt?.slice(0, 10) }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
