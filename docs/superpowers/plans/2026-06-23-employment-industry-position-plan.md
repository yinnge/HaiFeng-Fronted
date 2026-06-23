# 行业专项招聘（教师/医疗卫生/金融银行）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为教师、医疗卫生、金融银行三个行业招聘分类创建独立的列表页和详情页

**Architecture:** 每个分类有独立的 API 模块、TypeScript 类型、列表页和详情页。三个列表页共用相似模板但筛选字段不同，三个详情页各自展示分类特有字段。统一搜索页的标签点击逻辑改为路由跳转。

**Tech Stack:** Vue 3 Composition API + `<script setup>`, TypeScript, Tailwind CSS, Element Plus, Axios

---

### Task 1: 类型定义（3个模块）

**Files:**
- Create: `apps/user/src/types/employment/teacher/index.ts`
- Create: `apps/user/src/types/employment/healthcare/index.ts`
- Create: `apps/user/src/types/employment/finance/index.ts`

- [ ] **Step 1: 创建教师招聘类型文件**

```typescript
// apps/user/src/types/employment/teacher/index.ts
export interface TeacherQueryDTO {
  page?: number
  size?: number
  keyword?: string
  schoolType?: string
  schoolNature?: string
  subject?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface TeacherPositionListVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city: string
  district: string
  workExperience: string
  recruitmentCount: number
  ageLimit: number
  salaryRange: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface TeacherPositionDetailVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  supervisingDept: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  teacherCertRequirement: string
  teacherCertSubject: string
  putonghuaLevel: string
  otherCertRequirement: string | null
  workExperience: string
  isNormalMajor: string
  salaryRange: string
  benefits: string
  examContent: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  positionStatus: string
  applyLink: string
  contactPhone: string
  remark: string
  content: string
}
```

- [ ] **Step 2: 创建医疗卫生招聘类型文件**

```typescript
// apps/user/src/types/employment/healthcare/index.ts
export interface HealthcareQueryDTO {
  page?: number
  size?: number
  keyword?: string
  institutionLevel?: string
  positionCategory?: string
  department?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface HealthcarePositionListVO {
  id: number
  institutionName: string
  institutionLevel: string
  positionName: string
  department: string
  positionCategory: string
  province: string
  city: string
  district: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  workExperience: string
  positionStatus: string
}

export interface HealthcarePositionDetailVO {
  id: number
  institutionName: string
  institutionType: string
  institutionLevel: string
  institutionNature: string
  positionName: string
  department: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  workExperience: string
  licenseRequirement: string
  titleRequirement: string
  internshipRequirement: string
  researchRequirement: string | null
  salaryRange: string
  benefits: string
  housingSubsidy: string
  regStartDate: string
  regEndDate: string
  examTime: string
  examContent: string
  applyLink: string
  positionStatus: string
  contactPhone: string
  contactPerson: string
  remark: string
  content: string
}
```

- [ ] **Step 3: 创建金融银行招聘类型文件**

```typescript
// apps/user/src/types/employment/finance/index.ts
export interface FinanceQueryDTO {
  page?: number
  size?: number
  keyword?: string
  institutionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  positionStatus?: string
}

export interface FinancePositionListVO {
  id: number
  institutionName: string
  institutionCategory: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  ageLimit: number
  workExperience: string
  salaryMin: number
  salaryMax: number
  regStartDate: string
  regEndDate: string
  isRemote: boolean
  workLocation: string
  recruitmentCount: number
  positionStatus: string
}

export interface FinancePositionDetailVO {
  id: number
  institutionName: string
  institutionCategory: string
  institutionType: string
  institutionLogo: string
  branchName: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  workLocation: string
  isRemote: boolean
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorPreference: string[]
  ageLimit: number
  workExperience: string
  recruitmentCount: number
  certRequirements: string[]
  languageRequirement: string
  computerRequirement: string
  otherRequirement: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  benefits: string
  examContent: string
  examTime: string
  interviewRounds: string
  regStartDate: string
  regEndDate: string
  applyLink: string
  positionStatus: string
  contactInfo: string
  remark: string
  content: string
}
```

---

### Task 2: API 模块（3个模块）

