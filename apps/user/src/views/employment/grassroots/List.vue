<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'
import EmploymentTabs from '@/components/employment/EmploymentTabs.vue'
import { getGrassrootsList, getGrassrootsYears, getGrassrootsGradYears } from '@/api/employment/grassroots'
import type { GrassrootsPositionListVO, GrassrootsQueryDTO } from '@/types/employment/grassroots'

const router = useRouter()

const keyword = ref('')
const projectType = ref('')
const year = ref('')
const serviceType = ref('')
const province = ref('')
const city = ref('')
const county = ref('')
const educationRequirement = ref('')
const majorRequirement = ref('')
const gradYearRequirement = ref('')
const politicalStatus = ref('')
const positionStatus = ref('')

const projectTypeOptions = ['三支一扶', '西部计划']
const serviceTypeOptions = ['支教', '支农', '支医', '帮扶乡村振兴', '基础教育', '服务三农', '医疗卫生', '基层青年工作', '基层社会管理', '服务新疆', '服务西藏']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']
const educationOptions = ['大专', '本科', '硕士', '大专及以上', '本科及以上']
const politicalStatusOptions = ['中共党员', '共青团员', '群众', '不限']
const positionStatusOptions = ['招募中', '已结束', '即将开始']

const yearOptions = ref<string[]>([])
const gradYearOptions = ref<string[]>([])

async function fetchYears() {
  try {
    const res = await getGrassrootsYears()
    yearOptions.value = res.data.data || []
  } catch {
    const currentYear = new Date().getFullYear()
    yearOptions.value = Array.from({ length: 5 }, (_, i) => String(currentYear + i))
  }
}

async function fetchGradYears() {
  try {
    const res = await getGrassrootsGradYears()
    gradYearOptions.value = res.data.data || []
  } catch {
    const currentYear = new Date().getFullYear()
    gradYearOptions.value = Array.from({ length: 6 }, (_, i) => String(currentYear - i))
  }
}

const loading = ref(false)
const jobs = ref<GrassrootsPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): GrassrootsQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    projectType: projectType.value || undefined,
    year: year.value || undefined,
    serviceType: serviceType.value || undefined,
    province: province.value || undefined,
    city: city.value || undefined,
    county: county.value || undefined,
    educationRequirement: educationRequirement.value || undefined,
    majorRequirement: majorRequirement.value || undefined,
    gradYearRequirement: gradYearRequirement.value || undefined,
    politicalStatus: politicalStatus.value || undefined,
    positionStatus: positionStatus.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getGrassrootsList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取基层服务岗位列表失败')
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
  projectType.value = ''
  year.value = ''
  serviceType.value = ''
  province.value = ''
  city.value = ''
  county.value = ''
  educationRequirement.value = ''
  majorRequirement.value = ''
  gradYearRequirement.value = ''
  politicalStatus.value = ''
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
      userStore.setRedirectPath(`/employment/grassroots/${id}`)
      router.push({ name: 'Login' })
    } catch {
      // cancelled
    }
    return
  }
  router.push(`/employment/grassroots/${id}`)
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  return `${start?.slice(0, 10) || ''} ~ ${end?.slice(0, 10) || ''}`
}

const isFilterActive = computed(() => {
  return !!(keyword.value || projectType.value || year.value || serviceType.value || province.value || city.value || county.value || educationRequirement.value || majorRequirement.value || gradYearRequirement.value || politicalStatus.value || positionStatus.value)
})

onMounted(() => { fetchYears(); fetchGradYears(); fetchList() })
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-6 max-w-7xl flex gap-6 justify-center">
        <div class="flex-1 min-w-0">
        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            基层服务项目
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🌾 基层服务招聘</h2>
          <p class="text-gray-500">三支一扶、西部计划等基层项目岗位，助力基层发展</p>
        </div>

        <EmploymentTabs module="grassroots" />

        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入岗位名称、组织单位或服务单位" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">
              搜索
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="projectType" placeholder="项目类型" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in projectTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="year" placeholder="招募年份" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in yearOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="serviceType" placeholder="服务类型" clearable class="!w-[160px]" @change="onSearch">
              <el-option v-for="opt in serviceTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="province" placeholder="省份" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in provinceOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="city" type="text" placeholder="城市" class="!w-[110px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <input v-model="county" type="text" placeholder="区县" class="!w-[110px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="majorRequirement" type="text" placeholder="专业要求" class="!w-[130px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" @change="onSearch" />
            <el-select v-model="gradYearRequirement" placeholder="毕业年份" clearable class="!w-[120px]" @change="onSearch">
              <el-option v-for="opt in gradYearOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="politicalStatus" placeholder="政治面貌" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in politicalStatusOptions" :key="opt" :label="opt" :value="opt" />
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
            {{ loading ? '加载中...' : `共找到 ${total} 个基层服务岗位` }}
          </h3>
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-gradient-to-b from-orange-50/40 to-white p-6 shadow-lg border border-orange-100 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">基层服务</span>
                <span v-if="job.projectType" class="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">{{ job.projectType }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招募中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                  {{ job.positionStatus }}
                </span>
              </div>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
              {{ job.positionName }}
            </h4>

            <p class="text-sm text-gray-500 mb-3">
              {{ job.organizingDept }}
              <span v-if="job.serviceUnit"> · {{ job.serviceUnit }}</span>
              <span v-if="job.city"> · {{ job.city }}{{ job.county }}</span>
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.serviceType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                {{ job.serviceType }}
              </span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span v-if="job.educationRequirement" class="text-gray-400">{{ job.educationRequirement }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
              <span v-if="job.servicePeriod" class="text-gray-400">{{ job.servicePeriod }}</span>
            </div>

            <p v-if="job.regStartDate || job.regEndDate" class="mt-2 text-xs text-gray-400">
              报名：{{ formatDateRange(job.regStartDate, job.regEndDate) }}
            </p>

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
            暂无基层服务岗位
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
