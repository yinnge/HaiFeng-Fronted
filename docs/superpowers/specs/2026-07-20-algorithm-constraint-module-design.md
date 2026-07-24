# 算法约束模块前端设计文档

## 概述

为管理后台新增算法约束模块，包含三个子页面：约束字典管理、专业约束关联管理、安全系数管理。位于「高考算法」父模块下。

## 路由结构

在 `router/modules/algorithm.ts` 中新增：

```
algorithm (高考算法, level-1, 已有)
├── algo_constraint (约束管理, level-2, 新增)
│   ├── algo_constraint_dict (约束字典, level-3, 新增)
│   └── algo_constraint_mjr (专业约束关联, level-3, 新增)
├── algo_safety (安全系数管理, level-2, 新增)
│   └── algo_safety_level (安全系数, level-3, 新增)
└── 现有 admission/config 子模块保持不变
```

### 模块代码映射

| 路由 | meta.moduleCode |
|------|----------------|
| algo_constraint (父级) | 无（仅导航容器） |
| algo_constraint_dict | `algo_constraint_dict` |
| algo_constraint_mjr | `algo_constraint_mjr` |
| algo_safety (父级) | 无（仅导航容器） |
| algo_safety_level | `algo_safety_level` |

## 页面设计

### 1. 约束字典页

**路径**: `views/algorithm/constraint/dict/index.vue`

#### 工具栏
- `+ 新增约束` (primary button)
- `批量删除` (danger button, 选中后才可点击)
- `刷新` (default button)

#### 表格列
| 列 | 说明 |
|----|------|
| code | 约束代码 |
| name | 约束名称 |
| category | 约束大类 |
| severity | 严重程度（HARD/SOFT），用 el-tag 展示 |
| checkField | 检查字段 |
| isActive | 状态（启用/禁用），用 el-tag success/info 展示 |
| 操作 | 详情、修改、切换状态、删除 |

#### 弹窗
- **详情**: el-descriptions 展示全部字段（含 description, checkOperator, checkValue, extra* 等）
- **新增/修改**: el-form 表单，字段 = 新增请求体所有字段（code, name, category, severity(select), description, checkField, checkOperator, checkValue, extraField, extraOperator, extraValue, sortOrder, isActive(switch)）
- **切换状态**: ElMessageBox.confirm 后调 toggle 接口
- **删除**: ElMessageBox.confirm「确定删除该约束吗？删除后可恢复」

#### 接口
| 操作 | API | 方法 |
|------|-----|------|
| 分页列表 | `/api/v1/admin/algorithm/constraint/dict/page` | GET |
| 详情 | `/api/v1/admin/algorithm/constraint/dict/{code}` | GET |
| 新增 | `/api/v1/admin/algorithm/constraint/dict` | POST |
| 修改 | `/api/v1/admin/algorithm/constraint/dict/{code}` | PUT |
| 切换状态 | `/api/v1/admin/algorithm/constraint/dict/{code}/toggle` | PUT |
| 删除 | `/api/v1/admin/algorithm/constraint/dict/{code}` | DELETE |
| 批量删除 | `/api/v1/admin/algorithm/constraint/dict/batch-delete` | POST |

> 列表接口无查询条件，不加搜索栏。
> 有 isActive(状态) 和 sortOrder(排序)，排序字段不在表格展示。

### 2. 专业约束关联页

**路径**: `views/algorithm/constraint/major/index.vue`

#### 搜索栏
4个精确查询框 inline: 专业代码、专业名称、约束代码、约束名称 + 查询/重置按钮

#### 工具栏
- `+ 新增关联` (primary button)
- `Excel导入` (success button)
- `批量删除` (danger button)
- `刷新` (default button)

#### 表格列
| 列 | 说明 |
|----|------|
| id | 主键ID（字符串类型） |
| majorCode | 专业代码 |
| majorName | 专业名称 |
| constraintCode | 约束代码 |
| constraintName | 约束名称 |
| 操作 | 详情、删除 |

