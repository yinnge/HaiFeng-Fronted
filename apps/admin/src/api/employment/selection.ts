import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  SelectionListVO,
  SelectionDetailVO,
  SelectionQueryDTO,
  SelectionAddDTO,
  SelectionUpdateDTO,
  SelectionStatusDTO,
} from '@/types/employment/selection'

const PREFIX = '/api/v1/admin/employment/civil-service/selection-position'

export const getSelectionPage = (params: SelectionQueryDTO) => {
  return request.get<R<PageResult<SelectionListVO>>>(`${PREFIX}/list`, { params })
}

export const getSelectionDetail = (id: string) => {
  return request.get<R<SelectionDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addSelection = (data: SelectionAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateSelection = (id: string, data: SelectionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteSelection = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateSelectionStatus = (id: string, data: SelectionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteSelection = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateSelection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importSelection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
