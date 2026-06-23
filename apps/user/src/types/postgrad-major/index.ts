import type { BasePageQuery } from '@haifeng/shared'

export interface PostgradMajorListVO {
  id: number
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string
  difficulty: string
  brief: string
  examSubjects: string[]
}

export interface PostgradMajorDetailVO {
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string
  difficulty: string
  introduction: string
  examSubjects: string[]
  admissionRequirements: string[]
  crossExamDifficulty: string
  crossExamDescription: string
  crossExamFactors: string[]
}

export interface PostgradMajorQueryDTO extends BasePageQuery {
  name?: string
  code?: string
  degreeType?: string
  disciplineCategory?: string
  popularity?: string
  difficulty?: string
}

export interface PostgradMajorBriefVO {
  id: number
  majorName: string
  degreeType: string
}

export interface UniversityBriefForPostgradVO {
  id: number
  name: string
  category: string
}

export interface PostgradMajorDirectionBriefVO {
  id: number
  postgradMajorName: string
}
