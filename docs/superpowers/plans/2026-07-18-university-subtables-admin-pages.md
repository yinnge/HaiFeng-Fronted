# 院校次表管理页面 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建院系管理、实验室管理、学科评估管理 3 个后台管理页面

**架构:** 每个页面独立为 Vue 文件，API 和类型定义按模块拆分，复用现有校园图册页面的代码模式（搜索栏 + 操作栏 + 表格 + 弹窗）

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Tailwind CSS + Axios

---

## 文件结构

### 创建的文件
| # | 文件路径 | 职责 |
|---|---------|------|
| 1 | `apps/admin/src/types/university/department.ts` | 院系 VO/DTO 类型 |
| 2 | `apps/admin/src/types/university/laboratory.ts` | 实验室 VO/DTO 类型 |
| 3 | `apps/admin/src/types/university/subject-evaluation.ts` | 学科评估 VO/DTO 类型 |
| 4 | `apps/admin/src/api/university/department.ts` | 院系 API 接口 |
| 5 | `apps/admin/src/api/university/laboratory.ts` | 实验室 API 接口 |
| 6 | `apps/admin/src/api/university/subject-evaluation.ts` | 学科评估 API 接口 |
| 7 | `apps/admin/src/views/university/dept/index.vue` | 院系管理页面 |
| 8 | `apps/admin/src/views/university/laboratory/index.vue` | 实验室管理页面 |
| 9 | `apps/admin/src/views/university/subject-evaluation/index.vue` | 学科评估管理页面 |

### 修改的文件
| # | 文件路径 | 修改内容 |
|---|---------|---------|
| 10 | `apps/admin/src/router/modules/university.ts` | 追加 3 条子路由 |

---

### Task 1: 院系管理 — 类型定义

**Files:**
- Create: `apps/admin/src/types/university/department.ts`

- [ ] Create types file

```typescript
export interface DepartmentListVO {
  id: number
  universityId: number
  universityName: string
  departmentName: string
  departmentType: string
  pageTitle: string
  tags: string[]
  sortOrder: number
  status: number
  createdAt: string
}

export interface DepartmentDetailVO extends DepartmentListVO {
  updatedAt: string
  report: DepartmentReportVO
}

export interface DepartmentReportVO {
  subtitle: string
  citySalary: CitySalaryItem[]
  postgraduate: { title: string; directions: string[] }
  disclaimer: { text: string; updateTime: string; version: string; compileUnit: string }
  prospects: {
    employmentRate: string; masterSalary: string; furtherStudyRate: string
    fortune500Rate: string; salaryGrowthRate: string; overseasRate: string
  }
  trends: {
    highGrowthTracks: string[]; policyOrientations: string[]; environmentAnalysis: string[]
  }
  overview: { title: string; descriptions: string[] }
  career: CareerPath[]
  subjectsDetail: SubjectDetailItem[]
  salary: SalaryItem[]
  majorCompose: MajorComposeItem[]
}

export interface CitySalaryItem {
  cityName: string; minSalary: number; maxSalary: number
}

export interface CareerPath {
  pathTitle: string; pathDesc: string
  stages: { stageTitle: string; workYears: string; position: string; coreGoal: string; salaryRange: string }[]
}

export interface SubjectDetailItem {
  majorName: string; tags: string[]; coreSubject: string; supportSubject: string
  positioning: string; coreCourses: string[]; abilities: string[]; certificates: string[]
}

export interface SalaryItem {
  majorName: string; minSalary: number; maxSalary: number
}

export interface MajorComposeItem {
  subjectName: string; percentage: number
}

export interface DepartmentQueryDTO {
  universityName?: string
  departmentName?: string
  departmentType?: string
  status?: number
  page: number
  size: number
}

export interface DepartmentAddDTO {
  universityId: number
  departmentName: string
  departmentType: string
  pageTitle?: string
  tags?: string[]
  sortOrder?: number
}

export interface DepartmentUpdateDTO extends DepartmentAddDTO {
  status?: number
}
```

---

### Task 2: 实验室管理 — 类型定义

**Files:**
- Create: `apps/admin/src/types/university/laboratory.ts`

- [ ] Create types file

