# C 端竞赛证书管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add certificate list/detail, competition list/detail (with JSONB fields), and competition↔major bidirectional association display for C-end users.

**Architecture:** 3 new pages + 1 existing page modification. API layer and types follow established patterns (separate `api/` and `types/` dirs per module). JSONB fields rendered inline by type (Map→kv, List→tags, List<Map>→cards/table). Pro-gated sections with upgrade prompt.

**Tech Stack:** Vue 3 Composition API + `<script setup>`, TypeScript, Element Plus, Tailwind CSS, motion-v, Vue Router 4

---

## File Structure

```
apps/user/src/
├── api/
│   ├── certificate/index.ts     [NEW]  Certificate & competition APIs
│   └── major/index.ts           [EDIT] Add getMajorCompetitions
├── types/
│   └── certificate/index.ts     [NEW]  All VO/DTO types
├── views/
│   ├── certificate/List.vue     [NEW]  Certificate list page
│   └── competition/
│       ├── List.vue             [NEW]  Competition list page
│       └── Detail.vue           [NEW]  Competition detail + related majors
├── views/major/Detail.vue      [EDIT] Add related competitions section
└── router/index.ts              [EDIT] Add /certificate and /competition routes
```

---

### Task 1: Type definitions

**Files:**
- Create: `apps/user/src/types/certificate/index.ts`

This task defines all TypeScript interfaces for the certificate/competition module.

- [ ] **Step 1: Create type file**

```typescript
// apps/user/src/types/certificate/index.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface CertificateListVO {
  id: number
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
}

export interface CertificateDetailVO {
  id: number
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
  examRequirements: string[]
  examArrangement: string
  officialWebsite: string
}

export interface CompetitionListVO {
  id: number
  compName: string
  compLevel: string
  registrationTime: string
}

export interface CompetitionDetailVO {
  id: number
  competitionId: number
  basicInfo: Record<string, any> | null
  awards: string[] | null
  background: string | null
  purposes: string[] | null
  competitionRules: Array<{ title: string; content: string }> | null
  scoringCriteria: string[] | null
  notices: string[] | null
  processGuide: Array<{ step: string; desc: string }> | null
  awardsDisplay: Array<{ level: string; count: string }> | null
}

export interface CompetitionMajorBriefVO {
  majorId: number
  majorName: string
}

export interface CompetitionBriefVO {
  competitionId: number
  competitionName: string
}

export interface CertificateQueryDTO extends BasePageQuery {
  category?: string
  certName?: string
}
```

- [ ] **Step 2: Create the directory structure**

```
mkdir -p apps/user/src/types/certificate
```

---

### Task 2: API layer

**Files:**
- Create: `apps/user/src/api/certificate/index.ts`
- Modify: `apps/user/src/api/major/index.ts`

- [ ] **Step 1: Create certificate API file**

```typescript
// apps/user/src/api/certificate/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CertificateListVO,
  CertificateDetailVO,
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionMajorBriefVO,
  CertificateQueryDTO,
} from '@/types/certificate'

const CERT_PREFIX = '/api/v1/app/certificate'
const COMP_PREFIX = '/api/v1/app/competition'

export const getCertificateCategories = () =>
  request.get<R<string[]>>(`${CERT_PREFIX}/categories`)

export const getCertificateList = (params: CertificateQueryDTO) =>
  request.get<R<PageResult<CertificateListVO>>>(`${CERT_PREFIX}/list`, { params })

export const getCertificateDetail = (certId: number) =>
  request.get<R<CertificateDetailVO>>(`${CERT_PREFIX}/${certId}/detail`)

export const getCompetitionList = (params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionListVO>>>(`${COMP_PREFIX}/list`, { params })

export const getCompetitionDetail = (compId: number) =>
  request.get<R<CompetitionDetailVO>>(`${COMP_PREFIX}/${compId}/detail`)

export const getCompetitionMajors = (compId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionMajorBriefVO>>>(`${COMP_PREFIX}/${compId}/majors`, { params })
```

- [ ] **Step 2: Add getMajorCompetitions to major API**

```typescript
// apps/user/src/api/major/index.ts - ADD at end of file
import type { CompetitionBriefVO } from '@/types/certificate'

export const getMajorCompetitions = (majorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionBriefVO>>>(`/api/v1/app/major/${majorId}/competitions`, { params })
```

---

### Task 3: Router - add new routes

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: Add certificate and competition routes**

Insert before the catch-all route (`/:pathMatch(.*)*`):

