# C 端专业管理页面 Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 user-facing major-related pages (专业查询, 专业详情, 考研专业, 大学→考研专业) with 8 API integrations, service gating, and Inspira UI animations.

**Architecture:** Types → API → Shared Components → Pages → Router integration. Follow existing patterns in `apps/user/src/`. All views use Composition API + `<script setup>`.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Tailwind CSS, motion-v (Inspira UI), Pinia

---

## File Structure

```
apps/user/src/
├── api/
│   ├── major/index.ts              # 4 APIs: list, detail, category-stats, ranking
│   └── postgrad-major/index.ts     # 4 APIs: list, detail, uni→postgrad, postgrad→uni
├── types/
│   ├── major/index.ts              # MajorListVO, MajorDetailVO, MajorCategoryStatVO, etc.
│   └── postgrad-major/index.ts     # PostgradMajor*, UniversityBriefForPostgradVO
├── views/
│   ├── major/
│   │   ├── List.vue                # 专业查询页 (complex)
│   │   ├── Detail.vue              # 专业详情页
│   │   └── PostgradList.vue        # 考研专业页 (complex)
├── components/
│   └── major/
│       ├── PostgradMajorDialog.vue       # 考研专业详情弹窗
│       └── PostgradMajorForUniversityTab.vue  # 院校详情页考研 Tab
├── router/index.ts                       # +3 routes
└── views/university/Detail.vue           # +考研专业 Tab
```

---

### Task 1: Major Types

**Files:**
- Create: `apps/user/src/types/major/index.ts`

- [ ] **Step 1: Create type definitions file**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface MajorListVO {
  id: number
  majorCode: string
  majorName: string
  disciplineName: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
  employmentRate: number
  salaryMin: number
  salaryMax: number
  description: string
}

export interface MajorDetailVO {
  majorName: string
  majorCode: string
  disciplineName: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
  employmentRate: number
  salaryMin: number
  salaryMax: number
  description: string
  courseCount: number
  graduateScale: string
  maleRatio: number
  femaleRatio: number
  majorDescription: string
  trainingObjective: string
  trainingRequirement: string
  subjectRequirement: string
  careerProspect: string
  mainCourses: string[]
  knowledgeSkills: string[]
}

export interface MajorCategoryStatVO {
  majorCategory: string
  count: number
}

export interface MajorQueryDTO extends BasePageQuery {
  name?: string
  code?: string
  majorType?: string
  majorCategory?: string
}

