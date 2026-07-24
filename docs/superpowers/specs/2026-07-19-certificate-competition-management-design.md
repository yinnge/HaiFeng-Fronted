# 竞赛证书管理模块 - 前端设计规格

## 概述

竞赛证书管理模块为管理员提供职业技能证书、学科竞赛信息的增删改查功能，支持竞赛与专业的多对多关联管理。共 3 个子页面：

| 页面 | 路由 | 模块编码 | API 前缀 |
|------|------|---------|---------|
| 证书管理 | `/certificate/certificate` | `certificate_info` | `/api/v1/admin/certificate` |
| 竞赛管理 | `/certificate/competition` | `certificate_comp` | `/api/v1/admin/competition` |
| 竞赛-专业关联 | `/certificate/competition-major` | `cert_comp_major` | `/api/v1/admin/competition-major` |

## 导航结构

顶级父模块：**证书竞赛**（level=1）
```
证书竞赛 (certificate)
  ├── 证书管理 (certificate_info)  → /certificate/certificate
  ├── 竞赛管理 (certificate_comp)  → /certificate/competition
  └── 竞赛-专业关联 (cert_comp_major) → /certificate/competition-major
```

参考首页管理（home）的导航模式：父级菜单 + 3 个子菜单项。

## 文件清单

按照项目 DDD 规范，新建以下文件：

```
apps/admin/src/
├── api/certificate/
│   ├── certificate.ts          # 证书管理 API
│   ├── competition.ts          # 竞赛管理 API
│   └── competitionMajor.ts     # 竞赛-专业关联 API
├── types/certificate/
│   ├── certificate.ts          # 证书类型定义
│   ├── competition.ts          # 竞赛类型定义
│   └── competitionMajor.ts     # 竞赛-专业关联类型定义
├── views/certificate/
│   ├── certificate/index.vue   # 证书管理页面
│   ├── competition/index.vue   # 竞赛管理页面
│   └── competition-major/index.vue  # 竞赛-专业关联页面
└── router/modules/
    └── certificate.ts          # 证书竞赛模块路由
```

修改文件：
- `apps/admin/src/router/index.ts` — 引入并注册 certificateRoutes

## 页面详细设计

### 通用约定

- 所有页面参考首页模块（announcement）的布局风格：白色圆角卡片 + 搜索栏 + 操作栏 + 表格 + 分页
- 分页参数：`[10, 20, 30, 50, 100]`
- 报错信息通过 `ElMessage.error()` 展示
- 操作成功通过 `ElMessage.success()` 提示
- 软删除/硬删除/批量删除前使用 `ElMessageBox.confirm()` 二次确认
- 无「状态」字段，无「排序」字段，无「禁用/启用」按钮
- 所有删除按钮文案区分：软删除显示"软删除"，硬删除显示"硬删除"，批量硬删除显示"批量硬删除"

### 页面 1：证书管理

**路由：** `/certificate/certificate`
**模块编码：** `certificate_info`

**搜索栏（行内表单）：**
- 证书名称：`el-input`，模糊搜索，placeholder="证书名称"
- 证书分类：`el-select`，精确查询，placeholder="全部分类"
- 证书等级：`el-select`，精确查询，placeholder="全部等级"
- 适用专业：`el-input`，模糊搜索，placeholder="适用专业"
- 查询按钮、重置按钮

**操作栏：**
- 新增证书按钮（`el-button type="primary"`）
- 刷新按钮
- 批量硬删除按钮（`el-button type="danger"`，选中行后启用）

**表格列：**
| 列 | 宽度 | 说明 |
|----|------|------|
| 复选框 | 50px | 用于批量操作 |
| ID | 140px | |
| 证书名称 | 150px | |
| 分类 | 100px | |
| 等级 | 100px | |
| 适用专业 | 150px | show-overflow-tooltip |
| 报名时间 | 150px | |
| 考试时间 | 150px | |
| 考试费用(元) | 100px | |
| 更新时间 | 180px | |
| 操作 | 280px(固定) | 详情/修改/软删除/硬删除 |

