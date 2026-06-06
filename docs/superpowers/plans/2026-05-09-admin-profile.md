# 管理员个人中心与导航栏实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为管理后台添加右上角用户信息展示和个人中心页面，支持修改个人信息和管理 TOTP 双因素认证

**Architecture:**
- 新建 Profile 模块 (types + api + views)
- 修改 Navbar 组件添加用户卡片和后台管理按钮
- 扩展 User Store 支持获取和缓存个人信息

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia + Tailwind CSS

---

## 文件结构

### 新建文件

| 文件路径 | 职责 |
|----------|------|
| `apps/admin/src/types/profile/index.ts` | Profile 相关类型定义 |
| `apps/admin/src/api/profile/index.ts` | Profile API 接口封装 |
| `apps/admin/src/views/profile/index.vue` | 个人中心主页面 |
| `apps/admin/src/views/profile/components/AvatarCard.vue` | 左侧头像卡片组件 |
| `apps/admin/src/views/profile/components/ProfileForm.vue` | 右侧信息表单组件 |
| `apps/admin/src/views/profile/components/TotpModal.vue` | TOTP 弹窗组件 |
| `apps/admin/src/views/profile/components/PasswordModal.vue` | 修改密码弹窗组件 |

### 修改文件

| 文件路径 | 修改内容 |
|----------|----------|
| `apps/admin/src/store/modules/user.ts` | 扩展 UserInfo 类型，添加 profile 相关方法 |
| `apps/admin/src/layout/components/Navbar.vue` | 重构右侧区域，添加用户卡片和按钮 |
| `apps/admin/src/router/index.ts` | 添加 /profile 路由 |

---

## Task 1: 创建 Profile 类型定义

**Files:**
- Create: `apps/admin/src/types/profile/index.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// apps/admin/src/types/profile/index.ts

/** 管理员个人信息 VO */
export interface ProfileVO {
  id: number
  username: string
  realName: string | null
  phone: string
  email: string | null
  avatar: string | null
  roleName: string
  isTotpEnabled: boolean
  lastLoginAt: string
  createdAt: string
}

/** 修改个人信息 DTO */
export interface ProfileUpdateDTO {
  username?: string
  phone?: string
  email?: string
  avatar?: string
}

/** 修改密码 DTO */
export interface PasswordUpdateDTO {
  oldPassword: string
  newPassword: string
}

/** TOTP 开启响应 VO */
export interface TotpEnableVO {
  secret: string
  qrCodeImage: string
}

/** TOTP 验证 DTO */
export interface TotpVerifyDTO {
  code: string
}

/** TOTP 关闭 DTO */
export interface TotpDisableDTO {
  password: string
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/types/profile/index.ts
git commit -m "feat(admin): add profile type definitions"
```

---

## Task 2: 创建 Profile API 模块

**Files:**
- Create: `apps/admin/src/api/profile/index.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
// apps/admin/src/api/profile/index.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  ProfileVO,
  ProfileUpdateDTO,
  PasswordUpdateDTO,
  TotpEnableVO,
  TotpVerifyDTO,
  TotpDisableDTO,
} from '@/types/profile'

const PREFIX = '/api/v1/admin/profile'

/** 获取当前管理员信息 */
export const getProfile = () => {
  return request.get<R<ProfileVO>>(PREFIX)
}

/** 修改个人信息 */
export const updateProfile = (data: ProfileUpdateDTO) => {
  return request.put<R<null>>(PREFIX, data)
}

/** 修改密码 */
export const updatePassword = (data: PasswordUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/password`, data)
}

/** 开启 TOTP (生成密钥和二维码) */
export const enableTotp = () => {
  return request.post<R<TotpEnableVO>>(`${PREFIX}/totp/enable`)
}

/** 验证并确认绑定 TOTP */
export const verifyTotp = (data: TotpVerifyDTO) => {
  return request.post<R<null>>(`${PREFIX}/totp/verify`, data)
}

/** 关闭 TOTP */
export const disableTotp = (data: TotpDisableDTO) => {
  return request.post<R<null>>(`${PREFIX}/totp/disable`, data)
}

