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

/** 手写分页页码（不使用 el-pagination，统一 user 端橙色规范） */
function buildPages(total: number, size: number, current: number): (number | string)[] {
  const t = Math.ceil(total / size)
  const pages: (number | string)[] = []
  if (t <= 7) {
    for (let i = 1; i <= t; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 4) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(t - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < t - 3) pages.push('...')
    pages.push(t)
  }
  return pages
}

const undergradTotalPages = computed(() => Math.ceil(undergradTotal.value / undergradPageSize.value))
const universityTotalPages = computed(() => Math.ceil(universityTotal.value / universityPageSize.value))
const undergradPages = computed(() => buildPages(undergradTotal.value, undergradPageSize.value, undergradPage.value))
const universityPages = computed(() => buildPages(universityTotal.value, universityPageSize.value, universityPage.value))

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
    class="postgrad-dialog"
  >
    <div v-loading="loading" class="min-h-[300px]">
      <template v-if="detail">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-3 flex-wrap">
          <h3 class="text-xl font-bold text-gray-800">{{ detail.majorName }}</h3>
          <span class="pill-new">{{ detail.degreeType }}</span>
          <span class="pill-new">{{ detail.popularity }}</span>
          <span class="pill-new">难度：{{ detail.difficulty }}</span>
        </div>
        <p class="text-sm text-gray-400 mb-4">代码：{{ detail.majorCode }} | 门类：{{ detail.disciplineCategory }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Introduction -->
          <section class="dlg-card p-4">
            <h4 class="sec-title">专业介绍</h4>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detail.introduction }}</p>
          </section>

          <!-- Exam Subjects -->
          <section class="dlg-card p-4">
            <h4 class="sec-title">考试科目</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="subj in detail.examSubjects" :key="subj" class="chip">{{ subj }}</span>
            </div>
          </section>

          <!-- Admission Requirements -->
          <section class="dlg-card p-4">
            <h4 class="sec-title">报考条件</h4>
            <ul class="text-sm text-gray-600 space-y-1.5">
              <li v-for="req in detail.admissionRequirements" :key="req" class="flex items-start gap-2">
                <span class="dot mt-1.5 shrink-0" />
                <span>{{ req }}</span>
              </li>
            </ul>
          </section>

          <!-- Cross-exam Info -->
          <section class="dlg-card p-4">
            <h4 class="sec-title">跨考信息</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium text-gray-700">难度：</span>{{ detail.crossExamDifficulty }}</p>
              <p v-if="detail.crossExamDescription">{{ detail.crossExamDescription }}</p>
              <div v-if="detail.crossExamFactors?.length">
                <span class="font-medium text-gray-700">影响因素：</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span v-for="f in detail.crossExamFactors" :key="f" class="chip text-xs">{{ f }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Undergraduate Majors -->
        <section class="dlg-card p-4 mb-4">
          <h4 class="sec-title">关联本科专业</h4>
          <template v-if="isPro">
            <div v-loading="undergradLoading" class="min-h-[100px]">
              <div v-if="undergraduateMajors.length" class="space-y-4">
                <div v-for="group in groupedUndergrad" :key="group.category">
                  <div class="mb-2 flex items-center gap-2">
                    <span class="pill-new">{{ group.category }}</span>
                    <span class="text-xs text-gray-400">{{ group.items.length }} 个</span>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="m in group.items" :key="m.id"
                      class="row-card flex items-center justify-between px-4 py-3 cursor-pointer"
                      @click="goMajor(m.id)"
                    >
                      <span class="text-sm font-medium text-gray-800">{{ m.majorName }}</span>
                      <svg class="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="!undergradLoading" class="py-8 text-center text-gray-400 text-sm">暂无关联本科专业数据</div>
            </div>
            <!-- 手写分页 -->
            <div v-if="undergradTotalPages > 1" class="mt-4 flex items-center justify-center gap-1.5">
              <button class="pager-btn" :disabled="undergradPage === 1" @click="onUndergradPageChange(undergradPage - 1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <template v-for="(p, i) in undergradPages" :key="`ug-${p}-${i}`">
                <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                <button
                  v-else
                  class="pager-btn"
                  :class="p === undergradPage ? 'pager-active' : ''"
                  @click="onUndergradPageChange(p as number)"
                >{{ p }}</button>
              </template>
              <button class="pager-btn" :disabled="undergradPage === undergradTotalPages" @click="onUndergradPageChange(undergradPage + 1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="upgrade-block p-6 text-center">
              <p class="text-sm text-gray-600 mb-3">开通专业版，查看可报考该考研方向的本科专业</p>
              <button class="btn-pill" @click="router.push('/profile')">立即升级</button>
            </div>
          </template>
        </section>

        <!-- Universities Section -->
        <section class="dlg-card p-4">
          <h4 class="sec-title">开设院校</h4>
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
                  class="row-card flex items-center justify-between px-4 py-3 cursor-pointer"
                  @click="goUniversity(uni.id)"
                >
                  <span class="text-sm font-medium text-gray-800">{{ uni.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500">{{ uni.category }}</span>
                    <svg class="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div v-else-if="!universityLoading" class="py-8 text-center text-gray-400 text-sm">暂无开设院校数据</div>
            </div>
            <!-- 手写分页 -->
            <div v-if="universityTotalPages > 1" class="mt-4 flex items-center justify-center gap-1.5">
              <button class="pager-btn" :disabled="universityPage === 1" @click="onPageChange(universityPage - 1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <template v-for="(p, i) in universityPages" :key="`uni-${p}-${i}`">
                <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                <button
                  v-else
                  class="pager-btn"
                  :class="p === universityPage ? 'pager-active' : ''"
                  @click="onPageChange(p as number)"
                >{{ p }}</button>
              </template>
              <button class="pager-btn" :disabled="universityPage === universityTotalPages" @click="onPageChange(universityPage + 1)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="upgrade-block p-6 text-center">
              <p class="text-sm text-gray-600 mb-3">开通专业版，查看开设该考研专业的院校列表</p>
              <button class="btn-pill" @click="router.push('/profile')">立即升级</button>
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

/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.postgrad-dialog .dlg-card {
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
}

/* ===== 区域标题：橙渐变药丸 + 白字 ===== */
.postgrad-dialog .sec-title {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.15rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}

/* ===== 橙系药丸标签 ===== */
.postgrad-dialog .pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* ===== 内层小卡（考试科目 / 影响因素） ===== */
.postgrad-dialog .chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  background: linear-gradient(160deg, #fffdf9, #fff7ed);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

/* ===== 列表圆点 ===== */
.postgrad-dialog .dot {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

/* ===== 可点击行卡：浅橙渐变底 + hover 上浮 ===== */
.postgrad-dialog .row-card {
  border-radius: 0.75rem;
  background: linear-gradient(160deg, #fffdf9, #fff7ed);
  border: 1px solid rgba(249, 115, 22, 0.15);
  transition: all 0.2s ease;
}
.postgrad-dialog .row-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.35);
  box-shadow: 0 6px 18px rgba(249, 115, 22, 0.12);
}

/* ===== 会员引导块：虚线橙描边 ===== */
.postgrad-dialog .upgrade-block {
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.06));
  border: 1px dashed rgba(249, 115, 22, 0.35);
}

/* ===== 橙渐变药丸按钮 ===== */
.postgrad-dialog .btn-pill {
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
  transition: all 0.2s ease;
}
.postgrad-dialog .btn-pill:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
}

/* ===== 手写分页 ===== */
.postgrad-dialog .pager-btn {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #4b5563;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.18);
  transition: all 0.2s ease;
}
.postgrad-dialog .pager-btn:hover:not(:disabled) {
  color: #e8722a;
  border-color: rgba(249, 115, 22, 0.45);
  background: rgba(249, 115, 22, 0.06);
}
.postgrad-dialog .pager-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.postgrad-dialog .pager-active {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
}
</style>
