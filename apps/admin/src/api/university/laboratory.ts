import request from '@haifeng/shared/utils/request'
import type {
  LaboratoryListVO,
  LaboratoryDetailVO,
  LaboratoryQueryDTO,
  LaboratoryAddDTO,
  LaboratoryUpdateDTO,
} from '@/types/university/laboratory'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/laboratory'

export const getLaboratoryPage = (
  params: LaboratoryQueryDTO,
): Promise<AxiosResponse<PageResponse<LaboratoryListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getLaboratoryDetail = (
  id: string,
): Promise<AxiosResponse<R<LaboratoryDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addLaboratory = (
  data: LaboratoryAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateLaboratory = (
  id: string,
  data: LaboratoryUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateLaboratoryStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteLaboratory = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteLaboratory = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteLaboratory = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteLaboratory = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importLaboratory = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
