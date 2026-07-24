# 行业专项招聘管理模块 - 设计规范

## 概述

本模块实现 admin 端对行业专项招聘的管理功能，属于「就业管理」父模块下的二级模块，包含三个页面：

1. **教师招聘管理** - CRUD + Excel 导入/预校验
2. **医疗卫生管理** - 查询/详情/修改 + Excel 导入
3. **银行/金融管理** - 查询/详情/修改 + Excel 导入

后端三个 Controller 共用一套接口模式，仅请求/响应字段不同。

---

## 1. 导航结构

参照 AGENTS.md 模块层级：

```
employment (level=1)  就业管理          Icon: Briefcase
├── emp_content (level=2)     招聘内容管理
├── emp_civil (level=2)       体制内招录管理
│   ├── emp_civil_servant      公务员职位管理
│   ├── emp_civil_institution  事业编职位管理
│   ├── emp_civil_military     部队文职岗位管理
│   └── emp_civil_selected     选调生岗位管理
├── emp_grassroots (level=2)  基层服务管理
│   ├── emp_grassroots_comm    社区工作者岗位管理
│   ├── emp_grassroots_3s      三支一扶西部计划
│   └── emp_grassroots_welfare 公益性岗位管理
└── emp_industry (level=2)    行业专项招聘管理    Icon: Coin
    ├── emp_industry_teacher (level=3)  教师招聘管理    路径: /employment/industry/teacher
    ├── emp_industry_medical (level=3)  医疗卫生管理    路径: /employment/industry/healthcare
    └── emp_industry_bank (level=3)     银行/金融管理    路径: /employment/industry/finance
```

### 路由文件

新建 `apps/admin/src/router/modules/employment.ts`，在 `router/index.ts` 中导入。

### 侧边栏权限

- `employment` 父级菜单不设 `moduleCode`，仅做导航容器
- `emp_industry` 二级菜单也不设 `moduleCode`，作为三级子菜单容器
- 三级子菜单设 `moduleCode: 'emp_industry_teacher'` / `emp_industry_medical` / `emp_industry_bank`
- 已有路由守卫逻辑自动过滤无权限的子菜单
- 二级菜单"行业专项招聘管理"仅在至少有一个三级子菜单可见时显示

---

## 2. 页面1：教师招聘管理

### 2.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/employment/industry-position/teacher/list` | 分页查询 |
| GET | `/api/v1/admin/employment/industry-position/teacher/{id}/detail` | 详情 |
| PUT | `/api/v1/admin/employment/industry-position/teacher/{id}/update` | 修改 |
| DELETE | `/api/v1/admin/employment/industry-position/teacher/{id}/delete` | 软删除 |
| PATCH | `/api/v1/admin/employment/industry-position/teacher/{id}/status` | 更新岗位状态 |
| POST | `/api/v1/admin/employment/industry-position/teacher/batch-delete` | 批量软删除 |
| POST | `/api/v1/admin/employment/industry-position/teacher/pre-validate` | Excel 预校验 |
| POST | `/api/v1/admin/employment/industry-position/teacher/import` | Excel 导入 |

### 2.2 搜索栏

```text
[学校名称 模糊__] [岗位名称 模糊__] [学校类型 ▼] [学校性质 ▼]
[招聘类型 ▼] [省份 ▼] [城市 模糊__] [区/县 模糊__] [状态 ▼] [查询] [重置]
```

| 字段 | 组件 | 查询方式 | 选项来源 |
|------|------|----------|----------|
| schoolName | el-input | LIKE 模糊 | - |
| positionName | el-input | LIKE 模糊 | - |
| schoolType | el-select | EQ 精准 | 幼儿园/小学/初中/高中/中职/高职/大学/特殊教育学校 |
| schoolNature | el-select | EQ 精准 | 公办/民办 |
| recruitmentType | el-select | EQ 精准 | 编制/合同制/特岗教师/人事代理/编外聘用 |
| province | el-select | EQ 精准 | 省份列表 |
| city | el-input | EQ 精准 | - |
| district | el-input | EQ 精准 | - |
| positionStatus | el-select | EQ 精准 | 招聘中/已结束/即将开始 |

### 2.3 操作工具栏

