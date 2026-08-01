<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getGradeStats, getSubjectEvaluationPage } from '@/api/university/subject-evaluation'
import type { GradeStatVO, SubjectEvaluationVO } from '@/types/university/subject-evaluation'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: string }>()

const loading = ref(false)
const stats = ref<GradeStatVO[]>([])
const list = ref<SubjectEvaluationVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeGrade = ref('')

const sortedGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-']

const activeGradeStats = computed(() => {
  return stats.value.find(s => s.grade === activeGrade.value)
})

async function fetchStats() {
  try {
    const res = await getGradeStats(props.universityId)
    stats.value = res.data.data
    const firstNonZero = stats.value.find(s => s.count > 0)
    if (firstNonZero) {
      activeGrade.value = firstNonZero.grade
    }
  } catch {
    ElMessage.error('获取等级统计失败')
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getSubjectEvaluationPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取学科评估列表失败')
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  if (!activeGrade.value) return list.value
  return list.value.filter(item => item.evaluationGrade === activeGrade.value)
})

function selectGrade(grade: string) {
  activeGrade.value = grade
  page.value = 1
}

function onPageChange(p: number) {
  page.value = p
}

onMounted(() => {
  fetchStats()
  fetchList()
})
</script>

<template>
  <div>
    <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
      <button
        v-for="grade in sortedGrades" :key="grade"
        class="rounded-xl p-3 text-center transition-all border cursor-pointer"
        :class="activeGrade === grade
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'"
        @click="selectGrade(grade)"
      >
        <div class="text-lg font-bold">{{ grade }}</div>
        <div class="text-xs mt-0.5" :class="activeGrade === grade ? 'text-white/80' : 'text-gray-400'">{{ (stats.find(s => s.grade === grade)?.count ?? 0) + ' 个' }}</div>
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="filteredList.length" class="space-y-3">
        <div
          v-for="item in filteredList" :key="item.disciplineCode"
          class="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <span class="font-medium text-gray-800">{{ item.disciplineName }}</span>
            <span class="ml-2 text-xs text-gray-400">{{ item.disciplineCode }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400">{{ item.evaluationRound }}</span>
            <span
              class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="
                ['A+', 'A', 'A-'].includes(item.evaluationGrade)
                  ? 'bg-red-50 text-red-600'
                  : ['B+', 'B', 'B-'].includes(item.evaluationGrade)
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-50 text-gray-500'
              "
            >{{ item.evaluationGrade }}</span>
          </div>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">{{ activeGrade ? `暂无 ${activeGrade} 等级学科数据` : '暂无学科评估数据' }}</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
