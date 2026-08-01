import type { BasePageQuery } from '@haifeng/shared'

export interface IndustryQueryDTO extends BasePageQuery {
  category?: string
}

export interface IndustryListVO {
  id: string
  industryName: string
  category: string
  description: string
  annualGrowthRate: number
  marketScale: string
  talentGap: string
  investmentHeat: number
}

export interface IndustryDetailVO {
  industryName: string
  shortDescription: string
  detailedDescription: string
  category?: string
  investmentHeat?: number
  annualGrowthRate?: number
  marketScale?: string
  talentGap?: string
  growthTrend?: string
  marketTrend?: string
  talentTrend?: string
  investmentTrend?: string
  industryScale: Record<string, any>
  industryTalentDemand: Record<string, any>
  industrySalary: Record<string, any>
  policyInfo: Record<string, any>
  developmentSupportInfo: Record<string, any>
  talentAnalysis: Record<string, any>
  talentPolicy: Record<string, any>
  salaryData: Record<string, any>
}
