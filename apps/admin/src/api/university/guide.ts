import request from '@haifeng/shared/utils/request'
import type {
  UniversityGuideListVO,
  UniversityGuideDetailVO,
  UniversityGuideQueryDTO,
  UniversityGuideAddDTO,
  UniversityGuideUpdateDTO,
} from '@/types/university/guide'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/guide'

export const getGuidePage = (
  params: UniversityGuideQueryDTO,
): Promise<AxiosResponse<PageResponse<UniversityGuideListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getGuideDetail = (
  id: string,
): Promise<AxiosResponse<R<UniversityGuideDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addGuide = (
  data: UniversityGuideAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateGuide = (
  id: string,
  data: UniversityGuideUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateGuideStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteGuide = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteGuide = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteGuide = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteGuide = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importGuide = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
