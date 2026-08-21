/** 城市简要信息 VO */
export interface CityBriefVO {
  id: string
  cityName: string
  province: string
  region: string
  cityIntro: string
  collegeCount: number
}

/** 院校简要信息 VO */
export interface UniversityBriefVO {
  id: string
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

/** 专业简要信息 VO */
export interface MajorBriefVO {
  id: string
  majorCode: string
  majorName: string
  disciplineName: string
  majorType: string
  majorCategory: string
  parentCategory: string
  majorTags: string
  degreeAwarded: string
  studyDuration: string
  employmentRate: number
  salaryMin: number
  salaryMax: number
  description: string
}

/** 抽屉展示的数据类型 */
export type BriefType = 'university' | 'city' | 'major'

/** 抽屉数据 */
export interface BriefDrawerData {
  type: BriefType
  name: string
}
