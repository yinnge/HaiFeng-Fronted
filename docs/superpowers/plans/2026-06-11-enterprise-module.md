# C 端企业管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build C-end enterprise management pages — enterprise list, enterprise positions, enterprise↔industry cross-links.

**Architecture:** Follow existing codebase patterns: card-based UI with Tailwind CSS, Element Plus components, Composition API `<script setup>`, lazy-loaded routes.

**Tech Stack:** Vue 3, TypeScript, Tailwind CSS, Element Plus, Pinia, Vue Router 4, Axios

---

### Task 1: Enterprise Types

**Files:**
- Create: `apps/user/src/types/enterprise/index.ts`

- [ ] **Step 1: Define front-end types**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface EnterpriseQueryDTO extends BasePageQuery {
  enterpriseName?: string
  enterpriseNature?: string
  enterpriseType?: string
  cityName?: string
  recruitmentStatus?: string
}

export interface EnterpriseListVO {
  id: number
  cityName: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  logoUrl: string | null
  officialWebsite: string | null
  region: string | null
  enterpriseScale: string | null
  mainBusiness: string | null
  enterpriseIntro: string | null
}

export interface EnterprisePositionVO {
  positionName: string
  recruitmentType: string | null
  positionRequirement: string | null
  positionTags: string[] | null
  province: string | null
  city: string | null
  workLocation: string | null
  educationRequirement: string | null
  majorRequirement: string | null
  workExperience: string | null
  salaryMin: number | null
  salaryMax: number | null
  applyLink: string | null
  deadline: string | null
  positionStatus: string | null
}

export interface EnterpriseIndustryGroupVO {
  enterpriseId: number
  industries: IndustryJumpVO[]
}

export interface IndustryJumpVO {
  industryId: number
  industryName: string
}

export interface IndustryEnterpriseGroupVO {
  industryId: number
  enterprises: EnterpriseJumpVO[]
}

export interface EnterpriseJumpVO {
  enterpriseId: number
  enterpriseName: string
}
```

---

### Task 2: Enterprise API

**Files:**
- Create: `apps/user/src/api/enterprise/index.ts`

- [ ] **Step 1: Create API module**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  EnterpriseQueryDTO,
  EnterpriseListVO,
  EnterprisePositionVO,
  EnterpriseIndustryGroupVO,
} from '@/types/enterprise'
import type { IndustryEnterpriseGroupVO } from '@/types/enterprise'

const ENTERPRISE_PREFIX = '/api/v1/app/enterprise'
const INDUSTRY_PREFIX = '/api/v1/app/industry'

export const getEnterpriseList = (params: EnterpriseQueryDTO) =>
  request.get<R<PageResult<EnterpriseListVO>>>(`${ENTERPRISE_PREFIX}/list`, { params })

export const getPositions = (enterpriseId: number) =>
  request.get<R<EnterprisePositionVO[]>>(`${ENTERPRISE_PREFIX}/${enterpriseId}/positions`)

export const getEnterpriseIndustries = (enterpriseIds: number[]) =>
  request.get<R<EnterpriseIndustryGroupVO[]>>(`${ENTERPRISE_PREFIX}/industries`, {
    params: { enterpriseIds },
  })

export const getIndustryEnterprises = (industryIds: number[]) =>
  request.get<R<IndustryEnterpriseGroupVO[]>>(`${INDUSTRY_PREFIX}/enterprises`, {
    params: { industryIds },
  })
```

---

### Task 3: Router

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: Add enterprise routes before the 404 catch-all**

Insert these two route objects after the `competition/:id` route and before the `/:pathMatch(.*)*` catch-all:

```typescript
  {
    path: '/enterprise',
    name: 'EnterpriseList',
    component: () => import('@/views/enterprise/List.vue'),
    meta: { title: '企业探索' },
  },
  {
    path: '/enterprise/:id/positions',
    name: 'EnterprisePositionList',
    component: () => import('@/views/enterprise/PositionList.vue'),
    meta: { title: '企业岗位', requiresAuth: true },
  },
```

---

### Task 4: Enterprise List Page

**Files:**
- Create: `apps/user/src/views/enterprise/List.vue`

