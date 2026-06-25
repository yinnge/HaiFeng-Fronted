# 体制内招录模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new employment sub-modules (civil servant, institution, military, selection) to the user-facing app with dedicated list/detail pages

**Architecture:** Each module follows the existing teacher/healthcare/finance pattern: independent types → API → List.vue → Detail.vue, with routes registered in router/index.ts and tab navigation updated in jobs/index.vue

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, Element Plus, Tailwind CSS

---

### Task 1: Create Type Definitions (4 modules)

**Files:**
- Create: `apps/user/src/types/employment/civil/index.ts`
- Create: `apps/user/src/types/employment/institution/index.ts`
- Create: `apps/user/src/types/employment/military/index.ts`
- Create: `apps/user/src/types/employment/selection/index.ts`

- [ ] **Step 1: Create `types/employment/civil/index.ts`**

```typescript
export interface CivilPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  examType?: string
  positionCode?: string
  deptCode?: string
  minEducation?: string
  majorRequirement?: string
  degreeRequirement?: string
  politicalStatus?: string
  examCategory?: string
}

export interface CivilPositionListVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  minEducation: string
  majorRequirement: string
  degreeRequirement: string
  politicalStatus: string
  examCategory: string
  workLocation: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
}

export interface CivilPositionDetailVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  deptCode: string
  positionCode: string
  affiliatedBureau: string
  majorRequirement: string
  minEducation: string
  degreeRequirement: string
  politicalStatus: string
  workExperience: string
  grassrootsExperience: string
  examCategory: string
  interviewRatio: string
  recruitmentCount: number
  hasProfessionalTest: boolean
  workLocation: string
  workLocationDetail: string
  householdRequirement: string
  householdLocation: string
  positionIntro: string
  remark: string
  officialWebsite: string
  contactPhone: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
}

export const CivilExamTypeLabel: Record<string, string> = {
  '国考': '国考',
  '省考': '省考',
}

export const CivilRegStatusLabel: Record<string, string> = {
  '报名中': '报名中',
  '已结束': '已结束',
  '即将开始': '即将开始',
}

export const CivilRegStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '报名中': 'success',
  '已结束': 'danger',
  '即将开始': 'warning',
}
```

- [ ] **Step 2: Create `types/employment/institution/index.ts`**

```typescript
export interface InstitutionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  province?: string
  examCategory?: string
  positionType?: string
  educationRequirement?: string
  degreeRequirement?: string
  positionStatus?: string
  specialPosition?: string
  ageLimit?: number
}

export interface InstitutionPositionListVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  specialPosition: string
  positionStatus: string
}

export interface InstitutionPositionDetailVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  educationRequirement: string
  degreeRequirement: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  majorRequirements: string[]
  specialPosition: string
  otherRequirement: string
  otherRequirementDesc: string
  remarkType: string
  remarkDesc: string
  consultationPhone: string
  supervisionPhone: string
  positionStatus: string
  positionTag: string
  tagText: string
}

export const InstitutionStatusLabel: Record<string, string> = {
  '招聘中': '招聘中',
  '已结束': '已结束',
}

export const InstitutionStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '招聘中': 'success',
  '已结束': 'danger',
}

export const InstitutionTagLabel: Record<string, string> = {
  '热门': '热门',
  '急招': '急招',
  '无': '',
}

export const InstitutionTagType: Record<string, 'danger' | 'warning' | ''> = {
  '热门': 'warning',
  '急招': 'danger',
  '无': '',
}
```

- [ ] **Step 3: Create `types/employment/military/index.ts`**

```typescript
export interface MilitaryPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  positionType?: string
  workLocation?: string
  majorRequirement?: string
  educationRequirement?: string
  positionStatus?: string
}

export interface MilitaryPositionListVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  majorRequirement: string
  educationRequirement: string
  workLocation: string
  salaryRange: string
  regDeadline: string
  positionStatus: string
}

export interface MilitaryPositionDetailVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  majorRequirement: string
  educationRequirement: string
  regDeadline: string
  positionStatus: string
  positionDescription: string
  responsibilities: string[]
  qualifications: string[]
}

export const MilitaryStatusLabel: Record<string, string> = {
  '进行中': '进行中',
  '已结束': '已结束',
}

export const MilitaryStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '进行中': 'success',
  '已结束': 'danger',
}
```

