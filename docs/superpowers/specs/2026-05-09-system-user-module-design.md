# 系统设置与用户管理模块设计文档

## 概述

本文档描述管理后台的三个核心模块的前端实现设计：

1. **系统设置** - 单例配置管理（分组卡片式表单）
2. **用户管理** - 用户列表 CRUD + 会员升级 + 微信明文查看
3. **操作日志** - 日志查询 + 详情 + 批量删除

## 目录结构

```
apps/admin/src/
├── api/
│   ├── system/
│   │   ├── settings.ts      # 系统设置 API
│   │   └── log.ts           # 操作日志 API
│   └── user/
│       └── index.ts         # 用户管理 API
├── types/
│   ├── system/
│   │   ├── settings.ts      # SystemSettingsVO, SystemSettingsUpdateDTO
│   │   └── log.ts           # AdminLogVO, AdminLogQueryDTO
│   └── user/
│       └── index.ts         # MemberListVO, MemberDetailVO, MemberQueryDTO...
├── views/
│   ├── system/
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   ├── BasicInfoCard.vue      # 基本信息卡片
│   │   │   │   ├── PricingCard.vue        # 会员价格卡片
│   │   │   │   ├── SeoCard.vue            # SEO配置卡片
│   │   │   │   ├── SocialCard.vue         # 社交媒体卡片
│   │   │   │   └── ContactCard.vue        # 联系信息卡片
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
│           │   └── UserUpgradeModal.vue   # 会员升级弹窗
│           └── index.vue
└── router/
    └── modules/
        ├── system.ts        # 系统管理路由
        └── user.ts          # 用户管理路由
```

## 模块一：系统设置

### 布局设计

采用分组卡片式布局，5个卡片垂直排列，每个卡片独立保存。

### 卡片划分

| 卡片 | 字段 | 说明 |
|------|------|------|
| **基本信息** | siteName, siteUrl, siteIcp, siteDescription, apiNumber | 网站名称、Logo URL、备案号、描述、API次数限制 |
| **会员价格** | proPrice, vipPrice, proCommissionRate, vipCommissionRate | Pro/VIP价格及佣金比例 |
| **SEO配置** | seoTitle, seoKeywords, seoDescription | SEO三件套 |
| **社交媒体** | contactUrl.wechat/weibo/zhihu/douyin/bilibili | 5个社交平台链接 |
| **联系信息** | basicMessage.address/phone/email/consultationTime | 地址、电话、邮箱、咨询时间 |

### 交互逻辑

- 页面加载时调用 `GET /api/v1/admin/system/settings` 获取数据
- 每张卡片底部一个「保存」按钮
- 点击保存时只提交该卡片对应的字段（API 支持部分更新）
- 保存成功后显示 ElMessage.success

### API 定义

```typescript
// api/system/settings.ts
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

### 类型定义

```typescript
// types/system/settings.ts
export interface ContactUrl {
  wechat?: string
  weibo?: string
  zhihu?: string
  douyin?: string
  bilibili?: string
}

export interface BasicMessage {
  address?: string
  phone?: string
  email?: string
  consultationTime?: string
}

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

## 模块二：用户管理

### 页面结构

UserSearch + UserTable + UserDetailModal + UserUpgradeModal

### 搜索区域

| 字段 | 组件 | 查询方式 |
|------|------|----------|
| phone | el-input | 模糊查询 |
| inviteCode | el-input | 模糊查询 |
| memberType | el-select (normal/pro/vip) | 精准查询 |
| status | el-select (active/disabled) | 精准查询 |
| wechatId | el-input | 精准查询（后端转盲索引） |

### 表格列定义

| 列 | 字段 | 说明 |
|------|------|------|
| 用户名 | username | - |
| 手机号 | phone | 脱敏显示 138****5678 |
| 会员类型 | memberType | el-tag (info/warning/success) |
| 微信号 | wechatId | 脱敏显示 wxid***23 |
| 状态 | status | el-tag (active=success/disabled=danger) |
| 最后登录 | lastLoginAt | 格式化时间 |
| 操作 | - | 详情 / 升级 / 禁用(或启用) |

### UserDetailModal 设计

- 展示用户完整信息（脱敏）
- 微信号旁边有「查看明文」按钮，点击调用 `GET /api/v1/admin/user/{id}/wechat`
- 显示推荐人信息、佣金余额、累计佣金等

### UserUpgradeModal 设计

```
┌─────────────────────────────────────┐
│  会员升级                      [X]  │
├─────────────────────────────────────┤
│  当前会员: [普通用户]               │
│  到期时间: [未开通]                 │
│                                     │
│  目标类型: [Pro会员 ▼]              │
│  开通时长: [12 ▼] 个月              │
│  金额:     ○ 自动计算 ○ 手动输入    │
│            [199.00] 元              │
│  备注:     [________________]       │
│                                     │
│         [取消]  [确认升级]          │
└─────────────────────────────────────┘
```