**操作按钮（每行）：**
- 详情（`el-button type="primary" link`）
- 修改（`el-button type="warning" link`）
- 软删除（`el-button type="info" link`）→ 确认文案："确定要软删除该证书吗？数据将保留可恢复。"
- 硬删除（`el-button type="danger" link`）→ 确认文案："确定要硬删除该证书吗？数据不可恢复！"

**Dialog：**
- 详情模式：`el-descriptions` 展示全部字段（含 certIntro, examRequirements 列表, examArrangement, officialWebsite）
- 新增/修改模式：`el-form` 表单字段对应 API 参数
  - certName（必填，最长150）
  - category（选填，最长50）
  - certLevel（选填，最长50）
  - applicableMajor（选填，最长200）
  - registrationTime（选填，最长100）
  - examTime（选填，最长100）
  - examFee（选填，数字 ≥0）
  - certIntro（选填，textarea）
  - examRequirements（选填，动态增减列表）
  - examArrangement（选填，textarea）
  - officialWebsite（选填，最长500）

### 页面 2：竞赛管理

**路由：** `/certificate/competition`
**模块编码：** `certificate_comp`

**搜索栏（行内表单）：**
- 竞赛名称：`el-input`，模糊搜索
- 竞赛级别：`el-select`，精确查询（国家级/省级/校级）
- 查询按钮、重置按钮

**操作栏：**
- 新增竞赛按钮
- 刷新按钮
- 批量硬删除按钮

**表格列：**
| 列 | 宽度 | 说明 |
|----|------|------|
| 复选框 | 50px | |
| ID | 140px | |
| 竞赛名称 | 200px | show-overflow-tooltip |
| 竞赛级别 | 100px | |
| 报名时间 | 150px | |
| 更新时间 | 180px | |
| 操作 | 280px(固定) | 详情/修改/软删除/硬删除 |

**操作按钮（每行）：**
- 详情（`el-button type="primary" link`）
- 修改（`el-button type="warning" link`）
- 软删除（`el-button type="info" link`）→ 级联软删除详情和关联
- 硬删除（`el-button type="danger" link`）→ 级联硬删除

**详情弹窗：**
- 基础信息（el-descriptions）：竞赛名称、竞赛级别、报名时间、创建时间、更新时间
- 折叠面板（el-collapse）：
  - 基本信息：主办方、举办时间、参赛对象、参赛形式、级别、报名费、官网、联系邮箱、联系电话
  - 奖项设置：列表展示
  - 竞赛背景与意义：文字展示
  - 竞赛目的：列表展示
  - 竞赛规则：title-content 键值对展示
  - 评分标准：列表展示
  - 注意事项：列表展示
  - 参赛流程指南：title-content 键值对展示

**新增/修改 Dialog：**
- 竞赛名称（必填，最长200）
- 竞赛级别（选填）
- 报名时间（选填，最长100）
- detail 对象（选填，折叠在高级设置中）：
  - basicInfo（Map，键值对动态添加）
  - awards（动态增减列表）
  - background（textarea）
  - purposes（动态增减列表）
  - competitionRules（title+content 动态增减）
  - scoringCriteria（动态增减列表）
  - notices（动态增减列表）
  - processGuide（title+content 动态增减）
  - awardsDisplay（title+content 动态增减）

### 页面 3：竞赛-专业关联

**路由：** `/certificate/competition-major`
**模块编码：** `cert_comp_major`

**搜索栏（行内表单）：**
- 竞赛名称：`el-input`，模糊搜索
- 专业名称：`el-input`，模糊搜索
- 按竞赛ID查询：`el-button`，点击弹出输入竞赛ID的对话框，调用 `/by-competition/{id}`
- 按专业ID查询：`el-button`，点击弹出输入专业ID的对话框，调用 `/by-major/{id}`
- 查询按钮、重置按钮

