# C 端统一岗位搜索页面 - 设计文档

## 概述

在用户端（`apps/user/`）新增统一岗位搜索页面，聚合公务员、事业编、军队文职、企业招聘、选调生、教师、医疗卫生、金融银行、基层服务、社区工作者、公益岗等全站岗位的搜索/筛选/详情入口。

---

## 1. 路由与导航

| 路径 | 组件 | 名称 | 权限 |
|------|------|------|------|
| `/employment/jobs` | `views/employment/jobs/index.vue` | EmploymentJobList | 公开 |
| `/employment/job/:id` | `views/employment/job/Detail.vue` | EmploymentJobDetail | 需登录 |

导航栏添加「岗位搜索」链接，指向 `/employment/jobs`。

---

## 2. 页面结构（自上而下）

```
[Header - 现有 sticky header + 岗位搜索链接]
  │
[引导区 - 标题 + 简介文案]
  │
[分类 Tab 行 - 全部 / 公务员 / 事业编 / ...]
  │
[模糊搜索行 - 输入框 + 搜索按钮]
  │
[精准筛选行 - 5个下拉框 + 重置按钮]
  │
[结果统计 - 共找到 XX 个岗位]
  │
[岗位卡片列表 - 10条/页，Element Plus 分页]
  │
[SiteFooter]
```

### 2.1 引导区

静态文案：
```
🎯 统一岗位搜索
全站岗位一站式聚合，公务员、事业编、企业招聘等各类岗位，助你找到理想工作
```

### 2.2 分类 Tab

| source_type | categoryLabel | Tab 显示 | 点击参数 |
|---|---|---|---|
| - | - | 全部 | categoryLabel=空 |
| civil | 公务员 | 公务员 | categoryLabel=公务员 |
| institution | 事业编 | 事业编 | categoryLabel=事业编 |
| military | 军队文职 | 军队文职 | categoryLabel=军队文职 |
| enterprise | 企业招聘 | 企业招聘 | categoryLabel=企业招聘 |
| selection | 选调生 | 选调生 | categoryLabel=选调生 |
| teacher | 教师招聘 | 教师 | categoryLabel=教师 |
| healthcare | 医疗卫生 | 医疗卫生 | categoryLabel=医疗卫生 |
| finance | 金融银行 | 金融银行 | categoryLabel=金融银行 |
| grassroots | 基层服务 | 基层服务 | categoryLabel=基层服务 |
| community | 社区工作者 | 社区 | categoryLabel=社区工作者 |
| public_welfare | 公益岗 | 公益岗 | categoryLabel=公益岗 |

点击 Tab 时，设置 categoryLabel 参数并重新请求列表。选中状态高亮。

### 2.3 模糊搜索

- 输入框 placeholder: `输入岗位名称或企业名称`
- 搜索按钮: 橙色渐变 `from-orange-500 to-amber-500`
- 支持回车触发搜索
- 参数名: `keyword`

### 2.4 精准筛选行

一行展示 5 个下拉框 + 1 个重置按钮：

| 下拉框 | 参数 | 选项 |
|--------|------|------|
| 省份/城市 | province | 使用 `@haifeng/shared` 的 `ProvinceOptions` |
| 学历要求 | educationRequirement | 不限 / 大专 / 本科 / 硕士 / 博士 |
| 招聘类型 | recruitmentType | 不限 / 国考 / 省考 / 校招 / 社招 / 春招 / 秋招 |
| 岗位状态 | positionStatus | 不限 / 招聘中 / 已结束 / 即将开始 |
| 薪资范围 | salaryMin + salaryMax | 不限 / 5k以下 / 5k-10k / 10k-20k / 20k以上 |

薪资档位映射：
```
不限 → salaryMin=null, salaryMax=null
5k以下 → salaryMin=null, salaryMax=5
5k-10k → salaryMin=5, salaryMax=10
10k-20k → salaryMin=10, salaryMax=20
20k以上 → salaryMin=20, salaryMax=null
```

重置按钮：清空所有筛选条件并重新请求第一页。

### 2.5 岗位卡片列表

