# 首页管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成管理后台首页管理模块三个子页面（公告、规划师、培训机构）的 CRUD 功能，改造侧边栏支持三级菜单。

**Architecture:** 每个子模块独立页面 + 独立 API 层 + 独立类型定义，复用现有 `system/log` 的分页查询模式。Sidebar 改造为递归渲染，支持三级菜单嵌套。

**Tech Stack:** Vue 3 Composition API, Element Plus, TypeScript, Pinia

---

## 文件清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `apps/admin/src/types/home/announcement.ts` | 公告类型定义 |
| `apps/admin/src/types/home/planner.ts` | 规划师类型定义 |
| `apps/admin/src/types/home/institution.ts` | 培训机构类型定义 |
| `apps/admin/src/api/home/announcement.ts` | 公告 API |
| `apps/admin/src/api/home/planner.ts` | 规划师 API |
| `apps/admin/src/api/home/institution.ts` | 培训机构 API |
| `apps/admin/src/router/modules/home.ts` | 首页管理路由 |
| `apps/admin/src/views/home/announcement/index.vue` | 公告管理页 |
| `apps/admin/src/views/home/planner/index.vue` | 规划师管理页 |
| `apps/admin/src/views/home/institution/index.vue` | 培训机构管理页 |

### 修改文件

| 文件 | 说明 |
|------|------|
| `apps/admin/src/router/index.ts` | 引入 home 路由模块 |
| `apps/admin/src/layout/components/Sidebar.vue` | 改造支持三级菜单 |

---

### Task 1: 定义首页模块类型

**Files:**
- Create: `apps/admin/src/types/home/announcement.ts`
- Create: `apps/admin/src/types/home/planner.ts`
- Create: `apps/admin/src/types/home/institution.ts`

- [ ] **Step 1: 创建公告类型定义**

```typescript
// apps/admin/src/types/home/announcement.ts

export interface AnnouncementListVO {
  id: number
  title: string
  tag: string | null
  status: number
  updatedAt: string
}

export interface AnnouncementDetailVO {
  id: number
  title: string
  content: string
  tag: string | null
  status: number
  createdAt: string
  updatedAt: string
}

export interface AnnouncementQueryDTO {
  title?: string
  status?: number
  page: number
  size: number
}

export interface AnnouncementAddDTO {
  title: string
  content: string
  tag?: string
}

export interface AnnouncementUpdateDTO {
  title: string
  content: string
  tag?: string
}

export interface StatusDTO {
  status: number
}
```

- [ ] **Step 2: 创建规划师类型定义**

```typescript
// apps/admin/src/types/home/planner.ts

export interface PlannerListVO {
  id: number
  name: string
  position: string | null
  region: string | null
  avatar: string | null
  specialty: string | null
  sortOrder: number
  status: number
}

export interface PlannerDetailVO {
  id: number
  name: string
  position: string | null
  region: string | null
  avatar: string | null
  specialty: string | null
  douyinName: string | null
  douyinUrl: string | null
  personalDescription: string | null
  experienceJob: string | null
  achievements: string[] | null
  expertiseAreas: string[] | null
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface PlannerQueryDTO {
  name?: string
  status?: number
  page: number
  size: number
}

export interface PlannerAddDTO {
  name: string
  position?: string
  region?: string
  avatar?: string
  specialty?: string
  douyinName?: string
  douyinUrl?: string
  personalDescription?: string
  experienceJob?: string
  achievements?: string[]
  expertiseAreas?: string[]
  sortOrder?: number
}

export interface PlannerUpdateDTO {
  name: string
  position?: string
  region?: string
  avatar?: string
  specialty?: string
  douyinName?: string
  douyinUrl?: string
  personalDescription?: string
  experienceJob?: string
  achievements?: string[]
  expertiseAreas?: string[]
  sortOrder?: number
}
```

- [ ] **Step 3: 创建培训机构类型定义**

