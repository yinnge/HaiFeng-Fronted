# 高考档案 - 约束匹配 + 专业组查询 设计文档

## 概述

在高考档案保存后，新增两个功能模块：
1. **约束匹配展示**：显示用户触发的限制性约束
2. **专业组查询**：跳转到新页面查询专业组和专业明细

## 页面架构

### Archive.vue（现有页面，修改）

保存档案后在表单下方显示：

```
┌─────────────────────────────────────┐
│  原有档案表单...                     │
│  [保存档案] [查看志愿] buttons       │
├─────────────────────────────────────┤
│  ★ 约束匹配结果（Section 7）         │
│  - 调用 constraint/match 获取触发列表 │
│  - 调用 constraint/details 获取详情   │
│  - 展示约束名称、分类、描述、严重程度  │
├─────────────────────────────────────┤
│  ★ 查询专业组按钮                    │
│  → 跳转 /gaokao/groups              │
└─────────────────────────────────────┘
```

**触发条件**：`saved === true` 或页面加载时已有档案

### Groups.vue（新页面：/gaokao/groups）

```
┌─────────────────────────────────────┐
│  Header: 专业组查询                  │
├─────────────────────────────────────┤
│  搜索栏                             │
│  [院校名称] [城市] [选科筛选开关]     │
├─────────────────────────────────────┤
│  专业组列表（分页）                  │
│  ┌─────────────────────────────┐    │
│  │ [安全球] 大学名 | 城市 | 代码 │    │
│  │ 历史分数表格                  │    │
│  │ 约束冲突提示（如有）          │    │
│  │ [查看专业] 按钮               │    │
│  │   └─ 展开专业明细列表        │    │
│  │       每个专业: [+] 按钮     │    │
│  └─────────────────────────────┘    │
│  ...更多专业组...                    │
├─────────────────────────────────────┤
│  分页器                             │
└─────────────────────────────────────┘
```

## API 调用流程

### 约束匹配（Archive.vue）

```
1. 保存档案后 / 页面加载时
2. GET /constraint/match → constraintCodes[]
3. POST /constraint/details { codes } → constraints[]
4. 展示约束列表
```

### 专业组查询（Groups.vue）

```
1. 页面加载时从 archive 获取 batch（固定）
2. GET /admission/group/page?batch=X&universityName=Y&cityName=Z&subjectFilter=W&page=P&size=S
3. 每个专业组：
   - POST /constraint/check-group { groupId } → 冲突检查
   - 点击"查看专业" → GET /admission/major/page?groupId=G&page=1&size=10
   - 每个专业明细：
     - POST /constraint/check-group { groupId } → 冲突检查（同上）
```

## 组件设计

### 1. ConstraintDisplay.vue（约束展示组件）

**Props**:
- `constraints: ConstraintItem[]`

**数据结构**:
```ts
interface ConstraintItem {
  code: string
  name: string
  category: string
  description: string
  severity: 'HARD' | 'SOFT'
}
```

**样式**:
- HARD: 红色边框 + 红色图标
- SOFT: 橙色边框 + 橙色图标
- 按 category 分组展示

### 2. Groups.vue（专业组查询页面）

**状态**:
```ts
// 搜索条件
const searchForm = reactive({
  universityName: '',
  cityName: '',
  subjectFilter: false,
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

// 专业组列表
const groups = ref<AdmissionGroupVO[]>([])

// 展开的专业组 ID
const expandedGroupId = ref<number | null>(null)

// 专业明细
const majors = ref<AdmissionMajorVO[]>([])

// 冲突检查结果
const groupConflicts = ref<Map<number, ConstraintCheckResult>>(new Map())
```

### 3. GroupRow.vue（专业组行组件）

**Props**:
- `group: AdmissionGroupVO`
- `isExpanded: boolean`
- `conflicts: ConstraintCheckResult | null`
- `isMasked: boolean`

**Emits**:
- `toggle-expand`
- `add-to-wishlist`

**布局**（四个框）:
```
┌──────────┬────────────────────┬──────────────┬─────┐
│ 安全等级 │ 院校信息            │ 历史分数     │ 操作 │
│ 搏/冲/   │ 北京大学            │ 2024:        │ [+] │
│ 稳/保/垫 │ 北京                │ 680/1200     │     │
│ 小球+数字│ 组代码: 01          │ 685/950      │     │
│          │ 包含5个专业         │ 690/800      │     │
│          │ 描述: ...           │              │     │
│          │ 约束: 色盲不可报考   │              │     │
└──────────┴────────────────────┴──────────────┴─────┘
```

