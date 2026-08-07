<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getMilitaryList } from '@/api/employment/military'
import type { MilitaryPositionListVO, MilitaryPositionSearchDTO } from '@/types/employment/military'
import { MilitaryStatusTag } from '@/types/employment/military'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'
import EmploymentTabs from '@/components/employment/EmploymentTabs.vue'

const router = useRouter()

const keyword = ref('')
const positionType = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const majorRequirement = ref('')
const educationRequirement = ref('')
const positionStatus = ref('')

const positionTypeOptions = ['管理岗', '专业技术岗']
const educationOptions = ['本科及以上', '硕士及以上', '博士']
const statusOptions = ['进行中', '已结束']

const loading = ref(false)
const jobs = ref<MilitaryPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): MilitaryPositionSearchDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    positionType: positionType.value || undefined,
    workLocation: regionValue.value.join(' ') || undefined,
    majorRequirement: majorRequirement.value || undefined,
    educationRequirement: educationRequirement.value || undefined,
    positionStatus: positionStatus.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getMilitaryList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取军队文职岗位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch() { page.value = 1; fetchList() }
function onReset() {
  keyword.value = ''; positionType.value = ''; regionValue.value = []
  majorRequirement.value = ''; educationRequirement.value = ''; positionStatus.value = ''
  page.value = 1; fetchList()
}
function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', { confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning' })
      userStore.setRedirectPath(`/employment/military/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/military/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || positionType.value || regionValue.value.length > 0 || majorRequirement.value || educationRequirement.value || positionStatus.value)
})

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-6 max-w-7xl flex gap-6 justify-center">
        <div class="flex-1 min-w-0">
        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">部队文职招聘</h2>
          <p class="text-gray-500">军队文职人员招聘岗位查询</p>
        </div>

        <EmploymentTabs module="civilService" />

        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="搜索岗位名称、用人单位或所属部门" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="positionType" placeholder="岗位类型" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-cascader v-model="regionValue" :options="regionOptions" placeholder="省份/城市" clearable class="!w-[200px]" @change="onSearch" />
            <input v-model="majorRequirement" type="text" placeholder="专业要求" class="!w-[130px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ loading ? '加载中...' : `共找到 ${total} 个军队文职岗位` }}</h3>
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-gradient-to-b from-orange-50/40 to-white p-6 shadow-lg border border-orange-100 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">{{ job.positionType || '军队文职' }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="MilitaryStatusTag[job.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ job.positionStatus }}</span>
              </div>
            </div>
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ job.employerUnit }}<span v-if="job.department"> · {{ job.department }}</span><span v-if="job.workLocation"> · {{ job.workLocation }}</span></p>
            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.majorRequirement" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">{{ job.majorRequirement }}</span>
              <span v-if="job.educationRequirement" class="text-gray-400">{{ job.educationRequirement }}</span>
              <span v-if="job.salaryRange" class="text-gray-400">{{ job.salaryRange }}</span>
            </div>
            <div class="mt-3 flex justify-end">
              <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                查看详情 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无军队文职岗位</div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination background layout="sizes, prev, pager, next, total" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>
        </div>
        <ContentDrawer />
      </div>
    </main>
  </div>
</template>
