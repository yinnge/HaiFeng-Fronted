export interface CivilListVO {
  id: string
  positionName: string
  examType: string
  recruitingDept: string
  minEducation: string
  workLocation: string
  regStartDate: string
  regEndDate: string
  regStatus: string
}

export interface CivilDetailVO {
  id: string
  positionName: string
  examType: string
  recruitingDept: string
  deptCode: string
  positionCode: string
  affiliatedBureau: string
  majorRequirement: string
  minEducation: string
  degreeRequirement: string
  politicalStatus: string
  workExperience: string
  grassrootsExperience: string
  examCategory: string
  interviewRatio: string
  recruitmentCount: number
  hasProfessionalTest: boolean
  workLocation: string
  workLocationDetail: string
  householdRequirement: string
  householdLocation: string
  positionIntro: string
  remark: string
  officialWebsite: string
  contactPhone: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CivilQueryDTO {
  page: number
  size: number
  positionName?: string
  recruitingDept?: string
  workLocation?: string
  examType?: string
  regStatus?: string
  minEducation?: string
}

export interface CivilAddDTO {
  positionName: string
  examType: string
  recruitingDept?: string
  deptCode?: string
  positionCode?: string
  affiliatedBureau?: string
  majorRequirement?: string
  minEducation?: string
  degreeRequirement?: string
  politicalStatus?: string
  workExperience?: string
  grassrootsExperience?: string
  examCategory?: string
  interviewRatio?: string
  recruitmentCount?: number
  hasProfessionalTest?: boolean
  workLocation?: string
  workLocationDetail?: string
  householdRequirement?: string
  householdLocation?: string
  positionIntro?: string
  remark?: string
  officialWebsite?: string
  contactPhone?: string
  regStartDate?: string
  regEndDate?: string
  regStatus?: string
  applicantCount?: number
  sortOrder?: number
}

export interface CivilUpdateDTO {
  positionName?: string
  examType?: string
  recruitingDept?: string
  deptCode?: string
  positionCode?: string
  affiliatedBureau?: string
  majorRequirement?: string
  minEducation?: string
  degreeRequirement?: string
  politicalStatus?: string
  workExperience?: string
  grassrootsExperience?: string
  examCategory?: string
  interviewRatio?: string
  recruitmentCount?: number
  hasProfessionalTest?: boolean
  workLocation?: string
  workLocationDetail?: string
  householdRequirement?: string
  householdLocation?: string
  positionIntro?: string
  remark?: string
  officialWebsite?: string
  contactPhone?: string
  regStartDate?: string
  regEndDate?: string
  regStatus?: string
  applicantCount?: number
  sortOrder?: number
}

export interface CivilStatusDTO {
  status: number
}
