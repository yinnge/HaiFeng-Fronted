import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  StrongBaseScoreListVO,
  StrongBaseScoreDetailVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreAddDTO,
  StrongBaseScoreUpdateDTO,
} from '@/types/special/strong-base-score'

const PREFIX = '/api/v1/admin/special/strong-base-score'

export const getScorePage = (params: StrongBaseScoreQueryDTO) => {
  return request.get<R<PageResult<StrongBaseScoreListVO>>>(`${PREFIX}/page`, { params })
}

export const getScoreDetail = (id: string) => {
  return request.get<R<StrongBaseScoreDetailVO>>(`${PREFIX}/${id}`)
}

export const addScore = (data: StrongBaseScoreAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateScore = (id: string, data: StrongBaseScoreUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleScoreStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteScore = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteScore = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
