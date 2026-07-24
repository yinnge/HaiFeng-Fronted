import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
} from '@/types/home/institution'
import type { StatusDTO } from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/institution'

export const getInstitutionPage = (params: InstitutionQueryDTO) => {
  return request.get<R<PageResult<InstitutionListVO>>>(`${PREFIX}/list`, { params })
}

export const getInstitutionDetail = (id: string) => {
  return request.get<R<InstitutionDetailVO>>(`${PREFIX}/${id}`)
}

export const addInstitution = (data: InstitutionAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateInstitution = (id: string, data: InstitutionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateInstitutionStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteInstitution = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
