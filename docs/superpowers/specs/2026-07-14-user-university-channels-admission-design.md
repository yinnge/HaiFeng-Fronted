# C 端院校管理 - 通道关联 & 录取专业组 设计文档

## 1. 概述

在现有院校详情页基础上，新增两个功能 Tab：
- **特殊通道** — 查看大学关联的特殊招生通道（公开）
- **录取数据** — 查看大学近五年录取专业组（VIP）

同时新增**录取专业组详情页**，展示专业组完整信息及专业录取明细。

## 2. 涉及接口（共 5 个，仅新增这些）

| # | 接口 | 权限 | 说明 |
|---|------|------|------|
| 1 | `GET /api/v1/app/university/{id}/channels` | 公开 | 通道-大学关联分页 |
| 2 | `GET /api/v1/app/university/channel-options` | 公开 | 通道下拉选项 |
| 3 | `GET /api/v1/app/university/admission-group/{universityId}` | VIP | 录取专业组分页 |
| 4 | `GET /api/v1/app/university/admission-group/{groupId}/scores` | VIP | 专业录取明细 |
| 5 | `GET /api/v1/app/university/admission-group/{groupId}/detail` | VIP | 录取专业组详情 |

## 3. 文件变更清单

```
apps/user/src/
├── api/university/
│   └── index.ts                    # +5 个新 API
├── types/university/
│   └── index.ts                    # + VO/DTO 类型
├── components/university/
│   ├── ChannelTab.vue              # 新建: 特殊通道 Tab
│   └── AdmissionGroupTab.vue       # 新建: 录取数据 Tab
├── views/university/
│   ├── Detail.vue                  # 修改: Tab 扩展为6个
│   └── AdmissionGroupDetail.vue    # 新建: 录取专业组详情页
└── router/
    └── index.ts                    # +1 条路由
```

## 4. 各模块详细设计

### 4.1 院校详情页 Tab 扩展 (Detail.vue)

将现有 4 个 Tab 扩展为 6 个，布局改为 2 行 × 3 列：

| 🔬 重点实验室 | 🎓 考研专业 | 🏛️ 院系 |
| 📊 学科评估 | 🎯 特殊通道 | 📈 录取数据 |

新增：
- `<ChannelTab>` 组件（`activeTab === 'channel'` 时渲染）
- `<AdmissionGroupTab>` 组件（`activeTab === 'admission'` 时渲染）

路由传参：通过 `route.params.id`（universityId）传递给子组件。

### 4.2 特殊通道 Tab (ChannelTab.vue)

**权限**: 公开（无需登录）

**搜索栏**:
- `channelName` — 可输入可选择的 `el-select`（`filterable` + `remote`）下拉选项来自 `channel-options` 接口
- `regionTag` — `el-select`，选项来自 `ProvinceOptions` 或独立硬编码
- 搜索 / 重置按钮

**卡片列表**: 3 列 × 3 行 = 9 条/页

每张卡片显示：
| 字段 | 说明 |
|------|------|
| channelName | 通道名称（标题） |
| year | 招生年份 |
| regionTag | 地区标签（小标签） |
| signupStart / signupEnd | 报名起止时间 |

**分页**: Element Plus el-pagination，page-sizes: [9, 18, 30]

### 4.3 通道下拉选项 (ChannelTab.vue 内部调用)

接口 `channel-options` 返回 `{channelCode, channelName}[]`，用于给 channelName 组合选择器提供选项。

### 4.4 录取数据 Tab (AdmissionGroupTab.vue)

**权限**: VIP 会员

**权限门禁逻辑**:
1. 未登录 → 显示引导卡片"开通 VIP 查看录取数据"→ 点击跳转登录页
2. 已登录但 memberType !== 'vip' → 显示引导卡片"开通 VIP 查看录取数据"→ 点击跳转会员中心
3. 已登录且 memberType === 'vip' → 显示正常内容

**引导卡片样式**（橙色渐变+锁图标）:
```
┌──────────────────────────────────────────┐
│  🔒  开通 VIP 查看录取数据               │
│  查看院校近5年录取分数线、专业组详情、   │
│  录取位次等核心数据                       │
│  [立即开通 VIP]  [了解会员权益]          │
└──────────────────────────────────────────┘
```

**搜索栏（VIP 可见）**:
- `province` — `el-select`，选项来自 `ProvinceOptions`
- `batch` — `el-select`，选项硬编码: 本科批/提前批/专科批
- `cityName` — 普通 input 模糊输入

**卡片列表**: 2 列 × 3 行 = 6 条/页

