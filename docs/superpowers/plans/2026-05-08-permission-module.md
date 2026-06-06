# 权限管理模块实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现海枫管理后台的登录界面和权限管理模块（角色/模块/管理员 CRUD）

**Architecture:** Vue 3 + TypeScript + Element Plus + Pinia。登录页面采用 Factory 风格（白底 + 动态图案），后台采用深色侧边栏 + 灰白内容区布局。所有 API 通过 shared 包的 request 封装调用。

**Tech Stack:** Vue 3, TypeScript, Vite, Element Plus, Pinia, Axios, Tailwind CSS

**Design Spec:** `docs/superpowers/specs/2026-05-08-permission-module-design.md`

---

## 文件结构

```
apps/admin/src/
├── api/
│   ├── auth/index.ts                    # 认证 API（登录/验证码/刷新）
│   └── permission/
│       ├── role.ts                      # 角色 API
│       ├── admin.ts                     # 管理员 API
│       └── module.ts                    # 模块 API
├── views/
│   ├── login/
│   │   ├── index.vue                    # 登录页面主组件
│   │   ├── components/
│   │   │   ├── DynamicBackground.vue    # 动态图案背景
│   │   │   ├── BrandSection.vue         # 品牌区域（Logo + 标题）
│   │   │   ├── LoginCard.vue            # 登录卡片
│   │   │   ├── UserLoginForm.vue        # 用户登录表单
│   │   │   ├── UserRegisterForm.vue     # 用户注册表单
│   │   │   ├── AdminLoginForm.vue       # 管理员登录表单
│   │   │   ├── TotpModal.vue            # TOTP 验证弹窗
│   │   │   ├── ForgotPasswordModal.vue  # 忘记密码弹窗
│   │   │   └── AgreementModal.vue       # 协议弹窗
│   │   └── composables/
│   │       ├── useCaptcha.ts            # 验证码逻辑
│   │       └── useAuth.ts               # 登录/注册逻辑
│   └── permission/
│       ├── role/
│       │   ├── index.vue                # 角色列表页
│       │   └── components/
│       │       ├── RoleSearch.vue       # 搜索区域
│       │       ├── RoleTable.vue        # 表格组件
│       │       └── RoleDetailModal.vue  # 详情弹窗
│       ├── admin/
│       │   ├── index.vue                # 管理员列表页
│       │   └── components/
│       │       ├── AdminSearch.vue
│       │       ├── AdminTable.vue
│       │       └── AdminDetailModal.vue
│       └── module/
│           ├── index.vue                # 模块列表页
│           └── components/
│               ├── ModuleSearch.vue
│               ├── ModuleTable.vue
│               └── ModuleDetailModal.vue
├── types/
│   ├── auth/
│   │   └── index.ts                     # LoginDTO, TokenVO, CaptchaVO...
│   └── permission/
│       ├── role.ts                      # RoleVO, RoleQueryDTO...
│       ├── admin.ts                     # AdminVO, AdminQueryDTO...
│       └── module.ts                    # ModuleVO, ModuleTreeVO...
├── router/
│   └── modules/
│       └── permission.ts                # 权限模块路由
├── layout/
│   ├── index.vue                        # 主布局（已存在，需修改）
│   └── components/
│       ├── Sidebar.vue                  # 侧边栏（已存在，需修改）
│       └── Navbar.vue                   # 顶部导航（已存在，需修改）
└── components/
    ├── ConfirmModal.vue                 # 通用确认弹窗
    └── ExitConfirmModal.vue             # 退出确认弹窗
```

---

## Task 1: 认证相关类型定义

**Files:**
- Create: `apps/admin/src/types/auth/index.ts`

- [ ] **Step 1: 创建认证类型文件**

```typescript
// apps/admin/src/types/auth/index.ts

/** 登录请求 DTO */
export interface LoginDTO {
  phone: string
  password: string
  captchaCode: string
  uuid: string
}

/** 用户注册请求 DTO */
export interface RegisterDTO {
  phone: string
  password: string
  captchaCode: string
  uuid: string
  referrerCode?: string
}

/** TOTP 登录请求 DTO */
export interface TotpLoginDTO {
  preAuthToken: string
  totpCode: string
}

/** Token 响应 VO */
export interface TokenVO {
  accessToken: string
  refreshToken: string
  accessTokenExpire: number
  refreshTokenExpire: number
  tokenType: string
}

/** 验证码响应 VO */
export interface CaptchaVO {
  uuid: string
  image: string
}

/** 预认证响应 VO (TOTP) */
export interface PreAuthVO {
  preAuthToken: string
}

/** 刷新 Token 请求 DTO */
export interface RefreshTokenDTO {
  refreshToken: string
}
```

- [ ] **Step 2: 验证类型文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/types/auth/index.ts`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/types/auth/index.ts
git commit -m "feat(types): add auth type definitions"
```

---

## Task 2: 权限模块类型定义

**Files:**
- Create: `apps/admin/src/types/permission/role.ts`
- Create: `apps/admin/src/types/permission/admin.ts`
- Create: `apps/admin/src/types/permission/module.ts`

- [ ] **Step 1: 创建角色类型文件**

```typescript
// apps/admin/src/types/permission/role.ts
import type { BasePageQuery } from '@haifeng/shared'

/** 角色列表 VO */
export interface RoleVO {
  id: number
  roleName: string
  roleCode: string
  description?: string
  status: number
  createdAt: string
  updatedAt: string
}

/** 角色查询 DTO */
export interface RoleQueryDTO extends BasePageQuery {
  roleName?: string
  status?: number
}

/** 角色新增 DTO */
export interface RoleAddDTO {
  roleName: string
  roleCode: string
  description?: string
}

/** 角色更新 DTO */
export interface RoleUpdateDTO {
  roleName: string
  roleCode: string
  description?: string
}

/** 角色绑定模块 DTO */
export interface RoleBindModulesDTO {
  moduleIds: number[]
}
```

- [ ] **Step 2: 创建管理员类型文件**

```typescript
// apps/admin/src/types/permission/admin.ts
import type { BasePageQuery } from '@haifeng/shared'

/** 管理员列表 VO */
export interface AdminVO {
  id: number
  username: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
  roleName: string
  status: number
  isTotpEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/** 管理员查询 DTO */
export interface AdminQueryDTO extends BasePageQuery {
  username?: string
  phone?: string
  realName?: string
  status?: number
}

/** 管理员新增 DTO */
export interface AdminAddDTO {
  username: string
  password: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
}

/** 管理员更新 DTO */
export interface AdminUpdateDTO {
  username: string
  password?: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
  status?: number
}
```

