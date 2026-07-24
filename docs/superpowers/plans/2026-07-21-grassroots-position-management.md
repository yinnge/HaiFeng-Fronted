# 基层服务岗位管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 new pages (基层服务项目岗位, 社区工作者岗位, 公益性岗位) under the employment module in the admin backend.

**Architecture:** Each page follows the existing CRUD + Excel import pattern (teacher module as reference). Each module has independent API, types, and view files. Routes are added to the existing router module.

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, Element Plus, Axios, Vue Router 4

---

## File Structure

```
CREATE: apps/admin/src/types/employment/grassroots.ts
CREATE: apps/admin/src/types/employment/community.ts
CREATE: apps/admin/src/types/employment/welfare.ts
CREATE: apps/admin/src/api/employment/grassroots.ts
CREATE: apps/admin/src/api/employment/community.ts
CREATE: apps/admin/src/api/employment/welfare.ts
CREATE: apps/admin/src/views/employment/grassroots/
CREATE: apps/admin/src/views/employment/grassroots/index.vue
CREATE: apps/admin/src/views/employment/community/
CREATE: apps/admin/src/views/employment/community/index.vue
CREATE: apps/admin/src/views/employment/welfare/
CREATE: apps/admin/src/views/employment/welfare/index.vue
MODIFY: apps/admin/src/router/modules/employment.ts
```

---

### Task 1: Create types for grassroots (基层服务项目岗位)

**Files:**
- Create: `apps/admin/src/types/employment/grassroots.ts`

- [ ] **Step 1: Create the types file**

```typescript
export interface GrassrootsListVO {
  id: number
  projectType: string
  year: string
  positionName: string
  serviceType: string
  organizingDept: string
  serviceUnit: string
  province: string
  city: string
  county: string
  positionStatus: string
  updatedAt: string
}

export interface GrassrootsDetailVO {
  id: number
  projectType: string
  year: string
  positionName: string
  serviceType: string
  organizingDept: string
  serviceUnit: string
  province: string
  city: string
  county: string
  township: string
  servicePeriod: string
  serviceStartDate: string
  serviceEndDate: string
  educationRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  gradYearRequirement: string
  householdRequirement: string
  politicalStatus: string
  otherRequirement: string
  examContent: string
  examTime: string
  interviewForm: string
  monthlySubsidy: string
  socialInsurance: string
  housingInfo: string
  otherBenefits: string
  afterServicePolicy: string
  canTransferToCivil: boolean
  canTransferToInstitution: boolean
  examBonusPoints: string
  tuitionCompensation: string
  postgradBonus: string
  regStartDate: string
  regEndDate: string
  applyLink: string
  positionStatus: string
  contactPhone: string
  remark: string
  content: string
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GrassrootsQueryDTO {
  page: number
  size: number
  positionName?: string
  organizingDept?: string
  serviceUnit?: string
  projectType?: string
  year?: string
  serviceType?: string
  province?: string
  city?: string
  county?: string
  positionStatus?: string
}

export interface GrassrootsUpdateDTO {
  projectType?: string
  year?: string
  positionName?: string
  serviceType?: string
  organizingDept?: string
  serviceUnit?: string
  province?: string
  city?: string
  county?: string
  township?: string
  servicePeriod?: string
  serviceStartDate?: string
  serviceEndDate?: string
  educationRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  gradYearRequirement?: string
  householdRequirement?: string
  politicalStatus?: string
  otherRequirement?: string
  examContent?: string
  examTime?: string
  interviewForm?: string
  monthlySubsidy?: string
  socialInsurance?: string
  housingInfo?: string
  otherBenefits?: string
  afterServicePolicy?: string
  canTransferToCivil?: boolean
  canTransferToInstitution?: boolean
  examBonusPoints?: string
  tuitionCompensation?: string
  postgradBonus?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactPhone?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
```

---

### Task 2: Create types for community (社区工作者岗位)

**Files:**
- Create: `apps/admin/src/types/employment/community.ts`

- [ ] **Step 1: Create the types file**

