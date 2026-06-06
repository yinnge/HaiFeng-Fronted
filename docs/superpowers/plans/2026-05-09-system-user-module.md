# 系统设置与用户管理模块实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现管理后台的系统设置、用户管理、操作日志三个模块

**Architecture:** 遵循现有权限管理模块的组件拆分模式（Search + Table + DetailModal），系统设置采用分组卡片式布局

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Tailwind CSS + Axios

---

## 文件结构

### 新建文件

```
apps/admin/src/
├── api/
│   ├── system/
│   │   ├── settings.ts          # 系统设置 API
│   │   └── log.ts               # 操作日志 API
│   └── user/
│       └── index.ts             # 用户管理 API
├── types/
│   ├── system/
│   │   ├── settings.ts          # 系统设置类型
│   │   └── log.ts               # 操作日志类型
│   └── user/
│       └── index.ts             # 用户管理类型
├── views/
│   ├── system/
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── BasicInfoCard.vue
│   │   │   │   ├── PricingCard.vue
│   │   │   │   ├── SeoCard.vue
│   │   │   │   ├── SocialCard.vue
│   │   │   │   └── ContactCard.vue
│   │   │   └── index.vue
│   │   └── log/
│   │       ├── components/
│   │       │   ├── LogSearch.vue
│   │       │   ├── LogTable.vue
│   │       │   └── LogDetailModal.vue
│   │       └── index.vue
│   └── user/
│       └── list/
│           ├── components/
│           │   ├── UserSearch.vue
│           │   ├── UserTable.vue
│           │   ├── UserDetailModal.vue
│           │   └── UserUpgradeModal.vue
│           └── index.vue
└── router/
    └── modules/
        ├── system.ts
        └── user.ts

packages/shared/src/types/enums/index.ts  # 追加 UserStatus 枚举
```

### 修改文件

```
apps/admin/src/router/index.ts           # 注册新路由模块
```

---

## Task 1: 类型定义 - 系统设置

**Files:**
- Create: `apps/admin/src/types/system/settings.ts`

- [ ] **Step 1: 创建系统设置类型定义文件**

```typescript
// apps/admin/src/types/system/settings.ts

/** 社交媒体链接 */
export interface ContactUrl {
  wechat?: string
  weibo?: string
  zhihu?: string
  douyin?: string
  bilibili?: string
}

/** 基本联系信息 */
export interface BasicMessage {
  address?: string
  phone?: string
  email?: string
  consultationTime?: string
}

/** 系统设置 VO */
export interface SystemSettingsVO {
  id: number
  siteName: string
  siteUrl: string
  siteIcp: string
  siteDescription: string
  apiNumber: number
  proPrice: number
  vipPrice: number
  proCommissionRate: number
  vipCommissionRate: number
  seoTitle: string
  seoKeywords: string
  seoDescription: string
  contactUrl: ContactUrl
  basicMessage: BasicMessage
  updatedAt: string
}

/** 系统设置更新 DTO */
export interface SystemSettingsUpdateDTO {
  siteName?: string
  siteUrl?: string
  siteIcp?: string
  siteDescription?: string
  apiNumber?: number
  proPrice?: number
  vipPrice?: number
  proCommissionRate?: number
  vipCommissionRate?: number
  seoTitle?: string
  seoKeywords?: string
  seoDescription?: string
  contactUrl?: ContactUrl
  basicMessage?: BasicMessage
}
```

---

## Task 2: 类型定义 - 操作日志

**Files:**
- Create: `apps/admin/src/types/system/log.ts`

- [ ] **Step 1: 创建操作日志类型定义文件**

```typescript
// apps/admin/src/types/system/log.ts
import type { BasePageQuery } from '@haifeng/shared'

/** 操作日志列表 VO */
export interface AdminLogListVO {
  id: number
  adminName: string
  operation: string
  requestMethod: string
  result: 'SUCCESS' | 'FAIL'
  ip: string
  createdAt: string
}

/** 操作日志详情 VO */
export interface AdminLogDetailVO extends AdminLogListVO {
  adminId: number
  requestPath: string
  requestParams: string
  errorMsg?: string
}

/** 操作日志查询 DTO */
export interface AdminLogQueryDTO extends BasePageQuery {
  adminName?: string
  result?: 'SUCCESS' | 'FAIL'
  requestMethod?: string
}

/** 操作日志批量删除 DTO */
export interface AdminLogBatchDeleteDTO {
  type: 'ids' | 'lastMonth' | 'all'
  ids?: number[]
}
```

---

## Task 3: 类型定义 - 用户管理

**Files:**
- Create: `apps/admin/src/types/user/index.ts`

- [ ] **Step 1: 创建用户管理类型定义文件**

