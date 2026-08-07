<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndustryDetail } from '@/api/industry'
import { getIndustryEnterprises } from '@/api/enterprise'
import type { IndustryDetailVO } from '@/types/industry'
import type { IndustryEnterpriseGroupVO } from '@/types/enterprise'
import { Motion } from 'motion-v'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<IndustryDetailVO | null>(null)

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('行业ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getIndustryDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取行业详情失败')
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
  const industryId = route.params.id as string
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

function goEnterprisePositions(enterpriseId: string, enterpriseNameVal: string) {
  router.push({
    path: `/enterprise/${enterpriseId}/positions`,
    query: { name: enterpriseNameVal },
  })
}

onMounted(() => {
  fetchDetail()
  fetchRelatedEnterprises()
})

const activeJsonbTab = ref('industryScale')

function hasJsonbData(field: Record<string, any> | undefined | null): boolean {
  return !!field && Object.keys(field).length > 0
}

function getActiveSection() {
  return jsonbSections.find(s => s.key === activeJsonbTab.value)
}

const jsonbSections = [
  {
    key: 'industryScale',
    title: '行业规模',
    icon: '📊',
    fields: [
      { key: 'scaleValue', label: '规模数值' },
      { key: 'scaleLabel', label: '规模标签' },
      { key: 'scaleDescriptions', label: '规模描述', type: 'array' },
    ],
  },
  {
    key: 'industryTalentDemand',
    title: '人才需求',
    icon: '🧑‍💼',
    fields: [
      { key: 'demandValue', label: '需求量' },
      { key: 'demandLabel', label: '需求标签' },
      { key: 'demandDescriptions', label: '需求描述', type: 'array' },
    ],
  },
  {
    key: 'industrySalary',
    title: '行业薪资',
    icon: '💰',
    fields: [
      { key: 'salaryRange', label: '薪资范围' },
      { key: 'salaryLabel', label: '薪资标签' },
      { key: 'salaryDescriptions', label: '薪资描述', type: 'array' },
    ],
  },
  {
    key: 'policyInfo',
    title: '政策信息',
    icon: '🏛️',
    fields: [
      { key: 'policyOverview', label: '政策概览' },
      { key: 'nationalPolicies', label: '国家政策', type: 'array' },
      { key: 'policyHighlights', label: '政策亮点' },
    ],
  },
  {
    key: 'developmentSupportInfo',
    title: '发展支持',
    icon: '🏗️',
    fields: [
      { key: 'regionalOverview', label: '地域概述' },
      { key: 'keyCities', label: '重点城市', type: 'array' },
      { key: 'cityPolicies', label: '城市政策', type: 'array' },
    ],
  },
  {
    key: 'talentAnalysis',
    title: '人才分析',
    icon: '📈',
    fields: [
      { key: 'analysisTitle', label: '分析标题' },
      { key: 'shortagePositions', label: '紧缺岗位', type: 'array' },
      { key: 'educationRequirement', label: '学历要求' },
      { key: 'majorRequirement', label: '专业要求' },
      { key: 'talentTrendDescription', label: '人才趋势' },
    ],
  },
  {
    key: 'talentPolicy',
    title: '人才政策',
    icon: '🎓',
    fields: [
      { key: 'policyTitle', label: '政策标题' },
      { key: 'nationalPolicies', label: '国家级政策', type: 'array' },
      { key: 'localPolicies', label: '地方级政策', type: 'array' },
      { key: 'enterpriseDescription', label: '企业层面' },
    ],
  },
  {
    key: 'salaryData',
    title: '薪资数据',
    icon: '💵',
    fields: [
      { key: 'salaryAnalysisTitle', label: '薪资分析标题' },
      { key: 'salaryAnalysisDescription', label: '薪资分析描述' },
      { key: 'regionalSalaryTitle', label: '地域差异标题' },
      { key: 'regionalSalaryDescription', label: '地域差异描述' },
      { key: 'salaryTrendAnalysis', label: '趋势分析' },
    ],
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero Header -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-8">
          <section class="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 shadow-lg shadow-orange-200/60">
            <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-2xl md:text-3xl font-bold text-white">{{ detail.industryName }}</h2>
                  <span v-if="detail.category" class="rounded-full bg-white/20 px-3 py-1 text-sm text-white border border-white/30">{{ detail.category }}</span>
                </div>
                <p class="text-orange-50 mt-2">{{ detail.shortDescription }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-orange-500">{{ detail.investmentHeat != null ? `${detail.investmentHeat}%` : '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">投资热度</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-blue-600">{{ detail.annualGrowthRate != null ? `${detail.annualGrowthRate}%` : '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">年增长率</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-purple-600">{{ detail.marketScale || '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">市场规模</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-green-600">{{ detail.talentGap || '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">人才缺口</div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Two-column content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Left column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 详细描述 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 class="mb-4 text-lg font-bold text-gray-800">📋 详细描述</h3>
                <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.detailedDescription || '暂无详细介绍' }}</p>
              </section>
            </Motion>

            <!-- JSONB Tabs -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 class="mb-4 text-lg font-bold text-gray-800">🗂️ 深度数据</h3>
                <div class="jsonb-tab-bar">
                  <button
                    v-for="section in jsonbSections"
                    :key="section.key"
                    :class="['jsonb-tab', { active: activeJsonbTab === section.key }]"
                    @click="activeJsonbTab = section.key"
                  >
                    <span>{{ section.icon }}</span>
                    <span>{{ section.title }}</span>
                  </button>
                </div>

                <div v-if="getActiveSection() && hasJsonbData((detail as any)?.[getActiveSection()!.key])" class="jsonb-tab-content">
                  <div v-for="field in getActiveSection()!.fields" :key="field.key" class="jsonb-field-row">
                    <template v-if="(detail as any)?.[getActiveSection()!.key]?.[field.key] != null && (detail as any)?.[getActiveSection()!.key]?.[field.key] !== ''">
                      <span class="jsonb-field-label">{{ field.label }}</span>
                      <template v-if="field.type === 'array' && Array.isArray((detail as any)?.[getActiveSection()!.key]?.[field.key]) && (detail as any)?.[getActiveSection()!.key]?.[field.key].length">
                        <div class="flex flex-wrap gap-2">
                          <span v-for="(item, idx) in (detail as any)?.[getActiveSection()!.key]?.[field.key]" :key="idx" class="jsonb-pill">{{ item }}</span>
                        </div>
                      </template>
                      <template v-else-if="field.type !== 'array'">
                        <span class="jsonb-field-value">{{ (detail as any)?.[getActiveSection()!.key]?.[field.key] }}</span>
                      </template>
                    </template>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-400">暂无数据</p>
              </section>
            </Motion>
          </div>

          <!-- Right column (sticky) -->
          <div class="space-y-6 lg:sticky lg:top-24">
            <!-- 趋势一览 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <h3 class="mb-4 text-lg font-bold text-gray-800">📈 趋势一览</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">增长趋势</span>
                    <span class="flex items-center gap-1"><span :class="getTrendColor(detail.growthTrend)" class="font-semibold">{{ detail.growthTrend || '-' }}</span><span>{{ getTrendIcon(detail.growthTrend) }}</span></span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">市场趋势</span>
                    <span class="flex items-center gap-1"><span :class="getTrendColor(detail.marketTrend)" class="font-semibold">{{ detail.marketTrend || '-' }}</span><span>{{ getTrendIcon(detail.marketTrend) }}</span></span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">人才趋势</span>
                    <span class="flex items-center gap-1"><span :class="getTrendColor(detail.talentTrend)" class="font-semibold">{{ detail.talentTrend || '-' }}</span><span>{{ getTrendIcon(detail.talentTrend) }}</span></span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">投资趋势</span>
                    <span class="flex items-center gap-1"><span :class="getTrendColor(detail.investmentTrend)" class="font-semibold">{{ detail.investmentTrend || '-' }}</span><span>{{ getTrendIcon(detail.investmentTrend) }}</span></span>
                  </div>
                </div>
                <div v-if="detail.investmentHeat != null" class="mt-4">
                  <div class="flex items-center justify-between mb-2 text-xs">
                    <span class="text-gray-400">投资热度</span>
                    <span class="font-semibold text-gray-700">{{ detail.investmentHeat }}%</span>
                  </div>
                  <el-progress :percentage="detail.investmentHeat" :stroke-width="10" :show-text="false" color="#f97316" />
                </div>
              </section>
            </Motion>

            <!-- 关联企业 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <h3 class="mb-4 text-lg font-bold text-gray-800">🏢 关联企业</h3>
                <div v-if="relatedLoading" class="text-sm text-gray-400">加载中...</div>
                <template v-else-if="isProRelated">
                  <div v-if="relatedEnterprises.length && relatedEnterprises[0].enterprises.length" class="space-y-3">
                    <div
                      v-for="ent in relatedEnterprises[0].enterprises"
                      :key="ent.enterpriseId"
                      class="flex items-center justify-between rounded-xl bg-white p-4 hover:bg-orange-50 transition-colors cursor-pointer border border-gray-100"
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
            </Motion>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ========== JSONB Tab Bar ========== */
.jsonb-tab-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}
.jsonb-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fff;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.jsonb-tab:hover {
  color: #f97316;
  border-color: #f97316;
}
.jsonb-tab.active {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

/* ========== JSONB Tab Content ========== */
.jsonb-tab-content {
  min-height: 80px;
}
.jsonb-field-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f9fafb;
}
.jsonb-field-row:last-child {
  border-bottom: none;
}
.jsonb-field-label {
  flex-shrink: 0;
  width: 100px;
  color: #9ca3af;
  font-size: 13px;
  padding-top: 2px;
}
.jsonb-field-value {
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
}

/* ========== JSONB Pill Tags ========== */
.jsonb-pill {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  color: #c2410c;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(249, 115, 22, 0.15);
}
</style>