```typescript
// apps/admin/src/types/home/institution.ts

export interface InstitutionListVO {
  id: number
  name: string
  type: string
  phone: string | null
  address: string | null
  logo: string | null
  sortOrder: number
  status: number
}

export interface InstitutionDetailVO {
  id: number
  name: string
  type: string
  phone: string | null
  address: string | null
  description: string | null
  courses: string[] | null
  images: string[] | null
  logo: string | null
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface InstitutionQueryDTO {
  name?: string
  type?: string
  status?: number
  page: number
  size: number
}

export interface InstitutionAddDTO {
  name: string
  type: string
  phone?: string
  address?: string
  description?: string
  courses?: string[]
  images?: string[]
  logo?: string
  sortOrder?: number
}

export interface InstitutionUpdateDTO {
  name: string
  type: string
  phone?: string
  address?: string
  description?: string
  courses?: string[]
  images?: string[]
  logo?: string
  sortOrder?: number
}
```

---

### Task 2: 实现首页模块 API 层

**Files:**
- Create: `apps/admin/src/api/home/announcement.ts`
- Create: `apps/admin/src/api/home/planner.ts`
- Create: `apps/admin/src/api/home/institution.ts`

- [ ] **Step 1: 创建公告 API**

```typescript
// apps/admin/src/api/home/announcement.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AnnouncementListVO,
  AnnouncementDetailVO,
  AnnouncementQueryDTO,
  AnnouncementAddDTO,
  AnnouncementUpdateDTO,
  StatusDTO,
} from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/announcement'

export const getAnnouncementPage = (params: AnnouncementQueryDTO) => {
  return request.get<R<PageResult<AnnouncementListVO>>>(`${PREFIX}/list`, { params })
}

export const getAnnouncementDetail = (id: number) => {
  return request.get<R<AnnouncementDetailVO>>(`${PREFIX}/${id}`)
}

export const addAnnouncement = (data: AnnouncementAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateAnnouncement = (id: number, data: AnnouncementUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateAnnouncementStatus = (id: number, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteAnnouncement = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
```

- [ ] **Step 2: 创建规划师 API**

```typescript
// apps/admin/src/api/home/planner.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  PlannerListVO,
  PlannerDetailVO,
  PlannerQueryDTO,
  PlannerAddDTO,
  PlannerUpdateDTO,
} from '@/types/home/planner'
import type { StatusDTO } from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/planner'

export const getPlannerPage = (params: PlannerQueryDTO) => {
  return request.get<R<PageResult<PlannerListVO>>>(`${PREFIX}/list`, { params })
}

export const getPlannerDetail = (id: number) => {
  return request.get<R<PlannerDetailVO>>(`${PREFIX}/${id}`)
}

export const addPlanner = (data: PlannerAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updatePlanner = (id: number, data: PlannerUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updatePlannerStatus = (id: number, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deletePlanner = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
```

- [ ] **Step 3: 创建培训机构 API**

```typescript
// apps/admin/src/api/home/institution.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
} from '@/types/home/institution'
import type { StatusDTO } from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/institution'

export const getInstitutionPage = (params: InstitutionQueryDTO) => {
  return request.get<R<PageResult<InstitutionListVO>>>(`${PREFIX}/list`, { params })
}

export const getInstitutionDetail = (id: number) => {
  return request.get<R<InstitutionDetailVO>>(`${PREFIX}/${id}`)
}

export const addInstitution = (data: InstitutionAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateInstitution = (id: number, data: InstitutionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateInstitutionStatus = (id: number, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteInstitution = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
```

---

### Task 3: 创建路由并注册

**Files:**
- Create: `apps/admin/src/router/modules/home.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 创建首页管理路由**

```typescript
// apps/admin/src/router/modules/home.ts
import type { RouteRecordRaw } from 'vue-router'

