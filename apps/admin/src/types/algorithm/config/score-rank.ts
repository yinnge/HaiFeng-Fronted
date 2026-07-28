import type { BasePageQuery } from '@haifeng/shared'

export interface ScoreRankListVO {
  id: string
  province: string
  year: number
  subjectType: string
  score: number
  rank: number
  isDeleted: boolean
}

export interface ScoreRankDetailVO {
  id: string
  province: string
  year: number
  subjectType: string
  score: number
  rank: number
  sameScoreCount: number | null
  cumulativeCount: number | null
  createdAt: string
}

export interface ScoreRankQueryDTO extends BasePageQuery {
  province?: string
  year?: number
  subjectType?: string
  score?: number
  rank?: number
  isDeleted?: boolean
}

export interface ScoreRankAddDTO {
  province: string
  year: number
  subjectType: string
  score: number
  rank: number
  sameScoreCount?: number | null
  cumulativeCount?: number | null
}

export interface ScoreRankUpdateDTO extends ScoreRankAddDTO {
}