```typescript
// apps/admin/src/types/user/index.ts
import type { BasePageQuery } from '@haifeng/shared'

/** 用户列表 VO */
export interface MemberListVO {
  id: number
  username: string
  phone: string
  memberType: 'normal' | 'pro' | 'vip'
  wechatId: string
  status: 'active' | 'disabled'
  lastLoginAt: string
  lastLoginIp: string
  createdAt: string
}

/** 用户详情 VO */
export interface MemberDetailVO extends MemberListVO {
  avatar: string
  inviteCode: string
  expireAt: string
  referrerId: number
  referrerUsername: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  updatedAt: string
}

/** 用户查询 DTO */
export interface MemberQueryDTO extends BasePageQuery {
  phone?: string
  memberType?: 'normal' | 'pro' | 'vip'
  wechatId?: string
  status?: 'active' | 'disabled'
  inviteCode?: string
}

/** 用户状态修改 DTO */
export interface MemberStatusDTO {
  status: 'active' | 'disabled'
}

/** 会员升级 DTO */
export interface MemberUpgradeDTO {
  targetType: 'pro' | 'vip'
  durationMonths: number
  amount?: number
  remark?: string
}
```

---

## Task 4: 枚举扩展 - 用户状态

**Files:**
- Modify: `packages/shared/src/types/enums/index.ts`

- [ ] **Step 1: 在枚举文件末尾追加用户状态枚举**

在文件末尾追加以下内容：

```typescript
/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: '正常',
  [UserStatus.DISABLED]: '禁用',
}

export const UserStatusTag: Record<UserStatus, 'success' | 'danger'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.DISABLED]: 'danger',
}
```

---

## Task 5: API 定义 - 系统设置

**Files:**
- Create: `apps/admin/src/api/system/settings.ts`

- [ ] **Step 1: 创建系统设置 API 文件**

```typescript
// apps/admin/src/api/system/settings.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SystemSettingsVO, SystemSettingsUpdateDTO } from '@/types/system/settings'

const PREFIX = '/api/v1/admin/system/settings'

/** 获取系统设置 */
export const getSystemSettings = () => {
  return request.get<R<SystemSettingsVO>>(PREFIX)
}

/** 更新系统设置 */
export const updateSystemSettings = (data: SystemSettingsUpdateDTO) => {
  return request.put<R<void>>(PREFIX, data)
}
```

---

## Task 6: API 定义 - 操作日志

**Files:**
- Create: `apps/admin/src/api/system/log.ts`

- [ ] **Step 1: 创建操作日志 API 文件**

```typescript
// apps/admin/src/api/system/log.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AdminLogListVO,
  AdminLogDetailVO,
  AdminLogQueryDTO,
  AdminLogBatchDeleteDTO,
} from '@/types/system/log'

const PREFIX = '/api/v1/admin/system/logs'

/** 分页查询操作日志 */
export const getLogPage = (params: AdminLogQueryDTO) => {
  return request.get<R<PageResult<AdminLogListVO>>>(`${PREFIX}/list`, { params })
}

/** 获取操作日志详情 */
export const getLogDetail = (id: number) => {
  return request.get<R<AdminLogDetailVO>>(`${PREFIX}/${id}`)
}

/** 批量删除操作日志 */
export const batchDeleteLogs = (data: AdminLogBatchDeleteDTO) => {
  return request.delete<R<number>>(`${PREFIX}/batch`, { data })
}
```

---

## Task 7: API 定义 - 用户管理

**Files:**
- Create: `apps/admin/src/api/user/index.ts`

- [ ] **Step 1: 创建用户管理 API 文件**

```typescript
// apps/admin/src/api/user/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  MemberListVO,
  MemberDetailVO,
  MemberQueryDTO,
  MemberStatusDTO,
  MemberUpgradeDTO,
} from '@/types/user'

const PREFIX = '/api/v1/admin/user'

/** 分页查询用户列表 */
export const getUserPage = (params: MemberQueryDTO) => {
  return request.get<R<PageResult<MemberListVO>>>(`${PREFIX}/list`, { params })
}

/** 获取用户详情 */
export const getUserDetail = (id: number) => {
  return request.get<R<MemberDetailVO>>(`${PREFIX}/${id}`)
}

/** 修改用户状态 */
export const updateUserStatus = (id: number, data: MemberStatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

/** 查看用户微信明文 */
export const getUserWechat = (id: number) => {
  return request.get<R<string>>(`${PREFIX}/${id}/wechat`)
}

/** 会员升级 */
export const upgradeUser = (id: number, data: MemberUpgradeDTO) => {
  return request.post<R<number>>(`${PREFIX}/${id}/upgrade`, data)
}
```

---

## Task 8: 路由配置 - 系统管理

**Files:**
- Create: `apps/admin/src/router/modules/system.ts`

- [ ] **Step 1: 创建系统管理路由模块**

```typescript
// apps/admin/src/router/modules/system.ts
import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw = {
  path: '/system',
  name: 'System',
  meta: { title: '系统管理', icon: 'Setting' },
  redirect: '/system/settings',
  children: [
    {
      path: 'settings',
      name: 'SystemSettings',
      component: () => import('@/views/system/settings/index.vue'),
      meta: { title: '系统设置', icon: 'Tools' },
    },
    {
      path: 'log',
      name: 'SystemLog',
      component: () => import('@/views/system/log/index.vue'),
      meta: { title: '操作日志', icon: 'Document' },
    },
  ],
}

export default systemRoutes
```

