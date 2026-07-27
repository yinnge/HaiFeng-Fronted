# C端用户个人中心实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 apps/user 实现 C 端用户个人中心功能，包括用户资料管理、账号安全、佣金提现。

**Architecture:** 单页面 + Tab 切换布局，分为三个 Tab（个人资料、账号安全、佣金提现），先实现接口层（枚举+类型+API），再实现页面组件。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Tailwind CSS + Pinia

**设计文档:** `docs/superpowers/specs/2026-05-13-user-profile-center-design.md`

---

## 文件结构

### 新建文件

| 路径 | 职责 |
|------|------|
| `packages/shared/src/types/enums/identity.ts` | 身份枚举 |
| `packages/shared/src/types/enums/gender.ts` | 性别枚举 |
| `packages/shared/src/types/enums/province.ts` | 省份枚举 |
| `apps/user/src/types/member/profile.ts` | 用户资料类型定义 |
| `apps/user/src/types/member/info.ts` | 用户信息类型定义 |
| `apps/user/src/types/member/commission.ts` | 佣金类型定义 |
| `apps/user/src/types/search/index.ts` | 模糊搜索类型定义 |
| `apps/user/src/api/member/profile.ts` | 用户资料 API |
| `apps/user/src/api/member/info.ts` | 用户信息 API |
| `apps/user/src/api/member/commission.ts` | 佣金 API |
| `apps/user/src/api/search/index.ts` | 模糊搜索 API |
| `apps/user/src/views/profile/index.vue` | 个人中心主页面 |
| `apps/user/src/views/profile/components/ProfileHeader.vue` | 头像+VIP+统计 |
| `apps/user/src/views/profile/components/ProfileForm.vue` | 用户资料表单 |
| `apps/user/src/views/profile/components/AccountInfo.vue` | 账号安全 |
| `apps/user/src/views/profile/components/CommissionPanel.vue` | 佣金提现 |

### 修改文件

| 路径 | 修改内容 |
|------|----------|
| `packages/shared/src/types/enums/index.ts` | 导出新枚举 |
| `apps/user/src/router/index.ts` | 添加 /profile 路由 + 登录拦截 |
| `apps/user/src/store/modules/user.ts` | 添加 redirectPath 状态 |

---

## Task 1: 身份枚举 (Identity)

**Files:**
- Create: `packages/shared/src/types/enums/identity.ts`
- Modify: `packages/shared/src/types/enums/index.ts`

- [ ] **Step 1: 创建身份枚举文件**

```typescript
// packages/shared/src/types/enums/identity.ts

/**
 * 身份枚举
 */
export enum Identity {
  HIGH_SCHOOL = '高中生',
  UNIVERSITY = '大学生',
  POSTGRADUATE = '研究生',
  OTHER = '其他',
}

export const IdentityLabel: Record<Identity, string> = {
  [Identity.HIGH_SCHOOL]: '高中生',
  [Identity.UNIVERSITY]: '大学生',
  [Identity.POSTGRADUATE]: '研究生',
  [Identity.OTHER]: '其他',
}

export const IdentityOptions = [
  { value: Identity.HIGH_SCHOOL, label: '高中生' },
  { value: Identity.UNIVERSITY, label: '大学生' },
  { value: Identity.POSTGRADUATE, label: '研究生' },
  { value: Identity.OTHER, label: '其他' },
]

/**
 * 判断身份是否允许编辑学校
 */
export function canEditSchoolByIdentity(identity: Identity | null): boolean {
  return identity === Identity.UNIVERSITY || identity === Identity.POSTGRADUATE
}
```

- [ ] **Step 2: 导出枚举**

在 `packages/shared/src/types/enums/index.ts` 末尾添加：

```typescript
// 身份枚举
export * from './identity'
```

- [ ] **Step 3: 验证**

运行 TypeScript 编译检查：
```bash
cd packages/shared && npx tsc --noEmit
```

---

## Task 2: 性别枚举 (Gender)

**Files:**
- Create: `packages/shared/src/types/enums/gender.ts`
- Modify: `packages/shared/src/types/enums/index.ts`

- [ ] **Step 1: 创建性别枚举文件**