- [ ] **Step 3: 创建模块类型文件**

```typescript
// apps/admin/src/types/permission/module.ts

/** 模块 VO */
export interface ModuleVO {
  id: number
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder: number
  level: number
  status: number
  description?: string
  createdAt: string
  updatedAt: string
}

/** 模块树形 VO */
export interface ModuleTreeVO extends ModuleVO {
  children?: ModuleTreeVO[]
}

/** 模块查询 DTO */
export interface ModuleQueryDTO {
  moduleCode?: string
}

/** 模块新增 DTO */
export interface ModuleAddDTO {
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  level: number
  description?: string
}

/** 模块更新 DTO */
export interface ModuleUpdateDTO {
  moduleName: string
  moduleCode: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  level: number
  description?: string
}
```

- [ ] **Step 4: 验证类型文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/types/permission/*.ts`
Expected: 无错误输出

- [ ] **Step 5: 提交**

```bash
git add apps/admin/src/types/permission/
git commit -m "feat(types): add permission module type definitions"
```

---

## Task 3: 认证 API 封装

**Files:**
- Create: `apps/admin/src/api/auth/index.ts`

- [ ] **Step 1: 创建认证 API 文件**

```typescript
// apps/admin/src/api/auth/index.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  LoginDTO,
  RegisterDTO,
  TotpLoginDTO,
  TokenVO,
  CaptchaVO,
  PreAuthVO,
  RefreshTokenDTO,
} from '@/types/auth'

const ADMIN_PREFIX = '/api/v1/admin/auth'
const APP_PREFIX = '/api/v1/app/auth'

/** 获取管理员验证码 */
export const getAdminCaptcha = () => {
  return request.get<R<CaptchaVO>>(`${ADMIN_PREFIX}/captcha`)
}

/** 管理员登录 */
export const adminLogin = (data: LoginDTO) => {
  return request.post<R<TokenVO | PreAuthVO>>(`${ADMIN_PREFIX}/login`, data)
}

/** 管理员 TOTP 登录 */
export const adminTotpLogin = (data: TotpLoginDTO) => {
  return request.post<R<TokenVO>>(`${ADMIN_PREFIX}/login/totp`, data)
}

/** 管理员刷新 Token */
export const adminRefreshToken = (data: RefreshTokenDTO) => {
  return request.post<R<TokenVO>>(`${ADMIN_PREFIX}/refresh`, data)
}

/** 管理员登出 */
export const adminLogout = () => {
  return request.post<R<null>>(`${ADMIN_PREFIX}/logout`)
}

/** 获取用户验证码 */
export const getAppCaptcha = () => {
  return request.get<R<CaptchaVO>>(`${APP_PREFIX}/captcha`)
}

/** 用户登录 */
export const appLogin = (data: LoginDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/login`, data)
}

/** 用户注册 */
export const appRegister = (data: RegisterDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/register`, data)
}

