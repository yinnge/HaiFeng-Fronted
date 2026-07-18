# C 端院校通道关联 & 录取专业组 - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在院校详情页新增「特殊通道」和「录取数据」两个 Tab，以及独立的录取专业组详情页，共 5 个新接口。

**Architecture:** 两个功能作为 Tab 组件嵌入现有院校详情页（Detail.vue），录取专业组详情页为独立路由。API 层 + 类型定义与视图分离。

**Tech Stack:** Vue 3 (Composition API + `<script setup>`) + TypeScript + Element Plus + Tailwind CSS + Axios

---

## 文件结构

**新建文件：**
- `apps/user/src/components/university/ChannelTab.vue` — 特殊通道 Tab（公开）
- `apps/user/src/components/university/AdmissionGroupTab.vue` — 录取数据 Tab（VIP）
- `apps/user/src/views/university/AdmissionGroupDetail.vue` — 录取专业组详情页

**修改文件：**
- `apps/user/src/types/university/index.ts` — 追加 VO/DTO 类型
- `apps/user/src/api/university/index.ts` — 追加 5 个 API
- `apps/user/src/views/university/Detail.vue` — Tab 扩展为 6 个
- `apps/user/src/router/index.ts` — 新增 1 条路由

---

### Task 1: 类型定义追加

**Files:**
- Modify: `apps/user/src/types/university/index.ts`

- [ ] **Step 1: 在文件末尾追加新类型定义**

在 `apps/user/src/types/university/index.ts` 末尾（`GalleryItemVO` 之后）追加：

```typescript
// === 通道-大学关联 ===
export interface ChannelListVO {
  channelCode: string
  channelName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
}

export interface ChannelOptionVO {
  channelCode: string
  channelName: string
}

// === 录取专业组 ===
export interface AdmissionGroupListVO {
  id: number
  groupCode: string
  groupName: string
  year: number
  province: string
  batch: string
  cityName: string
  subjects: string[]
  requirementType: string
  majorCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
}

export interface AdmissionGroupDetailVO {
  id: number
  universityId: number
  universityName: string
  cityName: string
  year: number
  province: string
  batch: string
  enrollmentCode: string
  groupCode: string
  groupName: string
  subjects: string[]
  requirementType: string
  description: string
  constraints: string[]
  majorCount: number
  categoryCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  createdAt: string
  updatedAt: string
}

export interface MajorScoreVO {
  id: number
  groupId: number
  majorCode: string
  majorName: string
  educationLevel: string
  duration: string
  tuition: string
  description: string
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  constraints: string[]
}

export interface AdmissionGroupQueryDTO extends BasePageQuery {
  province?: string
  batch?: string
  cityName?: string
}

export interface ChannelQueryDTO extends BasePageQuery {
  channelName?: string
  regionTag?: string
}
```

- [ ] **Step 2: 验证语法**

检查 `BasePageQuery` 导入是否已在文件顶部：`import type { BasePageQuery } from '@haifeng/shared'` ✅ 已有。

---

### Task 2: API 层追加

**Files:**
- Modify: `apps/user/src/api/university/index.ts`

- [ ] **Step 1: 在文件末尾追加新 API**

在 `apps/user/src/api/university/index.ts` 末尾追加：

```typescript
// === 通道-大学关联 ===
export const getUniversityChannels = (universityId: number, params: ChannelQueryDTO) =>
  request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/${universityId}/channels`, { params })

export const getChannelOptions = () =>
  request.get<R<ChannelOptionVO[]>>(`${PREFIX}/channel-options`)

// === 录取专业组 ===
export const getAdmissionGroupPage = (universityId: number, params: AdmissionGroupQueryDTO) =>
  request.get<R<PageResult<AdmissionGroupListVO>>>(`${PREFIX}/admission-group/${universityId}`, { params })

export const getAdmissionGroupDetail = (groupId: number) =>
  request.get<R<AdmissionGroupDetailVO>>(`${PREFIX}/admission-group/${groupId}/detail`)

export const getMajorScores = (groupId: number) =>
  request.get<R<MajorScoreVO[]>>(`${PREFIX}/admission-group/${groupId}/scores`)
