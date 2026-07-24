# 专业管理模块设计文档

**日期：** 2026-07-18
**模块：** major（专业管理）
**子模块：** 专业列表、考研专业、考研专业-大学关联

---

## 1. 概述

专业管理模块包含三个子模块，对应后端三个 Controller，共 31 个接口。采用与首页模块一致的布局风格：白色卡片搜索栏 + 白色表格区域，Element Plus 组件，el-tag 友好展示状态。

## 2. 页面结构

### 2.1 路由结构

```
/major                      # 专业管理（父模块）
├── /major/list             # 专业列表（默认跳转）
├── /major/postgrad         # 考研专业
└── /major/postgrad-univ    # 考研专业-大学关联
```

### 2.2 通用布局

每个页面采用上中结构：
- **上方**：全局导航栏（Navbar，含个人中心和退出登录）
- **左侧**：侧边栏（Sidebar，三级树形菜单）
- **中间内容区**：
  - 搜索栏（白色卡片，圆角，p-5）
  - 操作栏（新增/导入/批量操作按钮）
  - 表格区域（白色卡片，圆角，p-5，含分页）
  - Dialog（新增/修改/详情）

## 3. 页面设计

### 3.1 专业列表页（/major/list）

**搜索条件：** 专业代码、专业名称（模糊）、专业类型（下拉：本科/专科）、状态（下拉：全部/启用/禁用）

**操作栏：**
- 左：新增专业 | 导入专业主表 | 导入专业详情
- 右：批量软删除 | 批量硬删除（选中行后激活）

**表格列：**
| ID | 专业代码 | 专业名称 | 学科门类 | 专业类型 | 状态 | 创建时间 | 操作 |

**状态展示：** `启用 → el-tag type="success"` / `禁用 → el-tag type="info"`

**操作列按钮：**
- 详情、修改、启用/禁用（toggle）、恢复（status=0时显示）、软删除、硬删除

**批量操作：**
- 批量软删除：确认提示"确定批量软删除选中的 N 条记录吗？软删除后可恢复"
- 批量硬删除：确认提示"确定批量硬删除选中的 N 条记录吗？此操作不可恢复！"（红色警告）

**新增 Dialog：** majorCode、majorName、majorType、disciplineName、majorCategory
**修改 Dialog：** 同新增字段 + 更多可选字段
**详情 Dialog：** el-descriptions 展示全部字段（含详情表 majorDescription、trainingObjective 等）

**导入按钮：**
- "导入专业主表" → POST /import（xlsx1模板）
- "导入专业详情" → POST /import-detail（xlsx2模板）
  导入后展示结果：共 N 条，成功 N 条，失败 N 条；失败时展示错误明细

### 3.2 考研专业页（/major/postgrad）

**搜索条件：** 专业名称（模糊）、学位类型（下拉：学术学位/专业学位）、热门程度（下拉：全部/热门/一般/冷门）、状态

**操作栏：**
- 左：新增考研专业 | 导入考研专业
- 右：批量软删除 | 批量硬删除

**表格列：**
| ID | 专业名称 | 专业代码 | 学位类型 | 学科门类 | 热门程度 | 难度等级 | 状态 | 创建时间 | 操作 |

**操作列按钮：** 详情、修改、启用/禁用、恢复、软删除、硬删除（同专业列表）

**新增/修改 Dialog：** majorName、majorCode、degreeType、disciplineCategory、popularity、difficulty、brief、examSubjects 等
**详情 Dialog：** el-descriptions 展示全部字段

### 3.3 考研专业-大学关联页（/major/postgrad-univ）

> 此模块无新增/修改/修改状态接口，仅支持删除、导入、恢复。

**搜索条件：** 大学名称（模糊）、考研专业名称（模糊）

**操作栏：**
- 左：导入关联数据
- 右：批量软删除 | 批量硬删除

**表格列：**
| ID | 大学名称 | 考研专业名称 | 排序权重 | 状态 | 创建时间 | 操作 |

**操作列按钮：** 恢复（status=0时）、软删除、硬删除

**导入：** POST /import（xlsx4模板：大学名称、考研专业代码、排序权重）

## 4. 后端接口对照

### 4.1 MajorController (/api/v1/admin/major)

| 操作 | 方法 | 路径 |
|------|------|------|
| 分页查询 | GET | /list |
| 获取详情 | GET | /{id} |
| 新增 | POST | / |
| 修改基础信息 | PUT | /{id} |
| 修改详情信息 | PUT | /{id}/detail |
| 修改状态 | PUT | /{id}/status |
| 软删除 | DELETE | /{id} |
| 硬删除 | DELETE | /{id}/hard |
| 批量软删除 | POST | /batch-soft-delete |
| 批量硬删除 | POST | /batch-hard-delete |
| 导入主表 | POST | /import |
| 导入详情 | POST | /import-detail |
| 恢复 | PUT | /{id}/restore |

### 4.2 PostgradMajorController (/api/v1/admin/postgrad-major)

| 操作 | 方法 | 路径 |
|------|------|------|
| 分页查询 | GET | /list |
| 获取详情 | GET | /{id} |
| 新增 | POST | / |
| 修改 | PUT | /{id} |
| 修改状态 | PUT | /{id}/status |
| 软删除 | DELETE | /{id} |
| 硬删除 | DELETE | /{id}/hard |
| 批量软删除 | POST | /batch-soft-delete |
| 批量硬删除 | POST | /batch-hard-delete |
| 导入 | POST | /import |
| 恢复 | PUT | /{id}/restore |

### 4.3 PostgradMajorUniversityController (/api/v1/admin/postgrad-major-university)

| 操作 | 方法 | 路径 |
|------|------|------|
| 分页查询 | GET | /list |
| 软删除 | DELETE | /{id} |
| 硬删除 | DELETE | /{id}/hard |
| 批量软删除 | POST | /batch-soft-delete |
| 批量硬删除 | POST | /batch-hard-delete |
| 导入 | POST | /import |
| 恢复 | PUT | /{id}/restore |

## 5. 公共规范

- **状态值：** 1=启用，0=禁用/软删除
- **分页参数：** page、size（选项：10/20/30/50/100）
- **错误提示：** 通过 ElMessage 展示，导入错误 ElMessage.error 展示 msg
- **操作确认：** 所有删除/禁用操作均通过 ElMessageBox.confirm 确认
