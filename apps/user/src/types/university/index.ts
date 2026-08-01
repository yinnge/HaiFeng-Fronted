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
  id: string
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

// === 通道-大学关联 ===
export interface ChannelListVO {
  channelCode: string
  channelName: string
  year: number
  regionTag: string
  signupStart: string
  signupEnd: string
}

export interface ChannelOptionVO {
  channelCode: string
  channelName: string
}

// === 录取专业组 ===
export interface AdmissionGroupListVO {
  id: string
  groupCode: string
  groupName: string
  year: number
  province: string
  batch: string
  cityName: string
  subjects: string[]
  requirementType: string
  majorCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
}

export interface AdmissionGroupDetailVO {
  id: string
  universityId: string
  universityName: string
  cityName: string
  year: number
  province: string
  batch: string
  enrollmentCode: string
  groupCode: string
  groupName: string
  subjects: string[]
  requirementType: string
  description: string
  constraints: string[]
  majorCount: number
  categoryCount: number
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  createdAt: string
  updatedAt: string
}

export interface MajorScoreVO {
  id: string
  groupId: string
  majorCode: string
  majorName: string
  educationLevel: string
  duration: string
  tuition: string
  description: string
  admissionCount: number
  minScore: number
  minRank: number
  maxScore: number
  maxRank: number
  avgScore: number
  avgRank: number
  constraints: string[]
}

export interface AdmissionGroupQueryDTO extends BasePageQuery {
  province?: string
  batch?: string
  cityName?: string
}

export interface ChannelQueryDTO extends BasePageQuery {
  channelName?: string
  regionTag?: string
}