/** 获取当前 TOTP 二维码 */
export const getTotpQrcode = () => {
  return request.get<R<TotpEnableVO>>(`${PREFIX}/totp/qrcode`)
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/api/profile/index.ts
git commit -m "feat(admin): add profile API module"
```

---

## Task 3: 扩展 User Store

**Files:**
- Modify: `apps/admin/src/store/modules/user.ts`

- [ ] **Step 1: 更新 User Store**

```typescript
// apps/admin/src/store/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setTokens, clearTokens } from '@haifeng/shared'
import { getProfile } from '@/api/profile'
import type { ProfileVO } from '@/types/profile'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const profile = ref<ProfileVO | null>(null)

  // 设置 Token
  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  // 获取个人信息
  async function fetchProfile() {
    try {
      const { data } = await getProfile()
      if (data.code === 200) {
        profile.value = data.data
      }
    } catch (error) {
      console.error('获取个人信息失败:', error)
    }
  }

  // 更新本地 profile 缓存
  function updateLocalProfile(updates: Partial<ProfileVO>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  // 登出
  function logout() {
    token.value = null
    profile.value = null
    clearTokens()
  }

  // 检查是否已登录
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // 获取用户名首字 (用于默认头像)
  function getAvatarText(): string {
    if (profile.value?.username) {
      return profile.value.username.charAt(0).toUpperCase()
    }
    return 'A'
  }

  return {
    token,
    profile,
    setToken,
    fetchProfile,
    updateLocalProfile,
    logout,
    isLoggedIn,
    getAvatarText,
  }
})
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/store/modules/user.ts
git commit -m "feat(admin): extend user store with profile support"
```

---

## Task 4: 添加 Profile 路由

**Files:**
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 添加 /profile 路由**

在 `asyncRoutes` 的 Layout children 中添加 profile 路由：

```typescript
// 在 children 数组中添加，permissionRoutes 之后
{
  path: 'profile',
  name: 'Profile',
  component: () => import('@/views/profile/index.vue'),
  meta: { title: '个人中心', hidden: true },
},
```

完整的 asyncRoutes 应为：

```typescript
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
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true },
      },
    ],
  },
]
```

- [ ] **Step 2: 验证路由编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/router/index.ts
git commit -m "feat(admin): add profile route"
```

---

## Task 5: 创建 TOTP 弹窗组件

**Files:**
- Create: `apps/admin/src/views/profile/components/TotpModal.vue`

- [ ] **Step 1: 创建组件目录**

Run: `mkdir -p apps/admin/src/views/profile/components`

- [ ] **Step 2: 创建 TotpModal 组件**

