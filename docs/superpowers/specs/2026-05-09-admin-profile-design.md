# 管理员个人中心与导航栏设计规格

**日期**: 2026-05-09
**状态**: 待实现
**范围**: Admin 管理后台 - 首页导航栏 + 个人中心页面

---

## 1. 概述

为管理后台添加两个功能：
1. **首页右上角导航栏** — 展示管理员头像、用户名、角色，以及"进入后台管理"按钮
2. **个人中心页面** — 管理员查看/修改个人信息，管理 TOTP 双因素认证

## 2. 设计决策

| 决策项 | 选择 | 说明 |
|--------|------|------|
| 导航栏布局 | 用户在左，按钮在右 | 用户卡片靠左，"进入后台管理"按钮在最右 |
| 个人中心布局 | 左右分栏 | 左侧头像卡片 + 右侧信息表单 |
| TOTP 展示方式 | 弹窗 | 点击开启/查看时弹窗显示二维码 |
| 配色方案 | 灰白 + coral 点缀 | 与后台管理保持一致，使用 #cc785c 作为主色调 |

## 3. 功能规格

### 3.1 右上角导航栏

**位置**: `apps/admin/src/layout/components/Navbar.vue` 右侧区域

**元素组成**:
```
[用户卡片] [进入后台管理按钮]
```

**用户卡片**:
- 头像 (36px 圆形，如无则显示用户名首字)
- 用户名 (14px, #333)
- 角色名 roleName (11px, #888)
- 下拉箭头图标

**交互**:
- 点击用户卡片 → 下拉菜单：
  - "个人中心" → 跳转 `/profile`
  - "退出登录" → 调用登出 API，跳转 `/login`
- 鼠标悬停 → tooltip "进入个人中心"

**"进入后台管理"按钮**:
- 背景色: #cc785c (coral)
- 文字: 白色, 13px
- 点击 → 跳转 `/dashboard` (后台首页)

### 3.2 个人中心页面

**路由**: `/profile`
**位置**: `apps/admin/src/views/profile/index.vue`

#### 左侧头像卡片 (240px 宽)

| 元素 | 规格 |
|------|------|
| 头像 | 80px 圆形，渐变背景 #cc785c → #e8a55a，无头像时显示用户名首字 |
| 用户名 | 18px, font-weight: 600, #333 |
| 角色名 | 13px, #888 |
| TOTP 状态 | 绿点 + "已开启" 或 灰点 + "未开启" |
| 退出登录按钮 | 灰色背景按钮 |

#### 右侧表单区域

**基本信息** (可编辑):
| 字段 | 对应后端 | 可编辑 |
|------|----------|--------|
| 用户名 | username | ✓ |
| 手机号 | phone | ✓ |
| 邮箱 | email | ✓ |
| 角色 | roleName | ✗ (只读，灰色背景) |

**修改密码**:
- 当前密码输入框
- 新密码输入框
- "修改密码"按钮 → 调用 `PUT /api/v1/admin/profile/password`

**TOTP 双因素认证**:
- 状态标签: 已开启(绿色) / 未开启(灰色)
- 开启按钮 → 弹窗显示二维码
- 关闭按钮 → 确认后调用关闭 API
- 查看二维码按钮 (仅已开启时显示)

**保存按钮**:
- coral 背景 (#cc785c)
- 点击 → 调用 `PUT /api/v1/admin/profile`

### 3.3 TOTP 弹窗

**触发**: 点击"开启验证"或"查看二维码"

**内容**:
- 标题: "绑定 TOTP 验证"
- 说明文字: "使用 Google Authenticator 扫描下方二维码"
- 二维码图片 (160x160，来自后端 base64)
- 手动输入密钥 (monospace 字体显示 secret)
- 按钮: "取消" + "已扫描，验证"

**验证流程**:
1. 用户扫码后，输入 6 位验证码
2. 调用 `POST /api/v1/admin/profile/totp/verify`
3. 成功后关闭弹窗，更新状态

## 4. API 接口

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取个人信息 | GET | `/api/v1/admin/profile` | 返回 ProfileVO |
| 修改个人信息 | PUT | `/api/v1/admin/profile` | 更新 username, phone, email, avatar |
| 修改密码 | PUT | `/api/v1/admin/profile/password` | 需要 oldPassword, newPassword |
| 开启 TOTP | POST | `/api/v1/admin/profile/totp/enable` | 返回 secret + qrCodeImage |
| 验证 TOTP | POST | `/api/v1/admin/profile/totp/verify` | 传入 6 位 code |
| 关闭 TOTP | POST | `/api/v1/admin/profile/totp/disable` | 需要 password 验证 |
| 获取 TOTP 二维码 | GET | `/api/v1/admin/profile/totp/qrcode` | 仅已开启时可用 |

## 5. 类型定义

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

/** TOTP 开启响应 */
export interface TotpEnableVO {
  secret: string
  qrCodeImage: string  // base64 图片
}

/** TOTP 验证 DTO */
export interface TotpVerifyDTO {
  code: string  // 6 位验证码
}

/** TOTP 关闭 DTO */
export interface TotpDisableDTO {
  password: string
}
```

## 6. 文件清单

### 新建文件

| 路径 | 说明 |
|------|------|
| `apps/admin/src/api/profile/index.ts` | Profile API 接口 |
| `apps/admin/src/types/profile/index.ts` | Profile 类型定义 |
| `apps/admin/src/views/profile/index.vue` | 个人中心页面 |
| `apps/admin/src/views/profile/components/AvatarCard.vue` | 左侧头像卡片组件 |
| `apps/admin/src/views/profile/components/ProfileForm.vue` | 右侧信息表单组件 |
| `apps/admin/src/views/profile/components/TotpModal.vue` | TOTP 弹窗组件 |

### 修改文件

| 路径 | 修改内容 |
|------|----------|
| `apps/admin/src/layout/components/Navbar.vue` | 添加用户卡片和后台管理按钮 |
| `apps/admin/src/store/modules/user.ts` | 扩展 userInfo 类型，添加 fetchProfile 方法 |
| `apps/admin/src/router/index.ts` | 添加 /profile 路由 |

## 7. 样式规范

| 元素 | 样式 |
|------|------|
| 主色调 | #cc785c (coral) |
| 背景色 | #f0f2f5 (页面), #ffffff (卡片) |
| 圆角 | 6px (按钮), 8px (输入框), 12px (卡片) |
| 阴影 | 0 2px 8px rgba(0,0,0,0.06) |
| 成功状态 | #5db872 (绿色) |
| 危险操作 | #c64545 (红色) |

## 8. 注意事项

1. **roleName 不可修改** — 由高级管理员分配，个人中心仅展示
2. **TOTP 二维码仅在开启后显示** — isTotpEnabled = true 时才渲染
3. **关闭 TOTP 需要密码验证** — 防止误操作
4. **登录后自动获取用户信息** — 在 router guard 中调用 fetchProfile
5. **头像支持上传** — 可集成文件上传组件 (可选，MVP 版本可用默认头像)
