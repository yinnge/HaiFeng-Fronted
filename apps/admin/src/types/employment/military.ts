export interface MilitaryListVO {
  id: string
  positionName: string
  employerUnit: string
  department: string
  positionType: string
  workLocation: string
  salaryRange: string
  regDeadline: string
  positionStatus: string
}

export interface MilitaryDetailVO {
  id: string
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
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MilitaryQueryDTO {
  page: number
  size: number
  positionName?: string
  employerUnit?: string
  department?: string
  positionType?: string
  positionStatus?: string
}

export interface MilitaryAddDTO {
  positionName: string
  employerUnit?: string
  department?: string
  positionType?: string
  workLocation?: string
  salaryRange?: string
  majorRequirement?: string
  educationRequirement?: string
  regDeadline?: string
  positionStatus?: string
  positionDescription?: string
  responsibilities?: string[]
  qualifications?: string[]
  sortOrder?: number
}

export interface MilitaryUpdateDTO {
  positionName?: string
  employerUnit?: string
  department?: string
  positionType?: string
  workLocation?: string
  salaryRange?: string
  majorRequirement?: string
  educationRequirement?: string
  regDeadline?: string
  positionStatus?: string
  positionDescription?: string
  responsibilities?: string[]
  qualifications?: string[]
  sortOrder?: number
}

export interface MilitaryStatusDTO {
  positionStatus: string
}
