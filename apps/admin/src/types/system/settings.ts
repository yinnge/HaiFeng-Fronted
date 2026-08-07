/** 社交媒体链接 */
export interface ContactUrl {
  wechat?: string
  weibo?: string
  zhihu?: string
  douyin?: string
  bilibili?: string
}

/** 基本联系信息 */
export interface BasicMessage {
  address?: string
  phone?: string
  email?: string
  consultationTime?: string
}

/** 系统设置 VO */
export interface SystemSettingsVO {
  id: string
  siteName: string
  siteUrl: string
  siteIcp: string
  siteDescription: string
  apiNumber: number
  /** 默认志愿表「博」档数量 */
  reachHighCount: number
  /** 默认志愿表「冲」档数量 */
  reachCount: number
  /** 默认志愿表「稳」档数量 */
  matchCount: number
  /** 默认志愿表「保」档数量 */
  safeCount: number
  /** 默认志愿表「垫」档数量 */
  floorCount: number
  providerName: string
  modelName: string
  proPrice: number
  vipPrice: number
  proCommissionRate: number
  vipCommissionRate: number
  seoTitle: string
  seoKeywords: string
  seoDescription: string
  contactUrl: ContactUrl
  basicMessage: BasicMessage
  updatedAt: string
}

/** 系统设置更新 DTO */
export interface SystemSettingsUpdateDTO {
  siteName?: string
  siteUrl?: string
  siteIcp?: string
  siteDescription?: string
  apiNumber?: number
  reachHighCount?: number
  reachCount?: number
  matchCount?: number
  safeCount?: number
  floorCount?: number
  proPrice?: number
  vipPrice?: number
  proCommissionRate?: number
  vipCommissionRate?: number
  seoTitle?: string
  seoKeywords?: string
  seoDescription?: string
  contactUrl?: ContactUrl
  basicMessage?: BasicMessage
}
