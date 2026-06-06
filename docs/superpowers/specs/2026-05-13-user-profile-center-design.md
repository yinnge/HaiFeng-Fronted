# C端用户个人中心设计文档

## 概述

在 `apps/user` (C端用户端) 实现个人中心功能，包括：用户资料展示与编辑、账号安全管理、佣金提现与邀请码绑定。

**实现顺序**：
1. 先实现接口层（API + 类型定义）
2. 再实现前端界面与渲染
3. 首页内容模块暂不实现

---

## 一、目录结构

### 1.1 apps/user 目录扩展

```
apps/user/src/
├── api/
│   ├── home/index.ts           # 首页接口（站点信息，暂不实现）
│   ├── search/index.ts         # 模糊搜索接口
│   └── member/
│       ├── profile.ts          # 用户资料 CRUD
│       ├── info.ts             # 账号信息
│       └── commission.ts       # 佣金提现
├── types/
│   └── member/
│       ├── profile.ts          # ProfileVO, ProfileUpdateDTO
│       ├── info.ts             # MemberInfoVO, PasswordDTO...
│       └── commission.ts       # CommissionVO, WithdrawDTO...
├── views/
│   └── profile/
│       ├── index.vue           # 个人中心主页面
│       └── components/
│           ├── ProfileHeader.vue   # 头像+VIP+收藏统计
│           ├── ProfileForm.vue     # 用户资料表单
│           ├── AccountInfo.vue     # 账号安全
│           └── CommissionPanel.vue # 佣金提现
└── components/
    └── LoginDialog.vue         # 全局登录提示框
```

### 1.2 packages/shared 枚举扩展

```
packages/shared/src/types/enums/
├── index.ts          # 现有枚举 + 导出新枚举
├── identity.ts       # IdentityEnum (新增)
├── province.ts       # ProvinceEnum (新增)
└── gender.ts         # GenderEnum (新增)
```

---

## 二、枚举定义

### 2.1 IdentityEnum（身份枚举）

```typescript
// packages/shared/src/types/enums/identity.ts
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

export const IdentityOptions = Object.entries(IdentityLabel).map(([value, label]) => ({
  value,
  label,
}))
```

### 2.2 GenderEnum（性别枚举）

```typescript
// packages/shared/src/types/enums/gender.ts
export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
}

export const GenderOptions = Object.entries(GenderLabel).map(([value, label]) => ({
  value,
  label,
}))
```

### 2.3 ProvinceEnum（省份枚举）

```typescript
// packages/shared/src/types/enums/province.ts
export const ProvinceOptions = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '香港', '澳门', '台湾',
] as const

export type Province = typeof ProvinceOptions[number]
```

---

## 三、类型定义 (VO/DTO)

### 3.1 用户资料类型

```typescript
// apps/user/src/types/member/profile.ts
export interface MemberProfileVO {
  realName: string | null
  email: string | null
  gender: '男' | '女' | null
  schoolName: string | null
  province: string | null
  city: string | null
  major: string | null
  identity: '高中生' | '大学生' | '研究生' | '其他' | null
  grade: string | null
  educationLevel: string | null
  favoriteCount: number        // 收藏数（展示）
  // viewCount: number         // 忽略，不展示
  canEditSchool: boolean       // 是否可编辑学校
}

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

### 3.2 用户信息类型

```typescript
// apps/user/src/types/member/info.ts
export interface MemberInfoVO {
  username: string
  phone: string
  avatar: string | null
  hasWechat: boolean
  inviteCode: string           // 我的邀请码（只读）
  commissionBalance: number    // 可提现余额（只读）
  commissionTotalEarned: number
  commissionTotalPaid: number
  memberType: 'normal' | 'pro' | 'vip'
  expireAt: string | null
}

export interface MemberInfoUpdateDTO {
  username?: string
  phone?: string
  avatar?: string
}

export interface PasswordUpdateDTO {
  oldPassword: string          // 旧密码（必填，用于校验）
  newPassword: string          // 新密码
}
```

### 3.3 佣金与邀请码类型

```typescript
// apps/user/src/types/member/commission.ts
export interface CommissionVO {
  inviteCode: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  referralCount: number        // 邀请人数
  referrerInviteCode: string | null  // 我的推荐人邀请码
}

export interface WithdrawDTO {
  amount: 50 | 100
}

export interface ReferrerPreviewVO {
  username: string
  phone: string  // 脱敏：138****8888
}
```

### 3.4 模糊搜索类型

```typescript
// apps/user/src/types/search/index.ts
export interface SearchItem {
  id: number
  name: string
}
```

---

## 四、API 接口封装

### 4.1 用户资料接口

```typescript
// apps/user/src/api/member/profile.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberProfileVO, MemberProfileUpdateDTO } from '@/types/member/profile'

const PREFIX = '/api/v1/app/member'

export const getProfile = () =>
  request.get<R<MemberProfileVO>>(`${PREFIX}/profile`)

export const updateProfile = (data: MemberProfileUpdateDTO) =>
  request.put<R<null>>(`${PREFIX}/profile`, data)
```

### 4.2 用户信息接口

```typescript
// apps/user/src/api/member/info.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'

const PREFIX = '/api/v1/app/member'

export const getMemberInfo = () =>
  request.get<R<MemberInfoVO>>(`${PREFIX}/info`)

export const updateMemberInfo = (data: MemberInfoUpdateDTO) =>
  request.put<R<null>>(`${PREFIX}/info`, data)

export const getWechatId = () =>
  request.get<R<string>>(`${PREFIX}/wechat`)

export const updateWechatId = (data: { wechatId: string }) =>
  request.put<R<null>>(`${PREFIX}/wechat`, data)

