<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
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
const expandedGroupId = ref<number | null>(null)
const majorLoading = ref(false)
const majors = ref<AdmissionMajorVO[]>([])

// 冲突检查结果
const groupConflicts = ref<Map<number, ConstraintCheckResult>>(new Map())

// 简要信息抽屉
const drawerVisible = ref(false)
const drawerData = ref<BriefDrawerData | null>(null)

// 是否 normal 用户
const isNormal = computed(() => userStore.userInfo?.memberType === 'normal')

// 专业组约束检查结果（用于判断禁级别专业）

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
async function toggleExpand(groupId: number) {
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
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-6xl">
      <div class="flex justify-end gap-3 mb-4">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium"
          :class="selectionStore.totalCount > 0
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
          :disabled="selectionStore.totalCount === 0"
          @click="goPlans"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>志愿表({{ selectionStore.totalCount }})</span>
        </button>
      </div>

      <!-- 搜索栏 -->
      <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100 mb-6">
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">院校名称</label>
            <el-input v-model="searchForm.universityName" placeholder="模糊搜索院校名称" clearable />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">城市</label>
            <el-input v-model="searchForm.cityName" placeholder="模糊搜索城市" clearable />
          </div>
          <div class="flex items-end gap-4">
            <div class="flex items-center gap-2 pb-1">
              <el-switch v-model="searchForm.subjectFilter" />
              <span class="text-sm text-gray-600">仅显示选科匹配</span>
            </div>
            <button
              class="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
              @click="handleSearch"
            >
              查询
            </button>
          </div>
        </div>
        <div class="mt-3 text-sm text-gray-400">
          批次：{{ archive?.batch || '-' }} | 共 {{ pagination.total }} 个专业组
        </div>
      </div>

      <!-- 专业组列表 -->
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <div v-else-if="groups.length === 0" class="text-center py-20 text-gray-400">
        暂无专业组数据
      </div>

      <div v-else class="space-y-4">
        <div v-for="group in groups" :key="group.id" class="relative">
          <!-- 专业组行 -->
          <GroupRow
            :group="group"
            :is-expanded="expandedGroupId === group.id"
            :conflicts="groupConflicts.get(group.id) || null"
            :is-masked="group.masked"
            @toggle-expand="toggleExpand(group.id)"
            @click-university="openUniversityDrawer"
            @click-city="openCityDrawer"
          />

          <!-- 展开的专业明细 -->
          <Transition name="slide">
            <div
              v-if="expandedGroupId === group.id"
              class="ml-10 mt-2 space-y-2"
            >
              <div v-if="majorLoading" class="flex justify-center py-8">
                <el-icon class="is-loading text-2xl text-orange-500"><Loading /></el-icon>
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
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > pagination.size" class="mt-8 flex justify-center">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </main>

    <!-- 简要信息抽屉 -->
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
</style>
