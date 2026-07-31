export interface GrassrootsListVO {
  id: string
  projectType: string
  year: string
  positionName: string
  serviceType: string
  organizingDept: string
  serviceUnit: string
  province: string
  city: string
  county: string
  positionStatus: string
  updatedAt: string
}

export interface GrassrootsDetailVO {
  id: string
  projectType: string
  year: string
  positionName: string
  serviceType: string
  organizingDept: string
  serviceUnit: string
  province: string
  city: string
  county: string
  township: string
  servicePeriod: string
  serviceStartDate: string
  serviceEndDate: string
  educationRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  gradYearRequirement: string
  householdRequirement: string
  politicalStatus: string
  otherRequirement: string
  examContent: string
  examTime: string
  interviewForm: string
  monthlySubsidy: string
  socialInsurance: string
  housingInfo: string
  otherBenefits: string
  afterServicePolicy: string
  canTransferToCivil: boolean
  canTransferToInstitution: boolean
  examBonusPoints: string
  tuitionCompensation: string
  postgradBonus: string
  regStartDate: string
  regEndDate: string
  applyLink: string
  positionStatus: string
  contactPhone: string
  remark: string
  content: string
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface GrassrootsQueryDTO {
  page: number
  size: number
  positionName?: string
  organizingDept?: string
  serviceUnit?: string
  projectType?: string
  year?: string
  serviceType?: string
  province?: string
  city?: string
  county?: string
  positionStatus?: string
}

export interface GrassrootsUpdateDTO {
  projectType?: string
  year?: string
  positionName?: string
  serviceType?: string
  organizingDept?: string
  serviceUnit?: string
  province?: string
  city?: string
  county?: string
  township?: string
  servicePeriod?: string
  serviceStartDate?: string
  serviceEndDate?: string
  educationRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  gradYearRequirement?: string
  householdRequirement?: string
  politicalStatus?: string
  otherRequirement?: string
  examContent?: string
  examTime?: string
  interviewForm?: string
  monthlySubsidy?: string
  socialInsurance?: string
  housingInfo?: string
  otherBenefits?: string
  afterServicePolicy?: string
  canTransferToCivil?: boolean
  canTransferToInstitution?: boolean
  examBonusPoints?: string
  tuitionCompensation?: string
  postgradBonus?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactPhone?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface GrassrootsAddDTO {
  projectType?: string
  year?: string
  positionName?: string
  serviceType?: string
  organizingDept?: string
  serviceUnit?: string
  province?: string
  city?: string
  county?: string
  township?: string
  servicePeriod?: string
  serviceStartDate?: string
  serviceEndDate?: string
  educationRequirement?: string
  majorRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  gradYearRequirement?: string
  householdRequirement?: string
  politicalStatus?: string
  otherRequirement?: string
  examContent?: string
  examTime?: string
  interviewForm?: string
  monthlySubsidy?: string
  socialInsurance?: string
  housingInfo?: string
  otherBenefits?: string
  afterServicePolicy?: string
  canTransferToCivil?: boolean
  canTransferToInstitution?: boolean
  examBonusPoints?: string
  tuitionCompensation?: string
  postgradBonus?: string
  regStartDate?: string
  regEndDate?: string
  applyLink?: string
  positionStatus?: string
  contactPhone?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
