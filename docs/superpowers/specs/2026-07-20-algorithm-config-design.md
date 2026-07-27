# 算法配置管理模块 - 设计文档

## 概述

为「海枫未来规划院」管理后台新增算法配置管理模块的3个子页面，属于「高考算法」父模块下的平铺子页面。

## 导航结构

```
高考算法 (level 1, meta.title='高考算法', icon='TrendCharts')
  ├── 专业组列表 (已有)
  ├── 专业明细列表 (已有)
  ├── 省份改革配置 (新增, moduleCode: algo_score_prov)
  ├── 一分一段位次 (新增, moduleCode: algo_score_rank)
  └── 批次分数线 (新增, moduleCode: algo_score_baseline)
```

路由路径采用 `/algorithm/config/{子模块}` 格式，与后端 Controller 路径一致。

## 后端 API 端点

所有请求前缀：`/api/v1/admin/algorithm/config/`

### 1. 省份改革配置 (province-reform)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/page` | 分页（无查询条件） |
| GET | `/{id}` | 详情 |
| POST | `/` | 新增 |
| PUT | `/{id}` | 修改 |
| DELETE | `/{id}` | 软删除 |
| POST | `/batch-delete` | 批量软删除 |

**moduleCode**: `algo_score_prov`

### 2. 一分一段位次 (score-rank)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/page` | 分页（精确查询：province, year, subjectType, score, rank） |
| GET | `/{id}` | 详情 |
| POST | `/` | 新增 |
| PUT | `/{id}` | 修改 |
| DELETE | `/{id}` | 软删除 |
| POST | `/batch-delete` | 批量软删除 |
| POST | `/import` | Excel批量导入 |

**moduleCode**: `algo_score_rank`

### 3. 批次分数线 (batch-score-line)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/page` | 分页（精确查询：province, year, subjectType, batch, scoreLine） |
| GET | `/{id}` | 详情 |
| POST | `/` | 新增 |
| PUT | `/{id}` | 修改 |
| DELETE | `/{id}` | 软删除 |
| DELETE | `/{id}/hard` | 硬删除 |
| DELETE | `/batch` | 批量软删除 |
| DELETE | `/batch/hard` | 批量硬删除 |
| POST | `/import` | Excel批量导入 |

**moduleCode**: `algo_score_baseline`

## 页面设计

### 通用设计规则

- 使用 Element Plus 组件，背景色 #f0f2f5，内容区域白色卡片
- 分页选项：10, 20, 30, 50, 100
- 所有删除操作需 ElMessageBox.confirm 二次确认
- 所有错误/成功使用 ElMessage 提示
- Dialog 支持三种模式：详情(detail)、新增(add)、修改(edit)

### 页面1：省份改革配置

**特点**：无搜索栏（API 无查询条件），简单 CRUD

**操作按钮行**：`[新增] [批量软删除] [刷新]`

**表格列**：复选框 | 省份 | 改革年份 | 改革模式 | 操作(详情/修改/软删除)

**Dialog 详情**：el-descriptions 展示 province, reformYear, reformModel, createdAt

**Dialog 新增/修改**：省份(select,过滤可选31省), 改革年份(input-number,选填), 改革模式(select: 3+3/3+1+2/传统文理,选填)

### 页面2：一分一段位次

**特点**：5个精确查询条件 + Excel导入

**搜索栏**：省份(select), 年份(input-number), 科类(select: 物理类/历史类/文科/理科/不分文理), 分数(input-number), 位次(input-number)

**操作按钮行**：`[新增] [导入Excel] [批量软删除] [刷新]`

**表格列**：复选框 | 省份 | 年份 | 科类 | 分数 | 位次 | 操作(详情/修改/软删除)

**Dialog 详情**：额外展示 sameScoreCount, cumulativeCount, createdAt

**Dialog 新增/修改**：省份, 年份, 科类, 分数, 位次, 同分人数(选填), 累计人数(选填)

### 页面3：批次分数线

**特点**：5个精确查询条件 + Excel导入 + 双删除（软删除+硬删除）

**搜索栏**：省份(select), 年份(input-number), 科类(select), 批次(input), 分数线(input-number)

**操作按钮行**：`[新增] [导入Excel] [批量软删除] [批量硬删除] [刷新]`

**表格列**：复选框 | 省份 | 年份 | 科类 | 批次 | 分数线 | 操作(详情/修改/软删除/硬删除)

**Dialog 详情**：额外展示 rankLine, remark, createdAt

**Dialog 新增/修改**：省份, 年份, 科类, 批次, 分数线, 位次线(选填), 备注-textarea(选填,200字)

## 删除按钮文案规则

| 操作 | 确认弹窗标题 | 确认弹窗内容 |
|------|-------------|-------------|
| 软删除(单条) | 提示 | 确定要软删除该记录吗？ |
| 硬删除(单条) | 警告 | 确定要永久删除该记录吗？此操作不可恢复！ |
| 批量软删除 | 提示 | 确定要软删除选中的 N 条记录吗？ |
| 批量硬删除 | 警告 | 确定要永久删除选中的 N 条记录吗？此操作不可恢复！ |

## Excel导入逻辑

1. 点击「导入Excel」触发隐藏的 `<input type=file accept=.xlsx,.xls>`
2. 选择文件后自动上传到 POST /import 接口
3. 成功：ElMessage.success 提示处理条数
4. 失败：ElMessage.error 展示后端返回的具体错误信息

## 文件结构

```
apps/admin/src/
  api/algorithm/config/
    index.ts                      # barrel export
    province-reform.ts            # 省份改革配置 API
    score-rank.ts                 # 一分一段位次 API
    batch-score-line.ts           # 批次分数线 API
  types/algorithm/config/
    index.ts                      # barrel export
    province-reform.ts            # 省份改革配置 VO/DTO
    score-rank.ts                 # 一分一段位次 VO/DTO
    batch-score-line.ts           # 批次分数线 VO/DTO
  views/algorithm/config/
    province-reform/index.vue     # 省份改革配置页
    score-rank/index.vue          # 一分一段位次页
    batch-score-line/index.vue    # 批次分数线页
  router/modules/algorithm.ts     # 修改：添加3条路由
```