```typescript
// packages/shared/src/types/enums/gender.ts

/**
 * 性别枚举
 */
export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
}

export const GenderOptions = [
  { value: Gender.MALE, label: '男' },
  { value: Gender.FEMALE, label: '女' },
]
```

- [ ] **Step 2: 导出枚举**

在 `packages/shared/src/types/enums/index.ts` 末尾添加：

```typescript
// 性别枚举
export * from './gender'
```

---

## Task 3: 省份枚举 (Province)

**Files:**
- Create: `packages/shared/src/types/enums/province.ts`
- Modify: `packages/shared/src/types/enums/index.ts`

- [ ] **Step 1: 创建省份枚举文件**

```typescript
// packages/shared/src/types/enums/province.ts

/**
 * 34个省份/地区
 */
export const ProvinceList = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '香港', '澳门', '台湾',
] as const

export type Province = typeof ProvinceList[number]

export const ProvinceOptions = ProvinceList.map((province) => ({
  value: province,
  label: province,
}))
```

- [ ] **Step 2: 导出枚举**

在 `packages/shared/src/types/enums/index.ts` 末尾添加：

```typescript
// 省份枚举
export * from './province'
```

---

## Task 4: 用户资料类型定义

**Files:**
- Create: `apps/user/src/types/member/profile.ts`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p apps/user/src/types/member
```

- [ ] **Step 2: 创建类型文件**

```typescript
// apps/user/src/types/member/profile.ts

import type { Gender, Identity, Province } from '@haifeng/shared'

/**
 * 用户资料 VO
 */
export interface MemberProfileVO {
  realName: string | null
  email: string | null
  gender: Gender | null
  schoolName: string | null
  province: Province | null
  city: string | null
  major: string | null
  identity: Identity | null
  grade: string | null
  educationLevel: string | null
  favoriteCount: number
  canEditSchool: boolean
}

/**
 * 用户资料更新 DTO
 */
export interface MemberProfileUpdateDTO {
  realName?: string
  email?: string
  gender?: string
  schoolName?: string
  province?: string
  city?: string
  major?: string
  identity?: string
  grade?: string
  educationLevel?: string
}
```

---

## Task 5: 用户信息类型定义

**Files:**
- Create: `apps/user/src/types/member/info.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
// apps/user/src/types/member/info.ts

import type { MemberType } from '@haifeng/shared'

/**
 * 用户信息 VO
 */
export interface MemberInfoVO {
  username: string
  phone: string
  avatar: string | null
  hasWechat: boolean
  inviteCode: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  memberType: MemberType
  expireAt: string | null
}

/**
 * 用户信息更新 DTO
 */
export interface MemberInfoUpdateDTO {
  username?: string
  phone?: string
  avatar?: string
}

/**
 * 密码修改 DTO
 */
export interface PasswordUpdateDTO {
  oldPassword: string
  newPassword: string
}
```

---

## Task 6: 佣金类型定义

**Files:**
- Create: `apps/user/src/types/member/commission.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
// apps/user/src/types/member/commission.ts

/**
 * 佣金信息 VO
 */
export interface CommissionVO {
  inviteCode: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  referralCount: number
  referrerInviteCode: string | null
}

/**
 * 提现 DTO
 */
export interface WithdrawDTO {
  amount: 50 | 100
}

/**
 * 推荐人预览 VO
 */
export interface ReferrerPreviewVO {
  username: string
  phone: string
}

/**
 * 绑定推荐人 DTO
 */
export interface BindReferrerDTO {
  inviteCode: string
}
```

---

## Task 7: 模糊搜索类型定义

**Files:**
- Create: `apps/user/src/types/search/index.ts`

- [ ] **Step 1: 创建目录和类型文件**

```bash
mkdir -p apps/user/src/types/search
```

```typescript
// apps/user/src/types/search/index.ts

/**
 * 模糊搜索结果项
 */
export interface SearchItem {
  id: number
  name: string
}
```

---

## Task 8: 用户资料 API

**Files:**
- Create: `apps/user/src/api/member/profile.ts`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p apps/user/src/api/member
```

- [ ] **Step 2: 创建 API 文件**

