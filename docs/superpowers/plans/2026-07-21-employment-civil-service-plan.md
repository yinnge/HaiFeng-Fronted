# 体制内招录模块 Implementation Plan

> **Task workers:** Use subagent-driven-development or executing-plans to implement each task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 在管理端就业管理模块下新增"体制内招录"二级菜单，含4个三级页面（公务员/事业编/部队文职/选调生），每个页面支持分页查询、详情、修改、软删除、更新状态、批量删除、Excel预校验、导入。

**Architecture:** 与现有教师招聘模块(teacher/index.vue)一致：types定义VO/DTO → api定义接口 → views页面组件 → router注册路由。4个页面共用同一套布局模板，按各自API文档调整字段。

**Tech Stack:** Vue3 + Composition API + TypeScript + Element Plus + Tailwind CSS

---

## File Structure

### Create (18 files)
- `apps/admin/src/types/employment/civil.ts` — 公务员 VO/DTO
- `apps/admin/src/types/employment/institution.ts` — 事业编 VO/DTO
- `apps/admin/src/types/employment/military.ts` — 部队文职 VO/DTO
- `apps/admin/src/types/employment/selection.ts` — 选调生 VO/DTO
- `apps/admin/src/api/employment/civil.ts` — 公务员 API
- `apps/admin/src/api/employment/institution.ts` — 事业编 API
- `apps/admin/src/api/employment/military.ts` — 部队文职 API
- `apps/admin/src/api/employment/selection.ts` — 选调生 API
- `apps/admin/src/views/employment/civil/index.vue` — 公务员页面
- `apps/admin/src/views/employment/institution/index.vue` — 事业编页面
- `apps/admin/src/views/employment/military/index.vue` — 部队文职页面
- `apps/admin/src/views/employment/selection/index.vue` — 选调生页面

### Modify (1 file)
- `apps/admin/src/router/modules/employment.ts` — 新增路由

---

### Task 1: 公务员类型定义

**Files:**
- Create: `apps/admin/src/types/employment/civil.ts`

**Details:**
- 公务员分页列表字段：id, positionName, examType, recruitingDept, minEducation, workLocation, regStartDate, regEndDate, regStatus
- 公务员详情：数据库所有字段
- 查询参数：page, size, positionName(模糊), recruitingDept(模糊), workLocation(模糊), examType(精确), regStatus(精确), minEducation(精确)
- 修改DTO：全部为选填
- 状态DTO：`status: number` (0=报名中, 1=已结束)

- [ ] **Step 1: 创建 civil.ts**

```typescript
export interface CivilListVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  minEducation: string
  workLocation: string
  regStartDate: string
  regEndDate: string
  regStatus: string
}

export interface CivilDetailVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  deptCode: string
  positionCode: string
  affiliatedBureau: string
  majorRequirement: string
  minEducation: string
  degreeRequirement: string
  politicalStatus: string
  workExperience: string
  grassrootsExperience: string
  examCategory: string
  interviewRatio: string
  recruitmentCount: number
  hasProfessionalTest: boolean
  workLocation: string
  workLocationDetail: string
  householdRequirement: string
  householdLocation: string
  positionIntro: string
  remark: string
  officialWebsite: string
  contactPhone: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CivilQueryDTO {
  page: number
  size: number
  positionName?: string
  recruitingDept?: string
  workLocation?: string
  examType?: string
  regStatus?: string
  minEducation?: string
}

export interface CivilUpdateDTO {
  positionName?: string
  examType?: string
  recruitingDept?: string
  deptCode?: string
  positionCode?: string
  affiliatedBureau?: string
  majorRequirement?: string
  minEducation?: string
  degreeRequirement?: string
  politicalStatus?: string
  workExperience?: string
  grassrootsExperience?: string
  examCategory?: string
  interviewRatio?: string
  recruitmentCount?: number
  hasProfessionalTest?: boolean
  workLocation?: string
  workLocationDetail?: string
  householdRequirement?: string
  householdLocation?: string
  positionIntro?: string
  remark?: string
  officialWebsite?: string
  contactPhone?: string
  regStartDate?: string
  regEndDate?: string
  regStatus?: string
  applicantCount?: number
  sortOrder?: number
}

export interface CivilStatusDTO {
  status: number
}
```

---

### Task 2: 事业编类型定义

**Files:**
- Create: `apps/admin/src/types/employment/institution.ts`

- [ ] **Step 1: 创建 institution.ts**

