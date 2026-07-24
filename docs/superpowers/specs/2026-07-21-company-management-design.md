# 企业管理模块 - 设计规范

## 概述

本模块实现企业信息管理功能，属于「企业管理」父模块，包含两个子模块页面：
1. 企业列表 - 管理企业基本信息，支持 Excel 批量导入（企业+岗位多Sheet）
2. 企业-行业关联 - 管理企业与行业的多对多关联关系，支持 Excel 批量导入

---

## 1. 导航结构

参照 AGENTS.md 模块层级：

```
company (level=1)  企业管理          Icon: Briefcase
├── company_info (level=2)    企业列表     路径: /company/info
└── company_industry (level=2) 企业-行业关联  路径: /company/industry
```

### 路由文件

新建 `apps/admin/src/router/modules/company.ts`，在 `router/index.ts` 中导入。

### 侧边栏权限

- `company` 父级菜单不设 `moduleCode`，子级菜单设 `moduleCode: 'company_info'` 和 `moduleCode: 'company_industry'`
- 已有路由守卫逻辑自动过滤无权限的子菜单，父菜单仅在存在可见子菜单时显示

---

## 2. 页面1：企业列表

### 2.1 搜索栏

| 字段 | 组件 | 查询方式 |
|------|------|----------|
| 企业名称 | el-input 模糊搜索 | 模糊 |
| 城市名称 | el-input 模糊搜索 | 模糊 |
| 企业性质 | el-select（央企/国企/民企/外企/合资） | 精确 |
| 企业类型 | el-input 模糊搜索 | 模糊 |
| 招聘状态 | el-select（招聘中/已结束） | 精确 |
| 状态(是否禁用) | el-select（启用/禁用） | 精确 |

### 2.2 操作按钮

| 按钮 | 样式 | 说明 |
|------|------|------|
| 新增企业 | primary | 打开新增弹窗 |
| Excel批量导入 | success (el-dropdown split-button) | 导入企业+岗位(多Sheet)，见弹窗 |
| 批量永久删除 | danger (disabled when no selection) | 批量硬删除 |
| 刷新 | default | 重新加载列表 |

### 2.3 表格列

| 列 | 宽度 | 说明 |
|----|------|------|
| (多选) | 50 | 用于批量操作 |
| ID | 140 | - |
| 城市名称 | 120 | - |
| 企业名称 | min-width 200 | show-overflow-tooltip |
| 企业性质 | 100 | 直接展示文本 |
| 企业类型 | 150 | show-overflow-tooltip |
| 招聘状态 | 100 | 直接展示文本 |
| 状态 | 80 | el-tag: isDeleted=false → "启用"(success), isDeleted=true → "禁用"(info) |
| 创建时间 | 180 | - |
| 操作 | 300 fixed right | 详情 / 修改 / [启用|禁用](toggle) / 永久删除 |

### 2.4 详情弹窗

使用 el-descriptions border column=2 展示：

- ID | 城市名称
- 企业名称 | 企业性质
- 企业类型 | 招聘状态
- 状态(Tag) | 总部地区
- 企业规模 | Logo地址(链接)
- 官网(链接) | 主营业务
- 企业简介(多行) | 创建时间
- 更新时间 | -

### 2.5 岗位子表格

在详情弹窗底部展示岗位列表，使用 el-table：

| 列 | 说明 |
|----|------|
| 岗位名称 | - |
| 招聘类型 | 校招/社招/实习 |
| 省份 | - |
| 城市 | - |
| 工作地点 | - |
| 学历要求 | - |
| 专业要求 | - |
| 工作经验 | - |
| 最低薪资 | (k/月) |
| 最高薪资 | (k/月) |
| 岗位状态 | 招聘中/已结束(Tag) |
| 截止日期 | - |

### 2.6 新增/编辑弹窗

表单字段（全部展示，el-form label-width=120px）：

| 字段 | 必填 | 组件 | 校验/说明 |
|------|------|------|-----------|
| 城市名称 | 否 | el-input | maxlength=50 |
| 企业名称 | 是 | el-input | maxlength=200，唯一校验后端返回 |
| 企业性质 | 是 | el-select | 央企/国企/民企/外企/合资 |
| 企业类型 | 否 | el-input | maxlength=50 |
| Logo地址 | 否 | el-input | maxlength=500 |
| 官网 | 否 | el-input | maxlength=500 |
| 总部地区 | 否 | el-input | maxlength=100 |
| 企业规模 | 否 | el-input | maxlength=50 |
| 主营业务 | 否 | el-input | maxlength=500 |
| 企业简介 | 否 | el-textarea | 无长度限制 |
| 招聘状态 | 否 | el-input | maxlength=20，默认"招聘中" |

