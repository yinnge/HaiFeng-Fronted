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
  <div class="min-h-screen">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <!-- VIP 引导卡片 -->
      <div
        v-if="!isVip && !detail && !loading"
        class="ad-vip-card mx-auto max-w-2xl overflow-hidden rounded-2xl shadow-lg"
      >
        <div class="ad-vip-top px-8 py-8 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white">
            <svg viewBox="0 0 48 48" class="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="28" height="20" rx="5" fill="currentColor" />
              <path d="M16 20v-5a8 8 0 0 1 16 0v5" stroke="currentColor" stroke-width="3.5" />
              <rect x="22" y="27" width="4" height="7" rx="1.5" fill="#ffffff" />
            </svg>
          </div>
          <h3 class="mb-2 text-2xl font-bold text-white">开通 VIP 查看录取数据</h3>
          <p class="mb-1 text-base text-white/95">查看专业录取明细、分数线、位次等核心数据</p>
          <p class="mb-4 text-sm text-white/80">支持全国 2900+ 院校 · 近 5 年录取数据</p>
          <p class="text-sm text-white/70">院校详情 / 录取数据 / 本专业组</p>
        </div>
        <div class="ad-vip-bottom px-8 py-6">
          <div class="mx-auto mb-6 max-w-sm space-y-2.5">
            <div class="flex items-center gap-2.5 text-base text-gray-700">
              <span class="ad-vip-dot"></span>
              查看每个专业的录取分数与位次明细
            </div>
            <div class="flex items-center gap-2.5 text-base text-gray-700">
              <span class="ad-vip-dot"></span>
              分数区间可视化，快速判断报考难度
            </div>
            <div class="flex items-center gap-2.5 text-base text-gray-700">
              <span class="ad-vip-dot"></span>
              选科要求与专业约束条件一目了然
            </div>
          </div>
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              class="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-base font-medium text-white shadow-md shadow-orange-200 transition-all hover:from-orange-600 hover:to-amber-600 sm:w-auto"
              @click="userStore.isLoggedIn() ? goVip() : goLogin()"
            >
              {{ userStore.isLoggedIn() ? '立即开通 VIP' : '前往登录' }}
            </button>
            <button
              class="w-full rounded-full border border-orange-300 px-8 py-3 text-base font-medium text-orange-500 transition-all hover:bg-orange-50 sm:w-auto"
              @click="goVip"
            >
              了解会员权益
            </button>
          </div>
        </div>
      </div>

      <template v-if="detail">
        <!-- ① 沉浸式 Hero -->
        <section class="ad-hero mb-6 rounded-2xl px-6 py-6 md:px-8 md:py-7">
          <div class="mb-3 flex items-center justify-between">
            <button class="ad-back" @click="goBack">
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              返回
            </button>
            <span class="text-sm text-white/75">数据更新 {{ detail.updatedAt?.slice(0, 10) }}</span>
          </div>
          <p class="mb-1 text-sm text-white/75">院校详情 / 录取数据 / 本专业组</p>
          <h1 class="mb-3 text-3xl font-bold text-white md:text-4xl">{{ detail.year }}年 · {{ detail.groupName }}</h1>
          <div class="mb-3 flex flex-wrap gap-2">
            <span v-if="detail.batch" class="ad-hero-badge">{{ detail.batch }}</span>
            <span v-if="detail.requirementType" class="ad-hero-badge">{{ detail.requirementType }}</span>
            <span v-if="detail.groupCode" class="ad-hero-badge">{{ detail.groupCode }}组</span>
          </div>
          <p class="mb-4 text-base text-white/95">
            {{ detail.universityName }}<template v-if="detail.province"> · {{ detail.province }}</template><template v-if="detail.cityName"> · {{ detail.cityName }}</template><template v-if="detail.enrollmentCode"> · 招生代码 {{ detail.enrollmentCode }}</template>
          </p>
          <div class="ad-hero-divider"></div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-4 pt-4 md:grid-cols-4">
            <div>
              <div class="text-sm text-white/75">最低分</div>
              <div class="mt-0.5 text-3xl font-bold text-white">{{ detail.minScore }}<span class="ml-2 text-sm font-normal text-white/75">位次 {{ detail.minRank }}</span></div>
            </div>
            <div>
              <div class="text-sm text-white/75">最高分</div>
              <div class="mt-0.5 text-3xl font-bold text-white">{{ detail.maxScore }}<span class="ml-2 text-sm font-normal text-white/75">位次 {{ detail.maxRank }}</span></div>
            </div>
            <div>
              <div class="text-sm text-white/75">平均分</div>
              <div class="mt-0.5 text-3xl font-bold text-white">{{ detail.avgScore }}<span class="ml-2 text-sm font-normal text-white/75">位次 {{ detail.avgRank }}</span></div>
            </div>
            <div>
              <div class="text-sm text-white/75">录取</div>
              <div class="mt-0.5 text-3xl font-bold text-white">{{ detail.admissionCount }}<span class="ml-2 text-sm font-normal text-white/75">{{ detail.majorCount }} 个专业</span></div>
            </div>
          </div>
        </section>

        <!-- ② 专业录取明细 -->
        <section class="ad-card mb-6 rounded-2xl border border-gray-100 p-6 shadow-lg">
          <div class="mb-4 flex items-center gap-2">
            <span class="ad-title-bar"></span>
            <h3 class="text-xl font-bold text-gray-800">专业录取明细</h3>
            <span v-if="scores.length" class="rounded-full bg-orange-50 px-2.5 py-0.5 text-sm font-medium text-orange-600">{{ scores.length }}</span>
          </div>
          <div v-loading="scoresLoading">
            <el-table v-if="scores.length" :data="scores" class="ad-table" style="width: 100%" size="default">
              <el-table-column label="专业名称" min-width="150">
                <template #default="{ row }">
                  <div class="leading-tight">
                    <div class="text-base font-semibold text-gray-700">{{ row.majorName }}</div>
                    <div v-if="row.majorCode" class="text-xs text-gray-400">{{ row.majorCode }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="层次" width="70">
                <template #default="{ row }"><span class="text-base text-gray-700">{{ row.educationLevel }}</span></template>
              </el-table-column>
              <el-table-column label="学制" width="70">
                <template #default="{ row }"><span class="text-base text-gray-700">{{ row.duration }}</span></template>
              </el-table-column>
              <el-table-column label="学费" width="80">
                <template #default="{ row }"><span class="text-base text-gray-700">{{ row.tuition }}</span></template>
              </el-table-column>
              <el-table-column label="录取" width="70">
                <template #default="{ row }"><span class="text-base text-gray-700">{{ row.admissionCount }}</span></template>
              </el-table-column>
              <el-table-column label="最低分" width="110">
                <template #default="{ row }">
                  <div class="leading-tight">
                    <div class="text-lg font-bold text-orange-600">{{ row.minScore }}</div>
                    <div class="text-xs text-gray-400">位次 {{ row.minRank }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="最高分" width="110">
                <template #default="{ row }">
                  <div class="leading-tight">
                    <div class="text-lg font-bold text-amber-600">{{ row.maxScore }}</div>
                    <div class="text-xs text-gray-400">位次 {{ row.maxRank }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="平均分" width="110">
                <template #default="{ row }">
                  <div class="leading-tight">
                    <div class="text-lg font-bold text-amber-600">{{ row.avgScore }}</div>
                    <div class="text-xs text-gray-400">位次 {{ row.avgRank }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="约束" min-width="130">
                <template #default="{ row }">
                  <div v-if="row.constraints?.length" class="flex flex-wrap gap-1">
                    <span v-for="c in row.constraints" :key="c" class="rounded bg-amber-50 px-2 py-1 text-sm text-amber-700">{{ c }}</span>
                  </div>
                  <span v-else class="text-base text-gray-300">-</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-else-if="!scoresLoading" class="ad-empty py-14 text-center">
              <div class="ad-empty-icon mx-auto">
                <svg viewBox="0 0 48 48" class="h-10 w-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="14" width="32" height="24" rx="4" stroke="#d1d5db" stroke-width="2.5" />
                  <path d="M8 22h32" stroke="#d1d5db" stroke-width="2.5" />
                  <path d="M17 30h14" stroke="#f3b48a" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </div>
              <p class="mt-3 text-base text-gray-400">暂无专业录取明细</p>
              <p class="mt-1 text-sm text-gray-300">该专业组暂未公布各专业录取分数</p>
            </div>
          </div>
        </section>

        <!-- ③ 录取分数概览 -->
        <section class="ad-card mb-6 rounded-2xl border border-gray-100 p-6 shadow-lg">
          <div class="mb-4 flex items-center gap-2">
            <span class="ad-title-bar"></span>
            <h3 class="text-xl font-bold text-gray-800">录取分数概览</h3>
          </div>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div class="ad-stat rounded-xl bg-orange-50/70 p-4 text-center">
              <div class="mb-1 text-sm text-gray-400">最低分</div>
              <div class="text-3xl font-bold text-orange-600">{{ detail.minScore }}</div>
              <div class="mt-1 text-sm text-gray-400">位次 {{ detail.minRank }}</div>
            </div>
            <div class="ad-stat rounded-xl bg-orange-50/70 p-4 text-center">
              <div class="mb-1 text-sm text-gray-400">最高分</div>
              <div class="text-3xl font-bold text-orange-600">{{ detail.maxScore }}</div>
              <div class="mt-1 text-sm text-gray-400">位次 {{ detail.maxRank }}</div>
            </div>
            <div class="ad-stat rounded-xl bg-orange-50/70 p-4 text-center">
              <div class="mb-1 text-sm text-gray-400">平均分</div>
              <div class="text-3xl font-bold text-orange-600">{{ detail.avgScore }}</div>
              <div class="mt-1 text-sm text-gray-400">位次 {{ detail.avgRank }}</div>
            </div>
            <div class="ad-stat rounded-xl bg-orange-50/70 p-4 text-center">
              <div class="mb-1 text-sm text-gray-400">录取人数</div>
              <div class="text-3xl font-bold text-orange-600">{{ detail.admissionCount }}</div>
              <div class="mt-1 text-sm text-gray-400">{{ detail.majorCount }} 个专业</div>
            </div>
          </div>

          <!-- 分数区间条（纯 CSS） -->
          <div class="ad-range mt-4 rounded-xl bg-orange-50/40 p-4">
            <div class="mb-3 text-sm font-medium text-gray-600">分数区间</div>
            <div class="ad-range-track mb-2">
              <div
                class="ad-range-fill"
                :style="{ width: ((detail.avgScore - detail.minScore) / ((detail.maxScore - detail.minScore) || 1) * 100) + '%' }"
              ></div>
              <span class="ad-range-dot min"></span>
              <span
                class="ad-range-dot avg"
                :style="{ left: ((detail.avgScore - detail.minScore) / ((detail.maxScore - detail.minScore) || 1) * 100) + '%' }"
              ></span>
              <span class="ad-range-dot max"></span>
            </div>
            <div class="mb-3 flex justify-between text-sm text-gray-600">
              <span>{{ detail.minScore }} 最低</span>
              <span>{{ detail.avgScore }} 平均</span>
              <span>{{ detail.maxScore }} 最高</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="text-gray-400">位次区间</span>
              <span class="ad-rank-pill">{{ detail.minRank }}</span>
              <span class="ad-rank-pill">{{ detail.avgRank }}</span>
              <span class="ad-rank-pill">{{ detail.maxRank }}</span>
              <span class="ml-auto text-gray-400">位次越低越优</span>
            </div>
          </div>
        </section>

        <!-- ④ 专业组信息 -->
        <section class="ad-card mb-6 rounded-2xl border border-gray-100 p-6 shadow-lg">
          <div class="mb-4 flex items-center gap-2">
            <span class="ad-title-bar"></span>
            <h3 class="text-xl font-bold text-gray-800">专业组信息</h3>
          </div>
          <div class="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div class="mb-0.5 text-sm text-gray-500">招生代码</div>
              <div class="text-base font-medium text-gray-700">{{ detail.enrollmentCode || '-' }}</div>
            </div>
            <div>
              <div class="mb-0.5 text-sm text-gray-500">组代码</div>
              <div class="text-base font-medium text-gray-700">{{ detail.groupCode || '-' }}</div>
            </div>
            <div>
              <div class="mb-0.5 text-sm text-gray-500">城市</div>
              <div class="text-base font-medium text-gray-700">{{ detail.cityName || '-' }}</div>
            </div>
            <div>
              <div class="mb-0.5 text-sm text-gray-500">录取批次</div>
              <div class="text-base font-medium text-gray-700">{{ detail.batch || '-' }}</div>
            </div>
          </div>
          <div class="mb-3 flex flex-wrap items-start gap-2">
            <span class="ad-row-label">选科要求</span>
            <div class="flex flex-wrap gap-2">
              <span v-for="sub in detail.subjects" :key="sub" class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">{{ sub }}</span>
              <span v-if="detail.requirementType" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">{{ detail.requirementType }}</span>
            </div>
          </div>
          <div class="mb-3 flex flex-wrap items-start gap-2">
            <span class="ad-row-label">约束条件</span>
            <div class="flex flex-wrap gap-2">
              <span v-if="detail.constraints?.length" v-for="c in detail.constraints" :key="c" class="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">{{ c }}</span>
              <span v-else class="text-sm text-gray-300">-</span>
            </div>
          </div>
          <p v-if="detail.description" class="mt-4 border-t border-gray-100 pt-4 text-base leading-relaxed text-gray-600">{{ detail.description }}</p>
        </section>

        <!-- ⑤ 页脚 -->
        <section class="ad-footer mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-6 py-4 text-sm text-gray-500">
          <span>数据来源：各省教育考试院公布数据</span>
          <span class="text-gray-200">|</span>
          <span>更新于 {{ detail.updatedAt?.slice(0, 10) }}</span>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== Hero：实心橙渐变（全局规则会强制透明 main 直接子元素，必须 !important） ===== */
.ad-hero {
  background: linear-gradient(135deg, #e8722a 0%, #f59e0b 100%) !important;
  box-shadow: 0 10px 24px -8px rgba(232, 114, 42, 0.35);
}

.ad-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 14px;
  transition: background 0.2s;
}

.ad-back:hover {
  background: rgba(255, 255, 255, 0.3);
}

.ad-hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 13px;
}

.ad-hero-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.25);
}

/* ===== 白卡：实心白底 ===== */
.ad-card {
  background: #ffffff !important;
}

.ad-title-bar {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: #e8722a;
}

.ad-stat {
  background: linear-gradient(to bottom, #fff7ed, #fffaf5) !important;
}

/* ===== 分数区间条（纯 CSS） ===== */
.ad-range-track {
  position: relative;
  height: 10px;
  border-radius: 9999px;
  background-color: #fed7aa;
}

.ad-range-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #fb923c, #c2410c);
}

.ad-range-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 2.5px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(232, 114, 42, 0.35);
}