```typescript
export interface LaboratoryListVO {
  id: number
  universityId: number
  universityName: string
  name: string
  labType: string
  region: string
  department: string
  director: string
  status: number
  createdAt: string
}

export interface LaboratoryDetailVO {
  id: number
  universityId: number
  universityName: string
  name: string
  labType: string
  establishedYear: string
  region: string
  department: string
  director: string
  staffCount: string
  studentCount: string
  email: string
  phone: string
  introduction: string
  researchDescription: string
  labSpace: string
  openTopics: string
  cooperation: string
  visitingScholars: string
  researchFields: string[]
  majorEquipment: string[]
  coreTeam: CoreTeamItem[]
  statistics: StatisticsItem[]
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface CoreTeamItem {
  name: string; position: string; title: string
}

export interface StatisticsItem {
  label: string; count: number
}

export interface LaboratoryQueryDTO {
  universityName?: string
  name?: string
  labType?: string
  region?: string
  department?: string
  status?: number
  page: number
  size: number
}

export interface LaboratoryAddDTO {
  universityId: number
  name: string
  labType: string
  establishedYear?: string
  region?: string
  department?: string
  director?: string
  staffCount?: string
  studentCount?: string
  email?: string
  phone?: string
  introduction?: string
  researchDescription?: string
  labSpace?: string
  openTopics?: string
  cooperation?: string
  visitingScholars?: string
  researchFields?: string[]
  majorEquipment?: string[]
  coreTeam?: CoreTeamItem[]
  statistics?: StatisticsItem[]
  sortOrder?: number
}

export interface LaboratoryUpdateDTO extends LaboratoryAddDTO {
  status?: number
}

export interface LaboratoryRelationUpdateDTO {
  coreTeam?: CoreTeamItem[]
  statistics?: StatisticsItem[]
}
```

---

### Task 3: 学科评估管理 — 类型定义

**Files:**
- Create: `apps/admin/src/types/university/subject-evaluation.ts`

- [ ] Create types file

```typescript
export interface SubjectEvaluationListVO {
  id: number
  universityId: number
  universityName: string
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
  status: number
  createdAt: string
}

export interface SubjectEvaluationDetailVO extends SubjectEvaluationListVO {
  sortOrder: number
  updatedAt: string
}

export interface SubjectEvaluationQueryDTO {
  universityName?: string
  disciplineCode?: string
  disciplineName?: string
  evaluationRound?: string
  evaluationGrade?: string
  status?: number
  page: number
  size: number
}

export interface SubjectEvaluationAddDTO {
  universityId: number
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
  sortOrder?: number
}

export interface SubjectEvaluationUpdateDTO {
  disciplineCode?: string
  disciplineName?: string
  evaluationRound?: string
  evaluationGrade?: string
  sortOrder?: number
  status?: number
}

export const EVALUATION_GRADES = [
  'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'
] as const
```

---

### Task 4: 院系管理 — API 接口

**Files:**
- Create: `apps/admin/src/api/university/department.ts`

- [ ] Create API file

```typescript
import request from '@haifeng/shared/utils/request'
import type {
  DepartmentListVO,
  DepartmentDetailVO,
  DepartmentQueryDTO,
  DepartmentAddDTO,
  DepartmentUpdateDTO,
} from '@/types/university/department'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/department'

export const getDepartmentPage = (
  params: DepartmentQueryDTO,
): Promise<AxiosResponse<PageResponse<DepartmentListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getDepartmentDetail = (
  id: number,
): Promise<AxiosResponse<R<DepartmentDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addDepartment = (
  data: DepartmentAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateDepartment = (
  id: number,
  data: DepartmentUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateDepartmentStatus = (
  id: number,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteDepartment = (id: number): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteDepartment = (
  id: number,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importDepartment = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 5: 实验室管理 — API 接口

**Files:**
- Create: `apps/admin/src/api/university/laboratory.ts`

- [ ] Create API file

```typescript
import request from '@haifeng/shared/utils/request'
import type {
  LaboratoryListVO,
  LaboratoryDetailVO,
  LaboratoryQueryDTO,
  LaboratoryAddDTO,
  LaboratoryUpdateDTO,
} from '@/types/university/laboratory'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/laboratory'

