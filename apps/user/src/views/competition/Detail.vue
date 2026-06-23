<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import SiteFooter from '@/components/SiteFooter.vue'
import { getCompetitionDetail, getCompetitionMajors } from '@/api/certificate'
import type { CompetitionDetailVO, CompetitionMajorBriefVO } from '@/types/certificate'
import { useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<CompetitionDetailVO | null>(null)
const error = ref('')

const majors = ref<CompetitionMajorBriefVO[]>([])
const majorsTotal = ref(0)
const majorsPage = ref(1)
const majorsPageSize = ref(10)
const majorsLoading = ref(false)

const isPro = computed(() => {
  const mt = userStore.userInfo?.memberType
  return mt === 'pro' || mt === 'vip'
})

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = '竞赛ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getCompetitionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '获取竞赛详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchMajors() {
  const id = Number(route.params.id)
  if (!id || !isPro.value) return
  majorsLoading.value = true
  try {
    const res = await getCompetitionMajors(id, { page: majorsPage.value, size: majorsPageSize.value })
    majors.value = res.data.data.records
    majorsTotal.value = res.data.data.total
  } catch {
    // Pro check may fail with 403; silently handle
  } finally {
    majorsLoading.value = false
  }
}

function onMajorsPageChange(page: number) {
  majorsPage.value = page
  fetchMajors()
}

function goMajorDetail(majorId: number) {
  router.push(`/major/${majorId}`)
}

onMounted(() => {
  fetchDetail()
  fetchMajors()
})
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">竞赛详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Basic Info -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">基本信息</h2>
            <div v-if="detail.basicInfo" class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div v-for="(val, key) in detail.basicInfo" :key="key">
                <span class="text-gray-400">{{ key }}：</span>
                <span v-if="key === 'officialWebsite' || String(key).includes('website') || String(key).includes('Website')">
                  <a :href="String(val)" target="_blank" class="text-orange-500 hover:underline">{{ val }}</a>
                </span>
                <span v-else class="text-gray-700">{{ val }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400">暂无基本信息</div>
          </section>
        </Motion>

        <!-- Background -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }" class="mb-6" v-if="detail.background">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">赛事背景</h3>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.background }}</p>
          </section>
        </Motion>

        <!-- Purposes -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" class="mb-6" v-if="detail.purposes?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">赛事宗旨</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="item in detail.purposes" :key="item" class="rounded-lg bg-orange-50 px-3 py-1.5 text-sm text-orange-700">
                {{ item }}
              </span>
            </div>
          </section>
        </Motion>

        <!-- Awards -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }" class="mb-6" v-if="detail.awards?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">奖项设置</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="item in detail.awards" :key="item" class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                {{ item }}
              </span>
            </div>
          </section>
        </Motion>

        <!-- Competition Rules -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }" class="mb-6" v-if="detail.competitionRules?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">竞赛规则</h3>
            <div class="space-y-3">
              <div v-for="(rule, idx) in detail.competitionRules" :key="idx" class="rounded-xl bg-gray-50 p-4">
                <h4 class="font-semibold text-gray-800 text-sm mb-1">{{ rule.title }}</h4>
                <p class="text-sm text-gray-600">{{ rule.content }}</p>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Scoring Criteria -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }" class="mb-6" v-if="detail.scoringCriteria?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">评分标准</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li v-for="item in detail.scoringCriteria" :key="item">{{ item }}</li>
            </ul>
          </section>
        </Motion>

        <!-- Notices -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.3 }" class="mb-6" v-if="detail.notices?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">注意事项</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li v-for="item in detail.notices" :key="item">{{ item }}</li>
            </ul>
          </section>
        </Motion>

        <!-- Process Guide -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.35 }" class="mb-6" v-if="detail.processGuide?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">参赛流程</h3>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-200"></div>
              <div class="space-y-6 relative">
                <div v-for="(step, idx) in detail.processGuide" :key="idx" class="flex gap-4 pl-2">
                  <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shrink-0">
                    {{ step.step }}
                  </div>
                  <div class="pt-1">
                    <p class="text-sm text-gray-700">{{ step.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Awards Display -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.4 }" class="mb-6" v-if="detail.awardsDisplay?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">奖项展示</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-gray-500">
                    <th class="pb-2 pr-4 font-medium">奖项级别</th>
                    <th class="pb-2 font-medium">名额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in detail.awardsDisplay" :key="idx" class="border-b border-gray-50">
                    <td class="py-2 pr-4 text-gray-800 font-medium">{{ item.level }}</td>
                    <td class="py-2 text-gray-600">{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </Motion>

        <!-- Related Majors (Pro) -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.45 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">关联专业</h3>
            <template v-if="isPro">
              <div v-loading="majorsLoading" class="min-h-[100px]">
                <div v-if="majors.length" class="flex flex-wrap gap-3">
                  <button
                    v-for="m in majors" :key="m.majorId"
                    class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
                    @click="goMajorDetail(m.majorId)"
                  >
                    {{ m.majorName }}
                  </button>
                </div>
                <div v-else-if="!majorsLoading" class="text-sm text-gray-400">暂无关联专业数据</div>
              </div>
              <div v-if="majorsTotal > majorsPageSize" class="mt-4 flex justify-center">
                <el-pagination
                  background small layout="prev, pager, next"
                  :total="majorsTotal" :page-size="majorsPageSize"
                  :current-page="majorsPage"
                  @current-change="onMajorsPageChange"
                />
              </div>
            </template>
            <template v-else>
              <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
                <div class="text-4xl mb-3">🔒</div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看关联专业</h4>
                <p class="text-gray-500 mb-4">了解该竞赛适合哪些本科专业报考</p>
                <button
                  class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
                  @click="router.push('/profile')"
                >
                  立即升级
                </button>
              </div>
            </template>
          </section>
        </Motion>
      </template>

      <template v-if="error && !loading">
        <div class="py-20 text-center">
          <svg class="inline-block w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-400">{{ error }}</p>
          <button class="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium"
            @click="router.back()"
          >返回</button>
        </div>
      </template>
    </main>

    <SiteFooter />
  </div>
</template>
