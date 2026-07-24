# 行业专项招聘管理模块 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 admin 端行业专项招聘三个页面（教师招聘/医疗卫生/银行金融）的 CRUD + Excel 导入功能

**Architecture:** 每个模块独立一个 API/Type/View 文件。三个页面共享相同的交互模式（搜索栏→工具栏→表格→分页→弹窗），仅字段和接口 URL 不同。路由按三级导航结构注册。

**Tech Stack:** Vue 3 Composition API + `<script setup>` + TypeScript + Element Plus + Tailwind CSS

---

## 文件结构

```
apps/admin/src/
├── types/employment/
│   ├── teacher.ts               教师招聘 VO/DTO
│   ├── healthcare.ts            医疗卫生 VO/DTO
│   └── finance.ts               银行/金融 VO/DTO
├── api/employment/
│   ├── teacher.ts               教师招聘 API
│   ├── healthcare.ts            医疗卫生 API
│   └── finance.ts               银行/金融 API
├── views/employment/
│   ├── teacher/
│   │   └── index.vue            教师招聘页面
│   ├── healthcare/
│   │   └── index.vue            医疗卫生页面
│   └── finance/
│       └── index.vue            银行/金融页面
├── router/modules/
│   └── employment.ts            就业管理→行业专项招聘路由
```

**修改已有文件：**
- `apps/admin/src/router/index.ts` — 导入并注册 employmentRoutes

---

### Task 1: 创建类型定义 — 教师招聘

**Files:**
- Create: `apps/admin/src/types/employment/teacher.ts`

- [ ] **Step 1: 创建目录和文件**

```bash
if (-not (Test-Path -LiteralPath "apps/admin/src/types/employment")) { New-Item -ItemType Directory -Path "apps/admin/src/types/employment" }
```

- [ ] **Step 2: 写入教师招聘类型**

```typescript
export interface TeacherListVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  positionName: string
  recruitmentType: string
  province: string
  city: string
  district: string
  positionStatus: string
  updatedAt: string
}

export interface TeacherDetailVO {
  id: number
  schoolName: string
  schoolType: string
  schoolNature: string
  supervisingDept: string
  positionName: string
  subject: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  teacherCertRequirement: string
  teacherCertSubject: string
  putonghuaLevel: string
  otherCertRequirement: string
  workExperience: string
  isNormalMajor: string
  salaryRange: string
  benefits: string
  examContent: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  positionStatus: string
  applyLink: string
  contactPhone: string
  remark: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TeacherQueryDTO {
  page: number
  size: number
  schoolName?: string
  positionName?: string
  schoolType?: string
  schoolNature?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface TeacherUpdateDTO {
  schoolName?: string
  schoolType?: string
  schoolNature?: string
  supervisingDept?: string
  positionName?: string
  subject?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  teacherCertRequirement?: string
  teacherCertSubject?: string
  putonghuaLevel?: string
  otherCertRequirement?: string
  workExperience?: string
  isNormalMajor?: string
  salaryRange?: string
  benefits?: string
  examContent?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  positionStatus?: string
  applyLink?: string
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

### Task 2: 创建类型定义 — 医疗卫生

**Files:**
- Create: `apps/admin/src/types/employment/healthcare.ts`

- [ ] **Step 1: 写入医疗卫生类型**

```typescript
export interface HealthcareListVO {
  id: number
  institutionName: string
  institutionType: string
  institutionLevel: string
  institutionNature: string
  positionName: string
  positionCategory: string
  department: string
  recruitmentType: string
  province: string
  city: string
  district: string
  positionStatus: string
  updatedAt: string
}

