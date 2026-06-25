<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getWelfareDetail } from '@/api/employment/welfare'
import type { WelfarePositionDetailVO } from '@/types/employment/welfare'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<WelfarePositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getWelfareDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/welfare')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/employment/welfare')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回公益招聘</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">岗位详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                公益招聘
              </span>
              <span v-if="job.positionCategory" class="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-600">
                {{ job.positionCategory }}
              </span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.developingUnit }}<span v-if="job.employingUnit"> · {{ job.employingUnit }}</span></p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">月工资标准</p>
                <p class="font-semibold text-gray-800">{{ job.monthlySalary || '面议' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }} {{ job.district }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement || '不限' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">合同期限</p>
                <p class="font-semibold text-gray-800">{{ job.contractPeriod || '暂无' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount }}人</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">最长服务年限</p>
                <p class="font-semibold text-gray-800">{{ job.maxServiceYears }}年</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">岗位类别</p><p class="text-gray-800 font-medium">{{ job.positionCategory || '暂无' }}</p></div>
              <div><p class="text-gray-400">开发单位</p><p class="text-gray-800 font-medium">{{ job.developingUnit || '暂无' }}</p></div>
              <div><p class="text-gray-400">用工单位</p><p class="text-gray-800 font-medium">{{ job.employingUnit || '暂无' }}</p></div>
              <div><p class="text-gray-400">工作内容</p><p class="text-gray-800 font-medium">{{ job.workContent || '暂无' }}</p></div>
              <div><p class="text-gray-400">年龄范围</p><p class="text-gray-800 font-medium">{{ job.ageRange || '不限' }}</p></div>
              <div><p class="text-gray-400">身体条件</p><p class="text-gray-800 font-medium">{{ job.healthRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">户籍要求</p><p class="text-gray-800 font-medium">{{ job.householdRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">其他要求</p><p class="text-gray-800 font-medium">{{ job.otherRequirement || '暂无' }}</p></div>
              <div><p class="text-gray-400">就业困难认定</p><p class="text-gray-800 font-medium">{{ job.employmentDifficultyCert ? '需要' : '不需要' }}</p></div>
              <div><p class="text-gray-400">工作地点</p><p class="text-gray-800 font-medium">{{ job.workLocation || '暂无' }}</p></div>
              <div v-if="job.targetGroup && job.targetGroup.length > 0" class="md:col-span-2">
                <p class="text-gray-400 mb-2">面向人群</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(group, idx) in job.targetGroup" :key="idx" class="rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-600 border border-gray-200">
                    {{ group }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">合同与待遇</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">合同期限</p><p class="text-gray-800 font-medium">{{ job.contractPeriod || '暂无' }}</p></div>
              <div><p class="text-gray-400">是否可续签</p><p class="text-gray-800 font-medium">{{ job.isRenewable ? '是' : '否' }}</p></div>
              <div><p class="text-gray-400">最长服务年限</p><p class="text-gray-800 font-medium">{{ job.maxServiceYears }}年</p></div>
              <div><p class="text-gray-400">月工资标准</p><p class="text-gray-800 font-medium">{{ job.monthlySalary || '暂无' }}</p></div>
              <div><p class="text-gray-400">工资来源</p><p class="text-gray-800 font-medium">{{ job.salarySource || '暂无' }}</p></div>
              <div><p class="text-gray-400">岗位补贴</p><p class="text-gray-800 font-medium">{{ job.subsidyStandard || '暂无' }}</p></div>
              <div><p class="text-gray-400">社保缴纳</p><p class="text-gray-800 font-medium">{{ job.socialInsuranceInfo || '暂无' }}</p></div>
              <div><p class="text-gray-400">其他待遇</p><p class="text-gray-800 font-medium">{{ job.otherBenefits || '暂无' }}</p></div>
              <div><p class="text-gray-400">工作时间</p><p class="text-gray-800 font-medium">{{ job.workSchedule || '暂无' }}</p></div>
              <div><p class="text-gray-400">是否倒班</p><p class="text-gray-800 font-medium">{{ job.isShiftWork ? '是' : '否' }}</p></div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">报名时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}</p></div>
              <div><p class="text-gray-400">报名方式</p><p class="text-gray-800 font-medium">{{ job.applyMethod || '暂无' }}</p></div>
              <div><p class="text-gray-400">报名地点</p><p class="text-gray-800 font-medium">{{ job.applyAddress || '暂无' }}</p></div>
              <div><p class="text-gray-400">需携带材料</p><p class="text-gray-800 font-medium">{{ job.requiredDocuments || '暂无' }}</p></div>
              <div><p class="text-gray-400">联系电话</p><p class="text-gray-800 font-medium">{{ job.contactPhone || '暂无' }}</p></div>
              <div><p class="text-gray-400">联系人</p><p class="text-gray-800 font-medium">{{ job.contactPerson || '暂无' }}</p></div>
            </div>
            <p v-if="job.remark" class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{{ job.remark }}</p>
          </div>

          <div v-if="job.content" class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细说明</h3>
            <div class="text-sm leading-relaxed" v-html="job.content"></div>
          </div>
        </div>

        <div v-if="!loading && !job" class="py-20 text-center text-gray-400">
          岗位不存在
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