| 按钮 | 样式 | 说明 |
|------|------|------|
| Excel预校验 | warning | 打开预校验上传弹窗 |
| Excel导入 | success | 打开导入上传弹窗 |
| 批量删除 | danger | 批量软删除，需选中行，disabled 当 selectedIds 为空 |
| 刷新 | default | 重新加载列表 |

### 2.4 表格列

| 列 | 宽度 | 说明 |
|----|------|------|
| selection | 50 | 多选框 |
| id | 140 | ID |
| schoolName | 180 | 学校名称，show-overflow-tooltip |
| schoolType | 100 | 学校类型 |
| schoolNature | 80 | 学校性质 |
| positionName | 200 | 岗位名称，show-overflow-tooltip |
| recruitmentType | 100 | 招聘类型 |
| province | 80 | 省份 |
| city | 80 | 城市 |
| district | 80 | 区/县 |
| positionStatus | 100 | 状态标签（招聘中=success, 已结束=info, 即将开始=warning） |
| updatedAt | 180 | 更新时间 |
| 操作 | 280 | fixed="right" |

### 2.5 操作列按钮

| 按钮 | 样式 | 说明 |
|------|------|------|
| 详情 | primary link | 打开详情弹窗 |
| 修改 | warning link | 打开修改弹窗 |
| 状态切换 | - | el-dropdown 下拉选择：招聘中/已结束/即将开始，选择即调用 status 接口 |
| 删除 | danger link | 软删除，弹出确认框：`确定删除该教师招聘岗位吗？` |

### 2.6 详情弹窗

el-descriptions border，column=2，展示所有业务字段 + sortOrder + createdAt + updatedAt，不含 isDeleted。

字段分组展示（用 el-descriptions-item 顺序排列）：
- **学校与岗位**：schoolName, schoolType, schoolNature, supervisingDept, positionName, subject, recruitmentType
- **地区信息**：province, city, district
- **报考要求**：educationRequirement, degreeRequirement, majorRequirement, ageLimit, recruitmentCount
- **资质要求**：teacherCertRequirement, teacherCertSubject, putonghuaLevel, otherCertRequirement, workExperience, isNormalMajor
- **待遇**：salaryRange, benefits
- **考试与报名**：examContent, interviewForm, regStartDate, regEndDate, examTime, applyLink, contactPhone
- **补充**：remark, content, sortOrder, positionStatus, createdAt, updatedAt

### 2.7 修改弹窗

el-tabs 分 4 个页签：

**Tab1 - 学校与岗位信息**
schoolName(200), schoolType(30), schoolNature(20), supervisingDept(200), positionName(200), subject(50), recruitmentType(30)

**Tab2 - 地区与报考要求**
province(30), city(50), district(50), educationRequirement(30), degreeRequirement(30), majorRequirement(500), ageLimit(integer), recruitmentCount(integer)

**Tab3 - 资质与待遇**
teacherCertRequirement(100), teacherCertSubject(50), putonghuaLevel(30), otherCertRequirement(200), workExperience(50), isNormalMajor(20), salaryRange(50), benefits(textarea)

**Tab4 - 考试与补充**
examContent(500), interviewForm(100), regStartDate(date), regEndDate(date), examTime(date), positionStatus(20), applyLink(500), contactPhone(50), remark(textarea), content(textarea), sortOrder(integer)

每字段括号内为最大长度/类型。所有字段非必填，不传则不修改。

### 2.8 Excel 预校验弹窗

- 标题："Excel 预校验"
- el-upload 拖拽上传，accept=".xlsx,.xls"
- 提示：仅支持 .xlsx / .xls 格式
- 底部按钮："取消" + "开始校验" (warning 样式)
- 校验中显示 loading
- 成功后 ElMessage.success("校验通过")
- 失败时 ElMessage.error 显示后端返回的逐行错误信息

### 2.9 Excel 导入弹窗

- 标题："Excel 导入"
- el-upload 拖拽上传，accept=".xlsx,.xls"
- 提示：仅支持 .xlsx / .xls 格式
- 底部按钮："取消" + "确定导入" (success 样式)
- 导入中显示 loading
- 成功后 ElMessage.success("导入成功")
- 失败时 ElMessage.error 显示错误信息

---

## 3. 页面2：医疗卫生管理

