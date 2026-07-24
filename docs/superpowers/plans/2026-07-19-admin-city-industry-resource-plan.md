# 管理端-城市/行业/资源管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three independent admin CRUD pages (城市管理, 行业管理, 资源管理) with search, add, edit(含主表+详情), detail, status toggle, delete/batch-delete, and Excel import.

**Architecture:** Each module follows the existing CRUD pattern in `apps/admin/src/views/home/announcement/`: white search card + operation bar + white table card + el-dialog for form/detail. City and industry use a tabbed dialog for main table + detail table. Resource uses a single-page dialog.

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, Element Plus, Tailwind CSS, Pinia

---

## File Structure

```
apps/admin/src/
├── api/
│   ├── city/
│   │   └── index.ts               # City API calls
│   ├── industry/
│   │   └── index.ts               # Industry API calls
│   └── resource/
│       └── index.ts               # Resource API calls
├── types/
│   ├── city/
│   │   └── index.ts               # City VO/DTO types
│   ├── industry/
│   │   └── index.ts               # Industry VO/DTO types
│   └── resource/
│       └── index.ts               # Resource VO/DTO types
├── views/
│   ├── city/
│   │   └── list/
│   │       └── index.vue          # City list page
│   ├── industry/
│   │   └── list/
│   │       └── index.vue          # Industry list page
│   └── resource/
│       └── list/
│           └── index.vue          # Resource list page
└── router/
    ├── modules/
    │   ├── city.ts                # City route definition
    │   ├── industry.ts            # Industry route definition
    │   └── resource.ts            # Resource route definition
    └── index.ts                   # Add imports for new routes
```

---

### Task 1: City Types

**Files:**
- Create: `apps/admin/src/types/city/index.ts`

- [ ] **Create City types file**

```typescript
export interface CityListVO {
  id: number
  cityName: string
  province: string
  collegeCount: number
  keyCollegeCount: number
  residentPopulation: number
  isDeleted: boolean
  createdAt: string
}

export interface CityDetailVO {
  id: number
  cityName: string
  province: string
  region: string
  cityIntro: string
  collegeCount: number
  keyCollegeCount: number
  residentPopulation: number
  gdp: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  detailId: number
  area: number
  subtitle: string
  cityLevel: string
  adminCode: string
  perCapitaGdp: number
  urbanizationRate: number
  ruralPopRatio: number
  agingRate: number
  migrantPopRatio: number
  gdpGrowthRate: number
  fortune500Count: number
  industryStructure: Record<string, any>
  industryDescription: string
  mainIndustries: string[]
  emergingIndustries: string[]
  futurePlan: Record<string, any>
  highEducation: Record<string, any>
  basicEducation: Record<string, any>
  enterpriseStats: Record<string, any>
  housingPriceLevel: Record<string, any>
  rentalCost: Record<string, any>
  housingPolicy: Record<string, any>
  consumption: Record<string, any>
  employment: Record<string, any>
  transportation: Record<string, any>
  medical: Record<string, any>
  culture: Record<string, any>
}

export interface CityQueryDTO {
  cityName?: string
  province?: string
  region?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface CityAddDTO {
  cityName: string
  province: string
  region: string
  cityIntro?: string
  collegeCount?: number
  keyCollegeCount?: number
  residentPopulation?: number
  gdp?: number
  area?: number
  subtitle?: string
  cityLevel?: string
  adminCode?: string
  perCapitaGdp?: number
  urbanizationRate?: number
  ruralPopRatio?: number
  agingRate?: number
  migrantPopRatio?: number
  gdpGrowthRate?: number
  fortune500Count?: number
  industryStructure?: Record<string, any>
  industryDescription?: string
  mainIndustries?: string[]
  emergingIndustries?: string[]
  futurePlan?: Record<string, any>
  highEducation?: Record<string, any>
  basicEducation?: Record<string, any>
  enterpriseStats?: Record<string, any>
  housingPriceLevel?: Record<string, any>
  rentalCost?: Record<string, any>
  housingPolicy?: Record<string, any>
  consumption?: Record<string, any>
  employment?: Record<string, any>
  transportation?: Record<string, any>
  medical?: Record<string, any>
  culture?: Record<string, any>
}

export interface CityUpdateDTO {
  cityName?: string
  province?: string
  region?: string
  cityIntro?: string
  collegeCount?: number
  keyCollegeCount?: number
  residentPopulation?: number
  gdp?: number
}

export interface CityDetailUpdateDTO {
  area?: number
  subtitle?: string
  cityLevel?: string
  adminCode?: string
  perCapitaGdp?: number
  urbanizationRate?: number
  ruralPopRatio?: number
  agingRate?: number
  migrantPopRatio?: number
  gdpGrowthRate?: number
  fortune500Count?: number
  industryStructure?: Record<string, any>
  industryDescription?: string
  mainIndustries?: string[]
  emergingIndustries?: string[]
  futurePlan?: Record<string, any>
  highEducation?: Record<string, any>
  basicEducation?: Record<string, any>
  enterpriseStats?: Record<string, any>
  housingPriceLevel?: Record<string, any>
  rentalCost?: Record<string, any>
  housingPolicy?: Record<string, any>
  consumption?: Record<string, any>
  employment?: Record<string, any>
  transportation?: Record<string, any>
  medical?: Record<string, any>
  culture?: Record<string, any>
}

export interface StatusDTO {
  isDeleted: boolean
}
```

---

### Task 2: Industry Types

**Files:**
- Create: `apps/admin/src/types/industry/index.ts`

- [ ] **Create Industry types file**

