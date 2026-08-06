<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useSelectionStore } from '@/store/modules/selection'
import {
  getArchive,
  getGroupPage,
  getMajorPage,
  checkGroupConstraint,
  type AdmissionGroupVO,
  type AdmissionMajorVO,
  type ConstraintCheckResult,
  type GaokaoArchiveVO,
} from '@/api/gaokao'
import GroupRow from '@/components/gaokao/GroupRow.vue'
import MajorRow from '@/components/gaokao/MajorRow.vue'
import BriefInfoDrawer from '@/components/gaokao/BriefInfoDrawer.vue'
import type { BriefDrawerData } from '@/types/gaokao/brief'

const router = useRouter()
const userStore = useUserStore()
const selectionStore = useSelectionStore()

// 档案数据
const archive = ref<GaokaoArchiveVO | null>(null)

// 搜索条件
const searchForm = reactive({
  universityName: '',
  cityName: '',
  subjectFilter: false,
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

// 专业组列表
const groups = ref<AdmissionGroupVO[]>([])
const loading = ref(false)

// 展开的专业组 ID
const expandedGroupId = ref<string | null>(null)
const majorLoading = ref(false)
const majors = ref<AdmissionMajorVO[]>([])

// 冲突检查结果
const groupConflicts = ref<Map<string, ConstraintCheckResult>>(new Map())

// 简要信息抽屉
const drawerVisible = ref(false)
const drawerData = ref<BriefDrawerData | null>(null)

// 是否 normal 用户
const isNormal = computed(() => userStore.userInfo?.memberType === 'normal')

// 分页计算
const totalPages = computed(() => Math.ceil(pagination.total / pagination.size))

const paginationPages = computed(() => {
  const total = totalPages.value
  const current = pagination.page
  const pages: (number | string)[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})

// 加载档案
async function loadArchive() {
  try {
    const res = await getArchive()
    archive.value = res.data.data
    if (!archive.value) {
      ElMessage.warning('请先填写高考档案')
      router.push('/gaokao/archive')
      return
    }
    loadGroups()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载档案失败')
  }
}

// 加载专业组
async function loadGroups() {
  if (!archive.value) return
  loading.value = true
  try {
    const res = await getGroupPage({
      batch: archive.value.batch,
      universityName: searchForm.universityName || undefined,
      cityName: searchForm.cityName || undefined,
      subjectFilter: searchForm.subjectFilter,
      page: pagination.page,
      size: pagination.size,
    })
    const data = res.data.data
    groups.value = data.records
    pagination.total = data.total
    // 并行检查约束
    checkAllGroupConstraints()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载专业组失败')
  } finally {
    loading.value = false
  }
}

// 并行检查所有专业组约束
async function checkAllGroupConstraints() {
  const promises = groups.value
    .filter(g => !g.masked)
    .map(async (g) => {
      try {
        const res = await checkGroupConstraint(g.id)
        groupConflicts.value.set(g.id, res.data.data)
      } catch {
        // 静默处理
      }
    })
  await Promise.all(promises)
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadGroups()
}

// 分页
function handlePageChange(page: number) {
  pagination.page = page
  loadGroups()
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.page = 1
  loadGroups()
}

// 展开/收起专业组
async function toggleExpand(groupId: string) {
  if (expandedGroupId.value === groupId) {
    expandedGroupId.value = null
    majors.value = []
    return
  }
  expandedGroupId.value = groupId
  majorLoading.value = true
  try {
    const res = await getMajorPage({ groupId, page: 1, size: 100 })
    majors.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '加载专业明细失败')
  } finally {
    majorLoading.value = false
  }
}

// 切换专业选中状态
function toggleMajorSelection(group: AdmissionGroupVO, major: AdmissionMajorVO) {
  if (major.levelShort === '禁') {
    ElMessage.warning('该专业为禁级别，不允许添加')
    return
  }
  selectionStore.toggleMajor(
    group.id,
    {
      groupName: group.groupName,
      universityName: group.universityName,
      levelShort: group.levelShort,
      safetyLevel: group.safetyLevel,
    },
    {
      majorId: major.id,
      majorName: major.majorName,
      levelShort: major.levelShort,
      safetyLevel: major.safetyLevel,
    }
  )
}

// 查看志愿表
function goPlans() {
  router.push('/gaokao/plans')
}

// 打开院校简要信息抽屉
function openUniversityDrawer(name: string) {
  drawerData.value = { type: 'university', name }
  drawerVisible.value = true
}

// 打开城市简要信息抽屉
function openCityDrawer(name: string) {
  drawerData.value = { type: 'city', name }
  drawerVisible.value = true
}

onMounted(loadArchive)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-7xl">
      <!-- 顶部操作栏 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">专业组查询</h1>
          <p class="text-sm text-gray-500 mt-1">根据你的高考档案，智能筛选可报考的专业组</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5"
            @click="router.push('/gaokao/archive')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            修改档案
          </button>
          <button
            class="btn-brand flex items-center gap-2"
            :class="selectionStore.totalCount === 0 ? 'opacity-50 cursor-not-allowed' : ''"
            :disabled="selectionStore.totalCount === 0"
            @click="goPlans"
          >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>志愿表</span>
          <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-white/25">
            {{ selectionStore.totalCount }}
          </span>
        </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="rounded-2xl bg-white p-6 shadow-card border border-gray-100/60 mb-6">
        <div class="flex items-end gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">院校名称</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <el-input v-model="searchForm.universityName" placeholder="搜索院校名称" clearable class="pl-10" />
            </div>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">城市</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <el-input v-model="searchForm.cityName" placeholder="搜索城市" clearable class="pl-10" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2.5 pb-1">
              <el-switch v-model="searchForm.subjectFilter" />
              <span class="text-sm font-medium text-gray-600">仅选科匹配</span>
            </div>
            <button
              class="btn-brand px-6 py-2.5 text-sm"
              @click="handleSearch"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              查询
            </button>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100/60 flex items-center gap-4 text-sm">
          <span class="inline-flex items-center text-gray-500">
            <svg class="w-4 h-4 mr-1.5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            批次：<span class="font-semibold text-gray-700">{{ archive?.batch || '-' }}</span>
          </span>
          <span class="text-gray-300">|</span>
          <span class="inline-flex items-center text-gray-500">
            <svg class="w-4 h-4 mr-1.5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            共 <span class="font-semibold text-gray-700 mx-1">{{ pagination.total }}</span> 个专业组
          </span>
        </div>
      </div>

      <!-- 专业组列表 -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="rounded-2xl border border-gray-100/60 bg-white p-5 shadow-card animate-pulse">
          <div class="flex items-stretch gap-4">
            <div class="w-28 shrink-0 flex flex-col items-center justify-center">
              <div class="w-12 h-12 rounded-2xl bg-gray-200" />
              <div class="w-8 h-3 mt-2 bg-gray-200 rounded" />
            </div>
            <div class="flex-1 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-32 h-5 bg-gray-200 rounded" />
                <div class="w-16 h-4 bg-gray-200 rounded" />
              </div>
              <div class="flex items-center gap-3">
                <div class="w-20 h-4 bg-gray-200 rounded" />
                <div class="w-24 h-4 bg-gray-200 rounded" />
                <div class="w-16 h-4 bg-gray-200 rounded" />
              </div>
              <div class="w-3/4 h-4 bg-gray-200 rounded" />
            </div>
            <div class="w-80 shrink-0 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-full" />
              <div class="h-4 bg-gray-200 rounded w-full" />
              <div class="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div class="w-20 shrink-0 flex items-center justify-center">
              <div class="w-12 h-12 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="groups.length === 0" class="text-center py-20">
        <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">暂无专业组数据</h3>
        <p class="text-sm text-gray-500">请调整筛选条件或检查档案信息</p>
      </div>

      <div v-else class="space-y-4">
        <TransitionGroup name="list" tag="div" class="space-y-4">
          <div v-for="group in groups" :key="group.id" class="relative">
            <GroupRow
              :group="group"
              :is-expanded="expandedGroupId === group.id"
              :conflicts="groupConflicts.get(group.id) || null"
              :is-masked="group.masked"
              @toggle-expand="toggleExpand(group.id)"
              @click-university="openUniversityDrawer"
              @click-city="openCityDrawer"
            />

            <Transition name="slide">
              <div
                v-if="expandedGroupId === group.id"
                class="ml-14 mt-3 space-y-2"
              >
                <div v-if="majorLoading" class="flex items-center justify-center py-8 gap-2">
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 0ms" />
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 150ms" />
                  <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 300ms" />
                </div>
                <MajorRow
                  v-for="major in majors"
                  :key="major.id"
                  :major="major"
                  :is-selected="selectionStore.isMajorSelected(major.id)"
                  :is-masked="group.masked"
                  @toggle-select="toggleMajorSelection(group, major)"
                />
              </div>
            </Transition>
          </div>
        </TransitionGroup>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > pagination.size" class="mt-8 flex justify-center">
        <div class="inline-flex items-center gap-1 bg-white rounded-2xl shadow-card border border-gray-100/60 p-1.5">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
            :class="pagination.page <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(pagination.page - 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <template v-for="p in paginationPages" :key="p">
            <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
            <button
              v-else
              class="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200"
              :class="p === pagination.page
                ? 'bg-gradient-to-br from-brand-orange to-brand-orange-light text-white shadow-brand'
                : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
              @click="handlePageChange(p as number)"
            >
              {{ p }}
            </button>
          </template>

          <button
            class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
            :class="pagination.page >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
            :disabled="pagination.page >= totalPages"
            @click="handlePageChange(pagination.page + 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div class="w-px h-6 bg-gray-200 mx-1" />

          <div class="flex items-center gap-2 px-3">
            <span class="text-sm text-gray-500">每页</span>
            <select
              v-model="pagination.size"
              class="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              @change="handleSizeChange(pagination.size)"
            >
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="30">30</option>
              <option :value="50">50</option>
            </select>
            <span class="text-sm text-gray-500">条</span>
          </div>
        </div>
      </div>
    </main>

    <BriefInfoDrawer
      v-model:visible="drawerVisible"
      :data="drawerData"
    />
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