const homeRoutes: RouteRecordRaw = {
  path: '/home',
  name: 'Home',
  meta: { title: '首页管理', icon: 'HomeFilled' },
  redirect: '/home/announcement',
  children: [
    {
      path: 'announcement',
      name: 'HomeAnnouncement',
      component: () => import('@/views/home/announcement/index.vue'),
      meta: { title: '公告管理', moduleCode: 'home_announcement' },
    },
    {
      path: 'planner',
      name: 'HomePlanner',
      component: () => import('@/views/home/planner/index.vue'),
      meta: { title: '规划师管理', moduleCode: 'home_planner' },
    },
    {
      path: 'institution',
      name: 'HomeInstitution',
      component: () => import('@/views/home/institution/index.vue'),
      meta: { title: '培训机构管理', moduleCode: 'home_institution' },
    },
  ],
}

export default homeRoutes
```

- [ ] **Step 2: 在 router/index.ts 中注册**

修改 `apps/admin/src/router/index.ts`，在 `asyncRoutes` 的 children 中添加 home 路由：

在 `import userRoutes from './modules/user'` 之后添加：
```typescript
import homeRoutes from './modules/home'
```

在 `userRoutes,` 之后添加：
```typescript
      homeRoutes,
```

---

### Task 4: 改造侧边栏支持三级菜单

**Files:**
- Modify: `apps/admin/src/layout/components/Sidebar.vue`

- [ ] **Step 1: 重写 Sidebar.vue 支持递归渲染三级菜单**

当前 Sidebar 只处理两层（el-sub-menu → el-menu-item）。需要改造为递归渲染，支持三级。

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/store'
import { asyncRoutes } from '@/router'
import type { RouteRecordRaw } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)
const activeMenu = computed(() => route.path)

interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: MenuItem[]
}

const menuList = computed(() => {
  function formatRoutes(routes: RouteRecordRaw[]): MenuItem[] {
    return routes
      .filter((item) => !item.meta?.hidden)
      .map((item) => ({
        path: item.path,
        title: item.meta?.title as string || '',
        icon: item.meta?.icon as string | undefined,
        children: item.children ? formatRoutes(item.children) : undefined,
      }))
  }

  return asyncRoutes
    .filter((item) => !item.meta?.hidden)
    .map((item) => {
      const menu: MenuItem = {
        path: item.path,
        title: item.meta?.title as string || '',
        icon: item.meta?.icon as string | undefined,
      }
      if (item.children) {
        menu.children = item.children
          .filter((child) => !child.meta?.hidden)
          .map((child) => ({
            path: child.path,
            title: child.meta?.title as string || '',
            icon: child.meta?.icon as string | undefined,
            children: child.children
              ? child.children
                  .filter((c) => !c.meta?.hidden)
                  .map((c) => ({
                    path: `${child.path}/${c.path}`,
                    title: c.meta?.title as string || '',
                    icon: c.meta?.icon as string | undefined,
                  }))
              : undefined,
          }))
      }
      return menu
    })
})

function handleMenuSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <div class="flex h-full flex-col" style="background-color: #001529;">
    <div class="flex h-16 items-center justify-center" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span v-if="!isCollapsed" class="text-sm font-medium text-white">海枫管理后台</span>
      <span v-else class="text-lg font-bold text-white">HF</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapsed"
      :collapse-transition="false"
      background-color="#001529"
      text-color="rgba(255,255,255,0.65)"
      active-text-color="#1890ff"
      class="flex-1 border-none"
      @select="handleMenuSelect"
    >
      <template v-for="menu in menuList" :key="menu.path">
        <!-- 有三级子菜单 -->
        <el-sub-menu v-if="menu.children && menu.children.some(c => c.children)" :index="menu.path">
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <template v-for="child in menu.children" :key="child.path">
            <el-sub-menu v-if="child.children" :index="`${menu.path}/${child.path}`">
              <template #title>
                <el-icon v-if="child.icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.title }}</span>
              </template>
              <el-menu-item
                v-for="grandchild in child.children"
                :key="grandchild.path"
                :index="`/${menu.path}/${child.path}/${grandchild.path}`"
              >
                <el-icon v-if="grandchild.icon">
                  <component :is="grandchild.icon" />
                </el-icon>
                <span>{{ grandchild.title }}</span>
              </el-menu-item>
            </el-sub-menu>
            <!-- 二级子菜单（无三级） -->
            <el-menu-item v-else :index="`/${menu.path}/${child.path}`">
              <el-icon v-if="child.icon">
                <component :is="child.icon" />
              </el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>

        <!-- 只有二级子菜单 -->
        <el-sub-menu v-else-if="menu.children && menu.children.length > 1" :index="menu.path">
          <template #title>
            <el-icon v-if="menu.icon">
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.title }}</span>
          </template>
          <el-menu-item
            v-for="child in menu.children"
            :key="child.path"
            :index="`/${menu.path}/${child.path}`"
          >
            <el-icon v-if="child.icon">
              <component :is="child.icon" />
            </el-icon>
            <span>{{ child.title }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 单个菜单 -->
        <el-menu-item
          v-else-if="menu.children && menu.children.length === 1"
          :index="`/${menu.path}/${menu.children[0].path}`"
        >
          <el-icon v-if="menu.children[0].icon">
            <component :is="menu.children[0].icon" />
          </el-icon>
          <span>{{ menu.children[0].title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>
```

