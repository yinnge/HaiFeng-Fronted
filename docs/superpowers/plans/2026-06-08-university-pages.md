# 院校页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户端院校列表、详情、适应指南 3 个页面

**Architecture:** 遵循现有用户端模式，api/ 调用后端 C 端接口，types/ 定义 VO/DTO，views/ 实现页面组件。列表页公开访问，详情页和指南页需登录，学业规划类需 Pro 会员。

**Tech Stack:** Vue 3 Composition API + TypeScript + Element Plus + Tailwind CSS

---

### Task 1: 创建院校类型定义

**Files:**
- Create: `apps/user/src/types/university/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface UniversityQueryDTO extends BasePageQuery {
  name?: string
  provinceName?: string
  nature?: string
  category?: string
  department?: string
  educationLevel?: string
  hasDoctorate?: boolean
  hasMaster?: boolean
}

export interface UniversityListVO {
  id: number
  name: string
  tags: string[]
  cityName: string
  educationLevel: string
  provinceName: string
  introduction: string
  imageUrl: string
  nature: string
  category: string
  majorCount: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
}

export interface UniversityDetailVO {
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number
  scienceGroupScore: number
  carouselImages: string[]
  introduction: string
  rankings: Record<string, number>
  abroadRate: string
  genderRatio: string
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  recommendationRate: number
  recommendationYear: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
  tags: string[]
  famousUnion: string
}

export interface GuideOverviewVO {
  customTags: string[]
  name: string
  tags: string[]
  region: string
  category: string
  nature: string
  imageUrl: string
}

export interface GuideCategoryVO {
  [key: string]: Record<string, any>
}

export interface GalleryItemVO {
  imageType: string
  imageUrl: string
}
```

### Task 2: 创建院校 API

**Files:**
- Create: `apps/user/src/api/university/index.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityDetailVO,
  GuideOverviewVO,
  GuideCategoryVO,
  GalleryItemVO,
} from '@/types/university'

const PREFIX = '/api/v1/app/university'

export const getUniversityList = (params: UniversityQueryDTO) =>
  request.get<R<PageResult<UniversityListVO>>>(`${PREFIX}/list`, { params })

export const getUniversityDetail = (id: number) =>
  request.get<R<UniversityDetailVO>>(`${PREFIX}/${id}/detail`)

export const getGuideOverview = (id: number) =>
  request.get<R<GuideOverviewVO>>(`${PREFIX}/guides/${id}/overview`)

export const getGuideSurvival = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/survival`)

export const getGuideAcademic = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/academic`)

export const getGuideSocial = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/social`)

export const getGuideSafety = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/safety`)

export const getGuideLife = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/life`)

export const getCampusGallery = (id: number, params: { page?: number; size?: number; imageType?: string }) =>
  request.get<R<PageResult<GalleryItemVO>>>(`${PREFIX}/${id}/gallery`, { params })
```

### Task 3: 添加路由

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: 在 routes 数组中添加 3 个新路由**

在 `const routes: RouteRecordRaw[]` 数组中，在 `Profile` 路由之后添加：

```typescript
  {
    path: '/university',
    name: 'UniversityList',
    component: () => import('@/views/university/List.vue'),
    meta: { title: '院校列表' },
  },
  {
    path: '/university/:id',
    name: 'UniversityDetail',
    component: () => import('@/views/university/Detail.vue'),
    meta: { title: '院校详情', requiresAuth: true },
  },
  {
    path: '/university/:id/guide',
    name: 'UniversityGuide',
    component: () => import('@/views/university/Guide.vue'),
    meta: { title: '适应指南', requiresAuth: true },
  },
