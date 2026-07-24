import type { BasePageQuery } from '@haifeng/shared'

export interface BatchScoreLineListVO {
  id: string
  province: string
  year: number
  subjectType: string
  batch: string
  scoreLine: number
}

export interface BatchScoreLineDetailVO {
  id: string
  province: string
  year: number
  subjectType: string
  batch: string
  scoreLine: number
  rankLine: number | null
  remark: string | null
  createdAt: string
}

export interface BatchScoreLineQueryDTO extends BasePageQuery {
  province?: string
  year?: number
  subjectType?: string
  batch?: string
  scoreLine?: number
}

export interface BatchScoreLineAddDTO {
  province: string
  year: number
  subjectType: string
  batch: string
  scoreLine: number
  rankLine?: number | null
  remark?: string | null
}

export interface BatchScoreLineUpdateDTO extends BatchScoreLineAddDTO {
}