export const updatePassword = (data: PasswordUpdateDTO) =>
  request.put<R<null>>(`${PREFIX}/password`, data)

export const updateAvatar = (data: { avatar: string }) =>
  request.put<R<null>>(`${PREFIX}/avatar`, data)
```

### 4.3 佣金接口

```typescript
// apps/user/src/api/member/commission.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { CommissionVO, WithdrawDTO, ReferrerPreviewVO } from '@/types/member/commission'

const PREFIX = '/api/v1/app/member'

export const getCommission = () =>
  request.get<R<CommissionVO>>(`${PREFIX}/commission`)

export const withdraw = (data: WithdrawDTO) =>
  request.post<R<number>>(`${PREFIX}/withdraw`, data)

export const previewReferrer = (inviteCode: string) =>
  request.get<R<ReferrerPreviewVO>>(`${PREFIX}/referrer/preview`, { params: { inviteCode } })

export const bindReferrer = (data: { inviteCode: string }) =>
  request.post<R<null>>(`${PREFIX}/referrer/bind`, data)
```

### 4.4 模糊搜索接口

```typescript
// apps/user/src/api/search/index.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SearchItem } from '@/types/search'

const PREFIX = '/api/v1/app/search'

export const searchUniversity = (keyword: string, limit = 10) =>
  request.get<R<SearchItem[]>>(`${PREFIX}/university`, { params: { keyword, limit } })

export const searchCity = (keyword: string, limit = 10) =>
  request.get<R<SearchItem[]>>(`${PREFIX}/city`, { params: { keyword, limit } })

export const searchMajor = (keyword: string, limit = 10) =>
  request.get<R<SearchItem[]>>(`${PREFIX}/major`, { params: { keyword, limit } })
```

---

## 五、页面设计

### 5.1 页面布局（方案A：单页面 + Tab 切换）

```
┌─────────────────────────────────────────────────────────────┐
│  ProfileHeader.vue                                           │
│  ┌────────┐  张同学  VIP标识    │  收藏: 128               │
│  │  头像   │  手机号/到期时间    │  (favoriteCount)         │
│  └────────┘                     │                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  el-tabs                                                     │
│  [个人资料] [账号安全] [佣金提现]                              │
├─────────────────────────────────────────────────────────────┤
│  ProfileForm.vue (Tab 1: 个人资料)                           │
│  AccountInfo.vue (Tab 2: 账号安全)                           │
│  CommissionPanel.vue (Tab 3: 佣金提现)                       │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 组件说明

#### ProfileHeader.vue

- 用户头像（可点击更换）
- 用户名 + VIP 标识（el-tag）
- 会员到期时间
- 收藏数统计（只展示 favoriteCount，忽略 viewCount）

#### ProfileForm.vue（个人资料）

| 字段 | 组件 | 说明 |
|------|------|------|
| realName | el-input | 真实姓名 |
| email | el-input | 邮箱 |
| gender | el-select | 性别（男/女）|
| identity | el-select | 身份（高中生/大学生/研究生/其他）|
| province | el-select | 省份（34个）|
| city | el-autocomplete | 城市（模糊搜索）|
| major | el-autocomplete | 专业（模糊搜索）|
| schoolName | el-autocomplete | 学校（模糊搜索，仅大学生/研究生显示）|
| grade | el-input | 年级 |
| educationLevel | el-input | 学历层次 |

**业务规则**：
- 当 `identity` 为 `大学生` 或 `研究生` 时才显示 schoolName 字段
- 当身份从大学生/研究生改为高中生/其他时，schoolName 自动清空

#### AccountInfo.vue（账号安全）

| 字段 | 操作 | 说明 |
|------|------|------|
| username | 修改 | 用户名 |
| phone | 修改 | 手机号 |
| 微信号 | 查看/修改 | 点击"查看"调用解密接口显示 |
| 密码 | 修改 | 旧密码 + 新密码 |

#### CommissionPanel.vue（佣金提现）

| 内容 | 说明 |
|------|------|
| inviteCode | 我的邀请码（只读，可复制）|
| commissionBalance | 可提现余额 |
| commissionTotalEarned | 累计获得佣金 |
| commissionTotalPaid | 累计已发放佣金 |
| referralCount | 邀请人数 |
| 提现按钮 | 选择 50 或 100 提现 |
| 绑定邀请码 | 若无推荐人，显示输入框+预览+确认绑定 |

**提现规则**：
- 只能选择 50 或 100
- 余额必须 >= 提现金额
- 绑定后不可修改

---

## 六、路由配置

```typescript
// apps/user/src/router/index.ts
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/home/index.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/register/index.vue') },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { requiresAuth: true, title: '个人中心' }
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/404.vue') },
]
```

---

## 七、登录拦截逻辑

```typescript
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  document.title = `${to.meta.title || '海峰未来规划院'}`

  if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
    // 存储目标路由，登录后跳回
    userStore.setRedirectPath(to.fullPath)

    ElMessageBox.confirm(
      '您还没有登录，请先登录',
      '提示',
      {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      next({ name: 'Login' })
    }).catch(() => {
      next(false)
    })
  } else {
    next()
  }
})
```

---

## 八、UI 风格

- **整体风格**：灰白为主，红橙黄颜色点缀（参考原型图）
- **组件库**：Element Plus
- **CSS 框架**：Tailwind CSS

---

## 九、实现顺序

1. **枚举定义**（packages/shared）
2. **类型定义**（apps/user/src/types）
3. **API 接口封装**（apps/user/src/api）
4. **路由配置与登录拦截**
5. **页面与组件实现**（使用 frontend-design skill）

---

## 十、暂不实现

- 首页内容模块（站点信息、ICP、社交媒体展示）
- 用户收藏列表
- 消息通知
