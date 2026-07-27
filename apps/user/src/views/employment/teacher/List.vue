<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import AppHeader from '@/components/AppHeader.vue'
import { ProvinceOptions } from '@haifeng/shared'
import { getTeacherList } from '@/api/employment/teacher'
import type { TeacherPositionListVO, TeacherQueryDTO } from '@/types/employment/teacher'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'

const router = useRouter()

const keyword = ref('')
const schoolType = ref('')
const schoolNature = ref('')
const subject = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const recruitmentCount = ref<number | undefined>(undefined)
const ageLimit = ref<number | undefined>(undefined)
const positionStatus = ref('')
const educationRequirement = ref('')
const degreeRequirement = ref('')
const majorRequirement = ref('')

const schoolTypeOptions = ['幼儿园', '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']
const schoolNatureOptions = ['公办', '民办']
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术', '心理健康', '通用技术', '科学', '道德与法治', '综合实践', '学前教育', '特殊教育', '其他']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
const educationRequirementOptions = ['不限', '大专', '本科', '硕士', '博士']
const degreeRequirementOptions = ['不限', '学士', '硕士', '博士']

const loading = ref(false)
const jobs = ref<TeacherPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): TeacherQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    schoolType: schoolType.value || undefined,
    schoolNature: schoolNature.value || undefined,
    subject: subject.value || undefined,
    province: regionValue.value[0] || undefined,
    city: regionValue.value[1] || undefined,
    district: regionValue.value[2] || undefined,
    recruitmentCount: recruitmentCount.value || undefined,
    ageLimit: ageLimit.value || undefined,
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
    const res = await getTeacherList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取教师招聘列表失败')
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
  schoolType.value = ''
  schoolNature.value = ''
  subject.value = ''
  regionValue.value = []
  recruitmentCount.value = undefined
  ageLimit.value = undefined
  positionStatus.value = ''
  educationRequirement.value = ''
  degreeRequirement.value = ''
  majorRequirement.value = ''
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

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(`/employment/teacher/${id}`)
      router.push({ name: 'Login' })
    } catch {
      // cancelled
    }
    return
  }
  router.push(`/employment/teacher/${id}`)
}

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  return `${start?.slice(0, 10) || ''} ~ ${end?.slice(0, 10) || ''}`
}

const isFilterActive = computed(() => {
  return !!(keyword.value || schoolType.value || schoolNature.value || subject.value || regionValue.value.length > 0 || recruitmentCount.value || ageLimit.value || positionStatus.value || educationRequirement.value || degreeRequirement.value || majorRequirement.value)
})

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <AppHeader :show-nav-links="true" />

    <main class="flex-1">
      <div class="container mx-auto px-6 py-6 flex gap-6">
        <div class="flex-1 min-w-0">
        <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="router.push('/employment/jobs')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            教育行业
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🧑‍🏫 教师招聘</h2>
          <p class="text-gray-500">全国中小学及高校教师岗位，一站式查找</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入学校名称或岗位名称" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">
              搜索
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="schoolType" placeholder="学校类型" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in schoolTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="schoolNature" placeholder="学校性质" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in schoolNatureOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="subject" placeholder="学科" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in subjectOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-cascader v-model="regionValue" :options="regionOptions" placeholder="省份/城市/区县" clearable class="!w-[200px]" @change="onSearch" />
            <el-input-number v-model="recruitmentCount" :min="1" :max="999" placeholder="招聘人数" class="!w-[130px]" controls-position="right" @change="onSearch" />
            <el-input-number v-model="ageLimit" :min="18" :max="100" placeholder="年龄上限" class="!w-[130px]" controls-position="right" @change="onSearch" />
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

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">
              重置
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">
            {{ loading ? '加载中...' : `共找到 ${total} 个教师岗位` }}
          </h3>
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">教师招聘</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                  {{ job.positionStatus }}
                </span>
              </div>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
              {{ job.positionName }}
            </h4>

            <p class="text-sm text-gray-500 mb-3">
              {{ job.schoolName }}
              <span v-if="job.city"> · {{ job.city }}</span>
              <span v-if="job.subject"> · {{ job.subject }}</span>
              <span v-if="job.educationRequirement"> · {{ job.educationRequirement }}</span>
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.recruitmentType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                {{ job.recruitmentType }}
              </span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span class="text-gray-400">{{ job.salaryRange }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
              <span v-if="job.majorRequirement" class="text-gray-400">专业：{{ job.majorRequirement }}</span>
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
            暂无教师招聘岗位
          </div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination background layout="sizes, prev, pager, next, total" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>
        </div>
        <ContentDrawer />
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
