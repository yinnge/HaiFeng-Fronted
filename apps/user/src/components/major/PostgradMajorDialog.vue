<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPostgradMajorDetail, getUniversitiesByPostgradMajor, getPostgradMajorUndergraduateMajors } from '@/api/postgrad-major'
import type { PostgradMajorDetailVO, UniversityBriefForPostgradVO } from '@/types/postgrad-major'
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'

const props = defineProps<{
  visible: boolean
  majorId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

import { useRechargeDialog } from '@/composables/useRechargeDialog'

const recharge = useRechargeDialog()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<PostgradMajorDetailVO | null>(null)

const universityLoading = ref(false)
const universities = ref<UniversityBriefForPostgradVO[]>([])
const universityTotal = ref(0)
const universityPage = ref(1)
const universityPageSize = ref(10)
const universityCategory = ref('')

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']

async function fetchDetail() {
  if (!props.majorId) return
  loading.value = true
  try {
    const res = await getPostgradMajorDetail(props.majorId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取考研专业详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUniversities() {
  if (!props.majorId || !isPro.value) return
  universityLoading.value = true
  try {
    const res = await getUniversitiesByPostgradMajor(props.majorId, {
      page: universityPage.value,
      size: universityPageSize.value,
      category: universityCategory.value || undefined,
    })
    universities.value = res.data.data.records
    universityTotal.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取开设院校失败')
  } finally {
    universityLoading.value = false
  }
}

function goUniversity(id: string) {
  emit('update:visible', false)
  router.push(`/university/${id}`)
}

function onPageChange(page: number) {
  universityPage.value = page
  fetchUniversities()
}

const undergradLoading = ref(false)
const undergraduateMajors = ref<UndergraduateMajorDirectionBriefVO[]>([])
const undergradTotal = ref(0)
const undergradPage = ref(1)
const undergradPageSize = ref(10)

const groupedUndergrad = computed(() => {
  const map = new Map<string, UndergraduateMajorDirectionBriefVO[]>()
  for (const m of undergraduateMajors.value) {
    const key = m.category && m.category.trim() ? m.category : '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

async function fetchUndergraduateMajors() {
  if (!props.majorId || !isPro.value) return
  undergradLoading.value = true
  try {
    const res = await getPostgradMajorUndergraduateMajors(props.majorId, {
      page: undergradPage.value,
      size: undergradPageSize.value,
    })
    undergraduateMajors.value = res.data.data.records
    undergradTotal.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取关联本科专业失败')
  } finally {
    undergradLoading.value = false
  }
}

function onUndergradPageChange(page: number) {
  undergradPage.value = page
  fetchUndergraduateMajors()
}

function goMajor(id: string) {
  emit('update:visible', false)
  router.push(`/major/${id}`)
}

watch(() => props.visible, (val) => {
  if (val) {
    universityPage.value = 1
    undergradPage.value = 1
    universityCategory.value = ''
    detail.value = null
    universities.value = []
    undergraduateMajors.value = []
    fetchDetail()
    if (isPro.value) {
      fetchUniversities()
      fetchUndergraduateMajors()
    }
  }
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="detail?.majorName || '考研专业详情'"
    width="800px"
    top="5vh"
    destroy-on-close
    append-to-body
    class="postgrad-dialog"
  >
    <div v-loading="loading" class="min-h-[300px]">
      <template v-if="detail">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <h3 class="text-xl font-bold text-gray-800">{{ detail.majorName }}</h3>
          <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ detail.degreeType }}</span>
          <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{{ detail.popularity }}</span>
          <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">难度: {{ detail.difficulty }}</span>
        </div>
        <p class="text-gray-400 font-mono text-sm mb-4">代码：{{ detail.majorCode }} | 门类：{{ detail.disciplineCategory }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Introduction -->
          <section class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border border-orange-100">
            <h4 class="mb-2 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">专业介绍</h4>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detail.introduction }}</p>
          </section>

          <!-- Exam Subjects -->
          <section class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border border-orange-100">
            <h4 class="mb-2 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">考试科目</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="subj in detail.examSubjects" :key="subj"
                class="rounded-lg bg-white px-3 py-1 text-sm text-gray-700 border border-orange-200"
              >{{ subj }}</span>
            </div>
          </section>

          <!-- Admission Requirements -->
          <section class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border border-orange-100">
            <h4 class="mb-2 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">报考条件</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li v-for="req in detail.admissionRequirements" :key="req" class="flex items-start gap-2">
                <span class="text-orange-500 mt-0.5">•</span>{{ req }}
              </li>
            </ul>
          </section>

          <!-- Cross-exam Info -->
          <section class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-4 border border-orange-100">
            <h4 class="mb-2 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">跨考信息</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium text-gray-700">难度：</span>{{ detail.crossExamDifficulty }}</p>
              <p v-if="detail.crossExamDescription">{{ detail.crossExamDescription }}</p>
              <div v-if="detail.crossExamFactors?.length">
                <span class="font-medium text-gray-700">影响因素：</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span v-for="f in detail.crossExamFactors" :key="f"
                    class="rounded-lg bg-white px-2.5 py-1 text-xs text-gray-600 border border-orange-200"
                  >{{ f }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Undergraduate Majors -->
        <section class="rounded-xl border border-orange-100 bg-gradient-to-b from-orange-50/70 to-white p-4 mb-4">
          <h4 class="mb-3 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">关联本科专业</h4>
          <template v-if="isPro">
            <div v-loading="undergradLoading" class="min-h-[100px]">
              <div v-if="undergraduateMajors.length" class="space-y-4">
                <div v-for="group in groupedUndergrad" :key="group.category">
                  <div class="mb-2 flex items-center gap-2">
                    <span class="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-medium text-orange-600">{{ group.category }}</span>
                    <span class="text-xs text-gray-400">{{ group.items.length }} 个</span>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="m in group.items" :key="m.id"
                      class="flex items-center justify-between rounded-lg bg-white px-4 py-3 hover:bg-orange-50/70 cursor-pointer transition-colors border border-orange-100"
                      @click="goMajor(m.id)"
                    >
                      <span class="text-sm font-medium text-gray-800">{{ m.majorName }}</span>
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="!undergradLoading" class="py-8 text-center text-gray-400 text-sm">暂无关联本科专业数据</div>
            </div>
            <div v-if="undergradTotal > undergradPageSize" class="mt-4 flex justify-center">
              <el-pagination
                background small layout="prev, pager, next"
                :total="undergradTotal" :page-size="undergradPageSize" :current-page="undergradPage"
                @current-change="onUndergradPageChange"
              />
            </div>
          </template>
          <template v-else>
            <div class="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center border border-orange-100">
              <p class="text-sm text-gray-600 mb-3">开通专业版，查看可报考该考研方向的本科专业</p>
              <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-sm text-white font-medium"
                @click="recharge.open()"
              >立即升级</button>
            </div>
          </template>
        </section>

        <!-- Universities Section -->
        <section class="rounded-xl border border-orange-100 bg-gradient-to-b from-orange-50/70 to-white p-4">
          <h4 class="mb-3 inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-0.5 text-xs font-semibold text-white">开设院校</h4>
          <template v-if="isPro">
            <div class="mb-3">
              <el-select v-model="universityCategory" placeholder="院校类型" clearable filterable class="!w-40" @change="universityPage = 1; fetchUniversities()">
                <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
              </el-select>
            </div>
            <div v-loading="universityLoading" class="min-h-[100px]">
              <div v-if="universities.length" class="space-y-2">
                <div
                  v-for="uni in universities" :key="uni.id"
                  class="flex items-center justify-between rounded-lg bg-white px-4 py-3 hover:bg-orange-50/70 cursor-pointer transition-colors border border-orange-100"
                  @click="goUniversity(uni.id)"
                >
                  <span class="text-sm font-medium text-gray-800">{{ uni.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">{{ uni.category }}</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div v-else-if="!universityLoading" class="py-8 text-center text-gray-400 text-sm">暂无开设院校数据</div>
            </div>
            <div v-if="universityTotal > universityPageSize" class="mt-4 flex justify-center">
              <el-pagination
                background small layout="prev, pager, next"
                :total="universityTotal" :page-size="universityPageSize" :current-page="universityPage"
                @current-change="onPageChange"
              />
            </div>
          </template>
          <template v-else>
            <div class="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center border border-orange-100">
              <p class="text-sm text-gray-600 mb-3">开通专业版，查看开设该考研专业的院校列表</p>
              <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-sm text-white font-medium"
                @click="recharge.open()"
              >立即升级</button>
            </div>
          </template>
        </section>
      </template>
    </div>
  </el-dialog>
</template>

<style>
.postgrad-dialog {
  border-radius: 12px;
  overflow: hidden;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

.postgrad-dialog .el-dialog__header {
  border-bottom: 1px solid #ffedd5;
  margin-right: 0;
  padding-right: 20px;
}

.postgrad-dialog .el-dialog__title {
  font-weight: 600;
  color: #1f2937;
}

.postgrad-dialog .el-dialog__body {
  padding-top: 12px;
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.45) 0%, #fff 100%);
}
</style>