```typescript
// apps/user/src/router/index.ts
// ADD these before the catch-all route:
  {
    path: '/certificate',
    name: 'CertificateList',
    component: () => import('@/views/certificate/List.vue'),
    meta: { title: '职业技能证书' },
  },
  {
    path: '/competition',
    name: 'CompetitionList',
    component: () => import('@/views/competition/List.vue'),
    meta: { title: '大学科研与竞赛' },
  },
  {
    path: '/competition/:id',
    name: 'CompetitionDetail',
    component: () => import('@/views/competition/Detail.vue'),
    meta: { title: '竞赛详情', requiresAuth: true },
  },
```

---

### Task 4: Certificate List Page

**Files:**
- Create: `apps/user/src/views/certificate/List.vue`

- [ ] **Step 1: Create the certificate list page component**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { Motion } from 'motion-v'
import { getCertificateCategories, getCertificateList, getCertificateDetail } from '@/api/certificate'
import type { CertificateListVO, CertificateDetailVO } from '@/types/certificate'

const router = useRouter()

const loading = ref(false)
const categories = ref<string[]>([])
const activeCategory = ref('')
const keyword = ref('')
const list = ref<CertificateListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailLoading = ref(false)
const showDetail = ref(false)
const currentCert = ref<CertificateDetailVO | null>(null)

