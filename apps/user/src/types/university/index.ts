import type { BasePageQuery } from '@haifeng/shared'

export interface UniversityQueryDTO extends BasePageQuery {
  name?: string
  provinceName?: string
  nature?: string
  category?: string
  department?: string
  educationLevel?: string
  hasDoctorate?: boolean
  hasMaster?: boolean
}

export interface UniversityListVO {
  id: number
  name: string
  tags: string[]
  cityName: string
  educationLevel: string
  provinceName: string
  introduction: string
  imageUrl: string
  nature: string
  category: string
  majorCount: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
}

export interface UniversityDetailVO {
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number
  scienceGroupScore: number
  carouselImages: string[]
  introduction: string
  rankings: Record<string, number>
  abroadRate: string
  genderRatio: string
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  recommendationRate: number
  recommendationYear: number
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
  tags: string[]
  famousUnion: string
}

export interface GuideOverviewVO {
  customTags: string[]
  name: string
  tags: string[]
  region: string
  category: string
  nature: string
  imageUrl: string
}

export interface GuideCategoryVO {
  [key: string]: Record<string, any>
}

export interface GalleryItemVO {
  imageType: string
  imageUrl: string
}
