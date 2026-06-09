# 院校详情子页面设计文档

## 概述

在院校详情页（Detail.vue）底部追加 Tab 导航区，包含"重点实验室"、"院系"、"学科评估"三个子模块。点击实验室/院系跳转到独立详情页。

## 组件结构

```
apps/user/src/
├── views/university/
│   ├── Detail.vue                           # 已有，底部追加 Tab 导航区
│   ├── LaboratoryDetail.vue                 # 新增 - 实验室详情页
│   └── DepartmentDetail.vue                 # 新增 - 院系分析报告页
│
├── components/university/
│   ├── LaboratoryTab.vue                    # 新增 - 重点实验室 Tab 组件
│   ├── DepartmentTab.vue                    # 新增 - 院系 Tab 组件
│   └── SubjectEvaluationTab.vue             # 新增 - 学科评估 Tab 组件
│
├── api/university/
│   ├── index.ts                             # 已有
│   ├── laboratory.ts                        # 新增 - 实验室 API
│   ├── department.ts                        # 新增 - 院系 API
│   └── subject-evaluation.ts                # 新增 - 学科评估 API
│
└── types/university/
    ├── index.ts                             # 已有
    ├── laboratory.ts                        # 新增 - 实验室类型
    ├── department.ts                        # 新增 - 院系类型
    └── subject-evaluation.ts                # 新增 - 学科评估类型
```

## 路由设计

```ts
// 已有
/university/:id                             → Detail.vue

// 新增
/university/laboratory/:labId               → LaboratoryDetail.vue
/university/departments/:deptId              → DepartmentDetail.vue
```

## Detail.vue 修改

在现有内容（介绍 section）之后、"查看适应指南"按钮之前，追加 Tab 导航区：

```vue
<!-- Tab 导航栏（卡片式按钮，与 Guide.vue 风格一致） -->
<section class="grid grid-cols-3 gap-4 mb-8">
  <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
    :class="activeTab === tab.key ? 'bg-orange-500 text-white' : 'bg-white'">
    {{ tab.label }}
  </button>
</section>

<!-- Tab 内容区 -->
<section v-if="activeTab === 'laboratory'">
  <LaboratoryTab :university-id="id" />
</section>
<section v-else-if="activeTab === 'department'">
  <DepartmentTab :university-id="id" />
</section>
<section v-else-if="activeTab === 'evaluation'">
  <SubjectEvaluationTab :university-id="id" />
</section>
```

## 1. 重点实验室 Tab（LaboratoryTab.vue）

### API
- `GET /api/v1/app/university/{universityId}/laboratories`（分页）

### 交互
- 二级标签过滤器：从返回数据中提取不重复的 `labType`，动态生成标签
- 默认选中第一个，下方只展示该类型的实验室
- 卡片显示 `name` + `labType`，点击跳转实验室详情
- 分页：10/20/30/50/100

### 类型定义

```typescript
interface LaboratoryListVO {
  id: number
  name: string
  labType: string
}
```

## 2. 院系 Tab（DepartmentTab.vue）

### API
- `GET /api/v1/app/university/{universityId}/departments`（分页）

### 交互
- 二级标签过滤器：从返回数据中提取不重复的 `departmentType`，动态生成
- 默认选中第一个，下方只展示该类型的院系
- 卡片显示 `departmentName` + `departmentType`，点击跳转院系详情
- 分页：10/20/30/50/100

### 类型定义

```typescript
interface DepartmentListVO {
  id: number
  departmentName: string
  departmentType: string
}
```

## 3. 学科评估 Tab（SubjectEvaluationTab.vue）

### API
- `GET /api/v1/app/university/{universityId}/subject-evaluations/grade-stats`（等级统计）
- `GET /api/v1/app/university/{universityId}/subject-evaluations`（明细分页）

### 交互
- 上方一排 9 个等级卡片（A+ / A / A- / B+ / B / B- / C+ / C / C-），每张显示等级名 + 数量
- 默认选中第一个非 0 的等级，点击切换下方明细列表
- 明细列表：学科代码、学科名称、评估轮次、评估等级
- 分页：10/20/30/50/100

### 类型定义

