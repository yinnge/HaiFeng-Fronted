# 行业专项招聘（教师/医疗卫生/金融银行）设计文档

## 1. 概述

在现有"统一岗位搜索"页面基础上，为**教师招聘**、**医疗卫生**、**金融银行**三个分类创建独立的列表页和详情页。每个分类使用专用的后端 API 和专属筛选字段。

## 2. 路由设计

```
统一岗位搜索     /employment/jobs                    (现有，改造标签行为)
教师列表         /employment/teacher                  (新增)
教师详情         /employment/teacher/:id              (新增，requiresAuth)
医疗卫生列表     /employment/healthcare               (新增)
医疗卫生详情     /employment/healthcare/:id           (新增，requiresAuth)
金融银行列表     /employment/finance                  (新增)
金融银行详情     /employment/finance/:id              (新增，requiresAuth)

旧通用详情       /employment/job/:id                  (保留，用于旧分类)
```

统一搜索页中，点击"教师/医疗卫生/金融银行"标签改为 `router.push` 跳转，其余标签仍使用现有 `jobIndex` API。

## 3. 文件结构

```
apps/user/src/
├── api/employment/
│   ├── jobIndex/index.ts          (已有，不变)
│   ├── teacher/index.ts           (新增)
│   ├── healthcare/index.ts        (新增)
│   └── finance/index.ts           (新增)
├── types/employment/
│   ├── jobIndex/index.ts          (已有，不变)
│   ├── teacher/index.ts           (新增)
│   ├── healthcare/index.ts        (新增)
│   └── finance/index.ts           (新增)
├── views/employment/
│   ├── jobs/index.vue             (改造标签跳转逻辑)
│   ├── job/Detail.vue             (保留，不变)
│   ├── teacher/
│   │   ├── List.vue               (新增)
│   │   └── Detail.vue             (新增)
│   ├── healthcare/
│   │   ├── List.vue               (新增)
│   │   └── Detail.vue             (新增)
│   └── finance/
│       ├── List.vue               (新增)
│       └── Detail.vue             (新增)
└── router/index.ts                (新增 6 条路由)
```

## 4. 类型定义

### 4.1 教师招聘

```typescript
// api/employment/teacher/index.ts
export const getTeacherList = (params: TeacherQueryDTO) =>
  request.get<R<PageResult<TeacherPositionListVO>>>('/api/v1/app/employment/teacher/list', { params })

export const getTeacherDetail = (id: number) =>
  request.get<R<TeacherPositionDetailVO>>(`/api/v1/app/employment/teacher/${id}/detail`)

// types/employment/teacher/index.ts
export interface TeacherQueryDTO {
  page?: number; size?: number
  keyword?: string
  schoolType?: string; schoolNature?: string; subject?: string
  province?: string; city?: string; district?: string
  positionStatus?: string
}

export interface TeacherPositionListVO {
  id: number; schoolName: string; schoolType: string; schoolNature: string
  positionName: string; subject: string; recruitmentType: string
  province: string; city: string; district: string
  workExperience: string; recruitmentCount: number; ageLimit: number
  salaryRange: string; regStartDate: string; regEndDate: string
  positionStatus: string
}

export interface TeacherPositionDetailVO {
  id: number; schoolName: string; schoolType: string; schoolNature: string
  supervisingDept: string; positionName: string; subject: string
  recruitmentType: string; province: string; city: string; district: string
  educationRequirement: string; degreeRequirement: string; majorRequirement: string
  ageLimit: number; recruitmentCount: number
  teacherCertRequirement: string; teacherCertSubject: string
  putonghuaLevel: string; otherCertRequirement: null | string
  workExperience: string; isNormalMajor: string
  salaryRange: string; benefits: string
  examContent: string; interviewForm: string
  regStartDate: string; regEndDate: string; examTime: string
  positionStatus: string; applyLink: string; contactPhone: string
  remark: string; content: string
}
```

### 4.2 医疗卫生

