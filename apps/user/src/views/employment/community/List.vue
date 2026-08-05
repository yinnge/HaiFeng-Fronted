<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'
import EmploymentTabs from '@/components/employment/EmploymentTabs.vue'
import { getCommunityList } from '@/api/employment/community'
import type { CommunityPositionListVO, CommunityQueryDTO } from '@/types/employment/community'

const router = useRouter()

const keyword = ref('')
const positionType = ref('')
const employmentType = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const educationRequirement = ref('')
const majorRequirement = ref('')
const politicalStatus = ref('')
const workExperience = ref('')
const positionStatus = ref('')

const positionTypeOptions = ['社区党务工作者', '社区服务工作者', '社区网格员', '社区调解员', '社区安全员', '社区文化专干', '社会工作师', '综合岗', '其他']
const employmentTypeOptions = ['事业编制', '合同制', '政府购买服务', '公益性岗位']
const educationOptions = ['不限', '高中', '大专', '本科', '硕士']
const politicalStatusOptions = ['中共党员', '共青团员', '群众', '不限']
const workExperienceOptions = ['不限', '1年以上', '2年以上', '3年以上', '5年以上']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const loading = ref(false)
const jobs = ref<CommunityPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): CommunityQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    positionName: keyword.value || undefined,
    positionType: positionType.value || undefined,
    employmentType: employmentType.value || undefined,
    province: regionValue.value[0] || undefined,
    city: regionValue.value[1] || undefined,
    educationRequirement: educationRequirement.value || undefined,
    majorRequirement: majorRequirement.value || undefined,
    politicalStatus: politicalStatus.value || undefined,
    workExperience: workExperience.value || undefined,
    positionStatus: positionStatus.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getCommunityList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取社区岗位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  fetchList()
}

function onReset() {
  keyword.value = ''
  positionType.value = ''
  employmentType.value = ''
  regionValue.value = []
  educationRequirement.value = ''
  majorRequirement.value = ''
  politicalStatus.value = ''
  workExperience.value = ''
  positionStatus.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchList()
}

function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchList()
}

async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(`/employment/community/${id}`)
      router.push({ name: 'Login' })
    } catch {
      // cancelled
    }
    return
  }
  router.push(`/employment/community/${id}`)
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  return `${start?.slice(0, 10) || ''} ~ ${end?.slice(0, 10) || ''}`
}

const isFilterActive = computed(() => {
  return !!(keyword.value || positionType.value || employmentType.value || regionValue.value.length > 0 || educationRequirement.value || majorRequirement.value || politicalStatus.value || workExperience.value || positionStatus.value)
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
            社区工作者
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🏘️ 社区招聘</h2>
          <p class="text-gray-500">社区党务、网格员、专职工作者等社区岗位，共建美好社区</p>
        </div>

        <EmploymentTabs module="grassroots" />

        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入岗位名称、社区名称或主管部门" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">
              搜索
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="positionType" placeholder="岗位类型" clearable class="!w-[170px]" @change="onSearch">
              <el-option v-for="opt in positionTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="employmentType" placeholder="用工形式" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in employmentTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-cascader v-model="regionValue" :options="regionOptions" placeholder="省份/城市" clearable class="!w-[200px]" @change="onSearch" />
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="majorRequirement" type="text" placeholder="专业要求" class="!w-[130px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" @change="onSearch" />
            <el-select v-model="politicalStatus" placeholder="政治面貌" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in politicalStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="workExperience" placeholder="工作经验" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in workExperienceOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">
              重置
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">
            {{ loading ? '加载中...' : `共找到 ${total} 个社区岗位` }}
          </h3>
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-gradient-to-b from-orange-50/40 to-white p-6 shadow-lg border border-orange-100 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">社区招聘</span>
                <span v-if="job.positionType" class="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-600">{{ job.positionType }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                  {{ job.positionStatus }}
                </span>
              </div>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
              {{ job.positionName }}
            </h4>

            <p class="text-sm text-gray-500 mb-3">
              {{ job.communityName }}
              <span v-if="job.city"> · {{ job.city }}{{ job.district ? '·' + job.district : '' }}</span>
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span v-if="job.educationRequirement" class="text-gray-400">{{ job.educationRequirement }}</span>
              <span v-if="job.majorRequirement" class="text-gray-400">{{ job.majorRequirement }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
              <span v-if="job.workExperience" class="text-gray-400">{{ job.workExperience }}</span>
            </div>

            <div class="mt-3 flex justify-end">
              <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                查看详情
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">
            暂无社区岗位
          </div>
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