**Files:**
- Create: `apps/user/src/api/employment/teacher/index.ts`
- Create: `apps/user/src/api/employment/healthcare/index.ts`
- Create: `apps/user/src/api/employment/finance/index.ts`

- [ ] **Step 1: 创建教师招聘 API**

```typescript
// apps/user/src/api/employment/teacher/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { TeacherPositionListVO, TeacherPositionDetailVO, TeacherQueryDTO } from '@/types/employment/teacher'

export const getTeacherList = (params: TeacherQueryDTO) => {
  return request.get<R<PageResult<TeacherPositionListVO>>>('/api/v1/app/employment/teacher/list', { params })
}

export const getTeacherDetail = (id: number) => {
  return request.get<R<TeacherPositionDetailVO>>(`/api/v1/app/employment/teacher/${id}/detail`)
}
```

- [ ] **Step 2: 创建医疗卫生 API**

```typescript
// apps/user/src/api/employment/healthcare/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { HealthcarePositionListVO, HealthcarePositionDetailVO, HealthcareQueryDTO } from '@/types/employment/healthcare'

export const getHealthcareList = (params: HealthcareQueryDTO) => {
  return request.get<R<PageResult<HealthcarePositionListVO>>>('/api/v1/app/employment/healthcare/list', { params })
}

export const getHealthcareDetail = (id: number) => {
  return request.get<R<HealthcarePositionDetailVO>>(`/api/v1/app/employment/healthcare/${id}/detail`)
}
```

- [ ] **Step 3: 创建金融银行 API**

```typescript
// apps/user/src/api/employment/finance/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { FinancePositionListVO, FinancePositionDetailVO, FinanceQueryDTO } from '@/types/employment/finance'

export const getFinanceList = (params: FinanceQueryDTO) => {
  return request.get<R<PageResult<FinancePositionListVO>>>('/api/v1/app/employment/finance/list', { params })
}

export const getFinanceDetail = (id: number) => {
  return request.get<R<FinancePositionDetailVO>>(`/api/v1/app/employment/finance/${id}/detail`)
}
```

---

### Task 3: 教师招聘列表页

**Files:**
- Create: `apps/user/src/views/employment/teacher/List.vue`
- Create directories: `apps/user/src/views/employment/teacher/`

- [ ] **Step 1: 创建教师招聘列表页面**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { ProvinceOptions } from '@haifeng/shared'
import { getTeacherList } from '@/api/employment/teacher'
import type { TeacherPositionListVO, TeacherQueryDTO } from '@/types/employment/teacher'

const router = useRouter()

const keyword = ref('')
const schoolType = ref('')
const schoolNature = ref('')
const subject = ref('')
const province = ref('')
const positionStatus = ref('')

const schoolTypeOptions = ['幼儿园', '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']
const schoolNatureOptions = ['公办', '民办']
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术', '心理健康', '通用技术', '科学', '道德与法治', '综合实践', '学前教育', '特殊教育', '其他']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

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
    province: province.value || undefined,
    positionStatus: positionStatus.value || undefined,
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
  province.value = ''
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
  return !!(keyword.value || schoolType.value || schoolNature.value || subject.value || province.value || positionStatus.value)
})

