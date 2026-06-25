# 基层服务/社区/公益招聘页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three new employment modules (grassroots, community, welfare) to the C-end with list/detail pages.

**Architecture:** Each module follows the existing teacher pattern: TypeScript types → API layer → List.vue → Detail.vue. Router entries added, unified search page tabs updated to redirect.

**Tech Stack:** Vue 3 + Composition API + TypeScript + Element Plus + Tailwind CSS + Axios

---

### Task 1: Type Definitions (3 files)

**Files:**
- Create: `apps/user/src/types/employment/grassroots/index.ts`
- Create: `apps/user/src/types/employment/community/index.ts`
- Create: `apps/user/src/types/employment/welfare/index.ts`

- [ ] **Step 1: Create grassroots types**

```typescript
export interface GrassrootsQueryDTO {
  page?: number
  size?: number
  positionName?: string
  organizingDept?: string
  serviceUnit?: string
  projectType?: string
  year?: string
  serviceType?: string
  province?: string
  city?: string
  county?: string
  educationRequirement?: string
  majorRequirement?: string
  gradYearRequirement?: string
  targetGroup?: string
  maxServiceYears?: number
  politicalStatus?: string
  positionStatus?: string
  ageLimitMin?: number
  ageLimitMax?: number
}

export interface GrassrootsPositionListVO {
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
  educationRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  politicalStatus: string
}

export interface GrassrootsPositionDetailVO {
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
  otherRequirement: string
  politicalStatus: string
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
}
```

- [ ] **Step 2: Create community types**

```typescript
export interface CommunityQueryDTO {
  page?: number
  size?: number
  positionName?: string
  streetOffice?: string
  communityName?: string
  supervisingDept?: string
  positionType?: string
  employmentType?: string
  province?: string
  city?: string
  educationRequirement?: string
  majorRequirement?: string
  politicalStatus?: string
  workExperience?: string
  positionStatus?: string
  ageLimitMin?: number
  ageLimitMax?: number
}

export interface CommunityPositionListVO {
  id: number
  communityName: string
  district: string
  positionName: string
  educationRequirement: string
  majorRequirement: string
  positionType: string
  province: string
  city: string
  ageLimit: number
  recruitmentCount: number
  workExperience: string
}

export interface CommunityPositionDetailVO {
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
}
```

- [ ] **Step 3: Create welfare types**

```typescript
export interface WelfareQueryDTO {
  page?: number
  size?: number
  positionName?: string
  developingUnit?: string
  employingUnit?: string
  positionCategory?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  householdRequirement?: string
  maxServiceYears?: number
  positionStatus?: string
  targetGroup?: string
  ageRangeMin?: number
  ageRangeMax?: number
}

export interface WelfarePositionListVO {
  id: number
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  province: string
  city: string
  district: string
  educationRequirement: string
  recruitmentCount: number
  monthlySalary: string
  contractPeriod: string
  maxServiceYears: number
  regStartDate: string
  regEndDate: string
}

export interface WelfarePositionDetailVO {
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
}
```

---

### Task 2: API Files (3 files)

**Files:**
- Create: `apps/user/src/api/employment/grassroots/index.ts`
- Create: `apps/user/src/api/employment/community/index.ts`
- Create: `apps/user/src/api/employment/welfare/index.ts`

- [ ] **Step 1: Create grassroots API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { GrassrootsPositionListVO, GrassrootsPositionDetailVO, GrassrootsQueryDTO } from '@/types/employment/grassroots'

export const getGrassrootsList = (params: GrassrootsQueryDTO) => {
  return request.get<R<PageResult<GrassrootsPositionListVO>>>('/api/v1/app/employment/grassroots/project/list', { params })
}

export const getGrassrootsDetail = (id: number) => {
  return request.get<R<GrassrootsPositionDetailVO>>(`/api/v1/app/employment/grassroots/project/${id}/detail`)
}
```

- [ ] **Step 2: Create community API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { CommunityPositionListVO, CommunityPositionDetailVO, CommunityQueryDTO } from '@/types/employment/community'

export const getCommunityList = (params: CommunityQueryDTO) => {
  return request.get<R<PageResult<CommunityPositionListVO>>>('/api/v1/app/employment/grassroots/community/list', { params })
}

export const getCommunityDetail = (id: number) => {
  return request.get<R<CommunityPositionDetailVO>>(`/api/v1/app/employment/grassroots/community/${id}/detail`)
}
```

- [ ] **Step 3: Create welfare API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { WelfarePositionListVO, WelfarePositionDetailVO, WelfareQueryDTO } from '@/types/employment/welfare'

export const getWelfareList = (params: WelfareQueryDTO) => {
  return request.get<R<PageResult<WelfarePositionListVO>>>('/api/v1/app/employment/grassroots/welfare/list', { params })
}

