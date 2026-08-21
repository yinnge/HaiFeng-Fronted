export interface CommunityQueryDTO {
  page?: number
  size?: number
  keyword?: string
  positionName?: string
  streetOffice?: string
  communityName?: string
  supervisingDept?: string
  positionType?: string
  employmentType?: string
  province?: string
  city?: string
  educationRequirement?: string
  majorRequirement?: string
  politicalStatus?: string
  workExperience?: string
  positionStatus?: string
  ageLimitMin?: number
  ageLimitMax?: number
}

export interface CommunityPositionListVO {
  id: string
  communityName: string
  district: string
  positionName: string
  educationRequirement: string
  majorRequirement: string
  positionType: string
  province: string
  city: string
  ageLimit: number
  recruitmentCount: number
  workExperience: string
  positionStatus: string
}

export interface CommunityPositionDetailVO {
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
}
