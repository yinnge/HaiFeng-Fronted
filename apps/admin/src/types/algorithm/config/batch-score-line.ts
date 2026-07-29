import type { BasePageQuery } from '@haifeng/shared'

export interface BatchScoreLineListVO {
  id: string
  province: string
  year: number
  subjectType: string
  batch: string
  scoreLine: number
  isDeleted: boolean
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
  isDeleted: boolean
  createdAt: string
}

export interface BatchScoreLineQueryDTO extends BasePageQuery {
  province?: string
  year?: number
  subjectType?: string
  batch?: string
  scoreLine?: number
  isDeleted?: boolean | null
}

export interface BatchScoreLineStatusDTO {
  isDeleted: boolean
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
