import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
  InstitutionStatusDTO,
} from '@/types/employment/institution'

const PREFIX = '/api/v1/admin/employment/civil-service/institution-position'

export const getInstitutionPage = (params: InstitutionQueryDTO) => {
  return request.get<R<PageResult<InstitutionListVO>>>(`${PREFIX}/list`, { params })
}

export const getInstitutionDetail = (id: string) => {
  return request.get<R<InstitutionDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addInstitution = (data: InstitutionAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateInstitution = (id: string, data: InstitutionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteInstitution = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateInstitutionStatus = (id: string, data: InstitutionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteInstitution = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateInstitution = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importInstitution = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
