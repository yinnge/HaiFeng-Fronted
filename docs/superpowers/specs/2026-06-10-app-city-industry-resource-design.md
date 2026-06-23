# C 端城市/行业/资源管理模块 - 设计文档

## 概述

为 C 端（用户端）新增 5 个页面：城市列表、城市详情、行业列表、行业详情、资源列表。基于现有用户端代码风格（Tailwind CSS + Element Plus + 橙/琥珀色渐变主题）。

## 页面清单

| 页面 | 路由 | 权限 | 说明 |
|------|------|------|------|
| 城市列表 | `/city` | 公开 | 搜索+城市卡片网格(3×4) |
| 城市详情 | `/city/:id` | 需登录 | 纵向Story布局 |
| 行业列表 | `/industry` | 公开 | 分类Tag+行业卡片网格(3×4) |
| 行业详情 | `/industry/:id` | 需登录 | 纵向Story布局 |
| 资源列表 | `/resource` | 公开 | 分类按钮+搜索+资料卡片网格(3×4) |

## 页面详细设计

### 1. 城市列表页 `/city`

**布局**：
- 顶部 header：返回首页 + "城市查询"标题
- 简介区域：浅橙底卡片，简短的引导文字
- 搜索栏：城市名称输入框 + 省份下拉(ProvinceOptions) + 地区下拉(硬编码：华东/华南/华北/华中/东北/西南/西北/港澳台) + 搜索/重置按钮
- 城市卡片网格：3行×4列，12条/页
  - 卡片内容：城市名、省份、高校数量+重点高校数(橙色高亮)、GDP、简介片段
  - 点击跳转 `/city/:id`（需登录，路由守卫弹窗提示）
- 分页：el-pagination, 10/20/30/50/100
- SiteFooter

**API**：
- `GET /api/v1/app/city/list?page=&size=&cityName=&province=&region=`

### 2. 城市详情页 `/city/:id`（纵向Story）

**布局**：
- 顶部 header：返回城市列表 + 城市名
- Hero区：城市名(大字) + 副标题 + 城市级别badge + 区划代码 + 面积/GDP/人口三列
- 📊 经济指标：人均GDP、GDP增速、产业结构(三产饼图或比例条)、500强数量
- 👥 人口结构：城镇化率、农村人口比、老龄化率、流入人口比
- 🏭 产业发展：主导产业tag列表、新兴产业tag列表、产业描述全文
- 🏠 生活配套：房价水平、租房成本、消费水平、住房政策
- 🎓 教育医疗：高校统计(重点高亮)、基础教育统计、医疗资源
- 🚇 交通文化：地铁、机场、博物馆、剧院
- 🔮 未来规划：规划焦点、目标年份
- 每个 Section 用白色卡片 + 圆角 + 阴影包裹

**API**：
- `GET /api/v1/app/city/{id}/detail`（需登录）
- JSONB 字段按 key 渲染，例如 `industryStructure` 渲染为比例条

### 3. 行业列表页 `/industry`

**布局**：
- 顶部 header：返回首页 + "行业探索"标题
- 📈 行业趋势分析：主题大字（渐变标题）+ 简介
- 🏷️ 分类 Tag 栏：横向可滚动，从后端动态获取
  - 默认选中"全部行业"（不传 category）
  - 点击某Tag → 精准筛选，高亮选中状态
- 🏭 行业卡片网格：3行×4列，12条/页
  - 卡片内容：行业名称、分类标签(橙底)、年增长率(箭头+百分比)、市场规模、人才缺口、投资热度(进度条)
  - 点击跳转 `/industry/:id`（需登录）
- 分页
- SiteFooter

**API**：
- `GET /api/v1/app/industry/categories` → 获取分类列表
- `GET /api/v1/app/industry/list?page=&size=&category=`

### 4. 行业详情页 `/industry/:id`（纵向Story）

