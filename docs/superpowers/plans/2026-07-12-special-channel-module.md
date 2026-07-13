# C 端特殊招生通道模块 - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在用户端新增特殊招生通道模块（特殊通道列表/详情、强基计划数据列表/详情、强基院校配置），含导航入口和动态 Tab 切换页面。

**Architecture:** 单路由 `/special` + Tab 切换设计（特殊通道/强基计划），两个详情页走子路由。API 层、类型定义与 views 分离。卡片网格采用 2×5 列（信息少）和 5×2 列（信息多）的布局。

**Tech Stack:** Vue 3 (Composition API + `<script setup>`) + TypeScript + Element Plus + Tailwind CSS + Axios

---

## 文件结构

**新建文件：**
- `apps/user/src/api/special/index.ts` — 所有特殊通道模块 API（7 个接口）
- `apps/user/src/types/special/index.ts` — VO/DTO 类型定义
- `apps/user/src/views/special/index.vue` — 主页面（引导区 + Tab + 搜索 + 卡片网格 + 分页）
- `apps/user/src/views/special/ChannelDetail.vue` — 特殊通道详情（含通道-大学关联子模块 + 关联详情弹窗）
- `apps/user/src/views/special/StrongBaseDetail.vue` — 强基数据详情（含强基院校配置）

**修改文件：**
- `apps/user/src/router/index.ts` — 添加 3 条路由
- `apps/user/src/views/home/index.vue` — 导航栏添加「特殊通道」链接

---

### Task 1: 类型定义

**Files:**
- Create: `apps/user/src/types/special/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// apps/user/src/types/special/index.ts

// ===== 特殊招生通道 =====
export interface SpecialChannelListVO {
  id: number
  channelCode: string
  channelName: string
  subtitle: string
  filterLabel: string
  displayType: string
}

export interface SpecialChannelQueryDTO {
  page?: number
  size?: number
  displayType?: string
  channelName?: string
}

export interface SpecialChannelDetailVO {
  id: number
  channelCode: string
  channelName: string
  subtitle: string
  filterLabel: string
  displayType: string
  content: string
}

// ===== 通道-大学关联 =====
export interface ChannelUniversityListVO {
  universityId: number
  universityName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
}

export interface ChannelUniversityQueryDTO {
  page?: number
  size?: number
  channelCode: string
  regionTag?: string
  signupStart?: string
  signupEnd?: string
}

export interface ChannelUniversityDetailVO {
  id: number
  channelCode: string
  channelName: string
  universityId: number
  universityName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
  officialUrl: string
  brochureTitle: string
  brochureContent: string
}

// ===== 强基计划数据 =====
export interface StrongBaseScoreListVO {
  id: number
  universityId: number
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string
  entryScore: number
  entryScoreType: string
  entryRatio: string
  admissionScore: number
  planCount: number
  admissionCount: number
}

export interface StrongBaseScoreQueryDTO {
  page?: number
  size?: number
  year?: number
  province?: string
  subjectType?: string
  entryScoreType?: string
  universityName?: string
  majorName?: string
  majorCode?: string
}

export interface StrongBaseScoreDetailVO {
  id: number
  universityId: number
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string
  entryScore: number
  entryScoreType: string
  entryFormula: string
  entryRatio: string
  admissionScore: number
  admissionFormula: string
  planCount: number
  admissionCount: number
  remark: string
}

// ===== 强基院校配置 =====
export interface StrongBaseUniversityDetailVO {
  id: number
  universityId: number
  universityName: string
  isPilot: boolean
  pilotYear: number
  officialUrl: string
  signupUrl: string
  testBeforeScore: boolean
  defaultEntryRatio: string
  defaultAdmissionFormula: string
  availableMajors: string[]
  specialNotes: string
}

// ===== 展示类型映射 =====
export const DisplayTypeLabel: Record<string, string> = {
  UNIVERSITY_LIST: '院校列表',
  ARTICLE_ONLY: '文章',
  MAJOR_DATA: '专业数据',
  GROUP: '分组',
}

export const DisplayTypeOptions = [
  { value: '', label: '全部' },
  { value: 'UNIVERSITY_LIST', label: '院校列表' },
  { value: 'ARTICLE_ONLY', label: '文章' },
  { value: 'MAJOR_DATA', label: '专业数据' },
  { value: 'GROUP', label: '分组' },
]

export const SubjectTypeOptions = [
  { value: '', label: '全部' },
  { value: '物理类', label: '物理类' },
  { value: '历史类', label: '历史类' },
  { value: '理科', label: '理科' },
  { value: '文科', label: '文科' },
  { value: '综合改革', label: '综合改革' },
]

export const EntryScoreTypeOptions = [
  { value: '', label: '全部' },
  { value: '高考成绩', label: '高考成绩' },
  { value: '加权成绩', label: '加权成绩' },
  { value: '校测初试', label: '校测初试' },
]
```

