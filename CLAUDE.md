# 海枫未来规划院 (前端工程) - 开发规范

## 项目简介

教育规划平台前端，核心功能：高考志愿填报。采用 **Monorepo 单仓库** 架构：

| 应用 | 路径 | 说明 | UI 框架 |
|------|------|------|---------|
| Admin 管理后台 | `apps/admin/` | 面向管理员 | Element Plus |
| User 用户端 | `apps/user/` | 面向 C 端用户 | 待定 |
| Shared 共享包 | `packages/shared/` | 对应后端 common | - |

## 角色

你是一个拥有 10 年经验的高级大前端架构师（精通 Vue3、TypeScript、Vite 工程化）。请严格按照以下规范生成代码、规划目录和设计组件。

## 技术栈选型

* **核心框架**: Vue 3.x (严格使用 Composition API + `<script setup>`)
* **构建工具**: Vite
* **开发语言**: TypeScript (必须严格定义 API 响应类型、DTO/VO 的 Interface)
* **路由管理**: Vue Router 4
* **状态管理**: Pinia
* **UI 框架**: Element Plus (管理后台) / 待定 (用户端)
* **CSS 框架**: Tailwind CSS
* **HTTP 客户端**: Axios (需封装拦截器处理双 Token)
* **包管理**: pnpm (Monorepo)

---

## 设计页面规范
先读取 `D:\SelfCompany\Project-HaiFeng-fronted\DESIGN.md`，之后按这里面的设计规范来生成 UI。

## 目录结构规范

与后端模块保持高度一致，拒绝所有文件平铺，采用 `Domain-Driven Design (DDD)` 思想分子包。

### Monorepo 顶层结构

```text
Project-HaiFeng-fronted/
├── apps/
│   ├── admin/                    # 管理后台
│   │   ├── src/
│   │   │   ├── api/{模块}/       # API 接口 (与后端 Controller 对应)
│   │   │   ├── views/{模块}/     # 页面视图
│   │   │   ├── components/       # 应用级公共组件
│   │   │   ├── layout/           # 布局组件 (侧边栏/顶栏/面包屑)
│   │   │   ├── router/
│   │   │   │   ├── modules/      # 按业务模块划分路由
│   │   │   │   └── index.ts
│   │   │   ├── store/modules/    # Pinia 状态
│   │   │   └── types/{模块}/     # 应用专用的 VO/DTO 类型
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── user/                     # 用户端 (结构同上)
│       └── src/
│
├── packages/
│   └── shared/                   # 共享代码 (对应后端 haifeng-common)
│       ├── src/
│       │   ├── types/
│       │   │   ├── api.ts        # R<T>, PageResult, BasePageQuery
│       │   │   └── enums/        # 枚举定义 (与后端 enums 对应)
│       │   ├── utils/
│       │   │   ├── request.ts    # Axios 核心封装 (双 Token 拦截器)
│       │   │   └── auth.ts       # Token 在 localStorage 的读写
│       │   └── constants/
│       │       └── errorCode.ts  # 错误码常量
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md
```

### 单应用 src 目录详细结构 (以 admin 为例)

```text
apps/admin/src/
├── api/                          # API 接口统一管理
│   ├── auth/index.ts             # 登录/Token 相关
│   ├── system/index.ts           # 系统管理
│   ├── home/index.ts             # 首页管理
│   ├── permission/index.ts       # 权限管理
│   ├── user/index.ts             # 用户管理
│   ├── university/index.ts       # 院校管理
│   ├── resource/index.ts         # 资源管理
│   ├── major/index.ts            # 专业管理
│   ├── city/index.ts             # 城市管理
│   ├── industry/index.ts         # 行业管理
│   ├── algorithm/                # 高考算法 (有二级子模块)
│   │   ├── admission/index.ts    # 专业组管理
│   │   ├── config/index.ts       # 算法配置管理
│   │   └── constraint/index.ts   # 算法约束模块
│   ├── special/index.ts          # 特殊通道
│   ├── certificate/index.ts      # 证书竞赛
│   ├── company/index.ts          # 企业管理
│   └── employment/               # 就业管理 (有二级子模块)
│       ├── civil/index.ts        # 公务员考试
│       ├── institution/index.ts  # 事业编
│       ├── military/index.ts     # 部队文职
│       ├── selection/index.ts    # 选调生
│       ├── teacher/index.ts      # 教师招聘
│       ├── healthcare/index.ts   # 医疗卫生
│       ├── finance/index.ts      # 银行金融
│       ├── grassroots/index.ts   # 基层服务
│       ├── community/index.ts    # 社区工作
│       └── welfare/index.ts      # 公益性岗位
│
├── views/                        # 页面视图 (结构与 api 对应)
│   ├── login/
│   ├── system/
│   ├── algorithm/
│   │   ├── admission/
│   │   ├── config/
│   │   └── constraint/
│   ├── employment/
│   │   ├── civil/
│   │   └── ...
│   └── ...
│
├── types/                        # 应用专用类型定义
│   ├── permission/               # RoleVO, ModuleTreeVO
│   ├── user/                     # MemberListVO, MemberDetailVO
│   ├── university/               # UniversityListVO, UniversityQueryDTO
│   └── ...
│
├── components/                   # 应用级公共组件
│   ├── CommonTable/
│   └── DictSelect/
│
├── layout/                       # 布局组件
├── router/modules/               # 按模块划分路由
└── store/modules/                # Pinia 状态 (user.ts, app.ts)
```

