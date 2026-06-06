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
  id: number
  siteName: string
  siteUrl: string
  siteIcp: string
  siteDescription: string
  apiNumber: number
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
