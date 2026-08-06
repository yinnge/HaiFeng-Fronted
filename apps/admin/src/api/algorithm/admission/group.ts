import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { AdmissionGroupListVO, AdmissionGroupDetailVO, AdmissionGroupQueryDTO, AdmissionGroupAddDTO, AdmissionGroupUpdateDTO } from '@/types/algorithm/admission'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/admission/group'

export const getGroupPage = (params: AdmissionGroupQueryDTO): Promise<AxiosResponse<R<PageResult<AdmissionGroupListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getGroupDetail = (id: string): Promise<AxiosResponse<R<AdmissionGroupDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addGroup = (data: AdmissionGroupAddDTO): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateGroup = (id: string, data: AdmissionGroupUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateGroupStatus = (id: string, isDeleted: boolean): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, null, { params: { isDeleted } })

export const deleteGroup = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const batchDeleteGroup = (ids: number[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch`, ids)

export const batchHardDeleteGroup = (ids: number[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch/hard-delete`, ids)

export const importGroupExcel = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const recalcAllGroups = (): Promise<AxiosResponse<R<number>>> =>
  request.post(`${PREFIX}/recalc-all`)
