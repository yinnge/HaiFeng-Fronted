# C 端竞赛证书管理模块 — 设计文档

## 概述

为 C 端用户（海枫未来规划院前端用户端）新增「竞赛证书管理」功能，包含职业技能证书浏览、竞赛浏览及详情、竞赛↔专业双向关联展示。

## 路由规划

| 路径 | 组件 | 标题 | 权限 |
|------|------|------|------|
| `/certificate` | `views/certificate/List.vue` | 职业技能证书 | 公开 |
| `/competition` | `views/competition/List.vue` | 大学科研与竞赛 | 公开 |
| `/competition/:id` | `views/competition/Detail.vue` | 竞赛详情 | 需登录 |

**修改已有路由：**
- `/major/:id` → 专业详情页底部新增「关联竞赛」板块

## 新增文件清单

### API (`apps/user/src/api/certificate/index.ts`)
封装 7 个接口：
1. `getCertificateCategories()` → `GET /api/v1/app/certificate/categories`
2. `getCertificateList(params)` → `GET /api/v1/app/certificate/list`
3. `getCertificateDetail(certId)` → `GET /api/v1/app/certificate/{certId}/detail`
4. `getCompetitionList(params)` → `GET /api/v1/app/competition/list`
5. `getCompetitionDetail(compId)` → `GET /api/v1/app/competition/{compId}/detail`
6. `getCompetitionMajors(compId, params)` → `GET /api/v1/app/competition/{compId}/majors` (Pro)
7. `getMajorCompetitions(majorId, params)` → `GET /api/v1/app/major/{majorId}/competitions` (Pro)

### 类型 (`apps/user/src/types/certificate/index.ts`)
- `CertificateListVO` — 对应后端 CertificateListVO
- `CertificateDetailVO` — 对应后端 CertificateDetailVO
- `CompetitionListVO` — 对应后端 CompetitionListVO
- `CompetitionDetailVO` — 对应后端 CompetitionDetailVO（含 JSONB 字段：basicInfo, awards, background, purposes, competitionRules, scoringCriteria, notices, processGuide, awardsDisplay）
- `CompetitionMajorBriefVO` — 竞赛→专业列表
- `CompetitionBriefVO` — 专业→竞赛列表
- `CertificateQueryDTO` / `BasePageQuery` — 查询参数

### 组件
- `views/certificate/List.vue` — 职业技能证书页面
- `views/competition/List.vue` — 竞赛列表页面
- `views/competition/Detail.vue` — 竞赛详情页面（含关联专业板块）

## 页面详细设计

### 1. 职业技能证书页面 (`/certificate`)

**布局结构（从上到下）：**

```
┌─ Sticky Header (返回首页 + "职业技能证书" 标题) ─────────────────┐
├─ 引导横幅 (橙色渐变卡片，介绍文字)                                 │
├─ 分类精准筛选 (按钮式切换，默认选中第一个)                          │
│   [IT类] [工程类] [语言类] [财会类]                              │
├─ 证书列表 (卡片或表格) ──────────────────────────────────────────│
│   名称 | 分类 | 级别 | 费用 | 考试时间 | 操作                    │
│   ─────────────────────────────────────────────────             │
│   软件设计师 | 计算机 | 中级 | ¥100 | 上半年5月 | [报名指南]      │
├─ 分页 (el-pagination) ──────────────────────────────────────────│
└──────────────────────────────────────────────────────────────────┘
```

**功能要点：**
- 分类筛选：从 `getCertificateCategories()` 获取分类列表，按钮式切换（参考专业列表的"本科/专科"切换样式）；选中某分类后调用 `getCertificateList({ category })`；默认选中第一个分类
- 证书名称模糊搜索：输入框 + 搜索按钮
- 证书列表：表格展示 id / certName / category / certLevel / examFee / examTime
- "报名指南"按钮 → 弹出 `ElDialog`，调用 `getCertificateDetail(certId)` 显示完整详情（examRequirements 列表、examArrangement、officialWebsite）
- 错误提示：使用 `ElMessage.error`
- 公开页面，无需登录

### 2. 竞赛列表页 (`/competition`)

**布局结构（从上到下）：**

```
┌─ Sticky Header (返回首页 + "大学科研与竞赛" 标题) ────────────────┐
├─ 引导横幅 (介绍文字)                                              │
├─ 学术竞赛的价值 (写死内容)                                        │
│   ┌──────────────────────────────────────────────────────┐      │
│   │ 提升综合素质、培养创新能力... (写死)                   │      │
│   └──────────────────────────────────────────────────────┘      │
├─ 竞赛列表 (表格) ───────────────────────────────────────────────│
│   名称 | 级别 | 报名时间 | 操作                                 │
│   ─────────────────────────────────────────────────             │
│   蓝桥杯... | 国家级 | 上半年3-4月 | [查看详情]                 │
├─ 分页 (每页10条)                                                │
├─ SiteFooter                                                     │
└──────────────────────────────────────────────────────────────────┘
```

