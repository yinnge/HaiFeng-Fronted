export interface WelfareListVO {
  id: string
  developingUnit: string
  employingUnit: string
  positionName: string
  positionCategory: string
  province: string
  city: string
  district: string
  monthlySalary: string
  regStartDate: string
  regEndDate: string
  positionStatus: string
  updatedAt: string
}

export interface WelfareDetailVO {
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
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface WelfareQueryDTO {
  page: number
  size: number
  positionName?: string
  developingUnit?: string
  employingUnit?: string
  positionCategory?: string
  province?: string
  city?: string
  district?: string
  maxServiceYears?: number
  positionStatus?: string
}

export interface WelfareUpdateDTO {
  developingUnit?: string
  employingUnit?: string
  positionName?: string
  positionCategory?: string
  workContent?: string
  province?: string
  city?: string
  district?: string
  workLocation?: string
  targetGroup?: string[]
  educationRequirement?: string
  ageRange?: string
  healthRequirement?: string
  recruitmentCount?: number
  householdRequirement?: string
  employmentDifficultyCert?: boolean
  otherRequirement?: string
  contractPeriod?: string
  isRenewable?: boolean
  maxServiceYears?: number
  monthlySalary?: string
  salarySource?: string
  subsidyStandard?: string
  socialInsuranceInfo?: string
  otherBenefits?: string
  workSchedule?: string
  isShiftWork?: boolean
  regStartDate?: string
  regEndDate?: string
  applyMethod?: string
  applyAddress?: string
  requiredDocuments?: string
  positionStatus?: string
  contactPhone?: string
  contactPerson?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface WelfareAddDTO {
  developingUnit?: string
  employingUnit?: string
  positionName?: string
  positionCategory?: string
  workContent?: string
  province?: string
  city?: string
  district?: string
  workLocation?: string
  targetGroup?: string[]
  educationRequirement?: string
  ageRange?: string
  healthRequirement?: string
  recruitmentCount?: number
  householdRequirement?: string
  employmentDifficultyCert?: boolean
  otherRequirement?: string
  contractPeriod?: string
  isRenewable?: boolean
  maxServiceYears?: number
  monthlySalary?: string
  salarySource?: string
  subsidyStandard?: string
  socialInsuranceInfo?: string
  otherBenefits?: string
  workSchedule?: string
  isShiftWork?: boolean
  regStartDate?: string
  regEndDate?: string
  applyMethod?: string
  applyAddress?: string
  requiredDocuments?: string
  positionStatus?: string
  contactPhone?: string
  contactPerson?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