```typescript
// apps/user/src/api/member/profile.ts

import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberProfileVO, MemberProfileUpdateDTO } from '@/types/member/profile'

const PREFIX = '/api/v1/app/member'

/**
 * 获取用户资料
 */
export const getProfile = () => {
  return request.get<R<MemberProfileVO>>(`${PREFIX}/profile`)
}

/**
 * 更新用户资料
 */
export const updateProfile = (data: MemberProfileUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/profile`, data)
}
```

---

## Task 9: 用户信息 API

**Files:**
- Create: `apps/user/src/api/member/info.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
// apps/user/src/api/member/info.ts

import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'

const PREFIX = '/api/v1/app/member'

/**
 * 获取用户信息
 */
export const getMemberInfo = () => {
  return request.get<R<MemberInfoVO>>(`${PREFIX}/info`)
}

/**
 * 更新用户信息
 */
export const updateMemberInfo = (data: MemberInfoUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/info`, data)
}

/**
 * 获取微信号（解密）
 */
export const getWechatId = () => {
  return request.get<R<string>>(`${PREFIX}/wechat`)
}

/**
 * 修改微信号
 */
export const updateWechatId = (wechatId: string) => {
  return request.put<R<null>>(`${PREFIX}/wechat`, { wechatId })
}

/**
 * 修改密码
 */
export const updatePassword = (data: PasswordUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/password`, data)
}

/**
 * 修改头像
 */
export const updateAvatar = (avatar: string) => {
  return request.put<R<null>>(`${PREFIX}/avatar`, { avatar })
}
```

---

## Task 10: 佣金 API

**Files:**
- Create: `apps/user/src/api/member/commission.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
// apps/user/src/api/member/commission.ts

import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { CommissionVO, WithdrawDTO, ReferrerPreviewVO, BindReferrerDTO } from '@/types/member/commission'

const PREFIX = '/api/v1/app/member'

/**
 * 获取佣金信息
 */
export const getCommission = () => {
  return request.get<R<CommissionVO>>(`${PREFIX}/commission`)
}

/**
 * 申请提现
 */
export const withdraw = (data: WithdrawDTO) => {
  return request.post<R<number>>(`${PREFIX}/withdraw`, data)
}

/**
 * 预览推荐人信息
 */
export const previewReferrer = (inviteCode: string) => {
  return request.get<R<ReferrerPreviewVO>>(`${PREFIX}/referrer/preview`, {
    params: { inviteCode },
  })
}

/**
 * 绑定推荐人
 */
export const bindReferrer = (data: BindReferrerDTO) => {
  return request.post<R<null>>(`${PREFIX}/referrer/bind`, data)
}
```

---

## Task 11: 模糊搜索 API

**Files:**
- Create: `apps/user/src/api/search/index.ts`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p apps/user/src/api/search
```

- [ ] **Step 2: 创建 API 文件**

```typescript
// apps/user/src/api/search/index.ts

import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SearchItem } from '@/types/search'

const PREFIX = '/api/v1/app/search'

/**
 * 搜索大学
 */
export const searchUniversity = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/university`, {
    params: { keyword, limit },
  })
}

/**
 * 搜索城市
 */
export const searchCity = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/city`, {
    params: { keyword, limit },
  })
}

/**
 * 搜索专业
 */
export const searchMajor = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/major`, {
    params: { keyword, limit },
  })
}
```

---

## Task 12: 更新 User Store

**Files:**
- Modify: `apps/user/src/store/modules/user.ts`

- [ ] **Step 1: 添加 redirectPath 状态**

将 `apps/user/src/store/modules/user.ts` 替换为：

```typescript
// apps/user/src/store/modules/user.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setTokens, clearTokens, type MemberType } from '@haifeng/shared'

interface UserInfo {
  id: string
  nickname: string
  avatar?: string
  phone?: string
  memberType: MemberType
  memberExpireAt?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const userInfo = ref<UserInfo | null>(null)
  const redirectPath = ref<string | null>(null)

  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function logout() {
    token.value = null
    userInfo.value = null
    clearTokens()
  }

  function isLoggedIn(): boolean {
    return !!token.value
  }

  function setRedirectPath(path: string | null) {
    redirectPath.value = path
  }

  function getRedirectPath(): string | null {
    const path = redirectPath.value
    redirectPath.value = null
    return path
  }