- [ ] **Step 1: Create the full enterprise list page**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getEnterpriseList } from '@/api/enterprise'
import type { EnterpriseListVO, EnterpriseQueryDTO } from '@/types/enterprise'

const router = useRouter()

const loading = ref(false)
const list = ref<EnterpriseListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)

const query = reactive<EnterpriseQueryDTO>({
  page: 1,
  size: 9,
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  cityName: '',
  recruitmentStatus: '',
})

const natureOptions = ['央企', '国企', '民企', '外企', '合资']
const statusOptions = ['招聘中', '已结束']

async function fetchList() {
  loading.value = true
  try {
    const params: EnterpriseQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (query.enterpriseName) params.enterpriseName = query.enterpriseName
    if (query.enterpriseNature) params.enterpriseNature = query.enterpriseNature
    if (query.enterpriseType) params.enterpriseType = query.enterpriseType
    if (query.cityName) params.cityName = query.cityName
    if (query.recruitmentStatus) params.recruitmentStatus = query.recruitmentStatus

    const res = await getEnterpriseList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取企业列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.enterpriseName = ''
  query.enterpriseNature = ''
  query.enterpriseType = ''
  query.cityName = ''
  query.recruitmentStatus = ''
  currentPage.value = 1
  fetchList()
}

function goPositions(item: EnterpriseListVO) {
  router.push({
    path: `/enterprise/${item.id}/positions`,
    query: {
      name: item.enterpriseName,
      nature: item.enterpriseNature,
      city: item.cityName,
      logoUrl: item.logoUrl || '',
      region: item.region || '',
      scale: item.enterpriseScale || '',
      mainBusiness: item.mainBusiness || '',
    },
  })
}

function onPageChange(page: number) { currentPage.value = page; fetchList() }
function onSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }

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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">企业探索</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Banner -->
      <div class="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
        <p class="text-gray-700 leading-relaxed">
          聚合优质企业信息，覆盖互联网/IT、金融、制造、教育等行业头部企业，提供企业规模、主营业务、招聘状态等数据，助您了解目标企业，规划职业发展。
        </p>
      </div>

      <!-- 搜索栏 -->
      <div class="mb-6 flex items-center gap-3">
        <input
          v-model="query.enterpriseName"
          type="text"
          placeholder="输入企业名称搜索"
          class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
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

      <!-- 精准筛选 -->
      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <el-select v-model="query.enterpriseNature" placeholder="企业性质" clearable>
          <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <input
          v-model="query.enterpriseType"
          type="text"
          placeholder="企业类型"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <input
          v-model="query.cityName"
          type="text"
          placeholder="城市名称"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <el-select v-model="query.recruitmentStatus" placeholder="招聘状态" clearable>
          <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in list"
            :key="item.id"
            class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all overflow-hidden"
          >
            <div class="p-5">
              <div class="flex items-start gap-4 mb-3">
                <div class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="item.logoUrl"
                    :src="item.logoUrl"
                    :alt="item.enterpriseName"
                    class="w-full h-full object-cover"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <span v-else class="text-lg font-bold text-orange-600">{{ item.enterpriseName.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.enterpriseName }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.enterpriseNature }}</span>
                    <span v-if="item.enterpriseType" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ item.enterpriseType }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5 text-sm text-gray-500 mb-3">
                <div v-if="item.cityName">📍 {{ item.cityName }}</div>
                <div v-if="item.enterpriseScale">👥 {{ item.enterpriseScale }}</div>
                <div v-if="item.region">🏠 {{ item.region }}</div>
              </div>

              <p v-if="item.mainBusiness" class="text-sm text-gray-400 line-clamp-2 mb-4">{{ item.mainBusiness }}</p>

              <button
                class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="goPositions(item)"
              >
                查看岗位
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无企业数据</div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[9, 18, 30]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

---

### Task 5: Enterprise Position List Page (with Industry Tags)

**Files:**
- Create: `apps/user/src/views/enterprise/PositionList.vue`