**功能要点：**
- 竞赛列表：`getCompetitionList({ page, size })`，每页 10 条
- "查看详情" → 跳转 `/competition/:id`
- 公开页面，无需登录
- SiteFooter 与 MajorList 等一致

### 3. 竞赛详情页 (`/competition/:id`)

**布局结构（从上到下）：**

```
┌─ Sticky Header (返回 + 竞赛名称) ────────────────────────────────┐
├─ 竞赛基本信息 (白色卡片)                                          │
│   basicInfo 键值对渲染                                           │
│   主办方：xxx  年份：2024                                        │
│   官网链接 (可点击跳转)                                          │
├─ 详情板块 (多个 Motion 动画卡片) ────────────────────────────────│
│   ├─ 赛事背景 (background)                                       │
│   ├─ 赛事宗旨 (purposes 标签列表)                                │
│   ├─ 奖项 (awards 标签列表)                                      │
│   ├─ 竞赛规则 (competitionRules: title+content 卡片列表)          │
│   ├─ 评分标准 (scoringCriteria 条目列表)                         │
│   ├─ 注意事项 (notices 条目列表)                                 │
│   ├─ 参赛流程 (processGuide: step+desc 步骤列表)                 │
│   └─ 奖项展示 (awardsDisplay: level+count 表格)                  │
├─ 关联专业 (Pro权限) ─────────────────────────────────────────────│
│   [Pro] 专业名称列表 | 分页 | 可跳转专业详情                     │
│   非Pro: "🔒 开通专业版，查看关联专业" 升级提示                   │
├─ SiteFooter                                                     │
└──────────────────────────────────────────────────────────────────┘
```

**功能要点：**
- 调用 `getCompetitionDetail(compId)` → 渲染所有 JSONB 字段
- 关联专业：`getCompetitionMajors(compId, { page, size })`；需 Pro 权限，非 Pro 展示升级引导（参考 MajorList 排行区的样式）
- 专业名可点击跳转到 `/major/:majorId`
- 需登录

### 4. 专业详情页改造 (`/major/:id`)

在现有"主要课程 & 知识技能"板块**之后**插入：

```
├─ 关联竞赛 (Pro权限) ─────────────────────────────────────────────│
│   [Pro] 竞赛名称列表 | 分页 | 可跳转竞赛详情                     │
│   非Pro: "🔒 开通专业版，查看关联竞赛" 升级提示                   │
└──────────────────────────────────────────────────────────────────┘
```

- 调用 `getMajorCompetitions(majorId, { page, size })` → 渲染竞赛列表
- 竞赛名可点击跳转到 `/competition/:competitionId`
- 需 Pro 权限

## 设计一致性

| 项目 | 规则 |
|------|------|
| 背景色 | `bg-gradient-to-b from-slate-50 to-white` |
| 卡片容器 | `rounded-2xl bg-white p-6 shadow-lg border border-gray-100` |
| 按钮主色 | `bg-gradient-to-r from-orange-500 to-amber-500` |
| 引导横幅 | `rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100` |
| 动画 | `Motion` fade-in（optional，参考现有页面） |
| 加载 | `v-loading` + `el-pagination` |
| 错误提示 | `ElMessage.error` |
| 权限不足 | 橙色升级引导卡片 + "立即升级" 按钮跳 `/profile` |
| 分页参数 | pageSizes: [10, 20, 30, 50, 100] |

## JSONB 字段渲染对照

| 后端字段 | 前端渲染方式 | 空值处理 |
|----------|-------------|---------|
| basicInfo | `Map` → 键值对表格/列表 | 整块隐藏 |
| awards | `List<String>` → 标签 | 隐藏 |
| background | `String` → 段落文本 | 隐藏 |
| purposes | `List<String>` → 标签 | 隐藏 |
| competitionRules | `List<{title, content}>` → 卡片列表 | 隐藏 |
| scoringCriteria | `List<String>` → 条目列表 | 隐藏 |
| notices | `List<String>` → 条目列表 | 隐藏 |
| processGuide | `List<{step, desc}>` → 步骤列表 | 隐藏 |
| awardsDisplay | `List<{level, count}>` → 表格 | 隐藏 |
