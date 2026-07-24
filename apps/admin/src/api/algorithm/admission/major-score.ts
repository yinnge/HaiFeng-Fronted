import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { AdmissionMajorScoreListVO, AdmissionMajorScoreDetailVO, AdmissionMajorScoreQueryDTO, AdmissionMajorScoreAddDTO, AdmissionMajorScoreUpdateDTO } from '@/types/algorithm/admission'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/admission/major-score'

export const getMajorScorePage = (params: AdmissionMajorScoreQueryDTO): Promise<AxiosResponse<R<PageResult<AdmissionMajorScoreListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getMajorScoreDetail = (id: string): Promise<AxiosResponse<R<AdmissionMajorScoreDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addMajorScore = (data: AdmissionMajorScoreAddDTO): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateMajorScore = (id: string, data: AdmissionMajorScoreUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateMajorScoreStatus = (id: string, isDeleted: boolean): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, null, { params: { isDeleted } })

export const deleteMajorScore = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const batchDeleteMajorScore = (ids: number[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch`, ids)