```typescript
export interface InstitutionListVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  salaryRange: string
  positionStatus: string
}

export interface InstitutionDetailVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  educationRequirement: string
  degreeRequirement: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  majorRequirements: string[]
  specialPosition: string
  otherRequirement: string
  otherRequirementDesc: string
  remarkType: string
  remarkDesc: string
  consultationPhone: string
  supervisionPhone: string
  positionStatus: string
  positionTag: string
  tagText: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InstitutionQueryDTO {
  page: number
  size: number
  positionName?: string
  supervisingDept?: string
  institution?: string
  province?: string
  examCategory?: string
  positionType?: string
  positionStatus?: string
}

export interface InstitutionUpdateDTO {
  positionName?: string
  supervisingDept?: string
  institution?: string
  workLocation?: string
  province?: string
  examCategory?: string
  positionType?: string
  subCategory?: string
  educationRequirement?: string
  degreeRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  salaryRange?: string
  regDeadline?: string
  majorRequirements?: string[]
  specialPosition?: string
  otherRequirement?: string
  otherRequirementDesc?: string
  remarkType?: string
  remarkDesc?: string
  consultationPhone?: string
  supervisionPhone?: string
  positionStatus?: string
  positionTag?: string
  tagText?: string
  sortOrder?: number
}

export interface InstitutionStatusDTO {
  status: number
}
```

---

### Task 3: 部队文职类型定义

**Files:**
- Create: `apps/admin/src/types/employment/military.ts`

- [ ] **Step 1: 创建 military.ts**

```typescript
export interface MilitaryListVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  regDeadline: string
  positionStatus: string
}

export interface MilitaryDetailVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  majorRequirement: string
  educationRequirement: string
  regDeadline: string
  positionStatus: string
  positionDescription: string
  responsibilities: string[]
  qualifications: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MilitaryQueryDTO {
  page: number
  size: number
  positionName?: string
  employerUnit?: string
  department?: string
  positionType?: string
  positionStatus?: string
}

export interface MilitaryUpdateDTO {
  positionName?: string
  employerUnit?: string
  department?: string
  positionType?: string
  workLocation?: string
  salaryRange?: string
  majorRequirement?: string
  educationRequirement?: string
  regDeadline?: string
  positionStatus?: string
  positionDescription?: string
  responsibilities?: string[]
  qualifications?: string[]
  sortOrder?: number
}

export interface MilitaryStatusDTO {
  positionStatus: string
}
```

---

### Task 4: 选调生类型定义

**Files:**
- Create: `apps/admin/src/types/employment/selection.ts`

- [ ] **Step 1: 创建 selection.ts**

```typescript
export interface SelectionListVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  politicalStatus: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface SelectionDetailVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  trainingDirection: string
  grassrootsServiceYears: string
  trainingPlan: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorCategories: string[]
  universityRequirement: string
  targetUniversities: string[]
  politicalStatus: string
  studentCadreRequirement: string
  awardsRequirement: string
  ageLimit: number
  recruitmentCount: number
  examSubjects: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  applyLink: string
  positionStatus: string
  remark: string
  contactPhone: string
  officialLink: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface SelectionQueryDTO {
  page: number
  size: number
  positionName?: string
  targetUnit?: string
  organizingDept?: string
  selectionType?: string
  year?: string
  province?: string
  politicalStatus?: string
  positionStatus?: string
}

export interface SelectionUpdateDTO {
  positionName?: string
  selectionType?: string
  year?: string
  province?: string
  organizingDept?: string
  targetUnit?: string
  workLocation?: string
  trainingDirection?: string
  grassrootsServiceYears?: string
  trainingPlan?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  majorCategories?: string[]
  universityRequirement?: string
  targetUniversities?: string[]
  politicalStatus?: string
  studentCadreRequirement?: string
  awardsRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  examSubjects?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  applyLink?: string
  positionStatus?: string
  remark?: string
  contactPhone?: string
  officialLink?: string
  content?: string
  sortOrder?: number
}

export interface SelectionStatusDTO {
  positionStatus: string
}
```

---

### Task 5: 公务员 API 定义

**Files:**
- Create: `apps/admin/src/api/employment/civil.ts`

- [ ] **Step 1: 创建 civil.ts**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CivilListVO,
  CivilDetailVO,
  CivilQueryDTO,
  CivilUpdateDTO,
  CivilStatusDTO,
} from '@/types/employment/civil'

const PREFIX = '/api/v1/admin/employment/civil-service/civil-position'

