import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  GrassrootsListVO,
  GrassrootsDetailVO,
  GrassrootsQueryDTO,
  GrassrootsUpdateDTO,
  GrassrootsAddDTO,
  PositionStatusDTO,
} from '@/types/employment/grassroots'

const PREFIX = '/api/v1/admin/employment/grassroots-position/project'

export const getGrassrootsPage = (params: GrassrootsQueryDTO) => {
  return request.get<R<PageResult<GrassrootsListVO>>>(`${PREFIX}/list`, { params })
}

export const getGrassrootsDetail = (id: string) => {
  return request.get<R<GrassrootsDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addGrassroots = (data: GrassrootsAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateGrassroots = (id: string, data: GrassrootsUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteGrassroots = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateGrassrootsStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteGrassroots = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateGrassroots = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importGrassroots = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