### 3.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/employment/industry-position/healthcare/list` | 分页查询 |
| GET | `/api/v1/admin/employment/industry-position/healthcare/{id}/detail` | 详情 |
| PUT | `/api/v1/admin/employment/industry-position/healthcare/{id}/update` | 修改 |
| DELETE | `/api/v1/admin/employment/industry-position/healthcare/{id}/delete` | 软删除 |
| PATCH | `/api/v1/admin/employment/industry-position/healthcare/{id}/status` | 更新岗位状态 |
| POST | `/api/v1/admin/employment/industry-position/healthcare/batch-delete` | 批量软删除 |
| POST | `/api/v1/admin/employment/industry-position/healthcare/import` | Excel 导入 |

### 3.2 搜索栏

| 字段 | 组件 | 查询方式 | 选项来源 |
|------|------|----------|----------|
| institutionName | el-input | LIKE 模糊 | - |
| positionName | el-input | LIKE 模糊 | - |
| institutionNature | el-select | EQ 精准 | 公立/民营 |
| department | el-select | EQ 精准 | 科室列表 |
| province | el-select | EQ 精准 | 省份列表 |
| city | el-input | EQ 精准 | - |
| district | el-input | EQ 精准 | - |
| positionStatus | el-select | EQ 精准 | 招聘中/已结束/即将开始 |

### 3.3 操作工具栏

| 按钮 | 样式 | 说明 |
|------|------|------|
| Excel导入 | success | 打开导入上传弹窗 |
| 批量删除 | danger | 批量软删除 |
| 刷新 | default | 重新加载列表 |

### 3.4 表格列

| 列 | 宽度 | 说明 |
|----|------|------|
| selection | 50 | 多选框 |
| id | 140 | ID |
| institutionName | 200 | 医疗机构名称，show-overflow-tooltip |
| institutionType | 100 | 机构类型 |
| institutionLevel | 80 | 机构等级 |
| institutionNature | 80 | 机构性质（公立/民营） |
| positionName | 200 | 岗位名称，show-overflow-tooltip |
| positionCategory | 100 | 岗位类别 |
| department | 100 | 科室 |
| recruitmentType | 100 | 招聘类型 |
| province | 80 | 省份 |
| city | 80 | 城市 |
| positionStatus | 100 | 状态标签 |
| updatedAt | 180 | 更新时间 |
| 操作 | 280 | fixed="right" |

### 3.5 操作列按钮

同教师招聘：详情 | 修改 | 状态下拉切换 | 删除

### 3.6 详情弹窗

字段分组：
- **机构信息**：institutionName, institutionType, institutionLevel, institutionNature
- **岗位信息**：positionName, department, positionCategory, recruitmentType
- **地区信息**：province, city, district
- **报考要求**：educationRequirement, degreeRequirement, majorRequirement, ageLimit, recruitmentCount, workExperience
- **资质要求**：licenseRequirement, titleRequirement, internshipRequirement, researchRequirement
- **待遇信息**：salaryRange, benefits, housingSubsidy
- **报名与补充**：regStartDate, regEndDate, examTime, examContent, applyLink, contactPhone, contactPerson, remark, content, sortOrder, positionStatus, createdAt, updatedAt

### 3.7 修改弹窗

el-tabs 分 4 个页签：

**Tab1 - 机构与岗位信息**
institutionName(200), institutionType(50), institutionLevel(30), institutionNature(20), positionName(200), department(100), positionCategory(30), recruitmentType(30)

**Tab2 - 地区与报考要求**
province(30), city(50), district(50), educationRequirement(30), degreeRequirement(30), majorRequirement(500), workExperience(50), ageLimit(integer), recruitmentCount(integer)

**Tab3 - 资质与待遇**
licenseRequirement(100), titleRequirement(30), internshipRequirement(50), researchRequirement(textarea), salaryRange(50), housingSubsidy(100), benefits(textarea)

**Tab4 - 考试与补充**
examContent(500), regStartDate(date), regEndDate(date), examTime(date), applyLink(500), positionStatus(20), contactPhone(50), contactPerson(50), remark(textarea), content(textarea), sortOrder(integer)

### 3.8 Excel 导入弹窗

同教师招聘，但无预校验按钮。

---

## 4. 页面3：银行/金融管理

