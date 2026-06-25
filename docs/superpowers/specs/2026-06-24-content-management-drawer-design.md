# 备考指南 & 公告 — 右侧抽屉功能设计

## 概述

在 C 端岗位搜索页（`/employment/jobs`）右侧新增抽屉入口，点击后弹出备考指南/公告的分页列表弹窗，支持模糊搜索+精准筛选+分页+详情查看。

## 后端 API

### 基础信息

- **Base Path**: `/api/v1/app/employment/content`
- **分页参数**: `page`（从 1 开始）、`size`（10/20/30/50/100）
- **统一响应**: `R<PageResult<T>>`

### 备考指南

| 接口 | Method | Auth | 说明 |
|------|--------|------|------|
| `/exam-guide/list` | GET | 无需 | 分页列表 |
| `/exam-guide/{id}` | GET | 需登录 | 详情 |

**查询字段**:
- 模糊（统一关键词，OR 连接）: title, subtitle
- 精确（AND 连接）: guideCategory, guideType, difficultyLevel, authorTitle, authorName

**列表响应字段**: id, guideCategory, guideType, title, subtitle, tags, authorName, authorTitle

**详情响应字段**: id, guideCategory, guideType, title, subtitle, coverImage, iconClass, summary, content(HTML), tags, difficultyLevel, targetAudience, authorName, authorTitle, isTop, isRecommended, sortOrder, viewCount, likeCount, createdAt, updatedAt

### 公告

| 接口 | Method | Auth | 说明 |
|------|--------|------|------|
| `/notice/list` | GET | 无需 | 分页列表 |
| `/notice/{id}` | GET | 需登录 | 详情 |

**查询字段**:
- 模糊（统一关键词，OR 连接）: title, summary, source
- 精确（AND 连接）: noticeCategory, noticeType, province, city, year

**列表响应字段**: id, title, summary, publishDate, viewCount, noticeCategory, province, city, year, regStartDate, regEndDate, recruitmentCount

**详情响应字段**: id, noticeCategory, noticeType, title, summary, content(HTML), province, city, tags, year, source, sourceUrl, publishDate, publishUnit, regStartDate, regEndDate, examTime, recruitmentCount, isTop, isImportant, viewCount, createdAt, updatedAt

### 枚举值

**guideCategory**: civil(公务员), institution(事业单位), military(军队文职), selection(选调生), teacher(教师招聘), healthcare(医疗卫生), finance(金融银行), grassroots(基层服务), community(社区工作者), general(通用/其他)

**guideType**: 备考攻略, 科目指导, 真题解析, 面试技巧, 时事热点, 经验分享, 政策解读, 学习计划

**difficultyLevel**: 入门, 进阶, 高阶

**noticeCategory**: civil(公务员), institution(事业单位), military(军队文职), selection(选调生), teacher(教师招聘), healthcare(医疗卫生), finance(金融银行), grassroots(基层服务), community(社区工作者), public_welfare(公益岗位), enterprise(国企/名企), general(通用/其他)

**noticeType**: 招聘公告, 招录公告, 补录公告, 调剂公告, 成绩公示, 面试通知, 体检通知, 录用公示, 报名指南, 考试大纲, 政策解读

## 布局

### 页面结构

岗位搜索页从单列改为双列布局:

```
┌────────────────────────────────────────────────────────────┐
│ Header (sticky)                                             │
├─────────────────────────────────┬──────────────────────────┤
│  主内容区 (flex-1)              │  右侧抽屉 (w-56, sticky)   │
│  🎯 统一岗位搜索                │  ┌──────────────────────┐ │
│  [分类 tabs]                    │  │ 📚 备考指南           │ │
│  [搜索+筛选]                    │  │ 📢 公告               │ │
│  [岗位列表]                     │  │ ◀ 收起                │ │
│  [分页]                         │  └──────────────────────┘ │
├─────────────────────────────────┴──────────────────────────┤
│ Footer                                                      │
└────────────────────────────────────────────────────────────┘
```

### 右侧抽屉

- 宽度: 224px (`w-56`)
- 定位: `sticky top-24`，从 header 下方固定
- 高度: auto（仅包裹内容）
- 展开态: 两个圆形按钮 + "收起"箭头
- 收起态: 右侧边缘留 12px 竖条，带 `◀` 箭头，hover 展开

### 抽屉内容