**操作栏：**
- 新增关联按钮
- 刷新按钮
- 批量删除按钮（软删除）

**表格列：**
| 列 | 宽度 | 说明 |
|----|------|------|
| 复选框 | 50px | |
| ID | 140px | |
| 竞赛名称 | 200px | |
| 专业名称 | 150px | |
| 创建时间 | 180px | |
| 操作 | 200px(固定) | 详情/软删除 |

**操作按钮（每行）：**
- 详情（`el-button type="primary" link`）→ 弹窗展示竞赛ID、专业ID、竞赛名称、专业名称、创建时间
- 软删除（`el-button type="danger" link`）→ 确认后设置 is_deleted=true

**新增 Dialog：**
- 竞赛名称（必填，用于查找竞赛ID）
- 专业名称（必填，用于查找专业ID）
- 后端根据名称查找 ID 并创建关联

**按ID查询 Dialog：**
- 输入竞赛ID 或 专业ID
- 确认后调用专用查询接口，结果覆盖当前表格

## 删除机制说明

| 页面 | 软删除 | 硬删除 | 批量硬删除 | 批量软删除 |
|------|--------|--------|-----------|-----------|
| 证书管理 | DELETE /soft/{id} | DELETE /hard/{id} | POST /batch/delete | - |
| 竞赛管理 | DELETE /soft/{id}(级联) | DELETE /hard/{id}(级联) | POST /batch/delete(级联) | - |
| 竞赛-专业关联 | DELETE /{id}(软删除) | - | - | POST /batch/delete(软删除) |

- 软删除文案："确定要软删除该{名称}吗？数据将保留可恢复。"
- 硬删除文案："确定要硬删除该{名称}吗？数据不可恢复！"
- 批量删除文案："确定要批量删除选中的{数量}条记录吗？"

## 路由设计

```typescript
// router/modules/certificate.ts
const certificateRoutes: RouteRecordRaw = {
  path: '/certificate',
  name: 'Certificate',
  meta: { title: '证书竞赛', icon: 'TrophyBase' },
  redirect: '/certificate/certificate',
  children: [
    {
      path: 'certificate',
      name: 'CertificateInfo',
      component: () => import('@/views/certificate/certificate/index.vue'),
      meta: { title: '证书管理', moduleCode: 'certificate_info' },
    },
    {
      path: 'competition',
      name: 'CertificateComp',
      component: () => import('@/views/certificate/competition/index.vue'),
      meta: { title: '竞赛管理', moduleCode: 'certificate_comp' },
    },
    {
      path: 'competition-major',
      name: 'CertificateCompMajor',
      component: () => import('@/views/certificate/competition-major/index.vue'),
      meta: { title: '竞赛-专业关联', moduleCode: 'cert_comp_major' },
    },
  ],
}
```

## 类型定义

### 证书类型 (`types/certificate/certificate.ts`)

```typescript
export interface CertificateListVO {
  id: number
  certName: string
  category: string | null
  certLevel: string | null
  applicableMajor: string | null
  registrationTime: string | null
  examTime: string | null
  examFee: number | null
  updatedAt: string
}

export interface CertificateDetailVO extends CertificateListVO {
  certIntro: string | null
  examRequirements: string[]
  examArrangement: string | null
  officialWebsite: string | null
  createdAt: string
}

export interface CertificateQueryDTO {
  certName?: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  page: number
  size: number
}

export interface CertificateAddDTO {
  certName: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  registrationTime?: string
  examTime?: string
  examFee?: number
  certIntro?: string
  examRequirements?: string[]
  examArrangement?: string
  officialWebsite?: string
}

export interface CertificateUpdateDTO extends CertificateAddDTO {
  id: number
}
```

### 竞赛类型 (`types/certificate/competition.ts`)

