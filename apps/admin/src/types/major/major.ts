export interface MajorListVO {
  id: string
  majorCode: string
  majorName: string
  disciplineName: string | null
  majorType: string
  majorCategory: string | null
  studyDuration: string | null
  status: number
  createdAt: string
}

export interface MajorDetailVO {
  id: string
  majorCode: string
  majorName: string
  disciplineName: string | null
  majorType: string
  majorCategory: string | null
  parentCategory: string | null
  majorTags: string | null
  degreeAwarded: string | null
  studyDuration: string | null
  employmentRate: number | null
  salaryMin: number | null
  salaryMax: number | null
  description: string | null
  status: number
  createdAt: string
  updatedAt: string
  detailId: string | null
  courseCount: number | null
  /** 后端 VO 声明为 Integer（写入 DTO 是 String），故这里两种都兼容 */
  graduateScale: string | number | null
  maleRatio: number | null
  femaleRatio: number | null
  majorDescription: string | null
  trainingObjective: string | null
  trainingRequirement: string | null
  subjectRequirement: string | null
  careerProspect: string | null
  mainCourses: string[] | null
  knowledgeSkills: string[] | null
}

export interface MajorQueryDTO {
  majorCode?: string
  majorName?: string
  majorType?: string
  status?: number
  page: number
  size: number
}

export interface MajorAddDTO {
  majorCode: string
  majorName: string
  majorType: string
  disciplineName?: string
  majorCategory?: string
  parentCategory?: string
  majorTags?: string
  degreeAwarded?: string
  studyDuration?: string
  employmentRate?: number
  salaryMin?: number
  salaryMax?: number
  description?: string
}

/** 注意：后端 MajorUpdateDTO 没有 majorCode 字段（专业代码不可修改），前端不要下发 */
export interface MajorUpdateDTO {
  majorName?: string
  majorType?: string
  disciplineName?: string
  majorCategory?: string
  parentCategory?: string
  majorTags?: string
  degreeAwarded?: string
  studyDuration?: string
  employmentRate?: number
  salaryMin?: number
  salaryMax?: number
  description?: string
}

export interface MajorDetailUpdateDTO {
  courseCount?: number
  graduateScale?: string
  maleRatio?: number
  femaleRatio?: number
  majorDescription?: string
  trainingObjective?: string
  trainingRequirement?: string
  subjectRequirement?: string
  careerProspect?: string
  mainCourses?: string[]
  knowledgeSkills?: string[]
}