```typescript
export interface CommunityListVO {
  id: number
  communityName: string
  positionName: string
  supervisingDept: string
  positionType: string
  province: string
  city: string
  positionStatus: string
  updatedAt: string
}

export interface CommunityDetailVO {
  id: number
  streetOffice: string
  communityName: string
  supervisingDept: string
  district: string
  positionName: string
  positionType: string
  employmentType: string
  province: string
  city: string
  workLocation: string
  educationRequirement: string
  ageLimit: number
  recruitmentCount: number
  majorRequirement: string
  householdRequirement: string
  politicalStatus: string
  workExperience: string
  socialWorkCert: string
  communityExperience: string
  residenceRequirement: string
  salaryRange: string
  salaryComposition: string
  benefits: string
  examContent: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  positionStatus: string
  applyLink: string
  applyMethod: string
  contactPhone: string
  contactAddress: string
  remark: string
  content: string
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CommunityQueryDTO {
  page: number
  size: number
  positionName?: string
  communityName?: string
  supervisingDept?: string
  positionType?: string
  province?: string
  city?: string
  positionStatus?: string
}

export interface CommunityUpdateDTO {
  streetOffice?: string
  communityName?: string
  supervisingDept?: string
  district?: string
  positionName?: string
  positionType?: string
  employmentType?: string
  province?: string
  city?: string
  workLocation?: string
  educationRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  majorRequirement?: string
  householdRequirement?: string
  politicalStatus?: string
  workExperience?: string
  socialWorkCert?: string
  communityExperience?: string
  residenceRequirement?: string
  salaryRange?: string
  salaryComposition?: string
  benefits?: string
  examContent?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  positionStatus?: string
  applyLink?: string
  applyMethod?: string
  contactPhone?: string
  contactAddress?: string
  remark?: string
  content?: string
  sortOrder?: number
}
```

---

### Task 3: Create types for welfare (公益性岗位)

**Files:**
- Create: `apps/admin/src/types/employment/welfare.ts`

- [ ] **Step 1: Create the types file**

```typescript
export interface WelfareListVO {
  id: number
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  province: string
  city: string
  district: string
  monthlySalary: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
  updatedAt: string
}

export interface WelfareDetailVO {
  id: number
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  workContent: string
  province: string
  city: string
  district: string
  workLocation: string
  targetGroup: string[]
  educationRequirement: string
  ageRange: string
  healthRequirement: string
  recruitmentCount: number
  householdRequirement: string
  employmentDifficultyCert: boolean
  otherRequirement: string
  contractPeriod: string
  isRenewable: boolean
  maxServiceYears: number
  monthlySalary: string
  salarySource: string
  subsidyStandard: string
  socialInsuranceInfo: string
  otherBenefits: string
  workSchedule: string
  isShiftWork: boolean
  regStartDate: string
  regEndDate: string
  applyMethod: string
  applyAddress: string
  requiredDocuments: string
  positionStatus: string
  contactPhone: string
  contactPerson: string
  remark: string
  content: string
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface WelfareQueryDTO {
  page: number
  size: number
  positionName?: string
  developingUnit?: string
  employingUnit?: string
  positionCategory?: string
  province?: string
  city?: string
  district?: string
  maxServiceYears?: number
  positionStatus?: string
}

export interface WelfareUpdateDTO {
  developingUnit?: string
  employingUnit?: string
  positionName?: string
  positionCategory?: string
  workContent?: string
  province?: string
  city?: string
  district?: string
  workLocation?: string
  targetGroup?: string[]
  educationRequirement?: string
  ageRange?: string
  healthRequirement?: string
  recruitmentCount?: number
  householdRequirement?: string
  employmentDifficultyCert?: boolean
  otherRequirement?: string
  contractPeriod?: string
  isRenewable?: boolean
  maxServiceYears?: number
  monthlySalary?: string
  salarySource?: string
  subsidyStandard?: string
  socialInsuranceInfo?: string
  otherBenefits?: string
  workSchedule?: string
  isShiftWork?: boolean
  regStartDate?: string
  regEndDate?: string
  applyMethod?: string
  applyAddress?: string
  requiredDocuments?: string
  positionStatus?: string
  contactPhone?: string
  contactPerson?: string
  remark?: string
  content?: string
  sortOrder?: number
}
```

---

### Task 4: Create API for grassroots

**Files:**
- Create: `apps/admin/src/api/employment/grassroots.ts`

- [ ] **Step 1: Create the API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  GrassrootsListVO,
  GrassrootsDetailVO,
  GrassrootsQueryDTO,
  GrassrootsUpdateDTO,
  PositionStatusDTO,
} from '@/types/employment/grassroots'

const PREFIX = '/api/v1/admin/employment/grassroots-position/project'

export const getGrassrootsPage = (params: GrassrootsQueryDTO) => {
  return request.get<R<PageResult<GrassrootsListVO>>>(`${PREFIX}/list`, { params })
}

