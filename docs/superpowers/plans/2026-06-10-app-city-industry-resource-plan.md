# C 端城市/行业/资源管理模块 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 5 个 C 端页面：城市列表/详情、行业列表/详情、资源列表

**Architecture:** 遵循现有用户端代码模式，在 `views/` 下按模块建文件夹，`api/` 和 `types/` 对应建模块子目录。使用 Composition API + `<script setup>`，Tailwind CSS 布局，Element Plus 组件。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Tailwind CSS

---

## 文件清单

### 新建文件（13 个）

| 文件路径 | 用途 |
|----------|------|
| `apps/user/src/types/city/index.ts` | 城市 VO/DTO 类型 |
| `apps/user/src/types/industry/index.ts` | 行业 VO/DTO 类型 |
| `apps/user/src/types/resource/index.ts` | 资源 VO/DTO 类型 |
| `apps/user/src/api/city/index.ts` | 城市 API 接口 |
| `apps/user/src/api/industry/index.ts` | 行业 API 接口 |
| `apps/user/src/api/resource/index.ts` | 资源 API 接口 |
| `apps/user/src/views/city/List.vue` | 城市列表页 |
| `apps/user/src/views/city/Detail.vue` | 城市详情页 |
| `apps/user/src/views/industry/List.vue` | 行业列表页 |
| `apps/user/src/views/industry/Detail.vue` | 行业详情页 |
| `apps/user/src/views/resource/List.vue` | 资源列表页 |

### 修改文件（1 个）

| 文件路径 | 用途 |
|----------|------|
| `apps/user/src/router/index.ts` | 追加 5 条路由 |

---

### Task 1: 定义类型文件

**Files:**
- Create: `apps/user/src/types/city/index.ts`
- Create: `apps/user/src/types/industry/index.ts`
- Create: `apps/user/src/types/resource/index.ts`

- [ ] **Step 1: 创建 `types/city/index.ts`**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface CityQueryDTO extends BasePageQuery {
  cityName?: string
  province?: string
  region?: string
}

export interface CityListVO {
  id: number
  cityName: string
  province: string
  region: string
  cityIntro: string
  collegeCount: number
  keyCollegeCount: number
  residentPopulation: number
  gdp: number
}

export interface CityDetailVO {
  cityName: string
  area: number
  subtitle: string
  cityLevel: string
  adminCode: string
  perCapitaGdp: number
  urbanizationRate: number
  ruralPopRatio: number
  agingRate: number
  migrantPopRatio: number
  gdpGrowthRate: number
  fortune500Count: number
  industryStructure: Record<string, any>
  industryDescription: string
  mainIndustries: string[]
  emergingIndustries: string[]
  futurePlan: Record<string, any>
  highEducation: Record<string, any>
  basicEducation: Record<string, any>
  enterpriseStats: Record<string, any>
  housingPriceLevel: Record<string, any>
  rentalCost: Record<string, any>
  housingPolicy: Record<string, any>
  consumption: Record<string, any>
  employment: Record<string, any>
  transportation: Record<string, any>
  medical: Record<string, any>
  culture: Record<string, any>
}
```

- [ ] **Step 2: 创建 `types/industry/index.ts`**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface IndustryQueryDTO extends BasePageQuery {
  category?: string
}

export interface IndustryListVO {
  id: number
  industryName: string
  category: string
  description: string
  annualGrowthRate: number
  marketScale: string
  talentGap: string
  investmentHeat: number
}

export interface IndustryDetailVO {
  industryName: string
  shortDescription: string
  detailedDescription: string
  industryScale: Record<string, any>
  industryTalentDemand: Record<string, any>
  industrySalary: Record<string, any>
  policyInfo: Record<string, any>
  developmentSupportInfo: Record<string, any>
  talentAnalysis: Record<string, any>
  talentPolicy: Record<string, any>
  salaryData: Record<string, any>
}
```

- [ ] **Step 3: 创建 `types/resource/index.ts`**

```typescript
import type { BasePageQuery } from '@haifeng/shared'

export interface ResourceQueryDTO extends BasePageQuery {
  resourceName?: string
  category?: string
}

export interface ResourceListVO {
  id: number
  resourceName: string
  coverUrl: string
  description: string
  category: string
  fileType: string
  viewCount: number
}

export interface ResourceUrlVO {
  resourceUrl: string
  accessCode: string
}
```

---