**布局**：
- Hero区：行业名 + 简要描述 + 分类标签 + 投资热度进度条 + 趋势标签(增长/稳定/下降)
- 📊 行业规模：年增长率、市场规模、人才缺口
- 💰 薪资水平：入门/中级/高级薪资 + 全国平均 vs 一线城市对比
- 🧑‍💼 人才分析：供需比、学历要求、热门岗位列表
- 📋 行业描述：详细描述全文
- 🏛️ 政策与支持：国家规划、补贴政策、重点城市列表
- 每个 Section 用白色卡片包裹

**API**：
- `GET /api/v1/app/industry/{id}/detail`（需登录）

### 5. 资源列表页 `/resource`

**布局**：
- 顶部 header：返回首页 + "资源下载"标题
- 📚 资源下载专区：主题大字（渐变标题）+ 简介
- 🔖 精准分类按钮：从后端 `/resource/categories` 动态获取
  - 默认"全部"
  - 点击切换分类筛选
- 🔍 搜索栏：资源名称模糊搜索
- 📄 资料卡片网格：3行×4列，12条/页
  - 卡片内容：封面图(如有)、资源名称、文件类型标签(PDF/MP4)、浏览计数(👁️)、描述片段
  - "立即下载"按钮
    - 未登录 → 弹出提示框引导登录
    - 已登录 → 调用 API 获取链接，弹出 Dialog 展示网盘链接+提取码+复制按钮
    - 后端自动 +1 浏览计数
- 分页
- SiteFooter

**API**：
- `GET /api/v1/app/resource/categories` → 获取分类列表
- `GET /api/v1/app/resource/list?page=&size=&resourceName=&category=`
- `GET /api/v1/app/resource/{id}/url`（需登录）→ 返回 {resourceUrl, accessCode}

## 路由配置

```typescript
{
  path: '/city',
  name: 'CityList',
  component: () => import('@/views/city/List.vue'),
  meta: { title: '城市查询' },
},
{
  path: '/city/:id',
  name: 'CityDetail',
  component: () => import('@/views/city/Detail.vue'),
  meta: { title: '城市详情', requiresAuth: true },
},
{
  path: '/industry',
  name: 'IndustryList',
  component: () => import('@/views/industry/List.vue'),
  meta: { title: '行业探索' },
},
{
  path: '/industry/:id',
  name: 'IndustryDetail',
  component: () => import('@/views/industry/Detail.vue'),
  meta: { title: '行业详情', requiresAuth: true },
},
{
  path: '/resource',
  name: 'ResourceList',
  component: () => import('@/views/resource/List.vue'),
  meta: { title: '资源下载' },
},
```

## 文件清单（前端）

```
apps/user/src/
├── api/
│   ├── city/index.ts          # 城市 API
│   ├── industry/index.ts      # 行业 API
│   └── resource/index.ts      # 资源 API
├── types/
│   ├── city/index.ts          # 城市 VO/DTO
│   ├── industry/index.ts      # 行业 VO/DTO
│   └── resource/index.ts      # 资源 VO/DTO
├── views/
│   ├── city/
│   │   ├── List.vue            # 城市列表页
│   │   └── Detail.vue          # 城市详情页
│   ├── industry/
│   │   ├── List.vue            # 行业列表页
│   │   └── Detail.vue          # 行业详情页
│   └── resource/
│       └── List.vue            # 资源列表页
└── router/index.ts             # 追加路由
```

## 设计规范

- 背景色：`bg-gradient-to-b from-slate-50 to-white`
- Header：`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100`
- 卡片：`rounded-2xl bg-white p-6 shadow-lg border border-gray-100`
- 主按钮：`bg-gradient-to-r from-orange-500 to-amber-500` + 白色文字
- 搜索输入框：`rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400`
- 分页：`el-pagination` with `layout="total, sizes, prev, pager, next"`, page-sizes `[10, 20, 30, 50, 100]`
- 返回按钮：左侧SVG箭头 + 文字，hover变橙色
- 错误提示：`ElMessage.error(msg)` 使用后端返回的 msg 字段
- 加载：`v-loading="loading"` Element Plus 指令
- 空状态：`py-16 text-center text-gray-400`
