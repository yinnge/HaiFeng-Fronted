export interface WelfareQueryDTO {
  page?: number
  size?: number
  keyword?: string
  positionName?: string
  developingUnit?: string
  employingUnit?: string
  positionCategory?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  householdRequirement?: string
  maxServiceYears?: number
  positionStatus?: string
  targetGroup?: string
  ageRangeMin?: number
  ageRangeMax?: number
}

export interface WelfarePositionListVO {
  id: string
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  province: string
  city: string
  district: string
  educationRequirement: string
  recruitmentCount: number
  monthlySalary: string
  contractPeriod: string
  maxServiceYears: number
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface WelfarePositionDetailVO {
  id: string
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  workContent: string
  province: string
  city: string
  district: string
  workLocation: string
  targetGroup: string[]
  educationRequirement: string
  ageRange: string
  healthRequirement: string
  recruitmentCount: number
  householdRequirement: string
  employmentDifficultyCert: boolean
  otherRequirement: string
  contractPeriod: string
  isRenewable: boolean
  maxServiceYears: number
  monthlySalary: string
  salarySource: string
  subsidyStandard: string
  socialInsuranceInfo: string
  otherBenefits: string
  workSchedule: string
  isShiftWork: boolean
  regStartDate: string
  regEndDate: string
  applyMethod: string
  applyAddress: string
  requiredDocuments: string
  positionStatus: string
  contactPhone: string
  contactPerson: string
  remark: string
  content: string
}