### Task 2: 创建 API 接口文件

**Files:**
- Create: `apps/user/src/api/city/index.ts`
- Create: `apps/user/src/api/industry/index.ts`
- Create: `apps/user/src/api/resource/index.ts`

- [ ] **Step 1: 创建 `api/city/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { CityListVO, CityQueryDTO, CityDetailVO } from '@/types/city'

const PREFIX = '/api/v1/app/city'

export const getCityList = (params: CityQueryDTO) =>
  request.get<R<PageResult<CityListVO>>>(`${PREFIX}/list`, { params })

export const getCityDetail = (cityId: number) =>
  request.get<R<CityDetailVO>>(`${PREFIX}/${cityId}/detail`)
```

- [ ] **Step 2: 创建 `api/industry/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { IndustryListVO, IndustryQueryDTO, IndustryDetailVO } from '@/types/industry'

const PREFIX = '/api/v1/app/industry'

export const getIndustryCategories = () =>
  request.get<R<string[]>>(`${PREFIX}/categories`)

export const getIndustryList = (params: IndustryQueryDTO) =>
  request.get<R<PageResult<IndustryListVO>>>(`${PREFIX}/list`, { params })

export const getIndustryDetail = (industryId: number) =>
  request.get<R<IndustryDetailVO>>(`${PREFIX}/${industryId}/detail`)
```

- [ ] **Step 3: 创建 `api/resource/index.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ResourceListVO, ResourceQueryDTO, ResourceUrlVO } from '@/types/resource'

const PREFIX = '/api/v1/app/resource'

export const getResourceCategories = () =>
  request.get<R<string[]>>(`${PREFIX}/categories`)

export const getResourceList = (params: ResourceQueryDTO) =>
  request.get<R<PageResult<ResourceListVO>>>(`${PREFIX}/list`, { params })

export const getResourceUrl = (id: number) =>
  request.get<R<ResourceUrlVO>>(`${PREFIX}/${id}/url`)
```

---

### Task 3: 修改路由配置

**Files:**
- Modify: `apps/user/src/router/index.ts`

- [ ] **Step 1: 在 router/index.ts 的 routes 数组中追加 5 条路由**

在 `PostgradMajorList` 路由之后、`NotFound` 路由之前插入：

```typescript
  {
    path: '/city',
    name: 'CityList',
    component: () => import('@/views/city/List.vue'),
    meta: { title: '城市查询' },
  },
  {
    path: '/city/:id',
    name: 'CityDetail',
    component: () => import('@/views/city/Detail.vue'),
    meta: { title: '城市详情', requiresAuth: true },
  },
  {
    path: '/industry',
    name: 'IndustryList',
    component: () => import('@/views/industry/List.vue'),
    meta: { title: '行业探索' },
  },
  {
    path: '/industry/:id',
    name: 'IndustryDetail',
    component: () => import('@/views/industry/Detail.vue'),
    meta: { title: '行业详情', requiresAuth: true },
  },
  {
    path: '/resource',
    name: 'ResourceList',
    component: () => import('@/views/resource/List.vue'),
    meta: { title: '资源下载' },
  },
```

---

### Task 4: 城市列表页

**Files:**
- Create: `apps/user/src/views/city/List.vue`

- [ ] **Step 1: 创建 `views/city/List.vue`**

设计要点：
- Header + 简介 + 搜索栏(城市名模糊 + 省份/地区精准下拉) + 城市卡片网格(3×4) + 分页 + SiteFooter
- 省份下拉使用 `ProvinceOptions` 从 `@haifeng/shared` 导入
- 地区下拉硬编码：['华东','华南','华北','华中','东北','西南','西北','港澳台']
- 卡片显示：城市名、省份、高校数量/重点高校数(橙色高亮)、GDP(保留2位小数)、简介片段
- 点击卡片跳转 `/city/:id`（路由守卫自动处理登录判断）
- 加载状态、空状态、错误提示

参照 `views/university/List.vue` 的代码风格实现。

- [ ] **Step 2: 验证编译**

Run: `cd apps/user && npx vue-tsc --noEmit`

---

### Task 5: 城市详情页

**Files:**
- Create: `apps/user/src/views/city/Detail.vue`

- [ ] **Step 1: 创建 `views/city/Detail.vue`**