---

## Task 9: 路由配置 - 用户管理

**Files:**
- Create: `apps/admin/src/router/modules/user.ts`

- [ ] **Step 1: 创建用户管理路由模块**

```typescript
// apps/admin/src/router/modules/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw = {
  path: '/user',
  name: 'User',
  meta: { title: '用户管理', icon: 'User' },
  redirect: '/user/list',
  children: [
    {
      path: 'list',
      name: 'UserList',
      component: () => import('@/views/user/list/index.vue'),
      meta: { title: '用户列表', icon: 'UserFilled' },
    },
  ],
}

export default userRoutes
```

---

## Task 10: 路由注册

**Files:**
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 导入新路由模块**

在文件顶部导入区域添加：

```typescript
import systemRoutes from './modules/system'
import userRoutes from './modules/user'
```

- [ ] **Step 2: 注册路由到 asyncRoutes**

修改 `asyncRoutes` 数组中的 `children`，在 `permissionRoutes` 前后插入新路由：

```typescript
children: [
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '控制面板', icon: 'Monitor' },
  },
  systemRoutes,
  permissionRoutes,
  userRoutes,
  {
    path: 'profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { title: '个人中心', hidden: true },
  },
],
```

---

## Task 11: 系统设置 - BasicInfoCard 组件

**Files:**
- Create: `apps/admin/src/views/system/settings/components/BasicInfoCard.vue`

- [ ] **Step 1: 创建基本信息卡片组件**