- [ ] **Step 1: Create the position list page**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPositions, getEnterpriseIndustries } from '@/api/enterprise'
import { useUserStore } from '@/store/modules/user'
import type { EnterprisePositionVO, EnterpriseIndustryGroupVO } from '@/types/enterprise'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const enterpriseId = Number(route.params.id)
const enterpriseName = (route.query.name as string) || ''
const enterpriseNature = (route.query.nature as string) || ''
const enterpriseCity = (route.query.city as string) || ''
const enterpriseLogoUrl = (route.query.logoUrl as string) || ''
const enterpriseRegion = (route.query.region as string) || ''
const enterpriseScale = (route.query.scale as string) || ''
const enterpriseMainBusiness = (route.query.mainBusiness as string) || ''

const loading = ref(false)
const positions = ref<EnterprisePositionVO[]>([])
const industries = ref<EnterpriseIndustryGroupVO[]>([])
const industriesLoading = ref(false)
const isPro = ref(false)

async function fetchPositions() {
  if (!enterpriseId) {
    ElMessage.error('企业ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getPositions(enterpriseId)
    positions.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取岗位列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchIndustries() {
  industriesLoading.value = true
  try {
    const res = await getEnterpriseIndustries([enterpriseId])
    industries.value = res.data.data
    isPro.value = true
  } catch (e: any) {
    if (e?.response?.status === 403) {
      isPro.value = false
    }
  } finally {
    industriesLoading.value = false
  }
}

function goIndustry(id: number) {
  router.push(`/industry/${id}`)
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '薪资面议'
  if (min != null && max != null) return `${min}-${max}k/月`
  if (min != null) return `${min}k起/月`
  return `最高${max}k/月`
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return '暂无'
  return deadline.slice(0, 10)
}

function openApplyLink(link: string | null) {
  if (link) window.open(link, '_blank')
}

onMounted(() => {
  fetchPositions()
  fetchIndustries()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/enterprise')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回企业列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">{{ enterpriseName }} - 岗位列表</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- 企业信息卡片 -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="enterpriseLogoUrl"
              :src="enterpriseLogoUrl"
              :alt="enterpriseName"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span v-else class="text-2xl font-bold text-orange-600">{{ enterpriseName.charAt(0) }}</span>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ enterpriseName }}</h2>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ enterpriseNature }}</span>
              <span v-if="enterpriseCity">📍 {{ enterpriseCity }}</span>
              <span v-if="enterpriseRegion">🏠 {{ enterpriseRegion }}</span>
              <span v-if="enterpriseScale">👥 {{ enterpriseScale }}</span>
            </div>
            <p v-if="enterpriseMainBusiness" class="text-sm text-gray-400 mt-2">{{ enterpriseMainBusiness }}</p>
          </div>
        </div>
      </section>

      <!-- 关联行业区块（Pro 功能） -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
        <h3 class="mb-4 text-lg font-bold text-gray-800">🏭 关联行业</h3>
        <div v-if="industriesLoading" class="text-sm text-gray-400">加载中...</div>
        <template v-else-if="isPro">
          <div v-if="industries.length && industries[0].industries.length" class="flex flex-wrap gap-2">
            <button
              v-for="ind in industries[0].industries"
              :key="ind.industryId"
              class="rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-700 font-medium hover:bg-orange-100 transition-colors cursor-pointer"
              @click="goIndustry(ind.industryId)"
            >
              {{ ind.industryName }} →
            </button>
          </div>
          <p v-else class="text-sm text-gray-400">暂无关联行业</p>
        </template>
        <div v-else class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-100">
          <p class="text-sm text-gray-600">
            🔒 升级
            <router-link to="/profile" class="text-orange-500 font-semibold hover:underline">专业版</router-link>
            可查看企业关联行业信息
          </p>
        </div>
      </section>

      <!-- 岗位列表 -->
      <section v-loading="loading" class="min-h-[300px]">
        <h3 class="mb-4 text-lg font-bold text-gray-800">📋 共 {{ positions.length }} 个岗位</h3>

        <div v-if="positions.length" class="space-y-4">
          <div
            v-for="(pos, index) in positions"
            :key="index"
            class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="text-lg font-bold text-gray-800">{{ pos.positionName }}</h4>
              <div class="flex items-center gap-2">
                <span v-if="pos.recruitmentType" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ pos.recruitmentType }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-xs"
                  :class="pos.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
                >
                  {{ pos.positionStatus || '未知' }}
                </span>
              </div>
            </div>

            <div v-if="pos.positionTags?.length" class="flex flex-wrap gap-1.5 mb-3">
              <span v-for="tag in pos.positionTags" :key="tag" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                {{ tag }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500 mb-4">
              <div v-if="pos.province || pos.city || pos.workLocation">
                📍 {{ [pos.province, pos.city, pos.workLocation].filter(Boolean).join('·') }}
              </div>
              <div v-if="pos.salaryMin || pos.salaryMax">
                💰 {{ formatSalary(pos.salaryMin, pos.salaryMax) }}
              </div>
              <div v-if="pos.educationRequirement">
                🎓 {{ pos.educationRequirement }}
              </div>
              <div v-if="pos.majorRequirement">
                📚 {{ pos.majorRequirement }}
              </div>
              <div v-if="pos.workExperience">
                ⏱ {{ pos.workExperience }}
              </div>
              <div v-if="pos.deadline">
                📅 截止: {{ formatDeadline(pos.deadline) }}
              </div>
            </div>

            <div v-if="pos.positionRequirement" class="mb-4">
              <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{{ pos.positionRequirement }}</p>
            </div>

            <div class="flex justify-end">
              <button
                class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="openApplyLink(pos.applyLink)"
              >
                去申请 →
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">该企业暂无招聘岗位</div>
      </section>
    </main>
  </div>
</template>
```

---

### Task 6: Industry Detail - Related Enterprises Section

**Files:**
- Modify: `apps/user/src/views/industry/Detail.vue`

- [ ] **Step 1: Add script imports and logic**

After the existing `onMounted(fetchDetail)` and before `</script>`, add:

```typescript
import { getIndustryEnterprises } from '@/api/enterprise'
import type { IndustryEnterpriseGroupVO } from '@/types/enterprise'

const relatedEnterprises = ref<IndustryEnterpriseGroupVO[]>([])
const relatedLoading = ref(false)
const isProRelated = ref(false)

async function fetchRelatedEnterprises() {
  const industryId = Number(route.params.id)
  if (!industryId) return
  relatedLoading.value = true
  try {
    const res = await getIndustryEnterprises([industryId])
    relatedEnterprises.value = res.data.data
    isProRelated.value = true
  } catch (e: any) {
    if (e?.response?.status === 403) {
      isProRelated.value = false
    }
  } finally {
    relatedLoading.value = false
  }
}

function goEnterprisePositions(enterpriseId: number, enterpriseName: string) {
  router.push({
    path: `/enterprise/${enterpriseId}/positions`,
    query: { name: enterpriseName },
  })
}

// Update onMounted to also fetch related enterprises
onMounted(() => {
  fetchDetail()
  fetchRelatedEnterprises()
})
```

- [ ] **Step 2: Add the "关联企业" section template**

After the last `</section>` (详细描述 section) and before `</main>`, add:

```vue
        <!-- 关联企业 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🏢 关联企业</h3>
          <div v-if="relatedLoading" class="text-sm text-gray-400">加载中...</div>
          <template v-else-if="isProRelated">
            <div v-if="relatedEnterprises.length && relatedEnterprises[0].enterprises.length" class="space-y-3">
              <div
                v-for="ent in relatedEnterprises[0].enterprises"
                :key="ent.enterpriseId"
                class="flex items-center justify-between rounded-xl bg-gray-50 p-4 hover:bg-orange-50 transition-colors cursor-pointer"
                @click="goEnterprisePositions(ent.enterpriseId, ent.enterpriseName)"
              >
                <span class="font-medium text-gray-800">{{ ent.enterpriseName }}</span>
                <span class="text-sm text-orange-500 font-medium">查看岗位 →</span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400">暂无关联企业</p>
          </template>
          <div v-else class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-100">
            <p class="text-sm text-gray-600">
              🔒 升级
              <router-link to="/profile" class="text-orange-500 font-semibold hover:underline">专业版</router-link>
              可查看关联企业信息
            </p>
          </div>
        </section>
```

---

### Task 7: Verify build and lint

**Files:**
- Check: All files created/modified above

- [ ] **Step 1: Check that the user app builds without errors**

Run: `pnpm --filter @haifeng/user-app build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Check lint**

Run: `pnpm --filter @haifeng/user-app lint`
Expected: No lint errors
