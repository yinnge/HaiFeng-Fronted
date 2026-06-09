<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMajorDetail } from '@/api/major'
import type { MajorDetailVO } from '@/types/major'
import { Motion } from 'motion-v'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<MajorDetailVO | null>(null)
const error = ref('')

const malePercent = computed(() => detail.value?.maleRatio ?? 0)
const femalePercent = computed(() => detail.value?.femaleRatio ?? 0)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = '专业ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getMajorDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取专业详情失败'
    error.value = msg
    ElMessage.error(msg)
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
          <span class="font-medium">返回</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.majorName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Basic Info Card -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ detail.majorName }}</h2>
                <p class="text-gray-400 mt-1 font-mono">{{ detail.majorCode }}</p>
              </div>
              <span v-if="detail.majorTags" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.majorTags }}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span class="text-gray-400">门类：</span><span class="text-gray-700">{{ detail.parentCategory }}</span></div>
              <div><span class="text-gray-400">类别：</span><span class="text-gray-700">{{ detail.majorCategory }}</span></div>
              <div><span class="text-gray-400">学科：</span><span class="text-gray-700">{{ detail.disciplineName }}</span></div>
              <div><span class="text-gray-400">授予学位：</span><span class="text-gray-700">{{ detail.degreeAwarded }}</span></div>
            </div>
          </section>
        </Motion>

        <!-- Employment Data Card -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">就业数据</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="rounded-xl bg-green-50 p-4 text-center">
                <div class="text-2xl font-bold text-green-600">{{ detail.employmentRate ? `${detail.employmentRate.toFixed(1)}%` : '-' }}</div>
                <div class="text-gray-500 mt-1">就业率</div>
              </div>
              <div class="rounded-xl bg-blue-50 p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ detail.salaryMin ? `${detail.salaryMin.toLocaleString()}-${detail.salaryMax?.toLocaleString()}` : '-' }}</div>
                <div class="text-gray-500 mt-1">薪资范围（元/月）</div>
              </div>
              <div class="rounded-xl bg-purple-50 p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">{{ detail.courseCount ?? '-' }}</div>
                <div class="text-gray-500 mt-1">开设课程</div>
              </div>
              <div class="rounded-xl bg-amber-50 p-4 text-center">
                <div class="text-2xl font-bold text-amber-600">{{ detail.graduateScale || '-' }}</div>
                <div class="text-gray-500 mt-1">毕业规模</div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Gender Ratio -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">男女比例</h3>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-blue-600 font-medium">男生 {{ malePercent }}%</span>
                  <span class="text-pink-600 font-medium">女生 {{ femalePercent }}%</span>
                </div>
                <div class="h-4 rounded-full bg-gray-100 overflow-hidden flex">
                  <div class="bg-blue-500 transition-all duration-500" :style="{ width: `${malePercent}%` }"></div>
                  <div class="bg-pink-400 transition-all duration-500" :style="{ width: `${femalePercent}%` }"></div>
                </div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Introduction -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">专业介绍</h3>
            <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div v-if="detail.majorDescription">
                <h4 class="font-semibold text-gray-800 mb-1">专业描述</h4>
                <p>{{ detail.majorDescription }}</p>
              </div>
              <div v-if="detail.trainingObjective">
                <h4 class="font-semibold text-gray-800 mb-1">培养目标</h4>
                <p>{{ detail.trainingObjective }}</p>
              </div>
              <div v-if="detail.trainingRequirement">
                <h4 class="font-semibold text-gray-800 mb-1">培养要求</h4>
                <p>{{ detail.trainingRequirement }}</p>
              </div>
              <div v-if="detail.subjectRequirement">
                <h4 class="font-semibold text-gray-800 mb-1">选科要求</h4>
                <p>{{ detail.subjectRequirement }}</p>
              </div>
              <div v-if="detail.careerProspect">
                <h4 class="font-semibold text-gray-800 mb-1">就业前景</h4>
                <p>{{ detail.careerProspect }}</p>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Courses & Skills -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div v-if="detail.mainCourses?.length" class="mb-6">
              <h3 class="mb-3 text-lg font-bold text-gray-800">主要课程</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="course in detail.mainCourses" :key="course"
                  class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >{{ course }}</span>
              </div>
            </div>
            <div v-if="detail.knowledgeSkills?.length">
              <h3 class="mb-3 text-lg font-bold text-gray-800">知识技能</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in detail.knowledgeSkills" :key="skill"
                  class="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700"
                >{{ skill }}</span>
              </div>
            </div>
          </section>
        </Motion>
      </template>

      <template v-if="error && !loading">
        <div class="py-20 text-center">
          <div class="text-5xl mb-4">📭</div>
          <p class="text-gray-400">{{ error }}</p>
          <button class="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium"
            @click="router.back()"
          >返回</button>
        </div>
      </template>
    </main>
  </div>
</template>