```vue
<!-- apps/admin/src/views/system/settings/components/BasicInfoCard.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref({
  siteName: '',
  siteUrl: '',
  siteIcp: '',
  siteDescription: '',
  apiNumber: 3,
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        siteName: val.siteName || '',
        siteUrl: val.siteUrl || '',
        siteIcp: val.siteIcp || '',
        siteDescription: val.siteDescription || '',
        apiNumber: val.apiNumber || 3,
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings(form.value)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存基本信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">基本信息</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="网站名称">
        <el-input v-model="form.siteName" placeholder="请输入网站名称" maxlength="50" />
      </el-form-item>
      <el-form-item label="Logo URL">
        <el-input v-model="form.siteUrl" placeholder="请输入 Logo URL" maxlength="100" />
      </el-form-item>
      <el-form-item label="ICP 备案号">
        <el-input v-model="form.siteIcp" placeholder="请输入 ICP 备案号" maxlength="100" />
      </el-form-item>
      <el-form-item label="网站描述">
        <el-input
          v-model="form.siteDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入网站描述"
        />
      </el-form-item>
      <el-form-item label="API 调用次数">
        <el-input-number v-model="form.apiNumber" :min="1" :max="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 12: 系统设置 - PricingCard 组件

**Files:**
- Create: `apps/admin/src/views/system/settings/components/PricingCard.vue`

- [ ] **Step 1: 创建会员价格卡片组件**

```vue
<!-- apps/admin/src/views/system/settings/components/PricingCard.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref({
  proPrice: 199,
  vipPrice: 599,
  proCommissionRate: 10,
  vipCommissionRate: 15,
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        proPrice: val.proPrice || 199,
        vipPrice: val.vipPrice || 599,
        proCommissionRate: val.proCommissionRate || 10,
        vipCommissionRate: val.vipCommissionRate || 15,
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings(form.value)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存会员价格失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">会员价格</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="Pro 会员价格">
        <el-input-number v-model="form.proPrice" :min="0" :precision="0" />
        <span class="ml-2 text-gray-400">元/年</span>
      </el-form-item>
      <el-form-item label="VIP 会员价格">
        <el-input-number v-model="form.vipPrice" :min="0" :precision="0" />
        <span class="ml-2 text-gray-400">元/年</span>
      </el-form-item>
      <el-form-item label="Pro 佣金比例">
        <el-input-number v-model="form.proCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="ml-2 text-gray-400">%</span>
      </el-form-item>
      <el-form-item label="VIP 佣金比例">
        <el-input-number v-model="form.vipCommissionRate" :min="0" :max="100" :precision="0" />
        <span class="ml-2 text-gray-400">%</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 13: 系统设置 - SeoCard 组件

**Files:**
- Create: `apps/admin/src/views/system/settings/components/SeoCard.vue`

- [ ] **Step 1: 创建 SEO 配置卡片组件**

```vue
<!-- apps/admin/src/views/system/settings/components/SeoCard.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref({
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
})

watch(
  () => props.data,
  (val) => {
    if (val) {
      form.value = {
        seoTitle: val.seoTitle || '',
        seoKeywords: val.seoKeywords || '',
        seoDescription: val.seoDescription || '',
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings(form.value)
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存 SEO 配置失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">SEO 配置</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="SEO 标题">
        <el-input v-model="form.seoTitle" placeholder="请输入 SEO 标题" maxlength="200" />
      </el-form-item>
      <el-form-item label="SEO 关键词">
        <el-input v-model="form.seoKeywords" placeholder="请输入关键词，用逗号分隔" maxlength="100" />
      </el-form-item>
      <el-form-item label="SEO 描述">
        <el-input
          v-model="form.seoDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入 SEO 描述"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 14: 系统设置 - SocialCard 组件

**Files:**
- Create: `apps/admin/src/views/system/settings/components/SocialCard.vue`

- [ ] **Step 1: 创建社交媒体卡片组件**

```vue
<!-- apps/admin/src/views/system/settings/components/SocialCard.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO, ContactUrl } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<ContactUrl>({
  wechat: '',
  weibo: '',
  zhihu: '',
  douyin: '',
  bilibili: '',
})

watch(
  () => props.data,
  (val) => {
    if (val?.contactUrl) {
      form.value = {
        wechat: val.contactUrl.wechat || '',
        weibo: val.contactUrl.weibo || '',
        zhihu: val.contactUrl.zhihu || '',
        douyin: val.contactUrl.douyin || '',
        bilibili: val.contactUrl.bilibili || '',
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings({ contactUrl: form.value })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存社交媒体失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">社交媒体</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="微信二维码">
        <el-input v-model="form.wechat" placeholder="请输入微信二维码 URL" />
      </el-form-item>
      <el-form-item label="微博">
        <el-input v-model="form.weibo" placeholder="请输入微博主页 URL" />
      </el-form-item>
      <el-form-item label="知乎">
        <el-input v-model="form.zhihu" placeholder="请输入知乎主页 URL" />
      </el-form-item>
      <el-form-item label="抖音">
        <el-input v-model="form.douyin" placeholder="请输入抖音主页 URL" />
      </el-form-item>
      <el-form-item label="B站">
        <el-input v-model="form.bilibili" placeholder="请输入 B 站主页 URL" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 15: 系统设置 - ContactCard 组件

**Files:**
- Create: `apps/admin/src/views/system/settings/components/ContactCard.vue`

- [ ] **Step 1: 创建联系信息卡片组件**

```vue
<!-- apps/admin/src/views/system/settings/components/ContactCard.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO, BasicMessage } from '@/types/system/settings'

const props = defineProps<{
  data: SystemSettingsVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<BasicMessage>({
  address: '',
  phone: '',
  email: '',
  consultationTime: '',
})

watch(
  () => props.data,
  (val) => {
    if (val?.basicMessage) {
      form.value = {
        address: val.basicMessage.address || '',
        phone: val.basicMessage.phone || '',
        email: val.basicMessage.email || '',
        consultationTime: val.basicMessage.consultationTime || '',
      }
    }
  },
  { immediate: true }
)

const handleSave = async () => {
  loading.value = true
  try {
    const res = await updateSystemSettings({ basicMessage: form.value })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存联系信息失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <h3 class="text-lg font-medium mb-4">联系信息</h3>
    <el-form :model="form" label-width="120px">
      <el-form-item label="公司地址">
        <el-input v-model="form.address" placeholder="请输入公司地址" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="联系邮箱">
        <el-input v-model="form.email" placeholder="请输入联系邮箱" />
      </el-form-item>
      <el-form-item label="咨询时间">
        <el-input v-model="form.consultationTime" placeholder="如：周一至周五 9:00-18:00" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 16: 系统设置 - 主页面

**Files:**
- Create: `apps/admin/src/views/system/settings/index.vue`

- [ ] **Step 1: 创建系统设置主页面**

```vue
<!-- apps/admin/src/views/system/settings/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSystemSettings } from '@/api/system/settings'
import type { SystemSettingsVO } from '@/types/system/settings'
import BasicInfoCard from './components/BasicInfoCard.vue'
import PricingCard from './components/PricingCard.vue'
import SeoCard from './components/SeoCard.vue'
import SocialCard from './components/SocialCard.vue'
import ContactCard from './components/ContactCard.vue'

const loading = ref(false)
const settingsData = ref<SystemSettingsVO | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSystemSettings()
    if (res.data.code === 200) {
      settingsData.value = res.data.data
    }
  } catch (error) {
    console.error('获取系统设置失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-loading="loading">
    <BasicInfoCard :data="settingsData" @refresh="fetchData" />
    <PricingCard :data="settingsData" @refresh="fetchData" />
    <SeoCard :data="settingsData" @refresh="fetchData" />
    <SocialCard :data="settingsData" @refresh="fetchData" />
    <ContactCard :data="settingsData" @refresh="fetchData" />
  </div>
</template>
```

---

## Task 17: 操作日志 - LogSearch 组件

**Files:**
- Create: `apps/admin/src/views/system/log/components/LogSearch.vue`

- [ ] **Step 1: 创建操作日志搜索组件**

```vue
<!-- apps/admin/src/views/system/log/components/LogSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { AdminLogQueryDTO } from '@/types/system/log'

const emit = defineEmits<{
  (e: 'search', params: AdminLogQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<AdminLogQueryDTO, 'page' | 'size'>>({
  adminName: '',
  result: undefined,
  requestMethod: undefined,
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.adminName = ''
  searchForm.result = undefined
  searchForm.requestMethod = undefined
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="管理员">
        <el-input
          v-model="searchForm.adminName"
          placeholder="请输入管理员姓名"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="操作结果">
        <el-select
          v-model="searchForm.result"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="成功" value="SUCCESS" />
          <el-option label="失败" value="FAIL" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select
          v-model="searchForm.requestMethod"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 18: 操作日志 - LogTable 组件

**Files:**
- Create: `apps/admin/src/views/system/log/components/LogTable.vue`

- [ ] **Step 1: 创建操作日志表格组件**

```vue
<!-- apps/admin/src/views/system/log/components/LogTable.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { batchDeleteLogs } from '@/api/system/log'
import type { AdminLogListVO } from '@/types/system/log'

defineProps<{
  data: AdminLogListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', id: number): void
  (e: 'refresh'): void
}>()

const selectedIds = ref<number[]>([])

const handleSelectionChange = (rows: AdminLogListVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
}

const handleBatchDelete = async (type: 'ids' | 'lastMonth' | 'all') => {
  if (type === 'ids' && selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }

  const messages: Record<string, string> = {
    ids: `确定要删除选中的 ${selectedIds.value.length} 条记录吗？`,
    lastMonth: '确定要删除一个月前的所有日志吗？',
    all: '确定要删除全部日志吗？此操作不可恢复！',
  }

  try {
    await ElMessageBox.confirm(messages[type], '警告', {
      type: type === 'all' ? 'error' : 'warning',
    })

    const res = await batchDeleteLogs({
      type,
      ids: type === 'ids' ? selectedIds.value : undefined,
    })

    if (res.data.code === 200) {
      ElMessage.success(`成功删除 ${res.data.data} 条记录`)
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

const getMethodTagType = (method: string) => {
  const map: Record<string, string> = {
    GET: 'info',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger',
  }
  return map[method] || 'info'
}

const pageSizes = [10, 20, 30, 50, 100, 200, 500, 1000]
</script>

<template>
  <div class="bg-white rounded-lg p-5">
    <div class="mb-4">
      <el-dropdown @command="handleBatchDelete">
        <el-button type="danger">
          批量删除
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="ids" :disabled="selectedIds.length === 0">
              删除选中 ({{ selectedIds.length }})
            </el-dropdown-item>
            <el-dropdown-item command="lastMonth">删除一个月前</el-dropdown-item>
            <el-dropdown-item command="all" style="color: #f56c6c">删除全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-table :data="data" v-loading="loading" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="adminName" label="管理员" min-width="100" />
      <el-table-column prop="operation" label="操作描述" min-width="180" />
      <el-table-column prop="requestMethod" label="请求方法" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getMethodTagType(row.requestMethod)" size="small">
            {{ row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="操作结果" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ row.result === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP 地址" width="140" />
      <el-table-column prop="createdAt" label="操作时间" width="180" />
      <el-table-column label="操作" width="80" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row.id)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end mt-4">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="emit('page-change', $event)"
        @size-change="emit('size-change', $event)"
      />
    </div>
  </div>
</template>
```

---

## Task 19: 操作日志 - LogDetailModal 组件

**Files:**
- Create: `apps/admin/src/views/system/log/components/LogDetailModal.vue`

- [ ] **Step 1: 创建操作日志详情弹窗组件**

```vue
<!-- apps/admin/src/views/system/log/components/LogDetailModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { getLogDetail } from '@/api/system/log'
import type { AdminLogDetailVO } from '@/types/system/log'

const props = defineProps<{
  visible: boolean
  logId?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const loading = ref(false)
const detail = ref<AdminLogDetailVO | null>(null)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.logId) {
      loading.value = true
      try {
        const res = await getLogDetail(props.logId)
        if (res.data.code === 200) {
          detail.value = res.data.data
        }
      } catch (error) {
        console.error('获取日志详情失败:', error)
      } finally {
        loading.value = false
      }
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
  detail.value = null
}

const formatJson = (str: string) => {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="日志详情"
    width="600px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="日志 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="管理员 ID">{{ detail.adminId }}</el-descriptions-item>
        <el-descriptions-item label="管理员">{{ detail.adminName }}</el-descriptions-item>
        <el-descriptions-item label="操作描述">{{ detail.operation }}</el-descriptions-item>
        <el-descriptions-item label="请求路径" :span="2">{{ detail.requestPath }}</el-descriptions-item>
        <el-descriptions-item label="请求方法">
          <el-tag size="small">{{ detail.requestMethod }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作结果">
          <el-tag :type="detail.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ detail.result === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2" v-if="detail.requestParams">
          <pre class="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">{{ formatJson(detail.requestParams) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detail.errorMsg">
          <span class="text-red-500">{{ detail.errorMsg }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
```

---

## Task 20: 操作日志 - 主页面

**Files:**
- Create: `apps/admin/src/views/system/log/index.vue`

- [ ] **Step 1: 创建操作日志主页面**

```vue
<!-- apps/admin/src/views/system/log/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogPage } from '@/api/system/log'
import type { AdminLogListVO, AdminLogQueryDTO } from '@/types/system/log'
import LogSearch from './components/LogSearch.vue'
import LogTable from './components/LogTable.vue'
import LogDetailModal from './components/LogDetailModal.vue'

const loading = ref(false)
const tableData = ref<AdminLogListVO[]>([])
const total = ref(0)

const queryParams = reactive<AdminLogQueryDTO>({
  page: 1,
  size: 10,
  adminName: '',
  result: undefined,
  requestMethod: undefined,
})

const showDetailModal = ref(false)
const currentLogId = ref<number | undefined>()

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLogPage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: AdminLogQueryDTO) => {
  queryParams.adminName = params.adminName
  queryParams.result = params.result
  queryParams.requestMethod = params.requestMethod
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.adminName = ''
  queryParams.result = undefined
  queryParams.requestMethod = undefined
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

const handleDetail = (id: number) => {
  currentLogId.value = id
  showDetailModal.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <LogSearch @search="handleSearch" @reset="handleReset" />

    <LogTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @refresh="fetchData"
    />

    <LogDetailModal
      v-model:visible="showDetailModal"
      :log-id="currentLogId"
    />
  </div>
</template>
```

---

## Task 21: 用户管理 - UserSearch 组件

**Files:**
- Create: `apps/admin/src/views/user/list/components/UserSearch.vue`

- [ ] **Step 1: 创建用户搜索组件**

```vue
<!-- apps/admin/src/views/user/list/components/UserSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { MemberQueryDTO } from '@/types/user'

const emit = defineEmits<{
  (e: 'search', params: MemberQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<MemberQueryDTO, 'page' | 'size'>>({
  phone: '',
  inviteCode: '',
  memberType: undefined,
  status: undefined,
  wechatId: '',
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.phone = ''
  searchForm.inviteCode = ''
  searchForm.memberType = undefined
  searchForm.status = undefined
  searchForm.wechatId = ''
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="手机号">
        <el-input
          v-model="searchForm.phone"
          placeholder="请输入手机号"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="邀请码">
        <el-input
          v-model="searchForm.inviteCode"
          placeholder="请输入邀请码"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="会员类型">
        <el-select
          v-model="searchForm.memberType"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="普通用户" value="normal" />
          <el-option label="专业版" value="pro" />
          <el-option label="VIP会员" value="vip" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 100px"
        >
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="微信号">
        <el-input
          v-model="searchForm.wechatId"
          placeholder="精准匹配"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 22: 用户管理 - UserTable 组件

**Files:**
- Create: `apps/admin/src/views/user/list/components/UserTable.vue`

- [ ] **Step 1: 创建用户表格组件**

```vue
<!-- apps/admin/src/views/user/list/components/UserTable.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { updateUserStatus } from '@/api/user'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberListVO } from '@/types/user'

defineProps<{
  data: MemberListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', row: MemberListVO): void
  (e: 'upgrade', row: MemberListVO): void
  (e: 'refresh'): void
}>()

const handleToggleStatus = async (row: MemberListVO) => {
  const isDisabling = row.status === 'active'
  const action = isDisabling ? '禁用' : '启用'
  const newStatus = isDisabling ? 'disabled' : 'active'

  try {
    await ElMessageBox.confirm(`确定要${action}用户"${row.username}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await updateUserStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${action}成功`)
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || `${action}失败`)
    }
  } catch {
    // 用户取消
  }
}

const pageSizes = [10, 20, 30, 50, 100, 200, 500, 1000]
</script>

<template>
  <div class="bg-white rounded-lg p-5">
    <el-table :data="data" v-loading="loading" stripe>
      <el-table-column prop="username" label="用户名" min-width="100" />
      <el-table-column prop="phone" label="手机号" min-width="120" />
      <el-table-column prop="memberType" label="会员类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="MemberTypeTag[row.memberType as keyof typeof MemberTypeTag]" size="small">
            {{ MemberTypeLabel[row.memberType as keyof typeof MemberTypeLabel] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="wechatId" label="微信号" min-width="120">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.wechatId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row)">详情</el-button>
          <el-button type="warning" link @click="emit('upgrade', row)">升级</el-button>
          <el-button
            :type="row.status === 'active' ? 'danger' : 'success'"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end mt-4">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="emit('page-change', $event)"
        @size-change="emit('size-change', $event)"
      />
    </div>
  </div>
</template>
```

---

## Task 23: 用户管理 - UserDetailModal 组件

**Files:**
- Create: `apps/admin/src/views/user/list/components/UserDetailModal.vue`

- [ ] **Step 1: 创建用户详情弹窗组件**

```vue
<!-- apps/admin/src/views/user/list/components/UserDetailModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserDetail, getUserWechat } from '@/api/user'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberDetailVO, MemberListVO } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: MemberListVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const loading = ref(false)
const detail = ref<MemberDetailVO | null>(null)
const wechatPlaintext = ref<string | null>(null)
const loadingWechat = ref(false)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.user) {
      wechatPlaintext.value = null
      loading.value = true
      try {
        const res = await getUserDetail(props.user.id)
        if (res.data.code === 200) {
          detail.value = res.data.data
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
      } finally {
        loading.value = false
      }
    }
  }
)

const handleViewWechat = async () => {
  if (!detail.value) return
  loadingWechat.value = true
  try {
    const res = await getUserWechat(detail.value.id)
    if (res.data.code === 200) {
      wechatPlaintext.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch (error) {
    console.error('获取微信明文失败:', error)
    ElMessage.error('获取微信号失败')
  } finally {
    loadingWechat.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
  detail.value = null
  wechatPlaintext.value = null
}

const formatMoney = (val: number) => val?.toFixed(2) || '0.00'
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="用户详情"
    width="700px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="用户 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="邀请码">{{ detail.inviteCode }}</el-descriptions-item>
        <el-descriptions-item label="会员类型">
          <el-tag :type="MemberTypeTag[detail.memberType as keyof typeof MemberTypeTag]" size="small">
            {{ MemberTypeLabel[detail.memberType as keyof typeof MemberTypeLabel] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ detail.expireAt || '未开通' }}</el-descriptions-item>
        <el-descriptions-item label="微信号">
          <span>{{ wechatPlaintext || detail.wechatId || '-' }}</span>
          <el-button
            v-if="detail.wechatId && !wechatPlaintext"
            type="primary"
            link
            size="small"
            :loading="loadingWechat"
            @click="handleViewWechat"
          >
            查看明文
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 'active' ? 'success' : 'danger'" size="small">
            {{ detail.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="推荐人">
          {{ detail.referrerUsername || '-' }}
          <span v-if="detail.referrerId" class="text-gray-400 ml-1">(ID: {{ detail.referrerId }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="佣金余额">¥{{ formatMoney(detail.commissionBalance) }}</el-descriptions-item>
        <el-descriptions-item label="累计佣金">¥{{ formatMoney(detail.commissionTotalEarned) }}</el-descriptions-item>
        <el-descriptions-item label="已提现">¥{{ formatMoney(detail.commissionTotalPaid) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ detail.lastLoginAt }}</el-descriptions-item>
        <el-descriptions-item label="登录 IP">{{ detail.lastLoginIp }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
```

---

## Task 24: 用户管理 - UserUpgradeModal 组件

**Files:**
- Create: `apps/admin/src/views/user/list/components/UserUpgradeModal.vue`

- [ ] **Step 1: 创建会员升级弹窗组件**

```vue
<!-- apps/admin/src/views/user/list/components/UserUpgradeModal.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { upgradeUser } from '@/api/user'
import { MemberTypeLabel } from '@haifeng/shared'
import type { MemberListVO, MemberUpgradeDTO } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: MemberListVO | null
  proPrice: number
  vipPrice: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const form = ref<MemberUpgradeDTO>({
  targetType: 'pro',
  durationMonths: 12,
  amount: undefined,
  remark: '',
})
const amountMode = ref<'auto' | 'manual'>('auto')

const durationOptions = [1, 3, 6, 12, 24, 36]

const autoAmount = computed(() => {
  const yearPrice = form.value.targetType === 'pro' ? props.proPrice : props.vipPrice
  return ((yearPrice / 12) * form.value.durationMonths).toFixed(2)
})

const displayAmount = computed(() => {
  return amountMode.value === 'auto' ? autoAmount.value : (form.value.amount?.toFixed(2) || '0.00')
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = {
        targetType: 'pro',
        durationMonths: 12,
        amount: undefined,
        remark: '',
      }
      amountMode.value = 'auto'
    }
  }
)

const handleSubmit = async () => {
  if (!props.user) return

  loading.value = true
  try {
    const data: MemberUpgradeDTO = {
      targetType: form.value.targetType,
      durationMonths: form.value.durationMonths,
      remark: form.value.remark || undefined,
    }
    if (amountMode.value === 'manual' && form.value.amount !== undefined) {
      data.amount = form.value.amount
    }

    const res = await upgradeUser(props.user.id, data)
    if (res.data.code === 200) {
      ElMessage.success('升级成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.data.msg || '升级失败')
    }
  } catch (error) {
    console.error('会员升级失败:', error)
    ElMessage.error('升级失败')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="会员升级"
    width="500px"
    @close="handleClose"
  >
    <div v-if="user">
      <div class="mb-4 p-3 bg-gray-50 rounded">
        <p>当前会员: <el-tag size="small">{{ MemberTypeLabel[user.memberType as keyof typeof MemberTypeLabel] }}</el-tag></p>
      </div>

      <el-form :model="form" label-width="100px">
        <el-form-item label="目标类型" required>
          <el-select v-model="form.targetType" style="width: 200px">
            <el-option label="专业版 (Pro)" value="pro" />
            <el-option label="VIP会员" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="开通时长" required>
          <el-select v-model="form.durationMonths" style="width: 200px">
            <el-option
              v-for="m in durationOptions"
              :key="m"
              :label="`${m} 个月`"
              :value="m"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-radio-group v-model="amountMode" class="mb-2">
            <el-radio value="auto">自动计算</el-radio>
            <el-radio value="manual">手动输入</el-radio>
          </el-radio-group>
          <div class="flex items-center">
            <el-input-number
              v-if="amountMode === 'manual'"
              v-model="form.amount"
              :min="0"
              :precision="2"
              style="width: 160px"
            />
            <span v-else class="text-lg font-medium">¥{{ autoAmount }}</span>
            <span class="ml-2 text-gray-400">元</span>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="如：后台手动开通、优惠活动等"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认升级</el-button>
    </template>
  </el-dialog>
</template>
```

---

## Task 25: 用户管理 - 主页面

**Files:**
- Create: `apps/admin/src/views/user/list/index.vue`

- [ ] **Step 1: 创建用户列表主页面**

```vue
<!-- apps/admin/src/views/user/list/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUserPage } from '@/api/user'
import { getSystemSettings } from '@/api/system/settings'
import type { MemberListVO, MemberQueryDTO } from '@/types/user'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserDetailModal from './components/UserDetailModal.vue'
import UserUpgradeModal from './components/UserUpgradeModal.vue'

const loading = ref(false)
const tableData = ref<MemberListVO[]>([])
const total = ref(0)

const queryParams = reactive<MemberQueryDTO>({
  page: 1,
  size: 10,
  phone: '',
  inviteCode: '',
  memberType: undefined,
  status: undefined,
  wechatId: '',
})

const showDetailModal = ref(false)
const showUpgradeModal = ref(false)
const currentUser = ref<MemberListVO | null>(null)

const proPrice = ref(199)
const vipPrice = ref(599)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPrices = async () => {
  try {
    const res = await getSystemSettings()
    if (res.data.code === 200) {
      proPrice.value = res.data.data.proPrice || 199
      vipPrice.value = res.data.data.vipPrice || 599
    }
  } catch (error) {
    console.error('获取价格配置失败:', error)
  }
}

const handleSearch = (params: MemberQueryDTO) => {
  queryParams.phone = params.phone
  queryParams.inviteCode = params.inviteCode
  queryParams.memberType = params.memberType
  queryParams.status = params.status
  queryParams.wechatId = params.wechatId
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.phone = ''
  queryParams.inviteCode = ''
  queryParams.memberType = undefined
  queryParams.status = undefined
  queryParams.wechatId = ''
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

const handleDetail = (row: MemberListVO) => {
  currentUser.value = row
  showDetailModal.value = true
}

const handleUpgrade = (row: MemberListVO) => {
  currentUser.value = row
  showUpgradeModal.value = true
}

const handleUpgradeSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchPrices()
})
</script>

<template>
  <div>
    <UserSearch @search="handleSearch" @reset="handleReset" />

    <UserTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @upgrade="handleUpgrade"
      @refresh="fetchData"
    />

    <UserDetailModal
      v-model:visible="showDetailModal"
      :user="currentUser"
    />

    <UserUpgradeModal
      v-model:visible="showUpgradeModal"
      :user="currentUser"
      :pro-price="proPrice"
      :vip-price="vipPrice"
      @success="handleUpgradeSuccess"
    />
  </div>
</template>
```

---

## 验证步骤

- [ ] **Step 1: 启动开发服务器**

```bash
cd apps/admin
pnpm dev
```

- [ ] **Step 2: 验证页面访问**

1. 访问 `/system/settings` - 系统设置页面应显示 5 个卡片
2. 访问 `/system/log` - 操作日志列表页面
3. 访问 `/user/list` - 用户列表页面

- [ ] **Step 3: 验证侧边栏菜单**

确认菜单顺序：控制面板 → 系统管理 → 权限管理 → 用户管理

---

## 完成标准

- [x] 所有类型定义文件创建完成
- [x] 所有 API 文件创建完成
- [x] 所有路由模块创建完成
- [x] 系统设置 5 个卡片组件 + 主页面
- [x] 操作日志 Search + Table + DetailModal + 主页面
- [x] 用户管理 Search + Table + DetailModal + UpgradeModal + 主页面
- [x] 路由注册到主路由
