# C 端专业管理页面设计

## 概述

为用户端实现 4 个专业相关功能页面：专业查询、专业详情、考研专业、大学→考研专业（嵌入院校详情页）。基于后端 8 个只读接口，权限分级（公开/登录/Pro）。

---

## 1. 页面清单

| 页面 | 路由 | 权限 | 说明 |
|------|------|:----:|------|
| 专业查询 | `/major` | 公开 | 搜索/分类统计/列表/排行 |
| 专业详情 | `/major/:id` | 登录 | 完整专业信息 |
| 考研专业 | `/postgrad-major` | 登录 | 考研专业搜索/列表/详情弹窗 |
| 大学→考研专业 | 嵌入 `/university/:id` | Pro | 院校详情页新 Tab |

---

## 2. 设计规范（与现有代码保持一致）

- **主题色**：橙色渐变 `from-orange-500 to-amber-500`
- **页面背景**：`bg-gradient-to-b from-slate-50 to-white`
- **卡片样式**：`rounded-2xl bg-white p-6 shadow-lg border border-gray-100`
- **导航栏**：`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100`
- **容器**：`container mx-auto px-6 py-8`
- **按钮**：`rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium`
- **搜索输入**：`rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400`

---

## 3. 专业查询页 (`views/major/List.vue`)

### 布局（自上而下）

```
┌─ 粘性导航栏 ──────────────────────────┐
│ ← 返回首页       专业查询              │
├─ 介绍横幅 ─────────────────────────────┤
│ 收录教育部公布的本科、专科和研究生...   │
├─ 本科/专科 按钮组 ─────────────────────┤
│ [● 本科专业目录]  [○ 专科专业目录]      │
├─ 搜索栏 ───────────────────────────────┤
│ [输入名称或代码...] [专业类别下拉▼] [搜索] [重置] │
├─ 专业分类统计 ─────────────────────────┤
│ [计算机类 38] [电子信息类 25] [数学类 12] ... │
├─ 专业列表 ─────────────────────────────┤
│ 表格：代码 | 名称 | 类别 | 学位 | 就业率 | 薪资 │
│ <分页>                                  │
├─ 薪资就业排行 ─────────────────────────┤
│ [专业大类▼] [排序: ●薪资 ○就业率]       │
│ 排行列表（Pro用户可见，普通显示引导卡）  │
├─ SiteFooter ────────────────────────────┤
└─────────────────────────────────────────┘
```

### 数据流

1. `onMounted` → 获取分类统计（`category-stats`）+ 专业列表（`list`，默认 type=本科）
2. 点击本科/专科 → 切换 `majorType` → 重新请求列表
3. 搜索 → 更新查询参数 → 重置分页 → 请求列表
4. 点击分类统计项 → 设置 `majorCategory` 筛选 → 请求列表
5. 点击专业行 → `router.push(/major/:id)`
6. 排行区域 → 下拉选类别 + 单选排序字段 → 请求 `ranking` API

### API 调用

| 用途 | API | 权限 | 频率 |
|------|-----|:----:|------|
| 专业分类统计 | `GET /api/v1/app/major/category-stats` | 公开 | 进入页面时 |
| 专业列表 | `GET /api/v1/app/major/list` | 公开 | 搜索/翻页/切换类型 |
| 薪资就业排行 | `GET /api/v1/app/major/ranking` | Pro | 切换条件时 |

### Pro 权限处理

- `ranking` API 返回 403 → 显示升级引导卡片
- 引导卡片内容："开通专业版，查看完整薪资就业排行"
- 卡片提供"立即升级"按钮

### 数据展示

- 分类统计：标签云风格，圆角 pill，显示 `majorCategory: count`
- 专业列表：表格/卡片行，显示主要字段，支持点击进入详情
- 排行列表：序号 + 专业名 + 薪资范围 + 就业率 + 上升/下降指示

---

## 4. 专业详情页 (`views/major/Detail.vue`)

### 布局

```
┌─ 粘性导航栏 ─────────────────────────┐
│ ← 返回       计算机科学与技术          │
├─ 基本信息卡 ──────────────────────────┤
│ 专业名称 | 代码 | 门类 | 类别 | 学位 | 标签 │
├─ 就业数据卡 ──────────────────────────┤
│ 就业率 | 薪资范围 | 课程数 | 毕业规模  │
├─ 男女比例卡 ──────────────────────────┤
│ [=== 男生 72.5% ===][女生 27.5% ==]   │
├─ 详细介绍卡 ──────────────────────────┤
│ 专业描述 / 培养目标 / 培养要求         │
│ 选科要求 / 就业前景                    │
├─ 课程与技能卡 ────────────────────────┤
│ 主要课程：[数据结构] [操作系统] ...    │
│ 知识技能：[编程能力] [算法设计] ...    │
└────────────────────────────────────────┘
```

### 数据流

1. `onMounted` → `getMajorDetail(id)` 联表查询
2. 404 → 提示"专业不存在"或"专业详情不存在"

---

## 5. 考研专业页 (`views/major/PostgradList.vue`)

### 布局

```
┌─ 粘性导航栏 ──────────────────────────┐
│ ← 返回首页       考研专业              │
├─ 介绍横幅 ─────────────────────────────┤
│ 涵盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、 │
│ 考试科目、报考条件、跨考难度等全面信息，助您精准备考。 │
├─ 学位类型按钮组 ───────────────────────┤
│ [● 全部专业] [○ 学术型硕士] [○ 专业型硕士] │
├─ 搜索栏 ───────────────────────────────┤
│ [名称/代码...] [学位类型▼] [学科门类▼] [热度▼] [难度▼] [搜索] │
├─ 考研专业列表 ─────────────────────────┤
│ 表格：代码 | 名称 | 学位类型 | 门类 | 热度 | 难度 | [查看详情] │
│ <分页>                                  │
├─ SiteFooter ────────────────────────────┤
└─────────────────────────────────────────┘
```

