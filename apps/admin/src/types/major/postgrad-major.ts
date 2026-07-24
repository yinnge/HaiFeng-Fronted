export interface PostgradMajorListVO {
  id: string
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string | null
  difficulty: string | null
  status: number
  createdAt: string
}

export interface PostgradMajorDetailVO {
  id: string
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity: string | null
  difficulty: string | null
  brief: string | null
  introduction: string | null
  examSubjects: string[] | null
  admissionRequirements: string[] | null
  crossExamDifficulty: string | null
  crossExamDescription: string | null
  crossExamFactors: string[] | null
  status: number
  createdAt: string
  updatedAt: string
}

export interface PostgradMajorQueryDTO {
  majorName?: string
  degreeType?: string
  popularity?: string
  status?: number
  page: number
  size: number
}

export interface PostgradMajorAddDTO {
  majorName: string
  majorCode: string
  degreeType: string
  disciplineCategory: string
  popularity?: string
  difficulty?: string
  brief?: string
  introduction?: string
  examSubjects?: string[]
  admissionRequirements?: string[]
  crossExamDifficulty?: string
  crossExamDescription?: string
  crossExamFactors?: string[]
}

export interface PostgradMajorUpdateDTO {
  majorName?: string
  majorCode?: string
  degreeType?: string
  disciplineCategory?: string
  popularity?: string
  difficulty?: string
  brief?: string
  introduction?: string
  examSubjects?: string[]
  admissionRequirements?: string[]
  crossExamDifficulty?: string
  crossExamDescription?: string
  crossExamFactors?: string[]
}