- [ ] **Step 2: 验证文件语法**

Run: `npx tsc --noEmit apps/user/src/types/special/index.ts --strict`

Expected: 无类型错误（如有 import 路径问题可跳过，后续集成后验证）

---

### Task 2: API 层

**Files:**
- Create: `apps/user/src/api/special/index.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
// apps/user/src/api/special/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type {
  SpecialChannelListVO,
  SpecialChannelQueryDTO,
  SpecialChannelDetailVO,
  ChannelUniversityListVO,
  ChannelUniversityQueryDTO,
  ChannelUniversityDetailVO,
  StrongBaseScoreListVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreDetailVO,
  StrongBaseUniversityDetailVO,
} from '@/types/special'

// 1.1 通道列表
export const getChannelList = (params: SpecialChannelQueryDTO) => {
  return request.get<R<PageResult<SpecialChannelListVO>>>('/api/v1/app/special/channel/list', { params })
}

// 1.2 通道详情
export const getChannelDetail = (id: number) => {
  return request.get<R<SpecialChannelDetailVO>>(`/api/v1/app/special/channel/${id}`)
}

// 2.1 关联大学列表
export const getChannelUniversityList = (params: ChannelUniversityQueryDTO) => {
  return request.get<R<PageResult<ChannelUniversityListVO>>>('/api/v1/app/special/channel-univ/list', { params })
}

// 2.2 关联大学详情
export const getChannelUniversityDetail = (id: number) => {
  return request.get<R<ChannelUniversityDetailVO>>(`/api/v1/app/special/channel-univ/${id}`)
}

// 3.1 强基数据列表
export const getStrongBaseScoreList = (params: StrongBaseScoreQueryDTO) => {
  return request.get<R<PageResult<StrongBaseScoreListVO>>>('/api/v1/app/special/strong-base-score/list', { params })
}

// 3.2 强基数据详情
export const getStrongBaseScoreDetail = (id: number) => {
  return request.get<R<StrongBaseScoreDetailVO>>(`/api/v1/app/special/strong-base-score/${id}`)
}

// 4.1 强基院校配置
export const getStrongBaseUniversityDetail = (universityId: number) => {
  return request.get<R<StrongBaseUniversityDetailVO>>(`/api/v1/app/special/strong-base-univ/${universityId}`)
}
```

- [ ] **Step 2: 验证导入路径**

检查 `@haifeng/shared` 和 `@/types/special` 的 path alias 配置是否正确（确认 `vite.config.ts` 和 `tsconfig.json` 中存在对应映射）。

---

### Task 3: 路由配置

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: 在路由表中添加特殊通道模块路由**

在 `apps/user/src/router/index.ts` 的 `routes` 数组中，在 `EmploymentWelfareDetail` 路由之后、`NotFound` 之前插入：

```typescript
  {
    path: '/special',
    name: 'SpecialChannel',
    component: () => import('@/views/special/index.vue'),
    meta: { title: '特殊招生通道' },
  },
  {
    path: '/special/channel/:id',
    name: 'SpecialChannelDetail',
    component: () => import('@/views/special/ChannelDetail.vue'),
    meta: { title: '通道详情', requiresAuth: true },
  },
  {
    path: '/special/strong-base/:id',
    name: 'SpecialStrongBaseDetail',
    component: () => import('@/views/special/StrongBaseDetail.vue'),
    meta: { title: '强基数据详情', requiresAuth: true },
  },
```

- [ ] **Step 2: 验证路由配置**

确认 `import` 路径正确，无语法错误。

---

### Task 4: 导航栏添加「特殊通道」链接

**Files:**
- Modify: `apps/user/src/views/home/index.vue`