每张卡片显示专业组完整录取数据：
- 标题行: `{year} · {groupName} · {province} · {batch}`
- 选科要求: `{subjects.join(', ')} ({requirementType})`
- 分数矩阵: 最低分/位次、最高分/位次、平均分/位次
- 统计数据: majorCount 个专业、admissionCount 录取人数
- 操作按钮: "查看详情" → 跳转 AdmissionGroupDetail 页

### 4.5 录取专业组详情页 (AdmissionGroupDetail.vue)

**路由**: `/university/admission-group/:groupId`

**权限**: 路由 meta 设定 requiresAuth（路由守卫处理登录），内部调用 API 时由后端校验 VIP（403 处理）

**页面构成**:

**Part A — 专业组基本信息卡片**:
- 头部: 院校名 · 专业组名
- 信息网格: year / province / batch / enrollmentCode / groupCode
- 选科与约束: subjects / requirementType / constraints
- 统计: majorCount / categoryCount / admissionCount
- 分数核心: minScore/minRank / maxScore/maxRank / avgScore/avgRank
- 时间: createdAt / updatedAt

**Part B — 专业录取明细表格** (`el-table`):
- 列: majorCode, majorName, educationLevel, duration, tuition, admissionCount, minScore/minRank, maxScore/maxRank, avgScore/avgRank, constraints
- 数据来源: `GET /api/v1/app/university/admission-group/{groupId}/scores`

**VIP 门禁**: 如果 API 返回 403，显示与上面相同的引导卡片。

## 5. 类型定义

```typescript
// apps/user/src/types/university/index.ts (追加)

// === 通道-大学关联 ===
export interface ChannelListVO {
  channelCode: string
  channelName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
}

export interface ChannelOptionVO {
  channelCode: string
  channelName: string
}

// === 录取专业组 ===
export interface AdmissionGroupListVO {
  id: number
  groupCode: string
  groupName: string
  year: number
  province: string
  batch: string
  cityName: string
  subjects: string[]
  requirementType: string
  majorCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
}

export interface AdmissionGroupDetailVO {
  id: number
  universityId: number
  universityName: string
  cityName: string
  year: number
  province: string
  batch: string
  enrollmentCode: string
  groupCode: string
  groupName: string
  subjects: string[]
  requirementType: string
  description: string
  constraints: string[]
  majorCount: number
  categoryCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  createdAt: string
  updatedAt: string
}

export interface MajorScoreVO {
  id: number
  groupId: number
  majorCode: string
  majorName: string
  educationLevel: string
  duration: string
  tuition: string
  description: string
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  constraints: string[]
}

export interface AdmissionGroupQueryDTO extends BasePageQuery {
  province?: string
  batch?: string
  cityName?: string
}
```

## 6. API 定义

```typescript
// apps/user/src/api/university/index.ts (追加)

// === 通道-大学关联 ===
export const getUniversityChannels = (universityId: number, params: { page?: number; size?: number; channelName?: string; regionTag?: string }) =>
  request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/${universityId}/channels`, { params })

export const getChannelOptions = () =>
  request.get<R<ChannelOptionVO[]>>(`${PREFIX}/channel-options`)

// === 录取专业组 ===
export const getAdmissionGroupPage = (universityId: number, params: AdmissionGroupQueryDTO) =>
  request.get<R<PageResult<AdmissionGroupListVO>>>(`${PREFIX}/admission-group/${universityId}`, { params })

export const getAdmissionGroupDetail = (groupId: number) =>
  request.get<R<AdmissionGroupDetailVO>>(`${PREFIX}/admission-group/${groupId}/detail`)

export const getMajorScores = (groupId: number) =>
  request.get<R<MajorScoreVO[]>>(`${PREFIX}/admission-group/${groupId}/scores`)
```

## 7. 错误处理策略

| 场景 | 处理方式 |
|------|----------|
| API 返回 400（参数不合法） | ElMessage.error 显示后端 msg |
| API 返回 401（未登录） | 路由守卫拦截，弹确认框跳登录 |
| API 返回 403（非 VIP） | 显示 VIP 引导卡片 |
| API 返回 404（资源不存在） | ElMessage.error 提示 |
| API 返回 500 或网络错误 | ElMessage.error "网络异常，请稍后重试" |

## 8. 分页设置

| Tab | 每页条数 | 列数 | 布局 |
|-----|----------|------|------|
| 特殊通道 | 9 | 3列 | grid-cols-3 |
| 录取数据 | 6 | 2列 | grid-cols-2 |

page-sizes 统一: [6, 9, 18, 30]（录取数据）/ [9, 18, 30]（特殊通道）