onMounted(fetchList)
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
          <router-link to="/employment/jobs" class="text-orange-500 font-semibold border-b-2 border-orange-500 pb-0.5">
            岗位搜索
          </router-link>
          <button class="text-gray-600 hover:text-orange-500 transition-colors font-medium" @click="goProfile">
            个人中心
          </button>
          <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300" @click="goLogin">
            登录
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="container mx-auto px-6 py-6">
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
            <el-select v-model="province" placeholder="省份" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
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
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.recruitmentType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                {{ job.recruitmentType }}
              </span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span class="text-gray-400">{{ job.salaryRange }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
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
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 4: 教师招聘详情页

**Files:**
- Create: `apps/user/src/views/employment/teacher/Detail.vue`

- [ ] **Step 1: 创建教师招聘详情页面**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getTeacherDetail } from '@/api/employment/teacher'
import type { TeacherPositionDetailVO } from '@/types/employment/teacher'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<TeacherPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getTeacherDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/teacher')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/employment/teacher')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回教师招聘</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">岗位详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <!-- 标题区 -->
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">
                教师招聘
              </span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.schoolName }}<span v-if="job.supervisingDept"> · {{ job.supervisingDept }}</span></p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资待遇</p>
                <p class="font-semibold text-gray-800">{{ job.salaryRange || '面议' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }} {{ job.district }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement || '不限' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘类型</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentType }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount }}人</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">年龄限制</p>
                <p class="font-semibold text-gray-800">{{ job.ageLimit }}岁以下</p>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">学校类型</p>
                <p class="text-gray-800 font-medium">{{ job.schoolType }}</p>
              </div>
              <div>
                <p class="text-gray-400">学校性质</p>
                <p class="text-gray-800 font-medium">{{ job.schoolNature }}</p>
              </div>
              <div>
                <p class="text-gray-400">学科</p>
                <p class="text-gray-800 font-medium">{{ job.subject }}</p>
              </div>
              <div>
                <p class="text-gray-400">专业要求</p>
                <p class="text-gray-800 font-medium">{{ job.majorRequirement || '不限' }}</p>
              </div>
              <div>
                <p class="text-gray-400">学位要求</p>
                <p class="text-gray-800 font-medium">{{ job.degreeRequirement || '不限' }}</p>
              </div>
              <div>
                <p class="text-gray-400">教学经验</p>
                <p class="text-gray-800 font-medium">{{ job.workExperience || '不限' }}</p>
              </div>
              <div>
                <p class="text-gray-400">教师资格证</p>
                <p class="text-gray-800 font-medium">{{ job.teacherCertRequirement || '暂无' }}</p>
              </div>
              <div>
                <p class="text-gray-400">资格证学科</p>
                <p class="text-gray-800 font-medium">{{ job.teacherCertSubject || '不限' }}</p>
              </div>
              <div>
                <p class="text-gray-400">普通话要求</p>
                <p class="text-gray-800 font-medium">{{ job.putonghuaLevel || '不限' }}</p>
              </div>
              <div>
                <p class="text-gray-400">师范要求</p>
                <p class="text-gray-800 font-medium">{{ job.isNormalMajor || '不限' }}</p>
              </div>
            </div>
          </div>

          <!-- 待遇与考试 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">待遇与考试</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">薪资待遇</p>
                <p class="text-gray-800 font-medium">{{ job.salaryRange || '面议' }}</p>
              </div>
              <div>
                <p class="text-gray-400">福利待遇</p>
                <p class="text-gray-800 font-medium">{{ job.benefits || '暂无' }}</p>
              </div>
              <div>
                <p class="text-gray-400">笔试内容</p>
                <p class="text-gray-800 font-medium">{{ job.examContent || '暂无' }}</p>
              </div>
              <div>
                <p class="text-gray-400">面试形式</p>
                <p class="text-gray-800 font-medium">{{ job.interviewForm || '暂无' }}</p>
              </div>
            </div>
          </div>

          <!-- 时间与联系 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">报名时间</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}</p>
              </div>
              <div>
                <p class="text-gray-400">考试时间</p>
                <p class="text-gray-800 font-medium">{{ formatDate(job.examTime) }}</p>
              </div>
              <div>
                <p class="text-gray-400">联系电话</p>
                <p class="text-gray-800 font-medium">{{ job.contactPhone || '暂无' }}</p>
              </div>
              <div>
                <p class="text-gray-400">报名链接</p>
                <a v-if="job.applyLink" :href="job.applyLink" target="_blank" class="text-orange-500 hover:text-orange-600 font-medium">点击报名 →</a>
                <span v-else class="text-gray-800 font-medium">暂无</span>
              </div>
            </div>
            <p v-if="job.remark" class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{{ job.remark }}</p>
          </div>

          <!-- 详细说明 -->
          <div v-if="job.content" class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 prose max-w-none">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细说明</h3>
            <div class="text-sm leading-relaxed" v-html="job.content"></div>
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

---

### Task 5: 医疗卫生招聘列表页

