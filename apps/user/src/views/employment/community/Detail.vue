<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getCommunityDetail } from '@/api/employment/community'
import type { CommunityPositionDetailVO } from '@/types/employment/community'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<CommunityPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getCommunityDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/community')
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
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/employment/community')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回社区招聘</span>
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
                社区招聘
              </span>
              <span v-if="job.positionType" class="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-600">
                {{ job.positionType }}
              </span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.communityName }}<span v-if="job.streetOffice"> · {{ job.streetOffice }}</span></p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资待遇</p>
                <p class="font-semibold text-gray-800">{{ job.salaryRange || '面议' }}</p>
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
                <p class="text-gray-400 mb-1">用工形式</p>
                <p class="font-semibold text-gray-800">{{ job.employmentType || '暂无' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount }}人</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">年龄限制</p>
                <p class="font-semibold text-gray-800">{{ job.ageLimit }}岁以下</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">岗位类型</p><p class="text-gray-800 font-medium">{{ job.positionType || '暂无' }}</p></div>
              <div><p class="text-gray-400">用工形式</p><p class="text-gray-800 font-medium">{{ job.employmentType || '暂无' }}</p></div>
              <div><p class="text-gray-400">主管部门</p><p class="text-gray-800 font-medium">{{ job.supervisingDept || '暂无' }}</p></div>
              <div><p class="text-gray-400">社区名称</p><p class="text-gray-800 font-medium">{{ job.communityName || '暂无' }}</p></div>
              <div><p class="text-gray-400">街道办事处</p><p class="text-gray-800 font-medium">{{ job.streetOffice || '暂无' }}</p></div>
              <div><p class="text-gray-400">专业要求</p><p class="text-gray-800 font-medium">{{ job.majorRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">户籍要求</p><p class="text-gray-800 font-medium">{{ job.householdRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">政治面貌</p><p class="text-gray-800 font-medium">{{ job.politicalStatus || '不限' }}</p></div>
              <div><p class="text-gray-400">工作经验</p><p class="text-gray-800 font-medium">{{ job.workExperience || '不限' }}</p></div>
              <div><p class="text-gray-400">社工证要求</p><p class="text-gray-800 font-medium">{{ job.socialWorkCert || '不限' }}</p></div>
              <div><p class="text-gray-400">社区工作经验</p><p class="text-gray-800 font-medium">{{ job.communityExperience || '不限' }}</p></div>
              <div><p class="text-gray-400">居住地要求</p><p class="text-gray-800 font-medium">{{ job.residenceRequirement || '不限' }}</p></div>
              <div class="md:col-span-2"><p class="text-gray-400">详细工作地点</p><p class="text-gray-800 font-medium">{{ job.workLocation || '暂无' }}</p></div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">待遇与考试</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">薪资待遇</p><p class="text-gray-800 font-medium">{{ job.salaryRange || '面议' }}</p></div>
              <div><p class="text-gray-400">薪资构成</p><p class="text-gray-800 font-medium">{{ job.salaryComposition || '暂无' }}</p></div>
              <div><p class="text-gray-400">福利待遇</p><p class="text-gray-800 font-medium">{{ job.benefits || '暂无' }}</p></div>
              <div><p class="text-gray-400">笔试内容</p><p class="text-gray-800 font-medium">{{ job.examContent || '暂无' }}</p></div>
              <div><p class="text-gray-400">面试形式</p><p class="text-gray-800 font-medium">{{ job.interviewForm || '暂无' }}</p></div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">报名时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}</p></div>
              <div><p class="text-gray-400">考试时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.examTime) }}</p></div>
              <div><p class="text-gray-400">报名链接</p>
                <a v-if="job.applyLink" :href="job.applyLink" target="_blank" class="text-orange-500 hover:text-orange-600 font-medium">点击报名 →</a>
                <span v-else class="text-gray-800 font-medium">暂无</span>
              </div>
              <div><p class="text-gray-400">报名方式</p><p class="text-gray-800 font-medium">{{ job.applyMethod || '暂无' }}</p></div>
              <div><p class="text-gray-400">联系电话</p><p class="text-gray-800 font-medium">{{ job.contactPhone || '暂无' }}</p></div>
              <div><p class="text-gray-400">现场报名地址</p><p class="text-gray-800 font-medium">{{ job.contactAddress || '暂无' }}</p></div>
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