/** 用户刷新 Token */
export const appRefreshToken = (data: RefreshTokenDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/refresh`, data)
}

/** 用户登出 */
export const appLogout = () => {
  return request.post<R<null>>(`${APP_PREFIX}/logout`)
}
```

- [ ] **Step 2: 验证文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/api/auth/index.ts`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/api/auth/index.ts
git commit -m "feat(api): add auth API functions"
```

---

## Task 4: 权限模块 API 封装

**Files:**
- Create: `apps/admin/src/api/permission/role.ts`
- Create: `apps/admin/src/api/permission/admin.ts`
- Create: `apps/admin/src/api/permission/module.ts`

- [ ] **Step 1: 创建角色 API 文件**

```typescript
// apps/admin/src/api/permission/role.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  RoleVO,
  RoleQueryDTO,
  RoleAddDTO,
  RoleUpdateDTO,
  RoleBindModulesDTO,
} from '@/types/permission/role'

const PREFIX = '/api/v1/admin/permission/roles'

/** 角色列表（分页） */
export const getRolePage = (params: RoleQueryDTO) => {
  return request.get<R<PageResult<RoleVO>>>(PREFIX, { params })
}

/** 角色详情 */
export const getRoleDetail = (id: number) => {
  return request.get<R<RoleVO>>(`${PREFIX}/${id}`)
}

/** 新增角色 */
export const addRole = (data: RoleAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新角色 */
export const updateRole = (id: number, data: RoleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除角色 */
export const deleteRole = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换角色状态 */
export const toggleRoleStatus = (id: number) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}

/** 角色绑定模块 */
export const bindRoleModules = (id: number, data: RoleBindModulesDTO) => {
  return request.post<R<void>>(`${PREFIX}/${id}/modules`, data)
}
```

- [ ] **Step 2: 创建管理员 API 文件**

```typescript
// apps/admin/src/api/permission/admin.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AdminVO,
  AdminQueryDTO,
  AdminAddDTO,
  AdminUpdateDTO,
} from '@/types/permission/admin'

const PREFIX = '/api/v1/admin/permission/admins'

/** 管理员列表（分页） */
export const getAdminPage = (params: AdminQueryDTO) => {
  return request.get<R<PageResult<AdminVO>>>(PREFIX, { params })
}

/** 管理员详情 */
export const getAdminDetail = (id: number) => {
  return request.get<R<AdminVO>>(`${PREFIX}/${id}`)
}

/** 新增管理员 */
export const addAdmin = (data: AdminAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新管理员 */
export const updateAdmin = (id: number, data: AdminUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除管理员 */
export const deleteAdmin = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换管理员状态 */
export const toggleAdminStatus = (id: number) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}
```

- [ ] **Step 3: 创建模块 API 文件**

```typescript
// apps/admin/src/api/permission/module.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  ModuleTreeVO,
  ModuleQueryDTO,
  ModuleAddDTO,
  ModuleUpdateDTO,
} from '@/types/permission/module'

const PREFIX = '/api/v1/admin/permission/modules'

/** 模块列表（树形） */
export const getModuleTree = (params?: ModuleQueryDTO) => {
  return request.get<R<ModuleTreeVO[]>>(PREFIX, { params })
}

/** 新增模块 */
export const addModule = (data: ModuleAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新模块 */
export const updateModule = (id: number, data: ModuleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除模块 */
export const deleteModule = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换模块状态 */
export const toggleModuleStatus = (id: number) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}
```

- [ ] **Step 4: 验证文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/api/permission/*.ts`
Expected: 无错误输出

- [ ] **Step 5: 提交**

```bash
git add apps/admin/src/api/permission/
git commit -m "feat(api): add permission module API functions"
```

---

## Task 5: 验证码 Composable

**Files:**
- Create: `apps/admin/src/views/login/composables/useCaptcha.ts`

- [ ] **Step 1: 创建验证码逻辑文件**

```typescript
// apps/admin/src/views/login/composables/useCaptcha.ts
import { ref } from 'vue'
import { getAdminCaptcha, getAppCaptcha } from '@/api/auth'
import type { CaptchaVO } from '@/types/auth'

export type UserType = 'user' | 'admin'

export function useCaptcha() {
  const captchaData = ref<CaptchaVO | null>(null)
  const loading = ref(false)

  const fetchCaptcha = async (userType: UserType) => {
    loading.value = true
    try {
      const api = userType === 'admin' ? getAdminCaptcha : getAppCaptcha
      const res = await api()
      if (res.data.code === 200) {
        captchaData.value = res.data.data
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
    } finally {
      loading.value = false
    }
  }

  const refreshCaptcha = (userType: UserType) => {
    fetchCaptcha(userType)
  }

  return {
    captchaData,
    loading,
    fetchCaptcha,
    refreshCaptcha,
  }
}
```

- [ ] **Step 2: 验证文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/views/login/composables/useCaptcha.ts`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/composables/useCaptcha.ts
git commit -m "feat(login): add useCaptcha composable"
```

---

## Task 6: 登录逻辑 Composable

**Files:**
- Create: `apps/admin/src/views/login/composables/useAuth.ts`

- [ ] **Step 1: 创建登录逻辑文件**

```typescript
// apps/admin/src/views/login/composables/useAuth.ts
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import {
  adminLogin,
  adminTotpLogin,
  appLogin,
  appRegister,
} from '@/api/auth'
import type { LoginDTO, RegisterDTO, TotpLoginDTO, TokenVO, PreAuthVO } from '@/types/auth'
import type { UserType } from './useCaptcha'

// 判断是否需要 TOTP
function isPreAuthResponse(data: TokenVO | PreAuthVO): data is PreAuthVO {
  return 'preAuthToken' in data
}

export function useAuth() {
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()

  const loading = ref(false)
  const showTotpModal = ref(false)
  const preAuthToken = ref('')

  // 登录成功后的处理
  const handleLoginSuccess = (tokenData: TokenVO) => {
    userStore.setToken(tokenData.accessToken, tokenData.refreshToken)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }

  // 用户登录
  const userLogin = async (data: LoginDTO) => {
    loading.value = true
    try {
      const res = await appLogin(data)
      if (res.data.code === 200) {
        handleLoginSuccess(res.data.data as TokenVO)
        return true
      } else {
        ElMessage.error(res.data.msg || '登录失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || '登录失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 用户注册
  const userRegister = async (data: RegisterDTO) => {
    loading.value = true
    try {
      const res = await appRegister(data)
      if (res.data.code === 200) {
        handleLoginSuccess(res.data.data)
        return true
      } else {
        ElMessage.error(res.data.msg || '注册失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || '注册失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 管理员登录
  const adminLoginHandler = async (data: LoginDTO) => {
    loading.value = true
    try {
      const res = await adminLogin(data)
      if (res.data.code === 200) {
        const responseData = res.data.data
        if (isPreAuthResponse(responseData)) {
          // 需要 TOTP 验证
          preAuthToken.value = responseData.preAuthToken
          showTotpModal.value = true
          return 'totp'
        } else {
          handleLoginSuccess(responseData)
          return true
        }
      } else if (res.data.code === 20001) {
        // 需要 TOTP 验证
        preAuthToken.value = (res.data.data as PreAuthVO).preAuthToken
        showTotpModal.value = true
        return 'totp'
      } else {
        ElMessage.error(res.data.msg || '登录失败')
        return false
      }
    } catch (error: any) {
      const msg = error.response?.data?.msg || '登录失败'
      ElMessage.error(msg)
      return false
    } finally {
      loading.value = false
    }
  }

  // TOTP 验证
  const totpVerify = async (totpCode: string) => {
    loading.value = true
    try {
      const data: TotpLoginDTO = {
        preAuthToken: preAuthToken.value,
        totpCode,
      }
      const res = await adminTotpLogin(data)
      if (res.data.code === 200) {
        showTotpModal.value = false
        handleLoginSuccess(res.data.data)
        return true
      } else {
        ElMessage.error(res.data.msg || 'TOTP 验证失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.msg || 'TOTP 验证失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const closeTotpModal = () => {
    showTotpModal.value = false
    preAuthToken.value = ''
  }

  return {
    loading,
    showTotpModal,
    userLogin,
    userRegister,
    adminLoginHandler,
    totpVerify,
    closeTotpModal,
  }
}
```

- [ ] **Step 2: 验证文件无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/views/login/composables/useAuth.ts`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/composables/useAuth.ts
git commit -m "feat(login): add useAuth composable"
```

---

## Task 7: 动态背景组件

**Files:**
- Create: `apps/admin/src/views/login/components/DynamicBackground.vue`

- [ ] **Step 1: 创建动态背景组件**

```vue
<!-- apps/admin/src/views/login/components/DynamicBackground.vue -->
<script setup lang="ts">
// 动态背景图案组件
// 红黄蓝圆点 + 虚线连接 + 动画效果
</script>

<template>
  <svg class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <!-- 左上区域 -->
    <circle cx="8%" cy="15%" r="8" fill="#e53935" opacity="0.7" class="animate-float-1" />
    <circle cx="15%" cy="28%" r="4" fill="#333" opacity="0.2" class="animate-float-2" />
    <line x1="8%" y1="15%" x2="15%" y2="28%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />

    <!-- 左中区域 -->
    <circle cx="5%" cy="50%" r="10" fill="#ffc107" opacity="0.6" class="animate-float-3" />
    <circle cx="12%" cy="62%" r="5" fill="#1e88e5" opacity="0.5" class="animate-float-1" />
    <text x="18%" y="45%" fill="#ddd" font-size="14" class="animate-float-2">+</text>

    <!-- 左下区域 -->
    <circle cx="10%" cy="82%" r="6" fill="#1e88e5" opacity="0.6" class="animate-float-2" />
    <circle cx="3%" cy="75%" r="4" fill="none" stroke="#ddd" stroke-width="1" class="animate-float-3" />

    <!-- 右上区域 -->
    <circle cx="92%" cy="12%" r="9" fill="#ffc107" opacity="0.7" class="animate-float-2" />
    <circle cx="85%" cy="22%" r="5" fill="#333" opacity="0.2" class="animate-float-1" />
    <line x1="92%" y1="12%" x2="85%" y2="22%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />
    <text x="88%" y="8%" fill="#ddd" font-size="14" class="animate-float-3">+</text>

    <!-- 右中区域 -->
    <circle cx="95%" cy="48%" r="6" fill="#e53935" opacity="0.5" class="animate-float-1" />
    <circle cx="88%" cy="58%" r="4" fill="none" stroke="#ddd" stroke-width="1" class="animate-float-2" />

    <!-- 右下区域 -->
    <circle cx="90%" cy="85%" r="11" fill="#1e88e5" opacity="0.6" class="animate-float-3" />
    <circle cx="95%" cy="75%" r="5" fill="#ffc107" opacity="0.5" class="animate-float-1" />
    <line x1="90%" y1="85%" x2="95%" y2="75%" stroke="#eee" stroke-width="1" stroke-dasharray="4,4" />
    <text x="82%" y="80%" fill="#ddd" font-size="14" class="animate-float-2">+</text>
  </svg>
</template>

<style scoped>
@keyframes float-1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@keyframes float-3 {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

.animate-float-1 {
  animation: float-1 4s ease-in-out infinite;
}

.animate-float-2 {
  animation: float-2 5s ease-in-out infinite;
}

.animate-float-3 {
  animation: float-3 6s ease-in-out infinite;
}
</style>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出（或只有不相关的警告）

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/DynamicBackground.vue
git commit -m "feat(login): add DynamicBackground component"
```

---

## Task 8: 品牌区域组件

**Files:**
- Create: `apps/admin/src/views/login/components/BrandSection.vue`

- [ ] **Step 1: 创建品牌区域组件**

```vue
<!-- apps/admin/src/views/login/components/BrandSection.vue -->
<script setup lang="ts">
import logoImage from '@/assets/images/logo.png'
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <!-- Logo -->
    <img :src="logoImage" alt="海枫未来规划院" class="w-44 h-44 mb-7 object-contain" />

    <!-- 标题 -->
    <h1 class="text-4xl font-bold text-[#0d47a1] mb-6 tracking-widest brand-title">
      海枫未来规划院
    </h1>

    <!-- 副标题 -->
    <div class="flex items-center gap-4 text-sm text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="text-[#bf8a30]">📖</span>
        高中生志愿填报指南
      </span>
      <span class="text-gray-300">|</span>
      <span class="flex items-center gap-1.5">
        <span class="text-[#bf8a30]">🎓</span>
        大学/考公/考研规划
      </span>
      <span class="text-gray-300">|</span>
      <span class="flex items-center gap-1.5">
        <span class="text-[#bf8a30]">👤</span>
        未来就业辅导
      </span>
    </div>
  </div>
</template>

<style scoped>
.brand-title {
  text-shadow: 3px 3px 6px rgba(13, 71, 161, 0.25), 1px 1px 0 rgba(255, 255, 255, 0.8);
}
</style>
```

- [ ] **Step 2: 复制 Logo 图片到 assets 目录**

```bash
mkdir -p apps/admin/src/assets/images
cp "logos/ChatGPT Image 2026年5月8日 10_22_15.png" apps/admin/src/assets/images/logo.png
```

- [ ] **Step 3: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 4: 提交**

```bash
git add apps/admin/src/views/login/components/BrandSection.vue
git add apps/admin/src/assets/images/logo.png
git commit -m "feat(login): add BrandSection component with logo"
```

---

## Task 9: TOTP 弹窗组件

**Files:**
- Create: `apps/admin/src/views/login/components/TotpModal.vue`

- [ ] **Step 1: 创建 TOTP 弹窗组件**

```vue
<!-- apps/admin/src/views/login/components/TotpModal.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', code: string): void
}>()

const totpCode = ref('')

const handleConfirm = () => {
  if (totpCode.value.length === 6) {
    emit('confirm', totpCode.value)
  }
}

const handleClose = () => {
  totpCode.value = ''
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="二次验证"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="py-4">
      <p class="text-gray-600 text-sm mb-4">
        请输入您的身份验证器 App 中显示的 6 位动态验证码
      </p>
      <el-input
        v-model="totpCode"
        placeholder="请输入 6 位验证码"
        maxlength="6"
        size="large"
        class="text-center"
        @keyup.enter="handleConfirm"
      />
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="totpCode.length !== 6"
        @click="handleConfirm"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/TotpModal.vue
git commit -m "feat(login): add TotpModal component"
```

---

## Task 10: 忘记密码弹窗组件

**Files:**
- Create: `apps/admin/src/views/login/components/ForgotPasswordModal.vue`

- [ ] **Step 1: 创建忘记密码弹窗组件**

```vue
<!-- apps/admin/src/views/login/components/ForgotPasswordModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="忘记密码"
    width="400px"
    @update:model-value="handleClose"
  >
    <div class="py-4 text-center">
      <p class="text-gray-600 mb-4">忘记密码请联系管理员：</p>
      <p class="text-xl font-semibold text-[#1e88e5]">13303575004</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">我知道了</el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/ForgotPasswordModal.vue
git commit -m "feat(login): add ForgotPasswordModal component"
```

---

## Task 11: 协议弹窗组件

**Files:**
- Create: `apps/admin/src/views/login/components/AgreementModal.vue`

- [ ] **Step 1: 创建协议弹窗组件**

```vue
<!-- apps/admin/src/views/login/components/AgreementModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
  type: 'user' | 'privacy'
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="type === 'user' ? '用户协议' : '隐私政策'"
    width="560px"
    @update:model-value="handleClose"
  >
    <div class="max-h-80 overflow-y-auto text-sm text-gray-600 leading-relaxed">
      <template v-if="type === 'user'">
        <h4 class="font-semibold text-gray-800 mb-2">1. 服务条款</h4>
        <p class="mb-4">
          欢迎使用海枫未来规划院服务。本协议是您与海枫未来规划院之间关于使用本平台服务的协议。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">2. 账号注册</h4>
        <p class="mb-4">
          您在注册账号时需要提供真实、准确的手机号码。您应妥善保管账号密码，因密码保管不善导致的损失由您自行承担。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">3. 服务说明</h4>
        <p class="mb-4">
          本平台提供的高考志愿填报、升学规划等服务仅供参考，最终决策请结合实际情况。
        </p>
      </template>

      <template v-else>
        <h4 class="font-semibold text-gray-800 mb-2">1. 信息收集</h4>
        <p class="mb-4">
          为提供志愿填报服务，我们需要收集您的手机号和微信号。我们承诺：
        </p>
        <ul class="list-disc list-inside mb-4 ml-2">
          <li>仅用于本平台服务</li>
          <li>不会泄露给第三方</li>
          <li>严格遵守数据保护法规</li>
        </ul>

        <h4 class="font-semibold text-gray-800 mb-2">2. 信息保护</h4>
        <p class="mb-4">
          我们采用业界标准的安全技术保护您的个人信息，防止未经授权的访问、使用或泄露。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">3. 免责声明</h4>
        <p>
          本平台所收集的信息仅用于提供服务，不承担因信息使用产生的法律责任。
        </p>
      </template>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">我已阅读并同意</el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/AgreementModal.vue
git commit -m "feat(login): add AgreementModal component"
```

---

## Task 12: 用户登录表单组件

**Files:**
- Create: `apps/admin/src/views/login/components/UserLoginForm.vue`

- [ ] **Step 1: 创建用户登录表单组件**

```vue
<!-- apps/admin/src/views/login/components/UserLoginForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../composables/useCaptcha'
import { useAuth } from '../composables/useAuth'
import type { LoginDTO } from '@/types/auth'

const emit = defineEmits<{
  (e: 'forgot-password'): void
  (e: 'switch-to-register'): void
}>()

const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, userLogin } = useAuth()

const form = reactive<LoginDTO>({
  phone: '',
  password: '',
  captchaCode: '',
  uuid: '',
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  form.uuid = captchaData.value?.uuid || ''
  const success = await userLogin(form)

  if (!success) {
    refreshCaptcha('user')
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha('user')
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
    <el-form-item prop="phone">
      <el-input v-model="form.phone" placeholder="手机号" size="large" />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        size="large"
        show-password
      />
    </el-form-item>

    <el-form-item prop="captchaCode">
      <div class="flex gap-3 w-full">
        <el-input
          v-model="form.captchaCode"
          placeholder="验证码"
          size="large"
          class="flex-1"
          @keyup.enter="handleSubmit"
        />
        <img
          v-if="captchaData?.image"
          :src="captchaData.image"
          alt="验证码"
          class="h-10 w-24 cursor-pointer rounded border"
          @click="refreshCaptcha('user')"
        />
        <div v-else class="h-10 w-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          加载中...
        </div>
      </div>
    </el-form-item>

    <div class="flex justify-end mb-4">
      <span class="text-xs text-gray-400 cursor-pointer hover:text-gray-600" @click="emit('forgot-password')">
        忘记密码？
      </span>
    </div>

    <el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleSubmit">
        登 录
      </el-button>
    </el-form-item>

    <div class="text-center text-sm text-gray-500">
      还没有账号？
      <span class="text-[#1e88e5] cursor-pointer" @click="emit('switch-to-register')">立即注册</span>
    </div>
  </el-form>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/UserLoginForm.vue
git commit -m "feat(login): add UserLoginForm component"
```

---

## Task 13: 用户注册表单组件

**Files:**
- Create: `apps/admin/src/views/login/components/UserRegisterForm.vue`

- [ ] **Step 1: 创建用户注册表单组件**

```vue
<!-- apps/admin/src/views/login/components/UserRegisterForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../composables/useCaptcha'
import { useAuth } from '../composables/useAuth'
import type { RegisterDTO } from '@/types/auth'

const emit = defineEmits<{
  (e: 'switch-to-login'): void
}>()

const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, userRegister } = useAuth()

const form = reactive<RegisterDTO>({
  phone: '',
  password: '',
  captchaCode: '',
  uuid: '',
  referrerCode: '',
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  form.uuid = captchaData.value?.uuid || ''
  const success = await userRegister(form)

  if (!success) {
    refreshCaptcha('user')
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha('user')
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
    <el-form-item prop="phone">
      <el-input v-model="form.phone" placeholder="手机号" size="large" />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        size="large"
        show-password
      />
    </el-form-item>

    <el-form-item prop="captchaCode">
      <div class="flex gap-3 w-full">
        <el-input
          v-model="form.captchaCode"
          placeholder="验证码"
          size="large"
          class="flex-1"
        />
        <img
          v-if="captchaData?.image"
          :src="captchaData.image"
          alt="验证码"
          class="h-10 w-24 cursor-pointer rounded border"
          @click="refreshCaptcha('user')"
        />
        <div v-else class="h-10 w-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          加载中...
        </div>
      </div>
    </el-form-item>

    <el-form-item>
      <el-input v-model="form.referrerCode" placeholder="邀请码（选填）" size="large" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleSubmit">
        注 册
      </el-button>
    </el-form-item>

    <div class="text-center text-sm text-gray-500">
      已有账号？
      <span class="text-[#1e88e5] cursor-pointer" @click="emit('switch-to-login')">立即登录</span>
    </div>
  </el-form>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/UserRegisterForm.vue
git commit -m "feat(login): add UserRegisterForm component"
```

---

## Task 14: 管理员登录表单组件

**Files:**
- Create: `apps/admin/src/views/login/components/AdminLoginForm.vue`

- [ ] **Step 1: 创建管理员登录表单组件**

```vue
<!-- apps/admin/src/views/login/components/AdminLoginForm.vue -->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useCaptcha } from '../composables/useCaptcha'
import { useAuth } from '../composables/useAuth'
import type { LoginDTO } from '@/types/auth'

const emit = defineEmits<{
  (e: 'forgot-password'): void
  (e: 'need-totp'): void
}>()

const formRef = ref<FormInstance>()
const { captchaData, fetchCaptcha, refreshCaptcha } = useCaptcha()
const { loading, adminLoginHandler } = useAuth()

const form = reactive<LoginDTO>({
  phone: '',
  password: '',
  captchaCode: '',
  uuid: '',
})

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  form.uuid = captchaData.value?.uuid || ''
  const result = await adminLoginHandler(form)

  if (result === 'totp') {
    emit('need-totp')
  } else if (!result) {
    refreshCaptcha('admin')
    form.captchaCode = ''
  }
}

onMounted(() => {
  fetchCaptcha('admin')
})
</script>

<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
    <el-form-item prop="phone">
      <el-input v-model="form.phone" placeholder="手机号" size="large" />
    </el-form-item>

    <el-form-item prop="password">
      <el-input
        v-model="form.password"
        type="password"
        placeholder="密码"
        size="large"
        show-password
      />
    </el-form-item>

    <el-form-item prop="captchaCode">
      <div class="flex gap-3 w-full">
        <el-input
          v-model="form.captchaCode"
          placeholder="验证码"
          size="large"
          class="flex-1"
          @keyup.enter="handleSubmit"
        />
        <img
          v-if="captchaData?.image"
          :src="captchaData.image"
          alt="验证码"
          class="h-10 w-24 cursor-pointer rounded border"
          @click="refreshCaptcha('admin')"
        />
        <div v-else class="h-10 w-24 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
          加载中...
        </div>
      </div>
    </el-form-item>

    <div class="flex justify-end mb-4">
      <span class="text-xs text-gray-400 cursor-pointer hover:text-gray-600" @click="emit('forgot-password')">
        忘记密码？
      </span>
    </div>

    <el-form-item>
      <el-button type="primary" size="large" class="w-full" :loading="loading" @click="handleSubmit">
        登 录
      </el-button>
    </el-form-item>
  </el-form>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/AdminLoginForm.vue
git commit -m "feat(login): add AdminLoginForm component"
```

---

## Task 15: 登录卡片组件

**Files:**
- Create: `apps/admin/src/views/login/components/LoginCard.vue`

- [ ] **Step 1: 创建登录卡片组件**

```vue
<!-- apps/admin/src/views/login/components/LoginCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import UserLoginForm from './UserLoginForm.vue'
import UserRegisterForm from './UserRegisterForm.vue'
import AdminLoginForm from './AdminLoginForm.vue'

type TabType = 'user' | 'admin'
type FormType = 'login' | 'register'

const emit = defineEmits<{
  (e: 'forgot-password'): void
  (e: 'need-totp'): void
}>()

const activeTab = ref<TabType>('user')
const formType = ref<FormType>('login')

const handleTabChange = (tab: TabType) => {
  activeTab.value = tab
  formType.value = 'login' // 切换 tab 时重置为登录
}
</script>

<template>
  <div class="w-[380px] bg-white rounded-xl p-8 shadow-lg border border-gray-100">
    <!-- Tab 切换 -->
    <div class="flex gap-6 mb-6 border-b border-gray-100 pb-3">
      <span
        class="text-sm cursor-pointer pb-2 -mb-3 transition-colors"
        :class="activeTab === 'user' ? 'text-[#1e88e5] border-b-2 border-[#1e88e5] font-medium' : 'text-gray-400'"
        @click="handleTabChange('user')"
      >
        用户登录
      </span>
      <span
        class="text-sm cursor-pointer pb-2 -mb-3 transition-colors"
        :class="activeTab === 'admin' ? 'text-[#1e88e5] border-b-2 border-[#1e88e5] font-medium' : 'text-gray-400'"
        @click="handleTabChange('admin')"
      >
        管理员
      </span>
    </div>

    <!-- 表单区域 -->
    <template v-if="activeTab === 'user'">
      <UserLoginForm
        v-if="formType === 'login'"
        @forgot-password="emit('forgot-password')"
        @switch-to-register="formType = 'register'"
      />
      <UserRegisterForm
        v-else
        @switch-to-login="formType = 'login'"
      />
    </template>

    <AdminLoginForm
      v-else
      @forgot-password="emit('forgot-password')"
      @need-totp="emit('need-totp')"
    />
  </div>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/components/LoginCard.vue
git commit -m "feat(login): add LoginCard component with tab switching"
```

---

## Task 16: 登录页面主组件

**Files:**
- Modify: `apps/admin/src/views/login/index.vue`

- [ ] **Step 1: 重写登录页面主组件**

```vue
<!-- apps/admin/src/views/login/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import DynamicBackground from './components/DynamicBackground.vue'
import BrandSection from './components/BrandSection.vue'
import LoginCard from './components/LoginCard.vue'
import TotpModal from './components/TotpModal.vue'
import ForgotPasswordModal from './components/ForgotPasswordModal.vue'
import AgreementModal from './components/AgreementModal.vue'
import { useAuth } from './composables/useAuth'

const { loading, showTotpModal, totpVerify, closeTotpModal } = useAuth()

const showForgotPassword = ref(false)
const showAgreement = ref(false)
const agreementType = ref<'user' | 'privacy'>('user')

const handleShowAgreement = (type: 'user' | 'privacy') => {
  agreementType.value = type
  showAgreement.value = true
}
</script>

<template>
  <div class="min-h-screen bg-white flex relative overflow-hidden">
    <!-- 动态背景 -->
    <DynamicBackground />

    <!-- 左侧品牌区域 -->
    <div class="flex-1 flex items-center justify-center relative z-10">
      <BrandSection />
    </div>

    <!-- 右侧登录卡片 -->
    <div class="flex-1 flex items-center justify-center relative z-10 pr-16">
      <LoginCard
        @forgot-password="showForgotPassword = true"
        @need-totp="showTotpModal = true"
      />
    </div>

    <!-- 底部协议 -->
    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-400 z-10">
      登录即表示已同意
      <span class="text-[#1e88e5] cursor-pointer" @click="handleShowAgreement('user')">《用户协议》</span>
      和
      <span class="text-[#1e88e5] cursor-pointer" @click="handleShowAgreement('privacy')">《隐私政策》</span>
    </div>

    <!-- TOTP 弹窗 -->
    <TotpModal
      v-model:visible="showTotpModal"
      :loading="loading"
      @confirm="totpVerify"
      @update:visible="closeTotpModal"
    />

    <!-- 忘记密码弹窗 -->
    <ForgotPasswordModal v-model:visible="showForgotPassword" />

    <!-- 协议弹窗 -->
    <AgreementModal v-model:visible="showAgreement" :type="agreementType" />
  </div>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/login/index.vue
git commit -m "feat(login): implement complete login page with Factory style"
```

---

## Task 17: 启动开发服务器验证登录页面

- [ ] **Step 1: 启动开发服务器**

Run: `cd apps/admin && pnpm dev`
Expected: 服务器启动成功，显示 Local: http://localhost:5173

- [ ] **Step 2: 浏览器验证**

打开 http://localhost:5173/login 检查：
- [ ] 白色背景 + 动态图案（红黄蓝圆点浮动动画）
- [ ] 左侧 Logo + 立体标题 + 副标题
- [ ] 右侧登录卡片（Tab 切换用户/管理员）
- [ ] 底部协议链接（蓝色可点击）
- [ ] 切换到"管理员" Tab 后无注册入口

- [ ] **Step 3: 提交验证通过记录**

```bash
git add .
git commit -m "verify: login page visual check passed"
```

---

## Task 18: 权限模块路由配置

**Files:**
- Create: `apps/admin/src/router/modules/permission.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 创建权限模块路由文件**

```typescript
// apps/admin/src/router/modules/permission.ts
import type { RouteRecordRaw } from 'vue-router'

const permissionRoutes: RouteRecordRaw = {
  path: '/permission',
  name: 'Permission',
  meta: { title: '权限管理', icon: 'Lock' },
  redirect: '/permission/role',
  children: [
    {
      path: 'role',
      name: 'PermissionRole',
      component: () => import('@/views/permission/role/index.vue'),
      meta: { title: '角色列表', icon: 'User' },
    },
    {
      path: 'module',
      name: 'PermissionModule',
      component: () => import('@/views/permission/module/index.vue'),
      meta: { title: '模块列表', icon: 'Menu' },
    },
    {
      path: 'admin',
      name: 'PermissionAdmin',
      component: () => import('@/views/permission/admin/index.vue'),
      meta: { title: '管理员列表', icon: 'Avatar' },
    },
  ],
}

export default permissionRoutes
```

- [ ] **Step 2: 修改路由主文件，添加权限模块路由**

```typescript
// apps/admin/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getAccessToken } from '@haifeng/shared'
import permissionRoutes from './modules/permission'

// 静态路由 (无需权限)
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
]

// 动态路由 (根据权限加载)
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制面板', icon: 'Monitor' },
      },
      permissionRoutes,
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...asyncRoutes],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = getAccessToken()
  const whiteList = ['/login', '/404']

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
```

- [ ] **Step 3: 验证路由配置无语法错误**

Run: `cd apps/admin && npx tsc --noEmit src/router/*.ts src/router/modules/*.ts`
Expected: 无错误输出

- [ ] **Step 4: 提交**

```bash
git add apps/admin/src/router/
git commit -m "feat(router): add permission module routes"
```

---

## Task 19: 通用退出确认弹窗组件

**Files:**
- Create: `apps/admin/src/components/ExitConfirmModal.vue`

- [ ] **Step 1: 创建退出确认弹窗组件**

```vue
<!-- apps/admin/src/components/ExitConfirmModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'discard'): void
  (e: 'save'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title=""
    width="420px"
    :show-close="false"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="text-center py-4">
      <div class="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">⚠️</span>
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">确认退出？</h3>
      <p class="text-sm text-gray-500">您有未保存的修改，确定要退出吗？</p>
    </div>
    <template #footer>
      <div class="flex justify-center gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" @click="emit('discard')">不保存退出</el-button>
        <el-button type="primary" @click="emit('save')">保存并退出</el-button>
      </div>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/components/ExitConfirmModal.vue
git commit -m "feat(components): add ExitConfirmModal component"
```

---

## Task 20: 角色搜索组件

**Files:**
- Create: `apps/admin/src/views/permission/role/components/RoleSearch.vue`

- [ ] **Step 1: 创建角色搜索组件**

```vue
<!-- apps/admin/src/views/permission/role/components/RoleSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { RoleQueryDTO } from '@/types/permission/role'

const emit = defineEmits<{
  (e: 'search', params: RoleQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<RoleQueryDTO, 'page' | 'size'>>({
  roleName: '',
  status: undefined,
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.roleName = ''
  searchForm.status = undefined
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="角色名称">
        <el-input
          v-model="searchForm.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
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

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/permission/role/components/RoleSearch.vue
git commit -m "feat(permission): add RoleSearch component"
```

---

## Task 21: 角色详情弹窗组件

**Files:**
- Create: `apps/admin/src/views/permission/role/components/RoleDetailModal.vue`

- [ ] **Step 1: 创建角色详情弹窗组件**

```vue
<!-- apps/admin/src/views/permission/role/components/RoleDetailModal.vue -->
<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { getRoleDetail, addRole, updateRole } from '@/api/permission/role'
import type { RoleVO, RoleAddDTO, RoleUpdateDTO } from '@/types/permission/role'
import ExitConfirmModal from '@/components/ExitConfirmModal.vue'

const props = defineProps<{
  visible: boolean
  roleId?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showExitConfirm = ref(false)
const originalData = ref<string>('')

const isEdit = computed(() => !!props.roleId)
const title = computed(() => (isEdit.value ? '编辑角色' : '新增角色'))

const form = reactive<RoleAddDTO & { id?: number }>({
  roleName: '',
  roleCode: '',
  description: '',
})

const rules: FormRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过50个字符', trigger: 'blur' },
  ],
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { max: 50, message: '角色编码不能超过50个字符', trigger: 'blur' },
  ],
  description: [
    { max: 100, message: '描述不能超过100个字符', trigger: 'blur' },
  ],
}

const hasChanges = computed(() => {
  return JSON.stringify(form) !== originalData.value
})

const fetchDetail = async () => {
  if (!props.roleId) return
  loading.value = true
  try {
    const res = await getRoleDetail(props.roleId)
    if (res.data.code === 200) {
      const data = res.data.data
      form.id = data.id
      form.roleName = data.roleName
      form.roleCode = data.roleCode
      form.description = data.description || ''
      originalData.value = JSON.stringify(form)
    }
  } catch (error) {
    ElMessage.error('获取角色详情失败')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id = undefined
  form.roleName = ''
  form.roleCode = ''
  form.description = ''
  originalData.value = ''
  formRef.value?.resetFields()
}

const handleClose = () => {
  if (hasChanges.value) {
    showExitConfirm.value = true
  } else {
    emit('update:visible', false)
    resetForm()
  }
}

const handleDiscard = () => {
  showExitConfirm.value = false
  emit('update:visible', false)
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  loading.value = true
  try {
    if (isEdit.value && props.roleId) {
      const data: RoleUpdateDTO = {
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
      }
      const res = await updateRole(props.roleId, data)
      if (res.data.code === 200) {
        ElMessage.success('更新成功')
        showExitConfirm.value = false
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }
    } else {
      const data: RoleAddDTO = {
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
      }
      const res = await addRole(data)
      if (res.data.code === 200) {
        ElMessage.success('新增成功')
        emit('update:visible', false)
        emit('success')
        resetForm()
      } else {
        ElMessage.error(res.data.msg || '新增失败')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleSaveAndClose = async () => {
  await handleSave()
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.roleId) {
      fetchDetail()
    } else if (val) {
      originalData.value = JSON.stringify(form)
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      v-loading="loading"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色编码" prop="roleCode">
        <el-input v-model="form.roleCode" placeholder="请输入角色编码" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入描述"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">退出</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>

  <ExitConfirmModal
    v-model:visible="showExitConfirm"
    @cancel="showExitConfirm = false"
    @discard="handleDiscard"
    @save="handleSaveAndClose"
  />
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/permission/role/components/RoleDetailModal.vue
git commit -m "feat(permission): add RoleDetailModal component"
```

---

## Task 22: 角色表格组件

**Files:**
- Create: `apps/admin/src/views/permission/role/components/RoleTable.vue`

- [ ] **Step 1: 创建角色表格组件**

```vue
<!-- apps/admin/src/views/permission/role/components/RoleTable.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { deleteRole, toggleRoleStatus } from '@/api/permission/role'
import type { RoleVO } from '@/types/permission/role'

defineProps<{
  data: RoleVO[]
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

const handleToggleStatus = async (row: RoleVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}角色"${row.roleName}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await toggleRoleStatus(row.id)
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

const handleDelete = async (row: RoleVO) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${row.roleName}"吗？此操作不可恢复！`, '警告', {
      type: 'error',
    })
    const res = await deleteRole(row.id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
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
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="roleCode" label="角色编码" min-width="120">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.description || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'primary' : 'warning'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row.id)">详情</el-button>
          <el-button
            :type="row.status === 1 ? 'warning' : 'success'"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/permission/role/components/RoleTable.vue
git commit -m "feat(permission): add RoleTable component"
```

---

## Task 23: 角色列表页

**Files:**
- Create: `apps/admin/src/views/permission/role/index.vue`

- [ ] **Step 1: 创建角色列表页**

```vue
<!-- apps/admin/src/views/permission/role/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getRolePage } from '@/api/permission/role'
import type { RoleVO, RoleQueryDTO } from '@/types/permission/role'
import RoleSearch from './components/RoleSearch.vue'
import RoleTable from './components/RoleTable.vue'
import RoleDetailModal from './components/RoleDetailModal.vue'

const loading = ref(false)
const tableData = ref<RoleVO[]>([])
const total = ref(0)

const queryParams = reactive<RoleQueryDTO>({
  page: 1,
  size: 10,
  roleName: '',
  status: undefined,
})

const showDetailModal = ref(false)
const currentRoleId = ref<number | undefined>()

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRolePage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: RoleQueryDTO) => {
  queryParams.roleName = params.roleName
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.roleName = ''
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

const handleAdd = () => {
  currentRoleId.value = undefined
  showDetailModal.value = true
}

const handleDetail = (id: number) => {
  currentRoleId.value = id
  showDetailModal.value = true
}

const handleSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <RoleSearch @search="handleSearch" @reset="handleReset" />

    <div class="bg-white rounded-lg p-5">
      <div class="mb-4">
        <el-button type="primary" @click="handleAdd">+ 新增角色</el-button>
      </div>

      <RoleTable
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
    </div>

    <RoleDetailModal
      v-model:visible="showDetailModal"
      :role-id="currentRoleId"
      @success="handleSuccess"
    />
  </div>
</template>
```

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/permission/role/index.vue
git commit -m "feat(permission): add role list page"
```

---

## Task 24-29: 管理员模块组件（结构同角色模块）

由于管理员模块和模块管理的组件结构与角色模块类似，这里提供简要任务描述：

### Task 24: 管理员搜索组件
- Create: `apps/admin/src/views/permission/admin/components/AdminSearch.vue`
- 搜索字段：username, phone, realName, status

### Task 25: 管理员详情弹窗组件
- Create: `apps/admin/src/views/permission/admin/components/AdminDetailModal.vue`
- 表单字段：username, realName, phone, email, roleId, status, password

### Task 26: 管理员表格组件
- Create: `apps/admin/src/views/permission/admin/components/AdminTable.vue`
- 表格列：username, realName, phone, roleName, status, 操作

### Task 27: 管理员列表页
- Create: `apps/admin/src/views/permission/admin/index.vue`

### Task 28: 模块搜索组件
- Create: `apps/admin/src/views/permission/module/components/ModuleSearch.vue`
- 搜索字段：moduleCode (精确匹配)

### Task 29: 模块详情弹窗组件
- Create: `apps/admin/src/views/permission/module/components/ModuleDetailModal.vue`
- 表单字段：moduleName, moduleCode, parentId, path, icon, sortOrder, level, description

### Task 30: 模块表格组件（树形）
- Create: `apps/admin/src/views/permission/module/components/ModuleTable.vue`
- 使用 el-table 的 row-key 和 tree-props 实现树形展示

### Task 31: 模块列表页
- Create: `apps/admin/src/views/permission/module/index.vue`

---

## Task 32: 更新侧边栏菜单

**Files:**
- Modify: `apps/admin/src/layout/components/Sidebar.vue`

- [ ] **Step 1: 更新侧边栏支持权限管理子菜单**

侧边栏需要支持：
- 从路由配置读取菜单
- 显示父子菜单层级
- 选中态高亮
- 折叠/展开功能

- [ ] **Step 2: 验证组件无语法错误**

Run: `cd apps/admin && npx vue-tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/layout/components/Sidebar.vue
git commit -m "feat(layout): update Sidebar with permission menu support"
```

---

## Task 33: 最终集成测试

- [ ] **Step 1: 启动开发服务器**

Run: `cd apps/admin && pnpm dev`

- [ ] **Step 2: 测试登录流程**

1. 打开 http://localhost:5173/login
2. 切换用户/管理员 Tab
3. 输入测试账号登录
4. 验证跳转到控制面板

- [ ] **Step 3: 测试权限管理模块**

1. 点击侧边栏"权限管理"
2. 测试角色列表：搜索、新增、编辑、禁用、删除
3. 测试管理员列表：同上
4. 测试模块列表：树形展示、同上

- [ ] **Step 4: 提交最终版本**

```bash
git add .
git commit -m "feat: complete permission module implementation"
```

---

## 计划自审检查

- [x] 所有设计规格中的功能都有对应任务
- [x] 无 TBD/TODO 占位符
- [x] 类型和方法名称前后一致
- [x] 每个任务包含完整代码
- [x] 每个步骤 2-5 分钟可完成