**Files:**
- Create: `apps/user/src/views/employment/healthcare/List.vue`
- Create directories: `apps/user/src/views/employment/healthcare/`

- [ ] **Step 1: 创建医疗卫生招聘列表页面**

与 Task 3 (教师列表) 结构一致，差异：
- API 调用使用 `getHealthcareList`
- 类型使用 `HealthcarePositionListVO, HealthcareQueryDTO`
- 分类标签显示"医疗卫生招聘"
- 筛选器改为：keyword + institutionLevel + positionCategory + department + province + positionStatus
- 卡片显示机构名称（institutionName）和机构等级（institutionLevel）

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { ProvinceOptions } from '@haifeng/shared'
import { getHealthcareList } from '@/api/employment/healthcare'
import type { HealthcarePositionListVO, HealthcareQueryDTO } from '@/types/employment/healthcare'

const router = useRouter()

const keyword = ref('')
const institutionLevel = ref('')
const positionCategory = ref('')
const department = ref('')
const province = ref('')
const positionStatus = ref('')

const institutionLevelOptions = ['三级甲等', '三级乙等', '二级甲等', '二级乙等', '一级', '未定级', '社区']
const positionCategoryOptions = ['临床医师', '护理', '药学', '医技', '公共卫生', '行政后勤', '科研']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const loading = ref(false)
const jobs = ref<HealthcarePositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): HealthcareQueryDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    institutionLevel: institutionLevel.value || undefined,
    positionCategory: positionCategory.value || undefined,
    department: department.value || undefined,
    province: province.value || undefined,
    positionStatus: positionStatus.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getHealthcareList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取医疗卫生招聘列表失败')
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
  institutionLevel.value = ''
  positionCategory.value = ''
  department.value = ''
  province.value = ''
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

