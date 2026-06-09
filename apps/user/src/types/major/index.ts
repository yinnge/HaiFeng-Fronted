import type { BasePageQuery } from '@haifeng/shared'

export interface MajorListVO {
  id: number
  majorCode: string
  majorName: string
  disciplineName: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
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
}

export interface MajorRankingQueryDTO extends BasePageQuery {
  name?: string
  majorCategory?: string
  sortBy?: 'employmentRate' | 'salaryMin' | 'salaryMax'
  sortOrder?: 'asc' | 'desc'
}