### 4.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/admin/employment/industry-position/finance/list` | 分页查询 |
| GET | `/api/v1/admin/employment/industry-position/finance/{id}/detail` | 详情 |
| PUT | `/api/v1/admin/employment/industry-position/finance/{id}/update` | 修改 |
| DELETE | `/api/v1/admin/employment/industry-position/finance/{id}/delete` | 软删除 |
| PATCH | `/api/v1/admin/employment/industry-position/finance/{id}/status` | 更新岗位状态 |
| POST | `/api/v1/admin/employment/industry-position/finance/batch-delete` | 批量软删除 |
| POST | `/api/v1/admin/employment/industry-position/finance/import` | Excel 导入 |

### 4.2 搜索栏

| 字段 | 组件 | 查询方式 | 选项来源 |
|------|------|----------|----------|
| institutionName | el-input | LIKE 模糊 | - |
| positionName | el-input | LIKE 模糊 | - |
| institutionCategory | el-select | EQ 精准 | 银行/证券/保险/基金/信托/期货/监管机构/金融科技 |
| institutionType | el-input | EQ 精准 | - |
| province | el-select | EQ 精准 | 省份列表 |
| city | el-input | EQ 精准 | - |
| positionStatus | el-select | EQ 精准 | 招聘中/已结束/即将开始 |

### 4.3 操作工具栏

同医疗卫生：Excel导入 | 批量删除 | 刷新

### 4.4 表格列

| 列 | 宽度 | 说明 |
|----|------|------|
| selection | 50 | 多选框 |
| id | 140 | ID |
| institutionName | 200 | 金融机构名称，show-overflow-tooltip |
| institutionCategory | 80 | 机构大类（银行/证券/保险/...） |
| positionName | 200 | 岗位名称，show-overflow-tooltip |
| positionCategory | 100 | 岗位类别 |
| recruitmentType | 80 | 招聘类型（秋招/春招/社招/实习/定向） |
| province | 80 | 省份 |
| city | 80 | 城市 |
| positionStatus | 100 | 状态标签 |
| updatedAt | 180 | 更新时间 |
| 操作 | 280 | fixed="right" |

### 4.5 操作列按钮

同教师招聘：详情 | 修改 | 状态下拉切换 | 删除

### 4.6 详情弹窗

字段分组：
- **机构信息**：institutionName, institutionCategory, institutionType, institutionLogo, branchName
- **岗位信息**：positionName, positionCategory, recruitmentType, isRemote
- **地区信息**：province, city, workLocation
- **报考要求**：educationRequirement, degreeRequirement, majorRequirement, majorPreference(逗号展示), ageLimit, workExperience, recruitmentCount
- **证书与语言**：certRequirements(逗号展示), languageRequirement, computerRequirement, otherRequirement
- **薪资与福利**：salaryMin-salaryMax(k/月), salaryText, benefits
- **考试与报名**：examContent, examTime, interviewRounds, regStartDate, regEndDate, applyLink, contactInfo
- **补充**：remark, content, sortOrder, positionStatus, createdAt, updatedAt

### 4.7 修改弹窗

el-tabs 分 5 个页签：

**Tab1 - 机构与岗位信息**
institutionName(200), institutionCategory(30), institutionType(50), institutionLogo(500), branchName(200), positionName(200), positionCategory(50), recruitmentType(30)

**Tab2 - 地区与报考要求**
province(30), city(50), workLocation(200), isRemote(boolean), educationRequirement(30), degreeRequirement(30), majorRequirement(500), ageLimit(integer), workExperience(50), recruitmentCount(integer)

**Tab3 - 资质要求**
majorPreference(逗号分隔→数组), certRequirements(逗号分隔→数组), languageRequirement(100), computerRequirement(100), otherRequirement(textarea)

**Tab4 - 薪资与福利**
salaryMin(integer), salaryMax(integer), salaryText(100), benefits(textarea)

**Tab5 - 考试与补充**
examContent(500), examTime(date), interviewRounds(100), regStartDate(date), regEndDate(date), applyLink(500), positionStatus(20), contactInfo(200), remark(textarea), content(textarea), sortOrder(integer)

### 4.8 Excel 导入弹窗

与医疗卫生相同，无预校验。majorePreference 和 certRequirements 字段用逗号分隔传入。

---

## 5. Excel 批量导入通用流程

### 5.1 导入弹窗

三个页面统一使用相同的 el-upload 组件：
- 拖拽上传区域
- accept=".xlsx,.xls"
- limit=1，自动覆盖
- 底部：取消 + 确定导入

