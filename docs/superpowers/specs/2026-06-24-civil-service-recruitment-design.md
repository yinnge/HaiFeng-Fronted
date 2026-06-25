# C 端体制内招录模块设计文档

## 概述

在就业模块中新增 4 个体制内招录子模块：公务员、事业编、军队文职、选调生。每个模块包含独立的列表页和详情页，与教师/医疗/金融银行子模块架构一致。

## 文件结构

```
apps/user/src/
├── api/employment/
│   ├── civil/index.ts           # 公务员 API
│   ├── institution/index.ts     # 事业编 API
│   ├── military/index.ts        # 军队文职 API
│   └── selection/index.ts       # 选调生 API
├── types/employment/
│   ├── civil/index.ts           # 公务员 VO/DTO
│   ├── institution/index.ts     # 事业编 VO/DTO
│   ├── military/index.ts        # 军队文职 VO/DTO
│   └── selection/index.ts       # 选调生 VO/DTO
└── views/employment/
    ├── civil/                   # 公务员
    │   ├── List.vue
    │   └── Detail.vue
    ├── institution/             # 事业编
    │   ├── List.vue
    │   └── Detail.vue
    ├── military/                # 军队文职
    │   ├── List.vue
    │   └── Detail.vue
    └── selection/               # 选调生
        ├── List.vue
        └── Detail.vue
```

## 路由

追加 8 条路由到 `apps/user/src/router/index.ts`：

| 路径 | 名称 | 组件 | 需认证 |
|------|------|------|--------|
| `/employment/civil` | EmploymentCivilList | `views/employment/civil/List.vue` | 否 |
| `/employment/civil/:id` | EmploymentCivilDetail | `views/employment/civil/Detail.vue` | 是 |
| `/employment/institution` | EmploymentInstitutionList | `views/employment/institution/List.vue` | 否 |
| `/employment/institution/:id` | EmploymentInstitutionDetail | `views/employment/institution/Detail.vue` | 是 |
| `/employment/military` | EmploymentMilitaryList | `views/employment/military/List.vue` | 否 |
| `/employment/military/:id` | EmploymentMilitaryDetail | `views/employment/military/Detail.vue` | 是 |
| `/employment/selection` | EmploymentSelectionList | `views/employment/selection/List.vue` | 否 |
| `/employment/selection/:id` | EmploymentSelectionDetail | `views/employment/selection/Detail.vue` | 是 |

## 后端 API

### 公务员
- 列表: `GET /api/v1/app/employment/civil-service/position/list` (无需登录)
- 详情: `GET /api/v1/app/employment/civil-service/position/{id}/detail` (需登录)

### 事业编
- 列表: `GET /api/v1/app/employment/civil-service/institution/list` (无需登录)
- 详情: `GET /api/v1/app/employment/civil-service/institution/{id}/detail` (需登录)

### 军队文职
- 列表: `GET /api/v1/app/employment/civil-service/military/list` (无需登录)
- 详情: `GET /api/v1/app/employment/civil-service/military/{id}/detail` (需登录)

### 选调生
- 列表: `GET /api/v1/app/employment/civil-service/selection/list` (无需登录)
- 详情: `GET /api/v1/app/employment/civil-service/selection/{id}/detail` (需登录)

## 类型定义

### 公务员 (`types/employment/civil/index.ts`)

