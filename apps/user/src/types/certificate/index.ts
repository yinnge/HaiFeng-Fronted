import type { BasePageQuery } from '@haifeng/shared'

export interface CertificateListVO {
  id: string
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
}

export interface CertificateDetailVO {
  id: string
  certName: string
  category: string
  certLevel: string
  applicableMajor: string
  registrationTime: string
  examTime: string
  examFee: number
  certIntro: string
  examRequirements: string[]
  examArrangement: string
  officialWebsite: string
}

export interface CompetitionListVO {
  id: string
  compName: string
  compLevel: string
  registrationTime: string
}

export interface CompetitionDetailVO {
  id: string
  competitionId: string
  basicInfo: Record<string, any> | null
  awards: string[] | null
  background: string | null
  purposes: string[] | null
  competitionRules: Array<{ title: string; content: string }> | null
  scoringCriteria: string[] | null
  notices: string[] | null
  processGuide: Array<{ step: string; desc: string }> | null
  awardsDisplay: Array<{ level: string; count: string }> | null
}

export interface CompetitionMajorBriefVO {
  majorId: string
  majorName: string
}

export interface CompetitionBriefVO {
  competitionId: string
  competitionName: string
}

export interface CertificateQueryDTO extends BasePageQuery {
  category?: string
  certName?: string
}

export interface CompetitionQueryDTO extends BasePageQuery {
  compName?: string
  compLevel?: string
}
