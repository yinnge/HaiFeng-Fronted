<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { ProvinceOptions } from '@haifeng/shared'
import { getFinanceList, getFinanceFilters } from '@/api/employment/finance'
import type { FinancePositionListVO, FinanceQueryDTO } from '@/types/employment/finance'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'
import EmploymentTabs from '@/components/employment/EmploymentTabs.vue'

const router = useRouter()

const keyword = ref('')
const institutionType = ref('')
const institutionCategory = ref('')
const branchName = ref('')
const recruitmentType = ref('')
const positionCategory = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const ageLimit = ref<number | undefined>(undefined)
const salaryMin = ref<number | undefined>(undefined)
const positionStatus = ref('')
const educationRequirement = ref('')
const degreeRequirement = ref('')
const majorRequirement = ref('')

const institutionTypeOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']
const institutionCategoryOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']
const recruitmentTypeOptions = ['秋招', '春招', '社招', '实习', '定向']
const positionCategoryOptions = ref<string[]>([])
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
const educationRequirementOptions = ['不限', '大专', '本科', '硕士', '博士']
const degreeRequirementOptions = ['不限', '学士', '硕士', '博士']

const loading = ref(false)
const jobs = ref<FinancePositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): FinanceQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    institutionType: institutionType.value || undefined,
    institutionCategory: institutionCategory.value || undefined,
    branchName: branchName.value || undefined,
    recruitmentType: recruitmentType.value || undefined,
    positionCategory: positionCategory.value || undefined,
    province: regionValue.value[0] || undefined,
    city: regionValue.value[1] || undefined,
    ageLimit: ageLimit.value || undefined,
    salaryMin: salaryMin.value || undefined,
    positionStatus: positionStatus.value || undefined,
    educationRequirement: educationRequirement.value || undefined,
    degreeRequirement: degreeRequirement.value || undefined,
    majorRequirement: majorRequirement.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getFinanceList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取金融银行招聘列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '薪资面议'
  if (min != null && max != null) return `${min}k-${max}k`
  if (min != null) return `${min}k起`
  return `最高${max}k`
}

function onSearch() { page.value = 1; fetchList() }

function onReset() {
  keyword.value = ''; institutionType.value = ''; institutionCategory.value = ''
  branchName.value = ''; recruitmentType.value = ''; positionCategory.value = ''
  regionValue.value = []; ageLimit.value = undefined
  salaryMin.value = undefined; positionStatus.value = ''
  educationRequirement.value = ''; degreeRequirement.value = ''; majorRequirement.value = ''
  page.value = 1; fetchList()
}

function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', { confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning' })
      userStore.setRedirectPath(`/employment/finance/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/finance/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || institutionType.value || institutionCategory.value || branchName.value || recruitmentType.value || positionCategory.value || regionValue.value.length > 0 || ageLimit.value || salaryMin.value || positionStatus.value || educationRequirement.value || degreeRequirement.value || majorRequirement.value)
})

async function fetchFilters() {
  try {
    const res = await getFinanceFilters()
    positionCategoryOptions.value = res.data.data.positionCategory || []
  } catch {
    positionCategoryOptions.value = []
  }
}

onMounted(() => { fetchFilters(); fetchList() })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-6 max-w-7xl flex gap-6 justify-center">
        <div class="flex-1 min-w-0">
        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            金融行业
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🏦 金融银行招聘</h2>
          <p class="text-gray-500">银行、证券、保险、基金等金融机构岗位</p>
        </div>

        <EmploymentTabs module="industry" />

        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入机构名称或岗位名称" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="institutionType" placeholder="机构类型" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in institutionTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="institutionCategory" placeholder="机构大类" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in institutionCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="branchName" type="text" placeholder="分支行" class="!w-[120px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <el-select v-model="recruitmentType" placeholder="招聘类型" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in recruitmentTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="positionCategory" placeholder="岗位类别" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-cascader v-model="regionValue" :options="regionOptions" placeholder="省份/城市" clearable class="!w-[200px]" @change="onSearch" />
            <el-input-number v-model="ageLimit" :min="18" :max="100" placeholder="年龄上限" class="!w-[130px]" controls-position="right" @change="onSearch" />
            <el-input-number v-model="salaryMin" :min="1" :max="200" placeholder="最低薪资(k)" class="!w-[140px]" controls-position="right" @change="onSearch" />
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in educationRequirementOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="degreeRequirement" placeholder="学位要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in degreeRequirementOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="majorRequirement" type="text" placeholder="专业要求" class="!w-[140px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ loading ? '加载中...' : `共找到 ${total} 个金融银行岗位` }}</h3>
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-gradient-to-b from-orange-50/40 to-white p-6 shadow-lg border border-orange-100 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">金融银行</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">{{ job.positionStatus }}</span>
              </div>
            </div>
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ job.institutionName }}<span v-if="job.institutionCategory"> · {{ job.institutionCategory }}</span><span v-if="job.city"> · {{ job.city }}</span><span v-if="job.educationRequirement"> · {{ job.educationRequirement }}</span></p>
            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.recruitmentType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">{{ job.recruitmentType }}</span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span class="text-gray-400">{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
              <span v-if="job.majorRequirement" class="text-gray-400">专业：{{ job.majorRequirement }}</span>
            </div>
            <p v-if="job.workLocation" class="mt-2 text-xs text-gray-400">{{ job.workLocation }} <span v-if="job.isRemote">· 支持远程</span></p>
            <div class="mt-3 flex justify-end">
              <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                查看详情 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无金融银行招聘岗位</div>
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
