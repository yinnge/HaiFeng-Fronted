export interface InstitutionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  province?: string
  examCategory?: string
  positionType?: string
  educationRequirement?: string
  degreeRequirement?: string
  positionStatus?: string
  specialPosition?: string
  ageLimit?: number
}

export interface InstitutionPositionListVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  specialPosition: string
  positionStatus: string
}

export interface InstitutionPositionDetailVO {
  id: number
  positionName: string
  supervisingDept: string
  institution: string
  workLocation: string
  province: string
  examCategory: string
  positionType: string
  subCategory: string
  educationRequirement: string
  degreeRequirement: string
  ageLimit: number
  recruitmentCount: number
  salaryRange: string
  regDeadline: string
  majorRequirements: string[]
  specialPosition: string
  otherRequirement: string
  otherRequirementDesc: string
  remarkType: string
  remarkDesc: string
  consultationPhone: string
  supervisionPhone: string
  positionStatus: string
  positionTag: string
  tagText: string
}

export const InstitutionStatusLabel: Record<string, string> = {
  '招聘中': '招聘中',
  '已结束': '已结束',
}

export const InstitutionStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '招聘中': 'success',
  '已结束': 'danger',
}

export const InstitutionTagLabel: Record<string, string> = {
  '热门': '热门',
  '急招': '急招',
  '无': '',
}

export const InstitutionTagType: Record<string, 'danger' | 'warning' | ''> = {
  '热门': 'warning',
  '急招': 'danger',
  '无': '',
}