export interface HealthcareDetailVO {
  id: number
  institutionName: string
  institutionType: string
  institutionLevel: string
  institutionNature: string
  positionName: string
  department: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  workExperience: string
  licenseRequirement: string
  titleRequirement: string
  internshipRequirement: string
  researchRequirement: string
  salaryRange: string
  benefits: string
  housingSubsidy: string
  regStartDate: string
  regEndDate: string
  examTime: string
  examContent: string
  applyLink: string
  positionStatus: string
  contactPhone: string
  contactPerson: string
  remark: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface HealthcareQueryDTO {
  page: number
  size: number
  institutionName?: string
  positionName?: string
  institutionNature?: string
  department?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface HealthcareUpdateDTO {
  institutionName?: string
  institutionType?: string
  institutionLevel?: string
  institutionNature?: string
  positionName?: string
  department?: string
  positionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  workExperience?: string
  licenseRequirement?: string
  titleRequirement?: string
  internshipRequirement?: string
  researchRequirement?: string
  salaryRange?: string
  housingSubsidy?: string
  benefits?: string
  examContent?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  applyLink?: string
  positionStatus?: string
  contactPhone?: string
  contactPerson?: string
  remark?: string
  content?: string
  sortOrder?: number
}
```

---

### Task 3: 创建类型定义 — 银行/金融

**Files:**
- Create: `apps/admin/src/types/employment/finance.ts`

- [ ] **Step 1: 写入银行/金融类型**

```typescript
export interface FinanceListVO {
  id: number
  institutionName: string
  institutionCategory: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  positionStatus: string
  updatedAt: string
}

export interface FinanceDetailVO {
  id: number
  institutionName: string
  institutionCategory: string
  institutionType: string
  institutionLogo: string
  branchName: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  workLocation: string
  isRemote: boolean
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorPreference: string[]
  ageLimit: number
  workExperience: string
  recruitmentCount: number
  certRequirements: string[]
  languageRequirement: string
  computerRequirement: string
  otherRequirement: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  benefits: string
  examContent: string
  examTime: string
  interviewRounds: string
  regStartDate: string
  regEndDate: string
  applyLink: string
  positionStatus: string
  contactInfo: string
  remark: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface FinanceQueryDTO {
  page: number
  size: number
  institutionName?: string
  positionName?: string
  institutionCategory?: string
  institutionType?: string
  province?: string
  city?: string
  positionStatus?: string
}

export interface FinanceUpdateDTO {
  institutionName?: string
  institutionCategory?: string
  institutionType?: string
  institutionLogo?: string
  branchName?: string
  positionName?: string
  positionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  workLocation?: string
  isRemote?: boolean
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  majorPreference?: string[]
  ageLimit?: number
  workExperience?: string
  recruitmentCount?: number
  certRequirements?: string[]
  languageRequirement?: string
  computerRequirement?: string
  otherRequirement?: string
  salaryMin?: number
  salaryMax?: number
  salaryText?: string
  benefits?: string
  examContent?: string
  examTime?: string
  interviewRounds?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactInfo?: string
  remark?: string
  content?: string
  sortOrder?: number
}
```

---

### Task 4: 创建 API 层 — 教师招聘

**Files:**
- Create: `apps/admin/src/api/employment/teacher.ts`

- [ ] **Step 1: 写入教师招聘 API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { TeacherListVO, TeacherDetailVO, TeacherQueryDTO, TeacherUpdateDTO, PositionStatusDTO } from '@/types/employment/teacher'

const PREFIX = '/api/v1/admin/employment/industry-position/teacher'

export const getTeacherPage = (params: TeacherQueryDTO) =>
  request.get<R<PageResult<TeacherListVO>>>(`${PREFIX}/list`, { params })

export const getTeacherDetail = (id: number) =>
  request.get<R<TeacherDetailVO>>(`${PREFIX}/${id}/detail`)

export const updateTeacher = (id: number, data: TeacherUpdateDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/update`, data)

export const deleteTeacher = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/delete`)

export const updateTeacherStatus = (id: number, data: PositionStatusDTO) =>
  request.patch<R<void>>(`${PREFIX}/${id}/status`, data)

export const batchDeleteTeacher = (ids: number[]) =>
  request.post<R<void>>(`${PREFIX}/batch-delete`, ids)

export const preValidateTeacher = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importTeacher = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 5: 创建 API 层 — 医疗卫生

**Files:**
- Create: `apps/admin/src/api/employment/healthcare.ts`

- [ ] **Step 1: 写入医疗卫生 API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { HealthcareListVO, HealthcareDetailVO, HealthcareQueryDTO, HealthcareUpdateDTO, PositionStatusDTO } from '@/types/employment/healthcare'

const PREFIX = '/api/v1/admin/employment/industry-position/healthcare'

export const getHealthcarePage = (params: HealthcareQueryDTO) =>
  request.get<R<PageResult<HealthcareListVO>>>(`${PREFIX}/list`, { params })

export const getHealthcareDetail = (id: number) =>
  request.get<R<HealthcareDetailVO>>(`${PREFIX}/${id}/detail`)

export const updateHealthcare = (id: number, data: HealthcareUpdateDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/update`, data)

export const deleteHealthcare = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/delete`)

export const updateHealthcareStatus = (id: number, data: PositionStatusDTO) =>
  request.patch<R<void>>(`${PREFIX}/${id}/status`, data)

export const batchDeleteHealthcare = (ids: number[]) =>
  request.post<R<void>>(`${PREFIX}/batch-delete`, ids)

export const importHealthcare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 6: 创建 API 层 — 银行/金融

**Files:**
- Create: `apps/admin/src/api/employment/finance.ts`

- [ ] **Step 1: 写入银行/金融 API**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { FinanceListVO, FinanceDetailVO, FinanceQueryDTO, FinanceUpdateDTO, PositionStatusDTO } from '@/types/employment/finance'

const PREFIX = '/api/v1/admin/employment/industry-position/finance'

export const getFinancePage = (params: FinanceQueryDTO) =>
  request.get<R<PageResult<FinanceListVO>>>(`${PREFIX}/list`, { params })

export const getFinanceDetail = (id: number) =>
  request.get<R<FinanceDetailVO>>(`${PREFIX}/${id}/detail`)

export const updateFinance = (id: number, data: FinanceUpdateDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/update`, data)

export const deleteFinance = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/delete`)

export const updateFinanceStatus = (id: number, data: PositionStatusDTO) =>
  request.patch<R<void>>(`${PREFIX}/${id}/status`, data)

export const batchDeleteFinance = (ids: number[]) =>
  request.post<R<void>>(`${PREFIX}/batch-delete`, ids)

export const importFinance = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: 创建路由模块 + 注册

**Files:**
- Create: `apps/admin/src/router/modules/employment.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 创建 employment 路由模块**

```typescript
import type { RouteRecordRaw } from 'vue-router'

const employmentRoutes: RouteRecordRaw = {
  path: '/employment',
  name: 'Employment',
  meta: { title: '就业管理', icon: 'Briefcase' },
  redirect: '/employment/industry/teacher',
  children: [
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

- [ ] **Step 2: 修改 `apps/admin/src/router/index.ts`**

在 `import companyRoutes from './modules/company'` 之后添加：
```typescript
import employmentRoutes from './modules/employment'
```

在 `companyRoutes,` 之后添加：
```typescript
      employmentRoutes,