function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      userStore.setRedirectPath(`/employment/healthcare/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/healthcare/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || institutionLevel.value || positionCategory.value || department.value || province.value || positionStatus.value)
})

onMounted(fetchList)
</script>

<template>
  <!-- 与教师列表一致，替换分类标题为"医疗卫生招聘"、描述文案、筛选标签和卡片字段 -->
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <img :src="logoMain" alt="海枫未来规划院" class="h-10 w-10 object-contain" />
          <h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
        </div>
        <div class="flex items-center gap-6">
          <router-link to="/employment/jobs" class="text-orange-500 font-semibold border-b-2 border-orange-500 pb-0.5">岗位搜索</router-link>
          <button class="text-gray-600 hover:text-orange-500 transition-colors font-medium" @click="goProfile">个人中心</button>
          <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300" @click="goLogin">登录</button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="container mx-auto px-6 py-6">
        <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="router.push('/employment/jobs')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            医疗健康
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🏥 医疗卫生招聘</h2>
          <p class="text-gray-500">全国医疗卫生机构岗位，公立/民营全覆盖</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入机构名称或岗位名称" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="institutionLevel" placeholder="机构等级" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in institutionLevelOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="positionCategory" placeholder="岗位类别" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="department" placeholder="科室" clearable class="!w-[130px]" @change="onSearch">
              <el-option label="不限" value="" />
            </el-select>
            <el-select v-model="province" placeholder="省份" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">
            {{ loading ? '加载中...' : `共找到 ${total} 个医疗卫生岗位` }}
          </h3>
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">医疗卫生</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                  {{ job.positionStatus }}
                </span>
              </div>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">
              {{ job.institutionName }}
              <span v-if="job.institutionLevel"> · {{ job.institutionLevel }}</span>
              <span v-if="job.city"> · {{ job.city }}</span>
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.positionCategory" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">{{ job.positionCategory }}</span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span class="text-gray-400">{{ job.salaryRange }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
            </div>
          </div>

          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无医疗卫生招聘岗位</div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination background layout="sizes, prev, pager, next, total" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 6: 医疗卫生招聘详情页

**Files:**
- Create: `apps/user/src/views/employment/healthcare/Detail.vue`

- [ ] **Step 1: 创建医疗卫生招聘详情页面**

与 Task 4 (教师详情) 结构一致，差异：
- API 调用使用 `getHealthcareDetail`
- 类型使用 `HealthcarePositionDetailVO`
- 关键信息网格：薪资待遇、工作地点、学历要求、机构等级、招聘人数、年龄上限
- 详细信息：机构类型、机构等级、机构性质、科室、岗位类别、招聘类型、专业要求、学位要求、执业资格证、职称要求、规培要求、工作经验
- 待遇区：薪资待遇、福利待遇、住房补贴、考试内容
- 报名区：报名时间、考试时间、联系电话、联系人、报名链接

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getHealthcareDetail } from '@/api/employment/healthcare'
import type { HealthcarePositionDetailVO } from '@/types/employment/healthcare'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<HealthcarePositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getHealthcareDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/healthcare')
    }
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '暂无'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/employment/healthcare')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回医疗卫生招聘</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">岗位详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <!-- 标题区 -->
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">医疗卫生</span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">{{ job.institutionName }}<span v-if="job.institutionLevel"> · {{ job.institutionLevel }}</span></p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资待遇</p>
                <p class="font-semibold text-gray-800">{{ job.salaryRange || '面议' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }} {{ job.district }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement || '不限' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">机构等级</p>
                <p class="font-semibold text-gray-800">{{ job.institutionLevel }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount }}人</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">年龄限制</p>
                <p class="font-semibold text-gray-800">{{ job.ageLimit }}岁以下</p>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">机构类型</p><p class="text-gray-800 font-medium">{{ job.institutionType }}</p></div>
              <div><p class="text-gray-400">机构等级</p><p class="text-gray-800 font-medium">{{ job.institutionLevel }}</p></div>
              <div><p class="text-gray-400">机构性质</p><p class="text-gray-800 font-medium">{{ job.institutionNature }}</p></div>
              <div><p class="text-gray-400">科室</p><p class="text-gray-800 font-medium">{{ job.department || '不限' }}</p></div>
              <div><p class="text-gray-400">岗位类别</p><p class="text-gray-800 font-medium">{{ job.positionCategory }}</p></div>
              <div><p class="text-gray-400">招聘类型</p><p class="text-gray-800 font-medium">{{ job.recruitmentType }}</p></div>
              <div><p class="text-gray-400">专业要求</p><p class="text-gray-800 font-medium">{{ job.majorRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">学位要求</p><p class="text-gray-800 font-medium">{{ job.degreeRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">执业资格证</p><p class="text-gray-800 font-medium">{{ job.licenseRequirement || '暂无' }}</p></div>
              <div><p class="text-gray-400">职称要求</p><p class="text-gray-800 font-medium">{{ job.titleRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">规培要求</p><p class="text-gray-800 font-medium">{{ job.internshipRequirement || '暂无' }}</p></div>
              <div><p class="text-gray-400">工作经验</p><p class="text-gray-800 font-medium">{{ job.workExperience || '不限' }}</p></div>
            </div>
          </div>

          <!-- 待遇与考试 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">待遇与考试</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">薪资待遇</p><p class="text-gray-800 font-medium">{{ job.salaryRange || '面议' }}</p></div>
              <div><p class="text-gray-400">福利待遇</p><p class="text-gray-800 font-medium">{{ job.benefits || '暂无' }}</p></div>
              <div><p class="text-gray-400">住房补贴</p><p class="text-gray-800 font-medium">{{ job.housingSubsidy || '暂无' }}</p></div>
              <div><p class="text-gray-400">考试内容</p><p class="text-gray-800 font-medium">{{ job.examContent || '暂无' }}</p></div>
            </div>
          </div>

          <!-- 报名信息 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">报名时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}</p></div>
              <div><p class="text-gray-400">考试时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.examTime) }}</p></div>
              <div><p class="text-gray-400">联系电话</p><p class="text-gray-800 font-medium">{{ job.contactPhone || '暂无' }}</p></div>
              <div><p class="text-gray-400">联系人</p><p class="text-gray-800 font-medium">{{ job.contactPerson || '暂无' }}</p></div>
              <div class="md:col-span-2">
                <p class="text-gray-400">报名链接</p>
                <a v-if="job.applyLink" :href="job.applyLink" target="_blank" class="text-orange-500 hover:text-orange-600 font-medium">点击报名 →</a>
                <span v-else class="text-gray-800 font-medium">暂无</span>
              </div>
            </div>
            <p v-if="job.remark" class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{{ job.remark }}</p>
          </div>

          <!-- 详细说明 -->
          <div v-if="job.content" class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细说明</h3>
            <div class="text-sm leading-relaxed" v-html="job.content"></div>
          </div>
        </div>

        <div v-if="!loading && !job" class="py-20 text-center text-gray-400">岗位不存在</div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 7: 金融银行招聘列表页

**Files:**
- Create: `apps/user/src/views/employment/finance/List.vue`
- Create directories: `apps/user/src/views/employment/finance/`

- [ ] **Step 1: 创建金融银行招聘列表页面**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { ProvinceOptions } from '@haifeng/shared'
import { getFinanceList } from '@/api/employment/finance'
import type { FinancePositionListVO, FinanceQueryDTO } from '@/types/employment/finance'

const router = useRouter()

const keyword = ref('')
const institutionCategory = ref('')
const recruitmentType = ref('')
const province = ref('')
const positionStatus = ref('')

const institutionCategoryOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']
const recruitmentTypeOptions = ['秋招', '春招', '社招', '实习', '定向']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

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
    institutionCategory: institutionCategory.value || undefined,
    recruitmentType: recruitmentType.value || undefined,
    province: province.value || undefined,
    positionStatus: positionStatus.value || undefined,
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
  keyword.value = ''
  institutionCategory.value = ''
  recruitmentType.value = ''
  province.value = ''
  positionStatus.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', {
        confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning',
      })
      userStore.setRedirectPath(`/employment/finance/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/finance/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || institutionCategory.value || recruitmentType.value || province.value || positionStatus.value)
})

