export interface ContactUrl {
  wechat: string
  weibo: string
  zhihu: string
  douyin: string
  bilibili: string
}

export interface BasicMessage {
  address: string
  phone: string
  email: string
  consultationTime: string
}

export interface SiteInfoVO {
  siteIcp: string
  siteDescription: string
  contactUrl: ContactUrl
  basicMessage: BasicMessage
  proPrice?: number
  vipPrice?: number
}

export interface HomePageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export interface AnnouncementListVO {
  id: string
  title: string
  tag: string
  updatedAt: string
}

export interface AnnouncementDetailVO {
  id: string
  title: string
  content: string
  tag: string
}

export interface PlannerListVO {
  id: string
  name: string
  region: string
  position: string
  avatar: string
  specialty: string
  personalDescription: string
}

export interface PlannerDetailVO {
  id: string
  name: string
  position: string
  region: string
  avatar: string
  specialty: string
  douyinName: string
  douyinUrl: string
  personalDescription: string
  experienceJob: string
  achievements: string[]
  expertiseAreas: string[]
}

export interface InstitutionListVO {
  id: string
  name: string
  type: string
  description: string
  images: string[]
}

export interface InstitutionDetailVO {
  id: string
  name: string
  type: string
  phone: string
  address: string
  description: string
  courses: string[]
  images: string[]
  logo: string
}
