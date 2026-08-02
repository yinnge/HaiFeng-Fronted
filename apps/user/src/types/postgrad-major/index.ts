import type { BasePageQuery } from '@haifeng/shared'

export interface PostgradMajorListVO {
  id: string
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
  id: string
  majorName: string
  degreeType: string
}

export interface UniversityBriefForPostgradVO {
  id: string
  name: string
  category: string
}

export interface PostgradMajorDirectionBriefVO {
  id: string
  postgradMajorName: string
  category?: string
}
