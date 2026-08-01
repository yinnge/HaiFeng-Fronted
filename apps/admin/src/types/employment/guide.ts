export interface ExamGuideListVO {
  id: string
  guideCategory: string
  guideType: string
  title: string
  subtitle: string | null
  isTop: boolean
  isRecommended: boolean
  viewCount: number
  likeCount: number
  isDeleted: boolean
}

export interface ExamGuideDetailVO {
  id: string
  guideCategory: string
  guideType: string
  title: string
  subtitle: string | null
  coverImage: string | null
  iconClass: string | null
  summary: string | null
  content: string
  tags: string[]
  difficultyLevel: string | null
  targetAudience: string | null
  authorName: string | null
  authorTitle: string | null
  isTop: boolean
  isRecommended: boolean
  sortOrder: number
  viewCount: number
  likeCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ExamGuideAddDTO {
  guideCategory: string
  guideType: string
  title: string
  subtitle?: string
  coverImage?: string
  iconClass?: string
  summary?: string
  content: string
  tags?: string[]
  difficultyLevel?: string
  targetAudience?: string
  authorName?: string
  authorTitle?: string
  isTop: boolean
  isRecommended: boolean
  sortOrder: number
}

export interface ExamGuideQueryDTO {
  page: number
  size: number
  title?: string
  subtitle?: string
  guideCategory?: string
  guideType?: string
  isTop?: boolean
  /** 状态筛选：0=启用，1=禁用，不传=全部 */
  status?: number
}

export interface ExamGuideUpdateDTO {
  guideCategory: string
  guideType: string
  title: string
  subtitle?: string
  coverImage?: string
  iconClass?: string
  summary?: string
  content: string
  tags?: string[]
  difficultyLevel?: string
  targetAudience?: string
  authorName?: string
  authorTitle?: string
  isTop: boolean
  isRecommended: boolean
  sortOrder: number
}

export interface StatusDTO {
  status: number
}

export const GuideCategoryLabel: Record<string, string> = {
  civil: '公务员',
  institution: '事业编',
  military: '部队文职',
  selection: '选调生',
  teacher: '教师',
  healthcare: '医疗卫生',
  finance: '银行金融',
  grassroots: '基层服务',
  community: '社区工作',
  general: '通用',
}

export const GuideTypeOptions = [
  '备考攻略', '科目指导', '真题解析', '面试技巧',
  '时事热点', '经验分享', '政策解读', '学习计划',
]