```

### Task 4: 创建院校列表页

**Files:**
- Create: `apps/user/src/views/university/List.vue`

- [ ] **Step 1: 创建列表页组件**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUniversityList } from '@/api/university'
import type { UniversityListVO, UniversityQueryDTO } from '@/types/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const list = ref<UniversityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)

const query = reactive<UniversityQueryDTO>({
  page: 1,
  size: 9,
  name: '',
  provinceName: '',
  nature: '',
  category: '',
  department: '',
  educationLevel: '',
})

const hasDoctorate = ref<string>('')
const hasMaster = ref<string>('')

const natureOptions = ['公办', '民办', '中外合作']
const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']
const educationLevelOptions = ['本科', '专科', '本专兼招']

async function fetchList() {
  loading.value = true
  try {
    const params: UniversityQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
    }
    if (query.name) params.name = query.name
    if (query.provinceName) params.provinceName = query.provinceName
    if (query.nature) params.nature = query.nature
    if (query.category) params.category = query.category
    if (query.department) params.department = query.department
    if (query.educationLevel) params.educationLevel = query.educationLevel
    if (hasDoctorate.value) params.hasDoctorate = hasDoctorate.value === 'true'
    if (hasMaster.value) params.hasMaster = hasMaster.value === 'true'

    const res = await getUniversityList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取院校列表失败')
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
  query.provinceName = ''
  query.nature = ''
  query.category = ''
  query.department = ''
  query.educationLevel = ''
  hasDoctorate.value = ''
  hasMaster.value = ''
  currentPage.value = 1
  fetchList()
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

function goDetail(id: number) {
  router.push(`/university/${id}`)
}

function goGuide(id: number) {
  router.push(`/university/${id}/guide`)
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
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">院校列表</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- 搜索栏 -->
      <div class="mb-6 flex items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入院校名称搜索"
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
      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <el-select v-model="query.provinceName" placeholder="省份" clearable filterable>
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="query.nature" placeholder="办学性质" clearable>
          <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="query.category" placeholder="院校类型" clearable filterable>
          <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <input
          v-model="query.department"
          type="text"
          placeholder="主管部门"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <el-select v-model="query.educationLevel" placeholder="学历层次" clearable>
          <el-option v-for="opt in educationLevelOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="hasDoctorate" placeholder="博士点" clearable>
          <el-option label="全部" value="" />
          <el-option label="有" value="true" />
          <el-option label="无" value="false" />
        </el-select>
        <el-select v-model="hasMaster" placeholder="硕士点" clearable>
          <el-option label="全部" value="" />
          <el-option label="有" value="true" />
          <el-option label="无" value="false" />
        </el-select>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in list"
            :key="item.id"
            class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl overflow-hidden transition-all"
          >
            <div class="aspect-[16/9] overflow-hidden bg-gray-50">
              <img
                :src="item.imageUrl || ''"
                :alt="item.name"
                class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="($event.target as HTMLImageElement).src = ''"
              />
            </div>
            <div class="p-5">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.name }}</h3>
                <span class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 ml-2">{{ item.nature }}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="tag in item.tags" :key="tag" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  {{ tag }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-y-1.5 text-sm text-gray-500 mb-4">
                <span>{{ item.provinceName }} · {{ item.cityName }}</span>
                <span>{{ item.category }}</span>
                <span>{{ item.educationLevel }}</span>
                <span>{{ item.majorCount }} 个专业</span>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                  @click="goDetail(item.id)"
                >
                  院校详情
                </button>
                <button
                  class="flex-1 rounded-lg border border-orange-300 py-2 text-sm text-orange-500 font-medium hover:bg-orange-50 transition-all"
                  @click="goGuide(item.id)"
                >
                  适应指南
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">
          暂无院校数据
        </div>
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
  </div>
</template>
```

### Task 5: 创建院校详情页

**Files:**
- Create: `apps/user/src/views/university/Detail.vue`