```vue
<!-- apps/admin/src/views/profile/components/TotpModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { enableTotp, verifyTotp, getTotpQrcode, disableTotp } from '@/api/profile'
import type { TotpEnableVO } from '@/types/profile'

const props = defineProps<{
  visible: boolean
  mode: 'enable' | 'view' | 'disable'
  isTotpEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const totpData = ref<TotpEnableVO | null>(null)
const verifyCode = ref('')
const disablePassword = ref('')

const dialogTitle = computed(() => {
  if (props.mode === 'disable') return '关闭 TOTP 验证'
  if (props.mode === 'view') return '查看 TOTP 二维码'
  return '开启 TOTP 验证'
})

// 打开弹窗时加载数据
async function handleOpen() {
  loading.value = true
  try {
    if (props.mode === 'enable') {
      const { data } = await enableTotp()
      if (data.code === 200) {
        totpData.value = data.data
      }
    } else if (props.mode === 'view') {
      const { data } = await getTotpQrcode()
      if (data.code === 200) {
        totpData.value = data.data
      }
    }
  } catch (error) {
    ElMessage.error('获取二维码失败')
  } finally {
    loading.value = false
  }
}

// 验证 TOTP
async function handleVerify() {
  if (!verifyCode.value || verifyCode.value.length !== 6) {
    ElMessage.warning('请输入 6 位验证码')
    return
  }
  loading.value = true
  try {
    const { data } = await verifyTotp({ code: verifyCode.value })
    if (data.code === 200) {
      ElMessage.success('TOTP 验证成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.msg || '验证失败')
    }
  } catch (error) {
    ElMessage.error('验证失败')
  } finally {
    loading.value = false
  }
}

// 关闭 TOTP
async function handleDisable() {
  if (!disablePassword.value) {
    ElMessage.warning('请输入密码')
    return
  }
  loading.value = true
  try {
    const { data } = await disableTotp({ password: disablePassword.value })
    if (data.code === 200) {
      ElMessage.success('TOTP 已关闭')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.msg || '关闭失败')
    }
  } catch (error) {
    ElMessage.error('关闭失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  verifyCode.value = ''
  disablePassword.value = ''
  totpData.value = null
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
    @open="handleOpen"
  >
    <div v-loading="loading" class="text-center">
      <!-- 开启/查看模式：显示二维码 -->
      <template v-if="mode !== 'disable'">
        <p class="mb-4 text-sm text-gray-500">
          使用 Google Authenticator 扫描下方二维码
        </p>

        <div class="mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <img
            v-if="totpData?.qrCodeImage"
            :src="totpData.qrCodeImage"
            alt="TOTP 二维码"
            class="h-full w-full rounded-lg"
          />
          <span v-else class="text-sm text-gray-400">加载中...</span>
        </div>

        <div v-if="totpData?.secret" class="mb-4 rounded-lg bg-gray-100 p-3">
          <p class="mb-1 text-xs text-gray-500">手动输入密钥</p>
          <p class="font-mono text-sm font-medium text-gray-800">{{ totpData.secret }}</p>
        </div>

        <!-- 开启模式需要验证 -->
        <template v-if="mode === 'enable'">
          <el-input
            v-model="verifyCode"
            placeholder="输入 6 位验证码"
            maxlength="6"
            class="mb-4"
            @keyup.enter="handleVerify"
          />
        </template>
      </template>

      <!-- 关闭模式：输入密码 -->
      <template v-else>
        <p class="mb-4 text-sm text-gray-500">
          关闭 TOTP 验证需要输入当前密码确认
        </p>
        <el-input
          v-model="disablePassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
          @keyup.enter="handleDisable"
        />
      </template>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        v-if="mode === 'enable'"
        type="primary"
        :loading="loading"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="handleVerify"
      >
        已扫描，验证
      </el-button>
      <el-button
        v-else-if="mode === 'disable'"
        type="danger"
        :loading="loading"
        @click="handleDisable"
      >
        确认关闭
      </el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 3: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 4: 提交**

```bash
git add apps/admin/src/views/profile/components/TotpModal.vue
git commit -m "feat(admin): add TOTP modal component"
```

---

## Task 6: 创建修改密码弹窗组件

**Files:**
- Create: `apps/admin/src/views/profile/components/PasswordModal.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/admin/src/views/profile/components/PasswordModal.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updatePassword } from '@/api/profile'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度 6-16 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const { data } = await updatePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
    if (data.code === 200) {
      ElMessage.success('密码修改成功')
      handleClose()
    } else {
      ElMessage.error(data.msg || '修改失败')
    }
  } catch (error) {
    ElMessage.error('修改失败')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  formRef.value?.resetFields()
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="当前密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="handleSubmit"
      >
        确认修改
      </el-button>
    </template>
  </el-dialog>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/profile/components/PasswordModal.vue
git commit -m "feat(admin): add password modal component"
```

---

## Task 7: 创建头像卡片组件

**Files:**
- Create: `apps/admin/src/views/profile/components/AvatarCard.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/admin/src/views/profile/components/AvatarCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { adminLogout } from '@/api/auth'
import type { ProfileVO } from '@/types/profile'

const props = defineProps<{
  profile: ProfileVO | null
}>()

const router = useRouter()
const userStore = useUserStore()

const avatarText = computed(() => {
  if (props.profile?.username) {
    return props.profile.username.charAt(0).toUpperCase()
  }
  return 'A'
})

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await adminLogout()
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消退出
  }
}
</script>

<template>
  <div class="w-60 rounded-xl bg-white p-6 text-center shadow-sm">
    <!-- 头像 -->
    <div
      class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-medium text-white"
      style="background: linear-gradient(135deg, #cc785c, #e8a55a);"
    >
      <img
        v-if="profile?.avatar"
        :src="profile.avatar"
        alt="头像"
        class="h-full w-full rounded-full object-cover"
      />
      <span v-else>{{ avatarText }}</span>
    </div>

    <!-- 用户名 -->
    <div class="mb-1 text-lg font-semibold text-gray-800">
      {{ profile?.username || '加载中...' }}
    </div>

    <!-- 角色 -->
    <div class="mb-5 text-sm text-gray-500">
      {{ profile?.roleName || '-' }}
    </div>

    <!-- TOTP 状态 -->
    <div class="border-t border-gray-100 pt-5">
      <div class="flex items-center justify-center gap-1.5">
        <span
          class="h-2 w-2 rounded-full"
          :class="profile?.isTotpEnabled ? 'bg-green-500' : 'bg-gray-400'"
        ></span>
        <span class="text-xs text-gray-600">
          TOTP {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
        </span>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <button
      class="mt-4 w-full rounded-md bg-gray-100 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-200"
      @click="handleLogout"
    >
      退出登录
    </button>
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/profile/components/AvatarCard.vue
git commit -m "feat(admin): add avatar card component"
```

---

## Task 8: 创建信息表单组件

**Files:**
- Create: `apps/admin/src/views/profile/components/ProfileForm.vue`

- [ ] **Step 1: 创建组件**

```vue
<!-- apps/admin/src/views/profile/components/ProfileForm.vue -->
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { updateProfile } from '@/api/profile'
import { useUserStore } from '@/store'
import type { ProfileVO } from '@/types/profile'
import PasswordModal from './PasswordModal.vue'
import TotpModal from './TotpModal.vue'

const props = defineProps<{
  profile: ProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  phone: '',
  email: '',
})

