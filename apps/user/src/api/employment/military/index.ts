import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { MilitaryPositionListVO, MilitaryPositionDetailVO, MilitaryPositionSearchDTO } from '@/types/employment/military'

export const getMilitaryList = (params: MilitaryPositionSearchDTO) => {
  return request.get<R<PageResult<MilitaryPositionListVO>>>('/api/v1/app/employment/civil-service/military/list', { params })
}

export const getMilitaryDetail = (id: string) => {
  return request.get<R<MilitaryPositionDetailVO>>(`/api/v1/app/employment/civil-service/military/${id}/detail`)
}
