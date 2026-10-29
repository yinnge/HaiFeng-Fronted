import type { BasePageQuery } from '@haifeng/shared'

/**
 * 与后端 UniversityQueryDTO 对齐（2026-10-28）：
 * 已移除 department / hasDoctorate / hasMaster（后端 DTO 不再支持）。
 * tags 逗号分隔传参（如 985,211），后端按 text[] AND 交集匹配；
 * channelCode=统招时前端不传参（查全部院校）。
 */
export interface UniversityQueryDTO extends BasePageQuery {
  name?: string
  provinceName?: string
  nature?: string
  category?: string
  educationLevel?: string
  /** 标签筛选（如 985/211/双一流），逗号分隔多值 */
  tags?: string
  /** 招生通道编码（t_special_channel.channel_code）；统招不传 */
  channelCode?: string
}

/** 与后端 UniversityListVO 对齐：imageUrl=院校 logo；coverImage=详情轮播首图（可为 null，前端占位）；content=简介全文（前端截断） */
export interface UniversityListVO {
  id: string
  name: string
  tags: string[]
  provinceName: string
  cityName: string
  region?: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  imageUrl: string
  coverImage?: string
  content?: string
}

/** 院校统计概览（GET /stats），仅统计 status=1，不受列表筛选影响 */
export interface UniversityStatsVO {
  count985: number
  count211: number
  countDoubleFirstClass: number
  countUndergraduate: number
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
  imageUrl?: string
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