### 2.7 导入弹窗

- el-upload 拖拽上传，accept=".xlsx,.xls"
- 单文件，手动触发上传
- 上传成功后刷新列表
- 失败时显示后端返回的错误 msg

---

## 3. 页面2：企业-行业关联

### 3.1 搜索栏

| 字段 | 组件 | 查询方式 |
|------|------|----------|
| 企业名称 | el-input 模糊搜索 | 模糊 |
| 行业名称 | el-input 模糊搜索 | 模糊 |

### 3.2 操作按钮

> 注：企业-行业关联仅可通过 Excel 导入创建，无单独的新增接口。

| 按钮 | 样式 | 说明 |
|------|------|------|
| Excel批量导入 | success | 导入企业-行业关联 |
| 批量永久删除 | danger (disabled when no selection) | 批量硬删除 |
| 刷新 | default | 重新加载列表 |

### 3.3 表格列

| 列 | 宽度 | 说明 |
|----|------|------|
| (多选) | 50 | 用于批量操作 |
| ID | 140 | - |
| 企业名称 | 180 | show-overflow-tooltip |
| 行业名称 | 180 | show-overflow-tooltip |
| 是否主行业 | 120 | el-tag: isPrimary=true → "主行业"(success), false → "普通"(info) |
| 创建时间 | 180 | - |
| 操作 | 200 fixed right | 详情 / 永久删除 |

> `sortOrder` 字段按照要求隐藏不展示。

### 3.4 详情弹窗

使用 el-descriptions border column=1：

| 字段 | 说明 |
|------|------|
| ID | 关联ID |
| 企业名称 | - |
| 行业名称 | - |
| 是否主行业 | Tag展示 |
| 创建时间 | - |

### 3.5 导入弹窗

同企业列表页的导入弹窗设计。

---

## 4. 错误处理

所有 API 调用遵循统一规范：
- `res.data.code === 200` → 成功，`ElMessage.success()`
- `res.data.code !== 200` → 失败，`ElMessage.error(res.data.msg)`
- `try/catch` 网络异常 → `ElMessage.error('操作失败')`

---

## 5. 文件清单

### 新增文件

| 文件路径 | 说明 |
|---------|------|
| `apps/admin/src/router/modules/company.ts` | 路由定义 |
| `apps/admin/src/types/company/index.ts` | 类型定义（Enterprise + EnterpriseIndustry） |
| `apps/admin/src/api/company/index.ts` | API 封装 |
| `apps/admin/src/views/company/info/index.vue` | 企业列表页 |
| `apps/admin/src/views/company/industry/index.vue` | 企业-行业关联页 |

### 修改文件

| 文件路径 | 说明 |
|---------|------|
| `apps/admin/src/router/index.ts` | 导入 companyRoutes 并注册 |

---

## 6. 接口清单

### 企业列表

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/v1/admin/company/enterprise/list` | 分页查询列表 |
| GET | `/api/v1/admin/company/enterprise/{id}` | 获取详情 |
| POST | `/api/v1/admin/company/enterprise/` | 新增企业 |
| PUT | `/api/v1/admin/company/enterprise/{id}` | 修改企业 |
| PUT | `/api/v1/admin/company/enterprise/{id}/status` | 修改状态 |
| DELETE | `/api/v1/admin/company/enterprise/{id}` | 删除企业（硬删除） |
| POST | `/api/v1/admin/company/enterprise/batch/delete` | 批量硬删除 |
| POST | `/api/v1/admin/company/enterprise/import` | Excel批量导入 |

### 企业-行业关联

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/v1/admin/company/enterprise-industry/list` | 分页查询列表 |
| GET | `/api/v1/admin/company/enterprise-industry/{id}` | 获取详情 |
| DELETE | `/api/v1/admin/company/enterprise-industry/{id}` | 删除关联（硬删除） |
| POST | `/api/v1/admin/company/enterprise-industry/batch/delete` | 批量硬删除 |
| POST | `/api/v1/admin/company/enterprise-industry/import` | Excel批量导入 |
