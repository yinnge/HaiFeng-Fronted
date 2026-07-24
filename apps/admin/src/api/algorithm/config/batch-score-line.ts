import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { BatchScoreLineListVO, BatchScoreLineDetailVO, BatchScoreLineQueryDTO, BatchScoreLineAddDTO } from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/batch-score-line'

export const getBatchScoreLinePage = (params: BatchScoreLineQueryDTO): Promise<AxiosResponse<R<PageResult<BatchScoreLineListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getBatchScoreLineDetail = (id: string): Promise<AxiosResponse<R<BatchScoreLineDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addBatchScoreLine = (data: BatchScoreLineAddDTO): Promise<AxiosResponse<R<string>>> =>
  request.post(PREFIX, data)

export const updateBatchScoreLine = (id: string, data: BatchScoreLineAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const deleteBatchScoreLine = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteBatchScoreLine = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteBatchScoreLine = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/batch`, { data: ids })

export const batchHardDeleteBatchScoreLine = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/batch/hard`, { data: ids })

export const importBatchScoreLine = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