卡片信息展示（从左到右）：
```
[分类标签] [岗位状态标签]
岗位名称
单位名称 · 城市 · 学历 · 薪资
[招聘类型标签]
[查看详情 →]
```

- 默认按 `publish_date DESC` 排序
- 每页 10 条
- 分页器 Element Plus `el-pagination`，可选值 10/20/30/50/100

### 2.6 详情页

点击卡片「查看详情」：
- 已登录 → 跳转 `/employment/job/:id`
- 未登录 → 弹出 `ElMessageBox.confirm`「请先登录查看详情」，确认后跳转 `/login`

---

## 3. API

### 3.1 后端新增参数

**JobSearchDTO.java** 新增字段：
```java
private String categoryLabel;
```

**JobIndexServiceImpl.java** 新增条件：
```java
wrapper.eq(StrUtil.isNotBlank(dto.getCategoryLabel()), JobIndex::getCategoryLabel, dto.getCategoryLabel());
```

### 3.2 前端 API

新建 `apps/user/src/api/employment/jobIndex/index.ts`：

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'

export interface JobSearchDTO {
  page?: number
  size?: number
  keyword?: string
  province?: string
  city?: string
  educationRequirement?: string
  recruitmentType?: string
  salaryMin?: number
  salaryMax?: number
  positionStatus?: string
  categoryLabel?: string
}

export interface JobIndexListVO {
  id: number
  categoryLabel: string
  positionName: string
  organizationName: string
  city: string
  educationRequirement: string
  recruitmentType: string
  salaryText: string
  positionStatus: string
}

export const getJobList = (params: JobSearchDTO) => {
  return request.get<R<PageResult<JobIndexListVO>>>('/api/v1/app/employment/job/list', { params })
}

export const getJobDetail = (id: number) => {
  return request.get<R<JobIndexDetailVO>>(`/api/v1/app/employment/job/${id}/detail`)
}
```

### 3.3 类型定义

新建 `apps/user/src/types/employment/jobIndex/index.ts`：

```typescript
export interface JobSearchDTO {
  page?: number
  size?: number
  keyword?: string
  province?: string
  city?: string
  educationRequirement?: string
  recruitmentType?: string
  salaryMin?: number
  salaryMax?: number
  positionStatus?: string
  categoryLabel?: string
}

export interface JobIndexListVO {
  id: number
  categoryLabel: string
  positionName: string
  organizationName: string
  city: string
  educationRequirement: string
  recruitmentType: string
  salaryText: string
  positionStatus: string
}

export interface JobIndexDetailVO {
  id: number
  sourceType: string
  sourceId: number
  categoryLabel: string
  positionName: string
  organizationName: string
  organizationLogo: string
  province: string
  city: string
  educationRequirement: string
  recruitmentCount: number
  recruitmentType: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  positionStatus: string
  publishDate: string
  regDeadline: string
  isHot: boolean
  viewCount: number
  applyCount: number
}
```

---

## 4. 组件新建清单

```
apps/user/src/
├── api/employment/
│   └── jobIndex/index.ts          # API 接口
├── types/employment/
│   └── jobIndex/index.ts          # 类型定义
├── views/employment/
│   ├── jobs/index.vue             # 列表页
│   └── job/Detail.vue             # 详情页
└── router/index.ts                # 新增两个路由
```

---

## 5. 视觉设计

- 整体风格延续首页：`bg-gradient-to-b from-slate-50 to-white`
- Header 复用现有 sticky header 样式
- 分类 Tab：圆角 pill 样式，选中态橙色背景
- 输入框：圆角 + 橙色 focus 边框
- 卡片：`rounded-2xl bg-white p-6 shadow-lg border border-gray-100`
- 按钮：`bg-gradient-to-r from-orange-500 to-amber-500`
- 列表空态：「暂无岗位」
- Footer 复用 `SiteFooter`

---

## 6. 错误处理

- API 请求失败 → `ElMessage.error('错误信息')`
- 详情页 404 → `ElMessage.error('岗位不存在')` + 返回列表页
- 详情页 401 → 路由守卫自带登录提示