#### 弹窗
- **详情**: 展示 id, majorCode, majorName, constraintCode, constraintName, remark, createdAt
- **新增**: 表单 majorName(必填), constraintName(必填), remark
- **Excel导入**: el-upload 拖拽上传 .xlsx/.xls，模板列：专业名称、约束名称、备注

#### 接口
| 操作 | API | 方法 |
|------|-----|------|
| 分页列表 | `/api/v1/admin/algorithm/constraint/major/page` | GET |
| 详情 | `/api/v1/admin/algorithm/constraint/major/{id}` | GET |
| 新增 | `/api/v1/admin/algorithm/constraint/major` | POST |
| 删除 | `/api/v1/admin/algorithm/constraint/major/{id}` | DELETE |
| 批量删除 | `/api/v1/admin/algorithm/constraint/major/batch-delete` | POST |
| Excel导入 | `/api/v1/admin/algorithm/constraint/major/import` | POST |

> 所有查询条件为精确匹配，非模糊搜索。
> 新增时传专业名称和约束名称，系统自动查找对应代码。
> API 无修改接口，故无修改功能。

### 3. 安全系数页

**路径**: `views/algorithm/constraint/safety-level/index.vue`

#### 工具栏
- `+ 新增等级` (primary button)
- `批量删除` (danger button)
- `刷新` (default button)

#### 表格列
| 列 | 说明 |
|----|------|
| level | 等级编号 |
| code | 代码 |
| name | 名称 |
| nameShort | 简称 |
| minCoefficient~maxCoefficient | 系数范围（展示为 "0.00 ~ 0.30"） |
| confidence | 置信度（HIGH/MEDIUM/LOW），用 el-tag 展示 |
| 操作 | 详情、修改、删除 |

#### 弹窗
- **详情**: 展示全部字段含 color, confidence, confidenceReason, description
- **新增/修改**: 表单 level, code, name, nameShort, minCoefficient, maxCoefficient, color(el-color-picker), confidence(select), confidenceReason, description

#### 接口
| 操作 | API | 方法 |
|------|-----|------|
| 分页列表 | `/api/v1/admin/algorithm/constraint/safety-level/page` | GET |
| 详情 | `/api/v1/admin/algorithm/constraint/safety-level/{level}` | GET |
| 新增 | `/api/v1/admin/algorithm/constraint/safety-level` | POST |
| 修改 | `/api/v1/admin/algorithm/constraint/safety-level/{level}` | PUT |
| 删除 | `/api/v1/admin/algorithm/constraint/safety-level/{level}` | DELETE |
| 批量删除 | `/api/v1/admin/algorithm/constraint/safety-level/batch-delete` | POST |

> 列表接口无查询条件，不加搜索栏。
> 无状态字段和排序字段，无切换启用状态功能。

## 新建文件清单

```
apps/admin/src/
├── api/
│   └── algorithm/
│       └── constraint.ts              ← 三个子模块的API
├── router/
│   └── modules/
│       └── algorithm.ts               ← 修改，新增路由
├── types/
│   └── algorithm/
│       ├── constraint-dict.ts         ← 约束字典类型
│       ├── constraint-major.ts        ← 专业约束关联类型
│       └── safety-level.ts            ← 安全系数类型
└── views/
    └── algorithm/
        └── constraint/
            ├── dict/
            │   └── index.vue          ← 约束字典页
            ├── major/
            │   └── index.vue          ← 专业约束关联页
            └── safety-level/
                └── index.vue          ← 安全系数页
```

## 设计约束

- 遵循 Element Plus + TailwindCSS 现有模式
- 页面背景色 `#f0f2f5`，内容区白色圆角卡片
- 所有删除操作均为软删除，提示语注明可恢复
- 报错信息通过 ElMessage.error 展示后端返回的 msg
- 遵循 AGENTS.md 的权限规则，通过 meta.moduleCode 控制访问
