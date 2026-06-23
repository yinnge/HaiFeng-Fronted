# C 端专业-考研方向关联查询 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 C 端（apps/user/）实现本科专业 ↔ 考研方向双向关联查询展示

**Architecture:** 在现有 MajorDetail.vue 中新增"考研方向"区块（标签按钮样式），在现有 PostgradMajorDialog.vue 中新增"关联本科专业"区块（行列表样式），均需 Pro 权限

**Tech Stack:** Vue 3 + Composition API + TypeScript + Element Plus + motion-v

---

## 文件变更清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `apps/user/src/types/postgrad-major/index.ts` | 新增 PostgradMajorDirectionBriefVO |
| 修改 | `apps/user/src/types/major/index.ts` | 新增 UndergraduateMajorDirectionBriefVO |
| 修改 | `apps/user/src/api/major/index.ts` | 新增 getMajorPostgradDirections |
| 修改 | `apps/user/src/api/postgrad-major/index.ts` | 新增 getPostgradMajorUndergraduateMajors |
| 修改 | `apps/user/src/views/major/Detail.vue` | 新增"考研方向"区块 |
| 修改 | `apps/user/src/components/major/PostgradMajorDialog.vue` | 新增"关联本科专业"区块 |

---

### Task 1: 新增类型定义

**Files:**
- Modify: `apps/user/src/types/postgrad-major/index.ts`
- Modify: `apps/user/src/types/major/index.ts`

- [ ] **Step 1: 在 postgrad-major types 中新增 PostgradMajorDirectionBriefVO**

在 `apps/user/src/types/postgrad-major/index.ts` 文件末尾新增：

```typescript
export interface PostgradMajorDirectionBriefVO {
  id: number
  postgradMajorName: string
}
```

- [ ] **Step 2: 在 major types 中新增 UndergraduateMajorDirectionBriefVO**

在 `apps/user/src/types/major/index.ts` 文件末尾新增：

```typescript
export interface UndergraduateMajorDirectionBriefVO {
  id: number
  majorName: string
}
```

---

### Task 2: 新增 API 函数

**Files:**
- Modify: `apps/user/src/api/major/index.ts`
- Modify: `apps/user/src/api/postgrad-major/index.ts`

- [ ] **Step 1: 在 major API 中新增 getMajorPostgradDirections**

在 `apps/user/src/api/major/index.ts` 文件末尾新增：

```typescript
export const getMajorPostgradDirections = (majorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<PostgradMajorDirectionBriefVO>>>(`${PREFIX}/${majorId}/postgrad-directions`, { params })
```

并在文件头部 import 中增加 PostgradMajorDirectionBriefVO：

```typescript
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'
```

- [ ] **Step 2: 在 postgrad-major API 中新增 getPostgradMajorUndergraduateMajors**

在 `apps/user/src/api/postgrad-major/index.ts` 文件末尾新增：

```typescript
export const getPostgradMajorUndergraduateMajors = (postgradMajorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<UndergraduateMajorDirectionBriefVO>>>(`/api/v1/app/postgrad-major/${postgradMajorId}/undergraduate-majors`, { params })
```

并在文件头部 import 中增加 UndergraduateMajorDirectionBriefVO：

```typescript
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'
```

---

### Task 3: 更新 MajorDetail.vue — 新增考研方向区块

**Files:**
- Modify: `apps/user/src/views/major/Detail.vue`

- [ ] **Step 1: 在 script 部分新增状态变量和函数**

在 `apps/user/src/views/major/Detail.vue` 的 `<script setup>` 中，在 `goCompetitionDetail` 函数之后新增：

```typescript
import { getMajorPostgradDirections } from '@/api/major'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'
import PostgradMajorDialog from '@/components/major/PostgradMajorDialog.vue'

// after goCompetitionDetail definition, add:

const directions = ref<PostgradMajorDirectionBriefVO[]>([])
const directionTotal = ref(0)
const directionPage = ref(1)
const directionPageSize = ref(10)
const directionLoading = ref(false)

const dialogVisible = ref(false)
const selectedDirectionId = ref<number | null>(null)

async function fetchPostgradDirections() {
  const id = Number(route.params.id)
  if (!id || !isPro.value) return
  directionLoading.value = true
  try {
    const res = await getMajorPostgradDirections(id, { page: directionPage.value, size: directionPageSize.value })
    directions.value = res.data.data.records
    directionTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      error.value = e?.response?.data?.msg || '获取考研方向失败'
    }
  } finally {
    directionLoading.value = false
  }
}

function onDirectionPageChange(page: number) {
  directionPage.value = page
  fetchPostgradDirections()
}

function showDirectionDetail(id: number) {
  selectedDirectionId.value = id
  dialogVisible.value = true
}

// in onMounted, add fetchPostgradDirections()
```

- [ ] **Step 2: 在 template 中新增考研方向区块**

在 "基本信息卡片" 的 `</Motion>` 结束标签之后（第 113 行）、"就业数据卡片"的 Motion 之前插入：