```

- [ ] **Step 2: 更新 import 语句（追加新导入的类型）**

将文件顶部 import 语句修改为：

```typescript
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityDetailVO,
  GuideOverviewVO,
  GuideCategoryVO,
  GalleryItemVO,
  ChannelListVO,
  ChannelOptionVO,
  ChannelQueryDTO,
  AdmissionGroupListVO,
  AdmissionGroupDetailVO,
  AdmissionGroupQueryDTO,
  MajorScoreVO,
} from '@/types/university'
```

---

### Task 3: 特殊通道 Tab 组件

**Files:**
- Create: `apps/user/src/components/university/ChannelTab.vue`

- [ ] **Step 1: 创建组件脚本**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUniversityChannels, getChannelOptions } from '@/api/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import type { ChannelListVO, ChannelOptionVO, ChannelQueryDTO } from '@/types/university'

const props = defineProps<{ universityId: number }>()

const loading = ref(false)
const list = ref<ChannelListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(9)

const channelName = ref('')
const regionTag = ref('')
const channelOptions = ref<ChannelOptionVO[]>([])

async function fetchChannelOptions() {
  try {
    const res = await getChannelOptions()
    channelOptions.value = res.data.data || []
  } catch {
    // 下拉选项加载失败不影响主列表
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: ChannelQueryDTO = { page: page.value, size: size.value }
    if (channelName.value) params.channelName = channelName.value
    if (regionTag.value) params.regionTag = regionTag.value

    const res = await getUniversityChannels(props.universityId, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取通道数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  channelName.value = ''
  regionTag.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  fetchList()
}

onMounted(() => {
  fetchChannelOptions()
  fetchList()
})
</script>
```

- [ ] **Step 2: 创建组件模板**

```vue
<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
      <div class="min-w-[200px] flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-1.5">通道名称</label>
        <el-select
          v-model="channelName"
          filterable
          clearable
          placeholder="输入或选择通道名称"
          class="w-full"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in channelOptions"
            :key="opt.channelCode"
            :label="opt.channelName"
            :value="opt.channelName"
          />
        </el-select>
      </div>
      <div class="w-44">
        <label class="block text-sm font-medium text-gray-600 mb-1.5">地区标签</label>
        <el-select v-model="regionTag" placeholder="全部" clearable filterable class="w-full" @change="handleSearch">
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>
      <button
        class="h-[40px] rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
        @click="handleSearch"
      >
        搜索
      </button>
      <button
        class="h-[40px] rounded-lg border border-gray-200 px-6 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
        @click="handleReset"
      >
        重置
      </button>
    </div>

    <!-- 卡片列表 3列 -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in list"
          :key="item.channelCode"
          class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
        >
          <h4 class="text-base font-bold text-gray-800 mb-2 truncate">{{ item.channelName }}</h4>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs text-gray-400">{{ item.year }}年</span>
            <span class="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.regionTag }}</span>
          </div>
          <p class="text-xs text-gray-400">
            报名: {{ item.signupStart ? item.signupStart.slice(0, 10) : '待定' }} ~ {{ item.signupEnd ? item.signupEnd.slice(0, 10) : '待定' }}
          </p>
        </div>
      </div>
      <div v-else-if="!loading" class="py-16 text-center text-gray-400">
        暂无特殊通道数据
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        :page-sizes="[9, 18, 30]"
        :page-size="size"
        :current-page="page"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>
```

---

### Task 4: 录取数据 Tab 组件 (VIP 权限门禁)

**Files:**
- Create: `apps/user/src/components/university/AdmissionGroupTab.vue`

- [ ] **Step 1: 创建组件脚本**

```vue
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getAdmissionGroupPage } from '@/api/university'
import { ProvinceOptions } from '@haifeng/shared'
import { MemberType } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import type { AdmissionGroupListVO, AdmissionGroupQueryDTO } from '@/types/university'

const props = defineProps<{ universityId: number }>()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<AdmissionGroupListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(6)

const province = ref('')
const batch = ref('')
const cityName = ref('')

const isVip = computed(() => {
  return userStore.isLoggedIn() && userStore.userInfo?.memberType === MemberType.VIP
})

const batchOptions = ['本科批', '提前批', '专科批']

async function fetchList() {
  loading.value = true
  try {
    const params: AdmissionGroupQueryDTO = { page: page.value, size: size.value }
    if (province.value) params.province = province.value
    if (batch.value) params.batch = batch.value
    if (cityName.value) params.cityName = cityName.value

    const res = await getAdmissionGroupPage(props.universityId, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status === 403) {
      // 非 VIP — 不显示数据，isVip 已经为 false，自然显示引导卡片
      list.value = []
    } else {
      ElMessage.error(e?.response?.data?.msg || '获取录取数据失败')
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  province.value = ''
  batch.value = ''
  cityName.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  fetchList()
}

function goDetail(groupId: number) {
  router.push(`/university/admission-group/${groupId}`)
}

function goLogin() {
  userStore.setRedirectPath(router.currentRoute.value.fullPath)
  router.push('/login')
}

function goVip() {
  router.push('/profile')
}

onMounted(() => {
  if (isVip.value) {
    fetchList()
  }
})
</script>
```

