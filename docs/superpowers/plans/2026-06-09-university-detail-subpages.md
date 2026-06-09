# 院校详情子页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在院校详情页底部追加"重点实验室/院系/学科评估"三个 Tab，并实现对应的实验室详情页和院系分析报告页。

**Architecture:** Detail.vue 底部追加 3 个卡片式 Tab 按钮，每个 Tab 对应一个子组件（含二级过滤器 + 分页列表）；点击实验室/院系跳转到独立路由详情页。新增 API 封装和类型定义，复用现有 Axios 实例和样式体系。

**Tech Stack:** Vue 3 (Composition API + script setup), TypeScript, Element Plus, Tailwind CSS, Vue Router 4

---

### File Structure

| 文件 | 操作 | 职责 |
|------|------|------|
| `apps/user/src/types/university/laboratory.ts` | Create | 实验室列表/详情类型 |
| `apps/user/src/types/university/department.ts` | Create | 院系列表/报告类型 |
| `apps/user/src/types/university/subject-evaluation.ts` | Create | 学科评估类型 |
| `apps/user/src/api/university/laboratory.ts` | Create | 实验室 API 封装 |
| `apps/user/src/api/university/department.ts` | Create | 院系 API 封装 |
| `apps/user/src/api/university/subject-evaluation.ts` | Create | 学科评估 API 封装 |
| `apps/user/src/components/university/LaboratoryTab.vue` | Create | 实验室 Tab 组件 |
| `apps/user/src/components/university/DepartmentTab.vue` | Create | 院系 Tab 组件 |
| `apps/user/src/components/university/SubjectEvaluationTab.vue` | Create | 学科评估 Tab 组件 |
| `apps/user/src/views/university/LaboratoryDetail.vue` | Create | 实验室详情页 |
| `apps/user/src/views/university/DepartmentDetail.vue` | Create | 院系分析报告页 |
| `apps/user/src/views/university/Detail.vue` | Modify | 追加 Tab 导航区 |
| `apps/user/src/router/index.ts` | Modify | 新增 2 条路由 |

---

### Task 1: 类型定义

**Files:**
- Create: `apps/user/src/types/university/laboratory.ts`
- Create: `apps/user/src/types/university/department.ts`
- Create: `apps/user/src/types/university/subject-evaluation.ts`

- [ ] **Step 1: Create laboratory types**

```typescript
// apps/user/src/types/university/laboratory.ts
export interface LaboratoryListVO {
  id: number
  name: string
  labType: string
}

export interface LaboratoryDetailVO {
  universityName: string
  labType: string
  establishedYear: string
  region: string
  department: string
  director: string
  staffCount: string
  studentCount: string
  email: string
  phone: string
  introduction: string
  researchDescription: string
  labSpace: string
  openTopics: string
  cooperation: string
  visitingScholars: string
  researchFields: string[]
  statistics: { label: string; count: number }[]
  majorEquipment: string[]
  coreTeam: { memberName: string; position: string; role: string }[]
}
```

- [ ] **Step 2: Create department types**

```typescript
// apps/user/src/types/university/department.ts
export interface DepartmentListVO {
  id: number
  departmentName: string
  departmentType: string
}

export interface DepartmentReportVO {
  subtitle: string
  overview: {
    title: string
    descriptions: string[]
  }
  subjectsDetail: {
    majorName: string
    tags: string[]
    coreSubject: string
    supportSubject: string
    positioning: string
    coreCourses: string[]
    abilities: string[]
    certificates: string[]
  }[]
  postgraduate: {
    title: string
    directions: string[]
  }
  citySalary: {
    cityName: string
    minSalary: number
    maxSalary: number
  }[]
  salary: {
    majorName: string
    minSalary: number
    maxSalary: number
  }[]
  career: {
    pathTitle: string
    pathDesc: string
    stages: {
      stageTitle: string
      workYears: string
      position: string
      coreGoal: string
      salaryRange: string
    }[]
  }[]
  trends: {
    highGrowthTracks: string[]
    policyOrientations: string[]
    environmentAnalysis: string[]
  }
  prospects: {
    employmentRate: string
    masterSalary: string
    furtherStudyRate: string
    fortune500Rate: string
    salaryGrowthRate: string
    overseasRate: string
  }
  disclaimer: {
    text: string
    updateTime: string
    version: string
    compileUnit: string
  }
  majorCompose: {
    subjectName: string
    percentage: number
  }[]
}
```