- [ ] **Step 4: Create `types/employment/selection/index.ts`**

```typescript
export interface SelectionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  selectionType?: string
  year?: string
  province?: string
  majorRequirement?: string
  universityRequirement?: string
  educationRequirement?: string
  degreeRequirement?: string
  politicalStatus?: string
  positionStatus?: string
  ageLimit?: number
}

export interface SelectionPositionListVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  majorRequirement: string
  universityRequirement: string
  educationRequirement: string
  degreeRequirement: string
  trainingDirection: string
  politicalStatus: string
  ageLimit: number
  recruitmentCount: number
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface SelectionPositionDetailVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  trainingDirection: string
  grassrootsServiceYears: string
  trainingPlan: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorCategories: string[]
  universityRequirement: string
  targetUniversities: string[]
  politicalStatus: string
  studentCadreRequirement: string
  awardsRequirement: string
  ageLimit: number
  recruitmentCount: number
  examSubjects: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  applyLink: string
  positionStatus: string
  remark: string
  contactPhone: string
  officialLink: string
  content: string
}

export const SelectionTypeLabel: Record<string, string> = {
  '定向选调': '定向选调',
  '非定向选调': '非定向选调',
  '急需紧缺专业选调': '急需紧缺专业选调',
}

export const SelectionStatusLabel: Record<string, string> = {
  '报名中': '报名中',
  '笔试阶段': '笔试阶段',
  '面试阶段': '面试阶段',
  '已结束': '已结束',
  '即将开始': '即将开始',
}

export const SelectionStatusTag: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
  '报名中': 'success',
  '笔试阶段': 'primary',
  '面试阶段': 'warning',
  '已结束': 'danger',
  '即将开始': 'info',
}

export const SelectionPoliticalLabel: Record<string, string> = {
  '中共党员': '中共党员',
  '中共预备党员': '中共预备党员',
  '共青团员': '共青团员',
  '不限': '不限',
}
```

---

### Task 2: Create API Files (4 modules)

**Files:**
- Create: `apps/user/src/api/employment/civil/index.ts`
- Create: `apps/user/src/api/employment/institution/index.ts`
- Create: `apps/user/src/api/employment/military/index.ts`
- Create: `apps/user/src/api/employment/selection/index.ts`

- [ ] **Step 1: Create `api/employment/civil/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { CivilPositionListVO, CivilPositionDetailVO, CivilPositionSearchDTO } from '@/types/employment/civil'

export const getCivilList = (params: CivilPositionSearchDTO) => {
  return request.get<R<PageResult<CivilPositionListVO>>>('/api/v1/app/employment/civil-service/position/list', { params })
}

export const getCivilDetail = (id: number) => {
  return request.get<R<CivilPositionDetailVO>>(`/api/v1/app/employment/civil-service/position/${id}/detail`)
}
```

- [ ] **Step 2: Create `api/employment/institution/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { InstitutionPositionListVO, InstitutionPositionDetailVO, InstitutionPositionSearchDTO } from '@/types/employment/institution'

export const getInstitutionList = (params: InstitutionPositionSearchDTO) => {
  return request.get<R<PageResult<InstitutionPositionListVO>>>('/api/v1/app/employment/civil-service/institution/list', { params })
}

export const getInstitutionDetail = (id: number) => {
  return request.get<R<InstitutionPositionDetailVO>>(`/api/v1/app/employment/civil-service/institution/${id}/detail`)
}
```

- [ ] **Step 3: Create `api/employment/military/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { MilitaryPositionListVO, MilitaryPositionDetailVO, MilitaryPositionSearchDTO } from '@/types/employment/military'

export const getMilitaryList = (params: MilitaryPositionSearchDTO) => {
  return request.get<R<PageResult<MilitaryPositionListVO>>>('/api/v1/app/employment/civil-service/military/list', { params })
}

export const getMilitaryDetail = (id: number) => {
  return request.get<R<MilitaryPositionDetailVO>>(`/api/v1/app/employment/civil-service/military/${id}/detail`)
}
```