```html
<!-- Postgrad Directions -->
<Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.05 }" class="mb-6">
  <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
    <h3 class="mb-4 text-lg font-bold text-gray-800">考研方向</h3>
    <template v-if="isPro">
      <div v-loading="directionLoading" class="min-h-[100px]">
        <div v-if="directions.length" class="flex flex-wrap gap-3">
          <button
            v-for="d in directions" :key="d.id"
            class="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-700 hover:bg-orange-100 transition-colors"
            @click="showDirectionDetail(d.id)"
          >
            {{ d.postgradMajorName }}
          </button>
        </div>
        <div v-else-if="!directionLoading" class="text-sm text-gray-400">暂无考研方向数据</div>
      </div>
      <div v-if="directionTotal > directionPageSize" class="mt-4 flex justify-center">
        <el-pagination
          background small layout="prev, pager, next"
          :total="directionTotal" :page-size="directionPageSize"
          :current-page="directionPage"
          @current-change="onDirectionPageChange"
        />
      </div>
    </template>
    <template v-else>
      <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
        <div class="text-4xl mb-3">🔒</div>
        <h4 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看可报考的考研方向</h4>
        <p class="text-gray-500 mb-4">了解该本科专业可以报考哪些研究生专业</p>
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

- [ ] **Step 3: 在 template 末尾添加 PostgradMajorDialog**

在 `</main>` 之前添加：

```html
<PostgradMajorDialog
  v-model:visible="dialogVisible"
  :major-id="selectedDirectionId"
/>
```

---

### Task 4: 更新 PostgradMajorDialog.vue — 新增关联本科专业区块

**Files:**
- Modify: `apps/user/src/components/major/PostgradMajorDialog.vue`

- [ ] **Step 1: 在 script 部分新增状态变量和函数**

在 `apps/user/src/components/major/PostgradMajorDialog.vue` 的 `<script setup>` 中，在 `goUniversity` 函数之后新增：

```typescript
import { getPostgradMajorUndergraduateMajors } from '@/api/postgrad-major'
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'

// after goUniversity definition, add:

const undergradLoading = ref(false)
const undergraduateMajors = ref<UndergraduateMajorDirectionBriefVO[]>([])
const undergradTotal = ref(0)
const undergradPage = ref(1)
const undergradPageSize = ref(10)

async function fetchUndergraduateMajors() {
  if (!props.majorId || !isPro.value) return
  undergradLoading.value = true
  try {
    const res = await getPostgradMajorUndergraduateMajors(props.majorId, {
      page: undergradPage.value,
      size: undergradPageSize.value,
    })
    undergraduateMajors.value = res.data.data.records
    undergradTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取关联本科专业失败')
    }
  } finally {
    undergradLoading.value = false
  }
}

function onUndergradPageChange(page: number) {
  undergradPage.value = page
  fetchUndergraduateMajors()
}

function goMajor(id: number) {
  emit('update:visible', false)
  router.push(`/major/${id}`)
}

// in the watch, add fetchUndergraduateMajors()
watch(() => props.visible, (val) => {
  if (val) {
    // ... existing code ...
    undergradPage.value = 1
    undergraduateMajors.value = []
    if (isPro.value) fetchUndergraduateMajors()
  }
})
```

- [ ] **Step 2: 在 template 中新增关联本科专业区块**

在网格信息区域之后（第 155 行 `</div>` 之后）、"开设院校" section 之前插入：

```html
<!-- Undergraduate Majors -->
<section class="rounded-xl border border-gray-200 p-4 mb-4">
  <h4 class="font-semibold text-gray-800 mb-3">关联本科专业</h4>
  <template v-if="isPro">
    <div v-loading="undergradLoading" class="min-h-[100px]">
      <div v-if="undergraduateMajors.length" class="space-y-2">
        <div
          v-for="m in undergraduateMajors" :key="m.id"
          class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 hover:bg-orange-50/50 cursor-pointer transition-colors"
          @click="goMajor(m.id)"
        >
          <span class="text-sm font-medium text-gray-800">{{ m.majorName }}</span>
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div v-else-if="!undergradLoading" class="py-8 text-center text-gray-400 text-sm">暂无关联本科专业数据</div>
    </div>
    <div v-if="undergradTotal > undergradPageSize" class="mt-4 flex justify-center">
      <el-pagination
        background small layout="prev, pager, next"
        :total="undergradTotal" :page-size="undergradPageSize" :current-page="undergradPage"
        @current-change="onUndergradPageChange"
      />
    </div>
  </template>
  <template v-else>
    <div class="rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center border border-orange-100">
      <p class="text-sm text-gray-600 mb-3">开通专业版，查看可报考该考研方向的本科专业</p>
      <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2 text-sm text-white font-medium"
        @click="router.push('/profile')"
      >立即升级</button>
    </div>
  </template>
</section>
```

- [ ] **Step 3: 调整 watch 逻辑合并**

确保 watch 中同时调用 fetchDetail, fetchUniversities, fetchUndergraduateMajors。修改 watch 为：

```typescript
watch(() => props.visible, (val) => {
  if (val) {
    universityPage.value = 1
    undergradPage.value = 1
    universityCategory.value = ''
    detail.value = null
    universities.value = []
    undergraduateMajors.value = []
    fetchDetail()
    if (isPro.value) {
      fetchUniversities()
      fetchUndergraduateMajors()
    }
  }
})
```
