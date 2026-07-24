export interface NoticeListVO {
  id: string
  title: string
  noticeCategory: string
  noticeType: string
  province: string | null
  city: string | null
  year: string | null
  isTop: boolean
  isImportant: boolean
  viewCount: number
}

export interface NoticeDetailVO {
  id: string
  title: string
  noticeCategory: string
  noticeType: string
  province: string | null
  city: string | null
  year: string | null
  isTop: boolean
  isImportant: boolean
  viewCount: number
  summary: string | null
  content: string
  tags: string[]
  source: string | null
  sourceUrl: string | null
  publishDate: string
  publishUnit: string | null
  regStartDate: string | null
  regEndDate: string | null
  examTime: string | null
  recruitmentCount: number | null
  sortOrder: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface NoticeQueryDTO {
  page: number
  size: number
  title?: string
  noticeCategory?: string
  noticeType?: string
  province?: string
  city?: string
  year?: string
  isTop?: boolean
  isImportant?: boolean
}

export interface NoticeUpdateDTO {
  noticeCategory: string
  noticeType: string
  title: string
  summary?: string
  content: string
  province?: string
  city?: string
  tags?: string[]
  year?: string
  source?: string
  sourceUrl?: string
  publishDate: string
  publishUnit?: string
  regStartDate?: string
  regEndDate?: string
  examTime?: string
  recruitmentCount?: number
  isTop: boolean
  isImportant: boolean
  sortOrder: number
}

export const NoticeCategoryLabel: Record<string, string> = {
  civil: '公务�?,
  institution: '事业�?,
  military: '部队文职',
  selection: '选调�?,
  teacher: '教师',
  healthcare: '医疗卫生',
  finance: '银行金融',
  grassroots: '基层服务',
  community: '社区工作',
  public_welfare: '公益性岗�?,
  enterprise: '企业',
  general: '通用',
}

export interface StatusDTO {
  status: number
}

export const NoticeTypeOptions = [
  '招聘公告', '招录公告', '补录公告', '调剂公告', '成绩公示',
  '面试通知', '体检通知', '录用公示', '报名指南', '考试大纲', '政策解读',
]