- 自动计算公式：`(年价格 / 12) × 月数`
- 手动输入时可覆盖金额（用于打折场景）
- 提交调用 `POST /api/v1/admin/user/{id}/upgrade`

### API 定义

```typescript
// api/user/index.ts
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

### 类型定义

```typescript
// types/user/index.ts
import type { BasePageQuery } from '@haifeng/shared'

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

export interface MemberQueryDTO extends BasePageQuery {
  phone?: string
  memberType?: 'normal' | 'pro' | 'vip'
  wechatId?: string
  status?: 'active' | 'disabled'
  inviteCode?: string
}

export interface MemberStatusDTO {
  status: 'active' | 'disabled'
}

export interface MemberUpgradeDTO {
  targetType: 'pro' | 'vip'
  durationMonths: number
  amount?: number
  remark?: string
}
```

### 枚举扩展

```typescript
// packages/shared/src/types/enums/index.ts (追加)

/** 用户状态枚举 */
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

## 模块三：操作日志

### 页面结构

LogSearch + LogTable + LogDetailModal

### 搜索区域

| 字段 | 组件 | 查询方式 |
|------|------|----------|
| adminName | el-input | 模糊查询 |
| result | el-select (SUCCESS/FAIL) | 精准查询 |
| requestMethod | el-select (GET/POST/PUT/DELETE) | 精准查询 |

### 表格列定义

| 列 | 字段 | 说明 |
|------|------|------|
| 多选 | - | el-table-column type="selection" |
| 管理员 | adminName | - |
| 操作描述 | operation | 格式：模块 - 操作 |
| 请求方法 | requestMethod | el-tag 不同颜色区分 |
| 操作结果 | result | SUCCESS=success / FAIL=danger |
| IP地址 | ip | - |
| 操作时间 | createdAt | 格式化时间 |
| 操作 | - | 详情 |

### 批量删除设计

使用下拉菜单按钮：

```
┌─────────────────┐
│ 批量删除 ▼      │
├─────────────────┤
│ 删除选中        │  ← 需要勾选表格行，未勾选时禁用
│ 删除一个月前    │
│ 删除全部        │  ← 红色文字，二次确认
└─────────────────┘
```

- "删除选中"需要至少勾选一条记录
- "删除全部"需要二次确认弹窗
- 调用 `DELETE /api/v1/admin/system/logs/batch`

### LogDetailModal 设计

- 展示完整日志信息
- requestParams 字段使用 `<pre>` 或代码块格式化显示 JSON

### API 定义

```typescript
// api/system/log.ts
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

### 类型定义

```typescript
// types/system/log.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface AdminLogListVO {
  id: number
  adminName: string
  operation: string
  requestMethod: string
  result: 'SUCCESS' | 'FAIL'
  ip: string
  createdAt: string
}

export interface AdminLogDetailVO extends AdminLogListVO {
  adminId: number
  requestPath: string
  requestParams: string
  errorMsg?: string
}

export interface AdminLogQueryDTO extends BasePageQuery {
  adminName?: string
  result?: 'SUCCESS' | 'FAIL'
  requestMethod?: string
}

export interface AdminLogBatchDeleteDTO {
  type: 'ids' | 'lastMonth' | 'all'
  ids?: number[]
}
```

## 路由配置

### system.ts

```typescript
// router/modules/system.ts
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

### user.ts

```typescript
// router/modules/user.ts
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

### router/index.ts 调整

```typescript
import systemRoutes from './modules/system'
import userRoutes from './modules/user'

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', ... },
      systemRoutes,      // 系统管理
      // homeRoutes,     // 首页管理（暂空）
      permissionRoutes,  // 权限管理
      userRoutes,        // 用户管理
      { path: 'profile', name: 'Profile', ... },
    ],
  },
]
```

## 菜单顺序

侧边栏菜单顺序：
1. 控制面板 (Dashboard)
2. 系统管理 → 系统设置 / 操作日志
3. 首页管理 (暂空)
4. 权限管理 → 角色列表 / 模块列表 / 管理员列表
5. 用户管理 → 用户列表

## 技术要点

1. **代码风格**：遵循现有权限管理模块的组件拆分模式（Search + Table + DetailModal）
2. **分页选项**：`[10, 20, 30, 50, 100, 200, 500, 1000]`
3. **金额显示**：保留 2 位小数 `value.toFixed(2)`
4. **枚举映射**：使用 `MemberTypeLabel`、`MemberTypeTag`、`UserStatusLabel`、`UserStatusTag` 等映射对象
5. **UI 框架**：Element Plus + Tailwind CSS，优先使用原生组件