```typescript
export interface CompetitionListVO {
  id: number
  compName: string
  compLevel: string | null
  registrationTime: string | null
  updatedAt: string
}

export interface CompetitionDetailVO extends CompetitionListVO {
  detailId: number
  basicInfo: Record<string, any>
  awards: string[]
  background: string | null
  purposes: string[]
  competitionRules: { title: string; content: string }[]
  scoringCriteria: string[]
  notices: string[]
  processGuide: { title: string; content: string }[]
  awardsDisplay: { title: string; content: string }[]
  createdAt: string
}

export interface CompetitionQueryDTO {
  compName?: string
  compLevel?: string
  page: number
  size: number
}

export interface CompetitionAddDTO {
  compName: string
  compLevel?: string
  registrationTime?: string
  detail?: CompetitionDetailDTO
}

export interface CompetitionUpdateDTO extends CompetitionAddDTO {
  id: number
}

export interface CompetitionDetailDTO {
  basicInfo?: Record<string, any>
  awards?: string[]
  background?: string
  purposes?: string[]
  competitionRules?: { title: string; content: string }[]
  scoringCriteria?: string[]
  notices?: string[]
  processGuide?: { title: string; content: string }[]
  awardsDisplay?: { title: string; content: string }[]
}
```

### 竞赛-专业关联类型 (`types/certificate/competitionMajor.ts`)

```typescript
export interface CompetitionMajorListVO {
  id: number
  competitionId: number
  majorId: number
  competitionName: string
  majorName: string
  createdAt: string
}

export interface CompetitionMajorQueryDTO {
  competitionId?: number
  majorId?: number
  competitionName?: string
  majorName?: string
  page: number
  size: number
}

export interface CompetitionMajorAddDTO {
  competitionName: string
  majorName: string
}
```

## API 定义

### 证书 API (`api/certificate/certificate.ts`)

```
GET    /api/v1/admin/certificate/list       → getCertificatePage(params)
GET    /api/v1/admin/certificate/{id}       → getCertificateDetail(id)
POST   /api/v1/admin/certificate/add        → addCertificate(data)
PUT    /api/v1/admin/certificate/update      → updateCertificate(data)
DELETE /api/v1/admin/certificate/soft/{id}  → softDeleteCertificate(id)
DELETE /api/v1/admin/certificate/hard/{id}  → hardDeleteCertificate(id)
POST   /api/v1/admin/certificate/batch/delete → batchDeleteCertificate(ids)
```

### 竞赛 API (`api/certificate/competition.ts`)

```
GET    /api/v1/admin/competition/list       → getCompetitionPage(params)
GET    /api/v1/admin/competition/{id}       → getCompetitionDetail(id)
POST   /api/v1/admin/competition/add        → addCompetition(data)
PUT    /api/v1/admin/competition/update      → updateCompetition(data)
DELETE /api/v1/admin/competition/soft/{id}  → softDeleteCompetition(id)
DELETE /api/v1/admin/competition/hard/{id}  → hardDeleteCompetition(id)
POST   /api/v1/admin/competition/batch/delete → batchDeleteCompetition(ids)
```

### 竞赛-专业关联 API (`api/certificate/competitionMajor.ts`)

```
GET    /api/v1/admin/competition-major/list              → getCompetitionMajorPage(params)
GET    /api/v1/admin/competition-major/by-competition/{id} → getByCompetitionId(id)
GET    /api/v1/admin/competition-major/by-major/{id}       → getByMajorId(id)
POST   /api/v1/admin/competition-major/add                → addCompetitionMajor(data)
DELETE /api/v1/admin/competition-major/{id}               → deleteCompetitionMajor(id)
POST   /api/v1/admin/competition-major/batch/delete       → batchDeleteCompetitionMajor(ids)
```

## 实现顺序

1. 类型定义（types）
2. API 层（api）
3. 证书管理页面（views/certificate/certificate/index.vue）
4. 竞赛管理页面（views/certificate/competition/index.vue）
5. 竞赛-专业关联页面（views/certificate/competition-major/index.vue）
6. 路由模块（router/modules/certificate.ts）
7. 注册路由到 router/index.ts