- [ ] **Step 3: Create subject evaluation types**

```typescript
// apps/user/src/types/university/subject-evaluation.ts
export interface GradeStatVO {
  grade: string
  count: number
}

export interface SubjectEvaluationVO {
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/user/src/types/university/laboratory.ts apps/user/src/types/university/department.ts apps/user/src/types/university/subject-evaluation.ts
git commit -m "feat: add university subpage type definitions"
```

---

### Task 2: API 封装

**Files:**
- Create: `apps/user/src/api/university/laboratory.ts`
- Create: `apps/user/src/api/university/department.ts`
- Create: `apps/user/src/api/university/subject-evaluation.ts`

- [ ] **Step 1: Create laboratory API**

```typescript
// apps/user/src/api/university/laboratory.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { LaboratoryListVO, LaboratoryDetailVO } from '@/types/university/laboratory'

const PREFIX = '/api/v1/app/university'

export const getLaboratoryPage = (universityId: number, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<LaboratoryListVO>>>(`${PREFIX}/${universityId}/laboratories`, { params })

export const getLaboratoryDetail = (labId: number) =>
  request.get<R<LaboratoryDetailVO>>(`${PREFIX}/laboratories/${labId}`)
```

- [ ] **Step 2: Create department API**

```typescript
// apps/user/src/api/university/department.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { DepartmentListVO, DepartmentReportVO } from '@/types/university/department'

const PREFIX = '/api/v1/app/university'

export const getDepartmentPage = (universityId: number, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<DepartmentListVO>>>(`${PREFIX}/${universityId}/departments`, { params })

export const getDepartmentReport = (departmentId: number) =>
  request.get<R<DepartmentReportVO>>(`${PREFIX}/departments/${departmentId}/report`)
```

- [ ] **Step 3: Create subject evaluation API**

```typescript
// apps/user/src/api/university/subject-evaluation.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { GradeStatVO, SubjectEvaluationVO } from '@/types/university/subject-evaluation'

const PREFIX = '/api/v1/app/university'

export const getGradeStats = (universityId: number) =>
  request.get<R<GradeStatVO[]>>(`${PREFIX}/${universityId}/subject-evaluations/grade-stats`)

export const getSubjectEvaluationPage = (universityId: number, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<SubjectEvaluationVO>>>(`${PREFIX}/${universityId}/subject-evaluations`, { params })
```

- [ ] **Step 4: Commit**

```bash
git add apps/user/src/api/university/laboratory.ts apps/user/src/api/university/department.ts apps/user/src/api/university/subject-evaluation.ts
git commit -m "feat: add university subpage API functions"
```

---

### Task 3: 实验室 Tab 组件

**Files:**
- Create: `apps/user/src/components/university/LaboratoryTab.vue`

- [ ] **Step 1: Create LaboratoryTab.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getLaboratoryPage } from '@/api/university/laboratory'
import type { LaboratoryListVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: number }>()
const router = useRouter()

const loading = ref(false)
const list = ref<LaboratoryListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeType = ref('')

const labTypes = computed(() => {
  const types = new Set(list.value.map(item => item.labType))
  return Array.from(types)
})

