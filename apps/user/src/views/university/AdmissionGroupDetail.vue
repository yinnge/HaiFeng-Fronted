<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getAdmissionGroupDetail, getMajorScores } from '@/api/university'
import { MemberType } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import type { AdmissionGroupDetailVO, MajorScoreVO } from '@/types/university'

const recharge = useRechargeDialog()
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<AdmissionGroupDetailVO | null>(null)
const scores = ref<MajorScoreVO[]>([])
const scoresLoading = ref(false)

const isVip = computed(() => {
  return userStore.isLoggedIn() && userStore.userInfo?.memberType === MemberType.VIP
})

async function fetchDetail() {
  const groupId = route.params.groupId as string
  if (!groupId) {
    ElMessage.error('专业组ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getAdmissionGroupDetail(groupId)
    detail.value = res.data.data
    fetchScores()
  } catch (e: any) {
    if (e?.response?.status === 403) {
      detail.value = null
    } else {
      ElMessage.error(e?.message || '获取专业组详情失败')
    }
  } finally {
    loading.value = false
  }
}

async function fetchScores() {
  const groupId = route.params.groupId as string
  scoresLoading.value = true
  try {
    const res = await getMajorScores(groupId)
    scores.value = res.data.data || []
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error(e?.message || '获取录取明细失败')
    }
  } finally {
    scoresLoading.value = false
  }
}

function goBack() {
  router.back()
}

function goLogin() {
  userStore.setRedirectPath(route.fullPath)
  router.push('/login')
}

function goVip() {
  recharge.open()
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 container mx-auto px-6 py-8" v-loading="loading">
      <!-- VIP 引导卡片 -->
      <div v-if="!isVip && !detail && !loading" class="univ-card rounded-2xl p-8 text-center max-w-lg mx-auto">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-orange-500">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-bold text-gray-800">开通 VIP 查看录取数据</h3>
        <p class="mb-6 text-gray-500">查看专业录取明细、分数线、位次等详细数据</p>
        <div class="flex justify-center gap-4">
          <button
            class="btn-brand rounded-full px-8 py-3 text-white font-medium transition-all shadow-lg shadow-orange-200"
            @click="userStore.isLoggedIn() ? goVip() : goLogin()"
          >
            {{ userStore.isLoggedIn() ? '立即开通 VIP' : '前往登录' }}
          </button>
        </div>
      </div>

      <template v-if="detail">
        <!-- 专业组基本信息 -->
        <section class="univ-card mb-6 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{ detail.groupName }}</h2>
            <span class="pill-new text-sm">{{ detail.year }}年</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div><span class="text-gray-400">院校：</span><span class="text-gray-700">{{ detail.universityName }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province }}</span></div>
            <div><span class="text-gray-400">批次：</span><span class="text-gray-700">{{ detail.batch }}</span></div>
            <div><span class="text-gray-400">招生代码：</span><span class="text-gray-700">{{ detail.enrollmentCode }}</span></div>
            <div><span class="text-gray-400">城市：</span><span class="text-gray-700">{{ detail.cityName }}</span></div>
            <div><span class="text-gray-400">组代码：</span><span class="text-gray-700">{{ detail.groupCode }}</span></div>
          </div>
          <div v-if="detail.subjects?.length" class="mb-3">
            <span class="text-sm text-gray-400">选科要求：</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <span v-for="sub in detail.subjects" :key="sub" class="pill-new text-xs">{{ sub }}</span>
              <span class="pill-new text-xs">{{ detail.requirementType }}</span>
            </div>
          </div>
          <div v-if="detail.constraints?.length" class="mb-3">
            <span class="text-sm text-gray-400">约束条件：</span>
            <span v-for="(c, i) in detail.constraints" :key="i" class="ml-2 text-sm text-gray-600">{{ c }}</span>
          </div>
          <p v-if="detail.description" class="text-sm text-gray-500">{{ detail.description }}</p>
        </section>

        <!-- 分数概览 -->
        <section class="univ-card mb-6 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">录取分数概览</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="stat-card rounded-xl p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">最低分</div>
              <div class="text-2xl font-bold text-orange-600">{{ detail.minScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.minRank }}</div>
            </div>
            <div class="stat-card rounded-xl p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">最高分</div>
              <div class="text-2xl font-bold text-orange-600">{{ detail.maxScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.maxRank }}</div>
            </div>
            <div class="stat-card rounded-xl p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">平均分</div>
              <div class="text-2xl font-bold text-orange-600">{{ detail.avgScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.avgRank }}</div>
            </div>
            <div class="stat-card rounded-xl p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">录取人数</div>
              <div class="text-2xl font-bold text-orange-600">{{ detail.admissionCount }}</div>
              <div class="text-xs text-gray-400">{{ detail.majorCount }} 个专业</div>
            </div>
          </div>
        </section>

        <!-- 专业录取明细表格 -->
        <section class="univ-card mb-6 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业录取明细</h3>
          <div v-loading="scoresLoading">
            <el-table v-if="scores.length" :data="scores" stripe style="width: 100%" size="small">
              <el-table-column prop="majorName" label="专业名称" min-width="140" />
              <el-table-column prop="majorCode" label="代码" width="90" />
              <el-table-column prop="educationLevel" label="层次" width="70" />
              <el-table-column prop="duration" label="学制" width="60" />
              <el-table-column prop="tuition" label="学费" width="80" />
              <el-table-column prop="admissionCount" label="录取" width="60" />
              <el-table-column label="最低分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-orange-600">{{ row.minScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.minRank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="最高分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-amber-600">{{ row.maxScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.maxRank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="平均分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-blue-600">{{ row.avgScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.avgRank }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="constraints" label="约束" min-width="100">
                <template #default="{ row }">
                  <span v-if="row.constraints?.length" v-for="c in row.constraints" :key="c" class="pill-new text-xs mr-1">{{ c }}</span>
                  <span v-else class="text-gray-400">-</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-else-if="!scoresLoading" class="py-8 text-center text-gray-400">暂无专业录取明细</div>
          </div>
        </section>

        <!-- 时间信息 -->
        <section class="univ-card mb-6 p-4">
          <div class="flex gap-6 text-xs text-gray-400">
            <span>创建时间：{{ detail.createdAt?.slice(0, 10) }}</span>
            <span>更新时间：{{ detail.updatedAt?.slice(0, 10) }}</span>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.univ-card {
  /* !important 覆盖 .app-shell main > * 的透底规则（卡片是 main 直接子） */
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

/* ===== 橙系药丸标签 ===== */
.pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* ===== 统计数字卡：浅橙渐变底 ===== */
.stat-card {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.2);
}

/* ===== 主按钮 token 覆盖（本页生效，不动全局） ===== */
.btn-brand {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  border-color: transparent !important;
}
</style>