- [ ] **Step 2: 创建组件模板**

```vue
<template>
  <div>
    <!-- VIP 引导卡片 -->
    <div v-if="!isVip" class="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center border border-orange-100 shadow-lg">
      <div class="mb-4 text-5xl">🔒</div>
      <h3 class="mb-2 text-xl font-bold text-gray-800">开通 VIP 查看录取数据</h3>
      <p class="mb-6 text-gray-500 max-w-md mx-auto">
        查看院校近5年录取分数线、专业组详情、录取位次等核心数据
      </p>
      <div class="flex justify-center gap-4">
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="userStore.isLoggedIn() ? goVip() : goLogin()"
        >
          {{ userStore.isLoggedIn() ? '立即开通 VIP' : '前往登录' }}
        </button>
        <button
          class="rounded-lg border border-orange-300 px-8 py-3 text-orange-500 font-medium hover:bg-orange-50 transition-all"
          @click="goVip"
        >
          了解会员权益
        </button>
      </div>
    </div>

    <!-- VIP 用户可见内容 -->
    <template v-else>
      <!-- 搜索栏 -->
      <div class="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
        <div class="w-44">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">招生省份</label>
          <el-select v-model="province" placeholder="全部" clearable filterable class="w-full" @change="handleSearch">
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div class="w-44">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">录取批次</label>
          <el-select v-model="batch" placeholder="全部" clearable class="w-full" @change="handleSearch">
            <el-option v-for="opt in batchOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>
        <div class="min-w-[160px] flex-1">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">城市名</label>
          <input
            v-model="cityName"
            type="text"
            placeholder="模糊搜索城市"
            class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
        </div>
        <button
          class="h-[40px] rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="h-[40px] rounded-lg border border-gray-200 px-6 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- 卡片列表 2列 -->
      <div v-loading="loading" class="min-h-[200px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in list"
            :key="item.id"
            class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-base font-bold text-gray-800">
                {{ item.year }} · {{ item.groupName }}
              </h4>
              <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ item.batch }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">{{ item.province }} · {{ item.cityName }}</p>
            <div v-if="item.subjects?.length" class="mb-3 text-xs text-gray-500">
              选科: {{ item.subjects.join(', ') }} ({{ item.requirementType }})
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3 text-center">
              <div class="rounded-lg bg-orange-50 p-2">
                <div class="text-xs text-gray-400">最低分</div>
                <div class="text-sm font-bold text-orange-600">{{ item.minScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.minRank }}</div>
              </div>
              <div class="rounded-lg bg-amber-50 p-2">
                <div class="text-xs text-gray-400">最高分</div>
                <div class="text-sm font-bold text-amber-600">{{ item.maxScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.maxRank }}</div>
              </div>
              <div class="rounded-lg bg-blue-50 p-2">
                <div class="text-xs text-gray-400">平均分</div>
                <div class="text-sm font-bold text-blue-600">{{ item.avgScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.avgRank }}</div>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>{{ item.majorCount }} 个专业</span>
              <span>录取 {{ item.admissionCount }} 人</span>
            </div>
            <button
              class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="goDetail(item.id)"
            >
              查看详情 →
            </button>
          </div>
        </div>
        <div v-else-if="!loading" class="py-16 text-center text-gray-400">
          暂无录取数据
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > size" class="mt-6 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[6, 9, 18, 30]"
          :page-size="size"
          :current-page="page"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </template>
  </div>
</template>
```

---

### Task 5: 院校详情页 Tab 扩展

**Files:**
- Modify: `apps/user/src/views/university/Detail.vue`

- [ ] **Step 1: 追加 import 两个新 Tab 组件**

在 `Detail.vue` 的 `<script setup>` 顶部 import 区域追加：

```typescript
import ChannelTab from '@/components/university/ChannelTab.vue'
import AdmissionGroupTab from '@/components/university/AdmissionGroupTab.vue'
```

- [ ] **Step 2: 扩展 tabs 数组**

将 `const tabs = [...]` 替换为：

```typescript
const tabs = [
  { key: 'laboratory', label: '重点实验室', icon: '🔬' },
  { key: 'postgrad', label: '考研专业', icon: '🎓' },
  { key: 'department', label: '院系', icon: '🏛️' },
  { key: 'evaluation', label: '学科评估', icon: '📊' },
  { key: 'channel', label: '特殊通道', icon: '🎯' },
  { key: 'admission', label: '录取数据', icon: '📈' },
]
```

- [ ] **Step 3: 修改 Tab 按钮网格为 2 行 3 列**

