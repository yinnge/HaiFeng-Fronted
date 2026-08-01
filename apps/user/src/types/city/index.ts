import type { BasePageQuery } from '@haifeng/shared'

export interface CityQueryDTO extends BasePageQuery {
  cityName?: string
  province?: string
  region?: string
}

export interface CityListVO {
  id: string
  cityName: string
  province: string
  region: string
  cityIntro: string
  collegeCount: number
  keyCollegeCount: number
  residentPopulation: number
  gdp: number
}

export interface CityDetailVO {
  cityName: string
  area: number
  subtitle: string
  cityLevel: string
  adminCode: string
  perCapitaGdp: number
  urbanizationRate: number
  ruralPopRatio: number
  agingRate: number
  migrantPopRatio: number
  gdpGrowthRate: number
  fortune500Count: number
  industryStructure: Record<string, any>
  industryDescription: string
  mainIndustries: string[]
  emergingIndustries: string[]
  futurePlan: Record<string, any>
  highEducation: Record<string, any>
  basicEducation: Record<string, any>
  enterpriseStats: Record<string, any>
  housingPriceLevel: Record<string, any>
  rentalCost: Record<string, any>
  housingPolicy: Record<string, any>
  consumption: Record<string, any>
  employment: Record<string, any>
  transportation: Record<string, any>
  medical: Record<string, any>
  culture: Record<string, any>
}
