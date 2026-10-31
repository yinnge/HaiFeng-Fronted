export interface CompetitionListVO {
  id: string
  sortOrder?: number
  compName: string
  compLevel: string | null
  registrationTime: string | null
  isDeleted: boolean
  updatedAt: string
}

export interface CompetitionBasicInfoItem {
  title: string
  content: string
}

export interface CompetitionDetailVO {
  id: string
  sortOrder?: number
  compName: string
  compLevel: string | null
  registrationTime: string | null
  detailId: string
  basicInfo: CompetitionBasicInfoItem[]
  awards: string[]
  background: string | null
  purposes: string[]
  competitionRules: { title: string; content: string }[]
  scoringCriteria: string[]
  notices: string[]
  processGuide: { title: string; content: string }[]
  awardsDisplay: { title: string; content: string }[]
  createdAt: string
  updatedAt: string
}

export interface CompetitionQueryDTO {
  compName?: string
  compLevel?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface CompetitionDetailDTO {
  basicInfo?: CompetitionBasicInfoItem[]
  awards?: string[]
  background?: string
  purposes?: string[]
  competitionRules?: { title: string; content: string }[]
  scoringCriteria?: string[]
  notices?: string[]
  processGuide?: { title: string; content: string }[]
  awardsDisplay?: { title: string; content: string }[]
}

export interface CompetitionAddDTO {
  compName: string
  sortOrder?: number
  compLevel?: string
  registrationTime?: string
  detail?: CompetitionDetailDTO
}

export interface CompetitionUpdateDTO extends CompetitionAddDTO {
  id: string
}

export interface ImportResultVO {
  total: number
  success: number
  failed: number
  updated: number
  errors: string[]
}
