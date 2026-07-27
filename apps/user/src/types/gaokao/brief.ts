/** 城市简要信息 VO */
export interface CityBriefVO {
  id: number
  cityName: string
  province: string
  region: string
  cityIntro: string
  collegeCount: number
}

/** 院校简要信息 VO */
export interface UniversityBriefVO {
  id: number
  name: string
  provinceName: string
  cityName: string
  region: string
  category: string
  educationLevel: string
  nature: string
  recommendationRate: number
  department: string
  tags: string[]
  imageUrl: string
}

/** 抽屉展示的数据类型 */
export type BriefType = 'university' | 'city'

/** 抽屉数据 */
export interface BriefDrawerData {
  type: BriefType
  name: string
}