export const getCivilPage = (params: CivilQueryDTO) => {
  return request.get<R<PageResult<CivilListVO>>>(`${PREFIX}/list`, { params })
}

export const getCivilDetail = (id: number) => {
  return request.get<R<CivilDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateCivil = (id: number, data: CivilUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteCivil = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateCivilStatus = (id: number, data: CivilStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteCivil = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateCivil = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCivil = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 6: 事业编 API 定义

**Files:**
- Create: `apps/admin/src/api/employment/institution.ts`

- [ ] **Step 1: 创建 institution.ts**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionUpdateDTO,
  InstitutionStatusDTO,
} from '@/types/employment/institution'

const PREFIX = '/api/v1/admin/employment/civil-service/institution-position'

export const getInstitutionPage = (params: InstitutionQueryDTO) => {
  return request.get<R<PageResult<InstitutionListVO>>>(`${PREFIX}/list`, { params })
}

export const getInstitutionDetail = (id: number) => {
  return request.get<R<InstitutionDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateInstitution = (id: number, data: InstitutionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteInstitution = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateInstitutionStatus = (id: number, data: InstitutionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteInstitution = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateInstitution = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importInstitution = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: 部队文职 API 定义

**Files:**
- Create: `apps/admin/src/api/employment/military.ts`

- [ ] **Step 1: 创建 military.ts**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  MilitaryListVO,
  MilitaryDetailVO,
  MilitaryQueryDTO,
  MilitaryUpdateDTO,
  MilitaryStatusDTO,
} from '@/types/employment/military'

const PREFIX = '/api/v1/admin/employment/civil-service/military-position'

export const getMilitaryPage = (params: MilitaryQueryDTO) => {
  return request.get<R<PageResult<MilitaryListVO>>>(`${PREFIX}/list`, { params })
}

export const getMilitaryDetail = (id: number) => {
  return request.get<R<MilitaryDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateMilitary = (id: number, data: MilitaryUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteMilitary = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateMilitaryStatus = (id: number, data: MilitaryStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteMilitary = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateMilitary = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importMilitary = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 8: 选调生 API 定义

**Files:**
- Create: `apps/admin/src/api/employment/selection.ts`

- [ ] **Step 1: 创建 selection.ts**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  SelectionListVO,
  SelectionDetailVO,
  SelectionQueryDTO,
  SelectionUpdateDTO,
  SelectionStatusDTO,
} from '@/types/employment/selection'

const PREFIX = '/api/v1/admin/employment/civil-service/selection-position'

export const getSelectionPage = (params: SelectionQueryDTO) => {
  return request.get<R<PageResult<SelectionListVO>>>(`${PREFIX}/list`, { params })
}

export const getSelectionDetail = (id: number) => {
  return request.get<R<SelectionDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateSelection = (id: number, data: SelectionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteSelection = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateSelectionStatus = (id: number, data: SelectionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteSelection = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateSelection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importSelection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 9: 路由——新增体制内招录导航

**Files:**
- Modify: `apps/admin/src/router/modules/employment.ts`

**Details:** 在 `children` 数组最前面新增"体制内招录"二级组，包含4个三级子路由

- [ ] **Step 1: 修改 employment.ts**

编辑 `apps/admin/src/router/modules/employment.ts`，在 `children` 数组第一个元素位置插入体制内招录路由组（在所有已有 children 之前）：

```typescript
// 在 children 数组的 imports 之后，第一个元素位置新增：
    {
      path: 'civil',
      name: 'CivilService',
      meta: { title: '体制内招录', icon: 'Briefcase' },
      redirect: '/employment/civil/servant',
      children: [
        {
          path: 'servant',
          name: 'CivilServant',
          component: () => import('@/views/employment/civil/index.vue'),
          meta: { title: '公务员职位', moduleCode: 'emp_civil_servant' },
        },
        {
          path: 'institution',
          name: 'CivilInstitution',
          component: () => import('@/views/employment/institution/index.vue'),
          meta: { title: '事业编职位', moduleCode: 'emp_civil_institution' },
        },
        {
          path: 'military',
          name: 'CivilMilitary',
          component: () => import('@/views/employment/military/index.vue'),
          meta: { title: '部队文职岗位', moduleCode: 'emp_civil_military' },
        },
        {
          path: 'selection',
          name: 'CivilSelection',
          component: () => import('@/views/employment/selection/index.vue'),
          meta: { title: '选调生岗位', moduleCode: 'emp_civil_selection' },
        },
      ],
    },
```

---

### Task 10: 公务员职位页面

**Files:**
- Create: `apps/admin/src/views/employment/civil/index.vue`

**Details:** 参照 teacher/index.vue 布局，按公务员API字段调整：
- 搜索区：positionName, recruitingDept, workLocation 模糊查询 + examType(select:国考/省考), regStatus(select:报名中/已结束/即将开始), minEducation(select:不限/大专/本科/硕士/博士)
- 表格列：id, positionName, examType, recruitingDept, minEducation, workLocation, regStartDate, regEndDate, regStatus(tag), 操作
- 状态操作列：el-dropdown 切换 报名中/已结束，调用 updateCivilStatus({ status: 0|1 })
- 详情对话框：2列 el-descriptions 显示所有字段
- 修改对话框：分4个tab（基本信息/报考要求/报名信息/补充信息），提交只传非空字段
- Excel预校验/导入：与教师模块一致

- [ ] **Step 1: 创建页面组件**（内容见下——完整 Vue SFC，与 teacher/index.vue 同结构，字段适配 civil API）

**Note:** 完整页面代码（约750行）使用 teacher/index.vue 的模板结构，将以下部分替换为 civil 专有内容：
- API imports: 引入 Task 5 的 API 函数
- Type imports: 引入 Task 1 的类型
- queryParams: 按 CivilQueryDTO 的5个查询字段
- 搜索下拉选项: examTypeOptions, regStatusOptions, educationOptions
- 表格列: civil 列表字段
- 状态tag映射: regStatusTag
- 详情/修改表单字段: civil 全部字段
- tab 划分: 基本信息(职位基本字段) / 报考要求(学历学位政治面貌等) / 报名信息(报名日期状态人数) / 补充信息(官网电话简介备注)

---

### Task 11: 事业编职位页面

**Files:**
- Create: `apps/admin/src/views/employment/institution/index.vue`

**Details:** 与 Task 10 相同模板，按 institution API 调整：
- 搜索区：positionName, supervisingDept, institution(模糊) + province, examCategory, positionType, positionStatus(精确:招聘中/已结束)
- 表格列：id, positionName, supervisingDept, institution, province, examCategory, positionType, subCategory, salaryRange, positionStatus(tag)
- 状态：调用 updateInstitutionStatus({ status: 0|1 })
- 状态值域：招聘中/已结束
- tag 颜色映射：招聘中->success, 已结束->info
- 详情/修改字段：按 InstitutionDetailVO/InstitutionUpdateDTO

- [ ] **Step 1: 创建页面组件**

---

### Task 12: 部队文职岗位页面

**Files:**
- Create: `apps/admin/src/views/employment/military/index.vue`

**Details:** 与 Task 10 相同模板，按 military API 调整：
- 搜索区：positionName, employerUnit, department(模糊) + positionType(精确), positionStatus(精确)
- 表格列：id, positionName, employerUnit, department, positionType, workLocation, salaryRange, regDeadline, positionStatus(tag)
- 状态：调用 updateMilitaryStatus({ positionStatus: "进行中" })，传字符串
- 状态值域：进行中/已结束
- tag 颜色映射：进行中->success, 已结束->info
- 数组字段处理：responsibilities, qualifications 数组展示

- [ ] **Step 1: 创建页面组件**

---

### Task 13: 选调生岗位页面

**Files:**
- Create: `apps/admin/src/views/employment/selection/index.vue`

**Details:** 与 Task 10 相同模板，按 selection API 调整：
- 搜索区：positionName, targetUnit, organizingDept(模糊) + selectionType, year, province, politicalStatus, positionStatus(精确)
- 表格列：id, positionName, selectionType, year, province, organizingDept, targetUnit, workLocation, politicalStatus, regStartDate, regEndDate, positionStatus(tag)
- 状态：调用 updateSelectionStatus({ positionStatus: "报名中" })，传字符串
- 状态值域：报名中/笔试阶段/面试阶段/已结束/即将开始
- tag 颜色映射：报名中->success, 笔试阶段->warning, 面试阶段->warning, 已结束->info, 即将开始->primary
- 详情/修改字段：按 SelectionDetailVO/SelectionUpdateDTO

- [ ] **Step 1: 创建页面组件**

---

## Verification

- [ ] **Step 1:** `npm run typecheck` — 确认无类型错误（从项目根目录运行）
- [ ] **Step 2:** `npm run lint` — 确认无 lint 错误
- [ ] **Step 3:** 确认路由配置正确，导航正常显示4个三级菜单