```typescript
export interface IndustryListVO {
  id: number
  industryName: string
  category: string
  talentTrend: string
  annualGrowthRate: number
  isDeleted: boolean
  createdAt: string
}

export interface IndustryDetailVO {
  id: number
  industryName: string
  category: string
  iconClass: string
  description: string
  annualGrowthRate: number
  marketScale: string
  talentGap: string
  investmentHeat: number
  growthTrend: string
  marketTrend: string
  talentTrend: string
  investmentTrend: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  detailId: number
  shortDescription: string
  detailedDescription: string
  industryScale: Record<string, any>
  industryTalentDemand: Record<string, any>
  industrySalary: Record<string, any>
  policyInfo: Record<string, any>
  developmentSupportInfo: Record<string, any>
  talentAnalysis: Record<string, any>
  talentPolicy: Record<string, any>
  salaryData: Record<string, any>
}

export interface IndustryQueryDTO {
  industryName?: string
  category?: string
  talentTrend?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface IndustryAddDTO {
  industryName: string
  category: string
  iconClass?: string
  description?: string
  annualGrowthRate?: number
  marketScale?: string
  talentGap?: string
  investmentHeat?: number
  growthTrend?: string
  marketTrend?: string
  talentTrend?: string
  investmentTrend?: string
  shortDescription?: string
  detailedDescription?: string
  industryScale?: Record<string, any>
  industryTalentDemand?: Record<string, any>
  industrySalary?: Record<string, any>
  policyInfo?: Record<string, any>
  developmentSupportInfo?: Record<string, any>
  talentAnalysis?: Record<string, any>
  talentPolicy?: Record<string, any>
  salaryData?: Record<string, any>
}

export interface IndustryUpdateDTO {
  industryName?: string
  category?: string
  iconClass?: string
  description?: string
  annualGrowthRate?: number
  marketScale?: string
  talentGap?: string
  investmentHeat?: number
  growthTrend?: string
  marketTrend?: string
  talentTrend?: string
  investmentTrend?: string
}

export interface IndustryDetailUpdateDTO {
  shortDescription?: string
  detailedDescription?: string
  industryScale?: Record<string, any>
  industryTalentDemand?: Record<string, any>
  industrySalary?: Record<string, any>
  policyInfo?: Record<string, any>
  developmentSupportInfo?: Record<string, any>
  talentAnalysis?: Record<string, any>
  talentPolicy?: Record<string, any>
  salaryData?: Record<string, any>
}
```

---

### Task 3: Resource Types

**Files:**
- Create: `apps/admin/src/types/resource/index.ts`

- [ ] **Create Resource types file**

```typescript
export interface ResourceListVO {
  id: number
  resourceName: string
  category: string
  fileType: string
  viewCount: number
  isDeleted: boolean
  updatedAt: string
}

export interface ResourceDetailVO {
  id: number
  resourceName: string
  coverUrl: string
  description: string
  resourceUrl: string
  accessCode: string
  category: string
  fileType: string
  viewCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ResourceQueryDTO {
  resourceName?: string
  category?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface ResourceAddDTO {
  resourceName: string
  coverUrl?: string
  description?: string
  resourceUrl: string
  accessCode?: string
  category?: string
  fileType?: string
  sortOrder?: number
}

export interface ResourceUpdateDTO {
  resourceName?: string
  coverUrl?: string
  description?: string
  resourceUrl?: string
  accessCode?: string
  category?: string
  fileType?: string
  sortOrder?: number
}
```

---

### Task 4: City API

**Files:**
- Create: `apps/admin/src/api/city/index.ts`

- [ ] **Create City API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CityListVO,
  CityDetailVO,
  CityQueryDTO,
  CityAddDTO,
  CityUpdateDTO,
  CityDetailUpdateDTO,
  StatusDTO,
} from '@/types/city'

const PREFIX = '/api/v1/admin/city'

export const getCityPage = (params: CityQueryDTO) => {
  return request.get<R<PageResult<CityListVO>>>(`${PREFIX}/list`, { params })
}

export const getCityDetail = (id: number) => {
  return request.get<R<CityDetailVO>>(`${PREFIX}/${id}`)
}

export const addCity = (data: CityAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateCity = (id: number, data: CityUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateCityDetail = (id: number, data: CityDetailUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/detail`, data)
}

export const updateCityStatus = (id: number, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteCity = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteCity = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, ids)
}

export const importCity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCityDetail = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 5: Industry API

**Files:**
- Create: `apps/admin/src/api/industry/index.ts`

- [ ] **Create Industry API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  IndustryListVO,
  IndustryDetailVO,
  IndustryQueryDTO,
  IndustryAddDTO,
  IndustryUpdateDTO,
  IndustryDetailUpdateDTO,
} from '@/types/industry'

const PREFIX = '/api/v1/admin/industry'

export const getIndustryPage = (params: IndustryQueryDTO) => {
  return request.get<R<PageResult<IndustryListVO>>>(`${PREFIX}/list`, { params })
}

export const getIndustryDetail = (id: number) => {
  return request.get<R<IndustryDetailVO>>(`${PREFIX}/${id}`)
}

export const addIndustry = (data: IndustryAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateIndustry = (id: number, data: IndustryUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateIndustryDetail = (id: number, data: IndustryDetailUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/detail`, data)
}

export const updateIndustryStatus = (id: number, data: { isDeleted: boolean }) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteIndustry = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteIndustry = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, ids)
}

export const importIndustry = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importIndustryDetail = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 6: Resource API

**Files:**
- Create: `apps/admin/src/api/resource/index.ts`

- [ ] **Create Resource API file**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ResourceListVO,
  ResourceDetailVO,
  ResourceQueryDTO,
  ResourceAddDTO,
  ResourceUpdateDTO,
} from '@/types/resource'

const PREFIX = '/api/v1/admin/resource'

export const getResourcePage = (params: ResourceQueryDTO) => {
  return request.get<R<PageResult<ResourceListVO>>>(`${PREFIX}/list`, { params })
}

export const getResourceDetail = (id: number) => {
  return request.get<R<ResourceDetailVO>>(`${PREFIX}/${id}`)
}