- [ ] **Step 4: Create `api/employment/selection/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { SelectionPositionListVO, SelectionPositionDetailVO, SelectionPositionSearchDTO } from '@/types/employment/selection'

export const getSelectionList = (params: SelectionPositionSearchDTO) => {
  return request.get<R<PageResult<SelectionPositionListVO>>>('/api/v1/app/employment/civil-service/selection/list', { params })
}

export const getSelectionDetail = (id: number) => {
  return request.get<R<SelectionPositionDetailVO>>(`/api/v1/app/employment/civil-service/selection/${id}/detail`)
}
```

---

### Task 3: Create Civil List.vue

**Files:**
- Create: `apps/user/src/views/employment/civil/List.vue`

- [ ] **Step 1: Create `views/employment/civil/List.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getCivilList } from '@/api/employment/civil'
import type { CivilPositionListVO, CivilPositionSearchDTO } from '@/types/employment/civil'
import { CivilRegStatusTag } from '@/types/employment/civil'

const router = useRouter()

const keyword = ref('')
const examType = ref('')
const minEducation = ref('')
const degreeRequirement = ref('')
const politicalStatus = ref('')
const positionCode = ref('')
const deptCode = ref('')
const examCategory = ref('')
const regStatus = ref('')

const examTypeOptions = ['国考', '省考']
const examCategoryOptions = ['综合管理类', '行政执法类', '专业技术类', '中央机关及其直属机构', '省级及以下']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const degreeOptions = ['不限', '学士', '硕士', '博士']
const politicalOptions = ['不限', '中共党员', '共青团员', '群众']
const regStatusOptions = ['报名中', '已结束', '即将开始']

const loading = ref(false)
const jobs = ref<CivilPositionListVO[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

function buildParams(): CivilPositionSearchDTO {
  return {
    page: page.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    examType: examType.value || undefined,
    minEducation: minEducation.value || undefined,
    degreeRequirement: degreeRequirement.value || undefined,
    politicalStatus: politicalStatus.value || undefined,
    examCategory: examCategory.value || undefined,
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params = buildParams()
    const res = await getCivilList(params)
    jobs.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取公务员职位列表失败')
    jobs.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function onSearch() { page.value = 1; fetchList() }

function onReset() {
  keyword.value = ''; examType.value = ''; positionCode.value = ''; deptCode.value = ''
  minEducation.value = ''; degreeRequirement.value = ''; politicalStatus.value = ''
  examCategory.value = ''; regStatus.value = ''; page.value = 1; fetchList()
}

function onPageChange(newPage: number) { page.value = newPage; fetchList() }
function onPageSizeChange(newSize: number) { pageSize.value = newSize; page.value = 1; fetchList() }
function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
  const userStore = useUserStore()
  if (!userStore.isLoggedIn()) {
    try {
      await ElMessageBox.confirm('请先登录查看详情', '提示', { confirmButtonText: '前往登录', cancelButtonText: '取消', type: 'warning' })
      userStore.setRedirectPath(`/employment/civil/${id}`)
      router.push({ name: 'Login' })
    } catch { /* cancelled */ }
    return
  }
  router.push(`/employment/civil/${id}`)
}

const isFilterActive = computed(() => {
  return !!(keyword.value || examType.value || positionCode.value || deptCode.value || minEducation.value || degreeRequirement.value || politicalStatus.value || examCategory.value || regStatus.value)
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">公务员考试职位</h2>
          <p class="text-gray-500">国考/省考公务员招录职位查询</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
          <div class="flex gap-3 mb-4">
            <input v-model="keyword" type="text" placeholder="搜索职位名称、招录部门或工作地点" class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all" @click="onSearch">搜索</button>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <input v-model="positionCode" type="text" placeholder="职位代码" class="!w-[110px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <input v-model="deptCode" type="text" placeholder="部门代码" class="!w-[110px] rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors" @keyup.enter="onSearch" />
            <el-select v-model="examType" placeholder="考试类型" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in examTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="minEducation" placeholder="最低学历" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in educationOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="degreeRequirement" placeholder="学位要求" clearable class="!w-[130px]" @change="onSearch">
              <el-option v-for="opt in degreeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="politicalStatus" placeholder="政治面貌" clearable class="!w-[150px]" @change="onSearch">
              <el-option v-for="opt in politicalOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="examCategory" placeholder="考试类别" clearable class="!w-[170px]" @change="onSearch">
              <el-option v-for="opt in examCategoryOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="regStatus" placeholder="报名状态" clearable class="!w-[140px]" @change="onSearch">
              <el-option v-for="opt in regStatusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>

            <button v-if="isFilterActive" class="rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all" @click="onReset">重置</button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-gray-800">{{ loading ? '加载中...' : `共找到 ${total} 个公务员职位` }}</h3>
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{{ job.examType }}</span>
                <span class="rounded-full px-3 py-1 text-xs font-medium" :class="CivilRegStatusTag[job.regStatus] === 'success' ? 'bg-green-50 text-green-600' : CivilRegStatusTag[job.regStatus] === 'warning' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">{{ job.regStatus }}</span>
              </div>
            </div>
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-500 transition-colors">{{ job.positionName }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ job.recruitingDept }}<span v-if="job.workLocation"> · {{ job.workLocation }}</span><span v-if="job.minEducation"> · {{ job.minEducation }}</span></p>
            <div class="flex items-center gap-3 flex-wrap text-sm">
              <span v-if="job.majorRequirement" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">{{ job.majorRequirement }}</span>
              <span v-if="job.applicantCount != null" class="text-gray-400">{{ job.applicantCount }}人报名</span>
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
          <div v-if="!loading && jobs.length === 0" class="py-20 text-center text-gray-400">暂无公务员职位</div>
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

### Task 4: Create Civil Detail.vue

**Files:**
- Create: `apps/user/src/views/employment/civil/Detail.vue`

- [ ] **Step 1: Create `views/employment/civil/Detail.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getCivilDetail } from '@/api/employment/civil'
import type { CivilPositionDetailVO } from '@/types/employment/civil'
import { CivilRegStatusTag } from '@/types/employment/civil'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<CivilPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getCivilDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取职位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/employment/civil')
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '待定'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
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
          <div class="text-gray-600 font-medium">岗位详情</div>
        </div>
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回公务员职位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{{ detail.examType }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="CivilRegStatusTag[detail.regStatus] === 'success' ? 'bg-green-50 text-green-600' : CivilRegStatusTag[detail.regStatus] === 'warning' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'">{{ detail.regStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.recruitingDept }}<span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招录人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">最低学历：</span><span class="text-gray-700">{{ detail.minEducation || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">政治面貌：</span><span class="text-gray-700">{{ detail.politicalStatus || '不限' }}</span></div>
            <div><span class="text-gray-400">报名人数：</span><span class="text-gray-700">{{ detail.applicantCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">面试比例：</span><span class="text-gray-700">{{ detail.interviewRatio || '未知' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">职位详情</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">职位代码：</span><span class="text-gray-700">{{ detail.positionCode || '-' }}</span></div>
            <div><span class="text-gray-400">部门代码：</span><span class="text-gray-700">{{ detail.deptCode || '-' }}</span></div>
            <div><span class="text-gray-400">隶属局/分局：</span><span class="text-gray-700">{{ detail.affiliatedBureau || '-' }}</span></div>
            <div><span class="text-gray-400">考试类别：</span><span class="text-gray-700">{{ detail.examCategory || '-' }}</span></div>
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">工作年限：</span><span class="text-gray-700">{{ detail.workExperience || '无要求' }}</span></div>
            <div><span class="text-gray-400">基层经历：</span><span class="text-gray-700">{{ detail.grassrootsExperience || '无要求' }}</span></div>
            <div><span class="text-gray-400">户籍要求：</span><span class="text-gray-700">{{ detail.householdRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">户籍所在地：</span><span class="text-gray-700">{{ detail.householdLocation || '-' }}</span></div>
            <div><span class="text-gray-400">详细地址：</span><span class="text-gray-700">{{ detail.workLocationDetail || '-' }}</span></div>
          </div>
          <p v-if="detail.positionIntro" class="mt-4 text-sm text-gray-600 leading-relaxed">{{ detail.positionIntro }}</p>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考试信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">专业科目考试：</span><span class="text-gray-700">{{ detail.hasProfessionalTest ? '是' : '否' }}</span></div>
            <div><span class="text-gray-400">面试比例：</span><span class="text-gray-700">{{ detail.interviewRatio || '-' }}</span></div>
          </div>
          <div v-if="detail.officialWebsite" class="mt-4 text-sm">
            <span class="text-gray-400">官方公告：</span>
            <a :href="detail.officialWebsite" target="_blank" class="text-orange-500 hover:underline">{{ detail.officialWebsite }}</a>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名开始：</span><span class="text-gray-700">{{ formatDate(detail.regStartDate) }}</span></div>
            <div><span class="text-gray-400">报名结束：</span><span class="text-gray-700">{{ formatDate(detail.regEndDate) }}</span></div>
            <div><span class="text-gray-400">报名状态：</span><span class="text-gray-700">{{ detail.regStatus }}</span></div>
            <div><span class="text-gray-400">咨询电话：</span><span class="text-gray-700">{{ detail.contactPhone || '-' }}</span></div>
          </div>
          <p v-if="detail.remark" class="mt-4 text-sm text-gray-600 leading-relaxed">备注：{{ detail.remark }}</p>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到职位信息</div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 5: Create Institution List.vue

**Files:**
- Create: `apps/user/src/views/employment/institution/List.vue`

- [ ] **Step 1: Create `views/employment/institution/List.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getInstitutionList } from '@/api/employment/institution'
import type { InstitutionPositionListVO, InstitutionPositionSearchDTO } from '@/types/employment/institution'
import { InstitutionStatusTag } from '@/types/employment/institution'
import { ProvinceOptions } from '@haifeng/shared'

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
const examCategoryOptions = ['A类（综合管理类）', 'B类（社会科学专技类）', 'C类（自然科学专技类）', 'D类（中小学教师类）', 'E类（医疗卫生类）']
const positionTypeOptions = ['管理岗位', '专业技术岗位', '工勤技能岗位']
const specialPositionOptions = ['无', '退役士兵定向', '基层项目定向', '应届生专项', '残疾人专项', '其他']
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
function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">事业编招聘</h2>
          <p class="text-gray-500">事业单位公开招聘职位查询</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
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
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
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
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 6: Create Institution Detail.vue

**Files:**
- Create: `apps/user/src/views/employment/institution/Detail.vue`

- [ ] **Step 1: Create `views/employment/institution/Detail.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getInstitutionDetail } from '@/api/employment/institution'
import type { InstitutionPositionDetailVO } from '@/types/employment/institution'
import { InstitutionStatusTag, InstitutionTagType, InstitutionTagLabel } from '@/types/employment/institution'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<InstitutionPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getInstitutionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取职位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/institution') }
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '待定'
  return dateStr.slice(0, 10)
}

onMounted(fetchDetail)
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
          <div class="text-gray-600 font-medium">岗位详情</div>
        </div>
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回事业编职位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">{{ detail.positionType || '事业编' }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="InstitutionStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
            <span v-if="detail.positionTag && InstitutionTagType[detail.positionTag]" class="rounded-full px-3 py-1 text-xs font-medium" :class="detail.positionTag === '热门' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'">{{ InstitutionTagLabel[detail.positionTag] }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.supervisingDept }}<span v-if="detail.institution"> · {{ detail.institution }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招聘人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">薪资范围：</span><span class="text-gray-700">{{ detail.salaryRange || '面议' }}</span></div>
            <div><span class="text-gray-400">年龄上限：</span><span class="text-gray-700">{{ detail.ageLimit ? `${detail.ageLimit}岁` : '不限' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">考试类别：</span><span class="text-gray-700">{{ detail.examCategory || '-' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">职位子类：</span><span class="text-gray-700">{{ detail.subCategory || '-' }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province || '-' }}</span></div>
            <div><span class="text-gray-400">特殊岗位：</span><span class="text-gray-700">{{ detail.specialPosition || '-' }}</span></div>
            <div><span class="text-gray-400">其他要求：</span><span class="text-gray-700">{{ detail.otherRequirement || '-' }}</span></div>
          </div>
          <p v-if="detail.otherRequirementDesc" class="mt-4 text-sm text-gray-600">{{ detail.otherRequirementDesc }}</p>
          <div v-if="detail.majorRequirements && detail.majorRequirements.length > 0" class="mt-4">
            <span class="text-sm text-gray-400">专业要求：</span>
            <div class="flex flex-wrap gap-2 mt-2">
              <el-tag v-for="m in detail.majorRequirements" :key="m" type="primary" size="small">{{ m }}</el-tag>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">联系与备注</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名截止：</span><span class="text-gray-700">{{ formatDate(detail.regDeadline) }}</span></div>
            <div><span class="text-gray-400">咨询电话：</span><span class="text-gray-700">{{ detail.consultationPhone || '-' }}</span></div>
            <div><span class="text-gray-400">监督电话：</span><span class="text-gray-700">{{ detail.supervisionPhone || '-' }}</span></div>
            <div><span class="text-gray-400">备注类型：</span><span class="text-gray-700">{{ detail.remarkType || '-' }}</span></div>
          </div>
          <p v-if="detail.remarkDesc" class="mt-4 text-sm text-gray-600 leading-relaxed">备注说明：{{ detail.remarkDesc }}</p>
          <p v-if="detail.tagText" class="mt-2 text-sm text-gray-600">{{ detail.tagText }}</p>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到职位信息</div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 7: Create Military List.vue

**Files:**
- Create: `apps/user/src/views/employment/military/List.vue`

- [ ] **Step 1: Create `views/employment/military/List.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getMilitaryList } from '@/api/employment/military'
import type { MilitaryPositionListVO, MilitaryPositionSearchDTO } from '@/types/employment/military'
import { MilitaryStatusTag } from '@/types/employment/military'
import { buildRegionOptions } from '@/utils/regionCascader'
import type { CascaderOption } from '@/utils/regionCascader'

const router = useRouter()

const keyword = ref('')
const positionType = ref('')
const regionValue = ref<string[]>([])
const regionOptions: CascaderOption[] = buildRegionOptions()
const majorRequirement = ref('')
const educationRequirement = ref('')
const positionStatus = ref('')

const positionTypeOptions = ['管理岗位', '专业技术岗位', '技能岗位']
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
    ElMessage.error(e?.response?.data?.msg || '获取军队文职岗位列表失败')
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
function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
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
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          返回岗位搜索
        </button>

        <div class="text-center mb-8">
          <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
            <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            体制内招录
          </div>
          <h2 class="mb-2 text-3xl font-bold text-gray-800">部队文职招聘</h2>
          <p class="text-gray-500">军队文职人员招聘岗位查询</p>
        </div>

        <div class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-8">
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
          <el-pagination v-if="!loading && total > 0" small background layout="sizes, prev, pager, next" :total="total" :page-size="pageSize" :current-page="page" :page-sizes="[10, 20, 30, 50, 100]" @current-change="onPageChange" @size-change="onPageSizeChange" />
        </div>

        <div v-loading="loading" class="space-y-4 min-h-[300px]">
          <div v-for="job in jobs" :key="job.id" class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer" @click="goDetail(job.id)">
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
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 8: Create Military Detail.vue

**Files:**
- Create: `apps/user/src/views/employment/military/Detail.vue`

- [ ] **Step 1: Create `views/employment/military/Detail.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getMilitaryDetail } from '@/api/employment/military'
import type { MilitaryPositionDetailVO } from '@/types/employment/military'
import { MilitaryStatusTag } from '@/types/employment/military'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<MilitaryPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getMilitaryDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取岗位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/military') }
onMounted(fetchDetail)
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
          <div class="text-gray-600 font-medium">岗位详情</div>
        </div>
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回军队文职岗位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">{{ detail.positionType || '军队文职' }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="MilitaryStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.employerUnit }}<span v-if="detail.department"> · {{ detail.department }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">薪资范围：</span><span class="text-gray-700">{{ detail.salaryRange || '面议' }}</span></div>
            <div><span class="text-gray-400">报名截止：</span><span class="text-gray-700">{{ detail.regDeadline || '待定' }}</span></div>
          </div>
        </div>

        <div v-if="detail.positionDescription" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">岗位描述</h3>
          <p class="text-sm text-gray-600 leading-relaxed">{{ detail.positionDescription }}</p>
        </div>

        <div v-if="detail.responsibilities && detail.responsibilities.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">岗位职责</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="item in detail.responsibilities" :key="item" type="success" size="medium">{{ item }}</el-tag>
          </div>
        </div>

        <div v-if="detail.qualifications && detail.qualifications.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">任职资格</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="item in detail.qualifications" :key="item" type="warning" size="medium">{{ item }}</el-tag>
          </div>
        </div>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到岗位信息</div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 9: Create Selection List.vue

**Files:**
- Create: `apps/user/src/views/employment/selection/List.vue`

- [ ] **Step 1: Create `views/employment/selection/List.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getSelectionList } from '@/api/employment/selection'
import type { SelectionPositionListVO, SelectionPositionSearchDTO } from '@/types/employment/selection'
import { SelectionStatusTag } from '@/types/employment/selection'

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
function goLogin() { router.push('/login') }
function goProfile() { router.push('/profile') }

async function goDetail(id: number) {
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
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 10: Create Selection Detail.vue

**Files:**
- Create: `apps/user/src/views/employment/selection/Detail.vue`

- [ ] **Step 1: Create `views/employment/selection/Detail.vue`**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'
import { getSelectionDetail } from '@/api/employment/selection'
import type { SelectionPositionDetailVO } from '@/types/employment/selection'
import { SelectionStatusTag } from '@/types/employment/selection'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const detail = ref<SelectionPositionDetailVO | null>(null)

async function fetchDetail() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await getSelectionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取岗位详情失败')
    router.push('/employment/jobs')
  } finally {
    loading.value = false
  }
}

function goBack() { router.push('/employment/selection') }

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '待定'
  return dateStr.slice(0, 16).replace('T', ' ')
}

onMounted(fetchDetail)
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
          <div class="text-gray-600 font-medium">岗位详情</div>
        </div>
      </div>
    </header>

    <main class="flex-1 container mx-auto px-6 py-6 max-w-3xl" v-loading="loading">
      <button class="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors text-sm mb-4" @click="goBack">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        返回选调生岗位列表
      </button>

      <template v-if="detail">
        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">{{ detail.selectionType }}</span>
            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="
              SelectionStatusTag[detail.positionStatus] === 'success' ? 'bg-green-50 text-green-600' :
              SelectionStatusTag[detail.positionStatus] === 'primary' ? 'bg-blue-50 text-blue-600' :
              SelectionStatusTag[detail.positionStatus] === 'warning' ? 'bg-orange-50 text-orange-600' :
              'bg-gray-100 text-gray-500'">{{ detail.positionStatus }}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.positionName }}</h2>
          <p class="text-gray-500 mb-6">{{ detail.organizingDept }}<span v-if="detail.targetUnit"> · {{ detail.targetUnit }}</span><span v-if="detail.workLocation"> · {{ detail.workLocation }}</span></p>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span class="text-gray-400">招录人数：</span><span class="text-gray-700">{{ detail.recruitmentCount ?? '未知' }}</span></div>
            <div><span class="text-gray-400">年龄上限：</span><span class="text-gray-700">{{ detail.ageLimit ? `${detail.ageLimit}岁` : '不限' }}</span></div>
            <div><span class="text-gray-400">学历要求：</span><span class="text-gray-700">{{ detail.educationRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">学位要求：</span><span class="text-gray-700">{{ detail.degreeRequirement || '不限' }}</span></div>
            <div><span class="text-gray-400">政治面貌：</span><span class="text-gray-700">{{ detail.politicalStatus || '不限' }}</span></div>
            <div><span class="text-gray-400">专业要求：</span><span class="text-gray-700">{{ detail.majorRequirement || '不限' }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">选调类型：</span><span class="text-gray-700">{{ detail.selectionType || '-' }}</span></div>
            <div><span class="text-gray-400">年份：</span><span class="text-gray-700">{{ detail.year || '-' }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province || '-' }}</span></div>
            <div><span class="text-gray-400">培养方向：</span><span class="text-gray-700">{{ detail.trainingDirection || '-' }}</span></div>
            <div><span class="text-gray-400">院校要求：</span><span class="text-gray-700">{{ detail.universityRequirement || '-' }}</span></div>
            <div><span class="text-gray-400">学生干部要求：</span><span class="text-gray-700">{{ detail.studentCadreRequirement || '无要求' }}</span></div>
            <div><span class="text-gray-400">奖励荣誉要求：</span><span class="text-gray-700">{{ detail.awardsRequirement || '无要求' }}</span></div>
            <div><span class="text-gray-400">基层服务年限：</span><span class="text-gray-700">{{ detail.grassrootsServiceYears || '-' }}</span></div>
          </div>
          <p v-if="detail.trainingPlan" class="mt-4 text-sm text-gray-600 leading-relaxed">培养计划：{{ detail.trainingPlan }}</p>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考试与面试</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">考试科目：</span><span class="text-gray-700">{{ detail.examSubjects || '-' }}</span></div>
            <div><span class="text-gray-400">面试形式：</span><span class="text-gray-700">{{ detail.interviewForm || '-' }}</span></div>
            <div v-if="detail.examTime"><span class="text-gray-400">考试时间：</span><span class="text-gray-700">{{ formatDate(detail.examTime) }}</span></div>
          </div>
        </div>

        <div class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">报名信息</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">报名开始：</span><span class="text-gray-700">{{ formatDate(detail.regStartDate) }}</span></div>
            <div><span class="text-gray-400">报名结束：</span><span class="text-gray-700">{{ formatDate(detail.regEndDate) }}</span></div>
            <div><span class="text-gray-400">联系电话：</span><span class="text-gray-700">{{ detail.contactPhone || '-' }}</span></div>
          </div>
          <div class="mt-4 flex flex-wrap gap-4 text-sm">
            <a v-if="detail.applyLink" :href="detail.applyLink" target="_blank" class="text-orange-500 hover:underline">报名链接</a>
            <a v-if="detail.officialLink" :href="detail.officialLink" target="_blank" class="text-orange-500 hover:underline">官方公告</a>
          </div>
        </div>

        <div v-if="detail.targetUniversities && detail.targetUniversities.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">目标院校</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="uni in detail.targetUniversities" :key="uni" type="primary" size="medium">{{ uni }}</el-tag>
          </div>
        </div>

        <div v-if="detail.majorCategories && detail.majorCategories.length > 0" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业类别</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="cat in detail.majorCategories" :key="cat" type="success" size="medium">{{ cat }}</el-tag>
          </div>
        </div>

        <div v-if="detail.content" class="rounded-2xl bg-white p-8 shadow-lg border border-gray-100 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">详细内容</h3>
          <div class="text-sm text-gray-600 leading-relaxed" v-html="detail.content"></div>
        </div>

        <p v-if="detail.remark" class="mt-4 text-sm text-gray-500">备注：{{ detail.remark }}</p>
      </template>

      <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">未找到岗位信息</div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 11: Update Router

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: Add 4 list routes and 4 detail routes**

Append the following route objects to the routes array in `apps/user/src/router/index.ts`, after the existing employment routes (after the `/employment/welfare/:id` route):

```typescript
  {
    path: '/employment/civil',
    name: 'EmploymentCivilList',
    component: () => import('@/views/employment/civil/List.vue'),
  },
  {
    path: '/employment/civil/:id',
    name: 'EmploymentCivilDetail',
    component: () => import('@/views/employment/civil/Detail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/employment/institution',
    name: 'EmploymentInstitutionList',
    component: () => import('@/views/employment/institution/List.vue'),
  },
  {
    path: '/employment/institution/:id',
    name: 'EmploymentInstitutionDetail',
    component: () => import('@/views/employment/institution/Detail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/employment/military',
    name: 'EmploymentMilitaryList',
    component: () => import('@/views/employment/military/List.vue'),
  },
  {
    path: '/employment/military/:id',
    name: 'EmploymentMilitaryDetail',
    component: () => import('@/views/employment/military/Detail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/employment/selection',
    name: 'EmploymentSelectionList',
    component: () => import('@/views/employment/selection/List.vue'),
  },
  {
    path: '/employment/selection/:id',
    name: 'EmploymentSelectionDetail',
    component: () => import('@/views/employment/selection/Detail.vue'),
    meta: { requiresAuth: true },
  },
```

---

### Task 12: Update Unified Search Page Tab Navigation

**Files:**
- Modify: `apps/user/src/views/employment/jobs/index.vue`

- [ ] **Step 1: Add 4 tab navigation branches**

In the `onCategoryTabClick` function in `apps/user/src/views/employment/jobs/index.vue`, add the following 4 new branches before the final `else` that sets `activeCategory.value`:

```typescript
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
```

---

### Task 13: Verify

- [ ] **Step 1: Run TypeScript type check**

```bash
cd apps/user
npx vue-tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: Run build**

```bash
cd apps/user
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 3: Fix any issues found**

If vue-tsc or build reports errors, fix them and re-run until clean.
