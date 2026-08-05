import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { InstitutionPositionListVO, InstitutionPositionDetailVO, InstitutionPositionSearchDTO } from '@/types/employment/institution'

export const getInstitutionList = (params: InstitutionPositionSearchDTO) => {
  return request.get<R<PageResult<InstitutionPositionListVO>>>('/api/v1/app/employment/civil-service/institution/list', { params })
}

export const getInstitutionDetail = (id: string) => {
  return request.get<R<InstitutionPositionDetailVO>>(`/api/v1/app/employment/civil-service/institution/${id}/detail`)
}

export const getInstitutionFilters = () => {
  return request.get<R<Record<string, string[]>>>('/api/v1/app/employment/civil-service/institution/filters')
}