  return {
    token,
    userInfo,
    redirectPath,
    setToken,
    setUserInfo,
    logout,
    isLoggedIn,
    setRedirectPath,
    getRedirectPath,
  }
})
```

---

## Task 13: 路由配置与登录拦截

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: 更新路由配置**

将 `apps/user/src/router/index.ts` 替换为：

```typescript
// apps/user/src/router/index.ts

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '海枫未来规划院'}`

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn()) {
      // 存储目标路由
      userStore.setRedirectPath(to.fullPath)

      try {
        await ElMessageBox.confirm(
          '您还没有登录，请先登录',
          '提示',
          {
            confirmButtonText: '前往登录',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        next({ name: 'Login' })
      } catch {
        next(false)
      }
      return
    }
  }

  next()
})

export default router
```

---

## Task 14: 安装 Element Plus（如未安装）

**Files:**
- Modify: `apps/user/package.json`
- Modify: `apps/user/src/main.ts`

- [ ] **Step 1: 安装依赖**

```bash
cd apps/user && pnpm add element-plus @element-plus/icons-vue
```

- [ ] **Step 2: 配置 Element Plus**

修改 `apps/user/src/main.ts`：

```typescript
// apps/user/src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
```

---

## Task 15: ProfileHeader 组件

**Files:**
- Create: `apps/user/src/views/profile/components/ProfileHeader.vue`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p apps/user/src/views/profile/components
```

- [ ] **Step 2: 创建组件**

```vue
<!-- apps/user/src/views/profile/components/ProfileHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'update-avatar'): void
}>()

const memberTypeLabel = computed(() => {
  if (!props.memberInfo) return ''
  return MemberTypeLabel[props.memberInfo.memberType] || '普通用户'
})

const memberTypeTagType = computed(() => {
  if (!props.memberInfo) return 'info'
  return MemberTypeTag[props.memberInfo.memberType] || 'info'
})

