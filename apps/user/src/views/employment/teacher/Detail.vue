<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getTeacherDetail } from '@/api/employment/teacher'
import type { TeacherPositionDetailVO } from '@/types/employment/teacher'

const route = useRoute()
const router = useRouter()
const jobId = route.params.id as string

const loading = ref(false)
const job = ref<TeacherPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getTeacherDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/teacher')
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
    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                教师招聘
              </span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.schoolName }}<span v-if="job.supervisingDept"> · {{ job.supervisingDept }}</span></p>

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
                <p class="text-gray-400 mb-1">招聘类型</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentType }}</p>
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
              <div><p class="text-gray-400">学校类型</p><p class="text-gray-800 font-medium">{{ job.schoolType }}</p></div>
              <div><p class="text-gray-400">学校性质</p><p class="text-gray-800 font-medium">{{ job.schoolNature }}</p></div>
              <div><p class="text-gray-400">学科</p><p class="text-gray-800 font-medium">{{ job.subject }}</p></div>
              <div><p class="text-gray-400">专业要求</p><p class="text-gray-800 font-medium">{{ job.majorRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">学位要求</p><p class="text-gray-800 font-medium">{{ job.degreeRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">教学经验</p><p class="text-gray-800 font-medium">{{ job.workExperience || '不限' }}</p></div>
              <div><p class="text-gray-400">教师资格证</p><p class="text-gray-800 font-medium">{{ job.teacherCertRequirement || '暂无' }}</p></div>
              <div><p class="text-gray-400">资格证学科</p><p class="text-gray-800 font-medium">{{ job.teacherCertSubject || '不限' }}</p></div>
              <div><p class="text-gray-400">普通话要求</p><p class="text-gray-800 font-medium">{{ job.putonghuaLevel || '不限' }}</p></div>
              <div><p class="text-gray-400">师范要求</p><p class="text-gray-800 font-medium">{{ job.isNormalMajor || '不限' }}</p></div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">待遇与考试</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">薪资待遇</p><p class="text-gray-800 font-medium">{{ job.salaryRange || '面议' }}</p></div>
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
              <div><p class="text-gray-400">联系电话</p><p class="text-gray-800 font-medium">{{ job.contactPhone || '暂无' }}</p></div>
              <div><p class="text-gray-400">报名链接</p>
                <a v-if="job.applyLink" :href="job.applyLink" target="_blank" class="text-orange-500 hover:text-orange-600 font-medium">点击报名 →</a>
                <span v-else class="text-gray-800 font-medium">暂无</span>
              </div>
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
  </div>
</template>