- [ ] **Step 1: 创建详情页组件**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUniversityDetail } from '@/api/university'
import type { UniversityDetailVO } from '@/types/university'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('院校ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

function goGuide() {
  router.push(`/university/${route.params.id}/guide`)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/university')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.name }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 轮播图 -->
        <div v-if="detail.carouselImages?.length" class="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <el-carousel height="420px" indicator-position="outside" arrow="always">
            <el-carousel-item v-for="(img, idx) in detail.carouselImages" :key="idx">
              <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 基本信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ detail.name }}</h2>
          <p v-if="detail.nameEn" class="mb-4 text-gray-400">{{ detail.nameEn }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tag in detail.tags" :key="tag" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ tag }}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">大区：</span><span class="text-gray-700">{{ detail.region }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.provinceName }}</span></div>
            <div><span class="text-gray-400">城市：</span><span class="text-gray-700">{{ detail.cityName }}</span></div>
            <div><span class="text-gray-400">类型：</span><span class="text-gray-700">{{ detail.category }}</span></div>
            <div><span class="text-gray-400">性质：</span><span class="text-gray-700">{{ detail.nature }}</span></div>
            <div><span class="text-gray-400">学历层次：</span><span class="text-gray-700">{{ detail.educationLevel }}</span></div>
            <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700">{{ detail.department }}</span></div>
            <div><span class="text-gray-400">所属联盟：</span><span class="text-gray-700">{{ detail.famousUnion || '-' }}</span></div>
            <div><span class="text-gray-400">专业数：</span><span class="text-gray-700">{{ detail.majorCount }}</span></div>
            <div><span class="text-gray-400">博士点：</span><span class="text-gray-700">{{ detail.hasDoctorate ? '有' : '无' }}</span></div>
            <div><span class="text-gray-400">硕士点：</span><span class="text-gray-700">{{ detail.hasMaster ? '有' : '无' }}</span></div>
          </div>
        </section>

        <!-- 详细信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="mb-4 text-lg font-bold text-gray-800">详细信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">地址：</span><span class="text-gray-700">{{ detail.address || '-' }}</span></div>
            <div><span class="text-gray-400">招生电话：</span><span class="text-gray-700">{{ detail.admissionPhone || '-' }}</span></div>
            <div><span class="text-gray-400">官网：</span><a v-if="detail.website" :href="detail.website" target="_blank" class="text-orange-500 hover:underline">{{ detail.website }}</a><span v-else class="text-gray-700">-</span></div>
            <div><span class="text-gray-400">历史组分数线：</span><span class="text-gray-700">{{ detail.historyGroupScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">物理组分数线：</span><span class="text-gray-700">{{ detail.scienceGroupScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">推荐率：</span><span class="text-gray-700">{{ detail.recommendationRate ? `${detail.recommendationRate}%` : '-' }}</span></div>
            <div><span class="text-gray-400">推荐年份：</span><span class="text-gray-700">{{ detail.recommendationYear ?? '-' }}</span></div>
            <div><span class="text-gray-400">出国比例：</span><span class="text-gray-700">{{ detail.abroadRate || '-' }}</span></div>
            <div><span class="text-gray-400">男女比例：</span><span class="text-gray-700">{{ detail.genderRatio || '-' }}</span></div>
          </div>
          <div v-if="detail.rankings && Object.keys(detail.rankings).length" class="mt-4">
            <span class="text-gray-400">排行榜：</span>
            <div class="mt-2 flex flex-wrap gap-3">
              <span v-for="(val, key) in detail.rankings" :key="key" class="rounded-lg bg-orange-50 px-3 py-1.5 text-sm text-orange-700">
                {{ key }}: 第 {{ val }} 名
              </span>
            </div>
          </div>
        </section>

        <!-- 详细介绍 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="mb-4 text-lg font-bold text-gray-800">院校介绍</h3>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction || '暂无详细介绍' }}</p>
        </section>

        <!-- 操作 -->
        <div class="text-center pb-8">
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="goGuide"
          >
            查看适应指南
          </button>
        </div>
      </template>
    </main>
  </div>
