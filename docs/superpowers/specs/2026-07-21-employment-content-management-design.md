# 招聘内容管理模块 - 前端设计文档

## 概述

招聘内容管理模块提供统一备考指南和统一公告的 CRUD 管理功能，属于就业管理下的二级模块。

## 导航层级

```
就业管理 (/employment)
  └── 招聘内容管理 (/employment/content)    ← level=2（中间层，无 component，仅 redirect）
        ├── 统一备考指南 (/employment/content/guide)   ← level=3
        └── 统一公告 (/employment/content/notice)       ← level=3
```

### 路由配置

| 路径 | Name | Title | moduleCode | component |
|------|------|-------|-----------|-----------|
| `/employment/content` | EmploymentContent | 招聘内容管理 | - | - (redirect) |
| `/employment/content/guide` | EmpContentGuide | 统一备考指南 | `emp_content_guide` | `@/views/employment/content/guide/index.vue` |
| `/employment/content/notice` | EmpContentNotice | 统一公告 | `emp_content_notice` | `@/views/employment/content/notice/index.vue` |

## 页面设计

两个页面均采用标准 CRUD 布局（参考 `home/announcement`）：

```
┌─ 白色卡片: 搜索栏 (el-form inline) ──────────────────┐
│ [查询字段1] [查询字段2] [查询字段3]                     │
│ [查询] [重置]                                         │
├─ 操作栏 ──────────────────────────────────────────────┤
│ [刷新]                                                 │
├─ 白色卡片: 表格 (el-table stripe) ────────────────────┤
│ ID | 标题 | 类别 | 类型 | 置顶 | ... | 操作           │
│ ───────────────────────────────────────────────────── │
│ [分页: total, sizes, prev, pager, next]               │
└───────────────────────────────────────────────────────┘
```

### 统一备考指南页

**搜索字段**：
- 标题 (`el-input`，模糊搜索)
- 指南类别 (`el-select`，精确匹配，选项来自 DB 约束)
- 指南类型 (`el-select`，精确匹配，选项来自 DB 约束)
- 是否置顶 (`el-select`，全部/是/否)

**表格列** (按 API 文档字段，除去 `sortOrder`)：
| 列 | 说明 | 宽度 |
|----|------|------|
| ID | 数字 ID | 140px |
| 标题 | title，溢出省略 | min-width 200px |
| 副标题 | subtitle，溢出省略 | min-width 160px |
| 指南类别 | `guideCategory` → 中文映射 | 120px |
| 指南类型 | `guideType` | 120px |
| 置顶 | `isTop` → el-tag | 80px |
| 推荐 | `isRecommended` → el-tag | 80px |
| 阅读数 | `viewCount` | 80px |
| 点赞数 | `likeCount` | 80px |
| 操作 | 详情/修改/禁用/硬删除 | 280px |

**操作按钮**：
- 详情（`el-button link type=primary`）
- 修改（`el-button link type=warning`）
- 禁用（`el-button link type=info`）→ 调用 PATCH `/status` `{status: 0}`，记录从列表消失
- 硬删除（`el-button link type=danger`）→ 确认后调用 DELETE `/{id}/delete`

**Dialog**（宽度 800px）：
- 详情模式：`el-descriptions` 展示全部字段（含 content HTML 预览、作者信息、标签等）
- 修改模式：`el-form` 编辑字段（标题、副标题、指南类别、指南类型、封面图、图标类、摘要、内容 textarea、难度、目标读者、作者、置顶、推荐、排序）

### 统一公告页

**搜索字段**：
- 标题 (`el-input`，模糊搜索)
- 公告类别 (`el-select`，精确匹配)
- 公告类型 (`el-select`，精确匹配)
- 省份 (`el-input`)
- 城市 (`el-input`)
- 年份 (`el-select`)
- 是否置顶 (`el-select`，全部/是/否)
- 是否重要 (`el-select`，全部/是/否)

**表格列** (按 API 文档字段，除去 `sortOrder`)：
| 列 | 说明 | 宽度 |
|----|------|------|
| ID | 数字 ID | 140px |
| 标题 | title，溢出省略 | min-width 200px |
| 公告类别 | `noticeCategory` → 中文映射 | 120px |
| 公告类型 | `noticeType` | 120px |
| 省份 | `province` | 120px |
| 城市 | `city` | 120px |
| 年份 | `year` | 80px |
| 置顶 | `isTop` → el-tag | 80px |
| 重要 | `isImportant` → el-tag | 80px |
| 阅读数 | `viewCount` | 80px |
| 操作 | 详情/修改/禁用/硬删除 | 280px |

**Dialog**（宽度 800px）：
- 详情模式：展示全部字段（含报名时间、考试时间、招录人数、原文链接等）
- 修改模式：编辑全部字段（含日期选择器 for 报名/考试时间、数字输入 for 招录人数）

## 按钮规范

| 按钮文字 | 行为 | 确认弹窗 |
|---------|------|---------|
| 禁用 | PATCH /status {status:0}，设置 isDeleted=true | "确定禁用它？禁用后将从列表隐藏" |
| 硬删除 | DELETE /{id}/delete | "确定永久删除？不可恢复！" type=warning |
| 批量硬删除 | POST /batch-delete（选中多条后出现） | "确定永久删除选中的 N 条记录？" |

注意：目前后台"删除"和"禁用"均实现为软删除（设置 isDeleted=true），后续由后端区分硬删除实现。

## 枚举映射

### 指南类别 (guideCategory)

```
civil → 公务员, institution → 事业编, military → 部队文职,
selection → 选调生, teacher → 教师, healthcare → 医疗卫生,
finance → 银行金融, grassroots → 基层服务, community → 社区工作,
general → 通用
```

### 指南类型 (guideType)

```
备考攻略, 科目指导, 真题解析, 面试技巧, 时事热点, 经验分享, 政策解读, 学习计划
```

### 公告类别 (noticeCategory)

```
civil → 公务员, institution → 事业编, military → 部队文职,
selection → 选调生, teacher → 教师, healthcare → 医疗卫生,
finance → 银行金融, grassroots → 基层服务, community → 社区工作,
public_welfare → 公益性岗位, enterprise → 企业, general → 通用
```

### 公告类型 (noticeType)

```
招聘公告, 招录公告, 补录公告, 调剂公告, 成绩公示,
面试通知, 体检通知, 录用公示, 报名指南, 考试大纲, 政策解读
```

## 样式约定

- 背景色：`bg-gray-50`（与首页模块一致）
- 卡片：白色背景 `bg-white`，圆角 `rounded-lg`，内边距 `p-5`
- 表格：`el-table` + `stripe` + `v-loading`
- 分页：`el-pagination`，可选 `[10, 20, 30, 50, 100]`
- 对话框：`el-dialog`，宽度 `800px`，`close-on-click-modal=false`

## 文件清单

```
apps/admin/src/
├── types/employment/
│   ├── guide.ts              # ExamGuide 类型定义
│   └── notice.ts             # Notice 类型定义
├── api/employment/
│   ├── guide.ts              # ExamGuide API 调用
│   └── notice.ts             # Notice API 调用
├── views/employment/
│   ├── content/
│   │   ├── guide/index.vue   # 统一备考指南页面
│   │   └── notice/index.vue  # 统一公告页面
└── router/modules/
    └── employment.ts         # 添加招聘内容管理路由（已存在，修改此文件）
```

## 权限

- 备考指南页：`moduleCode: 'emp_content_guide'`
- 公告页：`moduleCode: 'emp_content_notice'`
