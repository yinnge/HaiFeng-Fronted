export interface IndustryListVO {
  id: string
  industryName: string
  category: string
  talentTrend: string
  annualGrowthRate: number
  isDeleted: boolean
  createdAt: string
}

export interface IndustryDetailVO {
  id: string
  industryName: string
  category: string
  iconClass: string
  description: string
  annualGrowthRate: number
  marketScale: string
  talentGap: string
  investmentHeat: number
  growthTrend: string
  marketTrend: string
  talentTrend: string
  investmentTrend: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  detailId: string
  shortDescription: string
  detailedDescription: string
  industryScale: Record<string, any>
  industryTalentDemand: Record<string, any>
  industrySalary: Record<string, any>
  policyInfo: Record<string, any>
  developmentSupportInfo: Record<string, any>
  talentAnalysis: Record<string, any>
  talentPolicy: Record<string, any>
  salaryData: Record<string, any>
}

export interface IndustryQueryDTO {
  industryName?: string
  category?: string
  talentTrend?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface IndustryAddDTO {
  industryName: string
  category: string
  iconClass?: string
  description?: string
  annualGrowthRate?: number
  marketScale?: string
  talentGap?: string
  investmentHeat?: number
  growthTrend?: string
  marketTrend?: string
  talentTrend?: string
  investmentTrend?: string
  shortDescription?: string
  detailedDescription?: string
  industryScale?: Record<string, any>
  industryTalentDemand?: Record<string, any>
  industrySalary?: Record<string, any>
  policyInfo?: Record<string, any>
  developmentSupportInfo?: Record<string, any>
  talentAnalysis?: Record<string, any>
  talentPolicy?: Record<string, any>
  salaryData?: Record<string, any>
}

export interface IndustryUpdateDTO {
  industryName?: string
  category?: string
  iconClass?: string
  description?: string
  annualGrowthRate?: number
  marketScale?: string
  talentGap?: string
  investmentHeat?: number
  growthTrend?: string
  marketTrend?: string
  talentTrend?: string
  investmentTrend?: string
}

export interface IndustryDetailUpdateDTO {
  shortDescription?: string
  detailedDescription?: string
  industryScale?: Record<string, any>
  industryTalentDemand?: Record<string, any>
  industrySalary?: Record<string, any>
  policyInfo?: Record<string, any>
  developmentSupportInfo?: Record<string, any>
  talentAnalysis?: Record<string, any>
  talentPolicy?: Record<string, any>
  salaryData?: Record<string, any>
}