.ad-range-dot.min {
  left: 7px;
  transform: translate(0, -50%);
  background: #ea580c;
}

.ad-range-dot.avg {
  background: #e8722a;
}

.ad-range-dot.max {
  right: 7px;
  transform: translate(0, -50%);
  background: #d97706;
}

.ad-rank-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 9999px;
  background: #ffe8d6;
  color: #c2410c;
  font-size: 13px;
}

/* ===== 信息卡行标签 ===== */
.ad-row-label {
  flex-shrink: 0;
  padding-top: 3px;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* ===== VIP 引导卡 ===== */
.ad-vip-card {
  background: #ffffff !important;
}

.ad-vip-top {
  background: linear-gradient(135deg, #e8722a 0%, #f59e0b 100%) !important;
}

.ad-vip-bottom {
  background: #ffffff !important;
}

.ad-vip-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #e8722a;
}

/* ===== 表格：表头橙底 + 行 hover ===== */
.ad-table :deep(.el-table__header th.el-table__cell) {
  background-color: #fff1e6 !important;
  color: #c2410c !important;
  font-weight: 600;
  font-size: 14px;
}

.ad-table :deep(.el-table td.el-table__cell) {
  padding: 14px 0;
}

.ad-table :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #fffaf5 !important;
}

/* ===== 空状态 ===== */
.ad-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 9999px;
  background: #fff7ed;
}

/* ===== 页脚 ===== */
.ad-footer {
  background: #fffaf5 !important;
}
</style>