- [ ] **Step 1: 在 header 导航区域添加特殊通道链接**

找到 `apps/user/src/views/home/index.vue` 中 header 部分，在"岗位搜索"链接的 `<router-link>` 后面添加：

查找：
```html
          <router-link
            to="/employment/jobs"
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            岗位搜索
          </router-link>
```

替换为：
```html
          <router-link
            to="/employment/jobs"
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            岗位搜索
          </router-link>
          <router-link
            to="/special"
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
          >
            特殊通道
          </router-link>
```

---

### Task 5: 主页面 — 特殊通道模块首页

**Files:**
- Create: `apps/user/src/views/special/index.vue`

该页面为核心页面，包含：
1. 引导区
2. Tab 切换（特殊通道 / 强基计划）
3. 动态搜索栏
4. 动态卡片网格
5. 分页
6. SiteFooter

- [ ] **Step 1: 创建页面骨架**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getChannelList, getStrongBaseScoreList } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelListVO, StrongBaseScoreListVO } from '@/types/special'
import {
  DisplayTypeOptions,
  DisplayTypeLabel,
  SubjectTypeOptions,
  EntryScoreTypeOptions,
} from '@/types/special'

type TabKey = 'channel' | 'strong-base'

const activeTab = ref<TabKey>('channel')

const tabs = [
  { key: 'channel' as TabKey, label: '特殊通道' },
  { key: 'strong-base' as TabKey, label: '强基计划入围/录取数据' },
]

// ===== 特殊通道搜索字段 =====
const channelName = ref('')
const displayType = ref('')

// ===== 强基搜索字段 =====
const sYear = ref<number | undefined>(undefined)
const sProvince = ref('')
const sSubjectType = ref('')
const sEntryScoreType = ref('')
const sUniversityName = ref('')
const sMajorName = ref('')
const sMajorCode = ref('')

// ===== 分页 =====
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

// ===== 列表数据 =====
const channelRecords = ref<SpecialChannelListVO[]>([])
const strongBaseRecords = ref<StrongBaseScoreListVO[]>([])
const loading = ref(false)

const router = useRouter()

