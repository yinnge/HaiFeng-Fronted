import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  WelfareListVO,
  WelfareDetailVO,
  WelfareQueryDTO,
  WelfareUpdateDTO,
  WelfareAddDTO,
  PositionStatusDTO,
} from '@/types/employment/welfare'

const PREFIX = '/api/v1/admin/employment/grassroots-position/welfare'

export const getWelfarePage = (params: WelfareQueryDTO) => {
  return request.get<R<PageResult<WelfareListVO>>>(`${PREFIX}/list`, { params })
}

export const getWelfareDetail = (id: string) => {
  return request.get<R<WelfareDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addWelfare = (data: WelfareAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateWelfare = (id: string, data: WelfareUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteWelfare = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateWelfareStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteWelfare = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateWelfare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importWelfare = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
