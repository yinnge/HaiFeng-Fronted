import request from '@haifeng/shared/utils/request'
import type {
  CampusGalleryListVO,
  CampusGalleryDetailVO,
  CampusGalleryQueryDTO,
  CampusGalleryAddDTO,
  CampusGalleryUpdateDTO,
} from '@/types/university/gallery'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'
import type { ImageUploadVO } from '@/api/common/upload'

const PREFIX = '/api/v1/admin/university/gallery'

/**
 * 上传校园图册图片（universities-album bucket）
 * 后端限制：png/jpg/jpeg/webp/svg，单张 ≤ 2MB，返回完整可访问 URL
 */
export const uploadGalleryImage = (
  file: File,
): Promise<AxiosResponse<R<ImageUploadVO>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/upload-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

export const getGalleryPage = (
  params: CampusGalleryQueryDTO,
): Promise<AxiosResponse<PageResponse<CampusGalleryListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getGalleryDetail = (
  id: string,
): Promise<AxiosResponse<R<CampusGalleryDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addGallery = (
  data: CampusGalleryAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateGallery = (
  id: string,
  data: CampusGalleryUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateGalleryStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteGallery = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteGallery = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteGallery = (
  ids: string[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteGallery = (
  ids: string[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importGallery = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
