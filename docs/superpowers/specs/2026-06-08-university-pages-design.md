# 院校相关页面设计文档（用户端）

## 概述

为用户端（apps/user）实现 3 个院校相关页面：院校列表、院校详情、适应指南。遵循现有用户端橙/琥珀渐变风格。

## 路由设计

| 页面 | 路径 | 说明 |
|------|------|------|
| 院校列表 | `/university` | 分页展示院校卡片 |
| 院校详情 | `/university/:id` | 轮播图 + 院校详情 |
| 适应指南 | `/university/:id/guide` | 分类指南展示 |

## 文件结构

```
apps/user/src/
├── api/
│   └── university/index.ts          # 院校 API
├── types/
│   └── university/index.ts          # 院校类型定义
├── views/
│   └── university/
│       ├── List.vue                 # 院校列表
│       ├── Detail.vue               # 院校详情
│       └── Guide.vue                # 适应指南
└── router/index.ts                  # 新增路由
```

## API 定义

对应后端 C 端接口：

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/app/university/list` | 公开 | 院校列表（分页+筛选） |
| GET | `/api/v1/app/university/{id}/detail` | 登录 | 院校详情 |
| GET | `/api/v1/app/university/guides/{id}/overview` | 登录 | 指南概览 |
| GET | `/api/v1/app/university/guides/{id}/survival` | 登录 | 基础生存类 |
| GET | `/api/v1/app/university/guides/{id}/academic` | Pro | 学业规划类 |
| GET | `/api/v1/app/university/guides/{id}/social` | 登录 | 社交融入类 |
| GET | `/api/v1/app/university/guides/{id}/safety` | 登录 | 权益与安全类 |
| GET | `/api/v1/app/university/guides/{id}/life` | 登录 | 周边生活类 |
| GET | `/api/v1/app/university/{id}/gallery` | 登录 | 校园图册 |

## 类型定义

### 列表相关

```typescript
interface UniversityQueryDTO extends BasePageQuery {
  name?: string
  provinceName?: string
  nature?: string
  category?: string
  department?: string
  educationLevel?: string
  hasDoctorate?: boolean
  hasMaster?: boolean
}

interface UniversityListVO {
  id: number
  name: string
  tags: string[]
  cityName: string
  educationLevel: string
  provinceName: string
  introduction: string
  imageUrl: string
  nature: string
  category: string
  majorCount: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
}
```

### 详情相关

```typescript
interface UniversityDetailVO {
  // t_universities_detail
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number
  scienceGroupScore: number
  carouselImages: string[]
  introduction: string
  rankings: Record<string, number>
  abroadRate: string
  genderRatio: string
  // t_universities
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  recommendationRate: number
  recommendationYear: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
  tags: string[]
  famousUnion: string
}
```

### 指南相关

```typescript
interface GuideOverviewVO {
  customTags: string[]
  name: string
  tags: string[]
  region: string
  category: string
  nature: string
  imageUrl: string
}

interface GuideCategoryVO {
  [key: string]: Record<string, any>
}
```

## 页面详细设计

### 1. 院校列表页

**布局**：
- 顶部搜索栏：输入框 + 搜索按钮
- 精准筛选栏：省份(Select)、办学性质(Select)、院校类型(Select)、主管部门(Input)、学历层次(Select)、博士点(Select: 全部/是/否)、硕士点(Select: 全部/是/否)
- 筛选条件使用 Element Plus 组件，一行排布
- 卡片网格：3 列 grid，每页 9 条
- 每张卡片：封面图(16:9)、名称、标签、省份/类型/性质、学历层次、专业数
- 卡片底部两个按钮："院校详情"、"适应指南"
- 分页在底部，支持 10/20/30/50/100

**交互**：
- 搜索和筛选条件变更时重置为第 1 页
- 列表接口完全公开，无需登录

### 2. 院校详情页

**布局**：
- 顶部轮播图（el-carousel），展示 carouselImages
- 基本信息区：院校名称、英文名、标签、大区、省份、城市、类型、性质、学历层次
- 详细信息区：地址、招生电话、官网、联盟、排行、推免率、出国比例、男女比例、分数线
- 详细介绍区：introduction 富文本
- 底部按钮："查看适应指南"

**交互**：
- 需要登录，未登录跳转登录页

### 3. 适应指南页

**布局**：
- 引导文案区：介绍文字
- 院校基本信息：名称、封面图、标签、大区、类型、性质
- 6 个分类按钮卡片：
  - 基础生存类（校园设施、宿舍、交通）
  - 学业规划类（学业指导、转专业、学习资源）— Pro 锁定
  - 社交融入类（社团、活动、班级）
  - 权益与安全类（资助、安全、医疗）
  - 周边生活类（生活服务）
  - 校园图册（图片）
- 点击按钮展开/跳转对应内容

**交互**：
- 学业规划类按钮对非 Pro 用户显示锁定图标，点击弹窗提示
- 其余类别需要登录

## 样式规范

沿用现有用户端风格：

- 主色调：橙色渐变（from-orange-500 to-amber-500）
- 卡片：白色背景 + 圆角(rounded-2xl) + 阴影(shadow-lg)
- 按钮：渐变背景 + hover 加深
- 字体：加粗标题 + 灰色正文
- 使用 Tailwind CSS + Element Plus 组件

## JSONB 字段渲染

指南分类接口返回 JSONB 字段（Map<String, Object>），key 为中文名，value 为具体内容。前端遍历 key-value 渲染为描述列表或表格形式。
