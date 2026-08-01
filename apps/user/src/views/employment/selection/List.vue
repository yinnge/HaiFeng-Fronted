<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { getSelectionList } from '@/api/employment/selection'
import type { SelectionPositionListVO, SelectionPositionSearchDTO } from '@/types/employment/selection'
import { SelectionStatusTag } from '@/types/employment/selection'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'

const router = useRouter()

const keyword = ref('')
const selectionType = ref('')
const year = ref('')
const province = ref('')
const majorRequirement = ref('')
const universityRequirement = ref('')
const educationRequirement = ref('')
const degreeRequirement = ref('')
const politicalStatus = ref('')
const positionStatus = ref('')
const ageLimit = ref<number | undefined>(undefined)

const selectionTypeOptions = ['定向选调', '非定向选调', '急需紧缺专业选调']
const educationOptions = ['本科', '硕士', '博士', '本科及以上', '硕士及以上']
const degreeOptions = ['无要求', '学士', '硕士', '博士']
const politicalOptions = ['中共党员', '中共预备党员', '共青团员', '不限']
const statusOptions = ['报名中', '笔试阶段', '面试阶段', '已结束', '即将开始']
const provinceOptions = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear - i))

const loading = ref(false)
const jobs = ref<SelectionPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): SelectionPositionSearchDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    selectionType: selectionType.value || undefined,
    year: year.value || undefined,
    province: province.value || undefined,
    majorRequirement: majorRequirement.value || undefined,
    universityRequirement: universityRequirement.value || undefined,
    educationRequirement: educationRequirement.value || undefined,
    degreeRequirement: degreeRequirement.value || undefined,
    politicalStatus: politicalStatus.value || undefined,
    positionStatus: positionStatus.value || undefined,
    ageLimit: ageLimit.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getSelectionList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取选调生岗位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch() { page.value = 1; fetchList() }
function onReset() {
  keyword.value = ''; selectionType.value = ''; year.value = ''
  province.value = ''; majorRequirement.value = ''; universityRequirement.value = ''
  educationRequirement.value = ''; degreeRequirement.value = ''; politicalStatus.value = ''
  positionStatus.value = ''; ageLimit.value = undefined
  page.value = 1; fetchList()
}
function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
async function goDetail(id: string) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', { confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning' })
      userStore.setRedirectPath(`/employment/selection/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/selection/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || selectionType.value || year.value || province.value || majorRequirement.value || universityRequirement.value || educationRequirement.value || degreeRequirement.value || politicalStatus.value || positionStatus.value || ageLimit.value)
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-6 flex gap-6">
        <div class="flex-1 min-w-0">
        <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="router.push('/employment/jobs')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">选调生招录</h2>
          <p class="text-gray-500">定向选调/非定向选调/急需紧缺专业选调岗位查询</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="搜索岗位名称、录用单位或工作地点" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="selectionType" placeholder="选调类型" clearable class="!w-[160px]" @change="onSearch">
              <el-option v-for="opt in selectionTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="year" placeholder="年份" clearable class="!w-[120px]" @change="onSearch">
              <el-option v-for="opt in yearOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="province" placeholder="省份" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in provinceOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input v-model="majorRequirement" type="text" placeholder="专业要求" class="!w-[120px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <input v-model="universityRequirement" type="text" placeholder="院校要求" class="!w-[120px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <el-select v-model="educationRequirement" placeholder="学历要求" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="degreeRequirement" placeholder="学位要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in degreeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="politicalStatus" placeholder="政治面貌" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in politicalOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input-number v-model="ageLimit" :min="18" :max="40" placeholder="年龄上限" class="!w-[130px]" controls-position="right" @change="onSearch" />
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ loading ? '加载中...' : `共找到 ${total} 个选调生岗位` }}</h3>
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{{ job.selectionType }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="
                  SelectionStatusTag[job.positionStatus] === 'success' ? 'bg-green-50 text-green-600' :
                  SelectionStatusTag[job.positionStatus] === 'primary' ? 'bg-blue-50 text-blue-600' :
                  SelectionStatusTag[job.positionStatus] === 'warning' ? 'bg-orange-50 text-orange-600' :
                  'bg-gray-100 text-gray-500'">{{ job.positionStatus }}</span>
              </div>
            </div>
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ job.targetUnit }}<span v-if="job.workLocation"> · {{ job.workLocation }}</span></p>
            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span v-if="job.educationRequirement" class="text-gray-400">{{ job.educationRequirement }}</span>
              <span v-if="job.year" class="text-gray-400">{{ job.year }}届</span>
              <span v-if="job.politicalStatus" class="text-gray-400">{{ job.politicalStatus }}</span>
            </div>
            <div class="mt-2 text-xs text-gray-400" v-if="job.regStartDate || job.regEndDate">
              报名时间：{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}
            </div>
            <div class="mt-3 flex justify-end">
              <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                查看详情 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </span>
            </div>
          </div>
          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无选调生岗位</div>
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
