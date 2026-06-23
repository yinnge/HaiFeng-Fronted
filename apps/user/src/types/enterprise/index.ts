import type { BasePageQuery } from '@haifeng/shared'

export interface EnterpriseQueryDTO extends BasePageQuery {
  enterpriseName?: string
  enterpriseNature?: string
  enterpriseType?: string
  cityName?: string
  recruitmentStatus?: string
}

export interface EnterpriseListVO {
  id: number
  cityName: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  logoUrl: string | null
  officialWebsite: string | null
  region: string | null
  enterpriseScale: string | null
  mainBusiness: string | null
  enterpriseIntro: string | null
}

export interface EnterprisePositionVO {
  positionName: string
  recruitmentType: string | null
  positionRequirement: string | null
  positionTags: string[] | null
  province: string | null
  city: string | null
  workLocation: string | null
  educationRequirement: string | null
  majorRequirement: string | null
  workExperience: string | null
  salaryMin: number | null
  salaryMax: number | null
  applyLink: string | null
  deadline: string | null
  positionStatus: string | null
}

export interface EnterpriseIndustryGroupVO {
  enterpriseId: number
  industries: IndustryJumpVO[]
}

export interface IndustryJumpVO {
  industryId: number
  industryName: string
}

export interface IndustryEnterpriseGroupVO {
  industryId: number
  enterprises: EnterpriseJumpVO[]
}

export interface EnterpriseJumpVO {
  enterpriseId: number
  enterpriseName: string
}