```typescript
// api/employment/healthcare/index.ts
export const getHealthcareList = (params: HealthcareQueryDTO) =>
  request.get<R<PageResult<HealthcarePositionListVO>>>('/api/v1/app/employment/healthcare/list', { params })

export const getHealthcareDetail = (id: number) =>
  request.get<R<HealthcarePositionDetailVO>>(`/api/v1/app/employment/healthcare/${id}/detail`)

// types/employment/healthcare/index.ts
export interface HealthcareQueryDTO {
  page?: number; size?: number
  keyword?: string
  institutionLevel?: string; positionCategory?: string; department?: string
  province?: string; city?: string; district?: string
  positionStatus?: string
}

export interface HealthcarePositionListVO {
  id: number; institutionName: string; institutionLevel: string
  positionName: string; department: string; positionCategory: string
  province: string; city: string; district: string
  ageLimit: number; recruitmentCount: number
  salaryRange: string; workExperience: string; positionStatus: string
}

export interface HealthcarePositionDetailVO {
  id: number; institutionName: string; institutionType: string
  institutionLevel: string; institutionNature: string
  positionName: string; department: string; positionCategory: string
  recruitmentType: string; province: string; city: string; district: string
  educationRequirement: string; degreeRequirement: string; majorRequirement: string
  ageLimit: number; recruitmentCount: number; workExperience: string
  licenseRequirement: string; titleRequirement: string
  internshipRequirement: string; researchRequirement: null | string
  salaryRange: string; benefits: string; housingSubsidy: string
  regStartDate: string; regEndDate: string; examTime: string
  examContent: string; applyLink: string; positionStatus: string
  contactPhone: string; contactPerson: string; remark: string; content: string
}
```

### 4.3 金融银行

```typescript
// api/employment/finance/index.ts
export const getFinanceList = (params: FinanceQueryDTO) =>
  request.get<R<PageResult<FinancePositionListVO>>>('/api/v1/app/employment/finance/list', { params })

export const getFinanceDetail = (id: number) =>
  request.get<R<FinancePositionDetailVO>>(`/api/v1/app/employment/finance/${id}/detail`)

// types/employment/finance/index.ts
export interface FinanceQueryDTO {
  page?: number; size?: number
  keyword?: string
  institutionCategory?: string; recruitmentType?: string
  province?: string; city?: string
  positionStatus?: string
}

export interface FinancePositionListVO {
  id: number; institutionName: string; institutionCategory: string
  positionName: string; positionCategory: string; recruitmentType: string
  province: string; city: string; ageLimit: number; workExperience: string
  salaryMin: number; salaryMax: number
  regStartDate: string; regEndDate: string; isRemote: boolean
  workLocation: string; recruitmentCount: number; positionStatus: string
}

export interface FinancePositionDetailVO {
  id: number; institutionName: string; institutionCategory: string
  institutionType: string; institutionLogo: string; branchName: string
  positionName: string; positionCategory: string; recruitmentType: string
  province: string; city: string; workLocation: string; isRemote: boolean
  educationRequirement: string; degreeRequirement: string; majorRequirement: string
  majorPreference: string[]; ageLimit: number; workExperience: string
  recruitmentCount: number; certRequirements: string[]
  languageRequirement: string; computerRequirement: string; otherRequirement: string
  salaryMin: number; salaryMax: number; salaryText: string; benefits: string
  examContent: string; examTime: string; interviewRounds: string
  regStartDate: string; regEndDate: string; applyLink: string
  positionStatus: string; contactInfo: string; remark: string; content: string
}
```

## 5. 列表页设计

三个列表页共用统一模板，差异仅在筛选项和 API：

### 5.1 页面布局

```
┌──────────────────────────────────────────────────────────┐
│ [Logo] 海枫未来规划院    岗位搜索  个人中心  [登录]      │ ← sticky header
├──────────────────────────────────────────────────────────┤
│ < 返回岗位搜索                                           │
│ ◉ 分类名称（如：教师招聘）                                │ ← 分类标题区
│ 分类描述文案                                             │
├──────────────────────────────────────────────────────────┤
│ [keyword 搜索框...                     ] [搜索]           │ ← 筛选区(白色卡片)
│ [筛选1 ▼] [筛选2 ▼] [筛选3 ▼] [筛选4 ▼] [筛选5 ▼]      │
│                                                          │
│ 共找到 XX 个岗位                [分页控件]                │
│ ┌──────────────────────────────────────────────────┐     │
│ │  tags  [岗位状态]                       查看详情 > │     │ ← 岗位卡片
│ │  岗位名称                                        │     │
│ │  机构 · 城市 · 关键信息                          │     │
│ │  标签  信息  信息                                │     │
│ └──────────────────────────────────────────────────┘     │
│ ┌──────────────────────────────────────────────────┐     │
│ │  ...更多卡片...                                   │     │
│ └──────────────────────────────────────────────────┘     │
│                                                          │
│                    [底部分页控件]                         │
├──────────────────────────────────────────────────────────┤
│ SiteFooter                                               │
└──────────────────────────────────────────────────────────┘
```

