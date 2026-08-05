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

        <!-- 详细描述 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">📋 详细描述</h3>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.detailedDescription || '暂无详细介绍' }}</p>
        </section>

        <!-- JSONB Tabs Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
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