```typescript
// 查询 DTO
export interface CivilPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  examType?: string       // 国考/省考
  positionCode?: string
  deptCode?: string
  minEducation?: string   // 不限/大专/本科/硕士/博士
  majorRequirement?: string
  degreeRequirement?: string // 不限/学士/硕士/博士
  politicalStatus?: string   // 不限/中共党员/共青团员/群众
  examCategory?: string
}

// 列表 VO
export interface CivilPositionListVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  minEducation: string
  majorRequirement: string
  degreeRequirement: string
  politicalStatus: string
  examCategory: string
  workLocation: string
  regStartDate: string
  regEndDate: string
  regStatus: string       // 报名中/已结束/即将开始
  applicantCount: number
}

// 详情 VO
export interface CivilPositionDetailVO {
  id: number
  positionName: string
  examType: string
  recruitingDept: string
  deptCode: string
  positionCode: string
  affiliatedBureau: string
  majorRequirement: string
  minEducation: string
  degreeRequirement: string
  politicalStatus: string
  workExperience: string
  grassrootsExperience: string
  examCategory: string
  interviewRatio: string
  recruitmentCount: number
  hasProfessionalTest: boolean
  workLocation: string
  workLocationDetail: string
  householdRequirement: string
  householdLocation: string
  positionIntro: string
  remark: string
  officialWebsite: string
  contactPhone: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
}
```

### 事业编 (`types/employment/institution/index.ts`)

```typescript
export interface InstitutionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  province?: string
  examCategory?: string
  positionType?: string
  educationRequirement?: string // 无要求/大专/本科/硕士/博士
  degreeRequirement?: string   // 无要求/学士/硕士/博士
  positionStatus?: string      // 招聘中/已结束
  specialPosition?: string
  ageLimit?: number
}

export interface InstitutionPositionListVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  specialPosition: string
  positionStatus: string
}

export interface InstitutionPositionDetailVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  educationRequirement: string
  degreeRequirement: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  majorRequirements: string[]
  specialPosition: string
  otherRequirement: string
  otherRequirementDesc: string
  remarkType: string
  remarkDesc: string
  consultationPhone: string
  supervisionPhone: string
  positionStatus: string
  positionTag: string       // 热门/无/急招
  tagText: string
}
```

### 军队文职 (`types/employment/military/index.ts`)

```typescript
export interface MilitaryPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  positionType?: string
  workLocation?: string
  majorRequirement?: string
  educationRequirement?: string // 本科及以上/硕士及以上/博士
  positionStatus?: string      // 进行中/已结束
}

export interface MilitaryPositionListVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  majorRequirement: string
  educationRequirement: string
  workLocation: string
  salaryRange: string
  regDeadline: string
  positionStatus: string
}

export interface MilitaryPositionDetailVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  majorRequirement: string
  educationRequirement: string
  regDeadline: string
  positionStatus: string
  positionDescription: string
  responsibilities: string[]
  qualifications: string[]
}
```

### 选调生 (`types/employment/selection/index.ts`)

```typescript
export interface SelectionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  selectionType?: string      // 定向选调/非定向选调/急需紧缺专业选调
  year?: string
  province?: string
  majorRequirement?: string
  universityRequirement?: string
  educationRequirement?: string // 本科/硕士/博士/本科及以上/硕士及以上
  degreeRequirement?: string
  politicalStatus?: string
  positionStatus?: string     // 报名中/笔试阶段/面试阶段/已结束/即将开始
  ageLimit?: number
}

export interface SelectionPositionListVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  majorRequirement: string
  universityRequirement: string
  educationRequirement: string
  degreeRequirement: string
  trainingDirection: string
  politicalStatus: string
  ageLimit: number
  recruitmentCount: number
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface SelectionPositionDetailVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  trainingDirection: string
  grassrootsServiceYears: string
  trainingPlan: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorCategories: string[]
  universityRequirement: string
  targetUniversities: string[]
  politicalStatus: string
  studentCadreRequirement: string
  awardsRequirement: string
  ageLimit: number
  recruitmentCount: number
  examSubjects: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  applyLink: string
  positionStatus: string
  remark: string
  contactPhone: string
  officialLink: string
  content: string
}
```

## 枚举映射

### 公务员
- `examType`: 国考/省考
- `regStatus`: 报名中(green)/已结束(gray)/即将开始(blue)

### 事业编
- `positionStatus`: 招聘中(green)/已结束(gray)
- `positionTag`: 热门(orange)/无/急招(red)