---

## 模块子包命名

与后端保持高度一致，共 **15 个模块**：

| 模块 | 子包名 | Admin | User | 说明 |
|------|--------|:-----:|:----:|------|
| 认证 | auth | ✓ | ✓ | 登录/Token |
| 系统 | system | ✓ | - | 控制面板/系统设置/操作记录 |
| 首页管理 | home | ✓ | - | 公告/规划师/培训机构 |
| 权限管理 | permission | ✓ | - | 角色/模块/管理员 |
| 用户管理 | user | ✓ | ✓ | 用户列表/订单/佣金 |
| 院校 | university | ✓ | ✓ | 院校列表/详情/院系 |
| 资源 | resource | ✓ | ✓ | 资源列表 |
| 专业 | major | ✓ | ✓ | 专业列表/详情/考研专业 |
| 城市 | city | ✓ | ✓ | 城市列表 |
| 行业 | industry | ✓ | ✓ | 行业列表 |
| 高考算法 | algorithm | ✓ | ✓ | 含二级子包 |
| 特殊通道 | special | ✓ | ✓ | 特殊招生/强基计划 |
| 证书竞赛 | certificate | ✓ | ✓ | 科研竞赛/职业技能证书 |
| 企业 | company | ✓ | - | 企业列表/岗位 |
| 就业 | employment | ✓ | ✓ | 含二级子包 |

### algorithm 二级子包

| 子模块 | 子包名 | 说明 |
|--------|--------|------|
| 专业组管理 | admission | 专业组录取/明细列表 |
| 算法配置管理 | config | 省份改革/院校标签/分数线 |
| 算法约束模块 | constraint | 约束字典/专业约束/安全系数 |

### employment 二级子包

| 子模块 | 子包名 |
|--------|--------|
| 公务员考试管理 | civil |
| 事业编管理 | institution |
| 部队文职管理 | military |
| 选调生管理 | selection |
| 教师招聘管理 | teacher |
| 医疗卫生管理 | healthcare |
| 银行金融管理 | finance |
| 基层服务管理 | grassroots |
| 社区工作管理 | community |
| 公益性岗位管理 | welfare |

---

## 核心业务规范

### 1. 双 Token 认证机制 (核心)

后端采用 Access Token (2h) + Refresh Token (7d) 机制。在 `packages/shared/src/utils/request.ts` 中实现：

**请求拦截**：所有请求头附带 `Authorization: Bearer <Access_Token>`

**响应拦截**：
1. 拦截到 401 状态码，说明 Access Token 过期
2. 阻塞所有后续请求，进入刷新状态
3. 携带 Refresh Token 静默调用 `/api/v1/auth/refresh` 获取新 Token
4. 成功后更新本地 Token，重放之前失败的请求
5. 若 Refresh Token 也失效，清除本地状态，强制跳转 `/login`

### 2. API 路径规范

```text
管理端前缀：/api/v1/admin/{模块}/{资源}
用户端前缀：/api/v1/app/{模块}/{资源}
```

示例：
- 管理端院校分页：`GET /api/v1/admin/university/page`
- 用户端院校查询：`GET /api/v1/app/university/list`

### 3. 统一响应格式

与后端保持一致：

```typescript
// packages/shared/src/types/api.ts
export interface R<T = any> {
  code: number;
  msg: string;
  data: T;
  timestamp: number;
}

export interface BasePageQuery {
  page: number;
  size: number;
}

export interface PageResult<T> {
  total: number;
  records: T[];
}
```

### 4. 错误码规范

```typescript
// packages/shared/src/constants/errorCode.ts
export const ErrorCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,      // 未登录/Token 过期
  FORBIDDEN: 403,         // 无权限
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429, // 请求过于频繁
  SERVER_ERROR: 500,

  // 业务错误码 (从 1000 开始)
  USER_NOT_FOUND: 1001,
  PASSWORD_ERROR: 1002,
  MEMBER_EXPIRED: 1003,
  REQUIRE_PRO: 1004,      // 需要专业版及以上
  REQUIRE_VIP: 1005,      // 需要旗舰版
} as const;
```

---

## VO/DTO 命名规范

与后端保持一致：

