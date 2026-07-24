import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ResourceListVO,
  ResourceDetailVO,
  ResourceQueryDTO,
  ResourceAddDTO,
  ResourceUpdateDTO,
} from '@/types/resource'

const PREFIX = '/api/v1/admin/resource'

export const getResourcePage = (params: ResourceQueryDTO) => {
  return request.get<R<PageResult<ResourceListVO>>>(`${PREFIX}/list`, { params })
}

export const getResourceDetail = (id: string) => {
  return request.get<R<ResourceDetailVO>>(`${PREFIX}/${id}`)
}

export const addResource = (data: ResourceAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateResource = (id: string, data: ResourceUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateResourceStatus = (id: string, data: { isDeleted: boolean }) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteResource = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteResource = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const importResource = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
