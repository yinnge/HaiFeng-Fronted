export interface FinanceListVO {
  id: string
  institutionName: string
  institutionCategory: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  positionStatus: string
  updatedAt: string
}

export interface FinanceDetailVO {
  id: string
  institutionName: string
  institutionCategory: string
  institutionType: string
  institutionLogo: string
  branchName: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  workLocation: string
  isRemote: boolean
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorPreference: string[]
  ageLimit: number
  workExperience: string
  recruitmentCount: number
  certRequirements: string[]
  languageRequirement: string
  computerRequirement: string
  otherRequirement: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  benefits: string
  examContent: string
  examTime: string
  interviewRounds: string
  regStartDate: string
  regEndDate: string
  applyLink: string
  positionStatus: string
  contactInfo: string
  remark: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface FinanceQueryDTO {
  page: number
  size: number
  institutionName?: string
  positionName?: string
  institutionCategory?: string
  institutionType?: string
  province?: string
  city?: string
  positionStatus?: string
}

export interface FinanceAddDTO {
  institutionName: string
  institutionCategory: string
  institutionType?: string
  institutionLogo?: string
  branchName?: string
  positionName: string
  positionCategory?: string
  recruitmentType: string
  province?: string
  city?: string
  workLocation?: string
  isRemote?: boolean
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  majorPreference?: string[]
  ageLimit?: number
  workExperience?: string
  recruitmentCount?: number
  certRequirements?: string[]
  languageRequirement?: string
  computerRequirement?: string
  otherRequirement?: string
  salaryMin?: number
  salaryMax?: number
  salaryText?: string
  benefits?: string
  examContent?: string
  examTime?: string
  interviewRounds?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactInfo?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface FinanceUpdateDTO {
  institutionName?: string
  institutionCategory?: string
  institutionType?: string
  institutionLogo?: string
  branchName?: string
  positionName?: string
  positionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  workLocation?: string
  isRemote?: boolean
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  majorPreference?: string[]
  ageLimit?: number
  workExperience?: string
  recruitmentCount?: number
  certRequirements?: string[]
  languageRequirement?: string
  computerRequirement?: string
  otherRequirement?: string
  salaryMin?: number
  salaryMax?: number
  salaryText?: string
  benefits?: string
  examContent?: string
  examTime?: string
  interviewRounds?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactInfo?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