将 Tab 导航区的 `grid grid-cols-4 gap-4` 替换为 `grid grid-cols-3 md:grid-cols-6 gap-4`（3列在大屏上显示为6列，实际每行3个）：

查找：
```html
<section class="mb-8">
  <div class="grid grid-cols-4 gap-4">
```

替换为：
```html
<section class="mb-8">
  <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
```

- [ ] **Step 4: 在 Tab 内容区追加新 Tab 条件渲染**

在现有的 4 个 Tab 条件渲染之后追加：

```html
<ChannelTab v-else-if="activeTab === 'channel'" :university-id="Number(route.params.id)" />
<AdmissionGroupTab v-else-if="activeTab === 'admission'" :university-id="Number(route.params.id)" />
```

---

### Task 6: 录取专业组详情页

**Files:**
- Create: `apps/user/src/views/university/AdmissionGroupDetail.vue`

- [ ] **Step 1: 创建详情页脚本**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getAdmissionGroupDetail, getMajorScores } from '@/api/university'
import { MemberType } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import type { AdmissionGroupDetailVO, MajorScoreVO } from '@/types/university'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const detail = ref<AdmissionGroupDetailVO | null>(null)
const scores = ref<MajorScoreVO[]>([])
const scoresLoading = ref(false)

const isVip = computed(() => {
  return userStore.isLoggedIn() && userStore.userInfo?.memberType === MemberType.VIP
})

async function fetchDetail() {
  const groupId = Number(route.params.groupId)
  if (!groupId) {
    ElMessage.error('专业组ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getAdmissionGroupDetail(groupId)
    detail.value = res.data.data
    // 加载成功后立即获取明细
    fetchScores()
  } catch (e: any) {
    if (e?.response?.status === 403) {
      // 非 VIP — 显示引导卡片
      detail.value = null
    } else {
      ElMessage.error(e?.response?.data?.msg || '获取专业组详情失败')
    }
  } finally {
    loading.value = false
  }
}

async function fetchScores() {
  const groupId = Number(route.params.groupId)
  scoresLoading.value = true
  try {
    const res = await getMajorScores(groupId)
    scores.value = res.data.data || []
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error(e?.response?.data?.msg || '获取录取明细失败')
    }
  } finally {
    scoresLoading.value = false
  }
}

function goBack() {
  router.back()
}

function goLogin() {
  userStore.setRedirectPath(route.fullPath)
  router.push('/login')
}

function goVip() {
  router.push('/profile')
}