### 5.2 筛选器详细

**教师招聘：**
| 筛选项 | 类型 | 选项值 |
|--------|------|--------|
| keyword | 输入框 | 模糊匹配 school_name / position_name |
| schoolType | 下拉 | 幼儿园/小学/初中/高中/中职/高职/大学/特殊教育学校 |
| schoolNature | 下拉 | 公办/民办 |
| subject | 下拉(滚动) | 语文/数学/英语/物理/化学/生物/历史/地理/政治/音乐/美术/体育/信息技术/心理健康/通用技术/科学/道德与法治/综合实践/学前教育/特殊教育/其他 |
| province | 下拉 | ProvinceOptions (来自 @haifeng/shared) |
| positionStatus | 下拉 | 招聘中/已结束/即将开始 |

**医疗卫生：**
| 筛选项 | 类型 | 选项值 |
|--------|------|--------|
| keyword | 输入框 | 模糊匹配 institution_name / position_name |
| institutionLevel | 下拉 | 三级甲等/三级乙等/二级甲等/二级乙等/一级/未定级/社区 |
| positionCategory | 下拉 | 临床医师/护理/药学/医技/公共卫生/行政后勤/科研 |
| department | 下拉 | (从 API 获取或预定义列表) |
| province | 下拉 | ProvinceOptions |
| positionStatus | 下拉 | 招聘中/已结束/即将开始 |

**金融银行：**
| 筛选项 | 类型 | 选项值 |
|--------|------|--------|
| keyword | 输入框 | 模糊匹配 institution_name / position_name |
| institutionCategory | 下拉 | 银行/证券/保险/基金/信托/期货/监管机构/金融科技 |
| recruitmentType | 下拉 | 秋招/春招/社招/实习/定向 |
| province | 下拉 | ProvinceOptions |
| positionStatus | 下拉 | 招聘中/已结束/即将开始 |

### 5.3 岗位卡片展示

```
┌─────────────────────────────────────────────────────────┐
│  [分类标签]  [岗位状态标签]                      查看详情 > │
│  岗位名称 (font-bold text-lg)                           │
│  机构名称 · 城市 · 学历/经验                           │
│  [招募类型标签]   招聘X人   薪资范围   年龄上限         │
│  报名：报名开始 ~ 报名截止                              │
└─────────────────────────────────────────────────────────┘
```

- 卡片可点击（整个卡片点击跳转详情）
- hover：`shadow-xl` + 标题变橙色 + "查看详情"滑入
- 岗位状态标签颜色：招聘中=绿色，即将开始=蓝色，已结束=灰色

### 5.4 分页

与统一搜索页一致的 `el-pagination`，page-sizes: `[10, 20, 30, 50, 100]`

## 6. 详情页设计

### 6.1 教师招聘详情

```
┌──────────────────────────────────────────────────────────────┐
│ < 返回岗位列表                    岗位详情                     │
├──────────────────────────────────────────────────────────────┤
│ [招聘中] 高中数学教师                                        │ ← 标题区
│ 广州市第一中学 · 广州市教育局                                │
├────────────────┬────────────────┬───────────────────────────┤
│  薪资待遇       │  工作地点      │  学历要求                  │ ← 关键信息网格
│  8k-12k        │  广东广州      │  本科                     │
├────────────────┼────────────────┼───────────────────────────┤
│  招聘类型       │  招聘人数      │  年龄上限                 │
│  编制           │  3人          │  35岁                     │
├────────────────┴────────────────┴───────────────────────────┤
│  学校类型：高中            学校性质：公办                     │ ← 详情信息两列
│  学科：数学                专业要求：数学与应用数学           │
│  学位要求：学士            教学经验：不限                     │
│  教师资格证：具有相应学科高级中学教师资格证                  │
│  资格证学科：数学          普通话：二级乙等                  │
│  师范要求：优先            其他证书：无                      │
├──────────────────────────────────────────────────────────────┤
│  ？ 薪资待遇：8k-12k                                         │ ← 待遇&考试区
│  福利待遇：五险一金、寒暑假、绩效奖金                        │
│  笔试内容：教育综合知识+学科专业知识                         │
│  面试形式：试讲+结构化面试                                   │
├──────────────────────────────────────────────────────────────┤
│  📅 报名时间：2026-07-01 ~ 2026-07-20                       │ ← 时间&联系区
│  🗓 考试时间：2026-08-01 09:00                               │
│  📞 联系电话：020-12345678                                   │
│  🔗 报名链接：https://...                                    │
├──────────────────────────────────────────────────────────────┤
│  <详细说明 (v-html)>                                         │ ← content
└──────────────────────────────────────────────────────────────┘
```

