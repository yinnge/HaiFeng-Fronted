export interface CommunityListVO {
  id: string
  communityName: string
  positionName: string
  supervisingDept: string
  positionType: string
  province: string
  city: string
  positionStatus: string
  updatedAt: string
}

export interface CommunityDetailVO {
  id: string
  streetOffice: string
  communityName: string
  supervisingDept: string
  district: string
  positionName: string
  positionType: string
  employmentType: string
  province: string
  city: string
  workLocation: string
  educationRequirement: string
  ageLimit: number
  recruitmentCount: number
  majorRequirement: string
  householdRequirement: string
  politicalStatus: string
  workExperience: string
  socialWorkCert: string
  communityExperience: string
  residenceRequirement: string
  salaryRange: string
  salaryComposition: string
  benefits: string
  examContent: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  positionStatus: string
  applyLink: string
  applyMethod: string
  contactPhone: string
  contactAddress: string
  remark: string
  content: string
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CommunityQueryDTO {
  page: number
  size: number
  positionName?: string
  communityName?: string
  supervisingDept?: string
  positionType?: string
  province?: string
  city?: string
  positionStatus?: string
}

export interface CommunityUpdateDTO {
  streetOffice?: string
  communityName?: string
  supervisingDept?: string
  district?: string
  positionName?: string
  positionType?: string
  employmentType?: string
  province?: string
  city?: string
  workLocation?: string
  educationRequirement?: string
  ageLimit?: number
  recruitmentCount?: number
  majorRequirement?: string
  householdRequirement?: string
  politicalStatus?: string
  workExperience?: string
  socialWorkCert?: string
  communityExperience?: string
  residenceRequirement?: string
  salaryRange?: string
  salaryComposition?: string
  benefits?: string
  examContent?: string
  interviewForm?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  positionStatus?: string
  applyLink?: string
  applyMethod?: string
  contactPhone?: string
  contactAddress?: string
  remark?: string
  content?: string
  sortOrder?: number
}

export interface PositionStatusDTO {
  positionStatus: string
}
