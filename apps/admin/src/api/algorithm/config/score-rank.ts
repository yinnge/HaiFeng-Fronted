import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ScoreRankListVO, ScoreRankDetailVO, ScoreRankQueryDTO, ScoreRankAddDTO } from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/score-rank'

export const getScoreRankPage = (params: ScoreRankQueryDTO): Promise<AxiosResponse<R<PageResult<ScoreRankListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getScoreRankDetail = (id: string): Promise<AxiosResponse<R<ScoreRankDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addScoreRank = (data: ScoreRankAddDTO): Promise<AxiosResponse<R<string>>> =>
  request.post(PREFIX, data)

export const updateScoreRank = (id: string, data: ScoreRankAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const deleteScoreRank = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const batchDeleteScoreRank = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, ids)

export const updateScoreRankStatus = (id: string, isDeleted: boolean): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, null, { params: { isDeleted } })

export const importScoreRank = (file: File): Promise<AxiosResponse<R<number>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
