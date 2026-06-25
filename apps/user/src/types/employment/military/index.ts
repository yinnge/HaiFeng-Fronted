export interface MilitaryPositionSearchDTO {
  page: number
  size: number
  keyword?: string
  positionType?: string
  workLocation?: string
  majorRequirement?: string
  educationRequirement?: string
  positionStatus?: string
}

export interface MilitaryPositionListVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  majorRequirement: string
  educationRequirement: string
  workLocation: string
  salaryRange: string
  regDeadline: string
  positionStatus: string
}

export interface MilitaryPositionDetailVO {
  id: number
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  majorRequirement: string
  educationRequirement: string
  regDeadline: string
  positionStatus: string
  positionDescription: string
  responsibilities: string[]
  qualifications: string[]
}

export const MilitaryStatusLabel: Record<string, string> = {
  '进行中': '进行中',
  '已结束': '已结束',
}

export const MilitaryStatusTag: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  '进行中': 'success',
  '已结束': 'danger',
}
