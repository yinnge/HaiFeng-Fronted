<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getMajorDetail } from '@/api/major'
import type { MajorDetailVO } from '@/types/major'
import { Motion } from 'motion-v'
import { getMajorCompetitions } from '@/api/major'
import type { CompetitionBriefVO } from '@/types/certificate'
import { useUserStore } from '@/store'
import { getMajorPostgradDirections } from '@/api/major'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<MajorDetailVO | null>(null)
const error = ref('')

const malePercent = computed(() => detail.value?.maleRatio ?? 0)
const femalePercent = computed(() => detail.value?.femaleRatio ?? 0)

const userStore = useUserStore()
const competitions = ref<CompetitionBriefVO[]>([])
const compTotal = ref(0)
const compPage = ref(1)
const compPageSize = ref(10)
const compLoading = ref(false)

const isPro = computed(() => {
  const mt = userStore.userInfo?.memberType
  return mt === 'pro' || mt === 'vip'
})

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    error.value = '专业ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getMajorDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    error.value = e?.message || '获取专业详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchCompetitions() {
  const id = route.params.id as string
  if (!id || !isPro.value) return
  compLoading.value = true
  try {
    const res = await getMajorCompetitions(id, { page: compPage.value, size: compPageSize.value })
    competitions.value = res.data.data.records
    compTotal.value = res.data.data.total
  } catch {
    // 403 handled silently
  } finally {
    compLoading.value = false
  }
}

function onCompPageChange(page: number) {
  compPage.value = page
  fetchCompetitions()
}

function goCompetitionDetail(id: string) {
  router.push(`/competition/${id}`)
}

const directions = ref<PostgradMajorDirectionBriefVO[]>([])
const directionTotal = ref(0)
const directionPage = ref(1)
const directionPageSize = ref(10)
const directionLoading = ref(false)

