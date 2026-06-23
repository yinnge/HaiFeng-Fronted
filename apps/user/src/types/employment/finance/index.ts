export interface FinanceQueryDTO {
  page?: number
  size?: number
  keyword?: string
  institutionCategory?: string
  institutionType?: string
  branchName?: string
  positionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  ageLimit?: number
  salaryMin?: number
  positionStatus?: string
}

export interface FinancePositionListVO {
  id: number
  institutionName: string
  institutionCategory: string
  positionName: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  ageLimit: number
  workExperience: string
  salaryMin: number
  salaryMax: number
  regStartDate: string
  regEndDate: string
  isRemote: boolean
  workLocation: string
  recruitmentCount: number
  positionStatus: string
}

export interface FinancePositionDetailVO {
  id: number
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
}
