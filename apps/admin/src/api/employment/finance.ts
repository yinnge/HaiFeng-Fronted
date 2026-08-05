import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  FinanceListVO,
  FinanceDetailVO,
  FinanceQueryDTO,
  FinanceUpdateDTO,
  FinanceAddDTO,
  PositionStatusDTO,
} from '@/types/employment/finance'

const PREFIX = '/api/v1/admin/employment/industry-position/finance'

export const getFinancePage = (params: FinanceQueryDTO) => {
  return request.get<R<PageResult<FinanceListVO>>>(`${PREFIX}/list`, { params })
}

export const getFinanceDetail = (id: string) => {
  return request.get<R<FinanceDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addFinance = (data: FinanceAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateFinance = (id: string, data: FinanceUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteFinance = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateFinanceStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteFinance = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateFinance = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importFinance = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
