export interface GrassrootsQueryDTO {
  page?: number
  size?: number
  positionName?: string
  organizingDept?: string
  serviceUnit?: string
  projectType?: string
  year?: string
  serviceType?: string
  province?: string
  city?: string
  county?: string
  educationRequirement?: string
  majorRequirement?: string
  gradYearRequirement?: string
  politicalStatus?: string
  positionStatus?: string
  ageLimitMin?: number
  ageLimitMax?: number
}

export interface GrassrootsPositionListVO {
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
  educationRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  politicalStatus: string
  positionStatus: string
  regStartDate: string
  regEndDate: string
}

export interface GrassrootsPositionDetailVO {
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
  otherRequirement: string
  politicalStatus: string
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
}
