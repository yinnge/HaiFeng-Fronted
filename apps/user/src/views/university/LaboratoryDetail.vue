<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLaboratoryDetail } from '@/api/university/laboratory'
import type { LaboratoryDetailVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<LaboratoryDetailVO | null>(null)

async function fetchDetail() {
  const labId = Number(route.params.labId)
  if (!labId) {
    ElMessage.error('实验室ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getLaboratoryDetail(labId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取实验室详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.back()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回院校详情</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.labType }} - {{ detail.universityName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.labType }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">所属院校：</span><span class="text-gray-700">{{ detail.universityName }}</span></div>
            <div><span class="text-gray-400">成立时间：</span><span class="text-gray-700">{{ detail.establishedYear || '-' }}</span></div>
            <div><span class="text-gray-400">所在地区：</span><span class="text-gray-700">{{ detail.region || '-' }}</span></div>
            <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700">{{ detail.department || '-' }}</span></div>
            <div><span class="text-gray-400">实验室主任：</span><span class="text-gray-700">{{ detail.director || '-' }}</span></div>
            <div><span class="text-gray-400">人员规模：</span><span class="text-gray-700">{{ detail.staffCount || '-' }}</span></div>
            <div><span class="text-gray-400">学生规模：</span><span class="text-gray-700">{{ detail.studentCount || '-' }}</span></div>
            <div><span class="text-gray-400">联系邮箱：</span><span class="text-gray-700">{{ detail.email || '-' }}</span></div>
            <div><span class="text-gray-400">联系电话：</span><span class="text-gray-700">{{ detail.phone || '-' }}</span></div>
          </div>
        </section>

        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 space-y-4">
          <div v-if="detail.introduction">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室简介</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction }}</p>
          </div>
          <div v-if="detail.researchDescription">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究方向描述</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.researchDescription }}</p>
          </div>
          <div v-if="detail.labSpace">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室空间</h3>
            <p class="text-gray-600">{{ detail.labSpace }}</p>
          </div>
          <div v-if="detail.researchFields?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究领域</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="field in detail.researchFields" :key="field" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">{{ field }}</span>
            </div>
          </div>
          <div v-if="detail.majorEquipment?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">主要设备</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="eq in detail.majorEquipment" :key="eq" class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{{ eq }}</span>
            </div>
          </div>
          <div v-if="detail.openTopics">
            <h3 class="text-lg font-bold text-gray-800 mb-2">开放课题</h3>
            <p class="text-gray-600">{{ detail.openTopics }}</p>
          </div>
          <div v-if="detail.cooperation">
            <h3 class="text-lg font-bold text-gray-800 mb-2">合作交流</h3>
            <p class="text-gray-600">{{ detail.cooperation }}</p>
          </div>
          <div v-if="detail.visitingScholars">
            <h3 class="text-lg font-bold text-gray-800 mb-2">访问学者</h3>
            <p class="text-gray-600">{{ detail.visitingScholars }}</p>
          </div>
        </section>

        <section v-if="detail.coreTeam?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">核心团队</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">姓名</th>
                  <th class="text-left py-2 px-3">职务</th>
                  <th class="text-left py-2 px-3">岗位角色</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, idx) in detail.coreTeam" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800 font-medium">{{ member.memberName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.position || '-' }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.role || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="detail.statistics?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">统计数据</h3>
          <div class="flex flex-wrap gap-4">
            <div v-for="(stat, idx) in detail.statistics" :key="idx" class="rounded-xl bg-orange-50 px-5 py-3 text-center flex-1 min-w-[120px]">
              <div class="text-2xl font-bold text-orange-600">{{ stat.count }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