### 6.2 医疗卫生详情

与教师布局一致，展示医疗卫生特有字段：

**关键信息网格：** 薪资待遇、工作地点、学历要求、机构等级、招聘人数、年龄上限

**详情信息两列：**
- 机构类型、机构等级、机构性质
- 科室、岗位类别、招聘类型
- 专业要求、学位要求
- 执业资格证要求、职称要求
- 规培要求、科研要求、工作经验

**待遇&考试区：** 薪资待遇、福利待遇、住房补贴、考试内容

**时间&联系区：** 报名时间、考试时间、联系电话、联系人、报名链接

### 6.3 金融银行详情

与教师布局一致，展示金融银行特有字段：

**关键信息网格：** 薪资范围、工作地点、学历要求、招聘类型、招聘人数、年龄上限

**详情信息两列：**
- 机构大类、机构类型、分支机构
- 岗位类别、专业要求、学位要求
- 语言要求、计算机要求、其他要求
- 优先专业：`[el-tag] 人工智能 [el-tag] 大数据`
- 证书要求：`[el-tag] CET-6 [el-tag] 计算机二级`

**待遇&考试区：** 薪资文本说明、福利待遇、考试内容、面试轮次

**时间&联系区：** 报名时间、考试时间、联系方式、报名链接

## 7. 统一搜索页改造

修改 `views/employment/jobs/index.vue` 的 `onCategoryTabClick`：

```typescript
function onCategoryTabClick(value: string) {
  if (value === '教师') {
    router.push('/employment/teacher')
    return
  }
  if (value === '医疗卫生') {
    router.push('/employment/healthcare')
    return
  }
  if (value === '金融银行') {
    router.push('/employment/finance')
    return
  }
  // 原有逻辑：调用 jobIndex API
  activeCategory.value = value
  page.value = 1
  fetchJobs()
}
```

## 8. 登录拦截

三个详情页均需登录（`requiresAuth: true`），复用现有路由守卫的 `ElMessageBox.confirm` 提示逻辑。

列表页无需登录（公开接口）。

## 9. 错误处理

- 列表页：请求失败显示 `ElMessage.error`，展示空状态
- 详情页：404 跳回列表页，401 触发登录，其余显示 `ElMessage.error`

## 10. UI 样式约定

所有新增页面遵循首页风格：
- 背景：`min-h-screen bg-gradient-to-b from-slate-50 to-white`
- Header：`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100`
- 卡片：`rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl`
- 主按钮：`rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white`
- 二级按钮：`rounded-lg border border-gray-200 text-gray-600`
- 标签(Tag)：`rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600`
- 状态标签颜色：招聘中=`bg-green-50 text-green-600`，即将开始=`bg-blue-50 text-blue-600`，已结束=`bg-gray-100 text-gray-500`
- 分页：`el-pagination` with `background`，page-sizes `[10, 20, 30, 50, 100]`
- content 字段：使用 `v-html` 渲染

## 11. JSONB 字段处理

金融银行的 `majorPreference` 和 `certRequirements` 字段为 JSONB 数组，使用 `el-tag` 循环展示，type 为空（默认灰色）即可。

## 12. 不涉及改动

- 其他分类（公务员、事业编、军队文职、企业招聘、选调生、基层服务、社区、公益岗）继续使用现有 `jobIndex` API
- 旧通用详情页 `/employment/job/:id` 保持不变
- SiteFooter、store、shared package 均无需改动
