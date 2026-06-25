<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { ProvinceOptions } from '@haifeng/shared'
import { getJobList } from '@/api/employment/jobIndex'
import type { JobIndexListVO, JobSearchDTO } from '@/types/employment/jobIndex'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'
import ContentDrawer from '@/components/employment/ContentDrawer.vue'

const router = useRouter()

const categoryTabs = [
  { label: '全部', value: '' },
  { label: '公务员', value: '公务员' },
  { label: '事业编', value: '事业编' },
  { label: '军队文职', value: '军队文职' },
  { label: '企业招聘', value: '企业招聘' },
  { label: '选调生', value: '选调生' },
  { label: '教师', value: '教师' },
  { label: '医疗卫生', value: '医疗卫生' },
  { label: '金融银行', value: '金融银行' },
  { label: '基层服务', value: '基层服务' },
  { label: '社区', value: '社区工作者' },
  { label: '公益岗', value: '公益岗' },
]

const activeCategory = ref('')
const keyword = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const educationRequirement = ref('')
const recruitmentType = ref('')
const positionStatus = ref('')
const salaryRange = ref('')

const salaryMap: Record<string, { min: number | null; max: number | null }> = {
  '': { min: null, max: null },
  '5k以下': { min: null, max: 5 },
  '5k-10k': { min: 5, max: 10 },
  '10k-20k': { min: 10, max: 20 },
  '20k以上': { min: 20, max: null },
}

const educationOptions = ['', '大专', '本科', '硕士', '博士']
const recruitmentTypeOptions = ['', '国考', '省考', '校招', '社招', '春招', '秋招']
const positionStatusOptions = ['', '招聘中', '已结束', '即将开始']
const salaryRangeOptions = ['', '5k以下', '5k-10k', '10k-20k', '20k以上']

const loading = ref(false)
const jobs = ref<JobIndexListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): JobSearchDTO {
  const salary = salaryMap[salaryRange.value] || { min: null, max: null }
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    province: regionValue.value[0] || undefined,
    city: regionValue.value[1] || undefined,
    educationRequirement: educationRequirement.value || undefined,
    recruitmentType: recruitmentType.value || undefined,
    positionStatus: positionStatus.value || undefined,
    categoryLabel: activeCategory.value || undefined,
    salaryMin: salary.min ?? undefined,
    salaryMax: salary.max ?? undefined,
  }
}

async function fetchJobs() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getJobList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取岗位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onCategoryTabClick(value: string) {
  if (value === '教师') {
    router.push('/employment/teacher')
    return
  }
  if (value === '医疗卫生') {
    router.push('/employment/healthcare')
    return
  }
  if (value === '金融银行') {
    router.push('/employment/finance')
    return
  }
  if (value === '基层服务') {
    router.push('/employment/grassroots')
    return
  }
  if (value === '社区工作者') {
    router.push('/employment/community')
    return
  }
  if (value === '公益岗') {
    router.push('/employment/welfare')
    return
  }
  if (value === '公务员') {
    router.push('/employment/civil')
    return
  }
  if (value === '事业编') {
    router.push('/employment/institution')
    return
  }
  if (value === '军队文职') {
    router.push('/employment/military')
    return
  }
  if (value === '选调生') {
    router.push('/employment/selection')
    return
  }
  activeCategory.value = value
  page.value = 1
  fetchJobs()
}

function onSearch() {
  page.value = 1
  fetchJobs()
}

function onReset() {
  keyword.value = ''
  regionValue.value = []
  educationRequirement.value = ''
  recruitmentType.value = ''
  positionStatus.value = ''
  salaryRange.value = ''
  page.value = 1
  fetchJobs()
}

function onPageChange(newPage: number) {
  page.value = newPage
  fetchJobs()
}

function onPageSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  fetchJobs()
}

