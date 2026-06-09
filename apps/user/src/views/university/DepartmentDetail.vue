<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDepartmentReport } from '@/api/university/department'
import type { DepartmentReportVO } from '@/types/university/department'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const report = ref<DepartmentReportVO | null>(null)

async function fetchReport() {
  const deptId = Number(route.params.deptId)
  if (!deptId) {
    ElMessage.error('院系ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getDepartmentReport(deptId)
    report.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院系分析报告失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)

function formatMoney(value: number) {
  return value.toFixed(1)
}
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">院系就业分析报告</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="report">
        <p v-if="report.subtitle" class="text-center text-gray-500 mb-6">{{ report.subtitle }}</p>

        <!-- 院系概述 -->
        <section v-if="report.overview" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">院系概述</h3>
          <h4 v-if="report.overview.title" class="text-gray-700 font-medium mb-2">{{ report.overview.title }}</h4>
          <ul v-if="report.overview.descriptions?.length" class="list-disc list-inside text-gray-600 space-y-1">
            <li v-for="(desc, idx) in report.overview.descriptions" :key="idx">{{ desc }}</li>
          </ul>
        </section>

        <!-- 专业组成 -->
        <section v-if="report.majorCompose?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业组成</h3>
          <div class="space-y-3">
            <div v-for="(item, idx) in report.majorCompose" :key="idx">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700">{{ item.subjectName }}</span>
                <span class="text-gray-500">{{ item.percentage }}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 专业详情 -->
        <section v-if="report.subjectsDetail?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业详情</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(major, idx) in report.subjectsDetail" :key="idx" class="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <h4 class="font-semibold text-gray-800 mb-2">{{ major.majorName }}</h4>
              <div v-if="major.tags?.length" class="flex flex-wrap gap-1 mb-2">
                <span v-for="tag in major.tags" :key="tag" class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ tag }}</span>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p v-if="major.coreSubject"><span class="text-gray-400">核心学科：</span>{{ major.coreSubject }}</p>
                <p v-if="major.supportSubject"><span class="text-gray-400">支撑学科：</span>{{ major.supportSubject }}</p>
                <p v-if="major.positioning" class="text-gray-600 mt-1">{{ major.positioning }}</p>
                <div v-if="major.coreCourses?.length" class="mt-1">
                  <span class="text-gray-400">核心课程：</span>
                  <span v-for="(c, ci) in major.coreCourses" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                </div>
                <div v-if="major.abilities?.length" class="mt-1">
                  <span class="text-gray-400">培养能力：</span>
                  <span v-for="(a, ai) in major.abilities" :key="ai" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ a }}</span>
                </div>
                <div v-if="major.certificates?.length" class="mt-1">
                  <span class="text-gray-400">推荐证书：</span>
                  <span v-for="(c, ci) in major.certificates" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 城市薪资 -->
        <section v-if="report.citySalary?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">城市薪资分布</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div v-for="(item, idx) in report.citySalary" :key="idx" class="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
              <div class="font-medium text-gray-800">{{ item.cityName }}</div>
              <div class="text-sm text-orange-600 font-semibold mt-1">{{ formatMoney(item.minSalary) }} - {{ formatMoney(item.maxSalary) }} 万元/年</div>
            </div>
          </div>
        </section>

        <!-- 专业薪资 -->
        <section v-if="report.salary?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业薪资</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">专业名称</th>
                  <th class="text-left py-2 px-3">最低薪资（万元/年）</th>
                  <th class="text-left py-2 px-3">最高薪资（万元/年）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in report.salary" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800">{{ item.majorName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.minSalary) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.maxSalary) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 就业前景 -->
        <section v-if="report.prospects" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">就业前景</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="rounded-xl bg-green-50 p-3 text-center">
              <div class="text-sm text-gray-500">综合就业率</div>
              <div class="text-lg font-bold text-green-600">{{ report.prospects.employmentRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-blue-50 p-3 text-center">
              <div class="text-sm text-gray-500">硕士平均起薪</div>
              <div class="text-lg font-bold text-blue-600">{{ report.prospects.masterSalary || '-' }}</div>
            </div>
            <div class="rounded-xl bg-purple-50 p-3 text-center">
              <div class="text-sm text-gray-500">继续深造率</div>
              <div class="text-lg font-bold text-purple-600">{{ report.prospects.furtherStudyRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-amber-50 p-3 text-center">
              <div class="text-sm text-gray-500">世界500强</div>
              <div class="text-lg font-bold text-amber-600">{{ report.prospects.fortune500Rate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-rose-50 p-3 text-center">
              <div class="text-sm text-gray-500">年薪增长率</div>
              <div class="text-lg font-bold text-rose-600">{{ report.prospects.salaryGrowthRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-teal-50 p-3 text-center">
              <div class="text-sm text-gray-500">海外深造占比</div>
              <div class="text-lg font-bold text-teal-600">{{ report.prospects.overseasRate || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- 就业趋势 -->
        <section v-if="report.trends" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">就业趋势</h3>
          <div class="space-y-3">
            <div v-if="report.trends.highGrowthTracks?.length">
              <span class="text-sm text-gray-400">高速增长赛道：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="t in report.trends.highGrowthTracks" :key="t" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">{{ t }}</span>
              </div>
            </div>
            <div v-if="report.trends.policyOrientations?.length">
              <span class="text-sm text-gray-400">核心政策导向：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="p in report.trends.policyOrientations" :key="p" class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">{{ p }}</span>
              </div>
            </div>
            <div v-if="report.trends.environmentAnalysis?.length">
              <span class="text-sm text-gray-400">就业环境分析：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="e in report.trends.environmentAnalysis" :key="e" class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{{ e }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 考研方向 -->
        <section v-if="report.postgraduate" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考研方向</h3>
          <h4 v-if="report.postgraduate.title" class="text-gray-700 font-medium mb-2">{{ report.postgraduate.title }}</h4>
          <div v-if="report.postgraduate.directions?.length" class="flex flex-wrap gap-2">
            <span v-for="(d, idx) in report.postgraduate.directions" :key="idx" class="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600">{{ d }}</span>
          </div>
        </section>

        <!-- 职业路径 -->
        <section v-if="report.career?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">职业路径</h3>
          <div class="space-y-4">
            <div v-for="(path, idx) in report.career" :key="idx" class="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <h4 class="font-semibold text-gray-800 mb-1">{{ path.pathTitle }}</h4>
              <p v-if="path.pathDesc" class="text-sm text-gray-500 mb-3">{{ path.pathDesc }}</p>
              <div class="space-y-2">
                <div v-for="(stage, si) in path.stages" :key="si" class="flex items-center gap-3 text-sm bg-white rounded-lg p-3 border border-gray-100">
                  <span class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 font-medium">{{ stage.stageTitle }}</span>
                  <span class="text-gray-400">{{ stage.workYears }}</span>
                  <span class="text-gray-700 font-medium">{{ stage.position }}</span>
                  <span v-if="stage.salaryRange" class="ml-auto text-orange-600 font-medium">{{ stage.salaryRange }} 万</span>
                </div>
              </div>
              <p v-if="path.stages[0]?.coreGoal" class="mt-2 text-xs text-gray-400">核心目标：{{ path.stages[0].coreGoal }}</p>
            </div>
          </div>
        </section>

        <!-- 免责声明 -->
        <section v-if="report.disclaimer" class="mb-6 rounded-2xl bg-gray-50 p-6 border border-gray-200">
          <p v-if="report.disclaimer.text" class="text-xs text-gray-400 leading-relaxed">{{ report.disclaimer.text }}</p>
          <div class="flex gap-4 mt-2 text-xs text-gray-400">
            <span v-if="report.disclaimer.version">版本：{{ report.disclaimer.version }}</span>
            <span v-if="report.disclaimer.updateTime">更新：{{ report.disclaimer.updateTime }}</span>
            <span v-if="report.disclaimer.compileUnit">编制：{{ report.disclaimer.compileUnit }}</span>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
