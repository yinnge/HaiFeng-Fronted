# 管理端 - 特殊通道模块设计文档

## 概述

特殊通道模块为管理员提供特殊招生通道、通道-大学关联、强基计划数据、强基院校配置的增删改查功能。四个子模块共享同一套 CRUD 页面模式。

## 路由设计

| 路径 | 组件 | 模块编码 | 说明 |
|------|------|----------|------|
| `/special` | - | - | 重定向到 `/special/admission` |
| `/special/admission` | `views/special/admission/index.vue` | `special_admission` | 特殊招生通道列表 |
| `/special/adm-univ` | `views/special/adm-univ/index.vue` | `special_adm_univ` | 通道-大学关联 |
| `/special/sbs-score` | `views/special/sbs-score/index.vue` | `special_sbs_score` | 强基计划数据 |
| `/special/sbs-config` | `views/special/sbs-config/index.vue` | `special_sbs_config` | 强基院校配置 |

### 模块关系（对应 AGENTS.md 的模块树）

```
特殊通道 (special)                 ← 顶级父模块 (level=1)
├── 招生通道管理 (admission)       ← 二级子模块 (moduleCode: special_admission)
├── 通道院校关联管理 (adm-univ)    ← 二级子模块 (moduleCode: special_adm_univ)
├── 强基计划分数管理 (sbs-score)   ← 二级子模块 (moduleCode: special_sbs_score)
└── 强基院校配置 (sbs-config)      ← 二级子模块 (moduleCode: special_sbs_config)
```

## 页面通用结构

四个页面共用同一套布局结构：

