import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { HealthcarePositionListVO, HealthcarePositionDetailVO, HealthcareQueryDTO } from '@/types/employment/healthcare'

export const getHealthcareList = (params: HealthcareQueryDTO) => {
  return request.get<R<PageResult<HealthcarePositionListVO>>>('/api/v1/app/employment/healthcare/list', { params })
}

export const getHealthcareDetail = (id: string) => {
  return request.get<R<HealthcarePositionDetailVO>>(`/api/v1/app/employment/healthcare/${id}/detail`)
}

export const getHealthcareFilters = () => {
  return request.get<R<Record<string, string[]>>>('/api/v1/app/employment/healthcare/filters')
}
