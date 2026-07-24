# 院校次表模块管理页 — 设计文档

## 概述

为管理后台新增 3 个院校次表管理页面：院系管理、实验室管理、学科评估管理。保留已有的校园图册页面不变。

## 模块与权限标识

| 页面 | 路由 path | moduleCode | 后端基础路径 |
|------|-----------|------------|-------------|
| 校园图册（已有） | `/university/album` | `university_album` | `/api/v1/admin/university/gallery` |
| 院系管理 | `/university/dept` | `university_dept` | `/api/v1/admin/university/department` |
| 实验室管理 | `/university/laboratory` | `university_lab` | `/api/v1/admin/university/laboratory` |
| 学科评估管理 | `/university/subject-evaluation` | `university_eval` | `/api/v1/admin/university/subject-evaluation` |

## 统一页面布局

所有页面遵循同一模板（与现有校园图册/首页公告一致）：

```
┌─ 搜索栏（白底圆角）──────────────────────────┐
│  [院校名称] [模块特定字段] [状态]  [查询] [重置] │
└──────────────────────────────────────────────┘
┌─ 操作栏 ─────────────────────────────────────┐
│  [新增xxx] [导入Excel] [批量下架] [批量永久删除] [刷新] │
└──────────────────────────────────────────────┘
┌─ 表格（白底，带多选 checkbox）───────────────┐
│  ☐  ID  院校名称  模块字段1  模块字段2  状态  创建时间  操作 │
│  ☐  ...                                                          │
├─ 分页 ───────────────────────────────────────┤
│  共 N 条  10/页  ◀ 1 2 3 ▶                                     │
└──────────────────────────────────────────────┘
```

### 状态列
- 展示 → `el-tag type="success"`
- 下架 → `el-tag type="info"`
- 排序字段（sortOrder）不在表格中展示

### 操作列（每行）
`详情 | 修改 | 禁用/启用 | 下架 | 永久删除`

- 软删除按钮文字为"下架"，硬删除为"永久删除"
- 批量操作对应："批量下架"、"批量永久删除"

### 分页
- 默认 size=10，可选 [10, 20, 30, 50, 100]
- 院系和实验室额外支持 [200, 500, 1000]

### 弹窗模式
- **详情**：el-descriptions 只读展示
- **新增/修改**：el-form 表单（修改时回填数据）

---

## 1. 院系管理页

### 搜索字段
| 参数 | 类型 | 操作 |
|------|------|------|
| 院校名称 | input | 模糊搜索 |
| 院系名称 | input | 模糊搜索 |
| 院系类型 | select | 精确匹配，选项：工学院/理学院/文学院/商学院/法学院/医学院/艺术学院/农学院/教育学院 |
| 状态 | select | 全部/展示/下架 |

### 表格列
`ID | 院校名称 | 院系名称 | 院系类型 | 标签(el-tag列表) | 状态 | 创建时间 | 操作`

### 新增/修改表单字段
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校 | el-select（可搜索，加载全部院校） | Y |
| 院系名称 | el-input | Y |
| 院系类型 | el-select（枚举选项） | Y |
| 页面主标题 | el-input | |
| 院系标签 | el-select multiple + allow-create | |
| 排序 | el-input-number | |

### 详情弹窗
- 主表字段：el-descriptions 展示
- 报告数据：展开为 el-collapse 折叠面板，展示 JSONB 中的各区块
  - 副标题、城市薪资、考研方向、免责声明、就业前景、就业趋势、概述、职业路径、专业详情、专业薪资、学科组成
- **不提供报告编辑功能**（低频需求，高频场景走导入）

---

## 2. 实验室管理页

### 搜索字段
| 参数 | 类型 | 操作 |
|------|------|------|
| 院校名称 | input | 模糊搜索 |
| 实验室名称 | input | 模糊搜索 |
| 实验室类型 | select | 精确匹配：国家重点实验室/教育部重点实验室/省级重点实验室/国家工程实验室/国家工程研究中心 |
| 所在地区 | input | 精确匹配 |
| 主管部门 | input | 精确匹配 |
| 状态 | select | 全部/展示/下架 |