async function fetchCategories() {
  try {
    const res = await getCertificateCategories()
    categories.value = res.data.data
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]
    }
  } catch {
    // silently fail, empty categories
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getCertificateList({
      page: currentPage.value,
      size: pageSize.value,
      category: activeCategory.value || undefined,
      certName: keyword.value || undefined,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取证书列表失败')
  } finally {
    loading.value = false
  }
}

function switchCategory(cat: string) {
  activeCategory.value = activeCategory.value === cat ? '' : cat
  currentPage.value = 1
  fetchList()
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

async function openDetail(certId: number) {
  detailLoading.value = true
  showDetail.value = true
  try {
    const res = await getCertificateDetail(certId)
    currentCert.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取证书详情失败')
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
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

onMounted(() => {
  fetchCategories()
  fetchList()
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">职业技能证书</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            职业技能证书是衡量个人专业能力的重要凭证，涵盖计算机、财会、语言、工程等多个领域。本页面为您提供各类证书的详细信息，助您规划职业发展路径。
          </p>
        </div>
      </Motion>

      <!-- Category filter -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-6">
        <div class="flex flex-wrap gap-3" v-if="categories.length">
          <button
            v-for="cat in categories" :key="cat"
            class="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
            :class="activeCategory === cat
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
            @click="switchCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </Motion>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="keyword"
          type="text"
          placeholder="输入证书名称搜索"
          class="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
      </div>

      <!-- Certificate List -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">证书列表</h2>
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">证书名称</th>
                  <th class="pb-3 pr-4 font-medium">分类</th>
                  <th class="pb-3 pr-4 font-medium">级别</th>
                  <th class="pb-3 pr-4 font-medium">费用</th>
                  <th class="pb-3 pr-4 font-medium">考试时间</th>
                  <th class="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                >
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.certName }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">
                    <span class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ item.category }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.certLevel }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.examFee ? `¥${item.examFee}` : '-' }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.examTime || '-' }}</td>
                  <td class="py-3 text-sm">
                    <button
                      class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      @click="openDetail(item.id)"
                    >
                      报名指南
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无证书数据</div>
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

    <!-- Certificate Detail Dialog -->
    <ElDialog
      v-model="showDetail"
      title="报名指南"
      width="640px"
      :close-on-click-modal="false"
      v-loading="detailLoading"
    >
      <template v-if="currentCert">
        <div class="space-y-5">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ currentCert.certName }}</h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ currentCert.category }}</span>
              <span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{{ currentCert.certLevel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">适用专业：</span><span class="text-gray-700">{{ currentCert.applicableMajor || '-' }}</span></div>
            <div><span class="text-gray-400">报名时间：</span><span class="text-gray-700">{{ currentCert.registrationTime || '-' }}</span></div>
            <div><span class="text-gray-400">考试时间：</span><span class="text-gray-700">{{ currentCert.examTime || '-' }}</span></div>
            <div><span class="text-gray-400">考试费用：</span><span class="text-gray-700">{{ currentCert.examFee ? `¥${currentCert.examFee}` : '-' }}</span></div>
          </div>

          <div v-if="currentCert.certIntro" class="text-sm text-gray-600 leading-relaxed">
            <h4 class="font-semibold text-gray-800 mb-1">证书简介</h4>
            <p>{{ currentCert.certIntro }}</p>
          </div>

          <div v-if="currentCert.examRequirements?.length" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-2">考试要求</h4>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li v-for="req in currentCert.examRequirements" :key="req">{{ req }}</li>
            </ul>
          </div>

          <div v-if="currentCert.examArrangement" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-1">考试安排</h4>
            <p class="text-gray-600">{{ currentCert.examArrangement }}</p>
          </div>

          <div v-if="currentCert.officialWebsite" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-1">官方网站</h4>
            <a :href="currentCert.officialWebsite" target="_blank" class="text-orange-500 hover:text-orange-600 hover:underline">
              {{ currentCert.officialWebsite }}
            </a>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
          @click="showDetail = false"
        >
          关闭
        </button>
      </template>
    </ElDialog>
  </div>
</template>
```

---

### Task 5: Competition List Page

**Files:**
- Create: `apps/user/src/views/competition/List.vue`

- [ ] **Step 1: Create the competition list page**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import SiteFooter from '@/components/SiteFooter.vue'
import { getCompetitionList } from '@/api/certificate'
import type { CompetitionListVO } from '@/types/certificate'

const router = useRouter()

const loading = ref(false)
const list = ref<CompetitionListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

async function fetchList() {
  loading.value = true
  try {
    const res = await getCompetitionList({ page: currentPage.value, size: pageSize.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取竞赛列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  router.push(`/competition/${id}`)
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">大学科研与竞赛</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            参与科研竞赛是提升综合素质、展示个人能力的重要途径。我们汇集了各类学科竞赛信息，助您找到最适合的竞赛项目。
          </p>
        </div>
      </Motion>

      <!-- Value of competitions (hardcoded) -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">学术竞赛的价值</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🏆</div>
              <h3 class="font-semibold text-gray-800 mb-1">提升竞争力</h3>
              <p class="text-sm text-gray-500">获奖经历是保研、考研复试、求职简历中的重要加分项</p>
            </div>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🧠</div>
              <h3 class="font-semibold text-gray-800 mb-1">锻炼综合能力</h3>
              <p class="text-sm text-gray-500">培养创新思维、团队协作、问题解决和项目管理能力</p>
            </div>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🌐</div>
              <h3 class="font-semibold text-gray-800 mb-1">拓展视野</h3>
              <p class="text-sm text-gray-500">接触前沿领域，与全国优秀学子交流，开阔学术视野</p>
            </div>
          </div>
        </section>
      </Motion>

      <!-- Competition List -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">竞赛列表</h2>
          <div v-loading="loading" class="min-h-[300px]">
            <div v-if="list.length" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th class="pb-3 pr-4 font-medium">竞赛名称</th>
                    <th class="pb-3 pr-4 font-medium w-28">级别</th>
                    <th class="pb-3 pr-4 font-medium w-40">报名时间</th>
                    <th class="pb-3 font-medium w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in list" :key="item.id"
                    class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                  >
                    <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.compName }}</td>
                    <td class="py-3 pr-4 text-sm">
                      <span
                        class="rounded-full px-2.5 py-0.5 text-xs"
                        :class="item.compLevel === '国家级' ? 'bg-red-50 text-red-600' : item.compLevel === '省级' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'"
                      >{{ item.compLevel }}</span>
                    </td>
                    <td class="py-3 pr-4 text-sm text-gray-600">{{ item.registrationTime || '-' }}</td>
                    <td class="py-3 text-sm">
                      <button
                        class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        @click="goDetail(item.id)"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无竞赛数据</div>
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
      </Motion>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 6: Competition Detail Page

**Files:**
- Create: `apps/user/src/views/competition/Detail.vue`

- [ ] **Step 1: Create competition detail page with JSONB rendering and related majors**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import SiteFooter from '@/components/SiteFooter.vue'
import { getCompetitionDetail, getCompetitionMajors } from '@/api/certificate'
import type { CompetitionDetailVO, CompetitionMajorBriefVO } from '@/types/certificate'
import { useUserStore } from '@/store'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<CompetitionDetailVO | null>(null)
const error = ref('')

const majors = ref<CompetitionMajorBriefVO[]>([])
const majorsTotal = ref(0)
const majorsPage = ref(1)
const majorsPageSize = ref(10)
const majorsLoading = ref(false)

const isPro = computed(() => {
  const mt = userStore.userInfo?.memberType
  return mt === 'pro' || mt === 'vip'
})

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    error.value = '竞赛ID不存在'
    return
  }
  loading.value = true
  try {
    const res = await getCompetitionDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    error.value = e?.response?.data?.msg || '获取竞赛详情失败'
  } finally {
    loading.value = false
  }
}

async function fetchMajors() {
  const id = Number(route.params.id)
  if (!id || !isPro.value) return
  majorsLoading.value = true
  try {
    const res = await getCompetitionMajors(id, { page: majorsPage.value, size: majorsPageSize.value })
    majors.value = res.data.data.records
    majorsTotal.value = res.data.data.total
  } catch {
    // Pro check may fail with 403; silently handle
  } finally {
    majorsLoading.value = false
  }
}

function onMajorsPageChange(page: number) {
  majorsPage.value = page
  fetchMajors()
}

function goMajorDetail(majorId: number) {
  router.push(`/major/${majorId}`)
}

onMounted(() => {
  fetchDetail()
  fetchMajors()
})
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">竞赛详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Basic Info -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">基本信息</h2>
            <div v-if="detail.basicInfo" class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div v-for="(val, key) in detail.basicInfo" :key="key">
                <span class="text-gray-400">{{ key }}：</span>
                <span v-if="key === 'officialWebsite' || String(key).includes('website') || String(key).includes('Website')">
                  <a :href="String(val)" target="_blank" class="text-orange-500 hover:underline">{{ val }}</a>
                </span>
                <span v-else class="text-gray-700">{{ val }}</span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400">暂无基本信息</div>
          </section>
        </Motion>

        <!-- Background -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }" class="mb-6" v-if="detail.background">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">赛事背景</h3>
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.background }}</p>
          </section>
        </Motion>

        <!-- Purposes -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }" class="mb-6" v-if="detail.purposes?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">赛事宗旨</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="item in detail.purposes" :key="item" class="rounded-lg bg-orange-50 px-3 py-1.5 text-sm text-orange-700">
                {{ item }}
              </span>
            </div>
          </section>
        </Motion>

        <!-- Awards -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }" class="mb-6" v-if="detail.awards?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">奖项设置</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="item in detail.awards" :key="item" class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                {{ item }}
              </span>
            </div>
          </section>
        </Motion>

        <!-- Competition Rules -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }" class="mb-6" v-if="detail.competitionRules?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">竞赛规则</h3>
            <div class="space-y-3">
              <div v-for="(rule, idx) in detail.competitionRules" :key="idx" class="rounded-xl bg-gray-50 p-4">
                <h4 class="font-semibold text-gray-800 text-sm mb-1">{{ rule.title }}</h4>
                <p class="text-sm text-gray-600">{{ rule.content }}</p>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Scoring Criteria -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }" class="mb-6" v-if="detail.scoringCriteria?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">评分标准</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li v-for="item in detail.scoringCriteria" :key="item">{{ item }}</li>
            </ul>
          </section>
        </Motion>

        <!-- Notices -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.3 }" class="mb-6" v-if="detail.notices?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">注意事项</h3>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li v-for="item in detail.notices" :key="item">{{ item }}</li>
            </ul>
          </section>
        </Motion>

        <!-- Process Guide -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.35 }" class="mb-6" v-if="detail.processGuide?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">参赛流程</h3>
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-200"></div>
              <div class="space-y-6 relative">
                <div v-for="(step, idx) in detail.processGuide" :key="idx" class="flex gap-4 pl-2">
                  <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shrink-0">
                    {{ step.step }}
                  </div>
                  <div class="pt-1">
                    <p class="text-sm text-gray-700">{{ step.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Awards Display -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.4 }" class="mb-6" v-if="detail.awardsDisplay?.length">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-3 text-lg font-bold text-gray-800">奖项展示</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-gray-500">
                    <th class="pb-2 pr-4 font-medium">奖项级别</th>
                    <th class="pb-2 font-medium">名额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in detail.awardsDisplay" :key="idx" class="border-b border-gray-50">
                    <td class="py-2 pr-4 text-gray-800 font-medium">{{ item.level }}</td>
                    <td class="py-2 text-gray-600">{{ item.count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </Motion>

        <!-- Related Majors (Pro) -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.45 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">关联专业</h3>
            <template v-if="isPro">
              <div v-loading="majorsLoading" class="min-h-[100px]">
                <div v-if="majors.length" class="flex flex-wrap gap-3">
                  <button
                    v-for="m in majors" :key="m.majorId"
                    class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
                    @click="goMajorDetail(m.majorId)"
                  >
                    {{ m.majorName }}
                  </button>
                </div>
                <div v-else-if="!majorsLoading" class="text-sm text-gray-400">暂无关联专业数据</div>
              </div>
              <div v-if="majorsTotal > majorsPageSize" class="mt-4 flex justify-center">
                <el-pagination
                  background small layout="prev, pager, next"
                  :total="majorsTotal" :page-size="majorsPageSize"
                  :current-page="majorsPage"
                  @current-change="onMajorsPageChange"
                />
              </div>
            </template>
            <template v-else>
              <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
                <div class="text-4xl mb-3">🔒</div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看关联专业</h4>
                <p class="text-gray-500 mb-4">了解该竞赛适合哪些本科专业报考</p>
                <button
                  class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
                  @click="router.push('/profile')"
                >
                  立即升级
                </button>
              </div>
            </template>
          </section>
        </Motion>
      </template>

      <template v-if="error && !loading">
        <div class="py-20 text-center">
          <svg class="inline-block w-12 h-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-400">{{ error }}</p>
          <button class="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium"
            @click="router.back()"
          >返回</button>
        </div>
      </template>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 7: Major Detail - Add Related Competitions

**Files:**
- Modify: `apps/user/src/views/major/Detail.vue`

- [ ] **Step 1: Add related competitions section**

Add to the `<script>` section (import items and logic):

```typescript
// ADD imports
import { getMajorCompetitions } from '@/api/major'
import type { CompetitionBriefVO } from '@/types/certificate'
import { useUserStore } from '@/store'

// ADD state variables after existing refs
const userStore = useUserStore()
const competitions = ref<CompetitionBriefVO[]>([])
const compTotal = ref(0)
const compPage = ref(1)
const compPageSize = ref(10)
const compLoading = ref(false)

const isPro = computed(() => {
  const mt = userStore.userInfo?.memberType
  return mt === 'pro' || mt === 'vip'
})

// ADD methods
async function fetchCompetitions() {
  const id = Number(route.params.id)
  if (!id || !isPro.value) return
  compLoading.value = true
  try {
    const res = await getMajorCompetitions(id, { page: compPage.value, size: compPageSize.value })
    competitions.value = res.data.data.records
    compTotal.value = res.data.data.total
  } catch {
    // 403 handled silently
  } finally {
    compLoading.value = false
  }
}

function onCompPageChange(page: number) {
  compPage.value = page
  fetchCompetitions()
}

function goCompetitionDetail(id: number) {
  router.push(`/competition/${id}`)
}

// ADD to onMounted
onMounted(() => {
  fetchDetail()
  fetchCompetitions()
})
```

- [ ] **Step 2: Add template section after "Courses & Skills"**

Add after the closing `</Motion>` of the "Courses & Skills" card (line 168), before the error template:

```vue
        <!-- Related Competitions (Pro) -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.3 }" class="mb-6">
          <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800">关联竞赛</h3>
            <template v-if="isPro">
              <div v-loading="compLoading" class="min-h-[100px]">
                <div v-if="competitions.length" class="flex flex-wrap gap-3">
                  <button
                    v-for="c in competitions" :key="c.competitionId"
                    class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
                    @click="goCompetitionDetail(c.competitionId)"
                  >
                    {{ c.competitionName }}
                  </button>
                </div>
                <div v-else-if="!compLoading" class="text-sm text-gray-400">暂无关联竞赛数据</div>
              </div>
              <div v-if="compTotal > compPageSize" class="mt-4 flex justify-center">
                <el-pagination
                  background small layout="prev, pager, next"
                  :total="compTotal" :page-size="compPageSize"
                  :current-page="compPage"
                  @current-change="onCompPageChange"
                />
              </div>
            </template>
            <template v-else>
              <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
                <div class="text-4xl mb-3">🔒</div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看关联竞赛</h4>
                <p class="text-gray-500 mb-4">了解该专业适合参加哪些学科竞赛</p>
                <button
                  class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
                  @click="router.push('/profile')"
                >
                  立即升级
                </button>
              </div>
            </template>
          </section>
        </Motion>
```

---

### Task 8: Style adjustments

No special style work needed — all styling follows existing Tailwind patterns. Verify consistency:
- Background: `bg-gradient-to-b from-slate-50 to-white`
- Cards: `rounded-2xl bg-white p-6 shadow-lg border border-gray-100`
- Buttons: `bg-gradient-to-r from-orange-500 to-amber-500`
- Intro banners: `rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100`

## Cross-cutting concerns

- All error messages use `ElMessage.error`
- API errors shown in dialogs use `ElMessage.error` with `e?.response?.data?.msg`
- Loading states use Element Plus `v-loading`
- `MemberType` comparison uses string comparison `'pro' | 'vip'` (matching the `member_type` field from the API)