</template>
```

### Task 6: 创建适应指南页

**Files:**
- Create: `apps/user/src/views/university/Guide.vue`

- [ ] **Step 1: 创建指南页面组件**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getGuideOverview, getGuideSurvival, getGuideAcademic, getGuideSocial, getGuideSafety, getGuideLife, getCampusGallery } from '@/api/university'
import type { GuideOverviewVO, GuideCategoryVO, GalleryItemVO } from '@/types/university'
import { MemberType } from '@haifeng/shared'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const overview = ref<GuideOverviewVO | null>(null)
const activeCategory = ref<string>('')
const categoryData = ref<GuideCategoryVO | null>(null)
const galleryList = ref<GalleryItemVO[]>([])
const galleryLoading = ref(false)
const galleryTotal = ref(0)
const galleryPage = ref(1)

const isPro = computed(() => {
  return userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP
})

const categories = [
  { key: 'survival', label: '基础生存类', icon: '🛡️', requiresPro: false, desc: '校园设施、宿舍、交通' },
  { key: 'academic', label: '学业规划类', icon: '📚', requiresPro: true, desc: '学业指导、转专业、学习资源' },
  { key: 'social', label: '社交融入类', icon: '🤝', requiresPro: false, desc: '社团、活动、班级宿舍' },
  { key: 'safety', label: '权益与安全类', icon: '🔒', requiresPro: false, desc: '资助、安全、医疗' },
  { key: 'life', label: '周边生活类', icon: '🏪', requiresPro: false, desc: '生活服务' },
  { key: 'gallery', label: '校园图册', icon: '📷', requiresPro: false, desc: '校园风景' },
]

async function fetchOverview() {
  const id = Number(route.params.id)
  if (!id) return
  try {
    const res = await getGuideOverview(id)
    overview.value = res.data.data
  } catch {
    ElMessage.error('获取指南信息失败')
  }
}

async function handleCategoryClick(cat: typeof categories[0]) {
  if (cat.requiresPro && !isPro.value) {
    ElMessageBox.alert('该内容需要专业版及以上会员才能查看', '权限不足', {
      confirmButtonText: '知道了',
      type: 'warning',
    })
    return
  }

  activeCategory.value = cat.key
  categoryData.value = null
  galleryList.value = []
  galleryTotal.value = 0

  if (cat.key === 'gallery') {
    await fetchGallery()
    return
  }

  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  try {
    let res: any
    switch (cat.key) {
      case 'survival': res = await getGuideSurvival(id); break
      case 'academic': res = await getGuideAcademic(id); break
      case 'social': res = await getGuideSocial(id); break
      case 'safety': res = await getGuideSafety(id); break
      case 'life': res = await getGuideLife(id); break
    }
    if (res?.data?.data) {
      categoryData.value = res.data.data
    } else {
      categoryData.value = {}
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取内容失败')
  } finally {
    loading.value = false
  }
}

async function fetchGallery() {
  const id = Number(route.params.id)
  if (!id) return
  galleryLoading.value = true
  try {
    const res = await getCampusGallery(id, { page: galleryPage.value, size: 20 })
    galleryList.value = res.data.data.records
    galleryTotal.value = res.data.data.total
  } catch {
    ElMessage.error('获取图册失败')
  } finally {
    galleryLoading.value = false
  }
}

onMounted(fetchOverview)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push(`/university/${route.params.id}`)">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回详情</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">新生校园适应指南</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- 引导文案 -->
      <section class="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 shadow-md border border-orange-100">
        <p class="text-gray-700 leading-relaxed text-center">
          新生校园适应指南为您提供全面的校园适应指导，涵盖生存保障、学业规划、社交融入、权益支持等核心维度，助您快速适应大学生活。
        </p>
      </section>

      <!-- 院校基本信息 -->
      <section v-if="overview" class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <div class="flex items-center gap-4">
          <img
            :src="overview.imageUrl || ''"
            :alt="overview.name"
            class="h-20 w-20 rounded-xl object-cover shadow-md"
            @error="($event.target as HTMLImageElement).src = ''"
          />
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ overview.name }}</h2>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in overview.tags" :key="tag" class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ tag }}</span>
              <span v-for="tag in overview.customTags" :key="tag" class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-600">{{ tag }}</span>
            </div>
            <div class="flex gap-4 mt-2 text-sm text-gray-500">
              <span>{{ overview.region }}</span>
              <span>{{ overview.category }}</span>
              <span>{{ overview.nature }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 分类按钮 -->
      <section class="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          v-for="cat in categories"
          :key="cat.key"
          :disabled="cat.requiresPro && !isPro"
          class="relative rounded-2xl p-5 text-center transition-all border"
          :class="activeCategory === cat.key
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg border-transparent'
            : cat.requiresPro && !isPro
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-gray-700 border-gray-100 shadow-md hover:shadow-lg hover:border-orange-200'
          "
          @click="handleCategoryClick(cat)"
        >
          <div class="text-3xl mb-2">{{ cat.icon }}</div>
          <div class="text-sm font-semibold">{{ cat.label }}</div>
          <div class="text-xs mt-1 opacity-75">{{ cat.desc }}</div>
          <div v-if="cat.requiresPro && !isPro" class="absolute top-2 right-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <div v-if="cat.requiresPro && !isPro" class="mt-1 text-xs text-gray-400">需要专业版</div>
        </button>
      </section>

      <!-- 内容展示区 -->
      <section v-loading="loading || galleryLoading" class="min-h-[200px]">
        <!-- JSONB 数据渲染 -->
        <template v-if="categoryData && Object.keys(categoryData).length > 0">
          <div v-for="(value, key) in categoryData" :key="key" class="mb-6 rounded-2xl bg-white p-6 shadow-md border border-gray-100">
            <h3 class="mb-4 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">{{ key }}</h3>
            <div v-if="typeof value === 'object' && value !== null" class="space-y-3">
              <div v-for="(v, k) in value" :key="k" class="flex">
                <span class="text-gray-500 w-32 shrink-0">{{ k }}：</span>
                <span class="text-gray-700">{{ typeof v === 'object' ? JSON.stringify(v) : v }}</span>
              </div>
            </div>
            <p v-else class="text-gray-600">{{ value }}</p>
          </div>
        </template>

        <!-- 图册 -->
        <template v-if="activeCategory === 'gallery'">
          <div v-if="galleryList.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="(item, idx) in galleryList" :key="idx" class="group rounded-xl overflow-hidden shadow-md bg-white">
              <div class="aspect-[4/3] overflow-hidden">
                <img
                  :src="item.imageUrl"
                  :alt="item.imageType"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p class="p-2 text-center text-xs text-gray-500">{{ item.imageType }}</p>
            </div>
          </div>
          <p v-else class="py-12 text-center text-gray-400">暂无图册内容</p>
          <div v-if="galleryTotal > 20" class="mt-6 flex justify-center">
            <el-pagination background layout="prev, pager, next" :total="galleryTotal" :page-size="20" :current-page="galleryPage" @current-change="(p: number) => { galleryPage = p; fetchGallery() }" />
          </div>
        </template>

        <!-- 空状态 -->
        <div v-if="!activeCategory" class="py-16 text-center">
          <p class="text-gray-400 text-lg">请点击上方分类按钮查看对应指南内容</p>
        </div>
      </section>
    </main>
  </div>
</template>
```