### 5.2 预校验弹窗（仅教师招聘）

在上传弹窗中点击"开始校验" → POST `/pre-validate`(FormData/file)：
- 成功：ElMessage.success("校验通过")
- 失败：ElMessage.error 显示后端返回的错误信息（如 "第2行: 学校名称不能为空\n第3行: 省份不合法"）

### 5.3 导入弹窗

点击"确定导入" → POST `/import`(FormData/file)：
- 成功：ElMessage.success("导入成功") → 关闭弹窗 → 刷新列表
- 失败：ElMessage.error 显示后端返回的错误信息

---

## 6. 岗位状态（positionStatus）处理

表格列用 el-tag 展示：
| 值 | 标签类型 | 中文 |
|----|---------|------|
| 招聘中 | success | 招聘中 |
| 已结束 | info | 已结束 |
| 即将开始 | warning | 即将开始 |

操作列用 el-dropdown 直接切换状态，选择即调用 PATCH `/{id}/status`，成功后刷新列表并 ElMessage.success("状态更新成功")。

---

## 7. 软删除处理

- **单条删除**：调用 DELETE `/{id}/delete`，确认框文字："确定删除该{模块名}岗位吗？"
- **批量删除**：调用 POST `/batch-delete`，确认框文字："确定删除选中的 {n} 条记录吗？"
- 均为软删除（is_deleted = true），按钮文字用"删除"而非"永久删除"
- 删除后刷新列表

### 按钮文字说明

> API 提供的是软删除（设置 is_deleted = true），没有硬删除接口。所以按钮文字统一用"删除"和"批量删除"，不出现"永久删除"字样。这样管理员看到"删除"就知道是软删除（可恢复需联系后端），比"软删除"更易懂。

---

## 8. 文件结构

```
apps/admin/src/
├── api/employment/
│   ├── teacher.ts             教师招聘 API
│   ├── healthcare.ts          医疗卫生 API
│   └── finance.ts             银行/金融 API
├── views/employment/
│   ├── teacher/
│   │   └── index.vue          教师招聘页面
│   ├── healthcare/
│   │   └── index.vue          医疗卫生页面
│   └── finance/
│       └── index.vue          银行/金融页面
├── types/employment/
│   ├── teacher.ts             教师招聘类型
│   ├── healthcare.ts          医疗卫生类型
│   └── finance.ts             银行/金融类型
├── router/modules/
│   └── employment.ts          就业管理路由模块
```

---

## 9. 技术实现要点

### 9.1 状态枚举映射

```typescript
const PositionStatusLabel: Record<string, string> = {
  '招聘中': '招聘中',
  '已结束': '已结束',
  '即将开始': '即将开始',
}
const PositionStatusTag: Record<string, string> = {
  '招聘中': 'success',
  '已结束': 'info',
  '即将开始': 'warning',
}
```

### 9.2 API 请求模式

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'

const PREFIX = '/api/v1/admin/employment/industry-position/teacher'

export const getPage = (params: TeacherQueryDTO) =>
  request.get<R<PageResult<TeacherListVO>>>(`${PREFIX}/list`, { params })

export const getDetail = (id: number) =>
  request.get<R<TeacherDetailVO>>(`${PREFIX}/${id}/detail`)

export const update = (id: number, data: TeacherUpdateDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/update`, data)

export const deletePosition = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/delete`)

export const updateStatus = (id: number, data: { positionStatus: string }) =>
  request.patch<R<void>>(`${PREFIX}/${id}/status`, data)

export const batchDelete = (ids: number[]) =>
  request.post<R<void>>(`${PREFIX}/batch-delete`, ids)

export const preValidate = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importExcel = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

### 9.3 Excel 文件上传

使用 el-upload 组件，auto-upload 设为 false，通过 handleImportFileChange 获取 File 对象后手动提交。

### 9.4 表单校验

修改弹窗不强制校验（后端 PUT 更新接口所有字段可选），但提交时如果必填字段为空则略过（不传该字段）。

### 9.5 错误提示

所有请求失败时用 ElMessage.error 展示 `res.data.msg` 或 `err.response?.data?.msg`。

---

## 10. 分页参数

- page 默认 1，最小 1
- size 默认 10，可选值 10/20/30/50/100
- 排序由后端控制：`sort_order` 降序 → `created_at` 降序，前端不展示排序字段
