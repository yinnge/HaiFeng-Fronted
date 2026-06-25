export interface SelectionPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  selectionType?: string
  year?: string
  province?: string
  majorRequirement?: string
  universityRequirement?: string
  educationRequirement?: string
  degreeRequirement?: string
  politicalStatus?: string
  positionStatus?: string
  ageLimit?: number
}

export interface SelectionPositionListVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  majorRequirement: string
  universityRequirement: string
  educationRequirement: string
  degreeRequirement: string
  trainingDirection: string
  politicalStatus: string
  ageLimit: number
  recruitmentCount: number
  regStartDate: string
  regEndDate: string
  positionStatus: string
}

export interface SelectionPositionDetailVO {
  id: number
  positionName: string
  selectionType: string
  year: string
  province: string
  organizingDept: string
  targetUnit: string
  workLocation: string
  trainingDirection: string
  grassrootsServiceYears: string
  trainingPlan: string
  educationRequirement: string
  degreeRequirement: string
  majorRequirement: string
  majorCategories: string[]
  universityRequirement: string
  targetUniversities: string[]
  politicalStatus: string
  studentCadreRequirement: string
  awardsRequirement: string
  ageLimit: number
  recruitmentCount: number
  examSubjects: string
  interviewForm: string
  regStartDate: string
  regEndDate: string
  examTime: string
  applyLink: string
  positionStatus: string
  remark: string
  contactPhone: string
  officialLink: string
  content: string
}

export const SelectionTypeLabel: Record<string, string> = {
  '定向选调': '定向选调',
  '非定向选调': '非定向选调',
  '急需紧缺专业选调': '急需紧缺专业选调',
}

export const SelectionStatusLabel: Record<string, string> = {
  '报名中': '报名中',
  '笔试阶段': '笔试阶段',
  '面试阶段': '面试阶段',
  '已结束': '已结束',
  '即将开始': '即将开始',
}

export const SelectionStatusTag: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'primary'> = {
  '报名中': 'success',
  '笔试阶段': 'primary',
  '面试阶段': 'warning',
  '已结束': 'danger',
  '即将开始': 'info',
}

export const SelectionPoliticalLabel: Record<string, string> = {
  '中共党员': '中共党员',
  '中共预备党员': '中共预备党员',
  '共青团员': '共青团员',
  '不限': '不限',
}