```

---

### Task 8: 创建教师招聘页面

**Files:**
- Create: `apps/admin/src/views/employment/teacher/index.vue`

- [ ] **Step 1: 创建目录**

```bash
if (-not (Test-Path -LiteralPath "apps/admin/src/views/employment/teacher")) { New-Item -ItemType Directory -Path "apps/admin/src/views/employment/teacher" }
```

- [ ] **Step 2: 写入教师招聘页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getTeacherPage,
  getTeacherDetail,
  updateTeacher,
  deleteTeacher,
  updateTeacherStatus,
  batchDeleteTeacher,
  preValidateTeacher,
  importTeacher,
} from '@/api/employment/teacher'
import type {
  TeacherListVO,
  TeacherDetailVO,
  TeacherQueryDTO,
} from '@/types/employment/teacher'

const loading = ref(false)
const tableData = ref<TeacherListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<TeacherQueryDTO>({
  page: 1,
  size: 10,
  schoolName: '',
  positionName: '',
  schoolType: '',
  schoolNature: '',
  recruitmentType: '',
  province: '',
  city: '',
  district: '',
  positionStatus: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<TeacherDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  schoolName: '',
  schoolType: '',
  schoolNature: '',
  supervisingDept: '',
  positionName: '',
  subject: '',
  recruitmentType: '',
  province: '',
  city: '',
  district: '',
  educationRequirement: '',
  degreeRequirement: '',
  majorRequirement: '',
  ageLimit: null,
  recruitmentCount: null,
  teacherCertRequirement: '',
  teacherCertSubject: '',
  putonghuaLevel: '',
  otherCertRequirement: '',
  workExperience: '',
  isNormalMajor: '',
  salaryRange: '',
  benefits: '',
  examContent: '',
  interviewForm: '',
  regStartDate: '',
  regEndDate: '',
  examTime: '',
  positionStatus: '招聘中',
  applyLink: '',
  contactPhone: '',
  remark: '',
  content: '',
  sortOrder: null,
})

const schoolTypeOptions = ['幼儿园', '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']
const schoolNatureOptions = ['公办', '民办']
const recruitmentTypeOptions = ['编制', '合同制', '特岗教师', '人事代理', '编外聘用']
const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术', '心理健康', '通用技术', '科学', '道德与法治', '综合实践', '学前教育', '特殊教育', '其他']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const putonghuaOptions = ['不限', '二级乙等', '二级甲等', '一级乙等', '一级甲等']
const normalMajorOptions = ['要求', '优先', '不限']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const positionStatusTag: Record<string, string> = {
  '招聘中': 'success',
  '已结束': 'info',
  '即将开始': 'warning',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.schoolName) params.schoolName = queryParams.schoolName
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.schoolType) params.schoolType = queryParams.schoolType
    if (queryParams.schoolNature) params.schoolNature = queryParams.schoolNature
    if (queryParams.recruitmentType) params.recruitmentType = queryParams.recruitmentType
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.district) params.district = queryParams.district
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getTeacherPage(params as TeacherQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {
  queryParams.schoolName = ''
  queryParams.positionName = ''
  queryParams.schoolType = ''
  queryParams.schoolNature = ''
  queryParams.recruitmentType = ''
  queryParams.province = ''
  queryParams.city = ''
  queryParams.district = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: TeacherListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  Object.keys(formData).forEach((k) => {
    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : ''
  })
  formData.positionStatus = '招聘中'
}

const fillForm = (d: TeacherDetailVO) => {
  formData.schoolName = d.schoolName || ''
  formData.schoolType = d.schoolType || ''
  formData.schoolNature = d.schoolNature || ''
  formData.supervisingDept = d.supervisingDept || ''
  formData.positionName = d.positionName || ''
  formData.subject = d.subject || ''
  formData.recruitmentType = d.recruitmentType || ''
  formData.province = d.province || ''
  formData.city = d.city || ''
  formData.district = d.district || ''
  formData.educationRequirement = d.educationRequirement || ''
  formData.degreeRequirement = d.degreeRequirement || ''
  formData.majorRequirement = d.majorRequirement || ''
  formData.ageLimit = d.ageLimit ?? null
  formData.recruitmentCount = d.recruitmentCount ?? null
  formData.teacherCertRequirement = d.teacherCertRequirement || ''
  formData.teacherCertSubject = d.teacherCertSubject || ''
  formData.putonghuaLevel = d.putonghuaLevel || ''
  formData.otherCertRequirement = d.otherCertRequirement || ''
  formData.workExperience = d.workExperience || ''
  formData.isNormalMajor = d.isNormalMajor || ''
  formData.salaryRange = d.salaryRange || ''
  formData.benefits = d.benefits || ''
  formData.examContent = d.examContent || ''
  formData.interviewForm = d.interviewForm || ''
  formData.regStartDate = d.regStartDate || ''
  formData.regEndDate = d.regEndDate || ''
  formData.examTime = d.examTime || ''
  formData.positionStatus = d.positionStatus || '招聘中'
  formData.applyLink = d.applyLink || ''
  formData.contactPhone = d.contactPhone || ''
  formData.remark = d.remark || ''
  formData.content = d.content || ''
  formData.sortOrder = d.sortOrder ?? null
}

const openDialog = async (mode: 'detail' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'edit' && id) {
    dialogTitle.value = '修改教师招聘岗位'
    formLoading.value = true
    try {
      const res = await getTeacherDetail(id)
      if (res.data.code === 200) {
        fillForm(res.data.data)
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '教师招聘详情'
    formLoading.value = true
    try {
      const res = await getTeacherDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!currentId.value) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['schoolName', 'schoolType', 'schoolNature', 'supervisingDept', 'positionName', 'subject', 'recruitmentType', 'province', 'city', 'district', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'teacherCertRequirement', 'teacherCertSubject', 'putonghuaLevel', 'otherCertRequirement', 'workExperience', 'isNormalMajor', 'salaryRange', 'benefits', 'examContent', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'contactPhone', 'remark', 'content']
    stringFields.forEach((f) => {
      if (formData[f]) data[f] = formData[f]
    })
    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
    numberFields.forEach((f) => {
      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]
    })

    const res = await updateTeacher(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '操作失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该教师招聘岗位吗？', '提示')
    const res = await deleteTeacher(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteTeacher(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // cancel
  }
}

const handleStatusChange = async (row: TeacherListVO, newStatus: string) => {
  try {
    const res = await updateTeacherStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '操作失败')
  }
}

const preValidateDialogVisible = ref(false)
const preValidateFile = ref<File | null>(null)
const preValidateLoading = ref(false)

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openPreValidateDialog = () => {
  preValidateFile.value = null
  preValidateDialogVisible.value = true
}

const openImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handlePreValidateFileChange = (uploadFile: any) => {
  preValidateFile.value = uploadFile.raw
  return false
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handlePreValidateSubmit = async () => {
  if (!preValidateFile.value) { ElMessage.warning('请选择文件'); return }
  preValidateLoading.value = true
  try {
    const res = await preValidateTeacher(preValidateFile.value)
    if (res.data.code === 200) {
      ElMessage.success('校验通过')
      preValidateDialogVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '校验失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '校验失败')
  } finally {
    preValidateLoading.value = false
  }
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importTeacher(importFile.value)
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '导入失败')
  } finally {
    importLoading.value = false
  }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="学校名称">
          <el-input v-model="queryParams.schoolName" placeholder="学校名称" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="学校类型">
          <el-select v-model="queryParams.schoolType" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="学校性质">
          <el-select v-model="queryParams.schoolNature" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="招聘类型">
          <el-select v-model="queryParams.recruitmentType" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="区/县">
          <el-input v-model="queryParams.district" placeholder="区/县" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">
            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="warning" @click="openPreValidateDialog">Excel预校验</el-button>
        <el-button type="success" @click="openImportDialog">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="schoolName" label="学校名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="schoolType" label="学校类型" width="100" />
        <el-table-column prop="schoolNature" label="性质" width="80" />
        <el-table-column prop="positionName" label="岗位名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="recruitmentType" label="招聘类型" width="100" />
        <el-table-column prop="province" label="省份" width="80" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="district" label="区/县" width="80" />
        <el-table-column prop="positionStatus" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="positionStatusTag[row.positionStatus] || 'info'" size="small">{{ row.positionStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-dropdown @command="(val: string) => handleStatusChange(row, val)">
              <el-button type="primary" link>
                {{ row.positionStatus }}
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="opt in positionStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="学校名称">{{ detailData.schoolName }}</el-descriptions-item>
            <el-descriptions-item label="学校类型">{{ detailData.schoolType }}</el-descriptions-item>
            <el-descriptions-item label="学校性质">{{ detailData.schoolNature }}</el-descriptions-item>
            <el-descriptions-item label="主管教育部门">{{ detailData.supervisingDept || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>
            <el-descriptions-item label="学科">{{ detailData.subject }}</el-descriptions-item>
            <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
            <el-descriptions-item label="区/县">{{ detailData.district || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="教师资格证">{{ detailData.teacherCertRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="资格证学科">{{ detailData.teacherCertSubject || '-' }}</el-descriptions-item>
            <el-descriptions-item label="普通话等级">{{ detailData.putonghuaLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="其他证书要求">{{ detailData.otherCertRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="教学经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>
            <el-descriptions-item label="师范专业要求">{{ detailData.isNormalMajor || '-' }}</el-descriptions-item>
            <el-descriptions-item label="薪资待遇">{{ detailData.salaryRange || '-' }}</el-descriptions-item>
            <el-descriptions-item label="福利待遇">{{ detailData.benefits || '-' }}</el-descriptions-item>
            <el-descriptions-item label="笔试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>
            <el-descriptions-item label="面试形式">{{ detailData.interviewForm || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="报名链接">
              <template v-if="detailData.applyLink">
                <el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'edit'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="学校与岗位信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学校名称">
                      <el-input v-model="formData.schoolName" placeholder="学校名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学校类型">
                      <el-select v-model="formData.schoolType" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学校性质">
                      <el-select v-model="formData.schoolNature" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="主管教育部门">
                      <el-input v-model="formData.supervisingDept" placeholder="主管教育部门" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="岗位名称">
                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学科">
                      <el-select v-model="formData.subject" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in subjectOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="招聘类型">
                  <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="地区与报考要求" name="location">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="省份">
                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="城市">
                      <el-input v-model="formData.city" placeholder="城市" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="区/县">
                      <el-input v-model="formData.district" placeholder="区/县" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学历要求">
                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学位要求">
                      <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="专业要求">
                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="年龄上限">
                      <el-input-number v-model="formData.ageLimit" :min="18" :max="60" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="招聘人数">
                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="资质与待遇" name="cert">
              <el-form :model="formData" label-width="140px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="教师资格证要求">
                      <el-input v-model="formData.teacherCertRequirement" placeholder="教师资格证要求" maxlength="100" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="资格证学科要求">
                      <el-input v-model="formData.teacherCertSubject" placeholder="资格证学科要求" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="普通话等级">
                      <el-select v-model="formData.putonghuaLevel" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in putonghuaOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="其他证书要求">
                      <el-input v-model="formData.otherCertRequirement" placeholder="其他证书要求" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="教学经验要求">
                      <el-input v-model="formData.workExperience" placeholder="教学经验要求" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="师范专业要求">
                      <el-select v-model="formData.isNormalMajor" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in normalMajorOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="薪资待遇">
                      <el-input v-model="formData.salaryRange" placeholder="薪资待遇" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="排序">
                      <el-input-number v-model="formData.sortOrder" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="福利待遇">
                  <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="考试与补充" name="exam">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-form-item label="笔试内容">
                  <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="笔试内容" maxlength="500" show-word-limit />
                </el-form-item>
                <el-form-item label="面试形式">
                  <el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="报名开始">
                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="报名截止">
                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="考试时间">
                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="状态">
                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系电话">
                      <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="报名链接">
                  <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />
                </el-form-item>
                <el-form-item label="详细说明">
                  <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="详细说明" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="preValidateDialogVisible" title="Excel预校验" width="500px">
      <el-upload
        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"
        :on-change="handlePreValidateFileChange" :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="preValidateDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="preValidateLoading" @click="handlePreValidateSubmit">开始校验</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px">
      <el-upload
        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"
        :on-change="handleImportFileChange" :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 9: 创建医疗卫生页面

**Files:**
- Create: `apps/admin/src/views/employment/healthcare/index.vue`

- [ ] **Step 1: 创建目录**

```bash
if (-not (Test-Path -LiteralPath "apps/admin/src/views/employment/healthcare")) { New-Item -ItemType Directory -Path "apps/admin/src/views/employment/healthcare" }
```

- [ ] **Step 2: 写入医疗卫生页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getHealthcarePage,
  getHealthcareDetail,
  updateHealthcare,
  deleteHealthcare,
  updateHealthcareStatus,
  batchDeleteHealthcare,
  importHealthcare,
} from '@/api/employment/healthcare'
import type {
  HealthcareListVO,
  HealthcareDetailVO,
  HealthcareQueryDTO,
} from '@/types/employment/healthcare'

const loading = ref(false)
const tableData = ref<HealthcareListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<HealthcareQueryDTO>({
  page: 1,
  size: 10,
  institutionName: '',
  positionName: '',
  institutionNature: '',
  department: '',
  province: '',
  city: '',
  district: '',
  positionStatus: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<HealthcareDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  institutionName: '',
  institutionType: '',
  institutionLevel: '',
  institutionNature: '',
  positionName: '',
  department: '',
  positionCategory: '',
  recruitmentType: '',
  province: '',
  city: '',
  district: '',
  educationRequirement: '',
  degreeRequirement: '',
  majorRequirement: '',
  ageLimit: null,
  recruitmentCount: null,
  workExperience: '',
  licenseRequirement: '',
  titleRequirement: '',
  internshipRequirement: '',
  researchRequirement: '',
  salaryRange: '',
  housingSubsidy: '',
  benefits: '',
  examContent: '',
  regStartDate: '',
  regEndDate: '',
  examTime: '',
  positionStatus: '招聘中',
  applyLink: '',
  contactPhone: '',
  contactPerson: '',
  remark: '',
  content: '',
  sortOrder: null,
})

const institutionTypeOptions = ['综合医院', '专科医院', '中医医院', '社区卫生服务中心', '疾控中心', '妇幼保健院', '卫生监督所', '急救中心', '血站', '精神卫生中心', '康复中心', '其他']
const institutionLevelOptions = ['三级甲等', '三级乙等', '二级甲等', '二级乙等', '一级', '未定级', '社区']
const institutionNatureOptions = ['公立', '民营']
const positionCategoryOptions = ['临床医师', '护理', '药学', '医技', '公共卫生', '行政后勤', '科研']
const recruitmentTypeOptions = ['编制', '合同制', '人事代理', '规培', '进修']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const titleOptions = ['不限', '初级', '中级', '副高级', '正高级']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const positionStatusTag: Record<string, string> = {
  '招聘中': 'success',
  '已结束': 'info',
  '即将开始': 'warning',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.institutionName) params.institutionName = queryParams.institutionName
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.institutionNature) params.institutionNature = queryParams.institutionNature
    if (queryParams.department) params.department = queryParams.department
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.district) params.district = queryParams.district
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getHealthcarePage(params as HealthcareQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.institutionName = ''
  queryParams.positionName = ''
  queryParams.institutionNature = ''
  queryParams.department = ''
  queryParams.province = ''
  queryParams.city = ''
  queryParams.district = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: HealthcareListVO[]) => { selectedIds.value = rows.map((r) => r.id) }

const resetForm = () => {
  Object.keys(formData).forEach((k) => {
    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : ''
  })
  formData.positionStatus = '招聘中'
}

const fillForm = (d: HealthcareDetailVO) => {
  formData.institutionName = d.institutionName || ''
  formData.institutionType = d.institutionType || ''
  formData.institutionLevel = d.institutionLevel || ''
  formData.institutionNature = d.institutionNature || ''
  formData.positionName = d.positionName || ''
  formData.department = d.department || ''
  formData.positionCategory = d.positionCategory || ''
  formData.recruitmentType = d.recruitmentType || ''
  formData.province = d.province || ''
  formData.city = d.city || ''
  formData.district = d.district || ''
  formData.educationRequirement = d.educationRequirement || ''
  formData.degreeRequirement = d.degreeRequirement || ''
  formData.majorRequirement = d.majorRequirement || ''
  formData.ageLimit = d.ageLimit ?? null
  formData.recruitmentCount = d.recruitmentCount ?? null
  formData.workExperience = d.workExperience || ''
  formData.licenseRequirement = d.licenseRequirement || ''
  formData.titleRequirement = d.titleRequirement || ''
  formData.internshipRequirement = d.internshipRequirement || ''
  formData.researchRequirement = d.researchRequirement || ''
  formData.salaryRange = d.salaryRange || ''
  formData.housingSubsidy = d.housingSubsidy || ''
  formData.benefits = d.benefits || ''
  formData.examContent = d.examContent || ''
  formData.regStartDate = d.regStartDate || ''
  formData.regEndDate = d.regEndDate || ''
  formData.examTime = d.examTime || ''
  formData.positionStatus = d.positionStatus || '招聘中'
  formData.applyLink = d.applyLink || ''
  formData.contactPhone = d.contactPhone || ''
  formData.contactPerson = d.contactPerson || ''
  formData.remark = d.remark || ''
  formData.content = d.content || ''
  formData.sortOrder = d.sortOrder ?? null
}

const openDialog = async (mode: 'detail' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'
  if (mode === 'edit' && id) {
    dialogTitle.value = '修改医疗卫生岗位'
    formLoading.value = true
    try {
      const res = await getHealthcareDetail(id)
      if (res.data.code === 200) fillForm(res.data.data)
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '医疗卫生岗位详情'
    formLoading.value = true
    try {
      const res = await getHealthcareDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!currentId.value) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['institutionName', 'institutionType', 'institutionLevel', 'institutionNature', 'positionName', 'department', 'positionCategory', 'recruitmentType', 'province', 'city', 'district', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'workExperience', 'licenseRequirement', 'titleRequirement', 'internshipRequirement', 'researchRequirement', 'salaryRange', 'housingSubsidy', 'benefits', 'examContent', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'contactPhone', 'contactPerson', 'remark', 'content']
    stringFields.forEach((f) => { if (formData[f]) data[f] = formData[f] })
    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']
    numberFields.forEach((f) => { if (formData[f] !== null && formData[f] !== '') data[f] = formData[f] })
    const res = await updateHealthcare(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该医疗卫生岗位吗？', '提示')
    const res = await deleteHealthcare(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteHealthcare(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() }
    else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}

const handleStatusChange = async (row: HealthcareListVO, newStatus: string) => {
  try {
    const res = await updateHealthcareStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) { ElMessage.success('状态更新成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openImportDialog = () => { importFile.value = null; importDialogVisible.value = true }
const handleImportFileChange = (uploadFile: any) => { importFile.value = uploadFile.raw; return false }

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importHealthcare(importFile.value)
    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.data.msg || '导入失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="机构名称">
          <el-input v-model="queryParams.institutionName" placeholder="机构名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="机构性质">
          <el-select v-model="queryParams.institutionNature" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="item in institutionNatureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="科室">
          <el-input v-model="queryParams.department" placeholder="科室" clearable style="width: 120px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="区/县">
          <el-input v-model="queryParams.district" placeholder="区/县" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">
            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="success" @click="openImportDialog">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="institutionName" label="机构名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="institutionType" label="机构类型" width="100" />
        <el-table-column prop="institutionLevel" label="等级" width="80" />
        <el-table-column prop="institutionNature" label="性质" width="70" />
        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="positionCategory" label="岗位类别" width="100" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="recruitmentType" label="招聘类型" width="100" />
        <el-table-column prop="province" label="省份" width="80" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="positionStatus" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="positionStatusTag[row.positionStatus] || 'info'" size="small">{{ row.positionStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-dropdown @command="(val: string) => handleStatusChange(row, val)">
              <el-button type="primary" link>
                {{ row.positionStatus }}
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="opt in positionStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="机构名称">{{ detailData.institutionName }}</el-descriptions-item>
            <el-descriptions-item label="机构类型">{{ detailData.institutionType }}</el-descriptions-item>
            <el-descriptions-item label="机构等级">{{ detailData.institutionLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="机构性质">{{ detailData.institutionNature || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>
            <el-descriptions-item label="科室">{{ detailData.department || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位类别">{{ detailData.positionCategory }}</el-descriptions-item>
            <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
            <el-descriptions-item label="区/县">{{ detailData.district || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>
            <el-descriptions-item label="执业资格证要求">{{ detailData.licenseRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="职称要求">{{ detailData.titleRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="规培要求">{{ detailData.internshipRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="科研要求" :span="2">{{ detailData.researchRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="薪资待遇">{{ detailData.salaryRange || '-' }}</el-descriptions-item>
            <el-descriptions-item label="住房补贴">{{ detailData.housingSubsidy || '-' }}</el-descriptions-item>
            <el-descriptions-item label="福利待遇" :span="2">{{ detailData.benefits || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名链接" :span="2">
              <template v-if="detailData.applyLink"><el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link></template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ detailData.contactPerson || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'edit'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="机构与岗位信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="机构名称">
                      <el-input v-model="formData.institutionName" placeholder="机构名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构类型">
                      <el-select v-model="formData.institutionType" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in institutionTypeOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="机构等级">
                      <el-select v-model="formData.institutionLevel" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in institutionLevelOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构性质">
                      <el-select v-model="formData.institutionNature" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in institutionNatureOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="岗位名称">
                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="科室">
                      <el-input v-model="formData.department" placeholder="科室" maxlength="100" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="岗位类别">
                      <el-select v-model="formData.positionCategory" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="招聘类型">
                      <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="地区与报考要求" name="location">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="省份">
                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="城市">
                      <el-input v-model="formData.city" placeholder="城市" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="区/县">
                      <el-input v-model="formData.district" placeholder="区/县" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学历要求">
                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学位要求">
                      <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="专业要求">
                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="年龄上限">
                      <el-input-number v-model="formData.ageLimit" :min="18" :max="65" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="招聘人数">
                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="工作经验要求">
                  <el-input v-model="formData.workExperience" placeholder="工作经验要求" maxlength="50" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="资质与待遇" name="cert">
              <el-form :model="formData" label-width="140px" class="mt-2">
                <el-form-item label="执业资格证要求">
                  <el-input v-model="formData.licenseRequirement" placeholder="执业资格证要求" maxlength="100" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="职称要求">
                      <el-select v-model="formData.titleRequirement" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="规培要求">
                      <el-input v-model="formData.internshipRequirement" placeholder="规培要求" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="科研要求">
                  <el-input v-model="formData.researchRequirement" type="textarea" :rows="3" placeholder="科研要求" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="薪资待遇">
                      <el-input v-model="formData.salaryRange" placeholder="薪资待遇" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="住房补贴">
                      <el-input v-model="formData.housingSubsidy" placeholder="住房补贴" maxlength="100" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="福利待遇">
                  <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />
                </el-form-item>
                <el-form-item label="排序">
                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="考试与补充" name="exam">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-form-item label="考试内容">
                  <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="考试内容" maxlength="500" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="报名开始">
                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="报名截止">
                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="考试时间">
                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="状态">
                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系电话">
                      <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="联系人">
                  <el-input v-model="formData.contactPerson" placeholder="联系人" maxlength="50" />
                </el-form-item>
                <el-form-item label="报名链接">
                  <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />
                </el-form-item>
                <el-form-item label="详细说明">
                  <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="详细说明" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px">
      <el-upload
        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"
        :on-change="handleImportFileChange" :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 10: 创建银行/金融页面

**Files:**
- Create: `apps/admin/src/views/employment/finance/index.vue`

- [ ] **Step 1: 创建目录**

```bash
if (-not (Test-Path -LiteralPath "apps/admin/src/views/employment/finance")) { New-Item -ItemType Directory -Path "apps/admin/src/views/employment/finance" }
```

- [ ] **Step 2: 写入银行/金融页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getFinancePage,
  getFinanceDetail,
  updateFinance,
  deleteFinance,
  updateFinanceStatus,
  batchDeleteFinance,
  importFinance,
} from '@/api/employment/finance'
import type {
  FinanceListVO,
  FinanceDetailVO,
  FinanceQueryDTO,
} from '@/types/employment/finance'

const loading = ref(false)
const tableData = ref<FinanceListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<FinanceQueryDTO>({
  page: 1,
  size: 10,
  institutionName: '',
  positionName: '',
  institutionCategory: '',
  institutionType: '',
  province: '',
  city: '',
  positionStatus: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<FinanceDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  institutionName: '',
  institutionCategory: '',
  institutionType: '',
  institutionLogo: '',
  branchName: '',
  positionName: '',
  positionCategory: '',
  recruitmentType: '',
  province: '',
  city: '',
  workLocation: '',
  isRemote: false,
  educationRequirement: '',
  degreeRequirement: '',
  majorRequirement: '',
  majorPreference: '',
  ageLimit: null,
  workExperience: '',
  recruitmentCount: null,
  certRequirements: '',
  languageRequirement: '',
  computerRequirement: '',
  otherRequirement: '',
  salaryMin: null,
  salaryMax: null,
  salaryText: '',
  benefits: '',
  examContent: '',
  examTime: '',
  interviewRounds: '',
  regStartDate: '',
  regEndDate: '',
  applyLink: '',
  positionStatus: '招聘中',
  contactInfo: '',
  remark: '',
  content: '',
  sortOrder: null,
})

const institutionCategoryOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']
const recruitmentTypeOptions = ['秋招', '春招', '社招', '实习', '定向']
const educationOptions = ['不限', '大专', '本科', '硕士', '博士']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const positionStatusTag: Record<string, string> = {
  '招聘中': 'success',
  '已结束': 'info',
  '即将开始': 'warning',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.institutionName) params.institutionName = queryParams.institutionName
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.institutionCategory) params.institutionCategory = queryParams.institutionCategory
    if (queryParams.institutionType) params.institutionType = queryParams.institutionType
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getFinancePage(params as FinanceQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.institutionName = ''
  queryParams.positionName = ''
  queryParams.institutionCategory = ''
  queryParams.institutionType = ''
  queryParams.province = ''
  queryParams.city = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: FinanceListVO[]) => { selectedIds.value = rows.map((r) => r.id) }

const resetForm = () => {
  Object.keys(formData).forEach((k) => {
    if (k === 'isRemote') { formData[k] = false; return }
    formData[k] = ['ageLimit', 'recruitmentCount', 'salaryMin', 'salaryMax', 'sortOrder'].includes(k) ? null : ''
  })
  formData.positionStatus = '招聘中'
}

const fillForm = (d: FinanceDetailVO) => {
  formData.institutionName = d.institutionName || ''
  formData.institutionCategory = d.institutionCategory || ''
  formData.institutionType = d.institutionType || ''
  formData.institutionLogo = d.institutionLogo || ''
  formData.branchName = d.branchName || ''
  formData.positionName = d.positionName || ''
  formData.positionCategory = d.positionCategory || ''
  formData.recruitmentType = d.recruitmentType || ''
  formData.province = d.province || ''
  formData.city = d.city || ''
  formData.workLocation = d.workLocation || ''
  formData.isRemote = d.isRemote ?? false
  formData.educationRequirement = d.educationRequirement || ''
  formData.degreeRequirement = d.degreeRequirement || ''
  formData.majorRequirement = d.majorRequirement || ''
  formData.majorPreference = d.majorPreference?.join(', ') || ''
  formData.ageLimit = d.ageLimit ?? null
  formData.workExperience = d.workExperience || ''
  formData.recruitmentCount = d.recruitmentCount ?? null
  formData.certRequirements = d.certRequirements?.join(', ') || ''
  formData.languageRequirement = d.languageRequirement || ''
  formData.computerRequirement = d.computerRequirement || ''
  formData.otherRequirement = d.otherRequirement || ''
  formData.salaryMin = d.salaryMin ?? null
  formData.salaryMax = d.salaryMax ?? null
  formData.salaryText = d.salaryText || ''
  formData.benefits = d.benefits || ''
  formData.examContent = d.examContent || ''
  formData.examTime = d.examTime || ''
  formData.interviewRounds = d.interviewRounds || ''
  formData.regStartDate = d.regStartDate || ''
  formData.regEndDate = d.regEndDate || ''
  formData.applyLink = d.applyLink || ''
  formData.positionStatus = d.positionStatus || '招聘中'
  formData.contactInfo = d.contactInfo || ''
  formData.remark = d.remark || ''
  formData.content = d.content || ''
  formData.sortOrder = d.sortOrder ?? null
}

const openDialog = async (mode: 'detail' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'
  if (mode === 'edit' && id) {
    dialogTitle.value = '修改银行/金融岗位'
    formLoading.value = true
    try {
      const res = await getFinanceDetail(id)
      if (res.data.code === 200) fillForm(res.data.data)
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '银行/金融岗位详情'
    formLoading.value = true
    try {
      const res = await getFinanceDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!currentId.value) return
  try {
    const data: Record<string, any> = {}
    const stringFields = ['institutionName', 'institutionCategory', 'institutionType', 'institutionLogo', 'branchName', 'positionName', 'positionCategory', 'recruitmentType', 'province', 'city', 'workLocation', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'workExperience', 'languageRequirement', 'computerRequirement', 'otherRequirement', 'salaryText', 'benefits', 'examContent', 'examTime', 'interviewRounds', 'regStartDate', 'regEndDate', 'applyLink', 'positionStatus', 'contactInfo', 'remark', 'content']
    stringFields.forEach((f) => { if (formData[f]) data[f] = formData[f] })
    const numberFields = ['ageLimit', 'recruitmentCount', 'salaryMin', 'salaryMax', 'sortOrder']
    numberFields.forEach((f) => { if (formData[f] !== null && formData[f] !== '') data[f] = formData[f] })
    if (formData.isRemote) data.isRemote = true

    if (formData.majorPreference) {
      data.majorPreference = formData.majorPreference.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
    }
    if (formData.certRequirements) {
      data.certRequirements = formData.certRequirements.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
    }

    const res = await updateFinance(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该银行/金融岗位吗？', '提示')
    const res = await deleteFinance(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteFinance(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() }
    else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}

const handleStatusChange = async (row: FinanceListVO, newStatus: string) => {
  try {
    const res = await updateFinanceStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) { ElMessage.success('状态更新成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openImportDialog = () => { importFile.value = null; importDialogVisible.value = true }
const handleImportFileChange = (uploadFile: any) => { importFile.value = uploadFile.raw; return false }

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importFinance(importFile.value)
    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.data.msg || '导入失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="机构名称">
          <el-input v-model="queryParams.institutionName" placeholder="机构名称" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="机构大类">
          <el-select v-model="queryParams.institutionCategory" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in institutionCategoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="机构类型">
          <el-input v-model="queryParams.institutionType" placeholder="机构类型" clearable style="width: 120px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">
            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="success" @click="openImportDialog">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="institutionName" label="机构名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="institutionCategory" label="机构大类" width="90" />
        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="positionCategory" label="岗位类别" width="100" />
        <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
        <el-table-column prop="province" label="省份" width="80" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="positionStatus" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="positionStatusTag[row.positionStatus] || 'info'" size="small">{{ row.positionStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-dropdown @command="(val: string) => handleStatusChange(row, val)">
              <el-button type="primary" link>
                {{ row.positionStatus }}
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="opt in positionStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="机构名称">{{ detailData.institutionName }}</el-descriptions-item>
            <el-descriptions-item label="机构大类">{{ detailData.institutionCategory }}</el-descriptions-item>
            <el-descriptions-item label="机构类型">{{ detailData.institutionType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="分支机构">{{ detailData.branchName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>
            <el-descriptions-item label="岗位类别">{{ detailData.positionCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType }}</el-descriptions-item>
            <el-descriptions-item label="是否远程">{{ detailData.isRemote ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作地点" :span="2">{{ detailData.workLocation || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="优先专业" :span="2">{{ detailData.majorPreference?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="证书要求" :span="2">{{ detailData.certRequirements?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="语言要求">{{ detailData.languageRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计算机要求">{{ detailData.computerRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="其他要求" :span="2">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="月薪范围">
              {{ detailData.salaryMin != null ? detailData.salaryMin : '-' }} - {{ detailData.salaryMax != null ? detailData.salaryMax : '-' }} k/月
            </el-descriptions-item>
            <el-descriptions-item label="薪资说明">{{ detailData.salaryText || '-' }}</el-descriptions-item>
            <el-descriptions-item label="福利待遇" :span="2">{{ detailData.benefits || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="面试轮次">{{ detailData.interviewRounds || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="网申链接" :span="2">
              <template v-if="detailData.applyLink"><el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link></template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="联系方式">{{ detailData.contactInfo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'edit'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="机构与岗位信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="机构名称">
                      <el-input v-model="formData.institutionName" placeholder="机构名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="机构大类">
                      <el-select v-model="formData.institutionCategory" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in institutionCategoryOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="机构细分类型">
                      <el-input v-model="formData.institutionType" placeholder="机构细分类型" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="分支机构名称">
                      <el-input v-model="formData.branchName" placeholder="分支机构名称" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="机构Logo">
                  <el-input v-model="formData.institutionLogo" placeholder="机构Logo URL" maxlength="500" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="岗位名称">
                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="岗位类别">
                      <el-input v-model="formData.positionCategory" placeholder="岗位类别" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="招聘类型">
                  <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="地区与报考要求" name="location">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="省份">
                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="城市">
                      <el-input v-model="formData.city" placeholder="城市" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="详细工作地点">
                      <el-input v-model="formData.workLocation" placeholder="详细工作地点" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item>
                  <el-checkbox v-model="formData.isRemote" label="支持远程办公" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="学历要求">
                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学位要求">
                      <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="专业要求">
                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="年龄上限">
                      <el-input-number v-model="formData.ageLimit" :min="18" :max="45" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="招聘人数">
                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="工作经验">
                      <el-input v-model="formData.workExperience" placeholder="工作经验" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="资质要求" name="cert">
              <el-form :model="formData" label-width="140px" class="mt-2">
                <el-form-item label="优先专业">
                  <el-input v-model="formData.majorPreference" placeholder="多个专业用逗号分隔" />
                  <span class="ml-2 text-xs text-gray-400">支持中英文逗号</span>
                </el-form-item>
                <el-form-item label="证书要求">
                  <el-input v-model="formData.certRequirements" placeholder="多个证书用逗号分隔（如 CFA,CPA）" />
                  <span class="ml-2 text-xs text-gray-400">支持中英文逗号</span>
                </el-form-item>
                <el-form-item label="语言要求">
                  <el-input v-model="formData.languageRequirement" placeholder="语言要求" maxlength="100" />
                </el-form-item>
                <el-form-item label="计算机要求">
                  <el-input v-model="formData.computerRequirement" placeholder="计算机要求" maxlength="100" />
                </el-form-item>
                <el-form-item label="其他要求">
                  <el-input v-model="formData.otherRequirement" type="textarea" :rows="3" placeholder="其他要求" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="薪资与福利" name="salary">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="最低月薪(k)">
                      <el-input-number v-model="formData.salaryMin" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="最高月薪(k)">
                      <el-input-number v-model="formData.salaryMax" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="薪资文本说明">
                  <el-input v-model="formData.salaryText" placeholder="薪资文本说明" maxlength="100" />
                </el-form-item>
                <el-form-item label="福利待遇">
                  <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />
                </el-form-item>
                <el-form-item label="排序">
                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="考试与补充" name="exam">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-form-item label="考试内容">
                  <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="考试内容" maxlength="500" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-form-item label="考试时间">
                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="报名开始">
                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="报名截止">
                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="面试轮次">
                  <el-input v-model="formData.interviewRounds" placeholder="面试轮次说明" maxlength="100" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="状态">
                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">
                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系方式">
                      <el-input v-model="formData.contactInfo" placeholder="联系方式" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="网申链接">
                  <el-input v-model="formData.applyLink" placeholder="网申链接" maxlength="500" />
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />
                </el-form-item>
                <el-form-item label="详细说明">
                  <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="详细说明" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px">
      <el-upload
        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"
        :on-change="handleImportFileChange" :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="success" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 11: 类型检查验证

- [ ] **Step 1: 运行类型检查**

```bash
# 在项目根目录
cd D:\0code\haifeng\fronted\HaiFeng-Fronted
pnpm --filter @haifeng/admin run typecheck
```

Expected: 类型检查通过，无错误

---

## 自检清单

1. **Spec 覆盖度：** 搜索栏字段在 API 文档中都有对应查询参数 ✓
2. **占位符检查：** 所有代码完整，无 TBD/TODO ✓
3. **类型一致性：** 所有 DTO/VO 字段名与 API 文档一致 ✓
4. **路由注册：** employmentRoutes 在 router/index.ts 中导入并添加 ✓
5. **按钮文字：** 软删除统一用"删除"/"批量删除" ✓
6. **positionStatus 标签色：** 招聘中=success, 已结束=info, 即将开始=warning ✓
