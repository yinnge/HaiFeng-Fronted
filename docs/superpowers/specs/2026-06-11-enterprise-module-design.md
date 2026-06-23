# C 端企业管理模块设计文档

## 概述

在 C 端（用户端）实现企业管理 4 个只读接口的前端页面，包括企业列表、企业岗位列表、企业→行业关联、行业→企业关联。

## 页面规划

### 1. 企业列表页 `/enterprise`

**路由**：`/enterprise`，公开访问（无需登录）

**布局**（自上而下）：
- 页面头：返回首页 + 标题"企业探索"
- Banner：简介文字"聚合优质企业信息，助力职业规划..."
- 搜索栏：企业名称模糊搜索 + [搜索] [重置] 按钮
- 精准筛选栏：企业性质(el-select)、企业类型(input)、城市(input)、招聘状态(el-select)
- 卡片网格（3列）：每张卡片展示 Logo（或首字占位）+ 企业名 + 性质标签 + 城市 + 规模 + 主营业务（截断）+ 底部"查看岗位"按钮
- 分页器（page-sizes: 9, 18, 30）

**筛选逻辑**：所有筛选条件 AND 组合，请求参数符合 `EnterpriseQueryDTO`

**数据来源**：`GET /api/v1/app/enterprise/list`

### 2. 企业岗位列表页 `/enterprise/:id/positions`

**路由**：`/enterprise/:id/positions`，需要登录（requiresAuth: true）

**布局**（自上而下）：
- 页面头：返回企业列表 + 企业名称 - 岗位列表
- 企业信息卡片：Logo、企业名、性质、城市、官网链接、规模、主营业务
- 关联行业区块（Pro 功能）：
  - Pro 用户：展示行业标签（点击跳转 `/industry/:id`）
  - 非 Pro 用户：付费墙提示"升级专业版可查看关联行业"
- 岗位卡片列表（无分页，一次返回所有岗位）：
  - 岗位名称 + 招聘类型标签 + 岗位状态标签
  - 岗位标签（圆角标签组）
  - 工作地点 + 薪资范围
  - 申请截止日期 + "去申请"外部链接按钮

**数据来源**：
- 企业信息：从企业列表路由跳转时通过 query 参数传递（name, nature, city, logoUrl, region, scale, mainBusiness）
- 岗位列表：`GET /api/v1/app/enterprise/{enterpriseId}/positions`
- 关联行业：`GET /api/v1/app/enterprise/industries?enterpriseIds={id}`（Pro）

### 3. 行业详情页 - 关联企业区块

**在现有** `views/industry/Detail.vue` **底部新增 section**

布局：
- 标题 "🏢 关联企业"
- Pro 用户：企业列表（每行一个企业，显示名称 + 性质 + 城市 + "查看岗位"按钮）
- 非 Pro 用户：付费墙提示
- 点击企业名或"查看岗位" → 跳转 `/enterprise/{id}/positions`

**数据来源**：
- `GET /api/v1/app/industry/enterprises?industryIds={industryId}`（Pro）

## 文件清单

### 新增
| 文件 | 说明 |
|------|------|
| `apps/user/src/api/enterprise/index.ts` | 企业 API 封装 |
| `apps/user/src/types/enterprise/index.ts` | 企业相关类型 |
| `apps/user/src/views/enterprise/List.vue` | 企业列表页 |
| `apps/user/src/views/enterprise/PositionList.vue` | 企业岗位列表页 |

### 修改
| 文件 | 说明 |
|------|------|
| `apps/user/src/router/index.ts` | 新增 2 条路由 |
| `apps/user/src/views/industry/Detail.vue` | 新增"关联企业"section |

## API 封装

```typescript
const PREFIX = '/api/v1/app/enterprise'

// 企业分页列表（公开）
getEnterpriseList(params: EnterpriseQueryDTO)
  → GET /api/v1/app/enterprise/list

// 企业岗位列表（登录）
getPositions(enterpriseId: number)
  → GET /api/v1/app/enterprise/{enterpriseId}/positions

// 企业→行业（Pro）
getEnterpriseIndustries(enterpriseIds: number[])
  → GET /api/v1/app/enterprise/industries?enterpriseIds=...

// 行业→企业（Pro，挂在 industry API）
getIndustryEnterprises(industryIds: number[])
  → GET /api/v1/app/industry/enterprises?industryIds=...
```

## 权限处理

| 页面/功能 | 权限 | 处理方式 |
|-----------|------|----------|
| 企业列表 | 公开 | 无限制 |
| 岗位列表页 | 登录 | `requiresAuth: true`，路由守卫自动处理 |
| 行业标签(企→行) | Pro | 接口返回403，前端 catch 后显示付费墙 |
| 关联企业(行→企) | Pro | 同上 |
