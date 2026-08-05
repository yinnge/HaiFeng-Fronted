import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  MilitaryListVO,
  MilitaryDetailVO,
  MilitaryQueryDTO,
  MilitaryAddDTO,
  MilitaryUpdateDTO,
  MilitaryStatusDTO,
} from '@/types/employment/military'

const PREFIX = '/api/v1/admin/employment/civil-service/military-position'

export const getMilitaryPage = (params: MilitaryQueryDTO) => {
  return request.get<R<PageResult<MilitaryListVO>>>(`${PREFIX}/list`, { params })
}

export const getMilitaryDetail = (id: string) => {
  return request.get<R<MilitaryDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addMilitary = (data: MilitaryAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateMilitary = (id: string, data: MilitaryUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteMilitary = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateMilitaryStatus = (id: string, data: MilitaryStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteMilitary = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateMilitary = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importMilitary = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
