import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { CivilPositionListVO, CivilPositionDetailVO, CivilPositionSearchDTO } from '@/types/employment/civil'

export const getCivilList = (params: CivilPositionSearchDTO) => {
  return request.get<R<PageResult<CivilPositionListVO>>>('/api/v1/app/employment/civil-service/position/list', { params })
}

export const getCivilDetail = (id: string) => {
  return request.get<R<CivilPositionDetailVO>>(`/api/v1/app/employment/civil-service/position/${id}/detail`)
}
