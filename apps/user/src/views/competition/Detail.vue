<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
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
  const id = route.params.id as string
  if (!id) {
    error.value = '竞赛ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getCompetitionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    error.value = e?.message || '获取竞赛详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchMajors() {
  const id = route.params.id as string
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

function goMajorDetail(majorId: string) {
  router.push(`/major/${majorId}`)
}

onMounted(() => {
  fetchDetail()
  fetchMajors()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero Header -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 shadow-lg shadow-orange-200/60">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 text-white border border-white/30">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v18l3-3 4 3 4-3 3 3V3a2 2 0 00-2-2H7a2 2 0 00-2 2zm7 11v2m0-6v1"/></svg>
              </span>
              <div>
                <h2 class="text-2xl font-bold text-white">{{ detail.compName || '竞赛详情 · 赛事档案' }}</h2>
                <p class="text-orange-50 mt-0.5 text-sm">{{ detail.compLevel ? `竞赛级别 · ${detail.compLevel}` : '赛事背景、规则、流程与奖项一览' }}</p>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Two-column content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Left column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Overview: Background & Purposes -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }" v-if="detail.background || detail.purposes?.length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  赛事概况
                </div>
                <div v-if="detail.background">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    赛事背景
                  </h4>
                  <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.background }}</p>
                </div>
                <div v-if="detail.purposes?.length" class="mt-5">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 13V9a4 4 0 118 0v4m-9 0h10a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z"/></svg>
                    赛事宗旨
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="item in detail.purposes" :key="item" class="rounded-full bg-orange-50 px-3 py-1.5 text-sm text-orange-700 ring-1 ring-inset ring-orange-200">{{ item }}</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Competition Rules -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" v-if="detail.competitionRules?.length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                  竞赛规则
                </div>
                <div class="space-y-3">
                  <div v-for="(rule, idx) in detail.competitionRules" :key="idx" class="rounded-xl bg-white p-4 shadow-sm border border-orange-100">
                    <h4 class="font-semibold text-gray-800 text-sm mb-1">{{ rule.title }}</h4>
                    <p class="text-sm text-gray-600">{{ rule.content }}</p>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Process Guide -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }" v-if="detail.processGuide?.length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                  参赛流程
                </div>
                <div class="relative">
                  <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-200"></div>
                  <div class="space-y-6 relative">
                    <div v-for="(step, idx) in detail.processGuide" :key="idx" class="flex gap-4 pl-2">
                      <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shrink-0">{{ step.step }}</div>
                      <div class="pt-1"><p class="text-sm text-gray-700">{{ step.desc }}</p></div>
                    </div>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Awards: Setup & Display -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }" v-if="detail.awards?.length || detail.awardsDisplay?.length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v18l3-3 4 3 4-3 3 3V3a2 2 0 00-2-2H7a2 2 0 00-2 2zm7 11v2m0-6v1"/></svg>
                  奖项信息
                </div>
                <div v-if="detail.awards?.length">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    奖项设置
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="item in detail.awards" :key="item" class="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700">{{ item }}</span>
                  </div>
                </div>
                <div v-if="detail.awardsDisplay?.length" class="mt-5">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 18l2-2 2 2m-4-6h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    奖项展示
                  </h4>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                        <tr class="bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] text-left text-gray-800">
                          <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">奖项级别</th>
                          <th class="py-3 font-semibold border-b-2 border-[#F97316]">名额</th>
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
                </div>
              </section>
            </Motion>

            <!-- Related Majors (Pro) -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  关联专业
                </div>
                <template v-if="isPro">
                  <div v-loading="majorsLoading" class="min-h-[100px]">
                    <div v-if="majors.length" class="flex flex-wrap gap-3">
                      <button
                        v-for="m in majors" :key="m.majorId"
                        class="rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
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
          </div>

          <!-- Right column (sticky) -->
          <div class="space-y-6 lg:sticky lg:top-24">
            <!-- Basic Info -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }" v-if="detail.basicInfo && Object.keys(detail.basicInfo).length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10"/></svg>
                  基本信息
                </div>
                <div class="space-y-3 text-sm">
                  <div v-for="(val, key) in detail.basicInfo" :key="key" class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400 shrink-0">{{ key }}</span>
                    <span class="text-gray-700 font-medium break-all text-right ml-4">{{ String(val) }}</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Quick Reference: Scoring & Notices -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" v-if="detail.scoringCriteria?.length || detail.notices?.length">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  竞赛须知
                </div>
                <div v-if="detail.scoringCriteria?.length">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    评分标准
                  </h4>
                  <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li v-for="item in detail.scoringCriteria" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div v-if="detail.notices?.length" class="mt-5">
                  <h4 class="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-800">
                    <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    注意事项
                  </h4>
                  <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li v-for="item in detail.notices" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </section>
            </Motion>
          </div>
        </div>
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

  </div>
</template>