**安全等级颜色**（写死）:
```ts
const safetyColorMap: Record<string, string> = {
  '搏': '#FF4D4F',  // 红
  '冲': '#FFA940',  // 橙
  '稳': '#FADB14',  // 黄
  '保': '#52C41A',  // 绿
  '垫': '#1890FF',  // 蓝
  '禁': '#999999',  // 灰
}
// 其他未知 code → 灰色
```

**历史分数展示**:
```
年份 | 最低分/最低位次 | 平均分/平均位次 | 最高分/最高位次
2024 | 680/1200       | 685/950         | 690/800
2023 | 675/1500       | 680/1200        | 685/1000
```

### 4. MajorRow.vue（专业明细行组件）

**Props**:
- `major: AdmissionMajorVO`
- `isMasked: boolean`

**Emits**:
- `add-to-wishlist`

**布局**（类似 GroupRow 但更紧凑）:
```
┌──────────┬────────────────────┬──────────────┬─────┐
│ 安全等级 │ 专业信息            │ 历史分数     │ 操作 │
│ 稳       │ 080901             │ 675/1500     │ [+] │
│          │ 计算机科学与技术    │ 680/1200     │     │
│          │ 本科 4年 5000元/年  │ 685/1000     │     │
│          │ 描述: ...           │              │     │
│          │ 约束: 色盲不可报考   │              │     │
└──────────┴────────────────────┴──────────────┴─────┘
```

### 5. MaskedCard.vue（遮罩组件）

**用途**: normal 用户第 11 条起显示模糊遮罩

**Props**:
- `show: boolean`

**样式**:
- `filter: blur(8px)` + 半透明覆盖层
- 中间显示"升级会员查看完整数据"
- 点击弹出升级提示（暂不调接口，仅 UI）

## 数据类型定义

```ts
// 专业组
interface AdmissionGroupVO {
  id: number
  masked: boolean
  safetyLevel: number
  levelShort: string
  safetyDescription: string  // 不展示
  universityName: string
  cityName: string
  enrollmentCode: string
  groupCode: string
  groupName: string
  subjects: string[]
  requirementType: string
  description: string
  majorCount: number
  categoryCount: number
  constraints: string[]
  subjectMatch: boolean
  subjectMatchReason: string | null
  historyScores: YearScoreVO[]
}

// 专业明细
interface AdmissionMajorVO {
  id: number
  safetyLevel: number
  levelShort: string
  safetyDescription: string  // 不展示
  majorCode: string
  majorName: string
  educationLevel: string
  duration: string
  tuition: string
  description: string
  constraints: string[]
  historyScores: YearScoreVO[]
}

// 历史分数
interface YearScoreVO {
  year: number
  minScore: number
  minRank: number
  avgScore: number
  avgRank: number
  maxScore: number
  maxRank: number
  admissionCount: number
}

// 约束检查结果
interface ConstraintCheckResult {
  isPass: boolean
  hardConflicts: ConstraintConflict[]
  softConflicts: ConstraintConflict[]
}

interface ConstraintConflict {
  code: string
  name: string
  description: string
}
```

## 文件清单

| 操作 | 文件路径 |
|------|---------|
| 修改 | `apps/user/src/api/gaokao/index.ts` — 新增约束 + 录取查询 API |
| 修改 | `apps/user/src/views/gaokao/Archive.vue` — 新增约束展示 + 查询按钮 |
| 新建 | `apps/user/src/views/gaokao/Groups.vue` — 专业组查询页面 |
| 新建 | `apps/user/src/components/gaokao/ConstraintDisplay.vue` — 约束展示组件 |
| 新建 | `apps/user/src/components/gaokao/GroupRow.vue` — 专业组行组件 |
| 新建 | `apps/user/src/components/gaokao/MajorRow.vue` — 专业明细行组件 |
| 新建 | `apps/user/src/components/gaokao/MaskedCard.vue` — 遮罩组件 |
| 修改 | `apps/user/src/router/index.ts` — 新增 /gaokao/groups 路由 |

## 实现顺序

1. 新增 API 接口层（约束 + 录取查询）
2. 新建约束展示组件 ConstraintDisplay
3. 修改 Archive.vue 添加约束展示 + 查询按钮
4. 新建 Groups.vue 页面框架 + 搜索栏 + 分页
5. 新建 GroupRow.vue 专业组行组件
6. 新建 MajorRow.vue 专业明细行组件
7. 新建 MaskedCard.vue 遮罩组件
8. 在 Groups.vue 中集成所有组件
9. 添加路由配置
10. 类型检查 + 构建验证