onMounted(fetchList)
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
          <router-link to="/employment/jobs" class="text-orange-500 font-semibold border-b-2 border-orange-500 pb-0.5">岗位搜索</router-link>
          <button class="text-gray-600 hover:text-orange-500 transition-colors font-medium" @click="goProfile">个人中心</button>
          <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300" @click="goLogin">登录</button>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="container mx-auto px-6 py-6">
        <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="router.push('/employment/jobs')">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            金融行业
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">🏦 金融银行招聘</h2>
          <p class="text-gray-500">银行、证券、保险、基金等金融机构岗位</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="输入机构名称或岗位名称" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-select v-model="institutionCategory" placeholder="机构大类" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in institutionCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="recruitmentType" placeholder="招聘类型" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in recruitmentTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="province" placeholder="省份" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <el-select v-model="positionStatus" placeholder="岗位状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in positionStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">
            {{ loading ? '加载中...' : `共找到 ${total} 个金融银行岗位` }}
          </h3>
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">金融银行</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                  {{ job.positionStatus }}
                </span>
              </div>
            </div>

            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">
              {{ job.institutionName }}
              <span v-if="job.institutionCategory"> · {{ job.institutionCategory }}</span>
              <span v-if="job.city"> · {{ job.city }}</span>
            </p>

            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.recruitmentType" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">{{ job.recruitmentType }}</span>
              <span class="text-gray-400">{{ job.recruitmentCount }}人</span>
              <span class="text-gray-400">{{ formatSalary(job.salaryMin, job.salaryMax) }}</span>
              <span v-if="job.ageLimit" class="text-gray-400">{{ job.ageLimit }}岁以下</span>
            </div>

            <p v-if="job.workLocation" class="mt-2 text-xs text-gray-400">
              {{ job.workLocation }} <span v-if="job.isRemote">· 支持远程</span>
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

          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无金融银行招聘岗位</div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination background layout="sizes, prev, pager, next, total" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 8: 金融银行招聘详情页

**Files:**
- Create: `apps/user/src/views/employment/finance/Detail.vue`

- [ ] **Step 1: 创建金融银行招聘详情页面**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getFinanceDetail } from '@/api/employment/finance'
import type { FinancePositionDetailVO } from '@/types/employment/finance'

const route = useRoute()
const router = useRouter()
const jobId = Number(route.params.id)