```typescript
interface GradeStatVO {
  grade: string       // A+, A, A-, B+, B, B-, C+, C, C-
  count: number
}

interface SubjectEvaluationVO {
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
}
```

## 4. 实验室详情页（LaboratoryDetail.vue）

### API
- `GET /api/v1/app/university/laboratories/{labId}`

### 页面布局（从上到下）

1. **顶部导航**：← 返回院校详情 | 实验室名称
2. **基本信息卡片**：类型、成立、地区、主管部门、主任、人员、学生、邮箱、电话
3. **研究方向 / 研究介绍 / 实验室空间 / 开放课题 / 合作交流 / 访问学者**：各文本块
4. **核心团队**：表格 — 成员姓名、职务、岗位角色
5. **统计数据**：标签 — 数量

### 类型定义

```typescript
interface LaboratoryDetailVO {
  universityName: string
  labType: string
  establishedYear: string
  region: string
  department: string
  director: string
  staffCount: string
  studentCount: string
  email: string
  phone: string
  introduction: string
  researchDescription: string
  labSpace: string
  openTopics: string
  cooperation: string
  visitingScholars: string
  researchFields: string[]
  statistics: { label: string; count: number }[]     // JSONB
  majorEquipment: string[]
  coreTeam: { memberName: string; position: string; role: string }[]  // JSONB
}
```

## 5. 院系详情页（DepartmentDetail.vue）

### API
- `GET /api/v1/app/university/departments/{departmentId}/report`

### 页面布局（长报告风格，从上到下）

1. **顶部导航**：← 返回院校详情 | 院系名称 + 副标题
2. **院系概述（overview）**：标题 + 描述列表
3. **专业组成（majorCompose）**：学科名称 + 进度条占比
4. **专业详情（subjectsDetail）**：卡片列表 — 专业名称、标签、核心学科、核心课程、培养能力、推荐证书
5. **城市薪资（citySalary）**：城市 — 薪资范围表格
6. **专业薪资（salary）**：专业 — 薪资范围表格
7. **就业前景（prospects）**：6 项指标标签（就业率、起薪、深造率、500强、增长率、海外深造）
8. **就业趋势（trends）**：高速增长赛道、核心政策导向、就业环境分析
9. **考研方向（postgraduate）**：标题 + 方向列表
10. **职业路径（career）**：路径卡片 — 阶段、年限、职位、薪资范围
11. **免责声明（disclaimer）**：文本、更新时间、版本、编制单位

### JSONB 结构完整定义

```typescript
interface DepartmentReportVO {
  subtitle: string
  overview: {
    title: string
    descriptions: string[]
  }
  subjectsDetail: {
    majorName: string
    tags: string[]
    coreSubject: string
    supportSubject: string
    positioning: string
    coreCourses: string[]
    abilities: string[]
    certificates: string[]
  }[]
  postgraduate: {
    title: string
    directions: string[]
  }
  citySalary: {
    cityName: string
    minSalary: number
    maxSalary: number
  }[]
  salary: {
    majorName: string
    minSalary: number
    maxSalary: number
  }[]
  career: {
    pathTitle: string
    pathDesc: string
    stages: {
      stageTitle: string
      workYears: string
      position: string
      coreGoal: string
      salaryRange: string
    }[]
  }[]
  trends: {
    highGrowthTracks: string[]
    policyOrientations: string[]
    environmentAnalysis: string[]
  }
  prospects: {
    employmentRate: string
    masterSalary: string
    furtherStudyRate: string
    fortune500Rate: string
    salaryGrowthRate: string
    overseasRate: string
  }
  disclaimer: {
    text: string
    updateTime: string
    version: string
    compileUnit: string
  }
  majorCompose: {
    subjectName: string
    percentage: number
  }[]
}
```

## 样式规范

- 延续现有风格（Tailwind + 圆角阴影 + 橙色调）
- Tab 按钮：与 Guide.vue 一致的卡片式按钮（bg-white shadow-md hover:shadow-lg）
- 激活态：bg-gradient-to-r from-orange-500 to-amber-500 text-white
- 内容区卡片：rounded-2xl bg-white p-6 shadow-lg border border-gray-100
- 分页器：el-pagination background layout="prev, pager, next"
