export interface HealthcareQueryDTO {
  page?: number
  size?: number
  keyword?: string
  institutionType?: string
  institutionLevel?: string
  institutionNature?: string
  positionCategory?: string
  department?: string
  province?: string
  city?: string
  district?: string
  ageLimit?: number
  positionStatus?: string
}

export interface HealthcarePositionListVO {
  id: number
  institutionName: string
  institutionLevel: string
  positionName: string
  department: string
  positionCategory: string
  province: string
  city: string
  district: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  workExperience: string
  positionStatus: string
}

export interface HealthcarePositionDetailVO {
  id: number
  institutionName: string
  institutionType: string
  institutionLevel: string
  institutionNature: string
  positionName: string
  department: string
  positionCategory: string
  recruitmentType: string
  province: string
  city: string
  district: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  ageLimit: number
  recruitmentCount: number
  workExperience: string
  licenseRequirement: string
  titleRequirement: string
  internshipRequirement: string
  researchRequirement: string | null
  salaryRange: string
  benefits: string
  housingSubsidy: string
  regStartDate: string
  regEndDate: string
  examTime: string
  examContent: string
  applyLink: string
  positionStatus: string
  contactPhone: string
  contactPerson: string
  remark: string
  content: string
}
