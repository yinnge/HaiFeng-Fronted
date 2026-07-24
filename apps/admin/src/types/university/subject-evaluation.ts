export interface SubjectEvaluationListVO {
  id: string
  universityId: string
  universityName: string
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
  status: number
  createdAt: string
}

export interface SubjectEvaluationDetailVO extends SubjectEvaluationListVO {
  sortOrder: number
  updatedAt: string
}

export interface SubjectEvaluationQueryDTO {
  universityName?: string
  disciplineCode?: string
  disciplineName?: string
  evaluationRound?: string
  evaluationGrade?: string
  status?: number
  page: number
  size: number
}

export interface SubjectEvaluationAddDTO {
  universityId: string
  disciplineCode: string
  disciplineName: string
  evaluationRound: string
  evaluationGrade: string
  sortOrder?: number
}

export interface SubjectEvaluationUpdateDTO {
  disciplineCode?: string
  disciplineName?: string
  evaluationRound?: string
  evaluationGrade?: string
  sortOrder?: number
  status?: number
}

export const EVALUATION_GRADES = [
  'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'
] as const
