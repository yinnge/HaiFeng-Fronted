# 基层服务/社区/公益招聘页面设计

## 概述

在 C 端就业模块新增三个子模块：基层服务项目岗位、社区工作者岗位、公益性岗位，支持列表查询、筛选、分页和详情查看。统一岗位搜索页对应 tab 点击后跳转至专用列表页。

## 架构

沿用教师/医疗/金融模式：`List.vue` + `Detail.vue` + API + Types + 路由。

### 目录结构

```
apps/user/src/
├── api/employment/
│   ├── grassroots/index.ts          # 基层服务 API
│   ├── community/index.ts           # 社区 API
│   └── welfare/index.ts             # 公益 API
├── types/employment/
│   ├── grassroots/index.ts          # 基层服务类型
│   ├── community/index.ts           # 社区类型
│   └── welfare/index.ts             # 公益类型
├── views/employment/
│   ├── grassroots/List.vue          # 基层服务列表
│   ├── grassroots/Detail.vue        # 基层服务详情
│   ├── community/List.vue           # 社区列表
│   ├── community/Detail.vue         # 社区详情
│   ├── welfare/List.vue             # 公益列表
│   └── welfare/Detail.vue           # 公益详情
└── router/index.ts                  # 新增 6 条路由
```

### 路由

| 路径 | 组件 | 认证 |
|------|------|------|
| `/employment/grassroots` | List.vue | ❌ |
| `/employment/grassroots/:id` | Detail.vue | ✅ |
| `/employment/community` | List.vue | ❌ |
| `/employment/community/:id` | Detail.vue | ✅ |
| `/employment/welfare` | List.vue | ❌ |
| `/employment/welfare/:id` | Detail.vue | ✅ |

### 修改统一搜索页

`jobs/index.vue` 中 `onCategoryTabClick` 增加三个跳转：
- 基层服务 → `/employment/grassroots`
- 社区 → `/employment/community`
- 公益岗 → `/employment/welfare`

## API 路径

| 模块 | 列表 | 详情 |
|------|------|------|
| 基层服务 | `GET /api/v1/app/employment/grassroots/project/list` | `GET /api/v1/app/employment/grassroots/project/{id}/detail` |
| 社区 | `GET /api/v1/app/employment/grassroots/community/list` | `GET /api/v1/app/employment/grassroots/community/{id}/detail` |
| 公益 | `GET /api/v1/app/employment/grassroots/welfare/list` | `GET /api/v1/app/employment/grassroots/welfare/{id}/detail` |

## 筛选字段

### 基层服务项目岗位

LIKE: positionName, organizingDept, serviceUnit
精确: projectType, year, serviceType, province/city/county, educationRequirement, majorRequirement, gradYearRequirement, targetGroup, maxServiceYears, politicalStatus, positionStatus
范围: ageLimitMin, ageLimitMax

### 社区工作者

LIKE: positionName, streetOffice, communityName, supervisingDept
精确: positionType, employmentType, province/city, educationRequirement, majorRequirement, politicalStatus, workExperience, positionStatus
范围: ageLimitMin, ageLimitMax

### 公益性岗位

LIKE: positionName, developingUnit, employingUnit
精确: positionCategory, province/city/district, educationRequirement, householdRequirement, maxServiceYears, positionStatus, targetGroup
范围: ageRangeMin, ageRangeMax

## 列表卡片布局

三段式：头部(tag + 状态标签) → 主体(岗位名 + 单位 + 关键信息) → 底部(报名日期 + 查看详情)。参照教师列表样式。

## 详情页结构

四个区块：岗位概要 → 详细信息 → 待遇与政策/考试 → 报名信息，参照教师详情样式。
