import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  HealthcareListVO,
  HealthcareDetailVO,
  HealthcareQueryDTO,
  HealthcareUpdateDTO,
  PositionStatusDTO,
} from '@/types/employment/healthcare'

const PREFIX = '/api/v1/admin/employment/industry-position/healthcare'

export const getHealthcarePage = (params: HealthcareQueryDTO) => {
  return request.get<R<PageResult<HealthcareListVO>>>(`${PREFIX}/list`, { params })
}

export const getHealthcareDetail = (id: string) => {
  return request.get<R<HealthcareDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateHealthcare = (id: string, data: HealthcareUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteHealthcare = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateHealthcareStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteHealthcare = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const importHealthcare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
