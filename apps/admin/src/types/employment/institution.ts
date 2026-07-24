export interface InstitutionListVO {
  id: string
  positionName: string
  supervisingDept: string
  institution: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  salaryRange: string
  positionStatus: string
}

export interface InstitutionDetailVO {
  id: string
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  educationRequirement: string
  degreeRequirement: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  majorRequirements: string[]
  specialPosition: string
  otherRequirement: string
  otherRequirementDesc: string
  remarkType: string
  remarkDesc: string
  consultationPhone: string
  supervisionPhone: string
  positionStatus: string
  positionTag: string
  tagText: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface InstitutionQueryDTO {
  page: number
  size: number
  positionName?: string
  supervisingDept?: string
  institution?: string
  province?: string
  examCategory?: string
  positionType?: string
  positionStatus?: string
}

export interface InstitutionUpdateDTO {
  positionName?: string
  supervisingDept?: string
  institution?: string
  workLocation?: string
  province?: string
  examCategory?: string
  positionType?: string
  subCategory?: string
  educationRequirement?: string
  degreeRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  salaryRange?: string
  regDeadline?: string
  majorRequirements?: string[]
  specialPosition?: string
  otherRequirement?: string
  otherRequirementDesc?: string
  remarkType?: string
  remarkDesc?: string
  consultationPhone?: string
  supervisionPhone?: string
  positionStatus?: string
  positionTag?: string
  tagText?: string
  sortOrder?: number
}

export interface InstitutionStatusDTO {
  status: number
}
