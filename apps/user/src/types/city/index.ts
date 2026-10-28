import type { BasePageQuery } from '@haifeng/shared'

export interface CityQueryDTO extends BasePageQuery {
  cityName?: string
  province?: string
  region?: string
  /** 排序白名单：college | keyCollege | gdp | population，空串为默认排序 */
  sortBy?: string
}

export interface CityListVO {
  id: string
  cityName: string
  province: string
  region: string
  cityIntro: string | null
  collegeCount: number | null
  keyCollegeCount: number | null
  residentPopulation: number | null
  gdp: number | null
  /** 封面图 URL（后端已就绪，前端类型此前滞后，此处补齐；为空时前端渲染占位渐变） */
  coverImageUrl?: string | null
  /** 城市等级：直辖市 / 省会城市 / 地级市 / 县级市 */
  cityLevel?: string | null
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

/** 城市数据概览（/stats 接口） */
export interface CityStatsVO {
  /** 全国城市数 */
  cityCount?: number | null
  /** 全国高校数 */
  collegeCount?: number | null
  /** 全国常住人口（万） */
  residentPopulation?: number | null
  /** 全国 GDP 总量（亿元） */
  gdp?: number | null
}

/** 城市排行榜单条（/rank 接口） */
export interface CityRankItem {
  cityId: string
  cityName: string
  /** 当前指标数值 */
  value: number
  province?: string | null
  region?: string | null
}

export interface CityRankQuery {
  /** college | keyCollege | gdp | population */
  metric: 'college' | 'keyCollege' | 'gdp' | 'population'
  limit?: number
}
