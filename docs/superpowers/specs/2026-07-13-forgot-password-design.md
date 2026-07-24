# 短信验证码 · 忘记密码功能设计文档（用户端）

## 概述

为用户端（apps/user）实现忘记密码功能，支持手机号+短信验证码重置密码。用户通过图形验证码验证身份后，接收短信验证码重置密码。遵循用户端橙/琥珀渐变风格，与登录页视觉统一。

## 路由设计

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | `/login` | 登录页，底部新增「忘记密码？」链接 |
| 重置密码 | `/forgot-password` | 忘记密码重置页（独立路由） |

### 登录页改动

在登录页密码框下方新增「忘记密码？」文本链接，点击跳转 `/forgot-password`。

```
┌──────────────────────────┐
│         Logo + 标题       │
│                          │
│  手机号 [______________] │
│  密码   [______________] │
│              忘记密码？   │  ← 新增：右对齐小字链接
│  [      登    录      ]  │
│  还没有账号？立即注册     │
└──────────────────────────┘
```

### 重置密码页结构（三步骤）

```
┌──────────────────────────────┐
│        ← 返回登录            │
│       Logo + 重置密码        │
│                              │
│  Step 1: 手机号 + 图形验证码  │
│  手机号 [________________]   │
│  图形码 [______] [图片验证码] │
│  [    获取短信验证码    ]    │
│  ──────────────────────     │
│  Step 2: 短信验证码 + 新密码  │
│  短信码 [______] [60s后重发] │
│  新密码 [________________]   │
│  确认新密码 [______________] │
│  [      重 置 密 码      ]  │
│                              │
│  已有账号？立即登录           │
└──────────────────────────────┘
```

## 文件结构

```
apps/user/src/
├── api/
│   └── auth/
│       └── forgot-password.ts       # 新增：重置密码相关 API
├── types/
│   └── auth/
│       └── forgot-password.ts       # 新增：VO/DTO 类型
├── views/
│   └── forgot-password/
│       └── index.vue                # 新增：重置密码页面
└── router/index.ts                  # 新增 /forgot-password 路由
```

## API 定义

对应后端 C 端接口（来自 order24.md）：

| 步骤 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 1 | GET | `/api/v1/app/auth/captcha` | 获取图形验证码（已有公共接口） |
| 2 | POST | `/api/v1/app/auth/forgot-password/send-code` | 发送短信验证码 |
| 3 | POST | `/api/v1/app/auth/forgot-password/reset` | 重置密码 |

### 接口详情

#### 1. 获取图形验证码

```
GET /api/v1/app/auth/captcha
Response: { code: 200, data: { uuid: string, image: string(base64) } }
```

页面加载时自动调用，验证码点击可刷新。

#### 2. 发送短信验证码

```
POST /api/v1/app/auth/forgot-password/send-code
Body: { phone, captchaCode, uuid }
Response 200: { code: 200, data: null }
```

- 手机号不存在也返回 200（防枚举），前端不发提示
- 60 秒发送冷却，前端按钮倒计时
- 每日上限 5 次、IP 频率限制 → 后端返回对应错误码

#### 3. 重置密码

```
POST /api/v1/app/auth/forgot-password/reset
Body: { phone, code, password }
Response 200: { code: 200, data: null }
```

成功时后端清除所有登录态，前端跳转 `/login` 并提示「密码重置成功，请重新登录」。

## 类型定义

```typescript
// apps/user/src/types/auth/forgot-password.ts

/** 图形验证码响应 */
export interface CaptchaVO {
  uuid: string
  image: string  // data:image/png;base64,...
}

/** 发送短信验证码请求 */
export interface SendCodeDTO {
  phone: string
  captchaCode: string
  uuid: string
}

/** 重置密码请求 */
export interface ResetPasswordDTO {
  phone: string
  code: string
  password: string
}
```

## 组件状态

### 重置密码页状态

- `step: ref(1 | 2)` — 两步切换
- `phone: string` — 手机号（两步骤共享）
- `captchaUuid: string` — 图形验证码 UUID
- `captchaImage: string` — 图形验证码 Base64
- `captchaCode: string` — 用户输入的图形码
- `code: string` — 短信验证码
- `password: string` — 新密码
- `confirmPassword: string` — 确认新密码
- `cooldown: number` — 短信发送倒计时（秒）
- `sending: boolean` — 发送短信中
- `resetting: boolean` — 重置密码中
- `loading: boolean` — 加载中

### 校验规则

| 字段 | 规则 |
|------|------|
| phone | `^1[3-9]\d{9}$` |
| captchaCode | 4 位字母/数字 |
| code | 6 位数字 |
| password | `^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$`（字母+数字） |
| confirmPassword | 必须与 password 一致 |

### 错误处理

后端所有错误通过 `ElMessage` 组件展示后端返回的 `msg`：

| 场景 | 提示方式 | 消息来源 |
|------|----------|----------|
| 图形验证码错误 | `ElMessage.warning` | 后端 msg |
| 发送过于频繁 | `ElMessage.warning` | 后端 msg |
| 验证码过期 | `ElMessage.warning` | 后端 msg |
| 验证码锁定 | `ElMessage.error` | 后端 msg |
| 密码格式错误 | `ElMessage.warning` | 前端校验（优先） |
| 两次密码不一致 | `ElMessage.warning` | 前端校验 |
| 重置成功 | `ElMessage.success` | 前端：密码重置成功，请重新登录 |

## UI 规范

与登录页保持完全一致：

- **背景**：`bg-gradient-to-b from-slate-50 to-white`（与首页一致）
- **容器**：白色圆角卡片 `rounded-2xl bg-white p-8 shadow-lg`
- **Logo**：居中海峰 Logo + 标题
- **输入框**：`rounded-lg border border-gray-200 px-4 py-3 focus:border-orange-400`
- **主按钮**：`bg-gradient-to-r from-orange-500 to-amber-500` 渐变
- **文本链接**：`text-orange-500 hover:text-orange-600`
- **验证码按钮**：倒计时 `rounded-lg border border-orange-500 text-orange-500 px-4 py-3`

## 确定的设计决策

| 决策项 | 结论 |
|--------|------|
| 短信倒计时 | 60 秒（与后端冷却一致） |
| 图形码刷新 | 点击图片刷新 + 右侧圆形刷新图标按钮 |
| 密码强度 | 字母+数字（6-16 位），不需要特殊字符，与后端一致 |
| 错误提示 | 所有后端错误用 `ElMessage` 展示后端返回的 `msg` 文本 |