const groupedDirections = computed(() => {
  const map = new Map<string, PostgradMajorDirectionBriefVO[]>()
  for (const d of directions.value) {
    const key = d.category && d.category.trim() ? d.category : '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

const dialogVisible = ref(false)
const selectedDirectionId = ref<string | null>(null)

async function fetchPostgradDirections() {
  const id = route.params.id as string
  if (!id || !isPro.value) return
  directionLoading.value = true
  try {
    const res = await getMajorPostgradDirections(id, { page: directionPage.value, size: directionPageSize.value })
    directions.value = res.data.data.records
    directionTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      error.value = e?.message || '获取考研方向失败'
    }
  } finally {
    directionLoading.value = false
  }
}

function onDirectionPageChange(page: number) {
  directionPage.value = page
  fetchPostgradDirections()
}

function showDirectionDetail(id: string) {
  selectedDirectionId.value = id
  dialogVisible.value = true
}

onMounted(() => {
  fetchDetail()
  fetchPostgradDirections()
  fetchCompetitions()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero Header -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 shadow-lg shadow-orange-200/60">
            <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-2xl font-bold text-white">{{ detail.majorName }}</h2>
                  <span v-if="detail.majorTags" class="rounded-full bg-white/20 px-3 py-1 text-sm text-white border border-white/30">{{ detail.majorTags }}</span>
                </div>
                <p class="text-orange-50 mt-1 font-mono">{{ detail.majorCode }}</p>
              </div>
              <div class="flex gap-2 flex-wrap">
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs text-white border border-white/20">{{ detail.parentCategory }}</span>
                <span class="rounded-full bg-white/15 px-3 py-1 text-xs text-white border border-white/20">{{ detail.majorCategory }}</span>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-green-600">{{ detail.employmentRate ? `${detail.employmentRate.toFixed(1)}%` : '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">就业率</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-blue-600">{{ detail.salaryMin ? `${detail.salaryMin.toLocaleString()}-${detail.salaryMax?.toLocaleString()}` : '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">薪资范围（元/月）</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-purple-600">{{ detail.courseCount ?? '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">开设课程</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-amber-600">{{ detail.graduateScale ?? '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">毕业规模</div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Two-column content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Left column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Courses & Skills -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
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

            <!-- Introduction -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 class="mb-4 text-lg font-bold text-gray-800">专业介绍</h3>
                <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <div v-if="detail.majorDescription">
                    <h4 class="font-semibold text-gray-800 mb-1">专业描述</h4>
                    <p class="whitespace-pre-line">{{ detail.majorDescription }}</p>
                  </div>
                  <div v-if="detail.trainingObjective">
                    <h4 class="font-semibold text-gray-800 mb-1">培养目标</h4>
                    <p class="whitespace-pre-line">{{ detail.trainingObjective }}</p>
                  </div>
                  <div v-if="detail.trainingRequirement">
                    <h4 class="font-semibold text-gray-800 mb-1">培养要求</h4>
                    <p class="whitespace-pre-line">{{ detail.trainingRequirement }}</p>
                  </div>
                  <div v-if="detail.subjectRequirement">
                    <h4 class="font-semibold text-gray-800 mb-1">选科要求</h4>
                    <p class="whitespace-pre-line">{{ detail.subjectRequirement }}</p>
                  </div>
                  <div v-if="detail.careerProspect">
                    <h4 class="font-semibold text-gray-800 mb-1">就业前景</h4>
                    <p class="whitespace-pre-line">{{ detail.careerProspect }}</p>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Postgrad Directions -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 class="mb-4 text-lg font-bold text-gray-800">考研方向</h3>
                <template v-if="isPro">
                  <div v-loading="directionLoading" class="min-h-[100px]">
                    <div v-if="directions.length" class="space-y-4">
                      <div v-for="group in groupedDirections" :key="group.category">
                        <div class="mb-2 flex items-center gap-2">
                          <span class="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-600">{{ group.category }}</span>
                          <span class="text-xs text-gray-400">{{ group.items.length }} 个</span>
                        </div>
                        <div class="flex flex-wrap gap-3">
                          <button
                            v-for="d in group.items" :key="d.id"
                            class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
                            @click="showDirectionDetail(d.id)"
                          >
                            {{ d.postgradMajorName }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else-if="!directionLoading" class="text-sm text-gray-400">暂无考研方向数据</div>
                  </div>
                  <div v-if="directionTotal > directionPageSize" class="mt-4 flex justify-center">
                    <el-pagination
                      background small layout="prev, pager, next"
                      :total="directionTotal" :page-size="directionPageSize"
                      :current-page="directionPage"
                      @current-change="onDirectionPageChange"
                    />
                  </div>
                </template>
                <template v-else>
                  <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
                    <div class="text-4xl mb-3">🔒</div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看可报考的考研方向</h4>
                    <p class="text-gray-500 mb-4">了解该本科专业可以报考哪些研究生专业</p>
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

            <!-- Related Competitions (Pro) -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <h3 class="mb-4 text-lg font-bold text-gray-800">关联竞赛</h3>
                <template v-if="isPro">
                  <div v-loading="compLoading" class="min-h-[100px]">
                    <div v-if="competitions.length" class="flex flex-wrap gap-3">
                      <button
                        v-for="c in competitions" :key="c.competitionId"
                        class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
                        @click="goCompetitionDetail(c.competitionId)"
                      >
                        {{ c.competitionName }}
                      </button>
                    </div>
                    <div v-else-if="!compLoading" class="text-sm text-gray-400">暂无关联竞赛数据</div>
                  </div>
                  <div v-if="compTotal > compPageSize" class="mt-4 flex justify-center">
                    <el-pagination
                      background small layout="prev, pager, next"
                      :total="compTotal" :page-size="compPageSize"
                      :current-page="compPage"
                      @current-change="onCompPageChange"
                    />
                  </div>
                </template>
                <template v-else>
                  <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
                    <div class="text-4xl mb-3">🔒</div>
                    <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看关联竞赛</h4>
                    <p class="text-gray-500 mb-4">了解该专业适合参加哪些学科竞赛</p>
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
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <h3 class="mb-4 text-lg font-bold text-gray-800">基本信息</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">门类</span>
                    <span class="text-gray-700 font-medium">{{ detail.parentCategory }}</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">类别</span>
                    <span class="text-gray-700 font-medium">{{ detail.majorCategory }}</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">学科</span>
                    <span class="text-gray-700 font-medium">{{ detail.disciplineName }}</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">授予学位</span>
                    <span class="text-gray-700 font-medium">{{ detail.degreeAwarded }}</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- Gender Ratio -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
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
    <PostgradMajorDialog
      v-model:visible="dialogVisible"
      :major-id="selectedDirectionId"
    />
    </main>
  </div>
</template>
