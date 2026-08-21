export interface AdmissionMajorScoreListVO {
  id: string
  groupId: string
  majorCode: string
  majorName: string
  educationLevel: string | null
  history: Array<{
    year: number
    admissionCount: number | null
    minScore: number | null
    minRank: number | null
    avgScore: number | null
    avgRank: number | null
    maxScore: number | null
    maxRank: number | null
  }>
  isDeleted: boolean
}

export interface AdmissionMajorScoreDetailVO {
  id: string
  groupId: string
  majorId: string | null
  majorCode: string
  majorName: string
  educationLevel: string | null
  duration: string | null
  tuition: string | null
  description: string | null
  history: Array<{
    year: number
    admissionCount: number | null
    minScore: number | null
    minRank: number | null
    avgScore: number | null
    avgRank: number | null
    maxScore: number | null
    maxRank: number | null
  }>
  constraints: string[]
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface AdmissionMajorScoreQueryDTO {
  page: number
  size: number
  groupId?: number
  majorCode?: string
  majorName?: string
  educationLevel?: string
  isDeleted?: boolean
}

export interface ScoreHistoryItem {
  year: number
  admissionCount: number | null
  minScore: number | null
  minRank: number | null
  avgScore: number | null
  avgRank: number | null
  maxScore: number | null
  maxRank: number | null
}

export interface AdmissionMajorScoreAddDTO {
  groupId: string
  year: number | null
  majorId?: number
  majorCode: string
  majorName: string
  educationLevel?: string
  duration?: string
  tuition?: string
  description?: string
  admissionCount?: number
  minScore?: number
  minRank?: number
  avgScore?: number
  avgRank?: number
  maxScore?: number
  maxRank?: number
  constraints?: string[]
  /** 多年度分数数组（优先于平铺分数字段），新增整体写入 / 修改整体替换 */
  history?: ScoreHistoryItem[]
}

export interface AdmissionMajorScoreUpdateDTO extends AdmissionMajorScoreAddDTO {}
