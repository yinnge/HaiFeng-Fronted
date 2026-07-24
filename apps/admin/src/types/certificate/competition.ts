export interface CompetitionListVO {
  id: string
  compName: string
  compLevel: string | null
  registrationTime: string | null
  updatedAt: string
}

export interface CompetitionDetailVO {
  id: string
  compName: string
  compLevel: string | null
  registrationTime: string | null
  detailId: string
  basicInfo: Record<string, any>
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
  page: number
  size: number
}

export interface CompetitionDetailDTO {
  basicInfo?: Record<string, any>
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
  compLevel?: string
  registrationTime?: string
  detail?: CompetitionDetailDTO
}

export interface CompetitionUpdateDTO extends CompetitionAddDTO {
  id: string
}
