export interface ExamGuideQueryDTO {
  page?: number
  size?: number
  title?: string
  subtitle?: string
  guideCategory?: string
  guideType?: string
  difficultyLevel?: string
  authorTitle?: string
  authorName?: string
}

export interface ExamGuideListVO {
  id: number
  guideCategory: string
  guideType: string
  title: string
  subtitle: string
  tags: string[]
  authorName: string
  authorTitle: string
}

export interface ExamGuideDetailVO {
  id: number
  guideCategory: string
  guideType: string
  title: string
  subtitle: string
  coverImage: string
  iconClass: string
  summary: string
  content: string
  tags: string[]
  difficultyLevel: string
  targetAudience: string
  authorName: string
  authorTitle: string
  isTop: boolean
  isRecommended: boolean
  sortOrder: number
  viewCount: number
  likeCount: number
  createdAt: string
  updatedAt: string
}
