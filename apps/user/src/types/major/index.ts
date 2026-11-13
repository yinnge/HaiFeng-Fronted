import type { BasePageQuery } from '@haifeng/shared'

export interface MajorListVO {
  id: string
  majorCode: string
  majorName: string
  disciplineName: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
  studyDuration?: string
  employmentRate: number
  salaryMin: number
  salaryMax: number
  description: string
}

export interface MajorDetailVO {
  majorName: string
  majorCode: string
  disciplineName: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
  employmentRate: number
  salaryMin: number
  salaryMax: number
  description: string
  courseCount: number
  graduateScale: string
  maleRatio: number
  femaleRatio: number
  majorDescription: string
  trainingObjective: string
  trainingRequirement: string
  subjectRequirement: string
  careerProspect: string
  mainCourses: string[]
  knowledgeSkills: string[]
  /** 学制：后端当前未返回，Hero 有值才渲染（DESIGN.md §1 预留项） */
  studyYears?: string
}

export interface MajorCategoryStatVO {
  majorCategory: string
  count: number
}

export interface MajorQueryDTO extends BasePageQuery {
  name?: string
  code?: string
  majorType?: string
  majorCategory?: string
  /** 授予学位：精准匹配（eq），与其它条件 AND；空值不过滤。候选值来自 /degree-awarded/options */
  degreeAwarded?: string
  /** 排序字段：综合(comprehensive, 默认) / 就业率(employmentRate) / 薪资水平(salaryMax) / 热度(sortOrder) */
  sortBy?: 'comprehensive' | 'employmentRate' | 'salaryMax' | 'sortOrder'
  sortOrder?: 'asc' | 'desc'
  /** 就业率下限（百分比，例如 80 表示 80%） */
  employmentRateMin?: number
  /** 就业率上限（百分比） */
  employmentRateMax?: number
  /** 月薪下限（元/月） */
  salaryMin?: number
  /** 月薪上限（元/月） */
  salaryMax?: number
  /**
   * 收藏过滤（可选）：仅返回命中的专业 id，与其它筛选 AND 叠加（对应后端 BasePageQueryDTO.ids）。
   * 逗号分隔的 id 字符串（Spring 自动拆分绑定 List<Long>）；后端上限 200 个。
   */
  ids?: string
}

export interface MajorRankingQueryDTO extends BasePageQuery {
  name?: string
  majorCategory?: string
  sortBy?: 'employmentRate' | 'salaryMin' | 'salaryMax'
  sortOrder?: 'asc' | 'desc'
}

export interface UndergraduateMajorDirectionBriefVO {
  id: string
  majorName: string
  category?: string
}
