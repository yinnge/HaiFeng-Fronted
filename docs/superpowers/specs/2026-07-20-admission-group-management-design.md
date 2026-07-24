# 专业组管理模块 - 设计文档

## 1. 概述

专业组管理模块用于管理高考志愿填报系统中的专业组录取数据，包含两个子页面：专业组录取列表页、专业明细列表页。支持CRUD、禁用/启用、软删除、批量软删除、Excel导入、全量重算等功能。

## 2. 导航结构

```
高考算法 (algorithm, level=1)
  └── 专业组管理 (algo_admission, level=2)
      ├── 专业组列表 (algo_admission_grp, level=3)   ← 专业组录取列表页
      └── 专业明细列表 (algo_admission_dtl, level=3)  ← 专业明细列表页
```

### 路由路径

| 页面 | 路径 | 模块编码 |
|------|------|----------|
| 专业组列表 | `/algorithm/admission/group` | `algo_admission_grp` |
| 专业明细列表 | `/algorithm/admission/major-score` | `algo_admission_dtl` |

路由表定义文件：`apps/admin/src/router/modules/algorithm.ts`

## 3. 文件结构

```
apps/admin/src/
├── api/algorithm/
│   └── admission/
│       ├── group.ts                    # 专业组 API
│       └── major-score.ts             # 专业明细 API
├── types/algorithm/
│   └── admission/
│       ├── group.ts                    # 专业组类型定义
│       └── major-score.ts             # 专业明细类型定义
├── views/algorithm/
│   └── admission/
│       ├── group/
│       │   └── index.vue               # 专业组录取列表页
│       └── major-score/
│           └── index.vue               # 专业明细列表页
└── router/modules/
    └── algorithm.ts                    # 算法模块路由
```

## 4. 专业组录取列表页

### 4.1 搜索栏

白底圆角卡片，el-form inline 两行布局，共8个筛选字段：

| 字段 | 组件 | 查询方式 | 说明 |
|------|------|----------|------|
| 大学名称 | el-input | 模糊 | placeholder "模糊搜索" |
| 年份 | el-input-number | 精确 | 范围2000-2100 |
| 省份 | el-select | 精确 | 31个标准省市 |
| 选科类型 | el-select | 精确 | 不限/2选1/3选1/必选1/必选2/必选3 |
| 省招代码 | el-input | 模糊 | placeholder "模糊搜索" |
| 专业组代码 | el-input | 模糊 | placeholder "模糊搜索" |
| 专业组名称 | el-input | 模糊 | placeholder "模糊搜索" |
| 状态 | el-select | 精确 | 全部/启用/禁用 |

底部：[查询] [重置] 按钮

### 4.2 操作栏

| 按钮 | 说明 |
|------|------|
| 新增专业组 | 打开新增Dialog |
| 导入Excel | 触发文件选择器，导入xlsx |
| 全量重算 | 触发全量重算聚合数据 |
| 批量软删除 | 选中多项后批量移除 |
| 刷新 | 刷新列表数据 |

### 4.3 表格

- stripe 条纹
- 带 selection 列（多选）
- 分页参数：10/20/30/50/100

**列定义：**
| 列 | 宽度 | 说明 |
|----|------|------|
| ID | 80 | |
| 大学名称 | 140 | show-overflow-tooltip |
| 城市 | 100 | |
| 年份 | 80 | |
| 省份 | 100 | |
| 批次 | 100 | |
| 省招代码 | 120 | |
| 专业组代码 | 100 | |
| 专业组名称 | 140 | show-overflow-tooltip |
| 选科要求 | 140 | subjects + requirementType 合并展示 |
| 专业数量 | 90 | |
| 录取人数 | 90 | |
| 最低分 | 80 | |
| 最低位次 | 90 | |
| 平均分 | 80 | |
| 状态 | 80 | 启用(绿色tag)/禁用(灰色tag) |
| 操作 | 350 | 固定右侧 |

### 4.4 操作按钮

行内操作按钮（固定最右列）：
- **详情** - 打开详情Dialog
- **修改** - 打开修改Dialog
- **明细** - 跳转到专业明细列表页，自动带入该groupId
- **禁用/启用** - 切换状态（PUT status），确认后操作
- **软删除** - 单条软删除，确认后操作

### 4.5 Dialog：详情模式

el-descriptions 展示所有字段（border, 2列）：

基本信息分组：
- ID、大学名称、城市、年份、省份、批次、省招代码、专业组代码、专业组名称、选科要求（科目数组+选科类型合并展示）、专业数量、专业门类数量、录取人数、约束条件（tag展示）

分数信息分组：
- 最低分、最低位次、平均分、平均位次、最高分、最高位次

其他信息：
- 专业组简介、状态、创建时间、更新时间

### 4.6 Dialog：新增/修改模式

el-form 表单，含以下字段：

| 字段 | 组件 | 必填 | 新增 | 修改 |
|------|------|------|------|------|
| 大学名称 | el-input | 是 | ✓ | ✓ |
| 年份 | el-input-number | 是 | ✓ | ✓ |
| 省份 | el-select | 是 | ✓ | ✓ |
| 批次 | el-select | 是 | ✓ | ✓ |
| 省招代码 | el-input | 否 | ✓ | ✓ |
| 专业组代码 | el-input | 是 | ✓ | ✓ |
| 专业组名称 | el-input | 否 | ✓ | ✓ |
| 科目 | el-select multiple | 否 | ✓ | ✓ |
| 选科类型 | el-select | 否 | ✓ | ✓ |
| 专业组简介 | el-input textarea | 否 | ✓ | ✓ |
| 约束条件 | el-select allow-create multiple | 否 | ✓ | ✓ |