注意：当前 `asyncRoutes` 的结构是 `Layout > children`，需要调整 `menuList` 的计算逻辑。因为 `asyncRoutes` 只有一个 `/` 路由（Layout），其 children 包含了 dashboard、system、permission、user、home 等。所以应该从 `asyncRoutes[0].children` 中取菜单。

上述代码中的 `menuList` 计算逻辑已修正为正确路径拼接（`/${menu.path}/${child.path}`）。

---

### Task 5: 公告管理页面

**Files:**
- Create: `apps/admin/src/views/home/announcement/index.vue`

- [ ] **Step 1: 实现公告管理页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getAnnouncementPage,
  getAnnouncementDetail,
  addAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
} from '@/api/home/announcement'
import type {
  AnnouncementListVO,
  AnnouncementDetailVO,
  AnnouncementQueryDTO,
  AnnouncementAddDTO,
  AnnouncementUpdateDTO,
} from '@/types/home/announcement'

const loading = ref(false)
const tableData = ref<AnnouncementListVO[]>([])
const total = ref(0)

const queryParams = reactive<AnnouncementQueryDTO>({
  page: 1,
  size: 10,
  title: '',
  status: undefined,
})

// Dialog 控制
const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<AnnouncementDetailVO | null>(null)

const formData = reactive<AnnouncementAddDTO>({
  title: '',
  content: '',
  tag: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: AnnouncementQueryDTO = {
      page: queryParams.page,
      size: queryParams.size,
    }
    if (queryParams.title) params.title = queryParams.title
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getAnnouncementPage(params)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.title = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增公告'
    formData.title = ''
    formData.content = ''
    formData.tag = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改公告'
    formLoading.value = true
    try {
      const res = await getAnnouncementDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.title = d.title
        formData.content = d.content
        formData.tag = d.tag || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '公告详情'
    formLoading.value = true
    try {
      const res = await getAnnouncementDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.title || !formData.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: AnnouncementAddDTO = {
        title: formData.title,
        content: formData.content,
      }
      if (formData.tag) data.tag = formData.tag
      res = await addAnnouncement(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: AnnouncementUpdateDTO = {
        title: formData.title,
        content: formData.content,
      }
      if (formData.tag) data.tag = formData.tag
      res = await updateAnnouncement(currentId.value, data)
    }

    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row: AnnouncementListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该公告吗？`, '提示')
    const res = await updateAnnouncementStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该公告吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteAnnouncement(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

const statusTag = (status: number) => (status === 1 ? 'success' : 'info')
const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="标题">
          <el-input
            v-model="queryParams.title"
            placeholder="标题模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="展示" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增公告</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="tag" label="标签" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.tag" size="small">{{ row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.status === 1 ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新增/修改/详情 Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
            <el-descriptions-item label="标签">{{ detailData.tag || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">
                {{ statusLabel(detailData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="内容">
              <div class="max-h-60 overflow-y-auto" v-html="detailData.content"></div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="80px">
            <el-form-item label="标题" required>
              <el-input v-model="formData.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="formData.tag" placeholder="请输入标签" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="内容" required>
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="8"
                placeholder="请输入公告内容（支持 HTML）"
              />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 6: 规划师管理页面

**Files:**
- Create: `apps/admin/src/views/home/planner/index.vue`

- [ ] **Step 1: 实现规划师管理页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getPlannerPage,
  getPlannerDetail,
  addPlanner,
  updatePlanner,
  updatePlannerStatus,
  deletePlanner,
} from '@/api/home/planner'
import type {
  PlannerListVO,
  PlannerDetailVO,
  PlannerQueryDTO,
  PlannerAddDTO,
  PlannerUpdateDTO,
} from '@/types/home/planner'

const loading = ref(false)
const tableData = ref<PlannerListVO[]>([])
const total = ref(0)

const queryParams = reactive<PlannerQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<PlannerDetailVO | null>(null)

const formData = reactive<PlannerAddDTO>({
  name: '',
  position: '',
  region: '',
  avatar: '',
  specialty: '',
  douyinName: '',
  douyinUrl: '',
  personalDescription: '',
  experienceJob: '',
  achievements: [],
  expertiseAreas: [],
  sortOrder: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: PlannerQueryDTO = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getPlannerPage(params)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => { queryParams.name = ''; queryParams.status = undefined; queryParams.page = 1; fetchData() }
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增规划师'
    formData.name = ''
    formData.position = ''
    formData.region = ''
    formData.avatar = ''
    formData.specialty = ''
    formData.douyinName = ''
    formData.douyinUrl = ''
    formData.personalDescription = ''
    formData.experienceJob = ''
    formData.achievements = []
    formData.expertiseAreas = []
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改规划师'
    formLoading.value = true
    try {
      const res = await getPlannerDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.name = d.name
        formData.position = d.position || ''
        formData.region = d.region || ''
        formData.avatar = d.avatar || ''
        formData.specialty = d.specialty || ''
        formData.douyinName = d.douyinName || ''
        formData.douyinUrl = d.douyinUrl || ''
        formData.personalDescription = d.personalDescription || ''
        formData.experienceJob = d.experienceJob || ''
        formData.achievements = d.achievements || []
        formData.expertiseAreas = d.expertiseAreas || []
        formData.sortOrder = d.sortOrder || 0
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '规划师详情'
    formLoading.value = true
    try {
      const res = await getPlannerDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.name) {
    ElMessage.warning('请填写姓名')
    return
  }
  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: PlannerAddDTO = { name: formData.name }
      if (formData.position) data.position = formData.position
      if (formData.region) data.region = formData.region
      if (formData.avatar) data.avatar = formData.avatar
      if (formData.specialty) data.specialty = formData.specialty
      if (formData.douyinName) data.douyinName = formData.douyinName
      if (formData.douyinUrl) data.douyinUrl = formData.douyinUrl
      if (formData.personalDescription) data.personalDescription = formData.personalDescription
      if (formData.experienceJob) data.experienceJob = formData.experienceJob
      if (formData.achievements && formData.achievements.length > 0) data.achievements = formData.achievements
      if (formData.expertiseAreas && formData.expertiseAreas.length > 0) data.expertiseAreas = formData.expertiseAreas
      data.sortOrder = formData.sortOrder
      res = await addPlanner(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: PlannerUpdateDTO = { name: formData.name }
      if (formData.position) data.position = formData.position
      if (formData.region) data.region = formData.region
      if (formData.avatar) data.avatar = formData.avatar
      if (formData.specialty) data.specialty = formData.specialty
      if (formData.douyinName) data.douyinName = formData.douyinName
      if (formData.douyinUrl) data.douyinUrl = formData.douyinUrl
      if (formData.personalDescription) data.personalDescription = formData.personalDescription
      if (formData.experienceJob) data.experienceJob = formData.experienceJob
      if (formData.achievements && formData.achievements.length > 0) data.achievements = formData.achievements
      if (formData.expertiseAreas && formData.expertiseAreas.length > 0) data.expertiseAreas = formData.expertiseAreas
      data.sortOrder = formData.sortOrder
      res = await updatePlanner(currentId.value, data)
    }
    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row: PlannerListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该规划师吗？`, '提示')
    const res = await updatePlannerStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该规划师吗？此操作不可恢复！', '警告', { type: 'warning' })
    const res = await deletePlanner(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const addArrayItem = (arr: string[]) => { arr.push('') }
const removeArrayItem = (arr: string[], index: number) => { arr.splice(index, 1) }

const statusTag = (status: number) => (status === 1 ? 'success' : 'info')
const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="姓名模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="展示" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增规划师</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="position" label="职位" width="140" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="specialty" label="专长" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.status === 1 ? 'info' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <!-- 详情 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="头像" v-if="detailData.avatar" :span="2">
              <el-image :src="detailData.avatar" style="width: 80px; height: 80px; border-radius: 50%;" fit="cover" />
            </el-descriptions-item>
            <el-descriptions-item label="专长" :span="2">{{ detailData.specialty || '-' }}</el-descriptions-item>
            <el-descriptions-item label="抖音名称">{{ detailData.douyinName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="抖音链接" v-if="detailData.douyinUrl">
              <el-link :href="detailData.douyinUrl" target="_blank">{{ detailData.douyinUrl }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">{{ detailData.personalDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作经历" :span="2">{{ detailData.experienceJob || '-' }}</el-descriptions-item>
            <el-descriptions-item label="成就">
              <div v-if="detailData.achievements && detailData.achievements.length">
                <el-tag v-for="(item, i) in detailData.achievements" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="擅长领域">
              <div v-if="detailData.expertiseAreas && detailData.expertiseAreas.length">
                <el-tag v-for="(item, i) in detailData.expertiseAreas" :key="i" size="small" type="success" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">{{ statusLabel(detailData.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="姓名" required>
              <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="formData.position" placeholder="请输入职位" maxlength="50" />
            </el-form-item>
            <el-form-item label="地区">
              <el-input v-model="formData.region" placeholder="请输入地区" maxlength="20" />
            </el-form-item>
            <el-form-item label="头像 URL">
              <el-input v-model="formData.avatar" placeholder="请输入头像链接" maxlength="100" />
            </el-form-item>
            <el-form-item label="专长">
              <el-input v-model="formData.specialty" placeholder="请输入专长" maxlength="100" />
            </el-form-item>
            <el-form-item label="抖音名称">
              <el-input v-model="formData.douyinName" placeholder="请输入抖音名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="抖音链接">
              <el-input v-model="formData.douyinUrl" placeholder="请输入抖音链接" maxlength="100" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="formData.personalDescription" type="textarea" :rows="3" placeholder="请输入个人简介" />
            </el-form-item>
            <el-form-item label="工作经历">
              <el-input v-model="formData.experienceJob" type="textarea" :rows="3" placeholder="请输入工作经历" />
            </el-form-item>
            <el-form-item label="成就">
              <div v-for="(item, index) in formData.achievements" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.achievements[index]" placeholder="请输入成就" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.achievements, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.achievements)">+ 添加成就</el-button>
            </el-form-item>
            <el-form-item label="擅长领域">
              <div v-for="(item, index) in formData.expertiseAreas" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.expertiseAreas[index]" placeholder="请输入擅长领域" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.expertiseAreas, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.expertiseAreas)">+ 添加擅长领域</el-button>
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" />
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 7: 培训机构管理页面

**Files:**
- Create: `apps/admin/src/views/home/institution/index.vue`

- [ ] **Step 1: 实现培训机构管理页面**

（结构与规划师页面一致，字段不同。具体字段见 spec。）

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getInstitutionPage,
  getInstitutionDetail,
  addInstitution,
  updateInstitution,
  updateInstitutionStatus,
  deleteInstitution,
} from '@/api/home/institution'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
} from '@/types/home/institution'

const loading = ref(false)
const tableData = ref<InstitutionListVO[]>([])
const total = ref(0)

const queryParams = reactive<InstitutionQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<InstitutionDetailVO | null>(null)

const formData = reactive<InstitutionAddDTO>({
  name: '',
  type: '',
  phone: '',
  address: '',
  description: '',
  courses: [],
  images: [],
  logo: '',
  sortOrder: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: InstitutionQueryDTO = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getInstitutionPage(params)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => { queryParams.name = ''; queryParams.status = undefined; queryParams.page = 1; fetchData() }
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增培训机构'
    formData.name = ''
    formData.type = ''
    formData.phone = ''
    formData.address = ''
    formData.description = ''
    formData.courses = []
    formData.images = []
    formData.logo = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改培训机构'
    formLoading.value = true
    try {
      const res = await getInstitutionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.name = d.name
        formData.type = d.type
        formData.phone = d.phone || ''
        formData.address = d.address || ''
        formData.description = d.description || ''
        formData.courses = d.courses || []
        formData.images = d.images || []
        formData.logo = d.logo || ''
        formData.sortOrder = d.sortOrder || 0
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '培训机构详情'
    formLoading.value = true
    try {
      const res = await getInstitutionDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.name || !formData.type) {
    ElMessage.warning('请填写机构名称和类型')
    return
  }
  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: InstitutionAddDTO = { name: formData.name, type: formData.type }
      if (formData.phone) data.phone = formData.phone
      if (formData.address) data.address = formData.address
      if (formData.description) data.description = formData.description
      if (formData.courses && formData.courses.length > 0) data.courses = formData.courses
      if (formData.images && formData.images.length > 0) data.images = formData.images
      if (formData.logo) data.logo = formData.logo
      data.sortOrder = formData.sortOrder
      res = await addInstitution(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: InstitutionUpdateDTO = { name: formData.name, type: formData.type }
      if (formData.phone) data.phone = formData.phone
      if (formData.address) data.address = formData.address
      if (formData.description) data.description = formData.description
      if (formData.courses && formData.courses.length > 0) data.courses = formData.courses
      if (formData.images && formData.images.length > 0) data.images = formData.images
      if (formData.logo) data.logo = formData.logo
      data.sortOrder = formData.sortOrder
      res = await updateInstitution(currentId.value, data)
    }
    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row: InstitutionListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该机构吗？`, '提示')
    const res = await updateInstitutionStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该机构吗？此操作不可恢复！', '警告', { type: 'warning' })
    const res = await deleteInstitution(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const addArrayItem = (arr: string[]) => { arr.push('') }
const removeArrayItem = (arr: string[], index: number) => { arr.splice(index, 1) }

const statusTag = (status: number) => (status === 1 ? 'success' : 'info')
const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="名称">
          <el-input v-model="queryParams.name" placeholder="名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="展示" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增机构</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column prop="phone" label="电话" width="140" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.status === 1 ? 'info' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <!-- 详情 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ detailData.type }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ detailData.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ detailData.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Logo" v-if="detailData.logo">
              <el-image :src="detailData.logo" style="width: 80px; height: 80px;" fit="contain" />
            </el-descriptions-item>
            <el-descriptions-item label="课程" v-if="detailData.courses && detailData.courses.length">
              <el-tag v-for="(item, i) in detailData.courses" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">{{ statusLabel(detailData.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="名称" required>
              <el-input v-model="formData.name" placeholder="请输入机构名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="类型" required>
              <el-input v-model="formData.type" placeholder="请输入机构类型" maxlength="100" />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input v-model="formData.address" placeholder="请输入地址" maxlength="100" />
            </el-form-item>
            <el-form-item label="简介">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入机构简介" />
            </el-form-item>
            <el-form-item label="Logo URL">
              <el-input v-model="formData.logo" placeholder="请输入 Logo 链接" maxlength="200" />
            </el-form-item>
            <el-form-item label="课程">
              <div v-for="(item, index) in formData.courses" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.courses[index]" placeholder="请输入课程名称" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.courses, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.courses)">+ 添加课程</el-button>
            </el-form-item>
            <el-form-item label="图片 URL">
              <div v-for="(item, index) in formData.images" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.images[index]" placeholder="请输入图片链接" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.images, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.images)">+ 添加图片</el-button>
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" />
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```
