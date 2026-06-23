# C 端统一岗位搜索 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build unified job search page aggregating all job types (civil, institution, enterprise, etc.) in `apps/user/`

**Architecture:** Single-page search with category tabs + fuzzy search + 5 dropdown filters + paginated card list. Detail page requires auth. Backend already patched with `categoryLabel` filter parameter.

**Tech Stack:** Vue 3 Composition API, `<script setup>`, TypeScript, Tailwind CSS, Element Plus, Axios

---

### Task 1: Type Definitions (employment/jobIndex)

**Files:**
- Create: `apps/user/src/types/employment/jobIndex/index.ts`

- [ ] Create the directory and type file

```bash
New-Item -ItemType Directory -Path "apps/user/src/types/employment/jobIndex" -Force
```

```typescript
// apps/user/src/types/employment/jobIndex/index.ts
export interface JobSearchDTO {
  page?: number
  size?: number
  keyword?: string
  province?: string
  city?: string
  educationRequirement?: string
  recruitmentType?: string
  salaryMin?: number
  salaryMax?: number
  positionStatus?: string
  categoryLabel?: string
}

export interface JobIndexListVO {
  id: number
  categoryLabel: string
  positionName: string
  organizationName: string
  city: string
  educationRequirement: string
  recruitmentType: string
  salaryText: string
  positionStatus: string
}

export interface JobIndexDetailVO {
  id: number
  sourceType: string
  sourceId: number
  categoryLabel: string
  positionName: string
  organizationName: string
  organizationLogo: string
  province: string
  city: string
  educationRequirement: string
  recruitmentCount: number
  recruitmentType: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  positionStatus: string
  publishDate: string
  regDeadline: string
  isHot: boolean
  viewCount: number
  applyCount: number
}
```

- [ ] Commit

```bash
git add apps/user/src/types/employment/jobIndex/index.ts
git commit -m "feat(user): add job index type definitions"
```

---

### Task 2: API Layer

**Files:**
- Create: `apps/user/src/api/employment/jobIndex/index.ts`

- [ ] Create the directory and API file

```bash
New-Item -ItemType Directory -Path "apps/user/src/api/employment/jobIndex" -Force
```

```typescript
// apps/user/src/api/employment/jobIndex/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { JobIndexListVO, JobIndexDetailVO, JobSearchDTO } from '@/types/employment/jobIndex'

export const getJobList = (params: JobSearchDTO) => {
  return request.get<R<PageResult<JobIndexListVO>>>('/api/v1/app/employment/job/list', { params })
}

export const getJobDetail = (id: number) => {
  return request.get<R<JobIndexDetailVO>>(`/api/v1/app/employment/job/${id}/detail`)
}
```

- [ ] Commit

```bash
git add apps/user/src/api/employment/jobIndex/index.ts
git commit -m "feat(user): add job index API layer"
```

---

### Task 3: Router Configuration

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] Add employment routes after existing routes (before the 404 catch-all)

Add after the enterprise routes block (before the `/:pathMatch(.*)*` route):

```typescript
  {
    path: '/employment/jobs',
    name: 'EmploymentJobList',
    component: () => import('@/views/employment/jobs/index.vue'),
    meta: { title: '统一岗位搜索' },
  },
  {
    path: '/employment/job/:id',
    name: 'EmploymentJobDetail',
    component: () => import('@/views/employment/job/Detail.vue'),
    meta: { title: '岗位详情', requiresAuth: true },
  },
```

- [ ] Commit

```bash
git add apps/user/src/router/index.ts
git commit -m "feat(user): add employment routes"
```

---

### Task 4: Job Search List Page

**Files:**
- Create: `apps/user/src/views/employment/jobs/index.vue`

- [ ] Create directory

```bash
New-Item -ItemType Directory -Path "apps/user/src/views/employment/jobs" -Force
```

- [ ] Write the main search list page component