设计要点（纵向 Story 布局）：
- Header: 返回 + 城市名
- Hero 区: 城市名（大字）、副标题、城市级别 badge、行政区划代码
  - 三列关键数据：面积(km²) / GDP(亿元) / 常住人口(万人)
- 📊 经济指标卡片: 人均GDP、GDP增速、产业结构(展示一二三产比例)、500强数量
- 👥 人口结构卡片: 城镇化率、农村人口比、老龄化率、流入人口比
- 🏭 产业发展卡片: 主导产业(tag列表)、新兴产业(tag列表)、产业描述全文
- 🏠 生活配套卡片: 房价水平、租房成本、消费水平、住房政策
- 🎓 教育医疗卡片: 高等教育统计、基础教育统计、医疗资源统计
- 🚇 交通文化卡片: 交通数据、文化数据
- 🔮 未来规划卡片: 规划焦点、目标年份
- JSONB 字段如 `industryStructure` 用响应示例中的 key 展示
- 全页面用白色卡片 `rounded-2xl bg-white p-6 shadow-lg border border-gray-100` 包裹

- [ ] **Step 2: 验证编译**

Run: `cd apps/user && npx vue-tsc --noEmit`

---

### Task 6: 行业列表页

**Files:**
- Create: `apps/user/src/views/industry/List.vue`

- [ ] **Step 1: 创建 `views/industry/List.vue`**

设计要点：
- Header + "行业趋势分析"大字(渐变橙标题) + 简介
- 分类 Tag 栏：`onMounted` 时调用 `getIndustryCategories` 获取分类列表
  - 首项为"全部行业"(默认选中)
  - 点击切换选中，重新请求列表
- 行业卡片网格(3×4)：
  - 行业名称、分类标签、年增长率(带↑/↓箭头，绿色/红色)、市场规模、人才缺口、投资热度(进度条)
- 分页 + SiteFooter
- 点击卡片跳转 `/industry/:id`

- [ ] **Step 2: 验证编译**

Run: `cd apps/user && npx vue-tsc --noEmit`

---

### Task 7: 行业详情页

**Files:**
- Create: `apps/user/src/views/industry/Detail.vue`

- [ ] **Step 1: 创建 `views/industry/Detail.vue`**

设计要点：
- Header: 返回 + 行业名
- Hero 区: 行业名 + 简要描述 + 分类标签 + 投资热度(进度条)
  - 增长趋势/市场趋势/人才趋势/投资趋势显示为 ↑/→/↓ 带颜色标签
- 📊 行业规模卡片: 年增长率、市场规模、人才缺口
- 💰 薪资水平卡片: 入门/中级/高级薪资三列 + 全国平均 vs 一线城市对比
- 🧑‍💼 人才分析卡片: 供需比、学历要求、热门岗位tag列表
- 📋 详细描述卡片: 完整描述文本(whitespace-pre-line)
- 🏛️ 政策支持卡片: 国家规划、补贴政策、重点城市

- [ ] **Step 2: 验证编译**

Run: `cd apps/user && npx vue-tsc --noEmit`

---

### Task 8: 资源列表页

**Files:**
- Create: `apps/user/src/views/resource/List.vue`

- [ ] **Step 1: 创建 `views/resource/List.vue`**

设计要点：
- Header + "资源下载专区"大字 + 简介
- 精准分类按钮：`onMounted` 时调用 `getResourceCategories`
  - 首项为"全部"(默认选中)
- 搜索栏：资源名称模糊搜索
- 资料卡片网格(3×4)：
  - 封面图(封面图URL，图片加载失败显示占位)、资源名称、文件类型标签、浏览计数(👁️)、描述片段
  - "立即下载"按钮：
    - 未登录 → 路由守卫自动拦截，弹出登录确认框
    - 已登录 → 调用 `getResourceUrl(id)` → 弹出 dialog 展示百度网盘链接 + 提取码 + 复制按钮
    - 点击后调用 API，后端自动+1计数
- 分页 + SiteFooter

- [ ] **Step 2: 验证编译**

Run: `cd apps/user && npx vue-tsc --noEmit`

---

## 需要确认的点

1. 地区筛选的下拉选项（region）写死为：`['华东','华南','华北','华中','东北','西南','西北','港澳台']`——根据 SQL 注释
2. 资源列表页中点击"立即下载"→ 未登录时由路由守卫自动弹登录确认框（已实现）
3. 行业趋势 tag 的↑/↓/→ 颜色：上升=绿色，下降=红色，稳定=灰色