### 军队文职
- `positionStatus`: 进行中(green)/已结束(gray)

### 选调生
- `selectionType`: 定向选调/非定向选调/急需紧缺专业选调
- `positionStatus`: 报名中(green)/笔试阶段(blue)/面试阶段(purple)/已结束(gray)/即将开始(orange)
- `politicalStatus`: 中共党员/中共预备党员/共青团员/不限

## 统一搜索页改动

在 `jobs/index.vue` 的 `onCategoryTabClick` 中，为 4 个新模块添加跳转逻辑（同教师/医疗/金融）：

```typescript
if (value === '公务员') { router.push('/employment/civil'); return }
if (value === '事业编') { router.push('/employment/institution'); return }
if (value === '军队文职') { router.push('/employment/military'); return }
if (value === '选调生') { router.push('/employment/selection'); return }
```

## 列表页布局

每个 List.vue 包含：
1. 粘性头部（Logo + 海枫未来规划院 + 岗位搜索/个人中心/登录）
2. 返回"岗位搜索"按钮
3. 分类徽章 + 标题 + 描述
4. 关键字搜索栏 + 搜索按钮
5. 逐行 Element Plus 筛选器组件（el-select/el-cascader/el-input-number）
6. 结果计数 + 小型分页
7. 岗位卡片列表（v-loading 加载状态 + 空状态）
8. 底部大型分页
9. SiteFooter

### 筛选器交互方式

各模块筛选字段的组件类型如下：

| 模块 | 字段 | 组件类型 | 选项/说明 |
|------|------|---------|----------|
| 公务员 | `examCategory` | `<el-select>` 下拉 | 综合管理类/行政执法类/专业技术类/中央机关及其直属机构/省级及以下 |
| 公务员 | `positionCode` | `<input>` 文本 | 精确匹配职位代码 |
| 公务员 | `deptCode` | `<input>` 文本 | 精确匹配部门代码 |
| 事业编 | `examCategory` | `<el-select>` 下拉 | A类（综合管理类）/B类（社会科学专技类）/C类（自然科学专技类）/D类（中小学教师类）/E类（医疗卫生类） |
| 事业编 | `positionType` | `<el-select>` 下拉 | 管理岗位/专业技术岗位/工勤技能岗位 |
| 事业编 | `specialPosition` | `<el-select>` 下拉 | 无/退役士兵定向/基层项目定向/应届生专项/残疾人专项/其他 |
| 军队文职 | `positionType` | `<el-select>` 下拉 | 管理岗位/专业技术岗位/技能岗位 |
| 军队文职 | `workLocation` | `<el-cascader>` 级联 | 省/市两级，复用 `regionCascader` 数据源 |
| 选调生 | `year` | `<el-select>` 下拉 | 当前年 ~ 前5年 |
| 选调生 | `universityRequirement` | `<input>` 文本 | 模糊搜索 |

岗位卡片：统一使用 `group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl` 样式，右下角悬浮"查看详情"箭头。

## 详情页布局

每个 Detail.vue 使用 4-6 张卡片结构，模块专属字段分类展示：
1. **顶部概览卡片**：类型标签 + 状态标签 + 标题 + 关键信息 2×3 网格
2. **详细信息卡片**：模块专属字段分左右列
3. **考试/面试卡片**（如适用）
4. **报名信息卡片**：日期/电话/链接
5. **数组标签卡片**（如适用）：TEXT[] 字段渲染为 el-tag
6. **详细内容卡片**：v-html 渲染富文本

TEXT[] 数组字段（majorRequirements, responsibilities, qualifications, majorCategories, targetUniversities）统一使用 el-tag 标签组展示。

## 错误处理

- 列表请求失败：`ElMessage.error` 提示 + 置空列表
- 详情页加载失败：跳转 404 页面或显示空状态
- 认证拦截（跳转详情页时）：弹出 `ElMessageBox.confirm` → 存 redirectPath → 跳登录
