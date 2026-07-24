# 体制内招录模块 - 管理端前端设计文档

## 概述

在就业管理模块下新增"体制内招录"二级菜单，包含4个三级页面：公务员职位、事业编职位、部队文职岗位、选调生岗位。每个页面功能一致：分页查询、详情、修改、软删除、更新状态、批量删除、Excel预校验、Excel导入。

## 导航层级

```
就业管理 (Employment)
├── 体制内招录 (二级菜单, moduleCode: emp_civil)
│   ├── 公务员职位 (三级, moduleCode: emp_civil_servant)
│   ├── 事业编职位 (三级, moduleCode: emp_civil_institution)
│   ├── 部队文职岗位 (三级, moduleCode: emp_civil_military)
│   └── 选调生岗位 (三级, moduleCode: emp_civil_selected)
├── 基层服务管理 (已有)
├── 招聘内容管理 (已有)
├── 教师招聘管理 (已有)
├── 医疗卫生招聘管理 (已有)
└── 银行/金融招聘管理 (已有)
```

## 后端API基础路径

| 模块 | 基础路径 |
|------|---------|
| 公务员 | `/api/v1/admin/employment/civil-service/civil-position` |
| 事业编 | `/api/v1/admin/employment/civil-service/institution-position` |
| 部队文职 | `/api/v1/admin/employment/civil-service/military-position` |
| 选调生 | `/api/v1/admin/employment/civil-service/selection-position` |

每个模块均包含8个接口：分页列表(GET /list)、详情(GET /{id}/detail)、修改(PUT /{id}/update)、软删除(DELETE /{id}/delete)、更新状态(PATCH /{id}/status)、批量删除(POST /batch-delete)、Excel预校验(POST /pre-validate)、Excel导入(POST /import)。

## 页面模板（4页共用同一布局模板）

### 搜索区
白底圆角卡片，el-form inline，每行查询条件按模块定义：

**公务员查询字段**: positionName(模糊), recruitingDept(模糊), workLocation(模糊), examType(精确:国考/省考), regStatus(精确:报名中/已结束/即将开始), minEducation(精确:不限/大专/本科/硕士/博士)

**事业编查询字段**: positionName(模糊), supervisingDept(模糊), institution(模糊), province(精确), examCategory(精确), positionType(精确), positionStatus(精确:招聘中/已结束)

**部队文职查询字段**: positionName(模糊), employerUnit(模糊), department(模糊), positionType(精确), positionStatus(精确:进行中/已结束)

**选调生查询字段**: positionName(模糊), targetUnit(模糊), organizingDept(模糊), selectionType(精确:定向选调/非定向选调/急需紧缺专业选调), year(精确), province(精确), politicalStatus(精确), positionStatus(精确:报名中/笔试阶段/面试阶段/已结束/即将开始)

### 操作栏
左对齐：Excel预校验(el-button type="warning") | Excel导入(el-button type="success") | 批量删除(el-button type="danger")
右对齐：刷新(el-button)

### 数据表格
el-table stripe，首列多选，末列操作固定右侧，分页组件 el-pagination (page-sizes: 10/20/30/50/100)

**公务员列表字段**: id, positionName, examType, recruitingDept, minEducation, workLocation, regStartDate, regEndDate, regStatus(用el-tag彩色显示)
**事业编列表字段**: id, positionName, supervisingDept, institution, province, examCategory, positionType, subCategory, salaryRange, positionStatus(用el-tag)
**部队文职列表字段**: id, positionName, employerUnit, department, positionType, workLocation, salaryRange, regDeadline, positionStatus(用el-tag)
**选调生列表字段**: id, positionName, selectionType, year, province, organizingDept, targetUnit, workLocation, politicalStatus, regStartDate, regEndDate, positionStatus(用el-tag)

**操作列**: 详情(el-button primary link) | 修改(el-button warning link) | 状态下拉(el-dropdown) | 删除(el-button danger link)

### 状态更新
使用 el-dropdown，点击选项调用 PATCH /{id}/status 接口。各模块可选状态值：
- 公务员: 报名中/已结束（接口传 { status: 0|1 }，注意是数字status）
- 事业编: 招聘中/已结束（接口传 { status: 0|1 }）
- 部队文职: 进行中/已结束（接口传 { positionStatus: "进行中" }）
- 选调生: 报名中/笔试阶段/面试阶段/已结束/即将开始（接口传 { positionStatus: "报名中" }）

### 详情对话框
el-dialog 900px，el-descriptions border 2列展示全部字段

### 修改对话框
el-dialog 900px，el-tabs 按字段语义分tab，所有字段选填。提交 PUT /{id}/update，只传非空字段。

### Excel导入
两个独立的 el-dialog 500px，使用 el-upload drag 模式：
- "Excel预校验"：选文件 → 开始校验，调 /pre-validate
- "Excel导入"：选文件 → 确定导入，调 /import

## 文件清单

### 类型定义
- `apps/admin/src/types/employment/civil.ts` — 公务员VO/DTO
- `apps/admin/src/types/employment/institution.ts` — 事业编VO/DTO
- `apps/admin/src/types/employment/military.ts` — 部队文职VO/DTO
- `apps/admin/src/types/employment/selection.ts` — 选调生VO/DTO

### API定义
- `apps/admin/src/api/employment/civil/index.ts`
- `apps/admin/src/api/employment/institution/index.ts`
- `apps/admin/src/api/employment/military/index.ts`
- `apps/admin/src/api/employment/selection/index.ts`

### 页面视图
- `apps/admin/src/views/employment/civil/index.vue`
- `apps/admin/src/views/employment/institution/index.vue`
- `apps/admin/src/views/employment/military/index.vue`
- `apps/admin/src/views/employment/selection/index.vue`

### 路由修改
- `apps/admin/src/router/modules/employment.ts` — 新增"体制内招录"二级组及其4个子路由

## 注意事项

1. 没有"新增"接口，只有修改，故不提供新增按钮
2. 没有批量硬删除接口，批量删除均为软删除（调用 batch-delete）
3. 分页列表不展示 sortOrder 字段
4. 使用 ElMessage 提示错误信息，ElMessageBox.confirm 确认删除操作
5. 异常捕获使用 try-catch，显示后端返回的错误消息
