<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCivilDetail } from '@/api/employment/civil'
import type { CivilPositionDetailVO } from '@/types/employment/civil'
import { CivilRegStatusTag } from '@/types/employment/civil'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<CivilPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getCivilDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取职位详情失败')
    router.push('/employment/civil')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/employment/civil')
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '待定'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回公务员职位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{{ detail.examType }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="CivilRegStatusTag[detail.regStatus] === 'success' ? 'bg-green-50 text-green-600' : CivilRegStatusTag[detail.regStatus] === 'warning' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">{{ detail.regStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.recruitingDept }}<span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招录人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">最低学历：</span><span class="text-gray-700">{{ detail.minEducation || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">政治面貌：</span><span class="text-gray-700">{{ detail.politicalStatus || '不限' }}</span></div>
            <div><span class="text-gray-400">报名人数：</span><span class="text-gray-700">{{ detail.applicantCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">面试比例：</span><span class="text-gray-700">{{ detail.interviewRatio || '未知' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">职位详情</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">职位代码：</span><span class="text-gray-700">{{ detail.positionCode || '-' }}</span></div>
            <div><span class="text-gray-400">部门代码：</span><span class="text-gray-700">{{ detail.deptCode || '-' }}</span></div>
            <div><span class="text-gray-400">隶属局/分局：</span><span class="text-gray-700">{{ detail.affiliatedBureau || '-' }}</span></div>
            <div><span class="text-gray-400">考试类别：</span><span class="text-gray-700">{{ detail.examCategory || '-' }}</span></div>
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">工作年限：</span><span class="text-gray-700">{{ detail.workExperience || '无要求' }}</span></div>
            <div><span class="text-gray-400">基层经历：</span><span class="text-gray-700">{{ detail.grassrootsExperience || '无要求' }}</span></div>
            <div><span class="text-gray-400">户籍要求：</span><span class="text-gray-700">{{ detail.householdRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">户籍所在地：</span><span class="text-gray-700">{{ detail.householdLocation || '-' }}</span></div>
            <div><span class="text-gray-400">详细地址：</span><span class="text-gray-700">{{ detail.workLocationDetail || '-' }}</span></div>
          </div>
          <p v-if="detail.positionIntro" class="mt-4 text-sm text-gray-600 leading-relaxed">{{ detail.positionIntro }}</p>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考试信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">专业科目考试：</span><span class="text-gray-700">{{ detail.hasProfessionalTest ? '是' : '否' }}</span></div>
            <div><span class="text-gray-400">面试比例：</span><span class="text-gray-700">{{ detail.interviewRatio || '-' }}</span></div>
          </div>
          <div v-if="detail.officialWebsite" class="mt-4 text-sm">
            <span class="text-gray-400">官方公告：</span>
            <a :href="detail.officialWebsite" target="_blank" class="text-orange-500 hover:underline">{{ detail.officialWebsite }}</a>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名开始：</span><span class="text-gray-700">{{ formatDate(detail.regStartDate) }}</span></div>
            <div><span class="text-gray-400">报名结束：</span><span class="text-gray-700">{{ formatDate(detail.regEndDate) }}</span></div>
            <div><span class="text-gray-400">报名状态：</span><span class="text-gray-700">{{ detail.regStatus }}</span></div>
            <div><span class="text-gray-400">咨询电话：</span><span class="text-gray-700">{{ detail.contactPhone || '-' }}</span></div>
          </div>
          <p v-if="detail.remark" class="mt-4 text-sm text-gray-600 leading-relaxed">备注：{{ detail.remark }}</p>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到职位信息</div>
    </main>
  </div>
</template>
