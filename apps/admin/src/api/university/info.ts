import request from '@haifeng/shared/utils/request'
import type {
  UniversityListVO,
  UniversityDetailVO,
  UniversityQueryDTO,
  UniversityAddDTO,
  UniversityUpdateDTO,
  UniversityDetailUpdateDTO,
} from '@/types/university/info'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'
import type { ImageUploadVO } from '@/api/common/upload'

const PREFIX = '/api/v1/admin/university'

/**
 * 上传院校 Logo（universities-logo bucket）
 * 后端限制：png/jpg/jpeg/webp/svg，单张 ≤ 2MB，返回完整可访问 URL
 */
export const uploadUniversityLogo = (
  file: File,
): Promise<AxiosResponse<R<ImageUploadVO>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/upload-logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

/**
 * 上传院校详情轮播图（univeristies-detail bucket）
 */
export const uploadUniversityCarousel = (
  file: File,
): Promise<AxiosResponse<R<ImageUploadVO>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/upload-carousel`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

export const getUniversityPage = (
  params: UniversityQueryDTO,
): Promise<AxiosResponse<PageResponse<UniversityListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getUniversityDetail = (
  id: string,
): Promise<AxiosResponse<R<UniversityDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addUniversity = (
  data: UniversityAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateUniversity = (
  id: string,
  data: UniversityUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateUniversityDetail = (
  id: string,
  data: UniversityDetailUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/detail`, data)

export const updateUniversityStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteUniversity = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteUniversity = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteUniversity = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteUniversity = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importUniversityMain = (
  file: File,
): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importUniversityDetail = (
  file: File,
): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