// 生成年份选项（近5年）
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = [{ value: undefined, label: '全部' }]
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i
    years.push({ value: y, label: `${y}年` })
  }
  return years
})

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'channel') {
      const res = await getChannelList({
        page: currentPage.value,
        size: pageSize,
        channelName: channelName.value || undefined,
        displayType: displayType.value || undefined,
      })
      channelRecords.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      const res = await getStrongBaseScoreList({
        page: currentPage.value,
        size: pageSize,
        year: sYear.value || undefined,
        province: sProvince.value || undefined,
        subjectType: sSubjectType.value || undefined,
        entryScoreType: sEntryScoreType.value || undefined,
        universityName: sUniversityName.value || undefined,
        majorName: sMajorName.value || undefined,
        majorCode: sMajorCode.value || undefined,
      })
      strongBaseRecords.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function onTabChange(tab: TabKey) {
  activeTab.value = tab
  currentPage.value = 1
  fetchData()
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function viewChannelDetail(id: number) {
  router.push(`/special/channel/${id}`)
}

function viewStrongBaseDetail(id: number) {
  router.push(`/special/strong-base/${id}`)
}

onMounted(fetchData)
</script>
```

- [ ] **Step 2: 创建页面模板（模板部分）**

```vue
<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <router-link to="/" class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span class="font-medium">首页</span>
        </router-link>
        <h1 class="text-xl font-bold text-gray-800">特殊招生通道</h1>
        <div class="w-20" />
      </div>
    </header>

    <main class="flex-1">
      <!-- 引导区 -->
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          多元化升学路径一览
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          特殊招生通道
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500">
          强基计划、综合评价、港澳招生等特殊类型招生信息一站式查询，助你把握多元升学机会
        </p>
      </div>

      <!-- Tab 切换 -->
      <div class="container mx-auto px-6 mb-8">
        <div class="flex justify-center gap-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            :class="activeTab === tab.key
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 shadow-sm'"
            @click="onTabChange(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ===== Tab: 特殊通道 搜索栏 ===== -->
      <div v-if="activeTab === 'channel'" class="container mx-auto px-6 mb-8">
        <div class="flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">通道名称</label>
            <input
              v-model="channelName"
              type="text"
              placeholder="输入通道名称"
              class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              @keyup.enter="onSearch"
            />
          </div>
          <div class="w-44">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">展示类型</label>
            <el-select v-model="displayType" placeholder="全部" clearable class="w-full" @change="onSearch">
              <el-option v-for="opt in DisplayTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
          <button
            class="h-[40px] px-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
            @click="onSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- ===== Tab: 强基计划 搜索栏 ===== -->
      <div v-if="activeTab === 'strong-base'" class="container mx-auto px-6 mb-8">
        <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">年份</label>
              <el-select v-model="sYear" placeholder="全部" clearable class="w-full">
                <el-option
                  v-for="opt in yearOptions"
                  :key="opt.value ?? 'all'"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">省份</label>
              <el-select v-model="sProvince" placeholder="全部" clearable filterable class="w-full">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">科类</label>
              <el-select v-model="sSubjectType" placeholder="全部" clearable class="w-full">
                <el-option v-for="opt in SubjectTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">入围类型</label>
              <el-select v-model="sEntryScoreType" placeholder="全部" clearable class="w-full">
                <el-option v-for="opt in EntryScoreTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">大学名称</label>
              <input
                v-model="sUniversityName"
                type="text"
                placeholder="模糊搜索"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">专业名称</label>
              <input
                v-model="sMajorName"
                type="text"
                placeholder="模糊搜索"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">专业代码</label>
              <input
                v-model="sMajorCode"
                type="text"
                placeholder="模糊搜索"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          </div>
          <div class="flex justify-center">
            <button
              class="px-8 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
              @click="onSearch"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Tab: 特殊通道 卡片网格 ===== -->
      <div v-if="activeTab === 'channel'" class="container mx-auto px-6 pb-8">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="channelRecords.length" class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              v-for="item in channelRecords"
              :key="item.id"
              class="group rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all flex flex-col"
            >
              <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-xl">
                {{ item.displayType === 'UNIVERSITY_LIST' ? '🏫' : item.displayType === 'ARTICLE_ONLY' ? '📄' : item.displayType === 'MAJOR_DATA' ? '📊' : '📋' }}
              </div>
              <h3 class="text-base font-bold text-gray-800 mb-0.5 truncate">{{ item.channelName }}</h3>
              <p class="text-xs text-gray-400 mb-2 line-clamp-2">{{ item.subtitle }}</p>
              <span v-if="item.filterLabel" class="self-start rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600 mb-2">{{ item.filterLabel }}</span>
              <p class="text-xs text-gray-400 mb-3">展示: {{ DisplayTypeLabel[item.displayType] || item.displayType }}</p>
              <button
                class="mt-auto w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all opacity-0 group-hover:opacity-100"
                @click="viewChannelDetail(item.id)"
              >
                查看详情 →
              </button>
            </div>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">
            暂无特殊通道数据
          </div>
        </div>
      </div>

      <!-- ===== Tab: 强基计划 卡片网格 ===== -->
      <div v-if="activeTab === 'strong-base'" class="container mx-auto px-6 pb-8">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="strongBaseRecords.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in strongBaseRecords"
              :key="item.id"
              class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800">{{ item.universityName }}</h3>
                <span class="text-xs text-gray-400">{{ item.year }}年</span>
              </div>
              <p class="text-sm text-gray-600 mb-3">
                {{ item.majorName }}
                <span v-if="item.majorCode" class="text-xs text-gray-400">({{ item.majorCode }})</span>
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <span>省份: {{ item.province }}</span>
                <span>科类: {{ item.subjectType }}</span>
                <span>入围类型: {{ item.entryScoreType }}</span>
                <span>入围比例: {{ item.entryRatio }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-t border-gray-100">
                <div class="text-sm">
                  <span class="text-gray-400">入围分: </span>
                  <span class="font-semibold text-orange-500">{{ item.entryScore ?? '-' }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-gray-400">录取分: </span>
                  <span class="font-semibold text-orange-500">{{ item.admissionScore ?? '-' }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-gray-400">计划/录取: </span>
                  <span class="font-semibold text-gray-700">{{ item.planCount ?? '-' }}/{{ item.admissionCount ?? '-' }}</span>
                </div>
              </div>
              <button
                class="mt-3 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="viewStrongBaseDetail(item.id)"
              >
                查看详情 →
              </button>
            </div>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">
            暂无强基计划数据
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="flex justify-center pb-12">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
        />
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 3: 验证页面结构**

确认 `api/special` 和 `types/special` 的导入路径正确，与 Vite path alias 匹配。

---

### Task 6: 特殊通道详情页

**Files:**
- Create: `apps/user/src/views/special/ChannelDetail.vue`

- [ ] **Step 1: 创建详情页**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { getChannelDetail, getChannelUniversityList, getChannelUniversityDetail } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelDetailVO, ChannelUniversityListVO, ChannelUniversityDetailVO } from '@/types/special'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<SpecialChannelDetailVO | null>(null)

// 关联大学
const univRecords = ref<ChannelUniversityListVO[]>([])
const univTotal = ref(0)
const univPage = ref(1)
const univPageSize = 10
const univLoading = ref(false)
const univRegionTag = ref('')
const univSignupStart = ref('')
const univSignupEnd = ref('')

// 关联大学详情弹窗
const showUnivDialog = ref(false)
const univDetail = ref<ChannelUniversityDetailVO | null>(null)
const univDetailLoading = ref(false)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('通道ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getChannelDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取通道详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUniversityList() {
  if (!detail.value) return
  univLoading.value = true
  try {
    const res = await getChannelUniversityList({
      page: univPage.value,
      size: univPageSize,
      channelCode: detail.value.channelCode,
      regionTag: univRegionTag.value || undefined,
      signupStart: univSignupStart.value || undefined,
      signupEnd: univSignupEnd.value || undefined,
    })
    univRecords.value = res.data.data.records
    univTotal.value = res.data.data.total
  } catch {
    // 关联大学列表公开接口，不需要特殊处理
  } finally {
    univLoading.value = false
  }
}

function onUnivSearch() {
  univPage.value = 1
  fetchUniversityList()
}

function onUnivPageChange(page: number) {
  univPage.value = page
  fetchUniversityList()
}

async function viewUnivDetail(universityId: number) {
  univDetailLoading.value = true
  showUnivDialog.value = true
  try {
    const res = await getChannelUniversityDetail(universityId)
    univDetail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取关联大学详情失败')
    showUnivDialog.value = false
  } finally {
    univDetailLoading.value = false
  }
}

onMounted(async () => {
  await fetchDetail()
  if (detail.value) {
    fetchUniversityList()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/special')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.channelName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 基本信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ detail.channelName }}</h2>
          <p v-if="detail.subtitle" class="mb-4 text-gray-400">{{ detail.subtitle }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-if="detail.filterLabel" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.filterLabel }}</span>
            <span class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">{{ detail.displayType }}</span>
          </div>
        </section>

        <!-- 通道正文（富文本） -->
        <section v-if="detail.content" class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 prose prose-sm max-w-none">
          <h3 class="text-lg font-bold text-gray-800 mb-4">通道详情</h3>
          <div v-html="detail.content" class="text-gray-600 leading-relaxed" />
        </section>

        <!-- 关联大学 -->
        <section class="mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">关联大学</h3>

          <!-- 搜索栏 -->
          <div class="flex flex-wrap items-end gap-4 mb-6 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
            <div class="w-44">
              <label class="block text-sm font-medium text-gray-600 mb-1.5">地区</label>
              <el-select v-model="univRegionTag" placeholder="全部" clearable filterable class="w-full" @change="onUnivSearch">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">报名开始 >=</label>
              <el-date-picker
                v-model="univSignupStart"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                class="w-full"
                @change="onUnivSearch"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">报名截止 <=</label>
              <el-date-picker
                v-model="univSignupEnd"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                class="w-full"
                @change="onUnivSearch"
              />
            </div>
            <button
              class="h-[40px] px-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
              @click="onUnivSearch"
            >
              搜索
            </button>
          </div>

          <!-- 卡片网格 -->
          <div v-loading="univLoading" class="min-h-[200px]">
            <div v-if="univRecords.length" class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div
                v-for="item in univRecords"
                :key="item.universityId"
                class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
              >
                <h4 class="text-base font-bold text-gray-800 mb-2 truncate">{{ item.universityName }}</h4>
                <p class="text-xs text-gray-400 mb-2">招生年份: {{ item.year }}</p>
                <span v-if="item.regionTag" class="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 mb-2">{{ item.regionTag }}</span>
                <p class="text-xs text-gray-400 mb-3">
                  报名: {{ item.signupStart?.slice(0, 10) || '待定' }} ~ {{ item.signupEnd?.slice(0, 10) || '待定' }}
                </p>
                <button
                  class="w-full rounded-lg border border-orange-200 py-1.5 text-sm text-orange-500 font-medium hover:bg-orange-50 transition-all"
                  @click="viewUnivDetail(item.universityId)"
                >
                  查看详情
                </button>
              </div>
            </div>
            <div v-else-if="!univLoading" class="py-12 text-center text-gray-400">
              暂无关联大学数据
            </div>
          </div>

          <div v-if="univTotal > univPageSize" class="mt-6 flex justify-center">
            <el-pagination
              background
              layout="prev, pager, next, total"
              :total="univTotal"
              :page-size="univPageSize"
              :current-page="univPage"
              @current-change="onUnivPageChange"
            />
          </div>
        </section>
      </template>
    </main>

    <!-- 关联大学详情弹窗 -->
    <ElDialog
      v-model="showUnivDialog"
      :title="univDetail?.universityName || '关联大学详情'"
      width="640px"
      :close-on-click-modal="false"
    >
      <div v-loading="univDetailLoading" class="min-h-[200px]">
        <template v-if="univDetail">
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span class="text-gray-400">大学名称：</span><span class="text-gray-700">{{ univDetail.universityName }}</span></div>
            <div><span class="text-gray-400">招生年份：</span><span class="text-gray-700">{{ univDetail.year }}</span></div>
            <div><span class="text-gray-400">地区：</span><span class="text-gray-700">{{ univDetail.regionTag }}</span></div>
            <div><span class="text-gray-400">报名时间：</span><span class="text-gray-700">{{ univDetail.signupStart?.slice(0, 10) }} ~ {{ univDetail.signupEnd?.slice(0, 10) }}</span></div>
          </div>
          <div class="mb-4">
            <span class="text-gray-400 text-sm">官网：</span>
            <a v-if="univDetail.officialUrl" :href="univDetail.officialUrl" target="_blank" class="text-orange-500 text-sm hover:underline">
              {{ univDetail.officialUrl }}
            </a>
            <span v-else class="text-gray-400 text-sm">-</span>
          </div>
          <div v-if="univDetail.brochureContent" class="border-t border-gray-100 pt-4">
            <h4 class="text-base font-bold text-gray-800 mb-3">{{ univDetail.brochureTitle || '招生简章' }}</h4>
            <div v-html="univDetail.brochureContent" class="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" />
          </div>
        </template>
      </div>
    </ElDialog>
  </div>
</template>
```

---

### Task 7: 强基数据详情页

**Files:**
- Create: `apps/user/src/views/special/StrongBaseDetail.vue`

- [ ] **Step 1: 创建详情页**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStrongBaseScoreDetail, getStrongBaseUniversityDetail } from '@/api/special'
import type { StrongBaseScoreDetailVO, StrongBaseUniversityDetailVO } from '@/types/special'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<StrongBaseScoreDetailVO | null>(null)

// 强基院校配置
const univConfig = ref<StrongBaseUniversityDetailVO | null>(null)
const configLoading = ref(false)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('数据ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getStrongBaseScoreDetail(id)
    detail.value = res.data.data
    // 加载成功后，顺便获取强基院校配置
    if (detail.value) {
      fetchUnivConfig(detail.value.universityId)
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取强基数据详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUnivConfig(universityId: number) {
  configLoading.value = true
  try {
    const res = await getStrongBaseUniversityDetail(universityId)
    univConfig.value = res.data.data
  } catch {
    // 404 表示该大学未配置强基院校信息，不报错
    univConfig.value = null
  } finally {
    configLoading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/special')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">强基数据详情</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 基本信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-2 text-2xl font-bold text-gray-800">{{ detail.universityName }}</h2>
          <p class="text-gray-500 mb-4">
            {{ detail.majorName }}
            <span v-if="detail.majorCode" class="text-gray-400">({{ detail.majorCode }})</span>
          </p>
          <div class="flex flex-wrap gap-4 text-sm">
            <span class="text-gray-400">年份：<span class="text-gray-700">{{ detail.year }}</span></span>
            <span class="text-gray-400">省份：<span class="text-gray-700">{{ detail.province }}</span></span>
            <span class="text-gray-400">科类：<span class="text-gray-700">{{ detail.subjectType }}</span></span>
          </div>
        </section>

        <!-- 入围信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">入围信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">入围分数线：</span><span class="font-semibold text-orange-500">{{ detail.entryScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">入围类型：</span><span class="text-gray-700">{{ detail.entryScoreType }}</span></div>
            <div><span class="text-gray-400">入围比例：</span><span class="text-gray-700">{{ detail.entryRatio }}</span></div>
            <div v-if="detail.entryFormula" class="col-span-2 md:col-span-4">
              <span class="text-gray-400">计算公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ detail.entryFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 录取信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">录取信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">录取综合分：</span><span class="font-semibold text-orange-500">{{ detail.admissionScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">计划招生：</span><span class="text-gray-700">{{ detail.planCount ?? '-' }} 人</span></div>
            <div><span class="text-gray-400">实际录取：</span><span class="text-gray-700">{{ detail.admissionCount ?? '-' }} 人</span></div>
            <div v-if="detail.admissionFormula" class="col-span-2 md:col-span-4">
              <span class="text-gray-400">计算公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ detail.admissionFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 备注 -->
        <section v-if="detail.remark" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-3">备注</h3>
          <p class="text-sm text-gray-600">{{ detail.remark }}</p>
        </section>

        <!-- 强基院校配置 -->
        <section v-if="univConfig" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100" v-loading="configLoading">
          <h3 class="text-lg font-bold text-gray-800 mb-4">强基院校配置</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span class="text-gray-400">强基试点：</span>
              <span :class="univConfig.isPilot ? 'text-green-600' : 'text-red-500'">
                {{ univConfig.isPilot ? '✅ 是' : '❌ 否' }}
              </span>
              <span v-if="univConfig.pilotYear" class="text-gray-400 ml-1">({{ univConfig.pilotYear }}年试点)</span>
            </div>
            <div>
              <span class="text-gray-400">出分前校测：</span>
              <span :class="!univConfig.testBeforeScore ? 'text-gray-700' : 'text-orange-500'">
                {{ univConfig.testBeforeScore ? '✅ 是' : '❌ 否' }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">默认入围比例：</span>
              <span class="text-gray-700">{{ univConfig.defaultEntryRatio }}</span>
            </div>
            <div class="md:col-span-2">
              <span class="text-gray-400">录取公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ univConfig.defaultAdmissionFormula }}</code>
            </div>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">官方页面：</span>
            <a v-if="univConfig.officialUrl" :href="univConfig.officialUrl" target="_blank" class="text-orange-500 text-sm hover:underline">{{ univConfig.officialUrl }}</a>
            <span v-else class="text-sm text-gray-400">-</span>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">报名入口：</span>
            <a v-if="univConfig.signupUrl" :href="univConfig.signupUrl" target="_blank" class="text-orange-500 text-sm hover:underline">{{ univConfig.signupUrl }}</a>
            <span v-else class="text-sm text-gray-400">-</span>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">可选专业：</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <span
                v-for="major in univConfig.availableMajors"
                :key="major"
                class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600"
              >
                {{ major }}
              </span>
            </div>
          </div>
          <div v-if="univConfig.specialNotes">
            <span class="text-sm text-gray-400">特殊说明：</span>
            <p class="mt-1 text-sm text-gray-600">{{ univConfig.specialNotes }}</p>
          </div>
        </section>

        <!-- 未配置强基院校信息的提示 -->
        <section v-else-if="!configLoading && detail" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 text-center text-gray-400 text-sm">
          该院校暂未配置强基计划详细信息
        </section>
      </template>
    </main>
  </div>
</template>
```

---

### Task 8: 整体验证

**Files:**
- Run: `apps/user/` 项目

- [ ] **Step 1: 检查 TypeScript**

```bash
cd apps/user && npx vue-tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 2: 构建验证**

```bash
cd apps/user && npx vite build
```

Expected: 构建成功，无错误

- [ ] **Step 3: 启动 dev server 手动验证**

```bash
cd apps/user && npx vite
```

Expected: 访问 `/special` 页面正常渲染，Tab 切换正常，搜索和分页功能正常
