<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndustryDetail } from '@/api/industry'
import { getIndustryEnterprises } from '@/api/enterprise'
import type { IndustryDetailVO } from '@/types/industry'
import type { IndustryEnterpriseGroupVO } from '@/types/enterprise'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<IndustryDetailVO | null>(null)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('行业ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getIndustryDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取行业详情失败')
  } finally {
    loading.value = false
  }
}

function getTrendIcon(trend: string | undefined): string {
  if (trend === '上升') return '📈'
  if (trend === '下降') return '📉'
  return '➡️'
}

function getTrendColor(trend: string | undefined): string {
  if (trend === '上升') return 'text-green-600'
  if (trend === '下降') return 'text-red-600'
  return 'text-gray-500'
}

const relatedEnterprises = ref<IndustryEnterpriseGroupVO[]>([])
const relatedLoading = ref(false)
const isProRelated = ref(false)

async function fetchRelatedEnterprises() {
  const industryId = Number(route.params.id)
  if (!industryId) return
  relatedLoading.value = true
  try {
    const res = await getIndustryEnterprises([industryId])
    relatedEnterprises.value = res.data.data
    isProRelated.value = true
  } catch (e: any) {
    if (e?.response?.status === 403) {
      isProRelated.value = false
    }
  } finally {
    relatedLoading.value = false
  }
}

function goEnterprisePositions(enterpriseId: number, enterpriseNameVal: string) {
  router.push({
    path: `/enterprise/${enterpriseId}/positions`,
    query: { name: enterpriseNameVal },
  })
}