onMounted(fetchDetail)
</script>
```

- [ ] **Step 2: 创建详情页模板**

```vue
<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="goBack">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.universityName }} · {{ detail.groupName }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <!-- VIP 引导卡片 -->
      <div v-if="!isVip && !detail && !loading" class="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center border border-orange-100 shadow-lg max-w-lg mx-auto">
        <div class="mb-4 text-5xl">🔒</div>
        <h3 class="mb-2 text-xl font-bold text-gray-800">开通 VIP 查看录取数据</h3>
        <p class="mb-6 text-gray-500">查看专业录取明细、分数线、位次等详细数据</p>
        <div class="flex justify-center gap-4">
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="userStore.isLoggedIn() ? goVip() : goLogin()"
          >
            {{ userStore.isLoggedIn() ? '立即开通 VIP' : '前往登录' }}
          </button>
        </div>
      </div>

      <template v-if="detail">
        <!-- 专业组基本信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{ detail.groupName }}</h2>
            <span class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.year }}年</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div><span class="text-gray-400">院校：</span><span class="text-gray-700">{{ detail.universityName }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.province }}</span></div>
            <div><span class="text-gray-400">批次：</span><span class="text-gray-700">{{ detail.batch }}</span></div>
            <div><span class="text-gray-400">招生代码：</span><span class="text-gray-700">{{ detail.enrollmentCode }}</span></div>
            <div><span class="text-gray-400">城市：</span><span class="text-gray-700">{{ detail.cityName }}</span></div>
            <div><span class="text-gray-400">组代码：</span><span class="text-gray-700">{{ detail.groupCode }}</span></div>
          </div>
          <div v-if="detail.subjects?.length" class="mb-3">
            <span class="text-sm text-gray-400">选科要求：</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <span v-for="sub in detail.subjects" :key="sub" class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{{ sub }}</span>
              <span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">{{ detail.requirementType }}</span>
            </div>
          </div>
          <div v-if="detail.constraints?.length" class="mb-3">
            <span class="text-sm text-gray-400">约束条件：</span>
            <span v-for="(c, i) in detail.constraints" :key="i" class="ml-2 text-sm text-gray-600">{{ c }}</span>
          </div>
          <p v-if="detail.description" class="text-sm text-gray-500">{{ detail.description }}</p>
        </section>

        <!-- 分数概览 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">录取分数概览</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="rounded-xl bg-orange-50 p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">最低分</div>
              <div class="text-2xl font-bold text-orange-600">{{ detail.minScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.minRank }}</div>
            </div>
            <div class="rounded-xl bg-amber-50 p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">最高分</div>
              <div class="text-2xl font-bold text-amber-600">{{ detail.maxScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.maxRank }}</div>
            </div>
            <div class="rounded-xl bg-blue-50 p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">平均分</div>
              <div class="text-2xl font-bold text-blue-600">{{ detail.avgScore }}</div>
              <div class="text-xs text-gray-400">位次 {{ detail.avgRank }}</div>
            </div>
            <div class="rounded-xl bg-green-50 p-4 text-center">
              <div class="text-xs text-gray-400 mb-1">录取人数</div>
              <div class="text-2xl font-bold text-green-600">{{ detail.admissionCount }}</div>
              <div class="text-xs text-gray-400">{{ detail.majorCount }} 个专业</div>
            </div>
          </div>
        </section>

        <!-- 专业录取明细表格 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">专业录取明细</h3>
          <div v-loading="scoresLoading">
            <el-table v-if="scores.length" :data="scores" stripe style="width: 100%" size="small">
              <el-table-column prop="majorName" label="专业名称" min-width="140" />
              <el-table-column prop="majorCode" label="代码" width="90" />
              <el-table-column prop="educationLevel" label="层次" width="70" />
              <el-table-column prop="duration" label="学制" width="60" />
              <el-table-column prop="tuition" label="学费" width="80" />
              <el-table-column prop="admissionCount" label="录取" width="60" />
              <el-table-column label="最低分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-orange-600">{{ row.minScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.minRank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="最高分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-amber-600">{{ row.maxScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.maxRank }}</span>
                </template>
              </el-table-column>
              <el-table-column label="平均分" width="100">
                <template #default="{ row }">
                  <span class="font-medium text-blue-600">{{ row.avgScore }}</span>
                  <span class="text-xs text-gray-400">/{{ row.avgRank }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="constraints" label="约束" min-width="100">
                <template #default="{ row }">
                  <span v-if="row.constraints?.length" v-for="c in row.constraints" :key="c" class="mr-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{{ c }}</span>
                  <span v-else class="text-gray-400">-</span>
                </template>
              </el-table-column>
            </el-table>
            <div v-else-if="!scoresLoading" class="py-8 text-center text-gray-400">暂无专业录取明细</div>
          </div>
        </section>

        <!-- 时间信息 -->
        <section class="mb-6 rounded-2xl bg-white p-4 shadow-md border border-gray-100">
          <div class="flex gap-6 text-xs text-gray-400">
            <span>创建时间：{{ detail.createdAt?.slice(0, 10) }}</span>
            <span>更新时间：{{ detail.updatedAt?.slice(0, 10) }}</span>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
```

- [ ] **Step 3: 补充 import（遗漏的 computed）**

确保 script 顶部有 `import { ref, onMounted, computed } from 'vue'`

---

### Task 7: 路由配置

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: 添加录取专业组详情页路由**

在 `apps/user/src/router/index.ts` 中，在 `UniversityDetail` 路由后面、`UniversityGuide` 路由前面插入：

```typescript
  {
    path: '/university/admission-group/:groupId',
    name: 'AdmissionGroupDetail',
    component: () => import('@/views/university/AdmissionGroupDetail.vue'),
    meta: { title: '录取专业组详情', requiresAuth: true },
  },
```

---

### Task 8: 整体验证

**Files:**
- Run: `apps/user/` 项目

- [ ] **Step 1: TypeScript 类型检查**

```bash
cd apps/user && npx vue-tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 2: 构建验证**

```bash
cd apps/user && npx vite build
```

Expected: 构建成功，无错误

- [ ] **Step 3: 功能验证**

启动 dev server: `cd apps/user && npx vite`

手动验证：
1. 进入院校详情页 `/university/:id` → 看到 6 个 Tab
2. 切换到「特殊通道」Tab → 看到通道列表（公开，无需登录）
3. 通道名称下拉选择器 → 显示所有活跃通道选项
4. 切换到「录取数据」Tab → 非 VIP 显示引导卡片
5. 登录 VIP 账号 → 看到录取专业组列表
6. 点击「查看详情」→ 跳转专业组详情页
7. 详情页显示专业组信息和专业录取明细表格