export const getWelfareDetail = (id: number) => {
  return request.get<R<WelfarePositionDetailVO>>(`/api/v1/app/employment/grassroots/welfare/${id}/detail`)
}
```

---

### Task 3: Grassroots List View

**File:** Create `apps/user/src/views/employment/grassroots/List.vue`

Build the full List.vue following the teacher/List.vue pattern with grassroots-specific fields. Features:
- Keyword search (positionName/organizingDept/serviceUnit)
- Filter dropdowns: projectType (三支一扶/西部计划), year, serviceType, region cascader, educationRequirement, majorRequirement, gradYearRequirement (当前年~前5年下拉), targetGroup (高校毕业生/就业困难人员/退役军人/脱贫人口/残疾人/农民工/其他), maxServiceYears (1/2/3/5), politicalStatus, ageLimitMin/Max, positionStatus
- Card list with: tag labels, positionName, organizingDept, projectType, year, serviceType, serviceUnit, location, recruitmentCount, ageLimit, education, politicalStatus, registration date range
- "查看详情" button, goDetail with auth check
- Pagination with sizes 10/20/30/50/100

---

### Task 4: Grassroots Detail View

**File:** Create `apps/user/src/views/employment/grassroots/Detail.vue`

Build the full Detail.vue following teacher/Detail.vue pattern with 4 info card sections:
1. 岗位概要: positionName, projectType, organizingDept, serviceUnit, education, ageLimit, recruitmentCount, location
2. 详细信息: serviceType, year, servicePeriod, serviceStartDate~serviceEndDate, majorRequirement, gradYearRequirement, householdRequirement, politicalStatus, otherRequirement
3. 待遇与政策: monthlySubsidy, socialInsurance, housingInfo, otherBenefits, afterServicePolicy, canTransferToCivil, canTransferToInstitution, examBonusPoints, tuitionCompensation, postgradBonus
4. 报名信息: regStartDate~regEndDate, examContent, examTime, interviewForm, applyLink, contactPhone, remark, content(HTML)

---

### Task 5: Community List View

**File:** Create `apps/user/src/views/employment/community/List.vue`

Follow grassroots/List.vue pattern with community-specific fields:
- Keyword search (positionName/streetOffice/communityName/supervisingDept)
- Filter dropdowns: positionType, employmentType, region, educationRequirement, majorRequirement, politicalStatus, workExperience, ageLimitMin/Max, positionStatus
- Card list with community-specific display fields

---

### Task 6: Community Detail View

**File:** Create `apps/user/src/views/employment/community/Detail.vue`

4 info card sections following grassroots/Detail.vue pattern:
1. 岗位概要: positionName, communityName, streetOffice, positionType, salaryRange, education, ageLimit, recruitmentCount, location
2. 详细信息: employmentType, supervisingDept, majorRequirement, householdRequirement, politicalStatus, workExperience, socialWorkCert, communityExperience, residenceRequirement, workLocation
3. 待遇与考试: salaryRange, salaryComposition, benefits, examContent, interviewForm
4. 报名信息: regStartDate~regEndDate, examTime, applyLink, applyMethod, contactPhone, contactAddress, remark, content

---

### Task 7: Welfare List View

**File:** Create `apps/user/src/views/employment/welfare/List.vue`

Follow grassroots/List.vue pattern with welfare-specific fields.

---

### Task 8: Welfare Detail View

**File:** Create `apps/user/src/views/employment/welfare/Detail.vue`

4 info card sections following grassroots/Detail.vue pattern.

---

### Task 9: Update Router

**File:** Modify `apps/user/src/router/index.ts`

- [ ] Add 6 route entries after finance routes (lines 198-203):

```typescript
{
  path: '/employment/grassroots',
  name: 'EmploymentGrassrootsList',
  component: () => import('@/views/employment/grassroots/List.vue'),
  meta: { title: '基层服务招聘' },
},
{
  path: '/employment/grassroots/:id',
  name: 'EmploymentGrassrootsDetail',
  component: () => import('@/views/employment/grassroots/Detail.vue'),
  meta: { title: '基层服务岗位详情', requiresAuth: true },
},
{
  path: '/employment/community',
  name: 'EmploymentCommunityList',
  component: () => import('@/views/employment/community/List.vue'),
  meta: { title: '社区招聘' },
},
{
  path: '/employment/community/:id',
  name: 'EmploymentCommunityDetail',
  component: () => import('@/views/employment/community/Detail.vue'),
  meta: { title: '社区岗位详情', requiresAuth: true },
},
{
  path: '/employment/welfare',
  name: 'EmploymentWelfareList',
  component: () => import('@/views/employment/welfare/List.vue'),
  meta: { title: '公益招聘' },
},
{
  path: '/employment/welfare/:id',
  name: 'EmploymentWelfareDetail',
  component: () => import('@/views/employment/welfare/Detail.vue'),
  meta: { title: '公益性岗位详情', requiresAuth: true },
},
```

---

### Task 10: Update Unified Search Page Tabs

**File:** Modify `apps/user/src/views/employment/jobs/index.vue`

- [ ] Update `onCategoryTabClick` to add redirects for 基层服务, 社区, 公益岗:

```typescript
function onCategoryTabClick(value: string) {
  if (value === '教师') {
    router.push('/employment/teacher')
    return
  }
  if (value === '医疗卫生') {
    router.push('/employment/healthcare')
    return
  }
  if (value === '金融银行') {
    router.push('/employment/finance')
    return
  }
  if (value === '基层服务') {
    router.push('/employment/grassroots')
    return
  }
  if (value === '社区工作者') {
    router.push('/employment/community')
    return
  }
  if (value === '公益岗') {
    router.push('/employment/welfare')
    return
  }
  activeCategory.value = value
  page.value = 1
  fetchJobs()
}
```
