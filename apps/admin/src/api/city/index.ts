import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'
import type { ImageUploadVO } from '@/api/common/upload'
import type {
  CityListVO,
  CityDetailVO,
  CityQueryDTO,
  CityAddDTO,
  CityUpdateDTO,
  CityDetailUpdateDTO,
  StatusDTO,
} from '@/types/city'

const PREFIX = '/api/v1/admin/city'

/**
 * 上传城市封面图（city-cover-image bucket）
 * 后端限制：png/jpg/jpeg/webp/svg，单张 ≤ 2MB，返回完整可访问 URL
 */
export const uploadCityCover = (
  file: File,
): Promise<AxiosResponse<R<ImageUploadVO>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/upload-cover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}

export const getCityPage = (params: CityQueryDTO) => {
  return request.get<R<PageResult<CityListVO>>>(`${PREFIX}/list`, { params })
}

export const getCityDetail = (id: string) => {
  return request.get<R<CityDetailVO>>(`${PREFIX}/${id}`)
}

export const addCity = (data: CityAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateCity = (id: string, data: CityUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateCityDetail = (id: string, data: CityDetailUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/detail`, data)
}

export const updateCityStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteCity = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteCity = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, ids)
}

export const importCity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCityDetail = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
