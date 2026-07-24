export interface AdmissionGroupListVO {
  id: string
  universityId: string
  universityName: string
  cityName: string
  year: number
  province: string
  batch: string
  enrollmentCode: string | null
  groupCode: string
  groupName: string | null
  subjects: string[]
  requirementType: string
  majorCount: number
  categoryCount: number
  admissionCount: number | null
  minScore: number | null
  minRank: number | null
  avgScore: number | null
  isDeleted: boolean
}

export interface AdmissionGroupDetailVO {
  id: string
  universityId: string
  universityName: string
  cityName: string
  year: number
  province: string
  batch: string
  enrollmentCode: string | null
  groupCode: string
  groupName: string | null
  subjects: string[]
  requirementType: string
  description: string | null
  constraints: string[]
  majorCount: number
  categoryCount: number
  admissionCount: number | null
  minScore: number | null
  minRank: number | null
  avgScore: number | null
  avgRank: number | null
  maxScore: number | null
  maxRank: number | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AdmissionGroupQueryDTO {
  page: number
  size: number
  universityName?: string
  year?: number
  province?: string
  requirementType?: string
  enrollmentCode?: string
  groupCode?: string
  groupName?: string
  isDeleted?: boolean
}

export interface AdmissionGroupAddDTO {
  universityName: string
  year: number
  province: string
  batch: string
  enrollmentCode?: string
  groupCode: string
  groupName?: string
  subjects?: string[]
  requirementType?: string
  description?: string
  constraints?: string[]
}

export interface AdmissionGroupUpdateDTO extends AdmissionGroupAddDTO {}
