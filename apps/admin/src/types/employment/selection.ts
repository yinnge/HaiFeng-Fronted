export interface SelectionListVO {
  id: string
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  politicalStatus: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface SelectionDetailVO {
  id: string
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  trainingDirection: string
  grassrootsServiceYears: string
  trainingPlan: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorCategories: string[]
  universityRequirement: string
  targetUniversities: string[]
  politicalStatus: string
  studentCadreRequirement: string
  awardsRequirement: string
  ageLimit: number
  recruitmentCount: number
  examSubjects: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  applyLink: string
  positionStatus: string
  remark: string
  contactPhone: string
  officialLink: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface SelectionQueryDTO {
  page: number
  size: number
  positionName?: string
  targetUnit?: string
  organizingDept?: string
  selectionType?: string
  year?: string
  province?: string
  politicalStatus?: string
  positionStatus?: string
}

export interface SelectionAddDTO {
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept?: string
  targetUnit?: string
  workLocation?: string
  trainingDirection?: string
  grassrootsServiceYears?: string
  trainingPlan?: string
  educationRequirement: string
  degreeRequirement?: string
  majorRequirement?: string
  majorCategories?: string[]
  universityRequirement?: string
  targetUniversities?: string[]
  politicalStatus?: string
  studentCadreRequirement?: string
  awardsRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  examSubjects?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  applyLink?: string
  positionStatus?: string
  remark?: string
  contactPhone?: string
  officialLink?: string
  content?: string
  sortOrder?: number
}

export interface SelectionUpdateDTO {
  positionName?: string
  selectionType?: string
  year?: string
  province?: string
  organizingDept?: string
  targetUnit?: string
  workLocation?: string
  trainingDirection?: string
  grassrootsServiceYears?: string
  trainingPlan?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  majorCategories?: string[]
  universityRequirement?: string
  targetUniversities?: string[]
  politicalStatus?: string
  studentCadreRequirement?: string
  awardsRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  examSubjects?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  applyLink?: string
  positionStatus?: string
  remark?: string
  contactPhone?: string
  officialLink?: string
  content?: string
  sortOrder?: number
}

export interface SelectionStatusDTO {
  positionStatus: string
}
