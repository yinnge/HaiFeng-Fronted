import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  IndustryListVO,
  IndustryDetailVO,
  IndustryQueryDTO,
  IndustryAddDTO,
  IndustryUpdateDTO,
  IndustryDetailUpdateDTO,
} from '@/types/industry'

const PREFIX = '/api/v1/admin/industry'

export const getIndustryPage = (params: IndustryQueryDTO) => {
  return request.get<R<PageResult<IndustryListVO>>>(`${PREFIX}/list`, { params })
}

export const getIndustryDetail = (id: string) => {
  return request.get<R<IndustryDetailVO>>(`${PREFIX}/${id}`)
}

export const addIndustry = (data: IndustryAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateIndustry = (id: string, data: IndustryUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateIndustryDetail = (id: string, data: IndustryDetailUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/detail`, data)
}

export const updateIndustryStatus = (id: string, data: { isDeleted: boolean }) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteIndustry = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteIndustry = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, ids)
}

export const importIndustry = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importIndustryDetail = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