function goLogin() {
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm(
        '请先登录查看详情',
        '提示',
        {
          confirmButtonText: '前往登录',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      userStore.setRedirectPath(`/employment/job/${id}`)
      router.push({ name: 'Login' })
    } catch {
      // cancelled
    }
    return
  }
  router.push(`/employment/job/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || regionValue.value.length > 0 || educationRequirement.value || recruitmentType.value || positionStatus.value || salaryRange.value)
})

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <img :src="logoMain" alt="海枫未来规划院" class="h-10 w-10 object-contain" />
          <h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
        </div>
        <div class="flex items-center gap-6">
          <router-link
            to="/employment/jobs"
            class="text-orange-500 font-semibold border-b-2 border-orange-500 pb-0.5"
          >
            岗位搜索
          </router-link>
          <button
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
            @click="goProfile"
          >
            个人中心
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            @click="goLogin"
          >
            登录
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          全站岗位聚合
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          🎯 统一岗位搜索
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500 leading-relaxed">
          全站岗位一站式聚合，公务员、事业编、企业招聘等各类热门岗位，助你找到理想工作
        </p>
      </div>

      <div class="container mx-auto px-6 pb-16">
        <div class="flex gap-6">
          <div class="flex-1 min-w-0">
            <div class="pb-6">
              <div class="flex flex-wrap items-center justify-center gap-2">
                <button
                  v-for="tab in categoryTabs"
                  :key="tab.value"
                  class="rounded-full px-4 py-2 text-sm font-medium transition-all"
                  :class="activeCategory === tab.value
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
                  @click="onCategoryTabClick(tab.value)"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div class="pb-8">
              <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="flex gap-3 mb-4">
                  <input
                    v-model="keyword"
                    type="text"
                    placeholder="输入岗位名称或企业名称"
                    class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                    @keyup.enter="onSearch"
                  />
                  <button
                    class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                    @click="onSearch"
                  >
                    搜索
                  </button>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <el-cascader
                    v-model="regionValue"
                    :options="regionOptions"
                    placeholder="省份/城市/区县"
                    clearable
                    class="!w-[200px]"
                    @change="onSearch"
                  />

                  <el-select
                    v-model="educationRequirement"
                    placeholder="学历要求"
                    clearable
                    class="!w-[130px]"
                    @change="onSearch"
                  >
                    <el-option
                      v-for="opt in educationOptions"
                      :key="opt"
                      :label="opt || '不限'"
                      :value="opt"
                    />
                  </el-select>

                  <el-select
                    v-model="recruitmentType"
                    placeholder="招聘类型"
                    clearable
                    class="!w-[140px]"
                    @change="onSearch"
                  >
                    <el-option
                      v-for="opt in recruitmentTypeOptions"
                      :key="opt"
                      :label="opt || '不限'"
                      :value="opt"
                    />
                  </el-select>

                  <el-select
                    v-model="positionStatus"
                    placeholder="岗位状态"
                    clearable
                    class="!w-[140px]"
                    @change="onSearch"
                  >
                    <el-option
                      v-for="opt in positionStatusOptions"
                      :key="opt"
                      :label="opt || '不限'"
                      :value="opt"
                    />
                  </el-select>

                  <el-select
                    v-model="salaryRange"
                    placeholder="薪资范围"
                    clearable
                    class="!w-[140px]"
                    @change="onSearch"
                  >
                    <el-option
                      v-for="opt in salaryRangeOptions"
                      :key="opt"
                      :label="opt || '不限'"
                      :value="opt"
                    />
                  </el-select>

                  <button
                    v-if="isFilterActive"
                    class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all"
                    @click="onReset"
                  >
                    重置
                  </button>
                </div>
              </div>
            </div>

            <div class="pb-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800">
                  {{ loading ? '加载中...' : `共找到 ${total} 个岗位` }}
                </h3>
                <el-pagination
                  v-if="!loading && total > 0"
                  small
                  background
                  layout="sizes, prev, pager, next"
                  :total="total"
                  :page-size="pageSize"
                  :current-page="page"
                  :page-sizes="[10, 20, 30, 50, 100]"
                  @current-change="onPageChange"
                  @size-change="onPageSizeChange"
                />
              </div>

              <div v-loading="loading" class="space-y-4 min-h-[300px]">
                <div
                  v-for="job in jobs"
                  :key="job.id"
                  class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                  @click="goDetail(job.id)"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                        {{ job.categoryLabel }}
                      </span>
                      <span
                        class="rounded-full px-3 py-1 text-xs font-medium"
                        :class="job.positionStatus === '招聘中'
                          ? 'bg-green-50 text-green-600'
                          : job.positionStatus === '即将开始'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-100 text-gray-500'"
                      >
                        {{ job.positionStatus }}
                      </span>
                    </div>
                  </div>

                  <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">
                    {{ job.positionName }}
                  </h4>

                  <p class="text-sm text-gray-500 mb-3">
                    {{ job.organizationName }}
                    <span v-if="job.city"> · {{ job.city }}</span>
                    <span v-if="job.educationRequirement"> · {{ job.educationRequirement }}</span>
                    <span v-if="job.salaryText"> · {{ job.salaryText }}</span>
                  </p>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span v-if="job.recruitmentType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                        {{ job.recruitmentType }}
                      </span>
                    </div>
                    <span class="text-sm font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 inline-flex items-center gap-1">
                      查看详情
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">
                  暂无岗位
                </div>
              </div>

              <div v-if="total > pageSize" class="mt-8 flex justify-center">
                <el-pagination
                  background
                  layout="sizes, prev, pager, next, total"
                  :total="total"
                  :page-size="pageSize"
                  :current-page="page"
                  :page-sizes="[10, 20, 30, 50, 100]"
                  @current-change="onPageChange"
                  @size-change="onPageSizeChange"
                />
              </div>
            </div>
          </div>

          <ContentDrawer />
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
