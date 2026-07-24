# 基层服务岗位管理模块 - 设计文档

## 概述

在管理后台"就业管理"模块下新增"基层服务管理"二级导航，包含三个三级子页面：
1. 基层服务项目岗位（三支一扶+西部计划）
2. 社区工作者岗位
3. 公益性岗位

## 导航结构

```
就业管理（一级，已有）
├── 工业招聘（二级，已有）
│   ├── 教师招聘管理
│   ├── 医疗卫生招聘管理
│   └── 银行/金融招聘管理
├── 基层服务管理（二级，新增，无独立页面，仅展开容器）
│   ├── 基层服务项目岗位（三级，新增）
│   ├── 社区工作者岗位（三级，新增）
│   └── 公益性岗位（三级，新增）
```

## 模块映射

| 页面 | 路由 path | 模块编码 |
|------|-----------|----------|
| 基层服务项目岗位 | `/employment/grassroots/project` | `emp_grassroots_3s` |
| 社区工作者岗位 | `/employment/grassroots/community` | `emp_grassroots_comm` |
| 公益性岗位 | `/employment/grassroots/welfare` | `emp_grassroots_welfare` |

## 文件清单

每个模块生成 3 个文件 + 修改 1 个路由文件：

```
apps/admin/src/
├── api/employment/
│   ├── grassroots.ts       # 基层服务项目岗位 API
│   ├── community.ts        # 社区工作者岗位 API
│   └── welfare.ts          # 公益性岗位 API
├── types/employment/
│   ├── grassroots.ts
│   ├── community.ts
│   └── welfare.ts
├── views/employment/
│   ├── grassroots/index.vue
│   ├── community/index.vue
│   └── welfare/index.vue
├── router/modules/
│   └── employment.ts       # 追加路由条目
```

## API 端点汇总

### 基层服务项目岗位（项目路径: `/api/v1/admin/employment/grassroots-position/project`）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/project/list` | GET | 分页查询 |
| `/project/{id}/detail` | GET | 详情 |
| `/project/{id}/update` | PUT | 修改 |
| `/project/{id}/delete` | DELETE | 软删除 |
| `/project/{id}/status` | PATCH | 更新岗位状态 |
| `/project/batch-delete` | POST | 批量软删除 |
| `/project/pre-validate` | POST | Excel 校验 |
| `/project/import` | POST | Excel 导入 |

### 社区工作者岗位（项目路径: `/api/v1/admin/employment/grassroots-position/community`）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/community/list` | GET | 分页查询 |
| `/community/{id}/detail` | GET | 详情 |
| `/community/{id}/update` | PUT | 修改 |
| `/community/{id}/delete` | DELETE | 软删除 |
| `/community/{id}/status` | PATCH | 更新岗位状态 |
| `/community/batch-delete` | POST | 批量软删除 |
| `/community/pre-validate` | POST | Excel 校验 |
| `/community/import` | POST | Excel 导入 |

### 公益性岗位（项目路径: `/api/v1/admin/employment/grassroots-position/welfare`）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/welfare/list` | GET | 分页查询 |
| `/welfare/{id}/detail` | GET | 详情 |
| `/welfare/{id}/update` | PUT | 修改 |
| `/welfare/{id}/delete` | DELETE | 软删除 |
| `/welfare/{id}/status` | PATCH | 更新岗位状态 |
| `/welfare/batch-delete` | POST | 批量软删除 |
| `/welfare/pre-validate` | POST | Excel 校验 |
| `/welfare/import` | POST | Excel 导入 |

## 类型定义

每个模块定义 4 个接口（与 teacher 模块模式一致）：
- `XxxListVO` — 列表响应
- `XxxDetailVO` — 详情响应（全部表字段 + isDeleted, createdAt, updatedAt）
- `XxxQueryDTO` — 查询参数（page, size + 筛选字段）
- `XxxUpdateDTO` — 更新参数（所有字段可选，部分更新）
- 复用 `PositionStatusDTO`（来自 `@/types/employment/shared` 或内联定义）

## 页面布局

每个页面统一结构：

### 1. 搜索栏
- `<el-form inline>` 分两行显示
- 模糊字段用 `<el-input>`，精确枚举字段用 `<el-select>`
- 查询 / 重置按钮

### 2. 操作按钮栏
- Excel校验（warning 按钮）
- Excel导入（success 按钮）
- 批量软删除（danger 按钮，无选中时 disabled）
- 刷新按钮