export interface MajorRankingQueryDTO extends BasePageQuery {
  name?: string
  majorCategory?: string
  sortBy?: 'employmentRate' | 'salaryMin' | 'salaryMax'
  sortOrder?: 'asc' | 'desc'
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/types/major/index.ts
git commit -m "feat: add major module types"
```

---

### Task 2: Postgrad-Major Types

**Files:**
- Create: `apps/user/src/types/postgrad-major/index.ts`

- [ ] **Step 1: Create type definitions**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface PostgradMajorListVO {
  id: number
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string
  difficulty: string
  brief: string
  examSubjects: string[]
}

export interface PostgradMajorDetailVO {
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string
  difficulty: string
  introduction: string
  examSubjects: string[]
  admissionRequirements: string[]
  crossExamDifficulty: string
  crossExamDescription: string
  crossExamFactors: string[]
}

export interface PostgradMajorQueryDTO extends BasePageQuery {
  name?: string
  code?: string
  degreeType?: string
  disciplineCategory?: string
  popularity?: string
  difficulty?: string
}

export interface PostgradMajorBriefVO {
  id: number
  majorName: string
  degreeType: string
}

export interface UniversityBriefForPostgradVO {
  id: number
  name: string
  category: string
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/types/postgrad-major/index.ts
git commit -m "feat: add postgrad-major module types"
```

---

### Task 3: Major API

**Files:**
- Create: `apps/user/src/api/major/index.ts`

- [ ] **Step 1: Create API functions**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { MajorListVO, MajorDetailVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'

const PREFIX = '/api/v1/app/major'

export const getMajorList = (params: MajorQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/list`, { params })

export const getMajorDetail = (majorId: number) =>
  request.get<R<MajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getMajorCategoryStats = () =>
  request.get<R<MajorCategoryStatVO[]>>(`${PREFIX}/category-stats`)

export const getMajorRanking = (params: MajorRankingQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/ranking`, { params })
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/api/major/index.ts
git commit -m "feat: add major module API"
```

---

### Task 4: Postgrad-Major API

**Files:**
- Create: `apps/user/src/api/postgrad-major/index.ts`

- [ ] **Step 1: Create API functions**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { PostgradMajorListVO, PostgradMajorDetailVO, PostgradMajorQueryDTO, PostgradMajorBriefVO, UniversityBriefForPostgradVO } from '@/types/postgrad-major'

const PREFIX = '/api/v1/app/postgrad-major'

export const getPostgradMajorList = (params: PostgradMajorQueryDTO) =>
  request.get<R<PageResult<PostgradMajorListVO>>>(`${PREFIX}/list`, { params })

export const getPostgradMajorDetail = (majorId: number) =>
  request.get<R<PostgradMajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getPostgradMajorsByUniversity = (universityId: number, params: { page?: number; size?: number; degreeType?: string }) =>
  request.get<R<PageResult<PostgradMajorBriefVO>>>(`/api/v1/app/university/${universityId}/postgrad-majors`, { params })

export const getUniversitiesByPostgradMajor = (majorId: number, params: { page?: number; size?: number; category?: string }) =>
  request.get<R<PageResult<UniversityBriefForPostgradVO>>>(`${PREFIX}/${majorId}/universities`, { params })
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/api/postgrad-major/index.ts
git commit -m "feat: add postgrad-major module API"
```

---

### Task 5: Router

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: Add 3 new routes before the 404 catch-all**

Find the RouteRecordRaw array and add these entries before the `/:pathMatch(.*)*` wildcard:

```typescript
{
  path: '/major',
  name: 'MajorList',
  component: () => import('@/views/major/List.vue'),
  meta: { title: '专业查询' }
},
{
  path: '/major/:id',
  name: 'MajorDetail',
  component: () => import('@/views/major/Detail.vue'),
  meta: { title: '专业详情', requiresAuth: true }
},
{
  path: '/postgrad-major',
  name: 'PostgradMajorList',
  component: () => import('@/views/major/PostgradList.vue'),
  meta: { title: '考研专业', requiresAuth: true }
},
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/router/index.ts
git commit -m "feat: add major/postgrad-major routes"
```

---

### Task 6: Major List Page (专业查询)

**Files:**
- Create: `apps/user/src/views/major/List.vue`

- [ ] **Step 1: Create the full page component**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getMajorList, getMajorCategoryStats, getMajorRanking } from '@/api/major'
import type { MajorListVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'
import { Motion } from 'motion-v'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const rankingLoading = ref(false)
const list = ref<MajorListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const activeType = ref('本科')
const typeOptions = ['本科', '专科']

const stats = ref<MajorCategoryStatVO[]>([])
const selectedCategory = ref('')

const query = reactive<MajorQueryDTO>({
  page: 1,
  size: 10,
  majorType: '本科',
})

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

// Ranking
const rankingQuery = reactive<MajorRankingQueryDTO>({
  page: 1,
  size: 10,
  sortBy: 'salaryMax',
  sortOrder: 'desc',
  majorCategory: '',
})
const rankingList = ref<MajorListVO[]>([])
const rankingTotal = ref(0)
const rankingPage = ref(1)
const rankingPageSize = ref(10)
const sortType = ref<'salaryMax' | 'employmentRate'>('salaryMax')

const sortOptions = [
  { value: 'salaryMax', label: '按薪资排序' },
  { value: 'employmentRate', label: '按就业率排序' },
]

async function fetchList() {
  loading.value = true
  try {
    query.majorType = activeType.value
    query.page = currentPage.value
    query.size = pageSize.value
    query.majorCategory = selectedCategory.value || undefined
    const res = await getMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取专业列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await getMajorCategoryStats()
    stats.value = res.data.data
  } catch {
    // silently fail
  }
}

async function fetchRanking() {
  rankingLoading.value = true
  try {
    rankingQuery.page = rankingPage.value
    rankingQuery.size = rankingPageSize.value
    rankingQuery.sortBy = sortType.value
    rankingQuery.sortOrder = 'desc'
    const res = await getMajorRanking(rankingQuery)
    rankingList.value = res.data.data.records
    rankingTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取排行失败')
    }
    rankingList.value = []
  } finally {
    rankingLoading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.code = ''
  query.majorCategory = ''
  selectedCategory.value = ''
  currentPage.value = 1
  fetchList()
}

function switchType(type: string) {
  activeType.value = type
  selectedCategory.value = ''
  query.majorCategory = ''
  currentPage.value = 1
  fetchList()
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
  currentPage.value = 1
  fetchList()
}

function goDetail(id: number) {
  router.push(`/major/${id}`)
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function onRankingPageChange(page: number) {
  rankingPage.value = page
  fetchRanking()
}

function onRankingSizeChange(size: number) {
  rankingPageSize.value = size
  rankingPage.value = 1
  fetchRanking()
}

onMounted(() => {
  fetchStats()
  fetchList()
  if (isPro.value) fetchRanking()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回首页</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">专业查询</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            收录教育部公布的本科、专科和研究生专业目录，包含专业介绍、课程设置、就业方向、薪资水平等数据，为您的学业规划提供全面参考。
          </p>
        </div>
      </Motion>

      <!-- Type buttons -->
      <div class="mb-6 flex gap-4">
        <button
          v-for="type in typeOptions" :key="type"
          class="rounded-xl px-8 py-3 text-base font-semibold transition-all"
          :class="activeType === type
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
          @click="switchType(type)"
        >
          {{ type === '本科' ? '本科专业目录' : '专科专业目录' }}
        </button>
      </div>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入专业名称搜索"
          class="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <input
          v-model="query.code"
          type="text"
          placeholder="专业代码"
          class="w-36 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.majorCategory" placeholder="专业类别" clearable filterable class="!w-44">
          <el-option
            v-for="item in stats" :key="item.majorCategory"
            :label="item.majorCategory" :value="item.majorCategory"
          />
        </el-select>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- Category Stats -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">专业分类统计</h2>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="item in stats" :key="item.majorCategory"
              class="rounded-full px-4 py-2 text-sm font-medium transition-all"
              :class="selectedCategory === item.majorCategory
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
              @click="selectCategory(item.majorCategory)"
            >
              {{ item.majorCategory }}
              <span class="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs">{{ item.count }}</span>
            </button>
          </div>
        </section>
      </Motion>

      <!-- Major List -->
      <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">{{ activeType === '本科' ? '本科' : '专科' }}专业列表</h2>
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">代码</th>
                  <th class="pb-3 pr-4 font-medium">专业名称</th>
                  <th class="pb-3 pr-4 font-medium">类别</th>
                  <th class="pb-3 pr-4 font-medium">门类</th>
                  <th class="pb-3 pr-4 font-medium">授予学位</th>
                  <th class="pb-3 pr-4 font-medium">就业率</th>
                  <th class="pb-3 pr-4 font-medium">薪资范围</th>
                  <th class="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors cursor-pointer"
                  @click="goDetail(item.id)"
                >
                  <td class="py-3 pr-4 text-sm text-gray-600 font-mono">{{ item.majorCode }}</td>
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">
                    {{ item.majorName }}
                    <span v-if="item.majorTags" class="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.majorTags }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.majorCategory }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.parentCategory }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.degreeAwarded }}</td>
                  <td class="py-3 pr-4 text-sm" :class="(item.employmentRate ?? 0) >= 90 ? 'text-green-600' : 'text-gray-600'">
                    {{ item.employmentRate ? `${item.employmentRate.toFixed(1)}%` : '-' }}
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">
                    {{ item.salaryMin ? `${item.salaryMin.toLocaleString()} - ${item.salaryMax?.toLocaleString()}` : '-' }}
                  </td>
                  <td class="py-3 text-sm">
                    <span class="text-orange-500 hover:text-orange-600 font-medium">查看详情</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无专业数据</div>
        </div>
        <div v-if="total > pageSize" class="mt-6 flex justify-center">
          <el-pagination
            background layout="total, sizes, prev, pager, next"
            :total="total" :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize" :current-page="currentPage"
            @current-change="onPageChange" @size-change="onSizeChange"
          />
        </div>
      </section>

      <!-- Salary/Employment Ranking -->
      <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">薪资就业排行</h2>
        <template v-if="isPro">
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <el-select v-model="rankingQuery.majorCategory" placeholder="专业大类" clearable filterable class="!w-44" @change="fetchRanking">
              <el-option
                v-for="item in stats" :key="item.majorCategory"
                :label="item.majorCategory" :value="item.majorCategory"
              />
            </el-select>
            <div class="flex gap-2">
              <button
                v-for="opt in sortOptions" :key="opt.value"
                class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                :class="sortType === opt.value
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                @click="sortType = opt.value as any; fetchRanking()"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div v-loading="rankingLoading" class="min-h-[200px]">
            <div v-if="rankingList.length" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th class="pb-3 pr-4 font-medium w-12">排名</th>
                    <th class="pb-3 pr-4 font-medium">专业名称</th>
                    <th class="pb-3 pr-4 font-medium">类别</th>
                    <th class="pb-3 pr-4 font-medium">就业率</th>
                    <th class="pb-3 font-medium">薪资范围</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in rankingList" :key="item.id"
                    class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors cursor-pointer"
                    @click="goDetail(item.id)"
                  >
                    <td class="py-3 pr-4">
                      <span
                        class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                        :class="idx < 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-100 text-gray-500'"
                      >{{ idx + 1 + (rankingPage - 1) * rankingPageSize }}</span>
                    </td>
                    <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.majorName }}</td>
                    <td class="py-3 pr-4 text-sm text-gray-600">{{ item.majorCategory }}</td>
                    <td class="py-3 pr-4 text-sm" :class="(item.employmentRate ?? 0) >= 90 ? 'text-green-600' : 'text-gray-600'">
                      {{ item.employmentRate ? `${item.employmentRate.toFixed(1)}%` : '-' }}
                    </td>
                    <td class="py-3 text-sm text-gray-600">
                      {{ item.salaryMin ? `${item.salaryMin.toLocaleString()} - ${item.salaryMax?.toLocaleString()}` : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="!rankingLoading" class="py-12 text-center text-gray-400">暂无排行数据</div>
          </div>
          <div v-if="rankingTotal > rankingPageSize" class="mt-6 flex justify-center">
            <el-pagination
              background layout="total, sizes, prev, pager, next"
              :total="rankingTotal" :page-sizes="[10, 20, 30, 50, 100]"
              :page-size="rankingPageSize" :current-page="rankingPage"
              @current-change="onRankingPageChange" @size-change="onRankingSizeChange"
            />
          </div>
        </template>
        <template v-else>
          <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
            <div class="text-4xl mb-3">🔒</div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看完整薪资就业排行</h3>
            <p class="text-gray-500 mb-4">包含各专业薪资水平、就业率排名等深度数据</p>
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
              @click="router.push('/profile')"
            >
              立即升级
            </button>
          </div>
        </template>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/major/List.vue
git commit -m "feat: implement major query list page"
```

---

### Task 7: Major Detail Page (专业详情)

**Files:**
- Create: `apps/user/src/views/major/Detail.vue`

- [ ] **Step 1: Create the detail page**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMajorDetail } from '@/api/major'
import type { MajorDetailVO } from '@/types/major'
import { Motion } from 'motion-v'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<MajorDetailVO | null>(null)
const error = ref('')

const malePercent = computed(() => detail.value?.maleRatio ?? 0)
const femalePercent = computed(() => detail.value?.femaleRatio ?? 0)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = '专业ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getMajorDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    const msg = e?.response?.data?.msg || '获取专业详情失败'
    error.value = msg
    ElMessage.error(msg)
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
          <span class="font-medium">返回</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.majorName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Basic Info Card -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ detail.majorName }}</h2>
                <p class="text-gray-400 mt-1 font-mono">{{ detail.majorCode }}</p>
              </div>
              <span v-if="detail.majorTags" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.majorTags }}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span class="text-gray-400">门类：</span><span class="text-gray-700">{{ detail.parentCategory }}</span></div>
              <div><span class="text-gray-400">类别：</span><span class="text-gray-700">{{ detail.majorCategory }}</span></div>
              <div><span class="text-gray-400">学科：</span><span class="text-gray-700">{{ detail.disciplineName }}</span></div>
              <div><span class="text-gray-400">授予学位：</span><span class="text-gray-700">{{ detail.degreeAwarded }}</span></div>
            </div>
          </section>
        </Motion>

        <!-- Employment Data Card -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">就业数据</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="rounded-xl bg-green-50 p-4 text-center">
                <div class="text-2xl font-bold text-green-600">{{ detail.employmentRate ? `${detail.employmentRate.toFixed(1)}%` : '-' }}</div>
                <div class="text-gray-500 mt-1">就业率</div>
              </div>
              <div class="rounded-xl bg-blue-50 p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ detail.salaryMin ? `${detail.salaryMin.toLocaleString()}-${detail.salaryMax?.toLocaleString()}` : '-' }}</div>
                <div class="text-gray-500 mt-1">薪资范围（元/月）</div>
              </div>
              <div class="rounded-xl bg-purple-50 p-4 text-center">
                <div class="text-2xl font-bold text-purple-600">{{ detail.courseCount ?? '-' }}</div>
                <div class="text-gray-500 mt-1">开设课程</div>
              </div>
              <div class="rounded-xl bg-amber-50 p-4 text-center">
                <div class="text-2xl font-bold text-amber-600">{{ detail.graduateScale || '-' }}</div>
                <div class="text-gray-500 mt-1">毕业规模</div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Gender Ratio -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">男女比例</h3>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-blue-600 font-medium">男生 {{ malePercent }}%</span>
                  <span class="text-pink-600 font-medium">女生 {{ femalePercent }}%</span>
                </div>
                <div class="h-4 rounded-full bg-gray-100 overflow-hidden flex">
                  <div class="bg-blue-500 transition-all duration-500" :style="{ width: `${malePercent}%` }"></div>
                  <div class="bg-pink-400 transition-all duration-500" :style="{ width: `${femalePercent}%` }"></div>
                </div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Introduction -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">专业介绍</h3>
            <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div v-if="detail.majorDescription">
                <h4 class="font-semibold text-gray-800 mb-1">专业描述</h4>
                <p>{{ detail.majorDescription }}</p>
              </div>
              <div v-if="detail.trainingObjective">
                <h4 class="font-semibold text-gray-800 mb-1">培养目标</h4>
                <p>{{ detail.trainingObjective }}</p>
              </div>
              <div v-if="detail.trainingRequirement">
                <h4 class="font-semibold text-gray-800 mb-1">培养要求</h4>
                <p>{{ detail.trainingRequirement }}</p>
              </div>
              <div v-if="detail.subjectRequirement">
                <h4 class="font-semibold text-gray-800 mb-1">选科要求</h4>
                <p>{{ detail.subjectRequirement }}</p>
              </div>
              <div v-if="detail.careerProspect">
                <h4 class="font-semibold text-gray-800 mb-1">就业前景</h4>
                <p>{{ detail.careerProspect }}</p>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Courses & Skills -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <div v-if="detail.mainCourses?.length" class="mb-6">
              <h3 class="mb-3 text-lg font-bold text-gray-800">主要课程</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="course in detail.mainCourses" :key="course"
                  class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >{{ course }}</span>
              </div>
            </div>
            <div v-if="detail.knowledgeSkills?.length">
              <h3 class="mb-3 text-lg font-bold text-gray-800">知识技能</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in detail.knowledgeSkills" :key="skill"
                  class="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700"
                >{{ skill }}</span>
              </div>
            </div>
          </section>
        </Motion>
      </template>

      <template v-if="error && !loading">
        <div class="py-20 text-center">
          <div class="text-5xl mb-4">📭</div>
          <p class="text-gray-400">{{ error }}</p>
          <button class="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium"
            @click="router.back()"
          >返回</button>
        </div>
      </template>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/major/Detail.vue
git commit -m "feat: implement major detail page"
```

---

### Task 8: PostgradMajorDialog Component

**Files:**
- Create: `apps/user/src/components/major/PostgradMajorDialog.vue`

- [ ] **Step 1: Create dialog component**

```vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPostgradMajorDetail, getUniversitiesByPostgradMajor } from '@/api/postgrad-major'
import type { PostgradMajorDetailVO, UniversityBriefForPostgradVO } from '@/types/postgrad-major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'

const props = defineProps<{
  visible: boolean
  majorId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<PostgradMajorDetailVO | null>(null)

const universityLoading = ref(false)
const universities = ref<UniversityBriefForPostgradVO[]>([])
const universityTotal = ref(0)
const universityPage = ref(1)
const universityPageSize = ref(10)
const universityCategory = ref('')

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']

async function fetchDetail() {
  if (!props.majorId) return
  loading.value = true
  try {
    const res = await getPostgradMajorDetail(props.majorId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取考研专业详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUniversities() {
  if (!props.majorId || !isPro.value) return
  universityLoading.value = true
  try {
    const res = await getUniversitiesByPostgradMajor(props.majorId, {
      page: universityPage.value,
      size: universityPageSize.value,
      category: universityCategory.value || undefined,
    })
    universities.value = res.data.data.records
    universityTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取开设院校失败')
    }
  } finally {
    universityLoading.value = false
  }
}

function goUniversity(id: number) {
  emit('update:visible', false)
  router.push(`/university/${id}`)
}

function onPageChange(page: number) {
  universityPage.value = page
  fetchUniversities()
}

watch(() => props.visible, (val) => {
  if (val) {
    universityPage.value = 1
    universityCategory.value = ''
    detail.value = null
    universities.value = []
    fetchDetail()
    if (isPro.value) fetchUniversities()
  }
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    :title="detail?.majorName || '考研专业详情'"
    width="800px"
    top="5vh"
    destroy-on-close
    class="postgrad-dialog"
  >
    <div v-loading="loading" class="min-h-[300px]">
      <template v-if="detail">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 flex-wrap">
          <h3 class="text-xl font-bold text-gray-800">{{ detail.majorName }}</h3>
          <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ detail.degreeType }}</span>
          <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{{ detail.popularity }}</span>
          <span class="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">难度: {{ detail.difficulty }}</span>
        </div>
        <p class="text-gray-400 font-mono text-sm mb-4">代码：{{ detail.majorCode }} | 门类：{{ detail.disciplineCategory }}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Introduction -->
          <section class="rounded-xl bg-gray-50 p-4">
            <h4 class="font-semibold text-gray-800 mb-2">专业介绍</h4>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detail.introduction }}</p>
          </section>

          <!-- Exam Subjects -->
          <section class="rounded-xl bg-gray-50 p-4">
            <h4 class="font-semibold text-gray-800 mb-2">考试科目</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="subj in detail.examSubjects" :key="subj"
                class="rounded-lg bg-white px-3 py-1 text-sm text-gray-700 border border-gray-200"
              >{{ subj }}</span>
            </div>
          </section>

          <!-- Admission Requirements -->
          <section class="rounded-xl bg-gray-50 p-4">
            <h4 class="font-semibold text-gray-800 mb-2">报考条件</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li v-for="req in detail.admissionRequirements" :key="req" class="flex items-start gap-2">
                <span class="text-orange-500 mt-0.5">•</span>{{ req }}
              </li>
            </ul>
          </section>

          <!-- Cross-exam Info -->
          <section class="rounded-xl bg-gray-50 p-4">
            <h4 class="font-semibold text-gray-800 mb-2">跨考信息</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium text-gray-700">难度：</span>{{ detail.crossExamDifficulty }}</p>
              <p v-if="detail.crossExamDescription">{{ detail.crossExamDescription }}</p>
              <div v-if="detail.crossExamFactors?.length">
                <span class="font-medium text-gray-700">影响因素：</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span v-for="f in detail.crossExamFactors" :key="f"
                    class="rounded-lg bg-white px-2.5 py-1 text-xs text-gray-600 border border-gray-200"
                  >{{ f }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Universities Section -->
        <section class="rounded-xl border border-gray-200 p-4">
          <h4 class="font-semibold text-gray-800 mb-3">开设院校</h4>
          <template v-if="isPro">
            <div class="mb-3">
              <el-select v-model="universityCategory" placeholder="院校类型" clearable filterable class="!w-40" @change="universityPage = 1; fetchUniversities()">
                <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
              </el-select>
            </div>
            <div v-loading="universityLoading" class="min-h-[100px]">
              <div v-if="universities.length" class="space-y-2">
                <div
                  v-for="uni in universities" :key="uni.id"
                  class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 hover:bg-orange-50/50 cursor-pointer transition-colors"
                  @click="goUniversity(uni.id)"
                >
                  <span class="text-sm font-medium text-gray-800">{{ uni.name }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">{{ uni.category }}</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div v-else-if="!universityLoading" class="py-8 text-center text-gray-400 text-sm">暂无开设院校数据</div>
            </div>
            <div v-if="universityTotal > universityPageSize" class="mt-4 flex justify-center">
              <el-pagination
                background small layout="prev, pager, next"
                :total="universityTotal" :page-size="universityPageSize" :current-page="universityPage"
                @current-change="onPageChange"
              />
            </div>
          </template>
          <template v-else>
            <div class="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center border border-orange-100">
              <p class="text-sm text-gray-600 mb-3">开通专业版，查看开设该考研专业的院校列表</p>
              <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-sm text-white font-medium"
                @click="router.push('/profile')"
              >立即升级</button>
            </div>
          </template>
        </section>
      </template>
    </div>
  </el-dialog>
</template>

<style>
.postgrad-dialog .el-dialog__body {
  padding-top: 12px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/components/major/PostgradMajorDialog.vue
git commit -m "feat: implement postgrad major detail dialog"
```

---

### Task 9: Postgrad Major List Page (考研专业)

**Files:**
- Create: `apps/user/src/views/major/PostgradList.vue`

- [ ] **Step 1: Create the full page component**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'
import { getPostgradMajorList } from '@/api/postgrad-major'
import type { PostgradMajorListVO, PostgradMajorQueryDTO } from '@/types/postgrad-major'
import { Motion } from 'motion-v'

const router = useRouter()

const loading = ref(false)
const list = ref<PostgradMajorListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const activeDegree = ref('')
const degreeOptions = [
  { value: '', label: '全部专业' },
  { value: '学术学位', label: '学术型硕士' },
  { value: '专业学位', label: '专业型硕士' },
]

const query = reactive<PostgradMajorQueryDTO>({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const selectedMajorId = ref<number | null>(null)

const disciplineOptions = ['哲学', '经济学', '法学', '教育学', '文学', '历史学', '理学', '工学', '农学', '医学', '军事学', '管理学', '艺术学']
const popularityOptions = ['热门', '一般', '冷门']
const difficultyOptions = ['高', '中', '低']

async function fetchList() {
  loading.value = true
  try {
    query.page = currentPage.value
    query.size = pageSize.value
    query.degreeType = activeDegree.value || undefined
    const res = await getPostgradMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取考研专业列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.code = ''
  query.degreeType = ''
  query.disciplineCategory = ''
  query.popularity = ''
  query.difficulty = ''
  activeDegree.value = ''
  currentPage.value = 1
  fetchList()
}

function switchDegree(degree: string) {
  activeDegree.value = degree
  query.degreeType = degree || undefined
  currentPage.value = 1
  fetchList()
}

function showDetail(id: number) {
  selectedMajorId.value = id
  dialogVisible.value = true
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function getPopularityTag(popularity: string) {
  if (popularity === '热门') return 'danger'
  if (popularity === '一般') return 'warning'
  return 'info'
}

function getDifficultyTag(difficulty: string) {
  if (difficulty === '高') return 'danger'
  if (difficulty === '中') return 'warning'
  return 'success'
}

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回首页</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">考研专业</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            涵盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、考试科目、报考条件、跨考难度等全面信息，助您精准备考。
          </p>
        </div>
      </Motion>

      <!-- Degree Type buttons -->
      <div class="mb-6 flex gap-4">
        <button
          v-for="opt in degreeOptions" :key="opt.value"
          class="rounded-xl px-8 py-3 text-base font-semibold transition-all"
          :class="activeDegree === opt.value
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
          @click="switchDegree(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入考研专业名称搜索"
          class="flex-1 min-w-[180px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <input
          v-model="query.code"
          type="text"
          placeholder="专业代码"
          class="w-32 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.disciplineCategory" placeholder="学科门类" clearable filterable class="!w-36">
          <el-option v-for="d in disciplineOptions" :key="d" :label="d" :value="d" />
        </el-select>
        <el-select v-model="query.popularity" placeholder="热度" clearable class="!w-28">
          <el-option v-for="p in popularityOptions" :key="p" :label="p" :value="p" />
        </el-select>
        <el-select v-model="query.difficulty" placeholder="难度" clearable class="!w-28">
          <el-option v-for="d in difficultyOptions" :key="d" :label="d" :value="d" />
        </el-select>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- Postgrad Major List -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">代码</th>
                  <th class="pb-3 pr-4 font-medium">专业名称</th>
                  <th class="pb-3 pr-4 font-medium">学位类型</th>
                  <th class="pb-3 pr-4 font-medium">学科门类</th>
                  <th class="pb-3 pr-4 font-medium">热度</th>
                  <th class="pb-3 pr-4 font-medium">难度</th>
                  <th class="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                >
                  <td class="py-3 pr-4 text-sm text-gray-600 font-mono">{{ item.majorCode }}</td>
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.majorName }}</td>
                  <td class="py-3 pr-4 text-sm">
                    <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.degreeType }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.disciplineCategory }}</td>
                  <td class="py-3 pr-4 text-sm">
                    <el-tag :type="getPopularityTag(item.popularity)" size="small" effect="plain">{{ item.popularity }}</el-tag>
                  </td>
                  <td class="py-3 pr-4 text-sm">
                    <el-tag :type="getDifficultyTag(item.difficulty)" size="small" effect="plain">{{ item.difficulty }}</el-tag>
                  </td>
                  <td class="py-3 text-sm">
                    <button
                      class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      @click="showDetail(item.id)"
                    >查看详情</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无考研专业数据</div>
        </div>
        <div v-if="total > pageSize" class="mt-6 flex justify-center">
          <el-pagination
            background layout="total, sizes, prev, pager, next"
            :total="total" :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize" :current-page="currentPage"
            @current-change="onPageChange" @size-change="onSizeChange"
          />
        </div>
      </section>
    </main>

    <SiteFooter />

    <PostgradMajorDialog
      v-model:visible="dialogVisible"
      :major-id="selectedMajorId"
    />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/major/PostgradList.vue
git commit -m "feat: implement postgrad major list page"
```

---

### Task 10: PostgradMajorForUniversityTab Component

**Files:**
- Create: `apps/user/src/components/major/PostgradMajorForUniversityTab.vue`

- [ ] **Step 1: Create tab component**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'
import { getPostgradMajorsByUniversity } from '@/api/postgrad-major'
import type { PostgradMajorBriefVO } from '@/types/postgrad-major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'

const props = defineProps<{
  universityId: number
}>()

const userStore = useUserStore()

const loading = ref(false)
const list = ref<PostgradMajorBriefVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const activeDegree = ref('')

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

const degreeOptions = [
  { value: '', label: '全部' },
  { value: '学术学位', label: '学术学位' },
  { value: '专业学位', label: '专业学位' },
]

const dialogVisible = ref(false)
const selectedMajorId = ref<number | null>(null)

async function fetchList() {
  loading.value = true
  try {
    const res = await getPostgradMajorsByUniversity(props.universityId, {
      page: currentPage.value,
      size: pageSize.value,
      degreeType: activeDegree.value || undefined,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取考研专业失败')
    }
  } finally {
    loading.value = false
  }
}

function switchDegree(degree: string) {
  activeDegree.value = degree
  currentPage.value = 1
  fetchList()
}

function showDetail(id: number) {
  selectedMajorId.value = id
  dialogVisible.value = true
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

onMounted(() => {
  if (isPro.value) fetchList()
})
</script>

<template>
  <div class="min-h-[200px]">
    <template v-if="isPro">
      <!-- Degree sub-buttons -->
      <div class="mb-4 flex gap-3">
        <button
          v-for="opt in degreeOptions" :key="opt.value"
          class="rounded-lg px-5 py-2 text-sm font-medium transition-all"
          :class="activeDegree === opt.value
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="switchDegree(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>

      <div v-loading="loading">
        <div v-if="list.length" class="space-y-2">
          <div
            v-for="item in list" :key="item.id"
            class="flex items-center justify-between rounded-xl bg-gray-50 px-5 py-3 hover:bg-orange-50/50 transition-colors cursor-pointer"
            @click="showDetail(item.id)"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-800">{{ item.majorName }}</span>
              <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.degreeType }}</span>
            </div>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <div v-else-if="!loading" class="py-12 text-center text-gray-400">暂无考研专业数据</div>
      </div>

      <div v-if="total > pageSize" class="mt-4 flex justify-center">
        <el-pagination
          background small layout="prev, pager, next"
          :total="total" :page-size="pageSize" :current-page="currentPage"
          @current-change="onPageChange"
        />
      </div>
    </template>
    <template v-else>
      <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
        <div class="text-4xl mb-3">🔒</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看该校考研专业</h3>
        <p class="text-gray-500 mb-4">包含学术学位与专业学位硕士研究生招生专业信息</p>
      </div>
    </template>

    <PostgradMajorDialog
      v-model:visible="dialogVisible"
      :major-id="selectedMajorId"
    />
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/components/major/PostgradMajorForUniversityTab.vue
git commit -m "feat: implement postgrad major tab for university detail"
```

---

### Task 11: University Detail Tab Integration

**Files:**
- Modify: `apps/user/src/views/university/Detail.vue`

- [ ] **Step 1: Add import and tab entry**

Find the imports section and add:
```typescript
import PostgradMajorForUniversityTab from '@/components/major/PostgradMajorForUniversityTab.vue'
```

Find the `tabs` array and change from:
```typescript
const tabs = [
  { key: 'laboratory', label: '重点实验室', icon: '🔬' },
  { key: 'department', label: '院系', icon: '🏛️' },
  { key: 'evaluation', label: '学科评估', icon: '📊' },
]
```
To:
```typescript
const tabs = [
  { key: 'laboratory', label: '重点实验室', icon: '🔬' },
  { key: 'postgrad', label: '考研专业', icon: '🎓' },
  { key: 'department', label: '院系', icon: '🏛️' },
  { key: 'evaluation', label: '学科评估', icon: '📊' },
]
```

Find the tab content section and add after the `LaboratoryTab`:
```vue
<PostgradMajorForUniversityTab v-if="activeTab === 'postgrad'" :university-id="Number(route.params.id)" />
```

Update grid from `grid-cols-3` to `grid-cols-4` in the tab buttons section.

- [ ] **Step 2: Commit**

```bash
git add apps/user/src/views/university/Detail.vue
git commit -m "feat: add postgrad major tab to university detail page"
```

---

### Task 12: Install motion-v dependency

**Files:**
- Modify: `apps/user/package.json`

- [ ] **Step 1: Install motion-v**

```bash
cd apps/user && pnpm add motion-v
```

- [ ] **Step 2: Verify install**

Check that `package.json` now contains `"motion-v"` in dependencies.

- [ ] **Step 3: Commit**

```bash
git add apps/user/package.json apps/user/pnpm-lock.yaml
git commit -m "chore: add motion-v dependency"
```

---

### Verification

After all tasks, verify the build:

```bash
cd apps/user && pnpm build
```
