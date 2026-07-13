# C 端特殊招生通道模块 - 设计文档

## 概述

在用户端（`apps/user/`）新增特殊招生通道模块，涵盖特殊招生通道列表/详情、强基计划入围/录取数据列表/详情、强基计划院校配置展示。

---

## 1. 路由与导航

| 路径 | 组件 | 名称 | 权限 |
|------|------|------|------|
| `/special` | `views/special/index.vue` | SpecialChannel | 公开（列表）/ 需登录（详情） |
| `/special/channel/:id` | `views/special/ChannelDetail.vue` | ChannelDetail | 需登录 |
| `/special/strong-base/:id` | `views/special/StrongBaseDetail.vue` | StrongBaseDetail | 需登录 |

导航栏在"岗位搜索"和"个人中心"之间插入"特殊通道"链接，指向 `/special`。

---

## 2. 页面结构总览

```
[Header - 现有 sticky header + 特殊通道链接]
  │
[引导区 - 标题 + 简介文案]
  │
[Tab 切换行 - 特殊通道(默认) / 强基计划]
  │
[搜索栏 - 根据 Tab 动态切换查询字段]
  │
[卡片网格 - 10条/页，Element Plus 分页]
  │
[SiteFooter]
```

---

## 3. Tab 1：特殊通道（默认）

### 3.1 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| `channelName` | 模糊(LIKE) | 文本输入框，placeholder："输入通道名称" |
| `displayType` | 精准(=) | 下拉选择：全部 / 院校列表 / 文章 / 专业数据 / 分组 |

### 3.2 卡片网格

- **2行×5列**，每页10条
- 圆角矩形卡片，白色背景，橙色阴影边框 hover 效果

卡片内容：

```
┌─────────────────────────────┐
│  [图标 - 根据 displayType]  │
│  通道名称 (大号加粗)         │
│  副标题 (灰色小字)           │
│  [筛选标签]                  │
│  展示类型: XXXX              │
│  [查看详情 →] 按钮          │
└─────────────────────────────┘
```

### 3.3 详情页 - 特殊通道详情 (`/special/channel/:id`)

- Header：← 返回列表 + 通道名称
- 基本信息卡片：通道名称、副标题、展示类型
- 通道正文：富文本 HTML 渲染（v-html）
- 通道-大学关联列表（内嵌子模块）

### 3.4 通道-大学关联（在特殊通道详情页内）

**搜索栏：**

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| `regionTag` | 精准(=) | 省份下拉选择（使用 ProvinceOptions） |
| `signupStart` | 范围(>=) | 日期选择器 |
| `signupEnd` | 范围(<=) | 日期选择器 |

**卡片网格：** 2行×5列，每页10条

卡片内容：

```
┌─────────────────────────────┐
│  大学名称                    │
│  招生年份: 2025             │
│  地区: [省份标签]           │
│  报名: 03/01 ~ 06/30       │
│  [查看详情] 按钮            │
└─────────────────────────────┘
```

**关联详情弹窗（Dialog）：**

点击"查看详情"弹出 Dialog，内容：
- 大学名称、招生年份、地区
- 报名起止时间
- 报名官网 URL（可点击打开）
- 招生简章标题
- 招生简章正文（富文本 HTML v-html）

---

## 4. Tab 2：强基计划入围/录取数据

### 4.1 搜索栏

| 字段 | 查询方式 | 组件 |
|------|---------|------|
| `year` | 精准(=) | 年份下拉选择（近5年） |
| `province` | 精准(=) | 省份下拉选择 |
| `subjectType` | 精准(=) | 下拉选择：全部/物理类/历史类/理科/文科/综合改革 |
| `entryScoreType` | 精准(=) | 下拉选择：全部/高考成绩/加权成绩/校测初试 |
| `universityName` | 模糊(LIKE) | 文本输入框 |
| `majorName` | 模糊(LIKE) | 文本输入框 |
| `majorCode` | 模糊(LIKE) | 文本输入框 |

### 4.2 卡片网格

- **5行×2列**，每页10条
- 宽卡片，展示较多数据字段

卡片内容：

```
┌─────────────────────────────────────────┐
│  大学名称 · 专业名称 (专业代码)         │
│  ─────────────────────────────────────  │
│  年份: 2025    省份: 北京              │
│  科类: 物理类  入围类型: 高考成绩      │
│  ─────────────────────────────────────  │
│  入围分: 670.00    比例: 1:5          │
│  录取分: 85.50     计划/录取: 3/3     │
│  [查看详情 →]                          │
└─────────────────────────────────────────┘
```

### 4.3 详情页 - 强基数据详情 (`/special/strong-base/:id`)

- Header：← 返回列表 + 强基数据详情
- 基本信息：大学、专业、年份、省份、科类
- 入围信息：入围分、类型、计算公式、比例
- 录取信息：录取综合分、计算公式、计划/录取人数
- 备注

### 4.4 强基院校配置（在强基数据详情页内）

根据 `universityId` 调用 `GET /api/v1/app/special/strong-base-univ/{universityId}`（需登录）

展示内容：
- 是否试点 + 首次试点年份
- 强基计划官网 URL
- 报名入口 URL
- 是否高考出分前校测
- 默认入围比例
- 默认录取综合分公式
- 可选专业列表（标签展示）
- 特殊说明

---

## 5. API 接口清单

| 接口 | 方法 | 权限 | 调用位置 |
|------|------|------|---------|
| `GET /api/v1/app/special/channel/list` | 公开 | 列表 | 特殊通道 Tab |
| `GET /api/v1/app/special/channel/{id}` | 需登录 | 详情 | ChannelDetail 页 |
| `GET /api/v1/app/special/channel-univ/list` | 公开 | 列表 | ChannelDetail 内嵌 |
| `GET /api/v1/app/special/channel-univ/{id}` | 需登录 | 详情 | 关联大学弹窗 |
| `GET /api/v1/app/special/strong-base-score/list` | 公开 | 列表 | 强基计划 Tab |
| `GET /api/v1/app/special/strong-base-score/{id}` | 需登录 | 详情 | StrongBaseDetail 页 |
| `GET /api/v1/app/special/strong-base-univ/{universityId}` | 需登录 | 详情 | StrongBaseDetail 内嵌 |

---

## 6. 样式约定

- 风格与首页一致：白底 + 橙色渐变（from-orange-500 to-amber-500）作为主色调
- 圆角矩形卡片：`rounded-2xl`，白色背景，`shadow-lg` + `border border-gray-100`，hover 时 `hover:border-orange-200` + `hover:shadow-xl`
- 搜索按钮：`bg-gradient-to-r from-orange-500 to-amber-500`
- 分页：Element Plus el-pagination，background 属性
- 页面背景：`bg-gradient-to-b from-slate-50 to-white`

---

## 7. 目录结构

```
apps/user/src/
├── api/
│   └── special/
│       └── index.ts              # 所有特殊通道模块 API
├── types/
│   └── special/
│       └── index.ts              # VO/DTO 类型定义
├── views/
│   └── special/
│       ├── index.vue             # 主页面（Tab 切换 + 搜索 + 卡片网格）
│       ├── ChannelDetail.vue     # 特殊通道详情（含关联大学子模块）
│       └── StrongBaseDetail.vue  # 强基数据详情（含强基院校配置）
└── router/
    └── index.ts                  # 添加 /special 相关路由
```
