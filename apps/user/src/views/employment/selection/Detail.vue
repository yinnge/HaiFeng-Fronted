<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSelectionDetail } from '@/api/employment/selection'
import type { SelectionPositionDetailVO } from '@/types/employment/selection'
import { SelectionStatusTag } from '@/types/employment/selection'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<SelectionPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getSelectionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取岗位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/selection') }

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '待定'
  return dateStr.slice(0, 16).replace('T', ' ')
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回选调生岗位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{{ detail.selectionType }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="
              SelectionStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' :
              SelectionStatusTag[detail.positionStatus] === 'primary' ? 'bg-blue-50 text-blue-600' :
              SelectionStatusTag[detail.positionStatus] === 'warning' ? 'bg-orange-50 text-orange-600' :
              'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.organizingDept }}<span v-if="detail.targetUnit"> · {{ detail.targetUnit }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招录人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">年龄上限：</span><span class="text-gray-700">{{ detail.ageLimit ? `${detail.ageLimit}岁` : '不限' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">政治面貌：</span><span class="text-gray-700">{{ detail.politicalStatus || '不限' }}</span></div>
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '不限' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">选调类型：</span><span class="text-gray-700">{{ detail.selectionType || '-' }}</span></div>
            <div><span class="text-gray-400">年份：</span><span class="text-gray-700">{{ detail.year || '-' }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province || '-' }}</span></div>
            <div><span class="text-gray-400">培养方向：</span><span class="text-gray-700">{{ detail.trainingDirection || '-' }}</span></div>
            <div><span class="text-gray-400">院校要求：</span><span class="text-gray-700">{{ detail.universityRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">学生干部要求：</span><span class="text-gray-700">{{ detail.studentCadreRequirement || '无要求' }}</span></div>
            <div><span class="text-gray-400">奖励荣誉要求：</span><span class="text-gray-700">{{ detail.awardsRequirement || '无要求' }}</span></div>
            <div><span class="text-gray-400">基层服务年限：</span><span class="text-gray-700">{{ detail.grassrootsServiceYears || '-' }}</span></div>
          </div>
          <p v-if="detail.trainingPlan" class="mt-4 text-sm text-gray-600 leading-relaxed">培养计划：{{ detail.trainingPlan }}</p>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考试与面试</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">考试科目：</span><span class="text-gray-700">{{ detail.examSubjects || '-' }}</span></div>
            <div><span class="text-gray-400">面试形式：</span><span class="text-gray-700">{{ detail.interviewForm || '-' }}</span></div>
            <div v-if="detail.examTime"><span class="text-gray-400">考试时间：</span><span class="text-gray-700">{{ formatDate(detail.examTime) }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名开始：</span><span class="text-gray-700">{{ formatDate(detail.regStartDate) }}</span></div>
            <div><span class="text-gray-400">报名结束：</span><span class="text-gray-700">{{ formatDate(detail.regEndDate) }}</span></div>
            <div><span class="text-gray-400">联系电话：</span><span class="text-gray-700">{{ detail.contactPhone || '-' }}</span></div>
          </div>
          <div class="mt-4 flex flex-wrap gap-4 text-sm">
            <a v-if="detail.applyLink" :href="detail.applyLink" target="_blank" class="text-orange-500 hover:underline">报名链接</a>
            <a v-if="detail.officialLink" :href="detail.officialLink" target="_blank" class="text-orange-500 hover:underline">官方公告</a>
          </div>
        </div>

        <div v-if="detail.targetUniversities && detail.targetUniversities.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">目标院校</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="uni in detail.targetUniversities" :key="uni" type="primary" size="medium">{{ uni }}</el-tag>
          </div>
        </div>

        <div v-if="detail.majorCategories && detail.majorCategories.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业类别</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="cat in detail.majorCategories" :key="cat" type="success" size="medium">{{ cat }}</el-tag>
          </div>
        </div>

        <div v-if="detail.content" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细内容</h3>
          <div class="text-sm text-gray-600 leading-relaxed" v-html="detail.content"></div>
        </div>

        <p v-if="detail.remark" class="mt-4 text-sm text-gray-500">备注：{{ detail.remark }}</p>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到岗位信息</div>
    </main>
  </div>
</template>