const expireAtFormatted = computed(() => {
  if (!props.memberInfo?.expireAt) return ''
  const date = new Date(props.memberInfo.expireAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

function handleAvatarClick() {
  emit('update-avatar')
}
</script>

<template>
  <div class="flex items-center gap-6 rounded-lg bg-white p-6 shadow-sm">
    <!-- 头像区域 -->
    <div class="relative cursor-pointer" @click="handleAvatarClick">
      <el-avatar
        :size="80"
        :src="memberInfo?.avatar || ''"
        class="border-2 border-gray-200"
      >
        <span class="text-2xl">{{ memberInfo?.username?.charAt(0) || '?' }}</span>
      </el-avatar>
      <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
        <el-icon class="text-white"><Edit /></el-icon>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="text-xl font-semibold text-gray-800">
          {{ memberInfo?.username || '用户' }}
        </span>
        <el-tag :type="memberTypeTagType" size="small">
          {{ memberTypeLabel }}
        </el-tag>
      </div>
      <div class="mt-1 text-sm text-gray-500">
        {{ memberInfo?.phone || '' }}
      </div>
      <div v-if="expireAtFormatted" class="mt-1 text-xs text-gray-400">
        会员到期：{{ expireAtFormatted }}
      </div>
    </div>

    <!-- 统计区域 -->
    <div class="flex gap-8">
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-500">
          {{ profile?.favoriteCount || 0 }}
        </div>
        <div class="text-sm text-gray-500">收藏</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Edit } from '@element-plus/icons-vue'
export default {
  components: { Edit },
}
</script>
```

---

## Task 16: ProfileForm 组件

**Files:**
- Create: `apps/user/src/views/profile/components/ProfileForm.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/user/src/views/profile/components/ProfileForm.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  GenderOptions,
  IdentityOptions,
  ProvinceOptions,
  Identity,
  canEditSchoolByIdentity,
} from '@haifeng/shared'
import type { MemberProfileVO, MemberProfileUpdateDTO } from '@/types/member/profile'
import type { SearchItem } from '@/types/search'
import { updateProfile } from '@/api/member/profile'
import { searchUniversity, searchCity, searchMajor } from '@/api/search'

const props = defineProps<{
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<MemberProfileUpdateDTO>({
  realName: '',
  email: '',
  gender: '',
  identity: '',
  province: '',
  city: '',
  major: '',
  schoolName: '',
  grade: '',
  educationLevel: '',
})

// 监听 profile 变化，更新表单
watch(
  () => props.profile,
  (val) => {
    if (val) {
      form.value = {
        realName: val.realName || '',
        email: val.email || '',
        gender: val.gender || '',
        identity: val.identity || '',
        province: val.province || '',
        city: val.city || '',
        major: val.major || '',
        schoolName: val.schoolName || '',
        grade: val.grade || '',
        educationLevel: val.educationLevel || '',
      }
    }
  },
  { immediate: true }
)

// 是否显示学校字段
const showSchoolField = computed(() => {
  return canEditSchoolByIdentity(form.value.identity as Identity)
})

// 身份变化时清空学校
watch(
  () => form.value.identity,
  (newVal, oldVal) => {
    if (oldVal && !canEditSchoolByIdentity(newVal as Identity)) {
      form.value.schoolName = ''
    }
  }
)

// 模糊搜索 - 大学
const universityOptions = ref<SearchItem[]>([])
async function handleUniversitySearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchUniversity(query)
    universityOptions.value = data.data
    cb(data.data.map((item) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 模糊搜索 - 城市
async function handleCitySearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchCity(query)
    cb(data.data.map((item) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 模糊搜索 - 专业
async function handleMajorSearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchMajor(query)
    cb(data.data.map((item) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 保存
async function handleSave() {
  loading.value = true
  try {
    await updateProfile(form.value)
    ElMessage.success('保存成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <el-form :model="form" label-width="100px" class="max-w-2xl">
      <el-form-item label="真实姓名">
        <el-input v-model="form.realName" placeholder="请输入真实姓名" maxlength="50" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
      </el-form-item>

      <el-form-item label="性别">
        <el-select v-model="form.gender" placeholder="请选择性别" class="w-full">
          <el-option
            v-for="item in GenderOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="身份">
        <el-select v-model="form.identity" placeholder="请选择身份" class="w-full">
          <el-option
            v-for="item in IdentityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="省份">
        <el-select v-model="form.province" placeholder="请选择省份" filterable class="w-full">
          <el-option
            v-for="item in ProvinceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="城市">
        <el-autocomplete
          v-model="form.city"
          :fetch-suggestions="handleCitySearch"
          placeholder="请输入城市"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="专业">
        <el-autocomplete
          v-model="form.major"
          :fetch-suggestions="handleMajorSearch"
          placeholder="请输入专业"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showSchoolField" label="学校">
        <el-autocomplete
          v-model="form.schoolName"
          :fetch-suggestions="handleUniversitySearch"
          placeholder="请输入学校"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="年级">
        <el-input v-model="form.grade" placeholder="如：高一、大三、研一" maxlength="20" />
      </el-form-item>

      <el-form-item label="学历层次">
        <el-input v-model="form.educationLevel" placeholder="如：本科、硕士" maxlength="20" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
```

---

## Task 17: AccountInfo 组件

**Files:**
- Create: `apps/user/src/views/profile/components/AccountInfo.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/user/src/views/profile/components/AccountInfo.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'
import { updateMemberInfo, getWechatId, updateWechatId, updatePassword } from '@/api/member/info'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<MemberInfoUpdateDTO>({
  username: '',
  phone: '',
})

// 微信号相关
const wechatVisible = ref(false)
const wechatId = ref('')
const wechatLoading = ref(false)
const wechatEditing = ref(false)
const newWechatId = ref('')

// 密码相关
const passwordVisible = ref(false)
const passwordForm = ref<PasswordUpdateDTO>({
  oldPassword: '',
  newPassword: '',
})
const passwordLoading = ref(false)

// 监听 memberInfo 变化
watch(
  () => props.memberInfo,
  (val) => {
    if (val) {
      form.value = {
        username: val.username || '',
        phone: val.phone || '',
      }
    }
  },
  { immediate: true }
)

// 保存用户信息
async function handleSave() {
  loading.value = true
  try {
    await updateMemberInfo(form.value)
    ElMessage.success('保存成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 查看微信号
async function handleViewWechat() {
  wechatLoading.value = true
  try {
    const { data } = await getWechatId()
    wechatId.value = data.data
    wechatVisible.value = true
    wechatEditing.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '获取失败')
  } finally {
    wechatLoading.value = false
  }
}

// 修改微信号
async function handleSaveWechat() {
  if (!newWechatId.value) {
    ElMessage.warning('请输入微信号')
    return
  }
  wechatLoading.value = true
  try {
    await updateWechatId(newWechatId.value)
    ElMessage.success('微信号修改成功')
    wechatVisible.value = false
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    wechatLoading.value = false
  }
}

// 打开修改密码弹窗
function handleOpenPassword() {
  passwordForm.value = { oldPassword: '', newPassword: '' }
  passwordVisible.value = true
}

// 修改密码
async function handleSavePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.value.newPassword.length < 6 || passwordForm.value.newPassword.length > 20) {
    ElMessage.warning('新密码长度需为6-20位')
    return
  }
  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.value)
    ElMessage.success('密码修改成功')
    passwordVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <el-form :model="form" label-width="100px" class="max-w-2xl">
      <el-form-item label="用户名">
        <el-input v-model="form.username" placeholder="请输入用户名" maxlength="50" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>

      <el-form-item label="微信号">
        <div class="flex items-center gap-2">
          <span v-if="memberInfo?.hasWechat" class="text-gray-500">已绑定</span>
          <span v-else class="text-gray-400">未绑定</span>
          <el-button type="primary" link @click="handleViewWechat">
            查看/修改
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="密码">
        <el-button type="primary" link @click="handleOpenPassword">
          修改密码
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 微信号弹窗 -->
    <el-dialog v-model="wechatVisible" title="微信号" width="400px">
      <div v-if="!wechatEditing">
        <p class="mb-4">当前微信号：<strong>{{ wechatId || '未绑定' }}</strong></p>
        <el-button type="primary" @click="wechatEditing = true; newWechatId = wechatId">
          修改微信号
        </el-button>
      </div>
      <div v-else>
        <el-input v-model="newWechatId" placeholder="请输入新微信号" maxlength="50" />
        <div class="mt-4 flex gap-2">
          <el-button type="primary" :loading="wechatLoading" @click="handleSaveWechat">
            保存
          </el-button>
          <el-button @click="wechatEditing = false">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleSavePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

## Task 18: CommissionPanel 组件

**Files:**
- Create: `apps/user/src/views/profile/components/CommissionPanel.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/user/src/views/profile/components/CommissionPanel.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import type { CommissionVO, ReferrerPreviewVO } from '@/types/member/commission'
import { getCommission, withdraw, previewReferrer, bindReferrer } from '@/api/member/commission'

const commission = ref<CommissionVO | null>(null)
const loading = ref(false)

// 提现相关
const withdrawVisible = ref(false)
const withdrawAmount = ref<50 | 100>(50)
const withdrawLoading = ref(false)

// 绑定邀请码相关
const bindVisible = ref(false)
const bindInviteCode = ref('')
const bindLoading = ref(false)
const referrerPreview = ref<ReferrerPreviewVO | null>(null)
const previewLoading = ref(false)

// 是否可提现
const canWithdraw50 = computed(() => (commission.value?.commissionBalance || 0) >= 50)
const canWithdraw100 = computed(() => (commission.value?.commissionBalance || 0) >= 100)

// 是否已绑定推荐人
const hasBound = computed(() => !!commission.value?.referrerInviteCode)

// 加载佣金信息
async function loadCommission() {
  loading.value = true
  try {
    const { data } = await getCommission()
    commission.value = data.data
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 复制邀请码
function handleCopy() {
  if (!commission.value?.inviteCode) return
  navigator.clipboard.writeText(commission.value.inviteCode)
  ElMessage.success('邀请码已复制')
}

// 打开提现弹窗
function handleOpenWithdraw() {
  withdrawAmount.value = 50
  withdrawVisible.value = true
}

// 确认提现
async function handleWithdraw() {
  if (withdrawAmount.value === 50 && !canWithdraw50.value) {
    ElMessage.warning('余额不足50元')
    return
  }
  if (withdrawAmount.value === 100 && !canWithdraw100.value) {
    ElMessage.warning('余额不足100元')
    return
  }

  withdrawLoading.value = true
  try {
    await withdraw({ amount: withdrawAmount.value })
    ElMessage.success('提现申请已提交')
    withdrawVisible.value = false
    loadCommission()
  } catch (err: any) {
    ElMessage.error(err.message || '提现失败')
  } finally {
    withdrawLoading.value = false
  }
}

// 打开绑定弹窗
function handleOpenBind() {
  bindInviteCode.value = ''
  referrerPreview.value = null
  bindVisible.value = true
}

// 预览推荐人
async function handlePreview() {
  if (!bindInviteCode.value) {
    ElMessage.warning('请输入邀请码')
    return
  }
  previewLoading.value = true
  try {
    const { data } = await previewReferrer(bindInviteCode.value)
    referrerPreview.value = data.data
  } catch (err: any) {
    ElMessage.error(err.message || '邀请码无效')
    referrerPreview.value = null
  } finally {
    previewLoading.value = false
  }
}

// 确认绑定
async function handleBind() {
  if (!referrerPreview.value) {
    ElMessage.warning('请先验证邀请码')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认绑定推荐人 ${referrerPreview.value.username}（${referrerPreview.value.phone}）？绑定后不可修改`,
      '确认绑定',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
  } catch {
    return
  }

  bindLoading.value = true
  try {
    await bindReferrer({ inviteCode: bindInviteCode.value })
    ElMessage.success('绑定成功')
    bindVisible.value = false
    loadCommission()
  } catch (err: any) {
    ElMessage.error(err.message || '绑定失败')
  } finally {
    bindLoading.value = false
  }
}

// 初始加载
loadCommission()
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <div v-if="loading" class="flex justify-center py-8">
      <el-icon class="is-loading text-2xl"><Loading /></el-icon>
    </div>

    <div v-else-if="commission" class="space-y-6">
      <!-- 邀请码 -->
      <div class="flex items-center gap-4 rounded-lg bg-orange-50 p-4">
        <div>
          <div class="text-sm text-gray-500">我的邀请码</div>
          <div class="text-xl font-bold text-orange-500">{{ commission.inviteCode }}</div>
        </div>
        <el-button type="primary" :icon="CopyDocument" circle @click="handleCopy" />
      </div>

      <!-- 佣金统计 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-green-500">
            ¥{{ commission.commissionBalance.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">可提现余额</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-orange-500">
            ¥{{ commission.commissionTotalEarned.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">累计获得</div>
        </div>
        <div class="rounded-lg bg-gray-50 p-4 text-center">
          <div class="text-2xl font-bold text-blue-500">
            ¥{{ commission.commissionTotalPaid.toFixed(2) }}
          </div>
          <div class="text-sm text-gray-500">累计发放</div>
        </div>
      </div>

      <!-- 邀请人数 -->
      <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4">
        <span class="text-gray-600">已邀请人数</span>
        <span class="text-xl font-bold text-orange-500">{{ commission.referralCount }} 人</span>
      </div>

      <!-- 提现按钮 -->
      <el-button type="primary" class="w-full" @click="handleOpenWithdraw">
        申请提现
      </el-button>

      <!-- 推荐人绑定 -->
      <div class="rounded-lg border border-gray-200 p-4">
        <div class="mb-2 text-sm text-gray-500">我的推荐人</div>
        <div v-if="hasBound" class="text-gray-800">
          邀请码：{{ commission.referrerInviteCode }}
        </div>
        <div v-else>
          <span class="text-gray-400">未绑定</span>
          <el-button type="primary" link class="ml-2" @click="handleOpenBind">
            绑定邀请码
          </el-button>
        </div>
      </div>
    </div>

    <!-- 提现弹窗 -->
    <el-dialog v-model="withdrawVisible" title="申请提现" width="400px">
      <div class="space-y-4">
        <p>当前可提现余额：<strong class="text-green-500">¥{{ commission?.commissionBalance.toFixed(2) }}</strong></p>
        <div>
          <span class="mr-4">选择提现金额：</span>
          <el-radio-group v-model="withdrawAmount">
            <el-radio :value="50" :disabled="!canWithdraw50">50元</el-radio>
            <el-radio :value="100" :disabled="!canWithdraw100">100元</el-radio>
          </el-radio-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="withdrawVisible = false">取消</el-button>
        <el-button type="primary" :loading="withdrawLoading" @click="handleWithdraw">
          确认提现
        </el-button>
      </template>
    </el-dialog>

    <!-- 绑定邀请码弹窗 -->
    <el-dialog v-model="bindVisible" title="绑定推荐人" width="400px">
      <div class="space-y-4">
        <el-input
          v-model="bindInviteCode"
          placeholder="请输入邀请码"
          maxlength="8"
          @keyup.enter="handlePreview"
        >
          <template #append>
            <el-button :loading="previewLoading" @click="handlePreview">验证</el-button>
          </template>
        </el-input>

        <div v-if="referrerPreview" class="rounded-lg bg-green-50 p-4">
          <p>推荐人：<strong>{{ referrerPreview.username }}</strong></p>
          <p>手机号：{{ referrerPreview.phone }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="bindVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="bindLoading"
          :disabled="!referrerPreview"
          @click="handleBind"
        >
          确认绑定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Loading } from '@element-plus/icons-vue'
export default {
  components: { Loading },
}
</script>
```

---

## Task 19: 个人中心主页面

**Files:**
- Create: `apps/user/src/views/profile/index.vue`

- [ ] **Step 1: 创建主页面**

```vue
<!-- apps/user/src/views/profile/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileForm from './components/ProfileForm.vue'
import AccountInfo from './components/AccountInfo.vue'
import CommissionPanel from './components/CommissionPanel.vue'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import { getProfile } from '@/api/member/profile'
import { getMemberInfo, updateAvatar } from '@/api/member/info'

const activeTab = ref('profile')
const memberInfo = ref<MemberInfoVO | null>(null)
const profile = ref<MemberProfileVO | null>(null)
const loading = ref(false)

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const [infoRes, profileRes] = await Promise.all([getMemberInfo(), getProfile()])
    memberInfo.value = infoRes.data.data
    profile.value = profileRes.data.data
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
function handleRefresh() {
  loadData()
}

// 更新头像
function handleUpdateAvatar() {
  // TODO: 实现头像上传逻辑
  ElMessage.info('头像上传功能待实现')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="mx-auto max-w-4xl px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div v-else class="space-y-6">
        <!-- 头部 -->
        <ProfileHeader
          :member-info="memberInfo"
          :profile="profile"
          @update-avatar="handleUpdateAvatar"
        />

        <!-- Tab 切换 -->
        <el-card shadow="never">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="个人资料" name="profile">
              <ProfileForm :profile="profile" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="账号安全" name="account">
              <AccountInfo :member-info="memberInfo" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="佣金提现" name="commission">
              <CommissionPanel />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Loading } from '@element-plus/icons-vue'
export default {
  components: { Loading },
}
</script>
```

---

## Task 20: 验证与测试

- [ ] **Step 1: 启动开发服务器**

```bash
cd apps/user && pnpm dev
```

- [ ] **Step 2: 访问页面**

访问 `http://localhost:5173/profile`，应该弹出登录提示框。

- [ ] **Step 3: 检查 TypeScript 编译**

```bash
cd apps/user && npx tsc --noEmit
```

---

## 完成清单

- [ ] Task 1: 身份枚举
- [ ] Task 2: 性别枚举
- [ ] Task 3: 省份枚举
- [ ] Task 4: 用户资料类型定义
- [ ] Task 5: 用户信息类型定义
- [ ] Task 6: 佣金类型定义
- [ ] Task 7: 模糊搜索类型定义
- [ ] Task 8: 用户资料 API
- [ ] Task 9: 用户信息 API
- [ ] Task 10: 佣金 API
- [ ] Task 11: 模糊搜索 API
- [ ] Task 12: 更新 User Store
- [ ] Task 13: 路由配置与登录拦截
- [ ] Task 14: 安装 Element Plus
- [ ] Task 15: ProfileHeader 组件
- [ ] Task 16: ProfileForm 组件
- [ ] Task 17: AccountInfo 组件
- [ ] Task 18: CommissionPanel 组件
- [ ] Task 19: 个人中心主页面
- [ ] Task 20: 验证与测试