```vue
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

const router = useRouter()

// Category tabs config
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

// Search & filter state
const keyword = ref('')
const province = ref('')
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

// List state
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
    province: province.value || undefined,
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
  province.value = ''
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
  return !!(keyword.value || province.value || educationRequirement.value || recruitmentType.value || positionStatus.value || salaryRange.value)
})

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <!-- Header -->
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
      <!-- Intro Section -->
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

      <!-- Category Tabs -->
      <div class="container mx-auto px-6 pb-6">
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

      <!-- Search & Filter Area -->
      <div class="container mx-auto px-6 pb-8">
        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <!-- Fuzzy Search -->
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

          <!-- Precise Filters -->
          <div class="flex flex-wrap items-center gap-3">
            <el-select
              v-model="province"
              placeholder="省份/城市"
              clearable
              class="!w-[150px]"
              @change="onSearch"
            >
              <el-option
                v-for="opt in ProvinceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

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

      <!-- Results -->
      <div class="container mx-auto px-6 pb-16">
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

        <!-- Job Cards -->
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

        <!-- Bottom Pagination -->
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
    </main>

    <SiteFooter />
  </div>
</template>
```



- [ ] Commit

```bash
git add apps/user/src/views/employment/jobs/index.vue
git commit -m "feat(user): add unified job search list page"
```

---

### Task 5: Job Detail Page

**Files:**
- Create: `apps/user/src/views/employment/job/Detail.vue`

- [ ] Create directory

```bash
New-Item -ItemType Directory -Path "apps/user/src/views/employment/job" -Force
```

- [ ] Write detail page

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getJobDetail } from '@/api/employment/jobIndex'
import type { JobIndexDetailVO } from '@/types/employment/jobIndex'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<JobIndexDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getJobDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/jobs')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无'
  return dateStr.slice(0, 10)
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '薪资面议'
  if (min != null && max != null) return `${min}k-${max}k/月`
  if (min != null) return `${min}k起/月`
  return `最高${max}k/月`
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button
          class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          @click="router.push('/employment/jobs')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回岗位列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">岗位详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <!-- Header Card -->
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                {{ job.categoryLabel }}
              </span>
              <span
                class="rounded-full px-3 py-1 text-sm font-medium"
                :class="job.positionStatus === '招聘中'
                  ? 'bg-green-50 text-green-600'
                  : job.positionStatus === '即将开始'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'"
              >
                {{ job.positionStatus }}
              </span>
              <span v-if="job.isHot" class="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-500">
                🔥 热门
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.organizationName }}</p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资</p>
                <p class="font-semibold text-gray-800">{{ formatSalary(job.salaryMin, job.salaryMax) }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招录人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount ?? '未知' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘类型</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentType }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">报名截止</p>
                <p class="font-semibold text-gray-800">{{ formatDate(job.regDeadline) }}</p>
              </div>
            </div>
          </div>

          <!-- Stats Card -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="flex items-center justify-around text-center">
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.viewCount ?? 0 }}</p>
                <p class="text-sm text-gray-400">浏览量</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.applyCount ?? 0 }}</p>
                <p class="text-sm text-gray-400">报名人数</p>
              </div>
              <div class="w-px h-12 bg-gray-200"></div>
              <div>
                <p class="text-2xl font-bold text-gray-800">{{ job.recruitmentCount ?? '—' }}</p>
                <p class="text-sm text-gray-400">招录人数</p>
              </div>
            </div>
          </div>

          <!-- Date Info -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">发布日期</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.publishDate) }}</p>
              </div>
              <div>
                <p class="text-gray-400">报名截止</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.regDeadline) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && !job" class="py-20 text-center text-gray-400">
          岗位不存在
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

- [ ] Commit

```bash
git add apps/user/src/views/employment/job/Detail.vue
git commit -m "feat(user): add job detail page"
```

---

### Task 6: Add Nav Link to Homepage Header

**Files:**
- Modify: `apps/user/src/views/home/index.vue`

- [ ] Add "岗位搜索" nav link after the logo/title in the header

Find the header section and add a nav link between the title and the "个人中心" button:

```vue
<h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
```

Change to include nav links. Find the div containing `个人中心` button and add a router-link before it:

Look for:
```html
<button
  class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
  @click="goProfile"
>
  个人中心
</button>
```

Add a router-link before it:
```html
<router-link
  to="/employment/jobs"
  class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
>
  岗位搜索
</router-link>
```

- [ ] Commit

```bash
git add apps/user/src/views/home/index.vue
git commit -m "feat(user): add job search link to homepage header"
```