export const getGrassrootsDetail = (id: number) => {
  return request.get<R<GrassrootsDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateGrassroots = (id: number, data: GrassrootsUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteGrassroots = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateGrassrootsStatus = (id: number, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteGrassroots = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateGrassroots = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importGrassroots = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 5: Create API for community

**Files:**
- Create: `apps/admin/src/api/employment/community.ts`

- [ ] **Step 1: Create the API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CommunityListVO,
  CommunityDetailVO,
  CommunityQueryDTO,
  CommunityUpdateDTO,
  PositionStatusDTO,
} from '@/types/employment/community'

const PREFIX = '/api/v1/admin/employment/grassroots-position/community'

export const getCommunityPage = (params: CommunityQueryDTO) => {
  return request.get<R<PageResult<CommunityListVO>>>(`${PREFIX}/list`, { params })
}

export const getCommunityDetail = (id: number) => {
  return request.get<R<CommunityDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateCommunity = (id: number, data: CommunityUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteCommunity = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateCommunityStatus = (id: number, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteCommunity = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateCommunity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCommunity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 6: Create API for welfare

**Files:**
- Create: `apps/admin/src/api/employment/welfare.ts`

- [ ] **Step 1: Create the API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  WelfareListVO,
  WelfareDetailVO,
  WelfareQueryDTO,
  WelfareUpdateDTO,
  PositionStatusDTO,
} from '@/types/employment/welfare'

const PREFIX = '/api/v1/admin/employment/grassroots-position/welfare'

export const getWelfarePage = (params: WelfareQueryDTO) => {
  return request.get<R<PageResult<WelfareListVO>>>(`${PREFIX}/list`, { params })
}

export const getWelfareDetail = (id: number) => {
  return request.get<R<WelfareDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateWelfare = (id: number, data: WelfareUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteWelfare = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateWelfareStatus = (id: number, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteWelfare = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateWelfare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importWelfare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: Create view for grassroots (基层服务项目岗位)

**Files:**
- Create: `apps/admin/src/views/employment/grassroots/index.vue`

See the complete view file code:
- Follows the teacher module pattern exactly (search bar → action buttons → table → pagination → dialog)
- Search fields: positionName (input), organizingDept (input), serviceUnit (input), projectType (select), year (input), serviceType (select), province (input), city (input), county (input), positionStatus (select)
- Status tag: 招募中=success, 已结束=info, 即将开始=warning
- Edit dialog with 4 tabs: 项目与岗位信息, 服务地点与要求, 待遇与期满政策, 考试与报名
- Excel validate + import dialogs
- 批量软删除 button

---

### Task 8: Create view for community (社区工作者岗位)

**Files:**
- Create: `apps/admin/src/views/employment/community/index.vue`

Follows the same pattern as Task 7 but with:
- Search fields: positionName (input), communityName (input), supervisingDept (input), positionType (select), province (input), city (input), positionStatus (select)
- Status values: 招聘中/已结束/即将开始 (not 招募中)
- Edit dialog with 4 tabs: 单位与岗位信息, 地区与报考要求, 特殊要求与待遇, 考试与报名

---

### Task 9: Create view for welfare (公益性岗位)

**Files:**
- Create: `apps/admin/src/views/employment/welfare/index.vue`

Follows the same pattern but with:
- Search fields: positionName (input), developingUnit (input), employingUnit (input), positionCategory (select), province (input), city (input), district (input), maxServiceYears (input-number), positionStatus (select)
- Status values: 招聘中/已结束/即将开始
- Edit dialog with 4 tabs: 单位与岗位信息, 地区与报名要求, 岗位期限与待遇, 报名与补充

---

### Task 10: Update router

**Files:**
- Modify: `apps/admin/src/router/modules/employment.ts`

- [ ] **Step 1: Update the router file**

```typescript
import type { RouteRecordRaw } from 'vue-router'

const employmentRoutes: RouteRecordRaw = {
  path: '/employment',
  name: 'Employment',
  meta: { title: '就业管理', icon: 'Briefcase' },
  redirect: '/employment/industry/teacher',
  children: [
    {
      path: 'grassroots/project',
      name: 'GrassrootsProject',
      component: () => import('@/views/employment/grassroots/index.vue'),
      meta: { title: '基层服务项目岗位', moduleCode: 'emp_grassroots_3s' },
    },
    {
      path: 'grassroots/community',
      name: 'GrassrootsCommunity',
      component: () => import('@/views/employment/community/index.vue'),
      meta: { title: '社区工作者岗位', moduleCode: 'emp_grassroots_comm' },
    },
    {
      path: 'grassroots/welfare',
      name: 'GrassrootsWelfare',
      component: () => import('@/views/employment/welfare/index.vue'),
      meta: { title: '公益性岗位', moduleCode: 'emp_grassroots_welfare' },
    },
    {
      path: 'industry/teacher',
      name: 'IndustryTeacher',
      component: () => import('@/views/employment/teacher/index.vue'),
      meta: { title: '教师招聘管理', moduleCode: 'emp_industry_teacher' },
    },
    {
      path: 'industry/healthcare',
      name: 'IndustryHealthcare',
      component: () => import('@/views/employment/healthcare/index.vue'),
      meta: { title: '医疗卫生招聘管理', moduleCode: 'emp_industry_medical' },
    },
    {
      path: 'industry/finance',
      name: 'IndustryFinance',
      component: () => import('@/views/employment/finance/index.vue'),
      meta: { title: '银行/金融招聘管理', moduleCode: 'emp_industry_bank' },
    },
  ],
}

export default employmentRoutes
```
