export interface NoticeQueryDTO {
  page?: number
  size?: number
  title?: string
  summary?: string
  source?: string
  noticeCategory?: string
  noticeType?: string
  province?: string
  city?: string
  year?: string
}

export interface NoticeListVO {
  id: number
  title: string
  summary: string
  publishDate: string
  viewCount: number
  noticeCategory: string
  province: string
  city: string
  year: string
  regStartDate: string
  regEndDate: string
  recruitmentCount: number
}

export interface NoticeDetailVO {
  id: number
  noticeCategory: string
  noticeType: string
  title: string
  summary: string
  content: string
  province: string
  city: string
  tags: string[]
  year: string
  source: string
  sourceUrl: string
  publishDate: string
  publishUnit: string
  regStartDate: string
  regEndDate: string
  examTime: string
  recruitmentCount: number
  isTop: boolean
  isImportant: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}