export const addResource = (data: ResourceAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateResource = (id: number, data: ResourceUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateResourceStatus = (id: number, data: { isDeleted: boolean }) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteResource = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteResource = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const importResource = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: City View Page

**Files:**
- Create: `apps/admin/src/views/city/list/index.vue`

- [ ] **Create City list page** — This is the most complex view with tabbed dialog.

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCityPage,
  getCityDetail,
  addCity,
  updateCity,
  updateCityDetail,
  updateCityStatus,
  deleteCity,
  batchDeleteCity,
  importCity,
  importCityDetail,
} from '@/api/city'
import type {
  CityListVO,
  CityDetailVO,
  CityQueryDTO,
  CityAddDTO,
} from '@/types/city'

const loading = ref(false)
const tableData = ref<CityListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<CityQueryDTO>({
  page: 1,
  size: 10,
  cityName: '',
  province: '',
  region: '',
})

// Dialog state
const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<CityDetailVO | null>(null)
const activeTab = ref('basic')

// Form data (basic info tab)
const formData = reactive<Record<string, any>>({
  cityName: '',
  province: '',
  region: '',
  cityIntro: '',
  collegeCount: null,
  keyCollegeCount: null,
  residentPopulation: null,
  gdp: null,
})

// Form data (detail tab)
const detailForm = reactive<Record<string, any>>({
  area: null,
  subtitle: '',
  cityLevel: '',
  adminCode: '',
  perCapitaGdp: null,
  urbanizationRate: null,
  ruralPopRatio: null,
  agingRate: null,
  migrantPopRatio: null,
  gdpGrowthRate: null,
  fortune500Count: null,
  industryDescription: '',
  mainIndustries: '',
  emergingIndustries: '',
  industryStructure: '',
  futurePlan: '',
  highEducation: '',
  basicEducation: '',
  enterpriseStats: '',
  housingPriceLevel: '',
  rentalCost: '',
  housingPolicy: '',
  consumption: '',
  employment: '',
  transportation: '',
  medical: '',
  culture: '',
})

// Import dialog
const importDialogVisible = ref(false)
const importType = ref<'main' | 'detail'>('main')
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const cityLevelOptions = ['直辖市', '省会城市', '地级市', '县级市']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.cityName) params.cityName = queryParams.cityName
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.region) params.region = queryParams.region
    const res = await getCityPage(params as CityQueryDTO)
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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.cityName = ''
  queryParams.province = ''
  queryParams.region = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: CityListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'add') {
    dialogTitle.value = '新增城市'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改城市'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        fillForm(d)
        fillDetailForm(d)
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '城市详情'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
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

const resetForm = () => {
  formData.cityName = ''
  formData.province = ''
  formData.region = ''
  formData.cityIntro = ''
  formData.collegeCount = null
  formData.keyCollegeCount = null
  formData.residentPopulation = null
  formData.gdp = null
  Object.keys(detailForm).forEach((k) => {
    detailForm[k] = ''
  })
  detailForm.collegeCount = null
  detailForm.keyCollegeCount = null
  detailForm.residentPopulation = null
  detailForm.gdp = null
  detailForm.area = null
  detailForm.perCapitaGdp = null
  detailForm.urbanizationRate = null
  detailForm.ruralPopRatio = null
  detailForm.agingRate = null
  detailForm.migrantPopRatio = null
  detailForm.gdpGrowthRate = null
  detailForm.fortune500Count = null
}

const fillForm = (d: CityDetailVO) => {
  formData.cityName = d.cityName
  formData.province = d.province
  formData.region = d.region || ''
  formData.cityIntro = d.cityIntro || ''
  formData.collegeCount = d.collegeCount
  formData.keyCollegeCount = d.keyCollegeCount
  formData.residentPopulation = d.residentPopulation
  formData.gdp = d.gdp
}

const fillDetailForm = (d: CityDetailVO) => {
  detailForm.area = d.area
  detailForm.subtitle = d.subtitle || ''
  detailForm.cityLevel = d.cityLevel || ''
  detailForm.adminCode = d.adminCode || ''
  detailForm.perCapitaGdp = d.perCapitaGdp
  detailForm.urbanizationRate = d.urbanizationRate
  detailForm.ruralPopRatio = d.ruralPopRatio
  detailForm.agingRate = d.agingRate
  detailForm.migrantPopRatio = d.migrantPopRatio
  detailForm.gdpGrowthRate = d.gdpGrowthRate
  detailForm.fortune500Count = d.fortune500Count
  detailForm.industryDescription = d.industryDescription || ''
  detailForm.mainIndustries = d.mainIndustries?.join(', ') || ''
  detailForm.emergingIndustries = d.emergingIndustries?.join(', ') || ''
  detailForm.industryStructure = d.industryStructure ? JSON.stringify(d.industryStructure, null, 2) : ''
  detailForm.futurePlan = d.futurePlan ? JSON.stringify(d.futurePlan, null, 2) : ''
  detailForm.highEducation = d.highEducation ? JSON.stringify(d.highEducation, null, 2) : ''
  detailForm.basicEducation = d.basicEducation ? JSON.stringify(d.basicEducation, null, 2) : ''
  detailForm.enterpriseStats = d.enterpriseStats ? JSON.stringify(d.enterpriseStats, null, 2) : ''
  detailForm.housingPriceLevel = d.housingPriceLevel ? JSON.stringify(d.housingPriceLevel, null, 2) : ''
  detailForm.rentalCost = d.rentalCost ? JSON.stringify(d.rentalCost, null, 2) : ''
  detailForm.housingPolicy = d.housingPolicy ? JSON.stringify(d.housingPolicy, null, 2) : ''
  detailForm.consumption = d.consumption ? JSON.stringify(d.consumption, null, 2) : ''
  detailForm.employment = d.employment ? JSON.stringify(d.employment, null, 2) : ''
  detailForm.transportation = d.transportation ? JSON.stringify(d.transportation, null, 2) : ''
  detailForm.medical = d.medical ? JSON.stringify(d.medical, null, 2) : ''
  detailForm.culture = d.culture ? JSON.stringify(d.culture, null, 2) : ''
}

const handleSubmitBasic = async () => {
  if (!formData.cityName || !formData.province || !formData.region) {
    ElMessage.warning('请填写城市名称、省份和所属地区')
    return false
  }
  try {
    const data: Record<string, any> = {
      cityName: formData.cityName,
      province: formData.province,
      region: formData.region,
    }
    if (formData.cityIntro) data.cityIntro = formData.cityIntro
    if (formData.collegeCount !== null) data.collegeCount = formData.collegeCount
    if (formData.keyCollegeCount !== null) data.keyCollegeCount = formData.keyCollegeCount
    if (formData.residentPopulation !== null) data.residentPopulation = formData.residentPopulation
    if (formData.gdp !== null) data.gdp = formData.gdp

    let res: any
    if (dialogMode.value === 'add') {
      res = await addCity(data as CityAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateCity(currentId.value, data)
    } else {
      return false
    }

    if (res.data.code === 200) {
      ElMessage.success('基本信息保存成功')
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch {
    ElMessage.error('保存失败')
    return false
  }
}

const handleSubmitDetail = async () => {
  if (!currentId.value) return false
  try {
    const data: Record<string, any> = {}
    if (detailForm.area !== null) data.area = detailForm.area
    if (detailForm.subtitle) data.subtitle = detailForm.subtitle
    if (detailForm.cityLevel) data.cityLevel = detailForm.cityLevel
    if (detailForm.adminCode) data.adminCode = detailForm.adminCode
    if (detailForm.perCapitaGdp !== null) data.perCapitaGdp = detailForm.perCapitaGdp
    if (detailForm.urbanizationRate !== null) data.urbanizationRate = detailForm.urbanizationRate
    if (detailForm.ruralPopRatio !== null) data.ruralPopRatio = detailForm.ruralPopRatio
    if (detailForm.agingRate !== null) data.agingRate = detailForm.agingRate
    if (detailForm.migrantPopRatio !== null) data.migrantPopRatio = detailForm.migrantPopRatio
    if (detailForm.gdpGrowthRate !== null) data.gdpGrowthRate = detailForm.gdpGrowthRate
    if (detailForm.fortune500Count !== null) data.fortune500Count = detailForm.fortune500Count
    if (detailForm.industryDescription) data.industryDescription = detailForm.industryDescription
    if (detailForm.mainIndustries) data.mainIndustries = detailForm.mainIndustries.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
    if (detailForm.emergingIndustries) data.emergingIndustries = detailForm.emergingIndustries.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)

    // Parse JSONB fields
    const jsonbFields = ['industryStructure', 'futurePlan', 'highEducation', 'basicEducation', 'enterpriseStats', 'housingPriceLevel', 'rentalCost', 'housingPolicy', 'consumption', 'employment', 'transportation', 'medical', 'culture']
    jsonbFields.forEach((field) => {
      if (detailForm[field]) {
        try {
          data[field] = JSON.parse(detailForm[field])
        } catch {
          ElMessage.warning(`${field} JSON 格式错误，已跳过`)
        }
      }
    })

    const res = await updateCityDetail(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('详细信息保存成功')
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch {
    ElMessage.error('保存失败')
    return false
  }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'detail') return

  if (activeTab.value === 'basic') {
    const ok = await handleSubmitBasic()
    if (ok && dialogMode.value === 'edit') {
      dialogVisible.value = false
      fetchData()
    } else if (ok && dialogMode.value === 'add') {
      // After add, switch to detail tab for further editing
      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    }
  } else {
    const ok = await handleSubmitDetail()
    if (ok) {
      dialogVisible.value = false
      fetchData()
    }
  }
}

const handleToggleStatus = async (row: CityListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该城市吗？`, '提示')
    const res = await updateCityStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要永久删除该城市吗？此操作不可恢复！',
      '警告',
      { type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消' }
    )
    const res = await deleteCity(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的城市')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要永久删除选中的 ${selectedIds.value.length} 条城市记录吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCity(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

// Import handlers
const openImportDialog = (type: 'main' | 'detail') => {
  importType.value = type
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (file: File) => {
  importFile.value = file
  return false // Prevent auto upload
}

const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importLoading.value = true
  try {
    let res: any
    if (importType.value === 'main') {
      res = await importCity(importFile.value)
    } else {
      res = await importCityDetail(importFile.value)
    }
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- Search -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="城市名称">
          <el-input v-model="queryParams.cityName" placeholder="城市名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryParams.province" placeholder="省份模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="所属地区">
          <el-input v-model="queryParams.region" placeholder="所属地区模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Toolbar -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增城市</el-button>
        <el-dropdown split-button type="success" @click="openImportDialog('main')">
          Excel导入
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openImportDialog('main')">导入城市主表</el-dropdown-item>
              <el-dropdown-item @click="openImportDialog('detail')">导入城市详情</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- Table -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="cityName" label="城市名称" min-width="120" />
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column prop="collegeCount" label="高校数量" width="100" align="center" />
        <el-table-column prop="keyCollegeCount" label="重点高校" width="100" align="center" />
        <el-table-column prop="residentPopulation" label="常住人口(万)" width="120" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="850px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="城市名称">{{ detailData.cityName }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="所属地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="高校数量">{{ detailData.collegeCount }}</el-descriptions-item>
            <el-descriptions-item label="重点高校数量">{{ detailData.keyCollegeCount }}</el-descriptions-item>
            <el-descriptions-item label="常住人口(万)">{{ detailData.residentPopulation }}</el-descriptions-item>
            <el-descriptions-item label="GDP(亿元)">{{ detailData.gdp }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="城市简介" :span="2">
              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.cityIntro || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="面积(km²)">{{ detailData.area ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市级别">{{ detailData.cityLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="行政区划代码">{{ detailData.adminCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人均GDP(万元)">{{ detailData.perCapitaGdp ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="城镇化率(%)">{{ detailData.urbanizationRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="GDP增长率(%)">{{ detailData.gdpGrowthRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="500强企业数">{{ detailData.fortune500Count ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="主要产业" :span="2">{{ detailData.mainIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="新兴产业" :span="2">{{ detailData.emergingIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市名称" required>
                      <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="省份" required>
                      <el-input v-model="formData.province" placeholder="请输入省份" maxlength="30" show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所属地区" required>
                      <el-input v-model="formData.region" placeholder="请输入所属地区" maxlength="20" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="高校数量">
                      <el-input-number v-model="formData.collegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="重点高校数量">
                      <el-input-number v-model="formData.keyCollegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="常住人口(万)">
                      <el-input-number v-model="formData.residentPopulation" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP(亿元)">
                      <el-input-number v-model="formData.gdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="城市简介">
                  <el-input v-model="formData.cityIntro" type="textarea" :rows="4" placeholder="请输入城市简介" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="详细信息" name="detail" :disabled="dialogMode === 'add'">
              <el-form :model="detailForm" label-width="140px" class="mt-2">
                <div class="mb-2 text-sm font-medium text-gray-500">基础数据</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="面积(km²)">
                      <el-input-number v-model="detailForm.area" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="副标题">
                      <el-input v-model="detailForm.subtitle" placeholder="城市副标题" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市级别">
                      <el-select v-model="detailForm.cityLevel" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in cityLevelOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="行政区划代码">
                      <el-input v-model="detailForm.adminCode" placeholder="行政区划代码" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人均GDP(万元)">
                      <el-input-number v-model="detailForm.perCapitaGdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="城镇化率(%)">
                      <el-input-number v-model="detailForm.urbanizationRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP增长率(%)">
                      <el-input-number v-model="detailForm.gdpGrowthRate" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="农村人口比例(%)">
                      <el-input-number v-model="detailForm.ruralPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="老龄化率(%)">
                      <el-input-number v-model="detailForm.agingRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="外来人口比例(%)">
                      <el-input-number v-model="detailForm.migrantPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="世界500强企业数">
                      <el-input-number v-model="detailForm.fortune500Count" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="mb-2 mt-4 text-sm font-medium text-gray-500">产业信息</div>
                <el-form-item label="产业描述">
                  <el-input v-model="detailForm.industryDescription" type="textarea" :rows="3" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="主要产业">
                      <el-input v-model="detailForm.mainIndustries" placeholder="逗号分隔" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="新兴产业">
                      <el-input v-model="detailForm.emergingIndustries" placeholder="逗号分隔" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="mb-2 mt-4 text-sm font-medium text-gray-500">JSONB 数据（请输入合法JSON）</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="产业结构">
                      <el-input v-model="detailForm.industryStructure" type="textarea" :rows="3" placeholder='{"first":0.3,"second":16.2,"third":83.5}' />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="未来规划">
                      <el-input v-model="detailForm.futurePlan" type="textarea" :rows="3" placeholder='{"focus":["数字经济"]}' />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="高等教育">
                      <el-input v-model="detailForm.highEducation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="基础教育">
                      <el-input v-model="detailForm.basicEducation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="房价水平">
                      <el-input v-model="detailForm.housingPriceLevel" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="租房成本">
                      <el-input v-model="detailForm.rentalCost" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="就业数据">
                      <el-input v-model="detailForm.employment" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="交通数据">
                      <el-input v-model="detailForm.transportation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="医疗数据">
                      <el-input v-model="detailForm.medical" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="文化旅游">
                      <el-input v-model="detailForm.culture" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入城市主表' : '导入城市详情'" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="(u: any) => { importFile = u.raw }"
        :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 8: Industry View Page

**Files:**
- Create: `apps/admin/src/views/industry/list/index.vue`

- [ ] **Create Industry list page** — Similar structure to city but with industry-specific fields.

The full code follows the same pattern as the city page with these key differences:

**Search:** industryName (input), category (input), talentTrend (select: 上升/稳定/下降)
**Table columns:** ID, 行业名称, 行业分类, 人才趋势(tag), 年增长率(%), 状态, 创建时间, 操作
**Add/Edit Dialog Tab 1:** industryName*, category, iconClass, description, annualGrowthRate, marketScale, talentGap, investmentHeat, growthTrend(select), marketTrend(select), talentTrend(select), investmentTrend(select)
**Add/Edit Dialog Tab 2:** shortDescription, detailedDescription + JSONB fields

---

- [ ] **Create Industry list page — full implementation**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getIndustryPage,
  getIndustryDetail,
  addIndustry,
  updateIndustry,
  updateIndustryDetail,
  updateIndustryStatus,
  deleteIndustry,
  batchDeleteIndustry,
  importIndustry,
  importIndustryDetail,
} from '@/api/industry'
import type {
  IndustryListVO,
  IndustryDetailVO,
  IndustryQueryDTO,
} from '@/types/industry'

const loading = ref(false)
const tableData = ref<IndustryListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<IndustryQueryDTO>({
  page: 1,
  size: 10,
  industryName: '',
  category: '',
  talentTrend: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<IndustryDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  industryName: '',
  category: '',
  iconClass: '',
  description: '',
  annualGrowthRate: null,
  marketScale: '',
  talentGap: '',
  investmentHeat: null,
  growthTrend: '',
  marketTrend: '',
  talentTrend: '',
  investmentTrend: '',
})

const detailForm = reactive<Record<string, any>>({
  shortDescription: '',
  detailedDescription: '',
  industryScale: '',
  industryTalentDemand: '',
  industrySalary: '',
  policyInfo: '',
  developmentSupportInfo: '',
  talentAnalysis: '',
  talentPolicy: '',
  salaryData: '',
})

const importDialogVisible = ref(false)
const importType = ref<'main' | 'detail'>('main')
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const trendOptions = ['上升', '稳定', '下降']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.industryName) params.industryName = queryParams.industryName
    if (queryParams.category) params.category = queryParams.category
    if (queryParams.talentTrend) params.talentTrend = queryParams.talentTrend
    const res = await getIndustryPage(params as IndustryQueryDTO)
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
  queryParams.industryName = ''
  queryParams.category = ''
  queryParams.talentTrend = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: IndustryListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  Object.keys(formData).forEach((k) => { formData[k] = '' })
  formData.annualGrowthRate = null
  formData.investmentHeat = null
  Object.keys(detailForm).forEach((k) => { detailForm[k] = '' })
}

const fillForm = (d: IndustryDetailVO) => {
  formData.industryName = d.industryName
  formData.category = d.category || ''
  formData.iconClass = d.iconClass || ''
  formData.description = d.description || ''
  formData.annualGrowthRate = d.annualGrowthRate
  formData.marketScale = d.marketScale || ''
  formData.talentGap = d.talentGap || ''
  formData.investmentHeat = d.investmentHeat
  formData.growthTrend = d.growthTrend || ''
  formData.marketTrend = d.marketTrend || ''
  formData.talentTrend = d.talentTrend || ''
  formData.investmentTrend = d.investmentTrend || ''
}

const fillDetailForm = (d: IndustryDetailVO) => {
  detailForm.shortDescription = d.shortDescription || ''
  detailForm.detailedDescription = d.detailedDescription || ''
  const jsonFields = ['industryScale', 'industryTalentDemand', 'industrySalary', 'policyInfo', 'developmentSupportInfo', 'talentAnalysis', 'talentPolicy', 'salaryData']
  jsonFields.forEach((f) => {
    detailForm[f] = (d as any)[f] ? JSON.stringify((d as any)[f], null, 2) : ''
  })
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'add') {
    dialogTitle.value = '新增行业'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改行业'
    formLoading.value = true
    try {
      const res = await getIndustryDetail(id)
      if (res.data.code === 200) {
        fillForm(res.data.data)
        fillDetailForm(res.data.data)
      }
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '行业详情'
    formLoading.value = true
    try {
      const res = await getIndustryDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmitBasic = async () => {
  if (!formData.industryName) {
    ElMessage.warning('请填写行业名称')
    return false
  }
  try {
    const data: Record<string, any> = { industryName: formData.industryName }
    if (formData.category) data.category = formData.category
    if (formData.iconClass) data.iconClass = formData.iconClass
    if (formData.description) data.description = formData.description
    if (formData.annualGrowthRate !== null) data.annualGrowthRate = formData.annualGrowthRate
    if (formData.marketScale) data.marketScale = formData.marketScale
    if (formData.talentGap) data.talentGap = formData.talentGap
    if (formData.investmentHeat !== null) data.investmentHeat = formData.investmentHeat
    if (formData.growthTrend) data.growthTrend = formData.growthTrend
    if (formData.marketTrend) data.marketTrend = formData.marketTrend
    if (formData.talentTrend) data.talentTrend = formData.talentTrend
    if (formData.investmentTrend) data.investmentTrend = formData.investmentTrend

    let res: any
    if (dialogMode.value === 'add') res = await addIndustry(data)
    else if (dialogMode.value === 'edit' && currentId.value) res = await updateIndustry(currentId.value, data)
    else return false

    if (res.data.code === 200) { ElMessage.success('基本信息保存成功'); return true }
    else { ElMessage.error(res.data.msg || '保存失败'); return false }
  } catch { ElMessage.error('保存失败'); return false }
}

const handleSubmitDetail = async () => {
  if (!currentId.value) return false
  try {
    const data: Record<string, any> = {}
    if (detailForm.shortDescription) data.shortDescription = detailForm.shortDescription
    if (detailForm.detailedDescription) data.detailedDescription = detailForm.detailedDescription
    const jsonFields = ['industryScale', 'industryTalentDemand', 'industrySalary', 'policyInfo', 'developmentSupportInfo', 'talentAnalysis', 'talentPolicy', 'salaryData']
    jsonFields.forEach((f) => {
      if (detailForm[f]) {
        try { data[f] = JSON.parse(detailForm[f]) }
        catch { ElMessage.warning(`${f} JSON格式错误，已跳过`) }
      }
    })

    const res = await updateIndustryDetail(currentId.value, data)
    if (res.data.code === 200) { ElMessage.success('详细信息保存成功'); return true }
    else { ElMessage.error(res.data.msg || '保存失败'); return false }
  } catch { ElMessage.error('保存失败'); return false }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'detail') return
  if (activeTab.value === 'basic') {
    const ok = await handleSubmitBasic()
    if (ok) { dialogVisible.value = false; fetchData() }
  } else {
    const ok = await handleSubmitDetail()
    if (ok) { dialogVisible.value = false; fetchData() }
  }
}

const handleToggleStatus = async (row: IndustryListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该行业吗？`, '提示')
    const res = await updateIndustryStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* cancel */ }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该行业吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await deleteIndustry(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的行业'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条行业记录吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消',
    })
    const res = await batchDeleteIndustry(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() }
    else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}

const openImportDialog = (type: 'main' | 'detail') => {
  importType.value = type
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const fn = importType.value === 'main' ? importIndustry : importIndustryDetail
    const res = await fn(importFile.value)
    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.data.msg || '导入失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')
const trendTag = (val: string) => val === '上升' ? 'success' : val === '稳定' ? 'warning' : val === '下降' ? 'danger' : 'info'

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="行业名称">
          <el-input v-model="queryParams.industryName" placeholder="行业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="行业分类">
          <el-input v-model="queryParams.category" placeholder="分类模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="人才趋势">
          <el-select v-model="queryParams.talentTrend" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />
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
        <el-button type="primary" @click="openDialog('add')">新增行业</el-button>
        <el-dropdown split-button type="success" @click="openImportDialog('main')">
          Excel导入
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openImportDialog('main')">导入行业主表</el-dropdown-item>
              <el-dropdown-item @click="openImportDialog('detail')">导入行业详情</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="industryName" label="行业名称" min-width="180" />
        <el-table-column prop="category" label="行业分类" width="120" />
        <el-table-column prop="talentTrend" label="人才趋势" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.talentTrend" :type="trendTag(row.talentTrend)" size="small">{{ row.talentTrend }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="annualGrowthRate" label="年增长率(%)" width="110" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="850px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="行业名称">{{ detailData.industryName }}</el-descriptions-item>
            <el-descriptions-item label="行业分类">{{ detailData.category || '-' }}</el-descriptions-item>
            <el-descriptions-item label="年增长率(%)">{{ detailData.annualGrowthRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="市场规模">{{ detailData.marketScale || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人才缺口">{{ detailData.talentGap || '-' }}</el-descriptions-item>
            <el-descriptions-item label="投资热度(%)">{{ detailData.investmentHeat ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="增长趋势">{{ detailData.growthTrend || '-' }}</el-descriptions-item>
            <el-descriptions-item label="市场趋势">{{ detailData.marketTrend || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人才趋势">{{ detailData.talentTrend || '-' }}</el-descriptions-item>
            <el-descriptions-item label="投资趋势">{{ detailData.investmentTrend || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="行业描述" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简短描述" :span="2">{{ detailData.shortDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-form-item label="行业名称" required>
                  <el-input v-model="formData.industryName" placeholder="请输入行业名称" maxlength="100" show-word-limit />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="行业分类">
                      <el-input v-model="formData.category" placeholder="行业分类" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="图标样式类名">
                      <el-input v-model="formData.iconClass" placeholder="如: fa-solid fa-robot" maxlength="100" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="年增长率(%)">
                      <el-input-number v-model="formData.annualGrowthRate" :min="-100" :max="1000" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="投资热度(%)">
                      <el-input-number v-model="formData.investmentHeat" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="市场规模">
                      <el-input v-model="formData.marketScale" placeholder="如: 1.8万亿" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="人才缺口">
                      <el-input v-model="formData.talentGap" placeholder="如: 120万" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-form-item label="增长趋势">
                      <el-select v-model="formData.growthTrend" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="市场趋势">
                      <el-select v-model="formData.marketTrend" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="人才趋势">
                      <el-select v-model="formData.talentTrend" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="投资趋势">
                      <el-select v-model="formData.investmentTrend" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="行业描述">
                  <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入行业描述" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="详细信息" name="detail" :disabled="dialogMode === 'add'">
              <el-form :model="detailForm" label-width="140px" class="mt-2">
                <el-form-item label="简短描述">
                  <el-input v-model="detailForm.shortDescription" maxlength="500" show-word-limit />
                </el-form-item>
                <el-form-item label="详细描述">
                  <el-input v-model="detailForm.detailedDescription" type="textarea" :rows="4" />
                </el-form-item>
                <el-form-item label="发展规模(JSON)">
                  <el-input v-model="detailForm.industryScale" type="textarea" :rows="3" placeholder='{"value":18000,"unit":"亿元"}' />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人才需求(JSON)">
                      <el-input v-model="detailForm.industryTalentDemand" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="行业薪资(JSON)">
                      <el-input v-model="detailForm.industrySalary" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="政策信息(JSON)">
                      <el-input v-model="detailForm.policyInfo" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="发展支持(JSON)">
                      <el-input v-model="detailForm.developmentSupportInfo" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人才分析(JSON)">
                      <el-input v-model="detailForm.talentAnalysis" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="人才政策(JSON)">
                      <el-input v-model="detailForm.talentPolicy" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="薪资数据(JSON)">
                  <el-input v-model="detailForm.salaryData" type="textarea" :rows="3" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入行业主表' : '导入行业详情'" width="500px">
      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="(u: any) => { importFile = u.raw }" :limit="1">
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 9: Resource View Page

**Files:**
- Create: `apps/admin/src/views/resource/list/index.vue`

- [ ] **Create Resource list page** — Single-page dialog (no tabs), soft delete instead of hard delete.

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getResourcePage,
  getResourceDetail,
  addResource,
  updateResource,
  updateResourceStatus,
  deleteResource,
  batchDeleteResource,
  importResource,
} from '@/api/resource'
import type {
  ResourceListVO,
  ResourceDetailVO,
  ResourceQueryDTO,
  ResourceAddDTO,
  ResourceUpdateDTO,
} from '@/types/resource'

const loading = ref(false)
const tableData = ref<ResourceListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<ResourceQueryDTO>({
  page: 1,
  size: 10,
  resourceName: '',
  category: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<ResourceDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  resourceName: '',
  coverUrl: '',
  description: '',
  resourceUrl: '',
  accessCode: '',
  category: '',
  fileType: '',
  sortOrder: null,
})

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.resourceName) params.resourceName = queryParams.resourceName
    if (queryParams.category) params.category = queryParams.category
    const res = await getResourcePage(params as ResourceQueryDTO)
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
  queryParams.resourceName = ''
  queryParams.category = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ResourceListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  formData.resourceName = ''
  formData.coverUrl = ''
  formData.description = ''
  formData.resourceUrl = ''
  formData.accessCode = ''
  formData.category = ''
  formData.fileType = ''
  formData.sortOrder = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增资源'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改资源'
    formLoading.value = true
    try {
      const res = await getResourceDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.resourceName = d.resourceName
        formData.coverUrl = d.coverUrl || ''
        formData.description = d.description || ''
        formData.resourceUrl = d.resourceUrl
        formData.accessCode = d.accessCode || ''
        formData.category = d.category || ''
        formData.fileType = d.fileType || ''
      }
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '资源详情'
    formLoading.value = true
    try {
      const res = await getResourceDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.resourceName || !formData.resourceUrl) {
    ElMessage.warning('请填写资源名称和资源URL')
    return
  }

  try {
    const data: Record<string, any> = {
      resourceName: formData.resourceName,
      resourceUrl: formData.resourceUrl,
    }
    if (formData.coverUrl) data.coverUrl = formData.coverUrl
    if (formData.description) data.description = formData.description
    if (formData.accessCode) data.accessCode = formData.accessCode
    if (formData.category) data.category = formData.category
    if (formData.fileType) data.fileType = formData.fileType
    if (formData.sortOrder !== null) data.sortOrder = formData.sortOrder

    let res: any
    if (dialogMode.value === 'add') {
      res = await addResource(data as ResourceAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateResource(currentId.value, data as ResourceUpdateDTO)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleToggleStatus = async (row: ResourceListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该资源吗？`, '提示')
    const res = await updateResourceStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* cancel */ }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要下架该资源吗？下架后可恢复。', '提示', {
      type: 'warning', confirmButtonText: '确定下架', cancelButtonText: '取消',
    })
    const res = await deleteResource(id)
    if (res.data.code === 200) { ElMessage.success('下架成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '下架失败') }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要下架的资源'); return }
  try {
    await ElMessageBox.confirm(`确定要批量下架选中的 ${selectedIds.value.length} 条资源吗？下架后可恢复。`, '提示', {
      type: 'warning', confirmButtonText: '确定批量下架', cancelButtonText: '取消',
    })
    const res = await batchDeleteResource(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量下架成功'); selectedIds.value = []; fetchData() }
    else { ElMessage.error(res.data.msg || '批量下架失败') }
  } catch { /* cancel */ }
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importResource(importFile.value)
    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.data.msg || '导入失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="资源名称">
          <el-input v-model="queryParams.resourceName" placeholder="资源名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="queryParams.category" placeholder="分类模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增资源</el-button>
        <el-button type="success" @click="importDialogVisible = true">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量下架</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="resourceName" label="资源名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="fileType" label="文件类型" width="100" align="center" />
        <el-table-column prop="viewCount" label="浏览量" width="100" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">下架</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="资源名称" :span="2">{{ detailData.resourceName }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ detailData.category || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件类型">{{ detailData.fileType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="资源URL" :span="2">
              <el-link type="primary" :href="detailData.resourceUrl" target="_blank">{{ detailData.resourceUrl }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="访问码">{{ detailData.accessCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="浏览量">{{ detailData.viewCount }}</el-descriptions-item>
            <el-descriptions-item label="封面URL" :span="2">{{ detailData.coverUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="100px" class="mt-2">
            <el-form-item label="资源名称" required>
              <el-input v-model="formData.resourceName" placeholder="请输入资源名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="资源URL" required>
              <el-input v-model="formData.resourceUrl" placeholder="请输入资源链接（如百度网盘地址）" maxlength="500" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="访问码">
                  <el-input v-model="formData.accessCode" placeholder="百度网盘提取码" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序序号">
                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分类">
                  <el-input v-model="formData.category" placeholder="分类（如：考研真题）" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文件类型">
                  <el-input v-model="formData.fileType" placeholder="如：PDF/视频/压缩包" maxlength="20" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="封面URL">
              <el-input v-model="formData.coverUrl" placeholder="封面图片URL" maxlength="500" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="资源描述" maxlength="1000" show-word-limit />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="导入资源" width="500px">
      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="(u: any) => { importFile = u.raw }" :limit="1">
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 10: Routes

**Files:**
- Create: `apps/admin/src/router/modules/city.ts`
- Create: `apps/admin/src/router/modules/industry.ts`
- Create: `apps/admin/src/router/modules/resource.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Create city route**

```typescript
// apps/admin/src/router/modules/city.ts
import type { RouteRecordRaw } from 'vue-router'

const cityRoutes: RouteRecordRaw = {
  path: '/city',
  name: 'City',
  meta: { title: '城市管理', icon: 'MapLocation' },
  redirect: '/city/list',
  children: [
    {
      path: 'list',
      name: 'CityList',
      component: () => import('@/views/city/list/index.vue'),
      meta: { title: '城市管理', moduleCode: 'city_info' },
    },
  ],
}

export default cityRoutes
```

- [ ] **Create industry route**

```typescript
// apps/admin/src/router/modules/industry.ts
import type { RouteRecordRaw } from 'vue-router'

const industryRoutes: RouteRecordRaw = {
  path: '/industry',
  name: 'Industry',
  meta: { title: '行业管理', icon: 'DataLine' },
  redirect: '/industry/list',
  children: [
    {
      path: 'list',
      name: 'IndustryList',
      component: () => import('@/views/industry/list/index.vue'),
      meta: { title: '行业管理', moduleCode: 'industry_info' },
    },
  ],
}

export default industryRoutes
```

- [ ] **Create resource route**

```typescript
// apps/admin/src/router/modules/resource.ts
import type { RouteRecordRaw } from 'vue-router'

const resourceRoutes: RouteRecordRaw = {
  path: '/resource',
  name: 'Resource',
  meta: { title: '资源管理', icon: 'Collection' },
  redirect: '/resource/list',
  children: [
    {
      path: 'list',
      name: 'ResourceList',
      component: () => import('@/views/resource/list/index.vue'),
      meta: { title: '资源管理', moduleCode: 'resource_info' },
    },
  ],
}

export default resourceRoutes
```

- [ ] **Add route imports to router/index.ts**

Add after the existing imports:
```typescript
import cityRoutes from './modules/city'
import industryRoutes from './modules/industry'
import resourceRoutes from './modules/resource'
```

Add after `majorRoutes,` in the children array:
```typescript
      cityRoutes,
      industryRoutes,
      resourceRoutes,
```

---

## Spec Coverage Check

- **City search (cityName, province, region):** Task 7 — search bar with 3 inputs ✓
- **City CRUD + detail:** Task 7 — all API calls + dialog ✓
- **City tabbed dialog (basic + detail):** Task 7 — el-tabs with two panes ✓
- **City import (main + detail):** Task 7 — split-button dropdown + upload dialog ✓
- **City status toggle:** Task 7 — handleToggleStatus ✓
- **City hard delete + batch hard delete:** Task 7 — "永久删除" / "批量永久删除" ✓
- **Industry search (industryName, category, talentTrend):** Task 8 ✓
- **Industry tabbed dialog:** Task 8 ✓
- **Industry import dropdown:** Task 8 ✓
- **Industry hard delete + batch hard delete:** Task 8 ✓
- **Resource search (resourceName, category):** Task 9 ✓
- **Resource single-page dialog:** Task 9 ✓
- **Resource soft delete + batch soft delete (下架):** Task 9 ✓
- **Resource import:** Task 9 ✓
- **No sortOrder column (resource):** Task 9 — table omits sortOrder ✓
- **Status visible via el-tag:** All tasks ✓
- **Routes + router registration:** Task 10 ✓
- **Error handling via ElMessage:** All tasks — every catch and non-200 path ✓
