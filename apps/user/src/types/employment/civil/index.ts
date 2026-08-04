export interface CivilPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  examType?: string
  positionCode?: string
  deptCode?: string
  minEducation?: string
  majorRequirement?: string
  degreeRequirement?: string
  politicalStatus?: string
  examCategory?: string
  regStatus?: string
}

export interface CivilPositionListVO {
  id: string
  positionName: string
  examType: string
  recruitingDept: string
  minEducation: string
  majorRequirement: string
  degreeRequirement: string
  politicalStatus: string
  examCategory: string
  workLocation: string
  regStartDate: string
  regEndDate: string
  regStatus: string
  applicantCount: number
}

export interface CivilPositionDetailVO {
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
}

export const CivilExamTypeLabel: Record<string, string> = {
  '国考': '国考',
  '省考': '省考',
}

export const CivilRegStatusLabel: Record<string, string> = {
  '报名中': '报名中',
  '已结束': '已结束',
  '即将开始': '即将开始',
}

export const CivilRegStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '报名中': 'success',
  '已结束': 'danger',
  '即将开始': 'warning',
}