## 5. 专业明细列表页

### 5.1 搜索栏

白底圆角卡片，el-form inline，5个筛选字段：

| 字段 | 组件 | 查询方式 | 说明 |
|------|------|----------|------|
| 所属专业组 | el-select | 精确 | 加载所有专业组列表（id + groupName） |
| 专业代码 | el-input | 模糊 | placeholder "模糊搜索" |
| 专业名称 | el-input | 模糊 | placeholder "模糊搜索" |
| 层次 | el-select | 精确 | 全部/本科/专科 |
| 状态 | el-select | 精确 | 全部/启用/禁用 |

底部：[查询] [重置] 按钮

**自动带入：** 从专业组列表点击"明细"按钮跳转时，自动填充所属专业组并触发查询。

### 5.2 操作栏

| 按钮 | 说明 |
|------|------|
| 新增专业明细 | 打开新增Dialog（自动填充当前选中的所属专业组） |
| 批量软删除 | 选中多项后批量移除 |
| 刷新 | 刷新列表数据 |

### 5.3 表格

**列定义：**
| 列 | 宽度 | 说明 |
|----|------|------|
| ID | 80 | |
| 专业组ID | 90 | |
| 专业代码 | 120 | |
| 专业名称 | 160 | show-overflow-tooltip |
| 层次 | 80 | |
| 录取人数 | 90 | |
| 最低分 | 80 | |
| 最低位次 | 90 | |
| 平均分 | 80 | |
| 状态 | 80 | 启用(绿色tag)/禁用(灰色tag) |
| 操作 | 300 | 固定右侧 |

### 5.4 操作按钮

行内操作按钮：
- **详情** - 打开详情Dialog
- **修改** - 打开修改Dialog
- **禁用/启用** - 切换状态
- **软删除** - 单条软删除

### 5.5 Dialog：详情模式

el-descriptions 展示所有字段：

基本信息：ID、专业组ID、专业ID、专业代码、专业名称、层次、学制、学费、状态、创建时间、更新时间
分数信息：录取人数、最低分、最低位次、平均分、平均位次、最高分、最高位次
其他：专业简介、约束条件（tag展示）

### 5.6 Dialog：新增/修改模式

el-form 表单：

| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 所属专业组 | el-select | 是 | 加载专业组列表 |
| 专业代码 | el-input | 是 | |
| 专业名称 | el-input | 是 | |
| 层次 | el-select | 否 | 本科/专科 |
| 学制 | el-input | 否 | 如"四年" |
| 学费 | el-input | 否 | 如"5000元/年" |
| 录取人数 | el-input-number | 否 | |
| 最低分 | el-input-number | 否 | |
| 最低位次 | el-input-number | 否 | |
| 中位分 | el-input-number | 否 | |
| 中位位次 | el-input-number | 否 | |
| 最高分 | el-input-number | 否 | |
| 最高位次 | el-input-number | 否 | |
| 约束条件 | el-select allow-create multiple | 否 | |
| 专业简介 | el-input textarea | 否 | |

## 6. API 端点清单

### 专业组 (base: `/api/v1/admin/algorithm/admission/group`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/page` | 分页查询 |
| GET | `/{id}` | 获取详情 |
| POST | `/` | 新增 |
| PUT | `/{id}` | 修改 |
| PUT | `/{id}/status` | 禁用/启用（query: isDeleted） |
| DELETE | `/{id}` | 软删除 |
| POST | `/batch` | 批量软删除（body: id数组） |
| POST | `/import` | 导入Excel（multipart） |
| POST | `/recalc-all` | 全量重算 |

### 专业明细 (base: `/api/v1/admin/algorithm/admission/major-score`)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/page` | 分页查询 |
| GET | `/{id}` | 获取详情 |
| POST | `/` | 新增 |
| PUT | `/{id}` | 修改 |
| PUT | `/{id}/status` | 禁用/启用（query: isDeleted） |
| DELETE | `/{id}` | 软删除 |
| POST | `/batch` | 批量软删除（body: id数组） |

## 7. 错误处理

- 所有 API 调用使用 try-catch 包裹
- 成功：ElMessage.success 提示
- 业务错误（code ≠ 200）：ElMessage.error 显示后端 msg
- 网络异常：ElMessage.error 显示"操作失败"
- 删除/状态变更操作前使用 ElMessageBox.confirm 二次确认

## 8. 与现有项目规范的一致性

- Vue 3 Composition API + `<script setup>`
- Element Plus 组件库
- 参考 `views/university/info/index.vue` 的页面模式
- 参考 `api/university/info.ts` 的 API 调用模式
- 参考 `types/university/info.ts` 的类型定义模式
- 参考 `router/modules/university.ts` 的路由定义模式
- 权限控制：每个路由的 `meta.moduleCode` 对应 AGENTS.md
- 搜索栏白底圆角卡片、分页 10/20/30/50/100、表格 stripe 等保持一致
