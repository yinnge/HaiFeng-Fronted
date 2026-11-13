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
  /**
   * 收藏过滤（可选）：仅返回命中的考研专业 id，与其它筛选 AND 叠加（对应后端 BasePageQueryDTO.ids）。
   * 逗号分隔的 id 字符串（Spring 自动拆分绑定 List<Long>）；后端上限 200 个。
   */
  ids?: string
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