const filteredList = computed(() => {
  if (!activeType.value) return list.value
  return list.value.filter(item => item.labType === activeType.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getLaboratoryPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
    if (!activeType.value && labTypes.value.length) {
      activeType.value = labTypes.value[0]
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取实验室列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(labId: number) {
  router.push(`/university/laboratory/${labId}`)
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="type in labTypes" :key="type"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all border"
        :class="activeType === type
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'"
        @click="activeType = type; page = 1; fetchList()"
      >
        {{ type }}
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="filteredList.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in filteredList" :key="item.id"
          class="rounded-xl bg-white p-5 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all"
          @click="goDetail(item.id)"
        >
          <h4 class="font-semibold text-gray-800 mb-1">{{ item.name }}</h4>
          <span class="inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ item.labType }}</span>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">暂无实验室数据</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/components/university/LaboratoryTab.vue
git commit -m "feat: add laboratory tab component"
```

---

### Task 4: 院系 Tab 组件

**Files:**
- Create: `apps/user/src/components/university/DepartmentTab.vue`

- [ ] **Step 1: Create DepartmentTab.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getDepartmentPage } from '@/api/university/department'
import type { DepartmentListVO } from '@/types/university/department'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: number }>()
const router = useRouter()

const loading = ref(false)
const list = ref<DepartmentListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeType = ref('')

const deptTypes = computed(() => {
  const types = new Set(list.value.map(item => item.departmentType))
  return Array.from(types)
})

const filteredList = computed(() => {
  if (!activeType.value) return list.value
  return list.value.filter(item => item.departmentType === activeType.value)
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getDepartmentPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
    if (!activeType.value && deptTypes.value.length) {
      activeType.value = deptTypes.value[0]
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院系列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(deptId: number) {
  router.push(`/university/departments/${deptId}`)
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-3 mb-6">
      <button
        v-for="type in deptTypes" :key="type"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-all border"
        :class="activeType === type
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'"
        @click="activeType = type; page = 1; fetchList()"
      >
        {{ type }}
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="filteredList.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in filteredList" :key="item.id"
          class="rounded-xl bg-white p-5 shadow-md border border-gray-100 cursor-pointer hover:shadow-lg hover:border-orange-200 transition-all"
          @click="goDetail(item.id)"
        >
          <h4 class="font-semibold text-gray-800 mb-1">{{ item.departmentName }}</h4>
          <span class="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{{ item.departmentType }}</span>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">暂无院系数据</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/components/university/DepartmentTab.vue
git commit -m "feat: add department tab component"
```

---

### Task 5: 学科评估 Tab 组件

**Files:**
- Create: `apps/user/src/components/university/SubjectEvaluationTab.vue`

- [ ] **Step 1: Create SubjectEvaluationTab.vue**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getGradeStats, getSubjectEvaluationPage } from '@/api/university/subject-evaluation'
import type { GradeStatVO, SubjectEvaluationVO } from '@/types/university/subject-evaluation'
import { ElMessage } from 'element-plus'

const props = defineProps<{ universityId: number }>()

const loading = ref(false)
const stats = ref<GradeStatVO[]>([])
const list = ref<SubjectEvaluationVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const activeGrade = ref('')

const sortedGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-']

const activeGradeStats = computed(() => {
  return stats.value.find(s => s.grade === activeGrade.value)
})

async function fetchStats() {
  try {
    const res = await getGradeStats(props.universityId)
    stats.value = res.data.data
    const firstNonZero = stats.value.find(s => s.count > 0)
    if (firstNonZero) {
      activeGrade.value = firstNonZero.grade
    }
  } catch {
    ElMessage.error('获取等级统计失败')
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getSubjectEvaluationPage(props.universityId, { page: page.value, size: size.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取学科评估列表失败')
  } finally {
    loading.value = false
  }
}

const filteredList = computed(() => {
  if (!activeGrade.value) return list.value
  return list.value.filter(item => item.evaluationGrade === activeGrade.value)
})

function selectGrade(grade: string) {
  activeGrade.value = grade
  page.value = 1
}

function onPageChange(p: number) {
  page.value = p
}

onMounted(() => {
  fetchStats()
  fetchList()
})
</script>

<template>
  <div>
    <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mb-6">
      <button
        v-for="grade in sortedGrades" :key="grade"
        class="rounded-xl p-3 text-center transition-all border cursor-pointer"
        :class="activeGrade === grade
          ? 'bg-orange-500 text-white border-orange-500 shadow-md'
          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'"
        @click="selectGrade(grade)"
      >
        <div class="text-lg font-bold">{{ grade }}</div>
        <div class="text-xs mt-0.5" :class="activeGrade === grade ? 'text-white/80' : 'text-gray-400'">{{ (stats.find(s => s.grade === grade)?.count ?? 0) + ' 个' }}</div>
      </button>
    </div>

    <div v-loading="loading" class="min-h-[120px]">
      <div v-if="filteredList.length" class="space-y-3">
        <div
          v-for="item in filteredList" :key="item.disciplineCode"
          class="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex items-center justify-between"
        >
          <div>
            <span class="font-medium text-gray-800">{{ item.disciplineName }}</span>
            <span class="ml-2 text-xs text-gray-400">{{ item.disciplineCode }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-400">{{ item.evaluationRound }}</span>
            <span
              class="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              :class="
                ['A+', 'A', 'A-'].includes(item.evaluationGrade)
                  ? 'bg-red-50 text-red-600'
                  : ['B+', 'B', 'B-'].includes(item.evaluationGrade)
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-50 text-gray-500'
              "
            >{{ item.evaluationGrade }}</span>
          </div>
        </div>
      </div>
      <p v-else-if="!loading" class="py-12 text-center text-gray-400">{{ activeGrade ? `暂无 ${activeGrade} 等级学科数据` : '暂无学科评估数据' }}</p>
    </div>

    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="size" :current-page="page" @current-change="onPageChange" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/components/university/SubjectEvaluationTab.vue
git commit -m "feat: add subject evaluation tab component"
```

---

### Task 6: 实验室详情页

**Files:**
- Create: `apps/user/src/views/university/LaboratoryDetail.vue`

- [ ] **Step 1: Create LaboratoryDetail.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLaboratoryDetail } from '@/api/university/laboratory'
import type { LaboratoryDetailVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<LaboratoryDetailVO | null>(null)

async function fetchDetail() {
  const labId = Number(route.params.labId)
  if (!labId) {
    ElMessage.error('实验室ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getLaboratoryDetail(labId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取实验室详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.back()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回院校详情</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.labType }} - {{ detail.universityName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.labType }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">所属院校：</span><span class="text-gray-700">{{ detail.universityName }}</span></div>
            <div><span class="text-gray-400">成立时间：</span><span class="text-gray-700">{{ detail.establishedYear || '-' }}</span></div>
            <div><span class="text-gray-400">所在地区：</span><span class="text-gray-700">{{ detail.region || '-' }}</span></div>
            <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700">{{ detail.department || '-' }}</span></div>
            <div><span class="text-gray-400">实验室主任：</span><span class="text-gray-700">{{ detail.director || '-' }}</span></div>
            <div><span class="text-gray-400">人员规模：</span><span class="text-gray-700">{{ detail.staffCount || '-' }}</span></div>
            <div><span class="text-gray-400">学生规模：</span><span class="text-gray-700">{{ detail.studentCount || '-' }}</span></div>
            <div><span class="text-gray-400">联系邮箱：</span><span class="text-gray-700">{{ detail.email || '-' }}</span></div>
            <div><span class="text-gray-400">联系电话：</span><span class="text-gray-700">{{ detail.phone || '-' }}</span></div>
          </div>
        </section>

        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 space-y-4">
          <div v-if="detail.introduction">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室简介</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction }}</p>
          </div>
          <div v-if="detail.researchDescription">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究方向描述</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.researchDescription }}</p>
          </div>
          <div v-if="detail.labSpace">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室空间</h3>
            <p class="text-gray-600">{{ detail.labSpace }}</p>
          </div>
          <div v-if="detail.researchFields?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究领域</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="field in detail.researchFields" :key="field" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">{{ field }}</span>
            </div>
          </div>
          <div v-if="detail.majorEquipment?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">主要设备</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="eq in detail.majorEquipment" :key="eq" class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{{ eq }}</span>
            </div>
          </div>
          <div v-if="detail.openTopics">
            <h3 class="text-lg font-bold text-gray-800 mb-2">开放课题</h3>
            <p class="text-gray-600">{{ detail.openTopics }}</p>
          </div>
          <div v-if="detail.cooperation">
            <h3 class="text-lg font-bold text-gray-800 mb-2">合作交流</h3>
            <p class="text-gray-600">{{ detail.cooperation }}</p>
          </div>
          <div v-if="detail.visitingScholars">
            <h3 class="text-lg font-bold text-gray-800 mb-2">访问学者</h3>
            <p class="text-gray-600">{{ detail.visitingScholars }}</p>
          </div>
        </section>

        <section v-if="detail.coreTeam?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">核心团队</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">姓名</th>
                  <th class="text-left py-2 px-3">职务</th>
                  <th class="text-left py-2 px-3">岗位角色</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, idx) in detail.coreTeam" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800 font-medium">{{ member.memberName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.position || '-' }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.role || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="detail.statistics?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">统计数据</h3>
          <div class="flex flex-wrap gap-4">
            <div v-for="(stat, idx) in detail.statistics" :key="idx" class="rounded-xl bg-orange-50 px-5 py-3 text-center flex-1 min-w-[120px]">
              <div class="text-2xl font-bold text-orange-600">{{ stat.count }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/university/LaboratoryDetail.vue
git commit -m "feat: add laboratory detail page"
```

---

### Task 7: 院系分析报告页

**Files:**
- Create: `apps/user/src/views/university/DepartmentDetail.vue`

- [ ] **Step 1: Create DepartmentDetail.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDepartmentReport } from '@/api/university/department'
import type { DepartmentReportVO } from '@/types/university/department'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const report = ref<DepartmentReportVO | null>(null)

async function fetchReport() {
  const deptId = Number(route.params.deptId)
  if (!deptId) {
    ElMessage.error('院系ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getDepartmentReport(deptId)
    report.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院系分析报告失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)

function formatMoney(value: number) {
  return value.toFixed(1)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.back()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回院校详情</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">院系就业分析报告</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="report">
        <p v-if="report.subtitle" class="text-center text-gray-500 mb-6">{{ report.subtitle }}</p>

        <!-- 院系概述 -->
        <section v-if="report.overview" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">院系概述</h3>
          <h4 v-if="report.overview.title" class="text-gray-700 font-medium mb-2">{{ report.overview.title }}</h4>
          <ul v-if="report.overview.descriptions?.length" class="list-disc list-inside text-gray-600 space-y-1">
            <li v-for="(desc, idx) in report.overview.descriptions" :key="idx">{{ desc }}</li>
          </ul>
        </section>

        <!-- 专业组成 -->
        <section v-if="report.majorCompose?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业组成</h3>
          <div class="space-y-3">
            <div v-for="(item, idx) in report.majorCompose" :key="idx">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700">{{ item.subjectName }}</span>
                <span class="text-gray-500">{{ item.percentage }}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400" :style="{ width: item.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- 专业详情 -->
        <section v-if="report.subjectsDetail?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业详情</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(major, idx) in report.subjectsDetail" :key="idx" class="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <h4 class="font-semibold text-gray-800 mb-2">{{ major.majorName }}</h4>
              <div v-if="major.tags?.length" class="flex flex-wrap gap-1 mb-2">
                <span v-for="tag in major.tags" :key="tag" class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ tag }}</span>
              </div>
              <div class="text-xs text-gray-500 space-y-1">
                <p v-if="major.coreSubject"><span class="text-gray-400">核心学科：</span>{{ major.coreSubject }}</p>
                <p v-if="major.supportSubject"><span class="text-gray-400">支撑学科：</span>{{ major.supportSubject }}</p>
                <p v-if="major.positioning" class="text-gray-600 mt-1">{{ major.positioning }}</p>
                <div v-if="major.coreCourses?.length" class="mt-1">
                  <span class="text-gray-400">核心课程：</span>
                  <span v-for="(c, ci) in major.coreCourses" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                </div>
                <div v-if="major.abilities?.length" class="mt-1">
                  <span class="text-gray-400">培养能力：</span>
                  <span v-for="(a, ai) in major.abilities" :key="ai" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ a }}</span>
                </div>
                <div v-if="major.certificates?.length" class="mt-1">
                  <span class="text-gray-400">推荐证书：</span>
                  <span v-for="(c, ci) in major.certificates" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 城市薪资 -->
        <section v-if="report.citySalary?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">城市薪资分布</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div v-for="(item, idx) in report.citySalary" :key="idx" class="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
              <div class="font-medium text-gray-800">{{ item.cityName }}</div>
              <div class="text-sm text-orange-600 font-semibold mt-1">{{ formatMoney(item.minSalary) }} - {{ formatMoney(item.maxSalary) }} 万元/年</div>
            </div>
          </div>
        </section>

        <!-- 专业薪资 -->
        <section v-if="report.salary?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业薪资</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">专业名称</th>
                  <th class="text-left py-2 px-3">最低薪资（万元/年）</th>
                  <th class="text-left py-2 px-3">最高薪资（万元/年）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in report.salary" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800">{{ item.majorName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.minSalary) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.maxSalary) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 就业前景 -->
        <section v-if="report.prospects" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">就业前景</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div class="rounded-xl bg-green-50 p-3 text-center">
              <div class="text-sm text-gray-500">综合就业率</div>
              <div class="text-lg font-bold text-green-600">{{ report.prospects.employmentRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-blue-50 p-3 text-center">
              <div class="text-sm text-gray-500">硕士平均起薪</div>
              <div class="text-lg font-bold text-blue-600">{{ report.prospects.masterSalary || '-' }}</div>
            </div>
            <div class="rounded-xl bg-purple-50 p-3 text-center">
              <div class="text-sm text-gray-500">继续深造率</div>
              <div class="text-lg font-bold text-purple-600">{{ report.prospects.furtherStudyRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-amber-50 p-3 text-center">
              <div class="text-sm text-gray-500">世界500强</div>
              <div class="text-lg font-bold text-amber-600">{{ report.prospects.fortune500Rate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-rose-50 p-3 text-center">
              <div class="text-sm text-gray-500">年薪增长率</div>
              <div class="text-lg font-bold text-rose-600">{{ report.prospects.salaryGrowthRate || '-' }}</div>
            </div>
            <div class="rounded-xl bg-teal-50 p-3 text-center">
              <div class="text-sm text-gray-500">海外深造占比</div>
              <div class="text-lg font-bold text-teal-600">{{ report.prospects.overseasRate || '-' }}</div>
            </div>
          </div>
        </section>

        <!-- 就业趋势 -->
        <section v-if="report.trends" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">就业趋势</h3>
          <div class="space-y-3">
            <div v-if="report.trends.highGrowthTracks?.length">
              <span class="text-sm text-gray-400">高速增长赛道：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="t in report.trends.highGrowthTracks" :key="t" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-600">{{ t }}</span>
              </div>
            </div>
            <div v-if="report.trends.policyOrientations?.length">
              <span class="text-sm text-gray-400">核心政策导向：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="p in report.trends.policyOrientations" :key="p" class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">{{ p }}</span>
              </div>
            </div>
            <div v-if="report.trends.environmentAnalysis?.length">
              <span class="text-sm text-gray-400">就业环境分析：</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span v-for="e in report.trends.environmentAnalysis" :key="e" class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">{{ e }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 考研方向 -->
        <section v-if="report.postgraduate" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">考研方向</h3>
          <h4 v-if="report.postgraduate.title" class="text-gray-700 font-medium mb-2">{{ report.postgraduate.title }}</h4>
          <div v-if="report.postgraduate.directions?.length" class="flex flex-wrap gap-2">
            <span v-for="(d, idx) in report.postgraduate.directions" :key="idx" class="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600">{{ d }}</span>
          </div>
        </section>

        <!-- 职业路径 -->
        <section v-if="report.career?.length" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">职业路径</h3>
          <div class="space-y-4">
            <div v-for="(path, idx) in report.career" :key="idx" class="rounded-xl bg-gray-50 p-4 border border-gray-100">
              <h4 class="font-semibold text-gray-800 mb-1">{{ path.pathTitle }}</h4>
              <p v-if="path.pathDesc" class="text-sm text-gray-500 mb-3">{{ path.pathDesc }}</p>
              <div class="space-y-2">
                <div v-for="(stage, si) in path.stages" :key="si" class="flex items-center gap-3 text-sm bg-white rounded-lg p-3 border border-gray-100">
                  <span class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 font-medium">{{ stage.stageTitle }}</span>
                  <span class="text-gray-400">{{ stage.workYears }}</span>
                  <span class="text-gray-700 font-medium">{{ stage.position }}</span>
                  <span v-if="stage.salaryRange" class="ml-auto text-orange-600 font-medium">{{ stage.salaryRange }} 万</span>
                </div>
              </div>
              <p v-if="path.stages[0]?.coreGoal" class="mt-2 text-xs text-gray-400">核心目标：{{ path.stages[0].coreGoal }}</p>
            </div>
          </div>
        </section>

        <!-- 免责声明 -->
        <section v-if="report.disclaimer" class="mb-6 rounded-2xl bg-gray-50 p-6 border border-gray-200">
          <p v-if="report.disclaimer.text" class="text-xs text-gray-400 leading-relaxed">{{ report.disclaimer.text }}</p>
          <div class="flex gap-4 mt-2 text-xs text-gray-400">
            <span v-if="report.disclaimer.version">版本：{{ report.disclaimer.version }}</span>
            <span v-if="report.disclaimer.updateTime">更新：{{ report.disclaimer.updateTime }}</span>
            <span v-if="report.disclaimer.compileUnit">编制：{{ report.disclaimer.compileUnit }}</span>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/university/DepartmentDetail.vue
git commit -m "feat: add department detail report page"
```

---

### Task 8: 更新 Detail.vue — 追加 Tab 导航区

**Files:**
- Modify: `apps/user/src/views/university/Detail.vue`

- [ ] **Step 1: Modify Detail.vue — Add imports, script, and template**

In the `<script>` section, add imports for the tab components:

```typescript
import LaboratoryTab from '@/components/university/LaboratoryTab.vue'
import DepartmentTab from '@/components/university/DepartmentTab.vue'
import SubjectEvaluationTab from '@/components/university/SubjectEvaluationTab.vue'
```

Add reactive state after `const detail`:

```typescript
const activeTab = ref('laboratory')

const tabs = [
  { key: 'laboratory', label: '重点实验室', icon: '🔬' },
  { key: 'department', label: '院系', icon: '🏛️' },
  { key: 'evaluation', label: '学科评估', icon: '📊' },
]
```

In the `<template>`, before the "查看适应指南" button section, add:

```vue
<!-- Tab 导航 -->
<section class="mb-8">
  <div class="grid grid-cols-3 gap-4">
    <button
      v-for="tab in tabs" :key="tab.key"
      class="relative rounded-2xl p-5 text-center transition-all border"
      :class="activeTab === tab.key
        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg border-transparent'
        : 'bg-white text-gray-700 border-gray-100 shadow-md hover:shadow-lg hover:border-orange-200'"
      @click="activeTab = tab.key"
    >
      <div class="text-3xl mb-2">{{ tab.icon }}</div>
      <div class="text-sm font-semibold">{{ tab.label }}</div>
    </button>
  </div>
</section>

<!-- Tab 内容区 -->
<section v-loading="loading" class="min-h-[200px] mb-8">
  <LaboratoryTab v-if="activeTab === 'laboratory'" :university-id="detail.id" />
  <DepartmentTab v-else-if="activeTab === 'department'" :university-id="detail.id" />
  <SubjectEvaluationTab v-else-if="activeTab === 'evaluation'" :university-id="detail.id" />
</section>
```

And also add the `id` field to `UniversityDetailVO` (it needs to be passed as prop). Check if `id` is already exposed in the template — from the existing code, the route params `id` is used but `detail.id` may not exist on `UniversityDetailVO`. Let me check...

Actually, looking at the existing type `UniversityDetailVO`, it doesn't include `id`. But the route already has `route.params.id`. We can use that instead of `detail.id`. Let me adjust:

```vue
<LaboratoryTab v-if="activeTab === 'laboratory'" :university-id="Number(route.params.id)" />
<DepartmentTab v-else-if="activeTab === 'department'" :university-id="Number(route.params.id)" />
<SubjectEvaluationTab v-else-if="activeTab === 'evaluation'" :university-id="Number(route.params.id)" />
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/university/Detail.vue
git commit -m "feat: add subpage tabs to university detail page"
```

---

### Task 9: 更新路由

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: Add 2 new routes after the existing UniversityDetail route**

```typescript
{
  path: '/university/laboratory/:labId',
  name: 'LaboratoryDetail',
  component: () => import('@/views/university/LaboratoryDetail.vue'),
  meta: { title: '实验室详情', requiresAuth: true },
},
{
  path: '/university/departments/:deptId',
  name: 'DepartmentDetail',
  component: () => import('@/views/university/DepartmentDetail.vue'),
  meta: { title: '院系详情', requiresAuth: true },
},
```

Add them after the existing `UniversityGuide` route (line 65).

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/router/index.ts
git commit -m "feat: add laboratory and department detail routes"
```