const loading = ref(false)
const job = ref<FinancePositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getFinanceDetail(jobId)
    job.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取岗位详情失败'
    ElMessage.error(msg)
    if (e?.response?.status === 404) {
      router.replace('/employment/finance')
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
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/employment/finance')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回金融银行招聘</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">岗位详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="job" class="max-w-3xl mx-auto space-y-6">
          <!-- 标题区 -->
          <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
            <div class="flex items-center gap-3 mb-4">
              <span class="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-600">金融银行</span>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="job.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : job.positionStatus === '即将开始' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">
                {{ job.positionStatus }}
              </span>
            </div>

            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ job.positionName }}</h2>
            <p class="text-gray-500 mb-6">
              {{ job.institutionName }}<span v-if="job.branchName"> · {{ job.branchName }}</span>
            </p>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">薪资范围</p>
                <p class="font-semibold text-gray-800">{{ job.salaryText || formatSalary(job.salaryMin, job.salaryMax) }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">工作地点</p>
                <p class="font-semibold text-gray-800">{{ job.province }} {{ job.city }} {{ job.workLocation }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">学历要求</p>
                <p class="font-semibold text-gray-800">{{ job.educationRequirement || '不限' }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘类型</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentType }}</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">招聘人数</p>
                <p class="font-semibold text-gray-800">{{ job.recruitmentCount }}人</p>
              </div>
              <div class="rounded-xl bg-gray-50 p-4">
                <p class="text-gray-400 mb-1">年龄限制</p>
                <p class="font-semibold text-gray-800">{{ job.ageLimit }}岁以下</p>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">机构大类</p><p class="text-gray-800 font-medium">{{ job.institutionCategory }}</p></div>
              <div><p class="text-gray-400">机构类型</p><p class="text-gray-800 font-medium">{{ job.institutionType }}</p></div>
              <div><p class="text-gray-400">分支机构</p><p class="text-gray-800 font-medium">{{ job.branchName || '无' }}</p></div>
              <div><p class="text-gray-400">岗位类别</p><p class="text-gray-800 font-medium">{{ job.positionCategory }}</p></div>
              <div><p class="text-gray-400">专业要求</p><p class="text-gray-800 font-medium">{{ job.majorRequirement || '不限' }}</p></div>
              <div><p class="text-gray-400">学位要求</p><p class="text-gray-800 font-medium">{{ job.degreeRequirement || '不限' }}</p></div>

              <!-- 优先专业 JSONB -->
              <div v-if="job.majorPreference?.length" class="md:col-span-2">
                <p class="text-gray-400 mb-1">优先专业</p>
                <div class="flex flex-wrap gap-1">
                  <el-tag v-for="item in job.majorPreference" :key="item" size="small">{{ item }}</el-tag>
                </div>
              </div>

              <!-- 证书要求 JSONB -->
              <div v-if="job.certRequirements?.length" class="md:col-span-2">
                <p class="text-gray-400 mb-1">证书要求</p>
                <div class="flex flex-wrap gap-1">
                  <el-tag v-for="item in job.certRequirements" :key="item" size="small">{{ item }}</el-tag>
                </div>
              </div>

              <div><p class="text-gray-400">语言要求</p><p class="text-gray-800 font-medium">{{ job.languageRequirement || '暂无' }}</p></div>
              <div><p class="text-gray-400">计算机要求</p><p class="text-gray-800 font-medium">{{ job.computerRequirement || '暂无' }}</p></div>
              <div class="md:col-span-2"><p class="text-gray-400">其他要求</p><p class="text-gray-800 font-medium">{{ job.otherRequirement || '暂无' }}</p></div>
            </div>
          </div>

          <!-- 待遇与考试 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">待遇与考试</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">薪资说明</p><p class="text-gray-800 font-medium">{{ job.salaryText || '面议' }}</p></div>
              <div><p class="text-gray-400">福利待遇</p><p class="text-gray-800 font-medium">{{ job.benefits || '暂无' }}</p></div>
              <div><p class="text-gray-400">考试内容</p><p class="text-gray-800 font-medium">{{ job.examContent || '暂无' }}</p></div>
              <div><p class="text-gray-400">面试轮次</p><p class="text-gray-800 font-medium">{{ job.interviewRounds || '暂无' }}</p></div>
            </div>
          </div>

          <!-- 报名信息 -->
          <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><p class="text-gray-400">报名时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.regStartDate) }} ~ {{ formatDate(job.regEndDate) }}</p></div>
              <div><p class="text-gray-400">考试时间</p><p class="text-gray-800 font-medium">{{ formatDate(job.examTime) }}</p></div>
              <div><p class="text-gray-400">联系方式</p><p class="text-gray-800 font-medium">{{ job.contactInfo || '暂无' }}</p></div>
              <div><p class="text-gray-400">报名链接</p>
                <a v-if="job.applyLink" :href="job.applyLink" target="_blank" class="text-orange-500 hover:text-orange-600 font-medium">点击报名 →</a>
                <span v-else class="text-gray-800 font-medium">暂无</span>
              </div>
            </div>
            <p v-if="job.remark" class="mt-4 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{{ job.remark }}</p>
          </div>

          <!-- 详细说明 -->
          <div v-if="job.content" class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="text-lg font-bold text-gray-800 mb-4">详细说明</h3>
            <div class="text-sm leading-relaxed" v-html="job.content"></div>
          </div>
        </div>

        <div v-if="!loading && !job" class="py-20 text-center text-gray-400">岗位不存在</div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 9: 路由配置 & 统一搜索页改造

