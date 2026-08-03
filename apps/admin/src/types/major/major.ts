export interface MajorListVO {
  id: string
  majorCode: string
  majorName: string
  disciplineName: string | null
  majorType: string
  majorCategory: string | null
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
  employmentRate: number | null
  salaryMin: number | null
  salaryMax: number | null
  description: string | null
  status: number
  createdAt: string
  updatedAt: string
  detailId: string | null
  courseCount: number | null
  graduateScale: string | null
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
  employmentRate?: number
  salaryMin?: number
  salaryMax?: number
  description?: string
}

export interface MajorUpdateDTO {
  majorCode?: string
  majorName?: string
  majorType?: string
  disciplineName?: string
  majorCategory?: string
  parentCategory?: string
  majorTags?: string
  degreeAwarded?: string
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
