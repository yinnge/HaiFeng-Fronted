<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInstitutionDetail } from '@/api/employment/institution'
import type { InstitutionPositionDetailVO } from '@/types/employment/institution'
import { InstitutionStatusTag, InstitutionTagType, InstitutionTagLabel } from '@/types/employment/institution'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<InstitutionPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getInstitutionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取职位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/institution') }
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
        返回事业编职位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">{{ detail.positionType || '事业编' }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="InstitutionStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
            <span v-if="detail.positionTag && InstitutionTagType[detail.positionTag]" class="rounded-full px-3 py-1 text-xs font-medium" :class="detail.positionTag === '热门' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'">{{ InstitutionTagLabel[detail.positionTag] }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.supervisingDept }}<span v-if="detail.institution"> · {{ detail.institution }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招聘人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">薪资范围：</span><span class="text-gray-700">{{ detail.salaryRange || '面议' }}</span></div>
            <div><span class="text-gray-400">年龄上限：</span><span class="text-gray-700">{{ detail.ageLimit ? `${detail.ageLimit}岁` : '不限' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">考试类别：</span><span class="text-gray-700">{{ detail.examCategory || '-' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">职位子类：</span><span class="text-gray-700">{{ detail.subCategory || '-' }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province || '-' }}</span></div>
            <div><span class="text-gray-400">特殊岗位：</span><span class="text-gray-700">{{ detail.specialPosition || '-' }}</span></div>
            <div><span class="text-gray-400">其他要求：</span><span class="text-gray-700">{{ detail.otherRequirement || '-' }}</span></div>
          </div>
          <p v-if="detail.otherRequirementDesc" class="mt-4 text-sm text-gray-600">{{ detail.otherRequirementDesc }}</p>
          <div v-if="detail.majorRequirements && detail.majorRequirements.length > 0" class="mt-4">
            <span class="text-sm text-gray-400">专业要求：</span>
            <div class="flex flex-wrap gap-2 mt-2">
              <el-tag v-for="m in detail.majorRequirements" :key="m" type="primary" size="small">{{ m }}</el-tag>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">联系与备注</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名截止：</span><span class="text-gray-700">{{ formatDate(detail.regDeadline) }}</span></div>
            <div><span class="text-gray-400">咨询电话：</span><span class="text-gray-700">{{ detail.consultationPhone || '-' }}</span></div>
            <div><span class="text-gray-400">监督电话：</span><span class="text-gray-700">{{ detail.supervisionPhone || '-' }}</span></div>
            <div><span class="text-gray-400">备注类型：</span><span class="text-gray-700">{{ detail.remarkType || '-' }}</span></div>
          </div>
          <p v-if="detail.remarkDesc" class="mt-4 text-sm text-gray-600 leading-relaxed">备注说明：{{ detail.remarkDesc }}</p>
          <p v-if="detail.tagText" class="mt-2 text-sm text-gray-600">{{ detail.tagText }}</p>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到职位信息</div>
    </main>
  </div>
</template>