**Files:**
- Modify: `apps/user/src/router/index.ts`
- Modify: `apps/user/src/views/employment/jobs/index.vue`

- [ ] **Step 1: 路由新增 6 条记录**

在 `router/index.ts` 的 `EmploymentJobDetail` 路由之后，`NotFound` 之前添加：

```typescript
{
  path: '/employment/teacher',
  name: 'EmploymentTeacherList',
  component: () => import('@/views/employment/teacher/List.vue'),
  meta: { title: '教师招聘' },
},
{
  path: '/employment/teacher/:id',
  name: 'EmploymentTeacherDetail',
  component: () => import('@/views/employment/teacher/Detail.vue'),
  meta: { title: '教师岗位详情', requiresAuth: true },
},
{
  path: '/employment/healthcare',
  name: 'EmploymentHealthcareList',
  component: () => import('@/views/employment/healthcare/List.vue'),
  meta: { title: '医疗卫生招聘' },
},
{
  path: '/employment/healthcare/:id',
  name: 'EmploymentHealthcareDetail',
  component: () => import('@/views/employment/healthcare/Detail.vue'),
  meta: { title: '医疗卫生岗位详情', requiresAuth: true },
},
{
  path: '/employment/finance',
  name: 'EmploymentFinanceList',
  component: () => import('@/views/employment/finance/List.vue'),
  meta: { title: '金融银行招聘' },
},
{
  path: '/employment/finance/:id',
  name: 'EmploymentFinanceDetail',
  component: () => import('@/views/employment/finance/Detail.vue'),
  meta: { title: '金融银行岗位详情', requiresAuth: true },
},
```

- [ ] **Step 2: 改造统一搜索页标签跳转**

在 `views/employment/jobs/index.vue` 中修改 `onCategoryTabClick`：

```typescript
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
  activeCategory.value = value
  page.value = 1
  fetchJobs()
}
```

---

### Task 10: 验证

- [ ] **Step 1: TypeScript 编译检查**

```bash
npx vue-tsc --noEmit
```
Expected: 无类型错误

- [ ] **Step 2: 开发服务器启动**

```bash
pnpm --filter @haifeng/user dev
```
Expected: 开发服务器启动成功，Vite 无报错

- [ ] **Step 3: 手动验证路由可访问**

验证以下页面正常渲染：
- `/employment/teacher` → 教师列表页
- `/employment/healthcare` → 医疗卫生列表页
- `/employment/finance` → 金融银行列表页

验证统一搜索页标签点击路由跳转：
- 点击"教师" → 跳转 `/employment/teacher`
- 点击"医疗卫生" → 跳转 `/employment/healthcare`
- 点击"金融银行" → 跳转 `/employment/finance`