### 详情弹窗 (`PostgradMajorDialog.vue`)

点击"查看详情"弹出：

```
┌─── 考研专业详情 ──────────────────────────────┐
│ 计算机科学与技术  [学术学位] [热门] [难度:高]  │
│                                                │
│ ┌─ 专业介绍 ──────────┐ ┌─ 考试科目 ────────┐ │
│ │ 计算机科学与技术...  │ │ • 政治            │ │
│ │                      │ │ • 英语一          │ │
│ │                      │ │ • 数学一          │ │
│ │                      │ │ • 专业课          │ │
│ └──────────────────────┘ └──────────────────┘ │
│ ┌─ 报考条件 ──────────┐ ┌─ 跨考信息 ────────┐ │
│ │ • 本科毕业          │ │ 难度：较难         │ │
│ │ • 学士学位          │ │ 说明：跨考计算机.. │ │
│ └──────────────────────┘ │ 因素：数学基础... │ │
│                          └──────────────────┘ │
│ ┌─ 开设院校 (Pro) ──────────────────────────┐ │
│ │ [院校类型▼]                                │ │
│ │ 清华大学 | 综合                            │ │
│ │ 北京航空航天大学 | 理工                    │ │
│ │ <分页>                                     │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 数据流

1. `onMounted` → 请求考研专业列表（默认全部）
2. 点击全部/学硕/专硕 → 切换 `degreeType` 筛选
3. 搜索 → 更新筛选条件 → 请求列表
4. 点击"查看详情" → `getPostgradMajorDetail(id)` → 弹出 Dialog
5. Dialog 中"开设院校"区域 → 需 Pro，非 Pro 显示引导卡
6. 点击大学 → `router.push(/university/:id)`

---

## 6. 院校详情页改造 (`views/university/Detail.vue`)

### Tab 变更

```
原有：[重点实验室] [院系] [学科评估]
改造后：[重点实验室] [考研专业] [院系] [学科评估]
```

### 考研专业 Tab 内容

```
┌─ 学硕/专硕 按钮组 ─────────────────────┐
│ [● 学术学位] [○ 专业学位]              │
├─ 考研专业列表 ──────────────────────────┤
│ 专业代码 | 专业名称 | 学位类型          │
│ <分页>                                  │
└──────────────────────────────────────────┘
```

- Pro 权限校验：非 Pro 显示引导卡片
- 点击行 → 弹出考研专业详情 Dialog（同考研专业页）
- 接口：`GET /api/v1/app/university/{universityId}/postgrad-majors`

---

## 7. 文件清单

### 新建 API

| 文件 | 内容 |
|------|------|
| `api/major/index.ts` | 专业列表/详情/分类统计/排行 |
| `api/postgrad-major/index.ts` | 考研专业列表/详情/大学→考研/考研→大学 |

### 新建 Types

| 文件 | 内容 |
|------|------|
| `types/major/index.ts` | MajorListVO, MajorDetailVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO |
| `types/postgrad-major/index.ts` | PostgradMajorListVO, PostgradMajorDetailVO, PostgradMajorQueryDTO, PostgradMajorBriefVO, UniversityBriefForPostgradVO |

### 新建 Views

| 文件 | 描述 |
|------|------|
| `views/major/List.vue` | 专业查询页 |
| `views/major/Detail.vue` | 专业详情页 |
| `views/major/PostgradList.vue` | 考研专业页 |

### 新建 Component

| 文件 | 描述 |
|------|------|
| `components/major/PostgradMajorDialog.vue` | 考研专业详情弹窗（含开设院校子列表） |
| `components/major/PostgradMajorForUniversityTab.vue` | 院校详情页考研专业 Tab 内容（学硕/专硕筛选 + 列表） |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `router/index.ts` | 新增 3 条路由 |
| `views/university/Detail.vue` | 新增"考研专业"Tab，引入 PostgradMajorForUniversityTab 组件 |

---

## 8. 路由配置

```typescript
{
  path: '/major',
  name: 'MajorList',
  component: () => import('@/views/major/List.vue'),
  meta: { title: '专业查询' }
},
{
  path: '/major/:id',
  name: 'MajorDetail',
  component: () => import('@/views/major/Detail.vue'),
  meta: { title: '专业详情', requiresAuth: true }
},
{
  path: '/postgrad-major',
  name: 'PostgradMajorList',
  component: () => import('@/views/major/PostgradList.vue'),
  meta: { title: '考研专业', requiresAuth: true }
}
```

---

## 9. 动画方案（Inspira UI / motion-v）

- **介绍横幅**：`<Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }">` 淡入上滑
- **分类统计标签**：分批入场动画，每组有 0.1s 延迟差
- **专业列表行**：逐行 `:while-in-view` 动画
- **按钮切换**：`transition-all` + Tailwind transition

---

## 10. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 专业不存在 (404) | ElMessage.error + 返回上一页 |
| Token 过期 (401) | 导航守卫弹登录确认框 |
| Pro 不足 (403) | 显示升级引导卡片，不报错 |
| 网络错误 | ElMessage.error + 空状态展示 |
| 空数据 | "暂无数据" 空状态占位 |
