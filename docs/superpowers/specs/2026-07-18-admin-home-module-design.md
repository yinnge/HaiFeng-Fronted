# 管理端 - 首页管理模块设计文档

## 概述

首页管理模块为管理员提供公告、规划师、培训机构的增删改查功能，用于管理首页展示内容。三个子模块的 CRUD 模式高度一致，通过复用通用组件减少重复代码。

## 路由设计

| 路径 | 组件 | 模块编码 | 说明 |
|------|------|----------|------|
| `/home` | - | - | 重定向到 `/home/announcement` |
| `/home/announcement` | `views/home/announcement/index.vue` | `home_announcement` | 公告管理 |
| `/home/planner` | `views/home/planner/index.vue` | `home_planner` | 规划师管理 |
| `/home/institution` | `views/home/institution/index.vue` | `home_institution` | 培训机构管理 |

### 模块关系（对应 AGENTS.md 的模块树）

```
首页管理 (home)              ← 顶级父模块 (level=1)
├── 公告管理 (announcement)  ← 二级子模块 (level=2, moduleCode: home_announcement)
├── 规划师管理 (planner)     ← 二级子模块 (level=2, moduleCode: home_planner)
└── 培训机构管理 (institution) ← 二级子模块 (level=2, moduleCode: home_institution)
```

## 页面通用结构

三个页面共用同一套布局结构：

```
┌─ 搜索栏 ─────────────────────────────────┐
│  标题/名称搜索 + 状态下拉 + 查询/重置     │
├─ 操作栏 ─────────────────────────────────┤
│  新增 + 刷新                              │
├─ 数据表格 ───────────────────────────────┤
│  (多列 + 状态标签 + 操作按钮列)          │
├─ 分页器 ────────────────────────────────┤
└─ Dialog ────────────────────────────────┘
  新增/修改/详情共用同一个 Dialog
```

### 表格操作按钮

| 按钮 | 行为 | 确认 |
|------|------|------|
| 详情 | 打开只读 Dialog | 无 |
| 修改 | 打开可编辑 Dialog（回填数据） | 无 |
| 禁用/启用 | 状态切换 | 确认框 |
| 删除 | 硬删除 | 确认框（提示不可恢复） |

### 响应式反馈

- 所有接口返回非 200 时，使用 `ElMessage.error` 展示后端 `msg`
- 删除/状态切换等危险操作前用 `ElMessageBox.confirm` 二次确认

## 页面字段设计

### 1. 公告管理

**表格列：** ID | 标题 | 标签 | 状态 | 更新时间 | 操作

**Dialog 字段：**
| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| title | String | 必填 | 只读 | 标题（最长100字符） |
| tag | String | 选填 | 只读 | 标签（最长20字符） |
| content | String (富文本) | 必填 | 只读 | 公告内容 |
| status | Short | - | 只读 | 0-下架 1-展示 |

### 2. 规划师管理

**表格列：** ID | 姓名 | 职位 | 地区 | 专长 | 状态 | 操作

**Dialog 字段：**
| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| name | String | 必填 | 只读 | 姓名（最长50字符） |
| position | String | 选填 | 只读 | 职位（最长50字符） |
| region | String | 选填 | 只读 | 地区（最长20字符） |
| avatar | String (URL) | 选填 | 只读 | 头像URL（最长100字符） |
| specialty | String | 选填 | 只读 | 专长（最长100字符） |
| douyinName | String | 选填 | 只读 | 抖音名称 |
| douyinUrl | String | 选填 | 只读 | 抖音链接 |
| personalDescription | String | 选填 | 只读 | 个人简介 |
| experienceJob | String | 选填 | 只读 | 工作经历 |
| achievements | String[] | 选填 | 只读 | 成就列表（动态增减） |
| expertiseAreas | String[] | 选填 | 只读 | 擅长领域（动态增减） |
| sortOrder | Integer | 选填 | 只读 | 排序值（默认0） |
| status | Short | - | 只读 | 0-下架 1-展示 |

### 3. 培训机构管理

**表格列：** ID | 名称 | 类型 | 电话 | 状态 | 操作

**Dialog 字段：**
| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| name | String | 必填 | 只读 | 机构名称（最长100字符） |
| type | String | 必填 | 只读 | 机构类型（最长100字符） |
| phone | String | 选填 | 只读 | 联系电话（最长20字符） |
| address | String | 选填 | 只读 | 地址（最长100字符） |
| description | String | 选填 | 只读 | 机构简介 |
| courses | String[] | 选填 | 只读 | 课程列表（动态增减） |
| images | String[] | 选填 | 只读 | 机构图片URL列表（动态增减） |
| logo | String (URL) | 选填 | 只读 | Logo URL（最长200字符） |
| sortOrder | Integer | 选填 | 只读 | 排序值（默认0） |
| status | Short | - | 只读 | 0-下架 1-展示 |

## API 接口

全部基于现有后端接口，路由前缀 `/api/v1/admin/home/`。

### 公告 (announcement)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/announcement/list` | 分页查询（title, status, page, size） |
| GET | `/announcement/{id}` | 详情 |
| POST | `/announcement` | 新增 |
| PUT | `/announcement/{id}` | 修改 |
| PUT | `/announcement/{id}/status` | 修改状态（status: 0/1） |
| DELETE | `/announcement/{id}` | 硬删除 |

### 规划师 (planner)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/planner/list` | 分页查询（name, status, page, size） |
| GET | `/planner/{id}` | 详情 |
| POST | `/planner` | 新增 |
| PUT | `/planner/{id}` | 修改 |
| PUT | `/planner/{id}/status` | 修改状态 |
| DELETE | `/planner/{id}` | 硬删除 |

### 培训机构 (institution)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/institution/list` | 分页查询（name, type, status, page, size） |
| GET | `/institution/{id}` | 详情 |
| POST | `/institution` | 新增 |
| PUT | `/institution/{id}` | 修改 |
| PUT | `/institution/{id}/status` | 修改状态 |
| DELETE | `/institution/{id}` | 硬删除 |

## 文件清单

### 新建文件

```
apps/admin/src/api/home/
  announcement.ts       ← 公告 API
  planner.ts            ← 规划师 API
  institution.ts        ← 培训机构 API

apps/admin/src/types/home/
  announcement.ts       ← 公告 VO/DTO 类型
  planner.ts            ← 规划师 VO/DTO 类型
  institution.ts        ← 培训机构 VO/DTO 类型

apps/admin/src/views/home/
  announcement/index.vue   ← 公告管理页
  planner/index.vue        ← 规划师管理页
  institution/index.vue    ← 培训机构管理页

apps/admin/src/router/modules/home.ts  ← 首页管理路由
```

### 修改文件

```
apps/admin/src/router/index.ts         ← 引入 home 路由
apps/admin/src/layout/components/Sidebar.vue  ← 改造支持三级菜单
```

## 侧边栏改造

当前 `Sidebar.vue` 只支持两级菜单（`el-sub-menu` → `el-menu-item`）。需要改造为：
- 一级：`el-sub-menu`（顶级父模块，如"首页管理"）
- 二级：`el-menu-item`（子模块，如"公告管理"），可点击跳转

改造思路：遍历 `asyncRoutes`，对于每个顶级路由，递归渲染其子路由。当子路由还有子路由时用 `el-sub-menu`，否则用 `el-menu-item`。

对于 `home` 路由，其结构为：
```
/home (el-sub-menu, title="首页管理")
  ├── /home/announcement (el-menu-item, title="公告管理")
  ├── /home/planner (el-menu-item, title="规划师管理")
  └── /home/institution (el-menu-item, title="培训机构管理")
```