### 表格列
`ID | 院校名称 | 实验室名称 | 实验室类型 | 所在地区 | 主管部门 | 主任 | 状态 | 创建时间 | 操作`

### 新增/修改表单（分两个 tab）

**Tab1 - 基础信息**
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校 | el-select（可搜索） | Y |
| 实验室名称 | el-input | Y |
| 实验室类型 | el-select | Y |
| 成立时间 | el-input（日期文本） | |
| 所在地区 | el-input | |
| 主管部门 | el-input | |
| 实验室主任 | el-input | |
| 排序 | el-input-number | |

**Tab2 - 详细信息**
| 字段 | 组件 |
|------|------|
| 人员规模 | el-input-number |
| 学生规模 | el-input-number |
| 联系邮箱 | el-input |
| 联系电话 | el-input |
| 实验室简介 | el-input textarea |
| 研究方向描述 | el-input textarea |
| 实验室空间 | el-input |
| 开放课题 | el-input textarea |
| 合作交流 | el-input textarea |
| 访问学者 | el-input textarea |
| 研究领域 | el-select multiple（标签输入） |
| 主要设备 | el-select multiple（标签输入） |
| 核心团队 | el-table 内嵌编辑（成员姓名/职务/岗位名称） |
| 统计数据 | el-table 内嵌编辑（统计标签/数量） |

### 详情弹窗
- 基础信息：el-descriptions
- 核心团队：嵌入 el-table 显示
- 统计数据：嵌入 el-table 显示

---

## 3. 学科评估管理页

### 搜索字段
| 参数 | 类型 | 操作 |
|------|------|------|
| 院校名称 | input | 模糊搜索 |
| 学科代码 | input | 精确匹配 |
| 学科名称 | input | 模糊搜索 |
| 评估轮次 | input | 精确匹配 |
| 评估等级 | select | 精确匹配：A+/A/A-/B+/B/B-/C+/C/C- |
| 状态 | select | 全部/展示/下架 |

### 表格列
`ID | 院校名称 | 学科代码 | 学科名称 | 评估轮次 | 评估等级(el-tag) | 状态 | 创建时间 | 操作`

评估等级用颜色区分：A+/A/A- 用 success，B+/B/B- 用 warning，C+/C/C- 用 info

### 新增/修改表单字段
| 字段 | 组件 | 必填 |
|------|------|------|
| 院校 | el-select（可搜索） | Y |
| 学科代码 | el-input | Y |
| 学科名称 | el-input | Y |
| 评估轮次 | el-input | Y |
| 评估等级 | el-select（A+/A/A-/B+/B/B-/C+/C/C-） | Y |
| 排序 | el-input-number | |

### 详情弹窗
- 全部字段：el-descriptions 展示

---

## 需要创建的文件清单

### 类型定义
- `apps/admin/src/types/university/department.ts`
- `apps/admin/src/types/university/laboratory.ts`
- `apps/admin/src/types/university/subject-evaluation.ts`

### API 接口
- `apps/admin/src/api/university/department.ts`
- `apps/admin/src/api/university/laboratory.ts`
- `apps/admin/src/api/university/subject-evaluation.ts`

### 页面视图
- `apps/admin/src/views/university/dept/index.vue`
- `apps/admin/src/views/university/laboratory/index.vue`
- `apps/admin/src/views/university/subject-evaluation/index.vue`

### 路由修改
- `apps/admin/src/router/modules/university.ts` — 追加 3 条子路由

---

## 错误处理

所有操作统一使用：
- 成功：`ElMessage.success()`
- 失败：`ElMessage.error(res.data.msg || '操作失败')`
- 确认弹窗：`ElMessageBox.confirm()`
- 后端返回 400 乐观锁冲突："数据已被其他人修改，请刷新后重试"
- 导入错误信息显示后端返回的详细错误（最多 50 条）

## 非功能性需求

- 页面背景色：`#f0f2f5`（与现有页面一致）
- 搜索栏/表格：白底圆角 `rounded-lg bg-white p-5`
- 弹窗宽度：详情 600px，新增/修改 700-800px
- 遵循现有代码模式：Composition API + `<script setup>` + Element Plus
