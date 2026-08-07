<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMilitaryDetail } from '@/api/employment/military'
import type { MilitaryPositionDetailVO } from '@/types/employment/military'
import { MilitaryStatusTag } from '@/types/employment/military'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<MilitaryPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = route.params.id as string
    const res = await getMilitaryDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取岗位详情失败')
    router.push('/employment/military')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/military') }
onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回军队文职岗位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">{{ detail.positionType || '军队文职' }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="MilitaryStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.employerUnit }}<span v-if="detail.department"> · {{ detail.department }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">薪资范围：</span><span class="text-gray-700">{{ detail.salaryRange || '面议' }}</span></div>
            <div><span class="text-gray-400">报名截止：</span><span class="text-gray-700">{{ detail.regDeadline || '待定' }}</span></div>
          </div>
        </div>

        <div v-if="detail.positionDescription" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">岗位描述</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ detail.positionDescription }}</p>
        </div>

        <div v-if="detail.responsibilities && detail.responsibilities.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">岗位职责</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="item in detail.responsibilities" :key="item" type="success" size="medium">{{ item }}</el-tag>
          </div>
        </div>

        <div v-if="detail.qualifications && detail.qualifications.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">任职资格</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="item in detail.qualifications" :key="item" type="warning" size="medium">{{ item }}</el-tag>
          </div>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到岗位信息</div>
    </main>
  </div>
</template>