```
┌─ 搜索栏 ─────────────────────────────────┐
│  查询字段 + 查询/重置                     │
├─ 操作栏 ─────────────────────────────────┤
│  新增 + 批量删除                          │
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
| 启用/禁用 | 状态切换 | 确认框 |
| 删除 | 硬删除 | 确认框（提示"确定删除该记录？此操作不可恢复"） |
| 批量删除 | 批量硬删除（最多100条） | 确认框（提示选中数量 + "此操作不可恢复"） |

### 表格字段规则

- 列表不展示 `sortOrder`（排序）字段
- `isActive`（状态）展示为 `<el-tag>`：`true`=绿色"启用"，`false`=灰色"禁用"
- ID 字段不展示（雪花算法ID对管理员无意义）
- 选中列 + 批量删除按钮在表格左上角

### 响应式反馈

- 所有接口返回非 200 时，使用 `ElMessage.error` 展示后端 `msg`
- 删除/状态切换等危险操作前用 `ElMessageBox.confirm` 二次确认
- 操作成功后调用 `ElMessage.success` 提示，并刷新列表

---

## 1. 特殊招生通道

### 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| displayType | 精确查询 | 下拉选择：全部 / 院校列表 / 文章 / 专业数据 / 分组 |
| channelName | 模糊查询 | 文本输入框，placeholder："输入通道名称" |

### 表格列

通道代码 | 通道名称 | 展示类型 | 状态 | 操作

**展示类型映射：**
- `UNIVERSITY_LIST` → "院校列表"
- `ARTICLE_ONLY` → "仅文章"
- `MAJOR_DATA` → "专业数据"
- `GROUP` → "分组节点"

### Dialog 字段

| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| channelCode | String | 必填，最长30 | 只读 | 通道代码（唯一） |
| channelName | String | 必填，最长50 | 只读 | 通道名称 |
| subtitle | String | 选填，最长200 | 只读 | 副标题 |
| parentCode | String | 选填，最长30 | 只读 | 父级通道代码 |
| filterLabel | String | 选填，最长30 | 只读 | 筛选按钮文字 |
| displayType | String | 必填，下拉选择 | 只读 | 展示类型（4选1） |
| content | String (富文本) | 选填 | 只读 | 富文本内容 |
| sortOrder | Integer | 选填 | 只读 | 排序值 |

---

## 2. 通道-大学关联

### 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| channelName | 前端过滤 | 文本输入框，placeholder："输入通道名称" |
| universityName | 前端过滤 | 文本输入框，placeholder："输入大学名称" |
| year | 前端过滤 | 数字输入框，placeholder："输入年份" |

> 后端分页接口无查询条件，前端从列表数据中过滤匹配

### 表格列

通道名称 | 大学名称 | 年份 | 地区标签 | 状态 | 操作

### Dialog 字段

| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| channelCode | String | 必填，最长30 | 只读 | 通道代码 |
| channelName | String | 必填，最长50 | 只读 | 通道名称（冗余） |
| universityId | Number | 必填 | 只读 | 大学ID |
| universityName | String | 必填，最长50 | 只读 | 大学名称（冗余） |
| year | Number | 选填 | 只读 | 招生年份 |
| regionTag | String | 选填，最长20 | 只读 | 地区标签（香港/澳门） |
| signupStart | String (日期) | 选填 | 只读 | 报名开始时间 |
| signupEnd | String (日期) | 选填 | 只读 | 报名截止时间 |
| officialUrl | String | 选填，最长500 | 只读 | 报名官网URL |
| brochureTitle | String | 选填，最长200 | 只读 | 招生简章标题 |
| brochureContent | String (富文本) | 选填 | 只读 | 招生简章正文 |
| sortOrder | Integer | 选填 | 只读 | 排序值 |

---

## 3. 强基计划数据

### 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| universityName | 模糊查询 | 文本输入框，placeholder："输入大学名称" |
| year | 精确查询 | 数字输入框，placeholder："输入年份" |
| province | 精确查询 | 文本输入框，placeholder："输入省份" |
| subjectType | 精确查询 | 下拉选择：全部 / 物理类 / 历史类 / 理科 / 文科 / 综合改革 |

### 表格列

大学名称 | 年份 | 省份 | 科类 | 专业名称 | 状态 | 操作

### Dialog 字段

| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| universityId | Number | 必填 | 只读 | 大学ID |
| universityName | String | 必填，最长50 | 只读 | 大学名称 |
| year | Number | 必填 | 只读 | 年份 |
| province | String | 必填，最长20 | 只读 | 省份 |
| subjectType | String | 必填，最长20 | 只读 | 科类（下拉选择） |
| majorName | String | 必填，最长100 | 只读 | 专业名称 |
| majorCode | String | 选填，最长20 | 只读 | 专业代码 |
| entryScore | Number | 选填 | 只读 | 入围分数线 |
| entryScoreType | String | 选填，最长30 | 只读 | 入围分数类型（默认"高考成绩"） |
| entryFormula | String | 选填，最长500 | 只读 | 入围计算公式 |
| entryRatio | String | 选填，最长20 | 只读 | 入围比例（如1:3） |
| admissionScore | Number | 选填 | 只读 | 录取综合分 |
| admissionFormula | String | 选填，最长500 | 只读 | 录取公式 |
| planCount | Integer | 选填 | 只读 | 招生计划数 |
| admissionCount | Integer | 选填 | 只读 | 实际录取人数 |
| remark | String | 选填，最长500 | 只读 | 备注 |

---

## 4. 强基院校配置

### 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| universityName | 模糊查询 | 文本输入框，placeholder："输入大学名称" |
| isPilot | 精确查询 | 下拉选择：全部 / 是 / 否 |
| pilotYear | 精确查询 | 数字输入框，placeholder："输入年份" |
| testBeforeScore | 精确查询 | 下拉选择：全部 / 是 / 否 |

### 表格列

大学名称 | 是否试点校 | 首次试点年份 | 出分前校测 | 操作

**布尔字段展示：**
- `isPilot`：`true`=绿色"是"，`false`=灰色"否"
- `testBeforeScore`：`true`=橙色"是"，`false`=灰色"否"

### 操作按钮说明（⚠️ 无切换状态）

| 按钮 | 行为 | 确认 |
|------|------|------|
| 详情 | 打开只读 Dialog | 无 |
| 修改 | 打开可编辑 Dialog（回填数据） | 无 |
| 删除 | 硬删除 | 确认框（提示"此操作不可恢复"） |
| 批量删除 | 批量硬删除（最多100条） | 确认框 |

### Dialog 字段

| 字段 | 类型 | 新增/修改 | 详情 | 说明 |
|------|------|-----------|------|------|
| universityId | Number | 必填，唯一 | 只读 | 大学ID |
| universityName | String | 必填，最长50 | 只读 | 大学名称 |
| isPilot | Boolean | 选填，默认true | 只读 | 是否强基试点校 |
| pilotYear | Number | 选填 | 只读 | 首次试点年份 |
| officialUrl | String | 选填，最长500 | 只读 | 强基计划官方页面URL |
| signupUrl | String | 选填，最长500 | 只读 | 报名入口URL |
| testBeforeScore | Boolean | 选填，默认false | 只读 | 是否高考出分前校测 |
| defaultEntryRatio | String | 选填，最长20，默认"1:5" | 只读 | 默认入围比例 |
| defaultAdmissionFormula | String | 选填，最长500 | 只读 | 默认录取公式 |
| availableMajors | String[] | 选填 | 只读 | 可选专业列表（逗号分隔输入） |
| specialNotes | String (textarea) | 选填 | 只读 | 特殊说明 |

---

## 目录结构

```
apps/admin/src/
├── api/
│   └── special/
│       ├── channel.ts           # 特殊招生通道 API
│       ├── channel-univ.ts      # 通道-大学关联 API
│       ├── strong-base-score.ts # 强基计划数据 API
│       └── strong-base-univ.ts  # 强基院校配置 API
├── types/
│   └── special/
│       ├── channel.ts           # 特殊招生通道类型
│       ├── channel-univ.ts      # 通道-大学关联类型
│       ├── strong-base-score.ts # 强基计划数据类型
│       └── strong-base-univ.ts  # 强基院校配置类型
├── views/
│   └── special/
│       ├── admission/
│       │   └── index.vue        # 特殊招生通道页面
│       ├── adm-univ/
│       │   └── index.vue        # 通道-大学关联页面
│       ├── sbs-score/
│       │   └── index.vue        # 强基计划数据页面
│       └── sbs-config/
│           └── index.vue        # 强基院校配置页面
└── router/
    └── modules/
        └── special.ts           # 特殊通道路由模块
```

## 颜色与风格

- 背景：`bg-[#f5f7fa]`（与首页管理模块一致）
- 搜索栏容器：白色圆角卡片 `rounded-lg bg-white p-5`
- 表格：`el-table` stripe 条纹
- 状态标签：启用=`el-tag type="success"`，禁用=`el-tag type="info"`
- 按钮：新增=`el-button type="primary"`，批量删除=`el-button type="danger"`