| 后缀 | 用途 | 示例 |
|------|------|------|
| `XxxListVO` | 列表页 (字段精简) | `UniversityListVO` |
| `XxxDetailVO` | 详情页 (字段完整) | `UniversityDetailVO` |
| `XxxCardVO` | 卡片展示 (首页/推荐) | `UniversityCardVO` |
| `XxxQueryDTO` | 查询参数 | `UniversityQueryDTO` |
| `XxxAddDTO` | 新增参数 | `UniversityAddDTO` |
| `XxxUpdateDTO` | 更新参数 | `UniversityUpdateDTO` |

**注意**：Admin 端和 User 端的 VO 分别定义，返回字段不同。

### 类型归属原则

| 情况 | 归属位置 | 示例 |
|------|----------|------|
| 两端共用 (认证相关) | `packages/shared/src/types/` | `LoginDTO`, `TokenVO` |
| 公共基类 | `packages/shared/src/types/` | `BasePageQuery` |
| 只有 Admin 用 | `apps/admin/src/types/{模块}/` | `RoleAddDTO` |
| 只有 User 用 | `apps/user/src/types/{模块}/` | `RegisterDTO` |

---

## API 定义示例

```typescript
// apps/admin/src/api/university/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { UniversityListVO, UniversityQueryDTO } from '@/types/university'

export const getUniversityPage = (params: UniversityQueryDTO) => {
  return request.get<R<PageResult<UniversityListVO>>>('/api/v1/admin/university/page', { params })
}

export const addUniversity = (data: UniversityAddDTO) => {
  return request.post<R<void>>('/api/v1/admin/university', data)
}

export const updateUniversity = (id: string, data: UniversityUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/university/${id}`, data)
}

export const deleteUniversity = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/university/${id}`)
}
```

---

## 枚举映射规范

后端大量状态位使用枚举。前端必须定义对应的映射对象：

```typescript
// packages/shared/src/types/enums/memberStatus.ts
export enum MemberStatus {
  NORMAL = 'normal',
  PRO = 'pro',
  VIP = 'vip',
}

// 枚举 -> 中文标签
export const MemberStatusLabel: Record<MemberStatus, string> = {
  [MemberStatus.NORMAL]: '普通用户',
  [MemberStatus.PRO]: '专业版',
  [MemberStatus.VIP]: 'VIP 会员',
}

// 枚举 -> Element Plus Tag 颜色
export const MemberStatusTag: Record<MemberStatus, 'info' | 'warning' | 'success' | 'danger'> = {
  [MemberStatus.NORMAL]: 'info',
  [MemberStatus.PRO]: 'warning',
  [MemberStatus.VIP]: 'success',
}
```

在列表页使用：

```vue
<template>
  <el-tag :type="MemberStatusTag[row.memberType]">
    {{ MemberStatusLabel[row.memberType] }}
  </el-tag>
</template>
```

---

## 命名与视图规范

### 文件命名

- **Vue 组件**：PascalCase (如 `UserDetail.vue`)
- **工具类/TS 文件**：camelCase (如 `request.ts`)
- **目录名**：小写 kebab-case 或 camelCase

### 金额处理

涉及到金额的展示，必须保留 2 位小数：

```typescript
const formatMoney = (value: number) => value.toFixed(2)
```

---

## 路由与权限 (RBAC)

1. **静态路由**：Login、404 等基础路由
2. **动态路由**：根据登录后接口返回的 `Role/Permissions` 动态通过 `router.addRoute` 挂载
3. **无权限菜单**：不可见
4. **直接输入 URL**：需拦截并跳转至 403

---

## UI 组件使用原则

1. **使用 Element Plus 原生组件**，尽量少写自定义 CSS
2. **复杂排版/间距/宽高**：优先使用 Tailwind CSS（如 `flex justify-between items-center mt-4`）
3. **避免在 Vue `<style>` 中写大量基础样式**

---


## 列表页分页规范
分页参数选项：`10, 20, 30, 50, 100`

## 修改后端规矩
唯一要守住的规矩：应用 JVM 还在跑的时候，不要执行 mvn clean / mvnw clean / IDE 的 Rebuild / Build Project。本项目没引入 spring-boot-devtools，没有安全热更新机制，磁盘改写和运行时类加载一旦撞车，就会再次出现 $Builder 缺失这类 NoClassDefFoundError。



---

## Skills 使用技巧

1. **明确需求时**：使用 `superpowers:brainstorming`
2. **系统性调试**：使用 `superpowers:systematic-debugging`
3. **测试驱动开发**：使用 `superpowers:test-driven-development`
4. **计划编写与执行**：使用 `superpowers:writing-plans` / `superpowers:executing-plans`
5. **代码审查**：使用 `superpowers:code-reviewer`
6. **完成前验证**：使用 `superpowers:verification-before-completion`
