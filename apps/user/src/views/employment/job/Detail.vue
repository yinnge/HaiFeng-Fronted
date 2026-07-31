<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getJobDetail } from '@/api/employment/jobIndex'
import type { JobIndexDetailVO } from '@/types/employment/jobIndex'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<JobIndexDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getJobDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/jobs')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无'
  return dateStr.slice(0, 10)
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '薪资面议'
  if (min != null && max != null) return `${min}k-${max}k/月`
  if (min != null) return `${min}k起/月`
  return `最高${max}k/月`
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
                {{ job.categoryLabel }}
              </span>
              <span
                class="rounded-full px-3 py-1 text-sm font-medium"
                :class="job.positionStatus === '招聘中'
                  ? 'bg-green-50 text-green-600'
                  : job.positionStatus === '即将开始'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'"
              >
                {{ job.positionStatus }}
              </span>
              <span v-if="job.isHot" class="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-500">
                🔥 热门
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.organizationName }}</p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资</p>
                <p class="font-semibold text-gray-800">{{ formatSalary(job.salaryMin, job.salaryMax) }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招录人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount ?? '未知' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘类型</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentType }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">报名截止</p>
                <p class="font-semibold text-gray-800">{{ formatDate(job.regDeadline) }}</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="flex items-center justify-around text-center">
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.viewCount ?? 0 }}</p>
                <p class="text-sm text-gray-400">浏览量</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.applyCount ?? 0 }}</p>
                <p class="text-sm text-gray-400">报名人数</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.recruitmentCount ?? '—' }}</p>
                <p class="text-sm text-gray-400">招录人数</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">发布日期</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.publishDate) }}</p>
              </div>
              <div>
                <p class="text-gray-400">报名截止</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.regDeadline) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && !job" class="py-20 text-center text-gray-400">
          岗位不存在
        </div>
      </div>
    </main>
  </div>
</template>