### 3. 数据表格
- `<el-table>` 带 selection 列
- 状态列用 `<el-tag>` 着色
- 操作列：详情 / 修改 / 状态下拉(使用 `<el-dropdown>`) / 删除

### 4. 分页
- `<el-pagination>` 选项 10/20/30/50/100

### 5. 详情弹窗
- `<el-dialog>` + `<el-descriptions :column="2" border>` 只读展示

### 6. 修改弹窗
- `<el-dialog>` + `<el-tabs>` 分 4 个 Tab

### 7. Excel 弹窗（校验 / 导入各一个）
- `<el-upload>` 拖拽上传，.xlsx / .xls

## 列表表格列

### 基层服务项目岗位
| ID | 项目类型 | 招募年份 | 岗位名称 | 服务类型 | 组织单位 | 服务单位 | 省份 | 城市 | 区/县 | 状态 | 更新时间 | 操作 |

### 社区工作者岗位
| ID | 社区名称 | 岗位名称 | 主管部门 | 岗位类型 | 省份 | 城市 | 状态 | 更新时间 | 操作 |

### 公益性岗位
| ID | 开发单位 | 用工单位 | 岗位名称 | 岗位类别 | 省份 | 城市 | 区/县 | 月工资 | 报名起止 | 状态 | 操作 |

## 编辑弹窗 Tab 划分

### 基层服务项目岗位
| Tab | 字段 |
|-----|------|
| 项目与岗位信息 | projectType, year, positionName, serviceType, organizingDept, serviceUnit, sortOrder |
| 服务地点与要求 | province, city, county, township, educationRequirement, majorRequirement, ageLimit, recruitmentCount, gradYearRequirement, householdRequirement, politicalStatus, otherRequirement |
| 待遇与期满政策 | monthlySubsidy, socialInsurance, housingInfo, otherBenefits, afterServicePolicy, canTransferToCivil, canTransferToInstitution, examBonusPoints, tuitionCompensation, postgradBonus |
| 考试与报名 | examContent, examTime, interviewForm, regStartDate, regEndDate, applyLink, positionStatus, contactPhone, remark, content |

### 社区工作者岗位
| Tab | 字段 |
|-----|------|
| 单位与岗位信息 | streetOffice, communityName, supervisingDept, district, positionName, positionType, employmentType, sortOrder |
| 地区与报考要求 | province, city, workLocation, educationRequirement, ageLimit, recruitmentCount, majorRequirement, householdRequirement, politicalStatus |
| 特殊要求与待遇 | workExperience, socialWorkCert, communityExperience, residenceRequirement, salaryRange, salaryComposition, benefits |
| 考试与报名 | examContent, interviewForm, regStartDate, regEndDate, examTime, positionStatus, applyLink, applyMethod, contactPhone, contactAddress, remark, content |

### 公益性岗位
| Tab | 字段 |
|-----|------|
| 单位与岗位信息 | developingUnit, employingUnit, positionName, positionCategory, workContent, sortOrder |
| 地区与报名要求 | province, city, district, workLocation, targetGroup, educationRequirement, ageRange, healthRequirement, recruitmentCount, householdRequirement, employmentDifficultyCert, otherRequirement |
| 岗位期限与待遇 | contractPeriod, isRenewable, maxServiceYears, monthlySalary, salarySource, subsidyStandard, socialInsuranceInfo, otherBenefits, workSchedule, isShiftWork |
| 报名与补充 | regStartDate, regEndDate, applyMethod, applyAddress, requiredDocuments, positionStatus, contactPhone, contactPerson, remark, content |

## 按钮命名

| 按钮 | 命名 |
|------|------|
| 单条删除 | 删除 |
| 批量删除 | 批量软删除 |
| Excel校验 | Excel校验 |
| Excel导入 | Excel导入 |

## 状态枚举

### 基层服务项目岗位
- 招募中（success）— 接口用"招募中"
- 已结束（info）
- 即将开始（warning）

### 社区工作者 / 公益性岗位
- 招聘中（success）
- 已结束（info）
- 即将开始（warning）

## 注意事项
1. 排序字段 sortOrder 不在列表展示
2. 无硬删除接口，只做软删除
3. 报错使用 ElMessage.error 展示后端返回的 msg
4. 错误信息从后端返回，用 catch 或 res.data.msg 展示
5. 参照现有 teacher 模块的代码风格和组件用法
6. 注意 AGENTS.md 中的 moduleCode 权限校验
