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
