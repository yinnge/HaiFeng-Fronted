import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CivilListVO,
  CivilDetailVO,
  CivilQueryDTO,
  CivilAddDTO,
  CivilUpdateDTO,
  CivilStatusDTO,
} from '@/types/employment/civil'

const PREFIX = '/api/v1/admin/employment/civil-service/civil-position'

export const getCivilPage = (params: CivilQueryDTO) => {
  return request.get<R<PageResult<CivilListVO>>>(`${PREFIX}/list`, { params })
}

export const getCivilDetail = (id: string) => {
  return request.get<R<CivilDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addCivil = (data: CivilAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateCivil = (id: string, data: CivilUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteCivil = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateCivilStatus = (id: string, data: CivilStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteCivil = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateCivil = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCivil = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