export const getLaboratoryPage = (
  params: LaboratoryQueryDTO,
): Promise<AxiosResponse<PageResponse<LaboratoryListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getLaboratoryDetail = (
  id: number,
): Promise<AxiosResponse<R<LaboratoryDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addLaboratory = (
  data: LaboratoryAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateLaboratory = (
  id: number,
  data: LaboratoryUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateLaboratoryStatus = (
  id: number,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteLaboratory = (id: number): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteLaboratory = (
  id: number,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteLaboratory = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteLaboratory = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importLaboratory = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 6: 学科评估管理 — API 接口

**Files:**
- Create: `apps/admin/src/api/university/subject-evaluation.ts`

- [ ] Create API file

```typescript
import request from '@haifeng/shared/utils/request'
import type {
  SubjectEvaluationListVO,
  SubjectEvaluationDetailVO,
  SubjectEvaluationQueryDTO,
  SubjectEvaluationAddDTO,
  SubjectEvaluationUpdateDTO,
} from '@/types/university/subject-evaluation'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/subject-evaluation'

export const getSubjectEvaluationPage = (
  params: SubjectEvaluationQueryDTO,
): Promise<AxiosResponse<PageResponse<SubjectEvaluationListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getSubjectEvaluationDetail = (
  id: number,
): Promise<AxiosResponse<R<SubjectEvaluationDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addSubjectEvaluation = (
  data: SubjectEvaluationAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateSubjectEvaluation = (
  id: number,
  data: SubjectEvaluationUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateSubjectEvaluationStatus = (
  id: number,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteSubjectEvaluation = (id: number): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteSubjectEvaluation = (
  id: number,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteSubjectEvaluation = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteSubjectEvaluation = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importSubjectEvaluation = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: 院系管理页面

**Files:**
- Create: `apps/admin/src/views/university/dept/index.vue`

完整页面，参考 `apps/admin/src/views/university/album/index.vue` 的代码结构。

- [ ] Create the Vue page with:
  - 搜索栏：院校名称、院系名称、院系类型(select with enum options)、状态
  - 操作栏：新增院系、导入Excel、批量下架、批量永久删除、刷新
  - 表格：带多选 selection、ID、院校名称、院系名称、院系类型、标签(tags 用 el-tag 列表)、状态(el-tag)、创建时间
  - 操作列：详情、修改、禁用/启用、下架、永久删除
  - 分页：page-sizes=[10,20,30,50,100,200,500,1000]
  - 详情弹窗：主表 el-descriptions + 报告用 el-collapse 折叠展示各 JSONB 区块
  - 新增弹窗：院校 select(可搜索)、院系名称、院系类型(select)、页面主标题、院系标签(multiple)、排序
  - 修改弹窗：同新增 + 状态 switch
  - 导入：文件 input accept=".xlsx,.xls"

**关键代码逻辑（与已有 album 页面一致）：**
- `fetchData()` — 组装 params，调用 `getDepartmentPage`
- `handleToggleStatus()` — 确认弹窗后调用 `updateDepartmentStatus`
- `handleDelete()` — 软删除（"下架"）
- `handleHardDelete()` — 硬删除（"永久删除"）
- `handleBatchDelete()` / `handleBatchHardDelete()` — 批量操作
- `handleImport()` — 弹出文件选择器后调用 `importDepartment`

---

### Task 8: 实验室管理页面

**Files:**
- Create: `apps/admin/src/views/university/laboratory/index.vue`

完整页面，参考校园图册页面结构，但新增/修改表单分两个 tab（基础信息 + 详细信息）。

- [ ] Create the Vue page with:
  - 搜索栏：院校名称、实验室名称、实验室类型(select with enum)、所在地区、主管部门、状态
  - 操作栏：新增实验室、导入Excel、批量下架、批量永久删除、刷新
  - 表格列：ID、院校名称、实验室名称、实验室类型、所在地区、主管部门、主任、状态、创建时间
  - 详情弹窗：el-descriptions + 核心团队子表格 + 统计数据子表格
  - 新增/修改弹窗：两个 el-tab-pane
    - Tab1 基础信息：院校 select、实验室名称、实验室类型 select、成立时间、所在地区、主管部门、主任、排序
    - Tab2 详细信息：人员规模、学生规模、邮箱、电话、简介(textarea)、研究方向(textarea)、空间、开放课题(textarea)、合作交流(textarea)、访问学者(textarea)、研究领域(multiple input)、主要设备(multiple input)、核心团队(内嵌 el-table 动态行)、统计数据(内嵌 el-table 动态行)

---

### Task 9: 学科评估管理页面

**Files:**
- Create: `apps/admin/src/views/university/subject-evaluation/index.vue`

完整页面，结构最简单的一个。

- [ ] Create the Vue page with:
  - 搜索栏：院校名称、学科代码、学科名称、评估轮次、评估等级(select: A+/A/A-/B+/B/B-/C+/C/C-)、状态
  - 操作栏：新增评估、导入Excel、批量下架、批量永久删除、刷新
  - 表格列：ID、院校名称、学科代码、学科名称、评估轮次、评估等级(el-tag, 颜色按等级区分)、状态、创建时间
    - 评估等级颜色映射：
      - A+/A/A- → type="success"
      - B+/B/B- → type="warning"
      - C+/C/C- → type="info"
  - 详情弹窗：el-descriptions 展示所有字段
  - 新增表单：院校 select、学科代码、学科名称、评估轮次、评估等级 select、排序
  - 修改表单：同新增 + 状态 switch

---

### Task 10: 更新路由

**Files:**
- Modify: `apps/admin/src/router/modules/university.ts`

- [ ] Append 3 child routes to the existing university route

```typescript
{
  path: 'dept',
  name: 'UniversityDept',
  component: () => import('@/views/university/dept/index.vue'),
  meta: { title: '院系管理', moduleCode: 'university_dept' },
},
{
  path: 'laboratory',
  name: 'UniversityLab',
  component: () => import('@/views/university/laboratory/index.vue'),
  meta: { title: '实验室管理', moduleCode: 'university_lab' },
},
{
  path: 'subject-evaluation',
  name: 'UniversitySubjectEvaluation',
  component: () => import('@/views/university/subject-evaluation/index.vue'),
  meta: { title: '学科评估管理', moduleCode: 'university_eval' },
},
```
