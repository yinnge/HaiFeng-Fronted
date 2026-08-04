<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getInstitutionList, getInstitutionFilters } from '@/api/employment/institution'
import type { InstitutionPositionListVO, InstitutionPositionSearchDTO } from '@/types/employment/institution'
import { InstitutionStatusTag } from '@/types/employment/institution'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'
import EmploymentTabs from '@/components/employment/EmploymentTabs.vue'

const router = useRouter()

const keyword = ref('')
const province = ref('')
const examCategory = ref('')
const positionType = ref('')
const educationRequirement = ref('')
const degreeRequirement = ref('')
const positionStatus = ref('')
const specialPosition = ref('')
const ageLimit = ref<number | undefined>(undefined)

const provinceOptions = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']
const examCategoryOptions = ref<string[]>([])
const positionTypeOptions = ref<string[]>([])
const specialPositionOptions = ref<string[]>([])
const educationOptions = ['无要求', '大专', '本科', '硕士', '博士']
const degreeOptions = ['无要求', '学士', '硕士', '博士']
const statusOptions = ['招聘中', '已结束']

const loading = ref(false)
const jobs = ref<InstitutionPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): InstitutionPositionSearchDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    province: province.value || undefined,
    examCategory: examCategory.value || undefined,
    positionType: positionType.value || undefined,
    educationRequirement: educationRequirement.value || undefined,
    degreeRequirement: degreeRequirement.value || undefined,
    positionStatus: positionStatus.value || undefined,
    specialPosition: specialPosition.value || undefined,
    ageLimit: ageLimit.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getInstitutionList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取事业编职位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch() { page.value = 1; fetchList() }
function onReset() {
  keyword.value = ''; province.value = ''; examCategory.value = ''
  positionType.value = ''; educationRequirement.value = ''; degreeRequirement.value = ''
  positionStatus.value = ''; specialPosition.value = ''; ageLimit.value = undefined
  page.value = 1; fetchList()
}
function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', { confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning' })
      userStore.setRedirectPath(`/employment/institution/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/institution/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || province.value || examCategory.value || positionType.value || educationRequirement.value || degreeRequirement.value || positionStatus.value || specialPosition.value || ageLimit.value)
})

async function fetchFilters() {
  try {
    const res = await getInstitutionFilters()
    const data = res.data.data
    examCategoryOptions.value = data.examCategory || []
    positionTypeOptions.value = data.positionType || []
    specialPositionOptions.value = data.specialPosition || []
  } catch {
    examCategoryOptions.value = []
    positionTypeOptions.value = []
    specialPositionOptions.value = []
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
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">事业编招聘</h2>
          <p class="text-gray-500">事业单位公开招聘职位查询</p>
        </div>

        <EmploymentTabs module="civilService" />

        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="搜索职位名称、主管部门或工作地点" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="province" placeholder="省份" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in provinceOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="examCategory" placeholder="考试类别" clearable class="!w-[190px]" @change="onSearch">
              <el-option v-for="opt in examCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="positionType" placeholder="职位类型" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in positionTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="degreeRequirement" placeholder="学位要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in degreeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input-number v-model="ageLimit" :min="18" :max="65" placeholder="年龄上限" class="!w-[130px]" controls-position="right" @change="onSearch" />
            <el-select v-model="positionStatus" placeholder="职位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="specialPosition" placeholder="特殊岗位" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in specialPositionOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ loading ? '加载中...' : `共找到 ${total} 个事业编职位` }}</h3>
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-gradient-to-b from-orange-50/40 to-white p-6 shadow-lg border border-orange-100 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)] transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">{{ job.positionType || '事业编' }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="InstitutionStatusTag[job.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ job.positionStatus }}</span>
              </div>
            </div>
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ job.supervisingDept }}<span v-if="job.institution"> · {{ job.institution }}</span><span v-if="job.workLocation"> · {{ job.workLocation }}</span></p>
            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span v-if="job.salaryRange" class="text-gray-400">{{ job.salaryRange }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
            </div>
            <div class="mt-3 flex justify-end">
              <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                查看详情 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无事业编职位</div>
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