onMounted(() => {
  fetchDetail()
  fetchRelatedEnterprises()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">{{ detail.industryName }}</h2>
              <p class="text-gray-500 mt-2">{{ detail.shortDescription }}</p>
              <span v-if="detail.category" class="inline-block mt-3 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600 font-medium">{{ detail.category }}</span>
            </div>
          </div>

          <!-- Investment Heat -->
          <div v-if="detail.investmentHeat != null" class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-500">投资热度</span>
              <span class="text-sm font-semibold text-gray-700">{{ detail.investmentHeat }}%</span>
            </div>
            <el-progress :percentage="detail.investmentHeat" :stroke-width="10" :show-text="false" color="#f97316" />
          </div>

          <!-- Trend Indicators -->
          <div class="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-6">
            <div class="text-center">
              <div class="text-sm text-gray-400 mb-1">增长趋势</div>
              <div class="flex items-center justify-center gap-1">
                <span :class="getTrendColor(detail.growthTrend)" class="font-semibold">{{ detail.growthTrend || '-' }}</span>
                <span>{{ getTrendIcon(detail.growthTrend) }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400 mb-1">市场趋势</div>
              <div class="flex items-center justify-center gap-1">
                <span :class="getTrendColor(detail.marketTrend)" class="font-semibold">{{ detail.marketTrend || '-' }}</span>
                <span>{{ getTrendIcon(detail.marketTrend) }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400 mb-1">人才趋势</div>
              <div class="flex items-center justify-center gap-1">
                <span :class="getTrendColor(detail.talentTrend)" class="font-semibold">{{ detail.talentTrend || '-' }}</span>
                <span>{{ getTrendIcon(detail.talentTrend) }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-sm text-gray-400 mb-1">投资趋势</div>
              <div class="flex items-center justify-center gap-1">
                <span :class="getTrendColor(detail.investmentTrend)" class="font-semibold">{{ detail.investmentTrend || '-' }}</span>
                <span>{{ getTrendIcon(detail.investmentTrend) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 行业规模 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">📊 行业规模</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">年增长率：</span><span class="text-gray-700">{{ detail.annualGrowthRate != null ? `${detail.annualGrowthRate}%` : '-' }}</span></div>
            <div><span class="text-gray-400">市场规模：</span><span class="text-gray-700">{{ detail.marketScale || '-' }}</span></div>
            <div><span class="text-gray-400">人才缺口：</span><span class="text-gray-700">{{ detail.talentGap || '-' }}</span></div>
          </div>
          <div v-if="detail.industryScale && Object.keys(detail.industryScale).length" class="mt-4 border-t border-gray-100 pt-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">规模明细</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center rounded-xl bg-orange-50 p-3">
                <div class="text-lg font-bold text-orange-600">{{ detail.industryScale?.year ?? '-' }}</div>
                <div class="text-xs text-gray-500 mt-1">年份</div>
              </div>
              <div class="text-center rounded-xl bg-blue-50 p-3">
                <div class="text-lg font-bold text-blue-600">{{ detail.industryScale?.scale ?? '-' }}</div>
                <div class="text-xs text-gray-500 mt-1">规模</div>
              </div>
              <div class="text-center rounded-xl bg-green-50 p-3">
                <div class="text-lg font-bold text-green-600">{{ detail.industryScale?.growth ?? '-' }}</div>
                <div class="text-xs text-gray-500 mt-1">增长</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 薪资水平 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">💰 薪资水平</h3>
          <div v-if="detail.industrySalary && Object.keys(detail.industrySalary).length" class="mb-6">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">行业薪资范围</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div><span class="text-gray-400">入门：</span><span class="text-gray-700">{{ detail.industrySalary?.entry ?? '-' }}</span></div>
              <div><span class="text-gray-400">中级：</span><span class="text-gray-700">{{ detail.industrySalary?.mid ?? '-' }}</span></div>
              <div><span class="text-gray-400">高级：</span><span class="text-gray-700">{{ detail.industrySalary?.senior ?? '-' }}</span></div>
            </div>
          </div>
          <div v-if="detail.salaryData && Object.keys(detail.salaryData).length" class="border-t border-gray-100 pt-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">薪资对比</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-400">全国平均：</span><span class="text-gray-700">{{ detail.salaryData?.nationalAvg ?? '-' }}</span></div>
              <div><span class="text-gray-400">一线城市：</span><span class="text-gray-700">{{ detail.salaryData?.tier1City ?? '-' }}</span></div>
            </div>
          </div>
        </section>

        <!-- 人才分析 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🧑‍💼 人才分析</h3>
          <div v-if="detail.talentAnalysis && Object.keys(detail.talentAnalysis).length" class="mb-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-gray-400">供需比：</span><span class="text-gray-700">{{ detail.talentAnalysis?.supplyDemandRatio ?? '-' }}</span></div>
              <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.talentAnalysis?.educationRequired ?? '-' }}</span></div>
            </div>
          </div>
          <div v-if="detail.industryTalentDemand && Object.keys(detail.industryTalentDemand).length" class="border-t border-gray-100 pt-4">
            <div class="mb-3">
              <span class="text-sm text-gray-400">总需求：</span>
              <span class="text-sm font-semibold text-gray-700">{{ detail.industryTalentDemand?.totalDemand ?? '-' }}</span>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-gray-600 mb-2">热门岗位</h4>
              <div class="flex flex-wrap gap-2">
                <span v-if="detail.industryTalentDemand?.hotRoles?.length" v-for="role in detail.industryTalentDemand.hotRoles" :key="role" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{{ role }}</span>
                <span v-else class="text-gray-400 text-sm">暂无数据</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 政策与支持 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🏛️ 政策与支持</h3>
          <div v-if="detail.policyInfo && Object.keys(detail.policyInfo).length" class="mb-4">
            <div class="grid grid-cols-1 gap-3 text-sm" v-for="(value, key) in detail.policyInfo" :key="key">
              <div><span class="text-gray-400">{{ key }}：</span><span class="text-gray-700">{{ value }}</span></div>
            </div>
          </div>
          <div v-if="detail.developmentSupportInfo && Object.keys(detail.developmentSupportInfo).length" class="border-t border-gray-100 pt-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">发展支持</h4>
            <div class="grid grid-cols-1 gap-3 text-sm" v-for="(value, key) in detail.developmentSupportInfo" :key="key">
              <div><span class="text-gray-400">{{ key }}：</span><span class="text-gray-700">{{ value }}</span></div>
            </div>
          </div>
          <p v-if="!detail.policyInfo && !detail.developmentSupportInfo" class="text-sm text-gray-400">暂无数据</p>
        </section>

        <!-- 详细描述 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">📋 详细描述</h3>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.detailedDescription || '暂无详细介绍' }}</p>
        </section>

        <!-- 关联企业 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🏢 关联企业</h3>
          <div v-if="relatedLoading" class="text-sm text-gray-400">加载中...</div>
          <template v-else-if="isProRelated">
            <div v-if="relatedEnterprises.length && relatedEnterprises[0].enterprises.length" class="space-y-3">
              <div
                v-for="ent in relatedEnterprises[0].enterprises"
                :key="ent.enterpriseId"
                class="flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-orange-50 transition-colors cursor-pointer"
                @click="goEnterprisePositions(ent.enterpriseId, ent.enterpriseName)"
              >
                <span class="font-medium text-gray-800">{{ ent.enterpriseName }}</span>
                <span class="text-sm text-orange-500 font-medium">查看岗位 →</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400">暂无关联企业</p>
          </template>
          <div v-else class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-100">
            <p class="text-sm text-gray-600">
              🔒 升级
              <router-link to="/profile" class="text-orange-500 font-semibold hover:underline">专业版</router-link>
              可查看关联企业信息
            </p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
