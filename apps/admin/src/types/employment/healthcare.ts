export interface HealthcareListVO {
  id: string
  institutionName: string
  institutionType: string
  institutionLevel: string
  institutionNature: string
  positionName: string
  positionCategory: string
  department: string
  recruitmentType: string
  province: string
  city: string
  district: string
  positionStatus: string
  updatedAt: string
}

export interface HealthcareDetailVO {
  id: string
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
  researchRequirement: string
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
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface HealthcareQueryDTO {
  page: number
  size: number
  institutionName?: string
  positionName?: string
  institutionNature?: string
  department?: string
  province?: string
  city?: string
  district?: string
  positionStatus?: string
}

export interface HealthcareUpdateDTO {
  institutionName?: string
  institutionType?: string
  institutionLevel?: string
  institutionNature?: string
  positionName?: string
  department?: string
  positionCategory?: string
  recruitmentType?: string
  province?: string
  city?: string
  district?: string
  educationRequirement?: string
  degreeRequirement?: string
  majorRequirement?: string
  workExperience?: string
  licenseRequirement?: string
  titleRequirement?: string
  internshipRequirement?: string
  researchRequirement?: string
  salaryRange?: string
  housingSubsidy?: string
  benefits?: string
  examContent?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  applyLink?: string
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