```
┌──────────────────────┐
│  📚 备考指南          │  ← 圆角卡片按钮
│                      │
│  📢 公告              │  ← 圆角卡片按钮
│                      │
│  ◀ 收起               │  ← 点击后收缩为竖条
└──────────────────────┘
```

## 备考指南弹窗

### 布局: 模糊+精确+分页表，所有字段默认可见

```
┌──────────────────────────────────────────────────────────────┐
│ 📚 备考指南                                               ✕ │
├──────────────────────────────────────────────────────────────┤
│ [统一关键词搜索框]  [搜索按钮]                                │
│                                                               │
│ 指南类别: [下拉▼]  指南类型: [下拉▼]  难度: [下拉▼]          │
│ 作者头衔: [输入框]  作者名: [输入框]                          │
├──────────────────────────────────────────────────────────────┤
│ 标题            │ 类别    │ 类型    │ 难度  │ 作者  │ 操作    │
│─────────────────┼─────────┼─────────┼───────┼───────┼────────┤
│ 公务员行测...    │ 公务员  │ 备考攻略 │ 进阶  │ 张三  │ 查看详情│
│ 申论高分...      │ 公务员  │ 经验分享 │ 入门  │ 李四  │ 查看详情│
├──────────────────────────────────────────────────────────────┤
│ [分页 10/20/30/50/100]                                      │
└──────────────────────────────────────────────────────────────┘
```

- 弹窗尺寸: `width: 80vw / max-width: 1100px`
- 关闭: 右上角 ✕ 按钮

## 公告弹窗

### 布局: 模糊+精确+分页表，所有字段默认可见

```
┌──────────────────────────────────────────────────────────────┐
│ 📢 公告                                                   ✕ │
├──────────────────────────────────────────────────────────────┤
│ [统一关键词搜索框]  [搜索按钮]                                │
│                                                               │
│ 公告类别: [下拉▼]  公告类型: [下拉▼]                        │
│ 省份: [下拉▼]  城市: [下拉▼]  年份: [下拉▼]                │
├──────────────────────────────────────────────────────────────┤
│ 标题        │ 类别    │ 省份  │ 日期        │ 阅读   │ 操作  │
│─────────────┼─────────┼───────┼─────────────┼────────┼───────┤
│ 2026国考... │ 公务员  │ 北京  │ 2026-01-15  │ 2.3k   │ 查看  │
│ 广东省考... │ 公务员  │ 广东  │ 2026-02-01  │ 1.8k   │ 查看  │
├──────────────────────────────────────────────────────────────┤
│ [分页 10/20/30/50/100]                                      │
└──────────────────────────────────────────────────────────────┘
```

- 弹窗尺寸: `width: 80vw / max-width: 1100px`
- 关闭: 右上角 ✕ 按钮

## 详情弹窗

### 两者共用交互模式

点击"查看详情"后，当前弹窗内容切换到详情视图:

- **左上角**: `◀ 返回` 按钮，点击回到列表视图
- **右上角**: ✕ 关闭按钮
- 内容: 标题、作者信息、类别标签、阅读/点赞统计、HTML 内容渲染

## 登录拦截

未登录用户点击"查看详情"时:
- 弹出 `ElMessageBox.confirm` 确认框
- "请先登录查看详情" → 确认后跳转 `/login`
- 与岗位列表详情行为保持一致

## 文件结构

```
apps/user/src/
├── api/employment/content/
│   ├── examGuide.ts              # 新增
│   └── notice.ts                 # 新增
├── types/employment/content/
│   ├── examGuide.ts              # 新增
│   └── notice.ts                 # 新增
├── views/employment/jobs/
│   └── index.vue                 # 修改: 新增抽屉
└── components/employment/
    ├── ExamGuideDialog.vue       # 新增: 备考指南弹窗
    ├── ExamGuideDetail.vue       # 新增: 备考指南详情
    ├── NoticeDialog.vue          # 新增: 公告弹窗
    └── NoticeDetail.vue          # 新增: 公告详情
```

## UI 样式

- 抽屉卡片: 白色背景、圆角、浅阴影，与岗位列表卡片风格一致
- 按钮: 渐变橙色（`from-orange-500 to-amber-500`）或白色边框
- 弹窗: 使用 `el-dialog`
- 表格: 使用 `el-table`
- 分页: 使用 `el-pagination`，页尺寸选项 `[10, 20, 30, 50, 100]`
- 筛选输入框: 使用 `el-select` / `el-input`，与页面现有筛选风格一致