// 监听 profile 变化，同步到表单
watch(
  () => props.profile,
  (val) => {
    if (val) {
      form.username = val.username || ''
      form.phone = val.phone || ''
      form.email = val.email || ''
    }
  },
  { immediate: true }
)

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名长度 2-50 位', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// 保存修改
async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const { data } = await updateProfile({
      username: form.username,
      phone: form.phone,
      email: form.email || undefined,
    })
    if (data.code === 200) {
      ElMessage.success('保存成功')
      userStore.updateLocalProfile({
        username: form.username,
        phone: form.phone,
        email: form.email || null,
      })
    } else {
      ElMessage.error(data.msg || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 密码弹窗
const passwordModalVisible = ref(false)

// TOTP 弹窗
const totpModalVisible = ref(false)
const totpMode = ref<'enable' | 'view' | 'disable'>('enable')

function openTotpModal(mode: 'enable' | 'view' | 'disable') {
  totpMode.value = mode
  totpModalVisible.value = true
}

function handleTotpSuccess() {
  emit('refresh')
}
</script>

<template>
  <div class="flex-1 rounded-xl bg-white p-6 shadow-sm">
    <h3 class="mb-5 text-base font-semibold text-gray-800">基本信息</h3>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="max-w-xl"
    >
      <div class="grid grid-cols-2 gap-4">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色">
          <el-input
            :model-value="profile?.roleName || '-'"
            disabled
            class="bg-gray-50"
          />
          <template #label>
            <span>
              角色
              <span class="text-xs" style="color: #cc785c;">(不可修改)</span>
            </span>
          </template>
        </el-form-item>
      </div>
    </el-form>

    <!-- 修改密码区域 -->
    <div class="mt-6 border-t border-gray-100 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-800">修改密码</h4>
          <p class="mt-1 text-xs text-gray-500">定期修改密码可以提高账号安全性</p>
        </div>
        <el-button @click="passwordModalVisible = true">修改密码</el-button>
      </div>
    </div>

    <!-- TOTP 区域 -->
    <div class="mt-6 border-t border-gray-100 pt-5">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-800">TOTP 双因素认证</h4>
          <p class="mt-1 text-xs text-gray-500">
            使用 Google Authenticator 增强账号安全
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="rounded-full px-2.5 py-1 text-xs"
            :class="
              profile?.isTotpEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            "
          >
            {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
          </span>
          <template v-if="profile?.isTotpEnabled">
            <el-button size="small" @click="openTotpModal('view')">
              查看二维码
            </el-button>
            <el-button size="small" type="danger" plain @click="openTotpModal('disable')">
              关闭验证
            </el-button>
          </template>
          <template v-else>
            <el-button
              size="small"
              type="primary"
              style="background-color: #cc785c; border-color: #cc785c;"
              @click="openTotpModal('enable')"
            >
              开启验证
            </el-button>
          </template>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="mt-6 flex justify-end">
      <el-button
        type="primary"
        :loading="loading"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="handleSave"
      >
        保存修改
      </el-button>
    </div>

    <!-- 弹窗 -->
    <PasswordModal v-model:visible="passwordModalVisible" />
    <TotpModal
      v-model:visible="totpModalVisible"
      :mode="totpMode"
      :is-totp-enabled="profile?.isTotpEnabled ?? false"
      @success="handleTotpSuccess"
    />
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/profile/components/ProfileForm.vue
git commit -m "feat(admin): add profile form component"
```

---

## Task 9: 创建个人中心主页面

**Files:**
- Create: `apps/admin/src/views/profile/index.vue`

- [ ] **Step 1: 创建主页面**

```vue
<!-- apps/admin/src/views/profile/index.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store'
import AvatarCard from './components/AvatarCard.vue'
import ProfileForm from './components/ProfileForm.vue'

const userStore = useUserStore()

onMounted(() => {
  if (!userStore.profile) {
    userStore.fetchProfile()
  }
})

function handleRefresh() {
  userStore.fetchProfile()
}
</script>

<template>
  <div class="flex gap-5">
    <AvatarCard :profile="userStore.profile" />
    <ProfileForm :profile="userStore.profile" @refresh="handleRefresh" />
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 提交**

```bash
git add apps/admin/src/views/profile/index.vue
git commit -m "feat(admin): add profile page"
```

---

## Task 10: 更新导航栏组件

**Files:**
- Modify: `apps/admin/src/layout/components/Navbar.vue`

- [ ] **Step 1: 重构 Navbar 组件**

```vue
<!-- apps/admin/src/layout/components/Navbar.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminLogout } from '@/api/auth'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 切换侧边栏
function toggleSidebar() {
  appStore.toggleSidebar()
}

// 获取头像文字
const avatarText = computed(() => userStore.getAvatarText())

// 进入个人中心
function goToProfile() {
  router.push('/profile')
}

// 进入后台管理
function goToDashboard() {
  router.push('/dashboard')
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await adminLogout()
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消退出
  }
}

// 加载用户信息
onMounted(() => {
  if (!userStore.profile && userStore.isLoggedIn()) {
    userStore.fetchProfile()
  }
})
</script>

<template>
  <div class="flex w-full items-center justify-between">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center">
      <el-icon
        class="cursor-pointer text-xl text-gray-600 hover:text-gray-900"
        @click="toggleSidebar"
      >
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>

      <el-breadcrumb separator="/" class="ml-4">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户信息 + 后台管理按钮 -->
    <div class="flex items-center gap-4">
      <!-- 用户卡片 -->
      <el-dropdown trigger="click">
        <el-tooltip content="进入个人中心" placement="bottom">
          <div
            class="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 shadow-sm transition hover:shadow-md"
          >
            <!-- 头像 -->
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-white"
              style="background: linear-gradient(135deg, #cc785c, #e8a55a);"
            >
              <img
                v-if="userStore.profile?.avatar"
                :src="userStore.profile.avatar"
                alt="头像"
                class="h-full w-full rounded-full object-cover"
              />
              <span v-else>{{ avatarText }}</span>
            </div>
            <!-- 用户名和角色 -->
            <div>
              <div class="text-sm font-medium text-gray-800">
                {{ userStore.profile?.username || '加载中...' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ userStore.profile?.roleName || '-' }}
              </div>
            </div>
            <el-icon class="ml-1 text-gray-400"><ArrowDown /></el-icon>
          </div>
        </el-tooltip>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToProfile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 进入后台管理按钮 -->
      <el-button
        type="primary"
        style="background-color: #cc785c; border-color: #cc785c;"
        @click="goToDashboard"
      >
        进入后台管理
      </el-button>
    </div>
  </div>
</template>
```

- [ ] **Step 2: 验证编译**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: 启动开发服务器验证**

Run: `cd apps/admin && npm run dev`
Expected: 服务启动成功，访问页面无报错

- [ ] **Step 4: 提交**

```bash
git add apps/admin/src/layout/components/Navbar.vue
git commit -m "feat(admin): update navbar with user card and backend button"
```

---

## Task 11: 集成测试与最终提交

- [ ] **Step 1: 启动开发服务器**

Run: `cd apps/admin && npm run dev`
Expected: 服务启动成功

- [ ] **Step 2: 手动测试导航栏**

1. 登录后查看右上角是否显示用户卡片
2. 点击用户卡片下拉菜单
3. 点击"个人中心"跳转到 /profile
4. 点击"进入后台管理"跳转到 /dashboard

- [ ] **Step 3: 手动测试个人中心**

1. 修改用户名、手机号、邮箱并保存
2. 点击"修改密码"弹窗并测试
3. 点击"开启 TOTP"查看二维码弹窗
4. 退出登录功能

- [ ] **Step 4: TypeScript 类型检查**

Run: `cd apps/admin && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 5: 最终提交**

```bash
git add .
git commit -m "feat(admin): complete profile feature with navbar and TOTP support"
```

---

## 总结

| Task | 文件 | 说明 |
|------|------|------|
| 1 | types/profile/index.ts | 类型定义 |
| 2 | api/profile/index.ts | API 接口 |
| 3 | store/modules/user.ts | Store 扩展 |
| 4 | router/index.ts | 路由配置 |
| 5 | components/TotpModal.vue | TOTP 弹窗 |
| 6 | components/PasswordModal.vue | 密码弹窗 |
| 7 | components/AvatarCard.vue | 头像卡片 |
| 8 | components/ProfileForm.vue | 信息表单 |
| 9 | views/profile/index.vue | 主页面 |
| 10 | layout/components/Navbar.vue | 导航栏更新 |
| 11 | - | 集成测试 |
